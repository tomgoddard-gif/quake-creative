import Link from 'next/link'
import { logout } from '@/lib/auth'
import {
  Lightbulb,
  ClipboardList,
  FolderOpen,
  Library,
  Users,
  BarChart2,
  LogOut,
  Zap,
} from 'lucide-react'

const mainNav = [
  { href: '/ideas',      label: 'Ideas',      icon: Lightbulb },
  { href: '/planning',   label: 'Planning',   icon: ClipboardList },
  { href: '/production', label: 'Production', icon: FolderOpen },
]

const secondaryNav = [
  { href: '/library',     label: 'Archive',     icon: Library },
  { href: '/personas',    label: 'Personas',    icon: Users },
  { href: '/performance', label: 'Performance', icon: BarChart2 },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="flex w-52 flex-col border-r border-border bg-card/50 shrink-0">
        <div className="flex items-center gap-2.5 px-4 py-5 border-b border-border">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--quake)]/20">
            <Zap className="h-4 w-4 text-[var(--quake)]" />
          </div>
          <div>
            <p className="text-xs font-semibold leading-none">Quake Creative</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Accelerate</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-4">
          <div className="space-y-0.5">
            {mainNav.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>

          <div>
            <p className="px-3 mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
              More
            </p>
            <div className="space-y-0.5">
              {secondaryNav.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className="border-t border-border p-2">
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
