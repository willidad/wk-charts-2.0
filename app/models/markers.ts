import {Layout} from './layout'
import {Scale} from './scale'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as drawing from './../tools/drawing'
import {markers as defaults} from './defaults'

export class Marker extends Layout {
	
	private _markerStyle = {}

	
	constructor(public valueScale:Scale, public valueProperty:string, public keyScale:Scale, public keyProperty:string, public colorScale?:Scale, public isVertical:boolean = false) {
	super(valueScale, valueProperty, keyScale, keyProperty, colorScale)

	}
	
	set markerStyle(val) { this._markerStyle = val; }
	get markerStyle() { return _.defaults(this._markerStyle, defaults.markerStyle)}
      
	public drawLayout = (container, data) => {
		var offset = this.keyScale.isOrdinal ? this.keyScale.getRangeBand() / 2 : 0
		var markers = container.selectAll(`circle.wk-chart-marker`).data(data, this.key)
		var enter = markers.enter().append('circle')
			.attr('class',`wk-chart-marker`)
			.attr('r', defaults.markerSize)
		
		if (this.isVertical) {
			markers
				.attr('cy', (d) => this.keyFn(d) + offset )
				.attr('cx', (d) => this.valFn(d))
		} else {
			markers
				.attr('cx', (d) => this.keyFn(d) + offset )
				.attr('cy', (d) => this.valFn(d))
		}
	
		if (this.colorScale) {
			markers.style('fill', this.propertyColor())
		}
	    
	    markers.style(this.markerStyle)
	    
	    markers.exit().remove()	
	}
}