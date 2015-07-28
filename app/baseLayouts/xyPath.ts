
import { Style , XYPathLayout, Point } from './../core/interfaces'
import { Scale } from './../core/scale'
import { Layout } from './../baseLayouts/layout'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as drawing from './../tools/drawing'
import { line as defaults } from './../core/defaults'

export class XYPath extends Layout implements XYPathLayout {
	
	private pathGen; 
	
	public path:d3.Selection<any>;
	public offset:number = 0
	public colorProp:string = 'stroke'
	public splineType:string = 'cardinal'
	public pathGenerator = ():any => {} //overRide
	
	constructor(public valueScale:Scale, public valueProperty:string, public keyScale:Scale, public keyProperty:string, public colorScale?:Scale, public isVertical:boolean = false, public spline:boolean = false) {
		super(valueScale,valueProperty,keyScale,keyProperty, colorScale)
		
	}
	
	protected initialPred():any {
		var i = -1
		while(++i < this.diffSeq.length) {
			if (this.diffSeq[i][0] !== '+') {
				return this.diffSeq[i][1]
			}
		}
		return undefined
	}
	
	protected initialSucc():any {
		var i = this.diffSeq.length
		while(--i >= 0) {
			if (this.diffSeq[i][0] !== '-') {
				return this.diffSeq[i][1]
			}
		}
		return undefined
	}
	
	/*protected startPos = ():Point[] => {
		var range = this.keyScale.getRange()
		var interv = range.length > 1 ? Math.abs(range[1] - range[0]) : undefined //TODO something more meainingful
		var seq:Point[] = []
		var rangeIdx = 0
		var pred = this.initialPred()
		var i = -1
		while(++i < this.diffSeq.length) {
			var op = this.diffSeq[i][0]
			var key = this.diffSeq[i][1]
			if (op !== '+' ) pred = key
			seq.push({
				keyPos: this.mapKey(pred),
				key: key,
				valPos: this.mapVal(this._prevValues[pred]),
				value: this._prevValues[key] || this._values[key],
				added: op === '+'
			})
		}
		return seq
	}
	
	protected endPos = ():Point[] => {
		var range = this.keyScale.getRange()
		var interv = range.length > 1 ? Math.abs(range[1] - range[0]) : undefined //TODO something more meainingful
		var seq:Point[] = []
		var rangeIdx = 0
		var succ = this.initialSucc()
		var i = this.diffSeq.length
		while(--i >= 0) {
			var op = this.diffSeq[i][0]
			var key = this.diffSeq[i][1]
			if (op !== '-' ) succ = key
			seq.unshift({
				keyPos: this.mapKey(succ),
				key: key,
				valPos: this.mapVal(this._values[succ]),
				value: this._values[key] || this._prevValues[key],
				deleted: op === '-'
			})
		}
		return seq
	}*/
	
	protected startPos = this.cleanPos
	protected endPos = this.cleanPos
	
	public setupLayout() {
		
		this.pathGen = this.pathGenerator()
		
		if (this.spline) {
			this.pathGen.interpolate('cardinal')
		}
	}

	public drawLayout = (container:d3.Selection<any>, data, drawingAreaSize, animate:boolean) => {
		this.offset = this.keyScale.isOrdinal ? this.keyScale.getRangeBand() / 2 : 0
		
		var pathGen = this.pathGen
		
		function pathTween(d1, that):any {

		  //return function() {
		    var path0 = that,
		        path1 = path0.cloneNode(),
		        n0 = path0.getTotalLength(),
		        n1 = (path1.setAttribute("d", pathGen(d1)), path1).getTotalLength(),
				precision = 4;
		
		    // Uniform sampling of distance based on specified precision.
		    var distances = [0], i = 0, dt = precision / Math.max(n0, n1);
		    while ((i += dt) < 1) distances.push(i);
		    distances.push(1);
		
		    // Compute point-interpolators at each distance.
		    var points = distances.map(function(t) {
		      var p0 = path0.getPointAtLength(t * n0),
		          p1 = path1.getPointAtLength(t * n1);
		      return d3.interpolate([p0.x, p0.y], [p1.x, p1.y]);
		    });
	
		    return function(t) {
	      		return t <= 1 ? "M" + points.map(function(p) { 
				  return p(t); }).join("L") : d1;
		    	};
		  	//};
		}
		
		if (!this.path) {
			this.path = container.append('path')
		}
		
		if (animate) {
			this.path.datum(data).transition().duration(this._duration)
				.attrTween('d', function (d) { return pathTween(d, this)})
		} else {
			this.path.datum(data)
				.attr('d', this.pathGen)
		}
		if (this.colorScale) {
			this.path.style(this.colorProp, this.propertyColor())
		}
	}
}