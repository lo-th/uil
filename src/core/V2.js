export class V2 {

	constructor( x = 0, y = 0 ) {

		this.x = x;
		this.y = y;

	}

	set ( x, y ) {

		this.x = x;
		this.y = y;
		return this;

	}

	divide ( v ) {

		this.x /= v.x;
		this.y /= v.y;
		return this;

	}

	multiply ( v ) {

		this.x *= v.x;
		this.y *= v.y;
		return this;

	}

	multiplyScalar ( scalar ) {

		this.x *= scalar;
		this.y *= scalar;
		return this;

	}

	divideScalar ( scalar ) {

		return this.multiplyScalar( 1 / scalar );

	}

	length () {

		return Math.sqrt( this.x * this.x + this.y * this.y );

	}

	angle () {

		// computes the angle in radians with respect to the positive x-axis

		var angle = Math.atan2( this.y, this.x );

		if ( angle < 0 ) angle += 2 * Math.PI;

		return angle;

	}

	addScalar ( s ) {

		this.x += s;
		this.y += s;
		return this;

	}

	negate () {

		this.x *= -1;
		this.y *= -1;
		return this;

	}

	neg () {

		this.x = -1;
		this.y = -1;
		return this;

	}

	isZero () {

		return ( this.x === 0 && this.y === 0 );

	}

	copy ( v ) {

		this.x = v.x;
		this.y = v.y;

		return this;

	}

	equals ( v ) {

		return ( ( v.x === this.x ) && ( v.y === this.y ) );

	}

	nearEquals ( v, n ) {

		return ( ( v.x.toFixed(n) === this.x.toFixed(n) ) && ( v.y.toFixed(n) === this.y.toFixed(n) ) );

	}

	lerp ( v, alpha ) {

		if( v === null ){
			this.x -= this.x * alpha;
		    this.y -= this.y * alpha;
		} else {
			this.x += ( v.x - this.x ) * alpha;
		    this.y += ( v.y - this.y ) * alpha;
		}

		return this;

	}

}