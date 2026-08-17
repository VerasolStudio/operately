import * as React from "react";
import * as People from "@/models/people";

import { Avatar } from "turboui";

import { useLoadedData } from "./loader";
import { Section } from "./Section";
import { t } from "@/i18n";

export function CompanyAdmins() {
  const { company } = useLoadedData();

  if (!company.admins) return null;
  if (company.admins.length === 0) return null;

  return (
    <Section title={t("pages.companyAdminPage.administrators")}>
      <PeopleList people={company.admins || []} />
    </Section>
  );
}

export function CompanyOwners() {
  const { company } = useLoadedData();

  if (!company.owners) return null;
  if (company.owners.length === 0) return null;

  return (
    <Section title={t("pages.companyAdminPage.accountOwners")}>
      <PeopleList people={company.owners || []} />
    </Section>
  );
}

function PeopleList({ people }: { people: People.Person[] }) {
  return (
    <div className="flex flex-wrap gap-4">
      {people.map((owner) => (
        <Person key={owner.id} person={owner} />
      ))}
    </div>
  );
}

function Person({ person }: { person: People.Person }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar person={person} size="small" />
      <div className="font-medium">{person.fullName}</div>
    </div>
  );
}
