export default defineContentScript({
  matches: [
    '*://*.martinus.sk/*',
    '*://*.martinus.cz/*'
  ],
  
  async main() {
    const list = await blockedAuthors.getValue();  // returns the list of blocked authors, or [] if none are stored yet
    console.log('Blocked authors:', list);
  },
});