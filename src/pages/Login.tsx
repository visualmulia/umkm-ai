import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Phone, ArrowRight, MessageCircle, Store, Shield, Loader2 } from 'lucide-react'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const formatPhone = (num: string) => {
    let cleaned = num.replace(/\D/g, '')
    if (cleaned.startsWith('0')) cleaned = '62' + cleaned.slice(1)
    if (!cleaned.startsWith('62')) cleaned = '62' + cleaned
    return cleaned
  }

  const handleSendOtp = async () => {
    if (!phone || phone.length < 8) { setError('Masukkan nomor WA yang valid'); return }
    setLoading(true); setError('')
    const formatted = formatPhone(phone)
    try {
      const res = await fetch('/api/trpc/auth.sendOtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ json: { phone: formatted } }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      setStep('otp')
      setCountdown(60)
    } catch (err: any) {
      setError(err.message || 'Gagal kirim OTP. Coba lagi.')
    }
    setLoading(false)
  }

  const handleVerifyOtp = async () => {
    if (otp.length < 4) { setError('Masukkan kode OTP'); return }
    setLoading(true); setError('')
    const formatted = formatPhone(phone)
    try {
      const res = await fetch('/api/trpc/auth.verifyOtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ json: { phone: formatted, otp } }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      if (data.result?.data?.token) {
        localStorage.setItem('umkm_session', data.result.data.token)
        window.location.href = '/dashboard'
      }
    } catch (err: any) {
      setError(err.message || 'Kode OTP salah. Coba lagi.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#faf8f4' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 no-underline">
            <Store className="w-8 h-8" style={{ color: '#d4754a' }} />
            <span className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1a1a1a' }}>UMKM-AI</span>
          </Link>
        </div>

        <div className="rounded-2xl p-8" style={{ backgroundColor: 'white', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          {step === 'phone' ? (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(212,117,74,0.1)' }}>
                  <Phone className="w-6 h-6" style={{ color: '#d4754a' }} />
                </div>
                <h1 className="text-xl font-bold mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Login dengan WhatsApp</h1>
                <p className="text-sm" style={{ color: '#5c5c5c' }}>Masukkan nomor WA kamu, kita kirim OTP</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: '#5c5c5c' }}>Nomor WhatsApp</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: '#5c5c5c' }}>+62</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="81234567890"
                      className="w-full pl-12 pr-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#d4754a]"
                      style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: '#faf8f4' }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                    />
                  </div>
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="btn-primary w-full justify-center py-3"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><MessageCircle className="w-4 h-4" /> Kirim OTP</>}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(212,117,74,0.1)' }}>
                  <Shield className="w-6 h-6" style={{ color: '#d4754a' }} />
                </div>
                <h1 className="text-xl font-bold mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Verifikasi OTP</h1>
                <p className="text-sm" style={{ color: '#5c5c5c' }}>Kode dikirim ke +62{phone}</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: '#5c5c5c' }}>Kode OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="w-full px-4 py-3 rounded-xl text-sm border text-center text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-[#d4754a]"
                    style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: '#faf8f4' }}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                  />
                </div>
                {error && <p className="text-xs text-red-500 text-center">{error}</p>}
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className="btn-primary w-full justify-center py-3"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Verifikasi <ArrowRight className="w-4 h-4" /></>}
                </button>
                <div className="flex items-center justify-between text-xs">
                  <button onClick={() => setStep('phone')} className="text-[#5c5c5c] hover:text-[#d4754a] transition-colors">
                    Ganti nomor
                  </button>
                  {countdown > 0 ? (
                    <span style={{ color: '#5c5c5c' }}>Kirim ulang ({countdown}s)</span>
                  ) : (
                    <button onClick={handleSendOtp} className="font-medium" style={{ color: '#d4754a' }}>
                      Kirim ulang OTP
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Back to home */}
          <div className="mt-6 pt-4 border-t text-center" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
            <Link to="/" className="text-sm" style={{ color: '#5c5c5c', textDecoration: 'none' }}>
              ← Kembali ke beranda
            </Link>
          </div>
        </div>

        {/* Trust */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <span className="flex items-center gap-1 text-xs" style={{ color: '#5c5c5c' }}>
            <Shield className="w-3.5 h-3.5" /> Aman & Terenkripsi
          </span>
          <span className="flex items-center gap-1 text-xs" style={{ color: '#5c5c5c' }}>
            <MessageCircle className="w-3.5 h-3.5" /> Via WhatsApp
          </span>
        </div>
      </div>
    </div>
  )
}
