import { useState, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useQuery } from '@tanstack/react-query';
import { getVoicesForLanguage, previewVoice } from '@/lib/tts-api';
import { getLanguageDisplayName } from '@/lib/languages';
import { getVoiceAvatarClass, getVoiceDisplayName, getVoiceInitial, formatVoiceType } from '@/lib/voices';
import { useToast } from '@/hooks/use-toast';
import type { Voice } from '@/lib/tts-api';

interface VoiceSelectorProps {
  selectedLanguage: string;
  selectedVoice: string;
  onVoiceChange: (voice: string) => void;
  speed: number;
  pitch: number;
  onSpeedChange: (speed: number) => void;
  onPitchChange: (pitch: number) => void;
  onLanguageChange: (language: string) => void;
}

export function VoiceSelector({
  selectedLanguage,
  selectedVoice,
  onVoiceChange,
  speed,
  pitch,
  onSpeedChange,
  onPitchChange,
  onLanguageChange,
}: VoiceSelectorProps) {
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const { data: voices = [], isLoading } = useQuery({
    queryKey: ['/api/voices', selectedLanguage],
    queryFn: () => getVoicesForLanguage(selectedLanguage),
  });

  // Auto-select first voice when language changes
  useEffect(() => {
    if (voices.length > 0 && !voices.some(v => v.name === selectedVoice)) {
      onVoiceChange(voices[0].name);
    }
  }, [voices, selectedVoice, onVoiceChange]);

  const handleVoicePreview = async (voiceName: string) => {
    if (previewingVoice === voiceName) {
      // Stop preview
      if (previewAudio) {
        previewAudio.pause();
        previewAudio.currentTime = 0;
      }
      setPreviewingVoice(null);
      return;
    }

    try {
      setPreviewingVoice(voiceName);
      
      const audioBlob = await previewVoice(selectedLanguage, voiceName);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      setPreviewAudio(audio);
      
      audio.onended = () => {
        setPreviewingVoice(null);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setPreviewingVoice(null);
        URL.revokeObjectURL(audioUrl);
        toast({
          title: "Preview failed",
          description: "Unable to play voice preview.",
          variant: "destructive",
        });
      };
      
      await audio.play();
    } catch (error) {
      setPreviewingVoice(null);
      toast({
        title: "Preview failed",
        description: "Unable to generate voice preview.",
        variant: "destructive",
      });
    }
  };

  const formatSpeedValue = (value: number) => {
    return `${value}x`;
  };

  const formatPitchValue = (value: number) => {
    if (value === 0) return 'Normal';
    if (value > 0) return `+${value}`;
    return value.toString();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Voice Settings</h3>
      
      {/* Language Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
        <Select value={selectedLanguage} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en-US">English (US)</SelectItem>
            <SelectItem value="en-GB">English (UK)</SelectItem>
            <SelectItem value="es-ES">Spanish (Spain)</SelectItem>
            <SelectItem value="es-MX">Spanish (Mexico)</SelectItem>
            <SelectItem value="fr-FR">French</SelectItem>
            <SelectItem value="de-DE">German</SelectItem>
            <SelectItem value="it-IT">Italian</SelectItem>
            <SelectItem value="pt-BR">Portuguese (Brazil)</SelectItem>
            <SelectItem value="ja-JP">Japanese</SelectItem>
            <SelectItem value="ko-KR">Korean</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Voice Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Voice</label>
        <div className="space-y-2 max-h-64 overflow-y-auto voice-list-container">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-500">Loading voices...</div>
            </div>
          ) : (
            voices.map((voice) => (
              <div
                key={voice.name}
                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedVoice === voice.name
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => onVoiceChange(voice.name)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`voice-avatar ${getVoiceAvatarClass(voice.name)}`}>
                    <span>{getVoiceInitial(voice.name)}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {getVoiceDisplayName(voice.name)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatVoiceType(voice)}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVoicePreview(voice.name);
                  }}
                  title={previewingVoice === voice.name ? 'Stop preview' : 'Test voice'}
                >
                  {previewingVoice === voice.name ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Voice Controls */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Speed</label>
          <div className="space-y-2">
            <Slider
              value={[speed]}
              onValueChange={(value) => onSpeedChange(value[0])}
              min={0.5}
              max={2}
              step={0.1}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>0.5x</span>
              <span className="font-medium text-gray-600">
                {formatSpeedValue(speed)}
              </span>
              <span>2x</span>
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pitch</label>
          <div className="space-y-2">
            <Slider
              value={[pitch]}
              onValueChange={(value) => onPitchChange(value[0])}
              min={-20}
              max={20}
              step={1}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Low</span>
              <span className="font-medium text-gray-600">
                {formatPitchValue(pitch)}
              </span>
              <span>High</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
