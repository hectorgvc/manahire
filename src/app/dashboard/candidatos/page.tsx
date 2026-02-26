'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Mail, ExternalLink, Database, Globe, Loader2, AlertCircle, FileUp, Plus, X, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CandidatosPage() {
    const [candidates, setCandidates] = useState<any[]>([])
    const [externalResults, setExternalResults] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchingExternal, setSearchingExternal] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    // Modal & Form State
    const [showImportModal, setShowImportModal] = useState(false)
    const [isParsing, setIsParsing] = useState(false)
    const [uploadSuccess, setUploadSuccess] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        source: 'Interno',
        position_detected: '',
        skills: [] as string[],
        experience_years: 0,
    })

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

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setIsParsing(true)
        const uploadData = new FormData()
        uploadData.append('file', file)

        try {
            const res = await fetch('/api/parse-cv', {
                method: 'POST',
                body: uploadData
            })
            const result = await res.json()

            if (result.success) {
                setFormData({
                    ...formData,
                    full_name: result.data.full_name,
                    email: result.data.email,
                    phone: result.data.phone,
                    skills: result.data.skills,
                    position_detected: searchTerm || ''
                })
            }
        } catch (error) {
            console.error('Error al procesar CV:', error)
        } finally {
            setIsParsing(false)
        }
    }

    async function saveCandidate(e: React.FormEvent) {
        e.preventDefault()
        const { error } = await supabase.from('candidates').insert([formData])

        if (!error) {
            setUploadSuccess(true)
            setTimeout(() => {
                setShowImportModal(false)
                setUploadSuccess(false)
                fetchCandidates()
                setFormData({ full_name: '', email: '', phone: '', source: 'Interno', position_detected: '', skills: [], experience_years: 0 })
            }, 1500)
        }
    }

    const filteredInternal = candidates.filter(c =>
        c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.position_detected?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Gestión de Talento</h1>
                    <p className="text-gray-400 mt-1">Busca, importa y centraliza candidatos de cualquier fuente.</p>
                </div>
                <button
                    onClick={() => setShowImportModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <FileUp className="w-5 h-5" />
                    <span>Importar CV</span>
                </button>
            </header>

            {/* Unified Search Engine */}
            <div className="glass-morphism p-6 space-y-4 border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.05)]">
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar en base interna y portales externos..."
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
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-indigo-400">
                        <Database className="w-5 h-5" />
                        Base Manahire
                    </h2>
                    <div className="glass-morphism overflow-hidden">
                        <div className="max-h-[500px] overflow-y-auto divide-y divide-white/5">
                            {loading ? (
                                <div className="p-8 text-center text-gray-500">Cargando base...</div>
                            ) : filteredInternal.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">No hay coincidencias.</div>
                            ) : (
                                filteredInternal.map((c) => (
                                    <div key={c.id} className="p-4 hover:bg-white/5 transition-all group">
                                        <div className="flex justify-between">
                                            <div>
                                                <h3 className="font-bold text-white group-hover:text-indigo-400">{c.full_name}</h3>
                                                <p className="text-xs text-gray-400">{c.position_detected}</p>
                                            </div>
                                            <span className="text-[9px] bg-white/5 px-2 py-1 rounded text-gray-500 border border-white/5">{c.source.toUpperCase()}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                {/* Resultados Externos */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-blue-400">
                        <Globe className="w-5 h-5" />
                        Resultados Web
                    </h2>
                    <div className="glass-morphism overflow-hidden">
                        <div className="max-h-[500px] overflow-y-auto divide-y divide-white/5">
                            {searchingExternal ? (
                                <div className="p-12 flex flex-col items-center gap-3 text-gray-500">
                                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                                    <p className="text-sm">Rastreando portales...</p>
                                </div>
                            ) : externalResults.length === 0 ? (
                                <div className="p-12 text-center text-gray-500 opacity-50">
                                    <p className="text-sm">Realiza una búsqueda global para ver perfiles externos.</p>
                                </div>
                            ) : (
                                externalResults.map((res, i) => (
                                    <div key={i} className="p-4 hover:bg-white/5 transition-all group flex justify-between items-center">
                                        <div className="flex-1 pr-4">
                                            <h3 className="font-bold text-white text-sm line-clamp-1">{res.title}</h3>
                                            <p className="text-[10px] text-gray-500">{res.company} • {res.source}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setFormData({ ...formData, position_detected: res.title, source: res.source });
                                                    setShowImportModal(true);
                                                }}
                                                className="text-[10px] px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/20 transition-all font-bold uppercase tracking-wider"
                                            >
                                                Importar
                                            </button>
                                            <a href={res.link} target="_blank" className="p-1.5 bg-white/5 rounded-lg text-gray-400 hover:text-white">
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>
            </div>

            {/* Modal de Importación */}
            <AnimatePresence>
                {showImportModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            onClick={() => setShowImportModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-morphism w-full max-w-xl p-8 relative z-10 overflow-hidden"
                        >
                            {uploadSuccess ? (
                                <div className="py-20 text-center space-y-4">
                                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
                                    <h2 className="text-2xl font-bold text-white">¡Candidato Importado!</h2>
                                    <p className="text-gray-400">La información ha sido centralizada con éxito.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center mb-8">
                                        <h2 className="text-2xl font-bold gradient-text">Importar Nuevo Talento</h2>
                                        <button onClick={() => setShowImportModal(false)}><X className="text-gray-500 hover:text-white" /></button>
                                    </div>

                                    <div className="space-y-6">
                                        {/* File Upload Area */}
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-pointer group relative overflow-hidden"
                                        >
                                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf" />
                                            {isParsing ? (
                                                <div className="flex flex-col items-center gap-3">
                                                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                                                    <p className="text-sm text-gray-400">Analizando CV con IA...</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <FileUp className="w-10 h-10 mx-auto text-gray-500 group-hover:text-indigo-400 transition-all" />
                                                    <p className="text-sm font-medium text-gray-300">Suelte el PDF del CV aquí o haga clic para subir</p>
                                                    <p className="text-xs text-gray-500">Extracción automática de datos activada</p>
                                                </div>
                                            )}
                                        </div>

                                        <form onSubmit={saveCandidate} className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                            <div className="col-span-2 space-y-1">
                                                <label className="text-[10px] uppercase font-bold text-gray-500">Nombre Completo</label>
                                                <input required className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-bold text-gray-500">Email</label>
                                                <input className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:outline-none" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-bold text-gray-500">Teléfono</label>
                                                <input className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:outline-none" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                            </div>
                                            <div className="col-span-2 flex justify-end gap-3 pt-4">
                                                <button type="button" onClick={() => setShowImportModal(false)} className="px-6 py-2 text-sm text-gray-500">Cerrar</button>
                                                <button type="submit" className="btn-primary px-8 flex items-center gap-2">
                                                    <Plus className="w-4 h-4" /> Guardar Candidato
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
