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
};

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

const r_5_256_32_4_8_16_3_4_3_3 = `enable f16;
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
  var gidx2 = i32(gindex.z); /* 5 */
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
  for (var ridx0 = 0; ridx0 < 3; ridx0++) {
    var alu11 = (gidx1+ridx0);
    var alu12 = ((gidx2*27)+(ridx0*9));
    var val0 = data2[alu12];
    var val1 = data2[(alu12+1)];
    var val2 = data2[(alu12+2)];
    var val3 = data2[(alu12+3)];
    var val4 = data2[(alu12+4)];
    var val5 = data2[(alu12+5)];
    var val6 = data2[(alu12+6)];
    var val7 = data2[(alu12+7)];
    var val8 = data2[(alu12+8)];
    var alu13 = (alu2+(ridx0<<16)+alu5+alu3+alu7);
    var alu14 = ((alu11<257)&((alu11<1)!=true));
    var val9 = select(0.0f, data1[(alu13+-65536)], alu14);
    var val10 = select(0.0f, data1[(alu13+-65535)], alu14);
    var val11 = select(0.0f, data1[(alu13+-65534)], alu14);
    var val12 = select(0.0f, data1[(alu13+-65533)], alu14);
    var alu15 = ((alu9<255)&alu14);
    var val13 = select(0.0f, data1[(alu13+-65280)], alu15);
    var val14 = select(0.0f, data1[(alu13+-65279)], alu15);
    var val15 = select(0.0f, data1[(alu13+-65278)], alu15);
    var val16 = select(0.0f, data1[(alu13+-65277)], alu15);
    var val17 = select(0.0f, data1[(alu13+-65532)], (alu10&alu14));
    var val18 = select(0.0f, data1[(alu13+-65276)], (alu10&alu15));
    var alu16 = (((alu9<1)!=true)&alu14);
    var val19 = select(0.0f, data1[(alu13+-65792)], alu16);
    var val20 = select(0.0f, data1[(alu13+-65791)], alu16);
    var val21 = select(0.0f, data1[(alu13+-65790)], alu16);
    var val22 = select(0.0f, data1[(alu13+-65789)], alu16);
    var val23 = select(0.0f, data1[(alu13+-65788)], (alu10&alu16));
    var val24 = select(0.0f, data1[(alu13+-65537)], (alu8&alu14));
    var val25 = select(0.0f, data1[(alu13+-65281)], (alu8&alu15));
    var val26 = select(0.0f, data1[(alu13+-65793)], (alu8&alu16));
    acc0 = (acc0+(val3*val24)+(val0*val26)+(val6*val25)+(val1*val19)+(val4*val9)+(val7*val13)+(val2*val20)+(val5*val10)+(val8*val14));
    acc1 = (acc1+(val3*val9)+(val0*val19)+(val6*val13)+(val1*val20)+(val4*val10)+(val7*val14)+(val2*val21)+(val5*val11)+(val8*val15));
    acc2 = (acc2+(val3*val10)+(val0*val20)+(val6*val14)+(val1*val21)+(val4*val11)+(val7*val15)+(val2*val22)+(val5*val12)+(val8*val16));
    acc3 = (acc3+(val3*val11)+(val0*val21)+(val6*val15)+(val1*val22)+(val4*val12)+(val7*val16)+(val2*val23)+(val5*val17)+(val8*val18));
  }
  var val27 = data3[gidx2];
  var alu22 = (val27+acc0);
  var alu23 = (val27+acc1);
  var alu24 = (val27+acc2);
  var alu25 = (val27+acc3);
  var alu26 = (alu2+(gidx2<<24)+alu3+alu4+alu5+alu6);
  data0[alu26] = select(0.0f,alu22,(0.0f<alu22));
  data0[(alu26+1)] = select(0.0f,alu23,(0.0f<alu23));
  data0[(alu26+2)] = select(0.0f,alu24,(0.0f<alu24));
  data0[(alu26+3)] = select(0.0f,alu25,(0.0f<alu25));
}`;

