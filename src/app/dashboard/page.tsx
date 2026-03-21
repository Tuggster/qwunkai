"use client";

import { useState } from "react";
import { useMutation } from "../components/MutationContext";
import MutationZone from "../components/MutationZone";

const sidebarItems = [
  { label: "Overview", icon: "◈", active: true },
  { label: "Workflows", icon: "◇" },
  { label: "Analytics", icon: "◎" },
  { label: "Integrations", icon: "⬡" },
  { label: "Team", icon: "⟐" },
  { label: "Settings", icon: "⚙" },
];

const activityLog = [
  { action: "Workflow 'Slack Notifier' completed", time: "2 min ago", status: "success" },
  { action: "New team member added: james@acme.co", time: "15 min ago", status: "info" },
  { action: "Workflow 'Deploy Pipeline' triggered", time: "23 min ago", status: "success" },
  { action: "Integration 'GitHub' reconnected", time: "1 hr ago", status: "info" },
  { action: "Workflow 'Data Sync' failed: timeout", time: "2 hr ago", status: "error" },
  { action: "API key rotated by admin", time: "3 hr ago", status: "info" },
  { action: "Workflow 'Weekly Report' completed", time: "5 hr ago", status: "success" },
];

export default function Dashboard() {
  const { triggerMutation, isMutating } = useMutation();
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <div className="flex min-h-[calc(100vh-65px)]">
      <MutationZone name="dash-sidebar" autoMutateMs={18000} tags={["passive"]}>
        <aside className="hidden md:flex flex-col w-56 border-r border-zinc-100 p-4 bg-zinc-50 shrink-0">
          <div className="mb-6 px-3">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Workspace
            </p>
            <p className="text-sm font-semibold text-zinc-900 mt-1">Acme Corp</p>
          </div>
          <nav className="space-y-1 flex-1">
            {sidebarItems.map((item) => (
              <button
                key={item.label}
                onClick={() => setActiveTab(item.label)}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm transition-colors cursor-pointer ${
                  activeTab === item.label
                    ? "bg-white text-zinc-900 font-medium shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-white/50"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="pt-4 border-t border-zinc-200 mt-4 px-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-medium text-zinc-600">
                SC
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900">Sarah Chen</p>
                <p className="text-xs text-zinc-400">Admin</p>
              </div>
            </div>
          </div>
        </aside>
      </MutationZone>

      <div className="flex-1 p-8">
        <MutationZone name="dash-header" autoMutateMs={22000} tags={["passive"]}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">
                Good afternoon, Sarah
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                Here&apos;s what&apos;s happening with your workflows today.
              </p>
            </div>
            <button
              onClick={() => triggerMutation()}
              disabled={isMutating}
              className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              + Create Workflow
            </button>
          </div>
        </MutationZone>

        <MutationZone name="dash-metrics" autoMutateMs={14000} tags={["passive"]}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Workflows", value: "24", change: "+3 this week", positive: true },
              { label: "Active Users", value: "12", change: "+2 this month", positive: true },
              { label: "Success Rate", value: "98.7%", change: "-0.2%", positive: false },
              { label: "Avg. Exec Time", value: "1.4s", change: "-0.3s faster", positive: true },
            ].map((m) => (
              <div key={m.label} className="bg-white border border-zinc-100 rounded-xl p-5">
                <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">
                  {m.label}
                </p>
                <p className="text-2xl font-bold text-zinc-900 mt-2">{m.value}</p>
                <p className={`text-xs mt-1 ${m.positive ? "text-emerald-500" : "text-red-400"}`}>
                  {m.change}
                </p>
              </div>
            ))}
          </div>
        </MutationZone>

        <div className="grid lg:grid-cols-5 gap-6">
          <MutationZone name="dash-activity" autoMutateMs={16000} tags={["passive"]}>
            <div className="lg:col-span-3 bg-white border border-zinc-100 rounded-xl p-6">
              <h3 className="font-semibold text-zinc-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {activityLog.map((entry, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        entry.status === "success"
                          ? "bg-emerald-400"
                          : entry.status === "error"
                          ? "bg-red-400"
                          : "bg-zinc-300"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-700">{entry.action}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{entry.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </MutationZone>

          <MutationZone name="dash-workflows" autoMutateMs={20000} tags={["passive"]}>
            <div className="lg:col-span-2 bg-white border border-zinc-100 rounded-xl p-6">
              <h3 className="font-semibold text-zinc-900 mb-4">Top Workflows</h3>
              <div className="space-y-3">
                {[
                  { name: "Slack Notifier", runs: "1,247", bar: 85 },
                  { name: "Deploy Pipeline", runs: "834", bar: 65 },
                  { name: "Data Sync", runs: "612", bar: 48 },
                  { name: "Weekly Report", runs: "156", bar: 20 },
                  { name: "Onboarding Flow", runs: "89", bar: 12 },
                ].map((wf) => (
                  <div key={wf.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-700">{wf.name}</span>
                      <span className="text-zinc-400">{wf.runs}</span>
                    </div>
                    <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-zinc-900 rounded-full"
                        style={{ width: `${wf.bar}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </MutationZone>
        </div>
      </div>
    </div>
  );
}
