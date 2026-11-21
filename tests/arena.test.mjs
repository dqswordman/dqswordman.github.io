import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { projectRoot } from '../scripts/build.mjs';
import { loadContent, escapeHtml, researchIndexPath } from '../src/content.mjs';
import { resolveArena } from '../src/arena-model.mjs';
import { arenaMark } from '../src/arena.mjs';
import { renderPage } from '../src/render.mjs';

const content = await loadContent(projectRoot);
const spec = JSON.parse(await readFile(new URL('content/paper-arena.json', projectRoot),'utf8'));
const assets = { css: 'site.css', js: 'site.js', arenaCss: 'arena.css', arenaJs: 'arena.js' };

test('both arenas and home badges resolve to the same scores including qualitative and pending works', () => {
  for (const locale of ['en','zh']) {
    const basePath = '/profile', route = researchIndexPath('paper-arena',locale,basePath);
    const options = { ...content, assets, basePath, locale };
    const board = renderPage({ ...options, index:'paper-arena' });
    const home = renderPage(options);
    assert.ok(board.includes('rel="canonical" href="'+content.profile.url+route+'"'));
    assert.ok(home.includes('href="'+route+'"'));
    for (const row of content.arena.rows) {
      const tr = board.split('id="entry-'+row.id+'"')[1].split('</tr>')[0];
      assert.ok(tr.includes('data-rank="'+(row.rank ?? '')+'"'));
      assert.ok(tr.includes('data-tier="'+(row.tier ?? '')+'"'));
      if (row.score !== null) assert.equal(Number(tr.match(/<strong>([^<]+)<\/strong>/)[1]),row.score);
      else assert.ok(tr.includes('data-score="'+(row.rank === null ? 'pending' : 'qualitative')+'"'));
      if (row.work) assert.ok(home.includes('href="'+route+'#entry-'+row.id+'"'));
      else assert.ok(tr.includes('>TBD</th>') && tr.includes('data-keywords="TBD"') && !tr.includes('href='));
    }
    for (const band of spec.tiers) assert.ok(board.includes(escapeHtml(band.meaning[locale])));
    assert.ok(!home.includes('src="/profile/assets/arena.js"'));
  }
});

test('releasing an anonymous title preserves its arena link and merges the public pending record', () => {
  const paper = { id:'example-work', title:'Example work', acceptedDate:'2026-09-10' };
  const reviews = [{id:'tbd-01',rank:1,tier:2,score:8}];
  const initial = resolveArena({...spec,reviews},[paper],[]);
  assert.equal(initial.rows.length,2);
  assert.equal(initial.byId.get(paper.id).rank,null);
  const linked = resolveArena({...spec,reviews:[{...reviews[0],workId:paper.id}]},[paper],[]);
  assert.equal(linked.rows.length,1);
  assert.equal(linked.byId.get(paper.id).rank,1);
  assert.ok(arenaMark(linked,paper.id,'zh','/preview').includes('/preview/zh/paper-arena/#entry-tbd-01'));
  const precise = resolveArena({...spec,reviews:[{...reviews[0],workId:paper.id,score:8.25}]},[paper],[]);
  assert.ok(arenaMark(precise,paper.id,'en','').includes('8.25'));
});

test('EI and open research records stay out of scores, pending rows and badges while source ranks survive', () => {
  const ei = content.publications.filter(paper => paper.group === 'ei');
  const reports = content.projects.filter(project => project.collection === 'open-research');
  const paper = content.publications.find(p => p.group === 'major');
  const source = [
    { id: ei[0].id, rank: 1, tier: 1, score: 9.5 },
    { id: 'tbd-02', workId: reports[0].id, rank: 2, tier: 2, score: 8.5 },
    { id: 'tbd-03', rank: 3, tier: 2, score: 8.0 },
    { id: paper.id, rank: 4, tier: 5, score: null },
  ];
  const arena = resolveArena({ ...spec, reviews: source }, content.publications, content.projects);
  assert.deepEqual(arena.reviews, source.slice(2));
  assert.deepEqual(arena.rows.filter(r => r.rank).map(r => [r.id,r.rank]), [['tbd-03',3],[paper.id,4]]);
  for (const locale of ['zh','en']) {
    const options = { ...content, arena, locale, assets };
    const board = renderPage({ ...options, index:'paper-arena' });
    const home = renderPage(options);
    assert.ok(!board.includes('id="entry-tbd-02"') && !board.includes('<option value="9.5">'));
    for (const {id} of [...ei, ...reports]) {
      assert.ok(!arena.byId.has(id) && !board.includes('id="entry-'+id+'"'));
      assert.ok(!home.includes('/paper-arena/#entry-'+id+'"'));
    }
    for (const {id} of ei) assert.ok(home.includes('id="paper-'+id+'"'));
    for (const {manuscriptPdf} of reports) assert.ok(home.includes('href="/'+manuscriptPdf+'"'));
  }
});

test('arena rejects unknown works, duplicate identities, altered rank sequences and numerical qualitative ratings', () => {
  const row = {id:'tbd-10',rank:1,score:7.5,tier:3};
  const rejects = reviews => assert.throws(() => resolveArena({...spec, reviews},content.publications,content.projects),/arena/);
  for (const changes of [{rank:3},{tier:2},{tier:5},{score:null},{id:'unknown-work'},{workId:'unknown-work'}]) rejects([{...row,...changes}]);
  rejects([row,{...row,rank:2}]);
  const workId = content.publications[0].id;
  rejects([{...row, workId},{...row,rank:2,id:workId}]);
  const qualitative = resolveArena({...spec,reviews:[{...row,tier:6,score:null}]},[],[]);
  assert.equal(qualitative.rows[0].score,null);
});
