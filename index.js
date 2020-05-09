'use strict'
/*
** TRIFID CIPHER, by DELASTELLE
** See an excellent procedural description of Trifid at:
** https://en.wikipedia.org/wiki/Trifid_cipher, captured May 4th, 2020
** Not intended for modern encryption use for valuable data, for educational use only
** flylow at edgewww com
*/

let key = "FELIX MARIE DELASTELLE";
let plaintext = "Aide-toi, le ciel t'aidera";
let ciphertext = "";  //"FMJFVOISSUFTFPUFEQQC";

// Define a character set for experimenting with Trifid
const alphabet27 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ+"; // Standard, a set of 27 chars

// configObj27 holds three cipher configuration settings: group size, dimensions, and alphabet.
// NOTE: Using standard 27 char alphabet, have defined dim=3 (layers, rows, and columns).
//		 Groupsize should always be larger than dim, and not have any common factors with dim (except 1).

const configObj27 = {
	groupsize: 5,
	dim: 3,
	alphabet: alphabet27
};

const configObj = configObj27; // Specify which config to use
console.log("Using configObj:", configObj);

let cipherObj = {	
		plaintext: "", 
		ciphertext: "", 
		plaintextFromGivenCiphertext: "",
		ciphertextFromGivenPlaintext: "",
		plaintextFromGeneratedCiphertext: "",
		ciphertextFromGeneratedPlaintext: "",		
		key: "", 
		mixedAlphabet: ""
				};

let isNode=false, isBrowser = false; // Will be determined by getEnv function

// cube will become a dim^3 matrix to hold allowed alphabetic characters in an indexed fashion
// Be aware (or beware) of index starting at zero instead of one as in manual procedure
let cube = [];

// The enciphering array
let encArray = []; // for use by program
let encArrayShow = []; // for show, to match wikipedia page. TODO, what to do with this?

// The deciphering array
let decArrayShow = []; // for show, program doesn't use. TODO, what to do with this?

//remove non-supported chars from key or plaintext, convert to UC if required
const checkChars = function(str) {
	let tstr = "";
	let isMixedCase = false; // Does selected character set support mixed case
	let charCode = 0;
	for (let i=0; i<str.length; i++) {
		charCode = configObj.alphabet.charCodeAt(i);
	//	console.log("In checkChars, charCode is: ", charCode);
		if (charCode > 96) { // 97 is lower-case a
			isMixedCase = true;
			break;
		};
	};
	if (!isMixedCase) {
		str = str.toUpperCase();
		console.log("In checkChars, requiring upper case");
	};
	for (let i=0; i<str.length; i++) {
		if (configObj.alphabet.indexOf(str.charAt(i)) > -1) {
			tstr += str.charAt(i);
		} else {
			console.log("Rejected a character in checkChars: ",str.charAt(i), str.charCodeAt(i));
		};
	};
	return tstr;
};

// mash the key to the alphabet without duplicates
const removeDupes = function(str) {
	console.log("str len = " + str.length);
	let tstr = "";
	for (let i=0; i<str.length; i++) {
		//console.log("i = " + i + ", tstr = " + tstr);
		if (tstr.indexOf(str.charAt(i)) === -1) {
			tstr += str.charAt(i);
		};
	};
	//console.log("length of tstr: " + tstr.length);
	return tstr;
};

// put chars in matrix
const defCube = function(str) {
	//console.log("In defCube, str.length =",str.length, ", str=",str);
	let cAt = 0;
	let index = 0;
	let tmat = [];
	let dim = configObj.dim;
	for (let layer=0; layer<dim; layer++) {
		tmat[layer] = [];
		for (let row=0; row<dim; row++) {
			tmat[layer][row] = [];
			for (let col=0; col<dim; col++) {
				//console.log("cAt = " + cAt, ", char is: " + str.charAt(cAt));
				tmat[layer][row][col] = str.charAt(cAt);
				index = configObj.alphabet.indexOf(str.charAt(cAt));
				if (index < 0) {
					throw "Error, character not found in character set";
				};
				encArray[index] = (layer+1) + "" + (row+1) + "" + (col+1);
				encArrayShow[index] = str.charAt(cAt) + " = " + (layer+1) + "" + (row+1) + "" + (col+1);
				decArrayShow[cAt] = "" + (layer+1) + "" + (row+1) + "" + (col+1) + " = " + str.charAt(cAt);
				cAt++;
			}		
		}	
	}
	//console.log("encArray = ", encArray);
	//console.log("decArrayShow = ", decArrayShow);
	return tmat;
};

