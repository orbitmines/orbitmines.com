
const string =
  ""

const res = string.split('\n')
  .filter(l => l.startsWith('-'))
  .map(l => l.trim())
  .map(l => {
    const [title, year, link] = [...l.matchAll(/\[(.+)\s(.+)]\((.+)\)/g)]
      .map(m => [m[1], m[2], m[3]])[0];
    const organizations =  [...l.matchAll(/:([a-z_]+):/g)]
      .map(m => m[1]);
    // .map(key => (ORGANIZATIONS as any)[key]!);
    const authors = [...l.matchAll(/\*(.+)\*$/g)]
      .map(m => m[1])
      .join()
      .replaceAll(/(\s(and|&)\s)/g, ",")
      .split(",")
      .map(name => name.trim());

    const ref = title
      .replaceAll(/[|&':{}()#",?*$%^=@;\[\]/\\.\"\']/g, "")
      .replace(/\s{2,}/g, ' ')
      .replaceAll(/[- ]/g, "_")
      .toUpperCase();

    return `${ref}: <Content>{
      reference: {
        title: '${title}',
        authors: [${authors.map(author => `{name: '${author}'}`).join(',')}],
        organizations: [${organizations.map(org => `ORGANIZATIONS.${org}`)}],
        year: '${year}',
        link: "${link}"
      }, status: Viewed.VIEWED, viewed_at: "2023, December"
    }`
    // return `REFERENCES.${ref}`;
  }).join(',\n')
console.log(res);