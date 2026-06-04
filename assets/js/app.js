const pinnedRepos = [
  "sidval.github.io",
  "olab",
  "hide-ads"
];

const hiddenRepos = [
  "www",
  "rlopezsrl",
  "predeterminar",
  "csap"
];

const state = {
  repos: [],
  search: "",
  webFilter: "all",
  languageFilter: "all",
  sort: "updated-desc"
};

const elements = {
  totalRepos: document.querySelector("#totalRepos"),
  withWeb: document.querySelector("#withWeb"),
  heroWithWeb: document.querySelector("#heroWithWeb"),
  withoutWeb: document.querySelector("#withoutWeb"),
  latestUpdate: document.querySelector("#latestUpdate"),
  searchInput: document.querySelector("#searchInput"),
  webFilter: document.querySelector("#webFilter"),
  languageFilter: document.querySelector("#languageFilter"),
  sortSelect: document.querySelector("#sortSelect"),
  repoGrid: document.querySelector("#repoGrid"),
  resultsCount: document.querySelector("#resultsCount"),
  emptyState: document.querySelector("#emptyState"),
  errorState: document.querySelector("#errorState")
};

async function init() {
  bindEvents();

  try {
    const response = await fetch("data/repos.json");

    if (!response.ok) {
      throw new Error(`No se pudo cargar repos.json: ${response.status}`);
    }

    const repos = await response.json();

    state.repos = Array.isArray(repos) ? repos : [];
    populateLanguageFilter(state.repos);
    render();
  } catch (error) {
    console.error(error);
    elements.errorState.classList.remove("hidden");
    elements.resultsCount.textContent = "Error al cargar datos";
  }
}

function bindEvents() {
  elements.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLowerCase();
    render();
  });

  elements.webFilter.addEventListener("change", (event) => {
    state.webFilter = event.target.value;
    render();
  });

  elements.languageFilter.addEventListener("change", (event) => {
    state.languageFilter = event.target.value;
    render();
  });

  elements.sortSelect.addEventListener("change", (event) => {
    state.sort = event.target.value;
    render();
  });
}

function populateLanguageFilter(repos) {
  const languages = [...new Set(
    repos
      .map((repo) => repo.language)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b))
  )];

  for (const language of languages) {
    const option = document.createElement("option");
    option.value = language;
    option.textContent = language;
    elements.languageFilter.appendChild(option);
  }
}

function render() {
  const visibleRepos = state.repos.filter(isVisibleRepo);
  const filteredRepos = getFilteredRepos();

  updateSummary(visibleRepos);
  updateResultsCount(filteredRepos.length, visibleRepos.length);
  renderRepos(filteredRepos);
}

function getFilteredRepos() {
  return state.repos
    .filter(isVisibleRepo)
    .filter(matchesSearch)
    .filter(matchesWebFilter)
    .filter(matchesLanguageFilter)
    .sort(sortRepos);
}

function isVisibleRepo(repo) {
  return !hiddenRepos.includes(repo.name);
}

