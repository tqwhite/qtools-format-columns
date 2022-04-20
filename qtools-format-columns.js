#!/usr/bin/env node

const qt = require('qtools-functional-library');
const commandLineParser = require('qtools-parse-command-line');

//PROCESS STRING ========================================================

const commandLineParameters = commandLineParser.getParameters();

const splitToColumns = ({ delimitters, prefixes, suffixes }) => inTextList => {
	return inTextList.map(line => {
		const mapResult = [];
		let remainder;
		const segments = delimitters.map((delimiter, inx) => {
			const regex = new RegExp(delimiter);

			const subject = remainder ? remainder : line;

			const split = subject.split(regex);

			if (split[1]) {
				mapResult.push(
					`${prefixes[inx] ? prefixes[inx] : ''}${split[0]}${
						suffixes[inx] ? suffixes[inx] : ''
					}`
				);
				remainder = split[1];
			} else {
				remainder = split[0];
			}
		});

		if (mapResult.length && remainder) {
			const prefix = prefixes[mapResult.length]
				? prefixes[mapResult.length]
				: '';
			const suffix = suffixes[mapResult.length]
				? prefixes[mapResult.length]
				: '';
			mapResult.push(`${prefix}${remainder}${suffix}`);
		} else {
			mapResult.push(remainder);
		}

		return mapResult;
	});

};

const getColumnDataWidth = columnSplit => {
	const initWidthArray = columnSplit =>
		columnSplit
			.reduce((result, item) => Math.max(result, item.length), 0)
			.qtIterate(item => 0)
			.map((prevWidth, inx) =>
				columnSplit.reduce(
					(result, lineSet) =>
						lineSet.length - 1
							? Math.max(
									lineSet[inx] && lineSet[inx].length ? lineSet[inx].length : 0,
									result
								)
							: result,
					0
				)
			);
	return initWidthArray(columnSplit);
};
const padAndJoinLines = (columnDataWidth, columnSplit, options) => {
	const { prefixes, suffixes, spacingString, columnGap } = options;
	return columnSplit.map(lineSet => {
		return lineSet
			.map((segment, inx) =>
				segment.padEnd(columnDataWidth[inx] + +columnGap, spacingString)
			)
			.join('')
			.trim();
	});
};
var convertText = ({
	delimitters,
	prefixes,
	suffixes,
	spacingString,
	columnGap
}) => (inString, callback) => {
	const inTextList = inString.split(/\n/);

	const columnSplit = splitToColumns({ delimitters, prefixes, suffixes })(
		inTextList
	);
	const columnDataWidth = getColumnDataWidth(columnSplit);
	const paddedLines = padAndJoinLines(columnDataWidth, columnSplit, {
		spacingString,
		columnGap
	});
	const valuesString = paddedLines.join('\n');

	callback('', valuesString);
};

//INPUT/OUTPUT ========================================================

const delimitters = commandLineParameters.qtGetSurePath('values.delimitters', [ ': +' ]); // prettier-ignore
const prefixes = commandLineParameters.qtGetSurePath('values.prefixes', [ ': +' ]); // prettier-ignore
const suffixes = commandLineParameters.qtGetSurePath('values.suffixes', [ ': +' ]); // prettier-ignore
const spacingString = commandLineParameters.qtGetSurePath('values.spacingString', ' '); // prettier-ignore
const columnGap = commandLineParameters.qtGetSurePath('values.columnGap', 4); // prettier-ignore

let inString = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(data) {
	inString += data;
});
process.stdin.on('end', () =>
	convertText({ delimitters, prefixes, suffixes, spacingString, columnGap })(
		inString,
		(err, result) => {
			if (err) {
				// prettier-ignore
				process.stdout.write(`${''.padEnd(50, '=')}\n\nERROR:  ${err.toString()}\n\n${''.padEnd(50, '=')}\n\n${inString}`);
				return;
			}

			process.stdout.write(result);
		}
	)
);

