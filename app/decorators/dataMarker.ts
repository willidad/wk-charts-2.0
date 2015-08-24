import { Point, Points, D3Selection} from './../core/interfaces'
import { markers } from './../core/defaults'


export class DataMarker {
	
	private _markers
	private _container 
	
	public container(outer:D3Selection) {
		this._container = outer.select('.wk-chart-marker-area')
	} 
	
	public draw(data:Points, color:String, transition:boolean, duration:number) {
		this._markers = this._container.selectAll('.wk-chart-markers').data(data, function(d,i) { return i })
		this._markers.enter().append('circle').attr('class', 'wk-chart-markers')
		var m = transition ? this._markers.transition().duration(duration).each('end', function(d) { if (d[2]) d3.select(this).remove()}) : this._markers
		m
			.attr('cx', function(d:Point) { return d[0] })
			.attr('cy', function(d:Point) { return d[1] })
			.attr('r', markers.markerSize)
			.style('fill', color)
			.style(markers.markerStyle)
			.style('opacity', function(d:Point) { return d[2] ? 0 : markers.markerStyle['opacity'] || 1})
			
		this._markers.exit().remove()
	}
}