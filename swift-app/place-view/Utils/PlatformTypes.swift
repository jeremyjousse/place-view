//
//  PlatformTypes.swift
//  place-view
//
//  Cross-platform type definitions

import Foundation

#if os(macOS)
import AppKit
public typealias PlatformImage = NSImage
#else
import UIKit
public typealias PlatformImage = UIImage
#endif
