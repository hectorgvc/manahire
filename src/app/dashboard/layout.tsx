import { LogOut, Briefcase, Users, Search, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-[#0a0a0c]">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 flex flex-col">
                <div className="p-6">
                    <Link href="/dashboard" className="text-2xl font-bold gradient-text">Manahire</Link>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-gray-200 hover:bg-white/10 transition-all font-medium"
                    >
                        <LayoutDashboard className="w-5 h-5 text-indigo-400" />
                        <span>Dashboard</span>
                    </Link>
                    <Link
                        href="/dashboard/vacantes"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all font-medium"
                    >
                        <Briefcase className="w-5 h-5" />
                        <span>Vacantes</span>
                    </Link>
                    <Link
                        href="/dashboard/candidatos"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all font-medium"
                    >
                        <Users className="w-5 h-5" />
                        <span>Candidatos</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-medium">
                        <LogOut className="w-5 h-5" />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
