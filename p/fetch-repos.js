const fs = require("node:fs/promises");
const path = require("node:path");

const GITHUB_USERNAME = process.env.GITHUB_USERNAME || "sidval";
const OUTPUT_FILE = path.join(process.cwd(), "data", "repos.json");

async function main() {
  const url = new URL(`https://api.github.com/users/${GITHUB_USERNAME}/repos`);

  url.searchParams.set("type", "owner");
  url.searchParams.set("sort", "updated");
  url.searchParams.set("direction", "desc");
  url.searchParams.set("per_page", "100");

  console.log(`Fetching repos from: ${url}`);

  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "github-projects-dashboard"
    }
  });

  if (!response.ok) {
    const body = await response.text();

    throw new Error(
      [
        "GitHub API request failed",
        `Status: ${response.status} ${response.statusText}`,
        `Body: ${body}`
      ].join("\n")
    );
  }

  const repos = await response.json();

  if (!Array.isArray(repos)) {
    throw new Error("Unexpected GitHub API response. Expected an array.");
  }

  const normalizedRepos = repos
    .filter((repo) => !repo.private)
    .map(normalizeRepo)
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await fs.writeFile(
    OUTPUT_FILE,
    `${JSON.stringify(normalizedRepos, null, 2)}\n`,
    "utf8"
  );

  console.log(`Generated ${OUTPUT_FILE}`);
  console.log(`Total repos: ${normalizedRepos.length}`);
}

function normalizeRepo(repo) {
  const homepage = normalizeHomepage(repo.homepage);

  return {
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    description: repo.description || "",
    html_url: repo.html_url,
    homepage,
    has_public_web: Boolean(homepage),

    language: repo.language || "",
    topics: Array.isArray(repo.topics) ? repo.topics : [],

    stargazers_count: repo.stargazers_count || 0,
    watchers_count: repo.watchers_count || 0,
    forks_count: repo.forks_count || 0,
    open_issues_count: repo.open_issues_count || 0,

    created_at: repo.created_at,
    updated_at: repo.updated_at,
    pushed_at: repo.pushed_at,

    archived: Boolean(repo.archived),
    disabled: Boolean(repo.disabled),
    fork: Boolean(repo.fork),

    default_branch: repo.default_branch || "main",
    size: repo.size || 0,

    license: repo.license
      ? {
          key: repo.license.key,
          name: repo.license.name,
          spdx_id: repo.license.spdx_id
        }
      : null
  };
}

function normalizeHomepage(homepage) {
  if (!homepage || typeof homepage !== "string") {
    return "";
  }

  const value = homepage.trim();

  if (!value) {
    return "";
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `https://${value}`;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
