//
//  PlaceFavorites.swift
//  place-view
//
//  Created by Jérémy Jousse on 07/12/2021.
//

import SwiftUI

class PlaceFavorites: ObservableObject {
    private var favorties: Set<String>
    
    public static let sharedInstance = PlaceFavorites()
    
    let defaults = UserDefaults.standard
    
    private init() {
        let decoder = JSONDecoder()
        if let favorties = defaults.value(forKey: "placeFavorites") as? Data {
            let favoritesData = try? decoder.decode(Set<String>.self, from: favorties)
            self.favorties = favoritesData ?? []
        } else {
            self.favorties = []
        }
        NSLog("PlaceFavorites initialized")
    }
    
    func getFavoriteIds() -> Set<String> {
        return self.favorties
    }
    
    func count() -> Int {
        favorties.count
    }
    
    func isEmpty() -> Bool {
        favorties.count < 1
    }
    
    func contains(_ place: Place) -> Bool {
        favorties.contains(place.id)
    }
    
    func add (_ place: Place) {
        objectWillChange.send()
        favorties.insert(place.id)
        save()
    }
    
    func remove(_ place: Place) {
        objectWillChange.send()
        favorties.remove(place.id)
        save()
    }
    
    func save() {
        let encoder = JSONEncoder()
        if let encoded = try? encoder.encode(favorties) {
            defaults.set(encoded, forKey: "placeFavorites")
        }
    }
}
