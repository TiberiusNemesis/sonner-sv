<script lang="ts">
	import { INSTALL_COMMAND } from './constants.js';
	import CopyIcon from './CopyIcon.svelte';
	import { Copier } from './copy.svelte.js';

	const copier = new Copier();
</script>

<div>
	<h2>Installation</h2>
	<button class="code" onclick={() => copier.copy(INSTALL_COMMAND)}>
		{INSTALL_COMMAND}
		<span aria-hidden="true" class="copy"><CopyIcon copied={copier.copied} /></span>
	</button>
</div>

<style>
	.code {
		width: 100%;
		padding: 0 62px 0 12px;
		border-radius: 6px;
		background: linear-gradient(to top, var(--gray2), var(--gray1) 8px);
		font-family: var(--font-mono);
		font-size: 14px;
		position: relative;
		cursor: copy;
		height: 40px;
		border: 1px solid var(--gray3);
		display: flex;
		align-items: center;
		color: var(--gray12);
	}

	.copy {
		position: absolute;
		right: 6px;
		top: 50%;
		transform: translateY(-50%);
		cursor: pointer;
		border: 1px solid var(--gray4);
		background: #fff;
		color: var(--gray12);
		border-radius: 5px;
		width: 26px;
		height: 26px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
