import * as s from './segment'
import * as bezier from './../helpers/bezierFunctions'

class ComplexNumber  {
  constructor(public real: number, public i:number = 0) {}
}

function solveQuadratic(a:number,b:number,c:number):ComplexNumber[] {
  var discrim = Math.sqrt(b*b -4*a*c)
  if (discrim < 0) {
    var r1 = new ComplexNumber(-b/(2*a), discrim/(2*a))
    var r1 = new ComplexNumber(-b/(2*a), -discrim/(2*a))
  } else {
    var r1 = new ComplexNumber((-b + discrim) / (2 * a))
    var r2 = new ComplexNumber((-b - discrim) / (2 * a))
  }
  return [r1, r2]
}

function intersect(at:number, p1:number,p2:number,p3:number):number[] {
  
  // compute the Bezier factors for the cubic equation solver. Matrix form for Bezier euqation from http://pomax.github.io/bezierinfo/
  
  var a = p1     - 2*p2 + p3,
      b = -2*p1  + 2*p2,
      c = p3     + at

  return solveQuadratic(a,b,c).filter(function(r:ComplexNumber) { return 0 >= r.real && r.real <= 1 && r.i === 0}).map(function(r:ComplexNumber) { return r.real })
} 

function splitQuadratic(z:number, p1:s.Point, p2:s.Point, p3:s.Point):[Quadratic, Quadratic] {
	var lP1:s.Point, lP2:s.Point, lP3:s.Point, rP1:s.Point, rP2:s.Point, rP3:s.Point
	// Formula from http://pomax.github.io/bezierinfo/
	lP1 = p1
	lP2[0] = z*p2[0] - (z-1)*p1[0]
	lP2[1] = z*p2[1] - (z-1)*p1[1]
	lP3[0] = z*z*p3[0] - 2*z*(z-1)*p2[0] + (z-1)*(z-1)*p1[0]
	lP3[1] = z*z*p3[1] - 2*z*(z-1)*p2[1] + (z-1)*(z-1)*p1[1]	
	
	rP1 = lP3
	rP2[0] = z*p3[0] - (z-1)*p2[0]
	rP2[0] = z*p3[1] - (z-1)*p2[1]
	rP3 = p3
	return [new Quadratic(rP1, rP2, rP3), new Quadratic(lP1, lP2, lP3)]
}

export class Quadratic implements s.Segment {
	
	constructor(public p1:s.Point, public t:s.Point, public p2:s.Point) {}
	
	public contains(p:number, direction:s.Direction):boolean {
		return this.p1[direction] < this.p2[direction] ? this.p1[direction] <= p && p <= this.p2[direction] : this.p2[direction] <= p && p <= this.p1[direction]
	}
	
	public splitAt(pos:number, direction:s.Direction):[s.Segment, s.Segment] {
		var t = intersect(pos, this.p1[direction], this.t[direction], this.p2[direction])
		if (t.length !== 1) {
			throw `cannot split segment ${this} in direction ${s.Direction[direction]} at position ${pos}`
		}
		return splitQuadratic(t[0], this.p1,this.t,this.p2)
	}
	
	get path():string {
		return `Q${[this.t, this.p2].join()}`
	}
}