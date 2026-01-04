//
//  ImageLoaderProtocol.swift
//  place-view
//
//  Domain layer protocol for Image loading

import Foundation

#if os(macOS)
import AppKit
typealias PlatformImage = NSImage
#else
import UIKit
typealias PlatformImage = UIImage
#endif

protocol ImageLoaderProtocol: Sendable {
    func loadImage(url: URL) async -> PlatformImage
}
