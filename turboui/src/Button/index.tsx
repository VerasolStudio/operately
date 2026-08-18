export type { BaseButtonProps } from "./UnstalyedButton";

import React from "react";
import { Spinner } from "./Spinner";
import { BaseButtonProps, UnstyledButton } from "./UnstalyedButton";
import { calcClassName } from "./calcClassNames";

export function PrimaryButton(props: BaseButtonProps) {
  const className = calcClassName(props, {
    always: "border border-primary",
    normal: "text-primary-content bg-primary hover:bg-primary-hover hover:border-primary-hover",
    loading: "text-content-subtle bg-primary/70 border-transparent",
    disabled: "text-primary-content bg-primary border-primary opacity-50",
  });

  return (
    <UnstyledButton
      {...props}
      className={className}
      spinner={<Spinner loading={props.loading} size={props.size} color="var(--color-white-1)" />}
    />
  );
}

export function DangerButton(props: BaseButtonProps) {
  const className = calcClassName(props, {
    always: "border border-red-500",
    normal: "text-white-1 bg-red-500 hover:bg-red-600 dark:hover:bg-red-400",
    loading: "text-content-subtle bg-red-400 border-red-400 dark:bg-red-500 dark:border-red-500",
    disabled: "text-content-subtle bg-red-400 border-red-400 dark:bg-red-500 dark:border-red-500",
  });

  return (
    <UnstyledButton
      {...props}
      className={className}
      spinner={<Spinner loading={props.loading} size={props.size} color="var(--color-white-1)" />}
    />
  );
}

export function GhostButton(props: BaseButtonProps) {
  const className = calcClassName(props, {
    always: "border border-primary-soft-border bg-surface-base",
    normal: "text-primary hover:bg-primary-soft-bg",
    loading: "text-content-subtle bg-primary-soft-bg border-primary-soft-bg",
    disabled: "text-content-subtle border-primary-soft-border",
  });

  return (
    <UnstyledButton
      {...props}
      className={className}
      spinner={<Spinner loading={props.loading} color="#3185FF" size={props.size} />}
    />
  );
}

export function SecondaryButton(props: BaseButtonProps) {
  const className = calcClassName(props, {
    always: "border border-line-strong bg-surface-base",
    normal: "text-content-muted hover:bg-surface-accent",
    loading: "text-content-subtle bg-surface-accent border-surface-accent",
    disabled: "text-content-subtle bg-surface-accent border-surface-accent",
  });

  return (
    <UnstyledButton
      {...props}
      className={className}
      spinner={<Spinner loading={props.loading} size={props.size} color="var(--color-brand-1)" />}
    />
  );
}

export { OptionsButton } from "./OptionsButton";
export type { OptionsButtonProps } from "./OptionsButton";
