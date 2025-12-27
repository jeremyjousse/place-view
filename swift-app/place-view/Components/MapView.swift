import SwiftUI
import MapKit

#if os(iOS)
struct MapView: UIViewRepresentable {
    var coordinates: CLLocationCoordinate2D
    
    @State private var region = MKCoordinateRegion()
    
    func makeUIView(context: Context) -> MKMapView {
        MKMapView(frame: .zero)
    }
    
    func updateUIView(_ view: MKMapView, context: Context) {
        let annotation = MKPointAnnotation()
        annotation.coordinate = coordinates
        //        annotation.title = "Title"
        view.addAnnotation(annotation)
        
        let span = MKCoordinateSpan(latitudeDelta: 0.3, longitudeDelta: 0.3)
        let region = MKCoordinateRegion(center: coordinates, span: span)
        view.setRegion(region, animated: true)
        
        //view.addAnnotations(annotations: annotations)
    }
}
#elseif os(macOS)
struct MapView: NSViewRepresentable {
    var coordinates: CLLocationCoordinate2D
    
    @State private var region = MKCoordinateRegion()
    
    func makeNSView(context: Context) -> MKMapView {
        MKMapView(frame: .zero)
    }
    
    func updateNSView(_ view: MKMapView, context: Context) {
        let annotation = MKPointAnnotation()
        annotation.coordinate = coordinates
        //        annotation.title = "Title"
        view.addAnnotation(annotation)
        
        let span = MKCoordinateSpan(latitudeDelta: 0.3, longitudeDelta: 0.3)
        let region = MKCoordinateRegion(center: coordinates, span: span)
        view.setRegion(region, animated: true)
        
        //view.addAnnotations(annotations: annotations)
    }
}
#endif


struct AnnotationItem: Identifiable {
    var coordinate: CLLocationCoordinate2D
    let id = UUID()
}

struct MapView_Previews: PreviewProvider {
    static var previews: some View {
        MapView(coordinates: CLLocationCoordinate2D(latitude: 45.904690, longitude: 6.142201))
    }
}
