/**
 * A stable colour for a space.
 *
 * The redesign identifies spaces by a small coloured square in the sidebar and
 * in tables, but spaces have no colour in the database — the `color` field on
 * the API type is never populated by the server. Rather than block the visual
 * language on a schema change, the colour is derived from the space id: stable
 * across sessions and devices, distinct enough between neighbours, and free.
 *
 * If spaces ever gain a real colour, pass it through and this becomes the
 * fallback for spaces that have not picked one.
 */

const SPACE_PALETTE = [
  "#3185FF", // blue
  "#8B5CF6", // violet
  "#059669", // emerald
  "#D97706", // amber
  "#0EA5E9", // sky
  "#DB2777", // pink
  "#0D9488", // teal
  "#EA580C", // orange
];

export function spaceColor(space: { id?: string | null; color?: string | null }): string {
  if (space.color) return space.color;

  const id = space.id ?? "";
  let hash = 0;

  for (let index = 0; index < id.length; index++) {
    hash = (hash * 31 + id.charCodeAt(index)) | 0;
  }

  return SPACE_PALETTE[Math.abs(hash) % SPACE_PALETTE.length]!;
}
