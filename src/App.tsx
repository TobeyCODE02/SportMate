import React, { useEffect, useMemo, useRef, useState } from 'react';

type Theme = 'light' | 'dark';
type Impact = 'low' | 'medium' | 'high';
type Setting = 'indoor' | 'outdoor' | 'either';
type Budget = 'low' | 'medium' | 'high';
type Equipment = 'none' | 'basic' | 'special';
type Skill = 'beginner' | 'intermediate';
type Vibe = 'relax' | 'fun' | 'social' | 'challenge' | 'creative' | 'nature' | 'water' | 'rhythm' | 'mindful';
type Injury = 'none' | 'knee' | 'back' | 'shoulder' | 'cardio';
type Goal = 'relax' | 'fun' | 'social' | 'challenge' | 'creative';
type Tab = 'discover' | 'quiz' | 'favorites' | 'profile';

type Sport = {
  id: string;
  name: string;
  icon: string;
  imageQuery: string;
  description: string;
  impact: Impact;
  setting: Setting;
  team: boolean;
  nature: boolean;
  water: boolean;
  skill: Skill;
  equipment: Equipment;
  cost: Budget;
  benefits: string[];
  vibes: Vibe[];
};

const clsx = (...p: Array<string | false | null | undefined>) => p.filter(Boolean).join(' ');
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const uid = (() => {
  let i = 0;
  return () => `${Date.now().toString(36)}_${(i++).toString(36)}`;
})();

const ls = {
  get<T>(k: string, fb: T): T {
    try {
      const raw = localStorage.getItem(k);
      return raw ? (JSON.parse(raw) as T) : fb;
    } catch {
      return fb;
    }
  },
  set(k: string, v: unknown) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {
      // ignore
    }
  },
};

const unsplash = (q: string) => `https://source.unsplash.com/featured/1200x800?${encodeURIComponent(q.trim())}`;

