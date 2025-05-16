// import { $ } from "bun"
// import postmanToOpenApi from "postman-to-openapi"

// const postmanCollection = './sandbox.json'
// // Output OpenAPI Path
// const outputFile = './sandbox-oa.yaml'

// const result = await postmanToOpenApi(postmanCollection, outputFile, { defaultTag: 'General' })

// await $`bunx @redocly/cli bundle sandbox-oa.yaml --dereferenced -o sandbox-oa.json`

// await $`bunx openapi-typescript ./sandbox-oa.yaml  -o ./types/sandbox.d.ts`
// await $`bunx openapi-typescript ./world-engine-oa.json  -o ./types/world-engine.d.ts`