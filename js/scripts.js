

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
  doubleDownBet: 0,
  maxBetAvailable: 500
}

function updateUI(){
  document.getElementById('instructions').textContent = state.instructions;
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
  if (playerObj[0].total == 21){
    playerObj[0].result = "Pending";
    state.instructions = "You better stay...";
  } else if ( playerObj[0].total > 21){
    playerObj[0].result = "Lose!";
    state.wallet -= playerObj[0].betValue;
    updateHand(playerObj[0]);
    finishedHands.push(playerObj.shift());
    checkGameOver();
  } else {
    state.instructions = "Hit or Stay";
    updateHand(playerObj[0]);
  }
  updateUI();
}

function bet(){
  if (!playerObj[0].betValue){
    playerObj[0].betValue = parseInt(document.getElementById('betInput').value, 10);
    if (playerObj[0].betValue <= state.wallet && playerObj[0].betValue > 0){
      state.maxBetAvailable = state.wallet - playerObj[0].betValue;
      state.instructions = "Hit, Stay, or Double Down";
      deal();
    } else {
      state.instructions = 'Enter a valid input please!';
      playerObj[0].betValue = '';
    }
    updateUI();
  }
}

function createDecks(){
  var ranks = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'jack', 'queen', 'king', 'ace'];
  var suits = ['clubs', 'diamonds', 'hearts', 'spades'];
  var decks = [];
  
  for (var i = 1; i <= 1; i++){
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
  playerObj[0].hand.push(decks.pop());
  playerObj[0].hand.push(decks.pop());
  updateHand(playerObj[0]);
  dealerObj[0].hand.push(decks.pop());
  updateHand(dealerObj[0]);
  total(playerObj[0]);
  didBust();
}

function updateHand(handObj){
  //Testing if its the users hand. If it's dealers hand there is no need because dealer doesn't have a "betvalue"
  if (handObj.betValue){
    document.getElementById(handObj.id).innerHTML = `<div><span id="${handObj.betAmountId}">Bet: $${handObj.betValue} </span><span id="${handObj.handTotalId}">Total: ${handObj.total}</span></div>`;
  } else {
    document.getElementById(handObj.id).innerHTML = `<div><span id="${handObj.handTotalId}">Total: ${handObj.total}</span></div>`;
  }
  handObj.hand.forEach(function(element, index, array){
    document.getElementById(handObj.id).innerHTML += `<img src="images/cardImages/PNG-cards-1.3/${array[index].img}" height="150" width="100">`;
  });
  //Just testing if this is the Users hand. If it's the dealers hand, there is no "Result".
  if (handObj.betValue){
    document.getElementById(handObj.id).innerHTML += `<span id="${handObj.resultId}">Result: ${handObj.result}</span>`;
  }
  var numOfPixels = handObj.hand.length * 100;
  document.getElementById(handObj.id).style.width = numOfPixels + 'px';
}

function hit(){
  if (playerObj.length > 0 && playerObj[0].betValue && playerObj[0].total <= 21 && dealerObj[0].hand.length == 1){
    console.log("Got through if 1");
    playerObj[0].hand.push(decks.pop());
    total(playerObj[0]);
    updateHand(playerObj[0]);
    if(playerObj[0].total == 9 || playerObj[0].total == 10 || playerObj[0].total == 11){
      state.instructions = "Hit, Stay, or Double Down!";
    }
    updateHand(playerObj[0]);
    didBust();
    updateUI();
  }
  
}

function stay(){
  if (playerObj[0].betValue && playerObj[0].total <= 21){
    //remove first element of array, put it into finished array.
    total(playerObj[0]);
    updateHand(playerObj[0]);
    finishedHands.push(playerObj.shift());
  }
  if (playerObj.length == 0){
    total(dealerObj[0]);
    while (dealerObj[0].total < 17){
      dealerObj[0].hand.push(decks.pop());
      total(dealerObj[0]);
      updateHand(dealerObj[0]);
    }
    whoWins();
  }
}

