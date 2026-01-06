//
//  DependencyContainer.swift
//  place-view
//
//  Dependency Injection container for Clean Architecture

import Foundation

final class DependencyContainer {
    
    // Singleton instance
    static let shared = DependencyContainer()
    
    // MARK: - Repositories
    
    private lazy var placeRepository: PlaceRepositoryProtocol = {
        PlaceRepository()
    }()
    
    private lazy var favoritesRepository: FavoritesRepositoryProtocol = {
        FavoritesRepository()
    }()
    
    private lazy var imageLoader: ImageLoaderProtocol = {
        ImageLoader()
    }()
    
    // MARK: - Use Cases
    
    lazy var fetchPlacesUseCase: FetchPlacesUseCase = {
        FetchPlacesUseCase(placeRepository: placeRepository)
    }()
    
    lazy var manageFavoritesUseCase: ManageFavoritesUseCase = {
        ManageFavoritesUseCase(favoritesRepository: favoritesRepository)
    }()
    
    lazy var loadWebcamImagesUseCase: LoadWebcamImagesUseCase = {
        LoadWebcamImagesUseCase(imageLoader: imageLoader)
    }()
    
    // MARK: - ViewModels
    
    @MainActor func makePlaceListViewModel() -> PlaceListViewModel {
        PlaceListViewModel(fetchPlacesUseCase: fetchPlacesUseCase)
    }
    
    @MainActor func makePlaceDetailViewModel(webcams: [Webcam]) -> PlaceDetailViewModel {
        PlaceDetailViewModel(
            webcams: webcams,
            loadWebcamImagesUseCase: loadWebcamImagesUseCase
        )
    }
    
    func makeFavoritesViewModel() -> FavoritesViewModel {
        FavoritesViewModel.shared
    }
    
    private init() {}
}
