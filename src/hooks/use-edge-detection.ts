import { useEffect, useRef } from "react";

interface UseEdgeDetectionOptions {
  topThreshold?: number;
  leftThreshold?: number;
  onTopEdge?: (isNear: boolean) => void;
  onLeftEdge?: (isNear: boolean) => void;
}

export const useEdgeDetection = ({
  topThreshold = 2,
  leftThreshold = 2,
  onTopEdge,
  onLeftEdge,
}: UseEdgeDetectionOptions = {}) => {
  const topEdgeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leftEdgeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isNearTopRef = useRef(false);
  const isNearLeftRef = useRef(false);
  const onTopEdgeRef = useRef(onTopEdge);
  const onLeftEdgeRef = useRef(onLeftEdge);

  useEffect(() => {
    onTopEdgeRef.current = onTopEdge;
    onLeftEdgeRef.current = onLeftEdge;
  }, [onTopEdge, onLeftEdge]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const nearTop = e.clientY <= topThreshold;
      const nearLeft = e.clientX <= leftThreshold;

      if (nearTop && !isNearTopRef.current) {
        if (topEdgeTimeoutRef.current) {
          clearTimeout(topEdgeTimeoutRef.current);
          topEdgeTimeoutRef.current = null;
        }
        isNearTopRef.current = true;
        onTopEdgeRef.current?.(true);
      } else if (!nearTop && isNearTopRef.current) {
        if (topEdgeTimeoutRef.current) {
          clearTimeout(topEdgeTimeoutRef.current);
        }
        topEdgeTimeoutRef.current = setTimeout(() => {
          isNearTopRef.current = false;
          onTopEdgeRef.current?.(false);
        }, 200);
      }

      if (nearLeft && !isNearLeftRef.current) {
        if (leftEdgeTimeoutRef.current) {
          clearTimeout(leftEdgeTimeoutRef.current);
          leftEdgeTimeoutRef.current = null;
        }
        isNearLeftRef.current = true;
        onLeftEdgeRef.current?.(true);
      } else if (!nearLeft && isNearLeftRef.current) {
        if (leftEdgeTimeoutRef.current) {
          clearTimeout(leftEdgeTimeoutRef.current);
        }
        leftEdgeTimeoutRef.current = setTimeout(() => {
          isNearLeftRef.current = false;
          onLeftEdgeRef.current?.(false);
        }, 200);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (topEdgeTimeoutRef.current) {
        clearTimeout(topEdgeTimeoutRef.current);
      }
      if (leftEdgeTimeoutRef.current) {
        clearTimeout(leftEdgeTimeoutRef.current);
      }
    };
  }, [topThreshold, leftThreshold]);
};
