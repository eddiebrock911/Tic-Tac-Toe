// Mode switching
const friendModeBtn = document.getElementById('friendModeBtn');
const aiModeBtn = document.getElementById('aiModeBtn');
const friendMode = document.getElementById('friendMode');
const aiMode = document.getElementById('aiMode');

/* ===== Typing animation (hero) ===== */
    (function typingAnim() {
      const texts = ["Tic Tac Toe", "Creator By Ankit", "Enjoy the Game!"];
      let i = 0, j = 0, isDeleting = false;
      const el = document.querySelector('.typing');

      function type() {
        const full = texts[i];
        if (!isDeleting) {
          el.textContent = full.substring(0, j + 1);
          j++;
          if (j === full.length) {
            isDeleting = true;
            setTimeout(type, 1200);
            return;
          }
        } else {
          el.textContent = full.substring(0, j - 1);
          j--;
          if (j === 0) {
            isDeleting = false;
            i = (i + 1) % texts.length;
          }
        }
        setTimeout(type, isDeleting ? 80 : 140);
      }
      type();
    })();



friendModeBtn.addEventListener('click', () => {
  friendModeBtn.classList.add('active');
  aiModeBtn.classList.remove('active');
  friendMode.classList.add('active');
  aiMode.classList.remove('active');
});

aiModeBtn.addEventListener('click', () => {
  aiModeBtn.classList.add('active');
  friendModeBtn.classList.remove('active');
  aiMode.classList.add('active');
  friendMode.classList.remove('active');
});

// --- Friends Mode Logic ---
const cellsFriend = document.querySelectorAll('#boardFriend .cell');
const statusFriend = document.getElementById('statusFriend');
const resetBtnFriend = document.getElementById('resetBtnFriend');
const scoreXFriend = document.getElementById('scoreXFriend');
const scoreOFriend = document.getElementById('scoreOFriend');
const scoreTieFriend = document.getElementById('scoreTieFriend');

let boardFriendState = Array(9).fill('');
let currentPlayerFriend = 'X';
let gameActiveFriend = true;
let scoresFriend = { X: 0, O: 0, tie: 0 };

const winPatterns = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function handleCellClickFriend(e) {
  const cell = e.target;
  const index = cell.dataset.index;
  if (boardFriendState[index] !== '' || !gameActiveFriend) return;

  boardFriendState[index] = currentPlayerFriend;
  cell.textContent = currentPlayerFriend;
  cell.classList.add('taken', currentPlayerFriend.toLowerCase());

  if (checkWin(boardFriendState)) {
    highlightWinner(cellsFriend, boardFriendState);
    statusFriend.textContent = `Player ${currentPlayerFriend} Wins! 🎉`;
    scoresFriend[currentPlayerFriend]++;
    updateScoreDisplayFriend();
    gameActiveFriend = false;
  } else if (boardFriendState.every(c => c !== '')) {
    statusFriend.textContent = "It's a Tie! 🤝";
    scoresFriend.tie++;
    updateScoreDisplayFriend();
    gameActiveFriend = false;
  } else {
    currentPlayerFriend = currentPlayerFriend === 'X' ? 'O' : 'X';
    statusFriend.textContent = `Player ${currentPlayerFriend}'s Turn`;
  }
}

function updateScoreDisplayFriend() {
  scoreXFriend.textContent = scoresFriend.X;
  scoreOFriend.textContent = scoresFriend.O;
  scoreTieFriend.textContent = scoresFriend.tie;
}

function resetGameFriend() {
  boardFriendState.fill('');
  currentPlayerFriend = 'X';
  gameActiveFriend = true;
  statusFriend.textContent = `Player ${currentPlayerFriend}'s Turn`;
  cellsFriend.forEach(c => c.textContent = '');
  cellsFriend.forEach(c => c.classList.remove('taken','x','o','winner'));
}

cellsFriend.forEach(c => c.addEventListener('click', handleCellClickFriend));
resetBtnFriend.addEventListener('click', resetGameFriend);

// --- AI Mode Logic ---
const cellsAI = document.querySelectorAll('#boardAI .cell');
const statusAI = document.getElementById('statusAI');
const resetBtnAI = document.getElementById('resetBtnAI');
const scoreXAI = document.getElementById('scoreXAI');
const scoreOAI = document.getElementById('scoreOAI');
const scoreTieAI = document.getElementById('scoreTieAI');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');

