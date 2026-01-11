//
//  PlaceGridItem.swift
//  place-view
//

import SwiftUI
import Kingfisher

struct PlaceGridItem: View {
    @ObservedObject var favorites = FavoritesViewModel.shared
    var place: Place
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            ZStack(alignment: .topTrailing) {
                if let firstWebcam = place.webcams.first {
                    KFImage(URL(string: firstWebcam.thumbnailImage))
                        .diskCacheExpiration(.seconds(3600))
                        .placeholder {
                            Rectangle()
                                #if os(macOS)
                                .foregroundColor(Color(NSColor.windowBackgroundColor))
                                #else
                                .foregroundColor(Color(.systemGray6))
                                #endif
                                .overlay(ProgressView())
                        }
                        .fade(duration: 0.25)
                        .resizable()
                        .scaledToFill()
                        .aspectRatio(1, contentMode: .fill) // Maintains the square "look and feel"
                        .frame(minWidth: 0, maxWidth: .infinity)
                        .clipped() // Crops the center width/height
                        .cornerRadius(10)
                        .overlay(PlaceRowNumLabel(count: place.webcams.count))
                } else {
                    Rectangle()
                        #if os(macOS)
                        .foregroundColor(Color(NSColor.windowBackgroundColor))
                        #else
                        .foregroundColor(Color(.systemGray6))
                        #endif
                        .aspectRatio(1, contentMode: .fill)
                        .cornerRadius(10)
                }
                
                if favorites.contains(place) {
                    Image(systemName: "star.fill")
                        .foregroundColor(.yellow)
                        .padding(6)
                        .background(Circle().fill(Color.black.opacity(0.3)))
                        .padding(6)
                }
            }
            
            VStack(alignment: .leading, spacing: 2) {
                Text(place.name)
                    .font(.headline)
                    .foregroundColor(.primary)
                    .lineLimit(1)
                
                Text("\(place.state), \(place.country)")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .lineLimit(1)
            }
            .padding(.horizontal, 2)
        }
        // Ensures the entire card is tappable for the NavigationLink
        .contentShape(Rectangle())
    }
}
