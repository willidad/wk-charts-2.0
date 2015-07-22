import { Layout } from './../baseLayouts/layout'

import * as d3 from 'd3'
import * as _ from 'lodash'

import { Style } from './../core/interfaces'
import { pie as pieDefaults} from './../core/defaults'

export class Pie extends Layout {
	
	private _pieStyle:Style = {};
	
	protected innerRadius:number = 0
	
	set pieStyle(val:Style) { this._pieStyle = val; }
	get pieStyle():Style { return <Style>_.defaults(this._pieStyle, pieDefaults.pieStyle)}
	
	
	public drawLayout = (container, data, drawingAreaSize) => {
		var	radius = Math.min(drawingAreaSize.width, drawingAreaSize.height) / 2
		var arc = d3.svg.arc().outerRadius(radius).innerRadius(this.innerRadius)
		var pie = d3.layout.pie()
			.value(this.valFn)
			.sort(null)
		
		var segments = pie(data)
		var path = container.selectAll('path')
			.data(segments, (d) => this.keyFn(d.data)) 
		
		path.enter()
			.append('path')
		
		path
			.attr('d', arc)
			.attr('fill', (d) => this.colorFn(d.data))
			.style(this.pieStyle)
		
		path.exit().remove()
		
		container.attr('transform', `translate(${drawingAreaSize.width / 2}, ${drawingAreaSize.height / 2})`)
	}
	
}