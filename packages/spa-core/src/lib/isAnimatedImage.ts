/** Detects a multi-frame (animated) GIF or WEBP without fully decoding it. */
export async function isAnimatedImage(file: File): Promise<boolean> {
  if (file.type === "image/gif") return isAnimatedGif(await file.arrayBuffer());
  if (file.type === "image/webp") return isAnimatedWebp(await file.arrayBuffer());
  return false;
}

function isAnimatedGif(buf: ArrayBuffer): boolean {
  const bytes = new Uint8Array(buf);
  let frames = 0;
  // Image descriptor blocks start with 0x2C; more than one means animation.
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] === 0x2c) {
      frames++;
      if (frames > 1) return true;
    }
  }
  return false;
}

function isAnimatedWebp(buf: ArrayBuffer): boolean {
  const bytes = new Uint8Array(buf);
  const ascii = (offset: number, len: number) =>
    String.fromCharCode(...bytes.subarray(offset, offset + len));
  if (ascii(0, 4) !== "RIFF" || ascii(8, 4) !== "WEBP") return false;
  // Walk RIFF chunks looking for ANIM (animation params) or ANMF (a frame).
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const fourCC = ascii(offset, 4);
    if (fourCC === "ANIM" || fourCC === "ANMF") return true;
    const size = new DataView(buf).getUint32(offset + 4, true);
    offset += 8 + size + (size % 2);
  }
  return false;
}
