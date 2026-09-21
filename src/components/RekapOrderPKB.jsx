import React, { useState, useEffect } from "react";
import API from "./axios";
import "./RekapOrderPKB.css";

function RekapOrderPKB({ userActive }) {
  const [dataRiwayat, setDataRiwayat] = useState([]); // data asli dari server
  const [dataSementara, setDataSementara] = useState([]); // salinan untuk edit status/keterangan
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [filterKantor, setFilterKantor] = useState("Semua Kantor");
  const [filterTanggal, setFilterTanggal] = useState("");

  // State daftar kantor dinamis dari endpoint /kantor-cabang
  const [daftarKantor, setDaftarKantor] = useState([]);

  // State untuk Modal Edit PKB
  const [editingItem, setEditingItem] = useState(null);
  const [editNopol, setEditNopol] = useState("");
  const [editNamaPemilik, setEditNamaPemilik] = useState("");
  const [editNoBayar, setEditNoBayar] = useState("");
  const [editKantor, setEditKantor] = useState("");

  // State tambahan untuk Pagination (10 data per halaman)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ==============================
  // AMBIL DATA DARI BACKEND
  // ==============================
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await API.get("/order-pkb");
      const data = res.data.data ?? res.data;
      setDataRiwayat(data);
      setDataSementara(data);
    } catch (err) {
      console.error(
        err.response?.data?.message || "Gagal mengambil data riwayat order PKB",
      );
    } finally {
      setLoading(false);
    }
  };

  // Ambil daftar master kantor secara dinamis dari backend
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
    fetchData();
    fetchMasterKantor();
  }, []);

  // Fungsi mengubah status sementara di tabel (belum tersimpan ke server)
  const handleStatusChange = (id, statusBaru) => {
    setDataSementara((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: statusBaru } : item,
      ),
    );
  };

  // Fungsi mengisi keterangan sementara di tabel (belum tersimpan ke server)
  const handleCatatanChange = (id, catatanBaru) => {
    setDataSementara((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, keterangan: catatanBaru } : item,
      ),
    );
  };

  // Membuka Modal Edit dan mengisi data awal baris yang diklik
  const handleEditItem = (item) => {
    setEditingItem(item);
    setEditNopol(item.nopol || "");
    setEditNamaPemilik(item.nama_pemilik || "");
    setEditNoBayar(item.no_bayar || "");
    setEditKantor(item.kantor_pos || "Kantor Pos Sidoarjo 61200");
  };

  // Menyimpan Perubahan dari Modal Edit -> PUT ke server
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      await API.put(`/order-pkb/${editingItem.id}`, {
        tanggal: editingItem.tanggal,
        nama_pemilik: editNamaPemilik,
        nopol: editNopol,
        no_bayar: editNoBayar,
      });

      alert("Data Order PKB berhasil diperbarui!");
      setEditingItem(null);
      fetchData();
    } catch (err) {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        const firstError = Object.values(errors)[0][0];
        alert(firstError);
      } else {
        alert("Gagal menyimpan perubahan.");
      }
      console.error(err.response?.data);
    }
  };

  // Fungsi tombol Hapus per item -> langsung DELETE ke server
  const handleHapusItem = async (id) => {
    if (
      !window.confirm("Apakah Cece yakin ingin menghapus data order PKB ini?")
    )
      return;

    try {
      await API.delete(`/order-pkb/${id}`);
      setDataRiwayat((prev) => prev.filter((item) => item.id !== id));
      setDataSementara((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err.response?.data?.message);
      alert("Gagal menghapus data.");
    }
  };

  // Fungsi tombol Simpan Utama -> kirim SEMUA perubahan status & keterangan
  const handleSimpanPerubahan = async () => {
    const perubahan = dataSementara.filter((item) => {
      const asli = dataRiwayat.find((d) => d.id === item.id);
      if (!asli) return false;
      return asli.status !== item.status || asli.keterangan !== item.keterangan;
    });

    if (perubahan.length === 0) {
      alert("Tidak ada perubahan status atau keterangan untuk disimpan.");
      return;
    }

    const payload = {
      orders: perubahan.map((item) => ({
        id: item.id,
        status: item.status,
        keterangan: item.keterangan ?? null,
      })),
    };

    try {
      setSaving(true);
      await API.post("/order-pkb/bulk-update", payload);

      alert("Perubahan status dan keterangan berhasil disimpan!");
      fetchData();
    } catch (err) {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        const firstError = Object.values(errors)[0][0];
        alert(firstError);
      } else {
        alert("Gagal menyimpan perubahan.");
      }
      console.error(err.response?.data);
    } finally {
      setSaving(false);
    }
  };

  const filteredData = dataSementara.filter((item) => {
    const matchKantor =
      filterKantor === "Semua Kantor" || item.kantor_pos === filterKantor;
    const matchTanggal = !filterTanggal || item.tanggal === filterTanggal;
    return matchKantor && matchTanggal;
  });

  const sortedAndGroupedData = [...filteredData].sort((a, b) => b.id - a.id);

  // Logika Pagination (10 data per halaman)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedAndGroupedData.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(sortedAndGroupedData.length / itemsPerPage) || 1;

  const handleCetakPDF = () => {
    window.print();
  };

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
          <h2 className="page-main-title">Riwayat Order PKB & Pengiriman</h2>
        </div>
        <button
          onClick={handleCetakPDF}
          className="btn-primary"
          style={{ backgroundColor: "#0d9488" }}
        >
          📥 Cetak / Download PDF
        </button>
      </div>

      <div className="card filter-card" style={{ marginTop: "16px" }}>
        <div className="filter-grid">
          <div>
            <label>KANTOR POS</label>
            <select
              value={filterKantor}
              onChange={(e) => {
                setFilterKantor(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option>Semua Kantor</option>
              {daftarKantor.length > 0 ? (
                daftarKantor.map((namaKantor) => (
                  <option key={namaKantor} value={namaKantor}>
                    {namaKantor}
                  </option>
                ))
              ) : (
                <>
                  <option value="KREMUNG">KREMUNG</option>
                  <option value="taman">taman</option>
                  <option value="Kantor Pos Sidoarjo">
                    Kantor Pos Sidoarjo
                  </option>
                  <option value="KPC Waru">KPC Waru</option>
                  <option value="KPC Porong">KPC Porong</option>
                  <option value="KPC Krian">KPC Krian</option>
                </>
              )}
            </select>
          </div>
          <div>
            <label>FILTER TANGGAL</label>
            <input
              type="date"
              value={filterTanggal}
              onChange={(e) => {
                setFilterTanggal(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      <div className="card table-card" style={{ marginTop: "20px" }}>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>NO</th>
                <th>TANGGAL</th>
                <th>KANTOR POS</th>
                <th>PETUGAS</th>
                <th>NOPOL</th>
                <th>NAMA PEMILIK</th>
                <th>NO BAYAR</th>
                <th>STATUS</th>
                <th className="text-center">AKSI</th>
                <th>KETERANGAN</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="table-empty">
                    Memuat data...
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((item, index) => (
                  <tr key={item.id}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>{item.tanggal}</td>
                    <td style={{ fontWeight: "600", color: "#00529c" }}>
                      {item.kantor_pos}
                    </td>
                    <td style={{ fontWeight: "500", color: "#334155" }}>
                      {item.petugas}
                    </td>
                    <td>{item.nopol}</td>
                    <td>{item.nama_pemilik}</td>
                    <td>{item.no_bayar}</td>
                    <td>
                      <select
                        value={item.status}
                        onChange={(e) =>
                          handleStatusChange(item.id, e.target.value)
                        }
                        className="status-dropdown"
                        style={{
                          backgroundColor:
                            item.status === "Kirim" ? "#dcfce7" : "#fef9c3",
                          color:
                            item.status === "Kirim" ? "#15803d" : "#854d0e",
                        }}
                      >
                        <option value="Order">Order</option>
                        <option value="Kirim">Kirim</option>
                      </select>
                    </td>

                    {/* --- KOLOM AKSI (EDIT & HAPUS) --- */}
                    <td className="text-center">
                      <div className="action-buttons">
                        <button
                          type="button"
                          onClick={() => handleEditItem(item)}
                          className="btn-edit"
                          title="Edit Order"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleHapusItem(item.id)}
                          className="btn-hapus"
                          title="Hapus Order"
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    </td>

                    <td>
                      <input
                        type="text"
                        placeholder="Ketik keterangan..."
                        value={item.keterangan || ""}
                        onChange={(e) =>
                          handleCatatanChange(item.id, e.target.value)
                        }
                        className="catatan-input"
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="table-empty">
                    Belum ada data riwayat order PKB.
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
              {Math.min(indexOfLastItem, sortedAndGroupedData.length)} dari{" "}
              {sortedAndGroupedData.length} data
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

        {/* TOMBOL SIMPAN DI BAWAH TABEL */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "20px",
          }}
        >
          <button
            onClick={handleSimpanPerubahan}
            className="btn-primary"
            style={{ backgroundColor: "#00529c", padding: "10px 24px" }}
            disabled={saving}
          >
            {saving ? "⏳ Menyimpan..." : "💾 Simpan Perubahan"}
          </button>
        </div>
      </div>

      {/* --- MODAL / POPUP FORM EDIT ORDER PKB --- */}
      {editingItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Order PKB & Pengiriman</h3>
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
                  KANTOR POS (tidak dapat diubah)
                </label>
                <select
                  value={editKantor}
                  onChange={(e) => setEditKantor(e.target.value)}
                  disabled
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#f1f5f9",
                    cursor: "not-allowed",
                  }}
                >
                  <option value={editKantor}>{editKantor}</option>
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
                  NOMOR POLISI (NOPOL)
                </label>
                <input
                  type="text"
                  value={editNopol}
                  onChange={(e) => setEditNopol(e.target.value)}
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
                  NAMA PEMILIK
                </label>
                <input
                  type="text"
                  value={editNamaPemilik}
                  onChange={(e) => setEditNamaPemilik(e.target.value)}
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
                  NO BUKTI BAYAR
                </label>
                <input
                  type="text"
                  value={editNoBayar}
                  onChange={(e) => setEditNoBayar(e.target.value)}
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

export default RekapOrderPKB;
