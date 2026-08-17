defmodule OperatelyEmail.Emails.BillingNearLimitWarningEmail do
  alias Operately.Billing.EnforceLimits.LimitStatus
  alias Operately.People.Person
  alias OperatelyWeb.Paths
  alias OperatelyEmail.Mailers.BaseMailer
  alias OperatelyEmail.Mailers.NotificationMailer
  import OperatelyEmail.I18n, only: [t: 1, t: 2]

  def send([], _company, _status), do: {:ok, :no_recipients}

  def send(recipients, company, %LimitStatus{} = status) do
    build(recipients, company, status)
    |> BaseMailer.deliver_now()
  end

  def build(recipients, company, %LimitStatus{} = status) do
    subject = subject(company, status)
    assigns = template_assigns(company, status, Paths.company_billing_path(company) |> Paths.to_url()) |> Map.put(:subject, subject)

    Swoosh.Email.new()
    |> Swoosh.Email.to(Enum.map(recipients, &recipient_address/1))
    |> Swoosh.Email.from(OperatelyEmail.sender(company))
    |> Swoosh.Email.subject(subject)
    |> Swoosh.Email.html_body(NotificationMailer.html("billing_near_limit_warning", assigns))
    |> Swoosh.Email.text_body(NotificationMailer.text("billing_near_limit_warning", assigns))
  end

  def subject(company, %LimitStatus{limit_key: :member_count}) do
    t("billingNearLimitWarning.isNearItsFreePlanMember", %{v1: company.name})
  end

  def subject(company, %LimitStatus{limit_key: :storage_bytes}) do
    t("billingNearLimitWarning.isNearItsFreePlanStorage", %{v1: company.name})
  end

  def template_assigns(company, %LimitStatus{} = status, cta_url) do
    %{
      headline: subject(company, status),
      usage_summary: usage_summary(company, status),
      impact_message: impact_message(status),
      cta_label: t("billingNearLimitWarning.reviewBilling"),
      cta_url: cta_url
    }
  end

  defp recipient_address(%Person{} = person), do: {person.full_name, person.email}
  defp recipient_address(person), do: {Map.get(person, :full_name), Map.get(person, :email)}

  def format_usage(:member_count, value), do: Integer.to_string(value)
  def format_usage(:storage_bytes, value), do: format_storage_bytes(value)

  defp usage_summary(company, %LimitStatus{limit_key: :member_count} = status) do
    t("billingNearLimitWarning.hasOfActiveMembersOnThe", %{v1: company.name, v2: format_usage(status.limit_key, status.current_usage), v3: format_usage(status.limit_key, status.limit)})
  end

  defp usage_summary(company, %LimitStatus{limit_key: :storage_bytes} = status) do
    t("billingNearLimitWarning.isUsingOfOnTheFree", %{v1: company.name, v2: format_usage(status.limit_key, status.current_usage), v3: format_usage(status.limit_key, status.limit)})
  end

  defp impact_message(%LimitStatus{limit_key: :member_count}) do
    t("billingNearLimitWarning.addingOrRestoringPeopleWillBe")
  end

  defp impact_message(%LimitStatus{limit_key: :storage_bytes}) do
    t("billingNearLimitWarning.uploadingFilesWillBeBlockedOnce")
  end

  @storage_units [
    {"PB", 1_125_899_906_842_624},
    {"TB", 1_099_511_627_776},
    {"GB", 1_073_741_824},
    {"MB", 1_048_576},
    {"KB", 1_024}
  ]

  defp format_storage_bytes(bytes) do
    @storage_units
    |> Enum.find(fn {_unit, size} -> bytes >= size end)
    |> case do
      {unit, size} ->
        value = Float.round(bytes / size, 1)
        "#{value} #{unit}"

      nil ->
        "#{bytes} B"
    end
  end
end
