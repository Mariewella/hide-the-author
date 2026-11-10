const toggle = document.querySelector<HTMLInputElement>('#enabled')!;
const status = document.querySelector<HTMLElement>('#status')!;

function updateStatus() {
  status.textContent = toggle.checked ? 'Zapnutý' : 'Vypnutý';
}

toggle.addEventListener('change', async () => {
  await extensionEnabled.setValue(toggle.checked);
  updateStatus();
});

async function init() {
  toggle.checked = await extensionEnabled.getValue();
  updateStatus();
}

init();