/**
 * A DrawnPlanet is a graphical representation of a planet
 * @constructor
 */
Astriarch.DrawnPlanet = jCanvas.DrawnObject.extend({ // drawn object class

	/**
	 * initializes this DrawnPlanet
	 * @this {Astriarch.DrawnPlanet}
	 */
	init: function(/*Planet*/ p) {
		
		this.Planet = p;
		
		this.planetKnownByMainPlayer = false;//TODO: this will have to change for multiplayer
		this.planetImage = null;
		
		this.textBlockForeground = "yellow";
		this.textBlockStrengthForeground = "yellow";
		this.textBlockStrengthText = "";
		
		this.fleetRectangle = new Astriarch.Rectangle(this.Planet.BoundingHex.MidPoint.X + (Astriarch.Planet.Static.PLANET_SIZE/2) - 2,
													  this.Planet.BoundingHex.MidPoint.Y + (Astriarch.Planet.Static.PLANET_SIZE/2) - 2,
													  11, 11);
		this.drawFleetRectangle = false;
		this.fleetRectangleImageData = Astriarch.Util.starshipImageData;
													  
		this.spacePlatformRectangle = new Astriarch.Rectangle(this.Planet.BoundingHex.MidPoint.X - (Astriarch.Planet.Static.PLANET_SIZE/2) - 8,
													  this.Planet.BoundingHex.MidPoint.Y + (Astriarch.Planet.Static.PLANET_SIZE/2) - 2,
													  11, 11);
		this.drawSpacePlatformRectangle = false;
		this.spacePlatformRectangleImageData = Astriarch.Util.spaceplatformImageData;											  
		
		
		//images
		/*
		new BitmapImage(new Uri(@"img/PlanetClass2Tile.png", UriKind.Relative));
		new BitmapImage(new Uri(@"img/PlanetClass1Tile.png", UriKind.Relative));
		new BitmapImage(new Uri(@"img/PlanetDeadTile.png", UriKind.Relative));
		new BitmapImage(new Uri(@"img/PlanetAsteroidTile.png", UriKind.Relative));
		new BitmapImage(new Uri(@"img/starship.png", UriKind.Relative));
		new BitmapImage(new Uri(@"img/spaceplatform.png", UriKind.Relative));
		 */
		
	},
	
	/**
	 * Draws the DrawnPlanet to the canvas
	 * @this {Astriarch.DrawnPlanet}
	 */
	draw: function(ctx) {
		
		// define size of Ellipse
		var width = this.Planet.Width;
		var height = this.Planet.Height;
		
		// define center of Ellipse (planet origin is top left corner of planet
		var centerX = this.Planet.OriginPoint.X + width/2;
		var centerY = this.Planet.OriginPoint.Y + height/2;
		
		if(!this.planetImage)
		{
			var controlRectWidth = width * 1.33;
		 
			ctx.beginPath();
			ctx.moveTo(centerX,centerY - height/2);
			// draw left side of Ellipse
			ctx.bezierCurveTo(centerX-controlRectWidth/2,centerY-height/2,
				centerX-controlRectWidth/2,centerY+height/2,
				centerX,centerY+height/2);
		 
			// draw right side of Ellipse
			ctx.bezierCurveTo(centerX+controlRectWidth/2,centerY+height/2,
				centerX+controlRectWidth/2,centerY-height/2,
				centerX,centerY-height/2);
		 
			ctx.lineWidth=2.0;
			ctx.strokeStyle="white"; 
			ctx.fillStyle = "black";
			ctx.stroke();	
			ctx.fill();
			ctx.closePath();
			
			this.drawText(ctx, centerX, centerY);
		}
		else//draw planet image
		{
			//TODO: should we cache these images?
			var image = new Image();
			var x = this.Planet.OriginPoint.X - 6;//images sizes are 32px (TODO: shouldn't be hard-coded?) (also not sure why it needs to be off by 1 (7 instead of 8)
			var y = this.Planet.OriginPoint.Y - 7;
			if(this.Planet.Type == Astriarch.Planet.PlanetType.AsteroidBelt)
				x += 1;
			var thisDrawnPlanet = this;
			image.onload = function() {
				//planetImageLoaded
				ctx.drawImage(image, x, y);
				thisDrawnPlanet.drawText(ctx, centerX, centerY);
			};
			image.src = this.planetImage;
			
			//draw space platform and fleet rectangles
			if(this.drawFleetRectangle)
			{
				var starshipImg = ctx.createImageData(this.fleetRectangle.Width, this.fleetRectangle.Height);
				for(var i in this.fleetRectangleImageData)
					starshipImg.data[i] = this.fleetRectangleImageData[i];
				ctx.putImageData(starshipImg, this.fleetRectangle.X, this.fleetRectangle.Y);
			}
			if(this.drawSpacePlatformRectangle)
			{
				var platformImg = ctx.createImageData(this.spacePlatformRectangle.Width, this.spacePlatformRectangle.Height);
				for(var i in this.spacePlatformRectangleImageData)
					platformImg.data[i] = this.spacePlatformRectangleImageData[i];
				ctx.putImageData(platformImg, this.spacePlatformRectangle.X, this.spacePlatformRectangle.Y);
			}
		}
		
	},
	
	/**
	 * Draws the DrawnPlanet's name to the canvas
	 * @this {Astriarch.DrawnPlanet}
	 */
	drawText: function(ctx, centerX, centerY) {
		//had to do the drawing here because the image might load after the text is drawn
		//draw text:
		ctx.fillStyle = this.textBlockForeground;
		ctx.font = "bolder 8pt Trebuchet MS,Tahoma,Verdana,Arial,sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = 'middle';
		//var textWidth = ctx.measureText(this.Planet.BoundingHex.Id);
		ctx.fillText(this.Planet.BoundingHex.Id, centerX, centerY);
		
		//draw the strength text
		ctx.fillStyle = this.textBlockStrengthForeground;
		ctx.font = "bold 7pt Trebuchet MS,Tahoma,Verdana,Arial,sans-serif";
		ctx.fillText(this.textBlockStrengthText, centerX, centerY - 14);
	},
	
	/**
	 * returns false because we never need hit testing for the drawn planet (only the hex around it)
	 * @return {boolean}
	 */
	isInBounds: function(x, y) {
		return false;
	},

	/**
	 * Updates the DrawnPlanet's properties based on what the player knows about the planet
	 * @this {Astriarch.DrawnPlanet}
	 */
	UpdatePlanetDrawingForPlayer: function(/*Player*/ player)
	{	
		this.planetImage = null;
		this.planetKnownByMainPlayer = player.PlanetKnownByPlayer(this.Planet);

		if (this.planetKnownByMainPlayer)
		{
			//if (this.Planet.Type == Astriarch.Planet.PlanetType.AsteroidBelt)
			//	this.Planet.Width = Astriarch.Planet.Static.PLANET_SIZE * 1.5;

			switch (this.Planet.Type)
			{
				case Astriarch.Planet.PlanetType.PlanetClass2:
					this.planetImage = "img/PlanetClass2.png";
					break;
				case Astriarch.Planet.PlanetType.PlanetClass1:
					this.planetImage = "img/PlanetClass1.png";
					break;
				case Astriarch.Planet.PlanetType.DeadPlanet:
					this.planetImage = "img/PlanetDead.png";
					break;
				case Astriarch.Planet.PlanetType.AsteroidBelt:
					this.planetImage = "img/PlanetAsteroid.png";
					break;
			}

		}
		/*
		else if (this.Planet.Type != PlanetType.AsteroidBelt)
		{
			this.Ellipse.Stroke = DrawnPlanet.WHITE_BRUSH;
			this.Ellipse.StrokeThickness = 1;
		}*/

		this.drawFleetRectangle = false;
		this.drawSpacePlatformRectangle = false

		var lastKnownOwner = null;//Player
		if (player.LastKnownPlanetFleetStrength[this.Planet.Id])
			lastKnownOwner = player.LastKnownPlanetFleetStrength[this.Planet.Id].LastKnownOwner;

		if (player.PlanetOwnedByPlayer(this.Planet))
		{
			this.textBlockForeground = player.Color.toString();
			this.textBlockStrengthForeground = player.Color.toString();

			//draw fleet image if we have mobile ships
			if (this.Planet.PlanetaryFleet.GetPlanetaryFleetMobileStarshipCount() > 0)
			{
				this.drawFleetRectangle = true;
				this.fleetRectangleImageData = player.starshipImageData;
			}

			//draw spaceplatform image if we have a space platform
			if (this.Planet.BuiltImprovements[Astriarch.Planet.PlanetImprovementType.SpacePlatform].length > 0)
			{
				this.drawSpacePlatformRectangle = true;
				this.spacePlatformRectangleImageData = player.spaceplatformImageData;
			}
			
			this.textBlockStrengthText = this.Planet.PlanetaryFleet.DetermineFleetStrength() + "";
		}
		else if (this.planetKnownByMainPlayer && lastKnownOwner !== null)
		{
			this.textBlockForeground = lastKnownOwner.Color.toString();
			this.textBlockStrengthForeground = lastKnownOwner.Color.toString();
			
			//if we know the enemy has a space platform and mobile fleet, we should draw those as well

			if (player.LastKnownPlanetFleetStrength[this.Planet.Id].Fleet.GetPlanetaryFleetMobileStarshipCount() > 0)
			{
				this.drawFleetRectangle = true;
				this.fleetRectangleImageData = lastKnownOwner.starshipImageData;
			}

			if (player.LastKnownPlanetFleetStrength[this.Planet.Id].Fleet.HasSpacePlatform)
			{
				this.drawSpacePlatformRectangle = true;
				this.spacePlatformRectangleImageData = lastKnownOwner.spaceplatformImageData;
			}
			
			this.textBlockStrengthText = player.LastKnownPlanetFleetStrength[this.Planet.Id].Fleet.DetermineFleetStrength() + "";
		}
		else
		{
			if (this.planetKnownByMainPlayer && this.Planet.Type == Astriarch.Planet.PlanetType.DeadPlanet)
				this.textBlockForeground = "black";
			else
				this.textBlockForeground = "yellow";
			
			this.textBlockStrengthForeground = "yellow";
			
			if(this.planetKnownByMainPlayer && this.Planet.Id in player.LastKnownPlanetFleetStrength)
                this.textBlockStrengthText = player.LastKnownPlanetFleetStrength[this.Planet.Id].Fleet.DetermineFleetStrength() + "";
            else	
				this.textBlockStrengthText = "";
		}
		
	}
	
});

