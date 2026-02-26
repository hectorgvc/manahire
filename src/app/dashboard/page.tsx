import { createClient } from '@/lib/supabase/server'
import { Briefcase, Users, Search, TrendingUp, Clock, MapPin } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
    const supabase = await createClient()

    // Fetch some stats from Supabase
    const { count: jobsCount } = await supabase.from('jobs').select('*', { count: 'exact', head: true })
    const { count: candidatesCount } = await supabase.from('candidates').select('*', { count: 'exact', head: true })

    const stats = [
        { label: 'Vacantes Activas', value: jobsCount || 0, icon: Briefcase, color: 'text-blue-400' },
        { label: 'Candidatos Totales', value: candidatesCount || 0, icon: Users, color: 'text-indigo-400' },
        { label: 'En Proceso', value: 0, icon: Clock, color: 'text-amber-400' },
        { label: 'Match Promedio', value: '84%', icon: TrendingUp, color: 'text-emerald-400' },
    ]

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Panel Central</h1>
                    <p className="text-gray-400 mt-1">Bienvenido al centro de mando de Manahire.</p>
                </div>
                <Link href="/dashboard/vacantes" className="btn-primary">
                    Nueva Vacante
                </Link>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="glass-morphism p-6 flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                            <h3 className="text-2xl font-bold">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Jobs */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Vacantes Recientes</h2>
                        <Link href="/dashboard/vacantes" className="text-sm text-indigo-400 hover:underline">Ver todas</Link>
                    </div>
                    <div className="glass-morphism overflow-hidden">
                        {/* Componente de lista vendría aquí */}
                        <div className="p-12 text-center text-gray-500">
                            <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-10" />
                            <p>No hay vacantes activas en este momento.</p>
                        </div>
                    </div>
                </div>

                {/* Search & Connectors UI Mock */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Conectores de Búsqueda</h2>
                    <div className="glass-morphism p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold text-xs">in</div>
                                    <span className="text-sm font-medium">LinkedIn API</span>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 opacity-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-red-500 flex items-center justify-center font-bold text-xs">A</div>
                                    <span className="text-sm font-medium">Aldaba Connect</span>
                                </div>
                                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Pronto</span>
                            </div>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Búsqueda unificada..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                            />
                        </div>

                        <p className="text-[11px] text-gray-500 leading-relaxed text-center">
                            El motor unificado busca en tu base local y en las APIs externas autorizadas integrando los resultados.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
