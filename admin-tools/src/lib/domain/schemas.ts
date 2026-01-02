import { z } from 'zod';

export const CoordinatesSchema = z.object({
	latitude: z.number(),
	longitude: z.number()
});

export const WebcamSchema = z.object({
	name: z.string().min(1, 'Webcam name is required'),
	largeImage: z.string().url('Large image must be a valid URL'),
	thumbnailImage: z.string().url('Thumbnail image must be a valid URL')
});

export const PlaceSchema = z.object({
	id: z.string().min(1, 'ID is required'),
	name: z.string().min(1, 'Name is required'),
	country: z.string().min(1, 'Country is required'),
	state: z.string().min(1, 'State is required'),
	url: z.string().url('Official URL must be a valid URL'),
	coordinates: CoordinatesSchema,
	webcams: z.array(WebcamSchema)
});

export type PlaceDto = z.infer<typeof PlaceSchema>;
export type WebcamDto = z.infer<typeof WebcamSchema>;
export type CoordinatesDto = z.infer<typeof CoordinatesSchema>;
