import type { BunRequest } from "bun"
import type * as zod from "zod"

export async function validateSchema<T>(zodSchema: zod.ZodSchema<T>, req: BunRequest): Promise<T | Response> {
  // Untyped, but returns an Object: https://developer.mozilla.org/en-US/docs/Web/API/Request/json#return_value
  let searchParams = URL.parse(req.url)?.searchParams
  let body = {}
  
  if (req.method == 'GET') {
    if (searchParams) {
      let searchParamsBody = Object.fromEntries(searchParams.entries())
      if (Object.keys(searchParamsBody).length > 0) {
        body = searchParamsBody
      }
    }
  }
  else if (req.headers.get('content-type') === 'application/x-www-form-urlencoded') {
    // formData() is not deprecated: https://github.com/oven-sh/bun/issues/18701#issuecomment-2981184947
    body = Object.fromEntries((await req.formData()).entries())
  }
  else if (req.headers.get('content-type') === 'application/json') {
    let text = await req.text()
    if (text != '') {
      body = JSON.parse(text)
    }
    // else if (searchParams) {
    //   let searchParamsBody = Object.fromEntries(searchParams.entries())
    //   if (Object.keys(searchParamsBody).length > 0) {
    //     body = searchParamsBody
    //   }
    // }
  }
  // Allow both search params in URL and JSON body
  // `fetch()` in browser forbids data in body on GET requests
  console.log(req.url)
  console.log(req.method)
  console.log(body)

  const result = zodSchema.safeParse(body)
  if (!result.success) return Response.json({ message: 'Invalid API body' }, { status: 400 })

  return result.data
}
