import { Style } from './../core/interfaces'
import { Scale } from './../core/scale'
import { XYElement } from './../baseLayouts/xyElement'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as drawing from './../tools/drawing'
import { column as defaults } from './../core/defaults'

export class Columns extends XYElement {
      
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
                        .attr('height', caller.keyScale.getRangeBand())
                        .attr('width', (d) => Math.abs(caller.valFnZero() - caller.valFn(d)))
                        .attr('x', (d) => caller.val(d) > 0 ? -Math.abs(caller.valFnZero() - caller.valFn(d)) : 0)                        
            } else {
                  selection
                        .attr('width', caller.keyScale.getRangeBand())
                        .attr('height', (d) => Math.abs(caller.valFnZero() - caller.valFn(d)))
                        .attr('y', (d) => caller.val(d) < 0 ? -Math.abs(caller.valFnZero() - caller.valFn(d)) : 0)
            }
            selection.style('fill', caller.propertyColor()).style(caller.columnStyle)
      }
}
