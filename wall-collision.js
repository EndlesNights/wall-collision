import { libWrapper } from './shim.js'
const MODULE_ID = 'wall-collision'

// Hooks.on("setup", () => {
	
// }
Hooks.once("init", () => {
	console.log("START UP AND RUNNING!");
});

function MeasuredTemplateOver() {
	console.log(this);
    const grid = canvas.grid;
    const d = canvas.dimensions;
    const border = this.borderColor;
    const color = this.fillColor;

    // Only highlight for objects which have a defined shape
    if ( !this.id || !this.shape ) return;

    // Clear existing highlight
    const hl = grid.getHighlightLayer(`Template.${this.id}`);
    hl.clear();

    // If we are in gridless mode, highlight the shape directly
    if ( grid.type === GRID_TYPES.GRIDLESS ) {
      const shape = this.shape.clone();
      if ( "points" in shape ) {
        shape.points = shape.points.map((p, i) => {
          if ( i % 2 ) return this.y + p;
          else return this.x + p;
        });
      } else {
        shape.x += this.x;
        shape.y += this.y;
      }
      return grid.grid.highlightGridPosition(hl, {border, color, shape});
    }

    // Get number of rows and columns
    const nr = Math.ceil(((this.data.distance * (grid.type === CONST.GRID_TYPES.SQUARE ? 1 : 1.5)) / d.distance) / (d.size / grid.h));
    const nc = Math.ceil(((this.data.distance * (grid.type === CONST.GRID_TYPES.SQUARE ? 1 : 1.5)) / d.distance) / (d.size / grid.w));
    
    // Get the offset of the template origin relative to the top-left grid space
    const [tx, ty] = canvas.grid.getTopLeft(this.data.x, this.data.y);
    const [row0, col0] = grid.grid.getGridPositionFromPixels(tx, ty);
    const hx = canvas.grid.w / 2;
    const hy = canvas.grid.h / 2;
    const isCenter = (this.data.x - tx === hx) && (this.data.y - ty === hy);
    // console.log(canvas.walls.objects.chilcanvas.walls.checkCollision)

    // canvas.walls.checkCollision
    // Identify grid coordinates covered by the template Graphics
    let i = 0;
    let debugLinePass = [];
    let debugLineFail = [];
    for (let r = -nr; r < nr; r++) {
      for (let c = -nc; c < nc; c++) {
        let [gx, gy] = canvas.grid.grid.getPixelsFromGridPosition(row0 + r, col0 + c);
        const testX = (gx+hx) - this.data.x;
        const testY = (gy+hy) - this.data.y;
        let contains = ((r === 0) && (c === 0) && isCenter ) || this.shape.contains(testX, testY);
        if(canvas.walls.checkCollision(new Ray({x:this.data.x, y:this.data.y}, {x:this.data.x + testX, y:this.data.y + testY}))) contains = false;
        console.log(canvas.walls.checkCollision(new Ray({x:this.data.x, y:this.data.y}, {x:this.data.x + testX, y:this.data.y + testY})))
        // console.log(`gx:${gx}, gy:${gy}\ntestX:${testX}, testY:${testY}, contains:${contains},  i:${i}\nr:${r}, c:${c}`)
        i++;

        const newDebugLine = {
          type: CONST.DRAWING_TYPES.POLYGON,
          author: game.user._id,
          x: 0,
          y: 0,
          strokeWidth: 2,
          strokeColor: contains ? "#00FF00" : "#FF0000",
          strokeAlpha: 0.75,
          textColor: contains ? "#00FF00" : "#FF0000",
          points: [[this.data.x, this.data.y], [this.data.x + testX, this.data.y + testY]]
        };

        if(contains) debugLinePass.push(newDebugLine);
        else debugLineFail.push(newDebugLine);
        if ( !contains ) continue;
        grid.grid.highlightGridPosition(hl, {x: gx, y: gy, border, color});
      }
    }
    // debugLineFail.forEach( line => canvas.drawings.createMany(line));
    debugLinePass.forEach( line => canvas.drawings.createMany(line));


  }

Hooks.once('setup', function () {
	libWrapper.register(
		MODULE_ID,
		'MeasuredTemplate.prototype.highlightGrid',
		function() {
			MeasuredTemplateOver();
			return;
		},
		'OVERRIDE',
	)
});