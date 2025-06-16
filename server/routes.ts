import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
import { storage } from "./storage";
import { TtsService } from "./services/tts-service";
import { ttsRequestSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const ttsService = new TtsService();

  // Serve static audio files
  app.use('/api/audio', express.static(path.join(process.cwd(), 'dist', 'audio')));

  // Get available voices for a language
  app.get('/api/voices/:language', async (req, res) => {
    try {
      const { language } = req.params;
      
      // This would typically call Google TTS API to get available voices
      // For now, return a static list based on language
      const voices = getVoicesForLanguage(language);
      res.json(voices);
    } catch (error) {
      console.error('Error fetching voices:', error);
      res.status(500).json({ error: 'Failed to fetch voices' });
    }
  });

  // Preview a voice
  app.post('/api/voices/preview', async (req, res) => {
    try {
      const { language, voice } = req.body;
      
      if (!language || !voice) {
        return res.status(400).json({ error: 'Language and voice are required' });
      }

      const audioBuffer = await ttsService.previewVoice(language, voice);
      
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
      });
      
      res.send(audioBuffer);
    } catch (error) {
      console.error('Error generating voice preview:', error);
      res.status(500).json({ error: 'Failed to generate voice preview' });
    }
  });

  // Generate speech from text
  app.post('/api/tts/generate', async (req, res) => {
    try {
      // Validate request body
      const validatedData = ttsRequestSchema.parse(req.body);
      
      // Create TTS request record
      const ttsRequest = await storage.createTtsRequest({
        text: validatedData.text,
        language: validatedData.language,
        voice: validatedData.voice,
        speed: validatedData.speed,
        pitch: validatedData.pitch,
      });

      // Generate speech
      const result = await ttsService.generateSpeech(validatedData);
      
      // Update request with result
      const updatedRequest = await storage.updateTtsRequest(ttsRequest.id, {
        audioUrl: result.audioUrl,
        duration: result.duration,
        fileSize: result.fileSize,
      });

      res.json({
        id: ttsRequest.id,
        audioUrl: result.audioUrl,
        duration: result.duration,
        fileSize: result.fileSize,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Validation error', 
          details: error.errors 
        });
      }
      
      console.error('Error generating speech:', error);
      res.status(500).json({ error: 'Failed to generate speech' });
    }
  });

  // Get TTS request status
  app.get('/api/tts/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ttsRequest = await storage.getTtsRequest(id);
      
      if (!ttsRequest) {
        return res.status(404).json({ error: 'TTS request not found' });
      }
      
      res.json(ttsRequest);
    } catch (error) {
      console.error('Error fetching TTS request:', error);
      res.status(500).json({ error: 'Failed to fetch TTS request' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function getVoicesForLanguage(language: string) {
  const voiceMap: Record<string, any[]> = {
    'en-US': [
      { name: 'en-US-Neural2-A', gender: 'MALE', type: 'Neural', displayName: 'Alex' },
      { name: 'en-US-Neural2-C', gender: 'FEMALE', type: 'Neural', displayName: 'Clara' },
      { name: 'en-US-Neural2-D', gender: 'MALE', type: 'Neural', displayName: 'David' },
      { name: 'en-US-Neural2-E', gender: 'FEMALE', type: 'Neural', displayName: 'Emma' },
      { name: 'en-US-Neural2-F', gender: 'FEMALE', type: 'Neural', displayName: 'Fiona' },
      { name: 'en-US-Neural2-G', gender: 'FEMALE', type: 'Neural', displayName: 'Grace' },
      { name: 'en-US-Neural2-H', gender: 'FEMALE', type: 'Neural', displayName: 'Hannah' },
      { name: 'en-US-Neural2-I', gender: 'MALE', type: 'Neural', displayName: 'Ian' },
      { name: 'en-US-Neural2-J', gender: 'MALE', type: 'Neural', displayName: 'James' },
    ],
    'es-ES': [
      { name: 'es-ES-Neural2-A', gender: 'FEMALE', type: 'Neural', displayName: 'Ana' },
      { name: 'es-ES-Neural2-B', gender: 'MALE', type: 'Neural', displayName: 'Bruno' },
      { name: 'es-ES-Neural2-C', gender: 'FEMALE', type: 'Neural', displayName: 'Carmen' },
      { name: 'es-ES-Neural2-D', gender: 'FEMALE', type: 'Neural', displayName: 'Diana' },
      { name: 'es-ES-Neural2-E', gender: 'FEMALE', type: 'Neural', displayName: 'Elena' },
      { name: 'es-ES-Neural2-F', gender: 'MALE', type: 'Neural', displayName: 'Fernando' },
    ],
    'fr-FR': [
      { name: 'fr-FR-Neural2-A', gender: 'FEMALE', type: 'Neural', displayName: 'Amélie' },
      { name: 'fr-FR-Neural2-B', gender: 'MALE', type: 'Neural', displayName: 'Bernard' },
      { name: 'fr-FR-Neural2-C', gender: 'FEMALE', type: 'Neural', displayName: 'Céline' },
      { name: 'fr-FR-Neural2-D', gender: 'MALE', type: 'Neural', displayName: 'Denis' },
      { name: 'fr-FR-Neural2-E', gender: 'FEMALE', type: 'Neural', displayName: 'Élise' },
    ],
    'de-DE': [
      { name: 'de-DE-Neural2-A', gender: 'FEMALE', type: 'Neural', displayName: 'Anna' },
      { name: 'de-DE-Neural2-B', gender: 'MALE', type: 'Neural', displayName: 'Bernd' },
      { name: 'de-DE-Neural2-C', gender: 'FEMALE', type: 'Neural', displayName: 'Claudia' },
      { name: 'de-DE-Neural2-D', gender: 'MALE', type: 'Neural', displayName: 'Dieter' },
      { name: 'de-DE-Neural2-F', gender: 'FEMALE', type: 'Neural', displayName: 'Frieda' },
    ],
  };

  return voiceMap[language] || voiceMap['en-US'];
}
