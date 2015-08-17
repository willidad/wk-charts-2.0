
import { Style , XYPathLayout, AreaSize, Point } from './../core/interfaces'
import { Scale } from './../core/scale'
import { PathLayout } from './../baseLayouts/pathlayout'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as drawing from './../tools/drawing'
import { line as defaults } from './../core/defaults'

export class XYPath extends PathLayout {
	
	protected path:d3.Selection<any>;
	protected offset:number = 0
	protected colorProp:string = 'stroke'
	
	
	constructor(
		public keyScale:Scale, 
		public keyProperty:string, 
		public valueScale:Scale, 
		public valueProperty:string, 
		public colorScale?:Scale, 
		public isVertical:boolean = false, 
		public spline:boolean = false) {
		super(keyScale,keyProperty, valueScale,valueProperty, colorScale)
	}
	
	protected pathStyle:Style = {}
	
	public drawStart = (data, drawingAreaSize) => {
		console.log ('drawStart')
		if (!this.path) this.path = this.layoutG.append('path')
		this.path.attr('d', this.startPath)
			.style(this.pathStyle)
		
		if (this.colorScale) {
			this.path.style(this.colorProp, this.propertyColor())
		}
	}
	
	public drawAnimation = (data, drawingAreaSize) => {
		console.log ('drawAnimation')
		if (!this.path) this.path = this.layoutG.append('path')
		this.path.transition().duration(this._duration).attr('d', this.endPath())
		
		if (this.colorScale) {
			this.path.style(this.colorProp, this.propertyColor())
		}		
	}
	
	public drawEnd = (data, drawingAreaSize) => {
		console.log ('drawEnd')
		if (!this.path) this.path = this.layoutG.append('path')
		this.path.attr('d', this.cleanPath)
			.style(this.pathStyle)
		
		if (this.colorScale) {
			this.path.style(this.colorProp, this.propertyColor())
		}
		
		this.afterDraw(data, drawingAreaSize)
		
	}
}