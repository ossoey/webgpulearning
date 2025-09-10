
struct VSOut {

   @builtin(position) pos : vec4<f32>

}

@vertex 
fn vs_main (@location(0) posi : vec2<f32>) -> VSOut {

    var vsout : VSOut; 

    vsout.pos = vec4<f32>(posi, 0.0, 1);

    return vsout; 
}


@fragment 
fn fs_main () -> @location(0) vec4<f32> {

    return vec4<f32>(0.2, 0.3, 0.6, 1.0);
}