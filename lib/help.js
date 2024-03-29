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
	
	Note: Because the original use case for this was to process BASH output, it defaults
	to stripping BASH terminal color strings for measurement during alignment. It does
	not yet do anything else with non-printing characters to insure correct alignment.

OPTIONS

-help, --help		Prints these instructions
	
PARAMETERS

--delimitters		default is ':\\s+' (treats first colon and space as a column boundary)
--prefixes			defaults is empty string
--suffixes			default is ''
--spacingString		default is ' ' (space)
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