(() => {
    let score = 0;
    let attempts = 0;
    let currentProblem = null;

    const problemText = document.getElementById('problem-text');
    const answerInput = document.getElementById('answer-input');
    const answerLabel = document.getElementById('answer-label');
    const unitDisplay = document.getElementById('unit');
    const feedback = document.getElementById('feedback');
    const scoreboard = document.getElementById('scoreboard');
    const checkBtn = document.getElementById('check-btn');
    const newProblemBtn = document.getElementById('new-problem-btn');

    // random float/double
    function randomFloat(min, max, decimals=2) {
        const val = Math.random() * (max - min) + min;
        return parseFloat(val.toFixed(decimals));
    }

    // 2 random vragen
    function generateProblem() {
        // Reset feedback and answer input
        feedback.textContent = '';
        answerInput.value = '';
        answerInput.disabled = false;
        checkBtn.disabled = false;

        // random waarde
        const findOption = ['v', 't', 'x'];
        const find = findOption[Math.floor(Math.random() * findOption.length)];

        // waarden genereren
        let v, t, x;
        switch(find) {
            case 'v':
                t = randomFloat(1, 120);
                x = randomFloat(1, 3000);
                v = x / t;
                break;
            case 't':
                v = randomFloat(1, 30);
                x = randomFloat(1, 3000);
                t = x / v;
                break;
            case 'x':
                v = randomFloat(1, 30);
                t = randomFloat(1, 120);
                x = v * t;
                break;
        }

        // afronden tot 2 decimalen
        let answer;
        if(find === 'v') answer = parseFloat(v.toFixed(2));
        else if(find === 't') answer = parseFloat(t.toFixed(2));
        else answer = parseFloat(x.toFixed(2));


        let problemStr = '';
        let labelStr = '';
        let unitStr = '';
        if(find === 'v') {
            problemStr = `Given distance Δx = <strong>${x.toFixed(2)} meters</strong><br>and time Δt = <strong>${t.toFixed(2)} seconds</strong>,<br>calculate the <strong>speed (v)</strong>.`;
            labelStr = 'Speed (v) in m/s:';
            unitStr = 'meters per second (m/s)';
        } else if(find === 't') {
            problemStr = `Given speed v = <strong>${v.toFixed(2)} meters/second</strong><br>and distance Δx = <strong>${x.toFixed(2)} meters</strong>,<br>calculate the <strong>time interval (Δt)</strong>.`;
            labelStr = 'Time (Δt) in seconds:';
            unitStr = 'seconds (s)';
        } else {
            problemStr = `Given speed v = <strong>${v.toFixed(2)} meters/second</strong><br>and time Δt = <strong>${t.toFixed(2)} seconds</strong>,<br>calculate the <strong>distance (Δx)</strong>.`;
            labelStr = 'Distance (Δx) in meters:';
            unitStr = 'meters (m)';
        }

        currentProblem = {
            find,
            answer
        };

        problemText.innerHTML = problemStr;
        answerLabel.textContent = labelStr;
        unitDisplay.textContent = `Unit: ${unitStr}`;
    }

    // gebruikers input
    function checkAnswer() {
        const inputVal = parseFloat(answerInput.value);
        if(isNaN(inputVal)) {
            feedback.style.color = 'red';
            feedback.textContent = 'Please enter a valid number.';
            return;
        }
        // vergelijking
        const userAnswer = parseFloat(inputVal.toFixed(2));
        attempts++;

        if(userAnswer === currentProblem.answer) {
            score++;
            feedback.style.color = 'green';
            feedback.textContent = 'Correct! Great job.';

            answerInput.disabled = true;
            checkBtn.disabled = true;
        } else {
            feedback.style.color = 'red';
            feedback.textContent = `Incorrect. Try again or press "New Problem".`;
        }
        updateScoreboard();
    }

    function updateScoreboard() {
        scoreboard.textContent = `Score: ${score} | Attempts: ${attempts}`;
    }

    checkBtn.addEventListener('click', checkAnswer);
    newProblemBtn.addEventListener('click', generateProblem);


    generateProblem();
    updateScoreboard();
})();