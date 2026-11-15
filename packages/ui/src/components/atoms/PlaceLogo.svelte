<script lang="ts">
	interface Props {
		class?: string;
		ariaHidden?: boolean;
	}

	let { class: className = 'h-8 w-8', ariaHidden = true }: Props = $props();

	const uid = $props.id();
	const bgId = `${uid}-bg`;
	const rimId = `${uid}-rim`;
	const irisId = `${uid}-iris`;
	const barId = `${uid}-bar`;
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 1024 1024"
	fill="none"
	class={className}
	aria-hidden={ariaHidden}
>
	<defs>
		<linearGradient id={bgId} x1="512" y1="44" x2="512" y2="980" gradientUnits="userSpaceOnUse">
			<stop offset="0" stop-color="#171e2b" />
			<stop offset="1" stop-color="#0d1118" />
		</linearGradient>
		<linearGradient id={rimId} x1="44" y1="44" x2="980" y2="980" gradientUnits="userSpaceOnUse">
			<stop offset="0" stop-color="#7fa419" />
			<stop offset="0.45" stop-color="#283140" />
			<stop offset="1" stop-color="#3a4a2a" />
		</linearGradient>
		<linearGradient id={irisId} x1="512" y1="476" x2="512" y2="612" gradientUnits="userSpaceOnUse">
			<stop offset="0" stop-color="#c9ff24" />
			<stop offset="1" stop-color="#9fe80c" />
		</linearGradient>
		<linearGradient id={barId} x1="360" y1="772" x2="664" y2="820" gradientUnits="userSpaceOnUse">
			<stop offset="0" stop-color="#12e3ff" />
			<stop offset="1" stop-color="#3db6ff" />
		</linearGradient>
	</defs>
	<rect
		x="44"
		y="44"
		width="936"
		height="936"
		rx="215"
		fill={`url(#${bgId})`}
		stroke={`url(#${rimId})`}
		stroke-width="6"
	/>
	<path
		d="M512 209 L246 672 Q232 696 260 715 L376 715 Q384 715 390 704 L512 492 Z"
		fill="#c1fc1f"
	/>
	<path
		d="M512 209 L778 672 Q792 696 764 715 L648 715 Q640 715 634 704 L512 492 Z"
		fill="#aaf20f"
	/>
	<circle cx="512" cy="544" r="117" fill="#1f2737" />
	<circle cx="512" cy="544" r="95" fill="#0d1118" />
	<circle cx="512" cy="544" r="68" fill={`url(#${irisId})`} />
	<circle cx="491" cy="523" r="20" fill="#ffffff" />
	<rect x="360" y="772" width="304" height="48" rx="24" fill={`url(#${barId})`} />
</svg>
