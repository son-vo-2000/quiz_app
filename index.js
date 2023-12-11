let url;
const startBtn = document.getElementById("btn_start");
const nextBtn = document.getElementById("btn_next");
const resetBtn = document.querySelector("#reset_btn");
const backBtn = document.querySelector("#return_home");

const answersContainer = document.querySelector("#quiz__answers_container");
const subjectSelector = document.getElementById("topic");

const quizQuestion = document.querySelector("#quiz__question");
const inputAmount = document.querySelector("#amount");
const errorMessage = document.querySelector("#error_message");
const progressBarContainer = document.getElementById("progress_bar_container");
const progressBar = document.querySelector("#progress_bar");
const appContainer = document.querySelector("#app_container");
const scoreHTML = document.querySelector("#score");
const timerDisplay = document.querySelector("#timer");

const form = document.querySelector("#form_input");
const quizBody = document.querySelector("#quiz_content");
const scoreContainer = document.querySelector("#score_container");

const questions = [];
let totalLength;
let currentIndex = 0;
let currentQuestion;
let correctAnswer;
let score = 0;
let currentQuestionNumber;
let timeId;
let timer;
let intervalTimer;
// default stats
function defaultState() {
  clearState();
  quizBody.classList.add("hide");
  scoreContainer.classList.add("hide");
  appContainer.classList.add("hide");
  backBtn.classList.add("hide")
  startBtn.addEventListener("click", getSubject);
  nextBtn.addEventListener("click", nextQuestion);
  resetBtn.addEventListener("click", resetGame);
  backBtn.addEventListener("click", resetGame)
}

defaultState();

// get option from <select> and fetch base on that option value
function getSubject(e) {
  e.preventDefault();

  errorMessage.innerHTML = "";

  const subjectIndex = subjectSelector.selectedIndex;
  if (subjectIndex < 1 && inputAmount.value < 1) {
    errorMessage.innerHTML = "Please select a topic and number of question";
    subjectSelector.focus();
    return;
  }

  if (subjectIndex < 1) {
    errorMessage.innerHTML = "Please select a topic";
    subjectSelector.focus();
    return;
  }

  if (inputAmount.value < 1) {
    errorMessage.innerHTML = "Number of questions must be more than 0";
    inputAmount.focus();
    return;
  }
  startBtn.disabled = true;
  if (timeId) {
    clearTimeout(timeId);
  }

  // this is how we get the value of selected option | we can use subjectIndex for this
  //
  const value = subjectSelector.options[subjectIndex].value;

  if (value == "cs") {
    url = `https://opentdb.com/api.php?amount=${inputAmount.value}&category=18&type=multiple`;
  } else if (value == "animal") {
    url = `https://opentdb.com/api.php?amount=${inputAmount.value}&category=27&type=multiple`;
  } else if (value == "his") {
    url = `https://opentdb.com/api.php?amount=${inputAmount.value}&category=23&type=multiple`;
  }

  fetchQuestions(url);

  timeId = setTimeout(() => {
    //show questions container and hide form
    quizBody.classList.remove("hide");
    form.classList.add("hide");
    backBtn.classList.remove("hide")
    appContainer.classList.remove("hide");
  }, 700);
}

function resetNextBtn() {
  // reset quiz body functionality
  quizBody.classList.remove("hide");
  nextBtn.removeEventListener("click", GameOver);
  nextBtn.addEventListener("click", nextQuestion);
  nextBtn.innerHTML = "Next";
}

async function fetchQuestions(url) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      const result = data.results;
      questions.push(...result);
      totalLength = questions.length;
      showQuestion(0);
    }
  } catch (error) {
    console.log(error);
  }
}

function countDownTimer() {
  // initial timer
  timer = 20;

  intervalTimer = setInterval(() => {
    if (timer == 0) {
      answersContainer.removeEventListener("click", checkAnswer);
      nextBtn.classList.remove("hide");
      correctAnswer.classList.add("timeout_correct_answer");
      const listAnswer = answersContainer.children;

      for (let i = 0; i < listAnswer.length; i++) {
        listAnswer[i].classList.add("timeout");
      }

      clearInterval(intervalTimer);
    }

    timerDisplay.innerHTML = ` ${timer}s`;
    timer--;

    // if timer == 0 stop
  }, 1000);
}

