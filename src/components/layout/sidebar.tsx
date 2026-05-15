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
  Settings
} from 'lucide-react'

export function Sidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  if (!session) return null

  const navItems = [
    { name: 'Home', href: '/employee', icon: Home },
    { name: 'My team', href: '/employee/team', icon: Users },
    { name: '1:1s', href: '/employee/1-1s', icon: MessageSquare },
    { name: 'Feedback', href: '/employee/feedback', icon: MessageSquare },
    { name: 'Updates', href: '/employee/updates', icon: TrendingUp },
    { name: 'Grow', href: '/employee/grow', icon: Award },
    { name: 'Goals', href: '/employee', icon: Target },
  ]

  return (
    <aside className="w-64 flex-shrink-0 bg-[#2c2c38] text-gray-300 flex flex-col h-full border-r border-[#1e1e26]">
      <div className="p-6 flex items-center gap-3 border-b border-[#3f3f4e]">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)] border border-white/10 overflow-hidden">
          <Image src="/logo.png" alt="Lumina Logo" width={32} height={32} className="object-cover" />
        </div>
        <span className="font-heading text-xl font-bold tracking-tight text-white">
          Lumina
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.name === 'Goals' && pathname === '/employee')
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#3f3f4e] text-white'
                    : 'text-gray-400 hover:bg-[#3f3f4e]/50 hover:text-gray-200'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-[#3f3f4e]">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
             {session.user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium text-white truncate">{session.user.name}</span>
            <span className="text-xs text-gray-500 truncate">{session.user.role}</span>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full mt-2 flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:bg-[#3f3f4e]/50 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
