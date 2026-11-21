import { escapeHtml as h } from './content.mjs';
import { icon } from './components.mjs';

export function directoryHeader(title, description, backLabel, backUrl) {
  return `<header class="research-banner"><div class="container research-banner-inner">
    <a class="text-link research-back" href="${h(backUrl)}">${icon('arrow')}${h(backLabel)}</a>
    <h1>${h(title)}</h1><p class="research-deck">${h(description)}</p>
  </div></header>`;
}

// Reports belong to their parent project, including projects with several reports.
export function directoryGroups(entries, featured, t) {
  const projectId = entry => entry.projectId ?? entry.id;
  const selected = featured.flatMap(id => entries.filter(entry => projectId(entry) === id));
  const remaining = entries.filter(entry => !featured.includes(projectId(entry)));
  return [
    { key: 'selected', label: t.selectedResearch, entries: selected },
    { key: 'open-research', label: t.openReports, entries: remaining.filter(entry => entry.collection === 'open-research') },
    { key: 'other', label: t.moreProjects, entries: remaining.filter(entry => entry.collection !== 'open-research') },
  ].filter(group => group.entries.length);
}

export function directorySection(group, cards, axis = 'collection') {
  const id = axis === 'tier' ? 'tier-' + group.key : group.key;
  return `<section class="directory-group" id="${h(id)}" data-${axis}="${h(group.key)}" aria-labelledby="${h(id)}-title"${axis === 'tier' ? ' hidden' : ''}>
    <h2 class="project-group-title" id="${h(id)}-title">${h(group.label)}</h2>
    <div class="project-grid" data-group-entries>${cards}</div></section>`;
}
