//var candies = ["Blue", "Pink", "Green", "Yellow", "Red", "Purple"];
var candies = ["Yellow", "Red", "Purple"];
var board = [];
var rows = 10;
var columns = 10;
var score = 0;

var currTile;
var otherTile;


window.onload = function() {
  startGame();

  //1/10th of a second
  window.setInterval(function(){
    crushCandy();
    slideCandy();
    generateCandy();
  }, 100);
}

function randomCandy() {
  return candies[Math.floor(Math.random() * candies.length)]; //0 - 5.99
}

function startGame() {
  for (let r = 0; r < rows; r++) {
    let row = [];
    for (let c = 0; c < columns; c++) {
      // <img id="0-0" src="./images/Red.png">
      let tile = document.createElement("img");
      tile.id = r.toString() + "-" + c.toString();
      tile.src = "./static/images/" + randomCandy() + ".png";

      //DRAG FUNCTIONALITY
      tile.addEventListener("dragstart", dragStart); //click on a candy, initialize drag process
      tile.addEventListener("dragover", dragOver);  //clicking on candy, moving mouse to drag the candy
      tile.addEventListener("dragenter", dragEnter); //dragging candy onto another candy
      tile.addEventListener("dragleave", dragLeave); //leave candy over another candy
      tile.addEventListener("drop", dragDrop); //dropping a candy over another candy
      tile.addEventListener("dragend", dragEnd); //after drag process completed, we swap candies

      document.getElementById("board").append(tile);
      row.push(tile);
    }
    board.push(row);
  }

  console.log(board);
}

function dragStart() {
  //this refers to tile that was clicked on for dragging
  currTile = this;
}

function dragOver(e) {
  e.preventDefault();
}

function dragEnter(e) {
  e.preventDefault();
}

function dragLeave() {

}

function dragDrop() {
  //this refers to the target tile that was dropped on
  otherTile = this;
}

function dragEnd() {

  if (currTile.src.includes("blank") || otherTile.src.includes("blank")) {
    return;
  }

  let currCoords = currTile.id.split("-"); // id="0-0" -> ["0", "0"]
  let r = parseInt(currCoords[0]);
  let c = parseInt(currCoords[1]);

  let otherCoords = otherTile.id.split("-");
  let r2 = parseInt(otherCoords[0]);
  let c2 = parseInt(otherCoords[1]);

  let moveLeft = c2 == c-1 && r == r2;
  let moveRight = c2 == c+1 && r == r2;

  let moveUp = r2 == r-1 && c == c2;
  let moveDown = r2 == r+1 && c == c2;

  let isAdjacent = moveLeft || moveRight || moveUp || moveDown;

  if (isAdjacent) {
    let currImg = currTile.src;
    let otherImg = otherTile.src;
    currTile.src = otherImg;
    otherTile.src = currImg;

    let validMove = checkValid();
    if (!validMove) {
      let currImg = currTile.src;
      let otherImg = otherTile.src;
      currTile.src = otherImg;
      otherTile.src = currImg;    
    } else {
      //console.log(r2.toString() + " " + c2.toString());
      //console.log(checkFiveSpecial(r2,c2,otherTile));
      //
      //check for for direct swipes (swipe red to complete red string)
      console.log(checkFiveSpecial(r2,c2,otherTile));
      //check for indirect swipes (swipe ohter color to move red to complete red string)
      console.log(checkFiveSpecial(r,c,currTile));
    }
  }
}

function crushCandy() {
  crushFive();
  crushFour();
  crushThree();
  document.getElementById("score").innerText = score;

}

function replaceBomb(row, col, color){
  board[row][col].src = "./static/images/special.png";
}

function checkFiveSpecial(checkRow, checkCol, matchTile) {
  //check rows  
  //console.log("current");
  //console.log(currTile);
  //console.log("other");
  //console.log(otherTile);
  //console.log(checkRow);
  //console.log(checkCol);
  //console.log(matchTile);




  let comboCount = 1;
  //check rows
  for (let current = checkCol - 1; current >= 0; current--) {
    //console.log("current is: " + current);
    if (board[checkRow][current].src != matchTile.src) {
      //console.log("breaks at: " + current);
      break;
    }
    board[checkRow][current].src = "./static/images/blank.png"
    comboCount++;
    //console.log("backwards check: " + comboCount);
  }
  for (let current = checkCol + 1; current < columns; current++) {
    if (board[checkRow][current].src != matchTile.src) {
      break;
    }
    board[checkRow][current].src = "./static/images/blank.png"
    comboCount++;
    //console.log("forward check: " + comboCount);
  }
  if (comboCount > 2) {
    console.log("horizontal comboCount is " + comboCount);
    if (comboCount == 5) {
      replaceBomb(checkRow, checkCol);
    }
    return comboCount;
  }
  //check columns
  comboCount = 1;
  //console.log("reset: " +comboCount);
  for (let current = checkRow - 1; current >= 0; current--) {
    if (board[current][checkCol].src != matchTile.src) {
      break;
    }
    board[current][checkCol].src = "./static/images/blank.png"
    comboCount++;
    //console.log("backwards check: " + comboCount);
  } 

  for (let current = checkRow + 1; current < rows; current++) {
    if (board[current][checkCol].src != matchTile.src) {
      break;
    }
    board[current][checkCol].src = "./static/images/blank.png"
    comboCount++;
    //console.log("forwards check: " + comboCount);
  }
  if (comboCount > 2) {
    //console.log("vertical comboCount is " + comboCount);
    if (comboCount == 5) {
      replaceBomb(checkRow, checkCol);
    }
    return comboCount;
  }
  //console.log("comboCount is " + comboCount);
  return 0;
}
function crushThree() {
  //check rows
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns-2; c++) {
      let candy1 = board[r][c];
      let candy2 = board[r][c+1];
      let candy3 = board[r][c+2];
      if (candy1.src == candy2.src && candy2.src == candy3.src && !candy1.src.includes("blank")) {
        candy1.src = "./images/blank.png";
        candy2.src = "./images/blank.png";
        candy3.src = "./images/blank.png";
        score += 30;
      }
    }
  }

  //check columns
  for (let c = 0; c < columns; c++) {
    for (let r = 0; r < rows-2; r++) {
      let candy1 = board[r][c];
      let candy2 = board[r+1][c];
      let candy3 = board[r+2][c];
      if (candy1.src == candy2.src && candy2.src == candy3.src && !candy1.src.includes("blank")) {
        candy1.src = "./images/blank.png";
        candy2.src = "./images/blank.png";
        candy3.src = "./images/blank.png";
        score += 30;
      }
    }
  }
}

