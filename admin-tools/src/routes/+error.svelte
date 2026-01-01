<!-- eslint-disable svelte/no-navigation-without-resolve -->
<script>
	import { page } from '$app/stores';
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
	<div class="w-full max-w-md space-y-8 text-center">
		<div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
				{$page.status}
			</h2>
			<p class="mt-2 text-center text-sm text-gray-600">
				{$page.error?.message}
			</p>
		</div>
		<div>
			<a href="/" class="font-medium text-indigo-600 hover:text-indigo-500"> Go back home </a>
		</div>
	</div>
</div>
