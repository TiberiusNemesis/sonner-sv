// Copies text to the clipboard and reports `copied` for two seconds afterwards.
export class Copier {
	#pending = $state(0);

	get copied() {
		return this.#pending > 0;
	}

	copy = (text: string) => {
		navigator.clipboard?.writeText(text);
		this.#pending++;
		setTimeout(() => this.#pending--, 2000);
	};
}
