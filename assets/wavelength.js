const needleContainer = document.getElementById("needleContainer");
const needle = document.getElementById("needle");
const targetArea = document.getElementById("targetArea");
const toggleButton = document.getElementById("toggleButton");
const nextRoundButton = document.getElementById("nextRoundButton");
// const skipRoundButton = document.getElementById("skipRoundButton");
const cluesElement = document.getElementById("clues");
const scoreElement = document.getElementById("score");
const totalScoreElement = document.getElementById("totalScore");

let isDragging = false;
let targetAngle = 0;
let isTargetVisible = true;
let totalScore = 0;
let canMoveNeedle = false;

const clues = [
  ["Malo", "Bueno"],
  ["Ligeramente adictivo", "Altamente adictivo"],
  ["Caliente", "Frío"],
  ["Normal", "Extraño"],
  ["Incoloro", "Colorido"],
  ["Bajo en calorías", "Alto en calorías"],
  ["Es desagradable", "Es agradable"],
  ["No esencial", "Esencial"],
  ["Barato", "Caro"],
  ["Arma subestimada", "Arma sobrevalorada"],
  ["Raro", "Común"],
  ["Emoji poco atractivo", "Emoji sexy"],
  ["Asunto fácil", "Asunto difícil"],
  ["Desconocido", "Famoso"],
  ["Difícil de usar", "Fácil de usar"],
  ["Sucio", "Limpio"],
  ["Requiere suerte", "Requiere habilidad"],
  ["Soso", "Sabroso"],
  ["Tema aburrido", "Tema fascinante"],
  ["Mal actor", "Buen actor"],
  ["Básico", "Hipster"],
  ["Trabajo peligroso", "Trabajo seguro"],
  ["Fantasía", "Ciencia ficción"],
  ["Casual", "Formal"],
  ["Trabajo infravalorado", "Trabajo sobrevalorado"],
  ["Seco", "Mojado"],
  ["Prohibido", "Alentado"],
  ["Canción triste", "Cancion alegre"],
  ["Frágil", "Resistente"],
  ["Bueno", "Malo"],
  ["Peor dia del año", "Mejor día del año"],
  ["Mal hábito", "Buen hábito"],
  ["Persona gato", "Persona perro"],
  // Página 3
  // https://boardgamegeek.com/filepage/216755/cartas-en-espanol
  // https://boardgamegeek.com/file/download_redirect/aa53d365fec472c6177a1b69e05f7c30458743af5c4f8dda/wavelength+esp+v1_0.pdf
];

const teamSetup = document.getElementById("teamSetup");
const teamCount = document.getElementById("teamCount");
const teamNames = document.getElementById("teamNames");
const startGameButton = document.getElementById("startGame");
const gameContainer = document.querySelector(".game-container");

let teams = [];

teamCount.addEventListener("change", updateTeamInputs);

function updateTeamInputs() {
  const count = Math.min(Math.max(teamCount.min, teamCount.value), teamCount.max);
  teamCount.value = count;

  teamNames.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = `Nombre de equipo ${i + 1}`;
    input.className = "team-name-input";
    teamNames.appendChild(input);
  }
}

let currentTeamIndex = 0;

function updateScoreDisplay() {
  const scoreHTML = teams
    .map(
      (team, index) =>
        `<div class="${index === currentTeamIndex ? "current-team" : ""}">
          ${team.name}: ${team.score}
        </div>`
    )
    .join("");
  totalScoreElement.innerHTML = scoreHTML;
}

startGameButton.addEventListener("click", () => {
  teams = Array.from(teamNames.children).map((input) => ({
    name: input.value || input.placeholder,
    score: 0,
  }));
  teamSetup.style.display = "none";
  gameContainer.style.display = "block";
  updateScoreDisplay();
});

// Initialize with 2 teams
updateTeamInputs();

// Hide game container initially
gameContainer.style.display = "none";

function setTargetArea() {
  targetAngle = Math.random() * 180 - 90;
  const gradient = `conic-gradient(
    from -90deg at 50% 100%,
    #a4b0be 0deg ${targetAngle - 22.5 + 90}deg,
    #ff6b6b ${targetAngle - 22.5 + 90}deg ${targetAngle - 13.5 + 90}deg,
    #feca57 ${targetAngle - 13.5 + 90}deg ${targetAngle - 4.5 + 90}deg,
    #48dbfb ${targetAngle - 4.5 + 90}deg ${targetAngle + 4.5 + 90}deg,
    #feca57 ${targetAngle + 4.5 + 90}deg ${targetAngle + 13.5 + 90}deg,
    #ff6b6b ${targetAngle + 13.5 + 90}deg ${targetAngle + 22.5 + 90}deg,
    #a4b0be ${targetAngle + 22.5 + 90}deg 180deg
)`;
  targetArea.style.background = gradient;
}

