'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { APP_LOGO_URL } from '@/lib/constants'
import {
  LayoutDashboard, ShoppingCart, Package, Users, BarChart3,
  Settings, ChefHat, Table2, ClipboardList, Boxes, Truck,
  Receipt, DollarSign, UserCog, Shield, X, Tag,
  TrendingUp, Building2
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const navGroups = [
  {
    group: 'Main',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'POS Terminal', href: '/pos', icon: ShoppingCart, badge: 'POS' },
    ],
  },
  {
    group: 'Sales',
    items: [
      { label: 'Orders', href: '/orders', icon: ClipboardList },
      { label: 'Sales History', href: '/sales', icon: Receipt },
    ],
  },
  {
    group: 'Catalog',
    items: [
      { label: 'Products', href: '/products', icon: Package },
      { label: 'Categories', href: '/categories', icon: Tag },
      { label: 'Inventory', href: '/inventory', icon: Boxes },
    ],
  },
  {
    group: 'People',
    items: [
      { label: 'Customers', href: '/customers', icon: Users },
      { label: 'Employees', href: '/employees', icon: UserCog },
      { label: 'Suppliers', href: '/suppliers', icon: Truck },
    ],
  },
  {
    group: 'Finance',
    items: [
      { label: 'Purchases', href: '/purchases', icon: DollarSign },
      { label: 'Expenses', href: '/expenses', icon: TrendingUp },
      { label: 'Reports', href: '/reports', icon: BarChart3 },
    ],
  },
  {
    group: 'Restaurant',
    items: [
      { label: 'Tables', href: '/restaurant/tables', icon: Table2 },
      { label: 'Kitchen Display', href: '/restaurant/kitchen', icon: ChefHat },
    ],
  },
  {
    group: 'Admin',
    items: [
      { label: 'Branches', href: '/branches', icon: Building2 },
      { label: 'Settings', href: '/settings', icon: Settings },
      { label: 'Audit Logs', href: '/audit', icon: Shield },
    ],
  },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white flex flex-col transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 overflow-hidden rounded-lg bg-black/20">
              <Image
                src={APP_LOGO_URL}
                alt="Softzeno logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
                priority
              />
            </div>
            <span className="font-bold text-lg">Softzeno POS</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((group) => (
            <div key={group.group}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
                {group.group}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        )}
                        onClick={onClose}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        {'badge' in item && item.badge && (
                          <Badge className="bg-indigo-500 text-white text-xs py-0 px-1.5">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User profile at bottom */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-indigo-500 text-white text-xs">
                {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name ?? 'User'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.role ?? 'Staff'}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white text-xs"
              onClick={logout}
            >
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
