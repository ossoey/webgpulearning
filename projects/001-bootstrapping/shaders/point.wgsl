
struct VSOut {

   @builtin(position) pos : vec4<f32>

};

@vertex 
fn vs_main(@location(0) posi : vec2<f32> ) -> VSOut {

    var out: VSOut; 

    out.pos = vec4<f32>(posi, 0.0, 1.0);

    return out; 
}


@fragment 
fn fs_main()->@location(0) vec4<f32> {
    
    return vec4<f32>(0.8, 0.1, 0.1, 0.3);

}
