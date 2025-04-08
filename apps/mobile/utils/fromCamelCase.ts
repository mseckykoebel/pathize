export function fromCamelCase(camelCaseString: string): string {
  return camelCaseString
    .replace(/([A-Z])/g, ' $1') // insert a space before all capital letters
    .replace(/\s+/g, ' ') // replace multiple spaces with a single space
    .toLowerCase() // convert all letters to lowercase
    .replace(/^./, char => char.toUpperCase()); // capitalize the first letter
}
