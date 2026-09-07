/**
 * SPARC — 175 GALAXIES, THEIR ROTATION CURVES, AND THEIR BARYONS, AS PUBLISHED.
 *
 * Lelli, McGaugh & Schombert 2016 (AJ 152:157) is the catalogue behind both of the
 * measurements this file carries: the radial acceleration relation and the baryonic
 * Tully–Fisher relation. It is borrowed entirely — a measurement of the sky, and none
 * of it is the model's to derive — so what is here is the CDS/VizieR tables reduced by
 * the published recipe and nothing else.
 *
 *     https://vizier.cds.unistra.fr/viz-bin/asu-tsv?-source=J/AJ/152/157/table1
 *     https://vizier.cds.unistra.fr/viz-bin/asu-tsv?-source=J/AJ/152/157/table2
 *
 * WHY THE DATA AND NOT A FITTED CURVE. Until this file existed the article compared
 * its interpolation against McGaugh et al.'s FITTING FUNCTION and reported that the
 * two curves agree to 0.029 dex. That is a true statement about two formulae and a
 * weak one about the world: a fit is a summary, its residuals have already been
 * thrown away, and a curve that tracks another curve has not met a single galaxy.
 * Here the points themselves are compared, with their own scatter, so the number that
 * comes out — 0.1333 dex rms against the fit's 0.1328 — is a measurement.
 *
 * TWO CUTS, BOTH THEIRS. Rotation-curve quality flag Q < 3, inclination ≥ 30°, and
 * points whose velocity error exceeds 10% dropped: 2,696 points in 147 galaxies,
 * against the 2,693 in 153 McGaugh, Lelli & Schombert 2016 (PRL 117:201101) quote.
 * The three-point difference is a boundary case in the error cut and is not worth
 * chasing; nothing below moves by more than 0.0002 dex if it is chased.
 */

import { G_NEWTON, MSUN } from "./TRANSPORT";

/**
 * THE RADIAL ACCELERATION RELATION, POINT BY POINT — 2,696 pairs, encoded.
 *
 * Each point is (log g_bar, log g_obs) in m/s², written as two base-36 digits apiece
 * at a resolution of 0.005 dex: `i = round((L + 13)·200)`, high digit first. Four
 * characters a point, ten kilobytes for the whole relation, and the quantisation adds
 * 0.0014 dex in quadrature to a scatter of 0.13 — invisible in every number below.
 *
 * A BLOB IS NOT VERBATIM, so here is exactly what generated it, and it is two lines of
 * arithmetic on the two tables named above:
 *
 *     g_obs = V_obs² / R
 *     g_bar = (V_gas|V_gas| + Υ_d·V_disk|V_disk| + Υ_b·V_bul|V_bul|) / R
 *
 * with SPARC's own mass-to-light ratios at 3.6 µm, Υ_d = 0.5 and Υ_b = 0.7, and R in
 * metres. The velocity contributions are signed because a gas disc with a hole in it
 * pulls outwards, which is why |V| appears rather than V².
 *
 * NOTHING IN THIS RELATION DEPENDS ON G. Both axes are V²/R — a length and a speed
 * each — so the comparison below is between accelerations the telescope measured and
 * accelerations the photometry implies, and the gravitational constant never enters.
 * The Tully–Fisher half is the one that needs it.
 */
