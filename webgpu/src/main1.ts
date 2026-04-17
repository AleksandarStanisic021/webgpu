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
  const encoder = device.createCommandEncoder();
  const pass = encoder.beginRenderPass({
    colorAttachments: [
      {
        view: context.getCurrentTexture().createView(),
        loadOp: "clear",
        clearValue: { r: 0.9, g: 0, b: 0, a: 1 },
        storeOp: "store",
      },
    ],
  });
  pass.end();

  const commandBuffer = encoder.finish();
  device.queue.submit([commandBuffer]);
  // device.queue.submit([encoder.finish()]);
  const vertices = new Float32Array([
    //   X,    Y,
    -0.8, -0.8, 0.8, -0.8, 0.8, 0.8, -0.8, 0.8,
  ]);

  const vertexBuffer = device.createBuffer({
    label: "Cell vertices",
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(vertexBuffer, /*bufferOffset=*/ 0, vertices);

  const vertexBufferLayout: GPUVertexBufferLayout = {
    arrayStride: 8,
    attributes: [
      {
        format: "float32x2",
        offset: 0,
        shaderLocation: 0, // Position, see vertex shader
      },
    ],
  };

  const cellShaderModule = device.createShaderModule({
    label: "Cell shader",
    code: `
  @vertex
fn vertexMain(@location(0) pos: vec2f) ->
  @builtin(position) vec4f {
  return vec4f(pos, 0, 1);
}
  @fragment
fn fragmentMain() -> @location(0) vec4f {
  return vec4f(1, 0.8, 0.2, 1);
}  
  `,
  });
  const cellPipeline = device.createRenderPipeline({
    label: "Cell pipeline",
    layout: "auto",
    vertex: {
      module: cellShaderModule,
      entryPoint: "vertexMain",
      buffers: [vertexBufferLayout],
    },
    fragment: {
      module: cellShaderModule,
      entryPoint: "fragmentMain",
      targets: [
        {
          format,
        },
      ],
    },
  });

  const renderPassDescriptor: GPURenderPassDescriptor = {
    colorAttachments: [
      {
        view: context.getCurrentTexture().createView(),
        loadOp: "clear",
        clearValue: { r: 0.9, g: 0, b: 0.5, a: 0.6 },
        storeOp: "store",
      },
    ],
  };

  const commandEncoder = device.createCommandEncoder();
  const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
  passEncoder.setPipeline(cellPipeline);
  passEncoder.setVertexBuffer(0, vertexBuffer);
  passEncoder.draw(vertices.length / 2);
  passEncoder.end();
  device.queue.submit([commandEncoder.finish()]);
}

run().catch((err) => {
  console.error(err);
});
