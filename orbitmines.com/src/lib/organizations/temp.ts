
const string =
  "### Literary Exposure\n" +
  "- [Solving SAT via Positive Supercompilation (2024)](https://hirrolot.github.io/posts/sat-supercompilation.html) ; *Tima Kinsart (Hirrolot)*\n" +
  "- [Navigating cognition: Spatial codes for human thinking (2018)](https://www.science.org/doi/10.1126/science.aat6766) ; *Jacob L. S. Bellmund, Peter Gärdenfors, Edvard I. Moser, Christian F. Doeller*\n" +
  "- [Towards a structural turn in consciousness science (2024)](https://pubmed.ncbi.nlm.nih.gov/38422757/) ; *Johannes Kleiner*\n" +
  "- [The Glass Bead Game (1970)](https://www.nytimes.com/1970/01/04/archives/the-glass-bead-game-glass-bead.html) ; *Ralph Freedman*\n" +
  "\n" +
  "- :youtube: [An Introduction to Higher Arity Science (2021)](https://www.youtube.com/watch?v=62UFbGsj5Jg) ; *Carlos Zapata-Carratalá*\n" +
  "- :youtube: [History of Science and Technology Q&A (February 28, 2024)](https://www.youtube.com/watch?v=kNXXksujIHM) ; *Stephen Wolfram*\n" +
  "- :youtube: [GReTA seminar: Higher-Arity Algebra via Hypergraph Rewriting (2024)](https://www.youtube.com/watch?v=ZBjagJvNEn8) ; *Carlos Zapata-Carratalá*\n" +
  "- :youtube: :semf: [Workshop | Axiomatic Creation (2024)](https://www.youtube.com/watch?v=StNfdknDQ9c)\n" +
  "- :youtube: :semf: [Community Livestream | Axioms & Creativity (2024)](https://www.youtube.com/watch?v=9ddJAJaYk_E)\n" +
  "- :youtube: :semf: [Concept Collider | Geometry of Data and Neural Correlates (2024)](https://www.youtube.com/watch?v=mROz1U4VkGY)\n" +
  "- :youtube: :wolfram: [Wolfram Physics Project: Working Session - Causal Multiway Systems (2020)](https://www.youtube.com/watch?v=OXSE6KhRUF4) ; *Stephen Wolfram, Jonathan Gorard*\n" +
  "- :youtube: :wolfram: [Science Research Session: Hyporuliad (2023)](https://www.youtube.com/watch?v=lZaBjuHk7Ms) ; *Stephen Wolfram, Jonathan Gorard*\n" +
  "- :youtube: :wolfram: [A conversation between Bob Coecke and Stephen Wolfram (2021)](https://www.youtube.com/watch?v=8CUTXaGqvSQ) ; *Bob Coecke, Stephen Wolfram*\n" +
  "\n" +
  "- [Steve Jobs (2011)](https://en.wikipedia.org/wiki/Steve_Jobs_(book)) ; *Walter Isaacson*\n" +
  "- :youtube: [John Cleese on Creativity In Management (2017)](https://www.youtube.com/watch?v=Pb5oIIPO62g) ; *John Cleese*\n" +
  "- :youtube: [The Trillion Dollar Equation (Veritasium)](https://www.youtube.com/watch?v=A5w-dEgIU1M) ; *@Veritasium*\n" +
  "- :youtube: [Steve Jobs President & CEO, NeXT Computer Corp and Apple. MIT Sloan Distinguished Speaker Series (1992)](https://www.youtube.com/watch?v=Gk-9Fd2mEnI) ; *Steve Jobs*\n" +
  "- :youtube: [Carl Sagan at MIT - Management in the Year 2000: Sloan School Symposium (1987)](https://www.youtube.com/watch?v=gLOZsTMuars) ; *Carl Sagan*\n" +
  "- :youtube: [Chamath Palihapitiya (SocialCapital) @ Startup Grind (2015)](https://www.youtube.com/watch?v=ncjum-bkW98) ; *Chamath Palihapitiya*\n" +
  "- :youtube: [Chamath Palihapitiya speaking at Waterloo Innovation Summit (2016)](https://www.youtube.com/watch?v=D82_ppT2iic) ; *Chamath Palihapitiya*\n" +
  "- :youtube: :all_in: [All-In Podcast E165 (2024)](https://www.youtube.com/watch?v=FHO4hoXc75k) ; *Chamath Palihapitiya, Jason Calacanis, David Friedberg, David O. Sacks*\n" +
  "- :youtube: :all_in: [All-In Podcast E164 (2024)](https://www.youtube.com/watch?v=bUuEE2jmP2c) ; *Chamath Palihapitiya, Jason Calacanis, David Friedberg, David O. Sacks*"

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

    // return `${ref}: <Content>{
    //   reference: {
    //     title: '${title}',
    //     authors: [${authors.map(author => `{name: '${author}'}`).join(',')}],
    //     organizations: [${organizations.map(org => `ORGANIZATIONS.${org}`)}],
    //     year: '${year}',
    //     link: "${link}"
    //   }, status: Viewed.VIEWED, viewed_at: "2023, December"
    // }`
    return `REFERENCES.${ref}`;
  }).join(',\n')
console.log(res);