const SPORTS: Sport[] = [
  { id: 'yoga', name: 'Yoga', icon: '🧘‍♀️', imageQuery: 'yoga calm studio', description: 'Ruhig, beweglich, ohne Leistungsdruck.', impact: 'low', setting: 'either', team: false, nature: true, water: false, skill: 'beginner', equipment: 'basic', cost: 'low', benefits: ['Rückenfreundlich', 'Knie-schonend'], vibes: ['relax', 'mindful'] },
  { id: 'pilates', name: 'Pilates', icon: '🤸‍♀️', imageQuery: 'pilates mat', description: 'Stabilität & Körpergefühl.', impact: 'low', setting: 'indoor', team: false, nature: false, water: false, skill: 'beginner', equipment: 'basic', cost: 'low', benefits: ['Rückenfreundlich'], vibes: ['mindful', 'relax'] },
  { id: 'walking', name: 'Spazieren', icon: '🚶', imageQuery: 'walking city evening', description: 'Einfach losgehen.', impact: 'low', setting: 'outdoor', team: false, nature: true, water: false, skill: 'beginner', equipment: 'none', cost: 'low', benefits: ['Knie-schonend'], vibes: ['relax', 'nature'] },
  { id: 'hiking', name: 'Wandern', icon: '🥾', imageQuery: 'hiking mountains', description: 'Natur, Aussicht, Routine.', impact: 'medium', setting: 'outdoor', team: false, nature: true, water: false, skill: 'beginner', equipment: 'basic', cost: 'low', benefits: ['Knie-schonend'], vibes: ['nature', 'relax'] },
  { id: 'swimming', name: 'Schwimmen', icon: '🏊‍♀️', imageQuery: 'swimming pool', description: 'Ganzkörper, sehr schonend.', impact: 'low', setting: 'indoor', team: false, nature: false, water: true, skill: 'beginner', equipment: 'basic', cost: 'low', benefits: ['Knie-schonend', 'Rückenfreundlich'], vibes: ['water', 'relax'] },
  { id: 'dance', name: 'Tanzen', icon: '💃', imageQuery: 'dance studio', description: 'Musik fühlen, bewegen, Spaß haben.', impact: 'medium', setting: 'indoor', team: true, nature: false, water: false, skill: 'beginner', equipment: 'none', cost: 'medium', benefits: ['Rückenfreundlich'], vibes: ['fun', 'social', 'rhythm'] },
  { id: 'football', name: 'Fussball', icon: '⚽', imageQuery: 'soccer field', description: 'Teamgefühl, draußen, Klassiker.', impact: 'high', setting: 'outdoor', team: true, nature: true, water: false, skill: 'beginner', equipment: 'basic', cost: 'low', benefits: [], vibes: ['social', 'fun', 'challenge', 'nature'] },
  { id: 'basketball', name: 'Basketball', icon: '🏀', imageQuery: 'basketball court', description: 'Schnell, technisch, team-lastig.', impact: 'high', setting: 'indoor', team: true, nature: false, water: false, skill: 'beginner', equipment: 'basic', cost: 'low', benefits: [], vibes: ['social', 'challenge'] },
  { id: 'tennis', name: 'Tennis', icon: '🎾', imageQuery: 'tennis court', description: 'Technik, Rhythmus.', impact: 'medium', setting: 'either', team: false, nature: true, water: false, skill: 'beginner', equipment: 'basic', cost: 'medium', benefits: [], vibes: ['challenge', 'fun'] },
  { id: 'cycling', name: 'Radfahren', icon: '🚴‍♀️', imageQuery: 'cycling road', description: 'Cruisen oder Touren.', impact: 'medium', setting: 'either', team: false, nature: true, water: false, skill: 'beginner', equipment: 'basic', cost: 'medium', benefits: ['Knie-schonend'], vibes: ['nature', 'relax', 'fun'] },
  { id: 'gym', name: 'Gym', icon: '🏋️‍♂️', imageQuery: 'gym training', description: 'Technik, Routine, Fortschritt.', impact: 'medium', setting: 'indoor', team: false, nature: false, water: false, skill: 'beginner', equipment: 'special', cost: 'medium', benefits: ['Rückenfreundlich'], vibes: ['challenge'] },
  { id: 'hiit', name: 'HIIT', icon: '⚡', imageQuery: 'hiit workout', description: 'Kurz & intensiv.', impact: 'high', setting: 'indoor', team: false, nature: false, water: false, skill: 'intermediate', equipment: 'none', cost: 'low', benefits: [], vibes: ['challenge'] },
  { id: 'bouldering', name: 'Bouldern', icon: '🧗', imageQuery: 'bouldering gym', description: 'Puzzle für den Körper.', impact: 'high', setting: 'indoor', team: true, nature: false, water: false, skill: 'beginner', equipment: 'special', cost: 'medium', benefits: [], vibes: ['challenge', 'fun', 'social'] },
  { id: 'ski', name: 'Skifahren', icon: '🎿', imageQuery: 'skiing alpine', description: 'Winter-Adventure.', impact: 'high', setting: 'outdoor', team: true, nature: true, water: false, skill: 'intermediate', equipment: 'special', cost: 'high', benefits: [], vibes: ['nature', 'fun', 'challenge'] },
  { id: 'bowling', name: 'Bowling', icon: '🎳', imageQuery: 'bowling alley', description: 'Social und sofort Spaß.', impact: 'low', setting: 'indoor', team: true, nature: false, water: false, skill: 'beginner', equipment: 'none', cost: 'medium', benefits: [], vibes: ['social', 'fun'] },
  { id: 'golf', name: 'Golf', icon: '⛳', imageQuery: 'golf course', description: 'Ruhig, technisch, draußen.', impact: 'low', setting: 'outdoor', team: false, nature: true, water: false, skill: 'beginner', equipment: 'special', cost: 'high', benefits: ['Rückenfreundlich'], vibes: ['nature', 'relax'] },
  ...([
    ['tabletennis', 'Tischtennis', '🏓', 'table tennis', 'Reaktion, Spaß, sehr social.', 'low', 'either', true, false, false, 'beginner', 'basic', 'low', ['Knie-schonend'], ['fun', 'social']],
    ['salsa', 'Salsa', '🕺', 'salsa dancing', 'Partner, Rhythmus, Community.', 'medium', 'indoor', true, false, false, 'beginner', 'none', 'medium', [], ['social', 'fun', 'rhythm']],
    ['badminton', 'Badminton', '🏸', 'badminton', 'Schnell, spielerisch.', 'medium', 'indoor', true, false, false, 'beginner', 'basic', 'low', [], ['fun', 'social']],
    ['squash', 'Squash', '🏓', 'squash sport', 'Kurz, intensiv.', 'high', 'indoor', false, false, false, 'intermediate', 'basic', 'medium', [], ['challenge']],
    ['padel', 'Padel', '🎾', 'padel tennis', 'Einsteigerfreundlich.', 'medium', 'either', true, true, false, 'beginner', 'basic', 'medium', [], ['fun', 'social']],
    ['running', 'Joggen', '🏃‍♀️', 'running park', 'Einfacher Einstieg.', 'high', 'outdoor', false, true, false, 'beginner', 'basic', 'low', [], ['challenge', 'nature']],
    ['rowing', 'Rudern', '🚣‍♂️', 'rowing river', 'Rhythmus, Wasser, Team.', 'medium', 'outdoor', true, true, true, 'beginner', 'special', 'high', ['Rückenfreundlich'], ['water', 'nature', 'social']],
    ['sup', 'Stand Up Paddling', '🏄', 'stand up paddle lake', 'Balance, Wasser, Natur.', 'medium', 'outdoor', false, true, true, 'beginner', 'special', 'high', ['Rückenfreundlich'], ['water', 'nature', 'relax', 'fun']],
    ['kayak', 'Kajak', '🛶', 'kayaking river', 'Draußen, Rhythmus, Wasser.', 'medium', 'outdoor', true, true, true, 'beginner', 'special', 'high', [], ['water', 'nature', 'social']],
    ['sailing', 'Segeln', '⛵', 'sailing boat', 'Wind, Technik, Ruhe.', 'low', 'outdoor', true, true, true, 'beginner', 'special', 'high', [], ['water', 'relax', 'social']],
    ['diving', 'Tauchen', '🤿', 'scuba diving', 'Andere Welt, Fokus.', 'medium', 'outdoor', true, true, true, 'beginner', 'special', 'high', [], ['water', 'relax']],
    ['zumba', 'Zumba', '🎶', 'zumba class', 'Party-Feeling.', 'medium', 'indoor', true, false, false, 'beginner', 'none', 'medium', [], ['fun', 'social', 'rhythm']],
    ['volleyball', 'Volleyball', '🏐', 'volleyball indoor', 'Team, Timing.', 'high', 'indoor', true, false, false, 'beginner', 'basic', 'low', [], ['social', 'fun']],
    ['beachvolleyball', 'Beachvolleyball', '🏐', 'beach volleyball sunset', 'Sommer-Hobby.', 'high', 'outdoor', true, true, false, 'beginner', 'basic', 'low', [], ['fun', 'social', 'nature']],
    ['handball', 'Handball', '🤾', 'handball indoor', 'Team + Tempo.', 'high', 'indoor', true, false, false, 'beginner', 'basic', 'low', [], ['social', 'challenge']],
    ['mtb', 'Mountainbike', '🚵‍♂️', 'mountain biking trail', 'Natur + Abenteuer.', 'high', 'outdoor', true, true, false, 'intermediate', 'special', 'high', [], ['nature', 'challenge', 'fun']],
    ['boxing', 'Boxen', '🥊', 'boxing gloves', 'Technik, Fokus.', 'high', 'indoor', false, false, false, 'beginner', 'basic', 'medium', [], ['challenge', 'fun']],
    ['judo', 'Judo', '🥋', 'judo dojo', 'Respekt, Technik.', 'high', 'indoor', true, false, false, 'beginner', 'basic', 'medium', [], ['social', 'challenge']],
    ['karate', 'Karate', '🥋', 'karate training', 'Struktur, Routine.', 'medium', 'indoor', true, false, false, 'beginner', 'basic', 'medium', [], ['challenge']],
    ['meditation', 'Meditation', '🧠', 'meditation minimal', 'Runterkommen, Fokus.', 'low', 'either', false, false, false, 'beginner', 'none', 'low', ['Rückenfreundlich'], ['mindful', 'relax']],
    ['tai_chi', 'Tai Chi', '☯️', 'tai chi park morning', 'Langsam, fließend.', 'low', 'either', false, true, false, 'beginner', 'none', 'low', ['Rückenfreundlich', 'Knie-schonend'], ['mindful', 'relax']],
    ['qigong', 'Qigong', '🌿', 'qigong outdoors', 'Atem + Bewegung.', 'low', 'either', false, true, false, 'beginner', 'none', 'low', ['Rückenfreundlich'], ['mindful', 'relax']],
    ['nordic_walking', 'Nordic Walking', '🚶‍♂️', 'nordic walking forest', 'Gelenkfreundlich.', 'low', 'outdoor', false, true, false, 'beginner', 'basic', 'low', ['Knie-schonend', 'Rückenfreundlich'], ['nature', 'relax']],
    ['photowalk', 'Foto-Spaziergang', '📷', 'street photography', 'Kreativ draußen.', 'low', 'outdoor', false, true, false, 'beginner', 'basic', 'low', [], ['creative', 'relax', 'nature']],
    ['aquajogging', 'Aquajogging', '🤽‍♀️', 'aqua jogging', 'Ausdauer im Wasser.', 'low', 'indoor', false, false, true, 'beginner', 'basic', 'low', ['Knie-schonend'], ['water', 'relax']],
    ['billiard', 'Billard', '🎱', 'billiards pool', 'Ruhig, taktisch.', 'low', 'indoor', true, false, false, 'beginner', 'none', 'low', ['Rückenfreundlich'], ['social', 'relax']],
    ['darts', 'Darts', '🎯', 'darts board', 'Schnell besser werden.', 'low', 'indoor', true, false, false, 'beginner', 'basic', 'low', ['Rückenfreundlich'], ['social', 'fun']],
    ['archery', 'Bogenschießen', '🏹', 'archery', 'Fokus, Ruhe.', 'low', 'either', false, true, false, 'beginner', 'special', 'medium', ['Rückenfreundlich'], ['mindful', 'relax']],
    ['inline', 'Inline Skating', '🛼', 'inline skating', 'Cruisen, Musik.', 'high', 'outdoor', false, true, false, 'beginner', 'special', 'medium', [], ['fun', 'nature']],
    ['skateboard', 'Skateboard', '🛹', 'skateboard park', 'Style, Tricks.', 'high', 'outdoor', true, false, false, 'intermediate', 'special', 'medium', [], ['fun', 'challenge', 'social']],
    ['ultimate_frisbee', 'Ultimate Frisbee', '🥏', 'ultimate frisbee', 'Draußen, Teamplay.', 'high', 'outdoor', true, true, false, 'beginner', 'basic', 'low', [], ['social', 'fun', 'nature']],
    ['fencing', 'Fechten', '🤺', 'fencing', 'Technik & Fokus.', 'medium', 'indoor', true, false, false, 'beginner', 'special', 'high', [], ['challenge']],
    ['frisbee_golf', 'Disc Golf', '🥏', 'disc golf', 'Draußen, easy Einstieg.', 'low', 'outdoor', true, true, false, 'beginner', 'basic', 'low', ['Knie-schonend'], ['fun', 'nature', 'social']],
  ] as Array<[string, string, string, string, string, Impact, Setting, boolean, boolean, boolean, Skill, Equipment, Budget, string[], Vibe[]]>).map((r) => {
    const [id, name, icon, imageQuery, description, impact, setting, team, nature, water, skill, equipment, cost, benefits, vibes] = r;
    return { id, name, icon, imageQuery, description, impact, setting, team, nature, water, skill, equipment, cost, benefits, vibes };
  }),
];

