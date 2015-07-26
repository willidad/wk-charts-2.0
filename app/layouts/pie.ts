import { Layout } from './../baseLayouts/layout'

import * as d3 from 'd3'
import * as _ from 'lodash'

import { Style } from './../core/interfaces'
import { pie as pieDefaults, duration} from './../core/defaults'

export class Pie extends Layout {
	
	private _pieStyle:Style = {};
	private _dataLabelStyle:Style = {};
	private _labelBgStyle:Style = {};
	protected radius:number;
	protected innerRadius:number = 0
	
	public dataLabels:boolean = false;
	
	set pieStyle(val:Style) { this._pieStyle = val; }
	get pieStyle():Style { return <Style>_.defaults(this._pieStyle, pieDefaults.pieStyle)}
	
	set labelStyle(val:Style) { this._dataLabelStyle = val; }
	get labelStyle():Style { return <Style>_.defaults(this._dataLabelStyle, pieDefaults.labelStyle)}
	
	set labelBgStyle(val:Style) { this._labelBgStyle = val; }
	get labelBgStyle():Style { return <Style>_.defaults(this._labelBgStyle, pieDefaults.labelBgStyle)}
	
	public drawLayout = (container, data, drawingAreaSize, animate?) => {
		this.radius = Math.min(drawingAreaSize.width, drawingAreaSize.height) / 2 * (this.dataLabels ? 0.85 : 1)
		var arc = d3.svg.arc().outerRadius(this.radius).innerRadius(this.innerRadius)
		var labelArc = d3.svg.arc().outerRadius(this.radius * 1.1).innerRadius(this.radius * 1.1)
		var pie = d3.layout.pie()
			.value((d:any) => d.added || d.deleted ? 0 : Math.abs(d.value))
			.sort(null)
		
		function arcTween(a) {
		  	var i = d3.interpolate(this._current, a);
		  	this._current = i(0);
		  	return function(t) {
		    	return arc(i(t));
		  };
		}
		
		function labelTween(l) {
			var i = d3.interpolate(this._current, l);
		  	this._current = i(0);
		  	return function(t) {
		    	return `translate(${labelArc.centroid(i(t))})`;
		  };
		}
		
		function textPosTween (txt) {
			var i = d3.interpolate(this._current, txt)
			return function (t) {
				var d = i(t)
				return (d.startAngle + d.endAngle) / 2 < Math.PI ? 'start' : 'end'
			}
		}
		
		var segments = pie(data)
		var path = container.selectAll('path')
			.data(segments, (d) => d.data.key) 
		
		path.enter()
			.append('path').each(function(d) { this._current = d; })
			
		if (animate) {
			path.transition().duration(duration).attrTween('d', arcTween)
		} else {
			path.attr('d', arc)
		}
		
		path
			.attr('fill', (d) => this.mapColor(d.data.key))
			.style(this.pieStyle)
		
		path.exit().remove()
		
		if (this.dataLabels) {
			var labels = container.selectAll('.wk-chart-data-label')
				.data(segments, (d) => d.data.key)
			var le = labels.enter().append('g').attr('class', 'wk-chart-data-label')
				.style('opacity', 0)
				.each(function(d) { this._current = d; })
			le.append('rect').style(this.labelBgStyle)
			le.append('text').style(this.labelStyle)
			var text = labels.select('text').each(function(d) { this._current = d; })
			
			if (animate) {
				labels.transition().duration(duration)
					.attrTween('transform', labelTween)
					.style('opacity', (d) => d.data.added || d.data.deleted ? 0 : 1)				
			} else {
				labels.attr('transform', (d) => `translate(${labelArc.centroid(d)})`)
					.style('opacity', (d) => d.data.added || d.data.deleted ? 0 : 1)
			}
			
			labels.each(function(d) {
				var text = d3.select(this).select('text')
					.text(d.data.value)
					.attr('dy', '0.35')
					.style('text-anchor', 'middle')
				var bg = d3.select(this).select('rect')
					.style('fill', 'none')
					.attr(text.node().getBBox())	
			})
			labels.exit().remove()	
				
		}
		
		container.attr('transform', `translate(${drawingAreaSize.width / 2}, ${drawingAreaSize.height / 2})`)
	}
	
}