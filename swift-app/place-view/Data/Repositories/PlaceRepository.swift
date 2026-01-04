//
//  PlaceRepository.swift
//  place-view
//
//  Data layer implementation for Place repository

import Foundation

final class PlaceRepository: PlaceRepositoryProtocol {
    private let apiClient: ApiClient
    private let placesURL: URL
    
    init(apiClient: ApiClient = ApiClient(), 
         placesURL: URL = URL(string: "https://jeremyjousse.github.io/place-view/places.json")!) {
        self.apiClient = apiClient
        self.placesURL = placesURL
    }
    
    func fetchPlaces() async throws -> [Place] {
        return try await apiClient.fetchPlaces(url: placesURL)
    }
}
