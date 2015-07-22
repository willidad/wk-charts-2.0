import { Style } from './../core/interfaces'
import { Scale } from './../core/scale'
import { XYRectElement } from './../baseLayouts/xyRectElement'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as drawing from './../tools/drawing'
import { column as defaults } from './../core/defaults'

export class Columns extends XYRectElement {
      
      private _columnStyle:Style = {}
      private _columnSize;
      
      set columnStyle(val:Style) { this._columnStyle = val; }
	get columnStyle():Style { return <Style>_.defaults(this._columnStyle, defaults.columnStyle)}
      
      protected getSelector():string { return '.wk-chart-column' }
      
	protected create(selection:d3.Selection<any>, caller:Columns) {
            selection.append('rect').attr('class', 'wk-chart-column')
      }
      
	protected update(selection:d3.Selection<any>, caller:Columns) {
            if (caller.isVertical) {
                  selection
                        .attr('height', (d) => d.added |d.deleted ? 0 : caller.keyScale.getRangeBand())
                        .attr('width', (d) => Math.abs(caller.valFnZero() - d.valPos))
                        .attr('x', (d) => d.value > 0 ? -Math.abs(caller.valFnZero() - d.valPos) : 0)                        
            } else {
                  selection
                        .attr('width', (d) => d.added |d.deleted ? 0 : caller.keyScale.getRangeBand())
                        .attr('height', (d) => Math.abs(caller.valFnZero() - d.valPos))
                        .attr('y', (d) => d.value < 0 ? -Math.abs(caller.valFnZero() - d.valPos) : 0)
            }
            selection.style('fill', (d) => caller.mapColor(d.key)).style(caller.columnStyle)
      }
}
