function MakeType(angle,flavor) {

	
	this.angle = angle


	//offset angle to avoid overlap with other types...
	this.angleAdjustment = 0

	//which specific type
	this.whichType = flavor



	//Wire length
	this.wireHeight = 50
	//wire thickness
	this.wireWidth = 3
	//diameter of circles at root
	this.beadWidth = 20
	//diameter of circles at tip
	this.tipWidth = 10
	//thickness of stroke around beads
	this.beadStrokeWeight = 3

	//coordinates for wire geometry
	this.wireRootX
	this.wireRootY
	this.wireTipX
	this.wireTipY


	//mouse over wire root?
  	this.overWireRoot = false

  	//mouse over wire tip?
  	this.overWireTip = false

  	//direction of approach from wire getting repositioned...
  	this.CWapproach = false
  	this.CCWapproach = false

  	//parameters for easeing/bounceback of displaced wires
  	this.bounceBack = false
	//length of time for update to occur (milliseconds)
	this.duration = 175
	this.startTime
	this.endTime

	this.startAngle
	this.angleDelta


  	

	this.overMe = function() {

		//is mouse over wire tip?
		if(dist(mouseX,mouseY,globalToStageX(this.wireTipX),globalToStageY(this.wireTipY))<.5*this.tipWidth*globalScale){
			this.overWireTip = true
		}else{
			this.overWireTip = false
		}

		//is mouse over wire root? 
    	if(dist(mouseX,mouseY,globalToStageX(this.wireRootX),globalToStageY(this.wireRootY))<.5*(this.beadWidth+this.beadStrokeWeight)*globalScale){
      		this.overWireRoot = true
    	}else{
      		this.overWireRoot = false
    	}

	}


	this.update = function() {
		if(this.bounceBack){
			//cancel update if it's time
		    if(millis()>=this.endTime){
			    this.bounceBack = false
			    this.angleAdjustment = 0
			    this.CWapproach = this.CCWapproach = false
		    }

		    this.angleAdjustment = easeInOutCubic(millis()-this.startTime,this.startAngle,this.angleDelta,this.duration)
		}
	}

}










