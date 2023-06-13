let candies = ["Blue", "Pink", "Green", "Yellow", "Red", "Purple"];
//let candies = ["Red", "Purple", "Blue", "Yellow"];
let board = [];
let rows = 10;
let columns = 10;
let score = 0;
let coins = 10;
let scoreDelta = 0;

let currTile;
let otherTile;

window.onload = function() {
  startGame();

  //let isFirstLoad = true;
  generateCandy();
  //console.log(checkValid());
  while (checkValid()) {
    crushCandy(true);
    slideCandy();
    fillCandy();
  }

  //console.log("here");
  score = 0;
  scoreDelta = 0;
  coins = 20;
  //1/10th of a second
  window.setInterval(function(){
  //  if (isFirstLoad) {
  //    isFirstLoad = false;
  //  } else
  //{
      crushCandy();
      slideCandy();
      generateCandy();
      checkScoreDelta();
      if (coins == 0) {
        let gameOver = `GAME OVER \nHIGH SCORE ${score}`;
        alert(gameOver);
      }
      //console.log(scoreDelta);
  //  }
  }, 100);

  // Remove the automatic crushing after a certain delay
  setTimeout(function() {
    isFirstLoad = false;
  }, 2000); // Change the delay as needed
}

function checkScoreDelta() {
  if (scoreDelta >= 100) {
    let addCoins = Math.floor((scoreDelta / 100));
    coins += addCoins;
    scoreDelta = scoreDelta % 100;
  }
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

  //console.log(board);
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
    if (board[r][c].src.includes("special") || board[r2][c2].src.includes("special")) {
      validMove = true;
    }
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
      let color1 = getColor(r, c);
      let color2 = getColor(r2,c2);
      if (board[r][c].src.includes("special")){
        crushRainbow(r,c,color2);
      }
      if (board[r2][c2].src.includes("special")){
        crushRainbow(r2,c2,color1);
      }
      console.log(checkSpecial(r2,c2,otherTile, color1));
      //check for indirect swipes (swipe ohter color to move red to complete red string)
      console.log(checkSpecial(r,c,currTile, color2));
      coins--;
    }
  }
}

function crushCandy(first) {
  crushFive();
  crushFour();
  crushThree();
  if (!first) {
    document.getElementById("score").innerText = score;
    document.getElementById("coins").innerText = coins;
  }

}

function getColor(row, col){
  if (board[row][col].src.includes("special")) {
    return "special";
  }
  
  let t0 = board[row][col].src.split("/");
  //console.log(t0[t0.length-1]);
  if (board[row][col].src.includes("-")) {
    return t0[t0.length-1].split("-")[0];
  } else {
    let t1 = t0[t0.length-1];
    return t1.substring(0,t1.length-4);
  }
}

function getOrientation(row, col){
  let t0 = board[row][col].src.split("/");
  let t1 = t0[t0.length-1];
  let t2 = t1.split("-");
  //console.log(t2)
  let t3 = t2[t2.length-1];
  //console.log(t3);
  let t4 = t3.substring(7,t3.length-4);
  //console.log(t4);
  return t4;
}

function replaceBomb(row, col, color){
  board[row][col].src = "./static/images/" + color + "-bomb.png";
}
function replaceColorBomb(row, col){
  console.log("colorBomb used");
  board[row][col].src = "./static/images/special.png";
  score += 50;
  scoreDelta += 50;
}

