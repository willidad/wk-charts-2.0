import { IMargins } from './../core/interfaces'

export function marginAdd(m1:IMargins, m2:IMargins):IMargins {
	return {top:m1.top + m2.top, bottom:m1.bottom + m2.bottom, left: m1.left + m2.left, right: m1.right + m2.right}
}

export function marginMax(m1:IMargins, m2:IMargins):IMargins {
	return {top:Math.max(m1.top, m2.top), bottom:Math.max(m1.bottom, m2.bottom), left:Math.max(m1.left, m2.left), right:Math.max(m1.right, m2.right)}
}