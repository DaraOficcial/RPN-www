# 🎹 KMP Nusantara v1.2 (Desktop Edition)
**Advanced Audio Sampler Engine powered by SDL3**

![Version](https://img.shields.io/badge/version-1.2.0--stable-cyan)
![Platform](https://img.shields.io/badge/platform-Windows-blue)
![Engine](https://img.shields.io/badge/engine-SDL3--C%2B%2B-gold)

**KMP (Key Multi Player) Nusantara** adalah software sampler audio berperforma tinggi yang dirancang untuk stabilitas maksimal dan latensi rendah. Menggunakan core engine C++ dan SDL3, software ini memungkinkan pemicuan sample audio secara real-time dengan manajemen memori yang efisien.

---

## 🚀 Fitur Utama v1.2
*   **Low-Latency Performance:** Respon audio instan (< 5ms) untuk kebutuhan live performance.
*   **Dynamic Resampling:** Otomatis menyesuaikan sample rate WAV ke hardware output.
*   **Polyphonic Engine:** Mendukung banyak suara sekaligus tanpa distorsi.
*   **NFS (New Folder System):** Berpindah folder sample secara dinamis tanpa restart aplikasi.

---

## 📂 Struktur Folder
Agar aplikasi berjalan lancar, pastikan struktur folder Anda seperti berikut:
```text
KMP_Nusantara/
├── KMP_Nusantara.exe
├── SDL3.dll
├── SDL3_ttf.dll
├── README_PANDUAN.html
├── README.md
└── Samples/
    ├── A.wav
    ├── S.wav
    ├── D.wav
    └── [File WAV lainnya...]