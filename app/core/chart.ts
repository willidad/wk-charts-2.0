
import { Style, IMargins } from './interfaces'
import { DomainCalc, Scale } from './scale'
import { Position , Axis } from './axis'
import { Layout}  from './../baseLayouts/layout'
import { XYElement } from './../baseLayouts/XYElement'
import { XYDataLabel } from './../decorators/dataLabels'
import { DataMarker } from './../decorators/dataMarker'
import { Columns } from './../layouts/column'
import { Pie } from './../layouts/pie'
import { Line } from './../layouts/line'
import { Area } from './../layouts/area'
import { Grid } from './grid'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as drawing from './../tools/drawing'
import { ResizeSensor} from './../tools/resizeSensor'

import {chart as chartDefaults, duration} from './defaults'

import './../tools/innerSVG'


export class Chart {
	
	private static _id:number = 0;
	
	private _container:HTMLElement
	private _d3Container;
	private _containerSize:ClientRect;
	private _layoutMargins:IMargins = {
		top:0,
		bottom:0,
		left:0,
		right:0
	};
	private _layoutPadding:IMargins = {
		top:0,
		bottom:0,
		left:0,
		right:0
	}
	
	private _drawingAreaSize = {
		width: 0,
		height: 0
	}
	
	private _dataLabelSpace = {
		top: 0,
		left: 0
	}
	
	private _ranges = {
		x: [0,1],
		y: [0,1]
	}
	
	private _newData:boolean = false;
	private _initialDraw:boolean = true;
	
	private _titleStyle = {};
	private _titleBgStyle = {};
	private _subTitleStyle = {};
	private _subTitleBgStyle = {}
	
	private _titleHeight:number = 0;
	private _subTitleHeight:number = 0;
	
	private scales: Scale[] = []
	private axis: Axis[] = []
	private layouts: Layout[] = []
	private grids: Grid[] = []
	
	private d3Sel = (selector:string) => {
		return this._d3Container.select(selector)
	}
	
	private measureTitles = () => {
		this._titleHeight = drawing.measureLabel(this.title, this.d3Sel('.wk-chart-title'), this.titleStyle, this.titleBgStyle).height
		this._subTitleHeight = drawing.measureLabel(this.subTitle, this.d3Sel('.wk-chart-subtitle'),this.subTitleStyle, this.subTitleBgStyle).height
		this._layoutMargins.top = this._titleHeight + this._subTitleHeight
	}
	
	private drawTitles = () => {
		var title = this.d3Sel('.wk-chart-title')
			.style({display: 'block', 'pointer-events': 'none'})
			.attr('transform', `translate(${this._containerSize.width/2},${this._titleHeight - chartDefaults.margins.top})`)
		title.select('text').style(this.titleStyle)
		title.select('rect').style(this.titleBgStyle).attr(title.select('text').node().getBBox())
		var subTitle = this.d3Sel('.wk-chart-subtitle')
			.style({display: 'block', 'pointer-events': 'none'})
			.attr('transform', `translate(${this._containerSize.width/2},${this._titleHeight + this._subTitleHeight - chartDefaults.margins.top})`)
		subTitle.select('text').style(this.subTitleStyle)
		subTitle.select('rect').style(this.subTitleBgStyle).attr(subTitle.select('text').node().getBBox())
	}
	
	private measureAxis = () => {
		for (var axis of this.axis) {
			this._layoutMargins[Position[axis.orientation]] += axis.getNeededSpace(this.d3Sel('.wk-chart-container'), this.data)
		}
	}
	
	private drawAxis = (animate:boolean) => {
		this.axis.forEach((axis) => {
			axis.draw(this.d3Sel('.wk-chart-container'), this.data, this._drawingAreaSize, this._ranges, animate)
		})
	}
	
	private drawGrids = (animate:boolean) => {
		this.grids.forEach((grid) => {
			grid.draw(this.d3Sel('.wk-chart-container'), this._ranges, animate)
		})
	}
	
