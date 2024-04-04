/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
        hostname: "**",
            }
        ]
    },
    env: {
        GOOGLE_API: process.env.GOOGLE_API,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    }

}

module.exports = nextConfig
