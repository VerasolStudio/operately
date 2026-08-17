import React from "react";

import { PrimaryButton } from "../Button";
import { Page } from "../Page";
import { PrivacyField } from "../PrivacyField";
import { SpaceField } from "../SpaceField";
import { TextField } from "../TextField";
import { showErrorToast } from "../Toasts";
import { BlackLink } from "../Link";
import { t } from "../i18n";
import { Trans } from "react-i18next";

export function GoalAddPage(props: GoalAddForm.Props) {
  const title = props.parentGoal ? "Add a subgoal" : "Add a new goal";

  return (
    <Page title={title} testId="goal-add-page" size="small">
      <div className="p-8">
        <GoalAddForm {...props} />
      </div>
    </Page>
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

export function GoalAddForm(props: GoalAddForm.Props) {
  const state = useFormState(props);
  const title = props.parentGoal ? "Add a subgoal" : "Add a new goal";

  return (
    <div>
      <h1 className="font-bold text-xl">{title}</h1>
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

      <div className="mt-4 flex flex-col gap-4">
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

        <PrivacyField
          accessLevels={state.accessLevels}
          setAccessLevels={state.setAccessLevels}
          resourceType={"goal"}
          variant="form-field"
          label={t("turboui.goalAddForm.privacy")}
        />
      </div>

      <div className="mt-6 flex items-center gap-2">
        <PrimaryButton onClick={state.submit} loading={state.submitting} testId="submit" size="sm">
          {t("turboui.goalAddForm.addGoal")}
        </PrimaryButton>
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
