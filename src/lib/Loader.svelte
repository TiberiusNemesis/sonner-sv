<script lang="ts">
	import { cn } from './utils.js';

	let { visible, class: className }: { visible: boolean; class?: string } = $props();
</script>

<div class={cn('sonner-loading-wrapper', className)} data-visible={visible}>
	<div class="sonner-spinner">
		{#each { length: 12 }, i (i)}
			<div class="sonner-loading-bar"></div>
		{/each}
	</div>
</div>
