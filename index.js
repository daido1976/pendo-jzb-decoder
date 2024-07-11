export function decodeBase64Url(input) {
  input = input.replace(/-/g, "+").replace(/_/g, "/");
  return atob(input);
}

export async function decompress(data) {
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

export async function decodeJzb(jzbString) {
  const decoded = decodeBase64Url(jzbString);
  const compressedData = new Uint8Array(
    [...decoded].map((c) => c.charCodeAt(0))
  );
  const decompressedData = await decompress(compressedData);
  const jsonString = new TextDecoder().decode(decompressedData);
  return JSON.parse(jsonString);
}

async function handleInput() {
  const jzbInput = document.getElementById("jzbInput").value;
  const outputDiv = document.getElementById("output");
  try {
    const decodedJson = await decodeJzb(jzbInput);
    outputDiv.textContent = JSON.stringify(decodedJson, null, 2);
  } catch (err) {
    console.debug(`Error: ${err.message}`);
    outputDiv.textContent = "Please enter a valid JZB string.";
  }
}

document.getElementById("jzbInput").addEventListener("input", handleInput);
