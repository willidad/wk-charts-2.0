import { Style } from './interfaces'
import { Scale } from './scale'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as drawing from './../tools/drawing'
import { chart as chartDefaults, axis as axisDefaults, duration } from './defaults'

export enum Position {
		top, bottom, left, right
	}

export class Axis {
	
	private _scale:Scale;
	private _orient:Position
	private _d3Axis = d3.svg.axis()
	
	private _requiredSpace:number
	private _titleHeight:number
	
	private _titleStyle:Style = {}
	private _titleBgStyle:Style = {}
	private _tickLabelStyle:Style = {}
	private _tickLabelBgStyle:Style = {}
	private _tickLineStyle:Style = {}
	
	private getRotation = (degree:number):string => {
		return [`rotate(${-degree}, 0, -10)`,`rotate(${degree}, 0, 10)`,`rotate(${degree}, -10, 0)`,`rotate(${degree}, 10, 0)`][this._orient]
	};
	
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
	
	set titleStyle(val:Style) { this._titleStyle = val };
	get titleStyle():Style { return <Style>_.defaults(this._titleStyle, axisDefaults.titleStyle) }
	
	set titleBgStyle(val:Style) { this._titleBgStyle = val };
	get titleBgStyle():Style { return <Style>_.defaults(this._titleBgStyle, axisDefaults.titleBgStyle) }
	
	set tickLabelStyle(val:Style) { this._tickLabelStyle = val };
	get tickLabelStyle():Style { return <Style>_.defaults(this._tickLabelStyle, axisDefaults.tickLabelStyle) }
	
	set tickLabelBgStyle(val:Style) { this._tickLabelBgStyle = val };
	get tickLabelBgStyle():Style { return <Style>_.defaults(this._tickLabelBgStyle, axisDefaults.tickLabelBgStyle) }
	
	set tickLineStyle(val:Style) { this._tickLineStyle = val };
	get tickLineStyle():Style { return <Style>_.defaults(this._tickLineStyle, axisDefaults.tickLineStyle) }
	
	get scale()  {
		return this._scale
	}
	
	get orientation() { 
		return this._orient 
	}
	
	get ticks() {
		return this._d3Axis.tickValues() ? this._d3Axis.tickValues() : this._scale.getTicks()
	}
	
	get isVertical():boolean {
		return this._orient == Position.left || this._orient === Position.right
	}
	
	public getNeededSpace = (ctnr, data):number => {
		this._d3Axis.scale(this._scale.getD3Scale()).orient(Position[this._orient]);
		this._scale.setDomain(data);
		this._scale.setRange([0, 100]); // set arbitrary value
		
		var drawTo = d3.select(`.wk-chart-axis.wk-chart-${Position[this._orient]}`);
		if (drawTo.empty()) {
			drawTo = ctnr.insert('g', '.wk-chart-layout-area').attr('class',`wk-chart-axis wk-chart-${Position[this._orient]}`)
		}
		var measuredDrawTo = drawTo.append('g');
		measuredDrawTo.call(this._d3Axis);
		// rotate Tick Labels
		var ticks = measuredDrawTo.selectAll('.tick > text')
			.attr('transform', this.getRotation(this.tickRotation))
			.style('text-anchor', this.getAnchor(this._orient, this.tickRotation))
			.attr('dy', this.getDY(this._orient, this.tickRotation));
		
		this._requiredSpace = this.isVertical ? measuredDrawTo.node().getBBox().width : measuredDrawTo.node().getBBox().height;
		this._requiredSpace += this._titleHeight = this.title ? drawing.measureLabel(this.title, measuredDrawTo, this.titleStyle, this.titleBgStyle).height : 0;
		
		measuredDrawTo.remove();
		
		return this._requiredSpace
	};
	
	public draw = (ctnr, data, drawingAreaSize, ranges, animate:boolean) => {
		// setup scale
		var d3Scale = this._scale.getD3Scale()
		this._d3Axis.scale(d3Scale).orient(Position[this._orient])
		this._scale.setDomain(data)
		this._scale.setRange(this.isVertical ? ranges.y : ranges.x)		
		var drawTo = d3.select(`.wk-chart-axis.wk-chart-${Position[this._orient]}`)
		if (drawTo.empty()) {
			drawTo = ctnr.insert('g', '.wk-chart-layout-area').attr('class',`wk-chart-axis wk-chart-${Position[this._orient]}`)
		}
		
		if (animate) {
			drawTo.transition().duration(duration)
				.call(this._d3Axis)
				.attr('transform', `translate(${this._orient === Position.right ? drawingAreaSize.width : 0}, ${this._orient === Position.bottom ? drawingAreaSize.height : 0})`)
		} else {
			drawTo
				.call(this._d3Axis)
				.attr('transform', `translate(${this._orient === Position.right ? drawingAreaSize.width : 0}, ${this._orient === Position.bottom ? drawingAreaSize.height : 0})`)
		}
		
		// rotate labels if required

		drawTo.selectAll('.tick > text')
			.attr('transform', this.getRotation(this.tickRotation))
			.style('text-anchor', this.getAnchor(this._orient, this.tickRotation))
			.attr('dy', this.getDY(this._orient, this.tickRotation))
			
		// draw tick background
		// need local variables to deal with different 'this' context in d3.each below
		var rotate = this.getRotation(this.tickRotation)
		var bgStyle:any = this.tickLabelBgStyle // need local variables to deal with different 'this' context in d3.each below
		
		drawTo.selectAll('g.tick').each(function() {
			var bgRect = d3.select(this).select('rect')
			if (bgRect.empty()) {
				bgRect = d3.select(this).insert('rect', ':first-child')
			}
			bgRect
				.attr('transform', rotate).style(bgStyle)
			bgRect
				.attr(d3.select(this).select('text').node().getBBox())
		})
		
		// set line style
		drawTo.selectAll('path, line').style(this.tickLineStyle)
		
		// position Title	
		if (this.title) {
			var labelG = drawTo.select('g.wk-chart-axis-title')
			if (labelG.empty()) labelG = drawTo.append('g').attr('class', `wk-chart-axis-title`)
			var lRect = labelG.select('rect')
			if (lRect.empty()) lRect = labelG.append('rect')
			var lText = labelG.select('text')
			if (lText.empty()) lText = labelG.append('text')

			lText.text(this.title).style(this.titleStyle).style('text-anchor','middle')
			switch (this._orient) {
				case Position.left: 
				case Position.right:
				case Position.top: lText.attr('dy', '0.71em'); break
				case Position.bottom: lText.attr('dy', null);
			}
			lRect.attr(lText.node().getBBox())
			lRect.style(this.titleBgStyle)
			
			var l:any = animate ? labelG.transition().duration(duration) : labelG
			switch (this._orient) {
				case Position.left: l.attr('transform', `translate(${-this._requiredSpace}, ${drawingAreaSize.height / 2}) rotate(-90)`) ;break
				case Position.right: l.attr('transform', `translate(${this._requiredSpace}, ${drawingAreaSize.height / 2}) rotate(90)`) ;break
				case Position.top: l.attr('transform', `translate(${drawingAreaSize.width / 2}, ${-this._requiredSpace})`) ;break
				case Position.bottom: l.attr('transform', `translate(${drawingAreaSize.width / 2}, ${this._requiredSpace})`) ;break
			}
		}
	}
	
}