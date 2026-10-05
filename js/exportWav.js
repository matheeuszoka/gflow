/** PCM preserves the offline mix without recording it in real time. */
export function exportWav(buffer) {
  const channels = buffer.numberOfChannels;
  const bytes = buffer.length * channels * 2;
  const data = new ArrayBuffer(44 + bytes);
  const view = new DataView(data);
  const text = (at, value) => [...value].forEach((c, i) => view.setUint8(at + i, c.charCodeAt(0)));
  text(0, "RIFF"); view.setUint32(4, 36 + bytes, true); text(8, "WAVE");
  text(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, channels, true); view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * channels * 2, true);
  view.setUint16(32, channels * 2, true); view.setUint16(34, 16, true);
  text(36, "data"); view.setUint32(40, bytes, true);
  const planes = Array.from({ length: channels }, (_, c) => buffer.getChannelData(c));
  for (let frame = 0; frame < buffer.length; frame++) {
    for (let c = 0; c < channels; c++) {
      const sample = Math.max(-1, Math.min(1, planes[c][frame]));
      view.setInt16(44 + (frame * channels + c) * 2, Math.round(sample * (sample < 0 ? 32768 : 32767)), true);
    }
  }
  return new Blob([data], { type: "audio/wav" });
}
