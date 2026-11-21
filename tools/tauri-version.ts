import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SEMVER_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

export function assertValidSemver(version: string): string {
	const trimmed = version.trim();
	if (!SEMVER_PATTERN.test(trimmed)) {
		throw new Error(`Invalid semantic version: "${version}"`);
	}
	return trimmed;
}

export function updateJsonVersion(raw: string, nextVersion: string): string {
	const version = assertValidSemver(nextVersion);
	const parsed = JSON.parse(raw) as Record<string, unknown>;
	if (typeof parsed.version !== 'string') {
		throw new Error('Expected string "version" field in JSON manifest.');
	}
	parsed.version = version;
	return `${JSON.stringify(parsed, null, '\t')}\n`;
}

export function updateCargoTomlVersion(raw: string, nextVersion: string): string {
	const version = assertValidSemver(nextVersion);
	const lineEnding = raw.includes('\r\n') ? '\r\n' : '\n';
	const lines = raw.split(lineEnding);

	let inPackageSection = false;
	let replaced = false;

	const updated = lines.map((line) => {
		const trimmed = line.trim();
		if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
			inPackageSection = trimmed === '[package]';
			return line;
		}
		if (inPackageSection && !replaced && /^version\s*=\s*"[^"]*"/.test(trimmed)) {
			replaced = true;
			return line.replace(/version\s*=\s*"[^"]*"/, `version = "${version}"`);
		}
		return line;
	});

	if (!replaced) {
		throw new Error('Could not find [package] version in Cargo.toml.');
	}

	return updated.join(lineEnding);
}

export function updateCargoLockVersion(
	raw: string,
	nextVersion: string,
	packageName = 'app'
): string {
	const version = assertValidSemver(nextVersion);
	const lineEnding = raw.includes('\r\n') ? '\r\n' : '\n';
	const lines = raw.split(lineEnding);

	let inPackageBlock = false;
	let matchesTargetPackage = false;
	let replaced = false;

	const updated = lines.map((line) => {
		const trimmed = line.trim();
		if (trimmed === '[[package]]') {
			inPackageBlock = true;
			matchesTargetPackage = false;
			return line;
		}
		if (trimmed.startsWith('[')) {
			inPackageBlock = false;
			matchesTargetPackage = false;
			return line;
		}
		if (inPackageBlock && trimmed === `name = "${packageName}"`) {
			matchesTargetPackage = true;
			return line;
		}
		if (
			inPackageBlock &&
			matchesTargetPackage &&
			!replaced &&
			/^version\s*=\s*"[^"]*"/.test(trimmed)
		) {
			replaced = true;
			return line.replace(/version\s*=\s*"[^"]*"/, `version = "${version}"`);
		}
		return line;
	});

	if (!replaced) {
		throw new Error(`Could not find [[package]] "${packageName}" version in Cargo.lock.`);
	}

	return updated.join(lineEnding);
}

export function bumpTauriVersion(repoRoot: string, nextVersion: string): string[] {
	const version = assertValidSemver(nextVersion);

	const targets: Array<{ path: string; transform: (raw: string, v: string) => string }> = [
		{ path: 'tauri-app/package.json', transform: updateJsonVersion },
		{ path: 'tauri-app/src-tauri/tauri.conf.json', transform: updateJsonVersion },
		{ path: 'tauri-app/src-tauri/Cargo.toml', transform: updateCargoTomlVersion },
		{ path: 'tauri-app/src-tauri/Cargo.lock', transform: updateCargoLockVersion }
	];

	const updatedPaths: string[] = [];
	for (const target of targets) {
		const fullPath = resolve(repoRoot, target.path);
		const current = readFileSync(fullPath, 'utf8');
		const next = target.transform(current, version);
		if (next !== current) {
			writeFileSync(fullPath, next, 'utf8');
		}
		updatedPaths.push(target.path);
	}

	return updatedPaths;
}
