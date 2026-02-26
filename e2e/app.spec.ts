import { test, expect } from '@playwright/test'

test.describe('App shell and critical routes', () => {
  test('home page has title and AgentKit branding', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/AgentKit/i)
    await expect(page.getByText('AgentKit', { exact: true }).first()).toBeVisible()
  })

  test('sidebar shows all main nav links', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: /Agents/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Builder/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Templates/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Connectors/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /MCP Servers/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Marketplace/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Playground/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Runs/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Tools/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Settings/i })).toBeVisible()
  })

  test('navigating via sidebar to each main route', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('link', { name: /Connectors/i }).click()
    await expect(page).toHaveURL(/\/connectors/)
    await expect(page.getByRole('heading', { name: /Connector Registry/i })).toBeVisible()

    await page.getByRole('link', { name: /Playground/i }).click()
    await expect(page).toHaveURL(/\/playground/)
    await expect(page.getByText(/Select an agent|Playground|Chat/i).first()).toBeVisible({ timeout: 10_000 })

    await page.getByRole('link', { name: /Builder/i }).click()
    await expect(page).toHaveURL(/\/builder/)
    await expect(page.getByRole('button', { name: /Save|Run Workflow/i }).or(page.locator('.canvas-grid')).first()).toBeVisible({ timeout: 10_000 })

    await page.getByRole('link', { name: /Marketplace/i }).click()
    await expect(page).toHaveURL(/\/marketplace/)
    await expect(page.getByRole('heading', { name: /Integration Marketplace/i })).toBeVisible()

    await page.getByRole('link', { name: /Agents/i }).click()
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: /Agents/i })).toBeVisible()
  })

  test('/connectors loads Connector Registry', async ({ page }) => {
    await page.goto('/connectors')
    await expect(page.getByRole('heading', { name: /Connector Registry/i })).toBeVisible()
    await expect(page.getByPlaceholder(/Search connectors/i)).toBeVisible()
  })

  test('/playground loads chat interface', async ({ page }) => {
    await page.goto('/playground')
    await expect(page.getByText(/Select an agent|Playground|Chat|New Chat/i).first()).toBeVisible({ timeout: 12_000 })
  })

  test('/builder loads canvas', async ({ page }) => {
    await page.goto('/builder')
    await expect(page.locator('body')).toBeVisible()
    await expect(page.getByRole('button', { name: /Undo|Redo|Zoom|Save/i }).first()).toBeVisible({ timeout: 10_000 })
  })

  test('/marketplace loads Integration Marketplace', async ({ page }) => {
    await page.goto('/marketplace')
    await expect(page.getByRole('heading', { name: /Integration Marketplace/i })).toBeVisible()
  })
})
