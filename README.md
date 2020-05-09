
 TRIFID CIPHER, by Félix-Marie Delastelle (2 January 1840–2 April 1902).
 See an excellent procedural description of Trifid at:
 https://en.wikipedia.org/wiki/Trifid_cipher, captured May 4th, 2020
 Not intended for modern encryption use for valuable data, for educational use only
 G. Wilson

index.js is a simple script that runs in node.js environment. 
It has no other dependencies.


To run, type:
node index.js <cmd> <key> <text>
where command is one of: enc, dec, or test. Param is the text to be encrypted or decrypted.

Examples:
node index.js test
node index.js enc "secretkey" "Happy Mother's Day"
node index.js dec "FELIX MARIE DELASTELLE" "FMJFVOISSUFTFPUFEQQC"


