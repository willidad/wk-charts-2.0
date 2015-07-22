import {Scale} from './scale'
import {Position, Axis} from './axis'
import {grid as defaults, duration} from './defaults'
import * as d3 from 'd3'
import * as _ from 'lodash'

export class Grid {
	
	private _axis:Axis;
	private _lineStyle = {};
	
	constructor(axis:Axis) {
		this._axis = axis
	}
	
	set lineStyle(val) { this._lineStyle = val; }
	get lineStyle() { return _.defaults(this._lineStyle, defaults.lineStyle)}
	
	public draw = (container, ranges, animate) => {
		var ticks = this._axis.ticks;
		var offset = this._axis.scale.getRangeBand() / 2
		var gridContainer = container.select('.wk-chart-grid-area')
		var gridLines = gridContainer.selectAll(`.wk-chart-grid-${Position[this._axis.orientation]}`).data(ticks, function(d:number, i:number) { return i })
		gridLines.enter().append('line')
			.attr('class', `wk-chart-grid-${Position[this._axis.orientation]}`)
			.style(this.lineStyle).style('pointer-events', 'none')
			.transition().duration(duration).style('opacity', 0)
		if (this._axis.isVertical) {
			gridLines.transition().duration(duration).attr('x1', ranges.x[0]).attr('x2', ranges.x[1]).attr('transform', (d) => { return `translate(0, ${this._axis.scale.map(d) + offset})` })
				.style('opacity', this.lineStyle['opacity'] || 1)
		} else {
			gridLines.transition().duration(duration).attr('y1', ranges.y[0]).attr('y2', ranges.y[1]).attr('transform', (d) => { return `translate(${this._axis.scale.map(d) + offset})` })
				.style('opacity', this.lineStyle['opacity'] || 1)
		}
		gridLines.exit()
			.transition().duration(duration)
			.style('opacity', 0)
			.remove()
	}
}