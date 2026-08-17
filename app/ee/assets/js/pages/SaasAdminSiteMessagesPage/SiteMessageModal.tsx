import { useDebouncedValue } from "@/ee/hooks/useDebouncedValue";
import * as AdminApi from "@/ee/admin_api";
import * as React from "react";

import { useRichEditorHandlers } from "@/hooks/useRichEditorHandlers";
import classNames from "classnames";
import { emptyContent, Forms, IconSearch, IconX, Modal, parseContent } from "turboui";
import { t } from "@/i18n";

const SEARCH_DEBOUNCE_MS = 250;

interface SiteMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  message?: AdminApi.SiteMessage;
}

export function SiteMessageModal({ isOpen, onClose, onSuccess, message }: SiteMessageModalProps) {
  const [create] = AdminApi.useCreateSiteMessage();
  const [update] = AdminApi.useUpdateSiteMessage();
  const isEdit = message !== undefined;
  const richTextHandlers = useRichEditorHandlers();

  const form = Forms.useForm({
    fields: {
      title: message?.title ?? "",
      description: message?.description ? parseContent(message.description) : emptyContent(),
      audience: message?.allCompanies ? "all" : "specific",
      active: message?.active === false ? "false" : "true",
      expiresAt: dateInputFromExpiresAt(message?.expiresAt),
      companyIds: message?.companyIds ?? [],
    },
    cancel: onClose,
    submit: async () => {
      const payload = {
        title: form.values.title,
        description: JSON.stringify(form.values.description),
        allCompanies: form.values.audience === "all",
        active: form.values.active === "true",
        expiresAt: expiresAtFromDateInput(form.values.expiresAt),
        companyIds: form.values.audience === "all" ? [] : form.values.companyIds,
      };

      const result = isEdit
        ? await update({
            id: message.id,
            ...payload,
          })
        : await create(payload);

      if (result?.message) {
        form.actions.reset();
        onClose();
        onSuccess();
      }
    },
  });

  return (
    <Modal title={isEdit ? "Edit message" : "Create message"} isOpen={isOpen} onClose={onClose} size="large">
      <Forms.Form form={form}>
        <Forms.FieldGroup>
          <Forms.TextInput field="title" label={t("pages.saasAdminSiteMessagesPage.title")} required autoFocus />
          <Forms.RichTextArea
            field="description"
            label={t("pages.saasAdminSiteMessagesPage.description")}
            required
            richTextHandlers={richTextHandlers}
          />

          <Forms.SelectBox
            field="audience"
            label={t("pages.saasAdminSiteMessagesPage.audience")}
            options={[
              { value: "all", label: t("pages.saasAdminSiteMessagesPage.allCompanies") },
              { value: "specific", label: t("pages.saasAdminSiteMessagesPage.specificCompanies") },
            ]}
            required
          />

          {form.values.audience === "specific" ? (
            <CompanyPicker
              selectedCompanyIds={form.values.companyIds}
              onChange={(companyIds) => form.actions.setValue("companyIds", companyIds)}
              error={form.errors.companyIds}
            />
          ) : null}

          <Forms.SelectBox
            field="active"
            label={t("pages.saasAdminSiteMessagesPage.status")}
            options={[
              { value: "true", label: t("pages.saasAdminSiteMessagesPage.active") },
              { value: "false", label: t("pages.saasAdminSiteMessagesPage.inactive") },
            ]}
            required
          />

          <Forms.TextInput
            field="expiresAt"
            label={t("pages.saasAdminSiteMessagesPage.expiresOn")}
            placeholder={t("pages.saasAdminSiteMessagesPage.yYYYMMDD")}
          />
          <div className="text-xs text-content-subtle">
            {t("pages.saasAdminSiteMessagesPage.optionalLeaveBlankToShowUntil")}
          </div>
        </Forms.FieldGroup>

        <Forms.Submit
          saveText={isEdit ? "Save changes" : "Create message"}
          cancelText={t("pages.saasAdminSiteMessagesPage.cancel")}
        />
      </Forms.Form>
    </Modal>
  );
}

