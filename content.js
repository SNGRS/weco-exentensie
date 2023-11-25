const addressWebsocket = "ws://localhost:3636"

/// DOM SELECTORS
const domWecoSite = "#site"
const domWecoOrderConfPage = "#losse-verkoop p.buttons > a"
const domWecoCurrentPrice = "tr:last-child .prijs"

const domExtOpenCashdrawerID = "openKassalade"
const domExtOpenChangePopupID = "openWisselgeldPopup"

/// Opstartscript
async function initialize() {
  const isWebSocketReady = await isWebSocketAvailable();

  if (isWebSocketReady) {

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
  button.id = domExtOpenChangePopupID;
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
  var totalprijs_el = parseFloat(
    document
      .querySelector(domWecoCurrentPrice)
      .textContent.replace("Totaal: € ", "")
      .replace(",", ".")
  );

  chrome.runtime.sendMessage({ prijs: totalprijs_el });
}

/// RUN EXTENSIE
initialize();
