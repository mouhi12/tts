import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { language, voice } = req.body;

    if (!language || !voice) {
      return res.status(400).json({ error: 'Language and voice are required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    // Generate a short preview text based on language
    const previewTexts: Record<string, string> = {
      'en-US': 'Hello, this is a voice preview.',
      'es-ES': 'Hola, esta es una vista previa de voz.',
      'fr-FR': 'Bonjour, ceci est un aperçu vocal.',
      'de-DE': 'Hallo, das ist eine Stimmvorschau.',
      'it-IT': 'Ciao, questa è un\'anteprima vocale.',
      'ja-JP': 'こんにちは、これは音声プレビューです。',
      'zh-CN': '你好，这是语音预览。',
    };

    const previewText = previewTexts[language] || 'Hello, this is a voice preview.';

    // Map voice to Gemini-compatible voice name
    const geminiVoice = mapVoiceToGemini(voice);

    // Call Gemini TTS API
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
                  text: `Generate speech for: "${previewText}" using ${geminiVoice} voice at normal speed and pitch.`,
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
      console.error('Gemini TTS API error:', response.status, errorData);
      throw new Error(`Gemini TTS API error: ${response.status} - ${errorData}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const wavBuffer = convertPcmToWav(Buffer.from(audioBuffer));

    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Length', wavBuffer.length);
    res.status(200).send(wavBuffer);
  } catch (error) {
    console.error('Error generating voice preview:', error);
    res.status(500).json({ error: 'Failed to generate voice preview' });
  }
}

function mapVoiceToGemini(voice: string): string {
  // Map Google TTS voice names to Gemini voice characteristics
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
  header.writeUInt32LE(16, offset); offset += 4; // chunk size
  header.writeUInt16LE(1, offset); offset += 2; // audio format (PCM)
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