//
//  ApiClient.swift
//  place-view
//
//  Created by Jérémy Jousse on 13/01/2022.
//

import Foundation
import os


struct ApiClient: Sendable {
    
    private let logger = Logger(subsystem: Bundle.main.bundleIdentifier ?? "place-view", category: "ApiError")
    
    func fetch<T: Decodable & Sendable>(_ type: T.Type, url: URL?) async throws -> T {
        guard let url = url else {
            throw ApiError.badURL
        }
        
        let (data, response) = try await URLSession.shared.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            logger.error("Fetching API received non-HTTPURLResponse \(response, privacy: .public)")
            throw ApiError.unknown
        }
        
        guard (200...299).contains(httpResponse.statusCode) else {
            logger.error("Fetching API bad status code: \(httpResponse.statusCode)")
            throw ApiError.badResponse(statusCode: httpResponse.statusCode)
        }
        
        do {
            let decoder = JSONDecoder()
            let result = try decoder.decode(type, from: data)
            return result
        } catch {
            logger.error("Fetching API JSON decode Error: \(error.localizedDescription)")
            throw ApiError.parsing(error as? DecodingError)
        }
    }
    
    func fetchPlaces(url: URL?) async throws -> [Place] {
        try await fetch([Place].self, url: url)
    }
    
}
