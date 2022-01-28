//
//  PlaceViewVM.swift
//  place-view
//
//  Created by Jérémy Jousse on 19/01/2022.
//

import Foundation
import SwiftUI

final class PlaceViewModel: ObservableObject {
    
    @Published var thumbnails: [ThumbnailImg] = []
    @Published var selectedImage : Int = 0
    
    var temporaryThumbnails: [ThumbnailImg] = []
    
    var webcams: [Webcam]
    
    init(webcams: [Webcam]) {
        self.webcams = webcams
    }
    
    
    func loadParallel() async {
        return await withTaskGroup(of: (String, UIImage).self) { group in
            for webcam in webcams {
                print(webcam.thumbnailImage)
                if let url = URL(string: webcam.thumbnailImage) {
                    group.addTask { await (url.absoluteString, self.loadImage(url: url)) }
                }
            }
            for await result in group {
                guard let newImage = result.1.resize(withSize: CGSize(width: 100, height: 100), contentMode: .contentAspectFill) else {
                    
                    
                    print("Error")
                    return
                }
                
                self.temporaryThumbnails.append(ThumbnailImg(url: result.0, image: newImage.cropToBounds(sizeToCrop: CGSize(width: 50.0, height: 50.0))))
            }
            for webcam in webcams {
                DispatchQueue.main.async {
                    if let temporaryThumbnail = self.temporaryThumbnails.filter({ temporaryThumbnail in
                        temporaryThumbnail.url == webcam.thumbnailImage
                    }).first {
                        self.thumbnails.append(temporaryThumbnail)
                    }
                }
            }
        }
    }
    
    private func loadImage(url: URL) async -> UIImage {
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            if let img = UIImage(data: data) { return img }
        }
        catch { print(error) }
        return UIImage()
    }
}


struct ThumbnailImg: Identifiable, Hashable {
    let id = UUID()
    var url: String
    var image: UIImage
}


extension UIImage {
    
    enum ContentMode {
        case contentFill
        case contentAspectFill
        case contentAspectFit
    }
    
    func resize(withSize size: CGSize, contentMode: ContentMode = .contentAspectFill) -> UIImage? {
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
        
        // add cropToBounds
    }
    
    private func resize(withSize size: CGSize) -> UIImage? {
        UIGraphicsBeginImageContextWithOptions(size, false, self.scale)
        defer { UIGraphicsEndImageContext() }
        draw(in: CGRect(x: 0.0, y: 0.0, width: size.width, height: size.height))
        return UIGraphicsGetImageFromCurrentImageContext()
    }
    
    
    func cropToBounds(sizeToCrop: CGSize) -> UIImage {
        
        let cgimage = self.cgImage!
        let contextImage: UIImage = UIImage(cgImage: cgimage)
        let contextSize: CGSize = contextImage.size
        var posX: CGFloat = 0.0
        var posY: CGFloat = 0.0
        var cgwidth: CGFloat = CGFloat(sizeToCrop.width)
        var cgheight: CGFloat = CGFloat(sizeToCrop.height)
        
        // See what size is longer and create the center off of that
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
        
        // Create bitmap image from context using the rect
        let imageRef: CGImage = cgimage.cropping(to: rect)!
        
        // Create a new image based on the imageRef and rotate back to the original orientation
        let image: UIImage = UIImage(cgImage: imageRef, scale: self.scale, orientation: self.imageOrientation)
        
        return image
    }
}
