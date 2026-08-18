import React from "react";
import classnames from "classnames";
import { TestableElement } from "@/utils/testid";

interface BannerProps extends TestableElement {
  children: React.ReactNode;
  className?: string;
}

export function Banner(props: BannerProps) {
  const className = classnames(
    "leading-none",
    "bg-banner-warning-bg text-banner-warning-content",
    "flex items-center justify-center gap-2",
    "border-b border-banner-warning-border py-3 text-[13px] font-semibold",
    props.className,
  );

  return (
    <div className={className} data-test-id={props.testId}>
      {props.children}
    </div>
  );
}
