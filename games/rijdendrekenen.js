const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT, // Scale to fit the parent container while maintaining aspect ratio
        autoCenter: Phaser.Scale.CENTER_BOTH, // Center the game horizontally and vertically
        width: 800,
        height: 600
    },
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

let car, road, checkpoints, controlsBox, questionText, answerButtons, feedbackText;
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
    try {
        road = this.add.tileSprite(400, 300, 800, 600, 'road');
        road.setTileScale(1.5625, 1.171875); // Schaal de textuur: 800/512 = 1.5625 (breedte), 600/512 = 1.171875 (hoogte)
    } catch (error) {
        console.error('Failed to create road tileSprite:', error);
    }

    // Auto
    try {
        car = this.physics.add.sprite(400, 500, 'car');
        car.setCollideWorldBounds(true);
        car.setScale(1.2);
        car.setAngle(-90); // Roteer de auto om naar boven te kijken
    } catch (error) {
        console.error('Failed to create car sprite:', error);
    }

    // Checkpoints
    checkpoints = this.physics.add.group();
    try {
        for (let i = 0; i < 5; i++) {
            let checkpoint = checkpoints.create(400, 400 - i * 100, null);
            checkpoint.setSize(50, 10).setVisible(false);
        }
    } catch (error) {
        console.error('Failed to create checkpoints:', error);
    }

    // HTML-elementen
    try {
        controlsBox = document.getElementById('controls-box');
        questionText = document.getElementById('question-text');
        answerButtons = document.querySelectorAll('.answer-button');
        feedbackText = document.getElementById('feedback');
        if (!controlsBox || !questionText || !answerButtons.length || !feedbackText) {
            console.error('One or more HTML elements not found');
        }
    } catch (error) {
        console.error('Error accessing HTML elements:', error);
    }

    // Botsing met checkpoints
    try {
        this.physics.add.overlap(car, checkpoints, (car, checkpoint) => {
            console.log('Checkpoint hit:', currentCheckpoint);
            checkpoint.disableBody(true, true);
            showQuestion();
        }, null, this);
    } catch (error) {
        console.error('Failed to set up overlap detection:', error);
    }

    document.getElementById('score-value').textContent = score;

    // Hint text
    try {
        this.add.text(this.cameras.main.width / 2, 20, 'Hint: Beantwoord de vraag om verder te gaan!', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: { x: 10, y: 10 },
            align: 'center'
        }).setOrigin(0.5, 0).setDepth(10);
    } catch (error) {
        console.error('Failed to add hint text:', error);
    }
}

function update() {
    if (gameOver) {
        console.log('Game over, stopping update loop');
        return;
    }

    try {
        // Scroll de weg-achtergrond
        if (road) {
            road.tilePositionY -= 2;
        }

        // Als de auto achteruit rijdt, verwerk dat eerst
        if (moveBackward > 0) {
            if (car) {
                car.y += 2;
            }
            moveBackward--;
            if (moveBackward === 0) {
                console.log('Finished moving backward');
                isWaiting = true;
                setTimeout(() => {
                    isWaiting = false;
                    if (advanceCheckpoint) {
                        currentCheckpoint++;
                        advanceCheckpoint = false;
                        console.log('Advanced to checkpoint:', currentCheckpoint);
                    }
                }, 500); // Wacht 500ms
            }
            return;
        }

        // Beweeg alleen naar voren als we niet wachten
        if (!isWaiting && currentCheckpoint < checkpoints.getChildren().length) {
            let target = checkpoints.getChildren()[currentCheckpoint];
            if (target && target.active) {
                if (car) {
                    car.y -= 2;
                }
            } else {
                console.warn('Invalid or inactive checkpoint at index:', currentCheckpoint);
            }
        } else if (currentCheckpoint >= checkpoints.getChildren().length) {
            console.log('Reached final checkpoint, ending game');
            gameOver = true;
            if (controlsBox && questionText && answerButtons && feedbackText) {
                controlsBox.style.display = 'block';
                questionText.innerHTML = `Gefeliciteerd! Je hebt de finish bereikt met ${score} punten!`;
                answerButtons.forEach(btn => btn.style.display = 'none');
                feedbackText.innerHTML = '';
            } else {
                console.error('Cannot display game over message: HTML elements missing');
            }
        }
    } catch (error) {
        console.error('Error in update loop:', error);
    }
}

function generateQuestion() {
    try {
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
    } catch (error) {
        console.error('Error generating question:', error);
        return { question: 'Error generating question', answer: 0, options: [0, 0, 0] };
    }
}

function showQuestion() {
    try {
        console.log('Showing question for checkpoint:', currentCheckpoint);
        let q = generateQuestion();
        if (questionText && answerButtons && controlsBox && feedbackText) {
            questionText.innerHTML = q.question;
            answerButtons.forEach((btn, index) => {
                btn.innerHTML = q.options[index];
                btn.style.display = 'inline-block';
            });
            controlsBox.style.display = 'block';
            feedbackText.innerHTML = '';
            window.correctAnswer = q.answer;
        } else {
            console.error('Cannot show question: HTML elements missing');
        }
    } catch (error) {
        console.error('Error in showQuestion:', error);
    }
}

function checkAnswer(index) {
    try {
        console.log('Checking answer for index:', index);
        let selected = parseInt(answerButtons[index].innerHTML);
        if (selected === window.correctAnswer) {
            score += 10;
            feedbackText.innerHTML = 'Goed gedaan! +10 punten';
            feedbackText.style.color = 'green';
            document.getElementById('score-value').textContent = score; // Update sidebar score
            setTimeout(() => {
                if (controlsBox) {
                    controlsBox.style.display = 'none';
                    currentCheckpoint++;
                    console.log('Correct answer, advancing to checkpoint:', currentCheckpoint);
                }
            }, 1000);
        } else {
            feedbackText.innerHTML = 'Fout! Het juiste antwoord was ' + window.correctAnswer;
            feedbackText.style.color = 'red';
            if (score > 0) {
                score -= 5;
            }
            document.getElementById('score-value').textContent = score; // Update sidebar score
            setTimeout(() => {
                if (controlsBox) {
                    controlsBox.style.display = 'none';
                    showQuestion();
                    console.log('Incorrect answer, showing new question');
                }
            }, 1000);
        }
    } catch (error) {
        console.error('Error in checkAnswer:', error);
    }
}