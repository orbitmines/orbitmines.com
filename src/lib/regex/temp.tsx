export const CSSStyles = /style="(([A-Za-z0-9-]+):([A-Za-z0-9-., ()%]+);?)+"/;
  // style="(.*)" -> replace: style={{$1}}
export const CSSStylesProperty = /([A-Za-z0-9-]+):([A-Za-z0-9-., ()%]+);?/;
  // replace: '$1': '$2',

// hyph-case to snakeCase -([a-z]) -> \U$1


