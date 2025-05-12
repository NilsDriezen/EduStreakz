// Global variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 10;
let margin = 0;
let gridWidth = 0;
let gridHeight = 0;
let cellSize = 0;
let playerPos = { x: 0, y: 0 };
let treasurePos = { x: 0, y: 0 };
let hint = '';
let score = 0;
let guesscount = 0;
let guesses = [];
let isResetting = false;
const gameName = "Schattenjacht";

// Load the sand background image
const sandImage = new Image();
sandImage.src = 'assets/sand.png';
sandImage.onerror = () => console.error('Failed to load sand.png');

// Load the treasure chest image
const treasureChestImage = new Image();
treasureChestImage.src = 'assets/treasurechest.png';
treasureChestImage.onerror = () => console.error('Failed to load treasurechest.png');

// Load the flag image for player position
const flagImage = new Image();
flagImage.src = 'assets/flag.png';
flagImage.onerror = () => console.error('Failed to load flag.png');

// Load the pile image for incorrect guesses
const pileImage = new Image();
pileImage.src = 'assets/pile.png';
pileImage.onerror = () => console.error('Failed to load pile.png');

async function fetchInitialScore(gameName) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://edu-streakz-backend.vercel.app/api/score/initial?game_name=${encodeURIComponent(gameName)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to fetch initial score');
        const data = await response.json();
        score = data.score; // Update the global score variable
        document.getElementById('score-value').textContent = score; // Update the UI
    } catch (error) {
        console.error('Error fetching initial score:', error);
        score = 0; // Fallback to 0 if fetch fails
        document.getElementById('score-value').textContent = score;
    }
}

// Define functions globally
function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const labelSpace = 30;
    cellSize = Math.min(canvas.width / gridSize, (canvas.height - labelSpace) / gridSize);
    gridWidth = cellSize * gridSize;
    gridHeight = cellSize * gridSize;
    drawGrid(false);
}

