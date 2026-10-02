import test from "node:test";
import assert from "node:assert/strict";
import { createMarketingStoryboard } from "./marketing.js";

test("commercial storyboard preserves supplied claims and CTA in playable slides", () => {
  const result = createMarketingStoryboard({ name: "MPG", audience: "gestores", benefit: "Consulte a fila", cta: "Fale com vendas" });
  assert.equal(result.steps.length, 5);
  assert.equal(result.steps[2].popover.description, "Consulte a fila");
  assert.equal(result.steps[4].popover.description, "Fale com vendas");
  assert.match(result.steps[0].caption, /gestores/);
  assert.equal(new Set(result.steps.map(s => s.id)).size, 5);
  assert.ok(result.steps.every(s => s.type === "slide" && !s.simulateClick && s.caption && result.sceneLabels[s.scene]));
});

test("storyboards are independent and support empty brief", () => {
  const first = createMarketingStoryboard();
  first.steps[0].popover.title = "Changed";
  assert.equal(createMarketingStoryboard().steps[0].popover.title, "Seu sistema");
});
