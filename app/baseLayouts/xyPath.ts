
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

	public drawLayout = (container:d3.Selection<any>, data, drawingAreaSize, animate:boolean) => {
		this.offset = this.keyScale.isOrdinal ? this.keyScale.getRangeBand() / 2 : 0
		
		if (!this.path) {
			this.path = container.append('path')
		}
		
		if (animate) {
			this.path.datum(data).transition().duration(this._duration)
				.attr('d', this.pathGen)
		} else {
			this.path.datum(data)
				.attr('d', this.pathGen)
		}
		if (this.colorScale) {
			this.path.style(this.colorProp, this.propertyColor())
		}
	}
}