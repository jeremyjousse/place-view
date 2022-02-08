//
//  CityView.swift
//  place-view
//
//  Created by Jérémy Jousse on 21/11/2021.
//

import SwiftUI
import MapKit
import Kingfisher


struct PlaceView: View {
    
    @StateObject private var viewModel : PlaceViewModel
    
    @State private var selectedImage: Int = 0
    
    init(place: Place) {
        UIScrollView.appearance().bounces = false
        self.place = place
        _viewModel = StateObject(wrappedValue: PlaceViewModel(webcams: place.webcams))
    }
    
    var place: Place
    
    var body: some View {
        ScrollView {
            VStack {
                WebcamView(imageUrl: place.webcams[selectedImage].largeImage)
                    .frame(width: 350)
                Text(place.webcams[selectedImage].name)
                if (place.webcams.count > 1) {
                    ThubnailsView(thumbnails: self.viewModel.thumbnails, selectedThumbnail: $selectedImage)
                        .frame(width: 350)
                }
                VStack(alignment: .leading) {
                    HStack {
                        Text(place.name)
                            .font(.title)
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
                    Text("Weather forcast")
                        .font(.title2)
                    Text("Add weather here.")
                    Divider()
                    MapView(coordinates: place.locationCoordinate)
                        .frame(height: 300).cornerRadius(10)
                }
                .padding()
                
                Spacer()
            }
        }
        .task {
            await viewModel.loadParallel()
        }
    }
}

struct ThubnailsView: View {
    
    var thumbnails: [ThumbnailImg]
    @Binding var selectedThumbnail: Int
    
    var body: some View {
        if thumbnails.count < 1 {
            ProgressView()
        } else {
            ScrollView(.horizontal) {
                HStack {
                    ForEach(thumbnails) { thumbnail in
                        Image(uiImage: thumbnail.image).cornerRadius(10)
                            .onTapGesture {
                                selectedThumbnail = thumbnails.firstIndex(of: thumbnail) ?? 0
                            }
                    }
                }
            }
        }
    }
}
