import { expect, within, userEvent, waitFor } from "storybook/test";

type StoryCanvas = HTMLElement;
type StoryStep = (label: string, play: () => Promise<void> | void) => Promise<void> | void;
type WorkMapTab = "all" | "goals" | "projects" | "completed" | "paused";

export const ensureItemExpanded = async (
  canvasElement: StoryCanvas,
  step: StoryStep,
  parentName: string,
  childNames: string[],
) => {
  const canvas = within(canvasElement);
  const childVisible = childNames.some((name) => canvas.queryByText(name));

  if (!childVisible) {
    await toggleItem(canvasElement, step, parentName);
  }
};

export const resetWorkMapExpandedState = async (_canvasElement: StoryCanvas, step: StoryStep) => {
  await step("Reset work map expanded state", async () => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("workmap:")) {
        localStorage.removeItem(key);
      }
    }
  });
};

export const selectTab = async (canvasElement: StoryCanvas, step: StoryStep, tab: WorkMapTab) => {
  await step("Select the " + tab + " tab", async () => {
    // Tabs are identified by their filter id rather than their label, so the
    // helper keeps working when the labels are translated.
    const tabElement = canvasElement.querySelector(`[data-test-id="tab-${tab}"]`);
    expect(tabElement).not.toBeNull();
    await userEvent.click(tabElement!);

    await waitFor(() => {
      expect(tabElement!.className).toContain("font-semibold");
    });
  });
};

export const assertRowsNumber = async (canvasElement: StoryCanvas, step: StoryStep, count: number) => {
  const canvas = within(canvasElement);

  await step(`Verify there are ${count} rows`, async () => {
    const rowgroups = canvas.getAllByRole("rowgroup");
    expect(rowgroups.length).toBeGreaterThan(1); // Ensure we have at least 2 rowgroups

    const tableBody = rowgroups[1]!; // Second rowgroup is tbody
    const tableRows = within(tableBody).queryAllByRole("row");

    expect(tableRows.length).toEqual(count);
  });
};

export const assertItemName = async (canvasElement: StoryCanvas, step: StoryStep, name: string) => {
  const canvas = within(canvasElement);

  await step("Verify the item name", async () => {
    const itemName = canvas.getByText(name);
    expect(itemName).toBeInTheDocument();
  });
};

export const refuteItemName = async (canvasElement: StoryCanvas, step: StoryStep, name: string) => {
  const canvas = within(canvasElement);

  await step("Verify the item name is not present", async () => {
    const itemName = canvas.queryByText(name);
    expect(itemName).not.toBeInTheDocument();
  });
};

export const toggleItem = async (canvasElement: StoryCanvas, step: StoryStep, name: string) => {
  const canvas = within(canvasElement);

  await step(`Toggle "${name}"`, async () => {
    const goalRowElement = canvas.getByText(name);
    const goalRow = goalRowElement.closest("tr") as HTMLElement;

    const expandButton = goalRow.querySelector('[data-test-id^="chevron-icon"]');
    expect(expandButton).not.toBeNull();
    await userEvent.click(expandButton!);
  });
};

export const assertIndentation = async (
  canvasElement: StoryCanvas,
  step: StoryStep,
  name: string,
  level: number,
  indentation: string,
) => {
  const canvas = within(canvasElement);

  await step(`Verify indentation of level ${level} items is ${indentation}`, async () => {
    // Nesting is expressed as left padding on the title block rather than a
    // spacer element, so the tree has no throwaway nodes between its rows.
    const level1Project = canvas.getByText(name);
    const indentedContainer = level1Project.closest('[style*="padding-left"]') as HTMLElement | null;

    if (level === 0) {
      expect(indentedContainer).toBeNull();
    } else {
      expect(indentedContainer).not.toBeNull();
      expect(indentedContainer!.style.paddingLeft).toBe(indentation);
    }
  });
};

export const assertItemVisible = async (canvasElement: StoryCanvas, step: StoryStep, name: string) => {
  const canvas = within(canvasElement);

  await step(`Assert that "${name}" is visible`, async () => {
    const item = canvas.getByText(name);
    expect(item).toBeInTheDocument();
  });
};

export const assertChildrenVisible = async (canvasElement: StoryCanvas, step: StoryStep, names: string[]) => {
  const canvas = within(canvasElement);

  await step(`Assert that children are visible`, async () => {
    names.forEach((name) => {
      const item = canvas.queryByText(name);
      expect(item).toBeInTheDocument();
    });
  });
};

