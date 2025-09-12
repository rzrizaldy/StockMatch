import { useState, useRef, useCallback } from 'react';

interface SwipeConfig {
  threshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export function useSwipe(config: SwipeConfig = {}) {
  const { threshold = 100, onSwipeLeft, onSwipeRight } = config;
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);
  const [dragDistance, setDragDistance] = useState(0);
  
  const startPosRef = useRef({ x: 0, y: 0 });
  const elementRef = useRef<HTMLElement>(null);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    startPosRef.current = { x: clientX, y: clientY };
  }, []);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || !elementRef.current) return;

    const deltaX = clientX - startPosRef.current.x;
    const deltaY = clientY - startPosRef.current.y;
    
    setDragDistance(Math.abs(deltaX));
    
    if (Math.abs(deltaX) > 10) {
      setDragDirection(deltaX > 0 ? 'right' : 'left');
    } else {
      setDragDirection(null);
    }

    const rotation = (deltaX / 10) * 5;
    elementRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${rotation}deg)`;
  }, [isDragging]);

  const handleEnd = useCallback(() => {
    if (!isDragging || !elementRef.current) return;

    setIsDragging(false);
    
    if (dragDistance > threshold) {
      if (dragDirection === 'right') {
        elementRef.current.style.transform = 'translateX(100vw) rotate(15deg)';
        elementRef.current.style.opacity = '0';
        setTimeout(() => onSwipeRight?.(), 200);
      } else if (dragDirection === 'left') {
        elementRef.current.style.transform = 'translateX(-100vw) rotate(-15deg)';
        elementRef.current.style.opacity = '0';
        setTimeout(() => onSwipeLeft?.(), 200);
      } else {
        elementRef.current.style.transform = 'translate(0, 0) rotate(0deg)';
      }
    } else {
      elementRef.current.style.transform = 'translate(0, 0) rotate(0deg)';
    }
    
    setDragDirection(null);
    setDragDistance(0);
  }, [isDragging, dragDistance, dragDirection, threshold, onSwipeLeft, onSwipeRight]);

  const swipeHandlers = {
    onMouseDown: (e: React.MouseEvent) => {
      e.preventDefault();
      handleStart(e.clientX, e.clientY);
    },
    onTouchStart: (e: React.TouchEvent) => {
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    }
  };

  return {
    ref: elementRef,
    isDragging,
    dragDirection,
    dragDistance,
    swipeHandlers
  };
}
