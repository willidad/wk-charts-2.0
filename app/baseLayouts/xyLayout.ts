import { Style } from './../core//interfaces'
import { Scale } from './../core/scale'
import * as d3 from 'd3'
import * as _ from 'lodash'
import { Layout } from './layout'
import * as drawing from './../tools/drawing'
import {markers as markerDefaults} from './../core/defaults'

export class XYLayout extends Layout {
	
	
	
	constructor(public valueScale:Scale, public valueProperty:string, public keyScale, public keyProperty:string, public colorScale?:Scale, public isVertical:boolean = false) {
		super(valueScale, valueProperty, keyScale, keyProperty, colorScale)
	}
	
	public markers:boolean = false
	public dataLabels:boolean = false
	
	private _markerStyle:Style = {}
	
	set markerStyle(val:Style) { this._markerStyle = val; }
	get markerStyle():Style { return <Style>_.defaults(this._markerStyle, markerDefaults.markerStyle)}
	
	public getDataLabelSpace = (container, data, areaSize):number => {
		this.valueScale.setDomain(data)
		this.valueScale.setRange(this.isVertical ? [0, areaSize.width] : [areaSize.height, 0])
		var neededSpace = 0
		//label.draw(container.select('.wk-chart-label-area'), data)

		// measure the size of the label container
		var labelBox = container.select('.wk-chart-label-area').node().getBBox()
		// determine the additional space requirements
		if (this.isVertical) {
			neededSpace = Math.max(0, labelBox.width + labelBox.x - areaSize.width)
		} else {
			neededSpace = Math.max(0, labelBox.height + labelBox.y - areaSize.height)
		}
		return neededSpace
	}
		
	protected afterDraw = (container, data) => {
		if (this.markers) {
			var offset = this.keyScale.isOrdinal ? this.keyScale.getRangeBand() / 2 : 0
			var markers = container.selectAll(`circle.wk-chart-marker`).data(data, this.key)
			var enter = markers.enter().append('circle')
				.attr('class',`wk-chart-marker`)
				.attr('r', markerDefaults.markerSize)
			
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
	
}