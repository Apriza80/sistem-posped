import React, { useState, useEffect } from "react";
import API from "./axios";
import "./PermintaanBarang.css";

function PermintaanBarang({ onSimpanData, editData, userActive }) {
  const [tanggal] = useState(new Date().toISOString().split("T")[0]);
  const [namaBarang, setNamaBarang] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [dataRiwayatServer, setDataRiwayatServer] = useState([]);
  const [selectedItemView, setSelectedItemView] = useState(null);

  // State tambahan untuk filter tanggal riwayat & Pagination
  const [filterTanggalRiwayat, setFilterTanggalRiwayat] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State untuk menampung daftar master barang dari backend
  const [masterBarangServer, setMasterBarangServer] = useState([]);

  const namaKantorAktif = userActive?.kantor || "Kantor Pos Sidoarjo 61200";

  // Ambil data Master Barang dari backend (Mendukung endpoint /barangs maupun /barang)
  const fetchMasterBarang = async () => {
    try {
      const response = await API.get("/barangs");
      console.log("RESPONS MASTER BARANG:", response.data);

      const resultData = response.data?.data ?? response.data;
      if (Array.isArray(resultData)) {
        setMasterBarangServer(resultData);
      } else {
        setMasterBarangServer([]);
      }
    } catch (error) {
      console.error(
        "Gagal memuat master barang dari /barangs, mencoba /barang...",
        error,
      );
      try {
        const fallbackResponse = await API.get("/barang");
        const fallbackData =
          fallbackResponse.data?.data ?? fallbackResponse.data;
        if (Array.isArray(fallbackData)) {
          setMasterBarangServer(fallbackData);
        }
      } catch (err) {
        console.error("Gagal total memuat master barang:", err);
      }
    }
  };

  // Ambil data riwayat langsung dari backend
  const fetchRiwayat = async () => {
    try {
      const response = await API.get("/permintaan-barang");
      if (response.data) {
        setDataRiwayatServer(response.data.data ?? response.data);
      }
    } catch (error) {
      console.error("Gagal memuat riwayat permintaan barang:", error);
    }
  };

  useEffect(() => {
    fetchRiwayat();
    fetchMasterBarang();
  }, []);

  // Ekstraksi nama barang dari data backend agar aman dibaca dropdown
  const masterBarangList = masterBarangServer
    .map((item) => {
      if (typeof item === "string") return item;
      return item.nama_barang || item.namaBarang || item.name || "";
    })
    .filter(Boolean);

  useEffect(() => {
    if (editData) {
      setNamaBarang(editData.namaBarang || editData.nama_barang || "");
      setJumlah(editData.jumlah || "");
    } else {
      setNamaBarang("");
      setJumlah("");
    }
  }, [editData]);

  const handleSimpan = async (e) => {
    e.preventDefault();
    if (!tanggal || !namaBarang || !jumlah) {
      alert("Harap isi Tanggal, pilih Nama Barang, dan masukkan Jumlah Order!");
      return;
    }

    const payload = {
      tanggal,
      nama_barang: namaBarang,
      jumlah: Number(jumlah),
      status: editData?.status || "Order",
    };

    try {
      let response;
      if (editData) {
        response = await API.put(`/permintaan-barang/${editData.id}`, payload);
      } else {
        response = await API.post("/permintaan-barang", payload);
      }

      // Alert sukses ganda dihilangkan, cukup panggil fungsi pembaharuan data
      fetchRiwayat();
      setCurrentPage(1);

      if (onSimpanData && response.data) {
        onSimpanData(response.data.data ?? response.data);
      }

      if (!editData) {
        setNamaBarang("");
        setJumlah("");
      }
    } catch (error) {
      console.error("Gagal menyimpan ke backend:", error);
      if (error.response && error.response.data && error.response.data.errors) {
        const errorMessages = Object.values(error.response.data.errors)
          .flat()
          .join("\n");
        alert("Validasi Gagal:\n" + errorMessages);
      } else {
        alert("Terjadi kesalahan saat menyimpan ke server.");
      }
    }
  };

  // Filter riwayat berdasarkan kantor aktif dan tanggal riwayat
  const riwayatUserAktif = dataRiwayatServer.filter((item) => {
    const kantorItem = (item.nama_kantor || item.kantor || "").toLowerCase();
    const kantorUser = namaKantorAktif.toLowerCase();
    const matchKantor =
      kantorItem.includes(kantorUser) || kantorUser.includes(kantorItem);

    const matchTanggal =
      !filterTanggalRiwayat || item.tanggal === filterTanggalRiwayat;

    return matchKantor && matchTanggal;
  });

  // Reset halaman ke 1 jika filter tanggal berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [filterTanggalRiwayat]);

  // Logika Pagination (10 data per halaman)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = riwayatUserAktif.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(riwayatUserAktif.length / itemsPerPage) || 1;

  return (
    <div className="pb-page-container">
      <div className="pb-top-banner">
        <div className="pb-banner-title">
          <span className="pb-accent-bar"></span>
          <h2>Input Permintaan Barang (Per7)</h2>
        </div>
      </div>

      <div className="pb-main-card" style={{ marginBottom: "24px" }}>
        <div className="pb-card-header">
          <div>
            <h3>Formulir Order Barang</h3>
            {editData && <span className="pb-badge-mode">Edit Order</span>}
          </div>
        </div>

        <form onSubmit={handleSimpan}>
          <div className="pb-grid-2col">
            {/* TANGGAL DI KIRI */}
            <div className="pb-field-group">
              <label>Tanggal Permintaan</label>
              <input
                type="date"
                value={tanggal}
                readOnly
                className="pb-input-control"
                style={{
                  backgroundColor: "#f1f5f9",
                  cursor: "not-allowed",
                  fontWeight: "600",
                }}
              />
            </div>

            {/* NAMA KANTOR DI KANAN */}
            <div className="pb-field-group">
              <label>Nama Kantor</label>
              <input
                type="text"
                value={namaKantorAktif}
                readOnly
                className="pb-input-control pb-locked-input"
              />
            </div>

            <div className="pb-field-group">
              <label>Nama Barang</label>
              <select
                value={namaBarang}
                onChange={(e) => setNamaBarang(e.target.value)}
                className="pb-input-control"
              >
                <option value="">-- Pilih Barang --</option>
                {masterBarangList.length > 0 ? (
                  masterBarangList.map((barang, idx) => (
                    <option key={idx} value={barang}>
                      {barang}
                    </option>
                  ))
                ) : (
                  <option disabled>Memuat data barang...</option>
                )}
              </select>
            </div>

            <div className="pb-field-group">
              <label>Jumlah Order</label>
              <input
                type="number"
                placeholder="Masukkan jumlah order"
                value={jumlah}
                onChange={(e) => setJumlah(e.target.value)}
                className="pb-input-control"
              />
            </div>
          </div>

          <div className="pb-form-footer">
            <button type="submit" className="pb-btn-submit">
              {editData ? "Perbarui Order" : "Simpan Order"}
            </button>
          </div>
        </form>
      </div>

      <div className="pb-main-card">
        <div style={{ marginBottom: "16px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1e293b" }}>
            Riwayat Order Kantor Anda
          </h3>
          <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
            Daftar riwayat pesanan barang yang telah diajukan.
          </p>
        </div>

        {/* DATE PICKER DI BAWAH JUDUL RIWAYAT */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "16px",
            flexWrap: "wrap",
          }}
        >
          <input
            type="date"
            value={filterTanggalRiwayat}
            onChange={(e) => setFilterTanggalRiwayat(e.target.value)}
            style={{
              width: "200px",
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "14px",
              backgroundColor: "#fff",
            }}
          />
        </div>

        <div className="rpb-table-responsive">
          <table className="rpb-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Nama Barang</th>
                <th>Jumlah</th>
                <th>Satuan</th>
                <th>Status</th>
                <th style={{ textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>{item.tanggal}</td>
                    <td>{item.nama_barang || item.namaBarang}</td>
                    <td>{item.jumlah}</td>
                    <td>{item.satuan || "Pcs"}</td>
                    <td>
                      <span
                        className={`rpb-badge-status ${
                          (item.status || "Order") === "Dipenuhi"
                            ? "status-dipenuhi"
                            : (item.status || "Order") === "Kosong"
                              ? "status-kosong"
                              : "status-order"
                        }`}
                      >
                        {item.status || "Order"}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() => setSelectedItemView(item)}
                        style={{
                          backgroundColor: "#eff6ff",
                          color: "#1d4ed8",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        👁️ View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="rpb-empty-row"
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#777",
                    }}
                  >
                    Belum ada riwayat order dari kantor Anda sesuai tanggal
                    tersebut.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION / TOMBOL HALAMAN */}
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
              {Math.min(indexOfLastItem, riwayatUserAktif.length)} dari{" "}
              {riwayatUserAktif.length} data
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

      {/* Modal View User */}
      {selectedItemView && (
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
            className="modal-content"
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "12px",
              width: "400px",
            }}
          >
            <h3>Detail Permintaan Barang</h3>
            <p>
              <strong>Nama Barang:</strong>{" "}
              {selectedItemView.nama_barang || selectedItemView.namaBarang}
            </p>
            <p>
              <strong>Tanggal:</strong> {selectedItemView.tanggal}
            </p>
            <p>
              <strong>Jumlah:</strong> {selectedItemView.jumlah}{" "}
              {selectedItemView.satuan || "Pcs"}
            </p>
            <p>
              <strong>Status:</strong> {selectedItemView.status || "Order"}
            </p>
            <div style={{ textAlign: "right", marginTop: "20px" }}>
              <button
                type="button"
                onClick={() => setSelectedItemView(null)}
                style={{
                  padding: "8px 16px",
                  background: "#2b6fb7",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PermintaanBarang;
