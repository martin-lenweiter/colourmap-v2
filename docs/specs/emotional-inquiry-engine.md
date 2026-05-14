# Emotional Inquiry Engine

## Purpose

The Emotional Inquiry Engine is a future AI-guided layer for the Emotions area of Colourmap.

It is not an Education feature and not a fixed quiz. It belongs to the overall emotional check-in system: the place where a user is trying to understand what is happening inside them now.

Core purpose:

```text
current state
-> AI-guided inquiry
-> clearer emotional pattern
-> possible need
-> next step
-> saved insight
```

The goal is not diagnosis. The goal is orientation.

## Product Placement

This should live in the Emotions / Check-in / Day flow, alongside or near:

- feeling check-in
- mood word
- emotion circles
- body / presence / process sliders
- current objective
- daily state tools

Possible entry labels:

- Understand this feeling
- Help me read this state
- What is here?
- State Guide
- Emotion Guide

Education should not become the diagnostic or inquiry tool. Education can be interactive and reflective, but the adaptive AI inquiry belongs in Emotions.

## Education Relationship

Education can ask reflective prompts such as:

- What did this page make you notice?
- Where does this show up in your life?
- What sentence do you want to remember?
- What small thing can you carry into today?

Those are reflection prompts.

The Emotional Inquiry Engine is different. It is used when the user actively wants help understanding a current state.

Education can receive recommendations from the Inquiry Engine:

```text
If inquiry result suggests crowded mind -> recommend Room to Breathe
If inquiry result suggests self-criticism -> recommend Mind & Self-Talk
If inquiry result suggests relationship tension -> recommend Relational Intelligence
If inquiry result suggests low agency -> recommend Agency & Power
```

## Why AI, Not Fixed Questions

A fixed question tree can be useful for simple flows, but emotions are fluid and contextual.

AI can:

- adapt to the user's own language
- ask one good question at a time
- notice ambiguity or contradiction
- avoid over-questioning
- summarize a state in the user's words
- connect current state to past patterns when the user allows it
- suggest a grounded next step
- recommend a relevant education program or tool

The system should feel like a careful guide, not a form.

## Interaction Shape

The user may begin with free text:

```text
I feel tense and weird but I don't know why.
```

The AI asks one question:

```text
Does it feel more connected to your body, a situation, another person, or the future?
```

Then adapts based on the answer.

Good inquiry questions:

- Where do you feel it in the body?
- Does it feel heavy, tight, restless, sharp, numb, warm, or open?
- What story is attached to it?
- Is it asking for rest, clarity, courage, connection, protection, or movement?
- What would be one small respectful next step?

Bad inquiry behavior:

- diagnosing the user
- pretending certainty
- asking too many questions at once
- giving generic advice too early
- pushing positivity
- treating difficult emotion as a problem to remove

## Data Model

The conversation can be flexible, but the output should become structured data.

```ts
type EmotionalInquiryResult = {
  stateLabel: string;
  bodySignal?: string;
  emotionalTone?: string;
  possibleNeed?: string;
  repeatingStory?: string;
  suggestedNextStep?: string;
  recommendedProgramKeys?: string[];
  confidence: 'low' | 'medium' | 'high';
  userConfirmed: boolean;
  createdAt: string;
};
```

Optional fuller structure:

```ts
type EmotionalInquirySession = {
  id: string;
  startedAt: string;
  completedAt?: string;
  userInput: string;
  turns: {
    role: 'user' | 'assistant';
    content: string;
  }[];
  result?: EmotionalInquiryResult;
  saveRawConversation: boolean;
  consentForAnonymousPatternUse: boolean;
};
```

Default privacy principle:

- save structured outputs by default
- do not save raw vulnerable conversation unless the user explicitly chooses to
- anonymous collective pattern use must be opt-in

## Collective Pattern Potential

With consent, structured inquiry results can help Colourmap understand useful collective patterns:

