// Create a named storage slot holding a list of strings
const blockedAuthors = storage.defineItem<string[]>
('sync:blockedAuthors', {
    fallback: [],                               // empty list if no value is stored yet
});

const list = await blockedAuthors.getValue();  // returns the list of blocked authors, or [] if none are stored yet

await blockedAuthors.setValue([...list, authorId]);  // add a new author to the list