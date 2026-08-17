defmodule OperatelyEmail.Emails.ResourceHubDocumentEditedEmail do
  import OperatelyEmail.Mailers.ActivityMailer

  alias Operately.Activities.Notifications.MentionedPeople
  alias OperatelyEmail.Emails.ResourceHubEmail
  alias Operately.Repo
  import OperatelyEmail.I18n, only: [t: 1, t: 2]

  def send(person, activity) do
    %{author: author = %{company: company}} = Repo.preload(activity, author: :company)

    document = ResourceHubEmail.load_document(activity.content["document_id"])
    parent = ResourceHubEmail.parent(document)
    content = activity.content["content"] || document.content

    company
    |> new()
    |> from(author)
    |> to(person)
    |> subject(where: parent.name, who: author, action: action(person, document, content))
    |> assign(:author, author)
    |> assign(:document, document)
    |> assign(:content, content)
    |> assign(:cta_url, OperatelyWeb.Paths.document_path(company, document) |> OperatelyWeb.Paths.to_url())
    |> render("resource_hub_document_edited")
  end

  def buffered_item(_person, activity) do
    author = Repo.preload(activity, :author).author
    company = Repo.preload(author, :company).company

    document = ResourceHubEmail.load_document(activity.content["document_id"])
    parent = ResourceHubEmail.parent(document)
    content = activity.content["content"] || document.content
    %{html: excerpt_html, text: excerpt_text} = OperatelyEmail.RichTextExcerpt.excerpt(content)

    %{
      parent_id: parent.id,
      parent_type: parent.type,
      parent_name: parent.name,
      headline: t("resourceHubDocumentEdited.headline", %{v1: document.name}),
      excerpt_html: excerpt_html,
      excerpt_text: excerpt_text,
      item_url: OperatelyWeb.Paths.document_path(company, document) |> OperatelyWeb.Paths.to_url(),
      actor_name: Operately.People.Person.short_name(author),
      occurred_at: activity.inserted_at,
      coalesce_key: nil
    }
  end

  defp action(person, document, content) do
    if person.id in MentionedPeople.ids(content) do
      t("resourceHubDocumentEdited.mentionedYouInTheDocument", %{v1: document.name})
    else
      t("resourceHubDocumentEdited.updatedTheDocument", %{v1: document.name})
    end
  end
end
