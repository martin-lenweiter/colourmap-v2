const economicSegments = [
  {
    title: 'Part 1 - The village ledger',
    body: 'Economics begins before economists. A village has grain, tools, debt, favors, land, hunger, memory, and trust. The first question is simple: how do people share scarce things without tearing the group apart?',
  },
  {
    title: 'Markets before theory',
    body: 'Old markets were not abstract machines. They were noisy human places: bargaining, reputation, local knowledge, family duty, religious rules, and seasonal risk. Price was only one signal among many.',
  },
  {
    title: 'Mercantilist mood',
    body: 'In the age of ships, empires, and locked treasure chests, wealth looked like metal, colonies, ports, and control. The world economy felt like a contest for hoards, routes, and monopolies.',
  },
  {
    title: 'The invisible hand appears',
    body: 'Adam Smith helped people see that coordination can emerge without a central commander. When exchange is fair, specialization and trust can turn private work into public benefit.',
  },
  {
    title: 'Gains from trade',
    body: 'Trade is powerful when each side gives what it can produce well and receives what it needs. The deeper lesson is not greed. It is interdependence: a table becomes richer when different skills meet.',
  },
  {
    title: 'Division of labor',
    body: 'Specialization can multiply output, but it can also narrow the person doing the work. The factory lesson is double: productivity rises, and the human being must not disappear inside the task.',
  },
  {
    title: 'Industrial smoke',
    body: 'The industrial age changed the rhythm of life. Time became a clock, work became a wage, cities swelled, and wealth arrived beside pollution, crowding, injury, and new political anger.',
  },
  {
    title: 'The first question returns',
    body: 'Part 1 ends with the old question made larger. Markets can coordinate. Factories can multiply. But who gains, who pays, who is protected, and who gets a voice in the system?',
  },
  {
    title: 'Part 2 - Marx and the machine',
    body: 'Marx looked at the factory and saw a conflict hidden inside production. Workers create value, owners control the machine, and the social order begins to feel natural even when it was built by history.',
  },
  {
    title: 'Class as a lens',
    body: 'Class is not only income. It is a position inside the system: who owns, who rents, who sells time, who decides, who absorbs risk, and who can wait.',
  },
  {
    title: 'Capital accumulates',
    body: 'Capital is not just money in a box. It is a force that can buy tools, land, labor, media, influence, and time. Accumulation changes what choices are available to different people.',
  },
  {
    title: 'Schumpeter and the storm',
    body: 'Schumpeter saw capitalism as creative destruction. New inventions open doors, old industries fall, fortunes move, and society has to absorb the shock of permanent change.',
  },
  {
    title: 'Polanyi and the embedded market',
    body: 'Karl Polanyi warned that markets do not float above society. They are embedded in law, land, family, work, culture, and nature. When everything becomes a commodity, society pushes back.',
  },
  {
    title: 'The welfare compromise',
    body: 'Industrial capitalism forced a political invention: pensions, public health, labor rights, education, and social insurance. The state became a shock absorber for risks no family could carry alone.',
  },
  {
    title: 'Keynes and the broken engine',
    body: 'Keynes saw that economies can get stuck below their potential. Fear can become a self-fulfilling loop: people spend less, firms hire less, and the machine slows because everyone waits.',
  },
  {
    title: 'The policy lever',
    body: 'The Keynesian lesson is practical: when private demand collapses, public action can restart movement. The debate is never only technical. It is about timing, trust, inflation, debt, and political courage.',
  },
  {
    title: 'Part 3 - Hayek and the map',
    body: 'Hayek warned that no planner can hold all local knowledge. Prices can act like signals from millions of places at once. The useful warning is humility: centralized control can miss what people know on the ground.',
  },
  {
    title: 'Friedman and the rules',
    body: 'The late twentieth century trusted markets, monetary rules, deregulation, and competition more than state planning. The mood was leaner, faster, and more suspicious of big public systems.',
  },
  {
    title: 'Globalization opens the gates',
    body: 'Containers, trade agreements, finance, and digital coordination stretched production across the planet. A shirt, a phone, or a car became a map of ports, factories, minerals, software, and wages.',
  },
  {
    title: 'The global value chain',
    body: 'Global value chains made many goods cheaper and lifted parts of the world through trade. They also made dependence harder to see: one broken port, war, pandemic, or tariff can shake the whole table.',
  },
  {
    title: 'Development and dignity',
    body: 'Amartya Sen reframed development as capability: what people are actually able to be and do. Income matters, but health, education, safety, freedom, and dignity are also economic facts.',
  },
  {
    title: 'Ostrom and the commons',
    body: 'Elinor Ostrom showed that communities can govern shared resources without only state control or private ownership. The commons needs rules, trust, monitoring, repair, and local voice.',
  },
  {
    title: 'Inequality returns',
    body: 'Piketty brought attention back to accumulation over generations. When returns to capital outrun broad income growth, wealth can concentrate and democracy begins to feel tilted.',
  },
  {
    title: 'The market is a design',
    body: 'Part 3 ends by breaking the illusion. Markets are not nature. They are designed through law, infrastructure, money, rights, data, borders, and power. Design can be revised.',
  },
  {
    title: 'Part 4 - Doughnut and mission',
    body: 'Kate Raworth drew the economy between a social foundation and an ecological ceiling. The goal is not endless expansion in the abstract. It is a safe and just space for life.',
  },
  {
    title: 'Mazzucato and public purpose',
    body: 'Mariana Mazzucato argues that states do not only fix market failures. They can shape missions: vaccines, clean energy, public research, and bold direction when private incentives are too narrow.',
  },
  {
    title: 'Tariffs and fractures',
    body: 'The current global economy is moving through trade tensions, tariffs, security concerns, industrial policy, and distrust. Globalization is not ending cleanly. It is being renegotiated under stress.',
  },
  {
    title: 'Climate enters the balance sheet',
    body: 'Carbon, water, biodiversity, heat, and resilience are no longer outside the economy. They are conditions of production. The old balance sheet forgot the living systems holding it up.',
  },
  {
    title: 'AI as new capital',
    body: 'AI may become a new layer of productive capital: models, data, compute, workflows, and automation. The question is who owns the tools, who gains productivity, and who gets displaced or amplified.',
  },
  {
    title: 'The future economy',
    body: 'The future will likely mix markets, states, commons, platforms, missions, and local resilience. No single theory is enough. The skill is seeing which tool fits which problem.',
  },
  {
    title: 'What the user can learn',
    body: 'Learn basic tradeoffs, incentives, history, budgets, systems thinking, and emotional money patterns. Economics becomes less scary when you see it as a set of human designs, not an untouchable machine.',
  },
  {
    title: 'Systems are still moving',
    body: 'The final lesson is liberating: the economy visible in one lifetime is not permanent. Humans built it through conflict, imagination, crisis, and repair. Humans will keep revising it.',
  },
];

