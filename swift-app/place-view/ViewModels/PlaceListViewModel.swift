//
//  PlaceListViewModel.swift
//  place-view
//
//  ViewModel for Place List - follows MVVM + Clean Architecture

import Foundation
import Kingfisher

@MainActor
final class PlaceListViewModel: ObservableObject {
    
    @Published var places = [Place]()
    @Published var states = [String]()
    @Published var isLoading: Bool = false
    @Published var errorMessage: String? = nil
    
    private let fetchPlacesUseCase: FetchPlacesUseCase
    
    init(fetchPlacesUseCase: FetchPlacesUseCase) {
        self.fetchPlacesUseCase = fetchPlacesUseCase
        Task {
            await fetchAllPlaces()
        }
    }
    
    func fetchAllPlaces() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let fetchedPlaces = try await fetchPlacesUseCase.execute()
            self.places = fetchedPlaces
            self.states = fetchPlacesUseCase.extractStates(from: fetchedPlaces)
        } catch let error as ApiError {
            self.errorMessage = error.localizedDescription
            print(error)
        } catch {
            self.errorMessage = "An unexpected error occurred."
            print(error)
        }
        
        isLoading = false
    }
    
    func clearCacheAndRefresh() async {
        // Clear places to force a UI reload
        self.places = []
        
        // Purge du cache URL standard
        URLCache.shared.removeAllCachedResponses()
        
        // Purge du cache Kingfisher (Mémoire)
        ImageCache.default.clearMemoryCache()
        
        // Purge du cache Kingfisher (Disque) - On attend la fin de l'opération
        await withCheckedContinuation { continuation in
            ImageCache.default.clearDiskCache {
                continuation.resume()
            }
        }
        
        await fetchAllPlaces()
    }
    
    // MARK: preview helpers
    
    static func errorState() -> PlaceListViewModel {
        let useCase = DependencyContainer.shared.fetchPlacesUseCase
        let viewModel = PlaceListViewModel(fetchPlacesUseCase: useCase)
        viewModel.errorMessage = ApiError.url(URLError.init(.notConnectedToInternet)).localizedDescription
        return viewModel
    }
    
    static func successState() -> PlaceListViewModel {
        return DependencyContainer.shared.makePlaceListViewModel()
    }
}
