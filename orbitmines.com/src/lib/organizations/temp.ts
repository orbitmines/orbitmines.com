
const string = "### Literary Exposure\n" +
  "- [String Diagram Rewrite Theory II: Rewriting with Symmetric Monoidal Structure](https://arxiv.org/abs/2104.14686) ; *Filippo Bonchi, Fabio Gadducci, Aleks Kissinger, Pawel Sobocinski, Fabio Zanasi*\n" +
  "- [ChypCanvas: Composing Hypergraphs, Proving Theorems (2023)](https://act2023.github.io/papers/paper25.pdf) ; *Aleks Kissinger*\n" +
  "- [Observer Theory (2023)](https://writings.stephenwolfram.com/2023/12/observer-theory/) ; *Stephen Wolfram*\n" +
  "- :wasm: [Wasm SpecTec: Engineering a Formal Language Standard](https://arxiv.org/pdf/2311.07223.pdf) ; *Joachim Breitner, Philippa Gardner, Jaehyun Lee, Sam Lindley, Matija Pretnar, Xiaojia Rao, Andreas Rossberg, Sukyoung Ryu, Wonho Shin, Conrad Watt, Dongjun Youn*\n" +
  "\n" +
  "- :youtube: :mindscape: [Mindscape 259 | Adam Frank on What Aliens Might Be Like (2023)](https://www.youtube.com/watch?v=UzmlA3g2nRE) ; *Adam Frank and Sean Carroll*\n" +
  "- :youtube: [Animation vs. Physics (2023)](https://www.youtube.com/watch?v=ErMSHiQRnc8) ; *Alan Becker + Team*\n" +
  "- :youtube: :3b1b: [Why light can “slow down”, and why it depends on color | Optics puzzles (2023)](https://www.youtube.com/watch?v=KTzGBJPuJwM)\n" +
  "- :youtube: :lex_fridman_podcast: [Lee Cronin: Controversial Nature Paper on Evolution of Life and Universe | Lex Fridman Podcast #404 (2023)](https://www.youtube.com/watch?v=CGiDqhSdLHk) ; *Lee Cronin, Lex Fridman*\n" +
  "- :youtube: :topos_institute: [Berkeley Seminar: David Jaz Myers, 8/7/2023 (2023)](https://www.youtube.com/watch?v=WvniD62U_W4) ; *David Jaz Myers*\n" +
  "\n" +
  "- [Yugoslavia’s Digital Twin (2023)](https://www.thedial.world/issue-9/yugolsav-wars-yu-domain-history-icann) ; *Kaloyan Kolev*\n" +
  "- [Physics explains why there is no information on social media (2021)](https://www.zdnet.com/article/physics-explains-why-there-is-no-information-on-social-media/) ; *Tiernan Ray*\n" +
  "- [How To Ask Questions The Smart Way (2001-2014)](http://www.catb.org/~esr/faqs/smart-questions.html) ; *Eric S. Raymond, Rick Moen*\n" +
  "\n" +
  "- :wikipedia: Wikipedia Articles: [Computability_in_Europe](https://en.wikipedia.org/wiki/Computability_in_Europe), [Elvira_Mayordomo](https://en.wikipedia.org/wiki/Elvira_Mayordomo), [Geoff_Smith_(mathematician)](https://en.wikipedia.org/wiki/Geoff_Smith_(mathematician)), [Louis_Kauffman](https://en.wikipedia.org/wiki/Louis_Kauffman), [Nicolas_Gisin](https://en.wikipedia.org/wiki/Nicolas_Gisin), [Parallel_transport](https://en.wikipedia.org/wiki/Parallel_transport), [Single_pushout_graph_rewriting](https://en.wikipedia.org/wiki/Single_pushout_graph_rewriting), [Terence_Tao](https://en.wikipedia.org/wiki/Terence_Tao)\n" +
  "\n" +
  "### :twitch:/:youtube: Livestreams\n" +
  "- :youtube: :semf: [Complexity & Mathematics | Community Livestream (2023)](https://www.youtube.com/watch?v=MWQ7XFjkOhs)\n" +
  "- :youtube: :semf: [Holiday Special Livestream (2023)](https://www.youtube.com/watch?v=m_rATW4Nrqk)\n" +
  "\n" +
  "- :youtube: [Just Chatting | Tesla AI Day 2022 | Science & Technology (2022)](https://www.youtube.com/watch?v=lSXwIzww6Us) - *George Hotz*\n" +
  "- :youtube: [Programming | Mistral mixtral on a tinybox | AMD P2P multi-GPU mixtral-8x7b-32kseqlen (2023)](https://www.youtube.com/watch?v=H40QRJFzThQ) - *George Hotz*\n" +
  "- :youtube: [Programming | what is the Q* algorithm? OpenAI Q Star Algorithm | Mistral 7B | PRM800K (2023)](https://www.youtube.com/watch?v=2QO3vzwHXhg) - *George Hotz*\n" +
  "- :youtube: [Just Chatting | effective accelerationism | e/acc | Techno-pessimism | Deceleration (2023)](https://www.youtube.com/watch?v=YrWEDOQQ8pw) - *George Hotz*\n" +
  "- :youtube: [Science | Thermodynamics is to Energy as ??? is to Intelligence (2023)](https://www.youtube.com/watch?v=vn9Dq24RDn8) - *George Hotz*\n" +
  "- :youtube: [Science | Thermodynamics is to Energy as Entropics is to Intelligence | Part 2 (2023)](https://www.youtube.com/watch?v=mEoiQ_PZNTE) - *George Hotz*\n" +
  "- :youtube: :tinycorp: [Programming | a tiny tour through tinygrad (noob lesson) (2023)](https://www.youtube.com/watch?v=-MhwhiReY-s) - *George Hotz*\n" +
  "- :youtube: :tinycorp: [Programming | tinygrad: writing tutorials for noobs (2023)](https://www.youtube.com/watch?v=Sk35MKtCXfQ) - *George Hotz*\n" +
  "- :youtube: :tinycorp: [Rant | Complaining about how terrible Qualcomm is | The business world (2023)](https://www.youtube.com/watch?v=rzb2cuT9vaY) - *George Hotz*\n" +
  "- :youtube: :tinycorp: [Chatting | challenges hiring people, vision, building a company tiny corp tinygrad.org (2023)](https://www.youtube.com/watch?v=4_6eY-8dibI) - *George Hotz*\n" +
  "- :youtube: :tinycorp: [Reading & Talking | let's read ML papers (2023)](https://www.youtube.com/watch?v=YrWEDOQQ8pw) - *George Hotz*\n";

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
      .replaceAll(/[|&':{}()#",?*$%^@;\[\]/\\.\"\']/g, "")
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