const RAR_B36 =
  "919z84ad96cn7cac6vao6aag5oad54a4bjcab8cfarcgacck9vcm9gcn92co8ocp8acr7wcp7kcn77ch6vc96jc2" +
  "aveaate1aodt9lc595ck8xcp8mco8hcp8ecm84ch7pcb7ac56vbt6gbfb5chb9cgb7cab1c6asc6alc4aec5a6c9" +
  "9zc99tc79nc79jc89fc99dc69bc498c295by91by8xbw8pbx8ibs89bo81bk7sbh7lbd7cb9c9czbud2b9dfb3dt" +
  "are6afdva3dq9tdg9icy8ycg90cl8xc88qby8cbk7tba75b5e5f8e1fmdng1dbg2d9gedagddgghdngbdkg5dafy" +
  "cxfqckfid7fjdufje2g5d8g2d5fud2fxcxg6cefrbvflbef9b6f1b0evatepaceja8ekb6f4azfcamf0a5eu8hec" +
  "hgg4gxhmgphtgqiwgxj8h0j9gyjdgyjdgvj2gpiygiipgaieg2i8fqi1fhhufbhnf4hgethaeih1e6gwdvgqdmgl" +
  "degid5gicygecpgachg3cafy8kdl8mdh8hdda9cnalejakewafetafepabds9vdh9odlamgbakg4abfya1fshcg2" +
  "ggfof8fseufndpfzd3fzcjfvbufsarfka2fc8ken9odl9fdb99d38scr82cdbif1avf8aif5aceva8ela1ef9ye8" +
  "9re29qdv9rdp9qdj9pde82cn7qdi7pdp7udt7vdq82dt86do88dg8vd38nc8a5dc9xd99qd59pdc9ecx9bd19acz" +
  "8ycz6x8x7zb182b281b57xbg7pba84b489bd88bc8abe8bbg8fbn8ibt8gbt8fbt8dbv8fc18fbt88bs89c48dbz" +
  "8cc1kdh6jii4iuiwifjci5j7hsiyhfiwh7iuh3inh0imgwifgri3glhygfhsgahrg2hifwhjfshbfphafjh8fdh5" +
  "f8h0f2gsevgteogfeggle8g6e3g9e0g6dqfxdkg19ibc9nbm9rbx9tc79scd9lc19cbx8vbledibegi5ehi3eji0" +
  "elhzenhyeohzeohuenhuelhseihvefhoechqeahne7hoe4hlazeza4em9bee8le4c6dbc3dac0dhbydrbwdwbsdu" +
  "bndtbhdpbcdrb7drb2doazdkaudeandbagd3a8cya0cv9vcq9rcp9ocjcgeaceefcbegc9ekc5eobweqbmenbdei" +
  "b4edaue5aje19ydw9sdu9lds99do94dmage7axeqazf4ayezazesazekazecaxe7aue2are2aqe0apdyaqdzaqe0" +
  "apdzaqdzapdyapdyaodxalduahdsaddoa6dk9zdi9rdi9jddg9hdetgsdsg5cwfccaembve4bhdxb2e2audxaodr" +
  "afdma7dg9xda9od29ecu95cn8xcf8oc68dbr82bn7tbs7kbncdf3c7f3c5ezc1f2btf2bkfgbbfab5ezawenanee" +
  "ajeaa5dw9ndv9gdx96ds8wdlkek4kdk4kalck4l2jtkngyhtfbgie9fldmf1cuehbzdybcdnaxddnqntlykmldkb" +
  "khjxjnjfj0j2igiqhyighki7h3hzgphrgdhhfzh8fqh0ffgtf4gneugdekg7e0f8dzfcdmf4daezcxexcbesbver" +
  "bkeob7eaavdzaidsa8dea0d99sd49kd19dcx96cx8ycz8tcv8kct8ccv81ct7uck7ncf7fcc77cc6xca6vc96pc6" +
  "6jc36lc56wc46wbz72bx79byhchdgfhefzhqfphefdgvf2guepg9ekgee4fwdsfhdff7d3f2csewcheoc7ejbyee" +
  "bpe9bje3bcdyb6dub1dqavdkg2hqgohxgzi8h2iigyiiguikgoiggki7ggi3gehzgci2gci2gbhxgbhxgbhygchs" +
  "gbhrgahqgahpg9hjg7hfg2hcfyh7fuh5fph1flgyfhgxfegvfbgwf8grf6gof5gpf3gtf1gwf0gweygxevh1etgz" +
  "eigpe7gkdwggdlgadag4d0fycsfsckfmcdfic7ffc2fabwf4brf0bnexbiewbdesb9esb4epazematejaoegajee" +
  "aeeba8e7a3e69ye39se39ne19idx9cds98ds95ds92do8zdljak1hwiwg6hsf6gydzfod1fqc8esbjdwaedo9xda" +
  "9icykkllk9lkjzlgjqlajil5jbkxj4kuiykriskniokjikkfigkdick7i9k4i6k2i2jzhyjvhujthpjphljmhiji" +
  "hfjhhbjeh8jagxj4gaiofmi7f2hremhieah9dxh0digsd3gjcrgdcgg7c8g0c1ftbvfkbofdbhf8b9f6b0f5arf3" +
  "ajf3aeexaaeua7eua4eqa0ep9wepliktl1ktknkkkcl0kckskjkmkgkmkdkek3k6jrjzizjei7ivhgidgti0gaho" +
  "fthffeh5f0gwengoeagfdxg6dlfzdbfsd0focrfichfcc9f8c1f0btetblepbfeqb8ela9g59sfq9ffa95f88yf3" +
  "8seq8kek8cei7te57odw7ldx7kdp7idg7ddi7adi78dg76dc74de71de6zd96wd9lwmqlmlvl8lkl0lckoknkakb" +
  "jxk8jkjwj8jgizixipiqiiizidiohsi9hjifh9icgvi0g9hkfuh9fdgsexgbegg0e1foddeve1f2e6f8eafieefs" +
  "ehfyelg3epg8evg2f1g4f6gifcgwfjh1foh2fth2fwh3g0h5g1h9g1hbfoh3fch5f2grhlk0i0jrgti4fih3ehg8" +
  "dgfncrf7c6esbmefb1dw5iaj8bc28mcm8ucx8xd48sd28pdd8mdd8ldb8jdc8cdc85d882da80d97zdb7xdb7ydb" +
  "7ydd7ud87pd47kd3f8gmezgkepguepgpeugsezguf3gtf4gqf5gvf5gwf5guf4gsf3gsf2gpezgoetgmecgcdxg3" +
  "dmfzdefud6fncnfbc0evbiekb5edare3afdsa4dk9vdc9ld49bd093cw8wcr8qcn8lck8icg8acbmemom7mnm1mh" +
  "lqm3lglyl8lsl4lnkylgkwldksldkml4kfkwk9kqk3kik0kgjwkbjtk6jpk4jmk1jjjzjgjwjcjrj7jpj2jmirjg" +
  "imjbibj3i6j1hpirgahufchaejgrduged5g2gdglg8glfygmflgoezg6eifre4fbdlenc1e8axe0agdua2dl9wde" +
  "99d88mcw85cd7qc27dcc72ca6yc46wcd6vch6qcf6ic86gc56bc466c25yc05pbu5gbn57bmgfgrf4g8e1fwd5fe" +
  "cceubme9awdq7qc37cbr70bdghi4g7i6g3i0g6hsgfhhgfhag9h2g2gvfvgnfigef7g6jxjzigj6hjipgfhxfkh9" +
  "eqgsdwgbd5fqclfdc6evcxesd3fqdegjdmgadrg7dqg5dng3dhfyd7frd1fkctfcckf6cbf0bxetbnepbaeiisj6" +
  "iiizi8iihhi4guhtg7hki9jchmixh5ijgxi5gkhqg5hcfoh1f4gke6gne4gne2gldugfe0g8e0g5dmg3d6fycpfp" +
  "g9ijfvhvf6hbejgrdng7ctfec4f4bierazefenfnecfodzfpdpftdifzdbfrd2fgcof3c9ethoiphiichai1h2ht" +
  "gthmgjheg6h4fsgvfdgnf0giepgdefg7e6fydwfcdnf7dff5d6f3cyf0crewcjetccesc6etc0erbtemboeibjeh" +
  "bfegbbegb6egb1efawedareaane8aie4aedya9dsgeh7fuh5g2h3fyglf8fxelfjazctb3d0hsh3h6hngrhlghh6" +
  "fwguf6glhnhzi4huhwhnh2h6gegnfvg5f5fqejfde0f1dieycyesgni2gaidgciggoiegsi8gpi0g9hrfthgfbh7" +
  "eugzefgse5gkdug9dkg1d9ftd0flcrfeckfecaf9c2exbtehbkedbce9b4e7jsk0hbiqfhhecuf1irioi5iohmi7" +
  "h6hngeh1fogkf0g5eeftdyfidhf9d0f3cpeyccesbyenbmefbaebczfvckfrckfscifhcgfacdf5cdf1ccexc3eq" +
  "brecble4b6dyatdqaidiabdea0db9pd59kcz9bcv91cul5i4l0j1klivjsimj2i7ifi3hwhshghlgyheghh6g2gz" +
  "fogqfcghezg8eofyedfre3fmdufifdgdfbggf9gbf0g1eoftedfie1fcdrf9dkf6def2d6excwescoeqcgemc7ei" +
  "bzeebse9bne7bhe4bbe0b7dvb3drb0doawdiaudgaqddand8ajd4aed0o4nnn0mjm5lzlmlol8l7kwl5kiktk4ki" +
  "jtk8jejxj0jninjdibj5i1iwhqiohdihh0icofnolpl7k3k5isjdhqish0icg0hpf7h6eigsdxgedhg4d6fwctfp" +
  "cgfec1f6bmerbaeeaxe1aldxabdra1do9rdll7kzknkfkak5jmjkj5j3itiuijinibigi0i7hpi0hfhtgdh4fjgl" +
  "erg2dyfmd9f5cmepc4ecboe2bbdtawdnaldfaad8a2d39scy9jco98chl6mcjdknifjohwiyheifh4i4gyhpgqh8" +
  "gagwfxgifig5exfredfcdvetdeehcxebcie5c4dxbrdwergcevgaeofcegewe9epe3ekduepdnemdhehd6eqcsey" +
  "ccf1c4esbvekbieib7eiauecaie6abe0a4du9vdl9ndc9ed7grjaghigg8i2fuhjf9gzergmecgcdyfwdffmd0fi" +
  "crf2cderc3ekbqecbgecb5e6awe0andxahdqhikch0k2gkk1gbjvg5jog2jkfzjkfwjefvj9fwj8fvj1ftixfqir" +
  "fmimfjiffei7fai3f6hwf1htexhmeqhjelhkegheechae8h8e3h7dzh6dvh1dsgxdngwd9gkcugackg0g8h4gii7" +
  "grj1ggj1g7ijg2i8g0i7g1igg4ikg7ihg9idg9i8g8i4g4hufyhmfqhcfjh5feh8fah0eggcdmfpdefmd6fjcyff" +
  "cpfdchfac8f5c1f2bsezbkexbcesb6erazeoasemalefage8aae0a4dw9zdn9ydp9ndq9gdh99dn93dem7ljldlm" +
  "kmkzk2k8jkjpj7j5iuisihiri5iihui4hli4hchsh5hmgzhaguhbgph7ggh1gbgzfrgif3g6ehfvdxfddif6huii" +
  "hlhzgmhmfnh8esgse3g8difvd1flclfcc6f2btevbiepb7ekaxeeapeaahe4a8dxa0dq9sdp9kdk9ede96da8zd6" +
  "8sd18mcz8gcv8acu84cq7ycr7tckhdjpg6ikf2hhe4gqdcg1clfjbyf1bfenaxebafe3a1e09odv9adm8vdgcxhg" +
  "qrpkmsm6l0kuk7kgjjjmj0j7ipj0ilipidili6iehzifhsiehoifhliehhiahgi6hbi2h4hxgzhtgvhpgohjgihf" +
  "gahbg2h6fxh1fsgxfogrfhgnfcgjf6gef2gdewgdergaemg8ehg5eeg2e9fze5fxe2fwdyftdvfodqfidlfedhf9" +
  "def7d4f4d0ezcwewcsetcpescleqciesceepcceollkzlekvl8kqkwkfkkk7kck0k0jsjqjlj5j7ijiui2ifhni6" +
  "h8hxgwhnglhfgah6fzgyfrgrfjgmfdgif6geexgbepg8ejg3ebfye3ftdwfrdpfpdhfldbfkd4fdcyfacsf9cnf5" +
  "chf5cbf1g6hbfzh5fth0fph1fogyfngzfph0frh2fsh0fnh3fhh3feh0fagtf6gsf2grexgteth0engteigsecgr" +
  "e7gldlfxciexc5efbse2prpcmrmmkzl4jqk8iqjlhwj4h6iogkibg0hyfihlf2haenh1e7gtdvgndjggd7gacxg5" +
  "cng0b9f5a8ex9men9ae997dt95dp91dk8xdb8td38ncu8kcp8bci7wcb7mc07ebs74bs6tbq6ibo67bd5wbc5naz" +
  "boeuc5epc5fjc1febufoayedaidn9md4b0e5a9e39gdl8acw5tdv6ve66qds7udo7vdg7wdb8gd696d39ecy9acq" +
  "96ch8xca9tcv9icy8lcr7tci9gdq9edk95de8td78td28scxb5gobfg5bbfsb4f7akeqa9ef9ye69edyiekdidkc" +
  "ibkah7j8gaiifii4evhse5hcdigucygccffxbzfmblfeb7f6auf0aieva5eqmanmkhl4ikjfgli0fhhcezh0eigk" +
  "e0g6dkfwd8fncwfgchfbc8f7c3f4bveybletbceob5ejaxeem7mqlzm6ltlplnl9lekul0kikukbkpk6kejvk2jm" +
  "jrjdjgj6j6j1iviwiliricinibini4ikhwihhpidhiiahbi7h5i4gzi0gthwgphugohtgihpgdhlg9hig4hefmh0" +
  "fjgxevgeebg3dvfqdefacweocee5bzdubldlpeqtp8q5oxpmoop7ofoto7oho0o8ntnynmnqninkndndn8n7n3n2" +
  "mzmxmvmsmqmnmmmkmimgmemdmam9m6m6m2m3lym1lvlylrlwlolulllrlhlplflnlclmlalkl8lil6lhl4lfl2le" +
  "l0lckylbkwlakfl0kdl0kbkzkakyk3kvjwkrjukrjtkqjskpjqkojpknjnknjjkljgkjjfkijekhjckhjbkgjakf" +
  "j9kfj8kdj7kdj6kcj5kbj3kaj0k8izk7irk3iqk2ipk1iok0injzimjzi7jnhtjchij0h7ipgvifggi5g2hxfrhq" +
  "fghlf5hfevh9emh3ecgxe3gqdugkdmgedeg9d6g4czg0ctfvcnfschfocbfkc5fhbzfebufbbpf9bkf6bff4baf0" +
  "b6ewb2etaxeqateoapeoaleoahenadema9eka1ed9uea9nedlildknkwkdktixkciok9ihk6ibk3i8k0i5jxi3ju" +
  "hzjrhwjnhujjhsjfhqjbhoj7hlj3hiizhfivheiuhcirh5ijh1iegyibgui6gri2gjhvfnh7euguetguengsekgq" +
  "ejgpeggnedglebgke9gje8gidpg4d8fscrficcf7bwexbieqarena8efmwm8m9lslzlllqlfl0kvkxktjjjjibih" +
  "hfhxgqhog8hgfoh5f7gsetgleggbe2g0dpfrdbfjcxfbcff2bzevb6ejjoi6jfhsj9hhj1h9ith2imgxidgti5gq" +
  "hygphrgnhdgnh7gnh2gngxgngsgngogngjgngfgmgaglg6gkg1gietfrdqf0cyevchescfercdeqcaepcaepbsed" +
  "bde1azdualdra9dp9ydl9ndi9ddh8pcz84cla8dq9xdo9tdm9qde9hde9adi8ve18ne38pe78zec97eh9oejb4ek" +
  "b9ekb4ekb9g3brgwc9gvcgggcefzc3fmbqfbbcexaod9ahdaa7cp9vco9mck9cc7bie8bbedbce3b0dxapdqabdi" +
  "a7d8a0d0ptqxpipyp2p9oporoaocnynznonpnenfn3n5mwmymomrmgmkmamfm3m9lwm4lrlylmlulhlpldlml9li" +
  "l6ldl2lakzl7kvl3ksl0kokwklkukikrkfkokbklk8kik5kgk2kdjykajvk8jsk6jpk3jmk1jlk0jjjzjfjxjajs" +
  "j6jqj4joj1jminjdikjbijjaiij9ifj7idj6ibj4i9j3hsiqh4iaglhxfyhlffhbezh2ekgte8gmdxgfdng8d3fv" +
  "clfic4f3boelb9e7awe0amdvaddqa2dobrdmbpe1bgdwb4dtaudra7ec9idw91dk8ude8qd98qd58pcx8jcm8bcb" +
  "7zc47lc1fhhuf3hsenh9e7h2dxh9dkhhdchhcth2cagtbqglb3g5aofma6f99tey9lep9ieh9fe997e38ydx8qdt" +
  "8mcc93cm77ej8veo98f39hf49ses9xeo9veg9oe09bdb8xd29dcs9ucya7cxa8d1a4d18fcl82cb81c482c0dieq" +
  "d2fodbg5doghdhgjd7gld1ghctgacdg2bwfsbjfkb1f9aleza9eoa5efb0esb5eqayeqasemakeba9e29ydwb0fs" +
  "ajfbajf0aeet9ven9uel9xeh9xe89ye19zdva0dp9tdm9bdf95d6k9jvgegsftgdfig6fag0f4fub7ebb0e7a7do" +
  "96cw5uec7heh8peq8rep94eh8zeb92e18pdslklrl8likylaidjui9jri5jpi2jmi1jlhzjkhxjihvjghujehsjb" +
  "hqj9hoj7hlj4hij3hgj0hdizhaixh4ish2iqgzioguilgtikg1i5f4hpenhiemhhejhfeehddrgyd6glcngbc5g3" +
  "bpfvbaflauf9ahf0a4ex9uelq4q6pmpop6p5oroooeobo3nzntnqnknhncn8n4mzmwmlmilymblmm4ldlyl7krkr" +
  "jykgjtkdjkk9jhk6jck4j9k2j5jzj1jxipjoiijjifjgicjeiajdi7jai4j8i0j6htj2hmizhkizhiixhgiwhgix" +
  "heiwhcivhaivgxisgkiogiiogfimfyidfii0f5hmeth9eigye7gpdwgjdnghdegfd5gfcxgfcqgdckgaceg8c8g6" +
  "c2g3bwg0bqfxbhfqb7fkayfiarfgaafbavcwaddra4dv9qda9ddedqfnczfkcjfoccfmc2febtf5bnevbfeob6ej" +
  "b3eib2ecd5fgcof6caesc0ejcefqbyf7brerbhefbae6b2dwaodja2d89sd3dbgjcgg3bufmbkffb7f4b3exb4ev" +
  "auenameialefahe4abdua5dq9xdj9oddbqd6bjd9bbdgb4deaudaald4add2a3d29xd1bacwahch9yc698bz94bq" +
  "91bl90bi9dba96b18sat8mak7xadcsecd8fbd1g0cwfocnfbcceybweobvejboecbje6bge3d3fmckg1d3fqc4f1" +
  "biejaue9afdwacdmcfe2cae9cbeacaelcbercfepcbemc3eidkh3d1hcc8h6brgsbegeayg4aifuaafoa6fj9wff" +
  "9idi9idk9hdj9odh9qdn9tdu9wdy9zdza0dx9yds9wds9sdo9mdl9kdj9ldi9mdh9ndd9pdd9rd99td59wd49xd4" +
  "9xd29xd19xd09wd09tcncuf0cef9bxfgbwfibkfcazezaaem9seg9he798e38xdyfdgye9gmd5fqcfevbqe9b3dq" +
  "aidab5fmb6g8bgg7bjfvb7fkb1faavf2asewaqeraceka1ed9le89ce29hdx98ds93dneahjegh4e4h0dpgxd8gp" +
  "csgfcgg5c5fwbsfnbhfebbf7b5f0atetaiema5eg9qe99je89ee397dy90dt8tdp8sdl8odg8ddc89d786d27zcx" +
  "7scv7ocq7lcpb7ejbnfgbgf1aweha0e294dq8odi8gdd8nda8ud08pcsnhmwmsmjm4m6lklwl2llkmlak9kzjwkn" +
  "jlkdj9k2iyjrgbhtg7hsg3hqg0hpfxhpfuhofrhnfohlfmhkfkhifihhfhhfffhdfdhcfbhaf3h3ezh1ewgyetgw" +
  "e9gidjg0czfncfffbyf8bif1b3euaiel97awa7bmagc5a9coa6coa4cih8f3gnfsg2g1fmg1fgfrf2fjeqfeeefa" +
  "e7f7dzf2dqeydjeyd9ewcxercnemcieec9e6bze3btdwbkdnozpmohomnxnxnfndmzmxmkmjm7m8lulylklplclg" +
  "l5l9kyl2kqkwkjkqkbklk4kgjxkbjrk7jkk3jfjzjajwj0jpiwjmirjjipjiimjgiijdidjai5j4i0j2hnithjir" +
  "hgiogviagsi7goi5g2hofhh7ewgteggge1g5dnftd9ficwf8cieyc6epbvehbmedbdeab3e7aue5ane2ahdyaads" +
  "a3dl9wde9qd79kd39fcz9acw95cs90co8vcj8qch8lcf8ccd7yc7b3eoavelame5asdqamdea4d2hxgwi0gzhwhx" +
  "hqiahkibhfikhbithdinhhichpi5hwiehxiehsijhpiihoihhmiehkikhhifhfi9hciah4i5gnhwgehng9hkg0hd" +
  "fph3fbgjewgaehg7e4g2dsfndgfqd3fmctfgckf8deefd4dmcmdabrd08wd097cq99ck8mca83c1o0omnsohnmof" +
  "niocndo7n9o4n5o0n0nxmvnrmqnnmmnjminfmdnam9n6m5n1m1mxlwmtltmplqmllnmilmmhlkmelhmblem8lcm6" +
  "l6m0kyltkllikilgkdlbkclakbl9k6l5k4l3k1l1jzkzjsktjrksjpkrjnkpjlknjjkljhkjjfkhjdkgjbkej9kc" +
  "j7kaj5k9j3k8j1k6j0k5izk5iyk4iwk2ipjyinjximjwiejshrjkh5jdf6jbf0iletiaesi2eohtejhoebhbe6h4" +
  "e2gzdvgudmgmdcggd2gecsg0ckfvceftc9fqc3fkbvfcbmf4bfezb7erb2ehayehaweeare9ase3atdz9jdt9le1" +
  "9bds90do8ydh8uda8zd593d098cu97cq93cn92cg8ycaadefa7ej9xeh9te79fdz9bdt97dl8tdh8td98pd38ncz" +
  "8rcv8xcs92cs96cu97ct9vcxaddea2dg9ide8qd17scr6vcb";
