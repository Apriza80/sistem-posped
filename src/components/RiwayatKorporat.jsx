import React, { useState, useEffect } from "react";
import API from "./axios";
import "./KirimanKorporat.css";
import "./LaporanPenjualan.css";

function RiwayatKorporat({ userActive }) {
  const [daftarKiriman, setDaftarKiriman] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editId, setEditId] = useState(null);

  // State untuk Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State untuk form edit khusus admin
  const [tanggal, setTanggal] = useState("");
  const [namaMitra, setNamaMitra] = useState("");
  const [jumlahKiriman, setJumlahKiriman] = useState("");
  const [commodity, setCommodity] = useState("Paket");
  const [kantorPenempatan, setKantorPenempatan] = useState("");

  // Ambil data langsung dari database backend (/kiriman-korporat)
  const fetchDaftarKiriman = async () => {
    try {
      const response = await API.get("/kiriman-korporat");
      const dataFromServer = response.data.data || response.data;
      if (Array.isArray(dataFromServer)) {
        setDaftarKiriman(dataFromServer);
      }
    } catch (error) {
      console.error("Gagal memuat rekap riwayat korporat dari server:", error);
    }
  };

  useEffect(() => {
    fetchDaftarKiriman();
  }, []);

  // Reset ke halaman 1 jika user mengetik pencarian
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleStartEdit = (item) => {
    setEditId(item.id);
    setTanggal(item.tanggal || "");
    setNamaMitra(item.nama_mitra || "");
    setJumlahKiriman(item.jumlah || "");
    setCommodity(item.commodity || "Paket");
    setKantorPenempatan(item.kantor_penempatan || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("tanggal", tanggal);
      formData.append("nama_mitra", namaMitra);
      formData.append("jumlah", jumlahKiriman);
      formData.append("commodity", commodity);
      formData.append("kantor_penempatan", kantorPenempatan);
      formData.append("_method", "PUT");

      await API.post(`/kiriman-korporat/${editId}`, formData);
      alert("Data Kiriman Korporat berhasil diperbarui oleh Admin!");
      setEditId(null);
      fetchDaftarKiriman(); // Refresh data dari server
    } catch (error) {
      console.error("Gagal memperbarui data:", error);
      alert(
        error.response?.data?.message || "Gagal memperbarui data di server.",
      );
    }
  };

  const handleHapus = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data kiriman ini?")) {
      try {
        await API.delete(`/kiriman-korporat/${id}`);
        alert("Data kiriman korporat berhasil dihapus!");
        fetchDaftarKiriman(); // Refresh data dari server
      } catch (error) {
        console.error("Gagal menghapus data:", error);
        alert(
          error.response?.data?.message || "Gagal menghapus data dari server.",
        );
      }
    }
  };

  const handleLihatBukti = (filePath) => {
    if (!filePath) {
      alert("File bukti tidak memiliki lampiran.");
      return;
    }
    if (
      filePath.startsWith("http") ||
      filePath.startsWith("data:") ||
      filePath.startsWith("blob:")
    ) {
      window.open(filePath, "_blank");
      return;
    }

    const rawApiUrl = API.defaults.baseURL || "http://127.0.0.1:8000/api";
    const cleanBaseUrl = rawApiUrl.replace(/\/api\/?$/, "");
    const fullUrl = `${cleanBaseUrl}/storage/${filePath}`;
    window.open(fullUrl, "_blank");
  };

  const filteredData = daftarKiriman.filter((item) =>
    Object.values(item).some((val) =>
      String(val || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    ),
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="pb-page-container" style={{ paddingBottom: "80px" }}>
      <div className="pb-top-banner">
        <div className="pb-banner-title">
          <span className="pb-accent-bar"></span>
          <div>
            <h2>Riwayat Korporat (ADMIN)</h2>
            <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
              Kelola rekap kiriman korporat dan pemantauan status logistik
              secara real-time dari database.
            </p>
          </div>
        </div>
      </div>

      {/* Form Edit Khusus Admin (Hanya muncul jika tombol Edit diklik) */}
      {editId && (
        <div
          className="pb-main-card"
          style={{ marginBottom: "24px", border: "2px solid #2563eb" }}
        >
          <div
            style={{
              marginBottom: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: "600" }}>
              Form Edit Data Korporat (Admin)
            </h3>
            <span
              style={{
                background: "#dbeafe",
                color: "#1e40af",
                padding: "4px 10px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "700",
              }}
            >
              ID: {editId}
            </span>
          </div>
          <form onSubmit={handleUpdateAdmin}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div className="pb-field-group">
                <label>Tanggal</label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="pb-input-control"
                  required
                />
              </div>
              <div className="pb-field-group">
                <label>Nama Mitra</label>
                <input
                  type="text"
                  value={namaMitra}
                  onChange={(e) => setNamaMitra(e.target.value)}
                  className="pb-input-control"
                  required
                />
              </div>
              <div className="pb-field-group">
                <label>Kantor Penempatan</label>
                <input
                  type="text"
                  value={kantorPenempatan}
                  onChange={(e) => setKantorPenempatan(e.target.value)}
                  className="pb-input-control"
                />
              </div>
              <div className="pb-field-group">
                <label>Jumlah Kiriman (Paket/Dokumen)</label>
                <input
                  type="number"
                  value={jumlahKiriman}
                  onChange={(e) => setJumlahKiriman(e.target.value)}
                  className="pb-input-control"
                  min="1"
                  required
                />
              </div>
            </div>
            <div
              className="pb-form-footer"
              style={{ marginTop: "24px", display: "flex", gap: "10px" }}
            >
              <button type="submit" className="pb-btn-submit">
                Simpan Perubahan
              </button>
              <button
                type="button"
                onClick={() => setEditId(null)}
                style={{
                  background: "#64748b",
                  color: "white",
                  border: "none",
                  padding: "12px 20px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabel Data Rekap Riwayat Korporat */}
      <div className="lp-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <h3 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>
            Daftar Rekap Riwayat Korporat
          </h3>
          <input
            type="text"
            placeholder="Cari berdasarkan mitra atau tanggal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              maxWidth: "280px",
              padding: "9px 14px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "13px",
              outline: "none",
              backgroundColor: "#fff",
            }}
          />
        </div>

        <div className="lp-table-responsive">
          <table className="lp-table">
            <thead>
              <tr>
                <th style={{ width: "60px", textAlign: "center" }}>No</th>
                <th>Tanggal</th>
                <th>Nama Mitra</th>
                <th>Kantor Penempatan</th>
                <th>Jumlah</th>
                <th>File / Bukti</th>
                <th>Status Terkini</th>
                <th>Aksi Admin</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((item, index) => {
                  const statusLabel = item.status || "Menunggu Penjemputan";
                  return (
                    <tr key={item.id}>
                      <td
                        style={{
                          textAlign: "center",
                          fontWeight: "600",
                          color: "#64748b",
                        }}
                      >
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td>{item.tanggal}</td>
                      <td>
                        <span className="lp-badge-kantor">
                          {item.nama_mitra}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: "600", color: "#00529c" }}>
                          {item.kantor_penempatan || "-"}
                        </span>
                      </td>
                      <td>
                        {item.jumlah} {item.commodity || "Paket"}
                      </td>
                      <td>
                        <button
                          onClick={() =>
                            handleLihatBukti(item.file_bukti_mitra)
                          }
                          style={{
                            background: "none",
                            border: "none",
                            color: "#2563eb",
                            fontWeight: "500",
                            cursor: "pointer",
                            textDecoration: "underline",
                            padding: "0",
                          }}
                        >
                          📎{" "}
                          {item.file_bukti_mitra
                            ? String(item.file_bukti_mitra).split("/").pop()
                            : "Lihat File"}
                        </button>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "600",
                            background:
                              statusLabel === "Selesai di Loket"
                                ? "#dcfce7"
                                : statusLabel === "Dalam Perjalanan ke Loket"
                                  ? "#fef9c3"
                                  : "#fee2e2",
                            color:
                              statusLabel === "Selesai di Loket"
                                ? "#166534"
                                : statusLabel === "Dalam Perjalanan ke Loket"
                                  ? "#854d0e"
                                  : "#991b1b",
                          }}
                        >
                          {statusLabel}
                        </span>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            alignItems: "center",
                          }}
                        >
                          <button
                            onClick={() => handleStartEdit(item)}
                            style={{
                              background: "#eff6ff",
                              color: "#1d4ed8",
                              border: "1px solid #bfdbfe",
                              padding: "5px 12px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: "600",
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleHapus(item.id)}
                            style={{
                              background: "#ffeeef",
                              color: "#b91c1c",
                              border: "1px solid #fecaca",
                              padding: "5px 12px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: "600",
                            }}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="lp-empty-row">
                    Belum ada data riwayat kiriman korporat yang cocok.
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
    </div>
  );
}

export default RiwayatKorporat;
