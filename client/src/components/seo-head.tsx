import { useEffect } from 'react';

interface SeoHeadProps {
  title?: string;
  description?: string;
  language?: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
}

export function SeoHead({
  title = 'AI Text to Speech - Convert Text to Natural Voice | TTS Generator',
  description = 'Convert text to speech in 50+ languages with Google\'s AI voices. Free online text-to-speech generator with natural-sounding voices and audio download.',
  language = 'en',
  keywords = 'text to speech, TTS, voice generator, AI voices, speech synthesis, audio conversion',
  ogImage = 'https://images.unsplash.com/photo-1589254065878-42c9da997008?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=630',
  canonicalUrl = window.location.href,
}: SeoHeadProps) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('language', language);
    
    // Open Graph tags
    updateMetaProperty('og:title', title);
    updateMetaProperty('og:description', description);
    updateMetaProperty('og:image', ogImage);
    updateMetaProperty('og:url', canonicalUrl);
    updateMetaProperty('og:type', 'website');
    updateMetaProperty('og:site_name', 'AI TTS');
    
    // Twitter tags
    updateMetaProperty('twitter:card', 'summary_large_image');
    updateMetaProperty('twitter:title', title);
    updateMetaProperty('twitter:description', description);
    updateMetaProperty('twitter:image', ogImage);
    
    // Language and canonical
    updateLinkTag('canonical', canonicalUrl);
    document.documentElement.lang = language;
    
    // Hreflang tags for multilingual support
    updateHreflangTags();
    
    // Structured data
    updateStructuredData(title, description);
    
  }, [title, description, language, keywords, ogImage, canonicalUrl]);

  return null;
}

function updateMetaTag(name: string, content: string) {
  let element = document.querySelector(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('name', name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function updateMetaProperty(property: string, content: string) {
  let element = document.querySelector(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('property', property);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function updateLinkTag(rel: string, href: string) {
  let element = document.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

function updateHreflangTags() {
  // Remove existing hreflang tags
  document.querySelectorAll('link[hreflang]').forEach(el => el.remove());
  
  const baseUrl = window.location.origin;
  const languages = [
    { code: 'en', url: `${baseUrl}/` },
    { code: 'es', url: `${baseUrl}/es` },
    { code: 'fr', url: `${baseUrl}/fr` },
    { code: 'de', url: `${baseUrl}/de` },
    { code: 'it', url: `${baseUrl}/it` },
    { code: 'pt', url: `${baseUrl}/pt` },
    { code: 'ja', url: `${baseUrl}/ja` },
    { code: 'ko', url: `${baseUrl}/ko` },
  ];
  
  languages.forEach(({ code, url }) => {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = code;
    link.href = url;
    document.head.appendChild(link);
  });
  
  // Add x-default
  const defaultLink = document.createElement('link');
  defaultLink.rel = 'alternate';
  defaultLink.hreflang = 'x-default';
  defaultLink.href = `${baseUrl}/`;
  document.head.appendChild(defaultLink);
}

function updateStructuredData(title: string, description: string) {
  // Remove existing structured data
  const existing = document.querySelector('script[type="application/ld+json"]');
  if (existing) {
    existing.remove();
  }
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AI Text to Speech Generator",
    "description": description,
    "url": window.location.origin,
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Text to speech conversion",
      "50+ languages support", 
      "Natural AI voices",
      "Audio download",
      "Voice preview"
    ],
    "creator": {
      "@type": "Organization",
      "name": "AI TTS"
    }
  };
  
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);
}
