

document.getElementById('betBtn').addEventListener('click', bet, false);
document.getElementById('hit').addEventListener('click', hit, false);
document.getElementById('stay').addEventListener('click', stay, false);
document.getElementById('doubleDown').addEventListener('click', doubleDown, false);
document.getElementById('split').addEventListener('click', splitHand, false);
document.getElementById('newRound').addEventListener('click', resetGame, false);
var instructions = document.getElementById('instructions');

//instructions is the value to be put into the instructions div
// wallet is the users current amount he has to play with
// doubleDownBet is a second variable to store the amount the user would like to add to the bet if they can "double down"
//maxBetAvailable is used to prevent the user from doubling down, or splitting when they don't have enough money to perform the split
//roundOver is used to make sure the entire round is over. When the user "splits" the hand into multiple hands,
//roundOver makes sure that all the hands have been played and finished before determining the end result of the round.
var state = {
  instructions: '',
  wallet: 500,
  doubleDownBet: 0, //Not sure if this is a good way
  maxBetAvailable: 500,
  roundOver: false
}

//Creating and shuffling the deck.
var decks = createDecks();
var decks = shuffleDeck(decks);

//splitCounter counts how many different hands the user has in the current round.
var splitCounter = 1;

//When a hand gets completed, it is set aside in the finishedHands so it can be processed at the end.
var finishedHands = [];

//This is the initial object.
//id: is for a div id. Each hand has it's own div.
// each hand has a card "total", betValue, result, array of cards, and dynamically created ID's so the values can be used in the HTML
// background is used to make sure the user knows which hand they are working with, since you only hit/stay on one hand at a time.
// and we might have multiple hands in one round.
var playerObj = [{
  id: 'playerHand0',
  total: 0,
  betAmountId: "betAmount0",
  handTotalId: "handTotal0",
  resultId: 'result0',
  result: 'Pending',
  betValue: 0,
  hand: [],
  backGround: '#d3d3d3' //starts out as gray-ish, Active div is blue if there is more than one hand
}];

// dealerObj just has only a couple properties because they only ever have one hand.
var dealerObj = [{
  id: 'dealerHand',
  total: 0,
  hand: []
}];

//create either one deck, or multiple decks using nested loops
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

//Updates the "instructions" id, and the current users total Wallet.
function updateUI(){
  document.getElementById('instructions').textContent = state.instructions;
  document.getElementById('wallet').textContent = `Wallet: $${state.wallet}`;
}

//tests if the player has already bet. If not, set the betValue, validate it, reduce the maxBetAvailable,
//then give user instructions. User can always double down immediately after bet.
//If user entered bad input, tell them to enter valid input, then reset betValue to ''.
//updateUI so instructions are up to date.
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

//deal gives the player the first two cards, dealer one card, then updating all information, like the total for the dealer, player.
//Should NOT need didBust because the user CANNOT BUST on a deal.
function deal(){
  playerObj[0].hand.push(decks.pop());
  playerObj[0].hand.push(decks.pop());
  dealerObj[0].hand.push(decks.pop());
  total(playerObj[0]);
  updateHand(playerObj[0]);
  updateHand(dealerObj[0]);
}

//validates the user still has a hand to play, the user has placed a bet, and the total is <= 21, and that the
//user has not already stayed. If the last check wasn't there, the user could hit even after staying.
function hit(){
  if (playerObj.length > 0 && playerObj[0].betValue && playerObj[0].total <= 21 && dealerObj[0].hand.length == 1){
    playerObj[0].hand.push(decks.pop());
    total(playerObj[0]);
    if(playerObj[0].total == 9 || playerObj[0].total == 10 || playerObj[0].total == 11){
      state.instructions = "Hit, Stay, or Double Down!";
    }
    updateHand(playerObj[0]); //Need this while the didBust pushed the object to the finished array (if the hand busts)
    didBust();
    updateUI();
  } 
}

