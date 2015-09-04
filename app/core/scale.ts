import * as d3 from 'd3'
import * as _ from 'lodash'

export enum DomainCalc {
	none, min, max, extent, extentZero
}

export class Scale {
	
	private _d3Scale;
	private _scaleType:string;
	private _data: any[]
	private _keyData: any[]
	
	constructor(type:string, public properties:string[], public domainRange:DomainCalc = DomainCalc.none, isInverted?:boolean) {
		this.type = type
        this.isInverted = isInverted
	}
	 // setter and getter to create d3 scale
	set type(t:string) {
		//TODO: Implement custom scales
		if (_.has(d3.scale, t)) { 
			this._d3Scale = d3.scale[t]()
		} else if (t === "time") {
			this._d3Scale = d3.time.scale()
		}
		this._scaleType = t
	}
	get type() { return this._scaleType; }
	
	get isOrdinal():boolean  {
		return _.has(this._d3Scale, 'rangeBand');
	}
	 
	get isInverseRange():boolean {
		var r = this._d3Scale.range()
		return r[0] > r[r.length - 1]
	}
	
	public isInverted:boolean = false;
	
	public getD3Scale = () => { return this._d3Scale }
	
	public getTicks = () => { return this.isOrdinal ? this._d3Scale.domain() : this._d3Scale.ticks() }
	
	public setRange = (range:[number,number]) => {
		var invertedRange = [range[1], range[0]]
		if (this.isOrdinal) {
			this._d3Scale.rangeBands(this.isInverted ? invertedRange : range)
		} else {		
			this._d3Scale.range(this.isInverted ? invertedRange : range)
		}
	}
	
	public getRange = () => {
		return this._d3Scale.range()
	}
	
	public getRangeBand = () => {
		return this.isOrdinal ? this._d3Scale.rangeBand() : 0
	}
	
	public setDomain = (data:any[]) => {
		this._data = data
		if (this.properties.length === 1) {
			this._keyData = _.pluck(data, this.properties[0])
		}
		if (this.domainRange === DomainCalc.none) {
			if (this.properties.length === 1) {
					this._d3Scale.domain(this._keyData)
				}
		} else {
			// compute the minimum and maximum value
			var min = Infinity
			var max = -Infinity
			if (data) {
				for (var i = 0; i < data.length; i++) {
					for (var j = 0; j < this.properties.length; j++) {
						var v = data[i][this.properties[j]]
						if (v > max) max = v
						if (v < min) min = v
					}
				}
			}
			switch (this.domainRange) {
				case DomainCalc.extent: this._d3Scale.domain([min, max]); break;
				case DomainCalc.min: this._d3Scale.domain([0, min]); break;
				case DomainCalc.max: this._d3Scale.domain([0, max]); break;
				case DomainCalc.extentZero:
					this._d3Scale.domain( min * max > 0 ? (min < 0 ? [min, 0] : [0, max]) : [min, max])
			}
		}
	}
	
	public getDomain = () => {
		return this._d3Scale.domain()
	}
	
	public map = (value:any):any => {
		return this._d3Scale(value)
	}
	
	public mapZero = ():any => {
		return this._d3Scale(0)
	}
	
	public mapIdx = (idx:number):number => {
		if (this.isOrdinal) {
			var range = this._d3Scale.range()
			if (0 <= idx && idx < range.length) return range[idx]
			if (idx < 0) return range[0]
			if (idx >= range.length) return range[range.length - 1] + (this.isInverseRange ? -this.getRangeBand() : this.getRangeBand())
		}
	}
	
	private bisectKey = (val:any, data:any[]):any => {
		var bisect, idx
		if (data[0] < data[data.length-1]) {
			bisect = d3.bisector((a:any,b:any) => { return a - b }).right
			idx = bisect(data, val) - 1
		} else {
			bisect = d3.bisector((a:any,b:any) => { return b - a }).left 
			idx = bisect(data, val)
		}			
		return idx
	}
	
	public invert = (value:number):any => {
		if (this._d3Scale.hasOwnProperty('invert')) { 
			var inv = this._d3Scale.invert(value)
			return this.bisectKey(inv, this._keyData)
		} else if (this.isOrdinal) {			
			return this.bisectKey(value, this._d3Scale.range())
		} else {
			return undefined
		}
	}
}
