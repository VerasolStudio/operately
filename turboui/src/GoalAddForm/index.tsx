import React from "react";

import { PrimaryButton, SecondaryButton } from "../Button";
import { PageBody, PageHead, Screen } from "../DesignKit/Layout";
import { IconChevronDown } from "../icons";
import { Expandable, SNAP, motion } from "../Motion";
import { PrivacyField } from "../PrivacyField";
import { SpaceField } from "../SpaceField";
import { TextField } from "../TextField";
import { showErrorToast } from "../Toasts";
import { BlackLink } from "../Link";
import { t } from "../i18n";
import { Trans } from "react-i18next";

export function GoalAddPage(props: GoalAddForm.Props) {
  const title = props.parentGoal ? t("turboui.goalAddForm.addSubgoal") : t("turboui.goalAddForm.addNewGoal");

  return (
    <Screen title={title} testId="goal-add-page">
      <PageHead title={title} subtitle={t("turboui.goalAddForm.subtitle")} />

      <PageBody width="narrow">
        <GoalAddForm {...props} />
      </PageBody>
    </Screen>
  );
}

//
// Form definition for adding a goal
//

export namespace GoalAddForm {
  export interface ParentGoal {
    id: string;
    name: string;
    link: string;
  }

  export interface SaveProps {
    name: string;
    spaceId: string;
    accessLevels: PrivacyField.AccessLevels;
  }

  export interface Props {
    space?: SpaceField.Space | null;
    spaceSearch: SpaceField.SearchSpaceFn;
    parentGoal?: ParentGoal | null;

    save: (props: SaveProps) => Promise<{ id: string }>;
    onSuccess?: (id: string) => void;
    /** Where "Cancel" goes back to. */
    cancelLink?: string;
  }

  export interface State {
    name: string;
    setName: (name: string) => void;
    space: SpaceField.Space | null;
    setSpace: (space: SpaceField.Space | null) => void;
    nameError: string | undefined;
    spaceError: string | undefined;
    spaceSearch: SpaceField.SearchSpaceFn;
    accessLevels: PrivacyField.AccessLevels;
    setAccessLevels: (levels: PrivacyField.AccessLevels) => void;
    submit: () => Promise<void>;
    submitting: boolean;
  }
}

/**
 * The goal creation form.
 *
 * Only the name and the space are asked for up front; visibility sits behind
 * "More options" with its current value summarised on the line. Creating a
 * goal is the moment someone is least sure of the details, and a form that
 * asks for six of them is a form people put off filling in.
 */
export function GoalAddForm(props: GoalAddForm.Props) {
  const state = useFormState(props);
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  return (
    <div>
      {props.parentGoal && (
        <div className="text-xs text-content-dimmed">
          <Trans
            i18nKey="turboui.goalAddForm.addingUnder"
            values={{ v1: props.parentGoal.name }}
            components={[
              <BlackLink to={props.parentGoal.link} className="font-medium" underline="hover">
                {props.parentGoal.name}
              </BlackLink>,
            ]}
          />
        </div>
      )}

      <div className="flex flex-col gap-[18px]">
        <TextField
          autofocus
          label={t("turboui.goalAddForm.name")}
          variant="form-field"
          placeholder={t("turboui.goalAddForm.whatDoYouWantToAchieve")}
          text={state.name}
          onChange={state.setName}
          error={state.nameError}
          testId="goal-name"
        />

        <SpaceField
          label={t("turboui.goalAddForm.space")}
          space={state.space}
          setSpace={state.setSpace}
          search={state.spaceSearch}
          variant="form-field"
          testId="space-field"
          error={state.spaceError}
        />

        <div className="border-t border-surface-outline pt-4">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 text-left"
            onClick={() => setShowAdvanced((value) => !value)}
            aria-expanded={showAdvanced}
            data-test-id="goal-advanced-options"
          >
            <span>
              <span className="block text-[13px] font-semibold text-content-strong">
                {t("turboui.goalAddForm.moreOptions")}
              </span>
              <span className="mt-0.5 block text-xs text-content-subtle">{t("turboui.goalAddForm.privacy")}</span>
            </span>

            <motion.span animate={{ rotate: showAdvanced ? 180 : 0 }} transition={SNAP} className="text-content-label">
              <IconChevronDown size={16} />
            </motion.span>
          </button>

          <Expandable open={showAdvanced}>
            <div className="pt-4">
              <PrivacyField
                accessLevels={state.accessLevels}
                setAccessLevels={state.setAccessLevels}
                resourceType={"goal"}
                variant="form-field"
                label={t("turboui.goalAddForm.privacy")}
              />
            </div>
          </Expandable>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2.5">
        <PrimaryButton onClick={state.submit} loading={state.submitting} testId="submit" size="sm">
          {t("turboui.goalAddForm.addGoal")}
        </PrimaryButton>

        {props.cancelLink && (
          <SecondaryButton linkTo={props.cancelLink} size="sm">
            {t("turboui.goalAddForm.cancel")}
          </SecondaryButton>
        )}
      </div>
    </div>
  );
}

function useFormState(props: GoalAddForm.Props): GoalAddForm.State {
  const [name, setName] = React.useState("");
  const [space, setSpace] = React.useState<SpaceField.Space | null>(props.space || null);
  const [nameError, setNameError] = React.useState<string | undefined>(undefined);
  const [spaceError, setSpaceError] = React.useState<string | undefined>(undefined);
  const [accessLevels, setAccessLevels] = React.useState<PrivacyField.AccessLevels>({
    company: "edit",
    space: "edit",
  });

  const [submitting, setSubmitting] = React.useState(false);

  const validate = (): boolean => {
    let ok = true;

    if (name.trim() === "") {
      setNameError("Cannot be empty");
      ok = false;
    } else {
      setNameError(undefined);
    }

    if (!space) {
      setSpaceError("Please select a space");
      ok = false;
    } else {
      setSpaceError(undefined);
    }

    return ok;
  };

  const submit = async () => {
    setSubmitting(true);

    try {
      if (!validate()) {
        return;
      }

      const res = await props.save({
        name: name.trim(),
        spaceId: space!.id,
        accessLevels,
      });

      setNameError(undefined);
      setSpaceError(undefined);

      props.onSuccess?.(res.id);
    } catch (error) {
      console.error("Failed to create goal:", error);
      showErrorToast(t("turboui.goalAddForm.networkError"), t("turboui.goalAddForm.failedToCreateTheGoal"));
    } finally {
      setSubmitting(false);
    }
  };

  return {
    name,
    setName,
    space,
    setSpace,
    nameError,
    spaceError,
    spaceSearch: props.spaceSearch,
    accessLevels,
    setAccessLevels,
    submit,
    submitting,
  };
}
