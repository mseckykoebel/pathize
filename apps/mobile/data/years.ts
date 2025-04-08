import {ItemWithId} from '../components/sheets';

const generateYears = (): ItemWithId<{id: string; year: string}>[] => {
  const startYear = 2023;
  const endYear = 1970;
  let id = 0;

  const years: ItemWithId<{id: string; year: string}>[] = [];

  for (let year = startYear; year >= endYear; year--, id++) {
    years.push({
      id: id.toString(),
      year: year.toString(),
    });
  }

  return years;
};

const years = generateYears();
export {years};