const r_3_3 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
fn is_nan(v:f32) -> bool { return min(v, 1.0) == 1.0 && max(v, -1.0) == -1.0; }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<i32>;
@compute @workgroup_size(1) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  data0[0] = 3;
  data0[1] = 2;
  data0[2] = 1;
}`;

const r_5_256_32_4_8_16_5_3_4_3_3 = `enable f16;
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
  var gidx2 = i32(gindex.z); /* 5 */
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
  for (var ridx0 = 0; ridx0 < 5; ridx0++) {
    for (var ridx1 = 0; ridx1 < 3; ridx1++) {
      var alu13 = (gidx1+(ridx1<<1));
      var alu14 = ((alu13<258)&((alu13<2)!=true));
      var alu15 = (((alu8<2)!=true)&alu14);
      var alu16 = ((alu8<254)&alu14);
      var alu17 = ((gidx2*135)+(ridx0*27)+(ridx1*9));
      var val0 = data2[alu17];
      var val1 = data2[(alu17+1)];
      var val2 = data2[(alu17+2)];
      var val3 = data2[(alu17+3)];
      var val4 = data2[(alu17+4)];
      var val5 = data2[(alu17+5)];
      var val6 = data2[(alu17+6)];
      var val7 = data2[(alu17+7)];
      var val8 = data2[(alu17+8)];
      var alu18 = (alu2+(ridx1<<17)+(ridx0<<24)+alu5+alu3+alu7);
      var val9 = select(0.0f, data1[(alu18+-131586)], (alu12&alu15));
      var val10 = select(0.0f, data1[(alu18+-131585)], (alu10&alu15));
      var val11 = select(0.0f, data1[(alu18+-131584)], alu15);
      var val12 = select(0.0f, data1[(alu18+-131583)], alu15);
      var val13 = select(0.0f, data1[(alu18+-131582)], alu15);
      var val14 = select(0.0f, data1[(alu18+-131581)], alu15);
      var val15 = select(0.0f, data1[(alu18+-131580)], (alu11&alu15));
      var val16 = select(0.0f, data1[(alu18+-131579)], (alu9&alu15));
      var val17 = select(0.0f, data1[(alu18+-131074)], (alu12&alu14));
      var val18 = select(0.0f, data1[(alu18+-131073)], (alu10&alu14));
      var val19 = select(0.0f, data1[(alu18+-131072)], alu14);
      var val20 = select(0.0f, data1[(alu18+-131071)], alu14);
      var val21 = select(0.0f, data1[(alu18+-131070)], alu14);
      var val22 = select(0.0f, data1[(alu18+-131069)], alu14);
      var val23 = select(0.0f, data1[(alu18+-131068)], (alu11&alu14));
      var val24 = select(0.0f, data1[(alu18+-131067)], (alu9&alu14));
      var val25 = select(0.0f, data1[(alu18+-130562)], (alu12&alu16));
      var val26 = select(0.0f, data1[(alu18+-130561)], (alu10&alu16));
      var val27 = select(0.0f, data1[(alu18+-130560)], alu16);
      var val28 = select(0.0f, data1[(alu18+-130559)], alu16);
      var val29 = select(0.0f, data1[(alu18+-130558)], alu16);
      var val30 = select(0.0f, data1[(alu18+-130557)], alu16);
      var val31 = select(0.0f, data1[(alu18+-130556)], (alu11&alu16));
      var val32 = select(0.0f, data1[(alu18+-130555)], (alu9&alu16));
      acc0 = (acc0+(val3*val17)+(val0*val9)+(val6*val25)+(val1*val11)+(val4*val19)+(val7*val27)+(val2*val13)+(val5*val21)+(val8*val29));
      acc1 = (acc1+(val3*val18)+(val0*val10)+(val6*val26)+(val1*val12)+(val4*val20)+(val7*val28)+(val2*val14)+(val5*val22)+(val8*val30));
      acc2 = (acc2+(val3*val19)+(val0*val11)+(val6*val27)+(val1*val13)+(val4*val21)+(val7*val29)+(val2*val15)+(val5*val23)+(val8*val31));
      acc3 = (acc3+(val3*val20)+(val0*val12)+(val6*val28)+(val1*val14)+(val4*val22)+(val7*val30)+(val2*val16)+(val5*val24)+(val8*val32));
    }
  }
  var val33 = data3[gidx2];
  var alu25 = (val33+acc0);
  var alu26 = (val33+acc1);
  var alu27 = (val33+acc2);
  var alu28 = (val33+acc3);
  var alu29 = (alu2+(gidx2<<24)+alu3+alu4+alu5+alu6);
  data0[alu29] = select(0.0f,alu25,(0.0f<alu25));
  data0[(alu29+1)] = select(0.0f,alu26,(0.0f<alu26));
  data0[(alu29+2)] = select(0.0f,alu27,(0.0f<alu27));
  data0[(alu29+3)] = select(0.0f,alu28,(0.0f<alu28));
}`;

const r_5_256_32_4_8_16_5_3_4_3_3n1 = `enable f16;
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
  var gidx2 = i32(gindex.z); /* 5 */
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
  for (var ridx0 = 0; ridx0 < 5; ridx0++) {
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
      var alu21 = ((gidx2*135)+(ridx0*27)+(ridx1*9));
      var val0 = data2[alu21];
      var val1 = data2[(alu21+1)];
      var val2 = data2[(alu21+2)];
      var val3 = data2[(alu21+3)];
      var val4 = data2[(alu21+4)];
      var val5 = data2[(alu21+5)];
      var val6 = data2[(alu21+6)];
      var val7 = data2[(alu21+7)];
      var val8 = data2[(alu21+8)];
      var alu22 = (alu2+(ridx1<<18)+(ridx0<<24)+alu5+alu3+alu6+alu4);
      var val9 = select(0.0f, data1[(alu22+-263172)], alu20);
      var val10 = select(0.0f, data1[(alu22+-263171)], alu20);
      var val11 = select(0.0f, data1[(alu22+-263170)], alu20);
      var val12 = select(0.0f, data1[(alu22+-263169)], alu20);
      var val13 = select(0.0f, data1[(alu22+-263168)], alu13);
      var val14 = select(0.0f, data1[(alu22+-263167)], alu13);
      var val15 = select(0.0f, data1[(alu22+-263166)], alu13);
      var val16 = select(0.0f, data1[(alu22+-263165)], alu13);
      var val17 = select(0.0f, data1[(alu22+-263164)], alu17);
      var val18 = select(0.0f, data1[(alu22+-263163)], alu17);
      var val19 = select(0.0f, data1[(alu22+-263162)], alu17);
      var val20 = select(0.0f, data1[(alu22+-263161)], alu17);
      var val21 = select(0.0f, data1[(alu22+-262148)], alu18);
      var val22 = select(0.0f, data1[(alu22+-262147)], alu18);
      var val23 = select(0.0f, data1[(alu22+-262146)], alu18);
      var val24 = select(0.0f, data1[(alu22+-262145)], alu18);
      var val25 = select(0.0f, data1[(alu22+-262144)], alu12);
      var val26 = select(0.0f, data1[(alu22+-262143)], alu12);
      var val27 = select(0.0f, data1[(alu22+-262142)], alu12);
      var val28 = select(0.0f, data1[(alu22+-262141)], alu12);
      var val29 = select(0.0f, data1[(alu22+-262140)], alu15);
      var val30 = select(0.0f, data1[(alu22+-262139)], alu15);
      var val31 = select(0.0f, data1[(alu22+-262138)], alu15);
      var val32 = select(0.0f, data1[(alu22+-262137)], alu15);
      var val33 = select(0.0f, data1[(alu22+-261124)], alu19);
      var val34 = select(0.0f, data1[(alu22+-261123)], alu19);
      var val35 = select(0.0f, data1[(alu22+-261122)], alu19);
      var val36 = select(0.0f, data1[(alu22+-261121)], alu19);
      var val37 = select(0.0f, data1[(alu22+-261120)], alu14);
      var val38 = select(0.0f, data1[(alu22+-261119)], alu14);
      var val39 = select(0.0f, data1[(alu22+-261118)], alu14);
      var val40 = select(0.0f, data1[(alu22+-261117)], alu14);
      var val41 = select(0.0f, data1[(alu22+-261116)], alu16);
      var val42 = select(0.0f, data1[(alu22+-261115)], alu16);
      var val43 = select(0.0f, data1[(alu22+-261114)], alu16);
      var val44 = select(0.0f, data1[(alu22+-261113)], alu16);
      acc0 = (acc0+(val3*val21)+(val0*val9)+(val6*val33)+(val1*val13)+(val4*val25)+(val7*val37)+(val2*val17)+(val5*val29)+(val8*val41));
      acc1 = (acc1+(val3*val22)+(val0*val10)+(val6*val34)+(val1*val14)+(val4*val26)+(val7*val38)+(val2*val18)+(val5*val30)+(val8*val42));
      acc2 = (acc2+(val3*val23)+(val0*val11)+(val6*val35)+(val1*val15)+(val4*val27)+(val7*val39)+(val2*val19)+(val5*val31)+(val8*val43));
      acc3 = (acc3+(val3*val24)+(val0*val12)+(val6*val36)+(val1*val16)+(val4*val28)+(val7*val40)+(val2*val20)+(val5*val32)+(val8*val44));
    }
  }
  var val45 = data3[gidx2];
  var alu29 = (val45+acc0);
  var alu30 = (val45+acc1);
  var alu31 = (val45+acc2);
  var alu32 = (val45+acc3);
  var alu33 = (alu2+(gidx2<<24)+alu3+alu4+alu5+alu6);
  data0[alu33] = select(0.0f,alu29,(0.0f<alu29));
  data0[(alu33+1)] = select(0.0f,alu30,(0.0f<alu30));
  data0[(alu33+2)] = select(0.0f,alu31,(0.0f<alu31));
  data0[(alu33+3)] = select(0.0f,alu32,(0.0f<alu32));
}`;

const r_5_256_32_4_8_16_5_3_4_3_3n2 = `enable f16;
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
  var gidx2 = i32(gindex.z); /* 5 */
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
  for (var ridx0 = 0; ridx0 < 5; ridx0++) {
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
      var alu19 = ((gidx2*135)+(ridx0*27)+(ridx1*9));
      var val0 = data2[alu19];
      var val1 = data2[(alu19+1)];
      var val2 = data2[(alu19+2)];
      var val3 = data2[(alu19+3)];
      var val4 = data2[(alu19+4)];
      var val5 = data2[(alu19+5)];
      var val6 = data2[(alu19+6)];
      var val7 = data2[(alu19+7)];
      var val8 = data2[(alu19+8)];
      var alu20 = (alu1+(ridx1<<19)+(ridx0<<24)+alu4+alu2+alu5+alu3);
      var val9 = select(0.0f, data1[(alu20+-526344)], alu18);
      var val10 = select(0.0f, data1[(alu20+-526343)], alu18);
      var val11 = select(0.0f, data1[(alu20+-526342)], alu18);
      var val12 = select(0.0f, data1[(alu20+-526341)], alu18);
      var val13 = select(0.0f, data1[(alu20+-526336)], alu11);
      var val14 = select(0.0f, data1[(alu20+-526335)], alu11);
      var val15 = select(0.0f, data1[(alu20+-526334)], alu11);
      var val16 = select(0.0f, data1[(alu20+-526333)], alu11);
      var val17 = select(0.0f, data1[(alu20+-526328)], alu15);
      var val18 = select(0.0f, data1[(alu20+-526327)], alu15);
      var val19 = select(0.0f, data1[(alu20+-526326)], alu15);
      var val20 = select(0.0f, data1[(alu20+-526325)], alu15);
      var val21 = select(0.0f, data1[(alu20+-524296)], alu17);
      var val22 = select(0.0f, data1[(alu20+-524295)], alu17);
      var val23 = select(0.0f, data1[(alu20+-524294)], alu17);
      var val24 = select(0.0f, data1[(alu20+-524293)], alu17);
      var val25 = select(0.0f, data1[(alu20+-524288)], alu10);
      var val26 = select(0.0f, data1[(alu20+-524287)], alu10);
      var val27 = select(0.0f, data1[(alu20+-524286)], alu10);
      var val28 = select(0.0f, data1[(alu20+-524285)], alu10);
      var val29 = select(0.0f, data1[(alu20+-524280)], alu14);
      var val30 = select(0.0f, data1[(alu20+-524279)], alu14);
      var val31 = select(0.0f, data1[(alu20+-524278)], alu14);
      var val32 = select(0.0f, data1[(alu20+-524277)], alu14);
      var val33 = select(0.0f, data1[(alu20+-522248)], alu16);
      var val34 = select(0.0f, data1[(alu20+-522247)], alu16);
      var val35 = select(0.0f, data1[(alu20+-522246)], alu16);
      var val36 = select(0.0f, data1[(alu20+-522245)], alu16);
      var val37 = select(0.0f, data1[(alu20+-522240)], alu12);
      var val38 = select(0.0f, data1[(alu20+-522239)], alu12);
      var val39 = select(0.0f, data1[(alu20+-522238)], alu12);
      var val40 = select(0.0f, data1[(alu20+-522237)], alu12);
      var val41 = select(0.0f, data1[(alu20+-522232)], alu13);
      var val42 = select(0.0f, data1[(alu20+-522231)], alu13);
      var val43 = select(0.0f, data1[(alu20+-522230)], alu13);
      var val44 = select(0.0f, data1[(alu20+-522229)], alu13);
      acc0 = (acc0+(val3*val21)+(val0*val9)+(val6*val33)+(val1*val13)+(val4*val25)+(val7*val37)+(val2*val17)+(val5*val29)+(val8*val41));
      acc1 = (acc1+(val3*val22)+(val0*val10)+(val6*val34)+(val1*val14)+(val4*val26)+(val7*val38)+(val2*val18)+(val5*val30)+(val8*val42));
      acc2 = (acc2+(val3*val23)+(val0*val11)+(val6*val35)+(val1*val15)+(val4*val27)+(val7*val39)+(val2*val19)+(val5*val31)+(val8*val43));
      acc3 = (acc3+(val3*val24)+(val0*val12)+(val6*val36)+(val1*val16)+(val4*val28)+(val7*val40)+(val2*val20)+(val5*val32)+(val8*val44));
    }
  }
  var val45 = data3[gidx2];
  var alu27 = (val45+acc0);
  var alu28 = (val45+acc1);
  var alu29 = (val45+acc2);
  var alu30 = (val45+acc3);
  var alu31 = (alu1+(gidx2<<24)+alu2+alu3+alu4+alu5);
  data0[alu31] = select(0.0f,alu27,(0.0f<alu27));
  data0[(alu31+1)] = select(0.0f,alu28,(0.0f<alu28));
  data0[(alu31+2)] = select(0.0f,alu29,(0.0f<alu29));
  data0[(alu31+3)] = select(0.0f,alu30,(0.0f<alu30));
}`;

const r_5_256_32_4_8_16_5_3_4_3_3n3 = `enable f16;
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
  var gidx2 = i32(gindex.z); /* 5 */
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
  for (var ridx0 = 0; ridx0 < 5; ridx0++) {
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
      var alu19 = ((gidx2*135)+(ridx0*27)+(ridx1*9));
      var val0 = data2[alu19];
      var val1 = data2[(alu19+1)];
      var val2 = data2[(alu19+2)];
      var val3 = data2[(alu19+3)];
      var val4 = data2[(alu19+4)];
      var val5 = data2[(alu19+5)];
      var val6 = data2[(alu19+6)];
      var val7 = data2[(alu19+7)];
      var val8 = data2[(alu19+8)];
      var alu20 = (alu1+(ridx1<<20)+(ridx0<<24)+alu4+alu2+alu5+alu3);
      var val9 = select(0.0f, data1[(alu20+-1052688)], alu18);
      var val10 = select(0.0f, data1[(alu20+-1052687)], alu18);
      var val11 = select(0.0f, data1[(alu20+-1052686)], alu18);
      var val12 = select(0.0f, data1[(alu20+-1052685)], alu18);
      var val13 = select(0.0f, data1[(alu20+-1052672)], alu11);
      var val14 = select(0.0f, data1[(alu20+-1052671)], alu11);
      var val15 = select(0.0f, data1[(alu20+-1052670)], alu11);
      var val16 = select(0.0f, data1[(alu20+-1052669)], alu11);
      var val17 = select(0.0f, data1[(alu20+-1052656)], alu15);
      var val18 = select(0.0f, data1[(alu20+-1052655)], alu15);
      var val19 = select(0.0f, data1[(alu20+-1052654)], alu15);
      var val20 = select(0.0f, data1[(alu20+-1052653)], alu15);
      var val21 = select(0.0f, data1[(alu20+-1048592)], alu17);
      var val22 = select(0.0f, data1[(alu20+-1048591)], alu17);
      var val23 = select(0.0f, data1[(alu20+-1048590)], alu17);
      var val24 = select(0.0f, data1[(alu20+-1048589)], alu17);
      var val25 = select(0.0f, data1[(alu20+-1048576)], alu10);
      var val26 = select(0.0f, data1[(alu20+-1048575)], alu10);
      var val27 = select(0.0f, data1[(alu20+-1048574)], alu10);
      var val28 = select(0.0f, data1[(alu20+-1048573)], alu10);
      var val29 = select(0.0f, data1[(alu20+-1048560)], alu14);
      var val30 = select(0.0f, data1[(alu20+-1048559)], alu14);
      var val31 = select(0.0f, data1[(alu20+-1048558)], alu14);
      var val32 = select(0.0f, data1[(alu20+-1048557)], alu14);
      var val33 = select(0.0f, data1[(alu20+-1044496)], alu16);
      var val34 = select(0.0f, data1[(alu20+-1044495)], alu16);
      var val35 = select(0.0f, data1[(alu20+-1044494)], alu16);
      var val36 = select(0.0f, data1[(alu20+-1044493)], alu16);
      var val37 = select(0.0f, data1[(alu20+-1044480)], alu12);
      var val38 = select(0.0f, data1[(alu20+-1044479)], alu12);
      var val39 = select(0.0f, data1[(alu20+-1044478)], alu12);
      var val40 = select(0.0f, data1[(alu20+-1044477)], alu12);
      var val41 = select(0.0f, data1[(alu20+-1044464)], alu13);
      var val42 = select(0.0f, data1[(alu20+-1044463)], alu13);
      var val43 = select(0.0f, data1[(alu20+-1044462)], alu13);
      var val44 = select(0.0f, data1[(alu20+-1044461)], alu13);
      acc0 = (acc0+(val3*val21)+(val0*val9)+(val6*val33)+(val1*val13)+(val4*val25)+(val7*val37)+(val2*val17)+(val5*val29)+(val8*val41));
      acc1 = (acc1+(val3*val22)+(val0*val10)+(val6*val34)+(val1*val14)+(val4*val26)+(val7*val38)+(val2*val18)+(val5*val30)+(val8*val42));
      acc2 = (acc2+(val3*val23)+(val0*val11)+(val6*val35)+(val1*val15)+(val4*val27)+(val7*val39)+(val2*val19)+(val5*val31)+(val8*val43));
      acc3 = (acc3+(val3*val24)+(val0*val12)+(val6*val36)+(val1*val16)+(val4*val28)+(val7*val40)+(val2*val20)+(val5*val32)+(val8*val44));
    }
  }
  var val45 = data3[gidx2];
  var alu27 = (val45+acc0);
  var alu28 = (val45+acc1);
  var alu29 = (val45+acc2);
  var alu30 = (val45+acc3);
  var alu31 = (alu1+(gidx2<<24)+alu2+alu3+alu4+alu5);
  data0[alu31] = select(0.0f,alu27,(0.0f<alu27));
  data0[(alu31+1)] = select(0.0f,alu28,(0.0f<alu28));
  data0[(alu31+2)] = select(0.0f,alu29,(0.0f<alu29));
  data0[(alu31+3)] = select(0.0f,alu30,(0.0f<alu30));
}`;

const r_5_256_32_4_8_16_5_3_4_3_3n4 = `enable f16;
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
  var gidx2 = i32(gindex.z); /* 5 */
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
  for (var ridx0 = 0; ridx0 < 5; ridx0++) {
    for (var ridx1 = 0; ridx1 < 3; ridx1++) {
      var alu11 = (gidx1+ridx1);
      var alu12 = ((alu11<257)&((alu11<1)!=true));
      var alu13 = (((alu8<1)!=true)&alu12);
      var alu14 = ((alu8<255)&alu12);
      var alu15 = ((gidx2*135)+(ridx0*27)+(ridx1*9));
      var val0 = data2[alu15];
      var val1 = data2[(alu15+1)];
      var val2 = data2[(alu15+2)];
      var val3 = data2[(alu15+3)];
      var val4 = data2[(alu15+4)];
      var val5 = data2[(alu15+5)];
      var val6 = data2[(alu15+6)];
      var val7 = data2[(alu15+7)];
      var val8 = data2[(alu15+8)];
      var alu16 = (alu2+(ridx1<<16)+(ridx0<<24)+alu5+alu3+alu7);
      var val9 = select(0.0f, data1[(alu16+-65793)], (alu9&alu13));
      var val10 = select(0.0f, data1[(alu16+-65792)], alu13);
      var val11 = select(0.0f, data1[(alu16+-65791)], alu13);
      var val12 = select(0.0f, data1[(alu16+-65790)], alu13);
      var val13 = select(0.0f, data1[(alu16+-65789)], alu13);
      var val14 = select(0.0f, data1[(alu16+-65788)], (alu10&alu13));
      var val15 = select(0.0f, data1[(alu16+-65537)], (alu9&alu12));
      var val16 = select(0.0f, data1[(alu16+-65536)], alu12);
      var val17 = select(0.0f, data1[(alu16+-65535)], alu12);
      var val18 = select(0.0f, data1[(alu16+-65534)], alu12);
      var val19 = select(0.0f, data1[(alu16+-65533)], alu12);
      var val20 = select(0.0f, data1[(alu16+-65532)], (alu10&alu12));
      var val21 = select(0.0f, data1[(alu16+-65281)], (alu9&alu14));
      var val22 = select(0.0f, data1[(alu16+-65280)], alu14);
      var val23 = select(0.0f, data1[(alu16+-65279)], alu14);
      var val24 = select(0.0f, data1[(alu16+-65278)], alu14);
      var val25 = select(0.0f, data1[(alu16+-65277)], alu14);
      var val26 = select(0.0f, data1[(alu16+-65276)], (alu10&alu14));
      acc0 = (acc0+(val3*val15)+(val0*val9)+(val6*val21)+(val1*val10)+(val4*val16)+(val7*val22)+(val2*val11)+(val5*val17)+(val8*val23));
      acc1 = (acc1+(val3*val16)+(val0*val10)+(val6*val22)+(val1*val11)+(val4*val17)+(val7*val23)+(val2*val12)+(val5*val18)+(val8*val24));
      acc2 = (acc2+(val3*val17)+(val0*val11)+(val6*val23)+(val1*val12)+(val4*val18)+(val7*val24)+(val2*val13)+(val5*val19)+(val8*val25));
      acc3 = (acc3+(val3*val18)+(val0*val12)+(val6*val24)+(val1*val13)+(val4*val19)+(val7*val25)+(val2*val14)+(val5*val20)+(val8*val26));
    }
  }
  var val27 = data3[gidx2];
  var alu23 = (val27+acc0);
  var alu24 = (val27+acc1);
  var alu25 = (val27+acc2);
  var alu26 = (val27+acc3);
  var alu27 = (alu2+(gidx2<<24)+alu3+alu4+alu5+alu6);
  data0[alu27] = select(0.0f,alu23,(0.0f<alu23));
  data0[(alu27+1)] = select(0.0f,alu24,(0.0f<alu24));
  data0[(alu27+2)] = select(0.0f,alu25,(0.0f<alu25));
  data0[(alu27+3)] = select(0.0f,alu26,(0.0f<alu26));
}`;

const r_32768_4_1_32_4_3_5 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
fn is_nan(v:f32) -> bool { return min(v, 1.0) == 1.0 && max(v, -1.0) == -1.0; }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx1 = i32(gindex.y); /* 4 */
  var gidx2 = i32(gindex.z); /* 32768 */
  var lidx0 = i32(lindex.x); /* 32 */
  var val0 = data2[0];
  var val1 = data2[1];
  var val2 = data2[2];
  var val3 = data2[3];
  var val4 = data2[5];
  var val5 = data2[6];
  var val6 = data2[8];
  var val7 = data2[10];
  var val8 = data2[12];
  var val9 = data2[13];
  var val10 = data2[14];
  var val11 = data3[0];
  var val12 = data3[1];
  var val13 = data2[4];
  var val14 = data2[7];
  var val15 = data2[9];
  var val16 = data2[11];
  var val17 = data3[2];
  var alu0 = ((gidx1<<7)+(gidx2<<9)+(lidx0<<2));
  var val18 = data1[alu0];
  var alu1 = (alu0+1);
  var val19 = data1[alu1];
  var alu2 = (alu0+2);
  var val20 = data1[alu2];
  var alu3 = (alu0+3);
  var val21 = data1[alu3];
  var alu4 = (alu0+16777216);
  var val22 = data1[alu4];
  var alu5 = (alu0+16777217);
  var val23 = data1[alu5];
  var alu6 = (alu0+16777218);
  var val24 = data1[alu6];
  var alu7 = (alu0+16777219);
  var val25 = data1[alu7];
  var alu8 = (alu0+33554432);
  var val26 = data1[alu8];
  var alu9 = (alu0+33554433);
  var val27 = data1[alu9];
  var alu10 = (alu0+33554434);
  var val28 = data1[alu10];
  var alu11 = (alu0+33554435);
  var val29 = data1[alu11];
  var val30 = data1[(alu0+50331648)];
  var val31 = data1[(alu0+50331649)];
  var val32 = data1[(alu0+50331650)];
  var val33 = data1[(alu0+50331651)];
  var val34 = data1[(alu0+67108864)];
  var val35 = data1[(alu0+67108865)];
  var val36 = data1[(alu0+67108866)];
  var val37 = data1[(alu0+67108867)];
  data0[alu1] = (val11+(val19*val0)+(val23*val1)+(val27*val2)+(val31*val3)+(val35*val13));
  data0[alu5] = (val12+(val19*val4)+(val23*val5)+(val27*val14)+(val31*val6)+(val35*val15));
  data0[alu9] = (val17+(val19*val7)+(val23*val16)+(val27*val8)+(val31*val9)+(val35*val10));
  data0[alu2] = (val11+(val20*val0)+(val24*val1)+(val28*val2)+(val32*val3)+(val36*val13));
  data0[alu6] = (val12+(val20*val4)+(val24*val5)+(val28*val14)+(val32*val6)+(val36*val15));
  data0[alu10] = (val17+(val20*val7)+(val24*val16)+(val28*val8)+(val32*val9)+(val36*val10));
  data0[alu3] = (val11+(val21*val0)+(val25*val1)+(val29*val2)+(val33*val3)+(val37*val13));
  data0[alu7] = (val12+(val21*val4)+(val25*val5)+(val29*val14)+(val33*val6)+(val37*val15));
  data0[alu11] = (val17+(val21*val7)+(val25*val16)+(val29*val8)+(val33*val9)+(val37*val10));
  data0[alu0] = (val11+(val22*val1)+(val18*val0)+(val26*val2)+(val30*val3)+(val34*val13));
  data0[alu4] = (val12+(val22*val5)+(val18*val4)+(val26*val14)+(val30*val6)+(val34*val15));
  data0[alu8] = (val17+(val22*val16)+(val18*val7)+(val26*val8)+(val30*val9)+(val34*val10));
}`;

