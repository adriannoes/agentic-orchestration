import { test, expect } from '@playwright/test'

test.describe('Login page', () => {
  test('login page loads and shows form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /Sign in|Login|Log in/i }).or(page.getByLabel(/Email/i))).toBeVisible({ timeout: 8_000 })
    await expect(page.getByLabel(/Email|email/i)).toBeVisible()
    await expect(page.getByLabel(/Password|password/i)).toBeVisible()
  })
})

test.describe('Signup page', () => {
  test('signup page loads and shows form', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.getByLabel(/Email|email/i)).toBeVisible({ timeout: 8_000 })
    await expect(page.getByLabel(/Password|password/i)).toBeVisible()
  })
})

test.describe('Setup page', () => {
  test('setup page loads and shows env configuration', async ({ page }) => {
    await page.goto('/setup')
    await expect(page.getByRole('heading', { name: /Supabase Setup|Setup & Validation/i })).toBeVisible({ timeout: 10_000 })
  })

  test('setup has Test connection or env check', async ({ page }) => {
    await page.goto('/setup')
    await expect(page.getByRole('button', { name: /Test connection|Check|Validate/i }).or(page.getByText(/Required tables|profiles|workspaces/i)).first()).toBeVisible({ timeout: 8_000 })
  })
})
