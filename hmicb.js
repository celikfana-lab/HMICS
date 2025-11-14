// Name: HMICB Reader
// ID: hmicbReader
// Description: View HMICB animation files directly on the Scratch stage using Pen+
// License: MIT

(function (Scratch) {
  "use strict";

  if (!Scratch.extensions.unsandboxed) {
    throw new Error("HMICB Reader must be run unsandboxed!");
  }

const penPlus =
  Scratch.extensions.getExtension("penP") ||
  Scratch.extensions.getExtension("penplus") ||
  Scratch.extensions.getExtension("penPlus");


  if (!penPlus) {
    alert("⚠️ Please load Pen+ (penPlus.js) before this extension!");
    return;
  }

  let animation = null;
  let frames = [];
  let currentFrame = 0;
  let playing = false;
  let fps = 30;
  let loop = false;
  let timer = null;

  // Helper: select and read a file as ArrayBuffer
  function selectFile() {
    return new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".hmicb";
      input.onchange = () => {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = () => resolve(new Uint8Array(reader.result));
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      };
      input.click();
    });
  }

  // Parse raw HMICB file into frames
  function parseHMICB(data) {
    let o = 0;
    const magic = String.fromCharCode(...data.slice(0, 5));
    if (magic !== "HMICB") throw new Error("Invalid file (missing HMICB header)");
    o += 5;

    const version = data[o++];
    const width = data[o] | (data[o + 1] << 8);
    o += 2;
    const height = data[o] | (data[o + 1] << 8);
    o += 2;
    fps = data[o] | (data[o + 1] << 8);
    o += 2;
    const totalFrames =
      data[o] |
      (data[o + 1] << 8) |
      (data[o + 2] << 16) |
      (data[o + 3] << 24);
    o += 4;
    loop = data[o++] === 1;
    o += 1 + 14; // skip compression flag + reserved

    const index = [];
    for (let i = 0; i < totalFrames; i++) {
      const frameOffset =
        data[o] |
        (data[o + 1] << 8) |
        (data[o + 2] << 16) |
        (data[o + 3] << 24);
      o += 4;
      const frameSize =
        data[o] |
        (data[o + 1] << 8) |
        (data[o + 2] << 16) |
        (data[o + 3] << 24);
      o += 4;
      const frameType = data[o++];
      index.push({ frameOffset, frameSize, frameType });
    }

    frames = [];
    let prevFrame = null;

    for (let i = 0; i < index.length; i++) {
      const { frameOffset, frameSize, frameType } = index[i];
      const chunk = data.slice(frameOffset, frameOffset + frameSize);

      if (frameType === 0) {
        frames.push(chunk);
        prevFrame = chunk;
      } else {
        const out = new Uint8ClampedArray(prevFrame);
        let pos = 0;
        const count =
          chunk[pos++] |
          (chunk[pos++] << 8) |
          (chunk[pos++] << 16) |
          (chunk[pos++] << 24);
        for (let j = 0; j < count; j++) {
          const x = chunk[pos++] | (chunk[pos++] << 8);
          const y = chunk[pos++] | (chunk[pos++] << 8);
          const r = chunk[pos++],
            g = chunk[pos++],
            b = chunk[pos++],
            a = chunk[pos++];
          const idx = (y * width + x) * 4;
          out[idx] = r;
          out[idx + 1] = g;
          out[idx + 2] = b;
          out[idx + 3] = a;
        }
        frames.push(out);
        prevFrame = out;
      }
    }

    animation = { width, height, totalFrames, version };
  }

  // Draw a single frame using Pen+
  function drawFrame(n) {
    if (!animation || !frames[n]) return;
    penPlus.clear();
    const { width, height } = animation;
    const pixels = frames[n];
    let idx = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const r = pixels[idx++],
          g = pixels[idx++],
          b = pixels[idx++],
          a = pixels[idx++];
        if (a > 0) {
          penPlus.setPenColor([r, g, b]);
          penPlus.drawPixel(x, height - y);
        }
      }
    }
  }

  // Animation controls
  function play() {
    if (!animation || playing) return;
    playing = true;
    const delay = 1000 / fps;
    timer = setInterval(() => {
      drawFrame(currentFrame);
      currentFrame++;
      if (currentFrame >= frames.length) {
        if (loop) currentFrame = 0;
        else pause();
      }
    }, delay);
  }

  function pause() {
    playing = false;
    clearInterval(timer);
    timer = null;
  }

  function stop() {
    pause();
    currentFrame = 0;
    drawFrame(0);
  }

  // Scratch blocks
  class HMICBReader {
    getInfo() {
      return {
        id: "hmicbReader",
        name: "HMICB Reader",
        color1: "#9c27b0",
        color2: "#7b1fa2",
        blocks: [
          {
            opcode: "load",
            blockType: Scratch.BlockType.COMMAND,
            text: "load HMICB file",
          },
          {
            opcode: "play",
            blockType: Scratch.BlockType.COMMAND,
            text: "play animation",
          },
          {
            opcode: "pause",
            blockType: Scratch.BlockType.COMMAND,
            text: "pause animation",
          },
          {
            opcode: "stop",
            blockType: Scratch.BlockType.COMMAND,
            text: "stop animation",
          },
          {
            opcode: "drawFrame",
            blockType: Scratch.BlockType.COMMAND,
            text: "draw frame [n]",
            arguments: {
              n: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
            },
          },
        ],
      };
    }

    async load() {
      const data = await selectFile();
      parseHMICB(data);
      currentFrame = 0;
      drawFrame(0);
      console.log("✅ HMICB loaded:", animation);
    }

    play() {
      play();
    }
    pause() {
      pause();
    }
    stop() {
      stop();
    }
    drawFrame({ n }) {
      drawFrame(Math.max(0, Math.min(frames.length - 1, Math.floor(n))));
    }
  }

  Scratch.extensions.register(new HMICBReader());
})(Scratch);


