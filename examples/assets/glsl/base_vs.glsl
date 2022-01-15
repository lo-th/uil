varying vec3 worldPosition;
void main()	{

	worldPosition = ( modelMatrix * vec4( position, 1.0 )).xyz;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}