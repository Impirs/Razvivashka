/**
 * Accessibility utilities for better UX
 */

/**
 * Checks if an element should have an accessible label
 * @param props - React props object
 * @returns true if element needs an accessible label
 */
export function needsAccessibleLabel(props: Record<string, unknown>): boolean {
    return !props['aria-label'] && !props['aria-labelledby'] && !props['aria-describedby'];
}

/**
 * Generates a default accessible label for interactive elements
 * @param elementType - Type of element (button, input, etc.)
 * @param content - Content or purpose of the element
 * @returns Generated aria-label
 */
export function generateAccessibleLabel(elementType: string, content?: string | React.ReactNode): string {
    if (typeof content === 'string' && content.trim()) {
        return content;
    }
    
    return `${elementType.charAt(0).toUpperCase() + elementType.slice(1)} element`;
}

/**
 * Ensures an element has focus management attributes
 * @param props - React props object
 * @returns Props with accessibility enhancements
 */
export function enhanceAccessibility<T extends Record<string, unknown>>(
    props: T,
    elementType: string = 'element'
): T & { 'aria-label'?: string } {
    if (needsAccessibleLabel(props)) {
        return {
            ...props,
            'aria-label': generateAccessibleLabel(elementType, props.children as string)
        };
    }
    
    return props;
}

/**
 * Creates ARIA live region announcements for screen readers
 * @param message - Message to announce
 * @param priority - Announcement priority (polite or assertive)
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement is made
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

/**
 * Screen reader only CSS class utility
 */
export const srOnlyClass = 'sr-only';
