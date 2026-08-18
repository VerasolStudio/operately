import * as React from "react";

/**
 * Reports the live height of an element via ResizeObserver.
 *
 * Motion can animate a fixed height to `auto`, but not `auto` to `auto`, which
 * is what collapsible sections with dynamic content actually need. Measuring
 * the inner element and animating the outer one to that pixel value is the way
 * around it.
 *
 * The returned ref and the animated height must live on *different* elements:
 * putting both on the same node makes the animated height stick, and the
 * element stops reacting to content changes.
 */
export function useMeasuredHeight<T extends HTMLElement>(): [React.RefObject<T>, number] {
  const ref = React.useRef<T>(null);
  const [height, setHeight] = React.useState(0);

  React.useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    setHeight(node.offsetHeight);

    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      // borderBoxSize is the reliable source here; contentRect excludes padding.
      const box = entry.borderBoxSize?.[0];
      setHeight(box ? box.blockSize : (entry.target as HTMLElement).offsetHeight);
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, height];
}
