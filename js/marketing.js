/** Editable commercial storyboard; uses only claims supplied by the author. */
export function createMarketingStoryboard({ name, audience, benefit, cta } = {}) {
  const product = String(name || "Seu sistema").trim();
  const publicName = String(audience || "sua equipe").trim();
  const value = String(benefit || "Apresente aqui o principal benefício do produto.").trim();
  const action = String(cta || "Agende uma demonstração").trim();
  const scenes = [
    [product, `Conheça ${product}`, `Conheça ${product}: uma apresentação para ${publicName}.`],
    ["Para quem é", `Uma solução para ${publicName}`, `Veja como ${product} pode fazer parte da rotina de ${publicName}.`],
    ["Principal benefício", value, value],
    ["Veja na prática", "Adicione capturas do produto para demonstrar esse benefício.", "Veja a seguir o produto em ação."],
    ["Próximo passo", action, `Quer conhecer ${product} em detalhes? ${action}.`],
  ];
  return {
    sceneLabels: Object.fromEntries(scenes.map(([title], index) => [index + 1, title])),
    steps: scenes.map(([title, description, caption], index) => ({
      id: `marketing-${index + 1}`, scene: index + 1, label: title,
      type: "slide", image: "", holdSeconds: 6,
      layout: { align: "center", valign: "center" },
      popover: { title, description, side: "bottom", align: "center" },
      caption, simulateClick: false, onNext: "advance",
    })),
  };
}