function drawGrid(showTreasure = false) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const marginX = (canvas.width - gridWidth) / 2;
    const marginY = (canvas.height - gridHeight) / 2;

    if (sandImage.complete) {
        const pattern = ctx.createPattern(sandImage, 'repeat');
        ctx.fillStyle = pattern;
        ctx.fillRect(marginX, marginY, gridWidth, gridHeight);
    } else {
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(marginX, marginY, gridWidth, gridHeight);
        console.log('Using fallback background; sand.png not loaded');
    }

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(marginX + i * cellSize, marginY);
        ctx.lineTo(marginX + i * cellSize, marginY + gridHeight);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(marginX, marginY + i * cellSize);
        ctx.lineTo(marginX + gridWidth, marginY + i * cellSize);
        ctx.stroke();
    }

    ctx.font = '12px Arial';
    ctx.fillStyle = '#000';
    for (let i = 0; i < gridSize; i++) {
        ctx.fillText(i, marginX + i * cellSize + cellSize / 2 - 5, marginY + gridHeight + 10);
        ctx.fillText(i, marginX - 20, marginY + (gridSize - i - 1) * cellSize + cellSize / 2 + 5);
    }

    if (flagImage.complete) {
        ctx.drawImage(
            flagImage,
            marginX + playerPos.x * cellSize,
            marginY + (gridSize - playerPos.y - 1) * cellSize,
            cellSize,
            cellSize
        );
    } else {
        ctx.fillStyle = 'blue';
        ctx.fillRect(
            marginX + playerPos.x * cellSize,
            marginY + (gridSize - playerPos.y - 1) * cellSize,
            cellSize,
            cellSize
        );
    }

    guesses.forEach(guess => {
        if (pileImage.complete) {
            ctx.drawImage(
                pileImage,
                marginX + guess.x * cellSize,
                marginY + (gridSize - guess.y - 1) * cellSize,
                cellSize,
                cellSize
            );
        } else {
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(
                marginX + guess.x * cellSize + cellSize / 2,
                marginY + (gridSize - guess.y - 1) * cellSize + cellSize / 2,
                cellSize / 4,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    });

    if (showTreasure) {
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.moveTo(
            marginX + treasurePos.x * cellSize + cellSize / 2,
            marginY + (gridSize - treasurePos.y - 1) * cellSize + cellSize / 4
        );
        ctx.lineTo(
            marginX + treasurePos.x * cellSize + cellSize / 2 + cellSize / 4,
            marginY + (gridSize - treasurePos.y - 1) * cellSize + cellSize / 2
        );
        ctx.lineTo(
            marginX + treasurePos.x * cellSize + cellSize / 2,
            marginY + (gridSize - treasurePos.y - 1) * cellSize + 3 * cellSize / 4
        );
        ctx.lineTo(
            marginX + treasurePos.x * cellSize + cellSize / 2 - cellSize / 4,
            marginY + (gridSize - treasurePos.y - 1) * cellSize + cellSize / 2
        );
        ctx.closePath();
        ctx.fill();

        if (treasureChestImage.complete) {
            ctx.drawImage(
                treasureChestImage,
                marginX + treasurePos.x * cellSize,
                marginY + (gridSize - treasurePos.y - 1) * cellSize,
                cellSize,
                cellSize
            );
        } else {
            ctx.fillStyle = 'red';
            ctx.fillRect(
                marginX + treasurePos.x * cellSize,
                marginY + (gridSize - treasurePos.y - 1) * cellSize,
                cellSize,
                cellSize
            );
        }
    }
}

function generateLevel() {
    if (isResetting) return;
    isResetting = true;
    playerPos = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
    do {
        treasurePos = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
    } while (playerPos.x === treasurePos.x && playerPos.y === treasurePos.y);
    guesses = [];
    const dx = treasurePos.x - playerPos.x;
    const dy = treasurePos.y - playerPos.y;
    let hintText = `De schat ligt `;
    if (dx > 0) hintText += `${dx} naar rechts`;
    else if (dx < 0) hintText += `${-dx} naar links`;
    if (dx !== 0 && dy !== 0) hintText += ' en ';
    if (dy > 0) hintText += `${dy} naar boven`;
    else if (dy < 0) hintText += `${-dy} naar beneden`;
    hintText += ` vanaf de vlag!`;
    document.getElementById('hint').textContent = hintText;
    document.getElementById('feedback').textContent = '';
    document.getElementById('x-input').value = '';
    document.getElementById('y-input').value = '';
    drawGrid(false);
    isResetting = false;
}

function checkCoordinates() {
    if (isResetting) return;
    const xInput = parseInt(document.getElementById('x-input').value);
    const yInput = parseInt(document.getElementById('y-input').value);
    const feedback = document.getElementById('feedback');

    if (isNaN(xInput) || isNaN(yInput) || xInput < 0 || xInput >= gridSize || yInput < 0 || yInput >= gridSize) {
        feedback.textContent = 'Voer geldige coördinaten in (0-9).';
        return;
    }

    if (xInput === treasurePos.x && yInput === treasurePos.y) {
        score += 10;
	score = score - guesscount;
        document.getElementById('score-value').textContent = score;
        feedback.textContent = 'Gefeliciteerd! Je hebt de schat gevonden!';
        guesses = [];
        drawGrid(true);

        // Update score on the backend
        updateScoreOnServer();

        setTimeout(() => {
            try {
                generateLevel();
            } catch (error) {
                console.error('Error during level reset:', error);
            }
        }, 3000);
    } else {
        if (!guesses.some(guess => guess.x === xInput && guess.y === yInput)) {
            guesses.push({ x: xInput, y: yInput });
        }
	if (guesscount <= 10) {
  	guesscount++;
	}

        feedback.textContent = `Helaas, dat is niet correct. Probeer opnieuw!`;
        drawGrid(false);
    }
}

async function updateScoreOnServer() {
    try {
        const response = await fetch('https://edu-streakz-backend.vercel.app/api/scores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                game_name: 'Schattenjacht',
                score: score,
                level: 1
            })
        });

        if (!response.ok) {
            throw new Error('Kon score niet updaten');
        }

        const data = await response.json();
        console.log('Score succesvol geüpdatet:', data.message);
        document.getElementById('feedback').textContent = 'Gefeliciteerd! Je hebt de schat gevonden en je score is opgeslagen!';
    } catch (error) {
        console.error('Fout bij het updaten van de score:', error);
        document.getElementById('feedback').textContent = 'Kon score niet opslaan. Probeer later opnieuw.';
    }
}

// Attach event listener to button programmatically
document.getElementById('game-controls').querySelector('button').addEventListener('click', checkCoordinates);

// Initialize canvas and draw grid
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
sandImage.onload = () => drawGrid(false);
treasureChestImage.onload = () => drawGrid(false);
flagImage.onload = () => drawGrid(false);
pileImage.onload = () => drawGrid(false);
sandImage.onerror = () => console.error('Failed to load sand.png');
treasureChestImage.onerror = () => console.error('Failed to load treasurechest.png');
flagImage.onerror = () => console.error('Failed to load flag.png');
pileImage.onerror = () => console.error('Failed to load pile.png');
fetchInitialScore(gameName).then(() => {
    drawGrid(false);
    generateLevel();
});