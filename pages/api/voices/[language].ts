import type { NextApiRequest, NextApiResponse } from 'next';

interface Voice {
  name: string;
  gender: 'MALE' | 'FEMALE' | 'NEUTRAL';
  type: 'Neural' | 'Standard' | 'WaveNet';
  displayName: string;
}

const voiceMap: Record<string, Voice[]> = {
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
    { name: 'es-ES-Neural2-A', gender: 'FEMALE', type: 'Neural', displayName: 'Alma' },
    { name: 'es-ES-Neural2-B', gender: 'MALE', type: 'Neural', displayName: 'Berto' },
    { name: 'es-ES-Neural2-C', gender: 'FEMALE', type: 'Neural', displayName: 'Carmen' },
    { name: 'es-ES-Neural2-D', gender: 'FEMALE', type: 'Neural', displayName: 'Dulce' },
    { name: 'es-ES-Neural2-E', gender: 'FEMALE', type: 'Neural', displayName: 'Elena' },
    { name: 'es-ES-Neural2-F', gender: 'MALE', type: 'Neural', displayName: 'Federico' },
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
    { name: 'de-DE-Neural2-B', gender: 'MALE', type: 'Neural', displayName: 'Bruno' },
    { name: 'de-DE-Neural2-C', gender: 'FEMALE', type: 'Neural', displayName: 'Clara' },
    { name: 'de-DE-Neural2-D', gender: 'MALE', type: 'Neural', displayName: 'David' },
    { name: 'de-DE-Neural2-E', gender: 'MALE', type: 'Neural', displayName: 'Erik' },
  ],
  'it-IT': [
    { name: 'it-IT-Neural2-A', gender: 'FEMALE', type: 'Neural', displayName: 'Aurora' },
    { name: 'it-IT-Neural2-B', gender: 'FEMALE', type: 'Neural', displayName: 'Bianca' },
    { name: 'it-IT-Neural2-C', gender: 'MALE', type: 'Neural', displayName: 'Carlo' },
    { name: 'it-IT-Neural2-D', gender: 'MALE', type: 'Neural', displayName: 'Diego' },
  ],
  'ja-JP': [
    { name: 'ja-JP-Neural2-A', gender: 'FEMALE', type: 'Neural', displayName: 'Akiko' },
    { name: 'ja-JP-Neural2-B', gender: 'FEMALE', type: 'Neural', displayName: 'Chika' },
    { name: 'ja-JP-Neural2-C', gender: 'MALE', type: 'Neural', displayName: 'Daichi' },
    { name: 'ja-JP-Neural2-D', gender: 'MALE', type: 'Neural', displayName: 'Genta' },
  ],
  'zh-CN': [
    { name: 'cmn-CN-Neural2-A', gender: 'FEMALE', type: 'Neural', displayName: 'Xiaoxiao' },
    { name: 'cmn-CN-Neural2-B', gender: 'MALE', type: 'Neural', displayName: 'Yunxi' },
    { name: 'cmn-CN-Neural2-C', gender: 'FEMALE', type: 'Neural', displayName: 'Xiaohan' },
    { name: 'cmn-CN-Neural2-D', gender: 'MALE', type: 'Neural', displayName: 'Yunyang' },
  ],
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { language } = req.query;
  
  if (typeof language !== 'string') {
    return res.status(400).json({ error: 'Invalid language parameter' });
  }

  const voices = voiceMap[language] || [];
  res.status(200).json(voices);
}