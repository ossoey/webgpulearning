export const vertexShaderCode = `
    struct Uniforms {
    angle: f32,
    };

    @group(0) @binding(0) var<uniform> uniforms: Uniforms;

    struct VertexOutput {
    @builtin(position) Position : vec4<f32>,
    @location(0) fragColor : vec3<f32>,
    };

    @vertex
    fn main(
    @location(0) position : vec2<f32>,
    @location(1) color : vec3<f32>
    ) -> VertexOutput {
    var output : VertexOutput;

    // Rotation matrix
    let c = cos(uniforms.angle);
    let s = sin(uniforms.angle);
    let rotated = vec2<f32>(
        position.x * c - position.y * s,
        position.x * s + position.y * c
    );

    output.Position = vec4<f32>(rotated, 0.0, 1.0);
    output.fragColor = color;
    return output;
    }
`;

export const fragmentShaderCode = `
  @fragment
  fn main(@location(0) fragColor : vec3<f32>) -> @location(0) vec4<f32> {
    return vec4<f32>(fragColor, 1.0);
  }
`;

export const shaderCode = `
struct VertexOutput {
  @builtin(position) Position : vec4<f32>,
  @location(0) uv : vec2<f32>,
};

@group(1) @binding(1) var mySampler: sampler;
@group(1) @binding(2) var myTexture: texture_2d<f32>;

//  Vertex shader
@vertex
fn vs_main(
  @location(0) pos: vec2<f32>,
  @location(1) uvCoord: vec2<f32>
) -> VertexOutput {
  var output: VertexOutput;
  output.Position = vec4<f32>(pos, 0.0, 1.0);
  output.uv = uvCoord;
  return output;
}

//  Fragment shader
@fragment
fn fs_main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
  return textureSample(myTexture, mySampler, uv);
}
`;