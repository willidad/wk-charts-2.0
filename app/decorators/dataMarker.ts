import * as _ from 'lodash'
import { Point, Points, D3Selection, Style} from './../core/interfaces'
import { markers as defaults } from './../core/defaults'


export class DataMarker {
	
	private _markers
	private _container 
	private _markerStyle
	
	constructor(markerStyle?:Style) {
		this.markerStyle = markerStyle || {}
	}
	
	set markerStyle(val:Style) { this._markerStyle = val; }
	get markerStyle():Style { return <Style>_.defaults(this._markerStyle, defaults.markerStyle)}
	
	public draw(container, data:Points, color:String, transition:boolean, duration:number) {
		this._markers = container.selectAll('.wk-chart-markers').data(data, function(d,i) { return i })
		this._markers.enter().append('circle').attr('class', 'wk-chart-markers')
		var m = transition ? this._markers.transition().duration(duration).each('end', function(d) { if (d[2]) d3.select(this).remove()}) : this._markers
		m
			.attr('cx', function(d:Point) { return d[0] })
			.attr('cy', function(d:Point) { return d[1] })
			.attr('r', defaults.markerSize)
			.style('fill', color)
			.style(this.markerStyle)
			.style('opacity', (d:Point) => { return d[2] ? 0 : this.markerStyle['opacity'] || 1})
			
		this._markers.exit().remove()
	}
}