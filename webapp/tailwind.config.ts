import forms from '@tailwindcss/forms';
import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			colors: {
				background: '#f9fafb', // Light Gray
				surface: '#ffffff',    // White
				primary: {
					DEFAULT: '#1e40af',  // Deep Blue
					hover: '#1e3a8a'
				},
				accent: '#b91c1c',     // Alpine Red
				text: {
					DEFAULT: '#111827',
					muted: '#4b5563'
				},
				border: '#e5e7eb'
			},
			fontFamily: {
				sans: ['Inter', 'sans-serif']
			},
			borderRadius: {
				none: '0'
			}
		}
	},

	plugins: [forms]
} satisfies Config;
