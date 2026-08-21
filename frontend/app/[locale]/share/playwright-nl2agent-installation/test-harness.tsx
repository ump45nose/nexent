"use client";

import {
  AssistantRuntimeProvider,
  useLocalRuntime,
  type ChatModelAdapter,
} from "@assistant-ui/react";

import { Nl2AgentFlowProvider } from "@/contexts/nl2AgentFlow";
import { SuggestedResourceInstallationCard } from "../../newchat/ui/suggested-resource-installation-card";
import type { Nl2aSuggestedResourceInstallationPayload } from "../../newchat/adapter/remote-chat-model-adapter";

const EMPTY_ADAPTER: ChatModelAdapter = {
  async *run() {
    yield { content: [{ type: "text", text: "Action submitted" }] };
  },
};

const registry = {
  server: {
    name: "io.example/search",
    version: "1.2.3",
    description: "Search verified project data",
    remotes: [
      {
        type: "streamable-http",
        url: "https://registry.example.test/mcp",
      },
    ],
    packages: [
      {
        registryType: "npm",
        identifier: "@example/search",
        transport: { type: "stdio" },
        environmentVariables: [
          {
            name: "API_TOKEN",
            isRequired: true,
            isSecret: true,
          },
        ],
      },
    ],
  },
  _meta: {
    "io.modelcontextprotocol.registry/official": { status: "active" },
  },
};

const PAYLOAD: Nl2aSuggestedResourceInstallationPayload = {
  subtype: "suggested_resource_installation",
  agent_id: 42,
  resources: [
    {
      candidate: {
        candidate_ref: "nexent_official_skill:daily-report",
        resource_type: "skill",
        source: "NEXENT_OFFICIAL_SKILL",
        name: "daily-report",
        description: "Create a daily report",
        requirement_ids: ["daily_report"],
        score: 0.94,
      },
      recommendation: "recommended",
      form_kind: "SKILL_CONFIG",
      config: [],
      installation_options: [
        {
          option_id: "official",
          label: "Install",
          form_kind: "SKILL_CONFIG",
          config: [],
        },
      ],
      default_option_id: "official",
    },
    {
      candidate: {
        candidate_ref: "tenant_skill_repository:23",
        resource_type: "skill",
        source: "TENANT_SKILL_REPOSITORY",
        name: "email-report",
        description: "Deliver reports by email",
        requirement_ids: ["email_delivery"],
        score: 0.88,
      },
      recommendation: "recommended",
      form_kind: "SKILL_CONFIG",
      config: [
        {
          name: "target_name",
          type: "string",
          required: false,
          value: "",
          description_en: "Optional installed Skill name",
          description_zh: "可选的安装后 Skill 名称",
        },
      ],
      installation_options: [
        {
          option_id: "repository",
          label: "Install a copy",
          form_kind: "SKILL_CONFIG",
          config: [
            {
              name: "target_name",
              type: "string",
              required: false,
              value: "",
              description_en: "Optional installed Skill name",
              description_zh: "可选的安装后 Skill 名称",
            },
          ],
        },
      ],
      default_option_id: "repository",
    },
    {
      candidate: {
        candidate_ref: "mcp_official_registry:io.example%2Fsearch@1.2.3",
        resource_type: "mcp_server",
        source: "MCP_OFFICIAL_REGISTRY",
        name: "io.example/search",
        description: "Search verified project data",
        requirement_ids: ["verified_search"],
        score: 0.91,
      },
      recommendation: "optional",
      form_kind: "MCP_REMOTE",
      config: { registry, option_key: "remote-0" },
      installation_options: [
        {
          option_id: "remote-0",
          label: "HTTP - https://registry.example.test/mcp",
          form_kind: "MCP_REMOTE",
          config: { registry, option_key: "remote-0" },
        },
        {
          option_id: "package-0",
          label: "@example/search - stdio",
          form_kind: "MCP_PACKAGE",
          config: { registry, option_key: "package-0" },
        },
      ],
      default_option_id: "remote-0",
    },
  ],
};

export function Nl2AgentInstallationTestHarness() {
  const runtime = useLocalRuntime(EMPTY_ADAPTER);
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Nl2AgentFlowProvider>
        <main className="mx-auto min-h-screen max-w-4xl bg-background p-6">
          <SuggestedResourceInstallationCard payload={PAYLOAD} />
        </main>
      </Nl2AgentFlowProvider>
    </AssistantRuntimeProvider>
  );
}
