//
//  FavoritesRepositoryProtocol.swift
//  place-view
//
//  Domain layer protocol for Favorites repository

import Foundation

protocol FavoritesRepositoryProtocol: Sendable {
    func getFavoriteIds() -> Set<String>
    func contains(placeId: String) -> Bool
    func add(placeId: String)
    func remove(placeId: String)
}
