import { initPanels } from "./panels.js";
import { createCpuChart } from "./charts/cpuChart.js";
import { initCpuDetailControls } from "./details/cpu/cpuDetailControls.js";
import { createMemoryChart } from "./charts/memoryChart.js";
import { createNetworkChart } from "./charts/networkChart.js";
import { createStorageChart } from "./charts/storageChart.js";

window.addEventListener("DOMContentLoaded", async () => {
  if (!window.api || !window.Chart) {
    console.error("API or Chart.js not available");
    return;
  }

  // UI / panels
  initPanels();
  initCpuDetailControls();

  // DOM
  const cpuEl = document.getElementById("cpu");
  const cpuModelEl = document.getElementById("cpu-model");
  const memEl = document.getElementById("memory");
  const resEl = document.getElementById("resources");

  const cpuCanvas = document.getElementById("cpuChart");
  const memCanvas = document.getElementById("memChart");
  const netCanvas = document.getElementById("networkChart");
  const storageCanvas = document.getElementById("storageChartDoughnut");

  if (!cpuCanvas || !memCanvas || !netCanvas || !storageCanvas) {
    console.error("Missing canvas elements");
    return;
  }

  // CPU info (static)
  const cpuInfo = window.api.getCpuInfo();
  cpuModelEl.textContent = `CPU: ${cpuInfo[0].model}`;

  // Charts
  const cpuChart = createCpuChart(cpuCanvas);
  const memChart = createMemoryChart(memCanvas);
  const netChart = createNetworkChart(netCanvas);
  const storageChart = createStorageChart(storageCanvas);

  // Updates
  async function updateCpu() {
    const { usagePercent } = await window.api.getCpuUsage();
    cpuEl.textContent = `CPU cores: ${cpuInfo.length} | Usage: ${usagePercent}%`;
    cpuChart.push(usagePercent);
  }

  async function updateMemory() {
    const m = await window.api.getMemInfo();

    const used = +(m.usedBytes / 1024 ** 3).toFixed(2);
    const total = +(m.totalBytes / 1024 ** 3).toFixed(1);
    const free = +(m.availableBytes / 1024 ** 3).toFixed(2);

    memChart.push(used, total);
    memEl.textContent = `RAM: ${used} GB used / ${total} GB total (${free} GB free)`;
  }

  async function updateNetwork() {
    const n = await window.api.getNetworkUsage();
    netChart.push(n.downloadKB, n.uploadKB);
  }

  async function updateStorage() {
    const s = await window.api.getStorageInfo();
    storageChart.set(s.usedStorage, s.availableStorage);
  }

  async function updateAppResources() {
    const app = await window.api.getAppResourceUsage();
    resEl.textContent =
      `App: CPU ${app.resourceInfo.cpu}% | RAM ${app.resourceInfo.memoryMB} MB`;
  }

  // Initial paint
  await updateCpu();
  await updateMemory();
  await updateNetwork();
  await updateStorage();
  await updateAppResources();

  // Schedulers
  setInterval(updateCpu, 1000);
  setInterval(updateNetwork, 1000);
  setInterval(updateMemory, 5000);
  setInterval(updateStorage, 15000);
  setInterval(updateAppResources, 1000);
});