const SPORT_BY_ID = new Map<string, Sport>();
for (const s of SPORTS) if (!SPORT_BY_ID.has(s.id)) SPORT_BY_ID.set(s.id, s);

type RiskFlags = { kneeStress: boolean; backStress: boolean; shoulderStress: boolean; highCardio: boolean };
const sportRiskFlags = (s: Sport): RiskFlags => {
  const id = s.id.toLowerCase();
  const highImpact = s.impact === 'high';
  return {
    kneeStress: highImpact && /football|basketball|handball|hiit|running|ski|snowboard|parkour|mtb|bouldering|climbing/i.test(id),
    backStress: /rowing|gym|boxing|judo|karate|mtb|climbing|bouldering/i.test(id) || (s.impact === 'high' && s.equipment === 'special'),
    shoulderStress: /rowing|swimming|kayak|sailing|climbing|bouldering|boxing/i.test(id) || (s.water && s.impact !== 'low'),
    highCardio: /hiit|running|football|basketball|handball|mtb|spinning/i.test(id) || (highImpact && s.vibes.includes('challenge')),
  };
};

type HealthFilters = {
  injury: Injury;
  kneeSafe: boolean;
  backSafe: boolean;
  shoulderSafe: boolean;
  cardioEasy: boolean;
  avoidHighImpact: boolean;
  preferLowImpact: boolean;
  waterOnly: boolean;
  natureOnly: boolean;
};

