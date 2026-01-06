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

struct PlaceRowNumLabel: View {
    let count: Int
    
    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            Color.clear
            if count > 1 {
                Text("\(count)")
                    .font(.caption2)
                    .fontWeight(.bold)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .foregroundColor(.white)
                    .background(Color.black.opacity(0.6))
                    .clipShape(Capsule())
                    .padding(4)
            }
        }
    }
}
