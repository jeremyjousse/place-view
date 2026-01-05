//
//  PlaceRow.swift
//  place-view
//
//  Created by Jérémy Jousse on 23/11/2021.
//

// https://www.advancedswift.com/crop-image/#center-crop-image

import SwiftUI

struct PlaceRow: View {
    //@ObservedObject var favorites = PlaceFavorites.sharedInstance
    @ObservedObject var favorites = FavoritesViewModel.shared
    
    var place: Place
    
    var body: some View {
        HStack {
            ZStack {
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
                .overlay(PlaceRowNumLabel(count:  place.webcams.count))
            }
            Text(place.name)
            Spacer()
            if favorites.contains(place) {
                Image(systemName: "star.fill").foregroundColor(.yellow)
            }
        }
    }
}



struct PlaceRowNumLabel : View {
     var count : Int
    var body: some View {
        ZStack {
            Capsule().fill(Color.red).frame(width: 15    * CGFloat(numOfDigits()), height: 20, alignment: .topTrailing).position(CGPoint(x: 85, y: 15))
            Text("\(count)")
                .foregroundColor(Color.white)
                .font(Font.system(size: 10).bold()).position(CGPoint(x: 85, y: 15))
        }
    }
    
    func numOfDigits() -> Float {
    let numOfDigits = Float(String(count).count)
    return numOfDigits == 1 ? 1.5 : numOfDigits
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
