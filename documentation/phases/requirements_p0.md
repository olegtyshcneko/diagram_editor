# Phase 0: Project Setup & Infrastructure - Requirements

## Document Information

| Field | Value |
|-------|-------|
| Phase | 0 |
| Status | Active |
| Dependencies | None (Starting Phase) |
| Deployable | No - Setup only |

---

## Phase Overview

Phase 0 establishes the foundational project infrastructure. This phase focuses on tooling setup, configuration, and creating the base project structure that all subsequent phases will build upon.

### Goals

1. Initialize a modern React + TypeScript project using Vite
2. Configure Tailwind CSS for utility-first styling
3. Install and configure shadcn/ui component library
4. Set up Zustand for state management
5. Create the project folder structure
6. Define base TypeScript types and constants
7. Create a minimal app shell to verify setup

---

## Setup Tasks

### ST-01: Initialize Vite Project

**Task:** Create a new Vite project with React and TypeScript template

**Acceptance Criteria:**
- Project initialized with `npm create vite@latest`
- React 19+ and TypeScript configured
- Development server runs without errors
- Hot Module Replacement (HMR) works correctly

---

### ST-02: Configure Tailwind CSS v4

**Task:** Install and configure Tailwind CSS v4 with Vite plugin

**Acceptance Criteria:**
- Tailwind CSS v4 installed with `@tailwindcss/vite` plugin
- Vite config includes tailwindcss plugin
- `@import "tailwindcss";` in main CSS file
- `@theme` block for custom theme variables (optional)
- Utility classes work in components

> **Note:** Tailwind v4 uses a simplified configuration approach - no separate `tailwind.config.js` or `postcss.config.js` required.

---

### ST-03: Install shadcn/ui

**Task:** Set up shadcn/ui component library

**Acceptance Criteria:**
- shadcn/ui CLI initialized (`npx shadcn-ui@latest init`)
- `components.json` configuration file created
- Path aliases configured in `tsconfig.json`
- Base components directory created at `src/components/ui`
- At least one component installed to verify setup (e.g., Button)

---

### ST-04: Configure Zustand

**Task:** Install Zustand and create store skeleton

**Acceptance Criteria:**
- Zustand installed as dependency
- Store directory created at `src/stores`
- Skeleton store files created (empty but typed)
- Store can be imported and used in components

---

### ST-05: Create Project Structure

**Task:** Create the complete folder structure for the application

**Acceptance Criteria:**
- All directories created as per initial_spec.md
- README files or .gitkeep in empty directories
- Structure matches planned architecture

---

### ST-06: Define Base Types

**Task:** Create TypeScript type definitions for core entities

**Acceptance Criteria:**
- `src/types/` directory with type files
- Shape interface defined (even if minimal)
- Connection interface defined
- Tool types defined
- Point and Bounds utility types defined

---

### ST-07: Create Constants File

**Task:** Define application constants

**Acceptance Criteria:**
- `src/lib/constants.ts` created
- Default values defined (colors, sizes, grid settings)
- Constants are typed and exported

---

### ST-08: Create App Shell

**Task:** Create minimal application layout to verify setup

**Acceptance Criteria:**
- Basic layout component with header, sidebar, canvas area, property panel placeholders
- Tailwind classes applied and working
- At least one shadcn/ui component rendered
- App runs without console errors

---

## Features Included

1. **Build System**
   - Vite with React + TypeScript template
   - Fast development server with HMR
   - Production build configuration

2. **Styling System**
   - Tailwind CSS v4 with Vite plugin
   - `@theme` blocks for custom CSS variables
   - Responsive design utilities

3. **Component Library**
   - shadcn/ui base setup
   - Radix UI primitives available
   - Component customization ready

4. **State Management**
   - Zustand store skeleton
   - TypeScript-first approach
   - Devtools ready (optional)

5. **Project Architecture**
   - Organized folder structure
   - Separation of concerns
   - Scalable organization

6. **TypeScript Foundation**
   - Strict type checking enabled
   - Base interfaces defined
   - Path aliases configured

---

## Features Excluded (Deferred)

- Actual canvas implementation (Phase 1)
- Shape rendering (Phase 2)
- Any user-facing features (Phase 1+)
- Database/Supabase setup (Phase 10/Future)
- Testing framework setup (can be added later)
- CI/CD configuration (can be added later)
- Linting/Prettier (recommended but optional for MVP)

---

## Dependencies on Previous Phases

None - This is the starting phase.

### External Dependencies (npm packages)

| Package | Purpose | Version |
|---------|---------|---------|
| react | UI framework | ^19.2.0 |
| react-dom | React DOM renderer | ^19.2.0 |
| typescript | Type checking | ^5.0.0 |
| vite | Build tool | ^7.2.0 |
| tailwindcss | CSS framework | ^4.1.0 |
| @tailwindcss/vite | Tailwind Vite plugin | ^4.1.0 |
| zustand | State management | ^5.0.0 |
| @radix-ui/* | UI primitives (via shadcn) | latest |
| class-variance-authority | Component variants | ^0.7.0 |
| clsx | Class name utility | ^2.1.0 |
| tailwind-merge | Tailwind class merging | ^2.2.0 |
| lucide-react | Icons | latest |

> **Note:** Tailwind v4 no longer requires `postcss` and `autoprefixer` as separate dependencies.

---

## Definition of Done

- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts development server
- [ ] Browser shows app shell at localhost:5173
- [ ] Tailwind classes apply correctly
- [ ] At least one shadcn/ui component renders
- [ ] TypeScript compilation succeeds with no errors
- [ ] Zustand store can be imported (even if empty)
- [ ] All planned directories exist
- [ ] Base type files are present and valid
- [ ] Constants file exports default values
- [ ] No console errors in browser
- [ ] Hot reload works when editing components

---

## Test Scenarios

Since this is a setup phase, testing is primarily manual verification:

1. **Build Verification**
   - Run `npm run build` - should complete without errors
   - Check `dist/` folder is created with assets

2. **Development Server**
   - Run `npm run dev` - should start on port 5173
   - Navigate to localhost:5173 - should show app shell

3. **Tailwind Verification**
   - Add a `bg-blue-500` class to an element
   - Verify blue background appears

4. **shadcn/ui Verification**
   - Import and render a Button component
   - Verify it renders with correct styling

5. **Zustand Verification**
   - Import a store in a component
   - Log store state to console - should not error

6. **TypeScript Verification**
   - Import a type from types directory
   - Use it in a component - should have autocomplete

---

## Notes for Implementation

### Vite Configuration

Ensure `vite.config.ts` includes:
- Path aliases matching tsconfig
- React plugin configured
- Tailwind CSS v4 plugin (`@tailwindcss/vite`)

### TypeScript Configuration

Ensure `tsconfig.json` includes:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### shadcn/ui Configuration

When running `npx shadcn@latest init`, select:
- TypeScript: Yes
- Style: Default (or New York)
- Base color: Slate (or preference)
- CSS variables: Yes
- Components location: src/components/ui
- Utils location: src/lib/utils

> **Note:** With Tailwind v4, shadcn/ui may prompt differently - follow the interactive prompts.

### Tailwind v4 CSS Setup

Main CSS file (`src/index.css`) should include:
```css
@import "tailwindcss";

@theme {
  /* Custom theme variables go here */
}
```

### Recommended VS Code Extensions

- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets
