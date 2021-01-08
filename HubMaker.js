function MakeHub(outPred,outType,inPred,inType,outAnchorX,outAnchorY,outControlX,outControlY,inControlX,inControlY,inAnchorX,inAnchorY,flavor) {


	//Initialize links as 2-point
	this.twoPointLink = true

	//what type/color this wrie is...
  	this.whichType = flavor

	//list of [Pred,Link] index pairs that are part of the equivalence class defined by this hub...
  	this.myMembers = [[outPred,outType],[inPred,inType]]



  	//list of anchor and control points for each member of this equivalence class...
  	//MUST BE MAINTAINED AND COORDINATED WITH myMembers LIST!...
  	this.myLinks = [[outAnchorX,outAnchorY,outControlX,outControlY],[inControlX,inControlY,inAnchorX,inAnchorY]]

	//calculates total separation between linking out point and linking in point...
	//(CALCULATED IN TERMS OF GLOBAL COORDINATES)
	this.tipToTipDistance
	//local variable for maximum curve bend...
	this.maxAggro

	//Function called when manipulating a predicate listed in myMembers...
	this.update = function(){

		//UNDERSTAND: ALL OF THE FOLLOWING PRESUMES TWO POINT LINK!!!
		this.tipToTipDistance = dist(this.myLinks[0][0],this.myLinks[0][1],this.myLinks[1][2],this.myLinks[1][3])

		if(this.tipToTipDistance<myPredicates[this.myMembers[0][0]].sniffingDistance){
			this.maxAggro = map(this.tipToTipDistance,flattenDistance,myPredicates[this.myMembers[0][0]].sniffingDistance,1,myPredicates[this.myMembers[0][0]].maxAggro)
			if(this.maxAggro<1){
				this.maxAggro = 1
			}
		}else{
			this.maxAggro = myPredicates[this.myMembers[0][0]].maxAggro
		}

		//update outbound x,y coords...
		this.myLinks[0][0] = myPredicates[this.myMembers[0][0]].myTypes[this.myMembers[0][1]].wireTipX
		this.myLinks[0][1] = myPredicates[this.myMembers[0][0]].myTypes[this.myMembers[0][1]].wireTipY

		//calculate outbound control points...
		this.myLinks[0][2] = stageToGlobalX(myPredicates[this.myMembers[0][0]].stageX + globalScale*(this.maxAggro*(myPredicates[this.myMembers[0][0]].myTypes[this.myMembers[0][1]].wireHeight+myPredicates[this.myMembers[0][0]].myTypes[this.myMembers[0][1]].beadWidth)+myPredicates[this.myMembers[0][0]].radius)*cos(myPredicates[this.myMembers[0][0]].myTypes[this.myMembers[0][1]].angle+myPredicates[this.myMembers[0][0]].myTypes[this.myMembers[0][1]].angleAdjustment))
		this.myLinks[0][3] = stageToGlobalY(myPredicates[this.myMembers[0][0]].stageY + globalScale*(this.maxAggro*(myPredicates[this.myMembers[0][0]].myTypes[this.myMembers[0][1]].wireHeight+myPredicates[this.myMembers[0][0]].myTypes[this.myMembers[0][1]].beadWidth)+myPredicates[this.myMembers[0][0]].radius)*sin(myPredicates[this.myMembers[0][0]].myTypes[this.myMembers[0][1]].angle+myPredicates[this.myMembers[0][0]].myTypes[this.myMembers[0][1]].angleAdjustment))

		//calculate inbound control points...
		this.myLinks[1][0] = stageToGlobalX(myPredicates[this.myMembers[1][0]].stageX + globalScale*(this.maxAggro*(myPredicates[this.myMembers[1][0]].myTypes[this.myMembers[1][1]].wireHeight+myPredicates[this.myMembers[1][0]].myTypes[this.myMembers[1][1]].beadWidth)+myPredicates[this.myMembers[1][0]].radius)*cos(myPredicates[this.myMembers[1][0]].myTypes[this.myMembers[1][1]].angle+myPredicates[this.myMembers[1][0]].myTypes[this.myMembers[1][1]].angleAdjustment))
		this.myLinks[1][1] = stageToGlobalY(myPredicates[this.myMembers[1][0]].stageY + globalScale*(this.maxAggro*(myPredicates[this.myMembers[1][0]].myTypes[this.myMembers[1][1]].wireHeight+myPredicates[this.myMembers[1][0]].myTypes[this.myMembers[1][1]].beadWidth)+myPredicates[this.myMembers[1][0]].radius)*sin(myPredicates[this.myMembers[1][0]].myTypes[this.myMembers[1][1]].angle+myPredicates[this.myMembers[1][0]].myTypes[this.myMembers[1][1]].angleAdjustment))
		

		//update inbound x,y coords...
		this.myLinks[1][2] = myPredicates[this.myMembers[1][0]].myTypes[this.myMembers[1][1]].wireTipX
		this.myLinks[1][3] = myPredicates[this.myMembers[1][0]].myTypes[this.myMembers[1][1]].wireTipY


	}


	this.display = function(index){

		if(this.twoPointLink){

			noFill()

			//highlight wire if it's a type being pulled or if the mouse is hovering over it...

			strokeWeight(myPredicates[this.myMembers[0][0]].wireWidth*globalScale)

			if((typeHighlight&&this.whichType==whichTypeHighlight)||((minBezPointSoFar<10)&&(index==nearestWireIndex))){
				stroke(highlightColor[this.whichType][0],highlightColor[this.whichType][1],highlightColor[flavor][2])
			}else{
				stroke(dullColor[this.whichType][0],dullColor[this.whichType][1],dullColor[this.whichType][2])
			}

			bezier(globalToStageX(this.myLinks[0][0]),globalToStageY(this.myLinks[0][1]),globalToStageX(this.myLinks[0][2]),globalToStageY(this.myLinks[0][3]),globalToStageX(this.myLinks[1][0]),globalToStageY(this.myLinks[1][1]),globalToStageX(this.myLinks[1][2]),globalToStageY(this.myLinks[1][3]))

		}






	}
}










