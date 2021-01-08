function MakePredicate(xPos,yPos,whichTypes) {
  this.stageX = xPos
  this.stageY = yPos

  this.globalX = stageToGlobalX(xPos)
  this.globalY = stageToGlobalY(yPos)


  this.myTypes = []

  //Lay out types evenly
  //Note the subtraction of PI -> this puts all angles -PI<angle<PI, which makes bounceback work...
  for(m=0;m<whichTypes.length;m++){
      this.myTypes.push(new MakeType((m*TWO_PI/whichTypes.length)-PI,whichTypes[m]))
  }


  this.radius = 50
  this.minRadius = 15
  this.maxRadius = 150




  this.dragging = false
  this.resize = false

       
  //offsets for dragging
  this.offsetX = 0
  this.offsetY = 0

  //border thickness for picking edge of shell
  this.perimThickness = 10
  //standard wire width
  this.wireWidth = 3


  //is mouse over edge?
  this.edgeDetection = false



  //boolean for repositioning type/wire
  this.anglePicker = false
  //index of wire being moved to a new angle
  this.angleIndex


  //boolean for whether mouse is hovering over predicate...
  this.overPredicate = false

  //boolean for whether this item is selected
  this.selected = false

  //double tap reference
  this.tappedOnce = false
  this.currentTime
  this.doubleTapTimer = 300

  //is contextual meny activated?
  this.contextualMenu = false

  //minimum radius for contextual menu tiles
  this.contextualRadius = this.radius + this.myTypes[0].beadWidth + this.myTypes[0].wireHeight

  //booleans for each of the contextual menu buttons (0 - top, 1 - lower left, 2 - lower right)
  this.over0 = false
  this.over1 = false
  this.over2 = false

  //determines mouse angle for pressing context buttons...
  this.contextualAngle





  //bezier control point of outgoing curve of wire


  //draggable tip when wire is being extended
  this.wireExtensionX
  this.wireExtensionY

  //control point of outgoing bezier
  this.outControlX
  this.outControlY
  //"amplitude" of control point 
  this.outAggro = 0

  //bezier control point for inputting wire into other predicate...
  this.inControlX
  this.inControlY
  //"amplitude" of inbound control point
  this.inAggro = 0

  //how close before wire tip starts to pick up linking opportunity?
  this.sniffingDistance = 100
  //maximum bend in bezier
  this.maxAggro = 2


  //boolean for whether wire extension is within *sniffing distance* of a potential type to link to...
  //Predicate-level needs to know this so it can adjust bend on wire extension...
  this.nearLinkPoint = false

  //boolean for pulling wire
  this.wirePull = false
  //index of wire being pulled
  this.pullIndex



  //calculate angle taken up by a single bead
  this.beadAngle
  //angular offset value between repositioning wire and wire under consideration to be pushed out of the way...
  //negative values signal CW approach, small positive values or ~ (-6.28) values signal CCW approach
  this.approachAngle





  //predicate decides if it is "selected" based on whether it is inside of selection rectangle...
  this.unselectedInRectangle = function(){

    if(mouseX>selectionRectangleX&&mouseY>selectionRectangleY){
      if(this.stageX>selectionRectangleX&&this.stageX<mouseX&&this.stageY>selectionRectangleY&&this.stageY<mouseY){
        this.selected = true
      }else{
        this.selected = false
      }
    }

    if(mouseX<selectionRectangleX&&mouseY>selectionRectangleY){
      if(this.stageX<selectionRectangleX&&this.stageX>mouseX&&this.stageY>selectionRectangleY&&this.stageY<mouseY){
        this.selected = true
      }else{
        this.selected = false
      }
    }

    if(mouseX>selectionRectangleX&&mouseY<selectionRectangleY){
      if(this.stageX>selectionRectangleX&&this.stageX<mouseX&&this.stageY<selectionRectangleY&&this.stageY>mouseY){
        this.selected = true
      }else{
        this.selected = false
      }
    }

    if(mouseX<selectionRectangleX&&mouseY<selectionRectangleY){
      if(this.stageX<selectionRectangleX&&this.stageX>mouseX&&this.stageY<selectionRectangleY&&this.stageY>mouseY){
        this.selected = true
      }else{
        this.selected = false
      }
    }

  }

  //predicate decides if it is "unselected" based on whether it is inside of selection rectangle...
  this.selectedInRectangle = function(){

    if(mouseX>selectionRectangleX&&mouseY>selectionRectangleY){
      if(this.stageX>selectionRectangleX&&this.stageX<mouseX&&this.stageY>selectionRectangleY&&this.stageY<mouseY){
        this.selected = false
      }else{
        this.selected = true
      }
    }

    if(mouseX<selectionRectangleX&&mouseY>selectionRectangleY){
      if(this.stageX<selectionRectangleX&&this.stageX>mouseX&&this.stageY>selectionRectangleY&&this.stageY<mouseY){
        this.selected = false
      }else{
        this.selected = true
      }
    }

    if(mouseX>selectionRectangleX&&mouseY<selectionRectangleY){
      if(this.stageX>selectionRectangleX&&this.stageX<mouseX&&this.stageY<selectionRectangleY&&this.stageY>mouseY){
        this.selected = false
      }else{
        this.selected = true
      }
    }

    if(mouseX<selectionRectangleX&&mouseY<selectionRectangleY){
      if(this.stageX<selectionRectangleX&&this.stageX>mouseX&&this.stageY<selectionRectangleY&&this.stageY>mouseY){
        this.selected = false
      }else{
        this.selected = true
      }
    }

  }







  //calculate necessary offset between neighboring wires to keep their roots from overlapping...
  //FIX: What if one pushed bead needs to push another bead, and so on???!!
  this.calculateAdjustment = function(){


  
    //calculate bead angle based on current radius...
    this.beadAngle = (this.myTypes[this.angleIndex].beadWidth+this.myTypes[this.angleIndex].beadStrokeWeight)/(this.radius+(.5*this.perimThickness+this.myTypes[this.angleIndex].beadWidth+this.myTypes[this.angleIndex].beadStrokeWeight)/2)

    //check all wires...
    for(n=0;n<this.myTypes.length;n++){

      //except the one being repositioned...
      if(n!=this.angleIndex){

        this.approachAngle = ((this.myTypes[this.angleIndex].angle-this.myTypes[n].angle)%TWO_PI)

        //turning on CWapproach or CCW approach:
        if(!this.myTypes[n].CCWapproach&&((this.approachAngle>-(this.beadAngle)&&this.approachAngle<0)||(this.approachAngle>(TWO_PI-this.beadAngle)))){
          this.myTypes[n].CWapproach = true
        }
        if(!this.myTypes[n].CWapproach&&((this.approachAngle<(this.beadAngle)&&this.approachAngle>0))){
          this.myTypes[n].CCWapproach = true
        }

        
        //turning off CWapproach or CCWapproach:
        //NOTE: Using "PI" as an arbitary greater/less than threshold for dealing with angular redundancy...
        if(this.myTypes[n].CWapproach&&!this.myTypes[n].bounceBack){
          //either approach backs off...
          if((this.approachAngle<-(this.beadAngle)&&this.approachAngle>(-PI))||((this.approachAngle<(TWO_PI-this.beadAngle)&&(this.approachAngle>PI)))){
            this.myTypes[n].CWapproach = false
          //or goes past this displaced wire...
          }else if(this.approachAngle>this.beadAngle&&this.approachAngle<(PI)){



            this.myTypes[n].bounceBack = true
            this.myTypes[n].startTime = millis()
            this.myTypes[n].endTime = millis() + this.myTypes[n].duration
            this.myTypes[n].startAngle = this.myTypes[n].angleAdjustment
            this.myTypes[n].angleDelta = -this.myTypes[n].angleAdjustment

          }
        }
        if(this.myTypes[n].CCWapproach&&!this.myTypes[n].bounceBack){
          //either approach backs off...
          if((this.approachAngle>(this.beadAngle))&&(this.approachAngle<PI)){
            this.myTypes[n].CCWapproach = false
          //or goes past this displaced wire...
          }else if((this.approachAngle<-this.beadAngle&&this.approachAngle>(-PI))||((this.approachAngle<(TWO_PI-this.beadAngle))&&(this.approachAngle>PI))){



            this.myTypes[n].bounceBack = true
            this.myTypes[n].startTime = millis()
            this.myTypes[n].endTime = millis() + this.myTypes[n].duration
            this.myTypes[n].startAngle = this.myTypes[n].angleAdjustment
            if(this.myTypes[n].angleAdjustment>PI){
              this.myTypes[n].angleDelta = (TWO_PI-this.myTypes[n].angleAdjustment)
            }else{
              this.myTypes[n].angleDelta = -this.myTypes[n].angleAdjustment
            }

          }
        }

        //determine angle adjustment...
        if(this.myTypes[n].CWapproach&&!this.myTypes[n].bounceBack){
          this.myTypes[n].angleAdjustment = map(this.myTypes[this.angleIndex].angle,this.myTypes[n].angle-this.beadAngle,this.myTypes[n].angle+this.beadAngle,0,2*this.beadAngle)
        }else if(this.myTypes[n].CCWapproach&&!this.myTypes[n].bounceBack){
          this.myTypes[n].angleAdjustment = map(this.myTypes[this.angleIndex].angle,this.myTypes[n].angle+this.beadAngle,this.myTypes[n].angle-this.beadAngle,0,-2*this.beadAngle)
        }else{
          this.myTypes[n].angleAdjustment = 0
        }

      }
    }
  }

  //commit wire adjustment offets if angular-adjusted wire is released while displacing another...
  this.resetWires = function(){
    for(n=0;n<this.myTypes.length;n++){
      if(this.myTypes[n].angleAdjustment!=0){
        this.myTypes[n].angle = this.myTypes[n].angle+this.myTypes[n].angleAdjustment
        this.myTypes[n].angleAdjustment=0
        this.myTypes[n].CWapproach = this.myTypes[n].CCWapproach = 0
      }
    }

  }






  this.overMe = function() {


    this.overPredicate=false
    //then check...
    if(dist(mouseX,mouseY,this.stageX,this.stageY)<(this.radius-.5*this.perimThickness)*globalScale){
      this.overPredicate = true

    }

    if(this.contextualMenu){

      if(dist(mouseX,mouseY,this.stageX,this.stageY)>(this.radius+.5*this.perimThickness)*globalScale&&dist(mouseX,mouseY,this.stageX,this.stageY)<this.contextualRadius*globalScale){

        this.contextualAngle = atan2(mouseY-this.stageY,mouseX-this.stageX)


        if(this.contextualAngle<(-PI/6)&&this.contextualAngle>(-5*PI/6)){
          this.over0 = true
        }else{
          this.over0 = false
        }


        if((this.contextualAngle>(HALF_PI)&&this.contextualAngle<(PI))||(this.contextualAngle<(-5*PI/6)&&this.contextualAngle>(-PI))){
          this.over1 = true
        }else{
          this.over1 = false
        }


        if(this.contextualAngle>(-PI/6)&&this.contextualAngle<(HALF_PI)){
          this.over2 = true
        }else{
          this.over2 = false
        }

      }else{
        this.over0 = this.over1 = this.over2 = false
      }

    }



    //check if mouse is over individual wire features (unless repositioning a wire)...
    if(!this.anglePicker){
      for(m=0;m<this.myTypes.length;m++){
        this.myTypes[m].overMe()
      }
    }




    if(!this.edgeDetectionOverride&&!this.anglePicker&&!this.dragging){
      if(dist(mouseX,mouseY,this.stageX,this.stageY)>((this.radius-.5*this.perimThickness)*globalScale)&&dist(mouseX,mouseY,this.stageX,this.stageY)<((this.radius+.5*this.perimThickness)*globalScale)){
        this.edgeDetection = true
      }else{
        this.edgeDetection = false
      }
    }

  }







  //run when mouse is clicked
  this.clickMe = function(index) {

    if(this.tappedOnce&&this.overPredicate){
      this.contextualMenu = !this.contextualMenu
    }

    if(!this.tappedOnce&&this.overPredicate){
      this.tappedOnce = true
      this.currentTime = millis()
    }


    if(this.over0){
      var myWindow = window.open("", "MsgWindow", "width=200,height=100");
      myWindow.document.write("<p>A table of data, a pixel array, or some other visualization...</p>");
    }
  

    if(!this.tappedOnce&&!this.overPredicate){
      this.contextualMenu = false
      this.over0 = this.over1 = this.over2 = false
    }



    //if predicate is under click...
    if(this.overPredicate){
      //if shift is pressed...
      if(shiftSelect){
        //if predicate is selected, unselect.
        if(this.selected){
          this.selected = false
          this.dragging = false
        //if predicate is unselected, select.
        }else{
          this.selected = true
          this.dragMe()
        }

      //if shift is not pressed...
      }else{
        //if predicate is selected, prep for dragging
        if(this.selected){
          this.dragMe()
        //if predicate is unselected, clear all all other selections.  
        }else{
          this.selected = true
          this.dragMe()
          clearSelected = true
        }
      }

    //for predicates NOT under click
    }else{
      //if this is selected...
      if(this.selected){
        //if pulling selection rectangle or zooming with slider...
        if(selectionRectangle||mySlider.dragging||arrestPanning){
          //stop this predicate from dragging...
          this.dragging = false
        }else{
          this.dragMe()
        }
      }

    }

    //if contextual menu is not up...
    if(!this.contextualMenu){
      //check if any of the types are to-be-pulled or to-be-rotated...
      for(m=0;m<this.myTypes.length;m++){


        //to be pulled...
        if(this.myTypes[m].overWireTip){
          
          this.wirePull = true
          this.pullIndex = m

          //turn on global variable for wire pulling...
          typeHighlight = true
          whichTypeHighlight = this.myTypes[m].whichType










          //reset bezier controls to this point
          this.outAggro = 1
          this.outControlX = mouseX
          this.outControlY = mouseY
          this.inAggro = 1
          this.inControlX = mouseX
          this.inControlY = mouseY
          this.wireExtensionX = mouseX
          this.wireExtensionY = mouseY
          
        
        }


        //to be rotated...
        if(this.myTypes[m].overWireRoot){

          this.anglePicker = true
          this.angleIndex = m

        }
      }
    }






    if(this.edgeDetection){
      this.resize = true
    }


    if(!topPredicateActive&&dist(mouseX,mouseY,this.stageX,this.stageY)<(this.radius-this.perimThickness)*globalScale){
      topPredicateActive = true
      this.dragging = true
      this.offsetX = this.stageX-mouseX
      this.offsetY = this.stageY-mouseY
    }

  }


  //called to activate dragging for all selected predicates...
  this.dragMe = function(){
      this.dragging = true
      this.offsetX = this.stageX-mouseX;
      this.offsetY = this.stageY-mouseY;

  }


  //boolean for whether text description appears inside shell
  this.predicateDescription = false



  this.update = function(){

    //cancel doubleTap event listener if too much time has gone by...
    if(this.tappedOnce){
      if((millis()-this.currentTime)>this.doubleTapTimer){
        this.tappedOnce=false
      }
    }

    //contextual menu radius update
    this.contextualRadius = this.radius + this.myTypes[0].beadWidth + this.myTypes[0].wireHeight


    //turn on predicate description text only if radius of shell is above a prescribed size
    this.predicateDescription = false
    if(this.radius>100){
      this.predicateDescription = true
    }


    //dragging preidcates
    if(this.dragging){
      this.stageX = mouseX + this.offsetX
      this.stageY = mouseY + this.offsetY
      this.globalX = stageToGlobalX(this.stageX)
      this.globalY = stageToGlobalY(this.stageY)
    }

    if(this.resize){
      this.radius = dist(this.stageX,this.stageY,mouseX,mouseY)/globalScale
      //minimum size...
      if(this.radius<this.minRadius){
        this.radius = this.minRadius
      }
      //maximum size...
      if(this.radius>this.maxRadius){
        this.radius = this.maxRadius
      }
    }

    if(this.wirePull){
      this.wireExtensionX = mouseX
      this.wireExtensionY = mouseY
    }


    if(this.anglePicker){


      this.myTypes[this.angleIndex].angle = atan2(mouseY-this.stageY,mouseX-this.stageX)
      //keep this boolean true so root can stay colored while repositioning angle...
      //FIX: make sure other wireRoots can't get highlighted?
      this.myTypes[this.angleIndex].overWireRoot = true



      //MOVE OTHER WIRES OUT OF THE WAY AS THIS ONE MOVES...
      this.calculateAdjustment()




    }



    //calculate position of wire ends for each type/wire
    for(m=0;m<this.myTypes.length;m++){

    //update in case of dynamic update/bounceback...
    this.myTypes[m].update()

    this.myTypes[m].wireRootX = this.globalX + (.5*(this.myTypes[m].beadWidth+this.myTypes[m].beadStrokeWeight+this.perimThickness)+this.radius)*cos(this.myTypes[m].angle+this.myTypes[m].angleAdjustment)
    this.myTypes[m].wireRootY = this.globalY + (.5*(this.myTypes[m].beadWidth+this.myTypes[m].beadStrokeWeight+this.perimThickness)+this.radius)*sin(this.myTypes[m].angle+this.myTypes[m].angleAdjustment)
    
    this.myTypes[m].wireTipX = this.globalX + (this.myTypes[m].beadWidth+this.myTypes[m].wireHeight+this.radius)*cos(this.myTypes[m].angle+this.myTypes[m].angleAdjustment)
    this.myTypes[m].wireTipY = this.globalY + (this.myTypes[m].beadWidth+this.myTypes[m].wireHeight+this.radius)*sin(this.myTypes[m].angle+this.myTypes[m].angleAdjustment)


    }

  }

  //boolean for whether mouse is over specific type in predicate description...
  this.hoverOverDescription
  //ORDER OF OPERATIONS?
  this.display = function(){

    this.stageX = globalToStageX(this.globalX)
    this.stageY = globalToStageY(this.globalY)






    //draw predicate/shell

    //draw outer shelf if number of wires is nonzero (because we need to reference SOME beadwidth. Should this variable be at predicate level?!)
    if(this.myTypes.length>0){
      fill(150)
      noStroke()
      ellipse(this.stageX,this.stageY,2*(this.myTypes[0].beadWidth+this.myTypes[0].beadStrokeWeight+.5*this.perimThickness+this.radius)*globalScale,2*(this.myTypes[0].beadWidth+this.myTypes[0].beadStrokeWeight+.5*this.perimThickness+this.radius)*globalScale)
    }



    //Contextual menu...

    if(this.contextualMenu){


      noStroke()

      if(this.over0){
        fill(77,220,220)
      }else{
        fill(183,220,220)
      }
      arc(this.stageX,this.stageY,globalScale*2*this.contextualRadius,globalScale*2*this.contextualRadius,(-5*PI/6),(-PI/6))
      
      

      if(this.over1){
        fill(96,181,246)
      }else{
        fill(183,220,246)
      }
      arc(this.stageX,this.stageY,globalScale*2*this.contextualRadius,globalScale*2*this.contextualRadius,HALF_PI,(-5*PI/6))
      


      if(this.over2){
        fill(90,221,149)
      }else{
        fill(183,220,196)
      }
      arc(this.stageX,this.stageY,globalScale*2*this.contextualRadius,globalScale*2*this.contextualRadius,-PI/6,HALF_PI)

      stroke(242)
      strokeWeight(4*globalScale)
      line(this.stageX,this.stageY,this.stageX+globalScale*this.contextualRadius*cos(HALF_PI),this.stageY+globalScale*this.contextualRadius*sin(HALF_PI))
      line(this.stageX,this.stageY,this.stageX+globalScale*this.contextualRadius*cos(-PI/6),this.stageY+globalScale*this.contextualRadius*sin(-PI/6))
      line(this.stageX,this.stageY,this.stageX+globalScale*this.contextualRadius*cos(-5*PI/6),this.stageY+globalScale*this.contextualRadius*sin(-5*PI/6))

      stroke(0)
      noFill()
      strokeWeight(3*globalScale)
      ellipse(this.stageX,this.stageY,2*globalScale*this.contextualRadius,2*globalScale*this.contextualRadius)


    }












    //draw central part of predicate...
    strokeWeight(this.perimThickness*globalScale)

    if(this.edgeDetection){
      stroke(255,0,0)
    }else{
      stroke(0)
    }

    if(this.selected){
      fill(200)
    }else{
      fill(255)
    }
    ellipse(this.stageX,this.stageY,2*this.radius*globalScale,2*this.radius*globalScale)



















    if(this.wirePull){
      

      //FIX: This choice is used redundantly...
      //Choose graphic style...
      strokeWeight(this.wireWidth*globalScale)
      stroke(highlightColor[this.myTypes[this.pullIndex].whichType][0],highlightColor[this.myTypes[this.pullIndex].whichType][1],highlightColor[this.myTypes[this.pullIndex].whichType][2])
      noFill()




      //bezier control on output should grow as wire gets pulled further and further...
      //ramp aggressiveness of curve from 0 to 2 as distance of pull gets up to 100 pixels
      if(dist(globalToStageX(this.myTypes[this.pullIndex].wireTipX),globalToStageY(this.myTypes[this.pullIndex].wireTipY),mouseX,mouseY)>this.sniffingDistance*globalScale){
        this.outAggro = this.maxAggro
      }else{
        this.outAggro = map(dist(globalToStageX(this.myTypes[this.pullIndex].wireTipX),globalToStageY(this.myTypes[this.pullIndex].wireTipY),mouseX,mouseY),0,this.sniffingDistance,1,this.maxAggro)
      }

      this.outControlX = this.globalX + (this.outAggro*(this.myTypes[this.pullIndex].wireHeight+this.myTypes[this.pullIndex].beadWidth)+this.radius)*cos(this.myTypes[this.pullIndex].angle+this.myTypes[this.pullIndex].angleAdjustment)
      this.outControlY = this.globalY + (this.outAggro*(this.myTypes[this.pullIndex].wireHeight+this.myTypes[this.pullIndex].beadWidth)+this.radius)*sin(this.myTypes[this.pullIndex].angle+this.myTypes[this.pullIndex].angleAdjustment)

      //if wire extension is approaching potential linking opportunity, call sketch-level function to to get control point coordinates for wire bend...
      if(this.nearLinkPoint){
        bendToTarget()
      }else{
        this.inControlX = stageToGlobalX(this.wireExtensionX)
        this.inControlY = stageToGlobalY(this.wireExtensionY)
      }

      bezier(globalToStageX(this.myTypes[this.pullIndex].wireTipX),globalToStageY(this.myTypes[this.pullIndex].wireTipY),globalToStageX(this.outControlX),globalToStageY(this.outControlY),globalToStageX(this.inControlX),globalToStageY(this.inControlY),this.wireExtensionX,this.wireExtensionY)
      

      



      //end of wire being pulled
      noStroke()
      fill(255,0,255)
      ellipse(this.wireExtensionX,this.wireExtensionY,this.myTypes[this.pullIndex].tipWidth*globalScale,this.myTypes[this.pullIndex].tipWidth*globalScale)


    }





    if(!this.contextualMenu){
      //draw types/wires
      for(m=0;m<this.myTypes.length;m++){
        



        //create text description with highlight-able types...
        if(this.predicateDescription){
          noStroke()
          textSize(20*globalScale)



          this.hoverOverDescription = false
          if(this.overPredicate&&mouseY>(this.stageY-globalScale*20*((this.myTypes.length-1)/2)+m*20*globalScale)&&mouseY<(this.stageY-globalScale*20*((this.myTypes.length-1)/2)+(m+1)*20*globalScale)){
            this.hoverOverDescription = true
          }

          //highlight
          if(this.myTypes[m].overWireRoot||this.hoverOverDescription){
            fill(highlightColor[this.myTypes[m].whichType][0],highlightColor[this.myTypes[m].whichType][1],highlightColor[this.myTypes[m].whichType][2])
          }else{
            fill(0)
          }


          text("type",this.stageX,this.stageY-globalScale*20*((this.myTypes.length-1)/2)+m*20*globalScale)
        
        //make sure to cancel highlighting if predicate is too small for text... 
        }else{
          this.hoverOverDescription = false
        }






        //draw type wire

        strokeWeight(this.myTypes[m].wireWidth*globalScale)

        //highlight wire if (that type of wire is getting pulled) *OR* (if mouse is hovering over wireRoot) *OR* (if mouse is over corresponding text)
        if((typeHighlight&&this.myTypes[m].whichType==whichTypeHighlight)||this.myTypes[m].overWireRoot||this.hoverOverDescription){
          stroke(highlightColor[this.myTypes[m].whichType][0],highlightColor[this.myTypes[m].whichType][1],highlightColor[this.myTypes[m].whichType][2])
        }else{
          stroke(dullColor[this.myTypes[m].whichType][0],dullColor[this.myTypes[m].whichType][1],dullColor[this.myTypes[m].whichType][2])
        }
        
        line(globalToStageX(this.myTypes[m].wireRootX),globalToStageY(this.myTypes[m].wireRootY),globalToStageX(this.myTypes[m].wireTipX),globalToStageY(this.myTypes[m].wireTipY))



        //draw tip and root dots
        //KEEPING STROKE COLOR CHOICE FROM WIRE ABOVE...
        fill(255)
        strokeWeight(this.myTypes[m].beadStrokeWeight*globalScale)
        ellipse(globalToStageX(this.myTypes[m].wireRootX),globalToStageY(this.myTypes[m].wireRootY),this.myTypes[m].beadWidth*globalScale,this.myTypes[m].beadWidth*globalScale)

          
        noStroke()
        if(this.myTypes[m].overWireTip){
          fill(0,255,0)
        }else{
          fill(0)
        }
        ellipse(globalToStageX(this.myTypes[m].wireTipX),globalToStageY(this.myTypes[m].wireTipY),this.myTypes[m].tipWidth*globalScale,this.myTypes[m].tipWidth*globalScale)



        //ADD VARIABLE NUMBER TO EACH TYPE...

        noStroke()
        //highlight type variable if (that type of wire is getting pulled) *OR* (if mouse is hovering over wireRoot)
        if((typeHighlight&&this.myTypes[m].whichType==whichTypeHighlight)||this.myTypes[m].overWireRoot||this.hoverOverDescription){
          fill(highlightColor[this.myTypes[m].whichType][0],highlightColor[this.myTypes[m].whichType][1],highlightColor[this.myTypes[m].whichType][2])
        }else{
          fill(dullColor[this.myTypes[m].whichType][0],dullColor[this.myTypes[m].whichType][1],dullColor[this.myTypes[m].whichType][2])
        }
        textSize(15*globalScale)
        text(m+1,globalToStageX(this.myTypes[m].wireRootX),globalToStageY(this.myTypes[m].wireRootY))
      }

    }
  }


}










