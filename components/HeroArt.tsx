const HERO_PHOTO_URL =
  "https://rltxedmwdojuovlblkea.supabase.co/storage/v1/object/public/site-assets/booking/hero.webp";

export default function HeroArt() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={HERO_PHOTO_URL}
      alt="Inside the Glow Studio beauty studio"
      className="hero-photo"
      loading="eager"
    />
  );
}
