import React, { useState, useEffect } from "react";
import API from "./axios";
import "./LaporanPenjualan.css";

function LaporanPenjualan() {
  const [namaKantor, setNamaKantor] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);
  const [stokAktifKantor, setStokAktifKantor] = useState(0);
  const [loadingStok, setLoadingStok] = useState(false);

  // State tambahan untuk dropdown master kantor
  const [daftarKantor, setDaftarKantor] = useState([]);

  const [stokInputAdmin, setStokInputAdmin] = useState("");
  const [riwayat, setRiwayat] = useState([]);
  const [totalPendapatanServer, setTotalPendapatanServer] = useState(0);
  const [loadingRiwayat, setLoadingRiwayat] = useState(true);

  // State untuk Pagination (1-10)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State untuk Mode Pratinjau Cetak / PDF
  const [isPrintPreview, setIsPrintPreview] = useState(false);

  // State edit stok langsung (absolute)
  const [editStokMode, setEditStokMode] = useState(false);
  const [editStokValue, setEditStokValue] = useState("");

  // State edit riwayat
  const [editingItem, setEditingItem] = useState(null);
  const [editTanggal, setEditTanggal] = useState("");
  const [editJumlah, setEditJumlah] = useState("");
  const [editHarga, setEditHarga] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // ==============================
  // STATE PENGATURAN HARGA BERAS PUSAT
  // ==============================
  const STORAGE_HARGA_BERAS = "harga_standar_beras_pusat";
  const [inputHargaBaru, setInputHargaBaru] = useState(() => {
    return localStorage.getItem(STORAGE_HARGA_BERAS) || "62500";
  });

  // ==============================
  // AMBIL KANTOR ADMIN YANG SEDANG LOGIN & MASTER KANTOR
  // ==============================
  const fetchCurrentUser = async () => {
    try {
      setLoadingUser(true);
      const res = await API.get("/user");
      const defaultKantor = res.data.kantor || "";
      setNamaKantor(defaultKantor);
    } catch (err) {
      console.error(
        err.response?.data?.message || "Gagal mengambil data user login",
      );
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchMasterKantor = async () => {
    try {
      const res = await API.get("/kantor-cabang");
      const result = res.data.data ?? res.data;
      if (Array.isArray(result)) {
        const listNamaKantor = result
          .map((k) => k.nama_kantor || k.nama || k.kantor)
          .filter(Boolean);
        setDaftarKantor(listNamaKantor);
        // Jika namaKantor masih kosong, set ke pilihan pertama
        if (listNamaKantor.length > 0) {
          setNamaKantor((prev) => prev || listNamaKantor[0]);
        }
      }
    } catch (err) {
      console.error("Gagal mengambil master kantor:", err);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchMasterKantor();
  }, []);

  // ==============================
  // AMBIL STOK KANTOR AKTIF DARI SERVER
  // ==============================
  const fetchStokKantor = async (kantor) => {
    if (!kantor) return;
    try {
      setLoadingStok(true);
      const res = await API.get("/stok-beras", {
        params: { nama_kantor: kantor },
      });
      setStokAktifKantor(res.data.data?.sisa_stok || 0);
    } catch (err) {
      console.error(
        err.response?.data?.message || "Gagal mengambil stok kantor",
      );
    } finally {
      setLoadingStok(false);
    }
  };

  useEffect(() => {
    if (!namaKantor) return;
    fetchStokKantor(namaKantor);
    setEditStokMode(false);
    setEditStokValue("");
  }, [namaKantor]);

  // ==============================
  // AMBIL SEMUA RIWAYAT PENJUALAN
  // ==============================
  const fetchRiwayat = async () => {
    try {
      setLoadingRiwayat(true);
      const res = await API.get("/penjualan-beras");
      setRiwayat(res.data.data || []);
      setTotalPendapatanServer(res.data.total_pendapatan || 0);
    } catch (err) {
      console.error(
        err.response?.data?.message || "Gagal mengambil riwayat penjualan",
      );
    } finally {
      setLoadingRiwayat(false);
    }
  };

  useEffect(() => {
    fetchRiwayat();
  }, []);

  // Reset pagination ke halaman 1 jika data riwayat berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [riwayat.length]);

  // ==============================
  // SIMPAN GABUNGAN (STOK TAMBAHAN & HARGA)
  // ==============================
  const handleSimpanStok = async (e) => {
    e.preventDefault();

    if (inputHargaBaru !== "") {
      if (Number(inputHargaBaru) < 0) {
        alert("Harga standar tidak boleh kurang dari 0!");
        return;
      }
      localStorage.setItem(STORAGE_HARGA_BERAS, inputHargaBaru);
    }

    let stokBaru = stokAktifKantor;
    if (stokInputAdmin && Number(stokInputAdmin) > 0) {
      const ditambahkan = Number(stokInputAdmin);
      stokBaru = stokAktifKantor + ditambahkan;

      try {
        await API.post("/stok-beras/set-admin", {
          nama_kantor: namaKantor,
          jumlah_stok: stokBaru,
        });
        setStokAktifKantor(stokBaru);
        setStokInputAdmin("");
        fetchRiwayat();
      } catch (err) {
        console.error(err.response?.data);
        alert(err.response?.data?.message || "Gagal menyimpan stok kantor.");
        return;
      }
    }

    alert(
      `Data berhasil disimpan!\n\n` +
        `📦 Kantor: ${namaKantor}\n` +
        `📦 Stok Kantor: ${stokBaru} Sak\n` +
        `💰 Harga Standar: Rp${Number(inputHargaBaru || 62500).toLocaleString("id-ID")}`,
    );
  };

  // ==============================
  // EDIT STOK LANGSUNG & HARGA SEKALIGUS
  // ==============================
  const handleEditStok = () => {
    setEditStokValue(String(stokAktifKantor));
    setEditStokMode(true);
  };

  const handleSimpanPerubahanStok = async () => {
    if (editStokValue === "" || Number(editStokValue) < 0) {
      alert("Masukkan angka stok yang valid!");
      return;
    }

    if (inputHargaBaru !== "") {
      localStorage.setItem(STORAGE_HARGA_BERAS, inputHargaBaru);
    }

    const stokBaru = Number(editStokValue);

    try {
      await API.post("/stok-beras/set-admin", {
        nama_kantor: namaKantor,
        jumlah_stok: stokBaru,
      });

      setStokAktifKantor(stokBaru);
      alert(
        `Perubahan berhasil disimpan!\n\n` +
          `Stok ${namaKantor}: ${stokBaru} Sak\n` +
          `Harga Standar: Rp${Number(inputHargaBaru || 62500).toLocaleString("id-ID")}`,
      );
      setEditStokMode(false);
      setEditStokValue("");
      fetchRiwayat();
    } catch (err) {
      console.error(err.response?.data);
      alert(err.response?.data?.message || "Gagal mengubah stok kantor.");
    }
  };

  const handleBatalEditStok = () => {
    setEditStokMode(false);
    setEditStokValue("");
  };

  // ==============================
  // EDIT RIWAYAT PENJUALAN
  // ==============================
  const handleEdit = (item) => {
    setEditingItem(item);
    setEditTanggal(item.tanggal);
    setEditJumlah(item.terjual);
    setEditHarga(item.harga_per_sak);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      setSavingEdit(true);
      await API.put(`/penjualan-beras/${editingItem.id}`, {
        tanggal: editTanggal,
        terjual: Number(editJumlah),
        harga_per_sak: Number(editHarga),
      });

      alert("Data penjualan berhasil diperbarui!");
      setEditingItem(null);
      fetchRiwayat();
      fetchStokKantor(namaKantor);
    } catch (err) {
      if (err.response?.status === 400) {
        alert(err.response.data.message);
      } else if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        const firstError = Object.values(errors)[0][0];
        alert(firstError);
      } else {
        alert("Gagal menyimpan perubahan.");
      }
      console.error(err.response?.data);
    } finally {
      setSavingEdit(false);
    }
  };

  // ==============================
  // HAPUS RIWAYAT PENJUALAN
  // ==============================
  const handleHapus = async (id) => {
    if (
      !window.confirm("Apakah Anda yakin ingin menghapus data penjualan ini?")
    )
      return;

    try {
      await API.delete(`/penjualan-beras/${id}`);
      setRiwayat((prev) => prev.filter((item) => item.id !== id));
      fetchStokKantor(namaKantor);
      alert("Data transaksi berhasil dihapus dan stok telah dikembalikan!");
    } catch (err) {
      console.error(err.response?.data?.message);
      alert("Gagal menghapus data.");
    }
  };

  // ==============================
  // FUNGSI DOWNLOAD PDF OTOMATIS
  // ==============================
  const handleDownloadPDF = () => {
    const element = document.getElementById("pdf-report-content");
    if (!element) return;

    const executeDownload = () => {
      const opt = {
        margin: 10,
        filename: `Laporan-Penjualan-Beras-${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };
      window.html2pdf().from(element).set(opt).save();
    };

    if (window.html2pdf) {
      executeDownload();
    } else {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      script.onload = executeDownload;
      document.body.appendChild(script);
    }
  };

  // ==============================
  // FUNGSI PRINT LANGSUNG
  // ==============================
  const handlePrint = () => {
    const printContent =
      document.getElementById("pdf-report-content")?.innerHTML;
    if (!printContent) return;

    const printWindow = window.open("", "_blank", "width=900,height=650");
    if (!printWindow) {
      alert(
        "Mohon izinkan pop-up pada browser Cece Zia agar fitur cetak dapat berjalan.",
      );
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cetak Laporan Penjualan Beras</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #000; }
            h2 { text-align: center; margin-bottom: 5px; font-size: 20px; }
            p { text-align: center; color: #555; margin-bottom: 20px; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #333; padding: 8px 10px; font-size: 12px; text-align: left; }
            th { background-color: #f2f2f2; text-align: center; }
            .lp-summary-box { margin-bottom: 15px; font-size: 15px; font-weight: bold; }
            @media print {
              body { margin: 0; padding: 0; }
            }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 400);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // ==============================
  // PAGINATION LOGIC (1-10 per halaman)
  // ==============================
  const totalPages = Math.ceil(riwayat.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = riwayat.slice(indexOfFirstItem, indexOfLastItem);

  // ==============================
  // RENDER HALAMAN PRATINJAU CETAK / PDF
  // ==============================
  if (isPrintPreview) {
    return (
      <div
        style={{
          backgroundColor: "#f1f5f9",
          minHeight: "100vh",
          paddingBottom: "40px",
        }}
      >
        <div
          style={{
            backgroundColor: "#1e40af",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            marginBottom: "30px",
          }}
        >
          <button
            onClick={() => setIsPrintPreview(false)}
            style={{
              backgroundColor: "white",
              color: "#1e40af",
              border: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            ⬅️ Kembali ke Tabel
          </button>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleDownloadPDF}
              style={{
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "6px",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              Download PDF
            </button>
            <button
              onClick={handlePrint}
              style={{
                backgroundColor: "#f59e0b",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "6px",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              Print
            </button>
          </div>
        </div>

        <div
          id="pdf-report-content"
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            backgroundColor: "white",
            padding: "40px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            borderRadius: "8px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <h2
              style={{
                margin: "0 0 6px 0",
                fontSize: "22px",
                fontWeight: "bold",
              }}
            >
              Laporan Penjualan Beras
            </h2>
            <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
              Kelola alokasi stok per kantor oleh admin dan rekapitulasi
              penjualan
            </p>
          </div>

          <div className="lp-summary-box" style={{ marginBottom: "16px" }}>
            <span className="lp-summary-title">
              Total Pendapatan Keseluruhan:
            </span>
            <span className="lp-summary-value">
              Rp {totalPendapatanServer.toLocaleString("id-ID")}
            </span>
          </div>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "10px",
              fontSize: "13px",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#f8fafc",
                  borderBottom: "2px solid #cbd5e1",
                }}
              >
                <th
                  style={{
                    padding: "10px",
                    border: "1px solid #e2e8f0",
                    textAlign: "center",
                  }}
                >
                  NO
                </th>
                <th
                  style={{
                    padding: "10px",
                    border: "1px solid #e2e8f0",
                    textAlign: "center",
                  }}
                >
                  TANGGAL
                </th>
                <th
                  style={{
                    padding: "10px",
                    border: "1px solid #e2e8f0",
                    textAlign: "left",
                  }}
                >
                  KANTOR
                </th>
                <th
                  style={{
                    padding: "10px",
                    border: "1px solid #e2e8f0",
                    textAlign: "left",
                  }}
                >
                  PETUGAS
                </th>
                <th
                  style={{
                    padding: "10px",
                    border: "1px solid #e2e8f0",
                    textAlign: "center",
                  }}
                >
                  STOK (ADMIN)
                </th>
                <th
                  style={{
                    padding: "10px",
                    border: "1px solid #e2e8f0",
                    textAlign: "center",
                  }}
                >
                  TERJUAL
                </th>
                <th
                  style={{
                    padding: "10px",
                    border: "1px solid #e2e8f0",
                    textAlign: "center",
                  }}
                >
                  SISA STOK
                </th>
                <th
                  style={{
                    padding: "10px",
                    border: "1px solid #e2e8f0",
                    textAlign: "right",
                  }}
                >
                  TOTAL HARGA
                </th>
              </tr>
            </thead>
            <tbody>
              {riwayat.length > 0 ? (
                riwayat.map((item, index) => (
                  <tr key={item.id}>
                    <td
                      style={{
                        padding: "8px 10px",
                        border: "1px solid #e2e8f0",
                        textAlign: "center",
                      }}
                    >
                      {index + 1}
                    </td>
                    <td
                      style={{
                        padding: "8px 10px",
                        border: "1px solid #e2e8f0",
                        textAlign: "center",
                      }}
                    >
                      {item.tanggal}
                    </td>
                    <td
                      style={{
                        padding: "8px 10px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      {item.nama_kantor}
                    </td>
                    <td
                      style={{
                        padding: "8px 10px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      {item.petugas}
                    </td>
                    <td
                      style={{
                        padding: "8px 10px",
                        border: "1px solid #e2e8f0",
                        textAlign: "center",
                      }}
                    >
                      {item.stok_admin} Sak
                    </td>
                    <td
                      style={{
                        padding: "8px 10px",
                        border: "1px solid #e2e8f0",
                        textAlign: "center",
                      }}
                    >
                      {item.terjual} Sak
                    </td>
                    <td
                      style={{
                        padding: "8px 10px",
                        border: "1px solid #e2e8f0",
                        textAlign: "center",
                      }}
                    >
                      {item.sisa_stok} Sak
                    </td>
                    <td
                      style={{
                        padding: "8px 10px",
                        border: "1px solid #e2e8f0",
                        textAlign: "right",
                        fontWeight: "600",
                      }}
                    >
                      Rp {(item.total_harga || 0).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#64748b",
                    }}
                  >
                    Belum ada data laporan penjualan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="lp-container" style={{ paddingBottom: "80px" }}>
      <div
        className="lp-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <h1 className="lp-title">Laporan Penjualan Beras</h1>
          <p className="lp-subtitle">
            Kelola alokasi stok per kantor oleh admin dan rekapitulasi penjualan
          </p>
        </div>
        <button
          onClick={() => setIsPrintPreview(true)}
          className="lp-btn-cetak"
          style={{
            backgroundColor: "#0d9488",
            color: "white",
            border: "none",
            padding: "10px 16px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          📄 Pratinjau PDF / Cetak
        </button>
      </div>

      {/* FORM STOK ADMIN */}
      <div
        className="lp-card"
        style={{ marginBottom: "24px", padding: "24px" }}
      >
        <div style={{ marginBottom: "16px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1e293b" }}>
            Input Jatah Stok Berdasarkan Kantor (Admin)
          </h3>
          <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
            Tentukan jumlah alokasi stok beras untuk masing-masing kantor
            operasional.
          </p>
        </div>

        <form onSubmit={handleSimpanStok}>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {/* 1. NAMA KANTOR (KINI BERUPA DROPDOWN DINAMIS DARI DATABASE) */}
            <div className="pb-field-group">
              <label
                style={{
                  fontWeight: "500",
                  fontSize: "14px",
                  marginBottom: "6px",
                  display: "block",
                  color: "#334155",
                }}
              >
                Pilih Kantor Tujuan Alokasi
              </label>
              <select
                value={namaKantor}
                onChange={(e) => setNamaKantor(e.target.value)}
                className="lp-search-input"
                style={{
                  margin: "0",
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                  fontWeight: "600",
                  color: "#1e293b",
                  boxSizing: "border-box",
                }}
                required
              >
                <option value="" disabled>
                  -- Pilih Kantor --
                </option>
                {daftarKantor.length > 0 ? (
                  daftarKantor.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))
                ) : (
                  <option value={namaKantor}>
                    {namaKantor || "Memuat kantor..."}
                  </option>
                )}
              </select>
            </div>

            {/* 2. HARGA STANDAR BERAS */}
            <div className="pb-field-group">
              <label
                style={{
                  fontWeight: "500",
                  fontSize: "14px",
                  marginBottom: "6px",
                  display: "block",
                  color: editStokMode ? "#0d9488" : "#334155",
                }}
              >
                Harga Standar Beras per Sak (Rp) {editStokMode && "(Edit)"}
              </label>

              {editStokMode && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "#0d9488",
                    marginBottom: "8px",
                    fontWeight: "500",
                  }}
                >
                  ✏️ Silakan ubah harga standar di kolom ini
                </div>
              )}

              <input
                type="number"
                value={inputHargaBaru}
                onChange={(e) => setInputHargaBaru(e.target.value)}
                className="lp-search-input"
                style={{
                  margin: "0",
                  width: "100%",
                  padding: "12px",
                  borderRadius: "6px",
                  border: editStokMode
                    ? "2px solid #0d9488"
                    : "1px solid #cbd5e1",
                  background: editStokMode ? "#f0fdfa" : "white",
                  fontWeight: "bold",
                  color: "#0d9488",
                  boxSizing: "border-box",
                  outline: "none",
                }}
                min="0"
              />
            </div>

            {/* 3. STOK SEKARANG */}
            <div className="pb-field-group">
              <label
                style={{
                  fontWeight: "500",
                  fontSize: "14px",
                  marginBottom: "6px",
                  display: "block",
                  color: editStokMode ? "#0d9488" : "#334155",
                }}
              >
                Stok Sekarang {editStokMode && "(Edit)"}
              </label>

              {editStokMode && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "#0d9488",
                    marginBottom: "8px",
                    fontWeight: "500",
                  }}
                >
                  ✏️ Silakan ubah jumlah stok di kolom ini
                </div>
              )}

              <input
                type="number"
                value={
                  editStokMode
                    ? editStokValue
                    : loadingStok
                      ? ""
                      : stokAktifKantor
                }
                placeholder={loadingStok ? "Memuat..." : ""}
                onChange={(e) => {
                  if (editStokMode) setEditStokValue(e.target.value);
                }}
                disabled={!editStokMode}
                min="0"
                className="lp-search-input"
                style={{
                  margin: "0",
                  width: "100%",
                  padding: "12px",
                  borderRadius: "6px",
                  border: editStokMode
                    ? "2px solid #0d9488"
                    : "1px solid #cbd5e1",
                  background: editStokMode ? "#f0fdfa" : "#f8fafc",
                  fontWeight: "bold",
                  color: "#0d9488",
                  boxSizing: "border-box",
                  cursor: editStokMode ? "text" : "not-allowed",
                  outline: "none",
                }}
              />
            </div>

            {/* 4. JUMLAH STOK DITAMBAHKAN */}
            {!editStokMode && (
              <div className="pb-field-group">
                <label
                  style={{
                    fontWeight: "500",
                    fontSize: "14px",
                    marginBottom: "6px",
                    display: "block",
                    color: "#334155",
                  }}
                >
                  Jumlah Stok Diberikan (Sak)
                </label>
                <input
                  type="number"
                  placeholder="Masukkan jumlah stok tambahan"
                  value={stokInputAdmin}
                  onChange={(e) => setStokInputAdmin(e.target.value)}
                  className="lp-search-input"
                  style={{
                    margin: "0",
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    boxSizing: "border-box",
                  }}
                  min="0"
                />
              </div>
            )}
          </div>

          <div
            style={{
              marginTop: "20px",
              display: "flex",
              gap: "10px",
              alignItems: "center",
            }}
          >
            {!editStokMode ? (
              <>
                <button
                  type="submit"
                  style={{
                    background: "#0d9488",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "6px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Simpan Stok & Harga
                </button>

                <button
                  type="button"
                  onClick={handleEditStok}
                  style={{
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "6px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  ✏️ Edit
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSimpanPerubahanStok}
                  style={{
                    background: "#0d9488",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "6px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Simpan Perubahan
                </button>

                <button
                  type="button"
                  onClick={handleBatalEditStok}
                  style={{
                    background: "#cbd5e1",
                    color: "#334155",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "6px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
              </>
            )}
          </div>
        </form>
      </div>

      {/* TABEL REKAP DENGAN PAGINATION (1-10) */}
      <div className="lp-card" style={{ padding: "24px" }}>
        <div className="lp-summary-box" style={{ marginBottom: "16px" }}>
          <span className="lp-summary-title">
            Total Pendapatan Keseluruhan:
          </span>
          <span className="lp-summary-value">
            Rp {totalPendapatanServer.toLocaleString("id-ID")}
          </span>
        </div>

        <div className="lp-table-responsive">
          <table className="lp-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Kantor</th>
                <th>Petugas</th>
                <th>Stok (Admin)</th>
                <th>Terjual</th>
                <th>Sisa Stok</th>
                <th>Total Harga</th>
                <th style={{ textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loadingRiwayat ? (
                <tr>
                  <td
                    colSpan="9"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    Memuat data...
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((item, index) => (
                  <tr key={item.id}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>{item.tanggal}</td>
                    <td>
                      <span className="lp-badge-kantor">
                        {item.nama_kantor}
                      </span>
                    </td>
                    <td>{item.petugas}</td>
                    <td>
                      <span style={{ fontWeight: "600", color: "#0d9488" }}>
                        {item.stok_admin} Sak
                      </span>
                    </td>
                    <td>{item.terjual} Sak</td>
                    <td>
                      <span style={{ fontWeight: "600", color: "#2563eb" }}>
                        {item.sisa_stok} Sak
                      </span>
                    </td>
                    <td style={{ fontWeight: "600", color: "#0d9488" }}>
                      Rp {(item.total_harga || 0).toLocaleString("id-ID")}
                    </td>
                    <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        style={{
                          backgroundColor: "#eff6ff",
                          color: "#1d4ed8",
                          border: "none",
                          padding: "5px 10px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          cursor: "pointer",
                          fontWeight: "600",
                          marginRight: "6px",
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleHapus(item.id)}
                        style={{
                          backgroundColor: "#fee2e2",
                          color: "#991b1b",
                          border: "none",
                          padding: "5px 10px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        🗑️ Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="9"
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#64748b",
                    }}
                  >
                    Belum ada data laporan penjualan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "20px",
              paddingTop: "12px",
              borderTop: "1px solid #e2e8f0",
            }}
          >
            <div style={{ fontSize: "13px", color: "#64748b" }}>
              Menampilkan {indexOfFirstItem + 1} -{" "}
              {Math.min(indexOfLastItem, riwayat.length)} dari {riwayat.length}{" "}
              data
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  background: currentPage === 1 ? "#f1f5f9" : "#ffffff",
                  color: currentPage === 1 ? "#94a3b8" : "#334155",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Sebelumnya
              </button>

              <span
                style={{
                  padding: "6px 12px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#334155",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                Hal. {currentPage} dari {totalPages}
              </span>

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  background:
                    currentPage === totalPages ? "#f1f5f9" : "#ffffff",
                  color: currentPage === totalPages ? "#94a3b8" : "#334155",
                  cursor:
                    currentPage === totalPages ? "not-allowed" : "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL EDIT RIWAYAT PENJUALAN */}
      {editingItem && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "12px",
              width: "400px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h3 style={{ marginBottom: "16px" }}>Edit Data Penjualan</h3>
            <p
              style={{
                fontSize: "12px",
                color: "#94a3b8",
                marginBottom: "16px",
              }}
            >
              Kantor: <strong>{editingItem.nama_kantor}</strong> (tidak dapat
              diubah)
            </p>
            <form onSubmit={handleSaveEdit}>
              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#64748b",
                    marginBottom: "4px",
                  }}
                >
                  TANGGAL
                </label>
                <input
                  type="date"
                  value={editTanggal}
                  onChange={(e) => setEditTanggal(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    boxSizing: "border-box",
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#64748b",
                    marginBottom: "4px",
                  }}
                >
                  JUMLAH TERJUAL (SAK)
                </label>
                <input
                  type="number"
                  value={editJumlah}
                  onChange={(e) => setEditJumlah(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    boxSizing: "border-box",
                  }}
                  min="1"
                  required
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#64748b",
                    marginBottom: "4px",
                  }}
                >
                  HARGA PER SAK
                </label>
                <input
                  type="number"
                  value={editHarga}
                  onChange={(e) => setEditHarga(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    boxSizing: "border-box",
                  }}
                  min="0"
                  required
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  style={{
                    padding: "8px 14px",
                    backgroundColor: "#cbd5e1",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#0d9488",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  {savingEdit ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LaporanPenjualan;
