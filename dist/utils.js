// Viewport padding
const VIEWPORT_OFFSET = '24px';
// Mobile viewport padding
const MOBILE_VIEWPORT_OFFSET = '16px';
export function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}
export function getDefaultSwipeDirections(position) {
    const [y, x] = position.split('-');
    const directions = [];
    if (y) {
        directions.push(y);
    }
    if (x) {
        directions.push(x);
    }
    return directions;
}
export function getDocumentDirection() {
    if (typeof window === 'undefined')
        return 'ltr';
    if (typeof document === 'undefined')
        return 'ltr';
    const dirAttribute = document.documentElement.getAttribute('dir');
    if (dirAttribute === 'auto' || !dirAttribute) {
        return window.getComputedStyle(document.documentElement).direction;
    }
    return dirAttribute;
}
const SIDES = ['top', 'right', 'bottom', 'left'];
// Turns the `offset` and `mobileOffset` props into the CSS variables the toaster is positioned with.
export function assignOffset(defaultOffset, mobileOffset) {
    const styles = {};
    [defaultOffset, mobileOffset].forEach((offset, index) => {
        const isMobile = index === 1;
        const prefix = isMobile ? '--mobile-offset' : '--offset';
        const defaultValue = isMobile ? MOBILE_VIEWPORT_OFFSET : VIEWPORT_OFFSET;
        const toCss = (value) => (typeof value === 'number' ? `${value}px` : value);
        SIDES.forEach((key) => {
            if (typeof offset === 'number' || typeof offset === 'string') {
                styles[`${prefix}-${key}`] = toCss(offset);
            }
            else if (typeof offset === 'object' && offset[key] !== undefined) {
                styles[`${prefix}-${key}`] = toCss(offset[key]);
            }
            else {
                styles[`${prefix}-${key}`] = defaultValue;
            }
        });
    });
    return styles;
}
