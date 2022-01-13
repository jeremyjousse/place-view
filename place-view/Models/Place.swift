//
//  City.swift
//  place-view
//
//  Created by Jérémy Jousse on 20/11/2021.
//

import Foundation
import CoreLocation
import SwiftUI

struct Webcam: Hashable, Codable {
    var name: String
    var largeImage: String
    var thumbnailImage: String
}

struct Place: Hashable, Codable, Identifiable {
    
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
    
    enum CodingKeys: String, CodingKey {
        case id
        case name
        case country
        case state
        case url
        case webcams
        case coordinates
        case isFavorite
    }
    
    init(from decoder: Decoder) throws {
        let values = try decoder.container(keyedBy: CodingKeys.self)
        
        id = try values.decode(String.self, forKey: .id)
        name = try values.decode(String.self, forKey: .name)
        country = try values.decode(String.self, forKey: .country)
        state = try values.decode(String.self, forKey: .state)
        url = try values.decode(String.self, forKey: .url)
        webcams = try values.decode([Webcam].self, forKey: .webcams)
        coordinates = try values.decode(Coordinates.self, forKey: .coordinates)
        isFavorite = try values.decode(Bool.self, forKey: .isFavorite)
    }
    
    init(name: String, id: String, country: String, state: String,
         url: String, webcams: [Webcam], coordinates: Coordinates, isFavorite: Bool){
            self.name = name
            self.id = id
            self.country = country
            self.state = state
            self.url = url
            self.webcams = webcams
            self.coordinates = coordinates
            self.isFavorite = isFavorite
        }
    
}

