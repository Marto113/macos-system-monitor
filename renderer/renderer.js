window.addEventListener("DOMContentLoaded", async () => {
  // basic error checks
  if (!window.api) {
    console.error("window.api is not available");
    return;
  }

  const cpuEl = document.getElementById("cpu");
  const cpuModelEl = document.getElementById("cpu-model");
  const memEl = document.getElementById("memory");
  const cpuCanvas = document.getElementById("cpuChart");
  const memCanvas = document.getElementById("memChart");


  if (!cpuEl || !cpuModelEl || !memEl || !cpuCanvas || !memCanvas) {
    console.error("Missing DOM elements");
    return;
  }

  if (!window.Chart) {
    console.error("Chart.js not loaded");
    return;
  }

  const cpuInfo = window.api.getCpuInfo();
  if (!Array.isArray(cpuInfo) || cpuInfo.length === 0) {
    console.error("Invalid CPU info:", cpuInfo);
    return;
  }

  cpuModelEl.textContent = `CPU: ${cpuInfo[0].model}`;

  // load chart
  const MAX_POINTS = 60;
  const cpuData = [];
  const cpuLabels = [];

  const cpuChart = new window.Chart(cpuCanvas, {
    type: "line",
    data: {
      labels: cpuLabels,
      datasets: [
        {
          data: cpuData,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.3,
          pointRadius: 2
        }
      ]
    },
    options: {
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0,
          max: 100,
          suggestedMin: 0,
          suggestedMax: 100
        }
      },
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: "CPU Usage (%)",
          color: "#ffffff",
          font: {
            size: 14,
            weight: "500"
          }
        }
      }
    }
  });

  const MAX_POINTS_MEM = 12;
  const memData = [];
  const memLabels = [];

  const memChart = new window.Chart(memCanvas, {
    type: "line",
    data: {
      labels: memLabels,
      datasets: [
        {
          data: memData,
          borderColor: "rgba(236, 113, 91, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.3,
          pointRadius: 2
        }
      ]
    },
    options: {
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0
        }
      },  
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: "Memory Usage (GB)",
          color: "#ffffff",
          font: {
            size: 14,
            weight: "500"
          }
        }
      }
    },
  });
  
  // handle CPU chart data
  function addCpuPoint(value) {
    if (!Number.isFinite(value)) return;

    cpuData.push(value);
    cpuLabels.push("");

    if (cpuData.length > MAX_POINTS) {
      cpuData.shift();
      cpuLabels.shift();
    }

    cpuChart.update("none");
  }

  // handle MEMORY chart data
  function addMemPoint(value) {
    if (!Number.isFinite(value)) return;

    memData.push(value);
    memLabels.push("");

    if (memData.length > MAX_POINTS_MEM) {
      memData.shift();
      memLabels.shift();
    }

    memChart.update("none");
  }

  let updatingCpu = false;
  let updatingMem = false;

  async function updateCpuStats() {
    if (updatingCpu) return;
    updatingCpu = true;

    try {
      const cpuUsage = await window.api.getCpuUsage();
      const usage = Number(cpuUsage.usagePercent);

      cpuEl.textContent =
        `CPU cores: ${cpuInfo.length} | Usage: ${usage}%`;

      addCpuPoint(usage);
    } catch (err) {
      console.error("CPU update failed:", err);
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
      const availGB = (memInfo.availableBytes / 1024 ** 3).toFixed(2);

      const yLabel = parseInt(totalGB)
      memChart.options.scales.y.max = yLabel;

      addMemPoint(Number(usedGB));

      memEl.textContent =
        `RAM: ${usedGB} GB used / ${totalGB} GB total ` +
        `(${availGB} GB available)`;
    } catch (err) {
      console.error("Memory update failed:", err);
    } finally {
      updatingMem = false;
    }
  }

  await updateCpuStats();
  await updateMemoryStats();

  setInterval(updateCpuStats, 1000);   
  setInterval(updateMemoryStats, 5000);
});
