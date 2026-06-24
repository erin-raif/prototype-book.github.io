# prototype-book.github.io
A prototype website for a textbook question bank.

## Structure
- `/index.html`: homepage linking to chapter pages.
- `/chapters/chapter-01.html`: sample chapter page.
- `/chapters/chapter-template.html`: copy this to create additional chapters.
- `/scripts/questions.js`: reusable question rendering and interactions.

## Supported question templates
- `basic`: prompt with optional hint and revealable answer.
- `multiple-choice`: option buttons + submit check + revealable answer.
- `numeric`: numeric input + submit check + revealable answer.

LaTeX in prompts/answers is rendered via MathJax using `\\(...\\)`/`\\[...\\]` syntax.
