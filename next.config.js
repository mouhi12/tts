/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: false, // Using pages directory for API routes
  },
  async rewrites() {
    return [
      {
        source: '/audio/:path*',
        destination: '/api/audio/:path*',
      },
    ];
  },
  // Enable compression for better performance
  compress: true,
  // Configure headers for security
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  // Internationalization configuration
  i18n: {
    locales: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'],
    defaultLocale: 'en',
    domains: [
      {
        domain: 'tts-app.vercel.app',
        defaultLocale: 'en',
      },
      {
        domain: 'es.tts-app.vercel.app',
        defaultLocale: 'es',
      },
      {
        domain: 'fr.tts-app.vercel.app',
        defaultLocale: 'fr',
      },
    ],
  },
};

module.exports = nextConfig;