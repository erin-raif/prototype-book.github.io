(function () {
  const titleNode = document.getElementById("chapter-title");
  const root = document.getElementById("question-root");
  const inlineChapterConfig = window.chapterConfig;

  if (!titleNode || !root) {
    return;
  }

  void bootstrap();

  async function bootstrap() {
    const chapterConfig = inlineChapterConfig || (await loadChapterConfig());

    if (!chapterConfig) {
      renderLoadError("No chapter data was found for this page.");
      return;
    }

    if (!chapterConfig.chapterTitle || !Array.isArray(chapterConfig.categories)) {
      renderLoadError("Chapter data is missing a title or categories array.");
      return;
    }

    renderChapter(chapterConfig);
  }

  async function loadChapterConfig() {
    const chapterId =
      document.body?.dataset.chapter ||
      new URLSearchParams(window.location.search).get("chapter");

    if (!chapterId) {
      return null;
    }

    const dataBasePath = window.location.pathname.includes("/chapters/")
      ? "../data/chapters"
      : "data/chapters";
    const configUrl = new URL(
      `${dataBasePath}/${chapterId}.json`,
      window.location.href,
    );

    try {
      const response = await fetch(configUrl);

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (_error) {
      return null;
    }
  }

  function renderChapter(chapterConfig) {
    titleNode.textContent = chapterConfig.chapterTitle + " Questions";

    chapterConfig.categories.forEach((category) => {
      const section = document.createElement("section");
      section.className = "category-section";

      const heading = document.createElement("h2");
      heading.textContent = category.name;
      section.appendChild(heading);

      category.questions.forEach((question, index) => {
        const card = document.createElement("article");
        card.className = "question-card";

        renderQuestionContent(card, question, `Q${index + 1}`);

        section.appendChild(card);
      });

      root.appendChild(section);
    });

    renderMath();
  }

  function renderLoadError(message) {
    titleNode.textContent = "Questions unavailable";
    root.innerHTML = "";

    const errorBox = document.createElement("section");
    errorBox.className = "category-section";

    const heading = document.createElement("h2");
    heading.textContent = "Load error";

    const body = document.createElement("p");
    body.textContent = message;

    errorBox.appendChild(heading);
    errorBox.appendChild(body);
    root.appendChild(errorBox);
  }

  function createToggleBox(className, content) {
    const box = document.createElement("div");
    box.className = `${className} is-hidden`;
    box.innerHTML = content;
    return box;
  }

  function renderQuestionContent(container, question, label) {
    const prompt = document.createElement("p");
    prompt.className = "question-prompt";
    prompt.innerHTML = `<strong>${label}.</strong> ${question.prompt}`;
    container.appendChild(prompt);

    if (question.image) {
      container.appendChild(createQuestionMedia(question.image));
    }

    if (Array.isArray(question.parts) && question.parts.length > 0) {
      container.appendChild(createQuestionParts(question.parts, label));
    } else {
      const interaction = createQuestionInteraction(question);
      if (interaction) {
        container.appendChild(interaction);
      }
    }

    if (question.hint) {
      const hintButton = document.createElement("button");
      hintButton.className = "question-button";
      hintButton.type = "button";
      hintButton.textContent = "Show hint";

      const hintBox = createToggleBox("hint-box", question.hint);
      hintButton.addEventListener("click", () => {
        toggleBox(hintBox, hintButton, "Show hint", "Hide hint");
      });

      container.appendChild(hintButton);
      container.appendChild(hintBox);
    }

    if (question.answer) {
      const answerButton = document.createElement("button");
      answerButton.className = "question-button";
      answerButton.type = "button";
      answerButton.textContent = "Show answer";

      const answerBox = createToggleBox("answer-box", question.answer);
      answerButton.addEventListener("click", () => {
        toggleBox(answerBox, answerButton, "Show answer", "Hide answer");
      });

      container.appendChild(answerButton);
      container.appendChild(answerBox);
    }
  }

  function createQuestionParts(parts, parentLabel) {
    const list = document.createElement("ol");
    list.className = "question-parts";

    parts.forEach((part, index) => {
      const item = document.createElement("li");
      item.className = "question-part";
      const partLabel = part.label || `(${String.fromCharCode(97 + index)})`;
      renderQuestionContent(item, part, `${parentLabel}${partLabel}`);
      list.appendChild(item);
    });

    return list;
  }

  function createQuestionMedia(media) {
    const figure = document.createElement("figure");
    figure.className = "question-media";

    const image = document.createElement("img");
    image.className = "question-image";
    image.src = media.src;
    image.alt = media.alt || "";

    figure.appendChild(image);

    if (media.caption) {
      const caption = document.createElement("figcaption");
      caption.textContent = media.caption;
      figure.appendChild(caption);
    }

    return figure;
  }

  function createQuestionInteraction(question) {
    if (question.type === "multiple-choice") {
      return createMultipleChoice(question);
    }

    if (question.type === "numeric") {
      return createNumeric(question);
    }

    return null;
  }

  function toggleBox(box, button, closedText, openText) {
    const isHidden = box.classList.toggle("is-hidden");
    button.textContent = isHidden ? closedText : openText;
    renderMath();
  }

  function createMultipleChoice(question) {
    const wrapper = document.createElement("div");
    wrapper.className = "mcq";

    const optionList = document.createElement("div");
    optionList.className = "mcq-options";

    let selectedIndex = -1;

    question.options.forEach((option, idx) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "option-button";
      button.innerHTML = option;
      button.addEventListener("click", () => {
        selectedIndex = idx;
        optionList.querySelectorAll("button").forEach((node) => {
          node.classList.remove("selected");
        });
        button.classList.add("selected");
      });
      optionList.appendChild(button);
    });

    const submitButton = document.createElement("button");
    submitButton.type = "button";
    submitButton.className = "question-button";
    submitButton.textContent = "Submit choice";

    const result = document.createElement("p");
    result.className = "mcq-result";

    submitButton.addEventListener("click", () => {
      if (selectedIndex === -1) {
        result.textContent = "Choose an option first.";
      } else if (selectedIndex === question.correctIndex) {
        result.textContent = "Correct.";
      } else {
        result.textContent = "Not quite. Try again or reveal the answer.";
      }
    });

    wrapper.appendChild(optionList);
    wrapper.appendChild(submitButton);
    wrapper.appendChild(result);
    return wrapper;
  }

  function createNumeric(question) {
    const wrapper = document.createElement("div");
    wrapper.className = "numeric-question";

    const input = document.createElement("input");
    input.type = "number";
    input.step = "any";
    input.className = "numeric-input";
    input.setAttribute("aria-label", "Numeric answer");

    const submitButton = document.createElement("button");
    submitButton.type = "button";
    submitButton.className = "question-button";
    submitButton.textContent = "Submit number";

    const result = document.createElement("p");
    result.className = "numeric-result";

    submitButton.addEventListener("click", () => {
      const rawAnswer = Number.parseFloat(question.answer);
      const tolerance = Number.isFinite(question.tolerance) ? question.tolerance : 0;
      const typed = Number.parseFloat(input.value);

      if (!Number.isFinite(typed)) {
        result.textContent = "Enter a number first.";
        return;
      }

      if (Math.abs(typed - rawAnswer) <= tolerance) {
        result.textContent = "Correct.";
      } else {
        result.textContent = "Not quite. Try again or reveal the answer.";
      }
    });

    wrapper.appendChild(input);
    wrapper.appendChild(submitButton);
    wrapper.appendChild(result);
    return wrapper;
  }

  function renderMath() {
    if (window.MathJax && typeof window.MathJax.typesetPromise === "function") {
      window.MathJax.typesetPromise().catch(function () {});
    }
  }
})();
