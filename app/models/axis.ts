import {Scale} from './scale'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as drawing from './../tools/drawing'
import {chart as chartDefaults ,axis as defaults} from './defaults'

export enum Position {
		top, bottom, left, right
	}

export class Axis {
	
	private _scale:Scale;
	private _orient:Position
	private _d3Axis = d3.svg.axis()
	
	private _axisSize:ClientRect
	private _titleSize:ClientRect
	
	private _titleStyle = {}
	private _titleBgStyle = {}
	private _tickLabelStyle = {}
	private _tickLabelBgStyle = {}
	private _tickLineStyle = {}
	
	private getRotation = (degree:number):string => {
		return [`rotate(${-degree}, 0, -10)`,`rotate(${degree}, 0, 10)`,`rotate(${degree}, -10, 0)`,`rotate(${degree}, 10, 0)`][this._orient]
	}
	
	private getAnchor = (orient:Position, rotation:number):string => {
		if (rotation === 0) return ['middle', 'middle', 'end', 'start'] [orient]
		if (rotation > 0 && rotation < 90) return ['start', 'start', 'end', 'start'] [orient]
		if (rotation === 90) return ['start', 'start', 'middle', 'middle'] [orient]
		if (rotation > 90 && rotation < 180) return ['start', 'start', 'start', 'end'] [orient]
		if (rotation === 180) return ['middle', 'middle', 'start', 'end'] [orient]
		if (rotation > -90) return ['end', 'end', 'end', 'start'] [orient]
		if (rotation === -90) return ['end', 'end', 'middle', 'middle'] [orient]
		if (rotation < 90 && rotation > -180) return ['end', 'end', 'start', 'end'] [orient]
		if (rotation === -180) return ['middle', 'middle', 'start', 'end'] [orient]
	}
	
	private getDY = (orient:Position, rotation:number):string => {
		if (rotation === 0) return [null, '0.71em', '0.35em', '0.35em'] [orient]
		if (Math.abs(rotation) === 180) return ['0.71em', null, '0.35em', '0.35em'] [orient]
		if (rotation === 90) return ['0.35em', '0.35em', '0.71em', null] [orient]
		if (rotation === -90) return ['0.35em', '0.35em', null, '0.71em'] [orient]
		return '0.35em'
	}
		
	constructor(orientation:Position, scale:Scale, public title?:string) {
		this._scale = scale
		this._orient = orientation
	}
	
	public tickRotation:number = 0;
	
	set titleStyle(val) { this._titleStyle = val };
	get titleStyle() { return _.defaults(this._titleStyle, defaults.titleStyle) }
	
	set titleBgStyle(val) { this._titleBgStyle = val };
	get titleBgStyle() { return _.defaults(this._titleBgStyle, defaults.titleBgStyle) }
	
	set tickLabelStyle(val) { this._tickLabelStyle = val };
	get tickLabelStyle() { return _.defaults(this._tickLabelStyle, defaults.tickLabelStyle) }
	
	set tickLabelBgStyle(val) { this._tickLabelBgStyle = val };
	get tickLabelBgStyle() { return _.defaults(this._tickLabelBgStyle, defaults.tickLabelBgStyle) }
	
	set tickLineStyle(val) { this._tickLineStyle = val };
	get tickLineStyle() { return _.defaults(this._tickLineStyle, defaults.tickLineStyle) }
	
	get scale()  {
		return this._scale
	}
	
	get orientation() {
		return this._orient
	}
	
	get ticks() {
		return this._scale.getTicks()
	}
	
	get isVertical():boolean {
		return this._orient == Position.left || this._orient === Position.right
	}
	
	public sizeAxis = (ctnr):ClientRect => {
		var d3Scale = this._scale.getD3Scale()
		this._d3Axis.scale(d3Scale).orient(Position[this._orient])
		var drawTo = d3.select(`.wk-chart-axis.wk-chart-${Position[this._orient]}`)
		if (drawTo.empty()) {
			drawTo = ctnr.insert('g', '.wk-chart-layout-area').attr('class',`wk-chart-axis wk-chart-${Position[this._orient]}`)
		}
		var measureDrawTo = drawTo.append('g')
		measureDrawTo.call(this._d3Axis)
		// rotate labels if required
		
		//if (this.tickRotation) {
			var ticks = measureDrawTo.selectAll('.tick > text')
				.attr('transform', this.getRotation(this.tickRotation))
				.style('text-anchor', this.getAnchor(this._orient, this.tickRotation))
				.attr('dy', this.getDY(this._orient, this.tickRotation))
		//}
		
		this._axisSize = measureDrawTo.node().getBBox()
		// size axis label
		if (this.title) {			
			this._titleSize = drawing.measureLabel(this.title,measureDrawTo,this.titleStyle, this.titleBgStyle)
			if (this.isVertical) {
				this._axisSize.width += this._titleSize.height
			} else {
				this._axisSize.height += this._titleSize.height
			}
		}
		measureDrawTo.remove()
		return this._axisSize
	}
	
	public draw = (ctnr, ctnrSize) => {
		var d3Scale = this._scale.getD3Scale()
		this._d3Axis.scale(d3Scale).orient(Position[this._orient])
		var drawTo = d3.select(`.wk-chart-axis.wk-chart-${Position[this._orient]}`)
		if (drawTo.empty()) {
			drawTo = ctnr.insert('g', '.wk-chart-layout-area').attr('class',`wk-chart-axis wk-chart-${Position[this._orient]}`)
		}
		drawTo.call(this._d3Axis)
		
		// rotate labels if required

		drawTo.selectAll('.tick > text')
			.attr('transform', this.getRotation(this.tickRotation))
			.style('text-anchor', this.getAnchor(this._orient, this.tickRotation))
			.attr('dy', this.getDY(this._orient, this.tickRotation))
			
		// draw tick background
		var rotate = this.getRotation(this.tickRotation)
		var bgStyle = this.tickLabelBgStyle
		
		drawTo.selectAll('g.tick').each(function() {
			var bgRect = d3.select(this).select('rect')
			if (bgRect.empty()) {
				bgRect = d3.select(this).insert('rect', ':first-child')
			}
			bgRect.attr(d3.select(this).select('text').node().getBBox()).style(this.tickLabelBgStyle).attr('transform', rotate).style(bgStyle)
		})
		
		// set line style
		drawTo.selectAll('path, line').style(this.tickLineStyle)
				
		if (this.title) {
			var labelG = drawTo.select('g.wk-chart-axis-title')
			if (labelG.empty()) {
				labelG = drawTo.append('g').attr('class', `wk-chart-axis-title`)
			}
			drawing.drawLabel(this.title, labelG, this.titleStyle, this.titleBgStyle)
			switch (this._orient) {
				case Position.left: labelG.attr('transform', `translate(${-this._axisSize.width + this._titleSize.height - chartDefaults.margins.left}, ${ctnrSize.height / 2 + this._titleSize.width / 2}) rotate(-90)`) ;break
				case Position.right: labelG.attr('transform', `translate(${this._axisSize.width - this._titleSize.height + chartDefaults.margins.left}, ${ctnrSize.height / 2 - this._titleSize.width / 2}) rotate(90)`) ;break
				case Position.top: labelG.attr('transform', `translate(${ctnrSize.width / 2 - this._titleSize.width / 2}, ${-this._axisSize.height + this._titleSize.height - chartDefaults.margins.top})`) ;break
				case Position.bottom: labelG.attr('transform', `translate(${ctnrSize.width / 2 - this._titleSize.width / 2}, ${this._axisSize.height})`) ;break
			}
		}
	}
	
}