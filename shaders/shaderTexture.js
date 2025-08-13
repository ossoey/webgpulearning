
export const shaderCode = `

struct Time {
  value: f32
};

struct VertexOutput {
  @builtin(position) position : vec4<f32>,
  @location(0) uv : vec2<f32>,
};

@group(0) @binding(0) var<uniform> time : Time;
@group(1) @binding(1) var mySampler: sampler;
@group(1) @binding(2) var myTexture: texture_2d<f32>;

//  Vertex shader
@vertex
fn vs_main(
  @location(0) pos: vec2<f32>,
  @location(1) uvCoord: vec2<f32>
) -> VertexOutput {
    var output: VertexOutput;
    let offsetY = 0.2+sin(time.value+pos.x * 10.0);
    let finaPos = vec2<f32>(pos.x, pos.y + offsetY);
    output.position = vec4<f32>(finaPos, 0.0, 1.0);
    output.uv = uvCoord;
    return output;
}

//  Fragment shader
@fragment
fn fs_main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
  return textureSample(myTexture, mySampler, uv);
}
`;