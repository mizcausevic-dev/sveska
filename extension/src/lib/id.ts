/**
 * ID generator — thin wrapper over `crypto.randomUUID`, the SAME primitive
 * the PWA uses (see ../../../src/notes/noteRepo.ts:12 for note ids and
 * ../../../src/notes/attachmentRepo.ts:48 for attachment ids). Web Crypto
 * is available in both the side-panel page context and MV3 service
 * workers, so no polyfill or npm dependency is needed.
 *
 * Why a wrapper instead of inlining `crypto.randomUUID()` at call sites?
 * A future sync layer or test seam may want to override the generator
 * (e.g. deterministic ids for e2e tests). One import site keeps that
 * refactor local.
 */
export function newNoteId(): string {
  return crypto.randomUUID();
}