const defaultHealthFilters: HealthFilters = { injury: 'none', kneeSafe: false, backSafe: false, shoulderSafe: false, cardioEasy: false, avoidHighImpact: false, preferLowImpact: false, waterOnly: false, natureOnly: false };

const applyHealthFilters = (items: Sport[], h: HealthFilters) => items.filter((s) => {
  const f = sportRiskFlags(s);
  if (h.waterOnly && !s.water) return false;
  if (h.natureOnly && !s.nature && s.setting !== 'outdoor') return false;
  if ((h.avoidHighImpact || h.preferLowImpact) && s.impact === 'high') return false;
  if (h.kneeSafe && f.kneeStress && !s.benefits.includes('Knie-schonend')) return false;
  if (h.backSafe && f.backStress && !s.benefits.includes('Rückenfreundlich')) return false;
  if (h.shoulderSafe && f.shoulderStress) return false;
  if (h.cardioEasy && f.highCardio) return false;
  if (h.injury === 'knee' && f.kneeStress && !s.benefits.includes('Knie-schonend')) return false;
  if (h.injury === 'back' && f.backStress && !s.benefits.includes('Rückenfreundlich')) return false;
  if (h.injury === 'shoulder' && f.shoulderStress) return false;
  if (h.injury === 'cardio' && f.highCardio) return false;
  return true;
});

