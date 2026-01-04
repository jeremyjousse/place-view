//
//  FavoritesRepository.swift
//  place-view
//
//  Data layer implementation for Favorites repository

import Foundation

final class FavoritesRepository: FavoritesRepositoryProtocol {
    private var favorites: Set<String>
    private let defaults: UserDefaults
    private let storageKey = "placeFavorites"
    
    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        
        let decoder = JSONDecoder()
        if let data = defaults.value(forKey: storageKey) as? Data,
           let decoded = try? decoder.decode(Set<String>.self, from: data) {
            self.favorites = decoded
        } else {
            self.favorites = []
        }
    }
    
    func getFavoriteIds() -> Set<String> {
        return favorites
    }
    
    func contains(placeId: String) -> Bool {
        return favorites.contains(placeId)
    }
    
    func add(placeId: String) {
        favorites.insert(placeId)
        save()
    }
    
    func remove(placeId: String) {
        favorites.remove(placeId)
        save()
    }
    
    private func save() {
        let encoder = JSONEncoder()
        if let encoded = try? encoder.encode(favorites) {
            defaults.set(encoded, forKey: storageKey)
        }
    }
}
