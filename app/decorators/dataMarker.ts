import { Style } from './../core/interfaces'
import { XYElement } from '.././baseLayouts/xyElement'
import { Scale } from './../core/scale'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as drawing from './../tools/drawing'
import {markers as markerDefaults} from './../core/defaults'

export class DataMarker extends XYElement {
	
	private _markerStyle:Style = {}
	
	set markerStyle(val:Style) { this._markerStyle = val; }
	get markerStyle():Style { return <Style>_.defaults(this._markerStyle, markerDefaults.markerStyle)}
	
	public targetContainer = 'wk-chart-marker-area'
	public needsPadding = true
	
	protected getSelector():string { 
		return '.wk-chart-data-marker' 
	}
	
	protected create(selection:d3.Selection<any>, caller:XYElement) {
		selection.append('circle').attr('class', 'wk-chart-data-marker')
			.attr('r', 5)
	}
	protected update(selection:d3.Selection<any>, caller:XYElement) {
		selection.style('fill', (d) =>caller.propertyColor())
	}
	protected remove(selection:d3.Selection<any>, caller:XYElement) {
		selection.remove()
	}
	
	protected beforeDraw = (container, data, drawingAreaSize?) => {
		this.offset = this.keyScale.isOrdinal ? this.keyScale.getRangeBand() / 2 : 0
	}
	
	
}