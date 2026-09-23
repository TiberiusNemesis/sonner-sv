<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { DocumentHidden } from './document-hidden.svelte.js';
	import Icon from './Icon.svelte';
	import Loader from './Loader.svelte';
	import RenderableContent from './Renderable.svelte';
	import { isAction, type ToastClasses, type ToastIcons, type ToastProps } from './types.js';
	import { cn, getDefaultSwipeDirections } from './utils.js';

	// Default lifetime of a toast (in ms)
	const TOAST_LIFETIME = 4000;

	// Threshold to dismiss a toast
	const SWIPE_THRESHOLD = 45;

	// Equal to exit animation duration
	const TIME_BEFORE_UNMOUNT = 200;

	let {
		invert: toasterInvert,
		toast,
		unstyled,
		interacting,
		setHeights,
		visibleToasts,
		heights,
		index,
		toasts,
		expanded,
		removeToast,
		defaultRichColors,
		closeButton: closeButtonFromToaster,
		style,
		cancelButtonStyle,
		actionButtonStyle,
		class: className = '',
		descriptionClass = '',
		duration: durationFromToaster,
		position,
		gap,
		expandByDefault,
		classes,
		icons,
		closeButtonAriaLabel = 'Close toast',
		swipeDirections: swipeDirectionsFromToaster
	}: ToastProps = $props();

	let swipeDirection = $state<'x' | 'y' | null>(null);
	let swipeOutDirection = $state<'left' | 'right' | 'up' | 'down' | null>(null);
	let mounted = $state(false);
	let removed = $state(false);
	let swiping = $state(false);
	let swipeOut = $state(false);
	let isSwiped = $state(false);
	let offsetBeforeRemove = $state(0);
	let initialHeight = $state(0);
	let swipeAmount = $state<{ x: number; y: number } | null>(null);
	let toastRef: HTMLLIElement;
	let remainingTime = 0;
	let dragStartTime: number | null = null;
	let closeTimerStartTime = 0;
	let lastCloseTimerStartTime = 0;
	let pointerStart: { x: number; y: number } | null = null;

	const isFront = $derived(index === 0);
	const isVisible = $derived(index + 1 <= visibleToasts);
	const toastType = $derived(toast.type);
	// Toasts created with `toast()` have no type, `classes.default` is the key for those.
	const toastTypeKey = $derived((toastType ?? 'default') as keyof ToastClasses);
	const dismissible = $derived(toast.dismissible !== false);
	// Height index is used to calculate the offset as it gets updated before the toast array, which means we can calculate the new layout faster.
	const heightIndex = $derived(heights.findIndex((height) => height.toastId === toast.id) || 0);
	const closeButton = $derived(toast.closeButton ?? closeButtonFromToaster);
	const duration = $derived(toast.duration || durationFromToaster || TOAST_LIFETIME);
	const [y, x] = $derived(position.split('-'));
	const toastsHeightBefore = $derived(
		heights.reduce((prev, curr, reducerIndex) => {
			// Calculate offset up until current toast
			if (reducerIndex >= heightIndex) {
				return prev;
			}

			return prev + curr.height;
		}, 0)
	);
	const documentHidden = new DocumentHidden();
	const swipeDirections = $derived(
		swipeDirectionsFromToaster ?? getDefaultSwipeDirections(position)
	);
	const invert = $derived(toast.invert || toasterInvert);
	const disabled = $derived(toastType === 'loading');
	const offset = $derived(heightIndex * gap + toastsHeightBefore);
	const typeIcon = $derived(toastType ? icons?.[toastType as keyof ToastIcons] : undefined);

	// Read separately so the height is only measured again when the content changes
	const title = $derived(toast.title);
	const description = $derived(toast.description);
	const jsx = $derived(toast.jsx);
	const action = $derived(toast.action);
	const cancel = $derived(toast.cancel);
	const deleted = $derived(toast.delete);

	const cssText = $derived(
		[
			`--index: ${index}`,
			`--toasts-before: ${index}`,
			`--z-index: ${toasts.length - index}`,
			`--offset: ${removed ? offsetBeforeRemove : offset}px`,
			`--initial-height: ${expandByDefault ? 'auto' : `${initialHeight}px`}`,
			swipeAmount && `--swipe-amount-x: ${swipeAmount.x}px`,
			swipeAmount && `--swipe-amount-y: ${swipeAmount.y}px`,
			style,
			toast.style
		]
			.filter(Boolean)
			.join('; ')
	);

	$effect(() => {
		remainingTime = duration;
	});

	onMount(() => {
		// Measuring forces a style recalculation, so the enter transition starts from the unmounted state
		const height = toastRef.getBoundingClientRect().height;
		initialHeight = height;
		setHeights((h) => [{ toastId: toast.id, height, position: toast.position }, ...h]);
		mounted = true;

		return () => setHeights((h) => h.filter((height) => height.toastId !== toast.id));
	});

	$effect(() => {
		// Keep height up to date with the content in case it updates
		void [title, description, jsx, action, cancel];
		if (!mounted) return;

		untrack(() => {
			const originalHeight = toastRef.style.height;
			toastRef.style.height = 'auto';
			const newHeight = toastRef.getBoundingClientRect().height;
			toastRef.style.height = originalHeight;

			initialHeight = newHeight;

			setHeights((heights) => {
				const alreadyExists = heights.find((height) => height.toastId === toast.id);
				if (!alreadyExists) {
					return [{ toastId: toast.id, height: newHeight, position: toast.position }, ...heights];
				} else {
					return heights.map((height) =>
						height.toastId === toast.id ? { ...height, height: newHeight } : height
					);
				}
			});
		});
	});

	function deleteToast() {
		// Save the offset for the exit swipe animation
		removed = true;
		offsetBeforeRemove = offset;
		setHeights((h) => h.filter((height) => height.toastId !== toast.id));

		const toastToRemove = toast;
		setTimeout(() => {
			removeToast(toastToRemove);
		}, TIME_BEFORE_UNMOUNT);
	}

	$effect(() => {
		const current = toast;
		if (
			(current.promise && current.type === 'loading') ||
			current.duration === Infinity ||
			current.type === 'loading'
		)
			return;

		let timeoutId: ReturnType<typeof setTimeout>;

		if (expanded || interacting || documentHidden.current) {
			// Pause the timer on each hover
			if (lastCloseTimerStartTime < closeTimerStartTime) {
				// Get the elapsed time since the timer started
				const elapsedTime = Date.now() - closeTimerStartTime;

				remainingTime = remainingTime - elapsedTime;
			}

			lastCloseTimerStartTime = Date.now();
		} else {
			// setTimeout(, Infinity) behaves as if the delay is 0.
			// As a result, the toast would be closed immediately, giving the appearance that it was never rendered.
			if (remainingTime === Infinity) return;

			closeTimerStartTime = Date.now();

			timeoutId = setTimeout(() => {
				current.onAutoClose?.(current);
				deleteToast();
			}, remainingTime);
		}

		return () => clearTimeout(timeoutId);
	});

	$effect(() => {
		if (!deleted) return;

		untrack(() => {
			deleteToast();
			toast.onDismiss?.(toast);
		});
	});

	function onpointerdown(event: PointerEvent) {
		if (event.button === 2) return; // Return early on right click
		if (disabled || !dismissible) return;
		dragStartTime = Date.now();
		offsetBeforeRemove = offset;
		// Ensure we maintain correct pointer capture even when going outside of the toast (e.g. when swiping)
		(event.target as HTMLElement).setPointerCapture(event.pointerId);
		if ((event.target as HTMLElement).tagName === 'BUTTON') return;
		swiping = true;
		pointerStart = { x: event.clientX, y: event.clientY };
	}

	function onpointerup() {
		if (swipeOut || !dismissible) return;

		pointerStart = null;
		const swipeAmountX = swipeAmount?.x ?? 0;
		const swipeAmountY = swipeAmount?.y ?? 0;
		const timeTaken = Date.now() - (dragStartTime ?? NaN);

		const amount = swipeDirection === 'x' ? swipeAmountX : swipeAmountY;
		const velocity = Math.abs(amount) / timeTaken;

		// Movement towards a direction that isn't allowed is dampened, not blocked, so a fast
		// flick can still pass the velocity check. Only dismiss if the direction is allowed.
		const isAllowedDirection =
			swipeDirection === 'x'
				? swipeDirections.includes(swipeAmountX > 0 ? 'right' : 'left')
				: swipeDirections.includes(swipeAmountY > 0 ? 'bottom' : 'top');

		if (isAllowedDirection && (Math.abs(amount) >= SWIPE_THRESHOLD || velocity > 0.11)) {
			offsetBeforeRemove = offset;

			toast.onDismiss?.(toast);

			if (swipeDirection === 'x') {
				swipeOutDirection = swipeAmountX > 0 ? 'right' : 'left';
			} else {
				swipeOutDirection = swipeAmountY > 0 ? 'down' : 'up';
			}

			deleteToast();
			swipeOut = true;

			return;
		} else {
			swipeAmount = { x: 0, y: 0 };
		}
		isSwiped = false;
		swiping = false;
		swipeDirection = null;
	}

	function onpointermove(event: PointerEvent) {
		if (!pointerStart || !dismissible) return;

		const isHighlighted = (window.getSelection()?.toString().length ?? 0) > 0;
		if (isHighlighted) return;

		const yDelta = event.clientY - pointerStart.y;
		const xDelta = event.clientX - pointerStart.x;

		// Determine swipe direction if not already locked
		if (!swipeDirection && (Math.abs(xDelta) > 1 || Math.abs(yDelta) > 1)) {
			swipeDirection = Math.abs(xDelta) > Math.abs(yDelta) ? 'x' : 'y';
		}

		const amount = { x: 0, y: 0 };

		const getDampening = (delta: number) => {
			const factor = Math.abs(delta) / 20;

			return 1 / (1.5 + factor);
		};

		// Only apply swipe in the locked direction
		if (swipeDirection === 'y') {
			// Handle vertical swipes
			if (swipeDirections.includes('top') || swipeDirections.includes('bottom')) {
				if (
					(swipeDirections.includes('top') && yDelta < 0) ||
					(swipeDirections.includes('bottom') && yDelta > 0)
				) {
					amount.y = yDelta;
				} else {
					// Smoothly transition to dampened movement
					const dampenedDelta = yDelta * getDampening(yDelta);
					// Ensure we don't jump when transitioning to dampened movement
					amount.y = Math.abs(dampenedDelta) < Math.abs(yDelta) ? dampenedDelta : yDelta;
				}
			}
		} else if (swipeDirection === 'x') {
			// Handle horizontal swipes
			if (swipeDirections.includes('left') || swipeDirections.includes('right')) {
				if (
					(swipeDirections.includes('left') && xDelta < 0) ||
					(swipeDirections.includes('right') && xDelta > 0)
				) {
					amount.x = xDelta;
				} else {
					// Smoothly transition to dampened movement
					const dampenedDelta = xDelta * getDampening(xDelta);
					// Ensure we don't jump when transitioning to dampened movement
					amount.x = Math.abs(dampenedDelta) < Math.abs(xDelta) ? dampenedDelta : xDelta;
				}
			}
		}

		if (Math.abs(amount.x) > 0 || Math.abs(amount.y) > 0) {
			isSwiped = true;
		}

		swipeAmount = amount;
	}

	function ondragend() {
		swiping = false;
		swipeDirection = null;
		pointerStart = null;
	}
