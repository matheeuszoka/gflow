import test from "node:test";
import assert from "node:assert/strict";
import { exportWav } from "./exportWav.js";

test("offline WAV preserves frame count, rate and interleaved channels", async () => {
  const samples = [new Float32Array([-1, 0, 1]), new Float32Array([0.5, -0.5, 2])];
  const blob = exportWav({numberOfChannels: 2, length: 3, sampleRate: 48000, getChannelData: c => samples[c]});
  const data = new DataView(await blob.arrayBuffer());
  assert.equal(blob.size, 56);
  assert.equal(data.getUint32(24, true), 48000);
  assert.equal(data.getUint32(40, true), 12);
  assert.deepEqual(Array.from({length:6}, (_, i) => data.getInt16(44+i*2,true)), [-32768,16384,0,-16384,32767,32767]);
});
