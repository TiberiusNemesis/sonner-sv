import type { Snippet } from 'svelte';
export type Renderable = string | Snippet;
export type ToastTypes = 'normal' | 'action' | 'success' | 'info' | 'warning' | 'error' | 'loading' | 'default';
export type PromiseT<Data = any> = Promise<Data> | (() => Promise<Data>);
export interface PromiseIExtendedResult extends ExternalToast {
    message: Renderable;
}
export type PromiseTExtendedResult<Data = any> = PromiseIExtendedResult | ((data: Data) => PromiseIExtendedResult | Promise<PromiseIExtendedResult>);
export type PromiseTResult<Data = any> = string | ((data: Data) => Renderable | Promise<Renderable>);
export type PromiseExternalToast = Omit<ExternalToast, 'description'>;
export type PromiseData<ToastData = any> = PromiseExternalToast & {
    loading?: Renderable;
    success?: PromiseTResult<ToastData> | PromiseTExtendedResult<ToastData>;
    error?: PromiseTResult | PromiseTExtendedResult;
    description?: PromiseTResult;
    finally?: () => void | Promise<void>;
};
export interface ToastClasses {
    toast?: string;
    title?: string;
    description?: string;
    loader?: string;
    closeButton?: string;
    cancelButton?: string;
    actionButton?: string;
    success?: string;
    error?: string;
    info?: string;
    warning?: string;
    loading?: string;
    default?: string;
    content?: string;
    icon?: string;
}
export interface ToastIcons {
    success?: Renderable | null;
    info?: Renderable | null;
    warning?: Renderable | null;
    error?: Renderable | null;
    loading?: Renderable | null;
    close?: Renderable | null;
}
export interface Action {
    label: Renderable;
    onClick: (event: MouseEvent & {
        currentTarget: EventTarget & HTMLButtonElement;
    }) => void;
    actionButtonStyle?: string;
}
export interface ToastT {
    id: number | string;
    toasterId?: string;
    title?: Renderable;
    type?: ToastTypes;
    icon?: Renderable | null;
    jsx?: Snippet<[number | string]>;
    richColors?: boolean;
    invert?: boolean;
    closeButton?: boolean;
    dismissible?: boolean;
    description?: Renderable;
    duration?: number;
    delete?: boolean;
    action?: Action | Snippet;
    cancel?: Action | Snippet;
    onDismiss?: (toast: ToastT) => void;
    onAutoClose?: (toast: ToastT) => void;
    promise?: PromiseT;
    cancelButtonStyle?: string;
    actionButtonStyle?: string;
    style?: string;
    unstyled?: boolean;
    class?: string;
    classes?: ToastClasses;
    descriptionClass?: string;
    position?: Position;
    testId?: string;
}
export declare function isAction(action: Action | Snippet): action is Action;
export type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
export interface HeightT {
    height: number;
    toastId: number | string;
    position?: Position;
}
export interface ToastOptions {
    class?: string;
    closeButton?: boolean;
    descriptionClass?: string;
    style?: string;
    cancelButtonStyle?: string;
    actionButtonStyle?: string;
    duration?: number;
    unstyled?: boolean;
    classes?: ToastClasses;
    closeButtonAriaLabel?: string;
}
export type Offset = {
    top?: string | number;
    right?: string | number;
    bottom?: string | number;
    left?: string | number;
} | string | number;
export type SwipeDirection = 'top' | 'right' | 'bottom' | 'left';
export interface ToasterProps {
    id?: string;
    invert?: boolean;
    theme?: 'light' | 'dark' | 'system';
    position?: Position;
    hotkey?: string[];
    richColors?: boolean;
    expand?: boolean;
    duration?: number;
    gap?: number;
    visibleToasts?: number;
    closeButton?: boolean;
    toastOptions?: ToastOptions;
    class?: string;
    style?: string;
    offset?: Offset;
    mobileOffset?: Offset;
    dir?: 'rtl' | 'ltr' | 'auto';
    swipeDirections?: SwipeDirection[];
    icons?: ToastIcons;
    customAriaLabel?: string;
    containerAriaLabel?: string;
}
export interface ToastProps {
    toast: ToastT;
    toasts: ToastT[];
    index: number;
    swipeDirections?: SwipeDirection[];
    expanded: boolean;
    invert?: boolean;
    heights: HeightT[];
    setHeights: (update: (heights: HeightT[]) => HeightT[]) => void;
    removeToast: (toast: ToastT) => void;
    gap: number;
    position: Position;
    visibleToasts: number;
    expandByDefault?: boolean;
    closeButton?: boolean;
    interacting: boolean;
    style?: string;
    cancelButtonStyle?: string;
    actionButtonStyle?: string;
    duration?: number;
    class?: string;
    unstyled?: boolean;
    descriptionClass?: string;
    classes?: ToastClasses;
    icons?: ToastIcons;
    closeButtonAriaLabel?: string;
    defaultRichColors?: boolean;
}
export type Theme = 'light' | 'dark';
export interface ToastToDismiss {
    id: number | string;
    dismiss: boolean;
}
export type ExternalToast = Omit<ToastT, 'id' | 'type' | 'title' | 'jsx' | 'delete' | 'promise'> & {
    id?: number | string;
    toasterId?: string;
};
