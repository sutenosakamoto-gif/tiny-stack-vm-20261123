import{mkdirSync as a,readdirSync as b,readFileSync as c,writeFileSync as d}from"node:fs";
function V(P:Uint8Array,N:Uint8Array){
let S=new Int32Array(256),C=new Int32Array(64),Y=new Int32Array(256),O=new Uint8Array(65536),n=P.length,s=0,k=0,l=0,i=0,p=0,t=0,o=0,x=0,m=0;
let E=(e:number)=>({o:O.slice(0,l),c:e});
for(;;){
if(t==1e6)return E(10);
if(p<0||p>=n)return E(9);
o=P[p];
m=o==1?1:o==2?4:o>47&&o<52?2:0;
if(!(o<8||o>15&&o<31||o>31&&o<35||o>47&&o<53||o==64||o==65||o>79&&o<84))return E(5);
if(p+m>=n)return E(9);
t++;
let q=0,g=0;
if(o==7)q=3;
else if(o==65)q=2,g=-2;
else if(o==5||o==6)q=2,g=o-5;
else if(o==4)q=1,g=1;
else if(o==1||o==2||o==82)g=1;
else if(o>15&&o<35){if(o==23||o==27)q=1;else q=2,g=-1}
else if(o==3||o==49||o==50||o==80||o==81||o==83)q=1,g=-1;
else if(o==64)q=1;
if(s<q)return E(2);
if(s+g>256)return E(3);
x=p+1+m;
p=x;
if(o>15&&o<35){
if(o==23)S[s-1]=-S[s-1];
else if(o==27)S[s-1]=~S[s-1];
else{
let A=S[s-2],B=S[s-1],r=0;
if(o==16)r=A+B;
else if(o==17)r=A-B;
else if(o==18)r=Math.imul(A,B);
else if(o>18&&o<23){if(!B)return E(4);r=o==19?(A/B)|0:o==20?A%B:o==21?(A>>>0)/(B>>>0)|0:(A>>>0)%(B>>>0)}
else if(o>23&&o<27)r=o==24?A&B:o==25?A|B:A^B;
else if(o>27&&o<31)r=o==28?A<<(B&31):o==29?A>>(B&31):A>>>(B&31);
else r=o==32?+(A==B):o==33?+(A<B):+((A>>>0)<(B>>>0));
S[s-2]=r;
s--;
}
}
else if(o==0)return E(0);
else if(o==1)S[s++]=(P[x-1]<<24)>>24;
else if(o==2)S[s++]=P[x-4]|P[x-3]<<8|P[x-2]<<16|P[x-1]<<24;
else if(o==3)s--;
else if(o==4)S[s]=S[s-1],s++;
else if(o==5){let v=S[s-1];S[s-1]=S[s-2];S[s-2]=v}
else if(o==6)S[s]=S[s-2],s++;
else if(o==7){let v=S[s-3];S[s-3]=S[s-2];S[s-2]=S[s-1];S[s-1]=v}
else if(o<51){let v=((P[x-2]|P[x-1]<<8)<<16)>>16;if(o==48||(S[--s]==0)==(o==49))p=x+v}
else if(o==51){if(k==64)return E(7);C[k++]=x;p=P[x-2]|P[x-1]<<8}
else if(o==52){if(!k)return E(8);p=C[--k]}
else if(o==64){let v=S[s-1];if(v<0||v>255)return E(6);S[s-1]=Y[v]}
else if(o==65){let v=S[s-1];if(v<0||v>255)return E(6);Y[v]=S[s-2];s-=2}
else if(o==80){let v=S[s-1]+"";if(l+v.length>65536)return E(11);s--;for(let j=0;j<v.length;j++)O[l++]=v.charCodeAt(j)}
else if(o==81){if(l>65535)return E(11);O[l++]=S[--s]&255}
else if(o==82)S[s++]=i<N.length?N[i++]:-1;
else return E(S[--s]&255);
}
}
let I=process.env.MAKEFUN_INPUT_DIR??"/input",Q=process.env.MAKEFUN_OUTPUT_DIR??"/output";
for(let f of b(I).sort()){let r=V(c(I+"/"+f+"/program.bin"),c(I+"/"+f+"/input.bin"));a(Q+"/"+f,{recursive:true});d(Q+"/"+f+"/stdout.bin",r.o);d(Q+"/"+f+"/exit.txt",r.c+"\n")}
