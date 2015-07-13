import {Scale} from './../models/scale'
import {Layout} from './../models/layout'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as drawing from './../tools/drawing'
import {column as defaults} from './../models/defaults'

export class Column extends Layout {
      
      private _columnStyle = {}
      private _id:number;
      private static cnt = 0;
	
      constructor(public valueScale:Scale, public valueProperty:string, public keyScale:Scale, public keyProperty:string, public colorScale?:Scale, public isVertical:boolean = false) {
      	super(valueScale, valueProperty, keyScale, keyProperty, colorScale)
            Column.cnt += 1
            this._id = Column.cnt;
      }
      
      set columnStyle(val) { this._columnStyle = val; }
	get columnStyle() { return _.defaults(this._columnStyle, defaults.columnStyle)}
      
      public draw = (container, data) => {
      	var columnSize = this.keyScale.getRangeBand()
      	var columns = container.selectAll(`rect.wk-chart-column-${this._id}`).data(data, this.key)
      	var enter = columns.enter().append('rect').attr('class',`wk-chart-column-${this._id}`)
      	
      	if (this.isVertical) {
                  columns.attr('height', columnSize)
                        .attr('width', (d) => Math.abs(this.valueScale.map(0) - this.valFn(d)))
                        .attr('x', (d) => Math.min(this.valueScale.map(0), this.valFn(d)))
                        .attr('transform', (d) => `translate(0, ${this.keyFn(d)})`)
            } else {
                  columns.attr('width', columnSize)
                        .attr('height', (d) => Math.abs(this.valueScale.map(0) - this.valFn(d)))
                        .attr('y', (d) => Math.min(this.valueScale.map(0), this.valFn(d)))
                        .attr('transform', (d) => `translate(${this.keyFn(d)}, 0)`)
            }
            if (this.colorScale) {
      		columns.style('fill', this.propertyColor())
      	}
            
            columns.style(this.columnStyle)
            
            columns.exit().remove()	
      }
}
