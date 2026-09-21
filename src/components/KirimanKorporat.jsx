import React, { useState, useEffect } from "react";
import API from "./axios";
import "./KirimanKorporat.css";
import "./LaporanPenjualan.css";

function KirimanKorporat({ userActive }) {
  const [tanggal] = useState(new Date().toISOString().split("T")[0]);

  // Murni mengambil nama akun, tanpa mencampur dengan kantor
  const initialNama =
    userActive?.nama || userActive?.name || userActive?.username || "tarmi";
  const [namaMitra, setNamaMitra] = useState(initialNama);

  // State untuk Kantor Penempatan & Daftar List dari API
  const [kantorPenempatan, setKantorPenempatan] = useState("");
  const [daftarKantorPenempatan, setDaftarKantorPenempatan] = useState([]);

  const [jumlahKiriman, setJumlahKiriman] = useState("");
  const [commodity, setCommodity] = useState("Paket");
  const [namaFile, setNamaFile] = useState("");
  const [fileObjekMitra, setFileObjekMitra] = useState(null);

  const [editId, setEditId] = useState(null);
  const [daftarKiriman, setDaftarKiriman] = useState([]);

  // State pencarian & pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTanggalRiwayat, setFilterTanggalRiwayat] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [notifSukses, setNotifSukses] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // DETEKSI ROLE YANG LEBIH AMAN (JIKA USERACTIVE KOSONG, DEFAULT KE MITRA)
  const userRole = userActive?.role
    ? String(userActive.role).toLowerCase()
    : "mitra";
  const isSuperAdmin = userRole === "superadmin" || userRole === "admin";

  const getDefaultRole = () => {
    if (userRole.includes("pickuper") || userRole.includes("kurir"))
      return "pickuper";
    if (userRole.includes("loket") || userRole.includes("petugas"))
      return "loket";
    return "mitra"; // Default utama dipastikan ke "mitra"
  };

  const [roleAktif, setRoleAktif] = useState(
    isSuperAdmin ? "mitra" : getDefaultRole(),
  );

  useEffect(() => {
    if (userActive) {
      if (!isSuperAdmin) {
        setRoleAktif(getDefaultRole());
      }
      setNamaMitra(
        userActive?.nama || userActive?.name || userActive?.username || "tarmi",
      );
    }
    fetchDataKiriman();
    fetchKantorPenempatan(); // Mengambil daftar kantor penempatan dari database
  }, [userActive]);

  // FUNGSI AMBIL KANTOR PENEMPATAN DARI DATABASE (?tipe=penempatan)
  const fetchKantorPenempatan = async () => {
    try {
      const response = await API.get("/kantor-cabang?tipe=penempatan");

      // Menangani berbagai kemungkinan struktur response dari Laravel secara fleksibel
      const rawData = response.data;
      const dataKantor = Array.isArray(rawData)
        ? rawData
        : rawData.data || rawData.kantor || [];

      setDaftarKantorPenempatan(dataKantor);

      // Jika data berhasil didapat dan state kantorPenempatan masih kosong, pilih opsi pertama secara otomatis
      if (dataKantor.length > 0) {
        setKantorPenempatan((prev) => prev || dataKantor[0].nama_kantor);
      }
    } catch (error) {
      console.error("Gagal mengambil data kantor penempatan:", error);
    }
  };

  // FUNGSI AMBIL DATA DARI BACKEND
  const fetchDataKiriman = async () => {
    try {
      const response = await API.get("/kiriman-korporat");
      const dataFromServer = response.data.data || response.data;
      setDaftarKiriman(dataFromServer);
    } catch (error) {
      console.error("Gagal mengambil data dari server:", error);
    }
  };

  // SIMPAN ATAU KIRIM DATA KE BACKEND
  const handleSubmitMitra = async (e) => {
    e.preventDefault();
    if (!jumlahKiriman) {
      alert("Harap isi jumlah kiriman!");
      return;
    }

    if (!editId && !fileObjekMitra) {
      alert("File bukti kiriman / Excel mitra wajib diunggah!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("tanggal", tanggal);
      formData.append("nama_mitra", namaMitra);
      formData.append("jumlah", jumlahKiriman);
      formData.append("commodity", commodity);
      formData.append("kantor_penempatan", kantorPenempatan); // Key sesuai instruksi backend
      if (fileObjekMitra) {
        formData.append("file_bukti_mitra", fileObjekMitra);
      }

      if (editId) {
        formData.append("_method", "PUT");
        await API.post(`/kiriman-korporat/${editId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccessMessage("Data kiriman korporat berhasil diperbarui!");
      } else {
        await API.post("/kiriman-korporat", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccessMessage(
          "Berhasil mendaftarkan kiriman korporat! Status: Menunggu Penjemputan.",
        );
      }

      // TARIK DATA TERBARU DARI SERVER TERLEBIH DAHULU SEBELUM MUNCUL MODAL
      await fetchDataKiriman();

      setShowSuccessModal(true);
      setEditId(null);
      setJumlahKiriman("");
      setCommodity("Paket");
      if (daftarKantorPenempatan.length > 0) {
        setKantorPenempatan(daftarKantorPenempatan[0].nama_kantor);
      }
      setNamaFile("");
      setFileObjekMitra(null);
      setCurrentPage(1);
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
      alert(
        error.response?.data?.message ||
          "Terjadi kesalahan saat menyimpan data ke server.",
      );
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setNamaMitra(item.nama_mitra);
    setJumlahKiriman(item.jumlah);
    setCommodity(item.commodity || "Paket");
    setKantorPenempatan(
      item.kantor_penempatan ||
        (daftarKantorPenempatan.length > 0
          ? daftarKantorPenempatan[0].nama_kantor
          : ""),
    );
    setNamaFile("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus data kiriman ini?")) {
      try {
        await API.delete(`/kiriman-korporat/${id}`);
        setNotifSukses("Data kiriman berhasil dihapus.");
        fetchDataKiriman();
        setTimeout(() => setNotifSukses(""), 3000);
      } catch (error) {
        console.error("Gagal menghapus:", error);
        alert(error.response?.data?.message || "Gagal menghapus data.");
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

  const handleFilePickupChange = async (itemId, e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append("foto_bukti_pickup", file);

        await API.post(`/kiriman-korporat/${itemId}/pickup`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setNotifSukses(
          `Foto bukti jemput berhasil diunggah! Status otomatis berubah ke Dalam Perjalanan ke Loket.`,
        );
        fetchDataKiriman();
        setTimeout(() => setNotifSukses(""), 4000);
      } catch (error) {
        console.error("Gagal upload pickup:", error);
        alert(error.response?.data?.message || "Gagal mengunggah foto pickup.");
      }
    }
  };

  const handleUpdateStatus = async (id) => {
    try {
      await API.put(`/kiriman-korporat/${id}/terima`);
      fetchDataKiriman();
      setNotifSukses(`Status berhasil diperbarui menjadi: Selesai di Loket`);
      setTimeout(() => setNotifSukses(""), 3000);
    } catch (error) {
      console.error("Gagal memperbarui status:", error);
      alert(
        error.response?.data?.message || "Gagal memverifikasi paket di loket.",
      );
    }
  };

  const filteredData = daftarKiriman.filter((item) => {
    const matchesSearch = Object.values(item).some((val) =>
      String(val || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    );

    const matchTanggal =
      !filterTanggalRiwayat || item.tanggal === filterTanggalRiwayat;

    return matchesSearch && matchTanggal;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterTanggalRiwayat]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;

  return (
    <div className="pb-page-container" style={{ paddingBottom: "80px" }}>
      <div className="pb-top-banner">
        <div className="pb-banner-title">
          <span className="pb-accent-bar"></span>
          <div>
            <h2>Kiriman Korporat ({roleAktif.toUpperCase()})</h2>
            <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
              Kelola rekap kiriman korporat dan pemantauan status logistik
              secara real-time.
            </p>
          </div>
        </div>
      </div>

      {isSuperAdmin && (
        <div
          className="pb-main-card"
          style={{
            marginBottom: "24px",
            padding: "20px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
          }}
        >
          <p
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#1e293b",
              marginBottom: "12px",
            }}
          >
            Simulasi Ganti Tampilan / Role Pengguna (Khusus Admin/Superadmin):
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setRoleAktif("mitra")}
              style={{
                padding: "10px 18px",
                borderRadius: "8px",
                border: "none",
                fontWeight: "600",
                cursor: "pointer",
                background: roleAktif === "mitra" ? "#2563eb" : "#e2e8f0",
                color: roleAktif === "mitra" ? "#ffffff" : "#475569",
              }}
            >
              Mode Mitra (Input Form)
            </button>

            <button
              type="button"
              onClick={() => setRoleAktif("pickuper")}
              style={{
                padding: "10px 18px",
                borderRadius: "8px",
                border: "none",
                fontWeight: "600",
                cursor: "pointer",
                background: roleAktif === "pickuper" ? "#2563eb" : "#e2e8f0",
                color: roleAktif === "pickuper" ? "#ffffff" : "#475569",
              }}
            >
              Mode Pickuper (Kurir)
            </button>

            <button
              type="button"
              onClick={() => setRoleAktif("loket")}
              style={{
                padding: "10px 18px",
                borderRadius: "8px",
                border: "none",
                fontWeight: "600",
                cursor: "pointer",
                background: roleAktif === "loket" ? "#2563eb" : "#e2e8f0",
                color: roleAktif === "loket" ? "#ffffff" : "#475569",
              }}
            >
              Mode Loket / Petugas (Terima)
            </button>
          </div>
        </div>
      )}

      {notifSukses && (
        <div
          style={{
            background: "#dcfce7",
            border: "1px solid #86efac",
            color: "#166534",
            padding: "14px 18px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
            fontSize: "15px",
          }}
        >
          <span>✅</span>
          <span>{notifSukses}</span>
        </div>
      )}

      {/* FORM INPUT HANYA MUNCUL JIKA DI MODE MITRA */}
      {roleAktif === "mitra" && (
        <div
          className="pb-main-card"
          style={{
            marginBottom: "24px",
            border: editId ? "2px solid #f59e0b" : "1px solid #e2e8f0",
            background: editId ? "#fffbeb" : "#ffffff",
          }}
        >
          <div
            style={{
              marginBottom: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: editId ? "#d97706" : "#1e293b",
              }}
            >
              {editId
                ? "✏️ Mode Edit Data Kiriman Korporat"
                : "Form Input Kiriman Korporat (Mitra)"}
            </h3>
            {editId && (
              <span
                style={{
                  background: "#fef3c7",
                  color: "#d97706",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                Sedang Mengedit ID: {editId}
              </span>
            )}
          </div>

          <form onSubmit={handleSubmitMitra}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div className="pb-field-group">
                <label>Tanggal</label>
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

              <div className="pb-field-group">
                <label>Nama Mitra</label>
                <input
                  type="text"
                  value={namaMitra}
                  disabled
                  className="pb-input-control"
                  style={{
                    backgroundColor: "#f1f5f9",
                    color: "#475569",
                    cursor: "not-allowed",
                    fontWeight: "600",
                  }}
                />
              </div>

              {/* INPUT KANTOR PENEMPATAN (DINAMIS DARI API ?tipe=penempatan) */}
              <div className="pb-field-group">
                <label>Kantor Penempatan</label>
                <select
                  value={kantorPenempatan}
                  onChange={(e) => setKantorPenempatan(e.target.value)}
                  className="pb-input-control"
                  required
                >
                  <option value="" disabled>
                    -- Pilih Kantor Penempatan --
                  </option>
                  {daftarKantorPenempatan.map((item) => (
                    <option key={item.id} value={item.nama_kantor}>
                      {item.nama_kantor}
                    </option>
                  ))}
                </select>
              </div>

              {/* DROPDOWN COMMODITY */}
              <div className="pb-field-group">
                <label>Commodity (Jenis Kiriman)</label>
                <select
                  value={commodity}
                  onChange={(e) => setCommodity(e.target.value)}
                  className="pb-input-control"
                  required
                >
                  <option value="Paket">Paket</option>
                  <option value="Surat">Surat</option>
                </select>
              </div>

              <div className="pb-field-group">
                <label>Jumlah Kiriman</label>
                <input
                  type="number"
                  placeholder="Masukkan jumlah kiriman"
                  value={jumlahKiriman}
                  onChange={(e) => setJumlahKiriman(e.target.value)}
                  className="pb-input-control"
                  min="1"
                  required
                />
              </div>

              <div className="pb-field-group">
                <label>Upload File / Bukti / Excel Mitra</label>
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setNamaFile(file.name);
                      setFileObjekMitra(file);
                    }
                  }}
                  className="pb-input-control"
                />
                {namaFile && (
                  <small style={{ color: "#64748b", marginTop: "4px" }}>
                    File dipilih: {namaFile}
                  </small>
                )}
              </div>
            </div>

            <div
              className="pb-form-footer"
              style={{ marginTop: "24px", display: "flex", gap: "10px" }}
            >
              <button
                type="submit"
                style={{
                  background: editId ? "#f59e0b" : "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "11px 20px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                {editId ? "Simpan Perubahan Data" : "Simpan & Kirim Permintaan"}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditId(null);
                    setJumlahKiriman("");
                    setCommodity("Paket");
                    if (daftarKantorPenempatan.length > 0) {
                      setKantorPenempatan(
                        daftarKantorPenempatan[0].nama_kantor,
                      );
                    }
                    setNamaFile("");
                    setFileObjekMitra(null);
                  }}
                  style={{
                    background: "#cbd5e1",
                    border: "none",
                    padding: "11px 16px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: "pointer",
                    color: "#334155",
                  }}
                >
                  Batal Edit
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* TABEL DAFTAR STATUS / RIWAYAT */}
      <div className="lp-card">
        <div className="lp-header" style={{ marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: "600" }}>
              Daftar Status Kiriman Korporat ({roleAktif.toUpperCase()})
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
              Daftar riwayat kiriman korporat yang telah diajukan.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "16px",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="Cari berdasarkan nama mitra..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="lp-search-input"
            style={{ flex: "1", minWidth: "240px" }}
          />
          <input
            type="text"
            placeholder="Pilih Tanggal (YYYY-MM-DD)"
            value={filterTanggalRiwayat}
            onChange={(e) => setFilterTanggalRiwayat(e.target.value)}
            onFocus={(e) => (e.target.type = "date")}
            onBlur={(e) => {
              if (!e.target.value) e.target.type = "text";
            }}
            style={{
              width: "200px",
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "14px",
              backgroundColor: "#ffffff",
              color: "#334155",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div className="lp-table-responsive">
          <table className="lp-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Nama Mitra</th>
                <th>Kantor Penempatan</th>
                <th>Commodity</th>
                <th>Jumlah</th>
                <th>File / Bukti Mitra</th>
                {(roleAktif === "mitra" || roleAktif === "pickuper") && (
                  <th>Foto Pickup (Bukti Jemput)</th>
                )}
                <th>Status Terkini</th>
                {roleAktif !== "pickuper" && <th>Aksi & Kelola</th>}
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((item, index) => {
                  const statusLabel = item.status || "Menunggu Penjemputan";
                  const isBelumDiambil = statusLabel === "Menunggu Penjemputan";

                  return (
                    <tr
                      key={item.id}
                      style={{
                        background:
                          editId === item.id ? "#fef3c7" : "transparent",
                      }}
                    >
                      <td>{indexOfFirstItem + index + 1}</td>
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
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "600",
                            background:
                              item.commodity === "Surat"
                                ? "#e0e7ff"
                                : "#f1f5f9",
                            color:
                              item.commodity === "Surat"
                                ? "#3730a3"
                                : "#334155",
                          }}
                        >
                          {item.commodity || "Paket"}
                        </span>
                      </td>
                      <td>{item.jumlah}</td>
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

                      {(roleAktif === "mitra" || roleAktif === "pickuper") && (
                        <td>
                          {roleAktif === "pickuper" ? (
                            item.foto_bukti_pickup ? (
                              <button
                                onClick={() =>
                                  handleLihatBukti(item.foto_bukti_pickup)
                                }
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#16a34a",
                                  cursor: "pointer",
                                  textDecoration: "underline",
                                  fontWeight: "500",
                                  padding: "0",
                                }}
                              >
                                ✅ Lihat Foto Jemput
                              </button>
                            ) : (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "6px",
                                }}
                              >
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleFilePickupChange(item.id, e)
                                  }
                                  style={{ fontSize: "11px" }}
                                />
                                <span
                                  style={{ fontSize: "11px", color: "#64748b" }}
                                >
                                  Belum ada foto
                                </span>
                              </div>
                            )
                          ) : item.foto_bukti_pickup ? (
                            <button
                              onClick={() =>
                                handleLihatBukti(item.foto_bukti_pickup)
                              }
                              style={{
                                background: "none",
                                border: "none",
                                color: "#16a34a",
                                cursor: "pointer",
                                textDecoration: "underline",
                                fontWeight: "500",
                                padding: "0",
                              }}
                            >
                              ✅ Lihat Foto Jemput
                            </button>
                          ) : (
                            <span
                              style={{
                                color: "#94a3b8",
                                fontStyle: "italic",
                                fontSize: "12px",
                              }}
                            >
                              Belum dijemput kurir
                            </span>
                          )}
                        </td>
                      )}

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

                      {roleAktif !== "pickuper" && (
                        <td>
                          <div
                            style={{
                              display: "flex",
                              gap: "6px",
                              alignItems: "center",
                              flexDirection: "row",
                              flexWrap: "wrap",
                            }}
                          >
                            {roleAktif === "mitra" && isBelumDiambil && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleEdit(item)}
                                  style={{
                                    background: "#f59e0b",
                                    color: "white",
                                    border: "none",
                                    padding: "5px 10px",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(item.id)}
                                  style={{
                                    background: "#ef4444",
                                    color: "white",
                                    border: "none",
                                    padding: "5px 10px",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                  }}
                                >
                                  Hapus
                                </button>
                              </>
                            )}

                            {roleAktif === "loket" &&
                              statusLabel === "Dalam Perjalanan ke Loket" && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(item.id)}
                                  style={{
                                    background: "#16a34a",
                                    color: "white",
                                    border: "none",
                                    padding: "6px 12px",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                  }}
                                >
                                  Terima di Loket
                                </button>
                              )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={roleAktif === "pickuper" ? "9" : "10"}
                    className="lp-empty-row"
                  >
                    Belum ada data kiriman korporat yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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

      {showSuccessModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "420px",
              background: "#ffffff",
              borderRadius: "14px",
              padding: "30px 24px",
              textAlign: "center",
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "#dcfce7",
                color: "#16a34a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: "32px",
                fontWeight: "700",
              }}
            >
              ✓
            </div>
            <h3
              style={{ margin: "0 0 10px", fontSize: "20px", color: "#1e293b" }}
            >
              Berhasil!
            </h3>
            <p
              style={{
                margin: "0 0 22px",
                color: "#64748b",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            >
              {successMessage}
            </p>
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              style={{
                width: "100%",
                border: "none",
                borderRadius: "8px",
                padding: "11px 16px",
                background: "#2563eb",
                color: "#ffffff",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Oke, Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default KirimanKorporat;
