'use client'

import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Users,
  MessageSquare,
  TrendingUp,
  Target,
  Award,
  LogOut,
  Settings,
  AlertCircle,
  ChevronRight,
  Activity,
  Clock
} from 'lucide-react'
import { ModeToggle } from './mode-toggle'

export function Sidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  if (!session) return null

  const isManager = session.user.role === 'MANAGER'
  const isAdmin = session.user.role === 'ADMIN'

  const navItems = [
    { name: 'Home', href: isManager ? '/manager' : '/employee', icon: Home },
    { name: 'Goals', href: '/employee/goals', icon: Target },
    { name: 'Updates', href: '/employee/updates', icon: Activity },
    { name: '1:1s', href: '/employee/1-1s', icon: MessageSquare },
    { name: 'Feedback', href: '/employee/feedback', icon: MessageSquare },
    { name: 'My Team', href: '/employee/team', icon: Users },
    { name: 'Growth', href: '/employee/grow', icon: TrendingUp },
    { name: 'Reviews', href: '/employee/reviews', icon: Award },
    { name: 'PIPs', href: '/employee/pips', icon: AlertCircle },
  ]

  if (isManager) {
    navItems.push({ name: 'Talent Grid', href: '/employee/talent', icon: Users })
  }

  if (isAdmin) {
    navItems.push(
      { name: 'Admin Panel', href: '/admin', icon: Settings },
      { name: 'Reports', href: '/admin/reports', icon: Activity },
      { name: 'System Logs', href: '/admin/logs', icon: AlertCircle }
    )
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full shadow-sm transition-colors duration-300">
      {/* Logo Section */}
      <div className="p-6 flex items-center gap-4 border-b border-slate-50 dark:border-slate-900">
        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <Image src="/logo.png" alt="Lumina Logo" width={56} height={56} className="object-contain" />
        </div>
        <span className="font-heading text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Lumina
        </span>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-4 h-4 transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                  {item.name}
                </div>
                {isActive && <ChevronRight className="w-3 h-3 text-indigo-400" />}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer / User Profile */}
      <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4 px-3">
           <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Appearance</span>
           <ModeToggle />
        </div>
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-black shadow-sm border-2 border-white dark:border-slate-800">
             {session.user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">{session.user.name}</span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">{session.user.role}</span>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-400 dark:text-slate-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
