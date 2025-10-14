import normalizeUrl from "normalize-url"

// https://developers.cloudflare.com/rules/normalization/how-it-works/
// Need to normalize things like trailing slashes at root level (sometimes relevant when non root)
// Sort query strings, etc...
// TODO: We should also handle: https://publicsuffix.org/list/public_suffix_list.dat
// Try to normalize as little as possible!
export function normalizeURLForLink(url: string) {
  return URL.parse(normalizeUrl(url, {
    removeTrailingSlash: false, // don't strip trailing slashes unless root level
    stripWWW: false,
    stripTextFragment: true
  }))!
}
