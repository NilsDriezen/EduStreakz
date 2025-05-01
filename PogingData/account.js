// Check/controle
let accountData = JSON.parse(localStorage.getItem("accountData"));

if (!accountData) {
  accountData = {
    gebruikersnaam: "skankhunt42",
    streak: 0,
    langsteStreak: 0,
    score: 0,
    vrienden: ["Damned123", "lolman", "Dwaas420"]
  };
  localStorage.setItem("accountData", JSON.stringify(accountData));
}

document.getElementById("gebruikersnaam").innerText = accountData.gebruikersnaam;
document.getElementById("streak").innerText = accountData.streak;
document.getElementById("langsteStreak").innerText = accountData.langsteStreak;
document.getElementById("score").innerText = accountData.score;

let vriendenLijst = document.getElementById("vriendenlijst");
accountData.vrienden.forEach(vriend => {
  let li = document.createElement("li");
  li.innerText = vriend;
  vriendenLijst.appendChild(li);
});

function verhoogStreak() {
  accountData.streak++;

  if (accountData.streak > accountData.langsteStreak) {
    accountData.langsteStreak = accountData.streak;
  }

  accountData.score += 10;


  localStorage.setItem("accountData", JSON.stringify(accountData));

  document.getElementById("streak").innerText = accountData.streak;
  document.getElementById("langsteStreak").innerText = accountData.langsteStreak;
  document.getElementById("score").innerText = accountData.score;
}
