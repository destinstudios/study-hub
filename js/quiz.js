import {
  auth, db, collection, query, where,
  getDocs, addDoc, serverTimestamp
} from "./firebase.js";

import { watchAuth } from "./auth.js";

const $ = id => document.getElementById(id);

let quizzes = [];
let activeQuiz = null;
let questions = [];
let index = 0;
let score = 0;
let answered = false;

async function loadQuizzes() {
  const q = query(
    collection(db, "quizzes"),
    where("published", "==", true)
  );

  const snapshot = await getDocs(q);

  quizzes = snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  renderQuizzes();
}

function renderQuizzes() {
  $("quizList").innerHTML = quizzes.length
    ? quizzes.map(q => `
      <article class="resource-card glass">
        <span>🧠 ${escapeHTML(q.category || "General")}</span>
        <h3>${escapeHTML(q.title)}</h3>
        <p>${escapeHTML(q.description || "Practice quiz")}</p>
        <button class="btn btn-primary" data-quiz="${q.id}">
          Start Quiz
        </button>
      </article>
    `).join("")
    : '<div class="loading-card glass">No published quizzes yet.</div>';

  $("quizList").querySelectorAll("[data-quiz]").forEach(button => {
    button.onclick = () => startQuiz(button.dataset.quiz);
  });
}

async function startQuiz(id) {
  activeQuiz = quizzes.find(q => q.id === id);
  if (!activeQuiz) return;

  questions = Array.isArray(activeQuiz.questions)
    ? activeQuiz.questions : [];

  if (!questions.length) {
    alert("This quiz has no questions yet.");
    return;
  }

  index = 0;
  score = 0;

  $("quizList").classList.add("hidden");
  $("quizArea").classList.remove("hidden");

  renderQuestion();
}

function renderQuestion() {
  answered = false;

  const q = questions[index];

  $("questionTitle").textContent = q.question;
  $("questionCounter").textContent =
    `Question ${index + 1} of ${questions.length}`;

  $("quizFeedback").textContent = "";

  $("questionOptions").innerHTML = q.options.map((option, i) => `
    <button class="quiz-option" data-option="${i}">
      ${escapeHTML(option)}
    </button>
  `).join("");

  $("questionOptions").querySelectorAll("[data-option]")
    .forEach(button => {
      button.onclick = () => chooseAnswer(
        Number(button.dataset.option)
      );
    });

  $("nextQuestion").textContent =
    index === questions.length - 1 ? "Finish Quiz" : "Next Question";
}

function chooseAnswer(selected) {
  if (answered) return;
  answered = true;

  const correct = Number(questions[index].answer);
  const buttons = [...$("questionOptions").children];

  buttons.forEach((button, i) => {
    button.disabled = true;

    if (i === correct) button.classList.add("correct");
    else if (i === selected) button.classList.add("incorrect");
  });

  if (selected === correct) {
    score++;
    $("quizFeedback").textContent = "Correct answer!";
  } else {
    $("quizFeedback").textContent = "Incorrect. Check the correct option.";
  }
}

$("nextQuestion").onclick = async () => {
  if (!answered) {
    alert("Please select an answer.");
    return;
  }

  if (index < questions.length - 1) {
    index++;
    renderQuestion();
  } else {
    await finishQuiz();
  }
};

async function finishQuiz() {
  $("questionTitle").textContent = "Quiz completed!";
  $("questionCounter").textContent =
    `Your score: ${score}/${questions.length}`;

  $("questionOptions").innerHTML = "";
  $("quizFeedback").textContent =
    `Accuracy: ${Math.round(score / questions.length * 100)}%`;

  $("nextQuestion").classList.add("hidden");

  const user = auth.currentUser;

  if (user) {
    try {
      await addDoc(collection(db, "quizResults"), {
        uid: user.uid,
        quizId: activeQuiz.id,
        score,
        total: questions.length,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Result saving failed:", error);
    }
  }
};

watchAuth(() => {});
loadQuizzes().catch(error => {
  console.error(error);
  $("quizList").textContent = "Unable to load quizzes.";
});

function escapeHTML(s) {
  return String(s || "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[c]);
}
