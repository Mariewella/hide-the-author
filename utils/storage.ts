// Create a named storage slot holding a list of strings
export const blockedAuthors = storage.defineItem<string[]>('local:blockedAuthors', {
    fallback: [],                               // empty list if no value is stored yet
});