function setRandomClues() {
  const randomIndex = Math.floor(Math.random() * clues.length);
  const [left, right] = clues[randomIndex];
  document.getElementById("leftClue").textContent = left;
  document.getElementById("rightClue").textContent = right;
}

function calculateScore(angle) {
  const diff = Math.abs(angle - targetAngle);
  if (diff <= 4.5) {
    triggerConfetti();
    return 5;
  }
  if (diff <= 13.5) return 3;
  if (diff <= 22.5) return 1;
  return 0;
}

function handleStart(e) {
  if (!canMoveNeedle) return;
  isDragging = true;
  e.preventDefault(); // Prevent default touch behavior
}

function triggerConfetti() {
  confetti({
    particleCount: 150,
    spread: 90,
    origin: { y: 0.6 },
    colors: ["#ff0000", "#00ff00", "#0000ff"], // Custom colors
    ticks: 200, // How long the animation lasts
    shapes: ["square"], // Use only square confetti
    gravity: 0.8, // Slightly increase gravity
    scalar: 1.2, // Make the confetti a bit larger
  });
}

function handleMove(e) {
  if (!isDragging || !canMoveNeedle) return;
  e.preventDefault(); // Prevent default touch behavior
  const rect = needleContainer.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.bottom;

  let clientX, clientY;
  if (e.type === "touchmove") {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }

  const angle =
    (Math.atan2(clientX - centerX, centerY - clientY) * 180) / Math.PI;
  const clampedAngle = Math.max(-90, Math.min(90, angle));
  needle.style.transform = `rotate(${clampedAngle}deg)`;
}

function handleEnd() {
  isDragging = false;
}

function hideNeedle() {
  needle.style.display = "none";
}

function showNeedle() {
  needle.style.display = "block";
}

const modal = document.getElementById("howToPlayModal");
const howToPlayButton = document.getElementById("howToPlayButton");
const closeButton = modal.querySelector(".close-button");

howToPlayButton.onclick = function () {
  modal.style.display = "block";
  setTimeout(() => modal.classList.add("show"), 10);
};

closeButton.onclick = function () {
  modal.classList.remove("show");
  setTimeout(() => (modal.style.display = "none"), 300);
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.classList.remove("show");
    setTimeout(() => (modal.style.display = "none"), 300);
  }
};

// Mouse events
needleContainer.addEventListener("mousedown", handleStart);
document.addEventListener("mousemove", handleMove);
document.addEventListener("mouseup", handleEnd);

// Touch events
needleContainer.addEventListener("touchstart", handleStart);
document.addEventListener("touchmove", handleMove);
document.addEventListener("touchend", handleEnd);

toggleButton.addEventListener("click", () => {
  isTargetVisible = !isTargetVisible;
  targetArea.style.display = isTargetVisible ? "block" : "none";
  if (!isTargetVisible) {
    toggleButton.textContent = "Mostrar objetivo";
    scoreElement.textContent = "";
    showNeedle();
    canMoveNeedle = true; // Allow needle movement when target is hidden
  } else {
    toggleButton.style.display = "none";
    const needleAngle =
      parseFloat(
        needle.style.transform.replace("rotate(", "").replace("deg)", "")
      ) || 0;
    const score = calculateScore(needleAngle);
    totalScore += score;
    scoreElement.textContent = `Puntos: ${score}`;
    totalScoreElement.textContent = `Puntos totales: ${totalScore}`;
    canMoveNeedle = false; // Disable needle movement when target is revealed
  }
  if (isTargetVisible) {
    const needleAngle =
      parseFloat(
        needle.style.transform.replace("rotate(", "").replace("deg)", "")
      ) || 0;
    const score = calculateScore(needleAngle);
    teams[currentTeamIndex].score += score;
    scoreElement.textContent = `${teams[currentTeamIndex].name} ha conseguido ${score} puntos`;
    updateScoreDisplay();
    if (score === 4) {
      triggerConfetti();
    }
  }
});

nextRoundButton.addEventListener("click", () => {
  setTargetArea();
  setRandomClues();
  isTargetVisible = true;
  targetArea.style.display = "block";
  toggleButton.textContent = "Ocultar objetivo";
  toggleButton.style.display = "inline-block";
  needle.style.transform = "rotate(0deg)";
  scoreElement.textContent = "";

  hideNeedle();
  canMoveNeedle = false; // Re-enable needle movement for the next round
  currentTeamIndex = (currentTeamIndex + 1) % teams.length;
  updateScoreDisplay();
});

// Initialize the game
setTargetArea();
setRandomClues();
hideNeedle();
