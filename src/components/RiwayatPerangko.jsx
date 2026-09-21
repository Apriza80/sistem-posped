import React, { useState, useEffect } from "react";
import API from "./axios";
import "./RiwayatPerangko.css";

function RiwayatPerangko({ userActive }) {
  const [listOrder, setListOrder] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const [filterKantor, setFilterKantor] = useState("Semua Kantor");
  const [filterTanggal, setFilterTanggal] = useState("");

  // State daftar kantor master dari backend (/kantor-cabang)
  const [daftarKantor, setDaftarKantor] = useState([]);

  // State untuk Mode Pratinjau Cetak / PDF
  const [isPrintPreview, setIsPrintPreview] = useState(false);

  // State untuk Daftar Harga Perangko Master yang bisa diedit
  const [daftarHargaMaster, setDaftarHargaMaster] = useState(() => {
    const saved = localStorage.getItem("master_daftar_harga_perangko");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        /* ignore */
      }
    }
    // Default kelipatan 500 s.d 10000
    const def = [];
    for (let i = 500; i <= 10000; i += 500) def.push(i);
    return def;
  });

  const [selectedNominalEdit, setSelectedNominalEdit] = useState(500);
  const [newNominalValue, setNewNominalValue] = useState(500);

  // State untuk Modal Edit Perangko
  const [editingItem, setEditingItem] = useState(null);
  const [editKeping, setEditKeping] = useState("");
  const [editHargaSatuan, setEditHargaSatuan] = useState(500);
  const [editKantor, setEditKantor] = useState("");
  const [editTanggal, setEditTanggal] = useState("");

  // State tambahan untuk Pagination (10 data per halaman)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
      setFilterKantor(userKantor);
    }
  }, [isAdmin, userKantor]);

  // ==============================
  // AMBIL DATA DARI BACKEND
  // ==============================
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await API.get("/order-perangko");
      setListOrder(res.data.data ?? res.data);
    } catch (err) {
      console.error(
        err.response?.data?.message || "Gagal mengambil data riwayat perangko",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fungsi update/edit nominal master perangko
  const handleUpdateMasterHarga = (e) => {
    e.preventDefault();
    const updated = daftarHargaMaster.map((h) =>
      h === Number(selectedNominalEdit) ? Number(newNominalValue) : h,
    );
    // Urutkan ulang secara ascending
    updated.sort((a, b) => a - b);
    setDaftarHargaMaster(updated);
    localStorage.setItem(
      "master_daftar_harga_perangko",
      JSON.stringify(updated),
    );
    alert(
      `Harga satuan perangko berhasil diperbarui dari Rp ${selectedNominalEdit} menjadi Rp ${newNominalValue}!`,
    );
  };

  // Membuka Modal Edit
  const handleEditItem = (item) => {
    setEditingItem(item);
    setEditKeping(item.jumlah_keping || item.keping || "");
    setEditHargaSatuan(item.nominal_perangko || item.harga_satuan || 500);
    setEditKantor(
      item.kantor_pos || item.nama_kantor || "Kantor Pos Sidoarjo 61200",
    );
    setEditTanggal(item.tanggal || "");
  };

  // Menyimpan Perubahan dari Modal Edit ke Backend
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const totalNilaiBaru = Number(editKeping) * Number(editHargaSatuan);
      await API.put(`/order-perangko/${editingItem.id}`, {
        tanggal: editTanggal,
        nominal_perangko: Number(editHargaSatuan),
        jumlah_keping: Number(editKeping),
        total_nilai: totalNilaiBaru,
      });

      alert("Riwayat Order Perangko berhasil diperbarui!");
      setEditingItem(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Gagal memperbarui data order perangko.");
    }
  };

  // Fungsi hapus data order perangko ke Backend
  const handleHapus = async (id) => {
    if (
      window.confirm(
        "Apakah Cece yakin ingin menghapus riwayat order perangko ini?",
      )
    ) {
      try {
        await API.delete(`/order-perangko/${id}`);
        setListOrder((prev) => prev.filter((item) => item.id !== id));
        alert("Data order perangko berhasil dihapus!");
      } catch (err) {
        console.error(err);
        alert("Gagal menghapus data order perangko.");
      }
    }
  };

  const filteredData = listOrder.filter((item) => {
    const kantorItem = item.kantor_pos || item.nama_kantor || "";
    const matchKantor = isAdmin
      ? filterKantor === "Semua Kantor" ||
        kantorItem.toLowerCase().includes(filterKantor.toLowerCase())
      : kantorItem.toLowerCase() === userKantor.toLowerCase();

    const matchTanggal = !filterTanggal || item.tanggal === filterTanggal;
    return matchKantor && matchTanggal;
  });

  const sortedData = [...filteredData].sort((a, b) => b.id - a.id);

  // Logika Pagination (10 data per halaman)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;

  // FUNGSI DOWNLOAD PDF OTOMATIS (Langsung unduh file PDF instan)
  const handleDownloadPDF = () => {
    const element = document.getElementById("pdf-report-content");
    if (!element) return;

    const executeDownload = () => {
      const opt = {
        margin: 10,
        filename: `Laporan-Riwayat-Order-Perangko-${new Date().toISOString().slice(0, 10)}.pdf`,
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

  // FUNGSI PRINT LANGSUNG KE PRINTER FISIK
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
          <title>Cetak Laporan Riwayat Order Perangko</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #000; }
            h2 { text-align: center; margin-bottom: 5px; font-size: 20px; }
            p { text-align: center; color: #555; margin-bottom: 20px; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #333; padding: 8px 10px; font-size: 12px; text-align: left; }
            th { background-color: #f2f2f2; text-align: center; }
            td:nth-child(1), td:nth-child(2), td:nth-child(5) { text-align: center; }
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
  // RENDER HALAMAN PRATINJAU CETAK / PDF (ALA NERACA N2)
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
        {/* Header Biru di Atas dengan Tombol Download PDF & Print */}
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

        {/* Kertas Putih Pratinjau Laporan */}
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
              Laporan Riwayat Order Perangko
            </h2>
            <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
              Kantor: {filterKantor}{" "}
              {filterTanggal ? `| Tanggal: ${filterTanggal}` : ""}
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
                  KANTOR POS
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
                  JUMLAH KEPING
                </th>
                <th
                  style={{
                    padding: "10px",
                    border: "1px solid #e2e8f0",
                    textAlign: "right",
                  }}
                >
                  PERANGKO (NOMINAL)
                </th>
                <th
                  style={{
                    padding: "10px",
                    border: "1px solid #e2e8f0",
                    textAlign: "right",
                  }}
                >
                  TOTAL NILAI
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.length > 0 ? (
                sortedData.map((item, index) => {
                  const keping = Number(item.jumlah_keping || item.keping) || 0;
                  const harga =
                    Number(item.nominal_perangko || item.harga_satuan) || 0;
                  const total = Number(item.total_nilai) || keping * harga;
                  return (
                    <tr key={item.id || index}>
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
                        {item.kantor_pos || item.nama_kantor}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        {item.petugas || "-"}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          border: "1px solid #e2e8f0",
                          textAlign: "center",
                        }}
                      >
                        {keping} Pcs
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          border: "1px solid #e2e8f0",
                          textAlign: "right",
                        }}
                      >
                        Rp {harga.toLocaleString("id-ID")}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          border: "1px solid #e2e8f0",
                          textAlign: "right",
                          fontWeight: "600",
                        }}
                      >
                        Rp {total.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="7"
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

  return (
    <div className="neraca-container" style={{ paddingBottom: "80px" }}>
      <div
        className="page-header-box"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h2 className="page-main-title">Riwayat Order Perangko</h2>
        </div>
        <button
          onClick={() => setIsPrintPreview(true)}
          className="btn-primary"
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

      {/* FORM EDIT MASTER HARGA PERANGKO */}
      <div
        className="card filter-card"
        style={{
          marginTop: "16px",
          padding: "20px",
          backgroundColor: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
        }}
      >
        <h3
          style={{
            fontSize: "14px",
            fontWeight: "700",
            color: "#1e293b",
            marginBottom: "12px",
          }}
        >
          ⚙️ EDIT MASTER HARGA SATUAN PERANGKO
        </h3>
        <form
          onSubmit={handleUpdateMasterHarga}
          style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          <div style={{ flex: 1, minWidth: "180px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "600",
                color: "#64748b",
                marginBottom: "6px",
              }}
            >
              PILIH NOMINAL YANG DIEDIT
            </label>
            <select
              value={selectedNominalEdit}
              onChange={(e) => {
                const val = Number(e.target.value);
                setSelectedNominalEdit(val);
                setNewNominalValue(val);
              }}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                backgroundColor: "white",
              }}
            >
              {daftarHargaMaster.map((h) => (
                <option key={h} value={h}>
                  Rp {h.toLocaleString("id-ID")}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: "180px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "600",
                color: "#64748b",
                marginBottom: "6px",
              }}
            >
              UBAH JADI NOMINAL BARU
            </label>
            <input
              type="number"
              value={newNominalValue}
              onChange={(e) => setNewNominalValue(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                backgroundColor: "white",
                boxSizing: "border-box",
              }}
              required
              min="100"
            />
          </div>
          <div>
            <button
              type="submit"
              style={{
                padding: "9px 16px",
                backgroundColor: "#0d9488",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              💾 Simpan Perubahan Harga
            </button>
          </div>
        </form>
      </div>

      <div
        className="card filter-card"
        style={{
          marginTop: "16px",
          padding: "20px",
          background: "white",
          borderRadius: "12px",
        }}
      >
        <div
          className="filter-grid"
          style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}
        >
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "700",
                color: "#1e293b",
                marginBottom: "6px",
              }}
            >
              KANTOR POS
            </label>
            <select
              value={filterKantor}
              onChange={(e) => {
                setFilterKantor(e.target.value);
                setCurrentPage(1);
              }}
              disabled={!isAdmin}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                backgroundColor: !isAdmin ? "#f1f5f9" : "white",
              }}
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
                  <option value="Kantor Pos Sidoarjo 61200">
                    Kantor Pos Sidoarjo 61200
                  </option>
                  <option value="Kantor Pos Jabon">Kantor Pos Jabon</option>
                  <option value="Kantor Pos Tulangan">
                    Kantor Pos Tulangan
                  </option>
                  <option value="Kantor Pos Krembung">
                    Kantor Pos Krembung
                  </option>
                </>
              )}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "700",
                color: "#1e293b",
                marginBottom: "6px",
              }}
            >
              FILTER TANGGAL
            </label>
            <input
              type="date"
              value={filterTanggal}
              onChange={(e) => {
                setFilterTanggal(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>
      </div>

      <div
        className="card table-card"
        style={{
          marginTop: "20px",
          padding: "20px",
          background: "white",
          borderRadius: "12px",
        }}
      >
        <div className="table-responsive">
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th
                  style={{
                    width: "5%",
                    padding: "12px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    color: "#475569",
                  }}
                >
                  NO
                </th>
                <th
                  style={{
                    width: "15%",
                    padding: "12px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    color: "#475569",
                  }}
                >
                  TANGGAL
                </th>
                <th
                  style={{
                    width: "25%",
                    padding: "12px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    color: "#475569",
                  }}
                >
                  KANTOR POS
                </th>
                <th
                  style={{
                    width: "15%",
                    padding: "12px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    color: "#475569",
                  }}
                >
                  PETUGAS
                </th>
                <th
                  style={{
                    width: "15%",
                    padding: "12px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    color: "#475569",
                  }}
                >
                  JUMLAH KEPING
                </th>
                <th
                  className="col-nominal"
                  style={{
                    width: "12%",
                    padding: "12px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    color: "#475569",
                  }}
                >
                  PERANGKO (NOMINAL)
                </th>
                <th
                  style={{
                    width: "13%",
                    padding: "12px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    color: "#475569",
                  }}
                >
                  TOTAL NILAI
                </th>
                {isAdmin && (
                  <th
                    className="col-aksi"
                    style={{
                      width: "10%",
                      padding: "12px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13px",
                      color: "#475569",
                      textAlign: "center",
                    }}
                  >
                    AKSI
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 8 : 7}
                    style={{ padding: "24px", textAlign: "center" }}
                  >
                    Memuat data...
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((item, index) => {
                  const keping = Number(item.jumlah_keping || item.keping) || 0;
                  const harga =
                    Number(item.nominal_perangko || item.harga_satuan) || 0;
                  const total = Number(item.total_nilai) || keping * harga;
                  const kantorNama = item.kantor_pos || item.nama_kantor || "";

                  return (
                    <tr key={item.id}>
                      <td
                        style={{
                          padding: "12px",
                          border: "1px solid #cbd5e1",
                          fontSize: "13px",
                        }}
                      >
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          border: "1px solid #cbd5e1",
                          fontSize: "13px",
                        }}
                      >
                        {item.tanggal}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          border: "1px solid #cbd5e1",
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#00529c",
                        }}
                      >
                        {kantorNama}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          border: "1px solid #cbd5e1",
                          fontSize: "13px",
                        }}
                      >
                        {item.petugas || userActive?.nama || "Cece Zia"}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          border: "1px solid #cbd5e1",
                          fontSize: "13px",
                        }}
                      >
                        {keping} Keping
                      </td>
                      <td
                        className="col-nominal"
                        style={{
                          padding: "12px",
                          border: "1px solid #cbd5e1",
                          fontSize: "13px",
                          fontWeight: "600",
                        }}
                      >
                        Rp {harga.toLocaleString("id-ID")}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          border: "1px solid #cbd5e1",
                          fontSize: "13px",
                          fontWeight: "bold",
                          color: "#334155",
                        }}
                      >
                        Rp {total.toLocaleString("id-ID")}
                      </td>
                      {isAdmin && (
                        <td
                          className="col-aksi"
                          style={{
                            padding: "12px",
                            border: "1px solid #cbd5e1",
                            fontSize: "13px",
                            textAlign: "center",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: "6px",
                              justifyContent: "center",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => handleEditItem(item)}
                              style={{
                                backgroundColor: "#eff6ff",
                                color: "#1d4ed8",
                                border: "none",
                                padding: "5px 8px",
                                borderRadius: "6px",
                                fontSize: "12px",
                                cursor: "pointer",
                                fontWeight: "600",
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
                                padding: "5px 8px",
                                borderRadius: "6px",
                                fontSize: "12px",
                                cursor: "pointer",
                                fontWeight: "600",
                              }}
                            >
                              🗑️ Hapus
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={isAdmin ? 8 : 7}
                    style={{
                      padding: "24px",
                      textAlign: "center",
                      color: "#888",
                      border: "1px solid #cbd5e1",
                    }}
                  >
                    Belum ada data riwayat order perangko.
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
              {Math.min(indexOfLastItem, sortedData.length)} dari{" "}
              {sortedData.length} data
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

      {/* --- MODAL EDIT ORDER PERANGKO --- */}
      {editingItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Order Perangko</h3>
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
                  KANTOR POS
                </label>
                <select
                  value={editKantor}
                  onChange={(e) => setEditKantor(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "white",
                  }}
                >
                  {daftarKantor.length > 0 ? (
                    daftarKantor.map((namaKantor) => (
                      <option key={namaKantor} value={namaKantor}>
                        {namaKantor}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Kantor Pos Sidoarjo 61200">
                        Kantor Pos Sidoarjo 61200
                      </option>
                      <option value="Kantor Pos Jabon">Kantor Pos Jabon</option>
                      <option value="Kantor Pos Tulangan">
                        Kantor Pos Tulangan
                      </option>
                      <option value="Kantor Pos Krembung">
                        Kantor Pos Krembung
                      </option>
                    </>
                  )}
                </select>
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
                  HARGA PERANGKO (NOMINAL)
                </label>
                <select
                  value={editHargaSatuan}
                  onChange={(e) => setEditHargaSatuan(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                  }}
                >
                  {daftarHargaMaster.map((h) => (
                    <option key={h} value={h}>
                      Rp {h.toLocaleString("id-ID")}
                    </option>
                  ))}
                </select>
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
                  JUMLAH KEPING
                </label>
                <input
                  type="number"
                  value={editKeping}
                  onChange={(e) => setEditKeping(e.target.value)}
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
                    backgroundColor: "#00529c",
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

export default RiwayatPerangko;
