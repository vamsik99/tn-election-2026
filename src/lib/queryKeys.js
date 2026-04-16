export const queryKeys = {
  districts: () => ['districts'],
  constituencies: (filters) => ['constituencies', filters],
  constituency: (slug) => ['constituency', slug],
  parties: (filters) => ['parties', filters],
  party: (slug) => ['party', slug],
  candidate: (slug) => ['candidate', slug],
  candidates: (filters) => ['candidates', filters],
  search: (q) => ['search', q],
}
