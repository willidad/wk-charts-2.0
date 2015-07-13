import {Scale} from './scale'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as drawing from './../tools/drawing'
import {chart as chartDefaults ,axis as defaults} from './defaults'

export class Layout {
	
	private static cnt:number = 0
	private _id:number
	
	constructor(public valueScale:Scale, public valueProperty:string, public keyScale, public keyProperty:string, public colorScale?:Scale) {
		Layout.cnt += 1;
		this._id = Layout.cnt;
	}
	
	protected valFn = (val):any => {
		return this.valueScale.map(val[this.valueProperty])
	}
	
	protected val = (val):any => {
		return val[this.valueProperty]
	}
	
	protected keyFn = (val):any => {
		return this.keyScale.map(val[this.keyProperty])
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
	
	protected drawLayout = (container, data) => {} //override
	
	public draw = (container, data) => {
		var l = container.select(`.wk-layout-${this._id}`)
		if (l.empty()) {
			l = container.append('g').attr('class', `wk-layout-${this._id}` )
		}
		this.drawLayout(l, data)
	}
	
	
}