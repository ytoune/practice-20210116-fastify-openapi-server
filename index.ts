import * as fs from 'fs'
import * as path from 'path'
import Fastify from 'fastify'
import openapiGlue from 'fastify-openapi-glue'
import { service } from './service'

const json = fs.readFileSync(path.join(__dirname, 'openapi.json'), 'utf-8')
const specification = JSON.parse(json)

const app = Fastify({ logger: true })
app.register(openapiGlue, {
	specification,
	service,
	noAdditional: true,
})

app.setErrorHandler((error, req, reply) => {
	const message = error.statusCode ? error.message : 'internal server error.'
	console.error(error)
	reply.status(error.statusCode || 500).send({ message })
})

export const main = async () => {
	app.listen(3000, (x, address) => {
		x ? console.error(x) : console.log(`read on ${address}`)
	})
}

main().catch(x => {
	console.log('# something happens.')
	console.error(x)
	if ('undefined' === typeof process) return
	process.exit(1)
})