function showQuestion(increaseNum) {
  clearState();
  countDownTimer();
  // increase the index to show the next question
  const index = (currentIndex += increaseNum);
  currentQuestion = questions[index];

  //progressbar percentage cal: percentage = (completedQuestions / totalQuestions) * 100;
  const percentageBar = (index / totalLength) * 100;
  progressBar.style.width = percentageBar + "%";

  // question's title
  currentQuestionNumber = currentIndex + 1;

  quizQuestion.innerHTML = `${currentQuestionNumber}) ${currentQuestion.question}`;

  // extract correct answer to li
  correctAnswer = document.createElement("li");
  correctAnswer.innerHTML = currentQuestion.correct_answer;
  correctAnswer.classList.add("quiz_answer");
  correctAnswer.dataset.correct = "true";

  // extract incorrect answers to lis
  const incorrectAnswer = currentQuestion.incorrect_answers.map((ans) => {
    const choice = document.createElement("li");
    choice.innerHTML = ans;
    choice.classList.add("quiz_answer");
    return choice;
  });

  // randomize all the choices and append to ul
  const randomizeAnswer = randomizeChoices([correctAnswer, ...incorrectAnswer]);
  randomizeAnswer.forEach((answer) => {
    answersContainer.append(answer);
  });

  // b/c we remove this event after we click on the answer
  // so now we add it back after we show a new question
  //
  answersContainer.addEventListener("click", checkAnswer);

  if (currentIndex == totalLength - 1) {
    finishStage();
  }
}

// need to improve this randomize choices
function randomizeChoices(choices) {
  choices.sort(() => Math.random() - 0.5);
  return choices;
}

function clearState() {
  quizQuestion.innerHTML = " ";

  let child = answersContainer.lastElementChild;
  while (child) {
    answersContainer.removeChild(child);
    child = answersContainer.lastElementChild;
  }

  nextBtn.classList.add("hide");
}

function nextQuestion() {
  if (!questions) {
    return;
  }

  timer = 0;
  showQuestion(1);
}

function checkAnswer(e) {
  if (e.target.tagName != "LI") {
    return;
  }

  clearInterval(intervalTimer);

  if (e.target.tagName == "LI") {
    if (e.target.innerText == correctAnswer.innerText) {
      e.target.classList.add("selected_correct");
      score++;
    } else {
      e.target.classList.add("selected_incorrect");
      correctAnswer.classList.add("selected_correct");
    }
  }

  // show next button and disable click on answers
  //
  answersContainer.removeEventListener("click", checkAnswer);
  nextBtn.classList.remove("hide");
}

function finishStage() {
  // modify the next button at the last question
  // instead of going to the next question we clear the state and show score
  //
  nextBtn.innerHTML = "Finish";
  nextBtn.removeEventListener("click", nextQuestion);
  nextBtn.addEventListener("click", GameOver);
}

function GameOver() {
  if (score == totalLength) {
    scoreHTML.innerHTML = `Congrats! You have the perfect score ${score} out of ${totalLength}`;
  } else {
    scoreHTML.innerHTML = `You've got ${score} out of ${totalLength}`;
  }
  const percentageBar = 100;
  progressBar.style.width = percentageBar + "%";
  // show score board and hide body quiz
  scoreContainer.classList.remove("hide");
  quizBody.classList.add("hide");
}

function resetGame() {
  // reset form input
  inputAmount.value = 1;
  subjectSelector.selectedIndex = 0;
  startBtn.disabled = false;

  // reset body quiz
  clearState();
  resetNextBtn();
  clearInterval(intervalTimer)
  progressBar.innerHTML = "";

  // clear questions array and program variables
  while (questions.length) {
    questions.pop();
  }
  currentIndex = 0;
  totalLength = 0;
  score = 0;

  //show form and hide score board and body quiz
  form.classList.remove("hide");
  backBtn.classList.add("hide");
  scoreContainer.classList.add("hide");
  quizBody.classList.add("hide");
  appContainer.classList.add("hide");
}
