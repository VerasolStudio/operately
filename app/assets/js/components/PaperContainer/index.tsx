/**
 * This is a component that renders a paper-like container.
 * It's used in the app to render the main content of the page.
 *
 * Example usage:
 *
 * ```tsx
 * import * as Paper from "@/components/PaperContainer";
 *
 * <Paper.Root>
 *   <Paper.Navigation>
 *     <Paper.NavItem>Projects</Paper.NavItem>
 *     <Paper.NavSeparator />
 *     <Paper.NavItem>Documentation</Paper.NavItem>
 *   </Paper.Navigation>
 *
 *   <Paper.Body>
 *     <h1 className="text-2xl font-bold">Increase Revenue</h1>
 *   </Paper.Body>
 * </Paper.Root>
 * ```
 */

import React from "react";

import classNames from "classnames";

import { Context } from "./Context";

type Size = "tiny" | "small" | "medium" | "large" | "xlarge" | "xxlarge";

const sizes = {
  tiny: "max-w-xl",
  small: "max-w-2xl",
  medium: "max-w-4xl",
  large: "max-w-5xl",
  xlarge: "max-w-6xl",
  xxlarge: "max-w-7xl",
};

interface RootProps {
  size?: Size;
  children?: React.ReactNode;
  fluid?: boolean;
  className?: string;
}

export function Root({ size, children, className, fluid = false }: RootProps): JSX.Element {
  size = size || "medium";

  // The redesign runs pages full-bleed on a white background instead of
  // floating a shadowed card on a coloured one. With the palette now white on
  // white that card was only a shadow, and the breadcrumb strip that tucked
  // under the old top bar had nothing left to tuck under.
  className = classNames(className, "relative w-full", "pt-6 pb-12", {
    "max-w-[90%]": fluid,
    [sizes[size]]: !fluid,
  });

  return (
    <Context.Provider value={{ size }}>
      <div className={className}>{children}</div>
    </Context.Provider>
  );
}

// Horizontal padding only: the page's vertical rhythm now comes from `Root`,
// so a body no longer has to reserve space for the card edge it sat on.
const bodyPaddings = {
  tiny: "px-6 sm:px-8 pt-2",
  small: "px-6 sm:px-8 pt-2",
  medium: "px-6 sm:px-8 pt-2",
  large: "px-6 sm:px-8 pt-2",
  xlarge: "px-6 sm:px-8 pt-2",
  xxlarge: "px-6 sm:px-8 pt-2",
};

interface BodyProps {
  children?: React.ReactNode;
  minHeight?: string;
  className?: string;
  noPadding?: boolean;
  backgroundColor?: string;
  banner?: React.ReactNode;
}

export function Body({
  children,
  minHeight = "none",
  className = "",
  noPadding = false,
  backgroundColor = "bg-surface-base",
  banner,
}: BodyProps) {
  const { size } = React.useContext(Context);
  const padding = noPadding ? "" : bodyPaddings[size];

  const outerClass = classNames("relative", backgroundColor === "bg-surface-base" ? "" : backgroundColor);

  const innerClass = classNames(padding, { "pt-4": banner }, className);

  return (
    <div className={outerClass}>
      {banner}
      <div className={innerClass} style={{ minHeight: minHeight }}>
        {children}
      </div>
    </div>
  );
}

export function usePaperSizeHelpers(): { size: Size; negHor: string; negTop: string; horPadding: string } {
  const { size } = React.useContext(Context);

  // Kept for callers that bleed a band out to the page edge — a header
  // underline, a dimmed footer section. There is no card to bleed past any
  // more, so the offsets are the body padding and nothing vertical.
  return {
    size: size as Size,
    negHor: "-mx-6 sm:-mx-8",
    negTop: "",
    horPadding: "px-6 sm:px-8",
  };
}

export * from "./DimmedSection";
export * from "./Banner";
export * from "./Header";
export * from "./Navigation";
export * from "./Section";
