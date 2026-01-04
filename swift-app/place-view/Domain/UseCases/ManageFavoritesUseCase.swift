//
//  ManageFavoritesUseCase.swift
//  place-view
//
//  Use Case for managing favorites

import Foundation

final class ManageFavoritesUseCase: Sendable {
    private let favoritesRepository: FavoritesRepositoryProtocol
    
    init(favoritesRepository: FavoritesRepositoryProtocol) {
        self.favoritesRepository = favoritesRepository
    }
    
    func getFavoriteIds() -> Set<String> {
        return favoritesRepository.getFavoriteIds()
    }
    
    func isFavorite(placeId: String) -> Bool {
        return favoritesRepository.contains(placeId: placeId)
    }
    
    func toggleFavorite(placeId: String) {
        if favoritesRepository.contains(placeId: placeId) {
            favoritesRepository.remove(placeId: placeId)
        } else {
            favoritesRepository.add(placeId: placeId)
        }
    }
    
    func addFavorite(placeId: String) {
        favoritesRepository.add(placeId: placeId)
    }
    
    func removeFavorite(placeId: String) {
        favoritesRepository.remove(placeId: placeId)
    }
}
