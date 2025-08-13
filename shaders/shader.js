
export const shaderCode = `


struct Time {
  value: f32
};

struct Swirl {
  center: vec2<f32>,
  radius: f32,
  strength: f32,
};

struct SwirlData {
  count: u32,
  pad: vec3<u32>,
  swirls: array<Swirl, 16>, // max 16 centers
};


struct VertexOutput {
  @builtin(position) position : vec4<f32>,
  @location(0) uv : vec2<f32>,
};

@group(0) @binding(0) var<uniform> time : Time;
 
@group(1) @binding(1) var mySampler: sampler;
@group(1) @binding(2) var myTexture: texture_2d<f32>;




fn applyBlendedSwirls(uv: vec2<f32>, time: f32) -> vec2<f32> {
  var offsetSum = vec2<f32>(0.0, 0.0);
  var totalWeight = 0.0;

  let centers = array<vec2<f32>, 3>(
    vec2<f32>(0.3, 0.3),
    vec2<f32>(0.7, 0.3),
    vec2<f32>(0.5, 0.7)
  );

  let radii = array<f32, 3>(0.8, 0.5, 0.7);





  let baseStrength = 1.0 + 0.9 * (time * 0.008);
  let strengths = array<f32, 3>(
    baseStrength,
    -baseStrength,
    baseStrength * 0.8
  );

  for (var i = 0; i < 3; i = i + 1) {
    let center = centers[i];
    let radius = radii[i];
    let strength = strengths[i];

    let offset = uv - center;
    let dist = length(offset);

    if (dist < radius) {
      let theta = atan2(offset.y, offset.x);
      let swirlAmt = (1.0 - dist / radius); // smooth falloff
      let angle = theta + strength * swirlAmt * time;

      let rotated = vec2<f32>(
        dist * cos(angle),
        dist * sin(angle)
      );

      let swirlOffset = (center + rotated) - uv;
      offsetSum += swirlOffset * swirlAmt;  // weighted contribution
      totalWeight += swirlAmt;
    }
  }

  if (totalWeight > 0.0) {
    return uv + offsetSum / totalWeight; // normalize combined offset
  }

  return uv;
}


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
  
  //  scrolling distorsion
  //  let wavex = 0.03 * cos(time.value + uv.x * 30.0);
  //  let wave = 0.03 * sin(time.value + uv.x * 30.0);
  //  let distortedUV = vec2<f32>(uv.x + wavex, uv.y + wave);

  //  return textureSample(myTexture, mySampler, distortedUV);
  ///////////

  // // single Vortex Swirl  

  // Center UVs around (0.8, 0.8)

  let distortion_power = 0.1*0.7;
  let centeredUV = uv - vec2<f32>(0.5, 0.5);
   
  let radius = length(centeredUV);
  
  var newuv = uv;

 
  newuv.y +=-0.6+ sin(uv.x * time.value );

  


 //Snewuv.x += pow(0.02, time.value);


  let distorted_radius = pow(radius,distortion_power);

  let uv_distorted = normalize(centeredUV) * distorted_radius;

  let final_position =  vec2<f32>(0.5, 0.5)+ uv_distorted + newuv;

  // Get distance from center (radius) and angle (theta)
  let r = 2.0 ;
  let theta = atan2(centeredUV.y, centeredUV.x);

  // Time-based twist factor (r controls amount of swirl per pixel)
  let swirlStrength = 14.0; // more = stronger vortex
  let newTheta = theta + time.value * swirlStrength * ( r);

  // Rebuild distorted UV from polar coords
  let distorted = vec2<f32>(
    r * final_position.x * cos( theta),
    r * final_position.x * sin( theta)
  );

  // Move back to UV space
  let distortedUV = distorted + vec2<f32>(0.5, 0.5);

     

  // Sample the texture
  return textureSample(myTexture, mySampler, final_position  );
  ////





}
`;