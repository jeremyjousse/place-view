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
            // On force également la politique au niveau de la requête pour contourner tout cache intermédiaire
            var request = URLRequest(url: url)
            request.cachePolicy = .reloadIgnoringLocalAndRemoteCacheData
            
            let (data, _) = try await session.data(for: request)
            if let img = PlatformImage(data: data) { 
                return img 
            }
        } catch { 
            print("Error loading image: \(error)") 
        }
        
        #if os(macOS)
        return NSImage()
        #else
        return UIImage()
        #endif
    }
}
