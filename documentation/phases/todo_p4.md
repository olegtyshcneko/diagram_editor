# Phase 4: Styling & Properties - Todo List

## Status: Completed

## Tasks

### Step 0: Store Refactoring (Pre-requisite)
- [x] Create viewportStore.ts (viewport, pan state)
- [x] Create interactionStore.ts (tools, creation, manipulation)
- [x] Create preferencesStore.ts with localStorage persistence
- [x] Update all files using useUIStore to new stores
- [x] Delete uiStore.ts after migration
- [x] Verify app works after refactor

### Step 1: Install shadcn/ui Components
- [x] Install input, label, slider, select, popover, separator

### Step 2: Color Utilities
- [x] Create color-utils.ts with validation, conversion, presets

### Step 3-5: UI Components
- [x] Create NumberInput component
- [x] Create ColorSwatch component
- [x] Create ColorPicker component

### Step 6: Hook
- [x] Create useSelectedShapes hook

### Step 7: Property Panel Sections
- [x] Create PositionSection
- [x] Create DimensionsSection
- [x] Create RotationSection
- [x] Create FillSection
- [x] Create StrokeSection
- [x] Create CornerRadiusSection

### Step 8-9: PropertyPanel Integration
- [x] Create PropertyPanel component
- [x] Integrate into AppShell

### Testing
- [x] Store split works - all existing features functional
- [x] Build passes with TypeScript
- [x] Recent colors persist after page refresh (manual test - user verified)
- [x] Panel collapsed state persists (manual test - user verified)
- [x] All styling features work correctly (manual test - user verified)
- [x] Integer rounding for x, y, width, height, rotation values
- [x] Adaptive selection handles for small shapes (UX improvement)
- [x] No Stroke option with disabled width/style controls

## Completed Summary

| Task | Status | Notes |
|------|--------|-------|
| Step 0: Store Refactoring | Done | Split uiStore into viewportStore, interactionStore, preferencesStore (with localStorage persistence) |
| Step 1: shadcn/ui Components | Done | Installed input, label, slider, select, popover, separator |
| Step 2: Color Utilities | Done | Created color-utils.ts with hex validation, RGB conversion, contrast calculation, and 64 preset colors |
| Step 3: NumberInput | Done | Supports mixed values, arrow key increment, validation on blur |
| Step 4: ColorSwatch | Done | Checkmark overlay with contrast color, checkerboard for transparent |
| Step 5: ColorPicker | Done | Popover with hex input, recent colors, preset grid, opacity slider |
| Step 6: useSelectedShapes hook | Done | Aggregates properties, returns 'mixed' for differing values |
| Step 7: Property Panel Sections | Done | Created all 6 sections: Position, Dimensions, Rotation, Fill, Stroke, CornerRadius |
| Step 8: PropertyPanel | Done | Collapsible panel with all sections, shows "Select a shape" when empty |
| Step 9: AppShell Integration | Done | Replaced placeholder aside with PropertyPanel component |
| Integer Rounding | Done | Added Math.round() to move, resize, rotate, and creation hooks |
| Adaptive Handles | Done | Hide edge handles when shape < 50px, shrink handles at 40px (6px) and 20px (4px) |
| No Stroke Option | Done | Added transparent stroke support, width/style controls disabled when no stroke |

## Files Created

| Path | Purpose |
|------|---------|
| src/stores/viewportStore.ts | Viewport, zoom, pan state |
| src/stores/interactionStore.ts | Tools, creation, manipulation state |
| src/stores/preferencesStore.ts | User preferences with localStorage persistence |
| src/lib/color-utils.ts | Color validation, conversion, presets |
| src/components/ui/NumberInput.tsx | Validated number input with mixed value support |
| src/components/ui/ColorSwatch.tsx | Single color button with checkmark |
| src/components/ui/ColorPicker.tsx | Popover color picker with presets |
| src/hooks/useSelectedShapes.ts | Aggregate selected shape properties |
| src/components/panels/PropertyPanel.tsx | Main property panel container |
| src/components/panels/sections/PositionSection.tsx | X, Y inputs |
| src/components/panels/sections/DimensionsSection.tsx | Width, Height inputs |
| src/components/panels/sections/RotationSection.tsx | Rotation input |
| src/components/panels/sections/FillSection.tsx | Fill color + opacity |
| src/components/panels/sections/StrokeSection.tsx | Stroke color, width, style |
| src/components/panels/sections/CornerRadiusSection.tsx | Corner radius slider + input |
| src/components/panels/sections/index.ts | Re-exports all sections |

## Files Deleted

| Path | Reason |
|------|--------|
| src/stores/uiStore.ts | Split into 3 focused stores |
