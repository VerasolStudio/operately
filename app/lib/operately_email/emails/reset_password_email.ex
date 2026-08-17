defmodule OperatelyEmail.Emails.ResetPasswordEmail do
  import OperatelyEmail.Mailers.NotificationMailer, only: [html: 2, text: 2]
  import Swoosh.Email
  alias OperatelyWeb.Paths  
  import OperatelyEmail.I18n, only: [t: 1, t: 2]

  def send(account, token) do
    assigns = %{
      reset_url: Paths.to_url("/reset-password?token=#{token}"),
      subject: t("resetPassword.resetPasswordInstructions")
    }

    email = new()
    |> to(account.email)
    |> from({"Operately", OperatelyEmail.notification_email_address()})
    |> subject(assigns[:subject])
    |> html_body(html("reset_password", assigns))
    |> text_body(text("reset_password", assigns))

    OperatelyEmail.Mailers.BaseMailer.deliver_now(email)
  end
end
