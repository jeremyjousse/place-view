//
//  PlaceViewVM.swift
//  place-view
//
//  Created by Jérémy Jousse on 19/01/2022.
//

import Foundation
import SwiftUI

#if os(macOS)
import AppKit
typealias PlatformImage = NSImage
#else
import UIKit
typealias PlatformImage = UIImage
#endif

@MainActor
final class PlaceViewModel: ObservableObject {
    
    @Published var thumbnails: [ThumbnailImg] = []
    @Published var selectedImage : Int = 0
    
    var webcams: [Webcam]
    
    init(webcams: [Webcam]) {
        self.webcams = webcams
    }
    
    func loadParallel() async {
        var temporaryThumbnails: [ThumbnailImg] = []
        
        await withTaskGroup(of: (String, PlatformImage).self) { group in
            for webcam in webcams {
                if let url = URL(string: webcam.thumbnailImage) {
                    group.addTask {
                        let image = await self.loadImage(url: url)
                        return (url.absoluteString, image)
                    }
                }
            }
            
            for await result in group {
                guard let newImage = result.1.resize(withSize: CGSize(width: 100, height: 100), contentMode: .contentAspectFill) else {
                    print("Error resizing image")
                    continue
                }
                
                temporaryThumbnails.append(ThumbnailImg(url: result.0, image: newImage.cropToBounds(sizeToCrop: CGSize(width: 50.0, height: 50.0))))
            }
            
            var orderedThumbnails: [ThumbnailImg] = []
            for webcam in webcams {
                if let temporaryThumbnail = temporaryThumbnails.first(where: { $0.url == webcam.thumbnailImage }) {
                    orderedThumbnails.append(temporaryThumbnail)
                }
            }
            self.thumbnails = orderedThumbnails
        }
    }
    
    private func loadImage(url: URL) async -> PlatformImage {
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            if let img = PlatformImage(data: data) { return img }
        }
        catch { print(error) }
        return PlatformImage()
    }
}

struct ThumbnailImg: Identifiable, Hashable {
    let id = UUID()
    var url: String
    var image: PlatformImage
}

extension PlatformImage {
    
    enum ContentMode {
        case contentFill
        case contentAspectFill
        case contentAspectFit
    }
    
    func resize(withSize size: CGSize, contentMode: ContentMode = .contentAspectFill) -> PlatformImage? {
        let aspectWidth = size.width / self.size.width
        let aspectHeight = size.height / self.size.height
        
        switch contentMode {
        case .contentFill:
            return resize(withSize: size)
        case .contentAspectFit:
            let aspectRatio = min(aspectWidth, aspectHeight)
            return resize(withSize: CGSize(width: self.size.width * aspectRatio, height: self.size.height * aspectRatio))
        case .contentAspectFill:
            let aspectRatio = max(aspectWidth, aspectHeight)
            return resize(withSize: CGSize(width: self.size.width * aspectRatio, height: self.size.height * aspectRatio))
        }
    }
    
    private func resize(withSize size: CGSize) -> PlatformImage? {
        #if os(macOS)
        let newImage = NSImage(size: size)
        newImage.lockFocus()
        self.draw(in: NSRect(origin: .zero, size: size), from: NSRect(origin: .zero, size: self.size), operation: .copy, fraction: 1.0)
        newImage.unlockFocus()
        return newImage
        #else
        UIGraphicsBeginImageContextWithOptions(size, false, self.scale)
        defer { UIGraphicsEndImageContext() }
        draw(in: CGRect(x: 0.0, y: 0.0, width: size.width, height: size.height))
        return UIGraphicsGetImageFromCurrentImageContext()
        #endif
    }
    
    func cropToBounds(sizeToCrop: CGSize) -> PlatformImage {
        #if os(macOS)
        let rect = NSRect(x: (self.size.width - sizeToCrop.width) / 2,
                          y: (self.size.height - sizeToCrop.height) / 2,
                          width: sizeToCrop.width,
                          height: sizeToCrop.height)
        let cropped = NSImage(size: sizeToCrop)
        cropped.lockFocus()
        self.draw(in: NSRect(origin: .zero, size: sizeToCrop), from: rect, operation: .copy, fraction: 1.0)
        cropped.unlockFocus()
        return cropped
        #else
        guard let cgimage = self.cgImage else { return self }
        let contextSize: CGSize = self.size
        var posX: CGFloat = 0.0
        var posY: CGFloat = 0.0
        var cgwidth: CGFloat = sizeToCrop.width
        var cgheight: CGFloat = sizeToCrop.height
        
        if contextSize.width > contextSize.height {
            posX = ((contextSize.width - contextSize.height) / 2)
            posY = 0
            cgwidth = contextSize.height
            cgheight = contextSize.height
        } else {
            posX = 0
            posY = ((contextSize.height - contextSize.width) / 2)
            cgwidth = contextSize.width
            cgheight = contextSize.width
        }
        
        let rect: CGRect = CGRect(x: posX, y: posY, width: cgwidth, height: cgheight)
        guard let imageRef: CGImage = cgimage.cropping(to: rect) else { return self }
        return UIImage(cgImage: imageRef, scale: self.scale, orientation: self.imageOrientation)
        #endif
    }
}
