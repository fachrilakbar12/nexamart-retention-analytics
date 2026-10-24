# NexaMart - Customer Retention & RFM Churn Analytics

Aplikasi web analitik data interaktif yang membedah retensi pelanggan berbasis kohor bulanan dan segmentasi nilai pelanggan (RFM) untuk platform e-commerce multi-kategori, dilengkapi Executive BI Dashboard, Data Explorer, serta Churn Revenue Simulator.

---

## Ringkasan Masalah Bisnis
Kenaikan biaya iklan digital (Customer Acquisition Cost / CAC) menuntut NexaMart untuk mengalihkan strategi dari sekadar akuisisi pengguna baru ke pemaksimalan nilai retensi pengguna lama (Customer Retention). Proyek ini dibangun untuk:
* Mengidentifikasi titik penurunan transaksi terbesar pelanggan (drop-off) setelah pembelian perdana.
* Memetakan segmentasi pelanggan menggunakan metodologi RFM (Recency, Frequency, Monetary).
* Mengukur efektivitas kanal pemasaran (Meta Ads, Google Search, Organic, Influencer) terhadap retensi dan risiko churn.

---

## Struktur Berkas Proyek
Proyek ini dibangun secara modular dan terstruktur:

```text
projek-portofolio/
├── index.html                  # Kerangka antarmuka, tata letak grid, tabel data, dan kontainer diagram
├── css/
│   └── style.css               # Penataan gaya visual, desain komponen antarmuka, scrollbar, dan animasi
├── js/
│   ├── tailwind-config.js      # Konfigurasi kustom tema Tailwind CSS
│   ├── data.js                 # Dataset pelanggan (60 records RFM) & matriks retensi kohor bulanan
│   └── app.js                  # Logika interaktif: perhitungan RFM, pemfilteran dinamis, matriks kohor, Chart.js, simulator
└── README.md                   # Dokumentasi teknis dan bisnis proyek
```

---

## Fitur Utama Web Dashboard
* Executive BI Dashboard: Kartu metrik KPI dinamis (Total Revenue, LTV, M5 Retention, Churn Risk) yang tersinkronisasi otomatis dengan kontrol filter multi-parameter.
* Monthly Cohort Heatmap Matrix: Visualisasi retensi kohor (Bulan 0 hingga Bulan 5) dengan intensitas warna gradasi dinamis berbasis kalkulasi JavaScript.
* Interactive Data Explorer: Tabel eksplorasi transaksi pelanggan lengkap dengan pencarian waktu nyata, filter segmen, pengurutan kolom, paginasi, dan ekspor data langsung ke format CSV.
* ROI & Churn Reduction Simulator: Fitur interaktif untuk memperkirakan potensi penyelamatan omzet bisnis jika target penurunan churn tercapai menggunakan kalkulasi matematis dinamis.
* Technical Code Inspector: Cuplikan kueri SQL jendela (NTILE(5)) dan skrip Python Pandas untuk proses pembentukan kohor.

---

## Temuan Utama Analisis
* Titik Kritis Retensi di Bulan ke-1 (M1): Penurunan retensi paling tajam terjadi pada bulan pertama setelah registrasi (rata-rata turun dari 100% ke rentang 42% hingga 51%), menandakan pentingnya optimalisasi alur orientasi (onboarding) pelanggan baru.
* Kanal Organik Memiliki Retensi Tertinggi: Pengguna dari saluran organik menghasilkan retensi bulan ke-5 (M5) sebesar 38,5% dengan risiko churn paling rendah (18,2%) dibanding kanal iklan berbayar.
* Kontribusi Segmen Champions: Sebanyak 28% pelanggan kategori Champions menyumbang lebih dari 45% total perputaran omzet bisnis.

---

## Rekomendasi Strategi Bisnis
* Automasi Kampanye Re-Engagement di Hari ke-20 hingga 25: Mengirimkan voucer personalisasi sebelum pelanggan memasuki masa henti transaksi bulan pertama.
* Program Loyalitas Eksklusif untuk Segmen Champions: Memberikan fasilitas pengiriman gratis prioritas untuk mempertahankan nilai Average Order Value (AOV).
* Efisiensi Alokasi Biaya Pemasaran: Mengalihkan sebagian anggaran Meta Ads ke kampanye optimasi mesin pencari (SEO) dan konten organik untuk meningkatkan CLV jangka panjang.

---

## Teknologi yang Digunakan
* Frontend Markup: HTML5
* Styling dan Layout: CSS3, Tailwind CSS
* Logika Interaktif: Vanilla JavaScript (ES6+ manipulasi DOM, pemfilteran dinamis, manajemen status antarmuka)
* Visualisasi Data: Chart.js, HTML5 Canvas
* Alat Pipeline Analitik: SQL (PostgreSQL Window Functions), Python (Pandas)

