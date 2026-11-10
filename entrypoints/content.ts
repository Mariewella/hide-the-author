export default defineContentScript({
  matches: [
    '*://*.martinus.sk/*',
    '*://*.martinus.cz/*'
  ],

  // Príprava stránky a sledovanie zmien v úložisku
  async main() {
    await setupPage();

    // Keď sa zmení zoznam autorov v úložisku, prekresli stránku
    blockedAuthors.watch(() => {
      setupPage();
    });

    bookTypes.watch(() => {
      setupPage();
    });

    extensionEnabled.watch(() => {
      setupPage();
    });

    // Keď Martinus vymení časť stránky, vlož naše prvky znova
    let timer: number | undefined;
    const observer = new MutationObserver(() => {
      if (pageNeedsSetup()) {
        window.clearTimeout(timer);
        timer = window.setTimeout(setupPage, 200);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  },
});

// Vloženie chýbajúcich prvkov, vykreslenie bublín a použitie filtra
async function setupPage() {
    const enabled = await extensionEnabled.getValue();
    currentEnabled = enabled;

    if (!enabled) {
      document.getElementById('hide-the-author-filter')?.remove();
      document.querySelectorAll('input[id^="hide-the-author-"]').forEach((checkbox) => {
        checkbox.closest('.form-check')?.remove();
      });
      document.querySelectorAll('.hta-bean').forEach((bean) => bean.remove());
      applyFilter([], []);
      return;
    }

  if (document.querySelector('#filterForm') && !document.getElementById('hide-the-author-filter')) {
    const group = createAuthorFilter();
    document.querySelector('#filterForm')?.before(group);
  }

  if (!document.getElementById('hide-the-author-series')) {
    addBookTypeOption();
  }

  const list = await blockedAuthors.getValue();
  const types = await bookTypes.getValue();

  const typeCheckboxes = document.querySelectorAll<HTMLInputElement>('input[id^="hide-the-author-"]');
  for (const checkbox of typeCheckboxes) {
    checkbox.checked = types.includes(checkbox.value);
  }

  renderChips(list);
  applyFilter(list, types);

  currentTypes = types;
  renderActiveBeans(types);
}

// Rýchla kontrola či niečo chýba alebo pribudli nové knihy
function pageNeedsSetup() {
    if (!currentEnabled) {
    return false;
  }

  const filterMissing = document.querySelector('#filterForm') && !document.getElementById('hide-the-author-filter');

  const checkboxesMissing = document.querySelector('#filter-specials-show-only-options .multicheckbox') && !document.getElementById('hide-the-author-series');
  
  const newCards = document.querySelector('div.mj-product.listing__item:not([data-hta-checked])');

  const beansMissing = currentTypes.length > 0 && !document.querySelector('.hta-bean');

  return Boolean(filterMissing || checkboxesMissing || newCards || beansMissing);}

//Prejdenie všetkých kariet a skrytie tých, ktoré patria autorom zo zoznamu alebo nemajú požadovaný typ
function applyFilter(hiddenAuthors: string[] = [], types: string[] = []) {
  const hidden = hiddenAuthors.map(normalizeName);
  const cards = document.querySelectorAll<HTMLElement>('div.mj-product.listing__item');

  document.querySelectorAll<HTMLElement>('.listing > hr').forEach((hr) => hr.style.display = 'none');

  for (const card of cards) {
    const links = card.querySelectorAll('a[href^="/authors/"]');
    const authors = [...links].map((link) => normalizeName(link.textContent ?? ''));
    const authorHidden = authors.some((author) => hidden.includes(author));
    const typeHidden = types.length > 0 && !types.includes(getBookType(card));
    const shouldHide = authorHidden || typeHidden;

    card.style.display = shouldHide ? 'none' : '';
    card.dataset.htaChecked = '1';
  }
}

const CHEVRON_SVG =
  '<svg class="fa-chevron-down fa-fw mr-l-none mr-tiny svg-inline--fa text-color-grey" aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M239 401c9.4 9.4 24.6 9.4 33.9 0L465 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-175 175L81 175c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9L239 401z"></path></svg>';

const XMARK_SVG =
  '<svg class="svg-inline--fa fa-xmark fa-fw ml-tiny" aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M345 137c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-119 119L73 103c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l119 119L39 375c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l119-119L311 409c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-119-119L345 137z"></path></svg>';

let currentTypes: string[] = [];
let currentEnabled = true;

// Vytvorenie celej skupiny pre filter autorov, vracia len element <dl>
function createAuthorFilter() {
  const texts = getTexts();

  const group = document.createElement('dl');
  group.className = 'filter__cat';
  group.id = 'hide-the-author-filter';  // Vraciame už len skupinu

  const title = document.createElement('dt');
  title.className = 'filter__cat-name';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn btn--clean mb-none pr-medium pr-l-none d-flex w-100 justify-content-between align-items-center btn--lowercase text-left px-none text-transform-none text-color-black';
  button.setAttribute('aria-expanded', 'false');
  button.innerHTML = '<span>' + texts.hideAuthors + '</span>' + CHEVRON_SVG;
  title.append(button);

  const content = document.createElement('dd');
  content.className = 'filter__cat-items hide';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = texts.authorPlaceholder;
  input.className = 'autocomplete__input autocomplete__input--default';

  const chips = document.createElement('div');
  chips.id = 'hide-the-author-chips'; 
  chips.style.cssText = 'display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px;'; 

  content.append(input, chips);
  group.append(title, content);

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

  // Pridanie mena po stlačení Enter
  input.addEventListener('keydown', async (event) => {
    if (event.key !== 'Enter') {
      return;
    }
    event.preventDefault();

    const name = input.value.trim();
    if (!name) {
      return;
    }

    const list = await blockedAuthors.getValue();
    const alreadyThere = list.some((author) => normalizeName(author) === normalizeName(name));
    if (!alreadyThere) {
      await blockedAuthors.setValue([...list, name]);
    }

    input.value = '';
  });

  return group;  // Vraciame už len skupinu
}

// Bublinka s krížokom pre každého autora, ktorý je v zozname blokovaných
function renderChips(list: string[]) {
  const texts = getTexts();

  const container = document.getElementById('hide-the-author-chips');
  if (!container) {
    return;
  }

  container.replaceChildren();

  for (const name of list) {
    const chip = document.createElement('span');
    chip.className = 'badge badge--blue';
    chip.textContent = name;

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = '×';
    remove.setAttribute('aria-label', `${texts.remove} ${name}`);
    remove.style.cssText = 'background: none; border: none; color: inherit; cursor: pointer; margin-left: 4px; padding: 0;';

    remove.addEventListener('click', async () => {
      const current = await blockedAuthors.getValue();
      await blockedAuthors.setValue(current.filter((author) => author !== name));
    });

    chip.append(remove);
    container.append(chip);
  }
}

// Normalizuje meno autora na porovnanie (odstráni diakritiku, zmení na malé písmená a odstráni medzery)
function normalizeName(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// Vytvorenie checkboxu s popisom, ktorý sa pridá do skupiny pre filter typov kníh
function addCheckbox(value: string, text: string) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-check';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'form-check-input';
  checkbox.value = value;
  checkbox.id = `hide-the-author-${value}`;

  const label = document.createElement('label');
  label.className = 'form-check-label';
  label.htmlFor = checkbox.id;
  label.textContent = text;

  checkbox.addEventListener('change', async (event) => {
    event.stopPropagation();

    const current = await bookTypes.getValue();
    const next = checkbox.checked
      ? [...current, value]
      : current.filter((type) => type !== value);

    await bookTypes.setValue(next);
  });

  wrapper.append(checkbox, label);
  return { wrapper, checkbox };
}

// Vloží checkboxy pre filter typov kníh do existujúcej skupiny a vráti referencie na checkboxy
function addBookTypeOption() {
  const texts = getTexts();

  const target = document.querySelector('#filter-specials-show-only-options .multicheckbox');
  if (!target) {
    return null;
  }

  const series = addCheckbox('series', texts.series);
  const standalone = addCheckbox('standalone', texts.standalone);

  target.append(series.wrapper, standalone.wrapper);

  return {
    series: series.checkbox,
    standalone: standalone.checkbox,
  };
}

// Zistí, či je kniha súčasťou série alebo samostatná
function getBookType(card: HTMLElement) {
  const seriesLink = card.querySelector('a[href^="/seria/"]');
  return seriesLink ? 'series' : 'standalone';
}

// Zobrazenie aktívnych odznakov pre aktuálne vybrané typy kníh, umožňuje ich odstránenie
function renderActiveBeans(types: string[]) {
  const texts = getTexts();

  // Najprv odstráň naše staré odznaky, aby sa nezdvojovali
  document.querySelectorAll('.hta-bean').forEach((bean) => bean.remove());

  if (types.length === 0) {
    return;
  }

  // Nájdi obal odznakov Martinusu, alebo si vytvor vlastný
  let container = document.querySelector('.mj-filter-bean')?.parentElement;
  if (!container) {
    const listing = document.querySelector('.listing');
    if (!listing) {
      return;
    }
    container = document.createElement('div');
    container.className = 'badges flex-nowrap mb-small hta-bean';
    listing.before(container);
  }

  for (const type of types) {
    const label = type === 'series' ? texts.series : texts.standalone;

    const bean = document.createElement('button');
    bean.type = 'button';
    bean.className = 'badge badge--green mb-tiny hta-bean';
    bean.style.cssText = 'background: none; font-family: inherit; font-size: inherit; font-weight: 600; cursor: pointer;';    bean.innerHTML = label + XMARK_SVG;
    bean.setAttribute('aria-label', `${texts.clearFilter} ${label}`);

    bean.addEventListener('click', async () => {
      const current = await bookTypes.getValue();
      await bookTypes.setValue(current.filter((t) => t !== type));
    });

    container.append(bean);
  }
}

// Preklad pre .cz top-level domain
function getTexts() {
  const isCzech = location.hostname.endsWith('martinus.cz');

  if (isCzech) {
    return {
      hideAuthors: 'Skrýt autory',
      authorPlaceholder: 'Zadejte jméno autora...',
      series: 'série',
      standalone: 'samostatné knihy',
      remove: 'Odstranit',
      clearFilter: 'Zrušit filtr',
    };
  }

  return {
    hideAuthors: 'Skryť autorov',
    authorPlaceholder: 'Zadajte meno autora...',
    series: 'série',
    standalone: 'samostatné knihy',
    remove: 'Odstrániť',
    clearFilter: 'Zrušiť filter',
  };
}