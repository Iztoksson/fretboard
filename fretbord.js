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
	const container = document.getElementById("fretboard");
	const fretLabels = document.getElementById("fretLabels");	  
	const accentedFret = [0, 3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
	container.innerHTML = "";
	fretLabels.innerHTML = "";
	
	// ## Validations and default overrides:
	if(frets > 24) frets = 24;
	if(frets < 1) frets = 1;

	// ## Fret labels: normal order or reversed if left-handed:
	const labelRange = Array.from({ length: frets + 1 }, (_, i) => i);
	if (lefthanded) labelRange.reverse();
	labelRange.forEach(i => {
		
		if((!lefthanded && i == 1) || (lefthanded && i == 0))
		{
			const labelZeroDivider = document.createElement("div");
			labelZeroDivider.classList.add("fret-zero-divider");
			labelZeroDivider.textContent = " ";
			fretLabels.appendChild(labelZeroDivider);
		}
		
		const label = document.createElement("div");
		label.className = accentedFret.includes(i) ? "fret-label-gold" : "fret-label-lightgray";
		label.textContent = i;
		fretLabels.appendChild(label);
	});

	// ## Use strings as-is (no reversing):
	strings.forEach(baseNote => {
		const stringDiv = document.createElement("div");
		stringDiv.classList.add("string");

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
			const fretDiv = document.createElement("div");
			
			if((!lefthanded && nt == 1) || (lefthanded && nt == 0))
			{
				const fretZeroDivider = document.createElement("div");
				fretZeroDivider.classList.add("fret-zero-divider");
				fretZeroDivider.textContent = " ";
				stringDiv.appendChild(fretZeroDivider);
			}		
			
			// Different style for Accented frets (0, 3, 5...):
			fretDiv.classList.add(accentedFret.includes(nt) ? "fret-accented" : "fret");
			
			// Omit accidentals, and Each Note should have a different color:
			const isAccidental = note.Note.includes("#") || note.Note.includes("b");
			if (isAccidental && omitAccidentals)
			{
				fretDiv.textContent = " ";
			}
			else if (isAccidental && !omitAccidentals)
			{
				fretDiv.textContent = note.Note;
				fretDiv.classList.add("note-" + note.Note.replace("b", "").replace("#", "").toLowerCase() + "-acc");
			}
			else if (!isAccidental)
			{
				fretDiv.textContent = note.Note;
				fretDiv.classList.add("note-" + note.Note.replace("b", "").replace("#", "").toLowerCase());
			}
			
			stringDiv.appendChild(fretDiv);
			
			lefthanded ? nt-- : nt++;
		});

		container.appendChild(stringDiv);
	});
}

const tuningInput = document.getElementById("tuning");
const fretsNrInput = document.getElementById("fretsNr");

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