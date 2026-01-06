# Swift App Architecture

## Overview

The Swift application follows **Clean Architecture** principles combined with the **MVVM (Model-View-ViewModel)** pattern. This architecture provides clear separation of concerns, testability, and maintainability.

## Architecture Layers

### 1. Domain Layer (`Domain/`)

The **Domain Layer** contains the core business logic and is completely independent of any framework or external dependencies.

#### Components:

- **Protocols/Interfaces**: Define contracts for data access
  - `PlaceRepositoryProtocol`: Contract for fetching places
  - `FavoritesRepositoryProtocol`: Contract for managing favorites
  - `ImageLoaderProtocol`: Contract for loading images

- **Use Cases** (`Domain/UseCases/`): Encapsulate specific business operations
  - `FetchPlacesUseCase`: Handles fetching and processing places data
  - `ManageFavoritesUseCase`: Handles all favorite-related operations
  - `LoadWebcamImagesUseCase`: Handles loading and processing webcam images

**Key Principles:**
- No dependencies on UI frameworks or external libraries
- Pure Swift code with business logic only
- Protocols define what data is needed, not how to get it

### 2. Data Layer (`Data/`)

The **Data Layer** implements the domain protocols and handles all data access.

#### Components:

- **Repositories** (`Data/Repositories/`): Concrete implementations of domain protocols
  - `PlaceRepository`: Implements `PlaceRepositoryProtocol`, fetches places from API
  - `FavoritesRepository`: Implements `FavoritesRepositoryProtocol`, manages UserDefaults storage
  - `ImageLoader`: Implements `ImageLoaderProtocol`, loads images via URLSession

**Key Principles:**
- Implements domain protocols
- Handles all external data sources (API, local storage, etc.)
- Abstracts away implementation details from the domain

### 3. Presentation Layer (`Presentation/`)

The **Presentation Layer** contains ViewModels that act as intermediaries between Views and Use Cases.

#### Components:

- **ViewModels** (`Presentation/ViewModels/`):
  - `PlaceListViewModel`: Manages state for the place list view
  - `PlaceDetailViewModel`: Manages state for place detail view
  - `FavoritesViewModel`: Manages favorites state (singleton)

**Key Principles:**
- ViewModels depend only on Use Cases, never on repositories directly
- ViewModels are `@MainActor` for UI updates
- Use `@Published` properties for reactive UI updates
- Marked as `ObservableObject` for SwiftUI integration

### 4. View Layer (`Views/`, `Components/`)

SwiftUI Views that render UI and respond to user interactions.

#### Components:

- **Views**: Full screen views (`PlaceView`, `LoadingView`, `ErrorView`)
- **Components**: Reusable UI components (`FavoriteButton`, `MapView`, `PlaceRow`, etc.)

**Key Principles:**
- Views observe ViewModels using `@StateObject` or `@ObservedObject`
- Views should be as "dumb" as possible, delegating logic to ViewModels
- Components are reusable and composable

### 5. Dependency Injection (`DI/`)

The **DI Layer** manages object creation and dependencies.

#### Components:

- `DependencyContainer`: Centralized factory for creating all dependencies

**Key Principles:**
- Singleton pattern for the container itself
- Lazy initialization of repositories
- Factory methods for ViewModels
- Makes testing easier by allowing dependency injection

### 6. Legacy Files

Some files remain from the previous architecture and should be considered deprecated:

- `Models/PlaceFetcher.swift` → Replaced by `PlaceListViewModel`
- `Models/PlaceFavorites.swift` → Replaced by `FavoritesViewModel`
- `ViewModels/PlaceViewModel.swift` → Replaced by `PlaceDetailViewModel`

These files are kept temporarily to avoid breaking changes but should be removed after verification.

## Data Flow

```
View
  ↓ (observes)
ViewModel
  ↓ (calls)
Use Case
  ↓ (calls)
Repository (Protocol)
  ↓ (implements)
Repository (Implementation)
  ↓ (fetches from)
Data Source (API, Local Storage, etc.)
```

## Example: Fetching Places

1. **View** (`ContentView`) creates a `PlaceListViewModel` via `DependencyContainer`
2. **ViewModel** (`PlaceListViewModel`) calls `FetchPlacesUseCase.execute()`
3. **Use Case** (`FetchPlacesUseCase`) calls `PlaceRepositoryProtocol.fetchPlaces()`
4. **Repository** (`PlaceRepository`) uses `ApiClient` to fetch from API
5. Data flows back up: Repository → Use Case → ViewModel → View

## Benefits

1. **Testability**: Each layer can be tested independently with mocks
2. **Maintainability**: Clear separation of concerns makes code easier to understand
3. **Flexibility**: Easy to swap implementations (e.g., different data sources)
4. **Scalability**: Well-organized structure supports growth
5. **Reusability**: Use Cases and Repositories can be reused across different ViewModels

## Testing Strategy

- **Domain Layer**: Unit test Use Cases with mocked repositories
- **Data Layer**: Unit test Repositories with mocked data sources
- **Presentation Layer**: Unit test ViewModels with mocked Use Cases
- **View Layer**: UI tests for integration testing

## Comparison with Admin Tools Architecture

The Swift app architecture mirrors the TypeScript architecture in `admin-tools`:

| TypeScript (admin-tools) | Swift (swift-app) |
|--------------------------|-------------------|
| `src/lib/domain/` | `Domain/` |
| `src/lib/services/` | `Domain/UseCases/` |
| `src/lib/repositories/` | `Data/Repositories/` |
| `src/lib/components/` | `Views/`, `Components/` |
| `src/lib/server/services.ts` | `DI/DependencyContainer.swift` |

Both follow the same Clean Architecture principles for consistency across the codebase.
