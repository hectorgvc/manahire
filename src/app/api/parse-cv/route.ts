import { NextResponse } from 'next/server'
const pdf = require('pdf-parse');

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No se subió ningún archivo' }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const data = await pdf(buffer)
        const text = data.text

        // Intelligent Extraction (Basic Heuristics/Regex)
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
        const phoneRegex = /(\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/

        const emailMatch = text.match(emailRegex)
        const phoneMatch = text.match(phoneRegex)

        // Try to guess Name (First line usually)
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2)
        const guessedName = lines[0] || 'Candidato Desconocido'

        // Simple Skill Extraction
        const keywords = ['React', 'Node', 'Python', 'Java', 'SQL', 'Docker', 'AWS', 'Figma', 'UI/UX', 'Excel', 'Ventas']
        const skillsFound = keywords.filter(k => text.toLowerCase().includes(k.toLowerCase()))

        return NextResponse.json({
            success: true,
            data: {
                full_name: guessedName,
                email: emailMatch ? emailMatch[0] : '',
                phone: phoneMatch ? phoneMatch[0] : '',
                skills: skillsFound,
                raw_text: text.substring(0, 1000) // snippet
            }
        })

    } catch (error: any) {
        console.error('Error parseando PDF:', error)
        return NextResponse.json({ error: 'Error al procesar el archivo' }, { status: 500 })
    }
}