	private sizeLayoutArea = () => {
		this._drawingAreaSize.height = this._containerSize.height - this._layoutMargins.top - this._layoutMargins.bottom
		this._drawingAreaSize.width = this._containerSize.width - this._layoutMargins.left - this._layoutMargins.right
	}
	
	private positionLayout = (animate:boolean) => {
		var cntr = this.d3Sel('.wk-chart-container')
		if (animate) {
			console.log('animated Position')
			cntr.transition().duration(duration).attr('transform', `translate(${this._layoutMargins.left}, ${this._layoutMargins.top})`)
			this._d3Container.selectAll('.wk-chart-bottom').transition().duration(duration).attr('transform', `translate(0,${this._drawingAreaSize.height})`)
			this._d3Container.selectAll('.wk-chart-right').transition().duration(duration).attr('transform', `translate(${this._drawingAreaSize.width})`)
		} else {
			cntr.attr('transform', `translate(${this._layoutMargins.left}, ${this._layoutMargins.top})`)
			this._d3Container.selectAll('.wk-chart-bottom').attr('transform', `translate(0,${this._drawingAreaSize.height})`)
			this._d3Container.selectAll('.wk-chart-right').attr('transform', `translate(${this._drawingAreaSize.width})`)
		}
	}
	
	private prepeareData = () => {
		this.layouts.forEach((layout:Layout) => {
			layout.prepeareData(this.data)
		})
	}
	
	private setupLayouts = () => {	
		this.layouts.forEach((layout:Layout) => {
			layout.setupLayout()
		})
	}
	
	private drawAnimation = () => {	
		this.layouts.forEach((layout:Layout) => {
			layout.drawAnimation(this.d3Sel(`.${layout.targetContainer}`), this.data, this._drawingAreaSize)
		})
	}
	
	private drawStartLayouts = () => {	
		this.layouts.forEach((layout:Layout) => {
			layout.drawStart(this.d3Sel(`.${layout.targetContainer}`), this.data, this._drawingAreaSize)
		})
	}
	
	private drawEndLayouts = () => {
		this.layouts.forEach((layout:Layout) => {
			layout.drawEnd(this.d3Sel(`.${layout.targetContainer}`), this.data, this._drawingAreaSize)
		})
	}
	
	private updateDomains = () => {	
		this.layouts.forEach((layout:Layout) => {
			layout.updateDomains(this.data)
		})
	}
	
	private getLayoutPadding = () => {
		this._layoutPadding = {top:0, bottom:0, left:0, right:0}
		for (var layout of this.layouts) {
			if (layout.needsPadding) {
				var padding = layout.getPadding(this.d3Sel(`.${layout.targetContainer}`),this.data, this._drawingAreaSize)
				this._layoutPadding.top = Math.max(padding.top, this._layoutPadding.top)
				this._layoutPadding.bottom = Math.max(padding.bottom, this._layoutPadding.bottom)
				this._layoutPadding.left = Math.max(padding.left, this._layoutPadding.left)
				this._layoutPadding.right = Math.max(padding.right, this._layoutPadding.right)
			}
		}
	}
	
