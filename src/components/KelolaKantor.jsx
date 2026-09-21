import React, { useState, useEffect } from "react";
import API from "./axios";
import "./KelolaKantor.css";

function KelolaKantor() {
  const [dataKantor, setDataKantor] = useState([]);
  const [loading, setLoading] = useState(true);

  const [idKantor, setIdKantor] = useState("");
  const [namaKantor, setNamaKantor] = useState("");
  const [jenisKantor, setJenisKantor] = useState("penempatan");
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  // State untuk Tab Riwayat ("penempatan" atau "cabang")
  const [tabRiwayat, setTabRiwayat] = useState("penempatan");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/kantor-cabang?tipe=${tabRiwayat}`);
      setDataKantor(res.data.data ?? res.data);
    } catch (err) {
      console.error(
        err.response?.data?.message || "Gagal mengambil data kantor",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tabRiwayat]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, tabRiwayat]);

  const handleSimpan = async (e) => {
    e.preventDefault();
    if (jenisKantor === "cabang" && !idKantor) {
      alert("Harap isi ID Kantor untuk Kantor Login (Cabang)!");
      return;
    }
    if (!namaKantor) {
      alert("Harap isi Nama Kantor!");
      return;
    }

    const payload = {
      kode_kantor: jenisKantor === "penempatan" ? null : idKantor,
      nama_kantor: namaKantor,
      tipe: jenisKantor,
    };

    try {
      setSaving(true);

      if (editId) {
        await API.put(`/kantor-cabang/${editId}`, payload);
        alert("Data kantor berhasil diperbarui!");
      } else {
        await API.post("/kantor-cabang", payload);
        alert("Kantor baru berhasil ditambahkan!");
      }

      setEditId(null);
      setIdKantor("");
      setNamaKantor("");
      setJenisKantor("penempatan");
      fetchData();
    } catch (err) {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        const firstError = Object.values(errors)[0][0];
        alert(firstError);
      } else {
        alert("Gagal menyimpan data kantor.");
      }
      console.error(err.response?.data);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setIdKantor(
      item.kode_kantor === "-" || !item.kode_kantor ? "" : item.kode_kantor,
    );
    setNamaKantor(item.nama_kantor);
    setJenisKantor(item.tipe || "penempatan");
    setEditId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBatalEdit = () => {
    setEditId(null);
    setIdKantor("");
    setNamaKantor("");
    setJenisKantor("penempatan");
  };

  const handleHapus = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus kantor ini?"))
      return;

    try {
      await API.delete(`/kantor-cabang/${id}`);
      setDataKantor((prev) => prev.filter((item) => item.id !== id));
      alert("Data kantor berhasil dihapus!");
    } catch (err) {
      console.error(err.response?.data?.message);
      alert("Gagal menghapus data kantor.");
    }
  };

  // Fungsi Import Excel
  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      await API.post("/kantor-cabang/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Data kantor berhasil diimpor dari Excel!");
      fetchData();
    } catch (err) {
      console.error("Gagal mengimpor data:", err);
      alert(err.response?.data?.message || "Gagal mengimpor file Excel.");
    } finally {
      setLoading(false);
      e.target.value = null; // Reset input file
    }
  };

  const filteredKantor = dataKantor.filter((item) => {
    const keyword = searchTerm.toLowerCase();
    const kode = String(item.kode_kantor || "").toLowerCase();
    const nama = String(item.nama_kantor || "").toLowerCase();
    return kode.includes(keyword) || nama.includes(keyword);
  });

  const totalPages = Math.ceil(filteredKantor.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredKantor.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="kk-container">
      <div className={`kk-card ${editId ? "kk-card-editing" : ""}`}>
        <div className="kk-header-title">
          <span className="kk-icon">🏢</span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
            }}
          >
            <h2>{editId ? "Edit Data Kantor" : "Kelola Kantor"}</h2>
            {editId && (
              <span className="kk-badge-editing">
                Mode Edit (
                {tabRiwayat === "cabang" ? `ID: ${idKantor}` : "Penugasan"})
              </span>
            )}
          </div>
        </div>

        {/* Form Input */}
        <form onSubmit={handleSimpan} className="kk-form-inline">
          <div className="kk-input-group">
            <label>Jenis / Peruntukan Kantor</label>
            <select
              value={jenisKantor}
              onChange={(e) => {
                setJenisKantor(e.target.value);
                if (e.target.value === "penempatan") setIdKantor("");
              }}
              className="kk-control"
              style={{ padding: "9px 12px", backgroundColor: "#fff" }}
            >
              <option value="penempatan">Kantor Penugasan / Penempatan</option>
              <option value="cabang">Kantor untuk Login</option>
            </select>
          </div>

          {jenisKantor === "cabang" && (
            <div className="kk-input-group">
              <label>ID Kantor</label>
              <input
                type="text"
                placeholder="ID Kantor"
                value={idKantor}
                onChange={(e) => setIdKantor(e.target.value)}
                className="kk-control"
              />
            </div>
          )}

          <div className="kk-input-group kk-flex-grow">
            <label>Nama Kantor</label>
            <input
              type="text"
              placeholder="Nama Kantor"
              value={namaKantor}
              onChange={(e) => setNamaKantor(e.target.value)}
              className="kk-control"
            />
          </div>

          <div
            className="kk-button-group"
            style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}
          >
            {editId && (
              <button
                type="button"
                onClick={handleBatalEdit}
                className="kk-btn-batal"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              className={`kk-btn-simpan ${editId ? "kk-btn-update" : ""}`}
              disabled={saving}
            >
              {saving
                ? "⏳ Menyimpan..."
                : editId
                  ? "🔄 Perbarui"
                  : "📥 Simpan"}
            </button>
          </div>
        </form>

        {/* Tombol Import Excel di bawah form */}
        <div
          style={{
            marginTop: "16px",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <label
            style={{
              backgroundColor: "#10b981",
              color: "white",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            📁 Import Excel
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleImportExcel}
              style={{ display: "none" }}
            />
          </label>
        </div>
      </div>

      {/* Tabel Data & Tab Pilihan Riwayat */}
      <div className="kk-table-card">
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "16px",
            borderBottom: "1px solid #e2e8f0",
            paddingBottom: "12px",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setTabRiwayat("penempatan");
              setIdKantor("");
            }}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "14px",
              background: tabRiwayat === "penempatan" ? "#2563eb" : "#f1f5f9",
              color: tabRiwayat === "penempatan" ? "#ffffff" : "#475569",
            }}
          >
            Kantor Penugasan
          </button>
          <button
            type="button"
            onClick={() => {
              setTabRiwayat("cabang");
            }}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "14px",
              background: tabRiwayat === "cabang" ? "#2563eb" : "#f1f5f9",
              color: tabRiwayat === "cabang" ? "#ffffff" : "#475569",
            }}
          >
            Kantor Login
          </button>
        </div>

        {/* Header Daftar Kantor dengan padding/margin agar tidak mepet */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            flexWrap: "wrap",
            gap: "12px",
            paddingLeft: "4px",
            paddingRight: "4px",
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
            Daftar{" "}
            {tabRiwayat === "penempatan" ? "Kantor Penugasan" : "Kantor Login"}
          </h3>
          <input
            type="text"
            placeholder={
              tabRiwayat === "penempatan"
                ? "Cari berdasarkan Nama Kantor..."
                : "Cari berdasarkan ID atau Nama Kantor..."
            }
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

        <div className="kk-table-responsive">
          <table className="kk-table desktop-table">
            <thead>
              <tr>
                <th style={{ width: "70px", textAlign: "center" }}>No</th>
                {tabRiwayat === "cabang" && (
                  <th className="col-id" style={{ width: "150px" }}>
                    ID Kantor
                  </th>
                )}
                <th className="col-nama">Nama Kantor</th>
                <th
                  className="col-aksi"
                  style={{ width: "160px", textAlign: "center" }}
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={tabRiwayat === "cabang" ? "4" : "3"}
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    Memuat data...
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
                        width: "70px",
                      }}
                    >
                      {indexOfFirstItem + index + 1}
                    </td>
                    {tabRiwayat === "cabang" && (
                      <td className="td-id" style={{ width: "150px" }}>
                        {item.kode_kantor}
                      </td>
                    )}
                    <td className="td-nama">{item.nama_kantor}</td>
                    <td
                      className="td-aksi"
                      style={{ width: "160px", textAlign: "center" }}
                    >
                      <div
                        className="kk-action-buttons"
                        style={{ justifyContent: "center" }}
                      >
                        <button
                          onClick={() => handleEdit(item)}
                          className="kk-btn-action kk-btn-edit"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleHapus(item.id)}
                          className="kk-btn-action kk-btn-hapus"
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
                    colSpan={tabRiwayat === "cabang" ? "4" : "3"}
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#777",
                    }}
                  >
                    Belum ada data kantor yang cocok.
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
                  {tabRiwayat === "cabang" && (
                    <div className="mobile-card-row">
                      <span className="mobile-label">ID Kantor:</span>
                      <span className="mobile-value font-bold">
                        {item.kode_kantor}
                      </span>
                    </div>
                  )}
                  <div className="mobile-card-row">
                    <span className="mobile-label">Nama Kantor:</span>
                    <span className="mobile-value">{item.nama_kantor}</span>
                  </div>
                  <div className="mobile-card-actions">
                    <button
                      onClick={() => handleEdit(item)}
                      className="kk-btn-action kk-btn-edit"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleHapus(item.id)}
                      className="kk-btn-action kk-btn-hapus"
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
                Belum ada data kantor yang cocok.
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
              {Math.min(indexOfLastItem, filteredKantor.length)} dari{" "}
              {filteredKantor.length} data
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

export default KelolaKantor;
