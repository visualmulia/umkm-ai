import { useState } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const FAQS = [
  {
    question: 'Apa itu UMKM-AI?',
    answer: 'UMKM-AI adalah platform AI yang menghadirkan "pegawai digital" untuk UMKM Indonesia. Kamu bisa hire CS Bot, Marketing AI, Analisis AI, dan Admin AI yang siap kerja 24/7 lewat WhatsApp.',
  },
  {
    question: 'Gimana cara mulainya?',
    answer: 'Gampang! Cukup scan QR code atau klik link wa.me/UMKM-AI, lalu chat dengan AI. Jawab 3 pertanyaan tentang bisnis kamu, kirim 3 foto produk, dan AI langsung aktif dalam 5 menit.',
  },
  {
    question: 'Apakah perlu coding?',
    answer: 'Nggak sama sekali! UMKM-AI didesain khusus untuk UMKM yang nggak punya background teknis. Semua setup dilakukan via chat WhatsApp, nggak perlu install aplikasi atau coding.',
  },
  {
    question: 'Chat gratis 50 itu hitungannya gimana?',
    answer: '50 chat gratis dihitung dari pesan masuk customer yang dijawab oleh AI. Nggak termasuk pesan yang kamu kirim. Setelah 50 chat, AI akan otomatis pause dan kamu bisa upgrade ke plan berbayar.',
  },
  {
    question: 'Paymentnya pakai apa?',
    answer: 'Kami pakai Flip for Business yang support QRIS, Virtual Account (BCA, BNI, BRI, Mandiri), dan E-Wallet (DANA, OVO, Gopay, ShopeePay). Pembayaran aman dan langsung terverifikasi otomatis.',
  },
  {
    question: 'Bisa pakai untuk bisnis apa saja?',
    answer: 'Bisa! UMKM-AI cocok untuk semua jenis bisnis: fashion, makanan, minuman, kerajinan, elektronik, jasa, dan lainnya. Selama kamu jualan dan customer chat via WhatsApp, AI kami bisa bantu.',
  },
  {
    question: 'Gimana kalau AI nggak bisa jawab?',
    answer: 'Kalau AI nggak yakin dengan jawabannya, AI akan bilang "Tunggu sebentar ya kak, saya tanya owner" dan langsung forward pertanyaan ke WhatsApp kamu. Kamu tetap punya kontrol penuh.',
  },
  {
    question: 'Bisa cancel subscription kapan saja?',
    answer: 'Bisa! Nggak ada kontrak mengikat. Kamu bisa cancel subscription kapan saja dari dashboard. Setelah cancel, plan kamu tetap aktif sampai akhir periode yang sudah dibayar.',
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sectionRef = useScrollReveal();

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleItem(index);
    }
  };

  return (
    <section
      id="faq"
      ref={sectionRef}
      style={{ backgroundColor: '#faf8f4' }}
      className="section-padding"
    >
      <div style={{ maxWidth: 800, margin: '0 auto', paddingLeft: 40, paddingRight: 40 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <span className="reveal-eyebrow text-eyebrow" style={{ display: 'block', marginBottom: 16 }}>
            PERTANYAAN UMUM
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
            FAQ
          </h2>
        </div>

        {/* Accordion */}
        <div className="reveal-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="reveal-item"
                style={{
                  backgroundColor: isOpen ? '#ebe7dc' : '#f0ece3',
                  borderRadius: 16,
                  overflow: 'hidden',
                  transition: 'background-color 200ms ease',
                }}
              >
                <button
                  onClick={() => toggleItem(index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '24px 32px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    if (!isOpen) {
                      (e.currentTarget.parentElement as HTMLElement).style.backgroundColor = '#ebe7dc';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isOpen) {
                      (e.currentTarget.parentElement as HTMLElement).style.backgroundColor = '#f0ece3';
                    }
                  }}
                  aria-expanded={isOpen}
                >
                  <span
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 18,
                      fontWeight: 600,
                      color: '#1a1a1a',
                      paddingRight: 16,
                    }}
                  >
                    {faq.question}
                  </span>
                  <span
                    style={{
                      color: '#d4754a',
                      fontSize: 20,
                      fontWeight: 300,
                      flexShrink: 0,
                      transition: 'transform 300ms ease',
                      transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                      display: 'inline-flex',
                      width: 24,
                      height: 24,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    +
                  </span>
                </button>
                <div
                  style={{
                    maxHeight: isOpen ? 300 : 0,
                    opacity: isOpen ? 1 : 0,
                    overflow: 'hidden',
                    transition: 'max-height 300ms ease, opacity 300ms ease',
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 16,
                      fontWeight: 400,
                      lineHeight: 1.65,
                      color: '#5c5c5c',
                      padding: '0 32px 24px',
                    }}
                  >
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
