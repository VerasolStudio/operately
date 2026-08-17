import * as Pages from "@/components/Pages";
import * as Paper from "@/components/PaperContainer";
import * as Spaces from "@/models/spaces";
import * as React from "react";

import { PageModule } from "@/routes/types";
import { useNavigate } from "react-router";

import { Forms } from "turboui";

import { usePaths } from "@/routes/paths";
import { t } from "@/i18n";
export default { name: "SpaceEditPage", loader, Page } as PageModule;

interface LoaderResult {
  space: Spaces.Space;
}

async function loader({ params }): Promise<LoaderResult> {
  return {
    space: await Spaces.getSpace({ id: params.id }),
  };
}

function Page() {
  const paths = usePaths();
  const navigate = useNavigate();
  const { space } = Pages.useLoadedData<LoaderResult>();

  const [edit] = Spaces.useEditSpace();
  const backPath = paths.spacePath(space.id!);

  const form = Forms.useForm({
    fields: {
      name: space.name || "",
      purpose: space.mission || "",
    },
    submit: async () => {
      await edit({
        id: space.id!,
        name: form.values.name,
        mission: form.values.purpose,
      });

      navigate(backPath);
    },
    cancel: () => navigate(backPath),
  });

  return (
    <Pages.Page title={["Edit Space", space.name!]}>
      <Paper.Root size="small">
        <Paper.Body minHeight="none">
          <Forms.Form form={form}>
            <div className="font-extrabold text-2xl text-center mb-4">Editing {space.name}</div>
            <Forms.FieldGroup layout="vertical">
              <Forms.TextInput label={t("pages.spaceEditPage.name")} field={"name"} />
              <Forms.TextInput label={t("pages.spaceEditPage.purpose")} field={"purpose"} />
            </Forms.FieldGroup>
            <Forms.Submit saveText={t("pages.spaceEditPage.save")} />
          </Forms.Form>
        </Paper.Body>
      </Paper.Root>
    </Pages.Page>
  );
}
