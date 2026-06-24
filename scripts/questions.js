(function () {
  const chapterConfig = window.chapterConfig;
  const titleNode = document.getElementById("chapter-title");
  const root = document.getElementById("question-root");

  if (!chapterConfig || !titleNode || !root) {
    return;
  }

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

      const prompt = document.createElement("p");
      prompt.className = "question-prompt";
      prompt.innerHTML = `<strong>Q${index + 1}.</strong> ${question.prompt}`;
      card.appendChild(prompt);

      if (question.type === "multiple-choice") {
        card.appendChild(createMultipleChoice(question));
      }

      if (question.type === "numeric") {
        card.appendChild(createNumeric(question));
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

        card.appendChild(hintButton);
        card.appendChild(hintBox);
      }

      const answerButton = document.createElement("button");
      answerButton.className = "question-button";
      answerButton.type = "button";
      answerButton.textContent = "Show answer";

      const answerBox = createToggleBox("answer-box", question.answer);
      answerButton.addEventListener("click", () => {
        toggleBox(answerBox, answerButton, "Show answer", "Hide answer");
      });

      card.appendChild(answerButton);
      card.appendChild(answerBox);

      section.appendChild(card);
    });

    root.appendChild(section);
  });

  renderMath();

  function createToggleBox(className, content) {
    const box = document.createElement("div");
    box.className = `${className} is-hidden`;
    box.innerHTML = content;
    return box;
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
