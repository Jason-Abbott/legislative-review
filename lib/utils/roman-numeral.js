'use strict';

// Roman numeral conversions and math
// http://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter

const lookup = { M:1000, CM:900, D:500, CD:400, C:100, XC:90, L:50, XL:40, X:10, IX:9, V:5, IV:4, I:1 };

module.exports = {
	from(num) {
		let roman = '';
		for (let i in lookup) {
			while (num >= lookup[i] ) {
				roman += i;
				num -= lookup[i];
			}
		}
		return roman;
	},
	toArabic(r) {
		let roman = r.toUpperCase();
		let num = 0;
		let i = roman.length;
		
		while (i--) {
			if (lookup[roman[i]] < lookup[roman[i+1]]) {
				num -= lookup[roman.charAt(i)];
			} else {
				num += lookup[roman.charAt(i)];
			}
		}
		return num;
	},
	increment(r) { return this.add(r, 1); },
	decrement(r) { return this.subtract(r, 1); },
	add(r, n) {	return this.from(this.toArabic(r) + n); },
	subtract(r, n) { return this.from(this.toArabic(r) - n);	}
};