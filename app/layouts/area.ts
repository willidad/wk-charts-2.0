import { Style, XYPathLayout } from './../core/interfaces'
import { Scale } from './../core/scale'
import { XYPath } from './../baseLayouts/xyPath'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as drawing from './../tools/drawing'
import { area as defaults } from './../core/defaults'

export class Area extends XYPath implements XYPathLayout {
	
	private _areaStyle:Style = {}
	public colorProp = 'fill'
	public splineType = 'cardinal'
	
	public pathGenerator = () => {
		
		var area = d3.svg.area()
		
		if (this.isVertical) {
        	area
          		.y((d) => d.keyPos + this.offset)
			  	.x0((d) => this.valFnZero())
          		.x1((d) => d.valPos)
		} else {      
	        area
          		.x((d) => d.keyPos + this.offset)
			  	.y0((d) => this.valFnZero())
          		.y1((d) => d.valPos)
		}
		
		return area
	}
	
	set areaStyle(val:Style) { this._areaStyle = val; }
	get areaStyle():Style { return <Style>_.defaults(this._areaStyle, defaults.areaStyle)}
	
	public afterDraw = (container, data, drawingAreaSize) => {
		this.path.style(this.areaStyle)
	}
}