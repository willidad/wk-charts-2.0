import { Style } from './interfaces'
import { Scale } from './scale'
import { Position, Axis } from './axis'
import { grid as defaults, duration } from './defaults'
import * as d3 from 'd3'
import * as _ from 'lodash'

export class Grid {
	
	private _axis:Axis;
	private _lineStyle = {};
	
	constructor(axis:Axis) {
		this._axis = axis
	}
	
	set lineStyle(val:Style) { this._lineStyle = val; }
	get lineStyle():Style { return <Style>_.defaults(this._lineStyle, defaults.lineStyle)}
	
	private addGridLine(ranges, padding) {
		var _self = this
		var orient = this._axis.orientation
		return function (d) {
			var tick = d3.select(this)
			var gridLine = tick.select('.wk-chart-gridline')
			if (gridLine.empty()) {
				gridLine = tick.append('line').attr('class', 'wk-chart-gridLine')
			}
			switch (orient) {
				case Position.left: gridLine.attr('x1', ranges.x[0]).attr('x2', ranges.x[1]); break
				case Position.right: gridLine.attr('x1', -ranges.x[0] - padding.right).attr('x2', -ranges.x[1] - padding.right); break
				case Position.top: gridLine.attr('y1', ranges.y[0]).attr('y2', ranges.y[1]); break
				case Position.bottom: gridLine.attr('y1', -ranges.y[0] - padding.bottom + padding.top).attr('y2', -ranges.y[1] - padding.bottom + padding.top); break
			}
			gridLine.style(_self.lineStyle)
		}
	}
	
	public draw = (container, ranges, padding, animate) => {
			
		var ticks = container.selectAll(`.wk-chart-axis.wk-chart-${Position[this._axis.orientation]} > .tick`)
		ticks.each(this.addGridLine(ranges, padding))
		
	}
}