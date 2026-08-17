defmodule OperatelyEmail.Emails.GoalReviewerUpdatingEmail do
  import OperatelyEmail.Mailers.ActivityMailer

  alias Operately.{Repo, Goals}
  import OperatelyEmail.I18n, only: [t: 1, t: 2]

  def send(person, activity) do
    author = Repo.preload(activity, :author).author
    company = Repo.preload(author, :company).company
    goal = Goals.get_goal!(activity.content["goal_id"])

    company
    |> new()
    |> from(author)
    |> to(person)
    |> subject(where: goal.name, who: author, action: t("goalReviewerUpdating.action"))
    |> assign(:author, author)
    |> assign(:goal, goal)
    |> assign(:link, OperatelyWeb.Paths.goal_path(company, goal) |> OperatelyWeb.Paths.to_url())
    |> render("goal_reviewer_updating")
  end

  def buffered_item(_person, activity) do
    goal = Operately.Goals.get_goal!(activity.content["goal_id"])
    author = Operately.Repo.preload(activity, :author).author
    company = Operately.Repo.preload(author, :company).company
    reviewer = get_reviewer(activity.content["new_reviewer_id"])

    %{
      parent_id: goal.id,
      parent_type: :goal,
      parent_name: goal.name,
      headline: buffered_headline(reviewer),
      excerpt_html: nil,
      excerpt_text: nil,
      item_url: OperatelyWeb.Paths.goal_path(company, goal) |> OperatelyWeb.Paths.to_url(),
      actor_name: Operately.People.Person.short_name(author),
      occurred_at: activity.inserted_at,
      coalesce_key: nil
    }
  end

  defp buffered_headline(nil), do: t("goalReviewerUpdating.removedTheGoalReviewer")
  defp buffered_headline(reviewer), do: t("goalReviewerUpdating.assignedAsTheGoalReviewer", %{v1: reviewer.full_name})

  defp get_reviewer(nil), do: nil
  defp get_reviewer(id), do: Operately.People.get_person!(id)
end
