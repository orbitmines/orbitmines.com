import React, {useCallback, useEffect, useRef, useState} from 'react';
import ORGANIZATIONS, {Content, PLATFORMS, Viewed} from "../../lib/organizations/ORGANIZATIONS";
import {useNavigate, useSearchParams} from "react-router-dom";
import Post, {
  BR,
  PaperProps,
  Arc,
  HorizontalLine,
  Link,
  useCounter,
  Reference,
  Section,
  Block,
  renderable,
  Row,
  Children, Col, JetBrainsMono, BlueprintIcons20, BlueprintIcons16
} from "../../lib/post/Post";
import {PROFILES} from "../profiles/profiles";
import {ON_INTELLIGIBILITY} from "./2022.OnIntelligibility";
import {Button, Divider, Intent, Tag} from "@blueprintjs/core";
import {CatmullRomLine, Center, Circle, QuadraticBezierLine, Torus} from "@react-three/drei";
import REFERENCES from "../profiles/fadi-shawki/fadi_shawki";
import _ from 'lodash';
import {toPng} from "html-to-image";
import {Canvas} from "@react-three/fiber";
import {ACESFilmicToneMapping, SRGBColorSpace} from "three";
import WEBGL from "three/examples/jsm/capabilities/WebGL";
import isWebGLAvailable = WEBGL.isWebGLAvailable;

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
    link: 'https://orbitmines.com/archive/on-orbits-equivalence-and-inconsistencies',
    year: "2023",
    date: "2023-12-31",
    external: {
      discord: {serverId: '1055502602365845534', channelId: '1190719376085766195', link: () => "https://discord.com/channels/1055502602365845534/1190719376085766195/1190719376085766195"}
    },
    organizations: [ORGANIZATIONS.orbitmines_research],
    authors: [{
      ...PROFILES.fadi_shawki,
      external: PROFILES.fadi_shawki.external?.filter((profile) => PLATFORMS.includes(profile.organization.key))
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
      fonts: [JetBrainsMono, BlueprintIcons20, BlueprintIcons16],
    },
    Reference: (props: {}) => (<></>),
    references: referenceCounter
  }

  const s2 = 1;

  return <Post
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
        What I think this will turn out to be; Is that in the process of trying to understand programming languages, compilation and compression. That I ended up abstracting so far away from them. That aided by having some intuitive notion of hyperedges, I stumbled upon this formulation of Ray.

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
  </Post>;
}

export default OnOrbits;

export const Vertex = ({ position, color = circle.color }: any) =>
  <Circle position={position} material-color={color} args={[circle.radius, circle.segments]} />
// In principle, this should be anything, this is just for the initial setup
export const RenderedRay = (
  props: { reference: Ray, renderContinuations?: boolean } & { position?: [number, number, number], initial?: [number, number, number], terminal?: [number, number, number], scale?: number, color?: string }
) => {
  const {
    position = [0, 0, 0],
    reference,
    scale = 1,
    color = 'orange',
    initial = add(position, [-20, 0, 0]),
    terminal = add(position, [20, 0, 0]),
    renderContinuations = true
  } = props;
  const left = initial;
  const right = terminal;

  if (reference.is_none() || reference.is_none())
    return <></>

  const vertex = reference.self;

  const Rendered = () => {


    const type = vertex.as_reference().type;
    switch (type) {
      case RayType.INITIAL: {
        /**
         * [  |--]
         */
        if (vertex.vertex.is_none()) {
          return <Continuation color="orange" position={position} />
        } else {
          const possible_continuations = vertex.vertex;

          if (!possible_continuations.as_reference().is_terminal())
            return <Continuation color="orange" position={position} />
          //
          // if (vertex.terminal.store.rendered)
          //   return <></>

          return <RenderedRay
            {...props}
            reference={possible_continuations.initial.as_reference()}
          />
        }
      }
      case RayType.TERMINAL: {
        if (vertex.vertex.is_none()) {
          return <Continuation color="orange" position={position} />
        } else {
          const possible_continuations = vertex.vertex;

          // if (!possible_continuations.as_reference().is_initial())
          //   return <Continuation color="orange" position={position} />
          return <></>

          // return <RenderedRay
          //   {...props}
          //   reference={possible_continuations.terminal.as_reference()}
          // />
        }
      }
      case RayType.REFERENCE: {
        if (vertex.as_reference().is_none()) // empty reference
          return <Continuation color={color} position={position} />

        // throw 'Not Implemented'
        return <RenderedRay {...props} reference={vertex.is_some() ? vertex.as_reference() : Ray.None()} />
      }
      case RayType.VERTEX: {
        const tilt = -10; // TODO; Generally should use some equivalencing in the 3d-frames for this once setup is in place (perpsective/camera) if in threejs..
        // const left = add(position, [-80 + tilt, 0, 0]);
        // const right = add(position, [80 - tilt, 0, 0]);

        // const initial_side = {
        //   continuation: add(left, [tilt, 0, 0]),
        //   initial: add(left, [30 + tilt, 15, 0]),
        //   terminal: add(left, [30 - tilt, -15, 0]),
        //
        //   initial_continuation: add(left, [30 + tilt * 2, 15 + 15, 0]),
        //   terminal_continuation: add(left, [30 - tilt * 2, -15 - 15, 0]),
        // }
        // const terminal_side = {
        //   continuation: add(right, [-tilt, 0, 0]),
        //   initial: add(right, [-30 + tilt, 15, 0]),
        //   terminal: add(right, [-30 - tilt, -15, 0]),
        //
        //   initial_continuation: add(right, [-30 + tilt * 2, 15 + 15, 0]),
        //   terminal_continuation: add(right, [-30 - tilt * 2, -15 - 15, 0]),
        // }
        //
        // const Sup = ({ position }: any) => {
        //
        //   const left = add(position, [-20, 0, 0]);
        //   const right = add(position, [20, 0, 0]);
        //
        //   return <>
        //     <RenderedRay reference={vertex.initial.as_reference()} position={left} />
        //
        //     {/* Line now starts in the center of the torus tube */}
        //     <Line start={add(left, [torus.radius, 0, 0])} end={position} scale={scale} />
        //     {/*<Vertex position={position} />*/}
        //     <BinarySuperposition position={position} />
        //     <Line start={position} end={add(right, [-torus.radius, 0, 0])} scale={scale} />
        //     <RenderedRay reference={vertex.terminal.as_reference()} position={right} />
        //   </>
        // }

        // 55FF55
        // return <>
        //   <Sup position={[100, 70, 0]} />
        //
        //   <Continuation color="#55FF55" position={initial_side.continuation} />
        //
        //   <CatmullRomLine points={[
        //     add(initial_side.continuation, [0, torus.radius, 0]),
        //     initial_side.initial,
        //     terminal_side.initial,
        //     add(terminal_side.continuation, [0, torus.radius, 0])
        //   ]} color="#55FF55" lineWidth={line.width * 1.5}/>
        //
        //   <CatmullRomLine points={[
        //     add(initial_side.continuation, [0, -torus.radius, 0]),
        //     initial_side.terminal,
        //     terminal_side.terminal,
        //     add(terminal_side.continuation, [0, -torus.radius, 0])
        //   ]} color="#55FF55" lineWidth={line.width * 1.5}/>
        //
        //
        //   <Vertex position={initial_side.initial} color="#55FF55" />
        //   <Vertex position={initial_side.terminal} color="#55FF55" />
        //
        //   <Continuation color="#55FF55" position={terminal_side.continuation} />
        //
        //   <>
        //     <CatmullRomLine points={[
        //       initial_side.initial_continuation,
        //       add(initial_side.initial, [0, 0, 0]),
        //       add(initial_side.terminal, [0, 0, 0]),
        //       initial_side.terminal_continuation,
        //     ]} color="orange" lineWidth={line.width * 1.5}/>
        //
        //     <Vertex position={initial_side.initial_continuation} color="#1C2127" />
        //     <Continuation position={initial_side.initial_continuation} color="orange" />
        //     <Vertex position={initial_side.terminal_continuation} color="#1C2127" />
        //     <Continuation position={initial_side.terminal_continuation} color="orange" />
        //
        //     {/* 1C2127 quick for background */}
        //     <Vertex position={initial_side.initial} color="#1C2127" />
        //     <Vertex position={initial_side.initial} color="#FF5555" />
        //
        //     <CatmullRomLine points={[
        //       add(initial_side.initial, [0, -15, 0]),
        //       initial_side.initial,
        //       add(initial_side.initial, [0, 15, 0]),
        //     ]} color="#FF5555" lineWidth={line.width * 1.5}/>
        //
        //     <Vertex position={add(initial_side.initial, [0, -15, 0])} color="#1C2127" />
        //     <Continuation position={add(initial_side.initial, [0, -15, 0])} color="#FF5555" />
        //
        //     <Vertex position={initial_side.terminal} color="#1C2127" />
        //     <Vertex position={initial_side.terminal} color="orange" />
        //
        //     <CatmullRomLine points={[
        //       add(initial_side.initial, [0, 15, 0]),
        //       add(initial_side.initial, [0, 30, 0]),
        //       add(initial_side.initial, [0, 45, 0]),
        //     ]} color="#5555FF" lineWidth={line.width * 1.5}/>
        //
        //     <Vertex position={add(initial_side.initial, [0, 30, 0])} color="#5555FF" />
        //     <Circle position={add(initial_side.initial, [0, 15, 0])} material-color="#FF55FF" args={[circle.radius / 2, circle.segments]} />
        //
        //     <Vertex position={add(initial_side.initial, [0, 45, 0])} color="#1C2127" />
        //     <Continuation position={add(initial_side.initial, [0, 45, 0])} color="#5555FF" />
        //
        //   </>
        //
        //  <>
        //    <CatmullRomLine points={[
        //      terminal_side.initial_continuation,
        //      add(terminal_side.initial, [0, 0, 0]),
        //      add(terminal_side.terminal, [0, 0, 0]),
        //      terminal_side.terminal_continuation,
        //    ]} color="orange" lineWidth={line.width * 1.5}/>
        //
        //    <Vertex position={terminal_side.initial_continuation} color="#1C2127" />
        //    <Continuation position={terminal_side.initial_continuation} color="orange" />
        //    <Vertex position={terminal_side.terminal_continuation} color="#1C2127" />
        //    <Continuation position={terminal_side.terminal_continuation} color="orange" />
        //
        //    {/* 1C2127 quick for background */}
        //    <Vertex position={terminal_side.initial} color="#1C2127" />
        //    <Vertex position={terminal_side.initial} color="#FF5555" />
        //
        //    <Continuation position={add(terminal_side.continuation, [tilt - 10, 15, 0])} color="#FF5555" />
        //
        //    <CatmullRomLine points={[
        //      add(terminal_side.continuation, [tilt - 10 - torus.radius, 15, 0]),
        //      terminal_side.initial,
        //      add(terminal_side.initial, [tilt, -7.5, 0]),
        //      add(terminal_side.initial, [tilt, -15, 0]),
        //    ]} color="#FF5555" lineWidth={line.width * 1.5}/>
        //
        //    <Vertex position={terminal_side.terminal} color="#1C2127" />
        //    <Vertex position={terminal_side.terminal} color="#5555FF" />
        //
        //    <CatmullRomLine points={[
        //      add(terminal_side.continuation, [-tilt - 10 - torus.radius, -15, 0]),
        //      terminal_side.terminal,
        //      add(terminal_side.initial, [tilt + 6, -22.5, 0]),
        //      add(terminal_side.initial, [tilt, -15, 0]),
        //    ]} color="#5555FF" lineWidth={line.width * 1.5}/>
        //
        //    <Circle position={add(terminal_side.initial, [tilt, -15, 0])} material-color="#FF55FF" args={[circle.radius / 2, circle.segments]} />
        //
        //    <Continuation position={add(terminal_side.continuation, [-tilt - 10, -15, 0])} color="#5555FF" />
        //  </>
        // </>

        // const left = add(position, [-20, 0, 0]);
        // const right = add(position, [20, 0, 0]);

        const isVertical = position[1] !== left[1];

        return <>
          {/*<Line start={add(left, [-40, 0, 0])} end={add(left, [-40, 60, 0])} scale={scale} />*/}

          {/*<Vertex position={add(left, [-40, 0, 0])} color="#1C2127" />*/}
          {/*<Vertex position={add(left, [-40, 20, 0])} color="#1C2127" />*/}
          {/*<Vertex position={add(left, [0, 20, 0])} color="#1C2127" />*/}
          {/*<Vertex position={add(left, [-40, 60, 0])} color="#1C2127" />*/}

          {/*<Continuation color="orange" position={add(left, [-40, 0, 0])} />*/}
          {/*<Continuation color="red" position={add(left, [-40, 20, 0])} />*/}
          {/*<Continuation color="red" position={add(left, [0, 20, 0])} />*/}
          {/*<Continuation color="orange" position={add(left, [-40, 60, 0])} />*/}

          {/*<RenderedRay reference={vertex.initial.as_reference()} position={add(left, [-20, 20, 0])} />*/}
          {renderContinuations ? <RenderedRay reference={vertex.initial.as_reference()} position={left} color={color} /> : <></>}

          {/* Line now starts in the center of the torus tube */}
          {/*{isVertical*/}
          {/*  ? <Line end={add(left, [0, torus.radius * (position[1] < left[1] ? -1 : 1), 0])} start={position} scale={scale} color={color} />*/}
          : <Line start={add(left, [torus.radius, 0, 0])} end={position} scale={scale} color={color} />
          {/*}*/}


          <Vertex position={position} color={color} />
          {/*<BinarySuperposition position={position} />*/}

          {/*<Line start={position} end={add(right, [-torus.radius, 0, 0])} scale={scale} color={color} />*/}
          <Line start={add(right, [-torus.radius, 0, 0])} end={position} scale={scale} color={color} />

          {/*{_.sample([true, false])*/}
          {/*  ? <BinarySuperposition position={position} />*/}
          {/*  : <BinaryValue position={position} boolean={_.sample([false, true])} />*/}
          {/*}*/}

          <group rotation={[0, 0, Math.PI / 2]}>

          </group>
          {/*{<>*/}
          {/*  <RenderedRay reference={vertex.initial.as_reference()} position={left} />*/}

          {/*  /!* Line now starts in the center of the torus tube *!/*/}
          {/*  <Line start={add(left, [torus.radius, 0, 0])} end={position} scale={scale} />*/}

          {/*  /!*<Vertex position={position} />*!/*/}
          {/*  /!*<BinarySuperposition position={position} />*!/*/}
          {/*  <Line start={position} end={add(right, [-torus.radius, 0, 0])} scale={scale} />*/}

          {/*  {_.sample([true, false])*/}
          {/*    ? <BinarySuperposition position={position} />*/}
          {/*    : <BinaryValue position={position} boolean={_.sample([false, true])} />*/}
          {/*  }*/}

          {/*  <RenderedRay reference={vertex.terminal.as_reference()} position={right} />*/}

          {/*</>}*/}

          {renderContinuations ? <RenderedRay reference={vertex.terminal.as_reference()} position={right} color={color} /> : <></>}

          {/*<Torus*/}
          {/*  args={[15, torus.tube.width, torus.segments, torus.tube.segments]}*/}
          {/*  material-color="orange"*/}
          {/*  position={add(position, [0, 15, 0])}*/}
          {/*/>*/}
          {/*<Torus*/}
          {/*  args={[15, torus.tube.width, torus.segments, torus.tube.segments]}*/}
          {/*  material-color="orange"*/}
          {/*  position={add(position, [0, -15, 0])}*/}
          {/*/>*/}
          {/* SHOULD BE SMOOTH */}
          {/*<CatmullRomLine points={[*/}
          {/*  position,*/}
          {/*  add(position, [12.5, -12.5, 0]),*/}
          {/*  add(position, [0, -25, 0]),*/}
          {/*  add(position, [-12.5, -12.5, 0]),*/}
          {/*  position,*/}
          {/*]} color="orange" lineWidth={line.width * 1.5}/>*/}

        </>
      }
    }
  }

  const render = <Rendered/>
  vertex.any.rendered = render;
  return render;
}

