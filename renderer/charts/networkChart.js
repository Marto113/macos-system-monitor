import { COLORS } from "./colors.js";

const MAX_POINTS = 60;

export function createNetworkChart(canvas) {
  const down = [];
  const up = [];
  const labels = [];

  let lastDown = 0;
  let lastUp = 0;

  const chart = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          data: down,
          borderColor: COLORS.net.down,
          backgroundColor: COLORS.net.downFill,
          tension: 0.3,
          pointRadius: 0
        },
        {
          data: up,
          borderColor: COLORS.net.up,
          backgroundColor: COLORS.net.upFill,
          tension: 0.3,
          pointRadius: 0
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
          ticks: { color: COLORS.ticks },
          grid: { color: COLORS.grid }
        },
        x: { display: false }
      },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Network Activity (KB/s)",
          color: COLORS.text
        }
      }
    }
  });

  function push(downloadKB, uploadKB) {
    if (Number.isFinite(downloadKB) && downloadKB > 0) {
      lastDown = downloadKB;
    }
    if (Number.isFinite(uploadKB) && uploadKB > 0) {
      lastUp = uploadKB;
    }

    down.push(lastDown);
    up.push(lastUp);
    labels.push("");

    if (labels.length > MAX_POINTS) {
      down.shift();
      up.shift();
      labels.shift();
    }

    chart.update("none");
  }

  return { push };
}
