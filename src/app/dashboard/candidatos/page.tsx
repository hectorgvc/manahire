'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Mail, ExternalLink, Database, Globe, Loader2, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CandidatosPage() {
    const [candidates, setCandidates] = useState<any[]>([])
    const [externalResults, setExternalResults] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchingExternal, setSearchingExternal] = useState(false)
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

    async function handleUnifiedSearch() {
        if (!searchTerm.trim()) return

        setSearchingExternal(true)
        setExternalResults([])

        try {
            // Buscamos en ambos portales simultáneamente a través de nuestra API proxy
            const [resEmpleos, resMiFuturo] = await Promise.all([
                fetch(`/api/external-search?q=${encodeURIComponent(searchTerm)}&site=empleos`).then(r => r.json()),
                fetch(`/api/external-search?q=${encodeURIComponent(searchTerm)}&site=mifuturo`).then(r => r.json())
            ])

            let combined: any[] = []
            if (resEmpleos.success) combined = [...combined, ...resEmpleos.data]
            if (resMiFuturo.success) combined = [...combined, ...resMiFuturo.data]

            setExternalResults(combined)
        } catch (error) {
            console.error('Error en búsqueda externa:', error)
        } finally {
            setSearchingExternal(false)
        }
    }

    const filteredInternal = candidates.filter(c =>
        c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.position_detected?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.skills?.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Búsqueda Unificada de Talento</h1>
                    <p className="text-gray-400 mt-1">Consulta base interna y portales externos en un solo lugar.</p>
                </div>
            </header>

            {/* Unified Search Engine */}
            <div className="glass-morphism p-6 space-y-4 border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.05)]">
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Escribe un puesto o habilidad para buscar en toda la red..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleUnifiedSearch()}
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                        />
                    </div>
                    <button
                        onClick={handleUnifiedSearch}
                        disabled={searchingExternal}
                        className="btn-primary px-8 flex items-center gap-2"
                    >
                        {searchingExternal ? <Loader2 className="w-5 h-5 animate-spin" /> : <Globe className="w-5 h-5" />}
                        <span>Búsqueda Global</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Resultados Internos */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Database className="w-5 h-5 text-indigo-400" />
                        Base Manahire
                    </h2>
                    <div className="glass-morphism overflow-hidden">
                        <div className="max-h-[500px] overflow-y-auto">
                            {loading ? (
                                <div className="p-8 text-center text-gray-500">Cargando base de datos...</div>
                            ) : filteredInternal.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">No hay coincidencias internas.</div>
                            ) : (
                                filteredInternal.map((c) => (
                                    <div key={c.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-all group">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-white group-hover:text-indigo-400">{c.full_name}</h3>
                                                <p className="text-xs text-indigo-300/70 uppercase tracking-tighter">{c.position_detected}</p>
                                            </div>
                                            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20">INTERNO</span>
                                        </div>
                                        <div className="mt-3 flex gap-2">
                                            {c.skills?.slice(0, 3).map((s: string, i: number) => (
                                                <span key={i} className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-400">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                {/* Resultados Externos */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-400" />
                        Portales Externos
                    </h2>
                    <div className="glass-morphism overflow-hidden">
                        <div className="max-h-[500px] overflow-y-auto">
                            {searchingExternal ? (
                                <div className="p-12 flex flex-col items-center gap-3 text-gray-500">
                                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                                    <p className="text-sm">Rastreando Empleos.net y Mi Futuro Empleo...</p>
                                </div>
                            ) : externalResults.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-20" />
                                    <p className="text-sm">Inicia una búsqueda global para ver resultados externos.</p>
                                </div>
                            ) : (
                                externalResults.map((res, i) => (
                                    <div key={i} className="p-4 border-b border-white/5 hover:bg-white/5 transition-all group">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 pr-4">
                                                <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-blue-400">{res.title}</h3>
                                                <p className="text-xs text-gray-400 mt-1">{res.company}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${res.source === 'Empleos.net' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                    }`}>
                                                    {res.source.toUpperCase()}
                                                </span>
                                                <a
                                                    href={res.link}
                                                    target="_blank"
                                                    className="p-1.5 bg-white/5 rounded-lg text-gray-400 hover:text-white hover:bg-indigo-500 transition-all"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