const BinarySuperposition = ({ position = [0, 0, 0], scale = 1.5 }: any) => {
  const halfTorus = (torus.radius + (torus.tube.width / 2));

  const up = add(position, [0, 20 + halfTorus, 0]);
  const down = add(position, [0, -20, 0]);

  const left = add(down, [-halfTorus, 0, 0]);
  const right = add(down, [+halfTorus, 0, 0]);

  return <>
    {/*<CatmullRomLine*/}
    {/*  points={[*/}
    {/*    add(left, [0, torus.radius, 0]),*/}
    {/*    add(left, [0, torus.radius + halfTorus * 2, 0]),*/}
    {/*    position,*/}
    {/*    add(up, [+halfTorus, -(torus.radius + halfTorus * 2), 0]),*/}
    {/*    add(up, [(line.width / 2), 0, 0]),*/}

    {/*    add(up, [-(line.width / 2), 0, 0]),*/}
    {/*    add(up, [-halfTorus, -(torus.radius + halfTorus * 2), 0]),*/}
    {/*    position,*/}
    {/*    add(right, [0, torus.radius + halfTorus * 2, 0]),*/}
    {/*    add(right, [0, torus.radius, 0])*/}
    {/*  ]}*/}
    {/*  color="#FF5555"*/}
    {/*  lineWidth={line.width * 1.5}*/}
    {/*/>*/}

    <CatmullRomLine points={[
      add(left, [0, torus.radius, 0]),
      add(left, [0, torus.radius + halfTorus * scale, 0]),
      position,
      add(up, [+halfTorus, -(torus.radius + halfTorus), 0]),
      add(up, [(line.width / 4), 0, 0]),
    ]} color="#FF5555" lineWidth={line.width * scale}/>
    <CatmullRomLine points={[
      add(right, [0, torus.radius, 0]),
      add(right, [0, torus.radius + halfTorus * scale, 0]),
      position,
      add(up, [-halfTorus, -(torus.radius + halfTorus), 0]),
      add(up, [-(line.width / 4), 0, 0])
    ]} color="#5555FF" lineWidth={line.width * scale}/>

    <Circle position={position} material-color={circle.color} args={[circle.radius, circle.segments]}/>
    <Continuation color="#FF5555" position={left} />

    <Continuation color="#5555FF" position={right} />

    <Circle position={up} material-color="#FF55FF" args={[circle.radius / 2, circle.segments]} />
  </>
}

export const Line = ({ start, mid, end, scale, color = line.color }: any) =>
  <QuadraticBezierLine
    start={start}
    mid={mid}
    end={end}
    color={color}
    lineWidth={line.width * scale}
  />

export const line = { width: 2,  length: 1,  color: "orange", }

export const Continuation = (
  {
    color = torus.color,
    radius = torus.radius,
    arc = Math.PI * 2,
    position
  }: any) =>
  <Torus
    args={[radius, torus.tube.width, torus.segments, torus.tube.segments, arc]}
    material-color={color}
    position={position}
  />

const Loop = (
  { color = "#FFFF55",
    on = "orange",
    position = [0, 0, 0],
    initial = position,
    terminal = add(position, [0, 30, 0]),
    scale = 1.5,
    radius = 15,
    segments = 200
  }: any
) => {
  // const geometry = new TorusGeometry(radius, torus.tube.width, torus.segments, torus.tube.segments, Math.PI * 4);
  //
  // const vertices = geometry.getAttribute('position').array;
  // const points: any = [];
  // for (let i = 0; i < vertices.length; i += 3) {
  //   points.push([vertices[i], vertices[i + 1], vertices[i + 2]]);
  // }
  const points: [number, number, number][] = [];
  for (let i = 0; i < segments; i++) {
    const angle = ((i / segments) * Math.PI * 2) + Math.PI / 2; // STARTS AT THE TOP
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);

    if (i > 5 && i < segments - 6)
      points.push([x, y, 0])
  }
  console.log(points)

  const vertex = add(position, [0, -radius, 0]);
  const continuation = add(position, [0, radius, 0]);

  return <group>
    <CatmullRomLine position={position} points={points} color={color} lineWidth={line.width * scale}/>
    <Continuation position={continuation} color={color}/>
    <Vertex position={vertex} color={color} />
  </group>
}


/**
 * Ray.ts (2024/01/18)
 */
// TODO: SHOULDNT CLASSIFY THESE? (And incorporate in Ray??)
enum RayType {
  // NONE = '     ',
  REFERENCE = 'REFERENCE:  |  ',
  INITIAL = 'INITIAL:  |-?',
  TERMINAL = 'TERMINAL: ?-|  ',
  VERTEX = 'VERTEX: --|--',
}
type Boundary = RayType.INITIAL | RayType.TERMINAL;
const opposite = (boundary: Boundary): Boundary => boundary === RayType.INITIAL ? RayType.TERMINAL : RayType.INITIAL;

type ParameterlessFunction<T = any> = () => T;
type Arbitrary<T> = (...args: any[]) => T;
type Constructor<T> = new (...args: any[]) => T;
type ParameterlessConstructor<T> = new () => T;

// TODO: Merge with Arbitrary.
type Recursive<T = Ray> = (T | Recursive<T | T[]>)[];
type Method<T = Ray> = (...other: Recursive<T>) => T;
type ArbitraryMethod<T = Ray> = (ref: T) => Method<T>;

type SwitchCases<
  T = Ray,
  SwitchCase extends string | symbol | number = RayType,
  TResult = string | ((self: T) => T)
> = {
  [TCase in SwitchCase]?: TResult
}

type Implementation<T = Ray> = (ref: T) => T;

/**
 * https://en.wikipedia.org/wiki/Homoiconicity
 */
interface PossiblyHomoiconic<T extends PossiblyHomoiconic<T>> {
  get self(): T;
  is_reference: () => boolean
  as_reference: () => T
}

interface AbstractDirectionality<T> { initial: Arbitrary<T>, vertex: Arbitrary<T>, terminal: Arbitrary<T> }

// TODO: better debug
type DebugResult = { [label: string]: DebugRay }
type DebugRay = {
  label: string,
  initial: string,
  vertex: string,
  terminal: string,
  is_initial: boolean,
  is_vertex: boolean,
  is_terminal: boolean,
  type: RayType,
  _dirty_store: any
}

