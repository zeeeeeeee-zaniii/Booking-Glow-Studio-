import Link from "next/link";
import HeroArt from "@/components/HeroArt";
import Reveal from "@/components/Reveal";
import ServicesSection from "@/components/ServicesSection";
import FindBooking from "@/components/FindBooking";
import { sb, supabaseConfigured } from "@/lib/supabase";
import { FALLBACK_SERVICES, type Service } from "@/lib/types";

export const dynamic = "force-dynamic";

async function loadServices(): Promise<Service[]> {
  if (!supabaseConfigured()) return FALLBACK_SERVICES;
  try {
    const rows = await sb<Service[]>(
      "services?select=id,name,price_rs,duration_min,is_active&is_active=eq.true&order=created_at.asc"
    );
    return rows.length ? rows : FALLBACK_SERVICES;
  } catch {
    return FALLBACK_SERVICES;
  }
}

export default async function HomePage() {
  const services = await loadServices();

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="logo">
            <span className="logo-mark">G</span>
            Glow Studio
          </Link>
          <nav className="main-nav">
            <a href="#services">Services</a>
            <a href="#how">How It Works</a>
            <a href="#my-booking">My Booking</a>
            <a href="#visit">Visit Us</a>
            <Link href="/admin">Admin</Link>
          </nav>
          <a href="#book" className="btn btn-primary btn-small header-cta">
            Book Appointment
          </a>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container hero-inner">
            <div>
              <span className="eyebrow" style={{ color: "var(--accent-2)" }}>
                Beauty Studio
              </span>
              <h1>
                Look radiant, <em>book in a minute.</em>
              </h1>
              <p className="lead">
                Facials, hair, nails and bridal trials at Glow Studio. Choose your service,
                pick a time that suits you, and we will take care of the rest — no phone
                calls, no waiting.
              </p>
              <div className="hero-actions">
                <a href="#book" className="btn btn-accent">
                  Book Appointment
                </a>
                <a href="#services" className="btn btn-ghost" style={{ color: "var(--hero-text)", borderColor: "var(--accent)" }}>
                  View Services
                </a>
              </div>
              <p className="hero-hours">
                <span aria-hidden="true">◷</span> Open Mon–Sat, 10 AM – 8 PM · Sunday closed
              </p>
            </div>
            <HeroArt />
          </div>
        </section>

        <section id="services" className="section" style={{ scrollMarginTop: "4rem" }}>
          <div className="container">
            <Reveal>
              <span className="eyebrow">Our Services</span>
              <h2 className="section-title">Treatments you will love</h2>
              <p className="section-sub" style={{ marginBottom: "2.2rem" }}>
                Transparent prices, no surprises. Tap Book on any service to start your
                appointment — it takes less than a minute.
              </p>
            </Reveal>
            <ServicesSection services={services} />
          </div>
        </section>

        <section id="how" className="section section-soft" style={{ scrollMarginTop: "4rem" }}>
          <div className="container">
            <Reveal>
              <span className="eyebrow">How It Works</span>
              <h2 className="section-title">Booking, made simple</h2>
            </Reveal>
            <div className="grid grid-3" style={{ marginTop: "2rem" }}>
              {[
                {
                  n: "1",
                  title: "Choose your service",
                  text: "Browse our treatments and pick the one you want, with the price shown upfront.",
                },
                {
                  n: "2",
                  title: "Pick a date & time",
                  text: "See live availability for the next two weeks. Booked slots disappear, so your time is truly yours.",
                },
                {
                  n: "3",
                  title: "Show up & glow",
                  text: "You get a booking reference instantly. We confirm on your phone number — then just arrive and relax.",
                },
              ].map((step) => (
                <Reveal key={step.n}>
                  <article className="card" style={{ height: "100%" }}>
                    <div className="step-num">{step.n}</div>
                    <h3 style={{ marginBottom: "0.4rem" }}>{step.title}</h3>
                    <p style={{ color: "var(--muted)" }}>{step.text}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="my-booking" className="section" style={{ scrollMarginTop: "4rem" }}>
          <div className="container" style={{ maxWidth: "46rem" }}>
            <Reveal>
              <span className="eyebrow">Already Booked?</span>
              <h2 className="section-title">Find my booking</h2>
              <p className="section-sub" style={{ marginBottom: "2rem" }}>
                Enter the phone number you booked with to see your appointments or cancel
                one if your plans change.
              </p>
            </Reveal>
            <Reveal>
              <FindBooking />
            </Reveal>
          </div>
        </section>

        <section id="visit" className="section section-soft" style={{ scrollMarginTop: "4rem" }}>
          <div className="container">
            <div className="grid grid-2" style={{ alignItems: "start" }}>
              <Reveal>
                <span className="eyebrow">Visit Us</span>
                <h2 className="section-title">Drop by the studio</h2>
                <p className="section-sub">
                  Walk-ins are welcome, but booking ahead guarantees your slot — especially
                  on weekends.
                </p>
              </Reveal>
              <Reveal>
                <ul className="visit-list">
                  <li>
                    <strong>Address</strong>
                    Glow Studio, Main Boulevard Road
                  </li>
                  <li>
                    <strong>Opening Hours</strong>
                    Monday – Saturday: 10:00 AM – 8:00 PM
                    <br />
                    Sunday: Closed
                  </li>
                  <li>
                    <strong>Phone</strong>
                    0300-0000000
                  </li>
                </ul>
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-row">
          <span className="logo">
            <span className="logo-mark">G</span>
            Glow Studio
          </span>
          <span>Open Mon–Sat, 10 AM – 8 PM</span>
          <span className="demo-note">
            Demo website — Glow Studio is a fictional business created to showcase online booking.
          </span>
        </div>
      </footer>
    </>
  );
}