const ecologySegments = [
  {
    title: 'Part 1 - The living ground',
    body: 'Nature is not scenery around the economy. It is the ground system: soil, water, forests, pollinators, oceans, climate, microbes, and time. Every human plan sits inside it.',
  },
  {
    title: 'Plants as intelligence',
    body: 'Plants read light, water, gravity, chemicals, seasons, stress, and neighbors. Their intelligence is not human-like, but it is real: sensing, adapting, signaling, storing, and cooperating.',
  },
  {
    title: 'Soil is a city',
    body: 'Healthy soil is alive with roots, fungi, bacteria, insects, minerals, air, and water. A handful of soil can be more like a city than a pile of dirt.',
  },
  {
    title: 'Fungal networks',
    body: 'Fungal threads connect roots, move nutrients, and help forests communicate stress and support. The image is powerful because it shows intelligence as relationship, not only command.',
  },
  {
    title: 'The forest breathes',
    body: 'Forests cool air, store carbon, hold water, protect soil, shelter species, and regulate local climates. A forest is infrastructure made of life.',
  },
  {
    title: 'Rivers remember',
    body: 'Rivers carry more than water. They carry sediment, fish routes, flood cycles, farms, cities, waste, ritual, and history. When a river is blocked or poisoned, a whole pattern changes.',
  },
  {
    title: 'Oceans as planet lung',
    body: 'Oceans absorb heat, move weather, feed people, hold life, and connect continents. Their health is not separate from human health. It is the blue engine of the planet.',
  },
  {
    title: 'The first lesson',
    body: 'Part 1 ends with a shift of perception. The planet is not a warehouse of resources. It is a living network of relationships that makes human civilization possible.',
  },
  {
    title: 'Part 2 - The great acceleration',
    body: 'Human pressure grew sharply with industrial energy, population, consumption, chemicals, roads, plastics, fishing, and land conversion. The curve became steep faster than culture could understand.',
  },
  {
    title: 'Climate heat',
    body: 'Climate change is the atmosphere holding more heat because greenhouse gases changed the balance. The result is not one problem but a pressure system: heat, drought, floods, storms, fires, and sea rise.',
  },
  {
    title: 'Biodiversity loss',
    body: 'Biodiversity loss means the living fabric becomes thinner. Species disappear, habitats fragment, and ecosystems lose redundancy. A simpler system can break more suddenly.',
  },
  {
    title: 'Land conversion',
    body: 'Forests, wetlands, grasslands, and mangroves are often converted into fields, roads, mines, and cities. Some conversion feeds people. Some destroys the conditions that feed people later.',
  },
  {
    title: 'Pollution and plastics',
    body: 'Pollution is misplaced chemistry. Fertilizer, smoke, heavy metals, microplastics, and waste move through bodies and waters. The modern world leaks into the living world.',
  },
  {
    title: 'The extinction warning',
    body: 'The biodiversity warning is not only sadness about animals. It is a warning about food webs, medicines, pollination, culture, water, and resilience. A planet with fewer forms of life has fewer ways to recover.',
  },
  {
    title: 'Climate justice',
    body: 'The people least responsible for emissions often face the harshest impacts. Ecology is therefore also politics: vulnerability, adaptation, finance, migration, food, and dignity.',
  },
  {
    title: 'The pressure map',
    body: 'Part 2 ends with a map of linked pressures. Climate, biodiversity, water, soil, oceans, and inequality are not separate folders. They are one living crisis seen from different doors.',
  },
  {
    title: 'Part 3 - Restoration begins',
    body: 'Hope begins when damage becomes specific. A forest can be restored, a river can be reconnected, a wetland can return, a farm can rebuild soil, and a city can make room for shade and life.',
  },
  {
    title: 'Regenerative agriculture',
    body: 'Regenerative practices try to rebuild soil, cover, roots, biodiversity, and water cycles. The point is not a magic label. The point is farming that strengthens the ground it depends on.',
  },
  {
    title: 'Rewilding',
    body: 'Rewilding lets ecological processes return: grazing, predation, seed movement, floods, succession, and corridors. It asks humans to control less and support the conditions for life to organize itself.',
  },
  {
    title: 'Indigenous stewardship',
    body: 'Many Indigenous communities have protected ecosystems through knowledge, restraint, fire practices, seasonal respect, and kinship with land. Conservation must not erase the people who know the place.',
  },
  {
    title: 'Protected and connected',
    body: 'Protected areas matter, but islands of protection are not enough. Life needs corridors, migration routes, buffer zones, and working landscapes that are less hostile to movement.',
  },
  {
    title: 'Cities as habitats',
    body: 'Cities can become hotter, lonelier machines, or they can become habitats: trees, water, gardens, roofs, transit, shade, birds, insects, and public spaces that cool both body and mind.',
  },
  {
    title: 'Energy transition',
    body: 'Clean energy is not only a climate chart. It is a new landscape of grids, storage, minerals, jobs, local conflicts, and choices about how quickly society can change its metabolism.',
  },
  {
    title: 'Data that helps',
    body: 'Satellites, sensors, community science, biodiversity maps, and climate models can reveal what is changing. Data matters when it helps people act with humility and precision.',
  },
  {
    title: 'Part 4 - A culture of repair',
    body: 'The ecological future is not only technology. It is a culture of repair: reduce pressure, restore systems, protect what works, and design human life so it gives back more often.',
  },
  {
    title: 'Circular materials',
    body: 'A circular economy tries to keep materials in use and out of waste streams. Repair, reuse, redesign, sharing, and better chemistry are not side hobbies. They are design intelligence.',
  },
  {
    title: 'Food systems',
    body: 'Food connects soil, water, energy, culture, labor, health, trade, animals, and waste. A better food system is not one switch. It is many better relationships from field to plate.',
  },
  {
    title: 'Ocean repair',
    body: 'Marine protected areas, better fishing rules, mangrove restoration, less plastic, and cleaner shipping can give oceans more room. The sea can recover when pressure is lowered.',
  },
  {
    title: 'Resilience and adaptation',
    body: 'Some change is already locked in. Adaptation means preparing honestly: shade, water, coastal planning, health systems, early warnings, and social trust before crisis arrives.',
  },
  {
    title: 'The emotional task',
    body: 'Ecology can create grief, fear, guilt, and numbness. The useful move is not denial or panic. It is grounded love: choose one place, one habit, one skill, one community, one repair.',
  },
  {
    title: 'What to learn',
    body: 'Learn systems thinking, climate basics, local ecology, food literacy, repair skills, civic action, and how your work touches the living world. Ecological intelligence is practical intelligence.',
  },
  {
    title: 'The living future',
    body: 'The final image is not paradise. It is participation. Humans can become a species that understands it lives inside a larger living intelligence and designs accordingly.',
  },
];