	private sizeRange = () => {
		this._ranges.x = [this._layoutPadding.left, this._drawingAreaSize.width - this._layoutPadding.right]
		this._ranges.y = [this._drawingAreaSize.height-this._layoutPadding.bottom, this._layoutPadding.top]
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
				<g class="wk-chart-title">
					<rect />
					<text style="text-anchor:middle;"></text>
				</g>
				<g class="wk-chart-subtitle">
					<rect />
					<text style="text-anchor:middle;"></text>
				</g>
				<g class="wk-chart-container">
					<g class="wk-chart-layout-area" />
					<g class="wk-chart-marker-area" />
					<g class="wk-chart-label-area" />
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
	get titleStyle() { return _.defaults(this._titleStyle, chartDefaults.titleStyle) }
	
	set subTitleStyle(val) { this._subTitleStyle = val };
	get subTitleStyle() { return _.defaults(this._subTitleStyle, chartDefaults.subTitleStyle) }
	
	set titleBgStyle(val) { this._titleBgStyle = val };
	get titleBgStyle() { return _.defaults(this._titleBgStyle, chartDefaults.titleBgStyle) }
	
	set subTitleBgStyle(val) { this._subTitleBgStyle = val };
	get subTitleBgStyle() { return _.defaults(this._subTitleBgStyle, chartDefaults.subTitleBgStyle) }
	
	public addScale = (type:string, properties:string[], domainCalc?:DomainCalc):Scale => {
		var s = new Scale(type, properties, domainCalc)
		this.scales.push(s)
		return s
	}
	
	public addAxis = (orientation:Position, scale:Scale, title?:string):Axis => {
		var a = new Axis(orientation, scale, title)
		this.axis.push(a)
		return a
	}
	
	public addGrid = (axis:Axis):Grid => {
		var g = new Grid(axis)
		this.grids.push(g)
		return g
	}
	
	public addDataLabels = (layout:Columns | Pie):Layout => {
		if (layout instanceof Columns) {
			var l = this.addLayout(new XYDataLabel(layout.valueScale, layout.valueProperty, layout.keyScale, layout.keyProperty, layout.colorScale, layout.isVertical))
			l.labelOffset = layout.padding
			return l
		} else if (layout instanceof Pie) {
			layout.dataLabels = true
			return layout
		}
	}
	public addDataMarkers = (layout:Line | Area):Layout => {
		var l = this.addLayout(new DataMarker(layout.valueScale, layout.valueProperty, layout.keyScale, layout.keyProperty, layout.colorScale, layout.isVertical))
		return l
	}
	
	public addLayout = <T extends Layout>(l:T):T => { //Todo : implement a factory function as soon as ...rest operator is available
		this.layouts.push(l)
		return l
	}
 

	public data: any;
	
	public draw = (data?:any) => {
		if (data) {
			this.data = data;
			this._newData = true
		} else {
			this._newData = false
		}
		
		console.log("draw called")
		
		// diff key data to prepeare animation
		
		this.setupLayouts()
		this.prepeareData()
		
		if (this._newData && !this._initialDraw) {
			this.drawStartLayouts()
		}
		
		this._containerSize = this._d3Container.select('.wk-chart-svg').node().getBoundingClientRect(); // get the outer bounds of teh drawing area
		this._layoutMargins = <IMargins>_.assign(this._layoutMargins, chartDefaults.margins)
		this.measureTitles(); // create the title elements and reserver space for them. Titles are not removed after measuring
		this.measureAxis()
		this.sizeLayoutArea() //measure space requirements for axis and compute layout size
		//this.positionLayout(false) // finally position the layout container
		

		// draw container content
		
		this.drawTitles()
		this.updateDomains()
		//this.getLayoutPadding() // if needed draw the layout and measure if it fits into the drawing area
		this.sizeRange() //add padding to the range values
		if (this._initialDraw || !this._newData) {
			console.log('initial draw')
			this.positionLayout(false) // finally position the layout container
			this.getLayoutPadding() // if needed draw the layout and measure if it fits into the drawing area
			this.sizeRange() //add padding to the range values
			this.drawAxis(false)
			this.drawGrids(false)
			this.drawEndLayouts()
		} else {
			this.positionLayout(true) // finally position the layout container
			this.getLayoutPadding() // if needed draw the layout and measure if it fits into the drawing area
			this.sizeRange() //add padding to the range values
			this.drawAxis(true)
			this.positionLayout(true)
			this.drawGrids(true)
			this.drawAnimation() 
			console.log('animated draw')
		}
		
		this._initialDraw = false

	}
}