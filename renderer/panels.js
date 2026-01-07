import { openCpuDetail, closeCpuDetail } from "./details/cpu/cpuDetail.js";
import { renderCpuProcessList } from "./details/cpu/cpuDetailView.js";

export function initPanels() {
  const overlay = document.getElementById("detail-overlay");
  const panel = document.getElementById("detail-panel");
  const closeBtn = document.getElementById("close-panel");

  const cards = document.querySelectorAll(".card");
  const panels = document.querySelectorAll(".panel");

  function openPanel(panelName) {
    overlay.classList.remove("hidden");
    panel.classList.remove("hidden");

    panels.forEach(p => p.classList.add("hidden"));

    const active = document.getElementById(`panel-${panelName}`);
    if (!active) return;

    active.classList.remove("hidden");

    if (panelName === "cpu") {
      openCpuDetail(renderCpuProcessList);
    }
  }

  function closePanel() {
    overlay.classList.add("hidden");
    panel.classList.add("hidden");

    closeCpuDetail();
  }

  cards.forEach(card => {
    card.addEventListener("click", () => {
      const panelName = card.dataset.panel;
      if (panelName) openPanel(panelName);
    });
  });

  closeBtn.addEventListener("click", closePanel);
  overlay.addEventListener("click", closePanel);
}
