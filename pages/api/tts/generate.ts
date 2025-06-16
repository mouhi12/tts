import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface TtsRequest {
  id: number;
  text: string;
  language: string;
  voice: string;
  speed: string;
  pitch: string;
  audioUrl?: string;
  duration?: number;
  fileSize?: number;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage for TTS requests
let ttsRequests: TtsRequest[] = [];
let nextId = 1;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, language, voice, speed = '1.0', pitch = '0.0' } = req.body;

    if (!text || !language || !voice) {
      return res.status(400).json({ error: 'Text, language, and voice are required' });
    }

    if (text.length > 50000) {
      return res.status(400).json({ error: 'Text must be less than 50,000 characters' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    // Create TTS request record
    const ttsRequest: TtsRequest = {
      id: nextId++,
      text,
      language,
      voice,
      speed,
      pitch,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    ttsRequests.push(ttsRequest);

    // Generate speech using Gemini API
    const chunks = splitTextIntoChunks(text, 5000);
    const audioBuffers: Buffer[] = [];

    for (const chunk of chunks) {
      const audioBuffer = await callGeminiTtsApi(chunk, voice, speed, pitch, apiKey);
      audioBuffers.push(audioBuffer);
    }

    // Combine audio chunks
    const combinedAudio = Buffer.concat(audioBuffers);
    const wavBuffer = convertPcmToWav(combinedAudio);

    // Save audio file
    const audioDir = path.join(process.cwd(), 'public', 'audio');
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    const filename = `${uuidv4()}.wav`;
    const filepath = path.join(audioDir, filename);
    fs.writeFileSync(filepath, wavBuffer);

    // Calculate duration (rough estimate: 24kHz sample rate, 16-bit, mono)
    const duration = Math.round(wavBuffer.length / (24000 * 2));
    const fileSize = wavBuffer.length;
    const audioUrl = `/audio/${filename}`;

    // Update TTS request
    ttsRequest.audioUrl = audioUrl;
    ttsRequest.duration = duration;
    ttsRequest.fileSize = fileSize;
    ttsRequest.updatedAt = new Date();

    res.status(200).json({
      id: ttsRequest.id,
      audioUrl,
      duration,
      fileSize,
    });
  } catch (error) {
    console.error('Error generating speech:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
}

async function callGeminiTtsApi(
  text: string,
  voice: string,
  speed: string,
  pitch: string,
  apiKey: string
): Promise<Buffer> {
  const geminiVoice = mapVoiceToGemini(voice);
  const speedInstruction = getSpeedInstruction(parseFloat(speed));
  const pitchInstruction = getPitchInstruction(parseFloat(pitch));

  const prompt = `Generate speech for: "${text}" using ${geminiVoice} voice. ${speedInstruction} ${pitchInstruction}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          response_mime_type: 'audio/wav',
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Gemini TTS API error: ${response.status} - ${errorData}`);
  }

  const audioBuffer = await response.arrayBuffer();
  return Buffer.from(audioBuffer);
}

function getSpeedInstruction(speed: number): string {
  if (speed < 0.8) return 'Speak very slowly.';
  if (speed < 0.9) return 'Speak slowly.';
  if (speed > 1.2) return 'Speak very quickly.';
  if (speed > 1.1) return 'Speak quickly.';
  return 'Speak at normal speed.';
}

function getPitchInstruction(pitch: number): string {
  if (pitch < -0.5) return 'Use a lower pitch.';
  if (pitch > 0.5) return 'Use a higher pitch.';
  return 'Use normal pitch.';
}

function mapVoiceToGemini(voice: string): string {
  const voiceMapping: Record<string, string> = {
    'en-US-Neural2-A': 'male American English',
    'en-US-Neural2-C': 'female American English',
    'en-US-Neural2-D': 'male American English',
    'en-US-Neural2-E': 'female American English',
    'en-US-Neural2-F': 'female American English',
    'en-US-Neural2-G': 'female American English',
    'en-US-Neural2-H': 'female American English',
    'en-US-Neural2-I': 'male American English',
    'en-US-Neural2-J': 'male American English',
    'es-ES-Neural2-A': 'female Spanish',
    'es-ES-Neural2-B': 'male Spanish',
    'fr-FR-Neural2-A': 'female French',
    'fr-FR-Neural2-B': 'male French',
    'de-DE-Neural2-A': 'female German',
    'de-DE-Neural2-B': 'male German',
    'it-IT-Neural2-A': 'female Italian',
    'it-IT-Neural2-C': 'male Italian',
    'ja-JP-Neural2-A': 'female Japanese',
    'ja-JP-Neural2-C': 'male Japanese',
    'cmn-CN-Neural2-A': 'female Chinese',
    'cmn-CN-Neural2-B': 'male Chinese',
  };

  return voiceMapping[voice] || 'neutral English';
}

function convertPcmToWav(pcmBuffer: Buffer): Buffer {
  const sampleRate = 24000;
  const bitDepth = 16;
  const channels = 1;
  const blockAlign = channels * (bitDepth / 8);
  const byteRate = sampleRate * blockAlign;
  const dataSize = pcmBuffer.length;
  const fileSize = 36 + dataSize;

  const header = Buffer.alloc(44);
  let offset = 0;

  // RIFF header
  header.write('RIFF', offset); offset += 4;
  header.writeUInt32LE(fileSize, offset); offset += 4;
  header.write('WAVE', offset); offset += 4;

  // fmt chunk
  header.write('fmt ', offset); offset += 4;
  header.writeUInt32LE(16, offset); offset += 4;
  header.writeUInt16LE(1, offset); offset += 2;
  header.writeUInt16LE(channels, offset); offset += 2;
  header.writeUInt32LE(sampleRate, offset); offset += 4;
  header.writeUInt32LE(byteRate, offset); offset += 4;
  header.writeUInt16LE(blockAlign, offset); offset += 2;
  header.writeUInt16LE(bitDepth, offset); offset += 2;

  // data chunk
  header.write('data', offset); offset += 4;
  header.writeUInt32LE(dataSize, offset);

  return Buffer.concat([header, pcmBuffer]);
}

function splitTextIntoChunks(text: string, maxChunkSize: number): string[] {
  if (text.length <= maxChunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+/);
  let currentChunk = '';

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;

    const sentenceWithPunctuation = trimmedSentence + '.';
    
    if (currentChunk.length + sentenceWithPunctuation.length > maxChunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      
      if (sentenceWithPunctuation.length > maxChunkSize) {
        const words = sentenceWithPunctuation.split(' ');
        let wordChunk = '';
        
        for (const word of words) {
          if (wordChunk.length + word.length + 1 > maxChunkSize) {
            if (wordChunk) {
              chunks.push(wordChunk.trim());
              wordChunk = '';
            }
          }
          wordChunk += (wordChunk ? ' ' : '') + word;
        }
        
        if (wordChunk) {
          currentChunk = wordChunk;
        }
      } else {
        currentChunk = sentenceWithPunctuation;
      }
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentenceWithPunctuation;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter(chunk => chunk.length > 0);
}