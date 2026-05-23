import { useEffect, useRef } from 'react';

const TRUST_BADGES = [
  '50 Chat Gratis',
  'Setup 5 Menit',
  'QRIS Payment',
];

const FLOATING_CIRCLES = [
  { top: '15%', left: '10%', delay: '0s' },
  { top: '25%', right: '15%', delay: '2s' },
  { top: '60%', left: '5%', delay: '4s' },
  { top: '70%', right: '10%', delay: '6s' },
  { top: '40%', right: '5%', delay: '8s' },
];

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!sectionRef.current || typeof window === 'undefined') return;
    // @ts-ignore - GSAP loaded from CDN
    const gsap = window.gsap;
    if (!gsap) return;

    const ctx = gsap.context(() => {
      // Eyebrow slide in
      if (eyebrowRef.current) {
        gsap.fromTo(eyebrowRef.current,
          { x: -20, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.3 }
        );
      }

      // Headline
      gsap.fromTo('.hero-headline',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.4 }
      );

      // Body
      gsap.fromTo('.hero-body',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: 0.6 }
      );

      // CTA
      gsap.fromTo('.hero-cta',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.8 }
      );

      // Trust badges
      gsap.fromTo('.hero-badge',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.1, delay: 1 }
      );

      // Character
      gsap.fromTo('.hero-character',
        { scale: 0.85, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.5 }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#faf8f4',
        paddingTop: 72,
      }}
    >
      <div className="content-max-width" style={{ width: '100%', paddingTop: 60, paddingBottom: 60 }}>
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-[60px]">
          {/* Left - Text Content */}
          <div className="w-full md:w-[55%] md:flex-[0_0_55%]">
            <span ref={eyebrowRef} className="text-eyebrow block mb-5">
              PEGAWAI DIGITAL UNTUK UMKM
            </span>

            <h1
              className="hero-headline"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 'clamp(36px, 5vw, 56px)',
                fontWeight: 600,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                color: '#1a1a1a',
                marginBottom: 24,
              }}
            >
              Pegawai Digital Rp 49 Ribu — Bantu Jualan 24 Jam
            </h1>

            <p
              className="hero-body"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 'clamp(16px, 1.2vw, 18px)',
                fontWeight: 400,
                lineHeight: 1.7,
                color: '#5c5c5c',
                maxWidth: 480,
                marginBottom: 32,
              }}
            >
              UMKM-AI hadirkan CS Bot, Marketing AI, Analisis, dan Admin AI yang siap kerja lewat WhatsApp. Nggak perlu coding, nggak perlu ribet — cuma scan QR dan AI langsung aktif.
            </p>

            <div className="hero-cta mb-7">
              <a
                href="https://wa.me/6285643419774?text=Halo%20UMKM-AI!%20%F0%9F%91%8B%20Saya%20mau%20coba%20pegawai%20digital%20untuk%20bisnis%20saya."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary btn-primary-lg"
              >
                Mulai Gratis via WhatsApp
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2.5">
              {TRUST_BADGES.map((badge) => (
                <span
                  key={badge}
                  className="hero-badge"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '8px 16px',
                    borderRadius: 20,
                    backgroundColor: '#f0ece3',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12,
                    fontWeight: 500,
                    color: '#5c5c5c',
                  }}
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Right - Character Illustration */}
          <div className="w-full md:w-[45%] md:flex-[0_0_45%] flex justify-center items-center relative">
            {/* Floating decorative circles */}
            {FLOATING_CIRCLES.map((circle, i) => (
              <span
                key={i}
                className="animate-float-circle hidden md:block absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: '#d4a853',
                  opacity: 0.4,
                  ...circle,
                }}
              />
            ))}

            {/* Character container */}
            <div className="hero-character relative">
              <div className="animate-float" style={{ willChange: 'transform' }}>
                <img
                  src="/images/hero-character.png"
                  alt="Ilustrasi Mbak AI, asisten customer service AI yang ramah"
                  className="max-w-full h-auto max-h-[520px] object-contain"
                  loading="eager"
                />
              </div>
              {/* Shadow */}
              <div
                className="animate-shadow-pulse"
                style={{
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 160,
                  height: 20,
                  background: 'radial-gradient(ellipse, rgba(0,0,0,0.12) 0%, transparent 70%)',
                  borderRadius: '50%',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
