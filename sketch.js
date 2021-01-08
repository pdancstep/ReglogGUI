//list of "active" predicates on canvas
var myPredicates = []

//collection of hubs
var myHubs = []

//List of prefab contexts for debugging...
var myContext1 = [6,6,6,6]
var myContext2 = [6,6,6]
var myContext3 = [6,6]
var myContext4 = [6,6,5,2,1]

//stage coordinates of global coordinates origin...
var currentZeroX = 0
var currentZeroY = 0

var globalScale = 1


//boolean for dragging screen around
var panning = false
var panningOffsetX
var panningOffsetY

//boolean for slider adjustment
var zooming = false
var zoomRefX
var zoomRefY

//scale of maximum zoom out
var zoomLowerBound = .5

//an inventory of selected/unselected predicates allows selections to toggle on and off while selection rectangle is being adjusted...
var selectedPredicates = []
var unselectedPredicates = []

//highglighted colors for types
var highlightColor =  [ 
	[215,116,103],
	[215,116,211],
	[136,117,211],
	[0,94,211],
	[0,151,195],
	[0,255,197],
	[0,255,113],
	[0,212,0]
	] 

//unhighlighted colors for types
var dullColor = [
	[91,46,80],
	[91,46,123],
	[60,47,123],
	[6,38,123],
	[5,60,117],
	[5,102,118],
	[5,102,84],
	[5,85,39]
	] 


//x coordinate of left edge of predicate menu
var menuBreak = 850
//x coordinate of right edge of zoom slider
var zoomBreak = 125
//x,y coordinates for center of zoom (initailize inside setup())
var zoomCenterX
var zoomCenterY

function setup() {
	createCanvas(1200,800)

	instructionsImage = loadImage('InstructionScreen.jpg')

	mySlider = new MakeSlider(75,75,650,.75)
  	//initialize global scale...
  	globalScale = map(mySlider.dragDistance,0,mySlider.dragLimit,3,zoomLowerBound)


  	//
	//myPredicates.push(new MakePredicate(300,200,myContext1))
	//myPredicates.push(new MakePredicate(700,200,myContext2))
	//myPredicates.push(new MakePredicate(300,600,myContext3))
	//myPredicates.push(new MakePredicate(700,600,myContext4))


	//width of menu (300) gets referenced twice in this definition...
  	myPredMenu = new MakePredMenu(menuBreak+(width-menuBreak-300)/2,75,300,580)


  	zoomCenterX = zoomBreak+(menuBreak-zoomBreak)/2
  	zoomCenterY = height/2

	textAlign(CENTER,CENTER)
}

//debugging variable
var indicator = 100

//boolean for selecting multiple predicates...
var shiftSelect = false

//global variable to ensure that only one predicate at a time is getting dragged...
var topPredicateActive = false
//global variable for highlighting wire type being pulled
var typeHighlight = false
//specific type being highlighted
var whichTypeHighlight

//indices for which predicate/type is having wire pulled (link out), and which predicate is being linked to (link in)...

var linkInPredIndex = 0
var linkInTypeIndex = 0

var linkOutPredIndex = 0
var linkOutTypeIndex = 0
//use to only sniff out linking opportunities of the same type
var linkOutTypeFlavor




//size of grid square
var gridSpace = 16




//boolean for when mouse is over a link
var overWire = false



//double tap reference (sketch level)
var tappedOnce = false
var currentTime
var doubleTapTimer = 300


//boolean to prevent wire detection when a given wire is getting pulled
var arrestOverLink = false



//general duration for transitions, milliseconds
var duration = 300


//coordinates of the center-of-mass of several predicates...
var COMx
var COMy
//total for averaging purposes
var totalPredicates

//coordinates of the center of the bounding box for a cluster of predicates...
var clusterCenterX
var clusterCenterY

//bounding box side positions for selected predicates
var boundaryTop
var boundaryBottom
var boundaryRight
var boundaryLeft



//TOP LEVEL LOOP...

