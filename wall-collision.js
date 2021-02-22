import { libWrapper } from './shim.js'
const MODULE_ID = 'wall-collision'

// Hooks.on("setup", () => {
	
// }
Hooks.once("init", () => {
	console.log("START UP AND RUNNING!");
});

function MeasuredTemplateOver(obj) {
	//code from highlightGrid() unedited 
	const grid = canvas.grid;
	const d = canvas.dimensions;
	const border = obj.borderColor;
	const color = obj.fillColor;

	// Only highlight for objects which have a defined shape
	if ( !obj.id || !obj.shape ) return;

	// Clear existing highlight
	const hl = grid.getHighlightLayer(`Template.${obj.id}`);
	hl.clear();

	// If we are in gridless mode, highlight the shape directly
	if ( grid.type === GRID_TYPES.GRIDLESS ) {
		const shape = obj.shape.clone();
		if ( "points" in shape ) {
			shape.points = shape.points.map((p, i) => {
				if ( i % 2 ) return obj.y + p;
				else return obj.x + p;
			});
		} else {
			shape.x += obj.x;
			shape.y += obj.y;
		}
		return grid.grid.highlightGridPosition(hl, {border, color, shape});
	}
	
	
	// Code from highlightGrid(), slight edit to make it more efficent
	// Get number of rows and columns
	const nr = Math.ceil(((obj.data.distance * (grid.type === CONST.GRID_TYPES.SQUARE ? 1 : 1.5)) / d.distance) / (d.size / grid.h));
	const nc = Math.ceil(((obj.data.distance * (grid.type === CONST.GRID_TYPES.SQUARE ? 1 : 1.5)) / d.distance) / (d.size / grid.w));
	

	//code from highlightGrid() unedited 
	// Get the offset of the template origin relative to the top-left grid space
	const [tx, ty] = canvas.grid.getTopLeft(obj.data.x, obj.data.y);
	const [row0, col0] = grid.grid.getGridPositionFromPixels(tx, ty);
	const hx = canvas.grid.w / 2;
	const hy = canvas.grid.h / 2;
	const isCenter = (obj.data.x - tx === hx) && (obj.data.y - ty === hy);
	// console.log(canvas.walls.objects.chilcanvas.walls.checkCollision)

	// canvas.walls.checkCollision
	// Identify grid coordinates covered by the template Graphics
	let i = 0;
	let debugLinePass = [];
	let debugLineFail = [];
	for (let r = -nr; r < nr; r++) {
		for (let c = -nc; c < nc; c++) {
			let [gx, gy] = canvas.grid.grid.getPixelsFromGridPosition(row0 + r, col0 + c);
			const testX = (gx+hx) - obj.data.x;
			const testY = (gy+hy) - obj.data.y;
			let contains = ((r === 0) && (c === 0) && isCenter ) || obj.shape.contains(testX, testY);
			if(canvas.walls.checkCollision(new Ray({x:obj.data.x, y:obj.data.y}, {x:obj.data.x + testX, y:obj.data.y + testY}))) contains = false;
			console.log(canvas.walls.checkCollision(new Ray({x:obj.data.x, y:obj.data.y}, {x:obj.data.x + testX, y:obj.data.y + testY})))
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
				points: [[obj.data.x, obj.data.y], [obj.data.x + testX, obj.data.y + testY]]
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
			console.log(this);
			MeasuredTemplateOver(this);
			return;
		},
		'OVERRIDE',
	)
});