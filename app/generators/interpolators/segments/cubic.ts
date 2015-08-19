import * as s from './segment'
import * as bezier from './../helpers/bezierFunctions'

class ComplexNumber  {
  constructor(public real: number, public i:number = 0) {}
}

function solveCubic(a:number,b:number,c:number, d:number):ComplexNumber[] {
  var roots:ComplexNumber[] = [ {real: 0, i: 0}, {real: 0, i: 0}, {real: 0, i: 0} ]
  
  b /= a;
  c /= a;
  d /= a;

  var discrim, q, r, dum1, s, t, term1, r13;

  q = (3.0*c - (b*b))/9.0;
  r = -(27.0*d) + b*(9.0*c - 2.0*(b*b));
  r /= 54.0;

  discrim = q*q*q + r*r;
  
  term1 = (b/3.0);

  if (discrim > 0) { // one root real, two are complex
    s = r + Math.sqrt(discrim);
    s = ((s < 0) ? -Math.pow(-s, (1.0/3.0)) : Math.pow(s, (1.0/3.0)));
    t = r - Math.sqrt(discrim);
    t = ((t < 0) ? -Math.pow(-t, (1.0/3.0)) : Math.pow(t, (1.0/3.0)));
    
    roots[0].real = -term1 + s + t;
    term1 += (s + t)/2.0;
    roots[2].real = roots[2].real = -term1;
    term1 = Math.sqrt(3.0)*(-t + s)/2;
    
    roots[1].i = term1;
    roots[2].i = -term1;
  } else if (discrim == 0){ // All roots real, at least two are equal.
    r13 = ((r < 0) ? -Math.pow(-r,(1.0/3.0)) : Math.pow(r,(1.0/3.0)));
    roots[0].real = -term1 + 2.0*r13;
    roots[2].real = roots[1].real = -(r13 + term1);
  } else {
    // Only option left is that all roots are real and unequal (to get here, q < 0)
    q = -q;
    dum1 = q*q*q;
    dum1 = Math.acos(r/Math.sqrt(dum1));
    r13 = 2.0*Math.sqrt(q);
    
    roots[0].real = -term1 + r13*Math.cos(dum1/3.0);
    roots[1].real = -term1 + r13*Math.cos((dum1 + 2.0*Math.PI)/3.0);
    roots[2].real = -term1 + r13*Math.cos((dum1 + 4.0*Math.PI)/3.0);
  }
  return roots
}

export function intersect(at:number, p1:number,p2:number,p3:number,p4:number):number[] {
  
  // compute the Bezier factors for the cubic equation solver. Matrix form for Bezier euqation from http://pomax.github.io/bezierinfo/
  
  var a = -p1   + 3*p2 - 3+p3 + p4,
      b = 3*p1  - 6*p2 + 3*p3,
      c = -3*p1 + 3*p2,
      d = p4    - at 

  return solveCubic(a,b,c,d).filter(function(r:ComplexNumber) { return 0 >= r.real && r.real <= 1 && r.i === 0}).map(function(r:ComplexNumber) { return r.real })
} 

function splitCubic(z:number, p1:s.Point, p2:s.Point, p3:s.Point, p4:s.Point):[Cubic, Cubic] {
	var lP1:s.Point, lP2:s.Point, lP3:s.Point, lP4:s.Point, rP1:s.Point, rP2:s.Point, rP3:s.Point, rP4:s.Point
	// Formula from http://pomax.github.io/bezierinfo/
	lP1 = p1
	lP2[0] = z*p2[0] - (z-1)*p1[0]
	lP2[1] = z*p2[1] - (z-1)*p1[1]
	lP3[0] = z*z*p3[0] - 2*z*(z-1)*p2[0] + (z-1)*(z-1)*p1[0]
	lP3[1] = z*z*p3[1] - 2*z*(z-1)*p2[1] + (z-1)*(z-1)*p1[1]
	lP4[0] = z*z*z*p4[0] - 3*z*z*(z-1)*p3[0] + 3*z*(z-1)*(z-1)*p2[0] + (z-1)*(z-1)*(z-1)*p1[0]
	lP4[1] = z*z*z*p4[1] - 3*z*z*(z-1)*p3[1] + 3*z*(z-1)*(z-1)*p2[1] + (z-1)*(z-1)*(z-1)*p1[1]
	
	rP1 = lP4
	rP2[0] = z*z*p4[0] - 2*z*(z-1)*p3[0] + (z-1)*(z-1)*p2[0]
	rP2[1] = z*z*p4[1] - 2*z*(z-1)*p3[1] + (z-1)*(z-1)*p2[1]
	rP3[0] = z*p4[0] - (z-1)*p3[0]
	rP3[0] = z*p4[1] - (z-1)*p3[1]
	rP4 = p4
	return [new Cubic(rP1, rP2, rP3, rP4), new Cubic(lP1, lP2, lP3, lP4)]
}

export class Cubic implements s.Segment {
	
	constructor(public p1:s.Point, public t1:s.Point, public t2:s.Point, public p2:s.Point) {}
	
	public contains(p:number, direction:s.Direction):boolean {
		return this.p1[direction] < this.p2[direction] ? this.p1[direction] <= p && p <= this.p2[direction] : this.p2[direction] <= p && p <= this.p1[direction]
	}
	
	public splitAt(pos:number, direction:s.Direction):[s.Segment, s.Segment] {
		var t = intersect(pos, [this.p1[direction], this.t1[direction], this.t2[direction], this.p2[direction]])
		if (t.length !== 1) {
			throw `cannot split segment ${this} in direction ${s.Direction[direction]} at position ${pos}`
		}
		return splitCubic(t[0], this.p1,this.t1,this.t2,this.p2)
	}
	
	get path():string {
		return `C${[this.t1, this.t2, this.p2].join()}`
	}
}