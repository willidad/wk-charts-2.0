import {Scale} from './scale'
import {Position, Axis} from './axis'
import {grid as defaults} from './defaults'
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
	
	public draw = (container, gridAreaSize:ClientRect) => {
		var ticks = this._axis.ticks;
		var offset = this._axis.scale.getRangeBand() / 2
		var gridContainer = container.select('.wk-chart-grid-area')
		var gridLines = gridContainer.selectAll(`.wk-chart-grid-${Position[this._axis.orientation]}`).data(ticks, function(d:number) { return d })
		gridLines.enter().append('line').attr('class', `wk-chart-grid-${Position[this._axis.orientation]}`).style(this.lineStyle).style('pointer-events', 'none')
		if (this._axis.isVertical) {
			gridLines.attr('x1', 0).attr('x2', gridAreaSize.width).attr('transform', (d) => { return `translate(0, ${this._axis.scale.map(d) + offset})` })
		} else {
			gridLines.attr('y1', 0).attr('y2', gridAreaSize.height).attr('transform', (d) => { return `translate(${this._axis.scale.map(d) + offset})` })
		}
	}
}