import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Share2, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { formatDuration, formatFileSize } from '@/lib/tts-api';
import { useToast } from '@/hooks/use-toast';

interface AudioPlayerProps {
  audioUrl: string;
  duration: number;
  fileSize: number;
  onDownload: () => void;
}

export function AudioPlayer({ audioUrl, duration, fileSize, onDownload }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(75);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = (value[0] / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Generated Speech Audio',
          text: 'Check out this AI-generated speech audio',
          url: window.location.href,
        });
      } else {
        // Fallback: copy URL to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied",
          description: "Audio link copied to clipboard.",
        });
      }
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Unable to share audio.",
        variant: "destructive",
      });
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Generated Audio</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>Duration: {formatDuration(duration)}</span>
        </div>
      </div>
      
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      {/* Audio Player UI */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          {/* Play/Pause Button */}
          <Button
            size="lg"
            className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white p-0"
            onClick={togglePlayback}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </Button>
          
          {/* Progress Bar */}
          <div className="flex-1">
            <Slider
              value={[progress]}
              onValueChange={handleProgressChange}
              max={100}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{formatDuration(Math.floor(currentTime))}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>
          
          {/* Volume Control */}
          <div className="flex items-center space-x-2">
            <Volume2 className="h-4 w-4 text-gray-500" />
            <Slider
              value={[volume]}
              onValueChange={(value) => setVolume(value[0])}
              max={100}
              step={1}
              className="w-20"
            />
          </div>
        </div>
      </div>
      
      {/* Download Section */}
      <div className="flex flex-wrap items-center justify-between mt-6 gap-4">
        <div className="flex items-center space-x-4">
          <Button
            onClick={onDownload}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Download MP3
          </Button>
          <Button
            variant="outline"
            onClick={handleShare}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
        
        <div className="text-sm text-gray-500">
          File size: {formatFileSize(fileSize)}
        </div>
      </div>
    </div>
  );
}
