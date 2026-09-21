import React, { useState, useEffect } from "react";
import API from "./axios";
import "./RiwayatMaterai.css";

function RiwayatMaterai({ userActive }) {
  const [listOrder, setListOrder] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const [kantorFilter, setKantorFilter] = useState("Semua Kantor");
  const [sesiFilter, setSesiFilter] = useState("Semua");
  const [tanggalFilter, setTanggalFilter] = useState("");

  // State daftar kantor master dari backend (/kantor-cabang)
  const [daftarKantor, setDaftarKantor] = useState([]);

  // State untuk Mode Pratinjau Halaman Cetak/PDF
  const [isPrintPreview, setIsPrintPreview] = useState(false);

  // State untuk Pengaturan Harga Satuan dari Backend
  const [hargaSatuanMaster, setHargaSatuanMaster] = useState(10000);

  // State untuk Modal Edit
  const [editingItem, setEditingItem] = useState(null);
  const [editKeping, setEditKeping] = useState("");
  const [editSesi, setEditSesi] = useState("");
  const [editKantor, setEditKantor] = useState("");
  const [editHarga, setEditHarga] = useState(10000);

  // State tambahan untuk Pagination (10 data per halaman)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Perbaikan: Ambil role secara aman dan toleran terhadap huruf kapital/kecil
  const userRole = (currentUser?.role || userActive?.role || "").toLowerCase();
  const isAdmin = ["admin", "superadmin"].includes(userRole);
  const userKantor = currentUser?.kantor || userActive?.kantor || "";

  const fetchCurrentUser = async () => {
    try {
      const res = await API.get("/user");
      setCurrentUser(res.data);
    } catch (err) {
      console.error("Gagal mengambil data user login", err);
    }
  };

  // Ambil master daftar kantor agar sinkron dengan Kelola Kantor
  const fetchMasterKantor = async () => {
    try {
      const res = await API.get("/kantor-cabang");
      const result = res.data.data ?? res.data;
      if (Array.isArray(result)) {
        const listNamaKantor = result
          .map((k) => k.nama_kantor || k.nama || k.kantor)
          .filter(Boolean);
        setDaftarKantor(listNamaKantor);
      }
    } catch (err) {
      console.error("Gagal mengambil master kantor:", err);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchMasterKantor();
  }, []);

  useEffect(() => {
    if (!isAdmin && userKantor) {
      setKantorFilter(userKantor);
    }
  }, [isAdmin, userKantor]);

  // ==============================
  // AMBIL DATA & HARGA MASTER DARI BACKEND
  // ==============================
  const fetchHargaMaster = async () => {
    try {
      const res = await API.get("/harga-materai");
      if (res.data && res.data.harga) {
        setHargaSatuanMaster(Number(res.data.harga));
      }
    } catch (err) {
      console.error("Gagal mengambil harga master materai:", err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      await fetchHargaMaster();
      const res = await API.get("/order-materai");
      setListOrder(res.data.data ?? res.data);
    } catch (err) {
      console.error(
        err.response?.data?.message || "Gagal mengambil data riwayat materai",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fungsi simpan harga master ke backend via API POST /harga-materai
  const handleSimpanHargaMaster = async () => {
    try {
      const res = await API.post("/harga-materai", {
        harga: Number(hargaSatuanMaster),
      });
      alert(
        res.data.message ||
          `Harga satuan master berhasil disimpan ke Rp ${Number(hargaSatuanMaster).toLocaleString("id-ID")}!`,
      );
      fetchData();
    } catch (err) {
      console.error("Gagal menyimpan harga master:", err.response || err);
      alert("Gagal menyimpan harga master ke server.");
    }
  };

  // Membuka Modal Edit dan mengisi data awal
  const handleEdit = (item) => {
    setEditingItem(item);
    setEditKeping(item.jumlah_keping);
    setEditSesi(item.sesi_order || "Pagi");
    setEditKantor(item.kantor_pos || item.nama_kantor || "");
    setEditHarga(
      Number(item.nominal_meterai || item.harga || hargaSatuanMaster),
    );
  };

  // Menyimpan Perubahan Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const totalNilaiBaru = Number(editKeping) * Number(editHarga);
      await API.put(`/order-materai/${editingItem.id}`, {
        tanggal: editingItem.tanggal, // Wajib dikirim agar lolos validasi backend
        jumlah_keping: Number(editKeping),
        sesi_order: editSesi,
        kantor_pos: editKantor,
        nominal_meterai: Number(editHarga),
        total_nilai: totalNilaiBaru,
      });
      alert("Order Materai berhasil diperbarui!");
      setEditingItem(null);
      fetchData();
    } catch (err) {
      console.error("Gagal update:", err.response?.data || err);
      const errorMsg =
        err.response?.data?.message ||
        JSON.stringify(err.response?.data?.errors) ||
        "Gagal memperbarui data order materai.";
      alert(errorMsg);
    }
  };

  // Hapus Data
  const handleHapus = async (id) => {
    if (!window.confirm("Apakah Cece yakin ingin menghapus order materai ini?"))
      return;

    try {
      await API.delete(`/order-materai/${id}`);
      setListOrder((prev) => prev.filter((item) => item.id !== id));
      alert("Data order materai berhasil dihapus!");
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus data order materai.");
    }
  };

  const filteredData = listOrder.filter((item) => {
    const itemKantor = item.kantor_pos || item.nama_kantor || "";
    const matchKantor = isAdmin
      ? kantorFilter === "Semua Kantor" ||
        itemKantor.toLowerCase().includes(kantorFilter.toLowerCase())
      : itemKantor.toLowerCase() === userKantor.toLowerCase();

    const matchSesi = sesiFilter === "Semua" || item.sesi_order === sesiFilter;
    const matchTanggal = !tanggalFilter || item.tanggal === tanggalFilter;

    return matchKantor && matchSesi && matchTanggal;
  });

  // Logika Pagination (10 data per halaman)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;

  // FUNGSI DOWNLOAD PDF OTOMATIS
  const handleDownloadPDF = () => {
    const element = document.getElementById("pdf-report-content");
    if (!element) return;

    const executeDownload = () => {
      const opt = {
        margin: 10,
        filename: `Laporan-Riwayat-Materai-${new Date().toISOString().slice(0, 10)}.pdf`,
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

  const handlePrint = () => {
    window.print();
  };

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
              Laporan Riwayat Order Materai
            </h2>
            <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
              Kantor: {kantorFilter}{" "}
              {tanggalFilter ? `| Tanggal: ${tanggalFilter}` : ""}
            </p>
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
                    textAlign: "left",
                  }}
                >
                  NO
                </th>
                <th
                  style={{
                    padding: "10px",
                    border: "1px solid #e2e8f0",
                    textAlign: "left",
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
                  NAMA KANTOR
                </th>
                <th
                  style={{
                    padding: "10px",
                    border: "1px solid #e2e8f0",
                    textAlign: "center",
                  }}
                >
                  KEPING
                </th>
                <th
                  style={{
                    padding: "10px",
                    border: "1px solid #e2e8f0",
                    textAlign: "center",
                  }}
                >
                  TOTAL HARGA
                </th>
                <th
                  style={{
                    padding: "10px",
                    border: "1px solid #e2e8f0",
                    textAlign: "center",
                  }}
                >
                  SESI
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => {
                  const total =
                    item.total_nilai ||
                    Number(item.nominal_meterai || hargaSatuanMaster) *
                      Number(item.jumlah_keping || 0);
                  return (
                    <tr key={item.id || index}>
                      <td
                        style={{
                          padding: "8px 10px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        {index + 1}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          border: "1px solid #e2e8f0",
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
                        {item.kantor_pos || item.nama_kantor}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          border: "1px solid #e2e8f0",
                          textAlign: "center",
                        }}
                      >
                        {item.jumlah_keping} Pcs
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          border: "1px solid #e2e8f0",
                          textAlign: "center",
                        }}
                      >
                        Rp {Number(total).toLocaleString("id-ID")}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          border: "1px solid #e2e8f0",
                          textAlign: "center",
                        }}
                      >
                        {item.sesi_order || "Pagi"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#64748b",
                    }}
                  >
                    Tidak ada data untuk dicetak.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ==============================
  // HALAMAN UTAMA RIWAYAT ORDER MATERAI
  // ==============================
  return (
    <div className="riwayat-container" style={{ paddingBottom: "80px" }}>
      <div
        className="riwayat-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <h2 className="riwayat-title" style={{ margin: 0 }}>
          Riwayat Order Materai
        </h2>
        <button
          onClick={() => setIsPrintPreview(true)}
          style={{
            backgroundColor: "#0d9488",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          📄 Pratinjau PDF / Cetak
        </button>
      </div>

      {/* FORM PENGATURAN HARGA SATUAN DI BAWAH JUDUL */}
      <div
        className="filter-card"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "15px",
          backgroundColor: "#f8fafc",
          border: "1px solid #e2e8f0",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <label
            style={{ fontWeight: "700", fontSize: "13px", color: "#334155" }}
          >
            PENGATURAN HARGA SATUAN MATERAI:
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{ fontSize: "14px", fontWeight: "600", color: "#64748b" }}
            >
              Rp
            </span>
            <input
              type="number"
              value={hargaSatuanMaster}
              onChange={(e) => setHargaSatuanMaster(e.target.value)}
              className="filter-input"
              style={{ width: "140px", backgroundColor: "white" }}
              min="0"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleSimpanHargaMaster}
          style={{
            padding: "8px 16px",
            backgroundColor: "#2b6fb7",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          💾 Simpan Harga Master
        </button>
      </div>

      {/* Kartu Filter */}
      <div className="filter-card">
        <div className="filter-group">
          <label>KANTOR POS</label>
          <select
            value={kantorFilter}
            onChange={(e) => {
              setKantorFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-input"
            disabled={!isAdmin}
            style={{ backgroundColor: !isAdmin ? "#f1f5f9" : "white" }}
          >
            {isAdmin && <option value="Semua Kantor">Semua Kantor</option>}
            {daftarKantor.length > 0 ? (
              daftarKantor.map((namaKantor) => (
                <option key={namaKantor} value={namaKantor}>
                  {namaKantor}
                </option>
              ))
            ) : (
              <>
                <option value="Kantor Pos Tulangan">Kantor Pos Tulangan</option>
                <option value="Kantor Pos Jabon">Kantor Pos Jabon</option>
                <option value="Kantor Pos Krembung">Kantor Pos Krembung</option>
                <option value="Kantor Pos Sidoarjo 61200">
                  Kantor Pos Sidoarjo 61200
                </option>
                <option value="KPC Porong">KPC Porong</option>
              </>
            )}
          </select>
        </div>

        {isAdmin && (
          <div className="filter-group">
            <label>SESI ORDER</label>
            <select
              value={sesiFilter}
              onChange={(e) => {
                setSesiFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-input"
            >
              <option value="Semua">Semua Sesi</option>
              <option value="Pagi">Pagi</option>
              <option value="Sore">Sore</option>
            </select>
          </div>
        )}

        <div className="filter-group">
          <label>FILTER TANGGAL</label>
          <input
            type="date"
            value={tanggalFilter}
            onChange={(e) => {
              setTanggalFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-input"
          />
        </div>
      </div>

      {/* Tabel Riwayat Order Materai */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="riwayat-table">
            <thead>
              <tr>
                <th>NO</th>
                <th>TANGGAL</th>
                <th>NAMA KANTOR</th>
                <th className="text-center">KEPING</th>
                <th className="text-center">PESANAN (TOTAL HARGA)</th>
                {isAdmin && <th className="text-center">SESI</th>}
                {isAdmin && <th className="text-center">AKSI</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 5} className="text-center no-data">
                    Memuat data...
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>{item.tanggal}</td>
                    <td className="kantor-name">
                      {item.kantor_pos || item.nama_kantor}
                    </td>
                    <td className="text-center">
                      <span className="badge-keping">
                        {item.jumlah_keping} Pcs
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="badge-pesanan">
                        Rp{" "}
                        {Number(
                          item.total_nilai ||
                            Number(item.nominal_meterai || hargaSatuanMaster) *
                              Number(item.jumlah_keping || 0),
                        ).toLocaleString("id-ID")}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="text-center">
                        <span
                          className={`badge-sesi ${
                            item.sesi_order
                              ? item.sesi_order.toLowerCase()
                              : "pagi"
                          }`}
                        >
                          {item.sesi_order || "Pagi"}
                        </span>
                      </td>
                    )}
                    {isAdmin && (
                      <td className="text-center">
                        <div className="action-buttons">
                          <button
                            className="btn-edit"
                            onClick={() => handleEdit(item)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-hapus"
                            onClick={() => handleHapus(item.id)}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 7 : 5} className="text-center no-data">
                    Tidak ada data riwayat order materai untuk kriteria ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION / TOMBOL NAVIGASI HALAMAN */}
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
              {Math.min(indexOfLastItem, filteredData.length)} dari{" "}
              {filteredData.length} data
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

      {/* MODAL / POPUP FORM EDIT */}
      {editingItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Order Materai</h3>
            <form onSubmit={handleSaveEdit}>
              <div style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#64748b",
                    marginBottom: "6px",
                  }}
                >
                  NAMA KANTOR
                </label>
                <select
                  value={editKantor}
                  onChange={(e) => setEditKantor(e.target.value)}
                  className="filter-input"
                >
                  {daftarKantor.length > 0 ? (
                    daftarKantor.map((namaKantor) => (
                      <option key={namaKantor} value={namaKantor}>
                        {namaKantor}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Kantor Pos Tulangan">
                        Kantor Pos Tulangan
                      </option>
                      <option value="Kantor Pos Jabon">Kantor Pos Jabon</option>
                      <option value="Kantor Pos Krembung">
                        Kantor Pos Krembung
                      </option>
                      <option value="Kantor Pos Sidoarjo 61200">
                        Kantor Pos Sidoarjo 61200
                      </option>
                      <option value="KPC Porong">KPC Porong</option>
                    </>
                  )}
                </select>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#64748b",
                    marginBottom: "6px",
                  }}
                >
                  HARGA SATUAN (Rp)
                </label>
                <input
                  type="number"
                  value={editHarga}
                  onChange={(e) => setEditHarga(e.target.value)}
                  className="filter-input"
                  min="0"
                  required
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#64748b",
                    marginBottom: "6px",
                  }}
                >
                  JUMLAH KEPING
                </label>
                <input
                  type="number"
                  value={editKeping}
                  onChange={(e) => setEditKeping(e.target.value)}
                  className="filter-input"
                  min="1"
                  required
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#64748b",
                    marginBottom: "6px",
                  }}
                >
                  TOTAL HARGA OTOMATIS
                </label>
                <input
                  type="text"
                  value={`Rp ${Number(Number(editKeping || 0) * Number(editHarga || 0)).toLocaleString("id-ID")}`}
                  readOnly
                  className="filter-input"
                  style={{
                    backgroundColor: "#f1f5f9",
                    fontWeight: "bold",
                    color: "#1d4ed8",
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#64748b",
                    marginBottom: "6px",
                  }}
                >
                  SESI ORDER
                </label>
                <select
                  value={editSesi}
                  onChange={(e) => setEditSesi(e.target.value)}
                  className="filter-input"
                >
                  <option value="Pagi">Pagi</option>
                  <option value="Sore">Sore</option>
                </select>
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
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#2b6fb7",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RiwayatMaterai;
