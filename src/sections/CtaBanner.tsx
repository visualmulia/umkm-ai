import { useEffect, useRef } from 'react';

export default function CtaBanner() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current || typeof window === 'undefined') return;
    // @ts-ignore - GSAP loaded from CDN
    const gsap = window.gsap;
    // @ts-ignore
    const ScrollTrigger = window.ScrollTrigger;

    if (!gsap || !ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo('.cta-headline',
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true }
        }
      );
      gsap.fromTo('.cta-body',
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.15,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true }
        }
      );
      gsap.fromTo('.cta-button',
        { y: 20, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.3,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        backgroundColor: '#1a1a1a',
        paddingTop: 100,
        paddingBottom: 100,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background text */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 'clamp(100px, 15vw, 200px)',
          fontWeight: 700,
          color: 'rgba(250, 248, 244, 0.03)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        UMKM-AI
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', paddingLeft: 40, paddingRight: 40, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <h2
          className="cta-headline"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: 600,
            lineHeight: 1.15,
            color: '#faf8f4',
            marginBottom: 16,
          }}
        >
          Siap Hire Pegawai Digital Pertamamu?
        </h2>
        <p
          className="cta-body"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 18,
            fontWeight: 400,
            lineHeight: 1.7,
            color: '#5c5c5c',
            maxWidth: 480,
            margin: '0 auto 32px',
          }}
        >
          50 chat gratis menunggu. Scan QR, 5 menit setup, AI langsung kerja.
        </p>
        <div className="cta-button" style={{ marginBottom: 16 }}>
          <a
            href="https://wa.me/6285643419774?text=Halo%20UMKM-AI!%20%F0%9F%91%8B%20Saya%20mau%20coba%20pegawai%20digital%20untuk%20bisnis%20saya."
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{
              padding: '18px 40px',
              fontSize: 16,
            }}
          >
            Mulai Gratis Sekarang
          </a>
        </div>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            fontWeight: 400,
            color: '#5c5c5c',
          }}
        >
          Atau chat ke WhatsApp: 0856-4341-9774
        </p>
      </div>
    </section>
  );
}
