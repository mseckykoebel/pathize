import {Illness} from '@pathize/db';

export type IllnessList = {
  id: number;
  name: Illness;
  displayName: string;
};

export const illnesses: IllnessList[] = [
  {
    id: 1,
    name: 'Long COVID',
    displayName: 'Long COVID',
  },
  {
    id: 2,
    name: 'ME/CFS',
    displayName: 'ME/CFS',
  },
  {
    id: 3,
    name: 'POTS',
    displayName: 'POTS',
  },
  {
    id: 4,
    name: 'None/Prefer not to say',
    displayName: 'None/Prefer not to say',
  },
];
