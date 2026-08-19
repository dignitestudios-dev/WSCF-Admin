# Admin Panel — Implementation Plan

Twelve changes across seven routes. Each entry gives the file, the exact
location, what is wrong now, and the intended fix. Reviewed against the current
code on `main`.

Ordered by risk: the crash first, cosmetics last.

---

## 1. `/current-enrolled-users` crashes on tournament select — BLOCKER

**File** `src/app/(main)/current-enrolled-users/_components/current-enrolled-users.tsx`
**Line** 211

```tsx
<td …>{user.division || 'N/A'}</td>
```

`division` used to be a string. The backend now returns an **object**:

```json
"division": { "_id": "…", "label": "K7u800", "type": "conditional",
              "divisionName": "K7", "rating": 800, "condition": "under" }
```

Rendering an object as a React child throws *"Objects are not valid as a React
child"* — that is the white screen.

**Fix** — render the label:

```tsx
<td …>{user.division?.label || 'N/A'}</td>
```

**Also worth knowing:** this table reads `user.user?.name` (line 208). The
participants endpoint still returns a combined `name`, so it is correct today —
but it is the only place still relying on that field.

---

## 2. Tournament detail — participants column rename

**File** `src/app/(main)/tournaments/[id]/_components/tournament-detail.tsx`
**Line** 266

```tsx
<th className="px-6 py-3 font-semibold w-[100px]">Division</th>
```

**Fix** — rename to `Selected Division`, and widen the column: `w-[100px]` is
too narrow for the longer header plus values like `K12o800`. `w-[150px]` fits.

Do **not** rename the export dialog's "Division" label (line 367) — that filter
chooses which division to export and is correctly named.

---

## 3. `/users` — first and last name as separate columns

**File** `src/app/(main)/users/_components/users.tsx`
**Lines** 19, 60, 113, 162-163

One `Name` column currently fed by `user.name`. The list endpoint returns
`firstName` and `lastName` separately.

**Fix**

- interface (19): replace `name: string` with `firstName` / `lastName`
- mapping (60): `firstName: user.firstName, lastName: user.lastName`
- header (113): split into `First Name` and `Last Name`. Column widths to be
  rebalanced as needed (agreed: my call).
- cells (162-163): two `<td>`s, each keeping `truncate` and its `title`

Search is unaffected: the box sends `search` to the backend, which matches on
`firstName`, `lastName` and `email`.

---

## 4. `/users/[id]` — three changes

**File** `src/app/(main)/users/[id]/_components/user-profile.tsx`

### 4a. Remove the profile image

Lines 190-203, plus `avatar` (105) and the `next/image` import (22).

The avatar is a **hard-coded Unsplash stock photo** — the same face for every
user — so nothing real is lost. Removing the `<Image>` alone is not enough: the
absolutely-positioned 150px circle and the offsets that reserve room for it
(`mt-[65px] md:mt-0`, `md:ml-[170px]`) must go too, or the header keeps a hole.

### 4b. Show the school

The detail endpoint now returns `playerProfile.school` as
`{ _id, name, address }` or `null`.

Add to `userData` (~97): `school: profile?.school?.name || 'N/A'`, and render it
in the stats grid beside Grade and Team.

**Agreed:** `team` (102) should show real API data when present, falling back to
a placeholder only when the player has no team.

### 4c. Deactivate button — drop the trash icon

Lines 160-163. Deactivation is reversible — there is an Activate button beside
it — so a delete icon misrepresents it. Remove the icon wrapper and the `Trash2`
import (8); keep the red styling.

**Agreed:** keep an icon, but a relevant one — `Ban` or `UserX` — matching
Activate, which carries a `Star`.

---

## 5. `/schools/[id]` — two changes

**File** `src/app/(main)/schools/[id]/_components/school-detail.tsx`

### 5a. Remove "Status Overview"

Lines 69-83. Entirely static: a green dot reading "Active Registration" and a
"Last updated" date. It reflects nothing about the school.

Deleting it leaves "Location Address" alone in a two-column grid — make that
grid single-column, or move the address up.

### 5b. List the school's players

The backend supports `GET /user?schoolId=<id>`, returning only that school's
players with correct pagination.

Plumbing needed:

- `src/features/users/services/user.service.ts` — add an optional `schoolId`
  arg to `getUsers`, pass it as a query param
