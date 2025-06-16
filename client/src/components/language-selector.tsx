import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { languages, getLanguageByCode } from '@/lib/languages';
import { Button } from '@/components/ui/button';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

export function LanguageSelector({ selectedLanguage, onLanguageChange }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const selectedLang = getLanguageByCode(selectedLanguage);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageSelect = (languageCode: string) => {
    onLanguageChange(languageCode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-2xl flag-emoji">{selectedLang?.flag}</span>
        <span className="text-sm font-medium hidden sm:inline">
          {selectedLang?.name}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-64 overflow-y-auto">
          {languages.map((language) => (
            <button
              key={language.code}
              className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
              onClick={() => handleLanguageSelect(language.code)}
            >
              <span className="text-xl mr-3 flag-emoji">{language.flag}</span>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {language.name}
                </div>
                {language.region && (
                  <div className="text-xs text-gray-500">
                    {language.region}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
