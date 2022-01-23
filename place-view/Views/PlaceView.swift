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
                if (place.webcams.count > 1) {
                    ThubnailsView(thumbnails: self.viewModel.thumbnails, selectedThumbnail: $selectedImage)
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

//struct PlaceView_Previews: PreviewProvider {
//    static let modelData = ModelData()
//
//    static var previews: some View {
//        PlaceView(place: modelData.places[0])
//            .environmentObject(modelData)
//    }
//}

struct ThubnailsView: View {
    
    var thumbnails: [ThumbnailImg]
    @Binding var selectedThumbnail: Int
    
    var body: some View {
        ScrollView {
            HStack {
                if thumbnails.count < 1 {
                    ProgressView()
                } else {
                    ScrollView {
                        HStack (spacing: 10) {
                            ForEach(thumbnails) { thumbnail in
                                Image(uiImage: thumbnail.image)
                                    .resizable()
                                    .frame(width: 100, height: 100)
                                    .aspectRatio(contentMode: .fill)
                                    .onTapGesture {
                                        selectedThumbnail = thumbnails.firstIndex(of: thumbnail) ?? 0
                                        print(selectedThumbnail)
                                    }
                            }
                        }
                    }
//                    .onAppear {
//                        if let first = loader.images.first {
//                            selectedPhoto = first
//                        }
//                    }
                }
                
//                ForEach(webcams, id: \.self) { webcam in
//                    RoundedRectangle(cornerRadius: 5)
//                        .fill(Color.gray)
//                        .frame(width:100, height: 100)
//                        .overlay {
//                            Image(systemName: "arrow.2.circlepath.circle")
//                        }
//                        .onTapGesture {
//                            self.selectedImage = webcams.firstIndex(of: webcam) ?? 0
//                        }
//                }
            }
        }
    }
}
