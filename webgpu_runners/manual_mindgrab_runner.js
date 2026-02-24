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

const createUniformBuf = (device, size) => {
  return device.createBuffer({size, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST})
}

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
  const buf = device.createBuffer({ size, usage: GPUBufferUsage.STORAGE, mappedAtCreation: true });
  new Uint8Array(buf.getMappedRange()).set(data); buf.unmap();
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

const r_5_256_32_4_8_16_4_3_3_3_3 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
fn is_nan(v:f32) -> bool { return min(v, 1.0) == 1.0 && max(v, -1.0) == -1.0; }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 128 */
  var gidx1 = i32(gindex.y); /* 256 */
  var gidx2 = i32(gindex.z); /* 15 */
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
  for (var ridx0 = 0; ridx0 < 15; ridx0++) {
    for (var ridx1 = 0; ridx1 < 3; ridx1++) {
      var alu11 = (gidx1+ridx1);
      var alu12 = ((alu11<257)&((alu11<1)!=true));
      var alu13 = (((alu8<1)!=true)&alu12);
      var alu14 = ((alu8<255)&alu12);
      var alu15 = ((gidx2*405)+(ridx0*27)+(ridx1*9));
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
  var alu26 = (alu2+(gidx2<<24)+alu3+alu4+alu5+alu6);
  data0[alu26] = acc0;
  data0[(alu26+1)] = acc1;
  data0[(alu26+2)] = acc2;
  data0[(alu26+3)] = acc3;
}`;


const r_5_256_32_4_8_16_4_3_15_3_3_3 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
fn is_nan(v:f32) -> bool { return min(v, 1.0) == 1.0 && max(v, -1.0) == -1.0; }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 128 */
  var gidx1 = i32(gindex.y); /* 256 */
  var gidx2 = i32(gindex.z); /* 15 */
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
  for (var ridx0 = 0; ridx0 < 15; ridx0++) {
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
      var alu19 = ((gidx2*405)+(ridx0*27)+(ridx1*9));
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
  var alu31 = (alu1+(gidx2<<24)+alu2+alu3+alu4+alu5);
  data0[alu31] = acc0;
  data0[(alu31+1)] = acc1;
  data0[(alu31+2)] = acc2;
  data0[(alu31+3)] = acc3;
}`;

const r_10240_32_3_64_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_983040:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_251658240:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,3>;
  var gidx0 = i32(gindex.x); /* 10240 */
  var lidx0 = i32(lindex.x); /* 32 */
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  for (var ridx1003 = 0; ridx1003 < 64; ridx1003++) {
    var precast0 = ridx1003;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var alu3 = ((gidx0*24576)+(lidx0*768)+bitcast<i32>(precast1));
    var val0 = data1_251658240[alu3];
    var val1 = data1_251658240[(alu3+1)];
    var val2 = data1_251658240[(alu3+2)];
    var val3 = data1_251658240[(alu3+3)];
    var val4 = data1_251658240[(alu3+256)];
    var val5 = data1_251658240[(alu3+257)];
    var val6 = data1_251658240[(alu3+258)];
    var val7 = data1_251658240[(alu3+259)];
    var val8 = data1_251658240[(alu3+512)];
    var val9 = data1_251658240[(alu3+513)];
    var val10 = data1_251658240[(alu3+514)];
    var val11 = data1_251658240[(alu3+515)];
    acc0[0] = (acc0[0]+val0+val1+val2+val3);
    acc0[1] = (acc0[1]+val4+val5+val6+val7);
    acc0[2] = (acc0[2]+val8+val9+val10+val11);
  }
  var alu8 = ((gidx0*96)+(lidx0*3));
  data0_983040[alu8] = acc0[0];
  data0_983040[(alu8+1)] = acc0[1];
  data0_983040[(alu8+2)] = acc0[2];
}`;

const r_40_32_3_64_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_3840:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_983040:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,3>;
  var gidx0 = i32(gindex.x); /* 40 */
  var lidx0 = i32(lindex.x); /* 32 */
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  for (var ridx1003 = 0; ridx1003 < 64; ridx1003++) {
    var precast0 = ridx1003;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var alu3 = ((gidx0*24576)+(lidx0*768)+bitcast<i32>(precast1));
    var val0 = data1_983040[alu3];
    var val1 = data1_983040[(alu3+1)];
    var val2 = data1_983040[(alu3+2)];
    var val3 = data1_983040[(alu3+3)];
    var val4 = data1_983040[(alu3+256)];
    var val5 = data1_983040[(alu3+257)];
    var val6 = data1_983040[(alu3+258)];
    var val7 = data1_983040[(alu3+259)];
    var val8 = data1_983040[(alu3+512)];
    var val9 = data1_983040[(alu3+513)];
    var val10 = data1_983040[(alu3+514)];
    var val11 = data1_983040[(alu3+515)];
    acc0[0] = (acc0[0]+val0+val1+val2+val3);
    acc0[1] = (acc0[1]+val4+val5+val6+val7);
    acc0[2] = (acc0[2]+val8+val9+val10+val11);
  }
  var alu8 = ((gidx0*96)+(lidx0*3));
  data0_3840[alu8] = acc0[0];
  data0_3840[(alu8+1)] = acc0[1];
  data0_3840[(alu8+2)] = acc0[2];
}`;

const r_15_16_16 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
var<workgroup> temp0: array<f32,16>;
@group(0) @binding(1)var<storage,read_write>data0_15:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_3840:array<f32>;
@compute @workgroup_size(16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,1>;
  var acc1: array<f32,1>;
  var gidx0 = i32(gindex.x); /* 15 */
  var lidx0 = i32(lindex.x); /* 16 */
  acc1[0] = 0.0f;
  acc0[0] = 0.0f;
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<8u);
  var precast3 = (bitcast<u32>(precast1)<<4u);
  for (var ridx3002 = 0; ridx3002 < 16; ridx3002++) {
    var val0 = data1_3840[(bitcast<i32>(precast2)+bitcast<i32>(precast3)+ridx3002)];
    acc0[0] = (acc0[0]+val0);
  }
  temp0[lidx0] = acc0[0];
  workgroupBarrier();
  if (((bool(lidx0))!=true)) {
    for (var ridx1001 = 0; ridx1001 < 16; ridx1001++) {
      var val1 = temp0[ridx1001];
      acc1[0] = (acc1[0]+val1);
    }
    data0_15[gidx0] = (acc1[0]*5.960464477539063e-08f);
  }
}`;

const r_5_1024_3_16_4_64_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_983040:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_251658240:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_15:array<f32>;
@compute @workgroup_size(3,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,4>;
  var gidx0 = i32(gindex.x); /* 1024 */
  var gidx1 = i32(gindex.y); /* 5 */
  var lidx0 = i32(lindex.x); /* 3 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = lidx1;
  var cast0 = bitcast<u32>(precast0);
  var precast1 = lidx0;
  var cast1 = bitcast<u32>(precast1);
  var precast2 = gidx0;
  var cast2 = bitcast<u32>(precast2);
  var val0 = data2_15[(lidx0+(gidx1*3))];
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  acc0[3] = 0.0f;
  var precast3 = (cast2<<14u);
  var precast4 = (cast1<<24u);
  var precast5 = (cast0<<10u);
  for (var ridx1005 = 0; ridx1005 < 64; ridx1005++) {
    var precast6 = ridx1005;
    var precast7 = (bitcast<u32>(precast6)<<2u);
    var alu4 = (bitcast<i32>(precast3)+(gidx1*50331648)+bitcast<i32>(precast4)+bitcast<i32>(precast5)+bitcast<i32>(precast7));
    var val1 = data1_251658240[alu4];
    var val2 = data1_251658240[(alu4+1)];
    var val3 = data1_251658240[(alu4+2)];
    var val4 = data1_251658240[(alu4+3)];
    var val5 = data1_251658240[(alu4+256)];
    var val6 = data1_251658240[(alu4+257)];
    var val7 = data1_251658240[(alu4+258)];
    var val8 = data1_251658240[(alu4+259)];
    var val9 = data1_251658240[(alu4+512)];
    var val10 = data1_251658240[(alu4+513)];
    var val11 = data1_251658240[(alu4+514)];
    var val12 = data1_251658240[(alu4+515)];
    var val13 = data1_251658240[(alu4+768)];
    var val14 = data1_251658240[(alu4+769)];
    var val15 = data1_251658240[(alu4+770)];
    var val16 = data1_251658240[(alu4+771)];
    var alu5 = (val1-val0);
    var alu6 = (val2-val0);
    var alu7 = (val3-val0);
    var alu8 = (val4-val0);
    acc0[0] = (acc0[0]+(alu5*alu5)+(alu6*alu6)+(alu7*alu7)+(alu8*alu8));
    var alu10 = (val5-val0);
    var alu11 = (val6-val0);
    var alu12 = (val7-val0);
    var alu13 = (val8-val0);
    acc0[1] = (acc0[1]+(alu10*alu10)+(alu11*alu11)+(alu12*alu12)+(alu13*alu13));
    var alu15 = (val9-val0);
    var alu16 = (val10-val0);
    var alu17 = (val11-val0);
    var alu18 = (val12-val0);
    acc0[2] = (acc0[2]+(alu15*alu15)+(alu16*alu16)+(alu17*alu17)+(alu18*alu18));
    var alu20 = (val13-val0);
    var alu21 = (val14-val0);
    var alu22 = (val15-val0);
    var alu23 = (val16-val0);
    acc0[3] = (acc0[3]+(alu20*alu20)+(alu21*alu21)+(alu22*alu22)+(alu23*alu23));
  }
  var precast8 = (cast2<<6u);
  var precast9 = (cast1<<16u);
  var precast10 = (cast0<<2u);
  var alu26 = (bitcast<i32>(precast8)+(gidx1*196608)+bitcast<i32>(precast9)+bitcast<i32>(precast10));
  data0_983040[alu26] = acc0[0];
  data0_983040[(alu26+1)] = acc0[1];
  data0_983040[(alu26+2)] = acc0[2];
  data0_983040[(alu26+3)] = acc0[3];
}`;

