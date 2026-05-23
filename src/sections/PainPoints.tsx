import { useScrollReveal } from '../hooks/useScrollReveal';

const PAIN_POINTS = [
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="20" stroke="#d4754a" strokeWidth="2.5" fill="none" />
        <line x1="16" y1="16" x2="32" y2="32" stroke="#d4754a" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="32" y1="16" x2="16" y2="32" stroke="#d4754a" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'Slow Response',
    description: 'Chat masuk 50+/hari, customer kabur karena nunggu lama. Rata-rata UMKM baru balas chat 4-6 jam.',
    image: '/images/pain-kebanjiran.png',
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="12" y="8" width="24" height="32" rx="3" stroke="#d4754a" strokeWidth="2.5" fill="none" />
        <line x1="18" y1="16" x2="30" y2="16" stroke="#d4754a" strokeWidth="2" strokeLinecap="round" />
        <line x1="18" y1="22" x2="26" y2="22" stroke="#d4754a" strokeWidth="2" strokeLinecap="round" />
        <line x1="18" y1="28" x2="24" y2="28" stroke="#d4754a" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: 'Nggak Sempat Marketing',
    description: 'Sibuk packing & kirim, nggak ada waktu bikin konten IG/TikTok. Padahal konten = order.',
    image: '/images/pain-marketing.png',
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="20" stroke="#d4754a" strokeWidth="2.5" fill="none" />
        <circle cx="18" cy="20" r="2.5" fill="#d4754a" />
        <circle cx="30" cy="20" r="2.5" fill="#d4754a" />
        <path d="M16 30 Q24 24 32 30" stroke="#d4754a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M12 12 Q24 4 36 12" stroke="#d4754a" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
      </svg>
    ),
    title: 'Nggak Ngerti Data',
    description: 'Nggak tahu produk mana yang laku, customer siapa yang loyal. Semua di-run tanpa arah.',
    image: '/images/pain-data.png',
  },
];

export default function PainPoints() {
  const sectionRef = useScrollReveal();

  return (
    <section
      id="fitur"
      ref={sectionRef}
      style={{ backgroundColor: '#f0ece3' }}
      className="section-padding"
    >
      <div className="content-max-width">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <span className="reveal-eyebrow text-eyebrow" style={{ display: 'block', marginBottom: 16 }}>
            MASALAH UMKM SEKARANG
          </span>
          <h2
            className="reveal-headline"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(28px, 3.5vw, 42px)',
              fontWeight: 600,
              lineHeight: 1.15,
              color: '#1a1a1a',
              marginBottom: 16,
            }}
          >
            Kebanjiran Chat, Nggak Sempat Marketing
          </h2>
          <p
            className="reveal-body"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 18,
              fontWeight: 400,
              lineHeight: 1.7,
              color: '#5c5c5c',
              maxWidth: 600,
              margin: '0 auto',
            }}
          >
            Ribuan UMKM di Indonesia kehilangan order cuma gara-gara slow response. Kita ngerti — soalnya kita juga pernah.
          </p>
        </div>

        {/* Cards */}
        <div
          className="reveal-stagger"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24,
          }}
        >
          {PAIN_POINTS.map((point) => (
            <div
              key={point.title}
              className="reveal-item"
              style={{
                backgroundColor: '#faf8f4',
                borderRadius: 20,
                padding: 48,
                transition: 'transform 400ms cubic-bezier(0.25, 0.1, 0.25, 1), box-shadow 400ms cubic-bezier(0.25, 0.1, 0.25, 1)',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.transform = 'translateY(-6px)';
                el.style.boxShadow = '0 20px 60px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.transform = 'translateY(0)';
                el.style.boxShadow = 'none';
              }}
            >
              <div style={{ marginBottom: 24 }}>
                {point.icon}
              </div>
              <img
                src={point.image}
                alt={point.title}
                style={{
                  width: '100%',
                  height: 160,
                  objectFit: 'contain',
                  marginBottom: 24,
                  borderRadius: 12,
                }}
                loading="lazy"
              />
              <h3
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 22,
                  fontWeight: 600,
                  color: '#1a1a1a',
                  marginBottom: 12,
                }}
              >
                {point.title}
              </h3>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 16,
                  fontWeight: 400,
                  lineHeight: 1.65,
                  color: '#5c5c5c',
                }}
              >
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
