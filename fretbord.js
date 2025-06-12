class Note {
	constructor(note, order, hasHalfstep) {
		this.Note = note;
		this.Order = order;
		this.HasHalfstep = hasHalfstep;}

	static makeNotesSharp() {
		return [
			new Note("A", 1, true), new Note("A#", 2, true), new Note("B", 3, false),
			new Note("C", 4, true), new Note("C#", 5, true), new Note("D", 6, true),
			new Note("D#", 7, true), new Note("E", 8, false), new Note("F", 9, true),
			new Note("F#", 10, true), new Note("G", 11, true), new Note("G#", 12, true)
		];
	}

	static makeNotesFlat() {
		return [
			new Note("Ab", 1, true), new Note("A", 2, true), new Note("B", 3, false),
			new Note("C", 4, true), new Note("Db", 5, true), new Note("D", 6, true),
			new Note("E", 7, true), new Note("F", 8, false), new Note("Gb", 9, true),
			new Note("G", 10, true)
		];
	}
}

function generateFretboard(frets, strings, lefthanded, useFlats, omitAccidentals) {
	
	// ## CONSTS:
	const notes = useFlats ? Note.makeNotesFlat() : Note.makeNotesSharp();
	const accentedFret = [0, 3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
	const svgContainer = document.getElementById("svgFretboard");
	const labelRange = Array.from({ length: frets + 1 }, (_, i) => i);
	
	svgClear(svgContainer);
	svgResetXandY();
	
	// ## Validations and default overrides:
	if(frets > 24) frets = 24;
	if(frets < 1) frets = 1;

	// ## Fret labels: normal order or reversed if left-handed:
	if (lefthanded) labelRange.reverse();
	labelRange.forEach(i => {
		
		if((!lefthanded && i == 1) || (lefthanded && i == 0))
		{
			var elGZ = document.createElementNS("http://www.w3.org/2000/svg", "g");
			var elRectZ = svgCreateRect(rectX, rectY, "svgRectZeroFretSpacer");
			elGZ.appendChild(elRectZ);
			var elTextZ = svgCreateText(textX, textY, textClassName, "");
			elGZ.appendChild(elTextZ);
			svgContainer.appendChild(elGZ);
			rectX += 20;
			textX += 20;
		}
		
		var elG = document.createElementNS("http://www.w3.org/2000/svg", "g");
		var rectClassName = "svgRectNumbers";			
		var textClassName = "svgTextNumbers";
		var textValue = "";
		
		var elRect = svgCreateRect(rectX, rectY, rectClassName);
		elG.appendChild(elRect);
		var elText = svgCreateText(textX, textY, textClassName, i);
		elG.appendChild(elText);
		svgContainer.appendChild(elG);
		rectX += 60;
		textX += 60;
	});
	rectX = 50;
	textX = 75;
	rectY += 40;
	textY += 40;

	// ## Use strings as-is (no reversing):
	strings.forEach(baseNote => {
		const startIndex = notes.findIndex(n => n.Note === baseNote);
		let finalNotes = notes.slice(startIndex);

		while (finalNotes.length < frets + 1) {
			finalNotes = finalNotes.concat(notes);
		}

		// ## Reverse notes only if left-handed:
		if (lefthanded) finalNotes.reverse();
		const sliced = lefthanded ? finalNotes.slice(-frets - 1) : finalNotes.slice(0, frets + 1);

		nt = lefthanded ? frets : 0;
		sliced.forEach(note => {
			const isAccidental = note.Note.includes("#") || note.Note.includes("b");
			
			if((!lefthanded && nt == 1) || (lefthanded && nt == 0))
			{
				var elGZ = document.createElementNS("http://www.w3.org/2000/svg", "g");
				var elRectZ = svgCreateRect(rectX, rectY, "svgRectZeroFretSpacer");
				elGZ.appendChild(elRectZ);
				var elTextZ = svgCreateText(textX, textY, textClassName, "");
				elGZ.appendChild(elTextZ);
				svgContainer.appendChild(elGZ);
				rectX += 20;
				textX += 20;
			}
			
			var rectClassName = "svgRect";			
			var textClassName = "svgText";
			var textValue = "";

			// Omit accidentals, and Each Note should have a different color:
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
			
			var elG = document.createElementNS("http://www.w3.org/2000/svg", "g");
			
			var elRect = svgCreateRect(rectX, rectY, rectClassName);
			elG.appendChild(elRect);
			
			var elText = svgCreateText(textX, textY, textClassName, textValue);
			elG.appendChild(elText);
			
			var elLine = svgCreateLineString(rectX+50, rectY+(50/2), rectX+60, rectY+(50/2), "svgLineString");
			elG.appendChild(elLine);
			
			svgContainer.appendChild(elG);
			rectX += 60;
			textX += 60;
			
			lefthanded ? nt-- : nt++;
		});
		rectX = 50;
		textX = 75;
		rectY += 60;
		textY += 60;
	});
}

function svgCreateRect(x, y, className){
	var el = document.createElementNS("http://www.w3.org/2000/svg", "rect");
	el.setAttribute("x", x);
	el.setAttribute("y", y);
	el.setAttribute("rx", "5");
	el.setAttribute("ry", "5");
	el.setAttribute("class", className);
	return el;
}

function svgCreateText(x, y, className, txt){
	var el = document.createElementNS("http://www.w3.org/2000/svg", "text");
	el.setAttribute("x", x);
	el.setAttribute("y", y);
	el.setAttribute("class", className);
	var t = document.createTextNode(txt);
	el.appendChild(t);
	return el;
}

function svgClear(svgContainer){
	while (svgContainer.firstChild) {
		svgContainer.removeChild(svgContainer.firstChild);
	}
}

function svgCreateLineString(x1, y1, x2, y2, className) {
	var el = document.createElementNS("http://www.w3.org/2000/svg", "line");
	el.setAttribute("x1", x1);
	el.setAttribute("y1", y1);
	el.setAttribute("x2", x2);
	el.setAttribute("y2", y2);
	el.setAttribute("class", className);
	return el;
	//<line x1="140" y1="40" x2="150" y2="40" class="svgLineString" />
}

function svgResetXandY(){
	rectX = 50;
	rectY = 20;
	textX = 75;
	textY = 48;
}

const tuningInput = document.getElementById("tuning");
const fretsNrInput = document.getElementById("fretsNr");
var rectX = 50; /* Default, fallback. */
var rectY = 20; /* Default, fallback. */
var textX = 75; /* Default, fallback. */
var textY = 48; /* Default, fallback. */
	
// ## Entry:
function updateFretboard() {
	const lefthanded = document.getElementById("lefthanded").checked;
	const useFlats = document.getElementById("useFlats").checked;
	const omitAccidentals = document.getElementById("omitSharpsFlats").checked;
	const tuning = tuningInput.value.trim().split(/\s+/).reverse();
	const frets = parseInt(fretsNrInput.value);
	generateFretboard(frets, tuning, lefthanded, useFlats, omitAccidentals);
}

// ## Handlers and events:
document.getElementById("applyTuning").addEventListener("click", updateFretboard);
document.getElementById("lefthanded").addEventListener("change", updateFretboard);
document.getElementById("useFlats").addEventListener("change", updateFretboard);
document.getElementById("omitSharpsFlats").addEventListener("change", updateFretboard);

// ## Main:
updateFretboard();