import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface TtsOptions {
  text: string;
  language: string;
  voice: string;
  speed: string;
  pitch: string;
}

export interface TtsResult {
  audioContent: Buffer;
  audioUrl: string;
  duration: number;
  fileSize: number;
}

export class TtsService {
  private apiKey: string;
  private outputDir: string;
  private readonly GEMINI_MODEL = 'gemini-2.5-flash-preview-tts';
  private readonly GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

  constructor() {
    // Initialize with API key from environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not found in environment variables');
    }

    this.apiKey = apiKey;
    this.outputDir = path.join(process.cwd(), 'dist', 'audio');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async generateSpeech(options: TtsOptions): Promise<TtsResult> {
    const { text, language, voice, speed, pitch } = options;

    // Split text into chunks if it's too large (Gemini has character limits)
    const chunks = this.splitTextIntoChunks(text, 5000);
    const audioBuffers: Buffer[] = [];

    for (const chunk of chunks) {
      const audioBuffer = await this.callGeminiTtsApi(chunk, voice, speed, pitch);
      audioBuffers.push(audioBuffer);
    }

    // Combine audio buffers
    const combinedAudio = Buffer.concat(audioBuffers);
    
    // Convert PCM to WAV format
    const wavAudio = this.convertPcmToWav(combinedAudio);
    
    // Save to file
    const fileName = `${uuidv4()}.wav`;
    const filePath = path.join(this.outputDir, fileName);
    fs.writeFileSync(filePath, wavAudio);

    // Calculate approximate duration (rough estimate: 150 words per minute)
    const wordCount = text.split(' ').length;
    const duration = Math.ceil((wordCount / 150) * 60);

    return {
      audioContent: wavAudio,
      audioUrl: `/api/audio/${fileName}`,
      duration,
      fileSize: wavAudio.length,
    };
  }

