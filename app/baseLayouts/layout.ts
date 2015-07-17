import { IMargins } from './../core/interfaces'
import {Scale} from './../core/scale'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as drawing from './../tools/drawing'
import {chart as chartDefaults ,axis as axisDefaults} from './../core/defaults'

export class Layout {
	
	private static cnt:number = 0
	protected _id:number
	
	constructor(public valueScale:Scale, public valueProperty:string, public keyScale, public keyProperty:string, public colorScale?:Scale) {
		Layout.cnt += 1;
		this._id = Layout.cnt;
	}
	
	public valFn = (val):any => {
		return this.valueScale.map(val[this.valueProperty])
	}
	
	public valFnZero = ():any => {
		return this.valueScale.mapZero()
	}
	
	public val = (val):any => {
		return val[this.valueProperty]
	}
	
	public keyFn = (val):any => {
		return this.keyScale.map(val[this.keyProperty])
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
	
	public colorFn = (val):any => {
		if (this.colorScale) {
			return this.colorScale.map(val[this.keyProperty])
		} else {
			return null
		}
	}
	
	//override functions
	public targetContainer = 'wk-chart-layout-area';
	public needsPadding:boolean = false
	public getPadding = (container, data, drawingAreaSize):IMargins => {return}
	
	protected drawLayout = (container, data, drawingAreaSize?) => {} 
	protected beforeDraw = (container, data, drawingAreaSize?) => {}
	protected afterDraw = (container, data, drawingAreaSize?) => {}
	//-------------------------------------------------------------------------------
	
	public draw = (container, data, drawingAreaSize) => {
		var l = container.select(`.wk-layout-${this._id}`)
		if (l.empty()) {
			l = container.append('g').attr('class', `wk-layout-${this._id}` )
		}
		this.beforeDraw(l, data, drawingAreaSize)
		this.drawLayout(l, data, drawingAreaSize)
		this.afterDraw(l, data, drawingAreaSize)
	}	
}