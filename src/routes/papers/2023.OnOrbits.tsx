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
import {Intent, Tag} from "@blueprintjs/core";
import {VisualizationCanvas} from "../../@orbitmines/explorer/Visualization";
import {Center} from "@react-three/drei";
import {Block} from "../../lib/syntax-highlighting/CodeBlock";
import {Continuation, RenderedRay, Vertex} from "../../@orbitmines/explorer/OrbitMinesExplorer";
import {length} from "../../@orbitmines/explorer/Ray";

export const ON_ORBITS: Content = {
  reference: {
    /**
     * Orbits: Equivalence at Continuations
     * Equivalence: Variance made Invariant (Ignored Variance)
     * Inconsistencies: Variance
     */
    title: "On Orbits, Equivalence and Inconsistencies",
    subtitle: "A preliminary exploration through the world of possible inconsistencies. Originally intended as a more technical continuation of earlier thoughts on intelligibility.",
    draft: true,
    link: 'https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies',
    year: "2023",
    date: "2023-12-31",
    external: {
      // TODO;
      // discord: {serverId: '1055502602365845534', channelId: '1105246681915732108', link: () => "https://discord.com/channels/1055502602365845534/1105246681915732108/1105246681915732108"}
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

  return <Paper {...paper}>
    <Row center="xs">
      <Section head="A quick gently introduction">
        <span style={{textAlign: 'left'}}>
        It begins with a slightly unusual way of (visual) thinking. Usually, when one wants to describe some <span className="bp5-text-muted">single thing, node, vertex, ..., point</span>, this is done against some assumed background, to draw one's attention to that single thing.
        </span>

        <BR/>

        <Block>
          <VisualizationCanvas>
            <group scale={1.5}><Vertex color="orange" /></group>
          </VisualizationCanvas>
        </Block>

        <BR/>

        Clear enough, this could represent any (single) thing. Quite useful, like any abstraction, but there's something incredibly easy to ignore - or miss, that it could be a possible question to ask.

        <BR/>

        Imagine a line going from your eyes through this point. Now I could say that the point is no longer the point it was before, it has become part of another structure: The line you just imagined. The easy thing to miss being, that this was already the case. In order to - point out - this point, you had already constructed this line. It was simply ignored, it was simply deemed irrelevant.

        <BR/>

        <Block>
          <VisualizationCanvas>
            <group scale={1.5}><RenderedRay reference={length(1)} scale={1.5} /></group>
          </VisualizationCanvas>
        </Block>

        <BR/>

        This is in short, what this string of text is about. Things, ignored context, and a slightly different way of thinking about them.

        <BR/>

        It's quite likely that these ideas are the culmination of having abstracted so far, - blurred together so many concepts -, that it might not be too obvious why thinking along these lines could be useful. Allow me to take you through this wilderness, and perhaps we might discover something of interest:
      </Section>
    </Row>

    <Arc head="Arc: Theoretics - An Introduction to Rays">
      Let's slowly take apart why that example might be a gateway into an incredibly complicated world. Take for instance, that point, but visualized in this unusual way.

      <BR/>

      <Block>
        <VisualizationCanvas>
          <group scale={1.5}><RenderedRay reference={length(1)} scale={1.5} /></group>
        </VisualizationCanvas>
      </Block>

      <BR/>

      From the perspective of the visualization, you could think of it this way: I don't know exactly what this point is or how I know about it, but I have a way to 'point' to it. But this isn't quite enough. You might like to say more about its structure - or what that thing is.

      <BR/>

      <Section head="On Continuations">
        <span style={{textAlign: 'left'}}>Consider the following: If I have a way of pointing to some node. I could take that pointer and ask: What if there were more points in that direction? This could mean quite a few things. <span className="bp5-text-muted">Whether there's additional points behind the point, or between my eyes and the point. Whether I mean a(n) array, set, line, path, hyperedge, ..., list.</span> As a way of saying: "Whenever I have 'one' of something, I can always say: What if I had more of that thing?".</span>

        <BR/>

        <Block>
          <VisualizationCanvas>
            <Center>
              <group scale={1.5}><RenderedRay reference={length(3)} scale={1.5}/></group>
            </Center>
          </VisualizationCanvas>
        </Block>

        <BR/>

        This raises several questions. () How do you even construct a continuation like that? () What does it mean to have something in between two points? () What does it mean for a continuation to go in a loop? () () ()
      </Section>
      <Section sub="Constructing Continuations - Continuations as Equivalence">
        There's already something we could say about continuing a line, even without much rigor on how to actually
        construct it. Say we have two points,

        <BR/>

        <Block>
          <VisualizationCanvas>
            <Center>
              <group>
                <group scale={1.5} position={[-100, 0, 0]}><RenderedRay reference={length(1)} scale={1.5}
                                                                        color="#FF5555"/></group>
                <group scale={1.5}><RenderedRay reference={length(1)} scale={1.5} color="#5555FF"/></group>
              </group>
            </Center>
          </VisualizationCanvas>
        </Block>

        <BR/>

        In order to connect them together we simply say that the "end" of one point, is the same as the "beginning" of
        the other point <Reference is="footnote" index={referenceCounter()}>This is, in essence, category
        theory.</Reference>.

        <BR/>

        <Block>
          <VisualizationCanvas>
            <Center>
              <group>
                <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={length(1)} scale={1.5}
                                                                       color="#FF5555"/></group>
                <group scale={1.5}><RenderedRay reference={length(1)} scale={1.5} color="#5555FF"/></group>
                <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#FF55FF"/></group>
              </group>
            </Center>
          </VisualizationCanvas>
        </Block>

        <BR/>

        But it's not entirely obvious what one even means by that. Let's already assume I have something with which I
        can construct a line like that. I could say that the two points I'm interested in regarding as "the same" are on
        a line.

        <BR/>

        <Block>
          <VisualizationCanvas style={{height: '140px'}}>
            <Center>
              <group rotation={[0, 0, Math.PI / 2]}>
                <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={length(1)} scale={1.5}
                                                                       color="#FF55FF"/></group>
                <group scale={1.5}><RenderedRay reference={length(1)} scale={1.5} color="#FF55FF"/></group>
              </group>
            </Center>
          </VisualizationCanvas>
        </Block>

        <BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}}>If I add my two '<span className="bp5-text-muted">ends, extremes, ..., boundaries</span>', which I want to regard as "the same" to this line,</span>

        <BR/>

        <Block>
          <VisualizationCanvas style={{height: '140px'}}>
            <Center>
              <group>
                <group scale={1.5} position={[-30, 0, 0]}><RenderedRay reference={length(1)} scale={1.5}
                                                                       color="#FF5555"/></group>

                <group scale={1.5} position={[30, -60, 0]}><RenderedRay reference={length(1)} scale={1.5}
                                                                        color="#5555FF"/></group>

                <group rotation={[0, 0, Math.PI / 2]}>
                  <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={length(1)} scale={1.5}
                                                                         color="#FF55FF"/></group>
                  <group scale={1.5}><RenderedRay reference={length(1)} scale={1.5} color="#FF55FF"/></group>
                </group>

              </group>
            </Center>
          </VisualizationCanvas>
        </Block>

        <BR/>

        <span style={{textAlign: 'left'}}>Alright, this is already showing something interesting. Imagine this: <span
          className="bp5-text-muted">Tilt, ignore, ..., collapse</span> the line to a point, and we're back at the line. I could rephrase this problem as a shift in perspective. One yields the line, the other the structure above <Reference
          is="footnote" index={referenceCounter()}>(It's not yet obvious how you make this rigorous just yet, but we'll return to that later)</Reference>.</span>

        <BR/>

        <span style={{textAlign: 'left'}}>We could keep <span className="bp5-text-muted">expanding, growing, adding, ..., equivalencing continuations</span>, like we did here,</span>

        <BR/>

        <Block>
          <VisualizationCanvas style={{height: '140px'}}>
            <Center>
              <group>
                <group scale={1.5} position={[-30, 0, 0]}><RenderedRay reference={length(1)} scale={1.5}
                                                                       color="#FF5555"/></group>

                <group position={[55, 23, 0]}>
                  <group rotation={[0, 0, Math.PI / 2]}>
                    <group scale={1.5} position={[-60, 0, 0]}>
                      <RenderedRay reference={length(1)} scale={1.5} color="#FF55FF"/>
                    </group>
                  </group>
                  <group scale={1.5} position={[30, -60, 0]}>
                    <RenderedRay reference={length(1)} scale={1.5} color="#5555FF"/>
                  </group>
                </group>

                <group rotation={[0, 0, Math.PI / 8]} position={[55, -6, 0]}>
                  <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={length(1)} scale={1.5}
                                                                         color="#AA00AA"/></group>
                  <group scale={1.5}><RenderedRay reference={length(1)} scale={1.5} color="#AA00AA"/></group>
                </group>

                <group rotation={[0, 0, Math.PI / 2]}>
                  <group scale={1.5}><RenderedRay reference={length(1)} scale={1.5} color="#FF55FF"/></group>
                </group>

              </group>
            </Center>
          </VisualizationCanvas>
        </Block>

        <BR/>

        or keep doing the same thing by adding to the line,

        <BR/>

        <Block>
          <VisualizationCanvas style={{height: '140px'}}>
            <Center>
              <group>
                <group scale={1.5} position={[-30, 0, 0]}><RenderedRay reference={length(1)} scale={1.5}
                                                                       color="#FF5555"/></group>

                <group scale={1.5} position={[30, -60, 0]}><RenderedRay reference={length(1)} scale={1.5}
                                                                        color="#5555FF"/></group>

                <group rotation={[0, 0, Math.PI / 2]}>
                  <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={length(1)} scale={1.5}
                                                                         color="#FF55FF"/></group>
                  <group scale={1.5}><RenderedRay reference={length(1)} scale={1.5} color="#FF55FF"/></group>
                </group>


                <group scale={1.5} position={[90, 0, 0]}><RenderedRay reference={length(1)} scale={1.5}
                                                                      color="#55FF55"/></group>
                <group rotation={[0, 0, Math.PI / 2]} position={[60, 0, 0]}>

                  <group scale={1.5}><RenderedRay position={[-40, 0, 0]} reference={length(1)} scale={1.5}
                                                  color="#55FFFF"/></group>
                  <group scale={1.5}><RenderedRay reference={length(1)} scale={1.5} color="#55FFFF"/></group>
                </group>

              </group>
            </Center>
          </VisualizationCanvas>
        </Block>

        <BR/>

        which would correspond to this line,

        <BR/>

        <Block>
          <VisualizationCanvas>
            <Center>
              <group>
                <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={length(1)} scale={1.5}
                                                                       color="#FF5555"/></group>
                <group scale={1.5}><RenderedRay reference={length(1)} scale={1.5} color="#5555FF"/></group>
                <group scale={1.5}><Continuation position={[-20, 0, 0]} color="#FF55FF"/></group>

                <group scale={1.5} position={[60, 0, 0]}><RenderedRay reference={length(1)} scale={1.5}
                                                                      color="#55FF55"/></group>
                <group scale={1.5}><Continuation position={[20, 0, 0]} color="#55FFFF"/></group>
              </group>
            </Center>
          </VisualizationCanvas>
        </Block>

        <BR/>

        but it doesn't necessarily get us anywhere on its own. So let's ignore those expansions for now.

        <BR/>

        <span style={{textAlign: 'left'}}>A more interesting thing we can do, is instead to continue the line which defines what we're seeing as possible <span
          className="bp5-text-muted">continuations, ..., branches</span>.</span>

        <BR/>

        <Block>
          <VisualizationCanvas style={{height: '200px'}}>
            <Center>
              <group>

                <group scale={1.5} position={[-30, 0, 0]}><RenderedRay reference={length(1)} scale={1.5}
                                                                       color="#FF5555"/></group>

                <group scale={1.5} position={[30, -60, 0]}><RenderedRay reference={length(1)} scale={1.5}
                                                                        color="#5555FF"/></group>

                <group scale={1.5} position={[30, 60, 0]}><RenderedRay reference={length(1)} scale={1.5}
                                                                        color="#3030FC"/></group>

                <group rotation={[0, 0, Math.PI / 2]}>
                  <group scale={1.5} position={[60, 0, 0]}><RenderedRay reference={length(1)} scale={1.5}
                                                                        color="#FF55FF"/></group>
                  <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={length(1)} scale={1.5}
                                                                         color="#FF55FF"/></group>
                  <group scale={1.5}><RenderedRay reference={length(1)} scale={1.5} color="#FF55FF"/></group>
                </group>

              </group>
            </Center>
          </VisualizationCanvas>
        </Block>

        <BR/>

        This more abstractly, is just the same thing as we did above. We're just adding equivalences on continuations. What makes it different is the context defined around it. Hence, we get something which looks more like branching, than just adding to a line, even though they can be abstractly realized as the same kind of thing.

        <BR/>


        <Block>
          <VisualizationCanvas style={{height: '90px'}}>
            <Center>
              <group>

                <group scale={1.5} position={[-30, 0, 0]}><RenderedRay reference={length(1)} scale={1.5}
                                                                       color="#FF5555"/></group>

                <group scale={1.5} position={[30, -30, 0]}><RenderedRay initial={[-20, 20, 0]} reference={length(1)} scale={1.5}
                                                                        color="#5555FF"/></group>

                <group scale={1.5} position={[30, 30, 0]}><RenderedRay initial={[-20, -20, 0]} reference={length(1)} scale={1.5}
                                                                       color="#3030FC"/></group>

                <group scale={1.5}><Continuation color="#FF55FF" /></group>
              </group>
            </Center>
          </VisualizationCanvas>
        </Block>

        <BR/>
      </Section>

      <Section head="On Inconsistencies" sub={<span>
       Some <span className="bp5-text-disabled">[seeming non-trivial (perceived) directional]</span> Variance
      </span>}>
      </Section>
      <Section head="On Equivalence" sub={<span>
       Some <span className="bp5-text-disabled">[seeming non-trivial (perceived) directional]</span> Invariance
      </span>}>
      </Section>
      <Section head="On Orbits" sub="Infinities, ...">
      </Section>

      <Section head="Coarse-graining" sub="Unintended/Accidental/Irrelevant Variance">
      </Section>
      <Section head="Violating Assumptions" sub="(Variance) Unknown inconsistencies and enforcing global coherence">

      </Section>
      <Section head="Compression">

      </Section>
    </Arc>
    <Arc head="Arc: OrbitMines Explorer: The Project">
      <Link
          link="https://github.com/orbitmines/orbitmines.com/pull/1"
          name={<span>
        OrbitMines Explorer - <Tag intent={Intent.WARNING} minimal multiline style={{fontSize: '1rem', paddingTop: '0px', paddingBottom: '0px'}}>WIP</Tag> Preliminary Technical Implementation/Exploration
      </span>}
          icon={ORGANIZATIONS.github.key} />
    </Arc>

    <Arc head="Wrapping up">
      <Section head="A yearly excerpt of thoughts">
        In some sense, several aspects of these arcs could be considered as generalizations of many ideas I've exposed myself to. I've noticed it's incredibly easy to confidently name/(talk/think about) something, without having properly understood or built them; either my own or others' thoughts. In a struggle to understand their/those inconsistencies, I think I found a proper language to do so.

      </Section>
      <Section head="On self-publishing and referencing" sub="Edited personal journeys/histories/... and literary exposure">
        I suspect that this sort of self-(reporting/publishing), necessitates the highlighting of its possible adversarial/game-theoretic properties. With myself and my archives possibly being forgetful or deceitful players, this certainly makes for an interesting dynamic. Consider this quick paragraph as an acknowledgement that I am aware of that, and that I think my attempts aim for accuracy - whether that's actually successful or not -.

        <BR/>

        Similarly, it's worth admitting that I do not necessarily understand/have access to how certain interactions come together in my explorations. I document how I find certain kinds of information in some detail, though this is likely far from exhaustive.

        <BR/>

        I might also fail to mention relevant works (or personal interactions) which have either had impact on my line of thinking more non-trivially, or whose ideas aren't mentioned here, or in my other writing, directly. My current practical approach to this has therefore been to publish many kinds of information I expose myself to (during the time I'm working on these projects). Which hopefully support the more explicit referencing done here. I hope to further expand on this concept in future works.
      </Section>
      <Section head="On language and my bending of it">
        In my - albeit limited - number of radians around our particular sun, I have found that I myself am (and likely by extension others are) quite inconsistent. Quite regularly I would like to rephrase certain (historical) expressions, dissatisfied by their vagueness or inaccuracy. Or to make the conceptual leap and guess that the only way my memory is even slightly functional is the apparent ability to infer or remember by resolving pointers from context somewhat consistently. A form of permeating uncertain caution seems appropriate when thinking through these abstract concepts: This could be interpreted as a reference carried forward in time with the potential to modify any particular assumption.

        <BR/>

        Additionally, I'm quite certain that my use of language contains a style which is unusual. Likely containing seemingly duplicated word sequences, possibly overly cautious /or not at all, and quite certainly seemingly (possibly on purpose) contradictory in many instances.

        <BR/>

        In this sense, I don't necessarily care about the accuracy of any particular sentence. Whether in this language, or one it's translated to. I care whether the more abstract pattern of ideas which I'm trying to communicate is sufficiently transferred through that language. And the ability to - through time, through correction -, adjust the ideas as deemed by me/you as particularly inconsistent to warrant its change.

      </Section>
    </Arc>
    <Arc head="Arc: OrbitMines' Timeline (2013-2023)">
      <Section head="A quick journey of getting here">

      </Section>
    </Arc>

  </Paper>;
}

export default OnOrbits;