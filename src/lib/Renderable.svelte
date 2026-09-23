<script lang="ts">
	import type { Renderable } from './types.js';

	// Renders a `Renderable`, which is either text or a snippet.
	let { content }: { content: Renderable | null | undefined } = $props();
</script>

{#if typeof content === 'function'}
	{@render content()}
{:else}
	{content ?? ''}
{/if}
