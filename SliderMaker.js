//gives x,y coord of top right, height of slider, and percent of travel to begin at...

function MakeSlider(xPos,yPos,high,perc) {
  this.thumbHeight = 25
  this.thumbWidth = 25

  //coords for overall slider assembly
  this.x = xPos
  this.y = yPos

  this.dragging = false;

  //length of slider travel
  this.dragLimit = high-this.thumbHeight

  //coords for sliding component
  this.newX = 0
  this.newY = high*perc
       
  //dragging offset
  this.offsetY = 0

  //slider output variable (start out same as .newY)
  this.dragDistance = high*perc


//clean up these conditions (the -25 is because the slider track starts at zero, but the thumb sticks out into -25)
  this.clickMe = function() {
    if (mouseY > (this.y+this.newY) && mouseY < (this.y+this.newY+this.thumbHeight) && mouseX > (this.x-this.thumbWidth) && mouseX <(this.x)) {
      this.dragging = true;
      this.offsetY = this.newY-mouseY;
    }
  }

  this.dragSlider = function(){
  //if it's in range we're good
  if (this.dragging){
    if (this.newY>=0 && this.newY <= this.dragLimit){
          this.newY = mouseY + this.offsetY
          this.dragDistance = this.newY
    }
    //otherwise implement these cutoffs...
    if (this.newY < 0){
        this.newY = 0
        this.dragDistance = 0
      }
    if (this.newY > this.dragLimit){
        this.newY = this.dragLimit
        this.dragDistance = this.dragLimit
      }
    }

  }




  //NOTE: this draw function is indexed from the right edge...
  this.display = function() {

    noStroke()

    push()
      translate(this.x,this.y)

      //draw slider track
      fill (160)
      stroke(160)
      strokeWeight(1)
      beginShape()
        vertex(0,0)
        vertex(-this.thumbWidth,0)
        vertex(-this.thumbWidth,this.dragLimit+this.thumbHeight)
        vertex(0,this.dragLimit+this.thumbHeight)
      endShape(CLOSE)

      //disappear player head during auto-zoom...
      if(!homeTransition){
        //draw slider head
        fill (242)
        stroke(62)
        strokeWeight(1)
        beginShape()
          vertex(this.newX,this.newY)
          vertex(this.newX,this.newY+this.thumbHeight)
          vertex(this.newX-this.thumbWidth, this.newY+this.thumbHeight)
          vertex(this.newX-this.thumbWidth, this.newY)
        endShape(CLOSE)
      }


    pop()

  }


}