// @ts-check
/**
 * @param {string} input
 */
function decodeBase64Url(input) {
  input = input.replace(/-/g, "+").replace(/_/g, "/");
  return atob(input);
}

/**
 * @param {Uint8Array} data
 */
async function decompress(data) {
  const cs = new DecompressionStream("deflate");
  const writer = cs.writable.getWriter();
  writer.write(data);
  writer.close();

  const reader = cs.readable.getReader();
  const chunks = [];
  let done, value;
  while ((({ done, value } = await reader.read()), !done)) {
    chunks.push(value);
  }
  return new Uint8Array(
    chunks.reduce((acc, chunk) => acc.concat(Array.from(chunk)), [])
  );
}

/**
 * @param {string} str
 */
async function decodeJzb(str) {
  const decoded = decodeBase64Url(str);
  const compressedData = new Uint8Array(
    [...decoded].map((c) => c.charCodeAt(0))
  );
  const decompressedData = await decompress(compressedData);
  const jsonString = new TextDecoder().decode(decompressedData);
  return JSON.parse(jsonString);
}

const jzbInput = /** @type {HTMLTextAreaElement} */ (
  document.getElementById("jzbInput")
);

const outputDiv = /** @type {HTMLDivElement} */ (
  document.getElementById("output")
);

jzbInput.addEventListener("input", async () => {
  try {
    const decodedJson = await decodeJzb(jzbInput.value);
    outputDiv.textContent = JSON.stringify(decodedJson, null, 2);
  } catch (err) {
    console.debug(`Error: ${err.message}`);
    outputDiv.textContent = "Please enter a valid JZB string.";
  }
});
