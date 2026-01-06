window.addEventListener("DOMContentLoaded", async () => {
  // ---------- BASIC CHECKS ----------
  if (!window.api || !window.Chart) {
    console.error("API or Chart.js not available");
    return;
  }

  const cpuEl = document.getElementById("cpu");
  const cpuModelEl = document.getElementById("cpu-model");
  const memEl = document.getElementById("memory");
  const resEl = document.getElementById("resources");

  const cpuCanvas = document.getElementById("cpuChart");
  const memCanvas = document.getElementById("memChart");
  const netCanvas = document.getElementById("networkChart");
  const storageCanvas = document.getElementById("storageChartDoughnut");

  if (!cpuEl || !cpuModelEl || !memEl || !cpuCanvas || !memCanvas || !netCanvas || !storageCanvas) {
    console.error("Missing DOM elements");
    return;
  }

  // ---------- CPU INFO ----------
  const cpuInfo = window.api.getCpuInfo();
  cpuModelEl.textContent = `CPU: ${cpuInfo[0].model}`;

  // ---------- COLORS ----------
  const COLORS = {
    cpu: { line: "#4DD0E1", fill: "rgba(77,208,225,0.25)" },
    mem: { line: "#FF8A65", fill: "rgba(255,138,101,0.25)" },
    net: {
      down: "#82B1FF",
      up: "#B388FF",
      downFill: "rgba(130,177,255,0.25)",
      upFill: "rgba(179,136,255,0.25)"
    },
    storage: { used: "#FF6E6E", free: "#69F0AE" },
    text: "#E6E6E6",
    grid: "rgba(255,255,255,0.08)",
    ticks: "rgba(230,230,230,0.7)"
  };

  // ---------- HELPERS ----------
  function baseLineOptions(title) {
    return {
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0,
          ticks: { color: COLORS.ticks },
          grid: { color: COLORS.grid }
        },
        x: {
          ticks: { display: false },
          grid: { display: false }
        }
      },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: title,
          color: COLORS.text,
          font: { size: 14, weight: "500" }
        }
      }
    };
  }

  // ---------- CPU CHART ----------
  const cpuData = [];
  const cpuLabels = [];

  const cpuChart = new Chart(cpuCanvas, {
    type: "line",
    data: {
      labels: cpuLabels,
      datasets: [{
        data: cpuData,
        borderColor: COLORS.cpu.line,
        backgroundColor: COLORS.cpu.fill,
        tension: 0.3,
        pointRadius: 2
      }]
    },
    options: {
      ...baseLineOptions("CPU Usage (%)"),
      scales: {
        ...baseLineOptions().scales,
        y: { min: 0, max: 100 }
      }
    }
  });

  // ---------- MEMORY CHART ----------
  const memData = [];
  const memLabels = [];

  const memChart = new Chart(memCanvas, {
    type: "line",
    data: {
      labels: memLabels,
      datasets: [{
        data: memData,
        borderColor: COLORS.mem.line,
        backgroundColor: COLORS.mem.fill,
        tension: 0.3,
        pointRadius: 2
      }]
    },
    options: baseLineOptions("Memory Usage (GB)")
  });

  // ---------- NETWORK CHART ----------
  const netDown = [];
  const netUp = [];
  const netLabels = [];

  const networkChart = new Chart(netCanvas, {
    type: "line",
    data: {
      labels: netLabels,
      datasets: [
        {
          data: netDown,
          borderColor: COLORS.net.down,
          backgroundColor: COLORS.net.downFill,
          tension: 0.3,
          pointRadius: 0
        },
        {
          data: netUp,
          borderColor: COLORS.net.up,
          backgroundColor: COLORS.net.upFill,
          tension: 0.3,
          pointRadius: 0
        }
      ]
    },
    options: baseLineOptions("Network Activity (KB/s)")
  });

  // ---------- STORAGE DOUGHNUT ----------
  const storageData = [0, 0];

  const storageChart = new Chart(storageCanvas, {
    type: "doughnut",
    data: {
      labels: ["Used", "Free"],
      datasets: [{
        data: storageData,
        backgroundColor: [COLORS.storage.used, COLORS.storage.free],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      animation: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: COLORS.text }
        },
        title: {
          display: true,
          text: "Storage Distribution",
          color: COLORS.text,
          font: { size: 14, weight: "500" }
        }
      }
    }
  });

  // ---------- DATA HELPERS ----------
  const MAX_POINTS = 60;

  function pushSeries(series, labels, value) {
    series.push(value);
    labels.push("");
    if (series.length > MAX_POINTS) {
      series.shift();
      labels.shift();
    }
  }

  function pushNetwork(down, up) {
    netDown.push(down);
    netUp.push(up);
    netLabels.push("");

    if (netLabels.length > MAX_POINTS) {
      netDown.shift();
      netUp.shift();
      netLabels.shift();
    }
  }

  // ---------- UPDATE LOOPS ----------
  async function updateCpu() {
    const { usagePercent } = await window.api.getCpuUsage();
    cpuEl.textContent = `CPU cores: ${cpuInfo.length} | Usage: ${usagePercent}%`;
    pushSeries(cpuData, cpuLabels, usagePercent);
    cpuChart.update("none");
  }

  async function updateMemory() {
    const memory = await window.api.getMemInfo();
    const used = +(memory.usedBytes / 1024 ** 3).toFixed(2);
    const total = +(memory.totalBytes / 1024 ** 3).toFixed(1);
    const free = +(memory.availableBytes / 1024 ** 3).toFixed(2);

    memChart.options.scales.y.max = Math.ceil(total);
    pushSeries(memData, memLabels, used);
    memChart.update("none");

    memEl.textContent = `RAM: ${used} GB used / ${total} GB total (${free} GB free)`;
  }

  async function updateNetwork() {
    const network = await window.api.getNetworkUsage();
    pushNetwork(network.downloadKB, network.uploadKB);
    networkChart.update("none");
  }

  async function updateStorage() {
    const storage = await window.api.getStorageInfo();
    storageData[0] = storage.usedStorage;
    storageData[1] = storage.availableStorage;
    storageChart.update("none");
  }

  async function updateAppResources() {
    const app = await window.api.getAppResourceUsage();
    resEl.textContent = `App: CPU ${app.resourceInfo.cpu}% | RAM ${app.resourceInfo.memoryMB} MB`;
  }

  // ---------- START ----------
  await updateCpu();
  await updateMemory();
  await updateNetwork();
  await updateStorage();
  await updateAppResources();

  setInterval(updateCpu, 1000);
  setInterval(updateNetwork, 1000);
  setInterval(updateMemory, 5000);
  setInterval(updateStorage, 15000);
  setInterval(updateAppResources, 1000);
});
