// Name: HMICB Reader
// ID: hmicbReader
// Description: View HMICB animation files directly on the Scratch stage using Pen+
// License: MIT

(function (Scratch) {
  "use strict";

  if (!Scratch.extensions.unsandboxed) {
    throw new Error("HMICB Reader must be run unsandboxed!");
  }

  // ----------------------------
  // WAIT FOR PEN+ (REAL FIX)
  // ----------------------------

  async function waitForPenPlus() {
    return new Promise(resolve => {
      const check = () => {
        const pp =
          window.PenPlus ||
          window.penPlus ||
          window.penp ||
          window.penP ||
          window.pen_renderer ||
          window.penRenderer;

        if (pp && typeof pp.drawPixel === "function") {
          console.log("[HMICB Reader] Pen+ found:", pp);
          resolve(pp);
        } else {
          setTimeout(check, 50);
        }
      };
      check();
    });
  }

  // -----------------------------------
  // HMICB READER IMPLEMENTATION
  // -----------------------------------

  let penPlus = null;
  let animation = null;
  let frames = [];
  let currentFrame = 0;
  let playing = false;
  let fps = 30;
  let loop = false;
  let timer = null;

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

  function parseHMICB(data) {
    let o = 0;

    if (String.fromCharCode(...data.slice(0, 5)) !== "HMICB") {
      throw new Error("Invalid HMICB file.");
    }
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

    const compression = data[o++];
    o += 14;

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

    for (const entry of index) {
      const chunk = data.slice(entry.frameOffset, entry.frameOffset + entry.frameSize);

      if (entry.frameType === 0) {
        // Keyframe
        const full = new Uint8ClampedArray(chunk);
        frames.push(full);
        prevFrame = full;
      } else {
        if (!prevFrame) throw new Error("Delta before keyframe.");

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

          const idx = (y * width + x) * 4;
          out[idx] = chunk[pos++];
          out[idx + 1] = chunk[pos++];
          out[idx + 2] = chunk[pos++];
          out[idx + 3] = chunk[pos++];
        }

        frames.push(out);
        prevFrame = out;
      }
    }

    animation = { width, height, totalFrames, version, compression };
  }

  function drawFrame(n) {
    if (!animation || !frames[n]) return;

    const { width, height } = animation;
    const pixels = frames[n];

    penPlus.clearFast?.() || penPlus.clear?.();

    let i = 0;
    for (let y = 0; y < height; y++) {
      const yy = height - 1 - y;
      for (let x = 0; x < width; x++) {
        const r = pixels[i++];
        const g = pixels[i++];
        const b = pixels[i++];
        const a = pixels[i++];

        if (a > 0) {
          penPlus.setPenColor([r, g, b]);
          penPlus.drawPixel(x, yy);
        }
      }
    }
  }

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

  class HMICBReader {
    getInfo() {
      return {
        id: "hmicbReader",
        name: "HMICB Reader",
        color1: "#9c27b0",
        color2: "#7b1fa2",
        blocks: [
          { opcode: "load", blockType: Scratch.BlockType.COMMAND, text: "load HMICB file" },
          { opcode: "play", blockType: Scratch.BlockType.COMMAND, text: "play animation" },
          { opcode: "pause", blockType: Scratch.BlockType.COMMAND, text: "pause animation" },
          { opcode: "stop", blockType: Scratch.BlockType.COMMAND, text: "stop animation" },
          {
            opcode: "drawFrame",
            blockType: Scratch.BlockType.COMMAND,
            text: "draw frame [n]",
            arguments: { n: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 } },
          }
        ]
      };
    }

    async load() {
      const data = await selectFile();
      parseHMICB(data);
      currentFrame = 0;
      drawFrame(0);
      console.log("[HMICB Reader] Loaded:", animation);
    }

    play() { play(); }
    pause() { pause(); }
    stop() { stop(); }

    drawFrame({ n }) {
      const clamped = Math.max(0, Math.min(frames.length - 1, Math.floor(n)));
      drawFrame(clamped);
    }
  }

  // -----------------------------------
  // REGISTER EXTENSION *AFTER* Pen+
  // -----------------------------------
  waitForPenPlus().then(pp => {
    penPlus = pp;
    Scratch.extensions.register(new HMICBReader());
  });

})(Scratch);
