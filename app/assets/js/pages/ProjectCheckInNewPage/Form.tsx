import React from "react";

import { Person } from "@/models/people";
import { parseCheckInsForTurboUi, usePostProjectCheckIn, ProjectCheckInStatus } from "@/models/projectCheckIns";
import { Project } from "@/models/projects";
import { useNavigate } from "react-router";

import { useFormattedTimePreferences } from "@/hooks/useFormattedTimePreferences";
import { useRichEditorHandlers } from "@/hooks/useRichEditorHandlers";
import { useScheduleFlow } from "@/hooks/useScheduleFlow";
import { useSubscriptionsAdapter } from "@/models/subscriptions";
import {
  ActionLink,
  FormattedTime,
  Forms,
  GhostButton,
  Link,
  RichContent,
  ScheduleFlowControls,
  Spacer,
  StatusBadge,
  SubscribersSelector,
  type FormState,
} from "turboui";
import { assertPresent } from "@/utils/assertions";

import { usePaths } from "@/routes/paths";
import { t } from "@/i18n";
import { Trans } from "react-i18next";

export function Form({ project }: { project: Project }) {
  const paths = usePaths();
  const { mentionedPersonLookup } = useRichEditorHandlers();
  assertPresent(project.potentialSubscribers, "potentialSubscribers must be present in project");

  const [post] = usePostProjectCheckIn();
  const navigate = useNavigate();
  const scheduleFlow = useScheduleFlow();
  const lastCheckIns = project.lastCheckIn ? parseCheckInsForTurboUi(paths, [project.lastCheckIn]) : [];

  const subscriptionsState = useSubscriptionsAdapter(project.potentialSubscribers, {
    ignoreMe: true,
    notifyPrioritySubscribers: true,
    projectName: project.name,
  });

  const form = Forms.useForm<{
    status: ProjectCheckInStatus | null;
    description: any;
  }>({
    fields: {
      status: null,
      description: null,
    },
    validate: (addError) => {
      if (!form.values.status) {
        addError("status", "Status is required");
      }
      if (!form.values.description) {
        addError("description", "Description is required");
      }
    },
    cancel: () => {
      navigate(paths.projectCheckInsPath(project.id!));
    },
    submit: async (action: "submit" | "draft" | "schedule" = "submit") => {
      const status = form.values.status;
      const description = form.values.description;
      if (!status || !description) return;

      const shouldSchedule = action === "schedule" || (action === "submit" && scheduleFlow.isScheduledLocally);

      const res = await post({
        projectId: project.id,
        status,
        description: JSON.stringify(description),
        postAsDraft: action === "draft",
        sendNotificationsToEveryone: subscriptionsState.notifyEveryone,
        subscriberIds: subscriptionsState.currentSubscribersList,
        scheduledAt: shouldSchedule ? scheduleFlow.scheduledAtIso : undefined,
      });

      navigate(paths.projectCheckInPath(res.checkIn.id));
    },
  });

  return (
    <Forms.Form form={form}>
      <Header />

      <Forms.FieldGroup>
        <StatusSection reviewer={project.reviewer || undefined} />
        <DescriptionSection
          project={project}
          lastCheckIns={lastCheckIns}
          mentionedPersonLookup={mentionedPersonLookup}
        />
      </Forms.FieldGroup>

      <Spacer size={4} />

      <SubscribersSelector {...subscriptionsState} />

      <Forms.FormError message={t("pages.projectCheckInNewPage.fillOutAllTheRequiredFields")} className="-mb-6 mt-4" />

      <SubmitButtons form={form} scheduleFlow={scheduleFlow} />
    </Forms.Form>
  );
}

