//
//  PlaceRepositoryProtocol.swift
//  place-view
//
//  Domain layer protocol for Place repository

import Foundation

protocol PlaceRepositoryProtocol: Sendable {
    func fetchPlaces() async throws -> [Place]
}
