import { useState, useEffect } from 'react'
import { trpc } from '@/providers/trpc'
import {
  User,
  Store,
  CreditCard,
  Smartphone,
  Check,
  Zap,
  Shield,
  MessageCircle,
} from 'lucide-react'

const PLANS = [
  {
    name: 'Free',
    price: 'Rp 0',
    period: '/bulan',
    features: ['50 Chat/bulan', '1 CS Bot (Mbak AI)', '5 Produk', 'Basic auto-reply'],
    color: '#d4a853',
  },
  {
    name: 'Starter',
    price: 'Rp 79.000',
    period: '/bulan',
    features: ['300 Chat/bulan', 'CS Bot + Marketing AI', '20 Produk', 'Laporan mingguan', 'Caption IG'],
    color: '#d4754a',
    popular: true,
  },
  {
    name: 'Pro',
    price: 'Rp 99.000',
    period: '/bulan',
    features: ['Unlimited chat', 'Semua AI Agents (4)', 'Unlimited produk', 'CRM & broadcast', 'Analisis lengkap'],
    color: '#1a1a1a',
  },
];

export default function SettingsPage() {
  const { data: user, isLoading } = trpc.user.me.useQuery();
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState<'profile' | 'ai' | 'plan'>('profile');
  const [form, setForm] = useState({
    name: '', businessName: '', businessCategory: '', city: '', whatsapp: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        businessName: user.businessName || '',
        businessCategory: user.businessCategory || '',
        city: user.city || '',
        whatsapp: user.whatsapp || '',
      });
    }
  }, [user]);

  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      utils.user.me.invalidate();
      alert('Profil diperbarui!');
    },
  });

  const updatePlan = trpc.user.updatePlan.useMutation({
    onSuccess: () => utils.user.me.invalidate(),
  });

  const TABS = [
    { id: 'profile' as const, label: 'Profil', icon: User },
    { id: 'ai' as const, label: 'AI Setting', icon: MessageCircle },
    { id: 'plan' as const, label: 'Plan', icon: CreditCard },
  ];

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="w-8 h-8 border-3 border-[#d4754a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Pengaturan</h1>
        <p className="text-sm" style={{ color: '#5c5c5c' }}>Kelola profil, AI, dan subscription-mu</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id ? 'text-white' : 'border'
            }`}
            style={{
              backgroundColor: activeTab === tab.id ? '#d4754a' : 'transparent',
              borderColor: activeTab === tab.id ? '#d4754a' : 'rgba(0,0,0,0.08)',
            }}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Store className="w-5 h-5" style={{ color: '#d4754a' }} />
            <h2 className="font-semibold" style={{ color: '#1a1a1a' }}>Profil Bisnis</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#5c5c5c' }}>Nama Lengkap</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2"
                style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: '#faf8f4' }}
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#5c5c5c' }}>WhatsApp</label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#5c5c5c' }} />
                <input
                  type="text"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  placeholder="628123456789"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2"
                  style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: '#faf8f4' }}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#5c5c5c' }}>Nama Bisnis</label>
              <input
                type="text"
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                placeholder="Nama brand / toko"
                className="w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2"
                style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: '#faf8f4' }}
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#5c5c5c' }}>Kategori Bisnis</label>
              <input
                type="text"
                value={form.businessCategory}
                onChange={(e) => setForm({ ...form, businessCategory: e.target.value })}
                placeholder="e.g. Makanan, Fashion"
                className="w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2"
                style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: '#faf8f4' }}
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#5c5c5c' }}>Kota</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="e.g. Jakarta"
                className="w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2"
                style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: '#faf8f4' }}
              />
            </div>
          </div>
          <button
            onClick={() => updateProfile.mutate(form)}
            className="btn-primary mt-2"
          >
            <Check className="w-4 h-4" /> Simpan Profil
          </button>

          {/* Onboarding Steps */}
          <div className="mt-8 pt-6 border-t" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
            <h3 className="font-semibold mb-4" style={{ color: '#1a1a1a' }}>Setup Progress</h3>
            <div className="space-y-3">
              {[
                { step: 0, label: 'Akun dibuat', done: true },
                { step: 1, label: 'Hubungkan WhatsApp', done: (user?.onboardingStep ?? 0) >= 1 },
                { step: 2, label: 'Tambah produk', done: (user?.onboardingStep ?? 0) >= 2 },
                { step: 3, label: 'Latih AI', done: (user?.onboardingStep ?? 0) >= 3 },
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    s.done ? 'text-white' : 'border-2'
                  }`}
                    style={{
                      backgroundColor: s.done ? '#22c55e' : 'transparent',
                      borderColor: s.done ? '#22c55e' : 'rgba(0,0,0,0.15)',
                    }}>
                    {s.done ? <Check className="w-3.5 h-3.5" /> : <span className="text-xs" style={{ color: '#5c5c5c' }}>{s.step}</span>}
                  </div>
                  <span className={`text-sm ${s.done ? 'line-through opacity-50' : ''}`} style={{ color: '#1a1a1a' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Setting Tab */}
      {activeTab === 'ai' && (
        <div className="card space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle className="w-5 h-5" style={{ color: '#d4754a' }} />
            <h2 className="font-semibold" style={{ color: '#1a1a1a' }}>AI Setting</h2>
          </div>
          <div className="p-4 rounded-xl" style={{ backgroundColor: '#f0ece3' }}>
            <p className="text-sm font-medium mb-2" style={{ color: '#1a1a1a' }}>Nama AI</p>
            <p className="text-xs mb-3" style={{ color: '#5c5c5c' }}>Customer akan melihat nama ini saat chat</p>
            <div className="flex gap-2">
              {['Mbak AI', 'Mas AI', 'Kak AI', 'Custom'].map((name) => (
                <button
                  key={name}
                  className="px-4 py-2 rounded-xl text-sm border hover:border-[#d4754a] transition-colors"
                  style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: 'white' }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4 rounded-xl" style={{ backgroundColor: '#f0ece3' }}>
            <p className="text-sm font-medium mb-2" style={{ color: '#1a1a1a' }}>Tone AI</p>
            <p className="text-xs mb-3" style={{ color: '#5c5c5c' }}>Pilih gaya komunikasi AI-mu</p>
            <div className="flex gap-2">
              {[
                { key: 'ramah', label: 'Ramah', desc: 'Sapaan hangat, emoji' },
                { key: 'profesional', label: 'Profesional', desc: 'Formal, to-the-point' },
                { key: 'gaul', label: 'Gaul', desc: 'Santai, bahasa sehari-hari' },
              ].map((tone) => (
                <button
                  key={tone.key}
                  className="flex-1 p-3 rounded-xl text-left border hover:border-[#d4754a] transition-colors"
                  style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: 'white' }}
                >
                  <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>{tone.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#5c5c5c' }}>{tone.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="p-4 rounded-xl border" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-green-600" />
              <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>Escalation ke Human</p>
            </div>
            <p className="text-xs" style={{ color: '#5c5c5c' }}>Kalau AI nggak yakin, otomatis bilang "Tunggu sebentar ya" dan forward ke kamu via WhatsApp.</p>
          </div>
        </div>
      )}

      {/* Plan Tab */}
      {activeTab === 'plan' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map((plan) => {
              const isCurrent = (user?.plan || 'free').toLowerCase() === plan.name.toLowerCase();
              return (
                <div
                  key={plan.name}
                  className={`card relative ${plan.popular ? 'ring-2' : ''}`}
                  style={plan.popular ? { ringColor: '#d4754a' } : {}}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-1 rounded-full text-white" style={{ backgroundColor: '#d4754a' }}>
                      PALING LAKU
                    </span>
                  )}
                  <div className="text-center pt-2">
                    <h3 className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{plan.name}</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{plan.price}</span>
                      <span className="text-sm" style={{ color: '#5c5c5c' }}>{plan.period}</span>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm" style={{ color: '#5c5c5c' }}>
                        <Check className="w-4 h-4 flex-shrink-0" style={{ color: plan.color }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => {
                      if (!isCurrent && plan.name !== 'Free') {
                        if (confirm(`Upgrade ke plan ${plan.name}?`)) {
                          updatePlan.mutate({ plan: plan.name.toLowerCase() as 'starter' | 'pro' });
                        }
                      }
                    }}
                    className={`w-full mt-4 py-2.5 rounded-full text-sm font-semibold transition-all ${
                      isCurrent ? 'cursor-default' : 'hover:opacity-90'
                    }`}
                    style={{
                      backgroundColor: isCurrent ? '#f0ece3' : plan.color,
                      color: isCurrent ? '#5c5c5c' : 'white',
                    }}
                  >
                    {isCurrent ? 'Plan Aktif' : `Pilih ${plan.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
