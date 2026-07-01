export function renderHiddenFields(container, data) {
  container.replaceChildren(); //clear container avoiding duplicate fields
  if (!data) return; // sem data: container fica limpo, não quebra o fluxo
  for (const [className, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;

    const doc = container.ownerDocument;
    const input = doc.createElement('input');
    input.type = 'hidden';
    input.className = className;
    input.value = String(value);
    container.appendChild(input);
  }
}