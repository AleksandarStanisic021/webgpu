import "./style.css";

async function init() {
  if (!navigator.gpu) {
    throw new Error("WebGPU is not supported in this browser.");
  }
  const adapter = await navigator.gpu.requestAdapter({});

  if (!adapter) {
    throw new Error("Failed to get GPU adapter.");
  }

  const device = await adapter.requestDevice();

  const canvas = document.querySelector("#webgpu-canvas") as HTMLCanvasElement;
  if (!canvas) {
    throw new Error("Canvas element not found.");
  }

  const context = canvas.getContext("webgpu") as GPUCanvasContext;
  if (!context) {
    throw new Error("Failed to get WebGPU context.");
  }

  const format = navigator.gpu.getPreferredCanvasFormat();

  context.configure({
    device,
    format,
  });

  return { adapter, device, context, format };
}

async function run() {
  const { device, context, format } = await init();
  console.log("I do run...", device);
}
run().catch((err) => console.error(err));
