export interface Voice {
  name: string;
  gender: 'MALE' | 'FEMALE' | 'NEUTRAL';
  type: 'Neural' | 'Standard' | 'WaveNet';
  displayName: string;
  description?: string;
}

export const getVoiceAvatarClass = (voiceName: string): string => {
  const firstLetter = voiceName.charAt(voiceName.length - 1).toLowerCase();
  switch (firstLetter) {
    case 'a': return 'voice-avatar-a';
    case 'b': return 'voice-avatar-b';
    case 'c': return 'voice-avatar-c';
    case 'd': return 'voice-avatar-d';
    default: return 'voice-avatar-a';
  }
};

export const getVoiceDisplayName = (voiceName: string): string => {
  // Extract the last part of the voice name (e.g., "A" from "en-US-Neural2-A")
  const parts = voiceName.split('-');
  const lastPart = parts[parts.length - 1];
  
  // Convert to friendly names
  const nameMap: Record<string, string> = {
    'A': 'Alex',
    'B': 'Brian',
    'C': 'Clara', 
    'D': 'David',
    'E': 'Emma',
    'F': 'Fiona',
    'G': 'Grace',
    'H': 'Hannah',
    'I': 'Ian',
    'J': 'James',
  };
  
  return nameMap[lastPart] || lastPart;
};

export const getVoiceInitial = (voiceName: string): string => {
  const displayName = getVoiceDisplayName(voiceName);
  return displayName.charAt(0).toUpperCase();
};

export const formatVoiceType = (voice: Voice): string => {
  return `${voice.type} • ${voice.gender === 'MALE' ? 'Male' : voice.gender === 'FEMALE' ? 'Female' : 'Neutral'}`;
};

export const getVoicePreviewText = (languageCode: string): string => {
  const previewTexts: Record<string, string> = {
    'en': 'Hello, this is how I sound. I can help you convert your text to natural speech.',
    'es': 'Hola, así es como sueno. Puedo ayudarte a convertir tu texto en habla natural.',
    'fr': 'Bonjour, voici comment je sonne. Je peux vous aider à convertir votre texte en parole naturelle.',
    'de': 'Hallo, so klinge ich. Ich kann Ihnen helfen, Ihren Text in natürliche Sprache umzuwandeln.',
    'it': 'Ciao, ecco come suono. Posso aiutarti a convertire il tuo testo in discorso naturale.',
    'pt': 'Olá, é assim que eu soo. Posso ajudá-lo a converter seu texto em fala natural.',
    'ja': 'こんにちは、これが私の声です。テキストを自然な音声に変換するお手伝いができます。',
    'ko': '안녕하세요, 이것이 제 목소리입니다. 텍스트를 자연스러운 음성으로 변환하는 데 도움을 드릴 수 있습니다.',
    'zh': '你好，这就是我的声音。我可以帮助您将文本转换为自然语音。',
    'hi': 'नमस्ते, यह मेरी आवाज है। मैं आपके टेक्स्ट को प्राकृतिक भाषण में बदलने में मदद कर सकता हूं।',
    'ar': 'مرحبا، هذا هو صوتي. يمكنني مساعدتك في تحويل النص إلى كلام طبيعي.',
    'ru': 'Привет, вот как я звучу. Я могу помочь вам преобразовать текст в естественную речь.',
    'nl': 'Hallo, zo klink ik. Ik kan je helpen je tekst om te zetten naar natuurlijke spraak.',
    'sv': 'Hej, så här låter jag. Jag kan hjälpa dig att konvertera din text till naturligt tal.',
    'da': 'Hej, sådan lyder jeg. Jeg kan hjælpe dig med at konvertere din tekst til naturlig tale.',
    'no': 'Hei, slik høres jeg ut. Jeg kan hjelpe deg med å konvertere teksten din til naturlig tale.',
  };
  
  const langCode = languageCode.split('-')[0];
  return previewTexts[langCode] || previewTexts['en'];
};
