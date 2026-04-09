import "./style.css";

async function initWebGPU() {
  // 1. Dobijanje adaptera (GPU)
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) return;

  // 2. Dobijanje uređaja
  const device = await adapter.requestDevice();

  // 3. Konfiguracija Canvas-a
  const canvas = document.querySelector("canvas") as HTMLCanvasElement;

  const context = canvas.getContext("webgpu")!;

  context.configure({
    device,
    format: navigator.gpu.getPreferredCanvasFormat(),
  });

  console.log("WebGPU je spreman!", device);
}

await initWebGPU();
