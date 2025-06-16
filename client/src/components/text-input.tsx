import { useState, useEffect } from 'react';
import { Trash2, Clipboard, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { detectLanguageFromText } from '@/lib/languages';
import { useToast } from '@/hooks/use-toast';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onLanguageDetected: (language: string) => void;
  maxLength?: number;
}

export function TextInput({ 
  value, 
  onChange, 
  onLanguageDetected,
  maxLength = 50000 
}: TextInputProps) {
  const [isDetecting, setIsDetecting] = useState(false);
  const { toast } = useToast();
  
  const characterCount = value.length;
  const isOverLimit = characterCount > maxLength;

  const handleTextChange = (newValue: string) => {
    onChange(newValue);
  };

  const handleClear = () => {
    onChange('');
    toast({
      title: "Text cleared",
      description: "The text input has been cleared.",
    });
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const newValue = value + text;
        if (newValue.length > maxLength) {
          toast({
            title: "Text too long",
            description: `The pasted text would exceed the ${maxLength.toLocaleString()} character limit.`,
            variant: "destructive",
          });
          return;
        }
        onChange(newValue);
        toast({
          title: "Text pasted",
          description: "Content has been pasted from clipboard.",
        });
      }
    } catch (error) {
      toast({
        title: "Paste failed",
        description: "Unable to access clipboard. Please paste manually.",
        variant: "destructive",
      });
    }
  };

  const handleDetectLanguage = async () => {
    if (!value.trim()) {
      toast({
        title: "No text to analyze",
        description: "Please enter some text first.",
        variant: "destructive",
      });
      return;
    }

    setIsDetecting(true);
    
    // Simulate detection delay
    setTimeout(() => {
      const detectedLanguage = detectLanguageFromText(value);
      onLanguageDetected(detectedLanguage);
      setIsDetecting(false);
      
      toast({
        title: "Language detected",
        description: `Detected language: ${detectedLanguage}`,
      });
    }, 1000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Enter Your Text</h2>
        <span className={`text-sm ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
          {characterCount.toLocaleString()} / {maxLength.toLocaleString()} characters
        </span>
      </div>
      
      <Textarea
        value={value}
        onChange={(e) => handleTextChange(e.target.value)}
        className={`w-full h-64 p-4 resize-none ${
          isOverLimit ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
        }`}
        placeholder="Enter the text you want to convert to speech... You can input up to 50,000 characters for long-form content."
      />
      
      {isOverLimit && (
        <p className="text-sm text-red-500 mt-2">
          Text exceeds {maxLength.toLocaleString()} character limit
        </p>
      )}
      
      <div className="flex flex-wrap items-center justify-between mt-4 gap-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={!value}
            className="text-gray-600 hover:text-gray-900"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePaste}
            className="text-gray-600 hover:text-gray-900"
          >
            <Clipboard className="h-4 w-4 mr-2" />
            Paste
          </Button>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleDetectLanguage}
          disabled={!value.trim() || isDetecting}
          className="bg-gray-50 text-gray-700 hover:bg-gray-100"
        >
          <Wand2 className="h-4 w-4 mr-2" />
          {isDetecting ? 'Detecting...' : 'Detect Language'}
        </Button>
      </div>
    </div>
  );
}