let boardAIState = Array(9).fill('');
let gameActiveAI = true;
let scoresAI = { X: 0, O: 0, tie: 0 };
let difficulty = 'easy';

difficultyBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    difficultyBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    difficulty = btn.dataset.difficulty;
    resetGameAI();
  });
});

function handleCellClickAI(e) {
  const cell = e.target;
  const index = cell.dataset.index;
  if (boardAIState[index] !== '' || !gameActiveAI) return;

  makeMove(index, 'X', cellsAI, boardAIState);

  if (checkWin(boardAIState)) {
    highlightWinner(cellsAI, boardAIState);
    statusAI.textContent = "You Win! 🎉";
    scoresAI.X++;
    updateScoreDisplayAI();
    gameActiveAI = false;
    return;
  }

  if (boardAIState.every(c => c !== '')) {
    statusAI.textContent = "It's a Tie! 🤝";
    scoresAI.tie++;
    updateScoreDisplayAI();
    gameActiveAI = false;
    return;
  }

  statusAI.textContent = "AI is thinking...";
  setTimeout(() => {
    const aiMove = getAIMove();
    makeMove(aiMove, 'O', cellsAI, boardAIState);

    if (checkWin(boardAIState)) {
      highlightWinner(cellsAI, boardAIState);
      statusAI.textContent = "AI Wins! 🤖";
      scoresAI.O++;
      updateScoreDisplayAI();
      gameActiveAI = false;
    } else if (boardAIState.every(c => c !== '')) {
      statusAI.textContent = "It's a Tie! 🤝";
      scoresAI.tie++;
      updateScoreDisplayAI();
      gameActiveAI = false;
    } else {
      statusAI.textContent = "Your Turn (X)";
    }
  }, 500);
}

function makeMove(index, player, cells, board) {
  board[index] = player;
  cells[index].textContent = player;
  cells[index].classList.add('taken', player.toLowerCase());
}

function getAIMove() {
  if (difficulty === 'easy') return getRandomMove();
  if (difficulty === 'medium') return Math.random() < 0.5 ? getBestMove() : getRandomMove();
  return getBestMove();
}

function getRandomMove() {
  const available = boardAIState.map((c,i)=>c===''?i:null).filter(i=>i!==null);
  return available[Math.floor(Math.random()*available.length)];
}

function getBestMove() {
  for (let i=0;i<9;i++){
    if (boardAIState[i]===''){
      boardAIState[i]='O';
      if(checkWin(boardAIState)){boardAIState[i]='';return i;}
      boardAIState[i]='';
    }
  }
  for (let i=0;i<9;i++){
    if (boardAIState[i]===''){
      boardAIState[i]='X';
      if(checkWin(boardAIState)){boardAIState[i]='';return i;}
      boardAIState[i]='';
    }
  }
  if (boardAIState[4]==='') return 4;
  const corners=[0,2,6,8].filter(i=>boardAIState[i]==='');
  if(corners.length>0) return corners[Math.floor(Math.random()*corners.length)];
  return getRandomMove();
}

function updateScoreDisplayAI(){
  scoreXAI.textContent=scoresAI.X;
  scoreOAI.textContent=scoresAI.O;
  scoreTieAI.textContent=scoresAI.tie;
}

function resetGameAI(){
  boardAIState.fill('');
  gameActiveAI=true;
  statusAI.textContent="Your Turn (X)";
  cellsAI.forEach(c=>{c.textContent='';c.classList.remove('taken','x','o','winner');});
}

cellsAI.forEach(c=>c.addEventListener('click',handleCellClickAI));
resetBtnAI.addEventListener('click',resetGameAI);

// --- Shared Functions ---
function checkWin(board){
  return winPatterns.some(p=>{
    const[a,b,c]=p;
    return board[a] && board[a]===board[b] && board[a]===board[c];
  });
}

function highlightWinner(cells,board){
  winPatterns.forEach(p=>{
    const[a,b,c]=p;
    if(board[a] && board[a]===board[b] && board[a]===board[c]){
      cells[a].classList.add('winner');
      cells[b].classList.add('winner');
      cells[c].classList.add('winner');
    }
  });
}

// Back button functionality
    document.getElementById('back').addEventListener('click', function() {
      console.log('Back button clicked');
      window.location.href = 'https://ankitai.onrender.com/';
    });