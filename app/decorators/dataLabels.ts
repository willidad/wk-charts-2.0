import { Style } from './../core/interfaces'
import { XYElement } from '.././baseLayouts/xyElement'
import { Scale } from './../core/scale'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as drawing from './../tools/drawing'
import {dataLabels as labelDefaults} from './../core/defaults'

export class XYDataLabel extends XYElement {
	
	private _labelStyle:Style = {}
	private _labelBgStyle:Style = {}
	
	set labelStyle(val:Style) { this._labelStyle = val; }
	get labelStyle():Style { return <Style>_.defaults(this._labelStyle, labelDefaults.labelStyle)}
	
	set labelBgStyle(val:Style) { this._labelBgStyle = val; }
	get labelBgStyle() { return <Style>_.defaults(this._labelBgStyle, labelDefaults.labelBgStyle)}
	
	public labelRotation:number = 0;
		
	public targetContainer = 'wk-chart-label-area'
	public needsPadding = true
	
	protected getSelector():string { 
		return '.wk-chart-label-marker' 
	}
	
	protected fadeInOut:boolean = true;
	
	private updateItem = (item:d3.Selection<any>, d) => {
		if (this.isVertical) {
			var text = item.select('g text')
				.text(d.value)
				.style('text-anchor', d.value < 0 ? 'end' : 'start')
				.attr('dy', '0.35em')
				.style(this.labelStyle)
			item.select('g rect').style(this.labelBgStyle).attr(text.node().getBBox())
			item.select('g').attr('transform', `translate(${(d.value > 0 ? 1 : -1) * labelDefaults.labelPadding},0) rotate(${this.labelRotation})`)
		} else {
			var text = item.select('g text')
				.text(d.value)
				.style('text-anchor', 'middle')
				.attr('dy', d.value < 0 ? '0.71em' : null)
				.style(this.labelStyle)
			item.select('g rect').style(this.labelBgStyle)
				.attr(text.node().getBBox())
			item.select('g').attr('transform', `translate(0,${(d.value > 0 ? -1 : 1) * labelDefaults.labelPadding}) rotate(${this.labelRotation})`)
		}
	}
	
	protected create(selection:d3.Selection<any>, caller:XYDataLabel) {
		var lg = selection.append('g').attr('class', 'wk-chart-label-marker').append('g')
		lg.append('rect')
		lg.append('text')
	}
	protected update(selection:d3.Selection<any>, caller:XYDataLabel) {
		selection.each(function (d) {
			caller.updateItem(d3.select(this), d)
		})
	}
	protected remove(selection:d3.Selection<any>, caller:XYElement) {
		selection.remove()
	}
	
	public beforeDraw = (container, data, drawingAreaSize?) => {
		this.offset = this.keyScale.isOrdinal ? this.keyScale.getRangeBand() / 2 : 0
	}
	
	
}