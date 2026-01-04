import type { Coordinates } from './Coordinates';
import type { Webcam } from './Webcam';

export interface Place {
	id: string;
	name: string;
	country: string;
	state: string;
	url: string;
	description?: string;
	coordinates: Coordinates;
	webcams: Webcam[];
}
