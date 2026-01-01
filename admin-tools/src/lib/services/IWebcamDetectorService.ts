import type { Webcam } from '../domain/Webcam';

export interface IWebcamDetectorService {
	detectWebcam(url: string): Promise<Webcam | null>;
}
