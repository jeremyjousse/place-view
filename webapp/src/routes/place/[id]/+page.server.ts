import type { EntryGenerator } from './$types';
import places from '../../../../../resources/places.json';

export const entries: EntryGenerator = () => places.map(({ id }) => ({ id }));
