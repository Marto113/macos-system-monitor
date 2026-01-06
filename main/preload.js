const { contextBridge } = require("electron");

const platform = process.platform;

let backend;

if (platform === "darwin") {
  backend = require("./platform/darwin");
} else if (platform === "win32") {
  backend = require("./platform/windows");
} else {
  throw new Error(`Unsupported platform: ${platform}`);
}

contextBridge.exposeInMainWorld("api", backend);
