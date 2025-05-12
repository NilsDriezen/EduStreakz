const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let car, road, checkpoints, questionBox, questionText, answerButtons, feedbackText;
let currentCheckpoint = 0;
let score = 0;
let gameOver = false;
let moveBackward = 0;
let advanceCheckpoint = false;
let isWaiting = false;

const game = new Phaser.Game(config);

function preload() {
    this.load.image('car', 'https://labs.phaser.io/assets/sprites/car90.png');
    this.load.image('road', 'road.png'); // Nieuwe afbeelding lokaal laden
    this.load.on('filecomplete-image-road', () => {
        console.log('Road image loaded successfully');
    });
    this.load.on('loaderror', (file) => {
        console.error('Error loading file:', file.key);
    });
}

function create() {
    // Fallback achtergrondkleur instellen
    this.cameras.main.setBackgroundColor('#000000'); // Zwart als fallback

    // Weg als achtergrond
    road = this.add.tileSprite(400, 300, 800, 600, 'road');
    road.setTileScale(1.5625, 1.171875); // Schaal de textuur: 800/512 = 1.5625 (breedte), 600/512 = 1.171875 (hoogte)

    // Auto
    car = this.physics.add.sprite(400, 500, 'car');
    car.setCollideWorldBounds(true);
    car.setScale(1.2);
    car.setAngle(-90); // Roteer de auto om naar boven te kijken

    // Checkpoints
    checkpoints = this.physics.add.group();
    for (let i = 0; i < 5; i++) {
        let checkpoint = checkpoints.create(400, 400 - i * 100, null);
        checkpoint.setSize(50, 10).setVisible(false);
    }

    // HTML-elementen
    questionBox = document.getElementById('question-box');
    questionText = document.getElementById('question-text');
    answerButtons = document.querySelectorAll('.answer-button');
    feedbackText = document.getElementById('feedback');

    // Botsing met checkpoints
    this.physics.add.overlap(car, checkpoints, (car, checkpoint) => {
        checkpoint.disableBody(true, true);
        showQuestion();
    }, null, this);

    feedbackText = document.getElementById('feedback');
    document.getElementById('score-value').textContent = score;
}

function update() {
    if (!gameOver) {
        // Scroll de weg-achtergrond
        road.tilePositionY -= 2;

        // Als de auto achteruit rijdt, verwerk dat eerst
        if (moveBackward > 0) {
            car.y += 2;
            moveBackward--;
            if (moveBackward === 0) {
                // Als achteruit rijden klaar is, wacht even
                isWaiting = true;
                setTimeout(() => {
                    isWaiting = false;
                    if (advanceCheckpoint) {
                        currentCheckpoint++;
                        advanceCheckpoint = false;
                    }
                }, 500); // Wacht 500ms voordat de auto weer naar voren mag
            }
            return; // Stop verdere verwerking terwijl achteruit wordt gereden
        }

        // Beweeg alleen naar voren als we niet wachten
        if (!isWaiting && currentCheckpoint < checkpoints.getChildren().length) {
            let target = checkpoints.getChildren()[currentCheckpoint];
            if (target.active) {
                car.y -= 2;
            }
        } else if (currentCheckpoint >= checkpoints.getChildren().length) {
            gameOver = true;
            questionBox.style.display = 'block';
            questionText.innerHTML = `Gefeliciteerd! Je hebt de finish bereikt met ${score} punten!`;
            answerButtons.forEach(btn => btn.style.display = 'none');
            feedbackText.innerHTML = '';
        }
    }
}

function generateQuestion() {
    const types = ['snelheid', 'afstand', 'tijd'];
    const type = types[Math.floor(Math.random() * types.length)];
    let question, answer, options;

    if (type === 'snelheid') {
        let afstand = Math.floor(Math.random() * 100) + 10; // 10-110 km
        let tijd = Math.floor(Math.random() * 10) + 1; // 1-10 uur
        answer = Math.round(afstand / tijd);
        question = `Een auto rijdt ${afstand} km in ${tijd} uur. Wat is de snelheid in km/u?`;
    } else if (type === 'afstand') {
        let snelheid = Math.floor(Math.random() * 100) + 10; // 10-110 km/u
        let tijd = Math.floor(Math.random() * 10) + 1; // 1-10 uur
        answer = snelheid * tijd;
        question = `Een auto rijdt met ${snelheid} km/u gedurende ${tijd} uur. Wat is de afgelegde afstand in km?`;
    } else {
        let afstand = Math.floor(Math.random() * 100) + 10; // 10-110 km
        let snelheid = Math.floor(Math.random() * 50) + 10; // 10-60 km/u
        answer = Math.round(afstand / snelheid);
        question = `Een auto rijdt ${afstand} km met een snelheid van ${snelheid} km/u. Hoe lang duurt de rit in uur?`;
    }

    // Genereer opties
    options = [answer];
    while (options.length < 3) {
        let opt = answer + Math.floor(Math.random() * 20) - 10;
        if (opt !== answer && opt > 0 && !options.includes(opt)) {
            options.push(opt);
        }
    }
    options.sort(() => Math.random() - 0.5);

    return { question, answer, options };
}

function showQuestion() {
    let q = generateQuestion();
    questionText.innerHTML = q.question;
    answerButtons.forEach((btn, index) => {
        btn.innerHTML = q.options[index];
        btn.style.display = 'inline-block';
    });
    questionBox.style.display = 'block';
    feedbackText.innerHTML = '';
    window.correctAnswer = q.answer;
}

function checkAnswer(index) {
    let selected = parseInt(answerButtons[index].innerHTML);
    if (selected === window.correctAnswer) {
        score += 10;
        feedbackText.innerHTML = 'Goed gedaan! +10 punten';
        feedbackText.style.color = 'green';
        document.getElementById('score-value').textContent = score; // Update sidebar score
        setTimeout(() => {
            questionBox.style.display = 'none';
            currentCheckpoint++;
        }, 1000);
    } else {
        feedbackText.innerHTML = 'Fout! Het juiste antwoord was ' + window.correctAnswer;
        feedbackText.style.color = 'red';
        if (score > 0){
            score -= 5;
        }
        document.getElementById('score-value').textContent = score; // Update sidebar score
        setTimeout(() => {
            questionBox.style.display = 'none';
            showQuestion();
        }, 1000);
    }
}