</script>

{#snippet loadingIcon()}
	{#if icons?.loading}
		<div
			class={cn(classes?.loader, toast.classes?.loader, 'sonner-loader')}
			data-visible={toastType === 'loading'}
		>
			<RenderableContent content={icons.loading} />
		</div>
	{:else}
		<Loader class={cn(classes?.loader, toast.classes?.loader)} visible={toastType === 'loading'} />
	{/if}
{/snippet}

<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
<li
	tabindex={0}
	bind:this={toastRef}
	class={cn(
		className,
		toast.class,
		classes?.toast,
		toast.classes?.toast,
		classes?.[toastTypeKey],
		toast.classes?.[toastTypeKey]
	)}
	data-sonner-toast=""
	data-rich-colors={toast.richColors ?? defaultRichColors}
	data-styled={!(toast.jsx || toast.unstyled || unstyled)}
	data-mounted={mounted}
	data-promise={Boolean(toast.promise)}
	data-swiped={isSwiped}
	data-removed={removed}
	data-visible={isVisible}
	data-y-position={y}
	data-x-position={x}
	data-index={index}
	data-front={isFront}
	data-swiping={swiping}
	data-dismissible={dismissible}
	data-type={toastType}
	data-invert={invert}
	data-swipe-out={swipeOut}
	data-swipe-direction={swipeOutDirection}
	data-expanded={Boolean(expanded || (expandByDefault && mounted))}
	data-testid={toast.testId}
	style={cssText}
	{ondragend}
	{onpointerdown}
	{onpointerup}
	{onpointermove}
>
	{#if closeButton && !toast.jsx && toastType !== 'loading'}
		<button
			aria-label={closeButtonAriaLabel}
			data-disabled={disabled}
			data-close-button
			onclick={disabled || !dismissible
				? undefined
				: () => {
						deleteToast();
						toast.onDismiss?.(toast);
					}}
			class={cn(classes?.closeButton, toast.classes?.closeButton)}
		>
			{#if icons?.close != null}
				<RenderableContent content={icons.close} />
			{:else}
				<Icon type="close" />
			{/if}
		</button>
	{/if}
	{#if (toastType || toast.icon || toast.promise) && toast.icon !== null && (typeIcon !== null || toast.icon)}
		<div data-icon="" class={cn(classes?.icon, toast.classes?.icon)}>
			<!-- Promise toasts keep the loader mounted after they settle so it can animate out -->
			{#if toastType === 'loading'}
				{#if toast.icon}
					<RenderableContent content={toast.icon} />
				{:else}
					{@render loadingIcon()}
				{/if}
			{:else if toast.promise}
				{@render loadingIcon()}
			{/if}
			{#if toastType !== 'loading'}
				{#if toast.icon}
					<RenderableContent content={toast.icon} />
				{:else if typeIcon}
					<RenderableContent content={typeIcon} />
				{:else}
					<Icon type={toastType} />
				{/if}
			{/if}
		</div>
	{/if}

	<div data-content="" class={cn(classes?.content, toast.classes?.content)}>
		<div data-title="" class={cn(classes?.title, toast.classes?.title)}>
			{#if toast.jsx}
				{@render toast.jsx(toast.id)}
			{:else}
				<RenderableContent content={toast.title} />
			{/if}
		</div>
		{#if toast.description}
			<div
				data-description=""
				class={cn(
					descriptionClass,
					toast.descriptionClass,
					classes?.description,
					toast.classes?.description
				)}
			>
				<RenderableContent content={toast.description} />
			</div>
		{/if}
	</div>
	{#if toast.cancel && !isAction(toast.cancel)}
		{@render toast.cancel()}
	{:else if toast.cancel && isAction(toast.cancel)}
		<button
			data-button
			data-cancel
			style={toast.cancelButtonStyle || cancelButtonStyle}
			onclick={(event) => {
				if (!toast.cancel || !isAction(toast.cancel)) return;
				if (!dismissible) return;
				toast.cancel.onClick?.(event);
				deleteToast();
			}}
			class={cn(classes?.cancelButton, toast.classes?.cancelButton)}
		>
			<RenderableContent content={toast.cancel.label} />
		</button>
	{/if}
	{#if toast.action && !isAction(toast.action)}
		{@render toast.action()}
	{:else if toast.action && isAction(toast.action)}
		<button
			data-button
			data-action
			style={toast.actionButtonStyle || actionButtonStyle}
			onclick={(event) => {
				if (!toast.action || !isAction(toast.action)) return;
				toast.action.onClick?.(event);
				if (event.defaultPrevented) return;
				deleteToast();
			}}
			class={cn(classes?.actionButton, toast.classes?.actionButton)}
		>
			<RenderableContent content={toast.action.label} />
		</button>
	{/if}
</li>
