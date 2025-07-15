const nextButton = document.getElementById("index-card-next-button");
nextButton.addEventListener("click", insertIndexCardData);

function fetchIndexCardData() {
  fetch("data/mockData.json").then((response) => {
    if (!response.ok) {
      throw new Error("Error fetching index card data: " + response.statusText);
    }
    return response.json();
  });
}

function insertIndexCardData() {
  const indexCardData = fetchIndexCardData();
  const indexCardToInsert = document.getElementById("index-card-wrapper");
  if (indexCardData && indexCardData.length > 0) {
    const firstIndexCard = indexCardData[0];
    indexCardToInsert.innerHTML = `
      <h2>${firstIndexCard.QuestionText}</h2>
      ${firstIndexCard.PossibleAnswers.forEach((answer) => {
        <p>Possible Answers: ${answer}</p>;
      })}
    `;
  } else {
    indexCardToInsert.innerHTML = "<p>No index card data available.</p>";
  }
}