export const assertChildrenHidden = async (canvasElement: StoryCanvas, step: StoryStep, names: string[]) => {
  const canvas = within(canvasElement);

  await step(`Assert that children are hidden`, async () => {
    names.forEach((name) => {
      const item = canvas.queryByText(name);
      expect(item).not.toBeInTheDocument();
    });
  });
};

export const assertZeroState = async (canvasElement: StoryCanvas, step: StoryStep) => {
  await step("Assert that the zero state guidance is visible", async () => {
    const canvas = within(canvasElement);
    const headline = canvas.getByText("Start by adding a goal or project");
    expect(headline).toBeInTheDocument();
  });
};

export const assertItemHasLineThrough = async (canvasElement: StoryCanvas, step: StoryStep, name: string) => {
  const canvas = within(canvasElement);

  await step(`Assert that "${name}" has line-through style`, async () => {
    const item = canvas.getByText(name);
    expect(item.closest(".line-through")).not.toBeNull();
  });
};

export const refuteItemHasLineThrough = async (canvasElement: StoryCanvas, step: StoryStep, name: string) => {
  const canvas = within(canvasElement);

  await step(`Assert that "${name}" does not have line-through style`, async () => {
    const item = canvas.getByText(name);
    expect(item.closest(".line-through")).toBeNull();
  });
};

type LabelColor = "green" | "amber" | "red" | "gray";

export const assertStatusBadge = async (
  canvasElement: StoryCanvas,
  step: StoryStep,
  label: string,
  color: LabelColor,
) => {
  const canvas = within(canvasElement);

  await step("Verify the status label has correct styles", async () => {
    // Status in a table is a coloured dot plus a word, not a filled pill, so
    // the assertion is on the semantic token rather than a raw palette class.
    const statusLabel = canvas.getByText(label).closest("span")!;

    switch (color) {
      case "green":
        expect(statusLabel.className).toContain("text-status-ontrack-content");
        break;
      case "amber":
        expect(statusLabel.className).toContain("text-status-caution-content");
        break;
      case "red":
        expect(statusLabel.className).toContain("text-status-offtrack-content");
        break;
      case "gray":
        expect(statusLabel.className).toContain("text-content-dimmed");
        break;
    }
  });
};

export const assertProgressBar = async (
  canvasElement: StoryCanvas,
  step: StoryStep,
  progress: number,
  color: LabelColor,
) => {
  const canvas = within(canvasElement);

  await step("Verify progress bar shows correct progress", async () => {
    const progressBar = canvas.getByRole("progress-bar");

    const innerBar = within(progressBar).getByTestId("progress-percentage-bar");

    const innerBarWidth = innerBar?.getBoundingClientRect().width || 0;
    const outerBarWidth = progressBar.getBoundingClientRect().width;

    const percentage = Math.round((innerBarWidth / outerBarWidth) * 100);

    expect(percentage).toEqual(progress);

    switch (color) {
      case "gray":
        expect(innerBar?.className).toContain("bg-status-paused");
        break;
      case "amber":
        expect(innerBar?.className).toContain("bg-status-caution");
        break;
      case "red":
        expect(innerBar?.className).toContain("bg-status-offtrack");
        break;
      case "green":
        expect(innerBar?.className).toContain("bg-status-ontrack");
        break;
    }
  });
};

export const assertPrivacyIndicator = async (
  canvasElement: StoryCanvas,
  step: StoryStep,
  name: string,
  message: string,
) => {
  const canvas = within(canvasElement);

  await step("Assert privacy indicator", async () => {
    const row = canvas.getByText(name).closest("tr");

    const privacyIndicator = within(row as HTMLElement).getByTestId("privacy-indicator");
    expect(privacyIndicator).not.toBeNull();

    expect(canvas.queryByText(message)).toBeNull();

    await userEvent.hover(privacyIndicator);

    const tooltipText = canvas.queryAllByText(message);
    expect(tooltipText).not.toBeNull();

    await userEvent.unhover(privacyIndicator);
    expect(canvas.queryByText(message)).toBeNull();
  });
};

export const refutePrivacyIndicator = async (canvasElement: StoryCanvas, step: StoryStep, name: string) => {
  const canvas = within(canvasElement);

  await step("Refute privacy indicator", async () => {
    const row = canvas.getByText(name).closest("tr");

    const privacyIndicator = within(row as HTMLElement).queryByTestId("privacy-indicator");
    expect(privacyIndicator).toBeNull();
  });
};
