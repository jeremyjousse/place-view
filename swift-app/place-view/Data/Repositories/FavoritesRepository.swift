//
//  FavoritesRepository.swift
//  place-view
//
//  Data layer implementation for Favorites repository

import Foundation
import os

final class FavoritesRepository: FavoritesRepositoryProtocol, @unchecked Sendable {
    private let favoritesLock: OSAllocatedUnfairLock<Set<String>>
    private let defaults: UserDefaults
    private let storageKey = "placeFavorites"
    
    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        
        let decoder = JSONDecoder()
        var initialFavorites: Set<String> = []
        
        if let data = defaults.value(forKey: storageKey) as? Data,
           let decoded = try? decoder.decode(Set<String>.self, from: data) {
            initialFavorites = decoded
        }
        
        self.favoritesLock = OSAllocatedUnfairLock(initialState: initialFavorites)
    }
    
    func getFavoriteIds() -> Set<String> {
        favoritesLock.withLock { $0 }
    }
    
    func contains(placeId: String) -> Bool {
        favoritesLock.withLock { $0.contains(placeId) }
    }
    
    func add(placeId: String) {
        let current = favoritesLock.withLock {
            $0.insert(placeId)
            return $0
        }
        save(current)
    }
    
    func remove(placeId: String) {
        let current = favoritesLock.withLock {
            $0.remove(placeId)
            return $0
        }
        save(current)
    }
    
    private func save(_ favorites: Set<String>) {
        let encoder = JSONEncoder()
        if let encoded = try? encoder.encode(favorites) {
            defaults.set(encoded, forKey: storageKey)
        }
    }
}
