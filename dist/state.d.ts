import type { ExternalToast, PromiseData, PromiseT, Renderable, ToastT, ToastToDismiss, ToastTypes } from './types.js';
declare class Observer {
    subscribers: Array<(toast: ToastT | ToastToDismiss) => void>;
    toasts: Array<ToastT>;
    dismissedToasts: Set<string | number>;
    private pendingDismissals;
    constructor();
    subscribe: (subscriber: (toast: ToastT | ToastToDismiss) => void) => () => void;
    publish: (data: ToastT) => void;
    addToast: (data: ToastT) => void;
    private trimHistory;
    create: (data: ExternalToast & {
        message?: Renderable;
        type?: ToastTypes;
        promise?: PromiseT;
        jsx?: ToastT["jsx"];
    }) => string | number;
    dismiss: (id?: number | string) => string | number | undefined;
    message: (message: Renderable, data?: ExternalToast) => string | number;
    error: (message: Renderable, data?: ExternalToast) => string | number;
    success: (message: Renderable, data?: ExternalToast) => string | number;
    info: (message: Renderable, data?: ExternalToast) => string | number;
    warning: (message: Renderable, data?: ExternalToast) => string | number;
    loading: (message: Renderable, data?: ExternalToast) => string | number;
    promise: <ToastData>(promise: PromiseT<ToastData>, data?: PromiseData<ToastData>) => (string & {
        unwrap: () => Promise<ToastData>;
    }) | (number & {
        unwrap: () => Promise<ToastData>;
    }) | {
        unwrap: () => Promise<ToastData>;
    };
    custom: (jsx: NonNullable<ToastT["jsx"]>, data?: ExternalToast) => string | number;
    getActiveToasts: () => ToastT[];
}
export declare const ToastState: Observer;
export declare const toast: ((message: Renderable, data?: ExternalToast) => string | number) & {
    success: (message: Renderable, data?: ExternalToast) => string | number;
    info: (message: Renderable, data?: ExternalToast) => string | number;
    warning: (message: Renderable, data?: ExternalToast) => string | number;
    error: (message: Renderable, data?: ExternalToast) => string | number;
    custom: (jsx: NonNullable<ToastT["jsx"]>, data?: ExternalToast) => string | number;
    message: (message: Renderable, data?: ExternalToast) => string | number;
    promise: <ToastData>(promise: PromiseT<ToastData>, data?: PromiseData<ToastData>) => (string & {
        unwrap: () => Promise<ToastData>;
    }) | (number & {
        unwrap: () => Promise<ToastData>;
    }) | {
        unwrap: () => Promise<ToastData>;
    };
    dismiss: (id?: number | string) => string | number | undefined;
    loading: (message: Renderable, data?: ExternalToast) => string | number;
} & {
    getHistory: () => ToastT[];
    getToasts: () => ToastT[];
};
export {};
