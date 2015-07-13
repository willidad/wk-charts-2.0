/// <reference path="./../typings/tsd.d.ts" />

import { Chart } from './models/chart';
import { DomainCalc , Scale } from './models/scale';
import { Position, Axis } from './models/axis';
import { Line } from './layouts/line'
import { Column } from './layouts/column'
import { Grid } from './models/grid'
import { Marker } from './models/markers'

export function main(el: HTMLElement): void {
    
    var chart = new Chart(el, 'This is the chart title', "Subtitle");
    
    var xScale = new Scale('ordinal', ['x'])
    var x2Scale = new Scale('ordinal', ['x'])
    var yScale = new Scale('linear', ['y'], DomainCalc.extentZero)
    var y2Scale = new Scale('linear', ['y2'], DomainCalc.extent)
    var colorScale = new Scale('category10',[])
    
    var axisBottom = new Axis(Position.bottom, xScale, 'X - Scale')
    var axisTop = new Axis(Position.top, y2Scale, 'X - Scale Top')
    var axisLeft = new Axis(Position.left, yScale, 'Y - Scale')
    var axisRight = new Axis(Position.right, x2Scale, 'Y - Axis Right')

    var leftGrid = new Grid(axisLeft)
    var gridRight = new Grid(axisRight)
    gridRight.lineStyle = {stroke:'blue', opacity:0.3}
    var gridBottom = new Grid(axisBottom)
    
    chart.axis.push(axisBottom, axisLeft, axisTop, axisRight)
    chart.grid.push(leftGrid, gridBottom, gridRight)
    
    var line1 = new Line(yScale,'y',xScale,'x', colorScale)
    var line2 = new Line(y2Scale,'y2',x2Scale,'x', colorScale, true, true)
    var column1 = new Column(yScale,'y',xScale,'x', colorScale)
    var column2 = new Column(y2Scale,'y2',x2Scale,'x', colorScale, true)
    column1.columnStyle = {opacity:0.3}
    column2.columnStyle = {opacity:0.3}
    
    var marker1 = new Marker(yScale,'y',xScale,'x', colorScale)
    var marker2 = new Marker(y2Scale,'y2',x2Scale,'x', colorScale, true)
    
    chart.layout.push(column1, column2, line1, line2)
    chart.marker.push(marker1, marker2)
  
    chart.data = [{x:'aaaa', y:12, y2:24},{x:'bbb', y:13, y2:3},{x:'Äaaaaaa', y:18, y2:11},{x:'ddd', y:3, y2:9},{x:'eeee', y:-7, y2:-15}]
    chart.draw()
    
    document.getElementById('rotation').addEventListener('input',(ev) => {
        axisBottom.tickRotation = +ev.target.value
        axisLeft.tickRotation = +ev.target.value
        axisRight.tickRotation = +ev.target.value
        axisTop.tickRotation = +ev.target.value
        chart.draw()
    })
}