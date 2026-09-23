<script lang="ts">
	import { toast } from '$lib/index.js';
	import CodeBlock from './CodeBlock.svelte';

	let { expand = $bindable() }: { expand: boolean } = $props();

	function show(value: boolean) {
		toast('Event has been created', { description: 'Monday, January 3rd at 6:00pm' });
		expand = value;
	}
</script>

<div>
	<h2>Expand</h2>
	<p>
		You can change the amount of toasts visible through the <code>visibleToasts</code> prop.
	</p>
	<div class="buttons">
		<button class="button" data-active={expand} onclick={() => show(true)}>Expand</button>
		<button class="button" data-active={!expand} onclick={() => show(false)}>Default</button>
	</div>
	<CodeBlock code={`<Toaster expand={${expand}} />`} />
</div>
