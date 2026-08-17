import NotFoundPage from "@/pages/NotFoundPage";
import * as React from "react";

import { captureException } from "@sentry/react";
import axios, { AxiosError } from "axios";
import { useRouteError, useRouteLoaderData } from "react-router";
import { GhostButton } from "turboui";

import { usePaths } from "@/routes/paths";
import { t } from "@/i18n";
export default function ErrorPage() {
  const error = useRouteError() as AxiosError | null;

  if (error && error["status"] === 404) {
    return <NotFoundPage.Page />;
  } else {
    return <ServerErrorPage />;
  }
}

function ServerErrorPage() {
  const error = useRouteError() as AxiosError | null;
  const data = useRouteLoaderData("companyRoot") as { company: { id: string | null } };

  React.useEffect(() => {
    if (!error) return;

    console.error(error);
    if (!axios.isAxiosError(error)) {
      captureException(error, { level: "fatal" });
    }
  }, [error]);

  return (
    <div className="absolute inset-0 flex justify-center items-center gap-16">
      <div className="flex flex-col text-center -mt-64">
        <div className="font-extrabold" style={{ fontSize: "10rem" }}>
          500
        </div>
        <div className="text-3xl font-bold mt-4">{t("app.errorPage.oopsSomethingWentWrong")}</div>
        <div className="text-lg font-medium my-4">{t("app.errorPage.anUnexpectedErrorHasOccurred")}</div>

        {data && data.company ? <LinkToHome /> : <LinkToLobby />}
        <StackTrace />
      </div>
    </div>
  );
}

function LinkToHome() {
  const paths = usePaths();

  return (
    <div className="flex w-full justify-center mt-4">
      <GhostButton linkTo={paths.homePath()} testId="back-to-lobby">
        {t("app.errorPage.goBackToHome")}
      </GhostButton>
    </div>
  );
}

function LinkToLobby() {
  return (
    <div className="flex w-full justify-center mt-4">
      <GhostButton linkTo={"/"} testId="back-to-lobby">
        {t("app.errorPage.goBackToLobby")}
      </GhostButton>
    </div>
  );
}

function StackTrace() {
  const error = useRouteError() as Error | null;
  const env = window.appConfig.environment;

  if (env !== "dev" && env !== "test") return null;

  return (
    <div className="mt-8 bg-surface-base text-left p-4">
      <div className="font-bold mb-4">{t("app.errorPage.errorStackTrace")}</div>

      <pre className="text-sm font-mono whitespace-pre-wrap">{error!.stack}</pre>

      <div className="mt-4 text-sm">{t("app.errorPage.thisErrorIsVisibleOnlyIn")}</div>
    </div>
  );
}
