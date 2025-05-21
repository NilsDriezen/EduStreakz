const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false // Explicitly disable physics debug to prevent rendering physics bodies
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
let level = 1;
let gameOver = false;
let moveBackward = 0;
let advanceCheckpoint = false;
let isWaiting = false;
const gameName = "Rijdend Rekenen";
let gameCompleted = false;

const game = new Phaser.Game(config);

function preload() {
    this.load.image('car', 'https://labs.phaser.io/assets/sprites/car90.png');
    this.load.image('road', 'road.png');
    this.load.on('filecomplete-image-road', () => {
        console.log('Road image loaded successfully');
    });
    this.load.on('loaderror', (file) => {
        console.error('Error loading file:', file.key);
    });
}

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
        score = data.score;
        document.getElementById('score-value').textContent = score;
    } catch (error) {
        console.error('Error fetching initial score:', error);
        score = 0;
        document.getElementById('score-value').textContent = score;
    }
}

async function completeGame(gameName, score, level) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in to save your game progress.');
        window.location.href = '/Login/InlogEnRegistreer.html';
        return;
    }

    try {
        const scoreResponse = await fetch('https://edu-streakz-backend.vercel.app/api/games', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                game_name: gameName,
                score: score,
                level: level
            })
        });

        if (!scoreResponse.ok) {
            const errorData = await scoreResponse.json();
            throw new Error(`Failed to save score: ${errorData.error || 'Unknown error'}`);
        }

        const streakResponse = await fetch('https://edu-streakz-backend.vercel.app/api/user/update-streak', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!streakResponse.ok) {
            throw new Error('Failed to update streak');
        }

        const streakData = await streakResponse.json();
        console.log(`Streak updated to: ${streakData.streak}`);
    } catch (error) {
        console.error('Error completing game:', error);
    }
}

function create() {
    this.cameras.main.setBackgroundColor('#000000');

    try {
        road = this.add.tileSprite(400, 300, 800, 600, 'road');
        road.setTileScale(1.5625, 1.171875);
    } catch (error) {
        console.error('Failed to create road tileSprite:', error);
    }

    try {
        car = this.physics.add.sprite(400, 500, 'car');
        car.setCollideWorldBounds(true);
        car.setScale(1.2);
        car.setAngle(-90);
    } catch (error) {
        console.error('Failed to create car sprite:', error);
    }

    checkpoints = this.physics.add.group();
    try {
        for (let i = 0; i < 5; i++) {
            // Create a physics body without a texture, ensuring it's not rendered
            let checkpoint = this.physics.add.existing(
                this.add.rectangle(400, 400 - i * 100, 50, 10, 0x000000, 0) // Transparent rectangle
            );
            checkpoint.body.setImmovable(true);
            checkpoint.setVisible(false); // Explicitly hide to prevent rendering
            checkpoints.add(checkpoint);
        }
    } catch (error) {
        console.error('Failed to create checkpoints:', error);
    }

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

    fetchInitialScore(gameName);
}

function resetGame(scene) {
    try {
        score = 0;
        level = 1;
        currentCheckpoint = 0;
        gameOver = false;
        gameCompleted = false;
        moveBackward = 0;
        advanceCheckpoint = false;
        isWaiting = false;

        if (car) {
            car.setPosition(400, 500);
            car.setVelocity(0);
        }

        if (checkpoints) {
            checkpoints.getChildren().forEach((checkpoint, index) => {
                checkpoint.enableBody(true, 400, 400 - index * 100, true, true);
                checkpoint.setVisible(false); // Ensure checkpoints remain invisible
            });
        }

        if (controlsBox && questionText && answerButtons && feedbackText) {
            controlsBox.style.display = 'none';
            questionText.innerHTML = '';
            answerButtons.forEach(btn => btn.style.display = 'none');
            feedbackText.innerHTML = '';
        }

        document.getElementById('score-value').textContent = score;

        fetchInitialScore(gameName);

        console.log('Game reset successfully');
    } catch (error) {
        console.error('Error resetting game:', error);
    }
}

function update() {
    if (gameOver) {
        console.log('Game over, stopping update loop');
        if (!gameCompleted) {
            gameCompleted = true;
            completeGame(gameName, score, level).then(() => {
                console.log('Game completion logged');
                if (controlsBox && questionText && answerButtons && feedbackText) {
                    controlsBox.style.display = 'block';
                    questionText.innerHTML = `Gefeliciteerd! Je hebt de finish bereikt met ${score} punten!<br><button id="reset-button">Opnieuw Spelen</button>`;
                    answerButtons.forEach(btn => btn.style.display = 'none');
                    feedbackText.innerHTML = '';
                    const resetButton = document.getElementById('reset-button');
                    if (resetButton) {
                        resetButton.addEventListener('click', () => {
                            resetGame(this);
                        }, { once: true });
                    }
                } else {
                    console.error('Cannot display game over message: HTML elements missing');
                }
            });
        }
        return;
    }

    try {
        if (road) {
            road.tilePositionY -= 2;
        }

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
                }, 500);
            }
            return;
        }

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
            let afstand = Math.floor(Math.random() * 100) + 10;
            let tijd = Math.floor(Math.random() * 10) + 1;
            answer = Math.round(afstand / tijd);
            question = `Een auto rijdt ${afstand} km in ${tijd} uur. Wat is de snelheid in km/u?`;
        } else if (type === 'afstand') {
            let snelheid = Math.floor(Math.random() * 100) + 10;
            let tijd = Math.floor(Math.random() * 10) + 1;
            answer = snelheid * tijd;
            question = `Een auto rijdt met ${snelheid} km/u gedurende ${tijd} uur. Wat is de afgelegde afstand in km?`;
        } else {
            let afstand = Math.floor(Math.random() * 100) + 10;
            let snelheid = Math.floor(Math.random() * 50) + 10;
            answer = Math.round(afstand / snelheid);
            question = `Een auto rijdt ${afstand} km met een snelheid van ${snelheid} km/u. Hoe lang duurt de rit in uur?`;
        }

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
            document.getElementById('score-value').textContent = score;
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
            document.getElementById('score-value').textContent = score;
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