function draw() {
	//background(indicator)


	//clear double tap timer if too much time has gone by...
	if(tappedOnce){
      if((millis()-currentTime)>doubleTapTimer){
        tappedOnce=false
      }
    }

    //if auto-zooming onto a predicate cluster
    if(homeTransition){
    	//cancel zoom, if it's time...
    	if(millis()>=endTime){
    		homeTransition = false

    		//change slider scale
	        if(globalScale<zoomLowerBound){
	        	zoomLowerBound = globalScale
		    }

		    //reposition slider head
		    mySlider.newY = map(globalScale,3,zoomLowerBound,0,mySlider.dragLimit)

    	}else{
    		currentZeroX = easeInOutCubic(millis()-startTime,sourceX,distanceX,duration)
    		currentZeroY = easeInOutCubic(millis()-startTime,sourceY,distanceY,duration)
    		globalScale = easeInOutCubic(millis()-startTime,sourceScale,scaleDelta,duration)
    	}
    }



    //manual zooming
	if(zooming){
		currentZeroX = globalScale*zoomRefX+zoomCenterX
		currentZeroY = globalScale*zoomRefY+zoomCenterY
	} 


	if(panning){
		currentZeroX = mouseX + panningOffsetX
		currentZeroY = mouseY + panningOffsetY
	}

	drawGrid()


	//assume no wire pull...
	arrestOverLink = false
	for(i=0;i<myPredicates.length;i++){
		//let each predicate sense the mouse, update its form...
		myPredicates[i].overMe()
		myPredicates[i].update()
		//prevent wire selection during wire pull
		if(myPredicates[i].wirePull){
			arrestOverLink = true
		}
	}


	//run through all existing links to determine if any are under the mouse, (unless a wire pull is happening)
	if(!arrestOverLink){
		overLink()
	}


	//update hubs...
	for(z=0;z<myPredicates.length;z++){
		//if predicate is getting manipulated in some way... 
		if(myPredicates[z].dragging||myPredicates[z].resize||myPredicates[z].anglePicker){
			//look at each hub...
			for(w=0;w<myHubs.length;w++){
				//and each list of "members" of that hub...
				for(u=0;u<(myHubs[w].myMembers.length);u++){
					//and for each instance that the manipulated predicate is listed as a member of that hub...
					if(z==myHubs[w].myMembers[u][0]){
						//updated bezier points for the associated type wire...
						myHubs[w].update()
					}
				}
			}
		}
	}



	//display links
	for(i=0;i<myHubs.length;i++){
		//feed hubs its own index so it can check whether or not it is nearest the mouse...
		myHubs[i].display(i)
	}

	for(i=0;i<myPredicates.length;i++){
		myPredicates[i].display()
	}

	//If we're drawing a selection rectangle on the canvas...
	if(selectionRectangle){

		//draw rectangle
		noStroke()
		fill(150,150)
		rectMode(CORNERS)
		rect(selectionRectangleX,selectionRectangleY,mouseX,mouseY)

		//look through unselected predicates for possible selections...
		for(i=0;i<unselectedPredicates.length;i++){
			unselectedPredicates[i].unselectedInRectangle()
		}
		//look through selected predicates for possible unselections...
		for(i=0;i<selectedPredicates.length;i++){
			selectedPredicates[i].selectedInRectangle()
		}


	}

	//make backdrop for slider
	noStroke()
	fill(62)
	rect(0,0,125,height)

	mySlider.dragSlider()
	mySlider.display()

	myPredMenu.update()
	myPredMenu.display()

	if(instructions){
		image(instructionsImage,0,0,1200,800)
	}

}






//Boolean that's true during zoom
var homeTransition = false

//variables for some vector arithmetic to figure out new position/scale
var originClusterOffset
var originClusterAngle

var newRefPointX
var newRefPointY

//proportional adjustment to scale
var newScaleFactor

//width and height of bounding box...
var horizontalSpan
var verticalSpan


//variables for transition zoom...
var startTime
var endTime
var sourceX
var sourceY
var sourceScale
var distanceX
var distanceY
var scaleDelta


//KEY FUNCTIONS...

