defmodule OperatelyEmail.Emails.CompanyOwnerRemovingEmail do
  import OperatelyEmail.Mailers.ActivityMailer

  alias Operately.Repo
  alias OperatelyWeb.Paths
  import OperatelyEmail.I18n, only: [t: 1, t: 2]

  def send(person, activity) do
    person = Repo.preload(person, [:company])
    activity = Repo.preload(activity, [:author])

    author = activity.author
    company = person.company
    link = Paths.home_path(company) |> Paths.to_url()

    company
    |> new()
    |> from(author)
    |> to(person)
    |> subject(where: company.name, who: author, action: t("companyOwnerRemoving.action"))
    |> assign(:author, author)
    |> assign(:link, link)
    |> render("company_owner_removing")
  end
end
