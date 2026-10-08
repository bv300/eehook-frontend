const asList = (value) => Array.isArray(value) ? value : [];

export const relatedProductsFromResponse = (response) => asList(response?.related_products).slice(0, 4);
