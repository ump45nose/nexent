import { notFound } from "next/navigation";

import { Nl2AgentInstallationTestHarness } from "./test-harness";

export const dynamic = "force-dynamic";

export default function Nl2AgentInstallationTestPage() {
  if (process.env.PLAYWRIGHT_TEST_PAGE !== "1") notFound();
  return <Nl2AgentInstallationTestHarness />;
}
