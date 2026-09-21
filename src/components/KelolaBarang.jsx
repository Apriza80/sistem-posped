import React, { useState, useEffect } from "react";
import API from "./axios";
import "./KelolaBarang.css";

function KelolaBarang({ daftarMasterBarang, setDaftarMasterBarang }) {
  const [barangList, setBarangList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [namaBarang, setNamaBarang] = useState("");
  const [satuan, setSatuan] = useState("");
  const [editId, setEditId] = useState(null);

  // State untuk Pencarian & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Ambil data barang dari backend saat komponen dimuat (GUNAKAN /barangs)
  useEffect(() => {
    fetchBarang();
  }, []);

  // Reset ke halaman 1 jika user mengetik pencarian
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchBarang = async () => {
    try {
      setLoading(true);
      const response = await API.get("/barangs");
      const mappedData = response.data.data.map((item) => ({
        id: item.id,
        namaBarang: item.nama_barang,
        satuan: item.satuan,
      }));
      setBarangList(mappedData);
      if (setDaftarMasterBarang) setDaftarMasterBarang(mappedData);
    } catch (error) {
      console.error("Gagal mengambil data barang:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSimpan = async (e) => {
    e.preventDefault();
    if (!namaBarang || !satuan) {
      alert("Harap isi Nama Barang dan Satuan!");
      return;
    }

    const payload = {
      nama_barang: namaBarang,
      satuan: satuan,
    };

    try {
      if (editId) {
        await API.put(`/barangs/${editId}`, payload);
        alert("Data barang berhasil diperbarui!");
      } else {
        await API.post("/barangs", payload);
        alert("Barang baru berhasil ditambahkan!");
      }

      setEditId(null);
      setNamaBarang("");
      setSatuan("");
      fetchBarang();
    } catch (error) {
      console.error("Gagal menyimpan barang:", error);
      if (error.response && error.response.data && error.response.data.errors) {
        const errorMessages = Object.values(error.response.data.errors)
          .flat()
          .join("\n");
        alert("Validasi Gagal:\n" + errorMessages);
      } else if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        alert("Server Error: " + error.response.data.message);
      } else {
        alert("Terjadi kesalahan saat menyimpan data ke server.");
      }
    }
  };

  const handleEdit = (item) => {
    setNamaBarang(item.namaBarang);
    setSatuan(item.satuan);
    setEditId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBatalEdit = () => {
    setEditId(null);
    setNamaBarang("");
    setSatuan("");
  };

  const handleHapus = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus barang ini?")) {
      try {
        await API.delete(`/barangs/${id}`);
        fetchBarang();
        alert("Data barang berhasil dihapus!");
      } catch (error) {
        console.error("Gagal menghapus barang:", error);
        alert("Gagal menghapus data dari server.");
      }
    }
  };

  // FILTER & PAGINATION LOGIC
  const filteredBarang = barangList.filter((item) => {
    const keyword = searchTerm.toLowerCase();
    const nama = String(item.namaBarang || "").toLowerCase();
    const satuanItem = String(item.satuan || "").toLowerCase();
    return nama.includes(keyword) || satuanItem.includes(keyword);
  });

  const totalPages = Math.ceil(filteredBarang.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBarang.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="kb-container">
      {/* Form Card dengan indikator mode edit */}
      <div className={`kb-card ${editId ? "kb-card-editing" : ""}`}>
        <div className="kb-header-title">
          <span className="kb-icon">📦</span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
            }}
          >
            <h2>{editId ? "Edit Data Barang" : "Entri Modul Barang"}</h2>
            {editId && (
              <span className="kb-badge-editing">Mode Edit (ID: {editId})</span>
            )}
          </div>
        </div>

        <form onSubmit={handleSimpan} className="kb-form-grid">
          <div className="kb-input-group">
            <label>Nama Barang</label>
            <input
              type="text"
              placeholder="Contoh: Prangko / Kertas A4"
              value={namaBarang}
              onChange={(e) => setNamaBarang(e.target.value)}
              className="kb-control"
            />
          </div>

          <div className="kb-input-group">
            <label>Satuan</label>
            <input
              type="text"
              placeholder="Contoh: Pcs / Rim / Pkt"
              value={satuan}
              onChange={(e) => setSatuan(e.target.value)}
              className="kb-control"
            />
          </div>

          <div
            className="kb-button-group"
            style={{ display: "flex", gap: "8px" }}
          >
            {editId && (
              <button
                type="button"
                onClick={handleBatalEdit}
                className="kb-btn-batal"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              className={`kb-btn-simpan ${editId ? "kb-btn-update" : ""}`}
            >
              {editId ? "🔄 Perbarui" : "📥 Simpan"}
            </button>
          </div>
        </form>
      </div>

      {/* Tabel Data / Responsive View */}
      <div className="kb-table-card">
        {/* HEADER TABEL: Judul & Input Pencarian Sejajar */}
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
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#1e293b",
              margin: 0,
            }}
          >
            Daftar Modul Barang
          </h3>
          <input
            type="text"
            placeholder="Cari berdasarkan Nama atau Satuan..."
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

        <div className="kb-table-responsive">
          <table className="kb-table desktop-table">
            <thead>
              <tr>
                <th style={{ width: "60px", textAlign: "center" }}>No</th>
                <th style={{ width: "15%" }}>ID</th>
                <th style={{ width: "45%" }}>Nama Barang</th>
                <th style={{ width: "25%" }}>Satuan</th>
                <th style={{ width: "15%", textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    Memuat data barang...
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className={editId === item.id ? "tr-highlight-edit" : ""}
                  >
                    <td
                      style={{
                        textAlign: "center",
                        fontWeight: "600",
                        color: "#64748b",
                      }}
                    >
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td>{item.id}</td>
                    <td>{item.namaBarang}</td>
                    <td>{item.satuan}</td>
                    <td style={{ textAlign: "center" }}>
                      <div className="kb-action-buttons">
                        <button
                          onClick={() => handleEdit(item)}
                          className="kb-btn-action kb-btn-edit"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleHapus(item.id)}
                          className="kb-btn-action kb-btn-hapus"
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#777",
                    }}
                  >
                    Belum ada data barang yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Tampilan Mobile Card */}
          <div className="mobile-card-list">
            {loading ? (
              <p
                style={{ textAlign: "center", padding: "20px", color: "#777" }}
              >
                Memuat data...
              </p>
            ) : currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                <div
                  className={`mobile-card-item ${editId === item.id ? "mobile-highlight-edit" : ""}`}
                  key={item.id}
                >
                  <div className="mobile-card-row">
                    <span className="mobile-label">No:</span>
                    <span className="mobile-value font-bold">
                      {indexOfFirstItem + index + 1}
                    </span>
                  </div>
                  <div className="mobile-card-row">
                    <span className="mobile-label">ID:</span>
                    <span className="mobile-value font-bold">{item.id}</span>
                  </div>
                  <div className="mobile-card-row">
                    <span className="mobile-label">Nama Barang:</span>
                    <span className="mobile-value font-bold">
                      {item.namaBarang}
                    </span>
                  </div>
                  <div className="mobile-card-row">
                    <span className="mobile-label">Satuan:</span>
                    <span className="mobile-value">{item.satuan}</span>
                  </div>
                  <div className="mobile-card-actions">
                    <button
                      onClick={() => handleEdit(item)}
                      className="kb-btn-action kb-btn-edit"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleHapus(item.id)}
                      className="kb-btn-action kb-btn-hapus"
                    >
                      🗑️ Hapus
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "#777",
                  fontSize: "14px",
                }}
              >
                Belum ada data barang yang cocok.
              </p>
            )}
          </div>
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
              {Math.min(indexOfLastItem, filteredBarang.length)} dari{" "}
              {filteredBarang.length} data
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

export default KelolaBarang;
