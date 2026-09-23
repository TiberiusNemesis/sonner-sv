<script lang="ts">
	import { toast } from '$lib/index.js';
	import CodeBlock from './CodeBlock.svelte';

	let {
		richColors = $bindable(),
		closeButton = $bindable()
	}: { richColors: boolean; closeButton: boolean } = $props();

	const allTypes = [
		{
			name: 'Rich Colors Success',
			snippet: `toast.success('Event has been created')`,
			action: () => {
				toast.success('Event has been created');
				richColors = true;
			}
		},
		{
			name: 'Rich Colors Error',
			snippet: `toast.error('Event has not been created')`,
			action: () => {
				toast.error('Event has not been created');
				richColors = true;
			}
		},
		{
			name: 'Rich Colors Info',
			snippet: `toast.info('Be at the area 10 minutes before the event time')`,
			action: () => {
				toast.info('Be at the area 10 minutes before the event time');
				richColors = true;
			}
		},
		{
			name: 'Rich Colors Warning',
			snippet: `toast.warning('Event start time cannot be earlier than 8am')`,
			action: () => {
				toast.warning('Event start time cannot be earlier than 8am');
				richColors = true;
			}
		},
		{
			name: 'Close Button',
			snippet: `toast('Event has been created', {
  description: 'Monday, January 3rd at 6:00pm',
})`,
			action: () => {
				toast('Event has been created', { description: 'Monday, January 3rd at 6:00pm' });
				closeButton = !closeButton;
			}
		},
		{
			name: 'Headless',
			snippet: `{#snippet custom(id)}
  <div>
    <h1>Custom toast</h1>
    <button onclick={() => toast.dismiss(id)}>Dismiss</button>
  </div>
{/snippet}

<button onclick={() => toast.custom(custom)}>Render</button>`,
			action: () => {
				toast.custom(headless, { duration: 999999 });
				closeButton = !closeButton;
			}
		}
	];

	let activeType = $state(allTypes[0]);

	const richColorsActive = $derived(activeType.name.includes('Rich'));
	const closeButtonActive = $derived(activeType.name.includes('Close'));
</script>

{#snippet headless(id: number | string)}
	<div class="headless">
		<p class="headless-title">Event Created</p>
		<p class="headless-description">Today at 4:00pm - "Louvre Museum"</p>
		<button class="headless-close" aria-label="Close" onclick={() => toast.dismiss(id)}>
			<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
				<path
					d="M2.96967 2.96967C3.26256 2.67678 3.73744 2.67678 4.03033 2.96967L8 6.939L11.9697 2.96967C12.2626 2.67678 12.7374 2.67678 13.0303 2.96967C13.3232 3.26256 13.3232 3.73744 13.0303 4.03033L9.061 8L13.0303 11.9697C13.2966 12.2359 13.3208 12.6526 13.1029 12.9462L13.0303 13.0303C12.7374 13.3232 12.2626 13.3232 11.9697 13.0303L8 9.061L4.03033 13.0303C3.73744 13.3232 3.26256 13.3232 2.96967 13.0303C2.67678 12.7374 2.67678 12.2626 2.96967 11.9697L6.939 8L2.96967 4.03033C2.7034 3.76406 2.6792 3.3474 2.89705 3.05379L2.96967 2.96967Z"
				></path>
			</svg>
		</button>
	</div>
{/snippet}

<div>
	<h2>Other</h2>
	<div class="buttons">
		{#each allTypes as type (type.name)}
			<button
				class="button"
				onclick={() => {
					type.action();
					activeType = type;
				}}
			>
				{type.name}
			</button>
		{/each}
	</div>
	<CodeBlock
		code={`${activeType.snippet}

<!-- ... -->

<Toaster ${richColorsActive ? 'richColors ' : ''}${closeButtonActive ? 'closeButton ' : ''}/>`}
	/>
</div>

<style>
	:global(ol[dir='ltr']) .headless-close {
		--headless-close-start: unset;
		--headless-close-end: 6px;
	}

	:global(ol[dir='rtl']) .headless-close {
		--headless-close-start: 6px;
		--headless-close-end: unset;
	}

	.headless {
		padding: 16px;
		width: 356px;
		box-sizing: border-box;
		border-radius: 8px;
		background: var(--gray1);
		border: 1px solid var(--gray4);
		position: relative;
	}

	.headless-description {
		margin: 0;
		color: var(--gray10);
		font-size: 14px;
		line-height: 1;
	}

	.headless-title {
		font-size: 14px;
		margin: 0 0 8px;
		color: var(--gray12);
		font-weight: 500;
		line-height: 1;
	}

	.headless-close {
		position: absolute;
		cursor: pointer;
		top: 6px;
		height: 24px;
		width: 24px;
		display: flex;
		justify-content: center;
		align-items: center;
		left: var(--headless-close-start);
		right: var(--headless-close-end);
		color: var(--gray10);
		padding: 0;
		background: transparent;
		border: none;
		transition: color 200ms;
	}

	.headless-close:hover {
		color: var(--gray12);
	}
</style>
