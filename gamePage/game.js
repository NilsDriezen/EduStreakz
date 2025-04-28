const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 300 }, debug: false } // Zwaartekracht verlaagd voor betere sprong
    },
    scene: { preload, create, update },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }
};

const game = new Phaser.Game(config);

let player, platforms, coins, obstacles, cursors, answerInput, questionText, feedbackText, scoreText, livesText, timerText;
let score = 0, lives = 3, timeLeft = 120, level = 1;
let currentQuestion = null, isAnswering = false;
const JWT_TOKEN = localStorage.getItem('jwtToken'); // Verkregen via login op edu-streakz

function preload() {
    this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
    this.load.image('coin', 'https://labs.phaser.io/assets/sprites/orb-blue.png');
    this.load.image('obstacle', 'https://labs.phaser.io/assets/sprites/spike.png');
    this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');
}

function create() {
    // Achtergrond
    this.add.rectangle(400, 300, 800, 600, 0x87CEEB);

    // Platformen (hoogtes aangepast voor betere bereikbaarheid)
    platforms = this.physics.add.staticGroup();
    platforms.create(400, 580, 'ground').setScale(2).refreshBody();
    platforms.create(200, 450, 'ground'); // Iets lager
    platforms.create(600, 350, 'ground'); // Iets lager

    // Speler
    player = this.physics.add.sprite(100, 450, 'player').setBounce(0.2).setCollideWorldBounds(true);
    this.physics.add.collider(player, platforms);

    // Munten (wiskunde-vragen)
    coins = this.physics.add.group({
        key: 'coin',
        repeat: 5,
        setXY: { x: 100, y: 0, stepX: 120 }
    });
    coins.children.iterate(c => c.setBounceY(0.5));
    this.physics.add.collider(coins, platforms);
    this.physics.add.overlap(player, coins, collectCoin, null, this);

    // Obstakels
    obstacles = this.physics.add.group();
    obstacles.create(700, 550, 'obstacle').setVelocityX(-100);
    this.physics.add.collider(obstacles, platforms);
    this.physics.add.collider(player, obstacles, hitObstacle, null, this);

    // UI
    scoreText = this.add.text(16, 16, 'Score: 0', { font: '24px Arial', fill: '#000' });
    livesText = this.add.text(16, 50, 'Levens: 3', { font: '24px Arial', fill: '#000' });
    timerText = this.add.text(16, 84, 'Tijd: 120', { font: '24px Arial', fill: '#000' });
    questionText = this.add.text(400, 200, '', { font: '32px Arial', fill: '#000', align: 'center' }).setOrigin(0.5).setDepth(10);
    feedbackText = this.add.text(400, 500, '', { font: '24px Arial', fill: '#000', align: 'center' }).setOrigin(0.5).setDepth(10);

    // Input
    cursors = this.input.keyboard.createCursorKeys();
    answerInput = document.getElementById('answerInput');
    answerInput.style.display = 'none'; // Zorg ervoor dat het standaard verborgen is
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && isAnswering) {
            console.log('Antwoord ingediend:', answerInput.value);
            checkAnswer.call(this);
        }
    });

    // Timer
    this.time.addEvent({ delay: 1000, callback: updateTimer, callbackScope: this, loop: true });
}

function update() {
    if (isAnswering) {
        player.setVelocityX(0); // Stop speler tijdens beantwoorden
        return;
    }

    // Beweging speler
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
    } else {
        player.setVelocityX(0);
    }
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-400); // Hogere sprong
    }

    // Obstakel beweging
    obstacles.children.iterate(o => {
        if (o.x < 0) o.setX(800);
    });
}

function collectCoin(player, coin) {
    console.log('Munt verzameld, toon vraag');
    coin.disableBody(true, true);
    isAnswering = true;
    player.setVelocity(0);
    generateQuestion.call(this);
    questionText.setVisible(true);
    answerInput.style.display = 'block';
    answerInput.focus();
}

function generateQuestion() {
    const operations = ['+', '-', '*', '/'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1, num2, correctAnswer;

    if (level === 1) {
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
    } else if (level === 2) {
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
    } else {
        num1 = Math.floor(Math.random() * 100) + 1;
        num2 = Math.floor(Math.random() * 100) + 1;
    }

    if (operation === '+') {
        correctAnswer = num1 + num2;
    } else if (operation === '-') {
        if (num1 < num2) [num1, num2] = [num2, num1];
        correctAnswer = num1 - num2;
    } else if (operation === '*') {
        correctAnswer = num1 * num2;
    } else {
        num2 = Math.floor(Math.random() * 10) + 1;
        num1 = num2 * (Math.floor(Math.random() * 10) + 1);
        correctAnswer = num1 / num2;
    }

    currentQuestion = { num1, num2, operation, correctAnswer };
    console.log('Vraag gegenereerd:', `${num1} ${operation} ${num2} = ${correctAnswer}`);
    questionText.setText(`${num1} ${operation} ${num2} = ?`);
}

function checkAnswer() {
    const answer = Number(answerInput.value);
    console.log('Antwoord gecontroleerd:', answer, 'Correct antwoord:', currentQuestion.correctAnswer);
    answerInput.value = '';
    answerInput.style.display = 'none';
    questionText.setVisible(false);
    isAnswering = false;

    if (answer === currentQuestion.correctAnswer) {
        score += 10 * level;
        timeLeft += 5;
        feedbackText.setText('Juist! +5 seconden!');
        scoreText.setText(`Score: ${score}`);
        timerText.setText(`Tijd: ${Math.floor(timeLeft)}`);
        saveScore(score, level);
    } else {
        lives -= 1;
        feedbackText.setText(`Fout! Antwoord: ${currentQuestion.correctAnswer}`);
        livesText.setText(`Levens: ${lives}`);
        if (lives <= 0) endGame.call(this, 'Game Over! Geen levens meer.');
    }

    this.time.delayedCall(2000, () => {
        feedbackText.setText('');
        if (coins.countActive(true) === 0) {
            level += 1;
            if (level > 3) {
                endGame.call(this, 'Gefeliciteerd! Alle niveaus voltooid!');
            } else {
                resetLevel.call(this);
            }
        }
    });
}

function hitObstacle(player, obstacle) {
    lives -= 1;
    livesText.setText(`Levens: ${lives}`);
    player.setTint(0xff0000);
    this.time.delayedCall(500, () => player.clearTint());
    if (lives <= 0) endGame.call(this, 'Game Over! Geen levens meer.');
}

function updateTimer() {
    timeLeft -= 1;
    timerText.setText(`Tijd: ${Math.floor(timeLeft)}`);
    if (timeLeft <= 0) endGame.call(this, 'Game Over! Tijd op!');
}

function resetLevel() {
    player.setPosition(100, 450);
    coins.children.iterate(c => c.enableBody(true, c.x, 0, true, true));
    feedbackText.setText(`Niveau ${level}`);
    this.time.delayedCall(2000, () => feedbackText.setText(''));
}

function endGame(message) {
    this.physics.pause();
    feedbackText.setText(message);
    saveScore(score, level);
    this.time.delayedCall(3000, () => {
        window.location.reload();
    });
}

async function saveScore(score, level) {
    if (!JWT_TOKEN) return console.error('Geen JWT token gevonden');
    try {
        const response = await fetch('https://edu-streakz.vercel.app/api/games', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${JWT_TOKEN}`
            },
            body: JSON.stringify({ game_name: 'Wiskunde Avontuur', score, level })
        });
        if (!response.ok) throw new Error('Score opslaan mislukt');
        console.log('Score opgeslagen');
    } catch (err) {
        console.error('Fout bij opslaan score:', err);
    }
}