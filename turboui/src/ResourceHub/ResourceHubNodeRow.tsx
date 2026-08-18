import * as React from "react";

import { CommentCountIndicator } from "../CommentCountIndicator";
import { DivLink } from "../Link";
import classNames from "../utils/classnames";
import { NodeDescription } from "./NodeDescription";
import { NodeIcon } from "./NodeIcon";
import { getNodeCommentsCount, getNodeName } from "./selectors";
import type { ResourceHubNode } from "./types";

interface ResourceHubNodeRowProps {
  node: ResourceHubNode;
  path: string;
  testId: string;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * One row in a document list.
 *
 * The icon dropped from 48px to 30px and the name from bold-base to
 * medium-14. A file list is read by scanning names down the left edge; at 48px
 * the icons became the dominant column, and every row looked equally
 * important.
 */
export function ResourceHubNodeRow({ node, path, testId, actions, className }: ResourceHubNodeRowProps) {
  const rowClassName = classNames(
    "flex items-center justify-between gap-3 border-b border-line-soft px-2 py-3 transition-colors last:border-b-0 hover:bg-surface-highlight",
    className,
  );

  return (
    <div className={rowClassName} data-test-id={testId}>
      <DivLink to={path} className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
        <NodeIcon node={node} size={30} />

        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-content-strong">{getNodeName(node)}</div>
          <div className="mt-0.5 truncate text-content-subtle">
            <NodeDescription node={node} />
          </div>
        </div>
      </DivLink>

      <CommentCountIndicator count={getNodeCommentsCount(node)} size={20} />
      {actions}
    </div>
  );
}
