import { escapeHtml as h, projectPath, researchIndexPath, venueLabel } from './content.mjs';
import { icon } from './components.mjs';

export const arenaCopy = {
  zh: {
    title: '论文竞技场', description: '按同一套六档标准查看各篇研究的贡献、证据和可复用价值。分数与顺位取自独立评阅记录。',
    home: '返回首页', distribution: '各档篇数', snapshot: '评阅记录', rubric: '评分标准',
    board: '论文榜单', public: '公开论文', all: '全部条目', scope: '榜单范围', search: '搜索标题或会议',
    score: '综合分', anyScore: '全部评分', tier: '档位', anyTier: '全部档位', sort: '排序',
    original: '原榜顺位', newest: '日期从新到旧', oldest: '日期从旧到新', qualitative: '定性评价',
    rank: '顺位', work: '论文', date: '作品日期', accepted: '录用', posted: '预印本上线',
    reference: '同届会议参考日期', released: '报告发布', datePending: '日期待公开', points: '分',
    showing: '显示 {n} / {total} 条', empty: '没有符合这些条件的条目。', reset: '重置筛选',
    guide: '同分条目沿用原评阅顺序。TBD 表示题名尚未公开对应，可能是在审或已完成待投的稿件。标有 under view 的论文已进入评审范围，评分待补。',
    dateNote: '时间排序采用每篇论文注明的日期，日期待公开的条目排在最后。',
    report: '研究稿件', meaning: '含义', reviewed: '已评阅', pending: '待评分',
    shortTier: n => '第 ' + n + ' 档', chartTier: n => n + ' 档', minimum: '最低分', exact: '具体分数', above: n => n + ' 分及以上',
  },
  en: {
    title: 'Paper Arena', description: 'Explore research contributions, the evidence behind them and what others can reuse. Scores and ranks follow an independent review using a six-tier rubric.',
    home: 'Back to home', distribution: 'Papers by tier', snapshot: 'Review snapshot', rubric: 'Scoring rubric',
    board: 'Paper leaderboard', public: 'Public papers', all: 'All entries', scope: 'Leaderboard scope', search: 'Search titles or venues',
    score: 'Score', anyScore: 'All scores', tier: 'Tier', anyTier: 'All tiers', sort: 'Sort',
    original: 'Original rank', newest: 'Newest first', oldest: 'Oldest first', qualitative: 'Qualitative',
    rank: 'Rank', work: 'Paper', date: 'Work date', accepted: 'Accepted', posted: 'Preprint posted',
    reference: 'Conference reference date', released: 'Report released', datePending: 'Date pending', points: '',
    showing: 'Showing {n} of {total} entries', empty: 'No entries match these filters.', reset: 'Reset filters',
    guide: 'Tied papers keep their order in the review record. TBD marks a title awaiting a public match and can include work under review or ready for submission. An entry marked “under view” is awaiting its arena rating.',
    dateNote: 'Date order uses the date shown for each paper. Entries with a pending date appear last.',
    report: 'Research manuscript', meaning: 'Interpretation', reviewed: 'Reviewed', pending: 'Awaiting a rating',
    shortTier: n => 'Tier ' + n, chartTier: n => 'T' + n, minimum: 'Minimum score', exact: 'Exact score', above: n => n + ' and above',
  },
};

const scoreText = score => Number.isInteger(score) ? score.toFixed(1) : String(score);
const selectOptions = (options) => options.map(([value, text]) => `<option value="${h(value)}">${h(text)}</option>`).join('');
const fragment = id => 'entry-' + id;
export function arenaMark(arena, id, locale, basePath) {
  const row = arena?.byId.get(id);
  if (!row) return '';
  const t = arenaCopy[locale];
  const rating = row.rank === null ? 'under view' :
    [row.score !== null ? scoreText(row.score) : null, t.shortTier(row.tier)].filter(Boolean).join(' · ');
  const url = researchIndexPath('paper-arena', locale, basePath) + '#' + fragment(row.id);
  return `<a class="arena-mark" href="${h(url)}"><span>${h(locale === 'zh' ? '竞技场' : 'Arena')}</span> ${h(rating)}${icon('arrow')}</a>`;
}

