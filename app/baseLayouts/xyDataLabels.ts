import { Style } from './../core/interfaces'
import { XYLayout } from './xyLayout'
import { Scale } from './../core/scale'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as drawing from './../tools/drawing'
import {dataLabels as labelDefaults} from './../core/defaults'

export class XYDataLabels extends XYLayout {
	
	private _labelStyle:Style = {}
	private _labelBgStyle:Style = {}
	
	private offset:number;
	
	set labelStyle(val:Style) { this._labelStyle = val; }
	get labelStyle():Style { return <Style>_.defaults(this._labelStyle, labelDefaults.labelStyle)}
	
	set labelBgStyle(val:Style) { this._labelBgStyle = val; }
	get labelBgStyle() { return <Style>_.defaults(this._labelBgStyle, labelDefaults.labelBgStyle)}
	
	public labelRotation:number = 0;
	
	private drawLabels = (elem:Element, d) => {
		var label = d3.select(elem)
		if (this.isVertical) {
			label.select('text')
				.text((d) => this.val(d))
				.style('text-anchor', 'start')
				.attr('dy', '0.35em')
				.style(this.labelStyle)
				.attr('transform', (d) => `translate(${(this.val(d) >= 0 ? this.valFn(d) : this.valFnZero()) + labelDefaults.labelPadding}, ${this.keyFn(d) + this.offset}) rotate(${this.labelRotation})`)
			
		} else {
			label.select('text')
				.text((d) => this.val(d))
				.style('text-anchor', (d) => 'middle')
				.style(this.labelStyle)
				.attr('transform', (d) => `translate(${this.keyFn(d) + this.offset}, ${(this.val(d) >= 0 ? this.valFn(d) : this.valFnZero()) - labelDefaults.labelPadding}) rotate(${this.labelRotation})`)
		}
	}
	
	public drawLayout = (container, data) => {
		
		var drawLabels = (elem, d) => {
			var label = d3.select(elem)
			if (this.isVertical) {
				label.select('text')
					.text(this.val(d))
					.style('text-anchor', 'start')
					.attr('dy', '0.35em')
					.style(this.labelStyle)
				label.select('rect').style(this.labelBgStyle).attr(elem.getBBox())
				label.attr('transform', (d) => `translate(${(this.val(d) >= 0 ? this.valFn(d) : this.valFnZero()) + labelDefaults.labelPadding}, ${this.keyFn(d) + this.offset}) rotate(${this.labelRotation})`)
			} else {
				label.select('text')
					.text(this.val(d))
					.style('text-anchor', (d) => 'middle')
					.style(this.labelStyle)
				label.select('rect').style(this.labelBgStyle).attr(elem.getBBox())
				label.attr('transform', (d) => `translate(${this.keyFn(d) + this.offset}, ${(this.val(d) >= 0 ? this.valFn(d) : this.valFnZero()) - labelDefaults.labelPadding}) rotate(${this.labelRotation})`)
			}
		}
		
		this.offset = this.keyScale.isOrdinal ? this.keyScale.getRangeBand() / 2 : 0
		
		var labels = container.selectAll(`g.wk-chart-data-label`).data(data, (d) => this.key(d))
		var enter = labels.enter().append('g').attr('class', 'wk-chart-data-label')
		enter.append('rect')
		enter.append('text')
		
		labels.each(function(d) { drawLabels(this,d) }) // wrap the 'this' context prvided by each to preserve the module context
			
		labels.exit().remove()
	}
	
}