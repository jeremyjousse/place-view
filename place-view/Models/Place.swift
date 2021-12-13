//
//  City.swift
//  place-view
//
//  Created by Jérémy Jousse on 20/11/2021.
//

import Foundation
import CoreLocation
import SwiftUI

struct Place: Hashable, Codable, Identifiable {
    
    struct Webcam: Hashable, Codable {
        var name: String
        var largeImage: String
        var thumbnailImage: String
    }
    

    struct Coordinates: Hashable, Codable {
        var latitude: Double
        var longitude: Double
    }
    
    var locationCoordinate: CLLocationCoordinate2D {
        CLLocationCoordinate2D(
            latitude: coordinates.latitude,
            longitude: coordinates.longitude)
    }
    
    var id: String
    var name: String
    var country: String
    var state: String
    var url: String
    var webcams: [Webcam]
    var coordinates: Coordinates
    var isFavorite: Bool
    
    
//    private var imageName: String
//    var image: Image {
//        Image(imageName)
//    }
}

