export const paginate = (totalCount: number, page: number, limit: number) => ({
  totalCount,
  page,
  limit,
  totalPages: Math.ceil(totalCount / limit),
  hasNextPage: page < Math.ceil(totalCount / limit),
  hasPrevPage: page > 1,
});

export const generateSaleNumber = (prefix: string = 'INV'): string => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${dateStr}-${random}`;
};

export const generateOrderNumber = (prefix: string = 'ORD'): string => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${dateStr}-${random}`;
};

export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

export const roundDecimal = (value: number, places: number = 2): number => {
  return Math.round(value * Math.pow(10, places)) / Math.pow(10, places);
};
