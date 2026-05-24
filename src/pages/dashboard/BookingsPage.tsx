import { useState } from 'react'
import { trpc } from '@/providers/trpc'
import {
  CalendarCheck,
  Clock,
  Phone,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Filter,
} from 'lucide-react'

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  inquiry: { label: 'Inquiry', color: '#d4a853', bg: 'rgba(212,168,83,0.1)' },
  pending_deposit: { label: 'Menunggu DP', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  confirmed: { label: 'Dikonfirmasi', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  completed: { label: 'Selesai', color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
  cancelled: { label: 'Dibatalkan', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  no_show: { label: 'No Show', color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' },
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'Semua' },
  { value: 'inquiry', label: 'Inquiry' },
  { value: 'pending_deposit', label: 'Menunggu DP' },
  { value: 'confirmed', label: 'Dikonfirmasi' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
];

export default function BookingsPage() {
  const utils = trpc.useUtils();
  const { data: bookingsList, isLoading } = trpc.booking.list.useQuery();
  const [statusFilter, setStatusFilter] = useState('all');

  const updateStatus = trpc.booking.updateStatus.useMutation({
    onSuccess: () => utils.booking.list.invalidate(),
  });

  const filtered = (bookingsList || []).filter((b) =>
    statusFilter === 'all' ? true : b.status === statusFilter
  );

  const groupedByDate: Record<string, typeof filtered> = {};
  filtered.forEach((b) => {
    if (!groupedByDate[b.bookingDate]) groupedByDate[b.bookingDate] = [];
    groupedByDate[b.bookingDate].push(b);
  });
  const sortedDates = Object.keys(groupedByDate).sort();

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="w-8 h-8 border-3 border-[#d4754a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <CalendarCheck className="w-6 h-6" style={{ color: '#d4754a' }} />
          Booking Jasa
        </h1>
        <p className="text-sm mt-1" style={{ color: '#5c5c5c' }}>Kelola semua reservasi & janji temu</p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        <Filter className="w-4 h-4 flex-shrink-0" style={{ color: '#5c5c5c' }} />
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s.value}
            onClick={() => setStatusFilter(s.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${statusFilter === s.value ? 'text-white' : 'border'}`}
            style={{
              backgroundColor: statusFilter === s.value ? '#d4754a' : 'transparent',
              borderColor: statusFilter === s.value ? '#d4754a' : 'rgba(0,0,0,0.08)',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {['inquiry', 'pending_deposit', 'confirmed', 'completed'].map((status) => {
          const count = (bookingsList || []).filter((b) => b.status === status).length;
          const style = STATUS_STYLES[status];
          return (
            <div key={status} className="card p-3">
              <p className="text-xs" style={{ color: '#5c5c5c' }}>{style.label}</p>
              <p className="text-xl font-bold mt-0.5" style={{ color: style.color }}>{count}</p>
            </div>
          );
        })}
      </div>

      {/* Bookings */}
      {sortedDates.length === 0 ? (
        <div className="card text-center py-12">
          <CalendarCheck className="w-12 h-12 mx-auto mb-3" style={{ color: '#d4a853', opacity: 0.4 }} />
          <p className="text-sm" style={{ color: '#5c5c5c' }}>Belum ada booking</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((date) => (
            <div key={date}>
              <p className="text-xs font-semibold mb-2 px-1" style={{ color: '#5c5c5c' }}>
                {new Date(date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <div className="space-y-2">
                {groupedByDate[date].map((booking) => {
                  const status = STATUS_STYLES[booking.status] || STATUS_STYLES.inquiry;
                  return (
                    <div key={booking.id} className="card flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold" style={{ color: '#1a1a1a' }}>
                            {booking.service?.name || 'Jasa'}
                          </p>
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{ color: status.color, backgroundColor: status.bg }}
                          >
                            {status.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-1.5">
                          <span className="flex items-center gap-1 text-xs" style={{ color: '#5c5c5c' }}>
                            <Clock className="w-3 h-3" /> {booking.startTime} - {booking.endTime}
                          </span>
                          <span className="flex items-center gap-1 text-xs" style={{ color: '#5c5c5c' }}>
                            <Phone className="w-3 h-3" /> {booking.customerPhone}
                          </span>
                          <span className="flex items-center gap-1 text-xs" style={{ color: '#5c5c5c' }}>
                            <DollarSign className="w-3 h-3" /> Rp {Number(booking.totalAmount).toLocaleString('id-ID')}
                          </span>
                        </div>
                        {booking.notes && (
                          <p className="text-[11px] mt-1 truncate" style={{ color: '#9ca3af' }}>{booking.notes}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1.5 flex-shrink-0">
                        {booking.status === 'inquiry' && (
                          <button
                            onClick={() => updateStatus.mutate({ id: booking.id, status: 'confirmed' })}
                            disabled={updateStatus.isPending}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-green-600 hover:bg-green-700 transition-colors flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Konfirmasi
                          </button>
                        )}
                        {booking.status === 'inquiry' && (
                          <button
                            onClick={() => updateStatus.mutate({ id: booking.id, status: 'cancelled' })}
                            disabled={updateStatus.isPending}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium border hover:bg-red-50 transition-colors flex items-center gap-1"
                            style={{ borderColor: 'rgba(0,0,0,0.08)', color: '#ef4444' }}
                          >
                            <XCircle className="w-3 h-3" /> Batal
                          </button>
                        )}
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => updateStatus.mutate({ id: booking.id, status: 'completed' })}
                            disabled={updateStatus.isPending}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Selesai
                          </button>
                        )}
                        {(booking.status === 'confirmed' || booking.status === 'inquiry') && (
                          <button
                            onClick={() => updateStatus.mutate({ id: booking.id, status: 'no_show' })}
                            disabled={updateStatus.isPending}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium border hover:bg-gray-50 transition-colors flex items-center gap-1"
                            style={{ borderColor: 'rgba(0,0,0,0.08)', color: '#9ca3af' }}
                          >
                            <AlertCircle className="w-3 h-3" /> No Show
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
