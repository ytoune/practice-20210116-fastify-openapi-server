import { promises as fs } from 'fs'
import * as path from 'path'
import * as generator from '@himenon/openapi-typescript-code-generator'
import * as ts from 'typescript'
import type { Converter } from '@himenon/openapi-typescript-code-generator'

const main = async () => {
	const targetDir = path.join(__dirname, 'gen')
	await fs.mkdir(targetDir, { recursive: true }).catch(Boolean)
	const content = generator.generateTypeScriptCode({
		entryPoint: path.join(__dirname, 'openapi.json'),
		option: { makeApiClient },
	})
	await fs.writeFile(path.join(targetDir, 'index.ts'), content)
}

const { stringify: e } = JSON

const makeApiClient: Converter.v3.Generator.MakeApiClientFunction = (
	context: ts.TransformationContext,
	codeGeneratorParamsList: Converter.v3.CodeGeneratorParams[],
): ts.Statement[] => {
	const statements: ts.Statement[] = []
	const methods = codeGeneratorParamsList.map(
		({ operationId, responseSuccessNames, successResponseContentTypes }) => {
			if (!operationId) throw new Error('operationId is required.')
			const returnType = responseSuccessNames
				.map((m, i) => `${m}[${e(successResponseContentTypes[i])}]`)
				.join(' | ')
			return `${operationId}(...args: Args): Promise<${returnType}>\n`
		},
	)
	const source = ts.createSourceFile(
		'hoge',
		`export interface IService<Args extends unknown[]> { ${methods.join('')} }`,
		ts.ScriptTarget.ES2019,
		false,
		ts.ScriptKind.TS,
	)
	for (const s of source.statements) statements.push(s)
	return statements
}


main().catch(x => {
	console.error(x)
	process.exit(1)
})