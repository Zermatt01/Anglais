/**
 * `npm run sync:shared`: copies shared/ai into supabase/functions/_shared/ai
 * (D-061). Run it after any change in shared/ai; a test fails otherwise.
 */
import { COPY_DIR, SOURCE_DIR, writeCopy } from './shared-copy.ts';

writeCopy(process.cwd());
console.log(`${SOURCE_DIR} copied to ${COPY_DIR}.`);
