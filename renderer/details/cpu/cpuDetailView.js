export function renderCpuProcessList(processes) {
  const container = document.getElementById("cpu-process-rows");
  if (!container) return;

  const mode = container.dataset.mode ?? "user";
  container.innerHTML = "";

  for (const p of processes) {
    if (!shouldRenderProcess(p, mode)) continue;

    const row = document.createElement("div");
    row.className = "process-row";

    row.innerHTML = `
      <span>${val(p.appName ?? p.comm)}</span>
      <span>${val(p.pid)}</span>
      <span>${val(p.user)}</span>
      <span>${val(p.cpu, 0).toFixed(1)}</span>
      <span>${val(p.cpuTime)}</span>
      <span>${val(p.mem, 0).toFixed(1)}</span>
    `;

    container.appendChild(row);
  }
}

function val(v, fallback = "—") {
  return v === undefined || v === null || v === "" ? fallback : v;
}

function shouldRenderProcess(p, mode) {
  if (mode === "system") {
    return true;
  }

  // USER MODE
  if (p.pid <= 500) return false;
  if (p.user === "root") return false;
  if (p.user?.startsWith("_")) return false;

  return true;
}
