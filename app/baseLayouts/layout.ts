import { IMargins } from './../core/interfaces'
import {Scale} from './../core/scale'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as drawing from './../tools/drawing'
import { Diff } from './../tools/array-diff'
import {chart as chartDefaults ,axis as axisDefaults, duration} from './../core/defaults'

export class Layout {
	
	private static cnt:number = 0
	protected _id:number
	protected _duration:number = duration
	
	private differ = Diff({compress:false, unique:true})
	private diffSeq:any[]
	
	private _keyValues:any[] = []
	private _prevKeyValues:any[] = []
	private _values:{} = {}
	private _prevValues:{} = {}
	
	
	constructor(public valueScale:Scale, public valueProperty:string, public keyScale:Scale, public keyProperty:string, public colorScale?:Scale) {
		Layout.cnt += 1;
		this._id = Layout.cnt;
	}
	
	public valFn = (val):any => {
		return this.valueScale.map(val[this.valueProperty])
	}
	
	public valFnZero = ():any => {
		return this.valueScale.map(0)
	}
	
	public mapVal = (val):any => {
		return this.valueScale.map(val)
	}
	
	public val = (val):any => {
		return val[this.valueProperty]
	}
	
	public keyFn = (val):any => {
		return this.keyScale.map(val[this.keyProperty])
	}
	
	public mapKey = (val):any => {
		return this.keyScale.map(val)
	}
	
	public key = (val):any => {
		return val[this.keyProperty]
	}
	
	public propertyColor = ():string => {
		if (this.colorScale) {
			return this.colorScale.map(this.valueProperty)
		} else {
			return null
		}
	}
	
	public mapColor = (val):any =>
	{
		return this.colorScale.map(val)
	}	
	public colorFn = (val):any => {
		if (this.colorScale) {
			return this.colorScale.map(val[this.keyProperty])
		} else {
			return null
		}
	}
	
	private diffData = (data) => {
		this._prevKeyValues = this._keyValues
		this._prevValues = this._values
		//this._keyValues = _.pluck(data, this.keyProperty)
		//this._values = _.indexBy(data, this.keyProperty)
		this._keyValues = []
		this._values = {}
		for (var d of data) {
			this._keyValues.push(this.key(d))
			this._values[this.key(d)] = this.val(d)
		}
		this.diffSeq = this.differ(this._prevKeyValues,this._keyValues)
	}
	
	private startPos = ():number[] => {
		var range = this.keyScale.getRange()
		var interv = range.length > 1 ? range[1] - range[0] : undefined //TODO something more meainingful
		var seq = []
		var rangeIdx = 0
		var targetPos
		for (var point of this.diffSeq) {
			var op = point[0]
			var key = point[1]
			seq.push({
				keyPos: rangeIdx < range.length ? range[rangeIdx] : range[range.length-1] + interv,
				key:key,
				valPos:this.mapVal(this._prevValues[key] || this._values[key]),
				value:this._prevValues[key] || this._values[key],
				targetPos: this._prevValues[key],
				added: op === '+'
			})
			if (op !== '+') rangeIdx++
		}
		return seq
	}
	
	private endPos = ():number[] => {
		var range = this.keyScale.getRange()
		var interv = range.length > 1 ? range[1] - range[0] : undefined //TODO something more meainingful
		var seq = []
		var rangeIdx = 0
		for (var point of this.diffSeq) {
			var op = point[0]
			var key = point[1]
			seq.push({
				keyPos:rangeIdx < range.length ? range[rangeIdx] : range[range.length-1] + interv, 
				key:key,
				valPos:this.mapVal(this._values[key] || this._prevValues[key]),
				value:this._values[key] || this._prevValues[key],
				deleted: op === '-'
			})
			if (op !== '-') rangeIdx++	
		}
		return seq
	}
	
	private cleanPos = (data):number[] => {
		var range = this.keyScale.getRange()
		var seq = []
		var rangeIdx = 0
		for (var point of data) {			
			seq.push({
				keyPos: this.keyFn(point),
				key: this.key(point),
				valPos:this.valFn(point),
				value:this.val(point)
			})
		}
		return seq
	}
	
	protected cleanSequence = (data) => {
		var seq = []
		var pred = undefined
		for (var d of data) {
			seq.push({key: this.key(d), value:this.val(d), originalKey:this.key(d), originalValue:this.val(d)})
		}
		return seq
	}
	
	
	//override functions
	public targetContainer = 'wk-chart-layout-area';
	public needsPadding:boolean = false
	
	public drawLayout = (container, data, drawingAreaSize?, animate?:boolean, cbAnimationDone?) => {} 
	public beforeDraw = (container, data, drawingAreaSize?) => {}
	public afterDraw = (container, data, drawingAreaSize?) => {}
	
	
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
		
		this.beforeDraw(l, cleanData, drawingAreaSize)
		this.drawLayout(l, cleanData, drawingAreaSize)

		// measure the size of the label container
		var box = l.node().getBBox()
		// determine the additional space requirements
		padding.left = box.x < 0 ? Math.abs(box.x) : 0
		padding.top = box.y < 0 ? Math.abs(box.y) : 0
		padding.bottom = box.y + box.height > drawingAreaSize.height ? Math.abs(drawingAreaSize.height - box.y - box.height) : 0
		padding.right = box.x + box.width > drawingAreaSize.width ? Math.abs(drawingAreaSize.width - box.x - box.width) : 0
		console.log('padding', padding, box, drawingAreaSize)
		l.remove()
		return padding
	}
	
	//-------------------------------------------------------------------------------
	
	public setupLayout() {}
	
	public prepeareData(data) {
		this.diffData(data)
		console.log('diff result', this.diffSeq)
	}
	
	public drawStart = (container, data, drawingAreaSize?) => {
		var l = container.select(`.wk-layout-${this._id}`)
		if (l.empty()) {
			l = container.append('g').attr('class', `wk-layout-${this._id}` )
		}
		var startData = this.startPos()
		console.log('startPos', startData)
		this.beforeDraw(l, startData, drawingAreaSize)
		this.drawLayout(l, startData, drawingAreaSize, false)
		this.afterDraw(l, startData, drawingAreaSize)
	}
	
	public updateDomains = (data) => {
		this.keyScale.setDomain(data)
		this.valueScale.setDomain(data)
	}
		
	
	public drawAnimation = (container, data, drawingAreaSize) => {
		var l = container.select(`.wk-layout-${this._id}`)
		if (l.empty()) {
			l = container.append('g').attr('class', `wk-layout-${this._id}` )
		}
		
		var endData = this.endPos()
		console.log('endPos', endData)
		this.beforeDraw(l, endData, drawingAreaSize)
		this.drawLayout(l, endData, drawingAreaSize, true, () => {
			this.drawEnd(container, data, drawingAreaSize)
		})
		this.afterDraw(l, endData, drawingAreaSize)
	}
	
	
		
	public drawEnd = (container, data, drawingAreaSize?) => {	
		var l = container.select(`.wk-layout-${this._id}`)
		if (l.empty()) {
			l = container.append('g').attr('class', `wk-layout-${this._id}` )
		}

		var cleanData = this.cleanPos(data)
		console.log('cleanPos', cleanData)
		this.beforeDraw(l, cleanData, drawingAreaSize)
		this.drawLayout(l, cleanData, drawingAreaSize)
		this.afterDraw(l, cleanData, drawingAreaSize)
	}
}