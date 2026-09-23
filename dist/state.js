let toastsCounter = 1;
// Amount of toasts kept in `toast.getHistory()`. Dismissed toasts above this limit are
// dropped so long-running apps don't hold on to them forever.
const MAX_HISTORY_SIZE = 100;
// A toast keeps the id it was given, otherwise it gets the next one from the counter.
// `custom` needs the same id `create` would pick, as it hands it to the snippet.
const getToastId = (data) => {
    return typeof data?.id === 'number' || (data?.id?.length ?? 0) > 0 ? data.id : toastsCounter++;
};
class Observer {
    subscribers;
    toasts;
    dismissedToasts;
    // Dismissals that have been requested but not handed to the subscribers yet
    pendingDismissals;
    constructor() {
        this.subscribers = [];
        this.toasts = [];
        this.dismissedToasts = new Set();
        this.pendingDismissals = new Map();
    }
    // Arrow functions keep `this` bound when the methods are handed out on `toast`
    subscribe = (subscriber) => {
        this.subscribers.push(subscriber);
        // A toast can be created before the `Toaster` had a chance to subscribe, e.g. when it's
        // called while a component rendered above the `Toaster` initializes. Replay whatever is
        // still active so it doesn't get lost.
        this.getActiveToasts().forEach((toast) => subscriber(toast));
        return () => {
            const index = this.subscribers.indexOf(subscriber);
            this.subscribers.splice(index, 1);
        };
    };
    publish = (data) => {
        this.subscribers.forEach((subscriber) => subscriber(data));
    };
    addToast = (data) => {
        this.publish(data);
        this.toasts = [...this.toasts, data];
        this.trimHistory();
    };
    // Keeps the history bounded without ever dropping a toast that's still on screen.
    trimHistory = () => {
        let toRemove = this.toasts.length - MAX_HISTORY_SIZE;
        if (toRemove <= 0)
            return;
        this.toasts = this.toasts.filter((toast) => {
            if (toRemove > 0 && this.dismissedToasts.has(toast.id)) {
                this.dismissedToasts.delete(toast.id);
                toRemove--;
                return false;
            }
            return true;
        });
    };
    create = (data) => {
        const { message, ...rest } = data;
        const id = getToastId(data);
        // A dismissal that hasn't reached the subscribers yet gets cancelled: the toast is still
        // on screen, so this is an update of it rather than a new toast. Without this, creating a
        // toast right after dismissing the same id would have the pending dismissal remove the
        // toast that just got created.
        const pendingDismissal = this.pendingDismissals.get(id);
        if (pendingDismissal !== undefined) {
            cancelAnimationFrame(pendingDismissal);
            this.pendingDismissals.delete(id);
            this.dismissedToasts.delete(id);
        }
        const wasDismissed = this.dismissedToasts.has(id);
        const dismissible = data.dismissible === undefined ? true : data.dismissible;
        if (wasDismissed) {
            this.dismissedToasts.delete(id);
            // The previous toast with this id is gone, so this is a brand new toast. Drop the old
            // one instead of merging into it, otherwise its props (e.g. `action`) leak into the new one.
            this.toasts = this.toasts.filter((toast) => toast.id !== id);
        }
        const alreadyExists = wasDismissed
            ? undefined
            : this.toasts.find((toast) => {
                return toast.id === id;
            });
        if (alreadyExists) {
            this.toasts = this.toasts.map((toast) => {
                if (toast.id === id) {
                    this.publish({ ...toast, ...data, id, title: message });
                    return {
                        ...toast,
                        ...data,
                        id,
                        dismissible,
                        title: message
                    };
                }
                return toast;
            });
        }
        else {
            this.addToast({ title: message, ...rest, dismissible, id });
        }
        return id;
    };
    dismiss = (id) => {
        if (id === undefined || id === null) {
            this.getActiveToasts().forEach((toast) => {
                this.dismissedToasts.add(toast.id);
                this.subscribers.forEach((subscriber) => subscriber({ id: toast.id, dismiss: true }));
            });
            return id;
        }
        this.dismissedToasts.add(id);
        const alreadyPending = this.pendingDismissals.get(id);
        if (alreadyPending !== undefined) {
            cancelAnimationFrame(alreadyPending);
        }
        this.pendingDismissals.set(id, requestAnimationFrame(() => {
            this.pendingDismissals.delete(id);
            this.subscribers.forEach((subscriber) => subscriber({ id, dismiss: true }));
        }));
        return id;
    };
    message = (message, data) => {
        // `type: undefined` resets the type when this updates a toast that had one, e.g. turning
        // a loading toast into a plain one.
        return this.create({ ...data, message, type: undefined });
    };
    error = (message, data) => {
        return this.create({ ...data, message, type: 'error' });
    };
    success = (message, data) => {
        return this.create({ ...data, type: 'success', message });
    };
    info = (message, data) => {
        return this.create({ ...data, type: 'info', message });
    };
    warning = (message, data) => {
        return this.create({ ...data, type: 'warning', message });
    };
    loading = (message, data) => {
        return this.create({ ...data, type: 'loading', message });
    };
    promise = (promise, data = {}) => {
        let id = undefined;
        if (data.loading !== undefined) {
            id = this.create({
                ...data,
                promise,
                type: 'loading',
                message: data.loading,
                description: typeof data.description !== 'function' ? data.description : undefined
            });
        }
        const p = Promise.resolve(promise instanceof Function ? promise() : promise);
        let shouldDismiss = id !== undefined;
        let result;
        // Turns the `success` / `error` option into the toast it describes
        const settle = async (type, option, value) => {
            shouldDismiss = false;
            const promiseData = typeof option === 'function' ? await option(value) : option;
            const description = typeof data.description === 'function' ? await data.description(value) : data.description;
            const toastSettings = typeof promiseData === 'object'
                ? promiseData
                : { message: promiseData };
            this.create({ id, type, description, ...toastSettings });
        };
        const originalPromise = p
            .then(async (response) => {
            result = ['resolve', response];
            if (isHttpResponse(response) && !response.ok) {
                await settle('error', data.error, `HTTP error! status: ${response.status}`);
            }
            else if (response instanceof Error) {
                await settle('error', data.error, response);
            }
            else if (data.success !== undefined) {
                await settle('success', data.success, response);
            }
        })
            .catch(async (error) => {
            result = ['reject', error];
            if (data.error !== undefined) {
                await settle('error', data.error, error);
            }
        })
            .finally(() => {
            if (shouldDismiss) {
                // Toast is still in load state (and will be indefinitely — dismiss it)
                this.dismiss(id);
                id = undefined;
            }
            data.finally?.();
        });
        const unwrap = () => new Promise((resolve, reject) => originalPromise
            .then(() => (result[0] === 'reject' ? reject(result[1]) : resolve(result[1])))
            .catch(reject));
        if (typeof id !== 'string' && typeof id !== 'number') {
            // cannot Object.assign on undefined
            return { unwrap };
        }
        else {
            return Object.assign(id, { unwrap });
        }
    };
    custom = (jsx, data) => {
        const id = getToastId(data);
        // A custom toast has no type, so it resets the one of the toast it replaces
        this.create({ ...data, jsx, id, type: undefined });
        return id;
    };
    getActiveToasts = () => {
        return this.toasts.filter((toast) => !this.dismissedToasts.has(toast.id));
    };
}
export const ToastState = new Observer();
const isHttpResponse = (data) => {
    return (data &&
        typeof data === 'object' &&
        'ok' in data &&
        typeof data.ok === 'boolean' &&
        'status' in data &&
        typeof data.status === 'number');
};
const basicToast = (message, data) => {
    return ToastState.message(message, data);
};
const getHistory = () => ToastState.toasts;
const getToasts = () => ToastState.getActiveToasts();
// `Object.assign` keeps the types of the attached methods
export const toast = Object.assign(basicToast, {
    success: ToastState.success,
    info: ToastState.info,
    warning: ToastState.warning,
    error: ToastState.error,
    custom: ToastState.custom,
    message: ToastState.message,
    promise: ToastState.promise,
    dismiss: ToastState.dismiss,
    loading: ToastState.loading
}, { getHistory, getToasts });
