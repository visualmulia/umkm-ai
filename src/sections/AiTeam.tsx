import { useScrollReveal } from '../hooks/useScrollReveal';

const EMPLOYEES = [
  {
    name: 'Mbak AI',
    role: 'CS Bot',
    description: 'Jawab chat customer, bantu pilih produk, catat order, sampe handle komplain. Ramah dan sabar 24 jam.',
    image: '/images/char-mbak-cs.png',
    badge: 'FREE',
    badgeColor: '#d4a853',
  },
  {
    name: 'Mas AI',
    role: 'Marketing',
    description: 'Bikin caption IG, copy iklan, script TikTok, sampe strategi promo. Konten jadi gampang.',
    image: '/images/char-mas-marketing.png',
    badge: 'Rp 49rb',
    badgeColor: '#d4754a',
  },
  {
    name: 'Pak AI',
    role: 'Analisis',
    description: 'Laporan penjualan harian/mingguan, prediksi stok, analisis customer, sampe tracking kompetitor.',
    image: '/images/char-pak-analisis.png',
    badge: 'Rp 49rb',
    badgeColor: '#d4754a',
  },
  {
    name: 'Bu AI',
    role: 'Admin',
    description: 'Tracking order, generate invoice, kirim broadcast promo, sampe reminder follow-up otomatis.',
    image: '/images/char-bu-admin.png',
    badge: 'Rp 49rb',
    badgeColor: '#d4754a',
  },
];

export default function AiTeam() {
  const sectionRef = useScrollReveal();

  return (
    <section ref={sectionRef} style={{ backgroundColor: '#faf8f4' }} className="section-padding">
      <div className="content-max-width">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <span className="reveal-eyebrow text-eyebrow" style={{ display: 'block', marginBottom: 16 }}>
            KENALIN TIM KAMU
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
            4 Pegawai AI Siap Kerja 24/7
          </h2>
          <p
            className="reveal-body"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 18,
              fontWeight: 400,
              lineHeight: 1.7,
              color: '#5c5c5c',
              maxWidth: 560,
              margin: '0 auto',
            }}
          >
            Setiap pegawai punya spesialisasi. Hire sesuai kebutuhan — atau hire semua cuma Rp 99rb/bulan.
          </p>
        </div>

        {/* Employee Cards */}
        <div
          className="reveal-stagger"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 24,
          }}
        >
          {EMPLOYEES.map((emp) => (
            <div
              key={emp.name}
              className="reveal-item"
              style={{
                backgroundColor: '#f0ece3',
                borderRadius: 20,
                padding: 40,
                transition: 'transform 400ms ease, box-shadow 400ms ease',
                cursor: 'default',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.transform = 'translateY(-4px)';
                el.style.boxShadow = '0 16px 48px rgba(0,0,0,0.06)';
                const img = el.querySelector('img');
                if (img) img.style.filter = 'brightness(1.05)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.transform = 'translateY(0)';
                el.style.boxShadow = 'none';
                const img = el.querySelector('img');
                if (img) img.style.filter = 'brightness(1)';
              }}
            >
              {/* Badge */}
              <span
                style={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  backgroundColor: emp.badgeColor,
                  color: emp.badgeColor === '#d4a853' ? '#1a1a1a' : '#faf8f4',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '4px 12px',
                  borderRadius: 12,
                  zIndex: 2,
                }}
              >
                {emp.badge}
              </span>

              {/* Character Image */}
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <img
                  src={emp.image}
                  alt={`Ilustrasi ${emp.name}, ${emp.role} AI`}
                  style={{
                    width: '100%',
                    maxWidth: 200,
                    height: 200,
                    objectFit: 'contain',
                    margin: '0 auto',
                    transition: 'filter 400ms ease',
                  }}
                  loading="lazy"
                />
              </div>

              {/* Text */}
              <h3
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 24,
                  fontWeight: 600,
                  color: '#1a1a1a',
                  marginBottom: 12,
                }}
              >
                {emp.name} — {emp.role}
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
                {emp.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
