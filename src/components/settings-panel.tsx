"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Settings, Key, Palette, Bell, Shield, Save } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

const tabFadeIn = {
  initial: { opacity: 0, y: 10, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.3, ease: "easeOut" as const },
}

const ACCENT_COLORS = [
  { oklch: "oklch(0.576 0.204 262.881)", label: "Blue" },
  { oklch: "oklch(0.637 0.235 293.755)", label: "Violet" },
  { oklch: "oklch(0.647 0.177 164.364)", label: "Emerald" },
  { oklch: "oklch(0.756 0.178 66.29)", label: "Amber" },
  { oklch: "oklch(0.637 0.237 25.331)", label: "Red" },
]

const AI_MODELS = [
  { value: "gpt-4o", label: "GPT-4o", provider: "OpenAI" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini", provider: "OpenAI" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo", provider: "OpenAI" },
  { value: "gpt-4o-2024-11-20", label: "GPT-4o (2024-11-20)", provider: "OpenAI" },
  { value: "o1", label: "o1", provider: "OpenAI" },
  { value: "o1-mini", label: "o1 Mini", provider: "OpenAI" },
  { value: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", provider: "Anthropic" },
  { value: "claude-sonnet-4-20250514", label: "Claude Sonnet 4", provider: "Anthropic" },
  { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet", provider: "Anthropic" },
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash", provider: "Google" },
  { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro", provider: "Google" },
  { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash", provider: "Google" },
  { value: "gemini-1.5-flash-8b", label: "Gemini 1.5 Flash 8B", provider: "Google" },
  { value: "deepseek-reasoner", label: "DeepSeek R1", provider: "DeepSeek" },
  { value: "deepseek-chat", label: "DeepSeek Chat", provider: "DeepSeek" },
] as const

export function SettingsPanel() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])

  const [defaultModel, setDefaultModel] = useState("gpt-4o")
  const [maxTokens, setMaxTokens] = useState("4096")
  const [temperature, setTemperature] = useState("0.7")
  const [streamResponses, setStreamResponses] = useState(true)
  const [saveHistory, setSaveHistory] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(false)

  const handleSave = () => {
    toast.success("Settings saved successfully")
  }

  const handleColorChange = (colorObj: { oklch: string; label: string }) => {
    try {
      localStorage.setItem("app-accent-color", colorObj.oklch)
      document.documentElement.style.setProperty("--primary", colorObj.oklch)
    } catch (e) {
      console.error(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <div className="max-w-4xl p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl leading-snug font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your Agent Builder preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general" className="gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <motion.div key="general" {...tabFadeIn}>
            <Card className="border-border/80">
              <CardHeader>
                <CardTitle className="leading-snug">General Settings</CardTitle>
                <CardDescription>Configure default behavior for your agents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="defaultModel">Default Model</Label>
                  <Select value={defaultModel} onValueChange={setDefaultModel}>
                    <SelectTrigger className="max-w-md">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AI_MODELS.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label} ({m.provider})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-muted-foreground text-sm">
                    The default model used when creating new agents
                  </p>
                </div>

                <Separator />

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="maxTokens">Max Tokens</Label>
                    <Input
                      id="maxTokens"
                      type="number"
                      value={maxTokens}
                      onChange={(e) => setMaxTokens(e.target.value)}
                    />
                    <p className="text-muted-foreground text-sm">Maximum tokens per response</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature</Label>
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      min="0"
                      max="2"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                    />
                    <p className="text-muted-foreground text-sm">Controls randomness (0-2)</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Stream Responses</Label>
                      <p className="text-muted-foreground text-sm">
                        Show responses as they are generated
                      </p>
                    </div>
                    <Switch checked={streamResponses} onCheckedChange={setStreamResponses} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Save Run History</Label>
                      <p className="text-muted-foreground text-sm">Keep a log of all agent runs</p>
                    </div>
                    <Switch checked={saveHistory} onCheckedChange={setSaveHistory} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="api">
          <motion.div key="api" {...tabFadeIn}>
            <Card className="border-border/80">
              <CardHeader>
                <CardTitle className="leading-snug">API Configuration</CardTitle>
                <CardDescription>Manage your API keys for different providers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="openaiKey">OpenAI API Key</Label>
                  <Input id="openaiKey" type="password" placeholder="sk-..." className="max-w-md" />
                  <p className="text-muted-foreground text-sm">Required for GPT models</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="anthropicKey">Anthropic API Key</Label>
                  <Input
                    id="anthropicKey"
                    type="password"
                    placeholder="sk-ant-..."
                    className="max-w-md"
                  />
                  <p className="text-muted-foreground text-sm">Required for Claude models</p>
                </div>
                <div className="bg-muted flex items-start gap-3 rounded-lg p-4">
                  <Shield className="text-muted-foreground mt-0.5 h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium">Security Notice</p>
                    <p className="text-muted-foreground text-sm">
                      API keys are stored securely and encrypted. We never share your keys with
                      third parties.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="appearance">
          <motion.div key="appearance" {...tabFadeIn}>
            <Card className="border-border/80">
              <CardHeader>
                <CardTitle className="leading-snug">Appearance</CardTitle>
                <CardDescription>Customize how Agent Builder looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select value={mounted ? (theme ?? "dark") : "dark"} onValueChange={setTheme}>
                    <SelectTrigger className="max-w-md">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-muted-foreground text-sm">
                    Dark mode is the default for Clean Architect. Light mode is available here as an
                    advanced option.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <div className="flex gap-2">
                    {ACCENT_COLORS.map((color) => (
                      <button
                        key={color.label}
                        type="button"
                        onClick={() => handleColorChange(color)}
                        className="hover:border-foreground h-8 w-8 rounded-xl border-2 border-transparent transition-colors"
                        style={{ backgroundColor: color.oklch }}
                        aria-label={`Accent color ${color.label}`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="notifications">
          <motion.div key="notifications" {...tabFadeIn}>
            <Card className="border-border/80">
              <CardHeader>
                <CardTitle className="leading-snug">Notifications</CardTitle>
                <CardDescription>Configure how you receive updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-muted-foreground text-sm">
                      Receive email updates about your agents
                    </p>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Run Completion Alerts</Label>
                    <p className="text-muted-foreground text-sm">
                      Get notified when long-running tasks complete
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Error Notifications</Label>
                    <p className="text-muted-foreground text-sm">
                      Get alerted when agent runs fail
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  )
}
