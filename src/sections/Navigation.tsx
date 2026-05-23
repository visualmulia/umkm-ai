import { useState, useEffect } from 'react';

const NAV_LINKS = [
  { label: 'Fitur', href: '#fitur' },
  { label: 'Harga', href: '#harga' },
  { label: 'Cara Kerja', href: '#cara-kerja' },
  { label: 'FAQ', href: '#faq' },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 72,
          zIndex: 1000,
          backgroundColor: scrolled ? 'rgba(250, 248, 244, 0.9)' : '#faf8f4',
          backdropFilter: scrolled ? 'blur(8px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(8px)' : 'none',
          boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.05)' : 'none',
          borderBottom: '1px solid rgba(26,26,26,0.06)',
          transition: 'all 400ms ease',
        }}
      >
        <div className="content-max-width" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Brand */}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
          >
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>
              UMKM-AI
            </span>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#d4754a', display: 'inline-block' }} />
          </a>

          {/* Desktop Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="hidden md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#5c5c5c',
                  textDecoration: 'none',
                  position: 'relative',
                  transition: 'color 300ms ease',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color = '#d4754a';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color = '#5c5c5c';
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <a
            href="https://wa.me/628129998888"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary hidden md:inline-flex"
          >
            Mulai Gratis
          </a>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ display: 'flex', flexDirection: 'column', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
            className="md:hidden"
            aria-label="Toggle menu"
          >
            <span style={{
              width: 24, height: 2, backgroundColor: '#1a1a1a',
              transition: 'all 300ms ease',
              transform: mobileOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
            }} />
            <span style={{
              width: 24, height: 2, backgroundColor: '#1a1a1a',
              transition: 'all 300ms ease',
              opacity: mobileOpen ? 0 : 1,
            }} />
            <span style={{
              width: 24, height: 2, backgroundColor: '#1a1a1a',
              transition: 'all 300ms ease',
              transform: mobileOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none',
            }} />
          </button>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999,
          backgroundColor: '#faf8f4',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 40,
          paddingTop: 72,
        }}>
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 28,
                fontWeight: 600,
                color: '#1a1a1a',
                textDecoration: 'none',
                opacity: 0,
                animation: `fadeInUp 400ms ease ${i * 80}ms forwards`,
              }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://wa.me/628129998888"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary btn-primary-lg"
            style={{
              opacity: 0,
              animation: `fadeInUp 400ms ease ${NAV_LINKS.length * 80}ms forwards`,
            }}
          >
            Mulai Gratis
          </a>
          <style>{`
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(30px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
