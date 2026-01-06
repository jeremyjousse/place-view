//
//  ImageLoaderProtocol.swift
//  place-view
//
//  Domain layer protocol for Image loading

import Foundation

protocol ImageLoaderProtocol: Sendable {
    func loadImage(url: URL) async -> PlatformImage
}