function replaceStripe(row, col, orientation, color){
  console.log("uses replaceStripe");
  if (orientation == "vertical") {
    board[row][col].src = "./static/images/" + color + "-stripedV.png";
  } else if (orientation == "horizontal") {
    board[row][col].src = "./static/images/" + color + "-stripedH.png";
  } else {
    throw new Error('Please specify orientation');
  }
  score += 40;
  scoreDelta += 50;
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
    //console.log("make bomb! comboCountH is " + comboCountH + ", comboCountV is " + comboCountV);
    replaceBomb(checkRow, checkCol, color) //make bomb
    return ("comboCountH is " + comboCountH + ", comboCountV is " + comboCountV);
  }
  if (comboCountH > 2) {
    console.log("comboCountH is " + comboCountH);
    switch (comboCountH) {
      case 5:
        replaceColorBomb(checkRow, checkCol);
        console.log("5 combo");
        break;
      case 4:
        replaceStripe(checkRow, checkCol, "horizontal", color);
        break;
      default:
        score += 30;
        scoreDelta += 30;
    }
    return comboCountH;
  }
  if (comboCountV > 2) {
    console.log("comboCountV is " + comboCountV);
    switch (comboCountV) {
      case 5:
        replaceColorBomb(checkRow, checkCol);
        console.log("5 combo");
        break;
      case 4:
        replaceStripe(checkRow, checkCol, "vertical", color); //make stripe
        break;
      default:
        score += 30;
        scoreDelta += 30;
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
        if (isSpecial(candy1.src)){
          crushSpecial(r, c);
        }
        if (isSpecial(candy2.src)){
          crushSpecial(r, c+1);
        }
        if (isSpecial(candy3.src)){
          crushSpecial(r, c+2);
        }
        candy1.src = "./static/images/blank.png";
        candy2.src = "./static/images/blank.png";
        candy3.src = "./static/images/blank.png";
        score += 30;
        scoreDelta += 30;
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
        if (isSpecial(candy1.src)){
          crushSpecial(r, c);
        }
        if (isSpecial(candy2.src)){
          crushSpecial(r+1, c);
        }
        if (isSpecial(candy3.src)){
          crushSpecial(r+2, c);
        }
        candy1.src = "./static/images/blank.png";
        candy2.src = "./static/images/blank.png";
        candy3.src = "./static/images/blank.png";
        score += 30;
        scoreDelta += 30;
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
        if (isSpecial(candy1.src)){
          crushSpecial(r, c);
        }
        if (isSpecial(candy2.src)){
          crushSpecial(r, c+1);
        }
        if (isSpecial(candy3.src)){
          crushSpecial(r, c+2);
        }
        if (isSpecial(candy4.src)){
          crushSpecial(r, c+3);
        }
        if (isSpecial(candy5.src)){
          crushSpecial(r, c+4);
        }
        candy1.src = "./static/images/blank.png";
        candy2.src = "./static/images/blank.png";
        candy3.src = "./static/images/blank.png";
        candy4.src = "./static/images/blank.png";
        candy5.src = "./static/images/blank.png";
        switch (Math.floor(Math.random() * 5)) {
          case 0:
            candy1.src = "./static/images/special.png";
            break;
          case 1:
            candy2.src = "./static/images/special.png";
            break;
          case 2:
            candy3.src = "./static/images/special.png";
            break;
          case 3:
            candy4.src = "./static/images/special.png";
            break;
          default:
            candy5.src = "./static/images/special.png";
            break;
        }
        score += 50;
        scoreDelta += 50;
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
        if (isSpecial(candy1.src)){
          crushSpecial(r, c);
        }
        if (isSpecial(candy2.src)){
          crushSpecial(r+1, c);
        }
        if (isSpecial(candy3.src)){
          crushSpecial(r+2, c);
        }
        if (isSpecial(candy4.src)){
          crushSpecial(r+3, c);
        }
        if (isSpecial(candy5.src)){
          crushSpecial(r+4, c);
        }
        candy1.src = "./static/images/blank.png";
        candy2.src = "./static/images/blank.png";
        candy3.src = "./static/images/blank.png";
        candy4.src = "./static/images/blank.png";
        candy5.src = "./static/images/blank.png";
        switch (Math.floor(Math.random() * 5)) {
          case 0:
            candy1.src = "./static/images/special.png";
            break;
          case 1:
            candy2.src = "./static/images/special.png";
            break;
          case 2:
            candy3.src = "./static/images/special.png";
            break;
          case 3:
            candy4.src = "./static/images/special.png";
            break;
          default:
            candy5.src = "./static/images/special.png";
            break;
        }
        score += 50;
        scoreDelta += 50;
      }
    }
  }
}

