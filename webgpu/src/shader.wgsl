
struct Output {
    @builtin(position) Position: vec4<f32>,
    @location(0) vColor: vec4<f32>,
}

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> Output {
   var pos = array<vec2<f32>, 3>(
       vec2<f32>(0.0, 0.5),
       vec2<f32>(-0.5, -0.5),
       vec2<f32>(0.5, -0.5)
   );

   var color = array<vec4<f32>, 3>(
       vec4<f32>(1.0, 0.0, 0.0, 1.0),
       vec4<f32>(0.0, 1.0, 0.0, 1.0),
       vec4<f32>(0.0, 0.0, 1.0, 1.0)
   );

   var output: Output;
   output.Position = vec4<f32>(pos[vertexIndex], 0.0, 1.0);
   output.vColor = color[vertexIndex];

   return output;
}

@fragment
fn fs_main(@location(0) vColor: vec4<f32>) -> @location(0) vec4<f32> {
    return vColor;
}