const r_15_16_16n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
var<workgroup> temp0: array<f32,16>;
@group(0) @binding(1)var<storage,read_write>data0_15:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_3840:array<f32>;
@compute @workgroup_size(16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,1>;
  var acc1: array<f32,1>;
  var gidx0 = i32(gindex.x); /* 15 */
  var lidx0 = i32(lindex.x); /* 16 */
  acc1[0] = 0.0f;
  acc0[0] = 0.0f;
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<8u);
  var precast3 = (bitcast<u32>(precast1)<<4u);
  for (var ridx3002 = 0; ridx3002 < 16; ridx3002++) {
    var val0 = data1_3840[(bitcast<i32>(precast2)+bitcast<i32>(precast3)+ridx3002)];
    acc0[0] = (acc0[0]+val0);
  }
  temp0[lidx0] = acc0[0];
  workgroupBarrier();
  if (((bool(lidx0))!=true)) {
    for (var ridx1001 = 0; ridx1001 < 16; ridx1001++) {
      var val1 = temp0[ridx1001];
      acc1[0] = (acc1[0]+val1);
    }
    data0_15[gidx0] = (1/sqrt(((acc1[0]*5.960464477539063e-08f)+1e-05f)));
  }
}`;

const E_5_262144_3_16_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_251658240:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_251658240:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_15:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_15:array<f32>;
@compute @workgroup_size(3,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 32768 */
  var gidx1 = i32(gindex.y); /* 40 */
  var lidx0 = i32(lindex.x); /* 3 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = lidx1;
  var alu0 = (lidx0+(gidx1*3));
  var val0 = data2_15[alu0];
  var val1 = data3_15[alu0];
  var precast3 = (bitcast<u32>(precast0)<<6u);
  var precast4 = (bitcast<u32>(precast1)<<24u);
  var precast5 = (bitcast<u32>(precast2)<<2u);
  var alu1 = (bitcast<i32>(precast3)+(gidx1*50331648)+bitcast<i32>(precast4)+bitcast<i32>(precast5));
  var val2 = data1_251658240[alu1];
  var alu2 = (alu1+1);
  var val3 = data1_251658240[alu2];
  var alu3 = (alu1+2);
  var val4 = data1_251658240[alu3];
  var alu4 = (alu1+3);
  var val5 = data1_251658240[alu4];
  var alu5 = ((val2-val0)*val1);
  data0_251658240[alu1] = ((1/(1.0f+exp2(((alu5+(0.044715f*alu5*alu5*alu5))*-2.302208198144325f))))*alu5);
  var alu7 = ((val3-val0)*val1);
  data0_251658240[alu2] = ((1/(1.0f+exp2(((alu7+(0.044715f*alu7*alu7*alu7))*-2.302208198144325f))))*alu7);
  var alu9 = ((val4-val0)*val1);
  data0_251658240[alu3] = ((1/(1.0f+exp2(((alu9+(0.044715f*alu9*alu9*alu9))*-2.302208198144325f))))*alu9);
  var alu11 = ((val5-val0)*val1);
  data0_251658240[alu4] = ((1/(1.0f+exp2(((alu11+(0.044715f*alu11*alu11*alu11))*-2.302208198144325f))))*alu11);
}`;

const r_5_256_32_4_8_16_4_3_15_3_3_3n1 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
fn is_nan(v:f32) -> bool { return min(v, 1.0) == 1.0 && max(v, -1.0) == -1.0; }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
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
  for (var ridx0 = 0; ridx0 < 15; ridx0++) {
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
      var alu19 = ((gidx2*405)+(ridx0*27)+(ridx1*9));
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
  var alu31 = (alu1+(gidx2<<24)+alu2+alu3+alu4+alu5);
  data0[alu31] = acc0;
  data0[(alu31+1)] = acc1;
  data0[(alu31+2)] = acc2;
  data0[(alu31+3)] = acc3;
}`;

const r_5_256_32_4_8_16_4_3_15_3_3_3n2 = `enable f16;
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
  for (var ridx0 = 0; ridx0 < 15; ridx0++) {
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
      var alu21 = ((gidx2*405)+(ridx0*27)+(ridx1*9));
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
  var alu33 = (alu2+(gidx2<<24)+alu3+alu4+alu5+alu6);
  data0[alu33] = acc0;
  data0[(alu33+1)] = acc1;
  data0[(alu33+2)] = acc2;
  data0[(alu33+3)] = acc3;
}`;

const r_5_256_32_4_8_16_4_3_15_3_3_3n3 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
fn is_nan(v:f32) -> bool { return min(v, 1.0) == 1.0 && max(v, -1.0) == -1.0; }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
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
  for (var ridx0 = 0; ridx0 < 15; ridx0++) {
    for (var ridx1 = 0; ridx1 < 3; ridx1++) {
      var alu13 = (gidx1+(ridx1<<1));
      var alu14 = ((alu13<258)&((alu13<2)!=true));
      var alu15 = (((alu8<2)!=true)&alu14);
      var alu16 = ((alu8<254)&alu14);
      var alu17 = ((gidx2*405)+(ridx0*27)+(ridx1*9));
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
  var alu29 = (alu2+(gidx2<<24)+alu3+alu4+alu5+alu6);
  data0[alu29] = acc0;
  data0[(alu29+1)] = acc1;
  data0[(alu29+2)] = acc2;
  data0[(alu29+3)] = acc3;
}`;


