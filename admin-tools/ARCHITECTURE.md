# Architecture Documentation: Admin Tools Svelte

This project uses a layered architecture inspired by Clean Architecture and Atomic Design.

## 1. Directory Structure

```
src/lib/
├── components/       # UI Components (Atomic Design)
│   ├── atoms/        # Smallest units (Button, Input, Icon)
│   ├── molecules/    # Combinations (FormField, SearchBar)
│   └── organisms/    # Complex sections (PlaceForm, PlaceList)
├── domain/           # Core Logic & Types (Framework Agnostic)
│   ├── Place.ts
│   ├── schemas.ts    # Zod Schemas
│   └── ...
├── services/         # Business Logic
│   ├── IPlaceService.ts
│   ├── PlaceService.ts
│   └── ...
├── repositories/     # Data Access
│   ├── IPlaceRepository.ts
│   ├── JSONPlaceRepository.ts
│   └── ...
└── server/           # Server-side Composition
    └── services.ts   # Dependency Injection / Factory
```

## 2. Layers

### Domain Layer (`src/lib/domain`)

Contains the core entities and business rules. It has **zero dependencies** on frameworks (SvelteKit) or external libraries (except Zod for validation schemas).

### Service Layer (`src/lib/services`)

Orchestrates business logic.

- Implements use cases (e.g., `savePlace`, `updateWebcams`).
- Accepts `Repository` interfaces via constructor (Dependency Injection).
- Uses Zod schemas for validation.

### Repository Layer (`src/lib/repositories`)

Handles data persistence.

- Implements `Repository` interfaces defined in the domain/service layer.
- Currently uses `JSONPlaceRepository` to read/write to a local JSON file.

### Presentation Layer (`src/lib/components`)

Organized by Atomic Design.

- **Atoms**: dumb components, pure rendering.
- **Molecules**: slightly more complex, composed of atoms.
- **Organisms**: business-aware components (forms, lists).

### Server Layer (`src/lib/server`)

Wiring everything together.

- `services.ts` instantiates repositories and services as singletons.
- Route handlers (`+page.server.ts`) import from here.

## 3. Adding New Features

1.  **Domain**: Define the interface/type in `domain/`.
2.  **Service**: Create an interface and implementation in `services/`. Write Unit Tests.
3.  **Repository**: Implement data access in `repositories/`.
4.  **UI**: Build components in `components/` (Atom -> Molecule -> Organism).
5.  **Route**: Wire it up in `+page.server.ts`.
