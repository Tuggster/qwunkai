"use client";

import { useState } from "react";
import { useMutation } from "../components/MutationContext";
import MutationZone from "../components/MutationZone";

const sections = [
  {
    id: "getting-started",
    title: "Getting Started",
    content: `Welcome to Qwunk! This guide will help you set up your first workflow in under 5 minutes.

First, create a new project from your dashboard. Each project acts as a container for related workflows and integrations.`,
    code: `npm install @qwunk/sdk

import { Qwunk } from '@qwunk/sdk';

const client = new Qwunk({
  apiKey: process.env.QWUNK_API_KEY,
});

// Create your first workflow
const workflow = await client.workflows.create({
  name: 'My First Workflow',
  trigger: { type: 'webhook' },
  steps: [
    { action: 'transform', config: { template: '{{input}}' } },
    { action: 'notify', config: { channel: '#general' } },
  ],
});

console.log('Workflow created:', workflow.id);`,
  },
  {
    id: "api-reference",
    title: "API Reference",
    content: `The Qwunk REST API lets you programmatically manage workflows, triggers, and integrations. All endpoints require authentication via API key.

Base URL: https://api.qwunk.ai/v1

Authentication: Include your API key in the Authorization header as a Bearer token.`,
    code: `// List all workflows
GET /v1/workflows
Authorization: Bearer sk_live_...

// Response
{
  "data": [
    {
      "id": "wf_abc123",
      "name": "Slack Notifier",
      "status": "active",
      "created_at": "2026-01-15T10:30:00Z",
      "executions": 1247
    }
  ],
  "has_more": false
}`,
  },
  {
    id: "integrations",
    title: "Integrations",
    content: `Qwunk supports 200+ integrations out of the box. Connect your tools with one click from the dashboard, or use the API to configure integrations programmatically.

Popular integrations: Slack, GitHub, Linear, Notion, Google Workspace, Jira, Salesforce, Stripe, Twilio, and many more.`,
    code: `// Connect a Slack integration
const integration = await client.integrations.connect({
  provider: 'slack',
  config: {
    workspace: 'my-team',
    default_channel: '#workflows',
  },
});

// Use it in a workflow step
const step = {
  action: 'slack.send_message',
  config: {
    integration_id: integration.id,
    channel: '#alerts',
    text: 'New workflow completed: {{workflow.name}}',
  },
};`,
  },
  {
    id: "webhooks",
    title: "Webhooks",
    content: `Webhooks let you trigger workflows from external events. Each workflow can have one or more webhook triggers with unique URLs.

Webhook URLs are generated automatically when you create a trigger. All webhook payloads are validated and logged for debugging.`,
    code: `// Create a webhook trigger
const trigger = await client.triggers.create({
  workflow_id: 'wf_abc123',
  type: 'webhook',
  config: {
    method: 'POST',
    secret: 'whsec_...',  // optional signing secret
  },
});

console.log('Webhook URL:', trigger.url);
// https://hooks.qwunk.ai/wh_xyz789

// Incoming webhooks are validated and forwarded
// to your workflow automatically.`,
  },
  {
    id: "sdk",
    title: "SDKs & Libraries",
    content: `Official SDKs are available for JavaScript/TypeScript, Python, Go, and Ruby. Community SDKs exist for Rust, Java, and PHP.

All SDKs provide full type coverage and follow idiomatic patterns for each language.`,
    code: `# Python
pip install qwunk

from qwunk import Qwunk

client = Qwunk(api_key="sk_live_...")
workflows = client.workflows.list()

for wf in workflows:
    print(f"{wf.name}: {wf.executions} runs")

# Go
go get github.com/qwunk/qwunk-go

client := qwunk.NewClient("sk_live_...")
workflows, _ := client.Workflows.List(ctx, nil)`,
  },
];

const sidebarItems = sections.map((s) => ({ id: s.id, title: s.title }));

export default function Docs() {
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const { triggerMutation, isMutating } = useMutation();
  const section = sections.find((s) => s.id === activeSection) || sections[0];

  return (
    <div className="flex min-h-[calc(100vh-65px)]">
      <MutationZone name="docs-sidebar" autoMutateMs={20000} tags={["passive"]}>
        <aside className="hidden md:block w-64 border-r border-zinc-100 p-6 shrink-0">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-4">
            Documentation
          </p>
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors cursor-pointer ${
                  activeSection === item.id
                    ? "bg-zinc-100 text-zinc-900 font-medium"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                }`}
              >
                {item.title}
              </button>
            ))}
          </nav>
          <div className="mt-8 pt-6 border-t border-zinc-100">
            <p className="text-xs text-zinc-400 mb-2">Need help?</p>
            <button
              onClick={() => triggerMutation()}
              disabled={isMutating}
              className="text-xs text-zinc-500 hover:text-zinc-900 cursor-pointer transition-colors disabled:opacity-50"
            >
              Contact support →
            </button>
          </div>
        </aside>
      </MutationZone>

      <MutationZone name="docs-content" autoMutateMs={14000} tags={["passive"]}>
        <div className="flex-1 px-8 py-10 max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">
            {section.title}
          </h1>
          <div className="mt-6 text-sm text-zinc-600 leading-relaxed whitespace-pre-line">
            {section.content}
          </div>
          {section.code && (
            <div className="mt-6 bg-zinc-950 rounded-lg p-5 overflow-x-auto">
              <pre className="text-sm text-zinc-300 font-mono leading-relaxed">
                <code>{section.code}</code>
              </pre>
            </div>
          )}
          <div className="mt-10 pt-6 border-t border-zinc-100 flex items-center gap-4">
            <span className="text-sm text-zinc-400">Was this helpful?</span>
            <button
              onClick={() => triggerMutation()}
              disabled={isMutating}
              className="text-sm text-zinc-500 hover:text-zinc-900 border border-zinc-200 px-3 py-1 rounded-md cursor-pointer transition-colors disabled:opacity-50"
            >
              Yes
            </button>
            <button
              onClick={() => triggerMutation()}
              disabled={isMutating}
              className="text-sm text-zinc-500 hover:text-zinc-900 border border-zinc-200 px-3 py-1 rounded-md cursor-pointer transition-colors disabled:opacity-50"
            >
              No
            </button>
          </div>
        </div>
      </MutationZone>
    </div>
  );
}
