defmodule OperatelyEmail.Emails.ProjectCreatedEmail do
  import OperatelyEmail.Mailers.ActivityMailer
  alias Operately.{Repo, Projects}
  alias Operately.People.Person
  import OperatelyEmail.I18n, only: [t: 1, t: 2]

  def send(person, activity) do
    author = Repo.preload(activity, :author).author
    project = Projects.get_project!(activity.content["project_id"])
    company = Repo.preload(project, :company).company
    role = Projects.get_contributor_role!(project, person.id) |> stringify_role()
    author_role = Projects.get_contributor_role!(project, author.id) |> stringify_role()
    space = Operately.Groups.get_group!(project.group_id)
    link = OperatelyWeb.Paths.project_path(company, project) |> OperatelyWeb.Paths.to_url()

    company
    |> new()
    |> from(author)
    |> to(person)
    |> subject(where: space.name, who: author, action: t("projectCreated.action", %{v1: project.name}))
    |> assign(:author, author)
    |> assign(:author_role, author_role)
    |> assign(:role, role)
    |> assign(:project, project)
    |> assign(:link, link)
    |> render("project_created")
  end

  def buffered_item(_person, activity) do
    project = Projects.get_project!(activity.content["project_id"])
    author = Repo.preload(activity, :author).author
    company = Repo.preload(project, :company).company

    %{
      parent_id: project.id,
      parent_type: :project,
      parent_name: project.name,
      headline: t("projectCreated.headline"),
      excerpt_html: nil,
      excerpt_text: nil,
      item_url: OperatelyWeb.Paths.project_path(company, project) |> OperatelyWeb.Paths.to_url(),
      actor_name: Person.short_name(author),
      occurred_at: activity.inserted_at,
      coalesce_key: nil
    }
  end

  defp stringify_role(role) do
    case role do
      :champion -> "Champion"
      :reviewer -> "Reviewer"
      :contributor -> "Contributor"
      nil -> nil
    end
  end
end
