# Handoff Report: M1 - Add Shadcn Sidebar

## Observation
- The project implements a Neobrutalism UI style characterized by thick black borders (`border-4 border-black` or `border-r-8 border-black`), sharp solid shadows (`shadow-[4px_4px_0_0_#000]`), bold typography (`font-inter font-bold uppercase`), and high contrast colors.
- Running `npx shadcn@latest add sidebar sheet tooltip skeleton separator --yes` successfully pulls the standard Shadcn UI components into `components/ui/`, including `sidebar.tsx`.
- Shadcn's default `sidebar.tsx` uses standard Tailwind classes (thin borders, subtle gray hover states, etc.) which violates the project's strict Neobrutalism design rules defined in `AGENTS.md`.
- Shadcn's `sidebar.tsx` relies on CSS variables (e.g., `--sidebar`, `--sidebar-border`) defined in `app/globals.css`.

## Logic Chain
1. **Component Addition**: The Shadcn sidebar and its dependencies must be added to the project. This has already been verified to work.
2. **Global Variables**: We can achieve the base background color (`bg-[#FFD100]`) and text color by modifying the `--sidebar` and related CSS variables in `app/globals.css`.
3. **Sidebar Container Styling**: The default right border (`border-r border-sidebar-border`) is too thin. We must modify the `Sidebar` component in `components/ui/sidebar.tsx` to use a thick `border-r-8 border-black`.
4. **Sidebar Menu Button Styling**: The `sidebarMenuButtonVariants` in `components/ui/sidebar.tsx` controls the appearance of the navigation links. This must be completely rewritten to match the existing `<Link>` styling found in `components/organisms/Sidebar.tsx` (using `border-4`, `shadow-[4px_4px_0_0_#000]`, hover states, and active data states).
5. **Provider Setup**: The `sidebar` component uses `Tooltip`, so `app/layout.tsx` must be updated to wrap its contents with `<TooltipProvider>`.

## Caveats
- `components/ui/sidebar.tsx` is quite large. When replacing the `sidebarMenuButtonVariants` and `Sidebar` container styles, ensure you don't accidentally remove data attributes needed by the `SidebarProvider` context (such as `data-active` or `group-data-[collapsible=icon]`).
- The implementer will also need to update `app/globals.css` with hex values instead of `oklch` for the sidebar variables to ensure absolute consistency with the exact brand yellow `#FFD100`.

## Conclusion
To fulfill M1, the implementer should:
1. Ensure the Shadcn sidebar components are present (`sidebar`, `sheet`, `tooltip`, `separator`, `skeleton`).
2. Update `app/globals.css` to define the `--sidebar` variables with Neobrutalism colors (e.g., `--sidebar: #FFD100`).
3. Modify `components/ui/sidebar.tsx`:
   - Change the `Sidebar` container's `border-r border-sidebar-border` to `border-r-8 border-black`.
   - Override `sidebarMenuButtonVariants` to use `border-4 border-black p-3 rounded-xl shadow-[4px_4px_0_0_#000] font-inter font-bold uppercase transition-all hover:translate-y-1 hover:shadow-none`. Configure `data-[active=true]` or `data-active` states to switch to `bg-black text-white`.
4. Wrap the children in `app/layout.tsx` with `<TooltipProvider>`.

## Verification Method
- Execute the Next.js dev server with `npm run dev` (or `npx next dev`).
- Inspect the generated `components/ui/sidebar.tsx` file to confirm that Neobrutalism classes (`border-4 border-black`, `shadow-[4px_4px_0_0_#000]`) are present in `sidebarMenuButtonVariants`.
- Verify `app/layout.tsx` includes `<TooltipProvider>`.
- The `npx tsc --noEmit` and `npm run lint` commands should pass without errors regarding the sidebar.
