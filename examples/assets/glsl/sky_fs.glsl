
// @author Artur Vill _ @shaderology
// optimized by @3dflashlo

varying vec3 worldPosition;

uniform vec3 fogColor;
uniform vec3 groundColor;
uniform vec3 cloudColor;

uniform sampler2D noiseMap;
uniform vec3 lightdir;
uniform float fog;
uniform float cloud_size;
uniform float cloud_covr;
uniform float cloud_dens;
uniform float t;

const int SAMPLE = 128;
const int STEP = 8;

const float c = 6.36e6;
const float d = 6.38e6;

const float g = 0.76;
const float h = g*g;
const float icc = 1.0/8e3;
const float jcc = 1.0/1200.0;
const float pi = 3.141592653589793;

const vec3 vm = vec3( 0,-c,0 );
const vec3 vn = vec3( 2.1e-5 );
const vec3 vo = vec3( 5.8e-6, 1.35e-5, 3.31e-5 );

//#define USE_PROCEDURAL

#ifdef USE_PROCEDURAL

float hash( float n ) { return fract(sin(n)*753.5453123); }

float noise( in vec3 x ){

    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f*f*(3.0-2.0*f);
    
    float n = p.x + p.y*157.0 + 113.0*p.z;
    return mix(mix(mix( hash(n+  0.0), hash(n+  1.0),f.x),
                   mix( hash(n+157.0), hash(n+158.0),f.x),f.y),
               mix(mix( hash(n+113.0), hash(n+114.0),f.x),
                   mix( hash(n+270.0), hash(n+271.0),f.x),f.y),f.z);
}

#else

// optimized noise from map

float noise( in vec3 x ){

    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f*f*(3.0-2.0*f);
    
    vec2 uv = (p.xy+vec2(37.0,17.0)*p.z) + f.xy;
    vec2 rg = texture2D( noiseMap, (uv+0.5)/256.0, -16.0 ).yx;
    return mix( rg.x, rg.y, f.z );
}

#endif


float NOISE( vec3 r ){

	r.xz += t;
	r *= 0.5;
	float s;
	s = 0.5 * noise(r);
	r = r * 2.52;
	s += 0.25 * noise(r);
	r = r * 2.53;
	s += 0.125 * noise(r);
	r = r * 2.51;
	s += 0.0625 * noise(r);
	r = r * 2.53;
	s += 0.03125 * noise(r);
	r = r*2.52;
	s += 0.015625 * noise(r);
	return s;

}

float MakeNoise( vec3 r ){

	float s,t;
	s = NOISE( r * 2e-4 * ( 1.0 - cloud_size ) );
	t = ( 1.0 - cloud_covr ) * 0.5 + 0.2;
	s = smoothstep( t, t+.2 , s );
	s *= 0.5*cloud_dens;
	return s;

}

void cloudLayer( in vec3 r,out float s,out float t,out float u ){

	float v,w;
	v = length( r-vm ) - c;
	w=0.0;
	if( 5e3 < v && v < 1e4 ) w = MakeNoise( r ) * sin( pi*(v-5e3)/5e3 );
	s = exp(-v*icc) + fog;
	t = exp(-v*jcc) + w + fog;
	u = w + fog;

}

float ca(in vec3 r,in vec3 s,in float t){

	vec3 u = r-vm;
	float v,w,x,y,z,A;
	v = dot(u,s);
	w = dot(u,u)-t*t;
	x = v*v-w;
	if( x<0.0 ) return -1.0;
	y = sqrt(x);
	z = -v-y;
	A = -v+y;
	return z >= 0.0 ? z : A;

}

vec3 makeSky( in vec3 r, in vec3 s, out float t){
	
	float u,v,w,x,y,z,A,B,C,m,F;
	vec3 p = normalize( lightdir );
	u = ca(r,s,d);
	v = dot(s,p);
	w = 1.0+v*v;
	x = 0.0596831*w;
	y = 0.0253662*(1.0-h)*w/((2.0+h)*pow(abs(1.0+h-2.0*g*v),1.5));
	z = 50.*pow(abs(1.+dot(s,-p)),2.0)*dot(vec3(0,1,0),p)*(1.0-cloud_covr)*(1.0-min(fog,1.0));
	A = 0.0;
	B = 0.0;
	C = 0.0;
	m = 0.0;
	vec3 D,E;
	//float H,J,K,L,M, N,O,P,Q, S,U,V,W;
	D = vec3(0);
	E = vec3(0);
	F = u / float( SAMPLE );

	for( int G=0; G<SAMPLE; ++G ){
		float H,J,K,L,M;
		H = float(G)*F;
		vec3 I = r + s * H;
		L = 0.0;
		cloudLayer( I, J, K, L );
		J *= F;
		K *= F;
		A += J;
		B += K;
		C += L;
		M = ca(I,p,d);
		if( M > 0.0 ){
			float N,O,P,Q;
			N=M/float(STEP);
			O=0.0;
			P=0.0;
			Q=0.0;
			for( int R=0; R<STEP; ++R ){
				float S,U,V,W;
				S = float(R)*N;
				vec3 T=I+p*S;
				//W = 0.0;
				cloudLayer( T, U, V, W );
				O+=U*N;
				P+=V*N;
				Q+=W*N;
			}
			vec3 S = exp(-(vo*(O+A)+vn*(P+B)));
			m+=L;
			D+=S*J;
			E+=S*K+z*m;
		}
		else return vec3(0.0);
	}
	t = m * 0.0125;// /80.0;
	return ( (D * vo * x) + (E * vn * y)) * 15.0;
}

void main(){

	vec3 light = normalize( lightdir );

	vec3 r = normalize( worldPosition );

	//float theta = acos( r.y ); // elevation --> y-axis, [-pi/2, pi/2]',
	//float phi = atan( r.z, r.x ); // azimuth --> x-axis [-pi/2, pi/2]',
	//vec2 uv = vec2( phi, theta ) / vec2( 2.0 * pi, pi ) + vec2( 0.5, 0.0 );
	//uv.y = 1.0-uv.y;

	float uvy = acos( r.y ) / pi;

	float top = uvy <= 0.505 ? 1.0 : smoothstep(1.0, 0.0, (uvy-0.505)*25.0);//smoothstep((uv.y*2.0), 0.0, 0.5);
	float low = uvy > 0.505 ? 1.0 : smoothstep(1.0, 0.0, (0.505-uvy)*100.0);//smoothstep((uv.y*2.0), 0.0, 0.5);



	vec3 s = vec3( 0, 0.99, 0 );

	float m = 0.0;
	vec3 sky = clamp( makeSky( s, r, m ), vec3( 0.0 ), vec3( 10000.0 ) );

	//float u = pow( abs( 1.0 - abs(r.y) ), 10.0 );
	//float top = r.y >= 0.0 ? 1.0 : u; 
	//float low = r.y <= 0.0 ? 1.0 : 
	float luma = 0.005 + max( dot( vec3( 0, 1.0, 0 ), light ), 0.0 ) * 0.2;
	//x = ;
	//sky = mix(vec3(x),t,v*0.8);
	// cloudColor
	sky = mix( groundColor*luma, sky , top);//*0.8);
	//sky = smoothstep( groundColor*x, sky , vec3(v));
	float alpha = clamp( m + low, 0.0 , 0.99 ) + 0.01;

	vec3 color = pow( abs( sky ), vec3( .5 ) );

	//color = vec3(worldPosition.y);

	gl_FragColor = vec4( color, alpha );

	//#include <tonemapping_fragment>

}
