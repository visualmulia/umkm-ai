import { useState } from 'react'
import { trpc } from '@/providers/trpc'
import {
  Wrench,
  Plus,
  Check,
  Clock,
  DollarSign,
  Calendar,
  Trash2,
  Edit3,
  X,
} from 'lucide-react'

const DAYS = [
  { key: 1, label: 'Senin' },
  { key: 2, label: 'Selasa' },
  { key: 3, label: 'Rabu' },
  { key: 4, label: 'Kamis' },
  { key: 5, label: 'Jumat' },
  { key: 6, label: 'Sabtu' },
  { key: 0, label: 'Minggu' },
];

export default function ServicesPage() {
  const utils = trpc.useUtils();
  const { data: services, isLoading } = trpc.service.list.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: '', description: '', durationMinutes: 60, price: '',
    bufferMinutes: 0, maxBookingsPerDay: 1, depositPercent: 50,
  });
  const [scheduleForm, setScheduleForm] = useState<Record<number, { startTime: string; endTime: string; isActive: boolean }>>({});

  const createService = trpc.service.create.useMutation({
    onSuccess: () => { utils.service.list.invalidate(); setShowForm(false); resetForm(); },
  });

  const updateService = trpc.service.update.useMutation({
    onSuccess: () => { utils.service.list.invalidate(); setEditingId(null); resetForm(); },
  });

  const deleteService = trpc.service.delete.useMutation({
    onSuccess: () => utils.service.list.invalidate(),
  });

  const setSchedule = trpc.service.setSchedule.useMutation({
    onSuccess: () => utils.service.list.invalidate(),
  });

  const resetForm = () => setForm({ name: '', description: '', durationMinutes: 60, price: '', bufferMinutes: 0, maxBookingsPerDay: 1, depositPercent: 50 });

  const handleSave = () => {
    if (!form.name || !form.price) return;
    if (editingId) {
      updateService.mutate({ id: editingId, ...form, price: form.price });
    } else {
      createService.mutate({ ...form, price: form.price });
    }
  };

  const handleScheduleChange = (serviceId: number, dayOfWeek: number, field: string, value: string | boolean) => {
    setScheduleForm((prev) => ({
      ...prev,
      [`${serviceId}-${dayOfWeek}`]: {
        ...prev[`${serviceId}-${dayOfWeek}`],
        [field]: value,
      },
    }));
  };

  const handleSaveSchedule = (serviceId: number, dayOfWeek: number) => {
    const key = `${serviceId}-${dayOfWeek}`;
    const s = scheduleForm[key];
    if (!s?.startTime || !s?.endTime) return;
    setSchedule.mutate({ serviceId, dayOfWeek, startTime: s.startTime, endTime: s.endTime, isActive: s.isActive });
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="w-8 h-8 border-3 border-[#d4754a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <Wrench className="w-6 h-6" style={{ color: '#d4754a' }} />
            Kelola Jasa
          </h1>
          <p className="text-sm mt-1" style={{ color: '#5c5c5c' }}>Setup jasa & jadwal booking-mu</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); resetForm(); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Jasa
        </button>
      </div>

      {/* Service Form */}
      {(showForm || editingId) && (
        <div className="card mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>
              {editingId ? 'Edit Jasa' : 'Jasa Baru'}
            </h3>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="p-1 rounded-lg hover:bg-[#f0ece3]">
              <X className="w-4 h-4" style={{ color: '#5c5c5c' }} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#5c5c5c' }}>Nama Jasa</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Driver Harian Bali" className="w-full px-3 py-2.5 rounded-xl text-sm border" style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: '#faf8f4' }} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#5c5c5c' }}>Harga (Rp)</label>
              <input type="text" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value.replace(/\D/g, '') })} placeholder="600000" className="w-full px-3 py-2.5 rounded-xl text-sm border" style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: '#faf8f4' }} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#5c5c5c' }}>Durasi (menit)</label>
              <input type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} className="w-full px-3 py-2.5 rounded-xl text-sm border" style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: '#faf8f4' }} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#5c5c5c' }}>Max Booking/Hari</label>
              <input type="number" value={form.maxBookingsPerDay} onChange={(e) => setForm({ ...form, maxBookingsPerDay: Number(e.target.value) })} className="w-full px-3 py-2.5 rounded-xl text-sm border" style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: '#faf8f4' }} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#5c5c5c' }}>Buffer (menit)</label>
              <input type="number" value={form.bufferMinutes} onChange={(e) => setForm({ ...form, bufferMinutes: Number(e.target.value) })} className="w-full px-3 py-2.5 rounded-xl text-sm border" style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: '#faf8f4' }} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#5c5c5c' }}>DP (%)</label>
              <input type="number" value={form.depositPercent} onChange={(e) => setForm({ ...form, depositPercent: Number(e.target.value) })} className="w-full px-3 py-2.5 rounded-xl text-sm border" style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: '#faf8f4' }} />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium block mb-1" style={{ color: '#5c5c5c' }}>Deskripsi</label>
              <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Jasa driver harian untuk wisata di Bali" className="w-full px-3 py-2.5 rounded-xl text-sm border" style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: '#faf8f4' }} />
            </div>
          </div>
          <button onClick={handleSave} className="btn-primary">
            <Check className="w-4 h-4" /> Simpan Jasa
          </button>
        </div>
      )}

      {/* Services List */}
      <div className="space-y-4">
        {(services || []).length === 0 && (
          <div className="card text-center py-12">
            <Wrench className="w-12 h-12 mx-auto mb-3" style={{ color: '#d4a853', opacity: 0.4 }} />
            <p className="text-sm" style={{ color: '#5c5c5c' }}>Belum ada jasa. Yuk tambah jasa pertamamu!</p>
          </div>
        )}

        {(services || []).map((svc) => (
          <div key={svc.id} className="card space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold" style={{ color: '#1a1a1a' }}>{svc.name}</h3>
                  {!svc.isActive && <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">Nonaktif</span>}
                </div>
                <p className="text-xs mt-0.5" style={{ color: '#5c5c5c' }}>{svc.description || '-'}</p>
                <div className="flex flex-wrap gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs" style={{ color: '#5c5c5c' }}>
                    <Clock className="w-3 h-3" /> {svc.durationMinutes} menit
                  </span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: '#5c5c5c' }}>
                    <DollarSign className="w-3 h-3" /> Rp {Number(svc.price).toLocaleString('id-ID')}
                  </span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: '#5c5c5c' }}>
                    <Calendar className="w-3 h-3" /> Max {svc.maxBookingsPerDay}/hari
                  </span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: '#5c5c5c' }}>
                    DP {svc.depositPercent}%
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setEditingId(svc.id);
                    setForm({
                      name: svc.name, description: svc.description || '',
                      durationMinutes: svc.durationMinutes, price: svc.price,
                      bufferMinutes: svc.bufferMinutes || 0,
                      maxBookingsPerDay: svc.maxBookingsPerDay || 1,
                      depositPercent: svc.depositPercent || 50,
                    });
                  }}
                  className="p-2 rounded-lg hover:bg-[#f0ece3] transition-colors"
                >
                  <Edit3 className="w-4 h-4" style={{ color: '#5c5c5c' }} />
                </button>
                <button
                  onClick={() => { if (confirm('Hapus jasa ini?')) deleteService.mutate({ id: svc.id }); }}
                  className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" style={{ color: '#ef4444' }} />
                </button>
              </div>
            </div>

            {/* Weekly Schedule */}
            <div className="pt-3 border-t space-y-2" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
              <p className="text-xs font-medium" style={{ color: '#1a1a1a' }}>Jadwal Mingguan</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {DAYS.map((day) => {
                  const existing = svc.schedules?.find((s) => s.dayOfWeek === day.key);
                  const key = `${svc.id}-${day.key}`;
                  const draft = scheduleForm[key];
                  return (
                    <div key={day.key} className="p-2.5 rounded-xl border text-center" style={{ borderColor: 'rgba(0,0,0,0.06)', backgroundColor: existing ? 'rgba(34,197,94,0.05)' : '#faf8f4' }}>
                      <p className="text-xs font-medium mb-1.5" style={{ color: '#1a1a1a' }}>{day.label}</p>
                      {existing ? (
                        <div>
                          <p className="text-[11px] font-semibold" style={{ color: '#22c55e' }}>{existing.startTime} - {existing.endTime}</p>
                          <button
                            onClick={() => handleScheduleChange(svc.id, day.key, 'isActive', false)}
                            className="text-[10px] mt-1 underline"
                            style={{ color: '#ef4444' }}
                          >
                            Hapus
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <input
                            type="time"
                            value={draft?.startTime || ''}
                            onChange={(e) => handleScheduleChange(svc.id, day.key, 'startTime', e.target.value)}
                            className="w-full text-[11px] px-1 py-1 rounded border"
                            style={{ borderColor: 'rgba(0,0,0,0.08)' }}
                          />
                          <input
                            type="time"
                            value={draft?.endTime || ''}
                            onChange={(e) => handleScheduleChange(svc.id, day.key, 'endTime', e.target.value)}
                            className="w-full text-[11px] px-1 py-1 rounded border"
                            style={{ borderColor: 'rgba(0,0,0,0.08)' }}
                          />
                          <button
                            onClick={() => handleSaveSchedule(svc.id, day.key)}
                            className="w-full text-[10px] py-1 rounded bg-[#d4754a] text-white font-medium"
                          >
                            Simpan
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
