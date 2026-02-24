const getTensorBuffer = (safetensorBuffer, tensorMetadata) => {
  return safetensorBuffer.subarray(...tensorMetadata.data_offsets);
};

const getTensorMetadata = (safetensorBuffer) => {
    const metadataLength = Number(new DataView(safetensorBuffer.buffer).getBigUint64(0, true));
    const metadata = JSON.parse(new TextDecoder("utf8").decode(safetensorBuffer.subarray(8, 8 + metadataLength)));
    return Object.fromEntries(Object.entries(metadata).filter(([k, v]) => k !== "__metadata__").map(([k, v]) => [k, {...v, data_offsets: v.data_offsets.map(x => 8 + metadataLength + x)}]));
};

const createEmptyBuf = (device, size) => {
    return device.createBuffer({size, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST });
};

const createInfinityUniformBuf = (device) => {
  const size = 4;
  const buf = device.createBuffer({
    mappedAtCreation: true,
    size,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST
  });
  new Float32Array(buf.getMappedRange())[0] = Infinity;
  buf.unmap();
  return buf;
x};

const createWeightBuf = (device, size, data) => {
  const buf = device.createBuffer({ mappedAtCreation: true, size, usage: GPUBufferUsage.STORAGE });
  new Uint8Array(buf.getMappedRange()).set(data);
  buf.unmap();
  return buf;
};

const addComputePass = (device, commandEncoder, pipeline, layout, infinityUniformBuf, bufs, workgroup) => {
  const bindGroup = device.createBindGroup({
    layout: layout,
    entries: [
      { binding: 0, resource: { buffer: infinityUniformBuf } },
      ...bufs.map((buffer, index) => ({ binding: index + 1, resource: { buffer } }))
    ]
  });

  const passEncoder = commandEncoder.beginComputePass();
  passEncoder.setPipeline(pipeline);
  passEncoder.setBindGroup(0, bindGroup);
  passEncoder.dispatchWorkgroups(...workgroup);
  passEncoder.end();
};

const r_7_256_32_4_8_16_3_4_3_3_3 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
fn is_nan(v:f32) -> bool { return min(v, 1.0) == 1.0 && max(v, -1.0) == -1.0; }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 128 */
  var gidx1 = i32(gindex.y); /* 256 */
  var gidx2 = i32(gindex.z); /* 7 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (gidx0>>2);
  var alu1 = (gidx0&3);
  var alu2 = (gidx1<<16);
  var alu3 = (alu0<<11);
  var alu4 = (alu1<<6);
  var alu5 = (lidx0<<8);
  var alu6 = (lidx1<<2);
  var alu7 = (alu6+alu4);
  var alu8 = ((alu7<1)!=true);
  var alu9 = (lidx0+(alu0<<3));
  var alu10 = ((lidx1+(alu1<<4))<63);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  var acc4 = 0.0f;
  var acc5 = 0.0f;
  var acc6 = 0.0f;
  var acc7 = 0.0f;
  var acc8 = 0.0f;
  var acc9 = 0.0f;
  var acc10 = 0.0f;
  var acc11 = 0.0f;
  for (var ridx0 = 0; ridx0 < 3; ridx0++) {
    var alu11 = (gidx1+ridx0);
    var alu12 = ((gidx2*81)+(ridx0*9));
    var val0 = data2[alu12];
    var val1 = data2[(alu12+1)];
    var val2 = data2[(alu12+2)];
    var val3 = data2[(alu12+3)];
    var val4 = data2[(alu12+4)];
    var val5 = data2[(alu12+5)];
    var val6 = data2[(alu12+6)];
    var val7 = data2[(alu12+7)];
    var val8 = data2[(alu12+8)];
    var val9 = data2[(alu12+27)];
    var val10 = data2[(alu12+28)];
    var val11 = data2[(alu12+29)];
    var val12 = data2[(alu12+30)];
    var val13 = data2[(alu12+31)];
    var val14 = data2[(alu12+32)];
    var val15 = data2[(alu12+33)];
    var val16 = data2[(alu12+34)];
    var val17 = data2[(alu12+35)];
    var val18 = data2[(alu12+54)];
    var val19 = data2[(alu12+55)];
    var val20 = data2[(alu12+56)];
    var val21 = data2[(alu12+57)];
    var val22 = data2[(alu12+58)];
    var val23 = data2[(alu12+59)];
    var val24 = data2[(alu12+60)];
    var val25 = data2[(alu12+61)];
    var val26 = data2[(alu12+62)];
    var alu13 = (alu2+(ridx0<<16)+alu5+alu3+alu7);
    var alu14 = ((alu11<257)&((alu11<1)!=true));
    var val27 = select(0.0f, data1[(alu13+-65536)], alu14);
    var val28 = select(0.0f, data1[(alu13+-65535)], alu14);
    var val29 = select(0.0f, data1[(alu13+-65534)], alu14);
    var val30 = select(0.0f, data1[(alu13+-65533)], alu14);
    var alu15 = ((alu9<255)&alu14);
    var val31 = select(0.0f, data1[(alu13+-65280)], alu15);
    var val32 = select(0.0f, data1[(alu13+-65279)], alu15);
    var val33 = select(0.0f, data1[(alu13+-65278)], alu15);
    var val34 = select(0.0f, data1[(alu13+-65277)], alu15);
    var val35 = select(0.0f, data1[(alu13+-65532)], (alu10&alu14));
    var val36 = select(0.0f, data1[(alu13+-65276)], (alu10&alu15));
    var alu16 = (((alu9<1)!=true)&alu14);
    var val37 = select(0.0f, data1[(alu13+-65792)], alu16);
    var val38 = select(0.0f, data1[(alu13+-65791)], alu16);
    var val39 = select(0.0f, data1[(alu13+-65790)], alu16);
    var val40 = select(0.0f, data1[(alu13+-65789)], alu16);
    var val41 = select(0.0f, data1[(alu13+-65788)], (alu10&alu16));
    var val42 = select(0.0f, data1[(alu13+-65537)], (alu8&alu14));
    var val43 = select(0.0f, data1[(alu13+-65281)], (alu8&alu15));
    var val44 = select(0.0f, data1[(alu13+-65793)], (alu8&alu16));
    acc0 = (acc0+(val44*val0)+(val42*val3)+(val43*val6)+(val37*val1)+(val27*val4)+(val31*val7)+(val38*val2)+(val28*val5)+(val32*val8));
    acc1 = (acc1+(val44*val9)+(val42*val12)+(val43*val15)+(val37*val10)+(val27*val13)+(val31*val16)+(val38*val11)+(val28*val14)+(val32*val17));
    acc2 = (acc2+(val44*val18)+(val42*val21)+(val43*val24)+(val37*val19)+(val27*val22)+(val31*val25)+(val38*val20)+(val28*val23)+(val32*val26));
    acc3 = (acc3+(val37*val0)+(val27*val3)+(val31*val6)+(val38*val1)+(val28*val4)+(val32*val7)+(val39*val2)+(val29*val5)+(val33*val8));
    acc4 = (acc4+(val37*val9)+(val27*val12)+(val31*val15)+(val38*val10)+(val28*val13)+(val32*val16)+(val39*val11)+(val29*val14)+(val33*val17));
    acc5 = (acc5+(val37*val18)+(val27*val21)+(val31*val24)+(val38*val19)+(val28*val22)+(val32*val25)+(val39*val20)+(val29*val23)+(val33*val26));
    acc6 = (acc6+(val38*val0)+(val28*val3)+(val32*val6)+(val39*val1)+(val29*val4)+(val33*val7)+(val40*val2)+(val30*val5)+(val34*val8));
    acc7 = (acc7+(val38*val9)+(val28*val12)+(val32*val15)+(val39*val10)+(val29*val13)+(val33*val16)+(val40*val11)+(val30*val14)+(val34*val17));
    acc8 = (acc8+(val38*val18)+(val28*val21)+(val32*val24)+(val39*val19)+(val29*val22)+(val33*val25)+(val40*val20)+(val30*val23)+(val34*val26));
    acc9 = (acc9+(val39*val0)+(val29*val3)+(val33*val6)+(val40*val1)+(val30*val4)+(val34*val7)+(val41*val2)+(val35*val5)+(val36*val8));
    acc10 = (acc10+(val39*val9)+(val29*val12)+(val33*val15)+(val40*val10)+(val30*val13)+(val34*val16)+(val41*val11)+(val35*val14)+(val36*val17));
    acc11 = (acc11+(val39*val18)+(val29*val21)+(val33*val24)+(val40*val19)+(val30*val22)+(val34*val25)+(val41*val20)+(val35*val23)+(val36*val26));
  }
  var alu30 = (gidx2*3);
  var val45 = data3[alu30];
  var val46 = data3[(alu30+1)];
  var val47 = data3[(alu30+2)];
  var alu31 = (val46+acc1);
  var alu32 = (val46+acc4);
  var alu33 = (val46+acc7);
  var alu34 = (val46+acc10);
  var alu35 = (val47+acc2);
  var alu36 = (val47+acc5);
  var alu37 = (val47+acc8);
  var alu38 = (val47+acc11);
  var alu39 = (val45+acc0);
  var alu40 = (val45+acc3);
  var alu41 = (val45+acc6);
  var alu42 = (val45+acc9);
  var alu43 = (alu2+(gidx2*50331648)+alu3+alu4+alu5+alu6);
  var alu44 = (1.0f-exp2((alu31*1.4426950408889634f)));
  var alu45 = (1.0f-exp2((alu32*1.4426950408889634f)));
  var alu46 = (1.0f-exp2((alu33*1.4426950408889634f)));
  var alu47 = (1.0f-exp2((alu34*1.4426950408889634f)));
  var alu48 = (1.0f-exp2((alu35*1.4426950408889634f)));
  var alu49 = (1.0f-exp2((alu36*1.4426950408889634f)));
  var alu50 = (1.0f-exp2((alu37*1.4426950408889634f)));
  var alu51 = (1.0f-exp2((alu38*1.4426950408889634f)));
  var alu52 = (1.0f-exp2((alu39*1.4426950408889634f)));
  var alu53 = (1.0f-exp2((alu40*1.4426950408889634f)));
  var alu54 = (1.0f-exp2((alu41*1.4426950408889634f)));
  var alu55 = (1.0f-exp2((alu42*1.4426950408889634f)));
  data0[(alu43+16777216)] = (select(0.0f,alu31,(0.0f<alu31))-select(0.0f,alu44,(0.0f<alu44)));
  data0[(alu43+16777217)] = (select(0.0f,alu32,(0.0f<alu32))-select(0.0f,alu45,(0.0f<alu45)));
  data0[(alu43+16777218)] = (select(0.0f,alu33,(0.0f<alu33))-select(0.0f,alu46,(0.0f<alu46)));
  data0[(alu43+16777219)] = (select(0.0f,alu34,(0.0f<alu34))-select(0.0f,alu47,(0.0f<alu47)));
  data0[(alu43+33554432)] = (select(0.0f,alu35,(0.0f<alu35))-select(0.0f,alu48,(0.0f<alu48)));
  data0[(alu43+33554433)] = (select(0.0f,alu36,(0.0f<alu36))-select(0.0f,alu49,(0.0f<alu49)));
  data0[(alu43+33554434)] = (select(0.0f,alu37,(0.0f<alu37))-select(0.0f,alu50,(0.0f<alu50)));
  data0[(alu43+33554435)] = (select(0.0f,alu38,(0.0f<alu38))-select(0.0f,alu51,(0.0f<alu51)));
  data0[alu43] = (select(0.0f,alu39,(0.0f<alu39))-select(0.0f,alu52,(0.0f<alu52)));
  data0[(alu43+1)] = (select(0.0f,alu40,(0.0f<alu40))-select(0.0f,alu53,(0.0f<alu53)));
  data0[(alu43+2)] = (select(0.0f,alu41,(0.0f<alu41))-select(0.0f,alu54,(0.0f<alu54)));
  data0[(alu43+3)] = (select(0.0f,alu42,(0.0f<alu42))-select(0.0f,alu55,(0.0f<alu55)));
}`;

const r_6_3_18 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
fn is_nan(v:f32) -> bool { return min(v, 1.0) == 1.0 && max(v, -1.0) == -1.0; }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<i32>;
@compute @workgroup_size(3) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 6 */
  var lidx0 = i32(lindex.x); /* 3 */
  var alu0 = (lidx0+(gidx0*3));
  data0[alu0] = (select(0,-1,((alu0<16)!=true))+select(0,-1,((alu0<17)!=true))+select(0,-1,((gidx0<5)!=true))+select(0,-1,((alu0<14)!=true))+select(0,-1,((alu0<13)!=true))+select(0,-1,((gidx0<4)!=true))+select(0,-1,((alu0<11)!=true))+select(0,-1,((alu0<10)!=true))+select(0,-1,((gidx0<3)!=true))+select(0,-1,((alu0<8)!=true))+select(0,-1,((alu0<7)!=true))+select(0,-1,((gidx0<2)!=true))+select(0,-1,((alu0<5)!=true))+select(0,-1,((alu0<4)!=true))+select(0,-1,((gidx0<1)!=true))+select(0,-1,((alu0<2)!=true))+select(0,-1,(((gidx0+lidx0)<1)!=true))+18);
}`;

const r_7_256_32_4_8_16_21_3_4_3_3_3 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
fn is_nan(v:f32) -> bool { return min(v, 1.0) == 1.0 && max(v, -1.0) == -1.0; }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 128 */
  var gidx1 = i32(gindex.y); /* 256 */
  var gidx2 = i32(gindex.z); /* 7 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (gidx0>>2);
  var alu1 = (gidx0&3);
  var alu2 = (gidx1<<16);
  var alu3 = (alu0<<11);
  var alu4 = (alu1<<6);
  var alu5 = (lidx0<<8);
  var alu6 = (lidx1<<2);
  var alu7 = (alu6+alu4);
  var alu8 = (lidx0+(alu0<<3));
  var alu9 = (alu7<251);
  var alu10 = ((alu7<1)!=true);
  var alu11 = ((lidx1+(alu1<<4))<63);
  var alu12 = ((((lidx1<<1)+(alu1<<5))<1)!=true);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  var acc4 = 0.0f;
  var acc5 = 0.0f;
  var acc6 = 0.0f;
  var acc7 = 0.0f;
  var acc8 = 0.0f;
  var acc9 = 0.0f;
  var acc10 = 0.0f;
  var acc11 = 0.0f;
  for (var ridx0 = 0; ridx0 < 21; ridx0++) {
    for (var ridx1 = 0; ridx1 < 3; ridx1++) {
      var alu13 = (gidx1+(ridx1<<1));
      var alu14 = ((alu13<258)&((alu13<2)!=true));
      var alu15 = (((alu8<2)!=true)&alu14);
      var alu16 = ((alu8<254)&alu14);
      var alu17 = ((gidx2*1701)+(ridx0*27)+(ridx1*9));
      var val0 = data2[alu17];
      var val1 = data2[(alu17+1)];
      var val2 = data2[(alu17+2)];
      var val3 = data2[(alu17+3)];
      var val4 = data2[(alu17+4)];
      var val5 = data2[(alu17+5)];
      var val6 = data2[(alu17+6)];
      var val7 = data2[(alu17+7)];
      var val8 = data2[(alu17+8)];
      var val9 = data2[(alu17+567)];
      var val10 = data2[(alu17+568)];
      var val11 = data2[(alu17+569)];
      var val12 = data2[(alu17+570)];
      var val13 = data2[(alu17+571)];
      var val14 = data2[(alu17+572)];
      var val15 = data2[(alu17+573)];
      var val16 = data2[(alu17+574)];
      var val17 = data2[(alu17+575)];
      var val18 = data2[(alu17+1134)];
      var val19 = data2[(alu17+1135)];
      var val20 = data2[(alu17+1136)];
      var val21 = data2[(alu17+1137)];
      var val22 = data2[(alu17+1138)];
      var val23 = data2[(alu17+1139)];
      var val24 = data2[(alu17+1140)];
      var val25 = data2[(alu17+1141)];
      var val26 = data2[(alu17+1142)];
      var alu18 = (alu2+(ridx1<<17)+(ridx0<<24)+alu5+alu3+alu7);
      var val27 = select(0.0f, data1[(alu18+-131586)], (alu12&alu15));
      var val28 = select(0.0f, data1[(alu18+-131585)], (alu10&alu15));
      var val29 = select(0.0f, data1[(alu18+-131584)], alu15);
      var val30 = select(0.0f, data1[(alu18+-131583)], alu15);
      var val31 = select(0.0f, data1[(alu18+-131582)], alu15);
      var val32 = select(0.0f, data1[(alu18+-131581)], alu15);
      var val33 = select(0.0f, data1[(alu18+-131580)], (alu11&alu15));
      var val34 = select(0.0f, data1[(alu18+-131579)], (alu9&alu15));
      var val35 = select(0.0f, data1[(alu18+-131074)], (alu12&alu14));
      var val36 = select(0.0f, data1[(alu18+-131073)], (alu10&alu14));
      var val37 = select(0.0f, data1[(alu18+-131072)], alu14);
      var val38 = select(0.0f, data1[(alu18+-131071)], alu14);
      var val39 = select(0.0f, data1[(alu18+-131070)], alu14);
      var val40 = select(0.0f, data1[(alu18+-131069)], alu14);
      var val41 = select(0.0f, data1[(alu18+-131068)], (alu11&alu14));
      var val42 = select(0.0f, data1[(alu18+-131067)], (alu9&alu14));
      var val43 = select(0.0f, data1[(alu18+-130562)], (alu12&alu16));
      var val44 = select(0.0f, data1[(alu18+-130561)], (alu10&alu16));
      var val45 = select(0.0f, data1[(alu18+-130560)], alu16);
      var val46 = select(0.0f, data1[(alu18+-130559)], alu16);
      var val47 = select(0.0f, data1[(alu18+-130558)], alu16);
      var val48 = select(0.0f, data1[(alu18+-130557)], alu16);
      var val49 = select(0.0f, data1[(alu18+-130556)], (alu11&alu16));
      var val50 = select(0.0f, data1[(alu18+-130555)], (alu9&alu16));
      acc0 = (acc0+(val27*val0)+(val35*val3)+(val43*val6)+(val29*val1)+(val37*val4)+(val45*val7)+(val31*val2)+(val39*val5)+(val47*val8));
      acc1 = (acc1+(val27*val9)+(val35*val12)+(val43*val15)+(val29*val10)+(val37*val13)+(val45*val16)+(val31*val11)+(val39*val14)+(val47*val17));
      acc2 = (acc2+(val27*val18)+(val35*val21)+(val43*val24)+(val29*val19)+(val37*val22)+(val45*val25)+(val31*val20)+(val39*val23)+(val47*val26));
      acc3 = (acc3+(val28*val0)+(val36*val3)+(val44*val6)+(val30*val1)+(val38*val4)+(val46*val7)+(val32*val2)+(val40*val5)+(val48*val8));
      acc4 = (acc4+(val28*val9)+(val36*val12)+(val44*val15)+(val30*val10)+(val38*val13)+(val46*val16)+(val32*val11)+(val40*val14)+(val48*val17));
      acc5 = (acc5+(val28*val18)+(val36*val21)+(val44*val24)+(val30*val19)+(val38*val22)+(val46*val25)+(val32*val20)+(val40*val23)+(val48*val26));
      acc6 = (acc6+(val29*val0)+(val37*val3)+(val45*val6)+(val31*val1)+(val39*val4)+(val47*val7)+(val33*val2)+(val41*val5)+(val49*val8));
      acc7 = (acc7+(val29*val9)+(val37*val12)+(val45*val15)+(val31*val10)+(val39*val13)+(val47*val16)+(val33*val11)+(val41*val14)+(val49*val17));
      acc8 = (acc8+(val29*val18)+(val37*val21)+(val45*val24)+(val31*val19)+(val39*val22)+(val47*val25)+(val33*val20)+(val41*val23)+(val49*val26));
      acc9 = (acc9+(val30*val0)+(val38*val3)+(val46*val6)+(val32*val1)+(val40*val4)+(val48*val7)+(val34*val2)+(val42*val5)+(val50*val8));
      acc10 = (acc10+(val30*val9)+(val38*val12)+(val46*val15)+(val32*val10)+(val40*val13)+(val48*val16)+(val34*val11)+(val42*val14)+(val50*val17));
      acc11 = (acc11+(val30*val18)+(val38*val21)+(val46*val24)+(val32*val19)+(val40*val22)+(val48*val25)+(val34*val20)+(val42*val23)+(val50*val26));
    }
  }
  var alu33 = (gidx2*3);
  var val51 = data3[alu33];
  var val52 = data3[(alu33+1)];
  var val53 = data3[(alu33+2)];
  var alu34 = (val52+acc1);
  var alu35 = (val52+acc4);
  var alu36 = (val52+acc7);
  var alu37 = (val52+acc10);
  var alu38 = (val53+acc2);
  var alu39 = (val53+acc5);
  var alu40 = (val53+acc8);
  var alu41 = (val53+acc11);
  var alu42 = (val51+acc0);
  var alu43 = (val51+acc3);
  var alu44 = (val51+acc6);
  var alu45 = (val51+acc9);
  var alu46 = (alu2+(gidx2*50331648)+alu3+alu4+alu5+alu6);
  var alu47 = (1.0f-exp2((alu34*1.4426950408889634f)));
  var alu48 = (1.0f-exp2((alu35*1.4426950408889634f)));
  var alu49 = (1.0f-exp2((alu36*1.4426950408889634f)));
  var alu50 = (1.0f-exp2((alu37*1.4426950408889634f)));
  var alu51 = (1.0f-exp2((alu38*1.4426950408889634f)));
  var alu52 = (1.0f-exp2((alu39*1.4426950408889634f)));
  var alu53 = (1.0f-exp2((alu40*1.4426950408889634f)));
  var alu54 = (1.0f-exp2((alu41*1.4426950408889634f)));
  var alu55 = (1.0f-exp2((alu42*1.4426950408889634f)));
  var alu56 = (1.0f-exp2((alu43*1.4426950408889634f)));
  var alu57 = (1.0f-exp2((alu44*1.4426950408889634f)));
  var alu58 = (1.0f-exp2((alu45*1.4426950408889634f)));
  data0[(alu46+16777216)] = (select(0.0f,alu34,(0.0f<alu34))-select(0.0f,alu47,(0.0f<alu47)));
  data0[(alu46+16777217)] = (select(0.0f,alu35,(0.0f<alu35))-select(0.0f,alu48,(0.0f<alu48)));
  data0[(alu46+16777218)] = (select(0.0f,alu36,(0.0f<alu36))-select(0.0f,alu49,(0.0f<alu49)));
  data0[(alu46+16777219)] = (select(0.0f,alu37,(0.0f<alu37))-select(0.0f,alu50,(0.0f<alu50)));
  data0[(alu46+33554432)] = (select(0.0f,alu38,(0.0f<alu38))-select(0.0f,alu51,(0.0f<alu51)));
  data0[(alu46+33554433)] = (select(0.0f,alu39,(0.0f<alu39))-select(0.0f,alu52,(0.0f<alu52)));
  data0[(alu46+33554434)] = (select(0.0f,alu40,(0.0f<alu40))-select(0.0f,alu53,(0.0f<alu53)));
  data0[(alu46+33554435)] = (select(0.0f,alu41,(0.0f<alu41))-select(0.0f,alu54,(0.0f<alu54)));
  data0[alu46] = (select(0.0f,alu42,(0.0f<alu42))-select(0.0f,alu55,(0.0f<alu55)));
  data0[(alu46+1)] = (select(0.0f,alu43,(0.0f<alu43))-select(0.0f,alu56,(0.0f<alu56)));
  data0[(alu46+2)] = (select(0.0f,alu44,(0.0f<alu44))-select(0.0f,alu57,(0.0f<alu57)));
  data0[(alu46+3)] = (select(0.0f,alu45,(0.0f<alu45))-select(0.0f,alu58,(0.0f<alu58)));
}`;

