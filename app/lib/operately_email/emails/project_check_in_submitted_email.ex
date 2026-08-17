defmodule OperatelyEmail.Emails.ProjectCheckInSubmittedEmail do
  import OperatelyEmail.Mailers.ActivityMailer
  alias Operately.{Repo, Projects}
  alias OperatelyWeb.Paths
  alias __MODULE__.OverviewMsg
  import OperatelyEmail.I18n, only: [t: 1, t: 2]

  def send(person, activity) do
    author = Repo.preload(activity, :author).author

    project = Projects.get_project!(activity.content["project_id"])
    project = Repo.preload(project, [:company, :reviewer])

    check_in = Projects.get_check_in!(activity.content["check_in_id"])
    company = project.company

    {cta_text, cta_url} = construct_cta_text_and_url(person, company, project, check_in)

    company
    |> new()
    |> from(author)
    |> to(person)
    |> subject(where: project.name, who: author, action: t("projectCheckInSubmitted.action"))
    |> assign(:author, author)
    |> assign(:project, project)
    |> assign(:check_in, check_in)
    |> assign(:cta_url, cta_url)
    |> assign(:cta_text, cta_text)
    |> assign(:overview, OverviewMsg.construct(check_in, project))
    |> render("project_check_in_submitted")
  end

  defp construct_cta_text_and_url(person, company, project, check_in) do
    reviewer = project.reviewer
    url = Paths.project_check_in_path(company, check_in) |> Paths.to_url()

    cond do
      reviewer == nil -> {t("projectCheckInSubmitted.viewCheckIn"), url}
      person.id == reviewer.id -> {"Acknowledge", url <> "?acknowledge=true"}
      true -> {t("projectCheckInSubmitted.viewCheckIn"), url}
    end
  end

  defmodule OverviewMsg do
    import Operately.RichContent.Builder
    alias Operately.People.Person

    def construct(check_in, project) do
      status = normalize_status(check_in.status)
      reviewer = project.reviewer

      doc([
        paragraph(
          status_msg(status) ++
            reviewer_note(status, reviewer) ++
            due_date(project)
        )
      ])
    end

    defp status_msg(:on_track) do
      [text(t("projectCheckInSubmitted.theProjectIs")), bg_green("on-track"), text(t("projectCheckInSubmitted.andProgressingAsPlanned"))]
    end

    defp status_msg(:caution) do
      [text(t("projectCheckInSubmitted.theProject")), bg_yellow(t("projectCheckInSubmitted.needsAttention")), text(t("projectCheckInSubmitted.dueToEmergingRisksOrDelays"))]
    end

    defp status_msg(:off_track) do
      [text(t("projectCheckInSubmitted.theProjectIs")), bg_red(t("projectCheckInSubmitted.offTrack")), text(t("projectCheckInSubmitted.dueToSignificantProblemsAffectingSuccess"))]
    end

    def reviewer_note(:on_track, _), do: []

    def reviewer_note(:caution, nil), do: []

    def reviewer_note(:caution, reviewer),
      do: [text(" "), text(Person.first_name(reviewer)), text(t("projectCheckInSubmitted.shouldBeAware"))]

    def reviewer_note(:off_track, nil), do: []

    def reviewer_note(:off_track, reviewer),
      do: [text(" "), text(Person.first_name(reviewer) <> "'s"), text(t("projectCheckInSubmitted.helpIsNeeded"))]

    defp due_date(%{timeframe: nil}), do: []
    defp due_date(%{timeframe: timeframe}) do
      case Operately.ContextualDates.Timeframe.end_date(timeframe) do
        nil -> []
        date ->
          days = Date.diff(date, Date.utc_today())
          duration = human_duration(abs(days))

          cond do
            days < 0 -> [text(" "), text(duration), text(" "), bg_red("overdue.")]
            days > 0 -> [text(" "), text(duration), text(" "), text(t("projectCheckInSubmitted.untilTheDeadline"))]
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
    project = Operately.Projects.get_project!(activity.content["project_id"])
    check_in = Operately.Projects.get_check_in!(activity.content["check_in_id"])
    author = Operately.Repo.preload(activity, :author).author
    company = Operately.Repo.preload(author, :company).company
    %{html: excerpt_html, text: excerpt_text} = OperatelyEmail.RichTextExcerpt.excerpt(check_in.description)

    %{
      parent_id: project.id,
      parent_type: :project,
      parent_name: project.name,
      parent_url: OperatelyWeb.Paths.project_path(company, project) |> OperatelyWeb.Paths.to_url(),
      headline: t("projectCheckInSubmitted.headline", %{v1: status_label(check_in.status)}),
      excerpt_html: excerpt_html,
      excerpt_text: excerpt_text,
      item_url: OperatelyWeb.Paths.project_check_in_path(company, check_in) |> OperatelyWeb.Paths.to_url(),
      actor_name: Operately.People.Person.short_name(author),
      occurred_at: activity.inserted_at,
      coalesce_key: nil
    }
  end

  defp status_label(:on_track), do: "on track"
  defp status_label(:off_track), do: t("projectCheckInSubmitted.offTrack")
  defp status_label(status) when is_binary(status), do: status
  defp status_label(status) when is_atom(status), do: Atom.to_string(status)
end
