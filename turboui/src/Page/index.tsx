import * as React from "react";
import classNames from "../utils/classnames";
import { Navigation } from "./Navigation";
import { PageOptions } from "./PageOptions";
import { Paper } from "./Paper";
import { useHtmlTitle } from "./useHtmlTitle";

export namespace Page {
  export type Size = "tiny" | "small" | "medium" | "large" | "xlarge" | "xxlarge" | "fullwidth";

  export interface Option {
    type: "link" | "action";
    icon: React.ElementType;
    label: string;
    link?: string;
    onClick?: () => void;
    hidden?: boolean;
    testId?: string;
    keepOutsideOnBigScreen?: boolean;
  }

  export interface Props {
    title: string | string[];
    size?: Size;
    options?: Option[];
    children?: React.ReactNode;
    navigation?: Navigation.Item[];
    navigationTestId?: string;
    optionsTestId?: string;
    testId?: string;
    className?: string;
  }
}

const sizeClasses: Record<Page.Size, string> = {
  tiny: "max-w-xl",
  small: "max-w-2xl",
  medium: "max-w-4xl",
  large: "max-w-5xl",
  xlarge: "max-w-6xl",
  xxlarge: "max-w-7xl",
  fullwidth: "max-w-full",
};

/**
 * The page frame every screen that has not been individually rewritten still
 * renders inside.
 *
 * Full-bleed on white with a breadcrumb at the top, matching the rewritten
 * screens — so moving between the two no longer changes the shape of the page
 * around you.
 */
export function Page(props: Page.Props) {
  useHtmlTitle(props.title);
  const containerClass = classNames("w-full pt-6 pb-12", sizeClasses[props.size || "medium"]);

  return (
    <div className={containerClass}>
      {props.navigation && <Navigation items={props.navigation} testId={props.navigationTestId ?? "navigation"} />}

      <Paper testId={props.testId}>
        <PageOptions options={props.options} testId={props.optionsTestId ?? "options-button"} />
        {props.children}
      </Paper>
    </div>
  );
}

// New style pages
export function PageNew(props: Page.Props) {
  useHtmlTitle(props.title);

  const innerClass = classNames("bg-surface-base", "flex flex-col", "min-h-full", props.className);
  const contentClass = classNames(sizeClasses[props.size || "medium"]);

  return (
    <div className="min-h-full" data-test-id={props.testId}>
      {props.navigation && (
        <div className="pt-6">
          <Navigation items={props.navigation} testId={props.navigationTestId ?? "navigation"} />
        </div>
      )}

      <div className={innerClass}>
        <PageOptions options={props.options} testId={props.optionsTestId ?? "options-button"} />
        <div className={contentClass}>{props.children}</div>
      </div>
    </div>
  );
}
