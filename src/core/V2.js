
// minimal vector 2

function V2 ( x, y ){

	this.x = x || 0;
	this.y = y || 0;

}

Object.assign( V2.prototype, {

	set: function ( x, y ) {

		this.x = x;
		this.y = y;

		return this;

	},

	divide: function ( v ) {

		this.x /= v.x;
		this.y /= v.y;

		return this;

	},

	multiply: function ( v ) {

		this.x *= v.x;
		this.y *= v.y;

		return this;

	},

	multiplyScalar: function ( scalar ) {

		this.x *= scalar;
		this.y *= scalar;

		return this;

	},

	divideScalar: function ( scalar ) {

		return this.multiplyScalar( 1 / scalar );

	},

	length: function () {

		return Math.sqrt( this.x * this.x + this.y * this.y );

	},

	angle: function () {

		// computes the angle in radians with respect to the positive x-axis

		var angle = Math.atan2( this.y, this.x );

		if ( angle < 0 ) angle += 2 * Math.PI;

		return angle;

	},

	addScalar: function ( s ) {

		this.x += s;
		this.y += s;

		return this;

	},

	negate: function () {

		this.x *= -1;
		this.y *= -1;

		return this;

	},

	neg: function () {

		this.x = -1;
		this.y = -1;

		return this;

	},

	isZero: function () {

		return ( this.x === 0 && this.y === 0 );

	},

	copy: function ( v ) {

		this.x = v.x;
		this.y = v.y;

		return this;

	},

	equals: function ( v ) {

		return ( ( v.x === this.x ) && ( v.y === this.y ) );

	},

	nearEquals: function ( v, n ) {

		return ( ( v.x.toFixed(n) === this.x.toFixed(n) ) && ( v.y.toFixed(n) === this.y.toFixed(n) ) );

	},

	lerp: function ( v, alpha ) {

		if(v===null){
			this.x -= this.x * alpha;
		    this.y -= this.y * alpha;
		} else {
			this.x += ( v.x - this.x ) * alpha;
		    this.y += ( v.y - this.y ) * alpha;
		}

		

		return this;

	},



} );


export { V2 };