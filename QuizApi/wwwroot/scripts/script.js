// Encapsulate my code to make it not global
(function () {
  //#region sidebar functions & routing

  /**
   * Set up the HTML content for a new page.
   * @param {string} htmlContent - An HTML string containing the content to be displayed on the new page.
   * @param {string} newPage - The name or identifier of the new page.
   * @returns {string} - The HTML content that was set up for the new page.
   */
  function setupHTMLContent(htmlContent, newPage) {
    const contentArea = document.getElementById("sheet-root");
    contentArea.innerHTML = htmlContent;
    history.pushState({ page: newPage }, null, `#${newPage}`);
    if (newPage === "Frontpage") {
      setupFrontPage();
    } else if (newPage === "CreateCard") {
      setupCreateCardPage();
    }
    return htmlContent;
  }

  function setPageTitle(pageTitle) {
    document.title = pageTitle;
  }

  function removeText() {
    const currentPageContent = document.getElementById("sheet-root");
    currentPageContent.innerHTML = "";
  }

  function setupNavigationBar() {
    const sidebarLinks = document.querySelectorAll(".sidebar-nav a");
    sidebarLinks.forEach((link) => {
      link.addEventListener("click", function (event) {
        updateContent(event);
      });
    });

    const toggleButtonOpen = document.getElementById("toggle-close-button");
    const toggleButtonClose = document.getElementById("toggle-open-button");
    const sidebar = document.querySelector(".sidebar");
    toggleButtonClose.style.display = "none";

    function closeNavigation() {
      sidebar.style.display = "none";
      toggleButtonOpen.style.display = "none";
      toggleButtonClose.style.display = "block";
    }
    toggleButtonOpen.addEventListener("click", closeNavigation);

    function openNavigation() {
      sidebar.style.display = "flex";
      toggleButtonOpen.style.display = "block";
      toggleButtonClose.style.display = "none";
    }
    toggleButtonClose.addEventListener("click", openNavigation);
  }

  function loadCurrentContentHtmlInitially() {
    const currentPage = window.location.hash.substring(1);
    fetchHtmlPageContent(currentPage);
    setActiveSidebarLink(currentPage);
    createCategoriesForObjectsStored();
  }

  function updateContent(event) {
    event.preventDefault();
    // Find the nearest ancestor anchor element to avoid errors when clicking on elements within an anchor
    const anchorElement = event.target.closest("a");
    if (anchorElement) {
      const newPage = anchorElement.getAttribute("href").substring(1);
      fetchHtmlPageContent(newPage);
      setActiveSidebarLink(newPage);
    }
  }

  function setupFrontPage() {
    const frontPageLinks = document.querySelectorAll(".element-links a");
    frontPageLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        let clickedElement = event.target;
        while (clickedElement) {
          if (clickedElement.tagName === "A") {
            updateContent(event);
            break;
          }
          clickedElement = clickedElement.parentElement;
        }
      });
    });
  }

  /**
   * Set the class of the corresponding sidebar element to active.
   * @param {string} currentPage - The path to the html document to be set to active
   */
  function setActiveSidebarLink(currentPage) {
    const navbarLinks = document
      .getElementById("sidebar-list")
      .getElementsByTagName("a");
    // Check if current page is the same as anchor id; if so, set active class.
    for (let index = 0; index < navbarLinks.length; index++) {
      const linkToBeActive = navbarLinks[index];
      linkToBeActive.classList.remove("active");
      if (linkToBeActive.id == currentPage) {
        linkToBeActive.setAttribute("class", "active");
      }
    }
  }

  /**
   * Fetch HTML page content for a specified page and set it up for display.
   * @param {string} newPage - The name or identifier of the new page to fetch content for.
   */
  function fetchHtmlPageContent(newPage) {
    if (!newPage) {
      newPage = "Frontpage";
    }
    setPageTitle(`${newPage}`);
    // get target anchor of href
    fetch(`pages/${newPage}.html`)
      // load URL path
      .then(function (response) {
        const htmlText = getTextFromRequestedFileIfResponseIsOk(
          response,
          newPage
        );
        return htmlText;
      })
      .then(function (htmlContent) {
        setupHTMLContent(htmlContent, newPage);
      })
      .catch(function (error) {
        onErrorWhileLoadingHtml(error, newPage);
      });
  }

  /**
   * Create a new sidebar element for a question set and add it to the sidebar.
   * @param {object} questionSet - The question set object containing id and name.
   */
  function createNewSidebarCategory(questionSet) {
    const sidebarList = document.getElementById("sidebar-list");
    const newCategory = document.createElement("li");
    const newAnchor = document.createElement("a");
    newAnchor.innerHTML = questionSet.name;
    newAnchor.id = questionSet.id;
    newAnchor.style.cursor = "pointer";
    sidebarList.appendChild(newCategory);
    newCategory.appendChild(newAnchor);
    newAnchor.addEventListener("click", function () {
      setPageTitle(questionSet.name);
      removeText();
      createNewPage(questionSet);
      setActiveSidebarLink(questionSet.id);
    });
  }

  async function createCategoriesForObjectsStored() {
    const categories = await getAllQuestionSets();
    updateSidebar(categories);
  }

  function updateSidebar(indexCardQuestionSets) {
    const staticPartOfNavbar = document.getElementById("sidebar-list");
    const homeSidebar = document.getElementById("category-sidebar");
    homeSidebar.innerHTML = "";
    for (const category of indexCardQuestionSets) {
      createNewSidebarCategory(category);
    }
    staticPartOfNavbar.appendChild(homeSidebar);
  }

  //#endregion

  //#region error handling

  function getTextFromRequestedFileIfResponseIsOk(response, newPage) {
    if (response.ok) {
      return response.text();
    } else {
      throw new Error(`Error loading ${newPage}.html.`);
    }
  }

  /**
   * Handle errors that occur while loading HTML content for a page and display an error message.
   * @param {Error} error - The error that occurred during loading.
   * @param {string} pageWhereErrorOccurred - The name or identifier of the page where the error occurred.
   */
  function onErrorWhileLoadingHtml(error, pageWhereErrorOccurred) {
    const contentArea = document.getElementById("sheet-root");
    history.pushState({ page: pageWhereErrorOccurred }, null, `#error`);
    contentArea.innerHTML = `<h1>Error loading ${pageWhereErrorOccurred}.html</h1>
  <p>${error.message}</p>`;
  }
  //#endregion

  //#region index card functions

  /**
   * Mocks a HTML page for a question set and sets up the necessary elements.
   * @param {object} questionSet - The question set object containing id and name.
   */
  async function createNewPage(questionSet) {
    const currentPageContent = document.getElementById("sheet-root");
    const header = document.createElement("h1");
    header.textContent = questionSet.name;
    const indexCardWrapper = document.createElement("div");
    indexCardWrapper.setAttribute("class", "index-card-wrapper");
    indexCardWrapper.setAttribute("id", `question-set-${questionSet.id}`);
    currentPageContent.appendChild(indexCardWrapper);
    const indexCardBorder = document.createElement("div");
    indexCardBorder.setAttribute("class", "index-card-border");
    const indexCard = document.createElement("div");
    indexCard.setAttribute("class", "index-card");
    const indexCardHeader = document.createElement("div");
    indexCardHeader.setAttribute("class", "index-card-header");
    const indexCardTitle = document.createElement("h2");
    indexCardTitle.setAttribute("id", "index-card-title");
    const indexCardAnswers = document.createElement("div");
    indexCardAnswers.setAttribute("class", "index-card-answers");
    const answerList = document.createElement("ul");
    const showCorrectAnswersButton = document.createElement("button");
    showCorrectAnswersButton.textContent = "Antwort anzeigen";
    const buttonContainer = document.createElement("div");
    const nextButton = document.createElement("button");
    nextButton.setAttribute("id", "next-question-button");
    nextButton.textContent = "Nächste Karte";
    buttonContainer.setAttribute("class", "button-container");
    currentPageContent.appendChild(header);
    currentPageContent.appendChild(indexCardWrapper);
    indexCardWrapper.appendChild(indexCardBorder);
    indexCardBorder.appendChild(indexCard);
    indexCard.appendChild(indexCardHeader);
    indexCardHeader.appendChild(indexCardTitle);
    indexCard.appendChild(indexCardAnswers);
    indexCard.appendChild(showCorrectAnswersButton);
    indexCardAnswers.appendChild(answerList);
    currentPageContent.appendChild(buttonContainer);
    buttonContainer.appendChild(nextButton);

    const questionCardData = await renderRandomQuestion(
      questionSet.id,
      indexCardTitle,
      answerList
    );

    //TODO - FIX!: This will always return the correct answers for the next question, since the renderRandomQuestion is being called again.
    showCorrectAnswersButton.addEventListener("click", async () => {
      const questionId = questionCardData.id;
      if (questionId) {
        await displayCorrectAnswer(questionCardData.correctAnswersIndex);
      } else {
        console.error(
          "No question ID found for displaying the correct answer."
        );
      }
    });

    nextButton.addEventListener("click", () => {
      renderRandomQuestion(questionSet.id, indexCardTitle, answerList);
    });
  }

  async function fetchRandomQuestionData(questionSetId) {
    return getRandomQuestion(questionSetId);
  }

  function renderQuestionToDOM(data, title, answerContainer) {
    title.textContent = data.questionText;
    answerContainer.innerHTML = "";
    data.possibleAnswers.forEach((answer) => {
      const answerItem = document.createElement("li");
      answerItem.textContent = answer;
      answerItem.style.lineHeight = "2";
      answerContainer.appendChild(answerItem);
    });
  }

  async function renderRandomQuestion(questionSetId, title, answerContainer) {
    try {
      const data = await fetchRandomQuestionData(questionSetId);
      renderQuestionToDOM(data, title, answerContainer);
      return data;
    } catch (error) {
      console.error("Error fetching random question:", error);
      title.textContent =
        "Keine Karten verfügbar. Erstelle Karteikarten im 'Home-Tab'.";
      return null;
    }
  }

  /**
   * Changes the color of index card answers based on whether they are correct or not.
   * @param {Array} correctAnswersIndex - A number array containing the indexes of the correct answers.
   */
  async function displayCorrectAnswer(correctAnswersIndex) {
    const answerItems = document.querySelectorAll(".index-card-answers li");
    if (answerItems.length === 0) {
      console.log("No answers available to display.");
      return;
    }
    answerItems.forEach((item, index) => {
      if (correctAnswersIndex.includes(index)) {
        item.style.backgroundColor = "lightgreen";
      } else {
        item.style.backgroundColor = "lightcoral";
      }
    });
  }

  //#endregion

  //#region index card and question set creation

  /**
   * Initialize event listeners and populate the dropdown for question sets.
   */
  function setupCreateCardPage() {
    const creationDropdown = document.getElementById("create-selection");
    const questionSetCreateButton = document.getElementById(
      "question-set-create-button"
    );
    const createCardAnswerButton = document.getElementById(
      "create-card-add-answer-button"
    );
    const indexCardCreateButton = document.getElementById(
      "index-card-create-button"
    );
    creationDropdown.addEventListener("change", () =>
      toggleItemCreationVisibility(creationDropdown.value)
    );

    questionSetCreateButton.addEventListener("click", function () {
      const questionSetTitleInput = document.getElementById(
        "question-set-user-input"
      ).value;
      const questionSetDescriptionInput = document.getElementById(
        "question-set-description-user-input"
      ).value;
      createQuestionSet(questionSetTitleInput, questionSetDescriptionInput);
    });

    indexCardCreateButton.addEventListener("click", function () {
      const questionSetId = document.getElementById(
        "question-set-dropdown"
      ).value;
      const difficulty = document.getElementById("question-difficulty").value;
      const mappedDifficulty = mapDifficulty(difficulty);
      const questionText = document.getElementById(
        "index-card-question-text"
      ).value;
      const possibleAnswers = Array.from(
        document.querySelectorAll(".index-card-possible-answer")
      ).map((input) => input.value);
      createIndexCard(
        questionSetId,
        mappedDifficulty,
        questionText,
        possibleAnswers,
        getCorrectAnswersIndexFromCheckboxes(),
        // TODO
        // Tips, tags and explanation inputs have low priority and are currently not implemented in the UI
        // Thus, they are set to empty strings or arrays.
        "",
        [""],
        ""
      );
    });

    createCardAnswerButton.addEventListener("click", function () {
      const answerContainer = document.createElement("div");
      answerContainer.classList.add("answer-item");

      const checkbox = document.createElement("input");
      checkbox.setAttribute("type", "checkbox");
      checkbox.classList.add("answer-correct-checkbox");
      checkbox.setAttribute("title", "Richtige Antwort");

      const answerInput = document.createElement("input");
      answerInput.setAttribute("type", "text");
      answerInput.setAttribute("class", "index-card-possible-answer");
      answerInput.setAttribute("placeholder", "Antwort hinzufügen");

      answerContainer.appendChild(answerInput);
      answerContainer.appendChild(checkbox);

      const answersWrapper = document.querySelector(".index-card-answers");
      const addButton = document.getElementById(
        "create-card-add-answer-button"
      );

      answersWrapper.insertBefore(answerContainer, addButton);
    });

    populateQuestionSets();
  }

  function getCorrectAnswersIndexFromCheckboxes() {
    const checkboxes = document.querySelectorAll(".answer-correct-checkbox");
    const correctAnswersIndex = [];
    checkboxes.forEach((checkbox, index) => {
      if (checkbox.checked) {
        correctAnswersIndex.push(index);
      }
    });
    return correctAnswersIndex;
  }

  /**
   * Maps a difficulty string to the corresponding backend expected value.
   * @param {string} difficulty - The string to be mapped to the corresponding difficulty.
   * @returns {string} - The mapped difficulty string the backend expects.
   */
  function mapDifficulty(difficulty) {
    switch (difficulty) {
      case "Einfach":
        return "Easy";
      case "Mittel":
        return "Medium";
      case "Schwer":
        return "Hard";
      default:
        return "Easy";
    }
  }

  function toggleItemCreationVisibility(dropdownValue) {
    const selectedValue = dropdownValue;
    const indexCardCreation = document.querySelector(".index-card-creation");
    const questionSetCreation = document.querySelector(
      ".question-set-creation"
    );
    if (selectedValue === "existing") {
      indexCardCreation.style.display = "block";
      questionSetCreation.style.display = "none";
    } else if (selectedValue === "new") {
      indexCardCreation.style.display = "none";
      questionSetCreation.style.display = "block";
    } else {
      indexCardCreation.style.display = "none";
      questionSetCreation.style.display = "none";
    }
  }

  /**
   * Fetches all question sets from the fetch API and renders a dropdown with the available data.
   */
  async function populateQuestionSets() {
    const questionSets = await getAllQuestionSets();
    const questionSetDropdown = document.getElementById(
      "question-set-dropdown"
    );
    questionSetDropdown.innerHTML = "";
    questionSets.forEach((questionSet) => {
      const option = document.createElement("option");
      option.value = questionSet.id;
      option.textContent = questionSet.name;
      questionSetDropdown.appendChild(option);
    });
  }

  //#endregion

  //#region CRUD operations for index cards and question sets

  async function getAllQuestionSets() {
    const response = await fetch("/api/question/questionSets");
    if (!response.ok) {
      throw new Error("Error fetching question sets");
    }
    return response.json();
  }

  async function getRandomQuestion(questionSetId) {
    const response = await fetch(
      `/api/question/questionSets/${questionSetId}/randomQuestions`
    );
    if (!response.ok) {
      throw new Error("Error fetching random question");
    }
    return response.json();
  }

  async function createIndexCard(
    questionSetId,
    difficulty,
    questionText,
    possibleAnswers,
    correctAnswersIndex,
    tip,
    tags,
    explanation
  ) {
    const response = await fetch(
      `/api/question/questionSets/${questionSetId}/questions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionText: questionText,
          difficulty: difficulty,
          possibleAnswers: possibleAnswers,
          correctAnswersIndex: Array.isArray(correctAnswersIndex)
            ? correctAnswersIndex
            : [correctAnswersIndex],
          tip: tip || "",
          tags: Array.isArray(tags) ? tags : [] || [""],
          explanation: explanation || "",
        }),
      }
    );
    if (!response.ok) {
      throw new Error("Error creating index card");
    }
    return response.json();
  }

  async function createQuestionSet(name, description) {
    const response = await fetch(`/api/question/questionSets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        description: description,
      }),
    });
    if (!response.ok) {
      throw new Error("Error creating question set");
    }
    return response.json();
  }

  // Unused CRUD operations for question sets and questions

  // async function getQuestionSetById(questionSetId) {
  //   const response = await fetch(`/api/question/questionSets/${questionSetId}`);
  //   if (!response.ok) {
  //     throw new Error("Error fetching question set");
  //   }
  //   return response.json();
  // }

  // async function getQuestionById(questionId) {
  //   const response = await fetch(`/api/question/questions/${questionId}`);
  //   if (!response.ok) {
  //     throw new Error("Error fetching question");
  //   }
  //   return response.json();
  // }

  // async function updateQuestionSet(questionSetId, name, description) {
  //   const response = await fetch(
  //     `/api/question/questionSets/${questionSetId}`,
  //     {
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         name: name,
  //         description: description,
  //       }),
  //     }
  //   );
  // }

  // async function deleteQuestionSet(questionSetId) {
  //   const response = await fetch(
  //     `/api/question/questionSets/${questionSetId}`,
  //     {
  //       method: "DELETE",
  //     }
  //   );
  //   if (!response.ok) {
  //     throw new Error("Error deleting question set");
  //   }
  // }

  //#endregion

  setupNavigationBar();
  loadCurrentContentHtmlInitially();
})();
