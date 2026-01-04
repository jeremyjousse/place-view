# Place View - iOS/macOS Application

A cross-platform application for viewing places and webcams, built with SwiftUI following Clean Architecture + MVVM principles.

## Architecture

The application follows **Clean Architecture** principles combined with **MVVM (Model-View-ViewModel)** pattern. For detailed architecture information, see [ARCHITECTURE.md](ARCHITECTURE.md).

### Key Principles

- **Separation of Concerns**: Each layer has a specific responsibility
- **Dependency Rule**: Dependencies point inward (View → ViewModel → Use Case → Repository)
- **Testability**: Each layer can be tested independently with mocks
- **Platform Independence**: Core business logic is platform-agnostic

### Layer Overview

```
┌─────────────────────────────────────────┐
│              Views Layer                │
│    (SwiftUI Views & Components)         │
└────────────────┬────────────────────────┘
                 │ observes
┌────────────────▼────────────────────────┐
│         Presentation Layer              │
│         (ViewModels)                    │
└────────────────┬────────────────────────┘
                 │ calls
┌────────────────▼────────────────────────┐
│          Domain Layer                   │
│      (Use Cases & Protocols)            │
└────────────────┬────────────────────────┘
                 │ calls
┌────────────────▼────────────────────────┐
│           Data Layer                    │
│    (Repositories & Data Sources)        │
└─────────────────────────────────────────┘
```

## Project Structure

```
swift-app/
├── place-view/
│   ├── Domain/                    # Business logic & protocols
│   │   ├── *RepositoryProtocol.swift
│   │   └── UseCases/
│   ├── Data/                      # Data access implementations
│   │   └── Repositories/
│   ├── Presentation/              # ViewModels
│   │   └── ViewModels/
│   ├── Views/                     # SwiftUI views
│   ├── Components/                # Reusable UI components
│   ├── DI/                        # Dependency injection
│   ├── Models/                    # Domain entities
│   ├── Clients/                   # API client
│   └── Utils/                     # Helper utilities
├── place-viewTests/               # Unit tests
└── place-viewUITests/             # UI tests
```

## Features

- **Place List**: Browse all available places with filtering
- **Place Details**: View webcam images and place information
- **Favorites**: Mark places as favorites for quick access
- **Map View**: View places on an interactive map
- **Webcam Gallery**: View multiple webcams for each place
- **Cross-Platform**: Runs on iOS and macOS

## Requirements

- iOS 16.0+ / macOS 13.0+
- Xcode 15.0+
- Swift 5.9+

## Getting Started

### Opening the Project

1. Open `place-view.xcodeproj` in Xcode
2. Select your target device or simulator
3. Build and run (⌘R)

### Adding New Files

After pulling changes, you may need to add new files to the Xcode project. See [XCODE_SETUP.md](XCODE_SETUP.md) for detailed instructions.

## Building & Testing

### Build
```bash
# From Xcode: ⌘B
# From command line (if available):
xcodebuild -project place-view.xcodeproj -scheme place-view build
```

### Run Tests
```bash
# From Xcode: ⌘U
# From command line (if available):
xcodebuild -project place-view.xcodeproj -scheme place-view test
```

## Development

### Adding a New Feature

1. **Define the Use Case** in `Domain/UseCases/`
2. **Create Repository Protocol** in `Domain/` (if needed)
3. **Implement Repository** in `Data/Repositories/`
4. **Create ViewModel** in `Presentation/ViewModels/`
5. **Add to DependencyContainer** in `DI/DependencyContainer.swift`
6. **Create View** in `Views/` or `Components/`
7. **Write Tests** in `place-viewTests/`

### Code Style

- Follow Swift naming conventions
- Use `// MARK: -` to organize code sections
- Keep ViewModels thin - business logic belongs in Use Cases
- Use dependency injection for testability

## Testing

The project includes unit tests for:
- Use Cases (business logic)
- ViewModels (presentation logic)
- Repositories (data access)

Example test structure:
```swift
final class FetchPlacesUseCaseTests: XCTestCase {
    func testFetchPlaces() async throws {
        let mockRepository = MockPlaceRepository()
        let useCase = FetchPlacesUseCase(placeRepository: mockRepository)
        let places = try await useCase.execute()
        XCTAssertEqual(places.count, 2)
    }
}
```

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - Detailed architecture overview
- [MIGRATION.md](MIGRATION.md) - Migration guide from previous architecture
- [XCODE_SETUP.md](XCODE_SETUP.md) - Instructions for adding new files to Xcode

## Dependencies

The app uses minimal external dependencies:
- **Kingfisher**: For efficient image loading and caching (used in WebcamView)
- **SwiftUI**: Apple's declarative UI framework
- **Combine**: For reactive programming (through ObservableObject)

## Migration from Previous Architecture

If you're working with code from before the Clean Architecture refactor, see [MIGRATION.md](MIGRATION.md) for a comprehensive migration guide.

### Key Changes
- `PlaceFetcher` → `PlaceListViewModel`
- `PlaceFavorites` → `FavoritesViewModel`
- `PlaceViewModel` → `PlaceDetailViewModel`
- New layers: Domain, Data, Use Cases

## Contributing

1. Follow the established architecture patterns
2. Write tests for new features
3. Update documentation as needed
4. Use the DependencyContainer for all dependency injection
5. Keep business logic in Use Cases, not ViewModels

## Architecture Consistency

This Swift app follows the same architectural principles as the `admin-tools` TypeScript project:
- Both use Clean Architecture
- Both separate concerns into Domain, Data, and Presentation layers
- Both use dependency injection
- Both prioritize testability

See the main project README for more information about the overall project structure.
