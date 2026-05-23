import { Link, useLocation, Outlet } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { trpc } from '@/providers/trpc'
import {
  LayoutDashboard,
  MessageCircle,
  BarChart3,
  Package,
  Brain,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Store,
} from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: MessageCircle, label: 'Chat', path: '/dashboard/chat' },
  { icon: BarChart3, label: 'Analisis', path: '/dashboard/analytics' },
  { icon: Package, label: 'Produk', path: '/dashboard/products' },
  { icon: Brain, label: 'AI Training', path: '/dashboard/ai-training' },
  { icon: Settings, label: 'Pengaturan', path: '/dashboard/settings' },
]

function PlanBadge({ plan }: { plan: string }) {
  const badgeClass = plan === 'free' ? 'badge-free' : plan === 'starter' ? 'badge-starter' : 'badge-pro';
  return <span className={badgeClass}>{plan.toUpperCase()}</span>;
}

export default function DashboardLayout() {
  const location = useLocation();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const { data: user } = trpc.user.me.useQuery();

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#faf8f4' }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col h-full border-r transition-all duration-300"
        style={{
          width: collapsed ? 72 : 260,
          backgroundColor: 'white',
          borderColor: 'rgba(0,0,0,0.06)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 h-16 border-b" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
          <Store className="w-7 h-7 flex-shrink-0" style={{ color: '#d4754a' }} />
          {!collapsed && (
            <span className="font-semibold text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1a1a1a' }}>
              UMKM-AI
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t space-y-2" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
          {!collapsed && user && (
            <div className="px-3 py-2 rounded-xl" style={{ backgroundColor: '#f0ece3' }}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white" style={{ backgroundColor: '#d4754a' }}>
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: '#1a1a1a' }}>{user.name || 'User'}</p>
                  <p className="text-[10px] truncate" style={{ color: '#5c5c5c' }}>{user.businessName || '-'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-1">
                <PlanBadge plan={user.plan || 'free'} />
              </div>
            </div>
          )}

          <button
            onClick={() => logout()}
            className="sidebar-link w-full"
            style={{ color: '#ef4444' }}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Keluar</span>}
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="sidebar-link w-full justify-center"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
