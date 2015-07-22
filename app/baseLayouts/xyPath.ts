
import { Style , XYPathLayout } from './../core/interfaces'
import { Scale } from './../core/scale'
import { Layout } from './../baseLayouts/layout'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as drawing from './../tools/drawing'
import { line as defaults } from './../core/defaults'

export class XYPath extends Layout implements XYPathLayout{
	
	private pathGen; 
	
	public path:d3.Selection<any>;
	public offset:number = 0
	public colorProp:string = 'stroke'
	public splineType:string = 'cardinal'
	public pathGenerator = ():any => {} //overRide
	
	constructor(public valueScale:Scale, public valueProperty:string, public keyScale:Scale, public keyProperty:string, public colorScale?:Scale, public isVertical:boolean = false, public spline:boolean = false) {
		super(valueScale,valueProperty,keyScale,keyProperty, colorScale)
		
	}
	
	public setupLayout() {
		
		this.pathGen = this.pathGenerator()
		
		if (this.spline) {
			this.pathGen.interpolate('cardinal')
		}
	}
	
	private  pathTween(d1, precision) {
		return function() {
			var path0 = this,
			path1 = path0.cloneNode(),
			n0 = path0.getTotalLength(),
			n1 = (path1.setAttribute("d", d1), path1).getTotalLength();
			
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
			return t < 1 ? "M" + points.map(function(p) { 
				return p(t); }).join("L") : d1;
			};
		};
	}

	public drawLayout = (container:d3.Selection<any>, data, drawingAreaSize, animate:boolean) => {
		this.offset = this.keyScale.isOrdinal ? this.keyScale.getRangeBand() / 2 : 0
		
		if (!this.path) {
			this.path = container.append('path')
		}
		
		if (animate) {
			this.path.datum(data).transition().duration(this._duration)
				.attr('d', this.pathGen)
				//.attrTween("d", this.pathTween(this.pathGen(data), 4))
		} else {
			this.path.datum(data)
				.attr('d', this.pathGen)
		}
		if (this.colorScale) {
			this.path.style(this.colorProp, this.propertyColor())
		}
	}
}