const D36 = "0123456789abcdefghijklmnopqrstuvwxyz";
const un36 = (s: string, i: number) =>
  (D36.indexOf(s[i]) * 36 + D36.indexOf(s[i + 1])) / 200 - 13;

/**
 * WHICH GALAXY EACH POINT BELONGS TO, run-length encoded — 147 counts, two base-36
 * digits each, in catalogue order.
 *
 * WITHOUT THIS THE POINTS ARE NOT INDEPENDENT AND NOTHING SAYS SO. A distance or an
 * inclination error moves a whole galaxy up or down the relation together, so the 0.13
 * dex of scatter is mostly ONE number per galaxy repeated across its points rather
 * than 2,696 independent draws. Marginalising an offset per galaxy takes the residual
 * scatter from 0.133 dex to 0.069 — and a search for a feature at a fixed acceleration
 * that did not do that would be quoting an error bar roughly twice too small.
 */
const RUNS_B36 =
  "0201050e030b0q09070c0e060s0308040b050c0a080m0v080k0k0g0q0m0g0d0i0z0m200b1e0w0l0o0l0a0l11" +
  "0y0c0j0a0b0a0g0608090909100602060b0o040g0k0i0t0h0m0r0j0n0j0x180n0u0e011i100p0i0l08040c04" +
  "06080h0j15351a0m130f08060820050b0k020a05040f070e0a08151w050b04090f090c0b0206080a0r0b070g" +
  "0u0b12060k1v060z04051p0s0d0g07";

