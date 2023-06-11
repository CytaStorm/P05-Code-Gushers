let candies = ["Blue", "Pink", "Green", "Yellow", "Red", "Purple"];
//var candies = ["Yellow", "Red", "Purple"];
let board = [];
let rows = 10;
let columns = 10;
let score = 0;

let currTile;
let otherTile;

window.onload = function() {
  startGame();
  generateCandy();
  //1/10th of a second
  window.setInterval(function(){
    crushCandy();
    slideCandy();
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
      let color = getColor(r, c);
      console.log(checkSpecial(r2,c2,otherTile, color));
      //check for indirect swipes (swipe ohter color to move red to complete red string)
      color = getColor(r2,c2);
      console.log(checkSpecial(r,c,currTile, color));
    }
  }
}

function crushCandy() {
  crushFive();
  crushFour();
  crushThree();
  document.getElementById("score").innerText = score;

}

function getColor(row, col){
  let t0 = board[row][col].src.split("/");
  if (board[row][col].src.includes("-")) {
    return t0[t0.length-1].split("-")[0];
  } else {
    let t1 = t0[t0.length-1];
    return t1.substring(0,t1.length-4);
  }
}
function replaceBomb(row, col, color){
  board[row][col].src = "./static/images/" + color + "-bomb.png";
}
function replaceColorBomb(row, col){
  board[row][col].src = "./static/images/special.png";
  score += 50;
}

