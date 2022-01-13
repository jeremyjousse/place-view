//
//  ApiClient.swift
//  place-view
//
//  Created by Jérémy Jousse on 13/01/2022.
//

import Foundation


struct ApiClient {
    
    func fetch<T: Decodable>(_ type: T.Type, url: URL?, completion: @escaping(Result<T,ApiError>) -> Void) {
        guard let url = url else {
            let error = ApiError.badURL
            completion(Result.failure(error))
            return
        }
        let task = URLSession.shared.dataTask(with: url) {(data , response, error) in
            
            if let error = error as? URLError {
                completion(Result.failure(ApiError.url(error)))
            }else if  let response = response as? HTTPURLResponse, !(200...299).contains(response.statusCode) {
                completion(Result.failure(ApiError.badResponse(statusCode: response.statusCode)))
            }else if let data = data {
                let decoder = JSONDecoder()
                do {
                    let result = try decoder.decode(type, from: data)
                    completion(Result.success(result))
                    
                }catch {
                    completion(Result.failure(ApiError.parsing(error as? DecodingError)))
                }

            }
        }

        task.resume()
    }
    
    
    func fetchPlaces(url: URL?, completion: @escaping(Result<[Place], ApiError>) -> Void) {
        guard let url = url else {
            let error = ApiError.badURL
            completion(Result.failure(error))
            return
        }
        let task = URLSession.shared.dataTask(with: url) {(data , response, error) in

            if let error = error as? URLError {
                completion(Result.failure(ApiError.url(error)))
            }else if  let response = response as? HTTPURLResponse, !(200...299).contains(response.statusCode) {
                completion(Result.failure(ApiError.badResponse(statusCode: response.statusCode)))
            }else if let data = data {
                let decoder = JSONDecoder()
                do {
                    let places = try decoder.decode([Place].self, from: data)
                    completion(Result.success(places))
                }catch {
                    completion(Result.failure(ApiError.parsing(error as? DecodingError)))
                }
            }
        }

        task.resume()

    }
}
