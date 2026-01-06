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
        ScrollView {
            VStack {
                // La WebcamView gère maintenant son propre état de chargement et centrage
                WebcamView(imageUrl: place.webcams[selectedImage].largeImage)
                
                Text(place.webcams[selectedImage].name)
                    .font(.caption)
                    .padding(.top, 4)
                
                if place.webcams.count > 1 {
                    ThubnailsView(webcams: place.webcams, selectedThumbnail: $selectedImage)
                        .frame(width: 350)
                }
                
                VStack(alignment: .leading) {
                    HStack {
                        if let url = URL(string: place.url) {
                            Link(destination: url) {
                                Text(place.name)
                                    .font(.title)
                                    .foregroundColor(.primary)
                            }
                        } else {
                            Text(place.name)
                                .font(.title)
                        }
                        FavoriteButton(place: place)
                    }
                    HStack {
                        Text(place.country)
                            .font(.subheadline)
                        Spacer()
                        Text(place.state)
                            .font(.subheadline)
                    }
                    
                    Divider()
                    Text("Weather forecast")
                        .font(.title2)
                    Text("Add weather here.")
                    Divider()
                    MapView(coordinates: place.locationCoordinate)
                        .frame(height: 300).cornerRadius(10)
                }
                .padding()
                
                Spacer()
            }
            .frame(maxWidth: .infinity)
        }
        .scrollBounceBehavior(.basedOnSize)
    }
}

struct ThubnailsView: View {
    var webcams: [Webcam]
    @Binding var selectedThumbnail: Int
    
    let processor = ResizingImageProcessor(referenceSize: CGSize(width: 100, height: 100), mode: .aspectFill)
                 |> CroppingImageProcessor(size: CGSize(width: 100, height: 100))
    
    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack {
                ForEach(0..<webcams.count, id: \.self) { index in
                    KFImage(URL(string: webcams[index].thumbnailImage))
                        .setProcessor(processor)
                        .serialize(by: DefaultCacheSerializer.default)
                        .placeholder { ProgressView().frame(width: 100, height: 100) }
                        .fade(duration: 0.25)
                        .resizable()
                        .scaledToFill()
                        .frame(width: 100, height: 100)
                        .cornerRadius(10)
                        .onTapGesture {
                            selectedThumbnail = index
                        }
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(Color.blue, lineWidth: selectedThumbnail == index ? 3 : 0)
                        )
                }
            }
        }
    }
}

