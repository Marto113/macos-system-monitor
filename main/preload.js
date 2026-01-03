const { contextBridge } = require('electron');
const os = require('os');
const { exec } = require("child_process");
const { resolve } = require('path');

contextBridge.exposeInMainWorld('api', {
  // get cpu model
  getCpuInfo: () => os.cpus(),

  // get cpu usage
  getCpuUsage: () => {
    return new Promise((resolve, reject) => {
      // get the total CPU usage on all cores 
      exec(
        "ps -A -o %cpu | awk '{s+=$1} END {print s}'",
        (err, stdout) => {
          if (err) return reject(err);

          const totalCpu = parseFloat(stdout.trim());

          exec(
            "sysctl -n hw.logicalcpu",
            (err2, stdout2) => {
              if (err2) return reject(err2);

              // calculate the usage based on the number of cores
              const cpuCores = parseInt(stdout2.trim(), 10);
              const usage = totalCpu / cpuCores;

              resolve({
                totalCpu,
                cpuCores,
                usagePercent: Math.round(usage * 100) / 100
              })
            }
          )
        }
      )
    })
  },

  // get memory usage
  getMemInfo: () => {
    return new Promise((resolve, reject) => {
      exec(
        "vm_stat",
        (err, stdout) => {
          if (err) return reject(err);

          const lines = stdout.split("\n");

          const pageSizeMatch = lines[0].match(/page size of (\d+) bytes/);
          const pageSize = pageSizeMatch ? parseInt(pageSizeMatch[1], 10) : 8192;

          let free = 0;
          let inactive = 0;
          let speculative = 0;

          for (const line of lines) {
            if (line.startsWith("Pages free:"))
              free = parseInt(line.replace(/\D+/g, ""), 10);
            else if (line.startsWith("Pages inactive:"))
              inactive = parseInt(line.replace(/\D+/g, ""), 10);
            else if (line.startsWith("Pages speculative:"))
              speculative = parseInt(line.replace(/\D+/g, ""), 10);
          }


          // const totalBytes = (os.totalmem() / 1024 ** 3).toFixed(1);
          const totalBytes = os.totalmem();
          const availableBytes =
            (free + inactive + speculative) * pageSize;

          const usedBytes = totalBytes - availableBytes;

          resolve({
            totalBytes,
            availableBytes,
            usedBytes
          });
        }
      )
    })
  }
});

