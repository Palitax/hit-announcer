/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.tcgdex.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pokemontcg.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.pokemon-card.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pokemon-card.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'limitlesstcg.nyc3.cdn.digitaloceanspaces.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3.limitlesstcg.com',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
