<script lang="ts">
	import { Toaster, type Position as ToasterPosition } from '$lib/index.js';
	import Expand from '../site/Expand.svelte';
	import Footer from '../site/Footer.svelte';
	import Hero from '../site/Hero.svelte';
	import Installation from '../site/Installation.svelte';
	import Other from '../site/Other.svelte';
	import Position from '../site/Position.svelte';
	import '../site/site.css';
	import Types from '../site/Types.svelte';
	import Usage from '../site/Usage.svelte';

	let expand = $state(false);
	let position = $state<ToasterPosition>('bottom-right');
	let richColors = $state(false);
	let closeButton = $state(false);
</script>

<svelte:head>
	<title>Sonner for Svelte</title>
	<meta name="description" content="An opinionated toast component for Svelte." />
	<meta property="og:title" content="Sonner for Svelte" />
	<meta property="og:description" content="An opinionated toast component for Svelte." />
</svelte:head>

<Toaster theme="light" {richColors} {closeButton} {expand} {position} duration={Infinity} />
<main class="container">
	<Hero />
	<div class="content">
		<Installation />
		<Usage />
		<Types />
		<Position bind:position />
		<Expand bind:expand />
		<Other bind:richColors bind:closeButton />
		<div>
			<h2>Credits</h2>
			<p>
				This is a port of <a href="https://sonner.emilkowal.ski" target="_blank">Sonner</a>, built
				by Emil Kowalski. You can read more about why and how it was built
				<a href="https://emilkowal.ski/ui/building-a-toast-component" target="_blank">here</a>.
			</p>
		</div>
	</div>
</main>
<Footer />
