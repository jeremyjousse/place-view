import { randomBytes } from 'node:crypto';
import { appendFileSync } from 'node:fs';

/**
 * Emits semantic-release results to GitHub Actions `$GITHUB_OUTPUT` without shell interpolation.
 */
export function success(_pluginConfig, context) {
	const outputPath = process.env.GITHUB_OUTPUT;
	if (!outputPath || !context?.nextRelease) {
		return;
	}

	const { version, notes = '' } = context.nextRelease;
	const delimiter = `EOF_${randomBytes(12).toString('hex')}`;

	appendFileSync(
		outputPath,
		[
			'released=true',
			`version=${version}`,
			`notes<<${delimiter}`,
			notes.trim(),
			delimiter,
			''
		].join('\n'),
		'utf8'
	);
}