function SubmitButtons({
  form,
  scheduleFlow,
}: {
  form: FormState<{ status: ProjectCheckInStatus | null; description: any }>;
  scheduleFlow: ReturnType<typeof useScheduleFlow>;
}) {
  const formattedTimePreferences = useFormattedTimePreferences();
  const submit = (action: "submit" | "draft" | "schedule") => {
    form.actions.setTrigger(action);
    form.actions.submit(action);
  };

  const isSubmitting = form.state === "submitting";

  return (
    <div className="mt-8">
      <ScheduleFlowControls
        scheduleFlow={scheduleFlow}
        primaryLabel={t("pages.projectCheckInNewPage.submit")}
        onPrimaryClick={() => submit(scheduleFlow.isScheduledLocally ? "schedule" : "submit")}
        loading={isSubmitting && (form.trigger === "submit" || form.trigger === "schedule")}
        testId="submit"
        formattedTimePreferences={formattedTimePreferences}
        modalTitle={t("pages.projectCheckInNewPage.scheduleCheckIn")}
        secondaryAction={
          <GhostButton
            loading={isSubmitting && form.trigger === "draft"}
            testId="save-as-draft"
            size="base"
            onClick={() => submit("draft")}
          >
            {t("pages.projectCheckInNewPage.saveAsDraft")}
          </GhostButton>
        }
      />
    </div>
  );
}

function Header() {
  return (
    <div>
      <div className="text-2xl font-bold mx-auto">{t("pages.projectCheckInNewPage.letSCheckIn")}</div>
    </div>
  );
}

function StatusSection({ reviewer }: { reviewer?: Person }) {
  return (
    <div className="mt-8 mb-4">
      <Forms.SelectStatus
        label={t("pages.projectCheckInNewPage.1HowSTheProjectGoing")}
        field="status"
        reviewer={reviewer}
        options={["on_track", "caution", "off_track"]}
      />
    </div>
  );
}

function DescriptionSection({
  project,
  lastCheckIns,
  mentionedPersonLookup,
}: {
  project: Project;
  lastCheckIns: ReturnType<typeof parseCheckInsForTurboUi>;
  mentionedPersonLookup: ReturnType<typeof useRichEditorHandlers>["mentionedPersonLookup"];
}) {
  const richTextHandlers = useRichEditorHandlers({ scope: { type: "project", id: project.id! } });
  const [showPrevious, setShowPrevious] = React.useState(false);

  return (
    <div>
      <DescriptionLabel
        hasPreviousCheckIn={lastCheckIns.length > 0}
        showPrevious={showPrevious}
        onToggle={() => setShowPrevious((show) => !show)}
      />

      {showPrevious && <PreviousCheckIn checkIns={lastCheckIns} mentionedPersonLookup={mentionedPersonLookup} />}

      <Forms.RichTextArea
        field="description"
        richTextHandlers={richTextHandlers}
        placeholder={t("pages.projectCheckInNewPage.writeYourCheckInHere")}
      />
    </div>
  );
}

function DescriptionLabel({
  hasPreviousCheckIn,
  showPrevious,
  onToggle,
}: {
  hasPreviousCheckIn: boolean;
  showPrevious: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
      <div className="font-bold">2. What's new since the last check-in?</div>

      {hasPreviousCheckIn && (
        <ActionLink className="text-sm font-medium" underline="hover" onClick={onToggle}>
          {showPrevious ? "Hide previous check-in" : "Show previous check-in"}
        </ActionLink>
      )}
    </div>
  );
}

function PreviousCheckIn({
  checkIns,
  mentionedPersonLookup,
}: {
  checkIns: ReturnType<typeof parseCheckInsForTurboUi>;
  mentionedPersonLookup: ReturnType<typeof useRichEditorHandlers>["mentionedPersonLookup"];
}) {
  const formattedTimePreferences = useFormattedTimePreferences();
  const checkIn = checkIns[0];
  if (!checkIn) return null;

  return (
    <div className="mb-3 mt-2 rounded border border-stroke-base p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-content-accent">
            {t("pages.projectCheckInNewPage.previousCheckIn")}
          </div>
          <div className="mt-0.5 text-sm text-content-dimmed">
            <Trans
              i18nKey="pages.projectCheckInNewPage.postedByOn"
              values={{ v1: checkIn.author?.fullName || t("pages.projectCheckInNewPage.unknown") }}
              components={[<FormattedTime {...formattedTimePreferences} time={checkIn.date} format="long-date" />]}
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <StatusBadge status={checkIn.status} hideIcon />
          <Link to={checkIn.link} underline="hover" className="text-sm font-medium">
            {t("pages.projectCheckInNewPage.viewOriginal")}
          </Link>
        </div>
      </div>

      <RichContent content={checkIn.content} mentionedPersonLookup={mentionedPersonLookup} />
    </div>
  );
}
