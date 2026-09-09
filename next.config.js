/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  experimental: {
    // Next.js limita las Server Actions a 1MB por defecto.
    // Los PDFs de partituras/cifrados y los audios suelen superar eso,
    // así que subimos el límite para permitir archivos más grandes.
    serverActions: {
      bodySizeLimit: '15mb',
    },
  },
};

module.exports = nextConfig;
