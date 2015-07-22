import { Style , XYPathLayout } from './../core/interfaces'
import { Scale } from './../core/scale'
import { XYPath } from './../baseLayouts/xyPath'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as drawing from './../tools/drawing'
import { line as defaults } from './../core/defaults'

export class Line extends XYPath implements XYPathLayout {
	
	private _lineStyle:Style = {}
	public colorProp = 'stroke'

	public pathGenerator = () => {
	
		var line = d3.svg.line()
		
		if (this.isVertical) {
        	line
          		.y((d) => d.keyPos + this.offset)
          		.x((d) => d.valPos)
		} else {      
	        line
          		.x((d) => d.keyPos + this.offset)
          		.y((d) => d.valPos)
		}
		
		return line
	}
	
	set lineStyle(val:Style) { this._lineStyle = val; }
	get lineStyle():Style { return <Style>_.defaults(this._lineStyle, defaults.lineStyle)}
	
	public afterDraw = (container, data, drawingAreaSize) => {
		this.path.style(this.lineStyle).style('fill','none')
	}		
}