function keyPressed(){
	if(keyCode === SHIFT){
		shiftSelect = true
	}

	//press 'h' for home
	if(keyCode === 72){

		//find bounding box and center point 
		findBoundingBox()

		//calculate target transformation
		horizontalSpan = boundaryRight-boundaryLeft+(3*(biggestRadius+50)*globalScale)
		verticalSpan = boundaryBottom-boundaryTop+(3*(biggestRadius+50)*globalScale)

		if(horizontalSpan>verticalSpan){
			newScaleFactor = (menuBreak-zoomBreak)/horizontalSpan
		}else{
			newScaleFactor = 800/verticalSpan
		}
		//cap zoom in at globalScale = 3
		if(globalScale*newScaleFactor>3){
			newScaleFactor = 3/globalScale
		}

		originClusterOffset = dist(currentZeroX,currentZeroY,clusterCenterX,clusterCenterY)
		originClusterAngle = atan2(clusterCenterY-currentZeroY,clusterCenterX-currentZeroX)

		newRefPointX = currentZeroX + newScaleFactor*originClusterOffset*cos(originClusterAngle)
		newRefPointY = currentZeroY + newScaleFactor*originClusterOffset*sin(originClusterAngle)



		//turn on transition...
		homeTransition = true
		startTime = millis()
		endTime = millis() + duration
		sourceX = currentZeroX
		sourceY = currentZeroY
		sourceScale = globalScale
		distanceX = zoomCenterX-newRefPointX
		distanceY = zoomCenterY-newRefPointY
		scaleDelta = globalScale*(newScaleFactor-1)




	}


	//Deleting predicates
	if(keyCode === 8){
		for(i=0;i<myPredicates.length;i++){
			if(myPredicates[i].selected){

				//delete all existing wires associated with that predicate

				for(j=0;j<myHubs.length;j++){
					if(myHubs[j].myMembers[0][0]==i||myHubs[j].myMembers[1][0]==i){
						//delete link	
						myHubs.splice(j,1)
						//step back counter
						j -= 1
					}
				}

				//Keep myHubs list coordinated with myPredicates...
				//loop through all remaining hubs and decriment any myMembers indices that are greater than the current value of i
				for(j=0;j<myHubs.length;j++){
					if(myHubs[j].myMembers[0][0]>i){
						myHubs[j].myMembers[0][0]--
					}
					if(myHubs[j].myMembers[1][0]>i){
						myHubs[j].myMembers[1][0]--
					}
				}


				//delete predicate
				myPredicates.splice(i,1)
				//step back counter
				i -= 1

			}
		}

		//empty selection arrays so things don't go haywire if "home" key is pressed next
		updateSelectionArrays()

	}
}

function keyReleased(){
	shiftSelect = false
}










//MOUSECLICK FUNCTIONS...

//boolean for clearing all other selections except the one being made...
var clearSelected = false
//boolean for if click misses all predicates
var canvasClick = false
//boolean for selection rectangle...
var selectionRectangle = false
var selectionRectangleX
var selectionRectangleY


//prevent panning if click is manipulating predicate...
var arrestPanning = false

//boolean that triggers the deselection of all predicates if there is a canvas click that doesn't turn into a pan...
var canvasClickDeselect

var instructions = false
var instructionsSwitch = false

