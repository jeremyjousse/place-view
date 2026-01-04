//
//  FetchPlacesUseCase.swift
//  place-view
//
//  Use Case for fetching places

import Foundation

final class FetchPlacesUseCase: Sendable {
    private let placeRepository: PlaceRepositoryProtocol
    
    init(placeRepository: PlaceRepositoryProtocol) {
        self.placeRepository = placeRepository
    }
    
    func execute() async throws -> [Place] {
        return try await placeRepository.fetchPlaces()
    }
    
    func extractStates(from places: [Place]) -> [String] {
        return Array(Set(places.map { $0.state }))
    }
}
