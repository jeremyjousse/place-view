# Migration Guide: Clean Architecture + MVVM

## Overview

This guide documents the migration from the previous architecture to Clean Architecture + MVVM pattern.

## What Changed

### Architecture Changes

#### Before
```
Views → ViewModels/ObservableObjects → ApiClient/UserDefaults
```

#### After
```
Views → ViewModels → Use Cases → Repositories → Data Sources
```

### File Changes

| Old File | New File(s) | Status |
|----------|------------|---------|
| `Models/PlaceFetcher.swift` | `Presentation/ViewModels/PlaceListViewModel.swift` | **Replaced** |
| `Models/PlaceFavorites.swift` | `Presentation/ViewModels/FavoritesViewModel.swift` | **Replaced** |
| `ViewModels/PlaceViewModel.swift` | `Presentation/ViewModels/PlaceDetailViewModel.swift` | **Replaced** |
| `Clients/ApiClient.swift` | `Clients/ApiClient.swift` (unchanged) + `Data/Repositories/PlaceRepository.swift` | **Wrapped** |
| N/A | `Domain/UseCases/*` | **New** |
| N/A | `Domain/*RepositoryProtocol.swift` | **New** |
| N/A | `Data/Repositories/*` | **New** |
| N/A | `DI/DependencyContainer.swift` | **New** |

### API Changes

#### ContentView

**Before:**
```swift
struct ContentView: View {
    @StateObject var placeFetcher = PlaceFetcher()
    
    var body: some View {
        PlaceNavigation(places: placeFetcher.places)
            .environmentObject(placeFetcher)
    }
}
```

**After:**
```swift
struct ContentView: View {
    @StateObject var placeListViewModel = DependencyContainer.shared.makePlaceListViewModel()
    
    var body: some View {
        PlaceNavigation(places: placeListViewModel.places)
            .environmentObject(placeListViewModel)
    }
}
```

#### PlaceNavigation

**Before:**
```swift
@EnvironmentObject var placeFetcher: PlaceFetcher
@ObservedObject var favorites = PlaceFavorites.sharedInstance
```

**After:**
```swift
@EnvironmentObject var placeListViewModel: PlaceListViewModel
@ObservedObject var favorites = FavoritesViewModel.shared
```

#### PlaceView

**Before:**
```swift
init(place: Place) {
    self.place = place
    _viewModel = StateObject(wrappedValue: PlaceViewModel(webcams: place.webcams))
}

.task {
    await viewModel.loadParallel()
}
```

**After:**
```swift
init(place: Place) {
    self.place = place
    _viewModel = StateObject(wrappedValue: DependencyContainer.shared.makePlaceDetailViewModel(webcams: place.webcams))
}

.task {
    await viewModel.loadThumbnails()
}
```

#### FavoriteButton

**Before:**
```swift
@ObservedObject var favorites = PlaceFavorites.sharedInstance
```

**After:**
```swift
@ObservedObject var favorites = FavoritesViewModel.shared
```

## Benefits of the New Architecture

### 1. Testability
- Each layer can be tested independently
- Mock implementations for protocols make unit testing easy
- Tests don't depend on real network calls or storage

**Example:**
```swift
let mockRepository = MockPlaceRepository()
let useCase = FetchPlacesUseCase(placeRepository: mockRepository)
let places = try await useCase.execute()
```

### 2. Separation of Concerns
- Business logic (Use Cases) is separate from data access (Repositories)
- ViewModels don't know about data sources
- Easy to change data sources without affecting business logic

### 3. Dependency Injection
- All dependencies are injected through constructors
- DependencyContainer manages object creation
- Easy to swap implementations for testing or feature flags

### 4. Reusability
- Use Cases can be shared across multiple ViewModels
- Repositories can be shared across multiple Use Cases
- No tight coupling between layers

### 5. Maintainability
- Clear structure makes code easier to navigate
- Changes in one layer don't cascade to others
- Follows industry-standard patterns

## Testing Strategy

### Unit Tests

**Use Case Tests:**
```swift
final class FetchPlacesUseCaseTests: XCTestCase {
    func testFetchPlacesReturnsDataFromRepository() async throws {
        let mockRepository = MockPlaceRepository()
        let useCase = FetchPlacesUseCase(placeRepository: mockRepository)
        let places = try await useCase.execute()
        XCTAssertEqual(places.count, 2)
    }
}
```

**ViewModel Tests:**
```swift
@MainActor
final class PlaceListViewModelTests: XCTestCase {
    func testFetchPlacesUpdatesPublishedProperties() async {
        let mockUseCase = MockFetchPlacesUseCase()
        let viewModel = PlaceListViewModel(fetchPlacesUseCase: mockUseCase)
        await viewModel.fetchAllPlaces()
        XCTAssertEqual(viewModel.places.count, 2)
    }
}
```

### Integration Tests

UI tests remain unchanged as the View layer interface hasn't changed significantly.

## Migration Checklist

- [x] Create Domain layer with protocols and use cases
- [x] Create Data layer with repository implementations
- [x] Create Presentation layer with new ViewModels
- [x] Create DependencyContainer for DI
- [x] Update Views to use new ViewModels
- [x] Add unit tests for Use Cases
- [ ] Add files to Xcode project (requires Xcode)
- [ ] Build and verify no compilation errors
- [ ] Run existing tests to ensure no regressions
- [ ] Run new unit tests to verify architecture
- [ ] Manual testing of all features
- [ ] Remove deprecated files after verification

## Backward Compatibility

The old files (`PlaceFetcher`, `PlaceFavorites`, `PlaceViewModel`) are kept temporarily for reference. They should be removed after:

1. Verifying the app builds successfully
2. All tests pass
3. Manual testing confirms all features work
4. Team review is complete

## Future Improvements

1. **Add More Tests**: Increase test coverage for ViewModels and Repositories
2. **Error Handling**: Implement more sophisticated error handling in Use Cases
3. **Caching Strategy**: Add repository-level caching for better performance
4. **Mock Server**: Add mock API for development and testing
5. **Feature Flags**: Use DI to enable/disable features dynamically

## Questions or Issues?

If you encounter any problems during migration:
1. Check XCODE_SETUP.md for file addition instructions
2. Review ARCHITECTURE.md for architecture overview
3. Consult the example tests for usage patterns
4. Verify all dependencies are properly injected through DependencyContainer
