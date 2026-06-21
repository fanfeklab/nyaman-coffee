# Scope: M3 - Base Component Standardization

## Architecture
- Module/package boundaries: `/app/(dashboard)/backoffice/*` and `/components/organisms/*`.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Shadcn Base Components | Run `npx shadcn@latest add tabs avatar toggle-group select input` as needed. | none | PLANNED |
| 2 | Refactor Tabs | Replace manual tabs in products, inventory, reports, settings with `<Tabs>`. | 1 | PLANNED |
| 3 | Refactor Avatars & Native Inputs | Replace raw `<img>` in shift page with `<Avatar>`. Replace native `<select>` and `<input type="file">` with Shadcn components. | 1 | PLANNED |

## Interface Contracts
- All new components must adhere strictly to Neobrutalism styling (`border-4 border-black`, `shadow-[4px_4px_0_0_#000]`).
- Do NOT use native HTML inputs or selects without Shadcn/Radix wrappers.
