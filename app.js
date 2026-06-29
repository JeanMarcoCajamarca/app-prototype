// Initialize Supabase Client
//const _supabaseUrl = 'https://ovjimwuszbumvbdvvgqa.supabase.co';
//const _supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92amltd3VzemJ1bXZiZHZ2Z3FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMjg2ODMsImV4cCI6MjA4NzcwNDY4M30.3cyON8YKHiq4m873YV_QxVE-uT4daGfJ7aXnzWfN7Gw';
//const db = supabase.createClient(_supabaseUrl, _supabaseKey);

let currentUser = null;

async function handleAuth(type) {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const errorDisplay = document.getElementById('auth-error');
    
    if (password.length > 10) {
        errorDisplay.innerText = "Password too long! 10 chars max., please!";
        return;
    }

    errorDisplay.innerText = "Processing...";
    
    let result;
    if (type === 'signup') {
        result = await db.auth.signUp({ email, password });
        if (!result.error) {
            alert("Welcome to the Horde! Please check your email to verify your account.");
            errorDisplay.innerText = "Verification email sent!";
            return;
        }
    } else {
        result = await db.auth.signInWithPassword({ email, password });
    }

    if (result.error) {
        errorDisplay.innerText = result.error.message;
    } else {
        currentUser = result.data.user;
        enterOS();
    }
}

function enterOS() {
    const loginScreen = document.getElementById('login-screen');
    const desktop = document.getElementById('desktop');
    
    if (loginScreen) loginScreen.classList.add('hidden');
    if (desktop) desktop.classList.remove('hidden');
    console.log("Welcome to the Horde!");
}

async function handleSignOut() {
    await db.auth.signOut();
    location.reload();
}

'use strict';

/* ============================================================
   QUIZ ENGINE DATABASES & CONFIGURATION
   ============================================================ */
const QUIZZES = {
  math: [
    { q: "4 + 5 = ?", a: ["7", "1", "6", "9"], correct: 3 },
    { q: "5 - 2 = ?", a: ["1", "6", "3", "7"], correct: 2 },
    { q: "2 * 3 = ?", a: ["6", "5", "1", "8"], correct: 0 },
    { q: "10 / 5 = ?", a: ["5", "2", "15", "50"], correct: 1 },
    { q: "10 - 8 = ?", a: ["18", "2", "9", "1"], correct: 1 }
  ],
  social: [
    { q: "Who was the primary author of the Declaration of Independence during the American Revolution?", a: ["George Washington", "Thomas Jefferson", "Benjamin Franklin", "John Adams"], correct: 1 },
    { q: "Which 1863 proclamation declared that all slaves within rebellious states were free?", a: ["The Emancipation Proclamation", "The Gettysburg Address", "The Bill of Rights", "The Thirteenth Amendment"], correct: 0 },
    { q: "Which system of laws enforced racial segregation in the American South prior to the Civil Rights Movement?", a: ["Black Codes", "Jim Crow Laws", "Reconstruction Acts", "Federalist Papers"], correct: 1 },
    { q: "Who refused to give up her seat on a Montgomery bus in 1955, sparking a landmark civil rights boycott?", a: ["Harriet Tubman", "Rosa Parks", "Coretta Scott King", "Sojourner Truth"], correct: 1 },
    { q: "Where did Dr. Martin Luther King Jr. deliver his iconic 'I Have a Dream' speech in 1963?", a: ["The Lincoln Memorial", "The White House", "The Supreme Court", "The Capitol Building"], correct: 0 }
  ]
};

let currentQuizKey = null;
let currentQuestionIndex = 0;
let userScore = 0;

/* ============================================================
   QUIZ APPLICATION LOGIC
   ============================================================ */
function startQuiz(subjectKey) {
  currentQuizKey = subjectKey;
  currentQuestionIndex = 0;
  userScore = 0;
  
  document.getElementById('quiz-selection').classList.add('hidden');
  document.getElementById('quiz-interface').classList.remove('hidden');
  
  showQuestion();
}

