export type TokenType =
	'plain' | 'comment' | 'string' | 'keyword' | 'tag' | 'function' | 'punctuation';

const TOKENS =
	/(\/\/.*$)|('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)|(<\/?[\w.:-]+|\/?>)|\b(import|from|const|let|return|new|function|export|true|false|await|async)\b|([\w$]+)(?=\()|([{}()[\];,.=+\-*/:?!&|]+)/gm;

const TYPES: TokenType[] = ['comment', 'string', 'tag', 'keyword', 'function', 'punctuation'];

// A tiny highlighter for the snippets on the site, good enough for a handful of JS and Svelte lines.
export function highlight(code: string) {
	const tokens: { text: string; type: TokenType }[] = [];
	let last = 0;

	for (const match of code.matchAll(TOKENS)) {
		if (match.index > last) tokens.push({ text: code.slice(last, match.index), type: 'plain' });
		const group = match.slice(1).findIndex((value) => value !== undefined);
		tokens.push({ text: match[0], type: TYPES[group] });
		last = match.index + match[0].length;
	}

	if (last < code.length) tokens.push({ text: code.slice(last), type: 'plain' });
	return tokens;
}
