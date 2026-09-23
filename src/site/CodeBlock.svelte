<script lang="ts">
	import CopyIcon from './CopyIcon.svelte';
	import { Copier } from './copy.svelte.js';
	import { highlight } from './highlight.js';

	let { code, initialHeight = 0 }: { code: string; initialHeight?: number } = $props();

	const copier = new Copier();
	let height = $state(0);
	const tokens = $derived(highlight(code));
</script>

<div class="outer">
	<button class="copy" onclick={() => copier.copy(code)} aria-label="Copy code">
		<CopyIcon copied={copier.copied} />
	</button>
	<pre class="wrapper" style:height="{height || initialHeight}px"><div
			class="root"
			bind:offsetHeight={height}>{#each tokens as token, i (i)}<span class={token.type}
					>{token.text}</span
				>{/each}</div></pre>
</div>

<style>
	.outer {
		position: relative;
	}

	.wrapper {
		overflow: hidden;
		margin: 16px 0 0;
		position: relative;
		border-radius: 6px;
		border: 1px solid var(--gray3);
		padding: 0;
		transition: height 200ms ease-out;
	}

	.root {
		padding: 16px;
		line-height: 17px;
		white-space: pre-wrap;
		font-size: 12px;
		font-family: var(--font-mono);
		color: var(--gray12);
		background: linear-gradient(to top, var(--gray2), var(--gray1) 16px);
	}

	.comment,
	.punctuation {
		color: var(--gray9);
	}

	.keyword,
	.string {
		color: var(--gray11);
	}

	.copy {
		position: absolute;
		top: 12px;
		right: 12px;
		z-index: 1;
		width: 26px;
		height: 26px;
		border: 1px solid var(--gray4);
		border-radius: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--gray0);
		cursor: pointer;
		opacity: 0;
		color: var(--gray12);
		transition:
			background 200ms,
			box-shadow 200ms,
			opacity 200ms;
	}

	.copy:hover {
		background: var(--gray1);
	}

	.copy:focus-visible {
		opacity: 1;
		box-shadow: 0 0 0 1px var(--gray4);
	}

	.outer:hover .copy {
		opacity: 1;
	}
</style>
