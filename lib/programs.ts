export type Segment = {
  title: string;
  body: string;
};

export type Program = {
  key: string;
  domain: string;
  color: string;
  segments: Segment[];
};

export const PROGRAMS: Program[] = [
  {
    key: 'emotional-intelligence',
    domain: 'Emotional Intelligence',
    color: '#C4A060',
    segments: [
      {
        title: 'What emotions actually are',
        body: 'Emotions are not problems to fix. They are signals — information your nervous system generates in response to what is happening around you and inside you. Every emotion has a job. Fear prepares you for threat. Anger mobilises energy to remove an obstacle. Grief processes loss. Shame protects belonging. Understanding this changes the relationship entirely. You stop trying to eliminate feelings and start trying to read them.',
      },
      {
        title: 'The anatomy of a feeling',
        body: "Every emotion has three components: a physical sensation in the body, a thought that interprets it, and an impulse toward action. Most people only notice the thought — the story they tell about how they feel. But the sensation comes first, before language. Learning to notice where you feel an emotion in your body, before you narrate it, gives you access to information your conscious mind hasn't yet filtered.",
      },
      {
        title: 'Naming changes everything',
        body: 'Neuroscientist Matthew Lieberman showed that putting a feeling into words — affect labelling — reduces activity in the amygdala by a measurable amount. You are not just describing the emotion. You are literally regulating it. The more precise the label, the greater the effect. "Anxious" works better than "bad." "Shame about this specific thing" works better than "anxious." Precision is power here.',
      },
      {
        title: 'The emotional scale',
        body: 'Not all emotions are equal in energy and possibility. David Hawkins mapped them on a scale from shame at the bottom — the most contracted, most limiting — up through fear, anger, courage, acceptance, and into love, joy, and peace. Moving up the scale is not about bypassing what you feel. It is about understanding which emotions close down possibility and which ones open it — and what it takes to shift.',
      },
      {
        title: 'Emotions shape every decision',
        body: 'The research on affect heuristic shows that incidental emotions — feelings that have nothing to do with a decision — consistently influence the choices we make. Fear makes risk feel larger than it is. Anger makes us more certain we are right. Joy opens us to possibility. You are not deciding from a neutral place. You are always deciding from an emotional state. Knowing that state is strategic clarity, not self-indulgence.',
      },
      {
        title: 'Building emotional resilience',
        body: "Resilience is not the absence of difficult emotion. It is the capacity to move through it without being defined by it. Research on resilience identifies three consistent factors: a narrative of meaning (this happened for a reason I can live with), a sense of agency (I can influence what happens next), and genuine connection (I am not alone in this). All three are things you can actively build — which means resilience is not a trait you have or don't have. It is a practice.",
      },
    ],
  },
  {
    key: 'self-talk',
    domain: 'Mind & Self-Talk',
    color: '#7090C0',
    segments: [
      {
        title: 'Your inner voice runs 24/7',
        body: 'The average person has between 50,000 and 80,000 thoughts per day. Research suggests that up to 95% of them are repeats from the day before. This means most of your inner life is not new thinking — it is replay. The loops you run, the stories you tell yourself, the way you interpret events — these are largely automatic. Awareness is the first and most important step to choosing differently.',
      },
      {
        title: 'Why negative loops stick',
        body: 'Your brain is wired to prioritise threat detection — a phenomenon called negativity bias. A negative thought triggers the amygdala the same way a real threat does. So negative loops get reinforced faster, feel more urgent, and seem more "true" than neutral or positive ones. This is not weakness or pessimism. It is how the human brain was built to keep you alive. The problem is that the same mechanism runs on imaginary threats just as hard as real ones.',
      },
      {
        title: 'The payoff of the loop',
        body: 'Every loop exists because it is doing a job. "I\'m not good enough" protects you from trying and being rejected. "Nothing ever changes" protects you from hoping and being disappointed. "I always mess things up" keeps expectations low so the fall is smaller. The loop is not irrational — it is protective. But understanding what it is protecting you from is what allows you to evaluate whether you still need that protection, or whether it is costing you more than it saves.',
      },
      {
        title: 'Building the reframe',
        body: 'A reframe is not positive thinking. It is a more honest alternative to the loop — one that your nervous system can actually accept. The rules: it must be believable (the brain rejects obvious lies), stated in terms of what you want rather than what you don\'t want, and slightly better than the current loop rather than its perfect opposite. "I am learning to trust myself" lands where "I am completely confident" does not. The gap between the loop and the reframe should be small enough to step across.',
      },
      {
        title: 'Rewiring through repetition',
        body: 'The loop became automatic through repetition. The new voice becomes automatic the same way. This is neuroplasticity — the brain\'s ability to change its own structure based on what you repeat. Every time a neural pathway fires, it gets slightly stronger. "Neurons that fire together wire together," as neuroscientist Donald Hebb described it. The practice is simple: when you notice the loop, name it, acknowledge what it is protecting, and speak the reframe — out loud if you can. Once a day, deliberately. The new voice becomes the default.',
      },
    ],
  },
  {
    key: 'wellbeing',
    domain: 'Wellbeing',
    color: '#78B8A8',
    segments: [
      {
        title: 'What we think creates happiness — and what actually does',
        body: 'Studies consistently show that people are poor predictors of what will make them happy. We overestimate the impact of wealth, status, and achievement — and underestimate the impact of connection, meaning, and autonomy. The Harvard Study of Adult Development tracked 724 people for over 80 years and reached one conclusion above all others: the quality of your relationships is the strongest predictor of a long, happy life. Not wealth. Not fame. Not success.',
      },
      {
        title: 'The performance trap',
        body: 'Social media has created a global performance of happiness — curated lives that signal success, abundance, and joy. The research is clear: people who appear happy on Instagram carry the same internal loops, the same fears, the same longings as everyone else. The performance of happiness is not happiness. But when it is all you can see, it becomes the model you optimise for. This is one of the great collective blockages of our time.',
      },
      {
        title: 'The four real pillars',
        body: 'Across disciplines — psychology, neuroscience, philosophy — four elements appear consistently as foundations of genuine wellbeing. Meaning: the sense that what you do matters and connects to something larger than yourself. Connection: genuine relationships where you are known and you know others. Movement: physical activity that keeps the body regulated and the mind clear. Honest self-knowledge: the capacity to see yourself clearly — your patterns, your loops, your desires. All four are things you can actively build.',
      },
      {
        title: 'The body is the foundation',
        body: 'Emotional wellbeing does not exist independently of the body. Sleep deprivation increases emotional reactivity by up to 60%. Regular movement reduces anxiety and depression as effectively as medication in multiple studies. Chronic stress suppresses immune function, impairs memory, and narrows thinking. You cannot think your way to wellbeing while ignoring the physical system that generates it. The body is not a vehicle for the mind — they are one system.',
      },
      {
        title: 'Meaning over pleasure',
        body: 'Psychologist Martin Seligman distinguishes between the pleasant life (maximising positive emotions), the good life (using your strengths in service of something), and the meaningful life (belonging to and serving something larger than yourself). Research consistently shows that the meaningful life produces the deepest and most durable sense of wellbeing — not because pleasure is unimportant, but because meaning gives the difficult moments a place to live without destroying the whole.',
      },
    ],
  },
  {
    key: 'agency',
    domain: 'Agency & Power',
    color: '#E09090',
    segments: [
      {
        title: 'What agency actually is',
        body: 'Agency is the belief that your actions matter — that you can influence what happens in your life. It is not the same as control. You cannot control most of what happens to you. Agency is the sense that your response to what happens makes a difference. Research consistently identifies agency as one of the strongest predictors of resilience, mental health, and life satisfaction. People with high agency are not people to whom good things happen. They are people who believe they can do something with whatever happens.',
      },
      {
        title: 'How agency gets lost',
        body: 'Martin Seligman\'s research on learned helplessness showed that repeated exposure to situations where nothing you do makes a difference eventually produces a complete withdrawal from trying — even when the situation changes and action would work. The brain learns helplessness the same way it learns anything: through repetition. This is why the loop "nothing ever changes" is not just a thought — it is a trained response to genuine past experiences. It was once accurate. It may no longer be.',
      },
      {
        title: 'Small wins as proof',
        body: 'The most powerful antidote to learned helplessness is evidence. Not motivation, not inspiration — evidence that action produces results. This is why small wins matter so much. Not because the wins themselves are significant, but because they prove to the nervous system that effort connects to outcome. The brain updates its model based on experience. Each small action that produces a result is data that rewrites the learned helplessness pattern, one data point at a time.',
      },
      {
        title: 'Desire as direction',
        body: 'Agency without direction is restless energy. The question is not only "can I act?" but "toward what?" Naming what you actually want — underneath what you think you should want, underneath what seems realistic — is an act of agency in itself. Most people have never been asked what they truly desire without qualification. The question is radical. The answer, when you find it, becomes a compass. Everything else is navigation.',
      },
    ],
  },
  {
    key: 'organisational-intelligence',
    domain: 'Organisational Intelligence',
    color: '#6B7A50',
    segments: [
      {
        title: 'Structure creates freedom, not constraint',
        body: 'The paradox of organisation is this: people who resist structure in the name of freedom are often the least free — constantly making the same decisions, constantly starting over, never building momentum. When the framework handles the small decisions, your creative and emotional energy is freed for what actually matters. The most expansive artists, thinkers, and creators in history were almost universally people with rigorous daily structures. Freedom is what structure makes possible.',
      },
      {
        title: 'The science of rituals',
        body: 'Research on decision fatigue shows that willpower and decision quality degrade throughout the day with each choice made. Rituals — repeated sequences that become automatic — remove decisions from the equation. You do not decide whether to do the thing. The ritual just runs. Neurologically, habitual behaviour moves from the prefrontal cortex (effortful, conscious) to the basal ganglia (automatic, effortless). The effort of building the ritual is an investment. The return is that it costs almost nothing to maintain.',
      },
      {
        title: 'Your environment designs your behaviour',
        body: 'Before you make a single decision, your environment has already made dozens for you. The research of behavioural economist Richard Thaler shows that default options — what is easiest, most visible, most accessible — determine the majority of human behaviour. This means the most powerful leverage you have over your own actions is not willpower. It is design. What you put in front of yourself, what you make easy, what you remove from view — these are more powerful than motivation.',
      },
      {
        title: 'Energy management over time management',
        body: 'Time is fixed. Everyone has 24 hours. But energy — mental clarity, emotional availability, creative capacity — fluctuates dramatically across the day and the week. Managing your schedule around your energy peaks and troughs is more effective than managing it around time slots. Your most demanding cognitive and creative work belongs in your peak energy window. Everything else belongs in the troughs. Most people do it backwards — checking email at their best and attempting their hardest work when already depleted.',
      },
    ],
  },
  {
    key: 'creativity',
    domain: 'Creativity',
    color: '#B898D0',
    segments: [
      {
        title: 'How the creative brain actually works',
        body: 'Creativity is not a special talent distributed randomly at birth. It is a cognitive process that every human brain is capable of — and one that follows identifiable patterns. The core of creative thinking is the ability to make unexpected connections between things that are not usually connected. The richer and more diverse your inputs — experiences, ideas, domains, people — the more raw material the brain has to combine in new ways.',
      },
      {
        title: 'The default mode network',
        body: 'When you stop actively focusing — in the shower, on a walk, in the moment before sleep — a brain network called the default mode network activates. This is where insight happens. It is where the brain makes connections it cannot make under direct attention. This is why your best ideas rarely come at your desk. The common mistake is to treat rest, boredom, and wandering as wasted time. They are not. They are when the creative work actually runs.',
      },
      {
        title: 'Constraint as creative fuel',
        body: 'Counterintuitively, limitation tends to produce more creative output than total freedom. When everything is possible, the mind is paralysed by options. When constrained — by format, by time, by resources, by rules — the mind is forced to find solutions within the boundary. This is why some of the most innovative creative work in history emerged from severe constraint. The constraint is not the obstacle to creativity. It is often the engine.',
      },
      {
        title: 'Protecting creative energy',
        body: 'Creative capacity is finite within a day and needs specific conditions to flourish — low distraction, psychological safety, enough unstructured time for the default mode network to run. Administrative noise, constant interruption, and always-on communication are not just annoying — they are specifically hostile to the conditions creativity requires. Protecting creative energy means designing your environment and your schedule to create those conditions deliberately.',
      },
    ],
  },
  {
    key: 'relational-intelligence',
    domain: 'Relational Intelligence',
    color: '#A87858',
    segments: [
      {
        title: 'Connection is not optional',
        body: 'The Harvard Study of Adult Development — the longest-running study of adult life ever conducted — followed 724 men from their teens into old age. The single clearest finding after 80 years: the quality of your close relationships is the most powerful predictor of health, happiness, and longevity. Not wealth, not fame, not achievement. Connection. Loneliness, conversely, has been shown to be as damaging to health as smoking 15 cigarettes a day. Connection is not a nice-to-have. It is biological infrastructure.',
      },
      {
        title: 'The five people effect',
        body: 'Research in social network theory — and the famous "you are the average of the five people you spend the most time with" principle — reflects a documented phenomenon. Behaviours, beliefs, and emotional states are contagious. Not metaphorically — measurably. A study by Christakis and Fowler showed that happiness spreads through social networks up to three degrees of separation. Your emotional state is influenced by the emotional states of people you have never met, through the chain of people you know.',
      },
      {
        title: 'What genuine connection actually requires',
        body: 'The research of Brené Brown on vulnerability shows that genuine connection — the kind that actually creates wellbeing — requires being seen authentically, which requires risk. Connection built on the performance of having it together is not real connection. It is pleasant but hollow. The moments of genuine connection almost always involve someone saying something true about what they are actually experiencing. The courage to do that — and to receive it in others — is the foundation of relational intelligence.',
      },
      {
        title: 'Building your crew',
        body: 'Your lift crew — the people who raise your energy, who tell you the truth, who believe in you before you believe in yourself — is not assembled by accident. It is built through deliberate attention to who depletes and who energises you, through the courage to invest in the relationships that matter, and through the willingness to let the depleting ones occupy less of your time. This is not selfish. It is foundational. You cannot give from empty.',
      },
    ],
  },
  {
    key: 'artificial-intelligence',
    domain: 'Artificial Intelligence',
    color: '#7A8898',
    segments: [
      {
        title: 'What AI actually is',
        body: 'Artificial intelligence, in its current form, is pattern recognition at scale. It does not think, feel, or understand — but it identifies patterns in vast amounts of data with extraordinary precision. When trained on human language, it learns the statistical patterns of how people communicate. When trained on behaviour data, it learns the statistical patterns of how people act. The intelligence is not in the machine. It is in the patterns it has been trained to reflect back.',
      },
      {
        title: 'How pattern recognition changes self-understanding',
        body: 'When applied to personal data — emotions logged over time, loops named and reframed, desires tracked across months — AI can surface patterns that are invisible to the person living them. You cannot see your own arc from inside it. A system that reads your emotional data across six months can tell you things about your patterns that would take years of journaling or therapy to surface. This is not replacement for self-reflection. It is amplification of it.',
      },
      {
        title: 'AI that serves vs. AI that extracts',
        body: "Most AI systems are built to maximise engagement — which means keeping you in the loop, keeping you slightly anxious, keeping you returning. The metric is time-on-platform. This platform's AI is built toward the opposite goal: understanding you deeply enough to help you need it less. The measure of success is not how often you open the app. It is whether your loops settle, whether your desires move, whether you feel more capable of your own life over time. Healthy AI works toward its own obsolescence.",
      },
      {
        title: 'The collective mirror',
        body: "The long-term purpose of this platform's AI is not individual — it is collective. When thousands of people name the same loop, track the same stuck desire, or reframe the same belief, a pattern emerges that no individual could see. The AI can identify these collective blockages — the loops that an entire generation is running — and surface them to the collective. Not to prescribe solutions, but to make the pattern visible. When a collective can see its own blockage clearly, it can begin to move. This is AI as a mirror held up to humanity at scale.",
      },
    ],
  },
  {
    key: 'ai-future',
    domain: 'The AI Future',
    color: '#8A9878',
    segments: [
      {
        title: 'What the world is becoming',
        body: 'We are in the middle of the most significant technological transition in human history — not because AI is smarter than us, but because it removes the economic value of a huge range of tasks that humans used to do. Routine cognitive work — writing, analysis, coding, customer service, translation — is being absorbed. What remains uniquely human is not task execution. It is judgement, creativity, emotional intelligence, relational depth, and the capacity to find meaning. The question is not whether this is happening. It is what you do with it.',
      },
      {
        title: 'What will actually be useful',
        body: 'The skills that compound in an AI-saturated world are precisely the ones that AI cannot replicate: the ability to ask the right question, to synthesise across domains, to read a room, to hold ambiguity without panic, to lead with empathy, to create something that carries a human fingerprint. Technical skills will always matter — but the leverage belongs to people who can work with AI, direct it, evaluate its outputs, and bring to it the human judgement that makes it useful rather than just fast.',
      },
      {
        title: 'What to learn now',
        body: 'The curriculum for the AI age looks less like a list of skills and more like a disposition: stay curious, think in systems, understand human psychology, communicate with precision and empathy, build the capacity to keep learning. Specific domains that compound: understanding how AI actually works (not to build it, but to use it wisely), emotional and relational intelligence (the last moat), creative synthesis (connecting ideas across fields), and self-knowledge (knowing what you actually value in a world that will keep asking you to choose).',
      },
      {
        title: 'The displacement question',
        body: 'Many people will lose roles they built their identity around. This is not abstract — it is the most significant psychological challenge of the coming decade. The research on identity and transitions shows that people who navigate role loss well are those who had built their identity around who they are rather than what they do. Values, relationships, character — these survive transition. Job titles do not. Investing in self-knowledge now is not self-indulgence. It is preparation for a transition that is already underway.',
      },
      {
        title: 'How to create hope',
        body: 'Hope in the AI age is not optimism. It is agency — the belief that you can navigate what is coming by learning, adapting, and connecting. The people who will flourish are not necessarily the most technically sophisticated. They are the ones who understand themselves well enough to know what they value, who are embedded in genuine communities of support, who remain curious about the world as it changes, and who have developed the inner resources to hold uncertainty without being destroyed by it. All of that is buildable. It starts here.',
      },
      {
        title: 'The collective possibility',
        body: 'The same technology that displaces also democratises. AI makes it possible for a single person to do what previously required a team. It gives access to knowledge, tools, and capabilities that were once reserved for the privileged few. The collective possibility of the AI age is not just survival — it is the chance to address problems at a scale and speed we never could before: mental health crises, educational inequality, collective understanding of what actually creates human flourishing. The platform you are using is an early expression of that possibility. AI in service of collective liberation — not extraction.',
      },
    ],
  },
  {
    key: 'hope-energy',
    domain: 'Hope & Energy',
    color: '#C09878',
    segments: [
      {
        title: 'Why hope is not optional',
        body: 'Hope is not a feeling. It is a cognitive and neurological state — the belief that your future can be different from your past, and that your actions can contribute to that difference. Research by psychologist Charles Snyder identifies hope as having two components: the will (motivation to move toward a goal) and the way (the ability to find paths when the obvious one is blocked). Both are learnable. Both compound over time. Without hope, the nervous system enters a conservation state — doing less, risking less, becoming less.',
      },
      {
        title: 'How hope survives darkness',
        body: 'The most powerful studies on hope come not from comfortable circumstances but from impossible ones. Viktor Frankl, writing from inside a Nazi concentration camp, observed that those who survived longest were not necessarily the physically strongest — they were those who maintained a sense of meaning. "Those who have a why to live can bear almost any how." Hope in darkness does not require certainty that things will improve. It requires only the belief that your response to what is happening matters.',
      },
      {
        title: 'Energy as the foundation',
        body: 'Hope cannot be sustained without energy. Energy here is not enthusiasm — it is the regulated physiological state that allows the nervous system to remain open rather than contracted. Research on positive psychology shows that people in expansive, resourced states are measurably more creative, more generous, more resilient, and more able to perceive options. The contracted state — exhaustion, fear, shame — narrows thinking to survival. Protecting your energy is not selfishness. It is the prerequisite for everything else.',
      },
      {
        title: 'Motivation that lasts',
        body: 'There are two kinds of motivation: extrinsic (reward, punishment, approval) and intrinsic (curiosity, meaning, mastery, connection). Extrinsic motivation produces short bursts and eventual resentment. Intrinsic motivation, when activated, is self-sustaining — it generates its own energy. The question is not how to motivate yourself but how to connect to what you already care about. The desire is already there. The work is removing what is covering it.',
      },
      {
        title: 'The flow state',
        body: 'Psychologist Mihaly Csikszentmihalyi spent decades studying optimal human experience — the state he called flow: complete absorption in a meaningful challenge, where time disappears and capability expands. Flow occurs at the intersection of high challenge and high skill. It is the most reliably positive state the human brain can enter. And critically — it leaves you more capable than before. Flow is not just pleasure. It is the experience of becoming. The long-run purpose of this platform is to help you spend more of your life there.',
      },
      {
        title: 'Why this is what evolution is about',
        body: 'Evolution is not only biological. It is consciousness expanding — individuals becoming more aware, more capable, more able to contribute to something beyond themselves. Each person who moves from shame to courage, from isolation to connection, from loop to reframe, from helplessness to agency — that movement is not just personal. It ripples. It changes what is possible in every system that person touches. The small work you do on yourself is not separate from the large arc of human evolution. It is the unit of it.',
      },
    ],
  },
  {
    key: 'collective-evolution',
    domain: 'Collective Evolution',
    color: '#7A8898',
    segments: [
      {
        title: 'The Map of Consciousness',
        body: 'David Hawkins spent decades calibrating human emotional states on a scale he called the Map of Consciousness — ranging from shame (20) at the bottom through fear, anger, pride, and courage (200), up through reason, love, joy, and peace at the top. The critical threshold is 200: courage. Below it, emotional states drain energy — they are contractive, taking more than they give. Above it, states become generative — they expand possibility for the individual and, Hawkins argued, for everyone around them.',
      },
      {
        title: 'Why moving up the scale matters for everyone',
        body: "Hawkins's most provocative claim was that consciousness has a collective field — that individual emotional states contribute to a shared energetic environment. One person operating at the level of love (500) counterbalances the negativity of 750,000 people below the level of courage. Whether or not you accept the metaphysics, the underlying insight is measurable: emotionally regulated, high-energy individuals have disproportionate positive effects on their families, teams, and communities. Your inner state is not a private matter. It is a contribution.",
      },
      {
        title: 'Small things, maximal impact',
        body: 'Complex systems are exquisitely sensitive to small inputs at the right point — what complexity theory calls leverage points. The same is true of human systems. A teacher who operates from genuine love rather than fear changes the trajectory of hundreds of students over a career. A leader who moves from pride to courage transforms the culture of an organisation. A parent who shifts from shame to acceptance rewires the attachment patterns of their children. The ripple from a single person becoming more conscious cannot be calculated — but it is real, and it is vast.',
      },
      {
        title: 'Collective blockages as shared calibrations',
        body: 'When an entire culture calibrates below 200 — stuck in shame, grief, fear, or anger — the collective possibilities available to that culture are genuinely contracted. History shows this. Cultures in the grip of collective shame or fear make different decisions, build different institutions, and produce different outcomes than cultures operating from courage or above. This is not determinism — it is pattern recognition. And it means that the most powerful intervention in any social system is to help individuals move up the scale. Not through force or preaching — through the conditions that make emotional growth possible.',
      },
      {
        title: 'Individual evolution as collective service',
        body: "Every loop you settle, every reframe that holds, every moment you choose connection over isolation — these are not private acts. They are contributions to the collective field. They change what is possible in the systems you inhabit. The work of self-knowledge and emotional growth is the most scalable form of social change available, because it does not require anyone's permission and its effects compound through every relationship and encounter in a life. This is why the platform exists: not to optimise individuals, but to support the individual evolution that makes collective liberation possible.",
      },
      {
        title: 'The path from 200 upward',
        body: 'Courage is the threshold — the point where energy stops being drained and starts being generated. Neutrality and willingness follow: the capacity to release the need to control outcomes and to remain open to what is. Acceptance — not passivity but genuine embrace of what is real — opens into reason, love, and eventually joy. The path is not linear and it is not permanent. People move up and down the scale across a single day. But the general direction of a life can shift — and when it does, everything changes. The aim of this platform is to help that direction point upward, consistently, over time.',
      },
    ],
  },
];

export function getProgramByKey(key: string): Program | undefined {
  return PROGRAMS.find((p) => p.key === key);
}