function crushFive(){
  //check rows
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns-4; c++) {
      let candy1 = board[r][c];
      let candy2 = board[r][c+1];
      let candy3 = board[r][c+2];
      let candy4 = board[r][c+3];
      let candy5 = board[r][c+4];
      if (candy1.src == candy2.src && candy2.src == candy3.src && candy3.src == candy4.src && candy4.src == candy5.src &&!candy1.src.includes("blank")) {
        candy1.src = "./static/images/blank.png";
        candy2.src = "./static/images/blank.png";
        candy3.src = "./static/images/blank.png";
        candy4.src = "./static/images/blank.png";
        candy5.src = "./static/images/blank.png";
        score += 50;
      }
    }
  }

  //check columns
  for (let c = 0; c < columns; c++) {
    for (let r = 0; r < rows-4; r++) {
      let candy1 = board[r][c];
      let candy2 = board[r+1][c];
      let candy3 = board[r+2][c];
      let candy4 = board[r+3][c];
      let candy5 = board[r+4][c];
      if (candy1.src == candy2.src && candy2.src == candy3.src && candy3.src == candy4.src && candy4.src == candy5.src &&!candy1.src.includes("blank")) {
        candy1.src = "./static/images/blank.png";
        candy2.src = "./static/images/blank.png";
        candy3.src = "./static/images/blank.png";
        candy4.src = "./static/images/blank.png";
        candy5.src = "./static/images/blank.png";
        score += 50;
      }
    }
  }
}

function crushFour(){
  //check rows
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns-3; c++) {
      let candy1 = board[r][c];
      let candy2 = board[r][c+1];
      let candy3 = board[r][c+2];
      let candy4 = board[r][c+3];
      if (candy1.src == candy2.src && candy2.src == candy3.src && candy3.src == candy4.src && !candy1.src.includes("blank")) {
        candy1.src = "./static/images/blank.png";
        candy2.src = "./static/images/blank.png";
        candy3.src = "./static/images/blank.png";
        candy4.src = "./static/images/blank.png";
        score += 40;
        //spawn 4 duck powerup (horizontal)
      }
    }
  }

  //check columns
  for (let c = 0; c < columns; c++) {
    for (let r = 0; r < rows-3; r++) {
      let candy1 = board[r][c];
      let candy2 = board[r+1][c];
      let candy3 = board[r+2][c];
      let candy4 = board[r+2][c];
      if (candy1.src == candy2.src && candy2.src == candy3.src && candy3.src == candy4.src && !candy1.src.includes("blank")) {
        candy1.src = "./static/images/blank.png";
        candy2.src = "./static/images/blank.png";
        candy3.src = "./static/images/blank.png";
        candy4.src = "./static/images/blank.png";
        score += 40;
        //spawn 4 duck powerup (vertical)
      }
    }
  }
}

function checkValid() {
  //check rows
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns-2; c++) {
      let candy1 = board[r][c];
      let candy2 = board[r][c+1];
      let candy3 = board[r][c+2];
      if (candy1.src == candy2.src && candy2.src == candy3.src && !candy1.src.includes("blank")) {
        return true;
      }
    }
  }

  //check columns
  for (let c = 0; c < columns; c++) {
    for (let r = 0; r < rows-2; r++) {
      let candy1 = board[r][c];
      let candy2 = board[r+1][c];
      let candy3 = board[r+2][c];
      if (candy1.src == candy2.src && candy2.src == candy3.src && !candy1.src.includes("blank")) {
        return true;
      }
    }
  }

  return false;
}


function slideCandy() {
  for (let c = 0; c < columns; c++) {
    let ind = rows - 1;
    for (let r = columns-1; r >= 0; r--) {
      if (!board[r][c].src.includes("blank")) {
        board[ind][c].src = board[r][c].src;
        ind -= 1;
      }
    }

    for (let r = ind; r >= 0; r--) {
      board[r][c].src = "./static/images/blank.png";
    }
  }
}

function generateCandy() {
  for (let c = 0; c < columns;  c++) {
    if (board[0][c].src.includes("blank")) {
      board[0][c].src = "./static/images/" + randomCandy() + ".png";
    }
  }
}
