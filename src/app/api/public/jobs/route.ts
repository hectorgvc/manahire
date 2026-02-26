import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()

    const { data: jobs, error } = await supabase
        .from('jobs')
        .select('id, title, department, type, modality, description, requirements, salary_range, created_at')
        .eq('status', 'Abierta')
        .order('created_at', { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
        success: true,
        data: jobs
    })
}
