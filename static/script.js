let wordsArray = [];
let currentLineIndex = 0;
const wordsPerLine = 10;
const maxVisibleLines = 5;
let startTime = null;
let timeLeft = 60;
let timerInterval = null;
let correctWords = 0;
let totalWordsTyped = 0;
let testActive = false;
let typedText = ""; // This will store what the user has typed
let cursorPosition = 0; // Track cursor position
let currentWordIndex = 0;
let currentCharIndex = 0;

async function initializeTest() {
    await fetchWords();
    const typingArea = document.getElementById("typing-area");
    const hiddenInput = document.getElementById("hidden-input");

    // Focus hidden input when typing area is clicked
    typingArea.addEventListener("click", function() {
        hiddenInput.focus();
    });

    // Focus hidden input when any key is pressed
    document.addEventListener("keydown", function(e) {
        if (!testActive && e.key.length === 1) {
            hiddenInput.focus();
        }
    });

    // Handle input in the hidden input field
    hiddenInput.addEventListener("input", handleTyping);
    hiddenInput.addEventListener("keydown", function(e) {
        // Handle special keys (backspace, space, etc.)
        if (e.key === "Backspace") {
            handleBackspace();
            e.preventDefault(); // Prevent default to handle backspace manually
        }
    });

    // Initial focus
    typingArea.focus();
}

async function fetchWords() {
    try {
        const response = await fetch('/get_words');
        const words = await response.json();

        wordsArray = words; // Store all words
        currentLineIndex = 0;
        displayLines();
    } catch (error) {
        console.error("Error fetching words:", error);
        // Fallback words in case the fetch fails
        wordsArray = [
            "the", "be", "to", "of", "and", "a", "in", "that", "have", "I",
            "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
            "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
            "or", "an", "will", "my", "one", "all", "would", "there", "their", "what"
        ];
        currentLineIndex = 0;
        displayLines();
    }
}

function displayLines() {
    const wordContainer = document.getElementById("word-container");
    wordContainer.innerHTML = ""; // Clear previous content

    for (let i = currentLineIndex; i < currentLineIndex + maxVisibleLines; i++) {
        if (i * wordsPerLine < wordsArray.length) {
            const line = wordsArray.slice(i * wordsPerLine, (i + 1) * wordsPerLine);
            const lineDiv = document.createElement("div");
            lineDiv.classList.add("word-line");

            // Create individual word spans for more precise styling
            line.forEach((word, index) => {
                const wordSpan = document.createElement("span");
                wordSpan.classList.add("word");

                // Add characters as individual spans for the first word
                if (i === currentLineIndex && index === 0) {
                    wordSpan.classList.add("current-word");

                    // Add characters with spans
                    for (let charIndex = 0; charIndex < word.length; charIndex++) {
                        const charSpan = document.createElement("span");
                        charSpan.textContent = word[charIndex];
                        charSpan.classList.add("char");
                        charSpan.setAttribute("data-index", charIndex);
                        wordSpan.appendChild(charSpan);
                    }
                } else {
                    wordSpan.textContent = word;
                }

                lineDiv.appendChild(wordSpan);

                // Add space after each word except the last one
                if (index < line.length - 1) {
                    const space = document.createTextNode(" ");
                    lineDiv.appendChild(space);
                }
            });

            wordContainer.appendChild(lineDiv);
        }
    }

    // Add cursor after first initialization
    if (currentLineIndex === 0 && currentWordIndex === 0) {
        addCursorAtPosition(0);
    }
}

function handleTyping(e) {
    if (!testActive) {
        startTest();
    }

    // Get the typed character
    const typedChar = e.data;
    if (!typedChar) return;

    // Update the typed text
    typedText += typedChar;

    // Get the current word being typed
    const currentLineWords = wordsArray.slice(currentLineIndex * wordsPerLine, (currentLineIndex + 1) * wordsPerLine);
    const currentWord = currentLineWords[currentWordIndex];

    // Update display and check correctness
    updateDisplay(typedChar);

    // Check if space was typed - move to next word
    if (typedChar === " ") {
        // Move to the next word
        currentWordIndex++;
        currentCharIndex = 0;

        // Check if we need to move to next line
        if (currentWordIndex >= wordsPerLine) {
            currentLineIndex++;
            currentWordIndex = 0;
            displayLines();
        } else {
            // Update the current word highlight
            updateCurrentWordHighlight();
        }

        typedText = ""; // Reset typed text for the new word
    } else {
        // Move cursor to next position
        currentCharIndex++;

        // Update cursor position
        updateCursorPosition();
    }

    // Update WPM
    updateWPM();
}

