

document.getElementById('betBtn').addEventListener('click', bet, false);
document.getElementById('hit').addEventListener('click', hit, false);
document.getElementById('stay').addEventListener('click', stay, false);
document.getElementById('doubleDown').addEventListener('click', doubleDown, false);
document.getElementById('split').addEventListener('click', splitHand, false);
document.getElementById('newRound').addEventListener('click', resetGame, false);
var instructions = document.getElementById('instructions');

var state = {
  instructions: '',
  wallet: 500,
  betValue: 0,
  doubleDownBet: 0,
  result: 'Result: '
}

function updateUI(){
  document.getElementById('instructions').textContent = state.instructions;
  document.getElementById('betAmount').textContent = 'Bet: $' + state.betValue;
  document.getElementById('handTotal').textContent = `Total: ${playerObj.total}`;
  document.getElementById('result').textContent = `${state.result}`;
  document.getElementById('wallet').textContent = `Wallet: $${state.wallet}`;
}

function total(obj){
  var total = 0;
  var aceCount = 0;
  for (var i = 0; i < obj.hand.length; i++){
    if (obj.hand[i].rank == 'ace'){
      aceCount += 1;
      total += 11;
    } else if (typeof obj.hand[i].rank == 'number'){
      total += obj.hand[i].rank;
    } else {
      total += 10;
    }
  }
  while (aceCount > 0 && total > 21){
    total -= 10;
    aceCount = aceCount - 1;
  }
  obj.total = total;
}

function didBust(){
  if (playerObj.total == 21){
    state.result = "Result: BlackJack!";
    state.instructions = "You better stay...";
  } else if ( playerObj.total > 21){
    state.result = "Result: Bust!";
    state.wallet -= state.betValue;
    checkGameOver();
  } else {
    state.instructions = "Hit or Stay";
  }
  updateUI();
}

function bet(){
  if (!state.betValue){
    state.betValue = parseInt(document.getElementById('betInput').value, 10);
    if (state.betValue <= state.wallet && state.betValue > 0){
      state.instructions = "Hit, Stay, or Double Down";
      deal();
    } else {
      state.instructions = 'Enter a valid input please!';
      state.betValue = '';
    }
    updateUI();
  }
}

function createDecks(){
  var ranks = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'jack', 'queen', 'king', 'ace'];
  var suits = ['clubs', 'diamonds', 'hearts', 'spades'];
  var decks = [];
  
  for (var i = 1; i <= 2; i++){
    for (suitIndex in suits){
      for (rankIndex in ranks){
        decks.push({
          img: `${ranks[rankIndex]}_of_${suits[suitIndex]}.png`,
          rank: ranks[rankIndex],
          suit: suits[suitIndex]
        });
      }
    }
  }
  return decks;
}

/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 */
function shuffleDeck(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function deal(){
  playerObj.hand.push(decks.pop());
  updateHand(playerObj);
  playerObj.hand.push(decks.pop());
  updateHand(playerObj);
  dealerObj.hand.push(decks.pop());
  updateHand(dealerObj);
  total(playerObj);
  didBust();
}

function updateHand(handObj){
  var numOfPixels = handObj.hand.length * 100;
  document.getElementById(handObj.id).style.width = numOfPixels + 'px';
  document.getElementById(handObj.id).innerHTML += `<img src="images/cardImages/PNG-cards-1.3/${handObj.hand[handObj.hand.length - 1].img}" height="150" width="100">`;
}

function hit(){
  if (state.betValue && playerObj.total <= 21 && dealerObj.hand.length == 1){
    playerObj.hand.push(decks.pop());
    updateHand(playerObj);
    total(playerObj);
    didBust();
    if(playerObj.total == 9 || playerObj.total == 10 || playerObj.total == 11){
      state.instructions = "Hit, Stay, or Double Down!";
    }
  }
  updateUI();
}

function stay(){
  if (state.betValue && playerObj.total <= 21){
    total(dealerObj);
    while (dealerObj.total < 17){
      dealerObj.hand.push(decks.pop());
      updateHand(dealerObj);
      total(dealerObj);
    }
    whoWins();
  } 
}

function doubleDown(){
  if(state.betValue && !state.doubleDownBet){
    if ( (playerObj.total == 9 || playerObj.total == 10 || playerObj.total == 11) || playerObj.hand.length == 2){
      state.doubleDownBet = parseInt(document.getElementById('betInput').value, 10);
      if (state.betValue + state.doubleDownBet <= state.wallet && state.doubleDownBet > 0 && state.doubleDownBet <= state.betValue){
        state.betValue = state.betValue + state.doubleDownBet;
        hit();
        stay();
      } else {
        state.instructions = 'Double down must be <= your first bet, and your total bet cannot exceed your wallet';
        doubleDownBet = 0;
      }
    }
    updateUI();
  }
}

function splitHand(){
  if (state.betValue){
    var newHand = [];
    newHand.push(playerObj.hand.shift());
    var newElem = document.createElement('div');
    var currentDiv = document.getElementById('playerHand');
    newElem.setAttribute("class", "playersHands");
    newElem.innerHTML += `<img src="images/cardImages/PNG-cards-1.3/${newHand[newHand.length - 1].img}" height="150" width="100">`;
    document.getElementById('hands').insertBefore(newElem, currentDiv);
    currentDiv.innerHTML = '';
    updateHand(playerObj);
  }
}

function whoWins(){
  if(dealerObj.total > playerObj.total && dealerObj.total <= 21){
    state.result = "Result: You Lose!";
    state.wallet -= state.betValue;
    checkGameOver();
  } else if (dealerObj.total == playerObj.total){
    state.result = "Result: Tie!";
  } else {
    state.result = "Result: You Win!";
    state.wallet += state.betValue;
  }
  state.instructions = "Press New Round to Play Again";
  updateUI();
}

function checkGameOver(){
  if (state.wallet == 0){
    state.instructions = "";
    document.getElementById('top').innerHTML = "<h1>The Casino took all of your money. Have a nice day!</h1>";
  } else {
    state.instructions = "Press New Round to Play Again";
  }
  updateUI();
}

function resetGame(){
  playerObj.hand = [];
  playerObj.total = 0;
  dealerObj.hand = [];
  dealerObj.total = 0;
  state.betValue = '';
  state.doubleDownBet = '';
  state.result = 'Result: ';
  state.instructions = 'Place a Bet!';
  document.getElementById('dealerHand').innerHTML = '';
  document.getElementById('dealerHand').style.width = '100px';
  document.getElementById('playerHand').innerHTML = '';
  document.getElementById('playerHand').style.width = '200px';
  updateUI();
}

var decks = createDecks();
var decks = shuffleDeck(decks);
var playerObj = {
  id: 'playerHand',
  total: 0,
  hand: []
}
var dealerObj = {
  id: 'dealerHand',
  total: 0,
  hand: []
}