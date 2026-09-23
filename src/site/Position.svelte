<script lang="ts">
	import { toast, useSonner, type Position } from '$lib/index.js';
	import CodeBlock from './CodeBlock.svelte';

	const positions: Position[] = [
		'top-left',
		'top-center',
		'top-right',
		'bottom-left',
		'bottom-center',
		'bottom-right'
	];

	let { position = $bindable() }: { position: Position } = $props();

	const sonner = useSonner();
</script>

<div>
	<h2>Position</h2>
	<p>Swipe direction changes depending on the position.</p>
	<div class="buttons">
		{#each positions as option (option)}
			<button
				class="button"
				data-active={position === option}
				onclick={() => {
					if (position !== option) {
						position = option;
						sonner.toasts.forEach((t) => toast.dismiss(t.id));
					}

					toast('Event has been created', { description: 'Monday, January 3rd at 6:00pm' });
				}}
			>
				{option}
			</button>
		{/each}
	</div>
	<CodeBlock code={`<Toaster position="${position}" />`} />
</div>
