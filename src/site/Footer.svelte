<script lang="ts">
	import { REPO_URL } from './constants.js';
</script>

<footer>
	<div class="container">
		<p>
			A Svelte port of <a href="https://sonner.emilkowal.ski" target="_blank">Sonner</a> by
			<a href="https://emilkowal.ski" target="_blank">Emil Kowalski</a>. Source on
			<a href={REPO_URL} target="_blank">GitHub</a>.
		</p>
	</div>
</footer>

<style>
	footer {
		padding: 32px 0;
		border-top: 1px solid var(--gray3);
		background: var(--gray1);
		margin-top: 164px;
	}

	p {
		margin: 0;
		font-size: 14px;
	}

	a {
		font-weight: 600;
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
	}

	@media (max-width: 600px) {
		footer {
			margin-top: 128px;
			padding: 16px 0;
		}
	}
</style>
