

import {Scale} from './scale'
import {Position , Axis} from './axis'
import {Layout} from './layout'
import {Grid} from './grid'
import {Markers} from './markers'
import {DataLabels} from './dataLabels'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as drawing from './../tools/drawing'

import {chart as defaults} from './defaults'

import './../tools/innerSVG'
import './../tools/resizeSensor'


export class Chart {
	
	private static _id:number = 0;
	
	private _container:HTMLElement
	private _d3Container;
	private _containerSize:ClientRect;
	private _layoutSize:ClientRect;
	
	private _titleStyle = {};
	private _titleBgStyle = {};
	private _subTitleStyle = {};
	private _subTitleBgStyle = {}
	
	private _titleHeight:number = 0;
	private _subTitleHeight:number = 0;
	
	private d3Sel = (selector:string) => {
		return this._d3Container.select(selector)
	}
	
	private measureTitles = () => {
		this._titleHeight = drawing.measureLabel(this.title, this.d3Sel('.wk-chart-title'), this.titleStyle, this.titleBgStyle).height
		this._subTitleHeight = drawing.measureLabel(this.subTitle, this.d3Sel('.wk-chart-subtitle'),this.subTitleStyle, this.subTitleBgStyle).height
	}
	
	private drawTitles = () => {
		var title = this.d3Sel('.wk-chart-title')
			.style({display: 'block', 'pointer-events': 'none'})
			.attr('transform', `translate(${this._containerSize.width/2},${this._titleHeight - defaults.margins.top})`)
		title.select('text').style(this.titleStyle)
		title.select('rect').style(this.titleBgStyle).attr(title.select('text').node().getBBox())
		var subTitle = this.d3Sel('.wk-chart-subtitle')
			.style({display: 'block', 'pointer-events': 'none'})
			.attr('transform', `translate(${this._containerSize.width/2},${this._titleHeight + this._subTitleHeight - defaults.margins.top})`)
		subTitle.select('text').style(this.subTitleStyle)
		subTitle.select('rect').style(this.subTitleBgStyle).attr(subTitle.select('text').node().getBBox())
	}
	
	private measureAxis = ():ClientRect[] => {
		var sizes = []
		this.axis.forEach((axis) => {
			axis.scale.setDomain(this.data)
			axis.scale.setRange([0,-100])
			sizes[axis.orientation] = axis.sizeAxis(this.d3Sel('.wk-chart-container'))
		})
		return sizes
	}
	
	private drawAxis = () => {
		this.axis.forEach((axis) => {
			axis.scale.setDomain(this.data)
			axis.scale.setRange(axis.isVertical ? [this._layoutSize.height, 0] :[0,this._layoutSize.width])
			axis.draw(this.d3Sel('.wk-chart-container'), this._layoutSize)
		})
	}
	
	private drawGrids = () => {
		this.grid.forEach((grid) => {
			grid.draw(this.d3Sel('.wk-chart-container'), this._layoutSize)
		})
	}
	
	private sizeLayoutArea = (axisSizes:ClientRect[]):ClientRect => {
		var size = {top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0}
		size.left = defaults.margins.left + (axisSizes[Position.left] ? axisSizes[Position.left].width : 0)
		size.top = defaults.margins.top + this._titleHeight + this._subTitleHeight + (axisSizes[Position.top] ? axisSizes[Position.top].height : 0)
		size.right = defaults.margins.right + (axisSizes[Position.right] ? axisSizes[Position.right].width : 0)
		size.bottom = defaults.margins.bottom + (axisSizes[Position.bottom] ? axisSizes[Position.bottom].height : 0)
		size.height = this._containerSize.height - size.bottom - size.top
		size.width = this._containerSize.width - size.left - size.right
		return size
	}
	
	private positionLayout = () => {
		var cntr = this.d3Sel('.wk-chart-container')
		cntr.attr('transform', `translate(${this._layoutSize.left}, ${this._layoutSize.top})`)
		this._d3Container.select('.wk-chart-bottom').attr('transform', `translate(0,${this._layoutSize.height})`)
		this._d3Container.select('.wk-chart-right').attr('transform', `translate(${this._layoutSize.width})`)
	}
	
	private drawLayouts = () => {
		this.layout.forEach((layout:Layout) => {
			layout.draw(this.d3Sel('.wk-chart-layout-area'), this.data)
		})
	}
	
	
	constructor(drawInto:HTMLElement, public title?:string, public subTitle?:string) {	
		Chart._id += 1;
		this._container = drawInto;
		this._d3Container = d3.select(this._container)
		this._container.innerHTML = `
		<div class="wk-chart">
			<svg class="wk-chart-svg" style="width:100%; height:100%">
				<defs>
					<clipPath class="wk-chart-clip-${Chart._id}">
						<rect />
					</clipPath>
					<mask class="wk-chart-clip-mask-${Chart._id}">
						<rect class="wk-chart-brush wk-chart-brush-rect1" style="fill:rgba(255,255,255,0.5)"></rect>
						<rect class="wk-chart-brush wk-chart-brush-extent" style="fill:#ffffff"></rect>
						<rect class="wk-chart-brush wk-chart-brush-rect2" style="fill:rgba(255,255,255,0.5)"></rect>
					</mask>
				</defs>
				<g class="wk-chart-title" style="display:none">
					<rect />
					<text style="text-anchor:middle;"></text>
				</g>
				<g class="wk-chart-subtitle" style="display:none">
					<rect />
					<text style="text-anchor:middle;"></text>
				</g>
				<g class="wk-chart-container">
					<g class="wk-chart-grid-area" />
					<g class="wk-chart-layout-area" />
					<g class="wk-chart-label-marker-area" />
					<g class="wk-chart-interaction-area">
						<rect class="wk-chart-interaction-layer" style="opacity:0;pointer-events:all;"/>
					</g>
				</g>
			</svg>
		</div>`
		
		// attach resize handler to container
		
		new ResizeSensor(this._container.querySelector(".wk-chart"), this.draw)
	}
	
	
	set titleStyle(val) { this._titleStyle = val };
	get titleStyle() { return _.defaults(this._titleStyle, defaults.titleStyle) }
	
	set subTitleStyle(val) { this._subTitleStyle = val };
	get subTitleStyle() { return _.defaults(this._subTitleStyle, defaults.subTitleStyle) }
	
	set titleBgStyle(val) { this._titleBgStyle = val };
	get titleBgStyle() { return _.defaults(this._titleBgStyle, defaults.titleBgStyle) }
	
	set subTitleBgStyle(val) { this._subTitleBgStyle = val };
	get subTitleBgStyle() { return _.defaults(this._subTitleBgStyle, defaults.subTitleBgStyle) }

	public axis: Axis[] = []
	public layout: Layout[] = []
	public grid: Grid[] = []
	public data: any;
	
	public draw = (data?:any) => {
		if (data) {
			this.data = data;
		}
		console.log("draw called")
		this._containerSize = this._d3Container.select('.wk-chart-svg').node().getBoundingClientRect();
		this.measureTitles();
		this._layoutSize = this.sizeLayoutArea(this.measureAxis())
		this.positionLayout()
		this.drawTitles()
		this.drawAxis()
		this.drawGrids()
		this.drawLayouts()
		
		

	}
}