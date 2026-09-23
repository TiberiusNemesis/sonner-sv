<script lang="ts">
	import CodeBlock from './CodeBlock.svelte';

	const code = `<script>
  import { Toaster, toast } from 'sonner-sv';
</${'script'}>

<Toaster />

<button onclick={() => toast('My first toast')}>
  Give me a toast
</button>`;
</script>

<div>
	<h2>Usage</h2>
	<p>Render the toaster in the root of your app.</p>
	<CodeBlock {code} initialHeight={202} />
</div>