/**
 * JavaScript wrapper for a mutable value. It is important to realize that this is merely some simple JavaScript abstraction, and anything is assumed to be inherently mutable.
 *
 * All the methods defined here should be considered deprecated, are there to help with JavaScript implementation only.
 *
 * TODO:
 * - Homotopy equivalence merely as some direction/reversibility constraint on some direction, ignoring additional structure (or incorporating it into the equiv) at the vertices. (Could be loosened where certain vertex-equivalences are also part of the homotopy)
 * - Induced ignorance/equivalence along arbitrary rays.
 * - Usual way of thinking about vertices is what the coninuations are here - phrase that somewhjere
 *
 * TODO: Any javascript class, allow warpper of function names around any ray, as a possible match
 * TODO: All the methods defined here should be implemented in some Ray structure at some point
 *
 * TODO: Maybe want a way to destroy from one end, so that if other references try to look, they won't find additional structure. - More as a javascript implementation quirck if anything?
 *
 * TODO: Can do some workaround overloading through properties, at least for +/-
 *
 * TODO: Singlke keybind for now to show/hide the ray disambiguation or 'dead edges/..'/
 *
 *
 *
 * TODO: All methods to 'step' variant - and an intuitive way to switch between modes
 *  - Through better Ray.___func
 *  - Transform all functions on Ray to that. (Perhaps use JavaScript generators by default (more intuitively?) - Just convert using JS.Generator)
 *  - No assumption of halting
 *  - Perhaps locally cache (for stuff like count?) - no way to ensure globally coherence
 *
 * TODO: Stylistic
 *  - Consistency of Arbitrary vs non-arbitrary.
 *  - Reorder methods in a sensible way.
 *
 */
