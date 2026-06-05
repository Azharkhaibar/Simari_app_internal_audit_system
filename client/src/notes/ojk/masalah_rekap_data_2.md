❌ YANG BELUM TERPENUHI / MASALAH:
1. Frontend expect response berupa ARRAY LANGSUNG

Lihat dari frontend:

javascript
// Frontend expect response ARRAY, bukan object
const json = await response.json();
const data = json.map((item) => { ... }); // <-- json adalah array!
Jadi response backend harus array of CategorySummaryDto, bukan object dengan property categories.

2. Entity tidak punya field nama untuk CategorySummaryDto

Frontend butuh:

javascript
nama: item.nama  // "Operasional", "Pasar Produk", dll
Entity kamu hanya punya nama tabel, tidak ada field nama. Jadi harus di-mapping manual.

3. Perhitungan di Frontend membutuhkan data dari entity yang kamu punya, tapi...

Frontend kamu menghitung matrixValue, inherentIndicator, kpmrIndicator, dll di sisi frontend (lihat rekap-data-2.jsx). Jadi backend hanya perlu kirim inherentSummary dan kpmrSummary dalam bentuk array.

4. RiskIndicatorDto tidak punya field value

Frontend getMatrixIndicator return object dengan value:

javascript
return { label: 'Low', color: '#2ECC71', value: matrixValue, score: 1 };
Tapi RiskIndicatorDto tidak punya field value.