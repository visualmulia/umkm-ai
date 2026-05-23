import { trpc } from '@/providers/trpc'
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  ShoppingCart,
  MessageCircle,
  DollarSign,
} from 'lucide-react'

function StatBox({ icon: Icon, label, value, change, changeType }: {
  icon: React.ElementType; label: string; value: string; change?: number; changeType?: 'up' | 'down'
}) {
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(212,117,74,0.1)' }}>
          <Icon className="w-4.5 h-4.5" style={{ color: '#d4754a' }} />
        </div>
        <p className="text-sm" style={{ color: '#5c5c5c' }}>{label}</p>
      </div>
      <p className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1a1a1a' }}>{value}</p>
      {change !== undefined && (
        <div className={`flex items-center gap-1 mt-1 text-xs ${changeType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {changeType === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{change > 0 ? '+' : ''}{change}% vs bulan lalu</span>
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: analytics } = trpc.analytics.dashboard.useQuery();
  const { data: orderStats } = trpc.order.stats.useQuery();

  // Weekly chart data
  const dailyData = analytics?.dailyChats || {};
  const maxVal = Math.max(...Object.values(dailyData), 1);
  const days = Object.entries(dailyData);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Analisis</h1>
        <p className="text-sm" style={{ color: '#5c5c5c' }}>Lihat performa bisnismu</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatBox
          icon={MessageCircle}
          label="Total Chat"
          value={String(analytics?.totalChats ?? 0)}
          change={analytics?.monthlyGrowth}
          changeType="up"
        />
        <StatBox
          icon={BarChart3}
          label="AI Handle Rate"
          value={`${analytics?.aiPercentage ?? 0}%`}
          change={5}
          changeType="up"
        />
        <StatBox
          icon={ShoppingCart}
          label="Total Order"
          value={String(orderStats?.totalOrders ?? 0)}
          change={analytics?.monthlyGrowth}
          changeType="up"
        />
        <StatBox
          icon={DollarSign}
          label="Total Revenue"
          value={`Rp ${(orderStats?.totalRevenue ?? 0).toLocaleString('id-ID')}`}
          change={analytics?.monthlyGrowth}
          changeType={analytics?.monthlyGrowth && analytics.monthlyGrowth >= 0 ? 'up' : 'down'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Chat Chart */}
        <div className="card">
          <h2 className="font-semibold mb-4" style={{ color: '#1a1a1a' }}>Chat 7 Hari Terakhir</h2>
          <div className="flex items-end gap-2 h-48">
            {days.map(([date, count]) => {
              const dayName = new Date(date).toLocaleDateString('id-ID', { weekday: 'short' });
              const height = maxVal > 0 ? (count / maxVal) * 100 : 0;
              return (
                <div key={date} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-lg transition-all duration-300"
                    style={{
                      height: `${Math.max(height, 4)}%`,
                      backgroundColor: '#d4754a',
                      opacity: 0.7 + (height / 200),
                    }}
                  />
                  <span className="text-[10px]" style={{ color: '#5c5c5c' }}>{dayName}</span>
                  <span className="text-[10px] font-medium" style={{ color: '#1a1a1a' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="card">
          <h2 className="font-semibold mb-4" style={{ color: '#1a1a1a' }}>Produk Terlaris</h2>
          <div className="space-y-3">
            {(analytics?.topProducts || []).length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-10 h-10 mx-auto mb-2" style={{ color: '#d4a853', opacity: 0.4 }} />
                <p className="text-sm" style={{ color: '#5c5c5c' }}>Belum ada data penjualan</p>
              </div>
            ) : (
              (analytics?.topProducts || []).map((product, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: i === 0 ? '#d4a853' : i === 1 ? '#9ca3af' : '#d4754a' }}>
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>{product.name}</p>
                    <p className="text-xs" style={{ color: '#5c5c5c' }}>{product.count} terjual</p>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: '#d4754a' }}>
                    Rp {product.revenue.toLocaleString('id-ID')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
