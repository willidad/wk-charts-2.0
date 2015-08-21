type Point = [number, number]
type Segment = [Point, Point, Point, Point]

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


function solveQuadratic(a:number,b:number,c:number):ComplexNumber[] {
  var discrim = b*b -4*a*c
  if (discrim < 0) {
    var r1 = new ComplexNumber(-b/(2*a), Math.sqrt(-discrim)/(2*a))
    var r1 = new ComplexNumber(-b/(2*a), -Math.sqrt(-discrim)/(2*a))
  } else {
    var r1 = new ComplexNumber((-b + Math.sqrt(discrim)) / (2 * a))
    var r2 = new ComplexNumber((-b - Math.sqrt(discrim)) / (2 * a))
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
  if (a < 1e-12) a = 0
  
  if (a !== 0) {
    roots = solveCubic(a,b,c,d)
  } else if (b !== 0) {
    roots = solveQuadratic(b,c,d)
  } else {
    roots = solveLinear(c,d)
  }
  var r = roots.filter(inRange).map(realOnly)
 return r
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
	
export function computePoint(t, points):Point {
  return [bezierFn(t, points.map(function(p){ return p[0] })), bezierFn(t, points.map(function(p){ return p[1] }))]
}

export function splitSegment(points:[number, number][], t0:number):[Segment, Segment] {
    // split a segment into two at t0 while preserving the shape of the original segment.
    
    var n = points.length - 1; // number of control points
    var b = [];		   	   // coefficients as in De Casteljau's algorithm
    var left:Segment = [];		   // first curve resulting control points
    var right:Segment = [];		   // second curve resulting control points
    var t1 = 1 - t0;
    
    // multiply point with scalar factor
    var pf = function(p, f) {
        var res = [];
        for(var i = 0; i < p.length; i++) {
            res.push(f * p[i]);
        }
        return res;
    };
    // add points as vectors
    var pp = function(p1, p2) {
        var res = [];
        for(var i = 0; i < Math.min(p1.length, p2.length); i++) {
            res.push(p1[i] + p2[i]);
        }
        return res;
    };
    
    // set original coefficients: b[i][0] = points[i]
    for(var i = 0; i <= n; i++) {
        //points[i] = (typeof points[i] == "object") ? points[i] : [points[i]];
        b.push([ points[i] ]);
    }
    // get all coefficients
    for(var j = 1; j <= n; j++) {
        for(var i = 0; i <= (n-j); i++) {
            b[i].push( pp(
                    pf(b[i][j-1], t1),
                    pf(b[i+1][j-1], t0)
            ));
        }
    }
    // set result: res1 & res2
    for(var j = 0; j <= n; j++) {
        left.push(b[0][j]);
        right.push(b[j][n-j]);
    }
    
    return [left, right]
}

export function quadToCubic(p0:[number,number], cp:[number,number],p1:[number,number]):Segment{
    var cp0:[number,number] = [p0[0] + (cp[0] - p0[0])*2/3, p0[1] + (cp[1] - p0[1])*2/3],
        cp1:[number,number] = [p1[0] + (cp[0] - p1[0])*2/3, p1[1] + (cp[1] - p1[1])*2/3]
    return [p0, cp0, cp1, p1]
}

