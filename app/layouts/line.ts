import { Style , XYPathLayout } from './../core/interfaces'
import { Scale } from './../core/scale'
import { Line as LineGenerator} from './../generators/line'
import { XYPath } from './../baseLayouts/xyPath'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as drawing from './../tools/drawing'
import { line as defaults } from './../core/defaults'

export class Line extends XYPath {
	
	private _lineStyle:Style = {}
	public colorProp = 'stroke'
	
	protected pathStyle:Style = <Style>_.defaults({fill:'none'},this.lineStyle)

	protected pathGenerator = new LineGenerator(this.spline)
	
	set lineStyle(val:Style) { this._lineStyle = val; }
	get lineStyle():Style { return <Style>_.defaults(this._lineStyle, defaults.lineStyle)}		
}