// Utility function to generate a random date within a given year range
export const generateRandomDate = ({ minYear, maxYear }: { minYear: number; maxYear: number }): Date => {
  const minDate = new Date(minYear, 0, 1); // January 1st of minYear
  const maxDate = new Date(maxYear, 11, 31, 23, 59, 59, 999); // December 31st of maxYear

  const minTime = minDate.getTime();
  const maxTime = maxDate.getTime();

  if (minTime > maxTime) {
    throw new Error('minYear cannot be after maxYear');
  }

  const randomTime = minTime + Math.random() * (maxTime - minTime);
  return new Date(randomTime);
};
