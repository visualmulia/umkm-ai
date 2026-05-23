import { useState } from 'react'
import { trpc } from '@/providers/trpc'
import {
  Megaphone,
  Instagram,
  FileText,
  Video,
  Copy,
  Check,
  Loader2,
  Sparkles,
} from 'lucide-react'

const TOOLS = [
  {
    id: 'caption',
    label: 'Caption Instagram',
    icon: Instagram,
    desc: 'Buat caption + hashtag yang engaging',
    placeholder: 'e.g. Hijab satin premium, warna pastel',
  },
  {
    id: 'copy',
    label: 'Copy Iklan',
    icon: FileText,
    desc: 'Headline + body + CTA yang converting',
    placeholder: 'e.g. Kopi lokal arabika, target: millennials',
  },
  {
    id: 'script',
    label: 'Script TikTok/Reels',
    icon: Video,
    desc: 'Script video pendek dengan hook kuat',
    placeholder: 'e.g. Snack kekinian rasa matcha',
  },
];

export default function MarketingPage() {
  const [activeTool, setActiveTool] = useState('caption');
  const [input, setInput] = useState('');
  const [keywords, setKeywords] = useState('');
  const [target, setTarget] = useState('');
  const [promo, setPromo] = useState('');
  const [duration, setDuration] = useState<'15' | '30' | '60'>('30');
  const [tone, setTone] = useState<'ramah' | 'profesional' | 'gaul'>('ramah');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const generateCaption = trpc.marketing.generateCaption.useMutation({
    onSuccess: (data) => setResult(data.caption),
  });
  const generateCopy = trpc.marketing.generateCopy.useMutation({
    onSuccess: (data) => setResult(data.copy),
  });
  const generateScript = trpc.marketing.generateScript.useMutation({
    onSuccess: (data) => setResult(data.script),
  });

  const isLoading = generateCaption.isPending || generateCopy.isPending || generateScript.isPending;

  const handleGenerate = () => {
    setResult('');
    if (activeTool === 'caption') {
      generateCaption.mutate({ productName: input, keywords: keywords || undefined, tone });
    } else if (activeTool === 'copy') {
      generateCopy.mutate({ productName: input, targetAudience: target || undefined, promo: promo || undefined, tone });
    } else if (activeTool === 'script') {
      generateScript.mutate({ productName: input, duration, tone });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentTool = TOOLS.find((t) => t.id === activeTool)!;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <Megaphone className="w-6 h-6" style={{ color: '#d4754a' }} />
          Marketing AI
        </h1>
        <p className="text-sm mt-1" style={{ color: '#5c5c5c' }}>
          Mas AI bantu bikin konten marketing-mu dalam hitungan detik
        </p>
      </div>

      {/* Tool selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => { setActiveTool(tool.id); setResult(''); }}
            className={`card text-left transition-all ${activeTool === tool.id ? 'ring-2 ring-[#d4754a]' : 'hover:shadow-md'}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: activeTool === tool.id ? 'rgba(212,117,74,0.1)' : '#f0ece3' }}>
                <tool.icon className="w-5 h-5" style={{ color: '#d4754a' }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#1a1a1a' }}>{tool.label}</p>
                <p className="text-xs" style={{ color: '#5c5c5c' }}>{tool.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="card space-y-4 mb-6">
        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: '#5c5c5c' }}>
            Nama Produk / Bisnis
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={currentTool.placeholder}
            className="w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#d4754a]"
            style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: '#faf8f4' }}
          />
        </div>

        {activeTool === 'caption' && (
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: '#5c5c5c' }}>
              Keywords (opsional)
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g. premium, handmade, limited edition"
              className="w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#d4754a]"
              style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: '#faf8f4' }}
            />
          </div>
        )}

        {activeTool === 'copy' && (
          <>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: '#5c5c5c' }}>
                Target Audience (opsional)
              </label>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g. Ibu rumah tangga, mahasiswa"
                className="w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#d4754a]"
                style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: '#faf8f4' }}
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: '#5c5c5c' }}>
                Promo / Diskon (opsional)
              </label>
              <input
                type="text"
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
                placeholder="e.g. Diskon 20% hari ini"
                className="w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#d4754a]"
                style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: '#faf8f4' }}
              />
            </div>
          </>
        )}

        {activeTool === 'script' && (
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: '#5c5c5c' }}>
              Durasi Video
            </label>
            <div className="flex gap-2">
              {(['15', '30', '60'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${duration === d ? 'text-white' : ''}`}
                  style={{
                    backgroundColor: duration === d ? '#d4754a' : 'white',
                    borderColor: duration === d ? '#d4754a' : 'rgba(0,0,0,0.08)',
                  }}
                >
                  {d} detik
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tone selector */}
        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: '#5c5c5c' }}>
            Tone AI
          </label>
          <div className="flex gap-2">
            {[
              { key: 'ramah', label: 'Ramah' },
              { key: 'profesional', label: 'Profesional' },
              { key: 'gaul', label: 'Gaul' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTone(t.key as typeof tone)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${tone === t.key ? 'text-white' : ''}`}
                style={{
                  backgroundColor: tone === t.key ? '#d4754a' : 'white',
                  borderColor: tone === t.key ? '#d4754a' : 'rgba(0,0,0,0.08)',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!input || isLoading}
          className="btn-primary w-full justify-center py-3"
          style={{ opacity: !input || isLoading ? 0.7 : 1 }}
        >
          {isLoading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Generate {currentTool.label}</>
          )}
        </button>
      </div>

      {/* Result area */}
      {result && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>Hasil</h3>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border hover:bg-[#f0ece3] transition-colors"
              style={{ borderColor: 'rgba(0,0,0,0.08)' }}
            >
              {copied ? <><Check className="w-3.5 h-3.5 text-green-600" /> Tersalin</> : <><Copy className="w-3.5 h-3.5" /> Salin</>}
            </button>
          </div>
          <div className="p-4 rounded-xl text-sm whitespace-pre-wrap" style={{ backgroundColor: '#f0ece3', color: '#1a1a1a' }}>
            {result}
          </div>
        </div>
      )}
    </div>
  )
}