//on click of the stay button, this function is run.
function stay(){
  //validates there are still hands for the user, the betvalue exists, and the player hasn't already busted.
  //if conditions are met, calculate total, Make sure BGcolor is gray, update the hand,
  //and push the now finished hand into the finishedHands array.
  if (playerObj.length > 0 && playerObj[0].betValue && playerObj[0].total <= 21){
    //remove first element of array, put it into finished array.
    total(playerObj[0]); //Should not need this. Isn't the total already updated?
    finishCurrentHand();
    //If there is still another hand to be played, change That background color to blue, making it the "active" hand.
    //Need to update the hand so the color changes.
    if (playerObj[0]){
      playerObj[0].backGround = '#08FFFF';
      updateHand(playerObj[0]);
    }
  }
  //validates there are no more hands to be played
  //totals the dealers hand, and give the dealer cards while the total is less than 17.
  // total the dealer object one more time, update the hand to be current, then determine which hands the user won and lost.
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

//calculates the total of the hand passed in and updates the parameters "total" as a side effect instead of returning.
// takes into consideration the 11 or 1 value of an Ace.
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

function finishCurrentHand(){
  playerObj[0].backGround = '#d3d3d3';
  updateHand(playerObj[0]);
  finishedHands.push(playerObj.shift());
}

//checks if the user busted.
// if the user busts, it turns the result of that hand to "Lose!", and changes the background color gray
// updates the hand display, and puts the current hand into the "finishedHand" object so the next hand can be processed.
//I'm asuming this function does way too much stuff?
function didBust(){
  if ( playerObj[0].total > 21 ){
    playerObj[0].result = "Lose!";
    finishCurrentHand();
    whoWins();
    checkGameOver();
    if (playerObj[0]){
      playerObj[0].backGround = '#08FFFF';
      updateHand(playerObj[0]);
    }
  }
  updateUI();
}

//updates all the display information for both the dealer and player. A hand is passed in and changes the innerHTML
// to provide the user a current betValue, total of the hand, and update the background colors so the user can know
//what hand they are working on at that point in time.
function updateHand(handObj){
  //Testing if its the users hand. If it's dealers hand there is no need because dealer doesn't have a "betvalue"
  //the dealer also only has one possible background color, so there is no need to mess with the color
  if (handObj.betValue){
    document.getElementById(handObj.id).innerHTML = `<div><span id="${handObj.betAmountId}">Bet: $${handObj.betValue} </span><span id="${handObj.handTotalId}">Total: ${handObj.total}</span></div>`;
    document.getElementById(handObj.id).style.backgroundColor = handObj.backGround;
  } else {
    //The dealer DOES have a total, so this should be updated if it's the dealer hand.
    document.getElementById(handObj.id).innerHTML = `<div><span id="${handObj.handTotalId}">Total: ${handObj.total}</span></div>`;
  }
  //each card in the hand should be displayed in the DIV. I want to figure out how to not re-do the cards every time.
  // and only need to put the card that is dealt into the div.
  handObj.hand.forEach(function(element, index, array){
    document.getElementById(handObj.id).innerHTML += `<img src="images/cardImages/PNG-cards-1.3/${array[index].img}" height="150" width="100">`;
  });
  //This code only applies to the users hand, since a dealer doesn't have or need a "result"
  if (handObj.betValue){
    document.getElementById(handObj.id).innerHTML += `<span id="${handObj.resultId}">Result: ${handObj.result}</span>`;
  }
  //Increase the size of the div to accomodate the new cards
  var numOfPixels = handObj.hand.length * 100;
  document.getElementById(handObj.id).style.width = numOfPixels + 'px';
}



//user can add to their bet, or "Double down" if the user only has two cards in that hand, OR the total of the hand is 9, 10, or 11.
//validates the user has a hand to play, that the user has placed a bet, and that the doubleDownBet has not happened already for this hand.
function doubleDown(){
  if(playerObj.length > 0 && playerObj[0].betValue && !state.doubleDownBet){
    if ( (playerObj[0].total == 9 || playerObj[0].total == 10 || playerObj[0].total == 11) || playerObj[0].hand.length == 2){
      state.doubleDownBet = parseInt(document.getElementById('betInput').value, 10);
      //validates the user has enough to guarantee the wallet doesn't dip below zero.
      //validates the user does not bet more than double his current bet.
      //updates the hands bet, updates maxBetAvailable.
      //gives the user ONE more card then totals and updates,
      //then forces the user to "stay" by removing the current hand from the playerObj array.
      //moves the hand to the finishedHands array.
      //updates background colors, changes doubleDownBet back to zero, to allow user to doubleDown on other hands
      if (state.doubleDownBet <= state.maxBetAvailable && state.doubleDownBet > 0 && state.doubleDownBet <= playerObj[0].betValue){
        playerObj[0].betValue = playerObj[0].betValue + state.doubleDownBet;
        state.maxBetAvailable = state.maxBetAvailable - state.doubleDownBet;
        playerObj[0].hand.push(decks.pop());
        total(playerObj[0]);
        finishCurrentHand();
        state.doubleDownBet = 0;
        // makes sure there is still a hand to change the background color of the current hand.
        //If there are no more hands, then stay so the dealer will get his cards so we can see the final results.
        if (playerObj[0]){
          playerObj[0].backGround = '#08FFFF';
          //stay();
          updateHand(playerObj[0]);
        } else {
          stay();
        }
      } else {
        state.instructions = 'Double down must be <= your first bet, and your total bet cannot exceed your wallet';
        doubleDownBet = 0;
      }
    }
    updateUI();
  }
}

//validates the user has a hand to split, has placed a bet, and the user has enough to bet to split the hand.
//creates several ids which are used in the HTML's divs and spans. This gives user information on each hand.
//creates the new hand object by splitting the current hand into two. Puts the new object on the beginning of the array
//makes the new object the currently active hand.
//adjusts the maximum bet allowed
//creates a new element for the new hand object and sets id and class.
//places the new element inside the hands div, as the FIRST element in the div.
//adds another card to the first object, then pushes the new object to the array, and adds a card to that object.
//In the end we have two separate hands, each with two cards.
//splitCounter is used to create the elements dynamically. playerHand0, playerHand1, playerHand2 etc...
function splitHand(){
  if (playerObj.length > 0 && playerObj[0].betValue && state.maxBetAvailable >= playerObj[0].betValue){
    var objId = "playerHand" + splitCounter;
    var betId = "betAmount" + splitCounter;
    var handId = "handTotal" + splitCounter;
    var resultId = "result" + splitCounter;
    var newObj = {id: objId, total: 0, betAmountId: betId, handTotalId: handId, resultId: resultId, result: 'Pending', betValue: playerObj[0].betValue, backGround: '#08FFFF', hand: []};
    state.maxBetAvailable = state.maxBetAvailable - playerObj[0].betValue;
    newObj.hand.push(playerObj[0].hand.shift());
    var newElem = document.createElement('div');
    var currentDiv = document.getElementById(playerObj[0].id);
    newElem.setAttribute("class", "playersHands");
    newElem.setAttribute("id", objId);
    
    document.getElementById('hands').insertBefore(newElem, currentDiv);
    hit();
    playerObj.unshift(newObj);
    hit();
    updateHand(playerObj[0]);
    playerObj[1].backGround = '#d3d3d3';
    updateHand(playerObj[1]);
    splitCounter++;
  }
}

//validates all the hands have been played and finished.
// loops through each of the users hands, and determines if the hand won or lost.
//updates the wallet to reflect all the wins and losses.
//checks if the user lost all their money.
function whoWins(){
  //I think the validation is wrong here. maybe?
  if (!state.roundOver){
    for (var i in finishedHands){
      if( (dealerObj[0].total > finishedHands[i].total && dealerObj[0].total <= 21) || finishedHands[i].total > 21){
        finishedHands[i].result = "Lose!";
        state.wallet -= finishedHands[i].betValue;
      } else if (dealerObj[0].total == finishedHands[i].total){
        finishedHands[i].result = "Tie!";
      } else if (finishedHands[i].total <= 21) {
        finishedHands[i].result = "Win!";
        state.wallet += finishedHands[i].betValue;
      }
      updateHand(finishedHands[i]);
      state.instructions = "Press New Round to Play Again";
      //Don't know what i'm doing here with the state.roundOver = true.
      state.roundOver = true;
      checkGameOver();
      updateUI();
    }
  }
}

//If wallet is empty, it's game over.
function checkGameOver(){
  if (state.wallet == 0){
    console.log("Hi!!!");
    state.instructions = "";
    document.getElementById('top').innerHTML = "<h1>The Casino took all of your money. Have a nice day!</h1>";
  } else {
    state.instructions = "Press New Round to Play Again";
  }
  //updateUI();
}

//New round. 
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
  state.roundOver = false;
  dealerObj[0].hand = [];
  dealerObj[0].total = 0;
  state.doubleDownBet = '';

  //remove all elements except the first hand.
  for (var i in finishedHands){
    if(i != finishedHands.length - 1){
      document.getElementById('hands').removeChild(document.getElementById(finishedHands[i].id));
    }
  }

  finishedHands = [];
  state.instructions = 'Place a Bet!';
  document.getElementById('dealerHand').innerHTML = '';
  document.getElementById('dealerHand').style.width = '100px';
  document.getElementById('playerHand0').innerHTML = '';
  document.getElementById('playerHand0').style.width = '200px';
  updateUI();
}

