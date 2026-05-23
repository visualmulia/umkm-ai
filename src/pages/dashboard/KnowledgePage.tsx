import { useState } from 'react'
import { trpc } from '@/providers/trpc'
import {
  Brain,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  HelpCircle,
  ListChecks,
  Sparkles,
} from 'lucide-react'

export default function KnowledgePage() {
  const { data: knowledge, isLoading } = trpc.knowledge.list.useQuery();
  const utils = trpc.useUtils();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);

  const [form, setForm] = useState({
    type: 'faq' as 'faq' | 'rule',
    question: '',
    answer: '',
    priority: 1,
  });

  const createK = trpc.knowledge.create.useMutation({
    onSuccess: () => { utils.knowledge.list.invalidate(); setShowAdd(false); resetForm(); },
  });
  const updateK = trpc.knowledge.update.useMutation({
    onSuccess: () => { utils.knowledge.list.invalidate(); setEditing(null); resetForm(); },
  });
  const deleteK = trpc.knowledge.delete.useMutation({
    onSuccess: () => utils.knowledge.list.invalidate(),
  });

  function resetForm() {
    setForm({ type: 'faq', question: '', answer: '', priority: 1 });
  }

  const filtered = knowledge?.filter((k) =>
    (k.question?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
    k.answer.toLowerCase().includes(search.toLowerCase())
  );

  const faqCount = knowledge?.filter((k) => k.type === 'faq').length ?? 0;
  const ruleCount = knowledge?.filter((k) => k.type === 'rule').length ?? 0;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>AI Training</h1>
          <p className="text-sm" style={{ color: '#5c5c5c' }}>Latih AI-mu dengan FAQ dan rules</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Tambah Data
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card flex items-center gap-3">
          <Brain className="w-5 h-5" style={{ color: '#d4754a' }} />
          <div>
            <p className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{knowledge?.length ?? 0}</p>
            <p className="text-xs" style={{ color: '#5c5c5c' }}>Total Data</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <HelpCircle className="w-5 h-5" style={{ color: '#d4a853' }} />
          <div>
            <p className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{faqCount}</p>
            <p className="text-xs" style={{ color: '#5c5c5c' }}>FAQ</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <ListChecks className="w-5 h-5" style={{ color: '#22c55e' }} />
          <div>
            <p className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{ruleCount}</p>
            <p className="text-xs" style={{ color: '#5c5c5c' }}>Rules</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#5c5c5c' }} />
        <input
          type="text"
          placeholder="Cari FAQ atau rules..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md pl-9 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2"
          style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: 'white' }}
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-3 border-[#d4754a] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filtered?.length === 0 ? (
        <div className="text-center py-16 card">
          <Sparkles className="w-14 h-14 mx-auto mb-4" style={{ color: '#d4a853', opacity: 0.4 }} />
          <p className="text-lg font-medium" style={{ color: '#1a1a1a' }}>Belum ada data training</p>
          <p className="text-sm mt-1" style={{ color: '#5c5c5c' }}>Tambah FAQ atau rules untuk melatih AI-mu</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered?.map((k) => (
            <div key={k.id} className="card card-hover group">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      k.type === 'faq' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {k.type === 'faq' ? 'FAQ' : 'RULE'}
                    </span>
                    {k.question && (
                      <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>{k.question}</p>
                    )}
                  </div>
                  <p className="text-sm" style={{ color: '#5c5c5c' }}>{k.answer}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                  <button
                    onClick={() => { setEditing(k.id); setForm({ type: k.type as 'faq' | 'rule', question: k.question || '', answer: k.answer, priority: k.priority }); }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: '#f0ece3' }}
                  >
                    <Pencil className="w-3.5 h-3.5" style={{ color: '#5c5c5c' }} />
                  </button>
                  <button
                    onClick={() => { if (confirm('Hapus ini?')) deleteK.mutate({ id: k.id }); }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: '#fee2e2' }}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAdd || editing !== null) && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {editing !== null ? 'Edit Data' : 'Tambah Data'}
              </h2>
              <button onClick={() => { setShowAdd(false); setEditing(null); resetForm(); }} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#5c5c5c' }}>Tipe</label>
                <div className="flex gap-2">
                  {(['faq', 'rule'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setForm({ ...form, type: t })}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                        form.type === t ? 'text-white' : 'border'
                      }`}
                      style={{
                        backgroundColor: form.type === t ? '#d4754a' : 'transparent',
                        borderColor: form.type === t ? '#d4754a' : 'rgba(0,0,0,0.08)',
                      }}
                    >
                      {t === 'faq' ? 'FAQ' : 'Rule'}
                    </button>
                  ))}
                </div>
              </div>
              {form.type === 'faq' && (
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: '#5c5c5c' }}>Pertanyaan</label>
                  <input
                    type="text"
                    value={form.question}
                    onChange={(e) => setForm({ ...form, question: e.target.value })}
                    placeholder="Pertanyaan yang sering ditanyakan customer..."
                    className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2"
                    style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: '#faf8f4' }}
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#5c5c5c' }}>
                  {form.type === 'faq' ? 'Jawaban' : 'Rule'}
                </label>
                <textarea
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  rows={4}
                  placeholder={form.type === 'faq' ? 'Jawaban untuk pertanyaan di atas...' : 'Instruksi/rules untuk AI...'}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 resize-none"
                  style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: '#faf8f4' }}
                />
              </div>
              <button
                onClick={() => {
                  if (!form.answer) return;
                  if (editing !== null) {
                    updateK.mutate({ id: editing, ...form });
                  } else {
                    createK.mutate(form);
                  }
                }}
                className="btn-primary w-full mt-2"
              >
                {editing !== null ? 'Simpan Perubahan' : 'Tambah Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
