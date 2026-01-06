//
//  LoadWebcamImagesUseCase.swift
//  place-view
//
//  Use Case for loading webcam images

import Foundation
import CoreGraphics

final class LoadWebcamImagesUseCase: Sendable {
    private let imageLoader: ImageLoaderProtocol
    
    init(imageLoader: ImageLoaderProtocol) {
        self.imageLoader = imageLoader
    }
    
    func loadThumbnails(for webcams: [Webcam]) async -> [ThumbnailImg] {
        var temporaryThumbnails: [ThumbnailImg] = []
        
        await withTaskGroup(of: (String, PlatformImage).self) { group in
            for webcam in webcams {
                if let url = URL(string: webcam.thumbnailImage) {
                    group.addTask {
                        let image = await self.imageLoader.loadImage(url: url)
                        return (url.absoluteString, image)
                    }
                }
            }
            
            for await result in group {
                guard let resizedImage = result.1.resize(withSize: CGSize(width: 100, height: 100), contentMode: .contentAspectFill) else {
                    print("Error resizing image")
                    continue
                }
                
                let croppedImage = resizedImage.cropToBounds(sizeToCrop: CGSize(width: 50.0, height: 50.0))
                temporaryThumbnails.append(ThumbnailImg(url: result.0, image: croppedImage))
            }
        }
        
        var orderedThumbnails: [ThumbnailImg] = []
        for webcam in webcams {
            if let thumbnail = temporaryThumbnails.first(where: { $0.url == webcam.thumbnailImage }) {
                orderedThumbnails.append(thumbnail)
            }
        }
        
        return orderedThumbnails
    }
}
