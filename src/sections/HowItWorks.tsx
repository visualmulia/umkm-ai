import { useScrollReveal } from '../hooks/useScrollReveal';

const STEPS = [
  {
    number: '01',
    title: 'Scan QR WhatsApp',
    description: 'Scan QR code atau klik link wa.me/UMKM-AI. Langsung chat, nggak perlu daftar form.',
    image: '/images/step-1-qr.png',
  },
  {
    number: '02',
    title: 'Kenalin Bisnis Kamu',
    description: 'Jawab 3 pertanyaan: nama bisnis, kategori, sama kirim 3 foto produk. AI langsung belajar.',
    image: '/images/step-2-chat.png',
  },
  {
    number: '03',
    title: 'Kasih Nama AI-mu',
    description: "Panggil 'Mbak AI', 'Mas AI', atau nama apa aja. Pilih tone: ramah, profesional, atau gaul.",
    image: '/images/step-3-nama.png',
  },
  {
    number: '04',
    title: 'AI Aktif!',
    description: '50 chat GRATIS langsung jalan. Dashboard + QR code print dikirim. Customer chat, AI jawab.',
    image: '/images/step-4-aktif.png',
  },
];

export default function HowItWorks() {
  const sectionRef = useScrollReveal();

  return (
    <section
      id="cara-kerja"
      ref={sectionRef}
      style={{ backgroundColor: '#f0ece3' }}
      className="section-padding"
    >
      <div className="content-max-width">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <span className="reveal-eyebrow text-eyebrow" style={{ display: 'block', marginBottom: 16 }}>
            CARA KERJA
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
            Dari Scan QR Sampai AI Aktif — 5 Menit Doang
          </h2>
        </div>

        {/* Steps */}
        <div
          className="reveal-stagger"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 32,
            position: 'relative',
          }}
        >
          {STEPS.map((step, index) => (
            <div
              key={step.number}
              className="reveal-item"
              style={{
                textAlign: 'center',
                position: 'relative',
              }}
            >
              {/* Step Image */}
              <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
                <div
                  style={{
                    width: 160,
                    height: 160,
                    borderRadius: '50%',
                    backgroundColor: '#faf8f4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={step.image}
                    alt={step.title}
                    style={{
                      width: '80%',
                      height: '80%',
                      objectFit: 'contain',
                    }}
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Number */}
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 72,
                  fontWeight: 300,
                  color: 'rgba(212, 168, 83, 0.3)',
                  lineHeight: 1,
                  display: 'block',
                  marginBottom: 8,
                }}
              >
                {step.number}
              </span>

              {/* Title */}
              <h3
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 22,
                  fontWeight: 600,
                  color: '#1a1a1a',
                  marginBottom: 12,
                }}
              >
                {step.title}
              </h3>

              {/* Description */}
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 16,
                  fontWeight: 400,
                  lineHeight: 1.65,
                  color: '#5c5c5c',
                  maxWidth: 260,
                  margin: '0 auto',
                }}
              >
                {step.description}
              </p>

              {/* Connector (desktop only) */}
              {index < STEPS.length - 1 && (
                <div
                  className="hidden md:block"
                  style={{
                    position: 'absolute',
                    top: 80,
                    right: -32,
                    width: 60,
                    height: 0,
                    borderTop: '2px dashed rgba(212, 168, 83, 0.4)',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
