//
//  ManageFavoritesUseCaseTests.swift
//  place-viewTests
//
//  Unit tests for ManageFavoritesUseCase

import XCTest
@testable import place_view

final class ManageFavoritesUseCaseTests: XCTestCase {
    
    var mockRepository: MockFavoritesRepository!
    var useCase: ManageFavoritesUseCase!
    
    override func setUp() {
        super.setUp()
        mockRepository = MockFavoritesRepository()
        useCase = ManageFavoritesUseCase(favoritesRepository: mockRepository)
    }
    
    func testAddFavoriteAddsToRepository() {
        // Given
        let placeId = "place123"
        
        // When
        useCase.addFavorite(placeId: placeId)
        
        // Then
        XCTAssertTrue(mockRepository.favorites.contains(placeId))
        XCTAssertTrue(useCase.isFavorite(placeId: placeId))
    }
    
    func testRemoveFavoriteRemovesFromRepository() {
        // Given
        let placeId = "place123"
        useCase.addFavorite(placeId: placeId)
        
        // When
        useCase.removeFavorite(placeId: placeId)
        
        // Then
        XCTAssertFalse(mockRepository.favorites.contains(placeId))
        XCTAssertFalse(useCase.isFavorite(placeId: placeId))
    }
    
    func testToggleFavoriteAddsWhenNotPresent() {
        // Given
        let placeId = "place123"
        
        // When
        useCase.toggleFavorite(placeId: placeId)
        
        // Then
        XCTAssertTrue(useCase.isFavorite(placeId: placeId))
    }
    
    func testToggleFavoriteRemovesWhenPresent() {
        // Given
        let placeId = "place123"
        useCase.addFavorite(placeId: placeId)
        
        // When
        useCase.toggleFavorite(placeId: placeId)
        
        // Then
        XCTAssertFalse(useCase.isFavorite(placeId: placeId))
    }
    
    func testGetFavoriteIdsReturnsAllFavorites() {
        // Given
        useCase.addFavorite(placeId: "place1")
        useCase.addFavorite(placeId: "place2")
        useCase.addFavorite(placeId: "place3")
        
        // When
        let favorites = useCase.getFavoriteIds()
        
        // Then
        XCTAssertEqual(favorites.count, 3)
        XCTAssertTrue(favorites.contains("place1"))
        XCTAssertTrue(favorites.contains("place2"))
        XCTAssertTrue(favorites.contains("place3"))
    }
}

// MARK: - Mock Repository

final class MockFavoritesRepository: FavoritesRepositoryProtocol, @unchecked Sendable {
    
    var favorites: Set<String> = []
    
    func getFavoriteIds() -> Set<String> {
        return favorites
    }
    
    func contains(placeId: String) -> Bool {
        return favorites.contains(placeId)
    }
    
    func add(placeId: String) {
        favorites.insert(placeId)
    }
    
    func remove(placeId: String) {
        favorites.remove(placeId)
    }
}
