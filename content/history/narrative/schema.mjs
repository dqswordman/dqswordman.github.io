import { fullOutline } from '../full-outline.mjs';
import { d as pairedSection } from '../full-schema.mjs';
export const d = (zh, en, bodyZh, bodyEn, refs) => {
  if (!Array.isArray(refs) || !refs.length || refs.some(id => typeof id !== 'string')) {
    throw new Error(`Narrative section has missing source references: ${zh}`);
  }
  const section = pairedSection(zh, en,
    Array.isArray(bodyZh) ? bodyZh.join('\n\n') : bodyZh,
    Array.isArray(bodyEn) ? bodyEn.join('\n\n') : bodyEn, refs);
  if (section.zh.paragraphs.length < 4 || section.en.paragraphs.length < 4) {
    throw new Error(`Narrative section has an incomplete language: ${zh}`);
  }
  return section;
};
export function chapter(id, titleZh, titleEn, summaryZh, summaryEn, sections) {
  const outline=fullOutline.find(item=>item.id===id);
  if(!outline)throw new Error('Missing chapter outline: '+id);
  return {...outline,title:{zh:titleZh,en:titleEn},summary:{zh:summaryZh,en:summaryEn},sections};
}