function doubleDown(){
  if(playerObj[0].betValue && !state.doubleDownBet){
    if ( (playerObj[0].total == 9 || playerObj[0].total == 10 || playerObj[0].total == 11) || playerObj[0].hand.length == 2){
      state.doubleDownBet = parseInt(document.getElementById('betInput').value, 10);
      if (state.doubleDownBet <= state.maxBetAvailable && state.doubleDownBet > 0 && state.doubleDownBet <= playerObj[0].betValue){
        playerObj[0].betValue = playerObj[0].betValue + state.doubleDownBet;
        state.maxBetAvailable = state.maxBetAvailable - state.doubleDownBet;
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
  if (playerObj[0].betValue && state.maxBetAvailable >= playerObj[0].betValue){
    var objId = "playerHand" + splitCounter;
    var betId = "betAmount" + splitCounter;
    var handId = "handTotal" + splitCounter;
    var resultId = "result" + splitCounter;
    var newObj = {id: objId, total: 0, betAmountId: betId, handTotalId: handId, resultId: resultId, result: 'Pending', betValue: playerObj[0].betValue, hand: []};
    state.maxBetAvailable = state.maxBetAvailable - playerObj[0].betValue;
    newObj.hand.push(playerObj[0].hand.shift());
    var newElem = document.createElement('div');
    var currentDiv = document.getElementById(playerObj[0].id);
    newElem.setAttribute("class", "playersHands");
    newElem.setAttribute("id", objId);
    //newElem.innerHTML += `<div><span id="betAmount${splitCounter}">Bet: $ </span><span id="handTotal${splitCounter}">Total: </span></div>`;
    //newElem.innerHTML += `<img src="images/cardImages/PNG-cards-1.3/${newObj.hand[newObj.hand.length - 1].img}" height="150" width="100">`;
    document.getElementById('hands').insertBefore(newElem, currentDiv);
    //currentDiv.innerHTML = `<div><span id="betAmount${splitCounter - 1}">Bet: $ </span><span id="handTotal${splitCounter - 1}">Total: </span></div>`;
    //updateHand(playerObj[0]);
    hit();
    //document.getElementById("betAmount" + splitCounter).textContent = "Bet: $" + newObj.betValue;
    playerObj.unshift(newObj);
    hit();
    updateHand(playerObj[0]);
    updateHand(playerObj[1]);
    splitCounter++;
  }
}

function whoWins(){

  for (var i in finishedHands){
    if(dealerObj[0].total > finishedHands[i].total && dealerObj[0].total <= 21){
      finishedHands[i].result = "Lose!";
      state.wallet -= finishedHands[i].betValue;
      checkGameOver();
    } else if (dealerObj[0].total == finishedHands[i].total){
      finishedHands[i].result = "Tie!";
    } else if (finishedHands[i].total <= 21) {
      finishedHands[i].result = "Win!";
      state.wallet += finishedHands[i].betValue;
    }
    updateHand(finishedHands[i]);
  state.instructions = "Press New Round to Play Again";
  updateUI();

  }



/*
  if(dealerObj[0].total > playerObj[0].total && dealerObj[0].total <= 21){
    playerObj[0].result = "You Lose!";
    state.wallet -= playerObj[0].betValue;
    checkGameOver();
  } else if (dealerObj[0].total == playerObj[0].total){
    playerObj[0].result = "Tie!";
  } else {
    playerObj[0].result = "You Win!";
    state.wallet += playerObj[0].betValue;
  }
  state.instructions = "Press New Round to Play Again";
  updateUI();*/
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
  playerObj = [{
    id: 'playerHand0',
    total: 0,
    betAmountId: "betAmount0",
    handTotalId: "handTotal0",
    resultId: 'result0',
    result: 'Pending',
    betValue: 0,
    hand: []
  }];
  playerObj[0].hand = [];
  playerObj[0].total = 0;
  dealerObj[0].hand = [];
  dealerObj[0].total = 0;
  playerObj[0].betValue = '';
  state.doubleDownBet = '';
  playerObj[0].result = 'Pending';
  finishedHands = [];
  state.instructions = 'Place a Bet!';
  document.getElementById('dealerHand').innerHTML = '';
  document.getElementById('dealerHand').style.width = '100px';
  document.getElementById('playerHand').innerHTML = '';
  document.getElementById('playerHand').style.width = '200px';
  updateUI();
}

//{id: objId, total: 0, betAmountId: betId, handTotalId: handId, betValue: state.betValue, hand: []};

var decks = createDecks();
var decks = shuffleDeck(decks);
var splitCounter = 1;
var finishedHands = [];
var playerObj = [{
  id: 'playerHand0',
  total: 0,
  betAmountId: "betAmount0",
  handTotalId: "handTotal0",
  resultId: 'result0',
  result: 'Pending',
  betValue: 0,
  hand: []
}];
var dealerObj = [{
  id: 'dealerHand',
  total: 0,
  hand: []
}];