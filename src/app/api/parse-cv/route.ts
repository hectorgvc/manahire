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
        // Email más permisivo
        const emailRegex = /[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}/;
        // Teléfono más permisivo (acepta formatos como 15-1234-5678, +1 809 555 5555, etc)
        const phoneRegex = /(\+?\d{1,4}[\s-]?)?(\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}/;

        const emailMatch = text.match(emailRegex)
        const phoneMatch = text.match(phoneRegex)

        // Limpiar el texto de excesivos saltos de línea y espacios
        const cleanText = text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();

        console.log("--- TEXTO EXTRAÍDO DEL PDF ---");
        console.log(cleanText.substring(0, 500) + "..."); // Solo logear los primeros 500 caracteres para debug
        console.log("------------------------------");

        // Try to guess Name (First line usually, or finding capitalized words)
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2 && !l.includes('@') && !l.match(/\d/))
        const guessedName = lines.length > 0 ? lines[0] : 'Candidato Desconocido'

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
