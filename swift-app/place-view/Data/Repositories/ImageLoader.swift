//
//  ImageLoader.swift
//  place-view
//
//  Data layer implementation for Image loading

import Foundation

#if os(macOS)
import AppKit
#else
import UIKit
#endif

final class ImageLoader: ImageLoaderProtocol {
    
    private let session: URLSession
    
    init(session: URLSession = .shared) {
        self.session = session
    }
    
    func loadImage(url: URL) async -> PlatformImage {
        do {
            let (data, _) = try await session.data(from: url)
            if let img = PlatformImage(data: data) { 
                return img 
            }
        } catch { 
            print("Error loading image: \(error)") 
        }
        // Retourne une image vide ou une image par défaut en cas d'erreur
        #if os(macOS)
        return NSImage()
        #else
        return UIImage()
        #endif
    }
}
