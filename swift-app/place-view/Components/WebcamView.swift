//
//  WebcamView.swift
//  place-view
//

import SwiftUI
import Kingfisher

struct WebcamView: View {
    var imageUrl: String
    @State private var isFullScreenPresented = false
    @State private var isCentered = false
    
    var body: some View {
        ZStack {
            if !isCentered {
                ProgressView()
                    .frame(width: 350, height: 350)
                    .background(Color(.systemGray6))
            }
            
            ScrollViewReader { proxy in
                ScrollView(.horizontal, showsIndicators: false) {
                    Button(action: { isFullScreenPresented = true }) {
                        KFImage(URL(string: imageUrl))
                            .onSuccess { _ in
                                proxy.scrollTo("largeImage", anchor: .center)
                                DispatchQueue.main.async {
                                    isCentered = true
                                }
                            }
                            .fade(duration: 0)
                            .resizable()
                            .scaledToFill()
                            .frame(height: 350)
                            .id("largeImage")
                            .opacity(isCentered ? 1 : 0)
                    }
                    .buttonStyle(.plain)
                }
                .scrollDisabled(!isCentered)
            }
            .frame(width: 350, height: 350)
            .cornerRadius(10)
        }
        .onChange(of: imageUrl) { _ in
            isCentered = false
        }
        .fullScreenCover(isPresented: $isFullScreenPresented) {
            FullScreenWebcamView(imageUrl: imageUrl)
        }
    }
}

struct FullScreenWebcamView: View {
    let imageUrl: String
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            
            KFImage(URL(string: imageUrl))
                .placeholder {
                    ProgressView().tint(.white)
                }
                .resizable()
                .scaledToFit()
                .ignoresSafeArea()
            
            VStack {
                HStack {
                    Spacer()
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 30))
                            .foregroundColor(.white)
                            .padding()
                    }
                }
                Spacer()
            }
        }
    }
}