function matchesSearch(repo) {
  if (!state.search) {
    return true;
  }

  const searchableText = [
    repo.name,
    repo.description,
    repo.language,
    ...(repo.topics || [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchableText.includes(state.search);
}

function matchesWebFilter(repo) {
  const hasWeb = hasPublicWeb(repo);

  if (state.webFilter === "with-web") {
    return hasWeb;
  }

  if (state.webFilter === "without-web") {
    return !hasWeb;
  }

  return true;
}

function matchesLanguageFilter(repo) {
  if (state.languageFilter === "all") {
    return true;
  }

  return repo.language === state.languageFilter;
}

function sortRepos(a, b) {
  const pinnedComparison = comparePinnedRepos(a, b);

  if (pinnedComparison !== 0) {
    return pinnedComparison;
  }

  if (state.sort === "name-asc") {
    return a.name.localeCompare(b.name);
  }

  if (state.sort === "created-desc") {
    return dateValue(b.created_at) - dateValue(a.created_at);
  }

  if (state.sort === "stars-desc") {
    return numberValue(b.stargazers_count) - numberValue(a.stargazers_count);
  }

  return dateValue(b.updated_at) - dateValue(a.updated_at);
}

function comparePinnedRepos(a, b) {
  const indexA = pinnedRepos.indexOf(a.name);
  const indexB = pinnedRepos.indexOf(b.name);

  const aIsPinned = indexA !== -1;
  const bIsPinned = indexB !== -1;

  if (aIsPinned && bIsPinned) {
    return indexA - indexB;
  }

  if (aIsPinned) {
    return -1;
  }

  if (bIsPinned) {
    return 1;
  }

  return 0;
}

function updateSummary(repos) {
  const total = repos.length;
  const withWeb = repos.filter(hasPublicWeb).length;
  const withoutWeb = total - withWeb;
  const latest = repos
    .map((repo) => repo.updated_at)
    .filter(Boolean)
    .sort()
    .at(-1);

  elements.totalRepos.textContent = total;
  elements.withWeb.textContent = withWeb;

  if (elements.heroWithWeb) {
    elements.heroWithWeb.textContent = withWeb;
  }

  elements.withoutWeb.textContent = withoutWeb;
  elements.latestUpdate.textContent = latest ? formatDate(latest) : "-";
}

function updateResultsCount(visible, total) {
  elements.resultsCount.textContent = `${visible} de ${total} proyectos visibles`;
}

function renderRepos(repos) {
  elements.repoGrid.innerHTML = "";
  elements.emptyState.classList.toggle("hidden", repos.length > 0);

  const fragment = document.createDocumentFragment();

  for (const repo of repos) {
    fragment.appendChild(createRepoCard(repo));
  }

  elements.repoGrid.appendChild(fragment);
}

function createRepoCard(repo) {
  const card = document.createElement("article");
  card.className = "repo-card";

  const publicWeb = hasPublicWeb(repo);
  const description = repo.description || "Sin descripción todavía.";
  const topics = Array.isArray(repo.topics) ? repo.topics : [];
  const isPinned = pinnedRepos.includes(repo.name);

  card.innerHTML = `
    <div class="repo-card-header">
      <h3>
        <a href="${escapeAttribute(repo.html_url)}" target="_blank" rel="noopener noreferrer">
          ${escapeHTML(repo.name)}
        </a>
      </h3>

      <div class="repo-badges">
        ${isPinned ? `<span class="badge badge-pinned">Fijado</span>` : ""}

        <span class="badge ${publicWeb ? "badge-web" : "badge-no-web"}">
          ${publicWeb ? "Demo pública" : "Repositorio"}
        </span>
      </div>
    </div>

    <p class="description">${escapeHTML(description)}</p>

    ${topics.length ? `
      <div class="topics">
        ${topics.slice(0, 6).map((topic) => `<span class="topic">#${escapeHTML(topic)}</span>`).join("")}
      </div>
    ` : ""}

    <div class="meta-row">
      ${repo.language ? `<span class="meta-pill">${escapeHTML(repo.language)}</span>` : ""}
      <span class="meta-pill">★ ${numberValue(repo.stargazers_count)}</span>
      <span class="meta-pill">Forks ${numberValue(repo.forks_count)}</span>
      <span class="meta-pill">Actualizado ${formatDate(repo.updated_at)}</span>
    </div>

    <div class="card-actions">
      <a class="button button-secondary" href="${escapeAttribute(repo.html_url)}" target="_blank" rel="noopener noreferrer">
        Ver repo
      </a>
      
      ${publicWeb ? `
        <a class="button button-primary" href="${escapeAttribute(repo.homepage)}" target="_blank" rel="noopener noreferrer">
          Abrir demo
        </a>
      ` : ""}
    </div>
  `;

  return card;
}

function hasPublicWeb(repo) {
  return Boolean(repo.homepage && repo.homepage.trim());
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("es", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  }).format(date);
}

function dateValue(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function numberValue(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value = "") {
  return escapeHTML(value);
}

init();
