//
//  PlaceRepository.swift
//  place-view
//
//  Data layer implementation for Place repository

import Foundation

final class PlaceRepository: PlaceRepositoryProtocol {

    private let placesURL: URL
    private let session: URLSession
    
    init(
         placesURL: URL = URL(string: "https://jeremyjousse.github.io/place-view/places.json")!,
         session: URLSession = .shared) {
        self.placesURL = placesURL
        self.session = session
    }
    
    func fetchPlaces() async throws -> [Place] {
        do {
            let (data, response) = try await session.data(from: placesURL)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                throw ApiError.unknown
            }
            
            guard (200...299).contains(httpResponse.statusCode) else {
                throw ApiError.badResponse(statusCode: httpResponse.statusCode)
            }
            
            let decoder = JSONDecoder()
            return try decoder.decode([Place].self, from: data)
            
        } catch let error as DecodingError {
            throw ApiError.parsing(error)
        } catch let error as URLError {
            throw ApiError.url(error)
        } catch {
            throw ApiError.unknown
        }
    }
}