/** the relation, decoded once: accelerations in m/s², not logs */
export type RarPoint = { gbar: number; gobs: number; galaxy: number };
export const RAR: RarPoint[] = (() => {
  const runs: number[] = [];
  for (let i = 0; i < RUNS_B36.length; i += 2)
    runs.push(D36.indexOf(RUNS_B36[i]) * 36 + D36.indexOf(RUNS_B36[i + 1]));
  const out: RarPoint[] = [];
  let g = 0, left = runs[0];
  for (let i = 0; i < RAR_B36.length; i += 4) {
    while (left === 0 && g < runs.length - 1) left = runs[++g];
    out.push({
      gbar: Math.pow(10, un36(RAR_B36, i)), gobs: Math.pow(10, un36(RAR_B36, i + 2)),
      galaxy: g,
    });
    left--;
  }
  return out;
})();

/** how many galaxies the relation is drawn from */
export const GALAXIES = () => 1 + RAR.reduce((m, p) => Math.max(m, p.galaxy), 0);

/** how far a law sits from the points it is being asked about, in dex */
export const rarResidual = (law: (gbar: number) => number) => {
  let s = 0, ss = 0;
  for (const p of RAR) {
    const d = Math.log10(p.gobs / law(p.gbar));
    s += d; ss += d * d;
  }
  return { mean: s / RAR.length, rms: Math.sqrt(ss / RAR.length), n: RAR.length };
};

