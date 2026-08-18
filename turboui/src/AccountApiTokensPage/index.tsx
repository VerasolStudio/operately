import React from "react";

import { DangerButton, PrimaryButton, SecondaryButton } from "../Button";
import { WarningCallout } from "../Callouts";
import { CopyToClipboard } from "../CopyToClipboard";
import { FormattedTime, type FormattedTimePreferences } from "../FormattedTime";
import { IconPencil, IconSwitch, IconTrash } from "../icons";
import { Link } from "../Link";
import { Menu, MenuActionItem } from "../Menu";
import { Modal } from "../Modal";
import { Page } from "../Page";
import { SwitchToggle } from "../SwitchToggle";
import { createTestId } from "../TestableElement";
import { t } from "../i18n";

export namespace AccountApiTokensPage {
  export interface Token {
    id: string;
    readOnly: boolean;
    name?: string | null;
    insertedAt?: string | null;
    lastUsedAt?: string | null;
  }

  export type PendingAction = "toggling" | "deleting" | "renaming";

  export interface Props {
    tokens: Token[];

    newTokenReadOnly: boolean;
    setNewTokenReadOnly: (value: boolean) => void;
    creatingToken: boolean;
    onCreateToken: () => void;
    onDismissNewlyCreatedToken: () => void;

    newlyCreatedToken: string | null;

    pendingTokenActions: Record<string, PendingAction | undefined>;
    onToggleReadOnly: (tokenId: string, readOnly: boolean) => void;
    onDeleteToken: (tokenId: string) => void;
    onUpdateName: (tokenId: string, name: string) => Promise<boolean>;

    homePath: string;
    securityPath: string;
    usagePath: string;
    formattedTimePreferences: FormattedTimePreferences;
  }
}

export function AccountApiTokensPage(props: AccountApiTokensPage.Props) {
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  const navigation = React.useMemo(
    () => [
      { to: props.homePath, label: t("turboui.accountApiTokensPage.home") },
      { to: props.securityPath, label: t("turboui.accountApiTokensPage.passwordSecurity") },
    ],
    [props.homePath, props.securityPath],
  );

  const openCreateModal = React.useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const closeCreateModal = React.useCallback(() => {
    setIsCreateModalOpen(false);
    props.onDismissNewlyCreatedToken();
  }, [props.onDismissNewlyCreatedToken]);

  return (
    <Page
      title={t("turboui.accountApiTokensPage.aPITokens")}
      size="small"
      testId="account-api-tokens-page"
      navigation={navigation}
    >
      <div className="px-4 sm:px-10 py-8">
        <header>
          <h1 className="m-0 text-2xl font-semibold tracking-[-0.01em] text-content-strong">{t("turboui.accountApiTokensPage.aPITokens")}</h1>
          <p className="text-sm text-content-dimmed mt-2">
            {t("turboui.accountApiTokensPage.useAPITokensToAccessOperately")}
          </p>
        </header>

        <section className="mt-10" data-test-id="create-api-token-section">
          <h2 className="font-bold">{t("turboui.accountApiTokensPage.createAToken")}</h2>
          <p className="text-sm text-content-dimmed mt-1">
            {t("turboui.accountApiTokensPage.readOnlyTokensCanCallQueries")}
          </p>

          <div className="mt-3">
            <PrimaryButton onClick={openCreateModal} testId="open-create-api-token-modal" size="sm">
              {t("turboui.accountApiTokensPage.createAPIToken")}
            </PrimaryButton>
          </div>

          <div className="mt-4 text-xs">
            <Link to={props.usagePath} underline="hover" testId="view-api-token-usage">
              {t("turboui.accountApiTokensPage.viewAPIUsageInstructions")}
            </Link>
          </div>
        </section>

        <section className="mt-10" data-test-id="existing-api-tokens-section">
          <h2 className="font-bold">{t("turboui.accountApiTokensPage.existingTokens")}</h2>
          <p className="text-sm text-content-dimmed mt-1">
            {t("turboui.accountApiTokensPage.manageAndRevokeYourActiveAPI")}
          </p>

          {props.tokens.length === 0 ? (
            <div className="text-sm text-content-dimmed rounded-md border border-stroke-base p-4 mt-3">
              {t("turboui.accountApiTokensPage.noAPITokensCreatedYet")}
            </div>
          ) : (
            <TokenList
              tokens={props.tokens}
              pendingTokenActions={props.pendingTokenActions}
              onToggleReadOnly={props.onToggleReadOnly}
              onDeleteToken={props.onDeleteToken}
              onUpdateName={props.onUpdateName}
              formattedTimePreferences={props.formattedTimePreferences}
            />
          )}
        </section>
      </div>

      <CreateTokenModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        newTokenReadOnly={props.newTokenReadOnly}
        setNewTokenReadOnly={props.setNewTokenReadOnly}
        creatingToken={props.creatingToken}
        onCreateToken={props.onCreateToken}
        newlyCreatedToken={props.newlyCreatedToken}
      />
    </Page>
  );
}

