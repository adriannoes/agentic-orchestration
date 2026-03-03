import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const { url, key } = await request.json()

    // Use provided credentials or env vars
    const supabaseUrl = url || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = key || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing Supabase URL or API key",
        },
        { status: 400 },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const requiredTables = [
      "profiles",
      "workspaces",
      "workspace_members",
      "agents",
      "workflows",
      "workflow_nodes",
      "workflow_connections",
      "workflow_executions",
      "execution_logs",
      "runs",
      "connectors",
      "connections",
      "mcp_servers",
    ]

    const tablesFound: string[] = []
    const tablesMissing: string[] = []

    // Test each table
    for (const table of requiredTables) {
      const { error } = await supabase.from(table).select("count").limit(0)
      if (error) {
        tablesMissing.push(table)
      } else {
        tablesFound.push(table)
      }
    }

    // Check connection validity
    const connectionValid = tablesFound.length > 0

    // Check if auth is enabled
    let authEnabled = false
    try {
      const { data } = await supabase.auth.getSession()
      authEnabled = true
    } catch {
      authEnabled = false
    }

    // Determine success
    const success = tablesMissing.length === 0 && connectionValid

    return NextResponse.json({
      success,
      message: success
        ? "All tables found! Database is fully configured."
        : tablesMissing.length === requiredTables.length
          ? "No tables found. Please run the SQL setup script."
          : `${tablesMissing.length} table(s) missing. Please run the complete SQL setup script.`,
      details: {
        tablesFound,
        tablesMissing,
        connectionValid,
        authEnabled,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Connection failed: " + error.message,
        details: {
          error: error.message,
          hint: "Check your Supabase URL and API key",
        },
      },
      { status: 500 },
    )
  }
}