type Answers = {
  goal?: Goal;
  prio?: Array<'nature' | 'water' | 'social' | 'relax' | 'fun' | 'challenge' | 'creative'>;
  setting?: Setting;
  team?: 'team' | 'solo';
  impact?: Impact;
  time?: 'short' | 'medium' | 'long';
  budget?: Budget;
  equipment?: Equipment;
  injury?: Injury;
  vibe?: Vibe;
};

const scoreSport = (a: Answers, s: Sport) => {
  let score = 0;
  const prio = a.prio || [];
  const flags = sportRiskFlags(s);
  if (a.goal === 'relax') { if (s.impact === 'low') score += 5; if (s.vibes.includes('relax') || s.vibes.includes('mindful')) score += 4; }
  if (a.goal === 'fun') { if (s.vibes.includes('fun')) score += 5; }
  if (a.goal === 'social') { if (s.team) score += 6; if (s.vibes.includes('social')) score += 3; }
  if (a.goal === 'challenge') { if (s.vibes.includes('challenge')) score += 6; }
  if (a.goal === 'creative') { if (s.vibes.includes('creative')) score += 7; }
  if (a.setting) score += s.setting === a.setting || s.setting === 'either' ? 3 : -2;
  if (a.team) score += (a.team === 'team') === s.team ? 3 : -2;
  if (a.impact) score += s.impact === a.impact ? 3 : a.impact === 'low' && s.impact === 'high' ? -3 : 0;
  if (prio.includes('nature') && (s.nature || s.setting === 'outdoor')) score += 3;
  if (prio.includes('water') && s.water) score += 4;
  if (prio.includes('social') && s.team) score += 3;
  if (prio.includes('relax') && (s.vibes.includes('relax') || s.impact === 'low')) score += 3;
  if (prio.includes('fun') && s.vibes.includes('fun')) score += 3;
  if (prio.includes('challenge') && s.vibes.includes('challenge')) score += 3;
  if (prio.includes('creative') && s.vibes.includes('creative')) score += 4;
  if (a.budget) {
    const map: Record<Budget, number> = { low: 0, medium: 1, high: 2 };
    const diff = map[s.cost] - map[a.budget];
    score += diff > 0 ? -diff * 3 : 1;
  }
  if (a.equipment === 'none' && s.equipment === 'special') score -= 4;
  if (a.injury === 'knee') score += s.benefits.includes('Knie-schonend') ? 4 : flags.kneeStress ? -6 : 1;
  if (a.injury === 'back') score += s.benefits.includes('Rückenfreundlich') ? 4 : flags.backStress ? -5 : 1;
  if (a.injury === 'shoulder') score += flags.shoulderStress ? -4 : 1;
  if (a.injury === 'cardio') score += flags.highCardio ? -4 : 1;
  if (a.vibe && s.vibes.includes(a.vibe)) score += 2;
  return clamp(score, 0, 999);
};