function CreateTokenModal({
  isOpen,
  onClose,
  newTokenReadOnly,
  setNewTokenReadOnly,
  creatingToken,
  onCreateToken,
  newlyCreatedToken,
}: {
  isOpen: boolean;
  onClose: () => void;
  newTokenReadOnly: boolean;
  setNewTokenReadOnly: (value: boolean) => void;
  creatingToken: boolean;
  onCreateToken: () => void;
  newlyCreatedToken: string | null;
}) {
  const hasCreatedToken = Boolean(newlyCreatedToken);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="small"
      title={t("turboui.accountApiTokensPage.createAPIToken2")}
      testId="create-api-token-modal"
    >
      <div className="space-y-6">
        {!hasCreatedToken && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-medium">{t("turboui.accountApiTokensPage.accessModeForNewToken")}</div>
              <div className="text-sm text-content-dimmed mt-1">
                {newTokenReadOnly ? "Read-only (queries only)" : "Full access (queries + mutations)"}
              </div>
            </div>

            <SwitchToggle
              label={newTokenReadOnly ? "Read-only" : "Full access"}
              value={newTokenReadOnly}
              setValue={setNewTokenReadOnly}
              testId="new-api-token-read-only-toggle"
            />
          </div>
        )}

        {newlyCreatedToken && <NewlyCreatedTokenCard token={newlyCreatedToken} />}

        <div className="flex justify-end gap-4">
          {!hasCreatedToken && (
            <PrimaryButton size="sm" onClick={onCreateToken} loading={creatingToken} testId="create-api-token-button">
              {t("turboui.accountApiTokensPage.createAPIToken")}
            </PrimaryButton>
          )}
          <SecondaryButton size="sm" onClick={onClose} testId="close-create-api-token-modal">
            {t("turboui.accountApiTokensPage.close")}
          </SecondaryButton>
        </div>
      </div>
    </Modal>
  );
}

function NewlyCreatedTokenCard({ token }: { token: string }) {
  return (
    <div data-test-id="new-api-token-card">
      <WarningCallout
        message={t("turboui.accountApiTokensPage.copyTheToken")}
        description={t("turboui.accountApiTokensPage.thisIsTheOnlyTimeThis")}
      />

      <div className="mt-3 rounded-md border border-stroke-base bg-surface-dimmed p-3 flex items-start gap-3">
        <code className="text-xs sm:text-sm font-mono break-all flex-1" data-test-id="new-api-token-value">
          {token}
        </code>

        <CopyToClipboard text={token} size={18} className="shrink-0" testId="copy-new-api-token" />
      </div>
    </div>
  );
}