const r_32768_16_1_32_3 = `enable f16;
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
  var alu1 = select(val0,val1,(val0<val1));
  data0[alu0] = select(val2,alu1,(val2<alu1));
}`;

const r_32768_4_1_32_4_3 = `enable f16;
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
  var alu0 = ((gidx1<<7)+(gidx2<<9)+(lidx0<<2));
  var val3 = data1[alu0];
  var val4 = data2[alu0];
  var alu1 = (alu0+1);
  var val5 = data1[alu1];
  var val6 = data2[alu1];
  var alu2 = (alu0+2);
  var val7 = data1[alu2];
  var val8 = data2[alu2];
  var alu3 = (alu0+3);
  var val9 = data1[alu3];
  var val10 = data2[alu3];
  var val11 = data1[(alu0+16777216)];
  var val12 = data1[(alu0+16777217)];
  var val13 = data1[(alu0+16777218)];
  var val14 = data1[(alu0+16777219)];
  var val15 = data1[(alu0+33554432)];
  var val16 = data1[(alu0+33554433)];
  var val17 = data1[(alu0+33554434)];
  var val18 = data1[(alu0+33554435)];
  var alu4 = ((i32(((val5!=val6)!=true)))*val0);
  var alu5 = ((i32(((val7!=val8)!=true)))*val0);
  var alu6 = ((i32(((val9!=val10)!=true)))*val0);
  var alu7 = ((i32(((val11!=val4)!=true)))*val1);
  var alu8 = ((i32(((val12!=val6)!=true)))*val1);
  var alu9 = ((i32(((val13!=val8)!=true)))*val1);
  var alu10 = ((i32(((val14!=val10)!=true)))*val1);
  var alu11 = ((i32(((val15!=val4)!=true)))*val2);
  var alu12 = ((i32(((val16!=val6)!=true)))*val2);
  var alu13 = ((i32(((val17!=val8)!=true)))*val2);
  var alu14 = ((i32(((val18!=val10)!=true)))*val2);
  var alu15 = ((i32(((val3!=val4)!=true)))*val0);
  var alu16 = select(alu4,alu8,(alu4<alu8));
  var alu17 = select(alu5,alu9,(alu5<alu9));
  var alu18 = select(alu6,alu10,(alu6<alu10));
  var alu19 = select(alu7,alu15,(alu7<alu15));
  data0[alu0] = (f32((3-select(alu11,alu19,(alu11<alu19)))));
  data0[alu1] = (f32((3-select(alu12,alu16,(alu12<alu16)))));
  data0[alu2] = (f32((3-select(alu13,alu17,(alu13<alu17)))));
  data0[alu3] = (f32((3-select(alu14,alu18,(alu14<alu18)))));
}`;

