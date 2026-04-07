/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /** Reduce file watchers in dev (macOS EMFILE); avoids flaky missing chunks / 404 on `/`. */
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        /** Widen ignored globs to cut open FDs on macOS (EMFILE → Watchpack errors → broken route graph → 404 on `/`, `/login`). */
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.next/**',
          '**/playwright/**',
          '**/test-results/**',
        ],
      };
    }
    return config;
  },
  async rewrites() {
    const target = process.env.API_UPSTREAM ?? 'http://127.0.0.1:3010';
    return [{ source: '/api/:path*', destination: `${target}/api/:path*` }];
  },
};

export default nextConfig;