const r_7_256_32_4_8_16_21_3_4_3_3_3n1 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
fn is_nan(v:f32) -> bool { return min(v, 1.0) == 1.0 && max(v, -1.0) == -1.0; }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 128 */
  var gidx1 = i32(gindex.y); /* 256 */
  var gidx2 = i32(gindex.z); /* 7 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (gidx0>>2);
  var alu1 = (gidx0&3);
  var alu2 = (gidx1<<16);
  var alu3 = (alu0<<11);
  var alu4 = (alu1<<6);
  var alu5 = (lidx0<<8);
  var alu6 = (lidx1<<2);
  var alu7 = (lidx0+(alu0<<3));
  var alu8 = (lidx1+(alu1<<4));
  var alu9 = (alu8<63);
  var alu10 = ((alu8<1)!=true);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  var acc4 = 0.0f;
  var acc5 = 0.0f;
  var acc6 = 0.0f;
  var acc7 = 0.0f;
  var acc8 = 0.0f;
  var acc9 = 0.0f;
  var acc10 = 0.0f;
  var acc11 = 0.0f;
  for (var ridx0 = 0; ridx0 < 21; ridx0++) {
    for (var ridx1 = 0; ridx1 < 3; ridx1++) {
      var alu11 = (gidx1+(ridx1<<2));
      var alu12 = ((alu11<260)&((alu11<4)!=true));
      var alu13 = (((alu7<4)!=true)&alu12);
      var alu14 = ((alu7<252)&alu12);
      var alu15 = (alu9&alu12);
      var alu16 = (alu9&alu14);
      var alu17 = (alu9&alu13);
      var alu18 = (alu10&alu12);
      var alu19 = (alu10&alu14);
      var alu20 = (alu10&alu13);
      var alu21 = ((gidx2*1701)+(ridx0*27)+(ridx1*9));
      var val0 = data2[alu21];
      var val1 = data2[(alu21+1)];
      var val2 = data2[(alu21+2)];
      var val3 = data2[(alu21+3)];
      var val4 = data2[(alu21+4)];
      var val5 = data2[(alu21+5)];
      var val6 = data2[(alu21+6)];
      var val7 = data2[(alu21+7)];
      var val8 = data2[(alu21+8)];
      var val9 = data2[(alu21+567)];
      var val10 = data2[(alu21+568)];
      var val11 = data2[(alu21+569)];
      var val12 = data2[(alu21+570)];
      var val13 = data2[(alu21+571)];
      var val14 = data2[(alu21+572)];
      var val15 = data2[(alu21+573)];
      var val16 = data2[(alu21+574)];
      var val17 = data2[(alu21+575)];
      var val18 = data2[(alu21+1134)];
      var val19 = data2[(alu21+1135)];
      var val20 = data2[(alu21+1136)];
      var val21 = data2[(alu21+1137)];
      var val22 = data2[(alu21+1138)];
      var val23 = data2[(alu21+1139)];
      var val24 = data2[(alu21+1140)];
      var val25 = data2[(alu21+1141)];
      var val26 = data2[(alu21+1142)];
      var alu22 = (alu2+(ridx1<<18)+(ridx0<<24)+alu5+alu3+alu6+alu4);
      var val27 = select(0.0f, data1[(alu22+-263172)], alu20);
      var val28 = select(0.0f, data1[(alu22+-263171)], alu20);
      var val29 = select(0.0f, data1[(alu22+-263170)], alu20);
      var val30 = select(0.0f, data1[(alu22+-263169)], alu20);
      var val31 = select(0.0f, data1[(alu22+-263168)], alu13);
      var val32 = select(0.0f, data1[(alu22+-263167)], alu13);
      var val33 = select(0.0f, data1[(alu22+-263166)], alu13);
      var val34 = select(0.0f, data1[(alu22+-263165)], alu13);
      var val35 = select(0.0f, data1[(alu22+-263164)], alu17);
      var val36 = select(0.0f, data1[(alu22+-263163)], alu17);
      var val37 = select(0.0f, data1[(alu22+-263162)], alu17);
      var val38 = select(0.0f, data1[(alu22+-263161)], alu17);
      var val39 = select(0.0f, data1[(alu22+-262148)], alu18);
      var val40 = select(0.0f, data1[(alu22+-262147)], alu18);
      var val41 = select(0.0f, data1[(alu22+-262146)], alu18);
      var val42 = select(0.0f, data1[(alu22+-262145)], alu18);
      var val43 = select(0.0f, data1[(alu22+-262144)], alu12);
      var val44 = select(0.0f, data1[(alu22+-262143)], alu12);
      var val45 = select(0.0f, data1[(alu22+-262142)], alu12);
      var val46 = select(0.0f, data1[(alu22+-262141)], alu12);
      var val47 = select(0.0f, data1[(alu22+-262140)], alu15);
      var val48 = select(0.0f, data1[(alu22+-262139)], alu15);
      var val49 = select(0.0f, data1[(alu22+-262138)], alu15);
      var val50 = select(0.0f, data1[(alu22+-262137)], alu15);
      var val51 = select(0.0f, data1[(alu22+-261124)], alu19);
      var val52 = select(0.0f, data1[(alu22+-261123)], alu19);
      var val53 = select(0.0f, data1[(alu22+-261122)], alu19);
      var val54 = select(0.0f, data1[(alu22+-261121)], alu19);
      var val55 = select(0.0f, data1[(alu22+-261120)], alu14);
      var val56 = select(0.0f, data1[(alu22+-261119)], alu14);
      var val57 = select(0.0f, data1[(alu22+-261118)], alu14);
      var val58 = select(0.0f, data1[(alu22+-261117)], alu14);
      var val59 = select(0.0f, data1[(alu22+-261116)], alu16);
      var val60 = select(0.0f, data1[(alu22+-261115)], alu16);
      var val61 = select(0.0f, data1[(alu22+-261114)], alu16);
      var val62 = select(0.0f, data1[(alu22+-261113)], alu16);
      acc0 = (acc0+(val27*val0)+(val39*val3)+(val51*val6)+(val31*val1)+(val43*val4)+(val55*val7)+(val35*val2)+(val47*val5)+(val59*val8));
      acc1 = (acc1+(val27*val9)+(val39*val12)+(val51*val15)+(val31*val10)+(val43*val13)+(val55*val16)+(val35*val11)+(val47*val14)+(val59*val17));
      acc2 = (acc2+(val27*val18)+(val39*val21)+(val51*val24)+(val31*val19)+(val43*val22)+(val55*val25)+(val35*val20)+(val47*val23)+(val59*val26));
      acc3 = (acc3+(val28*val0)+(val40*val3)+(val52*val6)+(val32*val1)+(val44*val4)+(val56*val7)+(val36*val2)+(val48*val5)+(val60*val8));
      acc4 = (acc4+(val28*val9)+(val40*val12)+(val52*val15)+(val32*val10)+(val44*val13)+(val56*val16)+(val36*val11)+(val48*val14)+(val60*val17));
      acc5 = (acc5+(val28*val18)+(val40*val21)+(val52*val24)+(val32*val19)+(val44*val22)+(val56*val25)+(val36*val20)+(val48*val23)+(val60*val26));
      acc6 = (acc6+(val29*val0)+(val41*val3)+(val53*val6)+(val33*val1)+(val45*val4)+(val57*val7)+(val37*val2)+(val49*val5)+(val61*val8));
      acc7 = (acc7+(val29*val9)+(val41*val12)+(val53*val15)+(val33*val10)+(val45*val13)+(val57*val16)+(val37*val11)+(val49*val14)+(val61*val17));
      acc8 = (acc8+(val29*val18)+(val41*val21)+(val53*val24)+(val33*val19)+(val45*val22)+(val57*val25)+(val37*val20)+(val49*val23)+(val61*val26));
      acc9 = (acc9+(val30*val0)+(val42*val3)+(val54*val6)+(val34*val1)+(val46*val4)+(val58*val7)+(val38*val2)+(val50*val5)+(val62*val8));
      acc10 = (acc10+(val30*val9)+(val42*val12)+(val54*val15)+(val34*val10)+(val46*val13)+(val58*val16)+(val38*val11)+(val50*val14)+(val62*val17));
      acc11 = (acc11+(val30*val18)+(val42*val21)+(val54*val24)+(val34*val19)+(val46*val22)+(val58*val25)+(val38*val20)+(val50*val23)+(val62*val26));
    }
  }
  var alu37 = (gidx2*3);
  var val63 = data3[alu37];
  var val64 = data3[(alu37+1)];
  var val65 = data3[(alu37+2)];
  var alu38 = (val64+acc1);
  var alu39 = (val64+acc4);
  var alu40 = (val64+acc7);
  var alu41 = (val64+acc10);
  var alu42 = (val65+acc2);
  var alu43 = (val65+acc5);
  var alu44 = (val65+acc8);
  var alu45 = (val65+acc11);
  var alu46 = (val63+acc0);
  var alu47 = (val63+acc3);
  var alu48 = (val63+acc6);
  var alu49 = (val63+acc9);
  var alu50 = (alu2+(gidx2*50331648)+alu3+alu4+alu5+alu6);
  var alu51 = (1.0f-exp2((alu38*1.4426950408889634f)));
  var alu52 = (1.0f-exp2((alu39*1.4426950408889634f)));
  var alu53 = (1.0f-exp2((alu40*1.4426950408889634f)));
  var alu54 = (1.0f-exp2((alu41*1.4426950408889634f)));
  var alu55 = (1.0f-exp2((alu42*1.4426950408889634f)));
  var alu56 = (1.0f-exp2((alu43*1.4426950408889634f)));
  var alu57 = (1.0f-exp2((alu44*1.4426950408889634f)));
  var alu58 = (1.0f-exp2((alu45*1.4426950408889634f)));
  var alu59 = (1.0f-exp2((alu46*1.4426950408889634f)));
  var alu60 = (1.0f-exp2((alu47*1.4426950408889634f)));
  var alu61 = (1.0f-exp2((alu48*1.4426950408889634f)));
  var alu62 = (1.0f-exp2((alu49*1.4426950408889634f)));
  data0[(alu50+16777216)] = (select(0.0f,alu38,(0.0f<alu38))-select(0.0f,alu51,(0.0f<alu51)));
  data0[(alu50+16777217)] = (select(0.0f,alu39,(0.0f<alu39))-select(0.0f,alu52,(0.0f<alu52)));
  data0[(alu50+16777218)] = (select(0.0f,alu40,(0.0f<alu40))-select(0.0f,alu53,(0.0f<alu53)));
  data0[(alu50+16777219)] = (select(0.0f,alu41,(0.0f<alu41))-select(0.0f,alu54,(0.0f<alu54)));
  data0[(alu50+33554432)] = (select(0.0f,alu42,(0.0f<alu42))-select(0.0f,alu55,(0.0f<alu55)));
  data0[(alu50+33554433)] = (select(0.0f,alu43,(0.0f<alu43))-select(0.0f,alu56,(0.0f<alu56)));
  data0[(alu50+33554434)] = (select(0.0f,alu44,(0.0f<alu44))-select(0.0f,alu57,(0.0f<alu57)));
  data0[(alu50+33554435)] = (select(0.0f,alu45,(0.0f<alu45))-select(0.0f,alu58,(0.0f<alu58)));
  data0[alu50] = (select(0.0f,alu46,(0.0f<alu46))-select(0.0f,alu59,(0.0f<alu59)));
  data0[(alu50+1)] = (select(0.0f,alu47,(0.0f<alu47))-select(0.0f,alu60,(0.0f<alu60)));
  data0[(alu50+2)] = (select(0.0f,alu48,(0.0f<alu48))-select(0.0f,alu61,(0.0f<alu61)));
  data0[(alu50+3)] = (select(0.0f,alu49,(0.0f<alu49))-select(0.0f,alu62,(0.0f<alu62)));
}`;

const r_7_256_32_4_8_16_21_3_4_3_3_3n2 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
fn is_nan(v:f32) -> bool { return min(v, 1.0) == 1.0 && max(v, -1.0) == -1.0; }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 128 */
  var gidx1 = i32(gindex.y); /* 256 */
  var gidx2 = i32(gindex.z); /* 7 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (gidx0&3);
  var alu1 = (gidx1<<16);
  var alu2 = ((gidx0>>2)<<11);
  var alu3 = (alu0<<6);
  var alu4 = (lidx0<<8);
  var alu5 = (lidx1<<2);
  var alu6 = (lidx1+(alu0<<4));
  var alu7 = (alu6<62);
  var alu8 = ((alu6<2)!=true);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  var acc4 = 0.0f;
  var acc5 = 0.0f;
  var acc6 = 0.0f;
  var acc7 = 0.0f;
  var acc8 = 0.0f;
  var acc9 = 0.0f;
  var acc10 = 0.0f;
  var acc11 = 0.0f;
  for (var ridx0 = 0; ridx0 < 21; ridx0++) {
    for (var ridx1 = 0; ridx1 < 3; ridx1++) {
      var alu9 = (gidx1+(ridx1<<3));
      var alu10 = ((alu9<264)&((alu9<8)!=true));
      var alu11 = (((gidx0<4)!=true)&alu10);
      var alu12 = ((gidx0<124)&alu10);
      var alu13 = (alu7&alu12);
      var alu14 = (alu7&alu10);
      var alu15 = (alu7&alu11);
      var alu16 = (alu8&alu12);
      var alu17 = (alu8&alu10);
      var alu18 = (alu8&alu11);
      var alu19 = ((gidx2*1701)+(ridx0*27)+(ridx1*9));
      var val0 = data2[alu19];
      var val1 = data2[(alu19+1)];
      var val2 = data2[(alu19+2)];
      var val3 = data2[(alu19+3)];
      var val4 = data2[(alu19+4)];
      var val5 = data2[(alu19+5)];
      var val6 = data2[(alu19+6)];
      var val7 = data2[(alu19+7)];
      var val8 = data2[(alu19+8)];
      var val9 = data2[(alu19+567)];
      var val10 = data2[(alu19+568)];
      var val11 = data2[(alu19+569)];
      var val12 = data2[(alu19+570)];
      var val13 = data2[(alu19+571)];
      var val14 = data2[(alu19+572)];
      var val15 = data2[(alu19+573)];
      var val16 = data2[(alu19+574)];
      var val17 = data2[(alu19+575)];
      var val18 = data2[(alu19+1134)];
      var val19 = data2[(alu19+1135)];
      var val20 = data2[(alu19+1136)];
      var val21 = data2[(alu19+1137)];
      var val22 = data2[(alu19+1138)];
      var val23 = data2[(alu19+1139)];
      var val24 = data2[(alu19+1140)];
      var val25 = data2[(alu19+1141)];
      var val26 = data2[(alu19+1142)];
      var alu20 = (alu1+(ridx1<<19)+(ridx0<<24)+alu4+alu2+alu5+alu3);
      var val27 = select(0.0f, data1[(alu20+-526344)], alu18);
      var val28 = select(0.0f, data1[(alu20+-526343)], alu18);
      var val29 = select(0.0f, data1[(alu20+-526342)], alu18);
      var val30 = select(0.0f, data1[(alu20+-526341)], alu18);
      var val31 = select(0.0f, data1[(alu20+-526336)], alu11);
      var val32 = select(0.0f, data1[(alu20+-526335)], alu11);
      var val33 = select(0.0f, data1[(alu20+-526334)], alu11);
      var val34 = select(0.0f, data1[(alu20+-526333)], alu11);
      var val35 = select(0.0f, data1[(alu20+-526328)], alu15);
      var val36 = select(0.0f, data1[(alu20+-526327)], alu15);
      var val37 = select(0.0f, data1[(alu20+-526326)], alu15);
      var val38 = select(0.0f, data1[(alu20+-526325)], alu15);
      var val39 = select(0.0f, data1[(alu20+-524296)], alu17);
      var val40 = select(0.0f, data1[(alu20+-524295)], alu17);
      var val41 = select(0.0f, data1[(alu20+-524294)], alu17);
      var val42 = select(0.0f, data1[(alu20+-524293)], alu17);
      var val43 = select(0.0f, data1[(alu20+-524288)], alu10);
      var val44 = select(0.0f, data1[(alu20+-524287)], alu10);
      var val45 = select(0.0f, data1[(alu20+-524286)], alu10);
      var val46 = select(0.0f, data1[(alu20+-524285)], alu10);
      var val47 = select(0.0f, data1[(alu20+-524280)], alu14);
      var val48 = select(0.0f, data1[(alu20+-524279)], alu14);
      var val49 = select(0.0f, data1[(alu20+-524278)], alu14);
      var val50 = select(0.0f, data1[(alu20+-524277)], alu14);
      var val51 = select(0.0f, data1[(alu20+-522248)], alu16);
      var val52 = select(0.0f, data1[(alu20+-522247)], alu16);
      var val53 = select(0.0f, data1[(alu20+-522246)], alu16);
      var val54 = select(0.0f, data1[(alu20+-522245)], alu16);
      var val55 = select(0.0f, data1[(alu20+-522240)], alu12);
      var val56 = select(0.0f, data1[(alu20+-522239)], alu12);
      var val57 = select(0.0f, data1[(alu20+-522238)], alu12);
      var val58 = select(0.0f, data1[(alu20+-522237)], alu12);
      var val59 = select(0.0f, data1[(alu20+-522232)], alu13);
      var val60 = select(0.0f, data1[(alu20+-522231)], alu13);
      var val61 = select(0.0f, data1[(alu20+-522230)], alu13);
      var val62 = select(0.0f, data1[(alu20+-522229)], alu13);
      acc0 = (acc0+(val27*val0)+(val39*val3)+(val51*val6)+(val31*val1)+(val43*val4)+(val55*val7)+(val35*val2)+(val47*val5)+(val59*val8));
      acc1 = (acc1+(val27*val9)+(val39*val12)+(val51*val15)+(val31*val10)+(val43*val13)+(val55*val16)+(val35*val11)+(val47*val14)+(val59*val17));
      acc2 = (acc2+(val27*val18)+(val39*val21)+(val51*val24)+(val31*val19)+(val43*val22)+(val55*val25)+(val35*val20)+(val47*val23)+(val59*val26));
      acc3 = (acc3+(val28*val0)+(val40*val3)+(val52*val6)+(val32*val1)+(val44*val4)+(val56*val7)+(val36*val2)+(val48*val5)+(val60*val8));
      acc4 = (acc4+(val28*val9)+(val40*val12)+(val52*val15)+(val32*val10)+(val44*val13)+(val56*val16)+(val36*val11)+(val48*val14)+(val60*val17));
      acc5 = (acc5+(val28*val18)+(val40*val21)+(val52*val24)+(val32*val19)+(val44*val22)+(val56*val25)+(val36*val20)+(val48*val23)+(val60*val26));
      acc6 = (acc6+(val29*val0)+(val41*val3)+(val53*val6)+(val33*val1)+(val45*val4)+(val57*val7)+(val37*val2)+(val49*val5)+(val61*val8));
      acc7 = (acc7+(val29*val9)+(val41*val12)+(val53*val15)+(val33*val10)+(val45*val13)+(val57*val16)+(val37*val11)+(val49*val14)+(val61*val17));
      acc8 = (acc8+(val29*val18)+(val41*val21)+(val53*val24)+(val33*val19)+(val45*val22)+(val57*val25)+(val37*val20)+(val49*val23)+(val61*val26));
      acc9 = (acc9+(val30*val0)+(val42*val3)+(val54*val6)+(val34*val1)+(val46*val4)+(val58*val7)+(val38*val2)+(val50*val5)+(val62*val8));
      acc10 = (acc10+(val30*val9)+(val42*val12)+(val54*val15)+(val34*val10)+(val46*val13)+(val58*val16)+(val38*val11)+(val50*val14)+(val62*val17));
      acc11 = (acc11+(val30*val18)+(val42*val21)+(val54*val24)+(val34*val19)+(val46*val22)+(val58*val25)+(val38*val20)+(val50*val23)+(val62*val26));
    }
  }
  var alu35 = (gidx2*3);
  var val63 = data3[alu35];
  var val64 = data3[(alu35+1)];
  var val65 = data3[(alu35+2)];
  var alu36 = (val64+acc1);
  var alu37 = (val64+acc4);
  var alu38 = (val64+acc7);
  var alu39 = (val64+acc10);
  var alu40 = (val65+acc2);
  var alu41 = (val65+acc5);
  var alu42 = (val65+acc8);
  var alu43 = (val65+acc11);
  var alu44 = (val63+acc0);
  var alu45 = (val63+acc3);
  var alu46 = (val63+acc6);
  var alu47 = (val63+acc9);
  var alu48 = (alu1+(gidx2*50331648)+alu2+alu3+alu4+alu5);
  var alu49 = (1.0f-exp2((alu36*1.4426950408889634f)));
  var alu50 = (1.0f-exp2((alu37*1.4426950408889634f)));
  var alu51 = (1.0f-exp2((alu38*1.4426950408889634f)));
  var alu52 = (1.0f-exp2((alu39*1.4426950408889634f)));
  var alu53 = (1.0f-exp2((alu40*1.4426950408889634f)));
  var alu54 = (1.0f-exp2((alu41*1.4426950408889634f)));
  var alu55 = (1.0f-exp2((alu42*1.4426950408889634f)));
  var alu56 = (1.0f-exp2((alu43*1.4426950408889634f)));
  var alu57 = (1.0f-exp2((alu44*1.4426950408889634f)));
  var alu58 = (1.0f-exp2((alu45*1.4426950408889634f)));
  var alu59 = (1.0f-exp2((alu46*1.4426950408889634f)));
  var alu60 = (1.0f-exp2((alu47*1.4426950408889634f)));
  data0[(alu48+16777216)] = (select(0.0f,alu36,(0.0f<alu36))-select(0.0f,alu49,(0.0f<alu49)));
  data0[(alu48+16777217)] = (select(0.0f,alu37,(0.0f<alu37))-select(0.0f,alu50,(0.0f<alu50)));
  data0[(alu48+16777218)] = (select(0.0f,alu38,(0.0f<alu38))-select(0.0f,alu51,(0.0f<alu51)));
  data0[(alu48+16777219)] = (select(0.0f,alu39,(0.0f<alu39))-select(0.0f,alu52,(0.0f<alu52)));
  data0[(alu48+33554432)] = (select(0.0f,alu40,(0.0f<alu40))-select(0.0f,alu53,(0.0f<alu53)));
  data0[(alu48+33554433)] = (select(0.0f,alu41,(0.0f<alu41))-select(0.0f,alu54,(0.0f<alu54)));
  data0[(alu48+33554434)] = (select(0.0f,alu42,(0.0f<alu42))-select(0.0f,alu55,(0.0f<alu55)));
  data0[(alu48+33554435)] = (select(0.0f,alu43,(0.0f<alu43))-select(0.0f,alu56,(0.0f<alu56)));
  data0[alu48] = (select(0.0f,alu44,(0.0f<alu44))-select(0.0f,alu57,(0.0f<alu57)));
  data0[(alu48+1)] = (select(0.0f,alu45,(0.0f<alu45))-select(0.0f,alu58,(0.0f<alu58)));
  data0[(alu48+2)] = (select(0.0f,alu46,(0.0f<alu46))-select(0.0f,alu59,(0.0f<alu59)));
  data0[(alu48+3)] = (select(0.0f,alu47,(0.0f<alu47))-select(0.0f,alu60,(0.0f<alu60)));
}`;

const r_7_256_32_4_8_16_21_3_4_3_3_3n3 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
fn is_nan(v:f32) -> bool { return min(v, 1.0) == 1.0 && max(v, -1.0) == -1.0; }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 128 */
  var gidx1 = i32(gindex.y); /* 256 */
  var gidx2 = i32(gindex.z); /* 7 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (gidx0&3);
  var alu1 = (gidx1<<16);
  var alu2 = ((gidx0>>2)<<11);
  var alu3 = (alu0<<6);
  var alu4 = (lidx0<<8);
  var alu5 = (lidx1<<2);
  var alu6 = (lidx1+(alu0<<4));
  var alu7 = (alu6<60);
  var alu8 = ((alu6<4)!=true);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  var acc4 = 0.0f;
  var acc5 = 0.0f;
  var acc6 = 0.0f;
  var acc7 = 0.0f;
  var acc8 = 0.0f;
  var acc9 = 0.0f;
  var acc10 = 0.0f;
  var acc11 = 0.0f;
  for (var ridx0 = 0; ridx0 < 21; ridx0++) {
    for (var ridx1 = 0; ridx1 < 3; ridx1++) {
      var alu9 = (gidx1+(ridx1<<4));
      var alu10 = ((alu9<272)&((alu9<16)!=true));
      var alu11 = (((gidx0<8)!=true)&alu10);
      var alu12 = ((gidx0<120)&alu10);
      var alu13 = (alu7&alu12);
      var alu14 = (alu7&alu10);
      var alu15 = (alu7&alu11);
      var alu16 = (alu8&alu12);
      var alu17 = (alu8&alu10);
      var alu18 = (alu8&alu11);
      var alu19 = ((gidx2*1701)+(ridx0*27)+(ridx1*9));
      var val0 = data2[alu19];
      var val1 = data2[(alu19+1)];
      var val2 = data2[(alu19+2)];
      var val3 = data2[(alu19+3)];
      var val4 = data2[(alu19+4)];
      var val5 = data2[(alu19+5)];
      var val6 = data2[(alu19+6)];
      var val7 = data2[(alu19+7)];
      var val8 = data2[(alu19+8)];
      var val9 = data2[(alu19+567)];
      var val10 = data2[(alu19+568)];
      var val11 = data2[(alu19+569)];
      var val12 = data2[(alu19+570)];
      var val13 = data2[(alu19+571)];
      var val14 = data2[(alu19+572)];
      var val15 = data2[(alu19+573)];
      var val16 = data2[(alu19+574)];
      var val17 = data2[(alu19+575)];
      var val18 = data2[(alu19+1134)];
      var val19 = data2[(alu19+1135)];
      var val20 = data2[(alu19+1136)];
      var val21 = data2[(alu19+1137)];
      var val22 = data2[(alu19+1138)];
      var val23 = data2[(alu19+1139)];
      var val24 = data2[(alu19+1140)];
      var val25 = data2[(alu19+1141)];
      var val26 = data2[(alu19+1142)];
      var alu20 = (alu1+(ridx1<<20)+(ridx0<<24)+alu4+alu2+alu5+alu3);
      var val27 = select(0.0f, data1[(alu20+-1052688)], alu18);
      var val28 = select(0.0f, data1[(alu20+-1052687)], alu18);
      var val29 = select(0.0f, data1[(alu20+-1052686)], alu18);
      var val30 = select(0.0f, data1[(alu20+-1052685)], alu18);
      var val31 = select(0.0f, data1[(alu20+-1052672)], alu11);
      var val32 = select(0.0f, data1[(alu20+-1052671)], alu11);
      var val33 = select(0.0f, data1[(alu20+-1052670)], alu11);
      var val34 = select(0.0f, data1[(alu20+-1052669)], alu11);
      var val35 = select(0.0f, data1[(alu20+-1052656)], alu15);
      var val36 = select(0.0f, data1[(alu20+-1052655)], alu15);
      var val37 = select(0.0f, data1[(alu20+-1052654)], alu15);
      var val38 = select(0.0f, data1[(alu20+-1052653)], alu15);
      var val39 = select(0.0f, data1[(alu20+-1048592)], alu17);
      var val40 = select(0.0f, data1[(alu20+-1048591)], alu17);
      var val41 = select(0.0f, data1[(alu20+-1048590)], alu17);
      var val42 = select(0.0f, data1[(alu20+-1048589)], alu17);
      var val43 = select(0.0f, data1[(alu20+-1048576)], alu10);
      var val44 = select(0.0f, data1[(alu20+-1048575)], alu10);
      var val45 = select(0.0f, data1[(alu20+-1048574)], alu10);
      var val46 = select(0.0f, data1[(alu20+-1048573)], alu10);
      var val47 = select(0.0f, data1[(alu20+-1048560)], alu14);
      var val48 = select(0.0f, data1[(alu20+-1048559)], alu14);
      var val49 = select(0.0f, data1[(alu20+-1048558)], alu14);
      var val50 = select(0.0f, data1[(alu20+-1048557)], alu14);
      var val51 = select(0.0f, data1[(alu20+-1044496)], alu16);
      var val52 = select(0.0f, data1[(alu20+-1044495)], alu16);
      var val53 = select(0.0f, data1[(alu20+-1044494)], alu16);
      var val54 = select(0.0f, data1[(alu20+-1044493)], alu16);
      var val55 = select(0.0f, data1[(alu20+-1044480)], alu12);
      var val56 = select(0.0f, data1[(alu20+-1044479)], alu12);
      var val57 = select(0.0f, data1[(alu20+-1044478)], alu12);
      var val58 = select(0.0f, data1[(alu20+-1044477)], alu12);
      var val59 = select(0.0f, data1[(alu20+-1044464)], alu13);
      var val60 = select(0.0f, data1[(alu20+-1044463)], alu13);
      var val61 = select(0.0f, data1[(alu20+-1044462)], alu13);
      var val62 = select(0.0f, data1[(alu20+-1044461)], alu13);
      acc0 = (acc0+(val27*val0)+(val39*val3)+(val51*val6)+(val31*val1)+(val43*val4)+(val55*val7)+(val35*val2)+(val47*val5)+(val59*val8));
      acc1 = (acc1+(val27*val9)+(val39*val12)+(val51*val15)+(val31*val10)+(val43*val13)+(val55*val16)+(val35*val11)+(val47*val14)+(val59*val17));
      acc2 = (acc2+(val27*val18)+(val39*val21)+(val51*val24)+(val31*val19)+(val43*val22)+(val55*val25)+(val35*val20)+(val47*val23)+(val59*val26));
      acc3 = (acc3+(val28*val0)+(val40*val3)+(val52*val6)+(val32*val1)+(val44*val4)+(val56*val7)+(val36*val2)+(val48*val5)+(val60*val8));
      acc4 = (acc4+(val28*val9)+(val40*val12)+(val52*val15)+(val32*val10)+(val44*val13)+(val56*val16)+(val36*val11)+(val48*val14)+(val60*val17));
      acc5 = (acc5+(val28*val18)+(val40*val21)+(val52*val24)+(val32*val19)+(val44*val22)+(val56*val25)+(val36*val20)+(val48*val23)+(val60*val26));
      acc6 = (acc6+(val29*val0)+(val41*val3)+(val53*val6)+(val33*val1)+(val45*val4)+(val57*val7)+(val37*val2)+(val49*val5)+(val61*val8));
      acc7 = (acc7+(val29*val9)+(val41*val12)+(val53*val15)+(val33*val10)+(val45*val13)+(val57*val16)+(val37*val11)+(val49*val14)+(val61*val17));
      acc8 = (acc8+(val29*val18)+(val41*val21)+(val53*val24)+(val33*val19)+(val45*val22)+(val57*val25)+(val37*val20)+(val49*val23)+(val61*val26));
      acc9 = (acc9+(val30*val0)+(val42*val3)+(val54*val6)+(val34*val1)+(val46*val4)+(val58*val7)+(val38*val2)+(val50*val5)+(val62*val8));
      acc10 = (acc10+(val30*val9)+(val42*val12)+(val54*val15)+(val34*val10)+(val46*val13)+(val58*val16)+(val38*val11)+(val50*val14)+(val62*val17));
      acc11 = (acc11+(val30*val18)+(val42*val21)+(val54*val24)+(val34*val19)+(val46*val22)+(val58*val25)+(val38*val20)+(val50*val23)+(val62*val26));
    }
  }
  var alu35 = (gidx2*3);
  var val63 = data3[alu35];
  var val64 = data3[(alu35+1)];
  var val65 = data3[(alu35+2)];
  var alu36 = (val64+acc1);
  var alu37 = (val64+acc4);
  var alu38 = (val64+acc7);
  var alu39 = (val64+acc10);
  var alu40 = (val65+acc2);
  var alu41 = (val65+acc5);
  var alu42 = (val65+acc8);
  var alu43 = (val65+acc11);
  var alu44 = (val63+acc0);
  var alu45 = (val63+acc3);
  var alu46 = (val63+acc6);
  var alu47 = (val63+acc9);
  var alu48 = (alu1+(gidx2*50331648)+alu2+alu3+alu4+alu5);
  var alu49 = (1.0f-exp2((alu36*1.4426950408889634f)));
  var alu50 = (1.0f-exp2((alu37*1.4426950408889634f)));
  var alu51 = (1.0f-exp2((alu38*1.4426950408889634f)));
  var alu52 = (1.0f-exp2((alu39*1.4426950408889634f)));
  var alu53 = (1.0f-exp2((alu40*1.4426950408889634f)));
  var alu54 = (1.0f-exp2((alu41*1.4426950408889634f)));
  var alu55 = (1.0f-exp2((alu42*1.4426950408889634f)));
  var alu56 = (1.0f-exp2((alu43*1.4426950408889634f)));
  var alu57 = (1.0f-exp2((alu44*1.4426950408889634f)));
  var alu58 = (1.0f-exp2((alu45*1.4426950408889634f)));
  var alu59 = (1.0f-exp2((alu46*1.4426950408889634f)));
  var alu60 = (1.0f-exp2((alu47*1.4426950408889634f)));
  data0[(alu48+16777216)] = (select(0.0f,alu36,(0.0f<alu36))-select(0.0f,alu49,(0.0f<alu49)));
  data0[(alu48+16777217)] = (select(0.0f,alu37,(0.0f<alu37))-select(0.0f,alu50,(0.0f<alu50)));
  data0[(alu48+16777218)] = (select(0.0f,alu38,(0.0f<alu38))-select(0.0f,alu51,(0.0f<alu51)));
  data0[(alu48+16777219)] = (select(0.0f,alu39,(0.0f<alu39))-select(0.0f,alu52,(0.0f<alu52)));
  data0[(alu48+33554432)] = (select(0.0f,alu40,(0.0f<alu40))-select(0.0f,alu53,(0.0f<alu53)));
  data0[(alu48+33554433)] = (select(0.0f,alu41,(0.0f<alu41))-select(0.0f,alu54,(0.0f<alu54)));
  data0[(alu48+33554434)] = (select(0.0f,alu42,(0.0f<alu42))-select(0.0f,alu55,(0.0f<alu55)));
  data0[(alu48+33554435)] = (select(0.0f,alu43,(0.0f<alu43))-select(0.0f,alu56,(0.0f<alu56)));
  data0[alu48] = (select(0.0f,alu44,(0.0f<alu44))-select(0.0f,alu57,(0.0f<alu57)));
  data0[(alu48+1)] = (select(0.0f,alu45,(0.0f<alu45))-select(0.0f,alu58,(0.0f<alu58)));
  data0[(alu48+2)] = (select(0.0f,alu46,(0.0f<alu46))-select(0.0f,alu59,(0.0f<alu59)));
  data0[(alu48+3)] = (select(0.0f,alu47,(0.0f<alu47))-select(0.0f,alu60,(0.0f<alu60)));
}`;

const r_7_256_32_4_8_16_21_3_4_3_3_3n4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
fn is_nan(v:f32) -> bool { return min(v, 1.0) == 1.0 && max(v, -1.0) == -1.0; }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 128 */
  var gidx1 = i32(gindex.y); /* 256 */
  var gidx2 = i32(gindex.z); /* 7 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (gidx0>>2);
  var alu1 = (gidx0&3);
  var alu2 = (gidx1<<16);
  var alu3 = (alu0<<11);
  var alu4 = (alu1<<6);
  var alu5 = (lidx0<<8);
  var alu6 = (lidx1<<2);
  var alu7 = (alu6+alu4);
  var alu8 = (lidx0+(alu0<<3));
  var alu9 = ((alu7<1)!=true);
  var alu10 = ((lidx1+(alu1<<4))<63);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  var acc4 = 0.0f;
  var acc5 = 0.0f;
  var acc6 = 0.0f;
  var acc7 = 0.0f;
  var acc8 = 0.0f;
  var acc9 = 0.0f;
  var acc10 = 0.0f;
  var acc11 = 0.0f;
  for (var ridx0 = 0; ridx0 < 21; ridx0++) {
    for (var ridx1 = 0; ridx1 < 3; ridx1++) {
      var alu11 = (gidx1+ridx1);
      var alu12 = ((alu11<257)&((alu11<1)!=true));
      var alu13 = (((alu8<1)!=true)&alu12);
      var alu14 = ((alu8<255)&alu12);
      var alu15 = ((gidx2*1701)+(ridx0*27)+(ridx1*9));
      var val0 = data2[alu15];
      var val1 = data2[(alu15+1)];
      var val2 = data2[(alu15+2)];
      var val3 = data2[(alu15+3)];
      var val4 = data2[(alu15+4)];
      var val5 = data2[(alu15+5)];
      var val6 = data2[(alu15+6)];
      var val7 = data2[(alu15+7)];
      var val8 = data2[(alu15+8)];
      var val9 = data2[(alu15+567)];
      var val10 = data2[(alu15+568)];
      var val11 = data2[(alu15+569)];
      var val12 = data2[(alu15+570)];
      var val13 = data2[(alu15+571)];
      var val14 = data2[(alu15+572)];
      var val15 = data2[(alu15+573)];
      var val16 = data2[(alu15+574)];
      var val17 = data2[(alu15+575)];
      var val18 = data2[(alu15+1134)];
      var val19 = data2[(alu15+1135)];
      var val20 = data2[(alu15+1136)];
      var val21 = data2[(alu15+1137)];
      var val22 = data2[(alu15+1138)];
      var val23 = data2[(alu15+1139)];
      var val24 = data2[(alu15+1140)];
      var val25 = data2[(alu15+1141)];
      var val26 = data2[(alu15+1142)];
      var alu16 = (alu2+(ridx1<<16)+(ridx0<<24)+alu5+alu3+alu7);
      var val27 = select(0.0f, data1[(alu16+-65793)], (alu9&alu13));
      var val28 = select(0.0f, data1[(alu16+-65792)], alu13);
      var val29 = select(0.0f, data1[(alu16+-65791)], alu13);
      var val30 = select(0.0f, data1[(alu16+-65790)], alu13);
      var val31 = select(0.0f, data1[(alu16+-65789)], alu13);
      var val32 = select(0.0f, data1[(alu16+-65788)], (alu10&alu13));
      var val33 = select(0.0f, data1[(alu16+-65537)], (alu9&alu12));
      var val34 = select(0.0f, data1[(alu16+-65536)], alu12);
      var val35 = select(0.0f, data1[(alu16+-65535)], alu12);
      var val36 = select(0.0f, data1[(alu16+-65534)], alu12);
      var val37 = select(0.0f, data1[(alu16+-65533)], alu12);
      var val38 = select(0.0f, data1[(alu16+-65532)], (alu10&alu12));
      var val39 = select(0.0f, data1[(alu16+-65281)], (alu9&alu14));
      var val40 = select(0.0f, data1[(alu16+-65280)], alu14);
      var val41 = select(0.0f, data1[(alu16+-65279)], alu14);
      var val42 = select(0.0f, data1[(alu16+-65278)], alu14);
      var val43 = select(0.0f, data1[(alu16+-65277)], alu14);
      var val44 = select(0.0f, data1[(alu16+-65276)], (alu10&alu14));
      acc0 = (acc0+(val27*val0)+(val33*val3)+(val39*val6)+(val28*val1)+(val34*val4)+(val40*val7)+(val29*val2)+(val35*val5)+(val41*val8));
      acc1 = (acc1+(val27*val9)+(val33*val12)+(val39*val15)+(val28*val10)+(val34*val13)+(val40*val16)+(val29*val11)+(val35*val14)+(val41*val17));
      acc2 = (acc2+(val27*val18)+(val33*val21)+(val39*val24)+(val28*val19)+(val34*val22)+(val40*val25)+(val29*val20)+(val35*val23)+(val41*val26));
      acc3 = (acc3+(val28*val0)+(val34*val3)+(val40*val6)+(val29*val1)+(val35*val4)+(val41*val7)+(val30*val2)+(val36*val5)+(val42*val8));
      acc4 = (acc4+(val28*val9)+(val34*val12)+(val40*val15)+(val29*val10)+(val35*val13)+(val41*val16)+(val30*val11)+(val36*val14)+(val42*val17));
      acc5 = (acc5+(val28*val18)+(val34*val21)+(val40*val24)+(val29*val19)+(val35*val22)+(val41*val25)+(val30*val20)+(val36*val23)+(val42*val26));
      acc6 = (acc6+(val29*val0)+(val35*val3)+(val41*val6)+(val30*val1)+(val36*val4)+(val42*val7)+(val31*val2)+(val37*val5)+(val43*val8));
      acc7 = (acc7+(val29*val9)+(val35*val12)+(val41*val15)+(val30*val10)+(val36*val13)+(val42*val16)+(val31*val11)+(val37*val14)+(val43*val17));
      acc8 = (acc8+(val29*val18)+(val35*val21)+(val41*val24)+(val30*val19)+(val36*val22)+(val42*val25)+(val31*val20)+(val37*val23)+(val43*val26));
      acc9 = (acc9+(val30*val0)+(val36*val3)+(val42*val6)+(val31*val1)+(val37*val4)+(val43*val7)+(val32*val2)+(val38*val5)+(val44*val8));
      acc10 = (acc10+(val30*val9)+(val36*val12)+(val42*val15)+(val31*val10)+(val37*val13)+(val43*val16)+(val32*val11)+(val38*val14)+(val44*val17));
      acc11 = (acc11+(val30*val18)+(val36*val21)+(val42*val24)+(val31*val19)+(val37*val22)+(val43*val25)+(val32*val20)+(val38*val23)+(val44*val26));
    }
  }
  var alu31 = (gidx2*3);
  var val45 = data3[alu31];
  var val46 = data3[(alu31+1)];
  var val47 = data3[(alu31+2)];
  var alu32 = (val46+acc1);
  var alu33 = (val46+acc4);
  var alu34 = (val46+acc7);
  var alu35 = (val46+acc10);
  var alu36 = (val47+acc2);
  var alu37 = (val47+acc5);
  var alu38 = (val47+acc8);
  var alu39 = (val47+acc11);
  var alu40 = (val45+acc0);
  var alu41 = (val45+acc3);
  var alu42 = (val45+acc6);
  var alu43 = (val45+acc9);
  var alu44 = (alu2+(gidx2*50331648)+alu3+alu4+alu5+alu6);
  var alu45 = (1.0f-exp2((alu32*1.4426950408889634f)));
  var alu46 = (1.0f-exp2((alu33*1.4426950408889634f)));
  var alu47 = (1.0f-exp2((alu34*1.4426950408889634f)));
  var alu48 = (1.0f-exp2((alu35*1.4426950408889634f)));
  var alu49 = (1.0f-exp2((alu36*1.4426950408889634f)));
  var alu50 = (1.0f-exp2((alu37*1.4426950408889634f)));
  var alu51 = (1.0f-exp2((alu38*1.4426950408889634f)));
  var alu52 = (1.0f-exp2((alu39*1.4426950408889634f)));
  var alu53 = (1.0f-exp2((alu40*1.4426950408889634f)));
  var alu54 = (1.0f-exp2((alu41*1.4426950408889634f)));
  var alu55 = (1.0f-exp2((alu42*1.4426950408889634f)));
  var alu56 = (1.0f-exp2((alu43*1.4426950408889634f)));
  data0[(alu44+16777216)] = (select(0.0f,alu32,(0.0f<alu32))-select(0.0f,alu45,(0.0f<alu45)));
  data0[(alu44+16777217)] = (select(0.0f,alu33,(0.0f<alu33))-select(0.0f,alu46,(0.0f<alu46)));
  data0[(alu44+16777218)] = (select(0.0f,alu34,(0.0f<alu34))-select(0.0f,alu47,(0.0f<alu47)));
  data0[(alu44+16777219)] = (select(0.0f,alu35,(0.0f<alu35))-select(0.0f,alu48,(0.0f<alu48)));
  data0[(alu44+33554432)] = (select(0.0f,alu36,(0.0f<alu36))-select(0.0f,alu49,(0.0f<alu49)));
  data0[(alu44+33554433)] = (select(0.0f,alu37,(0.0f<alu37))-select(0.0f,alu50,(0.0f<alu50)));
  data0[(alu44+33554434)] = (select(0.0f,alu38,(0.0f<alu38))-select(0.0f,alu51,(0.0f<alu51)));
  data0[(alu44+33554435)] = (select(0.0f,alu39,(0.0f<alu39))-select(0.0f,alu52,(0.0f<alu52)));
  data0[alu44] = (select(0.0f,alu40,(0.0f<alu40))-select(0.0f,alu53,(0.0f<alu53)));
  data0[(alu44+1)] = (select(0.0f,alu41,(0.0f<alu41))-select(0.0f,alu54,(0.0f<alu54)));
  data0[(alu44+2)] = (select(0.0f,alu42,(0.0f<alu42))-select(0.0f,alu55,(0.0f<alu55)));
  data0[(alu44+3)] = (select(0.0f,alu43,(0.0f<alu43))-select(0.0f,alu56,(0.0f<alu56)));
}`;

const r_2_32768_8_3_16_4_3_21 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
fn is_nan(v:f32) -> bool { return min(v, 1.0) == 1.0 && max(v, -1.0) == -1.0; }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@compute @workgroup_size(3,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 8 */
  var gidx1 = i32(gindex.y); /* 32768 */
  var gidx2 = i32(gindex.z); /* 2 */
  var lidx0 = i32(lindex.x); /* 3 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = ((gidx2*9)+(lidx0*3));
  var val0 = data3[alu0];
  var val1 = data3[(alu0+1)];
  var val2 = data3[(alu0+2)];
  var alu1 = ((gidx2*189)+(lidx0*63));
  var val3 = data2[alu1];
  var val4 = data2[(alu1+1)];
  var val5 = data2[(alu1+2)];
  var val6 = data2[(alu1+3)];
  var val7 = data2[(alu1+4)];
  var val8 = data2[(alu1+5)];
  var val9 = data2[(alu1+6)];
  var val10 = data2[(alu1+7)];
  var val11 = data2[(alu1+8)];
  var val12 = data2[(alu1+9)];
  var val13 = data2[(alu1+10)];
  var val14 = data2[(alu1+11)];
  var val15 = data2[(alu1+12)];
  var val16 = data2[(alu1+13)];
  var val17 = data2[(alu1+14)];
  var val18 = data2[(alu1+15)];
  var val19 = data2[(alu1+16)];
  var val20 = data2[(alu1+17)];
  var val21 = data2[(alu1+18)];
  var val22 = data2[(alu1+19)];
  var val23 = data2[(alu1+20)];
  var val24 = data2[(alu1+21)];
  var val25 = data2[(alu1+22)];
  var val26 = data2[(alu1+23)];
  var val27 = data2[(alu1+24)];
  var val28 = data2[(alu1+25)];
  var val29 = data2[(alu1+26)];
  var val30 = data2[(alu1+27)];
  var val31 = data2[(alu1+28)];
  var val32 = data2[(alu1+29)];
  var val33 = data2[(alu1+30)];
  var val34 = data2[(alu1+31)];
  var val35 = data2[(alu1+32)];
  var val36 = data2[(alu1+33)];
  var val37 = data2[(alu1+34)];
  var val38 = data2[(alu1+35)];
  var val39 = data2[(alu1+36)];
  var val40 = data2[(alu1+37)];
  var val41 = data2[(alu1+38)];
  var val42 = data2[(alu1+39)];
  var val43 = data2[(alu1+40)];
  var val44 = data2[(alu1+41)];
  var val45 = data2[(alu1+42)];
  var val46 = data2[(alu1+43)];
  var val47 = data2[(alu1+44)];
  var val48 = data2[(alu1+45)];
  var val49 = data2[(alu1+46)];
  var val50 = data2[(alu1+47)];
  var val51 = data2[(alu1+48)];
  var val52 = data2[(alu1+49)];
  var val53 = data2[(alu1+50)];
  var val54 = data2[(alu1+51)];
  var val55 = data2[(alu1+52)];
  var val56 = data2[(alu1+53)];
  var val57 = data2[(alu1+54)];
  var val58 = data2[(alu1+55)];
  var val59 = data2[(alu1+56)];
  var val60 = data2[(alu1+57)];
  var val61 = data2[(alu1+58)];
  var val62 = data2[(alu1+59)];
  var val63 = data2[(alu1+60)];
  var val64 = data2[(alu1+61)];
  var val65 = data2[(alu1+62)];
  var alu2 = (gidx0<<6);
  var alu3 = (gidx1<<9);
  var alu4 = (lidx1<<2);
  var alu5 = (alu2+alu3+alu4);
  var val66 = data1[alu5];
  var val67 = data1[(alu5+1)];
  var val68 = data1[(alu5+2)];
  var val69 = data1[(alu5+3)];
  var val70 = data1[(alu5+16777216)];
  var val71 = data1[(alu5+16777217)];
  var val72 = data1[(alu5+16777218)];
  var val73 = data1[(alu5+16777219)];
  var val74 = data1[(alu5+33554432)];
  var val75 = data1[(alu5+33554433)];
  var val76 = data1[(alu5+33554434)];
  var val77 = data1[(alu5+33554435)];
  var val78 = data1[(alu5+50331648)];
  var val79 = data1[(alu5+50331649)];
  var val80 = data1[(alu5+50331650)];
  var val81 = data1[(alu5+50331651)];
  var val82 = data1[(alu5+67108864)];
  var val83 = data1[(alu5+67108865)];
  var val84 = data1[(alu5+67108866)];
  var val85 = data1[(alu5+67108867)];
  var val86 = data1[(alu5+83886080)];
  var val87 = data1[(alu5+83886081)];
  var val88 = data1[(alu5+83886082)];
  var val89 = data1[(alu5+83886083)];
  var val90 = data1[(alu5+100663296)];
  var val91 = data1[(alu5+100663297)];
  var val92 = data1[(alu5+100663298)];
  var val93 = data1[(alu5+100663299)];
  var val94 = data1[(alu5+117440512)];
  var val95 = data1[(alu5+117440513)];
  var val96 = data1[(alu5+117440514)];
  var val97 = data1[(alu5+117440515)];
  var val98 = data1[(alu5+134217728)];
  var val99 = data1[(alu5+134217729)];
  var val100 = data1[(alu5+134217730)];
  var val101 = data1[(alu5+134217731)];
  var val102 = data1[(alu5+150994944)];
  var val103 = data1[(alu5+150994945)];
  var val104 = data1[(alu5+150994946)];
  var val105 = data1[(alu5+150994947)];
  var val106 = data1[(alu5+167772160)];
  var val107 = data1[(alu5+167772161)];
  var val108 = data1[(alu5+167772162)];
  var val109 = data1[(alu5+167772163)];
  var val110 = data1[(alu5+184549376)];
  var val111 = data1[(alu5+184549377)];
  var val112 = data1[(alu5+184549378)];
  var val113 = data1[(alu5+184549379)];
  var val114 = data1[(alu5+201326592)];
  var val115 = data1[(alu5+201326593)];
  var val116 = data1[(alu5+201326594)];
  var val117 = data1[(alu5+201326595)];
  var val118 = data1[(alu5+218103808)];
  var val119 = data1[(alu5+218103809)];
  var val120 = data1[(alu5+218103810)];
  var val121 = data1[(alu5+218103811)];
  var val122 = data1[(alu5+234881024)];
  var val123 = data1[(alu5+234881025)];
  var val124 = data1[(alu5+234881026)];
  var val125 = data1[(alu5+234881027)];
  var val126 = data1[(alu5+251658240)];
  var val127 = data1[(alu5+251658241)];
  var val128 = data1[(alu5+251658242)];
  var val129 = data1[(alu5+251658243)];
  var val130 = data1[(alu5+268435456)];
  var val131 = data1[(alu5+268435457)];
  var val132 = data1[(alu5+268435458)];
  var val133 = data1[(alu5+268435459)];
  var val134 = data1[(alu5+285212672)];
  var val135 = data1[(alu5+285212673)];
  var val136 = data1[(alu5+285212674)];
  var val137 = data1[(alu5+285212675)];
  var val138 = data1[(alu5+301989888)];
  var val139 = data1[(alu5+301989889)];
  var val140 = data1[(alu5+301989890)];
  var val141 = data1[(alu5+301989891)];
  var val142 = data1[(alu5+318767104)];
  var val143 = data1[(alu5+318767105)];
  var val144 = data1[(alu5+318767106)];
  var val145 = data1[(alu5+318767107)];
  var val146 = data1[(alu5+335544320)];
  var val147 = data1[(alu5+335544321)];
  var val148 = data1[(alu5+335544322)];
  var val149 = data1[(alu5+335544323)];
  var alu6 = (alu3+(gidx2*150994944)+alu2+(lidx0*50331648)+alu4);
  data0[(alu6+1)] = (val0+(val67*val3)+(val71*val4)+(val75*val5)+(val79*val6)+(val83*val7)+(val87*val8)+(val91*val9)+(val95*val10)+(val99*val11)+(val103*val12)+(val107*val13)+(val111*val14)+(val115*val15)+(val119*val16)+(val123*val17)+(val127*val18)+(val131*val19)+(val135*val20)+(val139*val21)+(val143*val22)+(val147*val23));
  data0[(alu6+16777217)] = (val1+(val67*val24)+(val71*val25)+(val75*val26)+(val79*val27)+(val83*val28)+(val87*val29)+(val91*val30)+(val95*val31)+(val99*val32)+(val103*val33)+(val107*val34)+(val111*val35)+(val115*val36)+(val119*val37)+(val123*val38)+(val127*val39)+(val131*val40)+(val135*val41)+(val139*val42)+(val143*val43)+(val147*val44));
  data0[(alu6+33554433)] = (val2+(val67*val45)+(val71*val46)+(val75*val47)+(val79*val48)+(val83*val49)+(val87*val50)+(val91*val51)+(val95*val52)+(val99*val53)+(val103*val54)+(val107*val55)+(val111*val56)+(val115*val57)+(val119*val58)+(val123*val59)+(val127*val60)+(val131*val61)+(val135*val62)+(val139*val63)+(val143*val64)+(val147*val65));
  data0[(alu6+2)] = (val0+(val68*val3)+(val72*val4)+(val76*val5)+(val80*val6)+(val84*val7)+(val88*val8)+(val92*val9)+(val96*val10)+(val100*val11)+(val104*val12)+(val108*val13)+(val112*val14)+(val116*val15)+(val120*val16)+(val124*val17)+(val128*val18)+(val132*val19)+(val136*val20)+(val140*val21)+(val144*val22)+(val148*val23));
  data0[(alu6+16777218)] = (val1+(val68*val24)+(val72*val25)+(val76*val26)+(val80*val27)+(val84*val28)+(val88*val29)+(val92*val30)+(val96*val31)+(val100*val32)+(val104*val33)+(val108*val34)+(val112*val35)+(val116*val36)+(val120*val37)+(val124*val38)+(val128*val39)+(val132*val40)+(val136*val41)+(val140*val42)+(val144*val43)+(val148*val44));
  data0[(alu6+33554434)] = (val2+(val68*val45)+(val72*val46)+(val76*val47)+(val80*val48)+(val84*val49)+(val88*val50)+(val92*val51)+(val96*val52)+(val100*val53)+(val104*val54)+(val108*val55)+(val112*val56)+(val116*val57)+(val120*val58)+(val124*val59)+(val128*val60)+(val132*val61)+(val136*val62)+(val140*val63)+(val144*val64)+(val148*val65));
  data0[(alu6+3)] = (val0+(val69*val3)+(val73*val4)+(val77*val5)+(val81*val6)+(val85*val7)+(val89*val8)+(val93*val9)+(val97*val10)+(val101*val11)+(val105*val12)+(val109*val13)+(val113*val14)+(val117*val15)+(val121*val16)+(val125*val17)+(val129*val18)+(val133*val19)+(val137*val20)+(val141*val21)+(val145*val22)+(val149*val23));
  data0[(alu6+16777219)] = (val1+(val69*val24)+(val73*val25)+(val77*val26)+(val81*val27)+(val85*val28)+(val89*val29)+(val93*val30)+(val97*val31)+(val101*val32)+(val105*val33)+(val109*val34)+(val113*val35)+(val117*val36)+(val121*val37)+(val125*val38)+(val129*val39)+(val133*val40)+(val137*val41)+(val141*val42)+(val145*val43)+(val149*val44));
  data0[(alu6+33554435)] = (val2+(val69*val45)+(val73*val46)+(val77*val47)+(val81*val48)+(val85*val49)+(val89*val50)+(val93*val51)+(val97*val52)+(val101*val53)+(val105*val54)+(val109*val55)+(val113*val56)+(val117*val57)+(val121*val58)+(val125*val59)+(val129*val60)+(val133*val61)+(val137*val62)+(val141*val63)+(val145*val64)+(val149*val65));
  data0[(alu6+16777216)] = (val1+(val70*val25)+(val66*val24)+(val74*val26)+(val78*val27)+(val82*val28)+(val86*val29)+(val90*val30)+(val94*val31)+(val98*val32)+(val102*val33)+(val106*val34)+(val110*val35)+(val114*val36)+(val118*val37)+(val122*val38)+(val126*val39)+(val130*val40)+(val134*val41)+(val138*val42)+(val142*val43)+(val146*val44));
  data0[(alu6+33554432)] = (val2+(val70*val46)+(val66*val45)+(val74*val47)+(val78*val48)+(val82*val49)+(val86*val50)+(val90*val51)+(val94*val52)+(val98*val53)+(val102*val54)+(val106*val55)+(val110*val56)+(val114*val57)+(val118*val58)+(val122*val59)+(val126*val60)+(val130*val61)+(val134*val62)+(val138*val63)+(val142*val64)+(val146*val65));
  data0[alu6] = (val0+(val70*val4)+(val66*val3)+(val74*val5)+(val78*val6)+(val82*val7)+(val86*val8)+(val90*val9)+(val94*val10)+(val98*val11)+(val102*val12)+(val106*val13)+(val110*val14)+(val114*val15)+(val118*val16)+(val122*val17)+(val126*val18)+(val130*val19)+(val134*val20)+(val138*val21)+(val142*val22)+(val146*val23));
}`;

const r_32768_16_1_32_18 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
fn is_nan(v:f32) -> bool { return min(v, 1.0) == 1.0 && max(v, -1.0) == -1.0; }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx1 = i32(gindex.y); /* 16 */
  var gidx2 = i32(gindex.z); /* 32768 */
  var lidx0 = i32(lindex.x); /* 32 */
  var alu0 = (lidx0+(gidx1<<5)+(gidx2<<9));
  var val0 = data1[alu0];
  var val1 = data1[(alu0+16777216)];
  var val2 = data1[(alu0+33554432)];
  var val3 = data1[(alu0+50331648)];
  var val4 = data1[(alu0+67108864)];
  var val5 = data1[(alu0+83886080)];
  var val6 = data1[(alu0+100663296)];
  var val7 = data1[(alu0+117440512)];
  var val8 = data1[(alu0+134217728)];
  var val9 = data1[(alu0+150994944)];
  var val10 = data1[(alu0+167772160)];
  var val11 = data1[(alu0+184549376)];
  var val12 = data1[(alu0+201326592)];
  var val13 = data1[(alu0+218103808)];
  var val14 = data1[(alu0+234881024)];
  var val15 = data1[(alu0+251658240)];
  var val16 = data1[(alu0+268435456)];
  var val17 = data1[(alu0+285212672)];
  var alu1 = select(val0,val1,(val0<val1));
  var alu2 = select(val2,alu1,(val2<alu1));
  var alu3 = select(val3,alu2,(val3<alu2));
  var alu4 = select(val4,alu3,(val4<alu3));
  var alu5 = select(val5,alu4,(val5<alu4));
  var alu6 = select(val6,alu5,(val6<alu5));
  var alu7 = select(val7,alu6,(val7<alu6));
  var alu8 = select(val8,alu7,(val8<alu7));
  var alu9 = select(val9,alu8,(val9<alu8));
  var alu10 = select(val10,alu9,(val10<alu9));
  var alu11 = select(val11,alu10,(val11<alu10));
  var alu12 = select(val12,alu11,(val12<alu11));
  var alu13 = select(val13,alu12,(val13<alu12));
  var alu14 = select(val14,alu13,(val14<alu13));
  var alu15 = select(val15,alu14,(val15<alu14));
  var alu16 = select(val16,alu15,(val16<alu15));
  data0[alu0] = select(val17,alu16,(val17<alu16));
}`;

const r_32768_4_1_32_4_18 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
fn is_nan(v:f32) -> bool { return min(v, 1.0) == 1.0 && max(v, -1.0) == -1.0; }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<i32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx1 = i32(gindex.y); /* 4 */
  var gidx2 = i32(gindex.z); /* 32768 */
  var lidx0 = i32(lindex.x); /* 32 */
  var val0 = data3[0];
  var val1 = data3[1];
  var val2 = data3[2];
  var val3 = data3[3];
  var val4 = data3[4];
  var val5 = data3[5];
  var val6 = data3[6];
  var val7 = data3[7];
  var val8 = data3[8];
  var val9 = data3[9];
  var val10 = data3[10];
  var val11 = data3[11];
  var val12 = data3[12];
  var val13 = data3[13];
  var val14 = data3[14];
  var val15 = data3[15];
  var val16 = data3[16];
  var val17 = data3[17];
  var alu0 = ((gidx1<<7)+(gidx2<<9)+(lidx0<<2));
  var val18 = data1[alu0];
  var val19 = data2[alu0];
  var alu1 = (alu0+1);
  var val20 = data1[alu1];
  var val21 = data2[alu1];
  var alu2 = (alu0+2);
  var val22 = data1[alu2];
  var val23 = data2[alu2];
  var alu3 = (alu0+3);
  var val24 = data1[alu3];
  var val25 = data2[alu3];
  var val26 = data1[(alu0+16777216)];
  var val27 = data1[(alu0+16777217)];
  var val28 = data1[(alu0+16777218)];
  var val29 = data1[(alu0+16777219)];
  var val30 = data1[(alu0+33554432)];
  var val31 = data1[(alu0+33554433)];
  var val32 = data1[(alu0+33554434)];
  var val33 = data1[(alu0+33554435)];
  var val34 = data1[(alu0+50331648)];
  var val35 = data1[(alu0+50331649)];
  var val36 = data1[(alu0+50331650)];
  var val37 = data1[(alu0+50331651)];
  var val38 = data1[(alu0+67108864)];
  var val39 = data1[(alu0+67108865)];
  var val40 = data1[(alu0+67108866)];
  var val41 = data1[(alu0+67108867)];
  var val42 = data1[(alu0+83886080)];
  var val43 = data1[(alu0+83886081)];
  var val44 = data1[(alu0+83886082)];
  var val45 = data1[(alu0+83886083)];
  var val46 = data1[(alu0+100663296)];
  var val47 = data1[(alu0+100663297)];
  var val48 = data1[(alu0+100663298)];
  var val49 = data1[(alu0+100663299)];
  var val50 = data1[(alu0+117440512)];
  var val51 = data1[(alu0+117440513)];
  var val52 = data1[(alu0+117440514)];
  var val53 = data1[(alu0+117440515)];
  var val54 = data1[(alu0+134217728)];
  var val55 = data1[(alu0+134217729)];
  var val56 = data1[(alu0+134217730)];
  var val57 = data1[(alu0+134217731)];
  var val58 = data1[(alu0+150994944)];
  var val59 = data1[(alu0+150994945)];
  var val60 = data1[(alu0+150994946)];
  var val61 = data1[(alu0+150994947)];
  var val62 = data1[(alu0+167772160)];
  var val63 = data1[(alu0+167772161)];
  var val64 = data1[(alu0+167772162)];
  var val65 = data1[(alu0+167772163)];
  var val66 = data1[(alu0+184549376)];
  var val67 = data1[(alu0+184549377)];
  var val68 = data1[(alu0+184549378)];
  var val69 = data1[(alu0+184549379)];
  var val70 = data1[(alu0+201326592)];
  var val71 = data1[(alu0+201326593)];
  var val72 = data1[(alu0+201326594)];
  var val73 = data1[(alu0+201326595)];
  var val74 = data1[(alu0+218103808)];
  var val75 = data1[(alu0+218103809)];
  var val76 = data1[(alu0+218103810)];
  var val77 = data1[(alu0+218103811)];
  var val78 = data1[(alu0+234881024)];
  var val79 = data1[(alu0+234881025)];
  var val80 = data1[(alu0+234881026)];
  var val81 = data1[(alu0+234881027)];
  var val82 = data1[(alu0+251658240)];
  var val83 = data1[(alu0+251658241)];
  var val84 = data1[(alu0+251658242)];
  var val85 = data1[(alu0+251658243)];
  var val86 = data1[(alu0+268435456)];
  var val87 = data1[(alu0+268435457)];
  var val88 = data1[(alu0+268435458)];
  var val89 = data1[(alu0+268435459)];
  var val90 = data1[(alu0+285212672)];
  var val91 = data1[(alu0+285212673)];
  var val92 = data1[(alu0+285212674)];
  var val93 = data1[(alu0+285212675)];
  var alu4 = ((i32(((val20!=val21)!=true)))*val0);
  var alu5 = ((i32(((val22!=val23)!=true)))*val0);
  var alu6 = ((i32(((val24!=val25)!=true)))*val0);
  var alu7 = ((i32(((val26!=val19)!=true)))*val1);
  var alu8 = ((i32(((val27!=val21)!=true)))*val1);
  var alu9 = ((i32(((val28!=val23)!=true)))*val1);
  var alu10 = ((i32(((val29!=val25)!=true)))*val1);
  var alu11 = ((i32(((val30!=val19)!=true)))*val2);
  var alu12 = ((i32(((val31!=val21)!=true)))*val2);
  var alu13 = ((i32(((val32!=val23)!=true)))*val2);
  var alu14 = ((i32(((val33!=val25)!=true)))*val2);
  var alu15 = ((i32(((val34!=val19)!=true)))*val3);
  var alu16 = ((i32(((val35!=val21)!=true)))*val3);
  var alu17 = ((i32(((val36!=val23)!=true)))*val3);
  var alu18 = ((i32(((val37!=val25)!=true)))*val3);
  var alu19 = ((i32(((val38!=val19)!=true)))*val4);
  var alu20 = ((i32(((val39!=val21)!=true)))*val4);
  var alu21 = ((i32(((val40!=val23)!=true)))*val4);
  var alu22 = ((i32(((val41!=val25)!=true)))*val4);
  var alu23 = ((i32(((val42!=val19)!=true)))*val5);
  var alu24 = ((i32(((val43!=val21)!=true)))*val5);
  var alu25 = ((i32(((val44!=val23)!=true)))*val5);
  var alu26 = ((i32(((val45!=val25)!=true)))*val5);
  var alu27 = ((i32(((val46!=val19)!=true)))*val6);
  var alu28 = ((i32(((val47!=val21)!=true)))*val6);
  var alu29 = ((i32(((val48!=val23)!=true)))*val6);
  var alu30 = ((i32(((val49!=val25)!=true)))*val6);
  var alu31 = ((i32(((val50!=val19)!=true)))*val7);
  var alu32 = ((i32(((val51!=val21)!=true)))*val7);
  var alu33 = ((i32(((val52!=val23)!=true)))*val7);
  var alu34 = ((i32(((val53!=val25)!=true)))*val7);
  var alu35 = ((i32(((val54!=val19)!=true)))*val8);
  var alu36 = ((i32(((val55!=val21)!=true)))*val8);
  var alu37 = ((i32(((val56!=val23)!=true)))*val8);
  var alu38 = ((i32(((val57!=val25)!=true)))*val8);
  var alu39 = ((i32(((val58!=val19)!=true)))*val9);
  var alu40 = ((i32(((val59!=val21)!=true)))*val9);
  var alu41 = ((i32(((val60!=val23)!=true)))*val9);
  var alu42 = ((i32(((val61!=val25)!=true)))*val9);
  var alu43 = ((i32(((val62!=val19)!=true)))*val10);
  var alu44 = ((i32(((val63!=val21)!=true)))*val10);
  var alu45 = ((i32(((val64!=val23)!=true)))*val10);
  var alu46 = ((i32(((val65!=val25)!=true)))*val10);
  var alu47 = ((i32(((val66!=val19)!=true)))*val11);
  var alu48 = ((i32(((val67!=val21)!=true)))*val11);
  var alu49 = ((i32(((val68!=val23)!=true)))*val11);
  var alu50 = ((i32(((val69!=val25)!=true)))*val11);
  var alu51 = ((i32(((val70!=val19)!=true)))*val12);
  var alu52 = ((i32(((val71!=val21)!=true)))*val12);
  var alu53 = ((i32(((val72!=val23)!=true)))*val12);
  var alu54 = ((i32(((val73!=val25)!=true)))*val12);
  var alu55 = ((i32(((val74!=val19)!=true)))*val13);
  var alu56 = ((i32(((val75!=val21)!=true)))*val13);
  var alu57 = ((i32(((val76!=val23)!=true)))*val13);
  var alu58 = ((i32(((val77!=val25)!=true)))*val13);
  var alu59 = ((i32(((val78!=val19)!=true)))*val14);
  var alu60 = ((i32(((val79!=val21)!=true)))*val14);
  var alu61 = ((i32(((val80!=val23)!=true)))*val14);
  var alu62 = ((i32(((val81!=val25)!=true)))*val14);
  var alu63 = ((i32(((val82!=val19)!=true)))*val15);
  var alu64 = ((i32(((val83!=val21)!=true)))*val15);
  var alu65 = ((i32(((val84!=val23)!=true)))*val15);
  var alu66 = ((i32(((val85!=val25)!=true)))*val15);
  var alu67 = ((i32(((val86!=val19)!=true)))*val16);
  var alu68 = ((i32(((val87!=val21)!=true)))*val16);
  var alu69 = ((i32(((val88!=val23)!=true)))*val16);
  var alu70 = ((i32(((val89!=val25)!=true)))*val16);
  var alu71 = ((i32(((val90!=val19)!=true)))*val17);
  var alu72 = ((i32(((val91!=val21)!=true)))*val17);
  var alu73 = ((i32(((val92!=val23)!=true)))*val17);
  var alu74 = ((i32(((val93!=val25)!=true)))*val17);
  var alu75 = ((i32(((val18!=val19)!=true)))*val0);
  var alu76 = select(alu4,alu8,(alu4<alu8));
  var alu77 = select(alu5,alu9,(alu5<alu9));
  var alu78 = select(alu6,alu10,(alu6<alu10));
  var alu79 = select(alu7,alu75,(alu7<alu75));
  var alu80 = select(alu11,alu79,(alu11<alu79));
  var alu81 = select(alu12,alu76,(alu12<alu76));
  var alu82 = select(alu13,alu77,(alu13<alu77));
  var alu83 = select(alu14,alu78,(alu14<alu78));
  var alu84 = select(alu15,alu80,(alu15<alu80));
  var alu85 = select(alu16,alu81,(alu16<alu81));
  var alu86 = select(alu17,alu82,(alu17<alu82));
  var alu87 = select(alu18,alu83,(alu18<alu83));
  var alu88 = select(alu19,alu84,(alu19<alu84));
  var alu89 = select(alu20,alu85,(alu20<alu85));
  var alu90 = select(alu21,alu86,(alu21<alu86));
  var alu91 = select(alu22,alu87,(alu22<alu87));
  var alu92 = select(alu23,alu88,(alu23<alu88));
  var alu93 = select(alu24,alu89,(alu24<alu89));
  var alu94 = select(alu25,alu90,(alu25<alu90));
  var alu95 = select(alu26,alu91,(alu26<alu91));
  var alu96 = select(alu27,alu92,(alu27<alu92));
  var alu97 = select(alu28,alu93,(alu28<alu93));
  var alu98 = select(alu29,alu94,(alu29<alu94));
  var alu99 = select(alu30,alu95,(alu30<alu95));
  var alu100 = select(alu31,alu96,(alu31<alu96));
  var alu101 = select(alu32,alu97,(alu32<alu97));
  var alu102 = select(alu33,alu98,(alu33<alu98));
  var alu103 = select(alu34,alu99,(alu34<alu99));
  var alu104 = select(alu35,alu100,(alu35<alu100));
  var alu105 = select(alu36,alu101,(alu36<alu101));
  var alu106 = select(alu37,alu102,(alu37<alu102));
  var alu107 = select(alu38,alu103,(alu38<alu103));
  var alu108 = select(alu39,alu104,(alu39<alu104));
  var alu109 = select(alu40,alu105,(alu40<alu105));
  var alu110 = select(alu41,alu106,(alu41<alu106));
  var alu111 = select(alu42,alu107,(alu42<alu107));
  var alu112 = select(alu43,alu108,(alu43<alu108));
  var alu113 = select(alu44,alu109,(alu44<alu109));
  var alu114 = select(alu45,alu110,(alu45<alu110));
  var alu115 = select(alu46,alu111,(alu46<alu111));
  var alu116 = select(alu47,alu112,(alu47<alu112));
  var alu117 = select(alu48,alu113,(alu48<alu113));
  var alu118 = select(alu49,alu114,(alu49<alu114));
  var alu119 = select(alu50,alu115,(alu50<alu115));
  var alu120 = select(alu51,alu116,(alu51<alu116));
  var alu121 = select(alu52,alu117,(alu52<alu117));
  var alu122 = select(alu53,alu118,(alu53<alu118));
  var alu123 = select(alu54,alu119,(alu54<alu119));
  var alu124 = select(alu55,alu120,(alu55<alu120));
  var alu125 = select(alu56,alu121,(alu56<alu121));
  var alu126 = select(alu57,alu122,(alu57<alu122));
  var alu127 = select(alu58,alu123,(alu58<alu123));
  var alu128 = select(alu59,alu124,(alu59<alu124));
  var alu129 = select(alu60,alu125,(alu60<alu125));
  var alu130 = select(alu61,alu126,(alu61<alu126));
  var alu131 = select(alu62,alu127,(alu62<alu127));
  var alu132 = select(alu63,alu128,(alu63<alu128));
  var alu133 = select(alu64,alu129,(alu64<alu129));
  var alu134 = select(alu65,alu130,(alu65<alu130));
  var alu135 = select(alu66,alu131,(alu66<alu131));
  var alu136 = select(alu67,alu132,(alu67<alu132));
  var alu137 = select(alu68,alu133,(alu68<alu133));
  var alu138 = select(alu69,alu134,(alu69<alu134));
  var alu139 = select(alu70,alu135,(alu70<alu135));
  data0[alu0] = (f32((18-select(alu71,alu136,(alu71<alu136)))));
  data0[alu1] = (f32((18-select(alu72,alu137,(alu72<alu137)))));
  data0[alu2] = (f32((18-select(alu73,alu138,(alu73<alu138)))));
  data0[alu3] = (f32((18-select(alu74,alu139,(alu74<alu139)))));
}`;


