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

  const canvas = document.querySelector("canvas") as HTMLCanvasElement;
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
  const { device, context } = await init();
  console.log("I do run...", device);
  const encoder = device.createCommandEncoder();
  const pass = encoder.beginRenderPass({
    colorAttachments: [
      {
        view: context.getCurrentTexture().createView(),
        loadOp: "clear",
        clearValue: { r: 0.2, g: 0.3, b: 0.7, a: 1 },
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
  const vertexBufferLayout = {
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
      fn vs_main(@location(0) position: vec2<f32>) -> @builtin(position) vec4<f32> {
        return vec4(position, 0.0, 1.0);
      }

      @fragment
      fn fs_main() -> @location(0) vec4<f32> {
        return vec4(1.0, 0.5, 0.2, 1.0);
      }
    `,
  });

  const pipeline = device.createRenderPipeline({
    label: "Cell pipeline",
    layout: "auto",
    vertex: {
      module: cellShaderModule,
      entryPoint: "vs_main",
      buffers: [vertexBufferLayout],
    },
    fragment: {
      module: cellShaderModule,
      entryPoint: "fs_main",
      targets: [
        {
          format: navigator.gpu.getPreferredCanvasFormat(),
        },
      ],
    },
    primitive: {
      topology: "triangle-strip",
    },
  });

  const renderPassDescriptor: GPURenderPassDescriptor = {
    colorAttachments: [
      {
        view: context.getCurrentTexture().createView(),
        loadOp: "clear",
        clearValue: { r: 0.2, g: 0.3, b: 0.7, a: 1 },
        storeOp: "store",
      },
    ],
  };

  function frame() {
    const commandEncoder = device.createCommandEncoder();
    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(pipeline);
    passEncoder.setVertexBuffer(0, vertexBuffer);
    passEncoder.draw(4, 1, 0, 0);
    passEncoder.end();
    device.queue.submit([commandEncoder.finish()]);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

run();