function histogram(arena, t, locale) {
  const counts = arena.tiers.map(({tier}) => arena.reviews.filter(row => row.tier === tier).length);
  const max = Math.max(1,...counts);
  return `<figure class="arena-distribution" aria-labelledby="distribution-title">
    <figcaption><h2 id="distribution-title">${t.distribution}</h2><span>${t.reviewed} <strong>${arena.reviews.length}</strong></span></figcaption>
    <ol>${counts.map((n,i) => `<li><a href="?scope=all&amp;tier=${i+1}#leaderboard" aria-label="${h(t.shortTier(i+1))} · ${n} ${locale === 'zh' ? '篇' : n === 1 ? 'paper' : 'papers'}">
      <span class="arena-bar-space"><span class="arena-bar" style="--bar:${(100*n/max).toFixed(2)}%"><b>${n}</b></span></span>
      <span class="arena-bar-name">${h(t.chartTier(i+1))}</span></a></li>`).join('')}</ol></figure>`;
}

function rubric(arena, t, locale) {
  return `<details class="arena-rubric" id="rubric"><summary><span>${t.rubric}</span><small>v${h(arena.version)} · <time datetime="${arena.rubricDate}">${arena.rubricDate}</time></small>${icon('down')}</summary>
    <div class="arena-rules"><table><thead><tr><th scope="col">${t.tier}</th><th scope="col">${t.score}</th><th scope="col">${t.meaning}</th></tr></thead><tbody>
      ${arena.tiers.map(b => `<tr><th scope="row">${h(t.shortTier(b.tier))}</th><td>${b.range ? h(b.range.join('–') + (t.points ? ' ' + t.points : '')) : t.qualitative}</td><td>${h(b.meaning[locale])}</td></tr>`).join('')}
    </tbody></table></div></details>`;
}

function boardRow(row, t, locale, basePath) {
  const { work, rank, score, tier } = row;
  const title = (locale === 'zh' && work?.project ? work.project.title.zh : work?.title) ?? 'TBD';
  const venue = work?.paper ? venueLabel(work.paper) : work ? t.report : '';
  const href = work?.project ? projectPath(work.project.id,locale,basePath) :
    work ? `${basePath}/${locale === 'zh' ? 'zh/' : ''}#paper-${work.id}` : '';
  const keywords = [title,work?.title,work?.project?.title.en,work?.project?.title.zh,venue,work?.paper?.preprintId,work?.date].filter(Boolean).join(' ');
  const status = rank === null ? 'pending' : score === null ? 'qualitative' : String(score);
  const titleCell = href ? `<a href="${h(href)}">${h(title)} ${icon('arrow')}</a>` : 'TBD';
  return `<tr id="${fragment(row.id)}" data-arena-row data-scope="${work ? 'public' : 'anonymous'}" data-score="${status}" data-tier="${tier ?? ''}" data-rank="${rank ?? ''}" data-date="${work?.date ?? ''}" data-keywords="${h(keywords)}">
    <td class="arena-rank">${rank ?? '—'}</td>
    <th scope="row" class="arena-work">${titleCell}${venue ? `<small>${h(venue)}</small>` : ''}</th>
    <td class="arena-score">${score !== null ? `<strong>${scoreText(score)}</strong>` : `<span>${rank === null ? 'under view' : t.qualitative}</span>`}</td>
    <td class="arena-tier">${tier ? `<span data-band="${tier}">${h(t.shortTier(tier))}</span>` : '—'}</td>
    <td class="arena-date">${work?.date ? `<time datetime="${work.date}">${work.date}</time><small>${t[work.dateKind]}</small>` : `<span>${t.datePending}</span>`}</td>
  </tr>`;
}

