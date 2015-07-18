import { Scale } from './../core/scale'
import { XYPath } from './../baseLayouts/xyPath'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as drawing from './../tools/drawing'
import { line as defaults } from './../core/defaults'

export class Line extends XYPath {
	
	private _lineStyle = {}

	constructor(public valueScale:Scale, public valueProperty:string, public keyScale:Scale, public keyProperty:string, public colorScale?:Scale, public isVertical:boolean = false, public spline:boolean = false) {
		super(valueScale,valueProperty,keyScale,keyProperty, colorScale, isVertical)
	
		this.pathGen = d3.svg.line()
		
		if (this.isVertical) {
        	this.pathGen
          		.y((d) => this.keyFn(d) + this.offset)
          		.x((d) => this.valFn(d))
		} else {      
	        this.pathGen
          		.x((d) => this.keyFn(d) + this.offset)
          		.y((d) => this.valFn(d))
		}
	
		if (this.spline) {
			this.pathGen.interpolate('cardinal')
		}
	}
	
	set lineStyle(val) { this._lineStyle = val; }
	get lineStyle() { return _.defaults(this._lineStyle, defaults.lineStyle)}
	
	protected afterDraw = (container, data, drawingAreaSize) => {
		this.path.style(this.lineStyle).style('fill','none')
	}		
}