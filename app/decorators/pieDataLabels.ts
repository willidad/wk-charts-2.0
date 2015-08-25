import { Layout } from './../core/layout'

import * as d3 from 'd3'
import * as _ from 'lodash'
import { Style } from './../core/interfaces'
import { pie as pieDefaults, duration} from './../core/defaults'

export class PieDataLabel {
	
	private _dataLabelStyle:Style = {};
	private _labelBgStyle:Style = {}

	constructor(labelStyle?:Style, bgStyle?:Style) {
		this.labelStyle = labelStyle || {}
		this.labelBgStyle = bgStyle || {}
	}
	
	set labelStyle(val:Style) { this._dataLabelStyle = val; }
	get labelStyle():Style { return <Style>_.defaults(this._dataLabelStyle, pieDefaults.labelStyle)}
	
	set labelBgStyle(val:Style) { this._labelBgStyle = val; }
	get labelBgStyle():Style { return <Style>_.defaults(this._labelBgStyle, pieDefaults.labelBgStyle)}
	
	public draw(container, segments, radius:number, transition:boolean, duration:number) {
				
		var labelArc = d3.svg.arc().outerRadius(radius * 1.1).innerRadius(radius * 1.1)
	
		function labelTween(l) {
			var i = d3.interpolate(this._current, l);
		  	this._current = i(0);
		  	return function(t) {
		    	return `translate(${labelArc.centroid(i(t))[0] - ((i(t).startAngle + i(t).endAngle) / 2 > Math.PI ? i(t).textWidth : 0)}, ${labelArc.centroid(i(t))[1]})`;
		  };
		}
		
		function removeDeleted(d) {
			if (d.data.remove) {
				d3.select(<any>this).remove()  //this gets called from d3 with its context ('this'). Type checker gets confused without forced type
			}
		}

		var labels = container.selectAll('.wk-chart-data-label')
			.data(segments, (d) => d.data.key)
		var le = labels.enter().append('g').attr('class', 'wk-chart-data-label')
			.style('opacity', 0)
			.each(function(d) { this._current = d; })
		le.append('rect').style(this.labelBgStyle)
		le.append('text').style(this.labelStyle)
		
		labels.each(function(d) {
			var text = d3.select(this).select('text')
				.text(d.data.value)
				.attr('dy', '0.35')
				.style('text-anchor', 'start')
			var textSize = text.node().getBBox();
			d.textWidth = textSize.width
			var bg = d3.select(this).select('rect')
				.style('fill', 'none')
				.attr(textSize)	
		})
		
		if (transition) {
			labels.transition().duration(duration)
				.attrTween('transform', labelTween)
				.style('opacity', (d) => d.data.remove ? 0 : 1)
				.each('end', removeDeleted)				
		} else {
			labels.attr('transform', (d) => `translate(${labelArc.centroid(d)[0] - ((d.startAngle + d.endAngle) / 2 > Math.PI ? d.textWidth : 0)}, ${labelArc.centroid(d)[1]})`)
				.style('opacity', (d) => d.data.insert || d.data.remove ? 0 : 1)
		}
		labels.exit().remove()	
	}
}