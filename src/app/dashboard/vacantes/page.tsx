'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search, Filter, Briefcase, MapPin, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function VacantesPage() {
    const [jobs, setJobs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const supabase = createClient()

    const [formData, setFormData] = useState({
        title: '',
        department: '',
        type: 'Tiempo completo',
        modality: 'Presencial',
        description: '',
        requirements: '',
        salary_range: '',
        status: 'Abierta'
    })

    useEffect(() => { fetchJobs() }, [])

    async function fetchJobs() {
        setLoading(true)
        const { data } = await supabase.from('jobs').select('*').order('created_at', { ascending: false })
        if (data) setJobs(data)
        setLoading(false)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const { error } = await supabase.from('jobs').insert([formData])
        if (!error) {
            setShowModal(false)
            fetchJobs()
            setFormData({ title: '', department: '', type: 'Tiempo completo', modality: 'Presencial', description: '', requirements: '', salary_range: '', status: 'Abierta' })
        }
    }

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Gestión de Vacantes</h1>
                    <p className="text-gray-400 mt-1">Crea y administra las ofertas laborales.</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Nueva Vacante
                </button>
            </header>

            <div className="flex gap-4 items-center bg-white/5 p-4 rounded-xl border border-white/5">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="text" placeholder="Buscar..." className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                    {loading ? (
                        <div className="col-span-full py-20 text-center text-gray-500">Cargando...</div>
                    ) : jobs.length === 0 ? (
                        <div className="col-span-full py-20 text-center glass-morphism">
                            <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-10" />
                            <p className="text-gray-400">No hay vacantes creadas.</p>
                        </div>
                    ) : (
                        jobs.map((job) => (
                            <motion.div key={job.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-morphism p-6 space-y-4">
                                <div className="flex justify-between">
                                    <h3 className="text-xl font-bold">{job.title}</h3>
                                    <span className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 text-[10px] uppercase font-bold">{job.status}</span>
                                </div>
                                <p className="text-gray-400 text-sm">{job.department}</p>
                                <div className="flex gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {job.type}</span>
                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.modality}</span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)} />
                    <div className="glass-morphism w-full max-w-2xl p-8 relative z-10 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6">Nueva Vacante</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                            <input className="col-span-2 bg-white/5 border border-white/10 p-3 rounded" placeholder="Título" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            <input className="bg-white/5 border border-white/10 p-3 rounded" placeholder="Departamento" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} />
                            <select className="bg-white/5 border border-white/10 p-3 rounded" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                <option className="bg-black">Tiempo completo</option><option className="bg-black">Medio tiempo</option>
                            </select>
                            <textarea className="col-span-2 bg-white/5 border border-white/10 p-3 rounded" placeholder="Descripción" rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            <textarea className="col-span-2 bg-white/5 border border-white/10 p-3 rounded" placeholder="Requisitos" rows={3} value={formData.requirements} onChange={e => setFormData({ ...formData, requirements: e.target.value })} />
                            <button type="submit" className="col-span-2 btn-primary py-3">Publicar</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
