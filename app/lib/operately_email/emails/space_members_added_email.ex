defmodule OperatelyEmail.Emails.SpaceMembersAddedEmail do
  import OperatelyEmail.Mailers.ActivityMailer
  alias Operately.{Repo, Groups}
  import OperatelyEmail.I18n, only: [t: 1, t: 2]

  def send(person, activity) do
    author = Repo.preload(activity, :author).author
    space = Groups.get_group!(activity.content["space_id"])
    company = Repo.preload(space, :company).company
    link = OperatelyWeb.Paths.space_path(company, space) |> OperatelyWeb.Paths.to_url()

    company
    |> new()
    |> from(author)
    |> to(person)
    |> subject(where: space.name, who: author, action: t("spaceMembersAdded.action", %{v1: space.name}))
    |> assign(:author, author)
    |> assign(:space, space)
    |> assign(:link, link)
    |> render("space_members_added")
  end
end
