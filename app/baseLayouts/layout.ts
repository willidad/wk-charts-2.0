import { IMargins, Point } from './../core/interfaces'
import { Scale } from './../core/scale'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as drawing from './../tools/drawing'
import { Diff } from './../tools/array-diff'
import { chart as chartDefaults ,axis as axisDefaults, duration} from './../core/defaults'

export class Layout {
	
	private static cnt:number = 0
	protected _id:number
	protected layoutG
	protected _duration:number = duration
	
	private differ = Diff({compress:false, unique:true})
	protected diffSeq:any[]
	
	protected _data:any[]
	protected _prevData:any[]
	protected _keyValues:any[] = []
	protected _prevKeyValues:any[] = []
	protected _values:{} = {}
	protected _prevValues:{} = {}
	
	
	constructor(
		public keyScale:Scale, 
		public keyProperty:string, 
		public valueScale:Scale, 
		public valueProperty:string, 
		public colorScale?:Scale, 
		public isVertical?:boolean) {
		Layout.cnt += 1;
		this._id = Layout.cnt;
	}
	
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
	
	private _diffData = (data) => {
		this._prevKeyValues = this._keyValues
		this._prevValues = this._values
		this._keyValues = []
		this._values = {}
		for (var d of data) {
			this._keyValues.push(this.key(d))
			this._values[this.key(d)] = this.val(d)
		}
		this.diffSeq = this.differ(this._prevKeyValues,this._keyValues)
	}
	
	protected calcKeyPos = (key, range, rangeIdx, interv):number => {
		if (this.keyScale.isOrdinal) {
			return rangeIdx < range.length ? range[rangeIdx] : range[range.length-1] + interv
		} else {
			return this.mapKey(key)
		}
	}
	
	protected startPos = ():Point[] => {
		return
	}
	
	protected endPos = ():Point[] => {
		return
	}
	
	protected cleanPos = (data):Point[] => {
		var range = this.keyScale.getRange()
		var seq:Point[] = []
		var rangeIdx = 0
		for (var point of data) {			
			seq.push({
				keyPos: this.keyFn(point),
				key: this.key(point),
				valPos: this.valFn(point),
				value: this.val(point)
			})
		}
		//console.log('cleanPos', seq)
		return seq
	}	
	
	//override functions
	public targetContainer = 'wk-chart-layout-area';
	public needsPadding:boolean = false
	
	public drawLayout = (data, drawingAreaSize?, animate?:boolean, cbAnimationDone?) => {} 
	public beforeDraw = (data, drawingAreaSize?) => {}
	public afterDraw = (data, drawingAreaSize?) => {}
	
	
	public getPadding = (container, data, drawingAreaSize):IMargins => {
		var padding:IMargins = {top:0, bottom:0, left:0, right:0}
		this.keyScale.setDomain(data)
		this.keyScale.setRange(this.isVertical ? [drawingAreaSize.height, 0] : [0, drawingAreaSize.width])
		this.valueScale.setDomain(data)
		this.valueScale.setRange(this.isVertical ? [0, drawingAreaSize.width] : [drawingAreaSize.height, 0])
		
		var l = container.select(`.wk-layout-${this._id}-sizer`)
		if (l.empty()) {
			l = container.append('g').attr('class', `wk-layout-${this._id}-sizer` )
		}
		
		var cleanData = this.cleanPos(data)
		
		this.beforeDraw(cleanData, drawingAreaSize)
		this.drawLayout(cleanData, drawingAreaSize)

		// measure the size of the label container
		var box = l.node().getBBox()
		// determine the additional space requirements
		padding.left = box.x < 0 ? Math.abs(box.x) : 0
		padding.top = box.y < 0 ? Math.abs(box.y) : 0
		padding.bottom = box.y + box.height > drawingAreaSize.height ? Math.abs(drawingAreaSize.height - box.y - box.height) : 0
		padding.right = box.x + box.width > drawingAreaSize.width ? Math.abs(drawingAreaSize.width - box.x - box.width) : 0
		//console.log('padding', padding, box, drawingAreaSize)
		l.remove()
		return padding
	}
	
	//-------------------------------------------------------------------------------
	
	public setupLayout(container) {
		var layoutArea = container.select(`.${this.targetContainer}`)
		this.layoutG = layoutArea.select(`.wk-layout-${this._id}`)
		if (this.layoutG.empty()) {
			this.layoutG = layoutArea.append('g').attr('class', `wk-layout-${this._id}` )
		}
	}
	
	public prepeareData(data:any[], prevData:any[]) {
		this._diffData(data)
		this._data = data
		this._prevData = prevData
	}
	
	public drawStart = (data, drawingAreaSize) => {
		var startData = this.startPos()
		//console.log('startPos', startData)
		this.beforeDraw(startData, drawingAreaSize)
		this.drawLayout(startData, drawingAreaSize, false)
		this.afterDraw(startData, drawingAreaSize)
	}
	
	public updateDomains = (data) => {
		this.keyScale.setDomain(data)
		this.valueScale.setDomain(data)
	}
	
	public drawAnimation = (data, drawingAreaSize) => {		
		var endData = this.endPos()
		//console.log('endPos', endData)
		this.beforeDraw(endData, drawingAreaSize)
		this.drawLayout(endData, drawingAreaSize, true, () => {
			console.log('callback called')
			this.drawEnd(data, drawingAreaSize)
		})
		this.afterDraw(endData, drawingAreaSize)
	}
	
	public drawEnd = (data, drawingAreaSize?) => {	
		var cleanData = this.cleanPos(data)
		this.beforeDraw(cleanData, drawingAreaSize)
		this.drawLayout(cleanData, drawingAreaSize)
		this.afterDraw(cleanData, drawingAreaSize)
	}
}