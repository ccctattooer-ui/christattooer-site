// A short list of passwords the admin will never accept, whatever ADMIN_PASSWORD_SHA256 is set to.
// The admin password is stored only as a hash, so nothing can check its strength when it is set;
// this checks the password on the way in instead. Every login route calls isWeakPassword() before
// it compares hashes, so "password" cannot get into the CMS or the flash quick-edit grid even if
// someone sets the secret to it by mistake.
//
// Deliberately only the obvious ones. No length or character rules: a rule like that would lock the
// account out of its own admin the moment it disagreed with the password already in use.

const BLOCKED = new Set([
  "password", "passw0rd", "password1", "password123", "passwords",
  "admin", "admin123", "administrator", "root", "toor",
  "letmein", "welcome", "secret", "changeme", "default", "login", "guest",
  "123456", "1234567", "12345678", "123456789", "1234567890", "12345", "111111", "000000",
  "qwerty", "qwerty123", "abc123", "iloveyou", "monkey", "dragon", "football", "sunshine",
  "christattooer", "tattoo", "tattoos", "chris",
]);

// Case and stray spaces don't make "Password " any better than "password".
export function isWeakPassword(pass) {
  return BLOCKED.has(String(pass ?? "").trim().toLowerCase());
}
