#!/usr/bin/env node

const qt = require('qtools-functional-library');
const commandLineParser = require('qtools-parse-command-line');

//PROCESS STRING ========================================================

const commandLineParameters = commandLineParser.getParameters();
if (
	commandLineParameters.qtGetSurePath('values.help') ||
	commandLineParameters.qtGetSurePath('switches.help')
) {
	const help = require('./lib/help.js');
	process.stdout.write(help);
	process.exit();
}

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

const removeNonPrintingCharacters = line =>
	line ? line.replace(/(\[\d+)m/g, '') : '';

const getColumnDataWidth = columnSplit => {
	const initWidthArray = columnSplit =>
		columnSplit
			.reduce((result, item) => Math.max(result, item.length), 0)
			.qtIterate(item => 0)
			.map((prevWidth, inx) =>
				columnSplit.reduce((result, lineSet) => {
					if (lineSet.length === 1) {
						return result;
					}
					const cleanLine = removeNonPrintingCharacters(
						lineSet.qtGetSurePath(`[${inx}]`)
					);
					return lineSet.length - 1
						? Math.max(cleanLine ? cleanLine.length : 0, result)
						: result;
				}, 0)
			);
	return initWidthArray(columnSplit);
};

const padAndJoinLines = (columnDataWidth, columnSplit, options) => {
	const { prefixes, suffixes, spacingString, columnGap } = options;
	
	const padEnd = (inString, count, spacingString) => {
		let outString = inString;
		const cleanLength = removeNonPrintingCharacters(inString).length;
		const spacesCount = count - cleanLength;
		spacesCount.qtIterate(item => {
			outString = outString + spacingString;
			return 'unused';
		});
		return outString;
	};
	
	return columnSplit.map(lineSet => {
		return lineSet
			.map((segment, inx) =>
				padEnd(segment, columnDataWidth[inx] + +columnGap, spacingString)
			)
			.join('')
			.trim();
	});
};

const convertText = ({
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

const delimitters = commandLineParameters.qtGetSurePath('values.delimitters', [ ':\\s+' ]); // prettier-ignore
const prefixes = commandLineParameters.qtGetSurePath('values.prefixes', [ '' ]); // prettier-ignore
const suffixes = commandLineParameters.qtGetSurePath('values.suffixes', []); // prettier-ignore
const spacingString = commandLineParameters.qtGetSurePath('values.spacingString', ' '); // prettier-ignore
const columnGap = commandLineParameters.qtGetSurePath('values.columnGap', 8); // prettier-ignore

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

