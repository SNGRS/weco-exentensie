const addressWebsocket = "ws://localhost:3636";

const domExtChangeInputID = "wisselgeld_input";
const domExtChangeFeedbackID = "wisselgeld_feedback";
const domExtChangeCashdrawerID = "wisselgeld_openlade";

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.prijs) {
    WisselgeldFunctie(request.prijs);
  }
});

function kickCashdrawer() {
  const socket = new WebSocket(addressWebsocket);
  socket.addEventListener("open", () => {
    socket.send("openKassalade");
    socket.close();
  });
}

function WisselgeldFunctie(totalprijs_el) {
  document.querySelector("h1").textContent = "Bedrag is €" + totalprijs_el;

  var inputElement = document.createElement("input");
  inputElement.setAttribute("type", "text");
  inputElement.setAttribute("id", domExtChangeInputID);
  inputElement.setAttribute("autofocus", "")
  inputElement.setAttribute("placeholder", "Ingevoerd bedrag");

  inputElement.addEventListener("input", function () {
    let inputValue = this.value;
    inputValue = inputValue.replace(/[^0-9]/g, "").replace(/^0+/, "");
    if (inputValue.length <= 2) {
      inputValue = "0." + inputValue.padStart(2, "0");
    } else {
      inputValue = inputValue.slice(0, -2) + "." + inputValue.slice(-2);
    }
    this.value = inputValue;
  });
  inputElement.addEventListener("input", calculateChange);

  var pElement = document.createElement("p");
  pElement.textContent = "Wisselgeld: € ";
  var spanElement = document.createElement("span");
  spanElement.setAttribute("id", domExtChangeFeedbackID);
  spanElement.textContent = "0,00";
  pElement.appendChild(spanElement);

  var buttonElement = document.createElement("button");
  buttonElement.textContent = "Kassalade openen";
  buttonElement.setAttribute("id", domExtChangeCashdrawerID);
  buttonElement.addEventListener("click", function () {
    kickCashdrawer();
  });

  var container = document.querySelector("body");
  container.appendChild(inputElement);
  container.appendChild(pElement);
  container.appendChild(buttonElement);

  function calculateChange() {
    const wisselgeldInput = document.getElementById(domExtChangeInputID);
    const wisselgeldEl = document.getElementById(domExtChangeFeedbackID);

    const ingevoerdBedrag = parseFloat(wisselgeldInput.value);
    const totaalBedrag = parseFloat(totalprijs_el);

    let wisselgeld = (ingevoerdBedrag - totaalBedrag).toFixed(2);
    wisselgeldEl.textContent = wisselgeld;
  }
}
