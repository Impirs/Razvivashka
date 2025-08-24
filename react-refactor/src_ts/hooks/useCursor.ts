import React from 'react';

interface UseCursorOptions {
    enableLongPress?: boolean;
    longPressDelay?: number;
}

interface UseCursorReturn {
    cursorClass: string;
    onMouseDown: () => void;
    onMouseUp: () => void;
    onMouseLeave: () => void;
}

export const useCursor = (options: UseCursorOptions = {}): UseCursorReturn => {
    const { enableLongPress = false, longPressDelay = 100 } = options;
    
    const [longPressActive, setLongPressActive] = React.useState(false);
    const longPressTimer = React.useRef<NodeJS.Timeout | null>(null);

    const onMouseDown = React.useCallback(() => {
        if (!enableLongPress) return;
        
        setLongPressActive(false);
        
        longPressTimer.current = setTimeout(() => {
            setLongPressActive(true);
        }, longPressDelay);
    }, [enableLongPress, longPressDelay]);

    const onMouseUp = React.useCallback(() => {
        if (!enableLongPress) return;
        
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
        setLongPressActive(false);
    }, [enableLongPress]);

    const onMouseLeave = React.useCallback(() => {
        if (!enableLongPress) return;
        
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
        setLongPressActive(false);
    }, [enableLongPress]);

    // Очистка при размонтировании
    React.useEffect(() => {
        return () => {
            if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
            }
        };
    }, []);

    const cursorClass = longPressActive ? 'long-press-active' : '';

    return {
        cursorClass,
        onMouseDown,
        onMouseUp,
        onMouseLeave
    };
};
