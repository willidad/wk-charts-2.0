import { IMargins } from './interfaces'
import { Scale } from './../core/scale'
import { DataMarker } from './../decorators/dataMarker'
import { DataLabel } from './../decorators/dataLabels'
import { PieDataLabel } from './../decorators/pieDataLabels'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as drawing from './../tools/drawing'
import { Data } from './../core/data'
import { chart as chartDefaults ,axis as axisDefaults, duration} from './../core/defaults'
import * as hlp from './../tools/helpers'

export class Layout {
	
	constructor(
		public keyScale:Scale, 
		public keyProperty:string, 
		public valueScale:Scale, 
		public valueProperty:string, 
		public colorScale?:Scale, 
		public isVertical?:boolean) {
		Layout.cnt += 1;
		this._id = Layout.cnt;
		this.dataMgr = new Data(this.key)
	}
	
	private static cnt:number = 0
	protected _id:number
	protected _layoutG
	protected _drawingAreaSize:{width:number, height:number}
	protected _duration:number = duration
	protected dataMgr:Data 
	protected diffSeq:any[]
	protected _dataMarkers:DataMarker
	protected _dataLabels:DataLabel
	protected _pieDatalabels:PieDataLabel
	
	protected valFn = (val):number => {
		return this.valueScale.map(typeof val === 'object' ? val[this.valueProperty] : val)
	}
	
	protected valFnZero = ():number => {
		return this.valueScale.map(0)
	}
	
	protected mapVal = (val):number => {
		return this.valueScale.map(val)
	}
	
	protected val = (val):any => {
		return val[this.valueProperty]
	}
	
	protected keyFn = (val):number => {
		return this.keyScale.map(typeof val === 'object' ? val[this.keyProperty] : val)
	}
	
	protected mapKey = (val):number => {
		return this.keyScale.map(val)
	}
	
	protected mapKeyIdx = (idx:number) => {
		return this.keyScale.mapIdx(idx)
	}
	
	protected key = (val):any => {
		if (!val) debugger
		return val[this.keyProperty]
	}
	
	protected propertyColor = ():string => {
		if (this.colorScale) {
			return this.colorScale.map(this.valueProperty)
		} else {
			return null
		}
	}
	
	protected mapColor = (val):any => {
		return this.colorScale.map(val)
	}	
	
	protected colorFn = (val):any => {
		if (this.colorScale) {
			return this.colorScale.map(val[this.keyProperty])
		} else {
			return null
		}
	}

	public targetContainer = 'wk-chart-layout-area';
	public needsPadding:boolean = true
	public rowColor:string = undefined
	
	// override
	protected getBBox() {
		return undefined
	}
		
	public getPadding = (container, data, drawingAreaSize):IMargins => { 
		// draw the layout into a invisible container, measure its bouding box and retur the differences to the supplied drawing area size
		var padding = {top:0, bottom:0, left:0, right:0}
		
		this.keyScale.setRange(this.isVertical ? [drawingAreaSize.height, 0] : [0, drawingAreaSize.width])
		this.valueScale.setRange(this.isVertical ? [0, drawingAreaSize.width] : [drawingAreaSize.height, 0])
		this.keyOffset = this.keyScale.isOrdinal ? this.keyScale.getRangeBand() / 2 : 0
		this.data = data
		var box = this.getBBox()
		if (!box) {
			var sizer = container.append('g')
			this.draw(sizer,false)
			var box = sizer.node().getBBox()
			sizer.remove()
		}
		padding.left = box.x < 0 ? Math.abs(box.x) : 0
		padding.top = box.y < 0 ? Math.abs(box.y) : 0
		padding.bottom = box.y + box.height > drawingAreaSize.height ? Math.abs(drawingAreaSize.height - box.y - box.height) : 0
		padding.right = box.x + box.width > drawingAreaSize.width ? Math.abs(drawingAreaSize.width - box.x - box.width) : 0
		return padding
	}
	
	//-------------------------------------------------------------------------------
	
	public setupLayout(container, drawingAreaSize) {
		var layoutArea = container.select(`.${this.targetContainer}`)
		this._layoutG = layoutArea.select(`.wk-layout-${this._id}`)
		if (this._layoutG.empty()) {
			this._layoutG = layoutArea.append('g').attr('class', `wk-layout-${this._id}` )
		}
		this._drawingAreaSize = drawingAreaSize
	}
	
	public prepeareData(data:any[]) {
		this.dataMgr.data = data
	}
	
	public updateDomains = (data) => {
		this.keyScale.setDomain(data)
		this.valueScale.setDomain(data)
	}
	
	
	public drawStart = (data:any[]) => {
		this.keyOffset = this.keyScale.isOrdinal ? this.keyScale.getRangeBand() / 2 : 0
		this.data = data
		// extract added keys and key position from diff
		var ptIdx = -1
		var i = -1
		while (++i < this.dataMgr.diffSequence.length) {
			var op:string = this.dataMgr.diffSequence[i][0]
			var key:string = this.dataMgr.diffSequence[i][1]
			if (op === '+') {
				if (this.keyScale.isOrdinal) {
					this.insertPointAtIdx(ptIdx, this.dataMgr.getCurrentVal(key))
				} else {
					this.insertPointAt(key)
				}
			} else ptIdx++
		}
		this.draw(this._layoutG, false)
	}
	
	public drawEnd = (data:any[], animate:boolean) => {
		this.keyOffset = this.keyScale.isOrdinal ? this.keyScale.getRangeBand() / 2 : 0
		this.data = data
		// extract added keys and key position from diff
		var ptIdx = -1
		var i = -1
		while (++i < this.dataMgr.diffSequence.length) {
			var op = this.dataMgr.diffSequence[i][0]
			var key = this.dataMgr.diffSequence[i][1]
			if (op === '-') {
				if (this.keyScale.isOrdinal) {
					this.removePointAtIdx(ptIdx, this.dataMgr.getPrevVal(key))
				} else {
					this.removePointAt(key)
				}
			} else ptIdx++
		}
		this.draw(this._layoutG, animate)
	}
	
	//override
	
	protected keyOffset
	
	set data(val:any[]) {}
	protected insertPointAtIdx(idx:number, val:any):void {}
	protected insertPointAt(key:any):void {}
	protected removePointAtIdx(idx:number, val:any):void {}
	protected removePointAt(key:any):void {}
	protected draw(container, transition:boolean):void {}
}