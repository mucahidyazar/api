
/**
 * Converts a camel case brand name (e.g. "A Brand") to kebab case (e.g. "a-brand").
 * @param brandName The camel case brand name.
 * @returns The kebab case brand name.
 */
function toKebabCase(brandName: string): string {
  return brandName
    .toLowerCase() // All characters to lowercase
    .replace(/ /g, '-'); // Replace spaces with dashes
};

/**
 * Converts a kebab case brand name (e.g. "a-brand") to camel case (e.g. "A Brand").
 * @param kebabName The kebab case brand name.
 * @returns The camel case brand name.
 */
function toCamelCase(kebabName: string): string {
  return kebabName
    .split('-') // Split by dashes
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter of each word
    .join(' '); // Join words with spaces
};

export { toKebabCase, toCamelCase };
