export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  region?: string;
}

export const languages: Language[] = [
  { code: 'en-US', name: 'English', nativeName: 'English', flag: '🇺🇸', region: 'United States' },
  { code: 'en-GB', name: 'English', nativeName: 'English', flag: '🇬🇧', region: 'United Kingdom' },
  { code: 'es-ES', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', region: 'Spain' },
  { code: 'es-MX', name: 'Spanish', nativeName: 'Español', flag: '🇲🇽', region: 'Mexico' },
  { code: 'fr-FR', name: 'French', nativeName: 'Français', flag: '🇫🇷', region: 'France' },
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', region: 'Germany' },
  { code: 'it-IT', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', region: 'Italy' },
  { code: 'pt-BR', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', region: 'Brazil' },
  { code: 'pt-PT', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', region: 'Portugal' },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', region: 'Japan' },
  { code: 'ko-KR', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', region: 'South Korea' },
  { code: 'zh-CN', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', region: 'China' },
  { code: 'zh-TW', name: 'Chinese', nativeName: '中文', flag: '🇹🇼', region: 'Taiwan' },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', region: 'India' },
  { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', region: 'Saudi Arabia' },
  { code: 'ru-RU', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', region: 'Russia' },
  { code: 'nl-NL', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', region: 'Netherlands' },
  { code: 'sv-SE', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', region: 'Sweden' },
  { code: 'da-DK', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰', region: 'Denmark' },
  { code: 'no-NO', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴', region: 'Norway' },
];

export const getLanguageByCode = (code: string): Language | undefined => {
  return languages.find(lang => lang.code === code);
};

export const getLanguageDisplayName = (code: string): string => {
  const lang = getLanguageByCode(code);
  if (!lang) return code;
  return lang.region ? `${lang.name} (${lang.region})` : lang.name;
};

export const detectLanguageFromText = (text: string): string => {
  // Simple language detection based on character patterns
  // In production, you'd use a proper language detection library
  
  // Check for common patterns
  if (/[一-龯]/.test(text)) {
    return 'zh-CN'; // Chinese characters
  }
  if (/[ひらがなカタカナ]/.test(text)) {
    return 'ja-JP'; // Japanese hiragana/katakana
  }
  if (/[한글]/.test(text)) {
    return 'ko-KR'; // Korean hangul
  }
  if (/[а-яё]/i.test(text)) {
    return 'ru-RU'; // Cyrillic
  }
  if (/[άέήίόύώαβγδεζηθικλμνξοπρστυφχψω]/i.test(text)) {
    return 'el-GR'; // Greek
  }
  if (/[أ-ي]/i.test(text)) {
    return 'ar-SA'; // Arabic
  }
  if (/[देवनागरी]/i.test(text)) {
    return 'hi-IN'; // Hindi/Devanagari
  }
  
  // Default to English if no specific patterns detected
  return 'en-US';
};
