# Plan: Prevent empty listens (issue #2)

## Goal

Submitting the "Log a listen" form on the album page with no rating selected and no
note typed must not create a listen row. The action rejects the submit and the form
shows an inline error. A submit with a rating only, a note only, or both continues to
work. Done = empty and whitespace-only submits create no row and show the error;
non-empty submits behave exactly as before; `npm run typecheck` passes.

## Scope

- **In:** server-side validation in the `intent === "listen"` branch of the action in
  `app/routes/album.tsx`; inline error rendering under the form via `actionData`;
  trimming notes so whitespace-only notes count as empty.
- **Out:** client-side/HTML validation (either/or can't be expressed natively),
  changes to `createListen` or the DB schema, the form-reset bug (#1), the
  rating-clear feature (#3).

## Phases

### Phase 1 — validate in the action and render the error

`app/routes/album.tsx`:

1. In the `intent === "listen"` branch: compute
   `const rating = ratingRaw ? Number(ratingRaw) : null;` and
   `const notes = String(form.get("notes") ?? "").trim();`. If
   `rating === null && !notes`, return
   `{ error: "Add a rating or a note before logging a listen." }` instead of calling
   `createListen`. Otherwise call `createListen({ album_id: id, rating, notes: notes || null })`.
2. Add `actionData` to the route component props
   (`{ loaderData, actionData }: Route.ComponentProps`) and render
   `actionData?.error` in a small red paragraph inside the listen `<Form>`, after the
   controls row.

Verification:

- `npm run typecheck` (runs `react-router typegen && tsc`) passes.
- Manual: `npm run dev`, open an album page; submitting untouched form shows the
  error and adds no row; whitespace-only note behaves the same; rating-only and
  note-only submits create rows as before; delete intent unaffected.

## Risks

- `Route.ComponentProps` action data typing: the action now returns
  `{ error } | Response | null`; typegen handles the union, but run typecheck to
  confirm.
- No automated test infrastructure exists in this repo (no test script/deps), so
  verification is typecheck + manual reproduction.

## Assumptions

- The either/or rule from the issue body ("require at least one of the two") is the
  intended behavior; server-side validation with an inline error implements it.
- Whitespace-only notes are treated as empty.
- The approach mirrors the previously closed (unmerged) PR #22, which matched the
  codebase's existing action/actionData patterns; no reason to diverge.
- No test framework is added — out of proportion for this repo (no existing tests).

## Open questions

None.
