# rnk-quotes

Risale-i Nur'dan Vecizeler uygulamasının **vecize verisi**. Uygulama bu repodaki
`quotes.json` dosyasını çalışma anında okur; yeni vecizeler için mağaza
güncellemesi gerekmez.

## Dosyalar

| Dosya | Açıklama |
|---|---|
| `quotes.json` | Tüm kategoriler ve vecizeler |
| `version.json` | Uygulamanın önce kontrol ettiği küçük sürüm dosyası |
| `scripts/validate.mjs` | JSON doğrulama betiği |
| `scripts/check-version-bump.mjs` | İçerik değiştiyse sürümün arttığını kontrol eder |

GitHub Action her push'ta hem JSON'u doğrular hem de içerik değiştiği halde
`version` artırılmadıysa push'u kırmızıya düşürür.

## Yeni vecize ekleme

1. `quotes.json` içinde ilgili kategorinin `quotes` dizisine yeni bir nesne ekle:

```json
{
  "id": "50-385",
  "text": "Vecize metni...",
  "source": "Kitap, Bölüm"
}
```

2. **ID'yi asla değiştirme veya yeniden numaralandırma.** Favoriler ve ezber
   ilerlemesi ID ile tutulur.
3. `quotes.json` içindeki `version` alanını 1 artır.
4. `version.json` içindeki `version` alanını da aynı değere getir.
5. `updatedAt` alanlarını ISO tarih ile güncelle.

```json
{
  "version": 2,
  "updatedAt": "2026-10-24T09:00:00.000Z"
}
```

6. Push et. GitHub Action veriyi doğrular. Hatalıysa kırmızı çıkar ve uygulamaya
   bozuk veri gitmez.

## Doğrulama

```bash
node scripts/validate.mjs
```

## Uygulama tarafı

- Açılışta ve aşağı çekildiğinde `version.json` kontrol edilir.
- Yeni sürüm varsa `quotes.json` indirilir, doğrulanır ve cihazda önbelleğe alınır.
- İnternet yoksa uygulama son çalışan veriyle devam eder.
- Build alınırken bu repodaki en güncel veri uygulamanın içine gömülür.

## Sürüm notu

`version` **monoton artan bir tamsayı** olmalıdır. Geri alma (rollback)
gerekiyorsa sürümü küçültmek yerine içeriği düzeltip sürümü artırın; aksi halde
mevcut kullanıcılar eski veriye dönmez.
