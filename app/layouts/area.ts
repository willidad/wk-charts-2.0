import { Style, XYPathLayout } from './../core/interfaces'
import { Scale } from './../core/scale'
import { XYPath } from './../baseLayouts/xyPath'
import { Area as AreaGenerator} from './../generators/area'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as drawing from './../tools/drawing'
import { area as defaults } from './../core/defaults'

export class Area extends XYPath {
	
	private _areaStyle:Style = {}
	
	protected pathStyle = this.areaStyle
	private val0Fn = (val?):number => {
		return this.value0Property ? this.valueScale.map(val[this.value0Property]) : this.valueScale.map(0)
	}
	
	constructor(
		public keyScale:Scale,
		public keyProperty:string,
		public valueScale:Scale,
		public value1Property:string,
 		public value0Property?:string,
		public colorScale?:Scale, 
		public isVertical:boolean = false, 
		public spline:boolean = false) {
		super(keyScale, keyProperty, valueScale, value1Property, colorScale)
	}
	
	protected colorProp = 'fill'
	protected splineType = 'cardinal'
	
	set areaStyle(val:Style) { this._areaStyle = val; }
	get areaStyle():Style { return <Style>_.defaults(this._areaStyle, defaults.areaStyle)}
	
	protected pathGenerator = new AreaGenerator(this.spline, this.keyFn, this.valFn, this.val0Fn)
}