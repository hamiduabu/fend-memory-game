// For a little bit of readability and less typing
function select(element) {
  return document.querySelector(element);
}

function selectAll(element) {
  return document.querySelectorAll(element);
}

const minutes = select('#minutes');
const seconds = select('#seconds');
const cardHolder = selectAll('.card i');
const starRating = selectAll('.stars li');
const displayMoves = select('.moves');

let timeCount = '';
let minuteCount = 0;
let secondsCount = 0;
let isTimeStarted = false;
let starsEarned = 3;
let lockBoard = false; // Logic from https://youtu.be/yMNFOyRELrI?list=PLLX1I3KXZ-YH-woTgiCfONMya39-Ty8qw
let clicks = 0;
let moves = 0;
let openedCards = [];
let isGameOver = false;
let matchedCards = 0;

// list to hold all the cards
const cardList = [
  'fa-diamond',
  'fa-paper-plane-o',
  'fa-anchor',
  'fa-bolt',
  'fa-cube',
  'fa-leaf',
  'fa-bicycle',
  'fa-bomb',
  'fa-diamond',
  'fa-paper-plane-o',
  'fa-anchor',
  'fa-bolt',
  'fa-cube',
  'fa-leaf',
  'fa-bicycle',
  'fa-bomb'
];

// shuffle the list of cards using the provided "shuffle" method and attach to the page.
shuffleAndAppendCardList();

const GameBoard = select('.container');

// Event listener for the Game.
GameBoard.addEventListener('click', startGame());

function startGame() {
  return event => {
    if (lockBoard) return;

    showCard(event);

    // Compare Cards
    compareCards();

    // Game over logic
    allCardsMatch();

    // Star rating
    calculateStars();

    restartGame(event);

    closeModal(event);
  };
}

// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
  let currentIndex = array.length;
  let temporaryValue;
  let randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

// Shuffle and add/append cards to document
function shuffleAndAppendCardList() {
  const shuffledCards = shuffle(cardList);
  cardHolder.forEach((card, position) => {
    if (cardHolder[position].classList.length > 1) {
      card.classList = 'fa';
    }
    card.classList.add(shuffledCards[position]);
  }, shuffledCards);
}

// Function to open and store opened cards
function showCard(event) {
  const clickedCard = event.target;
  if (clickedCard.className === 'card') {
    startTimer();

    clickedCard.classList.add('open', 'show');
    if (
      !openedCards.includes(clickedCard) &&
      !clickedCard.classList.contains('match')
    ) {
      openedCards.push(clickedCard);
    }
    clicks++;
    moves = clicks / 2;
    displayMoves.innerHTML = Math.floor(moves);
  }
}

// function to start time counter
function startTimer() {
  if (!isTimeStarted) {
    timeCount = setInterval(timer, 1000);
    isTimeStarted = true;
  }
}

// Function to check if cards match or not
function compareCards() {
  if (openedCards.length === 2) {
    const cardsMatch =
      openedCards[0].firstElementChild.classList[1] ===
      openedCards[1].firstElementChild.classList[1];
    cardsMatch ? addMatch() : noMatch();
  }

  function addMatch() {
    openedCards[0].classList.add('match');
    openedCards[1].classList.add('match');
    matchedCards++;
    openedCards = [];
  }

  function noMatch() {
    lockBoard = true;
    setTimeout(() => {
      openedCards[0].classList.remove('open', 'show', 'nomatch');
      openedCards[1].classList.remove('open', 'show', 'nomatch');
      openedCards = [];
      lockBoard = false;
    }, 1000);
    openedCards[0].classList.add('nomatch');
    openedCards[1].classList.add('nomatch');
  }
}

// Game completion function
/*
 *TODO: Consider using this condition:
 * const appendedCards = selectAll('.card');
 * const appendedCardsArray = Array.from(appendedCards);
 * (appendedCardsArray.every(card => card.className === 'card open show match'))
 */
function allCardsMatch() {
  const winConditionMet = matchedCards === 8;
  if (winConditionMet) {
    endGame();
  }

  function endGame() {
    const modalBody = select('.modal-container');
    const modalStars = select('#stars-earned');
    const modalMoves = select('#moves-made');
    const modalTime = select('#time-taken');
    setTimeout(() => {
      modalBody.style.display = 'flex';
      modalStars.innerHTML = ` ${starsEarned}`;
      modalMoves.innerHTML = ` ${moves}`;
      modalTime.innerHTML = ` ${minuteCount} min(s) ${secondsCount} secs`;
    }, 500);
    clearInterval(timeCount);
    isGameOver = true;
    matchedCards = 0;
  }
}

// Calculate and display stars earned
function calculateStars() {
  if (moves > 14) {
    const twoStars = starRating[2];
    awardStar(twoStars);
    starsEarned = 2;
  }
  if (moves > 20) {
    const oneStar = starRating[1];
    awardStar(oneStar);
    starsEarned = 1;
  }
  if (moves > 26) {
    const noStars = starRating[0];
    awardStar(noStars);
    starsEarned = 0;
  }
  function awardStar(starlevel) {
    starlevel.firstElementChild.style = 'visibility:hidden';
  }
}

// Timer
function timer() {
  if (secondsCount < 60) {
    secondsCount++;
  }
  if (secondsCount === 60) {
    secondsCount = 0;
    minuteCount++;
  }
  if (secondsCount < 10) {
    seconds.innerHTML = `0${secondsCount}`;
  } else {
    seconds.innerHTML = secondsCount;
  }
  minutes.innerHTML = minuteCount;
}

// Game Over Modal
function restartGame(event) {
  const replayButton = event.target;
  const replayButtonOne = replayButton.className === 'fa fa-repeat';
  const replayButtonTwo = replayButton.className === 'modal-replay-btn';
  if (replayButtonOne || replayButtonTwo) {
    resetGame();
  }
}

function closeModal(event) {
  const closeButton = event.target;
  if (closeButton.className === 'modal-close-btn') {
    dismissModal();
  }
}

function dismissModal() {
  select('.modal-container').style.display = 'none';
}

// Reset/Restart Game
function resetGame() {
  if (isGameOver) {
    dismissModal();
  }
  resetCardState();
  shuffleAndAppendCardList();
  resetStars();
  resetTime();
  resetMoves();
  isGameOver = false;
  matchedCards = 0;
}

function resetMoves() {
  clicks = 0;
  moves = 0;
  displayMoves.innerHTML = ` ${moves}`;
}

function resetTime() {
  clearInterval(timeCount);
  secondsCount = 0;
  minuteCount = 0;
  seconds.innerHTML = `0${secondsCount}`;
  minutes.innerHTML = minuteCount;
  isTimeStarted = false;
}

function resetStars() {
  starsEarned = 3;
  starRating.forEach(star => {
    star.firstElementChild.style.visibility = 'initial';
  });
}

function resetCardState() {
  lockBoard = false;
  openedCards = [];
  cardHolder.forEach(card => {
    card.parentElement.classList = 'card';
  });
}
