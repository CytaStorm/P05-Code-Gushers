class Duck{
    constructor(posX,posY,color) {
        this.color = color;
        this.posX = posX;
        this.posY = posY;
        isCleared = false;
    }



}

//special ducks need their own classes
class horizontalSpecial extends Duck{
    constructor(orientation){
        super(posX,posY,color)
        this.orientation = updown;
    }
    //psuedocode
    clear(orientation){
        if orientation == horizontal{
            for (i = 0, i > )
        }
    } 
    
}

class bombSpecial extends Duck{
    clear(){
        //surrounding 8 ducks get cleared
    }
}

class rainbowSpecial extends Duck{

    //function that takes in what color you swipe with and activates effect based on that
    
}
