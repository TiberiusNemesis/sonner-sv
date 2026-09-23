import { on } from 'svelte/events';
// Tracks `document.hidden`, so timers can pause while the tab is in the background.
// Has to be created while a component initializes.
export class DocumentHidden {
    current = $state(typeof document !== 'undefined' && document.hidden);
    constructor() {
        $effect(() => on(document, 'visibilitychange', () => {
            this.current = document.hidden;
        }));
    }
}
