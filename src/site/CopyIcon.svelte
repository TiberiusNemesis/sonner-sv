<script lang="ts">
	import { fade, scale } from 'svelte/transition';

	// Swaps the copy icon for a checkmark while `copied` is true.
	let { copied }: { copied: boolean } = $props();
</script>

<span class="icon">
	{#key copied}
		<span in:scale={{ start: 0.5, duration: 150, delay: 150 }} out:fade={{ duration: 150 }}>
			<svg
				viewBox="0 0 24 24"
				width="14"
				height="14"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				fill="none"
				shape-rendering="geometricPrecision"
			>
				{#if copied}
					<path d="M20 6L9 17l-5-5"></path>
				{:else}
					<path
						d="M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z"
					></path>
				{/if}
			</svg>
		</span>
	{/key}
</span>

<style>
	.icon {
		display: grid;
	}

	.icon > span {
		grid-area: 1 / 1;
		display: flex;
	}
</style>
