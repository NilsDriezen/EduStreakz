(() => {
    // Game variabelen
    let score = 0;
    let attempts = 0;
    let streak = 0;
    let highScore = 0;
    let currentProblem = null;
    let timerInterval = null;
    const questionTime = 20; // seconds
    let timeLeft = questionTime;

    // DOM Elementen
    const problemText = document.getElementById('problem-text');
    const answerInput = document.getElementById('answer-input');
    const answerLabel = document.getElementById('answer-label');
    const unitDisplay = document.getElementById('unit');
    const feedback = document.getElementById('feedback');
    const scoreboard = document.getElementById('scoreboard');
    const checkBtn = document.getElementById('check-btn');
    const newProblemBtn = document.getElementById('new-problem-btn');
    const timerBar = document.getElementById('timer-bar');
    const gameContainer = document.getElementById('game-container');


    function showConfetti() {
        for (let i = 0; i < 30; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 70%)`;
            confetti.style.animationDelay = (Math.random() * 1.2) + 's';
            gameContainer.appendChild(confetti);
            setTimeout(() => {
                confetti.remove();
            }, 1500);
        }
    }

    //
    function loadHighScore() {
        const storedHigh = localStorage.getItem('sdtGameHighScore');
        if(storedHigh !== null) {
            highScore = parseInt(storedHigh, 10) || 0;
        }
    }

    //
    function saveHighScore() {
        if(score > highScore) {
            highScore = score;
            localStorage.setItem('sdtGameHighScore', highScore);
        }
    }

    //  scoreboard
    function updateScoreboard() {
        saveHighScore();
        scoreboard.textContent = `Score: ${score} | Attempts: ${attempts} | Streak: ${streak} | High Score: ${highScore}`;
    }


    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // random float
    function randomFloat1(min, max) {
        const val = Math.random() * (max - min) + min;
        return Math.round(val * 10) / 10;
    }


    function generateProblem() {
        clearInterval(timerInterval);
        timeLeft = questionTime;
        updateTimerBar();

        feedback.textContent = '';
        answerInput.value = '';
        answerInput.disabled = false;
        checkBtn.disabled = false;


        const findOption = ['v', 't', 'x'];
        const find = findOption[randomInt(0, 2)];

        let v, t, x;
        switch(find) {
            case 'v':

                x = randomInt(50, 500);
                t = randomInt(5, 60);
                v = x / t;
                v = Math.round(v * 10) / 10; // 1 decimal max
                break;
            case 't':

                v = randomFloat1(1, 20);
                x = randomInt(50, 500);
                t = x / v;
                t = Math.round(t * 10) / 10;
                break;
            case 'x':
                // speed 1-20 decimal, time 5-60 integer
                v = randomFloat1(1, 20);
                t = randomInt(5, 60);
                x = v * t;
                x = Math.round(x);  // integer meters
                break;
        }


        let answer;
        if(find === 'v') answer = v;
        else if(find === 't') answer = t;
        else answer = x;


        let problemStr = '';
        let labelStr = '';
        let unitStr = '';
        if(find === 'v') {
            problemStr = `Given distance Δx = <strong>${x} meters</strong><br>and time Δt = <strong>${t} seconds</strong>,<br>calculate the <strong>speed (v)</strong>.`;
            labelStr = 'Speed (v) in m/s:';
            unitStr = 'meters per second (m/s)';
        } else if(find === 't') {
            problemStr = `Given speed v = <strong>${v} m/s</strong><br>and distance Δx = <strong>${x} meters</strong>,<br>calculate the <strong>time interval (Δt)</strong>.`;
            labelStr = 'Time (Δt) in seconds:';
            unitStr = 'seconds (s)';
        } else {
            problemStr = `Given speed v = <strong>${v} m/s</strong><br>and time Δt = <strong>${t} seconds</strong>,<br>calculate the <strong>distance (Δx)</strong>.`;
            labelStr = 'Distance (Δx) in meters:';
            unitStr = 'meters (m)';
        }

        problemText.innerHTML = problemStr;
        answerLabel.textContent = labelStr;
        unitDisplay.textContent = `Unit: ${unitStr}`;

        currentProblem = { find, answer };

        // Start timer countdown
        startTimer();
    }

    // bar
    function updateTimerBar() {
        const pct = (timeLeft / questionTime) * 100;
        timerBar.style.width = pct + '%';
        // Change color from green to red on time running out
        let green = Math.floor(255 * pct / 100);
        let red = 255 - green;
        timerBar.style.backgroundColor = `rgb(${red},${green},0)`;
    }

    // Timer
    function startTimer() {
        clearInterval(timerInterval);
        timeLeft = questionTime;
        updateTimerBar();

        timerInterval = setInterval(() => {
            timeLeft -= 0.1;
            if(timeLeft <= 0) {
                timeLeft = 0;
                updateTimerBar();
                clearInterval(timerInterval);
                timeOut();
                return;
            }
            updateTimerBar();
        }, 100);
    }

    // beperkt de tijd
    function timeOut() {
        feedback.style.color = 'orange';
        feedback.textContent = 'Time up! The correct answer was: ' + currentProblem.answer;
        attempts++;
        streak = 0;
        updateScoreboard();
        answerInput.disabled = true;
        checkBtn.disabled = true;
    }

    // antwoord nakijken
    function checkAnswer() {
        const inputVal = parseFloat(answerInput.value);
        if(isNaN(inputVal)) {
            feedback.style.color = '#ff8080';
            feedback.textContent = 'Please enter a valid number.';
            return;
        }
        // afronden tot 1decimaal
        const userAnswer = Math.round(inputVal * 10) / 10;
        attempts++;

        if(Math.abs(userAnswer - currentProblem.answer) < 0.1) {

            score++;
            streak++;
            feedback.style.color = '#80ff80';
            feedback.textContent = 'Correct! 🎉 Keep it up!';
            showConfetti();
            answerInput.disabled = true;
            checkBtn.disabled = true;
            clearInterval(timerInterval);
        } else {

            streak = 0;
            feedback.style.color = '#ff9090';
            feedback.textContent = 'Incorrect. Try again!';
        }
        updateScoreboard();
    }


    checkBtn.addEventListener('click', () => {
        if(!answerInput.disabled) checkAnswer();
    });

    newProblemBtn.addEventListener('click', () => {
        generateProblem();
    });


    answerInput.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' && !answerInput.disabled) {
            e.preventDefault();
            checkAnswer();
        }
    });


    loadHighScore();
    generateProblem();
    updateScoreboard();

})();
// puntensysteem:

// POST-verzoek
async function checkAnswer() {
    const inputVal = parseFloat(answerInput.value);
    if (isNaN(inputVal)) {
        feedback.style.color = '#ff8080';
        feedback.textContent = 'Please enter a valid number.';
        return;
    }

    const userAnswer = Math.round(inputVal * 10) / 10;
    attempts++;

    if (Math.abs(userAnswer - currentProblem.answer) < 0.1) {
        score++;
        streak++;
        feedback.style.color = '#80ff80';
        feedback.textContent = 'Correct! 🎉 Keep it up!';
        showConfetti();
        answerInput.disabled = true;
        checkBtn.disabled = true;
        clearInterval(timerInterval);
        updateScoreboard();

        // ✅ Post-verzoek naar backend om de punten op te slaan
        try {
            const response = await fetch('http://localhost:3000/api/scores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Zorg dat je ingelogd bent!
                },
                body: JSON.stringify({
                    game_name: "Speed, Distance & Time Game",
                    score: 1,  // Elke correcte vraag is 1 punt
                    level: streak // Je kan dit aanpassen op basis van de streak
                })
            });

            if (!response.ok) {
                console.error("Fout bij opslaan van de score:", await response.text());
            }
        } catch (error) {
            console.error("Netwerkfout bij opslaan van de score:", error);
        }
    } else {
        streak = 0;
        feedback.style.color = '#ff9090';
        feedback.textContent = 'Incorrect. Try again!';
    }

    updateScoreboard();
}

// Voorbeeld bij een login in je frontend
// async function loginUser(username, password) {
//     try {
//         const response = await fetch('http://localhost:3000/api/auth/login', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ username, password })
//         });
//
//         if (response.ok) {
//             const data = await response.json();
//             localStorage.setItem('token', data.token); // ✅ JWT-token opslaan
//             alert("Succesvol ingelogd!");
//         } else {
//             alert("Login mislukt.");
//         }
//     } catch (error) {
//         console.error("Netwerkfout:", error);
//     }
// }
