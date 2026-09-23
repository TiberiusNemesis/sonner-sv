# Sonner for Svelte

An opinionated toast component for Svelte 5. It's a port of [Sonner](https://sonner.emilkowal.ski/) by [Emil Kowalski](https://emilkowal.ski), with the same behaviour, styles, animations and API, adapted to Svelte idioms. You can read more about why and how Sonner was built [here](https://emilkowal.ski/ui/building-a-toast-component).

**[Demo](https://tiberiusnemesis.github.io/sonner-sv/)**

## Installation

The package isn't on npm yet, install it from GitHub:

```bash
npm install github:TiberiusNemesis/sonner-sv
```

Requires Svelte `5.29` or newer.

## Usage

Add `<Toaster />` to your app, it will be the place where all your toasts will be rendered. After that you can use `toast()` from anywhere in your app, including plain `.ts` files.

```svelte
<!-- +layout.svelte -->
<script>
	import { Toaster } from 'sonner-sv';

	let { children } = $props();
</script>

<Toaster />
{@render children()}
```

```svelte
<script>
	import { toast } from 'sonner-sv';
</script>

<button onclick={() => toast('My first toast')}>Give me a toast</button>
```

The styles are imported by the `Toaster` component. If your setup doesn't handle CSS imports from dependencies, import `sonner-sv/styles.css` yourself.

## Differences from the React version

The API mirrors Sonner's, with these changes:

- **Snippets instead of JSX.** Anywhere Sonner accepts a `ReactNode` (title, description, icon, action and cancel labels, icons) you pass a string or a [snippet](https://svelte.dev/docs/svelte/snippet). `toast.custom()` takes a snippet that receives the toast's id.
- **`class` instead of `className`.** `className` → `class`, `classNames` → `classes`, `descriptionClassName` → `descriptionClass`.
- **Styles are strings.** `style`, `actionButtonStyle` and `cancelButtonStyle` take CSS strings, e.g. `style: 'background: red'`.
- **Promise messages that are snippets must be returned from a function** (`success: () => mySnippet`), since snippets are functions themselves.
- Titles can't be functions (use a snippet), and a promise resolving to a React element has no counterpart.
- Toasts created before the `Toaster` mounts are shown once it does, so there's no need for a `setTimeout` on page load.

## Toast

Use `toast()` to render a toast. You can call it from anywhere.

```ts
import { toast } from 'sonner-sv';

toast('Hello World!');
```

Or provide an object as the second argument with more options. They will overwrite the options passed to `<Toaster />`.

```ts
toast('My toast', {
	class: 'my-class',
	description: 'My description',
	duration: 5000,
	icon: myIcon // a snippet
});
```

### Success, info, warning, error

Render an icon in front of the message.

```ts
toast.success('My success toast');
toast.info('My info toast');
toast.warning('My warning toast');
toast.error('My error toast');
```

### Action

Renders a primary button, clicking it will close the toast and run the callback passed via `onClick`. You can prevent the toast from closing by calling `event.preventDefault()` in the `onClick` callback.

```ts
toast('My action toast', {
	action: {
		label: 'Action',
		onClick: () => console.log('Action!')
	}
});
```

You can also render a snippet as your action.

```svelte
{#snippet action()}
	<button onclick={() => console.log('Action!')}>Action</button>
{/snippet}

<button onclick={() => toast('My action toast', { action })}>Render</button>
```

### Cancel

Renders a secondary button, clicking it will close the toast and run the callback passed via `onClick`. Like `action`, it also accepts a snippet.

```ts
toast('My cancel toast', {
	cancel: {
		label: 'Cancel',
		onClick: () => console.log('Cancel!')
	}
});
```

### Promise

Starts in a loading state and will update automatically after the promise resolves or fails. You can pass a function to the success/error messages to incorporate the result/error of the promise.

```ts
toast.promise(myPromise, {
	loading: 'Loading...',
	success: (data) => `${data.name} toast has been added`,
	error: 'Error'
});
```

The success and error options can also return an object with any toast options, and `unwrap()` gives you the result of the promise:

```ts
const result = await toast
	.promise(saveProject(), {
		loading: 'Saving...',
		success: (project) => ({ message: 'Saved', description: project.name }),
		error: (error) => ({ message: 'Could not save', description: String(error) })
	})
	.unwrap();
```

### Loading

Renders a toast with a loading spinner. Useful when you want to handle various states yourself instead of using a promise toast.

```ts
toast.loading('Loading data');
```

### Custom content

Pass a snippet instead of a string to render custom content while keeping the default styling. This works for the title and the description.

```svelte
<script>
	import { toast } from 'sonner-sv';
</script>

{#snippet title()}
	View <a href="https://animations.dev" target="_blank">Animations on the Web</a>
{/snippet}

{#snippet description()}
	<button>This is a button element!</button>
{/snippet}

<button onclick={() => toast(title, { description })}>Render</button>
```

Snippets can be [exported from a module script](https://svelte.dev/docs/svelte/snippet#Exporting-snippets) if you want to use them from a `.ts` file.

### Headless

Use `toast.custom()` to render an unstyled toast with your own markup while maintaining the functionality. The snippet receives the id of the toast.

```svelte
{#snippet custom(id)}
	<div>
		This is a custom component <button onclick={() => toast.dismiss(id)}>close</button>
	</div>
{/snippet}

<button onclick={() => toast.custom(custom)}>Render</button>
```

### Dynamic position

You can change the position of a single toast by passing a `position` option. It will not affect the positioning of other toasts.

```ts
// top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
toast('Hello World', { position: 'top-center' });
```

### Updating toasts

You can update a toast by passing the id of the toast you want to update, the rest stays the same.

```ts
const toastId = toast('Sonner');

toast.success('Toast has been updated', { id: toastId });
```

### On close callbacks

`onDismiss` gets fired when either the close button gets clicked or the toast is swiped. `onAutoClose` fires when the toast disappears automatically after its timeout (`duration` option).

```ts
toast('Event has been created', {
	onDismiss: (t) => console.log(`Toast with id ${t.id} has been dismissed`),
	onAutoClose: (t) => console.log(`Toast with id ${t.id} has been closed automatically`)
});
```

### Persisting toasts

Set the `duration` to `Infinity` to keep a toast on screen until it's dismissed.

```ts
toast('This toast will stay on screen forever', { duration: Infinity });
```

### Dismissing toasts programmatically

`toast()` returns the id of the toast, pass it to `toast.dismiss(id)` to remove it. Call `toast.dismiss()` without an id to dismiss all toasts.

```ts
const toastId = toast('Event has been created');

toast.dismiss(toastId);
toast.dismiss();
```

### Targeting a specific Toaster

```ts
// Only appears in the <Toaster id="canvas" />
toast('This will show in the canvas Toaster', { toasterId: 'canvas' });
```

### Reading toasts

`toast.getToasts()` returns the toasts that are currently active, `toast.getHistory()` the most recent toasts including dismissed ones.

### API reference

| Property            | Description                                                                     |        Default |
| :------------------ | :------------------------------------------------------------------------------ | -------------: |
| `id`                | Custom id for the toast.                                                        |            `-` |
| `description`       | Toast's description, renders underneath the title.                              |            `-` |
| `closeButton`       | Adds a close button.                                                            |        `false` |
| `invert`            | Dark toast in light mode and vice versa.                                        |        `false` |
| `richColors`        | Colorful success, info, warning and error toasts.                               |        `false` |
| `duration`          | Time in milliseconds that should elapse before automatically closing the toast. |         `4000` |
| `position`          | Position of the toast.                                                          | `bottom-right` |
| `dismissible`       | If `false`, it'll prevent the user from dismissing the toast.                   |         `true` |
| `icon`              | Icon displayed in front of toast's text, aligned vertically. `null` hides it.   |            `-` |
| `action`            | Renders a primary button, clicking it will close the toast.                     |            `-` |
| `cancel`            | Renders a secondary button, clicking it will close the toast.                   |            `-` |
| `onDismiss`         | Called when either the close button is clicked, or the toast is swiped.         |            `-` |
| `onAutoClose`       | Called when the toast disappears automatically after its timeout.               |            `-` |
| `unstyled`          | Removes the default styling, which allows for easier customization.             |        `false` |
| `style`             | Inline styles for the toast.                                                    |            `-` |
| `class`             | Class for the toast.                                                            |            `-` |
| `descriptionClass`  | Class for the description.                                                      |            `-` |
| `classes`           | Classes for the parts of the toast, see [Styling](#styling).                    |            `-` |
| `actionButtonStyle` | Styles for the action button.                                                   |            `-` |
| `cancelButtonStyle` | Styles for the cancel button.                                                   |            `-` |
| `toasterId`         | Id of the `Toaster` the toast is rendered in.                                   |            `-` |
| `testId`            | Sets `data-testid` on the toast.                                                |            `-` |

## Toaster

This component renders all the toasts, you can place it anywhere in your app.

### Multiple Toasters

You can render multiple Toaster components with different ids and target toasts to each one:

```svelte
<Toaster id="global" position="top-right" />
<Toaster id="canvas" position="bottom-left" />

<button onclick={() => toast('Global toast', { toasterId: 'global' })}>Global</button>
<button onclick={() => toast('Canvas toast', { toasterId: 'canvas' })}>Canvas</button>
```

A `Toaster` without an id renders the toasts that don't specify a `toasterId`.

### Expand

When you hover on one of the toasts, they will expand. You can make that the default behavior by setting the `expand` prop, and customize it even further with the `visibleToasts` prop.

```svelte
<!-- 9 toasts will be visible instead of the default, which is 3. -->
<Toaster expand visibleToasts={9} />
```

### Position

```svelte
<!-- top-left, top-center, top-right, bottom-left, bottom-center, bottom-right -->
<Toaster position="top-center" />
```

### Direction

```svelte
<!-- rtl, ltr, auto -->
<Toaster dir="rtl" />
```

### Custom ARIA labels

```svelte
<!-- Finnish -->
<Toaster containerAriaLabel="Ilmoitukset" toastOptions={{ closeButtonAriaLabel: 'Sulje' }} />
```

### API reference

| Property             | Description                                                                     |              Default |
| :------------------- | :------------------------------------------------------------------------------ | -------------------: |
| `id`                 | Id to target this toaster with `toasterId`.                                     |                  `-` |
| `theme`              | Toast's theme, either `light`, `dark`, or `system`.                             |              `light` |
| `richColors`         | Colorful success, info, warning and error toasts.                               |              `false` |
| `expand`             | Toasts will be expanded by default.                                             |              `false` |
| `visibleToasts`      | Amount of visible toasts.                                                       |                  `3` |
| `position`           | Place where the toasts will be rendered.                                        |       `bottom-right` |
| `closeButton`        | Adds a close button to all toasts.                                              |              `false` |
| `offset`             | Offset from the edges of the screen, a value or `{ top, right, bottom, left }`. |               `24px` |
| `mobileOffset`       | Offset from the edges of the screen on screens narrower than 600px.             |               `16px` |
| `dir`                | Directionality of the toasts' text.                                             |     document's `dir` |
| `hotkey`             | Keyboard shortcut that will move focus to the toaster area.                     | `['altKey', 'KeyT']` |
| `invert`             | Dark toasts in light mode and vice versa.                                       |              `false` |
| `duration`           | Default duration of the toasts, in milliseconds.                                |               `4000` |
| `gap`                | Gap between toasts when expanded, in pixels.                                    |                 `14` |
| `swipeDirections`    | Directions the toasts can be swiped away in.                                    |    based on position |
| `toastOptions`       | Default options for all toasts, see below.                                      |                  `-` |
| `icons`              | Changes the default icons.                                                      |                  `-` |
| `class`              | Class for the toaster.                                                          |                  `-` |
| `style`              | Inline styles for the toaster.                                                  |                  `-` |
| `containerAriaLabel` | ARIA label of the notifications region, the hotkey is appended to it.           |      `Notifications` |
| `customAriaLabel`    | Replaces the whole ARIA label of the notifications region.                      |                  `-` |

`toastOptions` accepts `class`, `descriptionClass`, `classes`, `style`, `actionButtonStyle`, `cancelButtonStyle`, `closeButton`, `closeButtonAriaLabel`, `duration` and `unstyled`.

## Styling

Styling can be done globally via `toastOptions`, this way every toast will have the same styling.

```svelte
<Toaster toastOptions={{ style: 'background: red', class: 'my-toast' }} />
```

You can also use the same options when calling `toast` to style a specific toast.

```ts
toast('Hello World', { style: 'background: red', class: 'my-toast' });
```

### Tailwind CSS

The preferred way to style the toasts with Tailwind is by using the `unstyled` option. That will give you an unstyled toast which you can then style with Tailwind.

```svelte
<Toaster
	toastOptions={{
		unstyled: true,
		classes: {
			toast: 'bg-blue-400',
			title: 'text-red-400',
			description: 'text-red-400',
			actionButton: 'bg-zinc-400',
			cancelButton: 'bg-orange-400',
			closeButton: 'bg-lime-400'
		}
	}}
/>
```

Styling per toast type is also possible, with `classes.default` applying to toasts created with plain `toast()`.

```svelte
<Toaster
	toastOptions={{
		unstyled: true,
		classes: {
			default: 'bg-white',
			error: 'bg-red-400',
			success: 'text-green-400',
			warning: 'text-yellow-400',
			info: 'bg-blue-400'
		}
	}}
/>
```

### Changing icons

Pass snippets to the `icons` prop to replace the default icons, or `null` to hide an icon.

```svelte
{#snippet success()}
	<MySuccessIcon />
{/snippet}

<Toaster icons={{ success, info: null }} />
```

The available keys are `success`, `info`, `warning`, `error`, `loading` and `close`. Set the `icon` option to change the icon of a single toast.

## Building your own toaster

`useSonner()` gives you a reactive list of the active toasts. Call it while a component initializes.

```svelte
<script>
	import { useSonner } from 'sonner-sv';

	const sonner = useSonner();
</script>

<p>{sonner.toasts.length} active toasts</p>
```

## Development

```bash
pnpm install
pnpm dev      # demo site on localhost:5173, test page on /test
pnpm test     # Playwright suite (Chromium and WebKit)
pnpm check    # svelte-check
pnpm build    # demo site into build/, package into dist/
```

## License

MIT. Sonner is © Emil Kowalski, see [LICENSE](./LICENSE).
