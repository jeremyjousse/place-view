//
//  PlaceFetcher.swift
//  place-view
//
//  Created by Jérémy Jousse on 13/01/2022.
//

import Foundation

@MainActor
class PlaceFetcher: ObservableObject {
    
    @Published var places = [Place]()
    @Published var states = [String]()
    @Published var isLoading: Bool = false
    @Published var errorMessage: String? = nil
    
    let service: ApiClient
    
    init(service: ApiClient = ApiClient()) {
        self.service = service
        Task {
            await fetchAllPlaces()
        }
    }
    
    func fetchAllPlaces() async {
        isLoading = true
        errorMessage = nil
        
        let url = URL(string: "https://jeremyjousse.github.io/place-view/places.json")
        
        do {
            let fetchedPlaces = try await service.fetchPlaces(url: url)
            self.places = fetchedPlaces
            self.states = Array(Set(fetchedPlaces.map({ $0.state })))
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
        // Clear URLSession cache for all requests (JSON and images)
        URLCache.shared.removeAllCachedResponses()
        
        // Fetch places again and wait for completion
        await fetchAllPlaces()
    }
    
    //MARK: preview helpers
    
    static func errorState() -> PlaceFetcher {
        let fetcher = PlaceFetcher()
        fetcher.errorMessage = ApiError.url(URLError.init(.notConnectedToInternet)).localizedDescription
        return fetcher
    }
    
    static func successState() -> PlaceFetcher {
        let fetcher = PlaceFetcher()
        return fetcher
    }
}