export class Ray // Other possibly names: AbstractDirectionality, ..., ??
  implements
    PossiblyHomoiconic<Ray>,

    AsyncIterable<Ray>,
    Iterable<Ray>
  // Array<Ray>
  // Dict<Ray>
{
  // TODO: Could make a case that setting the terminal is more of a map, defaulting/first checking the terminal before additional functionality is mapped over that.

  protected _initial: Arbitrary<Ray>; get initial(): Ray { return this._initial(); } set initial(initial: Arbitrary<Ray>) { this._initial = initial; }
  protected _vertex: Arbitrary<Ray>; get vertex(): Ray { return this._vertex(); } set vertex(vertex: Arbitrary<Ray>) { this._vertex = vertex; }
  protected _terminal: Arbitrary<Ray>; get terminal(): Ray { return this._terminal(); } set terminal(terminal: Arbitrary<Ray>) { this._terminal = terminal; }

  get self(): Ray { return this.vertex; }; set self(self: Arbitrary<Ray>) { this.vertex = self; }

  constructor({ initial, vertex, terminal, }: Partial<AbstractDirectionality<Ray>> = {}) {
    this._initial = initial ?? Ray.None;
    this._vertex = vertex ?? this.self_reference; // TODO: None, could also self-reference the ray on which it's defining to be None. Now it's just an ignorant loop.
    this._terminal = terminal ?? Ray.None;
  }

  /** [  |-?] */ is_initial = (): boolean => this.is_some() && this.self.initial.is_none();
  /** [--|--] */ is_vertex = (): boolean => !this.is_initial() && !this.is_terminal();
  /** [?-|  ] */ is_terminal = (): boolean => this.is_some() && this.self.terminal.is_none();
  /** [  |  ] */ is_reference = (): boolean => this.is_initial() && this.is_terminal();
  /** [?-|  ] or [  |-?] */ is_boundary = (): boolean => !this.is_reference() && (this.is_initial() || this.is_terminal()); // TODO: IS !This.references necessary?

  get type(): RayType {
    /** [  |  ] */ if (this.is_reference()) return RayType.REFERENCE;
    /** [  |-?] */ if (this.is_initial()) return RayType.INITIAL;
    /** [?-|  ] */ if (this.is_terminal()) return RayType.TERMINAL;
    // /** [     ] */ if (this.is_empty()) return RayType.NONE;
    /** [--|--] */ return RayType.VERTEX;
  }

  /**
   * This is basically what breaks the recursive structure. Imagine a Ray like this: [|--|--|]. There are several ways of interpreting it, either there's a boolean on initial, vertex, terminal; Some 'false' value, says there's nothing there. Some true value says there's something there. - Basically an Option, ..., Maybe as in certain languages.
   *
   * ---
   *
   * Another way of interpreting a possible way of implementing it, is no matter how much more detail we would like to ask, the only thing we ever see is the same structure again (if we ignore the difference of us asking about that additional structure, that's still a possible handle on some difference).
   *
   * As a way of saying/.../assuming: I only 'infinitely' assume it's only this structure, "it seems to halt here". Note that this is necessarily an assumption. No guarantee of this can be made. This is necessarily an equivalence, ..., ignorance.
   *
   * See more: https://orbitmines.com/archive/on-orbits-equivalence-and-inconsistencies#:~:text=Quite%20similarly%20to%20the%20loops%2C%20I%20could%20be%20ignorant%20of%20additional%20structure%20by%20assuming%20it%27s%20not%20there.
   *
   * ---
   *
   * Concretely, we use here "whatever the JavaScript engine run on" as the thing which has power over the equivalence assumption we use to halt programs. - The asymmetry which allows the engine to make a distinction between each object.
   */
  is_none = (): boolean => Ray.is_orbit(this.self, this.self.self);

  /**
   * Tries for "global coherence" - since we probably can't actually do that, practically this just means self-reference, were no change is assumed...
   *
   * @see https://orbitmines.com/archive/on-orbits-equivalence-and-inconsistencies#:~:text=And%20there%20we%20have%20it%2C%20an%20infinity%2C%20loop%2C%20...%2C%20orbit%20if%20we%20ignore%20the%20difference.
   */
  static is_orbit = (a: Ray, b: Ray) => a === b; // is, ..., appears equal.
  protected self_reference = () => this;

  is_some = (): boolean => !this.is_none();

  /**
   * Can be used to override default dereference behavior.
   *
   * TODO: This should probably be configurable on a more global setting.
   *
   * TODO: Difference between this.self and this.self.self.as_reference is???
   */
  get dereference() { return this.self.self.as_reference(); }

  // /**
  //  * Moves `this.self` and `this.self.self` to a new line.
  //  *
  //  * [  |--] this.self ----- this.self.self [--|--]
  //  * ______ (<- initial pointer)
  //  */
  // as_initial = (): Ray => {
  //   if (this.is_none()) {
  //     throw new PreventsImplementationBug('Should be implemented at some point ; Just return an empty vertex');
  //   }
  //   if (this.dereference.is_none()) {
  //     // TODO: Need some intuition for this check
  //     const vertex = this.___as_vertex();
  //
  //     if (vertex.type !== RayType.VERTEX)
  //       throw new PreventsImplementationBug();
  //
  //     return vertex.follow(Ray.directions.previous);
  //   }
  //
  //   const [terminal_vertex, initial_vertex] = this.___as_vertices();
  //
  //   if (initial_vertex.type !== RayType.VERTEX)
  //     throw new PreventsImplementationBug();
  //   if (terminal_vertex.type !== RayType.VERTEX)
  //     throw new PreventsImplementationBug();
  //
  //   initial_vertex.compose(terminal_vertex);
  //
  //   // TODO BETTER DEBUG
  //
  //   return initial_vertex.follow(Ray.directions.previous);
  // }
  // /**
  //  * Moves `this.self` and `this.self.self` to a new line.
  //  *
  //  * [  |--] this.self.self ----- this.self [--|--]
  //  *                                         _____ (<- terminal pointer)
  //  */
  // as_terminal = (): Ray => {
  //   if (this.is_none()) {
  //     throw new PreventsImplementationBug('Should be implemented at some point ; Just return an empty vertex');
  //   }
  //   if (this.dereference.is_none()) {
  //     // TODO: Need some intuition for this check
  //     const vertex = this.___as_vertex();
  //
  //     if (vertex.type !== RayType.VERTEX)
  //       throw new PreventsImplementationBug();
  //
  //     return vertex.follow();
  //   }
  //
  //   const [initial_vertex, terminal_vertex] = this.___as_vertices();
  //
  //   if (initial_vertex.type !== RayType.VERTEX)
  //     throw new PreventsImplementationBug();
  //   if (terminal_vertex.type !== RayType.VERTEX)
  //     throw new PreventsImplementationBug();
  //
  //   initial_vertex.compose(terminal_vertex);
  //
  //   // TODO BETTER DEBUG
  //
  //   return terminal_vertex.follow();
  // }
  // private ___as_vertices = (): [Ray, Ray] => {
  //   if (!Ray.is_orbit(this.self, this.self.self.self))
  //     throw new PreventsImplementationBug('Is there a use-case for this? Probably not?'); //TODO
  //
  //   // TODO NOTE: THE ORDER OF `this.self` first matters here.
  //   return [this.self.___as_vertex(), this.___as_vertex()];
  // }
  // private ___as_vertex = (): Ray => {
  //   const vertex = Ray.vertex().o({ js: '___as_vertex' }).as_reference().o({ js: '___as_vertex.#' });
  //
  //   // this.self.self = vertex.self.as_arbitrary();
  //   // vertex.self.self = this.self.as_arbitrary();
  //
  //   // return this.___ignorantly_equivalent(Ray.vertex().o({ js: '___as_vertex' }).as_reference().o({ js: '___as_vertex.#' }));
  //
  //   return this.___ignorantly_equivalent(vertex);
  // }
  private ___ignorantly_equivalent = (ref: Ray): Ray => {
    this.self.self = ref.self.as_arbitrary();
    ref.self.self = this.self.as_arbitrary();

    return ref;
  }

  /** [     ] */ static None = () => new Ray({ }).o({ });
  /** [--?--] */ static vertex = (value: Arbitrary<Ray> = Ray.None) => {
    /** [     ] */ const vertex = Ray.None();
    /** [--   ] */ vertex.initial = vertex.___empty_initial();
    /** [  ?  ] */ vertex.vertex = value;
    /** [   --] */ vertex.terminal = vertex.___empty_terminal();

    /** [--?--] */ return vertex;
  }
  /** [  |-?] */ static initial = () => Ray.vertex().initial;
  /** [?-|  ] */ static terminal = () => Ray.vertex().terminal;

  // TODO; Temp placeholders for now - & BETTER DEBUG
  ___empty_initial = () => new Ray({ vertex: Ray.None, terminal: this.as_arbitrary() }).o({ debug: 'initial ref'}).as_arbitrary();
  ___empty_terminal = () => new Ray({ vertex: Ray.None, initial: this.as_arbitrary() }).o({ debug: 'terminal ref'}).as_arbitrary();

  /** A ray whose vertex references this Ray (ignorantly - 'this' doesn't know about it). **/
  /** [?????] -> [  |  ] */ as_reference = (): Ray => new Ray({ vertex: this.as_arbitrary() });

  // TODO: Difference between () => this & this.as_arbitrary , relevant for lazy/modular/ignorant structures etc..
  as_arbitrary = (): Arbitrary<Ray> => () => this;

  /**
   * TODO : COMPOSE EMPTY AS FIRST ELEMENT:
   *  if (initial.is_none()) {
   *           // 'Empty' vertex from this perspective.
   *
   *           initial.vertex = terminal.as_arbitrary();
   *           console.log('first element');
   *           return terminal;
   *         }
   */

  // TODO: Test if references hold after equivalence/composition...


  // TODO: Returns the ref, since it still holds the information on how they're not the same??? - Need some intuitive way of doing this?
  // TODO a.equivalent(b).equivalent(c), in this case would be [[a, b]].equivalent(c) not [a, b, c].equivalent ???

  // TODO: Should do, one timesteap ahead, collapse one reference, and then recursively call continues_with on the vlaue at the reference, until it yields something.

  // TODO AS += through property
  // TODO: Generally, return something which knows where all continuations are.
  // @alias('merge, 'continues_with', 'compose')
  /**
   * Compose as "Equivalence at Continuations": (can usually be done in parallel - not generally)
   *  - `A.compose(B)`            = `(A.TERMINAL).equivalent(B.INITIAL)`
   *  - `A.compose(B).compose(C)` = `(A.TERMINAL).equivalent(B.INITIAL) & (B.TERMINAL).equivalent(C.INITIAL)`
   *
   * Another interesting connection:
   *  - `A.compose(B).compose(C)` = `(A.equivalent(B).equivalent(C)).dereference.(MISSING ALL FUNC).compose`
   *
   * @see "Continuations as Equivalence": https://orbitmines.com/archive/on-orbits-equivalence-and-inconsistencies#:~:text=Constructing%20Continuations%20%2D%20Continuations%20as%20Equivalence
   */
  static compose = Ray.___func(ref => {
    let { initial, terminal} = ref.self;

    if (initial.as_reference().type !== RayType.REFERENCE || terminal.as_reference().type !== RayType.REFERENCE)
      throw new PreventsImplementationBug();

    // ${[...initial.self.initial.as_reference().all().js]}
    if (initial.type !== RayType.VERTEX || terminal.type !== RayType.VERTEX) {
      throw new PreventsImplementationBug(`[${initial.type}] - [${terminal.type}] - only composing vertices for now (${initial.self.initial.any.js} -> ${terminal.self.terminal.any.js})`);
    }

    initial.follow().equivalent(terminal.follow(Ray.directions.previous));

    // return ref; TODO
    return terminal;
  });
  compose = Ray.compose.as_method(this);

  // TODO: Cleanup
  /**
   * Equivalence as "Composing Vertices": "TODO: Is this right?: Equivalence at Continuations, inside a Vertex, is parallel composition, from the perspective of the usual direction defined at the Vertex (not generally parallel)"
   *  - `A.equivalent(B)`               = `A.as_vertex().compose(B.as_vertex())`
   *  - `A.equivalent(B).equivalent(C)` = `A.as_vertex().compose(B.as_vertex()).compose(C.as_vertex())`
   *
   * An equivalence is best understood as the drawing of a single line between two things. Where those two things might have arbitrary structure around them, but we're not checking the (non-)existence of that structure. And thus:
   *   - An equivalence, is only a local equivalence, no global coherence of it can be guaranteed. (or: Changes of an equivalence are only applied locally, which could have global effects, but this isn't necessarily obvious).
   *
   * @see https://orbitmines.com/archive/on-orbits-equivalence-and-inconsistencies#:~:text=On%20Equivalences%20%26%20Inconsistencies
   */
  static equivalent = Ray.___func(ref => {
    let { initial, terminal} = ref.self;

    /**
     * The simplest case, is where both sides are only aware of themselves (on .vertex). The only thing we need to do is turn an Orbit, to an Orbit which repeats every 2 steps, the intermediate step being the other thing.
     *
     * Or in textual terms something like:
     *  - A single Orbit:  `(A.self = A) | (B.self = B)`  (i.e. A.is_none && B.is_none)
     *  -             To:  `(A.self = B) | (B.self = A)`
     *
     * Basically turns `A` into a reference to `B`, and `B` into a reference to `A`.
     */
    const ignorant_equivalence = (): Ray => {
      return initial.___ignorantly_equivalent(terminal);
    }

    // 2x Ray.None -> Turn into 2 empty references, referencing each-other.
    if (
      initial.dereference.is_none() && terminal.dereference.is_none()
      && !(initial.type === RayType.VERTEX && terminal.type === RayType.VERTEX)
    ) {
      // throw new PreventsImplementationBug(`${initial.type} / ${terminal.type}`)
      return ignorant_equivalence();
    }

    // Two structures, which have `ref.self = Ray.None` -> Turn into two structures which are on a line in between them.
    if (initial.dereference.is_none()) {
      const vertex = Ray.vertex().o({ js: '___as_vertex' }).as_reference().o({ js: '___as_vertex.#' });
      vertex.self.self = initial.self.as_arbitrary();
      initial.self.self = vertex.self.as_arbitrary();

      // initial.equivalent(terminal);
      // return terminal;
    }
    if (terminal.dereference.is_none()) {
      const vertex = Ray.vertex().o({ js: '___as_vertex' }).as_reference().o({ js: '___as_vertex.#' });
      vertex.self.self = terminal.self.as_arbitrary();
      terminal.self.self = vertex.self.as_arbitrary();

      // initial.equivalent(terminal.___as_vertex());
      // return terminal;
    }

    if (
      initial.dereference.type !== RayType.VERTEX
      || terminal.dereference.type !== RayType.VERTEX
      || initial.dereference.self === initial.self
      || terminal.dereference.self === terminal.self
    ) {
      throw new PreventsImplementationBug('wut')
    }

    if (initial.follow().type !== RayType.TERMINAL || terminal.follow(Ray.directions.previous).type !== RayType.INITIAL) {
      throw new PreventsImplementationBug('wut2')
    }

    // if (terminal.self.any.js === 'D')
    //   throw new PreventsImplementationBug();

    initial.dereference.compose(terminal.dereference);

    return terminal;

    // initial.dereference.compose()
    // return terminal;
  });
  equivalent = Ray.equivalent.as_method(this);

  // static equivalent = Ray.___func(ref => {
  //   let { initial, terminal} = ref.self;
  //
  //   /**
  //    * The simplest case, is where both sides are only aware of themselves (on .vertex). The only thing we need to do is turn an Orbit, to an Orbit which repeats every 2 steps, the intermediate step being the other thing.
  //    *
  //    * Or in textual terms something like:
  //    *  - A single Orbit:  `(A.self = A) | (B.self = B)`  (i.e. A.is_none && B.is_none)
  //    *  -             To:  `(A.self = B) | (B.self = A)`
  //    *
  //    * Basically turns `A` into a reference to `B`, and `B` into a reference to `A`.
  //    */
  //   const ignorant_equivalence = (): Ray => {
  //     return initial.___ignorantly_equivalent(terminal);
  //   }
  //
  //   // 2x Ray.None -> Turn into 2 empty references, referencing each-other.
  //   if (initial.is_none() && terminal.is_none())
  //     return ignorant_equivalence();
  //
  //   // Two structures, which have `ref.self = Ray.None` -> Turn into two structures referencing each-other.
  //   if (initial.dereference.is_none() && terminal.dereference.is_none())
  //     return ignorant_equivalence();
  //
  //   if (
  //     (initial.is_vertex() && terminal.is_boundary())
  //     || (terminal.is_vertex() && initial.is_boundary())
  //   ) {
  //     throw new NotImplementedError(`Parallel composition: TODO`);
  //   }
  //
  //   /**
  //    * - Splits the 'initial' side's vertex, into an iterable one, and returns a pointer to the initial side of that iterator.
  //    *
  //    * - Similarly, we do the opposite for the terminal, returning the terminal side of that iterator.
  //    *
  //    * - Then we're left with the 'beginning' of one iterator, and the 'end' of the other. And the only thing that's left to do, is draw a simple (ignorant) equivalence between the two. (Basically call this function again, and call {ignorant_equivalence}).
  //    *    TODO: This could also be a line with some debug information.
  //    */
  //   const a = initial.as_terminal();
  //   const b = terminal.as_initial();
  //
  //   if (a.type !== RayType.TERMINAL)
  //     throw new PreventsImplementationBug();
  //   if (b.type !== RayType.INITIAL)
  //     throw new PreventsImplementationBug();
  //
  //   if (!a.self.self.is_none())
  //     throw new PreventsImplementationBug(`${b.self.self.any.js}`);
  //   if (!b.self.self.is_none())
  //     throw new PreventsImplementationBug(`${b.self.self.any.js}`);
  //
  //   a.equivalent(b);
  //
  //   const ret = terminal;
  //
  //   if (ret.type !== RayType.VERTEX)
  //     throw new PreventsImplementationBug(`${ret.type}`);
  //
  //   return ret;
  // });
  // equivalent = Ray.equivalent.as_method(this);

  // zip also compose???
  // [a, b, c] zip [d, e, f] zip [g, h, i] ...
  // [[a,d,g],[b,e,h],[c,f,i]]
  static zip = Ray.___func(ref => {
    let { initial, terminal } = ref.self;

    if (initial.as_reference().type !== RayType.REFERENCE || terminal.as_reference().type !== RayType.REFERENCE)
      throw new PreventsImplementationBug('TODO: Implement');

    if (initial.type !== RayType.VERTEX || terminal.type !== RayType.VERTEX)
      throw new PreventsImplementationBug('TODO: Implement');

    throw new NotImplementedError();
    // initial.traverse()
    // return new Ray({
    //
    // });
  });
  zip = Ray.zip.as_method(this);

  // pop = (): Ray => {
  // this.last().previous().all.terminal = (ref) => ref.___empty_terminal();
  // }
  pop = (): Ray => this.___primitive_switch({
    [RayType.VERTEX]: () => {
      const previous_vertex = this.self.initial.follow(Ray.directions.previous);

      if (this.is_none()) {
        return this; // TODO; Already empty, perhaps throw
      }

      return previous_vertex.___primitive_switch({
        [RayType.VERTEX]: () => {
          console.log(previous_vertex)
          // TODO: NONHACKY

          previous_vertex.self.terminal = new Ray({ vertex: Ray.None, initial: previous_vertex.self.as_arbitrary() }).o({ debug: 'terminal ref'}).as_arbitrary()
          return previous_vertex;
        }
      });
    }
  });


  // static sn = (step: Implementation): {
  //   as_method: ArbitraryMethod
  // } => {
  //
  //   return {
  //     as_method: Ray.___func(step).as_method
  //   }
  // }

  /**
   * Constructs a function accepting arbitrary structure based on one implementation of it.
   *
   * TODO: Is there some equivalent of this in computer science??? category theory??
   *
   * a.compose(b).compose(c) = [a, b, c].compose = abc.compose = [[a1, a2], b, c].compose = [[a1, a2], b, [c1, c2]].compose = [[a1, [[[a2]]], [[[[]]], []]], b, [[[]], [], [c]]].compose = ...
   */
  static ___func(
    step: Implementation,
  ): {
    as_method: ArbitraryMethod
  } {
    return {

      /**
       * Puts the Ray this is called with on a new Ray [initial = ref, ???, ???]. Then it places any structure it's applying a method to, on the terminal of this new Ray [initial = ref, ???, terminal = any]
       */
      as_method: (ref: Ray): Method => (...any: Recursive): Ray => {
        if (any === undefined || any.length === 0)
          return step(ref);

        // TODO: This can be much better...
        const first = (recursive?: Recursive): Ray | undefined => {
          if (recursive === undefined) return;
          // if (_.isObject(recursive)) return recursive as unknown as Ray;

          for (let r of recursive) {
            if (r === undefined) continue;
            if (_.isObject(r)) return r as unknown as Ray;

            // if (r instanceof Ray)
            //   throw new PreventsImplementationBug();

            // @ts-ignore
            const _first = first(r);
            if (_first)
              return _first;
          }
        }

        const _first = first(any);

        if (_first === undefined)
          return step(ref);

        const pointer = new Ray({
          initial: () => ref,
          terminal: () => _first
        });

        return step(pointer);

        // TODO: ANY CASE
        // if (any.length === 1) {
        // }
      }
    }
  }

  /**
   * Helper methods for commonly used directions
   *
   * TODO: Link to step-wise walk as any function - lazy, not traversing certain paths, etc.. (for last/..)
   */
  static directions = {
    next: (ref: Ray) => ref.self.terminal.as_reference(),
    previous: (ref: Ray) => ref.self.initial.as_reference(),
  }

  // TODO: Nicer one? ; Differentiate between ".next" and just "follow the pointer" ?
  follow = (step: Implementation = Ray.directions.next): Ray => {
    // let pointer = new Ray({
    //   initial: () => this,
    //   terminal: () => step(this),
    // }); TODO USE POINTER?

    return step(this);
  }

  /**
   * .next
   */
  next = (step: Implementation = Ray.directions.next): Ray => {
    // for (let next of this.___next({step})) {
    //
    //   // return next;
    // }
    //
    // return Ray.None();
    let pointer = new Ray({
      initial: () => this,
      terminal: () => step(this),
    });

    pointer = pointer.step().step();

    if (pointer.terminal.type !== RayType.VERTEX)
      throw new NotImplementedError(`${pointer.terminal.type} / ${pointer.terminal.self.any.js}`);

    return pointer.terminal;

    // return Ray.___next(Ray.directions.next)(this);
  }
  has_next = (step: Implementation = Ray.directions.next): boolean => this.next(step).is_some();
  // @alias('end', 'result', 'back')
  last = (step: Implementation = Ray.directions.next): Ray => {
    const next = this.next(step);
    return next.is_some() ? next.last(step) : this;
  }
  /**
   * .previous (Just .next with a `Ray.directions.previous` default)
   */
  previous = (step: Implementation = Ray.directions.previous): Ray => this.next(step);
  has_previous = (step: Implementation = Ray.directions.previous): boolean => this.has_next(step);
  // @alias('beginning', 'front')
  first = (step: Implementation = Ray.directions.previous): Ray => this.last(step);

  // TODO: I Don't like this name, but it needs to get across that any equivalency, or any equivalency check for that necessarily, is local. And I want more equivalences, I run more of this method.
  // TODO: For chyp used to compare [vtype, size] as domains, just type matching on the vertex.
  is_vertex_equivalent = (b: Ray) => {
    // TODO; in the case of a list, each individually, again, additional structure...
  }
  // TODO: Ignore the connection between the two, say a.equiv(b) within some Rule [a,b], ignore the existing of the connection in the Rule? What does it mean not to???

  // TODO: Whether the thing is referenced on the vertex: do their vertices have some connection onm this direction?
  is_equivalent = (b: Ray): boolean => { return false; } // TODOl: Current references assume you can't go inside vertex..
  // TODO implement .not??

  get count(): Ray { return Number(this.as_array().length); }

  // TODO; Could return the ignorant reference to both instances, or just the result., ..

  /**
   * TODO: Need more control over the (non-/)lazyness of copy.
   *
   * - The problem with a copy, is that in or to be generalizable, it needs to alter all references to the thing it's copying to itself - this cannot be done with certainty.
   *
   * - Additionally, a copy necessarily has some non-redundancy to it:
   *   @see "A copy is necessarily inconsistent": https://orbitmines.com/archive/on-orbits-equivalence-and-inconsistencies#:~:text=If%20I%20have%20one%20thing%20and%20I%20make%20a%20perfect%20copy
   */
    // @alias('duplicate')
  copy = (): Ray => {
    // return this.self.as_reference(); // Copies the reference?
    throw new NotImplementedError();

    // const copy = new Ray({
    //   initial: this.self._initial().as_reference().none_or(ref => ref.copy()).as_arbitrary(),
    //   vertex: this.self._vertex().as_reference().none_or(ref => ref.copy()).as_arbitrary(),
    // }).o({ ___dirty_copy_buffer: {} });
    // // copy._initial = () => copy.any.___dirty_copy_buffer._initial ??= this.self._initial().as_reference().copy();
    // // copy._vertex = () => copy.any.___dirty_copy_buffer._vertex ??= this.self._vertex().as_reference().copy();
    // // copy._terminal = () => copy.any.___dirty_copy_buffer._terminal ??= this.self._terminal().as_reference().copy();
    //
    //
    // // TODO: Doesn't copy .any
    //
    // return copy.as_reference();
  }

  // none_or = (arbitrary: Implementation): Ray => this.is_none() ? Ray.None() : arbitrary(this);

  // @alias('converse', 'opposite', 'swap')
  get reverse(): Ray {
    const copy = this;//TODO.copy();

    // TODO: Do we do this lazy by default? Just using refs??? - Or abstract this elsewhere to decide what to do
    const swap = copy.initial;
    copy.initial = copy.terminal.as_arbitrary();
    copy.terminal = swap.as_arbitrary();
    // TODO: This doesn't actually work

    return copy;
  }

  /**
   * TODO - Better 'value' here. (Use JS.Any??)
   *
   * TODO: All these should accept Ray values.
   *
   * .size, since .length is reserved by JavaScript.
   * TODO: .size could be more tensor-like, arbitrary lengths..
   */
    // @alias('length', 'of_length')
  static size = (of: number, value: any = undefined): Ray => {
    let ret: Ray | undefined;
    let current: Ray | undefined;
    // TODO: Actual good implementation: Should be lazy
    for (let i = 0; i < of; i++) {
      const vertex = Ray.vertex().o({js: value}).as_reference();

      if (!ret) {
        current = ret = vertex;
      } else {
        current = current?.compose(vertex);
      }
    }

    if (!ret)
      return Ray.None();

    return ret;
  }
  static at = (index: number, of: number, value: any = undefined): Ray => {
    return Ray.size(of, value).at(index);
  }
  /**
   * Just uses length/size for permutation. TODO: More complex permutation/enumeration implementation should follow at some point. (@see https://orbitmines.com/archive/on-orbits-equivalence-and-inconsistencies#:~:text=One%20of%20them%20could%20even%20be%20putting%20both%20our%20points%20on%20our%20selection for an example)
   *
   * @see "Combinatorics as Equivalence": https://orbitmines.com/archive/on-orbits-equivalence-and-inconsistencies#:~:text=Constructing%20Combinatorics%20%2D%20Combinatorics%20as%20Equivalence
   */
  static permutation = (permutation: number | undefined, of: number): Ray => Ray.at(
    // In the case of a bit: 2nd value for '1' (but could be the reverse, if our interpreter does this)
    permutation ?? 0,
    // In the case of a bit: Either |-*-| if no bit or |-*->-*-| if a bit.
    permutation === undefined ? 1 : of
  )

  at = (steps: number | Ray | Arbitrary<Ray>): Ray => {
    if (!is_number(steps))
      throw new NotImplementedError('Not yet implemented for Rays.');

    // TODO: Actual good implementation - also doesn't support modular like this
    const array = [...this.traverse(
      steps < 0 ? Ray.directions.previous : Ray.directions.next
    )];

    steps = Math.abs(steps);

    return array.length > steps && steps >= 0 ? (
      array[steps] ?? Ray.None() // TODO FIX: Probably a JavaScript quirck with some weird numbers, just failsafe to None.
    ) : Ray.None();
  }

  // const hexadecimal = (hexadecimal?: string): Arbitrary<Ray<any>> => permutation(hexadecimal ? parseInt(hexadecimal, 16) : undefined, 16);

  // TODO: Should give the program that does the mapping, not the result, and probably implemented as 'compile/traverse'
  map = (mapping: (ray: Ray) => Ray | any): Ray => { throw new NotImplementedError(); }
  // filter = (mapping: (ray: Ray) => Ray | any): Ray => { throw new NotImplementedError(); }
  get clear(): Ray { throw new NotImplementedError(); }

  // TODO: Generalize these functions to:
  //
  // TODO: +default, in the case of Initial/Terminal = Ray.None, to which the default sometimes is nothing. Or in the case of min/max it's 0.


  // TODO: being called min.x needs to return the min value within that entire structure.

  // [this.vertices().x.max(), this.edges().x.max()].max()
  // [this.vertices().x.min(), this.edges().x.max()].max()
  // TODO: Indicies not corresponding the the directionality defined, are probably on another abstraction layer described this way. More accurately, they're directly connected, and on a separate layer with more stuff in between...
  get index(): Ray { throw new NotImplementedError(); }
  // TODO: Can probably generate these on the fly, or cache them automatically
  min = (_default: 0): Ray => { throw new NotImplementedError(); }
  max = (_default: 0): Ray => { throw new NotImplementedError(); }

  // TODO: FIND OUT IF SOMEONE HAS A NAME FOR THIS
  // apply = (func: Ray) => {

  // TODO: Combine into generalized [x, min/max()] - preserve terminal/initial structure
  // TODO: ray#apply.
  // TODO: FROM COMPOSER
  /**
   *  const func = [min(), '', max()]
   *
   *      const [min_x, max_x] = [
   *       // Compute the min x-coordinate of the edges and vertices in the other graph.
   *       compose.terminal.x.min(), // min_other
   *
   *       // Compute the max x-coordinate of the edges and vertices in this graph.
   *       compose.initial.x.max(), // max_self
   *     ]
   */
  // }

  // ___compute = ()

  *traverse(step: Implementation = Ray.directions.next): Generator<Ray> {
    // TODO: Also to ___func??

    if (this.type !== RayType.VERTEX)
      throw new NotImplementedError(`[${this.type}]`);

    yield *this.___next({step});
  }

  static pointer = (initial: Ray, step: Implementation): Ray => new Ray({
    initial: () => initial,
    terminal: () => step(initial)
  });

  private next_pointer = (step: Implementation) => {
    const { self: history, terminal: current } = this;

    return new Ray({
      initial: current.as_arbitrary(),
      vertex: history.as_arbitrary(),
      terminal: () => current.follow(step)
    });
  };

  /**
   *      VERTEX (current)
   *         |
   *         v
   *
   *         ?        <-- Pointer B
   *      [--|  ]     <-- INITIAL/TERMINAL (previous)
   *         ?        <-- Pointer A
   */
  private branch = (): [Ray, Ray] => {
    const { initial: previous, terminal: current } = this;

    if (!previous.is_boundary())
      throw new PreventsImplementationBug('Only branching off INITIAL/TERMINAL -> VERTEX for now.');
    if (current.type !== RayType.VERTEX)
      throw new PreventsImplementationBug('Only branching off INITIAL/TERMINAL -> VERTEX for now.');

    return [
      this.next_pointer(Ray.directions.previous),
      this.next_pointer(Ray.directions.next)
    ];
  }

  *___next({
             step = Ray.directions.next,
           } = {}): Generator<Ray> {
    for (let pointer of this.___traverse({step})) {

      // TODO: You can do this non-locally with a pass over the history. This way it's local, but we''ll have to find a good example of why this might not go that well. (As this would match to any empty vertices, and maybe more)

      // TODO: Could also check for none..
      const { initial: previous, terminal: current } = pointer;

      if (previous.is_vertex() && !Ray.is_orbit(previous.self, current)) {
        yield pointer.initial;
      }
    }
  }
  *___map<T>(map: (vertex: Ray) => T, {
    step = Ray.directions.next,
  } = {}): Generator<T> {
    for (let vertex of this.___next({step})) {
      yield map(vertex);
    }
  }

  /**
   * TODO: Not happy with this...
   */
  *___traverse({
                 step = Ray.directions.next,
                 should_branch = (pointer: Ray) => {
                   const { initial: previous, terminal: current } = pointer;
                   return previous.is_boundary() && current.is_vertex() && Ray.is_orbit(current.self, previous);
                 },
                 branch = (pointer: Ray): [Ray, Ray] => pointer.branch(),
                 filter = (pointer: Ray): boolean => true,
                 next = (pointers: Ray[]): Ray => pointers[0],
                 remove = (pointers: Ray[], pointer: Ray) => delete pointers[0],
               } = {}): Generator<Ray> {
    const pointers: Ray[] = [
      Ray.vertex(Ray.pointer(this, step).as_arbitrary())
    ]; // TODO COuld be a ray;

    while (true) {

      const ref = next(pointers);
      if (ref === undefined) {
        // TODO: Could just keep trying...
        break;
      }
      let { self: pointer } = ref;

      if (!filter(pointer)) {
        remove(pointers, pointer);
        continue;
      }

      yield pointer;

      pointer = pointer.step();

      if (pointer.terminal.is_none()) {
        remove(pointers, pointer);
        continue;
      }

      if (should_branch(pointer)) {
        const [a, b] = branch(pointer);

        ref.self = a.as_arbitrary();
        pointers.push(Ray.vertex(b.as_arbitrary()));
      } else {
        ref.self = pointer.as_arbitrary();
      }
    }
  }

  /**
   *
   *
   * TODO: switch/match Should be abstracted into Ray?
   */
  static step = (ref: Ray) => {
    const { initial } = ref;

    /**
     * Should return vertex, for one possible next step
     * Initial for many
     * Terminal for none
     * Reference for ???
     */

    /**
     * Dereferencing is likely in many cases quickly subject to infinite stepping.
     *
     * REFERENCE          -> Dereference (this.self.self)
     * INITIAL/INITIAL    -> Dereference (this.self.terminal)
     * TERMINAL/TERMINAL  -> Dereference (this.self.initial)
     * VERTEX/VERTEX      -> ???
     *
     * - Could be that this means that there's no continuation, a self-reference defined here, or it's some mechanism of halting.
     *
     * - TODO: Simple example of infinitely finding terminals, or a reference to 'nothing - infinitely'.
     * - TODO: Could return both dereference sides as possible options
     */

    const next_pointer = (terminal: Ray, next: Arbitrary<Ray>) => new Ray({
      initial: () => terminal,
      vertex: () => ref,
      terminal: next,
    });

    /**
     * INITIAL/TERMINAL -> possible previous  - TERMINAL.self.initial   (pass to step)
     * TERMINAL/INITIAL -> possible next      - INITIAL.self.terminal   (pass to step)
     */
    const follow_direction = (terminal: Ray): Ray => next_pointer(terminal, () => terminal.___primitive_switch({
      [RayType.INITIAL]: Ray.directions.next,
      [RayType.TERMINAL]: Ray.directions.previous,
    }));

    const dereference = (terminal: Ray) => next_pointer(terminal, () => terminal.dereference);

    /**
     * TERMINAL -> VERTEX (next: VERTEX -> INITIAL)
     * INITIAL -> VERTEX (next: VERTEX -> TERMINAL)
     */
    const arbitrary_continuations = (terminal: Ray): Ray => next_pointer(terminal, () => initial.___primitive_switch({
      [RayType.INITIAL]: (initial) => Ray.directions.next(terminal),
      [RayType.TERMINAL]: (initial) => Ray.directions.previous(terminal),
    }));

    const boundary = (boundary: Boundary) => (terminal: Ray): Ray => terminal.___primitive_switch({

      /**
       * Many possible continuations (from the perspective of initial = TERMINAL)
       *
       * From something, we arrived at some TERMINAL/INITIAL, which at its `.self`, holds a VERTEX.
       *        [  ?  ]
       * [--|--][--|  ]         <-- ref superposed with ref.self
       *        [  ?  ]
       */
      [RayType.VERTEX]: arbitrary_continuations,

      /**
       * A possible continuation
       *
       * (INITIAL -> TERMINAL)
       * (TERMINAL -> INITIAL)
       */
      [boundary]: follow_direction,
      [opposite(boundary)]: follow_direction,

      [RayType.REFERENCE]: dereference,
    });

    return initial.___primitive_switch({

      /**
       * VERTEX -> VERTEX
       * TODO Could be an ignorant continuation (as in, the terminal does not have the initial vertex on its .initial). Or you could interpret this as saying, oh this should be a vertex, no information about the continuation definition in between?
       *
       * VERTEX -> TERMINAL
       * If we're going in the terminal direction (from the perspective of the initial = VERTEX)
       *        [--|--][--|  ]  <-- (VERTEX -> TERMINAL)
       *
       * VERTEX -> INITIAL
       * If we're going in the initial direction (from the perspective of the initial = VERTEX)
       * [  |--][--|--]         <-- (VERTEX -> INITIAL)
       *
       * VERTEX -> REFERENCE
       * TODO ???
       */
      [RayType.VERTEX]: (initial) => dereference(ref.terminal),

      [RayType.INITIAL]: (initial)  => boundary(RayType.INITIAL)(ref.terminal),
      [RayType.TERMINAL]: (initial) => boundary(RayType.TERMINAL)(ref.terminal),

      [RayType.REFERENCE]: dereference,
    });
  }
  step= Ray.___func(Ray.step).as_method(this);

  // TODO; Maybe replace switch with 'zip'?, What are the practical differences?
  protected ___primitive_switch = (cases: SwitchCases): Ray => {
    const _case = cases[this.type];

    if (_case === undefined || _.isString(_case))
      { // @ts-ignore
        throw new PreventsImplementationBug(_case ?? `Unhandled switch case; [${this.type}]`);
      }

    return _case(this);
  }

  /**
   * JavaScript, possible compilations - TODO: Could have enumeratd possibilities, but just ignore that for now.
   */
  // JS.AsyncGenerator
  async *[Symbol.asyncIterator](): AsyncGenerator<Ray> { yield *this.traverse(); }
  // JS.Generator
  *[Symbol.iterator](): Generator<Ray> { yield *this.traverse(); }
  // JS.AsyncGenerator
  as_async_generator = (): AsyncGenerator<Ray> => this[Symbol.asyncIterator]();
  // JS.AsyncIterator
  as_async_iterator = (): AsyncIterator<Ray> => this.as_async_generator();
  // JS.Iterator
  as_generator = (): Generator<Ray> => this[Symbol.iterator]();
  // JS.AsyncIterator
  as_iterator = (): Iterator<Ray> => this.as_generator();
  // JS.Array
  as_array = (): Ray[] => [...this];
  // JS.String
  toString = (): string => this.as_string();
  as_string = (): string => this.as_array().map(ref => ref.any.js).join(','); // TODO: PROPER

  as_int = (): number => { throw new NotImplementedError(); }
  as_number = this.as_int;

  /**
   *
   * TODO:
   *   - This needs something much smarter at some point...
   */
  all = (step: Implementation = Ray.directions.next): { [key: string | symbol]: Ray } & any => {
    return new Proxy<Ray>(this, {

      get(self: Ray, p: string | symbol, receiver: any): any {

        return self.___map(ref => ref.any[p], {step});
      },

      /**
       * Can't overload things like '-=' for anything but things that return numbers... ; So just apply a general function instead.
       */
      set(self: Ray, p: string | symbol, newValue: any, receiver: any): boolean {
        for (let ref of self.___next({step})) { // TODO; This needs to either be dynamically, or just a simple shut-off for circular ones.
          ref.any[p] = is_function(newValue) ? newValue(ref.any[p]) : newValue;
        }

        return true;
      },


      deleteProperty(self: Ray, p: string | symbol): boolean {
        throw new NotImplementedError();

        return true;
      }
      // TODO: What do these other methods on Proxy do???
    });

  }

  /**
   * Move to a JavaScript object, which will handle any complexity of existing JavaScript objects, and allows one to abstract any values contained in the {vertex} to the usual JavaScript interface. - More usual to how one thinks about functions, ..., properties.
   */
  get any(): { [key: string | symbol]: Ray } & any { return this.self.proxy(); }
  get ___any(): { [key: string | symbol]: Ray } & any { return this.proxy(); }
  cast = <T extends Ray>(): T => { throw new NotImplementedError(); } // TODO this.proxy<T>();

  /**
   * Used for chaining JavaScript-provided properties
   *
   * TODO: DOESNT FOLLOW .ANY PATTERN?
   */
  o = (object: { [key: string | symbol]: any }): Ray => {
    _.keys(object).forEach(key => this.proxy()[key] = object[key]); // TODO: Can be prettier, TODO: map to Ray equivalents and add to vertices..
    return this;
  }

  // All these are dirty
  o2 = ({ initial, vertex, terminal }: any): Ray => {
    if (initial) this.initial.o(initial);
    if (vertex) this.o(vertex);
    if (terminal) this.terminal.o(terminal);

    return this;
  }

  protected property = (property: string | symbol, _default?: any): any => this.any[property] ??= (_default ?? Ray.None()); // TODO: Can this be prettier??

  protected _proxy: any;
  protected _dirty_store: { [key: string | symbol]: object } = {}
  protected proxy = <T = any>(constructor?: ParameterlessConstructor<T>): T & { [key: string | symbol]: Ray } => { // TODO:
    // TODO: IMPLEMENT SPLAT... {...ray.any}
    return this._proxy ??= new Proxy<Ray>(this, {

      get(self: Ray, p: string | symbol, receiver: any): any {

        // throw new NotImplementedError();
        return self._dirty_store[p];
        // return self.as_arbitrary();
      },
      set(self: Ray, p: string | symbol, newValue: any, receiver: any): boolean {
        // throw new NotImplementedError();
        self._dirty_store[p] = newValue;

        return true;
      },

      deleteProperty(self: Ray, p: string | symbol): boolean {
        if (!(p in self._dirty_store)) {
          return false;
        }

        delete self._dirty_store[p];
        return true;
      }
      // TODO: What do these other methods on Proxy do???
    }) as T;
  }

  /**
   *
   * - Don't assume we can track back any reference to this thing. Just destroy it, set everything to None. And let anything else deal with the consequences of the deletion.
   *
   * TODO:
   *   - Could lazily try to find references.
   *   - Implement on proxy for 'delete ray'
   */
  delete = (): Ray => {
    this.self.initial = Ray.None;
    this.self.self = this.self.self_reference;
    this.self.terminal = Ray.None;
    // TODO: REMOVE THESE
    this.self._proxy = undefined;
    this.self._dirty_store = {};

    // Removes the current reference to it.
    this.self = this.self_reference;

    return this;
  }

  //TODO USED FOR DEBUG NOW
  move = (func: (self: Ray) => Ray, memory: boolean, Interface: Ray): Ray => {
    const target_ray = func(this.self);

    const target = target_ray.as_reference().o({
      ...this._dirty_store,
      position:
        target_ray.any.position
        ?? this.any.position
        ?? Ray.POSITION_OF_DOOM
    });
    console.log('move', `${this.self.label.split(' ')[0]} -> ${target.self.label.split(' ')[0]}`);

    if (memory) {
      if (!target_ray.any.traversed) {
        Interface.___any.rays.push(target);
        target_ray.any.traversed = true;
      }
    } else {
      Interface.___any.rays = [target];
    }

    return target;
  }

  static POSITION_OF_DOOM = [0, 100, 0]

  // TODO: Abstract away as compilation
  render_options = (Interface: Ray): Required<InterfaceOptions> => {
    return ({
      position:
        this.any.position
        ?? (this.is_none() ? Ray.POSITION_OF_DOOM : Ray.POSITION_OF_DOOM),
      rotation:
        this.any.rotation
        ?? [0, 0, 0],
      scale:
        this.any.scale
        ?? (this.is_none() ? 1.5 : 1.5),
      color:
        (Ray.is_orbit(Interface.___any.selection.self, this.self) && Interface.___any.cursor.tick) ? '#AAAAAA' // TODO: Should do lines as well, line render should prefer based on level of description.. (flat line only vertices, then render for the vertex?)
          : (
            this.any.color
            ?? (this.is_none() ? 'red' : {
                [RayType.VERTEX]: 'orange',
                [RayType.TERMINAL]: '#FF5555',
                [RayType.INITIAL]: '#5555FF',
                [RayType.REFERENCE]: '#555555',
              }[this.type]
            )
          )
    });
  }

  ___dirty_all(c: Ray[]): Ray[] {
    if (c.filter(a => a.label === this.label).length !== 0) {
      return c;
    }

    c.push(this);

    if (this.initial.as_reference().is_some())
      this.initial.___dirty_all(c);
    if (this.vertex.as_reference().is_some())
      this.vertex.___dirty_all(c);
    if (this.terminal.as_reference().is_some())
      this.terminal.___dirty_all(c);

    return c;
  }

  // TODO: DOESNT DO ON .SELF
  debug = (c: DebugResult): DebugRay => {
    if (c[this.label] !== undefined)
      return c[this.label]!;

    const of = (ray: Ray): string => {
      if (ray.as_reference().is_none()) return 'None';

      ray.debug(c);
      return ray.label;
    }

    const obj: any = { label: this.label };
    c[this.label] = obj;

    obj.label = this.label;
    obj.initial = of(this.initial);
    obj.vertex = of(this.vertex);
    obj.terminal = of(this.terminal);
    obj.type = this.as_reference().type;
    obj.is_initial = this.as_reference().is_initial();
    obj.is_vertex = this.as_reference().is_vertex();
    obj.is_terminal = this.as_reference().is_terminal();
    obj._dirty_store = this._dirty_store;

    return obj;
  }

  /**
   * TODO: This should be constructed at the vertex and in general unsolvable
   */
  static _label: number = 0;
  get label(): string {
    if (this.any.label !== undefined)
      return this.any.label;

    return this.any.label = `"${Ray._label++} (${this.any.debug?.toString() ?? '?'})})"`;
  }

  push_back = (b: Ray) => this.last().compose(b);
  push_front = (b: Ray) => this.first().compose(b);

  // [index: number]: Ray;

  // length: number;
  //
  // concat(...items: ConcatArray<Ray>[]): Ray[];
  // concat(...items: (ConcatArray<Ray> | Ray)[]): Ray[];
  // concat(...items: (ConcatArray<Ray> | Ray)[]): Ray[] {
  //   return [];
  // }
  //
  // copyWithin(target: number, start: number, end?: number): this {
  //   return undefined;
  // }
  //
  // entries(): IterableIterator<[number, Ray]> {
  //   return undefined;
  // }
  //
  // every<S extends Ray>(predicate: (value: Ray, index: number, array: Ray[]) => value is S, thisArg?: any): this is S[];
  // every(predicate: (value: Ray, index: number, array: Ray[]) => unknown, thisArg?: any): boolean;
  // every(predicate, thisArg?: any): any {
  // }
  //
  // fill(value: Ray, start?: number, end?: number): this {
  //   return undefined;
  // }
  //
  // filter<S extends Ray>(predicate: (value: Ray, index: number, array: Ray[]) => value is S, thisArg?: any): S[];
  // filter(predicate: (value: Ray, index: number, array: Ray[]) => unknown, thisArg?: any): Ray[];
  // filter(predicate, thisArg?: any): any {
  // }
  //
  // find<S extends Ray>(predicate: (value: Ray, index: number, obj: Ray[]) => value is S, thisArg?: any): S | undefined;
  // find(predicate: (value: Ray, index: number, obj: Ray[]) => unknown, thisArg?: any): Ray | undefined;
  // find(predicate, thisArg?: any): any {
  // }
  //
  // findIndex(predicate: (value: Ray, index: number, obj: Ray[]) => unknown, thisArg?: any): number {
  //   return 0;
  // }
  //
  // forEach(callbackfn: (value: Ray, index: number, array: Ray[]) => void, thisArg?: any): void {
  // }
  //
  // indexOf(searchElement: Ray, fromIndex?: number): number {
  //   return 0;
  // }
  //
  // join(separator?: string): string {
  //   return "";
  // }
  //
  // keys(): IterableIterator<number> {
  //   return undefined;
  // }
  //
  // lastIndexOf(searchElement: Ray, fromIndex?: number): number {
  //   return 0;
  // }
  //
  // map<U>(callbackfn: (value: Ray, index: number, array: Ray[]) => U, thisArg?: any): U[] {
  //   return [];
  // }
  //
  // pop(): Ray | undefined {
  //   return undefined;
  // }
  //
  // push(...items: Ray[]): number {
  //   return 0;
  // }
  //
  // reduce(callbackfn: (previousValue: Ray, currentValue: Ray, currentIndex: number, array: Ray[]) => Ray): Ray;
  // reduce(callbackfn: (previousValue: Ray, currentValue: Ray, currentIndex: number, array: Ray[]) => Ray, initialValue: Ray): Ray;
  // reduce<U>(callbackfn: (previousValue: U, currentValue: Ray, currentIndex: number, array: Ray[]) => U, initialValue: U): U;
  // reduce(callbackfn, initialValue?): any {
  // }
  //
  // reduceRight(callbackfn: (previousValue: Ray, currentValue: Ray, currentIndex: number, array: Ray[]) => Ray): Ray;
  // reduceRight(callbackfn: (previousValue: Ray, currentValue: Ray, currentIndex: number, array: Ray[]) => Ray, initialValue: Ray): Ray;
  // reduceRight<U>(callbackfn: (previousValue: U, currentValue: Ray, currentIndex: number, array: Ray[]) => U, initialValue: U): U;
  // reduceRight(callbackfn, initialValue?): any {
  // }
  //
  // reverse(): Ray[] {
  //   return [];
  // }
  //
  // shift(): Ray | undefined {
  //   return undefined;
  // }
  //
  // slice(start?: number, end?: number): Ray[] {
  //   return [];
  // }
  //
  // some(predicate: (value: Ray, index: number, array: Ray[]) => unknown, thisArg?: any): boolean {
  //   return false;
  // }
  //
  // sort(compareFn?: (a: Ray, b: Ray) => number): this {
  //   return undefined;
  // }
  //
  // splice(start: number, deleteCount?: number): Ray[];
  // splice(start: number, deleteCount: number, ...items: Ray[]): Ray[];
  // splice(start: number, deleteCount?: number, ...items: Ray[]): Ray[] {
  //   return [];
  // }
  //
  // unshift(...items: Ray[]): number {
  //   return 0;
  // }
  //
  // values(): IterableIterator<Ray> {
  //   return undefined;
  // }
  //
  // findLast<S extends Ray>(predicate: (value: Ray, index: number, array: Ray[]) => value is S, thisArg?: any): S | undefined;
  // findLast(predicate: (value: Ray, index: number, array: Ray[]) => unknown, thisArg?: any): Ray | undefined;
  // findLast(predicate, thisArg?: any): any {
  // }
  //
  // findLastIndex(predicate: (value: Ray, index: number, array: Ray[]) => unknown, thisArg?: any): number {
  //   return 0;
  // }
  //
  // flat<A, D = 1 extends number>(depth?: D): FlatArray<A, D>[] {
  //   return [];
  // }
  //
  // flatMap<U, This = undefined>(callback: (this: This, value: Ray, index: number, array: Ray[]) => (ReadonlyArray<U> | U), thisArg?: This): U[] {
  //   return [];
  // }
  //
  // includes(searchElement: Ray, fromIndex?: number): boolean {
  //   return false;
  // }
  //
  // toReversed(): Ray[] {
  //   return [];
  // }
  //
  // toSorted(compareFn?: (a: Ray, b: Ray) => number): Ray[] {
  //   return [];
  // }
  //
  // toSpliced(start: number, deleteCount: number, ...items: Ray[]): Ray[];
  // toSpliced(start: number, deleteCount?: number): Ray[];
  // toSpliced(start: number, deleteCount?: number, ...items: Ray[]): Ray[] {
  //   return [];
  // }
  //
  // with(index: number, value: Ray): Ray[] {
  //   return [];
  // }


}

