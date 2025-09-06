// projects/color-rect/shaders/color_rect.wgsl

struct Uniforms {
  time : f32,
  frameCount:u32 
  //_pad : vec3<f32>, // keep 16-byte alignment for uniforms
};
@group(0) @binding(0) var<uniform> U : Uniforms;

struct VSOut {
  @builtin(position) pos : vec4<f32>,
  @location(0) uv : vec2<f32>,
};


fn value_from_interval_to_another(value: f32, 
                                  interval_from: array<f32,2>, 
                                  interval_to: array<f32,2> ) -> f32 {

    return  interval_to[0] +  ( (value - interval_from[0]) * ( interval_to[1] - interval_to[0] ) ) 
                              / ( interval_from[1] - interval_from[0]) ; 
}

fn linear_func(x: f32, w : f32, b: f32 ) -> f32 {
    return  w*x+b; 
}

fn transilinear(func_param_w:f32, func_param_b:f32, 
                         interval: array<f32,2>, step: u32, stepCount: u32  ) -> f32 {
    
    var domain = array<f32,2>(1.0, 10.0 );
    var codomain = array<f32,2>(linear_func(domain[0], func_param_w, func_param_b ),
                                linear_func(domain[1], func_param_w, func_param_b ) );

    var domainStep = domain[0] + f32(step) * ( (domain[1]-domain[0]) / f32(stepCount) );                            

    return  value_from_interval_to_another( 
                                  linear_func( domainStep , func_param_w, func_param_b ), 
                                  codomain, 
                                  interval);
}

@vertex
fn vs_main(@builtin(vertex_index) vid : u32) -> VSOut {
  // Fullscreen triangle (no vertex buffer)
  var pos = array<vec2<f32>, 6>(
    //vec2<f32>(-1.0, -3.0),
    //vec2<f32>(-1.0,  1.0),
    //vec2<f32>( 3.0,  1.0)

     vec2<f32>(-1, .0),
     vec2<f32>(1,  .0),
     vec2<f32>( 0,  0.75),
       vec2<f32>(-1, .0),
     vec2<f32>(1,  .0),
     vec2<f32>( 0,  -0.75),
  );

  var out : VSOut;
  out.pos = vec4<f32>(pos[vid], 0.0, 1.0);

  // Map NDC to [0,1] UV-ish for fun coloring
  let uv = (pos[vid]*0.5 +0.5) ;
  out.uv = uv;
  return out;
}

@fragment
fn fs_main(in : VSOut) -> @location(0) vec4<f32> {
  let t = U.time;
  let fc = U.frameCount;
  // soft animated color
  // let r = 0.5 + 0.5 * sin(t  + 6.28318 * (in.uv.x - in.uv.y) );
 let r =    0.5+0.5*sin(9.5*t  + 4*2*3.14* (in.uv.x) );
 let k =    0.5+0.5*sin(2*t  - 100*3.14* (in.uv.x*in.uv.y*0.7) );
  let p =    0.5+0.5*sin(2*t  + 3*2*3.14* (in.uv.x-in.uv.y) );

  let vv =  transilinear(2.0, 1.0, 
                  array<f32,2>(0.3, 1.0), fc, 10000 );

  let g = 0.5 + 0.5 * sin(t * 1.8 -  20000*(in.uv.y/in.uv.x + in.uv.x/in.uv.y));
  let b = 0.5 + 0.5 * sin(t * 0.6 + 6.28318 * (in.uv.x + in.uv.y) * 0.5);
  return vec4<f32>( in.uv.x -0.2, r , in.uv.y, 1.0);
}