function GlobalStyles({ theme }: { theme: Theme }) {
  const isDark = theme === 'dark';
  return <style>{`body{margin:0;font-family:Inter,system-ui,sans-serif;background:${isDark ? '#0b0c10' : '#f4f5f7'};color:${isDark ? '#f2f4f8' : '#0f172a'}}*{box-sizing:border-box}.page{min-height:100vh;background:radial-gradient(900px 500px at 15% -10%,rgba(47,107,255,.2),transparent 62%),radial-gradient(900px 520px at 85% -14%,rgba(20,184,166,.12),transparent 62%)}.shell{max-width:1080px;margin:0 auto;padding:18px 14px 110px}.card{background:${isDark ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.9)'};border:1px solid ${isDark ? 'rgba(255,255,255,.12)' : 'rgba(15,23,42,.1)'};border-radius:24px;box-shadow:0 10px 28px rgba(15,23,42,.12)}.cardInner{padding:16px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}@media(max-width:680px){.grid{grid-template-columns:1fr}}.btn{border:none;border-radius:14px;padding:10px 14px;font-weight:800;cursor:pointer}.btnPrimary{background:linear-gradient(180deg,#2f6bff,#2457d9);color:#fff}.btnGhost{background:${isDark ? 'rgba(255,255,255,.1)' : '#fff'};border:1px solid ${isDark ? 'rgba(255,255,255,.12)' : 'rgba(15,23,42,.12)'};color:inherit}.chip{border:1px solid ${isDark ? 'rgba(255,255,255,.12)' : 'rgba(15,23,42,.12)'};background:${isDark ? 'rgba(255,255,255,.06)' : '#fff'};border-radius:999px;padding:8px 12px;font-weight:800;cursor:pointer}.chipOn{background:rgba(47,107,255,.14)}.top{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}.tile{border-radius:22px;overflow:hidden;background:${isDark ? 'rgba(255,255,255,.08)' : '#fff'};border:1px solid ${isDark ? 'rgba(255,255,255,.12)' : 'rgba(15,23,42,.08)'}}.thumb{height:140px;position:relative;background:linear-gradient(135deg,rgba(47,107,255,.15),rgba(20,184,166,.12))}.thumbBg{position:absolute;inset:0;background-size:cover;background-position:center}.overlay{position:absolute;left:8px;right:8px;bottom:8px;padding:8px 10px;border-radius:16px;background:rgba(0,0,0,.35);color:#fff;display:flex;justify-content:space-between;align-items:flex-end;gap:8px}.sportBtn{width:100%;padding:0;border:none;background:transparent;cursor:pointer;text-align:left}.tabbar{position:fixed;left:50%;bottom:10px;transform:translateX(-50%);width:min(560px,calc(100% - 16px));display:flex;gap:6px;padding:10px;border-radius:20px;background:${isDark ? 'rgba(20,20,24,.85)' : 'rgba(255,255,255,.92)'};backdrop-filter:blur(10px);border:1px solid ${isDark ? 'rgba(255,255,255,.12)' : 'rgba(15,23,42,.1)'}}.tab{flex:1;border:none;background:transparent;padding:8px;border-radius:14px;color:${isDark ? 'rgba(242,244,248,.65)' : 'rgba(15,23,42,.65)'};font-weight:800;cursor:pointer}.tabOn{background:rgba(47,107,255,.16);color:inherit}.chips{display:flex;flex-wrap:wrap;gap:8px}.row{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}.muted{font-size:12px;opacity:.75}.input,.select{border:1px solid ${isDark ? 'rgba(255,255,255,.15)' : 'rgba(15,23,42,.15)'};background:${isDark ? 'rgba(255,255,255,.06)' : '#fff'};border-radius:14px;padding:10px 12px;color:inherit;font-weight:700}.input{flex:1;min-width:220px}`}</style>;
}

const tagForSport = (s: Sport) => (s.water ? 'Wasser' : s.team ? 'Social' : s.vibes.includes('relax') ? 'Ruhig' : s.vibes.includes('challenge') ? 'Action' : 'Hobby');

