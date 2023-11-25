const addressWebsocket = "ws://localhost:3636"

/// DOM SELECTORS
const domWecoSite = "#site"
const domWecoOrderConfPage = "#losse-verkoop p.buttons > a"
const domWecoCurrentPrice = "tr:last-child .prijs"

const domExtOpenCashdrawerID = "openKassalade"

/*const domWecoPaymentMethod = 'input[name="betaalmethode"]'
const domWecoConfirmOpen = ".jconfirm-open"
const domWecoConfirmTitle = ".jconfirm-title"
const domWecoConfirmContent = ".jconfirm-content"


const domExtChangeInputID ="wisselgeld_input"
const domExtChangeFeedbackID = "wisselgeld_feedback"  
const domExtChangeCashdrawerID = "wisselgeld_openlade"*/

/// Opstartscript
async function initialize() {
  const isWebSocketReady = await isWebSocketAvailable();

  if (isWebSocketReady) {
    /*if (document.readyState === "complete") {
      handleJSConfirmAvailability();
    } else {
      window.addEventListener("load", () => {
        handleJSConfirmAvailability();
      });
    }*/

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", addKassaladeButton);
      document.addEventListener("DOMContentLoaded", addWisselgeldButton);
      document.addEventListener("DOMContentLoaded", orderConf);
    } else {
      addKassaladeButton();
      addWisselgeldButton();
      orderConf();
    }
  } else {
    console.error("WebSocket connection to localhost:3636 is not available.");
  }
}

function isWebSocketAvailable() {
  const socket = new WebSocket(addressWebsocket);

  return new Promise((resolve) => {
    socket.addEventListener("open", () => {
      socket.close();
      resolve(true);
    });

    socket.addEventListener("error", () => {
      resolve(false);
      alert("GEEN VERBINDING MET SOCKETAPP | Controleer de status en ververs de kassa")
    });
  });
}

/*function handleJSConfirmAvailability() {
  const config = { childList: true, subtree: true };
  let jsconfirmElement = document.querySelector(domWecoConfirmOpen);

  function performActions() {
    const betaalmethode = document.querySelector(domWecoPaymentMethod).value;

    if (betaalmethode === "CASH") {
      WisselgeldFunctie();
    } else if (betaalmethode === "PIN") {
      PinFunctie();
    }
  }

  const observer = new MutationObserver(() => {
    const currentJsconfirmElement = document.querySelector(domWecoConfirmOpen);

    if (currentJsconfirmElement !== jsconfirmElement) {
      jsconfirmElement = currentJsconfirmElement;

      if (jsconfirmElement) {
        performActions();
      }
    }
  });

  observer.observe(document.body, config);
  if (jsconfirmElement) {
    performActions();
  }
}*/

//// Initiele functies
function addKassaladeButton() {
  const button = document.createElement("button");
  button.id = domExtOpenCashdrawerID;
  button.textContent = "Kassalade openen";
  button.style.display = "none";
  button.addEventListener("click", function () {
    kickCashdrawer();
  });

  document.querySelector(domWecoSite).appendChild(button);
}

function addWisselgeldButton() {
  const button = document.createElement("button");
  button.id = "openWisselgeldPopup";
  button.textContent = "Wisselgeld";
  button.style.display = "none";
  button.addEventListener("click", function () {
    toonPrijsPopup();
  });

  document.querySelector(domWecoSite).appendChild(button);
}


function orderConf() {
  const element = document.querySelector(domWecoOrderConfPage);

  if (element) {
    const html = document.documentElement.outerHTML;
    const socket = new WebSocket(addressWebsocket); // Vervang "example.com" door je serveradres
    socket.addEventListener("open", () => {
      socket.send(html);
    });

    const overlay = document.createElement("div");
    overlay.id = "overlay";
    const progress = document.createElement("div");
    progress.id = "overlay-prog";
    const status = document.createElement("div");
    status.id = "overlay-status";
    overlay.appendChild(progress);
    overlay.appendChild(status);
    document.querySelector("body").appendChild(overlay);

    socket.addEventListener("error", () => {
      document.querySelector("div#overlay").style.display = "none"
      alert("FOUT OPGETREDEN BIJ SOCKETAPP | PRINT DE KASSABON MANUEEL UIT EN CONTROLEER DE STATUS")
    });

    socket.addEventListener("message", (event) => {
      const receivedMessage = event.data;

      if (receivedMessage === "OK") {
        socket.close();
        window.location.href = "https://kassa.gbvweco.nl/?volgende=klant";
      } else {
        console.log("Ontvangen bericht:", receivedMessage);
        document.querySelector("#overlay-status").textContent =
          JSON.parse(receivedMessage)[1];
        document.querySelector("#overlay-prog").textContent =
          JSON.parse(receivedMessage)[0] * 100 + "%";
      }
    });

    socket.addEventListener("close", (event) => {
      if (event.wasClean) {
        console.log("De verbinding is gesloten.");
      } else {
        console.error("De verbinding is onverwacht gesloten.");
      }
    });
  }
}

//// Helper functies
function kickCashdrawer() {
  const socket = new WebSocket(addressWebsocket);
  socket.addEventListener("open", () => {
    socket.send("openKassalade");
    socket.close();
  });
}


function toonPrijsPopup() {
  //var prijsElement = document.querySelector(domWecoCurrentPrice);
  //var prijs = prijsElement.textContent;

  var totalprijs_el = parseFloat(
    document
      .querySelector(domWecoCurrentPrice)
      .textContent.replace("Totaal: € ", "")
      .replace(",", ".")
  );

  chrome.runtime.sendMessage({ prijs: totalprijs_el });
}

/*function PinFunctie() {
  var totalprijs_el = parseFloat(
    document
      .querySelector(domWecoCurrentPrice)
      .textContent.replace("Totaal: € ", "")
      .replace(",", ".")
  );
  document.querySelector(domWecoConfirmTitle).textContent =
    "Bedrag is €" + totalprijs_el;
}

function WisselgeldFunctie() {
  var totalprijs_el = parseFloat(
    document
      .querySelector(domWecoCurrentPrice)
      .textContent.replace("Totaal: € ", "")
      .replace(",", ".")
  );
  document.querySelector(domWecoConfirmTitle).textContent =
    "Bedrag is €" + totalprijs_el;

  var inputElement = document.createElement("input");
  inputElement.setAttribute("type", "text");
  inputElement.setAttribute("id", domExtChangeInputID);
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

  var container = document.querySelector(domWecoConfirmContent); // Vervang "container" door de ID van de container waarin je deze elementen wilt plaatsen
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
}*/

/// RUN EXTENSIE
initialize();
