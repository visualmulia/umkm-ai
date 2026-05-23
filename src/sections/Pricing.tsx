import { useScrollReveal } from '../hooks/useScrollReveal';

const PLANS = [
  {
    name: 'Gratis',
    price: 'Rp 0',
    period: '/bulan',
    highlighted: false,
    features: [
      '50 Chat/bulan',
      '1 CS Bot (Mbak AI)',
      '3 Produk',
      'Basic auto-reply',
      'QR code print',
    ],
    cta: 'Mulai Gratis',
    ctaStyle: 'outline' as const,
  },
  {
    name: 'Starter',
    price: 'Rp 49.000',
    period: '/bulan',
    highlighted: true,
    badge: 'POPULER',
    features: [
      '500 Chat/bulan',
      'CS Bot + Marketing AI',
      '20 Produk',
      'Laporan mingguan',
      'Caption IG generator',
      'QRIS payment link',
    ],
    cta: 'Pilih Starter',
    ctaStyle: 'primary' as const,
  },
  {
    name: 'Pro',
    price: 'Rp 99.000',
    period: '/bulan',
    highlighted: false,
    features: [
      'Unlimited chat',
      'Semua Pegawai AI (4)',
      'Unlimited produk',
      'QRIS payment link',
      'Follow-up otomatis',
      'CRM & broadcast',
      'Analisis lengkap',
    ],
    cta: 'Pilih Pro',
    ctaStyle: 'outline' as const,
  },
];

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="10" fill="#d4754a" />
      <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Pricing() {
  const sectionRef = useScrollReveal();

  return (
    <section
      id="harga"
      ref={sectionRef}
      style={{ backgroundColor: '#faf8f4' }}
      className="section-padding"
    >
      <div className="content-max-width">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <span className="reveal-eyebrow text-eyebrow" style={{ display: 'block', marginBottom: 16 }}>
            HARGA TRANSPARAN
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
            Mulai dari Gratis, Upgrade Kapan Saja
          </h2>
        </div>

        {/* Pricing Cards */}
        <div
          className="reveal-stagger"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24,
            alignItems: 'start',
          }}
        >
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="reveal-item"
              style={{
                backgroundColor: plan.highlighted ? '#1a1a1a' : '#f0ece3',
                borderRadius: 20,
                padding: 48,
                position: 'relative',
                transition: 'transform 400ms cubic-bezier(0.25, 0.1, 0.25, 1), box-shadow 400ms cubic-bezier(0.25, 0.1, 0.25, 1)',
              }}
              onMouseEnter={(e) => {
                if (!plan.highlighted) {
                  const el = e.currentTarget;
                  el.style.transform = 'translateY(-6px)';
                  el.style.boxShadow = '0 20px 60px rgba(0,0,0,0.08)';
                }
              }}
              onMouseLeave={(e) => {
                if (!plan.highlighted) {
                  const el = e.currentTarget;
                  el.style.transform = 'translateY(0)';
                  el.style.boxShadow = 'none';
                }
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <span
                  style={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#d4754a',
                    color: '#faf8f4',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '4px 12px',
                    borderRadius: 12,
                  }}
                >
                  {plan.badge}
                </span>
              )}

              {/* Plan Name */}
              <h3
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 28,
                  fontWeight: 600,
                  color: plan.highlighted ? '#faf8f4' : '#1a1a1a',
                  marginBottom: 12,
                }}
              >
                {plan.name}
              </h3>

              {/* Price */}
              <div style={{ marginBottom: 32 }}>
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 48,
                    fontWeight: 600,
                    color: plan.highlighted ? '#faf8f4' : '#1a1a1a',
                  }}
                >
                  {plan.price}
                </span>
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 16,
                    fontWeight: 400,
                    color: plan.highlighted ? '#5c5c5c' : '#5c5c5c',
                  }}
                >
                  {plan.period}
                </span>
              </div>

              {/* Features */}
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 15,
                      fontWeight: 400,
                      color: plan.highlighted ? 'rgba(250,248,244,0.85)' : '#5c5c5c',
                    }}
                  >
                    <CheckIcon />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href="https://wa.me/6285643419774"
                target="_blank"
                rel="noopener noreferrer"
                className={plan.ctaStyle === 'primary' ? 'btn-primary' : 'btn-outline'}
                style={{
                  width: '100%',
                  ...(plan.highlighted ? {} : {}),
                }}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
