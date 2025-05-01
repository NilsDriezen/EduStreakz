(() => {
    // Game variables
    let score = 0;
    let attempts = 0;
    let streak = 0;
    let highScore = 0;
    let currentProblem = null;
    let timerInterval = null;
    const questionTime = 20; // seconds
    let timeLeft = questionTime;

    // DOM Elements
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

    // Play confetti animation on correct answer
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

    // Load high score from localStorage
    function loadHighScore() {
        const storedHigh = localStorage.getItem('sdtGameHighScore');
        if(storedHigh !== null) {
            highScore = parseInt(storedHigh, 10) || 0;
        }
    }

    // Save high score to localStorage
    function saveHighScore() {
        if(score > highScore) {
            highScore = score;
            localStorage.setItem('sdtGameHighScore', highScore);
        }
    }

    // Update scoreboard text
    function updateScoreboard() {
        saveHighScore();
        scoreboard.textContent = `Score: ${score} | Attempts: ${attempts} | Streak: ${streak} | High Score: ${highScore}`;
    }

    // Generate a random integer between min and max inclusive
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Generate a random float with 1 decimal place (used selectively)
    function randomFloat1(min, max) {
        const val = Math.random() * (max - min) + min;
        return Math.round(val * 10) / 10;
    }

    // Generate a problem with simpler numbers
    // Possible unknowns: 'v' (speed), 't' (time), 'x' (distance)
    // Use integers or one decimal max for simplicity
    function generateProblem() {
        clearInterval(timerInterval);
        timeLeft = questionTime;
        updateTimerBar();

        feedback.textContent = '';
        answerInput.value = '';
        answerInput.disabled = false;
        checkBtn.disabled = false;

        // Which value to find
        const findOption = ['v', 't', 'x'];
        const find = findOption[randomInt(0, 2)];

        let v, t, x;
        switch(find) {
            case 'v':
                // distance 50-500 integer, time 5-60 integer
                x = randomInt(50, 500);
                t = randomInt(5, 60);
                v = x / t;
                v = Math.round(v * 10) / 10; // 1 decimal max
                break;
            case 't':
                // speed 1-20 decimal, distance 50-500 integer
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

        // Round answers to match above
        let answer;
        if(find === 'v') answer = v;
        else if(find === 't') answer = t;
        else answer = x;

        // Problem description + input label + units
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

    // Update timer bar width
    function updateTimerBar() {
        const pct = (timeLeft / questionTime) * 100;
        timerBar.style.width = pct + '%';
        // Change color from green to red on time running out
        let green = Math.floor(255 * pct / 100);
        let red = 255 - green;
        timerBar.style.backgroundColor = `rgb(${red},${green},0)`;
    }

    // Timer countdown function
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

    // When time runs out
    function timeOut() {
        feedback.style.color = 'orange';
        feedback.textContent = 'Time up! The correct answer was: ' + currentProblem.answer;
        attempts++;
        streak = 0;
        updateScoreboard();
        answerInput.disabled = true;
        checkBtn.disabled = true;
    }

    // Check user answer
    function checkAnswer() {
        const inputVal = parseFloat(answerInput.value);
        if(isNaN(inputVal)) {
            feedback.style.color = '#ff8080';
            feedback.textContent = 'Please enter a valid number.';
            return;
        }
        // Round user's input to 1 decimal for test (match problem format)
        const userAnswer = Math.round(inputVal * 10) / 10;
        attempts++;

        if(Math.abs(userAnswer - currentProblem.answer) < 0.1) {
            // Correct answer
            score++;
            streak++;
            feedback.style.color = '#80ff80';
            feedback.textContent = 'Correct! 🎉 Keep it up!';
            showConfetti();
            answerInput.disabled = true;
            checkBtn.disabled = true;
            clearInterval(timerInterval);
        } else {
            // Incorrect answer
            streak = 0;
            feedback.style.color = '#ff9090';
            feedback.textContent = 'Incorrect. Try again!';
        }
        updateScoreboard();
    }

    // Event listeners
    checkBtn.addEventListener('click', () => {
        if(!answerInput.disabled) checkAnswer();
    });

    newProblemBtn.addEventListener('click', () => {
        generateProblem();
    });

    // Enter key triggers check answer unless disabled
    answerInput.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' && !answerInput.disabled) {
            e.preventDefault();
            checkAnswer();
        }
    });

    // Initialize game on load
    loadHighScore();
    generateProblem();
    updateScoreboard();

})();