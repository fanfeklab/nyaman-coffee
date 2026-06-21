# BRIEFING — 2026-06-21T05:11

## Mission
Perform a major UI/UX overhaul for Nyaman Coffee POS, migrating to full Shadcn components (DataTable, Sidebar, Tabs, Avatar, ToggleGroup, Card) and enforcing a strict Neobrutalism theme.

## 🔒 My Identity
- Archetype: Project Orchestrator
- Roles: orchestrator, user_liaison, human_reporter, successor
- Working directory: /home/nara_events/Workspace/Project/nyaman-coffee/.agents/orchestrator
- Original parent: top-level
- Original parent conversation ID: 071f7a02-8e9d-4698-b5a1-280f4f1c4107

## 🔒 My Workflow
- **Pattern**: Project
- **Scope document**: /home/nara_events/Workspace/Project/nyaman-coffee/PROJECT.md
1. **Decompose**: Decompose the overhaul into distinct milestones (e.g. DataTable, Sidebar, Base Components).
2. **Dispatch & Execute**:
   - **Delegate (sub-orchestrator)**: Spawn a sub-orchestrator for each milestone.
3. **On failure** (in this order):
   - Retry: nudge stuck agent or re-send task
   - Replace: spawn fresh agent with partial progress
   - Skip: proceed without (only if non-critical)
   - Redistribute: split stuck agent's remaining work
   - Redesign: re-partition decomposition
   - Escalate: report to parent (sub-orchestrators only, last resort)
4. **Succession**: At 16 spawns, write handoff.md, spawn successor.
- **Work items**:
  1. Milestone 1: Shadcn DataTable Integration [pending]
  2. Milestone 2: Shadcn Sidebar & Layout [pending]
  3. Milestone 3: Base Component Standardization [pending]
- **Current phase**: 2
- **Current focus**: M2: Shadcn Sidebar & Layout Migration

## 🔒 Key Constraints
- DILARANG KERAS MENGGUNAKAN NATIVE HTML INPUTS & TAILWIND MURNI UNTUK KOMPONEN UI.
- Semua elemen UI interaktif WAJIB menggunakan Shadcn UI / Radix UI.
- Semua ikon WAJIB menggunakan lucide-react.
- Interaksi transisi WAJIB menggunakan framer-motion (atau motion/react).
- Gaya Desain: Neobrutalism yang Konsisten (High contrast, tebal border hitam solid, rounded-md/xl, shadow solid/tajam seperti shadow-[4px_4px_0_0_#000], background mencolok).
- Feedback Interaksi: Wajib berikan feedback menggunakan Sonner/Toast/Alert Dialog.
- UI-First & Mock Data Mode: JANGAN terapkan koneksi backend (Firebase Auth, Cloud Firestore) sampai ada izin tertulis. Gunakan zustand.
- Kepatuhan Atomic Design: UI components dumb, logic in page/hooks.
- Never reuse a subagent after handoff.
- Pass 100% E2E tests before completion.

## Current Parent
- Conversation ID: 071f7a02-8e9d-4698-b5a1-280f4f1c4107
- Updated: not yet

## Key Decisions Made
- Starting with codebase exploration to form the PROJECT.md.
- Run M1, M2, M3 sub-orchestrators sequentially to prevent `package.json` conflicts.

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|-------|------|-----------|--------|---------|
| M1_Sub | self | M1: DataTable | completed | 266d59fb-cb74-450b-a904-13706103aa61 |
| M2_Sub | self | M2: Sidebar | in-progress | b9aed443-eaae-4193-982e-312a573c48b8 |

## Succession Status
- Succession required: no
- Spawn count: 0 / 16
- Pending subagents: none
- Predecessor: none
- Successor: not yet spawned

## Active Timers
- Heartbeat cron: not started
- Safety timer: none
- On succession: kill all timers before spawning successor
- On context truncation: run manage_task(Action="list") — re-create if missing

## Artifact Index
- /home/nara_events/Workspace/Project/nyaman-coffee/PROJECT.md — Global architecture and milestone plan
- /home/nara_events/Workspace/Project/nyaman-coffee/ORIGINAL_REQUEST.md — Verbatim user request
- /home/nara_events/Workspace/Project/nyaman-coffee/.agents/orchestrator/progress.md — Execution state and checklist
