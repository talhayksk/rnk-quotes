#!/usr/bin/env node
/**
 * rnk-quotes veri doğrulama betiği.
 * Hem yerelde hem GitHub Actions içinde çalışır.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];

function readJson(file) {
    try {
        return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
    } catch (error) {
        errors.push(`${file} okunamadı: ${error.message}`);
        return null;
    }
}

const versionDoc = readJson('version.json');
const payload = readJson('quotes.json');

if (versionDoc) {
    if (!Number.isInteger(versionDoc.version) || versionDoc.version < 1) {
        errors.push('version.json: version pozitif bir tamsayı olmalı');
    }
    if (!versionDoc.updatedAt || Number.isNaN(Date.parse(versionDoc.updatedAt))) {
        errors.push('version.json: updatedAt geçerli bir ISO tarih olmalı');
    }
}

if (payload) {
    if (!Number.isInteger(payload.version) || payload.version < 1) {
        errors.push('quotes.json: version pozitif bir tamsayı olmalı');
    }
    if (payload.schemaVersion !== 1) {
        errors.push('quotes.json: schemaVersion 1 olmalı');
    }
    if (!payload.updatedAt || Number.isNaN(Date.parse(payload.updatedAt))) {
        errors.push('quotes.json: updatedAt geçerli bir ISO tarih olmalı');
    }
    if (!Array.isArray(payload.categories) || payload.categories.length === 0) {
        errors.push('quotes.json: categories boş olamaz');
    }

    if (versionDoc && payload.version !== versionDoc.version) {
        errors.push(
            `Sürüm uyuşmuyor: quotes.json=${payload.version}, version.json=${versionDoc.version}`,
        );
    }

    const categoryIds = new Set();
    const quoteIds = new Set();
    let quoteCount = 0;

    for (const category of payload.categories ?? []) {
        if (!category || typeof category !== 'object') {
            errors.push('Geçersiz kategori nesnesi');
            continue;
        }
        if (typeof category.id !== 'string' || !category.id.trim()) {
            errors.push('Kategori id boş olamaz');
        } else if (categoryIds.has(category.id)) {
            errors.push(`Tekrarlanan kategori id: ${category.id}`);
        } else {
            categoryIds.add(category.id);
        }

        if (typeof category.title !== 'string' || !category.title.trim()) {
            errors.push(`Kategori başlığı boş: ${category.id}`);
        }
        if (!Array.isArray(category.quotes) || category.quotes.length === 0) {
            errors.push(`Kategori vecizesiz: ${category.id}`);
            continue;
        }

        for (const quote of category.quotes) {
            if (!quote || typeof quote !== 'object') {
                errors.push(`Geçersiz vecize nesnesi: ${category.id}`);
                continue;
            }
            if (typeof quote.id !== 'string' || !quote.id.trim()) {
                errors.push(`Vecize id boş: ${category.id}`);
            } else if (quoteIds.has(quote.id)) {
                errors.push(`Tekrarlanan vecize id: ${quote.id}`);
            } else {
                quoteIds.add(quote.id);
            }
            if (typeof quote.text !== 'string' || !quote.text.trim()) {
                errors.push(`Vecize metni boş: ${quote.id}`);
            }
            if (typeof quote.source !== 'string') {
                errors.push(`Vecize kaynağı metin değil: ${quote.id}`);
            } else if (!quote.source.trim()) {
                warnings.push(`Vecize kaynağı boş: ${quote.id}`);
            }
            quoteCount += 1;
        }
    }

    console.log(`Kategori: ${payload.categories?.length ?? 0}`);
    console.log(`Vecize: ${quoteCount}`);
    console.log(`Sürüm: ${payload.version}`);
}

for (const warning of warnings) console.warn(`Uyarı: ${warning}`);

if (errors.length > 0) {
    for (const error of errors) console.error(`Hata: ${error}`);
    process.exit(1);
}

console.log('Veri doğrulaması başarılı.');
