import { Scale } from './../core/scale'
import { XYPath } from './../baseLayouts/xyPath'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as drawing from './../tools/drawing'
import { area as defaults } from './../core/defaults'

export class Area extends XYPath {
	
	private _areaStyle = {}
	
	constructor(public valueScale:Scale, public valueProperty:string, public keyScale:Scale, public keyProperty:string, public colorScale?:Scale, public isVertical:boolean = false, public spline:boolean = false) {
		super(valueScale,valueProperty,keyScale,keyProperty, colorScale, isVertical)
		
		this.pathGen = d3.svg.area()
		this.colorProp = 'fill'
		
		if (this.isVertical) {
        	this.pathGen
          		.y((d) => this.keyFn(d) + this.offset)
			  	.x0((d) => this.valFnZero())
          		.x1((d) => this.valFn(d))
		} else {      
	        this.pathGen
          		.x((d) => this.keyFn(d) + this.offset)
			  	.y0((d) => this.valFnZero())
          		.y1((d) => this.valFn(d))
		}
	
		if (this.spline) {
			this.pathGen.interpolate('cardinal')
		}
	}
	
	set areaStyle(val) { this._areaStyle = val; }
	get areaStyle() { return _.defaults(this._areaStyle, defaults.areaStyle)}
	
	protected afterDraw = (container, data, drawingAreaSize) => {
		this.path.style(this.areaStyle)
	}
}