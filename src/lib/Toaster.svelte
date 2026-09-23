<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { ToastState } from './state.js';
	import './styles.css';
	import Toast from './Toast.svelte';
	import type { HeightT, Position, ToasterProps, ToastT, ToastToDismiss } from './types.js';
	import { assignOffset, getDocumentDirection } from './utils.js';

	// Visible toasts amount
	const VISIBLE_TOASTS_AMOUNT = 3;

	// Default toast width
	const TOAST_WIDTH = 356;

	// Default gap between toasts
	const GAP = 14;

	let {
		id,
		invert,
		position = 'bottom-right',
		hotkey = ['altKey', 'KeyT'],
		expand,
		closeButton,
		class: className,
		offset,
		mobileOffset,
		theme = 'light',
		richColors,
		duration,
		style,
		visibleToasts = VISIBLE_TOASTS_AMOUNT,
		toastOptions,
		dir,
		gap = GAP,
		icons,
		customAriaLabel,
		containerAriaLabel = 'Notifications',
		swipeDirections
	}: ToasterProps = $props();

	let toasts = $state.raw<ToastT[]>([]);
	let heights = $state.raw<HeightT[]>([]);
	let expanded = $state(false);
	let interacting = $state(false);
	let listRef: HTMLOListElement | undefined;
	let lastFocusedElement: HTMLElement | null = null;
	let isFocusWithin = false;

	const filteredToasts = $derived(
		id
			? toasts.filter((toast) => toast.toasterId === id)
			: toasts.filter((toast) => !toast.toasterId)
	);
	const possiblePositions = $derived(
		Array.from(
			new Set<Position>([
				position,
				...filteredToasts.flatMap((toast) => (toast.position ? [toast.position] : []))
			])
		)
	);
	const prefersDark = new MediaQuery('(prefers-color-scheme: dark)');
	const actualTheme = $derived(
		theme === 'system' ? (prefersDark.current ? 'dark' : 'light') : theme
	);
	const hotkeyLabel = $derived(hotkey.join('+').replace(/Key/g, '').replace(/Digit/g, ''));
	const listStyle = $derived(
		[
			`--front-toast-height: ${heights[0]?.height || 0}px`,
			`--width: ${TOAST_WIDTH}px`,
			`--gap: ${gap}px`,
			style,
			...Object.entries(assignOffset(offset, mobileOffset)).map(
				([key, value]) => `${key}: ${value}`
			)
		]
			.filter(Boolean)
			.join('; ')
	);

	function removeToast(toastToRemove: ToastT) {
		if (!toasts.find((toast) => toast.id === toastToRemove.id)?.delete) {
			ToastState.dismiss(toastToRemove.id);
		}

		toasts = toasts.filter((toast) => toast.id !== toastToRemove.id);
	}

	// Toasts measure themselves in effects, reading the current heights must not subscribe them to it
	function setHeights(update: (heights: HeightT[]) => HeightT[]) {
		heights = update(untrack(() => heights));
	}

	onMount(() =>
		ToastState.subscribe((toast) => {
			if ((toast as ToastToDismiss).dismiss) {
				toasts = toasts.map((t) => (t.id === toast.id ? { ...t, delete: true } : t));
				return;
			}

			const indexOfExistingToast = toasts.findIndex((t) => t.id === toast.id);

			// Update the toast if it already exists
			if (indexOfExistingToast !== -1) {
				toasts = [
					...toasts.slice(0, indexOfExistingToast),
					{ ...toasts[indexOfExistingToast], ...toast },
					...toasts.slice(indexOfExistingToast + 1)
				];
				return;
			}

			toasts = [toast as ToastT, ...toasts];
		})
	);

	$effect(() => {
		// Ensure expanded is always false when no toasts are present / only one left
		if (toasts.length <= 1) {
			expanded = false;
		}
	});

	function onkeydown(event: KeyboardEvent) {
		const isHotkeyPressed =
			hotkey.length > 0 &&
			hotkey.every(
				(key) => (event as unknown as Record<string, unknown>)[key] || event.code === key
			);

		if (isHotkeyPressed) {
			expanded = true;
			listRef?.focus();
		}

		if (
			event.code === 'Escape' &&
			(document.activeElement === listRef || listRef?.contains(document.activeElement))
		) {
			expanded = false;
		}
	}

	// Hands focus back to where it was once the list goes away, e.g. after the last toast got dismissed
	function list(node: HTMLOListElement) {
		listRef = node;

		return () => {
			if (listRef === node) listRef = undefined;
			if (lastFocusedElement) {
				lastFocusedElement.focus({ preventScroll: true });
				lastFocusedElement = null;
				isFocusWithin = false;
			}
		};
	}

	function isNotDismissible(event: Event) {
		return event.target instanceof HTMLElement && event.target.dataset.dismissible === 'false';
	}
