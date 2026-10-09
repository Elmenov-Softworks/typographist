# Bundled rule ordering

Rules run by ascending numeric priority. The complete bundle uses one reference-ID
list to order equal-priority builtin rules. Shared consumer rules follow the bundle,
then locale-owned rules; equal-priority consumer rules retain registration order.
Hyphenation runs after symbolic rules.

`bundled-text-rules.factory.spec.ts` checks every equal-priority group against the
107-rule inventory and verifies observable quote/punctuation and consumer ordering.
Removed cleanup handlers do not participate in this ordering.
