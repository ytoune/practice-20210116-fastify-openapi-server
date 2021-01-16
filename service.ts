import type { FastifyRequest as Req, FastifyReply as Rep } from 'fastify'
import type * as Api from './gen'


const list: Api.Schemas.user[] = [
	{ id: 1, name: 'alice', email: 'alice@example.com' },
	{ id: 2, name: 'bob', email: 'bob@example.com' },
	{ id: 3, name: 'carol', email: 'carol@example.com' },
	{ id: 4, name: 'dave', email: 'dave@example.com' },
	{ id: 5, name: 'ellen', email: 'ellen@example.com' },
]

class HttpError extends Error {
	readonly statusCode: number
	constructor(code: number, message: string) {
		super(message)
		this.statusCode = code
	}
}

export const service: Api.IService<[Req, Rep]> = {
	getUsers: async req => {
		const prms = req.query as Api.Parameter$getUsers
		if (prms.email) return list.filter(s => s.email === prms.email)
		return list
	},
	postUser: async req => {
		const body = req.body as Api.RequestBody$postUser['application/json']
		if (list.some(s => s.name === body.name || s.email === body.email))
			throw new HttpError(400, 'already exists.')
		const next = {
			id: list.length + 1,
			name: body.name,
			email: body.email,
		}
		list.push(next)
		return next
	},
}
