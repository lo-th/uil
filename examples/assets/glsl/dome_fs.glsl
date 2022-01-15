
// @author Artur Vill _ @shaderology

varying vec3 worldPosition;

uniform vec3 lightdir;
uniform vec3 lunardir;
uniform sampler2D tDome;
uniform samplerCube tCube;

const float pi = 3.141592653589793;

vec3 M33(vec3 e){
	return e-floor(e*(1./289.))*289.;
}

vec4 M44(vec4 e){
	return e-floor(e*(1./289.))*289.;
}

vec4 N(vec4 e){
	return M44((e*34.+1.)*e);
}

vec4 O(vec4 e){
	return 1.79284291400159-.85373472095314*e;
}

float P(vec3 e){
	const vec2 f=vec2(1./6.,1./3.);
	const vec4 g=vec4(0,.5,1,2);
	vec3 h,i,j,k,l,m,n,o,p,s,G,H,I,J;
	h=floor(e+dot(e,f.yyy));
	i=e-h+dot(h,f.xxx);
	j=step(i.yzx,i.xyz);
	k=1.-j;l=min(j.xyz,k.zxy);
	m=max(j.xyz,k.zxy);
	n=i-l+f.xxx;
	o=i-m+f.yyy;
	p=i-g.yyy;
	h=M33(h);
	vec4 q,t,u,v,w,x,y,z,A,B,C,D,E,F,K,L;
	q=N(N(N(h.z+vec4(0,l.z,m.z,1))+h.y+vec4(0,l.y,m.y,1))+h.x+vec4(0,l.x,m.x,1));
	float r = 0.142857142857;
	s=r*g.wyz-g.xzx;
	t=q-49.*floor(q*s.z*s.z);
	u=floor(t*s.z);
	v=floor(t-7.*u);
	w=u*s.x+s.yyyy;
	x=v*s.x+s.yyyy;
	y=1.-abs(w)-abs(x);
	z=vec4(w.xy,x.xy);
	A=vec4(w.zw,x.zw);
	B=floor(z)*2.+1.;
	C=floor(A)*2.+1.;
	D=-step(y,vec4(0));
	E=z.xzyw+B.xzyw*D.xxyy;
	F=A.xzyw+C.xzyw*D.zzww;
	G=vec3(E.xy,y.x);
	H=vec3(E.zw,y.y);
	I=vec3(F.xy,y.z);
	J=vec3(F.zw,y.w);
	K=O(vec4(dot(G,G),dot(H,H),dot(I,I),dot(J,J)));
	G*=K.x;
	H*=K.y;
	I*=K.z;
	J*=K.w;
	L=max(.6-vec4(dot(i,i),dot(n,n),dot(o,o),dot(p,p)),0.);
	L=L*L;
	return 21.*dot(L*L,vec4(dot(G,i),dot(H,n),dot(I,o),dot(J,p)))+.5;
}

vec2 Q(vec3 e){
	return vec2(.5+atan(e.z,e.x)/(2.*pi),.5+atan(e.y,length(e.xz))/pi);
}

mat3 R(vec3 e,vec3 f){
	vec3 g,h;
	g=normalize(cross(f,e));
	h=normalize(cross(e,g));
	return mat3(g.x,g.y,g.z,h.x,h.y,h.z,e.x,e.y,e.z);
}

void main(){

	vec3 light = normalize( lightdir );
	vec3 e = normalize( worldPosition );
	vec3 f = R( light, vec3(0,1,0) )*e;
	vec3 milk = texture2D( tDome, Q(f) ).rgb;
	float h,j,k,l;
	h=(milk.x+milk.y+milk.z)/3.;
	const float i=1.0;
	j=P(f*i*134.);
	j+=P( f*i*370.);
	j+=P( f*i*870.);
	k=pow(abs(j),9.)*2e-4;
	l=pow(abs(j),19.)*1e-8;
	vec3 star = clamp(mix(normalize(milk)*(l+k*h),milk,h*.1),0.,2.);
	vec4 cubi = textureCube( tCube, e );
	star = star*(1.0-cubi.a)*clamp(pow(abs(1.-light.y),10.),0.,1.);
	gl_FragColor = vec4( star + cubi.rgb,1);
	
	//#include <tonemapping_fragment>

}