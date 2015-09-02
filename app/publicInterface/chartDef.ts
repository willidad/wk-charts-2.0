import { DomainCalc} from './../core/scale'
import { Position } from './../core/axis'

export { DomainCalc as DomainCalc}
export { Position as Position}

export type d3DivSelector = d3.Selection<HTMLDivElement>

export interface callback {
	(val:any):any
}

export interface Style {
	[name:string]:any
}

export enum ChartType {
	column, pie, donut, line, area, bubble, spider
}
export enum Projection {
	orthographic, mercator,conicEqualArea
}

export interface GeoProjection {
	//TODO Verify projection attributes
	projection:Projection
	scale:number
	translate:[number, number]
	rotation:[number, number]
	parallels:[number, number]
}

export interface StyledText {
	text:string
	style?:Style
	bgStyle?:Style
}

export interface TickStyle {
	labelStyle?:Style
	bgStyle?:Style
	rotation?:number
	ticks?:any
	labelFormat?:String
}

export interface Axis {
	orientation: Position
	scaleId: string
	title?: StyledText | string
    grid?: Style | boolean
	tickLabelStyle?: TickStyle
}

export interface Grid {
	axis:Axis
	linesStyle?:Style
}

export interface Scale {
    id:string
	type:string
	properties:string[]
	domainRange?:DomainCalc
	isInverted?:boolean
}

export interface ChartDef {
    scales:Scale[]
	layouts:Layout[]
	title?:StyledText | string
	subTitle?:StyledText | string
	axis?:Axis[]
	tooltip?:Tooltip | boolean
}

export interface DataMarker {
	markerStyle?:Style
}

export interface DataLabels {
	style?:Style
	bgStyle?:Style
	rotation?:number
}

export interface Tooltip {
	
}

interface Layout {
	type:ChartType
	keyScaleId:string
	keyProperty:string
	valueScaleId:string
	colorScaleId?:string
}

interface SimpleLayout extends Layout {
	valueProperty:string
	rowColor?:string
	isVertical?:boolean
}

interface StackedLayout extends Layout {
	valueProperties:string[]
	rowColors?:string[]
}

export interface Area extends SimpleLayout {
	value0Property?:string
	spline?:boolean
	dataMarkers?:DataMarker | boolean
	areaStyle?:Style
}

export interface StackedArea extends StackedLayout {
	spline?:boolean
	dataMarkers?:DataMarker[] | boolean
	areaStyle?:Style[] | Style
}
export interface Line extends SimpleLayout {
	spline?:boolean
	dataMarkers?:DataMarker | boolean
	lineStyle?:Style
}

export interface Column extends SimpleLayout {
	value0Property?:string
	dataLabels?:DataLabels | boolean
	padding?:[number, number]
	columnStyle?:Style
}

export interface StackedColumn extends StackedLayout {
	padding?:[number, number]
	columnStyles?:Style[] | Style
}

export interface Pie extends Layout {
	valueProperty:string
	dataLabels?:DataLabels | boolean
	pieStyle?:Style
}

export interface Donut extends Pie {

}

export interface Bubble extends Layout {
	valueProperty: String
	dataLabels?:DataLabels | boolean
	sizeScale?:Scale
	sizeProperty?:string
	iconScale?:Scale
	iconProperty?:string
}

export interface SpiderChart extends SimpleLayout {
	//TODO Check if addl atributes are needed
}

export interface Gauge extends Layout {
	//TODO Define Attributes
}

export interface GeoMap {
	geoJson:string
	projection:GeoProjection
	colorScale:Scale
	colorProperty:string
}

export interface Chart {
	container:d3DivSelector
	model:ChartDef
	draw(data:any) 
}
	