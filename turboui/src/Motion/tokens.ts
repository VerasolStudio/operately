import type { Transition } from "motion/react";

/**
 * Motion tokens for the Operately redesign.
 *
 * Every animation in the app should pick a transition from here instead of
 * inventing its own numbers. Keeping the set small is what makes the whole
 * product feel like one piece of software rather than a pile of separately
 * tuned components.
 *
 * Rules of thumb used to pick these values:
 *
 * - UI that appears under the pointer (menus, tooltips, hovers) is fast, and
 *   fully damped: overshoot near the cursor reads as sloppiness, not life.
 * - UI the user deliberately opened (drawers, dialogs, expanding rows) gets a
 *   little bounce, because the movement is the point.
 * - Anything that merely re-colours or re-labels itself uses a plain tween;
 *   springs on colour changes just look indecisive.
 */

/** Fast, no overshoot. Hovers, presses, tab indicators, focus rings. */
export const SNAP: Transition = { type: "spring", duration: 0.22, bounce: 0 };

/** The default for content that enters or leaves the layout. */
export const GLIDE: Transition = { type: "spring", duration: 0.35, bounce: 0 };

/** Deliberate, slightly lively. Drawers, dialogs, expanding sections. */
export const POP: Transition = { type: "spring", duration: 0.45, bounce: 0.2 };

/** Layout/shared-element morphs. Slightly longer so the eye can follow it. */
export const MORPH: Transition = { type: "spring", duration: 0.4, bounce: 0.12 };

/** Colour, opacity and other non-physical values. */
export const TINT: Transition = { duration: 0.18, ease: "easeOut" };

/** Progress bars and counters settling on a new value. */
export const SETTLE: Transition = { type: "spring", stiffness: 120, damping: 20, mass: 0.6 };

/** Delay between siblings in a staggered list, in seconds. */
export const STAGGER_STEP = 0.035;

/**
 * Cap on how many items in a list get a stagger delay. Beyond this the delay
 * is clamped so a 200-row table does not take six seconds to finish arriving.
 */
export const STAGGER_MAX_ITEMS = 12;

export function staggerDelay(index: number, step: number = STAGGER_STEP): number {
  return Math.min(index, STAGGER_MAX_ITEMS) * step;
}
