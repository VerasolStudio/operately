import classNames from "../utils/classnames";
import { BaseButtonProps } from "./UnstalyedButton";

export function calcClassName(
  props: BaseButtonProps,
  { normal, loading, always, disabled }: { normal: string; loading: string; always: string; disabled: string },
) {
  const size = props.size || "base";

  return classNames(
    "relative",
    "flex-grow-0 flex-shrink-0",
    "font-semibold text-center inline-block",
    "transition-all duration-100",
    props.className,
    always,
    {
      "cursor-default": props.loading,
      "cursor-pointer": !props.loading,
    },
    // The redesign standardises on 8px corners; `rounded-md` (6px) read as a
    // different family of control next to the 12px cards it sits on top of.
    {
      "px-2 py-0.5 text-xs rounded-lg": size === "xxs",
      "px-2.5 py-1 text-xs rounded-lg": size === "xs",
      "px-3 py-1.5 text-[13px] rounded-lg": size === "sm",
      "px-3.5 py-2 text-[13px] rounded-lg": size === "base",
      "px-5 py-2.5 rounded-lg": size === "lg",
    },
    {
      [normal]: !props.loading && !props.disabled,
      [loading]: props.loading,
    },
    {
      "cursor-not-allowed": props.disabled,
      [disabled]: props.disabled,
    },
  );
}
