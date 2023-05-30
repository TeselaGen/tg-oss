import isBrowser from "./isBrowser";

export default function getArrayBufferFromFile(file) {
  if (!isBrowser) { //node environment
    return toArrayBuffer(Buffer.isBuffer(file) ? file : file.buffer || file);
  }

  const reader = new window.FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    reader.onerror = (err) => {
      console.error("err:", err);
      reject(err);
    };
    reader.readAsArrayBuffer(Buffer.isBuffer(file) ? file : file.buffer || file);
  });
}

function toArrayBuffer(buffer) {
  const ab = new ArrayBuffer(buffer.length);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  return ab;
}
