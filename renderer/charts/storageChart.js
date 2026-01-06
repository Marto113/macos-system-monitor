import { COLORS } from "./colors.js";

export function createStorageChart(canvas) {
  const data = [0, 0];

  const chart = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: ["Used", "Free"],
      datasets: [{
        data,
        backgroundColor: [
          COLORS.storage.used,
          COLORS.storage.free
        ],
        borderWidth: 0
      }]
    },
    options: {
      animation: false,
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: COLORS.text }
        },
        title: {
          display: true,
          text: "Storage Distribution",
          color: COLORS.text
        }
      }
    }
  });

  function set(used, free) {
    if (!Number.isFinite(used) || !Number.isFinite(free)) return;
    data[0] = used;
    data[1] = free;
    chart.update("none");
  }

  return { set };
}
