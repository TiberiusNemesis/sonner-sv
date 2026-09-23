<script lang="ts">
	import { toast } from '$lib/index.js';
	import CodeBlock from './CodeBlock.svelte';

	const promiseCode = '`${data.name} toast has been added`';

	const allTypes = [
		{
			name: 'Default',
			snippet: `toast('Event has been created')`,
			action: () => toast('Event has been created')
		},
		{
			name: 'Description',
			snippet: `toast.message('Event has been created', {
  description: 'Monday, January 3rd at 6:00pm',
})`,
			action: () =>
				toast('Event has been created', { description: 'Monday, January 3rd at 6:00pm' })
		},
		{
			name: 'Success',
			snippet: `toast.success('Event has been created')`,
			action: () => toast.success('Event has been created')
		},
		{
			name: 'Info',
			snippet: `toast.info('Be at the area 10 minutes before the event time')`,
			action: () => toast.info('Be at the area 10 minutes before the event time')
		},
		{
			name: 'Warning',
			snippet: `toast.warning('Event start time cannot be earlier than 8am')`,
			action: () => toast.warning('Event start time cannot be earlier than 8am')
		},
		{
			name: 'Error',
			snippet: `toast.error('Event has not been created')`,
			action: () => toast.error('Event has not been created')
		},
		{
			name: 'Action',
			snippet: `toast('Event has been created', {
  action: {
    label: 'Undo',
    onClick: () => console.log('Undo')
  },
})`,
			action: () =>
				toast.message('Event has been created', {
					action: { label: 'Undo', onClick: () => console.log('Undo') }
				})
		},
		{
			name: 'Promise',
			snippet: `const promise = () => new Promise((resolve) => setTimeout(() => resolve({ name: 'Sonner' }), 2000));

toast.promise(promise, {
  loading: 'Loading...',
  success: (data) => {
    return ${promiseCode};
  },
  error: 'Error',
});`,
			action: () =>
				toast.promise<{ name: string }>(
					() => new Promise((resolve) => setTimeout(() => resolve({ name: 'Sonner' }), 2000)),
					{
						loading: 'Loading...',
						success: (data) => `${data.name} toast has been added`,
						error: 'Error'
					}
				)
		},
		{
			name: 'Custom',
			snippet: `{#snippet custom()}
  <div>A custom toast with default styling</div>
{/snippet}

<button onclick={() => toast(custom)}>Render</button>`,
			action: () => toast(custom, { duration: 1000000 })
		}
	];

	let activeType = $state(allTypes[0]);
</script>

{#snippet custom()}
	<div>A custom toast with default styling</div>
{/snippet}

<div>
	<h2>Types</h2>
	<p>
		You can customize the type of toast you want to render, and pass an options object as the second
		argument.
	</p>
	<div class="buttons">
		{#each allTypes as type (type.name)}
			<button
				class="button"
				data-active={activeType.name === type.name}
				onclick={() => {
					type.action();
					activeType = type;
				}}
			>
				{type.name}
			</button>
		{/each}
	</div>
	<CodeBlock code={activeType.snippet} />
</div>
