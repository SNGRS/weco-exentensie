/* --------------------------
* TODO *

- Evt pinkoppeling met PinTool
- - Beide knoppen disablen
- - Websocket naar tool https://chat.openai.com/c/bd112a8c-2106-410b-a3f3-d4d749d109e9 & https://chat.openai.com/c/3a0ed0ac-455d-4dee-bb87-5e9da7778116
- - Indien mislukt: nee, indien gelukt: ja
- Check of de sockets ready zijn!

-------------------------- */
function kickCashdrawer() {
  const socket = new WebSocket("ws://localhost:3636");
  socket.addEventListener("open", () => {
    socket.send("openKassalade");
    socket.close();
  });
}

function addKassaladeButton() {
  const button = document.createElement("button");
  button.id = "openKassalade";
  button.textContent = "Kassalade openen";
  button.style.display = "none";
  button.addEventListener("click", function () {
    kickCashdrawer();
  });

  document.querySelector("#site").appendChild(button);
}

function orderConf() {
  const element = document.querySelector("#losse-verkoop p.buttons > a");

  if (element) {
    const html = document.documentElement.outerHTML;
    const socket = new WebSocket("ws://localhost:3636"); // Vervang "example.com" door je serveradres
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
        //alert("OK ontvangen, de verbinding wordt gesloten.");
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

//////////////////////////////////////

function PinFunctie() {
  var totalprijs_el = parseFloat(
    document
      .querySelector("tr:last-child .prijs")
      .textContent.replace("Totaal: € ", "")
      .replace(",", ".")
  );
  document.querySelector(".jconfirm-title").textContent =
    "Bedrag is €" + totalprijs_el;

  //verzendPinTransactie(totalprijs_el);
  //controleerPinTranactie()
}

function WisselgeldFunctie() {
  var totalprijs_el = parseFloat(
    document
      .querySelector("tr:last-child .prijs")
      .textContent.replace("Totaal: € ", "")
      .replace(",", ".")
  );
  document.querySelector(".jconfirm-title").textContent =
    "Bedrag is €" + totalprijs_el;

  var inputElement = document.createElement("input");
  inputElement.setAttribute("type", "text");
  inputElement.setAttribute("id", "wisselgeld_input");
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
  spanElement.setAttribute("id", "wisselgeld_feedback");
  spanElement.textContent = "0,00";
  pElement.appendChild(spanElement);

  var buttonElement = document.createElement("button");
  buttonElement.textContent = "Kassalade openen";
  buttonElement.addEventListener("click", function () {
    kickCashdrawer();
  });

  var container = document.querySelector(".jconfirm-content"); // Vervang "container" door de ID van de container waarin je deze elementen wilt plaatsen
  container.appendChild(inputElement);
  container.appendChild(pElement);
  container.appendChild(buttonElement);

  function calculateChange() {
    const wisselgeldInput = document.getElementById("wisselgeld_input");
    const wisselgeldEl = document.getElementById("wisselgeld_feedback");

    const ingevoerdBedrag = parseFloat(wisselgeldInput.value);
    const totaalBedrag = parseFloat(totalprijs_el);

    let wisselgeld = (ingevoerdBedrag - totaalBedrag).toFixed(2);
    wisselgeldEl.textContent = wisselgeld;
  }
}

function handleJSConfirmAvailability() {
  const config = { childList: true, subtree: true };
  let jsconfirmElement = document.querySelector(".jconfirm-open");

  function performActions() {
    const betaalmethode = document.querySelector('input[name="betaalmethode"]').value;

    if (betaalmethode === "CASH") {
      WisselgeldFunctie();
    } else if (betaalmethode === "PIN") {
      PinFunctie();
    }

    // Voer andere gewenste acties uit op basis van betaalmethode
  }

  const observer = new MutationObserver(() => {
    const currentJsconfirmElement = document.querySelector(".jconfirm-open");

    if (currentJsconfirmElement !== jsconfirmElement) {
      // Het jsconfirmElement is veranderd (verwijderd of opnieuw toegevoegd)
      jsconfirmElement = currentJsconfirmElement;

      if (jsconfirmElement) {
        // Het element is opnieuw toegevoegd, voer acties uit
        performActions();
      }
    }
  });

  observer.observe(document.body, config);

  // Voer de acties direct uit als het element al beschikbaar is
  if (jsconfirmElement) {
    performActions();
  }
}

function isWebSocketAvailable() {
  const socket = new WebSocket("ws://localhost:3636");

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

async function initialize() {
  const isWebSocketReady = await isWebSocketAvailable();

  if (isWebSocketReady) {
    if (document.readyState === "complete") {
      handleJSConfirmAvailability();
    } else {
      window.addEventListener("load", () => {
        handleJSConfirmAvailability();
      });
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", addKassaladeButton);
      document.addEventListener("DOMContentLoaded", orderConf);
    } else {
      addKassaladeButton();
      orderConf();
    }
  } else {
    console.error("WebSocket connection to localhost:3636 is not available.");
  }
}

initialize();
