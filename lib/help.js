module.exports = `

============================================================

NAME

	qtFormatColumns - Replace characters with spaces to form columns in text

SYNOPSIS


DESCRIPTION

	Parses a text file based on --delimitters, treats each segment as a columns
	after padding each entry to the maximum length plus columnGap. Lines that do
	not match any delimitters are ignored and passed through.
	
	Delimitters are converted to Javascript RegExp. The characters matched by the
	delimitters are stripped from the text. Use suffixes and prefixes to replace them
	if needed.
	
	delimitters, suffixes and prefixes are all coordinated lists. The segment isolated 
	by the first delimitter is wrapped by the first suffix and prefix, if any.

OPTIONS

-help, --help		Prints these instructions
	
PARAMETERS

--delimitters		default is ': +' (treats first colon as a column boundary)
--prefixes			defaults is empty string
--suffixes			default is ':' (replaced colon stripped by default delimiter)
--spacingString		default is ' '
--columnGap			default is 4 (four spaces)

EXAMPLE

cat someFile.txt | qtFormatColumns --delimitters=': +',' +\(' --prefixes='','','(' --suffixes=':','','' --spacingString=' ' --columnGap=4

(note backslash to escape parenthesis above.)

If someFile.txt contains:

Example...
commandName:  description
longerCommandName: another description (with parenthesis)
also: more description (and another parenthetical)

it is converted to:

Example...
commandName:          description
longerCommandName:    another description    (with parenthesis)
also:                 more description       (and another parenthetical)


============================================================

`;