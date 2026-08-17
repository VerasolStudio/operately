defmodule OperatelyEmail.I18n do
  @moduledoc """
  Translations for outgoing email.

  The copy lives in `priv/email_locales/{locale}.json`, in the same shape as
  the frontend bundles, so the two can be edited side by side. Placeholders
  are written as `{{name}}` and filled from the bindings passed to `t/2`.

  The locale is instance-wide and comes from the `EMAIL_LOCALE` environment
  variable, since a queued email has no browser to ask.
  """

  @default_locale "en"
  @locales_path Path.expand("../../priv/email_locales", __DIR__)

  @locale_files @locales_path |> Path.join("*.json") |> Path.wildcard()

  if @locale_files == [] do
    raise "No email locale bundles found in #{@locales_path}"
  end

  for file <- @locale_files, do: @external_resource(file)

  @translations Map.new(@locale_files, fn path ->
                  {Path.basename(path, ".json"), path |> File.read!() |> Jason.decode!()}
                end)
  @known_locales Map.keys(@translations)

  @doc "Locales the emails ship copy for."
  def known_locales, do: @known_locales

  @doc """
  The locale outgoing email is written in.
  """
  def locale do
    configured = Application.get_env(:operately, :email_locale, @default_locale)

    if configured in @known_locales, do: configured, else: @default_locale
  end

  @doc """
  Translates `key` in the instance locale, filling `{{name}}` placeholders
  from `bindings`.

  Falls back to English, then to the key itself, so missing copy degrades
  instead of raising inside a background job.
  """
  def t(key, bindings \\ %{}), do: t(locale(), key, bindings)

  def t(locale, key, bindings) do
    message = lookup(locale, key) || lookup(@default_locale, key) || key

    interpolate(message, bindings)
  end

  defp lookup(locale, key) do
    @translations
    |> Map.get(locale, %{})
    |> dig(String.split(key, "."))
  end

  defp dig(value, []), do: if(is_binary(value), do: value, else: nil)
  defp dig(node, [head | rest]) when is_map(node), do: node |> Map.get(head) |> dig(rest)
  defp dig(_node, _path), do: nil

  defp interpolate(message, bindings) when map_size(bindings) == 0, do: message

  defp interpolate(message, bindings) do
    Enum.reduce(bindings, message, fn {name, value}, acc ->
      String.replace(acc, "{{#{name}}}", to_string(value))
    end)
  end
end
