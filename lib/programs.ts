import { WORLD_SYSTEM_PROGRAMS } from './world-system-programs';

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
    key: 'colourmap-vision-comic',
    domain: 'Colourmap Vision Comic',
    color: '#78A9B8',
    segments: [
      {
        title: 'A living map, not a pile',
        body: 'Colourmap is not just information. It is a living map of knowledge, emotions, missions, progress, and life. The system should not overwhelm the user with more and more pages. It should orient them.',
      },
      {
        title: 'Move like a console menu',
        body: 'The navigation can feel like a PlayStation or PSP menu: horizontal movement chooses the world, vertical movement opens the doors inside that world. Emotions, Missions, Progress, Education, Atlas, and Entertainment become places you can glide through.',
      },
      {
        title: 'The library of the future',
        body: 'Education can grow into teachers, comics, poetry, maps, tests, history, and symbolic worlds. The question is not only what content exists. The question is how a person moves through the infinity of knowledge without getting lost.',
      },
      {
        title: 'Roads, cells, and portals',
        body: 'The interface can become a disco-ball library, a cross map, or cells connected by roads. Each dot is a portal. Each road creates meaning and direction. The map should make complexity feel beautiful and usable.',
      },
      {
        title: 'Vision must return to ground',
        body: 'The app should also know when imagination is becoming drift. Big future ideas need a bridge back to the center: what matters now, what mission is clear, what problem needs solving, and what can be done today.',
      },
      {
        title: 'The mission',
        body: 'Colourmap exists to translate inner life, knowledge, and action into one usable field. It should help the user understand themselves, organize their energy, learn from the world, and return to real life with a clearer next move.',
      },
      {
        title: 'A map that knows your center',
        body: 'The system should help the user see when they are exploring and when they are drifting. It does not punish imagination. It gives the imagination a center to return to.',
      },
      {
        title: 'Knowledge becomes a place',
        body: 'A future library should feel spatial. Subjects, teachers, comics, missions, emotions, and projects can become rooms, roads, portals, and living areas the user can move through calmly.',
      },
      {
        title: 'The interface should guide gently',
        body: 'The goal is a beautiful system that makes complexity easier to enter. Horizontal movement chooses worlds. Vertical movement opens doors. The user should feel oriented, not buried.',
      },
    ],
  },
  {
    key: 'carl-jung',
    domain: 'Carl Jung & The Inner Map',
    color: '#B99367',
    segments: [
      {
        title: 'The inner world is real material',
        body: 'Jung treated the inner world as real material for understanding a life. Dreams, symbols, moods, and repeating patterns are not random noise. They are clues from a deeper field of the psyche.',
      },
      {
        title: 'Conscious and unconscious',
        body: 'The conscious mind is the part we can usually name. The unconscious is the larger hidden field shaping reactions, dreams, attractions, fears, and images before we fully understand them.',
      },
      {
        title: 'The shadow',
        body: 'The shadow is what the personality pushes away. It can hold shame, anger, envy, desire, talent, and power. When met carefully, avoided energy can become honesty and wisdom.',
      },
      {
        title: 'The persona',
        body: 'The persona is the social mask: the version of ourselves that knows how to function in the world. It helps us belong, but it becomes dangerous when we forget there is more behind it.',
      },
      {
        title: 'Archetypes',
        body: 'Archetypes are deep human patterns that appear in myths, dreams, stories, and behavior. Child, elder, hero, trickster, mother, lover, warrior, and creator are not labels. They are energies moving through a life.',
      },
      {
        title: 'The collective unconscious',
        body: 'Jung noticed that similar images appear across cultures and centuries. He called this shared symbolic inheritance the collective unconscious: a deep layer where human experience forms recurring shapes.',
      },
      {
        title: 'Dreams as messages',
        body: 'Dreams can be read as symbolic weather from the deeper mind. They rarely speak in direct instructions. They show images, tensions, and possibilities that waking life may be avoiding.',
      },
      {
        title: 'Symbols carry more than words',
        body: 'A symbol carries more than a definition. A door, river, circle, animal, tower, or child can hold a whole emotional situation at once. Images can explain what logic has not yet organised.',
      },
      {
        title: 'Complexes',
        body: 'A complex is an emotionally charged knot. Something small happens, and the reaction becomes much larger than the moment. The past has entered the room before the person knows it.',
      },
      {
        title: 'Individuation',
        body: 'Individuation is the path of becoming more whole. It is not perfection or self-improvement theatre. It is learning to include the rejected, undeveloped, and forgotten parts of the self.',
      },
      {
        title: 'The inner opposite',
        body: 'Jung believed the psyche often carries hidden complementary energies. A person who is all control may need softness. A person who is all feeling may need structure. Wholeness reduces one-sidedness.',
      },
      {
        title: 'Active imagination',
        body: 'Active imagination means entering dialogue with an image, dream figure, feeling, or inner character. The point is not fantasy for escape. It is conversation with material already alive inside the psyche.',
      },
      {
        title: 'Synchronicity',
        body: 'Synchronicity names moments when inner meaning and outer event seem to meet. Jung did not treat this as proof of magic. He treated it as a reminder that the psyche seeks pattern and meaning.',
      },
      {
        title: 'The mandala',
        body: 'The mandala is a symbol of psychic order around a center. When life feels scattered, circular images can express a wish for integration: many parts arranged around something steady.',
      },
      {
        title: 'Myth in modern life',
        body: 'Myth is not only ancient material. Old story patterns still shape work, love, art, fame, technology, and fear. A modern life can be pulled by very old images.',
      },
      {
        title: 'The digital shadow',
        body: 'The digital world gives the shadow new stages: feeds, avatars, projection, comparison, outrage, and performance. Jung helps ask what part of ourselves we are meeting on the screen.',
      },
      {
        title: 'Creativity as integration',
        body: 'Creativity can hold conflict until it becomes form. A drawing, song, story, room, or map can let opposite forces speak without immediately choosing a winner.',
      },
      {
        title: 'Relationships as mirrors',
        body: 'Relationships often become mirrors. We may see in another person what we cannot yet see in ourselves. Projection is not a reason to blame yourself. It is a chance to reclaim energy.',
      },
      {
        title: 'Colourmap as inner atlas',
        body: 'Colourmap becomes Jungian when it treats inner life as image, pattern, and story. Check-ins, archetypes, symbols, dreams, and maps can help the user see the psyche as a living atlas.',
      },
      {
        title: 'Toward wholeness',
        body: 'The aim is not perfection. The aim is a wider, kinder, more integrated life. Wholeness begins when the rejected parts are no longer exiled from the map.',
      },
    ],
  },
  {
    key: 'paulo-freire',
    domain: 'Paulo Freire & Collective Hope',
    color: '#D0A35F',
    segments: [
      {
        title: 'The world is made, so it can be remade',
        body: 'Freire was born into poverty in Recife, Brazil, and felt early how hunger and social conditions could block access to knowledge, confidence, and dignity. His hope was not abstract. It came from lived experience: if the world is organized in ways that silence people, then education must help them read that world and participate in changing it.',
      },
      {
        title: 'People are not empty containers',
        body: 'Freire called the controlling version of school the banking model of education. The teacher deposits knowledge; the student stores it. The teacher speaks; the student adapts. This serves power because passive learners are easier to dominate. The problem is dehumanization: people are treated as receiving objects instead of thinking beings with prior knowledge, skills, memory, questions, and creative power.',
      },
      {
        title: 'Naming reality gives power back',
        body: 'Freire said banking education suffers from "narration sickness": reality is narrated as a static thing, separated from the learner\'s actual life. Naming reality works differently. Debt, hunger, silence, shame, exclusion, and work are not private fog. They become material for understanding the structure of life and acting inside it.',
      },
      {
        title: 'Consciousness grows through dialogue',
        body: 'Freire did not replace one monologue with another. His alternative was problem-posing education: teacher and learner become co-investigators of reality. The teacher still carries responsibility for content, structure, and expertise, but also becomes a learner among learners. The curriculum begins with actual lives: experiences, concerns, and questions. Knowledge is constructed together, and the deeper shift is about who has the right to speak, know, and imagine a different world.',
      },
      {
        title: 'The personal and political meet',
        body: 'Your inner life is shaped by outer systems, and outer systems are reproduced through inner habits. Shame, silence, obedience, cynicism, and isolation all have social consequences. Courage, language, trust, and solidarity do too. Transformation asks for both: inner awakening and shared movement.',
      },
      {
        title: 'Praxis: reflection plus action',
        body: 'Freire used praxis for the living combination of reflection and action. People reflect on their reality, act to change it, reflect again on what happened, and act further. It is not a straight line. It is a spiral. It is also not only individual: real praxis becomes collective, because people learn from shared action and carry its impact into the future.',
      },
      {
        title: 'Hope is a practice, not a mood',
        body: 'Hope is not waiting for rescue. It is a practice of looking directly at difficulty while still making room for possibility. It asks: what is one real thing we can understand better, build differently, or refuse together? Hope becomes credible when it produces movement, even small movement.',
      },
      {
        title: 'Unity is not sameness',
        body: 'People do not unite by becoming identical. They unite by finding the shared structure beneath different experiences. One person names exhaustion. Another names money fear. Another names loneliness. The details differ, but the pattern may rhyme. Solidarity begins when private burdens become visible as connected realities.',
      },
      {
        title: 'Education can be liberation',
        body: 'Learning is not only collecting information. At its best, education helps people recover agency. It teaches them to read the world, read themselves, and participate in changing both. A good education does not make the user dependent on the teacher. It makes the learner more able to think, speak, and act with others.',
      },
      {
        title: 'From one check-in to a collective map',
        body: 'Colourmap begins with one person noticing their state. Freire helps extend that: many people noticing honestly can reveal patterns no one could see alone. The private map becomes a shared map. The shared map becomes a basis for repair, design, organising, and hope.',
      },
      {
        title: 'The future needs participants',
        body: 'A fixed world asks for adaptation. A living world asks for participation. Freire gives the deeper challenge: do not only survive the system, learn to read it with others and help remake it. The question is not whether everything can change at once. The question is where consciousness, courage, and collective action can begin.',
      },
    ],
  },
  {
    key: 'viktor-frankl',
    domain: 'Viktor Frankl & Meaning Under Pressure',
    color: '#9A8A68',
    segments: [
      {
        title: 'Meaning is not decoration',
        body: 'Frankl treated meaning as one of the deepest human needs. Not a motivational quote, not a pleasant mood, but a direction strong enough to organize a life under pressure. When comfort disappears, the question of meaning becomes more serious, not less.',
      },
      {
        title: 'The space before response',
        body: "One of Frankl's central insights is that human beings can still carry a space between what happens and how they respond. That space may be small. It may be painfully hard to reach. But it is where dignity, responsibility, and inner freedom begin.",
      },
      {
        title: 'Suffering is not automatically meaningful',
        body: 'Frankl did not romanticize pain. Avoidable suffering should be reduced. Injustice should be resisted. The point is different: when suffering cannot be avoided, a person may still choose the attitude, values, and commitments they bring into it.',
      },
      {
        title: 'The question turns around',
        body: 'Instead of asking only what life can give us, Frankl asks what life is asking from us. This changes the posture. A difficult day becomes less like a verdict and more like a question: what is the next responsible act available here?',
      },
      {
        title: 'Love as a way of seeing',
        body: 'For Frankl, love can reveal the possible person inside another human being. To love someone is not only to need them. It is to see their dignity, their future, and their unreduced humanity even when circumstances are trying to shrink them.',
      },
      {
        title: 'Work can become service',
        body: 'Work becomes meaningful when it connects effort to contribution. The task may still be hard, boring, or imperfect, but it changes when the person can see who or what it serves. Meaning often arrives through responsibility carried for something beyond the ego.',
      },
      {
        title: 'The last freedom',
        body: 'The outer world can restrict choices, but Frankl keeps returning to the inner question: what remains mine? A tone of response. A remembered love. A decision not to become cruel. A small act of help. These are not small when everything else is being stripped away.',
      },
      {
        title: 'Values give direction',
        body: 'Frankl described meaning through creative values, experiential values, and attitudinal values: what we give, what we receive deeply, and how we stand when life is difficult. A meaningful life usually needs all three.',
      },
      {
        title: 'Do not chase happiness directly',
        body: 'Happiness becomes fragile when it is hunted as the main target. Frankl argued that happiness often appears as a by-product of meaning: doing the task, loving the person, serving the value, answering the demand of the moment.',
      },
      {
        title: 'Despair as meaning blocked',
        body: 'Despair can appear when suffering feels larger than meaning. This does not mean a person has failed. It means the map needs care. The practical question becomes: what small responsibility, relationship, or value can still be contacted today?',
      },
      {
        title: 'A future to answer to',
        body: 'Frankl often points attention toward a future that needs something from us. A book unwritten, a person unloved, a repair not yet made, a service not yet offered. The future becomes a quiet witness calling the present into shape.',
      },
      {
        title: 'Colourmap as meaning map',
        body: 'In Colourmap, Frankl belongs wherever emotion meets responsibility. A check-in does not only ask how you feel. It can ask what the feeling is protecting, what value is calling, and what one meaningful response could be made now.',
      },
    ],
  },
  {
    key: 'thich-nhat-hanh',
    domain: 'Thich Nhat Hanh & Peace in Action',
    color: '#8FAE86',
    segments: [
      {
        title: 'The bell of now',
        body: 'Thich Nhat Hanh taught that peace begins by returning to the present moment. Not as escape, but as contact with life. One breath can interrupt the rush. One pause can make room for a different response.',
      },
      {
        title: 'Breathing is a doorway',
        body: 'The breath is always close. When attention returns to breathing, the body receives a signal that it does not need to run everywhere at once. The practice is simple: notice the in-breath, notice the out-breath, and let the nervous system arrive.',
      },
      {
        title: 'Walking without rushing',
        body: 'Walking meditation turns movement into presence. Each step becomes a small vote for being here. The goal is not to reach the next place faster. The goal is to stop abandoning the place where life is already happening.',
      },
      {
        title: 'Interbeing',
        body: 'Interbeing means nothing exists alone. A sheet of paper contains tree, rain, soil, sunlight, worker, road, and reader. Seeing this breaks the illusion of separation. Your life is made of relationships, and your choices ripple through the field.',
      },
      {
        title: 'The cloud in the paper',
        body: 'A simple object can reveal a whole world. When you look deeply, the ordinary becomes connected: food, clothes, messages, rooms, money, conflict, and care. Mindfulness is the ability to see the many conditions inside one moment.',
      },
      {
        title: 'Suffering needs tenderness',
        body: 'Pain does not transform through punishment. It begins to soften when held with attention. Instead of attacking sadness, fear, or anger, the practice is to recognise it, make room for it, and care for it like something wounded.',
      },
      {
        title: 'Anger is a signal',
        body: 'Anger can feel like a command, but it is also information. Thich Nhat Hanh invited people to hold anger before speaking from it. The pause does not make you passive. It gives wisdom time to join the energy.',
      },
      {
        title: 'Deep listening',
        body: 'Deep listening is listening with the aim of understanding, not winning. It asks the body to stay present while another person reveals their world. When someone feels truly heard, the atmosphere can begin to change.',
      },
      {
        title: 'Loving speech',
        body: 'Speech can be a bridge or a weapon. Loving speech does not mean avoiding truth. It means choosing words that keep the door to understanding open. A difficult sentence can still carry respect.',
      },
      {
        title: 'Peace is practical',
        body: 'Peace is not only an inner mood. It appears in how we eat, walk, work, consume, argue, build, and repair. A peaceful life is made from ordinary practices repeated until the atmosphere around us changes.',
      },
      {
        title: 'Engaged Buddhism',
        body: 'For Thich Nhat Hanh, spiritual practice did not stop at the meditation cushion. During war and social suffering, practice had to enter hospitals, schools, villages, politics, and daily service. Inner peace and social action belong together.',
      },
      {
        title: 'The sangha',
        body: 'A sangha is a community of practice. Transformation becomes easier when people breathe, listen, learn, and act together. The self is not repaired alone in a private room. It is nourished through relationships that support clarity.',
      },
      {
        title: 'Consuming with awareness',
        body: 'What we consume becomes part of our mind and body. News, food, images, conversations, and entertainment all leave traces. Mindful consumption asks: does this nourish understanding, or does it feed fear, craving, and numbness?',
      },
      {
        title: 'No mud, no lotus',
        body: 'The lotus does not grow outside the mud. Difficulty can become material for compassion, depth, and wisdom when it is not denied. The point is not to romanticise pain. The point is to discover what can grow from honest contact with it.',
      },
      {
        title: 'The child inside',
        body: 'Many reactions come from younger places inside us. Mindfulness can turn toward the inner child with patience instead of shame. Healing begins when the frightened part is no longer abandoned by the adult self.',
      },
      {
        title: 'Rest is part of the path',
        body: 'Modern life often treats rest as failure. Thich Nhat Hanh treated rest as intelligent care. A tired body cannot keep producing clarity. Stopping, lying down, breathing, and doing nothing can be part of transformation.',
      },
      {
        title: 'Touching the Earth',
        body: 'To touch the Earth is to remember that we belong to something larger than our private worries. Body, ancestors, planet, and future generations meet in the present. This view can turn anxiety into responsibility and gratitude.',
      },
      {
        title: 'The miracle is ordinary',
        body: 'A cup of tea, a leaf, a step, a hand, a bowl of food: these are not small if attention is present. Mindfulness restores dignity to ordinary life. The miracle is not elsewhere. It is the life we usually rush past.',
      },
      {
        title: 'Building peace together',
        body: 'Personal calm matters, but it is not the whole story. Peace becomes stronger when families, teams, schools, communities, and movements learn to breathe before reacting and listen before hardening. The collective nervous system can change.',
      },
      {
        title: 'One breath, one action',
        body: 'The teaching returns to simplicity. Breathe. See clearly. Speak carefully. Consume wisely. Walk with the Earth. Act with others. A different world begins as a different quality of presence, repeated in ordinary life.',
      },
    ],
  },
  {
    key: 'plato-cave',
    domain: "Plato's Cave & Modern Attention",
    color: '#8870A8',
    segments: [
      {
        title: 'The old cave',
        body: 'Plato imagines people chained in a cave, watching shadows on a wall and mistaking them for reality. The point is not that people are stupid. The point is that a whole environment can train attention until a partial image feels like the world.',
      },
      {
        title: 'The modern cave',
        body: 'Today the cave can look like a room, a phone, a feed, a wall of projections, a culture of comparison, or a constant state of urgency. The shadows are not only online. They are any representation that becomes stronger than lived experience.',
      },
      {
        title: 'Turning around',
        body: 'The first movement is not escape. It is turning around. A person begins to ask: who is choosing what I see? What is being projected? What part of life am I mistaking for the whole?',
      },
      {
        title: 'The map on the wall',
        body: 'The ancient cave becomes useful because it gives the modern person a map. Shadow, projector, chain, turn, tunnel, light. These are not museum ideas. They are still active wherever attention is captured.',
      },
      {
        title: 'Walking toward light',
        body: 'Finding the light is uncomfortable at first. Reality is brighter, less controlled, and less flattering than the shadow wall. Liberation often begins as withdrawal from the familiar illusion.',
      },
      {
        title: 'What is the light?',
        body: 'The light is not a perfect life. It is contact with what is real: body, time, place, people, consequences, nature, work, silence, and the parts of experience that cannot be optimized into an image.',
      },
      {
        title: 'Where this can expand next',
        body: 'Page 8 could show returning to the cave without contempt. Page 9 could connect the cave to Watts and life as participation. Page 10 could map attention as a Colourmap field. Page 11 could ask the reader what shadow currently feels most real.',
      },
    ],
  },
  {
    key: 'alan-watts',
    domain: 'Alan Watts: Life Is Not The Final Note',
    color: '#7FA08A',
    segments: [
      {
        title: 'Next mode',
        body: 'Watts helps name a modern sickness: living as if the present is only a corridor to the next result. Next task, next message, next proof, next success. The day becomes a race through itself.',
      },
      {
        title: 'The final note',
        body: 'If music were only about reaching the last note, the best musician would play as fast as possible. Life works the same way. A life treated only as arrival loses the rhythm that makes it alive.',
      },
      {
        title: 'Trying to win the river',
        body: 'The mind tries to measure the river instead of entering the flow. This is not anti-discipline. It is a warning: control can become a way of missing experience.',
      },
      {
        title: 'Participation',
        body: 'Watts points back toward participation. A day has tempo, silence, repetition, surprise, work, rest, and return. You do not win a dance by reaching the wall first.',
      },
      {
        title: 'The senses return',
        body: 'Presence begins in simple contact: the cup, the rain, the plant, the breath, the room. The ordinary is not lesser than achievement. It is where life actually happens.',
      },
      {
        title: 'A day as music',
        body: 'Colourmap can show whether a day is pure urgency, numb scrolling, scattered noise, or a livable rhythm. The aim is not to remove ambition. It is to give ambition a body and a beat.',
      },
      {
        title: 'Listening before reaching',
        body: 'Presence is not passive. It is a different kind of intelligence: hearing the rhythm before forcing the next move. A calmer life does not have to be smaller. It can simply stop skipping itself.',
      },
      {
        title: 'Where this can expand next',
        body: 'Page 9 could show work with rhythm instead of panic. Page 10 could connect Watts to Plato: leaving the shadow wall for lived reality. Page 11 could ask what part of the user’s day has no music. Page 12 could become a practical attention ritual.',
      },
    ],
  },
  {
    key: 'david-hawkins',
    domain: 'David Hawkins & Fields of Consciousness',
    color: '#8E9A68',
    segments: [
      {
        title: 'A symbolic scale',
        body: 'Hawkins proposed a scale of consciousness moving from contracted states toward courage, love, peace, and higher clarity. His calibration system is criticized and should not be treated as scientific consensus, but the symbolic map can still be useful.',
      },
      {
        title: 'Attractor patterns',
        body: 'One strong idea is that life is not pure chaos. States behave like fields. Shame, fear, courage, love, and peace each have a gravity. A person can be pulled by a field before they understand the thought.',
      },
      {
        title: 'Self-pity as gravity',
        body: 'Hawkins wrote often about lower states like self-pity and resentment. The point is not to shame the person. It is to notice the field: what does this state keep pulling me toward, and what small movement loosens it?',
      },
      {
        title: 'Surrender is release',
        body: 'Surrender does not mean defeat. It means releasing the inner argument with what is already present, so attention can return to the next true action. Sometimes the clenched hand is the prison.',
      },
      {
        title: 'When times get tough',
        body: 'When pressure rises, the practical question is: what field am I feeding now? Panic, blame, courage, service, humility, trust. A single helpful act can shift the atmosphere of the whole room.',
      },
      {
        title: 'Useful, but disputed',
        body: 'Hawkins can be read as a symbolic thinker rather than a scientific authority. Keep the discernment. Take the useful question: which state is organizing me, and what would lift the pattern one degree?',
      },
      {
        title: 'A quieter field',
        body: 'A state can change the room before anyone explains it. One relaxed breath, one honest apology, one act of service, one refusal to feed panic. The field shifts through small embodied choices.',
      },
      {
        title: 'Where this can expand next',
        body: 'Page 9 could show the consciousness scale beside emotions. Page 10 could connect surrender to Watts and participation. Page 11 could map attractor fields inside Colourmap. Page 12 could ask the reader what field they want to stop feeding.',
      },
    ],
  },
  {
    key: 'nietzsche',
    domain: 'Nietzsche & Becoming Who You Are',
    color: '#9A6F58',
    segments: [
      {
        title: 'Inherited values',
        body: 'Nietzsche asks a hard question: which values are truly yours, and which ones were handed to you by fear, obedience, resentment, fashion, or the crowd? His work is dangerous because it removes easy innocence.',
      },
      {
        title: 'The burden',
        body: 'The camel carries what it has been told to carry. Duty, guilt, family scripts, cultural scripts, old ideals. Endurance matters, but endurance alone is not freedom.',
      },
      {
        title: 'The no',
        body: 'The lion says no. No to inherited command, no to false gods, no to the voice that says you must remain small. This no is not the whole path, but it clears space for a real yes.',
      },
      {
        title: 'The child',
        body: 'The child represents creation: play, beginning again, making values instead of only obeying or rejecting them. Becoming is not only rebellion. It is the courage to create a new form of life.',
      },
      {
        title: 'The abyss',
        body: 'Looking into the abyss means meeting what is difficult, shadowed, and dangerous in yourself and the world. The aim is not to worship darkness. The aim is to see without being swallowed.',
      },
      {
        title: 'Amor fati',
        body: 'Amor fati means learning to say yes to the whole path, not because everything was good, but because this is the material from which your life must be made. The broken stones can become the road.',
      },
      {
        title: 'The mask on the desk',
        body: 'Becoming often begins when the old mask is finally placed down. Not destroyed in drama. Just seen clearly, thanked if it once protected you, and no longer mistaken for the face.',
      },
      {
        title: 'Where this can expand next',
        body: 'Page 9 could explore eternal recurrence as a life question. Page 10 could connect Nietzsche to Campbell’s hero path. Page 11 could ask which inherited value the reader is ready to examine. Page 12 could become a Colourmap values ritual.',
      },
    ],
  },
  {
    key: 'campbell-hero-quest',
    domain: "Campbell & The Hero's Quest",
    color: '#B58A58',
    segments: [
      {
        title: 'The call',
        body: 'Campbell described a recurring story pattern: ordinary world, call to adventure, threshold, trials, ordeal, gift, return. It matters because it gives shape to change without pretending change is easy.',
      },
      {
        title: 'Refusing the call',
        body: 'Most quests begin with hesitation. The known world may be painful, but it is familiar. Refusal is not failure. It is the psyche measuring the cost of crossing the threshold.',
      },
      {
        title: 'Crossing the threshold',
        body: 'At some point the person steps out of the known room. The threshold can be a journey, a breakup, a project, a recovery, a conversation, a risk, or a decision to stop lying to yourself.',
      },
      {
        title: 'Trials and helpers',
        body: 'The road is not walked alone. Helpers, tools, symbols, books, friends, mentors, and strange accidents appear. The task is learning which guides are real and which are distractions.',
      },
      {
        title: 'The inner cave',
        body: 'The ordeal is often an encounter with the self: fear, shadow, grief, desire, power, shame, or truth. The treasure is rarely outside the cave. It is the transformation that happens inside it.',
      },
      {
        title: 'The conscious threshold',
        body: 'A quest does not always begin with a dramatic road. Sometimes it begins with a cloak on a chair, a lamp on a table, and one door you can no longer pretend not to see.',
      },
      {
        title: 'Where this can expand next',
        body: 'Page 8 could show the return with the gift. Page 9 could connect the quest to Plato’s cave. Page 10 could connect Nietzsche’s self-creation. Page 11 could ask what call the reader is refusing. Page 12 could become a personal quest map.',
      },
    ],
  },
  {
    key: 'gandhi',
    domain: 'Gandhi & The Power of Small Things',
    color: '#C9A15D',
    segments: [
      {
        title: 'A life begins unfinished',
        body: 'Gandhi did not begin as a symbol. He was shy, uncertain, ambitious, and searching. The first lesson is hopeful: purpose is not always born complete. Sometimes it is shaped slowly by discomfort, failure, study, and the decision to keep listening.',
      },
      {
        title: 'An insult becomes a question',
        body: 'In South Africa, Gandhi met humiliation that could have made him smaller or bitter. Instead, he asked a harder question: what kind of power can answer injustice without becoming the same kind of force?',
      },
      {
        title: 'Purpose is made from pain',
        body: 'His purpose did not arrive as a slogan. It formed when private hurt became moral attention. The wound became a doorway into the suffering of many people, and that made his life larger than self-protection.',
      },
      {
        title: 'Dialogue before domination',
        body: 'Gandhi’s work grew through meetings, letters, listening, disagreement, and shared discipline. He did not only want followers. He wanted ordinary people to recover their own voice and courage together.',
      },
      {
        title: 'Satyagraha: holding truth',
        body: 'Satyagraha means holding onto truth with firmness. It is not passivity. It is disciplined resistance that refuses hatred as a method. The aim is to confront wrong while still protecting the humanity of everyone involved.',
      },
      {
        title: 'The spinning wheel',
        body: 'The charkha turned politics into daily practice. Spinning cloth said: we can make something with our own hands. A small repeated act became a symbol of dignity, self-reliance, and freedom from dependency.',
      },
      {
        title: 'Service gives direction',
        body: 'Gandhi found purpose by moving closer to ordinary life: villages, food, sanitation, clothing, work, fear, and hunger. A real mission is not only an idea. It asks what people need in the texture of daily living.',
      },
      {
        title: 'Ashram as practice ground',
        body: 'The ashram was not an escape from the world. It was a laboratory for truth: simple living, shared labor, prayer, cleaning, study, and self-restraint. The future society had to be practiced in miniature.',
      },
      {
        title: 'Walking turns fear into movement',
        body: 'The Salt March showed how a road can become a school of courage. People did not need to feel powerful before acting. They became powerful by walking together, step after step, toward a clear shared act.',
      },
      {
        title: 'A pinch of salt',
        body: 'Salt was small, ordinary, and necessary. That was the point. Gandhi understood symbols: when people see freedom inside something simple, the whole world becomes easier to read and harder to accept blindly.',
      },
      {
        title: 'Power returns to ordinary people',
        body: 'His deepest strategy was empowerment. The hero was not one man. The hero was a population discovering that discipline, courage, sacrifice, and cooperation could turn weakness into collective strength.',
      },
      {
        title: 'Inner freedom matters',
        body: 'Gandhi treated self-rule as both political and personal. If fear, craving, anger, or dependency ruled the inner life, outer freedom would remain fragile. Transformation had to happen in the person and the society together.',
      },
      {
        title: 'Courage is trained',
        body: 'Nonviolence was not simply being gentle. It required training the body to pause, endure, speak truth, and keep dignity under pressure. Peace became a practice, not a mood.',
      },
      {
        title: 'Freedom without hatred',
        body: 'Independence was not meant to become revenge. Gandhi wanted freedom that did not poison the future. The hard task was to resist domination without letting bitterness become the new ruler.',
      },
      {
        title: 'When the map split',
        body: 'As India and Pakistan were born through pain and displacement, Gandhi turned toward the wound. He refused to treat people as enemies by identity. He kept asking for brotherhood when fear made brotherhood feel impossible.',
      },
      {
        title: 'Brotherhood in dangerous times',
        body: 'His message during communal violence was simple and demanding: your neighbor’s life is not disposable. Real courage is not only fighting for your side. It is protecting the human bond when the crowd wants to break it.',
      },
      {
        title: 'The body as a moral bell',
        body: 'Gandhi’s fasts were a severe form of appeal. He used his own body to ring a bell in the conscience of the community: stop, look, remember what hatred is doing to us.',
      },
      {
        title: 'Peace is rebuilt locally',
        body: 'Brotherhood is not only declared by leaders. It is rebuilt through wells, meals, apologies, protection, shared work, and the first small gesture after fear. Society changes where people meet again.',
      },
      {
        title: 'A method travels',
        body: 'Gandhi’s legacy moved beyond one country: civil rights, freedom movements, peace work, and everyday acts of conscience. The method was portable because it began with things anyone can practice: truth, discipline, courage, and care.',
      },
      {
        title: 'The work continues',
        body: 'The point is not to worship Gandhi. The point is to ask what small truthful act is available now. A thread, a step, a meal, a word, a refusal, a hand extended: transformation often begins very small.',
      },
    ],
  },
  {
    key: 'room-to-breathe',
    domain: 'Room to Breathe',
    color: '#C8B67A',
    segments: [
      {
        title: 'The mind gets full',
        body: 'Sometimes the mind fills up before we notice. Thoughts, messages, duties, memories, tiny fears. Nothing is wrong with you. The room is just crowded. The first step is not to solve everything. It is to notice how full the room has become.',
      },
      {
        title: 'You are not the noise',
        body: 'A thought can be loud without being true. A feeling can be intense without being the whole of you. A worry can visit without becoming your home. Space begins when you can say: this is happening in me, but it is not all of me.',
      },
      {
        title: 'One small anchor',
        body: 'You do not need to fix your life in one moment. Start smaller. Feel your feet. Notice your breath. Relax your jaw. Let the body become the first safe place. A small anchor is enough to stop the mind from drifting everywhere at once.',
      },
      {
        title: 'One next step',
        body: 'Clarity usually returns in pieces. Not as a grand answer, but as one possible movement. Drink water. Open the window. Send the message. Rest for ten minutes. Begin again. The next step does not need to be impressive. It only needs to be real.',
      },
      {
        title: 'Hope stays practical',
        body: 'Hope is not pretending everything is fine. Hope is keeping one small part of the future open. It is the part of you that says: something can still move. Something can still soften. Something can still grow from here.',
      },
      {
        title: 'There is room',
        body: 'The mind can become spacious again. Not empty. Not perfect. Spacious enough to breathe, choose, and move. You do not need to become a different person to find that space. You only need one honest pause, then another.',
      },
      {
        title: 'Carry the space with you',
        body: 'The space you found does not have to stay on this page. Take one piece of it into the day: one breath, one anchor, one small step, one open hope. That is how a practice begins.',
      },
    ],
  },
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
    key: 'struggle-letting-go',
    domain: 'Struggle & Letting Go',
    color: '#B48762',
    segments: [
      {
        title: 'Struggle is not always failure',
        body: 'When life feels difficult, the mind often translates struggle as proof that something is wrong. But struggle can also mean that the system is changing. A muscle shakes when it is learning a new load. A mind becomes noisy when an old pattern is being questioned. A life feels tense when two truths are asking to be integrated. The first move is not to force an answer. It is to stop treating the struggle as evidence against yourself.',
      },
      {
        title: 'What the resistance is protecting',
        body: 'Resistance usually has intelligence inside it. The part of you that avoids, delays, freezes, or escapes may be trying to protect you from shame, exhaustion, disappointment, or too much pressure at once. If you only attack the resistance, it gets louder. If you ask what it is protecting, it becomes information. Letting go begins when you stop fighting the protector and start listening for the need underneath it.',
      },
      {
        title: 'Do not force the river',
        body: 'Forcing can look productive, but it often narrows the nervous system. You push harder, think faster, tighten the body, and lose access to the exact clarity you need. Letting go is not giving up. It is releasing the extra tension around the action. You can still move. You can still care. But you stop trying to solve your whole life from a contracted state. Sometimes the wisest move is to soften enough that the next true step becomes visible.',
      },
      {
        title: 'Small steps change the weather',
        body: 'A small step is not small to the nervous system. Opening the document, drinking water, walking outside for five minutes, sending one message, cleaning one surface: each tiny action gives the body evidence that movement is possible. This matters because overwhelm feeds on abstraction. Small steps make life concrete again. You do not need to win the whole day. You need one real movement that changes the temperature of the moment.',
      },
      {
        title: 'How struggle shapes you',
        body: 'The difficult period can become a teacher if it does not become your identity. Struggle shows where you are overextended, where you need support, where an old strategy has expired, where a desire is real enough to hurt. It can deepen patience, humility, discernment, and compassion. But only if you metabolise it. That means reflecting, resting, adjusting, and choosing what the struggle is asking you to learn rather than simply enduring it.',
      },
      {
        title: 'Let go, then return',
        body: 'Letting go is a rhythm. You release the pressure, come back to the body, name one thing that matters, and return with less violence. The aim is not to become passive. It is to stop using force as the only proof that you care. You can care deeply and move gently. You can be ambitious and patient. You can build the future while taking one honest step today.',
      },
      {
        title: 'The practice for today',
        body: 'Write the sentence: "The core struggle is..." Then write: "The smallest real step is..." Do only that step. Afterward, notice whether the inner weather changed by even five percent. That five percent matters. It is how a stuck system remembers that movement is still possible.',
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
    key: 'clear-allen',
    domain: 'Clear & Allen: Organisation As Freedom',
    color: '#7C8A5E',
    segments: [
      {
        title: 'Part 1: James Clear',
        body: 'James Clear begins with a quiet idea: life changes less through dramatic promises than through tiny repeated systems. A habit is a vote for the person you are becoming. Organisation is not punishment. It is the shape that lets change compound.',
      },
      {
        title: 'Identity before intensity',
        body: 'Clear shifts the question from "what do I want to achieve?" to "who am I practicing becoming?" A writer writes. A musician returns to the instrument. A healthy person prepares the next small healthy action. Identity becomes practical when it is repeated in small visible acts.',
      },
      {
        title: 'Make it visible',
        body: 'The first law is to make the cue obvious. The environment should show the next action instead of hiding it. A guitar on a stand, a notebook open, shoes by the door, one visible task: the world starts helping the behavior instead of asking memory to carry everything.',
      },
      {
        title: 'Make it attractive',
        body: 'Change becomes easier when the next step has emotional gravity. Beauty, music, ritual, friendship, and a good setting can pull the body toward action. Discipline is not only force. It can be designed as attraction.',
      },
      {
        title: 'Make it easy',
        body: 'The smallest version of the habit matters because it lowers the gate. Two minutes can protect the thread. Open the file. Tune the guitar. Put one object away. The action is small, but the identity stays alive.',
      },
      {
        title: 'Make it satisfying',
        body: 'The nervous system learns from completion. A checkmark, a clear surface, a song recorded, a small page finished: satisfaction closes the loop. The point is not childish reward. It is evidence that action changes the field.',
      },
      {
        title: 'Systems beat moods',
        body: 'Clear is useful because he removes shame from inconsistency. If the habit fails, inspect the system. Was the cue hidden? Was the action too hard? Was the reward too distant? The problem is often design, not character.',
      },
      {
        title: 'Organisation as a garden',
        body: 'Clear turns growth into gardening: place the seeds, shape the light, remove friction, return often. Change becomes less theatrical and more alive. The future is not forced once. It is cultivated.',
      },
      {
        title: 'Part 2: David Allen',
        body: 'David Allen begins from a different door: the mind is not built to hold every open loop. When commitments live only in the head, attention stays tense. Capture gives the mind a place to put the unfinished world.',
      },
      {
        title: 'Capture everything',
        body: 'Allen starts with collection. Tasks, worries, promises, ideas, errands, fragments, and creative sparks all need a trusted place outside the head. Capture is not organisation yet. It is relief: nothing important has to shout to be remembered.',
      },
      {
        title: 'Clarify the next action',
        body: 'A vague task creates fog. "Fix life" is impossible. "Send the message," "open the invoice," or "write the first paragraph" gives the body a handle. Clarifying means turning pressure into a visible next move.',
      },
      {
        title: 'Organise by context',
        body: 'Allen separates material by what it needs: calendar, next actions, waiting for, projects, someday. This matters because the right list appears at the right moment. Organisation becomes a map of possible action, not a pile of guilt.',
      },
      {
        title: 'Review to trust the system',
        body: 'A system is only calming if you return to it. Review is the ritual that keeps the map alive. You look at what is open, update what changed, and choose with a clearer mind. Trust is maintained by return.',
      },
      {
        title: 'Engage from clarity',
        body: 'The final move is not more planning. It is doing the right thing from a clear field. Allen helps action feel lighter because the mind knows the rest is held somewhere. Focus becomes possible because the whole system is not screaming.',
      },
      {
        title: 'Clear plus Allen',
        body: 'Together they make a powerful bridge. Clear teaches the tiny system that changes identity. Allen teaches the trusted system that frees attention. One helps behavior repeat. The other helps the mind relax enough to choose.',
      },
      {
        title: 'Colourmap organisation',
        body: 'For Colourmap, organisation should not mean productivity capitalism. It should mean inner freedom: capture the fragments, design the next step, notice the emotional resistance, and build systems that let life move with less violence.',
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
  {
    key: 'deep-attention',
    domain: 'Deep Attention & Flow',
    color: '#6888B0',
    segments: [
      {
        title: 'The most valuable thing you own',
        body: 'Your attention is the only thing you can truly give. Not your time — two people can be in the same room for an hour and one is present, one is absent. Not your words — you can say the right thing while thinking about something else entirely. Attention is presence. And in a world architected to fragment it into the smallest possible pieces and sell those pieces to the highest bidder, protecting and deepening your attention is the most important skill of this century.',
      },
      {
        title: 'The attention economy is not neutral',
        body: 'Every notification, every infinite scroll, every autoplay, every streak mechanic — these are not accidental features. They are the output of thousands of engineers whose job is to capture and hold your attention as long as possible. Dopamine loops, variable reward schedules, social anxiety mechanics — the same techniques used in casino design are deployed in every major platform. Your distraction is their revenue. Understanding this is not paranoia. It is literacy.',
      },
      {
        title: 'What multitasking actually costs',
        body: "The human brain cannot multitask. What it can do is switch rapidly between tasks — and each switch carries a cost. Researcher Gloria Mark found that after an interruption, it takes an average of 23 minutes to return to deep focus. A phone glance costs nearly half an hour of cognitive depth. But the hidden cost is worse: research shows that habitual task-switching trains the brain to become worse at sustaining attention over time. You are not just wasting today's focus. You are degrading tomorrow's capacity.",
      },
      {
        title: 'What flow actually is',
        body: 'Psychologist Mihaly Csikszentmihalyi spent decades studying what he called optimal experience — states where people reported being completely absorbed, losing track of time, and feeling at their best. He called this flow. It appears across domains: athletes, surgeons, musicians, coders, writers. The common features: clear goals, immediate feedback, the challenge is slightly beyond current skill, and there are no distractions. Flow is not a reward for effort. It is a state the brain enters when conditions are right. The question is whether you know how to create those conditions.',
      },
      {
        title: 'The skill-challenge balance',
        body: 'Flow lives at the intersection of two axes: challenge and skill. Too much challenge relative to skill produces anxiety — the brain contracts into threat mode. Too little challenge relative to skill produces boredom — the brain disengages. Flow requires the sweet spot: a challenge that stretches you to the edge of your current capability without breaking you. This means flow is not a static target. As your skill grows, the challenge must grow with it. The musician who stops playing harder pieces stops experiencing flow. The writer who only writes what they already know how to write stops growing — and stops entering the state that made the work feel alive.',
      },
      {
        title: 'The neuroscience of distraction',
        body: 'The prefrontal cortex — the part of your brain responsible for sustained attention, complex reasoning, and executive function — is metabolically expensive. The brain is always looking for shortcuts, always ready to hand control to autopilot. When you give it an easy dopamine hit — a notification, a scroll, a quick check — it takes it. But prefrontal function also degrades under stress, fatigue, and fragmented attention. The brain that lives in a state of constant partial attention loses the capacity for the deep cognitive states that produce its best work. Distraction is not just an interruption. It is a training regime. And most people are unknowingly training themselves toward shallowness.',
      },
      {
        title: 'Boredom is the doorway',
        body: "Modern life has declared war on boredom. There is no empty moment that cannot be filled: a queue becomes a scroll, a walk becomes a podcast, a meal becomes a video. But boredom — genuine, unmediated boredom — is not wasted time. It is the brain's invitation to go deep. Research by Sandi Mann shows that boredom reliably activates the default mode network: the inner creative processor that makes novel connections, generates insight, and accesses material your conscious mind has been too busy to notice. The person who never tolerates boredom never receives its gifts.",
      },
      {
        title: 'Training the attention muscle',
        body: 'Sustained attention is trainable. The research on meditation shows measurable structural changes in the prefrontal cortex after eight weeks of daily practice — even twenty minutes a day. But meditation is not the only path. Any practice that requires sustained, undistracted engagement with a single object — a musical instrument, a craft, a difficult text, a physical discipline — trains the same capacity. The key element is not the method. It is the commitment to stay when the mind wants to leave. That staying is the rep. Every rep builds the muscle.',
      },
      {
        title: 'Designing for depth',
        body: 'Your environment performs your attention management for you before you make a single conscious choice. Phone in another room: focus extends significantly. Notifications off: average focus session length doubles. Single tab open: task completion rate rises. These are not hacks. They are structural changes that remove the friction of constant micro-decisions. Cal Newport, who coined the term deep work, argues that the capacity for sustained deep focus is becoming simultaneously rarer and more valuable — and that the people who structure their environment and schedule to protect it are positioned to produce disproportionate creative and intellectual output.',
      },
      {
        title: 'The entry ritual',
        body: 'Flow does not arrive on demand. But it can be reliably invited. Research on expert performers shows that most have rituals that consistently precede their peak states — specific sequences that signal to the nervous system: this is the time for deep work. The ritual does not cause flow. It removes the transition cost. The writer who always begins with the same coffee, the same seat, the same first sentence of a previous draft — is not superstitious. They are using learned cue-state association to shortcut twenty minutes of mental warm-up. Design your own ritual. Use it every time. Over weeks, the state begins to arrive faster.',
      },
      {
        title: 'Recovery as part of depth',
        body: 'Deep attention depletes the prefrontal cortex. Sustained flow states are followed by a period where the capacity is temporarily reduced — the brain needs to replenish. Attempting to force deep work during the depletion window produces diminishing returns and erodes the quality of the state itself. Research on deliberate practice by Anders Ericsson shows that elite performers in every domain work in focused blocks of 90 minutes or less, followed by genuine recovery — not passive scrolling, but actual rest: sleep, movement, nature, unstructured time. Protecting recovery is not weakness. It is how you protect the capacity for depth.',
      },
    ],
  },
  {
    key: 'fishing-in-the-dark',
    domain: 'Meaning & Creation',
    color: '#7B9EC9',
    segments: [
      {
        title: 'Fishing in the dark',
        body: 'There is a particular kind of despair that arrives quietly: the feeling that what you are making no longer matters. That the act you trained your whole life for — writing, playing, composing, building — can now be replicated in seconds by something that feels nothing. This is not a crisis about skill. It is a crisis about meaning. And it is one of the defining questions of this moment in history. What are you doing here? Why make anything at all?',
      },
      {
        title: 'The death of man-made art — or its transformation?',
        body: 'Artificial intelligence can now generate paintings, write novels, produce music that moves people to tears. It does not tire. It does not doubt. It never wonders whether it is enough. The question this raises is not whether human art will survive — it is what human art is *for*. Every previous technological revolution changed the form of art without ending it. Photography did not kill painting. It freed it. The printing press did not kill storytelling. It amplified it. What AI is ending is the monopoly on technical skill as a marker of value. What it cannot end is the human need to be witnessed — to share what it feels like to be alive in this specific body at this specific moment.',
      },
      {
        title: 'What music really is',
        body: 'Music has never been primarily about the notes. It has been about transmission — one nervous system reaching across the room, across time, to touch another. The composer grieving at 3am. The guitarist who found the chord that said what words could not. The song that knew you before you knew yourself. None of that lives in the output file. It lives in the relationship between the maker, the moment, and the one who receives it. AI can produce music. It cannot need to. And that need — the aching human need to be heard — is the thing being transmitted. The instrument has always been a vehicle. The real signal is the person behind it.',
      },
      {
        title: 'Discipline in the age of infinite generation',
        body: "Here is the hard truth: practice still matters, perhaps more than ever. Not because it makes you faster or more technically precise — machines will always beat humans on those axes. But because what practice actually builds is not skill. It is sensibility. The ten thousand hours of playing scales, of writing bad drafts, of failing in front of audiences — these don't just make you better at the craft. They make you more precisely yourself. They develop the capacity to distinguish what is true from what is almost true. And that distinction — between true and almost true — is the thing AI cannot access. It has never lived. It does not know the difference from the inside.",
      },
      {
        title: 'Effort as a form of love',
        body: 'When you spend a year on a song — really spend it, revising, throwing out, beginning again — you are doing something that has no equivalent in generation at speed. You are choosing this thing over everything else you could have done with that time. That choice is visible in the work. Not always consciously, not technically, but felt. There is a quality to made things that come from sustained attention and genuine struggle. The audience may not be able to name it, but they can feel the difference between something thrown at them and something given to them. The effort is the love. The love is why it matters.',
      },
      {
        title: 'What really matters — a recalibration',
        body: 'In a world where content is infinite and free, scarcity has moved. It has moved from production to presence. From output to encounter. From the file to the human being standing in front of you, choosing to be affected. The things that will matter most in the next era are the things that have always mattered most but were hidden under the technical demands of craft: genuine attention. Real vulnerability. The willingness to make something that could fail, that might embarrass you, that comes from somewhere true. These were always the source of everything worth making. Now they are the only thing left.',
      },
      {
        title: 'The guitar in the age of plugins',
        body: 'There is something specific that happens when fingers touch strings — or when any human body engages with any real instrument or medium that offers genuine resistance. The resistance is the point. Digital tools comply. Physical instruments push back. They have character, limitation, history. The scratch of the pencil. The weight of the brush. The way a guitar string bends under pressure. These are not inefficiencies to be optimised away. They are the conditions that force you to negotiate with reality — and that negotiation is what produces the human signature in the work. Keep the guitar. Keep the thing that resists. That resistance is where you find yourself.',
      },
      {
        title: 'Fishing in the dark — and staying',
        body: 'The title of this reflection is about the act of creating without knowing whether it will land, whether it matters, whether anyone will hear it. Fishing in the dark. Most of what any artist makes never reaches anyone. Most sessions end without a good take. Most songs die in the notebook. But the fishing is not separate from the finding — it is the finding. The act of sustained attention, of showing up in the dark and casting again, is the creative life. It does not need to be validated by AI metrics or streaming counts or cultural relevance. It needs to be yours. And being yours — fully, stubbornly, with everything you have — is the only form of meaning available to a human being in any era. This one included.',
      },
    ],
  },
  {
    key: 'sleep',
    domain: 'Sleep',
    color: '#5868A8',
    segments: [
      {
        title: 'Sleep is not downtime',
        body: 'Everything you do while awake depends on what happens while you sleep. The brain does not rest during sleep — it works. It consolidates the memories of the day, processes the emotions of the day, and clears the metabolic waste that accumulates during waking hours through the glymphatic system. Sleep is not recovery from life. It is the process by which life becomes integrated. Every hour you cut from it has a cost that compounds.',
      },
      {
        title: 'What one bad night actually does',
        body: 'After 17 hours without sleep, cognitive impairment is equivalent to a blood alcohol level of 0.05. After 24 hours, it matches 0.10 — above the legal driving limit in most countries. Emotional reactivity increases by up to 60% after a single night of poor sleep. Decision quality collapses. Risk assessment becomes unreliable. And critically: sleep-deprived people consistently rate their own performance as normal, even as their objective performance degrades. You cannot feel how impaired you are.',
      },
      {
        title: 'The architecture of a night',
        body: 'Sleep is not a single state — it moves through cycles of approximately 90 minutes, alternating between NREM (deep, restorative) and REM (emotionally processing, dream-rich) sleep. Deep sleep dominates the first half of the night; REM dominates the second. Cutting sleep short — even by an hour — disproportionately removes REM sleep, which is when emotional processing and creative consolidation happen. The quality of the architecture matters as much as the total hours.',
      },
      {
        title: 'Why we cannot sleep',
        body: "Cortisol and adrenaline — the stress hormones — are neurologically incompatible with sleep onset. Anxiety activates the same arousal systems that sleep requires to be quiet. Blue light from screens suppresses melatonin release by up to 50%. Alcohol — widely used as a sleep aid — blocks REM sleep and fragments the second half of the night. Most modern sleep disruption is not a sleep disorder. It is an arousal disorder: the body hasn't been given the conditions to feel safe enough to let go.",
      },
      {
        title: 'The sleep-emotion loop',
        body: 'Sleep deprivation increases emotional reactivity. Increased emotional reactivity increases anxiety and rumination. Anxiety and rumination disrupt sleep. This is one of the most common self-reinforcing loops in mental health — and one of the least recognised. Treating the sleep is often more effective than treating the anxiety directly. Research by Matthew Walker shows that the emotional memory processing that occurs during REM sleep specifically reduces the emotional charge of difficult memories — the brain essentially strips the distress from the experience overnight.',
      },
      {
        title: 'Building a sleep practice',
        body: 'The most powerful sleep interventions are not supplements — they are environmental and behavioural. Consistent sleep and wake times (including weekends) anchor the circadian rhythm. A cool room (around 18°C) supports temperature drop, which triggers sleep onset. Darkness matters: even dim light during sleep suppresses deep sleep quality. A wind-down period of 30-60 minutes without screens gives the nervous system time to downregulate. These are not tips to try. They are the conditions sleep requires. Build them like you would build any other practice.',
      },
      {
        title: 'Rest beyond sleep',
        body: 'Sleep is one form of rest, but not the only one. Dr Saundra Dalton-Smith identifies seven distinct types of rest: physical, mental, sensory, creative, emotional, social, and spiritual — the need for quiet, meaning, and connection to something larger. Many people who sleep enough hours still wake exhausted because they are depleted across these other dimensions. Recognising which kind of rest you actually need is a different skill from recognising that you are tired.',
      },
    ],
  },
  {
    key: 'nervous-system',
    domain: 'The Nervous System',
    color: '#B87060',
    segments: [
      {
        title: 'You are a nervous system first',
        body: 'Before you are a thinker, a feeler, a doer — you are a nervous system. The autonomic nervous system runs continuously beneath conscious awareness, scanning for safety and threat, regulating heart rate and breath and digestion, and shaping the emotional tone of every moment of your life. Most of what you experience as mood, energy, and capacity is not a psychological state — it is a physiological one. Understanding this does not reduce you. It gives you access to yourself at a deeper level than thought alone.',
      },
      {
        title: 'The three states',
        body: "Polyvagal theory, developed by neuroscientist Stephen Porges, describes three primary nervous system states. The ventral vagal state — safe and social — is where you are at your most connected, creative, and capable. The sympathetic state — fight or flight — mobilises energy for action against threat. The dorsal vagal state — shutdown and freeze — is an ancient survival response to overwhelming threat: conserve energy, become still, disappear. You move between these states constantly. Knowing which one you're in changes what is possible.",
      },
      {
        title: 'Neuroception — the body knows before you do',
        body: "Porges coined the term neuroception to describe the nervous system's unconscious scanning for safety and threat — happening 200 milliseconds before conscious awareness. Your body responds to a tone of voice, a facial expression, a memory, before your mind has registered anything. This is why emotional reactions can feel out of proportion to what is consciously happening: the nervous system has already made its assessment and begun its response. You are not being irrational. You are running an ancient detection system that was built for a different world.",
      },
      {
        title: 'Regulation and co-regulation',
        body: 'Regulation is the capacity to return to the ventral vagal state from activation or shutdown. It can happen alone — through breath, movement, cold water, humming, or any practice that engages the vagus nerve. But co-regulation — returning to safety through the presence of another regulated nervous system — is equally real and often more powerful. This is why a calm person in a panicking crowd changes the room. Why a regulated parent settles a dysregulated child. Your nervous system state is not private. It transmits, and it receives.',
      },
      {
        title: 'The window of tolerance',
        body: "Dan Siegel's concept of the window of tolerance describes the zone of nervous system activation within which you can think, feel, and connect simultaneously. Too little activation and you are shut down, numb, disconnected. Too much and you are overwhelmed, reactive, flooded. Within the window, you are capable of your full self. Trauma narrows the window — making it harder to stay regulated. Therapeutic work and somatic practice widen it. The aim is not a life without activation but a life where your window is wide enough to hold what comes.",
      },
      {
        title: 'Coming back to your body',
        body: 'The nervous system is regulated through the body, not through thinking about the body. Breath — specifically long, slow exhalations — directly activates the parasympathetic system. Cold exposure activates and then resolves the sympathetic system, building regulation capacity over time. Movement processes incomplete stress responses that get stuck in the body. Grounding practices — feet on floor, hands on a surface, noticing five things you can see — interrupt threat loops by returning attention to present sensory reality. The body is not a vehicle for the mind. It is the regulation system.',
      },
      {
        title: 'Building a regulated life',
        body: 'A regulated nervous system is not the absence of stress — it is the capacity to return from stress to safety, repeatedly and reliably. This is built through practice, not through understanding. Regular movement. Sufficient sleep. Genuine connection. Time in nature. Breath practices. These are not wellness habits. They are the maintenance of the physiological foundation on which everything else — your relationships, your work, your emotional life — depends. The most important investment in your capacity is not in your skills or your knowledge. It is in the system that makes use of them possible.',
      },
    ],
  },
  {
    key: 'grief',
    domain: 'Grief & Loss',
    color: '#7888A8',
    segments: [
      {
        title: 'What grief actually is',
        body: 'Grief is not a stage process with a beginning and an end. It is a non-linear adjustment to a world that has been permanently changed by loss. The stages model — denial, anger, bargaining, depression, acceptance — was never intended as a sequence to move through. It was a description of experiences that occur, in no particular order, sometimes simultaneously, sometimes not at all. Grief is as individual as the relationship that was lost. The only universal is this: it takes as long as it takes, and the attempt to rush it costs more than the grief itself.',
      },
      {
        title: 'The losses we do not name',
        body: "Death is the most visible loss, but not the most common. Ambiguous grief — grief without a body, without a funeral, without social permission to mourn — is everywhere. The end of a relationship. A job that held your identity. A health diagnosis that closes certain futures. A move away from home. The parent you needed and didn't have. The version of yourself you left behind. These losses are real. They deserve the same respect as the ones that come with flowers and condolences. Not naming them doesn't make them smaller. It makes them harder to carry.",
      },
      {
        title: 'What grief needs',
        body: 'Grief needs presence, not fixing. The most common mistake of those who love grieving people is to try to relieve the pain — to offer perspective, silver linings, comparisons to worse losses, timelines for recovery. These come from love. But they communicate that the grief is a problem to be solved rather than an experience to be honoured. What actually helps: sitting with someone without an agenda. Saying the name of what was lost. Not changing the subject when it comes up. Grief needs witnesses, not solutions.',
      },
      {
        title: 'The body of grief',
        body: 'Grief is not only an emotional experience — it is a physiological one. The immune system is suppressed during acute grief, increasing vulnerability to illness. Cortisol rises and remains elevated. Sleep is disrupted. Cognitive function — concentration, memory, decision-making — is genuinely impaired. The chest pain of grief is real: the vagus nerve, which runs through the chest and throat, is activated by social loss in the same way it is activated by physical pain. Caring for the body during loss is not a luxury. It is part of survival.',
      },
      {
        title: 'Continuing bonds',
        body: "The old model of grief prescribed letting go — detaching from the lost person or thing and moving forward. Research in the last three decades has overturned this. Grief theorist Klass and colleagues found that maintaining an internal, ongoing relationship with what was lost is not pathological — it is normal, and for many people, it is healing. You do not stop being someone's child when they die. You do not stop loving what you loved. The relationship changes form. The aim is not to let go but to carry what you loved into the life you are still living.",
      },
      {
        title: 'When grief becomes complicated',
        body: 'For some people, grief does not move — it becomes a permanent state of acute loss, sometimes called prolonged grief disorder or complicated grief. This is distinct from depression, though it can coexist with it. The person remains in a sustained state of yearning, disbelief, and bitterness that prevents re-engagement with life. This is not weakness or failure to grieve correctly. It is a recognised condition that responds to specific therapeutic intervention. If grief feels like it has not moved in many months — if it feels more like a wall than a wound — that is information worth acting on.',
      },
      {
        title: 'Grief as transformation',
        body: 'Research on post-traumatic growth — the phenomenon of positive psychological change following severe adversity — consistently finds that loss, when moved through rather than around, can produce a deepened sense of what matters, stronger relationships, greater compassion, and an expanded capacity for presence. This is not the silver lining. It is not a reason to be grateful for loss. It is a description of what becomes possible when the broken-open state is met with honesty rather than avoidance. The door grief opens is real. You do not have to step through it immediately. But it is there.',
      },
    ],
  },
  {
    key: 'conflict-repair',
    domain: 'Conflict & Repair',
    color: '#C06848',
    segments: [
      {
        title: 'Conflict is not the problem',
        body: 'Every meaningful relationship contains conflict. The research of John Gottman, who has studied couples for over four decades, shows that the presence of conflict does not predict relationship breakdown. What predicts breakdown is the absence of repair. Couples who stay together long-term are not couples who fight less — they are couples who know how to come back together after they fight. The goal is not to eliminate conflict. It is to develop the capacity to move through it without leaving the other person behind.',
      },
      {
        title: 'What happens in your body during conflict',
        body: 'When physiological flooding occurs — heart rate above approximately 100 beats per minute, adrenaline rising, breath shortening — the prefrontal cortex loses access to its full function. You literally cannot think clearly, listen accurately, or choose your words carefully when flooded. Gottman calls this diffuse physiological arousal. Trying to resolve conflict while flooded is like trying to perform surgery while running: the conditions are wrong for the precision required. The most important conflict skill is knowing when you are flooded and being able to say so without that itself becoming an attack.',
      },
      {
        title: 'The four horsemen',
        body: 'Gottman identified four communication patterns that predict relationship breakdown with over 90% accuracy. Criticism: attacking the character of the person rather than addressing a specific behaviour. Contempt: communicating superiority, disgust, or disrespect — the most corrosive of the four. Defensiveness: responding to a complaint with a counter-complaint or self-protection rather than accountability. Stonewalling: withdrawing completely — shutting down, going silent, leaving. These patterns are not evidence that a relationship is broken. They are habits that can be replaced. But they require seeing them clearly first.',
      },
      {
        title: 'Listening as a gift',
        body: 'Most people listen in order to respond. They are building their rebuttal while the other person is still speaking, waiting for a pause to insert their point, checking whether what is being said confirms what they already believe. This is normal, and it produces conversations in which no one is heard. Genuine listening requires setting aside the need to be right, the fear of being wrong, and the impulse to fix — and simply staying with the experience of the other person long enough to understand what it is actually like to be them right now. This is one of the rarest and most valued things one human can offer another.',
      },
      {
        title: 'The repair attempt',
        body: "Gottman defines a repair attempt as any gesture — verbal or physical — that de-escalates a conflict before it becomes destructive. It can be a touch on the arm. A moment of humour. An acknowledgement: 'I'm getting flooded — can we take five minutes?' A sudden admission: 'You're right about that part.' What matters is not the sophistication of the gesture but the willingness to make it — and crucially, the willingness of the partner to receive it. The ability to send and receive repair attempts is the single most important relationship skill identified in forty years of research.",
      },
      {
        title: 'Rupture and reconnect',
        body: 'Every relationship ruptures. The attachment between two people — whether romantic, familial, or friendship — is disrupted and repaired repeatedly over the course of a relationship. This is not a failure of the relationship. It is the relationship. Research by Ed Tronick using the Still Face paradigm shows that even with attentive caregivers, infants experience misattunement 70% of the time — and what builds secure attachment is not the absence of misattunement but the consistent return to connection after it. The reconnection after rupture is where intimacy actually deepens. It is where trust is built.',
      },
      {
        title: 'Having the hard conversation',
        body: "Difficult conversations fail most often not because the content is too hard but because they begin as attacks rather than disclosures. The structure that works: start with your experience, not their behaviour. 'I felt frightened when…' lands differently than 'You always…'. Name what you need rather than what you don't want. Stay specific — general indictments ('you never listen') produce defensiveness; specific incidents produce accountability. And end with a question rather than a verdict: 'What was that like for you?' The conversation is not a prosecution. It is an attempt to understand and be understood by someone who matters to you.",
      },
    ],
  },
  {
    key: 'money-anxiety',
    domain: 'Money & Anxiety',
    color: '#6A8A58',
    segments: [
      {
        title: 'Money is never just money',
        body: 'Money carries more psychological weight than almost any other domain of human life. For different people it represents security, freedom, worth, power, love, or proof of value. These meanings are not universal — they are personal, formed by childhood experiences, family narratives, cultural messages, and formative events. Until you know what money means to you specifically — what it is standing in for — you are not managing money. You are managing the feeling money represents. The financial behaviour is downstream of the psychology.',
      },
      {
        title: 'Where your money script came from',
        body: "Financial therapist Brad Klontz uses the term money scripts to describe the unconscious beliefs about money formed in childhood that drive adult financial behaviour. Common scripts: money is scarce and must be hoarded; money corrupts; rich people are greedy; I don't deserve financial security; money will solve my problems. These beliefs were formed by observing your family's relationship with money — how they talked about it, fought about it, avoided it, used it — before you had any language for what you were absorbing. Most people have never examined them. Almost all of them are running.",
      },
      {
        title: 'The scarcity mindset',
        body: 'Research by Sendhil Mullainathan and Eldar Shafir shows that experiencing scarcity — of money, time, or any resource — creates a specific cognitive state: the mind tunnels onto the scarce resource, making it temporarily more capable at managing that resource while reducing cognitive bandwidth for everything else. The cruel paradox is that scarcity impairs the kind of long-term thinking that would help you escape it. And critically, the cognitive and emotional patterns developed during genuine scarcity can persist long after the scarcity ends. Feeling financially unsafe when you are financially safe is not irrational. It is a learned response that outlasted its conditions.',
      },
      {
        title: 'Financial anxiety versus financial reality',
        body: "There is often a significant gap between the felt sense of financial threat and actual financial circumstances. Research consistently shows that wealthy people can feel financially insecure while people with objectively less feel financially adequate. The difference is not in the numbers — it is in the relationship between expectations, identity, and what money is unconsciously protecting against. Before making any financial change, it is worth asking: what am I actually afraid of? The answer is rarely 'not having enough money.' It is usually something older and more personal than that.",
      },
      {
        title: 'Avoidance as a financial strategy',
        body: "Financial anxiety most commonly produces avoidance: not checking accounts, not opening bills, not making a budget, not thinking about the future, using magical thinking ('it will somehow work out'). This is not stupidity or irresponsibility. It is a nervous system response to a perceived threat. The problem is that avoidance reliably makes anxiety worse, not better. The thing you don't look at grows in your imagination. The moment you look — even when the numbers are bad — the concrete reality is almost always more manageable than the formless dread that avoidance generates.",
      },
      {
        title: 'The enough question',
        body: "No amount of money is experienced as enough by someone who has not answered the question of what enough means to them. Without a personal definition of sufficiency, the hedonic treadmill runs indefinitely: every increase in income recalibrates upward, and the feeling of security remains just out of reach. The enough question is not a financial question. It is a values question. What kind of life am I trying to make possible? What do I actually need for that life? What am I spending on that doesn't serve it? Answering these questions honestly is more transformative than any financial strategy.",
      },
      {
        title: 'Money aligned with values',
        body: "Conscious spending is not budgeting — it is deciding in advance what you want your money to express about what you value, and then checking whether your actual spending pattern matches. Most people, when they look honestly at their bank statements, find a significant gap between what they say they value and what their spending says they value. This gap is not a moral failure. It is information. The emotional audit of a bank statement — going through it month by month and asking 'what feeling was I trying to produce with this purchase?' — is one of the most revealing exercises in personal finance.",
      },
    ],
  },
  {
    key: 'avoidance-action',
    domain: 'Avoidance & The Real Task',
    color: '#B88A58',
    segments: [
      {
        title: 'Avoidance is often protection',
        body: 'When you hide from the thing you need to do, it is rarely because you are lazy in any simple way. Avoidance is often the nervous system trying to protect you from shame, uncertainty, rejection, failure, or the feeling of not knowing where to begin. The task becomes a threat before it becomes an action.',
      },
      {
        title: 'The task becomes a fog',
        body: 'A concrete action can turn into a cloud when it stays unnamed. "Sort my life out" is too large for the body. "Open the document for ten minutes" is an action. The first move is to shrink the fog back into one visible object.',
      },
      {
        title: 'Shame makes work heavier',
        body: 'The more you punish yourself for avoiding, the more dangerous the task feels. Shame does not create clean discipline. It adds another layer to avoid. A kinder question works better: what feeling appears when I move toward this?',
      },
      {
        title: 'Fear often hides inside importance',
        body: 'Sometimes the avoided task matters because it is connected to money, love, identity, health, or a future you care about. The weight is not proof you are weak. It is proof the task touches something important. Respect the weight, then make the next step smaller.',
      },
      {
        title: 'Open the door, not the whole house',
        body: 'The useful move is not to finish everything. It is to create contact. Open the file. Put the shoes by the door. Write the first sentence badly. Send the one message. Look at the number. Contact turns dread into information.',
      },
      {
        title: 'Make the first action embarrassingly small',
        body: 'A real first step should feel almost too small to count. Two minutes. One line. One tab. One call prepared but not made. Small is not childish. Small is how the nervous system learns that approaching the task does not destroy you.',
      },
      {
        title: 'Build a return ritual',
        body: 'You will drift again. The point is not perfect focus. The point is a reliable way back: one breath, name the task, choose the next visible action, start a five-minute timer. A return ritual turns focus into a road you can find again.',
      },
      {
        title: 'The real task is becoming visible',
        body: 'Avoidance loses power when the hidden fear becomes visible and the next move becomes concrete. You do not need to become a different person first. You need one honest contact with the thing that matters, then another.',
      },
    ],
  },
  {
    key: 'bukowski-poems',
    domain: 'Bukowski: Poems From The Hard Room',
    color: '#9A7658',
    segments: [
      {
        title: 'The room before the myth',
        body: 'Bukowski works best in Colourmap if we begin with the room, not the legend. A small apartment, a table, a typewriter, bad light, rent pressure, ordinary ugliness, and the strange fact that a poem can still appear there.',
      },
      {
        title: 'Do not polish the wound',
        body: 'The power is not that the life is beautiful. The power is that the writing refuses to pretend. Bukowski gives language to boredom, lust, shame, anger, work, failure, and survival without making them clean.',
      },
      {
        title: 'The job and the soul',
        body: 'Postal work, repetition, bosses, exhaustion, and time stolen from writing are not background details. They are part of the pressure. The question is what remains alive in a person after the day has taken most of them.',
      },
      {
        title: 'The race track',
        body: 'The horse races give Bukowski a theatre of hope and damage: chance, calculation, loss, waiting, small belief, the absurd dignity of risking money on a moment. It is not only gambling. It is a picture of wanting life to break open.',
      },
      {
        title: 'The bottle is not the teacher',
        body: 'A Bukowski program should not romanticize self-destruction. The drink, the dirt, and the hard persona belong to the world, but they are not the wisdom. The wisdom is the honesty that survives underneath them.',
      },
      {
        title: 'The hidden tenderness',
        body: 'The important counterweight is tenderness. Poems like Bluebird matter because they show the protected soft thing inside the rough voice. The mask is loud because the hidden part is vulnerable.',
      },
      {
        title: 'When the crowd is false',
        body: 'Bukowski often attacks the crowd: polite cruelty, fake morality, dead language, social performance. The useful lesson is not contempt for people. It is distrust of any life where the inner voice has been traded for approval.',
      },
      {
        title: 'Risk and vocation',
        body: 'Roll the Dice and So You Want To Be A Writer? point toward vocation as a dangerous demand. Not everyone needs to live that way. But the question is useful: what part of you asks for more truth than your routine allows?',
      },
      {
        title: 'Ordinary transcendence',
        body: 'Nirvana shows another Bukowski: brief grace, a simple place, weather, a room of strangers, the sense that life can become bearable for a moment without becoming solved. That quiet lift is important.',
      },
      {
        title: 'Poems to read next',
        body: 'Read the poems themselves outside the app: Bluebird, The Laughing Heart, Roll the Dice, So You Want To Be A Writer?, Nirvana, The Genius of the Crowd, alone with everybody, and Dinosauria, We. The app should guide you toward them, not replace them.',
      },
    ],
  },
  {
    key: 'jack-london',
    domain: 'Jack London: The Wild And The Fire',
    color: '#8B6F4E',
    segments: [
      {
        title: 'The boy before the books',
        body: 'Jack London was not born inside a library. He came through poverty, work, docks, newspapers, ships, factories, and hunger before he became a famous writer. The spirit begins there: a young person looking at the world directly and refusing to stay asleep.',
      },
      {
        title: 'Oakland, sea, and survival',
        body: 'He worked hard, read hard, and threw himself into life. He sailed, chased experience, joined the Klondike gold rush, wrote with ferocious discipline, and turned rough contact with reality into story. London feels nourishing when the app remembers this: the writer is built from lived pressure, not only ideas.',
      },
      {
        title: 'The call of the wild',
        body: 'The Call of the Wild is not only about a dog going north. It is about buried strength waking up. Buck is pulled out of comfort and learns an older intelligence: body, instinct, cold, loyalty, danger, and the deep memory of the wild. The story works because the landscape is not decoration. It changes the creature.',
      },
      {
        title: 'White Fang and trust',
        body: 'White Fang moves in the other direction. A creature shaped by violence slowly learns that not every hand is danger. This is where London becomes more than survival. The real nourishment is trust returning without making the wild disappear.',
      },
      {
        title: 'The Klondike lesson',
        body: 'The Klondike gave London cold, hunger, dogs, rivers, cabins, gold fever, and men pushed beyond their self-image. This is why his best wilderness stories feel physical. They ask a clean question: what remains true when comfort stops protecting the personality?',
      },
      {
        title: 'To Build a Fire',
        body: 'In To Build a Fire, the cold is not symbolic decoration. It is real, patient, and deadly. The story teaches humility: intelligence is not only confidence. It is respect for conditions, body, weather, limits, and the old knowledge we ignore at our own risk.',
      },
      {
        title: 'Martin Eden',
        body: 'Martin Eden brings the hunger closer to the human soul: ambition, class, reading, love, fame, exhaustion, and the danger of building a life only to find the inside still starving. London understood the cost of becoming visible.',
      },
      {
        title: 'The Sea-Wolf',
        body: 'The Sea-Wolf turns survival into philosophy. Strength without tenderness becomes domination. Intelligence without compassion becomes a weapon. London keeps asking whether power makes a person larger, or only better defended.',
      },
      {
        title: 'Cities, class, and hunger',
        body: 'London also wrote about cities, poverty, labor, drink, status, and the machinery of class. The wild is not only forest. It is also the social world where people fight for dignity, money, warmth, and a place to stand.',
      },
      {
        title: 'Fragments by the fire',
        body: 'Read these as sparks, not summaries: "The proper function of man is to live, not to exist." "I would rather be ashes than dust." "The Wild still lingered in him." Each line points back to appetite, courage, and aliveness.',
      },
      {
        title: 'The reader question',
        body: 'Where has your life become too tame, and where has it become too harsh? London is not asking you to become brutal. He is asking whether your fire, discipline, body, courage, tenderness, and contact with nature are still alive.',
      },
      {
        title: 'Read beside the fire',
        body: 'Read The Call of the Wild, White Fang, To Build a Fire, Martin Eden, The Sea-Wolf, and the short credo often printed as Jack London by Himself. Then step outside, feel the air, and ask what kind of life your body still wants.',
      },
    ],
  },
  {
    key: 'jules-verne',
    domain: 'Jules Verne & The Worlds Ahead',
    color: '#6F8FA6',
    segments: [
      {
        title: 'The boy who watched ships',
        body: 'Jules Verne was born in Nantes, a port city full of ships, maps, trade, weather, and distant names. Before the impossible journeys, there was a child watching departures and learning that imagination begins where the horizon refuses to explain itself.',
      },
      {
        title: 'Science becomes adventure',
        body: 'Verne did not imagine magic floating outside reality. He imagined science becoming adventure: machines, pressure, speed, geography, engineering, electricity, oceans, caves, skies, and routes that made knowledge feel alive.',
      },
      {
        title: 'Journey to the center',
        body: 'In Journey to the Center of the Earth, descent becomes wonder. The underground world is not only darkness. It is memory, geology, danger, fossil time, and the feeling that the planet has rooms older than human certainty.',
      },
      {
        title: 'Twenty thousand leagues',
        body: 'Captain Nemo turns the ocean into freedom, grief, invention, exile, and power. The Nautilus is a miracle and a wound at once: a beautiful machine carrying a man who has escaped the world without becoming free from himself.',
      },
      {
        title: 'Around the world',
        body: 'Around the World in Eighty Days turns the planet into rhythm: trains, ships, clocks, bets, delays, borders, friendship, and surprise. The lesson is not only speed. It is that the world is wider than the schedule trying to control it.',
      },
      {
        title: 'From the Earth to the Moon',
        body: 'Verne looked upward before space travel existed. The moon journey is not prediction as much as permission: the human mind can rehearse tomorrow before technology has arrived.',
      },
      {
        title: 'The inventor and the wound',
        body: 'Verne also warns that invention is never neutral. Machines amplify the person using them. Exploration can become wonder, empire, escape, domination, repair, or loneliness. The question is not only what can be built, but what kind of soul builds it.',
      },
      {
        title: 'Maps that open the mind',
        body: 'Verne made maps feel like doors. Islands, volcanoes, submarines, balloons, trains, and stars become ways of thinking. A good map does not shrink the unknown. It gives courage to enter it.',
      },
      {
        title: 'Old paper, future signal',
        body: 'For Colourmap, Verne is a bridge between old paper and future signal. Brass instruments, notebooks, sketches, sacred geometry, engines, constellations, and solarpunk machines can all say the same thing: imagination becomes useful when it learns structure.',
      },
      {
        title: 'The reader question',
        body: 'What future are you rehearsing in private? What journey keeps returning in your mind: the sea, the moon, the underground, the city, the invention, the book, the life you have not built yet?',
      },
      {
        title: 'Build the vessel',
        body: 'A dream needs a vessel: a page, a plan, a prototype, a map, a room, a team, a first experiment. Verne does not only say imagine. He says draw the machine carefully enough that the dream can begin to move.',
      },
      {
        title: 'Read the voyages',
        body: 'Read Journey to the Center of the Earth, Twenty Thousand Leagues Under the Seas, Around the World in Eighty Days, From the Earth to the Moon, and The Mysterious Island. Then ask what kind of voyage your own work is preparing.',
      },
    ],
  },
  {
    key: 'maya-angelou',
    domain: 'Maya Angelou & The Voice That Rises',
    color: '#A86F70',
    segments: [
      {
        title: 'The voice returns',
        body: 'Maya Angelou matters because her work shows a voice returning after silence. The lesson is not performance. It is dignity: the human capacity to speak again after life has tried to reduce you.',
      },
      {
        title: 'Silence can protect',
        body: 'Silence is not always emptiness. Sometimes it is protection, listening, survival, or a room where language is rebuilding itself. A Colourmap reader should feel that recovery can begin quietly before it becomes visible.',
      },
      {
        title: 'Dignity rises',
        body: 'Angelou gives dignity a physical feeling. Not a slogan, not a pose, but a spine becoming upright again. The question is simple and powerful: what helps a person stand inside their own life?',
      },
      {
        title: 'The page becomes a room',
        body: 'Writing can make a room where pain is not denied and still does not own everything. Memory, rhythm, humor, anger, tenderness, and truth can sit together without becoming a lecture.',
      },
      {
        title: 'A voice joins voices',
        body: 'The personal voice becomes collective when it gives other people permission to recognize themselves. One story can open a door for many stories.',
      },
      {
        title: 'The reader question',
        body: 'What part of your voice has gone quiet? Not the loud public voice, necessarily. The honest one. The creative one. The one that says no, or asks for help, or names what matters.',
      },
      {
        title: 'What others may answer',
        body: 'Later, this page could let readers see gentle anonymous answers from other people: small sentences about courage, shame, art, family, grief, and the first moment they felt their voice return.',
      },
      {
        title: 'Where this can expand next',
        body: 'Page 9 could explore memoir as healing. Page 10 could connect Angelou to other poets of survival. Page 11 could ask the reader for one sentence they are ready to say. Page 12 could become a shared wall of voices.',
      },
    ],
  },
  {
    key: 'art-of-trying',
    domain: 'The Art Of Trying',
    color: '#A8794E',
    segments: [
      {
        title: 'The impossible garage',
        body: 'The room is chaos before the work begins. The bike is old, dusty, and incomplete; even the wheel is leaning against the wall. This is what many goals feel like from the inside: job, love, health, art, money, repair. Not one clean problem, but a whole room of loose parts.',
      },
      {
        title: 'The dream on the floor',
        body: 'Even in the mess, there is still a dream. It may be half-buried under tools, bills, old plans, or disappointment, but it is there: the image of movement, freedom, competence, and life opening again. Trying begins when the dream is still visible enough to call you back.',
      },
      {
        title: 'The wrench',
        body: 'Honest effort begins with contact. Not the heroic fantasy of changing everything, but one hand reaching for the real tool. A wrench, a message, a practice session, a small application, a cleaned corner, one difficult conversation. The first useful action is usually smaller than the mind wanted.',
      },
      {
        title: 'Mind versus work',
        body: 'The mind can live in an unresolved future: this will never work, nothing answers, I am too late, the door is closed. The body can still do one real thing in the present. Work does not always defeat hopelessness immediately, but it gives the nervous system evidence that movement is still possible.',
      },
      {
        title: 'The stuck bolt',
        body: 'Resistance is not always a sign to stop. Sometimes it is information. The bolt is rusted. The angle is wrong. The tool slips. Forcing demands the result now and tightens around the obstacle. Trying stays in contact long enough to learn what the obstacle is made of.',
      },
      {
        title: 'The helpless moment',
        body: 'Sometimes the honest truth is: I cannot make this work right now. The body folds, the head drops, and the room feels larger than the person inside it. This moment is not failure. It is the place where forcing finally runs out of air.',
      },
      {
        title: 'Step back',
        body: 'Stepping back is not quitting. It is changing the scale of attention. Instead of attacking one stuck part, the person sees the whole room: what is missing, what is scattered, what needs light, what can be moved, what can wait. A calmer view makes a better next attempt possible.',
      },
      {
        title: 'Order emerging',
        body: 'Before the engine works, the context works. Tools are sorted. The wheel is close. The manual is open. The floor is visible. Nothing magical has happened, but the next action now has somewhere to land. Honest effort often builds the conditions for success before success appears.',
      },
      {
        title: 'The engine turns',
        body: 'The first signal may be small: a cough, a vibration, a headlamp, a sound that says the system is alive. The work was not pointless because it did not answer immediately. It was assembling capacity, knowledge, timing, and trust inside the machine and inside the person.',
      },
      {
        title: 'The dust road',
        body: 'Success is not only getting what you wanted back from the world. It is also becoming someone who can move again. The bike is still old. The road is still dusty. But the engine runs, the body knows the work was real, and freedom begins as motion.',
      },
    ],
  },
  {
    key: 'identity-becoming',
    domain: 'Identity & Becoming',
    color: '#9070B8',
    segments: [
      {
        title: 'The self is not fixed',
        body: "The idea of a fixed, discoverable self — the 'real you' waiting to be found — is one of the most persistent and misleading ideas in Western culture. Developmental psychology and neuroscience both point in the opposite direction: the self is not a thing you find but a thing you construct, continuously, from the raw material of experience, relationship, story, and choice. This does not make you less real. It makes you more responsible. If the self is constructed rather than discovered, it can be constructed deliberately — which means who you are becoming is not fixed either.",
      },
      {
        title: 'When roles end',
        body: "Much of what people call identity is actually role identity — the sense of self built around a job title, a relationship, a function. When the role ends — retirement, redundancy, divorce, children leaving, illness — the person often experiences not just loss but disorientation: I don't know who I am without this. This is not weakness. It is the natural consequence of building identity on something external. The roles were real. The loss is real. But underneath the role is something that survived every previous version of yourself. The work is finding it again.",
      },
      {
        title: 'Values as compass',
        body: 'Most people, when asked what their values are, produce a list of aspirational virtues: honesty, kindness, courage. These may be genuine. But values are most accurately identified not from introspection but from behaviour — specifically from the choices you make under pressure, when it costs something. What did you protect when you had to choose? What did you sacrifice? What did you refuse to give up even when it would have been easier to let it go? Your actual values are written in your history. Looking at them honestly, without judgment, is the beginning of living more deliberately.',
      },
      {
        title: 'The stories we tell',
        body: 'Narrative identity — the concept developed by psychologist Dan McAdams — describes the ongoing story you construct about your life: who you are, where you came from, where you are going, and what it all means. This story is not a passive record. It actively shapes what you believe is possible, how you interpret new events, and what kind of future you can imagine. Research shows that the coherence, meaning, and redemptive quality of your life narrative predicts wellbeing, resilience, and identity clarity. The story can be rewritten — not by changing what happened, but by changing the meaning you make of it.',
      },
      {
        title: 'Becoming versus arriving',
        body: 'One of the most exhausting cultural myths is the idea of the finished self: that somewhere ahead of you is a version of yourself who has it together, who no longer struggles, who has arrived. This destination is always receding. People spend their lives chasing a state of completion that, by its nature, does not exist. The alternative is not resignation — it is the recognition that becoming is the condition of being alive, not a temporary phase before living begins. The feeling of not being there yet is not a problem to solve. It is the texture of a growing life.',
      },
      {
        title: 'Character under pressure',
        body: 'Constraint reveals. The person you are when things go well is one version of you. The person you are when the plan fails, when you are embarrassed, when someone is unkind, when you are tired and things are hard — that is a more honest version. Character, in the classical sense, is not a quality you possess — it is a pattern of response that becomes visible when circumstances make it costly to maintain. Knowing your character under pressure is not self-criticism. It is self-knowledge. And self-knowledge is the only reliable foundation for deliberate change.',
      },
      {
        title: 'The person you are becoming',
        body: 'Active identity construction — deciding who you are becoming rather than simply discovering who you are — requires three things. Clarity about what you actually value, which comes from honest reflection on your choices. Practices that make the valued qualities real in your body and your daily life, not just in your self-concept. And relationships with people who reflect back and reinforce the version of yourself you are working toward. Identity is not built in isolation. It is built in relationship — with other people, with practices, with the choices you make each day about what to give your time and attention to.',
      },
    ],
  },
  {
    key: 'parenting-patterns',
    domain: 'Parenting & Patterns',
    color: '#B87868',
    segments: [
      {
        title: 'Before you could remember',
        body: 'The earliest experiences of your life — in the first months and years, before language, before conscious memory — shaped the architecture of your nervous system. The quality of attunement you received: whether your signals of distress were met with consistency and warmth, or with inconsistency, absence, or overwhelm. These experiences did not disappear when you grew up. They became the baseline. The default expectation your nervous system carries about whether the world is safe, whether relationships are reliable, whether you are worth caring for. Most of what you call personality has roots here.',
      },
      {
        title: 'Attachment styles',
        body: "John Bowlby and Mary Ainsworth's research on attachment identified four patterns that form in early childhood based on the consistency and responsiveness of early caregiving. Secure attachment: the caregiver is reliably available, and the world is experienced as basically safe. Anxious attachment: the caregiver is inconsistent, and the strategy becomes hypervigilance — stay close, escalate signals, never quite trust. Avoidant attachment: the caregiver is consistently unavailable, and the strategy becomes self-sufficiency — need nothing, expect nothing, stay independent. Disorganised attachment: the caregiver is both the source of fear and the only available comfort — the most destabilising pattern. These styles are not fixed in adulthood. But they are active until examined.",
      },
      {
        title: 'How patterns pass down',
        body: "Research on intergenerational transmission shows that parenting patterns move through generations not primarily through genetics but through behaviour, nervous system attunement, emotional modelling, and the stories families tell about themselves. A parent who was not taught to regulate their own emotions cannot easily teach their child to regulate theirs — not because they don't want to, but because the skill was never developed. The pattern is transmitted before anyone knows it is happening. The research of Martin Teicher shows neurobiological changes in children raised in high-stress environments that can persist across generations. This is not fatalism. It is the highest argument for doing the inner work.",
      },
      {
        title: 'Breaking the cycle',
        body: "The most important finding in attachment research may be this: the single best predictor of whether a parent will transmit insecure attachment to their child is not the quality of their own childhood — it is whether they have made sense of it. Adults with difficult early histories who have processed that history with coherence, meaning, and self-compassion are just as likely to raise securely attached children as adults who had good childhoods. You do not have to have been well-parented to parent well. But you do have to know your story clearly enough that it doesn't run you from the shadows.",
      },
      {
        title: 'The good enough parent',
        body: 'Paediatrician and psychoanalyst Donald Winnicott introduced the concept of the good enough parent — not the perfect parent, but the one who is present enough, often enough, and who repairs rupture when it happens. The imperfect moments are not the problem. They are part of the process. Children build resilience not by being protected from all frustration and distress but by experiencing manageable frustration and distress in the presence of someone who remains calm. The repeated experience of rupture and repair is what builds secure attachment — not the absence of rupture. This is important because the pursuit of perfect parenting produces anxiety that makes parenting worse.',
      },
      {
        title: 'Repair with your own parents',
        body: "Most people carry grief about the parent they needed and didn't have — not necessarily due to malice or neglect, but due to the limits of what their parent was capable of. This grief is real and deserves acknowledgement. What it does not require is resolution through the actual parent: many parents cannot provide the acknowledgement, apology, or understanding their adult child needs. The work of reconciliation — or of moving forward without it — is ultimately internal. It involves grieving what was not given, understanding the context in which a parent parented, and separating your own story from the one that was handed to you.",
      },
      {
        title: 'The parent you choose to be',
        body: 'Deliberate parenting is not about implementing the right techniques. It is about developing the capacity to be present — regulated enough to stay with a dysregulated child without becoming dysregulated yourself. This means doing your own nervous system work. It means knowing your triggers — the specific things your child does that activate your own unresolved history — and having a plan for those moments. It means building emotional vocabulary in the family: naming states, validating feelings, making distress discussable rather than shameful. The most valuable thing you can give a child is a parent who is working on themselves.',
      },
    ],
  },
  ...WORLD_SYSTEM_PROGRAMS,
  {
    key: 'belonging',
    domain: 'Loneliness & Belonging',
    color: '#A07888',
    segments: [
      {
        title: 'The loneliness epidemic',
        body: 'Former US Surgeon General Vivek Murthy declared loneliness a public health epidemic in 2023. Over half of adults in many developed countries report measurable loneliness. The health impact is not metaphorical: chronic loneliness increases the risk of premature death by 26% — comparable to smoking 15 cigarettes a day. It raises cortisol, impairs sleep, suppresses immune function, and accelerates cognitive decline. We are a social species for whom isolation is physiologically dangerous. The modern design of life — remote work, urban anonymity, digital substitution for physical presence — has produced a loneliness crisis that is hiding in plain sight.',
      },
      {
        title: 'Alone is not the same as lonely',
        body: 'Solitude — chosen time alone — is restorative for many people and essential for creative work, self-reflection, and inner clarity. Loneliness is different: it is the distressing experience of a gap between the connection you have and the connection you need. You can be lonely in a crowded room, in a marriage, in a family. You can be completely alone without being lonely. The distinction matters because the solution to loneliness is not simply more social contact — it is more meaningful contact, and specifically the felt sense that you are known and that you matter to someone.',
      },
      {
        title: 'Social anxiety and the entry problem',
        body: 'For many people, the obstacle to belonging is not a lack of desire for connection but the anxiety that surrounds it. The anticipation of judgment, the fear of saying the wrong thing, the post-social review of everything said — these are features of social anxiety that make connection feel more dangerous than loneliness. The irony is that social anxiety is driven by a deep desire for connection combined with a belief that the real self is not acceptable. The work is not learning to perform better socially. It is developing enough self-acceptance that the performance anxiety gradually loses its grip.',
      },
      {
        title: 'Entering the room',
        body: "The moment of entering a new social situation is where most people's belonging failure occurs — not because of anything that happens, but because of the story told in the seconds before and after. Research by Nicholas Epley on the liking gap shows that people consistently underestimate how much they are liked after a first conversation. The inner critic narrates a reality that is significantly more negative than the actual experience of the other person. The practical knowledge: people are warmer than you expect. Curiosity is more disarming than any social skill. A genuine question is worth twenty clever things to say.",
      },
      {
        title: 'Genuine belonging',
        body: 'Belonging is not the same as fitting in. Researcher Brené Brown makes this distinction clearly: fitting in requires you to change yourself to match the group. Belonging requires the group to accept you as you are. Fitting in is the opposite of belonging — it is the performance of acceptability at the cost of authenticity. Genuine belonging — the felt experience of being welcomed as you actually are, not the version you present — requires two things: the courage to show something true about yourself, and the presence of people who can meet it without flinching. Both are rarer than they should be and more available than most people believe.',
      },
      {
        title: 'The kindness practice',
        body: "Research consistently shows that acts of kindness toward others improve the wellbeing of the giver as reliably as they improve the wellbeing of the receiver — sometimes more so. Kindness activates the same neural reward circuits as receiving kindness. It reduces cortisol and increases oxytocin. And it directly addresses one of the core mechanisms of loneliness: the sense of isolation and irrelevance that comes from feeling you don't matter. When you act with genuine kindness — not performative generosity but the small, specific acts of attention that cost you something — you are simultaneously creating belonging for someone else and reminding yourself that you have something to give.",
      },
      {
        title: 'Spaces that restore',
        body: 'Not all environments support belonging equally. Third places — spaces that are neither home nor work, where people gather without a transactional agenda — are one of the most reliable sources of low-stakes social connection: the coffee shop where the owner knows your name, the gym class with the same people every Tuesday, the community garden. These spaces build what Robert Putnam calls social capital — the accumulated trust and goodwill between people who know each other even slightly. They are disappearing from modern life, and their disappearance has a measurable cost. Finding your third place — or helping create one — is one of the most practical investments in belonging available.',
      },
    ],
  },
  {
    key: 'math-trainer',
    domain: 'Math Trainer',
    color: '#6B9B4E',
    segments: [
      {
        title: 'Four operations, seven levels each',
        body: 'Addition, subtraction, multiplication, division. Each operation runs from single-digit basics up through three- and four-number challenges. Subtraction goes below zero. Multiplication covers squares and 2-digit × 2-digit. Division includes remainders and clean decimal results. Each level opens with the tips and worked examples that explain the move, then a ten-question practice round with an optional timer.',
      },
    ],
  },
];

export function getProgramByKey(key: string): Program | undefined {
  return PROGRAMS.find((p) => p.key === key);
}
