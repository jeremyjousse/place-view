//
//  FetchPlacesUseCaseTests.swift
//  place-viewTests
//
//  Unit tests for FetchPlacesUseCase

import XCTest
@testable import place_view

final class FetchPlacesUseCaseTests: XCTestCase {
    
    func testFetchPlacesReturnsDataFromRepository() async throws {
        // Given
        let mockRepository = MockPlaceRepository()
        let useCase = FetchPlacesUseCase(placeRepository: mockRepository)
        
        // When
        let places = try await useCase.execute()
        
        // Then
        XCTAssertEqual(places.count, 2)
        XCTAssertEqual(places[0].name, "Test Place 1")
        XCTAssertEqual(places[1].name, "Test Place 2")
    }
    
    func testExtractStatesReturnsUniqueStates() {
        // Given
        let mockRepository = MockPlaceRepository()
        let useCase = FetchPlacesUseCase(placeRepository: mockRepository)
        let places = MockPlaceRepository.mockPlaces
        
        // When
        let states = useCase.extractStates(from: places)
        
        // Then
        XCTAssertEqual(states.count, 2)
        XCTAssertTrue(states.contains("State1"))
        XCTAssertTrue(states.contains("State2"))
    }
}

// MARK: - Mock Repository

final class MockPlaceRepository: PlaceRepositoryProtocol, Sendable {
    
    static let mockPlaces = [
        Place(
            name: "Test Place 1",
            id: "1",
            country: "Country1",
            state: "State1",
            url: "https://example.com",
            webcams: [],
            coordinates: Place.Coordinates(latitude: 45.0, longitude: 5.0),
            isFavorite: false
        ),
        Place(
            name: "Test Place 2",
            id: "2",
            country: "Country2",
            state: "State2",
            url: "https://example.com",
            webcams: [],
            coordinates: Place.Coordinates(latitude: 46.0, longitude: 6.0),
            isFavorite: false
        )
    ]
    
    func fetchPlaces() async throws -> [Place] {
        return MockPlaceRepository.mockPlaces
    }
}
