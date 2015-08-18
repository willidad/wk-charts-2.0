import { Point, Points, IInterpolator} from './interpolator'
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
 * to allow a single case for the intersection and bsplit algorithms. This is certainly not performace optimized
 */
 //TODO: Revist math for intersect and bsplit to elegantly deal with quadratic and cubic segments

function segments(points:Point[], tangents:Point[]):ControlPoints[] {
  var p0:Point = points[0], 
      p1:Point = points[1],
      cp:Point,
      cp0:Point,
      cp1:Point,
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
  
    constructor(private isVertical:boolean) {
      
    }
    
    private _segs:ControlPoints[] 
    private _tangents:Points
    private _tension = 0.7
    
    /**
     * translates the list of cubic segments into a path string. Does not use the SVG S command that simplyfies the drawing 
     * of consecutive (cubic) segments. It is not clear what kind of performance impact this has in the various browsers. 
     */
     // TODO: investigate performance impact of using only C command (as opposed to S command) and ajust algorithm if there is an
     // perfomance improvement
     
    public path(tension:number = 0.7):string {
        var path:string
        path = `${this._segs[0][0].join()}C`
        path += this._segs.map(function(s) { return [s[1], s[2], s[3]].join()}).join('C')
        return path
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
    
    private splitSegAt(segIdx, at:number) {
      var split = bezier.splitSegment(this._segs[segIdx], at)
      this._segs.splice(segIdx ,1, split[0], split[1])
      //console.log ('split', this._segs[segIdx], split[0], split[1])
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
          this.splitSegAt(this._segs.length - 1, 1) 
        } else if (val >= firstSeg[0][k]) {
           this.splitSegAt(0,0)
        } else {
          while (++i < this._segs.length) {
            seg = this._segs[i]
            if (seg[0][k] > val && val >= seg[3][k]) break 
          }
          // point is inside segs[i]
          console.log ('inverse', i,val,seg)
          var roots = bezier.intersect(val, seg.map(function(p) { return p[k] }))  
          if (roots.length > 1 && roots[0] !== roots[1]) {
            throw `Error: computeIntersection: x=${val} has more than one root ${roots} with line. ` + seg
          }
          console.log('roots', roots)
          this.splitSegAt(i,roots[0])
        }
      } else {
        if (val <= firstSeg[0][k]) {
          this.splitSegAt(0,0)
        } else if (val > lastSeg[3][k]) {
          this.splitSegAt(this._segs.length - 1, 1)  
        } else {
          while (++i < this._segs.length) {
            seg = this._segs[i]
            if (seg[0][k] < val && val <= seg[3][k]) break 
          }
          // point is inside segs[i]
          console.log ('normal', i,val,seg)
          var roots = bezier.intersect(val, seg.map(function(p) { return p[k] }))  
          if (roots.length > 1 && roots[0] !== roots[1]) {
            throw `Error: computeIntersection: x=${val} has more than one root ${roots} with line. ` + seg
          }
          console.log('roots', roots)
          this.splitSegAt(i,roots[0])
        }
      }
    }
    
    public insertAtPointReverse = this.insertAtPoint
    /*
    public insertAtPointReverse(val:number) {
    	// find the segment that contains the insert point
      var i = this._segs.length,
          seg, 
          lastSeg = this._segs[0],
          firstSeg = this._segs[this._segs.length - 1]
      var k = this.isVertical ? 1 : 0
      
      if (val <= firstSeg[3][k]) {
        this.splitSegAt(this._segs.length - 1,1)
      } else if (val > lastSeg[0][k]) {
        this.splitSegAt(0, 0)  
      } else {
        while (--i >= 0) {
          seg = this._segs[i]
          if (seg[3][k] < val && val <= seg[0][k]) break 
        }
        // point is inside segs[i]
        var roots = bezier.intersect(val, seg.map(function(p) { return p[k] })) 
        if (roots.length > 1 && roots[0] !== roots[1]) {
          throw `Error: computeIntersection: val=${val} has more than one root ${roots} with line. ` + seg
        }
        this.splitSegAt(i,roots[0])
      }
    }*/
    
    /**
     * inserts 'nbr' data points at the position specific by the data point at index I. Data points are inserted 
     * after the data point. To insert at the beginning of the curve (i.e. befor data point 0) specify -1 as the number. 
     */
    
    public insertAtIdx(i:number) {
      //console.log ('indexAt:',i,nbr, this._segs.length, this._segs)
      var j = -1, split, pos, at
    	if (i < 0) {
        pos = 0
        at = 0
      } else if (i >= this._segs.length - 1) {
        pos = this._segs.length - 1
        at = 1 
      } else { 
        pos = i
        at = 0.5
      }
      this.splitSegAt(pos, at)
    }
    
    public insertAtIdxReverse(i:number) {
      //console.log ('reverse:',i,nbr, this._segs.length, this._segs)
      var j = -1, split, pos, at
    	if (i < 0) {
        pos = this._segs.length - 1
        at = 1
      } else if (i >= this._segs.length - 1) {
        pos = 0
        at = 0
      } else {
        pos = this._segs.length - i - 1
        at = 0.5
      }
      this.splitSegAt(pos, at)
    }
}