const futureSegments = [
  {
    title: 'Part 1 - The old map cracks',
    body: 'The future does not arrive as one clean invention. It arrives as overlapping transitions: AI, climate, work, energy, trade, demography, politics, cities, education, and trust all moving at once.',
  },
  {
    title: 'Globalization under stress',
    body: 'Globalization made the world deeply connected, but connection now meets security fears, tariffs, sanctions, supply chain shocks, and political anger. The question is not open or closed. It is what kind of connection survives.',
  },
  {
    title: 'Multipolar mood',
    body: 'Power is no longer organized around one simple center. The world feels more multipolar: competing blocs, regional alliances, strategic minerals, currencies, data, ports, and standards.',
  },
  {
    title: 'AI enters the room',
    body: 'AI changes the cost of thinking, drafting, coding, designing, translating, searching, and coordinating. It is not magic. It is a new layer of tools that changes who can do what.',
  },
  {
    title: 'Work becomes fluid',
    body: 'Tasks will shift before jobs fully disappear. Some work is automated, some is amplified, some becomes more human, and some becomes more precarious. The unit of change is often the task.',
  },
  {
    title: 'The trust problem',
    body: 'Deepfakes, bots, synthetic media, persuasion systems, and information overload make trust more valuable. The future will need verification, reputation, slower judgment, and better shared institutions.',
  },
  {
    title: 'Climate as background pressure',
    body: 'Climate will be part of every future map: insurance, food, migration, infrastructure, energy, health, conflict, and investment. It becomes less like a separate topic and more like weather inside history.',
  },
  {
    title: 'The first skill',
    body: 'Part 1 ends with orientation. The first future skill is not prediction. It is seeing systems together without freezing: what is changing, what is stable, what matters now?',
  },
  {
    title: 'Part 2 - The transition decade',
    body: 'The medium-term future may feel messy: old institutions still operate, new tools spread unevenly, and people experience both opportunity and loss. Transition is confusing because two eras overlap.',
  },
  {
    title: 'AI copilots everywhere',
    body: 'Many people will work beside AI assistants for writing, analysis, planning, design, code, customer support, tutoring, and administration. The advantage goes to people who learn how to direct tools clearly.',
  },
  {
    title: 'Skills unbundle',
    body: 'Credentials will still matter, but portfolios, judgment, taste, communication, domain knowledge, and the ability to learn fast may matter more. The future rewards people who can recombine skills.',
  },
  {
    title: 'Education changes shape',
    body: 'Education may become more personal, visual, conversational, and project-based. The danger is shallow automation. The opportunity is better access to explanation, practice, and feedback.',
  },
  {
    title: 'Politics of displacement',
    body: 'When technology changes work, politics follows. People need income, dignity, bargaining power, retraining, social insurance, and a story that does not treat them as obsolete.',
  },
  {
    title: 'Industrial policy returns',
    body: 'States are again shaping strategic sectors: chips, batteries, clean energy, defense, food, medicine, and infrastructure. The market is being steered because security and resilience returned to the center.',
  },
  {
    title: 'Cities adapt',
    body: 'The city of transition adds shade, sensors, transit, repair spaces, remote-work patterns, local energy, flood planning, and community cooling. The future is physical, not only digital.',
  },
  {
    title: 'Personal adaptation',
    body: 'The practical move is to build a learning loop: choose one domain, use AI to practice, make visible work, improve judgment, protect attention, and stay connected to real people.',
  },
  {
    title: 'Part 3 - Long horizon possibilities',
    body: 'Long-term futures are plural. The same technologies can produce surveillance, monopoly, ecological repair, better medicine, creative abundance, or deeper inequality depending on design and power.',
  },
  {
    title: 'Abundance and bottlenecks',
    body: 'Some things may become abundant: information, tutoring, code, design drafts, simulations. Other things stay scarce: trust, land, water, minerals, care, attention, legitimacy, and healthy ecosystems.',
  },
  {
    title: 'New institutions',
    body: 'New tools need new institutions: data rights, AI auditing, public-interest infrastructure, global standards, worker voice, and ways to distribute productivity gains without breaking dignity.',
  },
  {
    title: 'Global public goods',
    body: 'Climate stability, pandemic readiness, ocean health, AI safety, financial stability, and peace are global public goods. No country can hold them alone, but every country can damage them.',
  },
  {
    title: 'Solarpunk realism',
    body: 'Hopeful futures should not look like plastic utopia. A serious solarpunk world is repair, shade, public beauty, local resilience, clean energy, ecological knowledge, and technology serving life.',
  },
  {
    title: 'AI and human meaning',
    body: 'If machines produce more outputs, humans must protect meaning: care, taste, ethics, courage, embodiment, humor, friendship, grief, presence, and responsibility. The human layer becomes more important, not less.',
  },
  {
    title: 'Democracy under pressure',
    body: 'Democracy will need better information systems, civic education, local trust, transparent institutions, and ways to handle speed without collapsing into outrage.',
  },
  {
    title: 'The long choice',
    body: 'Part 3 ends with a fork. Technology can centralize power or distribute capability. Globalization can fracture into fear or mature into resilient cooperation. Design decides direction.',
  },
  {
    title: 'Part 4 - What to build in yourself',
    body: 'The personal question is not how to predict everything. It is how to become more adaptable, useful, grounded, and hard to manipulate while the world changes.',
  },
  {
    title: 'Attention as sovereignty',
    body: 'Attention will be contested territory. Learn to notice manipulation, slow down before reacting, choose information diets, and protect deep work. A person who owns attention owns part of their future.',
  },
  {
    title: 'AI literacy',
    body: 'AI literacy means knowing what tools can do, where they fail, how to verify, how to prompt, how to combine them with domain knowledge, and when not to use them.',
  },
  {
    title: 'Economic resilience',
    body: 'Build skills that travel: writing, systems thinking, numeracy, emotional intelligence, project delivery, technical fluency, care, repair, and the ability to learn in public.',
  },
  {
    title: 'Civic imagination',
    body: 'The future is not only personal optimization. Learn how decisions are made, how budgets work, how local institutions function, and how groups coordinate without losing trust.',
  },
  {
    title: 'Ecological belonging',
    body: 'Adaptation is easier when you belong to a place. Know your water, heat, food, trees, transport, risks, neighbors, and repair networks. The future is local as well as global.',
  },
  {
    title: 'A hopeful discipline',
    body: 'Hope is not guessing that things will be fine. It is disciplined participation: learning, building, repairing, voting, teaching, creating, and refusing to let fear be the only architect.',
  },
  {
    title: 'The future is a practice',
    body: 'The final page returns to Colourmap. Map attention, learn the systems, choose the next useful action, and keep your humanity warm while the world changes shape.',
  },
];

export const WORLD_SYSTEM_PROGRAMS = [
  {
    key: 'economic-systems',
    domain: 'Economic Systems In Motion',
    color: '#9C7A4D',
    segments: economicSegments,
  },
  {
    key: 'planetary-ecology',
    domain: 'Planetary Ecology & Living Intelligence',
    color: '#6F8A58',
    segments: ecologySegments,
  },
  {
    key: 'future-transitions',
    domain: 'Future Transitions: AI, Work & Globalisation',
    color: '#6F8FA6',
    segments: futureSegments,
  },
];
