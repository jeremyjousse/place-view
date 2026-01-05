import Foundation

enum NetworkSession {
    static var shared: URLSession {
        #if DEBUG
        // On utilise le delegate qui accepte les certificats Zscaler/Auto-signés en développement
        return URLSession(configuration: .default, delegate: SSLDebugDelegate(), delegateQueue: nil)
        #else
        return URLSession.shared
        #endif
    }
}

#if DEBUG
final class SSLDebugDelegate: NSObject, URLSessionDelegate {
    func urlSession(_ session: URLSession, didReceive challenge: URLAuthenticationChallenge, completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void) {
        if challenge.protectionSpace.authenticationMethod == NSURLAuthenticationMethodServerTrust,
           let serverTrust = challenge.protectionSpace.serverTrust {
            // ATTENTION: Uniquement pour le développement avec Zscaler
            completionHandler(.useCredential, URLCredential(trust: serverTrust))
        } else {
            completionHandler(.performDefaultHandling, nil)
        }
    }
}
#endif
