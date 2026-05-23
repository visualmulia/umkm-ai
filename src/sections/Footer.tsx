const PRODUCT_LINKS = [
  'CS Bot',
  'Marketing AI',
  'Analisis',
  'Admin AI',
];

const COMPANY_LINKS = [
  'Tentang Kami',
  'Blog',
  'Karir',
  'Kontak',
];

const LEGAL_LINKS = [
  'Syarat & Ketentuan',
  'Kebijakan Privasi',
  'FAQ',
];

export default function Footer() {
  const linkStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    fontWeight: 400,
    color: 'rgba(250, 248, 244, 0.6)',
    textDecoration: 'none',
    transition: 'color 200ms ease',
    display: 'block',
    marginBottom: 10,
  };

  const columnHeaderStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    fontWeight: 600,
    color: '#faf8f4',
    marginBottom: 16,
  };

  return (
    <footer style={{ backgroundColor: '#1a1a1a', paddingTop: 80, paddingBottom: 40 }}>
      <div className="content-max-width">
        {/* Top Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 40,
            marginBottom: 60,
          }}
        >
          {/* Brand Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: '#faf8f4' }}>
                UMKM-AI
              </span>
              <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#d4754a', display: 'inline-block' }} />
            </div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 400, color: 'rgba(250, 248, 244, 0.6)', lineHeight: 1.65 }}>
              Pegawai digital untuk 65 juta UMKM Indonesia.
            </p>
          </div>

          {/* Product Column */}
          <div>
            <div style={columnHeaderStyle}>Produk</div>
            {PRODUCT_LINKS.map((link) => (
              <a
                key={link}
                href="#"
                style={linkStyle}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.color = '#faf8f4'; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'rgba(250, 248, 244, 0.6)'; }}
              >
                {link}
              </a>
            ))}
          </div>

          {/* Company Column */}
          <div>
            <div style={columnHeaderStyle}>Perusahaan</div>
            {COMPANY_LINKS.map((link) => (
              <a
                key={link}
                href="#"
                style={linkStyle}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.color = '#faf8f4'; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'rgba(250, 248, 244, 0.6)'; }}
              >
                {link}
              </a>
            ))}
          </div>

          {/* Legal Column */}
          <div>
            <div style={columnHeaderStyle}>Legal</div>
            {LEGAL_LINKS.map((link) => (
              <a
                key={link}
                href="#"
                style={linkStyle}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.color = '#faf8f4'; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'rgba(250, 248, 244, 0.6)'; }}
              >
                {link}
              </a>
            ))}
          </div>
        </div>

        {/* Separator */}
        <div style={{ height: 1, backgroundColor: 'rgba(250, 248, 244, 0.1)', marginBottom: 24 }} />

        {/* Bottom Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 400, color: 'rgba(250, 248, 244, 0.4)' }}>
            &copy; 2025 UMKM-AI. All rights reserved.
          </span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 400, color: 'rgba(250, 248, 244, 0.4)' }}>
            Made with ❤️ for UMKM Indonesia
          </span>
        </div>
      </div>
    </footer>
  );
}
