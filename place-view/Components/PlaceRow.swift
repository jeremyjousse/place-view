//
//  PlaceRow.swift
//  place-view
//
//  Created by Jérémy Jousse on 23/11/2021.
//

// https://www.advancedswift.com/crop-image/#center-crop-image

import SwiftUI

struct PlaceRow: View {
    @ObservedObject var favorites = PlaceFavorites.sharedInstance
    
    var place: Place
    
    var body: some View {
        HStack {
            AsyncImage(url: URL(string: place.webcams[0].thumbnailImage)) { image in
                GeometryReader { geo in
                image.resizable()
                    .aspectRatio(contentMode: .fill)
                    .frame(width: 100, height: 100, alignment: .center)
                    .clipped().cornerRadius(10)
                }
            } placeholder: {
                ProgressView()
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

//struct PlaceRow_Previews: PreviewProvider {
//    static var places = ModelData().places
//    
//    static var previews: some View {
//        Group {
//            PlaceRow(place: places[0])
//            PlaceRow(place: places[2])
//        }.previewLayout(.fixed(width: 300, height: 70))
//    }
//}
