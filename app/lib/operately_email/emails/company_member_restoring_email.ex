defmodule OperatelyEmail.Emails.CompanyMemberRestoringEmail do
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
    |> subject(where: company.name, who: author, action: t("companyMemberRestoring.action"))
    |> assign(:author, author)
    |> assign(:link, link)
    |> render("company_member_restoring")
  end
end
