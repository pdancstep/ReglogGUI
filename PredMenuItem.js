function MakePredMenuItem(xPos,yPos,whichTypes) {
  
  //mutable drag values for ghosted type
  this.x = xPos
  this.y = yPos
  //permanent values for menu location
  this.menuX = xPos
  this.menuY = yPos

  //type/color assignment...
  this.myTypes = whichTypes


  //dimensions of draggable region...
  this.radius = 30


  this.dragging = false
    
  this.offsetX = 0
  this.offsetY = 0

  //boolean for if mouse is over this menu item...
  this.overMenuItem = false

  this.overMe = function(vertOffset){
    if(dist(mouseX,mouseY,this.menuX,this.menuY-vertOffset)<this.radius){
      this.overMenuItem = true
    }else{
      this.overMenuItem = false
    }
  }

  //when mouse is clicked
  this.clickMe = function(vertOffset) {

    if(this.overMenuItem){
      this.dragging = true
      this.offsetX = this.menuX-mouseX
      this.offsetY = this.menuY-vertOffset-mouseY
    }


  }

  this.update = function(){


    //dragging shells
    if(this.dragging){
      this.x = mouseX + this.offsetX
      this.y = mouseY + this.offsetY
    }

  }

  //when drag-and-drop is released, reset coords to menu location so dragging can happen again...
  this.resetToMenu = function(){
    this.x = this.menuX
    this.y = this.menuY
  }


  this.display = function(vertOffset) {

    strokeWeight(3)
    //display menu item...
    //stroke(highlightColor[this.whichPred][0],highlightColor[this.whichPred][1],highlightColor[this.whichPred][2])

    for(a=0;a<this.myTypes.length;a++){
      stroke(highlightColor[this.myTypes[a]][0],highlightColor[this.myTypes[a]][1],highlightColor[this.myTypes[a]][2])
      line(this.menuX,this.menuY-vertOffset,this.menuX+this.radius*1.4*cos((a*TWO_PI/this.myTypes.length)-PI),(this.menuY-vertOffset)+this.radius*1.4*sin((a*TWO_PI/this.myTypes.length)-PI))
    }

    stroke(0)
    fill(255)
    ellipse(this.menuX,this.menuY-vertOffset,this.radius*2,this.radius*2)
    fill(0)
    noStroke()
    textSize(20)
    text(this.myTypes.length,this.menuX,this.menuY-vertOffset)


    //display ghost...
    if(this.dragging){
      //stroke(highlightColor[this.whichPred][0],highlightColor[this.whichPred][1],highlightColor[this.whichPred][2],150)
      stroke(0,150)
      fill(255,150)
      ellipse(this.x,this.y,this.radius*2,this.radius*2)
    }


  }

}










