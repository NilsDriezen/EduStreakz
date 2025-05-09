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
let guesses = [];
let isResetting = false;

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

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    margin = Math.min(rect.width, rect.height) * 0.1; // 10% of smaller dimension
    // Calculate available space for the grid
    const availableWidth = rect.width - 2 * margin;
    const availableHeight = rect.height - 2 * margin;
    // Use the smaller dimension to ensure the grid fits in both width and height
    cellSize = Math.min(availableWidth, availableHeight) / gridSize;
    // Set grid dimensions to fit exactly 10x10 cells
    gridWidth = cellSize * gridSize;
    gridHeight = cellSize * gridSize;
    drawGrid(false);
}

function drawGrid(showTreasure = false) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate horizontal centering offset
    const marginX = (canvas.width - gridWidth) / 2;
    const marginY = margin; // Keep original vertical margin

    // Draw the sand background image as a tiled pattern
    if (sandImage.complete) {
        const pattern = ctx.createPattern(sandImage, 'repeat');
        ctx.fillStyle = pattern;
        ctx.fillRect(marginX, marginY, gridWidth, gridHeight);
    } else {
        // Fallback background if image hasn't loaded
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(marginX, marginY, gridWidth, gridHeight);
        console.log('Using fallback background; sand.png not loaded');
    }

    // Teken gridlijnen
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSize; i++) {
        // Verticale lijnen
        ctx.beginPath();
        ctx.moveTo(marginX + i * cellSize, marginY);
        ctx.lineTo(marginX + i * cellSize, marginY + gridHeight);
        ctx.stroke();
        // Horizontale lijnen
        ctx.beginPath();
        ctx.moveTo(marginX, marginY + i * cellSize);
        ctx.lineTo(marginX + gridWidth, marginY + i * cellSize);
        ctx.stroke();
    }

    // Teken coördinaatlabels buiten het grid
    ctx.font = '12px Arial';
    ctx.fillStyle = '#000';
    for (let i = 0; i < gridSize; i++) {
        // X-as labels (onder het grid)
        ctx.fillText(i, marginX + i * cellSize + cellSize / 2 - 5, marginY + gridHeight + margin * 0.5);
        // Y-as labels (links van het grid)
        ctx.fillText(i, marginX - margin * 0.5, marginY + (gridSize - i - 1) * cellSize + cellSize / 2 + 5);
    }

    // Teken de vlag op de positie van de speler
    if (flagImage.complete) {
        ctx.drawImage(
            flagImage,
            marginX + playerPos.x * cellSize,
            marginY + (gridSize - playerPos.y - 1) * cellSize,
            cellSize,
            cellSize
        );
    } else {
        // Fallback: Draw a blue square to indicate player position if flag image fails to load
        ctx.fillStyle = 'blue';
        ctx.fillRect(
            marginX + playerPos.x * cellSize,
            marginY + (gridSize - playerPos.y - 1) * cellSize,
            cellSize,
            cellSize
        );
    }

    // Teken stapels voor incorrecte gokken (vervangt de zwarte cirkels)
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
            // Fallback: Draw a black circle if pile image fails to load
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

    // Teken schat (alleen als showTreasure waar is: gele ster en schatkist)
    if (showTreasure) {
        console.log('Drawing treasure: star and chest');
        // Gele ster
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

        // Schatkist
        if (treasureChestImage.complete) {
            ctx.drawImage(
                treasureChestImage,
                marginX + treasurePos.x * cellSize,
                marginY + (gridSize - treasurePos.y - 1) * cellSize,
                cellSize,
                cellSize
            );
            console.log('Treasure chest drawn at:', treasurePos);
        } else {
            console.log('Treasure chest image not loaded, skipping draw');
            // Fallback: Draw a red square to indicate missing chest
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
    if (isResetting) return; // Prevent multiple resets
    isResetting = true;
    console.log('Generating new level...');

    // Willekeurige start- en schatpositie
    playerPos = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize)
    };
    do {
        treasurePos = {
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize)
        };
    } while (playerPos.x === treasurePos.x && playerPos.y === treasurePos.y);

    // Reset guesses for new run
    guesses = [];

    // Genereer hint
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

    // Clear feedback and reset input fields
    document.getElementById('feedback').textContent = '';
    document.getElementById('x-input').value = '';
    document.getElementById('y-input').value = '';

    // Redraw grid
    drawGrid(false);
    isResetting = false;
    console.log('New level generated:', { playerPos, treasurePos, guesses });
}

function checkCoordinates() {
    if (isResetting) return; // Ignore inputs during reset
    const xInput = parseInt(document.getElementById('x-input').value);
    const yInput = parseInt(document.getElementById('y-input').value);
    const feedback = document.getElementById('feedback');

    if (isNaN(xInput) || isNaN(yInput) || xInput < 0 || xInput >= gridSize || yInput < 0 || yInput >= gridSize) {
        feedback.textContent = 'Voer geldige coördinaten in (0-9).';
        return;
    }

    if (xInput === treasurePos.x && yInput === treasurePos.y) {
        score += 10;
        document.getElementById('score-value').textContent = score;
        feedback.textContent = 'Gefeliciteerd! Je hebt de schat gevonden!';
        guesses = []; // Clear holes immediately after correct guess
        drawGrid(true); // Show yellow star and treasure chest
        console.log('Correct guess, scheduling reset...');
        setTimeout(() => {
            try {
                generateLevel(); // Reset the run after 3 seconds
            } catch (error) {
                console.error('Error during level reset:', error);
            }
        }, 3000);
    } else {
        // Add guess to list if not already present
        if (!guesses.some(guess => guess.x === xInput && guess.y === yInput)) {
            guesses.push({ x: xInput, y: yInput });
        }
        feedback.textContent = `Helaas, dat is niet correct. Probeer opnieuw!`;
        drawGrid(false); // Redraw with new hole, no treasure
    }
}

// Initialize canvas and draw grid
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
sandImage.onload = () => drawGrid(false);
treasureChestImage.onload = () => drawGrid(false);
flagImage.onload = () => drawGrid(false);
pileImage.onload = () => drawGrid(false); // Redraw when pile image loads
sandImage.onerror = () => console.error('Failed to load sand.png');
treasureChestImage.onerror = () => console.error('Failed to load treasurechest.png');
flagImage.onerror = () => console.error('Failed to load flag.png');
pileImage.onerror = () => console.error('Failed to load pile.png');
drawGrid(false);
generateLevel();