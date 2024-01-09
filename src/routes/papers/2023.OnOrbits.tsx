import React from 'react';
import JetBrainsMono from "../../lib/layout/font/fonts/JetBrainsMono/JetBrainsMono";
import {Row} from '../../lib/layout/flexbox';
import ORGANIZATIONS, {Content, Viewed} from "../../lib/organizations/ORGANIZATIONS";
import {useNavigate} from "react-router-dom";
import Paper, {PaperProps} from "../../lib/paper/Paper";
import BR from "../../lib/paper/layout/BR";
import Section from "../../lib/paper/layout/Section";
import Reference, {useCounter} from "../../lib/paper/layout/Reference";
import {PROFILES} from "../../profiles/profiles";
import {ON_INTELLIGIBILITY} from "./2022.OnIntelligibility";
import Arc from "../../lib/paper/layout/Arc";
import Link from "../../lib/paper/layout/Link";
import {renderable} from "../../lib/typescript/React";
import {Divider, Intent, Tag} from "@blueprintjs/core";
import {CachedVisualizationCanvas, VisualizationCanvas} from "../../@orbitmines/explorer/Visualization";
import {Center} from "@react-three/drei";
import {Block} from "../../lib/syntax-highlighting/CodeBlock";
import {
  BinarySuperposition,
  Continuation,
  Curve, Line, Loop,
  RenderedRay, torus,
  Vertex
} from "../../@orbitmines/explorer/OrbitMinesExplorer";
import {Ray} from "../../@orbitmines/explorer/Ray";
import {HorizontalLine} from "../../lib/paper/PaperContent";
import CustomIcon from "../../lib/layout/icons/CustomIcon";
import REFERENCES from "../../profiles/FadiShawki/FadiShawki";

