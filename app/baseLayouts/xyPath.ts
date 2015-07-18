import { Scale } from './../core/scale'
import { Layout } from './../baseLayouts/layout'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as drawing from './../tools/drawing'
import { line as defaults } from './../core/defaults'

export class XYPath extends Layout {
	
	protected pathGen;
	protected path;
	protected offset:number = 0
	protected colorProp:string = 'stroke'
	
	constructor(public valueScale:Scale, public valueProperty:string, public keyScale:Scale, public keyProperty:string, public colorScale?:Scale, public isVertical:boolean = false, public spline:boolean = false) {
		super(valueScale,valueProperty,keyScale,keyProperty, colorScale)
	}

	public drawLayout = (container, data) => {
		this.offset = this.keyScale.isOrdinal ? this.keyScale.getRangeBand() / 2 : 0
		
		if (!this.path) {
			this.path = container.append('path')
		}
		this.path.datum(data, this.key)
			.attr('d', this.pathGen)
		if (this.colorScale) {
			this.path.style(this.colorProp, this.propertyColor())
		}
	}
}