
import { Style , XYPathLayout, AreaSize, Point } from './../core/interfaces'
import { Scale } from './../core/scale'
import { PathLayout } from './../baseLayouts/pathlayout'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as drawing from './../tools/drawing'
import { line as defaults } from './../core/defaults'

export class XYPath extends PathLayout {
	
	private pathGen; 
	
	public path:d3.Selection<any>;
	public offset:number = 0
	public colorProp:string = 'stroke'
	
	
	constructor(public valueScale:Scale, public valueProperty:string, public keyScale:Scale, public keyProperty:string, public colorScale?:Scale, public isVertical:boolean = false, public spline:boolean = false) {
		super(valueScale,valueProperty,keyScale,keyProperty, colorScale)
	}
	
	protected pathStyle:Style = {}
	
	private getPath = (container) => {
		var l = container.select(`.wk-layout-${this._id}`)
		if (l.empty()) {
			l = container.append('g').attr('class', `wk-layout-${this._id}` )
		}
		if (!this.path) {
			this.path = container.append('path')
		}
	}
	
	public drawStart = (container, data, drawingAreaSize) => {
		console.log ('drawStart')
		this.getPath(container)
		this.path.attr('d', this.startPath)
			.style(this.pathStyle)
		
		if (this.colorScale) {
			this.path.style(this.colorProp, this.propertyColor())
		}
	}
	
	public drawAnimation = (container, data, drawingAreaSize) => {
		console.log ('drawAnimation')
		this.getPath(container)
		
		this.path.transition().duration(this._duration).attr('d', this.endPath())
		
		if (this.colorScale) {
			this.path.style(this.colorProp, this.propertyColor())
		}		
	}
	
	public drawEnd = (container, data, drawingAreaSize) => {
		console.log ('drawEnd')
		this.getPath(container)
		
		this.path.attr('d', this.cleanPath)
			.style(this.pathStyle)
		
		if (this.colorScale) {
			this.path.style(this.colorProp, this.propertyColor())
		}
		
		this.afterDraw(container, data, drawingAreaSize)
		
	}
}