function App() {
  const [theme, setTheme] = useState<Theme>(() => ls.get('sportmate_theme', 'dark'));
  const [tab, setTab] = useState<Tab>('discover');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [setting, setSetting] = useState<Setting | 'any'>('any');
  const [team, setTeam] = useState<'any' | 'team' | 'solo'>('any');
  const [impact, setImpact] = useState<Impact | 'any'>('any');
  const [vibe, setVibe] = useState<Vibe | 'any'>('any');
  const [health, setHealth] = useState<HealthFilters>(defaultHealthFilters);
  const [favIds, setFavIds] = useState<string[]>(() => ls.get('sportmate_favs', []));
  const [toasts, setToasts] = useState<Array<{ id: string; title: string }>>([]);
  const timer = useRef<number | null>(null);

  useEffect(() => ls.set('sportmate_theme', theme), [theme]);
  useEffect(() => ls.set('sportmate_favs', favIds), [favIds]);

  const favorites = useMemo(() => SPORTS.filter((s) => favIds.includes(s.id)), [favIds]);
  const activeSport = detailId ? SPORT_BY_ID.get(detailId) ?? null : null;

  const visibleSports = useMemo(() => {
    let items = SPORTS;
    const q = query.trim().toLowerCase();
    if (q) items = items.filter((s) => `${s.name} ${s.description} ${s.vibes.join(' ')} ${s.benefits.join(' ')}`.toLowerCase().includes(q));
    if (setting !== 'any') items = items.filter((s) => s.setting === setting || s.setting === 'either' || setting === 'either');
    if (team !== 'any') items = items.filter((s) => (team === 'team' ? s.team : !s.team));
    if (impact !== 'any') items = items.filter((s) => s.impact === impact);
    if (vibe !== 'any') items = items.filter((s) => s.vibes.includes(vibe));
    items = applyHealthFilters(items, health);
    return items.length ? items : applyHealthFilters(SPORTS, { ...defaultHealthFilters, injury: health.injury });
  }, [health, impact, query, setting, team, vibe]);

  const showToast = (title: string) => {
    setToasts((t) => [{ id: uid(), title }, ...t].slice(0, 2));
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToasts([]), 1800);
  };

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  const toggleFav = (id: string) => setFavIds((prev) => {
    const set = new Set(prev);
    if (set.has(id)) {
      set.delete(id);
      showToast('Favorit entfernt');
    } else {
      set.add(id);
      showToast('Favorit gespeichert');
    }
    return [...set];
  });

  const quizResults = useMemo(() => {
    if (tab !== 'quiz') return [];
    const sample: Answers = { goal: 'relax', prio: ['nature', 'relax'], setting: 'outdoor', impact: 'low', team: 'solo', injury: health.injury };
    return SPORTS.map((s) => ({ ...s, _score: scoreSport(sample, s) })).sort((a, b) => b._score - a._score).slice(0, 18);
  }, [health.injury, tab]);

  return (
    <div className="page">
      <GlobalStyles theme={theme} />
      <div className="shell">
        <div className="top">
          <div>
            <div style={{ fontWeight: 900, fontSize: 20 }}>SportMate</div>
            <div className="muted">Hobby-Finder · modern · klar</div>
          </div>
          <button className="btn btnGhost" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? '🌙' : '☀️'}</button>
        </div>

        {toasts.map((t) => <div key={t.id} className="card" style={{ marginBottom: 8 }}><div className="cardInner">✨ {t.title}</div></div>)}

        {activeSport ? (
          <div className="card"><div className="cardInner">
            <div className="row"><h2 style={{ margin: 0 }}>{activeSport.icon} {activeSport.name}</h2><button className="btn btnGhost" onClick={() => toggleFav(activeSport.id)}>{favIds.includes(activeSport.id) ? '❤️ Entfernen' : '🤍 Favorit'}</button></div>
            <p className="muted">{activeSport.description}</p>
            <div className="chips">{activeSport.benefits.map((b) => <span className="chip" key={b}>{b}</span>)}</div>
            <div style={{ marginTop: 12 }}><button className="btn btnPrimary" onClick={() => setDetailId(null)}>← Zurück</button></div>
          </div></div>
        ) : tab === 'discover' ? (
          <>
            <div className="card"><div className="cardInner">
              <div className="row"><div><div style={{ fontWeight: 900 }}>Entdecken</div><div className="muted">{visibleSports.length} von {SPORTS.length}</div></div>
                <button className="btn btnGhost" onClick={() => { setQuery(''); setSetting('any'); setTeam('any'); setImpact('any'); setVibe('any'); setHealth(defaultHealthFilters); }}>Reset</button>
              </div>
              <div style={{ marginTop: 10 }} className="row">
                <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Suche nach Sportart..." />
                <select className="select" value={setting} onChange={(e) => setSetting(e.target.value as Setting | 'any')}><option value="any">Ort egal</option><option value="indoor">Indoor</option><option value="outdoor">Outdoor</option><option value="either">Beides</option></select>
                <select className="select" value={team} onChange={(e) => setTeam(e.target.value as 'any' | 'team' | 'solo')}><option value="any">Modus egal</option><option value="team">Team</option><option value="solo">Solo</option></select>
              </div>
              <div style={{ marginTop: 8 }} className="chips">
                <button className={clsx('chip', health.kneeSafe && 'chipOn')} onClick={() => setHealth({ ...health, kneeSafe: !health.kneeSafe })}>🦵 Knie</button>
                <button className={clsx('chip', health.backSafe && 'chipOn')} onClick={() => setHealth({ ...health, backSafe: !health.backSafe })}>🧍 Rücken</button>
                <button className={clsx('chip', health.shoulderSafe && 'chipOn')} onClick={() => setHealth({ ...health, shoulderSafe: !health.shoulderSafe })}>💪 Schulter</button>
                <button className={clsx('chip', health.cardioEasy && 'chipOn')} onClick={() => setHealth({ ...health, cardioEasy: !health.cardioEasy })}>❤️ Cardio easy</button>
              </div>
            </div></div>

            <div className="grid" style={{ marginTop: 12 }}>
              {visibleSports.map((s) => (
                <button className="sportBtn" key={s.id} onClick={() => setDetailId(s.id)}>
                  <div className="tile">
                    <div className="thumb"><div className="thumbBg" style={{ backgroundImage: `url(${unsplash(s.imageQuery)})` }} /><div className="overlay"><div><div style={{ fontWeight: 900 }}>{s.name}</div><div style={{ fontSize: 12, opacity: .9 }}>{s.team ? 'Team' : 'Solo'} · {s.setting}</div></div><div style={{ fontSize: 12 }}>{tagForSport(s)}</div></div></div>
                    <div className="cardInner"><div className="muted">{s.description}</div></div>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : tab === 'quiz' ? (
          <>
            <div className="card"><div className="cardInner"><div style={{ fontWeight: 900 }}>Quiz-Ergebnisse (Demo)</div><div className="muted">Top Vorschläge für „ruhig + natur“</div></div></div>
            <div className="grid" style={{ marginTop: 12 }}>
              {quizResults.map((s) => <button key={s.id} className="sportBtn" onClick={() => setDetailId(s.id)}><div className="tile"><div className="thumb"><div className="thumbBg" style={{ backgroundImage: `url(${unsplash(s.imageQuery)})` }} /><div className="overlay"><div style={{ fontWeight: 900 }}>{s.name}</div><div>⭐ {clamp(Math.round((s._score / (quizResults[0]?._score || 1)) * 5), 1, 5)}</div></div></div></div></button>)}
            </div>
          </>
        ) : tab === 'favorites' ? (
          <div className="grid">{favorites.map((s) => <button key={s.id} className="sportBtn" onClick={() => setDetailId(s.id)}><div className="tile"><div className="thumb"><div className="thumbBg" style={{ backgroundImage: `url(${unsplash(s.imageQuery)})` }} /><div className="overlay"><div style={{ fontWeight: 900 }}>{s.name}</div><button className="btn btnGhost" onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleFav(s.id); }}>✕</button></div></div></div></button>)}</div>
        ) : (
          <div className="card"><div className="cardInner"><div style={{ fontWeight: 900 }}>Profil</div><p className="muted">SportMate ist ein Hobby-Finder.</p><button className="btn btnGhost" onClick={() => { setFavIds([]); setHealth(defaultHealthFilters); }}>Alles zurücksetzen</button></div></div>
        )}
      </div>
      <div className="tabbar">
        {(['discover', 'quiz', 'favorites', 'profile'] as Tab[]).map((t) => <button key={t} className={clsx('tab', tab === t && 'tabOn')} onClick={() => { setTab(t); setDetailId(null); }}>{t}</button>)}
      </div>
    </div>
  );
}

export default App;
