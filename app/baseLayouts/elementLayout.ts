import { Point } from './../core/interfaces'
import { Layout } from './layout'

export class ElementLayout extends Layout {
	
	protected startPos = ():Point[] => {
		var range = this.keyScale.getRange()
		var interv = range.length > 1 ? Math.abs(range[1] - range[0]) : undefined //TODO something more meainingful
		var seq:Point[] = []
		var rangeIdx = 0
		var targetPos
		for (var point of this.diffSeq) {
			var op = point[0]
			var key = point[1]
			var val = this._prevValues[key] || this._values[key]
			seq.push({
				keyPos: this.calcKeyPos(key, range, rangeIdx, interv), //rangeIdx < range.length ? range[rangeIdx] : range[range.length-1] + interv,
				key: key,
				valPos: this.mapVal(val),
				value: val,
				added: op === '+'
			})
			if (op !== '+') rangeIdx++
		}
		console.log('startPos', seq)
		return seq
	}
	
	protected endPos = ():Point[] => {
		var range = this.keyScale.getRange()
		var interv = range.length > 1 ? Math.abs(range[1] - range[0]) : undefined //TODO something more meainingful
		var seq:Point[] = []
		var rangeIdx = 0
		for (var point of this.diffSeq) {
			var op = point[0]
			var key = point[1]
			var val = this._values[key] || this._prevValues[key]
			seq.push({
				keyPos: this.calcKeyPos(key, range, rangeIdx, interv), 
				key: key,
				valPos: this.mapVal(val),
				value: val,
				deleted: op === '-'
			})
			if (op !== '-') rangeIdx++	
		}
		console.log('endPos', seq)
		return seq
	}
}