//     default = (fn: () => any): any => self.match({
//         Some: (a) => a,
//         None: () => fn()
//     })
//


/**
 *
 * Important to remember this is just one particular structure to which it can be mapped, there are probably many (TODO infinitely?) others.
 *
 * Not to be considered as a perfect mapping of JavaScript functionality - merely a practical one.
 */

  const Boolean = (boolean: boolean): Ray => {
    // |-false->-true-| (could of course also be reversed)
    const _false = Ray.vertex().o({ js: false });
    const _true = Ray.vertex().o({ js: true });
    _false.compose(_true);

    return (boolean ? _true : _false).as_reference();
  }
  // const bit = (bit?: boolean): Arbitrary<Ray<any>> => permutation(bit ? 1 : 0, 2);
  const Bit = Boolean;

  const Iterable = <T = any>(iterable: Iterable<T>): Ray => Iterator(iterable[Symbol.iterator]());

  const Iterator = <T = any>(iterator: Iterator<T>): Ray => {
    // [  |--]

    const next = (initial: Ray): Ray => {
      const iterator_result = iterator.next();
      const is_terminal = iterator_result.done === true;

      if (is_terminal) {
        // We're done, this is the end of the iterator

        // vertex: could have something at the vertex which defines the "end of the iterator" - but we don't here.
        const terminal = new Ray({
          initial: () => initial
        });
        // initial.compose(() => terminal.as_reference());

        // if (initial.is_some())
        //   initial.terminal = () => terminal; // TODO REPEAT FROM BELOW

        return terminal;
      }

      const current: Ray = new Ray({
        // initial: () => new Ray(),
        initial: () => initial,
        vertex: () => Any(iterator_result.value),
        terminal: () => next(current)
      }).o({js: iterator_result.value});

      // initial.compose(() => current.as_reference());
      if (initial.is_some())
        initial.terminal = () => current;

      return current;
    }

    const ray_iterator = Ray.None().o({ js: iterator });
    ray_iterator.terminal = () => next(ray_iterator);

    // This indicates we're passing a reference, since traversal logic will be defined at its vertex - what it's defining.
    return ray_iterator.as_reference();
  }

  const Generator = <T = any>(generator: Generator<T>): Ray => Iterable(generator);

  // TODO Could have parallel threads in general.
  // const AsyncGenerator = <T = any>(generator: AsyncGenerator<T>): Ray => {
  //   // [  |--]
  //   return JS.Iterable(generator);
  // }

  const Number = (number: number): Ray => {
    throw new NotImplementedError();
  }

  const Function = (func: Arbitrary<any>): Ray => {
    throw new NotImplementedError();
  }

  const Object = (object: object): Ray => Ray.vertex().o(object);

  const Any = (any: any): Ray => {
    if (any === null || any === undefined) return Any(any);
    if (is_boolean(any)) return Boolean(any);
    if (is_number(any)) return Number(any);
    if (is_iterable(any)) return Iterable(any); // || is_array(any))
    if (is_function(any)) return Function(any);
    if (is_object(any)) return Object(any);

    // TODO
    // return JS.Any(any);
    return Ray.vertex().o({js: any});
  }

  const is_boolean = (_object: any): _object is boolean => _.isBoolean(_object);
  const is_number = (_object: any): _object is number => _.isNumber(_object);
  const is_object = (_object: any): _object is object => _.isObject(_object);
  const is_iterable = <T = any>(_object: any): _object is Iterable<T> => Symbol.iterator in Object(_object);
  const is_async_iterable = <T = any>(_object: any): _object is AsyncIterable<T> => Symbol.asyncIterator in Object(_object);
  const is_array = <T = any>(_object: any): _object is T[] => _.isArray(_object);
  const is_async = (_object: any) => _.has(_object, 'then') && is_function(_.get(_object, 'then')); // TODO, Just an ugly check

  const is_error = (_object: any): _object is Error => _.isError(_object);
  const is_function = (_object: any): _object is ((...args: any[]) => any) => _.isFunction(_object);