  private async callGeminiTtsApi(text: string, voice: string, speed: string, pitch: string): Promise<Buffer> {
    const url = `${this.GEMINI_API_URL}/${this.GEMINI_MODEL}:generateContent?key=${this.apiKey}`;
    
    // Create prompt with speed and pitch instructions
    const speedInstruction = this.getSpeedInstruction(parseFloat(speed));
    const pitchInstruction = this.getPitchInstruction(parseFloat(pitch));
    const prompt = `${speedInstruction}${pitchInstruction}Say: ${text}`;

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: this.mapVoiceToGemini(voice)
            }
          }
        }
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini TTS API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
      throw new Error('No audio content received from Gemini TTS API');
    }

    // Convert base64 to buffer (Gemini returns PCM audio data)
    return Buffer.from(data.candidates[0].content.parts[0].inlineData.data, 'base64');
  }

  private getSpeedInstruction(speed: number): string {
    if (speed < 0.7) return 'Speak very slowly. ';
    if (speed < 0.9) return 'Speak slowly. ';
    if (speed > 1.5) return 'Speak very quickly. ';
    if (speed > 1.2) return 'Speak quickly. ';
    return '';
  }

  private getPitchInstruction(pitch: number): string {
    if (pitch < -10) return 'Use a very low pitch. ';
    if (pitch < -5) return 'Use a low pitch. ';
    if (pitch > 10) return 'Use a very high pitch. ';
    if (pitch > 5) return 'Use a high pitch. ';
    return '';
  }

  private mapVoiceToGemini(voice: string): string {
    // Map our voice names to Gemini's available voices
    const voiceMap: Record<string, string> = {
      'en-US-Neural2-A': 'Kore',
      'en-US-Neural2-C': 'Charon',
      'en-US-Neural2-D': 'Kore',
      'en-US-Neural2-E': 'Charon',
      'en-US-Neural2-F': 'Puck',
      'en-US-Neural2-G': 'Charon',
      'en-US-Neural2-H': 'Puck',
      'en-US-Neural2-I': 'Kore',
      'en-US-Neural2-J': 'Kore',
      'es-ES-Neural2-A': 'Charon',
      'es-ES-Neural2-B': 'Kore',
      'es-ES-Neural2-C': 'Puck',
      'es-ES-Neural2-D': 'Charon',
      'es-ES-Neural2-E': 'Puck',
      'es-ES-Neural2-F': 'Kore',
      'fr-FR-Neural2-A': 'Charon',
      'fr-FR-Neural2-B': 'Kore',
      'fr-FR-Neural2-C': 'Puck',
      'fr-FR-Neural2-D': 'Kore',
      'fr-FR-Neural2-E': 'Charon',
      'de-DE-Neural2-A': 'Charon',
      'de-DE-Neural2-B': 'Kore',
      'de-DE-Neural2-C': 'Puck',
      'de-DE-Neural2-D': 'Kore',
      'de-DE-Neural2-F': 'Charon',
    };

    return voiceMap[voice] || 'Kore'; // Default to Kore if voice not found
  }

  async previewVoice(language: string, voice: string): Promise<Buffer> {
    const sampleTexts: Record<string, string> = {
      'en': 'Hello, this is how I sound. I can help you convert your text to natural speech.',
      'es': 'Hola, así es como sueno. Puedo ayudarte a convertir tu texto en habla natural.',
      'fr': 'Bonjour, voici comment je sonne. Je peux vous aider à convertir votre texte en parole naturelle.',
      'de': 'Hallo, so klinge ich. Ich kann Ihnen helfen, Ihren Text in natürliche Sprache umzuwandeln.',
      'it': 'Ciao, ecco come suono. Posso aiutarti a convertire il tuo testo in discorso naturale.',
      'pt': 'Olá, é assim que eu soo. Posso ajudá-lo a converter seu texto em fala natural.',
      'ja': 'こんにちは、これが私の声です。テキストを自然な音声に変換するお手伝いができます。',
      'ko': '안녕하세요, 이것이 제 목소리입니다. 텍스트를 자연스러운 음성으로 변환하는 데 도움을 드릴 수 있습니다.',
    };

    const languageCode = language.split('-')[0];
    const sampleText = sampleTexts[languageCode] || sampleTexts['en'];

    const pcmBuffer = await this.callGeminiTtsApi(sampleText, voice, '1.0', '0');
    return this.convertPcmToWav(pcmBuffer);
  }

  private convertPcmToWav(pcmBuffer: Buffer): Buffer {
    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;
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
    header.writeUInt32LE(16, offset); offset += 4; // chunk size
    header.writeUInt16LE(1, offset); offset += 2; // PCM format
    header.writeUInt16LE(numChannels, offset); offset += 2;
    header.writeUInt32LE(sampleRate, offset); offset += 4;
    header.writeUInt32LE(byteRate, offset); offset += 4;
    header.writeUInt16LE(blockAlign, offset); offset += 2;
    header.writeUInt16LE(bitsPerSample, offset); offset += 2;

    // data chunk
    header.write('data', offset); offset += 4;
    header.writeUInt32LE(dataSize, offset);

    return Buffer.concat([header, pcmBuffer]);
  }

  private splitTextIntoChunks(text: string, maxChunkSize: number): string[] {
    if (text.length <= maxChunkSize) {
      return [text];
    }

    const chunks: string[] = [];
    let currentChunk = '';

    // Split by sentences first, then by chunks if needed
    const sentences = text.split(/[.!?]+/);

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length + 1 <= maxChunkSize) {
        currentChunk += (currentChunk ? '. ' : '') + sentence.trim();
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
        }
        
        // If single sentence is too long, split by words
        if (sentence.length > maxChunkSize) {
          const words = sentence.split(' ');
          let wordChunk = '';
          
          for (const word of words) {
            if (wordChunk.length + word.length + 1 <= maxChunkSize) {
              wordChunk += (wordChunk ? ' ' : '') + word;
            } else {
              if (wordChunk) {
                chunks.push(wordChunk);
              }
              wordChunk = word;
            }
          }
          
          if (wordChunk) {
            currentChunk = wordChunk;
          } else {
            currentChunk = '';
          }
        } else {
          currentChunk = sentence.trim();
        }
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks.filter(chunk => chunk.trim().length > 0);
  }
}