</script>

<svelte:document {onkeydown} />

<!-- Remove item from normal navigation flow, only available via hotkey -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<section
	aria-label={customAriaLabel ?? `${containerAriaLabel} ${hotkeyLabel}`}
	tabindex={-1}
	aria-live="polite"
	aria-relevant="additions text"
	aria-atomic="false"
>
	{#each possiblePositions as toasterPosition, index (toasterPosition)}
		{@const [y, x] = toasterPosition.split('-')}
		{#if filteredToasts.length}
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions, a11y_no_noninteractive_tabindex -->
			<ol
				dir={!dir || dir === 'auto' ? getDocumentDirection() : dir}
				tabindex={-1}
				{@attach list}
				class={className}
				data-sonner-toaster
				data-sonner-theme={actualTheme}
				data-y-position={y}
				data-x-position={x}
				style={listStyle}
				onfocusout={(event) => {
					if (isFocusWithin && !event.currentTarget.contains(event.relatedTarget as Node | null)) {
						isFocusWithin = false;
						if (lastFocusedElement) {
							lastFocusedElement.focus({ preventScroll: true });
							lastFocusedElement = null;
						}
					}
				}}
				onfocusin={(event) => {
					if (isNotDismissible(event)) return;

					if (!isFocusWithin) {
						isFocusWithin = true;
						lastFocusedElement = event.relatedTarget as HTMLElement | null;
					}
				}}
				onmouseenter={() => (expanded = true)}
				onmousemove={() => (expanded = true)}
				onmouseleave={() => {
					// Avoid setting expanded to false when interacting with a toast, e.g. swiping
					if (!interacting) {
						expanded = false;
					}
				}}
				ondragend={() => (expanded = false)}
				onpointerdown={(event) => {
					if (isNotDismissible(event)) return;
					interacting = true;
				}}
				onpointerup={() => (interacting = false)}
			>
				{#each filteredToasts.filter((toast) => (!toast.position && index === 0) || toast.position === toasterPosition) as toast, toastIndex (toast.id)}
					<Toast
						{icons}
						index={toastIndex}
						{toast}
						defaultRichColors={richColors}
						duration={toastOptions?.duration ?? duration}
						class={toastOptions?.class}
						descriptionClass={toastOptions?.descriptionClass}
						{invert}
						{visibleToasts}
						closeButton={toastOptions?.closeButton ?? closeButton}
						{interacting}
						position={toasterPosition}
						style={toastOptions?.style}
						unstyled={toastOptions?.unstyled}
						classes={toastOptions?.classes}
						cancelButtonStyle={toastOptions?.cancelButtonStyle}
						actionButtonStyle={toastOptions?.actionButtonStyle}
						closeButtonAriaLabel={toastOptions?.closeButtonAriaLabel}
						{removeToast}
						toasts={filteredToasts.filter((t) => t.position == toast.position)}
						heights={heights.filter((h) => h.position == toast.position)}
						{setHeights}
						expandByDefault={expand}
						{gap}
						{expanded}
						{swipeDirections}
					/>
				{/each}
			</ol>
		{/if}
	{/each}
</section>
