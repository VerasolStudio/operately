import * as React from "react";
import { IconFile } from "../icons";
import { t } from "../i18n";

function ZeroNodes({ message }: { message: string }) {
  return (
    <div className="border border-dashed border-stroke-base p-4 w-[500px] mx-auto mt-12 flex gap-4">
      <IconFile size={48} className="text-gray-600" />
      <div>
        <div className="font-bold">{t("turboui.resourceHub.readyForYourFirstDocument")}</div>
        <br />
        <div>{message}</div>
      </div>
    </div>
  );
}

export function HubZeroNodes() {
  return <ZeroNodes message={t("turboui.resourceHub.yourTeamSCentralHubFor")} />;
}

export function FolderZeroNodes() {
  return <ZeroNodes message={t("turboui.resourceHub.thisFolderIsEmptyClickAdd")} />;
}