function CompanyPicker({
  selectedCompanyIds,
  onChange,
  error,
}: {
  selectedCompanyIds: string[];
  onChange: (companyIds: string[]) => void;
  error?: string;
}) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const debouncedSearchQuery = useDebouncedValue(searchQuery, SEARCH_DEBOUNCE_MS);
  const { data, loading, error: loadError } = AdminApi.useGetCompanies({});

  const companies = data?.companies ?? [];
  const filteredCompanies = filterCompanies(companies, debouncedSearchQuery);
  const selectedCompanies = companies.filter((company) => company.id && selectedCompanyIds.includes(company.id));

  const toggleCompany = (companyId: string) => {
    if (selectedCompanyIds.includes(companyId)) {
      onChange(selectedCompanyIds.filter((id) => id !== companyId));
    } else {
      onChange([...selectedCompanyIds, companyId]);
    }
  };

  return (
    <Forms.InputField field="companyIds" label={t("pages.saasAdminSiteMessagesPage.companies")} error={error}>
      <div className="space-y-3">
        {selectedCompanies.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedCompanies.map((company) => (
              <button
                key={company.id}
                type="button"
                className="inline-flex items-center gap-1 rounded-full border border-surface-outline bg-surface-dimmed px-3 py-1 text-sm text-content-base"
                onClick={() => toggleCompany(company.id!)}
              >
                <span>{company.name}</span>
                <IconX size={14} />
              </button>
            ))}
          </div>
        ) : (
          <div className="text-sm text-content-subtle">
            {t("pages.saasAdminSiteMessagesPage.noCompaniesSelectedYet")}
          </div>
        )}

        <div className="flex items-center gap-2 rounded-lg border border-surface-outline px-3 py-2">
          <IconSearch size={16} className="shrink-0 text-content-dimmed" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={t("pages.saasAdminSiteMessagesPage.searchCompanies")}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            data-test-id="site-message-company-search"
          />
        </div>

        <div className="max-h-48 overflow-y-auto rounded-lg border border-surface-outline">
          {loading ? (
            <div className="px-3 py-2 text-sm text-content-subtle">
              {t("pages.saasAdminSiteMessagesPage.loadingCompanies")}
            </div>
          ) : null}
          {loadError ? (
            <div className="px-3 py-2 text-sm text-red-500">
              {t("pages.saasAdminSiteMessagesPage.failedToLoadCompanies")}
            </div>
          ) : null}
          {!loading && filteredCompanies.length === 0 ? (
            <div className="px-3 py-2 text-sm text-content-subtle">
              {t("pages.saasAdminSiteMessagesPage.noCompaniesMatchYourSearch")}
            </div>
          ) : null}
          {filteredCompanies.map((company) => {
            const selected = company.id ? selectedCompanyIds.includes(company.id) : false;

            return (
              <button
                key={company.id}
                type="button"
                className={classNames(
                  "flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-surface-highlight",
                  selected && "bg-surface-dimmed",
                )}
                onClick={() => company.id && toggleCompany(company.id)}
              >
                <span>{company.name}</span>
                {selected ? (
                  <span className="text-xs text-content-subtle">{t("pages.saasAdminSiteMessagesPage.selected")}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </Forms.InputField>
  );
}

function filterCompanies(companies: AdminApi.Company[], searchQuery: string) {
  const normalized = searchQuery.trim().toLowerCase();
  if (!normalized) return companies;

  return companies.filter((company) => company.name?.toLowerCase().includes(normalized));
}

function dateInputFromExpiresAt(expiresAt?: string | null) {
  if (!expiresAt) return "";
  return expiresAt.slice(0, 10);
}

function expiresAtFromDateInput(date: string) {
  if (!date.trim()) return undefined;
  return new Date(`${date}T23:59:59.000Z`).toISOString();
}
