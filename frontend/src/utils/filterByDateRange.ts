type DateRangeItem = {
  date: string;
};

export const filterByDateRange = <T extends DateRangeItem>(
  items: T[],
  startDate: string,
  endDate: string,
) => {
  return items.filter((item) => {
    const inStartRange = !startDate || item.date >= startDate;
    const inEndRange = !endDate || item.date <= endDate;
    return inStartRange && inEndRange;
  });
};
