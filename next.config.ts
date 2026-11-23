import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Cache Components are off: this site reads its theme, services and
     bookings from Supabase at request time, so pages render dynamically. */
  cacheComponents: false,
};

export default nextConfig;
