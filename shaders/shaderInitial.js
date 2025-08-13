
export const shaderCode = `



struct VertexOutput {
  @builtin(position) position : vec4<f32>,
  @location(0) color : vec4<f32>
};


//  Vertex shader
@vertex
fn vs_main(
  @location(0) pos: vec2<f32>,
  @location(1) color: vec3<f32>
) -> VertexOutput {
    var output: VertexOutput;

    output.position = vec4<f32>(pos, 0.0, 1.0);
    output.color = vec4<f32>(color,1.0);
    return output;
}

//  Fragment shader
@fragment
fn fs_main(@location(0) color: vec4<f32>) -> @location(0) vec4<f32> {
  
   return color;


}
`;