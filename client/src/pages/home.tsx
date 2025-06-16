import { useState } from 'react';
import { Volume, Globe, Bot, Download, Brain, Zap, Sliders, Smartphone } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SeoHead } from '@/components/seo-head';
import { LanguageSelector } from '@/components/language-selector';
import { TextInput } from '@/components/text-input';
import { VoiceSelector } from '@/components/voice-selector';
import { AudioPlayer } from '@/components/audio-player';
import { generateSpeech, chunkText } from '@/lib/tts-api';
import { getLanguageDisplayName } from '@/lib/languages';
import { useToast } from '@/hooks/use-toast';
import type { TtsRequestInput } from '@shared/schema';

export default function Home() {
  const [text, setText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [selectedVoice, setSelectedVoice] = useState('en-US-Neural2-F');
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [generatedAudio, setGeneratedAudio] = useState<{
    audioUrl: string;
    duration: number;
    fileSize: number;
  } | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async (request: TtsRequestInput) => {
      // Simulate progress for text chunking
      const chunks = chunkText(request.text);
      const totalChunks = chunks.length;
      
      if (totalChunks > 1) {
        // Show progress for large texts
        for (let i = 0; i < totalChunks; i++) {
          setProcessingProgress(((i + 1) / totalChunks) * 80); // 80% for processing
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      setProcessingProgress(90);
      const result = await generateSpeech(request);
      setProcessingProgress(100);
      
      return result;
    },
    onSuccess: (data) => {
      setGeneratedAudio({
        audioUrl: data.audioUrl,
        duration: data.duration,
        fileSize: data.fileSize,
      });
      setProcessingProgress(0);
      toast({
        title: "Speech generated successfully!",
        description: "Your audio is ready to play and download.",
      });
    },
    onError: (error: any) => {
      setProcessingProgress(0);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate speech. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!text.trim()) {
      toast({
        title: "No text to convert",
        description: "Please enter some text first.",
        variant: "destructive",
      });
      return;
    }

    if (text.length > 50000) {
      toast({
        title: "Text too long",
        description: "Text must be less than 50,000 characters.",
        variant: "destructive",
      });
      return;
    }

    generateMutation.mutate({
      text,
      language: selectedLanguage,
      voice: selectedVoice,
      speed: speed.toString(),
      pitch: pitch.toString(),
    });
  };

  const handleDownload = () => {
    if (generatedAudio) {
      const link = document.createElement('a');
      link.href = generatedAudio.audioUrl;
      link.download = `tts-audio-${Date.now()}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download started",
        description: "Your audio file is being downloaded.",
      });
    }
  };

  const handleLanguageDetected = (language: string) => {
    setSelectedLanguage(language);
  };

  const isProcessing = generateMutation.isPending || processingProgress > 0;

  return (
    <>
      <SeoHead 
        language={selectedLanguage.split('-')[0]}
        title={`AI Text to Speech - Convert Text to Natural Voice in ${getLanguageDisplayName(selectedLanguage)}`}
      />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Volume className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-xl font-bold text-gray-900">AI TTS</h1>
              </div>
            </div>
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
            />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="tts-gradient-bg text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Convert Text to Natural Speech
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Transform any text into lifelike speech using Google's advanced AI voices. Support for 50+ languages with instant playback and download.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-blue-100">
            <div className="flex items-center">
              <Globe className="h-5 w-5 text-orange-400 mr-2" />
              <span>50+ Languages</span>
            </div>
            <div className="flex items-center">
              <Bot className="h-5 w-5 text-orange-400 mr-2" />
              <span>AI-Powered Voices</span>
            </div>
            <div className="flex items-center">
              <Download className="h-5 w-5 text-orange-400 mr-2" />
              <span>Instant Download</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main App */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Text Input */}
          <div className="lg:col-span-2">
            <TextInput
              value={text}
              onChange={setText}
              onLanguageDetected={handleLanguageDetected}
            />

            {/* Audio Player Section */}
            {generatedAudio && (
              <AudioPlayer
                audioUrl={generatedAudio.audioUrl}
                duration={generatedAudio.duration}
                fileSize={generatedAudio.fileSize}
                onDownload={handleDownload}
              />
            )}
          </div>
          
          {/* Right Column: Voice Selection */}
          <div className="lg:col-span-1">
            <VoiceSelector
              selectedLanguage={selectedLanguage}
              selectedVoice={selectedVoice}
              onVoiceChange={setSelectedVoice}
              speed={speed}
              pitch={pitch}
              onSpeedChange={setSpeed}
              onPitchChange={setPitch}
              onLanguageChange={setSelectedLanguage}
            />
            
            {/* Start TTS Button */}
            <div className="mt-6 space-y-3">
              <Button
                onClick={handleGenerate}
                disabled={isProcessing || !text.trim()}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-lg h-14 shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Processing Speech...
                  </>
                ) : (
                  <>
                    <Volume className="h-6 w-6 mr-3" />
                    Start TTS Generation
                  </>
                )}
              </Button>
              
              {text.trim() && (
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Ready to convert {text.length.toLocaleString()} characters
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Progress Section */}
        {isProcessing && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Processing Your Text</h3>
              <span className="text-sm text-gray-500">
                {processingProgress < 80 ? 'Chunking text...' : 'Generating audio...'}
              </span>
            </div>
            
            <Progress value={processingProgress} className="h-3 mb-2" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                {chunkText(text).length > 1 ? 'Processing chunks...' : 'Processing...'}
              </span>
              <span>{Math.round(processingProgress)}%</span>
            </div>
            
            {chunkText(text).length > 1 && (
              <div className="mt-4 text-sm text-gray-500 flex items-center">
                <Bot className="h-4 w-4 mr-2" />
                <span>Large text is automatically split into chunks for optimal processing</span>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our AI Text-to-Speech?</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Experience the power of Google's advanced neural voices with our intuitive platform designed for professionals and content creators.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Neural AI Voices</h3>
              <p className="text-gray-600">State-of-the-art neural networks create incredibly natural and expressive speech that's indistinguishable from human voices.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">50+ Languages</h3>
              <p className="text-gray-600">Support for over 50 languages and regional accents, making your content accessible to a global audience.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-600">Generate high-quality audio in seconds with our optimized processing pipeline and smart text chunking.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sliders className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Full Control</h3>
              <p className="text-gray-600">Adjust speed, pitch, and voice characteristics to match your exact requirements and brand voice.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Download</h3>
              <p className="text-gray-600">Download your generated audio as high-quality MP3 files ready for immediate use in your projects.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Mobile Optimized</h3>
              <p className="text-gray-600">Fully responsive design works perfectly on all devices, from desktop computers to smartphones.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center mb-4">
                <Volume className="h-8 w-8 text-blue-500 mr-3" />
                <h3 className="text-xl font-bold">AI TTS</h3>
              </div>
              <p className="text-gray-300 mb-4 max-w-md">
                The most advanced text-to-speech platform powered by Google's AI technology. Create natural-sounding voices for any project.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Access</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Voice Gallery</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AI TTS. All rights reserved. Powered by Google Cloud Text-to-Speech API.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
