// Registers the `ray.txt` grammar against prism-react-renderer's Prism.
// Side-effect import: pulling this file in once anywhere ensures the grammar
// is available to every <Highlight language="ray.txt"> on the page.
import { Prism } from 'prism-react-renderer';

if (!Prism.languages['ray.txt']) {
  Prism.languages['ray.txt'] = {
    'string': {
      pattern: /"(?:\\.|\{[^{}]*\}|(?!\{)[^\\"])*"/,
      inside: {
        'interpolation': {
          pattern: /\{[^{}]*\}/,
          inside: {
            'punctuation': /^\{|\}$/,
            'expression': {
              pattern: /[\s\S]+/,
              inside: null, // patched below
            },
          },
        },
      },
    },
    'comment': {
      pattern: /(\/\/.*)|(\/\*.*\*\/)/,
      greedy: true,
    },
    'number': /(-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b)|(\bU\+([a-fA-F0-9]+)?\b)|(\b0x([a-fA-F0-9]+)?\b)/i,
    'bp5-text-muted': /(\\)|(\bas\b)|#|@(?=\s)|%|--|\+\+|\*\*=?|&&=?|x?\|\|=?|[!=]==|<<=?|>>>?=?|x?[-+*/%^!=<>]=?|\.{3}|\?\?=?|\?\.?|~/,
    'punctuation': /[{}[\],()]|=>|:|[|&.⸨⸩]|[⊣⊢∙⊙₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾]/,
    'keyword': {
      pattern: /\b(?:this|static|end|class|namespace|dynamically|internal|none|confidential|managed|assert|read|write|execute)\b|[0-9a-f-]{36}/,
      greedy: true,
    },
    'access': {
      pattern: /@[a-zA-Z0-9_]*/,
      greedy: true,
    },
    'builtin': /\b(?:goto|branch|if|elsif|else|assume|boolean|Number|String)\b/,
    'boolean': /\b(?:false|true)\b/,
    'class-name': /[A-Z][A-Za-z0-9_]+/,
    'variable': /[a-z0-9_]+/,
  };

  (Prism as any).languages['ray.txt']['string'].inside['interpolation'].inside['expression'].inside =
    Prism.languages['ray.txt'];
}

export {};
