defmodule OperatelyEmail.Mailers.ActivityMailer do
  alias Operately.People.Person

  alias OperatelyEmail.Mailers.NotificationMailer, as: NotificationMailer
  alias OperatelyEmail.I18n

  defdelegate new(company), to: NotificationMailer
  defdelegate to(email, person), to: NotificationMailer
  defdelegate render(email, template), to: NotificationMailer
  defdelegate assign(email, key, value), to: NotificationMailer

  def from(email, person) do
    NotificationMailer.from(email, I18n.t("mailer.fromName", %{v1: person.full_name}))
  end

  def subject(email, where: where, who: who, action: action) do
    subject_line =
      I18n.t("mailer.subject", %{v1: where, v2: Person.short_name(who), v3: action})

    NotificationMailer.subject(email, subject_line)
  end
end
