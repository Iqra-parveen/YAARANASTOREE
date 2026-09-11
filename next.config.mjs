/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Wide open on purpose: admins can paste any image URL (Supabase Storage,
      // Unsplash, a CDN, etc.) into the product/category/banner forms. Tighten
      // this to specific hosts once you know where your images will live.
      { protocol: "https", hostname: "**" },
    ],
  },
};
export default nextConfig;
