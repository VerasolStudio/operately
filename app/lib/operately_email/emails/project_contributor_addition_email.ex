defmodule OperatelyEmail.Emails.ProjectContributorAdditionEmail do
  import OperatelyEmail.Mailers.ActivityMailer
  alias Operately.{Repo, Projects}
  import OperatelyEmail.I18n, only: [t: 1, t: 2]

  def send(person, activity) do
    author = Repo.preload(activity, :author).author
    company = Repo.preload(author, :company).company
    project = Projects.get_project!(activity.content["project_id"])
    contributor = Projects.get_contributor!(activity.content["contributor_id"])
    role = activity.content["role"]
    responsibility = construct_responsibility(contributor)
    link = OperatelyWeb.Paths.project_path(company, project) |> OperatelyWeb.Paths.to_url()

    company
    |> new()
    |> from(author)
    |> to(person)
    |> subject(where: project.name, who: author, action: t("projectContributorAddition.action", %{v1: role}))
    |> assign(:author, author)
    |> assign(:project, project)
    |> assign(:responsibility, responsibility)
    |> assign(:role, role)
    |> assign(:link, link)
    |> render("project_contributor_addition")
  end

  def construct_responsibility(contributor) do
    case contributor.role do
      :champion -> t("projectContributorAddition.asAChampionYouAreResponsible")
      :reviewer -> t("projectContributorAddition.asAReviewerYouAreResponsible")
      :contributor -> t("projectContributorAddition.youAreResponsibleFor", %{v1: contributor.responsibility})
    end
  end
end
