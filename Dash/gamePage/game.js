const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 }, // Gravity pulling downwards
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let player, platform, ground, inputA, inputB, inputC, graphics;
let launchButton, trajectoryPoints = [];
let hasLaunched = false; // Track if the player has launched

function preload() {
    this.load.image('player', '/assets/player.png');
    this.load.image('platform', '/assets/platform.png');
}

function create() {
    this.add.text(20, 20, "Enter values for a, b, c and press LAUNCH", { fontSize: '16px', fill: '#fff' });

    // Create input fields only if they don't exist already
    if (!document.getElementById("inputA")) {
        inputA = createInputField(100, "-1", "inputA");
        inputB = createInputField(180, "3.5", "inputB");
        inputC = createInputField(260, "500", "inputC");
    } else {
        inputA = document.getElementById("inputA");
        inputB = document.getElementById("inputB");
        inputC = document.getElementById("inputC");
    }

    // Create launch button only if it doesn't exist
    if (!document.getElementById("launchButton")) {
        launchButton = document.createElement("button");
        launchButton.innerText = "LAUNCH";
        launchButton.id = "launchButton";
        launchButton.style.position = "absolute";
        launchButton.style.top = "10px";
        launchButton.style.left = "340px";
        document.body.appendChild(launchButton);
    } else {
        launchButton = document.getElementById("launchButton");
    }

    // Create ground properly
    ground = this.physics.add.staticImage(game.config.width / 2, game.config.height - 10, 'platform'); 
    ground.displayWidth = game.config.width;
    ground.refreshBody();

    // Place player at the bottom
    player = this.physics.add.sprite(100, game.config.height - 25, 'player').setCollideWorldBounds(true);
    player.setOrigin(0.5, 1);
    player.setBounce(0); // Prevent bouncing

    // Random platform placement
    let platformX = Phaser.Math.Between(400, 750);
    let platformY = Phaser.Math.Between(200, game.config.height - 150);
    platform = this.physics.add.staticImage(platformX, platformY, 'platform');

    handleResize();

    // Win condition
    this.physics.add.collider(player, platform, () => {
        if (hasLaunched) {
            this.add.text(game.config.width / 2 - 40, game.config.height / 2, "YOU WIN!", { fontSize: '32px', fill: '#0f0' });
            player.setVelocity(0, 0);
            hasLaunched = false;
        }
    });

    // Ground collision - Delay reset
    this.physics.add.collider(player, ground, () => {
        if (hasLaunched) {
            setTimeout(() => {
                resetGame.call(this);
            }, 2000); // Delay reset to prevent instant restart
        }
    });

    // Add event listeners for trajectory preview
    [inputA, inputB, inputC].forEach(input => {
        input.addEventListener("input", drawTrajectoryPreview);
    });

    // Launch button event
    launchButton.onclick = () => {
        let a = parseFloat(inputA.value) || 0;
        let b = parseFloat(inputB.value) || 0;
        let c = parseFloat(inputC.value) || 0;
        launchPlayer(a, b, c);
    };

    // Graphics for trajectory preview
    graphics = this.add.graphics({ lineStyle: { width: 2, color: 0xff0000 } });

    drawTrajectoryPreview();
}

function resetGame() {
    hasLaunched = false;
    this.scene.restart();
}

function handleResize() {
    let newWidth = window.innerWidth;
    let newHeight = window.innerHeight;

    // Update ground position
    ground.x = newWidth / 2;
    ground.y = newHeight;
    ground.displayWidth = newWidth;

    // Adjust player position only if they haven't launched
    if (!hasLaunched) {
        player.y = newHeight - 25;
    }

    // Ensure platform is within new screen size
    if (platform.y > newHeight - 150) {
        platform.y = newHeight - 200;
    }
}

function drawTrajectoryPreview() {
    graphics.clear();
    trajectoryPoints = [];

    let a = parseFloat(inputA.value) || 0;
    let b = parseFloat(inputB.value) || 0;
    let c = parseFloat(inputC.value) || 0;

    let startX = player.x;
    let startY = player.y;
    let velocityX = 200;
    let velocityY = (a * velocityX * velocityX + b * velocityX + c) * 0.01;
    let gravity = 500;

    let timeStep = 0.05;
    let maxTime = 5;

    graphics.beginPath();

    for (let t = 0; t < maxTime; t += timeStep) {
        let x = startX + velocityX * t;
        let y = startY + velocityY * t + 0.5 * gravity * t * t;

        if (y > config.height) break;

        trajectoryPoints.push({ x, y });
    }

    trajectoryPoints.forEach((point, index) => {
        if (index === 0) {
            graphics.moveTo(point.x, point.y);
        } else {
            graphics.lineTo(point.x, point.y);
        }
    });

    graphics.strokePath();
}

function createInputField(offsetX, defaultValue, id) {
    let input = document.createElement("input");
    input.type = "number";
    input.value = defaultValue;
    input.id = id;
    input.style.position = "absolute";
    input.style.top = "10px";
    input.style.left = `${offsetX}px`;
    document.body.appendChild(input);
    return input;
}

function launchPlayer(a, b, c) {
    player.setVelocity(0, 0);  // Reset velocity before launch
    let velocityX = 200;
    let velocityY = (a * velocityX * velocityX + b * velocityX + c) * 0.01;

    player.setVelocity(velocityX, velocityY);
    hasLaunched = true;
    graphics.clear();
}

function update() {
    // Game loop logic here
}
