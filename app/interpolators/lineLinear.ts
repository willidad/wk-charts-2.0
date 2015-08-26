import { Point, Points, IInterpolator} from './../core/interfaces'

export class Linear implements IInterpolator {
	
	constructor(private isVertical:boolean) {	}

	private _data:Points

	public path():string {
		return this._data.map(function(d) { return [d[0], d[1]]}).join('L')
	}
		
	public data(data:Points) {
		this._data = data
	}
	
	public getPathPoints():Points {
		return this._data
	}
			
	public insertAtPoint(key:number) {
		// find insertion point
		var k = this.isVertical ? 1 : 0	
		var v = this.isVertical ? 0 : 1
		var iLow, iHigh, deltaKey, deltaVal, deltaValIns, deltaKeyIns, lastPt
		
		lastPt = this._data.length-1
		
		if (this._data[0][k] > this._data[lastPt][k]) {
			// test boundaries
			if (key > this._data[0][k]) {
				var d:Point = [this._data[0][0], this._data[0][1], true]
				this._data.unshift(d)
			} else if (key < this._data[lastPt][k]) {
				var d:Point = [this._data[lastPt][0], this._data[lastPt][1], true]
				this._data.push(d)
			} else {
				iHigh = 0 // points to larger value
				iLow = 1 // points to smaller value
				while (iLow < this._data.length) {
					if (this._data[iHigh][k] >= key &&  key >= this._data[iLow][k]) break
					iHigh++
					iLow++
				}
				deltaKey = Math.abs(<number>this._data[iHigh][k] - <number>this._data[iLow][k])
				deltaVal = <number>this._data[iHigh][v] - <number>this._data[iLow][v]
				deltaKeyIns = Math.abs(key - <number>this._data[iLow][k])
				deltaValIns = Math.abs(<number>this._data[iLow][k] - key) / deltaKey * deltaVal
				var insPt:Point = [0, 0, true]
				insPt[k] = key
				insPt[v] = <number>this._data[iLow][v] + deltaKeyIns / deltaKey * deltaVal
				this._data.splice(iLow, 0 , insPt)
			}
		} else {
			if (key < this._data[0][k]) {
				var d:Point = [this._data[0][0], this._data[0][1], true]
				this._data.unshift(d)
			} else if (key > this._data[lastPt][k]) {
				var d:Point = [this._data[lastPt][0], this._data[lastPt][1], true]
				this._data.push(d)
			} else {
				iHigh = 1 // points to larger value
				iLow = 0 // points to smaller value
				while (iHigh < this._data.length) {
					if (this._data[iHigh][k] >= key &&  key >= this._data[iLow][k]) break
					iHigh++
					iLow++
				}
				deltaKey = Math.abs(<number>this._data[iHigh][k] - <number>this._data[iLow][k])
				deltaVal = <number>this._data[iHigh][v] - <number>this._data[iLow][v]
				deltaKeyIns = Math.abs(key - <number>this._data[iLow][k])
				deltaValIns = Math.abs(<number>this._data[iLow][k] - key) / deltaKey * deltaVal
				var insPt:Point = [0, 0, true]
				insPt[k] = key
				insPt[v] = <number>this._data[iLow][v] + deltaKeyIns / deltaKey * deltaVal
				this._data.splice(iHigh, 0 , insPt)
			}
		}
	}
	
	public insertAtPointReverse(key:number) {
		this.insertAtPoint(key) 
	}
		
	public insertAtIdx(i:number) {
		
		var startKey, startVal
		var lastPt = this._data.length - 1
		var k = this.isVertical ? 1 : 0	
		var v = this.isVertical ? 0 : 1
		if (i < 0) {
			// insert first point as animation start point
			var d:Point = [this._data[0][0], this._data[0][1], true]
			this._data.unshift(d)
		} else if (i >= this._data.length - 1) {
			var d:Point = [this._data[lastPt][0], this._data[lastPt][1], true]
			this._data.push(d)
		} else {
			startKey = (<number>this._data[i][k] + <number>this._data[i+1][k]) / 2;
			startVal = (<number>this._data[i][v] + <number>this._data[i+1][v]) / 2;
			this._data.splice(i+1,0, this.isVertical ? [startVal, startKey, true] : [startKey, startVal, true])
		}	
	}
	
	public insertAtIdxReverse(i:number) {
		var startKey, startVal;
		var lastPt = this._data.length - 1
		var k = this.isVertical ? 1 : 0	
		var v = this.isVertical ? 0 : 1	
		if (i < 0) {
			// insert first point as animation start point
			var d:Point = [this._data[lastPt][0], this._data[lastPt][1], true]
			this._data.push(d)
		} else if (i >= this._data.length - 1) {
			var d:Point = [this._data[0][0], this._data[0][1], true]
			this._data.unshift(d)
		} else {
			var i1 = this._data.length - i - 1
			startKey = (<number>this._data[i1][k] + <number>this._data[i1-1][k]) / 2;
			startVal = (<number>this._data[i1][v] + <number>this._data[i1-1][v]) / 2;
			this._data.splice(i1,0, this.isVertical ? [startVal, startKey, true] : [startKey, startVal, true])
		}	
	}
	
	public getBBox() {
		var xRange = d3.extent(this._data.map(function(d) {return d[0]}))
		var yRange = d3.extent(this._data.map(function(d) {return d[1]}))
		return {
			x:xRange[0], 
			y:yRange[0],
			width:Math.abs(xRange[0] - xRange[1]),
			height:Math.abs(yRange[0] - yRange[1])
		}
		return undefined
	}
}