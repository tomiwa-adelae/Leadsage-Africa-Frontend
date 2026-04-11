/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-b398502faf144a45b59ee1adae9c3b04.r2.dev",
        port: "",
      },
    ],
  },
}

export default nextConfig
