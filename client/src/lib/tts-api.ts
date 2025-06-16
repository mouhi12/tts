import { apiRequest } from './queryClient';
import type { TtsRequestInput } from '@shared/schema';

export interface TtsResponse {
  id: number;
  audioUrl: string;
  duration: number;
  fileSize: number;
}

export interface Voice {
  name: string;
  gender: 'MALE' | 'FEMALE' | 'NEUTRAL';
  type: 'Neural' | 'Standard' | 'WaveNet';
}

export async function generateSpeech(request: TtsRequestInput): Promise<TtsResponse> {
  const response = await apiRequest('POST', '/api/tts/generate', request);
  return response.json();
}

export async function getVoicesForLanguage(language: string): Promise<Voice[]> {
  const response = await apiRequest('GET', `/api/voices/${language}`);
  return response.json();
}

export async function previewVoice(language: string, voice: string): Promise<Blob> {
  const response = await apiRequest('POST', '/api/voices/preview', {
    language,
    voice,
  });
  return response.blob();
}

export async function getTtsRequest(id: number) {
  const response = await apiRequest('GET', `/api/tts/${id}`);
  return response.json();
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function chunkText(text: string, maxChunkSize: number = 5000): string[] {
  if (text.length <= maxChunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  let currentChunk = '';

  // Split by sentences first
  const sentences = text.split(/[.!?]+/);

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;

    if (currentChunk.length + trimmedSentence.length + 2 <= maxChunkSize) {
      currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      
      // If single sentence is too long, split by words
      if (trimmedSentence.length > maxChunkSize) {
        const words = trimmedSentence.split(' ');
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
        currentChunk = trimmedSentence;
      }
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks.filter(chunk => chunk.trim().length > 0);
}