class NotImplementedError extends Error {}
class PreventsImplementationBug extends Error {}

/**
 * Temporary Ray visualization till the visualization is incorporated into the editor (Basically when Visualization = Ray)
 *
 * TODO; Generalize to Ray - should be embedded on the vertex, or on another layer of description, where the interface is a rewrite rule
 */
type InterfaceOptions = {
  position?: [number, number, number],
  rotation?: [number, number, number],
  scale?: number,
  color?: string
}
type Options = {
  initial?: InterfaceOptions,
  vertex?: InterfaceOptions,
  terminal?: InterfaceOptions,
}

export const torus = {
  // Radius of the torus, from the center of the torus to the center of the tube. Default is 1.
  radius: 3, color: "orange", segments: 200, tube: { width: 1, segments: 200 },
}
export const add = (a: number[], b: number[]): [number, number, number] => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

export const circle = { radius: 3,  color: "orange", segments: 30, }

export const NoWebGL = () => {
  return <div>No WebGL</div>
}

export type VisualizationProps = {
  context: Omit<PaperProps, 'children'>,
  alt: string,
}

const Visualization = ({}: { }) => {
  return <VisualizationCanvas>

  </VisualizationCanvas>
}

export const CachedVisualizationCanvas = (
    {
      alt,
      context,
      children,
      ...props
    }: React.HTMLAttributes<HTMLElement> & Children & VisualizationProps
) => {
  const ref = useRef<any>(null);
  const [useImage, setUseImage] = useState<boolean>(true);
  let generate;
  try {
    const [params] = useSearchParams();

    generate = params.get('generate');
  } catch (e) {
    generate = 'pdf';
  }

  const exportPng = useCallback(() => {
    if (ref === null)
      return;

    toPng(ref.current, {
      cacheBust: true,
      // backgroundColor: '#1C2127'
    })
        .then((dataUrl) => {
          const link = document.createElement('a')
          link.download = `${alt}.png`
          link.href = dataUrl
          link.click()
        })
        .catch((err) => {
          console.log(err)
        });
  }, [ref]);

  if (context.link === undefined)
    throw 'Cannot have the paper\'s link be undefined when using a cached canvas.'

  const canvasUrl = `${context.link.replace("https://orbitmines.com", "")}/images/${alt}.png`;

  useEffect(() => {
    // Just a quick hack to check if it's loaded (could draw it on the canvas from here, ?)

    const img = new Image();
    img.src = canvasUrl;
    img.onerror = () => {
      setUseImage(false);
    };
  }, []);

  if (useImage) {
    return <CanvasContainer {...props}>
      <canvas
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: `url('${canvasUrl}')`,
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat'
          }}
      />
    </CanvasContainer>
  }

  return <div>
    <div ref={ref}>
      <CanvasContainer {...props}>
        <ThreeJS>{children}</ThreeJS>
      </CanvasContainer>
    </div>
    {generate === 'canvas' ? <Row end="xs">
      {/* eslint-disable-next-line react/jsx-no-undef */}
      <Col> <Button text=".png" icon="media" minimal onClick={exportPng}/></Col>
    </Row> : <></>}
  </div>
}

