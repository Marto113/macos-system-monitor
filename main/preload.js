const { contextBridge } = require('electron');
const os = require('os');
const { exec } = require("child_process");

let lastNetSample = null;
let lastNetTime = null;

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
  },

  // get storage info
  getStorageInfo: () => {
    return new Promise((resolve, reject) => {
      exec(
        "df -h /System/Volumes/Data",
        (err, stdout) => {
          if (err) return reject(err);

          const lines = stdout.trim().split("\n");
          const dataLine = lines[1].split(/\s+/);

          const usedStorage = parseFloat(dataLine[2]);
          const availableStorage = parseFloat(dataLine[3]);

          resolve({
            usedStorage,
            availableStorage
          })
        }
      )
    });
  },

  // get app resource usage info
  getAppResourceUsage: async () => {
    const a = await sampleOnce();
    await new Promise(r => setTimeout(r, 300));
    const b = await sampleOnce();

    return {
      resourceInfo: {
        cpu: Number(((a.cpu + b.cpu) / 2).toFixed(2)),
        memoryMB: Number(b.mem.toFixed(2))
      }
    };
  },

  getNetworkUsage: () => {
  return new Promise((resolve, reject) => {
    exec(
      `netstat -ib | awk '$1=="en0" {print $7, $10}'`,
      (err, stdout) => {
        if (err) return reject(err);

        const [rxBytes, txBytes] = stdout
          .trim()
          .split(/\s+/)
          .map(Number);

        const now = Date.now();

        if (!lastNetSample) {
          lastNetSample = { rxBytes, txBytes };
          lastNetTime = now;
          return resolve({
            downloadKB: 0,
            uploadKB: 0
          });
        }

        const timeDiffSec = (now - lastNetTime) / 1000;

        const downloadKB =
          (rxBytes - lastNetSample.rxBytes) / 1024 / timeDiffSec;

        const uploadKB =
          (txBytes - lastNetSample.txBytes) / 1024 / timeDiffSec;

        lastNetSample = { rxBytes, txBytes };
        lastNetTime = now;

        resolve({
          downloadKB: Math.max(0, Number(downloadKB.toFixed(2))),
          uploadKB: Math.max(0, Number(uploadKB.toFixed(2)))
        });
      }
    );
  });
}

});

function sampleOnce() {
  return new Promise((resolve, reject) => {
    const cmd =
      `ps -A -o %cpu,rss,comm | grep -i macos-system-monitor | ` +
      `awk '{ cpu += $1; mem += $2 } END { printf "%.2f %.2f", cpu, mem/1024 }'`;

    exec(cmd, (err, stdout) => {
      if (err) return reject(err);

      const [cpu, mem] = stdout.trim().split(" ").map(Number);
      resolve({ cpu, mem });
    });
  });
}