import Link from 'next/link'
import { logout } from '@/lib/auth'
import { FileText, LogOut, Zap } from 'lucide-react'

const navItems = [
  { href: '/briefs', label: 'Briefs', icon: FileText },
]

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="flex w-56 flex-col border-r border-border bg-card/50 shrink-0">
        <div className="flex items-center gap-2.5 px-4 py-5 border-b border-border">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--quake)]/20">
            <Zap className="h-4 w-4 text-[var(--quake)]" />
          </div>
          <div>
            <p className="text-xs font-semibold leading-none">Quake Creative</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Client Portal</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-0.5">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
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
