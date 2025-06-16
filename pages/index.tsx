import React, { useState } from 'react';
import Head from 'next/head';
import { GetStaticProps } from 'next';
import { useMutation } from '@tanstack/react-query';
import { TextInput } from '../client/src/components/text-input';
import { LanguageSelector } from '../client/src/components/language-selector';
import { VoiceSelector } from '../client/src/components/voice-selector';
import { AudioPlayer } from '../client/src/components/audio-player';
import { useToast } from '../client/src/hooks/use-toast';

interface TtsRequestInput {
  text: string;
  language: string;
  voice: string;
  speed: string;
  pitch: string;
}

interface TtsResponse {
  id: number;
  audioUrl: string;
  duration: number;
  fileSize: number;
}

interface HomeProps {
  locale: string;
  translations: {
    title: string;
    description: string;
    heading: string;
    placeholder: string;
    generate: string;
    generating: string;
    error: string;
  };
}

const translations = {
  en: {
    title: 'Advanced Text-to-Speech Generator',
    description: 'Convert text to natural speech with AI-powered voices in multiple languages. Generate high-quality audio with customizable speed and pitch.',
    heading: 'Text-to-Speech Generator',
    placeholder: 'Enter your text here (up to 50,000 characters)...',
    generate: 'Generate Speech',
    generating: 'Generating...',
    error: 'Failed to generate speech. Please try again.',
  },
  es: {
    title: 'Generador Avanzado de Texto a Voz',
    description: 'Convierte texto a voz natural con voces potenciadas por IA en múltiples idiomas. Genera audio de alta calidad con velocidad y tono personalizables.',
    heading: 'Generador de Texto a Voz',
    placeholder: 'Ingresa tu texto aquí (hasta 50,000 caracteres)...',
    generate: 'Generar Voz',
    generating: 'Generando...',
    error: 'Error al generar voz. Por favor intenta de nuevo.',
  },
  fr: {
    title: 'Générateur Avancé de Synthèse Vocale',
    description: 'Convertissez le texte en parole naturelle avec des voix alimentées par IA dans plusieurs langues. Générez un audio de haute qualité avec vitesse et tonalité personnalisables.',
    heading: 'Générateur de Synthèse Vocale',
    placeholder: 'Entrez votre texte ici (jusqu\'à 50 000 caractères)...',
    generate: 'Générer la Parole',
    generating: 'Génération...',
    error: 'Échec de la génération de la parole. Veuillez réessayer.',
  },
};

export default function Home({ locale, translations: t }: HomeProps) {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('en-US');
  const [voice, setVoice] = useState('en-US-Neural2-A');
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(0.0);
  const [audioResult, setAudioResult] = useState<TtsResponse | null>(null);

  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (request: TtsRequestInput) => {
      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      return response.json();
    },
    onSuccess: (data: TtsResponse) => {
      setAudioResult(data);
      toast({
        title: 'Success',
        description: 'Speech generated successfully!',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: t.error,
        variant: 'destructive',
      });
    },
  });

  const handleGenerate = () => {
    if (!text.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some text first.',
        variant: 'destructive',
      });
      return;
    }

    mutation.mutate({
      text: text.trim(),
      language,
      voice,
      speed: speed.toString(),
      pitch: pitch.toString(),
    });
  };

  const handleDownload = () => {
    if (audioResult) {
      const link = document.createElement('a');
      link.href = audioResult.audioUrl;
      link.download = `speech-${Date.now()}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleLanguageDetected = (detectedLanguage: string) => {
    setLanguage(detectedLanguage);
  };

  return (
    <>
      <Head>
        <title>{t.title}</title>
        <meta name="description" content={t.description} />
        <meta name="keywords" content="text to speech, TTS, AI voices, speech synthesis, multilingual, audio generation" />
        <meta property="og:title" content={t.title} />
        <meta property="og:description" content={t.description} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t.title} />
        <meta name="twitter:description" content={t.description} />
        <link rel="canonical" href={`https://tts-app.vercel.app${locale !== 'en' ? `/${locale}` : ''}`} />
        <link rel="alternate" hrefLang="en" href="https://tts-app.vercel.app" />
        <link rel="alternate" hrefLang="es" href="https://es.tts-app.vercel.app" />
        <link rel="alternate" hrefLang="fr" href="https://fr.tts-app.vercel.app" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": t.title,
              "description": t.description,
              "url": "https://tts-app.vercel.app",
              "applicationCategory": "MultimediaApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <header className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {t.heading}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {t.description}
              </p>
            </header>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Text to Convert
                </label>
                <TextInput
                  value={text}
                  onChange={setText}
                  onLanguageDetected={handleLanguageDetected}
                  maxLength={50000}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Language
                  </label>
                  <LanguageSelector
                    selectedLanguage={language}
                    onLanguageChange={setLanguage}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Voice & Settings
                  </label>
                  <VoiceSelector
                    selectedLanguage={language}
                    selectedVoice={voice}
                    onVoiceChange={setVoice}
                    speed={speed}
                    pitch={pitch}
                    onSpeedChange={setSpeed}
                    onPitchChange={setPitch}
                    onLanguageChange={setLanguage}
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleGenerate}
                  disabled={mutation.isPending || !text.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
                >
                  {mutation.isPending ? t.generating : t.generate}
                </button>
              </div>

              {audioResult && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Generated Audio
                  </label>
                  <AudioPlayer
                    audioUrl={audioResult.audioUrl}
                    duration={audioResult.duration}
                    fileSize={audioResult.fileSize}
                    onDownload={handleDownload}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale = 'en' }) => {
  return {
    props: {
      locale,
      translations: translations[locale as keyof typeof translations] || translations.en,
    },
  };
};