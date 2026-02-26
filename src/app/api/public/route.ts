import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({
        message: "Manahire Public API",
        status: "active",
        auth: "required_for_internal_data",
        endpoints: {
            jobs: "/api/public/jobs"
        }
    })
}
