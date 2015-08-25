import { Points, D3Selection, Style, IMargins } from './../core/interfaces'
import { Scale } from './../core/scale'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as drawing from './../tools/drawing'
import {dataLabels as defaults} from './../core/defaults'

export class DataLabel {
	
	constructor(labelStyle?:Style, bgStyle?:Style, rotation?:number) {
		this.style = labelStyle || {}
		this.bgStyle = bgStyle || {}
		this.rotation = rotation || 0
		DataLabel.cnt += 1
		this._id = DataLabel.cnt
	}
	
	private static cnt:number = 0
	private _id:number
	private _style:Style
	private _bgStyle:Style
	private _container
	private _labels
	
	set style(val:Style) { this._style = val; }
	get style():Style { return <Style>_.defaults(this._style, defaults.labelStyle)}
	
	set bgStyle(val:Style) { this._bgStyle = val; }
	get bgStyle() { return <Style>_.defaults(this._bgStyle, defaults.labelBgStyle)}
	
	public rotation:number
	private _labelOffset:[number,number] = [0,0];
	
	public draw(container, data, transition:boolean, duration:number, isVertical:boolean) {
		this._labels = container.selectAll('.wk-charts-data-label').data(data, function(d, i) { return d.key })
		
		var lg = this._labels.enter().append('g').attr('class', 'wk-charts-data-label')
			.style('opacity', 0)
		lg.append('rect')
		lg.append('text')
		var textStyle = this.style
		var bgStyle = this.bgStyle
		var sel = transition ? this._labels.transition().duration(duration).each('end', function(d) { if (d.remove) d3.select(this).remove()}) : this._labels
		
		sel
			.attr('transform', (d) => { return `translate(${isVertical ? d.x + d.width + defaults.labelPadding : d.x + d.width/2}, ${isVertical ? d.y + d.height/2 : d.y - defaults.labelPadding}) rotate(${this.rotation})`})
			.style('opacity', function(d) { return d.remove || d.insert ? 0 : 1})
			.each(function (d) {
				var s = d3.select(this)
				var text = s.select('text')
					.text(function(d) { return d.value })
					.style(textStyle)
					.style('text-anchor', isVertical ? 'start' : 'middle')
					.attr('dy', isVertical ? '0.35em' : 0)
				s.select('rect').style(bgStyle).attr(text.node().getBBox())
			})
		this._labels.exit().remove()
	}
}