/**
 * THE BARYONIC TULLY–FISHER SAMPLE — 123 galaxies, verbatim from table 1.
 *
 * The 123 are the ones with a measured flat rotation velocity (V_f > 0), a quality
 * flag under 3 and an inclination of at least 30°, which is the cut Lelli, McGaugh,
 * Schombert, Desmond & Katz 2019 (MNRAS 484:3267) make for their fiducial relation —
 * and it lands on the same 123 galaxies they report.
 *
 *     name, V_f (km/s), its error, L[3.6] (10⁹ L☉), M_HI (10⁹ M☉)
 *
 * The baryonic mass is theirs too: M_b = Υ_*·L[3.6] + 1.33·M_HI at Υ_* = 0.5 M☉/L☉,
 * the 1.33 being helium. Every column is measured; the model's part is the line drawn
 * through them.
 */
export type Btfr = { name: string; vf: number; e: number; L36: number; MHI: number };
const ROW = ([name, vf, e, L36, MHI]: [string, number, number, number, number]): Btfr =>
  ({ name, vf, e, L36, MHI });
export const BTFR: Btfr[] = ([
  ["UGC02487",    332.0,   3.5,  489.955,  17.963], ["ESO563-G021",  314.6,  11.7,  311.177,  24.298],
  ["NGC5985",     293.6,   8.6,  208.728,  11.586], ["UGC02885",    289.5,  12.0,  403.525,  40.075],
  ["UGC11914",    288.1,  10.5,  150.028,   0.888], ["NGC2841",     284.8,   8.6,  188.121,   9.775],
  ["UGC11455",    269.4,   7.4,  374.322,  13.335], ["UGC02953",    264.9,   6.0,  259.518,   7.678],
  ["NGC5005",     262.2,  20.7,  178.720,   1.280], ["NGC6195",     251.7,   9.3,  391.076,  20.907],
  ["UGC06787",    248.1,   4.8,   98.256,   5.030], ["IC4202",      242.6,  11.0,  179.749,  12.326],
  ["NGC6674",     241.3,   4.9,  214.654,  32.165], ["NGC3992",     241.0,   5.2,  226.932,  16.599],
  ["NGC7331",     239.0,   5.4,  250.631,  11.067], ["UGC12506",    234.0,  16.8,  139.571,  35.556],
  ["UGC09133",    226.8,   4.2,  282.926,  33.428], ["NGC3953",     220.8,   6.1,  141.301,   2.832],
  ["NGC0801",     220.1,   6.2,  312.570,  23.201], ["UGC03205",    219.6,   8.6,  113.642,   9.677],
  ["UGC06786",    219.4,   7.8,   73.407,   5.030], ["NGC7814",     218.9,   7.0,   74.529,   1.070],
  ["NGC0891",     216.1,   5.7,  138.340,   4.462], ["NGC5907",     215.0,   2.9,  175.425,  21.025],
  ["NGC3521",     213.7,  15.9,   84.836,   4.154], ["UGC05253",    213.7,   7.1,  171.582,  16.396],
  ["NGC2998",     209.9,   8.1,  150.902,  23.451], ["NGC5371",     209.5,   3.9,  340.393,  11.180],
  ["UGC06614",    199.8,  16.0,  124.350,  21.888], ["UGC03546",    196.9,   7.4,  101.336,   2.675],
  ["NGC5033",     194.2,   3.6,  110.509,  11.314], ["NGC4157",     184.7,   7.2,  105.620,   8.226],
  ["NGC2903",     184.6,   5.6,   81.863,   2.552], ["UGC02916",    182.7,   6.9,  124.153,  23.273],
  ["UGC08699",    182.4,   6.9,   50.302,   3.738], ["NGC4217",     181.3,   7.2,   85.299,   2.562],
  ["NGC5055",     179.0,   4.9,  152.922,  11.722], ["ESO079-G014",  175.0,   3.5,   51.733,   3.140],
  ["NGC3893",     174.0,   8.9,   58.525,   5.799], ["NGC4013",     172.9,   7.1,   79.094,   2.967],
  ["NGC4088",     171.7,   6.9,  107.286,   8.226], ["NGC3877",     168.4,   5.1,   72.535,   1.483],
  ["NGC3726",     168.0,   6.2,   70.234,   6.473], ["NGC1090",     164.4,   3.7,   72.045,   8.783],
  ["NGC0289",     163.0,   8.0,   72.065,  27.469], ["NGC3949",     163.0,   7.1,   38.067,   3.371],
  ["NGC6946",     158.9,  10.9,   66.173,   5.670], ["NGC4100",     158.2,   5.0,   59.394,   3.102],
  ["NGC4051",     157.0,   5.5,   95.268,   2.697], ["NGC6015",     154.1,   7.0,   32.129,   5.834],
  ["NGC2683",     154.0,   8.1,   80.415,   1.406], ["UGC09037",    152.3,   9.6,   68.614,  19.078],
  ["NGC3198",     150.1,   3.9,   38.279,  10.869], ["NGC4138",     147.3,   5.9,   44.111,   1.483],
  ["F571-8",      139.7,   4.3,   10.164,   1.782], ["NGC3917",     135.9,   4.1,   21.966,   1.888],
  ["NGC3972",     132.7,   2.9,   14.353,   1.214], ["NGC4085",     131.5,   4.8,   21.724,   1.349],
  ["NGC2403",     131.2,   4.9,   10.041,   3.199], ["UGC00128",    129.3,   2.8,   12.020,   7.431],
  ["UGC03580",    126.2,   3.2,   13.266,   4.370], ["NGC4010",     125.8,   4.7,   17.193,   2.832],
  ["NGC4559",     121.2,   5.1,   19.377,   5.811], ["NGC3769",     118.6,   8.4,   18.679,   5.529],
  ["NGC6503",     116.3,   2.4,   12.845,   1.744], ["UGC05986",    113.0,   4.1,    4.695,   2.667],
  ["F568-V1",     112.3,  15.8,    3.825,   2.491], ["NGC4183",     110.6,   5.4,   10.838,   3.506],
  ["NGC1003",     109.8,   4.2,    6.820,   5.880], ["ESO116-G012",  109.1,   3.1,    4.292,   1.083],
  ["UGC06983",    109.0,   5.8,    5.298,   2.967], ["UGC06917",    108.7,   3.5,    6.832,   2.023],
  ["UGC06930",    107.2,   5.1,    8.932,   3.237], ["NGC0024",     106.3,   7.9,    3.889,   0.676],
  ["NGC0247",     104.9,   8.0,    7.332,   1.746], ["UGC07399",    103.0,   3.3,    1.156,   0.745],
  ["UGC05005",     98.9,   7.2,    4.100,   3.093], ["F574-1",       97.8,   4.1,    6.537,   3.524],
  ["NGC0300",      93.3,   7.0,    2.922,   0.936], ["UGC04278",     91.4,   4.8,    1.307,   1.116],
  ["UGC04325",     90.9,   2.7,    2.026,   0.678], ["NGC5585",      90.3,   2.4,    2.943,   1.683],
  ["NGC0100",      88.1,   6.4,    3.232,   1.990], ["UGC02259",     86.2,   2.9,    1.725,   0.494],
  ["F583-1",       85.8,   3.6,    0.986,   2.126], ["NGC0055",      85.6,   5.0,    4.628,   1.565],
  ["NGC2976",      85.4,   3.3,    3.371,   0.172], ["UGC06399",     85.0,   3.8,    2.296,   0.674],
  ["UGC06667",     83.8,   3.1,    1.397,   0.809], ["F571-V1",      83.6,   3.5,    1.849,   1.217],
  ["NGC2915",      83.5,   6.3,    0.641,   0.508], ["UGC08286",     82.4,   2.3,    1.255,   0.642],
  ["UGC06446",     82.2,   4.3,    0.988,   1.379], ["UGC05721",     79.7,   6.6,    0.531,   0.562],
  ["UGC06923",     79.6,   2.5,    2.890,   0.809], ["UGC07524",     79.5,   3.6,    2.436,   1.779],
  ["UGC08490",     78.6,   3.8,    1.017,   0.720], ["UGC07261",     74.7,   3.4,    1.753,   1.388],
  ["UGC07151",     73.5,   2.8,    2.284,   0.616], ["UGC00731",     73.3,   2.3,    0.323,   1.807],
  ["UGC05716",     73.1,   1.2,    0.588,   1.094], ["UGC04499",     72.8,   2.4,    1.552,   1.100],
  ["UGC12632",     71.7,   2.8,    1.301,   1.744], ["UGC10310",     71.4,   3.9,    1.741,   1.196],
  ["UGC06818",     71.2,   4.0,    1.588,   1.079], ["IC2574",       66.4,   2.0,    1.016,   1.036],
  ["DDO161",       66.3,   1.9,    0.548,   1.378], ["NGC3109",      66.2,   2.6,    0.194,   0.477],
  ["UGC07125",     65.2,   2.1,    2.712,   4.629], ["UGC07603",     61.6,   2.8,    0.376,   0.258],
  ["DDO170",       60.0,   1.6,    0.543,   0.735], ["D631-7",       57.7,   2.7,    0.196,   0.290],
  ["UGC07690",     57.4,   3.2,    0.858,   0.390], ["UGC08550",     56.9,   1.9,    0.289,   0.288],
  ["UGCA442",      56.4,   2.1,    0.140,   0.263], ["UGC01281",     55.2,   3.5,    0.353,   0.294],
  ["DDO168",       53.4,   1.9,    0.191,   0.413], ["NGC3741",      50.1,   2.1,    0.028,   0.182],
  ["DDO154",       47.0,   1.0,    0.053,   0.275], ["DDO064",       46.1,   3.9,    0.157,   0.211],
  ["UGCA444",      37.0,   4.8,    0.012,   0.067], ["KK98-251",     33.7,   1.6,    0.085,   0.115],
  ["UGC09992",     33.6,   3.3,    0.336,   0.318],] as [string, number, number, number, number][]).map(ROW);

