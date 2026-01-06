window.addEventListener("DOMContentLoaded", async () => {
  // basic error checks
  if (!window.api) {
    console.error("window.api is not available");
    return;
  }

  const cpuEl = document.getElementById("cpu");
  const cpuModelEl = document.getElementById("cpu-model");
  const memEl = document.getElementById("memory");
  const resEl = document.getElementById("resources");
  const cpuCanvas = document.getElementById("cpuChart");
  const memCanvas = document.getElementById("memChart");
  const memDoughnutCanvas = document.getElementById("memChartDoughnut");
  const storageDoughnutCanvas = document.getElementById("storageChartDoughnut");

  if (!cpuEl || !cpuModelEl || !memEl || !cpuCanvas || !memCanvas || !memDoughnutCanvas) {
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

  // chart colors
  const CHART_COLORS = {
    cpu: {
      line: "#4DD0E1",
      fill: "rgba(77, 208, 225, 0.25)"
    },
    memory: {
      line: "#FF8A65",
      fill: "rgba(255, 138, 101, 0.25)"
    },
    text: "#E6E6E6",
    grid: "rgba(255,255,255,0.08)",
    ticks: "rgba(230,230,230,0.7)"
  };

  // ---------------- CPU LINE CHART ----------------

  const MAX_POINTS = 60;
  const cpuData = [];
  const cpuLabels = [];

  const cpuChart = new window.Chart(cpuCanvas, {
    type: "line",
    data: {
      labels: cpuLabels,
      datasets: [{
        data: cpuData,
        borderColor: CHART_COLORS.cpu.line,
        backgroundColor: CHART_COLORS.cpu.fill,
        tension: 0.3,
        pointRadius: 2
      }]
    },
    options: {
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: {
            color: CHART_COLORS.ticks
          },
          grid: {
            color: CHART_COLORS.grid
          }
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
          text: "CPU Usage (%)",
          color: CHART_COLORS.text,
          font: {
            size: 14,
            weight: "500"
          }
        }
      }
    }
  });

  // ---------------- MEMORY LINE CHART ----------------

  const MAX_POINTS_MEM = 12;
  const memData = [];
  const memLabels = [];

  const memChart = new window.Chart(memCanvas, {
    type: "line",
    data: {
      labels: memLabels,
      datasets: [{
        data: memData,
        borderColor: CHART_COLORS.memory.line,
        backgroundColor: CHART_COLORS.memory.fill,
        tension: 0.3,
        pointRadius: 2
      }]
    },
    options: {
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0,
          ticks: {
            color: CHART_COLORS.ticks
          },
          grid: {
            color: CHART_COLORS.grid
          }
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
          text: "Memory Usage (GB)",
          color: CHART_COLORS.text,
          font: {
            size: 14,
            weight: "500"
          }
        }
      }
    }
  });

  // ---------------- MEMORY DOUGHNUT CHART ----------------

  const memDataDoughnut = [0, 0];
  const memLabelsDoughnut = ["Used", "Free"];

  const memChartDoughnut = new window.Chart(memDoughnutCanvas, {
    type: "doughnut",
    data: {
      labels: memLabelsDoughnut,
      datasets: [{
        data: memDataDoughnut,
        backgroundColor: [
          CHART_COLORS.memory.line,
          CHART_COLORS.cpu.line
        ],
        borderWidth: 0
      }]
    },
    options: {
      maintainAspectRatio: false,
      animation: false,
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: CHART_COLORS.text
          }
        },
        title: {
          display: true,
          text: "Memory Distribution",
          color: CHART_COLORS.text,
          font: {
            size: 14,
            weight: "500"
          }
        }
      }
    }
  });

  // ---------------- STORAGE DOUGHNUT CHART ----------------

  const storageDataDoughnut = [0, 0];
  const storageLabelsDoughnut = ["Used", "Free"];

  const storageChartDoughnut = new window.Chart(storageDoughnutCanvas, {
    type: "doughnut",
    data: {
      labels: storageLabelsDoughnut,
      datasets: [{
        data: storageDataDoughnut,
        backgroundColor: [
          CHART_COLORS.memory.line,
          CHART_COLORS.cpu.line
        ],
        borderWidth: 0
      }]
    },
    options: {
      maintainAspectRatio: false,
      animation: false,
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: CHART_COLORS.text
          }
        },
        title: {
          display: true,
          text: "Storage Distribution",
          color: CHART_COLORS.text,
          font: {
            size: 14,
            weight: "500"
          }
        }
      }
    }
  });

  // ---------------- HANDLE DATASET FUNCTIONS ----------------

  // ---------------- CPU LINE DATASET ----------------
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

  // ---------------- MEMORY LINE DATASET ----------------
  function addMemPoint(value) {
    if (!Number.isFinite(value)) return;

    memData.push(value);
    memLabels.push("");

    if(memData.length === 1) {
      memData.push(value);
      memLabels.push("");
    }

    if (memData.length > MAX_POINTS_MEM) {
      memData.shift();
      memLabels.shift();
    }

    memChart.update("none");
  }
  
  // ---------------- MEMORY DOUGHNUT DATASET ----------------
  function addMemPointDoughnut(used, free) {
    if (!Number.isFinite(used) || !Number.isFinite(free)) return;

    memDataDoughnut[0] = used;
    memDataDoughnut[1] = free;

    memChartDoughnut.update("none");
  }

  function addStoragePointDoughnut(used, available) {
    if (!Number.isFinite(used) || !Number.isFinite(available)) return;

    storageDataDoughnut[0] = used;
    storageDataDoughnut[1] = available;

   storageChartDoughnut.update("none");
  }

  // ---------------- SEND OVER DATA ----------------
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
      addMemPointDoughnut(Number(usedGB), Number(availGB));

      memEl.textContent =
        `RAM: ${usedGB} GB used / ${totalGB} GB total ` +
        `(${availGB} GB available)`;
    } catch (err) {
      console.error("Memory update failed:", err);
    } finally {
      updatingMem = false;
    }
  } 

  async function updateStorageStats() {
    try {
      const storageInfo = await window.api.getStorageInfo();

      const usedStorage = storageInfo.usedStorage;
      const availableStorage = storageInfo.availableStorage;

      addStoragePointDoughnut(usedStorage, availableStorage);
    } catch (err) {
      console.error("Storage update failed:", err);
    } 
  }

  async function updateAppResourceUsage() {
    try {
      const appResourceInfo = await window.api.getAppResourceUsage();

      const resources = appResourceInfo.resourceInfo;

      resEl.textContent = `App resources: ${resources.cpu}% | ${resources.memoryMB}MB`;
    } catch (err) {
      console.error("App resources update failed:", err);
    }
  }

  await updateCpuStats();
  await updateMemoryStats();
  await updateStorageStats();
  await updateAppResourceUsage();

  setInterval(updateAppResourceUsage, 1000)
  setInterval(updateCpuStats, 1000);   
  setInterval(updateMemoryStats, 5000);
});