function showQuestion() {
  const container = document.getElementById('question-container');
  const feedback = document.getElementById('feedback-container');
  const scoreView = document.getElementById('score-container');
  
  feedback.classList.add('hidden');
  scoreView.classList.add('hidden');
  container.classList.remove('hidden');
  
  const currentQuestion = QUIZZES[currentQuizKey][currentQuestionIndex];
  
  let optionsHtml = currentQuestion.a.map((option, idx) => `
    <button class="quiz-option-btn" onclick="submitAnswer(${idx})">
      <span class="option-letter">${String.fromCharCode(97 + idx)}.</span> ${option}
    </button>
  `).join('');
  
  container.innerHTML = `
    <div class="quiz-card">
      <div class="quiz-progress">Question ${currentQuestionIndex + 1} of 5</div>
      <h3 class="quiz-question-text">${currentQuestion.q}</h3>
      <div class="quiz-options-list">${optionsHtml}</div>
    </div>
  `;
}

function submitAnswer(selectedIndex) {
  const currentQuestion = QUIZZES[currentQuizKey][currentQuestionIndex];
  const isCorrect = (selectedIndex === currentQuestion.correct);
  
  if (isCorrect) {
    userScore++;
  }
  
  const container = document.getElementById('question-container');
  const feedback = document.getElementById('feedback-container');
  
  container.classList.add('hidden');
  feedback.classList.remove('hidden');
  
  let imgPath = isCorrect ? "correct.png" : "wrong_answer.png";
  let bubbleText = isCorrect ? "Correct! You're doing great! Go on to the next question!" : "Sorry! That answer is wrong!";
  
  feedback.innerHTML = `
    <div class="feedback-layout">
      <div class="mascot-feedback-box">
        <img src="assets/${imgPath}" class="feedback-mascot-img" alt="Status Visual">
        <div class="feedback-speech-bubble"><p>${bubbleText}</p></div>
      </div>
      <button class="green-arrow-btn" onclick="advanceQuiz()">
        <span class="arrow-icon">➔</span> Next
      </button>
    </div>
  `;
}

function advanceQuiz() {
  currentQuestionIndex++;
  if (currentQuestionIndex < 5) {
    showQuestion();
  } else {
    showFinalResults();
  }
}

function showFinalResults() {
  const feedback = document.getElementById('feedback-container');
  const scoreView = document.getElementById('score-container');
  
  feedback.classList.add('hidden');
  scoreView.classList.remove('hidden');
  
  let perfectScore = (userScore === 5);
  let imgPath = perfectScore ? "Lucy_the_elf.png" : "wrong_answer.png";
  let bubbleText = perfectScore ? "Congratulations! You got all of them right! You're a super star!" : "Ummm...better luck next time?";
  
  scoreView.innerHTML = `
    <div class="quiz-card final-results-card">
      <div class="mascot-feedback-box">
        <img src="assets/${imgPath}" class="feedback-mascot-img" alt="Final Outcome Visual">
        <div class="feedback-speech-bubble"><p>${bubbleText}</p></div>
      </div>
      <div class="quiz-score-summary">Final Score: ${userScore} / 5</div>
      <div class="final-actions-row">
        <button class="btn btn-primary" onclick="startQuiz('${currentQuizKey}')">Retry Quiz</button>
        <button class="btn btn-secondary" onclick="quitToHome()">Quit to Home</button>
      </div>
    </div>
  `;
}

function quitToHome() {
  document.getElementById('quiz-interface').classList.add('hidden');
  document.getElementById('quiz-selection').classList.remove('hidden');
  switchPanel('dashboard');
}

/* ============================================================
   PANEL NAVIGATION HANDLERS
   ============================================================ */
function switchPanel(panelId) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  
  const targetPanel = document.getElementById(`panel-${panelId}`);
  if (targetPanel) targetPanel.classList.add('active');
  
  const targetBtn = document.querySelector(`[data-panel="${panelId}"]`);
  if (targetBtn) targetBtn.classList.add('active');
  
  // Show home landing mascot only when viewing the primary dashboard panel
  const mascotContainer = document.getElementById('mascot-container');
  if (mascotContainer) {
    if (panelId === 'dashboard') {
      mascotContainer.style.display = 'flex';
    } else {
      mascotContainer.style.display = 'none';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-panel]').forEach(button => {
    button.addEventListener('click', (e) => {
      const panelId = button.getAttribute('data-panel');
      if (panelId) switchPanel(panelId);
    });
  });
});
