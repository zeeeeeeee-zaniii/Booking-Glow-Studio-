"use client";

import { useState } from "react";
import type { Service } from "@/lib/types";
import BookingFlow from "./BookingFlow";
import Reveal from "./Reveal";

const THUMB_PATTERNS = [
  // circles
  <svg key="p1" viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true">
    <circle cx="30" cy="30" r="22" fill="currentColor" opacity="0.25" />
    <circle cx="170" cy="70" r="30" fill="currentColor" opacity="0.2" />
    <circle cx="120" cy="15" r="10" fill="currentColor" opacity="0.3" />
  </svg>,
  // waves
  <svg key="p2" viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true">
    <path d="M0 65 Q 50 35 100 65 T 200 65 V100 H0 Z" fill="currentColor" opacity="0.25" />
    <path d="M0 45 Q 50 15 100 45 T 200 45" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.3" />
  </svg>,
  // dots
  <svg key="p3" viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true">
    {Array.from({ length: 5 }).map((_, r) =>
      Array.from({ length: 10 }).map((_, c) => (
        <circle key={`${r}-${c}`} cx={15 + c * 19} cy={14 + r * 19} r="2.6" fill="currentColor" opacity="0.35" />
      ))
    )}
  </svg>,
];

const SERVICE_PHOTOS: Record<string, string> = {
  "Signature Facial":
    "https://rltxedmwdojuovlblkea.supabase.co/storage/v1/object/public/site-assets/booking/facial.jpg",
  "Haircut & Styling":
    "https://rltxedmwdojuovlblkea.supabase.co/storage/v1/object/public/site-assets/booking/haircut.webp",
  Manicure:
    "https://rltxedmwdojuovlblkea.supabase.co/storage/v1/object/public/site-assets/booking/manicure.jpg",
  Pedicure:
    "https://rltxedmwdojuovlblkea.supabase.co/storage/v1/object/public/site-assets/booking/pedicure.webp",
  "Bridal Trial Makeup":
    "https://rltxedmwdojuovlblkea.supabase.co/storage/v1/object/public/site-assets/booking/bridal.jpg",
  "Hair Spa":
    "https://rltxedmwdojuovlblkea.supabase.co/storage/v1/object/public/site-assets/booking/hairspa.jpg",
};

export default function ServicesSection({ services }: { services: Service[] }) {
  const [preselected, setPreselected] = useState<{ serviceId: string; nonce: number } | null>(null);

  function bookService(serviceId: string) {
    setPreselected({ serviceId, nonce: Date.now() });
    document.getElementById("book")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <div className="grid grid-3">
        {services.map((s, i) => (
          <Reveal key={s.id}>
            <article className="card" style={{ height: "100%" }}>
              <div className="service-thumb">
                {SERVICE_PHOTOS[s.name] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={SERVICE_PHOTOS[s.name]} alt={s.name} loading="lazy" />
                ) : (
                  <>
                    {THUMB_PATTERNS[i % THUMB_PATTERNS.length]}
                    <span className="thumb-initial">{s.name.charAt(0)}</span>
                  </>
                )}
              </div>
              <h3>{s.name}</h3>
              <div className="service-meta">
                <span>{s.duration_min} minutes</span>
              </div>
              <div className="service-foot">
                <span className="service-price">Rs {s.price_rs.toLocaleString()}</span>
                <button type="button" className="btn btn-primary btn-small" onClick={() => bookService(s.id)}>
                  Book
                </button>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <div id="book" style={{ scrollMarginTop: "5.5rem", marginTop: "3rem" }}>
        <Reveal>
          <BookingFlow services={services} preselected={preselected} />
        </Reveal>
      </div>
    </>
  );
}
