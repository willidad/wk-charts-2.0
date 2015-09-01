import * as d3 from 'd3'
import { Scale } from './scale'
import { Data } from './data'

export type Point = [number, number, boolean]
export type Points = Point[]
export type Accessor = (v:any) => number
export type D3Selection = d3.Selection<any>

export interface Style {
	[name:string]:any
}

export interface IMargins {
	top:number,
	bottom:number,
	left:number,
	right:number
}

export interface AreaSize {
	width:number;
	height:number;
}


export interface IGenerator {
	data:any[]
	keyOffset:number
	insertPointAtIdx(idx:number, val:any):void
	insertPointAt(key:any):void
	removePointAtIdx(idx:number, val:any):void
	removePointAt(key:any):void
	draw(transition:boolean):void
}

export interface IInterpolator {
	path():string
	getPathPoints():Points
	data(points:Points):void
	insertAtPoint(val:number):void
	insertAtPointReverse(val:number):void
	insertAtIdx(i:number):void
	insertAtIdxReverse(i:number):void 
	getBBox?():SVGRect
}

export interface ITooltip {
	showGroup:boolean
	keyScale?:Scale
	properties?:string[]
	isVertical?:boolean
	data:any[]
	container:D3Selection
	enable()
	disable()
}

export interface ITooltipData {
	key:any
	keyProperty
	value:any
	valueProperty
	color:string
	style?:Style
	icon?:any
}

export interface ITooltipDataProvider {
	getTooltipData(dataIdx:number):ITooltipData
}