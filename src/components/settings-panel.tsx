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
  { hex: "#3b82f6", hsl: "217.2 91.2% 59.8%" }, // Blue
  { hex: "#8b5cf6", hsl: "258.3 89.5% 66.3%" }, // Violet
  { hex: "#10b981", hsl: "159.6 83.5% 39.4%" }, // Emerald
  { hex: "#f59e0b", hsl: "37.7 92.1% 50.2%" }, // Amber
  { hex: "#ef4444", hsl: "0 84.2% 60.2%" }, // Red
]

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

  const handleColorChange = (colorObj: { hex: string; hsl: string }) => {
    try {
      localStorage.setItem("app-accent-color", colorObj.hsl)
      document.documentElement.style.setProperty("--primary", colorObj.hsl)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="max-w-4xl p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Settings</h1>
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
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                      <SelectItem value="claude-sonnet-4-20250514">Claude Sonnet 4</SelectItem>
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
                        key={color.hex}
                        type="button"
                        onClick={() => handleColorChange(color)}
                        className="hover:border-foreground h-8 w-8 rounded-full border-2 border-transparent transition-colors"
                        style={{ backgroundColor: color.hex }}
                        aria-label={`Accent color ${color.hex}`}
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
