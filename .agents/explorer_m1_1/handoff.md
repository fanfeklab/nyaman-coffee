# M1: Add Shadcn Sidebar - Investigation Report

## Observation
- The project is configured with Next.js App Router and Shadcn UI (`components.json` is present and functional).
- The `/components/ui/` directory currently contains Neobrutalism-styled components like `button.tsx` and `card.tsx`.
- These components achieve Neobrutalism via thick borders (`border-4 border-black`), sharp shadows (`shadow-[4px_4px_0_0_#000]`), rounded corners (`rounded-xl`), and distinct hover states.
- The `sidebar` component and its typical dependencies (`sheet`, `tooltip`, `separator`, `skeleton`) are not currently installed.

## Logic Chain
1. To satisfy M1, we first need to run the Shadcn CLI: `npx shadcn@latest add sidebar --yes`.
2. This command will scaffold several files in `/components/ui/` (`sidebar.tsx`, `sheet.tsx`, `tooltip.tsx`, `separator.tsx`, etc.) with default styling (thin borders like `border-r border-border`, soft shadows, subtle transitions).
3. Because the user explicitly demands a **Neobrutalism UI style**, these newly generated files must be modified immediately after installation to match the project's design language:
   - **`sidebar.tsx`**: Update the `Sidebar` container to use a thick right border (e.g., `border-r-4 border-black`) instead of `border-r border-sidebar-border`. Update `SidebarMenuButton` to have bold hover states, thicker borders, and sharp shadows.
   - **`sheet.tsx`**: The `SheetContent` (used for the mobile sidebar) should have a thick border and sharp shadow (e.g., `border-l-4 border-black shadow-[-8px_0_0_0_#000]`).
   - **`tooltip.tsx`**: `TooltipContent` (used for collapsed sidebar item hints) should use `border-4 border-black shadow-[4px_4px_0_0_#000] rounded-xl`.
   - **`separator.tsx`**: Should be thicker, e.g., `h-1 bg-black` instead of a 1px soft border.

## Caveats
- The exact spacing, padding, and shadow offsets for the `SidebarMenuButton` might need minor adjustments to look cohesive and not overly cramped.
- The default Shadcn sidebar relies heavily on CSS variables (e.g., `--sidebar-border`). In Neobrutalism, hardcoded black borders (`border-black`) are preferred to ensure high contrast, overriding these variables.

## Conclusion
The implementer should execute the following strategy:
1. Run `npx shadcn@latest add sidebar --yes` to scaffold the sidebar.
2. Search and replace default subtle stylings in the generated `components/ui/sidebar.tsx`, `components/ui/sheet.tsx`, `components/ui/tooltip.tsx`, and `components/ui/separator.tsx` with Neobrutalism classes (e.g., `border-4 border-black`, `shadow-[4px_4px_0_0_#000]`).
3. Ensure no original thin borders (`border-border`, `border-sidebar-border`) remain on the main container elements.

## Verification Method
1. Verify the files exist at `components/ui/sidebar.tsx`, etc.
2. Check that the files contain the Neobrutalism tailwind classes (`border-black`, `shadow-` etc.).
3. Run `npm run lint` and `npm run build` to ensure the new components do not introduce build errors.
