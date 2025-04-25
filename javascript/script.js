function getVandaag() {
  return new Date().toISOString().split("T")[0];
}

function updateStreak(gehaald) {
  let vandaag = getVandaag();
  let laatstGespeeld = localStorage.getItem("laatsteSpeeldag");
  let streak = parseInt(localStorage.getItem("streak")) || 0;

     if (gehaald) {
        if (!laatstGespeeld) {
          streak = 1;
        } else if (laatstGespeeld === vandaag) {
          console.log("Vandaag al gewonnen.");
        } else {
          let gisteren = new Date(laatstGespeeld);
          gisteren.setDate(gisteren.getDate() + 1);
          let gisterenString = gisteren.toISOString().split("T")[0];

          if (gisterenString === vandaag) {
            streak++;
          } else {
            streak = 1;
          }
        }
         localStorage.setItem("laatsteSpeeldag", vandaag);
        localStorage.setItem("streak", streak);
      }
    document.getElementById("streak").innerText = streak;
    }
function simulateGame(resultaat) {
      if (resultaat) {
        alert("Je hebt het gehaald!");
      } else {
        alert("Helaas, niet gehaald.");
      }
      updateStreak(resultaat);
    }

document.getElementById("streak").innerText = localStorage.getItem("streak") || 0;


