var $p=Math.pow;var Y=(Ac,Dc,Co)=>new Promise((Zi,Io)=>{var Dt=mn=>{try{fn(Co.next(mn))}catch(En){Io(En)}},Fc=mn=>{try{fn(Co.throw(mn))}catch(En){Io(En)}},fn=mn=>mn.done?Zi(mn.value):Promise.resolve(mn.value).then(Dt,Fc);fn((Co=Co.apply(Ac,Dc)).next())});(function(){"use strict";function Ac(n,e){return e.forEach(function(t){t&&typeof t!="string"&&!Array.isArray(t)&&Object.keys(t).forEach(function(s){if(s!=="default"&&!(s in n)){var o=Object.getOwnPropertyDescriptor(t,s);Object.defineProperty(n,s,o.get?o:{enumerable:!0,get:function(){return t[s]}})}})}),Object.freeze(n)}const Dc=1e-7,Co=1e-4;class Zi{constructor(e,t){this.backend=e,this.dataMover=t,this.data=new WeakMap,this.dataIdsCount=0}get(e){return this.data.has(e)||this.dataMover.moveData(this.backend,e),this.data.get(e)}set(e,t){this.dataIdsCount++,this.data.set(e,t)}has(e){return this.data.has(e)}delete(e){return this.dataIdsCount--,this.data.delete(e)}numDataIds(){return this.dataIdsCount}}class Io{refCount(e){return Dt("refCount")}incRef(e){return Dt("incRef")}timerAvailable(){return!0}time(e){return Dt("time")}read(e){return Dt("read")}readSync(e){return Dt("readSync")}readToGPU(e,t){return Dt("readToGPU")}numDataIds(){return Dt("numDataIds")}disposeData(e,t){return Dt("disposeData")}write(e,t,s){return Dt("write")}move(e,t,s,o,r){return Dt("move")}createTensorFromGPUData(e,t,s){return Dt("createTensorFromGPUData")}memory(){return Dt("memory")}floatPrecision(){return Dt("floatPrecision")}epsilon(){return this.floatPrecision()===32?Dc:Co}dispose(){return Dt("dispose")}}function Dt(n){throw new Error(`'${n}' not yet implemented or not found in the registry. This kernel may not be supported by the tfjs backend you have chosen`)}function Fc(n){let e=n.length,t=0;for(;e>0;)t=Math.random()*e|0,e--,En(n,e,t)}function fn(n,e,t){return Math.max(n,Math.min(e,t))}function mn(n){return n%2===0?n:n+1}function En(n,e,t){const s=n[e];n[e]=n[t],n[t]=s}function sw(n){let e=0;for(let t=0;t<n.length;t++)e+=n[t];return e}function k(n,e){if(!n)throw new Error(typeof e=="string"?e:e())}function _c(n,e,t=""){k(Ee(n,e),()=>t+` Shapes ${n} and ${e} must match`)}function kp(n){k(n!=null,()=>"The input to the tensor constructor must be a non-null value.")}function q(n){if(n.length===0)return 1;let e=n[0];for(let t=1;t<n.length;t++)e*=n[t];return e}function Ee(n,e){if(n===e)return!0;if(n==null||e==null||n.length!==e.length)return!1;for(let t=0;t<n.length;t++)if(n[t]!==e[t])return!1;return!0}function $o(n){return n%1===0}function Oc(n){const e=Math.ceil(Math.sqrt(n));return[e,Math.ceil(n/e)]}function ko(n,e){return e<=n.length?n:n+" ".repeat(e-n.length)}function vp(n,e=o=>0,t,s){return new Promise((o,r)=>{let i=0;const a=()=>{if(n()){o();return}i++;const l=e(i);if(t!=null&&i>=t){r();return}s!=null?s(a,l):setTimeout(a,l)};a()})}function Sp(n,e){let t=1,s=-1;for(let r=0;r<n.length;++r)if(n[r]>=0)t*=n[r];else if(n[r]===-1){if(s!==-1)throw Error(`Shapes can only have 1 implicit size. Found -1 at dim ${s} and dim ${r}`);s=r}else if(n[r]<0)throw Error(`Shapes can not be < 0. Found ${n[r]} at dim ${r}`);if(s===-1){if(e>0&&e!==t)throw Error(`Size(${e}) must match the product of shape ${n}`);return n}if(t===0)throw Error(`Cannot infer the missing size in [${n}] when there are 0 elements`);if(e%t!==0)throw Error(`The implicit shape can't be a fractional number. Got ${e} / ${t}`);const o=n.slice();return o[s]=e/t,o}function Ce(n,e){const t=e.length;return n=n==null?e.map((s,o)=>o):[].concat(n),k(n.every(s=>s>=-t&&s<t),()=>`All values in axis param must be in range [-${t}, ${t}) but got axis ${n}`),k(n.every(s=>$o(s)),()=>`All values in axis param must be integers but got axis ${n}`),n.map(s=>s<0?t+s:s)}function as(n,e){const t=[],s=[],o=e!=null&&Array.isArray(e)&&e.length===0,r=e==null||o?null:Ce(e,n).sort();let i=0;for(let a=0;a<n.length;++a){if(r!=null){if(r[i]===a&&n[a]!==1)throw new Error(`Can't squeeze axis ${a} since its dim '${n[a]}' is not 1`);(r[i]==null||r[i]>a)&&n[a]===1&&(t.push(n[a]),s.push(a)),r[i]<=a&&i++}n[a]!==1&&(t.push(n[a]),s.push(a))}return{newShape:t,keptDims:s}}function vt(n,e){return Qe(n,e)}function Qe(n,e){let t=null;if(n==null||n==="float32")t=new Float32Array(e);else if(n==="int32")t=new Int32Array(e);else if(n==="bool")t=new Uint8Array(e);else if(n==="string")t=new Array(e);else throw new Error(`Unknown data type ${n}`);return t}function ow(n,e){for(let t=0;t<n.length;t++){const s=n[t];if(isNaN(s)||!isFinite(s))throw Error(`A tensor of type ${e} being uploaded contains ${s}.`)}}function rw(n){return n==="bool"||n==="complex64"||n==="float32"||n==="int32"||n==="string"}function Np(n,e){return!(e==="complex64"||e==="float32"&&n!=="complex64"||e==="int32"&&n!=="float32"&&n!=="complex64"||e==="bool"&&n==="bool")}function Qi(n){if(n==="float32"||n==="int32")return 4;if(n==="complex64")return 8;if(n==="bool")return 1;throw new Error(`Unknown dtype ${n}`)}function iw(n){if(n==null)return 0;let e=0;return n.forEach(t=>e+=t.length),e}function ir(n){return typeof n=="string"||n instanceof String}function aw(n){return typeof n=="boolean"}function Lc(n){return typeof n=="number"}function vo(n){return Array.isArray(n)?vo(n[0]):n instanceof Float32Array?"float32":n instanceof Int32Array||n instanceof Uint8Array||n instanceof Uint8ClampedArray?"int32":Lc(n)?"float32":ir(n)?"string":aw(n)?"bool":"float32"}function Mc(n){return!!(n&&n.constructor&&n.call&&n.apply)}function Pc(n,e){for(let t=e;t<n;++t)if(n%t===0)return t;return n}function ce(n){const e=n.length;if(e<2)return[];const t=new Array(e-1);t[e-2]=n[e-1];for(let s=e-3;s>=0;--s)t[s]=t[s+1]*n[s+1];return t}function Tp(n,e,t,s=!1){const o=new Array;if(e.length===1){const r=e[0]*(s?2:1);for(let i=0;i<r;i++)o[i]=t[n+i]}else{const r=e[0],i=e.slice(1),a=i.reduce((l,c)=>l*c)*(s?2:1);for(let l=0;l<r;l++)o[l]=Tp(n+l*a,i,t,s)}return o}function gn(n,e,t=!1){if(n.length===0)return e[0];const s=n.reduce((o,r)=>o*r)*(t?2:1);if(s===0)return[];if(s!==e.length)throw new Error(`[${n}] does not match the input size ${e.length}${t?" for a complex tensor":""}.`);return Tp(0,n,e,t)}function lw(n,e){if(Array.isArray(n))return n;if(e==="float32")return n instanceof Float32Array?n:new Float32Array(n);if(e==="int32")return n instanceof Int32Array?n:new Int32Array(n);if(e==="bool"||e==="string")return Uint8Array.from(new Int32Array(n));throw new Error(`Unknown dtype ${e}`)}function Bc(n,e){const t=St(n,e);for(let s=0;s<t.length;s++)t[s]=1;return t}function St(n,e){if(e==null||e==="float32"||e==="complex64")return new Float32Array(n);if(e==="int32")return new Int32Array(n);if(e==="bool")return new Uint8Array(n);throw new Error(`Unknown data type ${e}`)}function Ep(n,e){const t=n.reduce((s,o)=>s*o,1);if(e==null||e==="float32")return gn(n,new Float32Array(t));if(e==="int32")return gn(n,new Int32Array(t));if(e==="bool")return gn(n,new Uint8Array(t));throw new Error(`Unknown data type ${e}`)}function Kn(n){n.forEach(e=>{k(Number.isInteger(e)&&e>=0,()=>`Tensor must have a shape comprised of positive integers but got shape [${n}].`)})}function Rn(n,e,t){if(e===0)return 0;if(e===1)return n[0];let s=n[n.length-1];for(let o=0;o<n.length-1;++o)s+=t[o]*n[o];return s}function So(n,e,t){if(e===0)return[];if(e===1)return[n];const s=new Array(e);for(let o=0;o<s.length-1;++o)s[o]=Math.floor(n/t[o]),n-=s[o]*t[o];return s[s.length-1]=n,s}function zc(n){return n&&n.then&&typeof n.then=="function"}const Rp="tfjsflags";class cw{constructor(e){this.global=e,this.flags={},this.flagRegistry={},this.urlFlags={},this.getQueryParams=uw,this.populateURLFlags()}setPlatform(e,t){this.platform!=null&&(V().getBool("IS_TEST")||V().getBool("PROD")||console.warn(`Platform ${this.platformName} has already been set. Overwriting the platform with ${e}.`)),this.platformName=e,this.platform=t}registerFlag(e,t,s){if(this.flagRegistry[e]={evaluationFn:t,setHook:s},this.urlFlags[e]!=null){const o=this.urlFlags[e];V().getBool("IS_TEST")||V().getBool("PROD")||console.warn(`Setting feature override from URL ${e}: ${o}.`),this.set(e,o)}}getAsync(e){return Y(this,null,function*(){return e in this.flags?this.flags[e]:(this.flags[e]=yield this.evaluateFlag(e),this.flags[e])})}get(e){if(e in this.flags)return this.flags[e];const t=this.evaluateFlag(e);if(zc(t))throw new Error(`Flag ${e} cannot be synchronously evaluated. Please use getAsync() instead.`);return this.flags[e]=t,this.flags[e]}getNumber(e){return this.get(e)}getBool(e){return this.get(e)}getString(e){return this.get(e)}getFlags(){return this.flags}get features(){return this.flags}set(e,t){if(this.flagRegistry[e]==null)throw new Error(`Cannot set flag ${e} as it has not been registered.`);this.flags[e]=t,this.flagRegistry[e].setHook!=null&&this.flagRegistry[e].setHook(t)}evaluateFlag(e){if(this.flagRegistry[e]==null)throw new Error(`Cannot evaluate flag '${e}': no evaluation function found.`);return this.flagRegistry[e].evaluationFn()}setFlags(e){this.flags=Object.assign({},e)}reset(){this.flags={},this.urlFlags={},this.populateURLFlags()}populateURLFlags(){if(typeof this.global=="undefined"||typeof this.global.location=="undefined"||typeof this.global.location.search=="undefined")return;const e=this.getQueryParams(this.global.location.search);Rp in e&&e[Rp].split(",").forEach(s=>{const[o,r]=s.split(":");this.urlFlags[o]=dw(o,r)})}}function uw(n){const e={};return n.replace(/[?&]([^=?&]+)(?:=([^&]*))?/g,(t,...s)=>(hw(e,s[0],s[1]),s.join("="))),e}function hw(n,e,t){n[decodeURIComponent(e)]=decodeURIComponent(t||"")}function dw(n,e){const t=e.toLowerCase();return t==="true"||t==="false"?t==="true":`${+t}`===t?+t:e}function V(){return Ap}let Ap=null;function pw(n){Ap=n}let Vc;function Dp(){if(Vc==null){let n;if(typeof window!="undefined")n=window;else if(typeof global!="undefined")n=global;else if(typeof process!="undefined")n=process;else if(typeof self!="undefined")n=self;else throw new Error("Could not find a global object");Vc=n}return Vc}function fw(){const n=Dp();return n._tfGlobals==null&&(n._tfGlobals=new Map),n._tfGlobals}function Wc(n,e){const t=fw();if(t.has(n))return t.get(n);{const s=e();return t.set(n,s),t.get(n)}}const Ji="Abs",ar="Acos",lr="Acosh",No="Add",Uc="AddN",Gc="All",Hc="Any",ea="ArgMax",ta="ArgMin",cr="Asin",ur="Asinh",hr="Atan",dr="Atanh",pr="Atan2",na="AvgPool",qc="AvgPoolGrad",sa="AvgPool3D",jc="AvgPool3DGrad",oa="BatchMatMul",ra="BatchToSpaceND",Kc="Bincount",Xc="BitwiseAnd",mw="BroadcastTo",Fp="BroadcastArgs",fr="Cast",mr="Ceil",gr="ClipByValue",Yc="Complex",ia="ComplexAbs",aa="Concat",la="Conv2D",Zc="Conv2DBackpropFilter",ca="Conv2DBackpropInput",ua="Conv3D",Qc="Conv3DBackpropFilterV2",Jc="Conv3DBackpropInputV2",xr="Cos",br="Cosh",eu="Cumprod",ha="Cumsum",tu="CropAndResize",nu="DenseBincount",su="DepthToSpace",da="DepthwiseConv2dNative",ou="DepthwiseConv2dNativeBackpropFilter",ru="DepthwiseConv2dNativeBackpropInput",_p="Diag",pa="Dilation2D",iu="Dilation2DBackpropInput",au="Dilation2DBackpropFilter",gw="Draw",yr="RealDiv",lu="Einsum",wr="Elu",cu="EluGrad",Cr="Erf",fa="Equal",Ir="Exp",ma="ExpandDims",$r="Expm1",uu="FFT",hu="Fill",du="FlipLeftRight",kr="Floor",vr="FloorDiv",ga="FusedBatchNorm",xa="GatherV2",Op="GatherNd",ba="Greater",Sr="GreaterEqual",Nr="Identity",pu="IFFT",fu="Imag",Tr="IsFinite",Er="IsInf",Rr="IsNan",ya="LeakyRelu",wa="Less",Ca="LessEqual",Lp="LinSpace",Ar="Log",Dr="Log1p",Ia="LogicalAnd",$a="LogicalNot",ka="LogicalOr",xw="LogSoftmax",va="LRN",mu="LRNGrad",Sa="Max",Fr="Maximum",Na="MaxPool",gu="MaxPoolGrad",Ta="MaxPool3D",xu="MaxPool3DGrad",Mp="MaxPoolWithArgmax",Ea="Mean",Ra="Min",_r="Minimum",Aa="MirrorPad",Or="Mod",Pp="Multinomial",Lr="Multiply",Da="Neg",Fa="NotEqual",bu="NonMaxSuppressionV3",yu="NonMaxSuppressionV4",wu="NonMaxSuppressionV5",_a="OnesLike",Oa="OneHot",La="Pack",Ma="PadV2",Mr="Pow",Pa="Prelu",Ba="Prod",Bp="RaggedGather",zp="RaggedRange",Vp="RaggedTensorToTensor",Cu="Range",Iu="Real",Pr="Reciprocal",Br="Relu",za="Reshape",Va="ResizeNearestNeighbor",$u="ResizeNearestNeighborGrad",Wa="ResizeBilinear",ku="ResizeBilinearGrad",zr="Relu6",Ua="Reverse",Vr="Round",Wr="Rsqrt",Wp="ScatterNd",Up="TensorScatterUpdate",Gp="SearchSorted",Ga="Select",Ur="Selu",Ha="Slice",Gr="Sin",Hr="Sinh",qr="Sign",jr="Sigmoid",Kr="Softplus",Xr="Sqrt",qa="Sum",ja="SpaceToBatchND",Ka="SplitV",Xa="Softmax",Hp="SparseFillEmptyRows",qp="SparseReshape",jp="SparseSegmentMean",Kp="SparseSegmentSum",Xp="SparseToDense",Yr="SquaredDifference",vu="Square",Su="StaticRegexReplace",Nu="StridedSlice",Yp="StringNGrams",Zp="StringSplit",Qp="StringToHashBucketFast",Zr="Sub",Qr="Tan",Jr="Tanh",ei="Tile",Tu="TopK",Eu="Transform",To="Transpose",Ru="Unique",Ya="Unpack",Za="UnsortedSegmentSum",Qa="ZerosLike",ti="Step",bw="FromPixels",Au="RotateWithOffset",Ja="_FusedMatMul",el="FusedConv2D",Jp="FusedDepthwiseConv2D";function Yt(...n){V().getBool("IS_TEST")||V().getBool("PROD")||console.warn(...n)}function yw(...n){V().getBool("IS_TEST")||V().getBool("PROD")||console.log(...n)}const tl=Wc("kernelRegistry",()=>new Map),Du=Wc("gradRegistry",()=>new Map);function ef(n,e){const t=of(n,e);return tl.get(t)}function tf(n){return Du.get(n)}function nf(n){const e=tl.entries(),t=[];for(;;){const{done:s,value:o}=e.next();if(s)break;const[r,i]=o,[a]=r.split("_");a===n&&t.push(i)}return t}function sf(n){const{kernelName:e,backendName:t}=n,s=of(e,t);tl.has(s)&&Yt(`The kernel '${e}' for backend '${t}' is already registered`),tl.set(s,n)}function ww(n){const{kernelName:e}=n;Du.has(e)&&V().getBool("DEBUG")&&Yt(`Overriding the gradient for '${e}'`),Du.set(e,n)}function of(n,e){return`${e}_${n}`}function rf(n){return n instanceof Float32Array||n instanceof Int32Array||n instanceof Uint8Array||n instanceof Uint8ClampedArray}function Cw(n){return n&&n.__esModule&&Object.prototype.hasOwnProperty.call(n,"default")?n.default:n}function Iw(n){if(Object.prototype.hasOwnProperty.call(n,"__esModule"))return n;var e=n.default;if(typeof e=="function"){var t=function s(){var o=!1;try{o=this instanceof s}catch(r){}return o?Reflect.construct(e,arguments,this.constructor):e.apply(this,arguments)};t.prototype=e.prototype}else t={};return Object.defineProperty(t,"__esModule",{value:!0}),Object.keys(n).forEach(function(s){var o=Object.getOwnPropertyDescriptor(n,s);Object.defineProperty(t,s,o.get?o:{enumerable:!0,get:function(){return n[s]}})}),t}var Fu,af;function $w(){if(af)return Fu;af=1,Fu=e;var n=null;try{n=new WebAssembly.Instance(new WebAssembly.Module(new Uint8Array([0,97,115,109,1,0,0,0,1,13,2,96,0,1,127,96,4,127,127,127,127,1,127,3,7,6,0,1,1,1,1,1,6,6,1,127,1,65,0,11,7,50,6,3,109,117,108,0,1,5,100,105,118,95,115,0,2,5,100,105,118,95,117,0,3,5,114,101,109,95,115,0,4,5,114,101,109,95,117,0,5,8,103,101,116,95,104,105,103,104,0,0,10,191,1,6,4,0,35,0,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,126,34,4,66,32,135,167,36,0,32,4,167,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,127,34,4,66,32,135,167,36,0,32,4,167,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,128,34,4,66,32,135,167,36,0,32,4,167,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,129,34,4,66,32,135,167,36,0,32,4,167,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,130,34,4,66,32,135,167,36,0,32,4,167,11])),{}).exports}catch(v){}function e(v,I,R){this.low=v|0,this.high=I|0,this.unsigned=!!R}e.prototype.__isLong__,Object.defineProperty(e.prototype,"__isLong__",{value:!0});function t(v){return(v&&v.__isLong__)===!0}e.isLong=t;var s={},o={};function r(v,I){var R,F,O;return I?(v>>>=0,(O=0<=v&&v<256)&&(F=o[v],F)?F:(R=a(v,(v|0)<0?-1:0,!0),O&&(o[v]=R),R)):(v|=0,(O=-128<=v&&v<128)&&(F=s[v],F)?F:(R=a(v,v<0?-1:0,!1),O&&(s[v]=R),R))}e.fromInt=r;function i(v,I){if(isNaN(v))return I?b:x;if(I){if(v<0)return b;if(v>=f)return N}else{if(v<=-m)return T;if(v+1>=m)return $}return v<0?i(-v,I).neg():a(v%p|0,v/p|0,I)}e.fromNumber=i;function a(v,I,R){return new e(v,I,R)}e.fromBits=a;var l=Math.pow;function c(v,I,R){if(v.length===0)throw Error("empty string");if(v==="NaN"||v==="Infinity"||v==="+Infinity"||v==="-Infinity")return x;if(typeof I=="number"?(R=I,I=!1):I=!!I,R=R||10,R<2||36<R)throw RangeError("radix");var F;if((F=v.indexOf("-"))>0)throw Error("interior hyphen");if(F===0)return c(v.substring(1),I,R).neg();for(var O=i(l(R,8)),L=x,z=0;z<v.length;z+=8){var U=Math.min(8,v.length-z),W=parseInt(v.substring(z,z+U),R);if(U<8){var G=i(l(R,U));L=L.mul(G).add(i(W))}else L=L.mul(O),L=L.add(i(W))}return L.unsigned=I,L}e.fromString=c;function u(v,I){return typeof v=="number"?i(v,I):typeof v=="string"?c(v,I):a(v.low,v.high,typeof I=="boolean"?I:v.unsigned)}e.fromValue=u;var h=65536,d=1<<24,p=h*h,f=p*p,m=f/2,g=r(d),x=r(0);e.ZERO=x;var b=r(0,!0);e.UZERO=b;var w=r(1);e.ONE=w;var y=r(1,!0);e.UONE=y;var C=r(-1);e.NEG_ONE=C;var $=a(-1,2147483647,!1);e.MAX_VALUE=$;var N=a(-1,-1,!0);e.MAX_UNSIGNED_VALUE=N;var T=a(0,-2147483648,!1);e.MIN_VALUE=T;var S=e.prototype;return S.toInt=function(){return this.unsigned?this.low>>>0:this.low},S.toNumber=function(){return this.unsigned?(this.high>>>0)*p+(this.low>>>0):this.high*p+(this.low>>>0)},S.toString=function(I){if(I=I||10,I<2||36<I)throw RangeError("radix");if(this.isZero())return"0";if(this.isNegative())if(this.eq(T)){var R=i(I),F=this.div(R),O=F.mul(R).sub(this);return F.toString(I)+O.toInt().toString(I)}else return"-"+this.neg().toString(I);for(var L=i(l(I,6),this.unsigned),z=this,U="";;){var W=z.div(L),G=z.sub(W.mul(L)).toInt()>>>0,K=G.toString(I);if(z=W,z.isZero())return K+U;for(;K.length<6;)K="0"+K;U=""+K+U}},S.getHighBits=function(){return this.high},S.getHighBitsUnsigned=function(){return this.high>>>0},S.getLowBits=function(){return this.low},S.getLowBitsUnsigned=function(){return this.low>>>0},S.getNumBitsAbs=function(){if(this.isNegative())return this.eq(T)?64:this.neg().getNumBitsAbs();for(var I=this.high!=0?this.high:this.low,R=31;R>0&&(I&1<<R)==0;R--);return this.high!=0?R+33:R+1},S.isZero=function(){return this.high===0&&this.low===0},S.eqz=S.isZero,S.isNegative=function(){return!this.unsigned&&this.high<0},S.isPositive=function(){return this.unsigned||this.high>=0},S.isOdd=function(){return(this.low&1)===1},S.isEven=function(){return(this.low&1)===0},S.equals=function(I){return t(I)||(I=u(I)),this.unsigned!==I.unsigned&&this.high>>>31===1&&I.high>>>31===1?!1:this.high===I.high&&this.low===I.low},S.eq=S.equals,S.notEquals=function(I){return!this.eq(I)},S.neq=S.notEquals,S.ne=S.notEquals,S.lessThan=function(I){return this.comp(I)<0},S.lt=S.lessThan,S.lessThanOrEqual=function(I){return this.comp(I)<=0},S.lte=S.lessThanOrEqual,S.le=S.lessThanOrEqual,S.greaterThan=function(I){return this.comp(I)>0},S.gt=S.greaterThan,S.greaterThanOrEqual=function(I){return this.comp(I)>=0},S.gte=S.greaterThanOrEqual,S.ge=S.greaterThanOrEqual,S.compare=function(I){if(t(I)||(I=u(I)),this.eq(I))return 0;var R=this.isNegative(),F=I.isNegative();return R&&!F?-1:!R&&F?1:this.unsigned?I.high>>>0>this.high>>>0||I.high===this.high&&I.low>>>0>this.low>>>0?-1:1:this.sub(I).isNegative()?-1:1},S.comp=S.compare,S.negate=function(){return!this.unsigned&&this.eq(T)?T:this.not().add(w)},S.neg=S.negate,S.add=function(I){t(I)||(I=u(I));var R=this.high>>>16,F=this.high&65535,O=this.low>>>16,L=this.low&65535,z=I.high>>>16,U=I.high&65535,W=I.low>>>16,G=I.low&65535,K=0,Z=0,j=0,X=0;return X+=L+G,j+=X>>>16,X&=65535,j+=O+W,Z+=j>>>16,j&=65535,Z+=F+U,K+=Z>>>16,Z&=65535,K+=R+z,K&=65535,a(j<<16|X,K<<16|Z,this.unsigned)},S.subtract=function(I){return t(I)||(I=u(I)),this.add(I.neg())},S.sub=S.subtract,S.multiply=function(I){if(this.isZero())return x;if(t(I)||(I=u(I)),n){var R=n.mul(this.low,this.high,I.low,I.high);return a(R,n.get_high(),this.unsigned)}if(I.isZero())return x;if(this.eq(T))return I.isOdd()?T:x;if(I.eq(T))return this.isOdd()?T:x;if(this.isNegative())return I.isNegative()?this.neg().mul(I.neg()):this.neg().mul(I).neg();if(I.isNegative())return this.mul(I.neg()).neg();if(this.lt(g)&&I.lt(g))return i(this.toNumber()*I.toNumber(),this.unsigned);var F=this.high>>>16,O=this.high&65535,L=this.low>>>16,z=this.low&65535,U=I.high>>>16,W=I.high&65535,G=I.low>>>16,K=I.low&65535,Z=0,j=0,X=0,te=0;return te+=z*K,X+=te>>>16,te&=65535,X+=L*K,j+=X>>>16,X&=65535,X+=z*G,j+=X>>>16,X&=65535,j+=O*K,Z+=j>>>16,j&=65535,j+=L*G,Z+=j>>>16,j&=65535,j+=z*W,Z+=j>>>16,j&=65535,Z+=F*K+O*G+L*W+z*U,Z&=65535,a(X<<16|te,Z<<16|j,this.unsigned)},S.mul=S.multiply,S.divide=function(I){if(t(I)||(I=u(I)),I.isZero())throw Error("division by zero");if(n){if(!this.unsigned&&this.high===-2147483648&&I.low===-1&&I.high===-1)return this;var R=(this.unsigned?n.div_u:n.div_s)(this.low,this.high,I.low,I.high);return a(R,n.get_high(),this.unsigned)}if(this.isZero())return this.unsigned?b:x;var F,O,L;if(this.unsigned){if(I.unsigned||(I=I.toUnsigned()),I.gt(this))return b;if(I.gt(this.shru(1)))return y;L=b}else{if(this.eq(T)){if(I.eq(w)||I.eq(C))return T;if(I.eq(T))return w;var z=this.shr(1);return F=z.div(I).shl(1),F.eq(x)?I.isNegative()?w:C:(O=this.sub(I.mul(F)),L=F.add(O.div(I)),L)}else if(I.eq(T))return this.unsigned?b:x;if(this.isNegative())return I.isNegative()?this.neg().div(I.neg()):this.neg().div(I).neg();if(I.isNegative())return this.div(I.neg()).neg();L=x}for(O=this;O.gte(I);){F=Math.max(1,Math.floor(O.toNumber()/I.toNumber()));for(var U=Math.ceil(Math.log(F)/Math.LN2),W=U<=48?1:l(2,U-48),G=i(F),K=G.mul(I);K.isNegative()||K.gt(O);)F-=W,G=i(F,this.unsigned),K=G.mul(I);G.isZero()&&(G=w),L=L.add(G),O=O.sub(K)}return L},S.div=S.divide,S.modulo=function(I){if(t(I)||(I=u(I)),n){var R=(this.unsigned?n.rem_u:n.rem_s)(this.low,this.high,I.low,I.high);return a(R,n.get_high(),this.unsigned)}return this.sub(this.div(I).mul(I))},S.mod=S.modulo,S.rem=S.modulo,S.not=function(){return a(~this.low,~this.high,this.unsigned)},S.and=function(I){return t(I)||(I=u(I)),a(this.low&I.low,this.high&I.high,this.unsigned)},S.or=function(I){return t(I)||(I=u(I)),a(this.low|I.low,this.high|I.high,this.unsigned)},S.xor=function(I){return t(I)||(I=u(I)),a(this.low^I.low,this.high^I.high,this.unsigned)},S.shiftLeft=function(I){return t(I)&&(I=I.toInt()),(I&=63)===0?this:I<32?a(this.low<<I,this.high<<I|this.low>>>32-I,this.unsigned):a(0,this.low<<I-32,this.unsigned)},S.shl=S.shiftLeft,S.shiftRight=function(I){return t(I)&&(I=I.toInt()),(I&=63)===0?this:I<32?a(this.low>>>I|this.high<<32-I,this.high>>I,this.unsigned):a(this.high>>I-32,this.high>=0?0:-1,this.unsigned)},S.shr=S.shiftRight,S.shiftRightUnsigned=function(I){if(t(I)&&(I=I.toInt()),I&=63,I===0)return this;var R=this.high;if(I<32){var F=this.low;return a(F>>>I|R<<32-I,R>>>I,this.unsigned)}else return I===32?a(R,0,this.unsigned):a(R>>>I-32,0,this.unsigned)},S.shru=S.shiftRightUnsigned,S.shr_u=S.shiftRightUnsigned,S.toSigned=function(){return this.unsigned?a(this.low,this.high,!1):this},S.toUnsigned=function(){return this.unsigned?this:a(this.low,this.high,!0)},S.toBytes=function(I){return I?this.toBytesLE():this.toBytesBE()},S.toBytesLE=function(){var I=this.high,R=this.low;return[R&255,R>>>8&255,R>>>16&255,R>>>24,I&255,I>>>8&255,I>>>16&255,I>>>24]},S.toBytesBE=function(){var I=this.high,R=this.low;return[I>>>24,I>>>16&255,I>>>8&255,I&255,R>>>24,R>>>16&255,R>>>8&255,R&255]},e.fromBytes=function(I,R,F){return F?e.fromBytesLE(I,R):e.fromBytesBE(I,R)},e.fromBytesLE=function(I,R){return new e(I[0]|I[1]<<8|I[2]<<16|I[3]<<24,I[4]|I[5]<<8|I[6]<<16|I[7]<<24,R)},e.fromBytesBE=function(I,R){return new e(I[4]<<24|I[5]<<16|I[6]<<8|I[7],I[0]<<24|I[1]<<16|I[2]<<8|I[3],R)},Fu}var lf=$w(),cf=Cw(lf),kw=Ac({__proto__:null,default:cf},[lf]);const Ls=cf||kw;function nl(n){return Ls.fromString(n,!0,16)}const uf=nl("c3a5c85c97cb3127"),Ms=nl("b492b66fbe98f273"),Ft=nl("9ae16a3b2f90404f");function _u(n){return n.xor(n.shru(47))}function hf(n,e,t){const s=n.slice(e,e+t);return Ls.fromBytes(Array.from(s),!0,!0)}function Pe(n,e){return hf(n,e,8)}function df(n,e){return hf(n,e,4)}function ft(n,e){return e===0?n:n.shru(e).or(n.shl(64-e))}function ls(n,e,t=nl("9ddfea08eb382d69")){let s=n.xor(e).mul(t);s=s.xor(s.shru(47));let o=e.xor(s).mul(t);return o=o.xor(o.shru(47)),o=o.mul(t),o}function vw(n,e,t,s,o,r){o=o.add(n),r=ft(r.add(o).add(s),21);const i=o;return o=o.add(e),o=o.add(t),r=r.add(ft(o,44)),[o.add(s),r.add(i)]}function sl(n,e,t,s){return vw(Pe(n,e),Pe(n,e+8),Pe(n,e+16),Pe(n,e+24),t,s)}function Sw(n,e=n.length){if(e>=8){const t=Ft.add(e*2),s=Pe(n,0).add(Ft),o=Pe(n,e-8),r=ft(o,37).mul(t).add(s),i=ft(s,25).add(o).mul(t);return ls(r,i,t)}if(e>=4){const t=Ft.add(e*2),s=df(n,0);return ls(s.shl(3).add(e),df(n,e-4),t)}if(e>0){const t=n[0],s=n[e>>1],o=n[e-1],r=t+(s<<8),i=e+(o<<2);return _u(Ft.mul(r).xor(uf.mul(i))).mul(Ft)}return Ft}function Nw(n,e=n.length){const t=Ft.add(e*2),s=Pe(n,0).mul(Ms),o=Pe(n,8),r=Pe(n,e-8).mul(t),i=Pe(n,e-16).mul(Ft);return ls(ft(s.add(o),43).add(ft(r,30)).add(i),s.add(ft(o.add(Ft),18)).add(r),t)}function Tw(n,e=n.length){const t=Ft.add(e*2),s=Pe(n,0).mul(Ft),o=Pe(n,8),r=Pe(n,e-8).mul(t),i=Pe(n,e-16).mul(Ft),a=ft(s.add(o),43).add(ft(r,30)).add(i),l=ls(a,s.add(ft(o.add(Ft),18)).add(r),t),c=Pe(n,16).mul(t),u=Pe(n,24),h=a.add(Pe(n,e-32)).mul(t),d=l.add(Pe(n,e-24)).mul(t);return ls(ft(c.add(u),43).add(ft(h,30)).add(d),c.add(ft(u.add(s),18)).add(h),t)}function Ew(n,e=n.length){const t=Ls.fromNumber(81,!0);if(e<=32)return e<=16?Sw(n,e):Nw(n,e);if(e<=64)return Tw(n,e);let s=t,o=t.mul(Ms).add(113),r=_u(o.mul(Ft).add(113)).mul(Ft),i=[Ls.UZERO,Ls.UZERO],a=[Ls.UZERO,Ls.UZERO];s=s.mul(Ft).add(Pe(n,0));let l=0;const c=(e-1>>6)*64,u=c+(e-1&63)-63;do s=ft(s.add(o).add(i[0]).add(Pe(n,l+8)),37).mul(Ms),o=ft(o.add(i[1]).add(Pe(n,l+48)),42).mul(Ms),s=s.xor(a[1]),o=o.add(i[0]).add(Pe(n,l+40)),r=ft(r.add(a[0]),33).mul(Ms),i=sl(n,l,i[1].mul(Ms),s.add(a[0])),a=sl(n,l+32,r.add(a[1]),o.add(Pe(n,l+16))),[r,s]=[s,r],l+=64;while(l!==c);const h=Ms.add(r.and(255).shl(1));return l=u,a[0]=a[0].add(e-1&63),i[0]=i[0].add(a[0]),a[0]=a[0].add(i[0]),s=ft(s.add(o).add(i[0]).add(Pe(n,l+8)),37).mul(h),o=ft(o.add(i[1]).add(Pe(n,l+48)),42).mul(h),s=s.xor(a[1].mul(9)),o=o.add(i[0].mul(9).add(Pe(n,l+40))),r=ft(r.add(a[0]),33).mul(h),i=sl(n,l,i[1].mul(h),s.add(a[0])),a=sl(n,l+32,r.add(a[1]),o.add(Pe(n,l+16))),[r,s]=[s,r],ls(ls(i[0],a[0],h).add(_u(o).mul(uf)).add(r),ls(i[1],a[1],h).add(s),h)}function cs(n,e){return e==="string"?us(n):Ps([n],e)}function Rw(n,e){return n instanceof Float32Array&&e==="float32"||n instanceof Int32Array&&e==="int32"||n instanceof Uint8Array&&e==="bool"}function Ps(n,e){if(e==="string")throw new Error("Cannot convert a string[] to a TypedArray");if(Array.isArray(n)&&(n=Bs(n)),V().getBool("DEBUG")&&ow(n,e),Rw(n,e))return n;if(e==null||e==="float32"||e==="complex64")return new Float32Array(n);if(e==="int32")return new Int32Array(n);if(e==="bool"){const t=new Uint8Array(n.length);for(let s=0;s<t.length;++s)Math.round(n[s])!==0&&(t[s]=1);return t}else throw new Error(`Unknown data type ${e}`)}function Pt(){return V().platform.now()}function us(n,e="utf-8"){return e=e||"utf-8",V().platform.encode(n,e)}function hs(n,e="utf-8"){return e=e||"utf-8",V().platform.decode(n,e)}function nn(n){return V().platform.isTypedArray!=null?V().platform.isTypedArray(n):rf(n)}function Bs(n,e=[],t=!1){if(e==null&&(e=[]),typeof n=="boolean"||typeof n=="number"||typeof n=="string"||zc(n)||n==null||nn(n)&&t)e.push(n);else if(Array.isArray(n)||nn(n))for(let s=0;s<n.length;++s)Bs(n[s],e,t);else{let s=-1;for(const o of Object.keys(n))/^([1-9]+[0-9]*|0)$/.test(o)&&(s=Math.max(s,Number(o)));for(let o=0;o<=s;o++)Bs(n[o],e,t)}return e}class Aw{constructor(e,t){this.backendTimer=e,this.logger=t,t==null&&(this.logger=new Fw)}profileKernel(e,t,s){let o;const r=()=>{o=s()};let i;const a=Pt();if(this.backendTimer.timerAvailable())i=this.backendTimer.time(r);else{r();for(const c of o)c.dataSync();i=Promise.resolve({kernelMs:Pt()-a})}if(V().getBool("CHECK_COMPUTATION_FOR_ERRORS"))for(let c=0;c<o.length;c++){const u=o[c];u.data().then(h=>{Dw(h,u.dtype,e)})}return{kernelName:e,outputs:o,inputs:t,timeMs:i.then(c=>c.kernelMs),extraInfo:i.then(c=>c.getExtraProfileInfo!=null?c.getExtraProfileInfo():"")}}logKernelProfile(e){const{kernelName:t,outputs:s,timeMs:o,inputs:r,extraInfo:i}=e;s.forEach(a=>{Promise.all([a.data(),o,i]).then(l=>{this.logger.logKernelProfile(t,a,l[0],l[1],r,l[2])})})}}function Dw(n,e,t){if(e!=="float32")return!1;for(let s=0;s<n.length;s++){const o=n[s];if(isNaN(o)||!isFinite(o))return console.warn(`Found ${o} in the result of '${t}'`),!0}return!1}class Fw{logKernelProfile(e,t,s,o,r,i){const a=typeof o=="number"?ko(`${o}ms`,9):o.error,l=ko(e,25),c=t.rank,u=t.size,h=ko(t.shape.toString(),14);let d="";for(const p in r){const f=r[p];if(f!=null){const m=f.shape||t.shape,g=m.length;d+=`${p}: ${g}D ${g>0?m:""} `}}console.log(`%c${l}	%c${a}	%c${c}D ${h}	%c${u}	%c${d}	%c${i}`,"font-weight:bold","color:red","color:blue","color: orange","color: green","color: steelblue")}}function _w(n,e,t){const s={},o={};for(let l=0;l<e.length;l++)s[e[l].id]=!0;for(let l=0;l<n.length;l++){const c=n[l],u=c.inputs;for(const h in u){const d=u[h];let p=!1;for(let f=0;f<e.length;f++)if(s[d.id]){c.outputs.forEach(m=>s[m.id]=!0),p=!0,o[c.id]=!0;break}if(p)break}}const r={};r[t.id]=!0;const i={};for(let l=n.length-1;l>=0;l--){const c=n[l],u=c.inputs;for(let h=0;h<c.outputs.length;h++)if(r[c.outputs[h].id]){for(const d in u)r[u[d].id]=!0,i[c.id]=!0;break}}const a=[];for(let l=0;l<n.length;l++){const c=n[l];if(o[c.id]&&i[c.id]){const u={};for(const d in c.inputs){const p=c.inputs[d];s[p.id]&&(u[d]=p)}const h=Object.assign({},c);h.inputs=u,h.outputs=c.outputs,a.push(h)}}return a}function Ow(n,e,t,s){for(let o=e.length-1;o>=0;o--){const r=e[o],i=[];if(r.outputs.forEach(l=>{const c=n[l.id];c!=null?i.push(c):i.push(null)}),r.gradient==null)throw new Error(`Cannot compute gradient: gradient function not found for ${r.kernelName}.`);const a=r.gradient(i);for(const l in r.inputs){if(!(l in a))throw new Error(`Cannot backprop through input ${l}. Available gradients found: ${Object.keys(a)}.`);const c=t(()=>a[l]());if(c.dtype!=="float32")throw new Error(`Error in gradient for op ${r.kernelName}. The gradient of input ${l} must have 'float32' dtype, but has '${c.dtype}'`);const u=r.inputs[l];if(!Ee(c.shape,u.shape))throw new Error(`Error in gradient for op ${r.kernelName}. The gradient of input '${l}' has shape '${c.shape}', which does not match the shape of the input '${u.shape}'`);if(n[u.id]==null)n[u.id]=c;else{const h=n[u.id];n[u.id]=s(h,c),h.dispose()}}}}const pf=20,ni=3,Ou=7;function Lw(n,e,t,s){const o=ce(e),r=Mw(n,e,t,o),i=e.length,a=ol(n,e,t,o,r),l=["Tensor"];return s&&(l.push(`  dtype: ${t}`),l.push(`  rank: ${i}`),l.push(`  shape: [${e}]`),l.push("  values:")),l.push(a.map(c=>"    "+c).join(`
`)),l.join(`
`)}function Mw(n,e,t,s){const o=q(e),r=s[s.length-1],i=new Array(r).fill(0),a=e.length,l=t==="complex64"?oi(n):n;if(a>1)for(let c=0;c<o/r;c++){const u=c*r;for(let h=0;h<r;h++)i[h]=Math.max(i[h],si(l[u+h],0,t).length)}return i}function si(n,e,t){let s;return Array.isArray(n)?s=`${parseFloat(n[0].toFixed(Ou))} + ${parseFloat(n[1].toFixed(Ou))}j`:ir(n)?s=`'${n}'`:t==="bool"?s=ff(n):s=parseFloat(n.toFixed(Ou)).toString(),ko(s,e)}function ff(n){return n===0?"false":"true"}function ol(n,e,t,s,o,r=!0){const i=t==="complex64"?2:1,a=e[0],l=e.length;if(l===0){if(t==="complex64"){const m=oi(n);return[si(m[0],0,t)]}return t==="bool"?[ff(n[0])]:[n[0].toString()]}if(l===1){if(a>pf){const g=ni*i;let x=Array.from(n.slice(0,g)),b=Array.from(n.slice((a-ni)*i,a*i));return t==="complex64"&&(x=oi(x),b=oi(b)),["["+x.map((w,y)=>si(w,o[y],t)).join(", ")+", ..., "+b.map((w,y)=>si(w,o[a-ni+y],t)).join(", ")+"]"]}return["["+(t==="complex64"?oi(n):Array.from(n)).map((g,x)=>si(g,o[x],t)).join(", ")+"]"]}const c=e.slice(1),u=s.slice(1),h=s[0]*i,d=[];if(a>pf){for(let m=0;m<ni;m++){const g=m*h,x=g+h;d.push(...ol(n.slice(g,x),c,t,u,o,!1))}d.push("...");for(let m=a-ni;m<a;m++){const g=m*h,x=g+h;d.push(...ol(n.slice(g,x),c,t,u,o,m===a-1))}}else for(let m=0;m<a;m++){const g=m*h,x=g+h;d.push(...ol(n.slice(g,x),c,t,u,o,m===a-1))}const p=l===2?",":"";d[0]="["+(a>0?d[0]+p:"");for(let m=1;m<d.length-1;m++)d[m]=" "+d[m]+p;let f=`,
`;for(let m=2;m<l;m++)f+=`
`;return d[d.length-1]=" "+d[d.length-1]+"]"+(r?"":f),d}function oi(n){const e=[];for(let t=0;t<n.length;t+=2)e.push([n[t],n[t+1]]);return e}class bt{constructor(e,t,s){if(this.dtype=t,this.shape=e.slice(),this.size=q(e),s!=null){const o=s.length;k(o===this.size,()=>`Length of values '${o}' does not match the size inferred by the shape '${this.size}'.`)}if(t==="complex64")throw new Error("complex64 dtype TensorBuffers are not supported. Please create a TensorBuffer for the real and imaginary parts separately and call tf.complex(real, imag).");this.values=s||Qe(t,this.size),this.strides=ce(e)}set(e,...t){t.length===0&&(t=[0]),k(t.length===this.rank,()=>`The number of provided coordinates (${t.length}) must match the rank (${this.rank})`);const s=this.locToIndex(t);this.values[s]=e}get(...e){e.length===0&&(e=[0]);let t=0;for(const o of e){if(o<0||o>=this.shape[t]){const r=`Requested out of range element at ${e}.   Buffer shape=${this.shape}`;throw new Error(r)}t++}let s=e[e.length-1];for(let o=0;o<e.length-1;++o)s+=this.strides[o]*e[o];return this.values[s]}locToIndex(e){if(this.rank===0)return 0;if(this.rank===1)return e[0];let t=e[e.length-1];for(let s=0;s<e.length-1;++s)t+=this.strides[s]*e[s];return t}indexToLoc(e){if(this.rank===0)return[];if(this.rank===1)return[e];const t=new Array(this.shape.length);for(let s=0;s<t.length-1;++s)t[s]=Math.floor(e/this.strides[s]),e-=t[s]*this.strides[s];return t[t.length-1]=e,t}get rank(){return this.shape.length}toTensor(){return xn().makeTensor(this.values,this.shape,this.dtype)}}let xn=null,Eo=null;function Pw(n){xn=n}function Bw(n){Eo=n}class at{constructor(e,t,s,o){this.kept=!1,this.isDisposedInternal=!1,this.shape=e.slice(),this.dtype=t||"float32",this.size=q(e),this.strides=ce(e),this.dataId=s,this.id=o,this.rankType=this.rank<5?this.rank.toString():"higher"}get rank(){return this.shape.length}buffer(){return Y(this,null,function*(){const e=yield this.data();return Eo.buffer(this.shape,this.dtype,e)})}bufferSync(){return Eo.buffer(this.shape,this.dtype,this.dataSync())}array(){return Y(this,null,function*(){const e=yield this.data();return gn(this.shape,e,this.dtype==="complex64")})}arraySync(){return gn(this.shape,this.dataSync(),this.dtype==="complex64")}data(){return Y(this,null,function*(){this.throwIfDisposed();const e=xn().read(this.dataId);if(this.dtype==="string"){const t=yield e;try{return t.map(s=>hs(s))}catch(s){throw new Error("Failed to decode the string bytes into utf-8. To get the original bytes, call tensor.bytes().")}}return e})}dataToGPU(e){return this.throwIfDisposed(),xn().readToGPU(this.dataId,e)}dataSync(){this.throwIfDisposed();const e=xn().readSync(this.dataId);if(this.dtype==="string")try{return e.map(t=>hs(t))}catch(t){throw new Error("Failed to decode the string bytes into utf-8. To get the original bytes, call tensor.bytes().")}return e}bytes(){return Y(this,null,function*(){this.throwIfDisposed();const e=yield xn().read(this.dataId);return this.dtype==="string"?e:new Uint8Array(e.buffer)})}dispose(){this.isDisposed||(this.kerasMask&&this.kerasMask.dispose(),xn().disposeTensor(this),this.isDisposedInternal=!0)}get isDisposed(){return this.isDisposedInternal}throwIfDisposed(){if(this.isDisposed)throw new Error("Tensor is disposed.")}print(e=!1){return Eo.print(this,e)}clone(){return this.throwIfDisposed(),Eo.clone(this)}toString(e=!1){const t=this.dataSync();return Lw(t,this.shape,this.dtype,e)}cast(e){return this.throwIfDisposed(),Eo.cast(this,e)}variable(e=!0,t,s){return this.throwIfDisposed(),xn().makeVariable(this,e,t,s)}}Object.defineProperty(at,Symbol.hasInstance,{value:n=>!!n&&n.data!=null&&n.dataSync!=null&&n.throwIfDisposed!=null});function H(){return Wc("Tensor",()=>at)}H();class rl extends at{constructor(e,t,s,o){super(e.shape,e.dtype,e.dataId,o),this.trainable=t,this.name=s}assign(e){if(e.dtype!==this.dtype)throw new Error(`dtype of the new value (${e.dtype}) and previous value (${this.dtype}) must match`);if(!Ee(e.shape,this.shape))throw new Error(`shape of the new value (${e.shape}) and previous value (${this.shape}) must match`);xn().disposeTensor(this),this.dataId=e.dataId,xn().incRef(this,null)}dispose(){xn().disposeVariable(this),this.isDisposedInternal=!0}}Object.defineProperty(rl,Symbol.hasInstance,{value:n=>n instanceof at&&n.assign!=null&&n.assign instanceof Function});var mf;(function(n){n.R0="R0",n.R1="R1",n.R2="R2",n.R3="R3",n.R4="R4",n.R5="R5",n.R6="R6"})(mf||(mf={}));var Lu;(function(n){n.float32="float32",n.int32="int32",n.bool="int32",n.complex64="complex64"})(Lu||(Lu={}));var Mu;(function(n){n.float32="float32",n.int32="int32",n.bool="bool",n.complex64="complex64"})(Mu||(Mu={}));var Pu;(function(n){n.float32="float32",n.int32="float32",n.bool="float32",n.complex64="complex64"})(Pu||(Pu={}));var Bu;(function(n){n.float32="complex64",n.int32="complex64",n.bool="complex64",n.complex64="complex64"})(Bu||(Bu={}));const zw={float32:Pu,int32:Lu,bool:Mu,complex64:Bu};function Gt(n,e){if(n==="string"||e==="string"){if(n==="string"&&e==="string")return"string";throw new Error(`Can not upcast ${n} with ${e}`)}return zw[n][e]}function zu(n){return Gt(n,"int32")}function gf(n){return n!=null&&typeof n=="object"&&"texture"in n&&n.texture instanceof WebGLTexture}function xf(n){return typeof GPUBuffer!="undefined"&&n!=null&&typeof n=="object"&&"buffer"in n&&n.buffer instanceof GPUBuffer}function Je(n,e){if(n.dtype===e.dtype)return[n,e];const t=Gt(n.dtype,e.dtype);return[n.cast(t),e.cast(t)]}function bf(n){const e=[];return yf(n,e,new Set),e}function yf(n,e,t){if(n==null)return;if(n instanceof at){e.push(n);return}if(!Vw(n))return;const s=n;for(const o in s){const r=s[o];t.has(r)||(t.add(r),yf(r,e,t))}}function Vw(n){return Array.isArray(n)||typeof n=="object"}function Vu(n){return n.kernelName!=null}class wf{constructor(){this.registeredVariables={},this.nextTapeNodeId=0,this.numBytes=0,this.numTensors=0,this.numStringTensors=0,this.numDataBuffers=0,this.gradientDepth=0,this.kernelDepth=0,this.scopeStack=[],this.numDataMovesStack=[],this.nextScopeId=0,this.tensorInfo=new WeakMap,this.profiling=!1,this.activeProfile={newBytes:0,newTensors:0,peakBytes:0,kernels:[],result:null,get kernelNames(){return Array.from(new Set(this.kernels.map(e=>e.name)))}}}dispose(){for(const e in this.registeredVariables)this.registeredVariables[e].dispose()}}class Ro{constructor(e){this.ENV=e,this.registry={},this.registryFactory={},this.pendingBackendInitId=0,this.state=new wf}ready(){return Y(this,null,function*(){if(this.pendingBackendInit!=null)return this.pendingBackendInit.then(()=>{});if(this.backendInstance!=null)return;const e=this.getSortedBackends();for(let t=0;t<e.length;t++){const s=e[t];if(yield this.initializeBackend(s).success){yield this.setBackend(s);return}}throw new Error("Could not initialize any backends, all backend initializations failed.")})}get backend(){if(this.pendingBackendInit!=null)throw new Error(`Backend '${this.backendName}' has not yet been initialized. Make sure to await tf.ready() or await tf.setBackend() before calling other methods`);if(this.backendInstance==null){const{name:e,asyncInit:t}=this.initializeBackendsAndReturnBest();if(t)throw new Error(`The highest priority backend '${e}' has not yet been initialized. Make sure to await tf.ready() or await tf.setBackend() before calling other methods`);this.setBackend(e)}return this.backendInstance}backendNames(){return Object.keys(this.registryFactory)}findBackend(e){if(!(e in this.registry))if(e in this.registryFactory){const{asyncInit:t}=this.initializeBackend(e);if(t)return null}else return null;return this.registry[e]}findBackendFactory(e){return e in this.registryFactory?this.registryFactory[e].factory:null}registerBackend(e,t,s=1){return e in this.registryFactory?(Yt(`${e} backend was already registered. Reusing existing backend factory.`),!1):(this.registryFactory[e]={factory:t,priority:s},!0)}setBackend(e){return Y(this,null,function*(){if(this.registryFactory[e]==null)throw new Error(`Backend name '${e}' not found in registry`);if(this.backendName=e,this.registry[e]==null){this.backendInstance=null;const{success:t,asyncInit:s}=this.initializeBackend(e);if(!(s?yield t:t))return!1}return this.backendInstance=this.registry[e],this.setupRegisteredKernels(),this.profiler=new Aw(this.backendInstance),!0})}setupRegisteredKernels(){nf(this.backendName).forEach(t=>{t.setupFunc!=null&&t.setupFunc(this.backendInstance)})}disposeRegisteredKernels(e){nf(e).forEach(s=>{s.disposeFunc!=null&&s.disposeFunc(this.registry[e])})}initializeBackend(e){const t=this.registryFactory[e];if(t==null)throw new Error(`Cannot initialize backend ${e}, no registration found.`);try{const s=t.factory();if(s&&!(s instanceof Io)&&typeof s.then=="function"){const o=++this.pendingBackendInitId,r=s.then(i=>o<this.pendingBackendInitId?!1:(this.registry[e]=i,this.pendingBackendInit=null,!0)).catch(i=>(o<this.pendingBackendInitId||(this.pendingBackendInit=null,Yt(`Initialization of backend ${e} failed`),Yt(i.stack||i.message)),!1));return this.pendingBackendInit=r,{success:r,asyncInit:!0}}else return this.registry[e]=s,{success:!0,asyncInit:!1}}catch(s){return Yt(`Initialization of backend ${e} failed`),Yt(s.stack||s.message),{success:!1,asyncInit:!1}}}removeBackend(e){if(!(e in this.registryFactory))throw new Error(`${e} backend not found in registry`);this.backendName===e&&this.pendingBackendInit!=null&&this.pendingBackendInitId++,e in this.registry&&(this.disposeRegisteredKernels(e),this.registry[e].dispose(),delete this.registry[e]),delete this.registryFactory[e],this.backendName===e&&(this.pendingBackendInit=null,this.backendName=null,this.backendInstance=null)}getSortedBackends(){if(Object.keys(this.registryFactory).length===0)throw new Error("No backend found in registry.");return Object.keys(this.registryFactory).sort((e,t)=>this.registryFactory[t].priority-this.registryFactory[e].priority)}initializeBackendsAndReturnBest(){const e=this.getSortedBackends();for(let t=0;t<e.length;t++){const s=e[t],{success:o,asyncInit:r}=this.initializeBackend(s);if(r||o)return{name:s,asyncInit:r}}throw new Error("Could not initialize any backends, all backend initializations failed.")}moveData(e,t){const s=this.state.tensorInfo.get(t),o=s.backend,r=this.readSync(t),i=o.refCount(t);o.disposeData(t,!0),s.backend=e,e.move(t,r,s.shape,s.dtype,i),this.shouldCheckForMemLeaks()&&this.state.numDataMovesStack[this.state.numDataMovesStack.length-1]++}tidy(e,t){let s=null;if(t==null){if(typeof e!="function")throw new Error("Please provide a function to tidy()");t=e}else{if(typeof e!="string"&&!(e instanceof String))throw new Error("When calling with two arguments, the first argument to tidy() must be a string");if(typeof t!="function")throw new Error("When calling with two arguments, the 2nd argument to tidy() must be a function");s=e}let o;return this.scopedRun(()=>this.startScope(s),()=>this.endScope(o),()=>(o=t(),o instanceof Promise&&console.error("Cannot return a Promise inside of tidy."),o))}scopedRun(e,t,s){e();try{const o=s();return t(),o}catch(o){throw t(),o}}nextTensorId(){return Ro.nextTensorId++}nextVariableId(){return Ro.nextVariableId++}clone(e){const t=_.runKernel(Nr,{x:e}),s={x:e},o=i=>({x:()=>{const a="float32",l={x:i},c={dtype:a};return _.runKernel(fr,l,c)}}),r=[];return this.addTapeNode(this.state.activeScope.name,s,[t],o,r,{}),t}runKernel(e,t,s){if(this.backendName==null&&this.backend,!(ef(e,this.backendName)!=null))throw new Error(`Kernel '${e}' not registered for backend '${this.backendName}'`);return this.runKernelFunc({kernelName:e,inputs:t,attrs:s})}shouldCheckForMemLeaks(){return this.ENV.getBool("IS_TEST")}checkKernelForMemLeak(e,t,s){const o=this.backend.numDataIds();let r=0;s.forEach(l=>{r+=l.dtype==="complex64"?3:1});const i=this.state.numDataMovesStack[this.state.numDataMovesStack.length-1],a=o-t-r-i;if(a>0)throw new Error(`Backend '${this.backendName}' has an internal memory leak (${a} data ids) after running '${e}'`)}runKernelFunc(e){let t,s=[];const o=this.isTapeOn(),r=this.state.numBytes,i=this.state.numTensors;this.shouldCheckForMemLeaks()&&this.state.numDataMovesStack.push(0);let a;this.backendName==null&&this.backend;let l;const c=Vu(e)?e.kernelName:this.state.activeScope!=null?this.state.activeScope.name:"";if(Vu(e)){const{kernelName:f,inputs:m,attrs:g}=e;this.backendName==null&&this.backend;const x=ef(f,this.backendName);k(x!=null,()=>`Cannot find registered kernel '${f}' for backend '${this.backendName}'`),a=()=>{const b=this.backend.numDataIds();l=x.kernelFunc({inputs:m,attrs:g,backend:this.backend});const w=Array.isArray(l)?l:[l];this.shouldCheckForMemLeaks()&&this.checkKernelForMemLeak(f,b,w);const y=w.map(C=>C.rank!=null?C:this.makeTensorFromTensorInfo(C));if(o){const C=this.getTensorsForGradient(f,m,y);s=this.saveTensorsForBackwardMode(C)}return y}}else{const{forwardFunc:f}=e,m=g=>{o&&(s=g.map(x=>this.keep(this.clone(x))))};a=()=>{const g=this.backend.numDataIds();l=this.tidy(()=>f(this.backend,m));const x=Array.isArray(l)?l:[l];return this.shouldCheckForMemLeaks()&&this.checkKernelForMemLeak(c,g,x),x}}const{inputs:u,attrs:h}=e,d=Vu(e)?null:e.backwardsFunc;let p;return this.scopedRun(()=>this.state.kernelDepth++,()=>this.state.kernelDepth--,()=>{!this.ENV.getBool("DEBUG")&&!this.state.profiling?t=a():(p=this.profiler.profileKernel(c,u,()=>a()),this.ENV.getBool("DEBUG")&&this.profiler.logKernelProfile(p),t=p.outputs)}),o&&this.addTapeNode(c,u,t,d,s,h),this.state.profiling&&this.state.activeProfile.kernels.push({name:c,bytesAdded:this.state.numBytes-r,totalBytesSnapshot:this.state.numBytes,tensorsAdded:this.state.numTensors-i,totalTensorsSnapshot:this.state.numTensors,inputShapes:Object.keys(u).map(f=>u[f]!=null?u[f].shape:null),outputShapes:t.map(f=>f.shape),kernelTimeMs:p.timeMs,extraInfo:p.extraInfo}),Array.isArray(l)?t:t[0]}saveTensorsForBackwardMode(e){return e.map(s=>this.keep(this.clone(s)))}getTensorsForGradient(e,t,s){const o=tf(e);if(o!=null){const r=o.inputsToSave||[],i=o.outputsToSave||[];let a;o.saveAllInputs?(k(Array.isArray(t),()=>"saveAllInputs is true, expected inputs to be an array."),a=Object.keys(t).map(c=>t[c])):a=r.map(c=>t[c]);const l=s.filter((c,u)=>i[u]);return a.concat(l)}return[]}makeTensor(e,t,s,o){if(e==null)throw new Error("Values passed to engine.makeTensor() are null");s=s||"float32",o=o||this.backend;let r=e;s==="string"&&ir(e[0])&&(r=e.map(l=>us(l)));const i=o.write(r,t,s),a=new at(t,s,i,this.nextTensorId());if(this.trackTensor(a,o),s==="string"){const l=this.state.tensorInfo.get(i),c=iw(r);this.state.numBytes+=c-l.bytes,l.bytes=c}return a}makeTensorFromDataId(e,t,s,o){s=s||"float32";const r={dataId:e,shape:t,dtype:s};return this.makeTensorFromTensorInfo(r,o)}makeTensorFromTensorInfo(e,t){const{dataId:s,shape:o,dtype:r}=e,i=new at(o,r,s,this.nextTensorId());return this.trackTensor(i,t),i}makeVariable(e,t=!0,s,o){s=s||this.nextVariableId().toString(),o!=null&&o!==e.dtype&&(e=e.cast(o));const r=new rl(e,t,s,this.nextTensorId());if(this.state.registeredVariables[r.name]!=null)throw new Error(`Variable with name ${r.name} was already registered`);return this.state.registeredVariables[r.name]=r,this.incRef(r,this.backend),r}trackTensor(e,t){this.state.numTensors++,e.dtype==="string"&&this.state.numStringTensors++;let s=0;e.dtype!=="complex64"&&e.dtype!=="string"&&(s=e.size*Qi(e.dtype)),this.state.numBytes+=s,this.state.tensorInfo.has(e.dataId)||(this.state.numDataBuffers++,this.state.tensorInfo.set(e.dataId,{backend:t||this.backend,dtype:e.dtype,shape:e.shape,bytes:s})),e instanceof rl||this.track(e)}incRef(e,t){this.trackTensor(e,t),this.backend.incRef(e.dataId)}removeDataId(e,t){this.state.tensorInfo.has(e)&&this.state.tensorInfo.get(e).backend===t&&(this.state.tensorInfo.delete(e),this.state.numDataBuffers--)}disposeTensor(e){if(!this.state.tensorInfo.has(e.dataId))return;const t=this.state.tensorInfo.get(e.dataId);if(this.state.numTensors--,e.dtype==="string"&&(this.state.numStringTensors--,this.state.numBytes-=t.bytes),e.dtype!=="complex64"&&e.dtype!=="string"){const s=e.size*Qi(e.dtype);this.state.numBytes-=s}t.backend.disposeData(e.dataId)&&this.removeDataId(e.dataId,t.backend)}disposeVariables(){for(const e in this.state.registeredVariables){const t=this.state.registeredVariables[e];this.disposeVariable(t)}}disposeVariable(e){this.disposeTensor(e),this.state.registeredVariables[e.name]!=null&&delete this.state.registeredVariables[e.name]}memory(){const e=this.backend.memory();return e.numTensors=this.state.numTensors,e.numDataBuffers=this.state.numDataBuffers,e.numBytes=this.state.numBytes,this.state.numStringTensors>0&&(e.unreliable=!0,e.reasons==null&&(e.reasons=[]),e.reasons.push("Memory usage by string tensors is approximate (2 bytes per character)")),e}profile(e){return Y(this,null,function*(){this.state.profiling=!0;const t=this.state.numBytes,s=this.state.numTensors;this.state.activeProfile.kernels=[],this.state.activeProfile.result=yield e(),this.state.profiling=!1,this.state.activeProfile.peakBytes=Math.max(...this.state.activeProfile.kernels.map(o=>o.totalBytesSnapshot)),this.state.activeProfile.newBytes=this.state.numBytes-t,this.state.activeProfile.newTensors=this.state.numTensors-s;for(const o of this.state.activeProfile.kernels)o.kernelTimeMs=yield o.kernelTimeMs,o.extraInfo=yield o.extraInfo;return this.state.activeProfile})}isTapeOn(){return this.state.gradientDepth>0&&this.state.kernelDepth===0}addTapeNode(e,t,s,o,r,i){const a={id:this.state.nextTapeNodeId++,kernelName:e,inputs:t,outputs:s,saved:r},l=tf(e);l!=null&&(o=l.gradFunc),o!=null&&(a.gradient=c=>(c=c.map((u,h)=>{if(u==null){const d=s[h],p=St(d.size,d.dtype);return this.makeTensor(p,d.shape,d.dtype)}return u}),o(c.length>1?c:c[0],r,i))),this.state.activeTape.push(a)}keep(e){return e.kept=!0,e}startTape(){this.state.gradientDepth===0&&(this.state.activeTape=[]),this.state.gradientDepth++}endTape(){this.state.gradientDepth--}startScope(e){const t={track:[],name:"unnamed scope",id:this.state.nextScopeId++};e&&(t.name=e),this.state.scopeStack.push(t),this.state.activeScope=t}endScope(e){const t=bf(e),s=new Set(t.map(r=>r.id));for(let r=0;r<this.state.activeScope.track.length;r++){const i=this.state.activeScope.track[r];!i.kept&&!s.has(i.id)&&i.dispose()}const o=this.state.scopeStack.pop();this.state.activeScope=this.state.scopeStack.length===0?null:this.state.scopeStack[this.state.scopeStack.length-1],t.forEach(r=>{!r.kept&&r.scopeId===o.id&&this.track(r)})}gradients(e,t,s,o=!1){if(k(t.length>0,()=>"gradients() received an empty list of xs."),s!=null&&s.dtype!=="float32")throw new Error(`dy must have 'float32' dtype, but has '${s.dtype}'`);const r=this.scopedRun(()=>this.startTape(),()=>this.endTape(),()=>this.tidy("forward",e));k(r instanceof at,()=>"The result y returned by f() must be a tensor.");const i=_w(this.state.activeTape,t,r);if(!o&&i.length===0&&t.length>0)throw new Error("Cannot compute gradient of y=f(x) with respect to x. Make sure that the f you passed encloses all operations that lead from x to y.");return this.tidy("backward",()=>{const a={};a[r.id]=s==null?Ww(r.shape):s,Ow(a,i,c=>this.tidy(c),Uw);const l=t.map(c=>a[c.id]);return this.state.gradientDepth===0&&(this.state.activeTape.forEach(c=>{for(const u of c.saved)u.dispose()}),this.state.activeTape=null),{value:r,grads:l}})}customGrad(e){return k(Mc(e),()=>"The f passed in customGrad(f) must be a function."),(...t)=>{k(t.every(a=>a instanceof at),()=>"The args passed in customGrad(f)(x1, x2,...) must all be tensors");let s;const o={};t.forEach((a,l)=>{o[l]=a});const r=(a,l)=>(s=e(...t,l),k(s.value instanceof at,()=>"The function f passed in customGrad(f) must return an object where `obj.value` is a tensor"),k(Mc(s.gradFunc),()=>"The function f passed in customGrad(f) must return an object where `obj.gradFunc` is a function."),s.value),i=(a,l)=>{const c=s.gradFunc(a,l),u=Array.isArray(c)?c:[c];k(u.length===t.length,()=>"The function f passed in customGrad(f) must return an object where `obj.gradFunc` is a function that returns the same number of tensors as inputs passed to f(...)."),k(u.every(d=>d instanceof at),()=>"The function f passed in customGrad(f) must return an object where `obj.gradFunc` is a function that returns a list of only tensors.");const h={};return u.forEach((d,p)=>{h[p]=()=>d}),h};return this.runKernelFunc({forwardFunc:r,backwardsFunc:i,inputs:o})}}readSync(e){return this.state.tensorInfo.get(e).backend.readSync(e)}read(e){return this.state.tensorInfo.get(e).backend.read(e)}readToGPU(e,t){return this.state.tensorInfo.get(e).backend.readToGPU(e,t)}time(e){return Y(this,null,function*(){const t=Pt(),s=yield this.backend.time(e);return s.wallMs=Pt()-t,s})}track(e){return this.state.activeScope!=null&&(e.scopeId=this.state.activeScope.id,this.state.activeScope.track.push(e)),e}get registeredVariables(){return this.state.registeredVariables}reset(){this.pendingBackendInitId++,this.state.dispose(),this.ENV.reset(),this.state=new wf;for(const e in this.registry)this.disposeRegisteredKernels(e),this.registry[e].dispose(),delete this.registry[e];this.backendName=null,this.backendInstance=null,this.pendingBackendInit=null}}Ro.nextTensorId=0,Ro.nextVariableId=0;function Ww(n){const e=Bc(q(n),"float32");return _.makeTensor(e,n,"float32")}function Cf(){const n=Dp();if(n._tfengine==null){const e=new cw(n);n._tfengine=new Ro(e)}return pw(n._tfengine.ENV),Pw(()=>n._tfengine),n._tfengine}const _=Cf();function Uw(n,e){const t={a:n,b:e};return _.runKernel(No,t)}function Gw(){return typeof navigator!="undefined"&&navigator!=null}function If(n){if(n||Gw()){if(n||(n=navigator),n.product==="ReactNative")return!0;const e=n.userAgent||n.vendor||(typeof window!="undefined"?window.opera:"");if(!e){const t=n;return t.userAgentData&&t.userAgentData.mobile}return/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(e)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(e.substr(0,4))}return!1}function $f(){return typeof window!="undefined"&&window.document!=null||typeof WorkerGlobalScope!="undefined"}const Bt=V();Bt.registerFlag("DEBUG",()=>!1,n=>{n&&console.warn("Debugging mode is ON. The output of every math call will be downloaded to CPU and checked for NaNs. This significantly impacts performance.")}),Bt.registerFlag("IS_BROWSER",()=>$f()),Bt.registerFlag("IS_NODE",()=>typeof process!="undefined"&&typeof process.versions!="undefined"&&typeof process.versions.node!="undefined"),Bt.registerFlag("IS_CHROME",()=>typeof navigator!="undefined"&&navigator!=null&&navigator.userAgent!=null&&/Chrome/.test(navigator.userAgent)&&/Google Inc/.test(navigator.vendor)),Bt.registerFlag("IS_SAFARI",()=>typeof navigator!="undefined"&&navigator!=null&&navigator.userAgent!=null&&/Safari/.test(navigator.userAgent)&&/Apple/.test(navigator.vendor)),Bt.registerFlag("PROD",()=>!1),Bt.registerFlag("TENSORLIKE_CHECK_SHAPE_CONSISTENCY",()=>Bt.getBool("DEBUG")),Bt.registerFlag("DEPRECATION_WARNINGS_ENABLED",()=>!0),Bt.registerFlag("IS_TEST",()=>!1),Bt.registerFlag("CHECK_COMPUTATION_FOR_ERRORS",()=>Bt.getBool("DEBUG")),Bt.registerFlag("WRAP_TO_IMAGEBITMAP",()=>!1),Bt.registerFlag("CANVAS2D_WILL_READ_FREQUENTLY_FOR_GPU",()=>!1),Bt.registerFlag("USE_SETTIMEOUTCUSTOM",()=>!1);function il(n,e){let t=n;if(nn(n))return e==="string"?[]:[n.length];if(gf(n)){const o=n.channels||"RGBA";return[n.height,n.width*o.length]}else if(xf(n))return[n.buffer.size/(e==null?4:Qi(e))];if(!Array.isArray(n))return[];const s=[];for(;Array.isArray(t)||nn(t)&&e!=="string";)s.push(t.length),t=t[0];return Array.isArray(n)&&V().getBool("TENSORLIKE_CHECK_SHAPE_CONSISTENCY")&&kf(n,s,[]),s}function kf(n,e,t){if(t=t||[],!Array.isArray(n)&&!nn(n)){k(e.length===0,()=>`Element arr[${t.join("][")}] is a primitive, but should be an array/TypedArray of ${e[0]} elements`);return}k(e.length>0,()=>`Element arr[${t.join("][")}] should be a primitive, but is an array of ${n.length} elements`),k(n.length===e[0],()=>`Element arr[${t.join("][")}] should have ${e[0]} elements, but has ${n.length} elements`);const s=e.slice(1);for(let o=0;o<n.length;++o)kf(n[o],s,t.concat(o))}function vf(n,e,t,s){if(n!=="string_or_numeric"){if(n==null)throw new Error("Expected dtype cannot be null.");if(n!=="numeric"&&n!==e||n==="numeric"&&e==="string")throw new Error(`Argument '${t}' passed to '${s}' must be ${n} tensor, but got ${e} tensor`)}}function E(n,e,t,s="numeric"){if(n instanceof H())return vf(s,n.dtype,e,t),n;let o=vo(n);if(o!=="string"&&["bool","int32","float32"].indexOf(s)>=0&&(o=s),vf(s,o,e,t),n==null||!nn(n)&&!Array.isArray(n)&&typeof n!="number"&&typeof n!="boolean"&&typeof n!="string"){const l=n==null?"null":n.constructor.name;throw new Error(`Argument '${e}' passed to '${t}' must be a Tensor or TensorLike, but got '${l}'`)}const r=il(n,o);!nn(n)&&!Array.isArray(n)&&(n=[n]);const a=o!=="string"?Ps(n,o):Bs(n,[],!0);return _.makeTensor(a,r,o)}function Sf(n,e,t,s="numeric"){if(!Array.isArray(n))throw new Error(`Argument ${e} passed to ${t} must be a \`Tensor[]\` or \`TensorLike[]\``);return n.map((r,i)=>E(r,`${e}[${i}]`,t,s))}const Hw="__op";function P(n){const e=Object.keys(n);if(e.length!==1)throw new Error(`Please provide an object with a single key (operation name) mapping to a function. Got an object with ${e.length} keys.`);let t=e[0];const s=n[t];t.endsWith("_")&&(t=t.substring(0,t.length-1)),t=t+Hw;const o=(...r)=>{_.startScope(t);try{const i=s(...r);return zc(i)&&console.error("Cannot return a Promise inside of tidy."),_.endScope(i),i}catch(i){throw _.endScope(null),i}};return Object.defineProperty(o,"name",{value:t,configurable:!0}),o}function qw(n,e){const t=E(n,"real","complex"),s=E(e,"imag","complex");_c(t.shape,s.shape,`real and imag shapes, ${t.shape} and ${s.shape}, must match in call to tf.complex().`);const o={real:t,imag:s};return _.runKernel(Yc,o)}const zs=P({complex_:qw});function al(n,e,t,s){if(s==null)s=vo(n);else if(s==="complex64")throw new Error("Cannot construct a complex64 tensor directly. Please use tf.complex(real, imag).");if(xf(n)||gf(n)){if(s!=="float32"&&s!=="int32")throw new Error(`Creating tensor from GPU data only supports 'float32'|'int32' dtype, while the dtype is ${s}.`);return _.backend.createTensorFromGPUData(n,e||t,s)}if(!nn(n)&&!Array.isArray(n)&&typeof n!="number"&&typeof n!="boolean"&&typeof n!="string")throw new Error("values passed to tensor(values) must be a number/boolean/string or an array of numbers/booleans/strings, or a TypedArray");if(e!=null){Kn(e);const o=q(e),r=q(t);k(o===r,()=>`Based on the provided shape, [${e}], the tensor should have ${o} values but has ${r}`);for(let i=0;i<t.length;++i){const a=t[i],l=i===t.length-1?a!==q(e.slice(i)):!0;k(t[i]===e[i]||!l,()=>`Error creating a new Tensor. Inferred shape (${t}) does not match the provided shape (${e}). `)}}return!nn(n)&&!Array.isArray(n)&&(n=[n]),e=e||t,n=s!=="string"?Ps(n,s):Bs(n,[],!0),_.makeTensor(n,e,s)}function Vs(n,e,t){const s=il(n,t);return al(n,e,s,t)}const ll={float32:4,float16:2,int32:4,uint16:2,uint8:1,bool:1,complex64:8};class ds{static join(e){return new ds(e).slice()}constructor(e){if(this.shards=[],this.previousShardIndex=0,e==null||(e instanceof Array||(e=[e]),e=e.map(s=>nn(s)?s.buffer:s),e.length===0))return;this.bufferUniformSize=e[0].byteLength;let t=0;for(let s=0;s<e.length;s++){const o=e[s];s!==e.length-1&&o.byteLength!==this.bufferUniformSize&&(this.bufferUniformSize=void 0);const r=t+o.byteLength;this.shards.push({buffer:o,start:t,end:r}),t=r}this.shards.length===0&&(this.byteLength=0),this.byteLength=this.shards[this.shards.length-1].end}slice(e=0,t=this.byteLength){if(this.shards.length===0)return new ArrayBuffer(0);if(e=isNaN(Number(e))?0:e,t=isNaN(Number(t))?0:t,e=Math.max(0,e),t=Math.min(this.byteLength,t),t<=e)return new ArrayBuffer(0);const s=this.findShardForByte(e);if(s===-1)throw new Error(`Could not find start shard for byte ${e}`);const o=t-e,r=new ArrayBuffer(o),i=new Uint8Array(r);let a=0;for(let l=s;l<this.shards.length;l++){const c=this.shards[l],h=e+a-c.start,d=a,f=Math.min(t,c.end)-c.start,m=new Uint8Array(c.buffer,h,f-h);if(i.set(m,d),a+=m.length,t<c.end)break}return r}findShardForByte(e){if(this.shards.length===0||e<0||e>=this.byteLength)return-1;if(this.bufferUniformSize!=null)return this.previousShardIndex=Math.floor(e/this.bufferUniformSize),this.previousShardIndex;function t(o){return e<o.start?-1:e>=o.end?1:0}if(t(this.shards[this.previousShardIndex])===0)return this.previousShardIndex;const s=jw(this.shards,t);return s===-1?-1:(this.previousShardIndex=s,this.previousShardIndex)}}function jw(n,e){let t=0,s=n.length;for(;t<=s;){const o=Math.floor((s-t)/2)+t,r=e(n[o]);if(r===0)return o;r<0?s=o:t=o+1}return-1}function Kw(){V().set("PROD",!0)}function Ye(){return _}function ri(){return _.memory()}function B(n,e){return _.tidy(n,e)}function ge(n){bf(n).forEach(t=>t.dispose())}function An(n){return _.keep(n)}function Xw(n){return _.setBackend(n)}function Yw(){return _.ready()}function Nf(){return _.backendName}function Tf(n,e,t=1){return _.registerBackend(n,e,t)}function Ef(){return _.backend}const Ao=4;function Rf(n,e){return Y(this,null,function*(){const t=[],s=[],o=Array.isArray(n)?n.map(i=>i.name):Object.keys(n);for(let i=0;i<o.length;++i){const a=o[i],l=Array.isArray(n)?n[i].tensor:n[a];if(l.dtype!=="float32"&&l.dtype!=="int32"&&l.dtype!=="bool"&&l.dtype!=="string"&&l.dtype!=="complex64")throw new Error(`Unsupported dtype in weight '${a}': ${l.dtype}`);const c={name:a,shape:l.shape,dtype:l.dtype};if(l.dtype==="string"){const u=new Promise(h=>Y(null,null,function*(){const d=yield l.bytes(),p=d.reduce((g,x)=>g+x.length,0)+Ao*d.length,f=new Uint8Array(p);let m=0;for(let g=0;g<d.length;g++){const x=d[g],b=new Uint8Array(new Uint32Array([x.length]).buffer);f.set(b,m),m+=Ao,f.set(x,m),m+=x.length}h(f)}));s.push(u)}else s.push(l.data());e!=null&&(c.group=e),t.push(c)}const r=yield Promise.all(s);return{data:eC(r),specs:t}})}function Zw(n,e){const t=new ds(n),s={};let o=0;for(const r of e){const i=Qw(r,(a,l)=>t.slice(o+a,o+l));s[r.name]=Jw(r,t.slice(o,o+i)),o+=i}return s}function Qw(n,e){const t=q(n.shape);let s;if("quantization"in n){const o=n.quantization;s=ll[o.dtype]}else if(n.dtype==="string"){let o=0;for(let r=0;r<t;r++)o+=Ao+new Uint32Array(e(o,o+Ao))[0];return o}else s=ll[n.dtype];return t*s}function Jw(n,e){const t=n.name,s=n.dtype,o=n.shape,r=q(o);let i,a=0;if("quantization"in n){const l=n.quantization;if(l.dtype==="uint8"||l.dtype==="uint16"){if(!("min"in l&&"scale"in l))throw new Error(`Weight ${n.name} with quantization ${l.dtype} doesn't have corresponding metadata min and scale.`)}else if(l.dtype==="float16"){if(s!=="float32")throw new Error(`Weight ${n.name} is quantized with ${l.dtype} which only supports weights of type float32 not ${s}.`)}else throw new Error(`Weight ${n.name} has unknown quantization dtype ${l.dtype}. Supported quantization dtypes are: 'uint8', 'uint16', and 'float16'.`);const c=ll[l.dtype],u=l.dtype==="uint8"?new Uint8Array(e):new Uint16Array(e);if(s==="float32")if(l.dtype==="uint8"||l.dtype==="uint16"){i=new Float32Array(u.length);for(let h=0;h<u.length;h++){const d=u[h];i[h]=d*l.scale+l.min}}else if(l.dtype==="float16")i=uC()(u);else throw new Error(`Unsupported quantization type ${l.dtype} for weight type float32.`);else if(s==="int32"){if(l.dtype!=="uint8"&&l.dtype!=="uint16")throw new Error(`Unsupported quantization type ${l.dtype} for weight type int32.`);i=new Int32Array(u.length);for(let h=0;h<u.length;h++){const d=u[h];i[h]=Math.round(d*l.scale+l.min)}}else throw new Error(`Unsupported dtype in weight '${t}': ${s}`);a+=r*c}else if(s==="string"){const l=q(n.shape);i=[];for(let c=0;c<l;c++){const u=new Uint32Array(e.slice(a,a+Ao))[0];a+=Ao;const h=new Uint8Array(e.slice(a,a+u));i.push(h),a+=u}}else{const l=ll[s];if(s==="float32")i=new Float32Array(e);else if(s==="int32")i=new Int32Array(e);else if(s==="bool")i=new Uint8Array(e);else if(s==="complex64"){i=new Float32Array(e);const c=new Float32Array(i.length/2),u=new Float32Array(i.length/2);for(let f=0;f<c.length;f++)c[f]=i[f*2],u[f]=i[f*2+1];const h=Vs(c,o,"float32"),d=Vs(u,o,"float32"),p=zs(h,d);return h.dispose(),d.dispose(),p}else throw new Error(`Unsupported dtype in weight '${t}': ${s}`);a+=r*l}return Vs(i,o,s)}function eC(n){if(n===null)throw new Error(`Invalid input value: ${JSON.stringify(n)}`);let e=0;const t=[];n.forEach(r=>{if(e+=r.byteLength,t.push(r.byteLength===r.buffer.byteLength?r:new r.constructor(r)),!(r instanceof Float32Array||r instanceof Int32Array||r instanceof Uint8Array))throw new Error(`Unsupported TypedArray subtype: ${r.constructor.name}`)});const s=new Uint8Array(e);let o=0;return t.forEach(r=>{s.set(new Uint8Array(r.buffer),o),o+=r.byteLength}),s.buffer}const Wu=typeof Buffer!="undefined"&&(typeof Blob=="undefined"||typeof atob=="undefined"||typeof btoa=="undefined");function Af(n){return Wu?Buffer.byteLength(n,"utf8"):new Blob([n]).size}function tC(n){if(Wu)return Buffer.from(n).toString("base64");const e=new Uint8Array(n);let t="";for(let s=0,o=e.length;s<o;s++)t+=String.fromCharCode(e[s]);return btoa(t)}function nC(n){if(Wu){const s=Buffer.from(n,"base64");return s.buffer.slice(s.byteOffset,s.byteOffset+s.byteLength)}const e=atob(n),t=new Uint8Array(e.length);for(let s=0;s<e.length;++s)t.set([e.charCodeAt(s)],s);return t.buffer}function sC(n){return ds.join(n)}function oC(n,e){const t={modelTopology:n.modelTopology,format:n.format,generatedBy:n.generatedBy,convertedBy:n.convertedBy,weightsManifest:e};return n.signature!=null&&(t.signature=n.signature),n.userDefinedMetadata!=null&&(t.userDefinedMetadata=n.userDefinedMetadata),n.modelInitializer!=null&&(t.modelInitializer=n.modelInitializer),n.initializerSignature!=null&&(t.initializerSignature=n.initializerSignature),n.trainingConfig!=null&&(t.trainingConfig=n.trainingConfig),t}function rC(n,e,t){const s={modelTopology:n.modelTopology,format:n.format,generatedBy:n.generatedBy,convertedBy:n.convertedBy};if(n.trainingConfig!=null&&(s.trainingConfig=n.trainingConfig),n.weightsManifest!=null){if(!e)throw new Error("modelJSON has weightsManifest but weightSpecs is null");if(!t)throw new Error("modelJSON has weightsManifest but weightData is null");s.weightSpecs=e,s.weightData=t}return n.signature!=null&&(s.signature=n.signature),n.userDefinedMetadata!=null&&(s.userDefinedMetadata=n.userDefinedMetadata),n.modelInitializer!=null&&(s.modelInitializer=n.modelInitializer),n.initializerSignature!=null&&(s.initializerSignature=n.initializerSignature),s}function iC(n,e){return Y(this,null,function*(){let t,s;return n.weightsManifest!=null&&([t,s]=yield e(n.weightsManifest)),rC(n,t,s)})}function Uu(n){if(n.modelTopology instanceof ArrayBuffer)throw new Error("Expected JSON model topology, received ArrayBuffer.");return{dateSaved:new Date,modelTopologyType:"JSON",modelTopologyBytes:n.modelTopology==null?0:Af(JSON.stringify(n.modelTopology)),weightSpecsBytes:n.weightSpecs==null?0:Af(JSON.stringify(n.weightSpecs)),weightDataBytes:n.weightData==null?0:new ds(n.weightData).byteLength}}function Df(n){const e=[];for(const t of n)e.push(...t.weights);return e}function aC(){const n=t=>{let s=t<<13,o=0;for(;(s&8388608)===0;)o-=8388608,s<<=1;return s&=-8388609,o+=947912704,s|o},e=new Uint32Array(2048);e[0]=0;for(let t=1;t<1024;t++)e[t]=n(t);for(let t=1024;t<2048;t++)e[t]=939524096+(t-1024<<13);return e}function lC(){const n=new Uint32Array(64);n[0]=0,n[31]=1199570944,n[32]=2147483648,n[63]=3347054592;for(let e=1;e<31;e++)n[e]=e<<23;for(let e=33;e<63;e++)n[e]=2147483648+(e-32<<23);return n}function cC(){const n=new Uint32Array(64);for(let e=0;e<64;e++)n[e]=1024;return n[0]=n[32]=0,n}function uC(){const n=aC(),e=lC(),t=cC();return s=>{const o=new ArrayBuffer(4*s.length),r=new Uint32Array(o);for(let i=0;i<s.length;i++){const a=s[i],l=n[t[a>>10]+(a&1023)]+e[a>>10];r[i]=l}return new Float32Array(o)}}class mt{constructor(){this.saveRouters=[],this.loadRouters=[]}static getInstance(){return mt.instance==null&&(mt.instance=new mt),mt.instance}static registerSaveRouter(e){mt.getInstance().saveRouters.push(e)}static registerLoadRouter(e){mt.getInstance().loadRouters.push(e)}static getSaveHandlers(e){return mt.getHandlers(e,"save")}static getLoadHandlers(e,t){return mt.getHandlers(e,"load",t)}static getHandlers(e,t,s){const o=[];return(t==="load"?mt.getInstance().loadRouters:mt.getInstance().saveRouters).forEach(i=>{const a=i(e,s);a!==null&&o.push(a)}),o}}const hC=n=>mt.getSaveHandlers(n),dC=(n,e)=>mt.getLoadHandlers(n,e);const Gu="tensorflowjs",Hu=1,Ws="models_store",ps="model_info_store";function Ff(){if(!V().getBool("IS_BROWSER"))throw new Error("Failed to obtain IndexedDB factory because the current environmentis not a web browser.");const n=typeof window=="undefined"?self:window,e=n.indexedDB||n.mozIndexedDB||n.webkitIndexedDB||n.msIndexedDB||n.shimIndexedDB;if(e==null)throw new Error("The current browser does not appear to support IndexedDB.");return e}function qu(n){const e=n.result;e.createObjectStore(Ws,{keyPath:"modelPath"}),e.createObjectStore(ps,{keyPath:"modelPath"})}class Us{constructor(e){if(this.indexedDB=Ff(),e==null||!e)throw new Error("For IndexedDB, modelPath must not be null, undefined or empty.");this.modelPath=e}save(e){return Y(this,null,function*(){if(e.modelTopology instanceof ArrayBuffer)throw new Error("BrowserLocalStorage.save() does not support saving model topology in binary formats yet.");return this.databaseAction(this.modelPath,e)})}load(){return Y(this,null,function*(){return this.databaseAction(this.modelPath)})}databaseAction(e,t){return new Promise((s,o)=>{const r=this.indexedDB.open(Gu,Hu);r.onupgradeneeded=()=>qu(r),r.onsuccess=()=>{const i=r.result;if(t==null){const a=i.transaction(Ws,"readonly"),c=a.objectStore(Ws).get(this.modelPath);c.onsuccess=()=>{if(c.result==null)return i.close(),o(new Error(`Cannot find model with path '${this.modelPath}' in IndexedDB.`));s(c.result.modelArtifacts)},c.onerror=u=>(i.close(),o(c.error)),a.oncomplete=()=>i.close()}else{t.weightData=ds.join(t.weightData);const a=Uu(t),l=i.transaction(ps,"readwrite");let c=l.objectStore(ps),u;try{u=c.put({modelPath:this.modelPath,modelArtifactsInfo:a})}catch(d){return o(d)}let h;u.onsuccess=()=>{h=i.transaction(Ws,"readwrite");const d=h.objectStore(Ws);let p;try{p=d.put({modelPath:this.modelPath,modelArtifacts:t,modelArtifactsInfo:a})}catch(f){return o(f)}p.onsuccess=()=>s({modelArtifactsInfo:a}),p.onerror=f=>{c=l.objectStore(ps);const m=c.delete(this.modelPath);m.onsuccess=()=>(i.close(),o(p.error)),m.onerror=g=>(i.close(),o(p.error))}},u.onerror=d=>(i.close(),o(u.error)),l.oncomplete=()=>{h==null?i.close():h.oncomplete=()=>i.close()}}},r.onerror=i=>o(r.error)})}}Us.URL_SCHEME="indexeddb://";const _f=n=>V().getBool("IS_BROWSER")&&!Array.isArray(n)&&n.startsWith(Us.URL_SCHEME)?pC(n.slice(Us.URL_SCHEME.length)):null;mt.registerSaveRouter(_f),mt.registerLoadRouter(_f);function pC(n){return new Us(n)}function fC(n){return n.startsWith(Us.URL_SCHEME)?n.slice(Us.URL_SCHEME.length):n}class mC{constructor(){this.indexedDB=Ff()}listModels(){return Y(this,null,function*(){return new Promise((e,t)=>{const s=this.indexedDB.open(Gu,Hu);s.onupgradeneeded=()=>qu(s),s.onsuccess=()=>{const o=s.result,r=o.transaction(ps,"readonly"),a=r.objectStore(ps).getAll();a.onsuccess=()=>{const l={};for(const c of a.result)l[c.modelPath]=c.modelArtifactsInfo;e(l)},a.onerror=l=>(o.close(),t(a.error)),r.oncomplete=()=>o.close()},s.onerror=o=>t(s.error)})})}removeModel(e){return Y(this,null,function*(){return e=fC(e),new Promise((t,s)=>{const o=this.indexedDB.open(Gu,Hu);o.onupgradeneeded=()=>qu(o),o.onsuccess=()=>{const r=o.result,i=r.transaction(ps,"readwrite"),a=i.objectStore(ps),l=a.get(e);let c;l.onsuccess=()=>{if(l.result==null)return r.close(),s(new Error(`Cannot find model with path '${e}' in IndexedDB.`));{const u=a.delete(e),h=()=>{c=r.transaction(Ws,"readwrite");const p=c.objectStore(Ws).delete(e);p.onsuccess=()=>t(l.result.modelArtifactsInfo),p.onerror=f=>s(l.error)};u.onsuccess=h,u.onerror=d=>(h(),r.close(),s(l.error))}},l.onerror=u=>(r.close(),s(l.error)),i.oncomplete=()=>{c==null?r.close():c.oncomplete=()=>r.close()}},o.onerror=r=>s(o.error)})})}}const Xn="/",Do="tensorflowjs_models",Of="info",gC="model_topology",xC="weight_specs",bC="weight_data",yC="model_metadata";function Lf(n){return{info:[Do,n,Of].join(Xn),topology:[Do,n,gC].join(Xn),weightSpecs:[Do,n,xC].join(Xn),weightData:[Do,n,bC].join(Xn),modelMetadata:[Do,n,yC].join(Xn)}}function Mf(n){for(const e of Object.values(n))window.localStorage.removeItem(e)}function wC(n){const e=n.split(Xn);if(e.length<3)throw new Error(`Invalid key format: ${n}`);return e.slice(1,e.length-1).join(Xn)}function CC(n){return n.startsWith(Gs.URL_SCHEME)?n.slice(Gs.URL_SCHEME.length):n}class Gs{constructor(e){if(!V().getBool("IS_BROWSER")||typeof window=="undefined"||typeof window.localStorage=="undefined")throw new Error("The current environment does not support local storage.");if(this.LS=window.localStorage,e==null||!e)throw new Error("For local storage, modelPath must not be null, undefined or empty.");this.modelPath=e,this.keys=Lf(this.modelPath)}save(e){return Y(this,null,function*(){if(e.modelTopology instanceof ArrayBuffer)throw new Error("BrowserLocalStorage.save() does not support saving model topology in binary formats yet.");{const t=JSON.stringify(e.modelTopology),s=JSON.stringify(e.weightSpecs),o=Uu(e),r=ds.join(e.weightData);try{this.LS.setItem(this.keys.info,JSON.stringify(o)),this.LS.setItem(this.keys.topology,t),this.LS.setItem(this.keys.weightSpecs,s),this.LS.setItem(this.keys.weightData,tC(r));const i={format:e.format,generatedBy:e.generatedBy,convertedBy:e.convertedBy,signature:e.signature!=null?e.signature:void 0,userDefinedMetadata:e.userDefinedMetadata!=null?e.userDefinedMetadata:void 0,modelInitializer:e.modelInitializer!=null?e.modelInitializer:void 0,initializerSignature:e.initializerSignature!=null?e.initializerSignature:void 0,trainingConfig:e.trainingConfig!=null?e.trainingConfig:void 0};return this.LS.setItem(this.keys.modelMetadata,JSON.stringify(i)),{modelArtifactsInfo:o}}catch(i){throw Mf(this.keys),new Error(`Failed to save model '${this.modelPath}' to local storage: size quota being exceeded is a possible cause of this failure: modelTopologyBytes=${o.modelTopologyBytes}, weightSpecsBytes=${o.weightSpecsBytes}, weightDataBytes=${o.weightDataBytes}.`)}}})}load(){return Y(this,null,function*(){const e=JSON.parse(this.LS.getItem(this.keys.info));if(e==null)throw new Error(`In local storage, there is no model with name '${this.modelPath}'`);if(e.modelTopologyType!=="JSON")throw new Error("BrowserLocalStorage does not support loading non-JSON model topology yet.");const t={},s=JSON.parse(this.LS.getItem(this.keys.topology));if(s==null)throw new Error(`In local storage, the topology of model '${this.modelPath}' is missing.`);t.modelTopology=s;const o=JSON.parse(this.LS.getItem(this.keys.weightSpecs));if(o==null)throw new Error(`In local storage, the weight specs of model '${this.modelPath}' are missing.`);t.weightSpecs=o;const r=this.LS.getItem(this.keys.modelMetadata);if(r!=null){const a=JSON.parse(r);t.format=a.format,t.generatedBy=a.generatedBy,t.convertedBy=a.convertedBy,a.signature!=null&&(t.signature=a.signature),a.userDefinedMetadata!=null&&(t.userDefinedMetadata=a.userDefinedMetadata),a.modelInitializer!=null&&(t.modelInitializer=a.modelInitializer),a.initializerSignature!=null&&(t.initializerSignature=a.initializerSignature),a.trainingConfig!=null&&(t.trainingConfig=a.trainingConfig)}const i=this.LS.getItem(this.keys.weightData);if(i==null)throw new Error(`In local storage, the binary weight values of model '${this.modelPath}' are missing.`);return t.weightData=nC(i),t})}}Gs.URL_SCHEME="localstorage://";const Pf=n=>V().getBool("IS_BROWSER")&&!Array.isArray(n)&&n.startsWith(Gs.URL_SCHEME)?IC(n.slice(Gs.URL_SCHEME.length)):null;mt.registerSaveRouter(Pf),mt.registerLoadRouter(Pf);function IC(n){return new Gs(n)}class $C{constructor(){k(V().getBool("IS_BROWSER"),()=>"Current environment is not a web browser"),k(typeof window=="undefined"||typeof window.localStorage!="undefined",()=>"Current browser does not appear to support localStorage"),this.LS=window.localStorage}listModels(){return Y(this,null,function*(){const e={},t=Do+Xn,s=Xn+Of;for(let o=0;o<this.LS.length;++o){const r=this.LS.key(o);if(r.startsWith(t)&&r.endsWith(s)){const i=wC(r);e[i]=JSON.parse(this.LS.getItem(r))}}return e})}removeModel(e){return Y(this,null,function*(){e=CC(e);const t=Lf(e);if(this.LS.getItem(t.info)==null)throw new Error(`Cannot find model at path '${e}'`);const s=JSON.parse(this.LS.getItem(t.info));return Mf(t),s})}}const Bf="://";class Dn{constructor(){this.managers={}}static getInstance(){return Dn.instance==null&&(Dn.instance=new Dn),Dn.instance}static registerManager(e,t){k(e!=null,()=>"scheme must not be undefined or null."),e.endsWith(Bf)&&(e=e.slice(0,e.indexOf(Bf))),k(e.length>0,()=>"scheme must not be an empty string.");const s=Dn.getInstance();k(s.managers[e]==null,()=>`A model store manager is already registered for scheme '${e}'.`),s.managers[e]=t}static getManager(e){const t=Dn.getInstance().managers[e];if(t==null)throw new Error(`Cannot find model manager for scheme '${e}'`);return t}static getSchemes(){return Object.keys(Dn.getInstance().managers)}}class kC{constructor(){this.messageName="setTimeoutCustom",this.functionRefs=[],this.handledMessageCount=0,this.hasEventListener=!1}fetch(e,t){return fetch(e,t)}now(){return performance.now()}encode(e,t){if(t!=="utf-8"&&t!=="utf8")throw new Error(`Browser's encoder only supports utf-8, but got ${t}`);return this.textEncoder==null&&(this.textEncoder=new TextEncoder),this.textEncoder.encode(e)}decode(e,t){return new TextDecoder(t).decode(e)}setTimeoutCustom(e,t){if(typeof window=="undefined"||!V().getBool("USE_SETTIMEOUTCUSTOM")){setTimeout(e,t);return}this.functionRefs.push(e),setTimeout(()=>{window.postMessage({name:this.messageName,index:this.functionRefs.length-1},"*")},t),this.hasEventListener||(this.hasEventListener=!0,window.addEventListener("message",s=>{if(s.source===window&&s.data.name===this.messageName){s.stopPropagation();const o=this.functionRefs[s.data.index];o(),this.handledMessageCount++,this.handledMessageCount===this.functionRefs.length&&(this.functionRefs=[],this.handledMessageCount=0)}},!0))}isTypedArray(e){return rf(e)}}if(V().get("IS_BROWSER")){V().setPlatform("browser",new kC);try{Dn.registerManager(Gs.URL_SCHEME,new $C)}catch(n){}try{Dn.registerManager(Us.URL_SCHEME,new mC)}catch(n){}}const vC={importFetch:()=>require("node-fetch")};let ju;class SC{constructor(){this.util=require("util"),this.textEncoder=new this.util.TextEncoder}fetch(e,t){return V().global.fetch!=null?V().global.fetch(e,t):(ju==null&&(ju=vC.importFetch()),ju(e,t))}now(){const e=process.hrtime();return e[0]*1e3+e[1]/1e6}encode(e,t){if(t!=="utf-8"&&t!=="utf8")throw new Error(`Node built-in encoder only supports utf-8, but got ${t}`);return this.textEncoder.encode(e)}decode(e,t){return e.length===0?"":new this.util.TextDecoder(t).decode(e)}isTypedArray(e){return this.util.types.isFloat32Array(e)||this.util.types.isInt32Array(e)||this.util.types.isUint8Array(e)||this.util.types.isUint8ClampedArray(e)}}V().get("IS_NODE")&&!V().get("IS_BROWSER")&&V().setPlatform("node",new SC);function Ie(n,e="float32",t){return e=e||"float32",Kn(n),new bt(n,e,t)}function NC(n,e){const t=E(n,"x","cast");if(!rw(e))throw new Error(`Failed to cast to unknown dtype ${e}`);if(e==="string"&&t.dtype!=="string"||e!=="string"&&t.dtype==="string")throw new Error("Only strings can be casted to strings");const s={x:t},o={dtype:e};return _.runKernel(fr,s,o)}const oe=P({cast_:NC});function TC(n){const t={x:E(n,"x","clone","string_or_numeric")};return _.runKernel(Nr,t)}const Hs=P({clone_:TC});function EC(n,e=!1){console.log(n.toString(e))}Cf(),Bw({buffer:Ie,cast:oe,clone:Hs,print:EC});function RC(n,e){let t=E(n,"a","add"),s=E(e,"b","add");[t,s]=Je(t,s);const o={a:t,b:s};return _.runKernel(No,o)}const ee=P({add_:RC});function AC(n,e){let t=E(n,"a","floorDiv"),s=E(e,"b","floorDiv");[t,s]=Je(t,s);const o={a:t,b:s};return _.runKernel(vr,o)}const zf=P({floorDiv_:AC});function DC(n,e){let t=E(n,"a","div"),s=E(e,"b","div");if([t,s]=Je(t,s),t.dtype==="int32"&&s.dtype==="int32")return zf(t,s);const o={a:t,b:s},r={};return _.runKernel(yr,o,r)}const he=P({div_:DC});function FC(n,e){let t=E(n,"a","mul"),s=E(e,"b","mul");[t,s]=Je(t,s);const o={a:t,b:s};return _.runKernel(Lr,o)}const D=P({mul_:FC});function _C(n){const e=E(n,"x","abs");if(e.dtype==="complex64"){const t={x:e};return _.runKernel(ia,t)}else{const t={x:e};return _.runKernel(Ji,t)}}const _t=P({abs_:_C});function OC(n){const t={x:E(n,"x","acos")};return _.runKernel(ar,t)}const LC=P({acos_:OC});function MC(n){const t={x:E(n,"x","acosh")};return _.runKernel(lr,t)}const PC=P({acosh_:MC});function BC(n,e=null,t=!1){const o={x:E(n,"x","all","bool")},r={axis:e,keepDims:t};return _.runKernel(Gc,o,r)}const Vf=P({all_:BC});function zC(n,e=null,t=!1){const o={x:E(n,"x","any","bool")},r={axis:e,keepDims:t};return _.runKernel(Hc,o,r)}const Ku=P({any_:zC});function VC(n,e=0){const s={x:E(n,"x","argMax")},o={axis:e};return _.runKernel(ea,s,o)}const qs=P({argMax_:VC});function WC(n,e=0){const s={x:E(n,"x","argMin")},o={axis:e};return _.runKernel(ta,s,o)}const UC=P({argMin_:WC});function GC(n){const t={x:E(n,"x","asin")};return _.runKernel(cr,t)}const HC=P({asin_:GC});function qC(n){const t={x:E(n,"x","asinh")};return _.runKernel(ur,t)}const jC=P({asinh_:qC});function KC(n){const t={x:E(n,"x","atan")};return _.runKernel(hr,t)}const XC=P({atan_:KC});function YC(n,e){let t=E(n,"a","atan2"),s=E(e,"b","atan2");[t,s]=Je(t,s);const o={a:t,b:s};return _.runKernel(pr,o)}const ZC=P({atan2_:YC});function QC(n){const t={x:E(n,"x","atanh")};return _.runKernel(dr,t)}const JC=P({atanh_:QC});function ii(n,e,t,s,o="NHWC",r){const i=n[3],a=[...e,i],l=Zn(o);return yt(n,a,t,r,s,null,null,l)}function sn(n,e,t,s,o,r,i="channelsLast"){const[a,l]=ai(e);let c;if(i==="channelsLast")c=[a,l,n[3],n[3]];else if(i==="channelsFirst")c=[a,l,n[1],n[1]];else throw new Error(`Unknown dataFormat ${i}`);return yt(n,c,t,s,o,r,!1,i)}function Yn(n,e,t,s,o,r,i="NDHWC"){const[a,l,c]=Yu(e);let u,h;if(i==="NDHWC")h="channelsLast",u=[a,l,c,n[4],n[4]];else if(i==="NCDHW")h="channelsFirst",u=[a,l,c,n[1],n[1]];else throw new Error(`Unknown dataFormat ${i}`);return fs(n,u,t,s,o,!1,h,r)}function yt(n,e,t,s,o,r,i=!1,a="channelsLast"){let[l,c,u,h]=[-1,-1,-1,-1];if(a==="channelsLast")[l,c,u,h]=n;else if(a==="channelsFirst")[l,h,c,u]=n;else throw new Error(`Unknown dataFormat ${a}`);const[d,p,,f]=e,[m,g]=ai(t),[x,b]=ai(s),w=Fo(d,x),y=Fo(p,b),{padInfo:C,outHeight:$,outWidth:N}=nI(o,c,u,m,g,w,y,r,a),T=i?f*h:f;let S;return a==="channelsFirst"?S=[l,T,$,N]:a==="channelsLast"&&(S=[l,$,N,T]),{batchSize:l,dataFormat:a,inHeight:c,inWidth:u,inChannels:h,outHeight:$,outWidth:N,outChannels:T,padInfo:C,strideHeight:m,strideWidth:g,filterHeight:d,filterWidth:p,effectiveFilterHeight:w,effectiveFilterWidth:y,dilationHeight:x,dilationWidth:b,inShape:n,outShape:S,filterShape:e}}function fs(n,e,t,s,o,r=!1,i="channelsLast",a){let[l,c,u,h,d]=[-1,-1,-1,-1,-1];if(i==="channelsLast")[l,c,u,h,d]=n;else if(i==="channelsFirst")[l,d,c,u,h]=n;else throw new Error(`Unknown dataFormat ${i}`);const[p,f,m,,g]=e,[x,b,w]=Yu(t),[y,C,$]=Yu(s),N=Fo(p,y),T=Fo(f,C),S=Fo(m,$),{padInfo:v,outDepth:I,outHeight:R,outWidth:F}=sI(o,c,u,h,x,b,w,N,T,S,a),O=r?g*d:g;let L;return i==="channelsFirst"?L=[l,O,I,R,F]:i==="channelsLast"&&(L=[l,I,R,F,O]),{batchSize:l,dataFormat:i,inDepth:c,inHeight:u,inWidth:h,inChannels:d,outDepth:I,outHeight:R,outWidth:F,outChannels:O,padInfo:v,strideDepth:x,strideHeight:b,strideWidth:w,filterDepth:p,filterHeight:f,filterWidth:m,effectiveFilterDepth:N,effectiveFilterHeight:T,effectiveFilterWidth:S,dilationDepth:y,dilationHeight:C,dilationWidth:$,inShape:n,outShape:L,filterShape:e}}function eI(n,e,t,s,o){s==null&&(s=Xu(n,e,t));const r=n[0],i=n[1],a=li((r-e+2*s)/t+1,o),l=li((i-e+2*s)/t+1,o);return[a,l]}function tI(n,e,t,s,o,r){o==null&&(o=Xu(n,e[0],s[0]));const i=[0,0,0,t];for(let a=0;a<3;a++)n[a]+2*o>=e[a]&&(i[a]=li((n[a]-e[a]+2*o)/s[a]+1,r));return i}function Xu(n,e,t,s=1){const o=Fo(e,s);return Math.floor((n[0]*(t-1)-t+o)/2)}function ai(n){return typeof n=="number"?[n,n,n]:n.length===2?[n[0],n[1],1]:n}function Yu(n){return typeof n=="number"?[n,n,n]:n}function Fo(n,e){return e<=1?n:n+(n-1)*(e-1)}function nI(n,e,t,s,o,r,i,a,l){let c,u,h;if(typeof n=="number"){c={top:n,bottom:n,left:n,right:n,type:n===0?"VALID":"NUMBER"};const p=eI([e,t],r,s,n,a);u=p[0],h=p[1]}else if(n==="same"){u=Math.ceil(e/s),h=Math.ceil(t/o);const d=Math.max(0,(u-1)*s+r-e),p=Math.max(0,(h-1)*o+i-t),f=Math.floor(d/2),m=d-f,g=Math.floor(p/2),x=p-g;c={top:f,bottom:m,left:g,right:x,type:"SAME"}}else if(n==="valid")c={top:0,bottom:0,left:0,right:0,type:"VALID"},u=Math.ceil((e-r+1)/s),h=Math.ceil((t-i+1)/o);else if(typeof n=="object"){const d=l==="channelsLast"?n[1][0]:n[2][0],p=l==="channelsLast"?n[1][1]:n[2][1],f=l==="channelsLast"?n[2][0]:n[3][0],m=l==="channelsLast"?n[2][1]:n[3][1];c={top:d,bottom:p,left:f,right:m,type:d===0&&p===0&&f===0&&m===0?"VALID":"EXPLICIT"},u=li((e-r+d+p)/s+1,a),h=li((t-i+f+m)/o+1,a)}else throw Error(`Unknown padding parameter: ${n}`);return{padInfo:c,outHeight:u,outWidth:h}}function sI(n,e,t,s,o,r,i,a,l,c,u){let h,d,p,f;if(n==="valid"&&(n=0),typeof n=="number"){h={top:n,bottom:n,left:n,right:n,front:n,back:n,type:n===0?"VALID":"NUMBER"};const g=tI([e,t,s,1],[a,l,c],1,[o,r,i],n,u);d=g[0],p=g[1],f=g[2]}else if(n==="same"){d=Math.ceil(e/o),p=Math.ceil(t/r),f=Math.ceil(s/i);const m=(d-1)*o+a-e,g=(p-1)*r+l-t,x=(f-1)*i+c-s,b=Math.floor(m/2),w=m-b,y=Math.floor(g/2),C=g-y,$=Math.floor(x/2),N=x-$;h={top:y,bottom:C,left:$,right:N,front:b,back:w,type:"SAME"}}else throw Error(`Unknown padding parameter: ${n}`);return{padInfo:h,outDepth:d,outHeight:p,outWidth:f}}function li(n,e){if(!e)return Math.trunc(n);switch(e){case"round":return Math.round(n);case"ceil":return Math.ceil(n);case"floor":return Math.floor(n);default:throw new Error(`Unknown roundingMode ${e}`)}}function js(n){const[e,t,s]=ai(n);return e===1&&t===1&&s===1}function Nt(n,e){return js(n)||js(e)}function Ks(n){return ai(n).every(e=>e>0)}function Zn(n){if(n==="NHWC")return"channelsLast";if(n==="NCHW")return"channelsFirst";throw new Error(`Unknown dataFormat ${n}`)}function zt(n,e,t){if(t!=null){if(typeof e=="string")throw Error(`Error in ${n}: pad must be an integer when using dimRoundingMode ${t} but got pad ${e}.`);if(typeof e=="number")k($o(e),()=>`Error in ${n}: pad must be an integer when using dimRoundingMode ${t} but got pad ${e}.`);else if(typeof e=="object")e.forEach(s=>{s.forEach(o=>{k($o(o),()=>`Error in ${n}: pad must be an integer when using dimRoundingMode ${t} but got pad ${o}.`)})});else throw Error(`Error in ${n}: Unknown padding parameter: ${e}`)}}function oI(n,e){const s={x:E(n,"x","reshape","string_or_numeric")},o={shape:e};return _.runKernel(za,s,o)}const M=P({reshape_:oI});function rI(n,e,t,s,o){const r=E(n,"x","avgPool","float32"),i=1;k(Nt(t,i),()=>`Error in avgPool: Either strides or dilations must be 1. Got strides ${t} and dilations '${i}'`);let a=r,l=!1;r.rank===3&&(l=!0,a=M(r,[1,r.shape[0],r.shape[1],r.shape[2]])),k(a.rank===4,()=>`Error in avgPool: x must be rank 4 but got rank ${a.rank}.`),zt("avgPool",s,o);const c={x:a},u={filterSize:e,strides:t,pad:s,dimRoundingMode:o};let h=_.runKernel(na,c,u);return h=oe(h,r.dtype),l?M(h,[h.shape[1],h.shape[2],h.shape[3]]):h}const Zu=P({avgPool_:rI});function iI(n,e,t,s,o,r="NDHWC"){const i=E(n,"x","avgPool3d","float32");let a=i,l=!1;i.rank===4&&(l=!0,a=M(i,[1,i.shape[0],i.shape[1],i.shape[2],i.shape[3]])),k(a.rank===5,()=>`Error in avgPool3d: x must be rank 5 but got rank ${a.rank}.`),k(r==="NDHWC",()=>`Error in avgPool3d: Only NDHWC is currently supported, but got dataFormat of ${r}`),k(typeof t=="number"&&t>0||Array.isArray(t)&&t[0]>0&&t[1]>0&&t[2]>0,()=>`Error in avgPool3d: Stride must be > 0, but got '${t}'`),zt("avgPool3d",s,o);const c={x:a},u={filterSize:e,strides:t,pad:s,dimRoundingMode:o,dataFormat:r};let h=_.runKernel(sa,c,u);return h=oe(h,a.dtype),l?M(h,[h.shape[1],h.shape[2],h.shape[3],h.shape[4]]):h}const aI=P({avgPool3d_:iI});function lI(n,e=0){k(n.length>=1,()=>"Pass at least one tensor to concat");const t=Sf(n,"tensors","concat","string_or_numeric");if(t[0].dtype==="complex64"&&t.forEach(r=>{if(r.dtype!=="complex64")throw new Error(`Cannot concatenate complex64 tensors with a tensor
          with dtype ${r.dtype}. `)}),t.length===1)return Hs(t[0]);const s=t,o={axis:e};return _.runKernel(aa,s,o)}const Tt=P({concat_:lI});function cI(n,e,t=!1,s=!1){let o=E(n,"a","matMul"),r=E(e,"b","matMul");[o,r]=Je(o,r);const i={a:o,b:r},a={transposeA:t,transposeB:s};return _.runKernel(oa,i,a)}const Te=P({matMul_:cI});function uI(n){const t={x:E(n,"x","sigmoid","float32")};return _.runKernel(jr,t)}const _o=P({sigmoid_:uI});function hI(n,e,t){const s=E(n,"x","slice","string_or_numeric");if(s.rank===0)throw new Error("Slicing scalar is not possible");const o={x:s},r={begin:e,size:t};return _.runKernel(Ha,o,r)}const Be=P({slice_:hI});function dI(n){const t={x:E(n,"x","tanh","float32")};return _.runKernel(Jr,t)}const cl=P({tanh_:dI});function pI(n,e,t){const s=E(n,"x","batchToSpaceND"),o=e.reduce((a,l)=>a*l);k(s.rank>=1+e.length,()=>`input rank is ${s.rank} but should be > than blockShape.length ${e.length}`),k(t.length===e.length,()=>`crops.length is ${t.length} but should be equal to blockShape.length  ${e.length}`),k(s.shape[0]%o===0,()=>`input tensor batch is ${s.shape[0]} but is not divisible by the product of the elements of blockShape ${e.join(" * ")} === ${o}`);const r={x:s},i={blockShape:e,crops:t};return _.runKernel(ra,r,i)}const Qu=P({batchToSpaceND_:pI});function fI(n){let e;return n.rank===0||n.rank===1?e=M(n,[1,1,1,n.size]):n.rank===2?e=M(n,[1,1,n.shape[0],n.shape[1]]):n.rank===3?e=M(n,[1,n.shape[0],n.shape[1],n.shape[2]]):e=n,e}function mI(n,e,t,s,o,r){r==null&&(r=.001);const i=E(n,"x","batchNorm"),a=E(e,"mean","batchNorm"),l=E(t,"variance","batchNorm");let c;o!=null&&(c=E(o,"scale","batchNorm"));let u;s!=null&&(u=E(s,"offset","batchNorm")),k(a.rank===l.rank,()=>"Batch normalization gradient requires mean and variance to have equal ranks."),k(u==null||a.rank===u.rank,()=>"Batch normalization gradient requires mean and offset to have equal ranks."),k(c==null||a.rank===c.rank,()=>"Batch normalization gradient requires mean and scale to have equal ranks.");const d={x:fI(i),scale:c,offset:u,mean:a,variance:l},p={varianceEpsilon:r},f=_.runKernel(ga,d,p);return M(f,i.shape)}const ul=P({batchNorm_:mI});function gI(n,e,t,s,o,r){const i=E(n,"x","batchNorm"),a=E(e,"mean","batchNorm"),l=E(t,"variance","batchNorm");let c;o!=null&&(c=E(o,"scale","batchNorm"));let u;return s!=null&&(u=E(s,"offset","batchNorm")),k(i.rank===2,()=>`Error in batchNorm2D: x must be rank 2 but got rank ${i.rank}.`),k(a.rank===2||a.rank===1,()=>`Error in batchNorm2D: mean must be rank 2 or rank 1 but got rank ${a.rank}.`),k(l.rank===2||l.rank===1,()=>`Error in batchNorm2D: variance must be rank 2 or rank 1 but got rank ${l.rank}.`),c!=null&&k(c.rank===2||c.rank===1,()=>`Error in batchNorm2D: scale must be rank 2 or rank 1 but got rank ${c.rank}.`),u!=null&&k(u.rank===2||u.rank===1,()=>`Error in batchNorm2D: offset must be rank 2 or rank 1 but got rank ${u.rank}.`),ul(i,a,l,u,c,r)}const xI=P({batchNorm2d_:gI});function bI(n,e,t,s,o,r){const i=E(n,"x","batchNorm"),a=E(e,"mean","batchNorm"),l=E(t,"variance","batchNorm");let c;o!=null&&(c=E(o,"scale","batchNorm"));let u;return s!=null&&(u=E(s,"offset","batchNorm")),k(i.rank===3,()=>`Error in batchNorm3D: x must be rank 3 but got rank ${i.rank}.`),k(a.rank===3||a.rank===1,()=>`Error in batchNorm3D: mean must be rank 3 or rank 1 but got rank ${a.rank}.`),k(l.rank===3||l.rank===1,()=>`Error in batchNorm3D: variance must be rank 3 or rank 1 but got rank ${l.rank}.`),c!=null&&k(c.rank===3||c.rank===1,()=>`Error in batchNorm3D: scale must be rank 3 or rank 1 but got rank ${c.rank}.`),u!=null&&k(u.rank===3||u.rank===1,()=>`Error in batchNorm3D: offset must be rank 3 or rank 1 but got rank ${u.rank}.`),ul(i,a,l,u,c,r)}const yI=P({batchNorm3d_:bI});function wI(n,e,t,s,o,r){const i=E(n,"x","batchNorm"),a=E(e,"mean","batchNorm"),l=E(t,"variance","batchNorm");let c;o!=null&&(c=E(o,"scale","batchNorm"));let u;return s!=null&&(u=E(s,"offset","batchNorm")),k(i.rank===4,()=>`Error in batchNorm4D: x must be rank 4 but got rank ${i.rank}.`),k(a.rank===4||a.rank===1,()=>`Error in batchNorm4D: mean must be rank 4 or rank 1 but got rank ${a.rank}.`),k(l.rank===4||l.rank===1,()=>`Error in batchNorm4D: variance must be rank 4 or rank 1 but got rank ${l.rank}.`),c!=null&&k(c.rank===4||c.rank===1,()=>`Error in batchNorm4D: scale must be rank 4 or rank 1 but got rank ${c.rank}.`),u!=null&&k(u.rank===4||u.rank===1,()=>`Error in batchNorm4D: offset must be rank 4 or rank 1 but got rank ${u.rank}.`),ul(i,a,l,u,c,r)}const CI=P({batchNorm4d_:wI});function II(n,e,t){const s=E(n,"x","bincount"),o=E(e,"weights","bincount");k(s.dtype==="int32",()=>`Error in bincount: input dtype must be int32, but got ${s.dtype}`),k(t>=0,()=>`size must be non-negative, but got ${t}.`),k(o.size===s.size||o.size===0,()=>`Error in bincount: weights must have the same size as input or0-length, but got input shape: ${s.shape}, weights shape: ${o.shape}.`);const r={x:s,weights:o},i={size:t};return _.runKernel(Kc,r,i)}const $I=P({bincount_:II});function kI(n,e){let t=E(n,"broadcastTo","x");const s=t.shape;if(Kn(e),e.length<t.rank)throw new Error(`broadcastTo(): shape.length=${e.length} < input.rank=${t.rank}.`);if(e.length>t.rank){const c=t.shape.slice();for(;c.length<e.length;)c.unshift(1);t=M(t,c)}const o=t.shape,r=Array.from(e);for(let c=e.length-1;c>=0;c--)if(o[c]===e[c])r[c]=1;else if(t.shape[c]!==1)throw new Error(`broadcastTo(): [${s}] cannot be broadcast to [${e}].`);if(r.map((c,u)=>c>1?u:-1).filter(c=>c>=0).length===0)return Hs(t);const a={x:t},l={reps:r};return _.runKernel(ei,a,l)}const ci=P({broadcastTo_:kI});function vI(n){const t={x:E(n,"x","ceil","float32")};return _.runKernel(mr,t)}const SI=P({ceil_:vI});function ui(n,e,t){Kn(n),t=t||vo(e);const s={shape:n,value:e,dtype:t};return _.runKernel(hu,{},s)}function NI(n,e,t){const s=E(n,"x","clipByValue");if(k(e<=t,()=>`Error in clip: min (${e}) must be less than or equal to max (${t}).`),e===t)return ui(s.shape,e,s.dtype);const o={x:s},r={clipValueMin:e,clipValueMax:t};return _.runKernel(gr,o,r)}const Zt=P({clipByValue_:NI});function TI(n){return Tt(n,0)}const EI=P({concat1d_:TI});function RI(n,e){return Tt(n,e)}const AI=P({concat2d_:RI});function DI(n,e){return Tt(n,e)}const FI=P({concat3d_:DI});function _I(n,e){return Tt(n,e)}const OI=P({concat4d_:_I});function LI(n,e,t,s,o="NHWC",r=[1,1],i){const a=E(n,"x","conv2d","float32"),l=E(e,"filter","conv2d","float32");let c=a,u=!1;a.rank===3&&(u=!0,c=M(a,[1,a.shape[0],a.shape[1],a.shape[2]])),k(c.rank===4,()=>`Error in conv2d: input must be rank 4, but got rank ${c.rank}.`),k(l.rank===4,()=>`Error in conv2d: filter must be rank 4, but got rank ${l.rank}.`),zt("conv2d",s,i);const h=o==="NHWC"?c.shape[3]:c.shape[1];k(h===l.shape[2],()=>`Error in conv2d: depth of input (${h}) must match input depth for filter ${l.shape[2]}.`),k(Nt(t,r),()=>`Error in conv2D: Either strides or dilations must be 1. Got strides ${t} and dilations '${r}'`),k(Ks(r),()=>"Error in conv2D: Dilated rates should be larger than 0."),k(Ks(t),()=>"Error in conv2D: Strides should be larger than 0.");const d={x:c,filter:l},p={strides:t,pad:s,dataFormat:o,dilations:r,dimRoundingMode:i},f=_.runKernel(la,d,p);return u?M(f,[f.shape[1],f.shape[2],f.shape[3]]):f}const Xs=P({conv2d_:LI});function MI(n,e,t,s,o="NWC",r=1,i){const a=E(n,"x","conv1d"),l=E(e,"filter","conv1d");let c=a,u=!1;a.rank===2&&(u=!0,c=M(a,[1,a.shape[0],a.shape[1]])),k(c.rank===3,()=>`Error in conv1d: input must be rank 3, but got rank ${c.rank}.`),k(l.rank===3,()=>`Error in conv1d: filter must be rank 3, but got rank ${l.rank}.`),zt("conv1d",s,i),k(c.shape[2]===l.shape[1],()=>`Error in conv1d: depth of input (${c.shape[2]}) must match input depth for filter ${l.shape[1]}.`),k(Nt(t,r),()=>`Error in conv1D: Either stride or dilation must be 1. Got stride ${t} and dilation '${r}'`),k(Ks(r),()=>"Error in conv1D: Dilated rates should be larger than 0."),k(Ks(t),()=>"Error in conv1D: Stride should be larger than 0."),k(o==="NWC",()=>`Error in conv1d: got dataFormat of ${o} but only NWC is currently supported.`);const h=M(l,[1,l.shape[0],l.shape[1],l.shape[2]]),d=M(c,[c.shape[0],1,c.shape[1],c.shape[2]]),g=Xs(d,h,[1,t],s,"NHWC",[1,r],i);return u?M(g,[g.shape[2],g.shape[3]]):M(g,[g.shape[0],g.shape[2],g.shape[3]])}const Wf=P({conv1d_:MI});function PI(n,e,t,s,o,r="NHWC",i){k(n.length===e.rank,()=>`Length of inShape (${n.length}) and rank of dy (${e.rank}) must match`);let a=n,l=e,c=!1;e.rank===3&&(c=!0,l=M(e,[1,e.shape[0],e.shape[1],e.shape[2]]),a=[1,n[0],n[1],n[2]]),k(a.length===4,()=>`Error in conv2dDerInput: inShape must be length 4, but got length ${a.length}.`),k(l.rank===4,()=>`Error in conv2dDerInput: dy must be rank 4, but got rank ${l.rank}`),k(t.rank===4,()=>`Error in conv2dDerInput: filter must be rank 4, but got rank ${t.rank}`);const u=r==="NHWC"?a[3]:a[1],h=r==="NHWC"?l.shape[3]:l.shape[1];k(u===t.shape[2],()=>`Error in conv2dDerInput: depth of input (${u}) must match input depth for filter ${t.shape[2]}.`),k(h===t.shape[3],()=>`Error in conv2dDerInput: depth of output (${h}) must match output depth for filter ${t.shape[3]}.`),zt("conv2dDerInput",o,i);const d={dy:l,filter:t},p={strides:s,pad:o,dataFormat:r,dimRoundingMode:i,inputShape:a},f=_.runKernel(ca,d,p);return c?M(f,[f.shape[1],f.shape[2],f.shape[3]]):f}const Ju=P({conv2DBackpropInput_:PI});function BI(n,e,t,s,o,r){const i=E(n,"x","conv2dTranspose"),a=E(e,"filter","conv2dTranspose");return Ju(t,i,a,s,o,"NHWC",r)}const Uf=P({conv2dTranspose_:BI});function zI(n,e,t,s,o="NDHWC",r=[1,1,1]){const i=E(n,"x","conv3d"),a=E(e,"filter","conv3d");let l=i,c=!1;i.rank===4&&(c=!0,l=M(i,[1,i.shape[0],i.shape[1],i.shape[2],i.shape[3]])),k(l.rank===5,()=>`Error in conv3d: input must be rank 5, but got rank ${l.rank}.`),k(a.rank===5,()=>`Error in conv3d: filter must be rank 5, but got rank ${a.rank}.`),k(l.shape[4]===a.shape[3],()=>`Error in conv3d: depth of input (${l.shape[4]}) must match input depth for filter ${a.shape[3]}.`),k(Nt(t,r),()=>`Error in conv3D: Either strides or dilations must be 1. Got strides ${t} and dilations '${r}'`),k(o==="NDHWC",()=>`Error in conv3d: got dataFormat of ${o} but only NDHWC is currently supported.`),k(Ks(r),()=>"Error in conv3D: Dilated rates should be larger than 0."),k(Ks(t),()=>"Error in conv3D: Strides should be larger than 0.");const u={x:l,filter:a},h={strides:t,pad:s,dataFormat:o,dilations:r},d=_.runKernel(ua,u,h);return c?M(d,[d.shape[1],d.shape[2],d.shape[3],d.shape[4]]):d}const hl=P({conv3d_:zI});function VI(n,e,t,s,o){k(n.length===e.rank,()=>`Length of inShape (${n.length}) and rank of dy (${e.rank}) must match`);let r=n,i=e,a=!1;e.rank===4&&(a=!0,i=M(e,[1,e.shape[0],e.shape[1],e.shape[2],e.shape[3]]),r=[1,n[0],n[1],n[2],n[3]]);const l=r[4],c=i.shape[4];k(r.length===5,()=>`Error in conv3dDerInput: inShape must be length 5, but got length ${r.length}.`),k(i.rank===5,()=>`Error in conv3dDerInput: dy must be rank 5, but got rank ${i.rank}`),k(t.rank===5,()=>`Error in conv3dDerInput: filter must be rank 5, but got rank ${t.rank}`),k(l===t.shape[3],()=>`Error in conv3dDerInput: depth of input (${l}) must match input depth for filter ${t.shape[3]}.`),k(c===t.shape[4],()=>`Error in conv3dDerInput: depth of output (${c}) must match output depth for filter ${t.shape[4]}.`);const u={dy:i,filter:t},h={pad:o,strides:s,inputShape:r},d=_.runKernel(Jc,u,h);return a?M(d,[d.shape[1],d.shape[2],d.shape[3],d.shape[4]]):d}const Gf=P({conv3DBackpropInput_:VI});function WI(n,e,t,s,o){const r=E(n,"x","conv3dTranspose"),i=E(e,"filter","conv3dTranspose");return Gf(t,r,i,s,o)}const UI=P({conv3dTranspose_:WI});function GI(n){const t={x:E(n,"x","cos","float32")};return _.runKernel(xr,t)}const eh=P({cos_:GI});function HI(n){const t={x:E(n,"x","cosh","float32")};return _.runKernel(br,t)}const Hf=P({cosh_:HI});function qI(n,e=0,t=!1,s=!1){const r={x:E(n,"x","cumprod")},i={axis:e,exclusive:t,reverse:s};return _.runKernel(eu,r,i)}const th=P({cumprod_:qI});function jI(n,e=0,t=!1,s=!1){const r={x:E(n,"x","cumsum")},i={axis:e,exclusive:t,reverse:s};return _.runKernel(ha,r,i)}const qf=P({cumsum_:jI});function KI(n,e,t,s=!1){const o=E(n,"x","denseBincount"),r=E(e,"weights","denseBincount");k(o.dtype==="int32",()=>`Error in denseBincount: input dtype must be int32, but got ${o.dtype}`),k(o.rank<=2,()=>`Error in denseBincount: input must be at most rank 2, but got rank ${o.rank}.`),k(t>=0,()=>`size must be non-negative, but got ${t}.`),k(r.size===o.size||r.size===0,()=>`Error in denseBincount: weights must have the same shape as x or 0-length, but got x shape: ${o.shape}, weights shape: ${r.shape}.`);const i={x:o,weights:r},a={size:t,binaryOutput:s};return _.runKernel(nu,i,a)}const jf=P({denseBincount_:KI});function XI(n,e,t="NHWC"){const s=E(n,"x","depthToSpace","float32"),o=t==="NHWC"?s.shape[1]:s.shape[2],r=t==="NHWC"?s.shape[2]:s.shape[3],i=t==="NHWC"?s.shape[3]:s.shape[1];k(e>1,()=>`blockSize should be > 1 for depthToSpace, but was: ${e}`),k(o*e>=0,()=>`Negative dimension size caused by overflow when multiplying
    ${o} and ${e}  for depthToSpace with input shape
    ${s.shape}`),k(r*e>=0,()=>`Negative dimension size caused by overflow when multiplying
    ${r} and ${e} for depthToSpace with input shape
        ${s.shape}`),k(i%(e*e)===0,()=>`Dimension size must be evenly divisible by ${e*e} but is ${i} for depthToSpace with input shape ${s.shape}`);const a={x:s},l={blockSize:e,dataFormat:t};return _.runKernel(su,a,l)}const YI=P({depthToSpace_:XI});function ZI(n,e,t,s,o="NHWC",r=[1,1],i){const a=E(n,"x","depthwiseConv2d","float32"),l=E(e,"filter","depthwiseConv2d","float32");let c=a,u=!1;a.rank===3&&(u=!0,c=M(a,[1,a.shape[0],a.shape[1],a.shape[2]])),k(c.rank===4,()=>`Error in depthwiseConv2d: input must be rank 4, but got rank ${c.rank}.`),k(l.rank===4,()=>`Error in depthwiseConv2d: filter must be rank 4, but got rank ${l.rank}.`);const h=o==="NHWC"?c.shape[3]:c.shape[1];k(h===l.shape[2],()=>`Error in depthwiseConv2d: number of input channels (${h}) must match the inChannels dimension in filter ${l.shape[2]}.`),zt("depthwiseConv2d",s,i);const d={x:c,filter:l},p={strides:t,pad:s,dataFormat:o,dilations:r,dimRoundingMode:i},f=_.runKernel(da,d,p);return u?M(f,[f.shape[1],f.shape[2],f.shape[3]]):f}const nh=P({depthwiseConv2d_:ZI});function QI(n,e,t,s,o=[1,1],r="NHWC"){const i=E(n,"x","dilation2d"),a=E(e,"filter","dilation2d");k(i.rank===3||i.rank===4,()=>`Error in dilation2d: input must be rank 3 or 4, but got rank ${i.rank}.`),k(a.rank===3,()=>`Error in dilation2d: filter must be rank 3, but got rank ${a.rank}.`),k(r==="NHWC",()=>`Error in dilation2d: Only NHWC is currently supported, but got dataFormat of ${r}`);let l=i,c=!1;i.rank===3&&(l=M(i,[1,i.shape[0],i.shape[1],i.shape[2]]),c=!0),k(l.shape[3]===a.shape[2],()=>`Error in dilation2d:  input and filter must have the same depth: ${l.shape[3]} vs ${a.shape[2]}`);const u={x:l,filter:a},h={strides:t,pad:s,dilations:o},d=_.runKernel(pa,u,h);return c?M(d,[d.shape[1],d.shape[2],d.shape[3]]):d}const JI=P({dilation2d_:QI});function Oo(n,e){const t=n.length,s=[];for(let o=0;o<t;o++){const r=t-1-o,i=n[r]||1;(e[e.length-1-o]||1)>1&&i===1&&s.unshift(r)}return s}function lt(n,e){const t=[];for(let s=0;s<e.length;s++){const o=n[n.length-s-1],r=e.length-s-1,i=e[r];(o==null||o===1&&i>1)&&t.unshift(r)}return t}function xe(n,e){const t=Math.max(n.length,e.length),s=new Array(t);for(let o=0;o<t;o++){let r=n[n.length-o-1];r==null&&(r=1);let i=e[e.length-o-1];if(i==null&&(i=1),r===1)s[t-o-1]=i;else if(i===1)s[t-o-1]=r;else if(r!==i){const a=`Operands could not be broadcast together with shapes ${n} and ${e}.`;throw Error(a)}else s[t-o-1]=r}return s}function e$(n,e){let t=E(n,"a","equal","string_or_numeric"),s=E(e,"b","equal","string_or_numeric");[t,s]=Je(t,s),xe(t.shape,s.shape);const o={a:t,b:s};return _.runKernel(fa,o)}const Fn=P({equal_:e$});function t$(n,e,t){const s=E(e,"a","where"),o=E(t,"b","where"),r=E(n,"condition","where","bool"),i=xe(xe(r.shape,s.shape),o.shape),a=ci(r,i),l=ci(s,i),c=ci(o,i),u={condition:a,t:l,e:c};return _.runKernel(Ga,u)}const wt=P({where_:t$});function n$(n){const t={x:E(n,"x","zerosLike")};return _.runKernel(Qa,t)}const ke=P({zerosLike_:n$});function s$(n,e){let t=E(n,"a","div"),s=E(e,"b","div");[t,s]=Je(t,s);const o=he(t,s),r=ke(o),i=Fn(s,r);return wt(i,r,o)}const o$=P({divNoNan_:s$});function r$(n,e){const t=E(n,"t1","dot"),s=E(e,"t2","dot");k((t.rank===1||t.rank===2)&&(s.rank===1||s.rank===2),()=>`Error in dot: inputs must all be rank 1 or 2, but got ranks ${t.rank} and ${s.rank}.`);const o=t.rank===1?t.size:t.shape[1],r=s.rank===1?s.size:s.shape[0];if(k(o===r,()=>`Error in dot: inner dimensions of inputs must match, but got ${o} and ${r}.`),t.rank===1&&s.rank===1){const i=M(t,[1,-1]),a=M(s,[-1,1]),l=Te(i,a);return M(l,[])}else if(t.rank===1&&s.rank===2){const i=M(t,[1,-1]),a=M(s,[s.shape[0],s.shape[1]]),l=Te(i,a);return M(l,[l.size])}else if(t.rank===2&&s.rank===1){const i=M(s,[-1,1]),a=Te(t,i);return M(a,[a.size])}else{const i=M(s,[s.shape[0],s.shape[1]]);return Te(t,i)}}const i$=P({dot_:r$});function a$(n,...e){const t=e.map((o,r)=>E(o,`tensors${r}`,"einsum")),s={equation:n};return _.runKernel(lu,t,s)}const hi=P({einsum_:a$});function l$(n){const t={x:E(n,"x","elu","float32")};return _.runKernel(wr,t)}const dl=P({elu_:l$});function c$(n){let e=E(n,"x","erf");k(e.dtype==="int32"||e.dtype==="float32",()=>"Input dtype must be `int32` or `float32`."),e.dtype==="int32"&&(e=oe(e,"float32"));const t={x:e};return _.runKernel(Cr,t)}const Kf=P({erf_:c$});function sh(n,e){for(let t=0;t<n.length;++t)if(n[n.length-t-1]!==e-1-t)return!1;return!0}function Xf(n,e,t){const s=n.length+e.length,o=[];let r=0,i=0;for(let a=0;a<s;a++)t.indexOf(a)===-1?o.push(n[r++]):o.push(e[i++]);return o}function gt(n,e){const t=[],s=n.length;for(let r=0;r<s;r++)e.indexOf(r)===-1&&t.push(n[r]);const o=e.map(r=>n[r]);return[t,o]}function rt(n,e){const t=e.map(s=>1);return Xf(n,t,e)}function Ct(n,e,t){k(sh(e,t),()=>`${n} supports only inner-most axes for now. Got axes ${e} and rank-${t} input.`)}function je(n,e){if(sh(n,e))return null;const t=[];for(let s=0;s<e;++s)n.indexOf(s)===-1&&t.push(s);return n.forEach(s=>t.push(s)),t}function ms(n){return n.map((e,t)=>[t,e]).sort((e,t)=>e[1]-t[1]).map(e=>e[0])}function et(n,e){const t=[];for(let s=e-n;s<e;++s)t.push(s);return t}function u$(n,e=null,t=!1){const o={x:E(n,"x","max")},r={reductionIndices:e,keepDims:t};return _.runKernel(Sa,o,r)}const bn=P({max_:u$});function h$(n,e=null,t=!1){const o={x:E(n,"x","min")},r={axis:e,keepDims:t};return _.runKernel(Ra,o,r)}const pl=P({min_:h$});function d$(n,e){let t=E(n,"base","pow"),s=E(e,"exp","pow");[t,s]=Je(t,s);const o={a:t,b:s};return _.runKernel(Mr,o)}const Ys=P({pow_:d$});function Re(n,e){if((nn(n)&&e!=="string"||Array.isArray(n))&&e!=="complex64")throw new Error("Error creating a new Scalar: value must be a primitive (number|boolean|string)");if(e==="string"&&nn(n)&&!(n instanceof Uint8Array))throw new Error("When making a scalar from encoded string, the value must be `Uint8Array`.");return al(n,[],[],e)}function p$(n){const t={x:E(n,"x","sqrt","float32")};return _.runKernel(Xr,t)}const Et=P({sqrt_:p$});function f$(n){const e=E(n,"x","square"),t={};return _.runKernel("Square",{x:e},t)}const Ue=P({square_:f$});function m$(n,e=null,t=!1){let s=E(n,"x","sum");s.dtype==="bool"&&(s=oe(s,"int32"));const o={x:s},r={axis:e,keepDims:t};return _.runKernel(qa,o,r)}const ue=P({sum_:m$});function g$(n,e="euclidean",t=null,s=!1){n=E(n,"x","norm");const o=Yf(n,e,t);let r=o.shape;if(s){const i=Ce(t,n.shape);r=rt(o.shape,i)}return M(o,r)}function Yf(n,e,t=null){if(n.rank===0)return _t(n);if(n.rank!==1&&t===null)return Yf(M(n,[-1]),e,t);if(n.rank===1||typeof t=="number"||Array.isArray(t)&&t.length===1){if(e===1)return ue(_t(n),t);if(e===1/0)return bn(_t(n),t);if(e===-1/0)return pl(_t(n),t);if(e==="euclidean"||e===2)return Et(ue(Ys(_t(n),Re(2,"int32")),t));throw new Error(`Error in norm: invalid ord value: ${e}`)}if(Array.isArray(t)&&t.length===2){if(e===1)return bn(ue(_t(n),t[0]),t[1]-1);if(e===1/0)return bn(ue(_t(n),t[1]),t[0]);if(e===-1/0)return pl(ue(_t(n),t[1]),t[0]);if(e==="fro"||e==="euclidean")return Et(ue(Ue(n),t));throw new Error(`Error in norm: invalid ord value: ${e}`)}throw new Error(`Error in norm: invalid axis: ${t}`)}const fl=P({norm_:g$});function x$(n,e=null,t=!1){return fl(n,"euclidean",e,t)}const b$=P({euclideanNorm_:x$});function y$(n){const t={x:E(n,"x","exp")};return _.runKernel(Ir,t)}const _n=P({exp_:y$});function w$(n,e=0){const t=E(n,"x","expandDims","string_or_numeric");k(e<=t.rank,()=>"Axis must be <= rank of the tensor");const s={input:t},o={dim:e};return _.runKernel(ma,s,o)}const Vt=P({expandDims_:w$});function C$(n){const t={x:E(n,"x","expm1")};return _.runKernel($r,t)}const I$=P({expm1_:C$});function $$(n,e){const t=E(n,"x","tile","string_or_numeric");k(t.rank===e.length,()=>`Error in transpose: rank of input ${t.rank} must match length of reps ${e}.`);const s={x:t},o={reps:e};return _.runKernel(ei,s,o)}const yn=P({tile_:$$});function k$(n,e,t,s="float32"){e==null&&(e=n);const o=Ie([n,e],s),r=n<=e?n:e;for(let a=0;a<r;++a)o.set(1,a,a);const i=M(o.toTensor(),[n,e]);if(t==null)return i;if(t.length===1)return yn(Vt(i,0),[t[0],1,1]);if(t.length===2)return yn(Vt(Vt(i,0),0),[t[0],t[1],1,1]);if(t.length===3)return yn(Vt(Vt(Vt(i,0),0),0),[t[0],t[1],t[2],1,1]);throw new Error(`eye() currently supports only 1D and 2D batchShapes, but received ${t.length}D.`)}const Zf=P({eye_:k$});function v$(n){const t={x:E(n,"x","floor","float32")};return _.runKernel(kr,t)}const ml=P({floor_:v$});function S$(n,e,t=0,s=0){const o=E(n,"x","gather"),r=E(e,"indices","gather","int32"),i={x:o,indices:r},a={axis:t,batchDims:s};return _.runKernel(xa,i,a)}const oh=P({gather_:S$});function N$(n,e){let t=E(n,"a","greater","string_or_numeric"),s=E(e,"b","greater","string_or_numeric");[t,s]=Je(t,s),xe(t.shape,s.shape);const o={a:t,b:s};return _.runKernel(ba,o)}const Ht=P({greater_:N$});function T$(n,e){let t=E(n,"a","greaterEqual","string_or_numeric"),s=E(e,"b","greaterEqual","string_or_numeric");[t,s]=Je(t,s),xe(t.shape,s.shape);const o={a:t,b:s};return _.runKernel(Sr,o)}const Zs=P({greaterEqual_:T$});function E$(n){const t={input:E(n,"input","imag")};return _.runKernel(fu,t)}const rh=P({imag_:E$});function R$(n){const t={x:E(n,"x","isFinite")};return _.runKernel(Tr,t)}const A$=P({isFinite_:R$});function D$(n){const t={x:E(n,"x","isInf")};return _.runKernel(Er,t)}const F$=P({isInf_:D$});function _$(n){const t={x:E(n,"x","isNaN")};return _.runKernel(Rr,t)}const O$=P({isNaN_:_$});function L$(n,e=.2){const s={x:E(n,"x","leakyRelu")},o={alpha:e};return _.runKernel(ya,s,o)}const ih=P({leakyRelu_:L$});function M$(n,e){let t=E(n,"a","less","string_or_numeric"),s=E(e,"b","less","string_or_numeric");[t,s]=Je(t,s),xe(t.shape,s.shape);const o={a:t,b:s};return _.runKernel(wa,o)}const gl=P({less_:M$});function P$(n,e){let t=E(n,"a","lessEqual","string_or_numeric"),s=E(e,"b","lessEqual","string_or_numeric");[t,s]=Je(t,s),xe(t.shape,s.shape);const o={a:t,b:s};return _.runKernel(Ca,o)}const Lo=P({lessEqual_:P$});function B$(n,e=5,t=1,s=1,o=.5){const r=E(n,"x","localResponseNormalization");k(r.rank===4||r.rank===3,()=>`Error in localResponseNormalization: x must be rank 3 or 4 but got
               rank ${r.rank}.`),k($o(e),()=>`Error in localResponseNormalization: depthRadius must be an integer but got depthRadius ${e}.`);let i=r,a=!1;r.rank===3&&(a=!0,i=M(r,[1,r.shape[0],r.shape[1],r.shape[2]]));const l={x:i},c={depthRadius:e,bias:t,alpha:s,beta:o},u=_.runKernel(va,l,c);return a?M(u,[u.shape[1],u.shape[2],u.shape[3]]):u}const z$=P({localResponseNormalization_:B$});function V$(n){const t={x:E(n,"x","log","float32")};return _.runKernel(Ar,t)}const On=P({log_:V$});function W$(n){const t={x:E(n,"x","log1p")};return _.runKernel(Dr,t)}const Qf=P({log1p_:W$});function U$(n,e){k(Mc(n),()=>"The f passed in variableGrads(f) must be a function"),k(e==null||Array.isArray(e)&&e.every(c=>c instanceof rl),()=>"The varList passed in variableGrads(f, varList) must be an array of variables");const t=e!=null;if(!t){e=[];for(const c in _.registeredVariables)e.push(_.registeredVariables[c])}const s=t?e.filter(c=>!c.trainable):null,o=e.length;e=e.filter(c=>c.trainable),k(e.length>0,()=>`variableGrads() expects at least one of the input variables to be trainable, but none of the ${o} variables is trainable.`);const r=!0,{value:i,grads:a}=_.gradients(n,e,null,r);k(a.some(c=>c!=null),()=>"Cannot find a connection between any variable and the result of the loss function y=f(x). Please make sure the operations that use variables are inside the function f passed to minimize()."),k(i.rank===0,()=>`The f passed in variableGrads(f) must return a scalar, but it returned a rank-${i.rank} tensor`);const l={};return e.forEach((c,u)=>{a[u]!=null&&(l[c.name]=a[u])}),s!=null&&s.forEach(c=>l[c.name]=null),{value:i,grads:l}}function Mo(n){return _.customGrad(n)}function G$(n){const t={x:E(n,"x","neg")};return _.runKernel(Da,t)}const tt=P({neg_:G$});function H$(n){const t={x:E(n,"x","softplus")};return _.runKernel(Kr,t)}const di=P({softplus_:H$});function q$(n){const e=E(n,"x","logSigmoid");return Mo(s=>({value:tt(di(tt(s))),gradFunc:i=>D(i,_o(tt(s)))}))(e)}const j$=P({logSigmoid_:q$});function K$(n,e){let t=E(n,"a","sub"),s=E(e,"b","sub");[t,s]=Je(t,s);const o={a:t,b:s};return _.runKernel(Zr,o)}const pe=P({sub_:K$});function X$(n,e=-1){const t=E(n,"logits","logSoftmax");if(e===-1&&(e=t.rank-1),e!==t.rank-1)throw Error(`Log Softmax along a non-last dimension is not yet supported. Logits was rank ${t.rank} and axis was ${e}`);return Mo((o,r)=>{const a=bn(o,e,!0),l=pe(o,a),c=pe(oe(l,"float32"),On(ue(_n(l),e,!0)));return r([c]),{value:c,gradFunc:(h,d)=>{const[p]=d,f=!0,m=_n(p);return pe(h,D(ue(h,e,f),m))}}})(t)}const Jf=P({logSoftmax_:X$});function Y$(n,e=null,t=!1){const s=E(n,"x","logSumExp"),o=Ce(e,s.shape),r=bn(s,o,!0),i=pe(s,r),a=_n(i),l=ue(a,o),c=On(l),u=ee(M(r,c.shape),c);if(t){const h=rt(u.shape,o);return M(u,h)}return u}const em=P({logSumExp_:Y$});function Z$(n,e){const t=E(n,"a","logicalAnd","bool"),s=E(e,"b","logicalAnd","bool");xe(t.shape,s.shape);const o={a:t,b:s};return _.runKernel(Ia,o)}const Qn=P({logicalAnd_:Z$});function Q$(n){const t={x:E(n,"x","logicalNot","bool")};return _.runKernel($a,t)}const ah=P({logicalNot_:Q$});function J$(n,e){const t=E(n,"a","logicalOr","bool"),s=E(e,"b","logicalOr","bool");xe(t.shape,s.shape);const o={a:t,b:s};return _.runKernel(ka,o)}const tm=P({logicalOr_:J$});function ek(n,e){const t=E(n,"a","logicalXor","bool"),s=E(e,"b","logicalXor","bool");return xe(t.shape,s.shape),Qn(tm(n,e),ah(Qn(n,e)))}const tk=P({logicalXor_:ek});function nk(n,e,t,s,o){const r=E(n,"x","maxPool"),i=1;let a=r,l=!1;r.rank===3&&(l=!0,a=M(r,[1,r.shape[0],r.shape[1],r.shape[2]])),k(a.rank===4,()=>`Error in maxPool: input must be rank 4 but got rank ${a.rank}.`),k(Nt(t,i),()=>`Error in maxPool: Either strides or dilations must be 1. Got strides ${t} and dilations '${i}'`),zt("maxPool",s,o);const c={x:a},u={filterSize:e,strides:t,pad:s,dimRoundingMode:o},h=_.runKernel(Na,c,u);return l?M(h,[h.shape[1],h.shape[2],h.shape[3]]):h}const lh=P({maxPool_:nk});function sk(n,e=[1,1,1],t,s,o,r="NDHWC"){const i=E(n,"x","maxPool3d");let a=i,l=!1;i.rank===4&&(l=!0,a=M(i,[1,i.shape[0],i.shape[1],i.shape[2],i.shape[3]])),k(a.rank===5,()=>`Error in maxPool3d: x must be rank 5 but got rank ${a.rank}.`),k(r==="NDHWC",()=>`Error in maxPool3d: Only NDHWC is currently supported, but got dataFormat of ${r}`),zt("maxPool3d",s,o);const c={x:a},u={filterSize:e,strides:t,pad:s,dimRoundingMode:o,dataFormat:r},h=_.runKernel(Ta,c,u);return l?M(h,[h.shape[1],h.shape[2],h.shape[3],h.shape[4]]):h}const ok=P({maxPool3d_:sk});function rk(n,e){let t=E(n,"a","maximum"),s=E(e,"b","maximum");[t,s]=Je(t,s),t.dtype==="bool"&&(t=oe(t,"int32"),s=oe(s,"int32")),xe(t.shape,s.shape);const o={a:t,b:s};return _.runKernel(Fr,o)}const gs=P({maximum_:rk});function ik(n,e=null,t=!1){const o={x:E(n,"x","mean")},r={axis:e,keepDims:t};return _.runKernel(Ea,o,r)}const it=P({mean_:ik});function nt(n,e="float32"){if(Kn(n),e==="complex64"){const s=nt(n,"float32"),o=nt(n,"float32");return zs(s,o)}const t=St(q(n),e);return _.makeTensor(t,n,e)}function Jn(n,e="float32"){if(Kn(n),e==="complex64"){const s=Jn(n,"float32"),o=nt(n,"float32");return zs(s,o)}const t=Bc(q(n),e);return _.makeTensor(t,n,e)}function ak(n,e){let t=E(n,"a","minimum"),s=E(e,"b","minimum");[t,s]=Je(t,s),t.dtype==="bool"&&(t=oe(t,"int32"),s=oe(s,"int32")),xe(t.shape,s.shape);const o={a:t,b:s};return _.runKernel(_r,o)}const pi=P({minimum_:ak});function lk(n,e,t){k(t==="reflect"||t==="symmetric",()=>`Invalid mode. Mode must be either reflect or symmetric. Got ${t}.`);const s=E(n,"x","mirrorPad");if(s.rank===0)throw new Error("mirrorPad(scalar) is not defined. Pass non-scalar to mirrorPad");k(e.length===s.rank,()=>`Padding doesn't match input. Must be ${s.rank}. Got ${e.length}.`);const o=t==="reflect"?1:0;for(let a=0;a<s.rank;a++)k(e[a].length===2,()=>"Invalid number of paddings. Must be length of 2 each."),k(e[a][0]>=0&&e[a][0]<=s.shape[a]-o&&e[a][1]>=0&&e[a][1]<=s.shape[a]-o,()=>`Padding in dimension ${a} cannot be greater than or equal to ${s.shape[a]-o} or less than 0 for input of shape ${s.shape}`);const r={paddings:e,mode:t},i={x:s};return _.runKernel(Aa,i,r)}const ck=P({mirrorPad_:lk});function uk(n,e){let t=E(n,"a","mod"),s=E(e,"b","mod");[t,s]=Je(t,s);const o={a:t,b:s};return _.runKernel(Or,o)}const hk=P({mod_:uk});function dk(n,e=null,t=!1){n=E(n,"x","moments");const s=Ce(e,n.shape),o=it(n,s,t);let r=o.shape;t||(r=rt(o.shape,s));const i=Ue(pe(oe(n,"float32"),M(o,r))),a=it(i,s,t);return{mean:o,variance:a}}const fi=P({moments_:dk});function pk(n,e){let t=E(n,"a","notEqual","string_or_numeric"),s=E(e,"b","notEqual","string_or_numeric");[t,s]=Je(t,s),xe(t.shape,s.shape);const o={a:t,b:s};return _.runKernel(Fa,o)}const xl=P({notEqual_:pk});function fk(n,e,t=1,s=0,o="int32"){if(e<2)throw new Error(`Error in oneHot: depth must be >=2, but it is ${e}`);const i={indices:E(n,"indices","oneHot","int32")},a={dtype:o,depth:e,onValue:t,offValue:s};return _.runKernel(Oa,i,a)}const nm=P({oneHot_:fk});function mk(n){const t={x:E(n,"x","onesLike")};return _.runKernel(_a,t)}const on=P({onesLike_:mk});function gk(n,e,t=0){const s=E(n,"x","pad");if(s.rank===0)throw new Error("pad(scalar) is not defined. Pass non-scalar to pad");const o={paddings:e,constantValue:t},r={x:s};return _.runKernel(Ma,r,o)}const ch=P({pad_:gk});function xk(n,e,t){const s=E(n,"x","spaceToBatchND");k(s.rank>=1+e.length,()=>`input rank ${s.rank} should be > than [blockShape] ${e.length}`),k(t.length===e.length,()=>`paddings.shape[0] ${t.length} must be equal to [blockShape] ${e.length}`),k(s.shape.reduce((i,a,l)=>l>0&&l<=e.length?i&&(a+t[l-1][0]+t[l-1][1])%e[l-1]===0:i,!0),()=>`input spatial dimensions ${s.shape.slice(1)} with paddings ${t.toString()} must be divisible by blockShapes ${e.toString()}`);const o={x:s},r={blockShape:e,paddings:t};return _.runKernel(ja,o,r)}const uh=P({spaceToBatchND_:xk});function bk(n,e,t,s,o,r,i){o==null&&(o=[1,1]),r==null&&(r=1),s===0&&(s="valid");const a=E(n,"x","maxPool");let l=a,c=!1;a.rank===3&&(c=!0,l=M(a,[1,a.shape[0],a.shape[1],a.shape[2]])),k(Nt(r,o),()=>`Error in pool: Either strides or dilations must be 1. Got strides ${r} and dilations '${o}'`);const u=sn(l.shape,e,r,o,s),h=[u.dilationHeight,u.dilationWidth];let d;s==="same"?d=wk([u.filterHeight,u.filterWidth],h):d=[[0,0],[0,0]];const p=h[0]===1&&h[1]===1,[f,m]=yk([u.inHeight,u.inWidth],h,d),g=p?s:"valid",x=p?l:uh(l,h,f),w=(t==="avg"?()=>Zu(x,e,r,g,i):()=>lh(x,e,r,g,i))(),y=p?w:Qu(w,h,m);return c?M(y,[y.shape[1],y.shape[2],y.shape[3]]):y}function yk(n,e,t){const s=t.map(u=>u[0]),o=t.map(u=>u[1]),r=n.concat(s,o),i=e.map((u,h)=>(u-r[h]%u)%u),a=o.map((u,h)=>u+i[h]),l=e.map((u,h)=>[s[h],a[h]]),c=e.map((u,h)=>[0,i[h]]);return[l,c]}function wk(n,e){const s=n.map((i,a)=>i+(i-1)*(e[a]-1)).map(i=>i-1),o=s.map(i=>Math.floor(i/2)),r=s.map((i,a)=>i-o[a]);return s.map((i,a)=>[o[a],r[a]])}const Ck=P({pool_:bk});function Ik(n,e){const t=E(n,"x","prelu"),s=E(e,"alpha","prelu"),o={x:t,alpha:s};return _.runKernel(Pa,o)}const hh=P({prelu_:Ik});function $k(n,e=null,t=!1){let s=E(n,"x","prod");s.dtype==="bool"&&(s=oe(s,"int32"));const o={x:s},r={axis:e,keepDims:t};return _.runKernel(Ba,o,r)}const kk=P({prod_:$k});var bl={exports:{}},vk=bl.exports,sm;function Sk(){return sm||(sm=1,function(n){(function(e,t,s){function o(l){var c=this,u=a();c.next=function(){var h=2091639*c.s0+c.c*23283064365386963e-26;return c.s0=c.s1,c.s1=c.s2,c.s2=h-(c.c=h|0)},c.c=1,c.s0=u(" "),c.s1=u(" "),c.s2=u(" "),c.s0-=u(l),c.s0<0&&(c.s0+=1),c.s1-=u(l),c.s1<0&&(c.s1+=1),c.s2-=u(l),c.s2<0&&(c.s2+=1),u=null}function r(l,c){return c.c=l.c,c.s0=l.s0,c.s1=l.s1,c.s2=l.s2,c}function i(l,c){var u=new o(l),h=c&&c.state,d=u.next;return d.int32=function(){return u.next()*4294967296|0},d.double=function(){return d()+(d()*2097152|0)*11102230246251565e-32},d.quick=d,h&&(typeof h=="object"&&r(h,u),d.state=function(){return r(u,{})}),d}function a(){var l=4022871197,c=function(u){u=String(u);for(var h=0;h<u.length;h++){l+=u.charCodeAt(h);var d=.02519603282416938*l;l=d>>>0,d-=l,d*=l,l=d>>>0,d-=l,l+=d*4294967296}return(l>>>0)*23283064365386963e-26};return c}t&&t.exports?t.exports=i:this.alea=i})(vk,n)}(bl)),bl.exports}var yl={exports:{}},Nk=yl.exports,om;function Tk(){return om||(om=1,function(n){(function(e,t,s){function o(a){var l=this,c="";l.x=0,l.y=0,l.z=0,l.w=0,l.next=function(){var h=l.x^l.x<<11;return l.x=l.y,l.y=l.z,l.z=l.w,l.w^=l.w>>>19^h^h>>>8},a===(a|0)?l.x=a:c+=a;for(var u=0;u<c.length+64;u++)l.x^=c.charCodeAt(u)|0,l.next()}function r(a,l){return l.x=a.x,l.y=a.y,l.z=a.z,l.w=a.w,l}function i(a,l){var c=new o(a),u=l&&l.state,h=function(){return(c.next()>>>0)/4294967296};return h.double=function(){do var d=c.next()>>>11,p=(c.next()>>>0)/4294967296,f=(d+p)/(1<<21);while(f===0);return f},h.int32=c.next,h.quick=h,u&&(typeof u=="object"&&r(u,c),h.state=function(){return r(c,{})}),h}t&&t.exports?t.exports=i:this.xor128=i})(Nk,n)}(yl)),yl.exports}var wl={exports:{}},Ek=wl.exports,rm;function Rk(){return rm||(rm=1,function(n){(function(e,t,s){function o(a){var l=this,c="";l.next=function(){var h=l.x^l.x>>>2;return l.x=l.y,l.y=l.z,l.z=l.w,l.w=l.v,(l.d=l.d+362437|0)+(l.v=l.v^l.v<<4^(h^h<<1))|0},l.x=0,l.y=0,l.z=0,l.w=0,l.v=0,a===(a|0)?l.x=a:c+=a;for(var u=0;u<c.length+64;u++)l.x^=c.charCodeAt(u)|0,u==c.length&&(l.d=l.x<<10^l.x>>>4),l.next()}function r(a,l){return l.x=a.x,l.y=a.y,l.z=a.z,l.w=a.w,l.v=a.v,l.d=a.d,l}function i(a,l){var c=new o(a),u=l&&l.state,h=function(){return(c.next()>>>0)/4294967296};return h.double=function(){do var d=c.next()>>>11,p=(c.next()>>>0)/4294967296,f=(d+p)/(1<<21);while(f===0);return f},h.int32=c.next,h.quick=h,u&&(typeof u=="object"&&r(u,c),h.state=function(){return r(c,{})}),h}t&&t.exports?t.exports=i:this.xorwow=i})(Ek,n)}(wl)),wl.exports}var Cl={exports:{}},Ak=Cl.exports,im;function Dk(){return im||(im=1,function(n){(function(e,t,s){function o(a){var l=this;l.next=function(){var u=l.x,h=l.i,d,p;return d=u[h],d^=d>>>7,p=d^d<<24,d=u[h+1&7],p^=d^d>>>10,d=u[h+3&7],p^=d^d>>>3,d=u[h+4&7],p^=d^d<<7,d=u[h+7&7],d=d^d<<13,p^=d^d<<9,u[h]=p,l.i=h+1&7,p};function c(u,h){var d,p=[];if(h===(h|0))p[0]=h;else for(h=""+h,d=0;d<h.length;++d)p[d&7]=p[d&7]<<15^h.charCodeAt(d)+p[d+1&7]<<13;for(;p.length<8;)p.push(0);for(d=0;d<8&&p[d]===0;++d);for(d==8?p[7]=-1:p[d],u.x=p,u.i=0,d=256;d>0;--d)u.next()}c(l,a)}function r(a,l){return l.x=a.x.slice(),l.i=a.i,l}function i(a,l){a==null&&(a=+new Date);var c=new o(a),u=l&&l.state,h=function(){return(c.next()>>>0)/4294967296};return h.double=function(){do var d=c.next()>>>11,p=(c.next()>>>0)/4294967296,f=(d+p)/(1<<21);while(f===0);return f},h.int32=c.next,h.quick=h,u&&(u.x&&r(u,c),h.state=function(){return r(c,{})}),h}t&&t.exports?t.exports=i:this.xorshift7=i})(Ak,n)}(Cl)),Cl.exports}var Il={exports:{}},Fk=Il.exports,am;function _k(){return am||(am=1,function(n){(function(e,t,s){function o(a){var l=this;l.next=function(){var u=l.w,h=l.X,d=l.i,p,f;return l.w=u=u+1640531527|0,f=h[d+34&127],p=h[d=d+1&127],f^=f<<13,p^=p<<17,f^=f>>>15,p^=p>>>12,f=h[d]=f^p,l.i=d,f+(u^u>>>16)|0};function c(u,h){var d,p,f,m,g,x=[],b=128;for(h===(h|0)?(p=h,h=null):(h=h+"\0",p=0,b=Math.max(b,h.length)),f=0,m=-32;m<b;++m)h&&(p^=h.charCodeAt((m+32)%h.length)),m===0&&(g=p),p^=p<<10,p^=p>>>15,p^=p<<4,p^=p>>>13,m>=0&&(g=g+1640531527|0,d=x[m&127]^=p+g,f=d==0?f+1:0);for(f>=128&&(x[(h&&h.length||0)&127]=-1),f=127,m=512;m>0;--m)p=x[f+34&127],d=x[f=f+1&127],p^=p<<13,d^=d<<17,p^=p>>>15,d^=d>>>12,x[f]=p^d;u.w=g,u.X=x,u.i=f}c(l,a)}function r(a,l){return l.i=a.i,l.w=a.w,l.X=a.X.slice(),l}function i(a,l){a==null&&(a=+new Date);var c=new o(a),u=l&&l.state,h=function(){return(c.next()>>>0)/4294967296};return h.double=function(){do var d=c.next()>>>11,p=(c.next()>>>0)/4294967296,f=(d+p)/(1<<21);while(f===0);return f},h.int32=c.next,h.quick=h,u&&(u.X&&r(u,c),h.state=function(){return r(c,{})}),h}t&&t.exports?t.exports=i:this.xor4096=i})(Fk,n)}(Il)),Il.exports}var $l={exports:{}},Ok=$l.exports,lm;function Lk(){return lm||(lm=1,function(n){(function(e,t,s){function o(a){var l=this,c="";l.next=function(){var h=l.b,d=l.c,p=l.d,f=l.a;return h=h<<25^h>>>7^d,d=d-p|0,p=p<<24^p>>>8^f,f=f-h|0,l.b=h=h<<20^h>>>12^d,l.c=d=d-p|0,l.d=p<<16^d>>>16^f,l.a=f-h|0},l.a=0,l.b=0,l.c=-1640531527,l.d=1367130551,a===Math.floor(a)?(l.a=a/4294967296|0,l.b=a|0):c+=a;for(var u=0;u<c.length+20;u++)l.b^=c.charCodeAt(u)|0,l.next()}function r(a,l){return l.a=a.a,l.b=a.b,l.c=a.c,l.d=a.d,l}function i(a,l){var c=new o(a),u=l&&l.state,h=function(){return(c.next()>>>0)/4294967296};return h.double=function(){do var d=c.next()>>>11,p=(c.next()>>>0)/4294967296,f=(d+p)/(1<<21);while(f===0);return f},h.int32=c.next,h.quick=h,u&&(typeof u=="object"&&r(u,c),h.state=function(){return r(c,{})}),h}t&&t.exports?t.exports=i:this.tychei=i})(Ok,n)}($l)),$l.exports}var kl={exports:{}},Mk={},Pk=Object.freeze({__proto__:null,default:Mk}),Bk=Iw(Pk),zk=kl.exports,cm;function Vk(){return cm||(cm=1,function(n){(function(e,t,s){var o=256,r=6,i=52,a="random",l=s.pow(o,r),c=s.pow(2,i),u=c*2,h=o-1,d;function p(y,C,$){var N=[];C=C==!0?{entropy:!0}:C||{};var T=x(g(C.entropy?[y,w(t)]:y==null?b():y,3),N),S=new f(N),v=function(){for(var I=S.g(r),R=l,F=0;I<c;)I=(I+F)*o,R*=o,F=S.g(1);for(;I>=u;)I/=2,R/=2,F>>>=1;return(I+F)/R};return v.int32=function(){return S.g(4)|0},v.quick=function(){return S.g(4)/4294967296},v.double=v,x(w(S.S),t),(C.pass||$||function(I,R,F,O){return O&&(O.S&&m(O,S),I.state=function(){return m(S,{})}),F?(s[a]=I,R):I})(v,T,"global"in C?C.global:this==s,C.state)}function f(y){var C,$=y.length,N=this,T=0,S=N.i=N.j=0,v=N.S=[];for($||(y=[$++]);T<o;)v[T]=T++;for(T=0;T<o;T++)v[T]=v[S=h&S+y[T%$]+(C=v[T])],v[S]=C;(N.g=function(I){for(var R,F=0,O=N.i,L=N.j,z=N.S;I--;)R=z[O=h&O+1],F=F*o+z[h&(z[O]=z[L=h&L+R])+(z[L]=R)];return N.i=O,N.j=L,F})(o)}function m(y,C){return C.i=y.i,C.j=y.j,C.S=y.S.slice(),C}function g(y,C){var $=[],N=typeof y,T;if(C&&N=="object")for(T in y)try{$.push(g(y[T],C-1))}catch(S){}return $.length?$:N=="string"?y:y+"\0"}function x(y,C){for(var $=y+"",N,T=0;T<$.length;)C[h&T]=h&(N^=C[h&T]*19)+$.charCodeAt(T++);return w(C)}function b(){try{var y;return d&&(y=d.randomBytes)?y=y(o):(y=new Uint8Array(o),(e.crypto||e.msCrypto).getRandomValues(y)),w(y)}catch(N){var C=e.navigator,$=C&&C.plugins;return[+new Date,e,$,e.screen,w(t)]}}function w(y){return String.fromCharCode.apply(0,y)}if(x(s.random(),t),n.exports){n.exports=p;try{d=Bk}catch(y){}}else s["seed"+a]=p})(typeof self!="undefined"?self:zk,[],Math)}(kl)),kl.exports}var dh,um;function Wk(){if(um)return dh;um=1;var n=Sk(),e=Tk(),t=Rk(),s=Dk(),o=_k(),r=Lk(),i=Vk();return i.alea=n,i.xor128=e,i.xorwow=t,i.xorshift7=s,i.xor4096=o,i.tychei=r,dh=i,dh}var ph=Wk();class hm{constructor(e,t,s,o,r){this.mean=e,this.stdDev=t,this.dtype=s,this.nextVal=NaN,this.truncated=o,this.truncated&&(this.upper=this.mean+this.stdDev*2,this.lower=this.mean-this.stdDev*2);const i=r||Math.random();this.random=ph.alea(i.toString())}nextValue(){if(!isNaN(this.nextVal)){const o=this.nextVal;return this.nextVal=NaN,o}let e,t,s=!1;for(;!s;){let o,r,i;do o=2*this.random()-1,r=2*this.random()-1,i=o*o+r*r;while(i>=1||i===0);const a=Math.sqrt(-2*Math.log(i)/i);e=this.mean+this.stdDev*o*a,t=this.mean+this.stdDev*r*a,(!this.truncated||this.isValidTruncated(e))&&(s=!0)}return(!this.truncated||this.isValidTruncated(t))&&(this.nextVal=this.convertValue(t)),this.convertValue(e)}convertValue(e){return this.dtype==null||this.dtype==="float32"?e:Math.round(e)}isValidTruncated(e){return e<=this.upper&&e>=this.lower}}class Uk{constructor(e=0,t=1,s,o){if(this.canReturnFloat=()=>this.dtype==null||this.dtype==="float32",this.min=e,this.range=t-e,this.dtype=s,o==null&&(o=Math.random()),typeof o=="number"&&(o=o.toString()),!this.canReturnFloat()&&this.range<=1)throw new Error(`The difference between ${e} - ${t} <= 1 and dtype is not float`);this.random=ph.alea(o)}convertValue(e){return this.canReturnFloat()?e:Math.round(e)}nextValue(){return this.convertValue(this.min+this.range*this.random())}}function Gk(n,e=0,t=1,s,o){if(Kn(n),s!=null&&s==="bool")throw new Error(`Unsupported data type ${s}`);const r=new hm(e,t,s,!1,o),i=Ie(n,s);for(let a=0;a<i.values.length;a++)i.values[a]=r.nextValue();return i.toTensor()}const Hk=P({randomNormal_:Gk});function qk(n,e=0,t=1,s="float32",o){Kn(n);const r=Ie(n,s),i=new Uk(e,t,null,o);for(let a=0;a<r.values.length;a++)r.values[a]=i.nextValue();return r.toTensor()}const mi=P({randomUniform_:qk});function gi(n,e,t=1,s="float32"){if(t===0)throw new Error("Cannot have a step of zero");const o={start:n,stop:e,step:t,dtype:s};return _.runKernel(Cu,{},o)}function jk(n){const t={input:E(n,"input","real")};return _.runKernel(Iu,t)}const vl=P({real_:jk});function Kk(n){const t={x:E(n,"x","reciprocal")};return _.runKernel(Pr,t)}const Xk=P({reciprocal_:Kk});function Yk(n){const t={x:E(n,"x","relu")};return _.runKernel(Br,t)}const Qs=P({relu_:Yk});function Zk(n){const t={x:E(n,"x","relu6")};return _.runKernel(zr,t)}const dm=P({relu6_:Zk});function Qk(n,e){const s={x:E(n,"x","reverse")},o={dims:e};return _.runKernel(Ua,s,o)}const Js=P({reverse_:Qk});function Jk(n){const t={x:E(n,"x","round")};return _.runKernel(Vr,t)}const pm=P({round_:Jk});function ev(n){const t={x:E(n,"x","rsqrt","float32")};return _.runKernel(Wr,t)}const Sl=P({rsqrt_:ev});function tv(n){const t={x:E(n,"x","selu")};return _.runKernel(Ur,t)}const fm=P({selu_:tv});function nv(n,e,t,s,o,r=[1,1],i="NHWC"){const a=E(n,"x","separableConv2d"),l=E(e,"depthwiseFilter","separableConv2d"),c=E(t,"pointwiseFilter","separableConv2d");let u=a,h=!1;if(a.rank===3&&(h=!0,u=M(a,[1,a.shape[0],a.shape[1],a.shape[2]])),i==="NCHW")throw new Error("separableConv2d currently does not support dataFormat NCHW; only NHWC is supported");k(u.rank===4,()=>`Error in separableConv2d: input must be rank 4, but got rank ${u.rank}.`),k(l.rank===4,()=>`Error in separableConv2d: depthwise filter must be rank 4, but got rank ${l.rank}.`),k(c.rank===4,()=>`Error in separableConv2d: pointwise filter must be rank 4, but got rank ${l.rank}.`),k(c.shape[0]===1,()=>`Error in separableConv2d: the first dimension of pointwise filter  must be 1, but got ${c.shape[0]}.`),k(c.shape[1]===1,()=>`Error in separableConv2d: the second dimension of pointwise filter must be 1, but got ${c.shape[1]}.`);const d=l.shape[2],p=l.shape[3];k(c.shape[2]===d*p,()=>`Error in separableConv2d: the third dimension of pointwise filter must be ${d*p}, but got ${c.shape[2]}.`);const f=nh(u,l,s,o,i,r),g=Xs(f,c,1,"valid",i);return h?M(g,[g.shape[1],g.shape[2],g.shape[3]]):g}const mm=P({separableConv2d_:nv});function sv(n){const t={x:E(n,"x","sign")};return _.runKernel(qr,t)}const ov=P({sign_:sv});function rv(n){const t={x:E(n,"x","sin","float32")};return _.runKernel(Gr,t)}const gm=P({sin_:rv});function iv(n){const t={x:E(n,"x","sinh")};return _.runKernel(Hr,t)}const xm=P({sinh_:iv});function av(n,e,t){const s=E(n,"x","slice1d");return k(s.rank===1,()=>`slice1d expects a rank-1 tensor, but got a rank-${s.rank} tensor`),Be(s,[e],[t])}const fh=P({slice1d_:av});function lv(n,e,t){const s=E(n,"x","slice2d");return k(s.rank===2,()=>`slice2d expects a rank-2 tensor, but got a rank-${s.rank} tensor`),Be(s,e,t)}const bm=P({slice2d_:lv});function cv(n,e,t){const s=E(n,"x","slice3d");return k(s.rank===3,()=>`slice3d expects a rank-3 tensor, but got a rank-${s.rank} tensor`),Be(s,e,t)}const mh=P({slice3d_:cv});function uv(n,e,t){const s=E(n,"x","slice4d");return k(s.rank===4,()=>`slice4d expects a rank-4 tensor, but got a rank-${s.rank} tensor`),Be(s,e,t)}const Nl=P({slice4d_:uv});function hv(n,e=-1){const t=E(n,"logits","softmax","float32");if(e===-1&&(e=t.rank-1),e!==t.rank-1)throw Error(`Softmax along a non-last dimension is not yet supported. Logits was rank ${t.rank} and dim was ${e}`);const s={logits:t},o={dim:e};return _.runKernel(Xa,s,o)}const gh=P({softmax_:hv});function dv(n){k(n.dtype==="complex64",()=>`The dtype for tf.spectral.fft() must be complex64 but got ${n.dtype}.`);const e={input:n};return _.runKernel(uu,e)}const ym=P({fft_:dv});function pv(n){k(n.dtype==="complex64",()=>`The dtype for tf.spectral.ifft() must be complex64 but got ${n.dtype}.`);const e={input:n};return _.runKernel(pu,e)}const xh=P({ifft_:pv});function fv(n){const e=n.shape[n.shape.length-1],t=n.size/e;let s;if(e<=2){const o=M(n,[t,e]);s=xh(o)}else{const o=[t,2*(e-1)],r=M(vl(n),[t,e]),i=M(rh(n),[t,e]),a=Js(Be(r,[0,1],[t,e-2]),1),l=D(Js(Be(i,[0,1],[t,e-2]),1),Re(-1)),c=Tt([r,a],1),u=Tt([i,l],1),h=M(zs(c,u),[o[0],o[1]]);s=xh(h)}if(s=vl(s),n.rank===3&&n.shape[0]!==0){const o=s,r=n.shape[0];s=M(s,[r,s.shape[0]/r,s.shape[1]]),o.dispose()}return s}const mv=P({irfft_:fv});function gv(n,e,t=0){const o={x:E(n,"x","split")},r={numOrSizeSplits:e,axis:t};return _.runKernel(Ka,o,r)}const Qt=P({split_:gv});function xv(n,e){k(n.dtype==="float32",()=>`The dtype for rfft() must be real value but got ${n.dtype}`);let t=n.shape[n.shape.length-1];const s=n.size/t;let o;if(e!=null&&e<t){const f=n.shape.map(g=>0),m=n.shape.map(g=>g);m[n.shape.length-1]=e,o=Be(n,f,m),t=e}else if(e!=null&&e>t){const f=n.shape.map(m=>m);f[n.shape.length-1]=e-t,o=Tt([n,nt(f)],n.shape.length-1),t=e}else o=n;const r=ke(o),i=M(zs(o,r),[s,t]),a=ym(i),l=Math.floor(t/2)+1,c=vl(a),u=rh(a),h=Qt(c,[l,t-l],c.shape.length-1),d=Qt(u,[l,t-l],u.shape.length-1),p=o.shape.slice();return p[o.shape.length-1]=l,M(zs(h[0],d[0]),p)}const bv=P({rfft_:xv});function yv(n,e){let t=E(n,"a","squaredDifference"),s=E(e,"b","squaredDifference");[t,s]=Je(t,s),xe(t.shape,s.shape);const o={a:t,b:s},r={};return _.runKernel(Yr,o,r)}const wv=P({squaredDifference_:yv});function Cv(n,e){const t=E(n,"x","squeeze","string_or_numeric");return M(t,as(t.shape,e).newShape)}const eo=P({squeeze_:Cv});function Iv(n,e=0){const t=Sf(n,"tensors","stack","string_or_numeric");k(t.length>=1,()=>"Pass at least one tensor to tf.stack"),t.length>0&&k(e<=t[0].rank,()=>"Axis must be <= rank of the tensor");const s=t,o={axis:e};return _.runKernel(La,s,o)}const Ln=P({stack_:Iv});function $v(n,e=0){const s={x:E(n,"x","step")},o={alpha:e};return _.runKernel(ti,s,o)}const xi=P({step_:$v});function kv(n,e,t,s,o=0,r=0,i=0,a=0,l=0){const u={x:E(n,"x","stridedSlice","string_or_numeric")},h={begin:e,end:t,strides:s,beginMask:o,endMask:r,ellipsisMask:i,newAxisMask:a,shrinkAxisMask:l};return _.runKernel(Nu,u,h)}const vv=P({stridedSlice_:kv});function Sv(n){const t={x:E(n,"x","tan","float32")};return _.runKernel(Qr,t)}const Nv=P({tan_:Sv});function qt(n,e){kp(n);const t=il(n,e);if(t.length!==1)throw new Error("tensor1d() requires values to be a flat/TypedArray");return al(n,null,t,e)}function bh(n,e,t){if(kp(n),e!=null&&e.length!==2)throw new Error("tensor2d() requires shape to have two numbers");const s=il(n,t);if(s.length!==2&&s.length!==1)throw new Error("tensor2d() requires values to be number[][] or flat/TypedArray");if(s.length===1&&e==null)throw new Error("tensor2d() requires shape to be provided when `values` are a flat/TypedArray");return al(n,e,s,t)}function wm(n,e,t){const s=e.rank>1?e.shape[e.rank-1]:1,o=e.rank>1?e.rank-1:1,r=`Must have updates.shape = indices.shape[:batchDim] + shape[sliceDim:], got updates.shape: ${t.shape}, indices.shape: ${e.shape}, shape: ${n}, sliceDim: ${s}, and batchDim: ${o}.`;if(t.rank<o)throw new Error(r+` update.rank < ${o}. `);if(n.length<s+(t.rank-o))throw new Error(r+` Output shape length < ${s+(t.rank-o)}`);if(t.rank!==o+n.length-s)throw new Error(r+` update.rank != ${o+n.length-s}`);for(let i=0;i<o;++i)if(t.shape[i]!==e.shape[i])throw new Error(r+` updates.shape[${i}] (${t.shape[i]}) != indices.shape[${i}] (${e.shape[i]}).`);for(let i=0;i<t.rank-o;++i)if(t.shape[i+o]!==n[i+s])throw new Error(r+` updates.shape[${i+o}] (${t.shape[i+o]}) != shape[${i+o}] (${n[i+o]})`)}function Tv(n,e,t){if(e.rank<1)throw new Error(`tf.scatterND() expects the indices to be rank 1 or higher, but the rank was ${e.rank}.`);if(n.rank<1)throw new Error(`tf.scatterND() expects the updates to be rank 1 or higher, but the rank was ${n.rank}.`);if(e.dtype!=="int32")throw new Error(`The dtype of 'indices' should be int32, but got dtype: ${e.dtype}`);if(t.length<1)throw new Error(`Output rank must be greater or equal to 1, but got shape: ${t}`);if(t.length===0){if(e.size===0)throw new Error(`Indices specified for empty output. indices shape: ${e.shape}`);if(n.size===0)throw new Error(`Updates specified for empty output. updates shape: ${n.shape}`)}wm(t,e,n)}function to(n,e,t){const s=e.shape.length,o=s>1?e.shape[s-1]:1,r=t.length;let i=1;for(let h=o;h<r;++h)i*=t[h];const a=o<1?1:o,l=q(e.shape)/a,c=[...ce(t.slice(0,o)),1],u=q(t);return{sliceRank:o,numUpdates:l,sliceSize:i,strides:c,outputSize:u}}function Ev(n,e=1,t=!0){const s=E(n,"x","topk");if(s.rank===0)throw new Error("topk() expects the input to be of rank 1 or higher");const o=s.shape[s.shape.length-1];if(e<0)throw new Error(`'k' passed to topk() must be >= 0 but got ${e}`);if(e>o)throw new Error(`'k' passed to topk() must be <= the last dimension (${o}) but got ${e}`);const r={x:s},i={k:e,sorted:t},[a,l]=_.runKernel(Tu,r,i);return{values:a,indices:l}}const Rv=P({topk_:Ev});function Av(n,e=0,t=1,s,o){if(Kn(n),s!=null&&s==="bool")throw new Error("Unsupported data type $ { dtype }");const r=new hm(e,t,s,!0,o),i=Ie(n,s);for(let a=0;a<i.values.length;a++)i.values[a]=r.nextValue();return i.toTensor()}const Cm=P({truncatedNormal_:Av});function Dv(n,e=0){const t=E(n,"x","unique","string_or_numeric");k(t.rank>0,()=>"The input tensor must be at least 1D");const s={x:t},o={axis:e},[r,i]=_.runKernel(Ru,s,o);return{values:r,indices:i}}const Fv=P({unique_:Dv});function _v(n,e,t){const s=E(n,"x","unsortedSegmentSum"),o=E(e,"segmentIds","unsortedSegmentSum","int32");k($o(t),()=>"numSegments must be of dtype int");const r={x:s,segmentIds:o},i={numSegments:t};return _.runKernel(Za,r,i)}const Im=P({unsortedSegmentSum_:_v});function Ov(n,e=0){const t=E(n,"x","unstack","string_or_numeric");k(e>=-t.shape.length&&e<t.shape.length,()=>`Axis = ${e} is not in [-${t.shape.length}, ${t.shape.length})`);const s={value:t},o={axis:e};return _.runKernel(Ya,s,o)}const xs=P({unstack_:Ov});function Lv(n,e=!0,t,s){return _.makeVariable(n,e,t,s)}function $m(n,e){const t=[];for(let r=0;r<e.length;r++)e[r]&&t.push(r);const s=Ie(n,"int32"),o=Ie([t.length,n.length],"int32");for(let r=0;r<t.length;r++){const i=s.indexToLoc(t[r]),a=r*n.length;o.values.set(i,a)}return o.toTensor()}function Mv(n,e,t){const s=E(n,"x","transpose");if(e==null&&(e=s.shape.map((i,a)=>a).reverse()),k(s.rank===e.length,()=>`Error in transpose: rank of input ${s.rank} must match length of perm ${e}.`),e.forEach(i=>{k(i>=0&&i<s.rank,()=>`All entries in 'perm' must be between 0 and ${s.rank-1} but got ${e}`)}),s.rank<=1)return s.clone();const o={x:s},r={perm:e};return s.dtype==="complex64"?B(()=>{let i=vl(s),a=rh(s);return i=_.runKernel(To,{x:i},r),a=_.runKernel(To,{x:a},r),t&&(a=tt(a)),zs(i,a)}):_.runKernel(To,o,r)}const ve=P({transpose_:Mv});function Pv(n,e){if(e==null)return n.shape.slice();if(Ee(n.shape,e))return e;if(n.shape.length===e.length){const t=[];for(let s=0;s<n.shape.length;s++)e[s]==null&&n.shape[s]!=null?t.push(n.shape[s]):t.push(e[s]);return t}return e}function Bv(n,e,t,s){const o=E(n,"x","dropout");if(k(o.dtype==="float32",()=>`x has to be a floating point tensor since it's going to be scaled, but got a ${o.dtype} tensor instead.`),k(e>=0&&e<1,()=>`rate must be a float in the range [0, 1), but got ${e}.`),e===0)return n instanceof at?o.clone():o;const r=Pv(o,t),i=1-e,a=he(ml(ee(mi(r,0,1,"float32",s),i)),i);return D(o,a)}const zv=P({dropout_:Bv});function Vv(n,e,t,s,o,r="NHWC",i){let a=n;n.rank===3&&(a=M(n,[1,n.shape[0],n.shape[1],n.shape[2]]));let l=e;l.rank===3&&(l=M(e,[1,e.shape[0],e.shape[1],e.shape[2]])),k(a.rank===4,()=>`Error in conv2dDerFilter: input must be rank 4, but got shape ${a.shape}.`),k(l.rank===4,()=>`Error in conv2dDerFilter: dy must be rank 4, but got shape ${l.shape}.`),k(t.length===4,()=>`Error in conv2dDerFilter: filterShape must be length 4, but got ${t}.`);const c=r==="NHWC"?a.shape[3]:a.shape[1],u=r==="NHWC"?l.shape[3]:l.shape[1];k(c===t[2],()=>`Error in conv2dDerFilter: depth of input ${c}) must match input depth in filter (${t[2]}.`),k(u===t[3],()=>`Error in conv2dDerFilter: depth of dy (${u}) must match output depth for filter (${t[3]}).`),zt("conv2dDerFilter",o,i);const h={x:a,dy:l},d={strides:s,pad:o,dataFormat:r,dimRoundingMode:i,filterShape:t};return _.runKernel(Zc,h,d)}const yh=P({conv2DBackpropFilter_:Vv});function wh(n,e,t){if(t==null||t==="linear")return n;if(t==="relu")return D(n,xi(e));throw new Error(`Cannot compute gradient for fused activation ${t}.`)}function Ch(n,e){let t=e;const s=lt(n.shape,e.shape);return s.length>0&&(t=ue(t,s)),M(t,n.shape)}function Ih(n,e,t,s){if(e==="linear")return n;if(e==="relu")return Qs(n);if(e==="elu")return dl(n);if(e==="relu6")return dm(n);if(e==="prelu")return hh(n,t);if(e==="leakyrelu")return ih(n,s);if(e==="sigmoid")return _o(n);throw new Error(`Unknown fused activation ${e}.`)}const $h=(n,e)=>!(n>0)||e==="linear";function Wv({x:n,filter:e,strides:t,pad:s,dataFormat:o="NHWC",dilations:r=[1,1],dimRoundingMode:i,bias:a,activation:l="linear",preluActivationWeights:c,leakyreluAlpha:u}){if(l=l||"linear",$h(_.state.gradientDepth,l)===!1){k(o==="NHWC",()=>`Error in fused conv2d: got dataFormat of ${o} but only NHWC is currently supported for the case of gradient depth is 0 and the activation is not linear.`);let $=Xs(n,e,t,s,o,r,i);return a!=null&&($=ee($,a)),Ih($,l,c,u)}const h=E(n,"x","conv2d","float32"),d=E(e,"filter","conv2d","float32");let p=h,f=!1;h.rank===3&&(f=!0,p=M(h,[1,h.shape[0],h.shape[1],h.shape[2]])),k(p.rank===4,()=>`Error in fused conv2d: input must be rank 4, but got rank ${p.rank}.`),k(d.rank===4,()=>`Error in fused conv2d: filter must be rank 4, but got rank ${d.rank}.`),zt("fused conv2d",s,i);const m=o==="NHWC"?p.shape[3]:p.shape[1];k(d.shape[2]===m,()=>`Error in conv2d: depth of input (${m}) must match input depth for filter ${d.shape[2]}.`),k(Nt(t,r),()=>`Error in conv2D: Either strides or dilations must be 1. Got strides ${t} and dilations '${r}'`);const g=yt(p.shape,d.shape,t,r,s,i);let x;a!=null&&(x=E(a,"bias","fused conv2d"),[x]=Je(x,h),o==="NHWC"?xe(g.outShape,x.shape):(k(x.shape.length<=1,()=>`Error in fused conv2d: only supports scalar or 1-D Tensor bias for NCHW format but got the bias of rank-${x.shape.length}.`),k(x.shape.length===0||x.shape[0]===g.outChannels||x.shape[0]===1,()=>`Error in fused conv2d: bias shape (${x.shape}) is not compatible with the number of output channels (${g.outChannels})`)));let b;if(c!=null){const $=c.shape;if(k($.length<=1||$.length===3,()=>`Error in fused conv2d: only supports scalar, 1-D Tensor or 3-D Tensor PReLU activation weights but got a tensor of rank-${$.length}.`),$.length===1)k($[0]===1||$[0]===g.outChannels,()=>`Error in fused conv2d: PReLU activation weights (${$}) is not compatible with the number of output channels (${g.outChannels}).`);else if($.length===3)try{xe($,g.outShape)}catch(N){const T=`Error in fused conv2d: PReLU activation weights (${$}) is not compatible with the output shape of the conv2d (${g.outShape}).`;throw Error(T)}b=E(c,"prelu weights","fused conv2d")}const w=($,N)=>{k(o==="NHWC",()=>`Error in gradient of fused conv2D: got dataFormat of ${o} but only NHWC is currently supported.`);const[T,S,v,I]=N,R=wh($,v,l);k(js(r),()=>`Error in gradient of fused conv2D: dilation rates greater than 1 are not yet supported in gradients. Got dilations '${r}'`);const F=Ju(S.shape,R,T,t,s),O=yh(S,R,T.shape,t,s),L=[F,O];if(I!=null){const z=Ch(I,R);L.push(z)}return L},y={x:p,filter:d,bias:x,preluActivationWeights:b},C={strides:t,pad:s,dataFormat:o,dilations:r,dimRoundingMode:i,activation:l,leakyreluAlpha:u};return a==null?Mo((N,T,S)=>{let v=_.runKernel(el,y,C);return S([T,N,v]),f&&(v=M(v,[v.shape[1],v.shape[2],v.shape[3]])),{value:v,gradFunc:w}})(p,d):Mo((N,T,S,v)=>{let I=_.runKernel(el,y,C);return v([T,N,I,S]),f&&(I=M(I,[I.shape[1],I.shape[2],I.shape[3]])),{value:I,gradFunc:w}})(p,d,x)}const Uv=P({fusedConv2d_:Wv});function Gv(n,e,t,s,o,r=[1,1],i){let a=n;n.rank===3&&(a=M(n,[1,n.shape[0],n.shape[1],n.shape[2]]));let l=e;l.rank===3&&(l=M(e,[1,e.shape[0],e.shape[1],e.shape[2]]));const c={x:a,dy:l},u={strides:s,pad:o,dimRoundingMode:i,dilations:r,filterShape:t};return _.runKernel(ou,c,u)}const Hv=P({depthwiseConv2dNativeBackpropFilter_:Gv});function qv(n,e,t,s,o,r=[1,1],i){let a=e,l=!1;e.rank===3&&(l=!0,a=M(e,[1,e.shape[0],e.shape[1],e.shape[2]]));const c={dy:a,filter:t},u={strides:s,pad:o,dimRoundingMode:i,dilations:r,inputShape:n},h=_.runKernel(ru,c,u);return l?M(h,[h.shape[1],h.shape[2],h.shape[3]]):h}const jv=P({depthwiseConv2dNativeBackpropInput_:qv});function Kv({a:n,b:e,transposeA:t=!1,transposeB:s=!1,bias:o,activation:r="linear",preluActivationWeights:i,leakyreluAlpha:a=.2}){if($h(_.state.gradientDepth,r)===!1){let I=Te(n,e,t,s);return o!=null&&(I=ee(I,o)),Ih(I,r,i,a)}let l=E(n,"a","fused matMul"),c=E(e,"b","fused matMul");[l,c]=Je(l,c);const u=t?l.shape[l.rank-2]:l.shape[l.rank-1],h=s?c.shape[c.rank-1]:c.shape[c.rank-2],d=t?l.shape[l.rank-1]:l.shape[l.rank-2],p=s?c.shape[c.rank-2]:c.shape[c.rank-1],f=l.shape.slice(0,-2),m=c.shape.slice(0,-2),g=q(f),x=q(m);k(u===h,()=>`Error in fused matMul: inner shapes (${u}) and (${h}) of Tensors with shapes ${l.shape} and ${c.shape} and transposeA=${t} and transposeB=${s} must match.`);const w=xe(l.shape.slice(0,-2),c.shape.slice(0,-2)).concat([d,p]),y=t?M(l,[g,u,d]):M(l,[g,d,u]),C=s?M(c,[x,p,h]):M(c,[x,h,p]);let $;o!=null&&($=E(o,"bias","fused matMul"),[$]=Je($,l),xe(w,$.shape));let N;i!=null&&(N=E(i,"prelu weights","fused matMul"));const T=(I,R)=>{const[F,O,L,z]=R,U=wh(M(I,L.shape),L,r);let W,G;if(!t&&!s?(W=Te(U,O,!1,!0),G=Te(F,U,!0,!1)):!t&&s?(W=Te(U,O,!1,!1),G=Te(U,F,!0,!1)):t&&!s?(W=Te(O,U,!1,!0),G=Te(F,U,!1,!1)):(W=Te(O,U,!0,!0),G=Te(U,F,!0,!0)),o!=null){const K=Ch(z,U);return[W,G,K]}else return[W,G]},S={a:y,b:C,bias:$,preluActivationWeights:N},v={transposeA:t,transposeB:s,activation:r,leakyreluAlpha:a};return o==null?Mo((R,F,O)=>{const L=_.runKernel(Ja,S,v);return O([R,F,L]),{value:M(L,w),gradFunc:T}})(y,C):Mo((R,F,O,L)=>{const z=_.runKernel(Ja,S,v);return L([R,F,z,O]),{value:M(z,w),gradFunc:T}})(y,C,$)}const km=P({fusedMatMul_:Kv});function Xv(n,e,t,s,o="bilinear",r=0){const i=E(n,"image","cropAndResize"),a=E(e,"boxes","cropAndResize","float32"),l=E(t,"boxInd","cropAndResize","int32"),c=a.shape[0];k(i.rank===4,()=>`Error in cropAndResize: image must be rank 4,but got rank ${i.rank}.`),k(a.rank===2&&a.shape[1]===4,()=>`Error in cropAndResize: boxes must be have size [${c},4] but had shape ${a.shape}.`),k(l.rank===1&&l.shape[0]===c,()=>`Error in cropAndResize: boxInd must be have size [${c}] but had shape ${a.shape}.`),k(s.length===2,()=>`Error in cropAndResize: cropSize must be of length 2, but got length ${s.length}.`),k(s[0]>=1&&s[1]>=1,()=>`cropSize must be atleast [1,1], but was ${s}`),k(o==="bilinear"||o==="nearest",()=>`method must be bilinear or nearest, but was ${o}`);const u={image:i,boxes:a,boxInd:l},h={method:o,extrapolationValue:r,cropSize:s};return _.runKernel(tu,u,h)}const Yv=P({cropAndResize_:Xv});function Zv(n){const e=E(n,"image","flipLeftRight","float32");k(e.rank===4,()=>`Error in flipLeftRight: image must be rank 4,but got rank ${e.rank}.`);const t={image:e};return _.runKernel(du,t,{})}const Qv=P({flipLeftRight_:Zv});function Jv(n){const e=E(n,"image","grayscaleToRGB"),t=e.rank-1,s=e.shape[t];k(e.rank>=2,()=>`Error in grayscaleToRGB: images must be at least rank 2, but got rank ${e.rank}.`),k(s===1,()=>`Error in grayscaleToRGB: last dimension of a grayscale image should be size 1, but got size ${s}.`);const o=new Array(e.rank);return o.fill(1,0,t),o[t]=3,yn(e,o)}const eS=P({grayscaleToRGB_:Jv});function tS(n){const e=E(n,"image","RGBToGrayscale"),t=e.rank-1,s=e.shape[t];k(e.rank>=2,()=>`Error in RGBToGrayscale: images must be at least rank 2, but got rank ${e.rank}.`),k(s===3,()=>`Error in RGBToGrayscale: last dimension of an RGB image should be size 3, but got size ${s}.`);const o=e.dtype,r=oe(e,"float32"),i=qt([.2989,.587,.114]);let a;switch(e.rank){case 2:a=hi("ij,j->i",r,i);break;case 3:a=hi("ijk,k->ij",r,i);break;case 4:a=hi("ijkl,l->ijk",r,i);break;case 5:a=hi("ijklm,m->ijkl",r,i);break;case 6:a=hi("ijklmn,n->ijklm",r,i);break;default:throw new Error("Not a valid tensor rank.")}return a=Vt(a,-1),oe(a,o)}const nS=P({rgbToGrayscale_:tS});function sS(n,e,t=0,s=.5){const o=E(n,"image","rotateWithOffset","float32");k(o.rank===4,()=>`Error in rotateWithOffset: image must be rank 4,but got rank ${o.rank}.`);const r={image:o},i={radians:e,fillValue:t,center:s};return _.runKernel(Au,r,i)}const oS=P({rotateWithOffset_:sS});function Po(n,e,t,s,o,r){s==null&&(s=.5),o==null&&(o=Number.NEGATIVE_INFINITY),r==null&&(r=0);const i=n.shape[0];return t=Math.min(t,i),k(0<=s&&s<=1,()=>`iouThreshold must be in [0, 1], but was '${s}'`),k(n.rank===2,()=>`boxes must be a 2D tensor, but was of rank '${n.rank}'`),k(n.shape[1]===4,()=>`boxes must have 4 columns, but 2nd dimension was ${n.shape[1]}`),k(e.rank===1,()=>"scores must be a 1D tensor"),k(e.shape[0]===i,()=>`scores has incompatible shape with boxes. Expected ${i}, but was ${e.shape[0]}`),k(0<=r&&r<=1,()=>`softNmsSigma must be in [0, 1], but was '${r}'`),{maxOutputSize:t,iouThreshold:s,scoreThreshold:o,softNmsSigma:r}}function rS(n,e,t,s=.5,o=Number.NEGATIVE_INFINITY){const r=E(n,"boxes","nonMaxSuppression","float32"),i=E(e,"scores","nonMaxSuppression","float32"),a=Po(r,i,t,s,o);t=a.maxOutputSize,s=a.iouThreshold,o=a.scoreThreshold;const l={maxOutputSize:t,iouThreshold:s,scoreThreshold:o};return _.runKernel(bu,{boxes:r,scores:i},l)}const iS=P({nonMaxSuppression_:rS});function aS(n,e,t){const s=lS(n,e,t),o=s<0?-(s+1):s;n.splice(o,0,e)}function lS(n,e,t){return uS(n,e,t||cS)}function cS(n,e){return n>e?1:n<e?-1:0}function uS(n,e,t){let s=0,o=n.length,r=0,i=!1;for(;s<o;){r=s+(o-s>>>1);const a=t(e,n[r]);a>0?s=r+1:(o=r,i=!a)}return i?s:-s-1}function kh(n,e,t,s,o){return Nh(n,e,t,s,o,0)}function vh(n,e,t,s,o,r){return Nh(n,e,t,s,o,0,!1,r,!0)}function Sh(n,e,t,s,o,r){return Nh(n,e,t,s,o,r,!0)}function Nh(n,e,t,s,o,r,i=!1,a=!1,l=!1){const c=[];for(let g=0;g<e.length;g++)e[g]>o&&c.push({score:e[g],boxIndex:g,suppressBeginIndex:0});c.sort(vm);const u=r>0?-.5/r:0,h=[],d=[];for(;h.length<t&&c.length>0;){const g=c.pop(),{score:x,boxIndex:b,suppressBeginIndex:w}=g;if(x<o)break;let y=!1;for(let C=h.length-1;C>=w;--C){const $=hS(n,b,h[C]);if($>=s){y=!0;break}if(g.score=g.score*dS(s,u,$),g.score<=o)break}g.suppressBeginIndex=h.length,y||(g.score===x?(h.push(b),d.push(g.score)):g.score>o&&aS(c,g,vm))}const p=h.length,f=t-p;a&&f>0&&(h.push(...new Array(f).fill(0)),d.push(...new Array(f).fill(0)));const m={selectedIndices:h};return i&&(m.selectedScores=d),l&&(m.validOutputs=p),m}function hS(n,e,t){const s=n.subarray(e*4,e*4+4),o=n.subarray(t*4,t*4+4),r=Math.min(s[0],s[2]),i=Math.min(s[1],s[3]),a=Math.max(s[0],s[2]),l=Math.max(s[1],s[3]),c=Math.min(o[0],o[2]),u=Math.min(o[1],o[3]),h=Math.max(o[0],o[2]),d=Math.max(o[1],o[3]),p=(a-r)*(l-i),f=(h-c)*(d-u);if(p<=0||f<=0)return 0;const m=Math.max(r,c),g=Math.max(i,u),x=Math.min(a,h),b=Math.min(l,d),w=Math.max(x-m,0)*Math.max(b-g,0);return w/(p+f-w)}function dS(n,e,t){const s=Math.exp(e*t*t);return t<=n?s:0}function vm(n,e){return n.score-e.score||n.score===e.score&&e.boxIndex-n.boxIndex}function pS(r,i,a){return Y(this,arguments,function*(n,e,t,s=.5,o=Number.NEGATIVE_INFINITY){const l=E(n,"boxes","nonMaxSuppressionAsync"),c=E(e,"scores","nonMaxSuppressionAsync"),u=Po(l,c,t,s,o);t=u.maxOutputSize,s=u.iouThreshold,o=u.scoreThreshold;const h=yield Promise.all([l.data(),c.data()]),d=h[0],p=h[1],{selectedIndices:f}=kh(d,p,t,s,o);return l!==n&&l.dispose(),c!==e&&c.dispose(),qt(f,"int32")})}const fS=pS;function mS(n,e,t,s=.5,o=Number.NEGATIVE_INFINITY,r=0){const i=E(n,"boxes","nonMaxSuppression"),a=E(e,"scores","nonMaxSuppression"),l=Po(i,a,t,s,o,r);t=l.maxOutputSize,s=l.iouThreshold,o=l.scoreThreshold,r=l.softNmsSigma;const c={boxes:i,scores:a},u={maxOutputSize:t,iouThreshold:s,scoreThreshold:o,softNmsSigma:r},h=_.runKernel(wu,c,u);return{selectedIndices:h[0],selectedScores:h[1]}}const gS=P({nonMaxSuppressionWithScore_:mS});function xS(i,a,l){return Y(this,arguments,function*(n,e,t,s=.5,o=Number.NEGATIVE_INFINITY,r=0){const c=E(n,"boxes","nonMaxSuppressionAsync"),u=E(e,"scores","nonMaxSuppressionAsync"),h=Po(c,u,t,s,o,r);t=h.maxOutputSize,s=h.iouThreshold,o=h.scoreThreshold,r=h.softNmsSigma;const d=yield Promise.all([c.data(),u.data()]),p=d[0],f=d[1],{selectedIndices:m,selectedScores:g}=Sh(p,f,t,s,o,r);return c!==n&&c.dispose(),u!==e&&u.dispose(),{selectedIndices:qt(m,"int32"),selectedScores:qt(g)}})}const bS=xS;function yS(n,e,t,s=.5,o=Number.NEGATIVE_INFINITY,r=!1){const i=E(n,"boxes","nonMaxSuppression"),a=E(e,"scores","nonMaxSuppression"),l=Po(i,a,t,s,o,null),c=l.maxOutputSize,u=l.iouThreshold,h=l.scoreThreshold,d={boxes:i,scores:a},p={maxOutputSize:c,iouThreshold:u,scoreThreshold:h,padToMaxOutputSize:r},f=_.runKernel(yu,d,p);return{selectedIndices:f[0],validOutputs:f[1]}}const wS=P({nonMaxSuppressionPadded_:yS});function CS(i,a,l){return Y(this,arguments,function*(n,e,t,s=.5,o=Number.NEGATIVE_INFINITY,r=!1){const c=E(n,"boxes","nonMaxSuppressionAsync"),u=E(e,"scores","nonMaxSuppressionAsync"),h=Po(c,u,t,s,o,null),d=h.maxOutputSize,p=h.iouThreshold,f=h.scoreThreshold,[m,g]=yield Promise.all([c.data(),u.data()]),{selectedIndices:x,validOutputs:b}=vh(m,g,d,p,f,r);return c!==n&&c.dispose(),u!==e&&u.dispose(),{selectedIndices:qt(x,"int32"),validOutputs:Re(b,"int32")}})}const IS=CS;function $S(n,e,t=!1,s=!1){const o=E(n,"images","resizeBilinear");k(o.rank===3||o.rank===4,()=>`Error in resizeBilinear: x must be rank 3 or 4, but got rank ${o.rank}.`),k(e.length===2,()=>`Error in resizeBilinear: new shape must 2D, but got shape ${e}.`),k(s===!1||t===!1,()=>"Error in resizeBilinear: If halfPixelCenters is true, alignCorners must be false.");let r=o,i=!1;o.rank===3&&(i=!0,r=M(o,[1,o.shape[0],o.shape[1],o.shape[2]]));const a={images:r},l={alignCorners:t,halfPixelCenters:s,size:e},c=_.runKernel(Wa,a,l);return i?M(c,[c.shape[1],c.shape[2],c.shape[3]]):c}const Sm=P({resizeBilinear_:$S});function kS(n,e,t=!1,s=!1){const o=E(n,"images","resizeNearestNeighbor");k(o.rank===3||o.rank===4,()=>`Error in resizeNearestNeighbor: x must be rank 3 or 4, but got rank ${o.rank}.`),k(e.length===2,()=>`Error in resizeNearestNeighbor: new shape must 2D, but got shape ${e}.`),k(o.dtype==="float32"||o.dtype==="int32",()=>"`images` must have `int32` or `float32` as dtype"),k(s===!1||t===!1,()=>"Error in resizeNearestNeighbor: If halfPixelCenters is true, alignCorners must be false.");let r=o,i=!1;o.rank===3&&(i=!0,r=M(o,[1,o.shape[0],o.shape[1],o.shape[2]]));const a={images:r},l={alignCorners:t,halfPixelCenters:s,size:e},c=_.runKernel(Va,a,l);return i?M(c,[c.shape[1],c.shape[2],c.shape[3]]):c}const Nm=P({resizeNearestNeighbor_:kS});function vS(n,e="binary",t=!1,s=.5){const o=E(n,"image","threshold"),r=.2989,i=.587,a=.114,l=o.shape[0]*o.shape[1];let c=D(qt([s]),255),u,h,d,p;if(k(o.rank===3,()=>`Error in threshold: image must be rank 3,but got rank ${o.rank}.`),k(o.shape[2]===3||o.shape[2]===1,()=>`Error in threshold: image color channel must be equal to 3 or 1but got ${o.shape[2]}.`),k(o.dtype==="int32"||o.dtype==="float32",()=>`Error in dtype: image dtype must be int32 or float32,but got dtype ${o.dtype}.`),k(e==="otsu"||e==="binary",()=>`Method must be binary or otsu, but was ${e}`),o.shape[2]===3){[u,h,d]=Qt(o,[1,1,1],-1);const g=D(u,r),x=D(h,i),b=D(d,a);p=ee(ee(g,x),b)}else p=n;if(e==="otsu"){const g=$I(oe(pm(p),"int32"),Vs([]),256);c=SS(g,l)}const f=t?Lo(p,c):Ht(p,c);return oe(D(f,255),"int32")}function SS(n,e){let t=qt([-1]),s=qt([0]),o=qt([0]),r,i,a,l,c,u;for(let h=0;h<n.size-1;h++){r=Be(n,0,h+1),i=Be(n,h+1),c=he(ue(r),e),u=he(ue(i),e);const d=ue(D(r,gi(0,r.size)));a=he(d,ue(r));const p=ui(i.shape,r.size),f=ee(gi(0,i.size),p),m=D(i,f);l=he(ue(m),ue(i));const g=pe(a,l),x=pe(a,l),b=D(c,u);o=D(D(b,g),x);const w=Ht(o,s);s=wt(w,o,s),t=wt(w,qt([h]),t)}return t}const NS=P({threshold_:vS});function TS(n,e,t="nearest",s="constant",o=0,r){const i=E(n,"image","transform","float32"),a=E(e,"transforms","transform","float32");k(i.rank===4,()=>`Error in transform: image must be rank 4,but got rank ${i.rank}.`),k(a.rank===2&&(a.shape[0]===i.shape[0]||a.shape[0]===1)&&a.shape[1]===8,()=>"Error in transform: Input transform should be batch x 8 or 1 x 8"),k(r==null||r.length===2,()=>`Error in transform: outputShape must be [height, width] or null, but got ${r}.`);const l={image:i,transforms:a},c={interpolation:t,fillMode:s,fillValue:o,outputShape:r};return _.runKernel(Eu,l,c)}const ES=P({transform_:TS});function RS(n,e,t){const s=E(n,"a","bandPart");k(s.rank>=2,()=>`bandPart(): Rank must be at least 2, got ${s.rank}.`);const o=s.shape,[r,i]=s.shape.slice(-2);let a,l;typeof e=="number"?(k(e%1===0,()=>`bandPart(): numLower must be an integer, got ${e}.`),k(e<=r,()=>`bandPart(): numLower (${e}) must not be greater than the number of rows (${r}).`),a=E(e<0?r:e,"numLower","bandPart")):(k(e.dtype==="int32",()=>"bandPart(): numLower's dtype must be an int32."),a=wt(gl(e,0),r,pi(e,r))),typeof t=="number"?(k(t%1===0,()=>`bandPart(): numUpper must be an integer, got ${t}.`),k(t<=i,()=>`bandPart(): numUpper (${t}) must not be greater than the number of columns (${i}).`),l=E(t<0?i:t,"numUpper","bandPart")):(k(t.dtype==="int32",()=>"bandPart(): numUpper's dtype must be an int32."),l=wt(gl(t,0),i,pi(t,i)));const c=M(gi(0,r,1,"int32"),[-1,1]),u=gi(0,i,1,"int32"),h=pe(c,u),d=Qn(Lo(h,a),Zs(h,tt(l))),p=nt([r,i],s.dtype);return M(Ln(xs(M(s,[-1,r,i])).map(f=>wt(d,f,p))),o)}const AS=P({bandPart_:RS});function DS(n){let e;if(Array.isArray(n)){e=!1,k(n!=null&&n.length>0,()=>"Gram-Schmidt process: input must not be null, undefined, or empty");const o=n[0].shape[0];for(let r=1;r<n.length;++r)k(n[r].shape[0]===o,()=>`Gram-Schmidt: Non-unique lengths found in the input vectors: (${n[r].shape[0]} vs. ${o})`)}else e=!0,n=Qt(n,n.shape[0],0).map(o=>eo(o,[0]));k(n.length<=n[0].shape[0],()=>`Gram-Schmidt: Number of vectors (${n.length}) exceeds number of dimensions (${n[0].shape[0]}).`);const t=[],s=n;for(let o=0;o<n.length;++o)t.push(_.tidy(()=>{let r=s[o];if(o>0)for(let i=0;i<o;++i){const a=D(ue(D(t[i],r)),t[i]);r=pe(r,a)}return he(r,fl(r,"euclidean"))}));return e?Ln(t,0):t}const FS=P({gramSchmidt_:DS});function _S(n,e=!1){if(k(n.rank>=2,()=>`qr() requires input tensor to have a rank >= 2, but got rank ${n.rank}`),n.rank===2)return Tm(n,e);{const t=n.shape.slice(0,n.shape.length-2).reduce((l,c)=>l*c),s=xs(M(n,[t,n.shape[n.shape.length-2],n.shape[n.shape.length-1]]),0),o=[],r=[];s.forEach(l=>{const[c,u]=Tm(l,e);o.push(c),r.push(u)});const i=M(Ln(o,0),n.shape),a=M(Ln(r,0),n.shape);return[i,a]}}function Tm(n,e=!1){return _.tidy(()=>{k(n.shape.length===2,()=>`qr2d() requires a 2D Tensor, but got a ${n.shape.length}D Tensor.`);const t=n.shape[0],s=n.shape[1];let o=Zf(t),r=Hs(n);const i=bh([[1]],[1,1]);let a=Hs(i);const l=t>=s?s:t;for(let c=0;c<l;++c){const u=r,h=a,d=o;[a,r,o]=_.tidy(()=>{const p=Be(r,[c,c],[t-c,1]),f=fl(p),m=Be(r,[c,c],[1,1]),g=wt(Ht(m,0),bh([[-1]]),bh([[1]])),x=pe(m,D(g,f)),b=he(p,x);b.shape[0]===1?a=Hs(i):a=Tt([i,Be(b,[1,0],[b.shape[0]-1,b.shape[1]])],0);const w=tt(he(Te(g,x),f)),y=Be(r,[c,0],[t-c,s]),C=D(w,a),$=ve(a);if(c===0)r=pe(y,Te(C,Te($,y)));else{const S=pe(y,Te(C,Te($,y)));r=Tt([Be(r,[0,0],[c,s]),S],0)}const N=ve(C),T=Be(o,[0,c],[t,o.shape[1]-c]);if(c===0)o=pe(T,Te(Te(T,a),N));else{const S=pe(T,Te(Te(T,a),N));o=Tt([Be(o,[0,0],[t,c]),S],1)}return[a,r,o]}),ge([u,h,d])}return!e&&t>s&&(o=Be(o,[0,0],[t,s]),r=Be(r,[0,0],[s,s])),[o,r]})}const OS=P({qr_:_S});const es={flipLeftRight:Qv,grayscaleToRGB:eS,resizeNearestNeighbor:Nm,resizeBilinear:Sm,rgbToGrayscale:nS,rotateWithOffset:oS,cropAndResize:Yv,nonMaxSuppression:iS,nonMaxSuppressionAsync:fS,nonMaxSuppressionWithScore:gS,nonMaxSuppressionWithScoreAsync:bS,nonMaxSuppressionPadded:wS,nonMaxSuppressionPaddedAsync:IS,threshold:NS,transform:ES},LS={bandPart:AS,gramSchmidt:FS,qr:OS};const MS=new Map,PS=new Map;class Bo{getClassName(){return this.constructor.className}static fromConfig(e,t){return new e(t)}}class rn{constructor(){this.classNameMap={}}static getMap(){return rn.instance==null&&(rn.instance=new rn),rn.instance}static register(e){rn.getMap().classNameMap[e.className]=[e,e.fromConfig]}}function Q(n,e,t){k(n.className!=null,()=>"Class being registered does not have the static className property defined."),k(typeof n.className=="string",()=>"className is required to be a string, but got type "+typeof n.className),k(n.className.length>0,()=>"Class being registered has an empty-string as its className, which is disallowed."),typeof e=="undefined"&&(e="Custom"),typeof t=="undefined"&&(t=n.className);const s=t,o=e+">"+s;return rn.register(n),MS.set(o,n),PS.set(n,o),n}class bs extends Bo{minimize(e,t=!1,s){const{value:o,grads:r}=this.computeGradients(e,s);if(s!=null){const i=s.map(a=>({name:a.name,tensor:r[a.name]}));this.applyGradients(i)}else this.applyGradients(r);return ge(r),t?o:(o.dispose(),null)}get iterations(){return this.iterations_==null&&(this.iterations_=0),this.iterations_}incrementIterations(){this.iterations_=this.iterations+1}computeGradients(e,t){return U$(e,t)}dispose(){this.iterations_!=null&&ge(this.iterations_)}saveIterations(){return Y(this,null,function*(){return this.iterations_==null&&(this.iterations_=0),{name:"iter",tensor:Re(this.iterations_,"int32")}})}getWeights(){return Y(this,null,function*(){throw new Error("getWeights() is not implemented for this optimizer yet.")})}setWeights(e){return Y(this,null,function*(){throw new Error(`setWeights() is not implemented for this optimizer class ${this.getClassName()}`)})}extractIterations(e){return Y(this,null,function*(){return this.iterations_=(yield e[0].tensor.data())[0],e.slice(1)})}}Object.defineProperty(bs,Symbol.hasInstance,{value:n=>n.minimize!=null&&n.computeGradients!=null&&n.applyGradients!=null});class Em extends bs{static get className(){return"Adadelta"}constructor(e,t,s=null){super(),this.learningRate=e,this.rho=t,this.epsilon=s,this.accumulatedGrads=[],this.accumulatedUpdates=[],s==null&&(this.epsilon=_.backend.epsilon())}applyGradients(e){(Array.isArray(e)?e.map(s=>s.name):Object.keys(e)).forEach((s,o)=>{const r=_.registeredVariables[s],i=!1;this.accumulatedGrads[o]==null&&(this.accumulatedGrads[o]={originalName:`${s}/accum_grad`,variable:B(()=>ke(r).variable(i))}),this.accumulatedUpdates[o]==null&&(this.accumulatedUpdates[o]={originalName:`${s}/accum_var`,variable:B(()=>ke(r).variable(i))});const a=Array.isArray(e)?e[o].tensor:e[s];if(a==null)return;const l=this.accumulatedGrads[o].variable,c=this.accumulatedUpdates[o].variable;B(()=>{const u=ee(D(l,this.rho),D(Ue(a),1-this.rho)),h=D(he(Et(ee(c,this.epsilon)),Et(ee(l,this.epsilon))),a),d=ee(D(c,this.rho),D(Ue(h),1-this.rho));l.assign(u),c.assign(d);const p=ee(D(h,-this.learningRate),r);r.assign(p)})}),this.incrementIterations()}dispose(){this.accumulatedUpdates!=null&&(ge(this.accumulatedGrads.map(e=>e.variable)),ge(this.accumulatedUpdates.map(e=>e.variable)))}getWeights(){return Y(this,null,function*(){const e=[...this.accumulatedGrads,...this.accumulatedUpdates];return[yield this.saveIterations()].concat(e.map(t=>({name:t.originalName,tensor:t.variable})))})}setWeights(e){return Y(this,null,function*(){e=yield this.extractIterations(e);const t=e.length/2,s=!1;this.accumulatedGrads=e.slice(0,t).map(o=>({originalName:o.name,variable:o.tensor.variable(s)})),this.accumulatedUpdates=e.slice(t,t*2).map(o=>({originalName:o.name,variable:o.tensor.variable(s)}))})}getConfig(){return{learningRate:this.learningRate,rho:this.rho,epsilon:this.epsilon}}static fromConfig(e,t){return new e(t.learningRate,t.rho,t.epsilon)}}class Rm extends bs{static get className(){return"Adagrad"}constructor(e,t=.1){super(),this.learningRate=e,this.initialAccumulatorValue=t,this.accumulatedGrads=[]}applyGradients(e){(Array.isArray(e)?e.map(s=>s.name):Object.keys(e)).forEach((s,o)=>{const r=_.registeredVariables[s];this.accumulatedGrads[o]==null&&(this.accumulatedGrads[o]={originalName:`${s}/accumulator`,variable:B(()=>ui(r.shape,this.initialAccumulatorValue).variable(!1))});const i=Array.isArray(e)?e[o].tensor:e[s];if(i==null)return;const a=this.accumulatedGrads[o].variable;B(()=>{const l=ee(a,Ue(i));a.assign(l);const c=ee(D(he(i,Et(ee(l,_.backend.epsilon()))),-this.learningRate),r);r.assign(c)})}),this.incrementIterations()}dispose(){this.accumulatedGrads!=null&&ge(this.accumulatedGrads.map(e=>e.variable))}getWeights(){return Y(this,null,function*(){return[yield this.saveIterations()].concat(this.accumulatedGrads.map(e=>({name:e.originalName,tensor:e.variable})))})}setWeights(e){return Y(this,null,function*(){e=yield this.extractIterations(e);const t=!1;this.accumulatedGrads=e.map(s=>({originalName:s.name,variable:s.tensor.variable(t)}))})}getConfig(){return{learningRate:this.learningRate,initialAccumulatorValue:this.initialAccumulatorValue}}static fromConfig(e,t){return new e(t.learningRate,t.initialAccumulatorValue)}}class Am extends bs{static get className(){return"Adam"}constructor(e,t,s,o=null){super(),this.learningRate=e,this.beta1=t,this.beta2=s,this.epsilon=o,this.accumulatedFirstMoment=[],this.accumulatedSecondMoment=[],B(()=>{this.accBeta1=Re(t).variable(),this.accBeta2=Re(s).variable()}),o==null&&(this.epsilon=_.backend.epsilon())}applyGradients(e){const t=Array.isArray(e)?e.map(s=>s.name):Object.keys(e);B(()=>{const s=pe(1,this.accBeta1),o=pe(1,this.accBeta2);t.forEach((r,i)=>{const a=_.registeredVariables[r],l=!1;this.accumulatedFirstMoment[i]==null&&(this.accumulatedFirstMoment[i]={originalName:`${r}/m`,variable:B(()=>ke(a).variable(l))}),this.accumulatedSecondMoment[i]==null&&(this.accumulatedSecondMoment[i]={originalName:`${r}/v`,variable:B(()=>ke(a).variable(l))});const c=Array.isArray(e)?e[i].tensor:e[r];if(c==null)return;const u=this.accumulatedFirstMoment[i].variable,h=this.accumulatedSecondMoment[i].variable,d=ee(D(u,this.beta1),D(c,1-this.beta1)),p=ee(D(h,this.beta2),D(Ue(c),1-this.beta2)),f=he(d,s),m=he(p,o);u.assign(d),h.assign(p);const g=ee(D(he(f,ee(Et(m),this.epsilon)),-this.learningRate),a);a.assign(g)}),this.accBeta1.assign(D(this.accBeta1,this.beta1)),this.accBeta2.assign(D(this.accBeta2,this.beta2))}),this.incrementIterations()}dispose(){this.accBeta1.dispose(),this.accBeta2.dispose(),this.accumulatedFirstMoment!=null&&ge(this.accumulatedFirstMoment.map(e=>e.variable)),this.accumulatedSecondMoment!=null&&ge(this.accumulatedSecondMoment.map(e=>e.variable))}getWeights(){return Y(this,null,function*(){const e=[...this.accumulatedFirstMoment,...this.accumulatedSecondMoment];return[yield this.saveIterations()].concat(e.map(t=>({name:t.originalName,tensor:t.variable})))})}setWeights(e){return Y(this,null,function*(){e=yield this.extractIterations(e),B(()=>{this.accBeta1.assign(Ys(this.beta1,this.iterations_+1)),this.accBeta2.assign(Ys(this.beta2,this.iterations_+1))});const t=e.length/2,s=!1;this.accumulatedFirstMoment=e.slice(0,t).map(o=>({originalName:o.name,variable:o.tensor.variable(s)})),this.accumulatedSecondMoment=e.slice(t,t*2).map(o=>({originalName:o.name,variable:o.tensor.variable(s)}))})}getConfig(){return{learningRate:this.learningRate,beta1:this.beta1,beta2:this.beta2,epsilon:this.epsilon}}static fromConfig(e,t){return new e(t.learningRate,t.beta1,t.beta2,t.epsilon)}}class Dm extends bs{static get className(){return"Adamax"}constructor(e,t,s,o=null,r=0){super(),this.learningRate=e,this.beta1=t,this.beta2=s,this.epsilon=o,this.decay=r,this.accumulatedFirstMoment=[],this.accumulatedWeightedInfNorm=[],B(()=>{this.iteration=Re(0).variable(),this.accBeta1=Re(t).variable()}),o==null&&(this.epsilon=_.backend.epsilon())}applyGradients(e){const t=Array.isArray(e)?e.map(s=>s.name):Object.keys(e);B(()=>{const s=pe(1,this.accBeta1),o=he(-this.learningRate,ee(D(this.iteration,this.decay),1));t.forEach((r,i)=>{const a=_.registeredVariables[r],l=!1;this.accumulatedFirstMoment[i]==null&&(this.accumulatedFirstMoment[i]={originalName:`${r}/m`,variable:ke(a).variable(l)}),this.accumulatedWeightedInfNorm[i]==null&&(this.accumulatedWeightedInfNorm[i]={originalName:`${r}/v`,variable:ke(a).variable(l)});const c=Array.isArray(e)?e[i].tensor:e[r];if(c==null)return;const u=this.accumulatedFirstMoment[i].variable,h=this.accumulatedWeightedInfNorm[i].variable,d=ee(D(u,this.beta1),D(c,1-this.beta1)),p=D(h,this.beta2),f=_t(c),m=gs(p,f);u.assign(d),h.assign(m);const g=ee(D(he(o,s),he(d,ee(m,this.epsilon))),a);a.assign(g)}),this.iteration.assign(ee(this.iteration,1)),this.accBeta1.assign(D(this.accBeta1,this.beta1))}),this.incrementIterations()}dispose(){this.accBeta1.dispose(),this.iteration.dispose(),this.accumulatedFirstMoment!=null&&ge(this.accumulatedFirstMoment.map(e=>e.variable)),this.accumulatedWeightedInfNorm!=null&&ge(this.accumulatedWeightedInfNorm.map(e=>e.variable))}getWeights(){return Y(this,null,function*(){throw new Error("getWeights() is not implemented for Adamax yet.")})}setWeights(e){return Y(this,null,function*(){throw new Error("setWeights() is not implemented for Adamax yet.")})}getConfig(){return{learningRate:this.learningRate,beta1:this.beta1,beta2:this.beta2,epsilon:this.epsilon,decay:this.decay}}static fromConfig(e,t){return new e(t.learningRate,t.beta1,t.beta2,t.epsilon,t.decay)}}class Th extends bs{static get className(){return"SGD"}constructor(e){super(),this.learningRate=e,this.setLearningRate(e)}applyGradients(e){(Array.isArray(e)?e.map(s=>s.name):Object.keys(e)).forEach((s,o)=>{const r=Array.isArray(e)?e[o].tensor:e[s];if(r==null)return;const i=_.registeredVariables[s];B(()=>{const a=ee(D(this.c,r),i);i.assign(a)})}),this.incrementIterations()}setLearningRate(e){this.learningRate=e,this.c!=null&&this.c.dispose(),this.c=An(Re(-e))}dispose(){this.c.dispose()}getWeights(){return Y(this,null,function*(){return[yield this.saveIterations()]})}setWeights(e){return Y(this,null,function*(){if(e=yield this.extractIterations(e),e.length!==0)throw new Error("SGD optimizer does not have settable weights.")})}getConfig(){return{learningRate:this.learningRate}}static fromConfig(e,t){return new e(t.learningRate)}}class Fm extends Th{static get className(){return"Momentum"}constructor(e,t,s=!1){super(e),this.learningRate=e,this.momentum=t,this.useNesterov=s,this.accumulations=[],this.m=Re(this.momentum)}applyGradients(e){(Array.isArray(e)?e.map(s=>s.name):Object.keys(e)).forEach((s,o)=>{const r=_.registeredVariables[s];this.accumulations[o]==null&&(this.accumulations[o]={originalName:`${s}/momentum`,variable:B(()=>ke(r).variable(!1))});const i=this.accumulations[o].variable,a=Array.isArray(e)?e[o].tensor:e[s];a!=null&&B(()=>{let l;const c=ee(D(this.m,i),a);this.useNesterov?l=ee(D(this.c,ee(a,D(c,this.m))),r):l=ee(D(this.c,c),r),i.assign(c),r.assign(l)})}),this.incrementIterations()}dispose(){this.m.dispose(),this.accumulations!=null&&ge(this.accumulations.map(e=>e.variable))}setMomentum(e){this.momentum=e}getWeights(){return Y(this,null,function*(){return[yield this.saveIterations()].concat(this.accumulations.map(e=>({name:e.originalName,tensor:e.variable})))})}setWeights(e){return Y(this,null,function*(){e=yield this.extractIterations(e);const t=!1;this.accumulations=e.map(s=>({originalName:s.name,variable:s.tensor.variable(t)}))})}getConfig(){return{learningRate:this.learningRate,momentum:this.momentum,useNesterov:this.useNesterov}}static fromConfig(e,t){return new e(t.learningRate,t.momentum,t.useNesterov)}}class _m extends bs{static get className(){return"RMSProp"}constructor(e,t=.9,s=0,o=null,r=!1){if(super(),this.learningRate=e,this.decay=t,this.momentum=s,this.epsilon=o,this.accumulatedMeanSquares=[],this.accumulatedMoments=[],this.accumulatedMeanGrads=[],this.centered=r,o==null&&(this.epsilon=_.backend.epsilon()),e==null)throw new Error("learningRate for RMSPropOptimizer must be defined.")}applyGradients(e){(Array.isArray(e)?e.map(s=>s.name):Object.keys(e)).forEach((s,o)=>{const r=_.registeredVariables[s],i=!1;this.accumulatedMeanSquares[o]==null&&(this.accumulatedMeanSquares[o]={originalName:`${s}/rms`,variable:B(()=>ke(r).variable(i))}),this.accumulatedMoments[o]==null&&(this.accumulatedMoments[o]={originalName:`${s}/momentum`,variable:B(()=>ke(r).variable(i))}),this.accumulatedMeanGrads[o]==null&&this.centered&&(this.accumulatedMeanGrads[o]={originalName:`${s}/mg`,variable:B(()=>ke(r).variable(i))});const a=Array.isArray(e)?e[o].tensor:e[s];if(a==null)return;const l=this.accumulatedMeanSquares[o].variable,c=this.accumulatedMoments[o].variable;B(()=>{const u=ee(D(l,this.decay),D(Ue(a),1-this.decay));if(this.centered){const h=this.accumulatedMeanGrads[o].variable,d=ee(D(h,this.decay),D(a,1-this.decay)),p=he(D(a,this.learningRate),Et(pe(u,ee(Ue(d),this.epsilon)))),f=ee(D(c,this.momentum),p);l.assign(u),h.assign(d),c.assign(f);const m=pe(r,f);r.assign(m)}else{const h=ee(D(l,this.decay),D(Ue(a),1-this.decay)),d=ee(D(c,this.momentum),he(D(a,this.learningRate),Et(ee(h,this.epsilon))));l.assign(h),c.assign(d);const p=pe(r,d);r.assign(p)}})}),this.incrementIterations()}dispose(){this.accumulatedMeanSquares!=null&&ge(this.accumulatedMeanSquares.map(e=>e.variable)),this.accumulatedMeanGrads!=null&&this.centered&&ge(this.accumulatedMeanGrads.map(e=>e.variable)),this.accumulatedMoments!=null&&ge(this.accumulatedMoments.map(e=>e.variable))}getWeights(){return Y(this,null,function*(){const e=[...this.accumulatedMeanSquares,...this.accumulatedMoments];return this.centered&&e.push(...this.accumulatedMeanGrads),[yield this.saveIterations()].concat(e.map(t=>({name:t.originalName,tensor:t.variable})))})}setWeights(e){return Y(this,null,function*(){e=yield this.extractIterations(e);const t=this.centered?e.length/3:e.length/2,s=!1;this.accumulatedMeanSquares=e.slice(0,t).map(o=>({originalName:o.name,variable:o.tensor.variable(s)})),this.accumulatedMoments=e.slice(t,t*2).map(o=>({originalName:o.name,variable:o.tensor.variable(s)})),this.centered&&(this.accumulatedMeanGrads=e.slice(t*2,t*3).map(o=>({originalName:o.name,variable:o.tensor.variable(s)})))})}getConfig(){return{learningRate:this.learningRate,decay:this.decay,momentum:this.momentum,epsilon:this.epsilon,centered:this.centered}}static fromConfig(e,t){return new e(t.learningRate,t.decay,t.momentum,t.epsilon,t.centered)}}const BS=[Em,Rm,Am,Dm,Fm,_m,Th];function zS(){for(const n of BS)Q(n)}function Om(n,e,t,s){i(n),t=t==null?0:t,s=s==null?1:s,a(t,s);let o=0;const r=l=>(l.then(c=>{const u=t+ ++o/n.length*(s-t);return e(u),c}),l);function i(l){k(l!=null&&Array.isArray(l)&&l.length>0,()=>"promises must be a none empty array")}function a(l,c){k(l>=0&&l<=1,()=>`Progress fraction must be in range [0, 1], but got startFraction ${l}`),k(c>=0&&c<=1,()=>`Progress fraction must be in range [0, 1], but got endFraction ${c}`),k(c>=l,()=>`startFraction must be no more than endFraction, but got startFraction ${l} and endFraction ${c}`)}return Promise.all(n.map(r))}function VS(n,e){return Y(this,null,function*(){e==null&&(e={});const t=e.fetchFunc==null?V().platform.fetch:e.fetchFunc,s=n.map(h=>t(h,e.requestInit,{isBinary:!0})),a=(e.onProgress==null?yield Promise.all(s):yield Om(s,e.onProgress,0,.5)).map(h=>h.arrayBuffer());return e.onProgress==null?yield Promise.all(a):yield Om(a,e.onProgress,.5,1)})}function WS(n,e){var t;const s=e.fetchFunc==null?V().platform.fetch:e.fetchFunc;let o=0,r;return(t=e.onProgress)===null||t===void 0||t.call(e,0),new ReadableStream({pull:i=>Y(null,null,function*(){for(var a;o<n.length;){r||(r=(yield s(n[o],e.requestInit,{isBinary:!0})).body.getReader());const{done:l,value:c}=yield r.read();if(l){o++,r=void 0,(a=e.onProgress)===null||a===void 0||a.call(e,o/n.length);continue}i.enqueue(c);return}i.close()})})}const US="application/octet-stream",GS="application/json";class Eh{constructor(e,t){if(this.DEFAULT_METHOD="POST",t==null&&(t={}),this.weightPathPrefix=t.weightPathPrefix,this.weightUrlConverter=t.weightUrlConverter,t.fetchFunc!=null?(k(typeof t.fetchFunc=="function",()=>"Must pass a function that matches the signature of `fetch` (see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)"),this.fetch=t.fetchFunc):this.fetch=V().platform.fetch,k(e!=null&&e.length>0,()=>"URL path for http must not be null, undefined or empty."),Array.isArray(e)&&k(e.length===2,()=>`URL paths for http must have a length of 2, (actual length is ${e.length}).`),this.path=e,t.requestInit!=null&&t.requestInit.body!=null)throw new Error("requestInit is expected to have no pre-existing body, but has one.");this.requestInit=t.requestInit||{},this.loadOptions=t}save(e){return Y(this,null,function*(){if(e.modelTopology instanceof ArrayBuffer)throw new Error("BrowserHTTPRequest.save() does not support saving model topology in binary formats yet.");const t=Object.assign({method:this.DEFAULT_METHOD},this.requestInit);t.body=new FormData;const s=[{paths:["./model.weights.bin"],weights:e.weightSpecs}],o=oC(e,s);if(t.body.append("model.json",new Blob([JSON.stringify(o)],{type:GS}),"model.json"),e.weightData!=null){const i=ds.join(e.weightData);t.body.append("model.weights.bin",new Blob([i],{type:US}),"model.weights.bin")}const r=yield this.fetch(this.path,t);if(r.ok)return{modelArtifactsInfo:Uu(e),responses:[r]};throw new Error(`BrowserHTTPRequest.save() failed due to HTTP response status ${r.status}.`)})}loadModelJSON(){return Y(this,null,function*(){const e=yield this.fetch(this.path,this.requestInit);if(!e.ok)throw new Error(`Request to ${this.path} failed with status code ${e.status}. Please verify this URL points to the model JSON of the model to load.`);let t;try{t=yield e.json()}catch(r){let i=`Failed to parse model JSON of response from ${this.path}.`;throw this.path.endsWith(".pb")?i+=" Your path contains a .pb file extension. Support for .pb models have been removed in TensorFlow.js 1.0 in favor of .json models. You can re-convert your Python TensorFlow model using the TensorFlow.js 1.0 conversion scripts or you can convert your.pb models with the 'pb2json'NPM script in the tensorflow/tfjs-converter repository.":i+=" Please make sure the server is serving valid JSON for this request.",new Error(i)}const s=t.modelTopology,o=t.weightsManifest;if(s==null&&o==null)throw new Error(`The JSON from HTTP path ${this.path} contains neither model topology or manifest for weights.`);return t})}load(){return Y(this,null,function*(){if(this.loadOptions.streamWeights)return this.loadStream();const e=yield this.loadModelJSON();return iC(e,t=>this.loadWeights(t))})}loadStream(){return Y(this,null,function*(){const e=yield this.loadModelJSON(),t=yield this.getWeightUrls(e.weightsManifest),s=Df(e.weightsManifest),o=()=>WS(t,this.loadOptions);return Object.assign(Object.assign({},e),{weightSpecs:s,getWeightStream:o})})}getWeightUrls(e){return Y(this,null,function*(){const t=Array.isArray(this.path)?this.path[1]:this.path,[s,o]=HS(t),r=this.weightPathPrefix||s,i=[],a=[];for(const l of e)for(const c of l.paths)this.weightUrlConverter!=null?a.push(this.weightUrlConverter(c)):i.push(r+c+o);return this.weightUrlConverter&&i.push(...yield Promise.all(a)),i})}loadWeights(e){return Y(this,null,function*(){const t=yield this.getWeightUrls(e),s=Df(e),o=yield VS(t,this.loadOptions);return[s,o]})}}Eh.URL_SCHEME_REGEX=/^https?:\/\//;function HS(n){const e=n.lastIndexOf("/"),t=n.lastIndexOf("?"),s=n.substring(0,e),o=t>e?n.substring(t):"";return[s+"/",o]}function Lm(n){return n.match(Eh.URL_SCHEME_REGEX)!=null}const Mm=(n,e)=>{if(typeof fetch=="undefined"&&(e==null||e.fetchFunc==null))return null;{let t=!0;if(Array.isArray(n)?t=n.every(s=>Lm(s)):t=Lm(n),t)return Pm(n,e)}return null};mt.registerSaveRouter(Mm),mt.registerLoadRouter(Mm);function Pm(n,e){return new Eh(n,e)}function qS(n,e){return Pm(n,e)}function Rh(n,e){const t=n.shape.length,s=e.shape.length;if(t<1)throw new Error(`tf.gatherND() expects the input to be rank 1 or higher, but the rank was ${t}.`);if(s<1)throw new Error(`tf.gatherND() expects the indices to be rank 1 or higher, but the rank was ${s}.`);if(e.dtype!=="int32")throw new Error(`tf.gatherND() expects the indices to be int32 type, but the dtype was ${e.dtype}.`);if(e.shape[s-1]>t)throw new Error(`index innermost dimension length must be <= tensor rank; saw: ${e.shape[s-1]} vs. ${t}`);if(q(n.shape)===0)throw new Error(`Requested more than 0 entries, but input is empty. Input shape: ${n.shape}.`);const o=e.shape,r=o[o.length-1];let i=1;for(let h=0;h<o.length-1;++h)i*=o[h];const a=n.shape,l=o.slice();l.pop();let c=1;for(let h=r;h<t;++h)c*=a[h],l.push(a[h]);const u=[...ce(n.shape).map(h=>h/c),1].slice(0,r);return[l,i,c,u]}const Ah=-2,jS=-1;function Dh(n,e,t){const s=n.shape.length;k(s===e.length,()=>`Error in slice${s}D: Length of begin ${e} must match the rank of the array (${s}).`),k(s===t.length,()=>`Error in slice${s}D: Length of size ${t} must match the rank of the array (${s}).`);for(let o=0;o<s;++o)k(e[o]+t[o]<=n.shape[o],()=>`Error in slice${s}D: begin[${o}] + size[${o}] (${e[o]+t[o]}) would overflow input.shape[${o}] (${n.shape[o]})`)}function KS(n){const e=[];let t=0;for(;n>0;)n&1&&e.push(t),n/=2,t++;return e}function Fh(n,e,t){const s=[];for(let o=0;o<n.length;o++)s[o]=Math.ceil((e[o]-n[o])/t[o]);return s}function Bm(n,e,t,s){const o=[...n];for(let r=o.length;r<s.length;r++)o.push(1);for(let r=0;r<t;r++)r===0?o[e]=1:(o.splice(e,0,1),o.pop());return o}function zm(n,e,t){return t<=n?t:t-(e-1)}function Vm(n,e){const t=[];for(let s=0;s<n;s++)t.push(e+s);return t}function XS(n,e,t,s,o,r,i,a,l){const c=n.length;let u=new Array(c),h=new Array(c),d=new Array(c);if(e.length&&t>0){const p=e[0],f=t+1;u=Wm(i,p,f,s,n),h=Um(a,p,f,o,n),d=Bm(r,p,f,n)}else for(let p=0;p<c;p++)u[p]=Hm(i,s,r,n,p,l),h[p]=qm(a,o,r,n,p,l),d[p]=Gm(r,p,l);return{begin:u,end:h,strides:d}}function Wm(n,e,t,s,o){const r=[...o],i=Vm(t,e);for(let a=0;a<r.length;a++)if(i.indexOf(a)>-1)r[a]=0;else{const l=zm(e,t,a);let c=s[l];n&1<<l&&(c=0),r[a]=c}return r}function Um(n,e,t,s,o){const r=[...o],i=Vm(t,e);for(let a=0;a<r.length;a++)if(i.indexOf(a)>-1)r[a]=Number.MAX_SAFE_INTEGER;else{const l=zm(e,t,a);let c=s[l];n&1<<l&&(c=Number.MAX_SAFE_INTEGER),r[a]=c}for(let a=0;a<r.length;a++){const l=o[a];r[a]<0&&(r[a]+=l),r[a]=fn(0,r[a],o[a])}return r}function Gm(n,e,t){let s=n[e];return(t&1<<e||s==null)&&(s=1),s}function Hm(n,e,t,s,o,r){let i=e[o];const a=t[o]||1;(n&1<<o||r&1<<o||i==null)&&(a>0?i=Number.MIN_SAFE_INTEGER:i=Number.MAX_SAFE_INTEGER);const l=s[o];return i<0&&(i+=l),i=fn(0,i,l-1),i}function qm(n,e,t,s,o,r){let i=e[o];const a=t[o]||1;(n&1<<o||r&1<<o||i==null)&&(a>0?i=Number.MAX_SAFE_INTEGER:i=Number.MIN_SAFE_INTEGER);const l=s[o];return i<0&&(i+=l),a>0?i=fn(0,i,l):i=fn(-1,i,l-1),i}function _h(n,e,t){let s=t.length;for(let o=0;o<t.length;o++)if(t[o]>1){s=o;break}for(let o=s+1;o<t.length;o++)if(e[o]>0||t[o]!==n[o])return!1;return!0}function Oh(n,e){let t=n.length>0?n[n.length-1]:1;for(let s=0;s<n.length-1;s++)t+=n[s]*e[s];return t}function Tl(n,e,t){let s;const o=n.shape.length;typeof e=="number"?s=[e,...new Array(o-1).fill(0)]:e.length<o?s=e.concat(new Array(o-e.length).fill(0)):s=e.slice(),s.forEach(i=>{k(i!==-1,()=>"slice() does not support negative begin indexing.")});let r;return t==null?r=new Array(o).fill(-1):typeof t=="number"?r=[t,...new Array(o-1).fill(-1)]:t.length<o?r=t.concat(new Array(o-t.length).fill(-1)):r=t,r=r.map((i,a)=>i>=0?i:(k(i===-1,()=>`Negative size values should be exactly -1 but got ${i} for the slice() size at index ${a}.`),n.shape[a]-s[a])),[s,r]}function Lh(n,e,t,s,o,r,i,a,l){let c;if(s==null?(c=new Array(e.length),c.fill(1)):c=s,i!=null&&(i&i-1)!==0)throw new Error("Multiple ellipses in slice is not allowed.");let u=!1;const h={dims:c.length,numAddAxisAfterEllipsis:0,begin:e.slice(),end:t.slice(),strides:c.slice(),beginMask:o,endMask:r,ellipsisMask:i,newAxisMask:a,shrinkAxisMask:l};for(let w=0;w<h.dims;w++)u&&(1<<w&a)!==0&&h.numAddAxisAfterEllipsis++,1<<w&i&&(u=!0);u||(h.ellipsisMask|=1<<h.dims,h.dims++);const d={dims:n.length,beginMask:0,endMask:0,beginValid:!1,endValid:!1};YS(h,d);let p=!0,f=!0,m=!0;const g=[],x=[];for(let w=0;w<n.length;++w){if(d.strides[w]===0)throw Error(`strides[${w}] must be non-zero`);const y=!!(d.shrinkAxisMask&1<<w),C=n[w];if(C===-1){g.push(y?1:-1);continue}const $=[d.beginMask&1<<w,d.endMask&1<<w],N=[d.strides[w]>0?0:-1,d.strides[w]>0?C:C-1];if(y&&d.strides[w]<=0)throw Error("only stride 1 allowed on non-range indexing.");m=m&&d.strides[w]===1;const T=!!(d.beginMask&1<<w&&d.endMask&1<<w);if(d.beginValid&&d.endValid){if(y){const R=d.begin[w]<0?C+d.begin[w]:d.begin[w];if(d.begin[w]=R,d.end[w]=d.begin[w]+1,R<0||R>=C)throw Error(`slice index ${d.begin[w]} of dimension ${w} out of bounds.`)}else d.begin[w]=jm(d.begin[w],0,d.strides[w],C,$,N),d.end[w]=jm(d.end[w],1,d.strides[w],C,$,N);const I=d.strides[w]===1&&d.begin[w]===0&&d.end[w]===C;p=p&&I,f=f&&(w===0&&d.strides[w]===1||I)}else p=p&&d.strides[w]===1&&T,f=f&&(w===0&&d.strides[w]===1||T);let S,v=!1;if(d.beginValid&&d.endValid?(S=d.end[w]-d.begin[w],v=!0):y?(S=1,v=!0):T&&C>=0&&(d.strides[w]<0?S=-C:S=C,v=!0),v){let I;S===0||S<0!=d.strides[w]<0?I=0:I=Math.trunc(S/d.strides[w])+(S%d.strides[w]!==0?1:0),g.push(I)}else g.push(-1)}for(let w=0;w<d.finalShapeGatherIndices.length;++w){const y=d.finalShapeGatherIndices[w];y>=0?x.push(g[y]):y===Ah&&x.push(1)}return{finalShapeSparse:x.filter((w,y)=>d.finalShapeGatherIndices[y]!==Ah),finalShape:x,isIdentity:p,sliceDim0:f,isSimpleSlice:m,begin:d.begin,end:d.end,strides:d.strides}}function YS(n,e){e.beginMask=0,e.endMask=0,e.shrinkAxisMask=0;let t=0;e.beginValid=n.begin!=null,e.endValid=n.end!=null,e.begin=new Array(e.dims),e.end=new Array(e.dims),e.strides=new Array(e.dims),e.finalShapeGatherIndices=[],e.finalShapeGatherIndicesSparse=[],e.inputShapeGatherIndicesSparse=new Array(e.dims);for(let s=0;s<n.dims;s++)if(1<<s&n.ellipsisMask){const o=Math.min(e.dims-(n.dims-s)+1+n.numAddAxisAfterEllipsis,e.dims);for(;t<o;t++)e.begin[t]=0,e.end[t]=0,e.strides[t]=1,e.beginMask|=1<<t,e.endMask|=1<<t,e.finalShapeGatherIndices.push(t),e.finalShapeGatherIndicesSparse.push(-1),e.inputShapeGatherIndicesSparse[t]=s}else if(1<<s&n.newAxisMask)e.finalShapeGatherIndices.push(Ah),e.finalShapeGatherIndicesSparse.push(-1);else{if(t===e.begin.length)throw Error(`Index out of range using input dim ${t}; input has only ${e.dims} dims, ${e.begin.length}.`);n.begin!=null&&(e.begin[t]=n.begin[s]),n.end!=null&&(e.end[t]=n.end[s]),e.strides[t]=n.strides[s],n.beginMask&1<<s&&(e.beginMask|=1<<t),n.endMask&1<<s&&(e.endMask|=1<<t),n.shrinkAxisMask&1<<s?(e.finalShapeGatherIndices.push(jS),e.finalShapeGatherIndicesSparse.push(-1),e.shrinkAxisMask|=1<<t):(e.finalShapeGatherIndices.push(t),e.finalShapeGatherIndicesSparse.push(s)),e.inputShapeGatherIndicesSparse[t]=s,t++}}function jm(n,e,t,s,o,r){if(o[e])return t>0?r[e]:r[e+1&1];{const i=n<0?s+n:n;return i<r[0]?r[0]:i>r[1]?r[1]:i}}var ZS=Object.freeze({__proto__:null,assertParamsValid:Dh,computeFlatOffset:Oh,computeOutShape:Fh,getNormalizedAxes:XS,isSliceContinous:_h,maskToAxes:KS,parseSliceParams:Tl,sliceInfo:Lh,startForAxis:Hm,startIndicesWithElidedDims:Wm,stopForAxis:qm,stopIndicesWithElidedDims:Um,stridesForAxis:Gm,stridesWithElidedDims:Bm});class QS{static sgd(e){return new Th(e)}static momentum(e,t,s=!1){return new Fm(e,t,s)}static rmsprop(e,t=.9,s=0,o=null,r=!1){return new _m(e,t,s,o,r)}static adam(e=.001,t=.9,s=.999,o=null){return new Am(e,t,s,o)}static adadelta(e=.001,t=.95,s=null){return new Em(e,t,s)}static adamax(e=.002,t=.9,s=.999,o=null,r=0){return new Dm(e,t,s,o,r)}static adagrad(e,t=.1){return new Rm(e,t)}}const zo=QS;const JS=typeof requestAnimationFrame!="undefined"?requestAnimationFrame:typeof setImmediate!="undefined"?setImmediate:n=>n();function Km(){return new Promise(n=>JS(()=>n()))}function Mh(n,e){const t=n[0].length;n.forEach((o,r)=>{k(o.length===t,()=>`Error in concat${t}D: rank of tensors[${r}] must be the same as the rank of the rest (${t})`)}),k(e>=0&&e<t,()=>`Error in concat${t}D: axis must be between 0 and ${t-1}.`);const s=n[0];n.forEach((o,r)=>{for(let i=0;i<t;i++)k(i===e||o[i]===s[i],()=>`Error in concat${t}D: Shape of tensors[${r}] (${o}) does not match the shape of the rest (${s}) along the non-concatenated axis ${r}.`)})}function Mn(n,e){const t=n[0].slice();for(let s=1;s<n.length;s++)t[e]+=n[s][e];return t}var wn;(function(n){n[n.FIRST_DIM_SIZE=0]="FIRST_DIM_SIZE",n[n.VALUE_ROWIDS=1]="VALUE_ROWIDS",n[n.ROW_LENGTHS=2]="ROW_LENGTHS",n[n.ROW_SPLITS=3]="ROW_SPLITS",n[n.ROW_LIMITS=4]="ROW_LIMITS",n[n.ROW_STARTS=5]="ROW_STARTS"})(wn||(wn={}));function Xm(n,e,t){let s=new Array;if(t==null&&e==null)return s;if(e==null)for(;s.length<n+t.length;)s.push(-1);else s=e.slice();if(t==null)return s;if(n+t.length!==s.length)throw new Error(`rt input.shape and shape=${e} are incompatible: rt input.rank = ${n+t.length}, but shape.rank = ${s.length}`);for(let o=1;o<t.length;++o){const r=t[o],i=s[s.length-t.length+o],a=s[i];if(r>=0)if(a>=0){if(a!==r)throw new Error(`rt input.shape and shape=${e} are incompatible: rt input.shape[${o+n}] = ${r} but shape[${o+n}] = ${a}`)}else s[i]=r}return s}function Ym(n){const e={FIRST_DIM_SIZE:wn.FIRST_DIM_SIZE,VALUE_ROWIDS:wn.VALUE_ROWIDS,ROW_LENGTHS:wn.ROW_LENGTHS,ROW_SPLITS:wn.ROW_SPLITS,ROW_LIMITS:wn.ROW_LIMITS,ROW_STARTS:wn.ROW_STARTS},t=[];for(const s of n)if(s in e)t.push(e[s]);else break;return t}function Zm(n){return n.length===0?0:n[0]===wn.FIRST_DIM_SIZE?n.length-1:n.length}function Qm(n,e){if(n==null||e==null)return;const t=n.length,s=e.length;if(t>=s)throw new Error(`defaultValue.shape=${n} and ragged tensor flatValues.shape=${e}, are incompatible: defaultValue.rank = ${t} must be less than ragged tensor input flatValues.rank = ${s})`);for(let o=0;o<Math.min(t,s-1);++o){const r=n[o],i=e[o+1];if(r>=0&&i>=0&&r!==1&&r!==i)throw new Error(`defaultValue.shape=${n}, and ragged tensor input flatValues.shape=${e} are incompatible: defaultValue.shape[${o-n.length}] = ${r} but ragged tensor input.flatValues.shape[${o-n.length}] = ${i}`)}}const Ph=30;function El(n){return n<=Ph?n:Pc(n,Math.floor(Math.sqrt(n)))}function Bh(n,e,t){const s=t*(typeof n=="number"?n:n[0]),o=e*(typeof n=="number"?n:n[1]);return[s,o]}function bi(n,e,t,s=!0){let o=[];if(s)o=o.concat(e.slice(0)),o.push(n[0]/t),o=o.concat(n.slice(1));else{o=o.concat(n[0]);const r=e.length;for(let i=0;i<r;++i)o=o.concat([n[i+1]/e[i],e[i]]);o=o.concat(n.slice(r+1))}return o}function yi(n,e,t=!0){const s=[];if(t){s.push(e);for(let o=e+1;o<n;++o)o<=2*e?(s.push(o),s.push(o-(e+1))):s.push(o)}else{const o=[],r=[];for(let i=1;i<n;++i)i>=e*2+1||i%2===1?r.push(i):o.push(i);s.push(...o),s.push(0),s.push(...r)}return s}function wi(n,e,t,s=!0){const o=[];s?o.push(n[0]/t):o.push(n[0]*t);for(let r=1;r<n.length;++r)r<=e.length?s?o.push(e[r-1]*n[r]):o.push(n[r]/e[r-1]):o.push(n[r]);return o}function zh(n,e){const t=[0];for(let s=0;s<e;++s)t.push(n[s][0]);return t}function Vh(n,e,t){const s=n.slice(0,1);for(let o=0;o<t;++o)s.push(n[o+1]-e[o][0]-e[o][1]);return s}const Rl=1.7580993408473768,Al=1.0507009873554805;const Wh=.3275911,Uh=.254829592,Gh=-.284496736,Hh=1.421413741,qh=-1.453152027,jh=1.061405429;function ts(n,e){if(n.length!==e.length)throw new Error(`Cannot merge real and imag arrays of different lengths. real:${n.length}, imag: ${e.length}.`);const t=new Float32Array(n.length*2);for(let s=0;s<t.length;s+=2)t[s]=n[s/2],t[s+1]=e[s/2];return t}function Jm(n){const e=new Float32Array(n.length/2),t=new Float32Array(n.length/2);for(let s=0;s<n.length;s+=2)e[s/2]=n[s],t[s/2]=n[s+1];return{real:e,imag:t}}function eg(n){const e=Math.ceil(n.length/4),t=new Float32Array(e),s=new Float32Array(e);for(let o=0;o<n.length;o+=4)t[Math.floor(o/4)]=n[o],s[Math.floor(o/4)]=n[o+1];return{real:t,imag:s}}function tg(n){const e=Math.floor(n.length/4),t=new Float32Array(e),s=new Float32Array(e);for(let o=2;o<n.length;o+=4)t[Math.floor(o/4)]=n[o],s[Math.floor(o/4)]=n[o+1];return{real:t,imag:s}}function Kh(n,e){const t=n[e*2],s=n[e*2+1];return{real:t,imag:s}}function ng(n,e,t,s){n[s*2]=e,n[s*2+1]=t}function sg(n,e){const t=new Float32Array(n/2),s=new Float32Array(n/2);for(let o=0;o<Math.ceil(n/2);o++){const r=(e?2:-2)*Math.PI*(o/n);t[o]=Math.cos(r),s[o]=Math.sin(r)}return{real:t,imag:s}}function og(n,e,t){const s=(t?2:-2)*Math.PI*(n/e),o=Math.cos(s),r=Math.sin(s);return{real:o,imag:r}}const Xh="->",e2=/->/g,rg=",",ig="...";function Yh(n,e){n=n.replace(/\s/g,"");const t=(n.length-n.replace(e2,"").length)/Xh.length;if(t<1)throw new Error("Equations without an arrow are not supported.");if(t>1)throw new Error(`Equation must contain exactly one arrow ("${Xh}").`);const[s,o]=n.split(Xh);k(s.indexOf(ig)===-1,()=>`The ellipsis notation ("${ig}") is not supported yet.`);const r=s.split(rg),i=r.length;if(e!==i)throw new Error(`Expected ${i} input tensors, received ${e}`);if(i>2)throw new Error("Support for more than 2 input tensors is not implemented yet.");const a=[];for(let d=0;d<o.length;++d){const p=o[d];if(!r.some(f=>f.indexOf(p)!==-1))throw new Error(`Output subscripts contain the label ${p} not present in the input subscripts.`);a.indexOf(p)===-1&&a.push(p)}for(let d=0;d<s.length;++d){const p=s[d];a.indexOf(p)===-1&&p!==rg&&a.push(p)}const l=new Array(r.length);for(let d=0;d<i;++d){if(new Set(r[d].split("")).size!==r[d].length)throw new Error(`Found duplicate axes in input component ${r[d]}. Support for duplicate axes in input is not implemented yet.`);l[d]=[];for(let p=0;p<r[d].length;++p)l[d].push(a.indexOf(r[d][p]))}const c=a.length,u=o.length,h=[];for(let d=u;d<c;++d)h.push(d);return{allDims:a,summedDims:h,idDims:l}}function Zh(n,e){let t=new Array(n);t.fill(-1);for(let o=0;o<e.length;++o)t[e[o]]=o;const s=[];for(let o=0;o<n;++o)t[o]===-1&&s.push(o);return t=t.filter(o=>o!==-1),{permutationIndices:t,expandDims:s}}function Qh(n,e,t){const s=new Array(n);for(let o=0;o<t.length;++o){const r=t[o].shape;for(let i=0;i<e[o].length;++i)s[e[o][i]]===void 0?s[e[o][i]]=r[i]:k(s[e[o][i]]===r[i],()=>`Expected dimension ${s[e[o][i]]} at axis ${i} of input shaped ${JSON.stringify(r)}, but got dimension ${r[i]}`)}}function Jh(n,e){const t=n,s=[];let o=0;n.length===0&&t.push(-1),o=n.length+1;for(let i=0;i<o;++i)s.push([]);const r=[];for(let i=0;i<t.length;++i){const a=t[i],l=t2(e,a);for(const c of l)r.indexOf(c)===-1&&(s[i].push(c),r.push(c))}return{path:t,steps:s}}function ed(n){return n.every((e,t)=>e===t)}function t2(n,e){const t=[];for(let s=0;s<n.length;++s)(n[s].length===0||n[s].indexOf(e)!==-1||e===-1)&&t.push(s);return t}function td(n,e,t=0){let s=[];if(typeof e=="number")k(n.shape[t]%e===0,()=>"Number of splits must evenly divide the axis."),s=new Array(e).fill(n.shape[t]/e);else{const o=e.reduce((i,a)=>(a===-1&&(i+=1),i),0);k(o<=1,()=>"There should be only one negative value in split array.");const r=e.indexOf(-1);if(r!==-1){const i=e.reduce((a,l)=>l>0?a+l:a);e[r]=n.shape[t]-i}k(n.shape[t]===e.reduce((i,a)=>i+a),()=>"The sum of sizes must match the size of the axis dimension."),s=e}return s}function ag(n){return`Received SparseTensor with denseShape[0] = 0 but
  indices.shape[0] = ${n}`}function lg(n,e){return`indices(${n}, 0) is invalid: ${e} < 0`}function cg(n,e,t){return`indices(${n}, 0) is invalid: ${e} >= ${t}`}function ug(n,e){return`only one output dimension may be -1, not both ${n} and ${e}`}function hg(n,e){return`size ${n} must be non-negative, not ${e}`}function dg(){return"reshape cannot infer the missing input size for an empty tensor unless all specified input sizes are non-zero"}function pg(n,e){const t=q(n),s=q(e);return`Input to reshape is a SparseTensor with ${t}
  dense values, but the requested shape requires a multiple of ${s}. inputShape=${n} outputShape= ${e}`}function fg(n,e){const t=q(n),s=q(e);return`Input to reshape is a tensor with ${t} dense values, but the requested shape has ${s}. inputShape=${n} outputShape=${e}`}function nd(){return"segment ids must be >= 0"}function mg(){return"segment ids are not increasing"}function gg(n,e){return`Segment id ${n} out of range [0, ${e}), possibly because segmentIds input is not sorted.`}function xg(n,e,t){return`Bad: indices[${n}] == ${e} out of range [0, ${t})`}function bg(n,e){let t=!1,s;for(n<=Ph?(s=n,t=!0):s=Pc(n,Math.floor(Math.sqrt(n)));!t;)s>e||s===n?t=!0:s=Pc(n,s+1);return s}function yg(n,e,t){const s=[],o=n.length;for(let r=0;r<o;r++)r!==e?s.push(n[r]):s.push(t);return s}function sd(n,e,t,s){const o=e.shape.length,r=n.shape.length;if(s!==0&&(s<-o||s>o))throw new Error(`Expect batchDims in the range of [-${o}, ${o}], but got ${s}`);if(s<0&&(s+=o),s>r)throw new Error(`batchDims (${s}) must be less than rank(x) (
    ${r}).`);if(t<s)throw new Error(`batchDims (${s}) must be less than or equal to axis (${t}).`);for(let h=0;h<s;++h)if(n.shape[h]!==e.shape[h])throw new Error(`x.shape[${h}]: ${n.shape[h]} should be equal to indices.shape[${h}]: ${e.shape[h]}.`);const i=n.shape[t],a=[];let l=1,c=1,u=1;for(let h=0;h<s;++h)a.push(n.shape[h]),l*=n.shape[h];for(let h=s;h<t;h++)a.push(n.shape[h]),c*=n.shape[h];for(let h=s;h<o;h++)a.push(e.shape[h]);for(let h=t+1;h<r;h++)a.push(n.shape[h]),u*=n.shape[h];return{batchSize:l,sliceSize:u,outerSize:c,dimSize:i,outputShape:a}}var n2=Object.freeze({__proto__:null,collectGatherOpShapeInfo:sd,computeOutShape:yg,segOpComputeOptimalWindowSize:bg});function ns(n){try{return n.map(e=>hs(e))}catch(e){throw new Error(`Failed to decode encoded string bytes into utf-8, error: ${e}`)}}function wg(n){return n.map(e=>us(e))}var s2=Object.freeze({__proto__:null,ERF_A1:Uh,ERF_A2:Gh,ERF_A3:Hh,ERF_A4:qh,ERF_A5:jh,ERF_P:Wh,PARALLELIZE_THRESHOLD:Ph,get RowPartitionType(){return wn},SELU_SCALE:Al,SELU_SCALEALPHA:Rl,applyActivation:Ih,assertAndGetBroadcastShape:xe,assertAxesAreInnerMostDims:Ct,assertParamsConsistent:Mh,assignToTypedArray:ng,axesAreInnerMostDims:sh,calculateShapes:to,checkEinsumDimSizes:Qh,checkPadOnDimRoundingMode:zt,combineLocations:Xf,combineRaggedTensorToTensorShapes:Xm,complexWithEvenIndex:eg,complexWithOddIndex:tg,computeConv2DInfo:yt,computeConv3DInfo:fs,computeDefaultPad:Xu,computeDilation2DInfo:ii,computeOptimalWindowSize:El,computeOutAndReduceShapes:gt,computeOutShape:Mn,computePool2DInfo:sn,computePool3DInfo:Yn,convertConv2DDataFormat:Zn,decodeEinsumEquation:Yh,eitherStridesOrDilationsAreOne:Nt,expandShapeToKeepDim:rt,exponent:og,exponents:sg,fromStringArrayToUint8:wg,fromUint8ToStringArray:ns,getAxesPermutation:je,getBroadcastDims:Oo,getComplexWithIndex:Kh,getEinsumComputePath:Jh,getEinsumPermutation:Zh,getFusedBiasGradient:Ch,getFusedDyActivation:wh,getImageCenter:Bh,getInnerMostAxes:et,getPermuted:yi,getRaggedRank:Zm,getReductionAxes:lt,getReshaped:bi,getReshapedPermuted:wi,getRowPartitionTypesHelper:Ym,getSliceBeginCoords:zh,getSliceSize:Vh,getSparseFillEmptyRowsIndicesDenseShapeMismatch:ag,getSparseFillEmptyRowsNegativeIndexErrorMessage:lg,getSparseFillEmptyRowsOutOfRangeIndexErrorMessage:cg,getSparseReshapeEmptyTensorZeroOutputDimErrorMessage:dg,getSparseReshapeInputOutputMismatchErrorMessage:fg,getSparseReshapeInputOutputMultipleErrorMessage:pg,getSparseReshapeMultipleNegativeOneOutputDimErrorMessage:ug,getSparseReshapeNegativeOutputDimErrorMessage:hg,getSparseSegmentReductionIndicesOutOfRangeErrorMessage:xg,getSparseSegmentReductionNegativeSegmentIdsErrorMessage:nd,getSparseSegmentReductionNonIncreasingSegmentIdsErrorMessage:mg,getSparseSegmentReductionSegmentIdOutOfRangeErrorMessage:gg,getUndoAxesPermutation:ms,isIdentityPermutation:ed,log:yw,mergeRealAndImagArrays:ts,prepareAndValidate:Rh,prepareSplitSize:td,segment_util:n2,shouldFuse:$h,slice_util:ZS,splitRealAndImagArrays:Jm,stridesOrDilationsArePositive:Ks,tupleValuesAreOne:js,upcastType:Gt,validateDefaultValueShape:Qm,validateInput:Tv,validateUpdateShape:wm,warn:Yt});zS();const Cg={kernelName:Ji,inputsToSave:["x"],gradFunc:(n,e)=>{const[t]=e;return{x:()=>D(n,xi(oe(t,"float32"),-1))}}};const o2={kernelName:ar,inputsToSave:["x"],gradFunc:(n,e)=>{const[t]=e;return{x:()=>{const s=Ue(oe(t,"float32")),o=Et(pe(Re(1),s));return tt(he(n,o))}}}};const r2={kernelName:lr,inputsToSave:["x"],gradFunc:(n,e)=>{const[t]=e;return{x:()=>{const s=Et(pe(Ue(oe(t,"float32")),1));return he(n,s)}}}};const i2={kernelName:No,inputsToSave:["a","b"],gradFunc:(n,e)=>{const[t,s]=e,o=xe(t.shape,s.shape);return{a:()=>{let a=n;const l=lt(t.shape,o);return l.length>0&&(a=ue(a,l)),M(a,t.shape)},b:()=>{let a=n;const l=lt(s.shape,o);return l.length>0&&(a=ue(a,l)),M(a,s.shape)}}}};const a2={kernelName:Uc,saveAllInputs:!0,gradFunc:(n,e)=>{const t={};return e.forEach((s,o)=>{t[o]=()=>n.clone()}),t}};const l2={kernelName:ea,inputsToSave:["x"],gradFunc:(n,e)=>{const[t]=e;return{x:()=>ke(t)}}};const c2={kernelName:ta,inputsToSave:["x"],gradFunc:(n,e)=>{const[t]=e;return{x:()=>ke(t)}}};const u2={kernelName:cr,inputsToSave:["x"],gradFunc:(n,e)=>{const[t]=e;return{x:()=>he(n,Et(pe(Re(1),Ue(oe(t,"float32")))))}}};const h2={kernelName:ur,inputsToSave:["x"],gradFunc:(n,e)=>{const[t]=e;return{x:()=>{const s=Et(ee(Re(1),Ue(oe(t,"float32"))));return he(n,s)}}}};const d2={kernelName:pr,inputsToSave:["a","b"],gradFunc:(n,e)=>{const[t,s]=e,o=xe(t.shape,s.shape);return{a:()=>{const a=ee(Ue(t),Ue(s));let l=D(n,he(s,a));const c=lt(t.shape,o);return c.length>0&&(l=ue(l,c)),M(l,t.shape)},b:()=>{const a=ee(Ue(t),Ue(s));let l=tt(D(n,he(t,a)));const c=lt(s.shape,o);return c.length>0&&(l=ue(l,c)),M(l,s.shape)}}}};const p2={kernelName:hr,inputsToSave:["x"],gradFunc:(n,e)=>{const[t]=e;return{x:()=>he(n,ee(Ue(oe(t,"float32")),1))}}};const f2={kernelName:dr,inputsToSave:["x"],gradFunc:(n,e)=>{const[t]=e;return{x:()=>he(n,pe(Re(1),Ue(oe(t,"float32"))))}}};function m2(n,e,t,s,o,r){const i=E(n,"dy","avgPool3dGrad"),a=E(e,"input","avgPool3dGrad");let l=i,c=a,u=!1;a.rank===4&&(u=!0,l=M(i,[1,i.shape[0],i.shape[1],i.shape[2],i.shape[3]]),c=M(a,[1,a.shape[0],a.shape[1],a.shape[2],a.shape[3]])),k(l.rank===5,()=>`Error in avgPool3dGrad: dy must be rank 5 but got rank ${l.rank}.`),k(c.rank===5,()=>`Error in avgPool3dGrad: input must be rank 5 but got rank ${c.rank}.`),zt("avgPool3dGrad",o,r);const h={dy:l,input:c},d={filterSize:t,strides:s,pad:o,dimRoundingMode:r},p=_.runKernel(jc,h,d);return u?M(p,[p.shape[1],p.shape[2],p.shape[3],p.shape[4]]):p}const g2=P({avgPool3dGrad_:m2});const x2={kernelName:sa,inputsToSave:["x"],gradFunc:(n,e,t)=>{const[s]=e,{filterSize:o,strides:r,pad:i,dimRoundingMode:a}=t;return{x:()=>g2(n,s,o,r,i,a)}}};function b2(n,e,t,s,o){const r=E(n,"dy","avgPoolGrad"),i=E(e,"input","avgPoolGrad");k(i.rank===r.rank,()=>`Rank of input (${i.rank}) does not match rank of dy (${r.rank})`);let a=i,l=r,c=!1;i.rank===3&&(c=!0,a=M(i,[1,i.shape[0],i.shape[1],i.shape[2]]),l=M(r,[1,r.shape[0],r.shape[1],r.shape[2]])),k(l.rank===4,()=>`Error in avgPoolGrad: dy must be rank 4 but got rank ${l.rank}.`),k(a.rank===4,()=>`Error in avgPoolGrad: input must be rank 4 but got rank ${a.rank}.`);const u={dy:l,input:a},h={filterSize:t,strides:s,pad:o},d=_.runKernel(qc,u,h);return c?M(d,[d.shape[1],d.shape[2],d.shape[3]]):d}const y2=P({avgPoolGrad_:b2});const w2={kernelName:na,inputsToSave:["x"],gradFunc:(n,e,t)=>{const[s]=e,{filterSize:o,strides:r,pad:i}=t;return{x:()=>y2(n,s,o,r,i)}}};const C2={kernelName:oa,inputsToSave:["a","b"],gradFunc:(n,e,t)=>{const[s,o]=e,{transposeA:r,transposeB:i}=t;return!r&&!i?{a:()=>Te(n,o,!1,!0),b:()=>Te(s,n,!0,!1)}:!r&&i?{a:()=>Te(n,o,!1,!1),b:()=>Te(n,s,!0,!1)}:r&&!i?{a:()=>Te(o,n,!1,!0),b:()=>Te(s,n,!1,!1)}:{a:()=>Te(o,n,!0,!0),b:()=>Te(n,s,!0,!0)}}};const I2={kernelName:ra,gradFunc:(n,e,t)=>{const{blockShape:s,crops:o}=t;return{x:()=>uh(n,s,o)}}};const $2={kernelName:mw,gradFunc:(n,e,t)=>{const s=t,o=s.inputShape,r=s.shape,i=Array.from(r);for(let l=o.length-1;l>=0;l--)if(o[l]===r[l])i[l]=1;else if(o[l]!==1)throw new Error(`broadcastTo(): [${o}] cannot be broadcast to [${r}].`);const a=[];for(let l=0;l<i.length;l++)i[l]>1&&a.push(l);return{x:()=>ue(n,a,!0)}}};const k2={kernelName:fr,gradFunc:n=>({x:()=>n.clone()})};const v2={kernelName:mr,gradFunc:n=>({x:()=>ke(n)})};const S2={kernelName:gr,inputsToSave:["x"],gradFunc:(n,e,t)=>{const[s]=e,{clipValueMin:o,clipValueMax:r}=t;return{x:()=>wt(Qn(Zs(s,o),Lo(s,r)),n,ke(n))}}};const N2={kernelName:ia,inputsToSave:["x"],gradFunc:Cg.gradFunc};const T2={kernelName:aa,saveAllInputs:!0,gradFunc:(n,e,t)=>{const s=e.map(l=>l.shape),{axis:o}=t,r=Ce(o,e[0].shape)[0],i=s.map(l=>l[r]);return Qt(n,i,r).map(l=>()=>l)}};const E2={kernelName:la,inputsToSave:["x","filter"],gradFunc:(n,e,t)=>{const[s,o]=e,{dilations:r,strides:i,pad:a,dataFormat:l}=t;return k(js(r),()=>`Error in gradient of conv2D: dilation rates greater than 1 are not yet supported in gradients. Got dilations '${r}'`),{x:()=>Ju(s.shape,n,o,i,a,l),filter:()=>yh(s,n,o.shape,i,a,l)}}};const R2={kernelName:ca,inputsToSave:["dy","filter"],gradFunc:(n,e,t)=>{const[s,o]=e,{strides:r,pad:i,dataFormat:a,dimRoundingMode:l}=t;return{dy:()=>Xs(n,o,r,i,a,1,l),filter:()=>yh(n,s,o.shape,r,i,a,l)}}};function A2(n,e,t,s,o){let r=n;n.rank===4&&(r=M(n,[1,n.shape[0],n.shape[1],n.shape[2],n.shape[3]]));let i=e;i.rank===4&&(i=M(e,[1,e.shape[0],e.shape[1],e.shape[2],e.shape[3]])),k(r.rank===5,()=>`Error in conv3dDerFilter: input must be rank 5, but got shape ${r.shape}.`),k(i.rank===5,()=>`Error in conv3dDerFilter: dy must be rank 5, but got shape ${i.shape}.`),k(t.length===5,()=>`Error in conv3dDerFilter: filterShape must be length 5, but got ${t}.`),k(r.shape[4]===t[3],()=>`Error in conv3dDerFilter: depth of input ${r.shape[4]}) must match input depth in filter (${t[3]}.`),k(i.shape[4]===t[4],()=>`Error in conv3dDerFilter: depth of dy (${i.shape[4]}) must match output depth for filter (${t[4]}).`);const a={x:r,dy:i},l={strides:s,pad:o,filterShape:t};return _.runKernel(Qc,a,l)}const D2=P({conv3DBackpropFilter_:A2});const F2={kernelName:ua,inputsToSave:["x","filter"],gradFunc:(n,e,t)=>{const{dilations:s,strides:o,pad:r}=t;k(js(s),()=>`Error in gradient of conv3D: dilation rates greater than 1 are not yet supported in gradients. Got dilations '${s}'`);const[i,a]=e;return{x:()=>Gf(i.shape,n,a,o,r),filter:()=>D2(i,n,a.shape,o,r)}}};const _2={kernelName:xr,inputsToSave:["x"],gradFunc:(n,e)=>{const[t]=e;return{x:()=>D(tt(gm(oe(t,"float32"))),n)}}};const O2={kernelName:br,inputsToSave:["x"],gradFunc:(n,e)=>{const[t]=e;return{x:()=>D(xm(oe(t,"float32")),n)}}};const L2={kernelName:ha,inputsToSave:["x"],gradFunc:(n,e,t)=>{const[s]=e,{axis:o,exclusive:r,reverse:i}=t;return{x:()=>{const a=je([o],s.rank);let l=qf(n,o,r,!i);return a!=null&&(l=ve(l,a)),l}}}};const M2={kernelName:da,inputsToSave:["x","filter"],gradFunc:(n,e,t)=>{const{dilations:s,strides:o,pad:r,dimRoundingMode:i}=t,a=s==null?[1,1]:s;k(js(a),()=>`Error in gradient of depthwiseConv2dNative: dilation rates greater than 1 are not yet supported. Got dilations '${a}'`);const[l,c]=e;return k(l.rank===4,()=>`Error in gradient of depthwiseConv2dNative: input must be rank 4, but got rank ${l.rank}.`),k(c.rank===4,()=>`Error in gradient of depthwiseConv2dNative: filter must be rank 4, but got rank ${c.rank}.`),k(l.shape[3]===c.shape[2],()=>`Error in gradient of depthwiseConv2d: number of input channels (${l.shape[3]}) must match the inChannels dimension in filter ${c.shape[2]}.`),k(Nt(o,a),()=>`Error in gradient of depthwiseConv2d: Either strides or dilations must be  1. Got strides ${o} and dilations '${a}'.`),zt("depthwiseConv2d",r,i),{x:()=>jv(l.shape,n,c,o,r,a,i),filter:()=>Hv(l,n,c.shape,o,r,a,i)}}};const P2={kernelName:pa,inputsToSave:["x","filter"],gradFunc:(n,e,t)=>{const[s,o]=e,r={x:s,filter:o,dy:n},i={x:s,filter:o,dy:n};return{x:()=>_.runKernel(iu,r,t),filter:()=>_.runKernel(au,i,t)}}};const B2={kernelName:wr,outputsToSave:[!0],gradFunc:(n,e)=>{const[t]=e,s={dy:n,y:t};return{x:()=>_.runKernel(cu,s)}}};const z2={kernelName:Cr,inputsToSave:["x"],gradFunc:(n,e)=>{const[t]=e,s=D(_n(tt(Ue(t))),2/Math.sqrt(Math.PI));return{x:()=>D(n,s)}}};const V2={kernelName:Ir,outputsToSave:[!0],gradFunc:(n,e)=>{const[t]=e;return{x:()=>D(n,t)}}};const W2={kernelName:ma,inputsToSave:["input"],gradFunc:(n,e)=>{const[t]=e;return{input:()=>M(n,t.shape)}}};const U2={kernelName:$r,inputsToSave:["x"],gradFunc:(n,e)=>{const[t]=e;return{x:()=>D(n,_n(t))}}};const G2={kernelName:kr,gradFunc:n=>({x:()=>ke(n)})};const H2={kernelName:vr,inputsToSave:["a","b"],gradFunc:(n,e)=>{const[t,s]=e,o=xe(t.shape,s.shape);return{a:()=>{const a=he(n,oe(s,"float32")),l=lt(t.shape,o);return l.length>0?M(ue(a,l),t.shape):a},b:()=>{let a=D(n,oe(t,"float32"));const l=lt(s.shape,o);l.length>0&&(a=M(ue(a,l),s.shape));const c=Ue(s);return tt(he(a,oe(c,"float32")))}}}};const q2={kernelName:ga,inputsToSave:["x","mean","variance","scale"],gradFunc:(n,e,t)=>{const{varianceEpsilon:s}=t,[o,r,i,a]=e,l=a==null?Re(1):a,c=lt(r.shape,o.shape),u=[];if(r.rank===1){for(let y=0;y<o.shape.length-1;++y)u.push(o.shape[y]);u.push(1)}const h=pe(o,r),d=D(n,l),p=Sl(ee(i,Re(s))),f=D(D(D(p,p),p),Re(-.5));return{x:()=>r.rank===1?M(D(D(n,yn(M(p,[1,1,1,r.shape[0]]),u)),l),o.shape):M(D(D(n,p),l),o.shape),mean:()=>{let y=D(D(p,Re(-1)),d);return r.rank===1&&(y=ue(y,c)),M(y,r.shape)},variance:()=>{let y=D(D(f,h),d);return r.rank===1&&(y=ue(y,c)),M(y,r.shape)},scale:()=>{const y=D(h,p);let C=D(n,y);return r.rank===1&&(C=ue(C,c)),M(C,r.shape)},offset:()=>{let y=n;return r.rank===1&&(y=ue(y,c)),M(y,r.shape)}}}};const j2={kernelName:xa,inputsToSave:["x","indices"],gradFunc:(n,e,t)=>{const[s,o]=e,{axis:r,batchDims:i}=t,a=Ce(r,s.shape)[0],l=(c,u,h)=>()=>{const d=c.shape,p=u.size,f=d.slice(0,a),m=f.length,g=d.slice(r,d.length).slice(1),x=g.length,b=Ig(0,m),w=Ig(m+1,m+1+x),y=$g([f,[p],g]),C=M(h,y),$=M(u,[p]),N=$g([[m],b,w]),T=ve(C,N);let S=Im(T,$,c.shape[a]);const v=ms(N);return S=ve(S,v),S};if(i===1){const c=s.shape[0],u=s.split(c,0);return{x:()=>Ln(u.map((p,f)=>l(p,o.slice(f,1),n.slice(f,1))())).reshape(s.shape),indices:()=>o}}else return{x:l(s,o,n),indices:()=>o}}};function Ig(n,e){const t=[];for(let s=n;s<e;++s)t.push(s);return t}function $g(n){const e=[];for(let t=0;t<n.length;++t)for(let s=0;s<n[t].length;++s)e.push(n[t][s]);return e}const K2={kernelName:Sr,inputsToSave:["a","b"],gradFunc:(n,e)=>{const[t,s]=e;return{a:()=>ke(t),b:()=>ke(s)}}};const X2={kernelName:Nr,gradFunc:n=>({x:()=>oe(n,"float32")})};const Y2={kernelName:Tr,gradFunc:n=>({x:()=>ke(n)})};const Z2={kernelName:Er,gradFunc:n=>({x:()=>ke(n)})};const Q2={kernelName:Rr,gradFunc:n=>({x:()=>ke(n)})};const J2={kernelName:ya,inputsToSave:["x"],gradFunc:(n,e,t)=>{const[s]=e,{alpha:o}=t,r=Ht(s,0);return{x:()=>wt(r,n,D(n,o))}}};const eN={kernelName:Dr,inputsToSave:["x"],gradFunc:(n,e)=>{const[t]=e;return{x:()=>he(n,ee(t,1))}}};const tN={kernelName:Ar,inputsToSave:["x"],gradFunc:(n,e)=>{const[t]=e;return{x:()=>he(n,oe(t,"float32"))}}};const nN={kernelName:xw,inputsToSave:[],outputsToSave:[!0],gradFunc:(n,e,t)=>{const[s]=e,{axis:o}=t;return{logits:()=>{const i=_n(s);return pe(n,D(ue(n,o,!0),i))}}}};function sN(n,e,t,s=5,o=1,r=1,i=.5){const a={x:n,y:e,dy:t},l={depthRadius:s,bias:o,alpha:r,beta:i};return _.runKernel(mu,a,l)}const oN=P({localResponseNormalizationBackprop_:sN});const rN={kernelName:va,inputsToSave:["x"],outputsToSave:[!0],gradFunc:(n,e,t)=>{const[s,o]=e,{depthRadius:r,bias:i,alpha:a,beta:l}=t;return{x:()=>oN(s,o,n,r,i,a,l)}}};function kg(n,e,t,s){return e.rank<t.rank&&(e=M(e,rt(e.shape,s))),n.rank<t.rank&&(n=M(n,rt(n.shape,s))),{x:()=>D(n,oe(Fn(t,e),n.dtype))}}const vg={kernelName:Sa,inputsToSave:["x"],outputsToSave:[!0],gradFunc:(n,e,t)=>{const s=t,{reductionIndices:o}=s,r=e[0],i=e[1],a=Ce(o,r.shape),l=kg(n,i,r,a);return{x:()=>l.x()}}};const iN={kernelName:Fr,inputsToSave:["a","b"],gradFunc:(n,e)=>{const[t,s]=e;return{a:()=>D(n,oe(Zs(t,s),"float32")),b:()=>D(n,oe(gl(t,s),"float32"))}}};function aN(n,e,t,s,o,r,i){const a=E(n,"dy","maxPool3dGrad"),l=E(e,"input","maxPool3dGrad"),c=E(t,"output","maxPool3dGrad");let u=a,h=l,d=c,p=!1;l.rank===4&&(p=!0,u=M(a,[1,a.shape[0],a.shape[1],a.shape[2],a.shape[3]]),h=M(l,[1,l.shape[0],l.shape[1],l.shape[2],l.shape[3]]),d=M(c,[1,c.shape[0],c.shape[1],c.shape[2],c.shape[3]])),k(u.rank===5,()=>`Error in maxPool3dGrad: dy must be rank 5 but got rank ${u.rank}.`),k(h.rank===5,()=>`Error in maxPool3dGrad: input must be rank 5 but got rank ${h.rank}.`),k(d.rank===5,()=>`Error in maxPool3dGrad: output must be rank 5 but got rank ${d.rank}.`),zt("maxPool3dGrad",r,i);const f={dy:u,input:h,output:d},m={filterSize:s,strides:o,pad:r,dimRoundingMode:i},g=_.runKernel(xu,f,m);return p?M(g,[g.shape[1],g.shape[2],g.shape[3],g.shape[4]]):g}const lN=P({maxPool3dGrad_:aN});const cN={kernelName:Ta,inputsToSave:["x"],outputsToSave:[!0],gradFunc:(n,e,t)=>{const[s,o]=e,{filterSize:r,strides:i,pad:a,dimRoundingMode:l}=t;return{x:()=>lN(n,s,o,r,i,a,l)}}};function uN(n,e,t,s,o,r,i){const a=E(n,"dy","maxPoolGrad"),l=E(e,"input","maxPoolGrad"),c=E(t,"output","maxPoolGrad");k(l.rank===a.rank,()=>`Rank of input (${l.rank}) does not match rank of dy (${a.rank})`),k(a.rank===4,()=>`Error in maxPoolGrad: dy must be rank 4 but got rank ${a.rank}.`),k(l.rank===4,()=>`Error in maxPoolGrad: input must be rank 4 but got rank ${l.rank}.`),zt("maxPoolGrad",r,i);const u={dy:a,input:l,output:c},h={filterSize:s,strides:o,pad:r,dimRoundingMode:i};return _.runKernel(gu,u,h)}const hN=P({maxPoolGrad_:uN});const dN={kernelName:Na,inputsToSave:["x"],outputsToSave:[!0],gradFunc:(n,e,t)=>{const[s,o]=e,{filterSize:r,strides:i,pad:a}=t;return{x:()=>hN(n,s,o,r,i,a)}}};const pN={kernelName:Ea,inputsToSave:["x"],gradFunc:(n,e,t)=>{const[s]=e,{axis:o}=t,r=Ce(o,s.shape),a=gt(s.shape,r)[1],l=q(a);return{x:()=>{const u=s.shape.slice();r.forEach(p=>{u[p]=1});const h=M(n,u);return he(D(h,Jn(s.shape,"float32")),l)}}}};const fN={kernelName:Ra,inputsToSave:["x"],outputsToSave:[!0],gradFunc:(n,e,t)=>{const s=t,{axis:o}=s,[r,i]=e,a=Ce(o,r.shape),l=kg(n,i,r,a);return{x:()=>l.x()}}};const mN={kernelName:_r,inputsToSave:["a","b"],gradFunc:(n,e)=>{const[t,s]=e;return{a:()=>D(n,oe(Lo(t,s),"float32")),b:()=>D(n,oe(Ht(t,s),"float32"))}}};const gN={kernelName:Aa,inputsToSave:["x"],gradFunc:(n,e,t)=>{const s=e[0],{paddings:o}=t,r=o.map(i=>i[0]);return{x:()=>Be(n,r,s.shape)}}};const xN={kernelName:Or,inputsToSave:["a","b"],gradFunc:(n,e)=>{const[t,s]=e,o=xe(t.shape,s.shape);return{a:()=>{const a=lt(t.shape,o);return a.length>0?M(ue(n,a),t.shape):n},b:()=>{const a=D(n,tt(ml(he(t,s)))),l=lt(s.shape,o);return l.length>0?M(ue(a,l),s.shape):a}}}};const bN={kernelName:Lr,inputsToSave:["a","b"],gradFunc:(n,e)=>{const[t,s]=e,o=xe(t.shape,s.shape);return{a:()=>{const a=D(n,oe(s,"float32")),l=lt(t.shape,o);return l.length>0?M(ue(a,l),t.shape):a},b:()=>{const a=D(n,oe(t,"float32")),l=lt(s.shape,o);return l.length>0?M(ue(a,l),s.shape):a}}}};const yN={kernelName:Da,gradFunc:n=>({x:()=>tt(n)})};const wN={kernelName:Oa,inputsToSave:["indices"],gradFunc:(n,e)=>{const t=e[0];return{indices:()=>nt(t.shape,"float32")}}};const CN={kernelName:_a,gradFunc:n=>({x:()=>ke(n)})};const IN={kernelName:La,saveAllInputs:!0,gradFunc:(n,e,t)=>{const{axis:s}=t;return xs(n,s).map(r=>()=>r)}};const Sg={kernelName:Ma,inputsToSave:["x"],gradFunc:(n,e,t)=>{const s=e[0],{paddings:o}=t,r=o.map(i=>i[0]);return{x:()=>Be(n,r,s.shape)}}};const $N={kernelName:Mr,inputsToSave:["a","b"],outputsToSave:[!0],gradFunc:(n,e)=>{const[t,s,o]=e,r=t,i=s,a=xe(r.shape,i.shape);return{a:()=>{const u=oe(i,"float32");let h=D(n,D(u,Ys(r,pe(u,Re(1)))));const d=lt(r.shape,a);return d.length>0&&(h=ue(h,d)),M(h,r.shape)},b:()=>{const u=Ht(r,0),h=wt(u,On(r),ke(r));let d=D(n,D(o,h));const p=lt(i.shape,a);return p.length>0&&(d=ue(d,p)),M(d,i.shape)}}}};const kN={kernelName:Pa,inputsToSave:["x","alpha"],gradFunc:(n,e)=>{const[t,s]=e,o=Ht(t,0);return{x:()=>wt(o,n,D(n,s)),alpha:()=>{let r=wt(o,ke(n),D(n,t));const i=lt(s.shape,n.shape);return i.length>0&&(r=ue(r,i)),M(r,s.shape)}}}};function vN(n,e,t){const s=n.shape.slice();s[t]=1;const o=M(e,s),r=th(n,t,!0,!1),i=th(n,t,!0,!0),a=D(r,i);return D(o,a)}function SN(n,e,t){const s=n.shape.length,o=s-t.length,r=je(t,s);let i=n;r!=null&&(i=ve(n,r));const a=i.shape.slice(),c=a.splice(s-t.length,t.length).reduce((d,p)=>d*p,1);a.push(c);const u=i.reshape(a);let h=vN(u,e,o);if(h=h.reshape(i.shape),r!=null){const d=ms(r);h=ve(h,d)}return h}const NN={kernelName:Ba,inputsToSave:["x"],gradFunc:(n,e,t)=>{const[s]=e,{axis:o}=t;let r=[];return o==null?r=s.shape.map((i,a)=>a):typeof o=="number"?r=[o]:r=o,{x:()=>SN(s,n,r)}}};const TN={kernelName:yr,inputsToSave:["a","b"],gradFunc:(n,e)=>{const[t,s]=e,o=xe(t.shape,s.shape);return{a:()=>{const a=he(n,oe(s,"float32")),l=lt(t.shape,o);return l.length>0?M(ue(a,l),t.shape):a},b:()=>{let a=D(n,oe(t,"float32"));const l=lt(s.shape,o);l.length>0&&(a=M(ue(a,l),s.shape));const c=Ue(s);return tt(he(a,oe(c,"float32")))}}}};const EN={kernelName:Pr,inputsToSave:["x"],gradFunc:(n,e)=>{const[t]=e;return{x:()=>he(n,tt(Ue(t)))}}};const RN={kernelName:zr,inputsToSave:["x"],gradFunc:(n,e)=>{const[t]=e,s=D(Lo(t,6),xi(t));return{x:()=>D(n,oe(s,"float32"))}}};const AN={kernelName:Br,inputsToSave:["x"],gradFunc:(n,e)=>{const[t]=e;return{x:()=>D(n,oe(xi(t),"float32"))}}};const DN={kernelName:za,inputsToSave:["x"],gradFunc:(n,e)=>{const[t]=e;return{x:()=>M(n,t.shape)}}};const FN={kernelName:Wa,inputsToSave:["images"],gradFunc:(n,e,t)=>{const[s]=e,o={dy:n,images:s};return{images:()=>_.runKernel(ku,o,t)}}};const _N={kernelName:Va,inputsToSave:["images"],gradFunc:(n,e,t)=>{const[s]=e,o={dy:n,images:s};return{images:()=>_.runKernel($u,o,t)}}};const ON={kernelName:Ua,gradFunc:(n,e,t)=>{const{dims:s}=t,o=Ce(s,n.shape);return{x:()=>Js(n,o)}}};const LN={kernelName:Vr,gradFunc:n=>({x:()=>ke(n)})};const MN={kernelName:Wr,inputsToSave:["x"],gradFunc:(n,e)=>{const[t]=e;return{x:()=>tt(he(n,D(Ys(t,1.5),2)))}}};const PN={kernelName:Ga,inputsToSave:["condition"],gradFunc:(n,e)=>{const[t]=e;return{condition:()=>oe(ke(t),"float32"),t:()=>D(n,oe(t,n.dtype)),e:()=>D(n,oe(ah(t),n.dtype))}}};const BN={kernelName:Ur,inputsToSave:["x"],gradFunc:(n,e)=>{const[t]=e;return{x:()=>{const s=Ht(t,Re(0)),o=Re(Rl),r=Re(Al),i=D(n,r),a=D(D(n,o),_n(oe(t,"float32")));return wt(s,i,a)}}}};const zN={kernelName:jr,outputsToSave:[!0],gradFunc:(n,e)=>{const[t]=e;return{x:()=>D(n,D(t,pe(Re(1),t)))}}};const VN={kernelName:qr,gradFunc:n=>({x:()=>ke(n)})};const WN={kernelName:Gr,inputsToSave:["x"],gradFunc:(n,e)=>{const[t]=e;return{x:()=>D(eh(oe(t,"float32")),n)}}};const UN={kernelName:Hr,inputsToSave:["x"],gradFunc:(n,e)=>{const[t]=e;return{x:()=>D(Hf(oe(t,"float32")),n)}}};const GN={kernelName:Ha,inputsToSave:["x"],gradFunc:(n,e,t)=>{const[s]=e,{begin:o,size:r}=t,i=s.shape,[a,l]=Tl(s,o,r),c=[];for(let u=0;u<n.rank;u++)c.push([a[u],i[u]-a[u]-l[u]]);return{x:()=>ch(n,c)}}};const HN={kernelName:Xa,outputsToSave:[!0],gradFunc:(n,e,t)=>{const[s]=e,{dim:o}=t,r=!0,i=D(n,s);return{logits:()=>pe(i,D(ue(i,[o],r),s))}}};const qN={kernelName:Kr,inputsToSave:["x"],gradFunc:(n,e)=>{const[t]=e;return{x:()=>D(n,_o(t))}}};const Ng={kernelName:ja,gradFunc:(n,e,t)=>{const{blockShape:s,paddings:o}=t;return{x:()=>Qu(n,s,o)}}};const Tg={kernelName:Ka,gradFunc:(n,e,t)=>{const{axis:s}=t;return{x:()=>Tt(n,s)}}};const jN={kernelName:Xr,inputsToSave:["x"],gradFunc:(n,e)=>{const[t]=e;return{x:()=>he(n,D(Et(oe(t,"float32")),2))}}};const KN={kernelName:vu,inputsToSave:["x"],gradFunc:(n,e)=>{const[t]=e;return{x:()=>D(n,D(oe(t,"float32"),2))}}};const XN={kernelName:Yr,inputsToSave:["a","b"],gradFunc:(n,e)=>{const[t,s]=e,o=Re(2);return{a:()=>D(n,D(o,pe(t,s))),b:()=>D(n,D(o,pe(s,t)))}}};const YN={kernelName:ti,gradFunc:n=>({x:()=>ke(n)})};const ZN={kernelName:Zr,inputsToSave:["a","b"],gradFunc:(n,e)=>{const[t,s]=e,o=xe(t.shape,s.shape);return{a:()=>{let a=n;const l=lt(t.shape,o);return l.length>0&&(a=ue(a,l)),M(a,t.shape)},b:()=>{let a=n;const l=lt(s.shape,o);return l.length>0&&(a=ue(a,l)),M(tt(a),s.shape)}}}};const QN={kernelName:qa,inputsToSave:["x"],gradFunc:(n,e,t)=>{const[s]=e,o=s.shape.slice(),{axis:r}=t;Ce(r,s.shape).forEach(c=>{o[c]=1});const a=M(n,o),l=D(a,Jn(s.shape,"float32"));return{x:()=>l}}};const JN={kernelName:Qr,inputsToSave:["x"],gradFunc:(n,e)=>{const[t]=e;return{x:()=>he(n,Ue(eh(t)))}}};const eT={kernelName:Jr,outputsToSave:[!0],gradFunc:(n,e)=>{const[t]=e;return{x:()=>D(pe(Re(1),Ue(t)),n)}}};const tT={kernelName:ei,inputsToSave:["x"],gradFunc:(n,e,t)=>{const[s]=e,{reps:o}=t;return{x:()=>{let i=ke(s);if(s.rank===1)for(let a=0;a<o[0];++a)i=ee(i,Be(n,[a*s.shape[0]],[s.shape[0]]));else if(s.rank===2)for(let a=0;a<o[0];++a)for(let l=0;l<o[1];++l)i=ee(i,Be(n,[a*s.shape[0],l*s.shape[1]],[s.shape[0],s.shape[1]]));else if(s.rank===3)for(let a=0;a<o[0];++a)for(let l=0;l<o[1];++l)for(let c=0;c<o[2];++c)i=ee(i,Be(n,[a*s.shape[0],l*s.shape[1],c*s.shape[2]],[s.shape[0],s.shape[1],s.shape[2]]));else if(s.rank===4)for(let a=0;a<o[0];++a)for(let l=0;l<o[1];++l)for(let c=0;c<o[2];++c)for(let u=0;u<o[3];++u)i=ee(i,Be(n,[a*s.shape[0],l*s.shape[1],c*s.shape[2],u*s.shape[3]],[s.shape[0],s.shape[1],s.shape[2],s.shape[3]]));else throw new Error(`Gradient for tile operation is not implemented for rank-${s.rank} tensors yet.`);return i}}}};const nT={kernelName:To,gradFunc:(n,e,t)=>{const s=t,{perm:o}=s,r=ms(o);return{x:()=>ve(n,r)}}};const sT={kernelName:Ya,gradFunc:(n,e,t)=>{const s=t,{axis:o}=s;return{value:()=>Ln(n,o)}}};const oT={kernelName:Za,inputsToSave:["segmentIds"],gradFunc:(n,e)=>{const[t]=e;return{x:()=>rT(n,t)}}};function rT(n,e){const t=gs(e,ke(e)),s=oh(n,t);let o=Zs(e,Re(0,"int32"));const r=s.rank-o.rank;for(let a=0;a<r;++a)o=Vt(o,a+1);o=Qn(o,Jn(s.shape,"bool"));const i=ke(s);return wt(o,s,i)}const iT={kernelName:Qa,gradFunc:n=>({x:()=>ke(n)})};const aT=[Cg,o2,r2,i2,a2,l2,c2,u2,h2,d2,p2,f2,x2,w2,C2,I2,$2,k2,v2,S2,N2,T2,R2,E2,F2,_2,O2,L2,M2,P2,TN,B2,z2,V2,W2,U2,H2,G2,q2,j2,K2,X2,Y2,Z2,Q2,J2,eN,tN,nN,rN,vg,vg,iN,cN,dN,pN,fN,mN,gN,xN,bN,yN,wN,CN,IN,Sg,Sg,$N,kN,NN,EN,RN,AN,DN,FN,_N,ON,LN,MN,PN,BN,zN,VN,WN,UN,GN,HN,qN,Ng,Ng,Tg,Tg,jN,XN,KN,YN,ZN,QN,JN,eT,tT,nT,sT,oT,iT];for(const n of aT)ww(n);H().prototype.abs=function(){return this.throwIfDisposed(),_t(this)};H().prototype.acos=function(){return this.throwIfDisposed(),LC(this)};H().prototype.acosh=function(){return this.throwIfDisposed(),PC(this)};H().prototype.add=function(n){return this.throwIfDisposed(),ee(this,n)};H().prototype.all=function(n,e){return this.throwIfDisposed(),Vf(this,n,e)};H().prototype.any=function(n,e){return this.throwIfDisposed(),Ku(this,n,e)};H().prototype.argMax=function(n){return this.throwIfDisposed(),qs(this,n)};H().prototype.argMin=function(n){return this.throwIfDisposed(),UC(this,n)};H().prototype.asScalar=function(){return this.throwIfDisposed(),k(this.size===1,()=>"The array must have only 1 element."),M(this,[])};H().prototype.asType=function(n){return this.throwIfDisposed(),oe(this,n)};H().prototype.as1D=function(){return this.throwIfDisposed(),M(this,[this.size])};H().prototype.as2D=function(n,e){return this.throwIfDisposed(),M(this,[n,e])};H().prototype.as3D=function(n,e,t){return this.throwIfDisposed(),M(this,[n,e,t])};H().prototype.as4D=function(n,e,t,s){return this.throwIfDisposed(),M(this,[n,e,t,s])};H().prototype.as5D=function(n,e,t,s,o){return this.throwIfDisposed(),M(this,[n,e,t,s,o])};H().prototype.asin=function(){return this.throwIfDisposed(),HC(this)};H().prototype.asinh=function(){return this.throwIfDisposed(),jC(this)};H().prototype.atan=function(){return this.throwIfDisposed(),XC(this)};H().prototype.atan2=function(n){return this.throwIfDisposed(),ZC(this,n)};H().prototype.atanh=function(){return this.throwIfDisposed(),JC(this)},H().prototype.avgPool=function(n,e,t,s){return this.throwIfDisposed(),Zu(this,n,e,t,s)};H().prototype.batchToSpaceND=function(n,e){return this.throwIfDisposed(),Qu(this,n,e)};H().prototype.batchNorm=function(n,e,t,s,o){return this.throwIfDisposed(),ul(this,n,e,t,s,o)};H().prototype.broadcastTo=function(n){return this.throwIfDisposed(),ci(this,n)};H().prototype.cast=function(n){return this.throwIfDisposed(),oe(this,n)};H().prototype.ceil=function(){return this.throwIfDisposed(),SI(this)};H().prototype.clipByValue=function(n,e){return this.throwIfDisposed(),Zt(this,n,e)};H().prototype.concat=function(n,e){return this.throwIfDisposed(),n instanceof at&&(n=[n]),Tt([this,...n],e)};H().prototype.conv1d=function(n,e,t,s,o,r){return this.throwIfDisposed(),Wf(this,n,e,t,s,o,r)};H().prototype.conv2dTranspose=function(n,e,t,s,o){return this.throwIfDisposed(),Uf(this,n,e,t,s,o)};H().prototype.conv2d=function(n,e,t,s,o,r){return this.throwIfDisposed(),Xs(this,n,e,t,s,o,r)};H().prototype.cos=function(){return this.throwIfDisposed(),eh(this)};H().prototype.cosh=function(){return this.throwIfDisposed(),Hf(this)};H().prototype.cumprod=function(n,e,t){return this.throwIfDisposed(),th(this,n,e,t)};H().prototype.cumsum=function(n,e,t){return this.throwIfDisposed(),qf(this,n,e,t)};H().prototype.depthToSpace=function(n,e){return this.throwIfDisposed(),YI(this,n,e)};H().prototype.depthwiseConv2d=function(n,e,t,s,o,r){return this.throwIfDisposed(),nh(this,n,e,t,s,o,r)};H().prototype.dilation2d=function(n,e,t,s,o){return this.throwIfDisposed(),JI(this,n,e,t,s,o)};H().prototype.divNoNan=function(n){return this.throwIfDisposed(),o$(this,n)};H().prototype.div=function(n){return this.throwIfDisposed(),he(this,n)};H().prototype.dot=function(n){return this.throwIfDisposed(),i$(this,n)};H().prototype.elu=function(){return this.throwIfDisposed(),dl(this)};H().prototype.equal=function(n){return this.throwIfDisposed(),Fn(this,n)};H().prototype.erf=function(){return this.throwIfDisposed(),Kf(this)};H().prototype.euclideanNorm=function(n,e){return this.throwIfDisposed(),b$(this,n,e)};H().prototype.exp=function(){return this.throwIfDisposed(),_n(this)};H().prototype.expandDims=function(n){return this.throwIfDisposed(),Vt(this,n)};H().prototype.expm1=function(){return this.throwIfDisposed(),I$(this)};H().prototype.fft=function(){return this.throwIfDisposed(),ym(this)};H().prototype.flatten=function(){return this.throwIfDisposed(),M(this,[this.size])};H().prototype.floor=function(){return this.throwIfDisposed(),ml(this)};H().prototype.floorDiv=function(n){return this.throwIfDisposed(),zf(this,n)};H().prototype.gather=function(n,e,t){return this.throwIfDisposed(),oh(this,n,e,t)};H().prototype.greaterEqual=function(n){return this.throwIfDisposed(),Zs(this,n)};H().prototype.greater=function(n){return this.throwIfDisposed(),Ht(this,n)};H().prototype.ifft=function(){return this.throwIfDisposed(),xh(this)};H().prototype.irfft=function(){return this.throwIfDisposed(),mv(this)};H().prototype.isFinite=function(){return this.throwIfDisposed(),A$(this)};H().prototype.isInf=function(){return this.throwIfDisposed(),F$(this)};H().prototype.isNaN=function(){return this.throwIfDisposed(),O$(this)};H().prototype.leakyRelu=function(n){return this.throwIfDisposed(),ih(this,n)};H().prototype.lessEqual=function(n){return this.throwIfDisposed(),Lo(this,n)};H().prototype.less=function(n){return this.throwIfDisposed(),gl(this,n)};H().prototype.localResponseNormalization=function(n,e,t,s){return this.throwIfDisposed(),z$(this,n,e,t,s)};H().prototype.logSigmoid=function(){return this.throwIfDisposed(),j$(this)};H().prototype.logSoftmax=function(n){return this.throwIfDisposed(),Jf(this,n)};H().prototype.logSumExp=function(n,e){return this.throwIfDisposed(),em(this,n,e)};H().prototype.log=function(){return this.throwIfDisposed(),On(this)};H().prototype.log1p=function(){return this.throwIfDisposed(),Qf(this)};H().prototype.logicalAnd=function(n){return this.throwIfDisposed(),Qn(this,n)};H().prototype.logicalNot=function(){return this.throwIfDisposed(),ah(this)};H().prototype.logicalOr=function(n){return this.throwIfDisposed(),tm(this,n)};H().prototype.logicalXor=function(n){return this.throwIfDisposed(),tk(this,n)};H().prototype.matMul=function(n,e,t){return this.throwIfDisposed(),Te(this,n,e,t)},H().prototype.maxPool=function(n,e,t,s){return this.throwIfDisposed(),lh(this,n,e,t,s)};H().prototype.max=function(n,e){return this.throwIfDisposed(),bn(this,n,e)};H().prototype.maximum=function(n){return this.throwIfDisposed(),gs(this,n)};H().prototype.mean=function(n,e){return this.throwIfDisposed(),it(this,n,e)};H().prototype.min=function(n,e){return this.throwIfDisposed(),pl(this,n,e)};H().prototype.minimum=function(n){return this.throwIfDisposed(),pi(this,n)};H().prototype.mirrorPad=function(n,e){return this.throwIfDisposed(),ck(this,n,e)};H().prototype.mod=function(n){return this.throwIfDisposed(),hk(this,n)};H().prototype.mul=function(n){return this.throwIfDisposed(),D(this,n)};H().prototype.neg=function(){return this.throwIfDisposed(),tt(this)};H().prototype.norm=function(n,e,t){return this.throwIfDisposed(),fl(this,n,e,t)};H().prototype.notEqual=function(n){return this.throwIfDisposed(),xl(this,n)};H().prototype.oneHot=function(n,e=1,t=0){return this.throwIfDisposed(),nm(this,n,e,t)};H().prototype.onesLike=function(){return this.throwIfDisposed(),on(this)};H().prototype.pad=function(n,e){return this.throwIfDisposed(),ch(this,n,e)},H().prototype.pool=function(n,e,t,s,o,r){return this.throwIfDisposed(),Ck(this,n,e,t,s,o,r)};H().prototype.pow=function(n){return this.throwIfDisposed(),Ys(this,n)};H().prototype.prelu=function(n){return this.throwIfDisposed(),hh(this,n)};H().prototype.prod=function(n,e){return this.throwIfDisposed(),kk(this,n,e)};H().prototype.reciprocal=function(){return this.throwIfDisposed(),Xk(this)};H().prototype.relu=function(){return this.throwIfDisposed(),Qs(this)};H().prototype.relu6=function(){return this.throwIfDisposed(),dm(this)};H().prototype.reshapeAs=function(n){return this.throwIfDisposed(),M(this,n.shape)};H().prototype.reshape=function(n){return this.throwIfDisposed(),M(this,n)};H().prototype.resizeBilinear=function(n,e,t){return this.throwIfDisposed(),Sm(this,n,e,t)};H().prototype.resizeNearestNeighbor=function(n,e,t){return this.throwIfDisposed(),Nm(this,n,e,t)};H().prototype.reverse=function(n){return this.throwIfDisposed(),Js(this,n)};H().prototype.rfft=function(){return this.throwIfDisposed(),bv(this)};H().prototype.round=function(){return this.throwIfDisposed(),pm(this)};H().prototype.rsqrt=function(){return this.throwIfDisposed(),Sl(this)};H().prototype.selu=function(){return this.throwIfDisposed(),fm(this)};H().prototype.separableConv2d=function(n,e,t,s,o,r){return this.throwIfDisposed(),mm(this,n,e,t,s,o,r)};H().prototype.sigmoid=function(){return this.throwIfDisposed(),_o(this)};H().prototype.sign=function(){return this.throwIfDisposed(),ov(this)};H().prototype.sin=function(){return this.throwIfDisposed(),gm(this)};H().prototype.sinh=function(){return this.throwIfDisposed(),xm(this)};H().prototype.slice=function(n,e){return this.throwIfDisposed(),Be(this,n,e)};H().prototype.softmax=function(n){return this.throwIfDisposed(),gh(this,n)};H().prototype.softplus=function(){return this.throwIfDisposed(),di(this)};H().prototype.spaceToBatchND=function(n,e){return this.throwIfDisposed(),uh(this,n,e)};H().prototype.split=function(n,e){return this.throwIfDisposed(),Qt(this,n,e)};H().prototype.sqrt=function(){return this.throwIfDisposed(),Et(this)};H().prototype.square=function(){return this.throwIfDisposed(),Ue(this)};H().prototype.squaredDifference=function(n){return this.throwIfDisposed(),wv(this,n)};H().prototype.squeeze=function(n){return this.throwIfDisposed(),eo(this,n)};H().prototype.stack=function(n,e){this.throwIfDisposed();const t=n instanceof at?[this,n]:[this,...n];return Ln(t,e)};H().prototype.step=function(n){return this.throwIfDisposed(),xi(this,n)};H().prototype.stridedSlice=function(n,e,t,s,o,r,i,a){return this.throwIfDisposed(),vv(this,n,e,t,s,o,r,i,a)};H().prototype.sub=function(n){return this.throwIfDisposed(),pe(this,n)};H().prototype.sum=function(n,e){return this.throwIfDisposed(),ue(this,n,e)};H().prototype.tan=function(){return this.throwIfDisposed(),Nv(this)};H().prototype.tanh=function(){return this.throwIfDisposed(),cl(this)};H().prototype.tile=function(n){return this.throwIfDisposed(),yn(this,n)};H().prototype.toBool=function(){return this.throwIfDisposed(),oe(this,"bool")};H().prototype.toFloat=function(){return this.throwIfDisposed(),oe(this,"float32")};H().prototype.toInt=function(){return this.throwIfDisposed(),oe(this,"int32")};H().prototype.topk=function(n,e){return this.throwIfDisposed(),Rv(this,n,e)};H().prototype.transpose=function(n){return this.throwIfDisposed(),ve(this,n)};H().prototype.unique=function(n){return this.throwIfDisposed(),Fv(this,n)};H().prototype.unsortedSegmentSum=function(n,e){return this.throwIfDisposed(),Im(this,n,e)};H().prototype.unstack=function(n){return this.throwIfDisposed(),xs(this,n)};H().prototype.where=function(n,e){return this.throwIfDisposed(),wt(n,this,e)};H().prototype.zerosLike=function(){return this.throwIfDisposed(),ke(this)};class Pn extends Error{constructor(e){super(e),Object.setPrototypeOf(this,Pn.prototype)}}class an extends Error{constructor(e){super(e),Object.setPrototypeOf(this,an.prototype)}}class A extends Error{constructor(e){super(e),Object.setPrototypeOf(this,A.prototype)}}class be extends Error{constructor(e){super(e),Object.setPrototypeOf(this,be.prototype)}}class od extends Error{constructor(e){super(e),Object.setPrototypeOf(this,od.prototype)}}class Eg{constructor(e){this.maxEntries=e||100,this.cache=new Map}get(e){let t;return this.cache.has(e)&&(t=this.cache.get(e),this.cache.delete(e),this.cache.set(e,t)),t}put(e,t){if(this.cache.has(e))this.cache.delete(e);else if(this.cache.size>=this.maxEntries){const s=this.cache.keys().next().value;this.cache.delete(s)}this.cache.set(e,t)}getMaxEntries(){return this.maxEntries}setMaxEntries(e){if(e<0)throw new Error(`The maxEntries of LRU caches must be at least 0, but got ${e}.`);if(this.maxEntries>e)for(let t=0;t<this.maxEntries-e;t++){const s=this.cache.keys().next().value;this.cache.delete(s)}this.maxEntries=e}}function no(n,e){if(Array.isArray(n)){let t=[];for(let s=0;s<e;s++)t=t.concat(n);return t}else{const t=new Array(e);return t.fill(n),t}}function Bn(n,e){if(!n)throw new od(e)}function Rg(n,e){let t=0;for(const s of n)s===e&&t++;return t}function Wt(n){return n.length===1?n[0]:n}function Ae(n){return Array.isArray(n)?n:[n]}function ss(n){const t=n.replace(/(.)([A-Z][a-z0-9]+)/g,"$1_$2").replace(/([a-z])([A-Z])/g,"$1_$2").toLowerCase();return t[0]!=="_"?t:"private"+t}function so(n){return n.length<=1||n.indexOf("_")===-1?n:n.replace(/[_]+(\w|$)/g,(e,t)=>t.toUpperCase())}let ln={};function rd(n){if(n==null)return null;const e={};return e.className=n.getClassName(),e.config=n.getConfig(),e}function id(n){if(!(n==null||typeof n!="object"))if(Array.isArray(n))n.forEach(e=>id(e));else{const e=Object.keys(n);for(const t of e){const s=n[t];s!=null&&typeof s=="object"&&(!Array.isArray(s)&&s.type==="ndarray"&&typeof s.value=="number"?n[t]=s.value:id(s))}}}function Ci(n,e={},t={},s="object",o=!1){if(typeof n=="string"){const r=n;let i;if(r in t)i=t[r];else if(r in ln)i=ln[r];else if(i=e[r],i==null)throw new A(`Unknown ${s}: ${n}. This may be due to one of the following reasons:
1. The ${s} is defined in Python, in which case it needs to be ported to TensorFlow.js or your JavaScript code.
2. The custom ${s} is defined in JavaScript, but is not registered properly with tf.serialization.registerClass().`);return i}else{const r=n;if(r.className==null||r.config==null)throw new A(`${s}: Improper config format: ${JSON.stringify(r)}.
'className' and 'config' must set.`);const i=r.className;let a,l;if(i in t?[a,l]=t[i]:i in ln?[a,l]=ln.className:i in e&&([a,l]=e[i]),a==null)throw new A(`Unknown ${s}: ${i}. This may be due to one of the following reasons:
1. The ${s} is defined in Python, in which case it needs to be ported to TensorFlow.js or your JavaScript code.
2. The custom ${s} is defined in JavaScript, but is not registered properly with tf.serialization.registerClass().`);if(l!=null){const c={};for(const p of Object.keys(ln))c[p]=ln[p];for(const p of Object.keys(t))c[p]=t[p];const u=r.config;u.customObjects=c;const h=Object.assign({},ln);for(const p of Object.keys(t))ln[p]=t[p];id(r.config);const d=l(a,r.config,t,o);return ln=Object.assign({},h),d}else{const c=Object.assign({},ln);for(const h of Object.keys(t))ln[h]=t[h];const u=new a(r.config);return ln=Object.assign({},c),u}}}function lT(n,e){return n<e?-1:n>e?1:0}function Dl(n,e){return-1*lT(n,e)}function ys(n){if(n==null)return n;const e=[];for(const t of n)e.indexOf(t)===-1&&e.push(t);return e}function cT(n){if(n==null)throw new A(`Invalid value in obj: ${JSON.stringify(n)}`);for(const e in n)if(n.hasOwnProperty(e))return!1;return!0}function oo(n,e,t){if(t!=null&&n.indexOf(t)<0)throw new A(`${t} is not a valid ${e}.  Valid values are ${n} or null/undefined.`)}function ad(n,e,t=0,s=1/0){return Bn(t>=0),Bn(s>=t),Array.isArray(n)&&n.length>=t&&n.length<=s&&n.every(o=>typeof o===e)}function xt(n,e){Array.isArray(n)?(k(n.length>0,()=>`${e} is unexpectedly an empty array.`),n.forEach((t,s)=>xt(t,`element ${s+1} of ${e}`))):k(Number.isInteger(n)&&n>0,()=>`Expected ${e} to be a positive integer, but got ${Ag(n)}.`)}function Ag(n){return n===null?"null":Array.isArray(n)?"["+n.map(e=>Ag(e)).join(",")+"]":typeof n=="string"?`"${n}"`:`${n}`}function uT(n,e,t){let s=t!=null?t():Pt(),o;return(...i)=>{const a=t!=null?t():Pt();return a-s<e||(s=a,o=n(...i)),o}}function Dg(n){return n==="relu"?"relu":n==="linear"?"linear":n==="elu"?"elu":null}let hT=0;function Fg(){return hT++}const Fl={};function _l(n=""){return n in Fl||(Fl[n]=0),Fl[n]+=1,n+Fl[n].toString()}const dT=["channelsFirst","channelsLast"],pT=["nearest","bilinear"],fT=["valid","same","causal"],mT=["max","avg"],gT=["sum","mul","concat","ave"];const Vo=new Map;function st(n){oo(dT,"DataFormat",n)}function xT(n){oo(pT,"InterpolationFormat",n)}function Jt(n){oo(fT,"PaddingMode",n)}function _g(n){oo(mT,"PoolMode",n)}const Ii=[],Og="/";function ro(n,e){Ii.push(n);try{const t=e();return Ii.pop(),t}catch(t){throw Ii.pop(),t}}function bT(){return Ii.length===0?"":Ii.join(Og)+Og}function Lg(n){if(!Pg(n))throw new Error("Not a valid tensor name: '"+n+"'");return bT()+n}function Mg(n){if(!Pg(n))throw new Error("Not a valid tensor name: '"+n+"'");Vo.has(n)||Vo.set(n,0);const e=Vo.get(n);if(Vo.set(n,Vo.get(n)+1),e>0){const t=`${n}_${e}`;return Vo.set(t,1),t}else return n}const yT=new RegExp(/^[A-Za-z0-9][-A-Za-z0-9\._\/]*$/);function Pg(n){return!!n.match(yT)}function wT(n){return n===parseInt(n.toString(),10)}function ws(n,e,t){e==null&&(e=0),t==null&&(t=n.length);let s=1;for(let o=e;o<t;++o)s*=n[o];return s}function Wo(n){if(n.length===0)return Number.NaN;let e=Number.POSITIVE_INFINITY;for(let t=0;t<n.length;t++){const s=n[t];s<e&&(e=s)}return e}function Cs(n){if(n.length===0)return Number.NaN;let e=Number.NEGATIVE_INFINITY;for(let t=0;t<n.length;t++){const s=n[t];s>e&&(e=s)}return e}function Cn(n,e){if(e<n)throw new A(`end (${e}) < begin (${n}) is forbidden.`);const t=[];for(let s=n;s<e;++s)t.push(s);return t}let ld;function ct(){return ld==null&&(ld=Ef().epsilon()),ld}function In(){return"channelsLast"}function zn(n,e){return oe(n,e)}function $i(n,e=-1){const t=n.shape.slice();return e<0&&(e=t.length+e+1),t.splice(e,0,1),M(n,t)}function CT(n,e){return B(()=>{if(n.shape.length!==2)throw new A(`repeat() expects a rank-2 tensor, but received a rank-${n.shape.length} tensor.`);const t=$i(n,1);return hd(t,[1,e,1])})}function IT(n){const e=[ws(n.shape)];return M(n,e)}function $T(n){if(n.rank<=1)throw new A(`batchFlatten requires a minimum rank of 2. Got rank: ${n.rank}.`);const e=[n.shape[0],ws(n.shape,1)];return M(n,e)}function io(n,e,t){return B(()=>{switch(n.rank){case 1:return fh(n,e,t);case 2:return bm(n,[e,0],[t,n.shape[1]]);case 3:return mh(n,[e,0,0],[t,n.shape[1],n.shape[2]]);case 4:return Nl(n,[e,0,0,0],[t,n.shape[1],n.shape[2],n.shape[3]]);case 5:return Be(n,[e,0,0,0,0],[t,n.shape[1],n.shape[2],n.shape[3],n.shape[4]]);case 6:return Be(n,[e,0,0,0,0,0],[t,n.shape[1],n.shape[2],n.shape[3],n.shape[4],n.shape[5]]);default:throw new A(`sliceAlongFirstAxis() received an unsupported tensor rank: ${n.rank}`)}})}function cd(n,e,t){return B(()=>{switch(n.rank){case 1:return fh(n,e,t);case 2:return bm(n,[0,e],[n.shape[0],t]);case 3:return mh(n,[0,0,e],[n.shape[0],n.shape[1],t]);case 4:return Nl(n,[0,0,0,e],[n.shape[0],n.shape[1],n.shape[2],t]);default:throw new A(`sliceAlongLastAxis() received an unsupported tensor rank: ${n.rank}`)}})}function Ol(n,e,t,s){return B(()=>{switch(n.rank){case 1:return fh(n,e,t);case 2:switch(s){case 1:return io(n,e,t);case 2:return cd(n,e,t);default:throw new A(`The axis is not within the rank of the tensor ${s}`)}case 3:switch(s){case 1:return io(n,e,t);case 2:return mh(n,[0,e,0],[n.shape[0],t,n.shape[2]]);case 3:return cd(n,e,t);default:throw new A(`The axis is not within the rank of the tensor ${s}`)}case 4:switch(s){case 1:return io(n,e,t);case 2:return Nl(n,[0,e,0,0],[n.shape[0],t,n.shape[2],n.shape[3]]);case 3:return Nl(n,[0,0,e,0],[n.shape[0],n.shape[1],t,n.shape[3]]);case 4:return cd(n,e,t);default:throw new A(`The axis is not within the rank of the tensor ${s}`)}default:throw new A(`sliceAlongLastAxis() received an unsupported tensor rank: ${n.rank}`)}})}function ud(n,e=-1){let t;return e<0&&(t=n[0].rank,t!==0?e=t:e=0),e===n[0].rank&&(e=-1),Tt(n,e)}function Bg(n,e){switch(n.rank){case 1:return EI([n,e]);case 2:return AI([n,e],0);case 3:return FI([n,e],0);case 4:return OI([n,e],0);default:throw new A(`concatAlongFirstAxis() received an unsupported tensor rank: ${n.rank}`)}}function hd(n,e){if(Array.isArray(e)||(e=[e]),n.rank!==e.length)throw new A(`The length of input n (${e.length}) does not match the number of dimensions in input x (${n.rank})`);return yn(n,e)}function Ll(n,e=0,t=1,s,o){return Hk(n,e,t,s,o)}function Vn(n,e,t,s){if(n.rank<2||e.rank<2)throw new be(`dot requires both inputs to be rank >= 2 but got x shape = ${n.shape} and y shape = ${e.shape}`);if(e.rank>=3){const o=n.shape.slice(-1)[0],r=e.shape.slice(-2)[0];if(o!==r)throw new be(`If rank y >= 3, then the second last dim of y must equal the last dim of x but got x shape = ${n.shape} and  y shape = ${e.shape}`)}if(n.rank===2&&e.rank===2)return km({a:n,b:e,transposeA:!1,transposeB:!1,bias:s?dd(n.rank,s,In()):null,activation:t});{const o=n.shape.slice(),r=o.pop();n=M(n,[-1,r]);const i=e.shape.slice(),a=i.pop(),l=i.pop(),c=[...i,a],u=Array.from({length:e.rank},(f,m)=>m===0?e.rank-2:m<=e.rank-2?m-1:m);e=M(ve(e,u),[l,-1]);const h=[...o,...c];return M(km({a:n,b:e,transposeA:!1,transposeB:!1,bias:s?dd(n.rank,s,In()):null,activation:t}),h)}}function zg(n,e,t){return B(()=>(Array.isArray(e)?e=qt(e,"int32"):e=oe(e,"int32"),oh(n,e,t)))}function ki(n){return D(n,n)}function dd(n,e,t){const s=e.shape;if(e.rank!==1&&e.rank!==n)throw new A(`Unexpected bias dimensions: ${e.rank}; expected it to be 1 or ${n}`);if(n===5){if(t==="channelsFirst")return s.length===1?M(e,[1,s[0],1,1,1]):M(e,[1,s[3],s[0],s[1],s[2]]);if(t==="channelsLast")return s.length===1?M(e,[1,1,1,1,s[0]]):M(e,[1].concat(s))}else if(n===4){if(t==="channelsFirst")return s.length===1?M(e,[1,s[0],1,1]):M(e,[1,s[2],s[0],s[1]]);if(t==="channelsLast")return s.length===1?M(e,[1,1,1,s[0]]):M(e,[1].concat(s))}else if(n===3){if(t==="channelsFirst")return s.length===1?M(e,[1,s[0],1]):M(e,[1,s[1],s[0]]);if(t==="channelsLast")return s.length===1?M(e,[1,1,s[0]]):M(e,[1].concat(s))}else if(n<3)return e;throw new A(`Unsupported input rank by biasAdd: ${e.rank}`)}function $n(n,e,t){return B(()=>(t==null&&(t=In()),st(t),ee(n,dd(n.rank,e,t))))}function kT(n,e=1){if(e!==1)throw new be(`Support for alpha values other than 1 (${e}) is not implemented yet.`);return dl(n)}function vT(n){return B(()=>he(n,ee(_t(n),1)))}function Vg(n,e,t,s){return B(()=>zv(n,e,t,s))}function ST(n){return B(()=>{const e=ee(.5,D(.2,n));return Zt(e,0,1)})}function vi(n,e,t=!1){return t?n():e()}const NT=["fanIn","fanOut","fanAvg"],TT=["normal","uniform","truncatedNormal"];function ET(n){oo(NT,"FanMode",n)}function RT(n){oo(TT,"Distribution",n)}class cn extends Bo{fromConfigUsesCustomObjects(){return!1}getConfig(){return{}}}class Wg extends cn{apply(e,t){return nt(e,t)}}Wg.className="Zeros",Q(Wg);class pd extends cn{apply(e,t){return Jn(e,t)}}pd.className="Ones",Q(pd);class Ug extends cn{constructor(e){if(super(),typeof e!="object")throw new A(`Expected argument of type ConstantConfig but got ${e}`);if(e.value===void 0)throw new A(`config must have value set but got ${e}`);this.value=e.value}apply(e,t){return B(()=>D(Re(this.value),Jn(e,t)))}getConfig(){return{value:this.value}}}Ug.className="Constant",Q(Ug);class Gg extends cn{constructor(e){super(),this.DEFAULT_MINVAL=-.05,this.DEFAULT_MAXVAL=.05,this.minval=e.minval||this.DEFAULT_MINVAL,this.maxval=e.maxval||this.DEFAULT_MAXVAL,this.seed=e.seed}apply(e,t){return mi(e,this.minval,this.maxval,t,this.seed)}getConfig(){return{minval:this.minval,maxval:this.maxval,seed:this.seed}}}Gg.className="RandomUniform",Q(Gg);class Hg extends cn{constructor(e){super(),this.DEFAULT_MEAN=0,this.DEFAULT_STDDEV=.05,this.mean=e.mean||this.DEFAULT_MEAN,this.stddev=e.stddev||this.DEFAULT_STDDEV,this.seed=e.seed}apply(e,t){if(t=t||"float32",t!=="float32"&&t!=="int32")throw new be(`randomNormal does not support dType ${t}.`);return Ll(e,this.mean,this.stddev,t,this.seed)}getConfig(){return{mean:this.mean,stddev:this.stddev,seed:this.seed}}}Hg.className="RandomNormal",Q(Hg);class qg extends cn{constructor(e){super(),this.DEFAULT_MEAN=0,this.DEFAULT_STDDEV=.05,this.mean=e.mean||this.DEFAULT_MEAN,this.stddev=e.stddev||this.DEFAULT_STDDEV,this.seed=e.seed}apply(e,t){if(t=t||"float32",t!=="float32"&&t!=="int32")throw new be(`truncatedNormal does not support dType ${t}.`);return Cm(e,this.mean,this.stddev,t,this.seed)}getConfig(){return{mean:this.mean,stddev:this.stddev,seed:this.seed}}}qg.className="TruncatedNormal",Q(qg);class jg extends cn{constructor(e){super(),this.gain=e.gain!=null?e.gain:1}apply(e,t){return B(()=>{if(e.length!==2||e[0]!==e[1])throw new A("Identity matrix initializer can only be used for 2D square matrices.");return D(this.gain,Zf(e[0]))})}getConfig(){return{gain:this.gain}}}jg.className="Identity",Q(jg);function AT(n,e="channelsLast"){let t,s;if(st(e),n.length===2)t=n[0],s=n[1];else if([3,4,5].indexOf(n.length)!==-1){if(e==="channelsFirst"){const o=ws(n,2);t=n[1]*o,s=n[0]*o}else if(e==="channelsLast"){const o=ws(n,0,n.length-2);t=n[n.length-2]*o,s=n[n.length-1]*o}}else{const o=ws(n);t=Math.sqrt(o),s=Math.sqrt(o)}return[t,s]}class jt extends cn{constructor(e){if(super(),e.scale<0)throw new A(`scale must be a positive float. Got: ${e.scale}`);this.scale=e.scale==null?1:e.scale,this.mode=e.mode==null?"fanIn":e.mode,ET(this.mode),this.distribution=e.distribution==null?"normal":e.distribution,RT(this.distribution),this.seed=e.seed}apply(e,t){const s=AT(e),o=s[0],r=s[1];let i=this.scale;if(this.mode==="fanIn"?i/=Math.max(1,o):this.mode==="fanOut"?i/=Math.max(1,r):i/=Math.max(1,(o+r)/2),this.distribution==="normal"){const a=Math.sqrt(i);if(t=t||"float32",t!=="float32"&&t!=="int32")throw new be(`${this.getClassName()} does not support dType ${t}.`);return Cm(e,0,a,t,this.seed)}else{const a=Math.sqrt(3*i);return mi(e,-a,a,t,this.seed)}}getConfig(){return{scale:this.scale,mode:this.mode,distribution:this.distribution,seed:this.seed}}}jt.className="VarianceScaling",Q(jt);class fd extends jt{constructor(e){super({scale:1,mode:"fanAvg",distribution:"uniform",seed:e==null?null:e.seed})}getClassName(){return jt.className}}fd.className="GlorotUniform",Q(fd);class md extends jt{constructor(e){super({scale:1,mode:"fanAvg",distribution:"normal",seed:e==null?null:e.seed})}getClassName(){return jt.className}}md.className="GlorotNormal",Q(md);class gd extends jt{constructor(e){super({scale:2,mode:"fanIn",distribution:"normal",seed:e==null?null:e.seed})}getClassName(){return jt.className}}gd.className="HeNormal",Q(gd);class xd extends jt{constructor(e){super({scale:2,mode:"fanIn",distribution:"uniform",seed:e==null?null:e.seed})}getClassName(){return jt.className}}xd.className="HeUniform",Q(xd);class bd extends jt{constructor(e){super({scale:1,mode:"fanIn",distribution:"normal",seed:e==null?null:e.seed})}getClassName(){return jt.className}}bd.className="LeCunNormal",Q(bd);class yd extends jt{constructor(e){super({scale:1,mode:"fanIn",distribution:"uniform",seed:e==null?null:e.seed})}getClassName(){return jt.className}}yd.className="LeCunUniform",Q(yd);class Kg extends cn{constructor(e){super(),this.DEFAULT_GAIN=1,this.ELEMENTS_WARN_SLOW=2e3,this.gain=e.gain==null?this.DEFAULT_GAIN:e.gain,this.seed=e.seed}apply(e,t){return B(()=>{if(e.length<2)throw new be("Shape must be at least 2D.");if(t!=="int32"&&t!=="float32"&&t!==void 0)throw new TypeError(`Unsupported data type ${t}.`);t=t;const s=q(e.slice(0,-1)),o=e[e.length-1],r=s*o;r>this.ELEMENTS_WARN_SLOW&&console.warn(`Orthogonal initializer is being called on a matrix with more than ${this.ELEMENTS_WARN_SLOW} (${r}) elements: Slowness may result.`);const i=[Math.max(o,s),Math.min(o,s)],a=Ll(i,0,1,t,this.seed),l=LS.qr(a,!1);let c=l[0];const h=l[1].flatten().stridedSlice([0],[Math.min(o,s)*Math.min(o,s)],[Math.min(o,s)+1]);return c=D(c,h.sign()),s<o&&(c=c.transpose()),D(Re(this.gain),c.reshape(e))})}getConfig(){return{gain:this.gain,seed:this.seed}}}Kg.className="Orthogonal",Q(Kg);const Xg={constant:"Constant",glorotNormal:"GlorotNormal",glorotUniform:"GlorotUniform",heNormal:"HeNormal",heUniform:"HeUniform",identity:"Identity",leCunNormal:"LeCunNormal",leCunUniform:"LeCunUniform",ones:"Ones",orthogonal:"Orthogonal",randomNormal:"RandomNormal",randomUniform:"RandomUniform",truncatedNormal:"TruncatedNormal",varianceScaling:"VarianceScaling",zeros:"Zeros"};function Yg(n,e={}){return Ci(n,rn.getMap().classNameMap,e,"initializer")}function Ke(n){return rd(n)}function Ge(n){if(typeof n=="string"){const e=n in Xg?Xg[n]:n;if(e==="GlorotNormal")return new md;if(e==="GlorotUniform")return new fd;if(e==="HeNormal")return new gd;if(e==="HeUniform")return new xd;if(e==="LeCunNormal")return new bd;if(e==="LeCunUniform")return new yd;{const t={};return t.className=e,t.config={},Yg(t)}}else return n instanceof cn?n:Yg(n)}function wd(n){return Array.isArray(n)&&Array.isArray(n[0])}function Ml(n){return n.length===0?[]:Array.isArray(n[0])?n:[n]}function me(n){let e;if(Array.isArray(n)){if(n.length!==1)throw new A(`Expected Tensor length to be 1; got ${n.length}`);e=n[0]}else e=n;return e}function Ne(n){if(Array.isArray(n)&&Array.isArray(n[0])){if(n.length===1)return n=n,n[0];throw new A(`Expected exactly 1 Shape; got ${n.length}`)}else return n}function Pl(n){let e=0;for(const t of n)t.shape.length===0?e+=1:e+=t.shape.reduce((s,o)=>s*o);return e}const Zg="Variable";class DT{constructor(e,t="float32",s=Zg,o=!0,r=null){this.dtype=t==null?"float32":t,this.shape=e.shape,this.id=Fg(),s=s==null?Zg:s,this.originalName=Lg(s),this.name=Mg(this.originalName),this.trainable_=o,this.constraint=r,this.val=Lv(e,this.trainable_,this.name,this.dtype)}read(){return this.assertNotDisposed(),this.val}write(e){return this.assertNotDisposed(),FT(this.val,e),this.val.id!==e.id&&(this.val.assign(e),this.constraint!=null&&this.val.assign(this.constraint.apply(this.val))),this}dispose(){this.assertNotDisposed(),this.val.dispose()}assertNotDisposed(){if(this.val.isDisposed)throw new Error(`LayersVariable ${this.name} is already disposed.`)}get trainable(){return this.trainable_}set trainable(e){this.trainable_=e,this.val.trainable=e}}function FT(n,e){if(n.shape.toString()!==e.shape.toString())throw new Error("Shape mismatch: "+JSON.stringify(n.shape)+" vs. "+JSON.stringify(e.shape))}function Cd(n){return n.map(e=>e.read())}function Id(n){n.forEach(e=>{e[0].write(e[1])})}class ut{constructor(e){this.dtype=e.dtype,this.shape=e.shape,e.shape!=null?this.ndim=e.shape.length:this.ndim=e.ndim,this.maxNDim=e.maxNDim,this.minNDim=e.minNDim,this.axes=e.axes||{}}}class Wn{constructor(e,t,s,o,r,i,a){this.dtype=e,this.shape=t,this.sourceLayer=s,this.inputs=o,this.callArgs=r,this.outputTensorIndex=a,this.id=Fg(),i!=null&&(this.originalName=Lg(i),this.name=Mg(this.originalName)),this.rank=t.length}}let _T=0;class Bl{constructor(e,t){this.callArgs=t,this.id=_T++,this.outboundLayer=e.outboundLayer,this.inboundLayers=e.inboundLayers,this.nodeIndices=e.nodeIndices,this.tensorIndices=e.tensorIndices,this.inputTensors=e.inputTensors,this.outputTensors=e.outputTensors,this.inputMasks=e.inputMasks,this.outputMasks=e.outputMasks,this.inputShapes=e.inputShapes,this.outputShapes=e.outputShapes;for(const s of e.inboundLayers)s!=null&&s.outboundNodes.push(this);e.outboundLayer.inboundNodes.push(this)}getConfig(){const e=[];for(const t of this.inboundLayers)t!=null?e.push(t.name):e.push(null);return{outboundLayer:this.outboundLayer?this.outboundLayer.name:null,inboundLayers:e,nodeIndices:this.nodeIndices,tensorIndices:this.tensorIndices}}}let OT=0;class $e extends Bo{constructor(e={}){super(),this._callHook=null,this._addedWeightNames=[],this._stateful=!1,this.id=OT++,this.activityRegularizer=null,this.inputSpec=null,this.supportsMasking=!1,this._trainableWeights=[],this._nonTrainableWeights=[],this._losses=[],this._updates=[],this._built=!1,this.inboundNodes=[],this.outboundNodes=[];let t=e.name;if(!t){const s=this.getClassName();t=ss(s)+"_"+_l(s)}if(this.name=t,this.trainable_=e.trainable==null?!0:e.trainable,e.inputShape!=null||e.batchInputShape!=null){let s;if(e.batchInputShape!=null)s=e.batchInputShape;else if(e.inputShape!=null){let r=null;e.batchSize!=null&&(r=e.batchSize),s=[r].concat(e.inputShape)}this.batchInputShape=s;let o=e.dtype;o==null&&(o=e.inputDType),o==null&&(o="float32"),this.dtype=o}e.weights!=null?this.initialWeights=e.weights:this.initialWeights=null,this._refCount=null,this.fastWeightInitDuringBuild=!1}static nodeKey(e,t){return e.name+"_ib-"+t.toString()}getNodeAtIndex(e,t){if(this.inboundNodes.length===0)throw new an(`The layer has never been called and thus has no defined ${t}.`);if(this.inboundNodes.length<=e)throw new A(`Asked to get ${t} at node ${e}, but the layer has only ${this.inboundNodes.length} inbound nodes.`);return this.inboundNodes[e]}getInputAt(e){return Wt(this.getNodeAtIndex(e,"input").inputTensors)}getOutputAt(e){return Wt(this.getNodeAtIndex(e,"output").outputTensors)}get input(){if(this.inboundNodes.length>1)throw new Pn(`Layer ${this.name} has multiple inbound nodes, hence the notion of "layer input" is ill-defined. Use \`getInputAt(nodeIndex)\` instead.`);if(this.inboundNodes.length===0)throw new Pn(`Layer ${this.name} is not connected, no input to return.`);return Wt(this.getNodeAtIndex(0,"input").inputTensors)}get output(){if(this.inboundNodes.length===0)throw new Pn(`Layer ${this.name} has no inbound nodes.`);if(this.inboundNodes.length>1)throw new Pn(`Layer ${this.name} has multiple inbound nodes, hence the notion of "layer output" is ill-defined. Use \`getOutputAt(nodeIndex)\` instead.`);return Wt(this.getNodeAtIndex(0,"output").outputTensors)}get losses(){return this._losses}calculateLosses(){return this.losses.map(e=>e())}get updates(){return this._updates}get built(){return this._built}set built(e){this._built=e}get trainable(){return this.trainable_}set trainable(e){this._trainableWeights.forEach(t=>t.trainable=e),this.trainable_=e}get trainableWeights(){return this.trainable_?this._trainableWeights.filter(e=>e.trainable):[]}set trainableWeights(e){this._trainableWeights=e}get nonTrainableWeights(){return this.trainable?this._trainableWeights.filter(e=>!e.trainable).concat(this._nonTrainableWeights):this._trainableWeights.concat(this._nonTrainableWeights)}set nonTrainableWeights(e){this._nonTrainableWeights=e}get weights(){return this.trainableWeights.concat(this.nonTrainableWeights)}get stateful(){return this._stateful}resetStates(){if(!this.stateful)throw new Error("Cannot call the resetStates() method of a non-stateful Layer object.")}assertInputCompatibility(e){const t=Ae(e);if(this.inputSpec==null||this.inputSpec.length===0)return;const s=Ae(this.inputSpec);if(t.length!==s.length)throw new A(`Layer ${this.name} expects ${s.length} inputs, but it received ${t.length} input tensors. Input received: ${e}`);for(let o=0;o<t.length;o++){const r=t[o],i=s[o];if(i==null)continue;const a=r.rank;if(i.ndim!=null&&a!==i.ndim)throw new A(`Input ${o} is incompatible with layer ${this.name}: expected ndim=${i.ndim}, found ndim=${a}`);if(i.maxNDim!=null&&a>i.maxNDim)throw new A(`Input ${o} is incompatible with layer ${this.name}: expected max_ndim=${i.maxNDim}, found ndim=${a}`);if(i.minNDim!=null&&a<i.minNDim)throw new A(`Input ${o} is incompatible with layer ${this.name}: expected min_ndim=${i.minNDim}, found ndim=${a}.`);if(i.dtype!=null&&r.dtype!==i.dtype)throw new A(`Input ${o} is incompatible with layer ${this.name} : expected dtype=${i.dtype}, found dtype=${r.dtype}.`);if(i.axes){const l=r.shape;for(const c in i.axes){const u=Number(c),h=i.axes[c],d=u>=0?l[u]:l[l.length+u];if(h!=null&&[h,null].indexOf(d)===-1)throw new A(`Input ${o} is incompatible with layer ${this.name}: expected axis ${u} of input shape to have value ${h} but got shape ${l}.`)}}if(i.shape!=null)for(let l=0;l<i.shape.length;++l){const c=i.shape[l],u=r.shape[l];if(c!=null&&u!=null&&c!==u)throw new A(`Input ${o} is incompatible with layer ${this.name}: expected shape=${i.shape}, found shape=${r.shape}.`)}}}call(e,t){return e}invokeCallHook(e,t){this._callHook!=null&&this._callHook(e,t)}setCallHook(e){this._callHook=e}clearCallHook(){this._callHook=null}apply(e,t){t=t||{},this.assertNotDisposed();const s=Ae(e),o=PT(e),r=BT(e);if(o===r)throw new A("Arguments to apply() must be all SymbolicTensors or all Tensors");return ro(this.name,()=>{if(!this.built){this.assertInputCompatibility(e);const i=[];for(const a of Ae(e))i.push(a.shape);this.build(Wt(i)),this.built=!0,this.initialWeights&&this.setWeights(this.initialWeights),this._refCount===null&&r&&(this._refCount=1)}if(this.assertInputCompatibility(e),r){let i=this.call(e,t);this.supportsMasking&&this.setMaskMetadata(e,i);const a=Ae(i),l=[];for(let c of a)s.indexOf(c)!==-1&&(c=c.clone()),l.push(c);if(i=Wt(l),this.activityRegularizer!=null)throw new be("Layer invocation in the presence of activity regularizer(s) is not supported yet.");return i}else{const i=LT(e),a=this.computeOutputShape(i);let l;const c=MT(e);if(this.warnOnIncompatibleInputShape(Array.isArray(e)?i[0]:i),a!=null&&a.length>0&&Array.isArray(a[0])?l=a.map((u,h)=>new Wn(c,u,this,Ae(e),t,this.name,h)):l=new Wn(c,a,this,Ae(e),t,this.name),this.addInboundNode(e,l,null,null,i,a,t),this._refCount++,this.activityRegularizer!=null)throw new be("Layer invocation in the presence of activity regularizer(s) is not supported yet.");return l}})}warnOnIncompatibleInputShape(e){if(this.batchInputShape!=null)if(e.length!==this.batchInputShape.length)console.warn(`The rank of the input tensor provided (shape: ${JSON.stringify(e)}) does not match that of the batchInputShape (${JSON.stringify(this.batchInputShape)}) of the layer ${this.name}`);else{let t=!1;this.batchInputShape.forEach((s,o)=>{s!=null&&e[o]!=null&&e[o]!==s&&(t=!0)}),t&&console.warn(`The shape of the input tensor (${JSON.stringify(e)}) does not match the expectation of layer ${this.name}: ${JSON.stringify(this.batchInputShape)}`)}}get outputShape(){if(this.inboundNodes==null||this.inboundNodes.length===0)throw new Pn(`The layer ${this.name} has never been called and thus has no defined output shape.`);const e=[];for(const t of this.inboundNodes){const s=JSON.stringify(t.outputShapes);e.indexOf(s)===-1&&e.push(s)}if(e.length===1){const t=this.inboundNodes[0].outputShapes;return Array.isArray(t)&&Array.isArray(t[0])&&t.length===1?t[0]:t}else throw new Pn(`The layer ${this.name} has multiple inbound nodes with different output shapes. Hence the notion of "output shape" is ill-defined for the layer.`)}countParams(){if(!this.built)throw new an(`You tried to call countParams() on ${this.name}, but the layer is not built yet. Build it first by calling build(batchInputShape).`);return Pl(this.weights)}build(e){this.built=!0}getWeights(e=!1){return Cd(e?this.trainableWeights:this.weights)}setWeights(e){B(()=>{const t=this.weights;if(t.length!==e.length)throw new A(`You called setWeights(weights) on layer "${this.name}" with a weight list of length ${e.length}, but the layer was expecting ${t.length} weights. Provided weights: ${e}...`);if(t.length===0)return;const s=[],o=Cd(t);for(let r=0;r<o.length;++r){const i=o[r],a=t[r],l=e[r];if(!Ee(i.shape,l.shape))throw new A(`Layer weight shape ${i.shape} not compatible with provided weight shape ${l.shape}`);s.push([a,l])}Id(s)})}addWeight(e,t,s,o,r,i,a,l){if(this._addedWeightNames.indexOf(e)!==-1)throw new A(`Duplicate weight name ${e} for layer ${this.name}`);this._addedWeightNames.push(e),s==null&&(s="float32"),this.fastWeightInitDuringBuild&&(o=l!=null?l():Ge("zeros"));const c=o.apply(t,s),u=new DT(c,s,e,i,a);return c.dispose(),r!=null&&this.addLoss(()=>r.apply(u.read())),i==null&&(i=!0),i?this._trainableWeights.push(u):this._nonTrainableWeights.push(u),u}setFastWeightInitDuringBuild(e){this.fastWeightInitDuringBuild=e}addLoss(e){e==null||Array.isArray(e)&&e.length===0||(e=Ae(e),this._losses!==void 0&&this._losses!==null&&this.losses.push(...e))}computeOutputShape(e){return e}computeMask(e,t){if(!this.supportsMasking){if(t!=null)if(Array.isArray(t))t.forEach(s=>{if(s!=null)throw new TypeError(`Layer ${this.name} does not support masking, but was passed an inputMask.`)});else throw new TypeError(`Layer ${this.name} does not support masking, but was passed an inputMask.`);return null}return t}setMaskMetadata(e,t,s){if(!this.supportsMasking)return;const o=this.computeMask(e,s),r=Ae(t),i=Ae(o);if(r.length!==i.length)throw new Error(`${this.name} outputs ${r.length} tensors but ${r.length} masks for those tensors`);for(let a=0;a<r.length;a++)r[a].kerasMask=i[a]}addInboundNode(e,t,s,o,r,i,a=null){const l=Ae(e);t=Ae(t),s=Ae(s),o=Ae(o),r=Ml(r),i=Ml(i);const c=[],u=[],h=[];for(const d of l)c.push(d.sourceLayer),u.push(d.nodeIndex),h.push(d.tensorIndex);new Bl({outboundLayer:this,inboundLayers:c,nodeIndices:u,tensorIndices:h,inputTensors:l,outputTensors:t,inputMasks:s,outputMasks:o,inputShapes:r,outputShapes:i},a);for(let d=0;d<t.length;d++)t[d].sourceLayer=this,t[d].nodeIndex=this.inboundNodes.length-1,t[d].tensorIndex=d}getConfig(){const e={name:this.name,trainable:this.trainable};return this.batchInputShape!=null&&(e.batchInputShape=this.batchInputShape),this.dtype!=null&&(e.dtype=this.dtype),e}disposeWeights(){return this.weights.forEach(e=>e.dispose()),this.weights.length}assertNotDisposed(){if(this._refCount===0)throw new Error(`Layer '${this.name}' is already disposed.`)}dispose(){if(!this.built)throw new Error(`Cannot dispose Layer ${this.name} because it has not been built yet.`);if(this._refCount===null)throw new Error(`Cannot dispose Layer ${this.name} because it has not been used yet.`);this.assertNotDisposed();let e=0;return--this._refCount===0&&(e=this.disposeWeights()),{refCountAfterDispose:this._refCount,numDisposedVariables:e}}}function LT(n){n=Ae(n);const e=[];for(const t of n)e.push(t.shape);return Wt(e)}function MT(n){return"float32"}function Qg(n,e,t){if((e==null||t!=null&&t>0)&&(e=n.sourceLayer,t=n.nodeIndex),e.inboundNodes.length===0)return[n];{const s=e.inboundNodes[t];if(s.inboundLayers.length===0)return s.inputTensors;{const o=[];for(let r=0;r<s.inboundLayers.length;r++){const i=s.inputTensors[r],a=s.inboundLayers[r],l=s.nodeIndices[r],c=Qg(i,a,l);for(const u of c)o.indexOf(u)===-1&&o.push(u)}return o}}}function PT(n){let e=!0;for(const t of Ae(n))if(!(t instanceof Wn)){e=!1;break}return e}function BT(n){let e=!0;for(const t of Ae(n))if(t instanceof Wn){e=!1;break}return e}class Si extends $e{constructor(e){if(super({dtype:e.dtype,name:e.name!=null?e.name:_l("input").toString()}),e.batchSize==null&&(e.batchSize=null),e.sparse==null&&(e.sparse=!1),this.trainable=!1,this.built=!0,this.sparse=e.sparse,e.inputShape!=null&&e.batchInputShape!=null)throw new A("Only provide the inputShape OR batchInputShape argument to inputLayer, not both at the same time.");let t=e.batchInputShape;if(t==null){if(e.inputShape==null)throw new A("An InputLayer should be passed either a `batchInputShape` or an `inputShape`.");t=[e.batchSize].concat(e.inputShape)}else if(e.batchSize!=null)throw new A("Cannot specify batchSize if batchInputShape is specified when creating an InputLayer.");const s=e.dtype||"float32";this.batchInputShape=t,this.dtype=s,this.inputSpec=[{shape:t}];const o=new Wn(this.dtype,this.batchInputShape,this,[],{},this.name);o.nodeIndex=0,o.tensorIndex=0,new Bl({outboundLayer:this,inboundLayers:[],nodeIndices:[],tensorIndices:[],inputTensors:[o],outputTensors:[o],inputMasks:[null],outputMasks:[null],inputShapes:[t],outputShapes:[t]})}apply(e,t){throw new A(`Cannot pass any input to an InputLayer's apply() method. InputLayer name: ${this.name}`)}dispose(){return{refCountAfterDispose:this._refCount,numDisposedVariables:0}}getConfig(){return{batchInputShape:this.batchInputShape,dtype:this.dtype,sparse:this.sparse,name:this.name}}}Si.className="InputLayer",Q(Si);function zT(n){if(n.batchShape==null&&n.shape==null)throw new Error("Please provide to Input either a `shape` or a `batchShape` argument. Note that `shape` does not include the batch dimension.");if(n.batchShape!=null&&n.shape!=null)throw new A("Please provide either a `shape` or `batchShape` argument to Input, but not both.");let e=n.batchShape;n.shape!=null&&e==null&&(e=[null].concat(n.shape));let t=n.dtype;return t==null&&(t="float32"),new Si({batchInputShape:e,name:n.name,dtype:t,sparse:n.sparse}).inboundNodes[0].outputTensors[0]}function VT(n,e){if(n.dtype==null||n.dtype===e.dtype)return e;try{return oe(e,n.dtype)}catch(t){throw new A(`The dtype of the feed (${e.dtype}) can not be cast to the dtype of the key '${n.name}' (${n.dtype}).`)}}class Is{constructor(e){if(this.id2Value={},this.id2Mask={},this.name2Id={},e instanceof Is)for(const t in e.id2Value)this.id2Value[t]=e.id2Value[t],t in e.id2Mask&&(this.id2Mask[t]=e.id2Mask[t]);else{if(e==null)return;for(const t of e)this.add(t.key,t.value)}}add(e,t,s){if(this.id2Value[e.id]==null)this.id2Value[e.id]=VT(e,t),this.name2Id[e.name]=e.id,s!=null&&(this.id2Mask[e.id]=s);else throw new A(`Duplicate key: name=${e.name}, id=${e.id}`);return this}addFeed(e){this.add(e.key,e.value)}hasKey(e){return this.id2Value[e.id]!=null}names(){return Object.keys(this.name2Id)}getValue(e){if(e instanceof Wn){if(this.id2Value[e.id]==null)throw new A(`Nonexistent key: ${e.name}`);return this.id2Value[e.id]}else{const t=this.name2Id[e];if(t==null)throw new A(`Feed dict has no SymbolicTensor name: ${e}`);return this.id2Value[t]}}getMask(e){if(e instanceof Wn){if(this.id2Value[e.id]==null)throw new A(`Nonexistent key: ${e.name}`);return this.id2Mask[e.id]}else{const t=this.name2Id[e];if(t==null)throw new A(`Feed dict has no SymbolicTensor name: ${e}`);return this.id2Mask[t]}}disposeMasks(){this.id2Mask!=null&&ge(this.id2Mask)}}const zl=new Eg,Vl=new Eg;function WT(n){zl!=null&&zl.setMaxEntries(n),Vl!=null&&Vl.setMaxEntries(n)}function Ni(n,e,t,s){const o=t==null?!1:t.training,r=Array.isArray(n),i=r?n:[n],a=i.map(f=>f.name),l=[],c=e.names();for(const f of a)c.indexOf(f)!==-1?l.push(e.getValue(f)):l.push(null);const u=a.join(",")+"|"+e.names().sort().join(",");let h=zl.get(u),d;if(h==null){const f=UT(i,e);h=f.sorted,d=f.recipientCounts,zl.put(u,h),Vl.put(u,d)}d={},o||Object.assign(d,Vl.get(u));const p=new Is(e);for(let f=0;f<h.length;++f){const m=h[f],g=m.sourceLayer;if(g instanceof Si)continue;const x=[],b=[],w=[];let y=!1;for(const S of m.inputs){const v=p.getValue(S),I=p.getMask(S);x.push(v),b.push(I),I!=null&&(y=!0),o||(d[S.name]--,d[S.name]===0&&!e.hasKey(S)&&a.indexOf(S.name)===-1&&!v.isDisposed&&S.sourceLayer.stateful!==!0&&w.push(v))}y&&(t=t||{},t.mask=b[0]);const C=Ae(g.apply(x,t));let $=null;g.supportsMasking&&($=g.computeMask(x,b));const N=HT(m),T=Array.isArray(N)?N:[N];for(let S=0;S<T.length;++S){p.hasKey(T[S])||p.add(T[S],C[S],Array.isArray($)?$[0]:$);const v=a.indexOf(T[S].name);v!==-1&&(l[v]=C[S])}o||ge(w)}return p.disposeMasks(),r?l:l[0]}function UT(n,e){k(n!=null&&n.length>0,()=>"Expected at least one fetch, got none");let t=[],s={};if(n.length===1){const o=Jg(n[0],e);t=o.sorted,s=o.recipientMap}else{const o=new Set;for(const r of n){const{sorted:i,recipientMap:a}=Jg(r,e);for(const l of i)o.has(l.name)||(t.push(l),o.add(l.name));for(const l in a)s[l]==null&&(s[l]=new Set),a[l].forEach(c=>s[l].add(c))}}return{sorted:t,recipientCounts:GT(s)}}function GT(n){const e={};for(const t in n)e[t]=n[t].size;return e}function Jg(n,e){const t=new Set,s=[],o={};for(const a of e.names())t.add(a);const r=[],i=[];for(r.push(n);r.length>0;){const a=r[r.length-1];if(t.has(a.name)){r.pop();continue}const l=i[i.length-1]===r.length-1;if(a.inputs.length===0||l)r.pop(),s.push(a),t.add(a.name),l&&i.pop();else{i.push(r.length-1);for(const c of a.inputs)o[c.name]==null&&(o[c.name]=new Set),o[c.name].add(a.name),!t.has(c.name)&&r.push(c)}}return{sorted:s,recipientMap:o}}function HT(n){let e;if(n.sourceLayer.inboundNodes.length===1)e=n.sourceLayer.output;else{let t=null;for(let s=0;s<n.sourceLayer.inboundNodes.length;++s)for(const o of n.sourceLayer.inboundNodes[s].outputTensors)if(o.id===n.id){t=s;break}e=n.sourceLayer.getOutputAt(t)}return e}V().registerFlag("TOPOLOGICAL_SORT_CACHE_MAX_ENTRIES",()=>100,WT);function $d(n,e){return B(()=>Et(ue(D(n,n),e,!0)))}class Ti extends Bo{getConfig(){return{}}}class ex extends Ti{constructor(e){super(),this.defaultMaxValue=2,this.defaultAxis=0,this.maxValue=e.maxValue!=null?e.maxValue:this.defaultMaxValue,this.axis=e.axis!=null?e.axis:this.defaultAxis}apply(e){return B(()=>{const t=$d(e,this.axis),s=Zt(t,0,this.maxValue);return D(e,he(s,ee(ct(),t)))})}getConfig(){return{maxValue:this.maxValue,axis:this.axis}}}ex.className="MaxNorm",Q(ex);class tx extends Ti{constructor(e){super(),this.defaultAxis=0,this.axis=e.axis!=null?e.axis:this.defaultAxis}apply(e){return B(()=>he(e,ee(ct(),$d(e,this.axis))))}getConfig(){return{axis:this.axis}}}tx.className="UnitNorm",Q(tx);class nx extends Ti{apply(e){return Qs(e)}}nx.className="NonNeg",Q(nx);class sx extends Ti{constructor(e){super(),this.defaultMinValue=0,this.defaultMaxValue=1,this.defaultRate=1,this.defaultAxis=0,this.minValue=e.minValue!=null?e.minValue:this.defaultMinValue,this.maxValue=e.maxValue!=null?e.maxValue:this.defaultMaxValue,this.rate=e.rate!=null?e.rate:this.defaultRate,this.axis=e.axis!=null?e.axis:this.defaultAxis}apply(e){return B(()=>{const t=$d(e,this.axis),s=ee(D(this.rate,Zt(t,this.minValue,this.maxValue)),D(1-this.rate,t));return D(e,he(s,ee(ct(),t)))})}getConfig(){return{minValue:this.minValue,maxValue:this.maxValue,rate:this.rate,axis:this.axis}}}sx.className="MinMaxNorm",Q(sx);const ox={maxNorm:"MaxNorm",minMaxNorm:"MinMaxNorm",nonNeg:"NonNeg",unitNorm:"UnitNorm"};function ht(n){return rd(n)}function rx(n,e={}){return Ci(n,rn.getMap().classNameMap,e,"constraint")}function dt(n){if(n==null)return null;if(typeof n=="string"){const t={className:n in ox?ox[n]:n,config:{}};return rx(t)}else return n instanceof Ti?n:rx(n)}function ao(n){return Y(this,null,function*(){if(n==null)return;const e=[],t=[],s=[];for(const o in n){const r=n[o];if(typeof r!="number"){const i=r;e.push(i.data()),t.push(o),s.push(i)}}if(e.length>0){const o=yield Promise.all(e);for(let r=0;r<o.length;++r)n[t[r]]=o[r][0];ge(s)}})}function ix(n){if(n!=null)for(const e in n){const t=n[e];typeof t!="number"&&t.dispose()}}var ax;(function(n){n[n.SILENT=0]="SILENT",n[n.VERBOSE=1]="VERBOSE"})(ax||(ax={}));const qT=125;class Ei{constructor(){this.validationData=null}setParams(e){this.params=e}onEpochBegin(e,t){return Y(this,null,function*(){})}onEpochEnd(e,t){return Y(this,null,function*(){})}onBatchBegin(e,t){return Y(this,null,function*(){})}onBatchEnd(e,t){return Y(this,null,function*(){})}onTrainBegin(e){return Y(this,null,function*(){})}onTrainEnd(e){return Y(this,null,function*(){})}setModel(e){}}class jT{constructor(e,t=10){e==null&&(e=[]),this.callbacks=e,this.queueLength=t}append(e){this.callbacks.push(e)}setParams(e){for(const t of this.callbacks)t.setParams(e)}setModel(e){for(const t of this.callbacks)t.setModel(e)}onEpochBegin(e,t){return Y(this,null,function*(){t==null&&(t={});for(const s of this.callbacks)yield s.onEpochBegin(e,t)})}onEpochEnd(e,t){return Y(this,null,function*(){t==null&&(t={});for(const s of this.callbacks)yield s.onEpochEnd(e,t)})}onBatchBegin(e,t){return Y(this,null,function*(){t==null&&(t={});for(const s of this.callbacks)yield s.onBatchBegin(e,t)})}onBatchEnd(e,t){return Y(this,null,function*(){t==null&&(t={});for(const s of this.callbacks)yield s.onBatchEnd(e,t)})}onTrainBegin(e){return Y(this,null,function*(){e==null&&(e={});for(const t of this.callbacks)yield t.onTrainBegin(e)})}onTrainEnd(e){return Y(this,null,function*(){e==null&&(e={});for(const t of this.callbacks)yield t.onTrainEnd(e)})}}class KT extends Ei{constructor(){super()}onEpochBegin(e){return Y(this,null,function*(){this.seen=0,this.totals={}})}onBatchEnd(e,t){return Y(this,null,function*(){t==null&&(t={});const s=t.size==null?0:t.size;this.seen+=s;for(const o in t){const r=t[o];if(typeof r=="number")this.totals.hasOwnProperty(o)||(this.totals[o]=0),this.totals[o]=this.totals[o]+r*s;else{let i;o in this.totals?i=this.totals[o]:this.totals[o]=0;const a=B(()=>ee(this.totals[o],D(r,s)));this.totals[o]=a,i!=null&&i.dispose()}}})}onEpochEnd(e,t){return Y(this,null,function*(){if(t!=null)for(const s of this.params.metrics)this.totals[s]!=null&&(typeof this.totals[s]=="number"?t[s]=this.totals[s]/this.seen:B(()=>{const o=D(he(1,this.seen),this.totals[s]);t[s]=o,this.totals[s].dispose(),An(t[s])}))})}}class XT extends Ei{onTrainBegin(e){return Y(this,null,function*(){this.epoch=[],this.history={}})}onEpochEnd(e,t){return Y(this,null,function*(){t==null&&(t={}),this.epoch.push(e);for(const s in t)this.history[s]==null&&(this.history[s]=[]),this.history[s].push(t[s])})}syncData(){return Y(this,null,function*(){const e=[],t=[],s=[];for(const r in this.history){const i=this.history[r];for(let a=0;a<i.length;++a)if(typeof i[a]!="number"){const l=i[a];e.push(l.data()),t.push(r),s.push(a)}}const o=yield Promise.all(e);for(let r=0;r<o.length;++r)this.history[t[r]][s[r]].dispose(),this.history[t[r]][s[r]]=o[r][0]})}}class YT extends Ei{constructor(e,t){if(super(),this.currentEpoch=0,this.nowFunc=e.nowFunc,this.nextFrameFunc=e.nextFrameFunc||Km,this.yieldEvery=t||"auto",this.yieldEvery==="auto"&&(this.yieldEvery=qT),this.yieldEvery==="never"&&e.onYield!=null)throw new Error("yieldEvery is `never` but you provided an `onYield` callback. Either change `yieldEvery` or remove the callback");Lc(this.yieldEvery)&&(this.maybeWait=uT(this.maybeWait.bind(this),this.yieldEvery,this.nowFunc)),this.trainBegin=e.onTrainBegin,this.trainEnd=e.onTrainEnd,this.epochBegin=e.onEpochBegin,this.epochEnd=e.onEpochEnd,this.batchBegin=e.onBatchBegin,this.batchEnd=e.onBatchEnd,this.yield=e.onYield}maybeWait(e,t,s){return Y(this,null,function*(){const o=[];this.yield!=null&&(yield ao(s),o.push(this.yield(e,t,s))),o.push(this.nextFrameFunc()),yield Promise.all(o)})}onEpochBegin(e,t){return Y(this,null,function*(){this.currentEpoch=e,this.epochBegin!=null&&(yield ao(t),yield this.epochBegin(e,t))})}onEpochEnd(e,t){return Y(this,null,function*(){const s=[];this.epochEnd!=null&&(yield ao(t),s.push(this.epochEnd(e,t))),this.yieldEvery==="epoch"&&s.push(this.nextFrameFunc()),yield Promise.all(s)})}onBatchBegin(e,t){return Y(this,null,function*(){this.batchBegin!=null&&(yield ao(t),yield this.batchBegin(e,t))})}onBatchEnd(e,t){return Y(this,null,function*(){const s=[];this.batchEnd!=null&&(yield ao(t),s.push(this.batchEnd(e,t))),this.yieldEvery==="batch"?s.push(this.nextFrameFunc()):Lc(this.yieldEvery)&&s.push(this.maybeWait(this.currentEpoch,e,t)),yield Promise.all(s)})}onTrainBegin(e){return Y(this,null,function*(){this.trainBegin!=null&&(yield ao(e),yield this.trainBegin(e))})}onTrainEnd(e){return Y(this,null,function*(){this.trainEnd!=null&&(yield ao(e),yield this.trainEnd(e))})}}function lx(n,e){return n==null&&(n={}),n instanceof Ei?[n]:Array.isArray(n)&&n[0]instanceof Ei?n:Ae(n).map(s=>new YT(s,e))}class un{constructor(){}static registerCallbackConstructor(e,t){k(e>=0&&Number.isInteger(e),()=>`Verbosity level is expected to be an integer >= 0, but got ${e}`),un.checkForDuplicate(t),un.constructors[e]==null&&(un.constructors[e]=[]),un.constructors[e].push(t)}static checkForDuplicate(e){for(const t in un.constructors)un.constructors[+t].forEach(o=>{if(o===e)throw new A("Duplicate callback constructor.")})}static clear(){un.constructors={}}static createCallbacks(e){const t=[];for(const s in un.constructors){const o=+s;e>=o&&t.push(...un.constructors[o])}return t.map(s=>new s)}}un.constructors={};function cx(n,e,t,s,o,r,i,a,l){const c=new XT,u=[new KT,...un.createCallbacks(e)];n!=null&&u.push(...n),u.push(c);const h=new jT(u);return h.setParams({epochs:t,initialEpoch:s,samples:o,steps:r,batchSize:i,verbose:e,doValidation:a,metrics:l}),{callbackList:h,history:c}}function Un(n,e={},t=!1){return Ci(n,rn.getMap().classNameMap,e,"layer",t)}function Wl(n,e){return B(()=>{n.dtype!=="float32"&&(n=oe(n,"float32"));const t=ue(ki(n),e,!0),s=ui(t.shape,ct()),o=Et(gs(t,s));return he(n,o)})}function Ul(n,e){return B(()=>it(ki(pe(e,n)),-1))}function kd(n,e){return B(()=>it(_t(pe(e,n)),-1))}function vd(n,e){return B(()=>{const t=pe(n,e),s=Zt(_t(n),ct(),Number.MAX_VALUE),o=_t(he(t,s));return D(100,it(o,-1))})}function ZT(n,e){return B(()=>{const t=Zt(e,ct(),Number.MAX_VALUE),s=On(ee(1,t)),o=Zt(n,ct(),Number.MAX_VALUE),r=On(ee(1,o));return it(ki(pe(s,r)),-1)})}function QT(n,e){return B(()=>{const t=gs(0,pe(1,D(n,e)));return it(ki(t),-1)})}function JT(n,e){return B(()=>{const t=gs(0,pe(1,D(n,e)));return it(t,-1)})}function eE(n,e){return B(()=>{const t=ue(D(n,e),-1),s=bn(D(pe(1,n),e),-1);return gs(0,ee(1,pe(s,t)))})}function tE(n,e){return B(()=>{const t=Math.log(2),s=pe(e,n),o=pe(ee(s,di(D(-2,s))),t);return it(o,-1)})}function Ri(n,e,t=!1){return B(()=>{if(t)e=gh(e);else{const s=ue(e,e.shape.length-1,!0);e=he(e,s)}return e=Zt(e,ct(),1-ct()),tt(ue(D(oe(n,"float32"),On(e)),e.shape.length-1))})}function Gl(n,e,t=!1){return B(()=>{const s=oe(ml(IT(n)),"int32");e=Zt(e,ct(),1-ct());const o=e.shape,r=M(nm(s,o[o.length-1]),o);return Ri(r,e,t)})}function nE(n,e){if(!Ee(n.shape,e.shape))throw new A(`logits and labels must have the same shape, but got shapes ${JSON.stringify(n.shape)} and ${JSON.stringify(e.shape)}`);return B(()=>{const t=Qs(e),s=tt(_t(e));return ee(pe(t,D(e,n)),Qf(_n(s)))})}function Hl(n,e){return B(()=>{let t;return t=Zt(e,ct(),1-ct()),t=On(he(t,pe(1,t))),it(nE(n,t),-1)})}function sE(n,e){return B(()=>{const t=Zt(n,ct(),1),s=Zt(e,ct(),1);return ue(D(n,On(he(t,s))),-1)})}function oE(n,e){return B(()=>{const t=On(ee(ct(),e));return it(pe(e,D(n,t)),-1)})}function ux(n,e){return B(()=>{const t=Wl(n,-1),s=Wl(e,-1),o=D(t,s);return tt(ue(o,-1))})}const ql={meanSquaredError:Ul,meanAbsoluteError:kd,meanAbsolutePercentageError:vd,meanSquaredLogarithmicError:ZT,squaredHinge:QT,hinge:JT,categoricalHinge:eE,logcosh:tE,categoricalCrossentropy:Ri,sparseCategoricalCrossentropy:Gl,binaryCrossentropy:Hl,kullbackLeiblerDivergence:sE,poisson:oE,cosineProximity:ux};function Sd(n){if(typeof n=="string"){if(n in ql)return ql[n];let e=`Unknown loss ${n}`;throw n.toLowerCase().includes("softmaxcrossentropy")&&(e=`Unknown loss ${n}. Use "categoricalCrossentropy" as the string name for tf.losses.softmaxCrossEntropy`),new A(e)}else return n}function hx(n,e){return B(()=>{const t=D(.5,on(e)),s=zn(Ht(e,t),n.dtype);return it(Fn(n,s),-1)})}function dx(n,e){return B(()=>zn(Fn(qs(n,-1),qs(e,-1)),"float32"))}function rE(n,e){return B(()=>oe(ue(Qn(Fn(n,1),Fn(e,1))),"float32"))}function iE(n,e){return B(()=>oe(ue(Qn(Fn(n,0),Fn(e,1))),"float32"))}function aE(n,e){return B(()=>{const t=rE(n,e),s=iE(n,e),o=ee(t,s);return oe(wt(Ht(o,0),he(t,o),0),"float32")})}function lE(n,e){return Hl(n,e)}function cE(n,e){return n.rank===e.rank&&(n=eo(n,[n.rank-1])),e=qs(e,-1),e.dtype!==n.dtype&&(e=oe(e,n.dtype)),oe(Fn(n,e),"float32")}const uE=Ul,hE=Ul,dE=kd,pE=kd,fE=vd,mE=vd,px=Ri,gE=ux,fx=Gl,jl={binaryAccuracy:hx,categoricalAccuracy:dx,precision:aE,categoricalCrossentropy:px,sparseCategoricalCrossentropy:fx,mse:uE,MSE:hE,mae:dE,MAE:pE,mape:fE,MAPE:mE,cosine:gE};function xE(n){if(typeof n=="string"&&n in jl)return jl[n];if(typeof n!="string"&&n!=null)return n;throw new A(`Unknown metric ${n}`)}function Kl(n){if(Bn(n!==null,`Unknown LossOrMetricFn ${n}`),typeof n=="string")return n;{let e;for(const t of Object.keys(ql))if(ql[t]===n){e=t;break}if(e!==void 0)return e;for(const t of Object.keys(jl))if(jl[t]===n){e=t;break}return e!==void 0?e:n.name}}function bE(n){const e={Adagrad:()=>zo.adagrad(.01),Adadelta:()=>zo.adadelta(1,.95,ct()),Adam:()=>zo.adam(.001,.9,.999,ct()),Adamax:()=>zo.adamax(.002,.9,.999,ct(),0),RMSProp:()=>zo.rmsprop(.001,.9,0,ct()),SGD:()=>zo.sgd(.01)};if(e.adagrad=e.Adagrad,e.adadelta=e.Adadelta,e.adam=e.Adam,e.adamax=e.Adamax,e.rmsprop=e.RMSProp,e.sgd=e.SGD,n in e)return e[n]();throw new A(`Unknown Optimizer ${n}`)}const mx=1*1024*1024;function gx(n,e,t=!1){if(n==null||typeof n!="object"||Object.getPrototypeOf(n)!==Object.prototype||!Nd(n))throw new Error("User-defined metadata is expected to be a JSON object, but is not.");if(t){const s=JSON.stringify(n);s.length>mx&&console.warn(`User-defined metadata of model "${e}" is too large in size (length=${s.length} when serialized). It is not recommended to store such large objects in user-defined metadata. Please make sure its serialized length is <= ${mx}.`)}}function Nd(n){if(n===null)return!0;if(typeof n=="object")if(Object.getPrototypeOf(n)===Object.prototype){const e=Object.keys(n);for(const t of e)if(typeof t!="string"||!Nd(n[t]))return!1;return!0}else if(Array.isArray(n)){for(const e of n)if(!Nd(e))return!1;return!0}else return!1;else{const e=typeof n;return e==="string"||e==="number"||e==="boolean"}}function yE(n,e,t,s=console.log){const o=CE(n),r=["Layer (type)","Input Shape","Output shape","Param #"];o?(e=e||90,t=t||[.32,.61,.89,1]):(e=e||115,t=t||[.24,.48,.7,.8,1]),t[t.length-1]<=1&&(t=t.map(u=>Math.floor(e*u)));let i;if(!o){r.push("Receives inputs"),i=[];for(const u in n.nodesByDepth)i.push(...n.nodesByDepth[u])}s("_".repeat(e)),Xl(r,t,s),s("=".repeat(e));const a=n.layers;for(let u=0;u<a.length;++u)o?IE(a[u],t,s):$E(a[u],t,i,s),s((u===a.length-1?"=":"_").repeat(e));n.checkTrainableWeightsConsistency();const l=wE(n),c=Pl(n.nonTrainableWeights);s(`Total params: ${l+c}`),s(`Trainable params: ${l}`),s(`Non-trainable params: ${c}`),s("_".repeat(e))}function wE(n){let e;return n.collectedTrainableWeights!=null?e=Pl(n.collectedTrainableWeights):e=Pl(n.trainableWeights),e}function CE(n){let e=!0;const t=[],s=[];for(const o in n.nodesByDepth)t.push(n.nodesByDepth[o]);for(const o of t){if(o.length>1||o.length===1&&o[0].inboundLayers.length>1){e=!1;break}s.push(...o)}if(e)for(const o of n.layers){let r=!1;for(const i of o.inboundNodes)if(s.indexOf(i)!==-1)if(r){e=!1;break}else r=!0;if(!e)break}return e}function Xl(n,e,t=console.log){let s="";for(let o=0;o<n.length;++o)o>0&&(s=s.slice(0,s.length-1)+" "),s+=n[o],s=s.slice(0,e[o]),s+=" ".repeat(e[o]-s.length);t(s)}function IE(n,e,t){let s,o;try{o=n.inboundNodes.map(l=>JSON.stringify(l.inputShapes)).join(",")}catch(l){o="multiple"}try{s=JSON.stringify(n.outputShape)}catch(l){s="multiple"}const r=n.name,i=n.getClassName(),a=[`${r} (${i})`,o,s,n.countParams().toString()];Xl(a,e,t)}function $E(n,e,t,s){let o,r;try{r=n.inboundNodes.map(h=>JSON.stringify(h.inputShapes)).join(",")}catch(h){r="multiple"}try{o=JSON.stringify(n.outputShape)}catch(h){o="multiple"}const i=[];for(const h of n.inboundNodes)if(!(t!=null&&t.length>0&&t.indexOf(h)===-1))for(let d=0;d<h.inboundLayers.length;++d){const p=h.inboundLayers[d].name,f=h.nodeIndices[d],m=h.tensorIndices[d];i.push(`${p}[${f}][${m}]`)}const a=n.name,l=n.getClassName(),c=i.length===0?"":i[0],u=[`${a} (${l})`,r,o,n.countParams().toString(),c];Xl(u,e,s);for(let h=1;h<i.length;++h)Xl(["","","","",i[h]],e,s)}function xx(n,e,t){return(n==="inboundNodes"||n==="outputLayers"||n==="inputLayers")&&e===0&&typeof t=="string"}function Yl(n,e){if(n===null)return null;if(typeof n=="string")return so(n);if(typeof n=="number"||typeof n=="boolean")return n;if(n instanceof Array){const t=[],s=n.length;for(let o=0;o<s;++o){const r=n[o];xx(e,o,r)?t.push(r):t.push(Yl(r,e))}return t}else{const t={};for(const s of Object.keys(n)){const o=n[s];if(s==="name"&&typeof o=="string")t[s]=o;else{const r=so(s);t[r]=Yl(o,r)}}return t}}function Td(n,e){if(n==null)return null;if(typeof n=="string")return ss(n);if(typeof n=="number"||typeof n=="boolean")return n;if(n instanceof Array){const t=[],s=n.length;for(let o=0;o<s;++o){const r=n[o];xx(e,o,r)?t.push(r):t.push(Td(r,e))}return t}else{const t={};for(const s of Object.keys(n)){const o=n[s],r=ss(s);(s==="name"||s==="className")&&typeof o=="string"?t[r]=o:t[r]=Td(o,s)}return t}}const bx="4.20.0";const kE=n=>{const e=Object.keys(n);if(e.length===0)return!1;const t=e[0].split("/");return!isNaN(parseInt(t[t.length-1],10))};class kn extends $e{constructor(e){if(super({}),this.containerNodes=new Set,this.name=e.name,this.name==null){const b=this.getClassName().toLowerCase();this.name=_l(b)}if(this.supportsMasking=!1,this.trainable_=!0,Array.isArray(e.inputs)?this.inputs=e.inputs.slice():this.inputs=[e.inputs],Array.isArray(e.outputs)?this.outputs=e.outputs.slice():this.outputs=[e.outputs],ys(this.inputs).length!==this.inputs.length)throw new A(`The list of inputs passed to the model is redundant. All inputs should only appear once. Found: ${this.inputs.map(b=>b.name)}`);ys(this.outputs).length!==this.outputs.length&&console.warn(`The list of outputs passed to the model is redundant. All outputs should only appear once. Found: ${this.outputs.map(b=>b.name)}`),this.inputLayers=[],this.inputLayersNodeIndices=[],this.inputLayersTensorIndices=[],this.outputLayers=[],this.outputLayersNodeIndices=[],this.outputLayersTensorIndices=[],this.layers=[],this.internalContainerRefs=[];for(const b of this.outputs){const w=b.sourceLayer,y=b.nodeIndex,C=b.tensorIndex;this.outputLayers.push(w),this.outputLayersNodeIndices.push(y),this.outputLayersTensorIndices.push(C)}for(const b of this.inputs){const w=b.sourceLayer,y=b.nodeIndex,C=b.tensorIndex;Bn(y===0,"input layer has >1 nodes"),Bn(C===0,"input layer has >1 tensors"),this.inputLayers.push(w),this.inputLayersNodeIndices.push(y),this.inputLayersTensorIndices.push(C)}this.inputNames=[],this.outputNames=[],this.feedInputShapes=[],this.feedInputNames=[],this.feedOutputNames=[];for(let b=0;b<this.inputLayers.length;b++){const w=this.inputLayers[b];if(!(w instanceof Si))throw new TypeError(`Input layers to a LayersModel must be InputLayer objects. Received inputs: ${e.inputs}. Input ${b} (0-based) originates from layer type ${w.getClassName()}.`);this.inputNames.push(w.name),this.feedInputShapes.push(w.batchInputShape),this.feedInputNames.push(w.name)}for(const b of this.outputLayers)this.outputNames.push(b.name);this.internalInputShapes=this.inputs.map(b=>b.shape),this.internalOutputShapes=this.outputs.map(b=>b.shape);const t={},s={},o={},r={},i={},a=[],l=(b,w,y,C,$,N)=>{(C==null||$==null||N==null)&&(C=b.sourceLayer,$=b.nodeIndex,N=b.tensorIndex);const T=C.inboundNodes[$];if(y.indexOf(T)!==-1)throw new an(`The tensor ${b.name} at layer "${C.name}" is part of a cycle.`);if(w.indexOf(T)!==-1)return;this.containerNodes.add(kn.nodeKey(C,$)),C.id in i||(i[C.id]=Object.keys(i).length),y.indexOf(T)===-1&&y.push(T);const S=T.inboundLayers.length;for(let v=0;v<S;v++){const I=T.inputTensors[v],R=T.inboundLayers[v],F=T.nodeIndices[v],O=T.tensorIndices[v];l(I,w,y,R,F,O)}for(w.push(T);y.indexOf(T)>=0;)y.splice(y.indexOf(T),1);a.push(T)},c=[],u=[];for(const b of this.outputs)l(b,c,u);const h=a.slice().reverse();for(const b of h){s[b.id]=b,b.id in t||(t[b.id]=0);let w=t[b.id];const y=o[b.outboundLayer.id]==null?0:o[b.outboundLayer.id];w=Math.max(w,y),o[b.outboundLayer.id]=w,r[b.outboundLayer.id]=b.outboundLayer,t[b.id]=w;for(let C=0;C<b.inboundLayers.length;C++){const $=b.inboundLayers[C],N=b.nodeIndices[C],T=$.inboundNodes[N],S=t[T.id]==null?0:t[T.id];t[T.id]=Math.max(w+1,S),s[T.id]=T}}const d={};for(const b in t){const w=t[b];w in d||(d[w]=[]),d[w].push(s[b])}const p={};for(const b in o){const w=o[b];w in p||(p[w]=[]),p[w].push(r[b])}let f=Object.keys(p).map(b=>parseInt(b,10)).sort(Dl);this.layers=[];for(const b of f){const w=p[b];w.sort((y,C)=>{const $=i[y.id],N=i[C.id];return $<N?-1:$>N?1:0});for(const y of w)y instanceof kn&&this.internalContainerRefs.push(y),this.layers.push(y)}this.layersByDepth=p,f=Object.keys(d).map(b=>parseInt(b,10)).sort(Dl);const m=this.inputs.slice(),g=[];for(const b of f)for(const w of d[b]){const y=w.outboundLayer;if(y!=null){for(const C of w.inputTensors)if(m.indexOf(C)===-1)throw new an(`Graph disconnected: cannot obtain value for tensor ${C} at layer "${y.name}". The following previous layers were accessed without issue: ${g}`);for(const C of w.outputTensors)m.push(C);g.push(y.name)}}this.nodesByDepth=d;const x=this.layers.map(b=>b.name);for(const b of x){const w=x.filter(y=>y===b).length;if(w!==1)throw new an(`The name "${b}" is used ${w} times in the model. All layer names should be unique. Layer names: `+JSON.stringify(x))}this.outboundNodes=[],this.inboundNodes=[],new Bl({outboundLayer:this,inboundLayers:[],nodeIndices:[],tensorIndices:[],inputTensors:this.inputs,outputTensors:this.outputs,inputMasks:this.inputs.map(b=>null),outputMasks:this.outputs.map(b=>null),inputShapes:this.inputs.map(b=>b.shape),outputShapes:this.outputs.map(b=>b.shape)}),this.built=!0,this._refCount=1}assertNotDisposed(){if(this._refCount===0)throw new Error(`Container '${this.name}' is already disposed.`)}dispose(){this.assertNotDisposed();const e={refCountAfterDispose:null,numDisposedVariables:0};if(--this._refCount===0){for(const t of this.layers)e.numDisposedVariables+=t.dispose().numDisposedVariables;for(const t of this.internalContainerRefs)e.numDisposedVariables+=t.dispose().numDisposedVariables}return e.refCountAfterDispose=this._refCount,e}get trainable(){return this.trainable_}set trainable(e){this.layers.forEach(t=>{t._trainableWeights.forEach(s=>s.trainable=e)}),this.trainable_=e}get trainableWeights(){if(this._trainableWeights.length>0)throw new A("Container instance unexpectedly contains _trainableWeights.The trainable weights of a Container are a union of the trainable weights of its consituent Layers. Its own _trainableWeights must remain an empty Array.");if(!this.trainable)return[];let e=[];for(const t of this.layers)e=e.concat(t.trainableWeights);return e}get nonTrainableWeights(){const e=[];for(const t of this.layers)e.push(...t.nonTrainableWeights);if(!this.trainable){const t=[];for(const s of this.layers)t.push(...s.trainableWeights);return t.concat(e)}return e}get weights(){return this.trainableWeights.concat(this.nonTrainableWeights)}loadWeights(e,t=!0){const s={};let o=0;const r=kE(e);r&&this.parseWeights(e);for(const a of this.layers)for(const[l,c]of a.weights.entries()){const u=r?`${c.name.split("/").slice(0,-1).join("/")+"/"}${l}`:c.originalName;if(s[u]!=null)throw new A(`Duplicate weight name: ${u}`);s[u]=c,o++}const i=[];for(const a in e){let l=a;if(s[a]==null){const c=a.split("/");l=c.slice(0,-2).concat([c[c.length-1]]).join("/")}if(s[l]!=null)i.push([s[l],e[a]]);else if(t)throw new A(`Provided weight data has no target variable: ${a}`);delete s[l]}if(t){const a=[];for(const l in s)a.push(l);if(a.length>0)throw new A(`${a.length} of ${o} weights are not set: ${a}`)}Id(i)}parseWeights(e){for(const t in Object.keys(e)){const s=t.split("/"),o=["vars","layer_checkpoint_dependencies"],r=s.map(i=>i.startsWith("_")?i.slice(1):i).filter(i=>!o.includes(i)).join("/");r!==t&&(e[r]=e[t],delete e[t])}}updatedConfig(){const e=this.getConfig(),t={};return t.className=this.getClassName(),t.config=e,t.kerasVersion=`tfjs-layers ${bx}`,t.backend="TensorFlow.js",t}toJSON(e,t=!0){const s=Td(this.updatedConfig());return t?JSON.stringify(s):s}call(e,t){return B(()=>{e=Ae(e);const s=new Is;for(let o=0;o<this.inputs.length;++o)s.add(this.inputs[o],e[o]);return Ni(this.outputs,s,t)})}computeMask(e,t){return B(()=>{e=Ae(e);let s;return t==null?s=no(null,e.length):s=Ae(t),this.runInternalGraph(e,s)[1]})}computeOutputShape(e){const t=Ml(e);if(t.length!==this.inputLayers.length)throw new A(`Invalid inputShape argument ${e}: model has ${this.inputLayers.length} tensor inputs.`);const s={};for(let a=0;a<t.length;a++){const l=this.inputLayers[a],c=t[a],u=l.name+"_0_0";s[u]=c}const o=Object.keys(this.nodesByDepth).map(a=>parseInt(a,10)).sort(Dl);if(o.length>1)for(const a of o){const l=this.nodesByDepth[a];for(const c of l){const u=c.outboundLayer;if(this.inputLayers.map(m=>m.id).indexOf(u.id)!==-1)continue;const h=[];for(let m=0;m<c.inboundLayers.length;m++){const g=c.inboundLayers[m],x=c.nodeIndices[m],b=c.tensorIndices[m],w=`${g.name}_${x}_${b}`,y=s[w];h.push(y)}const d=u.computeOutputShape(Wt(h)),p=Ml(d),f=u.inboundNodes.indexOf(c);for(let m=0;m<p.length;m++){const g=`${u.name}_${f}_${m}`;s[g]=p[m]}}}const r=[],i=[];for(let a=0;a<this.outputLayers.length;a++){const l=this.outputLayers[a],c=this.outputLayersNodeIndices[a],u=this.outputLayersTensorIndices[a],h=`${l.name}_${c}_${u}`;i.push(h)}for(let a=0;a<i.length;a++){const l=i[a];Bn(l in s),r.push(s[l])}return Wt(r)}runInternalGraph(e,t){t==null&&(t=no(null,e.length));const s={};for(let l=0;l<this.inputs.length;++l){const c=this.inputs[l],u=e[l],h=t[l];s[c.id]=[u,h]}const o=Object.keys(this.nodesByDepth).map(l=>parseInt(l,10)).sort(Dl);for(const l of o){const c=this.nodesByDepth[l];for(const u of c){const h=u.outboundLayer,d=u.inputTensors,p=u.outputTensors,f=new Array;for(const m of d)m.id in s&&f.push(s[m.id]);if(f.length===d.length){let m={},g,x,b,w;if(u.callArgs!=null&&(m=u.callArgs),f.length===1){const[y,C]=f[0];m.mask==null&&(m.mask=C),b=Ae(h.call(y,m)),w=Ae(h.computeMask(y,C)),g=[y],x=[C]}else g=f.map(y=>y[0]),x=f.map(y=>y[1]),m.mask==null&&(m.mask=x),b=Ae(h.call(g,m)),w=Ae(h.computeMask(g,x));if(h.activityRegularizer)throw new be("LayersModel invocation with concrete Tensor value(s) in the presence of activity regularizer(s) is not supported yet.");for(let y=0;y<p.length;++y){const C=p[y],$=b[y],N=w[y];s[C.id]=[$,N]}}}}const r=[],i=[],a=[];for(const l of this.outputs){Bn(l.id in s,`Could not compute output ${l.name} : ${l.id}`);const[c,u]=s[l.id];a.push(c.shape),r.push(c),i.push(u)}return[r,i,a]}buildNodeConversionMap(e){const t={};let s;for(const o of this.layers){s=o instanceof kn?1:0;for(let r=0;r<o.inboundNodes.length;r++){const i=kn.nodeKey(o,r);this.containerNodes.has(i)&&(t[i]=s,s+=1)}}return t}getLayer(e,t){if(t!=null)return this.findLayer(t);if(e==null)throw new A("Provide either a layer name or layer index");if(typeof e=="number")return this.findLayer(e);for(const s of this.layers)if(s.name===e)return s;throw new A(`No such layer: ${e}`)}findLayer(e){if(this.layers.length<=e)throw new A(`Was asked to retrieve layer at index ${e}, but model only has ${this.layers.length} layer(s).`);return this.layers[e]}calculateLosses(){return B(()=>{const e=[];for(const t of this.layers)for(let s=0;s<t.inboundNodes.length;++s){const o=kn.nodeKey(t,s);this.containerNodes.has(o)&&e.push(...t.calculateLosses())}return e})}getConfig(){const e={name:this.name},t=this.buildNodeConversionMap(this.layers),s=[];for(const i of this.layers){const a=i.getClassName(),l=i.getConfig(),c=[];for(let h=0;h<i.inboundNodes.length;h++){const d=i.inboundNodes[h],p=kn.nodeKey(i,h);let f={};if(this.containerNodes.has(p)){if(d.callArgs)try{JSON.stringify(d.callArgs),f=d.callArgs}catch(m){console.warn(`Layer ${i.name} was passed non-serializable keyword arguments: ${d.callArgs}. They will not be included in the serialized model (and thus will be missing at deserialization time).`),f={}}if(d.inboundLayers.length>0){const m=[];for(let g=0;g<d.inboundLayers.length;g++){const x=d.inboundLayers[g],b=d.nodeIndices[g],w=d.tensorIndices[g],y=kn.nodeKey(x,b);let C=t[y];C==null&&(C=0),m.push([x.name,C,w,f])}c.push(m)}}}const u={};u.name=i.name,u.className=a,u.config=l,u.inboundNodes=c,s.push(u)}e.layers=s;const o=[];for(let i=0;i<this.inputLayers.length;i++){const a=this.inputLayers[i],l=this.inputLayersNodeIndices[i],c=kn.nodeKey(a,l);if(!this.containerNodes.has(c))continue;let u=t[c];u==null&&(u=0);const h=this.inputLayersTensorIndices[i];o.push([a.name,u,h])}e.inputLayers=o;const r=[];for(let i=0;i<this.outputLayers.length;i++){const a=this.outputLayers[i],l=this.outputLayersNodeIndices[i],c=kn.nodeKey(a,l);if(!this.containerNodes.has(c))continue;let u=t[c];u==null&&(u=0);const h=this.outputLayersTensorIndices[i];r.push([a.name,u,h])}return e.outputLayers=r,e}static fromConfig(e,t,s={},o=!1){const r={},i={};function a(g,x){g.name in i?i[g.name].push(x):i[g.name]=[x]}function l(g,x){const b=[];let w;for(const y of x){const C=y[0],$=y[1],N=y[2];if(w=y[3]==null?{}:y[3],!(C in r)){a(g,x);return}const T=r[C];if(T.inboundNodes.length<=$){a(g,x);return}const S=T.inboundNodes[$];b.push(S.outputTensors[N])}b.length>0&&g.apply(Wt(b),w)}function c(g){const x=g.name,b=Un(g,t.customObjects!=null?t.customObjects:{});b.setFastWeightInitDuringBuild(o),r[x]=b,g.inboundNodes.forEach(y=>{if(!(y instanceof Array))throw new A(`Corrupted configuration, expected array for nodeData: ${y}`);a(b,y)})}const u=t.name,h=t.layers;for(const g of h)c(g);for(;!cT(i);)for(const g of h){const x=r[g.name];if(x.name in i){const b=i[x.name];delete i[x.name];for(const w of b)l(x,w)}}const d=[],p=[],f=t.inputLayers;for(const g of f){const x=g[0],b=g[1],w=g[2];Bn(x in r);const C=r[x].inboundNodes[b].outputTensors;d.push(C[w])}const m=t.outputLayers;for(const g of m){const x=g[0],b=g[1],w=g[2];Bn(x in r);const C=r[x].inboundNodes[b].outputTensors;p.push(C[w])}return new e({inputs:d,outputs:p,name:u})}get stateful(){if(this._stateful)throw new A("Container instance unexpectedly has _stateful = true. The statefulness of a Container is determined by the Layers it contains. Its _stateful property must remain the default false.");for(const e of this.layers)if(e.stateful)return!0;return!1}resetStates(){B(()=>{this.layers.forEach(e=>{e.stateful&&e.resetStates()})})}}function vE(n,e,t){const s=e.length;if(n==null||Array.isArray(n)&&n.length===0)return e.map(o=>null);if(s===1)return Array.isArray(n)&&n.length===1?n:typeof n=="object"&&e[0]in n?[n[e[0]]]:[n];if(Array.isArray(n)){if(n.length!==s)throw new Error(`Provided ${t} is an array of ${n.length} element(s), but the model has ${s} outputs. Make sure a set of weights is provided for each model output.`);return n}else if(typeof n=="object"&&Object.keys(n).length>0&&typeof n[Object.keys(n)[0]]=="object"){const o=[];return e.forEach(r=>{r in n?o.push(n[r]):o.push(null)}),o}else throw new Error(`The model has multiple (${s}) outputs, so ${t} must be either an array with ${s} elements or an object with ${e} keys. Provided ${t} not understood: ${JSON.stringify(n)}`)}function yx(n,e){return vE(n,e,"classWeight")}function wx(n,e,t,s){return Y(this,null,function*(){if(t!=null){const o=B(()=>{if(n.shape.length===1)return Hs(n);if(n.shape.length===2){if(n.shape[1]>1)return qs(n,1);if(n.shape[1]===1)return M(n,[n.shape[0]]);throw new Error(`Encountered unexpected last-dimension size (${n.shape[1]}) during handling of class weights. The size is expected to be >= 1.`)}else throw new Error(`Unexpected rank of target (y) tensor (${n.rank}) during handling of class weights. The rank is expected to be 1 or 2.`)}),r=Array.from(yield o.data());ge(o);const i=[];return r.forEach(a=>{if(t[a]==null)throw new Error(`classWeight must contain all classes in the training data. The class ${a} exists in the data but not in classWeight`);i.push(t[a])}),qt(i,"float32")}else return null})}function SE(n,e){return D(n,e)}const NE=32;function Cx(n,e){let t,s;const o=e;t=o.xs,s=o.ys,k(t!=null&&s!=null,()=>`A Dataset iterator for fitDataset() is expected to generate objects of the form \`{xs: xVal, ys: yVal}\`, where the two values may be \`tf.Tensor\`, an array of Tensors, or a map of string to Tensor.  The provided Dataset instead generates ${e}`);const r=Ix("input",n.inputNames,t),i=Ix("output",n.outputNames,s),a=r[0].shape[0];k(r.length===n.inputs.length,()=>`LayersModel has ${n.inputs.length} inputs, but the dataset provides ${r.length} inputs.  (Expected input keys: ${JSON.stringify(n.inputNames)})`),k(i.length===n.outputs.length,()=>`LayersModel has ${n.outputs.length} outputs, but the dataset provides ${i.length} outputs.  (Expected output keys: ${JSON.stringify(n.outputNames)})`);for(let l=0;l<r.length;l++)k(r[l].shape[0]===a,()=>`Batch size mismatch: input ${n.inputNames[l]} has ${r[l].shape[0]}; expected  ${a} based on input ${n.inputNames[0]}.`);for(let l=0;l<i.length;l++)k(i[l].shape[0]===a,()=>`Batch size mismatch: output ${n.outputNames[l]} has ${i[l].shape[0]}; expected  ${a} based on input ${n.inputNames[0]}.`);return{xs:r,ys:i}}function Ix(n,e,t){if(t instanceof at)return[t];if(Array.isArray(t))return k(t.length===e.length,()=>`Received an array of ${t.length} Tensors, but expected ${e.length} to match the ${n} keys ${e}.`),t;{const s=[];for(const o of e){if(t[o]==null)throw new A(`The feature data generated by the dataset lacks the required ${n} key '${o}'.`);s.push(t[o])}return s}}function TE(n){if(n.length===3)throw new be("Validation with sample weights is not implemented yet.");return{xs:n[0],ys:n[1]}}function EE(n,e,t){return Y(this,null,function*(){const s=t.batchesPerEpoch!=null;if(k(n.optimizer!=null,()=>"You must compile a model before training/testing. Use LayersModel.compile(modelCompileConfig)."),k(t!=null,()=>"For fitDataset(), the 2nd argument (config) is required, but it is not provided in this call."),k(t.epochs!=null&&t.epochs>0&&Number.isInteger(t.epochs),()=>`For fitDataset(), config.epochs is expected to be a positive integer, but got ${t.epochs}`),k(!s||t.batchesPerEpoch>0&&Number.isInteger(t.batchesPerEpoch),()=>`For fitDataset(), config.batchesPerEpoch is expected to be a positive integer if specified, but got ${t.batchesPerEpoch}`),k(t.validationSplit==null,()=>"`validationSplit` is not supported by `fitDataset()`. Use validationData instead."),n.isTraining)throw new Error("Cannot start training because another fit() call is ongoing.");n.isTraining=!0;try{const o=t.validationData!=null;let r,i;if(o)if($x(t.validationData))k(t.validationBatches==null||t.validationBatches>0&&Number.isInteger(t.validationBatches),()=>`For fitDataset() with dataset-based validation, config.validationBatches is expected not to be provided, or to be a positive integer, but got ${t.validationBatches}`);else{const g=TE(t.validationData);r=g.xs,i=g.ys}const a=n.makeTrainFunction(),l=n.getDedupedMetricsNames();let c;o?c=l.slice().concat(l.map(g=>"val_"+g)):c=l.slice();const u=lx(t.callbacks,t.yieldEvery),h=t.verbose==null?1:t.verbose,{callbackList:d,history:p}=cx(u,h,t.epochs,null,null,RE(e,t),null,o,c);d.setModel(n),n.history=p,yield d.onTrainBegin(),n.stopTraining_=!1;let f=t.initialEpoch==null?0:t.initialEpoch,m=yield e.iterator();for(;f<t.epochs;){const g={};yield d.onEpochBegin(f);let x=0,b=0;for(s||(m=yield e.iterator());!s||x<t.batchesPerEpoch;){const w=yield m.next();if(s&&w.done){console.warn(`You provided \`batchesPerEpoch\` as ${t.batchesPerEpoch}, but your dataset iterator ran out of data after ${x} batches; interrupting training. Make sure that your dataset can generate at least \`batchesPerEpoch * epochs\` batches (in this case, ${t.batchesPerEpoch*t.epochs} batches). You may need to use the repeat() function when building your dataset.`);break}if(w.value!=null){const{xs:y,ys:C}=Cx(n,w.value),$={};$.batch=b,$.size=y[0].shape[0],yield d.onBatchBegin(b,$);const N=[];if(t.classWeight!=null){const v=yx(t.classWeight,n.outputNames);for(let I=0;I<v.length;++I)N.push(yield wx(C[I],null,v[I]))}const T=y.concat(C).concat(N),S=a(T);ge(T);for(let v=0;v<l.length;++v){const I=l[v],R=S[v];$[I]=R,An(R)}yield d.onBatchEnd(b,$),ix($),b++,x++}if(s?x>=t.batchesPerEpoch:w.done){if(o){let y;$x(t.validationData)?y=Ae(yield n.evaluateDataset(t.validationData,{batches:t.validationBatches})):y=Ae(n.evaluate(r,i,{batchSize:t.validationBatchSize==null?NE:t.validationBatchSize,verbose:0}));for(let C=0;C<n.metricsNames.length;++C)g[`val_${n.metricsNames[C]}`]=y[C]}break}if(n.stopTraining_)break}if(yield d.onEpochEnd(f,g),f++,n.stopTraining_)break}return yield d.onTrainEnd(),yield n.history.syncData(),n.history}finally{n.isTraining=!1}})}function RE(n,e){let t=null;return e.batchesPerEpoch!=null?t=e.batchesPerEpoch:Number.isFinite(n.size)&&(t=n.size),t}function $x(n){return typeof n.iterator=="function"}function AE(n){return typeof n.next=="function"}function DE(n,e,t){return Y(this,null,function*(){t=t||{};const s=t.batches!=null,o=n.testFunction;let r=[];if(t.verbose>0)throw new be("Verbose mode is not implemented yet.");k(!s||t.batches>0&&Number.isInteger(t.batches),()=>`Test loop expects \`batches\` to be a positive integer, but received ${JSON.stringify(t.batches)}`);const i=AE(e)?e:yield e.iterator();let a=0,l=0;for(;!s||l<t.batches;){const c=yield i.next();if(r=B(()=>{if(c.value){const{xs:u,ys:h}=Cx(n,c.value),d=u.concat(h),p=B(()=>o(d));if(ge(d),l===0)for(let m=0;m<p.length;++m)r.push(Re(0));const f=d[0].shape[0];for(let m=0;m<p.length;++m){const g=p[m],x=r[m];r[m]=B(()=>ee(r[m],D(f,g))),l>0&&ge(x)}ge(p),a+=f,++l}return r}),c.done){s&&console.warn(`Your dataset iterator ran out of data during evaluateDataset(). Interrupting evalution. Make sure that your dataset can generate at least \`batches\` batches (in this case, ${t.batches} batches). You may need to use the repeat() function when building your dataset.`);break}}for(let c=0;c<r.length;++c){const u=r[c];r[c]=he(r[c],a),ge(u)}return Wt(r)})}function Ed(n){k(n>0&&Number.isInteger(n),()=>`batchSize is required to be a positive integer, but got ${n}`)}function Ai(n,e,t){return n==null?[null]:Array.isArray(n)?n.map(s=>io(s,e,t-e)):io(n,e,t-e)}function Rd(n,e){return B(()=>n==null?null:Array.isArray(n)?n.map(t=>Rd(t,e)):zg(n,e.dtype==="int32"?e:oe(e,"int32")))}function Ad(n,e){const t=[];let s=0,o=null;for(;s<n;)o=s+e,o>=n&&(o=n),t.push([s,o]),s=o;return t}function kx(n){const e=[];n instanceof at&&(n=[n]);for(let t=0;t<n.length;++t){const s=n[t];if(s.rank===1)e.push($i(s,1));else{if(s.rank===0)throw new Error("Expected tensor to be at least 1D, but received a 0D tensor (scalar).");e.push(s)}}return e}function vn(n,e){if(n==null)return;const t=[];if(e instanceof at)t.push(e.id);else if(Array.isArray(e))e.forEach(o=>t.push(o.id));else if(e!=null)for(const o in e){const r=e[o];t.push(r.id)}const s=[];if(n instanceof at)t.indexOf(n.id)===-1&&s.push(n);else if(Array.isArray(n))n.forEach(o=>{t.indexOf(o.id)===-1&&s.push(o)});else if(n!=null)for(const o in n){const r=n[o];t.indexOf(r.id)===-1&&s.push(r)}s.forEach(o=>{o.isDisposed||o.dispose()})}function FE(n){return n instanceof at}function Dd(n){return Array.isArray(n)}function vx(n){return!FE(n)&&!Dd(n)}function Sx(n,e,t,s=!0,o=""){if(e==null||e.length===0){if(n!=null){let i=!1;if(Dd(n)&&n.length>0)i=!0;else if(vx(n)){for(const a in n)if(n.hasOwnProperty(a)){i=!0;break}}else i=!0;if(i)throw new A(`Error when checking model ${o} expected no data, but got ${n}`)}return[]}if(n==null)return e.map(i=>null);let r;if(vx(n)){n=n,r=[];for(const i of e){if(n[i]==null)throw new A(`No data provided for "${i}". Need data for each key in: ${e}`);r.push(n[i])}}else if(Dd(n)){if(n=n,n.length!==e.length)throw new A(`Error when checking model ${o}: the Array of Tensors that you are passing to your model is not the size the model expected. Expected to see ${e.length} Tensor(s), but instead got the following list of Tensor(s): ${n}`);r=n}else{if(n=n,e.length>1)throw new A(`The model ${o} expects ${e.length} Tensor(s), but only received one Tensor. Found: Tensor with shape ${n.shape}`);r=[n]}if(r=kx(r),t!=null)for(let i=0;i<e.length;++i){if(t[i]==null)continue;const a=r[i];if(a.shape.length!==t[i].length)throw new A(`Error when checking ${o}: expected ${e[i]} to have ${t[i].length} dimension(s). but got array with shape ${a.shape}`);for(let l=0;l<t[i].length;++l){if(l===0&&!s)continue;const c=a.shape[l],u=t[i][l];if(u!=null&&u>=0&&c!==u)throw new A(`${o} expected a batch of elements where each example has shape [${t[i].slice(1,t[i].length)}] (i.e.,tensor shape [*,${t[i].slice(1,t[i].length)}]) but the ${o} received an input with ${a.shape[0]} examples, each with shape [${a.shape.slice(1,a.shape.length)}] (tensor shape [${a.shape}])`)}}return r}function _E(n,e,t){const s=ys(n.map(r=>r.shape[0]));s.sort();const o=ys(e.map(r=>r.shape[0]));if(o.sort(),s.length>1)throw new A(`All input Tensors (x) should have the same number of samples. Got array shapes: ${JSON.stringify(n.map(r=>r.shape))}`);if(o.length>1)throw new A(`All target Tensors (y) should have the same number of samples. Got array shapes: ${JSON.stringify(e.map(r=>r.shape))}`);if(s.length>0&&o.length>0&&!Ee(s,o))throw new A(`Input Tensors should have the same number of samples as target Tensors. Found ${s[0]} input sample(s) and ${o[0]} target sample(s).`)}function OE(n,e,t){const s=[Ul,Hl,Ri];for(let o=0;o<n.length;++o){const r=n[o],i=e[o],a=t[o];if(i!=null){if(i===Ri&&r.shape[r.shape.length-1]===1)throw new A(`You are passing a target array of shape ${r.shape} while using a loss 'categorical_crossentropy'. 'categorical_crossentropy'expects targets to be binary matrices (1s and 0s) of shape [samples, classes].`);if(s.indexOf(i)!==-1){const l=r.shape.slice(1),c=a.slice(1);for(let u=0;u<l.length;++u){const h=l[u],d=c[u];if(d!=null&&h!==d)throw new A(`A target Tensor with shape ${r.shape} was passed for an output of shape ${a}, while using a loss function that expects targets to have the same shape as the output.`)}}}}}function Nx(n,e,t,s=!0,o=""){let r;if(Array.isArray(n)){if(n.length!==e.length)throw new A(`Error when checking model ${o}: the Array of Tensors that you are passing to your model is not the size the the model expected. Expected to see ${e.length} Tensor(s), but instead got ${n.length} Tensors(s).`);r=n}else{if(e.length>1)throw new A(`The model expects ${e.length} ${o} Tensors, but only received one Tensor. Found: array with shape ${JSON.stringify(n.shape)}.`);r=[n]}if(t!=null)for(let i=0;i<e.length;++i){if(t[i]==null)continue;const a=r[i];if(a.shape.length!==t[i].length)throw new A(`Error when checking ${o}: expected ${e[i]} to have ${t[i].length} dimension(s), but got array with shape ${JSON.stringify(a.shape)}`);for(let l=0;l<t[i].length;++l){if(l===0&&!s)continue;const c=a.shape[l],u=t[i][l];if(u!=null&&u!==c)throw new A(`Error when checking ${o}: expected ${e[i]} to have shape ${JSON.stringify(t[i])} but got array with shape ${JSON.stringify(a.shape)}.`)}}}function LE(n,e){if(n==null||Array.isArray(n)&&n.length===0)return e.map(s=>[]);let t;if(typeof n=="string"||typeof n=="function")t=[n];else if(Array.isArray(n)||typeof n=="object")t=n;else throw new TypeError(`Type of metrics argument not understood. Expected an string,function, Array, or Object, found: ${n}`);if(Array.isArray(t))return e.map(s=>t);{const s=[];for(const o of e){let r=t.hasOwnProperty(o)?t[o]:[];Array.isArray(r)||(r=[r]),s.push(r)}return s}}const ME="layers-model";class Uo extends kn{constructor(e){super(e),this.isTraining=!1}summary(e,t,s=console.log){if(!this.built)throw new A("This model has never been called, thus its weights have not been created yet. So no summary can be displayed. Build the model first (e.g., by calling it on some test data).");yE(this,e,t,s)}compile(e){if(e.loss==null&&(e.loss=[]),this.loss=e.loss,typeof e.optimizer=="string")this.optimizer_=bE(e.optimizer),this.isOptimizerOwned=!0;else{if(!(e.optimizer instanceof bs))throw new A("User-defined optimizer must be an instance of tf.Optimizer.");this.optimizer_=e.optimizer,this.isOptimizerOwned=!1}let t=[];if(!Array.isArray(e.loss)&&typeof e.loss!="string"&&typeof e.loss!="function"){e.loss=e.loss;for(const i in e.loss)if(this.outputNames.indexOf(i)===-1)throw new A(`Unknown entry in loss dictionary: "${i}". Only expected the following keys: ${this.outputNames}`);for(const i of this.outputNames)e.loss[i]==null&&console.warn(`Output "${i}" is missing from loss dictionary. We assume this was done on purpose, and we will not be expecting data to be passed to ${i} during training`),t.push(Sd(e.loss[i]))}else if(Array.isArray(e.loss)){if(e.loss.length!==this.outputs.length)throw new A(`When passing an Array as loss, it should have one entry per model output. The model has ${this.outputs.length} output(s), but you passed loss=${e.loss}.`);t=e.loss.map(a=>Sd(a))}else{const i=Sd(e.loss);this.outputs.forEach(a=>{t.push(i)})}this.lossFunctions=t,this.feedOutputNames=[],this.feedOutputShapes=[],this.feedLossFns=[];for(let i=0;i<this.outputs.length;++i){const a=this.internalOutputShapes[i],l=this.outputNames[i];this.feedOutputNames.push(l),this.feedOutputShapes.push(a),this.feedLossFns.push(this.lossFunctions[i])}const s=[];this.metrics=e.metrics,this.metricsNames=["loss"],this.metricsTensors=[],ro("loss",()=>{for(let i=0;i<this.outputs.length;++i){if(s.indexOf(i)!==-1)continue;const a=this.lossFunctions[i];this.outputs.length>1&&(this.metricsTensors.push([a,i]),this.metricsNames.push(this.outputNames[i]+"_loss"))}});const o=LE(e.metrics,this.outputNames),r=(i,a,l)=>{this.outputNames.length>1&&(a=this.outputNames[i]+"_"+a),this.metricsNames.push(a),this.metricsTensors.push([l,i])};ro("metric",()=>{for(let i=0;i<this.outputs.length;++i){if(s.indexOf(i)!==-1)continue;const a=o[i];(c=>{let h,d,p;for(const f of c){if(typeof f=="string"&&["accuracy","acc","crossentropy","ce"].indexOf(f)!==-1){const g=this.internalOutputShapes[i];g[g.length-1]===1||this.lossFunctions[i]===Hl?["accuracy","acc"].indexOf(f)!==-1?d=hx:["crossentropy","ce"].indexOf(f)!==-1&&(d=lE):this.lossFunctions[i]===Gl?["accuracy","acc"].indexOf(f)!==-1?d=cE:["crossentropy","ce"].indexOf(f)!==-1&&(d=fx):["accuracy","acc"].indexOf(f)!==-1?d=dx:["crossentropy","ce"].indexOf(f)!==-1&&(d=px);let x;["accuracy","acc"].indexOf(f)!==-1?x="acc":["crossentropy","ce"].indexOf(f)!==-1&&(x="ce"),p=d,h=""+x}else p=xE(f),h=""+Kl(f);let m;ro(h,()=>{m=p}),r(i,h,m)}})(a)}}),this.collectedTrainableWeights=this.trainableWeights}checkTrainableWeightsConsistency(){this.collectedTrainableWeights!=null&&this.trainableWeights.length!==this.collectedTrainableWeights.length&&console.warn("Discrepancy between trainableweights and collected trainable weights. Did you set `model.trainable` without calling `model.compile()` afterwards?")}evaluate(e,t,s={}){const o=s.batchSize==null?32:s.batchSize;Ed(o);const i=this.standardizeUserDataXY(e,t,!0,o);try{const a=i[0].concat(i[1]);this.makeTestFunction();const l=this.testFunction,c=this.testLoop(l,a,o,s.verbose,s.steps);return Wt(c)}finally{vn(i[0],e),vn(i[1],t)}}evaluateDataset(e,t){return Y(this,null,function*(){return this.makeTestFunction(),DE(this,e,t)})}checkNumSamples(e,t,s,o="steps"){let r;if(s!=null){if(r=null,t!=null)throw new A(`If ${o} is set, batchSize must be null or undefined.Got batchSize = ${t}`)}else if(e!=null)Array.isArray(e)?r=e[0].shape[0]:r=e.shape[0];else throw new A(`Either the input data should have a defined shape, or ${o} shoud be specified.`);return r}execute(e,t){if(Array.isArray(t)&&t.length===0)throw new A("`outputs` is an empty Array, which is not allowed.");const s=Array.isArray(t),o=s?t:[t],r=this.retrieveSymbolicTensors(o),i=new Is;if(e instanceof at&&(e=[e]),Array.isArray(e)){if(e.length!==this.inputs.length)throw new A(`The number of inputs provided (${e.length}) does not match the number of inputs of this model (${this.inputs.length}).`);for(let l=0;l<this.inputs.length;++l)i.add(this.inputs[l],e[l])}else for(const l of this.inputs){const c=e[l.name];if(c==null)throw new A(`No value is provided for the model's input ${l.name}`);i.add(l,c)}const a=Ni(r,i);return s?a:a[0]}retrieveSymbolicTensors(e){const t=no(null,e.length);let s=e.length;for(const o of this.layers){const r=Array.isArray(o.output)?o.output:[o.output],i=r.map(a=>a.name);for(let a=0;a<e.length;++a){const l=i.indexOf(e[a]);if(l!==-1&&(t[a]=r[l],s--),s===0)break}if(s===0)break}if(s>0){const o=[];throw t.forEach((r,i)=>{r==null&&o.push(e[i])}),new A(`Cannot find SymbolicTensors for output name(s): ${JSON.stringify(o)}`)}return t}predictLoop(e,t=32,s=!1){return B(()=>{const o=this.checkNumSamples(e);if(s)throw new be("Verbose predictLoop() is not implemented yet.");const r=Ad(o,t),i=this.outputs.map(a=>[]);for(let a=0;a<r.length;++a)B(()=>{const c=r[a][0],u=r[a][1],h=Ai(e,c,u),d=[];if(Array.isArray(h))for(let f=0;f<h.length;++f)d.push({key:this.inputs[f],value:h[f]});else d.push({key:this.inputs[0],value:h});const p=new Is(d);return Ni(this.outputs,p)}).forEach((c,u)=>i[u].push(c));return Wt(i.map(a=>Tt(a,0)))})}predict(e,t={}){const s=kx(e);Nx(s,this.inputNames,this.feedInputShapes,!1);try{const o=t.batchSize==null?32:t.batchSize;return Ed(o),this.predictLoop(s,o)}finally{vn(s,e)}}predictOnBatch(e){Nx(e,this.inputNames,this.feedInputShapes,!0);const t=(Array.isArray(e)?e[0]:e).shape[0];return this.predictLoop(e,t)}standardizeUserDataXY(e,t,s=!0,o){if(this.optimizer_==null)throw new an("You must compile a model before training/testing. Use LayersModel.compile(modelCompileArgs).");const r=[];for(let i=0;i<this.feedOutputShapes.length;++i){const a=this.feedOutputShapes[i];this.feedLossFns[i]===Gl?r.push(a.slice(0,a.length-1).concat([1])):r.push(a)}if(e=Sx(e,this.feedInputNames,this.feedInputShapes,!1,"input"),t=Sx(t,this.feedOutputNames,r,!1,"target"),_E(e,t),OE(t,this.feedLossFns,this.feedOutputShapes),this.stateful&&o!=null&&o>0&&e[0].shape[0]%o!==0)throw new A(`In a stateful network, you should only pass inputs with a number of samples that is divisible by the batch size ${o}. Found: ${e[0].shape[0]} sample(s).`);return[e,t]}standardizeUserData(e,t,s,o,r=!0,i){return Y(this,null,function*(){const[a,l]=this.standardizeUserDataXY(e,t,r,i);if(s!=null)throw new Error("sample weight is not supported yet.");let c=null;if(o!=null){const u=yx(o,this.outputNames);c=[];for(let h=0;h<u.length;++h)c.push(yield wx(l[h],null,u[h]))}return[a,l,c]})}testLoop(e,t,s,o=0,r){return B(()=>{const i=this.checkNumSamples(t,s,r,"steps"),a=[];if(o>0)throw new be("Verbose mode is not implemented yet.");if(r!=null)throw new be("steps mode in testLoop() is not implemented yet");{const l=Ad(i,s),c=qt(Cn(0,i));for(let u=0;u<l.length;++u){const h=l[u][0],d=l[u][1],p=io(c,h,d-h),f=Rd(t,p),m=e(f);if(u===0)for(let g=0;g<m.length;++g)a.push(Re(0));for(let g=0;g<m.length;++g){const x=m[g];a[g]=ee(a[g],D(d-h,x))}}for(let u=0;u<a.length;++u)a[u]=he(a[u],i)}return a})}getDedupedMetricsNames(){const e=this.metricsNames,t=[];for(let s=0;s<e.length;++s){const o=e[s];let r=o;if(Rg(e,o)>1){const i=Rg(e.slice(0,s),o);r+=`_${i}`}t.push(r)}return t}makeTrainFunction(){return e=>{const t=[],s=e.slice(0,this.inputs.length),o=e.slice(this.inputs.length,this.inputs.length+this.outputs.length),r=e.slice(this.inputs.length+this.outputs.length,this.inputs.length+this.outputs.length*2),i=[],a=()=>{const h=[];for(let m=0;m<this.inputs.length;++m)h.push({key:this.inputs[m],value:s[m]});const d=new Is(h),p=Ni(this.outputs,d,{training:!0});let f;for(let m=0;m<this.lossFunctions.length;++m){const g=this.lossFunctions[m];let x=g(o[m],p[m]);r[m]!=null&&(x=SE(x,r[m]));const b=it(x);t.push(b),m===0?f=x:f=ee(f,x)}for(let m=0;m<this.metricsTensors.length;++m){let g;if(this.outputs.length>1&&m<this.outputs.length)g=t[m];else{const x=this.metricsTensors[m][0],b=this.metricsTensors[m][1];g=it(x(o[b],p[b]))}An(g),i.push(g)}return f=it(f),this.calculateLosses().forEach(m=>{f=ee(f,m)}),f},l=this.collectedTrainableWeights.map(h=>h.read());return[this.optimizer_.minimize(a,!0,l)].concat(i)}}makeTestFunction(){this.testFunction=e=>B(()=>{const t=[];let s;const o=e.slice(0,this.inputs.length),r=e.slice(this.inputs.length,this.inputs.length+this.outputs.length),i=[];for(let c=0;c<this.inputs.length;++c)i.push({key:this.inputs[c],value:o[c]});const a=new Is(i),l=Ni(this.outputs,a);for(let c=0;c<this.lossFunctions.length;++c){const u=this.lossFunctions[c],h=it(u(r[c],l[c]));c===0?s=h:s=ee(s,h),t.push(s)}for(let c=0;c<this.metricsTensors.length;++c){const u=this.metricsTensors[c][0],h=this.metricsTensors[c][1],d=it(u(r[h],l[h]));t.push(d)}return t})}fit(o,r){return Y(this,arguments,function*(e,t,s={}){if(this.isTraining)throw new Error("Cannot start training because another fit() call is ongoing.");this.isTraining=!0;let i,a,l,c,u,h,d,p,f;try{const m=s.batchSize==null?32:s.batchSize;Ed(m);const x=yield this.standardizeUserData(e,t,s.sampleWeight,s.classWeight,!1,m);i=x[0],a=x[1],f=x[2];let b=!1,w;if(s.validationData!=null&&s.validationData.length>0){if(b=!0,s.validationData.length===2)u=s.validationData[0],h=s.validationData[1];else throw s.validationData.length===3?new be("validationData including sample weights is not supported yet."):new A(`When passing validation data, it must contain 2 (valX, valY) or 3 (valX, valY, valSampleWeight) items; ${s.validationData} is invalid.`);const R=yield this.standardizeUserData(u,h,null,null,!0,m);d=R[0],p=R[1],w=d.concat(p)}else if(s.validationSplit!=null&&s.validationSplit>0&&s.validationSplit<1){b=!0;const I=Math.floor(i[0].shape[0]*(1-s.validationSplit)),R=i[0].shape[0];d=Ai(i,I,R),l=i,i=Ai(i,0,I),p=Ai(a,I,R),c=a,a=Ai(a,0,I),w=d.concat(p)}else s.validationSteps!=null&&(b=!0);const y=i.concat(a).concat(f);this.checkTrainableWeightsConsistency();const C=this.makeTrainFunction(),$=this.getDedupedMetricsNames();let N,T;b?(this.makeTestFunction(),N=this.testFunction,T=$.slice().concat($.map(I=>"val_"+I))):(N=null,w=[],T=$.slice());const S=lx(s.callbacks,s.yieldEvery);return yield this.fitLoop(C,y,$,m,s.epochs,s.verbose,S,N,w,s.shuffle,T,s.initialEpoch,null,null)}finally{this.isTraining=!1,vn(i,e),vn(a,t),vn(l,e),vn(c,t),vn(d,u),vn(p,h),f!=null&&ge(f)}})}fitLoop(e,t,s,o,r,i,a,l,c,u,h,d,p,f){return Y(this,null,function*(){o==null&&(o=32),r==null&&(r=1),u==null&&(u=!0),d==null&&(d=0);let m=!1;if(l!=null&&c!=null&&(m=!0),f!=null&&(m=!0,p==null))throw new A("Can only use `validationSteps` when doing step-wise training, i.e., `stepsPerEpoch` must be set.");const g=this.checkNumSamples(t,o,p,"steps_per_epoch");let x;g!=null&&(x=Cn(0,g)),i==null&&(i=1);const{callbackList:b,history:w}=cx(a,i,r,d,g,p,o,m,h);b.setModel(this),this.history=w,yield b.onTrainBegin(),this.stopTraining_=!1;for(let y=d;y<r;++y){yield b.onEpochBegin(y);const C={};if(p!=null)throw new be("stepsPerEpoch mode is not implemented yet.");{if(u==="batch")throw new be("batch shuffling is not implemneted yet");u&&Fc(x);const $=qt(x),N=Ad(g,o);for(let T=0;T<N.length;++T){const S={};if(yield b.onBatchBegin(T,S),B(()=>{const v=N[T][0],I=N[T][1],R=io($,v,I-v);S.batch=T,S.size=I-v;const F=Rd(t,R),O=e(F);for(let L=0;L<s.length;++L){const z=s[L],U=O[L];S[z]=U,An(U)}if(T===N.length-1&&m){const L=this.testLoop(l,c,o);for(let z=0;z<s.length;++z){const U=s[z],W=L[z];An(W),C["val_"+U]=W}}}),yield b.onBatchEnd(T,S),ix(S),this.stopTraining_)break}$.dispose()}if(yield b.onEpochEnd(y,C),this.stopTraining_)break}return yield b.onTrainEnd(),yield this.history.syncData(),this.history})}fitDataset(e,t){return Y(this,null,function*(){return EE(this,e,t)})}trainOnBatch(e,t){return Y(this,null,function*(){const s=yield this.standardizeUserData(e,t),o=s[0],r=s[1],a=this.makeTrainFunction()(o.concat(r)),l=[];for(const c of a){const u=yield c.data();l.push(u[0])}return ge(a),vn(s[0],e),vn(s[1],t),Wt(l)})}getNamedWeights(e){const t=[],s=e!=null&&e.trainableOnly,o=s?this.trainableWeights:this.weights,r=this.getWeights(s);for(let i=0;i<o.length;++i)s&&!o[i].trainable||t.push({name:o[i].originalName,tensor:r[i]});return t}set stopTraining(e){this.stopTraining_=e}get stopTraining(){return this.stopTraining_}get optimizer(){return this.optimizer_}set optimizer(e){this.optimizer_!==e&&(this.optimizer_=e,this.isOptimizerOwned=!1)}dispose(){const e=super.dispose();if(e.refCountAfterDispose===0&&this.optimizer!=null&&this.isOptimizerOwned){const t=ri().numTensors;this.optimizer_.dispose(),e.numDisposedVariables+=t-ri().numTensors}return e}getLossIdentifiers(){let e;if(typeof this.loss=="string")e=ss(this.loss);else if(Array.isArray(this.loss)){for(const t of this.loss)if(typeof t!="string")throw new Error("Serialization of non-string loss is not supported.");e=this.loss.map(t=>ss(t))}else{const t=Object.keys(this.loss);e={};const s=this.loss;for(const o of t)if(typeof s[o]=="string")e[o]=ss(s[o]);else throw new Error("Serialization of non-string loss is not supported.")}return e}getMetricIdentifiers(){if(typeof this.metrics=="string"||typeof this.metrics=="function")return[ss(Kl(this.metrics))];if(Array.isArray(this.metrics))return this.metrics.map(e=>ss(Kl(e)));{const e={};for(const t in this.metrics)e[t]=ss(Kl(this.metrics[t]));return e}}getTrainingConfig(){return{loss:this.getLossIdentifiers(),metrics:this.getMetricIdentifiers(),optimizer_config:{class_name:this.optimizer.getClassName(),config:this.optimizer.getConfig()}}}loadTrainingConfig(e){if(e.weighted_metrics!=null)throw new Error("Loading weight_metrics is not supported yet.");if(e.loss_weights!=null)throw new Error("Loading loss_weights is not supported yet.");if(e.sample_weight_mode!=null)throw new Error("Loading sample_weight_mode is not supported yet.");const t=Yl(e.optimizer_config),s=Un(t);let o;if(typeof e.loss=="string")o=so(e.loss);else if(Array.isArray(e.loss))o=e.loss.map(i=>so(i));else if(e.loss!=null){o={};for(const i in e.loss)o[i]=so(e.loss[i])}let r;if(Array.isArray(e.metrics))r=e.metrics.map(i=>so(i));else if(e.metrics!=null){r={};for(const i in e.metrics)r[i]=so(e.metrics[i])}this.compile({loss:o,metrics:r,optimizer:s})}save(e,t){return Y(this,null,function*(){if(typeof e=="string"){const c=hC(e);if(c.length===0)throw new A(`Cannot find any save handlers for URL '${e}'`);if(c.length>1)throw new A(`Found more than one (${c.length}) save handlers for URL '${e}'`);e=c[0]}if(e.save==null)throw new A("LayersModel.save() cannot proceed because the IOHandler provided does not have the `save` attribute defined.");const s=yield Rf(this.getNamedWeights(t)),a={modelTopology:this.toJSON(null,!1),format:ME,generatedBy:`TensorFlow.js tfjs-layers v${bx}`,convertedBy:null};if((t==null?!1:t.includeOptimizer)&&this.optimizer!=null){a.trainingConfig=this.getTrainingConfig();const c="optimizer",{data:u,specs:h}=yield Rf(yield this.optimizer.getWeights(),c);s.specs.push(...h),s.data=sC([s.data,u])}return this.userDefinedMetadata!=null&&(gx(this.userDefinedMetadata,this.name,!0),a.userDefinedMetadata=this.userDefinedMetadata),a.weightData=s.data,a.weightSpecs=s.specs,e.save(a)})}setUserDefinedMetadata(e){gx(e,this.name),this.userDefinedMetadata=e}getUserDefinedMetadata(){return this.userDefinedMetadata}}Uo.className="Model",Q(Uo);class Tx extends Uo{}Tx.className="Functional",Q(Tx);function PE(n,e){return Y(this,null,function*(){if(e==null&&(e={}),typeof n=="string"){const t=dC(n,e);if(t.length===0)t.push(qS(n,e));else if(t.length>1)throw new A(`Found more than one (${t.length}) load handlers for URL '${n}'`);n=t[0]}return BE(n,void 0,e)})}function BE(n,e,t){return Y(this,null,function*(){if(t==null&&(t={}),n.load==null)throw new A("Cannot proceed with model loading because the IOHandler provided does not have the `load` method implemented.");const s=yield n.load();let o=s.modelTopology;o.model_config!=null&&(o=o.model_config);const r=t.strict==null?!0:t.strict,i=s.weightData!=null&&s.weightSpecs!=null&&r,a=Un(Yl(o),e,i),l=s.trainingConfig;if(l!=null&&a.loadTrainingConfig(l),s.userDefinedMetadata!=null&&a.setUserDefinedMetadata(s.userDefinedMetadata),s.weightData!=null){if(s.weightSpecs==null)throw new A("LayersModel artifacts contains weight data, but not weight specs. Therefore loading of weights cannot proceed.");const{modelWeights:c,optimizerWeights:u}=zE(s.weightData,s.weightSpecs);a.loadWeights(c,r),a.optimizer!=null&&u.length>0&&(yield a.optimizer.setWeights(u)),ge(c),ge(u.map(h=>h.tensor))}return a})}function zE(n,e){const t=Zw(n,e),s={},o=[];return e.forEach(r=>{r.group==="optimizer"?o.push({name:r.name,tensor:t[r.name]}):s[r.name]=t[r.name]}),{modelWeights:s,optimizerWeights:o}}class Di extends Uo{constructor(e){if(super({inputs:[],outputs:[]}),e=e||{},this.trainable=!0,this.built=!1,this.name=e.name!=null?e.name:_l("sequential_"),e.layers!=null)for(const t of e.layers)this.add(t)}checkShape(e){if(e.inboundNodes[0].outputTensors[0].shape.some(s=>s<0))throw new A(`Negative dimension size caused by adding layer ${e.name} with input shape [${e.inboundNodes[0].inputTensors[0].shape}]`)}add(e){const t=e instanceof Di||e instanceof Uo;let s;if(t){if(s=e,s.outputs.length!==1)throw new A("All layers in a Sequential model should have a single output tensor. For multi-output layers, use the functional API.");if(s.inputs.length!==1)throw new A("All layers in a Sequential model should have a single input tensor. For multi-input layers, use the functional API.")}if(this.outputs.length===0){if(e.inboundNodes.length===0){if(e.batchInputShape==null)throw new A("The first layer in a Sequential model must get an `inputShape` or `batchInputShape` argument.");const o=zT({batchShape:e.batchInputShape,dtype:e.dtype,name:e.name+"_input"});e.apply(o)}if(t)this.outputs=s.outputs,this.inputs=s.inputs;else{if(e.inboundNodes.length!==1)throw new A(`A layer added to a Sequential model must not already be connected somewhere else. LayersModel received layer ${e.name} which has ${e.inboundNodes.length} pre-existing inbound connections.`);if(e.inboundNodes[0].outputTensors.length!==1)throw new A("All layers in a Sequential model should have a single output tensor. For multi-output layers, use the functional API.");this.checkShape(e),this.outputs=[e.inboundNodes[0].outputTensors[0]],this.inputs=Qg(this.outputs[0])}this.inboundNodes=[],new Bl({outboundLayer:this,inboundLayers:[],nodeIndices:[],tensorIndices:[],inputTensors:this.inputs,outputTensors:this.outputs,inputMasks:no(null,this.inputs.length),outputMasks:[null],inputShapes:this.inputs.map(o=>o.shape),outputShapes:this.outputs[0].shape})}else{const o=e.apply(this.outputs[0]);if(Array.isArray(o))throw new TypeError("All layers in a Sequential model should have a single output tensor. For multi-output layers, use the functional API.");this.checkShape(e),this.outputs=[o],this.inboundNodes[0].outputTensors=this.outputs,this.inboundNodes[0].outputShapes=[this.outputs[0].shape]}this.layers.push(e),this.built=!1}pop(){if(this.layers.length===0)throw new TypeError("There are no layers in the model.");if(this.layers.pop(),this.layers.length===0)this.outputs=[],this.inboundNodes=[],this.outboundNodes=[];else{const e=this.layers.length-1;this.layers[e].outboundNodes=[],this.outputs=[this.layers[e].output],this.inboundNodes[0].outputTensors=this.outputs,this.inboundNodes[0].outputShapes=[this.outputs[0].shape]}}call(e,t){return this.model==null&&this.build(),this.model.call(e,t)}build(e){if(Ne(e),this.inputs.length===0||this.outputs.length===0)throw new TypeError("Sequential model cannot be built: model is empty. Add some layers first.");this.model=new Uo({inputs:this.inputs,outputs:this.outputs[0],name:this.name+"_model"}),this.model.trainable=this.trainable,this.supportsMasking=this.model.supportsMasking,this.inputLayers=this.model.inputLayers,this.inputLayersNodeIndices=this.model.inputLayersNodeIndices,this.inputLayersTensorIndices=this.model.inputLayersTensorIndices,this.outputLayers=this.model.outputLayers,this.outputLayersNodeIndices=this.model.outputLayersNodeIndices,this.outputLayersTensorIndices=this.model.outputLayersTensorIndices,this.nodesByDepth=this.model.nodesByDepth,this.containerNodes=this.model.containerNodes,this.outputNames=this.model.outputNames,this.inputNames=this.model.inputNames,this.built=!0}countParams(){return this.built||this.build(),super.countParams()}summary(e,t,s=console.log){this.built||this.build(),super.summary(e,t,s)}setWeights(e){this.model==null&&this.build(),this.model.setWeights(e)}evaluate(e,t,s={}){if(!this.built)throw new an("The model needs to be compiled before being used.");return this.model.evaluate(e,t,s)}evaluateDataset(e,t){return Y(this,null,function*(){if(!this.built)throw new an("The model needs to be compiled before being used.");return this.model.evaluateDataset(e,t)})}predict(e,t={}){return this.model==null&&this.build(),this.model.predict(e,t)}predictOnBatch(e){return this.model==null&&this.build(),this.model.predictOnBatch(e)}compile(e){this.build(),this.model.compile(e),this.optimizer_=this.model.optimizer,this.isOptimizerOwned=this.model.isOptimizerOwned,this.loss=this.model.loss,this.metrics=this.model.metrics,this.metricsTensors=this.model.metricsTensors,this.metricsNames=this.model.metricsNames}get optimizer(){return this.model==null?void 0:this.model.optimizer}set optimizer(e){this.model.optimizer=e}fit(o,r){return Y(this,arguments,function*(e,t,s={}){if(!this.built)throw new an("The model needs to be compiled before being used.");return this.model.fit(e,t,s)})}fitDataset(e,t){return Y(this,null,function*(){if(!this.built)throw new an("The model needs to be compiled before being used.");return this.model.fitDataset(e,t)})}trainOnBatch(e,t){return Y(this,null,function*(){return this.model.trainOnBatch(e,t)})}static fromConfig(e,t,s={},o=!1){let r,i={};if(t instanceof Array){if(t[0].className==null||t[0].className==="Merge")throw new A("Legacy serialization format not supported yet.");r=t}else k(t.layers!=null,()=>"When the config data for a Sequential model is not an Array, it must be an Object that contains the 'layers' field."),r=t.layers,delete t.layers,i=t;const a=new e(i);if(!(a instanceof Di))throw new be(`Sequential.fromConfig called on non-Sequential input: ${a}`);for(const l of r){const u=Un(l,void 0,o);o&&u.setFastWeightInitDuringBuild(!0),a.add(u)}return a}set stopTraining(e){if(this.model==null)throw new A("Cannot set the stopTraining property of a sequential model before it is compiled.");this.model.stopTraining=e}get stopTraining(){if(this.model==null)throw new A("Cannot get the stopTraining property of a sequential model before it is compiled.");return this.model.stopTraining}getConfig(){const e=[];for(const t of this.layers){const s={};s.className=t.getClassName(),s.config=t.getConfig(),e.push(s)}return{name:this.name,layers:e}}}Di.className="Sequential",Q(Di);let Rt=class extends Bo{getConfig(){return{}}};class Ex extends Rt{apply(e,t=1){return kT(e,t)}}Ex.className="elu",Q(Ex);class Rx extends Rt{apply(e){return fm(e)}}Rx.className="selu",Q(Rx);class Ax extends Rt{apply(e){return Qs(e)}}Ax.className="relu",Q(Ax);class Dx extends Rt{apply(e){return B(()=>pi(6,Qs(e)))}}Dx.className="relu6",Q(Dx);class Fx extends Rt{apply(e){return e}}Fx.className="linear",Q(Fx);class _x extends Rt{apply(e){return _o(e)}}_x.className="sigmoid",Q(_x);class Ox extends Rt{apply(e){return ST(e)}}Ox.className="hardSigmoid",Q(Ox);class Lx extends Rt{apply(e){return di(e)}}Lx.className="softplus",Q(Lx);class Mx extends Rt{apply(e){return vT(e)}}Mx.className="softsign",Q(Mx);class Px extends Rt{apply(e){return cl(e)}}Px.className="tanh",Q(Px);let Fd=class extends Rt{apply(e,t=-1){return gh(e,t)}};Fd.className="softmax",Q(Fd);class Bx extends Rt{apply(e,t=-1){return Jf(e,t)}}Bx.className="logSoftmax",Q(Bx);class zx extends Rt{apply(e){return B(()=>B(()=>{const t=Math.sqrt(2),s=D(.5,ee(1,Kf(he(e,t))));return D(e,s)}))}}zx.className="gelu",Q(zx);class Vx extends Rt{apply(e){return B(()=>D(.5,D(e,ee(1,cl(D(Et(he(2,Math.PI)),ee(e,D(.044715,Ys(e,3)))))))))}}Vx.className="gelu_new",Q(Vx);class Wx extends Rt{apply(e){return B(()=>D(e,cl(di(e))))}}Wx.className="mish",Q(Wx);class Ux extends Rt{apply(e,t=1){return B(()=>D(_o(D(e,t)),e))}}Ux.className="swish",Q(Ux);function $s(n){return n.getClassName()}function _d(n,e={}){return Ci(n,rn.getMap().classNameMap,e,"activation")}function ks(n){if(n==null){const e={};return e.className="linear",e.config={},_d(e)}if(typeof n=="string"){const e={};return e.className=n,e.config={},_d(e)}else return n instanceof Rt?n:_d(n)}function VE(n){if(n!=null&&typeof n!="object")throw new Error(`Argument to L1L2 regularizer's constructor is expected to be an object, but received: ${n}`)}class Gx extends Bo{}class Hx extends Gx{constructor(e){super(),VE(e),this.l1=e==null||e.l1==null?.01:e.l1,this.l2=e==null||e.l2==null?.01:e.l2,this.hasL1=this.l1!==0,this.hasL2=this.l2!==0}apply(e){return B(()=>{let t=nt([1]);return this.hasL1&&(t=ee(t,ue(D(this.l1,_t(e))))),this.hasL2&&(t=ee(t,ue(D(this.l2,ki(e))))),M(t,[])})}getConfig(){return{l1:this.l1,l2:this.l2}}static fromConfig(e,t){return new e({l1:t.l1,l2:t.l2})}}Hx.className="L1L2",Q(Hx);const qx={l1l2:"L1L2"};function Me(n){return rd(n)}function jx(n,e={}){return Ci(n,rn.getMap().classNameMap,e,"regularizer")}function He(n){if(n==null)return null;if(typeof n=="string"){const t={className:n in qx?qx[n]:n,config:{}};return jx(t)}else return n instanceof Gx?n:jx(n)}class Kx extends $e{constructor(e){super(e==null?{}:e),this.supportsMasking=!0,e!=null&&(this.maxValue=e.maxValue)}call(e,t){e=me(e);let s=Qs(e);return this.maxValue!=null&&(s=Zt(s,0,this.maxValue)),s}computeOutputShape(e){return e}getConfig(){const e={maxValue:this.maxValue},t=super.getConfig();return Object.assign(e,t),e}}Kx.className="ReLU",Q(Kx);class Xx extends $e{constructor(e){super(e==null?{}:e),this.DEFAULT_ALPHA=.3,e==null&&(e={}),this.alpha=e.alpha==null?this.DEFAULT_ALPHA:e.alpha}call(e,t){const s=me(e);return ih(s,this.alpha)}computeOutputShape(e){return e}getConfig(){const e={alpha:this.alpha},t=super.getConfig();return Object.assign(e,t),e}}Xx.className="LeakyReLU",Q(Xx);class Yx extends $e{constructor(e){if(super(e==null?{}:e),this.DEFAULT_ALPHA_INITIALIZER="zeros",e==null&&(e={}),this.supportsMasking=!0,this.alphaInitializer=Ge(e.alphaInitializer||this.DEFAULT_ALPHA_INITIALIZER),this.alphaRegularizer=He(e.alphaRegularizer),this.alphaConstraint=dt(e.alphaConstraint),e.sharedAxes==null)this.sharedAxes=null;else if(Array.isArray(e.sharedAxes))this.sharedAxes=e.sharedAxes;else if(typeof e.sharedAxes=="number")this.sharedAxes=[e.sharedAxes];else throw new A(`Expected sharedAxes to be a number or an array of numbers, but got ${e.sharedAxes}`)}build(e){e=Ne(e);const t=e.slice(1);if(this.sharedAxes!=null)for(const o of this.sharedAxes)t[o-1]=1;this.alpha=this.addWeight("alpha",t,"float32",this.alphaInitializer,this.alphaRegularizer,!0,this.alphaConstraint);const s={};if(this.sharedAxes!=null)for(let o=1;o<e.length;++o)s[o]=e[o];this.inputSpec=[new ut({ndim:e.length,axes:s})],this.built=!0}call(e,t){return e=me(e),hh(e,this.alpha.read())}getConfig(){const e={alphaInitializer:Ke(this.alphaInitializer),alphaRegularizer:Me(this.alphaRegularizer),alphaConstraint:ht(this.alphaConstraint),sharedAxes:this.sharedAxes},t=super.getConfig();return Object.assign(e,t),e}}Yx.className="PReLU",Q(Yx);let Zx=class extends $e{constructor(e){if(super(e==null?{}:e),this.DEFAULT_ALPHA=1,e==null&&(e={}),e.alpha!=null&&e.alpha!==this.DEFAULT_ALPHA)throw new be(`Non-default alpha value (${e.alpha}) is not supported by the ELU layer yet.`);this.alpha=e.alpha==null?this.DEFAULT_ALPHA:e.alpha}call(e,t){const s=me(e);return dl(s)}computeOutputShape(e){return e}getConfig(){const e={alpha:this.alpha},t=super.getConfig();return Object.assign(e,t),e}};Zx.className="ELU",Q(Zx);class Qx extends $e{constructor(e){super(e==null?{}:e),this.DEFAULT_THETA=1,e==null&&(e={}),this.theta=e.theta==null?this.DEFAULT_THETA:e.theta}call(e,t){const s=me(e);return D(s,oe(Ht(s,this.theta),"float32"))}computeOutputShape(e){return e}getConfig(){const e={theta:this.theta},t=super.getConfig();return Object.assign(e,t),e}}Qx.className="ThresholdedReLU",Q(Qx);class Jx extends $e{constructor(e){super(e==null?{}:e),this.DEFAULT_AXIS=1,e==null&&(e={}),this.softmax=new Fd().apply,this.axis=e.axis==null?this.DEFAULT_AXIS:e.axis}call(e,t){return B(()=>{let s=me(e);const o=t.mask;if(o!=null){const r=D(pe(Jn(s.shape),oe(o,s.dtype)),Re(-1e9));s=ee(s,r)}return this.axis instanceof Array?this.axis.length>1?_n(pe(s,em(s,this.axis,!0))):this.softmax(s,this.axis[0]):this.softmax(s,this.axis)})}computeOutputShape(e){return e}getConfig(){const e={axis:this.axis},t=super.getConfig();return Object.assign(e,t),e}}Jx.className="Softmax",Q(Jx);function Go(n,e,t){if(typeof n=="number")return no(n,e);if(n.length!==e)throw new A(`The ${t} argument must be an integer or tuple of ${e} integers. Received: ${n.length} elements.`);for(let s=0;s<e;++s){const o=n[s];if(!wT(o))throw new A(`The ${t} argument must be an integer or tuple of ${e} integers. Received: ${JSON.stringify(n)} including a non-integer number ${o}`)}return n}function Sn(n,e,t,s,o=1){if(n==null)return n;const r=e+(e-1)*(o-1);let i;return t==="same"?i=n:i=n-r+1,Math.floor((i+s-1)/s)}function Gn(n,e,t,s){if(n==null)return null;if(s==="valid")n=n*e+Cs([t-e,0]);else if(s==="same")n=n*e;else throw new A(`Unsupport padding mode: ${s}.`);return n}function Od(n,e){return B(()=>(st(e),e==="channelsFirst"?ve(n,[0,2,3,1]):n))}function eb(n,e){return B(()=>(st(e),e==="channelsFirst"?ve(n,[0,2,3,4,1]):n))}function WE(n,e,t,s=1,o="valid",r,i=1){return B(()=>{if(r==null&&(r=In()),st(r),n.shape.length!==3)throw new A(`The input of a conv1dWithBias operation should be 3, but is ${n.shape.length} instead.`);if(e.shape.length!==3)throw new A(`The kernel for a conv1dWithBias operation should be 3, but is ${e.shape.length} instead`);if(t!=null&&t.shape.length!==1)throw new A(`The bias for a conv1dWithBias operation should be 1, but is ${t.shape.length} instead`);if(r==="channelsFirst"&&(n=ve(n,[0,2,1])),o==="causal")throw new be("The support for CAUSAL padding mode in conv1dWithBias is not implemented yet.");let a=Wf(n,e,s,o==="same"?"same":"valid","NWC",i);return t!=null&&(a=$n(a,t)),a})}function tb(n,e,t,s=[1,1],o="valid",r,i,a=null){return B(()=>{if(r==null&&(r=In()),st(r),n.rank!==3&&n.rank!==4)throw new A(`conv2dWithBiasActivation expects input to be of rank 3 or 4, but received ${n.rank}.`);if(e.rank!==3&&e.rank!==4)throw new A(`conv2dWithBiasActivation expects kernel to be of rank 3 or 4, but received ${n.rank}.`);let l=Od(n,r);if(o==="causal")throw new be("The support for CAUSAL padding mode in conv1dWithBias is not implemented yet.");return l=Uv({x:l,filter:e,strides:s,pad:o==="same"?"same":"valid",dilations:i,dataFormat:"NHWC",bias:t,activation:a}),r==="channelsFirst"&&(l=ve(l,[0,3,1,2])),l})}function UE(n,e,t,s=[1,1,1],o="valid",r,i){return B(()=>{if(r==null&&(r=In()),st(r),n.rank!==4&&n.rank!==5)throw new A(`conv3dWithBias expects input to be of rank 4 or 5, but received ${n.rank}.`);if(e.rank!==4&&e.rank!==5)throw new A(`conv3dWithBias expects kernel to be of rank 4 or 5, but received ${n.rank}.`);let a=eb(n,r);if(o==="causal")throw new be("The support for CAUSAL padding mode in conv3dWithBias is not implemented yet.");return a=hl(a,e,s,o==="same"?"same":"valid","NDHWC",i),t!=null&&(a=$n(a,t)),r==="channelsFirst"&&(a=ve(a,[0,4,1,2,3])),a})}class Zl extends $e{constructor(e,t){if(super(t),this.bias=null,this.DEFAULT_KERNEL_INITIALIZER="glorotNormal",this.DEFAULT_BIAS_INITIALIZER="zeros",Zl.verifyArgs(t),this.rank=e,xt(this.rank,"rank"),this.rank!==1&&this.rank!==2&&this.rank!==3)throw new be(`Convolution layer for rank other than 1, 2, or 3 (${this.rank}) is not implemented yet.`);if(this.kernelSize=Go(t.kernelSize,e,"kernelSize"),this.strides=Go(t.strides==null?1:t.strides,e,"strides"),this.padding=t.padding==null?"valid":t.padding,Jt(this.padding),this.dataFormat=t.dataFormat==null?"channelsLast":t.dataFormat,st(this.dataFormat),this.activation=ks(t.activation),this.useBias=t.useBias==null?!0:t.useBias,this.biasInitializer=Ge(t.biasInitializer||this.DEFAULT_BIAS_INITIALIZER),this.biasConstraint=dt(t.biasConstraint),this.biasRegularizer=He(t.biasRegularizer),this.activityRegularizer=He(t.activityRegularizer),this.dilationRate=Go(t.dilationRate==null?1:t.dilationRate,e,"dilationRate"),this.rank===1&&Array.isArray(this.dilationRate)&&this.dilationRate.length!==1)throw new A(`dilationRate must be a number or an array of a single number for 1D convolution, but received ${JSON.stringify(this.dilationRate)}`);if(this.rank===2){if(typeof this.dilationRate=="number")this.dilationRate=[this.dilationRate,this.dilationRate];else if(this.dilationRate.length!==2)throw new A(`dilationRate must be a number or array of two numbers for 2D convolution, but received ${JSON.stringify(this.dilationRate)}`)}else if(this.rank===3){if(typeof this.dilationRate=="number")this.dilationRate=[this.dilationRate,this.dilationRate,this.dilationRate];else if(this.dilationRate.length!==3)throw new A(`dilationRate must be a number or array of three numbers for 3D convolution, but received ${JSON.stringify(this.dilationRate)}`)}}static verifyArgs(e){if(Bn("kernelSize"in e,"required key 'kernelSize' not in config"),typeof e.kernelSize!="number"&&!ad(e.kernelSize,"number",1,3))throw new A(`BaseConv expects config.kernelSize to be number or number[] with length 1, 2, or 3, but received ${JSON.stringify(e.kernelSize)}.`)}getConfig(){const e={kernelSize:this.kernelSize,strides:this.strides,padding:this.padding,dataFormat:this.dataFormat,dilationRate:this.dilationRate,activation:$s(this.activation),useBias:this.useBias,biasInitializer:Ke(this.biasInitializer),biasRegularizer:Me(this.biasRegularizer),activityRegularizer:Me(this.activityRegularizer),biasConstraint:ht(this.biasConstraint)},t=super.getConfig();return Object.assign(e,t),e}}class Ho extends Zl{constructor(e,t){super(e,t),this.kernel=null,Ho.verifyArgs(t),this.filters=t.filters,xt(this.filters,"filters"),this.kernelInitializer=Ge(t.kernelInitializer||this.DEFAULT_KERNEL_INITIALIZER),this.kernelConstraint=dt(t.kernelConstraint),this.kernelRegularizer=He(t.kernelRegularizer)}build(e){e=Ne(e);const t=this.dataFormat==="channelsFirst"?1:e.length-1;if(e[t]==null)throw new A(`The channel dimension of the input should be defined. Found ${e[t]}`);const s=e[t],o=this.kernelSize.concat([s,this.filters]);this.kernel=this.addWeight("kernel",o,null,this.kernelInitializer,this.kernelRegularizer,!0,this.kernelConstraint),this.useBias&&(this.bias=this.addWeight("bias",[this.filters],null,this.biasInitializer,this.biasRegularizer,!0,this.biasConstraint)),this.inputSpec=[{ndim:this.rank+2,axes:{[t]:s}}],this.built=!0}call(e,t){return B(()=>{e=me(e);let s;const o=this.bias==null?null:this.bias.read(),r=Dg(this.activation.getClassName());if(r!=null&&this.rank===2)s=tb(e,this.kernel.read(),o,this.strides,this.padding,this.dataFormat,this.dilationRate,r);else{if(this.rank===1)s=WE(e,this.kernel.read(),o,this.strides[0],this.padding,this.dataFormat,this.dilationRate[0]);else if(this.rank===2)s=tb(e,this.kernel.read(),o,this.strides,this.padding,this.dataFormat,this.dilationRate);else if(this.rank===3)s=UE(e,this.kernel.read(),o,this.strides,this.padding,this.dataFormat,this.dilationRate);else throw new be("convolutions greater than 3D are not implemented yet.");this.activation!=null&&(s=this.activation.apply(s))}return s})}computeOutputShape(e){e=Ne(e);const t=[],s=this.dataFormat==="channelsLast"?e.slice(1,e.length-1):e.slice(2);for(let r=0;r<s.length;++r){const i=Sn(s[r],this.kernelSize[r],this.padding,this.strides[r],typeof this.dilationRate=="number"?this.dilationRate:this.dilationRate[r]);t.push(i)}let o=[e[0]];return this.dataFormat==="channelsLast"?(o=o.concat(t),o.push(this.filters)):(o.push(this.filters),o=o.concat(t)),o}getConfig(){const e={filters:this.filters,kernelInitializer:Ke(this.kernelInitializer),kernelRegularizer:Me(this.kernelRegularizer),kernelConstraint:ht(this.kernelConstraint)},t=super.getConfig();return Object.assign(e,t),e}static verifyArgs(e){if(!("filters"in e)||typeof e.filters!="number"||e.filters<1)throw new A(`Convolution layer expected config.filters to be a 'number' > 0 but got ${JSON.stringify(e.filters)}`)}}class Fi extends Ho{constructor(e){super(2,e),Fi.verifyArgs(e)}getConfig(){const e=super.getConfig();return delete e.rank,e}static verifyArgs(e){if(typeof e.kernelSize!="number"&&!ad(e.kernelSize,"number",1,2))throw new A(`Conv2D expects config.kernelSize to be number or number[] with length 1 or 2, but received ${JSON.stringify(e.kernelSize)}.`)}}Fi.className="Conv2D",Q(Fi);class _i extends Ho{constructor(e){super(3,e),_i.verifyArgs(e)}getConfig(){const e=super.getConfig();return delete e.rank,e}static verifyArgs(e){if(typeof e.kernelSize!="number"&&!(Array.isArray(e.kernelSize)&&(e.kernelSize.length===1||e.kernelSize.length===3)))throw new A(`Conv3D expects config.kernelSize to be number or [number, number, number], but received ${JSON.stringify(e.kernelSize)}.`)}}_i.className="Conv3D",Q(_i);class nb extends Fi{constructor(e){if(super(e),this.inputSpec=[new ut({ndim:4})],this.padding!=="same"&&this.padding!=="valid")throw new A(`Conv2DTranspose currently supports only padding modes 'same' and 'valid', but received padding mode ${this.padding}`)}build(e){if(e=Ne(e),e.length!==4)throw new A("Input should have rank 4; Received input shape: "+JSON.stringify(e));const t=this.dataFormat==="channelsFirst"?1:e.length-1;if(e[t]==null)throw new A("The channel dimension of the inputs should be defined. Found `None`.");const s=e[t],o=this.kernelSize.concat([this.filters,s]);this.kernel=this.addWeight("kernel",o,"float32",this.kernelInitializer,this.kernelRegularizer,!0,this.kernelConstraint),this.useBias&&(this.bias=this.addWeight("bias",[this.filters],"float32",this.biasInitializer,this.biasRegularizer,!0,this.biasConstraint)),this.inputSpec=[new ut({ndim:4,axes:{[t]:s}})],this.built=!0}call(e,t){return B(()=>{let s=me(e);if(s.shape.length!==4)throw new A(`Conv2DTranspose.call() expects input tensor to be rank-4, but received a tensor of rank-${s.shape.length}`);const o=s.shape,r=o[0];let i,a;this.dataFormat==="channelsFirst"?(i=2,a=3):(i=1,a=2);const l=o[i],c=o[a],u=this.kernelSize[0],h=this.kernelSize[1],d=this.strides[0],p=this.strides[1],f=Gn(l,d,u,this.padding),m=Gn(c,p,h,this.padding),g=[r,f,m,this.filters];this.dataFormat!=="channelsLast"&&(s=ve(s,[0,2,3,1]));let x=Uf(s,this.kernel.read(),g,this.strides,this.padding);return this.dataFormat!=="channelsLast"&&(x=ve(x,[0,3,1,2])),this.bias!=null&&(x=$n(x,this.bias.read(),this.dataFormat)),this.activation!=null&&(x=this.activation.apply(x)),x})}computeOutputShape(e){e=Ne(e);const t=e.slice();let s,o,r;this.dataFormat==="channelsFirst"?(s=1,o=2,r=3):(s=3,o=1,r=2);const i=this.kernelSize[0],a=this.kernelSize[1],l=this.strides[0],c=this.strides[1];return t[s]=this.filters,t[o]=Gn(t[o],l,i,this.padding),t[r]=Gn(t[r],c,a,this.padding),t}getConfig(){const e=super.getConfig();return delete e.dilationRate,e}}nb.className="Conv2DTranspose",Q(nb);class sb extends _i{constructor(e){if(super(e),this.inputSpec=[new ut({ndim:5})],this.padding!=="same"&&this.padding!=="valid")throw new A(`Conv3DTranspose currently supports only padding modes 'same' and 'valid', but received padding mode ${this.padding}`)}build(e){if(e=Ne(e),e.length!==5)throw new A("Input should have rank 5; Received input shape: "+JSON.stringify(e));const t=this.dataFormat==="channelsFirst"?1:e.length-1;if(e[t]==null)throw new A("The channel dimension of the inputs should be defined. Found `None`.");const s=e[t],o=this.kernelSize.concat([this.filters,s]);this.kernel=this.addWeight("kernel",o,"float32",this.kernelInitializer,this.kernelRegularizer,!0,this.kernelConstraint),this.useBias&&(this.bias=this.addWeight("bias",[this.filters],"float32",this.biasInitializer,this.biasRegularizer,!0,this.biasConstraint)),this.inputSpec=[new ut({ndim:5,axes:{[t]:s}})],this.built=!0}call(e,t){return B(()=>{let s=me(e);if(s.shape.length!==5)throw new A(`Conv3DTranspose.call() expects input tensor to be rank-4, but received a tensor of rank-${s.shape.length}`);const o=s.shape,r=o[0];let i,a,l;this.dataFormat==="channelsFirst"?(l=2,i=3,a=4):(l=1,i=2,a=3);const c=o[l],u=o[i],h=o[a],d=this.kernelSize[0],p=this.kernelSize[1],f=this.kernelSize[2],m=this.strides[0],g=this.strides[1],x=this.strides[2],b=Gn(c,m,d,this.padding),w=Gn(u,g,p,this.padding),y=Gn(h,x,f,this.padding),C=[r,b,w,y,this.filters];this.dataFormat!=="channelsLast"&&(s=ve(s,[0,2,3,4,1]));let $=UI(s,this.kernel.read(),C,this.strides,this.padding);return this.dataFormat!=="channelsLast"&&($=ve($,[0,4,1,2,3])),this.bias!==null&&($=$n($,this.bias.read(),this.dataFormat)),this.activation!==null&&($=this.activation.apply($)),$})}computeOutputShape(e){e=Ne(e);const t=e.slice();let s,o,r,i;this.dataFormat==="channelsFirst"?(s=1,o=2,r=3,i=4):(s=4,o=1,r=2,i=3);const a=this.kernelSize[0],l=this.kernelSize[1],c=this.kernelSize[2],u=this.strides[0],h=this.strides[1],d=this.strides[2];return t[s]=this.filters,t[o]=Gn(t[o],u,a,this.padding),t[r]=Gn(t[r],h,l,this.padding),t[i]=Gn(t[i],d,c,this.padding),t}getConfig(){const e=super.getConfig();return delete e.dilationRate,e}}sb.className="Conv3DTranspose",Q(sb);class ob extends Ho{constructor(e,t){if(super(e,t),this.DEFAULT_DEPTHWISE_INITIALIZER="glorotUniform",this.DEFAULT_POINTWISE_INITIALIZER="glorotUniform",this.depthwiseKernel=null,this.pointwiseKernel=null,t.filters==null)throw new A("The `filters` configuration field is required by SeparableConv, but is unspecified.");if(t.kernelInitializer!=null||t.kernelRegularizer!=null||t.kernelConstraint!=null)throw new A("Fields kernelInitializer, kernelRegularizer and kernelConstraint are invalid for SeparableConv2D. Use depthwiseInitializer, depthwiseRegularizer, depthwiseConstraint, pointwiseInitializer, pointwiseRegularizer and pointwiseConstraint instead.");if(t.padding!=null&&t.padding!=="same"&&t.padding!=="valid")throw new A(`SeparableConv${this.rank}D supports only padding modes: 'same' and 'valid', but received ${JSON.stringify(t.padding)}`);this.depthMultiplier=t.depthMultiplier==null?1:t.depthMultiplier,this.depthwiseInitializer=Ge(t.depthwiseInitializer||this.DEFAULT_DEPTHWISE_INITIALIZER),this.depthwiseRegularizer=He(t.depthwiseRegularizer),this.depthwiseConstraint=dt(t.depthwiseConstraint),this.pointwiseInitializer=Ge(t.depthwiseInitializer||this.DEFAULT_POINTWISE_INITIALIZER),this.pointwiseRegularizer=He(t.pointwiseRegularizer),this.pointwiseConstraint=dt(t.pointwiseConstraint)}build(e){if(e=Ne(e),e.length<this.rank+2)throw new A(`Inputs to SeparableConv${this.rank}D should have rank ${this.rank+2}, but received input shape: ${JSON.stringify(e)}`);const t=this.dataFormat==="channelsFirst"?1:e.length-1;if(e[t]==null||e[t]<0)throw new A(`The channel dimension of the inputs should be defined, but found ${JSON.stringify(e[t])}`);const s=e[t],o=this.kernelSize.concat([s,this.depthMultiplier]),r=[];for(let a=0;a<this.rank;++a)r.push(1);r.push(s*this.depthMultiplier,this.filters);const i=!0;this.depthwiseKernel=this.addWeight("depthwise_kernel",o,"float32",this.depthwiseInitializer,this.depthwiseRegularizer,i,this.depthwiseConstraint),this.pointwiseKernel=this.addWeight("pointwise_kernel",r,"float32",this.pointwiseInitializer,this.pointwiseRegularizer,i,this.pointwiseConstraint),this.useBias?this.bias=this.addWeight("bias",[this.filters],"float32",this.biasInitializer,this.biasRegularizer,i,this.biasConstraint):this.bias=null,this.inputSpec=[new ut({ndim:this.rank+2,axes:{[t]:s}})],this.built=!0}call(e,t){return B(()=>{e=me(e);let s;if(this.rank===1)throw new be("1D separable convolution is not implemented yet.");return this.rank===2&&(this.dataFormat==="channelsFirst"&&(e=ve(e,[0,2,3,1])),s=mm(e,this.depthwiseKernel.read(),this.pointwiseKernel.read(),this.strides,this.padding,this.dilationRate,"NHWC")),this.useBias&&(s=$n(s,this.bias.read(),this.dataFormat)),this.activation!=null&&(s=this.activation.apply(s)),this.dataFormat==="channelsFirst"&&(s=ve(s,[0,3,1,2])),s})}getConfig(){const e=super.getConfig();return delete e.rank,delete e.kernelInitializer,delete e.kernelRegularizer,delete e.kernelConstraint,e.depthwiseInitializer=Ke(this.depthwiseInitializer),e.pointwiseInitializer=Ke(this.pointwiseInitializer),e.depthwiseRegularizer=Me(this.depthwiseRegularizer),e.pointwiseRegularizer=Me(this.pointwiseRegularizer),e.depthwiseConstraint=ht(this.depthwiseConstraint),e.pointwiseConstraint=ht(this.pointwiseConstraint),e}}ob.className="SeparableConv";class rb extends ob{constructor(e){super(2,e)}}rb.className="SeparableConv2D",Q(rb);class Ql extends Ho{constructor(e){super(1,e),Ql.verifyArgs(e),this.inputSpec=[{ndim:3}]}getConfig(){const e=super.getConfig();return delete e.rank,delete e.dataFormat,e}static verifyArgs(e){if(typeof e.kernelSize!="number"&&!ad(e.kernelSize,"number",1,1))throw new A(`Conv1D expects config.kernelSize to be number or number[] with length 1, but received ${JSON.stringify(e.kernelSize)}.`)}}Ql.className="Conv1D",Q(Ql);class ib extends $e{constructor(e){super(e),typeof e.cropping=="number"?this.cropping=[[e.cropping,e.cropping],[e.cropping,e.cropping]]:typeof e.cropping[0]=="number"?this.cropping=[[e.cropping[0],e.cropping[0]],[e.cropping[1],e.cropping[1]]]:this.cropping=e.cropping,this.dataFormat=e.dataFormat===void 0?"channelsLast":e.dataFormat,this.inputSpec=[{ndim:4}]}computeOutputShape(e){return this.dataFormat==="channelsFirst"?[e[0],e[1],e[2]-this.cropping[0][0]-this.cropping[0][1],e[3]-this.cropping[1][0]-this.cropping[1][1]]:[e[0],e[1]-this.cropping[0][0]-this.cropping[0][1],e[2]-this.cropping[1][0]-this.cropping[1][1],e[3]]}call(e,t){return B(()=>{if(e=me(e),this.dataFormat==="channelsLast"){const s=Ol(e,this.cropping[0][0],e.shape[1]-this.cropping[0][0]-this.cropping[0][1],2);return Ol(s,this.cropping[1][0],e.shape[2]-this.cropping[1][1]-this.cropping[1][0],3)}else{const s=Ol(e,this.cropping[0][0],e.shape[2]-this.cropping[0][0]-this.cropping[0][1],3);return Ol(s,this.cropping[1][0],e.shape[3]-this.cropping[1][1]-this.cropping[1][0],4)}})}getConfig(){const e={cropping:this.cropping,dataFormat:this.dataFormat},t=super.getConfig();return Object.assign(e,t),e}}ib.className="Cropping2D",Q(ib);class ab extends $e{constructor(e){super(e),this.DEFAULT_SIZE=[2,2],this.inputSpec=[{ndim:4}],this.size=e.size==null?this.DEFAULT_SIZE:e.size,this.dataFormat=e.dataFormat==null?"channelsLast":e.dataFormat,st(this.dataFormat),this.interpolation=e.interpolation==null?"nearest":e.interpolation,xT(this.interpolation)}computeOutputShape(e){if(this.dataFormat==="channelsFirst"){const t=e[2]==null?null:this.size[0]*e[2],s=e[3]==null?null:this.size[1]*e[3];return[e[0],e[1],t,s]}else{const t=e[1]==null?null:this.size[0]*e[1],s=e[2]==null?null:this.size[1]*e[2];return[e[0],t,s,e[3]]}}call(e,t){return B(()=>{let s=me(e);const o=s.shape;if(this.dataFormat==="channelsFirst"){s=ve(s,[0,2,3,1]);const r=this.size[0]*o[2],i=this.size[1]*o[3],a=this.interpolation==="nearest"?es.resizeNearestNeighbor(s,[r,i]):es.resizeBilinear(s,[r,i]);return ve(a,[0,3,1,2])}else{const r=this.size[0]*o[1],i=this.size[1]*o[2];return this.interpolation==="nearest"?es.resizeNearestNeighbor(s,[r,i]):es.resizeBilinear(s,[r,i])}})}getConfig(){const e={size:this.size,dataFormat:this.dataFormat,interpolation:this.interpolation},t=super.getConfig();return Object.assign(e,t),e}}ab.className="UpSampling2D",Q(ab);function GE(n,e,t=[1,1],s="valid",o,r){return B(()=>{o==null&&(o=In()),st(o);let i=Od(n,o);if(n.rank!==4)throw new A(`Input for depthwiseConv2d is required to be 4-D, but is instead ${n.rank}-D`);if(e.rank!==4)throw new A(`depthwiseKernel is required to be 4-D, but is instead ${e.rank}-D`);return i=nh(i,e,t,s==="same"?"same":"valid","NHWC",r),o==="channelsFirst"&&(i=ve(i,[0,3,1,2])),i})}class lb extends Zl{constructor(e){super(2,e),this.depthwiseKernel=null,this.depthMultiplier=e.depthMultiplier==null?1:e.depthMultiplier,this.depthwiseInitializer=Ge(e.depthwiseInitializer||this.DEFAULT_KERNEL_INITIALIZER),this.depthwiseConstraint=dt(e.depthwiseConstraint),this.depthwiseRegularizer=He(e.depthwiseRegularizer)}build(e){if(e=Ne(e),e.length<4)throw new A(`Inputs to DepthwiseConv2D should have rank 4. Received input shape: ${JSON.stringify(e)}.`);const t=this.dataFormat==="channelsFirst"?1:3;if(e[t]==null||e[t]<0)throw new A(`The channel dimension of the inputs to DepthwiseConv2D should be defined, but is not (${e[t]}).`);const s=e[t],o=[this.kernelSize[0],this.kernelSize[1],s,this.depthMultiplier];this.depthwiseKernel=this.addWeight("depthwise_kernel",o,null,this.depthwiseInitializer,this.depthwiseRegularizer,!0,this.depthwiseConstraint),this.useBias?this.bias=this.addWeight("bias",[s*this.depthMultiplier],null,this.biasInitializer,this.biasRegularizer,!0,this.biasConstraint):this.bias=null,this.built=!0}call(e,t){return B(()=>{e=me(e);let s=GE(e,this.depthwiseKernel.read(),this.strides,this.padding,this.dataFormat,null);return this.useBias&&(s=$n(s,this.bias.read(),this.dataFormat)),this.activation!=null&&(s=this.activation.apply(s)),s})}computeOutputShape(e){e=Ne(e);const t=this.dataFormat==="channelsFirst"?e[2]:e[1],s=this.dataFormat==="channelsFirst"?e[3]:e[2],o=this.dataFormat==="channelsFirst"?e[1]*this.depthMultiplier:e[3]*this.depthMultiplier,r=Sn(t,this.kernelSize[0],this.padding,this.strides[0]),i=Sn(s,this.kernelSize[1],this.padding,this.strides[1]);return this.dataFormat==="channelsFirst"?[e[0],o,r,i]:[e[0],r,i,o]}getConfig(){const e=super.getConfig();return e.depthMultiplier=this.depthMultiplier,e.depthwiseInitializer=Ke(this.depthwiseInitializer),e.depthwiseRegularizer=Me(this.depthwiseRegularizer),e.depthwiseConstraint=ht(this.depthwiseRegularizer),e}}lb.className="DepthwiseConv2D",Q(lb);function cb(n,e,t,s){if(Array.isArray(n)){if(e!=null||t!=null)throw new A("When inputs is an array, neither initialState or constants should be provided");s!=null&&(t=n.slice(n.length-s,n.length),n=n.slice(0,n.length-s)),n.length>1&&(e=n.slice(1,n.length)),n=n[0]}function o(r){return r==null||Array.isArray(r)?r:[r]}return e=o(e),t=o(t),{inputs:n,initialState:e,constants:t}}function ub(n,e,t,s=!1,o,r,i=!1,a=!1){return B(()=>{const l=e.shape.length;if(l<3)throw new A(`Input should be at least 3D, but is ${l}D.`);const c=[1,0].concat(Cn(2,l));e=ve(e,c),i&&console.warn("Backend rnn(): the unroll = true option is not applicable to the imperative deeplearn.js backend."),o!=null&&(o=oe(oe(o,"bool"),"float32"),o.rank===l-1&&(o=Vt(o,-1)),o=ve(o,c)),s&&(e=Js(e,0),o!=null&&(o=Js(o,0)));const u=[];let h,d=t;const p=e.shape[0],f=xs(e);let m;o!=null&&(m=xs(o));for(let x=0;x<p;++x){const b=f[x],w=B(()=>n(b,d));if(o==null)h=w[0],d=w[1];else{const y=B(()=>{const C=m[x],$=pe(on(C),C),N=ee(D(w[0],C),D(d[0],$)),T=d.map((S,v)=>ee(D(w[1][v],C),D(S,$)));return{output:N,newStates:T}});h=y.output,d=y.newStates}a&&u.push(h)}let g;return a&&(g=Ln(u,1)),[h,g,d]})}class vs extends $e{constructor(e){super(e);let t;if(e.cell==null)throw new A("cell property is missing for the constructor of RNN.");if(Array.isArray(e.cell)?t=new Pd({cells:e.cell}):t=e.cell,t.stateSize==null)throw new A("The RNN cell should have an attribute `stateSize` (tuple of integers, one integer per RNN state).");this.cell=t,this.returnSequences=e.returnSequences==null?!1:e.returnSequences,this.returnState=e.returnState==null?!1:e.returnState,this.goBackwards=e.goBackwards==null?!1:e.goBackwards,this._stateful=e.stateful==null?!1:e.stateful,this.unroll=e.unroll==null?!1:e.unroll,this.supportsMasking=!0,this.inputSpec=[new ut({ndim:3})],this.stateSpec=null,this.states_=null,this.numConstants=null,this.keptStates=[]}getStates(){if(this.states_==null){const e=Array.isArray(this.cell.stateSize)?this.cell.stateSize.length:1;return Cn(0,e).map(t=>null)}else return this.states_}setStates(e){this.states_=e}computeOutputShape(e){wd(e)&&(e=e[0]),e=e;let t=this.cell.stateSize;Array.isArray(t)||(t=[t]);const s=t[0];let o;if(this.returnSequences?o=[e[0],e[1],s]:o=[e[0],s],this.returnState){const r=[];for(const i of t)r.push([e[0],i]);return[o].concat(r)}else return o}computeMask(e,t){return B(()=>{Array.isArray(t)&&(t=t[0]);const s=this.returnSequences?t:null;if(this.returnState){const o=this.states.map(r=>null);return[s].concat(o)}else return s})}get states(){if(this.states_==null){const e=Array.isArray(this.cell.stateSize)?this.cell.stateSize.length:1,t=[];for(let s=0;s<e;++s)t.push(null);return t}else return this.states_}set states(e){this.states_=e}build(e){if(this.numConstants!=null)throw new be("Constants support is not implemented in RNN yet.");wd(e)&&(e=e[0]),e=e;const t=this.stateful?e[0]:null,s=e.slice(2);this.inputSpec[0]=new ut({shape:[t,null,...s]});const o=[e[0]].concat(e.slice(2));this.cell.build(o);let r;if(Array.isArray(this.cell.stateSize)?r=this.cell.stateSize:r=[this.cell.stateSize],this.stateSpec!=null){if(!Ee(this.stateSpec.map(i=>i.shape[i.shape.length-1]),r))throw new A(`An initialState was passed that is not compatible with cell.stateSize. Received stateSpec=${this.stateSpec}; However cell.stateSize is ${this.cell.stateSize}`)}else this.stateSpec=r.map(i=>new ut({shape:[null,i]}));this.stateful&&this.resetStates()}resetStates(e,t=!1){B(()=>{if(!this.stateful)throw new Pn("Cannot call resetStates() on an RNN Layer that is not stateful.");const s=this.inputSpec[0].shape[0];if(s==null)throw new A("If an RNN is stateful, it needs to know its batch size. Specify the batch size of your input tensors: \n- If using a Sequential model, specify the batch size by passing a `batchInputShape` option to your first layer.\n- If using the functional API, specify the batch size by passing a `batchShape` option to your Input layer.");if(this.states_==null)Array.isArray(this.cell.stateSize)?this.states_=this.cell.stateSize.map(o=>nt([s,o])):this.states_=[nt([s,this.cell.stateSize])];else if(e==null)ge(this.states_),this.keptStates!=null&&(ge(this.keptStates),this.keptStates=[]),Array.isArray(this.cell.stateSize)?this.states_=this.cell.stateSize.map(o=>nt([s,o])):this.states_[0]=nt([s,this.cell.stateSize]);else{if(Array.isArray(e)||(e=[e]),e.length!==this.states_.length)throw new A(`Layer ${this.name} expects ${this.states_.length} state(s), but it received ${e.length} state value(s). Input received: ${e}`);t===!0?this.keptStates.push(this.states_.slice()):ge(this.states_);for(let o=0;o<this.states_.length;++o){const r=e[o],i=Array.isArray(this.cell.stateSize)?this.cell.stateSize[o]:this.cell.stateSize,a=[s,i];if(!Ee(r.shape,a))throw new A(`State ${o} is incompatible with layer ${this.name}: expected shape=${a}, received shape=${r.shape}`);this.states_[o]=r}}this.states_=this.states_.map(o=>An(o.clone()))})}apply(e,t){let s=t==null?null:t.initialState,o=t==null?null:t.constants;t==null&&(t={});const r=cb(e,s,o,this.numConstants);e=r.inputs,s=r.initialState,o=r.constants;let i=[],a=[];if(s!=null){t.initialState=s,i=i.concat(s),this.stateSpec=[];for(const c of s)this.stateSpec.push(new ut({shape:c.shape}));a=a.concat(this.stateSpec)}if(o!=null&&(t.constants=o,i=i.concat(o),this.numConstants=o.length),i[0]instanceof Wn){const c=[e].concat(i),u=this.inputSpec.concat(a),h=this.inputSpec;this.inputSpec=u;const d=super.apply(c,t);return this.inputSpec=h,d}else return super.apply(e,t)}call(e,t){return B(()=>{const s=t==null?null:t.mask,o=t==null?null:t.training;let r=t==null?null:t.initialState;e=me(e),r==null&&(this.stateful?r=this.states_:r=this.getInitialState(e));const i=Array.isArray(this.cell.stateSize)?this.cell.stateSize.length:1;if(r.length!==i)throw new A(`RNN Layer has ${i} state(s) but was passed ${r.length} initial state(s).`);this.unroll&&console.warn("Ignoring unroll = true for RNN layer, due to imperative backend.");const a={training:o},c=ub((f,m)=>{const g=this.cell.call([f].concat(m),a);return[g[0],g.slice(1)]},e,r,this.goBackwards,s,null,this.unroll,this.returnSequences),u=c[0],h=c[1],d=c[2];this.stateful&&this.resetStates(d,o);const p=this.returnSequences?h:u;return this.returnState?[p].concat(d):p})}getInitialState(e){return B(()=>{let t=nt(e.shape);return t=ue(t,[1,2]),t=$i(t),Array.isArray(this.cell.stateSize)?this.cell.stateSize.map(s=>s>1?hd(t,[1,s]):t):this.cell.stateSize>1?[hd(t,[1,this.cell.stateSize])]:[t]})}get trainableWeights(){return this.trainable?this.cell.trainableWeights:[]}get nonTrainableWeights(){return this.trainable?this.cell.nonTrainableWeights:this.cell.weights}setFastWeightInitDuringBuild(e){super.setFastWeightInitDuringBuild(e),this.cell!=null&&this.cell.setFastWeightInitDuringBuild(e)}getConfig(){const e=super.getConfig(),t={returnSequences:this.returnSequences,returnState:this.returnState,goBackwards:this.goBackwards,stateful:this.stateful,unroll:this.unroll};this.numConstants!=null&&(t.numConstants=this.numConstants);const s=this.cell.getConfig();return this.getClassName()===vs.className&&(t.cell={className:this.cell.getClassName(),config:s}),Object.assign(Object.assign(Object.assign({},s),e),t)}static fromConfig(e,t,s={}){const o=t.cell,r=Un(o,s);return new e(Object.assign(t,{cell:r}))}}vs.className="RNN",Q(vs);class Jl extends $e{}class Ld extends Jl{constructor(e){super(e),this.DEFAULT_ACTIVATION="tanh",this.DEFAULT_KERNEL_INITIALIZER="glorotNormal",this.DEFAULT_RECURRENT_INITIALIZER="orthogonal",this.DEFAULT_BIAS_INITIALIZER="zeros",this.units=e.units,xt(this.units,"units"),this.activation=ks(e.activation==null?this.DEFAULT_ACTIVATION:e.activation),this.useBias=e.useBias==null?!0:e.useBias,this.kernelInitializer=Ge(e.kernelInitializer||this.DEFAULT_KERNEL_INITIALIZER),this.recurrentInitializer=Ge(e.recurrentInitializer||this.DEFAULT_RECURRENT_INITIALIZER),this.biasInitializer=Ge(e.biasInitializer||this.DEFAULT_BIAS_INITIALIZER),this.kernelRegularizer=He(e.kernelRegularizer),this.recurrentRegularizer=He(e.recurrentRegularizer),this.biasRegularizer=He(e.biasRegularizer),this.kernelConstraint=dt(e.kernelConstraint),this.recurrentConstraint=dt(e.recurrentConstraint),this.biasConstraint=dt(e.biasConstraint),this.dropout=Wo([1,Cs([0,e.dropout==null?0:e.dropout])]),this.recurrentDropout=Wo([1,Cs([0,e.recurrentDropout==null?0:e.recurrentDropout])]),this.dropoutFunc=e.dropoutFunc,this.stateSize=this.units,this.dropoutMask=null,this.recurrentDropoutMask=null}build(e){e=Ne(e),this.kernel=this.addWeight("kernel",[e[e.length-1],this.units],null,this.kernelInitializer,this.kernelRegularizer,!0,this.kernelConstraint),this.recurrentKernel=this.addWeight("recurrent_kernel",[this.units,this.units],null,this.recurrentInitializer,this.recurrentRegularizer,!0,this.recurrentConstraint),this.useBias?this.bias=this.addWeight("bias",[this.units],null,this.biasInitializer,this.biasRegularizer,!0,this.biasConstraint):this.bias=null,this.built=!0}call(e,t){return B(()=>{if(e=e,e.length!==2)throw new A(`SimpleRNNCell expects 2 input Tensors, got ${e.length}.`);let s=e[1];e=e[0];const o=t.training==null?!1:t.training;0<this.dropout&&this.dropout<1&&this.dropoutMask==null&&(this.dropoutMask=Ss({ones:()=>on(e),rate:this.dropout,training:o,dropoutFunc:this.dropoutFunc})),0<this.recurrentDropout&&this.recurrentDropout<1&&this.recurrentDropoutMask==null&&(this.recurrentDropoutMask=Ss({ones:()=>on(s),rate:this.recurrentDropout,training:o,dropoutFunc:this.dropoutFunc}));let r;const i=this.dropoutMask,a=this.recurrentDropoutMask;i!=null?r=Vn(D(e,i),this.kernel.read()):r=Vn(e,this.kernel.read()),this.bias!=null&&(r=$n(r,this.bias.read())),a!=null&&(s=D(s,a));let l=ee(r,Vn(s,this.recurrentKernel.read()));return this.activation!=null&&(l=this.activation.apply(l)),[l,l]})}getConfig(){const e=super.getConfig(),t={units:this.units,activation:$s(this.activation),useBias:this.useBias,kernelInitializer:Ke(this.kernelInitializer),recurrentInitializer:Ke(this.recurrentInitializer),biasInitializer:Ke(this.biasInitializer),kernelRegularizer:Me(this.kernelRegularizer),recurrentRegularizer:Me(this.recurrentRegularizer),biasRegularizer:Me(this.biasRegularizer),activityRegularizer:Me(this.activityRegularizer),kernelConstraint:ht(this.kernelConstraint),recurrentConstraint:ht(this.recurrentConstraint),biasConstraint:ht(this.biasConstraint),dropout:this.dropout,recurrentDropout:this.recurrentDropout};return Object.assign(Object.assign({},e),t)}}Ld.className="SimpleRNNCell",Q(Ld);class hb extends vs{constructor(e){e.cell=new Ld(e),super(e)}call(e,t){return B(()=>{this.cell.dropoutMask!=null&&(ge(this.cell.dropoutMask),this.cell.dropoutMask=null),this.cell.recurrentDropoutMask!=null&&(ge(this.cell.recurrentDropoutMask),this.cell.recurrentDropoutMask=null);const s=t==null?null:t.mask,o=t==null?null:t.training,r=t==null?null:t.initialState;return super.call(e,{mask:s,training:o,initialState:r})})}static fromConfig(e,t){return new e(t)}}hb.className="SimpleRNN",Q(hb);class Md extends Jl{constructor(e){if(super(e),this.DEFAULT_ACTIVATION="tanh",this.DEFAULT_RECURRENT_ACTIVATION="hardSigmoid",this.DEFAULT_KERNEL_INITIALIZER="glorotNormal",this.DEFAULT_RECURRENT_INITIALIZER="orthogonal",this.DEFAULT_BIAS_INITIALIZER="zeros",e.resetAfter)throw new A("GRUCell does not support reset_after parameter set to true.");this.units=e.units,xt(this.units,"units"),this.activation=ks(e.activation===void 0?this.DEFAULT_ACTIVATION:e.activation),this.recurrentActivation=ks(e.recurrentActivation===void 0?this.DEFAULT_RECURRENT_ACTIVATION:e.recurrentActivation),this.useBias=e.useBias==null?!0:e.useBias,this.kernelInitializer=Ge(e.kernelInitializer||this.DEFAULT_KERNEL_INITIALIZER),this.recurrentInitializer=Ge(e.recurrentInitializer||this.DEFAULT_RECURRENT_INITIALIZER),this.biasInitializer=Ge(e.biasInitializer||this.DEFAULT_BIAS_INITIALIZER),this.kernelRegularizer=He(e.kernelRegularizer),this.recurrentRegularizer=He(e.recurrentRegularizer),this.biasRegularizer=He(e.biasRegularizer),this.kernelConstraint=dt(e.kernelConstraint),this.recurrentConstraint=dt(e.recurrentConstraint),this.biasConstraint=dt(e.biasConstraint),this.dropout=Wo([1,Cs([0,e.dropout==null?0:e.dropout])]),this.recurrentDropout=Wo([1,Cs([0,e.recurrentDropout==null?0:e.recurrentDropout])]),this.dropoutFunc=e.dropoutFunc,this.implementation=e.implementation,this.stateSize=this.units,this.dropoutMask=null,this.recurrentDropoutMask=null}build(e){e=Ne(e);const t=e[e.length-1];this.kernel=this.addWeight("kernel",[t,this.units*3],null,this.kernelInitializer,this.kernelRegularizer,!0,this.kernelConstraint),this.recurrentKernel=this.addWeight("recurrent_kernel",[this.units,this.units*3],null,this.recurrentInitializer,this.recurrentRegularizer,!0,this.recurrentConstraint),this.useBias?this.bias=this.addWeight("bias",[this.units*3],null,this.biasInitializer,this.biasRegularizer,!0,this.biasConstraint):this.bias=null,this.built=!0}call(e,t){return B(()=>{if(e=e,e.length!==2)throw new A(`GRUCell expects 2 input Tensors (inputs, h, c), got ${e.length}.`);const s=t.training==null?!1:t.training;let o=e[1];e=e[0],0<this.dropout&&this.dropout<1&&this.dropoutMask==null&&(this.dropoutMask=Ss({ones:()=>on(e),rate:this.dropout,training:s,count:3,dropoutFunc:this.dropoutFunc})),0<this.recurrentDropout&&this.recurrentDropout<1&&this.recurrentDropoutMask==null&&(this.recurrentDropoutMask=Ss({ones:()=>on(o),rate:this.recurrentDropout,training:s,count:3,dropoutFunc:this.dropoutFunc}));const r=this.dropoutMask,i=this.recurrentDropoutMask;let a,l,c;0<this.dropout&&this.dropout<1&&(e=D(e,r[0]));let u=Vn(e,this.kernel.read());this.useBias&&(u=$n(u,this.bias.read())),0<this.recurrentDropout&&this.recurrentDropout<1&&(o=D(o,i[0]));const h=this.recurrentKernel.read(),[d,p]=Qt(h,[2*this.units,this.units],h.rank-1),f=Vn(o,d),[m,g,x]=Qt(u,3,u.rank-1),[b,w]=Qt(f,2,f.rank-1);a=this.recurrentActivation.apply(ee(m,b)),l=this.recurrentActivation.apply(ee(g,w));const y=Vn(D(l,o),p);c=this.activation.apply(ee(x,y));const C=ee(D(a,o),D(ee(1,tt(a)),c));return[C,C]})}getConfig(){const e=super.getConfig(),t={units:this.units,activation:$s(this.activation),recurrentActivation:$s(this.recurrentActivation),useBias:this.useBias,kernelInitializer:Ke(this.kernelInitializer),recurrentInitializer:Ke(this.recurrentInitializer),biasInitializer:Ke(this.biasInitializer),kernelRegularizer:Me(this.kernelRegularizer),recurrentRegularizer:Me(this.recurrentRegularizer),biasRegularizer:Me(this.biasRegularizer),activityRegularizer:Me(this.activityRegularizer),kernelConstraint:ht(this.kernelConstraint),recurrentConstraint:ht(this.recurrentConstraint),biasConstraint:ht(this.biasConstraint),dropout:this.dropout,recurrentDropout:this.recurrentDropout,implementation:this.implementation,resetAfter:!1};return Object.assign(Object.assign({},e),t)}}Md.className="GRUCell",Q(Md);class db extends vs{constructor(e){e.implementation===0&&console.warn("`implementation=0` has been deprecated, and now defaults to `implementation=1`. Please update your layer call."),e.cell=new Md(e),super(e)}call(e,t){return B(()=>{this.cell.dropoutMask!=null&&(ge(this.cell.dropoutMask),this.cell.dropoutMask=null),this.cell.recurrentDropoutMask!=null&&(ge(this.cell.recurrentDropoutMask),this.cell.recurrentDropoutMask=null);const s=t==null?null:t.mask,o=t==null?null:t.training,r=t==null?null:t.initialState;return super.call(e,{mask:s,training:o,initialState:r})})}static fromConfig(e,t){return t.implmentation===0&&(t.implementation=1),new e(t)}}db.className="GRU",Q(db);class ec extends Jl{constructor(e){super(e),this.DEFAULT_ACTIVATION="tanh",this.DEFAULT_RECURRENT_ACTIVATION="hardSigmoid",this.DEFAULT_KERNEL_INITIALIZER="glorotNormal",this.DEFAULT_RECURRENT_INITIALIZER="orthogonal",this.DEFAULT_BIAS_INITIALIZER="zeros",this.units=e.units,xt(this.units,"units"),this.activation=ks(e.activation===void 0?this.DEFAULT_ACTIVATION:e.activation),this.recurrentActivation=ks(e.recurrentActivation===void 0?this.DEFAULT_RECURRENT_ACTIVATION:e.recurrentActivation),this.useBias=e.useBias==null?!0:e.useBias,this.kernelInitializer=Ge(e.kernelInitializer||this.DEFAULT_KERNEL_INITIALIZER),this.recurrentInitializer=Ge(e.recurrentInitializer||this.DEFAULT_RECURRENT_INITIALIZER),this.biasInitializer=Ge(e.biasInitializer||this.DEFAULT_BIAS_INITIALIZER),this.unitForgetBias=e.unitForgetBias,this.kernelRegularizer=He(e.kernelRegularizer),this.recurrentRegularizer=He(e.recurrentRegularizer),this.biasRegularizer=He(e.biasRegularizer),this.kernelConstraint=dt(e.kernelConstraint),this.recurrentConstraint=dt(e.recurrentConstraint),this.biasConstraint=dt(e.biasConstraint),this.dropout=Wo([1,Cs([0,e.dropout==null?0:e.dropout])]),this.recurrentDropout=Wo([1,Cs([0,e.recurrentDropout==null?0:e.recurrentDropout])]),this.dropoutFunc=e.dropoutFunc,this.implementation=e.implementation,this.stateSize=[this.units,this.units],this.dropoutMask=null,this.recurrentDropoutMask=null}build(e){var t;e=Ne(e);const s=e[e.length-1];this.kernel=this.addWeight("kernel",[s,this.units*4],null,this.kernelInitializer,this.kernelRegularizer,!0,this.kernelConstraint),this.recurrentKernel=this.addWeight("recurrent_kernel",[this.units,this.units*4],null,this.recurrentInitializer,this.recurrentRegularizer,!0,this.recurrentConstraint);let o;if(this.useBias){if(this.unitForgetBias){const r=this.biasInitializer,i=this.units;o=new(t=class extends cn{apply(l,c){const u=r.apply([i]),h=new pd().apply([i]),d=r.apply([i*2]);return Bg(Bg(u,h),d)}},t.className="CustomInit",t)}else o=this.biasInitializer;this.bias=this.addWeight("bias",[this.units*4],null,o,this.biasRegularizer,!0,this.biasConstraint)}else this.bias=null;this.built=!0}call(e,t){return B(()=>{const s=t.training==null?!1:t.training;if(e=e,e.length!==3)throw new A(`LSTMCell expects 3 input Tensors (inputs, h, c), got ${e.length}.`);let o=e[1];const r=e[2];e=e[0],0<this.dropout&&this.dropout<1&&this.dropoutMask==null&&(this.dropoutMask=Ss({ones:()=>on(e),rate:this.dropout,training:s,count:4,dropoutFunc:this.dropoutFunc})),0<this.recurrentDropout&&this.recurrentDropout<1&&this.recurrentDropoutMask==null&&(this.recurrentDropoutMask=Ss({ones:()=>on(o),rate:this.recurrentDropout,training:s,count:4,dropoutFunc:this.dropoutFunc}));const i=this.dropoutMask,a=this.recurrentDropoutMask;let l,c,u,h;0<this.dropout&&this.dropout<1&&(e=D(e,i[0]));let d=Vn(e,this.kernel.read());0<this.recurrentDropout&&this.recurrentDropout<1&&(o=D(o,a[0])),d=ee(d,Vn(o,this.recurrentKernel.read())),this.useBias&&(d=$n(d,this.bias.read()));const[p,f,m,g]=Qt(d,4,d.rank-1);l=this.recurrentActivation.apply(p),c=this.recurrentActivation.apply(f),u=ee(D(c,r),D(l,this.activation.apply(m))),h=this.recurrentActivation.apply(g);const x=D(h,this.activation.apply(u));return[x,x,u]})}getConfig(){const e=super.getConfig(),t={units:this.units,activation:$s(this.activation),recurrentActivation:$s(this.recurrentActivation),useBias:this.useBias,kernelInitializer:Ke(this.kernelInitializer),recurrentInitializer:Ke(this.recurrentInitializer),biasInitializer:Ke(this.biasInitializer),unitForgetBias:this.unitForgetBias,kernelRegularizer:Me(this.kernelRegularizer),recurrentRegularizer:Me(this.recurrentRegularizer),biasRegularizer:Me(this.biasRegularizer),activityRegularizer:Me(this.activityRegularizer),kernelConstraint:ht(this.kernelConstraint),recurrentConstraint:ht(this.recurrentConstraint),biasConstraint:ht(this.biasConstraint),dropout:this.dropout,recurrentDropout:this.recurrentDropout,implementation:this.implementation};return Object.assign(Object.assign({},e),t)}}ec.className="LSTMCell",Q(ec);class pb extends vs{constructor(e){e.implementation===0&&console.warn("`implementation=0` has been deprecated, and now defaults to `implementation=1`. Please update your layer call."),e.cell=new ec(e),super(e)}call(e,t){return B(()=>{this.cell.dropoutMask!=null&&(ge(this.cell.dropoutMask),this.cell.dropoutMask=null),this.cell.recurrentDropoutMask!=null&&(ge(this.cell.recurrentDropoutMask),this.cell.recurrentDropoutMask=null);const s=t==null?null:t.mask,o=t==null?null:t.training,r=t==null?null:t.initialState;return super.call(e,{mask:s,training:o,initialState:r})})}static fromConfig(e,t){return t.implmentation===0&&(t.implementation=1),new e(t)}}pb.className="LSTM",Q(pb);class Pd extends Jl{constructor(e){super(e),this.cells=e.cells}get stateSize(){const e=[];for(const t of this.cells.slice().reverse())Array.isArray(t.stateSize)?e.push(...t.stateSize):e.push(t.stateSize);return e}call(e,t){return B(()=>{e=e;let s=e.slice(1);const o=[];for(const a of this.cells.slice().reverse())Array.isArray(a.stateSize)?o.push(s.splice(0,a.stateSize.length)):o.push(s.splice(0,1));o.reverse();const r=[];let i;for(let a=0;a<this.cells.length;++a){const l=this.cells[a];s=o[a],a===0?i=[e[0]].concat(s):i=[i[0]].concat(s),i=l.call(i,t),r.push(i.slice(1))}s=[];for(const a of r.slice().reverse())s.push(...a);return[i[0]].concat(s)})}build(e){wd(e)&&(e=e[0]),e=e;let t;this.cells.forEach((s,o)=>{ro(`RNNCell_${o}`,()=>{s.build(e),Array.isArray(s.stateSize)?t=s.stateSize[0]:t=s.stateSize,e=[e[0],t]})}),this.built=!0}getConfig(){const e=super.getConfig(),t=r=>({className:r.getClassName(),config:r.getConfig()}),o={cells:this.cells.map(t)};return Object.assign(Object.assign({},e),o)}static fromConfig(e,t,s={}){const o=[];for(const r of t.cells)o.push(Un(r,s));return new e({cells:o})}get trainableWeights(){if(!this.trainable)return[];const e=[];for(const t of this.cells)e.push(...t.trainableWeights);return e}get nonTrainableWeights(){const e=[];for(const t of this.cells)e.push(...t.nonTrainableWeights);if(!this.trainable){const t=[];for(const s of this.cells)t.push(...s.trainableWeights);return t.concat(e)}return e}getWeights(){const e=[];for(const t of this.cells)e.push(...t.weights);return Cd(e)}setWeights(e){const t=[];for(const s of this.cells){const o=s.weights.length,r=e.splice(o);for(let i=0;i<s.weights.length;++i)t.push([s.weights[i],r[i]])}Id(t)}}Pd.className="StackedRNNCells",Q(Pd);function Ss(n){const{ones:e,rate:t,training:s=!1,count:o=1,dropoutFunc:r}=n,i=()=>r!=null?r(e(),t):Vg(e(),t),a=()=>vi(i,e,s);return!o||o<=1?An(a().clone()):Array(o).fill(void 0).map(a).map(c=>An(c.clone()))}var HE=function(n,e){var t={};for(var s in n)Object.prototype.hasOwnProperty.call(n,s)&&e.indexOf(s)<0&&(t[s]=n[s]);if(n!=null&&typeof Object.getOwnPropertySymbols=="function")for(var o=0,s=Object.getOwnPropertySymbols(n);o<s.length;o++)e.indexOf(s[o])<0&&Object.prototype.propertyIsEnumerable.call(n,s[o])&&(t[s[o]]=n[s[o]]);return t};class fb extends vs{constructor(e){if(e.unroll)throw new be("Unrolling is not possible with convolutional RNNs.");if(Array.isArray(e.cell))throw new be("It is not possible at the moment to stack convolutional cells.");super(e),this.inputSpec=[new ut({ndim:5})]}call(e,t){return B(()=>{if(this.cell.dropoutMask!=null&&(ge(this.cell.dropoutMask),this.cell.dropoutMask=null),this.cell.recurrentDropoutMask!=null&&(ge(this.cell.recurrentDropoutMask),this.cell.recurrentDropoutMask=null),t&&t.constants)throw new A("ConvRNN2D cell does not support constants");const s=t==null?null:t.mask,o=t==null?null:t.training,r=t==null?null:t.initialState;return super.call(e,{mask:s,training:o,initialState:r})})}computeOutputShape(e){let t=this.computeSingleOutputShape(e);return this.returnSequences||(t=[t[0],...t.slice(2)]),this.returnState&&(t=[t,...Array(2).fill([e[0],...t.slice(-3)])]),t}getInitialState(e){return B(()=>{const{stateSize:t}=this.cell,s=e.shape,o=this.computeSingleOutputShape(s),r=[o[0],...o.slice(2)],i=nt(r);return Array.isArray(t)?Array(t.length).fill(i):[i]})}resetStates(e,t=!1){B(()=>{if(!this.stateful)throw new Pn("Cannot call resetStates() on an RNN Layer that is not stateful.");const s=this.inputSpec[0].shape,o=this.computeSingleOutputShape(s),r=[o[0],...o.slice(2)];if(s[0]==null)throw new A("If an RNN is stateful, it needs to know its batch size. Specify the batch size of your input tensors: \n- If using a Sequential model, specify the batch size by passing a `batchInputShape` option to your first layer.\n- If using the functional API, specify the batch size by passing a `batchShape` option to your Input layer.");if(this.getStates()==null)Array.isArray(this.cell.stateSize)?this.states_=this.cell.stateSize.map(()=>nt(r)):this.states_=[nt(r)];else if(e==null)ge(this.states_),this.keptStates!=null&&(ge(this.keptStates),this.keptStates=[]),Array.isArray(this.cell.stateSize)?this.states_=this.cell.stateSize.map(()=>nt(r)):this.states_[0]=nt(r);else{if(Array.isArray(e)||(e=[e]),e.length!==this.states_.length)throw new A(`Layer ${this.name} expects ${this.states_.length} state(s), but it received ${e.length} state value(s). Input received: ${e}`);t?this.keptStates.push(this.states_.slice()):ge(this.states_);for(let a=0;a<this.states_.length;++a){const l=e[a],c=r;if(!Ee(l.shape,c))throw new A(`State ${a} is incompatible with layer ${this.name}: expected shape=${c}, received shape=${l.shape}`);this.states_[a]=l}}this.states_=this.states_.map(a=>An(a.clone()))})}computeSingleOutputShape(e){const{dataFormat:t,filters:s,kernelSize:o,padding:r,strides:i,dilationRate:a}=this.cell,l=t==="channelsFirst",c=e[l?3:2],u=e[l?4:3],h=Sn(c,o[0],r,i[0],a[0]),d=Sn(u,o[1],r,i[1],a[1]);return[...e.slice(0,2),...l?[s,h,d]:[h,d,s]]}}fb.className="ConvRNN2D";class Bd extends ec{constructor(e){const{filters:t,kernelSize:s,strides:o,padding:r,dataFormat:i,dilationRate:a}=e;super(Object.assign(Object.assign({},e),{units:t})),this.filters=t,xt(this.filters,"filters"),this.kernelSize=Go(s,2,"kernelSize"),this.kernelSize.forEach(l=>xt(l,"kernelSize")),this.strides=Go(o||1,2,"strides"),this.strides.forEach(l=>xt(l,"strides")),this.padding=r||"valid",Jt(this.padding),this.dataFormat=i||"channelsLast",st(this.dataFormat),this.dilationRate=Go(a||1,2,"dilationRate"),this.dilationRate.forEach(l=>xt(l,"dilationRate"))}build(e){var t;e=Ne(e);const s=this.dataFormat==="channelsFirst"?1:e.length-1;if(e[s]==null)throw new A(`The channel dimension of the input should be defined. Found ${e[s]}`);const o=e[s],r=4,i=this.kernelSize.concat([o,this.filters*r]);this.kernel=this.addWeight("kernel",i,null,this.kernelInitializer,this.kernelRegularizer,!0,this.kernelConstraint);const a=this.kernelSize.concat([this.filters,this.filters*r]);if(this.recurrentKernel=this.addWeight("recurrent_kernel",a,null,this.recurrentInitializer,this.recurrentRegularizer,!0,this.recurrentConstraint),this.useBias){let l;if(this.unitForgetBias){const c=this.biasInitializer,u=this.filters;l=new(t=class extends cn{apply(d,p){const f=c.apply([u]),m=Jn([u]),g=c.apply([u*2]);return ud([f,m,g])}},t.className="CustomInit",t)}else l=this.biasInitializer;this.bias=this.addWeight("bias",[this.filters*r],null,l,this.biasRegularizer,!0,this.biasConstraint)}this.built=!0}call(e,t){return B(()=>{if(e.length!==3)throw new A(`ConvLSTM2DCell expects 3 input Tensors (inputs, h, c), got ${e.length}.`);const s=t.training||!1,o=e[0],r=e[1],i=e[2],a=4;0<this.dropout&&this.dropout<1&&this.dropoutMask==null&&(this.dropoutMask=Ss({ones:()=>on(o),rate:this.dropout,training:s,count:a,dropoutFunc:this.dropoutFunc}));const l=this.dropoutMask,c=(K,Z,j)=>!Z||!Z[j]?K:D(Z[j],K);let u=c(o,l,0),h=c(o,l,1),d=c(o,l,2),p=c(o,l,3);0<this.recurrentDropout&&this.recurrentDropout<1&&this.recurrentDropoutMask==null&&(this.recurrentDropoutMask=Ss({ones:()=>on(r),rate:this.recurrentDropout,training:s,count:a,dropoutFunc:this.dropoutFunc}));const f=this.recurrentDropoutMask;let m=c(r,f,0),g=c(r,f,1),x=c(r,f,2),b=c(r,f,3);const w=3,[y,C,$,N]=Qt(this.kernel.read(),a,w),[T,S,v,I]=this.useBias?Qt(this.bias.read(),a):[null,null,null,null];u=this.inputConv(u,y,T,this.padding),h=this.inputConv(h,C,S,this.padding),d=this.inputConv(d,$,v,this.padding),p=this.inputConv(p,N,I,this.padding);const[R,F,O,L]=Qt(this.recurrentKernel.read(),a,w);m=this.recurrentConv(m,R),g=this.recurrentConv(g,F),x=this.recurrentConv(x,O),b=this.recurrentConv(b,L);const z=this.recurrentActivation.apply(ee(u,m)),U=this.recurrentActivation.apply(ee(h,g)),W=ee(D(U,i),D(z,this.activation.apply(ee(d,x)))),G=D(this.recurrentActivation.apply(ee(p,b)),this.activation.apply(W));return[G,G,W]})}getConfig(){const e=super.getConfig(),{units:t}=e,s=HE(e,["units"]),o={filters:this.filters,kernelSize:this.kernelSize,padding:this.padding,dataFormat:this.dataFormat,dilationRate:this.dilationRate,strides:this.strides};return Object.assign(Object.assign({},s),o)}inputConv(e,t,s,o){const r=Xs(e,t,this.strides,o||"valid",this.dataFormat==="channelsFirst"?"NCHW":"NHWC",this.dilationRate);return s?$n(r,s,this.dataFormat):r}recurrentConv(e,t){return Xs(e,t,1,"same",this.dataFormat==="channelsFirst"?"NCHW":"NHWC")}}Bd.className="ConvLSTM2DCell",Q(Bd);class mb extends fb{constructor(e){const t=new Bd(e);super(Object.assign(Object.assign({},e),{cell:t}))}static fromConfig(e,t){return new e(t)}}mb.className="ConvLSTM2D",Q(mb);class zd extends $e{constructor(e){super(e),this.rate=Math.max(Math.min(e.rate,1),0),this.noiseShape=e.noiseShape,this.seed=e.seed,this.supportsMasking=!0}getNoiseShape(e){if(this.noiseShape==null)return this.noiseShape;const t=e.shape,s=[];for(let o=0;o<this.noiseShape.length;++o)s.push(this.noiseShape[o]==null?t[o]:this.noiseShape[o]);return s}call(e,t){return B(()=>{this.invokeCallHook(e,t);const s=me(e);if(0<this.rate&&this.rate<1){const o=t.training==null?!1:t.training,r=this.getNoiseShape(s);return vi(()=>Vg(s,this.rate,r,this.seed),()=>s,o)}return e})}getConfig(){const e={rate:this.rate,noiseShape:this.noiseShape,seed:this.seed},t=super.getConfig();return Object.assign(e,t),e}dispose(){return super.dispose()}}zd.className="Dropout",Q(zd);class gb extends zd{constructor(e){super(e),this.inputSpec=[{ndim:3}]}getNoiseShape(e){const t=e.shape;return[t[0],1,t[2]]}}gb.className="SpatialDropout1D",Q(gb);class xb extends $e{constructor(e){if(super(e),this.activation=null,this.useBias=!0,this.kernel=null,this.bias=null,this.DEFAULT_KERNEL_INITIALIZER="glorotNormal",this.DEFAULT_BIAS_INITIALIZER="zeros",e.batchInputShape==null&&e.inputShape==null&&e.inputDim!=null){let t=null;e.batchSize!=null&&(t=e.batchSize),this.batchInputShape=[t,e.inputDim]}this.units=e.units,xt(this.units,"units"),this.activation=ks(e.activation),e.useBias!=null&&(this.useBias=e.useBias),this.kernelInitializer=Ge(e.kernelInitializer||this.DEFAULT_KERNEL_INITIALIZER),this.biasInitializer=Ge(e.biasInitializer||this.DEFAULT_BIAS_INITIALIZER),this.kernelConstraint=dt(e.kernelConstraint),this.biasConstraint=dt(e.biasConstraint),this.kernelRegularizer=He(e.kernelRegularizer),this.biasRegularizer=He(e.biasRegularizer),this.activityRegularizer=He(e.activityRegularizer),this.supportsMasking=!0,this.inputSpec=[{minNDim:2}]}build(e){e=Ne(e);const t=e[e.length-1];this.kernel==null&&(this.kernel=this.addWeight("kernel",[t,this.units],null,this.kernelInitializer,this.kernelRegularizer,!0,this.kernelConstraint),this.useBias&&(this.bias=this.addWeight("bias",[this.units],null,this.biasInitializer,this.biasRegularizer,!0,this.biasConstraint))),this.inputSpec=[{minNDim:2,axes:{[-1]:t}}],this.built=!0}computeOutputShape(e){e=Ne(e);const t=e.slice();return t[t.length-1]=this.units,t}call(e,t){return B(()=>{this.invokeCallHook(e,t);const s=me(e),o=Dg(this.activation.getClassName());let r;return o!=null?r=Vn(s,this.kernel.read(),o,this.bias?this.bias.read():null):(r=Vn(s,this.kernel.read()),this.bias!=null&&(r=$n(r,this.bias.read())),this.activation!=null&&(r=this.activation.apply(r))),r})}getConfig(){const e={units:this.units,activation:$s(this.activation),useBias:this.useBias,kernelInitializer:Ke(this.kernelInitializer),biasInitializer:Ke(this.biasInitializer),kernelRegularizer:Me(this.kernelRegularizer),biasRegularizer:Me(this.biasRegularizer),activityRegularizer:Me(this.activityRegularizer),kernelConstraint:ht(this.kernelConstraint),biasConstraint:ht(this.biasConstraint)},t=super.getConfig();return Object.assign(e,t),e}}xb.className="Dense",Q(xb);class bb extends $e{constructor(e){e=e||{},super(e),this.inputSpec=[{minNDim:3}],this.dataFormat=e.dataFormat}computeOutputShape(e){e=Ne(e);for(const t of e.slice(1))if(t==null)throw new A(`The shape of the input to "Flatten" is not fully defined (got ${e.slice(1)}). Make sure to pass a complete "input_shape" or "batch_input_shape" argument to the first layer in your model.`);return[e[0],ws(e,1)]}call(e,t){return B(()=>{this.invokeCallHook(e,t);let s=me(e);if(this.dataFormat==="channelsFirst"&&s.rank>1){const o=[0];for(let r=2;r<s.rank;++r)o.push(r);o.push(1),s=ve(s,o)}return $T(s)})}getConfig(){const e={};this.dataFormat!=null&&(e.dataFormat=this.dataFormat);const t=super.getConfig();return Object.assign(e,t),e}}bb.className="Flatten",Q(bb);class yb extends $e{constructor(e){super(e),this.supportsMasking=!0,this.activation=ks(e.activation)}call(e,t){return B(()=>{this.invokeCallHook(e,t);const s=me(e);return this.activation.apply(s)})}getConfig(){const e={activation:$s(this.activation)},t=super.getConfig();return Object.assign(e,t),e}}yb.className="Activation",Q(yb);class wb extends $e{constructor(e){super(e),this.n=e.n,this.inputSpec=[{ndim:2}]}computeOutputShape(e){return[e[0],this.n,e[1]]}call(e,t){return B(()=>(e=me(e),CT(e,this.n)))}getConfig(){const e={n:this.n},t=super.getConfig();return Object.assign(e,t),e}}wb.className="RepeatVector",Q(wb);class Cb extends $e{constructor(e){super(e),this.targetShape=e.targetShape;for(let t=0;t<this.targetShape.length;++t)this.isUnknown(this.targetShape[t])&&(this.targetShape[t]=null)}isUnknown(e){return e<0||e==null}fixUnknownDimension(e,t){const s="Total size of new array must be unchanged.",o=t.slice();let r=1,i=null;for(let l=0;l<o.length;++l){const c=o[l];if(this.isUnknown(c))if(i===null)i=l;else throw new A("Can only specifiy one unknown dimension.");else r*=c}const a=ws(e);if(i!==null){if(r===0||a%r!==0)throw new A(s);o[i]=a/r}else if(a!==r)throw new A(s);return o}computeOutputShape(e){let t=!1;for(let s=0;s<e.length;++s)if(this.isUnknown(e[s])){t=!0;break}return t?e.slice(0,1).concat(this.targetShape):e.slice(0,1).concat(this.fixUnknownDimension(e.slice(1),this.targetShape))}call(e,t){return B(()=>{this.invokeCallHook(e,t);const s=me(e),o=s.shape,r=o.slice(0,1).concat(this.fixUnknownDimension(o.slice(1),this.targetShape));return M(s,r)})}getConfig(){const e={targetShape:this.targetShape},t=super.getConfig();return Object.assign(e,t),e}}Cb.className="Reshape",Q(Cb);class Ib extends $e{constructor(e){if(super(e),e.dims==null)throw new Error("Required configuration field `dims` is missing during Permute constructor call.");if(!Array.isArray(e.dims))throw new Error(`Permute constructor requires \`dims\` to be an Array, but received ${e.dims} instead.`);const t=Cn(1,e.dims.length+1);if(!Ee(e.dims.slice().sort(),t))throw new Error("Invalid permutation `dims`: "+JSON.stringify(e.dims)+" `dims` must contain consecutive integers starting from 1.");this.dims=e.dims,this.dimsIncludingBatch=[0].concat(this.dims),this.inputSpec=[new ut({ndim:this.dims.length+1})]}computeOutputShape(e){e=Ne(e);const t=e.slice();return this.dims.forEach((s,o)=>{t[o+1]=e[s]}),t}call(e,t){return ve(me(e),this.dimsIncludingBatch)}getConfig(){const e={dims:this.dims},t=super.getConfig();return Object.assign(e,t),e}}Ib.className="Permute",Q(Ib);class $b extends $e{constructor(e){super(e==null?{}:e),this.supportsMasking=!0,e!=null?this.maskValue=e.maskValue==null?0:e.maskValue:this.maskValue=0}computeOutputShape(e){return e}getConfig(){const e=super.getConfig(),t={maskValue:this.maskValue};return Object.assign(t,e),t}computeMask(e,t){const s=me(e);return Ku(xl(s,this.maskValue),-1)}call(e,t){return B(()=>{this.invokeCallHook(e,t);const s=me(e),i=Ku(xl(s,this.maskValue),-1,!0);return D(s,oe(i,s.dtype))})}}$b.className="Masking",Q($b);class kb extends $e{constructor(e){if(super(e),this.embeddings=null,this.DEFAULT_EMBEDDINGS_INITIALIZER="randomUniform",e.batchInputShape==null&&e.inputShape==null){let t=null;e.batchSize!=null&&(t=e.batchSize),e.inputLength==null?this.batchInputShape=[t,null]:this.batchInputShape=[t].concat(Ae(e.inputLength))}this.inputDim=e.inputDim,xt(this.inputDim,"inputDim"),this.outputDim=e.outputDim,xt(this.outputDim,"outputDim"),this.embeddingsInitializer=Ge(e.embeddingsInitializer||this.DEFAULT_EMBEDDINGS_INITIALIZER),this.embeddingsRegularizer=He(e.embeddingsRegularizer),this.activityRegularizer=He(e.activityRegularizer),this.embeddingsConstraint=dt(e.embeddingsConstraint),this.maskZero=e.maskZero,this.supportsMasking=e.maskZero,this.inputLength=e.inputLength}build(e){this.embeddings=this.addWeight("embeddings",[this.inputDim,this.outputDim],this.dtype,this.embeddingsInitializer,this.embeddingsRegularizer,!0,this.embeddingsConstraint),this.built=!0}warnOnIncompatibleInputShape(e){}computeMask(e,t){return B(()=>this.maskZero?(e=me(e),xl(e,ke(e))):null)}computeOutputShape(e){if(e=Ne(e),this.inputLength==null)return[...e,this.outputDim];const t=Ae(this.inputLength);if(t.length!==e.length-1)throw new A(`"inputLength" is ${this.inputLength}, but received input shape has shape ${e}`);{let s=0;for(let o=0;o<t.length;++o){const r=t[o],i=e[o+1];if(r!=null&&i!=null&&r!==i)throw new A(`"inputLength" is ${this.inputLength}, but received input shape has shape ${e}`);r==null&&(t[s]=i),s++}}return[e[0],...t,this.outputDim]}call(e,t){return B(()=>{this.invokeCallHook(e,t);let s=me(e);s.dtype!=="int32"&&(s=zn(s,"int32"));const o=zg(this.embeddings.read(),M(s,[s.size]));return M(o,Ne(this.computeOutputShape(s.shape)))})}getConfig(){const e={inputDim:this.inputDim,outputDim:this.outputDim,embeddingsInitializer:Ke(this.embeddingsInitializer),embeddingsRegularizer:Me(this.embeddingsRegularizer),activityRegularizer:Me(this.activityRegularizer),embeddingsConstraint:ht(this.embeddingsConstraint),maskZero:this.maskZero,inputLength:this.inputLength},t=super.getConfig();return Object.assign(e,t),e}}kb.className="Embedding",Q(kb);class lo extends $e{constructor(e){super(e||{}),this.supportsMasking=!0}mergeFunction(e){throw new be}computeElementwiseOpOutputShape(e,t){if(e==null||t==null)return null;if(e.length<t.length)return this.computeElementwiseOpOutputShape(t,e);if(t.length===0)return e;const s=e.slice(0,e.length-t.length);for(let o=0;o<t.length;++o){const r=e[e.length-t.length+o],i=t[o];if(r==null||i==null||r<0||i<0)s.push(null);else if(r===1)s.push(i);else if(i===1)s.push(r);else{if(r!==i)throw new A("Operands could not be broadcast together with shapes "+JSON.stringify(e)+" "+JSON.stringify(t));s.push(r)}}return s}build(e){if(Array.isArray(e)&&!Array.isArray(e[0])&&(e=[Ne(e)]),e=e,e.length<2)throw new A(`A merge layer should be called on an Array of at least 2 inputs. Got ${e.length} input(s).`);let t=[];for(const r of e)r!=null&&r[0]!==null&&t.push(r[0]);if(t=ys(t),t.length>1)throw new A(`Can not merge tensors with different batch sizes. Got tensors with shapes: ${JSON.stringify(e)}.`);let s=e[0]==null?null:e[0].slice(1);for(let r=1;r<e.length;++r){const i=e[r]==null?null:e[r].slice(1);s=this.computeElementwiseOpOutputShape(s,i)}const o=e.map(r=>r.length);e.indexOf(null)===-1&&ys(o).length===1?this.reshapeRequired=!1:this.reshapeRequired=!0}call(e,t){return B(()=>{if(e=e,this.reshapeRequired){const s=[],o=e.map(r=>r.rank);if(o.indexOf(null)===-1){const r=Cs(o);for(let i of e){const a=i.rank;for(let l=0;l<r-a;++l)i=$i(i,1);s.push(i)}return this.mergeFunction(s)}else{let r=!1;for(const l of e){const c=l.rank;if(c==null){const u=l.shape,h=u[0],d=u.slice(1).concat([h]);let p=M(l,[h].concat(ws(u.slice(1))));p=ve(p,[1,0]),p=M(p,d),s.push(p),r=!0}else if(c>1){const u=Cn(1,c).concat([0]);s.push(ve(l,u)),r=!0}else s.push(l)}let i=this.mergeFunction(s);const a=i.rank;if(r){if(a==null){const l=i.shape,c=l.length,u=l[c-1],h=[u].concat(l.slice(0,l.length-1));i=M(ve(M(i,[-1,u]),[1,0]),h)}else if(a>1){const l=[a-1].concat(Cn(0,a-1));i=ve(i,l)}}return i}}else return this.mergeFunction(e)})}computeOutputShape(e){e=e;let t;e[0]==null?t=null:t=e[0].slice(1);for(let o=1;o<e.length;++o){const r=e[o]==null?null:e[o].slice(1);t=this.computeElementwiseOpOutputShape(t,r)}let s=[];for(const o of e)o!=null&&o[0]!==null&&s.push(o[0]);return s=ys(s),s.length===1?t=s.concat(t):t=[null].concat(t),t}computeMask(e,t){return B(()=>{if(t==null)return null;if(!Array.isArray(t))throw new A("`mask` should be an Array");if(!Array.isArray(e))throw new A("`inputs` should be an Array");if(t.length!==e.length)throw new A(`The Array 'inputs' and 'mask' are expected to have the same length, but have different lengths (${e.length} vs ${t.length})`);if(t.every(o=>o==null))return null;t=t.map(o=>o==null?o:Vt(o,0));let s=t[0];for(let o=1;o<t.length-1;++o)s=Qn(s,t[o]);return s})}}class vb extends lo{constructor(e){super(e)}mergeFunction(e){return B(()=>{let t=e[0].clone();for(let s=1;s<e.length;++s)t=ee(t,e[s]);return t})}}vb.className="Add",Q(vb);class Sb extends lo{constructor(e){super(e)}mergeFunction(e){return B(()=>{let t=e[0].clone();for(let s=1;s<e.length;++s)t=D(t,e[s]);return t})}}Sb.className="Multiply",Q(Sb);class Nb extends lo{constructor(e){super(e)}mergeFunction(e){return B(()=>{let t=e[0].clone();for(let s=1;s<e.length;++s)t=ee(t,e[s]);return D(1/e.length,t)})}}Nb.className="Average",Q(Nb);class Tb extends lo{constructor(e){super(e)}mergeFunction(e){return B(()=>{let t=e[0];for(let s=1;s<e.length;++s)t=gs(t,e[s]);return t})}}Tb.className="Maximum",Q(Tb);class Eb extends lo{constructor(e){super(e)}mergeFunction(e){return B(()=>{let t=e[0];for(let s=1;s<e.length;++s)t=pi(t,e[s]);return t})}}Eb.className="Minimum",Q(Eb);class Rb extends lo{constructor(e){super(e),this.DEFAULT_AXIS=-1,e==null&&(e={}),this.axis=e.axis==null?this.DEFAULT_AXIS:e.axis,this.supportsMasking=!0,this.reshapeRequired=!1}build(e){if(!(Array.isArray(e)&&Array.isArray(e[0]))||e.length===1)throw new A("A `Concatenate` layer should be called on a list of at least 2 inputs");e=e;let t=!0;for(const o of e)if(o!=null){t=!1;break}if(t)return;const s=[];for(let o=0;o<e.length;++o){const r=e[o].slice();r.splice(this.axis,1);let i=!1;for(const a of s)if(Ee(a,r)){i=!0;break}i||s.push(r)}if(s.length>1)throw new A("A `Concatenate` layer requires inputs with matching shapes except for the concat axis. Got input shapes: "+JSON.stringify(e))}mergeFunction(e){return B(()=>ud(e,this.axis))}computeOutputShape(e){if(!(Array.isArray(e)&&Array.isArray(e[0])))throw new A("A `Concatenate` layer should be called on a list of inputs.");const t=e,s=t[0].slice(),o=this.axis<0?s.length+this.axis:this.axis;for(const r of t.slice(1)){if(s[o]==null||r[o]==null){s[o]=null;break}s[o]+=r[o]}return s}computeMask(e,t){if(t==null)return null;if(!Array.isArray(t))throw new A("`mask` should be an array for Concatenate");if(!Array.isArray(e))throw new A("`inputs` should be an array for Concatenate");if(t.length!==e.length)throw new A(`Mismatch in the length of mask (${t.length}) and the legnth of inputs (${e.length})`);return B(()=>{let s=!0;if(t.forEach(i=>{if(i!=null){s=!1;return}}),s)return null;const o=[];for(let i=0;i<e.length;++i)t[i]==null?o.push(oe(on(e[i]),"bool")):t[i].rank<e[i].rank?o.push(Vt(t[i],-1)):o.push(t[i]);const r=Tt(o,this.axis);return Vf(r,-1,!1)})}getConfig(){const e={axis:this.axis},t=super.getConfig();return Object.assign(e,t),e}}Rb.className="Concatenate",Q(Rb);function Oi(n,e){for(;n<0;)n+=e;return n}function qE(n,e,t){if(n.shape.length>3||e.shape.length>3)throw new be("batchDot is not implemented for tensors of 4D or higher rank yet");if(k(n.shape.length>=2,()=>`batchDot requires the rank of x to be >= 2, but got ${n.shape.length}`),k(n.shape.length>=2,()=>`batchDot requires the rank of y to be >= 2, but got ${e.shape.length}`),typeof t=="number"&&(t=[t,t]),n.dtype==="complex64"||e.dtype==="complex64")throw new be("batchDot is not implemented for complex64-type Tensors yet.");const s=n.shape.length,o=e.shape.length;t==null&&(t=[s-1,o-2]);const r=t;return B(()=>{let i;if(s>o){i=s-o;const l=[];for(let c=0;c<i;++c)l.push(1);e=M(e,e.shape.concat(l))}else if(o>s){i=o-s;const l=[];for(let c=0;c<i;++c)l.push(1);n=M(n,n.shape.concat(l))}else i=0;let a;if(n.shape.length===2&&e.shape.length===2)r[0]===r[1]?a=ue(D(n,e),r[0]):a=ue(D(ve(n,[1,0]),e),r[1]);else{const l=r[0]!==n.shape.length-1,c=r[1]===e.shape.length-1;a=Te(n,e,l,c)}if(i>0){let l;s>o?l=s+o-3:l=s-1;const c=[];for(let u=l;u<l+i;++u)c.push(u);a=eo(a,c)}return a.shape.length===1&&(a=Vt(a,1)),a})}class Ab extends lo{constructor(e){super(e),this.axes=e.axes,this.normalize=e.normalize==null?!1:e.normalize,this.supportsMasking=!0,this.reshapeRequired=!1}build(e){k(Array.isArray(e)&&e.length===2&&Array.isArray(e[0])&&Array.isArray(e[1]),()=>"A `Dot` layer should be called on a list of exactly 2 inputs.");const t=e[0],s=e[1];if(t.length>3||s.length>3)throw new be("Dot layer does not support tensors of 4D or higher rank yet.");const o=this.interpretAxes(t,s);if(t[o[0]]!==s[o[1]])throw new A(`Dimension incompatibility: ${t[o[0]]} !== ${s[o[1]]}`)}mergeFunction(e){if(e.length!==2)throw new A(`A \`Dot\` layer must be called on exactly 2 inputs, but received ${e.length} input(s).`);let t=e[0],s=e[1],o;return Array.isArray(this.axes)?o=this.axes.map((r,i)=>Oi(r,e[i].shape.length)):o=[Oi(this.axes,t.shape.length),Oi(this.axes,s.shape.length)],this.normalize&&(t=Wl(t,o[0]),s=Wl(s,o[1])),qE(t,s,o)}interpretAxes(e,t){let s;return Array.isArray(this.axes)?s=this.axes:s=[Oi(this.axes,e.length),Oi(this.axes,t.length)],s}computeOutputShape(e){k(Array.isArray(e)&&e.length===2&&Array.isArray(e[0])&&Array.isArray(e[1]),()=>"A `Dot` layer should be called on a list of exactly 2 inputs.");const t=e[0].slice(),s=e[1].slice();if(t.length>3||s.length>3)throw new be("Dot layer does not support tensors of 4D or higher rank yet.");const o=this.interpretAxes(t,s);t.splice(o[0],1),s.splice(o[1],1),s.splice(0,1);const r=t.concat(s);return r.length===1&&r.push(1),r}computeMask(e,t){return null}getConfig(){const e={axes:this.axes,normalize:this.normalize},t=super.getConfig();return Object.assign(e,t),e}}Ab.className="Dot",Q(Ab);class Db extends $e{constructor(e){super(e),this.supportsMasking=!0,this.stddev=e.stddev}computeOutputShape(e){return e}getConfig(){const e=super.getConfig(),t={stddev:this.stddev};return Object.assign(t,e),t}call(e,t){return B(()=>{this.invokeCallHook(e,t);const s=me(e);return vi(()=>ee(Ll(s.shape,0,this.stddev),s),()=>s,t.training||!1)})}}Db.className="GaussianNoise",Q(Db);class Fb extends $e{constructor(e){super(e),this.supportsMasking=!0,this.rate=e.rate}computeOutputShape(e){return e}getConfig(){const e=super.getConfig(),t={rate:this.rate};return Object.assign(t,e),t}call(e,t){return B(()=>{this.invokeCallHook(e,t);const s=me(e);return this.rate>0&&this.rate<1?vi(()=>{const r=Math.sqrt(this.rate/(1-this.rate));return D(s,Ll(s.shape,1,r))},()=>s,t.training||!1):s})}}Fb.className="GaussianDropout",Q(Fb);class _b extends $e{constructor(e){super(e),this.supportsMasking=!0,this.rate=e.rate,this.noiseShape=e.noiseShape}_getNoiseShape(e){return this.noiseShape||me(e).shape}computeOutputShape(e){return e}getConfig(){const e=super.getConfig(),t={rate:this.rate};return Object.assign(t,e),t}call(e,t){return B(()=>{if(this.rate<1&&this.rate>0){const s=this._getNoiseShape(e);return vi(()=>{const r=me(e),a=-1.6732632423543772*1.0507009873554805;let l=Zs(mi(s),this.rate);l=zn(l,"float32");const c=$p((1-this.rate)*(1+this.rate*$p(a,2)),-.5),u=-c*a*this.rate,h=ee(D(r,l),D(ee(l,-1),a));return ee(D(h,c),u)},()=>me(e),t.training||!1)}return e})}}_b.className="AlphaDropout",Q(_b);function Li(n,e,t,s,o,r=.001){let i;if(n.rank===2)i=xI(n,e,t,s,o,r);else if(n.rank===3)i=yI(n,e,t,s,o,r);else if(n.rank===4)i=CI(n,e,t,s,o,r);else throw new be(`batchNormalization is not implemented for array of rank ${n.rank} yet`);return i}function jE(n,e,t,s,o=.001){return B(()=>{const r=fi(n,s),i=r.mean,a=r.variance;return[Li(n,i,a,t,e,o),i,a]})}function KE(n,e,t,s,o=.001){return B(()=>{const r=fi(n,s),i=r.mean,a=r.variance,l=[];for(const f of Cn(0,n.rank))s.indexOf(f)!==-1?l.push(1):l.push(n.shape[f]);const c=M(i,l),u=M(a,l),h=e==null?null:M(e,l),d=t==null?null:M(t,l);return[Li(n,c,u,d,h,o),i,a]})}function XE(n,e,t,s,o=.001){return Ee(s.slice().sort(),Cn(0,n.rank-1))?jE(n,e,t,s,o):KE(n,e,t,s,o)}class Ob extends $e{constructor(e){e==null&&(e={}),super(e),this.supportsMasking=!0,this.axis=e.axis==null?-1:e.axis,this.momentum=e.momentum==null?.99:e.momentum,this.epsilon=e.epsilon==null?.001:e.epsilon,this.center=e.center==null?!0:e.center,this.scale=e.scale==null?!0:e.scale,this.betaInitializer=Ge(e.betaInitializer||"zeros"),this.gammaInitializer=Ge(e.gammaInitializer||"ones"),this.movingMeanInitializer=Ge(e.movingMeanInitializer||"zeros"),this.movingVarianceInitializer=Ge(e.movingVarianceInitializer||"ones"),this.betaConstraint=dt(e.betaConstraint),this.gammaConstraint=dt(e.gammaConstraint),this.betaRegularizer=He(e.betaRegularizer),this.gammaRegularizer=He(e.gammaRegularizer)}build(e){e=Ne(e);const t=this.axis>=0?this.axis:this.axis+e.length,s=e[t];if(s==null)throw new A(`Axis ${t} of input tensor should have a defined dimension but the layer received an input with shape ${JSON.stringify(e)}.`);this.inputSpec=[new ut({ndim:e.length,axes:{[t]:s}})];const o=[s];this.scale&&(this.gamma=this.addWeight("gamma",o,null,this.gammaInitializer,this.gammaRegularizer,!0,this.gammaConstraint)),this.center&&(this.beta=this.addWeight("beta",o,null,this.betaInitializer,this.betaRegularizer,!0,this.betaConstraint)),this.movingMean=this.addWeight("moving_mean",o,null,this.movingMeanInitializer,null,!1),this.movingVariance=this.addWeight("moving_variance",o,null,this.movingVarianceInitializer,null,!1),this.built=!0}call(e,t){return B(()=>{const s=t.training==null?!1:t.training,o=me(e),r=o.shape,i=r.length,a=Cn(0,i),l=this.axis>=0?this.axis:this.axis+i;a.splice(l,1);const c=no(1,i);c[l]=r[l];const u=a.slice();u.sort();const h=!Ee(u,Cn(0,i).slice(0,i-1)),d=()=>{if(h){const b=M(this.movingMean.read(),c),w=M(this.movingVariance.read(),c),y=this.center?M(this.beta.read(),c):null,C=this.scale?M(this.gamma.read(),c):null;return Li(o,b,w,y,C,this.epsilon)}else return Li(o,this.movingMean.read(),this.movingVariance.read(),this.beta==null?null:this.beta.read(),this.gamma==null?null:this.gamma.read(),this.epsilon)};if(!s)return d();const[p,f,m]=XE(o,this.gamma.read(),this.beta.read(),a,this.epsilon),g=(b,w,y)=>{B(()=>{const C=1-y,$=b.read(),N=D(pe($,w),C);b.write(pe($,N))})};return(()=>{g(this.movingMean,f,this.momentum),g(this.movingVariance,m,this.momentum)})(),p})}getConfig(){const e={axis:this.axis,momentum:this.momentum,epsilon:this.epsilon,center:this.center,scale:this.scale,betaInitializer:Ke(this.betaInitializer),gammaInitializer:Ke(this.gammaInitializer),movingMeanInitializer:Ke(this.movingMeanInitializer),movingVarianceInitializer:Ke(this.movingVarianceInitializer),betaRegularizer:Me(this.betaRegularizer),gammaRegularizer:Me(this.gammaRegularizer),betaConstraint:ht(this.betaConstraint),gammaConstraint:ht(this.gammaConstraint)},t=super.getConfig();return Object.assign(e,t),e}}Ob.className="BatchNormalization",Q(Ob);class Lb extends $e{constructor(e){if(e==null&&(e={}),super(e),this.axis=e.axis==null?-1:e.axis,typeof this.axis=="number"){if(!Number.isInteger(this.axis))throw new Error(`Expected axis to be an integer, but received ${this.axis}`)}else if(Array.isArray(this.axis)){for(const t of this.axis)if(!Number.isInteger(t))throw new Error(`Expected axis to be an array of integers, but received ${JSON.stringify(this.axis)}`)}else throw new Error(`Expected axis to be an integer or an array of integers, but received ${JSON.stringify(this.axis)}`);this.epsilon=e.epsilon==null?.001:e.epsilon,this.center=e.center==null?!0:e.center,this.scale=e.scale==null?!0:e.scale,this.betaInitializer=Ge(e.betaInitializer||"zeros"),this.gammaInitializer=Ge(e.gammaInitializer||"ones"),this.betaRegularizer=He(e.betaRegularizer),this.gammaRegularizer=He(e.gammaRegularizer),this.supportsMasking=!0}build(e){e=Ne(e);const t=e.length;typeof this.axis=="number"&&(this.axis=[this.axis]);for(let r=0;r<this.axis.length;++r)this.axis[r]<0&&(this.axis[r]+=t);for(const r of this.axis)if(r<0||r>=t)throw new Error(`Invalid axis: ${r}`);if(this.axis.length!==ys(this.axis).length)throw new Error(`Found duplicate axes in: ${this.axis}`);const s=this.axis.map(r=>e[r]),o=!0;this.scale?this.gamma=this.addWeight("gamma",s,"float32",this.gammaInitializer,this.gammaRegularizer,o):this.gamma=null,this.center?this.beta=this.addWeight("beta",s,"float32",this.betaInitializer,this.betaRegularizer,o):this.beta=null,this.built=!0}call(e,t){const s=me(e),o=s.shape,r=o.length;return B(()=>{let{mean:a,variance:l}=fi(s,this.axis,!0);const c=no(1,r);for(const m of this.axis)c[m]=o[m];const u=m=>m!=null&&m.shape.length!==r?M(m,c):m;let h=this.scale?u(this.gamma.read()):null,d=this.center?u(this.beta.read()):null;const p=[],f=[];for(let m=0;m<r;++m)this.axis.indexOf(m)!==-1?(p.push(o[m]),f.push(1)):(p.push(1),f.push(o[m]));return a=yn(a,p),l=yn(l,p),h!=null&&(h=yn(h,f)),d!=null&&(d=yn(d,f)),Li(s,a,l,d,h,this.epsilon)})}getConfig(){const e={axis:this.axis,epsilon:this.epsilon,center:this.center,scale:this.scale,betaInitializer:Ke(this.betaInitializer),gammaInitializer:Ke(this.gammaInitializer),betaRegularizer:Me(this.betaRegularizer),gammaRegularizer:Me(this.gammaRegularizer)},t=super.getConfig();return Object.assign(e,t),e}}Lb.className="LayerNormalization",Q(Lb);function YE(n,e,t){return B(()=>{if(n.rank!==4)throw new A(`temporalPadding expects input tensor to be 4-D, but received a ${n.rank}-D tensor.`);if(e==null&&(e=[[1,1],[1,1]]),e.length!==2||e[0].length!==2||e[1].length!==2)throw new A("spatial2dPadding expects `padding` to be an Array of two Arrays, each of which is an Array of two integers.");if(t==null&&(t=In()),t!=="channelsLast"&&t!=="channelsFirst")throw new A(`Unknown data format: ${t}. Supported data formats are 'channelsLast' and 'channelsFirst.`);let s;return t==="channelsFirst"?s=[[0,0],[0,0],e[0],e[1]]:s=[[0,0],e[0],e[1],[0,0]],ch(n,s)})}class Mb extends $e{constructor(e){if(e==null&&(e={}),super(e),this.dataFormat=e.dataFormat==null?In():e.dataFormat,e.padding==null)this.padding=[[1,1],[1,1]];else if(typeof e.padding=="number")this.padding=[[e.padding,e.padding],[e.padding,e.padding]];else{if(e.padding=e.padding,e.padding.length!==2)throw new A(`ZeroPadding2D expects padding to be a length-2 array, but received a length-${e.padding.length} array.`);let t,s;if(typeof e.padding[0]=="number")t=[e.padding[0],e.padding[0]],s=[e.padding[1],e.padding[1]];else{if(e.padding=e.padding,e.padding[0].length!==2)throw new A(`ZeroPadding2D expects height padding to be a length-2 array, but received a length-${e.padding[0].length} array.`);if(t=e.padding[0],e.padding[1].length!==2)throw new A(`ZeroPadding2D expects width padding to be a length-2 array, but received a length-${e.padding[1].length} array.`);s=e.padding[1]}this.padding=[t,s]}this.inputSpec=[new ut({ndim:4})]}computeOutputShape(e){e=Ne(e);let t,s;return this.dataFormat==="channelsFirst"?(e[2]!=null&&e[2]>=0?t=e[2]+this.padding[0][0]+this.padding[0][1]:t=null,e[3]!=null&&e[3]>=0?s=e[3]+this.padding[1][0]+this.padding[1][1]:s=null,[e[0],e[1],t,s]):(e[1]!=null&&e[1]>=0?t=e[1]+this.padding[0][0]+this.padding[0][1]:t=null,e[2]!=null&&e[2]>=0?s=e[2]+this.padding[1][0]+this.padding[1][1]:s=null,[e[0],t,s,e[3]])}call(e,t){return B(()=>YE(me(e),this.padding,this.dataFormat))}getConfig(){const e={padding:this.padding,dataFormat:this.dataFormat},t=super.getConfig();return Object.assign(e,t),e}}Mb.className="ZeroPadding2D",Q(Mb);function tc(n,e,t,s,o,r){return B(()=>{st(o),_g(r),Jt(s),t==null&&(t=[1,1]),s==null&&(s="valid"),o==null&&(o=In()),r==null&&(r="max"),n=Od(n,o);let i;const a=s==="same"?"same":"valid";return r==="max"?i=lh(n,e,t,a):i=Zu(n,e,t,a),o==="channelsFirst"&&(i=ve(i,[0,3,1,2])),i})}function Pb(n,e,t,s,o,r){return B(()=>{st(o),_g(r),Jt(s),t==null&&(t=[1,1,1]),s==null&&(s="valid"),o==null&&(o=In()),r==null&&(r="max"),n=eb(n,o);let i;const a=s==="same"?"same":"valid";return r==="max"?i=ok(n,e,t,a):i=aI(n,e,t,a),o==="channelsFirst"&&(i=ve(i,[0,4,1,2,3])),i})}class Bb extends $e{constructor(e){if(e.poolSize==null&&(e.poolSize=2),super(e),typeof e.poolSize=="number")this.poolSize=[e.poolSize];else if(Array.isArray(e.poolSize)&&e.poolSize.length===1&&typeof e.poolSize[0]=="number")this.poolSize=e.poolSize;else throw new A(`poolSize for 1D convolutional layer must be a number or an Array of a single number, but received ${JSON.stringify(e.poolSize)}`);if(xt(this.poolSize,"poolSize"),e.strides==null)this.strides=this.poolSize;else if(typeof e.strides=="number")this.strides=[e.strides];else if(Array.isArray(e.strides)&&e.strides.length===1&&typeof e.strides[0]=="number")this.strides=e.strides;else throw new A(`strides for 1D convolutional layer must be a number or an Array of a single number, but received ${JSON.stringify(e.strides)}`);xt(this.strides,"strides"),this.padding=e.padding==null?"valid":e.padding,Jt(this.padding),this.inputSpec=[new ut({ndim:3})]}computeOutputShape(e){e=Ne(e);const t=Sn(e[1],this.poolSize[0],this.padding,this.strides[0]);return[e[0],t,e[2]]}call(e,t){return B(()=>{this.invokeCallHook(e,t),e=$i(me(e),2);const s=this.poolingFunction(me(e),[this.poolSize[0],1],[this.strides[0],1],this.padding,"channelsLast");return eo(s,[2])})}getConfig(){const e={poolSize:this.poolSize,padding:this.padding,strides:this.strides},t=super.getConfig();return Object.assign(e,t),e}}class zb extends Bb{constructor(e){super(e)}poolingFunction(e,t,s,o,r){return st(r),Jt(o),tc(e,t,s,o,r,"max")}}zb.className="MaxPooling1D",Q(zb);class Vb extends Bb{constructor(e){super(e)}poolingFunction(e,t,s,o,r){return st(r),Jt(o),tc(e,t,s,o,r,"avg")}}Vb.className="AveragePooling1D",Q(Vb);class Wb extends $e{constructor(e){if(e.poolSize==null&&(e.poolSize=[2,2]),super(e),this.poolSize=Array.isArray(e.poolSize)?e.poolSize:[e.poolSize,e.poolSize],e.strides==null)this.strides=this.poolSize;else if(Array.isArray(e.strides)){if(e.strides.length!==2)throw new A(`If the strides property of a 2D pooling layer is an Array, it is expected to have a length of 2, but received length ${e.strides.length}.`);this.strides=e.strides}else this.strides=[e.strides,e.strides];xt(this.poolSize,"poolSize"),xt(this.strides,"strides"),this.padding=e.padding==null?"valid":e.padding,this.dataFormat=e.dataFormat==null?"channelsLast":e.dataFormat,st(this.dataFormat),Jt(this.padding),this.inputSpec=[new ut({ndim:4})]}computeOutputShape(e){e=Ne(e);let t=this.dataFormat==="channelsFirst"?e[2]:e[1],s=this.dataFormat==="channelsFirst"?e[3]:e[2];return t=Sn(t,this.poolSize[0],this.padding,this.strides[0]),s=Sn(s,this.poolSize[1],this.padding,this.strides[1]),this.dataFormat==="channelsFirst"?[e[0],e[1],t,s]:[e[0],t,s,e[3]]}call(e,t){return B(()=>(this.invokeCallHook(e,t),this.poolingFunction(me(e),this.poolSize,this.strides,this.padding,this.dataFormat)))}getConfig(){const e={poolSize:this.poolSize,padding:this.padding,strides:this.strides,dataFormat:this.dataFormat},t=super.getConfig();return Object.assign(e,t),e}}class Ub extends Wb{constructor(e){super(e)}poolingFunction(e,t,s,o,r){return st(r),Jt(o),tc(e,t,s,o,r,"max")}}Ub.className="MaxPooling2D",Q(Ub);class Gb extends Wb{constructor(e){super(e)}poolingFunction(e,t,s,o,r){return st(r),Jt(o),tc(e,t,s,o,r,"avg")}}Gb.className="AveragePooling2D",Q(Gb);class Hb extends $e{constructor(e){if(e.poolSize==null&&(e.poolSize=[2,2,2]),super(e),this.poolSize=Array.isArray(e.poolSize)?e.poolSize:[e.poolSize,e.poolSize,e.poolSize],e.strides==null)this.strides=this.poolSize;else if(Array.isArray(e.strides)){if(e.strides.length!==3)throw new A(`If the strides property of a 3D pooling layer is an Array, it is expected to have a length of 3, but received length ${e.strides.length}.`);this.strides=e.strides}else this.strides=[e.strides,e.strides,e.strides];xt(this.poolSize,"poolSize"),xt(this.strides,"strides"),this.padding=e.padding==null?"valid":e.padding,this.dataFormat=e.dataFormat==null?"channelsLast":e.dataFormat,st(this.dataFormat),Jt(this.padding),this.inputSpec=[new ut({ndim:5})]}computeOutputShape(e){e=Ne(e);let t=this.dataFormat==="channelsFirst"?e[2]:e[1],s=this.dataFormat==="channelsFirst"?e[3]:e[2],o=this.dataFormat==="channelsFirst"?e[4]:e[3];return t=Sn(t,this.poolSize[0],this.padding,this.strides[0]),s=Sn(s,this.poolSize[1],this.padding,this.strides[1]),o=Sn(o,this.poolSize[2],this.padding,this.strides[2]),this.dataFormat==="channelsFirst"?[e[0],e[1],t,s,o]:[e[0],t,s,o,e[4]]}call(e,t){return B(()=>(this.invokeCallHook(e,t),this.poolingFunction(me(e),this.poolSize,this.strides,this.padding,this.dataFormat)))}getConfig(){const e={poolSize:this.poolSize,padding:this.padding,strides:this.strides,dataFormat:this.dataFormat},t=super.getConfig();return Object.assign(e,t),e}}class qb extends Hb{constructor(e){super(e)}poolingFunction(e,t,s,o,r){return st(r),Jt(o),Pb(e,t,s,o,r,"max")}}qb.className="MaxPooling3D",Q(qb);class jb extends Hb{constructor(e){super(e)}poolingFunction(e,t,s,o,r){return st(r),Jt(o),Pb(e,t,s,o,r,"avg")}}jb.className="AveragePooling3D",Q(jb);class Kb extends $e{constructor(e){super(e),this.inputSpec=[new ut({ndim:3})]}computeOutputShape(e){return[e[0],e[2]]}call(e,t){throw new be}}class Xb extends Kb{constructor(e){super(e||{})}call(e,t){return B(()=>{const s=me(e);return it(s,1)})}}Xb.className="GlobalAveragePooling1D",Q(Xb);class Yb extends Kb{constructor(e){super(e||{})}call(e,t){return B(()=>{const s=me(e);return bn(s,1)})}}Yb.className="GlobalMaxPooling1D",Q(Yb);class Zb extends $e{constructor(e){super(e),this.dataFormat=e.dataFormat==null?"channelsLast":e.dataFormat,st(this.dataFormat),this.inputSpec=[new ut({ndim:4})]}computeOutputShape(e){return e=e,this.dataFormat==="channelsLast"?[e[0],e[3]]:[e[0],e[1]]}call(e,t){throw new be}getConfig(){const e={dataFormat:this.dataFormat},t=super.getConfig();return Object.assign(e,t),e}}class Qb extends Zb{call(e,t){return B(()=>{const s=me(e);return this.dataFormat==="channelsLast"?it(s,[1,2]):it(s,[2,3])})}}Qb.className="GlobalAveragePooling2D",Q(Qb);class Jb extends Zb{call(e,t){return B(()=>{const s=me(e);return this.dataFormat==="channelsLast"?bn(s,[1,2]):bn(s,[2,3])})}}Jb.className="GlobalMaxPooling2D",Q(Jb);class e0 extends $e{constructor(e){super(e),this.layer=e.layer}build(e){this.built=!0}get trainable(){return this.layer!=null?this.layer.trainable:!1}set trainable(e){this.layer!=null&&(this.layer.trainable=e)}get trainableWeights(){return this.layer.trainableWeights}get nonTrainableWeights(){return this.layer.nonTrainableWeights}get updates(){return this.layer._updates}get losses(){return this.layer.losses}getWeights(){return this.layer.getWeights()}setWeights(e){this.layer.setWeights(e)}getConfig(){const e={layer:{className:this.layer.getClassName(),config:this.layer.getConfig()}},t=super.getConfig();return Object.assign(e,t),e}setFastWeightInitDuringBuild(e){super.setFastWeightInitDuringBuild(e),this.layer!=null&&this.layer.setFastWeightInitDuringBuild(e)}static fromConfig(e,t,s={}){const o=t.layer,r=Un(o,s);delete t.layer;const i={layer:r};return Object.assign(i,t),new e(i)}}class t0 extends e0{constructor(e){super(e),this.supportsMasking=!0}build(e){if(e=Ne(e),e.length<3)throw new A(`TimeDistributed layer expects an input shape >= 3D, but received input shape ${JSON.stringify(e)}`);this.inputSpec=[{shape:e}];const t=[e[0]].concat(e.slice(2));this.layer.built||(this.layer.build(t),this.layer.built=!0),super.build(e)}computeOutputShape(e){e=Ne(e);const t=[e[0]].concat(e.slice(2)),s=this.layer.computeOutputShape(t),o=e[1];return[s[0],o].concat(s.slice(1))}call(e,t){return B(()=>(e=me(e),ub((i,a)=>[me(this.layer.call(i,t)),[]],e,[],!1,null,null,!1,!0)[1]))}}t0.className="TimeDistributed",Q(t0);function ZE(n){oo(gT,"BidirectionalMergeMode",n)}const QE="concat";class n0 extends e0{constructor(e){super(e);const t=e.layer.getConfig(),s={};s.className=e.layer.getClassName(),s.config=t,this.forwardLayer=Un(s),t.goBackwards=t.goBackwards!==!0;const o={};if(o.className=e.layer.getClassName(),o.config=t,this.backwardLayer=Un(o),this.forwardLayer.name="forward_"+this.forwardLayer.name,this.backwardLayer.name="backward_"+this.backwardLayer.name,this.mergeMode=e.mergeMode===void 0?QE:e.mergeMode,ZE(this.mergeMode),e.weights)throw new be("weights support is not implemented for Bidirectional layer yet.");this._stateful=e.layer.stateful,this.returnSequences=e.layer.returnSequences,this.returnState=e.layer.returnState,this.supportsMasking=!0,this._trainable=!0,this.inputSpec=e.layer.inputSpec,this.numConstants=null}get trainable(){return this._trainable}set trainable(e){this._trainable=e,this.forwardLayer!=null&&(this.forwardLayer.trainable=e),this.backwardLayer!=null&&(this.backwardLayer.trainable=e)}getWeights(){return this.forwardLayer.getWeights().concat(this.backwardLayer.getWeights())}setWeights(e){const t=e.length,s=Math.floor(t/2);this.forwardLayer.setWeights(e.slice(0,s)),this.backwardLayer.setWeights(e.slice(s))}computeOutputShape(e){let t=this.forwardLayer.computeOutputShape(e);Array.isArray(t)&&Array.isArray(t[0])||(t=[t]),t=t;let s,o,r;return this.returnState&&(r=t.slice(1)),s=t[0],s=s,this.mergeMode==="concat"?(s[s.length-1]*=2,o=[s]):this.mergeMode==null?o=[s,s.slice()]:o=[s],this.returnState?this.mergeMode==null?o.concat(r).concat(r.slice()):[s].concat(r).concat(r.slice()):Wt(o)}apply(e,t){let s=t==null?null:t.initialState,o=t==null?null:t.constants;t==null&&(t={});const r=cb(e,s,o,this.numConstants);if(e=r.inputs,s=r.initialState,o=r.constants,Array.isArray(e)&&(s=e.slice(1),e=e[0]),(s==null||s.length===0)&&o==null)return super.apply(e,t);const i=[],a=[];if(s!=null){const c=s.length;if(c%2>0)throw new A("When passing `initialState` to a Bidrectional RNN, the state should be an Array containing the states of the underlying RNNs.");t.initialState=s,i.push(...s);const u=s.map(h=>new ut({shape:h.shape}));this.forwardLayer.stateSpec=u.slice(0,c/2),this.backwardLayer.stateSpec=u.slice(c/2),a.push(...u)}if(o!=null)throw new be("Support for constants in Bidirectional layers is not implemented yet.");const l=i[0]instanceof Wn;for(const c of i)if(c instanceof Wn!==l)throw new A("The initial state of a Bidirectional layer cannot be specified as a mix of symbolic and non-symbolic tensors");if(l){const c=[e].concat(i),u=this.inputSpec.concat(a),h=this.inputSpec;this.inputSpec=u;const d=super.apply(c,t);return this.inputSpec=h,d}else return super.apply(e,t)}call(e,t){return B(()=>{const s=t.initialState;let o,r;if(s==null)o=this.forwardLayer.call(e,t),r=this.backwardLayer.call(e,t);else{const l=s.slice(0,s.length/2),c=s.slice(s.length/2);o=this.forwardLayer.call(e,Object.assign(t,{initialState:l})),r=this.backwardLayer.call(e,Object.assign(t,{initialState:c}))}let i;this.returnState&&(Array.isArray(o)&&(i=o.slice(1).concat(r.slice(1))),o=o[0],r=r[0]),this.returnSequences&&(r=Js(r,1));let a;return this.mergeMode==="concat"?a=ud([o,r]):this.mergeMode==="sum"?a=ee(o,r):this.mergeMode==="ave"?a=D(.5,ee(o,r)):this.mergeMode==="mul"?a=D(o,r):this.mergeMode==null&&(a=[o,r]),this.returnState?this.mergeMode==null?a.concat(i):[a].concat(i):a})}resetStates(e){this.forwardLayer.resetStates(),this.backwardLayer.resetStates()}build(e){ro(this.forwardLayer.name,()=>{this.forwardLayer.build(e)}),ro(this.backwardLayer.name,()=>{this.backwardLayer.build(e)}),this.built=!0}computeMask(e,t){Array.isArray(t)&&(t=t[0]);let s;if(this.returnSequences?this.mergeMode==null?s=[t,t]:s=t:this.mergeMode==null?s=[null,null]:s=null,this.returnState){const r=this.forwardLayer.states.map(i=>null);return Array.isArray(s)?s.concat(r).concat(r):[s].concat(r).concat(r)}else return s}get trainableWeights(){return this.forwardLayer.trainableWeights.concat(this.backwardLayer.trainableWeights)}get nonTrainableWeights(){return this.forwardLayer.nonTrainableWeights.concat(this.backwardLayer.nonTrainableWeights)}setFastWeightInitDuringBuild(e){super.setFastWeightInitDuringBuild(e),this.forwardLayer!=null&&this.forwardLayer.setFastWeightInitDuringBuild(e),this.backwardLayer!=null&&this.backwardLayer.setFastWeightInitDuringBuild(e)}getConfig(){const e={mergeMode:this.mergeMode},t=super.getConfig();return Object.assign(e,t),e}static fromConfig(e,t){const s=Un(t.layer);if(delete t.layer,t.numConstants!=null)throw new be("Deserialization of a Bidirectional layer with numConstants present is not supported yet.");const o=t;return o.layer=s,new e(o)}}n0.className="Bidirectional",Q(n0);class s0 extends $e{constructor(e){super(e),this.scale=e.scale,e.offset?this.offset=e.offset:this.offset=0}getConfig(){const e={scale:this.scale,offset:this.offset},t=super.getConfig();return Object.assign(e,t),e}call(e,t){return B(()=>(e=me(e),e.dtype!=="float32"&&(e=zn(e,"float32")),ee(D(e,this.scale),this.offset)))}}s0.className="Rescaling",Q(s0);const{resizeBilinear:JE,cropAndResize:eR}=es;class o0 extends $e{constructor(e){super(e),this.height=e.height,this.width=e.width}centerCrop(e,t,s,o,r,i,a,l){return B(()=>{let c,u=!1;const h=t/i,d=s/a,p=(o+t)/i,f=(r+s)/a,m=[h,d,p,f],g=[];e.rank===3?(u=!0,c=Ln([e])):c=e;for(let C=0;C<c.shape[0];C++)g.push(m);const x=Vs(g,[g.length,4]),b=gi(0,g.length,1,"int32"),y=eR(c,x,b,[o,r],"nearest");return zn(u?me(xs(y)):y,l)})}upsize(e,t,s,o){return B(()=>{const r=JE(e,[t,s]);return zn(r,o)})}call(e,t){return B(()=>{const s=me(e),o=s.dtype,r=s.shape,i=r[r.length-3],a=r[r.length-2];let l=0;i!==this.height&&(l=Math.floor((i-this.height)/2));let c=0;return a!==this.width&&(c=Math.floor((a-this.width)/2),c===0&&(c=1)),l>=0&&c>=0?this.centerCrop(s,l,c,this.height,this.width,i,a,o):this.upsize(e,this.height,this.width,o)})}getConfig(){const e={height:this.height,width:this.width},t=super.getConfig();return Object.assign(e,t),e}computeOutputShape(e){e=Ne(e);const t=e.length-3,s=e.length-2;return e[t]=this.height,e[s]=this.width,e}}o0.className="CenterCrop",Q(o0);function tR(n,e,t,s){let o=me(n);if(o.dtype!=="int32"&&(o=zn(o,"int32")),e==="int")return o;const r=o.shape;if(o.rank===0&&(o=Vt(o,-1)),e==="oneHot"&&o.shape[o.shape.length-1]!==1&&(o=Vt(o,-1)),o.rank>2)throw new A(`When outputMode is not int, maximum output rank is 2 Received outputMode ${e} and input shape ${r} which would result in output rank ${o.rank}.`);const i=["multiHot","oneHot"].includes(e),a=o;let l;if(typeof s!="undefined"&&e==="count"?l=jf(a,s,t,i):l=jf(a,[],t,i),e!=="tfIdf")return l;if(s)return D(l,s);throw new A("When outputMode is 'tfIdf', weights must be provided.")}class r0 extends $e{constructor(e){super(e),this.numTokens=e.numTokens,e.outputMode?this.outputMode=e.outputMode:this.outputMode="multiHot"}getConfig(){const e={numTokens:this.numTokens,outputMode:this.outputMode},t=super.getConfig();return Object.assign(e,t),e}computeOutputShape(e){return e=Ne(e),e==null?[this.numTokens]:this.outputMode==="oneHot"&&e[e.length-1]!==1?(e.push(this.numTokens),e):(e[e.length-1]=this.numTokens,e)}call(e,t){return B(()=>{e=me(e),e.dtype!=="int32"&&(e=zn(e,"int32"));let s;if(typeof t.countWeights!="undefined"){if(this.outputMode!=="count")throw new A(`countWeights is not used when outputMode !== count.
              Received countWeights=${t.countWeights}`);s=me(t.countWeights)}const o=bn(e),r=pl(e),i=Ht(this.numTokens,o).bufferSync().get(0),a=Zs(r,0).bufferSync().get(0);if(!(i&&a))throw new A(`Input values must be between 0 < values <= numTokens with numTokens=${this.numTokens}`);return tR(e,this.outputMode,this.numTokens,s)})}}r0.className="CategoryEncoding",Q(r0);const nR=["bilinear","nearest"],i0=new Set(nR);class a0 extends $e{constructor(e){if(super(e),this.height=e.height,this.width=e.width,e.interpolation)if(i0.has(e.interpolation))this.interpolation=e.interpolation;else throw new A(`Invalid interpolation parameter: ${e.interpolation} is not implemented`);else this.interpolation="bilinear";this.cropToAspectRatio=!!e.cropToAspectRatio}computeOutputShape(e){e=Ne(e);const t=e[2];return[this.height,this.width,t]}getConfig(){const e={height:this.height,width:this.width,interpolation:this.interpolation,cropToAspectRatio:this.cropToAspectRatio},t=super.getConfig();return Object.assign(e,t),e}call(e,t){return B(()=>{const s=[this.height,this.width];if(this.interpolation==="bilinear")return es.resizeBilinear(e,s,!this.cropToAspectRatio);if(this.interpolation==="nearest")return es.resizeNearestNeighbor(e,s,!this.cropToAspectRatio);throw new Error(`Interpolation is ${this.interpolation} but only ${[...i0]} are supported`)})}}a0.className="Resizing",Q(a0);class l0{constructor(e){this.seed=e}next(){if(this.seed!==void 0)return this.seed++}}l0.className="RandomSeed";class c0 extends $e{constructor(e){super(e),this.randomGenerator=new l0(e.seed)}getConfig(){const e={seed:this.randomGenerator.seed},t=super.getConfig();return Object.assign(e,t),e}}c0.className="BaseRandomLayer";const sR=["bilinear","nearest"],u0=new Set(sR);class h0 extends c0{constructor(e){super(e);const{factor:t,interpolation:s="bilinear"}=e;if(this.factor=t,Array.isArray(this.factor)&&this.factor.length===2)this.widthLower=this.factor[0],this.widthUpper=this.factor[1];else if(!Array.isArray(this.factor)&&this.factor>0)this.widthLower=-this.factor,this.widthUpper=this.factor;else throw new A(`Invalid factor: ${this.factor}. Must be positive number or tuple of 2 numbers`);if(this.widthLower<-1||this.widthUpper<-1)throw new A(`factor must have values larger than -1. Got: ${this.factor}`);if(this.widthUpper<this.widthLower)throw new A(`factor cannot have upper bound less than lower bound.
        Got upper bound: ${this.widthUpper}.
        Got lower bound: ${this.widthLower}
      `);if(s)if(u0.has(s))this.interpolation=s;else throw new A(`Invalid interpolation parameter: ${s} is not implemented`)}getConfig(){const e={factor:this.factor,interpolation:this.interpolation},t=super.getConfig();return Object.assign(e,t),e}computeOutputShape(e){e=Ne(e);const t=e[2];return[this.imgHeight,-1,t]}call(e,t){return B(()=>{const s=me(e);this.imgHeight=s.shape[s.shape.length-3];const o=s.shape[s.shape.length-2];this.widthFactor=mi([1],1+this.widthLower,1+this.widthUpper,"float32",this.randomGenerator.next());let r=this.widthFactor.dataSync()[0]*o;r=Math.round(r);const i=[this.imgHeight,r];switch(this.interpolation){case"bilinear":return es.resizeBilinear(e,i);case"nearest":return es.resizeNearestNeighbor(e,i);default:throw new Error(`Interpolation is ${this.interpolation}
          but only ${[...u0]} are supported`)}})}}h0.className="RandomWidth",Q(h0);V().registerFlag("KEEP_INTERMEDIATE_TENSORS",()=>!1,n=>{n&&console.warn("Keep intermediate tensors is ON. This will print the values of all intermediate tensors during model inference. Not all models support this mode. For details, check e2e/benchmarks/ model_config.js. This significantly impacts performance.")});var d0;(function(n){n[n.DT_INVALID=0]="DT_INVALID",n[n.DT_FLOAT=1]="DT_FLOAT",n[n.DT_DOUBLE=2]="DT_DOUBLE",n[n.DT_INT32=3]="DT_INT32",n[n.DT_UINT8=4]="DT_UINT8",n[n.DT_INT16=5]="DT_INT16",n[n.DT_INT8=6]="DT_INT8",n[n.DT_STRING=7]="DT_STRING",n[n.DT_COMPLEX64=8]="DT_COMPLEX64",n[n.DT_INT64=9]="DT_INT64",n[n.DT_BOOL=10]="DT_BOOL",n[n.DT_QINT8=11]="DT_QINT8",n[n.DT_QUINT8=12]="DT_QUINT8",n[n.DT_QINT32=13]="DT_QINT32",n[n.DT_BFLOAT16=14]="DT_BFLOAT16",n[n.DT_QINT16=15]="DT_QINT16",n[n.DT_QUINT16=16]="DT_QUINT16",n[n.DT_UINT16=17]="DT_UINT16",n[n.DT_COMPLEX128=18]="DT_COMPLEX128",n[n.DT_HALF=19]="DT_HALF",n[n.DT_RESOURCE=20]="DT_RESOURCE",n[n.DT_VARIANT=21]="DT_VARIANT",n[n.DT_UINT32=22]="DT_UINT32",n[n.DT_UINT64=23]="DT_UINT64",n[n.DT_FLOAT_REF=101]="DT_FLOAT_REF",n[n.DT_DOUBLE_REF=102]="DT_DOUBLE_REF",n[n.DT_INT32_REF=103]="DT_INT32_REF",n[n.DT_UINT8_REF=104]="DT_UINT8_REF",n[n.DT_INT16_REF=105]="DT_INT16_REF",n[n.DT_INT8_REF=106]="DT_INT8_REF",n[n.DT_STRING_REF=107]="DT_STRING_REF",n[n.DT_COMPLEX64_REF=108]="DT_COMPLEX64_REF",n[n.DT_INT64_REF=109]="DT_INT64_REF",n[n.DT_BOOL_REF=110]="DT_BOOL_REF",n[n.DT_QINT8_REF=111]="DT_QINT8_REF",n[n.DT_QUINT8_REF=112]="DT_QUINT8_REF",n[n.DT_QINT32_REF=113]="DT_QINT32_REF",n[n.DT_BFLOAT16_REF=114]="DT_BFLOAT16_REF",n[n.DT_QINT16_REF=115]="DT_QINT16_REF",n[n.DT_QUINT16_REF=116]="DT_QUINT16_REF",n[n.DT_UINT16_REF=117]="DT_UINT16_REF",n[n.DT_COMPLEX128_REF=118]="DT_COMPLEX128_REF",n[n.DT_HALF_REF=119]="DT_HALF_REF",n[n.DT_RESOURCE_REF=120]="DT_RESOURCE_REF",n[n.DT_VARIANT_REF=121]="DT_VARIANT_REF",n[n.DT_UINT32_REF=122]="DT_UINT32_REF",n[n.DT_UINT64_REF=123]="DT_UINT64_REF"})(d0||(d0={}));var p0;(function(n){(function(e){e[e.LEGACY=0]="LEGACY",e[e.V1=1]="V1",e[e.V2=2]="V2"})(n.CheckpointFormatVersion||(n.CheckpointFormatVersion={}))})(p0||(p0={}));var f0;(function(n){n[n.FAIL=0]="FAIL",n[n.SHORTEST=1]="SHORTEST",n[n.LONGEST=2]="LONGEST"})(f0||(f0={}));function ie(n,e){Array.isArray(n)||(n=[n]),n.forEach(t=>{t!=null&&k(t.dtype!=="complex64",()=>`${e} does not support complex64 tensors in the CPU backend.`)})}const oR=$m;class nc extends Io{nextDataId(){return nc.nextDataId++}constructor(){super(),this.blockSize=48,this.firstUse=!0,this.data=new Zi(this,Ye())}write(e,t,s){this.firstUse&&(this.firstUse=!1,V().get("IS_NODE")&&Yt(`
============================
Hi, looks like you are running TensorFlow.js in Node.js. To speed things up dramatically, install our node backend, visit https://github.com/tensorflow/tfjs-node for more details. 
============================`));const o={id:this.nextDataId()};return this.data.set(o,{values:e,dtype:s,refCount:1}),o}makeTensorInfo(e,t,s){let o;if(t==="string"&&s!=null&&s.length>0&&ir(s[0])){const r=s.map(i=>us(i));o=this.write(r,e,t)}else o=this.write(s,e,t);return{dataId:o,shape:e,dtype:t}}refCount(e){return this.data.has(e)?this.data.get(e).refCount:0}incRef(e){const t=this.data.get(e);t.refCount++}decRef(e){if(this.data.has(e)){const t=this.data.get(e);t.refCount--}}move(e,t,s,o,r){this.data.set(e,{values:t,dtype:o,refCount:r})}numDataIds(){return this.data.numDataIds()}read(e){return Y(this,null,function*(){return this.readSync(e)})}readSync(e){const{dtype:t,complexTensorInfos:s}=this.data.get(e);if(t==="complex64"){const o=this.readSync(s.real.dataId),r=this.readSync(s.imag.dataId);return ts(o,r)}return lw(this.data.get(e).values,t)}bufferSync(e){const t=this.readSync(e.dataId);if(e.dtype==="string")try{const s=t.map(o=>hs(o));return Ie(e.shape,e.dtype,s)}catch(s){throw new Error("Failed to decode encoded string bytes into utf-8")}return Ie(e.shape,e.dtype,t)}makeOutput(e,t,s){return Ye().makeTensorFromTensorInfo(this.makeTensorInfo(t,s,e),this)}disposeData(e,t=!1){if(this.data.has(e)){if(this.data.get(e).refCount--,!t&&this.data.get(e).refCount>0)return!1;const{complexTensorInfos:s}=this.data.get(e);s!=null&&(this.disposeData(s.real.dataId,!0),this.disposeData(s.imag.dataId,!0)),this.data.delete(e)}return!0}disposeIntermediateTensorInfo(e){this.disposeData(e.dataId)}time(e){return Y(this,null,function*(){const t=Pt();return e(),{kernelMs:Pt()-t}})}memory(){return{unreliable:!0,reasons:["The reported memory is an upper bound. Due to automatic garbage collection, the true allocated memory may be less."]}}where(e){ie([e],"where");const t=this.readSync(e.dataId);return oR(e.shape,t)}dispose(){}floatPrecision(){return 32}epsilon(){return super.epsilon()}}nc.nextDataId=0;function m0(n){const e=new Float32Array(n.length);for(let t=0;t<n.length;++t)e[t]=Math.abs(n[t]);return e}const rR={kernelName:Ji,backendName:"cpu",kernelFunc:n=>{const{x:e}=n.inputs,t=n.backend;ie(e,"abs");let s=new Float32Array(q(e.shape));const o=t.data.get(e.dataId).values;return s=m0(o),t.makeOutput(s,e.shape,e.dtype)}};function ot(n){return(e,t,s,o,r)=>{const i=xe(e,t),a=i.length,l=ce(i),c=q(i),u=vt(r,c),h=e.length,d=t.length,p=ce(e),f=ce(t),m=Oo(e,i),g=Oo(t,i);if(m.length+g.length===0)for(let x=0;x<u.length;++x)u[x]=n(s[x%s.length],o[x%o.length]);else for(let x=0;x<u.length;++x){const b=So(x,a,l),w=b.slice(-h);m.forEach(N=>w[N]=0);const y=Rn(w,h,p),C=b.slice(-d);g.forEach(N=>C[N]=0);const $=Rn(C,d,f);u[x]=n(s[y],o[$])}return[u,i]}}function Kt(n){const{inputs:e,backend:t}=n,{real:s,imag:o}=e,r=t.data.get(s.dataId).values,i=t.data.get(o.dataId).values,a=t.makeTensorInfo(s.shape,"complex64"),l=t.data.get(a.dataId);return l.complexTensorInfos={real:t.makeTensorInfo(s.shape,"float32",r),imag:t.makeTensorInfo(o.shape,"float32",i)},a}const iR={kernelName:Yc,backendName:"cpu",kernelFunc:Kt};function sc(n,e,t="float32"){if(t==="complex64"){const o=sc(n,e,"float32"),r=sc(n,e,"float32");return Kt({inputs:{real:o,imag:r},backend:n})}const s=St(q(e),t);return n.makeTensorInfo(e,t,s)}function Hn(n){const{inputs:e,backend:t}=n,{x:s}=e;return t.incRef(s.dataId),{dataId:s.dataId,shape:s.shape,dtype:s.dtype}}const aR={kernelName:Nr,backendName:"cpu",kernelFunc:Hn};function co(n){const{inputs:e,backend:t}=n,{input:s}=e,o=t.data.get(s.dataId).complexTensorInfos.real,r=t.data.get(o.dataId).values;return t.makeTensorInfo(o.shape,o.dtype,r)}const lR={kernelName:Iu,backendName:"cpu",kernelFunc:co};function g0(n,e,t,s){if(s==="int32"){const o=Int32Array.from(n);return[e,"int32",o]}if(s==="bool"){const o=Ps([0],t),[r,i]=ot((a,l)=>a!==l?1:0)(e,[],n,o,"bool");return[i,"bool",r]}throw new Error(`Error in Cast: failed to cast ${t} to ${s}`)}function Ns(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{dtype:r}=s;if(r==="complex64"){if(o.dtype==="complex64")return Hn({inputs:{x:o},backend:t});const u=sc(t,o.shape,o.dtype),h=Ns({inputs:{x:o},backend:t,attrs:{dtype:"float32"}}),d=Kt({inputs:{real:h,imag:u},backend:t});return t.disposeIntermediateTensorInfo(u),t.disposeIntermediateTensorInfo(h),d}if(o.dtype==="complex64"){const u=co({inputs:{input:o},backend:t}),h=Ns({inputs:{x:u},backend:t,attrs:{dtype:r}});return t.disposeIntermediateTensorInfo(u),h}if(!Np(o.dtype,r)){const u=Hn({inputs:{x:o},backend:t});return{dataId:u.dataId,shape:u.shape,dtype:r}}const i=t.data.get(o.dataId).values,[a,l,c]=g0(i,o.shape,o.dtype,r);return t.makeTensorInfo(a,l,c)}const cR={kernelName:fr,backendName:"cpu",kernelFunc:Ns};function pt(n,e,t,s){return t==null?({inputs:o,backend:r})=>{const{a:i,b:a}=o,l=r;ie([i,a],n);const c=l.data.get(i.dataId).values,u=l.data.get(a.dataId).values,h=i.dtype==="string"?ns(c):c,d=i.dtype==="string"?ns(u):u,p=s||i.dtype,[f,m]=e(i.shape,a.shape,h,d,p);return l.makeTensorInfo(m,p,f)}:({inputs:o,backend:r})=>{const{a:i,b:a}=o,l=r;if(i.dtype==="complex64"||a.dtype==="complex64"){const c=Ns({inputs:{x:i},backend:l,attrs:{dtype:"complex64"}}),u=l.data.get(c.dataId),h=u.complexTensorInfos.real,d=u.complexTensorInfos.imag,p=l.data.get(h.dataId).values,f=l.data.get(d.dataId).values,m=Ns({inputs:{x:a},backend:l,attrs:{dtype:"complex64"}}),g=l.data.get(m.dataId),x=g.complexTensorInfos.real,b=g.complexTensorInfos.imag,w=l.data.get(x.dataId).values,y=l.data.get(b.dataId).values,[C,$,N]=t(i.shape,a.shape,p,f,w,y),T=l.makeTensorInfo(N,"float32",C),S=l.makeTensorInfo(N,"float32",$),v=Kt({inputs:{real:T,imag:S},backend:l});return l.disposeIntermediateTensorInfo(c),l.disposeIntermediateTensorInfo(m),l.disposeIntermediateTensorInfo(T),l.disposeIntermediateTensorInfo(S),v}else{const c=l.data.get(i.dataId).values,u=l.data.get(a.dataId).values,h=s||i.dtype,[d,p]=e(i.shape,a.shape,c,u,h);return l.makeTensorInfo(p,h,d)}}}function Vd(n){return(e,t,s,o,r,i)=>{const a=xe(e,t),l=q(a),c=a.length,u=ce(a),h=vt("float32",l),d=vt("float32",l),p=Oo(e,a),f=Oo(t,a),m=ts(s,o),g=ts(r,i),x=e.length,b=ce(e),w=t.length,y=ce(t);if(p.length+f.length===0)for(let C=0;C<h.length;C++){const $=C%m.length,N=C%g.length,T=n(m[$*2],m[$*2+1],g[N*2],g[N*2+1]);h[C]=T.real,d[C]=T.imag}else for(let C=0;C<h.length;C++){const $=So(C,c,u),N=$.slice(-x);p.forEach(R=>N[R]=0);const T=Rn(N,x,b),S=$.slice(-w);f.forEach(R=>S[R]=0);const v=Rn(S,w,y),I=n(m[T*2],m[T*2+1],g[v*2],g[v*2+1]);h[C]=I.real,d[C]=I.imag}return[h,d,a]}}const x0=ot((n,e)=>n+e),uR=Vd((n,e,t,s)=>({real:n+t,imag:e+s})),qo=pt(No,x0,uR),hR={kernelName:No,backendName:"cpu",kernelFunc:qo};function Wd(n,e,t,s,o){const r=q(s),i=St(o,t);for(let a=0;a<n.length;a++){const l=n[a];if(l<0)throw new Error("Input x must be non-negative!");l>=o||(r>0?i[l]+=e[a]:i[l]+=1)}return i}function b0(n,e,t,s=!1){const o=n.shape[0],r=n.shape[1],i=Ie([o,t],e.dtype);for(let a=0;a<o;a++)for(let l=0;l<r;l++){const c=n.get(a,l);if(c<0)throw new Error("Input x must be non-negative!");c>=t||(s?i.set(1,a,c):e.size>0?i.set(i.get(a,c)+e.get(a,l),a,c):i.set(i.get(a,c)+1,a,c))}return i}const y0=ot((n,e)=>n&e),dR=pt(Xc,y0),pR={kernelName:Xc,backendName:"cpu",kernelFunc:dR};function qn(n){return(e,t,s)=>{const o=Qe(t,e.length);for(let r=0;r<e.length;++r)o[r]=n(e[r],s);return o}}function De(n,e,t){const s=qn(e);return Ts(n,s,t)}function Ts(n,e,t){return({inputs:s,attrs:o,backend:r})=>{const{x:i}=s;ie(i,n);const a=r,l=a.data.get(i.dataId).values;let c;if(i.dtype==="string"){if(!Array.isArray(l))throw new Error("String tensor's value was not an instance of Array");c=ns(l)}else c=l;const u=t||i.dtype,h=e(c,u,o);return a.makeTensorInfo(i.shape,u,h)}}const w0=qn(n=>Math.ceil(n)),fR=Ts(mr,w0),mR={kernelName:mr,backendName:"cpu",kernelFunc:fR};function C0(n,e,t,s){const o=Qe(t,q(e));if(s&&t!=="string"){let r=0;n.forEach(i=>{const a=q(i.shape);o.set(i.vals,r),r+=a})}else{let r=0;n.forEach(i=>{const a=t==="string"?ns(i.vals):i.vals;let l=0;for(let c=0;c<i.shape[0];++c){const u=c*e[1]+r;for(let h=0;h<i.shape[1];++h)o[u+h]=a[l++]}r+=i.shape[1]})}return o}const I0=ot((n,e)=>n===e?1:0),$0=pt(fa,I0,null,"bool"),gR={kernelName:fa,backendName:"cpu",kernelFunc:$0};const k0=qn(n=>Math.exp(n)),v0=Ts(Ir,k0,"float32"),xR={kernelName:Ir,backendName:"cpu",kernelFunc:v0};const S0=qn(n=>Math.expm1(n)),bR=Ts($r,S0),yR={kernelName:$r,backendName:"cpu",kernelFunc:bR};const N0=qn(n=>Math.floor(n)),wR=Ts(kr,N0),CR={kernelName:kr,backendName:"cpu",kernelFunc:wR};const T0=ot((n,e)=>Math.floor(n/e)),IR=pt(vr,T0,null,"int32"),$R={kernelName:vr,backendName:"cpu",kernelFunc:IR};function E0(n,e,t,s,o,r,i,a,l){const c=Ie([s,r],t);for(let u=0;u<s;u++){const h=[];let d=0;for(let p=0;p<o;p++){const f=n[u*o+p];d+=f*i[p],h.push(f)}if(d<0||d>=l/r)throw new Error(`Invalid indices: ${h} does not index into ${a}`);for(let p=0;p<r;p++)c.values[u*r+p]=e.get(...e.indexToLoc(d*r+p))}return c}function R0(n,e,t){const s=Ie(t,n.dtype);for(let o=0;o<s.size;++o){const i=s.indexToLoc(o).slice(),a=i[0],l=i[2],c=e.locToIndex([a,l]);i[2]=e.values[c];const u=n.locToIndex(i);0<=u&&u<n.values.length&&(s.values[o]=n.values[u])}return s}const A0=ot((n,e)=>n>e?1:0),kR=pt(ba,A0,null,"bool"),vR={kernelName:ba,backendName:"cpu",kernelFunc:kR};const D0=ot((n,e)=>n>=e?1:0),SR=pt(Sr,D0,null,"bool"),NR={kernelName:Sr,backendName:"cpu",kernelFunc:SR};const F0=ot((n,e)=>n<e?1:0),TR=pt(wa,F0,null,"bool"),ER={kernelName:wa,backendName:"cpu",kernelFunc:TR};const _0=ot((n,e)=>n<=e?1:0),RR=pt(Ca,_0,null,"bool"),AR={kernelName:Ca,backendName:"cpu",kernelFunc:RR};function O0(n,e,t){const s=(e-n)/(t-1),o=St(t,"float32");o[0]=n;for(let r=1;r<o.length;r++)o[r]=o[r-1]+s;return o}const L0=qn(n=>Math.log(n)),DR=Ts(Ar,L0),FR={kernelName:Ar,backendName:"cpu",kernelFunc:DR};function M0(n,e,t,s){const o=vt(s,q(t));for(let r=0;r<o.length;++r){const i=r*e;let a=n[i];for(let l=0;l<e;++l){const c=n[i+l];(Number.isNaN(c)||c>a)&&(a=c)}o[r]=a}return o}const P0=ot((n,e)=>Math.max(n,e)),_R=pt(Fr,P0),OR={kernelName:Fr,backendName:"cpu",kernelFunc:_R};const B0=ot((n,e)=>Math.min(n,e)),LR=pt(_r,B0),MR={kernelName:_r,backendName:"cpu",kernelFunc:LR};const Ud=ot((n,e)=>n*e),PR=Vd((n,e,t,s)=>({real:n*t-e*s,imag:n*s+e*t})),oc=pt(Lr,Ud,PR),BR={kernelName:Lr,backendName:"cpu",kernelFunc:oc};function z0(n,e,t){const s=cs(-1,t);return Ud([],e,s,n,t)}function zR(n){const{inputs:e,backend:t}=n,{x:s}=e;ie(s,"neg");const o=t.data.get(s.dataId).values,[r,i]=z0(o,s.shape,s.dtype);return t.makeTensorInfo(i,s.dtype,r)}const VR={kernelName:Da,backendName:"cpu",kernelFunc:zR};const V0=ot((n,e)=>n!==e?1:0),WR=pt(Fa,V0,null,"bool"),UR={kernelName:Fa,backendName:"cpu",kernelFunc:WR};function Gd(n,e,t,s,o){const r=e.length,i=q(e),a=ce(e),l=ce(o),c=vt(t,q(o));for(let u=0;u<i;++u){const h=So(u,r,a),d=new Array(h.length);for(let f=0;f<d.length;f++)d[f]=h[s[f]];const p=Rn(d,r,l);c[p]=n[u]}return c}function Ut(n){const{inputs:e,attrs:t,backend:s}=n,{x:o}=e,{perm:r}=t;ie(o,"transpose");const i=o.shape.length,a=new Array(i);for(let h=0;h<a.length;h++)a[h]=o.shape[r[h]];const l=s.data.get(o.dataId).values,c=Gd(l,o.shape,o.dtype,r,a);return{dataId:s.write(c,a,o.dtype),shape:a,dtype:o.dtype}}const GR={kernelName:To,backendName:"cpu",kernelFunc:Ut};function W0(n,e,t,s){const[o,r]=gt(n,s),i=Gt(e,"int32"),a=St(q(o),i),l=q(r);for(let c=0;c<a.length;++c){const u=c*l;let h=1;for(let d=0;d<l;++d)h*=t[u+d];a[c]=h}return{outVals:a,outShape:o,outDtype:i}}function HR(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{axis:r,keepDims:i}=s;ie(o,"prod");const a=o.shape.length,l=Ce(r,o.shape),c=je(l,a);let u=l,h=o;const d=[];c!=null&&(h=Ut({inputs:{x:o},backend:t,attrs:{perm:c}}),d.push(h),u=et(u.length,a));const p=t.data.get(h.dataId).values,{outVals:f,outShape:m,outDtype:g}=W0(h.shape,h.dtype,p,u);let x=m;return i&&(x=rt(m,l)),d.forEach(b=>t.disposeIntermediateTensorInfo(b)),t.makeTensorInfo(x,g,f)}const qR={kernelName:Ba,backendName:"cpu",kernelFunc:HR};function jR(n,e,t){n.forEach((s,o)=>{if(s<0||s>=t){const r=So(o,e.length,ce(e)).join(",");throw new Error(`indices[${r}] = ${s} is not in [0, ${t})`)}})}function KR(n,e){for(let t=0;t<n.length;++t){const s=n[t],o=t===n.length-1?e:n[t+1].length;if(s.length===0)throw new Error("Ragged splits may not be empty");if(s[0]<0)throw new Error("Ragged splits must be non-negative");if(s[s.length-1]>o)throw new Error("Ragged splits must not point past values");for(let r=1;r<s.length;++r)if(s[r-1]>s[r])throw new Error("Ragged splits must be sorted in ascending order")}}function XR(n,e,t,s){const o=[];let r=0;const i=e.length-1+t.length,a=new Array(i).fill(null).map(()=>[0]);KR(t,s);let l=1;for(let c=0;c<e.length-1;++c){l*=e[c];const u=e[c+1];for(let h=1;h<l+1;++h)a[c].push(h*u)}for(let c=0;c<n.length;++c){let u=n[c],h=n[c]+1;for(let d=0;d<t.length;++d){const p=t[d],f=d+e.length-1;if(f>=0){const m=a[f],g=m[m.length-1]-p[u];for(let x=u;x<h;++x)a[f].push(p[x+1]+g)}u=p[u],h=p[h]}h!==u&&(o.push([u,h]),r+=h-u)}return{outSplits:a,valueSlices:o,numValues:r}}function YR(n){const e=[];for(let t=0;t<n.length;++t){const s=n[t].length,o=Qe("int32",s);e.push(o),n[t].forEach((r,i)=>o[i]=r)}return e}function U0(n,e){const t=n.slice(0,e);for(;t.length<e;)t.push(1);for(let s=e;s<n.length;s++)t[e-1]*=n[s];return t}function ZR(n,e,t,s,o,r){const i=U0(e,2)[1],a=U0(r,2)[1];let l=0;for(const c of t)for(let u=c[0];u<c[1];++u){for(let h=0;h<s;++h)o[l*a+h]=n[u*i+h];++l}}function QR(n,e,t,s,o){const r=e.slice();r[0]=o;const i=Qe(t,q(r)),a=n.length,l=a===0?0:a/e[0];return ZR(n,e,s,l,i,r),[i,r]}function G0(n,e,t,s,o,r,i,a){if(n.length===0)throw new Error("paramsNestedSplits must be non empty");if(e[0].length===0)throw new Error("Split tensors must not be scalars");const l=e[0][0]-1;if(jR(r,i,l),s.length===0)throw new Error("params.rank must be nonzero");const c=s[0],{outSplits:u,valueSlices:h,numValues:d}=XR(r,i,n,c),p=YR(u),f=QR(t,s,o,h,d);return[p,f[0],f[1]]}const H0=2147483647;function q0(n,e,t,s,o,r,i){if(e.length>1)throw new Error("starts must be a scalar or vector");if(o.length>1)throw new Error("limits must be a scalar or vector");if(i.length>1)throw new Error("deltas must be a scalar or vector");const a=e.length===0,l=o.length===0,c=i.length===0,u=[];a||u.push(e[0]),l||u.push(o[0]),c||u.push(i[0]);for(let g=1;g<u.length;++g)if(u[g]!==u[g-1])throw new Error("starts, limits, and deltas must have the same shape");const h=u.length===0?1:u[0],d=Qe("int32",h+1);d[0]=0;for(let g=0;g<h;++g){const x=a?n[0]:n[g],b=l?s[0]:s[g],w=c?r[0]:r[g];if(w===0)throw new Error("Requires delta != 0");let y;if(w>0&&b<x||w<0&&b>x)y=0;else if(y=Math.ceil(Math.abs((b-x)/w)),y>H0)throw new Error(`Requires ((limit - start) / delta) <= ${H0}`);d[g+1]=d[g]+y}const p=d[h],f=Qe(t,p);let m=0;for(let g=0;g<h;++g){const x=d[g+1]-d[g];let b=a?n[0]:n[g];const w=c?r[0]:r[g];for(let y=0;y<x;++y)f[m++]=b,b+=w}return[d,f]}var hn=wn;class rc{constructor(e,t,s,o,r,i,a,l,c,u){this.shape=e,this.shapeShape=t,this.values=s,this.valuesShape=o,this.valuesDType=r,this.defaultValue=i,this.defaultValueShape=a,this.rowPartitionValues=l,this.rowPartitionValuesShapes=c,this.rowPartitionTypes=Ym(u),this.raggedRank=Zm(this.rowPartitionTypes)}getRowPartitionTypeByDimension(e){return this.rowPartitionTypes[0]===hn.FIRST_DIM_SIZE?this.rowPartitionTypes[e+1]:this.rowPartitionTypes[e]}getRowPartitionTensor(e){return this.rowPartitionTypes[0]===hn.FIRST_DIM_SIZE?this.rowPartitionValues[e+1]:this.rowPartitionValues[e]}getMaxWidth(e){const t=this.getRowPartitionTensor(e-1);switch(this.getRowPartitionTypeByDimension(e-1)){case hn.VALUE_ROWIDS:return rc.getMaxWidthValueRowID(t);case hn.ROW_SPLITS:return rc.getMaxWidthRowSplit(t);default:throw new Error(`Cannot handle partition type ${hn[this.getRowPartitionTypeByDimension(e-1)]}`)}}static getMaxWidthRowSplit(e){const t=e.length;if(t===0||t===1)return 0;let s=0;for(let o=0;o<t-1;++o){const r=e[o+1]-e[o];r>s&&(s=r)}return s}static getMaxWidthValueRowID(e){const t=e.length;if(t===0)return 0;let s=0,o=e[0],r=0;for(let i=1;i<t;++i){const a=e[i];a!==o&&(o=a,r=Math.max(i-s,r),s=i)}return Math.max(t-s,r)}tensorShapeFromTensor(e,t,s=!0){if(t.length===0){if(e[0]===-1)return[];throw new Error("The only valid scalar shape tensor is the fully unknown shape specified as -1.")}return K0(e,s)}calculateOutputSize(e){const t=this.valuesShape,s=this.defaultValueShape;Qm(s,t);const o=this.tensorShapeFromTensor(this.shape,this.shapeShape),i=Xm(this.raggedRank,o,t);i[0]<0&&(i[0]=e);for(let a=1;a<=this.raggedRank;++a)i[a]<0&&(i[a]=this.getMaxWidth(a));return i}calculateFirstParentOutputIndex(e,t,s){const o=Math.min(e,s),r=[];let i=0;for(let a=0;a<o;++a,i+=t)r.push(i);for(let a=o;a<e;++a)r.push(-1);return k(r.length===e,()=>"Final length of result must be equal to firstDimension."),r}calculateOutputIndexRowSplit(e,t,s,o){const r=e.length,i=[];for(let a=0;a<r-1;++a){const l=e[a+1]-e[a];let c=Math.min(o,l),u=t[a];u===-1&&(c=0);for(let h=0;h<c;++h)i.push(u),u+=s;for(let h=0;h<l-c;++h)i.push(-1)}if(r>0&&i.length!==e[r-1])throw new Error("Invalid row split size.");return i}calculateOutputIndexValueRowID(e,t,s,o){const r=e.length,i=[];if(r===0)return[];let a=0,l=e[0];if(l>=t.length)throw new Error(`Got currentValueRowId=${l}, which is not less than ${t.length}`);let c=t[l];i.push(c);for(let u=1;u<r;++u){const h=e[u];if(h===l)c>=0&&(++a,a<o?c+=s:c=-1);else{if(a=0,l=h,h>=t.length)throw new Error(`Got nextValueRowId=${h} which is not less than ${t.length}`);c=t[h]}i.push(c)}if(i.length!==e.length)throw new Error("Invalid row ids.");return i}calculateOutputIndex(e,t,s,o){const r=this.getRowPartitionTensor(e),i=this.getRowPartitionTypeByDimension(e);switch(i){case hn.VALUE_ROWIDS:return this.calculateOutputIndexValueRowID(r,t,s,o);case hn.ROW_SPLITS:if(r.length-1>t.length)throw new Error(`Row partition size is greater than output size: ${r.length-1} > ${t.length}`);return this.calculateOutputIndexRowSplit(r,t,s,o);default:throw new Error(`Unsupported partition type: ${hn[i]}`)}}getFirstDimensionSize(){const e=this.rowPartitionValues[0];if(this.rowPartitionTypes.length===0)throw new Error("No row_partition_types given.");const t=this.rowPartitionTypes[0];switch(t){case hn.FIRST_DIM_SIZE:return e[0];case hn.VALUE_ROWIDS:throw new Error("Cannot handle VALUE_ROWIDS in first dimension.");case hn.ROW_SPLITS:return this.rowPartitionValuesShapes[0][0]-1;default:throw new Error(`Cannot handle type ${hn[t]}`)}}compute(){if(this.rowPartitionValues[0].length<=0)throw new Error("Invalid first partition input. Tensor requires at least one element.");const t=this.getFirstDimensionSize(),s=this.calculateOutputSize(t),o=new Array(this.raggedRank+1);o[o.length-1]=1;for(let l=o.length-2;l>=0;--l)o[l]=o[l+1]*s[l+1];const r=K0(s,!1),i=Qe(this.valuesDType,q(r));if(o[0]*s[0]>0){let l=this.calculateFirstParentOutputIndex(t,o[0],s[0]);for(let c=1;c<=this.raggedRank;++c)l=this.calculateOutputIndex(c-1,l,o[c],s[c]);this.setOutput(this.raggedRank,l,i,r)}return[r,i]}setOutput(e,t,s,o){if(s.length===0)return;const r=this.values,i=s;let a=o.slice();a=a.slice(e+1);const l=q(a),c=t.length;let u=this.defaultValue;if(u.length!==l&&u.length!==1){const f=this.defaultValueShape;B(()=>{const m=M(u,f);u=ci(m,a).dataSync()})}let h=0,d=0,p=0;for(let f=0;f<=c;++f){let m=f<c?t[f]:-1;if(m===p){++p;continue}if(d<p){const g=r.subarray(h*l),x=i.subarray(d*l),b=(p-d)*l;j0(x,g,b)}if(f>=c){const g=s.length;m=Math.floor(g/l)}if(m>p)if(this.defaultValue.length===1)i.subarray(p*l,m*l).fill(this.defaultValue[0]),p=m;else for(;m>p;){const g=i.slice(p*l);j0(g,u,l),++p}m<0?(h=f+1,d=p):(h=f,d=p,p=d+1)}}}function j0(n,e,t){for(let s=0;s<t;s++)n[s]=e[s]}function K0(n,e){const t=[];for(let s of n){if(s<0){if(!e)throw new Error(`Dimension ${s} must be >= 0`);if(s<-1)throw new Error(`Dimension ${s} must be >= -1`);s=-1}t.push(s)}return t}function X0(n,e,t,s,o,r,i,a,l,c){return new rc(n,e,t,s,o,r,i,a,l,c).compute()}function Y0(n,e,t,s){const o=n===e,r=n<e&&t<0,i=e<n&&t>1;if(o||r||i)return St(0,s);const a=Math.abs(Math.ceil((e-n)/t)),l=St(a,s);e<n&&t===1&&(t=-1),l[0]=n;for(let c=1;c<l.length;c++)l[c]=l[c-1]+t;return l}const Z0=qn(n=>1/Math.sqrt(n)),JR=Ts(Wr,Z0),eA={kernelName:Wr,backendName:"cpu",kernelFunc:JR};function uo(n,e,t,s,o,r,i,a,l,c){const u=[s/o,o],h=n.values,d=e.values;if(s===0)return Ie(t,e.dtype);const p=l instanceof bt?l:Ie(u,e.dtype);typeof l=="string"||typeof l=="number"?p.values.fill(l):typeof l=="boolean"&&p.values.fill(+l);for(let f=0;f<r;f++){const m=[];let g=0;for(let x=0;x<i;x++){const b=h[f*i+x];m.push(b),g+=b*a[x]}if(g<0||g>=s/o)throw new Error(`Invalid indices: ${m} does not index into ${t}`);for(let x=0;x<o;x++)c?p.values[g*o+x]+=d[f*o+x]:p.values[g*o+x]=e.rank===0?d[0]:d[f*o+x]}return p}const tA=qn(n=>1/(1+Math.exp(-n))),Q0=De(jr,n=>1/(1+Math.exp(-n))),nA={kernelName:jr,backendName:"cpu",kernelFunc:Q0};function J0(n,e,t,s,o){const r=_h(s,e,t),i=q(t),a=ce(s);if(r){const h=Oh(e,a);return o==="string"?n.slice(h,h+i):n.subarray(h,h+i)}const l=o==="string"?ns(n):n,c=Ie(s,o,l),u=Ie(t,o);for(let h=0;h<u.size;++h){const d=u.indexToLoc(h),p=d.map((f,m)=>f+e[m]);u.set(c.get(...p),...d)}return o==="string"?wg(u.values):u.values}function ho(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{begin:r,size:i}=s;ie(o,"slice");const[a,l]=Tl(o,r,i);Dh(o,a,l);const c=t.data.get(o.dataId).values,u=J0(c,a,l,o.shape,o.dtype);return t.makeTensorInfo(l,o.dtype,u)}const sA={kernelName:Ha,backendName:"cpu",kernelFunc:ho};function e1(n,e,t,s,o,r,i){const a=e[0],l=r[0],c=new Array(l),u=new Array(a),h=e[1];if(l===0){if(a!==0)throw new Error(ag(a));const g=Qe(t,0),x=Qe(o,0);return[g,[0,h],x,c,u]}let d=!0,p=0;const f=new Array(l).fill(0);for(let g=0;g<a;++g){const x=n[g*h];if(x<0)throw new Error(lg(g,x));if(x>=l)throw new Error(cg(g,x,l));++f[x],d=d&&x>=p,p=x}let m=!0;for(let g=0;g<l;++g){const x=f[g]===0;c[g]=x,m=m&&!x,f[g]=Math.max(f[g],1),g>0&&(f[g]+=f[g-1])}if(m&&d){const g=n,x=s;for(let b=0;b<a;++b)u[b]=b;return[g,[a,h],x,c,u]}else{const g=f[l-1],x=Qe(t,g*h),b=Qe(o,g),w=new Array(l).fill(0);for(let y=0;y<a;++y){const C=n[y*h],$=w[C],N=(C===0?0:f[C-1])+$;w[C]++;for(let T=0;T<h;++T)x[N*h+T]=n[y*h+T];b[N]=s[y],u[y]=N}for(let y=0;y<l;++y)if(w[y]===0){const $=y===0?0:f[y-1];x[$*h+0]=y;for(let N=1;N<h;++N)x[$*h+N]=0;b[$]=i}return[x,[g,h],b,c,u]}}function t1(n,e,t,s,o){const r=q(s),i=e[0],a=o.length,l=[];let c=1,u=-1;for(let g=0;g<a;++g){const x=o[g];if(x===-1){if(u!==-1)throw new Error(ug(u,g));u=g,l.push(1)}else{if(x<0)throw new Error(hg(g,x));c*=x,l.push(x)}}if(u!==-1){if(c<=0)throw new Error(dg());const g=Math.trunc(r/c);if(c*g!==r)throw new Error(pg(s,l));l[u]=g}if(q(l)!==r)throw new Error(fg(s,l));const d=s.length,p=[];if(d>0){p[d-1]=1;for(let g=d-2;g>=0;--g)p[g]=p[g+1]*s[g+1]}const f=[];if(a>0){f[a-1]=1;for(let g=a-2;g>=0;--g)f[g]=f[g+1]*l[g+1]}const m=Qe(t,i*a);for(let g=0;g<i;++g){let x=0;for(let b=0;b<d;++b)x+=n[g*d+b]*p[b];for(let b=0;b<a;++b)m[g*a+b]=Math.trunc(x/f[b]),x%=f[b]}return[m,[i,a],l]}function Hd(n,e,t,s,o,r=!1,i=0){const a=s.length,l=[e[0],n.length/e[0]],c=l[1],h=a>0?o[a-1]+1:0;if(h<0)throw new Error(nd());const d=e.slice();d[0]=h;const p=d.reduce((w,y)=>w*y,1),f=Qe(t,p);if(a===0)return h>0&&f.fill(i),[f,d];if(h<=0)throw new Error(nd());let m=0,g=1,x=0,b=o[m];for(;;){let w=0;if(g<a){if(w=o[g],b===w){++g;continue}if(b>=w)throw new Error(mg())}if(b<0||b>=h)throw new Error(gg(b,h));b>x&&f.fill(i,x*c,b*c);for(let y=m;y<g;++y){const C=s[y];if(C<0||C>=l[0])throw new Error(xg(y,s[y],l[0]));for(let $=0;$<c;$++)f[b*c+$]+=n[C*c+$]}if(r)for(let y=0;y<c;y++)f[b*c+y]/=g-m;if(m=g,++g,x=b+1,b=w,g>a)break}return x<h&&f.fill(i,x*c,h*c),[f,d]}const oA=qn(n=>Math.sqrt(n)),rA=De(Xr,n=>Math.sqrt(n)),iA={kernelName:Xr,backendName:"cpu",kernelFunc:rA};const n1=ot((n,e)=>{const t=n-e;return t*t}),aA=pt(Yr,n1),lA={kernelName:Yr,backendName:"cpu",kernelFunc:aA};const s1=qn((n,e)=>{const{pattern:t,replaceGlobal:s,rewrite:o}=e;return n.replace(new RegExp(t,s?"g":""),o)}),cA=Ts(Su,s1),uA={kernelName:Su,backendName:"cpu",kernelFunc:cA};function o1(n,e,t,s){const o=Ie(n,e.dtype);for(let r=0;r<o.size;r++){const i=o.indexToLoc(r),a=new Array(i.length);for(let l=0;l<a.length;l++)a[l]=i[l]*t[l]+s[l];o.set(e.get(...a),...i)}return o}class hA{constructor(e,t,s,o,r,i){this.separator=us(e),this.nGramWidths=t,this.leftPad=us(s),this.rightPad=us(o),this.padWidth=r,this.preserveShort=i}getPadWidth(e){return Math.min(this.padWidth<0?e-1:this.padWidth,e-1)}getNumNGrams(e,t){const s=this.getPadWidth(t);return Math.max(0,e+2*s-t+1)}createNGrams(e,t,s,o,r,i){for(let a=0;a<r;++a){const l=this.getPadWidth(i),c=Math.max(0,l-a),u=Math.max(0,l-(r-(a+1))),h=i-(c+u),d=t+(c>0?0:a-l);let p=0;p+=c*this.leftPad.length;for(let b=0;b<h;++b)p+=e[d+b].length;p+=u*this.rightPad.length;const f=c+u+h-1;p+=f*this.separator.length,s[o+a]=new Uint8Array(p);const m=s[o+a];let g=0;const x=b=>b.forEach(w=>m[g++]=w);for(let b=0;b<c;++b)x(this.leftPad),x(this.separator);for(let b=0;b<h-1;++b)x(e[d+b]),x(this.separator);if(h>0){x(e[d+h-1]);for(let b=0;b<u;++b)x(this.separator),x(this.rightPad)}else{for(let b=0;b<u-1;++b)x(this.rightPad),x(this.separator);x(this.rightPad)}}}compute(e,t){const s=e.length,o=t.length;if(o>0){let l=t[0];if(l!==0)throw new Error(`First split value must be 0, got ${l}`);for(let c=1;c<o;++c){let u=t[c]>=l;if(u=u&&t[c]<=s,!u)throw new Error(`Invalid split value ${t[c]}, must be in [${l}, ${s}]`);l=t[c]}if(l!==s)throw new Error(`Last split value must be data size. Expected ${s}, got ${l}`)}const r=o-1,i=Qe("int32",o);if(s===0||o===0){const l=new Array(s);for(let c=0;c<=r;++c)i[c]=0;return[l,i]}i[0]=0;for(let l=1;l<=r;++l){const c=t[l]-t[l-1];let u=0;this.nGramWidths.forEach(h=>{u+=this.getNumNGrams(c,h)}),this.preserveShort&&c>0&&u===0&&(u=1),i[l]=i[l-1]+u}const a=new Array(i[r]);for(let l=0;l<r;++l){const c=t[l];let u=i[l];if(this.nGramWidths.forEach(h=>{const d=t[l+1]-t[l],p=this.getNumNGrams(d,h);this.createNGrams(e,c,a,u,p,h),u+=p}),this.preserveShort&&u===i[l]){const h=t[l+1]-t[l];if(h===0)continue;const d=h+2*this.padWidth;this.createNGrams(e,c,a,u,1,d)}}return[a,i]}}function r1(n,e,t,s,o,r,i,a){return new hA(t,s,o,r,i,a).compute(n,e)}function dA(n,e,t,s){if(!n.length)return;if(e.length===0){for(let r=0;r<n.length;++r)s.push(n.subarray(r,r+1));return}if(e.length===1){const r=e[0];let i=n.indexOf(r);for(;i!==-1;){const a=n.subarray(0,i);(!t||a.length!==0)&&s.push(a),n=n.subarray(i+1),i=n.indexOf(r)}(!t||n.length!==0)&&s.push(n);return}let o=0;for(let r=0;r<n.length+1;r++)if(r===n.length||e.indexOf(n[r])!==-1){const i=n.subarray(o,r);(!t||i.length!==0)&&s.push(i),o=r+1}}function i1(n,e,t){const s=n.length,o=[];let r=0,i=0;const a=new Array(s);for(let d=0;d<s;++d){const p=o.length;dA(n[d],e,t,o);const f=o.length-p;a[d]=f,r+=f,i=Math.max(i,f)}const l=Qe("int32",r*2),c=new Array(r),u=[s,i];let h=0;for(let d=0;d<s;++d)for(let p=0;p<a[d];++p)l[h*2]=d,l[h*2+1]=p,c[h]=o[h],++h;return[l,c,u]}function a1(n,e){const t=Qe("int32",n.length);for(let s=0;s<n.length;++s)t[s]=Ew(n[s]).modulo(e).getLowBitsUnsigned();return t}const l1=ot((n,e)=>n-e),pA=Vd((n,e,t,s)=>({real:n-t,imag:e-s})),qd=pt(Zr,l1,pA),fA={kernelName:Zr,backendName:"cpu",kernelFunc:qd};function c1(n,e){const t=new Array(n.rank);for(let o=0;o<t.length;o++)t[o]=n.shape[o]*e[o];const s=Ie(t,n.dtype);for(let o=0;o<s.values.length;++o){const r=s.indexToLoc(o),i=new Array(n.rank);for(let l=0;l<i.length;l++)i[l]=r[l]%n.shape[l];const a=n.locToIndex(i);s.values[o]=n.values[a]}return s}const Mi=(n,e)=>{const t=e.value-n.value;return t===0?n.index-e.index:t};function u1(n,e,t=0,s=n.length-1){for(;s>t;){if(s-t>600){const a=s-t+1,l=e-t+1,c=Math.log(a),u=.5*Math.exp(2*c/3),h=.5*Math.sqrt(c*u*(a-u)/a)*Math.sign(l-a/2),d=Math.max(t,Math.floor(e-l*u/a+h)),p=Math.min(s,Math.floor(e+(a-l)*u/a+h));u1(n,e,d,p)}const o=n[e];let r=t,i=s;for(En(n,t,e),Mi(n[s],o)>0&&En(n,t,s);r<i;){for(En(n,r,i),r++,i--;Mi(n[r],o)<0;)r=r+1;for(;Mi(n[i],o)>0;)i=i-1}Mi(n[t],o)===0?En(n,t,i):(i=i+1,En(n,i,s)),i<=e&&(t=i+1),e<=i&&(s=i-1)}}function h1(n,e,t,s,o){const r=e[e.length-1],[i,a]=[n.length/r,r],l=vt(t,i*s),c=vt("int32",i*s);for(let h=0;h<i;h++){const d=h*a,p=n.subarray(d,d+a);let f=new Array(p.length);p.forEach((b,w)=>f[w]={value:b,index:w}),s<f.length&&(u1(f,s),f=f.slice(0,s)),o&&f.sort(Mi);const m=h*s,g=l.subarray(m,m+s),x=c.subarray(m,m+s);for(let b=0;b<s;b++)g[b]=f[b].value,x[b]=f[b].index}const u=e.slice();return u[u.length-1]=s,[Ie(u,t,l),Ie(u,"int32",c)]}function d1(n,e,t,s){const o=Ce(e,t)[0],r=[1,t[0],1];for(let f=0;f<o;f++)r[0]*=t[f];r[1]=t[o];for(let f=o+1;f<t.length;f++)r[2]*=t[f];const i=new Map,a=new Int32Array(t[o]),l=new bt(r,s,n),c=[],u=r[0]===1&&r[2]===1;for(let f=0;f<t[o];f++){let m;if(u)m=n[f].toString();else{const x=[];for(let b=0;b<r[0];b++)for(let w=0;w<r[2];w++)x.push(l.get(b,f,w));m=x.join(",")}const g=i.get(m);if(g!=null)a[f]=g;else{const x=i.size;i.set(m,x),a[f]=x,c.push(f)}}const h=r.slice();h[1]=i.size;const d=new bt(h,s);c.forEach((f,m)=>{for(let g=0;g<r[0];g++)for(let x=0;x<r[2];x++)d.set(l.get(g,f,x),g,m,x)});const p=t.slice();return p[o]=h[1],{outputValues:d.values,outputShape:p,indices:a}}var mA=Object.freeze({__proto__:null,addImpl:x0,bincountImpl:Wd,bincountReduceImpl:b0,bitwiseAndImpl:y0,castImpl:g0,ceilImpl:w0,concatImpl:C0,equalImpl:I0,expImpl:k0,expm1Impl:S0,floorDivImpl:T0,floorImpl:N0,gatherNdImpl:E0,gatherV2Impl:R0,greaterEqualImpl:D0,greaterImpl:A0,lessEqualImpl:_0,lessImpl:F0,linSpaceImpl:O0,logImpl:L0,maxImpl:M0,maximumImpl:P0,minimumImpl:B0,multiplyImpl:Ud,negImpl:z0,notEqualImpl:V0,prodImpl:W0,raggedGatherImpl:G0,raggedRangeImpl:q0,raggedTensorToTensorImpl:X0,rangeImpl:Y0,rsqrtImpl:Z0,scatterImpl:uo,sigmoidImpl:tA,simpleAbsImpl:m0,sliceImpl:J0,sparseFillEmptyRowsImpl:e1,sparseReshapeImpl:t1,sparseSegmentReductionImpl:Hd,sqrtImpl:oA,squaredDifferenceImpl:n1,staticRegexReplaceImpl:s1,stridedSliceImpl:o1,stringNGramsImpl:r1,stringSplitImpl:i1,stringToHashBucketFastImpl:a1,subImpl:l1,tileImpl:c1,topKImpl:h1,transposeImpl:Gd,uniqueImpl:d1});Tf("cpu",()=>new nc,1);const p1=De(wr,n=>n>=0?n:Math.exp(n)-1),gA={kernelName:wr,backendName:"cpu",kernelFunc:p1};function f1(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{alpha:r}=s;ie([o],"leakyRelu");const i=q(o.shape),a=t.data.get(o.dataId).values,l=vt("float32",i);for(let c=0;c<a.length;c++)l[c]=a[c]<0?r*a[c]:a[c];return t.makeTensorInfo(o.shape,"float32",l)}const xA={kernelName:ya,backendName:"cpu",kernelFunc:f1};const bA=ot((n,e)=>n<0?e*n:n);function m1(n){const{inputs:e,backend:t}=n,{x:s,alpha:o}=e;ie([s,o],"prelu");const r=t.data.get(s.dataId).values,i=t.data.get(o.dataId).values,[a,l]=bA(s.shape,o.shape,r,i,"float32");return t.makeTensorInfo(l,"float32",a)}const yA={kernelName:Pa,backendName:"cpu",kernelFunc:m1};const g1=De(Br,n=>Math.max(0,n)),wA={kernelName:Br,backendName:"cpu",kernelFunc:g1};const x1=De(zr,n=>Math.min(Math.max(0,n),6)),CA={kernelName:zr,backendName:"cpu",kernelFunc:x1};function ic(n,e,t,s,o){if(t==="linear")return Hn({inputs:{x:e},backend:n});if(t==="relu")return g1({inputs:{x:e},backend:n});if(t==="elu")return p1({inputs:{x:e},backend:n});if(t==="relu6")return x1({inputs:{x:e},backend:n});if(t==="prelu")return m1({inputs:{x:e,alpha:s},backend:n});if(t==="leakyrelu")return f1({inputs:{x:e},backend:n,attrs:{alpha:o}});if(t==="sigmoid")return Q0({inputs:{x:e},backend:n});throw new Error(`Activation ${t} has not been implemented for the CPU backend.`)}function ze(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{shape:r}=s,i=q(o.shape),a=Sp(r,i),l=q(a);k(i===l,()=>`The new shape (${a}) has ${l} elements and the old shape (${o.shape}) has ${i} elements. The new shape and old shape must have the same number of elements.`),t.incRef(o.dataId);const c=t.data.get(o.dataId);if(c.complexTensorInfos!=null){const u=c.complexTensorInfos.real,h=c.complexTensorInfos.imag;u.shape=a,h.shape=a}return{dataId:o.dataId,shape:a,dtype:o.dtype}}const IA={kernelName:za,backendName:"cpu",kernelFunc:ze};function b1(n){const{inputs:e,backend:t,attrs:s}=n,{a:o,b:r}=e,{transposeA:i,transposeB:a}=s;ie([o,r],"matMul");const l=o.shape.length,c=r.shape.length,u=i?o.shape[l-2]:o.shape[l-1],h=a?r.shape[c-1]:r.shape[c-2],d=i?o.shape[l-1]:o.shape[l-2],p=a?r.shape[c-2]:r.shape[c-1],f=o.shape.slice(0,-2),m=r.shape.slice(0,-2),g=q(f),x=q(m),w=xe(o.shape.slice(0,-2),r.shape.slice(0,-2)).concat([d,p]);k(u===h,()=>`Error in matMul: inner shapes (${u}) and (${h}) of Tensors with shapes ${o.shape} and ${r.shape} and transposeA=${i} and transposeB=${a} must match.`);const y=i?[g,u,d]:[g,d,u],C=a?[x,p,h]:[x,h,p],$=ze({inputs:{x:o},backend:t,attrs:{shape:y}}),N=ze({inputs:{x:r},backend:t,attrs:{shape:C}}),T=i?$.shape[1]:$.shape[2],S=i?$.shape[2]:$.shape[1],v=a?N.shape[1]:N.shape[2],I=Math.max(g,x),R=t.data.get($.dataId).values,F=t.data.get(N.dataId).values,O=ce($.shape),L=ce(N.shape),[z,U,W]=i?[O[0],1,O[1]]:[O[0],O[1],1],[G,K,Z]=a?[1,L[1],L[0]]:[L[1],1,L[0]],j=S*v,X=Ie([I,S,v],$.dtype),te=X.values,J=t.blockSize;for(let se=0;se<I;se++){const le=se%g,fe=se%x;for(let de=0;de<S;de+=J){const ye=Math.min(de+J,S);for(let we=0;we<v;we+=J){const _e=Math.min(we+J,v);for(let Ve=0;Ve<T;Ve+=J){const Ze=Math.min(Ve+J,T);for(let We=de;We<ye;We++)for(let Le=we;Le<_e;Le++){let Xe=0;for(let qe=Ve;qe<Ze;qe++){const rs=R[le*z+We*U+qe*W],kt=F[qe*G+Le*K+fe*Z];Xe+=rs*kt}te[se*j+(We*v+Le)]+=Xe}}}}}return t.disposeIntermediateTensorInfo($),t.disposeIntermediateTensorInfo(N),t.makeTensorInfo(w,X.dtype,X.values)}const $A={kernelName:oa,backendName:"cpu",kernelFunc:b1};function kA(n){const{inputs:e,backend:t,attrs:s}=n,{a:o,b:r,bias:i,preluActivationWeights:a}=e,{transposeA:l,transposeB:c,activation:u,leakyreluAlpha:h}=s;let d,p,f;const m=[];d=b1({inputs:{a:o,b:r},attrs:{transposeA:l,transposeB:c},backend:t}),i&&(p=qo({inputs:{a:d,b:i},backend:t}),m.push(d),d=p),u&&(f=ic(t,d,u,a,h),m.push(d),d=f);for(const x of m)t.disposeIntermediateTensorInfo(x);return d}const vA={kernelName:Ja,backendName:"cpu",kernelFunc:kA};const SA=De(ar,n=>Math.acos(n)),NA={kernelName:ar,backendName:"cpu",kernelFunc:SA};const TA=De(lr,n=>Math.acosh(n)),EA={kernelName:lr,backendName:"cpu",kernelFunc:TA};function RA(n){const{inputs:e,backend:t}=n,s=e;ie(e,"addN");const o=s.map(a=>t.data.get(a.dataId).values),r=Ie(s[0].shape,s[0].dtype),i=r.values;for(let a=0;a<s.length;a++){const l=o[a];for(let c=0;c<i.length;c++)i[c]+=l[c]}return t.makeTensorInfo(r.shape,r.dtype,r.values)}const AA={kernelName:Uc,backendName:"cpu",kernelFunc:RA};function DA(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{axis:r,keepDims:i}=s;ie(o,"all");const a=Ce(r,o.shape);let l=a;const c=je(l,o.shape.length);let u=o;c!=null&&(u=Ut({inputs:{x:o},backend:t,attrs:{perm:c}}),l=et(l.length,o.shape.length)),Ct("all",l,u.shape.length);const[h,d]=gt(u.shape,l),p=q(d),f=St(q(h),u.dtype),m=t.data.get(u.dataId).values;for(let x=0;x<f.length;++x){const b=x*p;let w=m[b];for(let y=0;y<p;++y){const C=m[b+y];w=w&&C}f[x]=w}c!=null&&t.disposeIntermediateTensorInfo(u);const g=t.makeTensorInfo(h,u.dtype,f);if(i){const x=rt(h,a),b=ze({inputs:{x:g},backend:t,attrs:{shape:x}});return t.disposeIntermediateTensorInfo(g),b}return g}const FA={kernelName:Gc,backendName:"cpu",kernelFunc:DA};function _A(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{axis:r,keepDims:i}=s;ie(o,"any");const a=Ce(r,o.shape);let l=a;const c=je(l,o.shape.length);let u=o;c!=null&&(u=Ut({inputs:{x:o},backend:t,attrs:{perm:c}}),l=et(l.length,o.shape.length)),Ct("any",l,u.shape.length);const[h,d]=gt(u.shape,l),p=q(d),f=St(q(h),u.dtype),m=t.data.get(u.dataId).values;for(let x=0;x<f.length;++x){const b=x*p;let w=m[b];for(let y=0;y<p;++y){const C=m[b+y];w=w||C}f[x]=w}c!=null&&t.disposeIntermediateTensorInfo(u);const g=t.makeTensorInfo(h,u.dtype,f);if(i){const x=rt(h,a),b=ze({inputs:{x:g},backend:t,attrs:{shape:x}});return t.disposeIntermediateTensorInfo(g),b}return g}const OA={kernelName:Hc,backendName:"cpu",kernelFunc:_A};function LA(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{axis:r}=s;ie(o,"argMax");let i=Ce(r,o.shape);const a=je(i,o.shape.length);let l=o;const c=[];a!=null&&(l=Ut({inputs:{x:o},backend:t,attrs:{perm:a}}),c.push(l),i=et(i.length,l.shape.length)),i=[i[0]],Ct("argMax",i,l.shape.length);const[u,h]=gt(l.shape,i),d=q(u),p=St(d,"int32"),f=q(h),m=t.data.get(l.dataId).values;for(let g=0;g<p.length;++g){const x=g*f;let b=m[x],w=0;for(let y=0;y<f;++y){const C=m[x+y];C>b&&(b=C,w=y)}p[g]=w}return c.forEach(g=>t.disposeIntermediateTensorInfo(g)),t.makeTensorInfo(u,"int32",p)}const MA={kernelName:ea,backendName:"cpu",kernelFunc:LA};function PA(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{axis:r}=s;ie(o,"argMin");let i=Ce(r,o.shape);const a=je(i,o.shape.length);let l=o;const c=[];a!=null&&(l=Ut({inputs:{x:o},backend:t,attrs:{perm:a}}),c.push(l),i=et(i.length,l.shape.length)),i=[i[0]],Ct("argMin",i,l.shape.length);const[u,h]=gt(l.shape,i),d=q(u),p=St(d,"int32"),f=q(h),m=t.data.get(l.dataId).values;for(let g=0;g<p.length;++g){const x=g*f;let b=m[x],w=0;for(let y=0;y<f;++y){const C=m[x+y];C<b&&(b=C,w=y)}p[g]=w}return c.forEach(g=>t.disposeIntermediateTensorInfo(g)),t.makeTensorInfo(u,"int32",p)}const BA={kernelName:ta,backendName:"cpu",kernelFunc:PA};const zA=De(cr,n=>Math.asin(n)),VA={kernelName:cr,backendName:"cpu",kernelFunc:zA};const WA=De(ur,n=>Math.asinh(n)),UA={kernelName:ur,backendName:"cpu",kernelFunc:WA};const GA=De(hr,n=>Math.atan(n)),HA={kernelName:hr,backendName:"cpu",kernelFunc:GA};const qA=ot((n,e)=>Math.atan2(n,e)),jA=pt(pr,qA),KA={kernelName:pr,backendName:"cpu",kernelFunc:jA};const XA=De(dr,n=>Math.atanh(n)),YA={kernelName:dr,backendName:"cpu",kernelFunc:XA};function jd(n,e,t,s,o,r){const i=o.strideHeight,a=o.strideWidth,l=o.dilationHeight,c=o.dilationWidth,u=o.effectiveFilterHeight,h=o.effectiveFilterWidth,d=o.padInfo.top,p=o.padInfo.left,f=r==="max"?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY,m=Ie(o.outShape,t),g=m.values,x=o.outShape[1]*o.outShape[2]*o.outShape[3],b=o.outShape[2]*o.outShape[3],w=o.outShape[3];for(let y=0;y<o.batchSize;++y){const C=y*x,$=y*s[0];for(let N=0;N<o.inChannels;++N)for(let T=0;T<o.outHeight;++T){const S=T*i-d,v=Math.max(0,S),I=Math.min(o.inHeight,u+S),R=C+T*b;for(let F=0;F<o.outWidth;++F){const O=F*a-p,L=Math.max(0,O),z=Math.min(o.inWidth,h+O);let U=f,W=0,G=0;for(let Z=v;Z<I;Z+=l){const j=$+Z*s[1];for(let X=L;X<z;X+=c){const te=j+X*s[2],J=n[te+N];r==="max"&&J>U?U=J:r==="avg"&&(W+=J,G++)}if(isNaN(U))break}const K=R+F*w+N;g[K]=r==="avg"?W/G:U}}}return m}function y1(n,e,t,s,o=!1,r=!1){const i=Ie(s.outShape,"int32"),a=s.strideHeight,l=s.strideWidth,c=s.dilationHeight,u=s.dilationWidth,h=s.effectiveFilterHeight,d=s.effectiveFilterWidth,p=s.padInfo.top,f=s.padInfo.left,m=Ie(e,t,n);for(let g=0;g<s.batchSize;++g)for(let x=0;x<s.inChannels;++x)for(let b=0;b<s.outHeight;++b){const w=b*a-p;let y=w;for(;y<0;)y+=c;const C=Math.min(s.inHeight,h+w);for(let $=0;$<s.outWidth;++$){const N=$*l-f;let T=N;for(;T<0;)T+=u;const S=Math.min(s.inWidth,d+N);let v=Number.NEGATIVE_INFINITY,I=-1;for(let R=y;R<C;R+=c){const F=R-w;for(let O=T;O<S;O+=u){const L=O-N,z=m.get(g,R,O,x);z>v&&(v=z,o?I=r?((g*s.inHeight+R)*s.inWidth+O)*s.inChannels+x:(R*s.inWidth+O)*s.inChannels+x:I=F*d+L)}}i.set(I,g,b,$,x)}}return i}function w1(n,e,t,s,o,r){const i=o.strideDepth,a=o.strideHeight,l=o.strideWidth,c=o.dilationDepth,u=o.dilationHeight,h=o.dilationWidth,d=o.effectiveFilterDepth,p=o.effectiveFilterHeight,f=o.effectiveFilterWidth,m=o.padInfo.front,g=o.padInfo.top,x=o.padInfo.left,b=r==="max"?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY,w=Ie(o.outShape,t),y=w.values,C=o.outShape[1]*o.outShape[2]*o.outShape[3]*o.outShape[4],$=o.outShape[2]*o.outShape[3]*o.outShape[4],N=o.outShape[3]*o.outShape[4],T=o.outShape[4];for(let S=0;S<o.batchSize;++S){const v=S*C,I=S*s[0];for(let R=0;R<o.inChannels;++R)for(let F=0;F<o.outDepth;++F){const O=F*i-m;let L=O;for(;L<0;)L+=c;const z=Math.min(o.inDepth,d+O),U=v+F*$;for(let W=0;W<o.outHeight;++W){const G=W*a-g;let K=G;for(;K<0;)K+=u;const Z=Math.min(o.inHeight,p+G),j=U+W*N;for(let X=0;X<o.outWidth;++X){const te=X*l-x;let J=te;for(;J<0;)J+=h;const se=Math.min(o.inWidth,f+te),le=j+X*T;let fe=b,de=0,ye=0;for(let _e=L;_e<z;_e+=c){const Ve=I+_e*s[1];for(let Ze=K;Ze<Z;Ze+=u){const We=Ve+Ze*s[2];for(let Le=J;Le<se;Le+=h){const Xe=We+Le*s[3],qe=n[Xe+R];if(r==="max"&&qe>fe?fe=qe:r==="avg"&&(de+=qe,ye++),isNaN(fe))break}if(isNaN(fe))break}if(isNaN(fe))break}const we=le+R;y[we]=r==="avg"?de/Math.max(ye,1):fe}}}}return w}function ZA(n,e){const t=Ie(e.outShape,"int32"),s=e.strideDepth,o=e.strideHeight,r=e.strideWidth,i=e.dilationDepth,a=e.dilationHeight,l=e.dilationWidth,c=e.effectiveFilterDepth,u=e.effectiveFilterHeight,h=e.effectiveFilterWidth,d=e.padInfo.front,p=e.padInfo.top,f=e.padInfo.left;for(let m=0;m<e.batchSize;++m)for(let g=0;g<e.inChannels;++g)for(let x=0;x<e.outDepth;++x){const b=x*s-d;let w=b;for(;w<0;)w+=i;const y=Math.min(e.inDepth,c+b);for(let C=0;C<e.outHeight;++C){const $=C*o-p;let N=$;for(;N<0;)N+=a;const T=Math.min(e.inHeight,u+$);for(let S=0;S<e.outWidth;++S){const v=S*r-f;let I=v;for(;I<0;)I+=l;const R=Math.min(e.inWidth,h+v);let F=Number.NEGATIVE_INFINITY,O=-1;for(let L=w;L<y;L+=i){const z=L-b;for(let U=N;U<T;U+=a){const W=U-$;for(let G=I;G<R;G+=l){const K=G-v,Z=n.get(m,L,U,G,g);Z>=F&&(F=Z,O=z*u*h+W*u+K)}}}t.set(O,m,x,C,S,g)}}}return t}function QA(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e;ie(o,"avgPool");const{filterSize:r,strides:i,pad:a,dimRoundingMode:l}=s,c=1;k(Nt(i,c),()=>`Error in avgPool: Either strides or dilations must be 1. Got strides ${i} and dilations '${c}'`);const u=sn(o.shape,r,i,c,a,l);let h;if(u.filterWidth===1&&u.filterHeight===1&&Ee(u.inShape,u.outShape))h=Hn({inputs:{x:o},backend:t});else{const d=t.data.get(o.dataId).values,p=ce(o.shape),f=jd(d,o.shape,o.dtype,p,u,"avg");h=t.makeTensorInfo(u.outShape,o.dtype,f.values)}return h}const JA={kernelName:na,backendName:"cpu",kernelFunc:QA};function eD(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{filterSize:r,strides:i,pad:a,dimRoundingMode:l,dataFormat:c}=s;ie(o,"avgPool3d");const u=Yn(o.shape,r,i,1,a,l,c),h=t.data.get(o.dataId).values,d=w1(h,o.shape,o.dtype,ce(o.shape),u,"avg");return t.makeTensorInfo(d.shape,"float32",d.values)}const tD={kernelName:sa,backendName:"cpu",kernelFunc:eD};function nD(n){const{inputs:e,backend:t,attrs:s}=n,{dy:o,input:r}=e,{filterSize:i,strides:a,pad:l,dimRoundingMode:c}=s;ie([o,r],"avgPool3DGrad");const u=Yn(r.shape,i,a,1,l,c),h=u.strideDepth,d=u.strideHeight,p=u.strideWidth,f=u.filterDepth,m=u.filterHeight,g=u.filterWidth,x=u.dilationDepth,b=u.dilationHeight,w=u.dilationWidth,y=u.effectiveFilterDepth,C=u.effectiveFilterHeight,$=u.effectiveFilterWidth,N=y-1-u.padInfo.front,T=$-1-u.padInfo.left,S=C-1-u.padInfo.top,v=Ie(r.shape,"float32"),I=1/(f*m*g),R=t.bufferSync(o);for(let F=0;F<u.batchSize;++F)for(let O=0;O<u.inChannels;++O)for(let L=0;L<u.inDepth;++L)for(let z=0;z<u.inHeight;++z)for(let U=0;U<u.inWidth;++U){const W=L-N,G=z-S,K=U-T;let Z=0;for(let j=0;j<y;j+=x){const X=(W+j)/h;if(!(X<0||X>=u.outDepth||Math.floor(X)!==X))for(let te=0;te<C;te+=b){const J=(G+te)/d;if(!(J<0||J>=u.outHeight||Math.floor(J)!==J))for(let se=0;se<$;se+=w){const le=(K+se)/p;if(le<0||le>=u.outWidth||Math.floor(le)!==le)continue;const fe=R.get(F,X,J,le,O);Z+=fe}}}v.set(Z*I,F,L,z,U,O)}return t.makeTensorInfo(v.shape,v.dtype,v.values)}const sD={kernelName:jc,backendName:"cpu",kernelFunc:nD};function oD(n){const{inputs:e,backend:t,attrs:s}=n,{dy:o,input:r}=e,i=r;ie([o,r],"avgPoolGrad");const{filterSize:a,strides:l,pad:c}=s,u=sn(i.shape,a,l,1,c),h=u.strideHeight,d=u.strideWidth,p=u.filterHeight,f=u.filterWidth,m=u.dilationHeight,g=u.dilationWidth,x=u.effectiveFilterHeight,b=u.effectiveFilterWidth,w=b-1-u.padInfo.left,y=x-1-u.padInfo.top,C=Ie(i.shape,"float32"),$=1/(p*f),N=t.data.get(o.dataId).values,T=Ie(o.shape,"float32",N);for(let S=0;S<u.batchSize;++S)for(let v=0;v<u.inChannels;++v)for(let I=0;I<u.inHeight;++I)for(let R=0;R<u.inWidth;++R){const F=I-y,O=R-w;let L=0;for(let z=0;z<x;z+=m){const U=(F+z)/h;if(!(U<0||U>=u.outHeight||Math.floor(U)!==U))for(let W=0;W<b;W+=g){const G=(O+W)/d;if(G<0||G>=u.outWidth||Math.floor(G)!==G)continue;const K=T.get(S,U,G,v);L+=K}}C.set(L*$,S,I,R,v)}return t.makeTensorInfo(C.shape,C.dtype,C.values)}const rD={kernelName:qc,backendName:"cpu",kernelFunc:oD};function iD(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,scale:r,offset:i,mean:a,variance:l}=e;k(a.shape.length===l.shape.length,()=>"Batch normalization gradient requires mean and variance to have equal ranks."),k(i==null||a.shape.length===i.shape.length,()=>"Batch normalization gradient requires mean and offset to have equal ranks."),k(r==null||a.shape.length===r.shape.length,()=>"Batch normalization gradient requires mean and scale to have equal ranks."),ie([o,a,l,r,i],"batchNorm");let{varianceEpsilon:c}=s;c==null&&(c=.001);const u=t.data.get(o.dataId).values,h=t.data.get(a.dataId).values,d=t.data.get(l.dataId).values,p=r?t.data.get(r.dataId).values:new Float32Array([1]),f=i?t.data.get(i.dataId).values:new Float32Array([0]),m=new Float32Array(u.length),g=f.length,x=p.length,b=d.length,w=h.length;let y=0,C=0,$=0,N=0;for(let T=0;T<u.length;++T)m[T]=f[y++]+(u[T]-h[C++])*p[$++]/Math.sqrt(d[N++]+c),y>=g&&(y=0),C>=w&&(C=0),$>=x&&($=0),N>=b&&(N=0);return t.makeTensorInfo(o.shape,o.dtype,m)}const aD={kernelName:ga,backendName:"cpu",kernelFunc:iD};function lD(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{blockShape:r,crops:i}=s;ie([o],"batchToSpaceND");const a=r.reduce((x,b)=>x*b),l=bi(o.shape,r,a),c=yi(l.length,r.length),u=wi(o.shape,r,a),h=zh(i,r.length),d=Vh(u,i,r.length),p=ze({inputs:{x:o},backend:t,attrs:{shape:l}}),f=Ut({inputs:{x:p},backend:t,attrs:{perm:c}}),m=ze({inputs:{x:f},backend:t,attrs:{shape:u}}),g=ho({inputs:{x:m},backend:t,attrs:{begin:h,size:d}});return t.disposeIntermediateTensorInfo(p),t.disposeIntermediateTensorInfo(f),t.disposeIntermediateTensorInfo(m),g}const cD={kernelName:ra,backendName:"cpu",kernelFunc:lD};function uD(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,weights:r}=e,{size:i}=s,a=t.data.get(o.dataId).values,l=t.data.get(r.dataId).values,c=Wd(a,l,r.dtype,r.shape,i);return t.makeTensorInfo([i],r.dtype,c)}const hD={kernelName:Kc,backendName:"cpu",kernelFunc:uD};function dD(n){const{inputs:e,backend:t}=n,{s0:s,s1:o}=e,r=t.data.get(s.dataId).values,i=t.data.get(o.dataId).values,a=xe(Array.from(r),Array.from(i));return t.makeTensorInfo([a.length],"int32",Int32Array.from(a))}const pD={kernelName:Fp,backendName:"cpu",kernelFunc:dD};const fD=De(gr,(n,e)=>{const t=e;return n>t.clipValueMax?t.clipValueMax:n<t.clipValueMin?t.clipValueMin:n}),mD={kernelName:gr,backendName:"cpu",kernelFunc:fD};const gD={kernelName:ia,backendName:"cpu",kernelFunc:n=>{const{x:e}=n.inputs,t=n.backend,s=new Float32Array(q(e.shape)),o=t.data.get(e.dataId),r=o.complexTensorInfos.real,i=o.complexTensorInfos.imag,a=t.data.get(r.dataId).values,l=t.data.get(i.dataId).values;for(let c=0;c<a.length;c++){const u=a[c],h=l[c];s[c]=Math.hypot(u,h)}return t.makeOutput(s,e.shape,"float32")}};function jo(n){const{inputs:e,backend:t}=n,{input:s}=e,o=t.data.get(s.dataId).complexTensorInfos.imag,r=t.data.get(o.dataId).values;return t.makeTensorInfo(o.shape,o.dtype,r)}const xD={kernelName:fu,backendName:"cpu",kernelFunc:jo};function Ko(n){const{inputs:e,backend:t,attrs:s}=n,{axis:o}=s,r=Ce(o,e[0].shape)[0],i=e.map(m=>m.shape);Mh(i,r);let a=Mn(e.map(m=>m.shape),r);if(q(a)===0)return t.makeTensorInfo(a,e[0].dtype,[]);const l=e.filter(m=>q(m.shape)>0);if(l.length===1)return Hn({inputs:{x:l[0]},backend:t});if(l[0].dtype==="complex64"){const m=l.map(y=>co({inputs:{input:y},backend:t})),g=l.map(y=>jo({inputs:{input:y},backend:t})),x=Ko({inputs:m,backend:t,attrs:{axis:r}}),b=Ko({inputs:g,backend:t,attrs:{axis:r}}),w=Kt({inputs:{real:x,imag:b},backend:t});return m.forEach(y=>t.disposeIntermediateTensorInfo(y)),g.forEach(y=>t.disposeIntermediateTensorInfo(y)),t.disposeIntermediateTensorInfo(x),t.disposeIntermediateTensorInfo(b),w}const c=l.map(m=>{const x=[-1,q(m.shape.slice(r))];return ze({inputs:{x:m},backend:t,attrs:{shape:x}})}),u=c.map(m=>({vals:t.data.get(m.dataId).values,shape:m.shape}));a=Mn(c.map(m=>m.shape),1);const h=c[0].shape[0]===1,d=C0(u,a,e[0].dtype,h),p=Mn(l.map(m=>m.shape),r),f=t.makeTensorInfo(p,e[0].dtype,d);return c.forEach(m=>t.disposeIntermediateTensorInfo(m)),f}const bD={kernelName:aa,backendName:"cpu",kernelFunc:Ko};function C1(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,filter:r}=e,{strides:i,pad:a,dataFormat:l,dilations:c,dimRoundingMode:u}=s;ie([o,r],"conv2d");const h=Zn(l),d=yt(o.shape,r.shape,i,c,a,u,!1,h),p=d.filterHeight,f=d.filterWidth,m=d.dilationHeight,g=d.dilationWidth,x=d.padInfo.left,b=d.padInfo.top,w=d.dataFormat==="channelsLast",y=new bt(d.outShape,o.dtype),C=ce(o.shape),$=ce(r.shape),N=C[0],T=w?C[1]:C[2],S=w?C[2]:1,v=w?1:C[1],I=y.strides[0],R=w?y.strides[1]:y.strides[2],F=w?y.strides[2]:1,O=w?1:y.strides[1],L=t.data.get(o.dataId).values,z=t.data.get(r.dataId).values,U=y.values;for(let W=0;W<d.batchSize;++W){const G=W*N,K=W*I;for(let Z=0;Z<d.outHeight;++Z){const j=K+Z*R,X=Z*d.strideHeight-b;for(let te=0;te<p;++te){const J=X+te*m;if(J<0||J>=d.inHeight)continue;const se=te*$[0],le=G+J*T;for(let fe=0;fe<d.outWidth;++fe){const de=j+fe*F,ye=fe*d.strideWidth-x;for(let we=0;we<f;++we){const _e=ye+we*g;if(_e<0||_e>=d.inWidth)continue;const Ve=se+we*$[1],Ze=le+_e*S;let We=Ve;for(let Le=0;Le<d.inChannels;++Le){const Xe=L[Ze+Le*v];for(let qe=0;qe<d.outChannels;++qe)U[de+qe*O]+=Xe*z[We+qe];We+=d.outChannels}}}}}}return t.makeTensorInfo(y.shape,y.dtype,U)}const yD={kernelName:la,backendName:"cpu",kernelFunc:C1};function wD(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,dy:r}=e,{strides:i,pad:a,dataFormat:l,dimRoundingMode:c,filterShape:u}=s;ie([o,r],"conv2dBackpropFilter");const h=Zn(l),d=yt(o.shape,u,i,1,a,c,!1,h),{strideHeight:p,strideWidth:f,filterHeight:m,filterWidth:g}=d,x=d.dataFormat==="channelsLast",b=new bt(d.filterShape,"float32"),w=d.padInfo.left,y=d.padInfo.top,C=t.data.get(o.dataId).values,$=t.data.get(r.dataId).values,N=new bt(o.shape,o.dtype,C),T=new bt(r.shape,r.dtype,$);for(let S=0;S<m;++S){const v=Math.max(0,Math.ceil((y-S)/p)),I=Math.min(d.outHeight,(d.inHeight+y-S)/p);for(let R=0;R<g;++R){const F=Math.max(0,Math.ceil((w-R)/f)),O=Math.min(d.outWidth,(d.inWidth+w-R)/f);for(let L=0;L<d.inChannels;++L)for(let z=0;z<d.outChannels;++z){let U=0;for(let W=0;W<d.batchSize;++W)for(let G=v;G<I;++G){const K=S+G*p-y;for(let Z=F;Z<O;++Z){const j=R+Z*f-w;x?U+=N.get(W,K,j,L)*T.get(W,G,Z,z):U+=N.get(W,L,K,j)*T.get(W,z,G,Z)}}b.set(U,S,R,L,z)}}}return t.makeTensorInfo(b.shape,b.dtype,b.values)}const CD={kernelName:Zc,backendName:"cpu",kernelFunc:wD};function ID(n){const{inputs:e,backend:t,attrs:s}=n,{dy:o,filter:r}=e,{inputShape:i,strides:a,pad:l,dataFormat:c,dimRoundingMode:u}=s;ie([o,r],"conv2dBackpropInput");const h=ce(r.shape),d=ce(o.shape);let p=Zn(c);const f=yt(i,r.shape,a,1,l,u,!1,p),m=new bt(f.inShape,"float32"),g=m.values,x=t.data.get(o.dataId).values,b=t.data.get(r.dataId).values,[w,y,C]=h,{batchSize:$,filterHeight:N,filterWidth:T,inChannels:S,inHeight:v,inWidth:I,outChannels:R,outHeight:F,outWidth:O,strideHeight:L,strideWidth:z}=f;p=f.dataFormat;const U=N-1-f.padInfo.top,W=T-1-f.padInfo.left,G=p==="channelsLast",K=m.strides[0],Z=G?m.strides[1]:m.strides[2],j=G?m.strides[2]:1,X=G?1:m.strides[1],te=d[0],J=G?d[1]:d[2],se=G?d[2]:1,le=G?1:d[1];for(let fe=0;fe<$;++fe)for(let de=0;de<S;++de)for(let ye=0;ye<v;++ye){const we=ye-U,_e=Math.max(0,Math.ceil(we/L)),Ve=Math.min(F,(N+we)/L);for(let Ze=0;Ze<I;++Ze){const We=Ze-W,Le=Math.max(0,Math.ceil(We/z)),Xe=Math.min(O,(T+We)/z);let qe=0;for(let kt=_e;kt<Ve;++kt){const Ds=kt*L-we;for(let tn=Le;tn<Xe;++tn){const wo=tn*z-We,Tn=te*fe+J*kt+se*tn,is=w*(N-1-Ds)+y*(T-1-wo)+C*de;for(let Fs=0;Fs<R;++Fs){const _s=x[Tn+le*Fs],Os=b[is+Fs];qe+=_s*Os}}}const rs=K*fe+Z*ye+j*Ze+X*de;g[rs]=qe}}return t.makeTensorInfo(m.shape,m.dtype,m.values)}const $D={kernelName:ca,backendName:"cpu",kernelFunc:ID};function kD(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,filter:r}=e,{strides:i,pad:a,dilations:l}=s;ie([o,r],"conv3d");const c=fs(o.shape,r.shape,i,l,a),{filterDepth:u,filterHeight:h,filterWidth:d,dilationDepth:p,dilationHeight:f,dilationWidth:m,padInfo:g}=c,x=g.front,b=g.left,w=g.top,y=new bt(c.outShape,o.dtype),C=t.data.get(o.dataId).values,$=t.data.get(r.dataId).values,N=y.values,T=ce(o.shape),S=ce(r.shape);for(let v=0;v<c.batchSize;++v){const I=v*T[0],R=v*y.strides[0];for(let F=0;F<c.outDepth;++F){const O=R+F*y.strides[1],L=F*c.strideDepth-x;for(let z=0;z<u;++z){const U=L+z*p;if(U<0||U>=c.inDepth)continue;const W=z*S[0],G=I+U*T[1];for(let K=0;K<c.outHeight;++K){const Z=O+K*y.strides[2],j=K*c.strideHeight-w;for(let X=0;X<h;++X){const te=j+X*f;if(te<0||te>=c.inHeight)continue;const J=W+X*S[1],se=G+te*T[2];for(let le=0;le<c.outWidth;++le){const fe=Z+le*c.outChannels,de=le*c.strideWidth-b;for(let ye=0;ye<d;++ye){const we=de+ye*m;if(we<0||we>=c.inWidth)continue;const _e=J+ye*S[2],Ve=se+we*c.inChannels;let Ze=_e;for(let We=0;We<c.inChannels;++We){const Le=C[Ve+We];for(let Xe=0;Xe<c.outChannels;++Xe)N[fe+Xe]+=Le*$[Ze+Xe];Ze+=c.outChannels}}}}}}}}return t.makeTensorInfo(y.shape,y.dtype,y.values)}const vD={kernelName:ua,backendName:"cpu",kernelFunc:kD};function SD(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,dy:r}=e,{strides:i,pad:a,filterShape:l}=s;ie([o,r],"conv3dBackpropFilterV2");const c=ce(o.shape),u=ce(r.shape),h=fs(o.shape,l,i,1,a),d=h.strideDepth,p=h.strideHeight,f=h.strideWidth,m=h.filterDepth,g=h.filterHeight,x=h.filterWidth,b=new bt(h.filterShape,"float32"),w=b.values,[y,C,$,N]=b.strides,T=t.data.get(r.dataId).values,[S,v,I,R]=u,F=t.data.get(o.dataId).values,[O,L,z,U]=c,W=h.padInfo.front,G=h.padInfo.left,K=h.padInfo.top;for(let Z=0;Z<m;++Z){const j=Math.max(0,Math.ceil((W-Z)/d)),X=Math.min(h.outDepth,(h.inDepth+W-Z)/d),te=Z*y;for(let J=0;J<g;++J){const se=Math.max(0,Math.ceil((K-J)/p)),le=Math.min(h.outHeight,(h.inHeight+K-J)/p),fe=J*C+te;for(let de=0;de<x;++de){const ye=Math.max(0,Math.ceil((G-de)/f)),we=Math.min(h.outWidth,(h.inWidth+G-de)/f),_e=de*$+fe;for(let Ve=0;Ve<h.inChannels;++Ve){const Ze=Ve*N+_e;for(let We=0;We<h.outChannels;++We){let Le=0;for(let Xe=0;Xe<h.batchSize;++Xe){const qe=Xe*O,rs=Xe*S;for(let kt=j;kt<X;++kt){const tn=(Z+kt*d-W)*L+qe,wo=kt*v+rs;for(let Tn=se;Tn<le;++Tn){const Fs=(J+Tn*p-K)*z+tn,_s=Tn*I+wo;for(let Os=ye;Os<we;++Os){const Cp=(de+Os*f-G)*U+Fs,Ip=Os*R+_s;Le+=F[Cp+Ve]*T[Ip+We]}}}}w[Ze+We]=Le}}}}}return t.makeTensorInfo(b.shape,b.dtype,b.values)}const ND={kernelName:Qc,backendName:"cpu",kernelFunc:SD};function TD(n){const{inputs:e,backend:t,attrs:s}=n,{dy:o,filter:r}=e,{pad:i,strides:a,inputShape:l}=s;ie([o],"conv3dBackpropInputV2");const c=ce(o.shape),u=ce(r.shape),h=fs(l,r.shape,a,1,i),d=new bt(h.inShape,"float32"),p=d.values,[f,m,g,x]=d.strides,b=t.data.get(o.dataId).values,[w,y,C,$]=c,N=t.data.get(r.dataId).values,[T,S,v,I]=u,{batchSize:R,filterDepth:F,filterHeight:O,filterWidth:L,inChannels:z,inDepth:U,inHeight:W,inWidth:G,outChannels:K,outDepth:Z,outHeight:j,outWidth:X,strideDepth:te,strideHeight:J,strideWidth:se}=h,le=F-1-h.padInfo.front,fe=O-1-h.padInfo.top,de=L-1-h.padInfo.left;for(let ye=0;ye<R;++ye)for(let we=0;we<z;++we)for(let _e=0;_e<U;++_e){const Ve=_e-le,Ze=Math.max(0,Math.ceil(Ve/te)),We=Math.min(Z,(F+Ve)/te);for(let Le=0;Le<W;++Le){const Xe=Le-fe,qe=Math.max(0,Math.ceil(Xe/J)),rs=Math.min(j,(O+Xe)/J);for(let kt=0;kt<G;++kt){const Ds=kt-de,tn=Math.max(0,Math.ceil(Ds/se)),wo=Math.min(X,(L+Ds)/se);let Tn=0;for(let is=Ze;is<We;++is){const Fs=is*te-Ve;for(let _s=qe;_s<rs;++_s){const Os=_s*J-Xe;for(let Yi=tn;Yi<wo;++Yi){const Cp=Yi*se-Ds,Ip=w*ye+y*is+C*_s+$*Yi,GH=T*(F-1-Fs)+S*(O-1-Os)+v*(L-1-Cp)+I*we;for(let Rc=0;Rc<K;++Rc){const HH=b[Ip+Rc],qH=N[GH+Rc];Tn+=HH*qH}}}}p[f*ye+m*_e+g*Le+x*kt+we]=Tn}}}return t.makeTensorInfo(d.shape,d.dtype,d.values)}const ED={kernelName:Jc,backendName:"cpu",kernelFunc:TD};const RD=De(xr,n=>Math.cos(n)),AD={kernelName:xr,backendName:"cpu",kernelFunc:RD};const DD=De(br,n=>Math.cosh(n)),FD={kernelName:br,backendName:"cpu",kernelFunc:DD};function _D(n){const{inputs:e,backend:t,attrs:s}=n,{image:o,boxes:r,boxInd:i}=e,{cropSize:a,method:l,extrapolationValue:c}=s,[u,h,d,p]=o.shape,f=r.shape[0],[m,g]=a,x=Ie([f,m,g,p],"float32"),b=t.data.get(r.dataId).values,w=t.data.get(i.dataId).values,y=t.data.get(o.dataId).values,C=ce(o.shape),$=ce(x.shape);for(let N=0;N<f;N++){const T=N*4,S=b[T],v=b[T+1],I=b[T+2],R=b[T+3],F=w[N];if(F>=u)continue;const O=m>1?(I-S)*(h-1)/(m-1):0,L=g>1?(R-v)*(d-1)/(g-1):0;for(let z=0;z<m;z++){const U=m>1?S*(h-1)+z*O:.5*(S+I)*(h-1);if(U<0||U>h-1){for(let W=0;W<g;W++)for(let G=0;G<p;G++){const K=G+W*$[2]+z*$[1]+N*$[0];x.values[K]=c}continue}if(l==="bilinear"){const W=Math.floor(U),G=Math.ceil(U),K=U-W;for(let Z=0;Z<g;Z++){const j=g>1?v*(d-1)+Z*L:.5*(v+R)*(d-1);if(j<0||j>d-1){for(let se=0;se<p;se++){const le=se+Z*$[2]+z*$[1]+N*$[0];x.values[le]=c}continue}const X=Math.floor(j),te=Math.ceil(j),J=j-X;for(let se=0;se<p;se++){let le=se+X*C[2]+W*C[1]+F*C[0];const fe=y[le];le=se+te*C[2]+W*C[1]+F*C[0];const de=y[le];le=se+X*C[2]+G*C[1]+F*C[0];const ye=y[le];le=se+te*C[2]+G*C[1]+F*C[0];const we=y[le],_e=fe+(de-fe)*J,Ve=ye+(we-ye)*J;le=se+Z*$[2]+z*$[1]+N*$[0],x.values[le]=_e+(Ve-_e)*K}}}else for(let W=0;W<g;++W){const G=g>1?v*(d-1)+W*L:.5*(v+R)*(d-1);if(G<0||G>d-1){for(let j=0;j<p;j++){const X=j+W*$[2]+z*$[1]+N*$[0];x.values[X]=c}continue}const K=Math.round(G),Z=Math.round(U);for(let j=0;j<p;j++){const X=j+K*C[2]+Z*C[1]+F*C[0],te=j+W*$[2]+z*$[1]+N*$[0];x.values[te]=y[X]}}}}return t.makeTensorInfo(x.shape,x.dtype,x.values)}const OD={kernelName:tu,backendName:"cpu",kernelFunc:_D};function LD(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{axis:r,exclusive:i,reverse:a}=s;ie(o,"cumprod");const l=je([r],o.shape.length);let c=o;l!=null&&(c=Ut({inputs:{x:o},backend:t,attrs:{perm:l}}));const u=et(1,o.shape.length)[0];if(u!==c.shape.length-1)throw new Error(`backend.cumprod in CPU expects an inner-most axis=${c.shape.length-1} but got axis=${u}`);const h=Gt(c.dtype,"int32"),d=Bc(q(c.shape),h),p=t.data.get(c.dataId).values,f=c.shape[c.shape.length-1],m=a?(x,b)=>x+f-b-1:(x,b)=>x+b;for(let x=0;x<p.length;x+=f)for(let b=0;b<f;b++){const w=m(x,b);if(b===0)d[w]=i?1:p[w];else{const y=m(x,b-1);d[w]=i?p[y]*d[y]:p[w]*d[y]}}const g=t.makeTensorInfo(c.shape,h,d);if(l!=null){const x=ms(l),b=Ut({inputs:{x:g},backend:t,attrs:{perm:x}});return t.disposeIntermediateTensorInfo(g),t.disposeIntermediateTensorInfo(c),b}return g}const MD={kernelName:eu,backendName:"cpu",kernelFunc:LD};function PD(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{axis:r,exclusive:i,reverse:a}=s;ie(o,"cumsum");const l=je([r],o.shape.length);let c=o;l!=null&&(c=Ut({inputs:{x:o},backend:t,attrs:{perm:l}}));const u=et(1,o.shape.length)[0];if(u!==c.shape.length-1)throw new Error(`backend.cumsum in CPU expects an inner-most axis=${c.shape.length-1} but got axis=${u}`);const h=Gt(c.dtype,"int32"),d=St(q(c.shape),h),p=t.data.get(c.dataId).values,f=c.shape[c.shape.length-1],m=a?(x,b)=>x+f-b-1:(x,b)=>x+b;for(let x=0;x<p.length;x+=f)for(let b=0;b<f;b++){const w=m(x,b);if(b===0)d[w]=i?0:p[w];else{const y=m(x,b-1);d[w]=i?p[y]+d[y]:p[w]+d[y]}}const g=t.makeTensorInfo(c.shape,h,d);if(l!=null){const x=ms(l),b=Ut({inputs:{x:g},backend:t,attrs:{perm:x}});return t.disposeIntermediateTensorInfo(g),t.disposeIntermediateTensorInfo(c),b}return g}const BD={kernelName:ha,backendName:"cpu",kernelFunc:PD};function zD(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,weights:r}=e,{size:i,binaryOutput:a}=s;if(o.shape.length===1){const l=t.data.get(o.dataId).values,c=t.data.get(r.dataId).values,u=Wd(l,c,r.dtype,r.shape,i);return t.makeTensorInfo([i],r.dtype,u)}else if(o.shape.length===2){const l=t.bufferSync(o),c=t.bufferSync(r),u=b0(l,c,i,a);return t.makeTensorInfo(u.shape,r.dtype,u.values)}throw new Error(`Error in denseBincount: input must be at most rank 2, but got rank${o.shape.length}.`)}const VD={kernelName:nu,backendName:"cpu",kernelFunc:zD};function WD(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{blockSize:r,dataFormat:i}=s;k(i==="NHWC",()=>`Only NHWC dataFormat supported on CPU for depthToSpace. Got ${i}`);const a=o.shape[0],l=o.shape[1],c=o.shape[2],u=o.shape[3],h=l*r,d=c*r,p=u/(r*r),f=t.data.get(o.dataId).values,m=new Float32Array(a*h*d*p);let g=0;for(let x=0;x<a;++x)for(let b=0;b<h;++b){const w=Math.floor(b/r),y=b%r;for(let C=0;C<d;++C){const $=Math.floor(C/r),N=C%r,T=(y*r+N)*p;for(let S=0;S<p;++S){const I=S+T+u*($+c*(w+l*x));m[g++]=f[I]}}}return t.makeTensorInfo([a,h,d,p],o.dtype,m)}const UD={kernelName:su,backendName:"cpu",kernelFunc:WD};function I1(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,filter:r}=e,{strides:i,pad:a,dilations:l,dimRoundingMode:c}=s;ie([o,r],"depthwiseConv2DNative");const u=ce(o.shape),h=ce(r.shape);let d=l;d==null&&(d=[1,1]),k(Nt(i,d),()=>`Error in depthwiseConv2d: Either strides or dilations must be 1. Got strides ${i} and dilations '${d}'`);const p=yt(o.shape,r.shape,i,d,a,c,!0),{filterHeight:f,filterWidth:m,dilationHeight:g,dilationWidth:x,padInfo:b}=p,w=b.left,y=b.top,C=p.outChannels/p.inChannels,$=new bt(p.outShape,o.dtype),N=t.data.get(o.dataId).values,T=t.data.get(r.dataId).values,S=$.values;for(let v=0;v<p.batchSize;++v){const I=v*u[0],R=v*$.strides[0];for(let F=0;F<p.outHeight;++F){const O=R+F*$.strides[1],L=F*p.strideHeight-y;for(let z=0;z<f;++z){const U=L+z*g;if(U<0||U>=p.inHeight)continue;const W=z*h[0],G=I+U*u[1];for(let K=0;K<p.outWidth;++K){const Z=O+K*$.strides[2],j=K*p.strideWidth-w;for(let X=0;X<m;++X){const te=j+X*x;if(te<0||te>=p.inWidth)continue;const J=W+X*h[1],se=G+te*p.inChannels;let le=Z,fe=J;for(let de=0;de<p.inChannels;++de){const ye=N[se+de];for(let we=0;we<C;++we)S[le+we]+=ye*T[fe+we];le+=C,fe+=C}}}}}}return t.makeTensorInfo($.shape,$.dtype,$.values)}const GD={kernelName:da,backendName:"cpu",kernelFunc:I1};function HD(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,dy:r}=e,{strides:i,dilations:a,pad:l,dimRoundingMode:c,filterShape:u}=s;ie([o,r],"depthwiseConv2dNativeBackpropFilter");const h=yt(o.shape,u,i,a,l,c,!0),{strideHeight:d,strideWidth:p,filterHeight:f,filterWidth:m}=h,g=new bt(h.filterShape,"float32"),x=h.padInfo.left,b=h.padInfo.top,w=h.outChannels/h.inChannels,y=t.data.get(o.dataId).values,C=new bt(o.shape,o.dtype,y),$=t.data.get(r.dataId).values,N=new bt(r.shape,r.dtype,$);for(let T=0;T<f;++T){const S=Math.max(0,Math.ceil((b-T)/d)),v=Math.min(h.outHeight,(h.inHeight+b-T)/d);for(let I=0;I<m;++I){const R=Math.max(0,Math.ceil((x-I)/p)),F=Math.min(h.outWidth,(h.inWidth+x-I)/p);for(let O=0;O<h.outChannels;++O){const L=Math.trunc(O/w),z=O%w;let U=0;for(let W=0;W<h.batchSize;++W)for(let G=S;G<v;++G){const K=T+G*d-b;for(let Z=R;Z<F;++Z){const j=I+Z*p-x;U+=C.get(W,K,j,L)*N.get(W,G,Z,O)}}g.set(U,T,I,L,z)}}}return t.makeTensorInfo(g.shape,g.dtype,g.values)}const qD={kernelName:ou,backendName:"cpu",kernelFunc:HD};function jD(n){const{inputs:e,backend:t,attrs:s}=n,{dy:o,filter:r}=e,{strides:i,dilations:a,pad:l,dimRoundingMode:c,inputShape:u}=s;ie([o,r],"depthwiseConv2DNativeBackpropInput");const h=ce(o.shape),d=ce(r.shape),p=yt(u,r.shape,i,a,l,c,!0),f=new bt(p.inShape,"float32"),m=f.values,[g,x,b]=f.strides,w=t.data.get(o.dataId).values,[y,C,$]=h,N=t.data.get(r.dataId).values,[T,S,v]=d,{batchSize:I,filterHeight:R,filterWidth:F,inChannels:O,inHeight:L,inWidth:z,outChannels:U,outHeight:W,outWidth:G,strideHeight:K,strideWidth:Z}=p,j=R-1-p.padInfo.top,X=F-1-p.padInfo.left,te=U/O;for(let J=0;J<I;++J)for(let se=0;se<O;++se)for(let le=0;le<L;++le){const fe=le-j,de=Math.max(0,Math.ceil(fe/K)),ye=Math.min(W,(R+fe)/K);for(let we=0;we<z;++we){const _e=we-X,Ve=Math.max(0,Math.ceil(_e/Z)),Ze=Math.min(G,(F+_e)/Z);let We=0;for(let Le=de;Le<ye;++Le){const Xe=Le*K-fe;for(let qe=Ve;qe<Ze;++qe){const rs=qe*Z-_e,kt=y*J+C*Le+$*qe,Ds=T*(R-1-Xe)+S*(F-1-rs)+v*se;for(let tn=0;tn<te;++tn){const wo=se*te+tn,Tn=w[kt+wo],is=N[Ds+tn];We+=Tn*is}}}m[g*J+x*le+b*we+se]=We}}return t.makeTensorInfo(f.shape,f.dtype,f.values)}const KD={kernelName:ru,backendName:"cpu",kernelFunc:jD};function XD(n){const{inputs:e,backend:t}=n,{x:s}=e,o=q(s.shape),r=t.data.get(s.dataId).values,i=Ie([o,o],s.dtype),a=i.values;for(let c=0;c<r.length;c++)a[c*o+c]=r[c];const l=[...s.shape,...s.shape];return t.makeTensorInfo(l,i.dtype,i.values)}const YD={kernelName:_p,backendName:"cpu",kernelFunc:XD};const ZD={kernelName:pa,backendName:"cpu",kernelFunc:({inputs:n,backend:e,attrs:t})=>{const{x:s,filter:o}=n,{strides:r,pad:i,dilations:a}=t,l=e,c=l.data.get(s.dataId).values,u=s.shape.length,h=l.data.get(o.dataId).values,d=o.shape.length,{batchSize:p,inHeight:f,inWidth:m,inChannels:g,outHeight:x,outWidth:b,padInfo:w,strideHeight:y,strideWidth:C,filterHeight:$,filterWidth:N,dilationHeight:T,dilationWidth:S,outShape:v}=ii(s.shape,o.shape,r,i,"NHWC",a),I=q(v),R=v.length,F=Qe(s.dtype,I);for(let L=0;L<p;++L)for(let z=0;z<x;++z){const U=z*y-w.top;for(let W=0;W<b;++W){const G=W*C-w.left;for(let K=0;K<g;++K){let Z=Number.MIN_SAFE_INTEGER;for(let X=0;X<$;++X){const te=U+X*T;if(te>=0&&te<f)for(let J=0;J<N;++J){const se=G+J*S;if(se>=0&&se<m){const le=Rn([L,te,se,K],u,ce(s.shape)),fe=Rn([X,J,K],d,ce(o.shape)),de=c[le]+h[fe];de>Z&&(Z=de)}}}const j=Rn([L,z,W,K],R,ce(v));F[j]=Z}}}return{dataId:l.write(Ps(F,s.dtype),v,s.dtype),shape:v,dtype:s.dtype}}};const QD={kernelName:au,backendName:"cpu",kernelFunc:({inputs:n,backend:e,attrs:t})=>{const{x:s,filter:o,dy:r}=n,{strides:i,pad:a,dilations:l}=t,c=e,u=gn(s.shape,c.data.get(s.dataId).values),h=gn(o.shape,c.data.get(o.dataId).values),{batchSize:d,inHeight:p,inWidth:f,inChannels:m,outHeight:g,outWidth:x,padInfo:b,strideHeight:w,strideWidth:y,filterHeight:C,filterWidth:$,dilationHeight:N,dilationWidth:T,outShape:S}=ii(s.shape,o.shape,i,a,"NHWC",l);k(r.rank===S.length,()=>`Error in ${au}, dy must have the same rank as output ${S.length}, but got ${r.rank}`);const v=gn(S,c.data.get(r.dataId).values),I=Ep(o.shape,o.dtype);for(let F=0;F<d;++F)for(let O=0;O<g;++O){const L=O*w-b.top;for(let z=0;z<x;++z){const U=z*y-b.left;for(let W=0;W<m;++W){let G=Number.MIN_SAFE_INTEGER,K=0,Z=0;for(let j=0;j<C;++j){const X=L+j*N;if(X>=0&&X<p)for(let te=0;te<$;++te){const J=U+te*T;if(J>=0&&J<f){const se=u[F][X][J][W]+h[j][te][W];se>G&&(G=se,K=j,Z=te)}}}I[K][Z][W]+=v[F][O][z][W]}}}return{dataId:c.write(Ps(I,s.dtype),o.shape,o.dtype),shape:o.shape,dtype:o.dtype}}};const JD={kernelName:iu,backendName:"cpu",kernelFunc:({inputs:n,backend:e,attrs:t})=>{const{x:s,filter:o,dy:r}=n,{strides:i,pad:a,dilations:l}=t,c=e,u=gn(s.shape,c.data.get(s.dataId).values),h=gn(o.shape,c.data.get(o.dataId).values),{batchSize:d,inHeight:p,inWidth:f,inChannels:m,outHeight:g,outWidth:x,padInfo:b,strideHeight:w,strideWidth:y,filterHeight:C,filterWidth:$,dilationHeight:N,dilationWidth:T,outShape:S}=ii(s.shape,o.shape,i,a,"NHWC",l);k(r.rank===S.length,()=>`Error in ${iu}, dy must have the same rank as output ${S.length}, but got ${r.rank}`);const v=gn(S,c.data.get(r.dataId).values),I=Ep(s.shape,s.dtype);for(let F=0;F<d;++F)for(let O=0;O<g;++O){const L=O*w-b.top;for(let z=0;z<x;++z){const U=z*y-b.left;for(let W=0;W<m;++W){let G=Number.MIN_SAFE_INTEGER,K=L<0?0:L,Z=U<0?0:U;for(let j=0;j<C;++j){const X=L+j*N;if(X>=0&&X<p)for(let te=0;te<$;++te){const J=U+te*T;if(J>=0&&J<f){const se=u[F][X][J][W]+h[j][te][W];se>G&&(G=se,K=X,Z=J)}}}I[F][K][Z][W]+=v[F][O][z][W]}}}return{dataId:c.write(Ps(I,s.dtype),s.shape,s.dtype),shape:s.shape,dtype:s.dtype}}};function eF(n){const{inputs:e,backend:t,attrs:s}=n,{image:o}=e,{canvas:r,options:i}=s,{contextOptions:a,imageOptions:l}=i||{},c=(l==null?void 0:l.alpha)||1,u=(a==null?void 0:a.contextType)||"2d";if(u!=="2d")throw new Error(`Context type ${a.contextType} is not supported by the CPU backend.`);const h=r.getContext(u,(a==null?void 0:a.contextAttributes)||{});if(h==null)throw new Error(`Could not get the context with ${u} type.`);const[d,p]=o.shape.slice(0,2),f=o.shape.length===2?1:o.shape[2],m=t.data.get(o.dataId).values,g=o.dtype==="float32"?255:1,x=new Uint8ClampedArray(p*d*4);for(let w=0;w<d*p;++w){const y=[0,0,0,255*c];for(let $=0;$<f;$++){const N=m[w*f+$];if(o.dtype==="float32"){if(N<0||N>1)throw new Error(`Tensor values for a float32 Tensor must be in the range [0 - 1] but encountered ${N}.`)}else if(o.dtype==="int32"&&(N<0||N>255))throw new Error(`Tensor values for a int32 Tensor must be in the range [0 - 255] but encountered ${N}.`);f===1?(y[0]=N*g,y[1]=N*g,y[2]=N*g):y[$]=N*g}const C=w*4;x[C+0]=Math.round(y[0]),x[C+1]=Math.round(y[1]),x[C+2]=Math.round(y[2]),x[C+3]=Math.round(y[3])}r.width=p,r.height=d;const b=new ImageData(x,p,d);return h.putImageData(b,0,0),o}const tF={kernelName:gw,backendName:"cpu",kernelFunc:eF};function Pi(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{axis:r,keepDims:i}=s;ie(o,"sum");let a;o.dtype==="bool"?a=Ns({inputs:{x:o},backend:t,attrs:{dtype:"int32"}}):a=Hn({inputs:{x:o},backend:t});const l=a.shape.length,c=Ce(r,a.shape),u=je(c,l);let h=c,d=a;u!=null&&(d=Ut({inputs:{x:a},backend:t,attrs:{perm:u}}),h=et(h.length,l)),Ct("sum",h,d.shape.length);const[p,f]=gt(d.shape,h),m=Gt(d.dtype,"int32");let g=sc(t,p,m);const x=q(f),b=t.data.get(g.dataId).values,w=t.data.get(d.dataId).values;for(let y=0;y<b.length;++y){const C=y*x;let $=0;for(let N=0;N<x;++N)$+=w[C+N];b[y]=$}if(i){const y=rt(g.shape,c),C=g;g=ze({inputs:{x:g},backend:t,attrs:{shape:y}}),t.disposeIntermediateTensorInfo(C)}return t.disposeIntermediateTensorInfo(a),u!=null&&t.disposeIntermediateTensorInfo(d),g}const nF={kernelName:qa,backendName:"cpu",kernelFunc:Pi};function sF(n){const{inputs:e,backend:t,attrs:s}=n,{equation:o}=s,r=e,{allDims:i,summedDims:a,idDims:l}=Yh(o,r.length);Qh(i.length,l,r);const{path:c,steps:u}=Jh(a,l),h=u.length;let d=null,p=i.length;const f=[];for(let m=0;m<h;++m){for(const g of u[m]){const{permutationIndices:x,expandDims:b}=Zh(p,l[g]);let w;ed(x)?w=r[g]:(w=Ut({inputs:{x:r[g]},backend:t,attrs:{perm:x}}),f.push(w));const y=w.shape.slice();for(let C=0;C<b.length;++C)y.splice(b[C],0,1);Ee(w.shape,y)||(w=ze({inputs:{x:w},backend:t,attrs:{shape:y}}),f.push(w)),d===null?d=w:(d=oc({inputs:{a:w,b:d},backend:t}),f.push(d))}m<h-1&&(c[m]>=0&&(d=Pi({inputs:{x:d},backend:t,attrs:{axis:c[m]-(i.length-p),keepDims:!1}}),f.push(d)),p--)}for(const m of f)m!==d&&t.disposeIntermediateTensorInfo(m);return d}const oF={kernelName:lu,backendName:"cpu",kernelFunc:sF};function rF(n){const{inputs:e,backend:t}=n,{dy:s,y:o}=e;ie([s,o],"eluGrad");const r=new Float32Array(q(o.shape)),i=t.data.get(o.dataId).values,a=t.data.get(s.dataId).values;for(let l=0;l<i.length;++l){const c=i[l];c>=0?r[l]=a[l]:r[l]=a[l]*(c+1)}return t.makeTensorInfo(o.shape,"float32",r)}const iF={kernelName:cu,backendName:"cpu",kernelFunc:rF};const aF=Wh,lF=Uh,cF=Gh,uF=Hh,hF=qh,dF=jh,pF=De(Cr,n=>{const e=Math.sign(n),t=Math.abs(n),s=1/(1+aF*t);return e*(1-((((dF*s+hF)*s+uF)*s+cF)*s+lF)*s*Math.exp(-t*t))}),fF={kernelName:Cr,backendName:"cpu",kernelFunc:pF};function ac(n){const{inputs:e,backend:t,attrs:s}=n,{input:o}=e,{dim:r}=s,i=o.shape.length,a=o.shape.slice();let l=r;return r<0&&(k(-(i+1)<=r,()=>`Axis must be in the interval [${-(i+1)}, ${i}]`),l=i+r+1),a.splice(l,0,1),ze({inputs:{x:o},backend:t,attrs:{shape:a}})}const mF={kernelName:ma,backendName:"cpu",kernelFunc:ac};const gF=ot((n,e)=>n/e),Kd=pt(yr,gF),Xd={kernelName:yr,backendName:"cpu",kernelFunc:Kd};function $1(n,e,t){const s=n.shape,o=s[0],r=s[1],i=t.data.get(n.dataId),a=i.complexTensorInfos.real,l=i.complexTensorInfos.imag,c=[o,r],u=q(c),h=vt("float32",u),d=vt("float32",u);for(let g=0;g<o;g++){const x=ho({inputs:{x:a},backend:t,attrs:{begin:[g,0],size:[1,r]}}),b=ho({inputs:{x:l},backend:t,attrs:{begin:[g,0],size:[1,r]}}),w=Kt({inputs:{real:x,imag:b},backend:t}),{real:y,imag:C}=xF(w,e,t),$=ts(y,C);for(let N=0;N<r;N++){const T=Kh($,N);h[g*r+N]=T.real,d[g*r+N]=T.imag}t.disposeIntermediateTensorInfo(x),t.disposeIntermediateTensorInfo(b),t.disposeIntermediateTensorInfo(w)}const p=t.makeTensorInfo(c,"float32",h),f=t.makeTensorInfo(c,"float32",d),m=Kt({inputs:{real:p,imag:f},backend:t});return t.disposeIntermediateTensorInfo(p),t.disposeIntermediateTensorInfo(f),m}function xF(n,e,t){const s=q(n.shape),o=t.data.get(n.dataId),r=t.data.get(o.complexTensorInfos.real.dataId).values,i=t.data.get(o.complexTensorInfos.imag.dataId).values;if(bF(s)){const a=Yd(r,i,s,e,t),l=[n.shape[0],n.shape[1]];if(e){const c=t.makeTensorInfo(l,"float32",a.real),u=t.makeTensorInfo(l,"float32",a.imag),h=t.makeTensorInfo([],"float32",cs(s,"float32")),d=Hn({inputs:{x:h},backend:t}),p=Xd.kernelFunc({inputs:{a:c,b:h},backend:t}),f=Xd.kernelFunc({inputs:{a:u,b:d},backend:t}),m=t.data.get(p.dataId).values,g=t.data.get(f.dataId).values;return t.disposeIntermediateTensorInfo(c),t.disposeIntermediateTensorInfo(u),t.disposeIntermediateTensorInfo(h),t.disposeIntermediateTensorInfo(d),t.disposeIntermediateTensorInfo(p),t.disposeIntermediateTensorInfo(f),{real:m,imag:g}}return a}else{const a=ts(r,i),l=yF(a,s,e);return Jm(l)}}function bF(n){return(n&n-1)===0}function Yd(n,e,t,s,o){if(t===1)return{real:n,imag:e};const r=ts(n,e),i=t/2,a=eg(r),l=a.real,c=a.imag,u=[l.length],h=o.makeTensorInfo(u,"float32",l),d=o.makeTensorInfo(u,"float32",c),p=Kt({inputs:{real:h,imag:d},backend:o}),f=tg(r),m=f.real,g=f.imag,x=[m.length],b=o.makeTensorInfo(x,"float32",m),w=o.makeTensorInfo(x,"float32",g),y=Kt({inputs:{real:b,imag:w},backend:o}),C=Yd(l,c,i,s,o),$=C.real,N=C.imag,T=[$.length],S=o.makeTensorInfo(T,"float32",$),v=o.makeTensorInfo(T,"float32",N),I=Kt({inputs:{real:S,imag:v},backend:o}),R=Yd(m,g,i,s,o),F=R.real,O=R.imag,L=[F.length],z=o.makeTensorInfo(L,"float32",F),U=o.makeTensorInfo(L,"float32",O),W=Kt({inputs:{real:z,imag:U},backend:o}),G=sg(t,s),K=[G.real.length],Z=o.makeTensorInfo(K,"float32",G.real),j=o.makeTensorInfo(K,"float32",G.imag),X=Kt({inputs:{real:Z,imag:j},backend:o}),te=oc({inputs:{a:X,b:W},backend:o}),J=qo({inputs:{a:I,b:te},backend:o}),se=qd({inputs:{a:I,b:te},backend:o}),le=co({inputs:{input:J},backend:o}),fe=co({inputs:{input:se},backend:o}),de=jo({inputs:{input:J},backend:o}),ye=jo({inputs:{input:se},backend:o}),we=Ko({inputs:[le,fe],backend:o,attrs:{axis:0}}),_e=Ko({inputs:[de,ye],backend:o,attrs:{axis:0}}),Ve=o.data.get(we.dataId).values,Ze=o.data.get(_e.dataId).values;return o.disposeIntermediateTensorInfo(h),o.disposeIntermediateTensorInfo(d),o.disposeIntermediateTensorInfo(p),o.disposeIntermediateTensorInfo(b),o.disposeIntermediateTensorInfo(w),o.disposeIntermediateTensorInfo(y),o.disposeIntermediateTensorInfo(S),o.disposeIntermediateTensorInfo(v),o.disposeIntermediateTensorInfo(I),o.disposeIntermediateTensorInfo(z),o.disposeIntermediateTensorInfo(U),o.disposeIntermediateTensorInfo(W),o.disposeIntermediateTensorInfo(Z),o.disposeIntermediateTensorInfo(j),o.disposeIntermediateTensorInfo(X),o.disposeIntermediateTensorInfo(te),o.disposeIntermediateTensorInfo(J),o.disposeIntermediateTensorInfo(se),o.disposeIntermediateTensorInfo(le),o.disposeIntermediateTensorInfo(de),o.disposeIntermediateTensorInfo(fe),o.disposeIntermediateTensorInfo(ye),o.disposeIntermediateTensorInfo(we),o.disposeIntermediateTensorInfo(_e),{real:Ve,imag:Ze}}function yF(n,e,t){const s=new Float32Array(e*2);for(let o=0;o<e;o++){let r=0,i=0;for(let a=0;a<e;a++){const l=og(o*a,e,t),c=Kh(n,a);r+=c.real*l.real-c.imag*l.imag,i+=c.real*l.imag+c.imag*l.real}t&&(r/=e,i/=e),ng(s,r,i,o)}return s}function wF(n){const{inputs:e,backend:t}=n,{input:s}=e,o=q(s.shape),r=s.shape[s.shape.length-1],i=o/r,a=ze({inputs:{x:s},backend:t,attrs:{shape:[i,r]}}),l=$1(a,!1,t),c=ze({inputs:{x:l},backend:t,attrs:{shape:s.shape}});return t.disposeIntermediateTensorInfo(a),t.disposeIntermediateTensorInfo(l),c}const CF={kernelName:uu,backendName:"cpu",kernelFunc:wF};function Zd(n){const{backend:e,attrs:t}=n,{shape:s,value:o,dtype:r}=t,i=r||vo(o),a=Qe(i,q(s));return $F(a,o,i),e.makeTensorInfo(s,i,a)}const IF={kernelName:hu,backendName:"cpu",kernelFunc:Zd};function $F(n,e,t){n.fill(e)}const kF={kernelName:du,backendName:"cpu",kernelFunc:({inputs:n,attrs:e,backend:t})=>{const{image:s}=n,o=t,r=vt(s.dtype,q(s.shape)),[i,a,l,c]=s.shape,u=o.data.get(s.dataId).values;for(let d=0;d<i;d++){const p=d*l*a*c;for(let f=0;f<a;f++){const m=f*(l*c);for(let g=0;g<l;g++){const x=g*c;for(let b=0;b<c;b++){const w=Math.round(l-g-1),y=p+m+x+b;let C=u[y];if(w>=0&&w<l){const $=w*c,N=p+m+$+b;C=u[N]}r[y]=C}}}}return{dataId:o.write(r,s.shape,s.dtype),shape:s.shape,dtype:s.dtype}}};function vF(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,filter:r,bias:i,preluActivationWeights:a}=e,{strides:l,pad:c,dataFormat:u,dilations:h,dimRoundingMode:d,activation:p,leakyreluAlpha:f}=s;let m=C1({inputs:{x:o,filter:r},backend:t,attrs:{strides:l,pad:c,dataFormat:u,dilations:h,dimRoundingMode:d}});if(i){const g=m;if(u==="NCHW"&&i.shape.length===1&&i.shape[0]!==1){const x=ze({inputs:{x:i},backend:t,attrs:{shape:[i.shape[0],1,1]}});m=qo({inputs:{a:m,b:x},backend:t}),t.disposeIntermediateTensorInfo(x)}else m=qo({inputs:{a:m,b:i},backend:t});t.disposeIntermediateTensorInfo(g)}if(p){const g=m;if(u==="NCHW"&&p==="prelu"&&a.shape.length===1&&a.shape[0]!==1){const x=ze({inputs:{x:a},backend:t,attrs:{shape:[a.shape[0],1,1]}});m=ic(t,m,p,x,f),t.disposeIntermediateTensorInfo(x)}else m=ic(t,m,p,a,f);t.disposeIntermediateTensorInfo(g)}return m}const SF={kernelName:el,backendName:"cpu",kernelFunc:vF};function NF(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,filter:r,bias:i,preluActivationWeights:a}=e,{strides:l,pad:c,dataFormat:u,dilations:h,dimRoundingMode:d,activation:p,leakyreluAlpha:f}=s;let m=I1({inputs:{x:o,filter:r},backend:t,attrs:{strides:l,pad:c,dataFormat:u,dilations:h,dimRoundingMode:d}});if(i){const g=m;m=qo({inputs:{a:m,b:i},backend:t}),t.disposeIntermediateTensorInfo(g)}if(p){const g=m;m=ic(t,m,p,a,f),t.disposeIntermediateTensorInfo(g)}return m}const TF={kernelName:Jp,backendName:"cpu",kernelFunc:NF};function EF(n){const{inputs:e,backend:t}=n,{params:s,indices:o}=e,r=q(s.shape),i=o.shape,a=i[i.length-1],[l,c,u,h]=Rh(s,o);if(c===0)return t.makeTensorInfo(l,s.dtype,[]);const d=t.data.get(o.dataId).values,p=t.bufferSync(s),f=E0(d,p,s.dtype,c,a,u,h,s.shape,r);return t.makeTensorInfo(l,s.dtype,f.values)}const RF={kernelName:Op,backendName:"cpu",kernelFunc:EF};function AF(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,indices:r}=e,{axis:i,batchDims:a}=s;ie([o,r],"gatherV2");const l=Ce(i,o.shape)[0],c=t.data.get(r.dataId).values,u=o.shape[l];for(let y=0;y<c.length;++y){const C=c[y];k(C<=u-1&&C>=0,()=>`GatherV2: the index value ${C} is not in [0, ${u-1}]`)}let h=a;a==null&&(h=0);const d=q(r.shape),p=sd(o,r,l,h),f=ze({inputs:{x:o},backend:t,attrs:{shape:[p.batchSize,p.outerSize,p.dimSize,p.sliceSize]}}),m=ze({inputs:{x:r},backend:t,attrs:{shape:[p.batchSize,d/p.batchSize]}}),g=[p.batchSize,p.outerSize,d/p.batchSize,p.sliceSize],x=t.bufferSync(m),b=t.bufferSync(f),w=R0(b,x,g);return t.disposeIntermediateTensorInfo(f),t.disposeIntermediateTensorInfo(m),t.makeTensorInfo(p.outputShape,w.dtype,w.values)}const DF={kernelName:xa,backendName:"cpu",kernelFunc:AF};function FF(n){const{inputs:e,backend:t}=n,{input:s}=e,o=q(s.shape),r=s.shape[s.shape.length-1],i=o/r,a=ze({inputs:{x:s},backend:t,attrs:{shape:[i,r]}}),l=$1(a,!0,t),c=ze({inputs:{x:l},backend:t,attrs:{shape:s.shape}});return t.disposeIntermediateTensorInfo(a),t.disposeIntermediateTensorInfo(l),c}const _F={kernelName:pu,backendName:"cpu",kernelFunc:FF};const OF=De(Tr,n=>Number.isFinite(n)?1:0,"bool"),LF={kernelName:Tr,backendName:"cpu",kernelFunc:OF};const MF=De(Er,n=>Math.abs(n)===1/0?1:0,"bool"),PF={kernelName:Er,backendName:"cpu",kernelFunc:MF};const BF=De(Rr,n=>Number.isNaN(n)?1:0,"bool"),zF={kernelName:Rr,backendName:"cpu",kernelFunc:BF};function VF(n){const{backend:e,attrs:t}=n,{start:s,stop:o,num:r}=t,i=O0(s,o,r);return e.makeTensorInfo([i.length],"float32",i)}const WF={kernelName:Lp,backendName:"cpu",kernelFunc:VF};const UF=De(Dr,n=>Math.log1p(n)),GF={kernelName:Dr,backendName:"cpu",kernelFunc:UF};const HF=ot((n,e)=>n&&e),qF=pt(Ia,HF,null,"bool"),jF={kernelName:Ia,backendName:"cpu",kernelFunc:qF};const KF=De($a,n=>n?0:1,"bool"),XF={kernelName:$a,backendName:"cpu",kernelFunc:KF};const YF=ot((n,e)=>n||e),ZF=pt(ka,YF,null,"bool"),QF={kernelName:ka,backendName:"cpu",kernelFunc:ZF};function JF(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{depthRadius:r,bias:i,alpha:a,beta:l}=s;ie(o,"LRN");const c=o.shape[3],u=c-1,h=t.data.get(o.dataId).values,d=q(o.shape),p=new Float32Array(d);function f(m){const g=m%c;let x=m-g+Math.max(0,g-r);const b=m-g+Math.min(g+r,u);let w=0;for(;x<=b;x++){const y=h[x];w+=y*y}return w}for(let m=0;m<d;m++){const g=f(m),x=h[m]*Math.pow(i+a*g,-l);p[m]=x}return t.makeTensorInfo(o.shape,o.dtype,p)}const e_={kernelName:va,backendName:"cpu",kernelFunc:JF};function t_(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,y:r,dy:i}=e,{depthRadius:a,bias:l,alpha:c,beta:u}=s;ie(i,"LRNGrad");const h=q(i.shape),d=i.shape[3],p=t.data.get(i.dataId).values,f=t.data.get(o.dataId).values,m=t.data.get(r.dataId).values,g=new Float32Array(h),x=h;for(let b=0;b<x;b++){const w=b%d,y=b-w+Math.max(0,w-a),C=b-w+Math.min(d,w+a+1);let $=0;for(let N=y;N<C;N++)$+=Math.pow(f[N],2);$=c*$+l;for(let N=y;N<C;N++){let T=-2*c*u*f[N]*m[b]/$;b===N&&(T+=Math.pow($,-u)),T*=p[b],g[N]+=T}}return t.makeTensorInfo(i.shape,o.dtype,g)}const n_={kernelName:mu,backendName:"cpu",kernelFunc:t_};function k1(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{reductionIndices:r,keepDims:i}=s,a=t;let l=o.shape;const c=l.length,u=Ce(r,l);let h=u;const d=je(h,c);let p=a.data.get(o.dataId).values;if(d!=null){const y=new Array(c);for(let C=0;C<y.length;C++)y[C]=l[d[C]];p=Gd(p,l,o.dtype,d,y),h=et(h.length,c),l=y}ie(o,"max"),Ct("max",h,c);const[f,m]=gt(l,h),g=q(m),x=M0(p,g,f,o.dtype),b=a.write(x,f,o.dtype);let w=f;return i&&(w=rt(f,u)),{dataId:b,shape:w,dtype:o.dtype}}const s_={kernelName:Sa,backendName:"cpu",kernelFunc:k1};function o_(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e;ie(o,"maxPool");const{filterSize:r,strides:i,pad:a,dimRoundingMode:l}=s,c=1;k(Nt(i,c),()=>`Error in maxPool: Either strides or dilations must be 1. Got strides ${i} and dilations '${c}'`);const u=sn(o.shape,r,i,c,a,l);let h;if(u.filterWidth===1&&u.filterHeight===1&&Ee(u.inShape,u.outShape))h=Hn({inputs:{x:o},backend:t});else{const d=t.data.get(o.dataId).values,p=ce(o.shape),f=jd(d,o.shape,o.dtype,p,u,"max");h=t.makeTensorInfo(u.outShape,o.dtype,f.values)}return h}const r_={kernelName:Na,backendName:"cpu",kernelFunc:o_};function i_(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{filterSize:r,strides:i,pad:a,dimRoundingMode:l,dataFormat:c}=s;ie(o,"maxPool3d");const u=Yn(o.shape,r,i,1,a,l,c),h=t.data.get(o.dataId).values,d=w1(h,o.shape,o.dtype,ce(o.shape),u,"max");return t.makeTensorInfo(d.shape,"float32",d.values)}const a_={kernelName:Ta,backendName:"cpu",kernelFunc:i_};function l_(n){const{inputs:e,backend:t,attrs:s}=n,{dy:o,input:r}=e,{filterSize:i,strides:a,pad:l,dimRoundingMode:c}=s;ie([o,r],"maxPool3DGrad");const u=Yn(r.shape,i,a,1,l,c),h=t.bufferSync(r),d=ZA(h,u),p=u.strideDepth,f=u.strideHeight,m=u.strideWidth,g=u.dilationDepth,x=u.dilationHeight,b=u.dilationWidth,w=u.effectiveFilterDepth,y=u.effectiveFilterHeight,C=u.effectiveFilterWidth,$=w-1-u.padInfo.front,N=C-1-u.padInfo.left,T=y-1-u.padInfo.top,S=Ie(r.shape,"float32"),v=t.bufferSync(o);for(let I=0;I<u.batchSize;++I)for(let R=0;R<u.inChannels;++R)for(let F=0;F<u.inDepth;++F)for(let O=0;O<u.inHeight;++O)for(let L=0;L<u.inWidth;++L){const z=F-$,U=O-T,W=L-N;let G=0;for(let K=0;K<w;K+=g){const Z=(z+K)/p;if(!(Z<0||Z>=u.outDepth||Math.floor(Z)!==Z))for(let j=0;j<y;j+=x){const X=(U+j)/f;if(!(X<0||X>=u.outHeight||Math.floor(X)!==X))for(let te=0;te<C;te+=b){const J=(W+te)/m;if(J<0||J>=u.outWidth||Math.floor(J)!==J)continue;const se=w*y*C-1-d.get(I,Z,X,J,R),le=K*y*C+j*C+te,fe=se===le?1:0;if(fe===0)continue;const de=v.get(I,Z,X,J,R);G+=de*fe}}}S.set(G,I,F,O,L,R)}return t.makeTensorInfo(S.shape,S.dtype,S.values)}const c_={kernelName:xu,backendName:"cpu",kernelFunc:l_};function u_(n){const{inputs:e,backend:t,attrs:s}=n,{dy:o,input:r,output:i}=e,a=r;ie([r,i],"maxPoolGrad");const{filterSize:l,strides:c,pad:u,dimRoundingMode:h}=s,d=sn(a.shape,l,c,1,u,h),p=t.data.get(a.dataId).values,f=Ie(d.outShape,a.dtype,y1(p,a.shape,a.dtype,d).values),m=d.strideHeight,g=d.strideWidth,x=d.dilationHeight,b=d.dilationWidth,w=d.effectiveFilterHeight,y=d.effectiveFilterWidth,C=y-1-d.padInfo.left,$=w-1-d.padInfo.top,N=Ie(a.shape,"float32"),T=t.data.get(o.dataId).values,S=Ie(o.shape,"float32",T);for(let v=0;v<d.batchSize;++v)for(let I=0;I<d.inChannels;++I)for(let R=0;R<d.inHeight;++R)for(let F=0;F<d.inWidth;++F){const O=R-$,L=F-C;let z=0;for(let U=0;U<w;U+=x){const W=(O+U)/m;if(!(W<0||W>=d.outHeight||Math.floor(W)!==W))for(let G=0;G<y;G+=b){const K=(L+G)/g;if(K<0||K>=d.outWidth||Math.floor(K)!==K)continue;const Z=w*y-1-f.get(v,W,K,I),j=U*y+G,X=Z===j?1:0;if(X===0)continue;const te=S.get(v,W,K,I);z+=te*X}}N.set(z,v,R,F,I)}return t.makeTensorInfo(N.shape,N.dtype,N.values)}const h_={kernelName:gu,backendName:"cpu",kernelFunc:u_};function d_(n,e,t,s,o){const r=ce(e),i=jd(n,e,t,r,o,"max"),a=y1(n,e,t,o,!0,s);return[i.values,a.values]}const p_={kernelName:Mp,backendName:"cpu",kernelFunc:({inputs:n,attrs:e,backend:t})=>{const{x:s}=n,{filterSize:o,strides:r,pad:i,includeBatchInIndex:a}=e,l=t;ie(s,"MaxPoolWithArgmax");const c=l.data.get(s.dataId).values,u=sn(s.shape,o,r,[1,1],i),[h,d]=d_(c,s.shape,s.dtype,a,u),p=l.write(h,u.outShape,s.dtype),f=l.write(d,u.outShape,s.dtype);return[{dataId:p,shape:u.outShape,dtype:s.dtype},{dataId:f,shape:u.outShape,dtype:"int32"}]}};function f_(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{axis:r,keepDims:i}=s,a=Ce(r,o.shape),c=gt(o.shape,a)[1],u=q(c),h=[],d=t.makeTensorInfo([],"float32",new Float32Array([u]));h.push(d);const p=Ns({inputs:{x:o},backend:t,attrs:{dtype:"float32"}});h.push(p);const f=Kd({inputs:{a:p,b:d},backend:t});h.push(f);const m=Pi({inputs:{x:f},backend:t,attrs:{axis:r,keepDims:i}});return h.forEach(g=>t.disposeIntermediateTensorInfo(g)),m}const m_={kernelName:Ea,backendName:"cpu",kernelFunc:f_};function g_(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{axis:r,keepDims:i}=s;ie(o,"min");const a=Ce(r,o.shape);let l=a;const c=je(l,o.shape.length);let u=o;c!=null&&(u=Ut({inputs:{x:o},backend:t,attrs:{perm:c}}),l=et(l.length,o.shape.length)),Ct("min",l,u.shape.length);const[h,d]=gt(u.shape,l),p=q(d),f=St(q(h),u.dtype),m=t.data.get(u.dataId).values;for(let x=0;x<f.length;++x){const b=x*p;let w=m[b];for(let y=0;y<p;++y){const C=m[b+y];(Number.isNaN(C)||C<w)&&(w=C)}f[x]=w}c!=null&&t.disposeIntermediateTensorInfo(u);const g=t.makeTensorInfo(h,u.dtype,f);if(i){const x=rt(h,a),b=ze({inputs:{x:g},backend:t,attrs:{shape:x}});return t.disposeIntermediateTensorInfo(g),b}return g}const x_={kernelName:Ra,backendName:"cpu",kernelFunc:g_};function b_(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{paddings:r,mode:i}=s;ie(o,"mirrorPad");const a=r.map((w,y)=>w[0]+o.shape[y]+w[1]),l=r.map(w=>w[0]),c=r.map((w,y)=>w[0]+o.shape[y]),u=i==="reflect"?0:1,h=t.data.get(o.dataId).values,d=o.shape.length,p=ce(o.shape),f=q(a),m=a.length,g=ce(a),x=vt(o.dtype,f);for(let w=0;w<f;w++){let y=So(w,m,g);for(let $=0;$<m;$++)y[$]<l[$]?y[$]=l[$]*2-y[$]-u:y[$]>=c[$]&&(y[$]=(c[$]-1)*2-y[$]+u);y=y.map(($,N)=>$-l[N]);const C=Rn(y,d,p);x[w]=h[C]}return{dataId:t.write(x,a,o.dtype),shape:a,dtype:o.dtype}}const y_={kernelName:Aa,backendName:"cpu",kernelFunc:b_};const w_=ot((n,e)=>{const t=n%e;return n<0&&e<0||n>=0&&e>=0?t:(t+e)%e}),C_=pt(Or,w_),I_={kernelName:Or,backendName:"cpu",kernelFunc:C_};function v1(n){const{inputs:e,backend:t,attrs:s}=n,{logits:o}=e,{dim:r}=s,i=o.shape.length;let a=r;if(a===-1&&(a=i-1),a!==i-1)throw Error(`Softmax along a non-last dimension is not yet supported. Logits was rank ${i} and dim was ${a}`);const l=Ce([a],o.shape),c=k1({inputs:{x:o},backend:t,attrs:{reductionIndices:l,keepDims:!1}}),u=rt(c.shape,l),h=ze({inputs:{x:c},backend:t,attrs:{shape:u}}),d=qd({inputs:{a:o,b:h},backend:t}),p=v0({inputs:{x:d},backend:t}),f=Pi({inputs:{x:p},backend:t,attrs:{axis:l,keepDims:!1}}),m=ze({inputs:{x:f},backend:t,attrs:{shape:u}}),g=Kd({inputs:{a:p,b:m},backend:t});return t.disposeIntermediateTensorInfo(c),t.disposeIntermediateTensorInfo(h),t.disposeIntermediateTensorInfo(d),t.disposeIntermediateTensorInfo(p),t.disposeIntermediateTensorInfo(f),t.disposeIntermediateTensorInfo(m),g}const $_={kernelName:Xa,backendName:"cpu",kernelFunc:v1};function k_(n){const{inputs:e,backend:t,attrs:s}=n,{logits:o}=e,{numSamples:r,seed:i,normalized:a}=s;ie(o,"multinomial");const l=a?o:v1({inputs:{logits:o},backend:t,attrs:{dim:-1}}),c=l.shape[0],u=l.shape[1],h=t.data.get(l.dataId).values,d=[c,r],p=St(q(d),"int32");for(let f=0;f<c;++f){const m=f*u,g=new Float32Array(u-1);g[0]=h[m];for(let w=1;w<g.length;++w)g[w]=g[w-1]+h[m+w];const x=ph.alea(i.toString()),b=f*r;for(let w=0;w<r;++w){const y=x();p[b+w]=g.length;for(let C=0;C<g.length;C++)if(y<g[C]){p[b+w]=C;break}}}return a||t.disposeIntermediateTensorInfo(l),t.makeTensorInfo(d,"int32",p)}const v_={kernelName:Pp,backendName:"cpu",kernelFunc:k_};const S_=kh;function N_(n){const{inputs:e,backend:t,attrs:s}=n,{boxes:o,scores:r}=e,{maxOutputSize:i,iouThreshold:a,scoreThreshold:l}=s;ie(o,"NonMaxSuppression");const c=t.data.get(o.dataId).values,u=t.data.get(r.dataId).values,{selectedIndices:h}=S_(c,u,i,a,l);return t.makeTensorInfo([h.length],"int32",new Int32Array(h))}const T_={kernelName:bu,backendName:"cpu",kernelFunc:N_};const E_=vh;function R_(n){const{inputs:e,backend:t,attrs:s}=n,{boxes:o,scores:r}=e,{maxOutputSize:i,iouThreshold:a,scoreThreshold:l,padToMaxOutputSize:c}=s;ie(o,"NonMaxSuppressionPadded");const u=t.data.get(o.dataId).values,h=t.data.get(r.dataId).values,{selectedIndices:d,validOutputs:p}=E_(u,h,i,a,l,c);return[t.makeTensorInfo([d.length],"int32",new Int32Array(d)),t.makeTensorInfo([],"int32",new Int32Array([p]))]}const A_={kernelName:yu,backendName:"cpu",kernelFunc:R_};const D_=Sh;function F_(n){const{inputs:e,backend:t,attrs:s}=n,{boxes:o,scores:r}=e,{maxOutputSize:i,iouThreshold:a,scoreThreshold:l,softNmsSigma:c}=s;ie(o,"NonMaxSuppressionWithScore");const u=t.data.get(o.dataId).values,h=t.data.get(r.dataId).values,d=i,p=a,f=l,m=c,{selectedIndices:g,selectedScores:x}=D_(u,h,d,p,f,m);return[t.makeTensorInfo([g.length],"int32",new Int32Array(g)),t.makeTensorInfo([x.length],"float32",new Float32Array(x))]}const __={kernelName:wu,backendName:"cpu",kernelFunc:F_};function O_(n){const{inputs:e,backend:t,attrs:s}=n,{indices:o}=e,{dtype:r,depth:i,onValue:a,offValue:l}=s;ie(o,"oneHot");const c=q(o.shape),u=new Float32Array(c*i);u.fill(l);const h=t.data.get(o.dataId).values;for(let d=0;d<c;++d)h[d]>=0&&h[d]<i&&(u[d*i+h[d]]=a);return t.makeTensorInfo([...o.shape,i],r,u)}const L_={kernelName:Oa,backendName:"cpu",kernelFunc:O_};function lc(n){const{inputs:e,backend:t}=n,{x:s}=e;if(s.dtype==="string")throw new Error("zerosLike is not supported for string tensors");if(s.dtype==="complex64"){const o=co({inputs:{input:s},backend:t}),r=lc({inputs:{x:o},backend:t}),i=jo({inputs:{input:s},backend:t}),a=lc({inputs:{x:i},backend:t}),l=Kt({inputs:{real:r,imag:a},backend:t});return t.disposeIntermediateTensorInfo(o),t.disposeIntermediateTensorInfo(r),t.disposeIntermediateTensorInfo(i),t.disposeIntermediateTensorInfo(a),l}else return Zd({backend:t,attrs:{shape:s.shape,value:0,dtype:s.dtype}})}const M_={kernelName:Qa,backendName:"cpu",kernelFunc:lc};function S1(n){const{inputs:e,backend:t}=n,{x:s}=e;if(s.dtype==="string")throw new Error("onesLike is not supported for string tensors");if(s.dtype==="complex64"){const o=co({inputs:{input:s},backend:t}),r=S1({inputs:{x:o},backend:t}),i=jo({inputs:{input:s},backend:t}),a=lc({inputs:{x:i},backend:t}),l=Kt({inputs:{real:r,imag:a},backend:t});return t.disposeIntermediateTensorInfo(o),t.disposeIntermediateTensorInfo(r),t.disposeIntermediateTensorInfo(i),t.disposeIntermediateTensorInfo(a),l}else return Zd({backend:t,attrs:{shape:s.shape,value:1,dtype:s.dtype}})}const P_={kernelName:_a,backendName:"cpu",kernelFunc:S1};function N1(n){const{inputs:e,backend:t,attrs:s}=n,{axis:o}=s;if(e.length===1)return ac({inputs:{input:e[0]},backend:t,attrs:{dim:o}});const r=e[0].shape,i=e[0].dtype;e.forEach(u=>{_c(r,u.shape,"All tensors passed to stack must have matching shapes"),k(i===u.dtype,()=>"All tensors passed to stack must have matching dtypes")});const a=[],l=e.map(u=>{const h=ac({inputs:{input:u},backend:t,attrs:{dim:o}});return a.push(h),h}),c=Ko({inputs:l,backend:t,attrs:{axis:o}});return a.forEach(u=>t.disposeIntermediateTensorInfo(u)),c}const B_={kernelName:La,backendName:"cpu",kernelFunc:N1};function z_(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{paddings:r,constantValue:i}=s;ie(o,"pad");const a=r.map((b,w)=>b[0]+o.shape[w]+b[1]),l=r.map(b=>b[0]),c=t.data.get(o.dataId).values,u=q(o.shape),h=o.shape.length,d=ce(o.shape),p=q(a),f=a.length,m=ce(a),g=vt(o.dtype,p);i!==0&&g.fill(i);for(let b=0;b<u;b++){const y=So(b,h,d).map(($,N)=>$+l[N]),C=Rn(y,f,m);g[C]=c[b]}return{dataId:t.write(g,a,o.dtype),shape:a,dtype:o.dtype}}const T1={kernelName:Ma,backendName:"cpu",kernelFunc:z_};const V_=ot((n,e)=>Math.pow(n,e)),W_=pt(Mr,V_),U_={kernelName:Mr,backendName:"cpu",kernelFunc:W_};function G_(n){const{inputs:e,backend:t,attrs:s}=n,{paramsNestedSplits:o,paramsDenseValues:r,indices:i}=e,{outputRaggedRank:a}=s,l=o.map(x=>t.data.get(x.dataId).values),c=o.map(x=>x.shape),u=t.data.get(r.dataId).values,h=t.data.get(i.dataId).values,[d,p,f]=G0(l,c,u,r.shape,r.dtype,h,i.shape),m=d.map(x=>t.makeTensorInfo([x.length],"int32",x)),g=t.makeTensorInfo(f,r.dtype,p);return m.concat([g])}const H_={kernelName:Bp,backendName:"cpu",kernelFunc:G_};function q_(n){const{inputs:e,backend:t}=n,{starts:s,limits:o,deltas:r}=e,i=t.data.get(s.dataId).values,a=t.data.get(o.dataId).values,l=t.data.get(r.dataId).values,[c,u]=q0(i,s.shape,s.dtype,a,o.shape,l,r.shape),h=t.makeTensorInfo([c.length],"int32",c),d=t.makeTensorInfo([u.length],s.dtype,u);return[h,d]}const j_={kernelName:zp,backendName:"cpu",kernelFunc:q_};function K_(n){const{inputs:e,backend:t,attrs:s}=n,{shape:o,values:r,defaultValue:i,rowPartitionTensors:a}=e,{rowPartitionTypes:l}=s,c=t.data.get(o.dataId).values,u=t.data.get(r.dataId).values,h=t.data.get(i.dataId).values,d=a.map(g=>t.data.get(g.dataId).values),p=a.map(g=>g.shape),[f,m]=X0(c,o.shape,u,r.shape,r.dtype,h,i.shape,d,p,l);return t.makeTensorInfo(f,r.dtype,m)}const X_={kernelName:Vp,backendName:"cpu",kernelFunc:K_};function Y_(n){const{backend:e,attrs:t}=n,{start:s,stop:o,dtype:r,step:i}=t,a=Y0(s,o,i,r);return e.makeTensorInfo([a.length],r,a)}const Z_={kernelName:Cu,backendName:"cpu",kernelFunc:Y_};const Q_=De(Pr,n=>1/n),J_={kernelName:Pr,backendName:"cpu",kernelFunc:Q_};function eO(n){const{inputs:e,backend:t,attrs:s}=n,{images:o}=e,{alignCorners:r,halfPixelCenters:i,size:a}=s;ie(o,"resizeBilinear");const l=ce(o.shape),[c,u]=a,[h,d,p,f]=o.shape,m=t.data.get(o.dataId).values,g=new Float32Array(q([h,c,u,f])),x=[r&&c>1?d-1:d,r&&u>1?p-1:p],b=[r&&c>1?c-1:c,r&&u>1?u-1:u];let w=0;const y=x[0]/b[0],C=x[1]/b[1];for(let $=0;$<h;$++)for(let N=0;N<c;N++){let T;i?T=y*(N+.5)-.5:T=y*N;const S=Math.max(0,Math.floor(T)),v=T-S,I=Math.min(d-1,Math.ceil(T)),R=$*l[0]+S*l[1],F=$*l[0]+I*l[1];for(let O=0;O<u;O++){let L;i?L=C*(O+.5)-.5:L=C*O;const z=Math.max(0,Math.floor(L)),U=L-z,W=Math.min(p-1,Math.ceil(L)),G=R+z*l[2],K=F+z*l[2],Z=R+W*l[2],j=F+W*l[2];for(let X=0;X<f;X++){const te=m[G+X],J=m[K+X],se=m[Z+X],le=m[j+X],fe=te+(se-te)*U,de=J+(le-J)*U,ye=fe+(de-fe)*v;g[w++]=ye}}}return t.makeTensorInfo([h,c,u,f],"float32",g)}const tO={kernelName:Wa,backendName:"cpu",kernelFunc:eO};function nO(n){const{inputs:e,backend:t,attrs:s}=n,{images:o,dy:r}=e,{alignCorners:i}=s;ie([r,o],"resizeBilinearGrad");const a=ce(o.shape),[l,c,u,h]=o.shape,[,d,p]=r.shape,f=new Float32Array(l*c*u*h),m=[i&&d>1?c-1:c,i&&p>1?u-1:u],g=[i&&d>1?d-1:d,i&&p>1?p-1:p],x=m[0]/g[0],b=m[1]/g[1],w=t.data.get(r.dataId).values;let y=0;for(let C=0;C<l;C++){const $=C*a[0];for(let N=0;N<d;N++){const T=N*x,S=Math.floor(T),v=Math.min(Math.ceil(T),c-1),I=$+S*a[1],R=$+v*a[1],F=T-S,O=1-F;for(let L=0;L<p;L++){const z=L*b,U=Math.floor(z),W=Math.min(Math.ceil(z),u-1),G=z-U,K=1-G,Z=I+U*a[2],j=I+W*a[2],X=R+U*a[2],te=R+W*a[2],J=O*K,se=O*G,le=F*K,fe=F*G;for(let de=0;de<h;de++){const ye=w[y++];f[Z+de]+=ye*J,f[j+de]+=ye*se,f[X+de]+=ye*le,f[te+de]+=ye*fe}}}}return t.makeTensorInfo([l,u,c,h],"float32",f)}const sO={kernelName:ku,backendName:"cpu",kernelFunc:nO};function oO(n){const{inputs:e,backend:t,attrs:s}=n,{images:o}=e,{alignCorners:r,halfPixelCenters:i,size:a}=s;ie(o,"resizeNearestNeighbor");const l=ce(o.shape),[c,u]=a,[h,d,p,f]=o.shape,m=t.data.get(o.dataId).values,g=new Float32Array(h*c*u*f),x=[r&&c>1?d-1:d,r&&u>1?p-1:p],b=[r&&c>1?c-1:c,r&&u>1?u-1:u],w=x[0]/b[0],y=x[1]/b[1];let C=0;for(let $=0;$<h;$++){const N=$*l[0];for(let T=0;T<c;T++){const S=i?w*(T+.5):w*T;let v=Math.min(d-1,r?Math.round(S):Math.floor(S));i&&(v=Math.max(0,v));const I=N+v*l[1];for(let R=0;R<u;R++){const F=i?y*(R+.5):y*R;let O=Math.min(p-1,r?Math.round(F):Math.floor(F));i&&(O=Math.max(0,O));const L=I+O*l[2];for(let z=0;z<f;z++){const U=m[L+z];g[C++]=U}}}}return t.makeTensorInfo([h,c,u,f],o.dtype,g)}const rO={kernelName:Va,backendName:"cpu",kernelFunc:oO};function iO(n){const{inputs:e,backend:t,attrs:s}=n,{images:o,dy:r}=e,{alignCorners:i}=s;ie([r,o],"resizeNearestNeighborGrad");const a=ce(o.shape),l=ce(r.shape),[c,u,h,d]=o.shape,[,p,f]=r.shape,m=new Float32Array(c*u*h*d),g=t.data.get(r.dataId).values,x=[i&&p>1?u-1:u,i&&f>1?h-1:h],b=[i&&p>1?p-1:p,i&&f>1?f-1:f],w=x[0]/b[0],y=x[1]/b[1],C=1/w,$=1/y,N=Math.ceil(C)*2+2,T=Math.ceil($)*2+2;for(let S=0;S<c;S++){const v=S*a[0];for(let I=0;I<u;I++){const R=v+I*a[1],F=Math.floor(I*C),O=Math.floor(F-N/2);for(let L=0;L<h;L++){const z=R+L*a[2],U=Math.floor(L*$),W=Math.floor(U-T/2);for(let G=0;G<d;G++){let K=0;for(let Z=0;Z<N;Z++){const j=Z+O;if(j<0||j>=p)continue;const X=v+j*l[1],te=j*w,J=Math.min(u-1,i?Math.round(te):Math.floor(te));if(I===J)for(let se=0;se<T;se++){const le=se+W;if(le<0||le>=f)continue;const fe=X+le*l[2],de=le*y,ye=Math.min(h-1,i?Math.round(de):Math.floor(de));L===ye&&(K+=g[fe+G])}}m[z+G]=K}}}}return t.makeTensorInfo(o.shape,o.dtype,m)}const aO={kernelName:$u,backendName:"cpu",kernelFunc:iO};function lO(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{dims:r}=s;ie(o,"reverse");const i=o.shape.length,a=Ce(r,o.shape);if(i===0)return Hn({inputs:{x:o},backend:t});const l=new bt(o.shape,o.dtype),c=t.bufferSync(o);for(let u=0;u<l.size;u++){const h=l.indexToLoc(u),d=h.slice();a.forEach(p=>d[p]=o.shape[p]-1-d[p]),l.set(c.get(...d),...h)}return t.makeTensorInfo(l.shape,l.dtype,l.values)}const cO={kernelName:Ua,backendName:"cpu",kernelFunc:lO};const uO={kernelName:Au,backendName:"cpu",kernelFunc:({inputs:n,attrs:e,backend:t})=>{const{image:s}=n,{radians:o,fillValue:r,center:i}=e,a=t,l=vt(s.dtype,q(s.shape)),[c,u,h,d]=s.shape,[p,f]=Bh(i,u,h),m=255,g=Math.sin(o),x=Math.cos(o),b=a.data.get(s.dataId).values;for(let y=0;y<c;y++){const C=y*h*u*d;for(let $=0;$<u;$++){const N=$*(h*d);for(let T=0;T<h;T++){const S=T*d;for(let v=0;v<d;v++){const I=[c,$,T,v],R=I[2],F=I[1];let O=(R-p)*x-(F-f)*g,L=(R-p)*g+(F-f)*x;O=Math.round(O+p),L=Math.round(L+f);let z=r;if(typeof r!="number"&&(v===3?z=m:z=r[v]),O>=0&&O<h&&L>=0&&L<u){const W=L*(h*d),G=O*d,K=C+W+G+v;z=b[K]}const U=C+N+S+v;l[U]=z}}}}return{dataId:a.write(l,s.shape,s.dtype),shape:s.shape,dtype:s.dtype}}};const hO=De(Vr,n=>{const e=Math.floor(n);return n-e<.5?Math.floor(n):n-e>.5?Math.ceil(n):e%2===0?e:e+1}),dO={kernelName:Vr,backendName:"cpu",kernelFunc:hO};function pO(n){const{inputs:e,backend:t,attrs:s}=n,{indices:o,updates:r}=e,{shape:i}=s,{sliceRank:a,numUpdates:l,sliceSize:c,strides:u,outputSize:h}=to(r,o,i),d=!0,p=t.bufferSync(o),f=t.bufferSync(r),m=uo(p,f,i,h,c,l,a,u,0,d);return t.makeTensorInfo(i,m.dtype,m.values)}const fO={kernelName:Wp,backendName:"cpu",kernelFunc:pO};function mO(n,e){let t=0,s=n.length,o=0;for(;t<s;)o=Math.floor((t+s)/2),n[o]<e?t=o+1:s=o;return s}function gO(n,e){let t=0,s=n.length,o=0;for(;t<s;)o=Math.floor((t+s)/2),n[o]<=e?t=o+1:s=o;return s}function xO(n,e,t,s,o,r){const i=Qe("int32",t*o);for(let a=0;a<t;++a){const l=n.slice(a*s,(a+1)*s),c=a*o;for(let u=0;u<o;++u)i[c+u]=r==="left"?mO(l,e[u+c]):gO(l,e[u+c])}return i}function bO(n){const{inputs:e,backend:t,attrs:s}=n,{sortedSequence:o,values:r}=e,{side:i}=s,a=t.data.get(o.dataId).values,l=t.data.get(r.dataId).values,c=xO(a,l,o.shape[0],o.shape[1],r.shape[1],i);return t.makeTensorInfo(r.shape,"int32",c)}const yO={kernelName:Gp,backendName:"cpu",kernelFunc:bO};function wO(n){const{inputs:e,backend:t}=n,{condition:s,t:o,e:r}=e;ie([s,o,r],"select");const i=s.shape.length,a=t.data.get(s.dataId).values,l=t.data.get(o.dataId).values,c=t.data.get(r.dataId).values,u=Gt(o.dtype,r.dtype),h=St(q(o.shape),u);let d=0;const p=i===0||i>1||o.shape.length===1?1:q(o.shape.slice(1));for(let f=0;f<a.length;f++)for(let m=0;m<p;m++)a[f]===1?h[d++]=l[f]:h[d++]=c[f];return t.makeTensorInfo(o.shape,u,h)}const CO={kernelName:Ga,backendName:"cpu",kernelFunc:wO};const IO=Rl,$O=Al,kO=De(Ur,n=>n>=0?$O*n:IO*(Math.exp(n)-1)),vO={kernelName:Ur,backendName:"cpu",kernelFunc:kO};const SO=De(qr,n=>n<0?-1:n>0?1:0),NO={kernelName:qr,backendName:"cpu",kernelFunc:SO};const TO=De(Gr,n=>Math.sin(n)),EO={kernelName:Gr,backendName:"cpu",kernelFunc:TO};const RO=De(Hr,n=>Math.sinh(n)),AO={kernelName:Hr,backendName:"cpu",kernelFunc:RO};const E1=Math.log(11920928955078125e-23)+2,DO=De(Kr,n=>{const e=n>-E1,t=n<E1,s=Math.exp(n);let o;return t?o=s:e?o=n:o=Math.log(1+s),o}),FO={kernelName:Kr,backendName:"cpu",kernelFunc:DO};function _O(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{blockShape:r,paddings:i}=s;ie([o],"spaceToBatchND");const a=q(r),l=[[0,0]];l.push(...i);for(let $=1+r.length;$<o.shape.length;++$)l.push([0,0]);const c=T1.kernelFunc({inputs:{x:o},backend:t,attrs:{paddings:l,constantValue:0}}),u=bi(c.shape,r,a,!1),h=yi(u.length,r.length,!1),d=wi(c.shape,r,a,!1),m=ze({inputs:{x:c},backend:t,attrs:{shape:u}}),b=Ut({inputs:{x:m},backend:t,attrs:{perm:h}}),C=ze({inputs:{x:b},backend:t,attrs:{shape:d}});return t.disposeIntermediateTensorInfo(c),t.disposeIntermediateTensorInfo(m),t.disposeIntermediateTensorInfo(b),C}const OO={kernelName:ja,backendName:"cpu",kernelFunc:_O};function LO(n){const{inputs:e,backend:t}=n,{indices:s,values:o,denseShape:r,defaultValue:i}=e;if(r.shape.length!==1)throw new Error(`Dense shape must be a vector, saw:
        ${r.shape}`);if(s.shape.length!==2)throw new Error(`Indices must be a matrix, saw:
        ${s.shape}`);if(o.shape.length!==1)throw new Error(`Values must be a vector, saw:
        ${o.shape}`);if(i.shape.length!==0)throw new Error(`Default value must be a scalar, saw:
        ${i.shape}`);const a=t.data.get(s.dataId).values,l=t.data.get(o.dataId).values,c=t.data.get(r.dataId).values,u=t.data.get(i.dataId).values[0],[h,d,p,f,m]=e1(a,s.shape,s.dtype,l,o.dtype,c,u);return[t.makeTensorInfo(d,s.dtype,h),t.makeTensorInfo([d[0]],o.dtype,p),t.makeTensorInfo([f.length],"bool",new Uint8Array(f.map(g=>Number(g)))),t.makeTensorInfo([m.length],s.dtype,new Int32Array(m))]}const MO={kernelName:Hp,backendName:"cpu",kernelFunc:LO};function PO(n){const{inputs:e,backend:t}=n,{inputIndices:s,inputShape:o,newShape:r}=e;if(s.shape.length!==2)throw new Error(`Input indices should be a matrix but received shape
        ${s.shape}`);if(o.shape.length!==1)throw new Error(`Input shape should be a vector but received shape
        ${o.shape}`);if(r.shape.length!==1)throw new Error(`Target shape should be a vector but received shape ${r.shape}`);const i=Array.from(t.data.get(o.dataId).values),a=t.data.get(s.dataId).values,l=Array.from(t.data.get(r.dataId).values),[c,u,h]=t1(a,s.shape,s.dtype,i,l);return[t.makeTensorInfo(u,s.dtype,c),t.makeTensorInfo([h.length],r.dtype,new Int32Array(h))]}const BO={kernelName:qp,backendName:"cpu",kernelFunc:PO};function zO(n){const{inputs:e,backend:t}=n,{data:s,indices:o,segmentIds:r}=e;if(s.shape.length<1)throw new Error("Data should be at least 1 dimensional but received scalar");if(o.shape.length!==1)throw new Error(`Indices should be a vector but received shape
          ${o.shape}`);if(r.shape.length!==1)throw new Error(`Segment ids should be a vector but received shape
          ${r.shape}`);if(o.shape[0]!==r.shape[0])throw new Error("segmentIds and indices should have same size.");const i=t.data.get(s.dataId).values,a=t.data.get(o.dataId).values,l=t.data.get(r.dataId).values,[c,u]=Hd(i,s.shape,s.dtype,a,l,!0);return t.makeTensorInfo(u,s.dtype,c)}const VO={kernelName:jp,backendName:"cpu",kernelFunc:zO};function WO(n){const{inputs:e,backend:t}=n,{data:s,indices:o,segmentIds:r}=e;if(s.shape.length<1)throw new Error("Data should be at least 1 dimensional but received scalar");if(o.shape.length!==1)throw new Error(`Indices should be a vector but received shape
         ${o.shape}`);if(r.shape.length!==1)throw new Error(`Segment ids should be a vector but received shape
         ${r.shape}`);if(o.shape[0]!==r.shape[0])throw new Error("segmentIds and indices should have same size.");const i=t.data.get(s.dataId).values,a=t.data.get(o.dataId).values,l=t.data.get(r.dataId).values,[c,u]=Hd(i,s.shape,s.dtype,a,l);return t.makeTensorInfo(u,s.dtype,c)}const UO={kernelName:Kp,backendName:"cpu",kernelFunc:WO};function GO(n){const{inputs:e,backend:t,attrs:s}=n,{sparseIndices:o,sparseValues:r,defaultValue:i}=e,{outputShape:a}=s,{sliceRank:l,numUpdates:c,sliceSize:u,strides:h,outputSize:d}=to(r,o,a),p=!1,f=t.bufferSync(o);let m;switch(r.dtype){case"bool":{const g=t.bufferSync(r),x=!!t.data.get(i.dataId).values[0];m=uo(f,g,a,d,u,c,l,h,x,p);break}case"float32":{const g=t.bufferSync(r),x=t.data.get(i.dataId).values[0];m=uo(f,g,a,d,u,c,l,h,x,p);break}case"int32":{const g=t.bufferSync(r),x=t.data.get(i.dataId).values[0];m=uo(f,g,a,d,u,c,l,h,x,p);break}case"string":{const g=t.bufferSync(r),x=hs(t.data.get(i.dataId).values[0]);m=uo(f,g,a,d,u,c,l,h,x,p);break}default:throw new Error(`Unsupported type ${r.dtype}`)}return t.makeTensorInfo(a,m.dtype,m.values)}const HO={kernelName:Xp,backendName:"cpu",kernelFunc:GO};function qO(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{numOrSizeSplits:r,axis:i}=s,a=Ce(i,o.shape)[0],l=td(o,r,a),c=new Array(o.shape.length).fill(0),u=o.shape.slice();return l.map(h=>{const d=[...u];d[a]=h;const p=ho({inputs:{x:o},backend:t,attrs:{begin:c,size:d}});return c[a]+=h,p})}const jO={kernelName:Ka,backendName:"cpu",kernelFunc:qO};const KO={kernelName:vu,backendName:"cpu",kernelFunc:({inputs:n,backend:e})=>{const{x:t}=n,s=e;ie(t,"square");const o=s.data.get(t.dataId).values,r=new Float32Array(o.length);for(let a=0;a<o.length;++a){const l=o[a];r[a]=l*l}return{dataId:s.write(r,t.shape,t.dtype),shape:t.shape,dtype:t.dtype}}};const XO=De(ti,(n,e)=>{const t=e;return isNaN(n)?NaN:n>0?1:t.alpha}),YO={kernelName:ti,backendName:"cpu",kernelFunc:XO};function ZO(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{begin:r,end:i,strides:a,beginMask:l,endMask:c,ellipsisMask:u,newAxisMask:h,shrinkAxisMask:d}=s;ie(o,"stridedSlice");const{finalShapeSparse:p,finalShape:f,isIdentity:m,sliceDim0:g,isSimpleSlice:x,begin:b,end:w,strides:y}=Lh(o.shape,r,i,a,l,c,u,h,d);let C;if(m)C=ze({inputs:{x:o},backend:t,attrs:{shape:f}});else if(g||x){k(o.shape.length>=1,()=>`Input must have rank at least 1, got: ${o.shape.length}`);const $=Fh(b,w,y),N=ho({inputs:{x:o},backend:t,attrs:{begin:b,size:$}});C=ze({inputs:{x:N},backend:t,attrs:{shape:f}}),t.disposeIntermediateTensorInfo(N)}else{const $=t.bufferSync(o),N=o1(p,$,y,b);C=t.makeTensorInfo(f,N.dtype,N.values)}return C}const QO={kernelName:Nu,backendName:"cpu",kernelFunc:ZO};function JO(n){const{inputs:e,backend:t,attrs:s}=n,{separator:o,nGramWidths:r,leftPad:i,rightPad:a,padWidth:l,preserveShortSequences:c}=s,{data:u,dataSplits:h}=e,d=t.data.get(u.dataId).values,p=t.data.get(h.dataId).values,[f,m]=r1(d,p,o,r,i,a,l,c);return[t.makeTensorInfo([f.length],"string",f),t.makeTensorInfo(h.shape,"int32",m)]}const eL={kernelName:Yp,backendName:"cpu",kernelFunc:JO};function tL(n){const{inputs:e,backend:t,attrs:s}=n,{skipEmpty:o}=s,{input:r,delimiter:i}=e;if(r.dtype!=="string")throw new Error("Input must be of datatype string");if(r.shape.length!==1)throw new Error(`Input must be a vector, got shape: ${r.shape}`);if(i.shape.length!==0)throw new Error(`Delimiter must be a scalar, got shape: ${i.shape}`);const a=t.data.get(r.dataId).values,l=t.data.get(i.dataId).values[0],[c,u,h]=i1(a,l,o),d=u.length;return[t.makeTensorInfo([d,2],"int32",c),t.makeTensorInfo([d],"string",u),t.makeTensorInfo([2],"int32",new Int32Array(h))]}const nL={kernelName:Zp,backendName:"cpu",kernelFunc:tL};function sL(n){const{inputs:e,backend:t,attrs:s}=n,{numBuckets:o}=s,{input:r}=e;if(r.dtype!=="string")throw new Error("Input must be of datatype string");if(o<=0)throw new Error("Number of buckets must be at least 1");const i=t.data.get(r.dataId).values,a=a1(i,o);return t.makeTensorInfo(r.shape,"int32",a)}const oL={kernelName:Qp,backendName:"cpu",kernelFunc:sL};const rL=De(Qr,n=>Math.tan(n)),iL={kernelName:Qr,backendName:"cpu",kernelFunc:rL};const aL=De(Jr,n=>Math.tanh(n)),lL={kernelName:Jr,backendName:"cpu",kernelFunc:aL};function cL(n){const{inputs:e,backend:t}=n,{tensor:s,indices:o,updates:r}=e,{sliceRank:i,numUpdates:a,sliceSize:l,strides:c,outputSize:u}=to(r,o,s.shape),h=!1,d=t.bufferSync(o),p=t.bufferSync(r),f=t.bufferSync(s),m=uo(d,p,s.shape,u,l,a,i,c,f,h);return t.makeTensorInfo(s.shape,m.dtype,m.values)}const uL={kernelName:Up,backendName:"cpu",kernelFunc:cL};function hL(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{reps:r}=s;ie(o,"tile");const i=c1(t.bufferSync(o),r);return t.makeTensorInfo(i.shape,i.dtype,i.values)}const dL={kernelName:ei,backendName:"cpu",kernelFunc:hL};function pL(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{k:r,sorted:i}=s;ie(o,"topk");const a=t.data.get(o.dataId).values,[l,c]=h1(a,o.shape,o.dtype,r,i);return[t.makeTensorInfo(l.shape,l.dtype,l.values),t.makeTensorInfo(c.shape,c.dtype,c.values)]}const fL={kernelName:Tu,backendName:"cpu",kernelFunc:pL};function mL(n){const{inputs:e,attrs:t,backend:s}=n,{image:o,transforms:r}=e,{interpolation:i,fillMode:a,fillValue:l,outputShape:c}=t,[u,h,d,p]=o.shape,[f,m]=c!=null?c:[h,d],g=[u,f,m,p],x=ce(o.shape),b=x[0],w=x[1],y=x[2],C=ce(g),$=C[0],N=C[1],T=C[2],S=vt(o.dtype,q(g));S.fill(l);const v=s.data.get(o.dataId).values,I=s.data.get(r.dataId).values;for(let F=0;F<u;++F){const O=r.shape[0]===1?I:I.subarray(F*8,F*8+8);for(let L=0;L<f;++L)for(let z=0;z<m;++z)for(let U=0;U<p;++U){let W;const G=O[6]*z+O[7]*L+1;if(G===0)continue;const K=(O[0]*z+O[1]*L+O[2])/G,Z=(O[3]*z+O[4]*L+O[5])/G,j=R1(K,d,a),X=R1(Z,h,a);switch(i){case"nearest":W=CL(v,h,d,b,w,y,F,X,j,U,l);break;case"bilinear":W=IL(v,h,d,b,w,y,F,X,j,U,l);break;default:throw new Error(`Error in Transform: Expect 'nearest' or 'bilinear', but got ${i}`)}const te=F*$+L*N+z*T+U;S[te]=W}return s.makeTensorInfo(g,o.dtype,S)}return{dataId:s.write(S,g,o.dtype),shape:o.shape,dtype:o.dtype}}const gL={kernelName:Eu,backendName:"cpu",kernelFunc:mL};function R1(n,e,t){switch(t){case"reflect":return xL(n,e);case"wrap":return bL(n,e);case"nearest":return wL(n,e);case"constant":default:return yL(n)}}function xL(n,e){let t=n;if(t<0)if(e<=1)t=0;else{const s=2*e;t<s&&(t=s*Math.trunc(-t/s)+t),t=t<-e?t+s:-t-1}else if(t>e-1)if(e<=1)t=0;else{const s=2*e;t-=s*Math.trunc(t/s),t>=e&&(t=s-t-1)}return fn(0,t,e-1)}function bL(n,e){let t=n;if(t<0)if(e<=1)t=0;else{const s=e-1;t+=e*(Math.trunc(-t/s)+1)}else if(t>e-1)if(e<=1)t=0;else{const s=e-1;t-=e*Math.trunc(t/s)}return fn(0,t,e-1)}function yL(n,e){return n}function wL(n,e){return fn(0,n,e-1)}function Bi(n,e,t,s,o,r,i,a,l,c,u){const h=i*s+a*o+l*r+c;return 0<=a&&a<e&&0<=l&&l<t?n[h]:u}function CL(n,e,t,s,o,r,i,a,l,c,u){const h=Math.round(a),d=Math.round(l);return Bi(n,e,t,s,o,r,i,h,d,c,u)}function IL(n,e,t,s,o,r,i,a,l,c,u){const h=Math.floor(a),d=Math.floor(l),p=h+1,f=d+1,m=(f-l)*Bi(n,e,t,s,o,r,i,h,d,c,u)+(l-d)*Bi(n,e,t,s,o,r,i,h,f,c,u),g=(f-l)*Bi(n,e,t,s,o,r,i,p,d,c,u)+(l-d)*Bi(n,e,t,s,o,r,i,p,f,c,u);return(p-a)*m+(a-h)*g}function $L(n){const{inputs:e,attrs:t,backend:s}=n,{axis:o}=t,{x:r}=e;ie(r,"unique");const i=s.data.get(r.dataId).values,{outputValues:a,outputShape:l,indices:c}=d1(i,o,r.shape,r.dtype);return[s.makeTensorInfo(l,r.dtype,a),s.makeTensorInfo([c.length],"int32",c)]}const kL={kernelName:Ru,backendName:"cpu",kernelFunc:$L};function vL(n){const{inputs:e,backend:t,attrs:s}=n,{value:o}=e;let{axis:r}=s;r<0&&(r+=o.shape.length);const i=o.shape.length,a=o.shape[r],l=new Array(i-1);let c=0;for(let p=0;p<i;p++)p!==r&&(l[c++]=o.shape[p]);const u=new Array(i).fill(0),h=o.shape.slice();h[r]=1;const d=new Array(a);for(let p=0;p<d.length;p++){u[r]=p;const f=ho({inputs:{x:o},backend:t,attrs:{begin:u,size:h}});d[p]=ze({inputs:{x:f},backend:t,attrs:{shape:l}}),t.disposeIntermediateTensorInfo(f)}return d}const SL={kernelName:Ya,backendName:"cpu",kernelFunc:vL};function NL(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,segmentIds:r}=e,{numSegments:i}=s;ie(o,"unsortedSegmentSum");const a=o.shape.length,l=r.shape.length,c=[],u=[],h=a-l;let d=r;for(let f=0;f<h;++f){const m=ac({inputs:{input:d},backend:t,attrs:{dim:f+1}});d=m,u.push(m)}for(let f=0;f<i;++f){const m=cs(f,"int32"),g=t.makeTensorInfo([],"int32",m),x=$0({inputs:{a:g,b:d},backend:t}),b=Ns({inputs:{x},backend:t,attrs:{dtype:"float32"}}),w=oc({inputs:{a:b,b:o},backend:t}),y=Pi({inputs:{x:w},backend:t,attrs:{axis:0,keepDims:!1}});c.push(y),u.push(g),u.push(x),u.push(b),u.push(w),u.push(y)}const p=N1({inputs:c,backend:t,attrs:{axis:0}});return u.forEach(f=>t.disposeIntermediateTensorInfo(f)),p}const TL={kernelName:Za,backendName:"cpu",kernelFunc:NL};const EL=[vA,rR,NA,EA,hR,AA,FA,OA,MA,BA,VA,UA,HA,KA,YA,JA,tD,sD,rD,$A,aD,cD,hD,pR,pD,cR,mR,mD,iR,gD,bD,yD,CD,$D,vD,ND,ED,AD,FD,OD,MD,BD,VD,UD,GD,qD,KD,YD,ZD,QD,JD,tF,oF,gA,iF,gR,fF,xR,mF,yR,CF,IF,kF,CR,$R,SF,TF,RF,DF,vR,NR,aR,_F,xD,LF,PF,zF,xA,ER,AR,WF,FR,GF,jF,XF,QF,e_,n_,s_,OR,r_,a_,c_,h_,p_,m_,x_,MR,y_,I_,v_,BR,VR,T_,A_,__,UR,L_,P_,B_,T1,U_,yA,qR,H_,j_,X_,Z_,lR,Xd,J_,wA,CA,IA,tO,sO,rO,aO,cO,uO,dO,eA,fO,yO,CO,vO,nA,NO,EO,AO,sA,$_,FO,OO,MO,BO,VO,UO,HO,jO,iA,KO,lA,uA,YO,QO,eL,nL,oL,fA,nF,iL,lL,uL,dL,fL,gL,GR,kL,SL,TL,M_];for(const n of EL)sf(n);const po={},cc={alpha:!1,antialias:!1,premultipliedAlpha:!1,preserveDrawingBuffer:!1,depth:!1,stencil:!1,failIfMajorPerformanceCaveat:!0};function RL(n,e){po[n]=e}function Nn(n,e){if(!(n in po)||e!=null){const s=DL(n,e);if(s!==null)po[n]=s;else return console.log("Could not get context for WebGL version",n),null}const t=po[n];return t==null||t.isContextLost()?(delete po[n],Nn(n)):(t.disable(t.DEPTH_TEST),t.disable(t.STENCIL_TEST),t.disable(t.BLEND),t.disable(t.DITHER),t.disable(t.POLYGON_OFFSET_FILL),t.disable(t.SAMPLE_COVERAGE),t.enable(t.SCISSOR_TEST),t.enable(t.CULL_FACE),t.cullFace(t.BACK),po[n])}function AL(n){if(!V().getBool("IS_SAFARI")&&typeof OffscreenCanvas!="undefined"&&n===2)return new OffscreenCanvas(300,150);if(typeof document!="undefined")return document.createElement("canvas");throw new Error("Cannot create a canvas in this context")}function DL(n,e){if(n!==1&&n!==2)throw new Error("Cannot get WebGL rendering context, WebGL is disabled.");const t=e==null?AL(n):e;return t.addEventListener("webglcontextlost",s=>{s.preventDefault(),delete po[n]},!1),V().getBool("SOFTWARE_WEBGL_ENABLED")&&(cc.failIfMajorPerformanceCaveat=!1),n===1?t.getContext("webgl",cc)||t.getContext("experimental-webgl",cc):t.getContext("webgl2",cc)}var zi;(function(n){n[n.DENSE=0]="DENSE",n[n.SHARED_BATCH=1]="SHARED_BATCH"})(zi||(zi={}));var en;(function(n){n[n.RENDER=0]="RENDER",n[n.UPLOAD=1]="UPLOAD",n[n.PIXELS=2]="PIXELS",n[n.DOWNLOAD=3]="DOWNLOAD"})(en||(en={}));var It;(function(n){n[n.UNPACKED_FLOAT16=0]="UNPACKED_FLOAT16",n[n.UNPACKED_FLOAT32=1]="UNPACKED_FLOAT32",n[n.PACKED_4X1_UNSIGNED_BYTE=2]="PACKED_4X1_UNSIGNED_BYTE",n[n.PACKED_2X2_FLOAT32=3]="PACKED_2X2_FLOAT32",n[n.PACKED_2X2_FLOAT16=4]="PACKED_2X2_FLOAT16"})(It||(It={}));function Vi(n,e){return[e,n]}function FL(n,e){return n*e}function uc(n){const e=q(n),t=Math.ceil(e/4);return Oc(t)}function Xo(n,e){return[Math.max(1,Math.ceil(e/2)),Math.max(1,Math.ceil(n/2))]}function _L(n,e){const[t,s]=Xo(n,e);return t*s*4}function Qd(n,e){const t=n;let s,o,r,i,a,l,c,u,h,d;return V().getNumber("WEBGL_VERSION")===2?(s=t.R32F,o=t.R16F,r=t.RGBA16F,i=t.RGBA32F,a=t.RED,c=4,u=1,h=t.HALF_FLOAT,d=t.FLOAT,l=t.RGBA8):(s=n.RGBA,o=n.RGBA,r=n.RGBA,i=t.RGBA,a=n.RGBA,c=4,u=4,h=e!=null?e.HALF_FLOAT_OES:null,d=n.FLOAT,l=n.RGBA),{internalFormatFloat:s,internalFormatHalfFloat:o,internalFormatPackedHalfFloat:r,internalFormatPackedFloat:i,textureFormatFloat:a,downloadTextureFormat:l,downloadUnpackNumChannels:c,defaultNumChannels:u,textureTypeHalfFloat:h,textureTypeFloat:d}}function re(n,e){const t=e();return V().getBool("DEBUG")&&OL(n),t}function OL(n){const e=n.getError();if(e!==n.NO_ERROR)throw new Error("WebGL Error: "+BL(n,e))}const LL=596e-10,ML=65504;function PL(n){return!!(V().getBool("WEBGL_RENDER_FLOAT32_ENABLED")||n===0||LL<Math.abs(n)&&Math.abs(n)<ML)}function BL(n,e){switch(e){case n.NO_ERROR:return"NO_ERROR";case n.INVALID_ENUM:return"INVALID_ENUM";case n.INVALID_VALUE:return"INVALID_VALUE";case n.INVALID_OPERATION:return"INVALID_OPERATION";case n.INVALID_FRAMEBUFFER_OPERATION:return"INVALID_FRAMEBUFFER_OPERATION";case n.OUT_OF_MEMORY:return"OUT_OF_MEMORY";case n.CONTEXT_LOST_WEBGL:return"CONTEXT_LOST_WEBGL";default:return`Unknown error code ${e}`}}function hc(n,e){return os(n,()=>n.getExtension(e),'Extension "'+e+'" not supported on this browser.')}function zL(n,e){const t=os(n,()=>n.createShader(n.VERTEX_SHADER),"Unable to create vertex WebGLShader.");if(re(n,()=>n.shaderSource(t,e)),re(n,()=>n.compileShader(t)),n.getShaderParameter(t,n.COMPILE_STATUS)===!1)throw console.log(n.getShaderInfoLog(t)),new Error("Failed to compile vertex shader.");return t}function VL(n,e){const t=os(n,()=>n.createShader(n.FRAGMENT_SHADER),"Unable to create fragment WebGLShader.");if(re(n,()=>n.shaderSource(t,e)),re(n,()=>n.compileShader(t)),V().get("ENGINE_COMPILE_ONLY"))return t;if(n.getShaderParameter(t,n.COMPILE_STATUS)===!1)throw A1(e,n.getShaderInfoLog(t)),new Error("Failed to compile fragment shader.");return t}const WL=/ERROR: [0-9]+:([0-9]+):/g;function A1(n,e){const t=WL.exec(e);if(t==null){console.log(`Couldn't parse line number in error: ${e}`),console.log(n);return}const s=+t[1],o=n.split(`
`),r=o.length.toString().length+2,i=o.map((h,d)=>ko((d+1).toString(),r)+h);let a=0;for(let h=0;h<i.length;h++)a=Math.max(i[h].length,a);const l=i.slice(0,s-1),c=i.slice(s-1,s),u=i.slice(s);console.log(l.join(`
`)),console.log(e.split(`
`)[0]),console.log(`%c ${ko(c[0],a)}`,"border:1px solid red; background-color:#e3d2d2; color:#a61717"),console.log(u.join(`
`))}function UL(n){return os(n,()=>n.createProgram(),"Unable to create WebGLProgram.")}function GL(n,e){if(re(n,()=>n.linkProgram(e)),!V().get("ENGINE_COMPILE_ONLY")&&n.getProgramParameter(e,n.LINK_STATUS)===!1)throw console.log(n.getProgramInfoLog(e)),new Error("Failed to link vertex and fragment shaders.")}function Jd(n,e){if(re(n,()=>n.validateProgram(e)),n.getProgramParameter(e,n.VALIDATE_STATUS)===!1)throw console.log(n.getProgramInfoLog(e)),new Error("Shader program validation failed.")}function HL(n,e){const t=os(n,()=>n.createBuffer(),"Unable to create WebGLBuffer");return re(n,()=>n.bindBuffer(n.ARRAY_BUFFER,t)),re(n,()=>n.bufferData(n.ARRAY_BUFFER,e,n.STATIC_DRAW)),t}function qL(n,e){const t=os(n,()=>n.createBuffer(),"Unable to create WebGLBuffer");return re(n,()=>n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,t)),re(n,()=>n.bufferData(n.ELEMENT_ARRAY_BUFFER,e,n.STATIC_DRAW)),t}function jL(n){return os(n,()=>n.createTexture(),"Unable to create WebGLTexture.")}function KL(n,e){const t=V().getNumber("WEBGL_MAX_TEXTURE_SIZE");if(n<=0||e<=0){const s=`[${n}x${e}]`;throw new Error("Requested texture size "+s+" is invalid.")}if(n>t||e>t){const s=`[${n}x${e}]`,o=`[${t}x${t}]`;throw new Error("Requested texture size "+s+" greater than WebGL maximum on this browser / GPU "+o+".")}}function XL(n){return os(n,()=>n.createFramebuffer(),"Unable to create WebGLFramebuffer.")}function D1(n,e,t,s,o,r,i){const a=n.getAttribLocation(e,t);return a===-1?!1:(re(n,()=>n.bindBuffer(n.ARRAY_BUFFER,s)),re(n,()=>n.vertexAttribPointer(a,o,n.FLOAT,!1,r,i)),re(n,()=>n.enableVertexAttribArray(a)),!0)}function YL(n,e,t){tM(n,t),re(n,()=>n.activeTexture(n.TEXTURE0+t)),re(n,()=>n.bindTexture(n.TEXTURE_2D,e))}function ZL(n,e,t){return os(n,()=>n.getUniformLocation(e,t),'uniform "'+t+'" not present in program.')}function QL(n,e,t){return n.getUniformLocation(e,t)}function JL(n,e,t,s){re(n,()=>YL(n,e,s)),re(n,()=>n.uniform1i(t,s))}function ep(n,e,t){re(n,()=>n.bindFramebuffer(n.FRAMEBUFFER,t)),re(n,()=>n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,e,0))}function F1(n,e){re(n,()=>n.bindFramebuffer(n.FRAMEBUFFER,e)),re(n,()=>n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,null,0))}function dc(n){const e=n.checkFramebufferStatus(n.FRAMEBUFFER);if(e!==n.FRAMEBUFFER_COMPLETE)throw new Error("Error binding framebuffer: "+eM(n,e))}function eM(n,e){switch(e){case n.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:return"FRAMEBUFFER_INCOMPLETE_ATTACHMENT";case n.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:return"FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT";case n.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:return"FRAMEBUFFER_INCOMPLETE_DIMENSIONS";case n.FRAMEBUFFER_UNSUPPORTED:return"FRAMEBUFFER_UNSUPPORTED";default:return`unknown error ${e}`}}function os(n,e,t){const s=re(n,()=>e());if(s==null)throw new Error(t);return s}function tM(n,e){const t=n.MAX_COMBINED_TEXTURE_IMAGE_UNITS-1,s=e+n.TEXTURE0;if(s<n.TEXTURE0||s>t){const o=`[gl.TEXTURE0, gl.TEXTURE${t}]`;throw new Error(`textureUnit must be in ${o}.`)}}function Yo(n,e=2){return q(n.slice(0,n.length-e))}function Zo(n){if(n.length===0)throw Error("Cannot get rows and columns of an empty shape array.");return[n.length>1?n[n.length-2]:1,n[n.length-1]]}function pc(n){let e=[1,1,1];return n.length===0||n.length===1&&n[0]===1||(e=[Yo(n),...Zo(n)]),e}function nM(n,e=!1){let t=V().getNumber("WEBGL_MAX_TEXTURE_SIZE"),s=V().getNumber("WEBGL_MAX_SIZE_FOR_NARROW_TEXTURE");s===1/0&&V().getBool("WEBGL_AUTO_SQUARIFY_NARROW_TEXTURE_SHAPE")&&(s=t/2),e&&(t=t*2,s=s*2,n=n.map((a,l)=>l>=n.length-2?mn(n[l]):n[l]),n.length===1&&(n=[2,n[0]])),n.length!==2&&(n=as(n).newShape);let o=q(n),r=null;n.length<=1&&o<=t?r=[1,o]:n.length===2&&n[0]<=t&&n[1]<=t?r=n:n.length===3&&n[0]*n[1]<=t&&n[2]<=t?r=[n[0]*n[1],n[2]]:n.length===3&&n[0]<=t&&n[1]*n[2]<=t?r=[n[0],n[1]*n[2]]:n.length===4&&n[0]*n[1]*n[2]<=t&&n[3]<=t?r=[n[0]*n[1]*n[2],n[3]]:n.length===4&&n[0]<=t&&n[1]*n[2]*n[3]<=t&&(r=[n[0],n[1]*n[2]*n[3]]);const i=r!=null&&Math.max(...r)>s&&Math.min(...r)<=(e?2:1)&&Math.min(...r)>0;if(r==null||i)if(e){const a=Yo(n);let l=2,c=2;n.length&&([l,c]=Zo(n)),o=a*(l/2)*(c/2),r=Oc(o).map(u=>u*2)}else r=Oc(o);return r}function fc(n){return n%2===0}function mc(n,e){if(n=n.slice(-2),e=e.slice(-2),Ee(n,e)||!n.length||!e.length||n[0]===0||n[1]===0||e[0]===0||e[1]===0)return!0;if(n.length!==e.length){const t=n[n.length-1],s=e[e.length-1];if(t===s||fc(t)&&fc(s)&&(n[0]===1||e[0]===1))return!0}return n[1]===e[1]&&fc(n[0])&&fc(e[0])}let tp,np;function sM(n){if(tp==null){const e=Nn(n);tp=e.getParameter(e.MAX_TEXTURE_SIZE)}return tp}function oM(n){if(np==null){const e=Nn(n);np=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS)}return Math.min(16,np)}function rM(n){if(n===0)return 0;let e;const t=Nn(n);return dn(t,"EXT_disjoint_timer_query_webgl2")&&n===2?e=2:dn(t,"EXT_disjoint_timer_query")?e=1:e=0,e}function dn(n,e){return n.getExtension(e)!=null}function _1(n){try{if(Nn(n)!=null)return!0}catch(e){return console.log("Error when getting WebGL context: ",e),!1}return!1}function iM(n){if(n===0)return!1;const e=Nn(n);if(n===1){if(!dn(e,"OES_texture_float"))return!1}else if(!dn(e,"EXT_color_buffer_float"))return!1;return sp(e)}function aM(n){if(n===0)return!1;const e=Nn(n);if(n===1){if(!dn(e,"OES_texture_float")||!dn(e,"WEBGL_color_buffer_float"))return!1}else{if(dn(e,"EXT_color_buffer_float"))return sp(e);const s="EXT_color_buffer_half_float";if(dn(e,s)){const o=e.getExtension(s);return lM(e,o)}return!1}return sp(e)}function sp(n){const e=Qd(n),t=n.createTexture();n.bindTexture(n.TEXTURE_2D,t),n.texImage2D(n.TEXTURE_2D,0,e.internalFormatFloat,1,1,0,e.textureFormatFloat,e.textureTypeFloat,null);const r=n.createFramebuffer();n.bindFramebuffer(n.FRAMEBUFFER,r),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,t,0);const i=n.checkFramebufferStatus(n.FRAMEBUFFER)===n.FRAMEBUFFER_COMPLETE;return n.bindTexture(n.TEXTURE_2D,null),n.bindFramebuffer(n.FRAMEBUFFER,null),n.deleteTexture(t),n.deleteFramebuffer(r),i}function lM(n,e){const t=Qd(n,e),s=n.createTexture();n.bindTexture(n.TEXTURE_2D,s),n.texImage2D(n.TEXTURE_2D,0,t.internalFormatHalfFloat,1,1,0,t.textureFormatFloat,t.textureTypeHalfFloat,null);const i=n.createFramebuffer();n.bindFramebuffer(n.FRAMEBUFFER,i),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,s,0);const a=n.checkFramebufferStatus(n.FRAMEBUFFER)===n.FRAMEBUFFER_COMPLETE;return n.bindTexture(n.TEXTURE_2D,null),n.bindFramebuffer(n.FRAMEBUFFER,null),n.deleteTexture(s),n.deleteFramebuffer(i),a}function cM(n){return n!==2?!1:Nn(n).fenceSync!=null}function Wi(n,e){Array.isArray(n)||(n=[n]),n.forEach(t=>{t!=null&&k(t.dtype!=="complex64",()=>`${e} does not support complex64 tensors in the WebGL backend.`)})}const ae=V();ae.registerFlag("HAS_WEBGL",()=>ae.getNumber("WEBGL_VERSION")>0),ae.registerFlag("WEBGL_VERSION",()=>_1(2)?2:_1(1)?1:0),ae.registerFlag("WEBGL_CHECK_NUMERICAL_PROBLEMS",()=>!1),ae.registerFlag("WEBGL_BUFFER_SUPPORTED",()=>ae.get("WEBGL_VERSION")===2),ae.registerFlag("WEBGL_CPU_FORWARD",()=>!0),ae.registerFlag("WEBGL_FORCE_F16_TEXTURES",()=>!1),ae.registerFlag("WEBGL_PACK",()=>ae.getBool("HAS_WEBGL")),ae.registerFlag("WEBGL_PACK_NORMALIZATION",()=>ae.getBool("WEBGL_PACK")),ae.registerFlag("WEBGL_PACK_CLIP",()=>ae.getBool("WEBGL_PACK")),ae.registerFlag("WEBGL_PACK_DEPTHWISECONV",()=>ae.getBool("WEBGL_PACK")),ae.registerFlag("WEBGL_PACK_BINARY_OPERATIONS",()=>ae.getBool("WEBGL_PACK")),ae.registerFlag("WEBGL_PACK_UNARY_OPERATIONS",()=>ae.getBool("WEBGL_PACK")),ae.registerFlag("WEBGL_PACK_ARRAY_OPERATIONS",()=>ae.getBool("WEBGL_PACK")),ae.registerFlag("WEBGL_PACK_IMAGE_OPERATIONS",()=>ae.getBool("WEBGL_PACK")),ae.registerFlag("WEBGL_PACK_REDUCE",()=>ae.getBool("WEBGL_PACK")),ae.registerFlag("WEBGL_LAZILY_UNPACK",()=>ae.getBool("WEBGL_PACK")),ae.registerFlag("WEBGL_CONV_IM2COL",()=>ae.getBool("WEBGL_PACK")),ae.registerFlag("WEBGL_PACK_CONV2DTRANSPOSE",()=>ae.getBool("WEBGL_PACK")),ae.registerFlag("WEBGL_MAX_TEXTURE_SIZE",()=>sM(ae.getNumber("WEBGL_VERSION"))),ae.registerFlag("WEBGL_MAX_TEXTURES_IN_SHADER",()=>oM(ae.getNumber("WEBGL_VERSION"))),ae.registerFlag("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION",()=>{const n=ae.getNumber("WEBGL_VERSION");return n===0?0:rM(n)}),ae.registerFlag("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE",()=>ae.getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION")>0&&!If()),ae.registerFlag("WEBGL_RENDER_FLOAT32_CAPABLE",()=>iM(ae.getNumber("WEBGL_VERSION"))),ae.registerFlag("WEBGL_RENDER_FLOAT32_ENABLED",()=>ae.getBool("WEBGL_FORCE_F16_TEXTURES")?!1:ae.getBool("WEBGL_RENDER_FLOAT32_CAPABLE")),ae.registerFlag("WEBGL_DOWNLOAD_FLOAT_ENABLED",()=>aM(ae.getNumber("WEBGL_VERSION"))),ae.registerFlag("WEBGL_FENCE_API_ENABLED",()=>cM(ae.getNumber("WEBGL_VERSION"))),ae.registerFlag("WEBGL_SIZE_UPLOAD_UNIFORM",()=>ae.getBool("WEBGL_RENDER_FLOAT32_ENABLED")?4:0),ae.registerFlag("WEBGL_DELETE_TEXTURE_THRESHOLD",()=>-1,n=>{if(typeof n!="number")throw new Error(`WEBGL_DELETE_TEXTURE_THRESHOLD must be a number but got ${n}.`);if(n<0&&n!==-1)throw new Error(`WEBGL_DELETE_TEXTURE_THRESHOLD must be -1 (indicating never delete) or at least 0, but got ${n}.`)}),ae.registerFlag("WEBGL_FLUSH_THRESHOLD",()=>If()?1:-1,n=>{if(typeof n!="number")throw new Error(`WEBGL_FLUSH_THRESHOLD must be a number but got ${n}.`);if(n<0&&n!==-1)throw new Error(`WEBGL_FLUSH_THRESHOLD must be -1 (indicating never manual flush) or at least 0, but got ${n}.`)}),ae.registerFlag("CPU_HANDOFF_SIZE_THRESHOLD",()=>128),ae.registerFlag("WEBGL_USE_SHAPES_UNIFORMS",()=>!1),ae.registerFlag("TOPK_LAST_DIM_CPU_HANDOFF_SIZE_THRESHOLD",()=>1e5),ae.registerFlag("TOPK_K_CPU_HANDOFF_THRESHOLD",()=>128),ae.registerFlag("WEBGL_EXP_CONV",()=>!1),ae.registerFlag("SOFTWARE_WEBGL_ENABLED",()=>ae.getBool("IS_TEST")),ae.registerFlag("WEBGL_MAX_SIZE_FOR_NARROW_TEXTURE",()=>1/0),ae.registerFlag("WEBGL_AUTO_SQUARIFY_NARROW_TEXTURE_SHAPE",()=>!1),ae.registerFlag("WEBGL2_ISNAN_CUSTOM",()=>!1),ae.registerFlag("ENGINE_COMPILE_ONLY",()=>!1);function Ot(){let n,e,t,s,o,r,i,a,l,c;return V().getNumber("WEBGL_VERSION")===2?(n="#version 300 es",e="in",t="out",s="in",o="texture",r="outputColor",i="out vec4 outputColor;",a=V().getBool("WEBGL2_ISNAN_CUSTOM")?`
      bool isnan_custom(float val) {
        uint floatToUint = floatBitsToUint(val);
        return (floatToUint & 0x7fffffffu) > 0x7f800000u;
      }

      bvec4 isnan_custom(vec4 val) {
        return bvec4(isnan_custom(val.x),
          isnan_custom(val.y), isnan_custom(val.z), isnan_custom(val.w));
      }

      #define isnan(value) isnan_custom(value)
    `:"",l="",c=`
      #define round(value) newRound(value)
      int newRound(float value) {
        return int(floor(value + 0.5));
      }

      ivec4 newRound(vec4 value) {
        return ivec4(floor(value + vec4(0.5)));
      }
    `):(n="",e="attribute",t="varying",s="varying",o="texture2D",r="gl_FragColor",i="",a=`
      #define isnan(value) isnan_custom(value)
      bool isnan_custom(float val) {
        return (val > 0. || val < 1. || val == 0.) ? false : true;
      }
      bvec4 isnan_custom(vec4 val) {
        return bvec4(isnan(val.x), isnan(val.y), isnan(val.z), isnan(val.w));
      }
    `,l=`
      uniform float INFINITY;

      bool isinf(float val) {
        return abs(val) == INFINITY;
      }
      bvec4 isinf(vec4 val) {
        return equal(abs(val), vec4(INFINITY));
      }
    `,c=`
      int round(float value) {
        return int(floor(value + 0.5));
      }

      ivec4 round(vec4 value) {
        return ivec4(floor(value + vec4(0.5)));
      }
    `),{version:n,attribute:e,varyingVs:t,varyingFs:s,texture2D:o,output:r,defineOutput:i,defineSpecialNaN:a,defineSpecialInf:l,defineRound:c}}function fo(n,e,t="index"){const s=ce(e);return s.map((o,r)=>{const i=`int ${n[r]} = ${t} / ${o}`,a=r===s.length-1?`int ${n[r+1]} = ${t} - ${n[r]} * ${o}`:`index -= ${n[r]} * ${o}`;return`${i}; ${a};`}).join("")}function gc(n,e,t="index"){const s=ce(e);return s.map((o,r)=>{const i=`int ${n[r]} = ${t} / outShapeStrides[${r}]`,a=r===s.length-1?`int ${n[r+1]} = ${t} - ${n[r]} * outShapeStrides[${r}]`:`index -= ${n[r]} * outShapeStrides[${r}]`;return`${i}; ${a};`}).join("")}function uM(n,e){const t=n.length,s=n.map(r=>`${e}[${r}]`),o=new Array(t-1);o[t-2]=s[t-1];for(let r=t-3;r>=0;--r)o[r]=`(${o[r+1]} * ${s[r+1]})`;return o}function hM(n,e,t="index"){const s=n.map((r,i)=>i),o=uM(s,e);return o.map((r,i)=>{const a=`int ${n[i]} = ${t} / ${o[i]}`,l=i===o.length-1?`int ${n[i+1]} = ${t} - ${n[i]} * ${o[i]}`:`index -= ${n[i]} * ${o[i]}`;return`${a}; ${l};`}).join("")}function op(n){const e=ce(n).map(t=>t.toString());return`
  int getFlatIndex(ivec3 coords) {
    return coords.x * ${e[0]} + coords.y * ${e[1]} + coords.z;
  }
`}function rp(){return`
  int getFlatIndex(ivec3 coords) {
    return coords.x * outShapeStrides[0] + coords.y * outShapeStrides[1] + coords.z;
  }
`}const O1=`
  const float FLOAT_MAX = 1.70141184e38;
  const float FLOAT_MIN = 1.17549435e-38;

  lowp vec4 encode_float(highp float v) {
    if (isnan(v)) {
      return vec4(255, 255, 255, 255);
    }

    highp float av = abs(v);

    if(av < FLOAT_MIN) {
      return vec4(0.0, 0.0, 0.0, 0.0);
    } else if(v > FLOAT_MAX) {
      return vec4(0.0, 0.0, 128.0, 127.0) / 255.0;
    } else if(v < -FLOAT_MAX) {
      return vec4(0.0, 0.0,  128.0, 255.0) / 255.0;
    }

    highp vec4 c = vec4(0,0,0,0);

    highp float e = floor(log2(av));
    highp float m = exp2(fract(log2(av))) - 1.0;

    c[2] = floor(128.0 * m);
    m -= c[2] / 128.0;
    c[1] = floor(32768.0 * m);
    m -= c[1] / 32768.0;
    c[0] = floor(8388608.0 * m);

    highp float ebias = e + 127.0;
    c[3] = floor(ebias / 2.0);
    ebias -= c[3] * 2.0;
    c[2] += floor(ebias) * 128.0;

    c[3] += 128.0 * step(0.0, -v);

    return c / 255.0;
  }
`;const{getBroadcastDims:L1}=s2;function dM(n,e,t){const s=[];if(n.forEach(p=>{const f=q(p.shapeInfo.logicalShape);if(p.shapeInfo.isUniform?s.push(`uniform float ${p.name}${f>1?`[${f}]`:""};`):(s.push(`uniform sampler2D ${p.name};`),s.push(`uniform int offset${p.name};`)),t.enableShapeUniforms){const{uniformShape:m}=ip(t.packedInputs,p.shapeInfo.logicalShape,p.shapeInfo.texShape);switch(m.length){case 1:s.push(`uniform int ${p.name}Shape;`);break;case 2:s.push(`uniform ivec2 ${p.name}Shape;`);break;case 3:s.push(`uniform ivec3 ${p.name}Shape;`);break;case 4:s.push(`uniform ivec4 ${p.name}Shape;`);break}s.push(`uniform ivec2 ${p.name}TexShape;`)}}),t.enableShapeUniforms){switch(e.logicalShape.length){case 1:s.push("uniform int outShape;");break;case 2:s.push("uniform ivec2 outShape;"),s.push("uniform int outShapeStrides;");break;case 3:s.push("uniform ivec3 outShape;"),s.push("uniform ivec2 outShapeStrides;");break;case 4:s.push("uniform ivec4 outShape;"),s.push("uniform ivec3 outShapeStrides;");break}s.push("uniform ivec2 outTexShape;")}t.customUniforms&&t.customUniforms.forEach(p=>{s.push(`uniform ${p.type} ${p.name}${p.arrayIndex?`[${p.arrayIndex}]`:""};`)});const o=s.join(`
`),r=n.map(p=>pM(p,e,t.packedInputs,t.enableShapeUniforms)).join(`
`),i=e.texShape,a=Ot(),l=gM(a);let c,u,h=yM(a);return e.isPacked?(c=fM(e.logicalShape,i,t.enableShapeUniforms),u=bM(a)):(c=mM(e.logicalShape,i,t.enableShapeUniforms),u=xM(a)),t.packedInputs&&(h+=$M),[h,l,u,o,c,r,t.userCode].join(`
`)}function Qo(n,e=!1){const t=n.shapeInfo.logicalShape;switch(t.length){case 0:return OM(n,e);case 1:return MM(n,e);case 2:return BM(n,e);case 3:return VM(n,e);case 4:return UM(n,e);case 5:return GM(n);case 6:return HM(n);default:throw new Error(`${t.length}-D input sampling is not yet supported`)}}function M1(n,e){switch(n.shapeInfo.logicalShape.length){case 0:return _M(n);case 1:return LM(n,e);case 2:return PM(n,e);case 3:return zM(n,e);default:return WM(n,e)}}function pM(n,e,t=!1,s){let o="";t?o+=M1(n,s):o+=Qo(n,s);const r=n.shapeInfo.logicalShape,i=e.logicalShape;return r.length<=i.length&&(t?o+=qM(n,e):o+=jM(n,e)),o}function fM(n,e,t){switch(n.length){case 0:return P1();case 1:return kM(n,e,t);case 2:return DM(n,e,t);case 3:return SM(n,e,t);default:return TM(n,e,t)}}function mM(n,e,t){switch(n.length){case 0:return P1();case 1:return vM(n,e,t);case 2:return FM(n,e,t);case 3:return NM(n,e,t);case 4:return EM(n,e,t);case 5:return RM(n,e);case 6:return AM(n,e);default:throw new Error(`${n.length}-D output sampling is not yet supported`)}}function gM(n){return`
    float sampleTexture(sampler2D textureSampler, vec2 uv) {
      return ${n.texture2D}(textureSampler, uv).r;
    }
  `}function xM(n){return`
    void setOutput(float val) {
      ${n.output} = vec4(val, 0, 0, 0);
    }
  `}function bM(n){return`
    void setOutput(vec4 val) {
      ${n.output} = val;
    }
  `}function yM(n){return`${n.version}
    precision highp float;
    precision highp int;
    precision highp sampler2D;
    ${n.varyingFs} vec2 resultUV;
    ${n.defineOutput}
    const vec2 halfCR = vec2(0.5, 0.5);

    struct ivec5
    {
      int x;
      int y;
      int z;
      int w;
      int u;
    };

    struct ivec6
    {
      int x;
      int y;
      int z;
      int w;
      int u;
      int v;
    };

    uniform float NAN;
    ${n.defineSpecialNaN}
    ${n.defineSpecialInf}
    ${n.defineRound}

    int imod(int x, int y) {
      return x - y * (x / y);
    }

    int idiv(int a, int b, float sign) {
      int res = a / b;
      int mod = imod(a, b);
      if (sign < 0. && mod != 0) {
        res -= 1;
      }
      return res;
    }

    //Based on the work of Dave Hoskins
    //https://www.shadertoy.com/view/4djSRW
    #define HASHSCALE1 443.8975
    float random(float seed){
      vec2 p = resultUV * seed;
      vec3 p3  = fract(vec3(p.xyx) * HASHSCALE1);
      p3 += dot(p3, p3.yzx + 19.19);
      return fract((p3.x + p3.y) * p3.z);
    }

    ${wM}
    ${CM}
    ${IM}
  `}const wM=`
vec2 uvFromFlat(int texNumR, int texNumC, int index) {
  int texR = index / texNumC;
  int texC = index - texR * texNumC;
  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);
}
vec2 packedUVfrom1D(int texNumR, int texNumC, int index) {
  int texelIndex = index / 2;
  int texR = texelIndex / texNumC;
  int texC = texelIndex - texR * texNumC;
  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);
}
`,CM=`
vec2 packedUVfrom2D(int texelsInLogicalRow, int texNumR,
  int texNumC, int row, int col) {
  int texelIndex = (row / 2) * texelsInLogicalRow + (col / 2);
  int texR = texelIndex / texNumC;
  int texC = texelIndex - texR * texNumC;
  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);
}
`,IM=`
vec2 packedUVfrom3D(int texNumR, int texNumC,
    int texelsInBatch, int texelsInLogicalRow, int b,
    int row, int col) {
  int index = b * texelsInBatch + (row / 2) * texelsInLogicalRow + (col / 2);
  int texR = index / texNumC;
  int texC = index - texR * texNumC;
  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);
}
`,$M=`
  float getChannel(vec4 frag, vec2 innerDims) {
    vec2 modCoord = mod(innerDims, 2.);
    return modCoord.x == 0. ?
      (modCoord.y == 0. ? frag.r : frag.g) :
      (modCoord.y == 0. ? frag.b : frag.a);
  }
  float getChannel(vec4 frag, int dim) {
    float modCoord = mod(float(dim), 2.);
    return modCoord == 0. ? frag.r : frag.g;
  }
`;function P1(){return`
    int getOutputCoords() {
      return 0;
    }
  `}function kM(n,e,t){const s=[Math.ceil(e[0]/2),Math.ceil(e[1]/2)];return s[0]===1?t?`
      int getOutputCoords() {
        return 2 * int(resultUV.x * ceil(float(outTexShape[1]) / 2.0));
      }
    `:`
      int getOutputCoords() {
        return 2 * int(resultUV.x * ${s[1]}.0);
      }
    `:s[1]===1?t?`
      int getOutputCoords() {
        return 2 * int(resultUV.y * ceil(float(outTexShape[0]) / 2.0));
      }
    `:`
      int getOutputCoords() {
        return 2 * int(resultUV.y * ${s[0]}.0);
      }
    `:t?`
    int getOutputCoords() {
      ivec2 packedTexShape = ivec2(ceil(float(outTexShape[0]) / 2.0), ceil(float(outTexShape[1]) / 2.0));
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(packedTexShape[0], packedTexShape[1]));
      return 2 * (resTexRC.x * packedTexShape[1] + resTexRC.y);
    }
  `:`
    int getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(${s[0]}, ${s[1]}));
      return 2 * (resTexRC.x * ${s[1]} + resTexRC.y);
    }
  `}function vM(n,e,t){return e[0]===1?t?`
      int getOutputCoords() {
        return int(resultUV.x * float(outTexShape[1]));
      }
    `:`
      int getOutputCoords() {
        return int(resultUV.x * ${e[1]}.0);
      }
    `:e[1]===1?t?`
      int getOutputCoords() {
        return int(resultUV.y * float(outTexShape[0]));
      }
    `:`
      int getOutputCoords() {
        return int(resultUV.y * ${e[0]}.0);
      }
    `:t?`
    int getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(outTexShape[0], outTexShape[1]));
      return resTexRC.x * outTexShape[1] + resTexRC.y;
    }
  `:`
    int getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(${e[0]}, ${e[1]}));
      return resTexRC.x * ${e[1]} + resTexRC.y;
    }
  `}function SM(n,e,t){if(t)return`
    ivec3 getOutputCoords() {
      ivec2 packedTexShape = ivec2(ceil(float(outTexShape[0]) / 2.0), ceil(float(outTexShape[1]) / 2.0));
      int texelsInLogicalRow = int(ceil(float(outShape[2]) / 2.0));
      int texelsInBatch = texelsInLogicalRow * int(ceil(float(outShape[1]) / 2.0));
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(packedTexShape[0], packedTexShape[1]));
      int index = resTexRC.x * packedTexShape[1] + resTexRC.y;

      int b = index / texelsInBatch;
      index -= b * texelsInBatch;

      int r = 2 * (index / texelsInLogicalRow);
      int c = imod(index, texelsInLogicalRow) * 2;

      return ivec3(b, r, c);
    }
  `;const s=[Math.ceil(e[0]/2),Math.ceil(e[1]/2)],o=Math.ceil(n[2]/2),r=o*Math.ceil(n[1]/2);return`
    ivec3 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(${s[0]}, ${s[1]}));
      int index = resTexRC.x * ${s[1]} + resTexRC.y;

      int b = index / ${r};
      index -= b * ${r};

      int r = 2 * (index / ${o});
      int c = imod(index, ${o}) * 2;

      return ivec3(b, r, c);
    }
  `}function NM(n,e,t){if(t)return`
  ivec3 getOutputCoords() {
    ivec2 resTexRC = ivec2(resultUV.yx *
                           vec2(outTexShape[0], outTexShape[1]));
    int index = resTexRC.x * outTexShape[1] + resTexRC.y;
    ${gc(["r","c","d"],n)}
    return ivec3(r, c, d);
  }
`;const s=fo(["r","c","d"],n);return`
    ivec3 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(${e[0]}, ${e[1]}));
      int index = resTexRC.x * ${e[1]} + resTexRC.y;
      ${s}
      return ivec3(r, c, d);
    }
  `}function TM(n,e,t){if(t)return`
    ivec4 getOutputCoords() {
      ivec2 packedTexShape = ivec2(ceil(float(outTexShape[0]) / 2.0), ceil(float(outTexShape[1]) / 2.0));
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(packedTexShape[0], packedTexShape[1]));
      int index = resTexRC.x * packedTexShape[1] + resTexRC.y;

      int texelsInLogicalRow = int(ceil(float(outShape[3]) / 2.0));
      int texelsInBatch = texelsInLogicalRow * int(ceil(float(outShape[2]) / 2.0));
      int texelsInBatchN = texelsInBatch * outShape[1];

      int b2 = index / texelsInBatchN;
      index -= b2 * texelsInBatchN;

      int b = index / texelsInBatch;
      index -= b * texelsInBatch;

      int r = 2 * (index / texelsInLogicalRow);
      int c = imod(index, texelsInLogicalRow) * 2;

      return ivec4(b2, b, r, c);
    }
  `;const s=[Math.ceil(e[0]/2),Math.ceil(e[1]/2)],o=Math.ceil(n[n.length-1]/2),r=o*Math.ceil(n[n.length-2]/2);let i=r,a="",l="b, r, c";for(let c=2;c<n.length-1;c++)i*=n[n.length-c-1],a=`
      int b${c} = index / ${i};
      index -= b${c} * ${i};
    `+a,l=`b${c}, `+l;return`
    ivec${n.length} getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(${s[0]}, ${s[1]}));
      int index = resTexRC.x * ${s[1]} + resTexRC.y;

      ${a}

      int b = index / ${r};
      index -= b * ${r};

      int r = 2 * (index / ${o});
      int c = imod(index, ${o}) * 2;

      return ivec${n.length}(${l});
    }
  `}function EM(n,e,t){if(t)return`
    ivec4 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
        vec2(outTexShape[0], outTexShape[1]));
      int index = resTexRC.x * outTexShape[1] + resTexRC.y;
      ${gc(["r","c","d","d2"],n)}
      return ivec4(r, c, d, d2);
    }
  `;const s=fo(["r","c","d","d2"],n);return`
    ivec4 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
        vec2(${e[0]}, ${e[1]}));
      int index = resTexRC.x * ${e[1]} + resTexRC.y;
      ${s}
      return ivec4(r, c, d, d2);
    }
  `}function RM(n,e){const t=fo(["r","c","d","d2","d3"],n);return`
    ivec5 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx * vec2(${e[0]},
                             ${e[1]}));

      int index = resTexRC.x * ${e[1]} + resTexRC.y;

      ${t}

      ivec5 outShape = ivec5(r, c, d, d2, d3);
      return outShape;
    }
  `}function AM(n,e){const t=fo(["r","c","d","d2","d3","d4"],n);return`
    ivec6 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
        vec2(${e[0]}, ${e[1]}));
      int index = resTexRC.x * ${e[1]} + resTexRC.y;

      ${t}

      ivec6 result = ivec6(r, c, d, d2, d3, d4);
      return result;
    }
  `}function DM(n,e,t){const s=[Math.ceil(e[0]/2),Math.ceil(e[1]/2)];if(Ee(n,e))return t?`
      ivec2 getOutputCoords() {
        ivec2 packedTexShape = ivec2(ceil(float(outTexShape[0]) / 2.0), ceil(float(outTexShape[1]) / 2.0));
        return 2 * ivec2(resultUV.yx * vec2(packedTexShape[0], packedTexShape[1]));
      }
    `:`
      ivec2 getOutputCoords() {
        return 2 * ivec2(resultUV.yx * vec2(${s[0]}, ${s[1]}));
      }
    `;const o=Math.ceil(n[1]/2);return t?`
    ivec2 getOutputCoords() {
      ivec2 packedTexShape = ivec2(ceil(float(outTexShape[0]) / 2.0), ceil(float(outTexShape[1]) / 2.0));
      int texelsInLogicalRow = int(ceil(float(outShape[1]) / 2.0));
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(packedTexShape[0], packedTexShape[1]));

      int index = resTexRC.x * packedTexShape[1] + resTexRC.y;
      int r = 2 * (index / texelsInLogicalRow);
      int c = imod(index, texelsInLogicalRow) * 2;

      return ivec2(r, c);
    }
  `:`
    ivec2 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(${s[0]}, ${s[1]}));

      int index = resTexRC.x * ${s[1]} + resTexRC.y;
      int r = 2 * (index / ${o});
      int c = imod(index, ${o}) * 2;

      return ivec2(r, c);
    }
  `}function FM(n,e,t){return Ee(n,e)?t?`
      ivec2 getOutputCoords() {
        return ivec2(resultUV.yx * vec2(outTexShape[0], outTexShape[1]));
      }
    `:`
      ivec2 getOutputCoords() {
        return ivec2(resultUV.yx * vec2(${e[0]}, ${e[1]}));
      }
    `:n[1]===1?t?`
      ivec2 getOutputCoords() {
        ivec2 resTexRC = ivec2(resultUV.yx *
                               vec2(outTexShape[0], outTexShape[1]));
        int index = resTexRC.x * outTexShape[1] + resTexRC.y;
        return ivec2(index, 0);
      }
    `:`
      ivec2 getOutputCoords() {
        ivec2 resTexRC = ivec2(resultUV.yx *
                               vec2(${e[0]}, ${e[1]}));
        int index = resTexRC.x * ${e[1]} + resTexRC.y;
        return ivec2(index, 0);
      }
    `:n[0]===1?t?`
      ivec2 getOutputCoords() {
        ivec2 resTexRC = ivec2(resultUV.yx *
                               vec2(outTexShape[0], outTexShape[1]));
        int index = resTexRC.x * outTexShape[1] + resTexRC.y;
        return ivec2(0, index);
      }
    `:`
      ivec2 getOutputCoords() {
        ivec2 resTexRC = ivec2(resultUV.yx *
                               vec2(${e[0]}, ${e[1]}));
        int index = resTexRC.x * ${e[1]} + resTexRC.y;
        return ivec2(0, index);
      }
    `:t?`
    ivec2 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(outTexShape[0], outTexShape[1]));
      int index = resTexRC.x * outTexShape[1] + resTexRC.y;
      int r = index / outShape[1];
      int c = index - r * outShape[1];
      return ivec2(r, c);
    }
  `:`
    ivec2 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(${e[0]}, ${e[1]}));
      int index = resTexRC.x * ${e[1]} + resTexRC.y;
      int r = index / ${n[1]};
      int c = index - r * ${n[1]};
      return ivec2(r, c);
    }
  `}function mo(n){return`offset${n}`}function _M(n){const e=n.name,t="get"+e.charAt(0).toUpperCase()+e.slice(1),s=Ot();return`
    vec4 ${t}() {
      return ${s.texture2D}(${e}, halfCR);
    }
  `}function OM(n,e){const t=n.name,s="get"+t.charAt(0).toUpperCase()+t.slice(1);if(n.shapeInfo.isUniform)return`float ${s}() {return ${t};}`;const[o,r]=n.shapeInfo.texShape;if(o===1&&r===1)return`
      float ${s}() {
        return sampleTexture(${t}, halfCR);
      }
    `;const i=mo(t);if(e)return`
    float ${s}() {
      vec2 uv = uvFromFlat(${t}TexShape[0], ${t}TexShape[1], ${i});
      return sampleTexture(${t}, uv);
    }
  `;const[a,l]=n.shapeInfo.texShape;return`
    float ${s}() {
      vec2 uv = uvFromFlat(${a}, ${l}, ${i});
      return sampleTexture(${t}, uv);
    }
  `}function LM(n,e){const t=n.name,s="get"+t.charAt(0).toUpperCase()+t.slice(1),o=n.shapeInfo.texShape,r=Ot();if(e)return`
    vec4 ${s}(int index) {
      ivec2 packedTexShape = ivec2(ceil(float(${t}TexShape[0]) / 2.0), ceil(float(${t}TexShape[1]) / 2.0));
      vec2 uv = packedUVfrom1D(
        packedTexShape[0], packedTexShape[1], index);
      return ${r.texture2D}(${t}, uv);
    }
  `;const i=[Math.ceil(o[0]/2),Math.ceil(o[1]/2)];return`
    vec4 ${s}(int index) {
      vec2 uv = packedUVfrom1D(
        ${i[0]}, ${i[1]}, index);
      return ${r.texture2D}(${t}, uv);
    }
  `}function MM(n,e){const t=n.name,s="get"+t.charAt(0).toUpperCase()+t.slice(1);if(n.shapeInfo.isUniform)return`
      float ${s}(int index) {
        ${Jo(n)}
      }
    `;const o=n.shapeInfo.texShape,r=o[0],i=o[1];if(i===1&&r===1)return`
      float ${s}(int index) {
        return sampleTexture(${t}, halfCR);
      }
    `;const a=mo(t);return i===1?e?`
      float ${s}(int index) {
        vec2 uv = vec2(0.5, (float(index + ${a}) + 0.5) / float(${t}TexShape[0]));
        return sampleTexture(${t}, uv);
      }
    `:`
      float ${s}(int index) {
        vec2 uv = vec2(0.5, (float(index + ${a}) + 0.5) / ${r}.0);
        return sampleTexture(${t}, uv);
      }
    `:r===1?e?`
      float ${s}(int index) {
        vec2 uv = vec2((float(index + ${a}) + 0.5) / float(${t}TexShape[1]), 0.5);
        return sampleTexture(${t}, uv);
      }
    `:`
      float ${s}(int index) {
        vec2 uv = vec2((float(index + ${a}) + 0.5) / ${i}.0, 0.5);
        return sampleTexture(${t}, uv);
      }
    `:e?`
    float ${s}(int index) {
      vec2 uv = uvFromFlat(${t}TexShape[0], ${t}TexShape[1], index + ${a});
      return sampleTexture(${t}, uv);
    }
  `:`
    float ${s}(int index) {
      vec2 uv = uvFromFlat(${r}, ${i}, index + ${a});
      return sampleTexture(${t}, uv);
    }
  `}function PM(n,e){const t=n.shapeInfo.logicalShape,s=n.name,o="get"+s.charAt(0).toUpperCase()+s.slice(1),r=n.shapeInfo.texShape,i=r[0],a=r[1],l=Ot();if(r!=null&&Ee(t,r))return e?`
      vec4 ${o}(int row, int col) {
        vec2 uv = (vec2(col, row) + halfCR) / vec2(${s}TexShape[1], ${s}TexShape[0]);

        return ${l.texture2D}(${s}, uv);
      }
    `:`
      vec4 ${o}(int row, int col) {
        vec2 uv = (vec2(col, row) + halfCR) / vec2(${a}.0, ${i}.0);

        return ${l.texture2D}(${s}, uv);
      }
    `;if(e)return`
    vec4 ${o}(int row, int col) {
      ivec2 packedTexShape = ivec2(ceil(float(${s}TexShape[0]) / 2.0), ceil(float(${s}TexShape[1]) / 2.0));
      int valuesPerRow = int(ceil(float(${s}Shape[1]) / 2.0));
      vec2 uv = packedUVfrom2D(valuesPerRow, packedTexShape[0], packedTexShape[1], row, col);
      return ${l.texture2D}(${s}, uv);
    }
  `;const c=[Math.ceil(r[0]/2),Math.ceil(r[1]/2)],u=Math.ceil(t[1]/2);return`
    vec4 ${o}(int row, int col) {
      vec2 uv = packedUVfrom2D(${u}, ${c[0]}, ${c[1]}, row, col);
      return ${l.texture2D}(${s}, uv);
    }
  `}function BM(n,e){const t=n.shapeInfo.logicalShape,s=n.name,o="get"+s.charAt(0).toUpperCase()+s.slice(1),r=n.shapeInfo.texShape;if(r!=null&&Ee(t,r)){if(e)return`
      float ${o}(int row, int col) {
        vec2 uv = (vec2(col, row) + halfCR) / vec2(${s}TexShape[1], ${s}TexShape[0]);
        return sampleTexture(${s}, uv);
      }
    `;const d=r[0],p=r[1];return`
    float ${o}(int row, int col) {
      vec2 uv = (vec2(col, row) + halfCR) / vec2(${p}.0, ${d}.0);
      return sampleTexture(${s}, uv);
    }
  `}const{newShape:i,keptDims:a}=as(t),l=i;if(l.length<t.length){const d=er(n,l),p=["row","col"];return`
      ${Qo(d,e)}
      float ${o}(int row, int col) {
        return ${o}(${tr(p,a)});
      }
    `}if(n.shapeInfo.isUniform)return`
      float ${o}(int row, int col) {
        int index = round(dot(vec2(row, col), vec2(${t[1]}, 1)));
        ${Jo(n)}
      }
    `;const c=r[0],u=r[1],h=mo(s);return u===1?e?`
      float ${o}(int row, int col) {
        float index = dot(vec3(row, col, ${h}), vec3(${s}Shape[1], 1, 1));
        vec2 uv = vec2(0.5, (index + 0.5) / float(${s}TexShape[0]));
        return sampleTexture(${s}, uv);
      }
    `:`
    float ${o}(int row, int col) {
      float index = dot(vec3(row, col, ${h}), vec3(${t[1]}, 1, 1));
      vec2 uv = vec2(0.5, (index + 0.5) / ${c}.0);
      return sampleTexture(${s}, uv);
    }
  `:c===1?e?`
      float ${o}(int row, int col) {
        float index = dot(vec3(row, col, ${h}), vec3(${s}Shape[1], 1, 1));
        vec2 uv = vec2((index + 0.5) / float(${s}TexShape[1]), 0.5);
        return sampleTexture(${s}, uv);
      }
    `:`
    float ${o}(int row, int col) {
      float index = dot(vec3(row, col, ${h}), vec3(${t[1]}, 1, 1));
      vec2 uv = vec2((index + 0.5) / ${u}.0, 0.5);
      return sampleTexture(${s}, uv);
    }
  `:e?`
      float ${o}(int row, int col) {
        // Explicitly use integer operations as dot() only works on floats.
        int index = row * ${s}Shape[1] + col + ${h};
        vec2 uv = uvFromFlat(${s}TexShape[0], ${s}TexShape[1], index);
        return sampleTexture(${s}, uv);
      }
    `:`
  float ${o}(int row, int col) {
    // Explicitly use integer operations as dot() only works on floats.
    int index = row * ${t[1]} + col + ${h};
    vec2 uv = uvFromFlat(${c}, ${u}, index);
    return sampleTexture(${s}, uv);
  }
`}function zM(n,e){const t=n.shapeInfo.logicalShape,s=n.name,o="get"+s.charAt(0).toUpperCase()+s.slice(1),r=n.shapeInfo.texShape,i=[Math.ceil(r[0]/2),Math.ceil(r[1]/2)];if(t[0]===1){const d=t.slice(1),p=[1,2],f=er(n,d),m=["b","row","col"];return`
        ${M1(f,e)}
        vec4 ${o}(int b, int row, int col) {
          return ${o}(${tr(m,p)});
        }
      `}const a=Ot();if(e)return`
    vec4 ${o}(int b, int row, int col) {
      ivec2 packedTexShape = ivec2(ceil(float(${s}TexShape[0]) / 2.0), ceil(float(${s}TexShape[1]) / 2.0));
      int valuesPerRow = int(ceil(float(${s}Shape[2]) / 2.0));
      int texelsInBatch = valuesPerRow * int(ceil(float(${s}Shape[1]) / 2.0));
      vec2 uv = packedUVfrom3D(
        packedTexShape[0], packedTexShape[1], texelsInBatch, valuesPerRow, b, row, col);
      return ${a.texture2D}(${s}, uv);
    }
  `;const l=i[0],c=i[1],u=Math.ceil(t[2]/2),h=u*Math.ceil(t[1]/2);return`
    vec4 ${o}(int b, int row, int col) {
      vec2 uv = packedUVfrom3D(
        ${l}, ${c}, ${h}, ${u}, b, row, col);
      return ${a.texture2D}(${s}, uv);
    }
  `}function VM(n,e){const t=n.shapeInfo.logicalShape,s=n.name,o="get"+s.charAt(0).toUpperCase()+s.slice(1),r=t[1]*t[2],i=t[2],{newShape:a,keptDims:l}=as(t),c=a;if(c.length<t.length){const m=er(n,c),g=["row","col","depth"];return`
        ${Qo(m,e)}
        float ${o}(int row, int col, int depth) {
          return ${o}(${tr(g,l)});
        }
      `}if(n.shapeInfo.isUniform)return`
      float ${o}(int row, int col, int depth) {
        int index = round(dot(vec3(row, col, depth),
                          vec3(${r}, ${i}, 1)));
        ${Jo(n)}
      }
    `;const u=n.shapeInfo.texShape,h=u[0],d=u[1],p=n.shapeInfo.flatOffset;if(d===r&&p==null)return e?`
      float ${o}(int row, int col, int depth) {
        int stride1 = ${s}Shape[2];
        float texR = float(row);
        float texC = dot(vec2(col, depth), vec2(stride1, 1));
        vec2 uv = (vec2(texC, texR) + halfCR) /
                   vec2(${s}TexShape[1], ${s}TexShape[0]);
        return sampleTexture(${s}, uv);
      }
    `:`
        float ${o}(int row, int col, int depth) {
          float texR = float(row);
          float texC = dot(vec2(col, depth), vec2(${i}, 1));
          vec2 uv = (vec2(texC, texR) + halfCR) /
                     vec2(${d}.0, ${h}.0);
          return sampleTexture(${s}, uv);
        }
      `;if(d===i&&p==null)return e?`
      float ${o}(int row, int col, int depth) {
        float texR = dot(vec2(row, col), vec2(${s}Shape[1], 1));
        float texC = float(depth);
        vec2 uv = (vec2(texC, texR) + halfCR) / vec2(${s}TexShape[1], ${s}TexShape[0]);
        return sampleTexture(${s}, uv);
      }
    `:`
    float ${o}(int row, int col, int depth) {
      float texR = dot(vec2(row, col), vec2(${t[1]}, 1));
      float texC = float(depth);
      vec2 uv = (vec2(texC, texR) + halfCR) / vec2(${d}.0, ${h}.0);
      return sampleTexture(${s}, uv);
    }
  `;const f=mo(s);return e?`
    float ${o}(int row, int col, int depth) {
      // Explicitly use integer operations as dot() only works on floats.
      int stride0 = ${s}Shape[1] * ${s}Shape[2];
      int stride1 = ${s}Shape[2];
      int index = row * stride0 + col * stride1 + depth + ${f};
      vec2 uv = uvFromFlat(${s}TexShape[0], ${s}TexShape[1], index);
      return sampleTexture(${s}, uv);
    }
    `:`
      float ${o}(int row, int col, int depth) {
        // Explicitly use integer operations as dot() only works on floats.
        int index = row * ${r} + col * ${i} + depth + ${f};
        vec2 uv = uvFromFlat(${h}, ${d}, index);
        return sampleTexture(${s}, uv);
      }
  `}function WM(n,e){const t=n.name,s="get"+t.charAt(0).toUpperCase()+t.slice(1),o=Ot();if(e)return`
    vec4 ${s}(int b2, int b, int row, int col) {
      int valuesPerRow = int(ceil(float(${t}Shape[3]) / 2.0));
      int texelsInBatch = valuesPerRow * int(ceil(float(${t}Shape[2]) / 2.0));
      int index = b * texelsInBatch + (row / 2) * valuesPerRow + (col / 2);
      texelsInBatch *= ${t}Shape[1];
      index = b2 * texelsInBatch + index;
      ivec2 packedTexShape = ivec2(ceil(float(${t}TexShape[0]) / 2.0), ceil(float(${t}TexShape[1]) / 2.0));
      int texR = index / packedTexShape[1];
      int texC = index - texR * packedTexShape[1];
      vec2 uv = (vec2(texC, texR) + halfCR) / vec2(packedTexShape[1], packedTexShape[0]); return ${o.texture2D}(${t}, uv);
    }
  `;const r=n.shapeInfo.logicalShape,i=r.length,a=n.shapeInfo.texShape,l=[Math.ceil(a[0]/2),Math.ceil(a[1]/2)],c=l[0],u=l[1],h=Math.ceil(r[i-1]/2);let d=h*Math.ceil(r[i-2]/2),p="int b, int row, int col",f=`b * ${d} + (row / 2) * ${h} + (col / 2)`;for(let m=2;m<i-1;m++)p=`int b${m}, `+p,d*=r[i-m-1],f=`b${m} * ${d} + `+f;return`
    vec4 ${s}(${p}) {
      int index = ${f};
      int texR = index / ${u};
      int texC = index - texR * ${u};
      vec2 uv = (vec2(texC, texR) + halfCR) / vec2(${u}, ${c});
      return ${o.texture2D}(${t}, uv);
    }
  `}function UM(n,e){const t=n.shapeInfo.logicalShape,s=n.name,o="get"+s.charAt(0).toUpperCase()+s.slice(1),r=t[3],i=t[2]*r,a=t[1]*i,{newShape:l,keptDims:c}=as(t);if(l.length<t.length){const b=er(n,l),w=["row","col","depth","depth2"];return`
      ${Qo(b,e)}
      float ${o}(int row, int col, int depth, int depth2) {
        return ${o}(${tr(w,c)});
      }
    `}if(n.shapeInfo.isUniform)return`
      float ${o}(int row, int col, int depth, int depth2) {
        int index = round(dot(vec4(row, col, depth, depth2),
                          vec4(${a}, ${i}, ${r}, 1)));
        ${Jo(n)}
      }
    `;const u=n.shapeInfo.flatOffset,h=n.shapeInfo.texShape,d=h[0],p=h[1],f=`int stride2 = ${s}Shape[3];`,m=`int stride1 = ${s}Shape[2] * stride2;`,g=`int stride0 = ${s}Shape[1] * stride1;`;if(p===a&&u==null)return e?`
      float ${o}(int row, int col, int depth, int depth2) {
        ${f}
        ${m}
        float texR = float(row);
        float texC =
            dot(vec3(col, depth, depth2),
                vec3(stride1, stride2, 1));
        vec2 uv = (vec2(texC, texR) + halfCR) /
                   vec2(${s}TexShape[1], ${s}TexShape[0]);
        return sampleTexture(${s}, uv);
      }
    `:`
      float ${o}(int row, int col, int depth, int depth2) {
        float texR = float(row);
        float texC =
            dot(vec3(col, depth, depth2),
                vec3(${i}, ${r}, 1));
        vec2 uv = (vec2(texC, texR) + halfCR) /
                   vec2(${p}.0, ${d}.0);
        return sampleTexture(${s}, uv);
      }
    `;if(p===r&&u==null)return e?`
      float ${o}(int row, int col, int depth, int depth2) {
        float texR = dot(vec3(row, col, depth),
                         vec3(${s}Shape[1] * ${s}Shape[2], ${s}Shape[2], 1));
        float texC = float(depth2);
        vec2 uv = (vec2(texC, texR) + halfCR) /
                  vec2(${s}TexShape[1], ${s}TexShape[0]);
        return sampleTexture(${s}, uv);
      }
    `:`
      float ${o}(int row, int col, int depth, int depth2) {
        float texR = dot(vec3(row, col, depth),
                         vec3(${t[1]*t[2]}, ${t[2]}, 1));
        float texC = float(depth2);
        vec2 uv = (vec2(texC, texR) + halfCR) /
                  vec2(${p}.0, ${d}.0);
        return sampleTexture(${s}, uv);
      }
    `;const x=mo(s);return e?`
    float ${o}(int row, int col, int depth, int depth2) {
      // Explicitly use integer operations as dot() only works on floats.
      ${f}
      ${m}
      ${g}
      int index = row * stride0 + col * stride1 +
          depth * stride2 + depth2;
      vec2 uv = uvFromFlat(${s}TexShape[0], ${s}TexShape[1], index + ${x});
      return sampleTexture(${s}, uv);
    }
  `:`
    float ${o}(int row, int col, int depth, int depth2) {
      // Explicitly use integer operations as dot() only works on floats.
      int index = row * ${a} + col * ${i} +
          depth * ${r} + depth2;
      vec2 uv = uvFromFlat(${d}, ${p}, index + ${x});
      return sampleTexture(${s}, uv);
    }
  `}function GM(n){const e=n.shapeInfo.logicalShape,t=n.name,s="get"+t.charAt(0).toUpperCase()+t.slice(1),o=e[4],r=e[3]*o,i=e[2]*r,a=e[1]*i,{newShape:l,keptDims:c}=as(e);if(l.length<e.length){const m=er(n,l),g=["row","col","depth","depth2","depth3"];return`
      ${Qo(m)}
      float ${s}(int row, int col, int depth, int depth2, int depth3) {
        return ${s}(${tr(g,c)});
      }
    `}if(n.shapeInfo.isUniform)return`
      float ${s}(int row, int col, int depth, int depth2, int depth3) {
        float index = dot(
          vec4(row, col, depth, depth2),
          vec4(${a}, ${i}, ${r}, ${o})) +
          depth3;
        ${Jo(n)}
      }
    `;const u=n.shapeInfo.flatOffset,h=n.shapeInfo.texShape,d=h[0],p=h[1];if(p===a&&u==null)return`
      float ${s}(int row, int col, int depth, int depth2, int depth3) {
        int texR = row;
        float texC = dot(vec4(col, depth, depth2, depth3),
                         vec4(${i}, ${r}, ${o}, 1));
        vec2 uv = (vec2(texC, texR) + halfCR) /
                   vec2(${p}.0, ${d}.0);
        return sampleTexture(${t}, uv);
      }
    `;if(p===o&&u==null)return`
      float ${s}(int row, int col, int depth, int depth2, int depth3) {
        float texR = dot(
          vec4(row, col, depth, depth2),
          vec4(${e[1]*e[2]*e[3]},
               ${e[2]*e[3]}, ${e[3]}, 1));
        int texC = depth3;
        vec2 uv = (vec2(texC, texR) + halfCR) /
                  vec2(${p}.0, ${d}.0);
        return sampleTexture(${t}, uv);
      }
    `;const f=mo(t);return`
    float ${s}(int row, int col, int depth, int depth2, int depth3) {
      // Explicitly use integer operations as dot() only works on floats.
      int index = row * ${a} + col * ${i} + depth * ${r} +
          depth2 * ${o} + depth3 + ${f};
      vec2 uv = uvFromFlat(${d}, ${p}, index);
      return sampleTexture(${t}, uv);
    }
  `}function HM(n){const e=n.shapeInfo.logicalShape,t=n.name,s="get"+t.charAt(0).toUpperCase()+t.slice(1),{newShape:o,keptDims:r}=as(e);if(o.length<e.length){const g=er(n,o),x=["row","col","depth","depth2","depth3","depth4"];return`
      ${Qo(g)}
      float ${s}(int row, int col, int depth,
                    int depth2, int depth3, int depth4) {
        return ${s}(${tr(x,r)});
      }
    `}const i=e[5],a=e[4]*i,l=e[3]*a,c=e[2]*l,u=e[1]*c;if(n.shapeInfo.isUniform)return`
      float ${s}(int row, int col, int depth,
                  int depth2, int depth3, int depth4) {
        int index = round(dot(
          vec4(row, col, depth, depth2),
          vec4(${u}, ${c}, ${l}, ${a})) +
          dot(
            vec2(depth3, depth4),
            vec2(${i}, 1)));
        ${Jo(n)}
      }
    `;const h=n.shapeInfo.flatOffset,d=n.shapeInfo.texShape,p=d[0],f=d[1];if(f===u&&h==null)return`
      float ${s}(int row, int col, int depth,
                    int depth2, int depth3, int depth4) {
        int texR = row;
        float texC = dot(vec4(col, depth, depth2, depth3),
          vec4(${c}, ${l}, ${a}, ${i})) +
               float(depth4);
        vec2 uv = (vec2(texC, texR) + halfCR) /
                   vec2(${f}.0, ${p}.0);
        return sampleTexture(${t}, uv);
      }
    `;if(f===i&&h==null)return`
      float ${s}(int row, int col, int depth,
                    int depth2, int depth3, int depth4) {
        float texR = dot(vec4(row, col, depth, depth2),
          vec4(${e[1]*e[2]*e[3]*e[4]},
               ${e[2]*e[3]*e[4]},
               ${e[3]*e[4]},
               ${e[4]})) + float(depth3);
        int texC = depth4;
        vec2 uv = (vec2(texC, texR) + halfCR) /
                  vec2(${f}.0, ${p}.0);
        return sampleTexture(${t}, uv);
      }
    `;const m=mo(t);return`
    float ${s}(int row, int col, int depth,
                  int depth2, int depth3, int depth4) {
      // Explicitly use integer operations as dot() only works on floats.
      int index = row * ${u} + col * ${c} + depth * ${l} +
          depth2 * ${a} + depth3 * ${i} + depth4 + ${m};
      vec2 uv = uvFromFlat(${p}, ${f}, index);
      return sampleTexture(${t}, uv);
    }
  `}function Jo(n){const e=n.name,t=q(n.shapeInfo.logicalShape);return t<2?`return ${e};`:`
    for (int i = 0; i < ${t}; i++) {
      if (i == index) {
        return ${e}[i];
      }
    }
  `}function qM(n,e){const t=n.name,s=t.charAt(0).toUpperCase()+t.slice(1),o="get"+s+"AtOutCoords",r=n.shapeInfo.logicalShape.length,i=e.logicalShape.length,a=L1(n.shapeInfo.logicalShape,e.logicalShape),l=Oe(i),c=i-r;let u;const h=["x","y","z","w","u","v"];r===0?u="":i<2&&a.length>=1?u="coords = 0;":u=a.map(b=>`coords.${h[b+c]} = 0;`).join(`
`);let d="";i<2&&r>0?d="coords":d=n.shapeInfo.logicalShape.map((b,w)=>`coords.${h[w+c]}`).join(", ");let p="return outputValue;";const m=q(n.shapeInfo.logicalShape)===1,x=q(e.logicalShape)===1;if(r===1&&!m&&!x)p=`
      return vec4(outputValue.xy, outputValue.xy);
    `;else if(m&&!x)i===1?p=`
        return vec4(outputValue.x, outputValue.x, 0., 0.);
      `:p=`
        return vec4(outputValue.x);
      `;else if(a.length){const b=r-2,w=r-1;a.indexOf(b)>-1&&a.indexOf(w)>-1?p="return vec4(outputValue.x);":a.indexOf(b)>-1?p="return vec4(outputValue.x, outputValue.y, outputValue.x, outputValue.y);":a.indexOf(w)>-1&&(p="return vec4(outputValue.xx, outputValue.zz);")}return`
    vec4 ${o}() {
      ${l} coords = getOutputCoords();
      ${u}
      vec4 outputValue = get${s}(${d});
      ${p}
    }
  `}function jM(n,e){const t=n.name,s=t.charAt(0).toUpperCase()+t.slice(1),o="get"+s+"AtOutCoords",r=e.texShape,i=n.shapeInfo.texShape,a=n.shapeInfo.logicalShape.length,l=e.logicalShape.length;if(!n.shapeInfo.isUniform&&a===l&&n.shapeInfo.flatOffset==null&&Ee(i,r))return`
      float ${o}() {
        return sampleTexture(${t}, resultUV);
      }
    `;const c=Oe(l),u=L1(n.shapeInfo.logicalShape,e.logicalShape),h=l-a;let d;const p=["x","y","z","w","u","v"];a===0?d="":l<2&&u.length>=1?d="coords = 0;":d=u.map(m=>`coords.${p[m+h]} = 0;`).join(`
`);let f="";return l<2&&a>0?f="coords":f=n.shapeInfo.logicalShape.map((m,g)=>`coords.${p[g+h]}`).join(", "),`
    float ${o}() {
      ${c} coords = getOutputCoords();
      ${d}
      return get${s}(${f});
    }
  `}function Oe(n){if(n<=1)return"int";if(n===2)return"ivec2";if(n===3)return"ivec3";if(n===4)return"ivec4";if(n===5)return"ivec5";if(n===6)return"ivec6";throw Error(`GPU for rank ${n} is not yet supported`)}function ip(n,e,t){const{newShape:s,keptDims:o}=as(e),r=e.length,i=n&&r===3&&e[0]===1,a=i?e.slice(1):s,l=!n&&r>1&&!Ee(e,t)&&s.length<r||i;return{useSqueezeShape:l,uniformShape:l?a:e,keptDims:o}}function er(n,e){const t=JSON.parse(JSON.stringify(n));return t.shapeInfo.logicalShape=e,t}function tr(n,e){return e.map(t=>n[t]).join(", ")}function KM(n,e,t,s){const o=t.map((u,h)=>{const d={logicalShape:u.shape,texShape:u.isUniform?null:u.texData.texShape,isUniform:u.isUniform,isPacked:u.isUniform?!1:u.texData.isPacked,flatOffset:null};return u.texData!=null&&u.texData.slice!=null&&u.texData.slice.flatOffset>0&&(d.flatOffset=u.texData.slice.flatOffset),{name:e.variableNames[h],shapeInfo:d}}),r=o.map(u=>u.shapeInfo),i={logicalShape:s.shape,texShape:s.texData.texShape,isUniform:!1,isPacked:s.texData.isPacked,flatOffset:null},a=dM(o,i,e),l=VL(n.gl,a),c=n.createProgram(l);return V().get("ENGINE_COMPILE_ONLY")?{program:e,fragmentShader:l,source:a,webGLProgram:c,inShapeInfos:r,outShapeInfo:i,variablesLocations:null,customUniformLocations:null,infLoc:null,nanLoc:null,outShapeLocation:null,outShapeStridesLocation:null,outTexShapeLocation:null}:(n.buildVao(c),Object.assign({program:e,fragmentShader:l,source:a,webGLProgram:c,inShapeInfos:r,outShapeInfo:i},B1(n,e,c)))}function B1(n,e,t){const s=[],o=[];let r,i,a,l=null,c=null;c=n.getUniformLocation(t,"NAN",!1),V().getNumber("WEBGL_VERSION")===1&&(l=n.getUniformLocation(t,"INFINITY",!1));const u=!1;for(const h of e.variableNames){const d={name:h,uniform:n.getUniformLocation(t,h,u),offset:n.getUniformLocation(t,`offset${h}`,u)};e.enableShapeUniforms&&(d.shape=n.getUniformLocation(t,`${h}Shape`,u),d.texShape=n.getUniformLocation(t,`${h}TexShape`,u)),s.push(d)}if(e.enableShapeUniforms&&(r=n.getUniformLocation(t,"outShape",u),a=n.getUniformLocation(t,"outShapeStrides",u),i=n.getUniformLocation(t,"outTexShape",u)),e.customUniforms)for(const h of e.customUniforms)o.push(n.getUniformLocation(t,h.name,u));return{variablesLocations:s,customUniformLocations:o,infLoc:l,nanLoc:c,outShapeLocation:r,outShapeStridesLocation:a,outTexShapeLocation:i}}function z1(n,e){if(n.length!==e.length)throw Error(`Binary was compiled with ${n.length} inputs, but was executed with ${e.length} inputs`);n.forEach((t,s)=>{const o=t.logicalShape,r=e[s],i=r.shape;if(!Ee(o,i))throw Error(`Binary was compiled with different shapes than the current args. Shapes ${o} and ${i} must match`);if(t.isUniform&&r.isUniform)return;const a=t.texShape,l=r.isUniform?null:r.texData.texShape;if(!Ee(a,l))throw Error(`Binary was compiled with different texture shapes than the current args. Shape ${a} and ${l} must match`)})}function XM(n,e,t,s,o){e.program.enableShapeUniforms||(z1(e.inShapeInfos,t),z1([e.outShapeInfo],[s]));const r=s.texData.texture,i=s.texData.texShape;s.texData.isPacked?n.setOutputPackedMatrixTexture(r.texture,i[0],i[1]):n.setOutputMatrixTexture(r.texture,i[0],i[1]),n.setProgram(e.webGLProgram),n.bindVertexArray(e.webGLProgram.vao),V().getNumber("WEBGL_VERSION")===1&&e.infLoc!==null&&n.gl.uniform1f(e.infLoc,1/0),e.nanLoc!==null&&n.gl.uniform1f(e.nanLoc,NaN);for(let l=0;l<t.length;++l){const c=t[l],{uniform:u,offset:h,shape:d,texShape:p}=e.variablesLocations[l];if(d){const{uniformShape:f}=ip(e.program.packedInputs,c.shape,c.texData.texShape);switch(f.length){case 1:n.gl.uniform1iv(d,new Int32Array(f));break;case 2:n.gl.uniform2iv(d,new Int32Array(f));break;case 3:n.gl.uniform3iv(d,new Int32Array(f));break;case 4:n.gl.uniform4iv(d,new Int32Array(f));break}}if(p&&n.gl.uniform2i(p,c.texData.texShape[0],c.texData.texShape[1]),u!=null){if(c.isUniform){if(q(c.shape)<2)n.gl.uniform1f(u,c.uniformValues[0]);else{let f=c.uniformValues;f instanceof Float32Array||(f=new Float32Array(f)),n.gl.uniform1fv(u,f)}continue}c.texData.slice!=null&&h!=null&&n.gl.uniform1i(h,c.texData.slice.flatOffset),n.setInputMatrixTexture(c.texData.texture.texture,u,l)}}const a=e.outShapeLocation;if(a)switch(s.shape.length){case 1:n.gl.uniform1iv(a,new Int32Array(s.shape));break;case 2:n.gl.uniform2iv(a,new Int32Array(s.shape));break;case 3:n.gl.uniform3iv(a,new Int32Array(s.shape));break;case 4:n.gl.uniform4iv(a,new Int32Array(s.shape));break}if(e.outShapeStridesLocation){const l=ce(s.shape);switch(s.shape.length){case 2:n.gl.uniform1iv(e.outShapeStridesLocation,new Int32Array(l));break;case 3:n.gl.uniform2iv(e.outShapeStridesLocation,new Int32Array(l));break;case 4:n.gl.uniform3iv(e.outShapeStridesLocation,new Int32Array(l));break}}if(e.outTexShapeLocation&&n.gl.uniform2i(e.outTexShapeLocation,s.texData.texShape[0],s.texData.texShape[1]),e.program.customUniforms&&o)for(let l=0;l<e.program.customUniforms.length;++l){const c=e.program.customUniforms[l],u=e.customUniformLocations[l],h=o[l];if(c.type==="float")n.gl.uniform1fv(u,h);else if(c.type==="vec2")n.gl.uniform2fv(u,h);else if(c.type==="vec3")n.gl.uniform3fv(u,h);else if(c.type==="vec4")n.gl.uniform4fv(u,h);else if(c.type==="int")n.gl.uniform1iv(u,h);else if(c.type==="ivec2")n.gl.uniform2iv(u,h);else if(c.type==="ivec3")n.gl.uniform3iv(u,h);else if(c.type==="ivec4")n.gl.uniform4iv(u,h);else throw Error(`uniform type ${c.type} is not supported yet.`)}n.executeProgram()}function YM(n,e,t){let s="";e.concat(t).forEach(i=>{const a=i.texData!=null&&i.texData.slice!=null&&i.texData.slice.flatOffset>0;if(n.enableShapeUniforms&&!i.isUniform){const l=i.texData.texShape,{useSqueezeShape:c,uniformShape:u,keptDims:h}=ip(n.packedInputs,i.shape,l);let d="",p="",f="";if(u.length===1&&n.packedInputs){const C=[Math.ceil(l[0]/2),Math.ceil(l[1]/2)];d=`${C[0]>1}_${C[1]>1}`}else if(u.length===2&&!n.packedInputs)p=`${u[0]>1}_${u[1]>1}`;else if(u.length>2&&!n.packedInputs){const C=ce(u);f=`${C[0]===l[1]}_${C[C.length-1]===l[1]}`}const m=i.shape.length,g=u.length===2&&Ee(i.shape,l),x=q(i.shape)===1,b=Oo(i.shape,t.shape),w=!n.packedInputs&&m===t.shape.length&&Ee(l,t.texData.texShape),y=n.packedInputs||u.length>2?"":`${l[0]>1}_${l[1]>1}`;s+=`${m}_${w}_${c?h:""}_${u.length}_${x}_${b}_${g}_${d}_${p}_${f}_${y}_${a}`}else{const l=i.isUniform?"uniform":i.texData.texShape;s+=`${i.shape}_${l}_${a}`}});const o=n.userCode;let r=n.constructor.name;return r+="_"+s+"_"+o+`${V().getNumber("WEBGL_VERSION")}`,r}function At(n){return V().getBool("WEBGL_USE_SHAPES_UNIFORMS")&&n<=4}class ZM{constructor(e){this.variableNames=["A"],this.packedInputs=!1,this.packedOutput=!0,this.outPackingScheme=zi.DENSE,this.customUniforms=[{name:"texShape",type:"ivec2"}];const t=Ot();this.outputShape=e,this.enableShapeUniforms=At(this.outputShape.length),this.userCode=`
      ivec3 outCoordsFromFlatIndex(int index) {
        ${this.enableShapeUniforms?gc(["r","c","d"],e):fo(["r","c","d"],e)}
        return ivec3(r, c, d);
      }

      void main() {
        ivec2 resTexRC = ivec2(resultUV.yx * vec2(texShape[0], texShape[1]));
        int index = 4 * (resTexRC.x * texShape[1] + resTexRC.y);

        vec4 result = vec4(0.);

        for (int i=0; i<4; i++) {
          int flatIndex = index + i;
          ivec3 rc = outCoordsFromFlatIndex(flatIndex);
          result[i] = getA(rc.x, rc.y, rc.z);
        }

        ${t.output} = result;
      }
    `}}class QM{constructor(e){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!0,this.outPackingScheme=zi.DENSE,this.customUniforms=[{name:"texShape",type:"ivec2"}];const t=Ot();this.outputShape=e,this.enableShapeUniforms=At(this.outputShape.length),this.userCode=`
      ivec3 outCoordsFromFlatIndex(int index) {
        ${this.enableShapeUniforms?gc(["r","c","d"],e):fo(["r","c","d"],e)}
        return ivec3(r, c, d);
      }

      void main() {
        ivec2 resTexRC = ivec2(resultUV.yx * vec2(texShape[0], texShape[1]));
        int index = 4 * (resTexRC.x * texShape[1] + resTexRC.y);

        vec4 result = vec4(0.);

        for (int i=0; i<4; i++) {
          int flatIndex = index + i;
          ivec3 rc = outCoordsFromFlatIndex(flatIndex);
          result[i] = getChannel(getA(rc.x, rc.y, rc.z), vec2(rc.y, rc.z));
        }

        ${t.output} = result;
      }
    `}}class JM{constructor(e){this.variableNames=["A"],this.outTexUsage=en.DOWNLOAD;const t=Ot();this.outputShape=e,this.userCode=`
      ${O1}

      void main() {
        float x = getAAtOutCoords();
        ${t.output} = encode_float(x);
      }
    `}}class eP{constructor(e){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!1,this.outTexUsage=en.DOWNLOAD;const t=Ot();this.outputShape=e,this.userCode=`
      ${O1}

      void main() {
        ivec3 coords = getOutputCoords();
        float x = getChannel(getAAtOutCoords(), vec2(coords.y, coords.z));
        ${t.output} = encode_float(x);
      }
    `}}const tP={R:0,G:1,B:2,A:3};class V1{constructor(e,t=!1,s="RGBA"){this.variableNames=["A"],this.customUniforms=[{name:"texShape",type:"ivec2"}];const o=Ot();this.outputShape=e,this.enableShapeUniforms=At(this.outputShape.length);let r="result";t&&(r="floor(result * 255. + 0.5)");let i="";for(let a=0;a<s.length;a++){const l=s[a];i+=`
          if(offset == ${a}) {
            result = values[${tP[l]}];
          }`}this.userCode=`
      ${this.enableShapeUniforms?rp():op(e)}

      void main() {
        ivec3 coords = getOutputCoords();
        int flatIndex = getFlatIndex(coords);
        float result = 0.;
        int offset = imod(flatIndex, ${s.length});

        flatIndex = idiv(flatIndex, ${s.length}, 1.);

        int r = flatIndex / texShape[1];
        if (r < texShape[0]) {
          int c = imod(flatIndex, texShape[1]);
          vec2 uv = (vec2(c, r) + halfCR) / vec2(texShape[1], texShape[0]);
          vec4 values = ${o.texture2D}(A, uv);
          ${i}
        }
        ${o.output} = vec4(${r}, 0., 0., 0.);
      }
    `}}class nP{constructor(e,t=!1){this.variableNames=["A"],this.packedInputs=!1,this.packedOutput=!0,this.customUniforms=[{name:"texShape",type:"ivec2"}];const s=Ot();this.outputShape=e,this.enableShapeUniforms=At(this.outputShape.length);let o="",r="result";t&&(r="floor(result * 255. + 0.5)");for(let i=0;i<=1;i++)for(let a=0;a<=1;a++){const l=i*2+a;o+=`
          localCoords = coords;
          if(localCoords[2] + ${a} < ${this.enableShapeUniforms?"outShape[2]":`${e[2]}`}) {
          localCoords[2] += ${a};
          if (localCoords[1] + ${i} < ${this.enableShapeUniforms?"outShape[1]":`${e[1]}`}) {
            localCoords[1] += ${i};

            flatIndex = getFlatIndex(localCoords);
            offset = imod(flatIndex, 4);

            flatIndex = idiv(flatIndex, 4, 1.);

            int r = flatIndex / texShape[1];
            int c = imod(flatIndex, texShape[1]);
            vec2 uv = (vec2(c, r) + halfCR) / vec2(texShape[1], texShape[0]);
            values = ${s.texture2D}(A, uv);

            if (offset == 0) {
              result[${l}] = values[0];
            } else if (offset == 1) {
              result[${l}] = values[1];
            } else if (offset == 2) {
              result[${l}] = values[2];
            } else {
              result[${l}] = values[3];
            }
          }
        }
        `}this.userCode=`
        ${this.enableShapeUniforms?rp():op(e)}

        void main() {
          ivec3 coords = getOutputCoords();

          vec4 result = vec4(0.);
          int flatIndex, r, c, offset;
          ivec3 localCoords;
          vec2 uv;
          vec4 values;

          ${o}

          ${s.output} = ${r};
        }
    `}}function sP(n){const e=Ot(),t=`${e.version}
    precision highp float;
    ${e.attribute} vec3 clipSpacePos;
    ${e.attribute} vec2 uv;
    ${e.varyingVs} vec2 resultUV;

    void main() {
      gl_Position = vec4(clipSpacePos, 1);
      resultUV = uv;
    }`;return zL(n,t)}function oP(n){const e=new Float32Array([-1,1,0,0,1,-1,-1,0,0,0,1,1,0,1,1,1,-1,0,1,0]);return HL(n,e)}function rP(n){const e=new Uint16Array([0,1,2,2,1,3]);return qL(n,e)}function Ui(n,e,t,s,o,r){KL(e,t);const i=jL(n),a=n.TEXTURE_2D;return re(n,()=>n.bindTexture(a,i)),re(n,()=>n.texParameteri(a,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE)),re(n,()=>n.texParameteri(a,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE)),re(n,()=>n.texParameteri(a,n.TEXTURE_MIN_FILTER,n.NEAREST)),re(n,()=>n.texParameteri(a,n.TEXTURE_MAG_FILTER,n.NEAREST)),V().getNumber("WEBGL_VERSION")===1?re(n,()=>n.texImage2D(a,0,s,e,t,0,o,r,null)):re(n,()=>n.texStorage2D(a,1,s,e,t)),re(n,()=>n.bindTexture(n.TEXTURE_2D,null)),{texture:i,texShape:[t,e]}}function W1(n){return n.internalFormatFloat}function iP(n,e,t,s){const[o,r]=Vi(e,t);return Ui(n,o,r,W1(s),s.textureFormatFloat,n.FLOAT)}function U1(n){return n.internalFormatHalfFloat}function aP(n,e,t,s){const[o,r]=Vi(e,t);return Ui(n,o,r,U1(s),s.textureFormatFloat,s.textureTypeHalfFloat)}function G1(n){return n.downloadTextureFormat}function lP(n,e,t,s){const[o,r]=Vi(e,t);return Ui(n,o,r,G1(s),n.RGBA,n.UNSIGNED_BYTE)}function H1(n){return n.internalFormatPackedFloat}function cP(n,e,t,s){const[o,r]=Xo(e,t);return Ui(n,o,r,H1(s),n.RGBA,n.FLOAT)}function q1(n){return n.internalFormatPackedHalfFloat}function uP(n,e,t,s){const[o,r]=Xo(e,t);return Ui(n,o,r,q1(s),n.RGBA,s.textureTypeHalfFloat)}function hP(n,e,t){return re(n,()=>n.bindBuffer(n.ARRAY_BUFFER,t)),D1(n,e,"clipSpacePos",t,3,20,0)&&D1(n,e,"uv",t,2,20,12)}function dP(n,e,t,s,o,r){re(n,()=>n.bindTexture(n.TEXTURE_2D,e));let i,a,l;o instanceof Uint8Array?(i=new Uint8Array(t*s*4),a=n.UNSIGNED_BYTE,l=n.RGBA):(i=new Float32Array(t*s*4),a=n.FLOAT,l=r.internalFormatPackedFloat),i.set(o),V().getNumber("WEBGL_VERSION")===2?re(n,()=>n.texSubImage2D(n.TEXTURE_2D,0,0,0,t,s,n.RGBA,a,i)):re(n,()=>n.texImage2D(n.TEXTURE_2D,0,l,t,s,0,n.RGBA,a,i)),re(n,()=>n.bindTexture(n.TEXTURE_2D,null))}function pP(n,e,t){re(n,()=>n.bindTexture(n.TEXTURE_2D,e)),t.data instanceof Uint8Array?V().getNumber("WEBGL_VERSION")===2?re(n,()=>n.texSubImage2D(n.TEXTURE_2D,0,0,0,t.width,t.height,n.RGBA,n.UNSIGNED_BYTE,t.data)):re(n,()=>n.texImage2D(n.TEXTURE_2D,0,n.RGBA,t.width,t.height,0,n.RGBA,n.UNSIGNED_BYTE,t.data)):V().getNumber("WEBGL_VERSION")===2?re(n,()=>n.texSubImage2D(n.TEXTURE_2D,0,0,0,n.RGBA,n.UNSIGNED_BYTE,t)):re(n,()=>n.texImage2D(n.TEXTURE_2D,0,n.RGBA,n.RGBA,n.UNSIGNED_BYTE,t)),re(n,()=>n.bindTexture(n.TEXTURE_2D,null))}function fP(n,e,t,s){const o=n.createBuffer();re(n,()=>n.bindBuffer(n.PIXEL_PACK_BUFFER,o));const a=4*4*e*t;return re(n,()=>n.bufferData(n.PIXEL_PACK_BUFFER,a,n.STREAM_READ)),re(n,()=>n.readPixels(0,0,t,e,n.RGBA,n.FLOAT,0)),re(n,()=>n.bindBuffer(n.PIXEL_PACK_BUFFER,null)),o}function mP(n,e,t){const s=n,o=new Float32Array(t);return s.bindBuffer(s.PIXEL_PACK_BUFFER,e),s.getBufferSubData(s.PIXEL_PACK_BUFFER,0,o),s.bindBuffer(s.PIXEL_PACK_BUFFER,null),o}function gP(n,e,t,s){const[o,r]=Vi(e,t),i=4,a=new Uint8Array(FL(e*t,i));return re(n,()=>n.readPixels(0,0,o,r,s.downloadTextureFormat,n.UNSIGNED_BYTE,a)),new Float32Array(a.buffer)}function xP(n,e,t,s,o,r,i,a){const l=n,c=new Float32Array(_L(r,i));return l.bindBuffer(l.PIXEL_PACK_BUFFER,e),l.getBufferSubData(l.PIXEL_PACK_BUFFER,0,c),l.bindBuffer(l.PIXEL_PACK_BUFFER,null),c}function bP(n,e,t){const s=new Float32Array(e*t*4);return re(n,()=>n.readPixels(0,0,t,e,n.RGBA,n.FLOAT,s)),s}class ap{constructor(e){this.outputTexture=null,this.program=null,this.disposed=!1,this.itemsToPoll=[];const t=V().getNumber("WEBGL_VERSION");if(e!=null?(this.gl=e,RL(t,e)):this.gl=Nn(t),e=this.gl,V().getNumber("WEBGL_VERSION")===2){const r=e;this.createVertexArray=()=>re(r,()=>r.createVertexArray()),this.bindVertexArray=i=>re(r,()=>r.bindVertexArray(i)),this.deleteVertexArray=i=>re(r,()=>r.deleteVertexArray(i)),this.getVertexArray=()=>re(r,()=>r.getParameter(r.VERTEX_ARRAY_BINDING))}else if(e!=null){const r=e.getExtension("OES_vertex_array_object");if(r==null)throw new Error("All WebGL1 implementations are expected to offer OES_vertex_array_object.");this.createVertexArray=()=>re(e,()=>r.createVertexArrayOES()),this.bindVertexArray=i=>re(e,()=>r.bindVertexArrayOES(i)),this.deleteVertexArray=i=>re(e,()=>r.deleteVertexArrayOES(i)),this.getVertexArray=()=>re(e,()=>e.getParameter(r.VERTEX_ARRAY_BINDING_OES))}let s="WEBGL_color_buffer_float";const o="EXT_color_buffer_half_float";if(this.parallelCompilationExtension=this.gl.getExtension("KHR_parallel_shader_compile"),V().getNumber("WEBGL_VERSION")===1){const r="OES_texture_float",i="OES_texture_half_float";if(this.textureFloatExtension=hc(this.gl,r),dn(this.gl,i))this.textureHalfFloatExtension=hc(this.gl,i);else if(V().get("WEBGL_FORCE_F16_TEXTURES"))throw new Error("GL context does not support half float textures, yet the environment flag WEBGL_FORCE_F16_TEXTURES is set to true.");if(this.colorBufferFloatExtension=this.gl.getExtension(s),dn(this.gl,o))this.colorBufferHalfFloatExtension=hc(this.gl,o);else if(V().get("WEBGL_FORCE_F16_TEXTURES"))throw new Error("GL context does not support color renderable half floats, yet the environment flag WEBGL_FORCE_F16_TEXTURES is set to true.")}else if(s="EXT_color_buffer_float",dn(this.gl,s))this.colorBufferFloatExtension=this.gl.getExtension(s);else if(dn(this.gl,o))this.colorBufferHalfFloatExtension=this.gl.getExtension(o);else throw new Error("GL context does not support color renderable floats");this.vertexBuffer=oP(this.gl),this.indexBuffer=rP(this.gl),this.framebuffer=XL(this.gl),this.textureConfig=Qd(this.gl,this.textureHalfFloatExtension)}get debug(){return V().getBool("DEBUG")}dispose(){if(this.disposed)return;this.program!=null&&console.warn("Disposing a GPGPUContext that still has a bound WebGLProgram. This is probably a resource leak, delete the program with GPGPUContext.deleteProgram before disposing."),this.outputTexture!=null&&console.warn("Disposing a GPGPUContext that still has a bound output matrix texture.  This is probably a resource leak, delete the output matrix texture with GPGPUContext.deleteMatrixTexture before disposing.");const e=this.gl;re(e,()=>e.finish()),re(e,()=>e.bindFramebuffer(e.FRAMEBUFFER,null)),re(e,()=>e.deleteFramebuffer(this.framebuffer)),re(e,()=>e.bindBuffer(e.ARRAY_BUFFER,null)),re(e,()=>e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,null)),re(e,()=>e.deleteBuffer(this.indexBuffer)),this.disposed=!0}createFloat32MatrixTexture(e,t){return this.throwIfDisposed(),iP(this.gl,e,t,this.textureConfig)}createFloat16MatrixTexture(e,t){return this.throwIfDisposed(),aP(this.gl,e,t,this.textureConfig)}createUnsignedBytesMatrixTexture(e,t){return this.throwIfDisposed(),lP(this.gl,e,t,this.textureConfig)}uploadPixelDataToTexture(e,t){this.throwIfDisposed(),pP(this.gl,e,t)}uploadDenseMatrixToTexture(e,t,s,o){this.throwIfDisposed(),dP(this.gl,e,t,s,o,this.textureConfig)}createFloat16PackedMatrixTexture(e,t){return this.throwIfDisposed(),uP(this.gl,e,t,this.textureConfig)}createPackedMatrixTexture(e,t){return this.throwIfDisposed(),cP(this.gl,e,t,this.textureConfig)}deleteMatrixTexture(e){this.throwIfDisposed(),this.outputTexture===e&&(F1(this.gl,this.framebuffer),this.outputTexture=null),re(this.gl,()=>this.gl.deleteTexture(e))}downloadByteEncodedFloatMatrixFromOutputTexture(e,t,s){return this.downloadMatrixDriver(e,()=>gP(this.gl,t,s,this.textureConfig))}downloadPackedMatrixFromBuffer(e,t,s,o,r,i){return xP(this.gl,e,t,s,o,r,i,this.textureConfig)}downloadFloat32MatrixFromBuffer(e,t){return mP(this.gl,e,t)}createBufferFromTexture(e,t,s){this.bindTextureToFrameBuffer(e);const o=fP(this.gl,t,s,this.textureConfig);return this.unbindTextureToFrameBuffer(),o}createAndWaitForFence(){const e=this.createFence(this.gl);return this.pollFence(e)}createFence(e){let t,s;if(V().getBool("WEBGL_FENCE_API_ENABLED")){const o=e,r=o.fenceSync(o.SYNC_GPU_COMMANDS_COMPLETE,0);e.flush(),s=()=>{const i=o.clientWaitSync(r,0,0);return i===o.ALREADY_SIGNALED||i===o.CONDITION_SATISFIED},t=r}else V().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION")>0?(t=this.beginQuery(),this.endQuery(),s=()=>this.isQueryAvailable(t,V().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION"))):s=()=>!0;return{query:t,isFencePassed:s}}downloadMatrixFromPackedTexture(e,t,s){return this.downloadMatrixDriver(e,()=>bP(this.gl,t,s))}createProgram(e){this.throwIfDisposed();const t=this.gl;this.vertexShader==null&&(this.vertexShader=sP(t));const s=UL(t);re(t,()=>t.attachShader(s,this.vertexShader)),re(t,()=>t.attachShader(s,e)),GL(t,s);const o=Object.assign(s,{vao:this.createVertexArray()});return this.debug&&Jd(t,o),o}buildVao(e){this.setProgram(e),this.bindVertexArray(e.vao);const t=this.gl;re(t,()=>t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.indexBuffer)),hP(t,e,this.vertexBuffer)}deleteProgram(e){this.throwIfDisposed(),e===this.program&&(this.program=null),e!=null&&(re(this.gl,()=>this.gl.deleteProgram(e)),this.deleteVertexArray(e.vao))}setProgram(e){this.throwIfDisposed(),this.program=e,this.program!=null&&this.debug&&Jd(this.gl,this.program),re(this.gl,()=>this.gl.useProgram(e))}getUniformLocation(e,t,s=!0){return this.throwIfDisposed(),s?ZL(this.gl,e,t):QL(this.gl,e,t)}getAttributeLocation(e,t){return this.throwIfDisposed(),re(this.gl,()=>this.gl.getAttribLocation(e,t))}getUniformLocationNoThrow(e,t){return this.throwIfDisposed(),this.gl.getUniformLocation(e,t)}setInputMatrixTexture(e,t,s){this.throwIfDisposed(),this.throwIfNoProgram(),JL(this.gl,e,t,s)}setOutputMatrixTexture(e,t,s){this.setOutputMatrixTextureDriver(e,s,t)}setOutputPackedMatrixTexture(e,t,s){this.throwIfDisposed();const[o,r]=Xo(t,s);this.setOutputMatrixTextureDriver(e,o,r)}setOutputMatrixWriteRegion(e,t,s,o){this.setOutputMatrixWriteRegionDriver(s,e,o,t)}setOutputPackedMatrixWriteRegion(e,t,s,o){throw new Error("setOutputPackedMatrixWriteRegion not implemented.")}debugValidate(){this.program!=null&&Jd(this.gl,this.program),dc(this.gl)}executeProgram(){this.throwIfDisposed(),this.throwIfNoProgram();const e=this.gl;if(this.debug){const t=this.getVertexArray();console.assert(t===this.program.vao,"VAO changed between setProgram and executeProgram!"),this.debugValidate()}re(e,()=>e.drawElements(e.TRIANGLES,6,e.UNSIGNED_SHORT,0))}blockUntilAllProgramsCompleted(){this.throwIfDisposed(),re(this.gl,()=>this.gl.finish())}getQueryTimerExtension(){return this.disjointQueryTimerExtension==null&&(this.disjointQueryTimerExtension=hc(this.gl,V().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION")===2?"EXT_disjoint_timer_query_webgl2":"EXT_disjoint_timer_query")),this.disjointQueryTimerExtension}getQueryTimerExtensionWebGL2(){return this.getQueryTimerExtension()}getQueryTimerExtensionWebGL1(){return this.getQueryTimerExtension()}beginQuery(){if(V().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION")===2){const s=this.gl,o=this.getQueryTimerExtensionWebGL2(),r=s.createQuery();return s.beginQuery(o.TIME_ELAPSED_EXT,r),r}const e=this.getQueryTimerExtensionWebGL1(),t=e.createQueryEXT();return e.beginQueryEXT(e.TIME_ELAPSED_EXT,t),t}endQuery(){if(V().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION")===2){const t=this.gl,s=this.getQueryTimerExtensionWebGL2();t.endQuery(s.TIME_ELAPSED_EXT);return}const e=this.getQueryTimerExtensionWebGL1();e.endQueryEXT(e.TIME_ELAPSED_EXT)}waitForQueryAndGetTime(e){return Y(this,null,function*(){return yield vp(()=>this.disposed||this.isQueryAvailable(e,V().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION"))),this.getQueryTime(e,V().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION"))})}getQueryTime(e,t){if(t===0)return null;if(t===2){const s=this.gl;return s.getQueryParameter(e,s.QUERY_RESULT)/1e6}else{const s=this.getQueryTimerExtensionWebGL1();return s.getQueryObjectEXT(e,s.QUERY_RESULT_EXT)/1e6}}isQueryAvailable(e,t){if(t===0)return!0;if(t===2){const s=this.gl,o=this.getQueryTimerExtensionWebGL2(),r=s.getQueryParameter(e,s.QUERY_RESULT_AVAILABLE);return this.disjoint==null&&(this.disjoint=this.gl.getParameter(o.GPU_DISJOINT_EXT)),r&&!this.disjoint}else{const s=this.getQueryTimerExtensionWebGL1(),o=s.getQueryObjectEXT(e,s.QUERY_RESULT_AVAILABLE_EXT);return this.disjoint==null&&(this.disjoint=this.gl.getParameter(s.GPU_DISJOINT_EXT)),o&&!this.disjoint}}pollFence(e){return new Promise(t=>{this.addItemToPoll(()=>e.isFencePassed(),()=>t())})}pollItems(){const e=yP(this.itemsToPoll.map(t=>t.isDoneFn));for(let t=0;t<=e;++t){const{resolveFn:s}=this.itemsToPoll[t];s()}this.itemsToPoll=this.itemsToPoll.slice(e+1)}addItemToPoll(e,t){if(this.itemsToPoll.push({isDoneFn:e,resolveFn:t}),this.itemsToPoll.length>1)return;let s;"setTimeoutCustom"in V().platform&&(s=V().platform.setTimeoutCustom.bind(V().platform)),vp(()=>(this.pollItems(),this.itemsToPoll.length===0),()=>0,null,s)}bindTextureToFrameBuffer(e){this.throwIfDisposed(),ep(this.gl,e,this.framebuffer),this.debug&&dc(this.gl)}unbindTextureToFrameBuffer(){this.outputTexture!=null?(ep(this.gl,this.outputTexture,this.framebuffer),this.debug&&dc(this.gl)):F1(this.gl,this.framebuffer)}downloadMatrixDriver(e,t){this.bindTextureToFrameBuffer(e);const s=t();return this.unbindTextureToFrameBuffer(),s}setOutputMatrixTextureDriver(e,t,s){this.throwIfDisposed();const o=this.gl;ep(o,e,this.framebuffer),this.debug&&dc(o),this.outputTexture=e,re(o,()=>o.viewport(0,0,t,s)),re(o,()=>o.scissor(0,0,t,s))}setOutputMatrixWriteRegionDriver(e,t,s,o){this.throwIfDisposed(),re(this.gl,()=>this.gl.scissor(e,t,s,o))}throwIfDisposed(){if(this.disposed)throw new Error("Attempted to use disposed GPGPUContext.")}throwIfNoProgram(){if(this.program==null)throw new Error("No GPU program is currently set.")}}function yP(n){let e=0;for(;e<n.length&&n[e]();++e);return e-1}const{addImpl:wP,bincountImpl:j1,bincountReduceImpl:CP,bitwiseAndImpl:IP,castImpl:$P,ceilImpl:kP,concatImpl:vP,equalImpl:SP,expImpl:NP,expm1Impl:TP,floorImpl:EP,gatherNdImpl:RP,gatherV2Impl:AP,greaterImpl:DP,greaterEqualImpl:FP,lessImpl:_P,lessEqualImpl:OP,linSpaceImpl:LP,logImpl:MP,maxImpl:PP,maximumImpl:BP,minimumImpl:zP,multiplyImpl:VP,negImpl:WP,notEqualImpl:UP,prodImpl:GP,raggedGatherImpl:HP,raggedRangeImpl:qP,raggedTensorToTensorImpl:jP,rangeImpl:KP,rsqrtImpl:XP,scatterImpl:YP,sigmoidImpl:ZP,simpleAbsImpl:K1,sliceImpl:QP,sparseFillEmptyRowsImpl:JP,sparseReshapeImpl:e3,sparseSegmentReductionImpl:X1,sqrtImpl:t3,staticRegexReplaceImpl:n3,stridedSliceImpl:s3,stringNGramsImpl:o3,stringSplitImpl:r3,stringToHashBucketFastImpl:i3,subImpl:a3,tileImpl:l3,topKImpl:c3,transposeImpl:lp,uniqueImpl:u3}=mA;function Y1(n,e){return["x","y","z","w","u","v"].slice(0,e).map(t=>`${n}.${t}`)}function Lt(n,e){return e===1?[n]:Y1(n,e)}function h3(n,e){if(n===1)return"rc";let t="";for(let s=0;s<n;s++)t+=e[s],s<n-1&&(t+=",");return t}class d3{constructor(e){if(this.variableNames=["A"],this.packedInputs=!1,this.packedOutput=!0,this.outputShape=e,this.rank=e.length,this.enableShapeUniforms=At(this.outputShape.length),this.rank===0)this.userCode=`
        void main() {
          setOutput(vec4(getA(), 0., 0., 0.));
        }
      `;else{const t=Lt("rc",this.rank),s=Oe(this.rank),o=this.getOutOfBoundsCondition(t),r=this.getSetup(t),i=this.getOutput(t);this.userCode=`
        void main() {
          ${s} rc = getOutputCoords();

          if(${o}) {
            setOutput(vec4(0));
          } else {
            ${r}

            setOutput(vec4(${i}));
          }
        }
      `}}getSourceCoordsArr(e){const t=[];for(let s=0;s<=1;s++)for(let o=0;o<=1;o++){let r=`${s===0?"r":"rp1"}, ${o===0?"c":"cp1"}`;for(let i=2;i<this.rank;i++)r=`${e[e.length-1-i]},`+r;t.push(r)}return t}getOutOfBoundsCondition(e){if(this.rank===1)return`rc > ${this.enableShapeUniforms?"outShape":this.outputShape[0]}`;let t="";for(let s=this.rank-2;s<this.rank;s++)t+=`${e[s]} >= ${this.enableShapeUniforms?`outShape[${s}]`:this.outputShape[s]}`,s<this.rank-1&&(t+="||");return t}getSetup(e){if(this.rank===1)return"";const t=e.slice(-2),s=this.enableShapeUniforms?`outShape[${this.rank} - 1]`:this.outputShape[this.rank-1],o=this.enableShapeUniforms?`outShape[${this.rank} - 2]`:this.outputShape[this.rank-2];return`
      int r = ${t[0]};
      int c = ${t[1]};
      int rp1 = r + 1;
      int cp1 = c + 1;

      bool cEdge = cp1 >= ${s};
      bool rEdge = rp1 >= ${o};
    `}getOutput(e){const t=this.getSourceCoordsArr(e);return this.rank===1?`getA(rc), (rc + 1 >= ${this.enableShapeUniforms?"outShape":this.outputShape[0]} ? 0. : getA(rc + 1)), 0, 0`:`getA(${t[0]}),
            cEdge ? 0. : getA(${t[1]}),
            rEdge ? 0. : getA(${t[2]}),
            rEdge || cEdge ? 0. : getA(${t[3]})`}}class Z1{constructor(e,t){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:"inputShape",type:"ivec3"}],this.outputShape=e,this.enableShapeUniforms=At(this.outputShape.length);let s="";for(let o=0;o<4;o++){let r="thisRC = rc;";o%2===1&&(r+="thisRC.z += 1;"),o>1&&(r+="thisRC.y += 1;"),s+=`
        ${r}
        ${o>0?"if(thisRC.y < rows && thisRC.z < cols){":""}
          int flatIndex = getFlatIndex(thisRC);

          ivec3 inputRC = inputCoordsFromReshapedOutCoords(flatIndex);
          vec2 inputRCInnerDims = vec2(float(inputRC.y),float(inputRC.z));

          result[${o}] =
            getChannel(getA(inputRC.x, inputRC.y, inputRC.z), inputRCInnerDims);
        ${o>0?"}":""}
      `}this.userCode=`
      ${p3(t,this.enableShapeUniforms)}
      ${this.enableShapeUniforms?rp():op(e)}

      void main() {
        ivec3 rc = getOutputCoords();

        vec4 result = vec4(0.);

        ivec3 thisRC;
        int rows = ${this.enableShapeUniforms?"outShape[1]":e[1]};
        int cols = ${this.enableShapeUniforms?"outShape[2]":e[2]};

        ${s}

        setOutput(result);
      }
    `}}function p3(n,e){return`
    ivec3 inputCoordsFromReshapedOutCoords(int index) {
      ${e?hM(["r","c","d"],"inputShape"):fo(["r","c","d"],n)}
      return ivec3(r, c, d);
    }
  `}class f3{constructor(e){this.gpgpu=e,this.numUsedTextures=0,this.numFreeTextures=0,this._numBytesAllocated=0,this._numBytesFree=0,this.freeTextures={},this.usedTextures={},this.logEnabled=!1}acquireTexture(e,t,s){const o=J1(t,s),r=ey(e,o,s);r in this.freeTextures||(this.freeTextures[r]=[]),r in this.usedTextures||(this.usedTextures[r]=[]);const i=Q1(e,o,this.gpgpu.gl,this.gpgpu.textureConfig,s);if(this.freeTextures[r].length>0){this.numFreeTextures--,this.numUsedTextures++,this._numBytesFree-=i,this.log();const l=this.freeTextures[r].pop();return this.usedTextures[r].push(l),l}let a;return o===It.PACKED_2X2_FLOAT32?a=this.gpgpu.createPackedMatrixTexture(e[0],e[1]):o===It.PACKED_2X2_FLOAT16?a=this.gpgpu.createFloat16PackedMatrixTexture(e[0],e[1]):o===It.UNPACKED_FLOAT32?a=this.gpgpu.createFloat32MatrixTexture(e[0],e[1]):o===It.UNPACKED_FLOAT16?a=this.gpgpu.createFloat16MatrixTexture(e[0],e[1]):o===It.PACKED_4X1_UNSIGNED_BYTE&&(a=this.gpgpu.createUnsignedBytesMatrixTexture(e[0],e[1])),this.usedTextures[r].push(a),this.numUsedTextures++,this._numBytesAllocated+=i,this.log(),a}releaseTexture(e,t,s,o){if(this.freeTextures==null)return;const r=J1(s,o),i=ey(t,r,o);i in this.freeTextures||(this.freeTextures[i]=[]);const a=Q1(t,r,this.gpgpu.gl,this.gpgpu.textureConfig,o),l=V().getNumber("WEBGL_DELETE_TEXTURE_THRESHOLD");l!==-1&&this._numBytesAllocated>l?(this.gpgpu.deleteMatrixTexture(e.texture),this._numBytesAllocated-=a):(this.freeTextures[i].push(e),this.numFreeTextures++,this._numBytesFree+=a),this.numUsedTextures--;const c=this.usedTextures[i],u=c&&c.indexOf(e);if(u==null||u<0)throw new Error("Cannot release a texture that was never provided by this texture manager");c[u]=c[c.length-1],c.pop(),this.log()}log(){if(!this.logEnabled)return;const e=this.numFreeTextures+this.numUsedTextures;console.log("Free/Used",`${this.numFreeTextures} / ${this.numUsedTextures}`,`(${e})`);const t=this._numBytesFree/this._numBytesAllocated;console.log(`Bytes allocated: ${this._numBytesAllocated}`),console.log(`Bytes unused: ${this._numBytesFree} (${Math.round(100*t)}%)`)}get numBytesAllocated(){return this._numBytesAllocated}get numBytesFree(){return this._numBytesFree}getNumUsedTextures(){return this.numUsedTextures}getNumFreeTextures(){return this.numFreeTextures}dispose(){if(this.freeTextures!=null){for(const e in this.freeTextures)this.freeTextures[e].forEach(t=>{this.gpgpu.deleteMatrixTexture(t.texture)});for(const e in this.usedTextures)this.usedTextures[e].forEach(t=>{this.gpgpu.deleteMatrixTexture(t.texture)});this.freeTextures=null,this.usedTextures=null,this.numUsedTextures=0,this.numFreeTextures=0,this._numBytesAllocated=0,this._numBytesFree=0}}}function m3(n,e){const t=n;if(e===t.R32F)return 4;if(e===t.R16F)return 2;if(e===t.RGBA32F)return 16;if(e===n.RGBA)return 16;if(e===t.RGBA16F)return 8;if(e===t.RGBA8)return 4;throw new Error(`Unknown internal format ${e}`)}function Q1(n,e,t,s,o){const r=g3(e,s);let i;if(o){const[l,c]=Xo(n[0],n[1]);i=l*c}else{const[l,c]=Vi(n[0],n[1]);i=l*c}const a=m3(t,r);return i*a}function g3(n,e){switch(n){case It.PACKED_2X2_FLOAT32:return H1(e);case It.PACKED_2X2_FLOAT16:return q1(e);case It.UNPACKED_FLOAT32:return W1(e);case It.UNPACKED_FLOAT16:return U1(e);case It.PACKED_4X1_UNSIGNED_BYTE:return G1(e);default:throw new Error(`Unknown physical texture type ${n}`)}}function x3(n){return V().getBool("WEBGL_RENDER_FLOAT32_ENABLED")?n?It.PACKED_2X2_FLOAT32:It.UNPACKED_FLOAT32:n?It.PACKED_2X2_FLOAT16:It.UNPACKED_FLOAT16}function J1(n,e){if(n===en.UPLOAD)return It.PACKED_2X2_FLOAT32;if(n===en.RENDER||n==null)return x3(e);if(n===en.DOWNLOAD||n===en.PIXELS)return It.PACKED_4X1_UNSIGNED_BYTE;throw new Error(`Unknown logical texture type ${n}`)}function ey(n,e,t){return`${n[0]}_${n[1]}_${e}_${t}`}class jn{constructor(e,t){this.variableNames=["A"],this.outputShape=e,this.enableShapeUniforms=At(this.outputShape.length),this.userCode=`
      float unaryOperation(float x) {
        ${t}
      }

      void main() {
        float x = getAAtOutCoords();
        float y = unaryOperation(x);

        setOutput(y);
      }
    `}}const pn="if (isnan(x)) return x;",b3="return x;",ty="return abs(x);",y3="return (x >= 0.0) ? x : (exp(x) - 1.0);",w3=pn+`
  return (x < 0.0) ? 0.0 : x;
`,C3=pn+`
  return (x < 0.0) ? 0.0 : min(6.0, x);
`,Es="return x;",I3="return 1.0 / (1.0 + exp(-1.0 * x));";const $3="return x;",k3=`
  vec4 result;

  result.r = (x.r >= 0.0) ? x.r : (exp(x.r) - 1.0);
  result.g = (x.g >= 0.0) ? x.g : (exp(x.g) - 1.0);
  result.b = (x.b >= 0.0) ? x.b : (exp(x.b) - 1.0);
  result.a = (x.a >= 0.0) ? x.a : (exp(x.a) - 1.0);

  return result;
`,v3=`
  vec4 result = x * vec4(greaterThanEqual(x, vec4(0.0)));
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`,S3=`
  vec4 result = min(x, vec4(6.)) * vec4(greaterThanEqual(x, vec4(0.0)));
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`,N3="return 1.0 / (1.0 + exp(-1.0 * x));";class Rs{constructor(e,t){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=e,this.enableShapeUniforms=At(this.outputShape.length),this.userCode=`
      vec4 unaryOperation(vec4 x) {
        ${t}
      }

      void main() {
        vec4 x = getAAtOutCoords();
        vec4 y = unaryOperation(x);

        setOutput(y);
      }
    `}}class T3{constructor(e){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!1,this.outputShape=e,this.enableShapeUniforms=At(this.outputShape.length);const t=e.length,s=Lt("rc",t),o=Oe(t),r=h3(t,s),i=s.slice(-2),a=t<=1?"rc":`vec2(${i.join(",")})`;this.userCode=`
      void main() {
        ${o} rc = getOutputCoords();
        vec4 packedInput = getA(${r});

        setOutput(getChannel(packedInput, ${a}));
      }
    `}}const E3=$m,R3=1e-7,A3=1e-4,xc={};function D3(n){return n in xc||(xc[n]={}),xc[n]}const F3=V().getNumber("CPU_HANDOFF_SIZE_THRESHOLD"),_3=600;function O3(){return V().global.screen==null?1024:V().global.screen.height*V().global.screen.width*window.devicePixelRatio*_3/1024/1024}class bc extends Io{nextDataId(){return bc.nextDataId++}constructor(e){if(super(),this.pendingRead=new WeakMap,this.pendingDisposal=new WeakSet,this.dataRefCount=new WeakMap,this.numBytesInGPU=0,this.uploadWaitMs=0,this.downloadWaitMs=0,this.lastGlFlushTime=0,this.warnedAboutMemory=!1,this.pendingDeletes=0,this.disposed=!1,!V().getBool("HAS_WEBGL"))throw new Error("WebGL is not supported on this device");let t;if(e!=null){if(e instanceof ap)t=e;else{const s=Nn(V().getNumber("WEBGL_VERSION"),e);t=new ap(s)}this.binaryCache={},this.gpgpuCreatedLocally=!1}else{const s=Nn(V().getNumber("WEBGL_VERSION"));t=new ap(s),this.binaryCache=D3(V().getNumber("WEBGL_VERSION")),this.gpgpuCreatedLocally=!0}this.gpgpu=t,this.canvas=this.gpgpu.gl.canvas,this.textureManager=new f3(this.gpgpu),this.numMBBeforeWarning=O3(),this.texData=new Zi(this,Ye())}numDataIds(){return this.texData.numDataIds()-this.pendingDeletes}writeTexture(e,t,s,o,r,i){const a=this.makeTensorInfo(t,s),l=this.texData.get(a.dataId);l.isPacked=!1,l.texture={texture:e,texShape:[o,r]},l.texShape=[o,r];const c=pc(t),u=new V1(c,!1,i),h=this.runWebGLProgram(u,[a],s,[[o,r]]);return h.shape=t,l.texture=null,this.disposeIntermediateTensorInfo(a),h.dataId}write(e,t,s){if((V().getBool("WEBGL_CHECK_NUMERICAL_PROBLEMS")||V().getBool("DEBUG"))&&this.checkNumericalProblems(e),s==="complex64"&&e!=null)throw new Error("Cannot write to a complex64 dtype. Please use tf.complex(real, imag).");const o={id:this.nextDataId()};return this.texData.set(o,{shape:t,dtype:s,values:e,usage:en.UPLOAD,refCount:1}),o}refCount(e){return this.texData.has(e)?this.texData.get(e).refCount:0}incRef(e){const t=this.texData.get(e);t.refCount++}decRef(e){if(this.texData.has(e)){const t=this.texData.get(e);t.refCount--}}move(e,t,s,o,r){if(V().getBool("DEBUG")&&this.checkNumericalProblems(t),o==="complex64")throw new Error("Cannot write to a complex64 dtype. Please use tf.complex(real, imag).");this.texData.set(e,{shape:s,dtype:o,values:t,usage:en.UPLOAD,refCount:r})}disposeIntermediateTensorInfo(e){this.disposeData(e.dataId)}readSync(e){const t=this.texData.get(e),{values:s,dtype:o,complexTensorInfos:r,slice:i,shape:a,isPacked:l}=t;if(i!=null){let d;l?d=new Rs(a,Es):d=new jn(a,Es);const p=this.runWebGLProgram(d,[{dataId:e,shape:a,dtype:o}],o),f=this.readSync(p.dataId);return this.disposeIntermediateTensorInfo(p),f}if(s!=null)return this.convertAndCacheOnCPU(e);if(o==="string")return s;const c=this.activeTimers!=null;let u;c&&(u=Pt());let h;if(o==="complex64"){const d=this.readSync(r.real.dataId),p=this.readSync(r.imag.dataId);h=ts(d,p)}else h=this.getValuesFromTexture(e);return c&&(this.downloadWaitMs+=Pt()-u),this.convertAndCacheOnCPU(e,h)}read(e){return Y(this,null,function*(){if(this.pendingRead.has(e)){const f=this.pendingRead.get(e);return new Promise(m=>f.push(m))}const t=this.texData.get(e),{values:s,shape:o,slice:r,dtype:i,complexTensorInfos:a,isPacked:l}=t;if(r!=null){let f;l?f=new Rs(o,Es):f=new jn(o,Es);const m=this.runWebGLProgram(f,[{dataId:e,shape:o,dtype:i}],i),g=this.read(m.dataId);return this.disposeIntermediateTensorInfo(m),g}if(s!=null)return this.convertAndCacheOnCPU(e);if(V().getBool("DEBUG")&&!V().getBool("WEBGL_DOWNLOAD_FLOAT_ENABLED")&&V().getNumber("WEBGL_VERSION")===2)throw new Error("tensor.data() with WEBGL_DOWNLOAD_FLOAT_ENABLED=false and WEBGL_VERSION=2 not yet supported.");let c=null,u;if(i!=="complex64"&&V().get("WEBGL_BUFFER_SUPPORTED")){u=this.decode(e);const f=this.texData.get(u.dataId);c=this.gpgpu.createBufferFromTexture(f.texture.texture,...uc(o))}this.pendingRead.set(e,[]),i!=="complex64"&&(yield this.gpgpu.createAndWaitForFence());let h;if(i==="complex64"){const f=yield Promise.all([this.read(a.real.dataId),this.read(a.imag.dataId)]),m=f[0],g=f[1];h=ts(m,g)}else if(c==null)h=this.getValuesFromTexture(e);else{const f=q(o);h=this.gpgpu.downloadFloat32MatrixFromBuffer(c,f)}if(u!=null&&this.disposeIntermediateTensorInfo(u),c!=null){const f=this.gpgpu.gl;re(f,()=>f.deleteBuffer(c))}const d=this.convertAndCacheOnCPU(e,h),p=this.pendingRead.get(e);return this.pendingRead.delete(e),p.forEach(f=>f(d)),this.pendingDisposal.has(e)&&(this.pendingDisposal.delete(e),this.disposeData(e)&&Ye().removeDataId(e,this),this.pendingDeletes--),d})}readToGPU(e,t={}){const s=this.texData.get(e),{values:o,shape:r,slice:i,dtype:a,isPacked:l,texture:c}=s;if(a==="complex64")throw new Error("Does not support reading texture for complex64 dtype.");if(i!=null){let p;l?p=new Rs(r,Es):p=new jn(r,Es);const f=this.runWebGLProgram(p,[{dataId:e,shape:r,dtype:a}],a),m=this.readToGPU(f,t);return this.disposeIntermediateTensorInfo(f),m}if(c==null)throw o!=null?new Error("Data is not on GPU but on CPU."):new Error("There is no data on GPU or CPU.");const u=this.decode(e,t.customTexShape),h=Ye().makeTensorFromTensorInfo(u),d=this.texData.get(u.dataId);return Object.assign({tensorRef:h},d.texture)}bufferSync(e){const t=this.readSync(e.dataId);if(e.dtype==="string")try{const s=t.map(o=>hs(o));return Ie(e.shape,e.dtype,s)}catch(s){throw new Error("Failed to decode encoded string bytes into utf-8")}return Ie(e.shape,e.dtype,t)}checkNumericalProblems(e){if(e!=null)for(let t=0;t<e.length;t++){const s=e[t];if(!PL(s))throw V().getBool("WEBGL_RENDER_FLOAT32_CAPABLE")?Error(`The value ${s} cannot be represented with your current settings. Consider enabling float32 rendering: 'tf.env().set('WEBGL_RENDER_FLOAT32_ENABLED', true);'`):Error(`The value ${s} cannot be represented on this device.`)}}getValuesFromTexture(e){const{shape:t,dtype:s,isPacked:o}=this.texData.get(e),r=q(t);if(V().getBool("WEBGL_DOWNLOAD_FLOAT_ENABLED")){const d=this.decode(e),p=this.texData.get(d.dataId),f=this.gpgpu.downloadMatrixFromPackedTexture(p.texture.texture,...uc(t)).subarray(0,r);return this.disposeIntermediateTensorInfo(d),f}const i=V().getBool("WEBGL_PACK")&&o===!0,a=i?pc(t):t,l=i?new eP(a):new JM(a),c=this.runWebGLProgram(l,[{shape:a,dtype:s,dataId:e}],"float32"),u=this.texData.get(c.dataId),h=this.gpgpu.downloadByteEncodedFloatMatrixFromOutputTexture(u.texture.texture,u.texShape[0],u.texShape[1]).subarray(0,r);return this.disposeIntermediateTensorInfo(c),h}timerAvailable(){return V().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE")>0}time(e){const t=this.activeTimers,s=[];let o=!1;this.programTimersStack==null?(this.programTimersStack=s,o=!0):this.activeTimers.push(s),this.activeTimers=s,e();const r=Bs(this.activeTimers.map(l=>l.query)).filter(l=>l!=null),i=Bs(this.activeTimers.map(l=>l.name)).filter(l=>l!=null);this.activeTimers=t,o&&(this.programTimersStack=null);const a={uploadWaitMs:this.uploadWaitMs,downloadWaitMs:this.downloadWaitMs,kernelMs:null,wallMs:null};return Y(this,null,function*(){if(V().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE")>0){const l=yield Promise.all(r);a.kernelMs=sw(l),a.getExtraProfileInfo=()=>l.map((c,u)=>({name:i[u],ms:c})).map(c=>`${c.name}: ${c.ms}`).join(", ")}else a.kernelMs={error:"WebGL query timers are not supported in this environment."};return this.uploadWaitMs=0,this.downloadWaitMs=0,a})}memory(){return{unreliable:!1,numBytesInGPU:this.numBytesInGPU,numBytesInGPUAllocated:this.textureManager.numBytesAllocated,numBytesInGPUFree:this.textureManager.numBytesFree}}startTimer(){return V().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE")>0?this.gpgpu.beginQuery():{startMs:Pt(),endMs:null}}endTimer(e){return V().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE")>0?(this.gpgpu.endQuery(),e):(e.endMs=Pt(),e)}getQueryTime(e){return Y(this,null,function*(){if(V().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE")>0)return this.gpgpu.waitForQueryAndGetTime(e);const t=e;return t.endMs-t.startMs})}disposeData(e,t=!1){if(this.pendingDisposal.has(e))return!1;if(!this.texData.has(e))return!0;if(t?this.texData.get(e).refCount=0:this.texData.get(e).refCount--,!t&&this.texData.get(e).refCount>0)return!1;if(this.pendingRead.has(e))return this.pendingDisposal.add(e),this.pendingDeletes++,!1;this.releaseGPUData(e);const{complexTensorInfos:s}=this.texData.get(e);return s!=null&&(this.disposeData(s.real.dataId,t),this.disposeData(s.imag.dataId,t)),this.texData.delete(e),!0}releaseGPUData(e){const{texture:t,dtype:s,texShape:o,usage:r,isPacked:i,slice:a}=this.texData.get(e),l=a&&a.origDataId||e,c=this.dataRefCount.get(l);c>1?this.dataRefCount.set(l,c-1):(this.dataRefCount.delete(l),t!=null&&(this.numBytesInGPU-=this.computeBytes(o,s),this.textureManager.releaseTexture(t,o,r,i)));const u=this.texData.get(e);u.texture=null,u.texShape=null,u.isPacked=!1,u.slice=null}getTexture(e){return this.uploadToGPU(e),this.texData.get(e).texture.texture}getDataInfo(e){return this.texData.get(e)}shouldExecuteOnCPU(e,t=F3){return V().getBool("WEBGL_CPU_FORWARD")&&e.every(s=>this.texData.get(s.dataId).texture==null&&q(s.shape)<t)}getGPGPUContext(){return this.gpgpu}where(e){Yt("tf.where() in webgl locks the UI thread. Call tf.whereAsync() instead");const t=e.dataSync();return E3(e.shape,t)}packedUnaryOp(e,t,s){const o=new Rs(e.shape,t),r=this.compileAndRun(o,[e],s);return Ye().makeTensorFromTensorInfo(r)}abs(e){if(this.shouldExecuteOnCPU([e])&&e.dtype!=="complex64"){const o=K1(this.texData.get(e.dataId).values);return this.makeOutput(e.shape,e.dtype,o)}if(V().getBool("WEBGL_PACK_UNARY_OPERATIONS"))return this.packedUnaryOp(e,ty,e.dtype);const t=new jn(e.shape,ty),s=this.compileAndRun(t,[e]);return Ye().makeTensorFromTensorInfo(s)}makeTensorInfo(e,t,s){let o;if(t==="string"&&s!=null&&s.length>0&&ir(s[0])){const r=s.map(i=>us(i));o=this.write(r,e,t)}else o=this.write(s,e,t);return this.texData.get(o).usage=null,{dataId:o,shape:e,dtype:t}}makeOutput(e,t,s){return Ye().makeTensorFromTensorInfo(this.makeTensorInfo(e,t,s),this)}unpackTensor(e){const t=new T3(e.shape);return this.runWebGLProgram(t,[e],e.dtype)}packTensor(e){const t=new d3(e.shape);return this.runWebGLProgram(t,[e],e.dtype,null,!0)}packedReshape(e,t){const s=[Yo(e.shape),...Zo(e.shape)],o={dtype:e.dtype,shape:s,dataId:e.dataId},r=[Yo(t),...Zo(t)],i=new Z1(r,s),a=!0,l=[s],c=this.runWebGLProgram(i,[o],e.dtype,l,a);return{dataId:c.dataId,shape:t,dtype:c.dtype}}decode(e,t){const s=this.texData.get(e),{isPacked:o,shape:r,dtype:i}=s;if(t!=null){const d=q(r),p=t[0]*t[1]*4;k(d<=p,()=>"customTexShape is too small. Row * Column * 4 should be equal or larger than the size of the tensor data.")}const a=pc(r);let l;o?l=new QM(a):l=new ZM(a);const c=!0,u=[t!=null?t:uc(a)],h=this.runWebGLProgram(l,[{shape:a,dtype:i,dataId:e}],i,u,c,t);return{dtype:i,shape:r,dataId:h.dataId}}runWebGLProgram(e,t,s,o,r=!1,i){const a=this.makeTensorInfo(e.outputShape,s),l=this.texData.get(a.dataId);if(e.packedOutput&&(l.isPacked=!0),e.outPackingScheme===zi.DENSE){const x=i!=null?i:uc(e.outputShape);l.texShape=x.map(b=>b*2)}if(e.outTexUsage!=null&&(l.usage=e.outTexUsage),q(a.shape)===0)return l.values=vt(a.dtype,0),a;const c=[],u=t.map(x=>{if(x.dtype==="complex64")throw new Error("GPGPUProgram does not support complex64 input. For complex64 dtypes, please separate the program into real and imaginary parts.");let b=this.texData.get(x.dataId);if(b.texture==null){if(!e.packedInputs&&q(x.shape)<=V().getNumber("WEBGL_SIZE_UPLOAD_UNIFORM"))return{shape:x.shape,texData:null,isUniform:!0,uniformValues:b.values};e.packedInputs&&(b.isPacked=!0,b.shape=x.shape)}if(this.uploadToGPU(x.dataId),!!b.isPacked!=!!e.packedInputs)x=b.isPacked?this.unpackTensor(x):this.packTensor(x),c.push(x),b=this.texData.get(x.dataId);else if(b.isPacked&&!mc(b.shape,x.shape)){const w=x,y=x.shape;x.shape=b.shape,x=this.packedReshape(x,y),c.push(x),b=this.texData.get(x.dataId),w.shape=y}return{shape:x.shape,texData:b,isUniform:!1}});this.uploadToGPU(a.dataId);const h={shape:a.shape,texData:l,isUniform:!1},d=YM(e,u,h),p=this.getAndSaveBinary(d,()=>KM(this.gpgpu,e,u,h)),f=this.activeTimers!=null;let m;f&&(m=this.startTimer()),V().get("ENGINE_COMPILE_ONLY")||XM(this.gpgpu,p,u,h,o),c.forEach(x=>this.disposeIntermediateTensorInfo(x)),f&&(m=this.endTimer(m),this.activeTimers.push({name:e.constructor.name,query:this.getQueryTime(m)}));const g=V().getNumber("WEBGL_FLUSH_THRESHOLD");if(g>0){const x=Pt();x-this.lastGlFlushTime>g&&(this.gpgpu.gl.flush(),this.lastGlFlushTime=x)}if(!V().getBool("WEBGL_LAZILY_UNPACK")&&l.isPacked&&r===!1){const x=this.unpackTensor(a);return this.disposeIntermediateTensorInfo(a),x}return a}compileAndRun(e,t,s,o,r=!1){return s=s||t[0].dtype,this.runWebGLProgram(e,t,s,o,r)}getAndSaveBinary(e,t){return e in this.binaryCache||(this.binaryCache[e]=t()),this.binaryCache[e]}getTextureManager(){return this.textureManager}dispose(){this.disposed||(V().getBool("IS_TEST")||Object.keys(this.binaryCache).forEach(t=>{this.gpgpu.deleteProgram(this.binaryCache[t].webGLProgram),delete this.binaryCache[t]}),this.textureManager.dispose(),this.canvas!=null&&typeof HTMLCanvasElement!="undefined"&&this.canvas instanceof HTMLCanvasElement?this.canvas.remove():this.canvas=null,this.gpgpuCreatedLocally&&(this.gpgpu.program=null,this.gpgpu.dispose()),this.disposed=!0)}floatPrecision(){return this.floatPrecisionValue==null&&(this.floatPrecisionValue=B(()=>{if(!V().get("WEBGL_RENDER_FLOAT32_ENABLED")){const e=V().getBool("DEBUG");V().set("DEBUG",!1);const t=this.abs(Re(1e-8)).dataSync()[0];if(V().set("DEBUG",e),t>0)return 32}return 16})),this.floatPrecisionValue}epsilon(){return this.floatPrecision()===32?R3:A3}uploadToGPU(e){const t=this.texData.get(e),{shape:s,dtype:o,values:r,texture:i,usage:a,isPacked:l}=t;if(i!=null)return;const c=this.activeTimers!=null;let u;c&&(u=Pt());let h=t.texShape;if(h==null&&(h=nM(s,l),t.texShape=h),r!=null){const d=pc(s);let p,f=h[1],m=h[0];const g=r instanceof Uint8Array||r instanceof Uint8ClampedArray;(l||!g)&&([f,m]=Xo(h[0],h[1])),l?p=new nP(d,g):p=new V1(d,g);const x=g?[m,f]:h,b=this.makeTensorInfo(x,o),w=this.texData.get(b.dataId);g?w.usage=en.PIXELS:w.usage=en.UPLOAD,w.texShape=x,this.gpgpu.uploadDenseMatrixToTexture(this.getTexture(b.dataId),f,m,r);const y=[[m,f]],$=this.runWebGLProgram(p,[b],o,y,!0),N=this.texData.get($.dataId);t.texShape=N.texShape,t.isPacked=N.isPacked,t.usage=N.usage,V().get("ENGINE_COMPILE_ONLY")?this.disposeData($.dataId):(t.texture=N.texture,t.values=null,this.texData.delete($.dataId)),this.disposeIntermediateTensorInfo(b),c&&(this.uploadWaitMs+=Pt()-u)}else{const d=this.acquireTexture(h,a,o,l);t.texture=d}}convertAndCacheOnCPU(e,t){const s=this.texData.get(e),{dtype:o}=s;return t!=null&&(s.values=L3(t,o)),s.values}acquireTexture(e,t,s,o){if(this.numBytesInGPU+=this.computeBytes(e,s),!this.warnedAboutMemory&&this.numBytesInGPU>this.numMBBeforeWarning*1024*1024){const r=(this.numBytesInGPU/1024/1024).toFixed(2);this.warnedAboutMemory=!0,console.warn(`High memory usage in GPU: ${r} MB, most likely due to a memory leak`)}return this.textureManager.acquireTexture(e,t,o)}computeBytes(e,t){return e[0]*e[1]*Qi(t)}checkCompileCompletion(){for(const[,e]of Object.entries(this.binaryCache))this.checkCompletion_(e)}checkCompileCompletionAsync(){return Y(this,null,function*(){const e=[];if(this.gpgpu.parallelCompilationExtension){for(const[,t]of Object.entries(this.binaryCache))e.push(this.checkCompletionAsync_(t));return Promise.all(e)}else{for(const[,t]of Object.entries(this.binaryCache)){const s=new Promise(o=>{try{this.checkCompletion_(t),o(!0)}catch(r){throw r}});e.push(s)}return Promise.all(e)}})}checkCompletionAsync_(e){return Y(this,null,function*(){return this.gpgpu.gl.getProgramParameter(e.webGLProgram,this.gpgpu.parallelCompilationExtension.COMPLETION_STATUS_KHR)?this.checkCompletion_(e):(yield Km(),this.checkCompletionAsync_(e))})}checkCompletion_(e){if(this.gpgpu.gl.getProgramParameter(e.webGLProgram,this.gpgpu.gl.LINK_STATUS)===!1)throw console.log(this.gpgpu.gl.getProgramInfoLog(e.webGLProgram)),this.gpgpu.gl.getShaderParameter(e.fragmentShader,this.gpgpu.gl.COMPILE_STATUS)===!1?(A1(e.source,this.gpgpu.gl.getShaderInfoLog(e.fragmentShader)),new Error("Failed to compile fragment shader.")):new Error("Failed to link vertex and fragment shaders.");return!0}getUniformLocations(){for(const e of Object.values(this.binaryCache)){this.gpgpu.buildVao(e.webGLProgram);const{variablesLocations:t,customUniformLocations:s,infLoc:o,nanLoc:r,outShapeLocation:i,outShapeStridesLocation:a,outTexShapeLocation:l}=B1(this.gpgpu,e.program,e.webGLProgram);e.variablesLocations=t,e.customUniformLocations=s,e.infLoc=o,e.nanLoc=r,e.outShapeLocation=i,e.outShapeStridesLocation=a,e.outTexShapeLocation=l}}createTensorFromGPUData(e,t,s){e.channels=e.channels||"RGBA";const{texture:o,height:r,width:i,channels:a}=e,l=Ye().backend;if(!l.gpgpu.gl.isTexture(o))throw new Error("The texture is invalid. Also, please make sure the texture and the TFJS WebGL backend are using the same canvas. If you want to use your own custom canvas, you have to create and use the custom TFJS WebGL backend created from the canvas through 'new tf.MathBackendWebGL(customCanvas)'.");const c=l.writeTexture(o,t,s,r,i,a);return Ye().makeTensorFromDataId(c,t,s,l)}}bc.nextDataId=0;function L3(n,e){if(e==="float32"||e==="complex64")return n;if(e==="int32"||e==="bool"){const t=e==="int32"?new Int32Array(n.length):new Uint8Array(n.length);for(let s=0;s<t.length;++s)t[s]=Math.round(n[s]);return t}else throw new Error(`Unknown dtype ${e}`)}$f()&&Tf("webgl",()=>new bc,2);const cp=`
  if (isnan(a)) return a;
  if (isnan(b)) return b;
`;class go{constructor(e,t,s){this.variableNames=["A","B"],this.outputShape=xe(t,s),this.enableShapeUniforms=At(this.outputShape.length),this.userCode=`
      float binaryOperation(float a, float b) {
        ${e}
      }

      void main() {
        float a = getAAtOutCoords();
        float b = getBAtOutCoords();
        setOutput(binaryOperation(a, b));
      }
    `}}const xo=`
  result.r = isNaN.r ? NAN : result.r;
  result.g = isNaN.g ? NAN : result.g;
  result.b = isNaN.b ? NAN : result.b;
  result.a = isNaN.a ? NAN : result.a;
`;class nr{constructor(e,t,s,o=!1){this.variableNames=["A","B"],this.supportsBroadcasting=!0,this.packedInputs=!0,this.packedOutput=!0,this.outputShape=xe(t,s);const r=this.outputShape.length;this.enableShapeUniforms=At(r);let i="";if(o)if(r===0||q(this.outputShape)===1)i=`
          result.y = 0.;
          result.z = 0.;
          result.w = 0.;
        `;else if(i=`
          ${Oe(r)} coords = getOutputCoords();
        `,r===1)this.enableShapeUniforms?i+=`
            result.y = (coords + 1) >= outShape ? 0. : result.y;
            result.z = 0.;
            result.w = 0.;
          `:i+=`
            result.y = (coords + 1) >= ${this.outputShape[0]} ? 0. : result.y;
            result.z = 0.;
            result.w = 0.;
          `;else{const l=Lt("coords",r);this.enableShapeUniforms?i+=`
            bool nextRowOutOfBounds =
              (${l[r-2]} + 1) >= outShape[${r} - 2];
            bool nextColOutOfBounds =
              (${l[r-1]} + 1) >= outShape[${r} - 1];
            result.y = nextColOutOfBounds ? 0. : result.y;
            result.z = nextRowOutOfBounds ? 0. : result.z;
            result.w = nextColOutOfBounds || nextRowOutOfBounds ? 0. : result.w;
          `:i+=`
            bool nextRowOutOfBounds =
              (${l[r-2]} + 1) >= ${this.outputShape[r-2]};
            bool nextColOutOfBounds =
              (${l[r-1]} + 1) >= ${this.outputShape[r-1]};
            result.y = nextColOutOfBounds ? 0. : result.y;
            result.z = nextRowOutOfBounds ? 0. : result.z;
            result.w = nextColOutOfBounds || nextRowOutOfBounds ? 0. : result.w;
          `}this.userCode=`
      vec4 binaryOperation(vec4 a, vec4 b) {
        ${e}
      }

      void main() {
        vec4 a = getAAtOutCoords();
        vec4 b = getBAtOutCoords();

        vec4 result = binaryOperation(a, b);
        ${i}

        setOutput(result);
      }
    `}}function Xt(n){const{inputs:e,backend:t}=n,{x:s}=e;return t.incRef(s.dataId),{dataId:s.dataId,shape:s.shape,dtype:s.dtype}}const M3={kernelName:Nr,backendName:"webgl",kernelFunc:Xt};function As(n){const{inputs:e,backend:t}=n,{real:s,imag:o}=e,r=t.makeTensorInfo(s.shape,"complex64"),i=t.texData.get(r.dataId),a=Xt({inputs:{x:s},backend:t}),l=Xt({inputs:{x:o},backend:t});return i.complexTensorInfos={real:a,imag:l},r}const P3={kernelName:Yc,backendName:"webgl",kernelFunc:As};const ny="return (a < 0.) ? b * a : a;",sy=`
  vec4 aLessThanZero = vec4(lessThan(a, vec4(0.)));
  return (aLessThanZero * (b * a)) + ((vec4(1.0) - aLessThanZero) * a);
`;function B3(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{alpha:r}=s,i=t.makeTensorInfo([],"float32",cs(r,"float32")),a=V().getBool("WEBGL_PACK_BINARY_OPERATIONS")?new nr(sy,o.shape,i.shape):new go(ny,o.shape,i.shape),l=t.runWebGLProgram(a,[o,i],"float32");return t.disposeIntermediateTensorInfo(i),l}const z3={kernelName:ya,backendName:"webgl",kernelFunc:B3};const oy="return (a < 0.) ? b * a : a;",ry=`
  vec4 aLessThanZero = vec4(lessThan(a, vec4(0.)));
  return (aLessThanZero * (b * a)) + ((vec4(1.0) - aLessThanZero) * a);
`;function V3(n){const{inputs:e,backend:t}=n,{x:s,alpha:o}=e,r=V().getBool("WEBGL_PACK_BINARY_OPERATIONS")?new nr(ry,s.shape,o.shape):new go(oy,s.shape,o.shape);return t.runWebGLProgram(r,[s,o],"float32")}const W3={kernelName:Pa,backendName:"webgl",kernelFunc:V3};const sr="if (isnan(x)) return x;";function Se({opSnippet:n,packedOpSnippet:e,cpuKernelImpl:t,dtype:s}){return({inputs:o,backend:r})=>{const{x:i}=o,a=r,l=s||i.dtype;if(a.shouldExecuteOnCPU([i])&&t!=null){const h=a.texData.get(i.dataId),d=t(h.values,l);return a.makeTensorInfo(i.shape,l,d)}const c=V().getBool("WEBGL_PACK_UNARY_OPERATIONS")&&e!=null;let u;return c?u=new Rs(i.shape,e):u=new jn(i.shape,n),a.runWebGLProgram(u,[i],l)}}function $t({opSnippet:n,packedOpSnippet:e,checkOutOfBounds:t=!1,supportsComplex:s=!1,cpuKernelImpl:o,dtype:r}){return({inputs:i,backend:a})=>{const{a:l,b:c}=i,u=a;if(s&&l.dtype==="complex64"){const f=u.texData.get(l.dataId),m=u.texData.get(c.dataId),[g,x]=[[f.complexTensorInfos.real,m.complexTensorInfos.real],[f.complexTensorInfos.imag,m.complexTensorInfos.imag]].map(w=>{const[y,C]=w,$={dataId:y.dataId,dtype:y.dtype,shape:l.shape},N={dataId:C.dataId,dtype:C.dtype,shape:c.shape},T=new go(n,l.shape,c.shape);return u.runWebGLProgram(T,[$,N],Gt(y.dtype,C.dtype))}),b=As({inputs:{real:g,imag:x},backend:u});return u.disposeIntermediateTensorInfo(g),u.disposeIntermediateTensorInfo(x),b}const h=r||Gt(l.dtype,c.dtype);if((l.dtype==="string"||c.dtype==="string"||u.shouldExecuteOnCPU([l,c]))&&o!=null){const f=u.texData.get(l.dataId).values,m=u.texData.get(c.dataId).values,g=l.dtype==="string"?ns(f):f,x=l.dtype==="string"?ns(m):m,[b,w]=o(l.shape,c.shape,g,x,h),y=u.makeTensorInfo(w,h),C=u.texData.get(y.dataId);return C.values=b,y}const d=V().getBool("WEBGL_PACK_BINARY_OPERATIONS")&&e!=null;let p;return d?p=new nr(e,l.shape,c.shape,t):p=new go(n,l.shape,c.shape),u.runWebGLProgram(p,[l,c],h)}}function Gi(n,e=!1){if(n==="linear")return e?$3:b3;if(n==="relu")return e?v3:w3;if(n==="elu")return e?k3:y3;if(n==="relu6")return e?S3:C3;if(n==="prelu")return e?ry:oy;if(n==="leakyrelu")return e?sy:ny;if(n==="sigmoid")return e?N3:I3;throw new Error(`Activation ${n} has not been implemented for the WebGL backend.`)}class iy{constructor(e,t,s,o=!1,r=!1,i=!1,a=null,l=!1,c=!1){this.variableNames=["matrixA","matrixB"],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=s,this.enableShapeUniforms=At(this.outputShape.length);const u=o?e[1]:e[2],h=Math.ceil(u/2),d=o?"i * 2, rc.y":"rc.y, i * 2",p=r?"rc.z, i * 2":"i * 2, rc.z",f=o?["a.xxyy","a.zzww"]:["a.xxzz","a.yyww"],m=r?["b.xzxz","b.ywyw"]:["b.xyxy","b.zwzw"];let g="",x="";a&&(l?g=`vec4 activation(vec4 a) {
          vec4 b = getPreluActivationWeightsAtOutCoords();
          ${a}
        }`:c?g=`vec4 activation(vec4 a) {
          vec4 b = getLeakyreluAlphaAtOutCoords();
          ${a}
        }`:g=`vec4 activation(vec4 x) {
          ${a}
        }`,x="result = activation(result);");const b=i?"result += getBiasAtOutCoords();":"";i&&this.variableNames.push("bias"),l&&this.variableNames.push("preluActivationWeights"),c&&this.variableNames.push("leakyreluAlpha");let w="rc.x",y="rc.x";e[0]<t[0]?w=`imod(rc.x, ${e[0]})`:t[0]<e[0]&&(y=`imod(rc.x, ${t[0]})`),this.userCode=`
      ${g}
      // Don't use uniform for sharedDimensionPacked for performance.
      const float sharedDimension = ${h}.0;

      vec4 dot2x2ARowBCol(ivec3 rc) {
        vec4 result = vec4(0);
        int batchA = ${w};
        int batchB = ${y};
        for (int i = 0; i < ${h}; i++) {
          vec4 a = getMatrixA(batchA, ${d});
          vec4 b = getMatrixB(batchB, ${p});

          // These swizzled products need to be separately added.
          // See: https://github.com/tensorflow/tfjs/issues/1735
          result += (${f[0]} * ${m[0]});
          result += (${f[1]} * ${m[1]});
        }
        return result;
      }

      void main() {
        ivec3 rc = getOutputCoords();
        vec4 result = dot2x2ARowBCol(rc);

        ${b}

        ${x}

        setOutput(result);
      }
    `}}const ay={REAL:"return areal * breal - aimag * bimag;",IMAG:"return areal * bimag + aimag * breal;"};class ly{constructor(e,t,s){this.variableNames=["AReal","AImag","BReal","BImag"],this.outputShape=xe(t,s),this.userCode=`
      float binaryOpComplex(
          float areal, float aimag, float breal, float bimag) {
        ${e}
      }

      void main() {
        float areal = getARealAtOutCoords();
        float aimag = getAImagAtOutCoords();
        float breal = getBRealAtOutCoords();
        float bimag = getBImagAtOutCoords();
        setOutput(binaryOpComplex(areal, aimag, breal, bimag));
      }
    `}}const cy="return a * b;";function up(n){const{inputs:e,backend:t}=n,{a:s,b:o}=e,r=Gt(s.dtype,o.dtype);if(s.dtype==="complex64"){const a=t.texData.get(s.dataId),l=t.texData.get(o.dataId),c=new ly(ay.REAL,s.shape,o.shape),u=new ly(ay.IMAG,s.shape,o.shape),h=[{dataId:a.complexTensorInfos.real.dataId,dtype:a.complexTensorInfos.real.dtype,shape:s.shape},{dataId:a.complexTensorInfos.imag.dataId,dtype:a.complexTensorInfos.imag.dtype,shape:s.shape},{dataId:l.complexTensorInfos.real.dataId,dtype:l.complexTensorInfos.real.dtype,shape:o.shape},{dataId:l.complexTensorInfos.imag.dataId,dtype:l.complexTensorInfos.imag.dtype,shape:o.shape}],d=t.runWebGLProgram(c,h,"float32"),p=t.runWebGLProgram(u,h,"float32"),f=As({inputs:{real:d,imag:p},backend:t});return t.disposeIntermediateTensorInfo(d),t.disposeIntermediateTensorInfo(p),f}if(t.shouldExecuteOnCPU([s,o])){const a=t.texData.get(s.dataId),l=t.texData.get(o.dataId),[c,u]=VP(s.shape,o.shape,a.values,l.values,r),h=t.makeTensorInfo(u,r),d=t.texData.get(h.dataId);return d.values=c,h}let i;return V().getBool("WEBGL_PACK_BINARY_OPERATIONS")?i=new nr(cy,s.shape,o.shape):i=new go(cy,s.shape,o.shape),t.runWebGLProgram(i,[s,o],r)}const U3={kernelName:Lr,backendName:"webgl",kernelFunc:up};function G3(n,e,t){const s=[Yo(n.shape),...Zo(n.shape)],o={dtype:n.dtype,shape:s,dataId:n.dataId},r=[Yo(e),...Zo(e)],i=new Z1(r,s),a=!0,l=[s],c=t.runWebGLProgram(i,[o],n.dtype,l,a);return{dataId:c.dataId,shape:e,dtype:c.dtype}}function ne(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{shape:r}=s,i=t,a=q(o.shape),l=Sp(r,a),c=q(l);k(a===c,()=>`The new shape (${l}) has ${c} elements and the old shape (${o.shape}) has ${a} elements. The new shape and old shape must have the same number of elements.`);const u=i.texData.get(o.dataId);return u.isPacked&&!mc(o.shape,l)&&!(u.texture!==null&&mc(u.shape,l))?G3(o,l,i):(i.incRef(o.dataId),{dataId:o.dataId,shape:l,dtype:o.dtype})}const H3={kernelName:za,backendName:"webgl",kernelFunc:ne};class uy{constructor(e,t){this.variableNames=["x"];const{windowSize:s,batchSize:o,inSize:r,outSize:i}=e;this.outputShape=[o,i];const a=Math.floor(s/4)*4,l=s%4;let c="sumValue += dot(values, ones);";if(t!=null){const h=1/t;c=`sumValue += dot(values * ${$o(h)?h.toPrecision(2):h}, ones);`}let u="";r%s>0&&(u=`
        if (inIdx < 0 || inIdx >= ${r}) {
          return 0.0;
        }
      `),this.userCode=`
      const vec4 ones = vec4(1.0, 1.0, 1.0, 1.0);

      float getValue(int batch, int inIdx) {
        ${u}
        return getX(batch, inIdx);
      }

      void main() {
        ivec2 coords = getOutputCoords();
        int batch = coords[0];
        int outIdx = coords[1];
        int inOffset = outIdx * ${s};

        float sumValue = 0.0;

        for (int i = 0; i < ${a}; i += 4) {
          int inIdx = inOffset + i;
          vec4 values = vec4(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            getValue(batch, inIdx + 2),
            getValue(batch, inIdx + 3)
          );

          ${c}
        }

        int inIdx = inOffset + ${a};
        if (${l===1}) {
          vec4 values = vec4(getValue(batch, inIdx), 0.0, 0.0, 0.0);

          ${c}
        } else if (${l===2}) {
          vec4 values = vec4(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1), 0.0, 0.0);

          ${c}
        } else if (${l===3}) {
          vec4 values = vec4(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            getValue(batch, inIdx + 2), 0.0);

          ${c}
        }
        setOutput(sumValue);
      }
    `}}class q3{constructor(e,t){this.variableNames=["x"];const{windowSize:s,batchSize:o,inSize:r,outSize:i}=e;this.outputShape=[o,i];let a="0.0",l="";t==="prod"?a="1.0":t==="min"?(a="1.0 / 1e-20",l="min"):t==="max"&&(a="-1.0 / 1e-20",l="max");let c=`${t}(${t}(${t}(minMaxValue[0], minMaxValue[1]), minMaxValue[2]), minMaxValue[3])`;t==="sum"?c="sumValue":t==="prod"?c="prodValue":t==="all"?c="allValue":t==="any"&&(c="anyValue");const u=Math.floor(s/4)*4,h=s%4;let d=`
      if (${t==="sum"}) {
        sumValue += dot(values, ones);
      } else if (${t==="prod"}) {
        vec2 tmp = vec2(values[0], values[1]) * vec2(values[2], values[3]);
        prodValue *= tmp[0] * tmp[1];
      } else {
        minMaxValue = ${l}(values, minMaxValue);
        if (${t==="min"} || ${t==="max"}) {
          minMaxValue = ${l}(values, minMaxValue);
          bvec4 isNaN = isnan(values);
          if (isNaN.r || isNaN.g || isNaN.b || isNaN.a) {
            minMaxValue = vec4(NAN);
          }
        }
      }
    `,p="vec4";t==="all"?(a="1.0",d=`
        bool reducedAllValue = all(values);
        float floatedReducedAllValue = float(reducedAllValue);
        allValue = float(allValue >= 1.0 && floatedReducedAllValue >= 1.0);
      `,p="bvec4"):t==="any"&&(a="0.0",d=`
        bool reducedAnyValue = any(values);
        float floatedReducedAnyValue = float(reducedAnyValue);
        anyValue = float(anyValue >= 1.0 || floatedReducedAnyValue >= 1.0);
      `,p="bvec4");let f="";r%s>0&&(f=`
        if (inIdx < 0 || inIdx >= ${r}) {
          return initializationValue;
        }
      `),this.userCode=`
      const float initializationValue = ${a};
      const vec4 ones = vec4(1.0, 1.0, 1.0, 1.0);

      float getValue(int batch, int inIdx) {
        ${f}
        return getX(batch, inIdx);
      }

      void main() {
        ivec2 coords = getOutputCoords();
        int batch = coords[0];
        int outIdx = coords[1];
        int inOffset = outIdx * ${s};

        vec4 minMaxValue = vec4(${a});
        float prodValue = 1.0;
        float sumValue = 0.0;
        float allValue = 1.0;
        float anyValue = 0.0;

        for (int i = 0; i < ${u}; i += 4) {
          int inIdx = inOffset + i;
          ${p} values = ${p}(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            getValue(batch, inIdx + 2),
            getValue(batch, inIdx + 3)
          );

          ${d}
        }

        int inIdx = inOffset + ${u};
        if (${h===1}) {
          ${p} values = ${p}(
            getValue(batch, inIdx),
            initializationValue,
            initializationValue,
            initializationValue
          );

          ${d}
        } else if (${h===2}) {
          ${p} values = ${p}(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            initializationValue,
            initializationValue
          );

          ${d}
        } else if (${h===3}) {
          ${p} values = ${p}(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            getValue(batch, inIdx + 2),
            initializationValue
          );

          ${d}
        }
        setOutput(${c});
      }
    `}}function j3(n){const e=[];for(;e.length===0||e[e.length-1].outSize!==1;){const t=e.length?e[e.length-1].outSize:n[1],s=El(t);e.push({inSize:t,windowSize:s,outSize:Math.ceil(t/s)})}return e}function bo(n,e,t,s){const o=j3(n.shape);let r=n;for(let i=0;i<o.length;i++){const{inSize:a,windowSize:l,outSize:c}=o[i];let u,h;t==="mean"?u=i===0?new uy({windowSize:l,inSize:a,batchSize:n.shape[0],outSize:c},a):new uy({windowSize:l,inSize:a,batchSize:n.shape[0],outSize:c}):u=new q3({windowSize:l,inSize:a,batchSize:n.shape[0],outSize:c},t),h=r,r=s.runWebGLProgram(u,[r],e),h.dataId!==n.dataId&&s.disposeIntermediateTensorInfo(h)}return r}class K3{constructor(e,t){this.variableNames=["A"];const s=new Array(e.length);for(let i=0;i<s.length;i++)s[i]=e[t[i]];this.outputShape=s,this.rank=s.length;const o=Oe(this.rank),r=X3(t);this.userCode=`
    void main() {
      ${o} resRC = getOutputCoords();
      setOutput(getA(${r}));
    }
    `}}function X3(n){const e=n.length;if(e>6)throw Error(`Transpose for rank ${e} is not yet supported`);const t=["resRC.x","resRC.y","resRC.z","resRC.w","resRC.u","resRC.v"],s=new Array(e);for(let o=0;o<n.length;o++)s[n[o]]=t[o];return s.join()}class Y3{constructor(e,t){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!0;const s=new Array(e.length);for(let u=0;u<s.length;u++)s[u]=e[t[u]];if(this.outputShape=s,this.rank=s.length,this.rank>6)throw Error(`Packed transpose for rank ${this.rank} is not yet supported.`);const o=Oe(this.rank),r=Y1("rc",this.rank),i=new Array(this.rank);for(let u=0;u<t.length;u++)i[t[u]]=r[u];const a=`vec2(${i.slice(-2).join()})`,l=`++${r[this.rank-1]} < ${s[this.rank-1]}`,c=`getChannel(getA(${i.join()}), ${a})`;this.userCode=`
    void main() {
      ${o} rc = getOutputCoords();
      vec4 result = vec4(0.);
      result[0] = ${c};
      if(${l}) {
        result[1] = ${c};
      }
      --${r[this.rank-1]};
      if(++${r[this.rank-2]} < ${s[this.rank-2]}) {
        result[2] = ${c};
        if(${l}) {
          result[3] = ${c};
        }
      }
      setOutput(result);
    }
    `}}function yc(n,e,t){const s=V().getBool("WEBGL_PACK_ARRAY_OPERATIONS")?new Y3(n.shape,e):new K3(n.shape,e);return t.runWebGLProgram(s,[n],n.dtype)}function Z3(n,e,t,s){const o=e,r=n.shape.length,i=Ce(o,n.shape);let a=i;const l=je(a,r),c=l!=null;let u=n;c&&(u=yc(n,l,s),a=et(a.length,r)),Ct("sum",a,r);const[h,d]=gt(u.shape,a);let p=h;t&&(p=rt(h,i));const f=q(d),g=q(n.shape)/f,x=ne({inputs:{x:u},attrs:{shape:[g,f]},backend:s}),b=zu(n.dtype),w=bo(x,b,"sum",s),y=ne({inputs:{x:w},attrs:{shape:p},backend:s});return s.disposeIntermediateTensorInfo(x),s.disposeIntermediateTensorInfo(w),c&&s.disposeIntermediateTensorInfo(u),y}function wc(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{axis:r,keepDims:i}=s;return Z3(o,r,i,t)}const Q3={kernelName:qa,backendName:"webgl",kernelFunc:wc};function Mt(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{perm:r}=s,i=t,a=o.shape.length,l=new Array(a);for(let u=0;u<l.length;u++)l[u]=o.shape[r[u]];let c;if(i.shouldExecuteOnCPU([o])){const h=i.texData.get(o.dataId).values,d=lp(h,o.shape,o.dtype,r,l);c=i.makeTensorInfo(l,o.dtype);const p=i.texData.get(c.dataId);p.values=d}else c=yc(o,r,i);return c}const J3={kernelName:To,backendName:"webgl",kernelFunc:Mt};const hy=1e3;function Cc({a:n,b:e,transposeA:t,transposeB:s,backend:o,bias:r=null,preluActivationWeights:i=null,leakyreluAlpha:a=0,activation:l=null}){const c=n.shape.length,u=e.shape.length,h=t?n.shape[c-2]:n.shape[c-1],d=s?e.shape[u-1]:e.shape[u-2],p=t?n.shape[c-1]:n.shape[c-2],f=s?e.shape[u-2]:e.shape[u-1],m=n.shape.slice(0,-2),g=e.shape.slice(0,-2),x=q(m),b=q(g),y=xe(n.shape.slice(0,-2),e.shape.slice(0,-2)).concat([p,f]);k(h===d,()=>`Error in matMul: inner shapes (${h}) and (${d}) of Tensors with shapes ${n.shape} and ${e.shape} and transposeA=${t} and transposeB=${s} must match.`);const C=t?[x,h,p]:[x,p,h],$=s?[b,f,d]:[b,d,f],N=ne({inputs:{x:n},backend:o,attrs:{shape:C}}),T=ne({inputs:{x:e},backend:o,attrs:{shape:$}}),S=[N,T],v=Math.max(x,b),I=t?N.shape[1]:N.shape[2],R=r!=null,F=i!=null,O=l==="leakyrelu",L=l!=null?Gi(l,!0):null,z=R||F||O||L!=null;let U;if((p===1||f===1)&&I>hy&&z===!1){let G=N,K=T;t&&(G=Mt({inputs:{x:N},backend:o,attrs:{perm:[0,2,1]}}),S.push(G)),s&&(K=Mt({inputs:{x:T},backend:o,attrs:{perm:[0,2,1]}}),S.push(K));const Z=f!==1,j=f===1;let X=G;Z&&(X=ne({inputs:{x:G},backend:o,attrs:{shape:[v,I,1]}}),S.push(X));const te=f===1?2:1;let J=K;j&&(J=ne({inputs:{x:K},backend:o,attrs:{shape:[v,1,I]}}),S.push(J));const se=up({inputs:{a:X,b:J},backend:o});U=wc({inputs:{x:se},backend:o,attrs:{axis:te,keepDims:!0}}),S.push(se)}else{const G=Gt(n.dtype,e.dtype),K=new iy(C,$,[v,p,f],t,s,R,L,F,O),Z=[N,T];if(r!=null&&Z.push(r),F&&Z.push(i),O){const j=o.makeTensorInfo([],"float32",cs(a,"float32"));Z.push(j),S.push(j)}U=o.runWebGLProgram(K,Z,G)}const W=ne({inputs:{x:U},backend:o,attrs:{shape:y}});S.push(U);for(const G of S)o.disposeIntermediateTensorInfo(G);return W}function eB(n){const{inputs:e,backend:t,attrs:s}=n,{a:o,b:r,bias:i,preluActivationWeights:a}=e,{transposeA:l,transposeB:c,activation:u,leakyreluAlpha:h}=s;return Cc({a:o,b:r,transposeA:l,transposeB:c,backend:t,bias:i,preluActivationWeights:a,leakyreluAlpha:h,activation:u})}const tB={kernelName:Ja,backendName:"webgl",kernelFunc:eB};const dy="return abs(x);";function nB(n){const{inputs:e,backend:t}=n,{x:s}=e;if(t.shouldExecuteOnCPU([s])&&s.dtype!=="complex64"){const r=t.texData.get(s.dataId),i=K1(r.values);return t.makeTensorInfo(s.shape,s.dtype,i)}let o;return V().getBool("WEBGL_PACK_UNARY_OPERATIONS")?o=new Rs(s.shape,dy):o=new jn(s.shape,dy),t.runWebGLProgram(o,[s],s.dtype)}const sB={kernelName:Ji,backendName:"webgl",kernelFunc:nB};const oB=pn+`
  if (abs(x) > 1.) {
    return NAN;
  }
  return acos(x);
`,rB=Se({opSnippet:oB}),iB={kernelName:ar,backendName:"webgl",kernelFunc:rB};const aB=pn+`
  if (x < 1.0) return NAN;
return log(x + sqrt(x * x - 1.0));`,lB=Se({opSnippet:aB}),cB={kernelName:lr,backendName:"webgl",kernelFunc:lB};const py="return a + b;",uB=$t({opSnippet:py,packedOpSnippet:py,supportsComplex:!0,cpuKernelImpl:wP}),hB={kernelName:No,backendName:"webgl",kernelFunc:uB};class dB{constructor(e,t){this.outputShape=[],this.outputShape=e,this.variableNames=t.map((r,i)=>`T${i}`);const s=[];this.variableNames.forEach(r=>{s.push(`float v${r} = get${r}AtOutCoords();`)});const o=this.variableNames.map(r=>`v${r}`).join(" + ");this.userCode=`
      void main() {
        ${s.join(`
        `)}

        float result = ${o};
        setOutput(result);
      }
    `}}class pB{constructor(e,t){this.outputShape=[],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=e,this.variableNames=t.map((r,i)=>`T${i}`);const s=[];this.variableNames.forEach(r=>{s.push(`vec4 v${r} = get${r}AtOutCoords();`)});const o=this.variableNames.map(r=>`v${r}`).join(" + ");this.userCode=`
      void main() {
        ${s.join(`
        `)}

        vec4 result = ${o};
        setOutput(result);
      }
    `}}function Ic(n){const{inputs:e,backend:t}=n,s=e;if(s.length===1)return Xt({inputs:{x:s[0]},backend:t});if(s.length>V().getNumber("WEBGL_MAX_TEXTURES_IN_SHADER")){const l=Math.floor(s.length/2),c=Ic({inputs:s.slice(0,l),backend:t}),u=Ic({inputs:s.slice(l),backend:t});return Ic({inputs:[c,u],backend:t})}const o=s.map(l=>l.dtype).reduce((l,c)=>Gt(l,c)),r=s.map(l=>l.shape),a=V().getBool("WEBGL_PACK")?new pB(s[0].shape,r):new dB(s[0].shape,r);return t.runWebGLProgram(a,s,o)}const fB={kernelName:Uc,backendName:"webgl",kernelFunc:Ic};function mB(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{axis:r,keepDims:i}=s,a=o.shape.length,l=Ce(r,o.shape);let c=l;const u=je(c,a);let h=o;u!=null&&(h=Mt({inputs:{x:o},backend:t,attrs:{perm:u}}),c=et(c.length,a)),Ct("all",c,a);const[d,p]=gt(h.shape,c),f=q(p),m=ne({inputs:{x:h},backend:t,attrs:{shape:[-1,f]}}),g=bo(m,m.dtype,"all",t);let x;if(i){const b=rt(d,l);x=ne({inputs:{x:g},backend:t,attrs:{shape:b}})}else x=ne({inputs:{x:g},backend:t,attrs:{shape:d}});return t.disposeIntermediateTensorInfo(m),t.disposeIntermediateTensorInfo(g),u!=null&&t.disposeIntermediateTensorInfo(h),x}const gB={kernelName:Gc,backendName:"webgl",kernelFunc:mB};function xB(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{axis:r,keepDims:i}=s,a=o.shape.length,l=Ce(r,o.shape);let c=l;const u=je(c,a);let h=o;u!=null&&(h=Mt({inputs:{x:o},backend:t,attrs:{perm:u}}),c=et(c.length,a)),Ct("any",c,a);const[d,p]=gt(h.shape,c),f=q(p),m=ne({inputs:{x:h},backend:t,attrs:{shape:[-1,f]}}),g=bo(m,m.dtype,"any",t);let x;if(i){const b=rt(d,l);x=ne({inputs:{x:g},backend:t,attrs:{shape:b}})}else x=ne({inputs:{x:g},backend:t,attrs:{shape:d}});return t.disposeIntermediateTensorInfo(m),t.disposeIntermediateTensorInfo(g),u!=null&&t.disposeIntermediateTensorInfo(h),x}const bB={kernelName:Hc,backendName:"webgl",kernelFunc:xB};class yB{constructor(e,t,s){this.variableNames=["A"];const{windowSize:o,batchSize:r,outSize:i}=e;s||this.variableNames.push("bestIndicesA"),this.outputShape=[r,i];const a=t==="max"?">":"<",l=s?"inOffset + i;":"round(getBestIndicesA(batch, inOffset + i));";this.userCode=`
      void main() {
        ivec2 coords = getOutputCoords();
        int batch = coords[0];
        int outIdx = coords[1];
        int inOffset = outIdx * ${o};

        int bestIndex = inOffset;
        float bestValue = getA(batch, bestIndex);

        for (int i = 0; i < ${o}; i++) {
          int inIdx = ${l};
          float candidate = getA(batch, inIdx);
          if (candidate ${a} bestValue) {
            bestValue = candidate;
            bestIndex = inIdx;
          }
        }
        setOutput(float(bestIndex));
      }
    `}}class wB{constructor(e,t,s,o){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!0,k(e.length>2,()=>`Packed arg${s.charAt(0).toUpperCase()+s.slice(1)} supports only inputs with rank above 2.`);const r=e[e.length-1],i=Math.ceil(r/t);this.outputShape=e.slice(0,-1),i>1&&this.outputShape.push(i),o||this.variableNames.push("bestIndicesA");const a=this.outputShape,l=a.length,c=Oe(l),u=Lt("coords",l);let h,d;if(i===1){d=l+1;const T=Oe(d);h=`
        ${T} sourceLocR = ${T}(${u.join()}, 0);
        ++${u[l-1]};
        ${T} sourceLocG = ${T}(${u.join()}, 0);
        ++${u[l-2]};
        ${T} sourceLocA = ${T}(${u.join()}, 0);
        --${u[l-1]};
        ${T} sourceLocB = ${T}(${u.join()}, 0);
        --${u[l-2]};`}else d=l,h=`
        ${c} sourceLocR = coords;
        ++${u[l-1]};
        ${c} sourceLocG = coords;
        ++${u[l-2]};
        ${c} sourceLocA = coords;
        --${u[l-1]};
        ${c} sourceLocB = coords;
        --${u[l-2]};`;const p=["x","y","z","w","u","v"].slice(0,d),f="."+p[d-1],m=p.map(T=>"int "+T),g=Lt("sourceLocR",d-1).concat("inIdx.r"),x=Lt("sourceLocG",d-1).concat("inIdx.g"),b=Lt("sourceLocB",d-1).concat("inIdx.b"),w=Lt("sourceLocA",d-1).concat("inIdx.a"),y=s==="max"?"greaterThan":"lessThan",C=o?"":`
          inIdx = round(vec4(getBestIndicesAChannel(${g.join()}),
                             getBestIndicesAChannel(${x.join()}),
                             getBestIndicesAChannel(${b.join()}),
                             getBestIndicesAChannel(${w.join()})));`,$=`vec4(
            getAChannel(${g.join()}),
            hasNextCol ? getAChannel(${x.join()}) : 0.,
            hasNextRow ? getAChannel(${b.join()}) : 0.,
            hasNextRow && hasNextCol ? getAChannel(${w.join()}) : 0.)`,N=o?"":`
      float getBestIndicesAChannel(${m.join()}) {
        return getChannel(getBestIndicesA(${p.join()}),
                                          vec2(${p.slice(-2).join()}));
      }`;this.userCode=`
      float getAChannel(${m.join()}) {
        return getChannel(getA(${p.join()}),
                               vec2(${p.slice(-2).join()}));
      }
      ${N}
      void main() {
        ${c} coords = getOutputCoords();
        bool hasNextCol = ${u[l-1]} < ${a[l-1]-1};
        bool hasNextRow = ${u[l-2]} < ${a[l-2]-1};
        ${h}
        ivec4 srcIdx = ivec4(sourceLocR${f}, sourceLocG${f},
          sourceLocB${f}, sourceLocA${f}) * ${t};
        ivec4 inIdx = srcIdx;
        vec4 bestIndex = vec4(inIdx);
        vec4 bestValue = ${$};

        for (int i = 0; i < ${t}; i++) {
          inIdx = srcIdx;
          ${C}
          vec4 candidate = ${$};
          bvec4 nan = isnan(candidate);
          bvec4 replace = bvec4(
            vec4(${y}(candidate, bestValue)) * (vec4(1.0) - vec4(nan)));

          bestValue = vec4(replace.x  ? candidate.x : bestValue.x,
                           replace.y  ? candidate.y : bestValue.y,
                           replace.z  ? candidate.z : bestValue.z,
                           replace.w  ? candidate.w : bestValue.w);
          bestIndex = mix(bestIndex, vec4(inIdx), vec4(replace));
          srcIdx++;
        }
        setOutput(bestIndex);
      }
    `}}function fy(n,e,t,s=null){let o=e.shape[0],r=e.shape[1];s!=null&&(o=s.shape[0],r=s.shape[1]);const i=El(r),a={windowSize:i,inSize:r,batchSize:o,outSize:Math.ceil(r/i)},l=new yB(a,t,s==null),c=[e];s!=null&&c.push(s);const u=n.runWebGLProgram(l,c,"int32");if(u.shape[1]===1)return u;const h=fy(n,e,t,u);return n.disposeIntermediateTensorInfo(u),h}function my(n,e,t,s=null){const o=s!=null?s.shape:e.shape,r=o[o.length-1],i=El(r),a=new wB(o,i,t,s==null),l=s==null?[e]:[e,s],c=n.runWebGLProgram(a,l,"int32");if(c.shape.length===e.shape.length){const u=my(n,e,t,c);return n.disposeIntermediateTensorInfo(c),u}return c}function gy(n,e,t,s){const o=[t];if(Ct("arg"+s.charAt(0).toUpperCase()+s.slice(1),o,e.shape.length),!V().getBool("WEBGL_PACK_REDUCE")||e.shape.length<=2){const r=[],i=n.texData.get(e.dataId),a=i!==null&&i.isPacked;let l=e;a&&(l=n.unpackTensor(e),r.push(l));const[c,u]=gt(l.shape,o),h=q(u),d=ne({inputs:{x:l},backend:n,attrs:{shape:[-1,h]}});r.push(d);const p=fy(n,d,s);r.push(p);const f=ne({inputs:{x:p},backend:n,attrs:{shape:c}});return r.forEach(m=>n.disposeIntermediateTensorInfo(m)),f}return my(n,e,s)}function CB(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{axis:r}=s;let i=Ce(r,o.shape);const a=je(i,o.shape.length);let l=o;const c=[];a!=null&&(l=Mt({inputs:{x:o},backend:t,attrs:{perm:a}}),c.push(l),i=et(i.length,l.shape.length)),Ct("argMax",[i[0]],l.shape.length);const u=gy(t,l,i[0],"max");return c.forEach(h=>t.disposeIntermediateTensorInfo(h)),u}const IB={kernelName:ea,backendName:"webgl",kernelFunc:CB};function $B(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{axis:r}=s;let i=Ce(r,o.shape);const a=je(i,o.shape.length);let l=o;const c=[];a!=null&&(l=Mt({inputs:{x:o},backend:t,attrs:{perm:a}}),c.push(l),i=et(i.length,l.shape.length)),Ct("argMin",[i[0]],l.shape.length);const u=gy(t,l,i[0],"min");return c.forEach(h=>t.disposeIntermediateTensorInfo(h)),u}const kB={kernelName:ta,backendName:"webgl",kernelFunc:$B};const vB=pn+`
  if (abs(x) > 1.) {
    return NAN;
  }
  return asin(x);
`,SB=Se({opSnippet:vB}),NB={kernelName:cr,backendName:"webgl",kernelFunc:SB};const TB=pn+"return log(x + sqrt(x * x + 1.0));",EB=Se({opSnippet:TB}),RB={kernelName:ur,backendName:"webgl",kernelFunc:EB};const AB=pn+`
  return atan(x);
`,DB=Se({opSnippet:AB}),FB={kernelName:hr,backendName:"webgl",kernelFunc:DB};const _B=cp+`
  return atan(a, b);
`,OB=`
  vec4 result = atan(a, b);
  bvec4 isNaNA = isnan(a);
  bvec4 isNaNB = isnan(b);
  bvec4 isNaN = bvec4(isNaNA.x || isNaNB.x, isNaNA.y || isNaNB.y, isNaNA.z || isNaNB.z, isNaNA.w || isNaNB.w);
  `+xo+`
  return result;
`,LB=$t({opSnippet:_B,packedOpSnippet:OB}),MB={kernelName:pr,backendName:"webgl",kernelFunc:LB};const PB=pn+`
  if ((x < -1.0) || (x > 1.0)) return NAN;
return (log(1.0 + x) - log(1.0 - x)) / 2.0;`,BB=Se({opSnippet:PB}),zB={kernelName:dr,backendName:"webgl",kernelFunc:BB};class Hi{constructor(e,t,s,o=!1,r=!1){if(this.variableNames=["x"],t==="avg"&&s)throw new Error("Cannot compute positions for average pool.");const i=e.filterWidth,a=e.strideHeight,l=e.strideWidth,c=e.dilationHeight,u=e.dilationWidth,h=e.effectiveFilterHeight,d=e.effectiveFilterWidth,p=e.padInfo.top,f=e.padInfo.left;this.outputShape=e.outShape;const m=t==="avg",g=`((batch  * ${e.inHeight} + xR) * ${e.inWidth} + xC) * ${e.inChannels} + d`,x=`(xR * ${e.inWidth} + xC) * ${e.inChannels} + d`;let b="0.0";if(m||(b="-1.0 / 1e-20"),s){this.userCode=`
        const ivec2 strides = ivec2(${a}, ${l});
        const ivec2 pads = ivec2(${p}, ${f});

        void main() {
          ivec4 coords = getOutputCoords();
          int batch = coords[0];
          int d = coords[3];

          ivec2 xRCCorner = coords.yz * strides - pads;
          int xRCorner = xRCCorner.x;
          int xCCorner = xRCCorner.y;

          // max/min x(?, ?, d) to get y(yR, yC, d).
          // ? = to be determined
          float minMaxValue = 0.0;
          float minMaxValueFound = 0.0;
          int minMaxPosition = 0;
          float avgValue = 0.0;

          for (int wR = 0; wR < ${h};
              wR += ${c}) {
            int xR = xRCorner + wR;

            if (xR < 0 || xR >= ${e.inHeight}) {
              continue;
            }

            for (int wC = 0; wC < ${d};
                wC += ${u}) {
              int xC = xCCorner + wC;

              if (xC < 0 || xC >= ${e.inWidth}) {
                continue;
              }

              float value = getX(batch, xR, xC, d);

              // If a min / max value has already been found, use it. If not,
              // use the current value.
              float currMinMaxValue = mix(
                  value, minMaxValue, minMaxValueFound);
              if (value >= currMinMaxValue) {
                minMaxValue = value;
                minMaxValueFound = 1.0;
                minMaxPosition = ${o?r?g:x:`wR * ${d} + wC`};
              }
            }
          }
          setOutput(float(minMaxPosition));
        }
      `;return}const w="max";let y=`${t}(${t}(${t}(minMaxValue[0], minMaxValue[1]), minMaxValue[2]), minMaxValue[3])`;t==="avg"&&(y="avgValue / max(count, 1.0)");const C=Math.floor(i/4)*4,$=i%4,N=`
      if (${m}) {
        avgValue += dot(values, ones);
      } else {
        minMaxValue = ${w}(values, minMaxValue);
      }
    `;this.userCode=`
      const ivec2 strides = ivec2(${a}, ${l});
      const ivec2 pads = ivec2(${p}, ${f});
      const float initializationValue = ${b};
      const vec4 ones = vec4(1.0, 1.0, 1.0, 1.0);

      float count = 0.0;

      float getValue(int batch, int xR, int xC, int d) {
        if (xC < 0 || xC >= ${e.inWidth}) {
          return initializationValue;
        }
        count += 1.0;
        return getX(batch, xR, xC, d);
      }

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords[0];
        int d = coords[3];

        ivec2 xRCCorner = coords.yz * strides - pads;
        int xRCorner = xRCCorner.x;
        int xCCorner = xRCCorner.y;

        // max/min x(?, ?, d) to get y(yR, yC, d).
        // ? = to be determined
        vec4 minMaxValue = vec4(${b});
        float avgValue = 0.0;
        count = 0.0;

        for (int wR = 0; wR < ${h};
            wR += ${c}) {
          int xR = xRCorner + wR;

          if (xR < 0 || xR >= ${e.inHeight}) {
            continue;
          }

          for (int wC = 0; wC < ${C}; wC += 4) {
            int xC = xCCorner + wC * ${u};

            vec4 values = vec4(
              getValue(batch, xR, xC, d),
              getValue(batch, xR, xC + ${u}, d),
              getValue(batch, xR, xC + 2 * ${u}, d),
              getValue(batch, xR, xC + 3 * ${u}, d)
            );

            ${N}
          }

          int xC = xCCorner + ${C};
          if (${$===1}) {
            vec4 values = vec4(
              getValue(batch, xR, xC, d),
              initializationValue,
              initializationValue,
              initializationValue
            );

            ${N}
          } else if (${$===2}) {
            vec4 values = vec4(
              getValue(batch, xR, xC, d),
              getValue(batch, xR, xC + ${u}, d),
              initializationValue,
              initializationValue
            );

            ${N}
          } else if (${$===3}) {
            vec4 values = vec4(
              getValue(batch, xR, xC, d),
              getValue(batch, xR, xC + ${u}, d),
              getValue(batch, xR, xC + 2 * ${u}, d),
              initializationValue
            );

            ${N}
          }
        }
        setOutput(${y});
      }
    `}}class hp{constructor(e,t,s,o=!1,r=!1){if(this.variableNames=["x"],t==="avg"&&s)throw new Error("Cannot compute positions for average pool.");const i=e.filterWidth,a=e.strideDepth,l=e.strideHeight,c=e.strideWidth,u=e.dilationDepth,h=e.dilationHeight,d=e.dilationWidth,p=e.effectiveFilterDepth,f=e.effectiveFilterHeight,m=e.effectiveFilterWidth,g=e.padInfo.front,x=e.padInfo.top,b=e.padInfo.left;this.outputShape=e.outShape;const w=t==="avg";let y="0.0";if(w||(y="-1.0 / 1e-20"),s){this.userCode=`
        const ivec3 strides =
            ivec3(${a}, ${l}, ${c});
        const ivec3 pads = ivec3(${g}, ${x}, ${b});

        void main() {
          ivec5 coords = getOutputCoords();
          int batch = coords.x;
          int ch = coords.u;

          ivec3 xCorner = ivec3(coords.y, coords.z, coords.w) * strides - pads;
          int xDCorner = xCorner.x;
          int xRCorner = xCorner.y;
          int xCCorner = xCorner.z;

          // max/min x(?, ?, ?, ch) to get y(yD, yR, yC, ch).
          // ? = to be determined
          float minMaxValue = 0.0;
          float minMaxValueFound = 0.0;
          int minMaxPosition = 0;

          for (int wD = 0; wD < ${p};
              wD += ${u}) {
            int xD = xDCorner + wD;

            if (xD < 0 || xD >= ${e.inDepth}) {
              continue;
            }

            for (int wR = 0; wR < ${f};
                wR += ${h}) {
              int xR = xRCorner + wR;

              if (xR < 0 || xR >= ${e.inHeight}) {
                continue;
              }

              for (int wC = 0; wC < ${m};
                  wC += ${d}) {
                int xC = xCCorner + wC;

                if (xC < 0 || xC >= ${e.inWidth}) {
                  continue;
                }

                float value = getX(batch, xD, xR, xC, ch);

                // If a min / max value has already been found, use it. If not,
                // use the current value.
                float currMinMaxValue = mix(
                    value, minMaxValue, minMaxValueFound);
                if (value >= currMinMaxValue) {
                  minMaxValue = value;
                  minMaxValueFound = 1.0;
                  minMaxPosition = ${o?r?`(((batch * ${e.inDepth} + xD) * ${e.inHeight} + xR) * ${e.inWidth} + xC) * ${e.inChannels} + ch`:`((xD * ${e.inHeight} + xR) * ${e.inWidth} + xC) * ${e.inChannels} + ch`:`wD * ${f} * ${m} +
                      wR * ${m} + wC`};
                }
              }
            }
          }
          setOutput(float(minMaxPosition));
        }
      `;return}const C="max";let $=`${t}(${t}(${t}(minMaxValue[0], minMaxValue[1]), minMaxValue[2]), minMaxValue[3])`;t==="avg"&&($="avgValue / max(count, 1.0)");const N=Math.floor(i/4)*4,T=i%4,S=`
      if (${w}) {
        avgValue += dot(values, ones);
      } else {
        minMaxValue = ${C}(values, minMaxValue);
      }
    `;this.userCode=`
      const ivec3 strides =
        ivec3(${a}, ${l}, ${c});
      const ivec3 pads = ivec3(${g}, ${x}, ${b});
      const float initializationValue = ${y};
      const vec4 ones = vec4(1.0, 1.0, 1.0, 1.0);

      float count = 0.0;

      float getValue(int batch, int xD, int xR, int xC, int ch) {
        if (xC < 0 || xC >= ${e.inWidth}) {
          return initializationValue;
        }
        count += 1.0;
        return getX(batch, xD, xR, xC, ch);
      }

      void main() {
        ivec5 coords = getOutputCoords();
        int batch = coords.x;
        int ch = coords.u;

        ivec3 xCorner = ivec3(coords.y, coords.z, coords.w) * strides - pads;
        int xDCorner = xCorner.x;
        int xRCorner = xCorner.y;
        int xCCorner = xCorner.z;

        // max/min x(?, ?, ?, d) to get y(yD, yR, yC, ch).
        // ? = to be determined
        vec4 minMaxValue = vec4(${y});
        float avgValue = 0.0;
        count = 0.0;

        for (int wD = 0; wD < ${p};
            wD += ${u}) {
          int xD = xDCorner + wD;

          if (xD < 0 || xD >= ${e.inDepth}) {
            continue;
          }

          for (int wR = 0; wR < ${f};
            wR += ${h}) {
            int xR = xRCorner + wR;

            if (xR < 0 || xR >= ${e.inHeight}) {
              continue;
            }

            for (int wC = 0; wC < ${N}; wC += 4) {
              int xC = xCCorner + wC * ${d};

              vec4 values = vec4(
                getValue(batch, xD, xR, xC, ch),
                getValue(batch, xD, xR, xC + ${d}, ch),
                getValue(batch, xD, xR, xC + 2 * ${d}, ch),
                getValue(batch, xD, xR, xC + 3 * ${d}, ch)
              );

              ${S}
            }

            int xC = xCCorner + ${N};
            if (${T===1}) {
              vec4 values = vec4(
                getValue(batch, xD, xR, xC, ch),
                initializationValue,
                initializationValue,
                initializationValue
              );

              ${S}
            } else if (${T===2}) {
              vec4 values = vec4(
                getValue(batch, xD, xR, xC, ch),
                getValue(batch, xD, xR, xC + ${d}, ch),
                initializationValue,
                initializationValue
              );

              ${S}
            } else if (${T===3}) {
              vec4 values = vec4(
                getValue(batch, xD, xR, xC, ch),
                getValue(batch, xD, xR, xC + ${d}, ch),
                getValue(batch, xD, xR, xC + 2 * ${d}, ch),
                initializationValue
              );

              ${S}
            }
          }
        }
        setOutput(${$});
      }
    `}}function VB(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e;Wi(o,"avgPool");const{filterSize:r,strides:i,pad:a,dimRoundingMode:l}=s,c=1;k(Nt(i,c),()=>`Error in avgPool: Either strides or dilations must be 1. Got strides ${i} and dilations '${c}'`);const u=sn(o.shape,r,i,c,a,l);if(u.filterWidth===1&&u.filterHeight===1&&Ee(u.inShape,u.outShape))return Xt({inputs:{x:o},backend:t});const h=new Hi(u,"avg",!1);return t.runWebGLProgram(h,[o],"float32")}const WB={kernelName:na,backendName:"webgl",kernelFunc:VB};function UB(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{filterSize:r,strides:i,pad:a,dimRoundingMode:l,dataFormat:c}=s,u=[1,1,1],h=Yn(o.shape,r,i,u,a,l,c),d=new hp(h,"avg",!1);return t.runWebGLProgram(d,[o],"float32")}const GB={kernelName:sa,backendName:"webgl",kernelFunc:UB};class HB{constructor(e){this.variableNames=["dy"],this.outputShape=e.inShape;const t=e.filterHeight,s=e.filterWidth,o=e.strideHeight,r=e.strideWidth,i=e.dilationHeight,a=e.dilationWidth,l=e.effectiveFilterHeight,c=e.effectiveFilterWidth,u=l-1-e.padInfo.top,h=c-1-e.padInfo.left,d=1/(t*s);this.userCode=`
      const ivec2 pads = ivec2(${u}, ${h});
      const float avgMultiplier = float(${d});

      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];

        ivec2 dyRCCorner = coords.yz - pads;
        int dyRCorner = dyRCCorner.x;
        int dyCCorner = dyRCCorner.y;

        // Convolve dy(?, ?, d) with pos mask(:, :, d) to get dx(xR, xC, d).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;
        for (int wR = 0; wR < ${l};
            wR += ${i}) {
          float dyR = float(dyRCorner + wR) / ${o}.0;

          if (dyR < 0.0 || dyR >= ${e.outHeight}.0 || fract(dyR) > 0.0) {
            continue;
          }
          int idyR = int(dyR);

          for (int wC = 0; wC < ${c};
            wC+= ${a}) {
            float dyC = float(dyCCorner + wC) / ${r}.0;

            if (dyC < 0.0 || dyC >= ${e.outWidth}.0 ||
                fract(dyC) > 0.0) {
              continue;
            }
            int idyC = int(dyC);

            float dyValue = getDy(b, idyR, idyC, d);

            dotProd += dyValue * avgMultiplier;
          }
        }
        setOutput(dotProd);
      }
    `}}class qB{constructor(e){this.variableNames=["dy"],this.outputShape=e.inShape;const t=e.filterDepth,s=e.filterHeight,o=e.filterWidth,r=e.strideDepth,i=e.strideHeight,a=e.strideWidth,l=e.dilationDepth,c=e.dilationHeight,u=e.dilationWidth,h=e.effectiveFilterDepth,d=e.effectiveFilterHeight,p=e.effectiveFilterWidth,f=h-1-e.padInfo.front,m=d-1-e.padInfo.top,g=p-1-e.padInfo.left,x=1/(t*s*o);this.userCode=`
      const ivec3 pads = ivec3(${f}, ${m}, ${g});
      const float avgMultiplier = float(${x});

      void main() {
        ivec5 coords = getOutputCoords();
        int batch = coords.x;
        int ch = coords.u;

        ivec3 dyCorner = ivec3(coords.y, coords.z, coords.w) - pads;
        int dyDCorner = dyCorner.x;
        int dyRCorner = dyCorner.y;
        int dyCCorner = dyCorner.z;

        // Convolve dy(?, ?, ?, d) with pos mask(:, :, :, ch) to get
        // dx(xD, xR, xC, ch).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;

        for (int wD = 0; wD < ${h};
            wD += ${l}) {
          float dyD = float(dyDCorner + wD) / ${r}.0;

          if (dyD < 0.0 || dyD >= ${e.outDepth}.0 || fract(dyD) > 0.0) {
            continue;
          }
          int idyD = int(dyD);

          for (int wR = 0; wR < ${d};
              wR += ${c}) {
            float dyR = float(dyRCorner + wR) / ${i}.0;

            if (dyR < 0.0 || dyR >= ${e.outHeight}.0 ||
                fract(dyR) > 0.0) {
              continue;
            }
            int idyR = int(dyR);

            for (int wC = 0; wC < ${p};
                wC += ${u}) {
              float dyC = float(dyCCorner + wC) / ${a}.0;

              if (dyC < 0.0 || dyC >= ${e.outWidth}.0 ||
                  fract(dyC) > 0.0) {
                continue;
              }
              int idyC = int(dyC);

              float dyValue = getDy(batch, idyD, idyR, idyC, ch);

              dotProd += dyValue * avgMultiplier;
            }
          }
        }
        setOutput(dotProd);
      }
    `}}function jB(n){const{inputs:e,backend:t,attrs:s}=n,{dy:o,input:r}=e,i=r,{filterSize:a,strides:l,pad:c,dimRoundingMode:u}=s,h=[1,1,1],d=Yn(i.shape,a,l,h,c,u),p=new qB(d);return t.runWebGLProgram(p,[o],i.dtype)}const KB={kernelName:jc,backendName:"webgl",kernelFunc:jB};function XB(n){const{inputs:e,backend:t,attrs:s}=n,{dy:o,input:r}=e,i=r;Wi([o,r],"avgPoolGrad");const{filterSize:a,strides:l,pad:c}=s,u=sn(i.shape,a,l,1,c),h=new HB(u);return t.runWebGLProgram(h,[o],i.dtype)}const YB={kernelName:qc,backendName:"webgl",kernelFunc:XB};function ZB(n){const{inputs:e,backend:t,attrs:s}=n,{a:o,b:r}=e,{transposeA:i,transposeB:a}=s;return Cc({a:o,b:r,transposeA:i,transposeB:a,backend:t})}const QB={kernelName:oa,backendName:"webgl",kernelFunc:ZB};class JB{constructor(e,t,s,o,r,i){this.outputShape=[],this.variableNames=["x","mean","variance"],xe(e,t),xe(e,s);let a="0.0";o!=null&&(xe(e,o),this.variableNames.push("offset"),a="getOffsetAtOutCoords()");let l="1.0";r!=null&&(xe(e,r),this.variableNames.push("scale"),l="getScaleAtOutCoords()"),this.outputShape=e,this.userCode=`
      void main() {
        float x = getXAtOutCoords();
        float mean = getMeanAtOutCoords();
        float variance = getVarianceAtOutCoords();
        float offset = ${a};
        float scale = ${l};
        float inv = scale * inversesqrt(variance + float(${i}));
        setOutput(dot(vec3(x, -mean, offset), vec3(inv, inv, 1)));
      }
    `}}class ez{constructor(e,t,s,o,r,i){this.packedInputs=!0,this.packedOutput=!0,this.variableNames=["x","mean","variance"],xe(e,t),xe(e,s);let a="vec4(0.0)";o!=null&&(xe(e,o),this.variableNames.push("offset"),a="getOffsetAtOutCoords()");let l="vec4(1.0)";r!=null&&(xe(e,r),this.variableNames.push("scale"),l="getScaleAtOutCoords()"),this.outputShape=e,this.userCode=`
      void main() {
        vec4 offset = ${a};
        vec4 scale = ${l};

        vec4 x = getXAtOutCoords();
        vec4 mean = getMeanAtOutCoords();
        vec4 variance = getVarianceAtOutCoords();

        vec4 inv = scale * inversesqrt(variance + vec4(${i}));

        setOutput((x - mean) * inv + offset);
      }
    `}}const tz={kernelName:ga,backendName:"webgl",kernelFunc:({inputs:n,backend:e,attrs:t})=>{const{x:s,mean:o,variance:r,offset:i,scale:a}=n;k(o.shape.length===r.shape.length,()=>"Batch normalization gradient requires mean and variance to have equal ranks."),k(i==null||o.shape.length===i.shape.length,()=>"Batch normalization gradient requires mean and offset to have equal ranks."),k(a==null||o.shape.length===a.shape.length,()=>"Batch normalization gradient requires mean and scale to have equal ranks.");let{varianceEpsilon:l}=t;l==null&&(l=.001);const c=[s,o,r];let u=null;i!=null&&(u=i.shape,c.push(i));let h=null;a!=null&&(h=a.shape,c.push(a));const d=V().getBool("WEBGL_PACK_NORMALIZATION")?new ez(s.shape,o.shape,r.shape,u,h,l):new JB(s.shape,o.shape,r.shape,u,h,l);return e.runWebGLProgram(d,c,c[0].dtype)}};class nz{constructor(e){this.variableNames=["source"],this.outputShape=e,this.rank=e.length;const t=Oe(this.rank);this.customUniforms=[{name:"start",arrayIndex:this.rank,type:"int"}];const s=sz(this.rank);let o;const r=e.map((i,a)=>`sourceLoc.${dp[a]} = start[${a}] + coords.${dp[a]};`);o=`
        ${t} sourceLoc;
        ${t} coords = getOutputCoords();
        ${r.join(`
`)}
      `,this.userCode=`
      void main() {
        ${o}
        setOutput(getSource(${s}));
      }
    `}}const dp=["x","y","z","w","u","v"];function sz(n){if(n===1)return"sourceLoc";if(n<=6)return dp.slice(0,n).map(e=>"sourceLoc."+e).join(",");throw Error(`Slicing for rank ${n} is not yet supported`)}class oz{constructor(e){this.variableNames=["source"],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=e,this.rank=e.length,this.customUniforms=[{name:"start",arrayIndex:this.rank,type:"int"}];const t=Oe(this.rank),s=Lt("coords",this.rank),o=Lt("sourceLoc",this.rank),r=this.rank===1?"sourceLoc":`vec2(${o.slice(-2).join()})`,i=`getChannel(getSource(${o.join()}), ${r})`,a=`
      result.x = ${i};
      if (++${s[this.rank-1]} < ${e[this.rank-1]}) {
        ++${o[this.rank-1]};
        result.y = ${i};
        --${o[this.rank-1]};
      }
    `,l=this.rank===1?"":`
      --${s[this.rank-1]};
      if (++${s[this.rank-2]} < ${e[this.rank-2]}) {
        ++${o[this.rank-2]};
        result.z = ${i};
        if (++${s[this.rank-1]} < ${e[this.rank-1]}) {
          ++${o[this.rank-1]};
          result.w = ${i};
        }
      }
    `,c=this.rank<=4?`sourceLoc = coords +
            ${t}(${e.map((u,h)=>`start[${h}]`).join()});`:e.map((u,h)=>`${o[h]} = ${s[h]} + start[${h}];`).join(`
`);this.userCode=`
      void main() {
        ${t} coords = getOutputCoords();
        ${t} sourceLoc;
        ${c}
        vec4 result = vec4(0.);
        ${a}
        ${l}
        setOutput(result);
      }
    `}}function rz(n,e,t,s){const o=s.texData.get(n.dataId),r=s.makeTensorInfo(t,n.dtype),i=s.texData.get(r.dataId);Object.assign(i,o),i.refCount=1,i.shape=t,i.dtype=n.dtype;let a=Oh(e,ce(n.shape));o.slice&&(a+=o.slice.flatOffset),i.slice={flatOffset:a,origDataId:o.slice&&o.slice.origDataId||n.dataId};const l=s.dataRefCount.get(i.slice.origDataId)||1;return s.dataRefCount.set(i.slice.origDataId,l+1),r}function or(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{begin:r,size:i}=s,[a,l]=Tl(o,r,i);if(Dh(o,a,l),q(l)===0)return t.makeTensorInfo(l,o.dtype,[]);if(t.shouldExecuteOnCPU([o])||o.dtype==="string"){const h=t.texData.get(o.dataId),d=QP(h.values,a,l,o.shape,o.dtype);return t.makeTensorInfo(l,o.dtype,d)}const{isPacked:c}=t.texData.get(o.dataId),u=_h(o.shape,a,l);if(c||!u){const h=V().getBool("WEBGL_PACK_ARRAY_OPERATIONS")?new oz(l):new nz(l),d=[a];return t.runWebGLProgram(h,[o],o.dtype,d)}return t.uploadToGPU(o.dataId),rz(o,a,l,t)}const iz={kernelName:Ha,backendName:"webgl",kernelFunc:or};const az={kernelName:ra,backendName:"webgl",kernelFunc:n=>{const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{blockShape:r,crops:i}=s;k(o.shape.length<=4,()=>"batchToSpaceND for rank > 4 with a WebGL backend not implemented yet");const a=r.reduce((b,w)=>b*w),l=bi(o.shape,r,a),c=yi(l.length,r.length),u=wi(o.shape,r,a),h=zh(i,r.length),d=Vh(u,i,r.length),p=[],f=ne({inputs:{x:o},backend:t,attrs:{shape:l}}),m=Mt({inputs:{x:f},backend:t,attrs:{perm:c}}),g=ne({inputs:{x:m},backend:t,attrs:{shape:u}}),x=or({inputs:{x:g},backend:t,attrs:{begin:h,size:d}});return p.push(f),p.push(m),p.push(g),p.forEach(b=>t.disposeIntermediateTensorInfo(b)),x}};function lz(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,weights:r}=e,{size:i}=s,a=t.readSync(o.dataId),l=t.readSync(r.dataId),c=j1(a,l,r.dtype,r.shape,i);return t.makeTensorInfo([i],r.dtype,c)}const cz={kernelName:Kc,backendName:"webgl",kernelFunc:lz};const uz=`
  int r = int(a.r) & int(b.r);
  int g = int(a.g) & int(b.g);
  int rb = int(a.b) & int(b.b);
  int ra = int(a.a) & int(b.a);
  return vec4(r, g, rb, ra);
`,hz=`
  return float(int(a.r) & int(b.r));
`;function dz(n){const{inputs:e,backend:t}=n,{a:s,b:o}=e,r=V().getBool("WEBGL_PACK_BINARY_OPERATIONS"),i=V().getNumber("WEBGL_VERSION");if(t.shouldExecuteOnCPU([s,o])||i===1){const l=t.texData.get(s.dataId).values,c=t.texData.get(o.dataId).values,[u,h]=IP(s.shape,o.shape,l,c,s.dtype),d=t.makeTensorInfo(h,s.dtype),p=t.texData.get(d.dataId);return p.values=u,d}let a;return r?a=new nr(uz,s.shape,o.shape,!1):a=new go(hz,s.shape,o.shape),t.runWebGLProgram(a,[s,o],s.dtype)}const pz={kernelName:Xc,backendName:"webgl",kernelFunc:dz};function fz(n){const{inputs:e,backend:t}=n,{s0:s,s1:o}=e,r=t.readSync(s.dataId),i=t.readSync(o.dataId),a=xe(Array.from(r),Array.from(i));return t.makeTensorInfo([a.length],"int32",Int32Array.from(a))}const mz={kernelName:Fp,backendName:"webgl",kernelFunc:fz};const xy=$t({opSnippet:"return float(a != b);",cpuKernelImpl:UP,dtype:"bool"}),gz={kernelName:Fa,backendName:"webgl",kernelFunc:xy};function qi(n){const{inputs:e,backend:t}=n,{input:s}=e,o=t.texData.get(s.dataId);return Xt({inputs:{x:o.complexTensorInfos.real},backend:t})}const xz={kernelName:Iu,backendName:"webgl",kernelFunc:qi};const bz="return float(int(x));";function yz(n,e){const t=new jn(n.shape,bz),s=e.runWebGLProgram(t,[n],"int32");return{dataId:s.dataId,shape:s.shape,dtype:s.dtype}}function pp(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{dtype:r}=s;if(r==="complex64"){if(o.dtype==="complex64")return Xt({inputs:{x:o},backend:t});const i=nt(o.shape),a=pp({inputs:{x:o},backend:t,attrs:{dtype:"float32"}}),l=As({inputs:{real:a,imag:i},backend:t});return i.dispose(),t.disposeIntermediateTensorInfo(a),l}if(o.dtype==="complex64"){const i=qi({inputs:{input:o},backend:t}),a=pp({inputs:{x:i},backend:t,attrs:{dtype:r}});return t.disposeIntermediateTensorInfo(i),a}if(!Np(o.dtype,r)){const i=Xt({inputs:{x:o},backend:t});return{dataId:i.dataId,shape:i.shape,dtype:r}}if(t.shouldExecuteOnCPU([o])){const i=t.texData.get(o.dataId).values,[a,l,c]=$P(i,o.shape,o.dtype,r);return t.makeTensorInfo(a,l,c)}if(r==="int32")return yz(o,t);if(r==="bool"){const i=t.makeTensorInfo([],"bool",vt("bool",1)),l=xy({inputs:{a:o,b:i},backend:t});return t.disposeIntermediateTensorInfo(i),l}throw new Error(`Error in Cast: failed to cast ${o.dtype} to ${r}`)}const wz={kernelName:fr,backendName:"webgl",kernelFunc:pp};const by="return ceil(x);",Cz=Se({opSnippet:by,packedOpSnippet:by,cpuKernelImpl:kP}),Iz={kernelName:mr,backendName:"webgl",kernelFunc:Cz};class $z{constructor(e){this.variableNames=["A"],this.customUniforms=[{name:"minVal",type:"float"},{name:"maxVal",type:"float"}],this.outputShape=e,this.userCode=`

      void main() {
        float value = getAAtOutCoords();
        if (isnan(value)) {
          setOutput(value);
          return;
        }

        setOutput(clamp(value, minVal, maxVal));
      }
    `}}class kz{constructor(e){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:"minVal",type:"float"},{name:"maxVal",type:"float"}],this.outputShape=e,this.userCode=`
      void main() {
        vec4 value = getAAtOutCoords();

        if (any(isnan(value))) {
          setOutput(value);
          return;
        }

        setOutput(clamp(value, vec4(minVal), vec4(maxVal)));
      }
    `}}function vz(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{clipValueMin:r,clipValueMax:i}=s;let a;V().getBool("WEBGL_PACK_CLIP")?a=new kz(o.shape):a=new $z(o.shape);const l=[[r],[i]];return t.runWebGLProgram(a,[o],o.dtype,l)}const Sz={kernelName:gr,backendName:"webgl",kernelFunc:vz};class Nz{constructor(e){this.variableNames=["real","imag"],this.outputShape=e,this.userCode=`
      void main() {
        float re = abs(getRealAtOutCoords());
        float im = abs(getImagAtOutCoords());
        float mx = max(re, im);

        // sadly the length function in glsl is not underflow-safe
        // (at least not on Intel GPUs). So the safe solution is
        // to ensure underflow-safety in all cases.
        setOutput(
          mx == 0.0 ? 0.0 : mx * length(vec2(1, min(re, im)/mx))
        );
      }
    `}}function yy(n,e){return{dataId:e.dataId,dtype:e.dtype,shape:n.shape}}function Tz(n){const{inputs:e,backend:t}=n,{x:s}=e,o=t.texData.get(s.dataId),r=new Nz(s.shape),i=[yy(s,o.complexTensorInfos.real),yy(s,o.complexTensorInfos.imag)];return t.runWebGLProgram(r,i,i[0].dtype)}const Ez={kernelName:ia,backendName:"webgl",kernelFunc:Tz};class Rz{constructor(e){this.outputShape=[],this.outputShape=Mn(e,1),this.variableNames=e.map((i,a)=>`T${a}`);const t=new Array(e.length-1);t[0]=e[0][1];for(let i=1;i<t.length;i++)t[i]=t[i-1]+e[i][1];const s=[`if (yC < ${t[0]}) setOutput(getT0(yR, yC));`];for(let i=1;i<t.length;i++){const a=t[i-1];s.push(`else if (yC < ${t[i]}) setOutput(getT${i}(yR, yC-${a}));`)}const o=t.length,r=t[t.length-1];s.push(`else setOutput(getT${o}(yR, yC-${r}));`),this.userCode=`
      void main() {
        ivec2 coords = getOutputCoords();
        int yR = coords.x;
        int yC = coords.y;

        ${s.join(`
        `)}
      }
    `}}class Az{constructor(e,t){this.packedInputs=!0,this.packedOutput=!0,this.outputShape=[],this.outputShape=Mn(e,t);const s=this.outputShape,o=s.length,r=Oe(o),i=Lt("coords",o),a=["x","y","z","w","u","v"].slice(0,o);this.variableNames=e.map((m,g)=>`T${g}`);const l=new Array(e.length-1);l[0]=e[0][t];for(let m=1;m<l.length;m++)l[m]=l[m-1]+e[m][t];const c=a[t],u=a.slice(-2),h=a.join();let d=`if (${c} < ${l[0]}) {
        return getChannel(
            getT0(${h}), vec2(${u.join()}));
        }`;for(let m=1;m<l.length;m++){const g=l[m-1];d+=`
        if (${c} < ${l[m]}  && ${c} >= ${l[m-1]}) {
          return getChannel(
            getT${m}(${$c(a,c,g)}),
            vec2(${$c(u,c,g)}));
        }`}const p=l.length,f=l[l.length-1];d+=`
        return getChannel(
          getT${p}(${$c(a,c,f)}),
          vec2(${$c(u,c,f)}));`,this.userCode=`
      float getValue(${a.map(m=>"int "+m)}) {
        ${d}
      }

      void main() {
        ${r} coords = getOutputCoords();
        vec4 result = vec4(getValue(${i}), 0., 0., 0.);

        ${i[o-1]} = ${i[o-1]} + 1;
        if (${i[o-1]} < ${s[o-1]}) {
          result.g = getValue(${i});
        }

        ${i[o-2]} = ${i[o-2]} + 1;
        if (${i[o-2]} < ${s[o-2]}) {
          result.a = getValue(${i});
        }

        ${i[o-1]} = ${i[o-1]} - 1;
        if (${i[o-2]} < ${s[o-2]} &&
            ${i[o-1]} < ${s[o-1]}) {
          result.b = getValue(${i});
        }
        setOutput(result);
      }
    `}}function $c(n,e,t){const s=n.indexOf(e);return n.map((r,i)=>i===s?`${r} - ${t}`:r).join()}function kc(n){const{inputs:e,backend:t}=n,{input:s}=e,o=t.texData.get(s.dataId);return Xt({inputs:{x:o.complexTensorInfos.imag},backend:t})}const Dz={kernelName:fu,backendName:"webgl",kernelFunc:kc};function ji(n,e,t){const s=n[0].dtype;if(s==="complex64"){const p=n.map(b=>qi({inputs:{input:b},backend:t})),f=n.map(b=>kc({inputs:{input:b},backend:t})),m=ji(p,e,t),g=ji(f,e,t),x=As({inputs:{real:m,imag:g},backend:t});return p.forEach(b=>t.disposeIntermediateTensorInfo(b)),f.forEach(b=>t.disposeIntermediateTensorInfo(b)),t.disposeIntermediateTensorInfo(m),t.disposeIntermediateTensorInfo(g),x}let o=t.shouldExecuteOnCPU(n);if(s==="string"&&(o=!0),o){const p=n.map(y=>{const $=[-1,q(y.shape.slice(e))];return ne({inputs:{x:y},backend:t,attrs:{shape:$}})}),f=p.map(y=>({vals:t.readSync(y.dataId),shape:y.shape})),m=Mn(p.map(y=>y.shape),1),g=p[0].shape[0]===1,x=vP(f,m,s,g),b=Mn(n.map(y=>y.shape),e),w=t.makeTensorInfo(b,s,x);return p.forEach(y=>t.disposeIntermediateTensorInfo(y)),w}const r=n.filter(p=>q(p.shape)>0),i=V().getBool("WEBGL_PACK_ARRAY_OPERATIONS")&&r[0].shape.length>1;if(r.length===1){const p=i?new jn(n[0].shape,Es):new Rs(n[0].shape,Es);return t.runWebGLProgram(p,n,s)}const a=V().getNumber("WEBGL_MAX_TEXTURES_IN_SHADER");if(r.length>a){const p=[];for(let m=0;m<r.length;m+=a){const g=r.slice(m,m+a);p.push(ji(g,e,t))}const f=ji(p,e,t);for(const m of p)t.disposeIntermediateTensorInfo(m);return f}if(i){const p=new Az(r.map(f=>f.shape),e);return t.runWebGLProgram(p,r,s)}const{tensors2D:l,outShape:c}=Fz(r,e,t),u=new Rz(l.map(p=>p.shape)),h=t.runWebGLProgram(u,l,s);l.forEach(p=>t.disposeIntermediateTensorInfo(p));const d=ne({inputs:{x:h},attrs:{shape:c},backend:t});return t.disposeIntermediateTensorInfo(h),d}function Fz(n,e,t){const s=Mn(n.map(r=>r.shape),e);return{tensors2D:n.map(r=>ne({inputs:{x:r},attrs:{shape:[-1,q(r.shape.slice(e))]},backend:t})),outShape:s}}function wy(n){const{inputs:e,backend:t,attrs:s}=n,{axis:o}=s,r=Ce(o,e[0].shape)[0],i=e.map(c=>c.shape);Mh(i,r);const a=Mn(e.map(c=>c.shape),r);if(q(a)===0)return t.makeTensorInfo(a,e[0].dtype,[]);const l=e.filter(c=>q(c.shape)>0);return l.length===1?Xt({inputs:{x:l[0]},backend:t}):ji(l,r,t)}const _z={kernelName:aa,backendName:"webgl",kernelFunc:wy};class Cy{constructor(e,t=!1,s=null,o=!1,r=!1){this.variableNames=["x","W"],this.outputShape=e.outShape;const i=e.padInfo.top,a=e.padInfo.left,l=e.strideHeight,c=e.strideWidth,u=e.dilationHeight,h=e.dilationWidth,d=e.filterHeight,p=e.filterWidth,f=Math.floor(e.inChannels/4)*4,m=e.inChannels%4,g=e.dataFormat==="channelsLast",x=g?1:2,b=g?2:3,w=g?3:1;let y="",C="";s&&(o?y=`float activation(float a) {
          float b = getPreluActivationWeightsAtOutCoords();
          ${s}
        }`:r?y=`float activation(float a) {
          float b = getLeakyreluAlphaAtOutCoords();
          ${s}
        }`:y=`
          float activation(float x) {
            ${s}
          }
        `,C="result = activation(result);");const $=t?"result += getBiasAtOutCoords();":"";t&&this.variableNames.push("bias"),o&&this.variableNames.push("preluActivationWeights"),r&&this.variableNames.push("leakyreluAlpha"),this.userCode=`
      ${y}

      const ivec2 strides = ivec2(${l}, ${c});
      const ivec2 pads = ivec2(${i}, ${a});

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords[0];
        int d2 = coords[${w}];

        ivec2 xRCCorner =
            ivec2(coords[${x}], coords[${b}]) * strides - pads;
        int xRCorner = xRCCorner.x;
        int xCCorner = xRCCorner.y;

        // Convolve x(?, ?, d1) with w(:, :, d1, d2) to get y(yR, yC, d2).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;
        for (int wR = 0; wR < ${d}; wR++) {
          int xR = xRCorner + wR * ${u};

          if (xR < 0 || xR >= ${e.inHeight}) {
            continue;
          }

          for (int wC = 0; wC < ${p}; wC++) {
            int xC = xCCorner + wC * ${h};

            if (xC < 0 || xC >= ${e.inWidth}) {
              continue;
            }

            for (int d1 = 0; d1 < ${f}; d1 += 4) {
              vec4 wValues = vec4(
                getW(wR, wC, d1, d2),
                getW(wR, wC, d1 + 1, d2),
                getW(wR, wC, d1 + 2, d2),
                getW(wR, wC, d1 + 3, d2)
              );

              if (${g}) {
                vec4 xValues = vec4(
                  getX(batch, xR, xC, d1),
                  getX(batch, xR, xC, d1 + 1),
                  getX(batch, xR, xC, d1 + 2),
                  getX(batch, xR, xC, d1 + 3)
                );
                dotProd += dot(xValues, wValues);
              } else {
                vec4 xValues = vec4(
                  getX(batch, d1, xR, xC),
                  getX(batch, d1 + 1, xR, xC),
                  getX(batch, d1 + 2, xR, xC),
                  getX(batch, d1 + 3, xR, xC)
                );
                dotProd += dot(xValues, wValues);
              }
            }

            if (${m===1}) {

              if (${g}) {
                dotProd +=
                    getX(batch, xR, xC, ${f}) *
                    getW(wR, wC, ${f}, d2);
              } else {
                dotProd +=
                    getX(batch, ${f}, xR, xC) *
                    getW(wR, wC, ${f}, d2);
              }

            } else if (${m===2}) {
              vec2 wValues = vec2(
                getW(wR, wC, ${f}, d2),
                getW(wR, wC, ${f} + 1, d2)
              );

              if (${g}) {
                vec2 xValues = vec2(
                  getX(batch, xR, xC, ${f}),
                  getX(batch, xR, xC, ${f} + 1)
                );
                dotProd += dot(xValues, wValues);
              } else {
                vec2 xValues = vec2(
                  getX(batch, ${f}, xR, xC),
                  getX(batch, ${f} + 1, xR, xC)
                );
                dotProd += dot(xValues, wValues);
              }

            } else if (${m===3}) {
              vec3 wValues = vec3(
                getW(wR, wC, ${f}, d2),
                getW(wR, wC, ${f} + 1, d2),
                getW(wR, wC, ${f} + 2, d2)
              );

              if (${g}) {
                vec3 xValues = vec3(
                  getX(batch, xR, xC, ${f}),
                  getX(batch, xR, xC, ${f} + 1),
                  getX(batch, xR, xC, ${f} + 2)
                );
                dotProd += dot(xValues, wValues);
              } else {
                vec3 xValues = vec3(
                  getX(batch, ${f}, xR, xC),
                  getX(batch, ${f} + 1, xR, xC),
                  getX(batch, ${f} + 2, xR, xC)
                );
                dotProd += dot(xValues, wValues);
              }

            }
          }
        }

        float result = dotProd;
        ${$}
        ${C}
        setOutput(result);
      }
    `}}class Oz{constructor(e){this.variableNames=["x","W"],this.outputShape=e.outShape;const t=e.padInfo.front,s=e.padInfo.top,o=e.padInfo.left,r=e.strideDepth,i=e.strideHeight,a=e.strideWidth,l=e.dilationDepth,c=e.dilationHeight,u=e.dilationWidth,h=e.filterDepth,d=e.filterHeight,p=e.filterWidth,f=Math.floor(e.inChannels/4)*4,m=e.inChannels%4;this.userCode=`
      const ivec3 strides = ivec3(${r}, ${i}, ${a});
      const ivec3 pads = ivec3(${t}, ${s}, ${o});

      void main() {
        ivec5 coords = getOutputCoords();
        int batch = coords.x;
        int d2 = coords.u;

        ivec3 xFRCCorner = ivec3(coords.y, coords.z, coords.w) * strides - pads;
        int xFCorner = xFRCCorner.x;
        int xRCorner = xFRCCorner.y;
        int xCCorner = xFRCCorner.z;

        // Convolve x(?, ?, ?, d1) with w(:, :, :, d1, d2) to get
        // y(yF, yR, yC, d2). ? = to be determined. : = across all
        // values in that axis.
        float dotProd = 0.0;
        for (int wF = 0; wF < ${h}; wF++) {
          int xF = xFCorner + wF * ${l};

          if (xF < 0 || xF >= ${e.inDepth}) {
            continue;
          }

          for (int wR = 0; wR < ${d}; wR++) {
            int xR = xRCorner + wR * ${c};

            if (xR < 0 || xR >= ${e.inHeight}) {
              continue;
            }

            for (int wC = 0; wC < ${p}; wC++) {
              int xC = xCCorner + wC * ${u};

              if (xC < 0 || xC >= ${e.inWidth}) {
                continue;
              }

              for (int d1 = 0; d1 < ${f}; d1 += 4) {
                vec4 xValues = vec4(
                  getX(batch, xF, xR, xC, d1),
                  getX(batch, xF, xR, xC, d1 + 1),
                  getX(batch, xF, xR, xC, d1 + 2),
                  getX(batch, xF, xR, xC, d1 + 3)
                );
                vec4 wValues = vec4(
                  getW(wF, wR, wC, d1, d2),
                  getW(wF, wR, wC, d1 + 1, d2),
                  getW(wF, wR, wC, d1 + 2, d2),
                  getW(wF, wR, wC, d1 + 3, d2)
                );

                dotProd += dot(xValues, wValues);
              }

              if (${m===1}) {
                dotProd +=
                  getX(batch, xF, xR, xC, ${f}) *
                  getW(wF, wR, wC, ${f}, d2);
              } else if (${m===2}) {
                vec2 xValues = vec2(
                  getX(batch, xF, xR, xC, ${f}),
                  getX(batch, xF, xR, xC, ${f} + 1)
                );
                vec2 wValues = vec2(
                  getW(wF, wR, wC, ${f}, d2),
                  getW(wF, wR, wC, ${f} + 1, d2)
                );
                dotProd += dot(xValues, wValues);
              } else if (${m===3}) {
                vec3 xValues = vec3(
                  getX(batch, xF, xR, xC, ${f}),
                  getX(batch, xF, xR, xC, ${f} + 1),
                  getX(batch, xF, xR, xC, ${f} + 2)
                );
                vec3 wValues = vec3(
                  getW(wF, wR, wC, ${f}, d2),
                  getW(wF, wR, wC, ${f} + 1, d2),
                  getW(wF, wR, wC, ${f} + 2, d2)
                );
                dotProd += dot(xValues, wValues);
              }
            }
          }
        }
        setOutput(dotProd);
      }
    `}}class Iy{constructor(e,t=!1,s=null,o=!1,r=!1){this.variableNames=["x","W"],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:"pads",type:"ivec2"},{name:"strides",type:"ivec2"},{name:"dilations",type:"ivec2"},{name:"inDims",type:"ivec2"}],this.outputShape=e.outShape,this.enableShapeUniforms=At(this.outputShape.length);const i=e.padInfo.left,a=e.strideWidth,l=e.dilationWidth,c=e.filterHeight,u=e.filterWidth,h=u;let d=`
       int xR; int xC; int xCOffset;
       vec4 wTexel; vec4 previous; vec4 final;`;for(let g=0;g<u;g++)d+=`
           vec4 xTexelC${g*2};
           int xTexelC${g*2}Ready;
           vec4 xTexelC${g*2+1};
           int xTexelC${g*2+1}Ready;
           vec4 xC${g};`;d+=`
     for (int r = 0; r < ${c}; r++) {
      for (int d1 = 0; d1 < ${e.inChannels}; d1 += 2) {
       `;for(let g=0;g<u;g++)d+=`
           xTexelC${g*2} = vec4(0.0);
           xTexelC${g*2}Ready = 0;
           xTexelC${g*2+1} = vec4(0.0);
           xTexelC${g*2+1}Ready = 0;
           xC${g} = vec4(0.0);`;d+=`
         xR = xRCorner + r * dilations[0];
         if (xR >=0 && xR < inDims[0]) {
       `;for(let g=0;g<(h+1)/2;g++){const x=g*2;if(d+=`
           xC = xCCorner + ${x*l};
           `,a===1){if(x<u&&(i%2===1?(d+=`
                 xCOffset = xC + 1;
                 if (xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${x}Ready == 0) {
                   xTexelC${x} = getX(batch, xR, xCOffset, d1);

                   // Need to manually clear unused channels in case
                   // we're reading from recycled texture.
                   if (xCOffset + 1 >= inDims[1]) {
                     xTexelC${x}.zw = vec2(0.0);
                   }
                   xTexelC${x}Ready = 1;
                 }
               `,l===1&&x>0?d+=`
                 xC${x} = vec4(xTexelC${x-2}.zw, xTexelC${x}.xy);
                 `:d+=`
                   xCOffset = xC + 1 - 2;

                   if (xCOffset >= 0 && xCOffset < inDims[1]) {
                     previous = getX(batch, xR, xCOffset, d1);

                     // Need to manually clear unused channels in case
                     // we're reading from recycled texture.
                     if (xCOffset + 1 >= inDims[1]) {
                       previous.zw = vec2(0.0);
                     }

                     xC${x} = vec4(previous.zw, xTexelC${x}.xy);
                   } else {
                     xC${x} = vec4(0.0, 0.0, xTexelC${x}.xy);
                   }
                   `):d+=`
                 if (xC >= 0 && xC < inDims[1] && xTexelC${x}Ready == 0) {
                   xTexelC${x} = getX(batch, xR, xC, d1);
                   if (xC + 1 >= inDims[1]) {
                     xTexelC${x}.zw = vec2(0.0);
                   }
                   xTexelC${x}Ready = 1;
                 }

                 xC${x} = xTexelC${x};
                 `,x+1<u)){const b=i%2===0?mn(l):l;l%2===0&&i%2===1||l%2!==0&&i%2!==1?(d+=`
                   xCOffset = xC + imod(pads[1], 2) + ${b};

                   if (xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${x+1}Ready == 0) {
                     xTexelC${x+1} = getX(batch, xR, xCOffset, d1);

                     // Need to manually clear unused channels in case
                     // we're reading from recycled texture.
                     if (xCOffset + 1 >= inDims[1]) {
                       xTexelC${x+1}.zw = vec2(0.0);
                     }
                     xTexelC${x+1}Ready = 1;
                   }
                   `,l>1?d+=`
                     xCOffset -= 2;
                     if (xCOffset >= 0 && xCOffset < inDims[1]) {
                      previous = getX(batch, xR, xCOffset, d1);
                      xC${x+1} = vec4(previous.zw, xTexelC${x+1}.xy);
                     } else {
                      xC${x+1} = vec4(0.0, 0.0, xTexelC${x+1}.xy);
                     }
                     `:d+=`
                     xC${x+1} = vec4(xTexelC${x}.zw, xTexelC${x+1}.xy);
                     `):b===1?d+=`
                     xC${x+1} = xTexelC${x};
                     `:d+=`
                     xCOffset = xC + ${b};

                     if (xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${x+1}Ready == 0) {
                       xTexelC${x+1} = getX(batch, xR, xCOffset, d1);
                       if (xCOffset + 1 >= inDims[1]) {
                         xTexelC${x+1}.zw = vec2(0.0);
                       }
                       xTexelC${x+1}Ready = 1;
                     }

                     xC${x+1} = xTexelC${x+1};
                     `}}else x<u&&(i%2===1?(d+=`
                 xCOffset = xC + 1 - strides[1];
                 if(xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${x}Ready == 0) {
                   xTexelC${x} = getX(batch, xR, xCOffset, d1);
                   // Need to manually clear unused channels in case
                   // we're reading from recycled texture.
                   if (xCOffset + 1 >= inDims[1]) {
                     xTexelC${x}.zw = vec2(0.0);
                   }
                   xTexelC${x}Ready = 1;
                 }

                 if(xC + 1 >= 0 && xC + 1 < inDims[1] && xTexelC${x+1}Ready == 0) {
                   xTexelC${x+1} = getX(batch, xR, xC + 1, d1);
                   // Need to manually clear unused channels in case
                   // we're reading from recycled texture.
                   if (xC + 2 >= inDims[1]) {
                     xTexelC${x+1}.zw = vec2(0.0);
                   }
                   xTexelC${x+1}Ready = 1;
                 }

                 xC${x} = vec4(xTexelC${x}.zw, xTexelC${x+1}.zw);
               `,x+1<u&&(d+=`
                   final = vec4(0.0);
                   xCOffset = xC + 1 + strides[1];
                   if(xCOffset >= 0 && xCOffset < inDims[1]) {
                     final = getX(batch, xR, xCOffset, d1);
                   }
                   xC${x+1} = vec4(xTexelC${x+1}.xy, final.xy);
                 `)):(d+=`
                 if(xC >= 0 && xC < inDims[1] && xTexelC${x}Ready == 0) {
                   xTexelC${x} = getX(batch, xR, xC, d1);
                   if (xC + 1 >= inDims[1]) {
                     xTexelC${x}.zw = vec2(0.0);
                   }
                   xTexelC${x}Ready = 1;
                 }

                 xCOffset = xC + strides[1];
                 if(xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${x+1}Ready == 0) {
                   xTexelC${x+1} = getX(batch, xR, xCOffset, d1);
                   if (xCOffset + 1 >= inDims[1]) {
                     xTexelC${x+1}.zw = vec2(0.);
                   }
                   xTexelC${x+1}Ready = 1;
                 }

                 xC${x} = vec4(
                   xTexelC${x}.xy, xTexelC${x+1}.xy);
               `,x+1<u&&(d+=`
                   xC${x+1} = vec4(xTexelC${x}.zw, xTexelC${x+1}.zw);
                 `)));x<u&&(d+=`
             wTexel = getW(r, ${x}, d1, d2);
             dotProd += xC${x}.xxzz * vec4(wTexel.xy, wTexel.xy);
             if(d1 + 1 < ${e.inChannels}) {
               dotProd += xC${x}.yyww * vec4(wTexel.zw, wTexel.zw);
             }
           `,x+1<u&&(d+=`
               wTexel = getW(r, ${x+1}, d1, d2);
               dotProd += xC${x+1}.xxzz * vec4(wTexel.xy, wTexel.xy);
               if(d1 + 1 < ${e.inChannels}) {
                 dotProd += xC${x+1}.yyww * vec4(wTexel.zw, wTexel.zw);
               }
             `))}d+=`
     }
   `,d+=`
     }
   `,d+=`
     }
   `;let p="",f="";s&&(o?p=`vec4 activation(vec4 a) {
           vec4 b = getPreluActivationWeightsAtOutCoords();
           ${s}
         }`:r?p=`vec4 activation(vec4 a) {
           vec4 b = getLeakyreluAlphaAtOutCoords();
           ${s}
         }`:p=`vec4 activation(vec4 x) {
           ${s}
         }`,f="result = activation(result);");const m=t?"result += getBiasAtOutCoords();":"";t&&this.variableNames.push("bias"),o&&this.variableNames.push("preluActivationWeights"),r&&this.variableNames.push("leakyreluAlpha"),this.userCode=`
       ${p}

       void main() {
         ivec4 coords = getOutputCoords();
         int batch = coords.x;
         ivec2 xRCCorner = coords.yz * strides - pads;
         int d2 = coords.w;
         int xRCorner = xRCCorner.x;
         int xCCorner = xRCCorner.y;

         //intialize dotProd with a small epsilon seems to reduce GPU accuracy loss.
         vec4 dotProd = vec4(0.000000000000001);

         ${d}

         vec4 result = dotProd - vec4(0.000000000000001);
         ${m}
         ${f}
         setOutput(result);
       }
     `}}class Lz{constructor(e,t){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:"inputShape",type:"ivec4"},{name:"pad",type:"ivec2"},{name:"stride",type:"ivec2"},{name:"dilation",type:"ivec2"},{name:"inChannels",type:"int"},{name:"itemsPerBlockRow",type:"int"},{name:"outWidth",type:"int"}],this.outputShape=e,this.enableShapeUniforms=At(this.outputShape.length);const{dataFormat:s}=t,o=Ot(),r=s==="channelsLast",i=r?1:2,a=r?2:3,l=this.enableShapeUniforms?"if(blockIndex < outShape[2] && pos < outShape[1]) {":`if(blockIndex < ${e[2]} && pos < ${e[1]}) {`;let c="";for(let u=0;u<=1;u++)for(let h=0;h<=1;h++)c+=`
          blockIndex = rc.z + ${h};
          pos = rc.y + ${u};

          ${l}
            offsetY = int(blockIndex / outWidth) * stride[0] - pad[0];
            d0 = offsetY + dilation[0] * (pos / itemsPerBlockRow);

            if(d0 < inputShape[${i}] && d0 >= 0) {
              // Use custom imod instead mod. On Intel GPU, mod may generate
              // unexpected value.
              // https://github.com/tensorflow/tfjs/issues/5447
              offsetX = imod(blockIndex, outWidth) * stride[1] - pad[1];
              d1 = offsetX + dilation[1] * (imod(pos, itemsPerBlockRow) /
                  inChannels);

              if(d1 < inputShape[${a}] && d1 >= 0) {

                ch = imod(pos, inChannels);

                if (${r}) {
                  innerDims = vec2(d1, ch);
                  result[${u*2+h}] = getChannel(
                    getA(rc.x, d0, int(innerDims.x),
                    int(innerDims.y)), innerDims);
                } else {
                  innerDims = vec2(d0, d1);
                  result[${u*2+h}] = getChannel(
                    getA(rc.x, ch, int(innerDims.x),
                    int(innerDims.y)), innerDims);
                }
              }
            }
          }
        `;this.userCode=`
      void main() {
        ivec3 rc = getOutputCoords();

        vec4 result = vec4(0);

        int blockIndex, pos, offsetY, d0, offsetX, d1, ch;
        vec2 innerDims;

        ${c}

        ${o.output} = result;
      }
    `}}function vc(n,e){const t=n.length;return t>=3?e?[...n.slice(0,-3),n[t-3]*n[t-2],n[t-1]]:[...n.slice(0,-3),n[t-3],n[t-2]*n[t-1]]:!e&&t===1&&n[0]>1?[n[0],1]:null}function $y({x:n,filter:e,convInfo:t,backend:s,bias:o=null,preluActivationWeights:r=null,leakyreluAlpha:i=0,activation:a=null}){const l=n.shape,c=s.texData.get(n.dataId),u=t.inChannels,h=l[0]*l[1]*l[2],d=t.outChannels,p=t.dataFormat==="channelsLast",f=!1,m=!1;let g;const x=[];if(r!=null){const y=vc(r.shape,p);y!=null&&(r=ne({inputs:{x:r},backend:s,attrs:{shape:y}}),x.push(r))}if(o!=null){const y=vc(o.shape,p);y!=null&&(o=ne({inputs:{x:o},backend:s,attrs:{shape:y}}),x.push(o))}if(!((h===1||d===1)&&u>hy)&&c.isPacked&&p&&c.texture!=null&&l[2]%2!==0&&Ee(c.shape.slice(-3),l.slice(-3))){const y=l[0]*l[1]*(l[2]+1),C={dataId:n.dataId,shape:[1,y,t.inChannels],dtype:n.dtype},$=c.shape;c.shape=c.shape.slice(),c.shape[c.shape.length-2]++,k(mc(c.shape,C.shape),()=>`packed reshape ${c.shape} to ${C.shape} isn't free`);const N=ne({inputs:{x:e},backend:s,attrs:{shape:[1,t.inChannels,t.outChannels]}});x.push(N);const T=Cc({a:C,b:N,backend:s,transposeA:f,transposeB:m,bias:o,activation:a,preluActivationWeights:r,leakyreluAlpha:i}),S=s.texData.get(T.dataId);k(S.isPacked,()=>"batchMatMul result is expected to be packed"),c.shape=$,S.shape=t.outShape,g=Xt({inputs:{x:T},backend:s}),g.shape=t.outShape,x.push(T)}else{const y=t.outHeight*t.outWidth,C=ne({inputs:{x:n},backend:s,attrs:{shape:p?[t.batchSize,y,t.inChannels]:[t.batchSize,t.inChannels,y]}}),$=ne({inputs:{x:e},backend:s,attrs:{shape:[1,t.inChannels,t.outChannels]}}),N=Cc({a:p?C:$,b:p?$:C,transposeA:!p,transposeB:m,backend:s,bias:o,activation:a,preluActivationWeights:r,leakyreluAlpha:i});g=ne({inputs:{x:N},backend:s,attrs:{shape:t.outShape}}),x.push(C),x.push($),x.push(N)}for(const y of x)s.disposeIntermediateTensorInfo(y);return g}function ky({x:n,filter:e,convInfo:t,backend:s,bias:o=null,preluActivationWeights:r=null,leakyreluAlpha:i=0,activation:a=null}){const{filterWidth:l,filterHeight:c,inChannels:u,outWidth:h,outHeight:d,dataFormat:p}=t,f=p==="channelsLast",m=l*c*u,g=d*h,x=[t.batchSize,m,g],b=!0,w=!1,y=[];if(r!=null){const W=vc(r.shape,f);W!=null&&(r=ne({inputs:{x:r},backend:s,attrs:{shape:W}}),y.push(r))}if(o!=null){const W=vc(o.shape,f);W!=null&&(o=ne({inputs:{x:o},backend:s,attrs:{shape:W}}),y.push(o))}const C=ne({inputs:{x:e},backend:s,attrs:{shape:[1,m,q(e.shape)/m]}});y.push(C);const $=new Lz(x,t),N=[n.shape,[t.padInfo.top,t.padInfo.left],[t.strideHeight,t.strideWidth],[t.dilationHeight,t.dilationWidth],[t.inChannels],[t.filterWidth*t.inChannels],[t.outWidth]],T=s.runWebGLProgram($,[n],"float32",N),S=ne({inputs:{x:T},backend:s,attrs:{shape:x}});y.push(T),y.push(S);const v=o!=null,I=r!=null,R=a==="leakyrelu",F=a?Gi(a,!0):null,O=new iy(f?S.shape:C.shape,f?C.shape:S.shape,f?[t.batchSize,g,t.outChannels]:[t.batchSize,t.outChannels,g],b,w,v,F,I,R),L=f?[S,C]:[C,S];if(o&&L.push(o),I&&L.push(r),R){const W=s.makeTensorInfo([],"float32",cs(i,"float32"));L.push(W),y.push(W)}const z=s.runWebGLProgram(O,L,"float32"),U=ne({inputs:{x:z},backend:s,attrs:{shape:t.outShape}});y.push(z);for(const W of y)s.disposeIntermediateTensorInfo(W);return U}function Mz(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,filter:r}=e,{strides:i,pad:a,dataFormat:l,dilations:c,dimRoundingMode:u}=s,h=Zn(l),d=yt(o.shape,r.shape,i,c,a,u,!1,h);let p;if(d.filterHeight===1&&d.filterWidth===1&&d.dilationHeight===1&&d.dilationWidth===1&&d.strideHeight===1&&d.strideWidth===1&&(d.padInfo.type==="SAME"||d.padInfo.type==="VALID"))p=$y({x:o,filter:r,convInfo:d,backend:t});else if(d.strideWidth<=2&&h==="channelsLast"&&V().getBool("WEBGL_EXP_CONV")){const m=new Iy(d),g=[[d.padInfo.top,d.padInfo.left],[d.strideHeight,d.strideWidth],[d.dilationHeight,d.dilationWidth],[d.inHeight,d.inWidth]];p=t.runWebGLProgram(m,[o,r],"float32",g)}else if(V().getBool("WEBGL_CONV_IM2COL"))p=ky({x:o,filter:r,convInfo:d,backend:t});else{const m=new Cy(d);p=t.runWebGLProgram(m,[o,r],"float32")}const f=ne({inputs:{x:p},backend:t,attrs:{shape:d.outShape}});return t.disposeIntermediateTensorInfo(p),f}const Pz={kernelName:la,backendName:"webgl",kernelFunc:Mz};class Bz{constructor(e){this.variableNames=["x","dy"],this.outputShape=e.filterShape;const t=e.strideHeight,s=e.strideWidth,o=e.padInfo.top,r=e.padInfo.left,i=e.dataFormat==="channelsLast";this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int wR = coords.x;
        int wC = coords.y;
        int d1 = coords.z;
        int d2 = coords.w;

        // Convolve x(?, ?, d1) with dy(:, :, d2) to get dw(wR, wC, d1, d2).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;

        for (int b = 0; b < ${e.batchSize}; b++) {
          for (int yR = 0; yR < ${e.outHeight}; yR++) {
            int xR = wR + yR * ${t} - ${o};

            if (xR < 0 || xR >= ${e.inHeight}) {
              continue;
            }

            for (int yC = 0; yC < ${e.outWidth}; yC++) {
              int xC = wC + yC * ${s} - ${r};

              if (xC < 0 || xC >= ${e.inWidth}) {
                continue;
              }

              ${i?`float dyValue = getDy(b, yR, yC, d2);
              float xValue = getX(b, xR, xC, d1);
              dotProd += (xValue * dyValue);`:`float dyValue = getDy(b, d2, yR, yC);
              float xValue = getX(b, d1, xR, xC);
              dotProd += (xValue * dyValue);`}
            }
          }
        }
        setOutput(dotProd);
      }
    `}}class zz{constructor(e){this.variableNames=["dy","W"],this.outputShape=e.inShape;const t=e.filterHeight,s=e.filterWidth,o=e.strideHeight,r=e.strideWidth,i=e.dataFormat==="channelsLast",a=t-1-e.padInfo.top,l=s-1-e.padInfo.left,c=i?1:2,u=i?2:3,h=i?3:1;this.userCode=`
      const ivec2 pads = ivec2(${a}, ${l});

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords[0];
        int d1 = coords[${h}];

        ivec2 dyCorner = ivec2(coords[${c}], coords[${u}]) - pads;
        int dyRCorner = dyCorner.x;
        int dyCCorner = dyCorner.y;

        // Convolve dy(?, ?, d2) with w(:, :, d1, d2) to compute dx(xR, xC, d1).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;
        for (int wR = 0; wR < ${t}; wR++) {
          float dyR = float(dyRCorner + wR) / ${o}.0;

          if (dyR < 0.0 || dyR >= ${e.outHeight}.0 || fract(dyR) > 0.0) {
            continue;
          }
          int idyR = int(dyR);

          int wRPerm = ${t} - 1 - wR;

          for (int wC = 0; wC < ${s}; wC++) {
            float dyC = float(dyCCorner + wC) / ${r}.0;

            if (dyC < 0.0 || dyC >= ${e.outWidth}.0 ||
                fract(dyC) > 0.0) {
              continue;
            }
            int idyC = int(dyC);

            int wCPerm = ${s} - 1 - wC;

            for (int d2 = 0; d2 < ${e.outChannels}; d2++) {

              if (${i}) {
                float xValue = getDy(batch, idyR, idyC, d2);
                float wValue = getW(wRPerm, wCPerm, d1, d2);
                dotProd += xValue * wValue;
              } else {
                float xValue = getDy(batch, d2, idyR, idyC);
                float wValue = getW(wRPerm, wCPerm, d1, d2);
                dotProd += xValue * wValue;
              }

            }
          }
        }
        setOutput(dotProd);
      }
    `}}class Vz{constructor(e){this.variableNames=["x","dy"],this.outputShape=e.filterShape;const t=e.strideDepth,s=e.strideHeight,o=e.strideWidth,r=e.padInfo.front,i=e.padInfo.top,a=e.padInfo.left;this.userCode=`
      void main() {
        ivec5 coords = getOutputCoords();
        int wF = coords.x;
        int wR = coords.y;
        int wC = coords.z;
        int d1 = coords.w;
        int d2 = coords.u;

        float dotProd = 0.0;

        for (int b = 0; b < ${e.batchSize}; b++) {
          for (int yF = 0; yF < ${e.outDepth}; yF++) {
            int xF = wF + yF * ${t} - ${r};

            if (xF < 0 || xF >= ${e.inDepth}) {
              continue;
            }

            for (int yR = 0; yR < ${e.outHeight}; yR++) {
              int xR = wR + yR * ${s} - ${i};

              if (xR < 0 || xR >= ${e.inHeight}) {
                continue;
              }

              for (int yC = 0; yC < ${e.outWidth}; yC++) {
                int xC = wC + yC * ${o} - ${a};

                if (xC < 0 || xC >= ${e.inWidth}) {
                  continue;
                }

                float dyValue = getDy(b, yF, yR, yC, d2);
                float xValue = getX(b, xF, xR, xC, d1);
                dotProd += (xValue * dyValue);
              }
            }
          }
        }
        setOutput(dotProd);
      }
    `}}class Wz{constructor(e){this.variableNames=["dy","W"],this.outputShape=e.inShape;const t=e.filterDepth,s=e.filterHeight,o=e.filterWidth,r=e.strideDepth,i=e.strideHeight,a=e.strideWidth,l=t-1-e.padInfo.front,c=s-1-e.padInfo.top,u=o-1-e.padInfo.left;this.userCode=`
      const ivec3 pads = ivec3(${l}, ${c}, ${u});

      void main() {
        ivec5 coords = getOutputCoords();
        int batch = coords.x;
        int d1 = coords.u;


        ivec3 dyCorner = ivec3(coords.y, coords.z, coords.w) - pads;
        int dyFCorner = dyCorner.x;
        int dyRCorner = dyCorner.y;
        int dyCCorner = dyCorner.z;

        float dotProd = 0.0;
        for (int wF = 0; wF < ${t}; wF++) {
          float dyF = float(dyFCorner + wF) / ${r}.0;

          if (dyF < 0.0 || dyF >= ${e.outDepth}.0 || fract(dyF) > 0.0) {
            continue;
          }
          int idyF = int(dyF);

          int wFPerm = ${t} - 1 - wF;

          for (int wR = 0; wR < ${s}; wR++) {
            float dyR = float(dyRCorner + wR) / ${i}.0;

            if (dyR < 0.0 || dyR >= ${e.outHeight}.0 ||
              fract(dyR) > 0.0) {
              continue;
            }
            int idyR = int(dyR);

            int wRPerm = ${s} - 1 - wR;

            for (int wC = 0; wC < ${o}; wC++) {
              float dyC = float(dyCCorner + wC) / ${a}.0;

              if (dyC < 0.0 || dyC >= ${e.outWidth}.0 ||
                  fract(dyC) > 0.0) {
                continue;
              }
              int idyC = int(dyC);

              int wCPerm = ${o} - 1 - wC;

              for (int d2 = 0; d2 < ${e.outChannels}; d2++) {
                float xValue = getDy(batch, idyF, idyR, idyC, d2);
                float wValue = getW(wFPerm, wRPerm, wCPerm, d1, d2);
                dotProd += xValue * wValue;
              }
            }
          }
        }
        setOutput(dotProd);
      }
    `}}function Uz(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,dy:r}=e,{strides:i,pad:a,dataFormat:l,dimRoundingMode:c,filterShape:u}=s,h=Zn(l),d=yt(o.shape,u,i,1,a,c,!1,h),p=new Bz(d);return t.runWebGLProgram(p,[o,r],"float32")}const Gz={kernelName:Zc,backendName:"webgl",kernelFunc:Uz};class Hz{constructor(e){this.variableNames=["dy","W"],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:"strides",type:"vec2"}],this.outputShape=e.inShape,this.enableShapeUniforms=At(this.outputShape.length);const t=e.filterHeight,s=e.filterWidth,o=t-1-e.padInfo.top,r=s-1-e.padInfo.left;this.userCode=`
      const ivec2 pads = ivec2(${o}, ${r});

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords[0];
        int d1 = coords[3];

        ivec2 dyCorner = ivec2(coords[1], coords[2]) - pads;
        int dyRCorner = dyCorner.x;
        int dyCCorner = dyCorner.y;

        vec4 result = vec4(0.);
        for (int wR = 0; wR < ${t}; wR++) {
          float dyR = float(dyRCorner + wR) / strides[0];
          if (dyR < 0.0 || dyR >= ${e.outHeight}.0 || fract(dyR) > 0.0) {
            continue;
          }
          int idyR = int(dyR);
          int wRPerm = ${t} - 1 - wR;

          for (int wC = 0; wC < ${s}; wC++) {
            int wCPerm = ${s} - 1 - wC;

            float dyC = float(dyCCorner + wC) / strides[1];
            bool idyCVal = (dyC >= 0.0) && (dyC < ${e.outWidth}.0)
              && (fract(dyC) == 0.0);
            int idyC = int(dyC);

            float dyC2 = float(dyCCorner + wC + 1) / strides[1];
            bool idyCVal2 = (dyC2 >= 0.0) && (dyC2 < ${e.outWidth}.0)
              && (fract(dyC2) == 0.0);
            int idyC2 = int(dyC2);

            if (idyCVal && idyCVal2) {
              for (int d2 = 0; d2 < ${e.outChannels}; d2 += 2) {
                vec4 wValue = getW(wRPerm, wCPerm, d1, d2);
                vec4 dySample = getDy(batch, idyR, idyC, d2);
                vec4 dySample2 = (idyC / 2 == idyC2 / 2) ?
                  dySample : getDy(batch, idyR, idyC2, d2);

                vec2 dyValue = mod(float(idyC), 2.) == 0. ?
                  dySample.xy : dySample.zw;
                result.xy += vec2(dot(dyValue, wValue.xy),
                  dot(dyValue, wValue.zw));

                dyValue = mod(float(idyC2), 2.) == 0. ?
                  dySample2.xy : dySample2.zw;
                result.zw += vec2(dot(dyValue, wValue.xy),
                  dot(dyValue, wValue.zw));
              }
            } else if (idyCVal) {
              for (int d2 = 0; d2 < ${e.outChannels}; d2 += 2) {
                vec4 wValue = getW(wRPerm, wCPerm, d1, d2);
                vec4 dySample = getDy(batch, idyR, idyC, d2);
                vec2 dyValue = mod(float(idyC), 2.) == 0. ?
                  dySample.xy : dySample.zw;
                result.xy += vec2(dot(dyValue, wValue.xy),
                  dot(dyValue, wValue.zw));
              }
            } else if (idyCVal2) {
              for (int d2 = 0; d2 < ${e.outChannels}; d2 += 2) {
                vec4 wValue = getW(wRPerm, wCPerm, d1, d2);
                vec4 dySample = getDy(batch, idyR, idyC2, d2);
                vec2 dyValue = mod(float(idyC2), 2.) == 0. ?
                  dySample.xy : dySample.zw;
                result.zw += vec2(dot(dyValue, wValue.xy),
                  dot(dyValue, wValue.zw));
              }
            }
          }
        }
        setOutput(result);
      }
    `}}function qz(n){const{inputs:e,backend:t,attrs:s}=n,{dy:o,filter:r}=e,{inputShape:i,strides:a,pad:l,dataFormat:c,dimRoundingMode:u}=s,h=Zn(c),d=yt(i,r.shape,a,1,l,u,!1,h);if(V().getBool("WEBGL_PACK_CONV2DTRANSPOSE")&&h==="channelsLast"){const p=[[d.strideHeight,d.strideWidth]],f=new Hz(d);return t.runWebGLProgram(f,[o,r],"float32",p)}else{const p=new zz(d);return t.runWebGLProgram(p,[o,r],"float32")}}const jz={kernelName:ca,backendName:"webgl",kernelFunc:qz};function Kz(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,filter:r}=e,{strides:i,pad:a,dilations:l}=s,c=fs(o.shape,r.shape,i,l,a),u=new Oz(c);return t.runWebGLProgram(u,[o,r],"float32")}const Xz={kernelName:ua,backendName:"webgl",kernelFunc:Kz};function Yz(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,dy:r}=e,{strides:i,pad:a,filterShape:l}=s,c=fs(o.shape,l,i,1,a),u=new Vz(c);return t.runWebGLProgram(u,[o,r],"float32")}const Zz={kernelName:Qc,backendName:"webgl",kernelFunc:Yz};function Qz(n){const{inputs:e,backend:t,attrs:s}=n,{dy:o,filter:r}=e,{pad:i,strides:a,inputShape:l}=s,c=fs(l,r.shape,a,1,i),u=new Wz(c);return t.runWebGLProgram(u,[o,r],"float32")}const Jz={kernelName:Jc,backendName:"webgl",kernelFunc:Qz};const eV=sr+`
  return cos(x);
`,tV=`
  vec4 result = cos(x);
  bvec4 isNaN = isnan(x);
  ${xo}
  return result;
`,nV=Se({opSnippet:eV,packedOpSnippet:tV}),sV={kernelName:xr,backendName:"webgl",kernelFunc:nV};const oV=Se({opSnippet:`
  float e2x = exp(-x);
  return (e2x + 1.0 / e2x) / 2.0;
`}),rV={kernelName:br,backendName:"webgl",kernelFunc:oV};class iV{constructor(e,t,s,o,r){this.variableNames=["Image","Boxes","BoxInd"],this.outputShape=[];const[i,a,l,c]=e,[u]=t,[h,d]=s;this.outputShape=[u,h,d,c];const p=o==="bilinear"?1:0,[f,m]=[`${a-1}.0`,`${l-1}.0`],[g,x,b]=h>1?[`${(a-1)/(h-1)}`,"(y2-y1) * height_ratio",`y1*${f} + float(y)*(height_scale)`]:["0.0","0.0",`0.5 * (y1+y2) * ${f}`],[w,y,C]=d>1?[`${(l-1)/(d-1)}`,"(x2-x1) * width_ratio",`x1*${m} + float(x)*(width_scale)`]:["0.0","0.0",`0.5 * (x1+x2) * ${m}`];this.userCode=`
      const float height_ratio = float(${g});
      const float width_ratio = float(${w});
      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int y = coords[1];
        int x = coords[2];
        int d = coords[3];

        // get box vals
        float y1 = getBoxes(b,0);
        float x1 = getBoxes(b,1);
        float y2 = getBoxes(b,2);
        float x2 = getBoxes(b,3);

        // get image in batch index
        int bInd = round(getBoxInd(b));
        if(bInd < 0 || bInd >= ${i}) {
          return;
        }

        float height_scale = ${x};
        float width_scale = ${y};

        float in_y = ${b};
        if( in_y < 0.0 || in_y > ${f} ) {
          setOutput(float(${r}));
          return;
        }
        float in_x = ${C};
        if( in_x < 0.0 || in_x > ${m} ) {
          setOutput(float(${r}));
          return;
        }

        vec2 sourceFracIndexCR = vec2(in_x,in_y);
        if(${p} == 1) {
          // Compute the four integer indices.
          ivec2 sourceFloorCR = ivec2(sourceFracIndexCR);
          ivec2 sourceCeilCR = ivec2(ceil(sourceFracIndexCR));

          float topLeft = getImage(b, sourceFloorCR.y, sourceFloorCR.x, d);
          float bottomLeft = getImage(b, sourceCeilCR.y, sourceFloorCR.x, d);
          float topRight = getImage(b, sourceFloorCR.y, sourceCeilCR.x, d);
          float bottomRight = getImage(b, sourceCeilCR.y, sourceCeilCR.x, d);

          vec2 fracCR = sourceFracIndexCR - vec2(sourceFloorCR);

          float top = topLeft + (topRight - topLeft) * fracCR.x;
          float bottom = bottomLeft + (bottomRight - bottomLeft) * fracCR.x;
          float newValue = top + (bottom - top) * fracCR.y;
          setOutput(newValue);
        } else {
          // Compute the coordinators of nearest neighbor point.
          ivec2 sourceNearestCR = ivec2(floor(
            sourceFracIndexCR + vec2(0.5,0.5)));
          float newValue = getImage(b, sourceNearestCR.y, sourceNearestCR.x, d);
          setOutput(newValue);
        }
      }
    `}}const aV={kernelName:tu,backendName:"webgl",kernelFunc:n=>{const{inputs:e,backend:t,attrs:s}=n,{image:o,boxes:r,boxInd:i}=e,{cropSize:a,method:l,extrapolationValue:c}=s,u=new iV(o.shape,r.shape,a,l,c);return t.runWebGLProgram(u,[o,r,i],"float32")}};var Ki;(function(n){n.Prod="*",n.Sum="+"})(Ki||(Ki={}));class vy{constructor(e,t,s,o){this.op=e,this.outputShape=t,this.variableNames=["x"],this.customUniforms=[{name:"index",type:"float"}];const r=this.outputShape.length,i=this.op===Ki.Prod?"1.0":"0.0",a=s?i:`getX(${Sy(r,"coords",this.op)})`,l=this.outputShape[this.outputShape.length-1];let c="",u="";s?(c=o?`end != ${l-1}`:"end != 0",u=o?"end + 1":"end - 1"):(c=o?`end + pow2 < ${l}`:"end >= pow2",u=o?"end + pow2":"end - pow2"),this.userCode=`
      void main() {
        ${Oe(r)} coords = getOutputCoords();
        int end = ${Ny(r,"coords",this.op)};
        float val = ${a};
        int pow2 = int(pow(2.0, index));
        if (${c}) {
          int idx = ${u};
          ${Ny(r,"coords",this.op)} = idx;
          val ${this.op}= getX(${Sy(r,"coords",this.op)});
        }
        setOutput(val);
      }
    `}}function Sy(n,e,t){if(n===1)return`${e}`;if(n===2)return`${e}.x, ${e}.y`;if(n===3)return`${e}.x, ${e}.y, ${e}.z`;if(n===4)return`${e}.x, ${e}.y, ${e}.z, ${e}.w`;throw new Error(`Cumulative ${t} for rank ${n} is not yet supported`)}function Ny(n,e,t){if(n===1)return`${e}`;if(n===2)return`${e}.y`;if(n===3)return`${e}.z`;if(n===4)return`${e}.w`;throw new Error(`Cumulative ${t} for rank ${n} is not yet supported`)}function Ty(n,e,t,s,o,r){const i=e.shape.length,a=je([s],i);let l=e;a!=null&&(l=Mt({inputs:{x:e},backend:t,attrs:{perm:a}}));const c=et(1,i)[0];if(c!==i-1)throw new Error(`WebGL cumprod shader expects an inner-most axis=${e.shape.length-1} but got axis=${s}`);const u=l.shape[c];let h=Xt({inputs:{x:l},backend:t});for(let d=0;d<=Math.ceil(Math.log2(u))-1;d++){const p=new vy(n,l.shape,!1,r),f=[[d]],m=h;h=t.runWebGLProgram(p,[h],h.dtype,f),t.disposeIntermediateTensorInfo(m)}if(o){const d=new vy(n,l.shape,o,r),p=h;h=t.runWebGLProgram(d,[h],h.dtype),t.disposeIntermediateTensorInfo(p)}if(a!=null){const d=ms(a),p=Mt({inputs:{x:h},backend:t,attrs:{perm:d}});return t.disposeIntermediateTensorInfo(h),t.disposeIntermediateTensorInfo(l),p}return h}function lV(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{axis:r,exclusive:i,reverse:a}=s;return Ty(Ki.Prod,o,t,r,i,a)}const cV={kernelName:eu,backendName:"webgl",kernelFunc:lV};function uV(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{axis:r,exclusive:i,reverse:a}=s;return Ty(Ki.Sum,o,t,r,i,a)}const hV={kernelName:ha,backendName:"webgl",kernelFunc:uV};function dV(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,weights:r}=e,{size:i,binaryOutput:a}=s;if(o.shape.length===1){const l=t.readSync(o.dataId),c=t.readSync(r.dataId),u=j1(l,c,r.dtype,r.shape,i);return t.makeTensorInfo([i],r.dtype,u)}else if(o.shape.length===2){const l=t.bufferSync(o),c=t.bufferSync(r),u=CP(l,c,i,a);return t.makeTensorInfo(u.shape,r.dtype,u.values)}throw new Error(`Error in denseBincount: input must be at most rank 2, but got rank${o.shape.length}.`)}const pV={kernelName:nu,backendName:"webgl",kernelFunc:dV};class fV{constructor(e,t,s){this.variableNames=["x"],this.outputShape=[],this.outputShape=e,this.blockSize=t,this.dataFormat=s,this.userCode=`
    void main() {
      ivec4 coords = getOutputCoords();
      int b = coords[0];
      int h = ${this.getHeightCoordString()};
      int w = ${this.getWidthCoordString()};
      int d = ${this.getDepthCoordString()};

      int in_h = h / ${t};
      int offset_h = imod(h, ${t});
      int in_w = w / ${t};
      int offset_w = imod(w, ${t});
      int offset_d = (offset_h * ${t} + offset_w) *
        ${this.getOutputDepthSize()};
      int in_d = d + offset_d;

      float result = ${this.getInputSamplingString()};
      setOutput(result);
    }
  `}getHeightCoordString(){return this.dataFormat==="NHWC"?"coords[1]":"coords[2]"}getWidthCoordString(){return this.dataFormat==="NHWC"?"coords[2]":"coords[3]"}getDepthCoordString(){return this.dataFormat==="NHWC"?"coords[3]":"coords[1]"}getOutputDepthSize(){return this.dataFormat==="NHWC"?this.outputShape[3]:this.outputShape[1]}getInputSamplingString(){return this.dataFormat==="NHWC"?"getX(b, in_h, in_w, in_d)":"getX(b, in_d, in_h, in_w)"}}function mV(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{blockSize:r,dataFormat:i}=s,a=o.shape[0],l=i==="NHWC"?o.shape[1]:o.shape[2],c=i==="NHWC"?o.shape[2]:o.shape[3],u=i==="NHWC"?o.shape[3]:o.shape[1],h=l*r,d=c*r,p=u/(r*r),f=i==="NHWC"?[a,h,d,p]:[a,p,h,d],m=new fV(f,r,i);return t.runWebGLProgram(m,[o],o.dtype)}const gV={kernelName:su,backendName:"webgl",kernelFunc:mV};class Ey{constructor(e,t=!1,s=null,o=!1,r=!1){this.variableNames=["x","W"],this.customUniforms=[{name:"pads",type:"ivec2"},{name:"strides",type:"ivec2"},{name:"dilations",type:"ivec2"},{name:"inDims",type:"ivec2"}],this.outputShape=e.outShape,this.enableShapeUniforms=At(this.outputShape.length);const i=e.filterHeight,a=e.filterWidth,l=e.outChannels/e.inChannels;let c="",u="";s&&(o?c=`float activation(float a) {
          float b = getPreluActivationWeightsAtOutCoords();
          ${s}
        }`:r?c=`float activation(float a) {
          float b = getLeakyreluAlphaAtOutCoords();
          ${s}
        }`:c=`
          float activation(float x) {
            ${s}
          }
        `,u="result = activation(result);");const h=t?"result += getBiasAtOutCoords();":"";t&&this.variableNames.push("bias"),o&&this.variableNames.push("preluActivationWeights"),r&&this.variableNames.push("leakyreluAlpha"),this.userCode=`
      ${c}

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords.x;
        ivec2 xRCCorner = coords.yz * strides - pads;
        int d2 = coords.w;
        int d1 = d2 / ${l};
        int q = d2 - d1 * ${l};

        int xRCorner = xRCCorner.x;
        int xCCorner = xRCCorner.y;

        // Convolve x(?, ?, d1) with w(:, :, d1, q) to get y(yR, yC, d2).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;
        // TO DO(dsmilkov): Flatten the two for loops and vec4 the operations.
        for (int wR = 0; wR < ${i}; wR++) {
          int xR = xRCorner + wR * dilations[0];

          if (xR < 0 || xR >= inDims[0]) {
            continue;
          }

          for (int wC = 0; wC < ${a}; wC++) {
            int xC = xCCorner + wC * dilations[1];

            if (xC < 0 || xC >= inDims[1]) {
              continue;
            }

            float xVal = getX(batch, xR, xC, d1);
            float wVal = getW(wR, wC, d1, q);
            dotProd += xVal * wVal;
          }
        }

        float result = dotProd;
        ${h}
        ${u}
        setOutput(result);
      }
    `}}class Ry{constructor(e,t=!1,s=null,o=!1,r=!1){this.variableNames=["x","W"],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:"pads",type:"ivec2"},{name:"strides",type:"ivec2"},{name:"dilations",type:"ivec2"},{name:"inDims",type:"ivec2"}],this.outputShape=e.outShape,this.enableShapeUniforms=At(this.outputShape.length);const i=e.outChannels/e.inChannels,a=e.padInfo.left,l=e.strideWidth,c=e.dilationWidth,u=e.filterHeight,h=e.filterWidth,d=h;let p=`
      int xR; int xC; int xCOffset;
      vec4 wTexel; vec4 previous; vec4 final;`;for(let x=0;x<h;x++)p+=`
          vec4 xTexelC${x*2};
          int xTexelC${x*2}Ready;
          vec4 xTexelC${x*2+1};
          int xTexelC${x*2+1}Ready;
          vec4 xC${x};`;p+=`
    for (int r = 0; r < ${u}; r++) {
      `;for(let x=0;x<h;x++)p+=`
          xTexelC${x*2} = vec4(0.0);
          xTexelC${x*2}Ready = 0;
          xTexelC${x*2+1} = vec4(0.0);
          xTexelC${x*2+1}Ready = 0;
          xC${x} = vec4(0.0);`;p+=`
        xR = xRCorner + r * dilations[0];
        if (xR >=0 && xR < inDims[0]) {
      `;for(let x=0;x<(d+1)/2;x++){const b=x*2;if(p+=`
          xC = xCCorner + ${b*c};
          `,l===1){if(b<h&&(a%2===1?(p+=`
                xCOffset = xC + 1;
                if (xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${b}Ready == 0) {
                  xTexelC${b} = getX(batch, xR, xCOffset, d1);

                  // Need to manually clear unused channels in case
                  // we're reading from recycled texture.
                  if (xCOffset + 1 >= inDims[1]) {
                    xTexelC${b}.zw = vec2(0.0);
                  }
                  xTexelC${b}Ready = 1;
                }
              `,c===1&&b>0?p+=`
                xC${b} = vec4(xTexelC${b-2}.zw, xTexelC${b}.xy);
                `:p+=`
                  xCOffset = xC + 1 - 2;

                  if (xCOffset >= 0 && xCOffset < inDims[1]) {
                    previous = getX(batch, xR, xCOffset, d1);

                    // Need to manually clear unused channels in case
                    // we're reading from recycled texture.
                    if (xCOffset + 1 >= inDims[1]) {
                      previous.zw = vec2(0.0);
                    }

                    xC${b} = vec4(previous.zw, xTexelC${b}.xy);
                  } else {
                    xC${b} = vec4(0.0, 0.0, xTexelC${b}.xy);
                  }
                  `):p+=`
                if (xC >= 0 && xC < inDims[1] && xTexelC${b}Ready == 0) {
                  xTexelC${b} = getX(batch, xR, xC, d1);
                  if (xC + 1 >= inDims[1]) {
                    xTexelC${b}.zw = vec2(0.0);
                  }
                  xTexelC${b}Ready = 1;
                }

                xC${b} = xTexelC${b};
                `,b+1<h)){const w=a%2===0?mn(c):c;c%2===0&&a%2===1||c%2!==0&&a%2!==1?(p+=`
                  xCOffset = xC + imod(pads[1], 2) + ${w};

                  if (xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${b+1}Ready == 0) {
                    xTexelC${b+1} = getX(batch, xR, xCOffset, d1);

                    // Need to manually clear unused channels in case
                    // we're reading from recycled texture.
                    if (xCOffset + 1 >= inDims[1]) {
                      xTexelC${b+1}.zw = vec2(0.0);
                    }
                    xTexelC${b+1}Ready = 1;
                  }
                  `,c>1?p+=`
                    xCOffset -= 2;
                    if (xCOffset >= 0 && xCOffset < inDims[1]) {
                     previous = getX(batch, xR, xCOffset, d1);
                     xC${b+1} = vec4(previous.zw, xTexelC${b+1}.xy);
                    } else {
                     xC${b+1} = vec4(0.0, 0.0, xTexelC${b+1}.xy);
                    }
                    `:p+=`
                    xC${b+1} = vec4(xTexelC${b}.zw, xTexelC${b+1}.xy);
                    `):w===1?p+=`
                    xC${b+1} = xTexelC${b};
                    `:p+=`
                    xCOffset = xC + ${w};

                    if (xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${b+1}Ready == 0) {
                      xTexelC${b+1} = getX(batch, xR, xCOffset, d1);
                      if (xCOffset + 1 >= inDims[1]) {
                        xTexelC${b+1}.zw = vec2(0.0);
                      }
                      xTexelC${b+1}Ready = 1;
                    }

                    xC${b+1} = xTexelC${b+1};
                    `}}else b<h&&(a%2===1?(p+=`
                xCOffset = xC + 1 - strides[1];
                if(xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${b}Ready == 0) {
                  xTexelC${b} = getX(batch, xR, xCOffset, d1);
                  // Need to manually clear unused channels in case
                  // we're reading from recycled texture.
                  if (xCOffset + 1 >= inDims[1]) {
                    xTexelC${b}.zw = vec2(0.0);
                  }
                  xTexelC${b}Ready = 1;
                }

                if(xC + 1 >= 0 && xC + 1 < inDims[1] && xTexelC${b+1}Ready == 0) {
                  xTexelC${b+1} = getX(batch, xR, xC + 1, d1);
                  // Need to manually clear unused channels in case
                  // we're reading from recycled texture.
                  if (xC + 2 >= inDims[1]) {
                    xTexelC${b+1}.zw = vec2(0.0);
                  }
                  xTexelC${b+1}Ready = 1;
                }

                xC${b} = vec4(xTexelC${b}.zw, xTexelC${b+1}.zw);
              `,b+1<h&&(p+=`
                  final = vec4(0.0);
                  xCOffset = xC + 1 + strides[1];
                  if(xCOffset >= 0 && xCOffset < inDims[1]) {
                    final = getX(batch, xR, xCOffset, d1);
                  }
                  xC${b+1} = vec4(xTexelC${b+1}.xy, final.xy);
                `)):(p+=`
                if(xC >= 0 && xC < inDims[1] && xTexelC${b}Ready == 0) {
                  xTexelC${b} = getX(batch, xR, xC, d1);
                  if (xC + 1 >= inDims[1]) {
                    xTexelC${b}.zw = vec2(0.0);
                  }
                  xTexelC${b}Ready = 1;
                }

                xCOffset = xC + strides[1];
                if(xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${b+1}Ready == 0) {
                  xTexelC${b+1} = getX(batch, xR, xCOffset, d1);
                  if (xCOffset + 1 >= inDims[1]) {
                    xTexelC${b+1}.zw = vec2(0.);
                  }
                  xTexelC${b+1}Ready = 1;
                }

                xC${b} = vec4(
                  xTexelC${b}.xy, xTexelC${b+1}.xy);
              `,b+1<h&&(p+=`
                  xC${b+1} = vec4(xTexelC${b}.zw, xTexelC${b+1}.zw);
                `)));b<h&&(p+=`
            wTexel = getW(r, ${b}, d1, q);
            dotProd += xC${b} * vec4(wTexel.xz, wTexel.xz);
          `,b+1<h&&(p+=`
              wTexel = getW(r, ${b+1}, d1, q);
              dotProd += xC${b+1} * vec4(wTexel.xz, wTexel.xz);
            `))}p+=`
    }
  `,p+=`
      }
    `;let f="",m="";s&&(o?f=`vec4 activation(vec4 a) {
          vec4 b = getPreluActivationWeightsAtOutCoords();
          ${s}
        }`:r?f=`vec4 activation(vec4 a) {
          vec4 b = getLeakyreluAlphaAtOutCoords();
          ${s}
        }`:f=`vec4 activation(vec4 x) {
          ${s}
        }`,m="result = activation(result);");const g=t?"result += getBiasAtOutCoords();":"";t&&this.variableNames.push("bias"),o&&this.variableNames.push("preluActivationWeights"),r&&this.variableNames.push("leakyreluAlpha"),this.userCode=`
      ${f}

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords.x;
        ivec2 xRCCorner = coords.yz * strides - pads;
        int d2 = coords.w;
        int d1 = d2 / ${i};
        int q = d2 - d1 * ${i};
        int xRCorner = xRCCorner.x;
        int xCCorner = xRCCorner.y;

        //intialize dotProd with a small epsilon seems to reduce GPU accuracy loss.
        vec4 dotProd = vec4(0.000000000000001);

        ${p}

        vec4 result = dotProd - vec4(0.000000000000001);
        ${g}
        ${m}
        setOutput(result);
      }
    `}}function xV(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,filter:r}=e,{strides:i,pad:a,dilations:l,dimRoundingMode:c}=s;let u=l;u==null&&(u=[1,1]),k(Nt(i,u),()=>`Error in depthwiseConv2d: Either strides or dilations must be 1. Got strides ${i} and dilations '${u}'`);const h=yt(o.shape,r.shape,i,u,a,c,!0);let d;V().getBool("WEBGL_PACK_DEPTHWISECONV")&&h.strideWidth<=2&&h.outChannels/h.inChannels===1?d=new Ry(h):d=new Ey(h);const p=[[h.padInfo.top,h.padInfo.left],[h.strideHeight,h.strideWidth],[h.dilationHeight,h.dilationWidth],[h.inHeight,h.inWidth]];return t.runWebGLProgram(d,[o,r],"float32",p)}const bV={kernelName:da,backendName:"webgl",kernelFunc:xV};class yV{constructor(e){this.variableNames=["x","dy"],this.outputShape=e.filterShape;const t=e.strideHeight,s=e.strideWidth,o=e.padInfo.top,r=e.padInfo.left,i=e.outChannels/e.inChannels;this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int wR = coords.x;
        int wC = coords.y;
        int d1 = coords.z;
        int dm = coords.w;
        int d2 = d1 * ${i} + dm;

        float dotProd = 0.0;

        // TO DO: Vec4 over the batch size
        for (int b = 0; b < ${e.batchSize}; b++) {
          for (int yR = 0; yR < ${e.outHeight}; yR++) {
            int xR = wR + yR * ${t} - ${o};

            if (xR < 0 || xR >= ${e.inHeight}) {
              continue;
            }

            for (int yC = 0; yC < ${e.outWidth}; yC++) {
              int xC = wC + yC * ${s} - ${r};

              if (xC < 0 || xC >= ${e.inWidth}) {
                continue;
              }

              float dyValue = getDy(b, yR, yC, d2);
              float xValue = getX(b, xR, xC, d1);
              dotProd += (xValue * dyValue);
            }
          }
        }
        setOutput(dotProd);
      }
    `}}class wV{constructor(e){this.variableNames=["dy","W"],this.outputShape=e.inShape;const t=e.filterHeight,s=e.filterWidth,o=e.strideHeight,r=e.strideWidth,i=t-1-e.padInfo.top,a=s-1-e.padInfo.left,l=e.outChannels/e.inChannels;this.userCode=`
      const ivec2 pads = ivec2(${i}, ${a});

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords[0];
        int d1 = coords[3];
        ivec2 dyCorner = coords.yz - pads;
        int dyRCorner = dyCorner.x;
        int dyCCorner = dyCorner.y;

        float dotProd = 0.0;

        for (int wR = 0; wR < ${t}; wR++) {
          float dyR = float(dyRCorner + wR) / ${o}.0;

          if (dyR < 0.0 || dyR >= ${e.outHeight}.0 || fract(dyR) > 0.0) {
            continue;
          }
          int idyR = int(dyR);

          int wRPerm = ${t} - 1 - wR;

          for (int wC = 0; wC < ${s}; wC++) {
            float dyC = float(dyCCorner + wC) / ${r}.0;

            if (dyC < 0.0 || dyC >= ${e.outWidth}.0 ||
                fract(dyC) > 0.0) {
              continue;
            }
            int idyC = int(dyC);

            int wCPerm = ${s} - 1 - wC;

            // TO DO: Vec4 over the channelMul
            for (int dm = 0; dm < ${l}; dm++) {
              int d2 = d1 * ${l} + dm;
              float xValue = getDy(batch, idyR, idyC, d2);
              float wValue = getW(wRPerm, wCPerm, d1, dm);
              dotProd += xValue * wValue;
            }
          }
        }
        setOutput(dotProd);
      }
    `}}function CV(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,dy:r}=e,{strides:i,dilations:a,pad:l,dimRoundingMode:c,filterShape:u}=s,h=yt(o.shape,u,i,a,l,c,!0),d=new yV(h);return t.runWebGLProgram(d,[o,r],"float32")}const IV={kernelName:ou,backendName:"webgl",kernelFunc:CV};function $V(n){const{inputs:e,backend:t,attrs:s}=n,{dy:o,filter:r}=e,{strides:i,dilations:a,pad:l,dimRoundingMode:c,inputShape:u}=s,h=yt(u,r.shape,i,a,l,c,!0),d=new wV(h);return t.runWebGLProgram(d,[o,r],"float32")}const kV={kernelName:ru,backendName:"webgl",kernelFunc:$V};class vV{constructor(e){this.variableNames=["X"],this.outputShape=[e,e],this.userCode=`
      void main() {
          ivec2 coords = getOutputCoords();
          float val = coords[0] == coords[1] ? getX(coords[0]) : 0.0;
          setOutput(val);
      }
    `}}function SV(n){const{inputs:e,backend:t}=n,{x:s}=e,o=[...s.shape,...s.shape],r=q(s.shape),i=ne({inputs:{x:s},backend:t,attrs:{shape:[r]}}),a=new vV(r),l=t.runWebGLProgram(a,[i],i.dtype),c=ne({inputs:{x:l},backend:t,attrs:{shape:o}});return t.disposeIntermediateTensorInfo(i),t.disposeIntermediateTensorInfo(l),c}const NV={kernelName:_p,backendName:"webgl",kernelFunc:SV};class TV{constructor(e){this.variableNames=["x","W"],this.outputShape=e.outShape;const{inHeight:t,inWidth:s,padInfo:o,strideHeight:r,strideWidth:i,filterHeight:a,filterWidth:l,dilationHeight:c,dilationWidth:u}=e,{top:h,left:d}=o;this.userCode=`
      const ivec2 strides = ivec2(${r}, ${i});
      const ivec2 pads = ivec2(${h}, ${d});
      const float neg_infinity = -3.4e38;

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords.x;
        int d1 = coords.w;
        ivec2 outTopLeftCorner =
            coords.yz * strides - pads;
        int hBeg = outTopLeftCorner.x;
        int wBeg = outTopLeftCorner.y;

        float curVal = neg_infinity;
        for (int h = 0; h < ${a}; h++) {
          int hIn = hBeg + h * ${c};

          if (hIn >= 0 && hIn < ${t}) {
            for (int w = 0; w < ${l}; w++) {
              int wIn = wBeg + w * ${u};

              if (wIn >= 0 && wIn < ${s}) {
                float xVal = getX(batch, hIn, wIn, d1);
                float wVal = getW(h, w, d1);

                float val = xVal + wVal;
                if (val > curVal) {
                  curVal = val;
                }
              }
            }
          }
        }

        float result = curVal;
        setOutput(result);
      }
    `}}function EV(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,filter:r}=e,{strides:i,pad:a,dilations:l}=s,c=ii(o.shape,r.shape,i,a,"NHWC",l);let u;const h=new TV(c);u=t.runWebGLProgram(h,[o,r],"float32");const d=ne({inputs:{x:u},backend:t,attrs:{shape:c.outShape}});return t.disposeIntermediateTensorInfo(u),d}const RV={kernelName:pa,backendName:"webgl",kernelFunc:EV};function AV(n){const{inputs:e,backend:t,attrs:s}=n,{equation:o}=s,r=e,{allDims:i,summedDims:a,idDims:l}=Yh(o,r.length);Qh(i.length,l,r);const{path:c,steps:u}=Jh(a,l),h=u.length;let d=null,p=i.length;const f=[];for(let m=0;m<h;++m){for(const g of u[m]){const{permutationIndices:x,expandDims:b}=Zh(p,l[g]);let w;ed(x)?w=r[g]:(w=Mt({inputs:{x:r[g]},backend:t,attrs:{perm:x}}),f.push(w));const y=w.shape.slice();for(let C=0;C<b.length;++C)y.splice(b[C],0,1);Ee(w.shape,y)||(w=ne({inputs:{x:w},backend:t,attrs:{shape:y}}),f.push(w)),d===null?d=w:(d=up({inputs:{a:w,b:d},backend:t}),f.push(d))}m<h-1&&(c[m]>=0&&(d=wc({inputs:{x:d},backend:t,attrs:{axis:c[m]-(i.length-p),keepDims:!1}}),f.push(d)),p--)}for(const m of f)m!==d&&t.disposeIntermediateTensorInfo(m);return d}const DV={kernelName:lu,backendName:"webgl",kernelFunc:AV};const FV=Se({opSnippet:"return (x >= 0.0) ? x : (exp(x) - 1.0);",packedOpSnippet:`
  vec4 result;

  result.r = (x.r >= 0.0) ? x.r : (exp(x.r) - 1.0);
  result.g = (x.g >= 0.0) ? x.g : (exp(x.g) - 1.0);
  result.b = (x.b >= 0.0) ? x.b : (exp(x.b) - 1.0);
  result.a = (x.a >= 0.0) ? x.a : (exp(x.a) - 1.0);

  return result;
`}),_V={kernelName:wr,backendName:"webgl",kernelFunc:FV};const OV="return (b >= 0.0) ? a : a * (b + 1.0);",LV=`
  vec4 bGTEZero = vec4(greaterThanEqual(b, vec4(0.)));
  return (bGTEZero * a) + ((vec4(1.0) - bGTEZero) * (a * (b + vec4(1.0))));
`,MV={kernelName:cu,backendName:"webgl",kernelFunc:n=>{const{inputs:e,backend:t}=n,{dy:s,y:o}=e,r=V().getBool("WEBGL_PACK_BINARY_OPERATIONS")?new nr(LV,s.shape,o.shape):new go(OV,s.shape,o.shape);return t.runWebGLProgram(r,[s,o],s.dtype)}};const PV=$t({opSnippet:"return float(a == b);",packedOpSnippet:`
  return vec4(equal(a, b));
`,dtype:"bool",cpuKernelImpl:SP}),BV={kernelName:fa,backendName:"webgl",kernelFunc:PV};const zV=`
  // Error function is calculated approximately with elementary function.
  // See "Handbook of Mathematical Functions with Formulas,
  // Graphs, and Mathematical Tables", Abramowitz and Stegun.
  float p = ${Wh};
  float a1 = ${Uh};
  float a2 = ${Gh};
  float a3 = ${Hh};
  float a4 = ${qh};
  float a5 = ${jh};

  float sign = sign(x);
  x = abs(x);
  float t = 1.0 / (1.0 + p * x);
  return sign * (1.0 - (((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t*exp(-x*x));
`,VV=Se({opSnippet:zV}),WV={kernelName:Cr,backendName:"webgl",kernelFunc:VV};const UV=sr+`
  return exp(x);
`,Ay=Se({opSnippet:UV,packedOpSnippet:`
  vec4 result = exp(x);
  bvec4 isNaN = isnan(x);
  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`,cpuKernelImpl:NP,dtype:"float32"}),GV={kernelName:Ir,backendName:"webgl",kernelFunc:Ay};function fp(n){const{inputs:e,attrs:t,backend:s}=n,{dim:o}=t,{input:r}=e,i=r.shape.length,a=r.shape.slice();let l=o;return o<0&&(k(-(i+1)<=o,()=>`Axis must be in the interval [${-(i+1)}, ${i}]`),l=i+o+1),a.splice(l,0,1),ne({inputs:{x:r},backend:s,attrs:{shape:a}})}const HV={kernelName:ma,backendName:"webgl",kernelFunc:fp};const Dy="return exp(x) - 1.0;",qV=Se({opSnippet:Dy,packedOpSnippet:Dy,cpuKernelImpl:TP}),jV={kernelName:$r,backendName:"webgl",kernelFunc:qV};class Fy{constructor(e,t,s){this.variableNames=["real","imag"];const o=t[1];this.outputShape=t;const r=s?`2.0 * ${Math.PI}`:`-2.0 * ${Math.PI}`,i=s?`${o}.0`:"1.0";let a;if(e==="real")a="return real * expR - imag * expI;";else if(e==="imag")a="return real * expI + imag * expR;";else throw new Error(`FFT component must be either "real" or "imag", got ${e}.`);this.userCode=`
      const float exponentMultiplier = ${r};

      float unaryOpComplex(float real, float expR, float imag, float expI) {
        ${a}
      }

      float mulMatDFT(int batch, int index) {
        float indexRatio = float(index) / float(${o});
        float exponentMultiplierTimesIndexRatio =
            exponentMultiplier * indexRatio;

        float result = 0.0;

        for (int i = 0; i < ${o}; i++) {
          // x = (-2|2 * PI / N) * index * i;
          float x = exponentMultiplierTimesIndexRatio * float(i);
          float expR = cos(x);
          float expI = sin(x);
          float real = getReal(batch, i);
          float imag = getImag(batch, i);

          result +=
              unaryOpComplex(real, expR, imag, expI) / ${i};
        }

        return result;
      }

      void main() {
        ivec2 coords = getOutputCoords();
        setOutput(mulMatDFT(coords[0], coords[1]));
      }
    `}}function _y(n,e,t){const s=t.texData.get(n.dataId),o=q(n.shape),r=n.shape[n.shape.length-1],i=o/r,a=ne({inputs:{x:n},backend:t,attrs:{shape:[i,r]}}),l=a.shape,c=new Fy("real",l,e),u=new Fy("imag",l,e),h=[{dataId:s.complexTensorInfos.real.dataId,dtype:s.complexTensorInfos.real.dtype,shape:l},{dataId:s.complexTensorInfos.imag.dataId,dtype:s.complexTensorInfos.imag.dtype,shape:l}],d=t.runWebGLProgram(c,h,"float32"),p=t.runWebGLProgram(u,h,"float32"),f=As({inputs:{real:d,imag:p},backend:t});t.disposeIntermediateTensorInfo(d),t.disposeIntermediateTensorInfo(p);const m=ne({inputs:{x:f},backend:t,attrs:{shape:n.shape}});return t.disposeIntermediateTensorInfo(a),t.disposeIntermediateTensorInfo(f),m}function KV(n){const{inputs:e,backend:t}=n,{input:s}=e;return _y(s,!1,t)}const XV={kernelName:uu,backendName:"webgl",kernelFunc:KV};class YV{constructor(e,t){this.outputShape=[],this.customUniforms=[{name:"value",type:"float"}],this.variableNames=["x"],this.outputShape=e,this.userCode=`
      void main() {
        // Input can be obtained from uniform value.
        setOutput(value);
      }
    `}}function Xi(n){const{backend:e,attrs:t}=n,{shape:s,value:o}=t;let{dtype:r}=t;if(r=r||vo(o),r==="string"){const i=Qe(r,q(s));return i.fill(o),e.makeTensorInfo(s,r,i)}else{const i=new YV(s,o),a=[[o]];return e.runWebGLProgram(i,[],r,a)}}const ZV={kernelName:hu,backendName:"webgl",kernelFunc:Xi};class QV{constructor(e){this.variableNames=["Image"],this.outputShape=[];const t=e[2];this.outputShape=e,this.userCode=`
        void main() {
          ivec4 coords = getOutputCoords();
          int x = coords[2];

          int coordX = ${t} - x - 1;
          float outputValue;
          if(coordX >= 0 && coordX < ${t}) {
            outputValue = getImage(coords[0], coords[1], coordX, coords[3]);
          } else {
            outputValue = getImage(coords[0], coords[1], coords[2], coords[3]);
          }
          setOutput(outputValue);
        }
    `}}const JV={kernelName:du,backendName:"webgl",kernelFunc:({inputs:n,backend:e})=>{const{image:t}=n,s=e,o=new QV(t.shape);return s.runWebGLProgram(o,[t],t.dtype)}};const Oy="return floor(x);",eW=Se({opSnippet:Oy,packedOpSnippet:Oy,cpuKernelImpl:EP}),tW={kernelName:kr,backendName:"webgl",kernelFunc:eW};const nW=$t({opSnippet:`
  float s = sign(a) * sign(b);
  int ia = round(a);
  int ib = round(b);
  if (ib != 0) {
    // Windows (D3D) wants guaranteed non-zero int division at compile-time.
    return float(idiv(ia, ib, s));
  } else {
    return NAN;
  }
`,packedOpSnippet:`
  ivec4 ia = round(a);
  ivec4 ib = round(b);
  bvec4 cond = notEqual(ib, ivec4(0));
  ivec4 result = ivec4(0);
  vec4 s = sign(a) * sign(b);

  // Windows (D3D) wants guaranteed non-zero int division at compile-time.
  if (cond[0]) {
    result[0] = idiv(ia[0], ib[0], s[0]);
  }
  if (cond[1]) {
    result[1] = idiv(ia[1], ib[1], s[1]);
  }
  if (cond[2]) {
    result[2] = idiv(ia[2], ib[2], s[2]);
  }
  if (cond[3]) {
    result[3] = idiv(ia[3], ib[3], s[3]);
  }
  return vec4(result);
`,dtype:"int32"}),sW={kernelName:vr,backendName:"webgl",kernelFunc:nW};class oW{constructor(e){this.variableNames=["A"];const t=Ot(),[s,o]=e;this.outputShape=e,this.userCode=`
      void main() {
        ivec3 coords = getOutputCoords();
        int texR = coords[0];
        int texC = coords[1];
        int depth = coords[2];
        vec2 uv = (vec2(texC, texR) + halfCR) / vec2(${o}.0, ${s}.0);

        vec4 values = ${t.texture2D}(A, uv);
        float value;
        if (depth == 0) {
          value = values.r;
        } else if (depth == 1) {
          value = values.g;
        } else if (depth == 2) {
          value = values.b;
        } else if (depth == 3) {
          value = values.a;
        }

        setOutput(floor(value * 255.0 + 0.5));
      }
    `}}class rW{constructor(e){this.variableNames=["A"],this.packedInputs=!1,this.packedOutput=!0;const t=Ot(),[s,o]=e;this.outputShape=e,this.userCode=`
      void main() {
        ivec3 coords = getOutputCoords();
        int texR = coords[0];
        int texC = coords[1];
        int depth = coords[2];

        vec4 result = vec4(0.);

        for(int row=0; row<=1; row++) {
          for(int col=0; col<=1; col++) {
            texC = coords[1] + row;
            depth = coords[2] + col;

            vec2 uv = (vec2(texC, texR) + halfCR) /
                       vec2(${o}.0, ${s}.0);
            vec4 values = ${t.texture2D}(A, uv);
            float value;
            if (depth == 0) {
              value = values.r;
            } else if (depth == 1) {
              value = values.g;
            } else if (depth == 2) {
              value = values.b;
            } else if (depth == 3) {
              value = values.a;
            }

            result[row * 2 + col] = floor(value * 255.0 + 0.5);
          }
        }

        ${t.output} = result;
      }
    `}}const iW={kernelName:bw,backendName:"webgl",kernelFunc:aW};let rr,mp=V().getBool("CANVAS2D_WILL_READ_FREQUENTLY_FOR_GPU");function aW(n){const{inputs:e,backend:t,attrs:s}=n;let{pixels:o}=e;const{numChannels:r}=s,i=typeof HTMLVideoElement!="undefined"&&o instanceof HTMLVideoElement,a=typeof HTMLImageElement!="undefined"&&o instanceof HTMLImageElement,[l,c]=i?[o.videoWidth,o.videoHeight]:[o.width,o.height],u=[c,l],h=[c,l,r];if(a||i){const m=V().getBool("CANVAS2D_WILL_READ_FREQUENTLY_FOR_GPU");(rr==null||m!==mp)&&(mp=m,rr=document.createElement("canvas").getContext("2d",{willReadFrequently:mp})),rr.canvas.width=l,rr.canvas.height=c,rr.drawImage(o,0,0,l,c),o=rr.canvas}const d=t.makeTensorInfo(u,"int32");t.texData.get(d.dataId).usage=en.PIXELS,t.gpgpu.uploadPixelDataToTexture(t.getTexture(d.dataId),o);const p=V().getBool("WEBGL_PACK")?new rW(h):new oW(h),f=t.runWebGLProgram(p,[d],"int32");return t.disposeData(d.dataId),f}function lW(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,filter:r,bias:i,preluActivationWeights:a}=e,{strides:l,pad:c,dataFormat:u,dilations:h,dimRoundingMode:d,activation:p,leakyreluAlpha:f}=s,m=Zn(u),g=yt(o.shape,r.shape,l,h,c,d,!1,m);let x;const b=[],w=i!=null,y=a!=null,C=p==="leakyrelu",$=()=>{const T=[o,r],S=(v,I)=>{if(I==="NCHW"&&v.shape.length===1&&v.shape[0]!==1){const R=ne({inputs:{x:v},backend:t,attrs:{shape:[v.shape[0],1,1]}});return b.push(R),R}return v};if(w&&T.push(S(i,u)),y&&T.push(S(a,u)),C){const v=t.makeTensorInfo([],"float32",cs(f,"float32"));T.push(v),b.push(v)}return T};if(g.filterHeight===1&&g.filterWidth===1&&g.dilationHeight===1&&g.dilationWidth===1&&g.strideHeight===1&&g.strideWidth===1&&(g.padInfo.type==="SAME"||g.padInfo.type==="VALID"))x=$y({x:o,filter:r,convInfo:g,backend:t,bias:i,activation:p,preluActivationWeights:a,leakyreluAlpha:f});else if(g.strideWidth<=2&&m==="channelsLast"&&V().getBool("WEBGL_EXP_CONV")){const T=p?Gi(p,!0):null,S=new Iy(g,w,T,y,C),v=[[g.padInfo.top,g.padInfo.left],[g.strideHeight,g.strideWidth],[g.dilationHeight,g.dilationWidth],[g.inHeight,g.inWidth]],I=$();x=t.runWebGLProgram(S,I,"float32",v)}else if(V().getBool("WEBGL_CONV_IM2COL"))x=ky({x:o,filter:r,convInfo:g,backend:t,bias:i,activation:p,preluActivationWeights:a,leakyreluAlpha:f});else{const T=p?Gi(p,!1):null,S=new Cy(g,w,T,y,C),v=$();x=t.runWebGLProgram(S,v,"float32")}const N=ne({inputs:{x},backend:t,attrs:{shape:g.outShape}});return b.push(x),b.forEach(T=>t.disposeIntermediateTensorInfo(T)),N}const cW={kernelName:el,backendName:"webgl",kernelFunc:lW};function uW(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,filter:r,bias:i,preluActivationWeights:a}=e,{strides:l,pad:c,dilations:u,dimRoundingMode:h,activation:d,leakyreluAlpha:p}=s,f=[];let m=u;m==null&&(m=[1,1]),k(Nt(l,m),()=>`Error in depthwiseConv2d: Either strides or dilations must be 1. Got strides ${l} and dilations '${m}'`);const g=yt(o.shape,r.shape,l,m,c,h,!0),x=V().getBool("WEBGL_PACK_DEPTHWISECONV")&&g.strideWidth<=2&&g.outChannels/g.inChannels===1,b=d?Gi(d,x):null,w=[o,r],y=i!=null,C=a!=null,$=d==="leakyrelu";if(y&&w.push(i),C&&w.push(a),$){const v=t.makeTensorInfo([],"float32",cs(p,"float32"));w.push(v),f.push(v)}let N;x?N=new Ry(g,y,b,C,$):N=new Ey(g,y,b,C,$);const T=[[g.padInfo.top,g.padInfo.left],[g.strideHeight,g.strideWidth],[g.dilationHeight,g.dilationWidth],[g.inHeight,g.inWidth]],S=t.runWebGLProgram(N,w,"float32",T);return f.forEach(v=>t.disposeIntermediateTensorInfo(v)),S}const hW={kernelName:Jp,backendName:"webgl",kernelFunc:uW};class dW{constructor(e,t,s,o){this.sliceDim=e,this.strides=t,this.paramsShape=o,this.variableNames=["x","indices"],this.outputShape=s;const r=Oe(s.length);let i=`
    int index;`;for(let a=0;a<this.sliceDim;a++)i+=`
          index = round(getIndices(coords[0], ${a}));
          out_of_bounds = out_of_bounds || index < 0;
          out_of_bounds = out_of_bounds || index >= ${this.paramsShape[a]};
          flattenIndex += index * ${this.strides[a]};`;this.userCode=`
         void main() {
          ${r} coords = getOutputCoords();
          int flattenIndex = 0;
          bool out_of_bounds = false;

          ${i}

          setOutput(out_of_bounds ? 0.0 : getX(flattenIndex, coords[1]));
        }
      `}}function pW(n){const{inputs:e,backend:t}=n,{params:s,indices:o}=e,r=o.shape,i=r[r.length-1],a=q(s.shape),[l,c,u,h]=Rh(s,o),d=ne({inputs:{x:o},backend:t,attrs:{shape:[c,i]}}),p=ne({inputs:{x:s},backend:t,attrs:{shape:[q(s.shape)/u,u]}});if(t.shouldExecuteOnCPU([s,o])||s.dtype==="string"){const x=t.readSync(o.dataId),b=t.bufferSync(s),w=RP(x,b,s.dtype,c,i,u,h,s.shape,a);return t.makeTensorInfo(l,s.dtype,w.values)}const f=new dW(i,h,[c,u],s.shape),m=t.runWebGLProgram(f,[p,d],p.dtype),g=ne({inputs:{x:m},backend:t,attrs:{shape:l}});return t.disposeIntermediateTensorInfo(d),t.disposeIntermediateTensorInfo(p),t.disposeIntermediateTensorInfo(m),g}const fW={kernelName:Op,backendName:"webgl",kernelFunc:pW};class mW{constructor(e,t){this.variableNames=["A","indices"],this.outputShape=t,this.rank=t.length;const s=Oe(this.rank),o=gW(e);this.userCode=`
      void main() {
        ${s} resRC = getOutputCoords();
        int index = int(getIndices(resRC.x, resRC.z));
        float inBounds = (index >= 0) && (index < ${e[2]}) ? 1.0 : 0.0;
        setOutput(inBounds * getA(${o}));
      }
    `}}function gW(n,e){const t=["resRC.x","resRC.y","resRC.z","resRC.w"],s=[];for(let o=0;o<n.length;o++)o===2?s.push("index"):s.push(`${t[o]}`);return s.join()}function Ly(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,indices:r}=e,{axis:i,batchDims:a}=s,l=Ce(i,o.shape)[0];if(V().get("DEBUG")){const b=t.readSync(r.dataId),w=o.shape[l];for(let y=0;y<b.length;++y){const C=b[y];k(C<=w-1&&C>=0,()=>`GatherV2: the index value ${C} is not in [0, ${w-1}]`)}}const c=sd(o,r,l,a),u=q(r.shape),h=[],d=ne({inputs:{x:o},backend:t,attrs:{shape:[c.batchSize,c.outerSize,c.dimSize,c.sliceSize]}}),p=ne({inputs:{x:r},backend:t,attrs:{shape:[c.batchSize,u/c.batchSize]}});h.push(d),h.push(p);const f=[c.batchSize,c.outerSize,u/c.batchSize,c.sliceSize];if(t.shouldExecuteOnCPU([o,r])||o.dtype==="string"){const b=t.bufferSync(p),w=t.bufferSync(d),y=AP(w,b,f);return h.forEach(C=>t.disposeIntermediateTensorInfo(C)),t.makeTensorInfo(c.outputShape,y.dtype,y.values)}const m=new mW(d.shape,f),g=t.runWebGLProgram(m,[d,p],d.dtype);h.push(g);const x=ne({inputs:{x:g},backend:t,attrs:{shape:c.outputShape}});return h.forEach(b=>t.disposeIntermediateTensorInfo(b)),x}const xW={kernelName:xa,backendName:"webgl",kernelFunc:Ly};const bW=$t({opSnippet:"return float(a > b);",packedOpSnippet:`
  return vec4(greaterThan(a, b));
`,cpuKernelImpl:DP,dtype:"bool"}),yW={kernelName:ba,backendName:"webgl",kernelFunc:bW};const wW=$t({opSnippet:"return float(a >= b);",packedOpSnippet:`
  return vec4(greaterThanEqual(a, b));
`,dtype:"bool",cpuKernelImpl:FP}),CW={kernelName:Sr,backendName:"webgl",kernelFunc:wW};function IW(n){const{inputs:e,backend:t}=n,{input:s}=e;return _y(s,!0,t)}const $W={kernelName:pu,backendName:"webgl",kernelFunc:IW};const kW=Se({opSnippet:"return float(!isnan(x) && !isinf(x));",dtype:"bool"}),vW={kernelName:Tr,backendName:"webgl",kernelFunc:kW};const SW=Se({opSnippet:"return float(isinf(x));",dtype:"bool"}),NW={kernelName:Er,backendName:"webgl",kernelFunc:SW};const TW=Se({opSnippet:"return float(isnan(x));",dtype:"bool"}),EW={kernelName:Rr,backendName:"webgl",kernelFunc:TW};const RW=$t({opSnippet:"return float(a < b);",packedOpSnippet:`
  return vec4(lessThan(a, b));
`,cpuKernelImpl:_P,dtype:"bool"}),AW={kernelName:wa,backendName:"webgl",kernelFunc:RW};const DW=$t({opSnippet:"return float(a <= b);",packedOpSnippet:`
  return vec4(lessThanEqual(a, b));
`,cpuKernelImpl:OP,dtype:"bool"}),FW={kernelName:Ca,backendName:"webgl",kernelFunc:DW};function _W(n){const{backend:e,attrs:t}=n,{start:s,stop:o,num:r}=t,i=LP(s,o,r);return e.makeTensorInfo([i.length],"float32",i)}const OW={kernelName:Lp,backendName:"webgl",kernelFunc:_W};const LW=sr+`
  return x < 0.0 ? 0./0. : log(x);
`,MW=Se({opSnippet:LW,packedOpSnippet:`
  vec4 result = log(x);
  bvec4 isNaN = isnan(x);
  result.r = isNaN.r ? x.r : (x.r < 0.0 ? 0./0. : result.r);
  result.g = isNaN.g ? x.g : (x.g < 0.0 ? 0./0. : result.g);
  result.b = isNaN.b ? x.b : (x.b < 0.0 ? 0./0. : result.b);
  result.a = isNaN.a ? x.a : (x.a < 0.0 ? 0./0. : result.a);
  return result;
`,cpuKernelImpl:MP}),PW={kernelName:Ar,backendName:"webgl",kernelFunc:MW};const BW=sr+`
  return log(1.0 + x);
`,zW=Se({opSnippet:BW}),VW={kernelName:Dr,backendName:"webgl",kernelFunc:zW};const WW=$t({opSnippet:"return float(a >= 1.0 && b >= 1.0);",packedOpSnippet:`
  return vec4(
    vec4(greaterThanEqual(a, vec4(1.0))) *
    vec4(greaterThanEqual(b, vec4(1.0))));
`,dtype:"bool"}),UW={kernelName:Ia,backendName:"webgl",kernelFunc:WW};const GW=Se({opSnippet:"return float(!(x >= 1.0));"}),HW={kernelName:$a,backendName:"webgl",kernelFunc:GW};const qW=$t({opSnippet:"return float(a >= 1.0 || b >= 1.0);",packedOpSnippet:`
  return min(
    vec4(greaterThanEqual(a, vec4(1.0))) +
    vec4(greaterThanEqual(b, vec4(1.0))),
    vec4(1.0));
`,dtype:"bool"}),jW={kernelName:ka,backendName:"webgl",kernelFunc:qW};class KW{constructor(e,t,s,o,r){this.variableNames=["x"],this.outputShape=[];const i=t,a=e[3]-1;this.outputShape=e;let l;const c=`float(${s}) + float(${o}) * sum`;r===.5?l=`inversesqrt(${c})`:r===1?l=`1.0/(${c})`:l=`exp(log(${c}) * float(-${r}));`,this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int r = coords[1];
        int c = coords[2];
        int d = coords[3];
        float x = getX(b, r, c, d);
        float sum = 0.0;
        for (int j = -${i}; j <= ${i}; j++) {
          int idx = d + j;
          if (idx >= 0 && idx <=  ${a}) {
            float z = getX(b, r, c, idx);
            sum += z * z;
          }
        }
        float val = x * ${l};
        setOutput(val);
      }
    `}}class XW{constructor(e,t,s,o,r){this.variableNames=["x"],this.outputShape=[],this.packedInputs=!0,this.packedOutput=!0;const i=t,a=e[3]-1;this.outputShape=e;let l;const c=`float(${s}) + float(${o}) * sum`;r===.5?l=`inversesqrt(${c})`:r===1?l=`1.0/(${c})`:l=`exp(log(${c}) * float(-${r}));`,this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords.x;
        int r = coords.y;
        int c = coords.z;
        int d = coords.w;

        bool hasNextCol = d < ${this.outputShape[3]};
        bool hasNextRow = c < ${this.outputShape[2]};

        vec4 sum = vec4(0.);
        vec4 xFragAtOutputCoords = getX(b, r, c, d);

        vec4 xAtOutputCoords = vec4(
          getChannel(xFragAtOutputCoords, vec2(c, d)),
          hasNextCol ?
            getChannel(xFragAtOutputCoords, vec2(c, d + 1)) : 0.0,
          hasNextRow ?
            getChannel(xFragAtOutputCoords , vec2(c + 1, d)) : 0.0,
          (hasNextRow && hasNextCol) ?
            getChannel(xFragAtOutputCoords, vec2(c + 1, d + 1)) : 0.0
        );

        int firstChannel = d - ${i};
        vec2 cache = vec2(0.);
        if(firstChannel >= 0){
          vec4 firstChannelFrag = getX(b, r, c, firstChannel);
          cache.x = getChannel(firstChannelFrag, vec2(c, firstChannel));
            if(hasNextRow){
              cache.y = getChannel(firstChannelFrag, vec2(c + 1, firstChannel));
            }
        }

        ivec2 depth = ivec2(d, d + 1);
        for (int j = - ${i}; j <= ${i}; j++) {
          ivec2 idx = depth + j;
          bvec2 aboveLowerBound = greaterThanEqual(idx, ivec2(0));
          bvec2 belowUpperBound = lessThanEqual(idx, ivec2(${a}));

          bool depthInRange = aboveLowerBound.x && belowUpperBound.x;
          bool depthPlusOneInRange = aboveLowerBound.y && belowUpperBound.y;

          if(depthInRange || depthPlusOneInRange){
            vec4 z = vec4(0.);
            vec4 xFragAtCurrentDepth;
            z.xz = cache.xy;
            if(depthPlusOneInRange && hasNextCol){
              xFragAtCurrentDepth = idx.y != d ?
                getX(b, r, c, idx.y) : xFragAtOutputCoords;
              z.y = getChannel(xFragAtCurrentDepth, vec2(c, idx.y));
              if(hasNextRow){
                z.w = getChannel(xFragAtCurrentDepth, vec2(c + 1, idx.y));
              }
            }
            cache.xy = z.yw;
            sum += z * z;
          }
        }
        vec4 result = xAtOutputCoords * ${l};
        setOutput(result);
      }
    `}}const YW={kernelName:va,backendName:"webgl",kernelFunc:n=>{const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{depthRadius:r,bias:i,alpha:a,beta:l}=s,c=V().getBool("WEBGL_PACK_NORMALIZATION")?new XW(o.shape,r,i,a,l):new KW(o.shape,r,i,a,l);return t.runWebGLProgram(c,[o],o.dtype)}};class ZW{constructor(e,t,s,o,r){this.variableNames=["inputImage","outputImage","dy"],this.outputShape=[],this.outputShape=e,this.depth=e[3],this.depthRadius=t,this.bias=s,this.alpha=o,this.beta=r,this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int r = coords[1];
        int c = coords[2];

        float result = 0.0;
        for (int d = 0; d < ${this.depth}; ++d) {
          int depthBegin = int(max(0.0, float(d - ${t})));
          int depthEnd = int(min(float(${this.depth}),
              float(d + ${t} + 1)));

          const int MIN_DEPTH_BEGIN = 0;
          const int MAX_DEPTH_END = ${this.depth};

          float norm = 0.0;
          for (int k = MIN_DEPTH_BEGIN; k < MAX_DEPTH_END; ++k) {
            if (k < depthBegin){
              continue;
            }
            else if (k >= depthBegin && k < depthEnd) {
              norm += getInputImage(b, r, c, k) * getInputImage(b, r, c, k);
            }
            else {
              break;
            }
          }

          norm = float(${o}) * norm + float(${s});

          for(int k = MIN_DEPTH_BEGIN; k < MAX_DEPTH_END; ++k){
            if (k < depthBegin){
              continue;
            }
            else if (k >= depthBegin && k < depthEnd){
              float dyi = -2.0 * float(${o})
                * float(${r})
                * getInputImage(b, r, c, k) * getOutputImage(b, r, c, d)
                / norm;
              if (k == d) {
                dyi += pow(norm, -1.0 * ${r});
              }
              if (k == coords[3]) {
                dyi *= getDy(b, r, c, d);
                result += dyi;
              }
            }
            else {
              break;
            }
          }
      }
      setOutput(result);
      }
    `}}const QW={kernelName:mu,backendName:"webgl",kernelFunc:n=>{const{inputs:e,backend:t,attrs:s}=n,{x:o,y:r,dy:i}=e,{depthRadius:a,bias:l,alpha:c,beta:u}=s,h=new ZW(o.shape,a,l,c,u);return t.runWebGLProgram(h,[o,r,i],o.dtype)}};function JW(n,e,t,s){const o=q(e),i=q(n.shape)/o,a=ne({inputs:{x:n},attrs:{shape:[i,o]},backend:s}),l=bo(a,n.dtype,"max",s),c=ne({inputs:{x:l},attrs:{shape:t},backend:s});return s.disposeIntermediateTensorInfo(a),s.disposeIntermediateTensorInfo(l),c}function My(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{reductionIndices:r,keepDims:i}=s,a=o.shape.length,l=Ce(r,o.shape);let c=l;const u=je(c,a),h=u!=null,d=t.shouldExecuteOnCPU([o]);let p=o;if(h){if(d){const w=t.texData.get(p.dataId).values,y=new Array(a);for(let N=0;N<y.length;N++)y[N]=o.shape[u[N]];const C=lp(w,o.shape,o.dtype,u,y);p=t.makeTensorInfo(y,o.dtype);const $=t.texData.get(p.dataId);$.values=C}else p=yc(o,u,t);c=et(c.length,a)}Ct("max",c,a);const[f,m]=gt(p.shape,c);let g=f;i&&(g=rt(f,l));let x;if(d){const w=t.texData.get(p.dataId).values,y=PP(w,q(m),g,o.dtype);x=t.makeTensorInfo(g,o.dtype);const C=t.texData.get(x.dataId);C.values=y}else x=JW(p,m,g,t);return h&&t.disposeIntermediateTensorInfo(p),x}const e4={kernelName:Sa,backendName:"webgl",kernelFunc:My};const t4=cp+`
  return max(a, b);
`,n4=`
  vec4 result = vec4(max(a, b));
  bvec4 isNaNA = isnan(a);
  bvec4 isNaNB = isnan(b);
  bvec4 isNaN = bvec4(isNaNA.x || isNaNB.x, isNaNA.y || isNaNB.y, isNaNA.z || isNaNB.z, isNaNA.w || isNaNB.w);
  `+xo+`
  return result;
`,s4=$t({opSnippet:t4,packedOpSnippet:n4,cpuKernelImpl:BP}),o4={kernelName:Fr,backendName:"webgl",kernelFunc:s4};function r4(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e;Wi(o,"maxPool");const{filterSize:r,strides:i,pad:a,dimRoundingMode:l}=s,c=1;k(Nt(i,c),()=>`Error in maxPool: Either strides or dilations must be 1. Got strides ${i} and dilations '${c}'`);const u=sn(o.shape,r,i,c,a,l);if(u.filterWidth===1&&u.filterHeight===1&&Ee(u.inShape,u.outShape))return Xt({inputs:{x:o},backend:t});const h=new Hi(u,"max",!1);return t.runWebGLProgram(h,[o],o.dtype)}const i4={kernelName:Na,backendName:"webgl",kernelFunc:r4};function a4(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{filterSize:r,strides:i,pad:a,dataFormat:l,dimRoundingMode:c}=s,u=[1,1,1],h=Yn(o.shape,r,i,u,a,c,l),d=new hp(h,"max",!1);return t.runWebGLProgram(d,[o],o.dtype)}const l4={kernelName:Ta,backendName:"webgl",kernelFunc:a4};class c4{constructor(e){this.variableNames=["dy","maxPos"],this.outputShape=e.inShape;const t=e.strideHeight,s=e.strideWidth,o=e.dilationHeight,r=e.effectiveFilterHeight,i=e.effectiveFilterWidth,a=r-1-e.padInfo.top,l=i-1-e.padInfo.left,c=r*i-1;this.userCode=`
      const ivec2 pads = ivec2(${a}, ${l});

      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];

        ivec2 dyRCCorner = coords.yz - pads;
        int dyRCorner = dyRCCorner.x;
        int dyCCorner = dyRCCorner.y;

        // Convolve dy(?, ?, d) with pos mask(:, :, d) to get dx(xR, xC, d).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;
        for (int wR = 0; wR < ${r};
          wR += ${o}) {
          float dyR = float(dyRCorner + wR) / ${t}.0;

          if (dyR < 0.0 || dyR >= ${e.outHeight}.0 || fract(dyR) > 0.0) {
            continue;
          }
          int idyR = int(dyR);

          for (int wC = 0; wC < ${i}; wC++) {
            float dyC = float(dyCCorner + wC) / ${s}.0;

            if (dyC < 0.0 || dyC >= ${e.outWidth}.0 ||
                fract(dyC) > 0.0) {
              continue;
            }
            int idyC = int(dyC);

            float dyValue = getDy(b, idyR, idyC, d);
            int maxPosValue = ${c} - int(getMaxPos(b, idyR, idyC, d));

            // Get the current value, check it against the value from the
            // position matrix.
            int curPosValue = wR * ${i} + wC;
            float mask = float(maxPosValue == curPosValue ? 1.0 : 0.0);

            dotProd += dyValue * mask;
          }
        }
        setOutput(dotProd);
      }
    `}}class u4{constructor(e){this.variableNames=["dy","maxPos"],this.outputShape=e.inShape;const t=e.strideDepth,s=e.strideHeight,o=e.strideWidth,r=e.dilationDepth,i=e.dilationHeight,a=e.dilationWidth,l=e.effectiveFilterDepth,c=e.effectiveFilterHeight,u=e.effectiveFilterWidth,h=l-1-e.padInfo.front,d=c-1-e.padInfo.top,p=u-1-e.padInfo.left,f=l*c*u-1;this.userCode=`
      const ivec3 pads = ivec3(${h}, ${d}, ${p});

      void main() {
        ivec5 coords = getOutputCoords();
        int batch = coords.x;
        int ch = coords.u;

        ivec3 dyCorner = ivec3(coords.y, coords.z, coords.w) - pads;
        int dyDCorner = dyCorner.x;
        int dyRCorner = dyCorner.y;
        int dyCCorner = dyCorner.z;

        // Convolve dy(?, ?, ?, ch) with pos mask(:, :, :, d) to get
        // dx(xD, xR, xC, ch).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;

        for (int wD = 0; wD < ${l};
           wD += ${r}) {
          float dyD = float(dyDCorner + wD) / ${t}.0;

          if (dyD < 0.0 || dyD >= ${e.outDepth}.0 || fract(dyD) > 0.0) {
            continue;
          }
          int idyD = int(dyD);

          for (int wR = 0; wR < ${c};
              wR += ${i}) {
            float dyR = float(dyRCorner + wR) / ${s}.0;

            if (dyR < 0.0 || dyR >= ${e.outHeight}.0 ||
                fract(dyR) > 0.0) {
              continue;
            }
            int idyR = int(dyR);

            for (int wC = 0; wC < ${u};
                wC += ${a}) {
              float dyC = float(dyCCorner + wC) / ${o}.0;

              if (dyC < 0.0 || dyC >= ${e.outWidth}.0 ||
                  fract(dyC) > 0.0) {
                continue;
              }
              int idyC = int(dyC);

              float dyValue = getDy(batch, idyD, idyR, idyC, ch);
              int maxPosValue = ${f} -
                  int(getMaxPos(batch, idyD, idyR, idyC, ch));

              // Get the current value, check it against the value from the
              // position matrix.
              int curPosValue =
                  wD * ${c} * ${u} +
                  wR * ${u} + wC;
              float mask = float(maxPosValue == curPosValue ? 1.0 : 0.0);

              dotProd += dyValue * mask;
            }
          }
        }
        setOutput(dotProd);
      }
    `}}function h4(n){const{inputs:e,backend:t,attrs:s}=n,{dy:o,input:r}=e,i=r,{filterSize:a,strides:l,pad:c,dimRoundingMode:u}=s,h=[1,1,1],d=Yn(i.shape,a,l,h,c,u),p=new hp(d,"max",!0),f=t.runWebGLProgram(p,[i],i.dtype),m=new u4(d),g=t.runWebGLProgram(m,[o,f],i.dtype);return t.disposeIntermediateTensorInfo(f),g}const d4={kernelName:xu,backendName:"webgl",kernelFunc:h4};function p4(n){const{inputs:e,backend:t,attrs:s}=n,{dy:o,input:r,output:i}=e,a=r;Wi([r,i],"maxPoolGrad");const{filterSize:l,strides:c,pad:u,dimRoundingMode:h}=s,d=sn(a.shape,l,c,1,u,h),p=!0,f=new Hi(d,"max",p),m=t.runWebGLProgram(f,[a],a.dtype),g=new c4(d),x=t.runWebGLProgram(g,[o,m],a.dtype);return t.disposeIntermediateTensorInfo(m),x}const f4={kernelName:gu,backendName:"webgl",kernelFunc:p4};function m4(n,e,t,s){let o=new Hi(t,"max",!1);const r=s.runWebGLProgram(o,[n],"float32");o=new Hi(t,"max",!0,!0,e);const i=s.runWebGLProgram(o,[n],"float32");return[r,i]}const g4={kernelName:Mp,backendName:"webgl",kernelFunc:({inputs:n,attrs:e,backend:t})=>{const{x:s}=n,{filterSize:o,strides:r,pad:i,includeBatchInIndex:a}=e,l=t;k(s.shape.length===4,()=>`Error in maxPool: input must be rank 4 but got rank ${s.shape.length}.`);const c=[1,1];k(Nt(r,c),()=>`Error in maxPool: Either strides or dilations must be 1. Got strides ${r} and dilations '${c}'`);const u=sn(s.shape,o,r,c,i),[h,d]=m4(s,a,u,l);return[h,d]}};function x4(n,e,t,s){const o=q(e),i=q(n.shape)/o,a=ne({inputs:{x:n},attrs:{shape:[i,o]},backend:s}),l=bo(a,"float32","mean",s),c=ne({inputs:{x:l},attrs:{shape:t},backend:s});return s.disposeIntermediateTensorInfo(a),s.disposeIntermediateTensorInfo(l),c}const b4={kernelName:Ea,backendName:"webgl",kernelFunc:({inputs:n,attrs:e,backend:t})=>{const{x:s}=n,{keepDims:o,axis:r}=e,i=t,a=s.shape.length,l=Ce(r,s.shape);let c=l;const u=je(c,a),h=u!=null,d=i.shouldExecuteOnCPU([s]),p=[];let f=s;if(h){if(d){const y=i.texData.get(f.dataId).values,C=new Array(a);for(let T=0;T<C.length;T++)C[T]=s.shape[u[T]];const $=lp(y,s.shape,s.dtype,u,C);f=i.makeTensorInfo(C,s.dtype);const N=i.texData.get(f.dataId);N.values=$}else f=yc(s,u,i);p.push(f),c=et(c.length,a)}Ct("sum",c,a);const[m,g]=gt(f.shape,c);let x=m;o&&(x=rt(m,l));const b=x4(f,g,x,i);for(const w of p)i.disposeIntermediateTensorInfo(w);return b}};function y4(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{axis:r,keepDims:i}=s,a=o.shape.length,l=Ce(r,o.shape);let c=l;const u=je(c,a);let h=o;u!=null&&(h=Mt({inputs:{x:o},backend:t,attrs:{perm:u}}),c=et(c.length,o.shape.length)),Ct("min",c,a);const[d,p]=gt(h.shape,c),f=q(p),m=ne({inputs:{x:h},backend:t,attrs:{shape:[-1,f]}}),g=bo(m,m.dtype,"min",t);let x;if(i){const b=rt(d,l);x=ne({inputs:{x:g},backend:t,attrs:{shape:b}})}else x=ne({inputs:{x:g},backend:t,attrs:{shape:d}});return t.disposeIntermediateTensorInfo(m),t.disposeIntermediateTensorInfo(g),u!=null&&t.disposeIntermediateTensorInfo(h),x}const w4={kernelName:Ra,backendName:"webgl",kernelFunc:y4};const C4=cp+`
  return min(a, b);
`,I4=`
  vec4 result = vec4(min(a, b));
  bvec4 isNaNA = isnan(a);
  bvec4 isNaNB = isnan(b);
  bvec4 isNaN = bvec4(isNaNA.x || isNaNB.x, isNaNA.y || isNaNB.y, isNaNA.z || isNaNB.z, isNaNA.w || isNaNB.w);
  `+xo+`
  return result;
`,$4=$t({opSnippet:C4,packedOpSnippet:I4,cpuKernelImpl:zP}),k4={kernelName:_r,backendName:"webgl",kernelFunc:$4};class v4{constructor(e,t,s){this.variableNames=["x"],this.outputShape=t.map((u,h)=>u[0]+e[h]+u[1]);const o=e.length,r=Oe(o),i=t.map(u=>u[0]).join(","),a=t.map((u,h)=>u[0]+e[h]).join(","),l=["coords[0]","coords[1]","coords[2]","coords[3]"].slice(0,o),c=s==="reflect"?0:1;if(o===1){this.userCode=`
        int start = ${i};
        int end = ${a};

        void main() {
          int outC = getOutputCoords();
          if (outC < start) {
            outC = start * 2 - outC - ${c};
          } else if(outC >= end) {
            outC = (end - 1) * 2 - outC + ${c};
          }
          setOutput(getX(outC - start));
        }
      `;return}this.userCode=`
      ${r} start = ${r}(${i});
      ${r} end = ${r}(${a});

      void main() {
        ${r} outC = getOutputCoords();
        for (int i = 0; i < ${o}; i++) {
          if (outC[i] < start[i]) {
            outC[i] = start[i] * 2 - outC[i] - ${c};
          } else if(outC[i] >= end[i]) {
            outC[i] = (end[i] - 1) * 2 - outC[i] + ${c};
          }
        }
        ${r} coords = outC - start;
        setOutput(getX(${l}));
      }
    `}}class S4{constructor(e,t,s){this.variableNames=["x"],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=t.map((f,m)=>f[0]+e[m]+f[1]);const o=e.length,r=Oe(o),i=t.map(f=>f[0]).join(","),a=t.map((f,m)=>f[0]+e[m]).join(","),l=Lt("rc",o),c=Lt("source",o),u=`${l[o-1]} < ${this.outputShape[o-1]}`,h=o===1?"source":`vec2(${c.slice(-2).join()})`,d=s==="reflect"?0:1;let p="";if(o===1){const f=`
        ${r} source = rc;
        if (source < start) {
          source = start * 2 - source - ${d};
        } else if (source >= end) {
          source = (end - 1) * 2 - source + ${d};
        }
        source -= start;
      `;p=`
        ${r} rc = outputLoc;
        ${f}
        result[0] = getChannel(getX(${c.join()}), ${h});
        ${l[o-1]} += 1;
        if(${u}) {
          ${f}
          result[1] = getChannel(getX(${c.join()}), ${h});
        }
      `}else{const f=`
        ${r} source = rc;
        ${r} lt = ${r}(lessThan(source, start));
        ${r} gte = ${r}(greaterThanEqual(source, end));
        ${r} orig = 1 - (lt + gte);
        source = orig * source +
                lt * (start * 2 - source - ${d}) +
                gte * ((end - 1) * 2 - source + ${d});
        source -= start;
      `;p=`
        ${r} rc = outputLoc;
        ${f}
        result[0] = getChannel(getX(${c.join()}), ${h});
        ${l[o-1]} += 1;
        if(${u}) {
          ${f}
          result[1] = getChannel(getX(${c.join()}), ${h});
        }
        rc = outputLoc;
        ${l[o-2]} += 1;
        if(${l[o-2]} < ${this.outputShape[o-2]}) {
          ${f}
          result[2] = getChannel(getX(${c.join()}), ${h});
          ${l[o-1]} += 1;
          if(${u}) {
            ${f}
            result[3] = getChannel(getX(${c.join()}), ${h});
          }
        }
      `}this.userCode=`
      const ${r} start = ${r}(${i});
      const ${r} end = ${r}(${a});

      void main() {
        ${r} outputLoc = getOutputCoords();
        vec4 result = vec4(0.);
        ${p}
        setOutput(result);
      }
    `}}const N4={kernelName:Aa,backendName:"webgl",kernelFunc:({inputs:n,backend:e,attrs:t})=>{const{x:s}=n,{paddings:o,mode:r}=t,i=V().getBool("WEBGL_PACK_ARRAY_OPERATIONS")?new S4(s.shape,o,r):new v4(s.shape,o,r);return e.runWebGLProgram(i,[s],s.dtype)}};const T4=`if (b == 0.0) return NAN;
  return mod(a, b);`,E4=`
  vec4 result = mod(a, b);
  bvec4 isNaN = equal(b, vec4(0.0));
  `+xo+`
  return result;
`,R4=$t({opSnippet:T4,packedOpSnippet:E4}),A4={kernelName:Or,backendName:"webgl",kernelFunc:R4};class D4{constructor(e,t,s){this.variableNames=["probs"],this.customUniforms=[{name:"seed",type:"float"}],this.outputShape=[e,s],this.userCode=`
      void main() {
        ivec2 coords = getOutputCoords();
        int batch = coords[0];

        float r = random(seed);
        float cdf = 0.0;

        for (int i = 0; i < ${t-1}; i++) {
          cdf += getProbs(batch, i);

          if (r < cdf) {
            setOutput(float(i));
            return;
          }
        }

        // If no other event happened, last event happened.
        setOutput(float(${t-1}));
      }
    `}}const Py=$t({opSnippet:`
if (a == b) {
  return 1.0;
};
return a / b;`,packedOpSnippet:`
  // vec4 one = vec4(equal(a, b));
  // return one + (vec4(1.0) - one) * a / b;
  vec4 result = a / b;
  if(a.x == b.x) {
    result.x = 1.;
  }
  if(a.y == b.y) {
    result.y = 1.;
  }
  if(a.z == b.z) {
    result.z = 1.;
  }
  if(a.w == b.w) {
    result.w = 1.;
  }

  return result;
`,checkOutOfBounds:!0}),F4={kernelName:yr,backendName:"webgl",kernelFunc:Py};const By="return a - b;",zy=$t({opSnippet:By,packedOpSnippet:By,supportsComplex:!0,cpuKernelImpl:a3}),_4={kernelName:Zr,backendName:"webgl",kernelFunc:zy};function Vy(n){const{inputs:e,backend:t,attrs:s}=n,{logits:o}=e,{dim:r}=s,i=Ce([r],o.shape),a=My({inputs:{x:o},backend:t,attrs:{reductionIndices:i,keepDims:!1}}),l=rt(a.shape,i),c=ne({inputs:{x:a},backend:t,attrs:{shape:l}}),u=zy({inputs:{a:o,b:c},backend:t}),h=Ay({inputs:{x:u},backend:t}),d=wc({inputs:{x:h},backend:t,attrs:{axis:i,keepDims:!1}}),p=ne({inputs:{x:d},backend:t,attrs:{shape:l}}),f=Py({inputs:{a:h,b:p},backend:t});return t.disposeIntermediateTensorInfo(a),t.disposeIntermediateTensorInfo(c),t.disposeIntermediateTensorInfo(u),t.disposeIntermediateTensorInfo(h),t.disposeIntermediateTensorInfo(d),t.disposeIntermediateTensorInfo(p),f}const O4={kernelName:Xa,backendName:"webgl",kernelFunc:Vy};function L4(n){const{inputs:e,backend:t,attrs:s}=n,{logits:o}=e,{numSamples:r,seed:i,normalized:a}=s,l=a?o:Vy({inputs:{logits:o},backend:t,attrs:{dim:o.shape.length-1}}),c=l.shape[0],u=l.shape[1],h=new D4(c,u,r),d=[[i]],p=t.runWebGLProgram(h,[l],"int32",d);return a||t.disposeIntermediateTensorInfo(l),p}const M4={kernelName:Pp,backendName:"webgl",kernelFunc:L4};const P4=pn+`
  return -x;
`,B4=`
  vec4 result = -x;
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`;function z4(n){const{inputs:e,backend:t}=n,{x:s}=e;if(t.shouldExecuteOnCPU([s])){const r=t.texData.get(s.dataId),[i,a]=WP(r.values,s.shape,s.dtype);return t.makeTensorInfo(a,s.dtype,i)}let o;return V().getBool("WEBGL_PACK_UNARY_OPERATIONS")?o=new Rs(s.shape,B4):o=new jn(s.shape,P4),t.runWebGLProgram(o,[s],s.dtype)}const V4={kernelName:Da,backendName:"webgl",kernelFunc:z4};const W4=kh;function U4(n){Yt("tf.nonMaxSuppression() in webgl locks the UI thread. Call tf.nonMaxSuppressionAsync() instead");const{inputs:e,backend:t,attrs:s}=n,{boxes:o,scores:r}=e,{maxOutputSize:i,iouThreshold:a,scoreThreshold:l}=s,c=t.readSync(o.dataId),u=t.readSync(r.dataId),{selectedIndices:h}=W4(c,u,i,a,l);return t.makeTensorInfo([h.length],"int32",new Int32Array(h))}const G4={kernelName:bu,backendName:"webgl",kernelFunc:U4};const H4=vh;function q4(n){Yt("tf.nonMaxSuppression() in webgl locks the UI thread. Call tf.nonMaxSuppressionAsync() instead");const{inputs:e,backend:t,attrs:s}=n,{boxes:o,scores:r}=e,{maxOutputSize:i,iouThreshold:a,scoreThreshold:l,padToMaxOutputSize:c}=s,u=t.readSync(o.dataId),h=t.readSync(r.dataId),{selectedIndices:d,validOutputs:p}=H4(u,h,i,a,l,c);return[t.makeTensorInfo([d.length],"int32",new Int32Array(d)),t.makeTensorInfo([],"int32",new Int32Array([p]))]}const j4={kernelName:yu,backendName:"webgl",kernelFunc:q4};const K4=Sh;function X4(n){Yt("tf.nonMaxSuppression() in webgl locks the UI thread. Call tf.nonMaxSuppressionAsync() instead");const{inputs:e,backend:t,attrs:s}=n,{boxes:o,scores:r}=e,{maxOutputSize:i,iouThreshold:a,scoreThreshold:l,softNmsSigma:c}=s,u=t.readSync(o.dataId),h=t.readSync(r.dataId),d=i,p=a,f=l,m=c,{selectedIndices:g,selectedScores:x}=K4(u,h,d,p,f,m);return[t.makeTensorInfo([g.length],"int32",new Int32Array(g)),t.makeTensorInfo([x.length],"float32",new Float32Array(x))]}const Y4={kernelName:wu,backendName:"webgl",kernelFunc:X4};class Z4{constructor(e,t,s,o){this.variableNames=["indices"],this.outputShape=[e,t],this.userCode=`
      void main() {
        ivec2 coords = getOutputCoords();
        int index = round(getIndices(coords.x));
        setOutput(mix(float(${o}), float(${s}),
                      float(index == coords.y)));
      }
    `}}const Q4={kernelName:Oa,backendName:"webgl",kernelFunc:n=>{const{inputs:e,backend:t,attrs:s}=n,{indices:o}=e,{dtype:r,depth:i,onValue:a,offValue:l}=s,c=q(o.shape),u=new Z4(c,i,a,l),h=ne({inputs:{x:o},backend:t,attrs:{shape:[c]}}),d=t.runWebGLProgram(u,[h],r);t.disposeIntermediateTensorInfo(h);const p=[...o.shape,i],f=ne({inputs:{x:d},backend:t,attrs:{shape:p}});return t.disposeIntermediateTensorInfo(d),f}};function Sc(n){const{inputs:e,backend:t}=n,{x:s}=e;if(s.dtype==="complex64"){const o=qi({inputs:{input:s},backend:t}),r=Sc({inputs:{x:o},backend:t}),i=kc({inputs:{input:s},backend:t}),a=Sc({inputs:{x:i},backend:t}),l=As({inputs:{real:r,imag:a},backend:t});return t.disposeIntermediateTensorInfo(o),t.disposeIntermediateTensorInfo(r),t.disposeIntermediateTensorInfo(i),t.disposeIntermediateTensorInfo(a),l}else return Xi({attrs:{shape:s.shape,dtype:s.dtype,value:s.dtype==="string"?"":0},backend:t})}const J4={kernelName:Qa,backendName:"webgl",kernelFunc:Sc};function Wy(n){const{inputs:e,backend:t}=n,{x:s}=e;if(s.dtype==="string")throw new Error("onesLike is not supported under string dtype");if(s.dtype==="complex64"){const o=qi({inputs:{input:s},backend:t}),r=Wy({inputs:{x:o},backend:t}),i=kc({inputs:{input:s},backend:t}),a=Sc({inputs:{x:i},backend:t}),l=As({inputs:{real:r,imag:a},backend:t});return t.disposeIntermediateTensorInfo(o),t.disposeIntermediateTensorInfo(r),t.disposeIntermediateTensorInfo(i),t.disposeIntermediateTensorInfo(a),l}else return Xi({attrs:{shape:s.shape,dtype:s.dtype,value:1},backend:t})}const eU={kernelName:_a,backendName:"webgl",kernelFunc:Wy};function tU(n){const{inputs:e,backend:t,attrs:s}=n,{axis:o}=s;if(e.length===1)return fp({inputs:{input:e[0]},backend:t,attrs:{dim:o}});const r=e[0].shape,i=e[0].dtype;e.forEach(u=>{_c(r,u.shape,"All tensors passed to stack must have matching shapes"),k(i===u.dtype,()=>"All tensors passed to stack must have matching dtypes")});const a=[],l=e.map(u=>{const h=fp({inputs:{input:u},backend:t,attrs:{dim:o}});return a.push(h),h}),c=wy({inputs:l,backend:t,attrs:{axis:o}});return a.forEach(u=>t.disposeIntermediateTensorInfo(u)),c}const nU={kernelName:La,backendName:"webgl",kernelFunc:tU};class sU{constructor(e,t,s){this.variableNames=["x"],this.customUniforms=[{name:"value",type:"float"}],this.outputShape=t.map((c,u)=>c[0]+e[u]+c[1]);const o=e.length,r=Oe(o),i=t.map(c=>c[0]).join(","),a=t.map((c,u)=>c[0]+e[u]).join(","),l=["coords[0]","coords[1]","coords[2]","coords[3]"].slice(0,o);if(o===1){this.userCode=`
        int start = ${i};
        int end = ${a};

        void main() {
          int outC = getOutputCoords();
          if (outC < start || outC >= end) {
            setOutput(value);
          } else {
            setOutput(getX(outC - start));
          }
        }
      `;return}this.userCode=`
      ${r} start = ${r}(${i});
      ${r} end = ${r}(${a});

      void main() {
        ${r} outC = getOutputCoords();
        if (any(lessThan(outC, start)) || any(greaterThanEqual(outC, end))) {
          setOutput(value);
        } else {
          ${r} coords = outC - start;
          setOutput(getX(${l}));
        }
      }
    `}}class oU{constructor(e,t,s){this.variableNames=["x"],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:"value",type:"float"}],this.outputShape=t.map((m,g)=>m[0]+e[g]+m[1]);const o=e.length,r=Oe(o),i=t.map(m=>m[0]).join(","),a=t.map((m,g)=>m[0]+e[g]).join(","),l=Lt("rc",o),c=Lt("source",o),u=`${l[o-1]} < ${this.outputShape[o-1]}`,h=o===1?"source":`vec2(${c.slice(-2).join()})`,d=[`${r} rc = outputLoc;`,`${l[o-1]} += 1;
       if(${u}) {
      `,o===1?"":`}
       rc = outputLoc;
       ${l[o-2]} += 1;
       if(${l[o-2]} < ${this.outputShape[o-2]}) {`,o===1?"":`  ${l[o-1]} += 1;
         if(${u}) {`],p=o===1?"rc < start || rc >= end":"any(lessThan(rc, start)) || any(greaterThanEqual(rc, end))";let f="";for(let m=0,g=o===1?2:4;m<g;m++)f+=`
        ${d[m]}
        if (${p}) {
          result[${m}] = float(value);
        } else {
          ${r} source = rc - start;
          result[${m}] = getChannel(getX(${c.join()}), ${h});
        }
      `;f+=o===1?"} ":"}}",this.userCode=`
      const ${r} start = ${r}(${i});
      const ${r} end = ${r}(${a});

      void main() {
        ${r} outputLoc = getOutputCoords();
        vec4 result = vec4(0.);
        ${f}
        setOutput(result);
      }
    `}}const Uy=n=>{const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{paddings:r,constantValue:i}=s;if(q(o.shape)===0){const c=r.map((u,h)=>u[0]+o.shape[h]+u[1]);return Xi({backend:t,attrs:{shape:c,value:i,dtype:o.dtype}})}const a=V().getBool("WEBGL_PACK_ARRAY_OPERATIONS")?new oU(o.shape,r,i):new sU(o.shape,r,i),l=[[i]];return t.runWebGLProgram(a,[o],o.dtype,l)},rU={kernelName:Ma,backendName:"webgl",kernelFunc:Uy};const iU=`
  if(a < 0.0 && floor(b) < b){
    return NAN;
  }
  if (b == 0.0) {
    return 1.0;
  }
  return (round(mod(b, 2.0)) != 1) ?
      pow(abs(a), b) : sign(a) * pow(abs(a), b);
`,aU=`
  // isModRound1 has 1 for components with round(mod(b, 2.0)) == 1, 0 otherwise.
  vec4 isModRound1 = vec4(equal(round(mod(b, 2.0)), ivec4(1)));
  vec4 multiplier = sign(a) * isModRound1 + (vec4(1.0) - isModRound1);
  vec4 result = multiplier * pow(abs(a), b);

  // Ensure that a^0 = 1, including 0^0 = 1 as this correspond to TF and JS
  bvec4 isExpZero = equal(b, vec4(0.0));
  result.r = isExpZero.r ? 1.0 : result.r;
  result.g = isExpZero.g ? 1.0 : result.g;
  result.b = isExpZero.b ? 1.0 : result.b;
  result.a = isExpZero.a ? 1.0 : result.a;

  bvec4 isNaN1 = lessThan(a, vec4(0.0));
  bvec4 isNaN2 = lessThan(floor(b), b);
  bvec4 isNaN = bvec4(isNaN1.x && isNaN2.x, isNaN1.y && isNaN2.y, isNaN1.z && isNaN2.z, isNaN1.w && isNaN2.w);
  `+xo+`
  return result;
`,lU=$t({opSnippet:iU,packedOpSnippet:aU}),cU={kernelName:Mr,backendName:"webgl",kernelFunc:lU};function uU(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{axis:r,keepDims:i}=s,a=o.shape.length,l=[],c=Ce(r,o.shape);let u=c;const h=je(u,a);let d=o;h!=null&&(d=Mt({inputs:{x:o},backend:t,attrs:{perm:h}}),u=et(u.length,a),l.push(d)),Ct("prod",u,a);let p;if(t.shouldExecuteOnCPU([d])){const f=t.texData.get(d.dataId).values,{outVals:m,outShape:g,outDtype:x}=GP(d.shape,d.dtype,f,u);p=t.makeTensorInfo(g,x,m)}else{const[f,m]=gt(d.shape,u),g=q(m),x=ne({inputs:{x:d},backend:t,attrs:{shape:[-1,g]}}),b=zu(o.dtype),w=bo(x,b,"prod",t);p=ne({inputs:{x:w},backend:t,attrs:{shape:f}}),l.push(x),l.push(w)}if(i){l.push(p);const f=rt(p.shape,c);p=ne({inputs:{x:p},backend:t,attrs:{shape:f}})}return l.forEach(f=>t.disposeIntermediateTensorInfo(f)),p}const hU={kernelName:Ba,backendName:"webgl",kernelFunc:uU};function dU(n){const{inputs:e,backend:t,attrs:s}=n,{paramsNestedSplits:o,paramsDenseValues:r,indices:i}=e,{outputRaggedRank:a}=s,l=o.map(x=>t.readSync(x.dataId)),c=o.map(x=>x.shape),u=t.readSync(r.dataId),h=t.readSync(i.dataId),[d,p,f]=HP(l,c,u,r.shape,r.dtype,h,i.shape,a),m=d.map(x=>t.makeTensorInfo([x.length],"int32",x)),g=t.makeTensorInfo(f,r.dtype,p);return m.concat([g])}const pU={kernelName:Bp,backendName:"webgl",kernelFunc:dU};function fU(n){const{inputs:e,backend:t}=n,{starts:s,limits:o,deltas:r}=e,i=t.readSync(s.dataId),a=t.readSync(o.dataId),l=t.readSync(r.dataId),[c,u]=qP(i,s.shape,s.dtype,a,o.shape,l,r.shape),h=t.makeTensorInfo([c.length],"int32",c),d=t.makeTensorInfo([u.length],s.dtype,u);return[h,d]}const mU={kernelName:zp,backendName:"webgl",kernelFunc:fU};function gU(n){const{inputs:e,backend:t,attrs:s}=n,{shape:o,values:r,defaultValue:i,rowPartitionTensors:a}=e,{rowPartitionTypes:l}=s,c=t.readSync(o.dataId),u=t.readSync(r.dataId),h=t.readSync(i.dataId),d=a.map(g=>t.readSync(g.dataId)),p=a.map(g=>g.shape),[f,m]=jP(c,o.shape,u,r.shape,r.dtype,h,i.shape,d,p,l);return t.makeTensorInfo(f,r.dtype,m)}const xU={kernelName:Vp,backendName:"webgl",kernelFunc:gU};const Gy=n=>{const{backend:e,attrs:t}=n,{start:s,stop:o,step:r,dtype:i}=t,a=KP(s,o,r,i);return e.makeTensorInfo([a.length],i,a)},bU={kernelName:Cu,backendName:"webgl",kernelFunc:Gy};const yU=Se({opSnippet:"return 1.0 / x;"}),wU={kernelName:Pr,backendName:"webgl",kernelFunc:yU};const CU=pn+`
  return (x < 0.0) ? 0.0 : x;
`,IU=Se({opSnippet:CU,packedOpSnippet:`
  vec4 result = x * vec4(greaterThanEqual(x, vec4(0.0)));
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`}),$U={kernelName:Br,backendName:"webgl",kernelFunc:IU};const kU=pn+`
  return (x < 0.0) ? 0.0 : min(6.0, x);
`,vU=Se({opSnippet:kU,packedOpSnippet:`
  vec4 result = min(x, vec4(6.)) * vec4(greaterThanEqual(x, vec4(0.0)));
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`}),SU={kernelName:zr,backendName:"webgl",kernelFunc:vU};class NU{constructor(e,t,s,o,r){this.variableNames=["A"],this.outputShape=[];const[i,a,l,c]=e;this.outputShape=[i,t,s,c];const u=[o&&t>1?a-1:a,o&&s>1?l-1:l],h=[o&&t>1?t-1:t,o&&s>1?s-1:s];let d;r?d="(vec2(yRC) + vec2(0.5)) * effectiveInputOverOutputRatioRC - vec2(0.5)":d="vec2(yRC) * effectiveInputOverOutputRatioRC",this.userCode=`
      const vec2 effectiveInputOverOutputRatioRC = vec2(
          ${u[0]/h[0]},
          ${u[1]/h[1]});
      const vec2 inputShapeRC = vec2(${a}.0, ${l}.0);

      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];
        ivec2 yRC = coords.yz;

        // Fractional source index.
        vec2 sourceFracIndexRC = ${d};

        // Compute the four integer indices.
        ivec2 sourceFloorRC = ivec2(max(sourceFracIndexRC, vec2(0.0)));
        ivec2 sourceCeilRC = ivec2(
          min(inputShapeRC - 1.0, ceil(sourceFracIndexRC)));

        float topLeft = getA(b, sourceFloorRC.x, sourceFloorRC.y, d);
        float bottomLeft = getA(b, sourceCeilRC.x, sourceFloorRC.y, d);
        float topRight = getA(b, sourceFloorRC.x, sourceCeilRC.y, d);
        float bottomRight = getA(b, sourceCeilRC.x, sourceCeilRC.y, d);

        vec2 fracRC = sourceFracIndexRC - vec2(sourceFloorRC);

        float top = topLeft + (topRight - topLeft) * fracRC.y;
        float bottom = bottomLeft + (bottomRight - bottomLeft) * fracRC.y;
        float newValue = top + (bottom - top) * fracRC.x;

        setOutput(newValue);
      }
    `}}class TU{constructor(e,t,s,o,r){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=[];const[i,a,l,c]=e;this.outputShape=[i,t,s,c];const u=[o&&t>1?a-1:a,o&&s>1?l-1:l],h=[o&&t>1?t-1:t,o&&s>1?s-1:s];let d;r?d="(vec3(yRC) + vec3(0.5)) * effectiveInputOverOutputRatioRC - vec3(0.5)":d="vec3(yRC) * effectiveInputOverOutputRatioRC",this.userCode=`
      const vec3 effectiveInputOverOutputRatioRC = vec3(
          ${u[0]/h[0]},
          ${u[1]/h[1]},
          ${u[1]/h[1]});
      const vec3 inputShapeRC = vec3(${a}.0, ${l}.0,
                                     ${l}.0);

      float getAValue(int b, int r, int c, int d) {
        return getChannel(getA(b, r, c, d), vec2(c, d));
      }

      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];
        // Calculate values for next column in yRC.z.
        ivec3 yRC = coords.yzz + ivec3(0, 0, 1);

        // Fractional source index.
        vec3 sourceFracIndexRC = ${d};

        // Compute the four integer indices.
        ivec3 sourceFloorRC = ivec3(max(sourceFracIndexRC, vec3(0.0)));
        ivec3 sourceCeilRC = ivec3(
          min(inputShapeRC - 1.0, ceil(sourceFracIndexRC)));

        // Should we calculate next column and row elements in 2x2 packed cell.
        bool hasNextCol = d < ${c-1};
        bool hasNextRow = coords.z < ${s-1};

        // In parallel, construct four corners for all four components in
        // packed 2x2 cell.
        vec4 topLeft = vec4(
          getAValue(b, sourceFloorRC.x, sourceFloorRC.y, d),
          hasNextCol ? getAValue(b, sourceFloorRC.x, sourceFloorRC.y, d + 1)
                     : 0.0,
          hasNextRow ? getAValue(b, sourceFloorRC.x, sourceFloorRC.z, d)
                     : 0.0,
          (hasNextRow && hasNextCol) ?
            getAValue(b, sourceFloorRC.x, sourceFloorRC.z, d + 1) : 0.0);

        vec4 bottomLeft = vec4(
          getAValue(b, sourceCeilRC.x, sourceFloorRC.y, d),
          hasNextCol ? getAValue(b, sourceCeilRC.x, sourceFloorRC.y, d + 1)
                     : 0.0,
          hasNextRow ? getAValue(b, sourceCeilRC.x, sourceFloorRC.z, d)
                     : 0.0,
          (hasNextRow && hasNextCol) ?
            getAValue(b, sourceCeilRC.x, sourceFloorRC.z, d + 1) : 0.0);

        vec4 topRight = vec4(
          getAValue(b, sourceFloorRC.x, sourceCeilRC.y, d),
          hasNextCol ? getAValue(b, sourceFloorRC.x, sourceCeilRC.y, d + 1)
                     : 0.0,
          hasNextRow ? getAValue(b, sourceFloorRC.x, sourceCeilRC.z, d)
                     : 0.0,
          (hasNextRow && hasNextCol) ?
            getAValue(b, sourceFloorRC.x, sourceCeilRC.z, d + 1) : 0.0);

        vec4 bottomRight = vec4(
          getAValue(b, sourceCeilRC.x, sourceCeilRC.y, d),
          hasNextCol ? getAValue(b, sourceCeilRC.x, sourceCeilRC.y, d + 1)
                     : 0.0,
          hasNextRow ? getAValue(b, sourceCeilRC.x, sourceCeilRC.z, d)
                     : 0.0,
          (hasNextRow && hasNextCol) ?
            getAValue(b, sourceCeilRC.x, sourceCeilRC.z, d + 1) : 0.0);

        vec3 fracRC = sourceFracIndexRC - vec3(sourceFloorRC);

        vec4 top = mix(topLeft, topRight, fracRC.yyzz);
        vec4 bottom = mix(bottomLeft, bottomRight, fracRC.yyzz);
        vec4 newValue = mix(top, bottom, fracRC.x);

        setOutput(newValue);
      }
    `}}function EU(n){const{inputs:e,backend:t,attrs:s}=n,{images:o}=e,{alignCorners:r,halfPixelCenters:i,size:a}=s,[l,c]=a,u=V().getBool("WEBGL_PACK_IMAGE_OPERATIONS")?new TU(o.shape,l,c,r,i):new NU(o.shape,l,c,r,i);return t.runWebGLProgram(u,[o],"float32")}const RU={kernelName:Wa,backendName:"webgl",kernelFunc:EU};class AU{constructor(e,t,s){this.variableNames=["dy"],this.outputShape=[],this.outputShape=t;const[,o,r]=t,[,i,a]=e,l=[s&&i>1?o-1:o,s&&a>1?r-1:r],c=[s&&i>1?i-1:i,s&&a>1?a-1:a],u=l[0]/c[0],h=l[1]/c[1],d=1/u,p=1/h,f=Math.ceil(d)*2+2,m=Math.ceil(p)*2+2;this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];
        int r = coords[1];
        int c = coords[2];

        float accumulator = 0.0;

        const float heightScale = float(${u});
        const float widthScale = float(${h});

        const float invHeightScale = float(${d});
        const float invWidthScale = float(${p});

        const int winHeight = int(${f});
        const int winWidth = int(${m});

        // Compute bounds for where in dy we will look
        float startRLerp = floor(float(r) * invHeightScale);
        int startDyR = int(startRLerp - float(winHeight / 2));

        float startCLerp = floor(float(c) * invWidthScale);
        int startDyC = int(startCLerp - float(winWidth / 2));

        // Loop over dy
        for (int dyROffset = 0; dyROffset < winHeight; dyROffset++) {
          int dyR = dyROffset + startDyR;

          // Guard against the window exceeding the bounds of dy
          if (dyR < 0 || dyR >= ${i}) {
            continue;
          }

          for (int dyCOffset = 0; dyCOffset < winWidth; dyCOffset++) {
            int dyC = dyCOffset + startDyC;

            // Guard against the window exceeding the bounds of dy
            if (dyC < 0 || dyC >= ${a}) {
              continue;
            }

            float dxR = float(dyR) * heightScale;
            int topDxRIndex = int(floor(dxR));
            int bottomDxRIndex = int(min(ceil(dxR), ${o-1}.0));
            float dxRLerp = dxR - float(topDxRIndex);
            float inverseDxRLerp = 1.0 - dxRLerp;

            float dxC = float(dyC) * widthScale;
            int leftDxCIndex = int(floor(dxC));
            int rightDxCIndex = int(min(ceil(dxC), ${r-1}.0));
            float dxCLerp = dxC - float(leftDxCIndex);
            float inverseDxCLerp = 1.0 - dxCLerp;

            if (r == topDxRIndex && c == leftDxCIndex) {
              // topLeft
              accumulator +=
                getDy(b, dyR, dyC, d) * inverseDxRLerp * inverseDxCLerp;
            }

            if (r == topDxRIndex && c == rightDxCIndex) {
              // topRight
              accumulator += getDy(b, dyR, dyC, d) * inverseDxRLerp * dxCLerp;
            }

            if (r == bottomDxRIndex && c == leftDxCIndex) {
              // bottomLeft
              accumulator += getDy(b, dyR, dyC, d) * dxRLerp * inverseDxCLerp;
            }

            if (r == bottomDxRIndex && c == rightDxCIndex) {
              // bottomRight
              accumulator += getDy(b, dyR, dyC, d) * dxRLerp * dxCLerp;
            }
          }
        }
        // End loop over dy

        setOutput(accumulator);
      }
    `}}function DU(n){const{inputs:e,backend:t,attrs:s}=n,{images:o,dy:r}=e,{alignCorners:i}=s,a=new AU(r.shape,o.shape,i);return t.runWebGLProgram(a,[r],r.dtype)}const FU={kernelName:ku,backendName:"webgl",kernelFunc:DU};class _U{constructor(e,t,s,o,r){this.variableNames=["A"],this.outputShape=[];const[i,a,l,c]=e;this.outputShape=[i,t,s,c];const u=[o&&t>1?a-1:a,o&&s>1?l-1:l],h=[o&&t>1?t-1:t,o&&s>1?s-1:s],d=o?"0.5":"0.0";let p;r?p="max((vec2(yRC) + vec2(0.5)) * effectiveInputOverOutputRatioRC, vec2(0.0))":p="vec2(yRC) * effectiveInputOverOutputRatioRC",this.userCode=`
      const vec2 effectiveInputOverOutputRatioRC = vec2(
          ${u[0]/h[0]},
          ${u[1]/h[1]});
      const vec2 inputShapeRC = vec2(${a}.0, ${l}.0);

      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];
        ivec2 yRC = coords.yz;

        // Fractional source index.
        vec2 sourceFracIndexRC = ${p};

        // Compute the coordinators of nearest neighbor point.
        ivec2 sourceNearestRC = ivec2(
          min(inputShapeRC - 1.0, floor(sourceFracIndexRC + ${d})));
        float newValue = getA(b, sourceNearestRC.x, sourceNearestRC.y, d);

        setOutput(newValue);
      }
    `}}class OU{constructor(e,t,s,o,r){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=[];const[i,a,l,c]=e;this.outputShape=[i,t,s,c];const u=[o&&t>1?a-1:a,o&&s>1?l-1:l],h=[o&&t>1?t-1:t,o&&s>1?s-1:s],d=o?"0.5":"0.0";let p;r?p="max((vec3(yRC) + vec3(0.5)) * effectiveInputOverOutputRatioRC, vec3(0.0))":p="vec3(yRC) * effectiveInputOverOutputRatioRC",this.userCode=`
      const vec3 effectiveInputOverOutputRatioRC = vec3(
          ${u[0]/h[0]},
          ${u[1]/h[1]},
          ${u[1]/h[1]});
      const vec3 inputShapeRC = vec3(${a}.0, ${l}.0,
                                     ${l}.0);

      float getAValue(int b, int r, int c, int d) {
        return getChannel(getA(b, r, c, d), vec2(c, d));
      }

      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];
        // Calculate values for next column in yRC.z.
        ivec3 yRC = coords.yzz + ivec3(0, 0, 1);

        // Fractional source index.
        vec3 sourceFracIndexRC = ${p};

        // Compute the coordinators of nearest neighbor point.
        ivec3 sourceNearestRC = ivec3(
          min(inputShapeRC - 1.0, floor(sourceFracIndexRC + ${d})));

        // Should we calculate next column and row elements in 2x2 packed cell.
        bool hasNextCol = d < ${c-1};
        bool hasNextRow = coords.z < ${s-1};

        vec4 newValue = vec4(
          getAValue(b, sourceNearestRC.x, sourceNearestRC.y, d),
          hasNextCol ? getAValue(b, sourceNearestRC.x, sourceNearestRC.y, d + 1)
                     : 0.0,
          hasNextRow ? getAValue(b, sourceNearestRC.x, sourceNearestRC.z, d)
                     : 0.0,
          (hasNextRow && hasNextCol) ?
            getAValue(b, sourceNearestRC.x, sourceNearestRC.z, d + 1) : 0.0);

        setOutput(newValue);
      }
    `}}function LU(n){const{inputs:e,backend:t,attrs:s}=n,{images:o}=e,{alignCorners:r,halfPixelCenters:i,size:a}=s,[l,c]=a,u=V().getBool("WEBGL_PACK_IMAGE_OPERATIONS")?new OU(o.shape,l,c,r,i):new _U(o.shape,l,c,r,i);return t.runWebGLProgram(u,[o],o.dtype)}const MU={kernelName:Va,backendName:"webgl",kernelFunc:LU};class PU{constructor(e,t,s){this.variableNames=["dy"],this.outputShape=[],this.outputShape=t;const[,o,r]=t,[,i,a]=e,l=[s&&i>1?o-1:o,s&&a>1?r-1:r],c=[s&&i>1?i-1:i,s&&a>1?a-1:a],u=l[0]/c[0],h=l[1]/c[1],d=1/u,p=1/h,f=Math.ceil(d)*2+2,m=Math.ceil(p)*2+2;this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];
        int r = coords[1];
        int c = coords[2];

        float accumulator = 0.0;

        const float heightScale = float(${u});
        const float widthScale = float(${h});

        const float invHeightScale = float(${d});
        const float invWidthScale = float(${p});

        const int winHeight = int(${f});
        const int winWidth = int(${m});

        // Compute bounds for where in dy we will look
        float startRLerp = floor(float(r) * invHeightScale);
        int startDyR = int(floor(startRLerp - float(winHeight / 2)));

        float startCLerp = floor(float(c) * invWidthScale);
        int startDyC = int(floor(startCLerp - float(winWidth / 2)));

        // Loop over dy
        for (int dyROffset = 0; dyROffset < winHeight; dyROffset++) {
          int dyR = dyROffset + startDyR;

          // Guard against the window exceeding the bounds of dy
          if (dyR < 0 || dyR >= ${i}) {
            continue;
          }

          for (int dyCOffset = 0; dyCOffset < winWidth; dyCOffset++) {
            int dyC = dyCOffset + startDyC;

            // Guard against the window exceeding the bounds of dy
            if (dyC < 0 || dyC >= ${a}) {
              continue;
            }

            float sourceFracRow =
              float(${l[0]}) *
                (float(dyR) / float(${c[0]}));

            float sourceFracCol =
                float(${l[1]}) *
                  (float(dyC) / float(${c[1]}));

            int sourceNearestRow = int(min(
                float(int(${o}) - 1),
                ${s} ? float(round(sourceFracRow)) :
                                  float(floor(sourceFracRow))));

            int sourceNearestCol = int(min(
                float(int(${r}) - 1),
                ${s} ? float(round(sourceFracCol)) :
                                  float(floor(sourceFracCol))));

            if (r == sourceNearestRow && c == sourceNearestCol) {
              accumulator += getDy(b, dyR, dyC, d);
            }
          }
        }
        // End loop over dy

        setOutput(accumulator);
      }
    `}}function BU(n){const{inputs:e,backend:t,attrs:s}=n,{images:o,dy:r}=e,{alignCorners:i}=s,a=new PU(r.shape,o.shape,i);return t.runWebGLProgram(a,[r],r.dtype)}const zU={kernelName:$u,backendName:"webgl",kernelFunc:BU};class VU{constructor(e,t){this.variableNames=["x"];const s=e.length;if(s>4)throw new Error(`WebGL backend: Reverse of rank-${s} tensor is not yet supported`);if(this.outputShape=e,s===1){this.userCode=`
        void main() {
          int coord = getOutputCoords();
          setOutput(getX(${e[0]} - coord - 1));
        }
      `;return}const o=a=>t.indexOf(a)!==-1&&e[a]!==1?`${e[a]} - coords[${a}] - 1`:`coords[${a}]`,r=e.map((a,l)=>o(l)).join(","),i=Oe(s);this.userCode=`
      void main() {
        ${i} coords = getOutputCoords();
        setOutput(getX(${r}));
      }
    `}}class WU{constructor(e,t){this.variableNames=["x"],this.packedInputs=!0,this.packedOutput=!0;const s=e.length;if(s>4)throw new Error(`WebGL backend: Reverse of rank-${s} tensor is not yet supported`);this.outputShape=e;const o=Lt("rc",s),r=`${o[s-1]} + 1 < ${this.outputShape[s-1]}`,i=`${o[s-2]} + 1 < ${this.outputShape[s-2]}`,a=Oe(s);s===1?this.userCode=`
        void main(){
          int rc = getOutputCoords();
          vec4 result = vec4(0.);
          result.r = getChannel(getX(${e[0]} - rc - 1),
            ${e[0]} - rc - 1);
          if(${r}){
              result.g = getChannel(getX(${e[0]} - (rc  + 1) - 1),
                ${e[0]} - (rc  + 1) - 1);
          }
          setOutput(result);
        }
      `:this.userCode=`
        void main() {
          ${a} rc = getOutputCoords();
          vec4 result = vec4(0.);
          result.r = ${l(o.slice())};
          if(${r}){
            result.g = ${c(o.slice())};
          }
          if(${i}) {
            result.b = ${u(o.slice())};
            if(${r}) {
              result.a = ${h(o.slice())};
            }
          }
          setOutput(result);
        }
    `;function l(f){return d(f)}function c(f){return f[s-1]="("+f[s-1]+" + 1)",d(f)}function u(f){return f[s-2]="("+f[s-2]+" + 1)",d(f)}function h(f){return f[s-1]="("+f[s-1]+" + 1)",f[s-2]="("+f[s-2]+" + 1)",d(f)}function d(f){const m=e.map((b,w)=>p(w,f)),g=m.join(","),x=m.slice(-2).join(",");return`getChannel(getX(${g}), vec2(${x}))`}function p(f,m){return t.indexOf(f)!==-1&&e[f]!==1?`${e[f]} - ${m[f]} - 1`:`${m[f]}`}}}function UU(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{dims:r}=s,i=o.shape.length,a=Ce(r,o.shape);if(i===0)return Xt({inputs:{x:o},backend:t});const l=V().getBool("WEBGL_PACK_ARRAY_OPERATIONS")?new WU(o.shape,a):new VU(o.shape,a);return t.runWebGLProgram(l,[o],o.dtype)}const GU={kernelName:Ua,backendName:"webgl",kernelFunc:UU};class HU{constructor(e,t){this.variableNames=["Image"],this.outputShape=[],this.customUniforms=[{name:"params",type:"vec4"}];const s=e[1],o=e[2];this.outputShape=e;let r="";typeof t=="number"?r=`float outputValue = ${t.toFixed(2)};`:r=`
        vec3 fill = vec3(${t.join(",")});
        float outputValue = fill[coords[3]];`,this.userCode=`
        void main() {
          ivec4 coords = getOutputCoords();
          int x = coords[2];
          int y = coords[1];
          float coordXFloat = (float(x) - params[0]) * params[3] -
            (float(y) - params[1]) * params[2];
          float coordYFloat = (float(x) - params[0]) * params[2] +
            (float(y) - params[1]) * params[3];
          int coordX = int(round(coordXFloat + params[0]));
          int coordY = int(round(coordYFloat + params[1]));
          ${r}
          if(coordX >= 0 && coordX < ${o} && coordY >= 0 && coordY < ${s}) {
            outputValue = getImage(coords[0], coordY, coordX, coords[3]);
          }
          setOutput(outputValue);
        }
    `}}const qU={kernelName:Au,backendName:"webgl",kernelFunc:({inputs:n,attrs:e,backend:t})=>{const{image:s}=n,{radians:o,fillValue:r,center:i}=e,a=t,l=new HU(s.shape,r),[c,u]=Bh(i,s.shape[1],s.shape[2]),h=[[c,u,Math.sin(o),Math.cos(o)]];return a.runWebGLProgram(l,[s],s.dtype,h)}};const jU=Se({opSnippet:`
  // OpenGL ES does not support round function.
  // The algorithm is based on banker's rounding.
  float base = floor(x);
  if ((x - base) < 0.5) {
    return floor(x);
  } else if ((x - base) > 0.5) {
    return ceil(x);
  } else {
    if (mod(base, 2.0) == 0.0) {
      return base;
    } else {
      return base + 1.0;
    }
  }
`}),KU={kernelName:Vr,backendName:"webgl",kernelFunc:jU};const XU=Se({opSnippet:"return inversesqrt(x);",cpuKernelImpl:XP}),YU={kernelName:Wr,backendName:"webgl",kernelFunc:XU};class gp{constructor(e,t,s,o,r,i,a=!0,l=!1){this.variableNames=["updates","indices","defaultValue"],this.outputShape=i;const c=Oe(r.length),u=Oe(i.length);let h="";s===1?h="i":s===2&&(h="i, j");const d=`getIndices(${h})`;let p="";o===1?p="i":o===2&&(p="i, coords[1]");const f=`getUpdates(${p})`;let m="";l&&(m="coords[0], coords[1]");const g=`getDefaultValue(${m})`,x=t>1?"strides[j]":"strides";this.userCode=`
        ${c} strides = ${c}(${r});

        void main() {
          ${u} coords = getOutputCoords();
          float sum = 0.0;
          bool found = false;
          for (int i = 0; i < ${e}; i++) {
            int flattenedIndex = 0;
            for (int j = 0; j < ${t}; j++) {
              int index = round(${d});
              flattenedIndex += index * ${x};
            }
            if (flattenedIndex == coords[0]) {
              sum += ${f};
              found = true;
            }
          }
          setOutput(mix(${g}, sum, float(found)));
        }
      `}}class ZU{constructor(e,t,s,o,r,i,a=!0,l=!1){this.variableNames=["updates","indices","defaultValue"],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=i;const c=Oe(r.length),u=Oe(i.length);let h="";s===1?h="i":s===2&&(h="i, j");const d=`getIndices(${h})`;let p="";o===1?p="i":o===2&&(p="i, coords[1]");const f=`getUpdates(${p})`;let m="";l&&(m="coords[0], coords[1]");const g=`getDefaultValue(${m})`,x=t>1?"strides[j]":"strides",b=t>1?"strides[j + 1]":"strides";this.userCode=`
        ${c} strides = ${c}(${r});

        void main() {
          ${u} coords = getOutputCoords();
          vec4 sum = vec4(0.);
          vec4 found = vec4(0.);
          for (int i = 0; i < ${e}; i+=2) {
            ivec2 flattenedIndex = ivec2(0);
            for (int j = 0; j < ${t}; j+=2) {
              ivec4 index = round(${d});
              flattenedIndex += index.xz * ${x};
              if (j + 1 < ${t}) {
                flattenedIndex += index.yw * ${b};
              }
            }
            if (flattenedIndex[0] == coords[0] || flattenedIndex[1] == coords[0] ||
                flattenedIndex[0] == coords[0] + 1 || flattenedIndex[1] == coords[0] + 1) {
              vec4 updVals = ${f};
              if (flattenedIndex[0] == coords[0]) {
                sum.xy += updVals.xy;
                found.xy = vec2(1.);
              } else if (flattenedIndex[0] == coords[0] + 1) {
                sum.zw += updVals.xy;
                found.zw = vec2(1.);
              }
              if (flattenedIndex[1] == coords[0]) {
                sum.xy += updVals.zw;
                found.xy = vec2(1.);
              } else if (flattenedIndex[1] == coords[0] + 1) {
                sum.zw += updVals.zw;
                found.zw = vec2(1.);
              }
            }
          }
          setOutput(mix(${g}, sum, found));
        }
      `}}function QU(n){const{inputs:e,backend:t,attrs:s}=n,{indices:o,updates:r}=e,{shape:i}=s,{sliceRank:a,numUpdates:l,sliceSize:c,strides:u,outputSize:h}=to(r,o,i),d=[h/c,c];if(h===0)return t.makeTensorInfo(i,o.dtype);const p=ne({inputs:{x:o},backend:t,attrs:{shape:[l,a]}}),f=ne({inputs:{x:r},backend:t,attrs:{shape:[l,c]}}),m=t.makeTensorInfo([],"float32",new Float32Array([0]));let g;V().getBool("WEBGL_PACK")?g=new ZU(l,a,p.shape.length,f.shape.length,u,d):g=new gp(l,a,p.shape.length,f.shape.length,u,d);const x=t.runWebGLProgram(g,[f,p,m],f.dtype),b=ne({inputs:{x},backend:t,attrs:{shape:i}});return t.disposeIntermediateTensorInfo(p),t.disposeIntermediateTensorInfo(f),t.disposeIntermediateTensorInfo(x),t.disposeIntermediateTensorInfo(m),b}const JU={kernelName:Wp,backendName:"webgl",kernelFunc:QU};class eG{constructor(e,t,s,o){this.variableNames=["sortedSequence","values"],this.customUniforms=[{name:"numInputs",type:"int"}],this.outputShape=[e,s];const r="while (left < right) {",i=`for (int i = 0; i < ${Math.ceil(Math.log2(t+1))}; ++i) { if (left >= right) break;`,a=V().getNumber("WEBGL_VERSION")===2?r:i,l=o==="left"?"<":"<=";this.userCode=`
       int findBound(int batch, float value) {
         int left = 0;
         int right = numInputs;
         int mid;
         ${a}
           mid = (left + right) / 2;
           if (getSortedSequence(batch, mid) ${l} value) {
             left = mid + 1;
           } else {
             right = mid;
           }
         }
         return right;
       }

       void main() {
         ivec2 coords = getOutputCoords();
         int batch = coords[0];
         int valueIndex = coords[1];

         float value = getValues(batch, valueIndex);

         setOutput(float(findBound(batch, value)));
       }
     `}}function tG(n){const{inputs:e,backend:t,attrs:s}=n,{sortedSequence:o,values:r}=e,{side:i}=s,a=new eG(o.shape[0],o.shape[1],r.shape[1],i),l=[[o.shape[1]]];return t.runWebGLProgram(a,[o,r],"int32",l)}const nG={kernelName:Gp,backendName:"webgl",kernelFunc:tG};class sG{constructor(e,t,s){this.variableNames=["c","a","b"],this.outputShape=t;let o,r;if(s>4)throw Error(`Where for rank ${s} is not yet supported`);if(s===1)r="resRC",o="resRC";else{const a=["resRC.x","resRC.y","resRC.z","resRC.w"],l=[],c=[];for(let u=0;u<t.length;u++)c.push(`${a[u]}`),u<e&&l.push(`${a[u]}`);o=l.join(),r=c.join()}const i=Oe(s);this.userCode=`
      void main() {
        ${i} resRC = getOutputCoords();
        float cVal = getC(${o});
        if (cVal >= 1.0) {
          setOutput(getA(${r}));
        } else {
          setOutput(getB(${r}));
        }
      }
    `}}function oG(n){const{inputs:e,backend:t}=n,{condition:s,t:o,e:r}=e,i=new sG(s.shape.length,o.shape,o.shape.length);return t.runWebGLProgram(i,[s,o,r],Gt(o.dtype,r.dtype))}const rG={kernelName:Ga,backendName:"webgl",kernelFunc:oG};const iG=`
  // Stable and Attracting Fixed Point (0, 1) for Normalized Weights.
  // see: https://arxiv.org/abs/1706.02515
  float scaleAlpha = ${Rl};
  float scale = ${Al};
  return (x >= 0.0) ? scale * x : scaleAlpha * (exp(x) - 1.0);
`,aG=Se({opSnippet:iG}),lG={kernelName:Ur,backendName:"webgl",kernelFunc:aG};const cG=sr+`
  return 1.0 / (1.0 + exp(-1.0 * x));
`,uG=Se({opSnippet:cG,packedOpSnippet:`
  vec4 result = 1.0 / (1.0 + exp(-1.0 * x));
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`,cpuKernelImpl:ZP}),hG={kernelName:jr,backendName:"webgl",kernelFunc:uG};const dG=Se({opSnippet:`
  if (isnan(x)) { return 0.0; }
  return sign(x);
`}),pG={kernelName:qr,backendName:"webgl",kernelFunc:dG};const fG=sr+`
  return sin(x);
`,mG=`
  vec4 result = sin(x);
  bvec4 isNaN = isnan(x);
  ${xo}
  return result;
`,gG=Se({opSnippet:fG,packedOpSnippet:mG}),xG={kernelName:Gr,backendName:"webgl",kernelFunc:gG};const bG=Se({opSnippet:`
  float e2x = exp(x);
  return (e2x - 1.0 / e2x) / 2.0;
`}),yG={kernelName:Hr,backendName:"webgl",kernelFunc:bG};const wG=Se({opSnippet:`
  float epsilon = 1.1920928955078125e-7;
  float threshold = log(epsilon) + 2.0;

  bool too_large = x > -threshold;
  bool too_small = x < threshold;

  float result;
  float exp_x = exp(x);

  if (too_large){
    result = x;
  }
  else if (too_small){
    result = exp_x;
  }
  else{
    result = log(exp_x + 1.0);
  }
  return result;
`}),CG={kernelName:Kr,backendName:"webgl",kernelFunc:wG};const IG={kernelName:ja,backendName:"webgl",kernelFunc:n=>{const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{blockShape:r,paddings:i}=s;k(o.shape.length<=4,()=>"spaceToBatchND for rank > 4 with a WebGL backend not implemented yet");const a=r.reduce((x,b)=>x*b),l=[[0,0]];l.push(...i);for(let x=1+r.length;x<o.shape.length;++x)l.push([0,0]);const c=[],u=Uy({inputs:{x:o},backend:t,attrs:{paddings:l,constantValue:0}}),h=bi(u.shape,r,a,!1),d=yi(h.length,r.length,!1),p=wi(u.shape,r,a,!1),f=ne({inputs:{x:u},backend:t,attrs:{shape:h}}),m=Mt({inputs:{x:f},backend:t,attrs:{perm:d}}),g=ne({inputs:{x:m},backend:t,attrs:{shape:p}});return c.push(u),c.push(f),c.push(m),c.forEach(x=>t.disposeIntermediateTensorInfo(x)),g}};function $G(n){const{inputs:e,backend:t}=n,{indices:s,values:o,denseShape:r,defaultValue:i}=e;if(r.shape.length!==1)throw new Error(`Dense shape must be a vector, saw:
         ${r.shape}`);if(s.shape.length!==2)throw new Error(`Indices must be a matrix, saw:
         ${s.shape}`);if(o.shape.length!==1)throw new Error(`Values must be a vector, saw:
         ${o.shape}`);if(i.shape.length!==0)throw new Error(`Default value must be a scalar, saw:
        ${i.shape}`);const a=t.readSync(s.dataId),l=t.readSync(o.dataId),c=t.readSync(r.dataId),u=t.readSync(i.dataId)[0],[h,d,p,f,m]=JP(a,s.shape,s.dtype,l,o.dtype,c,u);return[t.makeTensorInfo(d,s.dtype,h),t.makeTensorInfo([d[0]],o.dtype,p),t.makeTensorInfo([f.length],"bool",new Uint8Array(f.map(g=>Number(g)))),t.makeTensorInfo([m.length],s.dtype,new Int32Array(m))]}const kG={kernelName:Hp,backendName:"webgl",kernelFunc:$G};function vG(n){const{inputs:e,backend:t}=n,{inputIndices:s,inputShape:o,newShape:r}=e;if(s.shape.length!==2)throw new Error(`Input indices should be a matrix but received shape ${s.shape}`);if(o.shape.length!==1)throw new Error(`Input shape should be a vector but received shape ${o.shape}`);if(r.shape.length!==1)throw new Error(`Target shape should be a vector but received shape ${r.shape}`);const i=Array.from(t.readSync(o.dataId)),a=t.readSync(s.dataId),l=Array.from(t.readSync(r.dataId)),[c,u,h]=e3(a,s.shape,s.dtype,i,l);return[t.makeTensorInfo(u,s.dtype,c),t.makeTensorInfo([h.length],r.dtype,new Int32Array(h))]}const SG={kernelName:qp,backendName:"webgl",kernelFunc:vG};function NG(n){const{inputs:e,backend:t}=n,{data:s,indices:o,segmentIds:r}=e;if(s.shape.length<1)throw new Error("Data should be at least 1 dimensional but received scalar");if(o.shape.length!==1)throw new Error(`Indices should be a vector but received shape
              ${o.shape}`);if(r.shape.length!==1)throw new Error(`Segment ids should be a vector but received shape
              ${r.shape}`);const i=t.readSync(s.dataId),a=t.readSync(o.dataId),l=t.readSync(r.dataId),[c,u]=X1(i,s.shape,s.dtype,a,l,!0);return t.makeTensorInfo(u,s.dtype,c)}const TG={kernelName:jp,backendName:"webgl",kernelFunc:NG};function EG(n){const{inputs:e,backend:t}=n,{data:s,indices:o,segmentIds:r}=e;if(s.shape.length<1)throw new Error("Data should be at least 1 dimensional but received scalar");if(o.shape.length!==1)throw new Error(`Indices should be a vector but received shape
             ${o.shape}`);if(r.shape.length!==1)throw new Error(`Segment ids should be a vector but received shape
             ${r.shape}`);const i=t.readSync(s.dataId),a=t.readSync(o.dataId),l=t.readSync(r.dataId),[c,u]=X1(i,s.shape,s.dtype,a,l);return t.makeTensorInfo(u,s.dtype,c)}const RG={kernelName:Kp,backendName:"webgl",kernelFunc:EG};function AG(n){const{inputs:e,backend:t,attrs:s}=n,{sparseIndices:o,sparseValues:r,defaultValue:i}=e,{outputShape:a}=s,{sliceRank:l,numUpdates:c,sliceSize:u,strides:h,outputSize:d}=to(r,o,a),p=!1;if(r.dtype==="string"){const x=t.bufferSync(o),b=t.bufferSync(r),w=hs(t.readSync(i.dataId)[0]),y=YP(x,b,a,d,u,c,l,h,w,p);return t.makeTensorInfo(a,y.dtype,y.values)}const f=new gp(c,l,o.shape.length,r.shape.length,h,[d,1],p),m=t.runWebGLProgram(f,[r,o,i],r.dtype),g=ne({inputs:{x:m},backend:t,attrs:{shape:a}});return t.disposeIntermediateTensorInfo(m),g}const DG={kernelName:Xp,backendName:"webgl",kernelFunc:AG};function FG(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{numOrSizeSplits:r,axis:i}=s,a=Ce(i,o.shape)[0],l=td(o,r,a),c=o.shape.length,u=new Array(c).fill(0),h=o.shape.slice();return l.map(d=>{const p=[...h];p[a]=d;const f=or({inputs:{x:o},backend:t,attrs:{begin:u,size:p}});return u[a]+=d,f})}const _G={kernelName:Ka,backendName:"webgl",kernelFunc:FG};const Hy="return sqrt(x);",OG=Se({opSnippet:Hy,packedOpSnippet:Hy,cpuKernelImpl:t3}),LG={kernelName:Xr,backendName:"webgl",kernelFunc:OG};const MG=Se({opSnippet:"return x * x;"}),PG={kernelName:vu,backendName:"webgl",kernelFunc:MG};const qy="return (a - b) * (a - b);",BG=$t({opSnippet:qy,packedOpSnippet:qy}),zG={kernelName:Yr,backendName:"webgl",kernelFunc:BG};function VG(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e;if(o.dtype!=="string")throw new Error("Input must be of datatype string");const r=t.readSync(o.dataId),i=ns(r),a=n3(i,"string",s);return t.makeTensorInfo(o.shape,"string",a)}const WG={kernelName:Su,backendName:"webgl",kernelFunc:VG};function UG({inputs:n,attrs:e,backend:t}){const{x:s}=n,o=pn+`
    return x > 0.0 ? 1.0 : float(${e.alpha});
  `,r=new jn(s.shape,o);return t.runWebGLProgram(r,[s],s.dtype)}const GG={kernelName:ti,backendName:"webgl",kernelFunc:UG};class HG{constructor(e,t,s){this.variableNames=["x"],this.outputShape=s;const o=s.length,r=Oe(s.length),i=Oe(s.length);let a="";if(o===1)a="coords * strides + begin";else{let l=0;a=s.map((c,u)=>(l++,s.length===1?`coords * strides[${u}] + begin[${u}]`:`coords[${l-1}] * strides[${u}] + begin[${u}]`)).join(",")}this.userCode=`
      ${r} begin = ${r}(${e});
      ${r} strides = ${r}(${t});

      void main() {
        ${i} coords = getOutputCoords();
        setOutput(getX(${a}));
      }
    `}}function qG(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{begin:r,end:i,strides:a,beginMask:l,endMask:c,ellipsisMask:u,newAxisMask:h,shrinkAxisMask:d}=s,{finalShapeSparse:p,finalShape:f,isIdentity:m,sliceDim0:g,isSimpleSlice:x,begin:b,end:w,strides:y}=Lh(o.shape,r,i,a,l,c,u,h,d);let C;if(m)C=ne({inputs:{x:o},backend:t,attrs:{shape:f}});else if(g||x){k(o.shape.length>=1,()=>`Input must have rank at least 1, got: ${o.shape.length}`);const N=Fh(b,w,y),T=or({inputs:{x:o},backend:t,attrs:{begin:b,size:N}});C=ne({inputs:{x:T},backend:t,attrs:{shape:f}}),t.disposeIntermediateTensorInfo(T)}else if(t.shouldExecuteOnCPU([o])){const T=t.readSync(o.dataId),S=Ie(o.shape,o.dtype,T),v=s3(p,S,y,b);C=t.makeTensorInfo(f,o.dtype,v.values)}else{const T=new HG(b,y,p);C=t.runWebGLProgram(T,[o],o.dtype)}const $=ne({inputs:{x:C},backend:t,attrs:{shape:f}});return t.disposeIntermediateTensorInfo(C),$}const jG={kernelName:Nu,backendName:"webgl",kernelFunc:qG};function KG(n){const{inputs:e,backend:t,attrs:s}=n,{separator:o,nGramWidths:r,leftPad:i,rightPad:a,padWidth:l,preserveShortSequences:c}=s,{data:u,dataSplits:h}=e,d=t.readSync(u.dataId),p=t.readSync(h.dataId),[f,m]=o3(d,p,o,r,i,a,l,c);return[t.makeTensorInfo([f.length],"string",f),t.makeTensorInfo(h.shape,"int32",m)]}const XG={kernelName:Yp,backendName:"webgl",kernelFunc:KG};function YG(n){const{inputs:e,backend:t,attrs:s}=n,{skipEmpty:o}=s,{input:r,delimiter:i}=e;if(r.dtype!=="string")throw new Error("Input must be of datatype string");if(r.shape.length!==1)throw new Error(`Input must be a vector, got shape: ${r.shape}`);if(i.shape.length!==0)throw new Error(`Delimiter must be a scalar, got shape: ${i.shape}`);const a=t.readSync(r.dataId),l=t.readSync(i.dataId)[0],[c,u,h]=r3(a,l,o),d=u.length;return[t.makeTensorInfo([d,2],"int32",c),t.makeTensorInfo([d],"string",u),t.makeTensorInfo([2],"int32",new Int32Array(h))]}const ZG={kernelName:Zp,backendName:"webgl",kernelFunc:YG};function QG(n){const{inputs:e,backend:t,attrs:s}=n,{numBuckets:o}=s,{input:r}=e;if(r.dtype!=="string")throw new Error("Input must be of datatype string");if(o<=0)throw new Error("Number of buckets must be at least 1");const i=t.readSync(r.dataId),a=i3(i,o);return t.makeTensorInfo(r.shape,"int32",a)}const JG={kernelName:Qp,backendName:"webgl",kernelFunc:QG};const eH=Se({opSnippet:"return tan(x);"}),tH={kernelName:Qr,backendName:"webgl",kernelFunc:eH};const nH=Se({opSnippet:`
  float e2x = exp(-2.0 * abs(x));
  return sign(x) * (1.0 - e2x) / (1.0 + e2x);
`}),sH={kernelName:Jr,backendName:"webgl",kernelFunc:nH};function oH(n){const{inputs:e,backend:t,attrs:s}=n,{tensor:o,indices:r,updates:i}=e,{sliceRank:a,numUpdates:l,sliceSize:c,strides:u,outputSize:h}=to(i,r,o.shape),d=[h/c,c];if(h===0)return t.makeTensorInfo(o.shape,r.dtype);const p=ne({inputs:{x:r},backend:t,attrs:{shape:[l,a]}}),f=ne({inputs:{x:i},backend:t,attrs:{shape:[l,c]}}),m=ne({inputs:{x:o},backend:t,attrs:{shape:d}}),g=new gp(l,a,p.shape.length,f.shape.length,u,d,!1,!0),x=t.runWebGLProgram(g,[f,p,m],m.dtype),b=ne({inputs:{x},backend:t,attrs:{shape:o.shape}});return t.disposeIntermediateTensorInfo(p),t.disposeIntermediateTensorInfo(f),t.disposeIntermediateTensorInfo(m),t.disposeIntermediateTensorInfo(x),b}const rH={kernelName:Up,backendName:"webgl",kernelFunc:oH};class iH{constructor(e,t){this.variableNames=["A"];const s=new Array(e.length);for(let i=0;i<s.length;i++)s[i]=e[i]*t[i];this.outputShape=s,this.rank=s.length;const o=Oe(this.rank),r=aH(e);this.userCode=`
      void main() {
        ${o} resRC = getOutputCoords();
        setOutput(getA(${r}));
      }
    `}}function aH(n){const e=n.length;if(e>5)throw Error(`Tile for rank ${e} is not yet supported`);if(e===1)return`imod(resRC, ${n[0]})`;const t=["resRC.x","resRC.y","resRC.z","resRC.w","resRC.u"],s=[];for(let o=0;o<n.length;o++)s.push(`imod(${t[o]}, ${n[o]})`);return s.join()}function jy(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{reps:r}=s;if(o.dtype==="string"||o.shape.length>5){const l=t.readSync(o.dataId),c=o.dtype==="string"?l.map(d=>hs(d)):l,u=Ie(o.shape,o.dtype,c),h=l3(u,r);return t.makeTensorInfo(h.shape,h.dtype,h.values)}const i=new iH(o.shape,r);return t.runWebGLProgram(i,[o],o.dtype)}const lH={kernelName:ei,backendName:"webgl",kernelFunc:jy};class cH{constructor(e){this.variableNames=["x","indices"],this.customUniforms=[{name:"n",type:"int"},{name:"firstPass",type:"int"},{name:"negativeInf",type:"float"},{name:"dir",type:"int"},{name:"inc",type:"int"}],this.outputShape=e,this.userCode=`
       void main() {
         ivec2 coords = getOutputCoords();
         int batch = coords[0];
         int elemIdx = coords[1];

         // We compare elements pair-wise within a group of size 2 * inc.
         // The comparing rule for each group alternates between ascending
         // and descending. Within each group, we compare each pair at
         // positions i and i+inc. To decide whether an element at position i
         // is x0 or x1, we mod it by 2 * inc, if the result is smaller than
         // inc, it is in the first half of the group, we denote it as x0,
         // otherwise we denote it as x1.
         // For example, as shown in the Bitonic top K paper referenced above,
         // Figure5(a) shows that element[1] is in the
         // second half of the group when group size is 2, but it is in the
         // first half of the group when group size is 4.

         bool isFirstInPair = imod(elemIdx, 2 * inc) < inc;
         int i = isFirstInPair ? elemIdx : elemIdx - inc;

         int i0 = firstPass == 1 ? i : int(getIndices(batch, i));
         int i1 = firstPass == 1 ? i + inc : int(getIndices(batch, i + inc));
         float x0 = i0 < n ? getX(batch, i0) : negativeInf;
         float x1 = i1 < n ? getX(batch, i1) : negativeInf;

         // Denotes which direction indices are in (ascending or descending).
         bool reverse = imod(elemIdx, 2 * dir) >= dir;
         bool isGreater = x0 > x1 || (x0 == x1 && i1 > i0);
         if (reverse == isGreater) { // Elements in opposite order of direction
           int iTemp = i0;
           i0 = i1;
           i1 = iTemp;
         }
         if (isFirstInPair) {
            setOutput(float(i0));
         } else {
            setOutput(float(i1));
         }
       }
     `}}class uH{constructor(e){this.variableNames=["x","indices"],this.customUniforms=[{name:"n",type:"int"},{name:"firstPass",type:"int"},{name:"k",type:"int"}],this.outputShape=e,this.userCode=`
    void main() {
         // Takes max of indices (0, k), (1, k + 1), (2, k + 2) ...
         ivec2 coords = getOutputCoords();
         int batch = coords[0];
         int elemIdx = coords[1];

         // The output size is half of the previous size.
         // If the previous sequence is | | | | _ _ _ _  | | | |  _ _ _ _ (k=4),
         // we only need to output the indices at positions |, the indices at
         // positions _ can be thrown away, see Figure5(b) After Phase 2
         // (Merge phase) in the Bitonic Top K paper referenced above.
         // For example, the paper shows we only need to output the orange bars.
         // The output sequence should look like this | | | | | | | |.
         // Because the sequence is halved, to map the output index back
         // to the previous sequence to find the corresponding value,
         // we need to double the index. When we double the index,
         // we basically interpolate a position, so 2i looks like
         // | _ | _ | _ | _ | _ | _ | _. We move the | to the first k position
         // of each 2k positions by - elemIdx % k. E.g. for output at
         // index 4,5,6,7, we want to get the corresponding element at
         // original index 8,9,10,11, for output at index 8,9,10,11,
         // we want to get the corresponding element at original index
         // 16,17,18,19, so on and so forth.

         int i = elemIdx < k ? elemIdx : (elemIdx * 2 - imod(elemIdx, k));
         int i0 = firstPass == 1 ? i : int(getIndices(batch, i));
         int i1 = firstPass == 1 ? i + k : int(getIndices(batch, i + k));

         float x0 = getX(batch, i0);
         float x1 = i1 < n ? getX(batch, i1) : x0;

         setOutput(x0 >= x1 ? float(i0) : float(i1));
       }
     `}}function yo(n,e){e!==null&&n.disposeIntermediateTensorInfo(e)}function Ky(n){let e=1;for(;e<n;)e*=2;return e}function hH(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{k:r,sorted:i}=s,a=V().getNumber("TOPK_LAST_DIM_CPU_HANDOFF_SIZE_THRESHOLD"),l=V().getNumber("TOPK_K_CPU_HANDOFF_THRESHOLD"),c=o.shape,u=c[c.length-1];if(t.shouldExecuteOnCPU([o])||u<a||r>l){const v=t.readSync(o.dataId),[I,R]=c3(v,c,o.dtype,r,i);return[t.makeTensorInfo(I.shape,I.dtype,I.values),t.makeTensorInfo(R.shape,R.dtype,R.values)]}if(r===0)return c[c.length-1]=0,[t.makeTensorInfo(c,o.dtype,[]),t.makeTensorInfo(c,"int32",[])];if(u===1)return[o,Xi({attrs:{shape:c,dtype:"int32",value:0},backend:t})];const h=t.texData.get(o.dataId),d=h!==null&&h.isPacked,p=d?t.unpackTensor(o):o,m=q(c)/u,g=ne({inputs:{x:p},attrs:{shape:[m,u]},backend:t});d&&yo(t,p);const x=Ky(r),b=Ky(u);let w=null;const y=()=>w===null?[g,g]:[g,w],C=(v,I,R)=>{const F=y(),O=new cH(R),z=[[u],[w===null?1:0],[Number.NEGATIVE_INFINITY],[v],[I]],U=w;w=t.runWebGLProgram(O,F,"int32",z),yo(t,U)};for(let v=1;v<x;v*=2){const I=v*2;for(let R=v;R>=1;R/=2)C(I,R,[m,b])}for(let v=b;v>x;v/=2){const I=y(),R=new uH([m,v/2]),O=[[u],[w===null?1:0],[x]],L=w;w=t.runWebGLProgram(R,I,"int32",O),yo(t,L);const z=x/2,U=z*2;for(let W=z;W>=1;W/=2)C(U,W,w.shape)}let $=w;w=or({inputs:{x:w},backend:t,attrs:{begin:0,size:[m,r]}}),yo(t,$);let N=Ly({inputs:{x:g,indices:w},backend:t,attrs:{axis:1,batchDims:1}});yo(t,g);const T=c.slice(0,-1);T.push(r),$=w,w=ne({inputs:{x:w},attrs:{shape:T},backend:t}),yo(t,$);const S=N;return N=ne({inputs:{x:N},attrs:{shape:T},backend:t}),yo(t,S),[N,w]}const dH={kernelName:Tu,backendName:"webgl",kernelFunc:hH};class pH{constructor(e,t,s,o,r,i){this.variableNames=["Image","Transforms"],this.outputShape=i;const a=s==="nearest"?1:2;let l;switch(o){case"constant":l=1;break;case"reflect":l=2;break;case"wrap":l=3;break;case"nearest":l=4;break;default:l=1;break}this.userCode=`
            float mapCoord(float outCoord, float len) {
              float inCoord = outCoord;
              if(${l} == 2) {
                if (inCoord < 0.0) {
                  if (len <= 1.0) {
                    inCoord = 0.0;
                  } else {
                    float sz2 = 2.0 * len;
                    if (inCoord < sz2) {
                      inCoord = sz2 * float(int(float(-inCoord / sz2))) +
                      inCoord;
                    }
                    inCoord = inCoord < -len ? inCoord + sz2 : -inCoord - 1.0;
                  }
                } else if (inCoord > len - 1.0) {
                  if (len <= 1.0) {
                    inCoord = 0.0;
                  } else {
                    float sz2 = 2.0 * len;
                    inCoord -= sz2 * float(int(float(inCoord / sz2)));
                    if (inCoord >= len) {
                      inCoord = sz2 - inCoord - 1.0;
                    }
                  }
                }
                return clamp(inCoord, 0.0, len - 1.0);
              } else if (${l} == 3) {
                if (inCoord < 0.0) {
                  if (len <= 1.0) {
                    inCoord = 0.0;
                  } else {
                    float sz = len - 1.0;
                    inCoord += len * (float(int(float(-inCoord / sz))) + 1.0);
                  }
                } else if (inCoord > len - 1.0) {
                  if (len <= 1.0) {
                    inCoord = 0.0;
                  } else {
                    float sz = len - 1.0;
                    inCoord -= len * float(int(float(inCoord / sz)));
                  }
                }
                return clamp(inCoord, 0.0, len - 1.0);
              } else if (${l} == 4) {
                return clamp(outCoord, 0.0, len - 1.0);
              } else {
                return outCoord;
              }
            }

            float readWithFillValue(int batch, int coordY, int coordX,
              int channel) {
              float outputValue;
              if (0 <= coordY && coordY < ${e} && 0 <= coordX && coordX < ${t}) {
                  outputValue = getImage(batch, coordY, coordX, channel);
              } else {
                outputValue = float(${r});
              }
              return outputValue;
            }

            void main() {
              ivec4 coords = getOutputCoords();
              float outputValue;
              int batch = coords[0];
              int x = coords[2];
              int y = coords[1];
              int channel = coords[3];
              float xf = float(x);
              float yf = float(y);
              float a1 = getTransforms(batch, 0);
              float a2 = getTransforms(batch, 1);
              float a3 = getTransforms(batch, 2);
              float b1 = getTransforms(batch, 3);
              float b2 = getTransforms(batch, 4);
              float b3 = getTransforms(batch, 5);
              float c1 = getTransforms(batch, 6);
              float c2 = getTransforms(batch, 7);
              float projection = c1 * xf + c2 * yf + 1.0;
              if (projection == 0.0) {
                outputValue = float(${r});
              } else {
                float inX = (a1 * xf + a2 * yf + a3) / projection;
                float inY = (b1 * xf + b2 * yf + b3) / projection;
                float mapX = mapCoord(inX, float(${t}));
                float mapY = mapCoord(inY, float(${e}));

                if (${a} == 1) {
                  int coordY = int(round(mapY));
                  int coordX = int(round(mapX));
                  outputValue = readWithFillValue(batch, coordY, coordX,
                    channel);
                } else {
                  float yFloor = floor(mapY);
                  float xFloor = floor(mapX);
                  float yCeil = yFloor + 1.0;
                  float xCeil = xFloor + 1.0;
                  float valueYFloor = (xCeil - mapX) *
                  readWithFillValue(batch, int(yFloor), int(xFloor), channel) +
                  (mapX - xFloor) *
                  readWithFillValue(batch, int(yFloor), int(xCeil), channel);
                  float valueYCeil = (xCeil - mapX) *
                  readWithFillValue(batch, int(yCeil), int(xFloor), channel) +
                  (mapX - xFloor) *
                  readWithFillValue(batch, int(yCeil), int(xCeil), channel);
                  outputValue = (yCeil - mapY) * valueYFloor +
                  (mapY - yFloor) * valueYCeil;
                }
              }
              setOutput(outputValue);
            }
        `}}function fH(n){const{inputs:e,backend:t,attrs:s}=n,{image:o,transforms:r}=e,{interpolation:i,fillMode:a,fillValue:l,outputShape:c}=s,[u,h,d,p]=o.shape,[f,m]=c!=null?c:[h,d],g=[u,f,m,p],x=new pH(h,d,i,a,l,g);return t.runWebGLProgram(x,[o,r],"float32")}const mH={kernelName:Eu,backendName:"webgl",kernelFunc:fH};function gH(n){const{inputs:e,attrs:t,backend:s}=n,{axis:o}=t,{x:r}=e;Wi(r,"unique"),console.warn("WARNING: ","UI might be locked temporarily as data is being downloaded");const i=s.readSync(r.dataId),{outputValues:a,outputShape:l,indices:c}=u3(i,o,r.shape,r.dtype);return[s.makeTensorInfo(l,r.dtype,a),s.makeTensorInfo([c.length],"int32",c)]}const xH={kernelName:Ru,backendName:"webgl",kernelFunc:gH};function bH(n){const{inputs:e,backend:t,attrs:s}=n,{value:o}=e;let{axis:r}=s;r<0&&(r+=o.shape.length);const i=o,a=i.shape.length,l=o.shape[r],c=new Array(a-1);let u=0;for(let m=0;m<a;m++)m!==r&&(c[u++]=i.shape[m]);const h=[],d=new Array(a).fill(0),p=i.shape.slice();p[r]=1;const f=new Array(l);for(let m=0;m<f.length;m++){d[r]=m;const g=or({inputs:{x:i},backend:t,attrs:{begin:d,size:p}}),x=ne({inputs:{x:g},backend:t,attrs:{shape:c}});f[m]=x,h.push(g)}return h.forEach(m=>t.disposeIntermediateTensorInfo(m)),f}const yH={kernelName:Ya,backendName:"webgl",kernelFunc:bH};class wH{constructor(e,t){this.variableNames=["x","segmentIds"];const s=e.windowSize,o=e.batchSize,r=e.inSize,i=e.numSegments,a=i*Math.ceil(r/s);this.outputShape=[o,a];const l="0.0",c="sumValue",u=Math.floor(s/4)*4,h=s%4,d=`
        sumValue += dot(values, segFilter);
    `;let p="";r%s>0&&(p=`
        if (inIdx < 0 || inIdx >= ${r}) {
          return initializationValue;
        }
      `);let f="";r%s>0&&(f=`
        if (inIdx < 0 || inIdx >= ${r}) {
          return -1.0;
        }
      `),this.userCode=`
      const float initializationValue = ${l};

      float getValue(int batch, int inIdx) {
        ${p}
        return getX(batch, inIdx);
      }

      float getSegmentIdAtIndex(int inIdx) {
        ${f}
        return getSegmentIds(inIdx);
      }

      void main() {
        ivec2 coords = getOutputCoords();
        int batch = coords[0];
        int outIdx = coords[1];
        int inOffset = int(floor(float(outIdx) / float(
          ${i})) * float(${s}));
        int currentSeg = int(mod(float(outIdx), float(${i})));

        float sumValue = 0.0;

        for (int i = 0; i < ${u}; i += 4) {
          int inIdx = inOffset + i;
          vec4 values = vec4(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            getValue(batch, inIdx + 2),
            getValue(batch, inIdx + 3)
          );

          vec4 segFilter = vec4(
            int(getSegmentIdAtIndex(inIdx)) == currentSeg ? 1 : 0,
            int(getSegmentIdAtIndex(inIdx + 1)) == currentSeg ? 1 : 0,
            int(getSegmentIdAtIndex(inIdx + 2)) == currentSeg ? 1 : 0,
            int(getSegmentIdAtIndex(inIdx + 3)) == currentSeg ? 1 : 0
          );

          ${d}
        }

        int inIdx = inOffset + ${u};
        if (${h===1}) {
          vec4 values = vec4(
            getValue(batch, inIdx),
            initializationValue,
            initializationValue,
            initializationValue
          );

          int inIdxSeg = int(getSegmentIdAtIndex(inIdx));

          vec4 segFilter = vec4(
            int(getSegmentIdAtIndex(inIdx)) == currentSeg ? 1 : 0,
            0,
            0,
            0
          );

          ${d}
        } else if (${h===2}) {
          vec4 values = vec4(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            initializationValue,
            initializationValue
          );

          vec4 segFilter = vec4(
            int(getSegmentIdAtIndex(inIdx)) == currentSeg ? 1 : 0,
            int(getSegmentIdAtIndex(inIdx + 1)) == currentSeg ? 1 : 0,
              0,
              0
          );

          ${d}
        } else if (${h===3}) {
          vec4 values = vec4(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            getValue(batch, inIdx + 2),
            initializationValue
          );

          vec4 segFilter = vec4(
            int(getSegmentIdAtIndex(inIdx)) == currentSeg ? 1 : 0,
            int(getSegmentIdAtIndex(inIdx + 1)) == currentSeg ? 1 : 0,
            int(getSegmentIdAtIndex(inIdx + 2)) == currentSeg ? 1 : 0,
            0
          );

          ${d}
        }
        setOutput(${c});
      }
    `}}function CH(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,segmentIds:r}=e,{numSegments:i}=s,a=o.shape.length,l=[];let c=0;const u=je([c],a);let h=o;u!=null&&(h=Mt({inputs:{x:o},backend:t,attrs:{perm:u}}),l.push(h),c=et(1,a)[0]);const d=yg(h.shape,c,i),p=q([h.shape[c]]),f=ne({inputs:{x:h},backend:t,attrs:{shape:[-1,p]}});l.push(f);const m=zu(o.dtype),g=(y,C,$,N,T)=>{const S=y.shape[0],v=y.shape[1],I=bg(v,T),R={windowSize:I,inSize:v,batchSize:S,numSegments:T},F=new wH(R,C),O=t.compileAndRun(F,[y,$],N);if(l.push(O),O.shape[1]===T)return O;const L=Gy({backend:t,attrs:{start:0,stop:T,step:1,dtype:"float32"}}),z=jy({inputs:{x:L},backend:t,attrs:{reps:[v/I]}});return l.push(L),l.push(z),g(O,C,z,N,T)},x=g(f,"unsortedSegmentSum",r,m,i),b=ne({inputs:{x},backend:t,attrs:{shape:d}});let w=b;if(u!=null){l.push(b);const y=ms(u);w=Mt({inputs:{x:w},backend:t,attrs:{perm:y}})}return l.forEach(y=>t.disposeIntermediateTensorInfo(y)),w}const IH={kernelName:Za,backendName:"webgl",kernelFunc:CH};const $H=[tB,sB,iB,cB,hB,fB,gB,bB,IB,kB,NB,RB,FB,MB,zB,WB,GB,KB,YB,QB,tz,az,cz,pz,mz,wz,Iz,Sz,P3,Ez,_z,Pz,Gz,jz,Xz,Zz,Jz,sV,rV,aV,cV,hV,pV,gV,bV,IV,kV,NV,RV,DV,_V,MV,BV,WV,GV,HV,jV,XV,ZV,JV,tW,sW,iW,cW,hW,fW,xW,yW,CW,M3,$W,Dz,vW,NW,EW,z3,AW,FW,OW,PW,VW,UW,HW,jW,YW,QW,e4,o4,i4,l4,d4,f4,g4,b4,w4,k4,N4,A4,M4,U3,V4,G4,j4,Y4,gz,Q4,eU,nU,rU,cU,W3,hU,pU,mU,xU,bU,xz,F4,wU,$U,SU,H3,RU,FU,MU,zU,GU,qU,KU,YU,JU,nG,rG,lG,hG,pG,xG,yG,iz,O4,CG,IG,kG,SG,TG,RG,DG,_G,LG,PG,zG,WG,GG,jG,XG,ZG,JG,_4,Q3,tH,sH,rH,lH,dH,mH,J3,xH,yH,IH,J4];for(const n of $H)sf(n);const xp=[{id:1,type:"Segmentation",path:"/models/model5_gw_ae/model.json",modelName:"⚡ Tissue GWM (light)",colormapPath:"./models/model5_gw_ae/colormap3.json",webgpu_safetensor:"./models/model5_gw_ae/model.safetensors",webgpu_runner:"model5",preModelId:null,preModelPostProcess:!1,isBatchOverlapEnable:!1,numOverlapBatches:0,enableTranspose:!0,enableCrop:!0,cropPadding:18,autoThreshold:0,enableQuantileNorm:!1,filterOutWithPreMask:!1,enableSeqConv:!1,textureSize:0,warning:null,inferenceDelay:100,description:"Gray and white matter segmentation model. Operates on full T1 image in a single pass, but uses only 5 filters per layer. Can work on integrated graphics cards but is barely large enough to provide good accuracy. Still more accurate than the subvolume model."},{id:2,type:"Brain_Extraction",path:"/models/mindgrab/model.json",modelName:"🪓🧠 omnimodal Skull Stripping",webgpu_safetensor:"./models/mindgrab/model.safetensors",webgpu_runner:"mindgrab",preModelId:null,preModelPostProcess:!1,isBatchOverlapEnable:!1,numOverlapBatches:0,enableTranspose:!0,isPostProcessEnable:!0,enableCrop:!0,cropPadding:20,autoThreshold:.5,enableQuantileNorm:!0,filterOutWithPreMask:!1,enableSeqConv:!1,textureSize:0,warning:"This model may need dedicated graphics card.  For more info please check with Browser Resources <i class='fa fa-cogs'></i>.",inferenceDelay:100,description:"The omnimodal skull stripping model delivers high-accuracy brain extraction in seconds, supporting multiple imaging modalities including T1, T2, FLAIR, DWI, EPI, MRA, PDw, CT, and PET without a need for tuning. It runs in a single pass with only 15 filters per layer, and is offered in high-memory/fast and low-memory/slow configurations. Use it today to improve and accelerate your brain extraction!"},{id:3,type:"Atlas",path:"/models/model30chan18cls/model.json",modelName:"🪓 Subcortical + GWM",colormapPath:"./models/model30chan18cls/colormap.json",webgpu_safetensor:"./models/model30chan18cls/model.safetensors",webgpu_runner:"model30chan18cls",preModelId:null,preModelPostProcess:!1,isBatchOverlapEnable:!1,numOverlapBatches:200,enableTranspose:!0,enableCrop:!0,cropPadding:0,autoThreshold:.2,enableQuantileNorm:!1,filterOutWithPreMask:!1,enableSeqConv:!1,textureSize:0,warning:"This model may need dedicated graphics card.  For more info please check with Browser Resources <i class='fa fa-cogs'></i>.",inferenceDelay:100,description:"Parcellation of the brain into 17 regions: gray and white matter plus subcortical areas. This is a robust model able to handle range of data quality, including varying saturation, and even clinical scans. It may work on infant brains, but your mileage may vary."},{id:4,type:"Atlas",path:"/models/model30chan50cls/model.json",modelName:"🔪 Aparc+Aseg 50",colormapPath:"./models/model30chan50cls/colormap.json",webgpu_safetensor:"./models/model30chan50cls/model.safetensors",webgpu_runner:"model30chan50cls",preModelId:null,preModelPostProcess:!1,isBatchOverlapEnable:!1,numOverlapBatches:200,enableTranspose:!0,enableCrop:!0,cropPadding:0,autoThreshold:0,enableQuantileNorm:!0,filterOutWithPreMask:!1,enableSeqConv:!1,textureSize:0,warning:"This model may need dedicated graphics card.  For more info please check with Browser Resources <i class='fa fa-cogs'></i>.",inferenceDelay:100,description:"This is a 50-class model, that segments the brain into the Aparc+Aseg Freesurfer Atlas but one where cortical homologues are merged into a single class."},{id:5,type:"Atlas",path:"/models/model21_104class/model.json",modelName:"🔪 Aparc+Aseg 104",colormapPath:"./models/model21_104class/colormap.json",webgpu_safetensor:"./models/model21_104class/model.safetensors",webgpu_runner:"model21",preModelId:1,preModelPostProcess:!1,isBatchOverlapEnable:!1,numOverlapBatches:200,enableTranspose:!0,enableCrop:!0,cropPadding:0,autoThreshold:0,enableQuantileNorm:!1,filterOutWithPreMask:!1,enableSeqConv:!1,textureSize:0,warning:"This model may need dedicated graphics card.  For more info please check with Browser Resources <i class='fa fa-cogs'></i>.",inferenceDelay:100,description:"FreeSurfer aparc+aseg atlas 104 parcellate brain areas into 104 regions. It contains a combination of the Desikan-Killiany atlas for cortical area and also segmentation of subcortical regions."},{id:6,type:"Divider",modelName:"-----------------",path:null},{id:7,type:"Segmentation",path:"/models/model20chan3cls/model.json",modelName:"🔪 Tissue GWM (High Acc)",colormapPath:"./models/model20chan3cls/colormap.json",preModelId:null,preModelPostProcess:!1,isBatchOverlapEnable:!1,numOverlapBatches:0,enableTranspose:!0,enableCrop:!0,cropPadding:0,autoThreshold:.2,enableQuantileNorm:!0,filterOutWithPreMask:!1,enableSeqConv:!1,textureSize:0,warning:"This model may need dedicated graphics card.  For more info please check with Browser Resources <i class='fa fa-cogs'></i>.",inferenceDelay:100,description:"Gray and white matter segmentation model. Operates on full T1 image in a single pass but needs a dedicated graphics card to operate. Provides the best accuracy with hard cropping for better speed"},{id:8,type:"Atlas",path:"/models/model18cls/model.json",modelName:"🪓 Subcortical + GWM (Small Model)",colormapPath:"./models/model18cls/colormap.json",webgpu_safetensor:"./models/model18cls/model.safetensors",webgpu_runner:"model21chan18cls",preModelId:null,preModelPostProcess:!1,isBatchOverlapEnable:!1,numOverlapBatches:200,enableTranspose:!0,enableCrop:!0,cropPadding:0,autoThreshold:.2,enableQuantileNorm:!1,filterOutWithPreMask:!1,enableSeqConv:!0,textureSize:0,warning:"This model may need dedicated graphics card.  For more info please check with Browser Resources <i class='fa fa-cogs'></i>.",inferenceDelay:100,description:"Parcellation of the brain into 17 regions: gray and white matter plus subcortical areas. This is a robust model able to handle range of data quality, including varying saturation, and even clinical scans. It may work on infant brains, but your mileage may vary."},{id:9,type:"Brain_Extraction",path:"/models/model5_gw_ae/model.json",modelName:"⚡ Extract the Brain (FAST)",preModelId:null,preModelPostProcess:!1,isBatchOverlapEnable:!1,numOverlapBatches:0,enableTranspose:!0,enableCrop:!0,cropPadding:18,autoThreshold:0,enableQuantileNorm:!1,filterOutWithPreMask:!1,enableSeqConv:!1,textureSize:0,warning:null,inferenceDelay:100,description:"Extract the brain fast model operates on full T1 image in a single pass, but uses only 5 filters per layer. Can work on integrated graphics cards but is barely large enough to provide good accuracy. Still more accurate than the failsafe version."},{id:10,type:"Brain_Extraction",path:"/models/model11_gw_ae/model.json",modelName:"🔪 Extract the Brain (High Acc, Slow)",preModelId:null,preModelPostProcess:!1,isBatchOverlapEnable:!1,numOverlapBatches:0,enableTranspose:!0,enableCrop:!0,cropPadding:0,autoThreshold:0,enableQuantileNorm:!1,filterOutWithPreMask:!1,enableSeqConv:!0,textureSize:0,warning:"This model may need dedicated graphics card.  For more info please check with Browser Resources <i class='fa fa-cogs'></i>.",inferenceDelay:100,description:"Extract the brain high accuracy model operates on full T1 image in a single pass, but uses only 11 filters per layer. Can work on dedicated graphics cards. Still more accurate than the fast version."},{id:11,type:"Brain_Masking",path:"/models/model5_gw_ae/model.json",modelName:"⚡ Brain Mask (FAST)",colormapPath:"./models/model5_gw_ae/colormap.json",preModelId:null,preModelPostProcess:!1,isBatchOverlapEnable:!1,numOverlapBatches:0,enableTranspose:!0,enableCrop:!0,cropPadding:17,autoThreshold:0,enableQuantileNorm:!1,filterOutWithPreMask:!1,enableSeqConv:!1,textureSize:0,warning:null,inferenceDelay:100,description:"This fast masking model operates on full T1 image in a single pass, but uses only 5 filters per layer. Can work on integrated graphics cards but is barely large enough to provide good accuracy. Still more accurate than failsafe version."},{id:12,type:"Brain_Masking",path:"/models/model11_gw_ae/model.json",modelName:"🔪 Brain Mask (High Acc, Low Mem)",preModelId:null,preModelPostProcess:!1,isBatchOverlapEnable:!1,numOverlapBatches:0,enableTranspose:!0,enableCrop:!0,cropPadding:0,autoThreshold:0,enableQuantileNorm:!0,filterOutWithPreMask:!1,enableSeqConv:!0,textureSize:0,warning:"This model may need dedicated graphics card.  For more info please check with Browser Resources <i class='fa fa-cogs'></i>.",inferenceDelay:100,description:"This masking model operates on full T1 image in a single pass, but uses 11 filters per layer. Can work on dedicated graphics cards. Still more accurate than fast version."}];class kH{idx(e,t,s,o){return s*o[0]*o[1]+t*o[0]+e}check_previous_slice(e,t,s,o,r,i,a,l,c,u){let h=0;if(!r)return 0;const d=e[this.idx(s,o,r,i)];if(a>=6){const p=this.idx(s,o,r-1,i);d===e[p]&&(c[h++]=t[p])}if(a>=18){if(s){const p=this.idx(s-1,o,r-1,i);d===e[p]&&(c[h++]=t[p])}if(o){const p=this.idx(s,o-1,r-1,i);d===e[p]&&(c[h++]=t[p])}if(s<i[0]-1){const p=this.idx(s+1,o,r-1,i);d===e[p]&&(c[h++]=t[p])}if(o<i[1]-1){const p=this.idx(s,o+1,r-1,i);d===e[p]&&(c[h++]=t[p])}}if(a===26){if(s&&o){const p=this.idx(s-1,o-1,r-1,i);d===e[p]&&(c[h++]=t[p])}if(s<i[0]-1&&o){const p=this.idx(s+1,o-1,r-1,i);d===e[p]&&(c[h++]=t[p])}if(s&&o<i[1]-1){const p=this.idx(s-1,o+1,r-1,i);d===e[p]&&(c[h++]=t[p])}if(s<i[0]-1&&o<i[1]-1){const p=this.idx(s+1,o+1,r-1,i);d===e[p]&&(c[h++]=t[p])}}return h?(this.fill_tratab(l,c,h,u),c[0]):0}do_initial_labelling(e,t,s){const o=new Uint32Array(32),r=new Uint32Array(32);let i=1;const a=8192;let l=a,c=new Uint32Array(l).fill(0);const u=new Uint32Array(t[0]*t[1]*t[2]).fill(0),h=new Uint32Array(27);for(let d=0;d<t[2];d++)for(let p=0;p<t[1];p++)for(let f=0;f<t[0];f++){let m=0;const g=e[this.idx(f,p,d,t)];if(g!==0){if(h[0]=this.check_previous_slice(e,u,f,p,d,t,s,c,o,r),h[0]&&(m+=1),s>=6){if(f){const x=this.idx(f-1,p,d,t);g===e[x]&&(h[m++]=u[x])}if(p){const x=this.idx(f,p-1,d,t);g===e[x]&&(h[m++]=u[x])}}if(s>=18){if(p&&f){const x=this.idx(f-1,p-1,d,t);g===e[x]&&(h[m++]=u[x])}if(p&&f<t[0]-1){const x=this.idx(f+1,p-1,d,t);g===e[x]&&(h[m++]=u[x])}}if(m)u[this.idx(f,p,d,t)]=h[0],this.fill_tratab(c,h,m,r);else{if(u[this.idx(f,p,d,t)]=i,i>=l){l+=a;const x=new Uint32Array(l);x.set(c),c=x}c[i-1]=i,i++}}}for(let d=0;d<i-1;d++){let p=d;for(;c[p]!==p+1;)p=c[p]-1;c[d]=p+1}return[i-1,c,u]}fill_tratab(e,t,s,o){let i=2147483647;for(let a=0;a<s;a++){let l=t[a];for(;e[l-1]!==l;)l=e[l-1];o[a]=l,i=Math.min(i,l)}for(let a=0;a<s;a++)e[o[a]-1]=i}translate_labels(e,t,s,o){const r=t[0]*t[1]*t[2];let i=0;const a=new Uint32Array(r).fill(0);for(let u=0;u<o;u++)i=Math.max(i,s[u]);const l=new Uint32Array(i).fill(0);let c=0;for(let u=0;u<r;u++)e[u]&&(l[s[e[u]-1]-1]||(c+=1,l[s[e[u]-1]-1]=c),a[u]=l[s[e[u]-1]-1]);return[c,a]}largest_original_cluster_labels(e,t,s){const o=e.length,r=new Uint32Array(t+1).fill(0),i=new Uint32Array(t+1).fill(0);for(let c=0;c<o;c++){const u=e[c],h=s[c];r[h]=u,i[h]++}let a=0;for(let c=0;c<t+1;c++){const u=r[c];a=Math.max(a,u);for(let h=0;h<t+1;h++)h!==c&&u===r[h]&&(i[c]<i[h]||i[c]===i[h]&&c<h)&&(r[c]=0)}const l=new Uint32Array(o).fill(0);for(let c=0;c<o;c++)l[c]=r[s[c]];return[a,l]}bwlabel(e,t,s=26,o=!1,r=!1){const i=Date.now(),a=t[0]*t[1]*t[2],l=new Uint32Array(a).fill(0);if(![6,18,26].includes(s))return console.log("bwlabel: conn must be 6, 18 or 26."),[0,l];if(t[0]<2||t[1]<2||t[2]<1)return console.log("bwlabel: img must be 2 or 3-dimensional"),[0,l];if(o)for(let f=0;f<a;f++)e[f]!==0&&(l[f]=1);else l.set(e);let[c,u,h]=this.do_initial_labelling(l,t,s);u===void 0&&(u=new Uint32Array(0));const[d,p]=this.translate_labels(h,t,u,c);if(console.log(s+" neighbor clustering into "+d+" regions in "+(Date.now()-i)+"ms"),r){const[f,m]=this.largest_original_cluster_labels(l,d,p);return[f,m]}return[d,p]}}function vH(n,e,t){return Y(this,null,function*(){const[s,o,r,i,a,l]=yield FH(e),c=o-s+1,u=i-r+1,h=l-a+1,d=(y,C,$,N)=>{const T=Math.min(y,N),S=Math.min(255-C,N),v=Math.max(0,y-T),I=Math.min(255,C+S);return[v,I]},[p,f]=d(s,o,c,t),[m,g]=d(r,i,u,t),[x,b]=d(a,l,h,t);return{cropped:n.slice([p,m,x],[f-p+1,g-m+1,b-x+1]),corner:[p,m,x]}})}function SH(n,e){return Y(this,null,function*(){const[t,s,o]=e,[r,i,a]=n.shape,l=[[t,Math.max(0,256-r-t)],[s,Math.max(0,256-i-s)],[o,Math.max(0,256-a-o)]];return n.pad(l)})}function NH(n,e){return Y(this,null,function*(){const t=n.max(),s=t.mul(e),o=yield s.data();return t.dispose(),s.dispose(),B(()=>n.clone().greater(o[0]))})}function TH(n,e=.01,t=.99){return Y(this,null,function*(){const s=n.flatten(),o=s.shape[0],r=yield s.data();s.dispose();const i=Math.min(1e5,o);let a;if(i>=o)a=Array.from(r);else{a=new Array(i);for(let p=0;p<i;p++){const f=Math.floor(Math.random()*o);a[p]=r[f]}}a.sort((p,f)=>p-f);const l=a.length,c=Math.floor(l*e),u=Math.ceil(l*t)-1,h=a[c],d=a[u];return{qmin:h,qmax:d}})}function EH(n,e,t,s,o,r,i){return Y(this,null,function*(){const a=n.shape[4],l=e.shape[4];let c=null;for(let u=0;u<l;u++){const h=Math.ceil(a/i);let d=null;for(let f=0;f<h;f++){const m=f*i,g=Math.min((f+1)*i,a);if(m<a){const x=B(()=>{const b=n.slice([0,0,0,0,m],[-1,-1,-1,-1,g-m]),w=e.slice([0,0,0,m,u],[-1,-1,-1,g-m,1]);return hl(b,w,s,o,"NDHWC",r)});if(d===null)d=x;else{const b=d.add(x);d.dispose(),x.dispose(),d=b}}}let p;if(t){const f=t.slice([u],[1]);p=d.add(f),d.dispose(),f.dispose()}else p=d;if(c==null)c=p;else{const f=yield Tt([c,p],4);p.dispose(),c.dispose(),c=f}}return c})}function RH(n,e=1e-5){return B(()=>{const{mean:t,variance:s}=fi(n,[1,2,3],!0),o=Sl(s.add(e));return n.sub(t).mul(o)})}function AH(n,e,t,s,o,r,i){return Y(this,null,function*(){const a=n.shape[4],l=e.shape[4];let c=null;for(let u=0;u<l;u++){const h=Math.ceil(a/i);let d=null;for(let m=0;m<h;m++){const g=m*i,x=Math.min((m+1)*i,a);if(g<a){const b=B(()=>{const w=n.slice([0,0,0,0,g],[-1,-1,-1,-1,x-g]),y=e.slice([0,0,0,g,u],[-1,-1,-1,x-g,1]);return hl(w,y,s,o,"NDHWC",r)});if(d===null)d=b;else{const w=d.add(b);d.dispose(),b.dispose(),d=w}}}let p;if(t){const m=t.slice([u],[1]);p=d.add(m),d.dispose(),m.dispose()}else p=d;const f=RH(p);if(p.dispose(),c===null)c=f;else{const m=yield Tt([c,f],4);f.dispose(),c.dispose(),c=m}}return c})}function DH(n,e=1e-5){return B(()=>{const{mean:t,variance:s}=fi(n,[1,2,3],!0),o=Sl(ee(s,e));return D(pe(n,t),o)})}function bp(n,e=0){return Y(this,null,function*(){let t=[];e===0?t=yield n.max(2).max(1).arraySync():e===1?t=yield n.max(2).max(0).arraySync():t=yield n.max(1).max(0).arraySync();let s=t.length,o=0;for(let r=0;r<t.length;r++)if(t[r]>0){s=r;break}for(let r=t.length-1;r>=0;r--)if(t[r]>0){o=r;break}return[s,o]})}function FH(n){return Y(this,null,function*(){const[e,t]=yield bp(n,0),[s,o]=yield bp(n,1),[r,i]=yield bp(n,2);return console.log("row min and max  :",e,t),console.log("col min and max  :",s,o),console.log("depth min and max  :",r,i),[e,t,s,o,r,i]})}function _H(n,e,t,s,o,r,i,a,l=!0){return Y(this,null,function*(){n[0].dtype!=="int32"&&i("",-1,"generateBrainMask assumes int32"),o.preModelPostProcess&&i("",-1,"generateBrainMask assumes BWLabeler instead of preModelPostProcess");const c=n.length,u=n[0].size,h=c*u,d=new Int32Array(h);let p=0;for(let f=0;f<c;f++)d.set(n[f].dataSync(),p),p+=u;for(let f=0;f<h;f++)d[f]=d[f]!==0?1:0;return(l||r.showPhase1Output)&&(a(d,r,o),i("Segmentation finished",0)),Vs(d,[e,t,s])})}function OH(n,e,t){return Y(this,null,function*(){const s=e.dims[1],o=e.dims[2];let r;if(e.datatypeCode===2)r=new Uint8Array(t);else if(e.datatypeCode===4)r=new Int16Array(t);else if(e.datatypeCode===8)r=new Int32Array(t);else if(e.datatypeCode===16)r=new Float32Array(t);else if(e.datatypeCode===64)r=new Float64Array(t);else if(e.datatypeCode===256)r=new Int8Array(t);else if(e.datatypeCode===512)r=new Uint16Array(t);else if(e.datatypeCode===768)r=new Uint32Array(t);else return;const i=[];let a=0;for(let c=0;c<n;c++){const u=new Array(o*s);let h=0;for(let d=0;d<o;d++)for(let p=0;p<s;p++){const f=r[a++];u[h++]=f&255}i.push(Vs(u,[o,s]))}const l=Ln(i);return ge(i),l})}function Xy(n){return Y(this,null,function*(){return n.layers.length})}function Yy(n){return Y(this,null,function*(){let e=0;for(let t=0;t<n.layers.length;t++)e+=n.layers[t].countParams();return e})}function Nc(n){return Y(this,null,function*(){for(let e=0;e<n.layers.length;e++)if(n.layersByDepth[e][0].dataFormat)return n.layersByDepth[e][0].dataFormat==="channelsLast"})}function Zy(n){return Y(this,null,function*(){return yield PE(n)})}function Qy(n){return Y(this,null,function*(){const e=n.max(),t=n.min();return yield n.sub(t).div(e.sub(t))})}function LH(n,e,t){const i=n.shape[4],a=Math.ceil(i/t);let l=null;for(let c=0;c<a;c++){const u=c*t,d=Math.min((c+1)*t,i)-u,p=B(()=>n.slice([0,0,0,0,u],[-1,-1,-1,-1,d])),f=B(()=>e.slice([0,0,0,u,0],[-1,-1,-1,d,-1])),m=hl(p,f,1,0,"NDHWC",1);p.dispose(),f.dispose();const g=eo(m);if(m.dispose(),l===null)l=g;else{const x=l.add(g);l.dispose(),l!==g&&g.dispose(),l=x}B(()=>{Te(nt([1,1]),nt([1,1]))})}return l}function Jy(n,e=.05,t=.95){return Y(this,null,function*(){const{qmin:s,qmax:o}=yield TH(n,e,t),r=o-s,i=n.sub(s),a=i.div(r);return i.dispose(),a})}class ew{constructor(e,t,s,o,r=!0){this.model=e,this.outChannels=e.outputLayers[0].kernel.shape[4],this.chunkSize=t,this.isChannelLast=s,this.callbackUI=o,this.isWebWorker=r}apply(e){return Y(this,null,function*(){const t=performance.now(),s=this.model.layers[this.model.layers.length-1],o=s.getWeights()[0],r=s.getWeights()[1],i=this.isChannelLast?e.shape.slice(1,-1):e.shape.slice(2);let a=yield D(Jn(i),-1e4),l=yield nt(i);const c=3,u=Math.ceil(this.outChannels/c);for(let p=0;p<u;p++){const f=p*c,m=Math.min((p+1)*c,this.outChannels),[g,x]=yield B(()=>{let b=a,w=l;for(let y=f;y<m;y++){const C=o.slice([0,0,0,0,y],[-1,-1,-1,-1,1]),$=r.slice([y],[1]),N=LH(e,C,Math.min(this.chunkSize,this.outChannels)).add($),T=Ht(N,b);b=wt(T,N,b),w=wt(T,ui(w.shape,y),w)}return[b,w]});ge([a,l]),a=g,l=x,this.callbackUI(`Processing chunk ${p+1}/${u}`,(p+1)/u),this.isWebWorker||(yield new Promise(b=>setTimeout(b,0)))}const h=l.clone();ge([a,l]);const d=performance.now();return console.log(`Execution time: ${d-t} milliseconds`),h})}}function MH(n,e,t,s){return Y(this,null,function*(){console.log("Downloading segmentation data from GPU to CPU...");const o=yield n.data(),r=n.shape;if(console.log("Data download complete. Starting CPU processing."),s.isPostProcessEnable){console.log("Applying CPU-based connected-component labeling...");const i=performance.now(),a=new kH,[l,c]=a.bwlabel(o,r,26,!0,!0);for(let h=0;h<o.length;h++)o[h]*=c[h];const u=((performance.now()-i)/1e3).toFixed(4);console.log(`Connected-component labeling took: ${u} seconds.`)}switch(t.type){case"Brain_Masking":{const i=new Uint8Array(o.length);for(let a=0;a<o.length;a++)i[a]=o[a]!==0?1:0;return i}case"Brain_Extraction":{const i=new Uint8Array(o.length);for(let a=0;a<o.length;a++){const l=o[a]!==0?1:0;i[a]=e[a]*l}return i}default:return new Uint8Array(o)}})}function PH(n,e,t){var i;let s=0,o=1;if(t)if(e.length===5)o=e[1]*e[2]*e[3];else for(let a=0;a<e.length;a++)e[a]>1&&(o*=e[a]);else if(e.length===5)o=e[2]*e[3]*e[4];else for(let a=0;a<e.length;a++)e[a]>32&&(o*=e[a]);let r=0;if(n&&n.layers)for(const a of n.layers){let l=0,c=a.outputShape;Array.isArray(c)&&Array.isArray(c[0])&&(c=c[0]),Array.isArray(c)&&(t?l=c[c.length-1]:l=c[1]);let u=0;const h=a.batchInputShape,d=p=>Array.isArray(p)?t?p[p.length-1]:p[1]:0;if(h)if(Array.isArray(h)&&Array.isArray(h[0]))for(const p of h)u+=d(p);else Array.isArray(h)&&(u=d(h));if(u===0&&a.weights&&a.weights.length>0){const p=a.weights[0];p&&p.shape&&(p.shape.length===5?u=p.shape[3]:p.shape.length===4&&(u=p.shape[2]))}if(u===0&&(u=l),typeof l=="number"&&typeof u=="number"){const p=o*(u+l),f=o*l;p>s&&(s=p),r=f}}return s===0&&(s=o*32*2),console.log(`[Estimator] Total Layers: ${(i=n==null?void 0:n.layers)==null?void 0:i.length}, Peak: ${s}, Final Output: ${r}`),{peak:s,maxOutput:r}}const yp={WEBGPU:"webgpu",WEBGL_WEBWORKER:"webgl-webworker",WEBGL_SEQUENTIAL:"webgl-sequential"};function BH(n,e){return{startTime:Date.now(),Model_Name:(n==null?void 0:n.modelName)||"Unknown",Execution_Mode:e,TF_Backend:e===yp.WEBGPU?"webgpu":"webgl",isModelFullVol:null,No_SubVolumes:1,Brainchop_Ver:"FullVolume",Input_Shape:null,Output_Shape:null,Channel_Last:null,Model_Param:null,Model_Layers:null,Actual_Labels:null,Expect_Labels:null,NumLabels_Match:null,Missing_Labels:null,Inference_t:null,Postprocess_t:null,Status:null,Error_Type:null,Extra_Err_Info:null}}function zH(n,e,t,s,o,r){return Y(this,null,function*(){var i,a,l;if(e)try{n.Input_Shape=JSON.stringify(t),n.Output_Shape=JSON.stringify(((i=e.output)==null?void 0:i.shape)||((l=(a=e.outputs)==null?void 0:a[0])==null?void 0:l.shape)),n.Channel_Last=s,o&&(n.Model_Param=yield o(e)),r&&(n.Model_Layers=yield r(e))}catch(c){console.warn("Failed to add model info to diagnostics:",c)}})}function tw(n,e,t,s=null){n.Expect_Labels=e,n.Actual_Labels=t,n.NumLabels_Match=e===t,s&&s.length>0&&(n.Missing_Labels=s.join(", "))}function nw(n,e,t){n.Inference_t=e,n.Postprocess_t=t,n.Status="OK"}function wp(n,e,t=null){n.Inference_t=1/0,n.Postprocess_t=1/0,n.Status="Fail",n.Error_Type=(e==null?void 0:e.message)||String(e),t&&(n.Extra_Err_Info=t)}function Tc(n,e,t,s,o,r,i,a,l){return Y(this,null,function*(){const c=performance.now();console.log(`---- Start FullVolume Inference (SeqConv: ${e.enableSeqConv}) ----`),e.enableQuantileNorm?(console.log("preModel Quantile normalization enabled"),s=yield Jy(s)):(console.log("preModel Min Max normalization enabled"),s=yield Qy(s));let u;if(o==null){const j=e.autoThreshold;j>0&&j<=1?u=yield NH(s,j):u=yield s.greater([0]).asType("bool")}else u=yield o.greater([0]).asType("bool");const h=e.cropPadding;let{cropped:d,corner:p}=yield vH(s,u,h);s.dispose(),u.dispose(),e.enableTranspose&&(d=d.transpose(),console.log("Input transposed for pre-model"));const f=yield t,m=f.layers.length,g=Nc(f);let x;g?(f.layers[0].batchInputShape[1]=d.shape[0],f.layers[0].batchInputShape[2]=d.shape[1],f.layers[0].batchInputShape[3]=d.shape[2],x=[n.batchSize,f.layers[0].batchInputShape[1],f.layers[0].batchInputShape[2],f.layers[0].batchInputShape[3],n.numOfChan]):(f.layers[0].batchInputShape[2]=d.shape[0],f.layers[0].batchInputShape[3]=d.shape[1],f.layers[0].batchInputShape[4]=d.shape[2],x=[n.batchSize,n.numOfChan,f.layers[0].batchInputShape[2],f.layers[0].batchInputShape[3],f.layers[0].batchInputShape[4]]);let b=d.reshape(x),w=!1;if(!e.enableSeqConv){const{peak:j,maxOutput:X}=PH(f,x,g);console.log(`[Centralized Check] Peak (In+Out): ${j}, Max Output: ${X}`);const te=Ef(),J=te&&te.gpgpu&&te.gpgpu.gl?te.gpgpu.gl.getParameter(te.gpgpu.gl.MAX_TEXTURE_SIZE):16384;console.log(`[Memory Check] MAX_TEXTURE_SIZE from WebGL context: ${J}`);const se=Math.ceil(Math.sqrt(Math.ceil(j/4))),le=Math.ceil(Math.sqrt(X));se>J?(console.warn(`[Memory Check] PACKED intermediates too large (${se} > ${J}). Using full SeqConv.`),e.enableSeqConv=!0):le>J?(console.warn(`[Memory Check] UNPACKED output too large (${le} > ${J}). Using chunkedArgMax.`),w=!0):console.log("[Memory Check] All checks passed. Using fast path.")}let y=1;const C=performance.now(),$=/^((?!chrome|android).)*safari/i.test(navigator.userAgent),N=navigator.userAgent.toLowerCase().indexOf("firefox")>-1;let T=$||N?10:15;e.enableSeqConv&&(T=1),console.log(`Syncing GPU every ${T} layers.`);const v=e.enableSeqConv||w?m-2:m-1;for(;y<=v;){try{let j;e.enableSeqConv&&f.layers[y].activation.getClassName()==="linear"?j=yield(f.layers[y].name.endsWith("_gn")?AH:EH)(b,f.layers[y].getWeights()[0],f.layers[y].getWeights()[1],f.layers[y].strides,f.layers[y].padding,f.layers[y].dilationRate,3):j=B(()=>{let X=f.layers[y].apply(b);return f.layers[y].name.endsWith("_gn")&&(X=DH(X)),X}),b.dispose(),b=j}catch(j){return a(j.message,-1,j.message),Ye().endScope(),Ye().disposeVariables(),wp(r,j,"Failed while model layer "+y+" apply"),a("",-1,"",r),0}if(y%T===0){console.log(`Layer ${y}... (Syncing GPU)`),a("Layer "+y.toString(),(y+1)/m);const j=b.slice([0,0,0,0,0],[1,1,1,1,1]);yield j.data(),j.dispose()}else a("Layer "+y.toString(),(y+1)/m);console.log(`Layer ${y} output shape: `,b.shape),y++}let I;if(e.enableSeqConv){console.log("Applying final SequentialConvLayer...");const X=yield new ew(f,10,g,a).apply(b);I=X.asType("int32"),X.dispose(),b.dispose(),console.log("SequentialConvLayer output shape:",I.shape)}else if(w){console.log("Applying SequentialConvLayer for final layer only (fast path for layers 1-18)...");const X=yield new ew(f,10,g,a).apply(b);I=X.asType("int32"),X.dispose(),b.dispose(),console.log("SequentialConvLayer (final only) output shape:",I.shape)}else console.log("Applying final ArgMax..."),I=B(()=>{const X=qs(b,g?-1:1);return eo(X)}),b.dispose(),console.log("ArgMax output shape:",I.shape);const R=((performance.now()-C)/1e3).toFixed(4);console.log(`---- Inference Time: ${R} seconds ----`),e.enableTranspose&&(console.log("outLabelVolume transposed"),I=I.transpose());const F=performance.now();console.log("outLabelVolume without padding shape: ",I.shape),I=yield SH(I,p),console.log("outLabelVolume final shape after padding to 256: ",I.shape);const O=((performance.now()-F)/1e3).toFixed(4);console.log(`---- Padding back to 256^3 Time: ${O} seconds ----`);const L=performance.now(),z=yield MH(I,l,e,n),U=((performance.now()-L)/1e3).toFixed(4);console.log(`---- Postprocessing Time: ${U} seconds ----`),I.dispose(),Ye().disposeVariables();const W=((performance.now()-c)/1e3).toFixed(4);console.log(`---- Total Execution Time: ${W} seconds ----`);const K=new Set(z).size,Z=e.numClasses||K;return tw(r,Z,K),nw(r,R,U),a(e.modelName+"<br>Segmentation finished",0),a("",-1,"",r),i(z,n,e),0})}function Fe(n="",e=-1,t="",s=[]){let o=[];Object.keys(s).length>0&&(o=function(){const i={};for(const a in s)i[a]=s[a];return JSON.stringify(i)}()),self.postMessage({cmd:"ui",message:n,progressFrac:e,modalMessage:t,statData:o})}function Ec(n,e,t){self.postMessage({cmd:"img",img:n,opts:e,modelEntry:t})}function VH(n,e,t,s,o,r,i,a,l,c,u){return Y(this,null,function*(){if(a.No_SubVolumes=1,i.preModelId){const h=yield Zy(l.rootURL+xp[i.preModelId-1].path),d=xp[i.preModelId-1].enableTranspose,p=xp[i.preModelId-1].enableQuantileNorm;let f=null;p?(console.log("preModel Quantile normalization enabled"),f=yield Jy(e)):(console.log("preModel Min Max normalization enabled"),f=yield Qy(e)),d?(f=f.transpose(),console.log("Input transposed for pre-model")):console.log("Transpose not enabled for pre-model"),a.Brainchop_Ver="PreModel_FV";const m=yield h;try{const g=performance.now(),x=m,b=x.layers[0].batchInputShape;if(console.log(" Pre-Model batch input shape : ",b),b.length!==5){const O="The pre-model input shape must be 5D ";return Fe(O,-1,O),0}const w=yield Nc(x),y=l.batchSize,C=l.numOfChan;let $,N,T,S;if(w){if(console.log("Pre-Model Channel Last"),isNaN(b[4])||b[4]!==1){const O="The number of channels for pre-model input shape must be 1";return Fe(O,-1,O),0}$=b[1],N=b[2],T=b[3],S=[y,$,N,T,C]}else{if(console.log("Pre-Model Channel First"),isNaN(b[1])||b[1]!==1){const O="The number of channels for pre-model input shape must be 1";return Fe(O,-1,O),0}$=b[2],N=b[3],T=b[4],S=[y,C,$,N,T]}a.Input_Shape=JSON.stringify(S),a.Output_Shape=JSON.stringify(x.output.shape),a.Channel_Last=yield w,a.Model_Param=yield Yy(x),a.Model_Layers=yield Xy(x);let v=0,I=1;const R=m.layers.length,F=[];for(F[0]=f.reshape(S),ge(f);;){try{F[I]=m.layers[I].apply(F[I-1])}catch(O){const L="Your graphics card (e.g. Intel) may not be compatible with WebGL. "+O.message;return Fe(L,-1,L),Ye().endScope(),Ye().disposeVariables(),wp(a,O,"PreModel Failed while model layer "+I+" apply"),Fe("",-1,"",a),0}if(m.layers[I].dispose(),F[I-1].dispose(),Fe("Layer "+I.toString(),(I+1)/R),ri().unreliable){const O="unreliable reasons :"+ri().reasons;Fe(O,NaN,O)}if(I===R-1){const O=w?-1:1;console.log(" find argmax "),console.log("last Tensor shape : ",F[I].shape);const L=w?F[I].shape[4]:F[I].shape[1];let z;try{console.log(" Try tf.argMax for fullVolume .."),z=yield qs(F[I],O)}catch(te){if(O===-1)try{const J=performance.now();console.log(" tf.argMax failed .. try argMaxLarge .."),Fe("",-1,"tensor2LightBuffer() is not dead code?"),Fe("",-1,"argMaxLarge() is not dead code?"),console.log("argMaxLarge for fullVolume takes : ",((performance.now()-J)/1e3).toFixed(4))}catch(J){const se="argMax buffer couldn't be created due to limited memory resources.";return Fe(se,-1,se),z.dispose(),Ye().endScope(),Ye().disposeVariables(),a.Inference_t=1/0,a.Postprocess_t=1/0,a.Status="Fail",a.Error_Type=J.message,a.Extra_Err_Info="preModel prediction_argmax from argMaxLarge failed",Fe("",-1,"",a),0}else{const J="argMax buffer couldn't be created due to limited memory resources.";return Fe(J,-1,J),z.dispose(),Ye().endScope(),Ye().disposeVariables(),a.Inference_t=1/0,a.Postprocess_t=1/0,a.Status="Fail",a.Error_Type=te.message,a.Extra_Err_Info="preModel prediction_argmax from argMaxLarge not support yet channel first",Fe("",-1,"",a),0}}console.log(" Pre-model prediction_argmax shape : ",z.shape);const U=((performance.now()-g)/1e3).toFixed(4);ge(F[I]),console.log(" Pre-model find array max ");const W=yield z.max().dataSync()[0];v<W&&(v=W);const G=v+1;console.log("Pre-model numSegClasses",G),tw(a,L,G);let K=yield z.reshape([t,s,o]);ge(z),d&&(console.log("Pre-model outLabelVolume transposed"),K=K.transpose());const Z=performance.now();console.log("Generating pre-model output");let j;try{const te=yield xs(K);j=yield _H(te,t,s,o,i,l,c,u,!1),yield ge(K),console.log(" Phase-1 num of tensors after generateBrainMask: ",ri().numTensors)}catch(te){Ye().endScope(),Ye().disposeVariables();const J="Failed while generating pre-model output due to limited browser memory available";return Fe(J,-1,J),a.Inference_t=U,wp(a,te,"Pre-model failed while generating output"),a.Inference_t=U,Fe("",-1,"",a),0}const X=((performance.now()-Z)/1e3).toFixed(4);if(console.log("Pre-model processing the whole brain volume in tfjs tooks for multi-class output mask : ",((performance.now()-g)/1e3).toFixed(4)+"  Seconds"),nw(a,U,X),Fe("",-1,"",a),j==null){const te="slice_3d_mask failed ...";return Fe(te,-1,te),0}else{if(console.log("--- pre-model done ---"),r)return yield Tc(l,i,n,e,j,a,Ec,Fe,u),0;Fe("",-1,"inferenceSubVolumes() is not dead code?")}}I++}}catch(g){Fe(g.message,-1,g.message),console.log('If webgl context is lost, try to restore webgl context by visit the link <a href="https://support.biodigital.com/hc/en-us/articles/218322977-How-to-turn-on-WebGL-in-my-browser">here</a>')}}else console.log("--- No pre-model is selected ---"),console.log("------ Run voxel cropping ------"),r?yield Tc(l,i,n,e,null,a,Ec,Fe,u):Fe("",-1,"inferenceSubVolumes() is not dead code?")})}function WH(n=!0){return Y(this,null,function*(){Xw("webgl"),yield Kw(),V().set("DEBUG",!1),V().set("WEBGL_FORCE_F16_TEXTURES",n),V().set("WEBGL_DELETE_TEXTURE_THRESHOLD",-1),yield Yw(),console.log("tf env() flags :",V().flags),console.log("tf env() features :",V().features),console.log("tf env total features: ",Object.keys(V().features).length),console.log("tf backend: ",Nf())})}function UH(n,e,t,s){return Y(this,null,function*(){const o=e.enableSeqConv?yp.WEBGL_SEQUENTIAL:yp.WEBGL_WEBWORKER,r=BH(e,o);Fe("Segmentation started",0);const i=n.batchSize,a=n.numOfChan;if(isNaN(i)||i!==1){const $="The batch Size for input shape must be 1";return Fe($,-1,$),0}if(isNaN(a)||a!==1){const $="The number of channels for input shape must be 1";return Fe($,-1,$),0}Ye().startScope(),console.log("Batch size: ",i),console.log("Num of Channels: ",a);const l=yield Zy(n.rootURL+e.path);yield WH(!0),r.TF_Backend=Nf();const c=l;yield zH(r,c,c.layers[0].batchInputShape,yield Nc(c),Yy,Xy);let u=[];if(u=c.layers[0].batchInputShape,console.log(" Model batch input shape : ",u),u.length!==5){const $="The model input shape must be 5D";return Fe($,-1,$),0}let h,d,p;const f=t.dims[1],m=t.dims[2],g=t.dims[3];if(yield Nc(c)){if(console.log("Model Channel Last"),isNaN(u[4])||u[4]!==1){const $="The number of channels for input shape must be 1";return Fe($,-1,$),0}h=u[1],d=u[2],p=u[3]}else{if(console.log("Model Channel First"),isNaN(u[1])||u[1]!==1){const $="The number of channels for input shape must be 1";return Fe($,-1,$),0}h=u[2],d=u[3],p=u[4]}let b;h===256&&d===256&&p===256?b=!0:b=!1,r.isModelFullVol=b;let w=yield OH(g,t,s);const y=e.enableTranspose,C=e.enableCrop;b&&(C?yield VH(l,w,g,m,f,b,e,r,n,t,s):(console.log("Cropping Disabled"),y?(w=w.transpose(),console.log("Input transposed")):console.log("Transpose NOT Enabled"),e.enableSeqConv?yield Tc(n,e,l,w,null,r,Ec,Fe,s):yield Tc(n,e,l,w,null,r,Ec,Fe,s))),Ye().endScope()})}self.addEventListener("message",function(n){UH(n.data.opts,n.data.modelEntry,n.data.niftiHeader,n.data.niftiImage)},!1)})();
