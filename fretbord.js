class Note {
	constructor(note, order) {
		this.Note = note;
		this.Order = order;
	}

	static makeNotesSharp() {
		return [
			new Note("A", 1),	new Note("A#", 2),	new Note("B", 3),
			new Note("C", 4),	new Note("C#", 5),	new Note("D", 6),
			new Note("D#", 7),	new Note("E", 8),	new Note("F", 9),
			new Note("F#", 10),	new Note("G", 11),	new Note("G#", 12)
		];
	}

	static makeNotesFlat() {
		return [
			new Note("Ab", 1),	new Note("A", 2),	new Note("Bb", 3),
			new Note("B", 4),	new Note("C", 5),	new Note("Db", 6),
			new Note("D", 7),	new Note("Eb", 8),	new Note("E", 9),
			new Note("F", 10),	new Note("Gb", 11),	new Note("G", 12)
		];
	}
}

// # PUBLIC const
const accentedFret = [0, 3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
const svgContainer = document.getElementById("svgFretboard");
const tuningInput = document.getElementById("tuning");
const fretsNrInput = document.getElementById("fretsNr");
const svgNs = "http://www.w3.org/2000/svg";
const circleClassName = "svgDots";
const svgLineStringClassName = "svgLineString";
const svgRectZeroFretSpacerWidth = 20; /* Change in CSS: svgRectZeroFretSpacer. */
const svgRectWidth = 50; /* Change in CSS: svgRect. */
const pushXby = svgRectWidth + 10;
const pushYAfterFretNumbersBy = 40;
const dotR = 6;

// # PUBLIC var
var rectX = svgRectWidth; /* Default, fallback. */
var rectY = 20; /* Default, fallback. */
var textX = svgRectWidth + (svgRectWidth / 2); /* Default, fallback. */
var textY = 48; /* Default, fallback. */

function svgResetXandY(){
	rectX = svgRectWidth;
	rectY = 20;
	textX = svgRectWidth + (svgRectWidth / 2);
	textY = 48;
}

// # Handlers and events:
document.getElementById("applyTuning").addEventListener("click", updateFretboard);
document.getElementById("lefthanded").addEventListener("change", updateFretboard);
document.getElementById("useFlats").addEventListener("change", updateFretboard);
document.getElementById("omitSharpsFlats").addEventListener("change", updateFretboard);

function generateFretboard(frets, strings, lefthanded, useFlats, omitAccidentals) {
	
	// ## Local CONSTS:
	const notes = useFlats ? Note.makeNotesFlat() : Note.makeNotesSharp();
	const labelRange = Array.from({ length: frets + 1 }, (_, i) => i);
	
	// ## Clear+reset container and svg elements:
	svgClear(svgContainer);
	svgResetXandY();
	
	// ## Validations and default overrides:
	if(frets > 24) frets = 24;
	if(frets < 1) frets = 1;

	// ## Generate fret numbers (top):
	if (lefthanded) labelRange.reverse();
	labelRange.forEach(i => {
		
		if((!lefthanded && i == 1) || (lefthanded && i == 0))
		{
			var elGZ = document.createElementNS(svgNs, "g");
			var elRectZ = svgCreateRect(rectX, rectY, "svgRectZeroFretSpacer");
			elGZ.appendChild(elRectZ);
			var elTextZ = svgCreateText(textX, textY, textClassName, "");
			elGZ.appendChild(elTextZ);
			svgContainer.appendChild(elGZ);
			rectX += svgRectZeroFretSpacerWidth;
			textX += svgRectZeroFretSpacerWidth;
		}
		
		var elG = document.createElementNS(svgNs, "g");
		var textClassName = "svgTextNumbers";
		var textValue = "";
		
		var elText = svgCreateText(textX, textY, textClassName, i);
		elG.appendChild(elText);
		svgContainer.appendChild(elG);
		rectX += pushXby;
		textX += pushXby;
	});
	
	// ## Reposition x and y for a new row:
	rectX = svgRectWidth;
	textX = svgRectWidth + (svgRectWidth / 2);
	rectY += pushYAfterFretNumbersBy;
	textY += pushYAfterFretNumbersBy;

	// ## Generate notes:
	strings.forEach(baseNote => {
		const startIndex = notes.findIndex(n => n.Note === baseNote);
		let finalNotes = notes.slice(startIndex);

		while (finalNotes.length < frets + 1) {
			finalNotes = finalNotes.concat(notes);
		}

		// ### Reverse notes only if left-handed:
		if (lefthanded) finalNotes.reverse();
		const slicedNotes = lefthanded ? finalNotes.slice(-frets - 1) : finalNotes.slice(0, frets + 1);

		noteIdx = lefthanded ? frets : 0;
		slicedNotes.forEach(note => {
			var isAccidental = note.Note.includes("#") || note.Note.includes("b");
			
			// #### Make some space after zero-fret:
			if((!lefthanded && noteIdx == 1) || (lefthanded && noteIdx == 0)) {
				var elGZ = document.createElementNS(svgNs, "g");
				var elRectZ = svgCreateRect(rectX, rectY, "svgRectZeroFretSpacer");
				elGZ.appendChild(elRectZ);
				var elTextZ = svgCreateText(textX, textY, textClassName, "");
				elGZ.appendChild(elTextZ);
				svgContainer.appendChild(elGZ);
				rectX += svgRectZeroFretSpacerWidth;
				textX += svgRectZeroFretSpacerWidth;
			}
			
			var rectClassName = "svgRect";
			var textClassName = "svgText";
			var textValue = "";

			// #### Omit accidentals, and Each Note should have a different color:
			if (isAccidental && omitAccidentals)
			{
				textValue = " ";
				rectClassName += " note-" + note.Note.replace("b", "").replace("#", "").toLowerCase() + "-acc";
			}
			else if (isAccidental && !omitAccidentals)
			{
				textValue = note.Note;
				rectClassName += " note-" + note.Note.replace("b", "").replace("#", "").toLowerCase() + "-acc";
			}
			else if (!isAccidental)
			{
				textValue = note.Note;
				rectClassName += " note-" + note.Note.replace("b", "").replace("#", "").toLowerCase();
			}
			
			// // WIP: remove notes not in the desired scale:
			// var scaleNotes = generateNotesInScale("A");
			// if (!scaleNotes.some(elem => { return JSON.stringify(note) === JSON.stringify(elem);})) {
				// textValue = ""; /* exclude notes not in requested scale.*/
			// }
		
			var elG = document.createElementNS(svgNs, "g");
			
			var elRect = svgCreateRect(rectX, rectY, rectClassName);
			elG.appendChild(elRect);
			
			var elText = svgCreateText(textX, textY, textClassName, textValue);
			elG.appendChild(elText);
			
			var elLine = svgCreateLineString(rectX+svgRectWidth, rectY+(svgRectWidth/2), rectX+pushXby, rectY+(svgRectWidth/2), svgLineStringClassName);
			elG.appendChild(elLine);
			
			svgContainer.appendChild(elG);
			
			rectX += pushXby;
			textX += pushXby;
			
			// #### (In/De)crement note index:
			lefthanded ? noteIdx-- : noteIdx++;
		});
		rectX = svgRectWidth;
		textX = svgRectWidth + (svgRectWidth / 2);
		rectY += pushXby;
		textY += pushXby;
	});
	
	// ## Generate dots (3, 5, 7...):
	var circleX = 75;
	labelRange.forEach(i => {
		if (accentedFret.includes(i)) {
			var dbl = i == 12 || i == 24;
			if (dbl) {
				var elG = document.createElementNS(svgNs, "g");
				
				var elCircle = svgCreateCircle(dotR, circleX-(dotR*2), textY-(svgRectWidth / 2), circleClassName, dbl);
				elG.appendChild(elCircle);
				svgContainer.appendChild(elG);
			
				elCircle = svgCreateCircle(dotR, circleX+(dotR*2), textY-(svgRectWidth / 2), circleClassName, dbl);
				elG.appendChild(elCircle);
				svgContainer.appendChild(elG);	
			}
			else {
				var elG = document.createElementNS(svgNs, "g");
				
				var elCircle = svgCreateCircle(dotR, circleX, textY-(svgRectWidth / 2), circleClassName, dbl);
				elG.appendChild(elCircle);
				svgContainer.appendChild(elG);			
			}
		}
		rectX += (((i == 1 && lefthanded) || (i == 2 && !lefthanded)) ? pushXby+svgRectZeroFretSpacerWidth : pushXby);
		circleX += (((i == 1 && lefthanded) || (i == 2 && !lefthanded)) ? pushXby+svgRectZeroFretSpacerWidth : pushXby);
	});
}

function svgCreateRect(x, y, className, dbl){
	var el = document.createElementNS(svgNs, "rect");
	el.setAttribute("x", x);
	el.setAttribute("y", y);
	el.setAttribute("rx", "5");
	el.setAttribute("ry", "5");
	el.setAttribute("class", className);
	return el;
}

function svgCreateText(x, y, className, txt){
	var el = document.createElementNS(svgNs, "text");
	el.setAttribute("x", x);
	el.setAttribute("y", y);
	el.setAttribute("class", className);
	var t = document.createTextNode(txt);
	el.appendChild(t);
	return el;
}

function svgCreateCircle(r, cx, cy, className){
	var el = document.createElementNS(svgNs, "circle");
	el.setAttribute("r", r);
	el.setAttribute("cx", cx);
	el.setAttribute("cy", cy);
	el.setAttribute("class", className);
	return el;
}

function svgClear(svgContainer){
	while (svgContainer.firstChild) {
		svgContainer.removeChild(svgContainer.firstChild);
	}
}

function svgCreateLineString(x1, y1, x2, y2, className) {
	var el = document.createElementNS(svgNs, "line");
	el.setAttribute("x1", x1);
	el.setAttribute("y1", y1);
	el.setAttribute("x2", x2);
	el.setAttribute("y2", y2);
	el.setAttribute("class", className);
	return el;
}

function generateNotesInScale(scaleNote){
	
	const useFlats = document.getElementById("useFlats").checked;
	const notes = useFlats ? Note.makeNotesFlat() : Note.makeNotesSharp();
	var scaleStepsMajor = [0, 2, 2, 1, 2, 2, 2];
	var scaleStepsMinor = [0, 2, 1, 2, 2, 1, 2];
	var scaleStartIdx = notes.findIndex(n => n.Note === scaleNote);
	var scaleIdxSum = 0;
	var scaleNotesInScale = new Array(0);
	for(let s = 0; s <= 6; s++) {
		scaleStartIdx = scaleStartIdx + scaleStepsMajor[s] - (scaleStartIdx + scaleStepsMajor[s]> 11 ? 12 : 0);
		scaleNotesInScale.push(notes[scaleStartIdx]).Note;
	}
	//console.log(scaleNotesInScale);
	
	return scaleNotesInScale;

}
	
// ## Main function:
function updateFretboard() {
	const lefthanded = document.getElementById("lefthanded").checked;
	const useFlats = document.getElementById("useFlats").checked;
	const omitAccidentals = document.getElementById("omitSharpsFlats").checked;
	const tuning = tuningInput.value.trim().split(/\s+/).reverse();
	const frets = parseInt(fretsNrInput.value);
	
	generateFretboard(frets, tuning, lefthanded, useFlats, omitAccidentals);
}

// ## Main:
updateFretboard();