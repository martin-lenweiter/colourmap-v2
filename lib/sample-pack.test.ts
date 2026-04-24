// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';

import { freqToMidi, noteNameToMidi } from './sample-pack';

describe('noteNameToMidi', () => {
  it('converts A4 to MIDI 69', () => {
    expect(noteNameToMidi('A4')).toBe(69);
  });

  it('converts C4 (middle C) to MIDI 60', () => {
    expect(noteNameToMidi('C4')).toBe(60);
  });

  it('converts A0 (lowest piano note) to MIDI 21', () => {
    expect(noteNameToMidi('A0')).toBe(21);
  });

  it('converts C8 (highest piano note) to MIDI 108', () => {
    expect(noteNameToMidi('C8')).toBe(108);
  });

  it('handles tonejs "s" sharp notation — Cs4 == C#4 == 61', () => {
    expect(noteNameToMidi('Cs4')).toBe(61);
  });

  it('handles # sharp notation — F#5 == 78', () => {
    expect(noteNameToMidi('F#5')).toBe(78);
  });

  it('handles flats — Eb4 == 63', () => {
    expect(noteNameToMidi('Eb4')).toBe(63);
  });

  it('falls back to middle C for malformed names', () => {
    expect(noteNameToMidi('not-a-note')).toBe(60);
  });
});

describe('freqToMidi', () => {
  it('converts 440 Hz (A4) to MIDI 69', () => {
    expect(freqToMidi(440)).toBe(69);
  });

  it('converts 261.63 Hz (C4) to ~MIDI 60', () => {
    expect(freqToMidi(261.63)).toBeCloseTo(60, 1);
  });

  it('converts 880 Hz (A5) to MIDI 81 (one octave up)', () => {
    expect(freqToMidi(880)).toBe(81);
  });
});