- `src/features/users/hooks/use-users.ts` — thread it through **and add it to
  the query key** (`['users', { page, limit, search, schoolId }]`). Without
  that, the cached unfiltered list is served instead.
- render a **paginated table** below the details card, reusing the markup and
  columns from `users/_components/users.tsx` (confirmed)

---

## 6. `/tournaments/[id]` — let long values wrap

**File** `src/app/(main)/tournaments/[id]/_components/tournament-detail.tsx`
**Lines** 92-93, 199, 217-219

Three things combine to clip the text:

```tsx
// 92 — every division flattened into one string
tournament.divisions.map(getDivisionLabel).join(', ')

// 199 — fixed row height
className="… sm:h-[32px] …"

// 218 — and the value truncates
className="… truncate …"
```

So `Location` and `Division` are cut off with an ellipsis instead of wrapping.

**Confirmed:** the problem is the truncation — text is cut off with `...`. It
should wrap onto the next line instead.

**Fix**

- drop `truncate`, add `break-words`
- drop `sm:h-[32px]`; change `sm:items-center` to `sm:items-start` so the label
  stays aligned with the first line

Applies to every row, so long Locations wrap too — not just Division.

---

## 7. `/forms` — two changes

**File** `src/app/(main)/forms/_components/forms.tsx`

### 7a. Two-column grid

**Confirmed:** the page currently shows one field per row, and there is too much
empty space left and right. Two fields per row, with tighter and more consistent
horizontal padding.

Line 132 is `flex flex-col gap-6 w-full max-w-3xl mx-auto`. Change to
`grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 w-full` and drop the narrow
`max-w-3xl` centring so the grid uses the container width, matching the padding
used by the other pages.

### 7b. Dropdown should open with its options

Lines 166-171. The dropdown preview is a dead `<div>` with `pointer-events-none`
and placeholder text; the options only appear in a truncated
"Options: a, b, c" line underneath (183).

**Confirmed:** it should open and display the options, but be **view-only** —
opening and reading is allowed, selecting a value is not.

For `isTournamentSpecific` fields `options` is empty by design (values are set
per tournament), so keep the existing "Tournament Specific" note for those.

---

## 8. Tournament edit — lock existing divisions

**File** `src/features/tournaments/components/tournament-form.tsx`
(shared by create and edit; edit passes `initialData`)

**This is a requirement, not a bug.** Nothing is broken today — divisions are
fully editable in both modes. The ask is to *restrict* the edit page.

### Intended behaviour

On the **edit** page (`initialData` present):

- divisions loaded from the server are **read-only** — type, division type,
  rating and condition all disabled
- their remove (X) button is hidden, so they cannot be deleted either
- "Add Division" still works, and divisions added during this session remain
  fully editable and removable until saved

On the **create** page: unchanged, everything editable.

### How to implement

The form already knows both facts it needs:

- `initialData` distinguishes edit from create
- `divisionFields` from `useFieldArray` is ordered, so the first
  `initialData.divisions.length` entries are the pre-existing ones

So `const isExisting = !!initialData && index < initialData.divisions.length`
is enough to drive `disabled` on each control and to hide the remove button
(line 402), without tracking extra state.

Touch points inside the divisions block:

- type `Select` (418) — already has a `disabled` prop; OR the new condition in
- division type `Select` (437)
- rating input and the under/over radios (~460+)
- remove button (402-411) — extend the existing `divisionFields.length > 1`
  guard

Style the locked fields like the read-only entry fee (326) so it is visually
obvious rather than mysteriously inert: `bg-gray-100 text-gray-500
cursor-not-allowed border-gray-300 opacity-70`.

### Side benefit

Because existing divisions can no longer change, their `_id`s can be sent back
untouched on save. That would sidestep most of the deferred `_id` regeneration
problem, though the backend still replaces the array wholesale — so it is
mitigation, not a fix.

---

## Deferred (agreed — not this pass)

- **Division `_id` regeneration on tournament edit** (item 8's second half).
  Tracked, not fixed now.
- **Notification model A/B decision.** That backend task stays paused.

## Suggested order

1. **Item 1** — the crash
2. **Item 8** — lock existing divisions on the edit page
3. **Items 3, 4, 5** — real data shown wrong or hard-coded
4. **Items 2, 6, 7** — presentation

## Open questions

All resolved. See the confirmations inline above.