export async function setupNet(device, safetensorBuffer, callbackUI) {    
    const metadata = getTensorMetadata(safetensorBuffer);
    const infinityBuf = createInfinityUniformBuf(device);

    const layouts=[device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]})]

    const buf_0 = createEmptyBuf(device, 1409286144);;
    const input0 = createEmptyBuf(device, 67108864);;
    const buf_1 = createWeightBuf(device, 2268, getTensorBuffer(safetensorBuffer, metadata['convs.0.weight']));
    const buf_2 = createWeightBuf(device, 84, getTensorBuffer(safetensorBuffer, metadata['convs.0.bias']));
    const buf_3 = createEmptyBuf(device, 72);;
    const buf_4 = createEmptyBuf(device, 1409286144);;
    const buf_5 = createWeightBuf(device, 47628, getTensorBuffer(safetensorBuffer, metadata['convs.1.weight']));
    const buf_6 = createWeightBuf(device, 84, getTensorBuffer(safetensorBuffer, metadata['convs.1.bias']));
    const buf_7 = createWeightBuf(device, 47628, getTensorBuffer(safetensorBuffer, metadata['convs.2.weight']));
    const buf_8 = createWeightBuf(device, 84, getTensorBuffer(safetensorBuffer, metadata['convs.2.bias']));
    const buf_9 = createWeightBuf(device, 47628, getTensorBuffer(safetensorBuffer, metadata['convs.3.weight']));
    const buf_10 = createWeightBuf(device, 84, getTensorBuffer(safetensorBuffer, metadata['convs.3.bias']));
    const buf_11 = createWeightBuf(device, 47628, getTensorBuffer(safetensorBuffer, metadata['convs.4.weight']));
    const buf_12 = createWeightBuf(device, 84, getTensorBuffer(safetensorBuffer, metadata['convs.4.bias']));
    const buf_13 = createWeightBuf(device, 47628, getTensorBuffer(safetensorBuffer, metadata['convs.5.weight']));
    const buf_14 = createWeightBuf(device, 84, getTensorBuffer(safetensorBuffer, metadata['convs.5.bias']));
    const buf_15 = createWeightBuf(device, 47628, getTensorBuffer(safetensorBuffer, metadata['convs.6.weight']));
    const buf_16 = createWeightBuf(device, 84, getTensorBuffer(safetensorBuffer, metadata['convs.6.bias']));
    const buf_17 = createWeightBuf(device, 47628, getTensorBuffer(safetensorBuffer, metadata['convs.7.weight']));
    const buf_18 = createWeightBuf(device, 84, getTensorBuffer(safetensorBuffer, metadata['convs.7.bias']));
    const buf_19 = createWeightBuf(device, 47628, getTensorBuffer(safetensorBuffer, metadata['convs.8.weight']));
    const buf_20 = createWeightBuf(device, 84, getTensorBuffer(safetensorBuffer, metadata['convs.8.bias']));
    const buf_21 = createEmptyBuf(device, 1207959552);;
    const buf_22 = createWeightBuf(device, 1512, getTensorBuffer(safetensorBuffer, metadata['convs.9.weight']));
    const buf_23 = createWeightBuf(device, 72, getTensorBuffer(safetensorBuffer, metadata['convs.9.bias']));
    const buf_24 = createEmptyBuf(device, 67108864);;
    const output0 = createEmptyBuf(device, 67108864);;

    const gpuWriteBuffer0 = device.createBuffer({size:input0.size, usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.MAP_WRITE });

    const gpuReadBuffer0 = device.createBuffer({size:output0.size, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });

    const kernels = [r_7_256_32_4_8_16_3_4_3_3_3, r_6_3_18, r_7_256_32_4_8_16_21_3_4_3_3_3, r_7_256_32_4_8_16_21_3_4_3_3_3n1, r_7_256_32_4_8_16_21_3_4_3_3_3n2, r_7_256_32_4_8_16_21_3_4_3_3_3n3, r_7_256_32_4_8_16_21_3_4_3_3_3n2, r_7_256_32_4_8_16_21_3_4_3_3_3n1, r_7_256_32_4_8_16_21_3_4_3_3_3, r_7_256_32_4_8_16_21_3_4_3_3_3n4, r_2_32768_8_3_16_4_3_21, r_32768_16_1_32_18, r_32768_4_1_32_4_18];
    const pipelines = await Promise.all(kernels.map(async (name, i) => {
      return await device.createComputePipelineAsync({
          layout: device.createPipelineLayout({
              bindGroupLayouts: [layouts[i]],
          }),
          compute: {
              module: device.createShaderModule({
                  code: name,
              }),
              entryPoint: "main",
          },
      });
  }))

    return async (_input0) => {
        const commandEncoder = device.createCommandEncoder();
        await gpuWriteBuffer0.mapAsync(GPUMapMode.WRITE);
        new Float32Array(gpuWriteBuffer0.getMappedRange()).set(_input0);
        gpuWriteBuffer0.unmap();
        commandEncoder.copyBufferToBuffer(gpuWriteBuffer0, 0, input0, 0, gpuWriteBuffer0.size);
        addComputePass(device, commandEncoder, pipelines[0], layouts[0], infinityBuf, [buf_0, input0, buf_1, buf_2], [128, 256, 7]);
        addComputePass(device, commandEncoder, pipelines[1], layouts[1], infinityBuf, [buf_3], [6, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[2], layouts[2], infinityBuf, [buf_4, buf_0, buf_5, buf_6], [128, 256, 7]);
        addComputePass(device, commandEncoder, pipelines[3], layouts[3], infinityBuf, [buf_0, buf_4, buf_7, buf_8], [128, 256, 7]);
        addComputePass(device, commandEncoder, pipelines[4], layouts[4], infinityBuf, [buf_4, buf_0, buf_9, buf_10], [128, 256, 7]);
        addComputePass(device, commandEncoder, pipelines[5], layouts[5], infinityBuf, [buf_0, buf_4, buf_11, buf_12], [128, 256, 7]);
        addComputePass(device, commandEncoder, pipelines[6], layouts[6], infinityBuf, [buf_4, buf_0, buf_13, buf_14], [128, 256, 7]);
        addComputePass(device, commandEncoder, pipelines[7], layouts[7], infinityBuf, [buf_0, buf_4, buf_15, buf_16], [128, 256, 7]);
        addComputePass(device, commandEncoder, pipelines[8], layouts[8], infinityBuf, [buf_4, buf_0, buf_17, buf_18], [128, 256, 7]);
        addComputePass(device, commandEncoder, pipelines[9], layouts[9], infinityBuf, [buf_0, buf_4, buf_19, buf_20], [128, 256, 7]);
        addComputePass(device, commandEncoder, pipelines[10], layouts[10], infinityBuf, [buf_21, buf_0, buf_22, buf_23], [8, 32768, 2]);
        addComputePass(device, commandEncoder, pipelines[11], layouts[11], infinityBuf, [buf_24, buf_21], [1, 16, 32768]);
        addComputePass(device, commandEncoder, pipelines[12], layouts[12], infinityBuf, [output0, buf_21, buf_24, buf_3], [1, 4, 32768]);
        commandEncoder.copyBufferToBuffer(output0, 0, gpuReadBuffer0, 0, output0.size);
        const gpuCommands = commandEncoder.finish();
        device.queue.submit([gpuCommands]);

        await gpuReadBuffer0.mapAsync(GPUMapMode.READ);
        const resultBuffer0 = new Float32Array(gpuReadBuffer0.size/4);
        resultBuffer0.set(new Float32Array(gpuReadBuffer0.getMappedRange()));
        gpuReadBuffer0.unmap();
        return [resultBuffer0];
    }
}
const load = async (device, weight_path) => {
  if (weight_path instanceof Uint8Array) {
    // If weight_path is already a Uint8Array, use it directly
    return setupNet(device, weight_path);
  } else {
    // Otherwise, fetch and process the data
    return fetch(weight_path)
      .then(response => response.arrayBuffer())
      .then(buffer => setupNet(device, new Uint8Array(buffer)));
  }
};
const getWeight = (safetensor, key) => {
  let uint8Data = getTensorBuffer(safetensor, getTensorMetadata(safetensor)[key], key);
  return new Float32Array(uint8Data.buffer, uint8Data.byteOffset, uint8Data.byteLength / Float32Array.BYTES_PER_ELEMENT);
}
