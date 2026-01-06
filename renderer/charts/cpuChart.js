import { COLORS } from "./colors.js";

export function createCpuChart(canvas) {
  const data = [];
  const labels = [];

  const chart = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [{
        data,
        borderColor: COLORS.cpu.line,
        backgroundColor: COLORS.cpu.fill,
        tension: 0.3,
        pointRadius: 2
      }]
    },
    options: {
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { min: 0, max: 100 },
        x: { display: false }
      },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "CPU Usage (%)",
          color: COLORS.text
        }
      }
    }
  });

  function push(value) {
    data.push(value);
    labels.push("");

    if (data.length > 60) {
      data.shift();
      labels.shift();
    }

    chart.update("none");
  }

  return { push };
}
