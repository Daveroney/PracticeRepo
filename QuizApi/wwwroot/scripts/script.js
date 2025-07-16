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
    fetchHtmlSheetContent(currentPage);
    setActiveSidebarLink(currentPage);
    createCategoriesForObjectsStored();
  }

  function updateContent(event) {
    event.preventDefault();
    // Find the nearest ancestor anchor element to avoid errors when clicking on elements within an anchor
    const anchorElement = event.target.closest("a");
    if (anchorElement) {
      const newPage = anchorElement.getAttribute("href").substring(1);
      fetchHtmlSheetContent(newPage);
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
    // Check if current page is the same as anchor id; if so, set active class. Remove active class initially
    for (let index = 0; index < navbarLinks.length; index++) {
      const linkToBeActive = navbarLinks[index];
      linkToBeActive.classList.remove("active");
      if (linkToBeActive.id == currentPage) {
        linkToBeActive.setAttribute("class", "active");
      }
    }
  }

  /**
   * Fetch HTML sheet content for a specified page and set it up for display.
   * @param {string} newPage - The name or identifier of the new page to fetch content for.
   */
  function fetchHtmlSheetContent(newPage) {
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
  function createNewPage(questionSet) {
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
    const showCorrectAnswerButton = document.createElement("button");
    showCorrectAnswerButton.textContent = "Antwort anzeigen";
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
    indexCard.appendChild(showCorrectAnswerButton);
    indexCardAnswers.appendChild(answerList);
    currentPageContent.appendChild(buttonContainer);
    buttonContainer.appendChild(nextButton);
    renderRandomQuestion(questionSet.id, indexCardTitle, answerList);
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

  async function displayCorrectAnswer(questionId, fetchQuestionFn) {
    const question = await fetchQuestionFn(questionId);
    const correctAnswerIndex = question.correctAnswersIndex;
    const correctAnswer = question.possibleAnswers[correctAnswerIndex];
    console.log("Correct answer:", correctAnswer);
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
    const questionSetTitleInput = document.getElementById(
      "question-set-user-input"
    );
    const descriptionInput = document.getElementById(
      "question-set-description-user-input"
    );
    creationDropdown.addEventListener("change", () =>
      toggleItemCreationVisibility(creationDropdown.value)
    );
    populateQuestionSets();
    questionSetCreateButton.addEventListener("click", function () {
      createQuestionSet(questionSetTitleInput.value, descriptionInput.value);
    });
    indexCardCreateButton.addEventListener("click", function () {
      const questionSetId = document.getElementById(
        "question-set-dropdown"
      ).value;
      const questionText = document.getElementById(
        "index-card-question-text"
      ).value;
      const possibleAnswers = Array.from(
        document.querySelectorAll(".index-card-possible-answer")
      ).map((input) => input.value);
      createIndexCard(questionSetId, questionText, possibleAnswers);
    });
    createCardAnswerButton.addEventListener("click", function () {
      const answerInput = document.createElement("input");
      answerInput.setAttribute("type", "text");
      answerInput.setAttribute("class", "index-card-possible-answer");
      answerInput.setAttribute("placeholder", "Antwort hinzufügen");

      const answersContainer = document.querySelector(".index-card-answers");
      const button = document.getElementById("create-card-add-answer-button");
      answersContainer.insertBefore(answerInput, button);
    });
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

  async function getQuestionSetById(questionSetId) {
    const response = await fetch(`/api/question/questionSets/${questionSetId}`);
    if (!response.ok) {
      throw new Error("Error fetching question set");
    }
    return response.json();
  }

  async function getQuestionById(questionId) {
    const response = await fetch(`/api/question/questions/${questionId}`);
    if (!response.ok) {
      throw new Error("Error fetching question");
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

  async function createIndexCard(questionSetId, questionText, possibleAnswers) {
    const response = await fetch(
      `/api/question/questionSets/${questionSetId}/questions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionText: questionText,
          possibleAnswers: possibleAnswers,
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

  async function updateQuestionSet(questionSetId, name, description) {
    const response = await fetch(
      `/api/question/questionSets/${questionSetId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          description: description,
        }),
      }
    );
  }

  async function deleteQuestionSet(questionSetId) {
    const response = await fetch(
      `/api/question/questionSets/${questionSetId}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      throw new Error("Error deleting question set");
    }
  }

  //#endregion

  setupNavigationBar();
  loadCurrentContentHtmlInitially();
})();
