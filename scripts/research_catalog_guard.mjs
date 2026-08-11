import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function fail(message) {
    console.error(`research_catalog_guard: FAIL: ${message}`);
    process.exit(1);
}

function assert(condition, message) {
    if (!condition) fail(message);
}

const dataPath = resolve('src/data/research.json');
const data = JSON.parse(readFileSync(dataPath, 'utf8'));

assert(data.schemaVersion === 'active-mirror-research/v1', 'unexpected schema version');
assert(data.snapshot?.exactCreator === 'Desai, Paul', 'exact Zenodo creator binding changed');
assert(data.snapshot?.recordCount === data.publications?.length, 'record count does not match publication list');
assert(data.publications.length === 8, 'expected the checked 2026-08-11 Zenodo snapshot of 8 records');
assert(new Set(data.publications.map((paper) => paper.id)).size === data.publications.length, 'duplicate Zenodo record id');
assert(new Set(data.publications.map((paper) => paper.doi)).size === data.publications.length, 'duplicate DOI');

for (const paper of data.publications) {
    assert(/^10\.5281\/zenodo\.\d+$/.test(paper.doi), `invalid DOI for record ${paper.id}`);
    assert(paper.recordUrl === `https://zenodo.org/records/${paper.id}`, `record URL mismatch for ${paper.id}`);
    assert(Array.isArray(paper.authors) && paper.authors.includes('Desai, Paul'), `creator missing for ${paper.id}`);
    assert(['Preprint', 'Correction'].includes(paper.type), `unsupported publication type for ${paper.id}`);
}

assert(data.featured?.slug === 'electric-mind', 'featured thesis slug changed');
assert(/^[a-f0-9]{64}$/.test(data.featured.sha256), 'featured PDF SHA-256 is malformed');
assert(data.featured.notice.toLowerCase().includes('not professional'), 'featured thesis boundary is missing');
assert(data.ledger?.links?.publisher === 'https://github.com/MirrorDNA-Reflection-Protocol/mirrorpublish', 'publisher link drifted');

if (process.argv.includes('--built')) {
    const collectionPath = resolve('dist/research/index.html');
    const featuredPath = resolve('dist/research/electric-mind/index.html');
    assert(existsSync(collectionPath), 'static collection page was not generated');
    assert(existsSync(featuredPath), 'static featured thesis page was not generated');

    const collection = readFileSync(collectionPath, 'utf8');
    const featured = readFileSync(featuredPath, 'utf8');
    assert(collection.includes('<link rel="canonical" href="https://activemirror.ai/research/"'), 'collection canonical is missing');
    assert(collection.includes('10.5281/zenodo.18910362'), 'collection does not contain the current DOI archive');
    assert(featured.includes('name="citation_pdf_url"'), 'featured paper lacks citation PDF metadata');
    assert(featured.includes('name="citation_date" content="2026-08-11"'), 'featured paper citation date is missing');
    assert(featured.includes('PDF SHA-256 d267603ef53ce67f46b8c37baa803e912e93ae45f004c9d76dc99e05aa6b7286'), 'featured paper digest is missing');
}

console.log(`research_catalog_guard: PASS (${data.publications.length} Zenodo records; built=${process.argv.includes('--built')})`);
