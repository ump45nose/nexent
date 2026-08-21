import { expect, test } from "@playwright/test";

test("installs, configures, retries, and skips suggested resources", async ({
  page,
}) => {
  let repositoryInstallAttempts = 0;
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const pathname = new URL(request.url()).pathname;
    if (pathname.endsWith("/tenant_config/deployment_version")) {
      await route.fulfill({
        json: {
          status: "success",
          deployment_version: "speed",
          app_version: "test",
        },
      });
      return;
    }
    if (pathname.endsWith("/skills/install")) {
      await route.fulfill({ json: { installed: ["daily-report"], total: 1 } });
      return;
    }
    if (pathname.endsWith("/skills/official")) {
      await route.fulfill({
        json: {
          skills: [
            {
              skill_id: 71,
              name: "daily-report",
              status: "installed",
              source: "official",
            },
          ],
        },
      });
      return;
    }
    if (pathname.endsWith("/repository/skill/23/install")) {
      repositoryInstallAttempts += 1;
      await route.fulfill({
        status: 500,
        json: { detail: "Simulated repository failure" },
      });
      return;
    }
    if (pathname.endsWith("/mcp/port/suggest")) {
      await route.fulfill({
        json: { status: "success", data: { port: 18100 } },
      });
      return;
    }
    await route.fulfill({ json: { status: "success", data: {} } });
  });

  await page.goto("/zh/share/playwright-nl2agent-installation");
  await expect(
    page.getByRole("heading", { name: "安装建议资源" })
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);

  const officialRow = page.getByTestId(
    "installation-resource-nexent_official_skill:daily-report"
  );
  await expect(officialRow.getByRole("button", { name: "配置" })).toHaveCount(
    0
  );
  await officialRow.getByRole("button", { name: "安装" }).click();
  await expect(officialRow.getByText("已安装", { exact: true })).toBeVisible();

  const repositoryRow = page.getByTestId(
    "installation-resource-tenant_skill_repository:23"
  );
  await repositoryRow.getByRole("button", { name: "配置" }).click();
  await expect(page.getByPlaceholder("留空则自动生成副本名称")).toHaveValue("");
  await page.getByRole("button", { name: /取\s*消/ }).click();
  await repositoryRow.getByRole("button", { name: "安装" }).click();
  await expect(
    repositoryRow.getByRole("button", { name: "重试" })
  ).toBeVisible();
  expect(repositoryInstallAttempts).toBe(1);
  await repositoryRow.getByRole("button", { name: "配置" }).click();
  await page.getByRole("button", { name: /保\s*存/ }).click();
  await expect(
    repositoryRow.getByRole("button", { name: "重试" })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "已完成安装，继续" })
  ).toBeDisabled();
  await repositoryRow.getByRole("button", { name: "跳过" }).click();
  await expect(
    repositoryRow.getByText("已跳过", { exact: true })
  ).toBeVisible();

  const registryRow = page.getByTestId(
    "installation-resource-mcp_official_registry:io.example%2Fsearch@1.2.3"
  );
  await registryRow.getByRole("button", { name: "配置" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("combobox").click();
  await page.getByText("@example/search - stdio", { exact: true }).click();
  await expect(
    dialog.getByText("Container 端口", { exact: true })
  ).toBeVisible();
  await expect(dialog.getByRole("spinbutton")).toHaveValue("18100");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
  await page.getByRole("button", { name: /取\s*消/ }).click();

  const continueButton = page.getByRole("button", {
    name: "已完成安装，继续",
  });
  await expect(continueButton).toBeEnabled();
  await continueButton.click();
  await expect(continueButton).toBeDisabled();
});
