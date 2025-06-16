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
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('Google API key not found in environment variables');
    }

    this.apiKey = apiKey;
    this.outputDir = path.join(process.cwd(), 'dist', 'audio');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async generateSpeech(options: TtsOptions): Promise<TtsResult> {
    const { text, language, voice, speed, pitch } = options;

    // Split text into chunks if it's too large
    const chunks = this.splitTextIntoChunks(text, 5000);
    const audioBuffers: Buffer[] = [];

    for (const chunk of chunks) {
      const audioBuffer = await this.callGoogleTtsApi(chunk, language, voice, speed, pitch);
      audioBuffers.push(audioBuffer);
    }

    // Combine audio buffers
    const combinedAudio = Buffer.concat(audioBuffers);
    
    // Save to file
    const fileName = `${uuidv4()}.mp3`;
    const filePath = path.join(this.outputDir, fileName);
    fs.writeFileSync(filePath, combinedAudio);

    // Calculate approximate duration (rough estimate: 150 words per minute)
    const wordCount = text.split(' ').length;
    const duration = Math.ceil((wordCount / 150) * 60);

    return {
      audioContent: combinedAudio,
      audioUrl: `/api/audio/${fileName}`,
      duration,
      fileSize: combinedAudio.length,
    };
  }

  private async callGoogleTtsApi(text: string, language: string, voice: string, speed: string, pitch: string): Promise<Buffer> {
    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.apiKey}`;
    
    const requestBody = {
      input: { text },
      voice: {
        languageCode: language,
        name: voice,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: parseFloat(speed),
        pitch: parseFloat(pitch),
      },
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
      throw new Error(`TTS API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.audioContent) {
      throw new Error('No audio content received from TTS API');
    }

    // Convert base64 to buffer
    return Buffer.from(data.audioContent, 'base64');
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

    return this.callGoogleTtsApi(sampleText, language, voice, '1.0', '0');
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
