# Place View Project

## Project Overview

**Place View** is a multi-platform application for viewing places and webcams, likely focusing on mountain/ski resort areas (inferred from `resources/places.json`).

The project is structured as a monorepo containing:

* **Admin web app tools:** SvelteKit applications to manage places easily (`admin-tools`)
* **Web Applications:** SvelteKit applications (`webapp`,).
* **Swift Application:** An swift mobile and desktop application (`swift-app`) built with SwiftUI.
* **Data:** Shared JSON resources in the `resources` directory.

## Directory Structure

* **`admin-tools/`**: Admin Dashboard.
  * **Stack:** SvelteKit, Svelte 5, Tailwind CSS 4, Vite 5.
  * **Architecture:** Clean Architecture + Atomic Design.
  * **Testing:** Vitest (Unit), Playwright (E2E).
* **`webapp/`**: Public Web Application.
  * **Stack:** SvelteKit, Svelte 5, Tailwind CSS 3, Vite 5.
  * **Architecture:** Clean Architecture + Atomic Design.
  * **Testing:** Vitest, Playwright.
* **`swift-app/`**: iOS Application.
  * **Stack:** SwiftUI.
  * **Project File:** `swift-app/place-view.xcodeproj`.
* **`resources/`**: Shared data files (JSON) containing information about places and webcams.
  * **`resources/places.json`**: the unique source of places and webcams.
  * **`resources/inspirations`**: some data source captured over the time but not to use.
* **`specs/`**: Documentation and specifications for features and migrations.
* **`.specify/`**: Configuration and templates for the Specify agent workflow.

## Admin Tools Architecture (`admin-tools-svelte`)

The project follows **Clean Architecture** and **Atomic Design** principles:

* **Domain Layer (`src/lib/domain`)**: Core business entities and interfaces (e.g., `Place`, `Webcam`). No framework dependencies.
* **Service Layer (`src/lib/services`)**: Business logic (e.g., `PlaceService`). Depends only on Domain and Repositories.
* **Repository Layer (`src/lib/repositories`)**: Data access implementations (e.g., `JSONPlaceRepository`).
* **Presentation Layer (`src/lib/components`)**:
  * **Atoms**: Basic UI elements (Button, Input).
  * **Molecules**: Simple combinations (FormField, SearchBar).
  * **Organisms**: Complex sections (PlaceForm, PlaceList).
* **Server Layer (`src/lib/server`)**: SvelteKit server-side singleton instances (e.g., `services.ts`).

## Building and Running

### Web Projects (`admin-tools`, `webapp`)

All web projects use `pnpm` as the package manager.

**Global Setup:**

```bash
pnpm install
```

**`admin-tools` (SvelteKit):**

```bash
cd admin-tools
pnpm dev      # Start development server
pnpm build    # Build for production
pnpm check    # Run Svelte check
pnpm test     # Run Unit (Vitest) and E2E (Playwright) tests
pnpm format   # Format code with Prettier
```

**`webapp` (SvelteKit):**

```bash
cd webapp
pnpm dev      # Start development server
pnpm build    # Build for production
pnpm check    # Run Svelte check
pnpm test     # Run Unit (Vitest) and E2E (Playwright) tests
pnpm format   # Format code with Prettier
```

### iOS Application (`swift-app`)

* **Open:** Open `swift-app/place-view.xcodeproj` in Xcode.
* **Build/Run:** Use Xcode standard build and run commands (Cmd+R).
* **Requirements:** macOS with Xcode installed.

## Development Conventions

* **Monorepo:** The project is a monorepo. Shared resources are in `resources/`.
* **Migration:** There is an active effort to migrate the admin tools from Next.js to SvelteKit (see `specs/001-migrate-admin-svelte`).
* **Styling:** Tailwind CSS is the standard for styling across web projects.
* **Testing:**
  * **Unit:** Vitest is used for unit testing in all web projects.
  * **E2E:** Playwright is used for end-to-end testing in SvelteKit projects.
* **Linting & Formatting:** ESLint and Prettier are configured for all web projects.
