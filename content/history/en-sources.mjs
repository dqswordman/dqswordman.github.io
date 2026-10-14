export function englishSource(source) {
  if (!source.en?.title || !source.en?.publisher || !source.en?.type || !source.en?.note) {
    throw new Error(`Missing English source metadata: ${source.id}`);
  }
  const { en, ...metadata } = source;
  return { ...metadata, ...en };
}