function touchStarted(){

	if(instructions){
		instructionsSwitch = true
	}else{
		if(!instructions){
			if(mouseX>875&&mouseX<1175&&mouseY>665&&mouseY<730){
				instructions = true
			}
		}
	}
	if(instructionsSwitch){
		instructions = false
		instructionsSwitch = false
	}

	//if click is inside left and right margins
	if(mouseX>zoomBreak&&mouseX<menuBreak){


		//Update arrays of which predicates are selected/unselected
		updateSelectionArrays()


		//manage double click to erase wires
		if(tappedOnce&&overWire){
	  		myHubs.splice(nearestWireIndex,1)
		}

		if(!tappedOnce&&overWire){
	  		tappedOnce = true
	  		currentTime = millis()
		}





		//figure out if click is on a predicate or on the canvas...	
		//assume click is on canvas...
		canvasClick = true
		//then try to falsify assumtion...
		for(i=0;i<myPredicates.length;i++){
			if(myPredicates[i].contextualMenu){
				if(myPredicates[i].over0||myPredicates[i].over1||myPredicates[i].over2){
					canvasClick = false
				}
			}
			if(myPredicates[i].overPredicate){
				canvasClick = false
			}
		}





		//let each predicate react to the click...
		//NOTE: This FIRST run through of the predicates indicates whether a predicate is getting manipulated...
		//count DOWN in order to get topmost predicate for dragging...
		for(i=(myPredicates.length-1);i>=0;i--){
			myPredicates[i].clickMe()



			//if clickMe() calls for clearing all other selected predicates...
			if(clearSelected){
				for(j=0;j<myPredicates.length;j++){
					if(i!=j){
						myPredicates[j].selected = false
						myPredicates[j].dragging = false
					}
				}
			}
			//turn of call to clear selections...
			clearSelected = false

		}

		//if click is on canvas...
		if(canvasClick){
			//open up the possibility of deselecting all predicates...
			canvasClickDeselect = true
			//if shift is down, begin rectangle selection...
			if(shiftSelect){
				//cancel general deselection
				canvasClickDeselect = false

				//initialize rectangle...
				selectionRectangle = true
				selectionRectangleX = mouseX
				selectionRectangleY = mouseY


			//if shift is NOT down, make canvasclick turn on pan, as long as slider isn't getting dragged...
			}else{

				arrestPanning = false
				for(i=0;i<myPredicates.length;i++){
					if(myPredicates[i].resize||myPredicates[i].anglePicker||myPredicates[i].wirePull){
						arrestPanning = true
					}
				}

				if(!arrestPanning&&!mySlider.dragging){
					panning = true
					panningOffsetX = currentZeroX-mouseX
		      		panningOffsetY = currentZeroY-mouseY
		      	}
			   
			}

			//NOTE: This SECOND runthrough of the predicates arrests the dragging of selected predicates if predicate is getting manipulated.
			//Give this instance its own index so it can check whether pulled wire is part of existing hub...
			for(i=(myPredicates.length-1);i>=0;i--){
				myPredicates[i].clickMe(i)
			}
		}


	//if mouse is not directly over canvas...
	}else{


		//adjust zoom
		mySlider.clickMe()
		//if slider is getting dragged, set reference zoome for scaling
		if(mySlider.dragging){
			zoomRefX = (currentZeroX - zoomCenterX)/globalScale
	      	zoomRefY = (currentZeroY - zoomCenterY)/globalScale
	      	zooming = true
		}

		myPredMenu.mySlider.clickMe()
		myPredMenu.clickMe()


		
	}
}





function touchMoved(){

	//cancel deselect if panning is executed or predicate is being manipulated...
	if(panning||arrestPanning){
		canvasClickDeselect = false
	}


	if(mySlider.dragging){
		globalScale = map(mySlider.dragDistance,0,mySlider.dragLimit,3,zoomLowerBound)
	}


	for(z=0;z<myPredicates.length;z++){


		//if predicate has wire being pulled, check its proximity to available connection opportunities...
		findNearestPoint(z)


	}

	return false
}

function touchEnded() {

	if(canvasClickDeselect){
		for(i=0;i<myPredicates.length;i++){
			myPredicates[i].selected = false
			myPredicates[i].dragging = false
		}
	}
	canvasClickDeselect = false

	mySlider.dragging = false;
	panning = false
	zooming = false



	for(i=0;i<myPredMenu.myPredMenuItems.length;i++){

  		//if predicate is dropped inside circle, add new predicate to canvas
  		if(myPredMenu.myPredMenuItems[i].dragging){
  			if(myPredMenu.myPredMenuItems[i].x>zoomBreak&&myPredMenu.myPredMenuItems[i].x<menuBreak){
  				
  				myPredicates.push(new MakePredicate(myPredMenu.myPredMenuItems[i].x,myPredMenu.myPredMenuItems[i].y,myPredMenu.myPredMenuItems[i].myTypes))
  			}
  		}


  		//clear everything
		myPredMenu.myPredMenuItems[i].dragging = false
		myPredMenu.myPredMenuItems[i].resetToMenu()
	}


	myPredMenu.mySlider.dragging = false


	if(selectionRectangle){
		for(i=0;i<myPredicates.length;i++){
			if(myPredicates[i].selected){
				myPredicates[i].dragging = true
			}
		}
	}
	selectionRectangle = false



	updateSelectionArrays()



	for(i=0;i<myPredicates.length;i++){

		//make link if pulled wire is dropped on target wire...
		finalizeLink(i)

		//permanently adopt any wire offets based on angle updates...
		myPredicates[i].resetWires()

		//falsify everything inside predicate...
		myPredicates[i].dragging = false
		myPredicates[i].resize = false
		myPredicates[i].anglePicker = false
		myPredicates[i].wirePull = false
		myPredicates[i].nearLinkPoint = false
	}


	//falsify all touch-based global variables...
	topPredicateActive = false
	typeHighlight = false
	arrestPanning = false
	canvasClick=false

}










//SYSTEM CALCULATORY FUNCTIONS...

