import { trpc } from '@/providers/trpc'
import {
  MessageCircle,
  ShoppingCart,
  TrendingUp,
  Bot,
  ArrowRight,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router'

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string
}) {
  return (
    <div className="card card-hover">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1a1a1a' }}>{value}</p>
      <p className="text-sm mt-0.5" style={{ color: '#5c5c5c' }}>{label}</p>
      {sub && <p className="text-xs mt-1" style={{ color: '#d4754a' }}>{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { data: user } = trpc.user.me.useQuery();
  const { data: stats } = trpc.user.stats.useQuery(undefined, { enabled: !!user });
  const { data: chatStats } = trpc.chat.stats.useQuery(undefined, { enabled: !!user });
  const { data: orderStats } = trpc.order.stats.useQuery(undefined, { enabled: !!user });
  const { data: analytics } = trpc.analytics.dashboard.useQuery(undefined, { enabled: !!user });

  const onboardingStep = user?.onboardingStep ?? 0;
  const showOnboarding = onboardingStep < 3;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1a1a1a' }}>
          Halo, {user?.name || 'UMKM'}! 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: '#5c5c5c' }}>
          {user?.businessName ? `${user.businessName} — ` : ''}Ini ringkasan bisnismu hari ini.
        </p>
      </div>

      {/* Onboarding Banner */}
      {showOnboarding && (
        <div className="mb-6 p-4 rounded-xl flex items-center justify-between" style={{ backgroundColor: '#d4754a', color: 'white' }}>
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5" />
            <div>
              <p className="font-semibold text-sm">Setup belum selesai — AI-mu belum aktif 100%</p>
              <p className="text-xs opacity-80">Lanjutkan onboarding untuk aktifkan semua fitur</p>
            </div>
          </div>
          <Link
            to="/dashboard/settings"
            className="flex items-center gap-1 text-sm font-medium px-4 py-2 rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            Lanjutkan <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={MessageCircle}
          label="Chat Aktif"
          value={chatStats?.total ?? 0}
          sub={chatStats?.unread ? `${chatStats.unread} belum dibaca` : undefined}
          color="#d4754a"
        />
        <StatCard
          icon={Bot}
          label="AI Handle Rate"
          value={`${analytics?.aiPercentage ?? 0}%`}
          sub="dari semua chat"
          color="#22c55e"
        />
        <StatCard
          icon={ShoppingCart}
          label="Order Hari Ini"
          value={orderStats?.todayOrders ?? 0}
          sub={orderStats?.todayRevenue ? `Rp ${orderStats.todayRevenue.toLocaleString('id-ID')}` : undefined}
          color="#3b82f6"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Revenue"
          value={`Rp ${(orderStats?.totalRevenue ?? 0).toLocaleString('id-ID')}`}
          sub={analytics?.monthlyGrowth ? `${analytics.monthlyGrowth > 0 ? '+' : ''}${analytics.monthlyGrowth}% vs bulan lalu` : undefined}
          color="#d4a853"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Chats */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold" style={{ color: '#1a1a1a' }}>Chat Terbaru</h2>
            <Link to="/dashboard/chat" className="text-sm font-medium flex items-center gap-1" style={{ color: '#d4754a' }}>
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white" style={{ backgroundColor: '#d4754a' }}>
                  C{i}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>Customer {i}</p>
                  <p className="text-xs truncate" style={{ color: '#5c5c5c' }}>Halo, mau tanya tentang produk...</p>
                </div>
                <span className="text-xs" style={{ color: '#5c5c5c' }}>{i}m ago</span>
              </div>
            ))}
          </div>
        </div>

        {/* Plan Info */}
        <div className="card">
          <h2 className="font-semibold mb-4" style={{ color: '#1a1a1a' }}>Plan Aktif</h2>
          <div className="text-center py-4">
            <div className="inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-3"
              style={{
                backgroundColor: user?.plan === 'pro' ? '#1a1a1a' : user?.plan === 'starter' ? '#d4754a' : '#d4a853',
                color: user?.plan === 'free' ? '#1a1a1a' : 'white',
              }}>
              {(user?.plan || 'FREE').toUpperCase()}
            </div>
            <p className="text-sm" style={{ color: '#5c5c5c' }}>
              {user?.plan === 'pro' ? 'Unlimited chat + Semua AI Agents' :
               user?.plan === 'starter' ? '300 chat/bulan + 2 AI Agents' :
               '50 chat/bulan + CS Bot'}
            </p>
            {user?.plan !== 'pro' && (
              <Link
                to="/dashboard/settings"
                className="btn-primary mt-4 text-xs"
              >
                <Zap className="w-3.5 h-3.5" /> Upgrade
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
