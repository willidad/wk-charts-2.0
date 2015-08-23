import { Point, Points, IInterpolator} from './../core/interfaces'
import  * as bezier from './helpers/bezierFunctions'

export type ControlPoints = [Point, Point, Point, Point]

function lineCardinalTangents(points, tension):Point[] {
  // calculate the control points for the cardinal spline, returns an array of control points 
  var tangents = [], a = (1 - tension) / 2, p0, p1 = points[0], p2 = points[1], i = 1, n = points.length;
  while (++i < n) {
    p0 = p1; 
    p1 = p2;
    p2 = points[i];
    tangents.push([a * (p2[0] - p0[0]), a * (p2[1] - p0[1])]);
  }
  return tangents;
}
 
/**
 * creates a list of segments from the data points and the computed tangents. Th first and the last segment, 
 * which have only one computed tangent value (and thus are naturally a quadratic curve) are extended to a cubic curve
 * to allow a single case for the intersect and split algorithms. 
 */
 
 //TODO: implement quadratic for begin / end segments

function segments(points:Point[], tangents:Point[]):ControlPoints[] {
  var p0:Point = points[0], 
      p1:Point = points[1],
      cp:[number, number],
      cp0:[number, number],
      cp1:[number, number],
      t0:Point, 
      t1:Point,
      segs:ControlPoints[] = []
 
  if (points.length === 1) {
    return [[p0, p0, p0, p0]]
  }
  if (points.length === 2) {
    return [[p0, p0, p1,p1]]
  }
  t0 = tangents[0] , t1 = t0

  // set start path element 
  cp = [p1[0] - t0[0] * 2 / 3, p1[1] - t0[1] * 2 / 3]
  segs.push(bezier.quadToCubic(p0,cp,p1))
  // inner elements
  for (var i = 1; i < tangents.length; i++) {
    p0 = p1, p1 = points[i+1]
    t0 = tangents[i-1], t1 = tangents[i]
    cp0 = [p0[0] + t0[0], p0[1] + t0[1]]
    cp1 = [p1[0] - t1[0], p1[1] - t1[1]]
    segs.push([p0, cp0, cp1, p1])
  }   
  // final element
  p0 = p1
  p1 = points[i+1]
  cp = [p0[0] + t1[0] * 2 / 3, p0[1] + t1[1] * 2 / 3]
  segs.push(bezier.quadToCubic(p0,cp,p1))
	return segs
}

/**
 * implements a cardinal spline using hermite interpolation. Provides an interface to insert attitional points
 * into the curve without changing the shape of the curve.  
 */

export class Hermite implements IInterpolator {
  
    constructor(private isVertical:boolean) {}
    
    private _segs:ControlPoints[] 
    private _tangents:Points
    private _tension = 0.7
    
    /**
     * translates the list of cubic segments into a path string. Does not use the SVG S command that simplyfies the drawing 
     * of consecutive (cubic) segments. It is not clear what kind of performance impact this has in the various browsers. 
     */
     // TODO: investigate performance impact of using only C command (as opposed to S command) and ajust algorithm if there is an
     // perfomance improvement
     
    public path():string {
        var path:string
        path = `${this._segs[0][0][0]},${this._segs[0][0][1]}`
        path += this._segs.map(function(s) { return `C${s[1][0]},${s[1][1]},${s[2][0]},${s[2][1]},${s[3][0]},${s[3][1]}` })
        return path
    }
	
	public getPathPoints():any {
		var p = this._segs.map(function(s):Point { return s[0]})
		p.push(this._segs[this._segs.length - 1][3])
		return p
	}
    
    /**
     * computes the tangents from the data points and creates the list of segment required to interpolate the curve. 
     */
    public data(points:Points) {
      this._tangents = lineCardinalTangents(points, this._tension),
      this._segs = segments(points, this._tangents)
      //console.log('segments:',this._segs)
    }
    
    // inserts a new point at x into the curve without changing the shape of the curve. 
    
    private splitSegAt(segIdx, at:number, begin?:boolean, end?:boolean) {
      var split = bezier.splitSegment(this._segs[segIdx], at)
	  if (begin) {
		  split[0][0][2] = true
	  } else if (end) {
		  split[1][3][2] = true
	  } else {
		  split[1][0][2] = true
	  }
	  
      this._segs.splice(segIdx ,1, split[0], split[1])

    }
    	
    public insertAtPoint(val:number) {
    	// find the segment that contains the insert point
      var i = 0,
          seg, 
          split;
      var k = this.isVertical ? 1 : 0
    	// find the segment that contains the insert point
      var i = -1,
          seg, 
          lastSeg = this._segs[this._segs.length - 1],
          firstSeg = this._segs[0]

      if (firstSeg[0][k] > lastSeg[3][k]) {
        if (val < lastSeg[3][k]) {
          this.splitSegAt(this._segs.length - 1, 1, false, true) 
        } else if (val >= firstSeg[0][k]) {
           this.splitSegAt(0,0, true, false)
        } else {
          while (++i < this._segs.length) {
            seg = this._segs[i]
            if (seg[0][k] > val && val >= seg[3][k]) break 
          }
          // point is inside segs[i]
          //console.log ('inverse', i,val,seg)
          var roots = bezier.intersect(val, seg.map(function(p) { return p[k] }))  
          if (roots.length > 1 && roots[0] !== roots[1]) {
            throw `Error: computeIntersection: x=${val} has more than one root ${roots} with line. ` + seg
          }
          //console.log('roots', roots)
          this.splitSegAt(i,roots[0])
        }
      } else {
        if (val <= firstSeg[0][k]) {
          this.splitSegAt(0,0, true, false)
        } else if (val > lastSeg[3][k]) {
          this.splitSegAt(this._segs.length - 1, 1, false, true)  
        } else {
          while (++i < this._segs.length) {
            seg = this._segs[i]
            if (seg[0][k] < val && val <= seg[3][k]) break 
          }
          // point is inside segs[i]
          //console.log ('normal', i,val,seg)
          var roots = bezier.intersect(val, seg.map(function(p) { return p[k] }))  
          if (roots.length > 1 && roots[0] !== roots[1]) {
            throw `Error: computeIntersection: x=${val} has more than one root ${roots} with line. ` + seg
          }
          //console.log('roots', roots)
          this.splitSegAt(i,roots[0])
        }
      }
    }
    
    public insertAtPointReverse(key:number) {
		this.insertAtPoint(key)
	} 
    
    public insertAtIdx(i:number) {
      //console.log ('indexAt:',i,nbr, this._segs.length, this._segs)
      	var j = -1, split, pos, at
		if (i < 0) {
			this.splitSegAt(0, 0, true)
      	} else if (i >= this._segs.length - 1) {
			this.splitSegAt(this._segs.length - 1, 1, false, true)
      	} else { 
		  	this.splitSegAt(i, 0.5)
      	}
    }
    
    public insertAtIdxReverse(i:number) {
      //console.log ('reverse:',i,nbr, this._segs.length, this._segs)
      	var j = -1, split, pos, at
    	if (i < 0) {
			this.splitSegAt(this._segs.length - 1, 1, false, true)
      	} else if (i >= this._segs.length - 1) {
			this.splitSegAt(0, 0, true, false)
      	} else {
		  	this.splitSegAt(this._segs.length - i - 1, 0.5)
      	}
    }
}