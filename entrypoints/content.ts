export default defineContentScript({
  matches: [
    '*://*.martinus.sk/*',
    '*://*.martinus.cz/*'
  ],
  
  async main() {
    const list = await blockedAuthors.getValue();  // returns the list of blocked authors, or [] if none are stored yet
    console.log('Blocked authors:', list);

    const { group, input, chips } = createAuthorFilter();
    document.querySelector('#filterForm')?.before(group);

    applyFilter(list);  // apply the filter to the page
  },
});

function applyFilter(hiddenAuthors: string[] = []) {
  const hidden = hiddenAuthors.map(normalizeName);
  const cards = document.querySelectorAll<HTMLElement>('div.mj-product.listing__item');

  document.querySelectorAll<HTMLElement>('.listing > hr').forEach((hr) => hr.style.display = 'none');     // Hide the separators between the books

  for (const card of cards) {
    const links = card.querySelectorAll('a[href^="/authors/"]');
    const authors = [...links].map((link) => normalizeName(link.textContent ?? ''));
    const shouldHide = authors.some((author) => hidden.includes(author));

    card.style.display = shouldHide ? 'none' : '';
  }
}

const CHEVRON_SVG =
  '<svg class="fa-chevron-down fa-fw mr-l-none mr-tiny svg-inline--fa text-color-grey" aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M239 401c9.4 9.4 24.6 9.4 33.9 0L465 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-175 175L81 175c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9L239 401z"></path></svg>';

function createAuthorFilter() {
  // Create the HTML structure for the author filter UI
  const group = document.createElement('dl');
  group.className = 'filter__cat';

  // Create the title and button for the filter
  const title = document.createElement('dt');
  title.className = 'filter__cat-name';

  // Create the button to toggle the visibility of the author filter
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn btn--clean mb-none pr-medium pr-l-none d-flex w-100 justify-content-between align-items-center btn--lowercase text-left px-none text-transform-none text-color-black';
  button.setAttribute('aria-expanded', 'false');
  button.innerHTML = '<span>Skryť autorov</span>' + CHEVRON_SVG;
  button.setAttribute('aria-expanded', 'false');
  title.append(button);

  // Create the content area for the filter, which includes an input field and a container for chips
  const content = document.createElement('dd');
  content.className = 'filter__cat-items hide';

  // Create the input field for entering author names
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Zadajte meno autora...';
  input.className = 'autocomplete__input autocomplete__input--default';

  const chips = document.createElement('div');

  content.append(input, chips);
  group.append(title, content);

  // Add an event listener to the button to toggle the visibility of the filter content
  button.addEventListener('click', () => {
    button.classList.toggle('is-active');
    const open = button.classList.contains('is-active');

    content.classList.toggle('hide', !open);
    button.setAttribute('aria-expanded', String(open));

    const arrow = button.querySelector('svg');
    if (arrow) {
      arrow.style.transform = open ? 'rotate(180deg)' : '';
    }
  });

  return { group, input, chips };
}

function normalizeName(name: string) {
  return name
    .normalize('NFD')  // Normalize to decomposed form
    .replace(/[\u0300-\u036f]/g, '')  // Remove diacritical marks
    .toLowerCase()  // Convert to lowercase
    .trim();  // Remove leading and trailing whitespace 
}

document.createElement('button');