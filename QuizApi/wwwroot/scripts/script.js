//#region page functions

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
  } else if (newPage === "ExampleCards") {
    setupIndexCards();
  }
  return htmlContent;
}

function setPageTitle(pageTitle) {
  document.title = pageTitle;
}
//#endregion

//#region sidebar functions
function setupNavigationBar() {
  const sidebarLinks = document.querySelectorAll(".sidebar-nav a");
  sidebarLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      updateContent(event);
    });
  });
  // SIDEBAR TOGGLE BUTTONS
  const toggleButtonOpen = document.getElementById("toggle-close-button");
  const toggleButtonClose = document.getElementById("toggle-open-button");
  const sidebar = document.querySelector(".sidebar");
  toggleButtonClose.style.display = "none";

  function closeNavigation() {
    // sidebar is open, close it
    sidebar.style.display = "none";
    toggleButtonOpen.style.display = "none";
    toggleButtonClose.style.display = "block";
  }
  toggleButtonOpen.addEventListener("click", closeNavigation);

  function openNavigation() {
    // sidebar is closed, open it
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
    if (linkToBeActive.id === currentPage) {
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

function setupIndexCards() {
  const nextButton = document.getElementById("index-card-next-button");
  nextButton.addEventListener("click", insertIndexCardData);

  function fetchIndexCardData(apiEndpoint) {
    return fetch(`/api/question/${apiEndpoint}`).then((response) => {
      if (!response.ok) {
        throw new Error(
          "Error fetching index card data: " + response.statusText
        );
      }
      return response.json();
    });
  }

  async function insertIndexCardData() {
    try {
      const indexCardData = await fetchIndexCardData("questionSets");
      const indexCardToInsert = document.getElementById("index-card-wrapper");
      if (indexCardData && indexCardData.length > 0) {
        const firstIndexCard = indexCardData[0];
        const answersHtml = firstIndexCard.PossibleAnswers.map(
          (answer) => `<p>Possible Answer: ${answer}</p>`
        ).join("");
        indexCardToInsert.innerHTML = `
        <h2>${firstIndexCard.QuestionText}</h2>
        ${answersHtml}
      `;
      } else {
        indexCardToInsert.innerHTML = "<p>No index card data available.</p>";
      }
    } catch (error) {
      console.error("Error inserting index card data:", error);
    }
  }
}
//#endregion

setupNavigationBar();
loadCurrentContentHtmlInitially();
