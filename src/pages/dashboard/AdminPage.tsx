import { useState } from 'react'
import { trpc } from '@/providers/trpc'
import {
  ClipboardList,
  Package,
  Megaphone,
  Send,
  Loader2,
  Check,
  AlertTriangle,
  FileText,
  ChevronRight,
} from 'lucide-react'

const ORDER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Menunggu', color: '#d4a853' },
  paid: { label: 'Dibayar', color: '#22c55e' },
  processing: { label: 'Diproses', color: '#3b82f6' },
  shipped: { label: 'Dikirim', color: '#8b5cf6' },
  completed: { label: 'Selesai', color: '#16a34a' },
  cancelled: { label: 'Batal', color: '#ef4444' },
};

const PIPELINE_STEPS = [
  { key: 'pending', label: 'Menunggu' },
  { key: 'paid', label: 'Dibayar' },
  { key: 'processing', label: 'Diproses' },
  { key: 'shipped', label: 'Dikirim' },
  { key: 'completed', label: 'Selesai' },
];

export default function AdminPage() {
  const { data: pipeline } = trpc.admin.orderPipeline.useQuery();
  const { data: alerts } = trpc.admin.stockAlerts.useQuery();
  const utils = trpc.useUtils();

  const [activeTab, setActiveTab] = useState<'orders' | 'broadcast' | 'stock'>('orders');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);

  const updateStatus = trpc.order.updateStatus.useMutation({
    onSuccess: () => {
      utils.admin.orderPipeline.invalidate();
      utils.order.stats.invalidate();
    },
  });

  const generateInvoice = trpc.order.generateInvoice.useMutation({
    onSuccess: () => {
      utils.admin.orderPipeline.invalidate();
      setSelectedOrder(null);
    },
  });

  const sendBroadcast = trpc.admin.sendBroadcast.useMutation({
    onSuccess: (data) => {
      alert(data.message);
      setBroadcastMsg('');
    },
    onError: (err) => alert(err.message),
  });

  const TABS = [
    { id: 'orders' as const, label: 'Order Pipeline', icon: ClipboardList },
    { id: 'broadcast' as const, label: 'Broadcast', icon: Megaphone },
    { id: 'stock' as const, label: 'Stok Alert', icon: Package },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <ClipboardList className="w-6 h-6" style={{ color: '#d4754a' }} />
          Admin AI
        </h1>
        <p className="text-sm mt-1" style={{ color: '#5c5c5c' }}>Kelola order, broadcast promo, dan monitoring stok</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'text-white' : 'border'}`}
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

      {/* Orders Pipeline */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {PIPELINE_STEPS.map((step) => {
            const stepOrders = (pipeline as any)?.[step.key] || [];
            return (
              <div key={step.key} className="card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>
                    {step.label}
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: ORDER_STATUS_LABELS[step.key]?.color || '#5c5c5c' }}>
                      {stepOrders.length}
                    </span>
                  </h3>
                </div>
                {stepOrders.length === 0 ? (
                  <p className="text-xs py-2" style={{ color: '#5c5c5c' }}>Tidak ada order di tahap ini</p>
                ) : (
                  <div className="space-y-2">
                    {stepOrders.map((order: any) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-3 rounded-xl border cursor-pointer hover:bg-[#faf8f4] transition-colors"
                        style={{ borderColor: 'rgba(0,0,0,0.06)' }}
                        onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate" style={{ color: '#1a1a1a' }}>
                              {order.customerPhone}
                            </p>
                            {order.invoiceNumber && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">
                                {order.invoiceNumber}
                              </span>
                            )}
                          </div>
                          <p className="text-xs" style={{ color: '#5c5c5c' }}>
                            Rp {Number(order.totalAmount).toLocaleString('id-ID')} · {new Date(order.createdAt).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        <ChevronRight className={`w-4 h-4 transition-transform ${selectedOrder === order.id ? 'rotate-90' : ''}`} style={{ color: '#5c5c5c' }} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Order detail actions */}
                {selectedOrder && stepOrders.find((o: any) => o.id === selectedOrder) && (
                  <div className="mt-3 p-3 rounded-xl border space-y-2" style={{ borderColor: 'rgba(0,0,0,0.06)', backgroundColor: '#faf8f4' }}>
                    <p className="text-xs font-medium" style={{ color: '#1a1a1a' }}>Aksi Order #{selectedOrder}</p>
                    <div className="flex flex-wrap gap-2">
                      {step.key !== 'completed' && step.key !== 'cancelled' && (
                        <>
                          {step.key === 'pending' && (
                            <button
                              onClick={() => updateStatus.mutate({ id: selectedOrder, status: 'paid' })}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                            >
                              Tandai Dibayar
                            </button>
                          )}
                          {step.key === 'paid' && (
                            <button
                              onClick={() => updateStatus.mutate({ id: selectedOrder, status: 'processing' })}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                            >
                              Proses Packing
                            </button>
                          )}
                          {step.key === 'processing' && (
                            <button
                              onClick={() => updateStatus.mutate({ id: selectedOrder, status: 'shipped' })}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                            >
                              Tandai Dikirim
                            </button>
                          )}
                          {step.key === 'shipped' && (
                            <button
                              onClick={() => updateStatus.mutate({ id: selectedOrder, status: 'completed' })}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                            >
                              Selesai
                            </button>
                          )}
                        </>
                      )}
                      {!order.invoiceNumber && (
                        <button
                          onClick={() => generateInvoice.mutate({ orderId: selectedOrder })}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border hover:bg-white transition-colors flex items-center gap-1"
                          style={{ borderColor: 'rgba(0,0,0,0.08)', color: '#1a1a1a' }}
                        >
                          <FileText className="w-3 h-3" /> Buat Invoice
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Broadcast */}
      {activeTab === 'broadcast' && (
        <div className="card space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Megaphone className="w-5 h-5" style={{ color: '#d4754a' }} />
            <div>
              <h2 className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>Broadcast Promo</h2>
              <p className="text-xs" style={{ color: '#5c5c5c' }}>Kirim pesan promo ke semua customer via WhatsApp</p>
            </div>
          </div>
          <textarea
            value={broadcastMsg}
            onChange={(e) => setBroadcastMsg(e.target.value)}
            placeholder="Halo kak! Ada promo spesial hari ini..."
            rows={4}
            className="w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#d4754a] resize-none"
            style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: '#faf8f4' }}
          />
          <button
            onClick={() => {
              if (confirm(`Kirim broadcast ke semua customer?`)) {
                sendBroadcast.mutate({ message: broadcastMsg });
              }
            }}
            disabled={!broadcastMsg || sendBroadcast.isPending}
            className="btn-primary w-full justify-center py-3"
            style={{ opacity: !broadcastMsg || sendBroadcast.isPending ? 0.7 : 1 }}
          >
            {sendBroadcast.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim...</>
            ) : (
              <><Send className="w-4 h-4" /> Kirim Broadcast</>
            )}
          </button>
        </div>
      )}

      {/* Stock Alerts */}
      {activeTab === 'stock' && (
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5" style={{ color: '#d4754a' }} />
            <div>
              <h2 className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>Stok Menipis</h2>
              <p className="text-xs" style={{ color: '#5c5c5c' }}>Produk dengan stok ≤ 5 unit</p>
            </div>
          </div>
          {(alerts || []).length === 0 ? (
            <div className="text-center py-8">
              <Check className="w-10 h-10 mx-auto mb-2 text-green-600" style={{ opacity: 0.4 }} />
              <p className="text-sm" style={{ color: '#5c5c5c' }}>Semua stok aman! 🎉</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(alerts || []).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>{product.name}</p>
                    <p className="text-xs" style={{ color: '#5c5c5c' }}>{product.category || 'Tanpa kategori'}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${product.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    Stok: {product.stock}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
