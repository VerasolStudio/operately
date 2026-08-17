defmodule OperatelyEmail.Emails.GoalCreatedEmail do
  import OperatelyEmail.Mailers.ActivityMailer
  alias Operately.{Repo, Goals}
  alias Operately.People.Person
  alias OperatelyWeb.Paths
  import OperatelyEmail.I18n, only: [t: 1, t: 2]

  def send(person, activity) do
    author = Repo.preload(activity, :author).author
    company = Repo.preload(author, :company).company
    goal = Goals.get_goal!(activity.content["goal_id"])
    role = Goals.get_role(goal, person) |> Atom.to_string()
    space = Operately.Groups.get_group!(goal.group_id)

    company
    |> new()
    |> from(author)
    |> to(person)
    |> subject(where: space.name, who: author, action: t("goalCreated.action", %{v1: goal.name}))
    |> assign(:author, author)
    |> assign(:goal, goal)
    |> assign(:role, role)
    |> assign(:cta_url, Paths.goal_path(company, goal) |> Paths.to_url())
    |> render("goal_created")
  end

  def buffered_item(_person, activity) do
    goal = Goals.get_goal!(activity.content["goal_id"])
    author = Repo.preload(activity, :author).author
    company = Repo.preload(author, :company).company

    %{
      parent_id: goal.id,
      parent_type: :goal,
      parent_name: goal.name,
      headline: t("goalCreated.headline"),
      excerpt_html: nil,
      excerpt_text: nil,
      item_url: Paths.goal_path(company, goal) |> Paths.to_url(),
      actor_name: Person.short_name(author),
      occurred_at: activity.inserted_at,
      coalesce_key: nil
    }
  end
end
