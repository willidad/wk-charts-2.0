import { Scale } from './../core/scale'
import { XYLayout } from './../baseLayouts/xyLayout'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as drawing from './../tools/drawing'
import { area as defaults } from './../core/defaults'

export class Area extends XYLayout {
	
	private line = d3.svg.area()
	private _areaStyle = {}
	private path;
	
	constructor(public valueScale:Scale, public valueProperty:string, public keyScale:Scale, public keyProperty:string, public colorScale?:Scale, public isVertical:boolean = false, public spline:boolean = false) {
		super(valueScale,valueProperty,keyScale,keyProperty, colorScale, isVertical)
	}
	
	set areaStyle(val) { this._areaStyle = val; }
	get areaStyle() { return _.defaults(this._areaStyle, defaults.areaStyle)}
	
	public drawLayout = (container, data) => {
		var offset = this.keyScale.isOrdinal ? this.keyScale.getRangeBand() / 2 : 0
		if (this.isVertical) {
        	this.line
          		.y1((d) => this.keyFn(d) + offset)
          		.x((d) => this.valFn(d))
		} else {      
	        this.line
          		.x((d) => this.keyFn(d) + offset)
          		.y1((d) => this.valFn(d))
		}
	
		if (this.spline) {
			this.line.interpolate('cardinal')
		}
		
		if (!this.path) {
			this.path = container.append('path')
		}
		
		this.path.datum(data, this.key)
			.attr('d', this.line)
		if (this.colorScale) {
			this.path.style('fill', this.propertyColor()).style('opacity',0.5)
		}
		this.path.style(this.areaStyle)
	}
}