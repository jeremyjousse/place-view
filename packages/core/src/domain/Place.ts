import type { Coordinates } from './Coordinates.js';
import type { Webcam } from './Webcam.js';

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
