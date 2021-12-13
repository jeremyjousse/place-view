//
//  FavoriteButton.swift
//  place-view
//
//  Created by Jérémy Jousse on 05/12/2021.
//

import SwiftUI

struct FavoriteButton: View {
    @State var place: Place
    
    @ObservedObject var favorites = PlaceFavorites.sharedInstance
    
    var body: some View {
        Button {
            if self.favorites.contains(place) {
                  self.favorites.remove(place)
              } else {
                  self.favorites.add(place)
              }
        } label: {
            Label("Toggle favorite", systemImage: favorites.contains(place) ? "star.fill" : "star")
                .labelStyle(.iconOnly)
                .foregroundColor(favorites.contains(place) ? .yellow : .gray)
        }
    }
}

struct FavoriteButton_Previews: PreviewProvider {
    static var places = ModelData().places
    
    static var previews: some View {
        FavoriteButton(place: places[0])
    }
}
