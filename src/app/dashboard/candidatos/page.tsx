'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, UserPlus, Filter, Mail, Phone, ExternalLink, Database, Globe } from 'lucide-react'
import { motion } from 'framer-motion'

export default function CandidatosPage() {
    const [candidates, setCandidates] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const supabase = createClient()

    useEffect(() => {
        fetchCandidates()
    }, [])

    async function fetchCandidates() {
        setLoading(true)
        const { data } = await supabase
            .from('candidates')
            .select('*')
            .order('created_at', { ascending: false })

        if (data) setCandidates(data)
        setLoading(false)
    }

    const filteredCandidates = candidates.filter(c =>
        c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.position_detected?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.skills?.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Base de Candidatos</h1>
                    <p className="text-gray-400 mt-1">Gestión unificada de talento interno y externo.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/10 transition-all flex items-center gap-2">
                        <Database className="w-4 h-4 text-indigo-400" />
                        Importar CSV/PDF
                    </button>
                </div>
            </header>

            {/* Unified Search Engine */}
            <div className="glass-morphism p-6 space-y-4 border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.05)]">
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Búsqueda Inteligente: 'Frontend React con 3 años de experiencia'..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                        />
                    </div>
                    <button className="btn-primary px-8">Buscar</button>
                </div>
                <div className="flex gap-4 text-xs text-gray-500 items-center">
                    <span>Fuentes activas:</span>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Base Interna
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        LinkedIn (API)
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-500/10 text-gray-500 rounded-md border border-gray-500/20 grayscale">
                        Aldaba
                    </div>
                </div>
            </div>

            {/* Candidates List/Table */}
            <div className="glass-morphism overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="p-4 text-sm font-semibold text-gray-400">Candidato</th>
                            <th className="p-4 text-sm font-semibold text-gray-400">Puesto / Perfil</th>
                            <th className="p-4 text-sm font-semibold text-gray-400">Fuente</th>
                            <th className="p-4 text-sm font-semibold text-gray-400">Habilidades</th>
                            <th className="p-4 text-sm font-semibold text-gray-400 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan={5} className="p-12 text-center text-gray-500">Cargando talento...</td></tr>
                        ) : filteredCandidates.length === 0 ? (
                            <tr><td colSpan={5} className="p-12 text-center text-gray-500">No se encontraron candidatos.</td></tr>
                        ) : (
                            filteredCandidates.map((c) => (
                                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="p-4">
                                        <div className="font-bold text-white group-hover:text-indigo-400 transition-colors">{c.full_name}</div>
                                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                            <Mail className="w-3 h-3" /> {c.email}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-300">
                                        {c.position_detected || 'No detectado'}
                                        <div className="text-[10px] text-gray-500 mt-1">{c.experience_years ? `${c.experience_years} años de exp.` : 'Exp. no especificada'}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${c.source === 'LinkedIn' ? 'bg-blue-500/10 text-blue-400' :
                                                c.source === 'Aldaba' ? 'bg-red-500/10 text-red-400' :
                                                    'bg-indigo-500/10 text-indigo-400'
                                            }`}>
                                            {c.source}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1">
                                            {c.skills?.slice(0, 3).map((s: string, i: number) => (
                                                <span key={i} className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-gray-400">
                                                    {s}
                                                </span>
                                            ))}
                                            {c.skills?.length > 3 && <span className="text-[10px] text-gray-500">+{c.skills.length - 3}</span>}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-all">
                                            <ExternalLink className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
