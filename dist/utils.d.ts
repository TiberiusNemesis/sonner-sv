import type { Offset, SwipeDirection, ToasterProps } from './types.js';
export declare function cn(...classes: (string | undefined)[]): string;
export declare function getDefaultSwipeDirections(position: string): SwipeDirection[];
export declare function getDocumentDirection(): ToasterProps['dir'];
export declare function assignOffset(defaultOffset?: Offset, mobileOffset?: Offset): Record<string, string>;
