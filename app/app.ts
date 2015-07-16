/// <reference path="./../typings/tsd.d.ts" />

import { Chart } from './core/chart';
import { DomainCalc , Scale } from './core/scale';
import { Position, Axis } from './core/axis';
import { Line } from './layouts/line'
import { Area } from './layouts/area'
import { Columns } from './layouts/column'
import { Pie } from './layouts/pie'
import { Donut } from './layouts/donut'
import { Grid } from './core/grid'
import { XYDataLabels } from './baseLayouts/xyDataLabels'

export function main(el: HTMLElement): void {
    
    var chart = new Chart(el, 'This is the chart title', "Subtitle");
    
    var xScale = chart.addScale('ordinal', ['x'])
    var x2Scale = chart.addScale('ordinal', ['x'])
    x2Scale.isInverted = true
    var yScale = chart.addScale('linear', ['y'], DomainCalc.extentZero)
    var y2Scale = chart.addScale('linear', ['y2'], DomainCalc.extent)
    var colorScale = chart.addScale('category10',[])
    var keyColors = chart.addScale('category10', ['x'])
    
    var axisBottom = chart.addAxis(Position.bottom, xScale, 'X - Scale')
    var axisTop = chart.addAxis(Position.top, y2Scale, 'X - Scale Top')
    var axisLeft = chart.addAxis(Position.left, yScale, 'Y - Scale')
    var axisRight = chart.addAxis(Position.right, x2Scale, 'Y - Axis Right')

    var leftGrid = chart.addGrid(axisLeft)
    var gridRight = chart.addGrid(axisRight)
    gridRight.lineStyle = {stroke:'blue', opacity:0.3}
    var gridBottom = chart.addGrid(axisBottom)
    
    var line1 = chart.addLayout(new Line(yScale,'y',xScale,'x', colorScale))
    line1.markers = true
    //var line2 = chart.addLayout(new Line(y2Scale,'y2',x2Scale,'x', colorScale, true, true))
    var area2 = chart.addLayout(new Area(y2Scale,'y2',x2Scale,'x', colorScale, true, true))
    area2.markers = true
    var column1 = chart.addLayout(new Columns(yScale,'y',xScale,'x', colorScale))
    var column2 = chart.addLayout(new Columns(y2Scale,'y2',x2Scale,'x', colorScale, true))
    column1.columnStyle = {opacity:0.3}
    column2.columnStyle = {opacity:0.3}
    
    var pie = chart.addLayout(new Donut(yScale, 'y', xScale, 'x', keyColors))
    
    var dataLabels1 = chart.addDataLabel(yScale,'y',xScale,'x')
    var dataLabels2 = chart.addDataLabel(y2Scale,'y2',x2Scale,'x', true)
    dataLabels2.labelRotation = 45
  
    chart.data = [{x:'aaaa', y:12, y2:24},{x:'bbb', y:13, y2:3},{x:'Äaaaaaa', y:18, y2:11},{x:'ddd', y:3, y2:9},{x:'eeee', y:-7, y2:-15}]
    chart.draw()
    
    document.getElementById('rotation').addEventListener('input',(ev) => {
        axisBottom.tickRotation = Number((<HTMLInputElement>ev.target).value)
        axisLeft.tickRotation = Number((<HTMLInputElement>ev.target).value)
        axisRight.tickRotation = Number((<HTMLInputElement>ev.target).value)
        axisTop.tickRotation = Number((<HTMLInputElement>ev.target).value)
        chart.draw()
    })
}