//easing; t = current time, b = start position, c = distance to move, d = duration of move
function easeInOutCubic(t,b,c,d){
		if((t/=d/2)<1) return c/2*t*t*t + b;
		return c/2*((t-=2)*t*t + 2) + b;
}

//parametric bezier curve (cubic) (a,b,c,d are x coords only or y coords only)
function paramBez(t,a,b,c,d){
	return (1-t)*(1-t)*(1-t)*a+3*(1-t)*(1-t)*t*b+3*(1-t)*t*t*c+t*t*t*d
}

//finds nearest point on bezier curve to mouse position...
//a-h represents standard arguments to bezier function
function nearestBezPoint(iter,a,b,c,d,e,f,g,h){

	lowerParam = 0
	upperParam = 1

	refineAmount = .5

	for(s=0;s<iter;s++){
	
		lowerDist = dist(paramBez(lowerParam,a,c,e,g),paramBez(lowerParam,b,d,f,h),mouseX,mouseY)
		upperDist = dist(paramBez(upperParam,a,c,e,g),paramBez(upperParam,b,d,f,h),mouseX,mouseY)

		if(upperDist<lowerDist){
			lowerParam += refineAmount
		}else{
			upperParam -= refineAmount
		}

		refineAmount *= .5

	}

	lowerDist = dist(paramBez(lowerParam,a,c,e,g),paramBez(lowerParam,b,d,f,h),mouseX,mouseY)
	upperDist = dist(paramBez(upperParam,a,c,e,g),paramBez(upperParam,b,d,f,h),mouseX,mouseY)

	if(upperDist<lowerDist){
		return upperParam
	}else{
		return lowerParam
	}
}

//takes x coordinate from stage and returns unit-scale global x position
function stageToGlobalX(xCoordIn){
	return (xCoordIn-currentZeroX)/(globalScale)
}
//takes y coordinate from stage and returns unit-scale global y position
function stageToGlobalY(yCoordIn){
	return (yCoordIn-currentZeroY)/(globalScale)
}

//takes x position from unit global position and returns stage x-coordinate
function globalToStageX(xCoordIn){
	return (xCoordIn*globalScale)+currentZeroX
}
//takes y position from unit global position and returns stage y-coordinate
function globalToStageY(yCoordIn){
	return (yCoordIn*globalScale)+currentZeroY
}

//TEMPORARY?
//Random Context Array generator...
var numMenuItems
var numTypesForContext
var myContexts = []

function makeContexts(){
	numMenuItems = ceil(random(3,15))
	for(i=0;i<numMenuItems;i++){
		myContexts[i]=[]
		numTypesForContext = ceil(random(0,10))
		for(j=0;j<numTypesForContext;j++){
				myContexts[i][j]=(floor(random(0,8)))
			}
		}
}












//keeps track of largest predicate radius as reference for how much to zoom
var biggestRadius




//AUTO ZOOM / "HOME" FUNCTIONS...