export const ON_ORBITS: Content = {
  reference: {
    /**
     * Orbits: Equivalence at Continuations
     * Equivalence: Variance made Invariant (Ignored Variance)
     * Inconsistencies: Variance
     *
     *
     * Equivalence ; Pattern matching, Assumption, Variance made Invariant (Ignored/Deemed Irrelevant/../Dropping/pruning/deleting Variance), Symmetry, Invariance, Consistency, Equality, Equivalence, Superposition, Well-defined/Ignored Ambiguity, Duplication, Parallel, Persistence, Coherence, Same, Similar, Complete, Memory, Inertia, Intuition, Fidelity, Reproducibility, Stability, Isomorphism, Reversibility, Deterministic (Identifiably mechanistic/Predictable/High-fidelity - Decreasing Perceived Randomness/Arbitrariness - Perhaps eliminating/Reducing superpositions/../ambiguity), Holonomic system, Constant, Fixed Point, Halting, Orbits, Copy, Redundancy, Caching, (Ignored implementation details), Translation, Compiling/Supercompilation/.../Meta-Compilation - differently ignorant on certain scales, Undirected, (multi-/arbitrarily complex structured-/)Computational,Non-distinguishability, Analogy, Distill, Confluence, Termination, Predictability (High fidelity), Lossless, Compression, Attention - Ignorance of something, Ignorance, Survivability, Cast, Interpretability, Fidelity Checking, Dimension, Continuation, Generalize, Universal, Sorting
     *
     * Inconsistency ; Variance, Assumption Violation, Hacking/Vulnerability, Divergence, Anomaly, Separability, Forgetting ((Realized) temporal non-trivial inability to resolve references), Refuting, Deleting, Evolution, Unintended/Accidental/Irrelevant Variance, Non-consistency, Non-modelled effects, Unknowns, Uncertainty, Asymmetry, Inequality, Sequence, Time/Temporary, Incoherence, Difference, Incomplete, Non-deterministic (if assumption violated), Non-holonomic system, Gravity, Curvature [ref; Inability to categorize with some small set of variables - Jonathan Gorard's tweet], Change, Selection, Ill-defined, Ambiguous, Confusion, Undefined, Sparsity?, Transformation, Describing, Separability, Directed, Movement, Propagation, Distinguishability, Inhibition, Pointer, Encapsulation, Transduction, Lacking access, Furthering, Obsoleting, Enhancing, Fallibility, View, Traversal
     *
     * Structure, Configuration, Selection, Symbol, Token, Connection, Communication, Possibilities, Enumeration, Spatially/Space, Time, Arbitrary Naming / Labelling, Functions, Morphisms, Rewrite Rule, Rays, Dynamics, Movement, Processes, Systems, Generative, Generators, Superposition, Encoding, Property, Value, Path, Hierarchy, Tree, Program, History, Causality, Version-Control, Instance, Object, Phrasings, States, Constructions, Worlds, Universe, Background, (Non-/)Context, Frame, Reference, Overlap, Merge, Cardinality, Node, Strategy, Tactic, Sheaf, Foliation, Slice, Type, Static/Dynamic, Knowledge, Squared, Defaults, Extreme, Abstraction, Simulation, Emulation, Projection, Heuristics, Inhibition, Regulation, Conjecture, Redundancy, Density, Property, Relation, What-if, Phase, Definition, Encompass, (Positional) Encodings, "Different levels of description", Levels, Scales, Complexity, Data, Runtime, Vibration, Arbitrary, Random, Limited/Limit/Limitations, Constraints, Resources, Pressure, Priority, Interpreted, Interacted, Observed, Initial, Terminal, Result, Conclusion, Fluidity, Output (Realized change by the system), Layer
     * Distance, Locality, Closeness, Approximation, "Practical Equivalencing/.../Ignoring", (Computational) Effort, Complexity, Relevance, Non-trivival superposition (e.g. any equivalence), Impreciseness, Less Actionability, Trivial/Non-trivial, Conditionally (Circular), Guarded, Partial, Skipping, Teleporting, Encryption, Disambiguation
     *
     * TODO ; Composability is Non-locality?
     * TODO ; Encoding is usually Ignorant of its use
     *
     * ; These are just the same sort of thing from different perspectives, you need additional context for separation of concepts/.../duals - And separation is likely somewhat arbitrary and inconsistent - but that doesn't prevent them from being useful.
     */
    title: "On Orbits, Equivalence and Inconsistencies",
    subtitle: "A preliminary exploration through the world of possible inconsistencies. Originally intended as a more technical continuation of earlier thoughts on intelligibility.",
    draft: false,
    link: 'https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies',
    year: "2023",
    date: "2023-12-31",
    external: {
      discord: {serverId: '1055502602365845534', channelId: '1190719376085766195', link: () => "https://discord.com/channels/1055502602365845534/1190719376085766195/1190719376085766195"}
    },
    organizations: [ORGANIZATIONS.orbitmines_research],
    authors: [{
      ...PROFILES.fadi_shawki,
      external: PROFILES.fadi_shawki.external?.filter((profile) => [
        ORGANIZATIONS.github.key,
        ORGANIZATIONS.twitter.key,
        ORGANIZATIONS.discord.key,
        ORGANIZATIONS.orcid.key,
      ].includes(profile.organization.key))
    }],
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "December, 2023"
}

const OnOrbits = () => {
  const navigate = useNavigate();

  const referenceCounter = useCounter();

  const OnIntelligibilityReference = <Reference is="footnote" index={referenceCounter()} reference={{...ON_INTELLIGIBILITY.reference}} />;

  const paper: Omit<PaperProps, 'children'> = {
    ...ON_ORBITS.reference,
    subtitle: renderable<string>("", (value: any) => <>
      A preliminary exploration through the world of possible inconsistencies. Originally intended as a more technical continuation of earlier thoughts on intelligibility {OnIntelligibilityReference}.
    </>),
    pdf: {
      fonts: [ JetBrainsMono ],
    },
    Reference: (props: {}) => (<></>),
    references: referenceCounter
  }

  const s2 = 1;

  return <Paper
    {...paper}
    header={<div style={{height: '140px'}}>
      <CachedVisualizationCanvas alt="header" context={paper} style={{
        // position: 'absolute',
        // left: '0',
        // right: '0',
        maxWidth: '100vw',
        height: '140px',
      }}>
        <Center>
          <group scale={s2}>
            <group position={[0, 0, 0]}>

              <group scale={1.5}>
                <RenderedRay reference={Ray.size(1)} scale={1.5 * s2} color="#555555" initial={[-500, 0, 0]}
                             terminal={[500, 0, 0]}/>
              </group>


              <group position={[100, -10, 0]}>
                <group position={[30, 45, 0]}>
                  <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5 * s2}
                                                                         color="#555555"/></group>
                  <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#555555"/></group>
                </group>

                <group scale={1.5}>
                  <Continuation position={[-20, 30, 0]} color="orange" scale={1.5}/>
                  <Continuation position={[20, 30, 0]} color="orange" scale={1.5}/>

                  <group rotation={[Math.PI, 0, 0]}>
                    <Continuation position={[0, -30 + torus.radius, 0]} color="orange" scale={1.5} arc={Math.PI}
                                  radius={20}/>
                  </group>

                  <Vertex color="orange" position={[0, 7, 0]}/>
                </group>
              </group>
              <group>
                <group scale={1.5} position={[300, 0, 0]}>
                  <Loop position={[0, 15, 0]} radius={15} color="orange" scale={1.5 * s2}/>
                </group>
              </group>

              <group rotation={[0, 0, Math.PI / 2]} position={[-100, 60, 0]}>
                <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5 * s2}
                                                                       color="orange"/></group>
              </group>

              <group rotation={[0, 0, Math.PI / 2]} position={[-300, 60, 0]}>
                <group scale={1.5} position={[-60, 0, 0]}><Vertex scale={1.5}
                                                                  color="orange"/></group>
              </group>

            </group>

          </group>
        </Center>
      </CachedVisualizationCanvas>
    </div>}
  >
    <Row center="xs">
      <Section head="A quick gently introduction">
        <span style={{textAlign: 'left', minWidth: '100%'}}>It begins with a slightly unusual way of (visual) thinking. Usually, when one wants to describe some <span
          className="bp5-text-muted">single thing, node, vertex, ..., point</span>, this is done against some assumed background, to draw one's attention to that single thing.</span>

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="naked_point" context={paper}>
            <group scale={1.5}><Vertex color="orange"/></group>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        Clear enough, this could represent any (single) thing. Quite useful, like any abstraction, but there's something
        incredibly easy to ignore - or miss, that it could be a possible question to ask.

        <BR/>

        Imagine a line going from your eyes through this point. Now I could say that the point is no longer the point it
        was before, it has become part of another structure: The line you just imagined. The easy thing to miss being,
        that this was already the case. In order to - point out - this point, you had already constructed this line. It
        was simply ignored, it was simply deemed irrelevant.

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="empty_vertex" context={paper}>
            <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5}/></group>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        This is in short, what this string of text is about. Things, ignored context, and a slightly different way of
        thinking about them.

        <BR/>

        It's quite likely that these ideas are the culmination of having abstracted so far, - blurred together so many
        concepts -, that it might not be too obvious why thinking along these lines could be useful. Allow me to take
        you through this wilderness, and perhaps we might discover something of interest:

        <BR/>

        <span
          className="bp5-text-disabled" style={{textAlign: 'left'}}>For the more inexperienced reader: The important thing in this text, are the visuals. If you understand the visuals, you understand what I'm trying to say. It's perfectly fine not to understand all the sentences in detail.</span>

      </Section>
    </Row>

    <Arc head="Arc: A Visual Introduction to Rays">
      Let's slowly take apart why that example might be a gateway into an incredibly complicated world. Take for instance, that point, but visualized in this unusual way.

      <BR/>

      <Block>
        <CachedVisualizationCanvas alt="empty_vertex" context={paper} >
          <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} /></group>
        </CachedVisualizationCanvas>
      </Block>

      <BR/>

      From the perspective of the visualization, you could think of it this way: I don't know exactly what this point is or how I know about it, but I have a way to 'point' to it. But this isn't quite enough. You might like to say more about its structure - or what that thing is.

      <BR/>

      <Section head="On Continuations" sub="Constructing Continuations - Continuations as Equivalence">
        <span style={{textAlign: 'left', minWidth: '100%'}}>Consider the following: If I have a way of pointing to some node. I could take that pointer and ask: What if there were more points in that direction? This could mean quite a few things. <span className="bp5-text-muted">Whether there's additional points behind the point, or between my eyes and the point. Whether I mean a(n) array, set, line, path, hyperedge, collection, ..., list.</span> As a way of saying: "Whenever I have 'one' of something, I can always say: What if I had more of that thing?".</span>

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="3" context={paper} >
            <Center>
              <group scale={1.5}><RenderedRay reference={Ray.size(3)} scale={1.5}/></group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        This raises several questions. (1) How do you even construct a continuation like that? (2) What does it mean for a continuation to go in a loop? (3) What does it mean to have something in between two points?, ...

        <BR/>

        There's already something we could say about continuing a line, even without much rigor on how to actually construct it. Say we have two points,

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="two_vertices" context={paper} >
            <Center>
              <group>
                <group scale={1.5} position={[-100, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                        color="#FF5555"/></group>
                <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#5555FF"/></group>
              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        In order to connect them together we simply say that the "end" of one point, is the same as the "beginning" of the other point <Reference is="footnote" index={referenceCounter()}>This is, in essence, category theory.</Reference>.

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="2_horizontal_binary" context={paper} >
            <Center>
              <group>
                <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                       color="#FF5555"/></group>
                <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#5555FF"/></group>
                <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#FF55FF"/></group>
              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        But it's not entirely obvious what one even means by that. Let's already assume I have something with which I can construct a line like that. I could say that the two points I'm interested in regarding as "the same" are on a line.

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="2_vertical_pink" context={paper}  style={{height: '140px'}}>
            <Center>
              <group rotation={[0, 0, Math.PI / 2]}>
                <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                       color="#FF55FF"/></group>
                <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#FF55FF"/></group>
              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}}>If I add my two '<span className="bp5-text-muted">ends, extremes, ..., boundaries</span>', which I want to regard as "the same" to this line,</span>

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="2_expanded_continuation" context={paper}  style={{height: '140px'}}>
            <Center>
              <group>
                <group scale={1.5} position={[-30, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                       color="#FF5555"/></group>

                <group scale={1.5} position={[30, -60, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                        color="#5555FF"/></group>

                <group rotation={[0, 0, Math.PI / 2]}>
                  <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                         color="#FF55FF"/></group>
                  <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#FF55FF"/></group>
                </group>

              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        <span style={{textAlign: 'left'}}>Alright, this is already showing something interesting. Imagine this: <span
          className="bp5-text-muted">Tilt, ignore, collapse ..., superpose</span> the line to a point, and we're back at the line. I could rephrase this problem as a shift in perspective. One yields the line, the other the structure above <Reference
          is="footnote" index={referenceCounter()}>(It's not yet obvious how you make this rigorous just yet, but we'll return to that later)</Reference>.</span>

        <BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}}>We could keep <span className="bp5-text-muted">expanding, growing, adding, ..., equivalencing continuations</span>, like we did here,</span>

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="2_double_expanded_continuation" context={paper} style={{height: '120px'}}>
            <Center>
              <group>
                <group scale={1.5} position={[-30, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                       color="#FF5555"/></group>

                <group position={[55, 23, 0]}>
                  <group rotation={[0, 0, Math.PI / 2]}>
                    <group scale={1.5} position={[-60, 0, 0]}>
                      <RenderedRay reference={Ray.size(1)} scale={1.5} color="#FF55FF"/>
                    </group>
                  </group>
                  <group scale={1.5} position={[30, -60, 0]}>
                    <RenderedRay reference={Ray.size(1)} scale={1.5} color="#5555FF"/>
                  </group>
                </group>

                <group rotation={[0, 0, Math.PI / 8]} position={[55, -6, 0]}>
                  <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                         color="#AA00AA"/></group>
                  <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#AA00AA"/></group>
                </group>

                <group rotation={[0, 0, Math.PI / 2]}>
                  <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#FF55FF"/></group>
                </group>

              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        or keep doing the same thing by adding to the line,

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="3_expanded_continuation" context={paper}  style={{height: '140px'}}>
            <Center>
              <group>
                <group scale={1.5} position={[-30, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                       color="#FF5555"/></group>

                <group scale={1.5} position={[30, -60, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                        color="#5555FF"/></group>

                <group rotation={[0, 0, Math.PI / 2]}>
                  <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                         color="#FF55FF"/></group>
                  <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#FF55FF"/></group>
                </group>


                <group scale={1.5} position={[90, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                      color="#55FF55"/></group>
                <group rotation={[0, 0, Math.PI / 2]} position={[60, 0, 0]}>

                  <group scale={1.5}><RenderedRay position={[-40, 0, 0]} reference={Ray.size(1)} scale={1.5}
                                                  color="#55FFFF"/></group>
                  <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#55FFFF"/></group>
                </group>

              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        which would correspond to this line,

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="3_tertiary" context={paper} >
            <Center>
              <group>
                <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                       color="#FF5555"/></group>
                <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#5555FF"/></group>
                <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#FF55FF"/></group>

                <group scale={1.5} position={[60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                      color="#55FF55"/></group>
                <group scale={1.5}><Continuation position={[20, 0, 0]} color="#55FFFF"/></group>
              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}}>but it doesn't necessarily get us anywhere on its own <span className="bp5-text-muted">(Since we can just keep making the line bigger)</span>. So let's ignore those expansions for now.</span>

        <BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}}>A more interesting thing we can do, is instead to continue the line which defines what we're seeing as possible <span className="bp5-text-muted">continuations, merges, ..., branches</span>.</span>

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="branch_expanded" context={paper}  style={{height: '200px'}}>
            <Center>
              <group>

                <group scale={1.5} position={[-30, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                       color="#FF5555"/></group>

                <group scale={1.5} position={[30, -60, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                        color="#5555FF"/></group>

                <group scale={1.5} position={[30, 60, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                        color="#3030FC"/></group>

                <group rotation={[0, 0, Math.PI / 2]}>
                  <group scale={1.5} position={[60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                        color="#FF55FF"/></group>
                  <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                         color="#FF55FF"/></group>
                  <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#FF55FF"/></group>
                </group>

              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        This more abstractly, is just the same thing as we did above. We're just adding equivalences on continuations. What makes it different is the context defined around it. Hence, we get something which looks more like branching, even though they can be abstractly realized as the same kind of thing.

        <BR/>


        <Block>
          <CachedVisualizationCanvas alt="branch" context={paper}  style={{height: '90px'}}>
            <Center>
              <group>

                <group scale={1.5} position={[-30, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                       color="#FF5555"/></group>

                <group scale={1.5} position={[30, -30, 0]}><RenderedRay initial={[-20, 20, 0]} reference={Ray.size(1)} scale={1.5}
                                                                        color="#5555FF"/></group>

                <group scale={1.5} position={[30, 30, 0]}><RenderedRay initial={[-20, -20, 0]} reference={Ray.size(1)} scale={1.5}
                                                                       color="#3030FC"/></group>

                <group scale={1.5}><Continuation color="#FF55FF" /></group>
              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>
      </Section>
      <Section head="On Combinatorics" sub="Constructing Combinatorics - Combinatorics as Equivalence">
        Before we continue elaborating on what kind of exotic things we can do with the continuations. Let's take a quick step back. Since we'd like to be able to describe anything we might find at each of these points, we'll quickly turn to that first.

        <BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}}>If we'd like to construct things like <span className="bp5-text-muted">numbers, symbols, names, labels, tokens, combinations, ..., permutations</span>. We'll need some way to select a particular value (; point) from a collection of points. For that, we don't actually need anything other than what we've already seen <Reference index={referenceCounter()} is="footnote">Which might show that it's pretty much the same thing to describe the structures themselves. And saying something like 'only concerns itself with connectivity' - just means that one is ignoring certain kinds of structures, and not others.</Reference>.</span>

        <BR/>

        If we take our simple example of two points,

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="2_vertical_binary" context={paper}  style={{height: '140px'}}>
            <Center>
              <group rotation={[0, 0, Math.PI / 2]}>
                <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                       color="#FF5555"/></group>
                <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#5555FF"/></group>
                <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#FF55FF"/></group>
              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        we only need to put another direction on one of them, in order to select between the two.

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="2_select_1" context={paper}  style={{height: '140px'}}>
            <Center>
              <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5}/></group>

              <group rotation={[0, 0, Math.PI / 2]}>
                <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                       color="#FF5555"/></group>
                <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#5555FF"/></group>
                <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#FF55FF"/></group>
              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        Or selecting the other point,

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="2_select_0" context={paper}  style={{height: '140px'}}>
            <Center>
              <group scale={1.5}><RenderedRay position={[0, -40, 0]} reference={Ray.size(1)} scale={1.5}/></group>

              <group rotation={[0, 0, Math.PI / 2]}>
                <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                       color="#FF5555"/></group>
                <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#5555FF"/></group>
                <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#FF55FF"/></group>
              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}}>And suddenly we have a binary number. Note that we can't actually construct what a binary number is, without defining both <span className="bp5-text-muted">our "red" point and our "blue point", ..., or 0/1</span>. We need to define additional context, in order to differentiate between the two.</span>

        <BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}}>Actually, we could put arbitrarily complicated <span className="bp5-text-muted">graphs, categories, states, ..., structures</span> at each of the points like this, simply by creating arbitrary continuations. And then again at each of those points define even more arbitrary structures.</span>

        <BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}}>One of them could even be putting both our points on our selection, as a sort of <span className="bp5-text-muted">binary superposition, self-loop, identity, boolean, ..., type</span>.</span>

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="2_superposition" context={paper} style={{height: '80px'}}>
            <Center>
              <group scale={1.5}><RenderedRay position={[0, 0, 0]} reference={Ray.size(1)} scale={1.5}/></group>

              <group scale={1.5}><BinarySuperposition position={[0, 0, 0]}/></group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        Or something interesting like this.

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="2_edge" context={paper}  style={{height: '140px'}}>
            <Center>
              <group scale={1.5}><RenderedRay position={[0, -20, 0]} reference={Ray.size(1)} scale={1.5}/></group>

              <group rotation={[0, 0, Math.PI / 2]}>
                <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                       color="#FF5555"/></group>
                <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#5555FF"/></group>
                <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#FF55FF"/></group>
              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        Though, it's not necessarily obvious how to interpret what it means when one finds additional structure at each of the points.
      </Section>
    </Arc>
    <Arc head="Arc: Theoretics">
      This next arc will try to elaborate a bit further on some more abstract concepts. Hopefully you'll have gained a slight intuition of these visualizations, so that they'll serve as a guide.

      <Section head="On Equivalences & Inconsistencies">
        Though there's much not to like about the way I wrote down some thoughts on intelligibility a year
        ago {OnIntelligibilityReference}. There's one thing in particular that stands out. If I have one thing and I
        make a perfect copy. Surely I now have two things which are perfectly "the same", right? The idea being that, if
        you can even point and say that there are "two things" and you can distinguish between them. That shows exactly
        at least one way in which they are not the same. And if you'd like to be able to say they are "the same" - you
        need to ignore that difference.

        <BR/>

        Alright, that's all well and good. But what does that actually usefully mean without being so vague?

        <BR/>

        Let's take two copies of our binary number.

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="2_2" context={paper} style={{height: '140px'}}>
            <Center>
              <group>
                <group scale={1.5}><RenderedRay position={[0, -40, 0]} reference={Ray.size(1)} scale={1.5}/></group>

                <group rotation={[0, 0, Math.PI / 2]}>
                  <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                         color="#FF5555"/></group>
                  <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#5555FF"/></group>
                  <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#FF55FF"/></group>
                </group>
              </group>
              <group position={[60, 0, 0]}>
                <group scale={1.5}><RenderedRay position={[0, -40, 0]} reference={Ray.size(1)} scale={1.5}/></group>

                <group rotation={[0, 0, Math.PI / 2]}>
                  <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                         color="#FF5555"/></group>
                  <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#5555FF"/></group>
                  <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#FF55FF"/></group>
                </group>
              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        Are they the same? Well - no, not really. Clearly they're different with respect to the yellow direction. Are
        they different? Well - no, not really that different. Only on the yellow direction.

        <BR/>

        If I couldn't see a difference between "the two", I would just see this <Reference index={referenceCounter()}
                                                                                           is="footnote">You could say
        the same for differences in color perception (e.g. color blindness), different ways of perceiving spatial
        information, non-distinguishability between some dimension say left/right, ..., generalized to any kind of
        distinguishability.</Reference>.

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="2_select_0" context={paper} style={{height: '140px'}}>
            <Center>
              <group scale={1.5}><RenderedRay position={[0, -40, 0]} reference={Ray.size(1)} scale={1.5}/></group>

              <group rotation={[0, 0, Math.PI / 2]}>
                <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                       color="#FF5555"/></group>
                <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#5555FF"/></group>
                <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#FF55FF"/></group>
              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}}>Alright, this might start to give you an impression. But let's keep expanding on this kind of idea. What I'm basically saying here, is that in order to point out some <span
          className="bp5-text-muted">symmetry, invariance, ..., equivalence</span>, I need access to some <span
          className="bp5-text-muted">asymmetry, variance, ..., inconsistency</span>. Or again this thing of, in order to point out some way in which they're the same, I need access to some way in which they're not. Or slightly rephrased; if I cannot see a difference, it will look the same to me.</span>

        <BR/>

        <span className="bp5-text-muted" style={{textAlign: 'left', minWidth: '100%'}}>An example of this might be a tautology. A tautology doesn't generally hold up. In setting up a tautology, there must be an asymmetry in order for me to point out which two things are supposed to represent the same thing. The reason why that doesn't matter for most things considered tautologies, is that this inconsistency is just deemed an irrelevant detail. This asymmetry can be ignored. And hence, if we allow for the ignorance of this difference, a tautology holds: "of course they are the same" - if you ignore the difference, that is.</span>

        <BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}}>It's quite easy (in general) from either perspective, to ask what it would mean to change perspective, as it were. Since changing perspective is just <span
          className="bp5-text-muted">adding, removing, ..., changing</span> structure. From the perspective which only sees a binary number, we could ask: "What if I saw this thing as three possible options?"</span>

        <BR/>


        <Block>
          <CachedVisualizationCanvas alt="3_select_0" context={paper} style={{height: '200px'}}>
            <Center>
              <group scale={1.5}><RenderedRay position={[0, -40, 0]} reference={Ray.size(1)} scale={1.5}/></group>

              <group rotation={[0, 0, Math.PI / 2]}>
                <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                       color="#FF5555"/></group>
                <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#5555FF"/></group>
                <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#FF55FF"/></group>

                <group scale={1.5} position={[60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                      color="#55FF55"/></group>
                <group scale={1.5}><Continuation position={[20, 0, 0]} color="#55FFFF"/></group>
              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}}>The <span className="bp5-text-muted">consequences, accuracy, implementing, ..., finding</span> (of) such a change however - for some other thing one is interested in, is not at all trivial. Why is that the case?</span>

        <BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}}>Take again, the example of two points <span
          className="bp5-text-muted">without structure, whose structure we don't have access to, ..., whose structure we're ignorant of</span>.</span>

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="2_orange" context={paper} style={{height: '30px'}}>
            <Center>
              <group>
                <group scale={1.5}><RenderedRay position={[0, 0, 0]} reference={Ray.size(1)} scale={1.5}/></group>
              </group>
              <group position={[60, 0, 0]}>
                <group scale={1.5}><RenderedRay position={[0, 0, 0]} reference={Ray.size(1)} scale={1.5}/></group>
              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}}>From this perspective it seems simple to <span
          className="bp5-text-muted">equivalence, assume (simultaneity, ..., invariance), ..., ignore the difference between</span> the two. The only thing we need to destroy is one connection, and we get:</span>
        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="empty_vertex" context={paper}>
            <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5}/></group>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}}>Similarly, from this perspective it seems quite simple to grow back to the other structure. We only need to introduce some <span
          className="bp5-text-muted">inconsistency, assumption of (non-simultaneity, ..., variance), ..., difference</span>.</span>

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="2_orange" context={paper} style={{height: '30px'}}>
            <Center>
              <group>
                <group scale={1.5}><RenderedRay position={[0, 0, 0]} reference={Ray.size(1)} scale={1.5}/></group>
              </group>
              <group position={[60, 0, 0]}>
                <group scale={1.5}><RenderedRay position={[0, 0, 0]} reference={Ray.size(1)} scale={1.5}/></group>
              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}}>These two perspective are obviously already possibly inconsistent with each other. But why this is a hard problem, is because one might find <span
          className="bp5-text-muted">additional structure, ..., ignored structure</span> at each of the points. And it's not necessarily obvious what to do with that.</span>

        <BR/>

        Say we wanted to assume some equivalency between these two.

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="0_1" context={paper} style={{height: '200px'}}>
            <Center>
              <group>
                <group scale={1.5}><RenderedRay position={[0, -40, 0]} reference={Ray.size(1)} scale={1.5}/></group>

                <group rotation={[0, 0, Math.PI / 2]}>
                  <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                         color="#FF5555"/></group>
                  <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#5555FF"/></group>
                  <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#FF55FF"/></group>
                </group>
              </group>
              <group position={[60, 0, 0]}>
                <group scale={1.5}><RenderedRay position={[0, -40, 0]} reference={Ray.size(1)} scale={1.5}/></group>

                <group position={[0, -60, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                         color="#FF5555"/></group>
                  <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#5555FF"/></group>
                  <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#FF55FF"/></group>
                </group>
              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        There are many things I could mean or want to do with that.

        <BR/>

        I could still have access to this same structure, but only accessible from a different perspective.

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="0_1_tilted" context={paper} style={{height: '110px'}}>
            <Center>

              <group>
                <group rotation={[0, 0, -(Math.PI / 4)]}>
                  <group>
                    <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                           color="#FF5555"/></group>
                    <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#5555FF"/></group>
                    <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#FF55FF"/></group>
                  </group>
                </group>
                <group position={[0, 0, 0]} rotation={[0, 0, -(Math.PI / 4) * 3]}>
                  <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                         color="#5555FF"/></group>
                  <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#FF5555"/></group>
                  <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#FF55FF"/></group>
                </group>
              </group>

              <group scale={1.5}><RenderedRay position={[0, 0, 0]} reference={Ray.size(1)} scale={1.5}/></group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        I could say, "oh, the one is red, the other is blue", and they must be *the same kind* of red and blue. And so surely, if we ignore the difference between the two, that could be interpreted as a superposition.

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="2_superposition" context={paper} style={{height: '80px'}}>
            <Center>
              <group scale={1.5}><RenderedRay position={[0, 0, 0]} reference={Ray.size(1)} scale={1.5}/></group>

              <group scale={1.5}><BinarySuperposition position={[0, 0, 0]}/></group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}}>I could just destroy one of them completely, as I would have done from the perspective of being ignorant of additional structure. <span
          className="bp5-text-disabled">(The two yellow points above, which I just merged to one)</span></span>

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="2_select_1" context={paper} style={{height: '140px'}}>
            <Center>
              <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5}/></group>

              <group rotation={[0, 0, Math.PI / 2]}>
                <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                       color="#FF5555"/></group>
                <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#5555FF"/></group>
                <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#FF55FF"/></group>
              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        This could frankly be anything. If it can be constructed, this is valid way of equivalencing the two. So this,
        is a perfectly reasonable way of equivalencing our red and blue points:

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="some_structure" context={paper} style={{height: '140px'}}>
            <Center>
              <group scale={1.5}>
                <group>
                  <RenderedRay position={[0, 0, 0]} reference={Ray.size(1)} scale={1.5}/>
                  <RenderedRay position={[-40, 0, 0]} reference={Ray.size(1)} scale={1.5}/>
                  <RenderedRay position={[-80, 0, 0]} reference={Ray.size(1)} scale={1.5}/>
                </group>

                <group position={[0, 40, 0]}>
                  <RenderedRay position={[0, 0, 0]} reference={Ray.size(1)} scale={1.5} color="#FF55FF"/>
                  <RenderedRay position={[-40, 0, 0]} reference={Ray.size(1)} scale={1.5} color="#FF55FF"/>
                  <RenderedRay position={[-80, 0, 0]} reference={Ray.size(1)} scale={1.5} color="#FF55FF"/>
                </group>
              </group>
              <group position={[-120, 60, 0]} rotation={[0, 0, Math.PI / 2]}>
                <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                       color="#55FF55"/></group>
                <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#55FF55"/></group>
                <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#55FF55"/></group>
              </group>
              <group position={[-60, 60, 0]} rotation={[0, 0, Math.PI / 2]}>
                <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                       color="#55FF55"/></group>
                <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#55FF55"/></group>
                <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#55FF55"/></group>
              </group>
              <group position={[0, 60, 0]} rotation={[0, 0, Math.PI / 2]}>
                <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                       color="#55FF55"/></group>
                <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#55FF55"/></group>
                <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#55FF55"/></group>
              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}}>Another way of thinking about this, is that an equivalence and an inconsistency aren't actually different things at all. And that concepts like <span
          className="bp5-text-muted">equivalence, ignorance, <Reference is="reference" index={referenceCounter()}
                                                                        reference={{
                                                                          title: "renormalization",
                                                                          link: "https://en.wikipedia.org/wiki/Renormalization"
                                                                        }} simple inline/>, <Reference is="reference"
                                                                                                       index={referenceCounter()}
                                                                                                       reference={{
                                                                                                         title: "coarse-graining",
                                                                                                         link: "https://en.wikipedia.org/wiki/Coarse-grained_modeling"
                                                                                                       }} simple
                                                                                                       inline/>, ..., inconsistency</span> can all be used somewhat interchangeably. And I need additional structure to distinguish between them. They don't generally hold up. This might fly a bit in the face of how you usually use words, but let's entertain it for a moment, and see if we can disentangle what I could possible mean by that - without descending into vague madness.</span>

        <BR/>

      </Section>

      {/*  Always, Never, All, None, Every, Constants, Modularity, Identity, Bounded/Unbounded, Limit/Unlimited, Discrete/Continuous */}
      <Section head="On Orbits" sub="Infinities, Loops, Self-Reference, Fixed Points, Halting, ..., Abstractions">
          <span style={{textAlign: 'left', minWidth: '100%'}}>If I wanted to phrase that something was <span
            className="bp5-text-muted">consistent, equivalent, ..., invariant</span> - in general -. One way of doing that, is saying that irrespective of some direction, it will always stay the same. Or in other words, there is some loop. There is some way in which it holds, infinitely.</span>

        <BR/>

        Take a simple point.

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="empty_vertex_green" context={paper}>
            <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#55FF55"/></group>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        Make its beginning and end equivalent by acknowledging an inconsistency.

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="1_loop_expanded" context={paper} style={{height: '60px'}}>
            <Center>
              <group position={[30, 45, 0]}>
                <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                       color="#00AA00"/></group>
                <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#00AA00"/></group>
              </group>

              <group scale={1.5}>
                <Continuation position={[-20, 30, 0]} color="#55FF55" scale={1.5}/>
                <Continuation position={[20, 30, 0]} color="#55FF55" scale={1.5}/>

                <group rotation={[Math.PI, 0, 0]}>
                  <Continuation position={[0, -30 + torus.radius, 0]} color="#55FF55" scale={1.5} arc={Math.PI}
                                radius={20}/>
                </group>

                <Vertex color="#55FF55" position={[0, 7, 0]}/>
              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}}>And there we have it, an <span
          className="bp5-text-muted">infinity, loop, ..., orbit</span>  if we ignore the difference.</span>

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="1_loop" context={paper} style={{height: '60px'}}>
            <Center>
              <group scale={1.5}>
                <Loop position={[0, 15, 0]} radius={15} color="#55FF55"/>
              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        The problem with a loop being, that in order to remain consistent. Anything found at the point must never
        change. You cannot distinguish between each iteration of the loop - there must be no asymmetry on each
        iteration.

        <BR/>

        But it's much worse than that. Take for instance an infinite line of a selected binary number.

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="1_loop_2_select_1" context={paper} style={{height: '170px'}}>
            <Center>
              <group scale={1.5}>
                <Loop position={[0, 20, 0]} radius={20} color="orange"/>
              </group>
              <group>
                {/*<group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5}/></group>*/}

                <group rotation={[0, 0, Math.PI / 2]}>
                  <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                         color="#FF5555"/></group>
                  <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#5555FF"/></group>
                  <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#FF55FF"/></group>
                </group>
              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        There is no possible way for me to distinguish between each iteration. The only ways to do so, is to introduce
        some difference,

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="2_loop_2_select_1" context={paper} style={{height: '170px'}}>
            <Center>
              <group scale={1.5}>
                <Line start={[0, 0, 0]} end={[20 - torus.radius, 0, 0]} scale={1.5} color="orange"/>
                <Line start={[20 + torus.radius, 0, 0]} end={[40, 0, 0]} scale={1.5} color="orange"/>
                <Continuation position={[20, 0, 0]} color="orange"/>
              </group>
              <group scale={1.5}>
                <Line start={[0, 40, 0]} end={[20 - torus.radius, 40, 0]} scale={1.5} color="orange"/>
                <Line start={[20 + torus.radius, 40, 0]} end={[40, 40, 0]} scale={1.5} color="orange"/>
                <Continuation position={[20, 40, 0]} color="orange"/>
              </group>
              <group scale={1.5} rotation={[0, 0, Math.PI / 2]}>
                <Continuation position={[20, 0, 0]} radius={20} color="orange"
                              arc={Math.PI - 0.12}/> {/* close enough hack */}
              </group>
              <group scale={1.5} position={[60, 30, 0]} rotation={[0, 0, -(Math.PI / 2) + 0.12]}>
                <Continuation radius={20} color="orange" arc={Math.PI}/>
              </group>

              <group>
                {/*<group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5}/></group>*/}

                <group rotation={[0, 0, Math.PI / 2]}>
                  <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                         color="#FF5555"/></group>
                  <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#5555FF"/></group>
                  <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#FF55FF"/></group>
                </group>
              </group>
              <group position={[60, 0, 0]}>
                {/*<group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5}/></group>*/}

                <group rotation={[0, 0, Math.PI / 2]}>
                  <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                         color="#FF5555"/></group>
                  <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#5555FF"/></group>
                  <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#FF55FF"/></group>
                </group>
              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        which would break the consistency of the loop.

        <BR/>

        Or for the loop to be ignorant of my introduced variance - which means it's back to this.

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="1_loop_2_select_1" context={paper} style={{height: '170px'}}>
            <Center>
              <group scale={1.5}>
                <Loop position={[0, 20, 0]} radius={20} color="orange"/>
              </group>
              <group>
                {/*<group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5}/></group>*/}

                <group rotation={[0, 0, Math.PI / 2]}>
                  <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                         color="#FF5555"/></group>
                  <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#5555FF"/></group>
                  <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#FF55FF"/></group>
                </group>
              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        In which case, the loop isn't perfectly repeating, but merely an ignorant one.

        <BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}}>Or in other words: Whenever you have an <span
          className="bp5-text-muted">infinity, loop, ..., orbit</span>, either you actually have a loop, and there's nothing you can do about it. Or you are <span
          className="bp5-text-muted">ignoring, ..., missing</span> the information on how it's not one.</span>

        <BR/>

        This is I think, a good definition of an abstraction.

        <span
          className="bp5-text-disabled" style={{textAlign: 'left', minWidth: '100%'}}>Another example of this is reversibility. The only way to construct perfect reversibility, is if there's no distinguishability between the iteration 'before' and 'after' the reversing. And that practically, when one thinks about reversibility (say for instance a number line, ..., or some dimension), one is only interested in a particular kind of consistency, ..., reversibility. Consistency, ..., Reversibility after ignoring some difference.</span>

        <BR/>

        Take for instance, the abstraction of two possible values.

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="2_horizontal_binary" context={paper}>
            <Center>
              <group>
                <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                       color="#FF5555"/></group>
                <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#5555FF"/></group>
                <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#FF55FF"/></group>
              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        What does it mean to say, that it's *just* this structure? And nothing more defined around it? How, for example,
        do I know it's two, and not more?

        <BR/>

        Quite similarly to the loops, I could be ignorant of additional structure by assuming it's not there.

        <BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}}>And if I wanted to guarantee it's *just* this structure, I would need to assume some consistency of it, infinitely. <span
          className="bp5-text-muted">"It never changes", "There will never be anything additional to find here", ..., "It halts here"</span>. And I could do such a thing anywhere on the structure.</span>

        <BR/>


        <Block>
          <CachedVisualizationCanvas alt="2_horizontal_binary_loops" context={paper} style={{height: '50px'}}>
            <Center>
              <group>
                <group scale={1.5}>
                  <Loop position={[0, 7.5, 0]} radius={7.5} segments={100} color="orange"/>
                </group>
                <group scale={1.5}>
                  <Loop position={[20, 7.5, 0]} radius={7.5} segments={100} color="orange"/>
                </group>
                <group scale={1.5}>
                  <Loop position={[-20, 7.5, 0]} radius={7.5} segments={100} color="orange"/>
                </group>
                <group scale={1.5}>
                  <Loop position={[-40, 7.5, 0]} radius={7.5} segments={100} color="orange"/>
                </group>
                <group scale={1.5}>
                  <Loop position={[-60, 7.5, 0]} radius={7.5} segments={100} color="orange"/>
                </group>
                <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                       color="#FF5555"/></group>
                <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#5555FF"/></group>
                <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#FF55FF"/></group>
              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}}>And similarly, that would actually be the case. Or I'm again, <span
          className="bp5-text-muted">ignoring, ..., missing</span> some structure. I can't actually give a guarantee that any direction will <span
          className="bp5-text-muted">halt, ..., continue</span>. I can only assume it's the case.</span>
      </Section>

      <Section head="On Assumptions & Assumption Violation">
        <span style={{textAlign: 'left', minWidth: '100%'}}>One might as well - more practically - say that some <span
          className="bp5-text-muted">consistency, ..., well-defined property</span> could be more vaguely restated as: <span
          className="bp5-text-muted">"Can rely on some assumptions without the/much need to correct them if they are violated", ... "Even though I'm not actually accurate, it might not matter for this other thing."</span>. Where violated just means some inconsistency with respect to what was expected according to that assumption.</span>

        <BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}}>Whenever you have an assumption like that. You don't necessarily need to draw conclusions as to its <span
          className="bp5-text-muted">usefulness, ..., correctness</span>. If it can evidently be constructed and can persist however fleetingly, that is enough.</span>

        <BR/>

        <span
          className="bp5-text-disabled" style={{textAlign: 'left', minWidth: '100%'}}>Basically: it's not whether "2 + 2 = 4". It's whether you can notice if that, in the process of wanting to calculate '2 + 2'. That the result does(/ not) match your more abstract idea of what addition should look like. If it doesn't - which you could say was inconsistent according to your (ignorant) abstract model - will you notice? Could you understand its effects, ..., consequences if it doesn't? Even if you do, can you find out why? - This seems a much harder problem. One which is much easier to ignore, practically.</span>

        <BR/>

        Note that it then wouldn't be entirely obvious what would happen. Both from the perspective of the abstraction, or that of the inconsistency. Perhaps you could draw some loose analogies between acceleration/gravity in a case like this, but again, this isn't obvious at all - and probably a hard problem. Possibly arbitrary complexity might follow after some assumption is violated - you need to know more about a system in order to answer a thing like this.

        <BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}}>Any abstraction, or just one of the ray visualizations shown here, is more accurately phrased by throwing some <span
          className="bp5-text-muted">vagueness, ..., ambiguity</span> in the mix. By saying, that 'this would be the case', if 'all these assumptions hold'. This way you allow for some possible uncertainty. And allow one to abstractly hook into any step of the <span
          className="bp5-text-muted">visualization, computation, ..., process</span>, and ask: "What if this wasn't the case?" - "What if that didn't actually happen?". </span>
      </Section>
      {/* "in between" */}
      <Section head="On Fractals" sub="Transduction, Reducing, Super-, Sub-, ..., Fractions">
        All of this is essentially saying, that an idea like self-reference can only be maintained abstractly by
        ignoring aspects which would make each iteration of self-reference different.

        <BR/>
        <Row center="xs" style={{width: '100%'}}>
          <Divider style={{width: '80%'}}/>
        </Row>
        <BR/>

        What if we wanted a way to describe what was in between two points? We already have a way of connecting them
        together.

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="2_horizontal_binary" context={paper}>
            <Center>
              <group>
                <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                       color="#FF5555"/></group>
                <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#5555FF"/></group>
                <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#FF55FF"/></group>
              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        There are probably many ways of doing this, one could be adding structure on the connection.

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="2_expanded_continuation_selected" context={paper} style={{height: '200px'}}>
            <Center>
              <group>

                <group scale={1.5} position={[-30, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                       color="#FF5555"/></group>

                <group scale={1.5} position={[30, -60, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                        color="#5555FF"/></group>

                <group rotation={[0, 0, Math.PI / 2]}>
                  <group scale={1.5} position={[-120, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                          color="#FF55FF"/></group>
                  <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                         color="#FF55FF"/></group>
                  <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#FF55FF"/></group>
                </group>

                <group scale={1.5} position={[0, -120, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                        color="orange"/></group>
              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        Which could basically be this thing we've seen before.

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="2_edge" context={paper} style={{height: '140px'}}>
            <Center>
              <group scale={1.5}><RenderedRay position={[0, -20, 0]} reference={Ray.size(1)} scale={1.5}/></group>

              <group rotation={[0, 0, Math.PI / 2]}>
                <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                       color="#FF5555"/></group>
                <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#5555FF"/></group>
                <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#FF55FF"/></group>
              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        Another could be simply saying, there's a different way of looking at this thing, which includes something in
        the middle.

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="3_fractal" context={paper}>
            <Center>
              <group>
                <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                       color="#FF5555"/></group>
                <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#FF55FF"/></group>

                <group scale={1.5} position={[60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                      color="#5555FF"/></group>

                <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#FF55FF"/></group>

              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        But like this, we don't really have access to say the added point is "in between" our other two points, we just
        have three points. One way of thinking about it, is that we want two ways of describing the same thing. One
        which means our usual two points, and the other, us asking what's "in between" them.

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="2_edge_3_fractal" context={paper} style={{height: '90px'}}>
            <Center>
              <group position={[30, 0, 0]}>
                <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                       color="#FF5555"/></group>
                <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#5555FF"/></group>
                <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#FF55FF"/></group>
              </group>

              <group position={[0, -60, 0]}>
                <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                       color="#FF5555"/></group>
                <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#FF55FF"/></group>

                <group scale={1.5} position={[60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                      color="#5555FF"/></group>

                <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#FF55FF"/></group>

              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        Among the many possible ways of doing this, one could be to draw equivalences between points (and depending on
        perspective, possibly continuations).

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="2_edge_3_fractal_with_equivs" context={paper} style={{height: '120px'}}>
            <Center>
              <group position={[0, -7, 0]}>
                <group position={[-60, 0, 0]} rotation={[0, 0, 60 * (Math.PI / 180)]}>
                  <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                         color="#FF5555"/></group>
                  <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#FF5555"/></group>
                  <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#FF5555"/></group>
                </group>
                <group position={[-30, 0, 0]} rotation={[0, 0, 60 * (Math.PI / 180)]}>
                  <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                         color="#FF5555"/></group>
                  <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#FF5555"/></group>
                  <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#FF5555"/></group>
                </group>

                <group position={[30, 0, 0]}>
                  <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                         color="#FF5555"/></group>
                  <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#5555FF"/></group>
                  <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#FF55FF"/></group>
                </group>

                <group position={[90, -60 + 7, 0]}>
                  <group position={[-30, 0, 0]} rotation={[0, 0, -60 * (Math.PI / 180)]}>
                    <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                           color="#5555FF"/></group>
                    <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#5555FF"/></group>
                    <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#5555FF"/></group>
                  </group>
                </group>
                <group position={[120, -60 + 7, 0]}>
                  <group position={[-30, 0, 0]} rotation={[0, 0, -60 * (Math.PI / 180)]}>
                    <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                           color="#5555FF"/></group>
                    <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#5555FF"/></group>
                    <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#5555FF"/></group>
                  </group>
                </group>
              </group>

              <group position={[0, -60, 0]}>
                <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                       color="#FF5555"/></group>
                <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#FF55FF"/></group>

                <group scale={1.5} position={[60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                      color="#5555FF"/></group>

                <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#FF55FF"/></group>

              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        Which could be phrased as:

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="2_edge_3_fractal_equived" context={paper} style={{height: '60px'}}>
            <Center>


              <group position={[30, 0, 0]}>
                <group scale={1.5} position={[-90, 0, 0]}>
                  <RenderedRay reference={Ray.size(1)} scale={1.5} terminal={[40, 15, 0]} color="#FF5555"/>
                </group>
                <group scale={1.5}>
                  <RenderedRay reference={Ray.size(1)} scale={1.5} initial={[-20, 15, 0]} position={[20, 0, 0]}
                               color="#5555FF"/>
                </group>
                <group scale={1.5}><Continuation position={[-20, 15, 0]} color="#FF55FF"/></group>
              </group>

              <group position={[0, 0, 0]}>
                <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#FF5555"
                                                                       terminal={[20, -15, 0]}/></group>
                {/*<group scale={1.5}><Continuation position={[-, 0, 0]} color="#FF55FF"/></group>*/}

                <group scale={1.5} position={[60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                      color="#5555FF" initial={[-20, -15, 0]}/></group>

                <group scale={1.5}><RenderedRay position={[0, -15, 0]} reference={Ray.size(1)} scale={1.5}
                                                color="#FF55FF"/></group>

              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}} className="bp5-text-muted">A simple way of phrasing this, is one path takes you from 0 to 1. Another path takes you from 0 to 0.5 to 1. And just like any structure, we can put another direction on it as a possible way to select '0.5'.</span>

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="2_edge_3_fractal_equived_selected" context={paper} style={{height: '200px'}}>
            <Center>

              <group rotation={[0, 0, Math.PI / 2]}>
                <group position={[30, 0, 0]}>
                  <group scale={1.5} position={[-90, 0, 0]}>
                    <RenderedRay reference={Ray.size(1)} scale={1.5} terminal={[40, 15, 0]} color="#FF5555"/>
                  </group>
                  <group scale={1.5}>
                    <RenderedRay reference={Ray.size(1)} scale={1.5} initial={[-20, 15, 0]} position={[20, 0, 0]}
                                 color="#5555FF"/>
                  </group>
                  <group scale={1.5}><Continuation position={[-20, 15, 0]} color="#FF55FF"/></group>
                </group>

                <group position={[0, 0, 0]}>
                  <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                         color="#FF5555"
                                                                         terminal={[20, -15, 0]}/></group>
                  {/*<group scale={1.5}><Continuation position={[-, 0, 0]} color="#FF55FF"/></group>*/}

                  <group scale={1.5} position={[60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                        color="#5555FF" initial={[-20, -15, 0]}/>
                  </group>

                  <group scale={1.5}><RenderedRay position={[0, -15, 0]} reference={Ray.size(1)} scale={1.5}
                                                  color="#FF55FF"/></group>

                </group>
              </group>
              <group rotation={[0, 0, Math.PI / 4]} position={[7, -15, 0]}>
                <group scale={1.5}><RenderedRay position={[15, 0, 0]} reference={Ray.size(1)} scale={1.5} color="orange"/>
                </group>
              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        This then also being one of the ways in which one can both have the original structure in tact, and describe
        existing continuations in another 'layer'.

        <BR/>

        <span
          style={{textAlign: 'left', minWidth: '100%'}}>This sort of thing gives rise to many interesting cases: <span
          className="bp5-text-muted">inconsistently describing continuations after some infinity in between as 'bigger infinities', ..., arbitrary additional complexity which happens in between two points (which one is possibly ignorant of)</span>. You could even leap to something interesting of phrasing abstraction with more structure/complexity, as being bigger infinities.</span>

        <BR/>
        <div style={{width: '100%'}}><HorizontalLine/></div>
        <BR/>

        Probably the reason why one usually doesn't ask what's between two fractions, is that this question is already
        self-referentially answered. And deemed "not interesting". As a way of saying: "You can always keep asking what
        is between two points, and that answer is always the same." <Reference is="footnote" index={referenceCounter()}>Though,
        you could say something interesting as, the first 100 decimals places are this kind of fractal expansion, the
        next 60 this kind, and any arbitrary thing that follows this other kind. - Quite funky constructions can be
        made, but are probably usually ignored for a simpler pattern like this.</Reference>. Which is an example of how
        a simple pattern, which likely inconsistently is assumed to infinitely hold, takes preference.

        <BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}} className="bp5-text-disabled">Again, what one means by saying that "following both paths end up at the same point". Is that this can only actually be the case, if one can ignore/ignores which path is taken.</span>

        <BR/>

        Note that this is the idea behind something continuous/continuity. A simple, likely inconsistent loop which holds, or merely the inability to even ask the question of what's in between two things, infinitely.

      </Section>
      <Section head="On Movement & Teleporting">
        Quite similar to fractals (or any concept really). We could say that movement and teleporting are the same kind
        of thing. But I need both concepts in order to tell the difference between them.

        <BR/>

        Take our fractal example, for instance:

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="2_edge_3_fractal_equived" context={paper} style={{height: '60px'}}>
            <Center>


              <group position={[30, 0, 0]}>
                <group scale={1.5} position={[-90, 0, 0]}>
                  <RenderedRay reference={Ray.size(1)} scale={1.5} terminal={[40, 15, 0]} color="#FF5555"/>
                </group>
                <group scale={1.5}>
                  <RenderedRay reference={Ray.size(1)} scale={1.5} initial={[-20, 15, 0]} position={[20, 0, 0]}
                               color="#5555FF"/>
                </group>
                <group scale={1.5}><Continuation position={[-20, 15, 0]} color="#FF55FF"/></group>
              </group>

              <group position={[0, 0, 0]}>
                <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#FF5555"
                                                                       terminal={[20, -15, 0]}/></group>
                {/*<group scale={1.5}><Continuation position={[-, 0, 0]} color="#FF55FF"/></group>*/}

                <group scale={1.5} position={[60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                      color="#5555FF" initial={[-20, -15, 0]}/></group>

                <group scale={1.5}><RenderedRay position={[0, -15, 0]} reference={Ray.size(1)} scale={1.5}
                                                color="#FF55FF"/></group>

              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        Where the shorter path could be considered teleporting. If I knew only how to teleport, I would just see this:

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="2_horizontal_binary" context={paper}>
            <Center>
              <group>
                <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                       color="#FF5555"/></group>
                <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#5555FF"/></group>
                <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#FF55FF"/></group>
              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>
        <BR/>

        If I only knew how to move:

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="3_fractal" context={paper}>
            <Center>
              <group>
                <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                       color="#FF5555"/></group>
                <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#FF55FF"/></group>

                <group scale={1.5} position={[60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                      color="#5555FF"/></group>

                <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#FF55FF"/></group>

              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        I need to be able to say from the perspective of teleporting: This would've been the slower path. And from the
        perspective of moving: This teleported me across the distance I otherwise needed to slowly move through. - If I
        can't, they're the same thing.

        <BR/>

        But either way, they're more abstractly just the same thing. We're just moving along some (possibly more
        complicated) path.

        <BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}}>This concept is quite generalizable. We can say the same thing for <span className="bp5-text-muted">local/non-local, linear/non-linear, close/distant, ..., trivial/non-trivial</span>. This is just an extension of the idea: They're not generally some way, it depends on the other context one is able to access.</span>

        <BR/>

        Say I had some selection,

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="2_edge_3_fractal_equived_select_0" context={paper} style={{height: '80px'}}>
            <Center>
              <group position={[30, 0, 0]}>
                <group scale={1.5} position={[-90, 0, 0]}>
                  <RenderedRay reference={Ray.size(1)} scale={1.5} terminal={[40, 15, 0]} color="#FF5555"/>
                </group>
                <group scale={1.5}>
                  <RenderedRay reference={Ray.size(1)} scale={1.5} initial={[-20, 15, 0]} position={[20, 0, 0]}
                               color="#5555FF"/>
                </group>
                <group scale={1.5}><Continuation position={[-20, 15, 0]} color="#FF55FF"/></group>
              </group>

              <group position={[0, 0, 0]}>
                <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#FF5555"
                                                                       terminal={[20, -15, 0]}/></group>
                {/*<group scale={1.5}><Continuation position={[-, 0, 0]} color="#FF55FF"/></group>*/}

                <group scale={1.5} position={[60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                      color="#5555FF" initial={[-20, -15, 0]}/></group>

                <group scale={1.5}><RenderedRay position={[0, -15, 0]} reference={Ray.size(1)} scale={1.5}
                                                color="#FF55FF"/></group>

              </group>

              <group scale={1.5} position={[-60, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <group rotation={[0, 0, -0.4]}><RenderedRay reference={Ray.size(1)} scale={1.5} color="orange"/></group>
              </group>

            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        And I wanted to teleport that over,

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="2_edge_3_fractal_equived_select_0_teleporting" context={paper} style={{height: '160px'}}>
            <Center>
              <group position={[30, 60, 0]}>
                <group scale={1.5} position={[-90, 0, 0]}>
                  <group rotation={[0, 0, Math.PI / 2]}>
                    <RenderedRay reference={Ray.size(1)} scale={1.5} color="#555555"/>
                    <RenderedRay reference={Ray.size(1)} scale={1.5} color="#555555" position={[-40, 0, 0]}/>
                  </group>
                  <group position={[-20, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <RenderedRay reference={Ray.size(1)} scale={1.5} color="#555555"/>
                    <RenderedRay reference={Ray.size(1)} scale={1.5} color="#555555" position={[-40, 0, 0]}/>
                  </group>

                  <RenderedRay reference={Ray.size(1)} scale={1.5} terminal={[40, 15, 0]} color="#55FF55"/>
                </group>
                <group scale={1.5}>
                  <group position={[20, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <RenderedRay reference={Ray.size(1)} scale={1.5} color="#555555"/>
                    <RenderedRay reference={Ray.size(1)} scale={1.5} color="#555555" position={[-40, 0, 0]}/>
                  </group>
                  <group position={[40, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <RenderedRay reference={Ray.size(1)} scale={1.5} color="#555555"/>
                    <RenderedRay reference={Ray.size(1)} scale={1.5} color="#555555" position={[-40, 0, 0]}/>
                  </group>

                  <RenderedRay reference={Ray.size(1)} scale={1.5} initial={[-20, 15, 0]} position={[20, 0, 0]}
                               color="#55FF55"/>

                </group>
                <group scale={1.5}>
                  <group position={[-20, 15, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <RenderedRay reference={Ray.size(1)} scale={1.5} color="#555555"/>
                    <RenderedRay reference={Ray.size(1)} scale={1.5} color="#555555" position={[-40, 0, 0]}/>
                  </group>

                  <Continuation position={[-20, 15, 0]} color="#55FF55"/>
                </group>


              </group>

              <group scale={1.5} position={[-60, 60, 0]} rotation={[0, 0, Math.PI / 2]}>
                <group rotation={[0, 0, -0.5]}><RenderedRay reference={Ray.size(1)} scale={1.5} color="orange"/></group>
              </group>

              <group position={[30, 0, 0]}>
              <group scale={1.5} position={[-90, 0, 0]}>
                  <RenderedRay reference={Ray.size(1)} scale={1.5} terminal={[40, 15, 0]} color="#FF5555"/>
                </group>
                <group scale={1.5}>
                  <RenderedRay reference={Ray.size(1)} scale={1.5} initial={[-20, 15, 0]} position={[20, 0, 0]}
                               color="#5555FF"/>
                </group>
                <group scale={1.5}><Continuation position={[-20, 15, 0]} color="#FF55FF"/></group>
              </group>

              <group position={[0, 0, 0]}>
                <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#FF5555"
                                                                       terminal={[20, -15, 0]}/></group>
                {/*<group scale={1.5}><Continuation position={[-, 0, 0]} color="#FF55FF"/></group>*/}

                <group scale={1.5} position={[60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                      color="#5555FF" initial={[-20, -15, 0]}/></group>

                <group scale={1.5}><RenderedRay position={[0, -15, 0]} reference={Ray.size(1)} scale={1.5}
                                                color="#FF55FF"/></group>

              </group>

            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        The only way to actually do that, is to introduce some inconsistency along some direction. Or: have some structure (our selection in this case), travel across that direction.

        <BR/>


        <Block>
          <CachedVisualizationCanvas alt="2_edge_3_fractal_equived_select_1_teleporting" context={paper} style={{height: '160px'}}>
            <Center>
              <group position={[30, 60, 0]}>
                <group scale={1.5} position={[-90, 0, 0]}>
                  <group rotation={[0, 0, Math.PI / 2]}>
                    <RenderedRay reference={Ray.size(1)} scale={1.5} color="#555555"/>
                    <RenderedRay reference={Ray.size(1)} scale={1.5} color="#555555" position={[-40, 0, 0]}/>
                  </group>
                  <group position={[-20, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <RenderedRay reference={Ray.size(1)} scale={1.5} color="#555555"/>
                    <RenderedRay reference={Ray.size(1)} scale={1.5} color="#555555" position={[-40, 0, 0]}/>
                  </group>

                  <RenderedRay reference={Ray.size(1)} scale={1.5} terminal={[40, 15, 0]} color="#55FF55"/>
                </group>
                <group scale={1.5}>
                  <group position={[20, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <RenderedRay reference={Ray.size(1)} scale={1.5} color="#555555"/>
                    <RenderedRay reference={Ray.size(1)} scale={1.5} color="#555555" position={[-40, 0, 0]}/>
                  </group>
                  <group position={[40, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <RenderedRay reference={Ray.size(1)} scale={1.5} color="#555555"/>
                    <RenderedRay reference={Ray.size(1)} scale={1.5} color="#555555" position={[-40, 0, 0]}/>
                  </group>

                  <RenderedRay reference={Ray.size(1)} scale={1.5} initial={[-20, 15, 0]} position={[20, 0, 0]}
                               color="#55FF55"/>

                </group>
                <group scale={1.5}>
                  <group position={[-20, 15, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <RenderedRay reference={Ray.size(1)} scale={1.5} color="#555555"/>
                    <RenderedRay reference={Ray.size(1)} scale={1.5} color="#555555" position={[-40, 0, 0]}/>
                  </group>

                  <Continuation position={[-20, 15, 0]} color="#55FF55"/>
                </group>


              </group>

              <group scale={1.5} position={[60, 60, 0]} rotation={[0, 0, Math.PI / 2]}>
                <group rotation={[0, 0, -0.5]}><RenderedRay reference={Ray.size(1)} scale={1.5} color="orange"/></group>
              </group>

              <group position={[30, 0, 0]}>
                <group scale={1.5} position={[-90, 0, 0]}>
                  <RenderedRay reference={Ray.size(1)} scale={1.5} terminal={[40, 15, 0]} color="#FF5555"/>
                </group>
                <group scale={1.5}>
                  <RenderedRay reference={Ray.size(1)} scale={1.5} initial={[-20, 15, 0]} position={[20, 0, 0]}
                               color="#5555FF"/>
                </group>
                <group scale={1.5}><Continuation position={[-20, 15, 0]} color="#FF55FF"/></group>
              </group>

              <group position={[0, 0, 0]}>
                <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#FF5555"
                                                                       terminal={[20, -15, 0]}/></group>
                {/*<group scale={1.5}><Continuation position={[-, 0, 0]} color="#FF55FF"/></group>*/}

                <group scale={1.5} position={[60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                      color="#5555FF" initial={[-20, -15, 0]}/></group>

                <group scale={1.5}><RenderedRay position={[0, -15, 0]} reference={Ray.size(1)} scale={1.5}
                                                color="#FF55FF"/></group>

              </group>

            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        Or in other words, some equivalent structure needs to be inconsistent in some way. Or: We draw an equivalency which needs to be ignorant in the direction in which it's drawn.

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="2_edge_3_fractal_equived_select_1" context={paper} style={{height: '80px'}}>
            <Center>
              <group position={[30, 0, 0]}>
                <group scale={1.5} position={[-90, 0, 0]}>
                  <RenderedRay reference={Ray.size(1)} scale={1.5} terminal={[40, 15, 0]} color="#FF5555"/>
                </group>
                <group scale={1.5}>
                  <RenderedRay reference={Ray.size(1)} scale={1.5} initial={[-20, 15, 0]} position={[20, 0, 0]}
                               color="#5555FF"/>
                </group>
                <group scale={1.5}><Continuation position={[-20, 15, 0]} color="#FF55FF"/></group>
              </group>

              <group position={[0, 0, 0]}>
                <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5} color="#FF5555"
                                                                       terminal={[20, -15, 0]}/></group>
                {/*<group scale={1.5}><Continuation position={[-, 0, 0]} color="#FF55FF"/></group>*/}

                <group scale={1.5} position={[60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                                      color="#5555FF" initial={[-20, -15, 0]}/></group>

                <group scale={1.5}><RenderedRay position={[0, -15, 0]} reference={Ray.size(1)} scale={1.5}
                                                color="#FF55FF"/></group>

              </group>

              <group scale={1.5} position={[60, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <group rotation={[0, 0, -0.4]}><RenderedRay reference={Ray.size(1)} scale={1.5} color="orange"/></group>
              </group>

            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}}>Similarly, <span className="bp5-text-muted">traversal, rewriting, computation, equivalences, ..., functions, and pretty much every concept</span> can be categorized as this. More usefully: How much do I need to change/ignore before they're the same to me?</span>
      </Section>
      <Section head="On Compression">
        <span style={{textAlign: 'left', minWidth: '100%'}}>The task with compression - or any equivalence really - is that necessarily you need to recover structural information. Without structure, you cannot point to <span className="bp5-text-muted">"two things", a sequence of things, probability of things, ..., arbitrarily structured things</span>.</span>

        <BR/>

        A simple example of this could be the difference between 4 bits in sequence,

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="4_bits" context={paper} style={{height: '80px'}}>
            <Center>
              <group scale={1.5}>
                <group position={[0, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5} color="orange"/><BinarySuperposition /></group>
                <group position={[40, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5} color="orange"/><BinarySuperposition /></group>
                <group position={[80, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5} color="orange"/><BinarySuperposition /></group>
                <group position={[120, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5} color="orange"/><BinarySuperposition /></group>
              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        4 bits whose structure I've ignored through another layer of abstraction (Or basically any unordered structure)

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="4_bits_unordered" context={paper} style={{height: '80px'}}>
            <Center>
              <group scale={1.5}>
                <group rotation={[0, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5} color="orange"
                                                         position={[0, 0, 0]}/></group>

                <group rotation={[0, 0, 1]}><BinarySuperposition/></group>
                <group rotation={[0, 0, -1]}><BinarySuperposition/></group>
                <group rotation={[0, 0, 0.3]}><BinarySuperposition/></group>
                <group rotation={[0, 0, -0.3]}><BinarySuperposition/></group>
              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}} className="bp5-text-disabled">(in a slightly less clustered rendering)</span>

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="4_bits_seperated" context={paper} style={{height: '80px'}}>
            <Center>
              <group scale={1.5}>
                <group position={[0, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5} color="orange"/><BinarySuperposition /></group>
                <group position={[60, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5} color="orange"/><BinarySuperposition /></group>
                <group position={[120, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5} color="orange"/><BinarySuperposition /></group>
                <group position={[180, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5} color="orange"/><BinarySuperposition /></group>
              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        or something like 4 bits in a grid

        <BR/>

        <Block>
          <CachedVisualizationCanvas alt="4_bits_grid" context={paper} style={{height: '140px'}}>
            <Center>
              <group scale={1.5}>
                <group rotation={[0, 0, Math.PI / 2]}>
                  <group position={[0, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5} color="orange"/></group>
                  <group position={[0, -40, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5} color="orange"/></group>
                </group>
                <group position={[0, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                         color="orange"/>
                  <group rotation={[0, 0, -(Math.PI / 4)]}><BinarySuperposition/></group>
                </group>
                <group position={[40, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                          color="orange"/>
                  <group rotation={[0, 0, -(Math.PI / 4)]}><BinarySuperposition/></group>
                </group>
              </group>
              <group scale={1.5} position={[0, 60, 0]}>
                <group rotation={[0, 0, Math.PI / 2]}>
                  <group position={[0, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5} color="orange"/></group>
                  <group position={[0, -40, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5} color="orange"/></group>
                </group>
                <group position={[0, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                         color="orange"/>
                  <group rotation={[0, 0, -(Math.PI / 4)]}><BinarySuperposition/></group>
                </group>
                <group position={[40, 0, 0]}><RenderedRay reference={Ray.size(1)} scale={1.5}
                                                          color="orange"/>
                  <group rotation={[0, 0, -(Math.PI / 4)]}><BinarySuperposition/></group>
                </group>
              </group>
            </Center>
          </CachedVisualizationCanvas>
        </Block>

        <BR/>

        Quite obviously, if I didn't know which one, I would need additional information to distinguish between them.

        <BR/>

        Suddenly a concept like entropy becomes entirely clear: Just visualize the compressor and possibly the order (or more generally: the structure) in which information is received, as additional structure. Necessarily, that (relative) structure is additional information. Necessarily, certain things are easier with, or easier without those structures.

        <BR/>
        <div style={{width: '100%'}}><HorizontalLine/></div>
        <BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}}>And then, depending on the compressor. You can have interesting things like <span className="bp5-text-muted">locally, spatially, ..., temporally</span> forgetting structures. Which would rely on strategies like easy re-discoverability for things forgotten. Such expectations however, as a prediction relying on some invariance. Is an assumption at risk of being violated. And the mode of rediscovering itself, is subject to being forgotten (and then perhaps rediscovered).</span>
      </Section>
    </Arc>
    <Arc head="Arc: OrbitMines Explorer: The Project">
      <Link
        link="https://github.com/orbitmines/orbitmines.com/pull/1"
        name={<span>
        OrbitMines Explorer - <Tag intent={Intent.WARNING} minimal multiline
                                   style={{fontSize: '1rem', paddingTop: '0px', paddingBottom: '0px'}}>WIP</Tag> Preliminary Technical Implementation/Exploration
      </span>}
        icon={ORGANIZATIONS.github.key}/>
    </Arc>

    <Arc head="Wrapping up">
      <Section>
        What I think this will turn out to be; Is that in the process of trying to understand programming languages, compilation and compression. That I ended up abstracting so far away from them. That aided by having some intuitive notion of hyperedges, I stumbled upon this formulation of Rays.

        <BR/>

        Which is likely either a rediscovery of concepts in category theory, or an even more general, possibly more easily programmable and reprogrammable (; possibly homoiconic) variant of its ideas. Being this general, quite certainly concepts from all kinds of fields should be phrase-able in this (possibly) more visually intuitive way of manipulating concepts.

        <BR/>

        Though this current setup is quite intuitive to me, I still need to link a lot of it to existing concepts. And quite deliberately, I've not necessarily gone into the details of any particular interpretation/implementation. As this thing is incredibly flexible - and it's not yet at all obvious to me what the resulting implementation will look like.
      </Section>
      <Section head="Future inquiries">
        <span style={{textAlign: 'left', minWidth: '100%'}}>One thing that has become quite clear to me. Is that the best solutions in this line of projects, will necessarily be the interface with which someone interacts with abstract ideas. <span
          className="bp5-text-muted">This could be a language, ..., something of the tooling around such a language (which itself might be conceptualized as another language)</span>. Which one, doesn't actually really matter much. Understanding the details of specific kinds of languages, don't matter much. Constructing a <span
          className="bp5-text-muted">platform, language, ..., interface</span>, as general as possible so that others have a way of implementing theirs as conveniently as possible. That is an important idea in this project.</span>

        <BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}}>There are many projects I'm currently expecting to <span className="bp5-text-muted">implement, ..., encounter</span> within this framing. I expect I'll be able provide more detail on these throughout 2024.</span>

        <BR/>
        <div style={{width: '100%'}}><HorizontalLine/></div>
        <BR/>

        As a simple concrete example:
        <BR/>
        - (1) <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'CHYP (Cospans of HYPergraphs)', link: 'https://github.com/akissinger/chyp', authors: [{name: 'Aleks Kissinger'}]}} />
        <BR/>
        <BR/>
        As a practical handle on the world's ecosystem:
        <BR/>
        - (2) <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'WebAssembly', link: 'https://webassembly.github.io/spec/core/'}} />, (3) <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'Tinygrad', link: 'https://github.com/tinygrad/tinygrad'}} />
        <BR/>
        <BR/>
        As a handle on more abstract mathematics and computer science:
        <BR/>
        - (4) <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'Category Theory', link: 'https://ncatlab.org/nlab/show/category+theory'}} />, (5) <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'Homotopy Type Theory', link: 'https://homotopytypetheory.org/'}} />

        <BR/>
        <BR/>
        As a handle on physics:
        <BR/>
        - (6) <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'ZX-calculus', link: 'https://zxcalculus.com/ '}} />
        <BR/>
        <BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}}>I expect to along the way encounter a wide range of other projects: <span className="bp5-text-muted">Programming Languages, Theorem Provers, ..., Theories</span>. I might publish a long list of those I'm interested in 2024. To keep this list short I've only mentioned the ones I'm more certain of.</span>
        <BR/>
        <div style={{width: '100%'}}><HorizontalLine/></div>
        <BR/>

        Additionally, currently the Wolfram Institute's Infrageometry project <Reference is="footnote" index={referenceCounter()} reference={REFERENCES.WOLFRAM_INSTITUTES_INFRAGEOMETRY_LIVESTREAMS.reference} /> is going through a lot of similar-looking ideas. Though its current goals - as far as I understand it - are quite different from mine (<Reference is="reference" inline index={referenceCounter()} reference={{title: "Possible connections to the Wolfram Institute's Infrageometry project", date: '2023-11-25', link: 'https://discord.com/channels/1055502602365845534/1177982001979064340', organizations: [ORGANIZATIONS.discord, ORGANIZATIONS.orbitmines_research, ORGANIZATIONS.wolfram_institute]}} />).

        <BR/>

        Clearly, I'm trying to be a little far-reaching and extend into any field I could possibly imagine which manages to peak my curiosity. There is much to explore - if only I now had some better tools to apply to everything.
      </Section>
      <Section head="On self-publishing and referencing" sub="Edited personal journeys/histories/... and literary exposure">
        I suspect that this sort of self-(reporting/publishing), necessitates the highlighting of its possible adversarial/game-theoretic properties. With myself and my archives possibly being forgetful or deceitful players, this certainly makes for an interesting dynamic. Consider this quick paragraph as an acknowledgement that I am aware of that, and that I think my attempts aim for accuracy - whether that's actually successful or not -.

        <BR/>

        Similarly, it's worth admitting that I do not necessarily understand/have access to how certain interactions come together in my explorations. I document how I find certain kinds of information in some detail, though this is likely far from exhaustive.

        <BR/>

        I might also fail to mention relevant works (or personal interactions) which have either had impact on my line of thinking more non-trivially, or whose ideas aren't mentioned here, or in my other writing, directly. My current practical approach to this has therefore been to publish many kinds of information I expose myself to (during the time I'm working on these projects). Which hopefully support the more explicit referencing done here. I hope to further expand on this concept in future works.
      </Section>
      <Section head="On language and my bending of it">
        In my - albeit limited - number of orbits around our particular sun, I have found that I myself am (and likely by extension others are) quite inconsistent. Quite regularly I would like to rephrase certain (historical) expressions, dissatisfied by their vagueness or inaccuracy. Or to make the conceptual leap and guess that the only way my memory is even slightly functional is the apparent ability to infer or remember by resolving pointers from context somewhat consistently. A form of permeating uncertain caution seems appropriate when thinking through these abstract concepts: This could be interpreted as a reference carried forward in time with the potential to modify any particular assumption.

        <BR/>

        Additionally, I'm quite certain that my use of language contains a style which is unusual. Likely containing seemingly duplicated word sequences, possibly overly cautious /or not at all, and quite certainly seemingly (possibly on purpose) contradictory in many instances.

        <BR/>

        In this sense, I don't necessarily care about the accuracy of any particular sentence. Whether in this language, or one it's translated to. I care whether the more abstract pattern of ideas which I'm trying to communicate is sufficiently transferred through that language. And the ability to - through time, through correction -, adjust the ideas as deemed by me/you as particularly inconsistent to warrant its change.

      </Section>
      <Section head="A yearly excerpt of thoughts">
        In some sense, several aspects of these arcs could be considered as generalizations of many ideas I've exposed myself to. I've noticed it's incredibly easy to confidently name/(talk/think about) something, without having properly understood or built them; either my own or others' thoughts. In a struggle to understand their/those inconsistencies, I think I found - or am starting to find - a proper language to do so.
      </Section>
    </Arc>
  </Paper>;
}

export default OnOrbits;