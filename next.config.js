/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed output: 'export' because API routes need server-side rendering
  // output: 'export', // This prevents API routes from working
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
