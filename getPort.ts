import * as crypto from "crypto";

export function getPort(inputString: string) {
  const hash = crypto.createHash("sha256");
  hash.update(inputString);
  let hashValue = parseInt(hash.digest("hex").substring(0, 15), 16); // Get a large number from the hash.
  hashValue = Math.abs(hashValue); // Ensure it is non-negative.
  return 2000 + (hashValue % (9000 - 2000 + 1)); // Scale it to be in [2000, 65535].
}