function crushSpecialStripes(row, col, orientation){
  if (orientation == "H") {
    for (c = 0; c < columns; c++){
      board[row][c].src = "./static/images/blank.png";
      score += 10;
      scoreDelta += 10;
    }
  }
  else{
    for (r = 0; r < rows; r++){
      board[r][col].src = "./static/images/blank.png";
      score += 10;
      scoreDelta += 10;
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
      
      //console.log("color1: " + color1);
      //console.log("color2: " + color2);
      //console.log("color3: " + color3);
      //console.log("color4: " + color4);
      //let test = color1 == color2 && color2 == color3 && color3 == color4 && !candy1.src.includes("blank");
      //if (test) {
      //  console.log("test true");
      //}
      if (color1 == color2 && color2 == color3 && color3 == color4 && !candy1.src.includes("blank") && !candy1.src.includes("special")) {
        //console.log("crush 4 column " + color1);
        if (color1 == "special" || color2 == "special" || color3 == "special" || color4 == "special") {
          console.log("one of these is special");
          if (color1 == "special") {
            console.log("color1 is special");
          } else if (color2 == "special") {
            console.log("color2 is special");
          } else if (color3 == "special") {
            console.log("color3 is special");
          } else {
            console.log("color4 is special");
          }
        }
        if (isSpecial(candy1.src)){
          crushSpecial(r, c);
        }
        if (isSpecial(candy2.src)){
          crushSpecial(r, c+1);
        }
        if (isSpecial(candy3.src)){
          crushSpecial(r, c+2);
        }
        if (isSpecial(candy4.src)){
          crushSpecial(r, c+3);
        }
        candy1.src = "./static/images/blank.png";
        candy2.src = "./static/images/blank.png";
        candy3.src = "./static/images/blank.png";
        candy4.src = "./static/images/blank.png";
        //currently autocompleted 4 combos will default to horizontal stripes
        switch (Math.floor(Math.random() * 5)) {
          case 0:
            candy1.src = "./static/images/"+ color1 + "-stripedH.png";
            break;
          case 1:
            candy2.src = "./static/images/"+ color1 + "-stripedH.png";
            break;
          case 2:
            candy3.src = "./static/images/"+ color1 + "-stripedH.png";
            break;
          default:
            candy4.src = "./static/images/"+ color1 + "-stripedH.png";
            break;
        }
        score += 40;
        scoreDelta += 40;
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
      //console.log("color1: " + color1);
      //console.log("color2: " + color2);
      //console.log("color3: " + color3);
      //console.log("color4: " + color4);
      //let test = color1 == color2 && color2 == color3 && color3 == color4 && !candy1.src.includes("blank");
      //if (test) {
      //  console.log("test true");
      //}

      if (color1 == color2 && color2 == color3 && color3 == color4 && !candy1.src.includes("blank") && !candy1.src.includes("special")) {
        //console.log("crush 4 column " + color1);
        //if (color1 == "special" || color2 == "special" || color3 == "special" || color4 == "special") {
        //  console.log("one of these is special");
        //  if (color1 == "special") {
        //    console.log("color1 is special");
        //  } else if (color2 == "special") {
        //    console.log("color2 is special");
        //  } else if (color3 == "special") {
        //    console.log("color3 is special");
        //  } else {
        //    console.log("color4 is special");
        //  }
        //}
        if (isSpecial(candy1.src)){
          crushSpecial(r, c);
        }
        if (isSpecial(candy2.src)){
          crushSpecial(r+1, c);
        }
        if (isSpecial(candy3.src)){
          crushSpecial(r+2, c);
        }
        if (isSpecial(candy4.src)){
          crushSpecial(r+3, c);
        }

        candy1.src = "./static/images/blank.png";
        candy2.src = "./static/images/blank.png";
        candy3.src = "./static/images/blank.png";
        candy4.src = "./static/images/blank.png";
        switch (Math.floor(Math.random() * 5)) {
          case 0:
            candy1.src = "./static/images/"+ color1 + "-stripedV.png";
            break;
          case 1:
            candy2.src = "./static/images/"+ color1 + "-stripedV.png";
            break;
          case 2:
            candy3.src = "./static/images/"+ color1 + "-stripedV.png";
            break;
          default:
            candy4.src = "./static/images/"+ color1 + "-stripedV.png";
            break;
        }
        score += 40;
        scoreDelta += 40;
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
//        console.log("here0");
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
        //console.log("here");
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

function getSpecialType(r, c){
  let t0 = board[r][c].src.split("/");
  let t1 = t0[t0.length-1];
  if (t1.includes("bomb")){
    return "bomb";
  }
  if (t1.includes("striped")){
    return "striped";
  }
}

function isSpecial(duck){
  if (duck.includes("-")) {
    return true;
  }
  else {
    return false;
  }
}

function crushSpecial(r, c){
  let type = getSpecialType(r,c);
  if (type == "striped"){
    let orientation = getOrientation(r,c);
    crushSpecialStripes(r, c, orientation);
  }
  if (type = "bomb"){
    crushBomb(r, c);
  }
}

function crushBomb(r, c){
  xMin = r - 2;
  xMax = r + 2;
  yMin = c - 2;
  yMax = c + 2;

  if (r <= 1){
    xMin = 0;
  }
  if (r >= 9){
    xMax = 10;
  }
  if (c <= 1){
    yMin = 0;
  }
  if (c >= 9){
    yMax = 10;
  }
  for (row = xMin; row < xMax; row++){
    for (col = yMin; col < yMax; col++){
      board[row][col].src = "./static/images/blank.png";
      //console.log("bombed at [" + row + ", " + col+"]");
      score += 10;
      scoreDelta += 10;
    }
  }
}

function crushRainbow(row,col,color){
  board[row][col].src = "./static/images/blank.png";
  for (let r = 0; r < rows; r++){
    for (let c = 0; c < columns; c++){
      if (getColor(r,c) == color){
        console.log("crushing rainbow");
        board[r][c].src = "./static/images/blank.png";
        score += 10;
        scoreDelta += 10;
      }
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
function fillCandy() {
  for (let r = 0; r < rows; r++){
    for (let c = 0; c < columns;  c++) {
      if (board[r][c].src.includes("blank")) {
        board[r][c].src = "./static/images/" + randomCandy() + ".png";
      }
    }
  }
}
