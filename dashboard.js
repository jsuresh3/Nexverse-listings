(function () {
  const PLACEHOLDER_ICON_SVG =
    '<svg viewBox="0 0 24 24"><path d="M3 21V8l9-5 9 5v13H14v-7h-4v7H3z" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function debounce(fn, wait) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  }

  const tilesContainer = document.getElementById('tiles-container');
  const emptyState = document.getElementById('empty-state');

  let listingsCache = [];
  const checklistCache = {}; // id -> state

  function defaultChecklistState() {
    return { meta: {}, items: {}, conditions: {}, notes: '' };
  }

  function countTotals(state) {
    let total = 0;
    let checked = 0;
    let hasDealbreakerChecked = false;
    CHECKLIST_TEMPLATE.sections.forEach((section) => {
      section.items.forEach((item) => {
        total += 1;
        const itemState = state.items[item.id];
        if (itemState && itemState.checked) {
          checked += 1;
          if (item.dealbreaker) hasDealbreakerChecked = true;
        }
      });
    });
    return { total, checked, hasDealbreakerChecked };
  }

  // ---- Boot ----
  async function init() {
    let loggedIn = false;
    try {
      loggedIn = await NexAPI.checkSession();
    } catch (e) {
      loggedIn = false;
    }
    if (!loggedIn) {
      window.location.href = 'index.html';
      return;
    }
    await loadAndRenderTiles();
  }

  async function loadAndRenderTiles() {
    listingsCache = await NexAPI.getListings();
    await Promise.all(
      listingsCache.map(async (l) => {
        checklistCache[l.id] = await NexAPI.getChecklist(l.id);
      })
    );
    renderTiles();
  }

  // ---- Tiles ----
  function renderTiles() {
    tilesContainer.innerHTML = '';
    emptyState.classList.toggle('hidden', listingsCache.length > 0);

    listingsCache.forEach((listing) => {
      const state = checklistCache[listing.id] || defaultChecklistState();
      const { total, checked, hasDealbreakerChecked } = countTotals(state);

      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.dataset.id = listing.id;

      const iconWrap = document.createElement('div');
      iconWrap.className = 'tile-icon';
      iconWrap.innerHTML = listing.icon ? `<img src="${listing.icon}" alt="">` : PLACEHOLDER_ICON_SVG;

      const name = document.createElement('div');
      name.className = 'tile-name';
      name.textContent = listing.name;

      const meta = document.createElement('div');
      meta.className = 'tile-meta';
      meta.innerHTML =
        `${checked}/${total} checked` +
        (hasDealbreakerChecked ? '<br><span style="color:#b3452e;">⚠ dealbreaker</span>' : '');

      const chevron = document.createElement('div');
      chevron.className = 'tile-chevron';
      chevron.innerHTML =
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6,9 12,15 18,9"/></svg>';

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'tile-delete';
      deleteBtn.textContent = 'Remove';
      deleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!confirm(`Remove "${listing.name}" and its checklist?`)) return;
        deleteBtn.disabled = true;
        try {
          listingsCache = await NexAPI.deleteListing(listing.id);
          delete checklistCache[listing.id];
          renderTiles();
        } catch (err) {
          alert('Could not remove listing. Please try again.');
          deleteBtn.disabled = false;
        }
      });

      tile.appendChild(iconWrap);
      tile.appendChild(name);
      tile.appendChild(meta);
      tile.appendChild(deleteBtn);
      tile.appendChild(chevron);

      tile.addEventListener('click', () => toggleTile(listing.id));

      tilesContainer.appendChild(tile);
    });
  }

  function toggleTile(id) {
    const tile = tilesContainer.querySelector(`.tile[data-id="${id}"]`);
    const existingPanel = tilesContainer.querySelector(`.panel[data-id="${id}"]`);

    if (existingPanel) {
      existingPanel.classList.remove('open');
      tile.classList.remove('expanded');
      setTimeout(() => existingPanel.remove(), 200);
      return;
    }

    tile.classList.add('expanded');
    const panel = buildChecklistPanel(id);
    tile.insertAdjacentElement('afterend', panel);
    requestAnimationFrame(() => panel.classList.add('open'));
  }

  // ---- Checklist panel ----
  function buildChecklistPanel(listingId) {
    const state = checklistCache[listingId] || (checklistCache[listingId] = defaultChecklistState());
    const panel = document.createElement('div');
    panel.className = 'panel';
    panel.dataset.id = listingId;

    const inner = document.createElement('div');
    inner.className = 'panel-inner';
    panel.appendChild(inner);

    const scheduleSave = debounce(() => {
      NexAPI.saveChecklist(listingId, state).catch(() => {
        // best-effort; a later edit will retry the save
      });
    }, 500);

    function onChange() {
      scheduleSave();
      refreshTileSummary(listingId);
      panel._updateStatusBar();
    }

    // --- meta fields ---
    const metaBox = document.createElement('div');
    metaBox.className = 'meta';
    const rows = [
      CHECKLIST_TEMPLATE.metaFields.slice(0, 2),
      CHECKLIST_TEMPLATE.metaFields.slice(2, 4),
      CHECKLIST_TEMPLATE.metaFields.slice(4, 7),
      CHECKLIST_TEMPLATE.metaFields.slice(7, 9)
    ];
    rows.forEach((rowFields) => {
      const row = document.createElement('div');
      row.className = 'meta-row';
      rowFields.forEach((f) => {
        const field = document.createElement('div');
        field.className = 'meta-field';
        const label = document.createElement('label');
        label.textContent = f.label + ':';
        const input = document.createElement('input');
        input.type = f.type;
        input.value = state.meta[f.id] || '';
        input.addEventListener('input', () => {
          state.meta[f.id] = input.value;
          onChange();
        });
        field.appendChild(label);
        field.appendChild(input);
        row.appendChild(field);
      });
      metaBox.appendChild(row);
    });
    inner.appendChild(metaBox);

    // --- sections ---
    CHECKLIST_TEMPLATE.sections.forEach((section) => {
      const title = document.createElement('div');
      title.className = `section-title ${section.style}`;
      title.textContent = section.title;
      inner.appendChild(title);

      const itemsWrap = document.createElement('div');
      itemsWrap.className = 'items';

      section.items.forEach((item) => {
        const itemState = state.items[item.id] || { checked: false, value: '' };
        state.items[item.id] = itemState;

        const row = document.createElement('div');
        row.className =
          'item' + (item.dealbreaker ? ' dealbreaker' : '') + (itemState.checked ? ' checked' : '');

        const box = document.createElement('div');
        box.className = 'box' + (itemState.checked ? ' checked' : '');
        box.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="4,13 9,18 20,6"/></svg>';

        const body = document.createElement('div');
        body.className = 'item-body';

        const labelWrap = document.createElement('div');
        labelWrap.className = 'item-label';
        labelWrap.innerHTML = item.label;

        if (item.field) {
          const inline = document.createElement('span');
          inline.className = 'inline-field';
          const input = document.createElement('input');
          input.type = 'text';
          input.placeholder = item.field.placeholder;
          input.value = itemState.value || '';
          input.addEventListener('click', (e) => e.stopPropagation());
          input.addEventListener('input', () => {
            itemState.value = input.value;
            onChange();
          });
          inline.appendChild(input);
          labelWrap.appendChild(inline);
        }

        body.appendChild(labelWrap);

        if (item.condition) {
          const opts = document.createElement('div');
          opts.className = 'condition-options';
          const savedChoice = state.conditions[item.id];
          item.condition.forEach((choice, idx) => {
            const lab = document.createElement('label');
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = `condition-${listingId}-${item.id}`;
            radio.checked = savedChoice === idx;
            radio.addEventListener('click', (e) => e.stopPropagation());
            radio.addEventListener('change', () => {
              state.conditions[item.id] = idx;
              onChange();
            });
            lab.appendChild(radio);
            lab.appendChild(document.createTextNode(choice));
            opts.appendChild(lab);
          });
          body.appendChild(opts);
        }

        function toggleCheck(e) {
          if (e.target.tagName === 'INPUT') return;
          itemState.checked = !itemState.checked;
          box.classList.toggle('checked', itemState.checked);
          row.classList.toggle('checked', itemState.checked);
          onChange();
        }
        box.addEventListener('click', toggleCheck);
        labelWrap.addEventListener('click', toggleCheck);

        row.appendChild(box);
        row.appendChild(body);
        itemsWrap.appendChild(row);
      });

      inner.appendChild(itemsWrap);
    });

    // --- notes ---
    const notesBox = document.createElement('div');
    notesBox.className = 'notes';
    const notesLabel = document.createElement('div');
    notesLabel.className = 'label';
    notesLabel.textContent = 'Notes:';
    const notesArea = document.createElement('textarea');
    notesArea.placeholder = 'Write any additional observations here...';
    notesArea.value = state.notes || '';
    notesArea.addEventListener('input', () => {
      state.notes = notesArea.value;
      scheduleSave();
    });
    notesBox.appendChild(notesLabel);
    notesBox.appendChild(notesArea);
    inner.appendChild(notesBox);

    // --- status bar ---
    const statusBar = document.createElement('div');
    statusBar.className = 'status-bar';
    statusBar.innerHTML = `
      <div class="progress">
        <span class="progress-text"></span>
        <div class="bar"><div class="bar-fill"></div></div>
      </div>
      <span class="alert">⚠ Dealbreaker checked</span>
    `;
    inner.appendChild(statusBar);

    panel._updateStatusBar = function () {
      const { total, checked, hasDealbreakerChecked } = countTotals(state);
      statusBar.querySelector('.progress-text').textContent = `${checked} / ${total} checked`;
      statusBar.querySelector('.bar-fill').style.width = (total ? (checked / total) * 100 : 0) + '%';
      statusBar.querySelector('.alert').classList.toggle('show', hasDealbreakerChecked);
    };
    panel._updateStatusBar();

    return panel;
  }

  function refreshTileSummary(listingId) {
    const tile = tilesContainer.querySelector(`.tile[data-id="${listingId}"]`);
    if (!tile) return;
    const state = checklistCache[listingId] || defaultChecklistState();
    const { total, checked, hasDealbreakerChecked } = countTotals(state);
    const meta = tile.querySelector('.tile-meta');
    meta.innerHTML =
      `${checked}/${total} checked` +
      (hasDealbreakerChecked ? '<br><span style="color:#b3452e;">⚠ dealbreaker</span>' : '');
  }

  // ---- Add listing modal ----
  const modalOverlay = document.getElementById('modal-overlay');
  const addListingBtn = document.getElementById('add-listing-btn');
  const cancelListingBtn = document.getElementById('cancel-listing-btn');
  const createListingBtn = document.getElementById('create-listing-btn');
  const nameInput = document.getElementById('new-listing-name');
  const fileBtn = document.getElementById('file-btn');
  const fileInput = document.getElementById('icon-file');
  const iconPreview = document.getElementById('icon-preview');

  let pendingIcon = null;

  function openModal() {
    nameInput.value = '';
    pendingIcon = null;
    iconPreview.innerHTML = PLACEHOLDER_ICON_SVG;
    modalOverlay.classList.remove('hidden');
    nameInput.focus();
  }
  function closeModal() {
    modalOverlay.classList.add('hidden');
  }

  addListingBtn.addEventListener('click', openModal);
  cancelListingBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  fileBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      pendingIcon = reader.result;
      iconPreview.innerHTML = `<img src="${pendingIcon}" alt="">`;
    };
    reader.readAsDataURL(file);
  });

  createListingBtn.addEventListener('click', async () => {
    const name = nameInput.value.trim();
    if (!name) {
      nameInput.focus();
      return;
    }
    createListingBtn.disabled = true;
    try {
      const listing = await NexAPI.createListing(name, pendingIcon);
      listingsCache.push(listing);
      checklistCache[listing.id] = defaultChecklistState();
      closeModal();
      renderTiles();

      const newTile = tilesContainer.querySelector(`.tile[data-id="${listing.id}"]`);
      if (newTile) {
        newTile.scrollIntoView({ behavior: 'smooth', block: 'center' });
        toggleTile(listing.id);
      }
    } catch (err) {
      alert('Could not create listing. Please try again.');
    } finally {
      createListingBtn.disabled = false;
    }
  });

  // ---- Logout ----
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await NexAPI.logout();
    window.location.href = 'index.html';
  });

  init();
})();
