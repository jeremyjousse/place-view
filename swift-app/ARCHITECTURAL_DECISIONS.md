# Architectural Decisions and Trade-offs

## Overview

This document explains key architectural decisions made during the Clean Architecture refactoring and the pragmatic trade-offs accepted.

## Decision 1: Platform-Specific Types in Domain Layer

### Issue
The Domain layer uses `PlatformImage` (which is a typealias for `UIImage`/`NSImage`), violating pure Clean Architecture where the Domain layer should be completely platform-independent.

### Decision
**Accept this trade-off** for the following reasons:

1. **Swift/SwiftUI Context**: This is a Swift application targeting iOS and macOS, not a truly multi-platform application. The "platform independence" here is between iOS and macOS, both of which share the same architecture.

2. **Practical Necessity**: SwiftUI Views need to display images using `Image(uiImage:)` or `Image(nsImage:)`, which require `UIImage`/`NSImage`. Creating a completely platform-agnostic abstraction would add significant complexity with minimal benefit.

3. **Type Safety**: `PlatformImage` provides type safety at compile time and is conditionally compiled for the correct platform.

4. **Shared in Utils**: We've consolidated the typealias in `Utils/PlatformTypes.swift` to avoid duplication.

### Alternative Considered
Create a domain-specific `DomainImage` wrapper:
```swift
struct DomainImage {
    let data: Data
    let width: CGFloat
    let height: CGFloat
}
```

**Why Rejected**: Would require conversion to/from `PlatformImage` throughout the app, adding complexity without meaningful benefit for iOS/macOS apps.

## Decision 2: Image Processing in Use Cases

### Issue
`LoadWebcamImagesUseCase` performs image processing (resize, crop) with hardcoded values, which could be considered too detailed for a Use Case.

### Decision
**Accept this as appropriate** for the following reasons:

1. **Business Logic**: The thumbnail size (50x50) and processing steps are business requirements, not technical implementation details.

2. **Domain Concern**: How thumbnails are displayed is a domain concern - the app shows thumbnails in a specific way as part of its user experience.

3. **Reusability**: This logic is used consistently across the app and encapsulating it in the Use Case ensures consistency.

### Improvement
If thumbnail sizes become configurable or vary by context, this could be refactored:
```swift
func loadThumbnails(for webcams: [Webcam], size: CGSize) async -> [ThumbnailImg]
```

## Decision 3: Error Handling in ImageLoader

### Issue
`ImageLoader.loadImage()` returns an empty `PlatformImage()` on failure instead of throwing an error or returning `nil`.

### Decision
**Accept this pattern** for the following reasons:

1. **Graceful Degradation**: The app continues to function even if some images fail to load, showing placeholders instead of crashing.

2. **User Experience**: Better to show an empty thumbnail than to fail the entire gallery loading.

3. **Async Context**: The code already prints errors for debugging; a nil check would add complexity in the async task group.

### Future Enhancement
Could be improved with:
```swift
func loadImage(url: URL) async throws -> PlatformImage
// And handle errors in the Use Case with proper retry logic
```

## Decision 4: CoreGraphics Import in Domain Layer

### Issue
`LoadWebcamImagesUseCase` imports `CoreGraphics` for `CGSize`, which is platform-specific.

### Decision
**Accept this trade-off** for the following reasons:

1. **Foundation of Apple Platforms**: `CoreGraphics` is fundamental to both iOS and macOS. It's not adding platform variance in our context.

2. **Type Requirement**: `CGSize` is needed to specify dimensions, which is a domain concept (thumbnail size).

3. **Standard Library**: Like `Foundation`, `CoreGraphics` is effectively part of the standard library for Apple platform development.

### Alternative Considered
Create domain-specific size types:
```swift
struct Size {
    let width: Double
    let height: Double
}
```

**Why Rejected**: Would require constant conversion to/from `CGSize` without any real benefit.

## Decision 5: Shared Model Directory

### Issue
`ThumbnailImg` is in the Models directory but uses `PlatformImage`, mixing platform-specific and domain concepts.

### Decision
**Accept this organization** for the following reasons:

1. **Single Responsibility**: `ThumbnailImg` is a simple data structure used across layers.

2. **Practical Location**: The Models directory serves as a shared space for these cross-layer data structures.

3. **Clear Ownership**: While it uses a platform type, its purpose is domain-driven (representing thumbnails for the UI).

## General Principles Applied

### Pragmatic Clean Architecture
We follow Clean Architecture principles where they provide clear value:
- ✅ Separation of concerns (layers)
- ✅ Dependency rule (inward dependencies)
- ✅ Testability (mock repositories and use cases)
- ✅ Business logic isolation (in Use Cases)

But we make pragmatic compromises when:
- Pure abstraction adds complexity without benefit
- Platform reality makes pure independence impractical
- User experience improvements outweigh theoretical purity

### Swift/iOS Context Matters
This is not a generic application that might run on:
- Web browsers
- Android devices
- Backend servers

It's a Swift/SwiftUI app for Apple platforms. Our architecture decisions reflect this reality while still maintaining the core benefits of Clean Architecture.

## Comparison with TypeScript Admin Tools

The admin-tools project is more "purely" Clean Architecture because:
1. JavaScript runs in more varied environments (Node, browsers)
2. TypeScript doesn't have the same platform/framework coupling as Swift/SwiftUI
3. It uses JSON for data transfer, which is naturally platform-agnostic

The Swift app maintains the same **principles** (layers, dependency rule, testability) while adapting to the Swift/iOS reality.

## Conclusion

These decisions represent **pragmatic Clean Architecture** - following principles where they add value, while making informed trade-offs when pure adherence would add complexity without proportional benefit.

The architecture successfully achieves:
- ✅ Clear separation of concerns
- ✅ High testability
- ✅ Maintainable codebase
- ✅ Consistency with project patterns
- ✅ Industry best practices adapted to context

## When to Revisit

Consider revisiting these decisions if:
1. The app needs to support truly different platforms (e.g., server-side Swift)
2. Image processing becomes complex enough to warrant its own service
3. We need to support multiple image backends (different providers)
4. Testing requirements change significantly
