const isoDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
const translated = copy => ['en','zh'].every(lang => typeof copy?.[lang] === 'string' && copy[lang].trim());
const isAnonymousWork = id => /^tbd-\d+$/.test(id);
// Unmatched reviews keep their original rank. A public match supplies the catalog classification.
const inReviewScope = work => work?.paper?.group !== 'ei' && work?.project?.collection !== 'open-research';

export function resolveArena(spec, publications, projects) {
  if (!/^\d+\.\d+\.\d+$/.test(spec.version) || !isoDate(spec.rubricDate) || !isoDate(spec.snapshotDate))
    throw new Error('Invalid arena version or date');
  if (spec.tiers.length !== 6 || spec.tiers.some(({tier, range, meaning}, i) => tier !== i + 1 ||
      !translated(meaning) || (tier > 4 ? range !== null :
        !Array.isArray(range) || range.length !== 2 || !range.every(Number.isFinite) || range[0] > range[1])))
    throw new Error('Invalid arena rubric');

  const byPublication = new Map(projects.filter(p => p.publication).map(p => [p.publication.id, p]));
  const works = new Map(publications.map(paper => {
    const project = byPublication.get(paper.id);
    return [paper.id, { id: paper.id, paper, project, title: paper.title,
      date: paper.postedDate ?? paper.acceptedDate ?? '',
      dateKind: paper.postedDate ? 'posted' : paper.acceptedDateBasis === 'same-conference' ? 'reference' : 'accepted' }];
  }));
  for (const project of projects.filter(p => p.manuscriptPdf && !p.publication)) {
    if (works.has(project.id)) throw new Error('Duplicate arena work: ' + project.id);
    works.set(project.id, { id: project.id, project, title: project.title.en,
      date: project.reports[0]?.technicalReport.article.published ?? '', dateKind: 'released' });
  }
  const matched = new Set(), entryIds = new Set();
  const reviews = [], rows = [];
  spec.reviews.forEach((review, i) => {
    const {id, workId, rank, score, tier} = review;
    const band = spec.tiers[tier - 1];
    if (!band || band.tier !== tier || rank !== i + 1 || entryIds.has(id) || typeof id !== 'string' ||
        (band.range ? !Number.isFinite(score) || score < band.range[0] || score > band.range[1] : score !== null))
      throw new Error('Invalid arena score, rank or identity: ' + id);
    const work = works.get(workId ?? id);
    if ((!work && (workId !== undefined || !isAnonymousWork(id))) || (workId !== undefined && !isAnonymousWork(id)))
      throw new Error('Unknown public arena work or invalid anonymous ID: ' + id);
    if (work && matched.has(work.id)) throw new Error('Duplicate linked arena work: ' + work.id);
    if (work) matched.add(work.id);
    entryIds.add(id);
    if (inReviewScope(work)) {
      reviews.push(review);
      rows.push({ id, rank, score, tier, work });
    }
  });
  const pending = [...works.values()].filter(work => inReviewScope(work) && !matched.has(work.id))
    .sort((a,b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
  rows.push(...pending.map(work => ({ id: work.id, work, rank: null, score: null, tier: null })));
  return { ...spec, reviews, rows, byId: new Map(rows.filter(row => row.work).map(row => [row.work.id, row])) };
}
