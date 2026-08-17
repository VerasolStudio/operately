  defmodule OperatelyEmail.Emails.CompanyOwnersAddingEmail do
    import OperatelyEmail.Mailers.ActivityMailer

    alias Operately.Repo
    alias OperatelyWeb.Paths
  import OperatelyEmail.I18n, only: [t: 1, t: 2]

    def send(person, activity) do
      activity = Repo.preload(activity, [author: :company])
      author = activity.author
      company = author.company

      link = Paths.home_path(company) |> Paths.to_url()

      company
      |> new()
      |> from(author)
      |> to(person)
      |> subject(where: company.name, who: author, action: t("companyOwnersAdding.action"))
      |> assign(:author, author)
      |> assign(:link, link)
      |> render("company_owners_adding")
    end
  end
