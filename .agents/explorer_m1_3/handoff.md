# Handoff: M1 - Add Shadcn Sidebar

## Observation
- The project currently implements a strict **Neobrutalism UI style** in its existing shadcn components (`button.tsx`, `card.tsx`, `input.tsx`), utilizing classes like `border-4`, `border-black`, `rounded-xl`, and `shadow-[4px_4px_0_0_#000]`.
- Running `npx shadcn@latest add sidebar --yes` will generate `components/ui/sidebar.tsx`, `sheet.tsx`, `separator.tsx`, `skeleton.tsx`, `tooltip.tsx`, and modify `hooks/use-mobile.ts`.
- Crucially, the dry-run of the shadcn CLI indicates that it **will overwrite** the customized `button.tsx` and `input.tsx` files, which would destroy the current Neobrutalism styles on those components.
- The newly created `sidebar.tsx`, `sheet.tsx`, and other components will use default shadcn styles (thin borders like `border-r`, soft shadows like `shadow-lg`, rounded-md), which violates the Neobrutalism design rule.

## Logic Chain
1. To add the sidebar safely without losing existing styling, we must back up `button.tsx` and `input.tsx` before running the CLI, and restore them afterward.
2. To satisfy the Neobrutalism UI constraint, the newly generated components must be updated manually.
   - `sidebar.tsx`: The main sidebar container and its floating variant need thick black borders and sharp shadows.
   - `sheet.tsx`: The `SheetContent` component needs its soft `shadow-lg` replaced, and its `border-l`, `border-r` updated to `border-l-4 border-black`, etc.
   - `tooltip.tsx`: Needs `border-4 border-black shadow-[4px_4px_0_0_#000] rounded-xl`.
   - `separator.tsx`: Needs to be a solid black line (`bg-black`, possibly thicker).

## Caveats
- `shadcn add sidebar` might update `components.json` or install dependencies like `@radix-ui/react-tooltip`, `@radix-ui/react-dialog` (via sheet), and `lucide-react` (already installed).
- The exact classes to replace in `sidebar.tsx` and `sheet.tsx` depend on the exact file contents generated. The implementer must carefully search for standard `border-r`, `border-l`, `border`, `shadow-sm`, `shadow-lg` classes and replace them with Neobrutalism equivalents.

## Conclusion
The implementer should execute the following strategy:
1. **Backup**: Copy `components/ui/button.tsx` and `components/ui/input.tsx` to a temporary location.
2. **Execute**: Run `npx shadcn@latest add sidebar --yes --cwd /home/nara_events/Workspace/Project/nyaman-coffee`.
3. **Restore**: Overwrite the generated `button.tsx` and `input.tsx` with the backups from step 1 to preserve Neobrutalism styles.
4. **Style**: Apply Neobrutalism styles to the newly added components:
   - In `components/ui/sidebar.tsx`: Update sidebar border classes from `border-r` / `border-l` to `border-r-4 border-black` / `border-l-4 border-black`. Update the `floating` variant to use `border-4 border-black shadow-[4px_4px_0_0_#000] rounded-xl`.
   - In `components/ui/sheet.tsx`: In `SheetContent`, remove `shadow-lg` and update side borders to `border-4 border-black` (or `border-l-4 border-black`, etc.).
   - In `components/ui/tooltip.tsx`: In `TooltipContent`, add `border-4 border-black shadow-[4px_4px_0_0_#000] rounded-xl font-bold`.
   - In `components/ui/separator.tsx`: Change background from `bg-border` to `bg-black` and consider making it thicker (e.g., `h-1` for horizontal).

## Verification Method
- Ensure the app builds (`npm run build`).
- Ensure `components/ui/button.tsx` still has `border-4 border-black`.
- Ensure `components/ui/sidebar.tsx` and `components/ui/sheet.tsx` exist and contain `border-black` classes.