function TokenList({
  tokens,
  pendingTokenActions,
  onToggleReadOnly,
  onDeleteToken,
  onUpdateName,
  formattedTimePreferences,
}: {
  tokens: AccountApiTokensPage.Token[];
  pendingTokenActions: Record<string, AccountApiTokensPage.PendingAction | undefined>;
  onToggleReadOnly: (tokenId: string, readOnly: boolean) => void;
  onDeleteToken: (tokenId: string) => void;
  onUpdateName: (tokenId: string, name: string) => Promise<boolean>;
  formattedTimePreferences: FormattedTimePreferences;
}) {
  const hasUsageMetadata = tokens.some((token) => token.insertedAt !== undefined || token.lastUsedAt !== undefined);

  return (
    <div className="mt-3">
      <div className="rounded-md border border-stroke-base overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-surface-dimmed text-left">
              <th className="px-3 py-2 font-semibold">{t("turboui.accountApiTokensPage.token")}</th>
              <th className="px-3 py-2 font-semibold">{t("turboui.accountApiTokensPage.access")}</th>
              <th className="px-3 py-2 font-semibold">{t("turboui.accountApiTokensPage.created")}</th>
              <th className="px-3 py-2 font-semibold whitespace-nowrap">
                {t("turboui.accountApiTokensPage.lastUsed")}
              </th>
              <th className="px-3 py-2 text-right">
                <span className="sr-only">{t("turboui.accountApiTokensPage.options")}</span>
              </th>
            </tr>
          </thead>

          <tbody>
            {tokens.map((token, index) => {
              const pendingAction = pendingTokenActions[token.id];

              return (
                <TokenRow
                  key={token.id}
                  token={token}
                  index={index}
                  pendingAction={pendingAction}
                  onToggleReadOnly={onToggleReadOnly}
                  onDeleteToken={onDeleteToken}
                  onUpdateName={onUpdateName}
                  formattedTimePreferences={formattedTimePreferences}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {!hasUsageMetadata && (
        <div className="text-xs text-content-dimmed mt-2">
          {t("turboui.accountApiTokensPage.createdAndLastUsedTimestampsWill")}
        </div>
      )}
    </div>
  );
}

function TokenRow({
  token,
  index,
  pendingAction,
  onToggleReadOnly,
  onDeleteToken,
  onUpdateName,
  formattedTimePreferences,
}: {
  token: AccountApiTokensPage.Token;
  index: number;
  pendingAction: AccountApiTokensPage.PendingAction | undefined;
  onToggleReadOnly: (tokenId: string, readOnly: boolean) => void;
  onDeleteToken: (tokenId: string) => void;
  onUpdateName: (tokenId: string, name: string) => Promise<boolean>;
  formattedTimePreferences: FormattedTimePreferences;
}) {
  const [isRenameModalOpen, setIsRenameModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [nameInput, setNameInput] = React.useState(token.name || "");
  const isPending = Boolean(pendingAction);

  const openRenameModal = React.useCallback(() => {
    if (isPending) return;

    setNameInput(token.name || "");
    setIsRenameModalOpen(true);
  }, [isPending, token.name]);

  const saveName = React.useCallback(async () => {
    if (isPending) return;

    const success = await onUpdateName(token.id, nameInput);

    if (success) {
      setIsRenameModalOpen(false);
    }
  }, [isPending, nameInput, onUpdateName, token.id]);

  const openDeleteModal = React.useCallback(() => {
    if (isPending) return;
    setIsDeleteModalOpen(true);
  }, [isPending]);

  const confirmDelete = React.useCallback(() => {
    if (isPending) return;
    setIsDeleteModalOpen(false);
    onDeleteToken(token.id);
  }, [isPending, onDeleteToken, token.id]);

  return (
    <>
      <tr className="border-t border-stroke-base">
        <td className="px-3 py-3 text-sm">
          <div className="max-w-[220px] sm:max-w-[320px] whitespace-normal break-words">
            {displayTokenName(token, index)}
          </div>
        </td>

        <td className="px-3 py-3 whitespace-nowrap">
          <span className="text-sm">{token.readOnly ? "Read-only" : "Full access"}</span>
        </td>

        <td className="px-3 py-3 text-content-dimmed whitespace-nowrap">
          <Timestamp
            value={token.insertedAt}
            emptyLabel="Not available"
            formattedTimePreferences={formattedTimePreferences}
          />
        </td>

        <td className="px-3 py-3 text-content-dimmed">
          <Timestamp value={token.lastUsedAt} emptyLabel="Never" formattedTimePreferences={formattedTimePreferences} />
        </td>

        <td className="px-3 py-3 text-right">
          <div className="inline-flex">
            <Menu align="end" testId={createTestId("api-token-actions-menu", token.id)}>
              <MenuActionItem
                icon={IconPencil}
                onClick={openRenameModal}
                testId={createTestId("update-api-token-name", token.id)}
              >
                {t("turboui.accountApiTokensPage.updateName")}
              </MenuActionItem>

              <MenuActionItem
                icon={IconSwitch}
                onClick={() => {
                  if (!isPending) onToggleReadOnly(token.id, !token.readOnly);
                }}
                testId={createTestId("api-token-mode-toggle", token.id)}
              >
                {token.readOnly ? "Change to full access" : "Change to read-only"}
              </MenuActionItem>

              <MenuActionItem
                icon={IconTrash}
                onClick={() => {
                  openDeleteModal();
                }}
                danger
                testId={createTestId("delete-api-token", token.id)}
              >
                {t("turboui.accountApiTokensPage.delete")}
              </MenuActionItem>
            </Menu>
          </div>
        </td>
      </tr>

      <RenameTokenModal
        isOpen={isRenameModalOpen}
        name={nameInput}
        onChangeName={setNameInput}
        onClose={() => setIsRenameModalOpen(false)}
        onSave={saveName}
        isSaving={pendingAction === "renaming"}
      />

      <DeleteTokenModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        isDeleting={pendingAction === "deleting"}
        tokenName={displayTokenName(token, index)}
      />
    </>
  );
}

function RenameTokenModal({
  isOpen,
  name,
  onChangeName,
  onClose,
  onSave,
  isSaving,
}: {
  isOpen: boolean;
  name: string;
  onChangeName: (name: string) => void;
  onClose: () => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
}) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="small"
      title={t("turboui.accountApiTokensPage.updateTokenName")}
      testId="update-api-token-name-modal"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <div className="font-bold text-sm mb-1 text-left">{t("turboui.accountApiTokensPage.tokenName")}</div>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm bg-surface-base border-surface-outline"
            value={name}
            onChange={(e) => onChangeName(e.target.value)}
            placeholder={t("turboui.accountApiTokensPage.enterTokenName")}
            data-test-id="update-api-token-name-input"
            autoFocus
          />
        </label>

        <p className="text-xs text-content-dimmed">{t("turboui.accountApiTokensPage.leaveEmptyToClearTheName")}</p>

        <div className="flex justify-end gap-3">
          <SecondaryButton type="button" onClick={onClose} disabled={isSaving} testId="update-api-token-name-cancel">
            {t("turboui.accountApiTokensPage.cancel")}
          </SecondaryButton>

          <PrimaryButton type="submit" loading={isSaving} testId="update-api-token-name-save">
            {t("turboui.accountApiTokensPage.save")}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

function DeleteTokenModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  tokenName,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  tokenName: string;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="small"
      title={t("turboui.accountApiTokensPage.deleteToken")}
      testId="delete-api-token-modal"
    >
      <div className="space-y-4">
        <p className="text-sm text-content-dimmed">
          Delete <span className="font-medium text-content-base">{tokenName}</span>? This cannot be undone.
        </p>

        <div className="flex justify-end gap-3">
          <SecondaryButton type="button" onClick={onClose} disabled={isDeleting} testId="delete-api-token-cancel">
            {t("turboui.accountApiTokensPage.cancel")}
          </SecondaryButton>

          <DangerButton type="button" onClick={onConfirm} loading={isDeleting} testId="delete-api-token-confirm">
            {t("turboui.accountApiTokensPage.delete")}
          </DangerButton>
        </div>
      </div>
    </Modal>
  );
}

function displayTokenName(token: AccountApiTokensPage.Token, index: number) {
  const name = token.name?.trim();
  if (name) return name;

  return `token ${index + 1}`;
}

function Timestamp({
  value,
  emptyLabel,
  formattedTimePreferences,
}: {
  value?: string | null;
  emptyLabel: string;
  formattedTimePreferences: FormattedTimePreferences;
}) {
  if (value === null) return <span>{emptyLabel}</span>;
  if (value === undefined) return <span>-</span>;

  return <FormattedTime {...formattedTimePreferences} time={value} format="relative-time-or-date" />;
}

export default AccountApiTokensPage;
