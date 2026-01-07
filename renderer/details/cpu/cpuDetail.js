import { updateCpuProcesses } from "./cpuDetailControls.js";

let interval = null;

export async function openCpuDetail() {
  async function tick() {
    const processes = await window.api.getCpuDetail();
    updateCpuProcesses(processes);
  }

  await tick();
  interval = setInterval(tick, 5000);
}

export function closeCpuDetail() {
  clearInterval(interval);
  interval = null;
}
