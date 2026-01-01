import type { Coordinates } from './Coordinates';
import type { Webcam } from './Webcam';

export interface Place {
	id: string; // Unique identifier (slug-like)
	name: string;
	country: string;
	state: string;
	url: string; // Official website URL
	coordinates: Coordinates;
	webcams: Webcam[];
}