//function locates the center point of a cluster of predicates and the size of the bounding box
function findBoundingBox() {
	

	//first locate center-of-mass, as starting location for boundary box sides... 
	COMx = 0
	COMy = 0
	totalPredicates = 0
	biggestRadius = 0

	//If no predicates are selected find bound box for all predicates...
	if(selectedPredicates.length==0){


		for(i=0;i<myPredicates.length;i++){

			COMx += myPredicates[i].stageX
			COMy += myPredicates[i].stageY
			totalPredicates++
			
		}

		COMx = COMx/totalPredicates
		boundaryLeft = boundaryRight = COMx
		COMy = COMy/totalPredicates
		boundaryTop = boundaryBottom = COMy
		

		//go through predicates, expanding bounding box as necessary...
		for(i=0;i<myPredicates.length;i++){

			//keep track of biggest radius
			if(myPredicates[i].radius>biggestRadius){
				biggestRadius = myPredicates[i].radius
			}

			//expand bounding box if needed
			if(myPredicates[i].stageX<boundaryLeft){
				boundaryLeft = myPredicates[i].stageX
			}
			if(myPredicates[i].stageX>boundaryRight){
				boundaryRight = myPredicates[i].stageX
			}
			if(myPredicates[i].stageY<boundaryTop){
				boundaryTop = myPredicates[i].stageY
			}
			if(myPredicates[i].stageY>boundaryBottom){
				boundaryBottom = myPredicates[i].stageY
			}
			
		}


	//Otherwise find bounding box only for selected predicates...
	}else{


		for(i=0;i<myPredicates.length;i++){
			if(myPredicates[i].selected){
				COMx += myPredicates[i].stageX
				COMy += myPredicates[i].stageY
				totalPredicates++
			}
		}

		COMx = COMx/totalPredicates
		boundaryLeft = boundaryRight = COMx
		COMy = COMy/totalPredicates
		boundaryTop = boundaryBottom = COMy
		

		//go through predicates, expanding bounding box as necessary...
		for(i=0;i<myPredicates.length;i++){
			if(myPredicates[i].selected){



				//keep track of biggest radius
				if(myPredicates[i].radius>biggestRadius){
					biggestRadius = myPredicates[i].radius
				}



				//expand bounding box if needed
				if(myPredicates[i].stageX<boundaryLeft){
					boundaryLeft = myPredicates[i].stageX
				}
				if(myPredicates[i].stageX>boundaryRight){
					boundaryRight = myPredicates[i].stageX
				}
				if(myPredicates[i].stageY<boundaryTop){
					boundaryTop = myPredicates[i].stageY
				}
				if(myPredicates[i].stageY>boundaryBottom){
					boundaryBottom = myPredicates[i].stageY
				}
			}
		}

	}



	//find center of bounding box
	clusterCenterX = (boundaryRight+boundaryLeft)/2
	clusterCenterY = (boundaryBottom+boundaryTop)/2

//Debugging visual for bounding box, cluster center...
/*
	fill(255,0,0)
	ellipse(clusterCenterX,clusterCenterY,20,20)
	stroke(0,0,255)
	noFill()
	rectMode(CORNERS)
	rect(boundaryLeft-(150*globalScale),boundaryTop-(150*globalScale),boundaryRight+(150*globalScale),boundaryBottom+(150*globalScale))
*/
}









//TOP LEVEL GRAPHIC FUNCTIONS...

//offsets from current (0,0) position to begin drawing grid lines
var gridStartOffsetX
var gridStartOffsetY
//adaptively draw gridpaper on board
function drawGrid() {

	//background(indicator)

	background(242)


	strokeWeight(1)
	stroke(207)


	gridStartOffsetX = floor(-currentZeroX/(gridSpace*globalScale))
	gridStartOffsetY = floor(-currentZeroY/(gridSpace*globalScale))
	
	push()

		translate(currentZeroX,currentZeroY)
		scale(globalScale)

	    

		for(a=0;a<ceil(width/(gridSpace*globalScale))+1;a++){
			line((gridStartOffsetX+a)*gridSpace,-currentZeroY/globalScale,(gridStartOffsetX+a)*gridSpace,(height-currentZeroY)/globalScale)
		}

	    for(a=0;a<ceil(height/(gridSpace*globalScale))+1;a++){
			line(-currentZeroX/globalScale,(gridStartOffsetY+a)*gridSpace,(width-currentZeroX)/globalScale,(gridStartOffsetY+a)*gridSpace)
	    }



	pop()

}




//PREDICATE MANAGEMENT FUNCTIONS...

function updateSelectionArrays() {
	//empty arrays
	unselectedPredicates.splice(0,unselectedPredicates.length)
	selectedPredicates.splice(0,selectedPredicates.length)
	//then refill arrays
	for(i=0;i<myPredicates.length;i++){
		//add unselected predicates to a "unselected" array...
		if(!myPredicates[i].selected){
			unselectedPredicates.push(myPredicates[i])
		//turn off dragging on all currently selected predicates, and add each to "selected" array...
		}else{
			myPredicates[i].dragging = false
			selectedPredicates.push(myPredicates[i])
		}
	}
}








//WIRE MANAGEMENT FUNCTIONS...


//FUNCTION CONTINUOUSLY UPDATES FOLLOWING FOUR PARAMETERS: 
	//1. Boolean for whether or not there is nearby linking point
		//if yes...
	//2. Index for predicate of nearest linking point...
	//3. Index for nearest type on that predicate...
	//4. Total distance from outbound tip to linking tip 

//keeps track of minimum distance to another wire so far discovered...
var closestPointSoFar = 0
//calculates total separation between linking out point and linking in point...
//(CALCULATED IN GLOBAL COORDINATES)
var tipToTipDistance

