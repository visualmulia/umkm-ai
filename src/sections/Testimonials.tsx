import { useScrollReveal } from '../hooks/useScrollReveal';

const TESTIMONIALS = [
  {
    quote: 'Kalau ada yang bantu jawab chat, saya bisa fokus packing & cari supplier baru. Mbak AI jawabnya cepet dan ramah — customer pada senang!',
    author: 'Bu Ani',
    business: 'Hijab & Gamis, Depok',
  },
  {
    quote: 'Saya cuma mau customer tahu menu & bisa order via WA, nggak ribet. Mas AI bantu bikin promo setiap minggu. Order naik 40%!',
    author: 'Pak Budi',
    business: 'Warung Kopi, Bandung',
  },
  {
    quote: 'Admin saya sering slow, kalau AI bisa lebih cepet & nggak perlu gaji, saya mau coba. Sekarang 80% chat di-handle AI.',
    author: 'Mbak Rina',
    business: 'Reseller Fashion, Surabaya',
  },
];

function StarRating() {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
      {[...Array(5)].map((_, i) => (
        <span key={i} style={{ color: '#d4a853', fontSize: 16 }}>★</span>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const sectionRef = useScrollReveal();

  return (
    <section ref={sectionRef} style={{ backgroundColor: '#f0ece3' }} className="section-padding">
      <div className="content-max-width">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <span className="reveal-eyebrow text-eyebrow" style={{ display: 'block', marginBottom: 16 }}>
            CERITA UMKM SUKSES
          </span>
          <h2
            className="reveal-headline"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(28px, 3.5vw, 42px)',
              fontWeight: 600,
              lineHeight: 1.15,
              color: '#1a1a1a',
            }}
          >
            Cerita UMKM Yang Sudah Merekrut Pegawai AI
          </h2>
        </div>

        {/* Testimonial Cards */}
        <div
          className="reveal-stagger"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24,
          }}
        >
          {TESTIMONIALS.map((t) => (
            <div
              key={t.author}
              className="reveal-item"
              style={{
                backgroundColor: '#faf8f4',
                borderRadius: 20,
                padding: 40,
                transition: 'transform 400ms ease, box-shadow 400ms ease',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.transform = 'translateY(-4px)';
                el.style.boxShadow = '0 16px 48px rgba(0,0,0,0.06)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.transform = 'translateY(0)';
                el.style.boxShadow = 'none';
              }}
            >
              <StarRating />
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 18,
                  fontWeight: 400,
                  fontStyle: 'italic',
                  lineHeight: 1.7,
                  color: '#1a1a1a',
                  marginBottom: 24,
                }}
              >
                "{t.quote}"
              </p>
              <div>
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#1a1a1a',
                    display: 'block',
                  }}
                >
                  {t.author}
                </span>
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 14,
                    fontWeight: 400,
                    color: '#5c5c5c',
                  }}
                >
                  {t.business}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
