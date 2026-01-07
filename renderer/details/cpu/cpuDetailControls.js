import { renderCpuProcessList } from "./cpuDetailView.js";

let lastProcesses = [];

export function initCpuDetailControls() {
  const container = document.getElementById("cpu-process-rows");
  const toggleBtn = document.getElementById("toggle-process-mode");

  if (!container || !toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    const mode =
      container.dataset.mode === "user" ? "system" : "user";

    container.dataset.mode = mode;
    toggleBtn.textContent =
      mode === "user" ? "Show system" : "Show user";

    renderCpuProcessList(lastProcesses);
  });
}

export function updateCpuProcesses(processes) {
  lastProcesses = processes;
  renderCpuProcessList(processes);
}
