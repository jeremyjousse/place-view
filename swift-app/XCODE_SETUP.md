# Adding New Files to Xcode Project

## Files Created

The refactoring to Clean Architecture + MVVM has created new files that need to be added to the Xcode project manually.

### Steps to Add Files

1. Open `place-view.xcodeproj` in Xcode
2. Add the following directories and files to the project:

#### Domain Layer

- `place-view/Domain/PlaceRepositoryProtocol.swift`
- `place-view/Domain/FavoritesRepositoryProtocol.swift`
- `place-view/Domain/ImageLoaderProtocol.swift`
- `place-view/Domain/UseCases/FetchPlacesUseCase.swift`
- `place-view/Domain/UseCases/ManageFavoritesUseCase.swift`
- `place-view/Domain/UseCases/LoadWebcamImagesUseCase.swift`

#### Data Layer

- `place-view/Data/Repositories/PlaceRepository.swift`
- `place-view/Data/Repositories/FavoritesRepository.swift`
- `place-view/Data/Repositories/ImageLoader.swift`

#### Presentation Layer

- `place-view/Presentation/ViewModels/PlaceListViewModel.swift`
- `place-view/Presentation/ViewModels/PlaceDetailViewModel.swift`
- `place-view/Presentation/ViewModels/FavoritesViewModel.swift`

#### Dependency Injection

- `place-view/DI/DependencyContainer.swift`

#### Models

- `place-view/Models/ThumbnailImg.swift`

#### Utilities

- `place-view/Utils/PlatformImageExtensions.swift`
- `place-view/Utils/PlatformTypes.swift`

#### Tests

- `place-viewTests/FetchPlacesUseCaseTests.swift`
- `place-viewTests/ManageFavoritesUseCaseTests.swift`

### How to Add Files in Xcode

1. Right-click on the group/folder in the Project Navigator
2. Select "Add Files to 'place-view'..."
3. Navigate to the file location
4. Ensure "Copy items if needed" is **unchecked** (files are already in place)
5. Ensure the correct target is selected (place-view for app files, place-viewTests for test files)
6. Click "Add"

### File Organization in Xcode

Organize the files in Xcode to match the directory structure:

```text
place-view
├── Domain
│   ├── Protocols
│   │   ├── PlaceRepositoryProtocol.swift
│   │   ├── FavoritesRepositoryProtocol.swift
│   │   └── ImageLoaderProtocol.swift
│   └── UseCases
│       ├── FetchPlacesUseCase.swift
│       ├── ManageFavoritesUseCase.swift
│       └── LoadWebcamImagesUseCase.swift
├── Data
│   └── Repositories
│       ├── PlaceRepository.swift
│       ├── FavoritesRepository.swift
│       └── ImageLoader.swift
├── Presentation
│   └── ViewModels
│       ├── PlaceListViewModel.swift
│       ├── PlaceDetailViewModel.swift
│       └── FavoritesViewModel.swift
├── Models
│   ├── Place.swift
│   ├── ThumbnailImg.swift
│   └── ... (existing models)
├── DI
│   └── DependencyContainer.swift
├── Utils
│   ├── PlatformTypes.swift
│   └── PlatformImageExtensions.swift
├── ... (existing files)
```

### Deprecated Files

The following files can be marked as deprecated or removed after verification:

- `Models/PlaceFetcher.swift` (replaced by `PlaceListViewModel`)
- `Models/PlaceFavorites.swift` (replaced by `FavoritesViewModel`)
- `ViewModels/PlaceViewModel.swift` (replaced by `PlaceDetailViewModel`)

### Build and Test

After adding all files:

1. Build the project (⌘B) to ensure no compilation errors
2. Run tests (⌘U) to verify all tests pass
3. Run the app to verify functionality

## Troubleshooting

If you encounter build errors:

- Ensure all files are added to the correct target
- Check that import statements are correct
- Verify that the module name is `place_view` (with underscore)
- Clean build folder (⌘⇧K) and rebuild
