import React, { useState, useEffect } from "react";
import API from "./axios";
import "./PermintaanBarang.css";

function RiwayatPermintaanBarang({ userActive }) {
  const [dataRiwayatServer, setDataRiwayatServer] = useState([]);
  const [selectedItemView, setSelectedItemView] = useState(null);

  // State untuk Filter Kantor, Pencarian, & Pagination
  const [kantorFilter, setKantorFilter] = useState("Semua Kantor");
  const [daftarKantor, setDaftarKantor] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const isAdminOrSuper =
    userActive?.role === "superadmin" || userActive?.role === "admin";

  const namaKantorAktif = userActive?.kantor || "Kantor Pos Sidoarjo 61200";

  // Ambil data riwayat dari backend
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

  // Ambil master daftar kantor dari backend (/kantor-cabang) agar sinkron dengan Kelola Kantor
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
    fetchRiwayat();
    fetchMasterKantor();
  }, []);

  // Jika user bukan admin, kunci filter kantor ke kantor user yang aktif
  useEffect(() => {
    if (!isAdminOrSuper && namaKantorAktif) {
      setKantorFilter(namaKantorAktif);
    }
  }, [isAdminOrSuper, namaKantorAktif]);

  // Reset ke halaman 1 jika user mengetik pencarian atau mengganti filter kantor
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, kantorFilter]);

  // Fungsi untuk mengubah status orderan (Khusus Admin/Superadmin)
  const handleUbahStatusAdmin = async (id, statusBaru) => {
    try {
      await API.put(`/permintaan-barang/${id}`, { status: statusBaru });
      alert(`Status berhasil diubah menjadi ${statusBaru}`);
      fetchRiwayat();
    } catch (error) {
      console.error("Gagal memperbarui status:", error);
      alert("Gagal memperbarui status di server.");
    }
  };

  // Filter berdasarkan Role dan Dropdown Kantor
  const dataFilteredByRole = isAdminOrSuper
    ? dataRiwayatServer.filter((item) => {
        const itemKantor = (item.nama_kantor || item.kantor || "").trim();
        if (kantorFilter === "Semua Kantor") return true;
        return itemKantor.toLowerCase() === kantorFilter.toLowerCase();
      })
    : dataRiwayatServer.filter((item) => {
        const kantorItem = (
          item.nama_kantor ||
          item.kantor ||
          ""
        ).toLowerCase();
        const kantorUser = namaKantorAktif.toLowerCase();
        return (
          kantorItem.includes(kantorUser) || kantorUser.includes(kantorItem)
        );
      });

  // Filter pencarian teks
  const dataTampil = dataFilteredByRole.filter((item) => {
    const keyword = searchTerm.toLowerCase();
    const namaBarang = String(
      item.nama_barang || item.namaBarang || "",
    ).toLowerCase();
    const namaKantor = String(
      item.nama_kantor || item.kantor || "",
    ).toLowerCase();
    const tanggal = String(item.tanggal || "").toLowerCase();
    const status = String(item.status || "Order").toLowerCase();

    return (
      namaBarang.includes(keyword) ||
      namaKantor.includes(keyword) ||
      tanggal.includes(keyword) ||
      status.includes(keyword)
    );
  });

  // Pagination Logic
  const totalPages = Math.ceil(dataTampil.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = dataTampil.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="pb-page-container">
      <div className="pb-top-banner">
        <div className="pb-banner-title">
          <span className="pb-accent-bar"></span>
          <h2>
            {isAdminOrSuper
              ? "Rekap & Monitoring Permintaan Barang Seluruh Kantor"
              : "Riwayat Order Permintaan Barang Kantor Anda"}
          </h2>
        </div>
      </div>

      <div className="pb-main-card">
        {/* KARTU FILTER KANTOR & PENCARIAN */}
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
          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              flex: 1,
              maxWidth: "600px",
            }}
          >
            <div style={{ flex: 1, minWidth: "220px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#64748b",
                  marginBottom: "4px",
                }}
              >
                FILTER KANTOR POS
              </label>
              <select
                value={kantorFilter}
                onChange={(e) => setKantorFilter(e.target.value)}
                disabled={!isAdminOrSuper}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  backgroundColor: !isAdminOrSuper ? "#f1f5f9" : "#fff",
                  fontWeight: "600",
                  color: "#1e293b",
                }}
              >
                {isAdminOrSuper && (
                  <option value="Semua Kantor">Semua Kantor</option>
                )}
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
          </div>

          <div style={{ width: "100%", maxWidth: "280px" }}>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: "700",
                color: "#64748b",
                marginBottom: "4px",
              }}
            >
              PENCARIAN KATA KUNCI
            </label>
            <input
              type="text"
              placeholder="Cari barang, status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                outline: "none",
                backgroundColor: "#fff",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        <div className="rpb-table-responsive">
          <table className="rpb-table">
            <thead>
              <tr>
                <th style={{ width: "60px", textAlign: "center" }}>No</th>
                <th>Tanggal</th>
                {isAdminOrSuper && <th>Nama Kantor</th>}
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
                    {isAdminOrSuper && (
                      <td>{item.nama_kantor || item.kantor || "-"}</td>
                    )}
                    <td>{item.nama_barang || item.namaBarang}</td>
                    <td>{item.jumlah}</td>
                    <td>{item.satuan || "Pcs"}</td>
                    <td>
                      {isAdminOrSuper ? (
                        <select
                          value={item.status || "Order"}
                          onChange={(e) =>
                            handleUbahStatusAdmin(item.id, e.target.value)
                          }
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            border: "1px solid #cbd5e1",
                            fontWeight: "600",
                            background: "#f8fafc",
                          }}
                        >
                          <option value="Order">Order</option>
                          <option value="Dipenuhi">Dipenuhi</option>
                          <option value="Kosong">Kosong</option>
                        </select>
                      ) : (
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
                      )}
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
                    colSpan={isAdminOrSuper ? "8" : "7"}
                    className="rpb-empty-row"
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#777",
                    }}
                  >
                    Belum ada data permintaan barang yang cocok.
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
              {Math.min(indexOfLastItem, dataTampil.length)} dari{" "}
              {dataTampil.length} data
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

      {/* Modal Detail View */}
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
            {isAdminOrSuper && (
              <p>
                <strong>Nama Kantor:</strong>{" "}
                {selectedItemView.nama_kantor || selectedItemView.kantor || "-"}
              </p>
            )}
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

export default RiwayatPermintaanBarang;
