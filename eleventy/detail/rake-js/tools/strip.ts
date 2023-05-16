function condenseWhitespace(s: string): string {
	return s.trim().replace(/\s{2,}/gu, ' ');
}

// replace all non-word characters from string
export default function strip(text: string): string {
  const txt = text
    .replace(/[^a-zäöüß']/gi, ' ')
    .replace(/(^|\s)+\w($|\s)+/g, ' ')
  return condenseWhitespace(txt)
}
