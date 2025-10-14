

// adapted from lodash
const reUnescapedHtml = /[&<>"'`]/g
const reHasUnescapedHtml = RegExp(reUnescapedHtml.source)

/** Used to map characters to HTML entities. */
const htmlEscapes = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '`': '&#96;'
}

export function escape(string: string) {
  return (string && reHasUnescapedHtml.test(string))
    ? string.replace(reUnescapedHtml, (k) => htmlEscapes[k as keyof typeof htmlEscapes])
    : string;
}

const symbol: unique symbol = Symbol('Template')
export class Template {
  private [symbol]: boolean = true

  constructor(readonly _html: string) {}

  static is(v: unknown): v is Template {
    return v instanceof Template && v[symbol]
  }

  // TODO: could preserve indentation level as an option
  static html(strings: TemplateStringsArray, ...values: any[]): Template {
    const out = strings.reduce((acc, str, i) => {
      const v = values[i]
      if (v == null) return acc + str
      if (Template.is(v)) return acc + str + v._html
      if (Array.isArray(v) && v.every(Template.is)) {
        return acc + str + Template.convertTemplateArray(v)
      }
      return acc + str + escape(v)    // escape everything else
    }, '')
    return new Template(out)
  }

  static convertTemplateArray(v: Template[]): string {
    return v.map(x => {
      if (Template.is(x)) return x._html
      return escape(String(x ?? ''))
    }).join('')
  }
  
  render = () => this._html

  static render(v: Template | Template[]): string {
    if (Array.isArray(v) && v.every(Template.is)) {
      return Template.convertTemplateArray(v)
    } else {
      return v.render()
    }
  }
}

export type TemplateRenderable = Template | Template[] | string

export function raw(html: string): Template {
  return new Template(html)
}

export function html(strings: TemplateStringsArray, ...values: any[]): Template {
  return Template.html(strings, ...values)
}

export function render(v: Template | Template[]): string {
  return Template.render(v)
}