export const CanvasContainer = ({
                           children,
                           ...props
                         }: React.HTMLAttributes<HTMLElement> & Children) => (<div
    {...{
      id: 'canvas-container',
      ...props,
      style: {
        width: '100%',
        height: '30px', // Height needs to be set (probably because three-fiber checks if there's a value here to resize the canvas dynamically)
        // minHeight: '100vh',
        ...(props.style || {})
      }
      // className="py-20"
    }}
>
  {children}
</div>)

export const ThreeJS = ({ref, children}: Children & { ref?: React.MutableRefObject<any>}) => {
  // https://threejs.org/docs/#manual/en/introduction/WebGL-compatibility-check
  if (!isWebGLAvailable())
    return <NoWebGL/>;

  // console.log('webgl2', isWebGLAvailable());

  /*
    https://docs.pmnd.rs/react-three-fiber/api/canvas
    - Sets up a Scene and a Camera, the basic building blocks necessary for rendering
    - Renders our scene every frame, you do not need a traditional render-loop

    - Canvas is responsive to fit the parent node, so you can control how big it is by changing the parents width and height, in this case #canvas-container.
  */
  return <Canvas
      ref={ref}

      // WebGL
      // - https://threejs.org/docs/#api/en/renderers/WebGLRenderer
      // - https://www.khronos.org/registry/webgl/specs/latest/1.0/#5.2
      gl={{
        antialias: true,
        // stencil: false, depth: false,

        // Controls the default clear alpha value. When set to true, the value is 0 Otherwise it's 1.
        alpha: true,

        // Provides a hint to the user agent indicating what configuration of GPU is suitable for this WebGL context. Can be "high-performance", "low-power" or "default". Default is "default"
        powerPreference: 'high-performance',

        // precision: 'highp'

        // https://threejs.org/docs/#manual/en/introduction/Color-management
        outputColorSpace: SRGBColorSpace,

        // https://threejs.org/docs/index.html#api/en/renderers/WebGLRenderer.toneMapping
        toneMapping: ACESFilmicToneMapping,

        // https://threejs.org/docs/index.html#api/en/renderers/WebGLRenderer.shadowMap
        // shadowMap: {
        //     enabled: false,
        //     type: PCFShadowMap
        // }

        // fixes: https://github.com/niklasvh/html2canvas/issues/1311
        preserveDrawingBuffer: true
      }}

      // https://threejs.org/docs/#api/en/cameras/Camera
      camera={{
        // field of view. FOV is the extent of the scene that is seen on the display at any given moment. The value is in degrees.
        fov: 70,

        // objects further away from the camera than the value of `far` or closer than `near` won't be rendered
        near: 0.1,
        far: 1000,

        position: [0, 0, 1000]
      }}

      // https://threejs.org/docs/#api/en/scenes/Scene
      scene={{}}

      // https://threejs.org/docs/#api/en/core/Raycaster
      raycaster={{}}

      // https://docs.pmnd.rs/react-three-fiber/advanced/scaling-performance#:~:text=set%20the%20canvas-,frameloop,-prop%20to%20demand
      frameloop="always"

      // https://github.com/pmndrs/react-use-measure#api
      resize={{scroll: true, debounce: {scroll: 50, resize: 0}}}

      // https://threejs.org/docs/#api/en/cameras/OrthographicCamera
      // In this projection mode, an object's size in the rendered image stays constant regardless of its distance from the camera.
      orthographic={true}

      // Device pixel ratio (https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio)
      dpr={[1, 2]}

      // true = Switch off automatic sRGB color space and gamma correction
      linear={false}

      // Configuration for the event manager, as a function of state
      // events={}
      // The source where events are being subscribed to, HTMLElement
      // eventSource={}
      // Callback after the canvas has rendered (but not yet committed)
      // onCreated={}
      // Response for pointer clicks that have missed any target
      // onPointerMissed={}

      // The event prefix that is cast into canvas pointer x/y events
      eventPrefix={'offset'}

  >
    {children}

    {/*/!* https://threejs.org/docs/#api/en/objects/Mesh *!/*/}
    {/*<mesh>*/}
    {/*    /!**/}
    {/*    https://threejs.org/docs/#api/en/lights/AmbientLight*/}
    {/*    - This light globally illuminates all objects in the scene equally.*/}
    {/*    - This light cannot be used to cast shadows as it does not have a direction.*/}
    {/*    *!/*/}

    {/*    /!* https://threejs.org/docs/#api/en/lights/DirectionalLight *!/*/}
    {/*    /!*<directionalLight color="red" position={[0, 0, 5]} />*!/*/}

    {/*    /!* https://threejs.org/docs/#api/en/geometries/BoxGeometry *!/*/}
    {/*    <boxGeometry args={[1, 1, 1]}/>*/}

    {/*    /!* https://threejs.org/docs/#api/en/materials/MeshStandardMaterial *!/*/}
    {/*    <meshStandardMaterial color="orange" />*/}
    {/*</mesh>*/}

    {/*<pointLight position={[-10, -10, -10]} />*/}

    {/* https://docs.pmnd.rs/react-postprocessing/selection */}
    {/*<Selection>*/}
    {/*  /!* https://docs.pmnd.rs/react-postprocessing/effect-composer *!/*/}
    {/*  <EffectComposer multisampling={8} autoClear={false}>*/}
    {/*    <Outline blur={false} visibleEdgeColor="white" edgeStrength={100} height={2000} width={3000} />*/}
    {/*  </EffectComposer>*/}
    {/*</Selection>*/}

    {/*<Wasm/>*/}

    {/*<Test/>*/}

    {/*<Ray_3*/}
    {/*    scale={5.0}*/}
    {/*    position={[0, -40, 0]}*/}
    {/*    terminal={[10, 0, 0]}*/}
    {/*    ray={ray([0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0,])}*/}
    {/*/>*/}

    {/*<OrbitControls />*/}

    {/*<Box args={[20, 20, 0]} position={[20, 0, 0]}>*/}
    {/*    /!* https://threejs.org/docs/#api/en/materials/MeshStandardMaterial *!/*/}
    {/*    <meshStandardMaterial color="black" />*/}
    {/*</Box>*/}
    {/*<Box args={[20, 20, 0]} position={[40, 0, 0]}>*/}
    {/*    /!* https://threejs.org/docs/#api/en/materials/MeshStandardMaterial *!/*/}
    {/*    <meshStandardMaterial color="white" />*/}
    {/*</Box>*/}
    {/*<Box args={[20, 20, 0]} position={[60, 0, 0]}>*/}
    {/*    /!* https://threejs.org/docs/#api/en/materials/MeshStandardMaterial *!/*/}
    {/*    <meshStandardMaterial color="black" />*/}
    {/*</Box>*/}

    {/*<Box args={[40, 40, 0]} position={[0, 0, 0]}>*/}
    {/*    /!* https://threejs.org/docs/#api/en/materials/MeshStandardMaterial *!/*/}
    {/*    <meshStandardMaterial color="white" />*/}
    {/*</Box>*/}

    {/*<Line points={[[-10, 0, 0], [0, 10, 0], [10, 0, 0]]} color="orange" lineWidth={1} />*/}

  </Canvas>
}

const VisualizationCanvas = (
    {
      children,
      ...props
    }: React.HTMLAttributes<HTMLElement> & Children
) => {

  return (
      // ThreeJS: https://threejs.org/
      // React Three Fiber: https://docs.pmnd.rs/react-three-fiber/api/objects
      //                    https://github.com/pmndrs/drei#readme
      <CanvasContainer {...props}>
        <ThreeJS>{children}</ThreeJS>
      </CanvasContainer>
  );
};
