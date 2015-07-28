import { Style } from './../core/interfaces'
import { XYElement } from './../baseLayouts/xyElement'
import { column as defaults } from './../core/defaults'
import * as _ from 'lodash'

export class Columns extends XYElement {
      
      private _columnStyle:Style = {}
      private _columnSize;
      public padding:[number,number] = [0,0]
      public rowColor = undefined

      
      set columnStyle(val:Style) { this._columnStyle = val; }
	get columnStyle():Style { return <Style>_.defaults(this._columnStyle, defaults.columnStyle) }
      
      protected getSelector():string { return '.wk-chart-column' }
      
	protected create(selection:d3.Selection<any>, caller:Columns) {
            selection.append('rect').attr('class', 'wk-chart-column')
      }
      
	protected update(selection:d3.Selection<any>, caller:Columns) {
            var leftTopPadding = caller.keyScale.getRangeBand() * caller.padding[0]
            var rightBottomPadding = caller.keyScale.getRangeBand() * caller.padding[1]
            if (caller.isVertical) {
                  selection
                        .attr('height', (d) => d.added |d.deleted ? 0 : caller.keyScale.getRangeBand() - leftTopPadding - rightBottomPadding)
                        .attr('width', (d) => Math.abs(caller.valFnZero() - d.valPos))
                        .attr('x', (d) => d.value > 0 ? -Math.abs(caller.valFnZero() - d.valPos) : 0)    
                        .attr('y', (d) => d.added | d.deleted ? 0 : leftTopPadding)                    
            } else {
                  selection
                        .attr('width', (d) => d.added |d.deleted ? 0 : caller.keyScale.getRangeBand() - leftTopPadding - rightBottomPadding)
                        .attr('height', (d) => Math.abs(caller.valFnZero() - d.valPos))
                        .attr('y', (d) => d.value < 0 ? -Math.abs(caller.valFnZero() - d.valPos) : 0)
                        .attr('x', (d) => d.added | d.deleted ? 0 : leftTopPadding) 
            }
            selection.style('fill', (d) => caller.rowColor || caller.mapColor(d.key)).style(caller.columnStyle)
      }
}