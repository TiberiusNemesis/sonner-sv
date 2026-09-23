import { onMount } from 'svelte';
import { ToastState } from './state.js';
import type { ToastT, ToastToDismiss } from './types.js';

// Reactive list of the active toasts, for building your own toaster. Call it while a component initializes.
export function useSonner() {
	let toasts = $state.raw<ToastT[]>([]);

	onMount(() =>
		ToastState.subscribe((toast) => {
			if ((toast as ToastToDismiss).dismiss) {
				toasts = toasts.filter((t) => t.id !== toast.id);
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

	return {
		get toasts() {
			return toasts;
		}
	};
}
