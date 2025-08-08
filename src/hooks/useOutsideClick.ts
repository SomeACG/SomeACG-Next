import { useEffect, useMemo, useRef } from 'react';

export type OutsideClickEvent = 'mousedown' | 'mouseup' | 'click' | 'touchstart' | 'pointerdown';

export interface UseOutsideClickOptions {
  enabled?: boolean;
  events?: OutsideClickEvent[];
  ignore?: Array<React.RefObject<HTMLElement | null>>;
  passive?: boolean;
}

/**
 * Call handler when a pointer event happens outside of the provided element(s).
 */
export function useOutsideClick(
  targets: React.RefObject<HTMLElement | null> | Array<React.RefObject<HTMLElement | null>>,
  handler: (event: Event) => void,
  options: UseOutsideClickOptions = {},
): void {
  const { enabled = true, events = ['mousedown', 'touchstart'], ignore = [], passive = true } = options;

  const targetRefs = useMemo(() => (Array.isArray(targets) ? targets : [targets]), [targets]);
  const ignoreRefs = useMemo(() => ignore, [ignore]);
  const eventList = useMemo(() => events, [events]);

  // Keep latest handler in a ref to avoid re-subscribing listeners when handler identity changes
  const latestHandlerRef = useRef(handler);
  useEffect(() => {
    latestHandlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!enabled) return;

    const onEvent = (event: MouseEvent | TouchEvent | PointerEvent) => {
      const eventTarget = event.target as Node | null;
      if (!eventTarget) return;

      const isInsideTarget = targetRefs.some((ref) => {
        const el = ref?.current;
        return el ? el.contains(eventTarget) : false;
      });
      if (isInsideTarget) return;

      const isInsideIgnored = ignoreRefs.some((ref) => {
        const el = ref?.current;
        return el ? el.contains(eventTarget) : false;
      });
      if (isInsideIgnored) return;

      latestHandlerRef.current?.(event);
    };

    eventList.forEach((evt) => {
      document.addEventListener(evt, onEvent as EventListener, { passive });
    });

    return () => {
      eventList.forEach((evt) => {
        document.removeEventListener(evt, onEvent as EventListener);
      });
    };
  }, [enabled, passive, targetRefs, ignoreRefs, eventList]);
}

export default useOutsideClick;