```text
Many users feel tired but not sad.
Many users report ambition mixed with shame.
Many users need rest but choose productivity.
Many users feel relationship tension as body tightness.
Many users benefit from one-next-step prompts.
```

This can become a practical map of collective consciousness:

- what people are feeling
- what needs are unmet
- what loops repeat
- what tools actually help
- what education programs are most useful for which states

This should remain respectful, aggregated, anonymous, and opt-in.

## Connections To Existing Features

The Inquiry Engine can connect to:

- `colourmap:mood-word`
- `colourmap:check-ins`
- `colourmap:presence-idx`
- `colourmap:body-idx`
- `colourmap:process-idx`
- `colourmap:current-objective`
- future account-backed emotional history
- Education recommendations
- Room to Breathe as first recommended comic for crowded mind states

## MVP Direction

Do not build a full AI inquiry UI immediately.

First steps:

1. Add the spec and data model.
2. Keep Education reflection prompts separate.
3. Later add a small Emotions entry point: "Understand this feeling".
4. Start with one AI prompt that asks one question at a time.
5. Save a structured result only after the user confirms it.
6. Recommend one relevant Education program.

The MVP should feel quiet, precise, and user-led.

## Easy Tools To Build First

These are the first practical tools that can grow out of the Emotional Inquiry Engine.

They should begin simple, then later become AI-guided rather than fixed flows.

### 1. State Finder

Question:

```text
What is this feeling made of?
```

Purpose:

- helps identify the current emotion or state
- separates body signal, emotional tone, thought, and context
- useful when the user says "I feel weird", "I don't know", or "I feel too much"

Output:

```ts
{
  stateLabel: string;
  bodySignal?: string;
  emotionalTone?: string;
  confidence: 'low' | 'medium' | 'high';
}
```

### 2. Need Finder

Question:

```text
What do I actually need?
```

Possible need categories:

- rest
- clarity
- movement
- connection
- courage
- forgiveness
- structure
- protection
- expression
- support

Purpose:

- turns emotion into a practical need
- avoids jumping straight to productivity or advice
- helps the user respect what the state is asking for

### 3. Next Step Finder

Question:

```text
What is the smallest useful action?
```

Purpose:

- converts insight into one realistic next step
- should be tiny, grounded, and possible now
- useful for agency, overwhelm, and low-energy states

Examples:

- drink water
- open the window
- write one sentence
- send one message
- rest for ten minutes
- choose one thing to postpone

### 4. Loop Finder

Question:

```text
What story is repeating?
```

Purpose:

- detects recurring self-talk loops
- helps the user name the story without becoming it
- can connect to the Self-Talk education program

Examples:

- "I am behind"
- "I always mess things up"
- "I need to prove myself"
- "Nothing will change"
- "If I rest, I will fall apart"

### 5. Collective Pulse

Question:

```text
What are people feeling, needing, and finding helpful today?
```

Purpose:

- anonymous aggregate layer
- shows collective patterns without exposing individuals
- helps users feel less alone
- helps Colourmap learn which tools actually improve people's lives

Possible output:

```text
Today many users are reporting low energy + future pressure.
The most helpful next steps today are rest permission, one-next-step prompts, and connection.
```

This should only use opted-in, aggregated, anonymous data.

## System Prompt Direction

Future AI guide prompt should include:

```text
You are an emotional inquiry guide inside Colourmap.
You do not diagnose.
You ask one short question at a time.
You help the user notice state, body signal, story, need, and next step.
You summarize tentatively and ask for confirmation.
You avoid generic positivity.
You keep the user in control.
You output structured JSON only when asked by the app.
```

## Strategic Role

This engine is one of the key long-term bridges in Colourmap:

```text
personal emotion
-> structured insight
-> useful tool
-> education recommendation
-> personal pattern
-> anonymous collective pattern
```

Education inspires and teaches.

The Emotional Inquiry Engine helps the user understand what is happening now.
