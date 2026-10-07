/** Same alphabet as the server's: no 0/O or 1/I/L, so a code reads back cleanly. */
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/** A random 6-character code. The server still checks it has never been used. */
export const generateCode = (length = 6) => {
  const values = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(values, (v) => CODE_ALPHABET[v % CODE_ALPHABET.length]).join('');
};
