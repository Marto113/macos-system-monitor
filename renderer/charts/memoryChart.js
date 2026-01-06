import { COLORS } from "./colors.js";

const MAX_POINTS = 60;

export function createMemoryChart(canvas) {
  const data = [];
  const labels = [];

  const chart = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [{
        data,
        borderColor: COLORS.mem.line,
        backgroundColor: COLORS.mem.fill,
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
          ticks: { color: COLORS.ticks },
          grid: { color: COLORS.grid }
        },
        x: { display: false }
      },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Memory Usage (GB)",
          color: COLORS.text
        }
      }
    }
  });

  function push(usedGB, totalGB) {
    if (!Number.isFinite(usedGB)) return;

    chart.options.scales.y.max = Math.ceil(totalGB);

    data.push(usedGB);
    labels.push("");

    if (data.length > MAX_POINTS) {
      data.shift();
      labels.shift();
    }

    chart.update("none");
  }

  return { push };
}
