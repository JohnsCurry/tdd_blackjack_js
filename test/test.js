var expect = chai.expect;
var should = chai.should();
//var assert = require('chai').assert;

/*describe('Compare Numbers', function(){
  it('1 should equal 1', function(){
    expect(1).to.equal(1);
  });

  it('2 should be greater than 1', function(){
    expect(2).to.be.greaterThan(1);
  });
});

describe('Is Even Tests', function(){
  it('Should always return a boolean', function(){
    expect(isEven(2)).to.be.a('boolean');
  });

  it('Calling isEven(76) should return true', function(){
    expect(isEven(76)).to.be.true;
  });

  it('calling isEven(77) should return false.', function(){
    expect(isEven(77)).to.be.false;
  });
}); */


describe('createDecks', function(){
  it('createDecks should always return an array', function(){
    expect(createDecks()).to.be.a('array');
  });

  it('createDecks should return an arry with length of 104', function(){
    expect(createDecks()).to.have.length(104);
  });

});

describe('decks array tests', function(){
  // This worked before, and all of the sudden it stopped working, even though it still is working.
  it('Decks should have deep property img', function(){
    expect(decks).to.have.deep.property('[0].img');
  });

  it('Decks should have deep property suit', function(){
    expect(decks).to.have.deep.property('[0].suit');
  });

  it('Decks should have deep property rank', function(){
    expect(decks).to.have.deep.property('[0].rank');
  });
});


describe('deal function', function(){
  //Do I have to test the function or is there a way I can test the value of playerHand directly?
  //How do I get this to work?
  it('playerHand should have array length of 2', function(){
    var playerHand = [];
    var dealerHand = [];
    deal();

    expect(playerHand).to.have.length(2);
  })
});

describe('place bet', function(){
  var wallet = 500;

  it('should request valid input if bet is greater than wallet', function(){

  });

  it('should request valid input if bet is not 100% a number', function(){

  });

  it('should request valid input if bet is less than or equal to 0', function(){

  });
});


//How to test the image property, make sure image is setup correctly?

//expect(people).to.be.an('array').with.length(1);
//expect(people).to.have.deep.property('[0].name', 'Alice');