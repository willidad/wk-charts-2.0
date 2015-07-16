import * as d3 from 'd3'
import * as _ from 'lodash'

export enum DomainCalc {
	none, min, max, extent, extentZero
}

export class Scale {
	
	private _d3Scale;
	private _scaleType:string;
	
	constructor(type:string, public properties:string[], public domainRange:DomainCalc = DomainCalc.none) {
		this.type = type
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
	
	public isInverted:boolean = false;
	
	public getD3Scale = () => { return this._d3Scale }
	
	public getTicks = () => { return this.isOrdinal ? this.getDomain() : this._d3Scale.ticks() }
	
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
		
		if (this.domainRange === DomainCalc.none) {
			if (this.properties.length === 1) {
					this._d3Scale.domain(_.pluck(data, this.properties[0]))
				}
		} else {
			// compute the minimum and maximum value
			var min = Infinity
			var max = -Infinity
			for (var i = 0; i < data.length; i++) {
				for (var j = 0; j < this.properties.length; j++) {
					var v = data[i][this.properties[j]]
					if (v > max) max = v
					if (v < min) min = v
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
}