function replaceStripe(row, col, orientation, color){
  if (orientation == "vertical") {
    board[row][col].src = "./static/images/" + color + "-stripedV.png";
  } else if (orientation == "horizontal") {
    board[row][col].src = "./static/images/" + color + "-stripedH.png";
  } else {
    throw new Error('Please specify orientation');
  }
  score += 40;
}
function checkSpecial(checkRow, checkCol, matchTile) {
  let color = getColor(checkRow, checkCol);
  //check rows
  let beforeCountH = 0;
  let afterCountH = 0;
  let comboCountH = 1;
  for (let current = checkCol - 1; current >= 0; current--) {
    //console.log("current is: " + current);
    if (board[checkRow][current].src != matchTile.src) {
      //console.log("breaks at: " + current);
      break;
    }
    board[checkRow][current].src = "./static/images/blank.png"
    beforeCountH++;
    comboCountH++;
    //console.log("backwards check: " + comboCount);
  }
  for (let current = checkCol + 1; current < columns; current++) {
    if (board[checkRow][current].src != matchTile.src) {
      break;
    }
    board[checkRow][current].src = "./static/images/blank.png"
    afterCountH++;
    comboCountH++;
    //console.log("forward check: " + comboCount);
  }
  
  //check columns
  let beforeCountV = 0;
  let afterCountV = 0;
  let comboCountV = 1; 
  //console.log("reset: " +comboCountV);
  for (let current = checkRow - 1; current >= 0; current--) {
    if (board[current][checkCol].src != matchTile.src) {
      break;
    }
    board[current][checkCol].src = "./static/images/blank.png"
    beforeCountV++;
    comboCountV++;
    //console.log("backwards check: " + comboCountV);
  } 

  for (let current = checkRow + 1; current < rows; current++) {
    if (board[current][checkCol].src != matchTile.src) {
      break;
    }
    board[current][checkCol].src = "./static/images/blank.png"
    afterCountV++;
    comboCountV++;
    //console.log("forwards check: " + comboCountV);
  }

  //decide what do after counting combo size for row and column

  if (comboCountH == 3 && comboCountV == 3) {
    //make bomb
    console.log("make bomb! comboCountH is " + comboCountH + ", comboCountV is " + comboCountV);
    replaceBomb(checkRow, checkCol, color)
    return ("comboCountH is " + comboCountH + ", comboCountV is " + comboCountV);
  }
  if (comboCountH > 2) {
    console.log("horizontal comboCount is " + comboCountH);
    switch (comboCountH) {
      case 5:
        replaceColorBomb(checkRow, checkCol);
      case 4: 
        replaceStripe(checkRow, checkCol, "horizontal", color);
      default:
        score += 30;
    }
    return comboCountH;
  }
  if (comboCountV > 2) {
    //console.log("vertical comboCountV is " + comboCount);
    switch (comboCountV) {
      case 5:
        replaceColorBomb(checkRow, checkCol);
      case 4: 
        replaceStripe(checkRow, checkCol, "vertical", color);
      default:
        score += 30;
    }
    return comboCountV;
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
      let color1 = getColor(r,c);
      let color2 = getColor(r,c+1);
      let color3 = getColor(r,c+2);
      if (color1 == color2 && color2 == color3 && !candy1.src.includes("blank")) {
        candy1.src = "./static/images/blank.png";
        candy2.src = "./static/images/blank.png";
        candy3.src = "./static/images/blank.png";
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
      let color1 = getColor(r,c);
      let color2 = getColor(r+1,c);
      let color3 = getColor(r+2,c);
      if (color1 == color2 && color2 == color3 && !candy1.src.includes("blank")) {
        candy1.src = "./static/images/blank.png";
        candy2.src = "./static/images/blank.png";
        candy3.src = "./static/images/blank.png";
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
      let color1 = getColor(r,c);
      let color2 = getColor(r,c+1);
      let color3 = getColor(r,c+2);
      let color4 = getColor(r,c+3);
      let color5 = getColor(r,c+4);
      if (color1 == color2 && color2 == color3 && color3 == color4 && color4 == color5 && !candy1.src.includes("blank")) {
        //console.log("crush 5 row " + color1);

        candy1.src = "./static/images/blank.png";
        candy2.src = "./static/images/blank.png";
        candy3.src = "./static/images/blank.png";
        candy4.src = "./static/images/blank.png";
        candy5.src = "./static/images/blank.png";
        switch (Math.floor(Math.random() * 5)) {
          case 0:
            candy1.src = "./static/images/"+ color1 + "-stripedH.png";
          case 1:
            candy2.src = "./static/images/"+ color1 + "-stripedH.png";
          case 2:
            candy3.src = "./static/images/"+ color1 + "-stripedH.png";
          case 3:
            candy4.src = "./static/images/"+ color1 + "-stripedH.png";
          default:
            candy5.src = "./static/images/"+ color1 + "-stripedH.png";
        }
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
      let color1 = getColor(r,c);
      let color2 = getColor(r+1,c);
      let color3 = getColor(r+2,c);
      let color4 = getColor(r+3,c);
      let color5 = getColor(r+4,c);
      if (color1 == color2 && color2 == color3 && color3 == color4 && color4 == color5 && !candy1.src.includes("blank")) {
        //console.log("crush 5 column " + color1);
        candy1.src = "./static/images/blank.png";
        candy2.src = "./static/images/blank.png";
        candy3.src = "./static/images/blank.png";
        candy4.src = "./static/images/blank.png";
        candy5.src = "./static/images/blank.png";
        switch (Math.floor(Math.random() * 5)) {
          case 0:
            candy1.src = "./static/images/"+ color1 + "-stripedV.png";
          case 1:
            candy2.src = "./static/images/"+ color1 + "-stripedV.png";
          case 2:
            candy3.src = "./static/images/"+ color1 + "-stripedV.png";
          case 3:
            candy4.src = "./static/images/"+ color1 + "-stripedV.png";
          default:
            candy5.src = "./static/images/"+ color1 + "-stripedV.png";
        }
        score += 50;
      }
    }
  }
}

function crushSpecialFour(row, col, orientation){
  if (orientation == "vertical") {
    for (c = 0; c < columns; c++){
      board[c][row].src = "./static/images/blank.png";
    }
  }
  else{
    for (r = 0; r < rows; r++){
      board[r][col].src = "./static/images/blank.png";
    }
  }
}

//function crushBomb(row, col){
//  for (r = row - 3%row; r <= row + 2 ; r++){
//   for (c = cow - 2; c <= col + 2; c++){
//      board[columns][];
//    }
//  }
//}



function crushFour(){
  //check rows
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns-3; c++) {
      let candy1 = board[r][c];
      let candy2 = board[r][c+1];
      let candy3 = board[r][c+2];
      let candy4 = board[r][c+3];
      let color1 = getColor(r,c);
      let color2 = getColor(r,c+1);
      let color3 = getColor(r,c+2);
      let color4 = getColor(r,c+3);
      if (color1 == color2 && color2 == color3 && color3 == color4 && !candy1.src.includes("blank")) {
        //console.log("crush 4 column " + color1);
        candy1.src = "./static/images/blank.png";
        candy2.src = "./static/images/blank.png";
        candy3.src = "./static/images/blank.png";
        candy4.src = "./static/images/blank.png";
        //currently autocompleted 4 combos will default to horizontal stripes
        switch (Math.floor(Math.random() * 5)) {
          case 0:
            candy1.src = "./static/images/"+ color1 + "-stripedH.png";
          case 1:
            candy2.src = "./static/images/"+ color1 + "-stripedH.png";
          case 2:
            candy3.src = "./static/images/"+ color1 + "-stripedH.png";
          default:
            candy4.src = "./static/images/"+ color1 + "-stripedH.png";
        }
        score += 40;
      }
    }
  }

  //check columns
  for (let c = 0; c < columns; c++) {
    for (let r = 0; r < rows-3; r++) {

      let candy1 = board[r][c];
      let candy2 = board[r+1][c];
      let candy3 = board[r+2][c];
      let candy4 = board[r+3][c];
      let color1 = getColor(r,c);
      let color2 = getColor(r+1,c);
      let color3 = getColor(r+2,c);
      let color4 = getColor(r+3,c);
      if (color1 == color2 && color2 == color3 && color3 == color4 && !candy1.src.includes("blank")) {
        //console.log("crush 4 column " + color1);
        candy1.src = "./static/images/blank.png";
        candy2.src = "./static/images/blank.png";
        candy3.src = "./static/images/blank.png";
        candy4.src = "./static/images/blank.png";
        switch (Math.floor(Math.random() * 5)) {
          case 0:
            candy1.src = "./static/images/"+ color1 + "-stripedV.png";
          case 1:
            candy2.src = "./static/images/"+ color1 + "-stripedV.png";
          case 2:
            candy3.src = "./static/images/"+ color1 + "-stripedV.png";
          default:
            candy4.src = "./static/images/"+ color1 + "-stripedV.png";
        }
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
      let color1 = getColor(r,c);
      let color2 = getColor(r,c+1);
      let color3 = getColor(r,c+2);
      if (color1 == color2 && color2 == color3 && !candy1.src.includes("blank")) {
        console.log("here0");
        return true;
      }
    }
  }

  //check columns
  for (let c = 0; c < columns; c++) {
    for (let r = 0; r < rows-2; r++) {
      let candy1 = board[r][c];
      let color1 = getColor(r,c);
      let color2 = getColor(r+1,c);
      let color3 = getColor(r+2,c);
      if (color1 == color2 && color2 == color3 && !candy1.src.includes("blank")) {
        console.log("here");
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
