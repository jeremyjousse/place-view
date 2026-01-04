//
//  ImageLoader.swift
//  place-view
//
//  Data layer implementation for Image loading

import Foundation

final class ImageLoader: ImageLoaderProtocol {
    
    func loadImage(url: URL) async -> PlatformImage {
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            if let img = PlatformImage(data: data) { 
                return img 
            }
        } catch { 
            print("Error loading image: \(error)") 
        }
        return PlatformImage()
    }
}
