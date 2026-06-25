# prototype-book.github.io
A prototype website for a textbook question bank.

## Structure
- `/index.html`: homepage linking to chapter pages.
- `/chapters/chapter-01.html`: sample chapter page shell.
- `/chapters/chapter-template.html`: copy this to create additional chapter shells.
- `/data/chapters/*.json`: canonical chapter data loaded by the page script.
- `/data/source/*.yml`: authoring input files for the conversion script.
- `/scripts/questions.js`: reusable question rendering, data loading, and interactions.
- `/scripts/build_question_db.py`: YAML-to-JSON converter and validator.

## Supported question templates
- `basic`: prompt with optional hint and revealable answer.
- `multiple-choice`: option buttons + submit check + revealable answer.
- `numeric`: numeric input + submit check + revealable answer.

LaTeX in prompts/answers is rendered via MathJax using `\\(...\\)`/`\\[...\\]` syntax.

## Data model
Each chapter JSON file contains a `chapterTitle` and an ordered `categories` array.
Each category has an `id`, `name`, and ordered `questions` array.

Each question should include a stable `id` and a `prompt`. Supported fields are:
- `type`: optional for `basic`, required for `multiple-choice` and `numeric`.
- `answer`: revealable answer text.
- `hint`: revealable hint text.
- `image`: object with `src`, optional `alt`, and optional `caption`.
- `parts`: nested list of subquestions, each following the same rules.
- `options` and `correctIndex`: required for `multiple-choice`.
- `tolerance`: optional for `numeric`.

## Authoring workflow
1. Copy `data/source/chapter-template.yml` to a new file such as `data/source/chapter-02.yml`.
2. Fill in the chapter title, category metadata, and questions.
3. Run `python3 scripts/build_question_db.py --input data/source --output data/chapters`.
4. Open the matching chapter page shell and verify the rendered questions.

## Manual editing workflow
You can also edit the JSON files directly in `data/chapters/` if you prefer.
The minimal requirements are stable IDs, category grouping, and valid type-specific fields.

## Question template details
### `basic`
- Required: `prompt`, `answer`.
- Optional: `hint`, `image`, `parts`.

### `multiple-choice`
- Required: `prompt`, `options`, `correctIndex`.
- Optional: `answer`, `hint`, `image`, `parts`.
- `options` must contain at least two strings.
- `correctIndex` is zero-based.

### `numeric`
- Required: `prompt`, `answer`.
- Optional: `hint`, `image`, `parts`, `tolerance`.
- `answer` must parse as a number.
- `tolerance` defaults to `0` if omitted.

## Images
If a question uses an image, put the asset in `imgs/` and reference it from the question file.
The `src` value should be a relative path that works from the chapter page shell.

## Chapter loading
Chapter pages set `data-chapter` on the `<body>` element and load the matching JSON file from `data/chapters/`.
The renderer also still accepts `window.chapterConfig` for migration compatibility.
