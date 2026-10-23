#!/usr/bin/env node
/**
 * İçerik değiştiyse `version` alanının artırıldığını kontrol eder.
 * GitHub Actions push olayında önceki commit SHA'sı ile çağrılır.
 */
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const before = process.argv[2];

if (!before || /^0+$/.test(before)) {
    console.log('İlk push: sürüm kontrolü atlandı.');
    process.exit(0);
}

function readAt(rev) {
    try {
        return JSON.parse(
            execFileSync('git', ['show', `${rev}:quotes.json`], { encoding: 'utf8' }),
        );
    } catch {
        return null;
    }
}

const previous = readAt(before);
const current = JSON.parse(fs.readFileSync('quotes.json', 'utf8'));

if (!previous) {
    console.log('Önceki quotes.json bulunamadı: sürüm kontrolü atlandı.');
    process.exit(0);
}

const contentChanged =
    JSON.stringify(previous.categories) !== JSON.stringify(current.categories);

if (contentChanged && current.version <= previous.version) {
    console.error(
        `Hata: İçerik değişmiş ama sürüm artırılmamış ` +
        `(önceki v${previous.version}, şimdi v${current.version}).`,
    );
    console.error('quotes.json ve version.json içindeki version alanını 1 artırın.');
    process.exit(1);
}

console.log(
    contentChanged
        ? `Sürüm artırılmış: v${previous.version} → v${current.version}`
        : 'İçerik değişmemiş.',
);
