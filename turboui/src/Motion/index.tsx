import * as React from "react";

import {
  AnimatePresence,
  MotionConfig,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

import { GLIDE, MORPH, POP, SETTLE, SNAP, STAGGER_STEP, TINT, staggerDelay } from "./tokens";
import { useMeasuredHeight } from "./useMeasuredHeight";

export { GLIDE, MORPH, POP, SETTLE, SNAP, TINT, STAGGER_STEP, staggerDelay };
export { useMeasuredHeight };
export { AnimatePresence, MotionConfig, motion, useReducedMotion };

/**
 * Wraps the app so every animation below it defaults to the same transition and
 * honours the user's reduced-motion setting.
 *
 * `reducedMotion="user"` does not switch motion off — it keeps opacity and
 * colour changes and drops the movement, which is what people who get motion
 * sick actually need. Individual components never have to check for it.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={GLIDE}>
      {children}
    </MotionConfig>
  );
}

//
// Entrances
//

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds to wait before starting. Use `staggerDelay(index)` for lists. */
  delay?: number;
  /** Pixels to travel upward on the way in. 0 for a pure fade. */
  distance?: number;
  as?: "div" | "section" | "aside" | "header" | "li" | "tr";
}

/**
 * The standard entrance: a short rise plus a fade.
 *
 * Content that is already on screen when the page loads should not use this —
 * a whole page fading in on every navigation gets tiring fast. It is for
 * content that genuinely arrives: a panel opening, a section revealed by a
 * filter, results replacing a loading state.
 */
export function FadeIn({ children, className, delay = 0, distance = 6, as = "div" }: FadeInProps) {
  const Component = motion[as];

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: distance }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...GLIDE, delay }}
    >
      {children}
    </Component>
  );
}

interface StaggerProps {
  children: React.ReactNode;
  className?: string;
  step?: number;
}

const staggerContainer = (step: number) => ({
  hidden: {},
  shown: { transition: { staggerChildren: step } },
});

const staggerChild = {
  hidden: { opacity: 0, y: 6 },
  shown: { opacity: 1, y: 0, transition: GLIDE },
};

/**
 * Reveals its `StaggerItem` children one after another.
 *
 * Stagger reads as "these arrived together, in this order". It stops being
 * charming past a dozen rows, so the step is capped by `STAGGER_MAX_ITEMS`
 * when you drive delays manually with `staggerDelay`.
 */
export function Stagger({ children, className, step = STAGGER_STEP }: StaggerProps) {
  return (
    <motion.div className={className} variants={staggerContainer(step)} initial="hidden" animate="shown">
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={staggerChild}>
      {children}
    </motion.div>
  );
}

//
// Values that change in place
//

interface AnimatedBarProps {
  /** 0–100. */
  percentage: number;
  className?: string;
  barClassName?: string;
  /** Tailwind height class for the track, e.g. "h-1.5". */
  heightClassName?: string;
  testId?: string;
}

/**
 * A progress bar whose fill springs to its new value instead of snapping.
 *
 * Width is a layout property, so this is not the cheapest thing to animate —
 * but progress bars are small, few per screen, and the movement is the entire
 * reason the component exists.
 */
export function AnimatedBar({
  percentage,
  className = "",
  barClassName = "bg-status-ontrack",
  heightClassName = "h-1.5",
  testId,
}: AnimatedBarProps) {
  const clamped = Math.max(0, Math.min(100, percentage || 0));

  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-track ${heightClassName} ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      data-test-id={testId}
    >
      <motion.div
        className={`h-full rounded-full ${barClassName}`}
        initial={false}
        animate={{ width: `${clamped}%` }}
        transition={SETTLE}
      />
    </div>
  );
}

interface AnimatedNumberProps {
  value: number;
  /** Decimal places to show while counting. */
  decimals?: number;
  className?: string;
  format?: (value: number) => string;
}

/**
 * Counts up to a new value rather than jumping to it.
 *
 * Driven by a motion value, so the digits can change every frame without
 * re-rendering the component that owns them.
 */
export function AnimatedNumber({ value, decimals = 0, className, format }: AnimatedNumberProps) {
  const reduced = useReducedMotion();
  const raw = useMotionValue(value);
  const spring = useSpring(raw, SETTLE);
  const text = useTransform(spring, (current) => (format ? format(current) : current.toFixed(decimals)));

  React.useEffect(() => {
    if (reduced) {
      raw.jump(value);
      spring.jump(value);
    } else {
      raw.set(value);
    }
  }, [value, reduced, raw, spring]);

  return <motion.span className={className}>{text}</motion.span>;
}

//
// Shared-element helpers
//

interface ActiveIndicatorProps {
  /** Every indicator that can morph into every other one shares this id. */
  layoutId: string;
  className?: string;
}

/**
 * The moving underline / pill behind an active tab or nav item.
 *
 * Render it only inside the active item. When the active item changes, this
 * one unmounts and another mounts with the same `layoutId`, and Motion morphs
 * between the two positions — which is why the highlight appears to slide.
 */
export function ActiveIndicator({ layoutId, className = "" }: ActiveIndicatorProps) {
  return <motion.div layoutId={layoutId} className={className} transition={MORPH} />;
}

//
// Disclosure
//

interface ExpandableProps {
  open: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Height-animated disclosure that works with content of unknown size.
 *
 * The measured element and the animated element are deliberately different
 * nodes; padding belongs on the inner one so it is included in the measurement.
 */
export function Expandable({ open, children, className }: ExpandableProps) {
  const [ref, height] = useMeasuredHeight<HTMLDivElement>();

  return (
    <motion.div
      className="overflow-hidden"
      initial={false}
      animate={{ height: open ? height : 0, opacity: open ? 1 : 0 }}
      transition={POP}
      aria-hidden={!open}
    >
      <div ref={ref} className={className}>
        {children}
      </div>
    </motion.div>
  );
}

//
// Presence
//

interface SwapProps {
  /** Changing this key is what triggers the swap. */
  swapKey: React.Key;
  children: React.ReactNode;
  className?: string;
}

/**
 * Crossfades between two versions of the same slot — a label that changes, an
 * icon that becomes a checkmark, a count that flips.
 *
 * `mode="popLayout"` lets the outgoing and incoming elements animate at the
 * same time while their siblings reflow, which is almost always what a small
 * in-place swap wants.
 */
export function Swap({ swapKey, children, className }: SwapProps) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={swapKey}
        className={className}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={SNAP}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  );
}

/**
 * Fades a whole route's content in on navigation.
 *
 * Deliberately opacity-only and short: page transitions that move content
 * around make an app feel slower than it is, because nothing is readable until
 * the movement stops.
 */
export function PageFade({ routeKey, children }: { routeKey: React.Key; children: React.ReactNode }) {
  return (
    <motion.div key={routeKey} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={TINT}>
      {children}
    </motion.div>
  );
}

export { motion as m };
