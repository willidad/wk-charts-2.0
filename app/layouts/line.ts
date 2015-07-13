import {Scale} from './../models/scale'
import {Layout} from './../models/layout'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as drawing from './../tools/drawing'
import {line as defaults} from './../models/defaults'

export class Line extends Layout {
	
	private line = d3.svg.line()
	private _lineStyle = {}
	private path;
	
	constructor(public valueScale:Scale, public valueProperty:string, public keyScale:Scale, public keyProperty:string, public colorScale?:Scale, public isVertical:boolean = false, public spline:boolean = false) {
		super(valueScale,valueProperty,keyScale,keyProperty, colorScale)
	}
	
	set lineStyle(val) { this._lineStyle = val; }
	get lineStyle() { return _.defaults(this._lineStyle, defaults.lineStyle)}
	
	public drawLayout = (container, data) => {
		var offset = this.keyScale.isOrdinal ? this.keyScale.getRangeBand() / 2 : 0
		if (this.isVertical) {
        	this.line
          		.y((d) => this.keyFn(d) + offset)
          		.x((d) => this.valFn(d))
		} else {      
	        this.line
          		.x((d) => this.keyFn(d) + offset)
          		.y((d) => this.valFn(d))
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
			this.path.style('stroke', this.propertyColor())
		}
		this.path.style(this.lineStyle).style('fill','none')
		
	}
}