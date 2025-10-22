function chunkText(text, maxChunkSize = 1000) {
  const chunks = [];
  let currentChunk = "";
  const sentences = text.split(/\.(?=\s|$)|\n\n/); // Split by sentence-ending periods or double newlines

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length + 2 <= maxChunkSize) { // +2 for separator
      currentChunk += (currentChunk.length > 0 ? ". " : "") + sentence.trim();
    } else {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = sentence.trim();
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

module.exports = { chunkText };
