//
//  PlaceFetcher.swift
//  place-view
//
//  Created by Jérémy Jousse on 13/01/2022.
//

import Foundation

class PlaceFetcher: ObservableObject {
    
    @Published var places = [Place]()
    @Published var isLoading: Bool = false
    @Published var errorMessage: String? = nil
    
    let service: ApiClient
    
    init(service: ApiClient = ApiClient()) {
        self.service = service
        fetchAllPlaces()
    }
    
    func fetchAllPlaces() {
        
        isLoading = true
        errorMessage = nil
        
        let url = URL(string: "https://jeremyjousse.github.io/place-view/places.json")
        service.fetchPlaces(url: url) { [unowned self] result in
            
            DispatchQueue.main.async {
                
                self.isLoading = false
                switch result {
                case .failure(let error):
                    self.errorMessage = error.localizedDescription
                    // print(error.description)
                    print(error)
                case .success(let places):
                    print("--- sucess with \(places.count)")
                    self.places = places
                }
            }
        }
        
    }
    
    
    //MARK: preview helpers
    
    static func errorState() -> PlaceFetcher {
        let fetcher = PlaceFetcher()
        fetcher.errorMessage = ApiError.url(URLError.init(.notConnectedToInternet)).localizedDescription
        return fetcher
    }
    
    static func successState() -> PlaceFetcher {
        let fetcher = PlaceFetcher()
        // fetcher.places = [Place.example1(), Place.example2()]
        
        return fetcher
    }
}