function handleBackspace() {
    if (typedText.length === 0 && currentWordIndex > 0) {
        // Move to previous word if at the beginning of current word
        currentWordIndex--;

        // Get the current line words
        const currentLineWords = wordsArray.slice(currentLineIndex * wordsPerLine, (currentLineIndex + 1) * wordsPerLine);
        const prevWord = currentLineWords[currentWordIndex];

        // Reset typed text to match the previous word
        typedText = prevWord;
        currentCharIndex = prevWord.length;

        // Update highlights
        updateCurrentWordHighlight();
        updateCursorPosition();
    } else if (typedText.length > 0) {
        // Remove last character from typed text
        typedText = typedText.slice(0, -1);
        currentCharIndex--;

        // Update display
        updateDisplay(null, true);
        updateCursorPosition();
    }
}

function updateDisplay(typedChar, isBackspace = false) {
    // Get the current word element
    const wordLines = document.querySelectorAll(".word-line");
    if (wordLines.length === 0) return;

    const currentWordElement = wordLines[0].querySelectorAll(".word")[currentWordIndex];
    const currentLineWords = wordsArray.slice(currentLineIndex * wordsPerLine, (currentLineIndex + 1) * wordsPerLine);
    const currentWord = currentLineWords[currentWordIndex];

    // If this is the first character typed in this word, create character spans
    if (currentWordElement.querySelectorAll(".char").length === 0) {
        currentWordElement.innerHTML = "";
        for (let i = 0; i < currentWord.length; i++) {
            const charSpan = document.createElement("span");
            charSpan.textContent = currentWord[i];
            charSpan.classList.add("char");
            charSpan.setAttribute("data-index", i);
            currentWordElement.appendChild(charSpan);
        }
    }

    // Update character styling based on correctness
    const charElements = currentWordElement.querySelectorAll(".char");
    for (let i = 0; i < charElements.length; i++) {
        if (i < typedText.length) {
            if (typedText[i] === currentWord[i]) {
                charElements[i].classList.add("correct-char");
                charElements[i].classList.remove("incorrect-char");
            } else {
                charElements[i].classList.add("incorrect-char");
                charElements[i].classList.remove("correct-char");
            }
        } else {
            // Reset styling for untyped characters
            charElements[i].classList.remove("correct-char");
            charElements[i].classList.remove("incorrect-char");
        }
    }
}

function updateCurrentWordHighlight() {
    // Remove highlight from all words
    document.querySelectorAll(".word").forEach(el => {
        el.classList.remove("current-word");
    });

    // Add highlight to current word
    const wordLines = document.querySelectorAll(".word-line");
    if (wordLines.length === 0) return;

    const currentWords = wordLines[0].querySelectorAll(".word");
    if (currentWordIndex < currentWords.length) {
        currentWords[currentWordIndex].classList.add("current-word");

        // Ensure the current word has character spans
        const currentLineWords = wordsArray.slice(currentLineIndex * wordsPerLine, (currentLineIndex + 1) * wordsPerLine);
        const currentWord = currentLineWords[currentWordIndex];

        if (currentWords[currentWordIndex].querySelectorAll('.char').length === 0) {
            currentWords[currentWordIndex].innerHTML = "";
            for (let i = 0; i < currentWord.length; i++) {
                const charSpan = document.createElement("span");
                charSpan.textContent = currentWord[i];
                charSpan.classList.add("char");
                charSpan.setAttribute("data-index", i);
                currentWords[currentWordIndex].appendChild(charSpan);
            }
        }

        // Position cursor at beginning of word
        addCursorAtPosition(0);
    }
}

function addCursorAtPosition(position) {
    // Remove any existing cursors
    const existingCursor = document.querySelector(".cursor");
    if (existingCursor) {
        existingCursor.remove();
    }

    // Get the current word
    const wordLines = document.querySelectorAll(".word-line");
    if (wordLines.length === 0) return;

    const currentWordElement = wordLines[0].querySelectorAll(".word")[currentWordIndex];
    if (!currentWordElement) return;

    // Get the character at cursor position
    const chars = currentWordElement.querySelectorAll(".char");

    // Create cursor element
    const cursor = document.createElement("span");
    cursor.classList.add("cursor");

    if (position < chars.length) {
        // Insert cursor before the character
        chars[position].before(cursor);
    } else {
        // Add cursor at the end of the word
        currentWordElement.appendChild(cursor);
    }
}