function findNearestPoint(pred){

	if(myPredicates[pred].wirePull){
		//mark this as "linking out" predicate/type under consideration
		linkOutPredIndex = pred
		linkOutTypeIndex = myPredicates[pred].pullIndex
		linkOutTypeFlavor = myPredicates[pred].myTypes[myPredicates[pred].pullIndex].whichType


		//set "closest" to start at 100 pixels...
		closestPointSoFar = myPredicates[pred].sniffingDistance

		//default to "no near neighbor" before running check...
		myPredicates[pred].nearLinkPoint = false
		//look for closest potential type to link to
		for(j=0;j<myPredicates.length;j++){
			//look at each of the predicates wires...
			for(k=0;k<myPredicates[j].myTypes.length;k++){

				//prevent a type linking to itself...
				if(j!=pred||(j==pred&&k!=linkOutTypeIndex)){
					//prevent linking between unlike types...
					if(linkOutTypeFlavor==myPredicates[j].myTypes[k].whichType){

						if(dist(globalToStageX(myPredicates[j].myTypes[k].wireTipX),globalToStageY(myPredicates[j].myTypes[k].wireTipY),
							myPredicates[pred].wireExtensionX,myPredicates[pred].wireExtensionY)<closestPointSoFar*globalScale){
							
							closestPointSoFar = dist(globalToStageX(myPredicates[j].myTypes[k].wireTipX),globalToStageY(myPredicates[j].myTypes[k].wireTipY),
							myPredicates[pred].wireExtensionX,myPredicates[pred].wireExtensionY)

							myPredicates[pred].nearLinkPoint = true
							//which predicate are we linking into?
							linkInPredIndex = j
							//which type on that predicate?
							linkInTypeIndex = k
							//how far apart are the wireTips being linked (referenced to determine bend of bezier)
							tipToTipDistance = dist(myPredicates[linkOutPredIndex].myTypes[linkOutTypeIndex].wireTipX,
								myPredicates[linkOutPredIndex].myTypes[linkOutTypeIndex].wireTipY,
								myPredicates[linkInPredIndex].myTypes[linkInTypeIndex].wireTipX,
								myPredicates[linkInPredIndex].myTypes[linkInTypeIndex].wireTipY
								)


						}
					}
				}
			}			
		}
	}
}




//holds x,y coords of final control point, which will be interpolated towards as mouse draws near target
var targetInControlX
var targetInControlY

//minimum separation for bend to flatten
var flattenDistance = 25

function bendToTarget(){

	//if linking tips are really close together...
	if(tipToTipDistance<myPredicates[linkInPredIndex].sniffingDistance){
		//reduce aggressiveness of input bezier control...
		myPredicates[linkOutPredIndex].inAggro = map(tipToTipDistance,flattenDistance,myPredicates[i].sniffingDistance,1,myPredicates[linkInPredIndex].maxAggro)
		//making sure not to go below 1...
		if(myPredicates[linkOutPredIndex].inAggro<1){
			myPredicates[linkOutPredIndex].inAggro=1
		}
	}else{
		//otherwise go with full aggressiveness
		myPredicates[linkOutPredIndex].inAggro = myPredicates[linkInPredIndex].maxAggro
	}


	targetInControlX = myPredicates[linkInPredIndex].globalX + ((myPredicates[linkOutPredIndex].inAggro*(myPredicates[linkInPredIndex].myTypes[linkInTypeIndex].wireHeight+myPredicates[linkInPredIndex].myTypes[linkInTypeIndex].beadWidth)+myPredicates[linkInPredIndex].radius)*cos(myPredicates[linkInPredIndex].myTypes[linkInTypeIndex].angle))
	targetInControlY = myPredicates[linkInPredIndex].globalY + ((myPredicates[linkOutPredIndex].inAggro*(myPredicates[linkInPredIndex].myTypes[linkInTypeIndex].wireHeight+myPredicates[linkInPredIndex].myTypes[linkInTypeIndex].beadWidth)+myPredicates[linkInPredIndex].radius)*sin(myPredicates[linkInPredIndex].myTypes[linkInTypeIndex].angle))


	myPredicates[linkOutPredIndex].inControlX = map(closestPointSoFar,myPredicates[linkOutPredIndex].sniffingDistance,0,stageToGlobalX(myPredicates[linkOutPredIndex].wireExtensionX),targetInControlX)
	myPredicates[linkOutPredIndex].inControlY = map(closestPointSoFar,myPredicates[linkOutPredIndex].sniffingDistance,0,stageToGlobalY(myPredicates[linkOutPredIndex].wireExtensionY),targetInControlY)


}





