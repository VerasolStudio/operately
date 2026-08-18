import * as Pages from "@/components/Pages";
import * as React from "react";

import { Person } from "@/models/people";
import { Avatar, DesignKit, SecondaryButton } from "turboui";
import { useLoadedData } from "./loader";

import { usePaths } from "@/routes/paths";
import { t } from "@/i18n";

/**
 * The company directory.
 *
 * A two-column grid of cards looked generous but made the list unreadable past
 * about a dozen people: names zig-zag, and there is no column to scan. A table
 * with the name on the left puts every name on the same vertical line, which
 * is the whole job of a directory.
 */
export function Page() {
  const paths = usePaths();
  const { company, people } = useLoadedData();

  return (
    <Pages.Page title={t("pages.peoplePage.people")} testId="people-page">
      <div className="min-h-full bg-surface-base">
        <DesignKit.PageHead
          crumbs={[{ label: company.name!, to: paths.homePath() }, { label: t("pages.peoplePage.people") }]}
          title={t("pages.peoplePage.people")}
          subtitle={t("pages.peoplePage.memberCount", { count: people.length })}
          actions={
            <SecondaryButton size="sm" linkTo={paths.companyManagePeoplePath()}>
              {t("pages.peoplePage.managePermissions")}
            </SecondaryButton>
          }
        />

        <DesignKit.PageBody width="wide">
          <PeopleTable people={people} />
        </DesignKit.PageBody>
      </div>
    </Pages.Page>
  );
}

function PeopleTable({ people }: { people: Person[] }) {
  const paths = usePaths();

  return (
    <DesignKit.Table
      columns={[
        { label: t("pages.peoplePage.name"), width: "44%" },
        { label: t("pages.peoplePage.title"), width: "28%" },
        { label: t("pages.peoplePage.email"), width: "28%", hideOnMobile: true },
      ]}
    >
      {people.map((person, index) => (
        <DesignKit.Row key={person.id} index={index} to={paths.profilePath(person.id!)} testId={"person-" + person.id!}>
          <DesignKit.Cell first>
            <div className="flex items-center gap-3">
              <Avatar person={person} size={32} />
              <span className="min-w-0 truncate text-sm font-medium text-content-strong">{person.fullName}</span>
            </div>
          </DesignKit.Cell>
          <DesignKit.Cell className="truncate">{person.title}</DesignKit.Cell>
          <DesignKit.Cell hideOnMobile last className="truncate text-content-subtle">
            {person.email}
          </DesignKit.Cell>
        </DesignKit.Row>
      ))}
    </DesignKit.Table>
  );
}
