class ComplexNumber  {
  constructor(public real: number, public i:number = 0) {}
}

function inRange (r:ComplexNumber):boolean {
  return r.i ===0 && r.real >=0 && r.real <= 1
}

function realOnly(r:ComplexNumber):number {
  return r.real
}

function solveLinear(a:number, b:number):ComplexNumber[] {
  return [{real:-b / a , i:0}]
}


function solveQadratic(a:number,b:number,c:number):ComplexNumber[] {
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

export function intersect(at:number, points:number[]){
  
  //normaize points to 4 elements
  for(var i = points.length; i < 4; i++) {
    points.unshift(0)
  }
  
  // compute the Bezier factors
	var bMatrix = [
		[-1,  3, -3,  1],
		[ 3, -6,  3,  0],
		[-3,  3,  0,  0],
		[ 1,  0,  0,  0]
	]
	
	var bezierCoeff = [0,0,0,0]
	
	for (var i = 0; i < bMatrix.length; i++) {
		for (var j = 0; j < points.length; j++) {
			bezierCoeff[i] += bMatrix[i][j] * points[j]
		}
	}
  
  var a = bezierCoeff[0],
      b = bezierCoeff[1],
      c = bezierCoeff[2],
      d = bezierCoeff[3] - at 
      
  var roots:ComplexNumber[]
  
  if (a !== 0) {
    roots = solveCubic(a,b,c,d)
  } else if (b !== 0) {
    roots = solveQadratic(b,c,d)
  } else {
    roots = solveLinear(c,d)
  }
  
 return roots.filter(inRange).map(realOnly)
} 

function bezierFn(t, points):number {
  var bMatrix = [
    [-1,  3, -3,  1],
    [ 3, -6,  3,  0],
    [-3,  3,  0,  0],
    [ 1,  0,  0,  0]
  ]
  var bezierCoeff = []
  for (var j = 0; j < points.length; j++) {
    bezierCoeff[j] = 0
  }
  for (var i = 0; i < bMatrix.length; i++) {
    for (var j = 0; j < points.length; j++) {
      bezierCoeff[i] += bMatrix[i][j] * points[j]
    }
  }
  var val = 0
  var tP = 1
  for (var i = bMatrix.length - 1; i >= 0; i--) {
    val += bezierCoeff[i] * tP
    tP = tP * t
  }
  return val
}
	
export function computePoint(t, points):[number, number] {
  return [bezierFn(t, points.map(function(p){ return p[0] })), bezierFn(t, points.map(function(p){ return p[1] }))]
}

export function splitSegment(points:[number, number][], t0:number):[number, number][][] {
    // split a segment into two at t0 while preserving the shape of the original segment.
    
    if (points.length === 4) return splitCubic(points,t0)
    if (points.length === 3) return splitQuad(points,t0)
}

function splitCubic(p:[number, number][], z:number):[number, number][][] {
  
  // formula from http://pomax.github.io/bezierinfo/
    var zM1 = z - 1;
    var zPow2 = z * z
    var zPow3 = zPow2 * z
    var zM1Pow2 = zM1 * zM1
    var zM1Pow3 = zM1Pow2 * zM1
    
    var pLeft = []
    pLeft[0] = p[0]  //P1
    pLeft[1] = [
        z*p[1][0] - zM1*p[0][0],  // z⋅P2−(z−1)⋅P1
        z*p[1][1] - zM1*p[0][1]
      ]
    pLeft[2] = [
      zPow2*p[2][0] - 2*z*zM1*p[1][0] + zM1Pow2*p[0][0], //  z^2⋅P3−2⋅z⋅(z−1)⋅P2+(z−1)^2⋅P1 
      zPow2*p[2][1] - 2*z*zM1*p[1][1] + zM1Pow2*p[0][1]
    ]
    pLeft[3] = [
      zPow3*p[3][0] - 3*zPow2*zM1*p[2][0] + 3*z*zM1Pow2*p[1][0] - zM1Pow3*p[0][0], // z^3⋅P4−3⋅z^2⋅(z−1)⋅P3+3⋅z⋅(z−1)^2⋅P2−(z−1)^3⋅P1
      zPow3*p[3][1] - 3*zPow2*zM1*p[2][1] + 3*z*zM1Pow2*p[1][1] - zM1Pow3*p[0][1]
    ]
    
    var pRight = []
    pRight[0] = pLeft[3]
    pRight[1] = [
      zPow2*p[3][0] - 2*z*zM1*p[2][0] + zM1Pow2*p[1][0], // z^2⋅P4−2⋅z⋅(z−1)⋅P3+(z−1)^2⋅P2
      zPow2*p[3][1] - 2*z*zM1*p[2][1] + zM1Pow2*p[1][1]
    ]
    pRight[2] = [
      z*p[3][0] - zM1*p[2][0],  // z⋅P4−(z−1)⋅P3
      z*p[3][1] - zM1*p[2][1]
    ]
    pRight[3] = p[3]
    
    return [pLeft, pRight]
}

function splitQuad(p:[number, number][], z:number):[number, number][][] { 
  
  // formula from http://pomax.github.io/bezierinfo/
    var zM1 = z - 1;
    var zPow2 = z * z
    var zM1Pow2 = zM1 * zM1
    var pLeft = []
    pLeft[0] = p[0]
    pLeft[1] = [
        z*p[1][0] - zM1*p[0][0],  // z⋅P2−(z−1)⋅P1
        z*p[1][1] - zM1*p[0][1]
      ]
    pLeft[2] = [
      zPow2*p[2][0] - 2*z*zM1*p[1][0] + zM1Pow2*p[0][0], //  z^2⋅P3−2⋅z⋅(z−1)⋅P2+(z−1)^2⋅P1 
      zPow2*p[2][1] - 2*z*zM1*p[1][1] + zM1Pow2*p[0][1]
    ]
    
    var pRight = []
    pRight[0] = pLeft[0]
    pRight[1] = [
      z*p[2][0] - zM1*p[1][0],  // z⋅P4−(z−1)⋅P3
      z*p[2][0] - zM1*p[1][0]
    ]
    pRight[2] = p[2]
    
    return [pLeft, pRight]
}

export function quadToCubic(p0:[number,number], cp:[number,number],p1:[number,number]):[number,number][] {
    var cp0 = [p0[0] + (cp[0] - p0[0])*2/3, p0[1] + (cp[1] - p0[1])*2/3],
        cp1 = [p1[0] + (cp[0] - p1[0])*2/3, p1[1] + (cp[1] - p1[1])*2/3]
    return [p0, cp0, cp1, p1]
}