export async function setupNet(device, safetensorBuffer, callbackUI) {
    const metadata = getTensorMetadata(safetensorBuffer);
    const infinityBuf = createInfinityUniformBuf(device);

    const layouts=[device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]})]

    const buf_0 = createEmptyBuf(device, 335544320);;
    const input0 = createEmptyBuf(device, 67108864);;
    const buf_1 = createWeightBuf(device, 540, getTensorBuffer(safetensorBuffer, metadata['convs.0.weight']));
    const buf_2 = createWeightBuf(device, 20, getTensorBuffer(safetensorBuffer, metadata['convs.0.bias']));
    const buf_3 = createEmptyBuf(device, 12);;
    const buf_4 = createEmptyBuf(device, 335544320);;
    const buf_5 = createWeightBuf(device, 2700, getTensorBuffer(safetensorBuffer, metadata['convs.1.weight']));
    const buf_6 = createWeightBuf(device, 20, getTensorBuffer(safetensorBuffer, metadata['convs.1.bias']));
    const buf_7 = createWeightBuf(device, 2700, getTensorBuffer(safetensorBuffer, metadata['convs.2.weight']));
    const buf_8 = createWeightBuf(device, 20, getTensorBuffer(safetensorBuffer, metadata['convs.2.bias']));
    const buf_9 = createWeightBuf(device, 2700, getTensorBuffer(safetensorBuffer, metadata['convs.3.weight']));
    const buf_10 = createWeightBuf(device, 20, getTensorBuffer(safetensorBuffer, metadata['convs.3.bias']));
    const buf_11 = createWeightBuf(device, 2700, getTensorBuffer(safetensorBuffer, metadata['convs.4.weight']));
    const buf_12 = createWeightBuf(device, 20, getTensorBuffer(safetensorBuffer, metadata['convs.4.bias']));
    const buf_13 = createWeightBuf(device, 2700, getTensorBuffer(safetensorBuffer, metadata['convs.5.weight']));
    const buf_14 = createWeightBuf(device, 20, getTensorBuffer(safetensorBuffer, metadata['convs.5.bias']));
    const buf_15 = createWeightBuf(device, 2700, getTensorBuffer(safetensorBuffer, metadata['convs.6.weight']));
    const buf_16 = createWeightBuf(device, 20, getTensorBuffer(safetensorBuffer, metadata['convs.6.bias']));
    const buf_17 = createWeightBuf(device, 2700, getTensorBuffer(safetensorBuffer, metadata['convs.7.weight']));
    const buf_18 = createWeightBuf(device, 20, getTensorBuffer(safetensorBuffer, metadata['convs.7.bias']));
    const buf_19 = createWeightBuf(device, 2700, getTensorBuffer(safetensorBuffer, metadata['convs.8.weight']));
    const buf_20 = createWeightBuf(device, 20, getTensorBuffer(safetensorBuffer, metadata['convs.8.bias']));
    const buf_21 = createEmptyBuf(device, 201326592);;
    const buf_22 = createWeightBuf(device, 60, getTensorBuffer(safetensorBuffer, metadata['convs.9.weight']));
    const buf_23 = createWeightBuf(device, 12, getTensorBuffer(safetensorBuffer, metadata['convs.9.bias']));
    const buf_24 = createEmptyBuf(device, 67108864);;
    const output0 = createEmptyBuf(device, 67108864);;

    const gpuWriteBuffer0 = device.createBuffer({size:input0.size, usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.MAP_WRITE });

    const gpuReadBuffer0 = device.createBuffer({size:output0.size, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });

    const kernels = [r_5_256_32_4_8_16_3_4_3_3, r_3_3, r_5_256_32_4_8_16_5_3_4_3_3, r_5_256_32_4_8_16_5_3_4_3_3n1, r_5_256_32_4_8_16_5_3_4_3_3n2, r_5_256_32_4_8_16_5_3_4_3_3n3, r_5_256_32_4_8_16_5_3_4_3_3n2, r_5_256_32_4_8_16_5_3_4_3_3n1, r_5_256_32_4_8_16_5_3_4_3_3, r_5_256_32_4_8_16_5_3_4_3_3n4, r_32768_4_1_32_4_3_5, r_32768_16_1_32_3, r_32768_4_1_32_4_3];
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
        addComputePass(device, commandEncoder, pipelines[0], layouts[0], infinityBuf, [buf_0, input0, buf_1, buf_2], [128, 256, 5]);
        addComputePass(device, commandEncoder, pipelines[1], layouts[1], infinityBuf, [buf_3], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[2], layouts[2], infinityBuf, [buf_4, buf_0, buf_5, buf_6], [128, 256, 5]);
        addComputePass(device, commandEncoder, pipelines[3], layouts[3], infinityBuf, [buf_0, buf_4, buf_7, buf_8], [128, 256, 5]);
        addComputePass(device, commandEncoder, pipelines[4], layouts[4], infinityBuf, [buf_4, buf_0, buf_9, buf_10], [128, 256, 5]);
        addComputePass(device, commandEncoder, pipelines[5], layouts[5], infinityBuf, [buf_0, buf_4, buf_11, buf_12], [128, 256, 5]);
        addComputePass(device, commandEncoder, pipelines[6], layouts[6], infinityBuf, [buf_4, buf_0, buf_13, buf_14], [128, 256, 5]);
        addComputePass(device, commandEncoder, pipelines[7], layouts[7], infinityBuf, [buf_0, buf_4, buf_15, buf_16], [128, 256, 5]);
        addComputePass(device, commandEncoder, pipelines[8], layouts[8], infinityBuf, [buf_4, buf_0, buf_17, buf_18], [128, 256, 5]);
        addComputePass(device, commandEncoder, pipelines[9], layouts[9], infinityBuf, [buf_0, buf_4, buf_19, buf_20], [128, 256, 5]);
        addComputePass(device, commandEncoder, pipelines[10], layouts[10], infinityBuf, [buf_21, buf_0, buf_22, buf_23], [1, 4, 32768]);
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
