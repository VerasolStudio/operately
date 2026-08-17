defmodule OperatelyEmail.Emails.GoalCheckInEmail do
  import OperatelyEmail.Mailers.ActivityMailer

  alias Operately.Goals.Update
  alias Operately.Goals.Update.Permissions
  alias Operately.ContextualDates.Timeframe

  alias OperatelyWeb.Paths
  alias __MODULE__.OverviewMsg
  import OperatelyEmail.I18n, only: [t: 1, t: 2]

  def send(person, activity) do
    update_id = activity.content["update_id"]

    {:ok, update} = load_update(update_id, person)

    company = update.goal.company
    author = update.author
    goal = update.goal

    {cta_text, cta_url} = construct_cta_text_and_url(company, update, person)

    company
    |> new()
    |> from(author)
    |> to(person)
    |> subject(where: goal.name, who: author, action: t("goalCheckIn.action"))
    |> assign(:author, author)
    |> assign(:goal, goal)
    |> assign(:update, update)
    |> assign(:cta_url, cta_url)
    |> assign(:cta_text, cta_text)
    |> assign(:overview, OverviewMsg.construct(update))
    |> assign(:targets, update.goal.targets)
    |> assign(:checks, sort_by_index(update.checks))
    |> render("goal_check_in")
  end

  defp construct_cta_text_and_url(company, update, person) do
    url = Paths.goal_check_in_path(company, update) |> Paths.to_url()
    access_level = update.request_info.access_level

    if Permissions.can_acknowledge(access_level, update, person.id) do
      {"Acknowledge", url <> "?acknowledge=true"}
    else
      {t("goalCheckIn.viewCheckIn"), url}
    end
  end

  defp load_update(update_id, person) do
    Update.get(person,
      id: update_id,
      opts: [
        preload: [goal: [:company, :reviewer, :targets, :checks], author: []]
      ]
    )
  end

  defp sort_by_index(checks) do
    Enum.sort_by(checks, & &1.index)
  end

  defmodule OverviewMsg do
    import Operately.RichContent.Builder
    alias Operately.People.Person

    def construct(update) do
      status = normalize_status(update.status)

      doc([
        paragraph(
          status_msg(status) ++
            reviewer_note(status, update.goal.reviewer) ++
            due_date(Timeframe.end_date(update.timeframe))
        )
      ])
    end

    defp status_msg(:on_track) do
      [text(t("goalCheckIn.theGoalIs")), bg_green("on-track"), text(t("goalCheckIn.andProgressingAsPlanned"))]
    end

    defp status_msg(:caution) do
      [text(t("goalCheckIn.theGoal")), bg_yellow(t("goalCheckIn.needsAttention")), text(t("goalCheckIn.dueToEmergingRisksOrDelays"))]
    end

    defp status_msg(:off_track) do
      [text(t("goalCheckIn.theGoalIs")), bg_red(t("goalCheckIn.offTrack")), text(t("goalCheckIn.dueToSignificantProblemsAffectingSuccess"))]
    end

    def reviewer_note(:on_track, _), do: []

    def reviewer_note(:caution, reviewer),
      do: [text(" "), text(Person.first_name(reviewer)), text(t("goalCheckIn.shouldBeAware"))]

    def reviewer_note(:off_track, reviewer),
      do: [text(" "), text(Person.first_name(reviewer) <> "'s"), text(t("goalCheckIn.helpIsNeeded"))]

    defp due_date(date) do
      if is_nil(date) do
        []
      else
        days = Date.diff(date, Date.utc_today())
        duration = human_duration(abs(days))

        cond do
          days < 0 -> [text(" "), text(duration), text(" "), bg_red("overdue.")]
          days == 0 -> [text(" "), text(t("goalCheckIn.dueToday"))]
          days > 0 -> [text(" "), text(duration), text(" "), text(t("goalCheckIn.untilTheDeadline"))]
        end
      end
    end

    defp human_duration(n) when n == 1, do: "1 day"
    defp human_duration(n) when n < 7, do: "#{n} days"
    defp human_duration(n) when n == 7, do: "1 week"
    defp human_duration(n) when n < 30, do: "#{div(n, 7)} weeks"
    defp human_duration(n) when n < 60, do: "1 month"
    defp human_duration(n), do: "#{div(n, 30)} months"

    defp normalize_status(:on_track), do: :on_track
    defp normalize_status(:caution), do: :caution
    defp normalize_status(:off_track), do: :off_track
  end

  def buffered_item(_person, activity) do
    {:ok, update} = Update.get(:system, id: activity.content["update_id"], opts: [preload: :goal])
    goal = update.goal
    author = Operately.Repo.preload(activity, :author).author
    company = Operately.Repo.preload(author, :company).company
    %{html: excerpt_html, text: excerpt_text} = OperatelyEmail.RichTextExcerpt.excerpt(update.message)

    %{
      parent_id: goal.id,
      parent_type: :goal,
      parent_name: goal.name,
      headline: t("goalCheckIn.headline", %{v1: status_label(update.status)}),
      excerpt_html: excerpt_html,
      excerpt_text: excerpt_text,
      item_url: OperatelyWeb.Paths.goal_check_in_path(company, update) |> OperatelyWeb.Paths.to_url(),
      actor_name: Operately.People.Person.short_name(author),
      occurred_at: activity.inserted_at,
      coalesce_key: nil
    }
  end

  defp status_label(:on_track), do: "on track"
  defp status_label(:off_track), do: t("goalCheckIn.offTrack")
  defp status_label(status) when is_binary(status), do: status
  defp status_label(status) when is_atom(status), do: Atom.to_string(status)
end