function updateCursorPosition() {
    // Update cursor position based on current character index
    addCursorAtPosition(currentCharIndex);
}

function calculateLineAccuracy() {
    const currentLineWords = wordsArray.slice(currentLineIndex * wordsPerLine, (currentLineIndex + 1) * wordsPerLine);
    const typedWords = [];

    // Collect the words typed
    for (let i = 0; i < wordsPerLine; i++) {
        const wordElement = document.querySelectorAll(".word-line")[0].querySelectorAll(".word")[i];
        const correctChars = wordElement.querySelectorAll(".correct-char").length;
        const wordLength = currentLineWords[i].length;

        // Consider a word correct if all characters are correct
        if (correctChars === wordLength) {
            correctWords++;
        }

        totalWordsTyped++;
    }
}

function updateWPM() {
    if (!startTime) return;

    const elapsedMinutes = (new Date() - startTime) / 60000;
    if (elapsedMinutes === 0) return;

    // Calculate words based on total characters typed divided by 5 (average word length)
    const totalChars = calculateTotalTypedChars();
    const estimatedWords = totalChars / 5;

    const wpm = Math.round(estimatedWords / elapsedMinutes);
    document.getElementById("wpm").innerText = isNaN(wpm) || wpm < 0 ? "0" : wpm;
}

function calculateTotalTypedChars() {
    // Sum of all characters typed so far in completed words
    let totalChars = 0;

    // Characters in completed lines
    for (let i = 0; i < currentLineIndex; i++) {
        const lineWords = wordsArray.slice(i * wordsPerLine, (i + 1) * wordsPerLine);
        lineWords.forEach(word => {
            totalChars += word.length + 1; // +1 for space
        });
    }

    // Characters in completed words of current line
    for (let i = 0; i < currentWordIndex; i++) {
        const word = wordsArray[currentLineIndex * wordsPerLine + i];
        totalChars += word.length + 1; // +1 for space
    }

    // Characters in current word
    totalChars += currentCharIndex;

    return totalChars;
}

function calculateFinalAccuracy() {
    // Calculate based on correct characters vs total typed characters
    const correctChars = document.querySelectorAll(".correct-char").length;
    const totalChars = calculateTotalTypedChars();

    return totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;
}

function startTest() {
    // Only start if the test is not already active
    if (testActive) return;

    testActive = true;
    startTime = new Date();
    timeLeft = 60;

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);

    // Show restart button
    document.getElementById("restart-button").style.display = "flex";

    // Hide instruction text
    document.querySelector(".instruction-text").style.display = "none";
}

function updateTimer() {
    timeLeft--;
    document.getElementById("time-left").innerText = timeLeft;

    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        endTest();
    }
}

function endTest() {
    testActive = false;

    // Disable further typing
    document.getElementById("hidden-input").blur();
    document.getElementById("typing-area").setAttribute("tabindex", "-1");

    // Calculate final statistics
    const finalWPM = document.getElementById("wpm").innerText;
    const accuracy = calculateFinalAccuracy();

    // Show results section
    showResults(finalWPM, accuracy);
}

function showResults(wpm, accuracy) {
    document.getElementById('final-wpm').textContent = wpm;
    document.getElementById('accuracy').textContent = accuracy + '%';
    document.getElementById('results').style.display = 'block';
}

function resetTest() {
    document.getElementById('results').style.display = 'none';
    restartTest();
}

async function restartTest() {
    // Reset variables
    testActive = false;
    correctWords = 0;
    totalWordsTyped = 0;
    startTime = null;
    typedText = "";
    currentWordIndex = 0;
    currentCharIndex = 0;

    // Clear any existing timer
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    // Reset UI
    document.getElementById("typing-area").setAttribute("tabindex", "0");
    document.getElementById("hidden-input").value = "";
    document.getElementById("wpm").innerText = "0";
    document.getElementById("time-left").innerText = "60";
    document.getElementById("results").style.display = "none";
    document.querySelector(".instruction-text").style.display = "block";

    // Fetch new words
    await fetchWords();

    // Focus on the input
    document.getElementById("hidden-input").focus();
}