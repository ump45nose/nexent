import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: "line",
  use: {
    baseURL: "http://127.0.0.1:3000",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    command:
      "FILE_UPLOAD_SIZE_LIMIT=100 PLAYWRIGHT_TEST_PAGE=1 NODE_OPTIONS=--max-old-space-size=3072 npm run dev",
    url: "http://127.0.0.1:3000/zh/share/playwright-nl2agent-installation",
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
