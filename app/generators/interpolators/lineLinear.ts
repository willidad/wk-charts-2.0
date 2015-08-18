import { Point, Points, IInterpolator} from './interpolator'

export class Linear implements IInterpolator {
	
	constructor(private isVertical:boolean) {}


	private _data:Points

	public path():string {
			return this._data.join('L')
		}
		
	public data(data:Points) {
		this._data = data
	}
		
	public insertAtPoint(key:number) {
		// find insertion point
		var k = this.isVertical ? 1 : 0	
		var v = this.isVertical ? 0 : 1
		var iLow, iHigh, deltaKey, deltaVal, deltaValIns, deltaKeyIns
		
		if (this._data[0][k] > this._data[this._data.length-1][k]) {
			// test boundaries
			if (key > this._data[0][k]) this._data.unshift(this._data[0])
			else if (key < this._data[this._data.length-1][k]) this._data.push(this._data[this._data.length-1])
			else {
				iHigh = 0 // points to larger value
				iLow = 1 // points to smaller value
				while (iLow < this._data.length) {
					if (this._data[iHigh][k] >= key &&  key >= this._data[iLow][k]) break
					iHigh++
					iLow++
				}
				deltaKey = Math.abs(this._data[iHigh][k] - this._data[iLow][k])
				deltaVal = this._data[iHigh][v] - this._data[iLow][v]
				deltaKeyIns = Math.abs(key - this._data[iLow][k])
				deltaValIns = Math.abs(this._data[iLow][k] - key) / deltaKey * deltaVal
				var insPt:[number,number] = [0,0]
				insPt[k] = key
				insPt[v] = this._data[iLow][v] + deltaKeyIns / deltaKey * deltaVal
				this._data.splice(iLow, 0 , insPt)
			}
		} else {
			if (key < this._data[0][k]) this._data.unshift(this._data[0])
			else if (key > this._data[this._data.length-1][k]) this._data.push(this._data[this._data.length-1])
			else {
				iHigh = 1 // points to larger value
				iLow = 0 // points to smaller value
				while (iHigh < this._data.length) {
					if (this._data[iHigh][k] >= key &&  key >= this._data[iLow][k]) break
					iHigh++
					iLow++
				}
				console.log (iLow, iHigh, key, this._data)
				deltaKey = Math.abs(this._data[iHigh][k] - this._data[iLow][k])
				deltaVal = this._data[iHigh][v] - this._data[iLow][v]
				deltaKeyIns = Math.abs(key - this._data[iLow][k])
				deltaValIns = Math.abs(this._data[iLow][k] - key) / deltaKey * deltaVal
				var insPt:[number,number] = [0,0]
				insPt[k] = key
				insPt[v] = this._data[iLow][v] + deltaKeyIns / deltaKey * deltaVal
				this._data.splice(iHigh, 0 , insPt)
			}
		}
	}
	
	public insertAtPointReverse = this.insertAtPoint 
	
	public insertAtIdx(i:number) {
		
		var deltaKey, deltaVal, deltaValIns, deltaKeyIns, startKey, startVal;
		var k = this.isVertical ? 1 : 0	
		var v = this.isVertical ? 0 : 1
		if (i < 0) {
			// insert first point as animation start point
			this._data.unshift(this._data[0])
		} else if (i >= this._data.length - 1) {
			var last = this._data[this._data.length - 1]
			this._data.push(last)
		} else {
			startKey = this._data[i][k];
			startVal = this._data[i][v]
			this._data.splice(i,0, this.isVertical ? [startVal, startKey] : [startKey, startVal])
		}	
	}
	
	public insertAtIdxReverse(i:number) {
		var deltaKey, deltaVal, deltaValIns, deltaKeyIns, startKey, startVal;
		var k = this.isVertical ? 1 : 0	
		var v = this.isVertical ? 0 : 1	
		if (i < 0) {
			// insert first point as animation start point
			this._data.push(this._data[this._data.length - 1])
		} else if (i >= this._data.length - 1) {
			this._data.unshift(this._data[0])
		} else {
			var i1 = this._data.length - i - 1
			startKey = this._data[i1][k];
			startVal = this._data[i1][v]
			this._data.splice(i1,0, this.isVertical ? [startVal, startKey] : [startKey, startVal])
		}	
	}
}