/** SPARC's own recipe, in kilograms */
export const baryonicMass = (g: Btfr) => (0.5 * g.L36 + 1.33 * g.MHI) * 1e9 * MSUN;

/**
 * THE ORTHOGONAL FIT, which is the one the BTFR is always quoted with.
 *
 * Both axes are measured and neither is the independent one, so a least-squares fit in
 * y alone is the wrong estimator — it is biased shallow by exactly the scatter in x,
 * and the slope is the whole question here. Minimising perpendicular distance instead
 * is a principal-axis problem and closed-form. Uniform weights: SPARC's per-galaxy
 * errors are dominated by the distance, which is common to both axes and cannot be
 * put on one of them, so weighting by V_f alone would be worse than not weighting.
 */
export const orthogonalFit = (xs: number[], ys: number[]) => {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let sxx = 0, syy = 0, sxy = 0;
  for (let i = 0; i < n; i++) {
    sxx += (xs[i] - mx) ** 2; syy += (ys[i] - my) ** 2; sxy += (xs[i] - mx) * (ys[i] - my);
  }
  sxx /= n; syy /= n; sxy /= n;
  const slope = (syy - sxx + Math.sqrt((syy - sxx) ** 2 + 4 * sxy * sxy)) / (2 * sxy);
  const intercept = my - slope * mx;
  let s = 0;
  for (let i = 0; i < n; i++)
    s += ((ys[i] - intercept - slope * xs[i]) / Math.sqrt(1 + slope * slope)) ** 2;
  return { slope, intercept, scatter: Math.sqrt(s / n) };
};

/** log V_f and log M_b, the two axes the relation is drawn on */
export const btfrAxes = () => ({
  x: BTFR.map(g => Math.log10(g.vf)),
  y: BTFR.map(g => Math.log10(baryonicMass(g) / MSUN)),
});

/**
 * WHAT THE MODEL PREDICTS, AND IN WHICH DIRECTION IT IS AN INEQUALITY.
 *
 * Deep in the transport regime g → √(g_N a₀), so V⁴ = G·M_b·a₀ exactly: slope four,
 * and a normalisation A = 1/(G a₀) with nothing free in it. But V_f is measured at the
 * outermost radius a telescope reached, not at infinity, and the law sits ABOVE its
 * own asymptote everywhere — so the observed V_f exceeds the asymptotic one and the
 * measured A = M_b/V_f⁴ must come out BELOW 1/(G a₀). The prediction is therefore a
 * ceiling rather than a value, and the size of the gap says how far from asymptotic
 * the flat parts of real rotation curves are.
 */
export const btfrCeiling = (a0: number) => 1 / (G_NEWTON * a0) * 1e12 / MSUN;
