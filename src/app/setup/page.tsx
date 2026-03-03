"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Loader2, Database, Link2, AlertTriangle } from "lucide-react"

interface TestResult {
  success: boolean
  message: string
  details?: {
    tablesFound: string[]
    tablesMissing: string[]
    connectionValid: boolean
    authEnabled: boolean
  }
}

export default function SetupPage() {
  const [supabaseUrl, setSupabaseUrl] = useState("")
  const [supabaseKey, setSupabaseKey] = useState("")
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [envConfigured, setEnvConfigured] = useState(false)

  useEffect(() => {
    // Check if env vars are configured
    const checkEnv = async () => {
      try {
        const response = await fetch("/api/setup/check-env")
        const data = await response.json()
        setEnvConfigured(data.configured)
        if (data.configured) {
          setSupabaseUrl(data.url || "")
        }
      } catch (error) {
        console.error("[v0] Error checking env:", error)
      }
    }
    checkEnv()
  }, [])

  const testConnection = async () => {
    setTesting(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/setup/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: supabaseUrl,
          key: supabaseKey,
        }),
      })

      const data = await response.json()
      setTestResult(data)
    } catch (error: any) {
      setTestResult({
        success: false,
        message: "Failed to connect: " + error.message,
      })
    } finally {
      setTesting(false)
    }
  }

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

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Supabase Setup & Validation</h1>
          <p className="mt-2 text-muted-foreground">Configure and test your Supabase database connection</p>
        </div>

        {/* Status Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Database className="h-4 w-4" />
                Environment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {envConfigured ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Configured
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="mr-1 h-3 w-3" />
                  Not Configured
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Link2 className="h-4 w-4" />
                Connection
              </CardTitle>
            </CardHeader>
            <CardContent>
              {testResult ? (
                testResult.success ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="mr-1 h-3 w-3" />
                    Failed
                  </Badge>
                )
              ) : (
                <Badge variant="secondary">Not Tested</Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Database className="h-4 w-4" />
                Database
              </CardTitle>
            </CardHeader>
            <CardContent>
              {testResult?.details ? (
                testResult.details.tablesMissing.length === 0 ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Ready
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Incomplete
                  </Badge>
                )
              ) : (
                <Badge variant="secondary">Not Tested</Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
            <CardDescription>Follow these steps to configure Supabase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Step 1: Create Supabase Project</h3>
              <p className="text-sm text-muted-foreground">
                Go to{" "}
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  supabase.com/dashboard
                </a>{" "}
                and create a new project
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Step 2: Execute SQL Script</h3>
              <p className="text-sm text-muted-foreground">
                Copy the consolidated SQL script from <strong>SUPABASE_SETUP.md</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                In your Supabase dashboard: <strong>SQL Editor → New Query → Paste → Run</strong>
              </p>
              <Alert>
                <AlertDescription className="text-xs">
                  The script will create {requiredTables.length} tables with RLS policies, triggers, and seed data.
                </AlertDescription>
              </Alert>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Step 3: Get API Credentials</h3>
              <p className="text-sm text-muted-foreground">
                In Supabase: <strong>Settings → API</strong>
              </p>
              <ul className="ml-4 list-disc text-sm text-muted-foreground">
                <li>
                  Copy <strong>Project URL</strong>
                </li>
                <li>
                  Copy <strong>anon/public key</strong>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Step 4: Add Environment Variables in v0</h3>
              <p className="text-sm text-muted-foreground">
                Click <strong>Vars</strong> in the v0 sidebar and add:
              </p>
              <div className="space-y-1">
                <code className="block rounded bg-muted px-2 py-1 text-xs">
                  NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
                </code>
                <code className="block rounded bg-muted px-2 py-1 text-xs">
                  NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGc...
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connection Test */}
        <Card>
          <CardHeader>
            <CardTitle>Test Connection</CardTitle>
            <CardDescription>Verify database schema and connectivity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!envConfigured && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="url">Supabase URL</Label>
                  <Input
                    id="url"
                    placeholder="https://xxxxx.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="key">Anon Key</Label>
                  <Input
                    id="key"
                    type="password"
                    placeholder="eyJ..."
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                  />
                </div>
              </div>
            )}

            {envConfigured && (
              <Alert>
                <AlertDescription>Environment variables detected. Click Test Connection to validate.</AlertDescription>
              </Alert>
            )}

            <Button onClick={testConnection} disabled={testing || (!supabaseUrl && !envConfigured)} className="w-full">
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                "Test Connection & Validate Schema"
              )}
            </Button>

            {/* Test Results */}
            {testResult && (
              <div className="space-y-4">
                <Alert variant={testResult.success ? "default" : "destructive"}>
                  <AlertDescription className="flex items-start gap-2">
                    {testResult.success ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">{testResult.message}</p>
                    </div>
                  </AlertDescription>
                </Alert>

                {/* Table Status */}
                {testResult.details && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Database Schema Status</CardTitle>
                      <CardDescription>
                        {testResult.details.tablesFound.length} of {requiredTables.length} required tables found
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Tables Found */}
                      {testResult.details.tablesFound.length > 0 && (
                        <div>
                          <p className="mb-2 text-sm font-medium text-green-600">Tables Found:</p>
                          <div className="flex flex-wrap gap-2">
                            {testResult.details.tablesFound.map((table) => (
                              <Badge key={table} variant="default" className="bg-green-500">
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                {table}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tables Missing */}
                      {testResult.details.tablesMissing.length > 0 && (
                        <div>
                          <p className="mb-2 text-sm font-medium text-red-600">Missing Tables:</p>
                          <div className="flex flex-wrap gap-2">
                            {testResult.details.tablesMissing.map((table) => (
                              <Badge key={table} variant="destructive">
                                <XCircle className="mr-1 h-3 w-3" />
                                {table}
                              </Badge>
                            ))}
                          </div>
                          <Alert variant="destructive" className="mt-3">
                            <AlertDescription>
                              Please execute the SQL script from SUPABASE_SETUP.md to create missing tables.
                            </AlertDescription>
                          </Alert>
                        </div>
                      )}

                      {/* Additional Info */}
                      <div className="grid gap-2 pt-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Connection Valid:</span>
                          <Badge variant={testResult.details.connectionValid ? "default" : "destructive"}>
                            {testResult.details.connectionValid ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Authentication Enabled:</span>
                          <Badge variant={testResult.details.authEnabled ? "default" : "secondary"}>
                            {testResult.details.authEnabled ? "Yes" : "No"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Success Message */}
        {testResult?.success && testResult.details?.tablesMissing.length === 0 && (
          <Card className="border-green-500 bg-green-50 dark:bg-green-950">
            <CardHeader>
              <CardTitle className="text-green-600">Setup Complete!</CardTitle>
              <CardDescription>Your Supabase database is fully configured and ready to use</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm font-medium">Next Steps:</p>
              <div className="space-y-2">
                <Button variant="default" className="w-full" asChild>
                  <a href="/signup">Create Your Account</a>
                </Button>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <a href="/login">Login to Existing Account</a>
                </Button>
                <Button variant="ghost" className="w-full" asChild>
                  <a href="/">Go to Dashboard</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
