import "./style.css";

if (!navigator.gpu) {
  throw new Error("WebGPU nije podržan u ovom pretraživaču.");
} else {
  console.log("WebGPU je podržan!");
}
async function initWebGPU() {
  // 1. Dobijanje adaptera (GPU)
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) return;

  // 2. Dobijanje uređaja
  const device = await adapter.requestDevice();

  // 3. Konfiguracija Canvas-a
  const canvas = document.querySelector("canvas") as HTMLCanvasElement;
  console.log(canvas);

  const context = canvas.getContext("webgpu")!;

  context.configure({
    device,
    format: navigator.gpu.getPreferredCanvasFormat(),
  });

  console.log("WebGPU je spreman!", device);
}

initWebGPU();