const padplus = function(str, c = "+", gs = configObj.groupsize) {
	let pt = str;
	let nPluses = gs - (pt.length % gs);
	console.log("pt.len=",pt.length,"nPluses =",nPluses,"gs=",gs);
	if (nPluses === gs) {
		return str; // no padding necessary
	};	
	for (let i=0; i<nPluses; i++) {
		pt = pt + c;
	};
	return pt;
};

const setup = function() {
	let key = checkChars(key);
	cipherObj.key = key;
	console.log("Cleaned-up key is: ", key);	
	
	if (plaintext) {
		let pt = checkChars(plaintext);
		pt = padplus(pt);
		cipherObj.plaintext = pt;
		console.log("Cleaned and padded plaintext length is: "+cipherObj.plaintext.length);
		console.log("Cleaned-up and padded plaintext is: ", cipherObj.plaintext);
	};
	
	if (ciphertext) {
		let ct = checkChars(ciphertext);
		cipherObj.ciphertext = ct;
		console.log("Cleaned-up ciphertext is: ", cipherObj.ciphertext);
	};	
	
	let keyAlpha = key + configObj.alphabet;
	let ka = removeDupes(keyAlpha);	
	cipherObj.mixedAlphabet = ka;
	console.log("Mixed alphabet is: ", cipherObj.mixedAlphabet);
	
	cube = [];
	cube[0] = [];
	cube[0][0] = [];
	
	cube = defCube(ka);
	//console.log(cube[0][1]);
};

const encSegment = function(plainSegment) {
	//console.log("plainSegment = ", plainSegment);
	// A two-dimensional matrix for holding chunks of the intermediate cipher
	let groupmat = [];
	for (let i=0; i<3; i++) {
		groupmat[i] = [];
	};
	let segtext = "", charCode = "", charCodeArray = [], segtextCodes = [], index=0;
	for (let j=0; j<plainSegment.length; j++) {
					index = configObj.alphabet.indexOf(plainSegment.charAt(j));
				if (index < 0) {
					throw "Error, character not found in character set";
				};	
		charCode = encArray[configObj.alphabet.indexOf(plainSegment.charAt(j))];
		if (!charCode) {
			console.log("Error, character not found in encSegment, char="+plainSegment.charAt(j)+", charCode="+plainSegment.charCodeAt(j));
			throw "Error, character not found in encSegment, char="+plainSegment.charAt(j)+", charCode="+plainSegment.charCodeAt(j);
		};
		//console.log("plainSegment.charCodeAt(j)="+plainSegment.charCodeAt(j)+ ", charCode = ",charCode);
		charCodeArray = charCode.split("");
		groupmat[0][j] = charCodeArray[0]; //pt layer
		groupmat[1][j] = charCodeArray[1]; //pt row
		groupmat[2][j] = charCodeArray[2]; //pt col
	};
	//console.log("groupmat = ", groupmat);
	let cntr = 0;
	for (let i=0; i<3; i++) {
		for (let j=0; j<configObj.groupsize; j++) {
			segtextCodes[cntr++] = groupmat[i][j];
			//console.log("stc char=",groupmat[i][j]);
		};
	};
	for (let i=0; i<segtextCodes.length; i=i+3) {
		let layer = segtextCodes[i]-1;
		let row = segtextCodes[i+1]-1;
		let col = segtextCodes[i+2]-1;
				//console.log("i=",i,", layer=",layer,", row=",row,", col=",col);
		let encChar = cube[layer][row][col];
		//console.log("encChar = ", encChar);
		segtext += encChar;
	};
	//console.log("segtext = ", segtext);
	return segtext;
};

const enc = function() {
	setup();
	let pt = cipherObj.plaintext;
	for (let i=0; i<pt.length; i=i+configObj.groupsize) {
		cipherObj.ciphertextFromGivenPlaintext += encSegment(pt.substr(i,configObj.groupsize));
	};
	console.log("ciphertext from given plaintext is: " + cipherObj.ciphertextFromGivenPlaintext,"\n\n");	
};

