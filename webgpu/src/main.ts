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
  const { device, context, format, adapter } = await init();
  console.log("I do run...", device);
  console.log("Adapter:", adapter);
  console.log("Context:", context);
  console.log("Format:", format);
  console.log("Device:", device);
  let pipeline = await device.createRenderPipelineAsync({
    layout: "auto",
    vertex: {
      module: device.createShaderModule({
        code: `
        @vertex 
        fn main(@builtin(vertex_index) vertexIndex : u32) -> @builtin(position) vec4<f32> {
          var pos = array<vec2<f32>, 3>(
            vec2<f32>(0.0, 0.5),
            vec2<f32>(-0.5, -0.5),
            vec2<f32>(0.5, -0.5)
          );
          return vec4<f32>(pos[vertexIndex], 0.0, 1.0);
        }
      `,
      }),
      entryPoint: "main",
    },
    fragment: {
      module: device.createShaderModule({
        code: `
        @fragment
        fn main() -> @location(0) vec4<f32> {
          return vec4<f32>(1.0, 0.0, 0.0, 1.0);
        }
      `,
      }),
      entryPoint: "main",
      targets: [{ format }],
    },
    primitive: {
      topology: "triangle-list",
    },
  });

  const commandEncoder = device.createCommandEncoder();
  const textureView = context.getCurrentTexture().createView();
  const renderPassDescriptor: GPURenderPassDescriptor = {
    colorAttachments: [
      {
        view: textureView,
        clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
        loadOp: "clear",
        storeOp: "store",
      },
    ],
  };
  const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
  passEncoder.setPipeline(pipeline);
  passEncoder.draw(3, 1, 0, 0);
  passEncoder.end();
  device.queue.submit([commandEncoder.finish()]);
}
run().catch((err) => console.error(err));
