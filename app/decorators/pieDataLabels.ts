import { Layout } from './../baseLayouts/layout'

import * as d3 from 'd3'
import * as _ from 'lodash'
import { Style } from './../core/interfaces'
import { pie as pieDefaults, duration} from './../core/defaults'

export class PieDataLabels extends Layout {
	
	private _pieStyle:Style = {};
	
	protected innerRadius:number = 0
	
	set pieStyle(val:Style) { this._pieStyle = val; }
	get pieStyle():Style { return <Style>_.defaults(this._pieStyle, pieDefaults.pieStyle)}
	
	public drawLayout = (container, data, drawingAreaSize, animate?) => {
		var	radius = Math.min(drawingAreaSize.width, drawingAreaSize.height) / 2
		var arc = d3.svg.arc().outerRadius(radius).innerRadius(this.innerRadius)
		var pie = d3.layout.pie()
			.value((d) => d.added || d.deleted ? 0 : Math.abs(d.value))
			.sort(null)
		
		function arcTween(a) {
		  	var i = d3.interpolate(this._current, a);
		  	this._current = i(0);
		  	return function(t) {
		    	return arc(i(t));
		  };
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
		
		container.attr('transform', `translate(${drawingAreaSize.width / 2}, ${drawingAreaSize.height / 2})`)
	}
	
}