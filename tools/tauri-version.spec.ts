import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
	bumpTauriVersion,
	updateCargoLockVersion,
	updateCargoTomlVersion,
	updateJsonVersion
} from './tauri-version.js';

const tempDirs: string[] = [];

afterEach(() => {
	while (tempDirs.length > 0) {
		const dir = tempDirs.pop();
		if (dir) {
			rmSync(dir, { recursive: true, force: true });
		}
	}
});

describe('tauri-version', () => {
	it('updates JSON version with tab indentation and trailing newline', () => {
		const input = '{\n\t"name": "tauri-app",\n\t"version": "0.1.0"\n}\n';
		expect(updateJsonVersion(input, '0.2.0')).toBe(
			'{\n\t"name": "tauri-app",\n\t"version": "0.2.0"\n}\n'
		);
	});

	it('updates only [package] version in Cargo.toml', () => {
		const input = [
			'[package]',
			'name = "app"',
			'version = "0.1.0"',
			'',
			'[dependencies]',
			'serde = { version = "1.0" }',
			''
		].join('\n');

		const output = updateCargoTomlVersion(input, '1.2.3-beta.1');
		expect(output).toContain('[package]\nname = "app"\nversion = "1.2.3-beta.1"');
		expect(output).toContain('serde = { version = "1.0" }');
	});

	it('updates only target [[package]] version in Cargo.lock', () => {
		const input = [
			'[[package]]',
			'name = "anyhow"',
			'version = "1.0.104"',
			'',
			'[[package]]',
			'name = "app"',
			'version = "0.1.0"',
			'dependencies = []',
			''
		].join('\n');

		const output = updateCargoLockVersion(input, '0.2.0');
		expect(output).toContain('name = "anyhow"\nversion = "1.0.104"');
		expect(output).toContain('name = "app"\nversion = "0.2.0"');
	});

	it('rejects invalid semver strings', () => {
		expect(() => updateJsonVersion('{"version":"0.1.0"}', 'v0.2.0')).toThrow(
			/Invalid semantic version/
		);
	});

	it('bumps all four Tauri manifests in a workspace', () => {
		const root = mkdtempSync(join(tmpdir(), 'place-view-version-'));
		tempDirs.push(root);
		mkdirSync(join(root, 'tauri-app/src-tauri'), { recursive: true });

		writeFileSync(join(root, 'tauri-app/package.json'), '{\n\t"version": "0.1.0"\n}\n');
		writeFileSync(
			join(root, 'tauri-app/src-tauri/tauri.conf.json'),
			'{\n\t"version": "0.1.0"\n}\n'
		);
		writeFileSync(
			join(root, 'tauri-app/src-tauri/Cargo.toml'),
			'[package]\nname = "app"\nversion = "0.1.0"\n'
		);
		writeFileSync(
			join(root, 'tauri-app/src-tauri/Cargo.lock'),
			'[[package]]\nname = "app"\nversion = "0.1.0"\n'
		);

		bumpTauriVersion(root, '0.2.0');

		expect(readFileSync(join(root, 'tauri-app/package.json'), 'utf8')).toContain(
			'"version": "0.2.0"'
		);
		expect(readFileSync(join(root, 'tauri-app/src-tauri/tauri.conf.json'), 'utf8')).toContain(
			'"version": "0.2.0"'
		);
		expect(readFileSync(join(root, 'tauri-app/src-tauri/Cargo.toml'), 'utf8')).toContain(
			'version = "0.2.0"'
		);
		expect(readFileSync(join(root, 'tauri-app/src-tauri/Cargo.lock'), 'utf8')).toContain(
			'version = "0.2.0"'
		);
	});
});
