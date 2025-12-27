import { useRef, useEffect, useState, useMemo, useCallback, useId, FC, PointerEvent, memo } from 'react';

interface CurvedLoopProps {
  marqueeText?: string;
  speed?: number;
  className?: string;
  curveAmount?: number;
  direction?: 'left' | 'right';
  interactive?: boolean;
  responsive?: boolean;
}

const CurvedLoop: FC<CurvedLoopProps> = ({
  marqueeText = '',
  speed = 2,
  className,
  curveAmount = 400,
  direction = 'left',
  interactive = true,
  responsive = true
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [spacing, setSpacing] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const measureRef = useRef<SVGTextElement | null>(null);
  const textPathRef = useRef<SVGTextPathElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const dragRef = useRef(false);
  const lastXRef = useRef(0);
  const dirRef = useRef<'left' | 'right'>(direction);
  const velRef = useRef(0);
  const offsetRef = useRef(0);
  
  const uid = useId();
  const pathId = `curve-${uid}`;

  // Detect mobile screen size - debounced
  useEffect(() => {
    if (!responsive) return;
    
    let timeoutId: NodeJS.Timeout;
    const checkMobile = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth < 768);
      }, 100);
    };
    
    // Initial check without debounce
    setIsMobile(window.innerWidth < 768);
    
    window.addEventListener('resize', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timeoutId);
    };
  }, [responsive]);

  // Memoized text with trailing space
  const text = useMemo(() => {
    const hasTrailing = /\s|\u00A0$/.test(marqueeText);
    return (hasTrailing ? marqueeText.replace(/\s+$/, '') : marqueeText) + '\u00A0';
  }, [marqueeText]);
  
  // Adjust curve amount for mobile
  const adjustedCurveAmount = useMemo(() => {
    return responsive && isMobile ? curveAmount * 0.4 : curveAmount;
  }, [responsive, isMobile, curveAmount]);
  
  // Path definition - extended for full coverage
  const pathD = useMemo(() => {
    const yPos = 30;
    return `M-200,${yPos} Q500,${yPos + adjustedCurveAmount} 2200,${yPos}`;
  }, [adjustedCurveAmount]);

  // Estimated path length for text repetition calculation
  const estimatedPathLength = 2800;
  
  // Calculate total text with repetitions
  const totalText = useMemo(() => {
    if (!spacing) return text;
    const repetitions = Math.ceil((estimatedPathLength * 5) / spacing) + 30;
    return Array(repetitions).fill(text).join('');
  }, [spacing, text]);
  
  const ready = spacing > 0;

  // Calculate spacing on mount and text change
  useEffect(() => {
    if (!measureRef.current) return;
    
    const rafId = requestAnimationFrame(() => {
      if (measureRef.current) {
        const length = measureRef.current.getComputedTextLength();
        if (length > 0) setSpacing(length);
      }
    });
    
    return () => cancelAnimationFrame(rafId);
  }, [text, className, isMobile]);

  // Initialize offset
  useEffect(() => {
    if (!spacing || !textPathRef.current) return;
    offsetRef.current = -spacing;
    textPathRef.current.setAttribute('startOffset', `${offsetRef.current}px`);
  }, [spacing]);

  // Animation loop - pure DOM manipulation, no state updates
  useEffect(() => {
    if (!spacing || !ready) return;
    
    let rafId: number;
    
    const animate = () => {
      if (!dragRef.current && textPathRef.current) {
        const delta = dirRef.current === 'right' ? speed : -speed;
        let newOffset = offsetRef.current + delta;
        
        // Wrap offset
        if (newOffset <= -spacing) newOffset += spacing;
        if (newOffset > 0) newOffset -= spacing;
        
        offsetRef.current = newOffset;
        textPathRef.current.setAttribute('startOffset', `${newOffset}px`);
      }
      rafId = requestAnimationFrame(animate);
    };
    
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [spacing, speed, ready]);

  // Pointer event handlers
  const onPointerDown = useCallback((e: PointerEvent) => {
    if (!interactive) return;
    dragRef.current = true;
    setIsDragging(true);
    lastXRef.current = e.clientX;
    velRef.current = 0;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [interactive]);

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!interactive || !dragRef.current || !textPathRef.current) return;
    
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    velRef.current = dx;
    
    let newOffset = offsetRef.current + dx;
    if (newOffset <= -spacing) newOffset += spacing;
    if (newOffset > 0) newOffset -= spacing;
    
    offsetRef.current = newOffset;
    textPathRef.current.setAttribute('startOffset', `${newOffset}px`);
  }, [interactive, spacing]);

  const endDrag = useCallback(() => {
    if (!interactive) return;
    dragRef.current = false;
    setIsDragging(false);
    dirRef.current = velRef.current > 0 ? 'right' : 'left';
  }, [interactive]);

  // Cursor style
  const cursorStyle = interactive ? (isDragging ? 'grabbing' : 'grab') : 'auto';

  // SVG text size class based on screen size
  const textSizeClass = responsive && isMobile 
    ? 'text-[20rem]' // Mobile: 20rem as requested
    : 'text-[6rem]'; // Desktop: 6rem

  return (
    <div
      className="flex items-center justify-center w-full"
      style={{ visibility: ready ? 'visible' : 'hidden', cursor: cursorStyle }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      <svg
        className={`select-none w-full overflow-visible block aspect-[100/12] font-bold uppercase leading-none ${textSizeClass}`}
        viewBox="-200 0 2400 120"
        preserveAspectRatio="xMidYMid meet"
      >
        <text 
          ref={measureRef} 
          xmlSpace="preserve" 
          style={{ visibility: 'hidden', position: 'absolute', pointerEvents: 'none' }}
          aria-hidden="true"
        >
          {text}
        </text>
        <defs>
          <path ref={pathRef} id={pathId} d={pathD} fill="none" stroke="transparent" />
        </defs>
        {ready && (
          <text xmlSpace="preserve" className={className ?? 'fill-white'}>
            <textPath ref={textPathRef} href={`#${pathId}`} xmlSpace="preserve">
              {totalText}
            </textPath>
          </text>
        )}
      </svg>
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export default memo(CurvedLoop);
