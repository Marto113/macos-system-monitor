window.addEventListener("DOMContentLoaded", async () => {
  if (!window.api) {
    console.error("window.api is not available");
    return;
  }

  const cpuEl = document.getElementById("cpu");
  const cpuModelEl = document.getElementById("cpu-model");
  const memEl = document.getElementById("memory");

  if (!cpuEl || !cpuModelEl || !memEl) {
    console.error("Missing DOM elements");
    return;
  }

  const cpuInfo = window.api.getCpuInfo();
  if (!Array.isArray(cpuInfo) || cpuInfo.length === 0) {
    console.error("Invalid CPU info:", cpuInfo);
    return;
  }

  cpuModelEl.textContent = `CPU: ${cpuInfo[0].model}`;

  let updatingCpu = false;
  let updatingMem = false;

  async function updateCpuStats() {
    if (updatingCpu) return;
    updatingCpu = true;

    try {
      const [cpuUsage] = await Promise.all([
        window.api.getCpuUsage(),
      ]);

      cpuEl.textContent =
        `CPU cores: ${cpuInfo.length} | ` +
        `Usage: ${cpuUsage.usagePercent}%`;

    } catch (err) {
      console.error("Failed to update stats:", err);
    } finally {
      updatingCpu = false;
    }
  }

  async function updateMemoryStats() {
    if (updatingMem) return;
    updatingMem = true;

    try {
      const memInfo = await window.api.getMemInfo();

      const totalGB = (memInfo.totalBytes / 1024 ** 3).toFixed(1);
      const usedGB = (memInfo.usedBytes / 1024 ** 3).toFixed(2);
      const freeGB = (memInfo.availableBytes / 1024 ** 3).toFixed(2);

      memEl.textContent =
        `RAM: ${usedGB} GB used / ${totalGB} GB total ` +
        `(${freeGB} GB available)`;

    } catch (err) {
      console.error("Failed to update memory stats:", err);
    } finally {
      updatingMem = false;
    }
    }

  await updateCpuStats();
  await updateMemoryStats();

  setInterval(updateCpuStats, 1000); 
  setInterval(updateMemoryStats, 5000); 
});
