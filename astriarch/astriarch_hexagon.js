
/**
 * A Point is simply x and y coordinates
 * @constructor
 */
Astriarch.Point = function(x, y) {
	this.X = x;
	this.Y = y;
};

/**
 * A Rectangle is x and y origin and width and height
 * @constructor
 */
Astriarch.Rectangle = function(x, y, width, height) {
	this.X = x;
	this.Y = y;
	this.Width = width;
	this.Height = height;
};

/**
 * A Line is x and y start and x and y end
 * @constructor
 */
Astriarch.Line = function(x1, y1, x2, y2) {
	this.X1 = x1;
	this.Y1 = y1;
	this.X2 = x2;
	this.Y2 = y2;
};

/**
 * A Hexagon is a 6 sided polygon, our hexes are not symmetrical, ratio of width to height is 4 to 3
 * @constructor
 */
Astriarch.Hexagon = jCanvas.DrawnObject.extend({ //hexagon drawn object class
	
	/**
	 * initializes this Hexagon
	 * @this {Astriarch.Hexagon}
	 */
	init: function(id, x, y) {
		this.Points = [];//Polygon Base
		var x1 = (Astriarch.Hexagon.Static.WIDTH - Astriarch.Hexagon.Static.SIDE)/2;
		var y1 = (Astriarch.Hexagon.Static.HEIGHT / 2);
		this.Points.push(new Astriarch.Point(x1 + x, y));
		this.Points.push(new Astriarch.Point(x1 + Astriarch.Hexagon.Static.SIDE + x, y));
		this.Points.push(new Astriarch.Point(Astriarch.Hexagon.Static.WIDTH + x, y1 + y));
		this.Points.push(new Astriarch.Point(x1 + Astriarch.Hexagon.Static.SIDE + x, Astriarch.Hexagon.Static.HEIGHT + y));
		this.Points.push(new Astriarch.Point(x1 + x, Astriarch.Hexagon.Static.HEIGHT + y));
		this.Points.push(new Astriarch.Point(x, y1 + y));
		
		this.Id = id;
		
		this.x = x;
		this.y = y;
		
		this.TopLeftPoint = new Astriarch.Point(this.x, this.y);
		this.BottomRightPoint = new Astriarch.Point(this.x + Astriarch.Hexagon.Static.WIDTH, this.y + Astriarch.Hexagon.Static.HEIGHT);
		this.MidPoint = new Astriarch.Point(this.x + (Astriarch.Hexagon.Static.WIDTH / 2), this.y + (Astriarch.Hexagon.Static.HEIGHT / 2));
		this.PathCoOrdX = null;//x co-ordinate for distance finding
		this.PathCoOrdY = null;//y co-ordinate for distance finding

		this.zIndex = null;
		this.PlanetContainedInHex = null;//for backreference if exists
		
		this.selected = false;

	},
	
	/**
	 * draws this Hexagon to the canvas
	 * @this {Astriarch.Hexagon}
	 */
	draw: function(ctx) {
	
		if(this.selected)
		{
			ctx.strokeStyle = "green";
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(this.Points[0].X, this.Points[0].Y);
			for(var i = 1; i < this.Points.length; i++)
			{
				var p = this.Points[i];
				ctx.lineTo(p.X, p.Y);
			}
			ctx.closePath();
			ctx.stroke();
		}
		
	},

	/**
	 * Returns true if the x,y coordinates are inside this hexagon
	 * @this {Astriarch.Hexagon}
	 * @return {boolean}
	 */
	isInBounds: function(x, y) {
		return this.Contains(new Astriarch.Point(x, y));
	},
	
	/**
	 * Sets this hexagon as selected and 'dirties' it for the canvas
	 * @this {Astriarch.Hexagon}
	 */
	Select: function() {
		//save our original zIndex
		
		this.selected = true;
		this.layer.needsDisplay = true;//set to refresh next draw cycle
	},
	
	/**
	 * Sets this hexagon as not selected and 'dirties' it for the canvas
	 * @this {Astriarch.Hexagon}
	 */
	Deselect: function() {
		this.selected = false;
		this.layer.needsDisplay = true;//set to refresh next draw cycle
	},

	/**
	 * Returns true if the point is inside this hexagon, it is a quick contains
	 * @this {Astriarch.Hexagon}
	 * @param {Astriarch.Point} p the test point
	 * @return {boolean}
	 */
	isInHexBounds: function(/*Point*/ p) {
		if(this.TopLeftPoint.X < p.X && this.TopLeftPoint.Y < p.Y &&
		   p.X < this.BottomRightPoint.X && p.Y < this.BottomRightPoint.Y)
			return true;
		return false;
	},

	//grabbed from:
	//http://www.developingfor.net/c-20/testing-to-see-if-a-point-is-within-a-polygon.html
	//and
	//http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html#The%20C%20Code
	/**
	 * Returns true if the point is inside this hexagon, it first uses the quick isInHexBounds contains, then check the boundaries
	 * @this {Astriarch.Hexagon}
	 * @param {Astriarch.Point} p the test point
	 * @return {boolean}
	 */
	Contains: function(/*Point*/ p) {
		var isIn = false;
		if (this.isInHexBounds(p))
		{
			//turn our absolute point into a relative point for comparing with the polygon's points
			//var pRel = new Astriarch.Point(p.X - this.x, p.Y - this.y);
			var i, j = 0;
			for (i = 0, j = this.Points.length - 1; i < this.Points.length; j = i++)
			{
				var iP = this.Points[i];
				var jP = this.Points[j];
				if (
					(
					 ((iP.Y <= p.Y) && (p.Y < jP.Y)) ||
					 ((jP.Y <= p.Y) && (p.Y < iP.Y))
					//((iP.Y > p.Y) != (jP.Y > p.Y))
					) &&
					(p.X < (jP.X - iP.X) * (p.Y - iP.Y) / (jP.Y - iP.Y) + iP.X)
				   )
				{
					isIn = !isIn;
				}
			}
		}
		return isIn;
	}
});

Astriarch.Hexagon.Static = {HEIGHT:40.0, WIDTH:55.0, SIDE:25.0};//hexagons will have 25 unit sides for now


