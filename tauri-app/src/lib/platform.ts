import { isTauri } from '@tauri-apps/api/core';
import { type as getOsType } from '@tauri-apps/plugin-os';

export function isDesktopTauri(): boolean {
	if (typeof window === 'undefined' || !isTauri()) {
		return false;
	}

	try {
		const os = getOsType();
		return os === 'macos' || os === 'windows' || os === 'linux';
	} catch {
		return false;
	}
}
