//
//  CityView.swift
//  place-view
//
//  Created by Jérémy Jousse on 21/11/2021.
//

import SwiftUI
import MapKit

struct PlaceView: View {
    
    @EnvironmentObject var modelData: ModelData
    @State var selectedImage : Int = 0
    
    init(place: Place) {
        UIScrollView.appearance().bounces = false
        self.place = place
    }
    
    var place: Place
    
    var placeIndex: Int {
        modelData.places.firstIndex(where: { $0.id == place.id })!
    }
    
    var body: some View {
        ScrollView {
            VStack {
                WebcamView(imageUrl: place.webcams[selectedImage].largeImage)
                    .frame(width: 350)
                if (place.webcams.count > 1) {
                    Text("\(selectedImage)")
                    ThubnailsView(webcams: place.webcams, selectedImage: $selectedImage)
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
    }
}

struct PlaceView_Previews: PreviewProvider {
    static let modelData = ModelData()
    
    static var previews: some View {
        PlaceView(place: modelData.places[0])
            .environmentObject(modelData)
    }
}

struct ThubnailsView: View {
    var webcams: [Webcam]
    @Binding var selectedImage: Int
    
    
    var body: some View {
        ScrollView {
            HStack {
                ForEach(webcams, id: \.self) { webcam in
                    RoundedRectangle(cornerRadius: 5)
                        .frame(width:100, height: 100)
                        .overlay {
                            //WebcamThumbnail(imageUrl: webcam.thumbnailImage)
                        }
                        .onTapGesture {
                        self.selectedImage = webcams.firstIndex(of: webcam) ?? 0
                    }
                    // WebcamThumbnail(imageUrl: webcam.thumbnailImage)
                }
            }
        }
    }
}