//function which checks if mouse is over exisitng bezier link

var lowerParam
var lowerDist

var upperParam
var upperDist

var refineAmount
//parameter for nearest point to mouse on bezier curve
var nearBezPointParam
//minimum distance for extended wire to sniff nearest bezier point..
var minBezPointSoFar
//index of nearest bezier wire
var nearestWireIndex

//FIX: this overlink function is only defined for two-point links!!!
function overLink(){

	//set initial minimum to 100
	minBezPointSoFar = 100

	for(t=0;t<myHubs.length;t++){
		//find nearest parameter value on given hub...
		nearBezPointParam = nearestBezPoint(10,globalToStageX(myHubs[t].myLinks[0][0]),globalToStageY(myHubs[t].myLinks[0][1]),globalToStageX(myHubs[t].myLinks[0][2]),globalToStageY(myHubs[t].myLinks[0][3]),globalToStageX(myHubs[t].myLinks[1][0]),globalToStageY(myHubs[t].myLinks[1][1]),globalToStageX(myHubs[t].myLinks[1][2]),globalToStageY(myHubs[t].myLinks[1][3]))
		//update latest minimum...
		
		if(dist(paramBez(nearBezPointParam,globalToStageX(myHubs[t].myLinks[0][0]),globalToStageX(myHubs[t].myLinks[0][2]),globalToStageX(myHubs[t].myLinks[1][0]),globalToStageX(myHubs[t].myLinks[1][2])),paramBez(nearBezPointParam,globalToStageY(myHubs[t].myLinks[0][1]),globalToStageY(myHubs[t].myLinks[0][3]),globalToStageY(myHubs[t].myLinks[1][1]),globalToStageY(myHubs[t].myLinks[1][3])),mouseX,mouseY)<minBezPointSoFar){

			minBezPointSoFar = dist(paramBez(nearBezPointParam,globalToStageX(myHubs[t].myLinks[0][0]),globalToStageX(myHubs[t].myLinks[0][2]),globalToStageX(myHubs[t].myLinks[1][0]),globalToStageX(myHubs[t].myLinks[1][2])),paramBez(nearBezPointParam,globalToStageY(myHubs[t].myLinks[0][1]),globalToStageY(myHubs[t].myLinks[0][3]),globalToStageY(myHubs[t].myLinks[1][1]),globalToStageY(myHubs[t].myLinks[1][3])),mouseX,mouseY)
			nearestWireIndex = t
			if(minBezPointSoFar<10){
				overWire = true
			}else{
				overWire = false
			}
		}

	}

}






//check if wireTip has been released on linking partner..
function finalizeLink(pred){
	if(myPredicates[pred].nearLinkPoint){
		if(dist(myPredicates[pred].wireExtensionX,myPredicates[pred].wireExtensionY,
			globalToStageX(myPredicates[linkInPredIndex].myTypes[linkInTypeIndex].wireTipX),globalToStageY(myPredicates[linkInPredIndex].myTypes[linkInTypeIndex].wireTipY))
			<myPredicates[linkInPredIndex].myTypes[linkInTypeIndex].beadWidth*globalScale){

			//all hubs get initialized as two point links...
			myHubs.push(new MakeHub(
				//outgoing predicate and type indices
				linkOutPredIndex,linkOutTypeIndex,
				//incoming predicate and type indices
				linkInPredIndex,linkInTypeIndex,
				//anchor 1 x,y
				myPredicates[pred].myTypes[linkOutTypeIndex].wireTipX,myPredicates[pred].myTypes[linkOutTypeIndex].wireTipY,
				//control 1 x,y
				myPredicates[pred].outControlX,myPredicates[pred].outControlY,
				//control 2 x,y
				myPredicates[pred].inControlX,myPredicates[pred].inControlY,
				//anchor 2 x,y
				myPredicates[linkInPredIndex].myTypes[linkInTypeIndex].wireTipX,myPredicates[linkInPredIndex].myTypes[linkInTypeIndex].wireTipY,
				//"type" of link (for wire color info)
				myPredicates[pred].myTypes[linkOutTypeIndex].whichType
				))
	
		}
		
	}
}




