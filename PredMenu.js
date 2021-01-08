function MakePredMenu(xPos,yPos,wide,high) {
 	
 	this.x = xPos
 	this.y = yPos

 	this.mySlider = new MakeSlider(this.x+wide,this.y,high,0)

 	this.myPredMenuItems = []




 	//create random number of primitive predicates (between 7 and 20?)
 	//OVERRIDE with call to makeContexts() function
 	//this.numMenuItems = ceil(random(6,20))

 	//Randomize a list of contexts...
 	makeContexts()

 	this.itemSpacing = 100
 	this.initialOffset = this.itemSpacing/2
 	
 	this.totalHeight = (numMenuItems*this.itemSpacing)-high

 	//OVERRIED with local numMenuItems
 	//this.totalHeight = (this.numMenuItems*this.itemSpacing)-high
 		

 	//present vertical displacement from slider
 	//FIX: Make starting position part of slider definition?
 	this.vertOffset = 0

 	//is scrolling activated for this menu?
 	this.activeScrolling = false

 	//...if stack is taller than window...
	if((this.totalHeight+high)>high){
		this.activeScrolling = true
	}



 	for(i=0;i<numMenuItems;i++){
 		//FIX: Should this definition be agnostic about this.vertOffset?!
 		this.myPredMenuItems.push(new MakePredMenuItem(this.x+(wide/2)-80,this.y+this.initialOffset+i*this.itemSpacing-this.vertOffset,myContexts[i]))
 		//this.myPredMenuItems.push(new MakePredMenuItem(this.x+(wide/2)-75,this.y+this.initialOffset+i*this.itemSpacing-this.vertOffset,myContexts[i]))
  	}


  	this.clickMe = function(){
  		for(i=0;i<this.myPredMenuItems.length;i++){
  			this.myPredMenuItems[i].clickMe(this.vertOffset)
  		}
  	}




 	this.update = function(){

 		//reposition menu items based on slider position...
 		this.vertOffset = map(this.mySlider.dragDistance,0,high-this.mySlider.thumbHeight,0,this.totalHeight)


 		for(i=0;i<this.myPredMenuItems.length;i++){
 			//give vertical offset from slider so item knows its real postion...
 			this.myPredMenuItems[i].overMe(this.vertOffset)
 			this.myPredMenuItems[i].update()
 		}


 		if(this.activeScrolling){
 			this.mySlider.dragSlider()
 		}







 	}




	this.display = function(){
		



			//FIX: How does this info get to the menu item:
			//Display() above should be wrapped in a conditional that tells the specific menu item if it is being hovered over...
/*
			if(this.overMenuItem){
				if(i==this.hoverID){
					fill(255,0,0)
				}else{
					fill(255,255,0)
				}
			}else{
				fill(255,255,0)
			}
	

*/
		


		//draw background for menu
		fill(242)
		rect(menuBreak,0,width,height)





		if(this.activeScrolling){
			this.mySlider.display()
		}


		//OVERRIDE...
		//for(i=0;i<this.numMenuItems;i++){
		for(i=0;i<numMenuItems;i++){
			this.myPredMenuItems[i].display(this.vertOffset)
			fill(0)
			noStroke()
			textSize(20)
			text("Relation #"+(i+1),this.myPredMenuItems[i].menuX+125,this.myPredMenuItems[i].menuY-this.vertOffset)

		}




		//draw mask over environment
		noStroke()
		fill(62)

	
		beginShape()

			vertex(menuBreak,0)
			vertex(width,0)
			vertex(width,height)
			vertex(menuBreak,height)
	
			beginContour()

				vertex(this.x,this.y)
				vertex(this.x,this.y+high)
				vertex(this.x+wide,this.y+high)
				vertex(this.x+wide,this.y)

			endContour()
		
		endShape(CLOSE)

		rectMode(CORNER)

		stroke(120)
		fill(62)
		rect(875,665,300,70)


		fill(120)
		noStroke()
		text("Instructions",(300/2)+875,700)




	}


}










