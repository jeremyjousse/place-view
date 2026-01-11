//
//  PlaceRow.swift
//  place-view
//

import SwiftUI
import Kingfisher

struct PlaceRow: View {
    @ObservedObject var favorites = FavoritesViewModel.shared
    var place: Place
    
    var body: some View {
        HStack {
            ZStack {
                if let firstWebcam = place.webcams.first {
                    KFImage(URL(string: firstWebcam.thumbnailImage))
                        .diskCacheExpiration(.seconds(3600))
                        .placeholder { ProgressView() }
                        .fade(duration: 0.25)
                        .resizable()
                        .scaledToFill()
                        .frame(width: 100, height: 100)
                        .clipped()
                        .cornerRadius(10)
                        .overlay(PlaceRowNumLabel(count: place.webcams.count))
                }
            }
            .frame(width: 100, height: 100)
            
            Text(place.name)
            Spacer()
            
            if favorites.contains(place) {
                Image(systemName: "star.fill").foregroundColor(.yellow)
            }
        }
    }
}


