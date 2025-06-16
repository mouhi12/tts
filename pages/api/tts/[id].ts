import type { NextApiRequest, NextApiResponse } from 'next';

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

// This would typically be shared with the generate endpoint
// For now, we'll use a simple approach since it's in-memory storage
let ttsRequests: TtsRequest[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const requestId = parseInt(id as string);

  if (isNaN(requestId)) {
    return res.status(400).json({ error: 'Invalid request ID' });
  }

  const ttsRequest = ttsRequests.find(req => req.id === requestId);

  if (!ttsRequest) {
    return res.status(404).json({ error: 'TTS request not found' });
  }

  res.status(200).json(ttsRequest);
}