export function renderArena(arena, locale, basePath) {
  const t = arenaCopy[locale], home = basePath + (locale === 'zh' ? '/zh/' : '/');
  const publicCount = arena.rows.filter(row => row.work).length, total = arena.rows.length;
  const scores = [...new Set(arena.reviews.map(row => row.score).filter(n => n !== null))].sort((a,b) => b-a);
  return `<main id="main" class="paper-arena" tabindex="-1">
    <header class="arena-hero"><div class="container"><div class="arena-hero-top"><a class="text-link research-back" href="${h(home)}">${icon('arrow')}${t.home}</a><div class="arena-page-tools" data-page-tools></div></div>
      <div class="arena-hero-grid"><div><h1>${t.title}</h1><p>${t.description}</p>
        <div class="arena-stamp"><span>${t.snapshot} <time datetime="${arena.snapshotDate}">${arena.snapshotDate}</time></span><a href="#rubric">${t.rubric} v${h(arena.version)} · <time datetime="${arena.rubricDate}">${arena.rubricDate}</time> ${icon('down')}</a></div></div>
        ${histogram(arena,t,locale)}</div></div></header>
    <div class="container arena-content">
    <section id="leaderboard" aria-labelledby="board-title"><div class="arena-board-heading"><h2 id="board-title">${t.board}</h2>
      <span>${t.reviewed} <b>${arena.reviews.length}</b><i>·</i>${t.pending} <b>${total - arena.reviews.length}</b></span></div>
      <p class="arena-guide">${t.guide}</p>
      <form class="arena-tools" data-arena-tools hidden>
        <fieldset class="arena-scopes"><legend class="sr-only">${t.scope}</legend>${[['public',t.public,publicCount],['all',t.all,total]].map(([value,label,n]) => `<label><input type="radio" name="scope" value="${value}"${value==='public'?' checked':''}><span>${label} <b>${n}</b></span></label>`).join('')}</fieldset>
        <div class="arena-filters"><label class="arena-search"><span class="sr-only">${t.search}</span>${icon('search')}<input type="search" name="q" maxlength="160" placeholder="${t.search}" aria-controls="arena-body"></label>
        <label><span class="sr-only">${t.score}</span><select name="score" aria-controls="arena-body"><option value="">${t.anyScore}</option>
          <optgroup label="${t.minimum}">${selectOptions([9,8,7].map(n=>['min-'+n,t.above(n)]))}</optgroup>
          <optgroup label="${t.exact}">${selectOptions(scores.map(n=>[n,scoreText(n)]))}</optgroup>${selectOptions([['qualitative',t.qualitative],['pending','under view']])}</select></label>
        <label><span class="sr-only">${t.tier}</span><select name="tier" aria-controls="arena-body"><option value="">${t.anyTier}</option>${selectOptions(arena.tiers.map(b=>[b.tier,t.shortTier(b.tier)]))}</select></label>
        <label><span class="sr-only">${t.sort}</span><select name="sort" aria-controls="arena-body">${selectOptions([['rank',t.original],['newest',t.newest],['oldest',t.oldest]])}</select></label></div>
        <div class="arena-feedback"><output data-template="${t.showing}" aria-live="polite"></output><button class="text-button" type="reset" hidden>${t.reset}</button></div>
      </form>
      <noscript><p class="arena-guide">${locale === 'zh' ? '下表显示全部条目。启用 JavaScript 可筛选和排序。' : 'All entries appear below. Enable JavaScript to filter and sort.'}</p></noscript>
      <div class="arena-table-wrap"><table class="arena-board" role="table"><caption class="sr-only">${t.board}</caption><thead><tr>${[t.rank,t.work,t.score,t.tier,t.date].map(label=>`<th scope="col">${label}</th>`).join('')}</tr></thead>
        <tbody id="arena-body">${arena.rows.map(row=>boardRow(row,t,locale,basePath)).join('')}</tbody></table></div>
      <p data-arena-empty hidden>${t.empty}</p><p class="arena-date-note">${t.dateNote}</p>
    </section>${rubric(arena,t,locale)}</div></main>`;
}
