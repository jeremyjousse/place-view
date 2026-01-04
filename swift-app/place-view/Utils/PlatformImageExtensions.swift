//
//  PlatformImageExtensions.swift
//  place-view
//
//  Extensions for cross-platform image processing

import Foundation
import CoreGraphics

#if os(macOS)
import AppKit
#else
import UIKit
#endif

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
        
        // Center crop to target size
        let targetWidth = min(sizeToCrop.width, contextSize.width)
        let targetHeight = min(sizeToCrop.height, contextSize.height)
        
        let posX = (contextSize.width - targetWidth) / 2
        let posY = (contextSize.height - targetHeight) / 2
        
        let rect: CGRect = CGRect(x: posX, y: posY, width: targetWidth, height: targetHeight)
        guard let imageRef: CGImage = cgimage.cropping(to: rect) else { return self }
        return UIImage(cgImage: imageRef, scale: self.scale, orientation: self.imageOrientation)
        #endif
    }
}
