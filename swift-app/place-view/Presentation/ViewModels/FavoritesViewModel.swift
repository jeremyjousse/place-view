//
//  FavoritesViewModel.swift
//  place-view
//
//  ViewModel for managing favorites - follows MVVM + Clean Architecture

import Foundation

@MainActor
final class FavoritesViewModel: ObservableObject {
    
    private let manageFavoritesUseCase: ManageFavoritesUseCase
    
    // Singleton instance to maintain state across the app
    static let shared: FavoritesViewModel = {
        let repository = FavoritesRepository()
        let useCase = ManageFavoritesUseCase(favoritesRepository: repository)
        return FavoritesViewModel(manageFavoritesUseCase: useCase)
    }()
    
    private init(manageFavoritesUseCase: ManageFavoritesUseCase) {
        self.manageFavoritesUseCase = manageFavoritesUseCase
    }
    
    func getFavoriteIds() -> Set<String> {
        return manageFavoritesUseCase.getFavoriteIds()
    }
    
    func count() -> Int {
        return manageFavoritesUseCase.getFavoriteIds().count
    }
    
    func isEmpty() -> Bool {
        return manageFavoritesUseCase.getFavoriteIds().count < 1
    }
    
    func contains(_ place: Place) -> Bool {
        return manageFavoritesUseCase.isFavorite(placeId: place.id)
    }
    
    func add(_ place: Place) {
        objectWillChange.send()
        manageFavoritesUseCase.addFavorite(placeId: place.id)
    }
    
    func remove(_ place: Place) {
        objectWillChange.send()
        manageFavoritesUseCase.removeFavorite(placeId: place.id)
    }
    
    func toggle(_ place: Place) {
        objectWillChange.send()
        manageFavoritesUseCase.toggleFavorite(placeId: place.id)
    }
}