const r_5_256_32_4_8_16_4_3_15_3_3_3n4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_251658240:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_251658240:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_6075:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,12>;
  var gidx0 = i32(gindex.x); /* 128 */
  var gidx1 = i32(gindex.y); /* 256 */
  var gidx2 = i32(gindex.z); /* 5 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (gidx0&3);
  var precast0 = alu0;
  var cast0 = bitcast<u32>(precast0);
  var alu1 = (gidx0>>2u);
  var precast1 = (cast0<<6u);
  var cast1 = bitcast<i32>(precast1);
  var precast2 = lidx1;
  var precast3 = (bitcast<u32>(precast2)<<2u);
  var cast2 = bitcast<i32>(precast3);
  var precast4 = alu1;
  var precast5 = (bitcast<u32>(precast4)<<11u);
  var cast3 = bitcast<i32>(precast5);
  var precast6 = lidx0;
  var precast7 = (bitcast<u32>(precast6)<<8u);
  var cast4 = bitcast<i32>(precast7);
  var precast8 = gidx1;
  var precast9 = (bitcast<u32>(precast8)<<16u);
  var cast5 = bitcast<i32>(precast9);
  var precast10 = (cast0<<4u);
  var alu2 = (lidx1+bitcast<i32>(precast10));
  var alu3 = (alu2<60);
  var alu4 = (3<alu2);
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  acc0[3] = 0.0f;
  acc0[4] = 0.0f;
  acc0[5] = 0.0f;
  acc0[6] = 0.0f;
  acc0[7] = 0.0f;
  acc0[8] = 0.0f;
  acc0[9] = 0.0f;
  acc0[10] = 0.0f;
  acc0[11] = 0.0f;
  for (var ridx1008 = 0; ridx1008 < 15; ridx1008++) {
    var precast11 = ridx1008;
    var precast12 = (bitcast<u32>(precast11)<<24u);
    for (var ridx1009 = 0; ridx1009 < 3; ridx1009++) {
      var precast13 = ridx1009;
      var cast6 = bitcast<u32>(precast13);
      var precast14 = (cast6<<4u);
      var alu17 = (gidx1+bitcast<i32>(precast14));
      var alu18 = ((15<alu17)&(alu17<272));
      var alu19 = (alu18&(gidx0<120));
      var alu20 = (alu18&(7<gidx0));
      var precast15 = (cast6<<16u);
      var alu21 = (alu18&alu3);
      var alu22 = (alu18&alu4);
      var alu23 = (alu19&alu3);
      var alu24 = (alu19&alu4);
      var alu25 = (alu20&alu3);
      var alu26 = (alu20&alu4);
      var alu27 = (cast5+bitcast<i32>(precast15)+bitcast<i32>(precast12)+cast4+cast3+cast2+cast1);
      var val0 = select(0.0f, data1_251658240[(alu27+-1052688)], alu26);
      var val1 = select(0.0f, data1_251658240[(alu27+-1052687)], alu26);
      var val2 = select(0.0f, data1_251658240[(alu27+-1052686)], alu26);
      var val3 = select(0.0f, data1_251658240[(alu27+-1052685)], alu26);
      var val4 = select(0.0f, data1_251658240[(alu27+-1052672)], alu20);
      var val5 = select(0.0f, data1_251658240[(alu27+-1052671)], alu20);
      var val6 = select(0.0f, data1_251658240[(alu27+-1052670)], alu20);
      var val7 = select(0.0f, data1_251658240[(alu27+-1052669)], alu20);
      var val8 = select(0.0f, data1_251658240[(alu27+-1052656)], alu25);
      var val9 = select(0.0f, data1_251658240[(alu27+-1052655)], alu25);
      var val10 = select(0.0f, data1_251658240[(alu27+-1052654)], alu25);
      var val11 = select(0.0f, data1_251658240[(alu27+-1052653)], alu25);
      var val12 = select(0.0f, data1_251658240[(alu27+-1048592)], alu22);
      var val13 = select(0.0f, data1_251658240[(alu27+-1048591)], alu22);
      var val14 = select(0.0f, data1_251658240[(alu27+-1048590)], alu22);
      var val15 = select(0.0f, data1_251658240[(alu27+-1048589)], alu22);
      var val16 = select(0.0f, data1_251658240[(alu27+-1048576)], alu18);
      var val17 = select(0.0f, data1_251658240[(alu27+-1048575)], alu18);
      var val18 = select(0.0f, data1_251658240[(alu27+-1048574)], alu18);
      var val19 = select(0.0f, data1_251658240[(alu27+-1048573)], alu18);
      var val20 = select(0.0f, data1_251658240[(alu27+-1048560)], alu21);
      var val21 = select(0.0f, data1_251658240[(alu27+-1048559)], alu21);
      var val22 = select(0.0f, data1_251658240[(alu27+-1048558)], alu21);
      var val23 = select(0.0f, data1_251658240[(alu27+-1048557)], alu21);
      var val24 = select(0.0f, data1_251658240[(alu27+-1044496)], alu24);
      var val25 = select(0.0f, data1_251658240[(alu27+-1044495)], alu24);
      var val26 = select(0.0f, data1_251658240[(alu27+-1044494)], alu24);
      var val27 = select(0.0f, data1_251658240[(alu27+-1044493)], alu24);
      var val28 = select(0.0f, data1_251658240[(alu27+-1044480)], alu19);
      var val29 = select(0.0f, data1_251658240[(alu27+-1044479)], alu19);
      var val30 = select(0.0f, data1_251658240[(alu27+-1044478)], alu19);
      var val31 = select(0.0f, data1_251658240[(alu27+-1044477)], alu19);
      var val32 = select(0.0f, data1_251658240[(alu27+-1044464)], alu23);
      var val33 = select(0.0f, data1_251658240[(alu27+-1044463)], alu23);
      var val34 = select(0.0f, data1_251658240[(alu27+-1044462)], alu23);
      var val35 = select(0.0f, data1_251658240[(alu27+-1044461)], alu23);
      var alu28 = ((gidx2*1215)+(ridx1008*27)+(ridx1009*9));
      var val36 = data2_6075[alu28];
      var val37 = data2_6075[(alu28+1)];
      var val38 = data2_6075[(alu28+2)];
      var val39 = data2_6075[(alu28+3)];
      var val40 = data2_6075[(alu28+4)];
      var val41 = data2_6075[(alu28+5)];
      var val42 = data2_6075[(alu28+6)];
      var val43 = data2_6075[(alu28+7)];
      var val44 = data2_6075[(alu28+8)];
      var val45 = data2_6075[(alu28+405)];
      var val46 = data2_6075[(alu28+406)];
      var val47 = data2_6075[(alu28+407)];
      var val48 = data2_6075[(alu28+408)];
      var val49 = data2_6075[(alu28+409)];
      var val50 = data2_6075[(alu28+410)];
      var val51 = data2_6075[(alu28+411)];
      var val52 = data2_6075[(alu28+412)];
      var val53 = data2_6075[(alu28+413)];
      var val54 = data2_6075[(alu28+810)];
      var val55 = data2_6075[(alu28+811)];
      var val56 = data2_6075[(alu28+812)];
      var val57 = data2_6075[(alu28+813)];
      var val58 = data2_6075[(alu28+814)];
      var val59 = data2_6075[(alu28+815)];
      var val60 = data2_6075[(alu28+816)];
      var val61 = data2_6075[(alu28+817)];
      var val62 = data2_6075[(alu28+818)];
      acc0[0] = (acc0[0]+(val0*val36)+(val12*val39)+(val24*val42)+(val4*val37)+(val16*val40)+(val28*val43)+(val8*val38)+(val20*val41)+(val32*val44));
      acc0[1] = (acc0[1]+(val0*val45)+(val12*val48)+(val24*val51)+(val4*val46)+(val16*val49)+(val28*val52)+(val8*val47)+(val20*val50)+(val32*val53));
      acc0[2] = (acc0[2]+(val0*val54)+(val12*val57)+(val24*val60)+(val4*val55)+(val16*val58)+(val28*val61)+(val8*val56)+(val20*val59)+(val32*val62));
      acc0[3] = (acc0[3]+(val1*val36)+(val13*val39)+(val25*val42)+(val5*val37)+(val17*val40)+(val29*val43)+(val9*val38)+(val21*val41)+(val33*val44));
      acc0[4] = (acc0[4]+(val1*val45)+(val13*val48)+(val25*val51)+(val5*val46)+(val17*val49)+(val29*val52)+(val9*val47)+(val21*val50)+(val33*val53));
      acc0[5] = (acc0[5]+(val1*val54)+(val13*val57)+(val25*val60)+(val5*val55)+(val17*val58)+(val29*val61)+(val9*val56)+(val21*val59)+(val33*val62));
      acc0[6] = (acc0[6]+(val2*val36)+(val14*val39)+(val26*val42)+(val6*val37)+(val18*val40)+(val30*val43)+(val10*val38)+(val22*val41)+(val34*val44));
      acc0[7] = (acc0[7]+(val2*val45)+(val14*val48)+(val26*val51)+(val6*val46)+(val18*val49)+(val30*val52)+(val10*val47)+(val22*val50)+(val34*val53));
      acc0[8] = (acc0[8]+(val2*val54)+(val14*val57)+(val26*val60)+(val6*val55)+(val18*val58)+(val30*val61)+(val10*val56)+(val22*val59)+(val34*val62));
      acc0[9] = (acc0[9]+(val3*val36)+(val15*val39)+(val27*val42)+(val7*val37)+(val19*val40)+(val31*val43)+(val11*val38)+(val23*val41)+(val35*val44));
      acc0[10] = (acc0[10]+(val3*val45)+(val15*val48)+(val27*val51)+(val7*val46)+(val19*val49)+(val31*val52)+(val11*val47)+(val23*val50)+(val35*val53));
      acc0[11] = (acc0[11]+(val3*val54)+(val15*val57)+(val27*val60)+(val7*val55)+(val19*val58)+(val31*val61)+(val11*val56)+(val23*val59)+(val35*val62));
    }
  }
  var alu43 = (cast5+(gidx2*50331648)+cast3+cast1+cast4+cast2);
  data0_251658240[alu43] = acc0[0];
  data0_251658240[(alu43+1)] = acc0[3];
  data0_251658240[(alu43+2)] = acc0[6];
  data0_251658240[(alu43+3)] = acc0[9];
  data0_251658240[(alu43+16777216)] = acc0[1];
  data0_251658240[(alu43+16777217)] = acc0[4];
  data0_251658240[(alu43+16777218)] = acc0[7];
  data0_251658240[(alu43+16777219)] = acc0[10];
  data0_251658240[(alu43+33554432)] = acc0[2];
  data0_251658240[(alu43+33554433)] = acc0[5];
  data0_251658240[(alu43+33554434)] = acc0[8];
  data0_251658240[(alu43+33554435)] = acc0[11];
}`;

const r_262144_2_16_4_15 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_33554432:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_251658240:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_30:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_2:array<f32>;
@compute @workgroup_size(2,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 32768 */
  var gidx1 = i32(gindex.y); /* 8 */
  var lidx0 = i32(lindex.x); /* 2 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = gidx1;
  var precast2 = lidx1;
  var cast0 = bitcast<u32>(precast0);
  var val0 = data3_2[lidx0];
  var alu0 = (lidx0*15);
  var val1 = data2_30[alu0];
  var val2 = data2_30[(alu0+1)];
  var val3 = data2_30[(alu0+2)];
  var val4 = data2_30[(alu0+3)];
  var val5 = data2_30[(alu0+4)];
  var val6 = data2_30[(alu0+5)];
  var val7 = data2_30[(alu0+6)];
  var val8 = data2_30[(alu0+7)];
  var val9 = data2_30[(alu0+8)];
  var val10 = data2_30[(alu0+9)];
  var val11 = data2_30[(alu0+10)];
  var val12 = data2_30[(alu0+11)];
  var val13 = data2_30[(alu0+12)];
  var val14 = data2_30[(alu0+13)];
  var val15 = data2_30[(alu0+14)];
  var precast3 = (cast0<<9u);
  var precast4 = (bitcast<u32>(precast1)<<6u);
  var alu1 = (bitcast<i32>(precast3)+bitcast<i32>(precast4));
  var precast5 = (bitcast<u32>(precast2)<<2u);
  var cast1 = bitcast<i32>(precast5);
  var alu2 = (alu1+cast1);
  var val16 = data1_251658240[alu2];
  var val17 = data1_251658240[(alu2+1)];
  var val18 = data1_251658240[(alu2+2)];
  var val19 = data1_251658240[(alu2+3)];
  var val20 = data1_251658240[(alu2+16777216)];
  var val21 = data1_251658240[(alu2+16777217)];
  var val22 = data1_251658240[(alu2+16777218)];
  var val23 = data1_251658240[(alu2+16777219)];
  var val24 = data1_251658240[(alu2+33554432)];
  var val25 = data1_251658240[(alu2+33554433)];
  var val26 = data1_251658240[(alu2+33554434)];
  var val27 = data1_251658240[(alu2+33554435)];
  var val28 = data1_251658240[(alu2+50331648)];
  var val29 = data1_251658240[(alu2+50331649)];
  var val30 = data1_251658240[(alu2+50331650)];
  var val31 = data1_251658240[(alu2+50331651)];
  var val32 = data1_251658240[(alu2+67108864)];
  var val33 = data1_251658240[(alu2+67108865)];
  var val34 = data1_251658240[(alu2+67108866)];
  var val35 = data1_251658240[(alu2+67108867)];
  var val36 = data1_251658240[(alu2+83886080)];
  var val37 = data1_251658240[(alu2+83886081)];
  var val38 = data1_251658240[(alu2+83886082)];
  var val39 = data1_251658240[(alu2+83886083)];
  var val40 = data1_251658240[(alu2+100663296)];
  var val41 = data1_251658240[(alu2+100663297)];
  var val42 = data1_251658240[(alu2+100663298)];
  var val43 = data1_251658240[(alu2+100663299)];
  var val44 = data1_251658240[(alu2+117440512)];
  var val45 = data1_251658240[(alu2+117440513)];
  var val46 = data1_251658240[(alu2+117440514)];
  var val47 = data1_251658240[(alu2+117440515)];
  var val48 = data1_251658240[(alu2+134217728)];
  var val49 = data1_251658240[(alu2+134217729)];
  var val50 = data1_251658240[(alu2+134217730)];
  var val51 = data1_251658240[(alu2+134217731)];
  var val52 = data1_251658240[(alu2+150994944)];
  var val53 = data1_251658240[(alu2+150994945)];
  var val54 = data1_251658240[(alu2+150994946)];
  var val55 = data1_251658240[(alu2+150994947)];
  var val56 = data1_251658240[(alu2+167772160)];
  var val57 = data1_251658240[(alu2+167772161)];
  var val58 = data1_251658240[(alu2+167772162)];
  var val59 = data1_251658240[(alu2+167772163)];
  var val60 = data1_251658240[(alu2+184549376)];
  var val61 = data1_251658240[(alu2+184549377)];
  var val62 = data1_251658240[(alu2+184549378)];
  var val63 = data1_251658240[(alu2+184549379)];
  var val64 = data1_251658240[(alu2+201326592)];
  var val65 = data1_251658240[(alu2+201326593)];
  var val66 = data1_251658240[(alu2+201326594)];
  var val67 = data1_251658240[(alu2+201326595)];
  var val68 = data1_251658240[(alu2+218103808)];
  var val69 = data1_251658240[(alu2+218103809)];
  var val70 = data1_251658240[(alu2+218103810)];
  var val71 = data1_251658240[(alu2+218103811)];
  var val72 = data1_251658240[(alu2+234881024)];
  var val73 = data1_251658240[(alu2+234881025)];
  var val74 = data1_251658240[(alu2+234881026)];
  var val75 = data1_251658240[(alu2+234881027)];
  var precast6 = lidx0;
  var precast7 = (cast0<<3u);
  var alu3 = (gidx1+bitcast<i32>(precast7));
  var precast8 = (bitcast<u32>(precast6)<<24u);
  var alu4 = (alu1+bitcast<i32>(precast8)+cast1);
  data0_33554432[alu4] = ((val16*val1)+(val20*val2)+(val24*val3)+(val28*val4)+(val32*val5)+(val36*val6)+(val40*val7)+(val44*val8)+(val48*val9)+(val52*val10)+(val56*val11)+(val60*val12)+(val64*val13)+(val68*val14)+(val72*val15)+val0);
  data0_33554432[(alu4+1)] = ((val17*val1)+(val21*val2)+(val25*val3)+(val29*val4)+(val33*val5)+(val37*val6)+(val41*val7)+(val45*val8)+(val49*val9)+(val53*val10)+(val57*val11)+(val61*val12)+(val65*val13)+(val69*val14)+(val73*val15)+val0);
  data0_33554432[(alu4+2)] = ((val18*val1)+(val22*val2)+(val26*val3)+(val30*val4)+(val34*val5)+(val38*val6)+(val42*val7)+(val46*val8)+(val50*val9)+(val54*val10)+(val58*val11)+(val62*val12)+(val66*val13)+(val70*val14)+(val74*val15)+val0);
  data0_33554432[(alu4+3)] = ((val19*val1)+(val23*val2)+(val27*val3)+(val31*val4)+(val35*val5)+(val39*val6)+(val43*val7)+(val47*val8)+(val51*val9)+(val55*val10)+(val59*val11)+(val63*val12)+(val67*val13)+(val71*val14)+(val75*val15)+val0);
}`;

const r_131072_32_4_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_16777216:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_33554432:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 32768 */
  var gidx1 = i32(gindex.y); /* 4 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = gidx1;
  var precast2 = lidx0;
  var cast0 = bitcast<u32>(precast0);
  var precast3 = (cast0<<9u);
  var precast4 = (bitcast<u32>(precast1)<<7u);
  var precast5 = (bitcast<u32>(precast2)<<2u);
  var alu0 = (bitcast<i32>(precast3)+bitcast<i32>(precast4)+bitcast<i32>(precast5));
  var val0 = data1_33554432[alu0];
  var alu1 = (alu0+1);
  var val1 = data1_33554432[alu1];
  var alu2 = (alu0+2);
  var val2 = data1_33554432[alu2];
  var alu3 = (alu0+3);
  var val3 = data1_33554432[alu3];
  var val4 = data1_33554432[(alu0+16777216)];
  var val5 = data1_33554432[(alu0+16777217)];
  var val6 = data1_33554432[(alu0+16777218)];
  var val7 = data1_33554432[(alu0+16777219)];
  var precast6 = (cast0<<2u);
  var alu4 = (gidx1+bitcast<i32>(precast6));
  var alu5 = select(val0,val4,(val0<val4));
  data0_16777216[alu0] = alu5;
  var alu7 = select(val1,val5,(val1<val5));
  data0_16777216[alu1] = alu7;
  var alu9 = select(val2,val6,(val2<val6));
  data0_16777216[alu2] = alu9;
  var alu11 = select(val3,val7,(val3<val7));
  data0_16777216[alu3] = alu11;
}`;

const r_131072_32_4_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_16777216:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1_33554432:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_16777216:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 32768 */
  var gidx1 = i32(gindex.y); /* 4 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = gidx1;
  var precast2 = lidx0;
  var cast0 = bitcast<u32>(precast0);
  var precast3 = (cast0<<9u);
  var precast4 = (bitcast<u32>(precast1)<<7u);
  var precast5 = (bitcast<u32>(precast2)<<2u);
  var alu0 = (bitcast<i32>(precast3)+bitcast<i32>(precast4)+bitcast<i32>(precast5));
  var val0 = data1_33554432[alu0];
  var val1 = data2_16777216[alu0];
  var alu1 = (alu0+1);
  var val2 = data1_33554432[alu1];
  var val3 = data2_16777216[alu1];
  var alu2 = (alu0+2);
  var val4 = data1_33554432[alu2];
  var val5 = data2_16777216[alu2];
  var alu3 = (alu0+3);
  var val6 = data1_33554432[alu3];
  var val7 = data2_16777216[alu3];
  var val8 = data1_33554432[(alu0+16777216)];
  var val9 = data1_33554432[(alu0+16777217)];
  var val10 = data1_33554432[(alu0+16777218)];
  var val11 = data1_33554432[(alu0+16777219)];
  var precast6 = (cast0<<2u);
  var alu4 = (gidx1+bitcast<i32>(precast6));
  var precast7 = (i32((val0==val1)));
  var precast8 = (bitcast<u32>(precast7)<<1u);
  var cast1 = bitcast<i32>(precast8);
  var precast9 = (i32((val2==val3)));
  var precast10 = (bitcast<u32>(precast9)<<1u);
  var cast2 = bitcast<i32>(precast10);
  var precast11 = (i32((val4==val5)));
  var precast12 = (bitcast<u32>(precast11)<<1u);
  var cast3 = bitcast<i32>(precast12);
  var precast13 = (i32((val6==val7)));
  var precast14 = (bitcast<u32>(precast13)<<1u);
  var cast4 = bitcast<i32>(precast14);
  var cast5 = (i32((val8==val1)));
  var cast6 = (i32((val9==val3)));
  var cast7 = (i32((val10==val5)));
  var cast8 = (i32((val11==val7)));
  var alu5 = select(cast5,cast1,(cast5<cast1));
  data0_16777216[alu0] = (2-alu5);
  var alu7 = select(cast6,cast2,(cast6<cast2));
  data0_16777216[alu1] = (2-alu7);
  var alu9 = select(cast7,cast3,(cast7<cast3));
  data0_16777216[alu2] = (2-alu9);
  var alu11 = select(cast8,cast4,(cast8<cast4));
  data0_16777216[alu3] = (2-alu11);
}`;

export async function setupNet(device, safetensor, callbackUI = ()=>{}) {
    const metadata = getTensorMetadata(safetensor);
    const infinityBuf = createInfinityUniformBuf(device);

    const layouts=[device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]})]

    const buf_0 = createEmptyBuf(device, 1006632960);;
    const input0 = createEmptyBuf(device, 67108864);;
    const buf_1 = createWeightBuf(device, 1620, getTensorBuffer(safetensor, metadata['model.0.weight']));
    const buf_2 = createEmptyBuf(device, 1006632960);;
    const buf_3 = createWeightBuf(device, 24300, getTensorBuffer(safetensor, metadata['model.2.weight']));
    const buf_4 = createEmptyBuf(device, 3932160);;
    const buf_5 = createEmptyBuf(device, 15360);;
    const buf_6 = createEmptyBuf(device, 60);;
    const buf_7 = createEmptyBuf(device, 60);;
    const buf_8 = createWeightBuf(device, 24300, getTensorBuffer(safetensor, metadata['model.5.weight']));
    const buf_9 = createWeightBuf(device, 24300, getTensorBuffer(safetensor, metadata['model.8.weight']));
    const buf_10 = createWeightBuf(device, 24300, getTensorBuffer(safetensor, metadata['model.11.weight']));
    const buf_11 = createWeightBuf(device, 24300, getTensorBuffer(safetensor, metadata['model.14.weight']));
    const buf_12 = createWeightBuf(device, 24300, getTensorBuffer(safetensor, metadata['model.17.weight']));
    const buf_13 = createWeightBuf(device, 24300, getTensorBuffer(safetensor, metadata['model.20.weight']));
    const buf_14 = createWeightBuf(device, 24300, getTensorBuffer(safetensor, metadata['model.23.weight']));
    const buf_15 = createWeightBuf(device, 24300, getTensorBuffer(safetensor, metadata['model.26.weight']));
    const buf_16 = createWeightBuf(device, 24300, getTensorBuffer(safetensor, metadata['model.29.weight']));
    const buf_17 = createWeightBuf(device, 24300, getTensorBuffer(safetensor, metadata['model.32.weight']));
    const buf_18 = createWeightBuf(device, 24300, getTensorBuffer(safetensor, metadata['model.35.weight']));
    const buf_19 = createWeightBuf(device, 24300, getTensorBuffer(safetensor, metadata['model.38.weight']));
    const buf_20 = createWeightBuf(device, 24300, getTensorBuffer(safetensor, metadata['model.41.weight']));
    const buf_21 = createWeightBuf(device, 24300, getTensorBuffer(safetensor, metadata['model.44.weight']));
    const buf_22 = createWeightBuf(device, 24300, getTensorBuffer(safetensor, metadata['model.47.weight']));
    const buf_23 = createWeightBuf(device, 24300, getTensorBuffer(safetensor, metadata['model.50.weight']));
    const buf_24 = createWeightBuf(device, 24300, getTensorBuffer(safetensor, metadata['model.53.weight']));
    const buf_25 = createWeightBuf(device, 24300, getTensorBuffer(safetensor, metadata['model.56.weight']));
    const buf_26 = createWeightBuf(device, 24300, getTensorBuffer(safetensor, metadata['model.59.weight']));
    const buf_27 = createWeightBuf(device, 24300, getTensorBuffer(safetensor, metadata['model.62.weight']));
    const buf_28 = createWeightBuf(device, 24300, getTensorBuffer(safetensor, metadata['model.65.weight']));
    const buf_29 = createWeightBuf(device, 24300, getTensorBuffer(safetensor, metadata['model.68.weight']));
    const buf_30 = createWeightBuf(device, 24300, getTensorBuffer(safetensor, metadata['model.71.weight']));
    const buf_31 = createEmptyBuf(device, 134217728);;
    const buf_32 = createWeightBuf(device, 120, getTensorBuffer(safetensor, metadata['model.74.weight']));
    const buf_33 = createWeightBuf(device, 8, getTensorBuffer(safetensor, metadata['model.74.bias']));
    const buf_34 = createEmptyBuf(device, 67108864);;
    const output0 = createEmptyBuf(device, 67108864);;

    const gpuWriteBuffer0 = device.createBuffer({size:input0.size, usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.MAP_WRITE });

    const gpuReadBuffer0 = device.createBuffer({size:output0.size, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });

    const kernels = [r_5_256_32_4_8_16_4_3_3_3_3, r_5_256_32_4_8_16_4_3_15_3_3_3, r_10240_32_3_64_4, r_40_32_3_64_4, r_15_16_16, r_5_1024_3_16_4_64_4, r_40_32_3_64_4, r_15_16_16n1, E_5_262144_3_16_4, r_5_256_32_4_8_16_4_3_15_3_3_3n1, r_10240_32_3_64_4, r_40_32_3_64_4, r_15_16_16, r_5_1024_3_16_4_64_4, r_40_32_3_64_4, r_15_16_16n1, E_5_262144_3_16_4, r_5_256_32_4_8_16_4_3_15_3_3_3n2, r_10240_32_3_64_4, r_40_32_3_64_4, r_15_16_16, r_5_1024_3_16_4_64_4, r_40_32_3_64_4, r_15_16_16n1, E_5_262144_3_16_4, r_5_256_32_4_8_16_4_3_15_3_3_3n3, r_10240_32_3_64_4, r_40_32_3_64_4, r_15_16_16, r_5_1024_3_16_4_64_4, r_40_32_3_64_4, r_15_16_16n1, E_5_262144_3_16_4, r_5_256_32_4_8_16_4_3_15_3_3_3n4, r_10240_32_3_64_4, r_40_32_3_64_4, r_15_16_16, r_5_1024_3_16_4_64_4, r_40_32_3_64_4, r_15_16_16n1, E_5_262144_3_16_4, r_5_256_32_4_8_16_4_3_15_3_3_3, r_10240_32_3_64_4, r_40_32_3_64_4, r_15_16_16, r_5_1024_3_16_4_64_4, r_40_32_3_64_4, r_15_16_16n1, E_5_262144_3_16_4, r_5_256_32_4_8_16_4_3_15_3_3_3n1, r_10240_32_3_64_4, r_40_32_3_64_4, r_15_16_16, r_5_1024_3_16_4_64_4, r_40_32_3_64_4, r_15_16_16n1, E_5_262144_3_16_4, r_5_256_32_4_8_16_4_3_15_3_3_3n2, r_10240_32_3_64_4, r_40_32_3_64_4, r_15_16_16, r_5_1024_3_16_4_64_4, r_40_32_3_64_4, r_15_16_16n1, E_5_262144_3_16_4, r_5_256_32_4_8_16_4_3_15_3_3_3n3, r_10240_32_3_64_4, r_40_32_3_64_4, r_15_16_16, r_5_1024_3_16_4_64_4, r_40_32_3_64_4, r_15_16_16n1, E_5_262144_3_16_4, r_5_256_32_4_8_16_4_3_15_3_3_3n4, r_10240_32_3_64_4, r_40_32_3_64_4, r_15_16_16, r_5_1024_3_16_4_64_4, r_40_32_3_64_4, r_15_16_16n1, E_5_262144_3_16_4, r_5_256_32_4_8_16_4_3_15_3_3_3, r_10240_32_3_64_4, r_40_32_3_64_4, r_15_16_16, r_5_1024_3_16_4_64_4, r_40_32_3_64_4, r_15_16_16n1, E_5_262144_3_16_4, r_5_256_32_4_8_16_4_3_15_3_3_3n1, r_10240_32_3_64_4, r_40_32_3_64_4, r_15_16_16, r_5_1024_3_16_4_64_4, r_40_32_3_64_4, r_15_16_16n1, E_5_262144_3_16_4, r_5_256_32_4_8_16_4_3_15_3_3_3n2, r_10240_32_3_64_4, r_40_32_3_64_4, r_15_16_16, r_5_1024_3_16_4_64_4, r_40_32_3_64_4, r_15_16_16n1, E_5_262144_3_16_4, r_5_256_32_4_8_16_4_3_15_3_3_3n3, r_10240_32_3_64_4, r_40_32_3_64_4, r_15_16_16, r_5_1024_3_16_4_64_4, r_40_32_3_64_4, r_15_16_16n1, E_5_262144_3_16_4, r_5_256_32_4_8_16_4_3_15_3_3_3n4, r_10240_32_3_64_4, r_40_32_3_64_4, r_15_16_16, r_5_1024_3_16_4_64_4, r_40_32_3_64_4, r_15_16_16n1, E_5_262144_3_16_4, r_5_256_32_4_8_16_4_3_15_3_3_3, r_10240_32_3_64_4, r_40_32_3_64_4, r_15_16_16, r_5_1024_3_16_4_64_4, r_40_32_3_64_4, r_15_16_16n1, E_5_262144_3_16_4, r_5_256_32_4_8_16_4_3_15_3_3_3n1, r_10240_32_3_64_4, r_40_32_3_64_4, r_15_16_16, r_5_1024_3_16_4_64_4, r_40_32_3_64_4, r_15_16_16n1, E_5_262144_3_16_4, r_5_256_32_4_8_16_4_3_15_3_3_3n2, r_10240_32_3_64_4, r_40_32_3_64_4, r_15_16_16, r_5_1024_3_16_4_64_4, r_40_32_3_64_4, r_15_16_16n1, E_5_262144_3_16_4, r_5_256_32_4_8_16_4_3_15_3_3_3n3, r_10240_32_3_64_4, r_40_32_3_64_4, r_15_16_16, r_5_1024_3_16_4_64_4, r_40_32_3_64_4, r_15_16_16n1, E_5_262144_3_16_4, r_5_256_32_4_8_16_4_3_15_3_3_3n4, r_10240_32_3_64_4, r_40_32_3_64_4, r_15_16_16, r_5_1024_3_16_4_64_4, r_40_32_3_64_4, r_15_16_16n1, E_5_262144_3_16_4, r_5_256_32_4_8_16_4_3_15_3_3_3, r_10240_32_3_64_4, r_40_32_3_64_4, r_15_16_16, r_5_1024_3_16_4_64_4, r_40_32_3_64_4, r_15_16_16n1, E_5_262144_3_16_4, r_5_256_32_4_8_16_4_3_15_3_3_3n1, r_10240_32_3_64_4, r_40_32_3_64_4, r_15_16_16, r_5_1024_3_16_4_64_4, r_40_32_3_64_4, r_15_16_16n1, E_5_262144_3_16_4, r_5_256_32_4_8_16_4_3_15_3_3_3n2, r_10240_32_3_64_4, r_40_32_3_64_4, r_15_16_16, r_5_1024_3_16_4_64_4, r_40_32_3_64_4, r_15_16_16n1, E_5_262144_3_16_4, r_5_256_32_4_8_16_4_3_15_3_3_3n3, r_10240_32_3_64_4, r_40_32_3_64_4, r_15_16_16, r_5_1024_3_16_4_64_4, r_40_32_3_64_4, r_15_16_16n1, E_5_262144_3_16_4, r_262144_2_16_4_15, r_131072_32_4_2, r_131072_32_4_2_2];
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
        addComputePass(device, commandEncoder, pipelines[0], layouts[0], infinityBuf, [buf_0, input0, buf_1], [128, 256, 5]);
        addComputePass(device, commandEncoder, pipelines[1], layouts[1], infinityBuf, [buf_2, buf_0, buf_3], [128, 256, 5]);
        addComputePass(device, commandEncoder, pipelines[2], layouts[2], infinityBuf, [buf_4, buf_2], [10240, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[3], layouts[3], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[4], layouts[4], infinityBuf, [buf_6, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[5], layouts[5], infinityBuf, [buf_4, buf_2, buf_6], [1024, 5, 1]);
        addComputePass(device, commandEncoder, pipelines[6], layouts[6], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[7], layouts[7], infinityBuf, [buf_7, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[8], layouts[8], infinityBuf, [buf_0, buf_2, buf_6, buf_7], [32768, 40, 1]);
        addComputePass(device, commandEncoder, pipelines[9], layouts[9], infinityBuf, [buf_2, buf_0, buf_8], [128, 256, 5]);
        addComputePass(device, commandEncoder, pipelines[10], layouts[10], infinityBuf, [buf_4, buf_2], [10240, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[11], layouts[11], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[12], layouts[12], infinityBuf, [buf_7, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[13], layouts[13], infinityBuf, [buf_4, buf_2, buf_7], [1024, 5, 1]);
        addComputePass(device, commandEncoder, pipelines[14], layouts[14], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[15], layouts[15], infinityBuf, [buf_6, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[16], layouts[16], infinityBuf, [buf_0, buf_2, buf_7, buf_6], [32768, 40, 1]);
        addComputePass(device, commandEncoder, pipelines[17], layouts[17], infinityBuf, [buf_2, buf_0, buf_9], [128, 256, 5]);
        addComputePass(device, commandEncoder, pipelines[18], layouts[18], infinityBuf, [buf_4, buf_2], [10240, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[19], layouts[19], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[20], layouts[20], infinityBuf, [buf_6, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[21], layouts[21], infinityBuf, [buf_4, buf_2, buf_6], [1024, 5, 1]);
        addComputePass(device, commandEncoder, pipelines[22], layouts[22], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[23], layouts[23], infinityBuf, [buf_7, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[24], layouts[24], infinityBuf, [buf_0, buf_2, buf_6, buf_7], [32768, 40, 1]);
        addComputePass(device, commandEncoder, pipelines[25], layouts[25], infinityBuf, [buf_2, buf_0, buf_10], [128, 256, 5]);
        addComputePass(device, commandEncoder, pipelines[26], layouts[26], infinityBuf, [buf_4, buf_2], [10240, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[27], layouts[27], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[28], layouts[28], infinityBuf, [buf_7, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[29], layouts[29], infinityBuf, [buf_4, buf_2, buf_7], [1024, 5, 1]);
        addComputePass(device, commandEncoder, pipelines[30], layouts[30], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[31], layouts[31], infinityBuf, [buf_6, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[32], layouts[32], infinityBuf, [buf_0, buf_2, buf_7, buf_6], [32768, 40, 1]);
        addComputePass(device, commandEncoder, pipelines[33], layouts[33], infinityBuf, [buf_2, buf_0, buf_11], [128, 256, 5]);
        addComputePass(device, commandEncoder, pipelines[34], layouts[34], infinityBuf, [buf_4, buf_2], [10240, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[35], layouts[35], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[36], layouts[36], infinityBuf, [buf_6, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[37], layouts[37], infinityBuf, [buf_4, buf_2, buf_6], [1024, 5, 1]);
        addComputePass(device, commandEncoder, pipelines[38], layouts[38], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[39], layouts[39], infinityBuf, [buf_7, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[40], layouts[40], infinityBuf, [buf_0, buf_2, buf_6, buf_7], [32768, 40, 1]);
        addComputePass(device, commandEncoder, pipelines[41], layouts[41], infinityBuf, [buf_2, buf_0, buf_12], [128, 256, 5]);
        addComputePass(device, commandEncoder, pipelines[42], layouts[42], infinityBuf, [buf_4, buf_2], [10240, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[43], layouts[43], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[44], layouts[44], infinityBuf, [buf_7, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[45], layouts[45], infinityBuf, [buf_4, buf_2, buf_7], [1024, 5, 1]);
        addComputePass(device, commandEncoder, pipelines[46], layouts[46], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[47], layouts[47], infinityBuf, [buf_6, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[48], layouts[48], infinityBuf, [buf_0, buf_2, buf_7, buf_6], [32768, 40, 1]);
        addComputePass(device, commandEncoder, pipelines[49], layouts[49], infinityBuf, [buf_2, buf_0, buf_13], [128, 256, 5]);
        addComputePass(device, commandEncoder, pipelines[50], layouts[50], infinityBuf, [buf_4, buf_2], [10240, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[51], layouts[51], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[52], layouts[52], infinityBuf, [buf_6, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[53], layouts[53], infinityBuf, [buf_4, buf_2, buf_6], [1024, 5, 1]);
        addComputePass(device, commandEncoder, pipelines[54], layouts[54], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[55], layouts[55], infinityBuf, [buf_7, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[56], layouts[56], infinityBuf, [buf_0, buf_2, buf_6, buf_7], [32768, 40, 1]);
        addComputePass(device, commandEncoder, pipelines[57], layouts[57], infinityBuf, [buf_2, buf_0, buf_14], [128, 256, 5]);
        addComputePass(device, commandEncoder, pipelines[58], layouts[58], infinityBuf, [buf_4, buf_2], [10240, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[59], layouts[59], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[60], layouts[60], infinityBuf, [buf_7, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[61], layouts[61], infinityBuf, [buf_4, buf_2, buf_7], [1024, 5, 1]);
        addComputePass(device, commandEncoder, pipelines[62], layouts[62], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[63], layouts[63], infinityBuf, [buf_6, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[64], layouts[64], infinityBuf, [buf_0, buf_2, buf_7, buf_6], [32768, 40, 1]);
        addComputePass(device, commandEncoder, pipelines[65], layouts[65], infinityBuf, [buf_2, buf_0, buf_15], [128, 256, 5]);
        addComputePass(device, commandEncoder, pipelines[66], layouts[66], infinityBuf, [buf_4, buf_2], [10240, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[67], layouts[67], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[68], layouts[68], infinityBuf, [buf_6, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[69], layouts[69], infinityBuf, [buf_4, buf_2, buf_6], [1024, 5, 1]);
        addComputePass(device, commandEncoder, pipelines[70], layouts[70], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[71], layouts[71], infinityBuf, [buf_7, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[72], layouts[72], infinityBuf, [buf_0, buf_2, buf_6, buf_7], [32768, 40, 1]);
        addComputePass(device, commandEncoder, pipelines[73], layouts[73], infinityBuf, [buf_2, buf_0, buf_16], [128, 256, 5]);
        addComputePass(device, commandEncoder, pipelines[74], layouts[74], infinityBuf, [buf_4, buf_2], [10240, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[75], layouts[75], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[76], layouts[76], infinityBuf, [buf_7, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[77], layouts[77], infinityBuf, [buf_4, buf_2, buf_7], [1024, 5, 1]);
        addComputePass(device, commandEncoder, pipelines[78], layouts[78], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[79], layouts[79], infinityBuf, [buf_6, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[80], layouts[80], infinityBuf, [buf_0, buf_2, buf_7, buf_6], [32768, 40, 1]);
        addComputePass(device, commandEncoder, pipelines[81], layouts[81], infinityBuf, [buf_2, buf_0, buf_17], [128, 256, 5]);
        addComputePass(device, commandEncoder, pipelines[82], layouts[82], infinityBuf, [buf_4, buf_2], [10240, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[83], layouts[83], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[84], layouts[84], infinityBuf, [buf_6, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[85], layouts[85], infinityBuf, [buf_4, buf_2, buf_6], [1024, 5, 1]);
        addComputePass(device, commandEncoder, pipelines[86], layouts[86], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[87], layouts[87], infinityBuf, [buf_7, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[88], layouts[88], infinityBuf, [buf_0, buf_2, buf_6, buf_7], [32768, 40, 1]);
        addComputePass(device, commandEncoder, pipelines[89], layouts[89], infinityBuf, [buf_2, buf_0, buf_18], [128, 256, 5]);
        addComputePass(device, commandEncoder, pipelines[90], layouts[90], infinityBuf, [buf_4, buf_2], [10240, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[91], layouts[91], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[92], layouts[92], infinityBuf, [buf_7, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[93], layouts[93], infinityBuf, [buf_4, buf_2, buf_7], [1024, 5, 1]);
        addComputePass(device, commandEncoder, pipelines[94], layouts[94], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[95], layouts[95], infinityBuf, [buf_6, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[96], layouts[96], infinityBuf, [buf_0, buf_2, buf_7, buf_6], [32768, 40, 1]);
        addComputePass(device, commandEncoder, pipelines[97], layouts[97], infinityBuf, [buf_2, buf_0, buf_19], [128, 256, 5]);
        addComputePass(device, commandEncoder, pipelines[98], layouts[98], infinityBuf, [buf_4, buf_2], [10240, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[99], layouts[99], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[100], layouts[100], infinityBuf, [buf_6, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[101], layouts[101], infinityBuf, [buf_4, buf_2, buf_6], [1024, 5, 1]);
        addComputePass(device, commandEncoder, pipelines[102], layouts[102], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[103], layouts[103], infinityBuf, [buf_7, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[104], layouts[104], infinityBuf, [buf_0, buf_2, buf_6, buf_7], [32768, 40, 1]);
        addComputePass(device, commandEncoder, pipelines[105], layouts[105], infinityBuf, [buf_2, buf_0, buf_20], [128, 256, 5]);
        addComputePass(device, commandEncoder, pipelines[106], layouts[106], infinityBuf, [buf_4, buf_2], [10240, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[107], layouts[107], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[108], layouts[108], infinityBuf, [buf_7, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[109], layouts[109], infinityBuf, [buf_4, buf_2, buf_7], [1024, 5, 1]);
        addComputePass(device, commandEncoder, pipelines[110], layouts[110], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[111], layouts[111], infinityBuf, [buf_6, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[112], layouts[112], infinityBuf, [buf_0, buf_2, buf_7, buf_6], [32768, 40, 1]);
        addComputePass(device, commandEncoder, pipelines[113], layouts[113], infinityBuf, [buf_2, buf_0, buf_21], [128, 256, 5]);
        addComputePass(device, commandEncoder, pipelines[114], layouts[114], infinityBuf, [buf_4, buf_2], [10240, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[115], layouts[115], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[116], layouts[116], infinityBuf, [buf_6, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[117], layouts[117], infinityBuf, [buf_4, buf_2, buf_6], [1024, 5, 1]);
        addComputePass(device, commandEncoder, pipelines[118], layouts[118], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[119], layouts[119], infinityBuf, [buf_7, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[120], layouts[120], infinityBuf, [buf_0, buf_2, buf_6, buf_7], [32768, 40, 1]);
        addComputePass(device, commandEncoder, pipelines[121], layouts[121], infinityBuf, [buf_2, buf_0, buf_22], [128, 256, 5]);
        addComputePass(device, commandEncoder, pipelines[122], layouts[122], infinityBuf, [buf_4, buf_2], [10240, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[123], layouts[123], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[124], layouts[124], infinityBuf, [buf_7, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[125], layouts[125], infinityBuf, [buf_4, buf_2, buf_7], [1024, 5, 1]);
        addComputePass(device, commandEncoder, pipelines[126], layouts[126], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[127], layouts[127], infinityBuf, [buf_6, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[128], layouts[128], infinityBuf, [buf_0, buf_2, buf_7, buf_6], [32768, 40, 1]);
        addComputePass(device, commandEncoder, pipelines[129], layouts[129], infinityBuf, [buf_2, buf_0, buf_23], [128, 256, 5]);
        addComputePass(device, commandEncoder, pipelines[130], layouts[130], infinityBuf, [buf_4, buf_2], [10240, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[131], layouts[131], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[132], layouts[132], infinityBuf, [buf_6, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[133], layouts[133], infinityBuf, [buf_4, buf_2, buf_6], [1024, 5, 1]);
        addComputePass(device, commandEncoder, pipelines[134], layouts[134], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[135], layouts[135], infinityBuf, [buf_7, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[136], layouts[136], infinityBuf, [buf_0, buf_2, buf_6, buf_7], [32768, 40, 1]);
        addComputePass(device, commandEncoder, pipelines[137], layouts[137], infinityBuf, [buf_2, buf_0, buf_24], [128, 256, 5]);
        addComputePass(device, commandEncoder, pipelines[138], layouts[138], infinityBuf, [buf_4, buf_2], [10240, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[139], layouts[139], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[140], layouts[140], infinityBuf, [buf_7, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[141], layouts[141], infinityBuf, [buf_4, buf_2, buf_7], [1024, 5, 1]);
        addComputePass(device, commandEncoder, pipelines[142], layouts[142], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[143], layouts[143], infinityBuf, [buf_6, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[144], layouts[144], infinityBuf, [buf_0, buf_2, buf_7, buf_6], [32768, 40, 1]);
        addComputePass(device, commandEncoder, pipelines[145], layouts[145], infinityBuf, [buf_2, buf_0, buf_25], [128, 256, 5]);
        addComputePass(device, commandEncoder, pipelines[146], layouts[146], infinityBuf, [buf_4, buf_2], [10240, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[147], layouts[147], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[148], layouts[148], infinityBuf, [buf_6, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[149], layouts[149], infinityBuf, [buf_4, buf_2, buf_6], [1024, 5, 1]);
        addComputePass(device, commandEncoder, pipelines[150], layouts[150], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[151], layouts[151], infinityBuf, [buf_7, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[152], layouts[152], infinityBuf, [buf_0, buf_2, buf_6, buf_7], [32768, 40, 1]);
        addComputePass(device, commandEncoder, pipelines[153], layouts[153], infinityBuf, [buf_2, buf_0, buf_26], [128, 256, 5]);
        addComputePass(device, commandEncoder, pipelines[154], layouts[154], infinityBuf, [buf_4, buf_2], [10240, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[155], layouts[155], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[156], layouts[156], infinityBuf, [buf_7, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[157], layouts[157], infinityBuf, [buf_4, buf_2, buf_7], [1024, 5, 1]);
        addComputePass(device, commandEncoder, pipelines[158], layouts[158], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[159], layouts[159], infinityBuf, [buf_6, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[160], layouts[160], infinityBuf, [buf_0, buf_2, buf_7, buf_6], [32768, 40, 1]);
        addComputePass(device, commandEncoder, pipelines[161], layouts[161], infinityBuf, [buf_2, buf_0, buf_27], [128, 256, 5]);
        addComputePass(device, commandEncoder, pipelines[162], layouts[162], infinityBuf, [buf_4, buf_2], [10240, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[163], layouts[163], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[164], layouts[164], infinityBuf, [buf_6, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[165], layouts[165], infinityBuf, [buf_4, buf_2, buf_6], [1024, 5, 1]);
        addComputePass(device, commandEncoder, pipelines[166], layouts[166], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[167], layouts[167], infinityBuf, [buf_7, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[168], layouts[168], infinityBuf, [buf_0, buf_2, buf_6, buf_7], [32768, 40, 1]);
        addComputePass(device, commandEncoder, pipelines[169], layouts[169], infinityBuf, [buf_2, buf_0, buf_28], [128, 256, 5]);
        addComputePass(device, commandEncoder, pipelines[170], layouts[170], infinityBuf, [buf_4, buf_2], [10240, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[171], layouts[171], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[172], layouts[172], infinityBuf, [buf_7, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[173], layouts[173], infinityBuf, [buf_4, buf_2, buf_7], [1024, 5, 1]);
        addComputePass(device, commandEncoder, pipelines[174], layouts[174], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[175], layouts[175], infinityBuf, [buf_6, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[176], layouts[176], infinityBuf, [buf_0, buf_2, buf_7, buf_6], [32768, 40, 1]);
        addComputePass(device, commandEncoder, pipelines[177], layouts[177], infinityBuf, [buf_2, buf_0, buf_29], [128, 256, 5]);
        addComputePass(device, commandEncoder, pipelines[178], layouts[178], infinityBuf, [buf_4, buf_2], [10240, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[179], layouts[179], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[180], layouts[180], infinityBuf, [buf_6, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[181], layouts[181], infinityBuf, [buf_4, buf_2, buf_6], [1024, 5, 1]);
        addComputePass(device, commandEncoder, pipelines[182], layouts[182], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[183], layouts[183], infinityBuf, [buf_7, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[184], layouts[184], infinityBuf, [buf_0, buf_2, buf_6, buf_7], [32768, 40, 1]);
        addComputePass(device, commandEncoder, pipelines[185], layouts[185], infinityBuf, [buf_2, buf_0, buf_30], [128, 256, 5]);
        addComputePass(device, commandEncoder, pipelines[186], layouts[186], infinityBuf, [buf_4, buf_2], [10240, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[187], layouts[187], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[188], layouts[188], infinityBuf, [buf_7, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[189], layouts[189], infinityBuf, [buf_4, buf_2, buf_7], [1024, 5, 1]);
        addComputePass(device, commandEncoder, pipelines[190], layouts[190], infinityBuf, [buf_5, buf_4], [40, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[191], layouts[191], infinityBuf, [buf_6, buf_5], [15, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[192], layouts[192], infinityBuf, [buf_0, buf_2, buf_7, buf_6], [32768, 40, 1]);
        addComputePass(device, commandEncoder, pipelines[193], layouts[193], infinityBuf, [buf_31, buf_0, buf_32, buf_33], [32768, 8, 1]);
        addComputePass(device, commandEncoder, pipelines[194], layouts[194], infinityBuf, [buf_34, buf_31], [32768, 4, 1]);
        addComputePass(device, commandEncoder, pipelines[195], layouts[195], infinityBuf, [output0, buf_31, buf_34], [32768, 4, 1]);
        commandEncoder.copyBufferToBuffer(output0, 0, gpuReadBuffer0, 0, output0.size);
        const gpuCommands = commandEncoder.finish();
        device.queue.submit([gpuCommands]);

        await gpuReadBuffer0.mapAsync(GPUMapMode.READ);
        const resultBuffer0 = new Int32Array(gpuReadBuffer0.size/4);
        resultBuffer0.set(new Int32Array(gpuReadBuffer0.getMappedRange()));
        gpuReadBuffer0.unmap();
        return [resultBuffer0];
    }
}
const load = async (device, weight_path) => { return await fetch(weight_path).then(x => x.arrayBuffer()).then(x => setupNet(device, new Uint8Array(x))); }
