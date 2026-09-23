<script lang="ts">
	import { page } from '$app/state';
	import { toast, Toaster, type Position, type SwipeDirection } from '$lib/index.js';

	const params = page.url.searchParams;
	const promise = () => new Promise((resolve) => setTimeout(resolve, 2000));

	let showAutoClose = $state(false);
	let showDismiss = $state(false);
	let theme = $state<'light' | 'dark'>(params.get('theme') === 'dark' ? 'dark' : 'light');
	let isFinally = $state(false);
	let showAriaLabels = $state(false);
	let historySize = $state<number | null>(null);

	// Created before the <Toaster /> subscribes, the toaster has to pick it up when it mounts.
	if (params.has('toastOnMount')) {
		toast('Toast rendered on mount', { id: 'toast-on-mount' });
	}
</script>

{#snippet customToast(id: number | string)}
	<div>
		<h1>jsx</h1>
		<button data-testid="dismiss-button" onclick={() => toast.dismiss(id)}>Dismiss</button>
	</div>
{/snippet}

{#snippet customDone()}
	<div>Custom done</div>
{/snippet}

{#snippet richDescription()}
	<div>This is my custom Snippet description</div>
{/snippet}

{#snippet wideDescription()}
	<div data-testid="wide-description" style="width: 100%; height: 8px"></div>
{/snippet}

{#snippet successIcon()}
	<span data-testid="custom-success-icon">✓</span>
{/snippet}

{#snippet closeIcon()}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="12"
		height="12"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="3"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<line x1="18" y1="6" x2="6" y2="18"></line>
		<line x1="6" y1="6" x2="18" y2="18"></line>
	</svg>
{/snippet}

<button data-testid="theme-button" class="button" onclick={() => (theme = 'dark')}>
	Change theme
</button>
<button data-testid="default-button" class="button" onclick={() => toast('My Toast')}>
	Render Toast
</button>
<button data-testid="default-button-top" class="button" onclick={() => toast('My Toast')}>
	Render Toast Top
</button>
<button data-testid="success" class="button" onclick={() => toast.success('My Success Toast')}>
	Render Success Toast
</button>
<button data-testid="error" class="button" onclick={() => toast.error('My Error Toast')}>
	Render Error Toast
</button>
<button
	data-testid="action"
	class="button"
	onclick={() =>
		toast('My Message', {
			action: {
				label: 'Action',
				onClick: () => console.log('Action')
			}
		})}
>
	Render Action Toast
</button>
<button
	data-testid="action-prevent"
	class="button"
	onclick={() =>
		toast('My Message', {
			action: {
				label: 'Action',
				onClick: (event) => {
					event.preventDefault();
					console.log('Action');
				}
			}
		})}
>
	Render Action Toast
</button>
<button
	data-testid="promise"
	data-finally={isFinally ? '1' : '0'}
	class="button"
	onclick={() =>
		toast.promise(promise, {
			loading: 'Loading...',
			success: 'Loaded',
			error: 'Error',
			finally: () => {
				isFinally = true;
			}
		})}
>
	Render Promise Toast
</button>
<button data-testid="custom" class="button" onclick={() => toast.custom(customToast)}>
	Render Custom Toast
</button>
<button
	data-testid="custom-cancel-button-toast"
	class="button"
	onclick={() =>
		toast('My Custom Cancel Button', {
			cancel: {
				label: 'Cancel',
				onClick: () => console.log('Cancel')
			}
		})}
>
	Render Custom Cancel Button
</button>
<button
	data-testid="custom-with-empty-id"
	class="button"
	onclick={() => toast.custom(customToast, { id: undefined })}
>
	Render Custom Toast with empty id
</button>
<button
	data-testid="infinity-toast"
	class="button"
	onclick={() => toast('My Toast', { duration: Infinity })}
>
	Render Infinity Toast
</button>
<button
	data-testid="auto-close-toast-callback"
	class="button"
	onclick={() =>
		toast('My Toast', {
			onAutoClose: () => {
				showAutoClose = true;
			}
		})}
>
	Render Toast With onAutoClose callback
</button>
<button
	data-testid="dismiss-toast-callback"
	class="button"
	onclick={() =>
		toast('My Toast', {
			onDismiss: () => {
				showDismiss = true;
			}
		})}
>
	Dismiss toast callback
</button>
<button
	data-testid="non-dismissible-toast"
	class="button"
	onclick={() => toast('My Toast', { dismissible: false })}
>
	Non-dismissible Toast
</button>
<button
	data-testid="update-toast"
	class="button"
	onclick={() => {
		const toastId = toast('My Unupdated Toast', { duration: 10000 });
		toast('My Updated Toast', { id: toastId, duration: 10000 });
	}}
>
	Updated Toast
</button>
<button
	data-testid="update-toast-duration"
	class="button"
	onclick={() => {
		const toastId = toast('My Unupdated Toast, Updated After 3 Seconds', { duration: 10000 });
		setTimeout(() => {
			toast('My Updated Toast, Close After 1 Second', { id: toastId, duration: 1000 });
		}, 3000);
	}}
>
	Updated Toast Duration
</button>
<button
	data-testid="string-description"
	class="button"
	onclick={() => toast('Custom Description', { description: 'string description' })}
>
	String Description
</button>
<button
	data-testid="snippet-description"
	class="button"
	onclick={() => toast('Custom Description', { description: richDescription })}
>
	Snippet Description
</button>
<button
	data-testid="close-button"
	class="button"
	onclick={() => toast('Toast with close button', { closeButton: true })}
>
	Render close button
</button>
<button
	data-testid="extended-promise"
	class="button"
	onclick={() =>
		toast.promise(
			new Promise<{ name: string }>((resolve) => {
				setTimeout(() => resolve({ name: 'Sonner' }), 2000);
			}),
			{
				loading: 'Loading...',
				success: (data) => ({
					message: `${data.name} toast has been added`,
					description: 'Custom description for the Success state'
				}),
				error: {
					message: 'An error occurred',
					description: undefined,
					action: {
						label: 'Retry',
						onClick: () => console.log('retrying')
					}
				},
				description: 'Global description'
			}
		)}
>
	Extended Promise Toast
</button>
<button
	data-testid="extended-promise-error"
	class="button"
	onclick={() =>
		toast.promise(
			new Promise<{ name: string }>((_, reject) => {
				setTimeout(() => reject(new Error('Simulated error')), 2000);
			}),
			{
				loading: 'Loading...',
				success: (data) => ({
					message: `${data.name} toast has been added`,
					description: 'Custom description for the Success state'
				}),
				error: {
					message: 'An error occurred',
					description: undefined,
					action: {
						label: 'Retry',
						onClick: (event) => {
							event.preventDefault();
							console.log('retrying');
						}
					}
				},
				description: 'Global description'
			}
		)}
>
	Extended Promise Error Toast
</button>
<button
	data-testid="error-promise"
	class="button"
	onclick={() => {
		const whatWillHappen = async (): Promise<{ ok?: boolean; error?: string }> => {
			throw new Error('Not implemented');
		};

		toast.promise(whatWillHappen, {
			loading: 'Saving project...',
			success: (result) => (result?.ok ? 'Project saved' : `${result?.error}`),
			error: (e) => `Error Raise: ${e}`
		});
	}}
>
	Error Promise Toast
</button>
<button
	class="button"
	onclick={() => {
		showAriaLabels = true;
		toast('Toast with custom ARIA labels', {
			closeButton: true,
			onAutoClose: () => {
				showAriaLabels = false;
			}
		});
	}}
>
	With custom ARIA labels
</button>
<button
	data-testid="toast-secondary"
	class="button"
	onclick={() => toast('Secondary Toaster Toast', { toasterId: 'secondary' })}
>
	Render Toast in Secondary Toaster
</button>
<button data-testid="toast-global" class="button" onclick={() => toast('Global Toaster Toast')}>
	Render Toast in Global Toaster
</button>
<button
	data-testid="testid-toast-button"
	class="button"
	onclick={() => toast('Toast with test ID', { testId: 'my-test-toast' })}
>
	Toast with testId
</button>
<button
	data-testid="testid-promise-toast-button"
	class="button"
	onclick={() =>
		toast.promise(promise, {
			loading: 'Loading...',
			success: 'Loaded',
			error: 'Error',
			testId: 'promise-test-toast'
		})}
>
	Promise Toast with testId
</button>
<button
	data-testid="promise-custom-icon"
	class="button"
	onclick={() =>
		toast.promise(promise, {
			loading: 'Loading...',
			success: () => ({ message: 'Loaded', icon: successIcon }),
			error: 'Error'
		})}
>
	Promise Toast with custom success icon
</button>
<button
	data-testid="reused-id-with-action"
	class="button"
	onclick={() =>
		toast.error('Toast with action', {
			id: 'reused-id',
			duration: 1000,
			action: {
				label: 'Action',
				onClick: () => console.log('Action')
			}
		})}
>
	Toast with action and a fixed id
</button>
<button
	data-testid="reused-id-without-action"
	class="button"
	onclick={() => toast.success('Toast without action', { id: 'reused-id', duration: 10000 })}
>
	Toast without action and the same fixed id
</button>
<button
	data-testid="history-flood"
	class="button"
	onclick={() => {
		for (let i = 0; i < 120; i++) {
			toast.dismiss(toast(`Flood ${i}`, { duration: 1 }));
		}
		historySize = toast.getHistory().length;
	}}
>
	Create and dismiss a lot of toasts
</button>
{#if historySize !== null}
	<div data-testid="history-size">{historySize}</div>
{/if}
<button
	data-testid="loading-toast-fixed-id"
	class="button"
	onclick={() => toast.loading('Loading', { id: 'fixed-id' })}
>
	Loading toast with a fixed id
</button>
<button
	data-testid="default-toast-fixed-id"
	class="button"
	onclick={() => toast('Done', { id: 'fixed-id', duration: 10000 })}
>
	Default toast with the same fixed id
</button>
<button
	data-testid="custom-toast-fixed-id"
	class="button"
	onclick={() => toast.custom(customDone, { id: 'fixed-id', duration: 10000 })}
>
	Custom toast with the same fixed id
</button>
<button
	data-testid="dismiss-and-recreate"
	class="button"
	onclick={() => {
		toast.warning('Remounted toast', { id: 'remounted', duration: 10000 });
		toast.dismiss('remounted');
		toast.warning('Remounted toast', { id: 'remounted', duration: 10000 });
	}}
>
	Dismiss and recreate a toast synchronously
</button>
<button
	data-testid="snippet-description-wide"
	class="button"
	onclick={() => toast('Title', { duration: 10000, description: wideDescription })}
>
	Snippet description that fills the width
</button>
{#if showAutoClose}
	<div data-testid="auto-close-el"></div>
{/if}
{#if showDismiss}
	<div data-testid="dismiss-el"></div>
{/if}
<Toaster
	offset={32}
	position={(params.get('position') as Position | null) ?? 'bottom-right'}
	swipeDirections={params.get('swipeDirections')?.split(',') as SwipeDirection[] | undefined}
	toastOptions={{
		actionButtonStyle: 'background-color: rgb(219, 239, 255)',
		cancelButtonStyle: 'background-color: rgb(254, 226, 226)',
		closeButtonAriaLabel: showAriaLabels ? 'Yeet the notice' : undefined,
		classes: {
			default: 'default-toast-classname',
			success: 'success-toast-classname'
		}
	}}
	{theme}
	dir={(params.get('dir') as 'ltr' | 'rtl' | null) ?? 'auto'}
	containerAriaLabel={showAriaLabels ? 'Notices' : undefined}
	icons={{ close: params.has('customCloseIcon') ? closeIcon : undefined }}
/>
<Toaster id="secondary" position="top-left" toastOptions={{ class: 'secondary-toaster' }} />
