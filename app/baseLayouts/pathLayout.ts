import { IMargins, Point } from './../core/interfaces'
import { Layout } from './layout'
import { Scale } from './../core/scale'
import { Generator } from './../generators/generator'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as drawing from './../tools/drawing'
import { Diff } from './../tools/array-diff'
import { chart as chartDefaults ,axis as axisDefaults, duration} from './../core/defaults'

export class PathLayout extends Layout {
	
	protected pathGenerator:Generator;
	
	//override functions
	public targetContainer = 'wk-chart-layout-area';
	public needsPadding:boolean = false
	
	protected startPath = () => {
		this.pathGenerator.data = this._prevData//.map((k) => { return {x:this.mapKey(k), y:this.mapVal(this._prevValues[k])} });
		// extract added keys and key position from diff
		var i = -1
		while (++i < this.diffSeq.length) {
			var op:string = this.diffSeq[i][0]
			var key:string = this.diffSeq[i][1]
			if (op === '+') this.pathGenerator.insertPointAt(key) //TODO: will not work for ordinal scales
		}
		return this.pathGenerator.path
	}
	
	protected endPath = () => {
		this.pathGenerator.data = this._data//.map((k) => { return {x:this.mapKey(k), y:this.mapVal(this._values[k])} });
		// extract added keys and key position from diff
		var i = -1
		while (++i < this.diffSeq.length) {
			var op = this.diffSeq[i][0]
			var key = this.diffSeq[i][1]
			if (op === '-') this.pathGenerator.insertPointAt(key) // TODO: will not work for ordinal scales
		}
		return this.pathGenerator.path
	}
	
	protected cleanPath = () => {
		this.pathGenerator.data = this._data//.map((k) => { return {x:this.mapKey(k), y:this.mapVal(this._values[k])} });
		return this.pathGenerator.path
	}
	
	public drawLayout = (data, drawingAreaSize?, animate?:boolean, cbAnimationDone?) => {} 
	public beforeDraw = (data, drawingAreaSize?) => {}
	public afterDraw = (data, drawingAreaSize?) => {}
	
	//-------------------------------------------------------------------------------
	
}