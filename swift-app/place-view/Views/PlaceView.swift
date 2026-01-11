//
//  PlaceView.swift
//  place-view
//

import SwiftUI
import MapKit
import Kingfisher

struct PlaceView: View {
    
    @StateObject private var viewModel: PlaceDetailViewModel
    @State private var selectedImage: Int = 0
    var place: Place
    
    init(place: Place) {
        self.place = place
        _viewModel = StateObject(wrappedValue: DependencyContainer.shared.makePlaceDetailViewModel(webcams: place.webcams))
    }
    
    var body: some View {
        GeometryReader { geometry in
            ScrollView {
                VStack(spacing: 0) {
                    
                    // Calcul de la largeur responsive
                    let targetWidth: CGFloat = {
                        #if os(macOS)
                        return min(geometry.size.width * 0.9, 1000)
                        #else
                        if UIDevice.current.userInterfaceIdiom == .pad || UIDevice.current.userInterfaceIdiom == .mac {
                            return geometry.size.width * 0.8
                        } else {
                            // Mobile : On garde la contrainte de largeur d'origine
                            return min(geometry.size.width - 40, 350)
                        }
                        #endif
                    }()

                    VStack(spacing: 24) {
                        // Section Médias (Image + Thumbnails)
                        VStack(spacing: 12) {
                            WebcamView(imageUrl: place.webcams[selectedImage].largeImage)
                                .frame(width: targetWidth)
                            
                            Text(place.webcams[selectedImage].name)
                                .font(.caption)
                                .foregroundColor(.secondary)
                            
                            if place.webcams.count > 1 {
                                ThumbnailsView(webcams: place.webcams, selectedThumbnail: $selectedImage)
                                    .frame(width: targetWidth)
                            }
                        }
                        
                        // Section Détails
                        VStack(alignment: .leading, spacing: 16) {
                            HStack(alignment: .firstTextBaseline) {
                                if let url = URL(string: place.url) {
                                    Link(destination: url) {
                                        Text(place.name)
                                            .font(.system(size: 34, weight: .bold))
                                            .foregroundColor(.primary)
                                    }
                                } else {
                                    Text(place.name)
                                        .font(.system(size: 34, weight: .bold))
                                }
                                Spacer()
                                FavoriteButton(place: place)
                                    .font(.title)
                            }
                            
                            HStack {
                                Label(place.country, systemImage: "mappin.and.ellipse")
                                Spacer()
                                Text(place.state)
                            }
                            .font(.headline)
                            .foregroundColor(.secondary)
                            
                            Divider()
                            
                            Text("Weather forecast")
                                .font(.title2)
                                .bold()
                            
                            Text("Add weather here.")
                                .foregroundColor(.secondary)
                                .padding(.vertical, 8)
                            
                            Divider()
                            
                            MapView(coordinates: place.locationCoordinate)
                                .frame(height: 400)
                                .cornerRadius(12)
                        }
                        .frame(width: targetWidth)
                    }
                    .padding(.vertical, 30)
                    .frame(maxWidth: .infinity) // Centre tout le contenu
                }
            }
        }
        .scrollBounceBehavior(.basedOnSize)
    }
}

struct ThumbnailsView: View {
    var webcams: [Webcam]
    @Binding var selectedThumbnail: Int
    
    let processor = ResizingImageProcessor(referenceSize: CGSize(width: 100, height: 100), mode: .aspectFill)
                 |> CroppingImageProcessor(size: CGSize(width: 100, height: 100))
    
    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                ForEach(0..<webcams.count, id: \.self) { index in
                    KFImage(URL(string: webcams[index].thumbnailImage))
                        .setProcessor(processor)
                        .serialize(by: DefaultCacheSerializer.default)
                        .diskCacheExpiration(.seconds(3600))
                        .placeholder { ProgressView().frame(width: 80, height: 80) }
                        .fade(duration: 0.25)
                        .resizable()
                        .forceRefresh() // Force le téléchargement à chaque fois
                        .scaledToFill()
                        .frame(width: 80, height: 80)
                        .cornerRadius(8)
                        .onTapGesture {
                            selectedThumbnail = index
                        }
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(Color.blue, lineWidth: selectedThumbnail == index ? 3 : 0)
                        )
                }
            }
            .padding(.vertical, 4)
        }
    }
}

