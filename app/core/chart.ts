
import { Style, IMargins } from './interfaces'
import { DomainCalc, Scale } from './scale'
import { Position , Axis } from './axis'
import { Layout}  from './layout'
import { DataMarker } from './../decorators/dataMarker'
import { Column } from './../layouts/column'
import { Pie } from './../layouts/pie'
import { Line } from './../layouts/line'
import { Area } from './../layouts/area'
import { Grid } from './grid'
import { Tooltip } from './../behavior/tooltip'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as drawing from './../tools/drawing'
import { ResizeSensor} from './../tools/resizeSensor'
import * as hlp from './../tools/helpers'

import {chart as chartDefaults, duration} from './defaults'

import './../tools/innerSVG'

export class Chart {
	
	private static _id:number = 0;
	
	private _id:number
	private _container:HTMLDivElement
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
	private _data: any[]
	private _oldData:any[]
	
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
			this._layoutMargins[Position[axis.orientation]] += axis.getNeededSpace(this.d3Sel('.wk-chart-container'), this._data)
		}
	}
	
	private drawAxis = (animate:boolean) => {
		this.axis.forEach((axis) => {
			axis.draw(this.d3Sel('.wk-chart-container'), this._data, this._drawingAreaSize, this._ranges, animate)
		})
	}
	
	private drawGrids = (animate:boolean) => {
		this.grids.forEach((grid) => {
			grid.draw(this.d3Sel('.wk-chart-container'), this._ranges, this._layoutPadding, animate)
		})
	}
	
	private sizeLayoutArea = () => {
		this._drawingAreaSize.height = this._containerSize.height - this._layoutMargins.top - this._layoutMargins.bottom
		this._drawingAreaSize.width = this._containerSize.width - this._layoutMargins.left - this._layoutMargins.right
	}
	
	private positionLayout = (animate:boolean) => {
		var cntr = this.d3Sel('.wk-chart-container')
		if (animate) {
			//console.log('animated Position')
			cntr.transition().duration(duration).attr('transform', `translate(${this._layoutMargins.left}, ${this._layoutMargins.top})`)
		} else {
			cntr.attr('transform', `translate(${this._layoutMargins.left}, ${this._layoutMargins.top})`)
		}
	}
	
	private prepeareData = () => {
		this.layouts.forEach((layout:Layout) => {
			layout.prepeareData(this._data)
		})
	}
	
	private setupLayouts = () => {	
		this.layouts.forEach((layout:Layout) => {
			layout.setupLayout(this._d3Container.select('.wk-chart-container'), this._drawingAreaSize)
		})
	}
	
	private drawEnd = (animate:boolean) => {	
		this.layouts.forEach((layout:Layout) => {
			layout.drawEnd(this._data,animate)
		})
	}
	
	private drawStartLayouts = () => {	
		this.layouts.forEach((layout:Layout) => {
			layout.drawStart(this._oldData)
		})
	}
	
	private updateDomains = () => {	
		this.layouts.forEach((layout:Layout) => {
			layout.updateDomains(this._data)
		})
	}
	
	private getLayoutPadding = () => {
		this._layoutPadding = {top:0, bottom:0, left:0, right:0}
		this.sizeRange()
		
		for (var layout of this.layouts) {
			if (layout.needsPadding) {
				var padding = layout.getPadding(this._d3Container.select('.wk-chart-container'), this._data, this._drawingAreaSize)
				this._layoutPadding = hlp.marginMax(this._layoutPadding, padding)
			}
		}
	}
	
	private sizeRange = () => {
		this._ranges.x = [this._layoutPadding.left, this._drawingAreaSize.width - this._layoutPadding.left - this._layoutPadding.right]
		this._ranges.y = [this._drawingAreaSize.height - this._layoutPadding.bottom, this._layoutPadding.top]
		// size the background and mask areas
		this._d3Container.select('.wk-chart-interaction-layer')
			.attr('x', this._layoutPadding.left)
			.attr('y', this._layoutPadding.top)
			.attr('width', Math.abs(this._ranges.x[0] - this._ranges.x[1]))
			.attr('height', Math.abs(this._ranges.y[0] - this._ranges.y[1]))
	}
	
	private sizeClip(animate:boolean) {
		var clip = this._d3Container.select(`defs #wk-chart-clip-${this._id} rect`);
		
		(animate ? clip.transition().duration(duration) : clip)
			.attr('width', this._drawingAreaSize.width)
			.attr('height', this._drawingAreaSize.height)
	}

	
	constructor(drawInto:d3.Selection<HTMLDivElement>, public title?:string, public subTitle?:string, public tooltip?:Tooltip) {	
		Chart._id += 1;
		this._id = Chart._id
		this._container = <HTMLDivElement>drawInto.node();
		this._d3Container = drawInto
		this._container.innerHTML = `
		<div class="wk-chart">
			<svg class="wk-chart-svg" style="width:100%; height:100%">
				<defs>
					<clipPath id="wk-chart-clip-${this._id}">
						<rect />
					</clipPath>
					<mask class="wk-chart-clip-mask-${this._id}">
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
					<g class="wk-chart-grid-area" />
					<g class="wk-chart-layout-area" clip-path="url(#wk-chart-clip-${this._id})"/>
					<g class="wk-chart-marker-area" />
					<g class="wk-chart-label-area" />
					<g class="wk-chart-interaction-area">
						<rect class="wk-chart-interaction-layer" style="opacity:0;pointer-events:none;"/>
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
	
	public addLayout = <T extends Layout>(l:T):T => { //Todo : implement a factory function as soon as ...rest operator is available
		this.layouts.push(l)
		return l
	}
	
	public draw = (data?:any) => {
		if (data && data.length > 0) {
			this._oldData = this._data
			this._data = _.cloneDeep(data);
			this._newData = true
		} else {
			this._newData = false
		}
		
		//register tooltip mouse handlers if tooltip object is provided
		
		if (this.tooltip) {
			this.tooltip.container = this._d3Container
			this.tooltip.data = this._data
			this.tooltip.disable()
		}
		
		var animate:boolean = !this._initialDraw && this._newData // animate only if there is a data change 
		this.setupLayouts() // inject data dependencies into layout objects
		this.prepeareData() // diff key data to prepeare animation
		
		if (animate) {
			//setup animation start elements
			for (var layout of this.layouts) {
				layout.drawStart(this._oldData)
			}
		}
		// resize and rescale based on new data
		this._containerSize = this._d3Container.select('.wk-chart-svg').node().getBoundingClientRect(); // get the outer bounds of the drawing area
		this._layoutMargins = <IMargins>_.assign(this._layoutMargins, chartDefaults.margins)
		this.measureTitles(); // create the title elements and reserver space for them. Titles are not removed after measuring
		this.measureAxis()
		this.sizeLayoutArea() //measure space requirements for axis and compute layout size
		this.drawTitles()
		this.updateDomains()
		this.positionLayout(animate) // finally position the layout container
		this.getLayoutPadding() // get padding needs from the layouts (e.g. for data labels or markers)
		this.sizeRange() //add padding to the range values
		this.sizeClip(animate)
		this.drawAxis(animate)
		this.drawGrids(animate)
		this.drawEnd(animate)
		
		if (this.tooltip) {
			this.tooltip.containerSize = this._drawingAreaSize
			this.tooltip.enable()
		}
		
		this._initialDraw = false

	}
}