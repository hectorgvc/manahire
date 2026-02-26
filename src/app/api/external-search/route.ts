import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import axios from 'axios'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const site = searchParams.get('site')

    if (!query) return NextResponse.json({ error: 'Falta parámetro de búsqueda' }, { status: 400 })

    try {
        if (site === 'empleos') {
            return await searchEmpleosNet(query)
        } else if (site === 'mifuturo') {
            return await searchMiFuturo(query)
        }

        return NextResponse.json({ error: 'Sitio no soportado' }, { status: 400 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

async function searchEmpleosNet(query: string) {
    const url = `https://empleos.net/buscar_vacantes.php?Claves=${encodeURIComponent(query)}&Area=&Pais=6`
    const { data } = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    })

    const $ = cheerio.load(data)
    const results: any[] = []

    $('.g-brd-around.g-brd-gray-light-v4').each((_, el) => {
        const titleLink = $(el).find('a.u-link-v5.color-gray-dark-v1, a.u-link-v5.fs-16.fw-8').first()
        const title = titleLink.text().trim()
        const href = titleLink.attr('href')
        const link = href ? (href.startsWith('http') ? href : 'https://empleos.net/' + href) : '#'
        const company = $(el).find('a.u-link-v5.color-primary--hover').first().text().trim()

        if (title) {
            results.push({
                title,
                link,
                company: company || 'No especificada',
                source: 'Empleos.net',
                type: 'Externa'
            })
        }
    })

    return NextResponse.json({ success: true, data: results })
}

async function searchMiFuturo(query: string) {
    const slug = query.toLowerCase().trim().replace(/\s+/g, '-')
    const url = `https://do.mifuturoempleo.com/empleos/de-${slug}`

    const { data } = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/4.0 (compatible; MSIE 6.1; Windows XP)'
        }
    })

    const $ = cheerio.load(data)
    const results: any[] = []

    $('a[href*="/oferta-de-empleo/"]').each((_, el) => {
        const title = $(el).find('h2').text().trim()
        const company = $(el).find('p').first().text().trim()
        const href = $(el).attr('href')
        const link = href ? (href.startsWith('http') ? href : 'https://do.mifuturoempleo.com' + href) : '#'

        if (title) {
            results.push({
                title,
                link,
                company,
                source: 'Mi Futuro Empleo',
                type: 'Externa'
            })
        }
    })

    return NextResponse.json({ success: true, data: results })
}
