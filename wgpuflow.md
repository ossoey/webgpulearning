🌐 WebGPUFlow — WebGPU Component Framework

(1) ┌──────────────────────┐
│  HTML Canvas Element │
│  (query from DOM)    │
└─────────┬────────────┘
│
▼
(2) ┌─────────────────────────────────────────────┐
│ setupWebGPU(canvas)                         │
│ ├─ Inputs:                                  │
│ │   └─ canvas                               │
│ ├─ Process:                                 │
│ │   ├─ requestAdapter()                     │
│ │   ├─ requestDevice()                      │
│ │   ├─ canvas.getContext("webgpu")         │
│ │   ├─ getPreferredCanvasFormat()           │
│ │   └─ context.configure({ device, format })│
│ └─ Outputs:                                 │
│     ├─ device                               │
│     ├─ context                              │
│     └─ format                               │
└─────────┬──────────────────────────┘
│
▼
(3) ┌────────────────────────────────────────────┐
│ Create GPU Resources                          │
│ │   (Buffers: vertex, index, uniform;          │
│ │    Textures; Samplers)                       │
│ ├─ Inputs:                                    │
│ │   ├─ device                                 │
│ │   ├─ HTML elements (img, video, canvas)     │
│ │   ├─ typed arrays (e.g. Float32Array)       │
│ │   └─ uniform data                           │
│ ├─ Process:                                   │
│ │   ├─ device.createBuffer(...) (not mappedAtCreation) │
│ │   ├─ device.createTexture(...)              │
│ │   └─ device.createSampler(...)              │
│ └─ Outputs:                                   │
│     └─ { buffer, texture, sampler }           │
│     (buffers will be updated in step 9)       │
└─────────┬──────────────────┘
│
▼
(4) ┌────────────────────────────┐
│ Shaders (WGSL)             │
│ ├─ Inputs:                 │
│ │   ├─ device              │
│ │   └─ WGSL code strings   │
│ ├─ Process:                │
│ │   └─ device.createShaderModule({ code }) │
│ └─ Outputs:                │
│     └─ GPUShaderModule(s) │
└─────────┬──────────────────┘
│
▼
(5) ┌─────────────────────────────────────┐
│ Create BindGroupLayout              │
│ ├─ Inputs:                          │
│ │   ├─ device                       │
│ │   └─ layout descriptors           │
│ │       (binding, visibility, type)│
│ ├─ Process:                         │
│ │   └─ device.createBindGroupLayout({ entries }) │
│ └─ Outputs:                         │
│     └─ GPUBindGroupLayout           │
└─────────┬──────────────────┘
│
▼
(6) ┌──────────────────────────────────────────┐
│ Create PipelineLayout                    │
│ ├─ Inputs:                               │
│ │   ├─ device                            │
│ │   └─ bindGroupLayouts (1 or more)      │
│ ├─ Process:                              │
│ │   └─ device.createPipelineLayout({     │
│ │         bindGroupLayouts: [...]        │
│ │       })                               │
│ ├─ Example:                              │
│ │   └─ bindGroupLayouts = [uniformLayout, textureLayout] │
│ └─ Outputs:                              │
│     └─ GPUPipelineLayout                 │
└─────────┬──────────────────┘
│
▼
(7) ┌────────────────────────────────────────────────────────────┐
│ Create RenderPipeline                                      │
│ ├─ Inputs:                                                 │
│ │   ├─ device                                              │
│ │   ├─ pipelineLayout (from step 6)                        │
│ │   ├─ shader modules (vertex + fragment from step 4)      │
│ │   ├─ vertex buffer layout (matches @location in WGSL)    │
│ │   └─ format (from step 2)                                │
│ ├─ Process:                                                │
│ │   └─ device.createRenderPipeline({                       │
│ │         layout,                                          │
│ │         vertex: { module, entryPoint, buffers },         │
│ │         fragment: { module, entryPoint, targets },       │
│ │         primitive, depthStencil, multisample             │
│ │       })                                                 │
│ ├─ Notes:                                                  │
│ │   └─ Multiple targets in fragment stage enable MRT        │
│ │      (Multiple Render Targets): write to several textures│
│ │      from one fragment shader (e.g. color + normals)     │
│ └─ Outputs:                                                │
│     └─ GPURenderPipeline                                   │
└─────────┬──────────────────┘
│
▼
(8) ┌──────────────────────────────────────────────────────┐
│ Create BindGroup                                           │
│ ├─ Inputs:                                                 │
│ │   ├─ device                                              │
│ │   ├─ layout (from step 5)                                │
│ │   └─ resources (buffer, texture view, sampler)           │
│ ├─ Process:                                                │
│ │   └─ device.createBindGroup({                            │
│ │         layout,                                          │
│ │         entries: [                                       │
│ │           { binding: 0, resource: { buffer: myBuffer } },│
│ │           { binding: 1, resource: mySampler },           │
│ │           { binding: 2, resource: myTexture.createView() }│
│ │         ]                                                │
│ │       })                                                 │
│ └─ Outputs:                                                │
│     └─ GPUBindGroup                                        │
└─────────┬──────────────────┘
│
▼
(9) ┌────────────────────────────────────────────────────────────────────────────┐$1Outputs:                                                                │
│     └─ Frame submitted to GPU and rendered on canvas                       │
├─ Subflow Example:                                                        │
│     function renderFrame({ device, context, pipelines, buffers, bindGroups, newVertexData, vertexCounts }) { │
│       if (newVertexData) device.queue.writeBuffer(buffers.vertex, 0, newVertexData); │
│       const encoder = device.createCommandEncoder();                      │
│       const pass = encoder.beginRenderPass({                              │
│         colorAttachments: [{                                              │
│           view: context.getCurrentTexture().createView(),                │
│           loadOp: 'clear', storeOp: 'store',                              │
│           clearValue: { r: 0, g: 0, b: 0, a: 1 }                           │
│         }]                                                                │
│       });                                                                 │
│       pass.setPipeline(pipelines.opaquePipeline);                         │
│       pass.setBindGroup(0, bindGroups.uniformBindGroup);                 │
│       pass.setVertexBuffer(0, buffers.vertex);                            │
│       pass.draw(vertexCounts.opaque);                                     │
│       if (pipelines.overlayPipeline) {                                    │
│         pass.setPipeline(pipelines.overlayPipeline);                      │
│         pass.setBindGroup(0, bindGroups.overlayBindGroup);               │
│         pass.setVertexBuffer(0, buffers.overlay);                         │
│         pass.draw(vertexCounts.overlay);                                  │
│       }                                                                   │
│       pass.end();                                                         │
│       device.queue.submit([encoder.finish()]);                            │
│     }                                                                     │
└─────────┬──────────────────────────────┘
│
▼
(10)┌────────────────────────────┐
│ Screen Render              │
│ └─ Canvas displays result  │
└────────────────────────────┘