const dencSegment = function(cipherSegment) {
	//console.log("cipherSegment = ", cipherSegment);
	// A two-dimensional matrix for holding chunks of the intermediate cipher
	let groupmat = [];
	for (let i=0; i<3; i++) {
		groupmat[i] = [];
	};	
	let segtext = "", charCode = "", charCodeArray = [], segtextCodes = [];
	let layer = 0, row = 0, col = 0;
	for (let j=0; j<cipherSegment.length; j++) {
		charCode = encArray[configObj.alphabet.indexOf(cipherSegment.charAt(j))];
		if (!charCode) {
			throw "Error, character not found in dencSegment";
		};	
		//console.log("cipherSegment.charCodeAt(j)="+cipherSegment.charCodeAt(j)+ ", charCode = ",charCode);		
		charCodeArray = charCode.split("");
		for (let n=0; n<3; n++) {
			if (col >= configObj.groupsize) {
				col = 0;
				row++;
			};
			if (row >= 3) {
				console.error("Error in dencSegment, row too large");
				throw("Error in dencSegment, row too large");
				
			};
			groupmat[row][col++] = charCodeArray[n];
		}
	};
	//console.log("dencSegment groupmat = ", groupmat);
	let cntr = 0;
	for (let j=0; j<configObj.groupsize; j++) {
		for (let i=0; i<3; i++) {
			segtextCodes[cntr++] = groupmat[i][j];
			//console.log("stc char=",groupmat[i][j]);
		};
	};
	for (let i=0; i<segtextCodes.length; i=i+3) {
		let layer = segtextCodes[i]-1;
		let row = segtextCodes[i+1]-1;
		let col = segtextCodes[i+2]-1;
				//console.log("i=",i,", layer=",layer,", row=",row,", col=",col);
		let dencChar = cube[layer][row][col];
		//console.log("dencChar = ", dencChar);
		segtext += dencChar;
	};
	//console.log("segtext = ", segtext);
	return segtext;
};

const denc = function() {
	setup();
	let ct = "";
	if (!cipherObj.ciphertext && !cipherObj.ciphertextFromGivenPlaintext) {
		console.log("No ciphertext to decrypt!");
		return "";
	} else {
		if (cipherObj.ciphertext) {
			ct = cipherObj.ciphertext;
			console.log("Will denc given ciphertext:",ct);
		} else {
			ct = cipherObj.ciphertextFromGivenPlaintext; // TODO, continue to verify round-trip?
			console.log("Will continue round-trip to denc newly encrypted text: ",ct);			
		};
	};
	console.log("Will denc: ",ct);
	let tmppt = "", pt = "";
	for (let i=0; i<ct.length; i+=configObj.groupsize) {
		tmppt = dencSegment(ct.substr(i, configObj.groupsize));
		//console.log("tmppt = ", tmppt);
		pt += tmppt;
	};
	if (ciphertext) {
		cipherObj.plaintextFromGivenCiphertext = pt;
		console.log("plaintext from given ciphertext:\n",pt);
	} else {
		cipherObj.plaintextFromGeneratedCiphertext = pt;
		console.log("Round-trip plaintext:\n",pt);
	}
	////console.log("In denc, length plaintext=" + pt.length + ", plaintext=", pt);
	return pt;	
};

const displayResults = function() {
	console.log("\n\n\n		----Results Summary----");
	if (plaintext) {
		console.log("--Given plaintext:\n",plaintext);
		console.log("--ciphertext from given plaintext:\n", cipherObj.ciphertextFromGivenPlaintext);
		console.log("--plaintext after roundtrip (only if no ciphertext given):\n", cipherObj.plaintextFromGeneratedCiphertext);
	};

	if (ciphertext) {
		console.log("\n--Given ciphertext:\n",ciphertext);
		console.log("--text from given ciphertext(if given):\n",cipherObj.plaintextFromGivenCiphertext);
	};
};

// If in node, process command line args
const handleCmd = function() {
	let cmdaction = process.argv[2];
	let arg2 = process.argv[3];
	if (cmdaction === 'enc') {
		plaintext = arg2;
		ciphertext = "";
		return true;
	} else if (cmdaction === 'denc') {
		plaintext = "";
		ciphertext = arg2;
		return true;
	} else if (cmdaction === 'test') {
		plaintext = "Aide-toi, le ciel t'aidera";
		ciphertext = "FMJFVOISSUFTFPUFEQQC";
		return true;
	} else {
		console.log("No (or invalid) parameters. Use 'test', or 'enc <str>' or 'denc <str>'");
		return false;
	}
};

// Determine the environment and run user's commands
const doCmds = function() {
	isBrowser = typeof window !== 'undefined'
		&& ({}).toString.call(window) === '[object Window]';

	isNode = typeof global !== "undefined" 
		&& ({}).toString.call(global) === '[object global]';

	console.log("isBrowser = ",isBrowser,", isNode = ",isNode);

	// If in node, get command line args and execute
	if (isNode) {
		if (handleCmd()) {
			enc();
			denc();
			displayResults();
		};
	};

};

doCmds();



