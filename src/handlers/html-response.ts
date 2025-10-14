export function htmlResponse(html: string) { 
  return new Response(html, { headers: { "Content-Type": "text/html" } })
}