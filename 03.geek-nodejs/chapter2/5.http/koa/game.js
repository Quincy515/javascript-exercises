module.exports = function (playerAction) {
  if (['rock', 'scissor', 'paper'].indexOf(playerAction) == -1) {
    throw new Error('invalid playerAction');
  }

  var random = Math.random() * 3;
  var computerAction;
  if (random < 1) {
    computerAction = 'rock';
  } else if (random > 2) {
    computerAction = 'scissor';
  } else {
    computerAction = 'paper';
  }

  if (computerAction == playerAction) {
    return 0;
  } else if (
    (computerAction == 'rock' && playerAction == 'scissor') ||
    (computerAction == 'scissor' && playerAction == 'paper') ||
    (computerAction == 'paper' && playerAction == 'rock')
  ) {
    return 1;
  } else {
    return -1;
  }
}