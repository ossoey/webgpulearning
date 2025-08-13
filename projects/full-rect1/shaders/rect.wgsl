struct VSOut {
  @builtin(position) position : vec4<f32>,
  @location(0) color : vec3<f32>,
};

@vertex
fn vs_main(@location(0) pos: vec2<f32>, @location(1) col: vec3<f32>) -> VSOut {
  var out: VSOut;
  out.position = vec4<f32>(pos, 0.0, 1.0);
  out.color = col;
  return out;
}

@fragment
fn fs_main(in: VSOut) -> @location(0) vec4<f32> {
  return vec4<f32>(in.color, 1.0);
}
