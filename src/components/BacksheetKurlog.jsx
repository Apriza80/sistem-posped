import React, { useState, useEffect } from "react";
import API from "./axios";
import "./BacksheetPospay.css";

function BacksheetKurlog({
  userActive = { nama: "Cece Zia", kantor: "Kantor Pos Krembung" },
}) {
  const [tanggalUpload, setTanggalUpload] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [jenisPembayaran, setJenisPembayaran] = useState("Tunai");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [filterJenis, setFilterJenis] = useState("Tunai");
  const [filterKantor, setFilterKantor] = useState("Semua Kantor");
  const [filterTanggal, setFilterTanggal] = useState("");

  const [riwayatBacksheet, setRiwayatBacksheet] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk daftar master kantor dari backend (/kantor-cabang)
  const [daftarKantor, setDaftarKantor] = useState([]);

  // Jika role petugas, otomatis kunci filter kantor ke kantor petugas yang aktif
  useEffect(() => {
    if (userActive?.role === "petugas" && userActive?.kantor) {
      setFilterKantor(userActive.kantor);
    }
  }, [userActive]);

  // ==============================
  // AMBIL DATA DARI BACKEND
  // ==============================
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await API.get("/backsheet-kurlog");
      setRiwayatBacksheet(res.data.data ?? res.data);
    } catch (err) {
      console.error(
        err.response?.data?.message || "Gagal mengambil data backsheet kurlog",
      );
    } finally {
      setLoading(false);
    }
  };

  // Ambil daftar master kantor dari backend (/kantor-cabang)
  const fetchDaftarKantor = async () => {
    try {
      const res = await API.get("/kantor-cabang");
      const dataKantor = res.data.data ?? res.data;
      if (Array.isArray(dataKantor)) {
        setDaftarKantor(dataKantor);
      }
    } catch (err) {
      console.error("Gagal mengambil master kantor:", err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchDaftarKantor();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // ==============================
  // UPLOAD FILE KE BACKEND
  // ==============================
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!tanggalUpload) {
      alert("Pilih tanggal dokumen terlebih dahulu!");
      return;
    }
    if (!selectedFile) {
      alert("Silakan telusuri dan pilih file dokumen!");
      return;
    }

    const formData = new FormData();
    formData.append("tanggal", tanggalUpload);
    formData.append("jenis_pembayaran", jenisPembayaran);
    formData.append("file", selectedFile);
    if (userActive?.kantor) {
      formData.append("kantor_pos", userActive.kantor);
    }

    try {
      setUploading(true);
      await API.post("/backsheet-kurlog", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Dokumen Backsheet Kurlog berhasil diunggah!");
      setSelectedFile(null);
      fetchData();
    } catch (err) {
      console.error(err.response?.data?.errors || err.response?.data?.message);
      alert(
        err.response?.data?.message ||
          "Gagal upload dokumen. Cek kembali file/koneksi.",
      );
    } finally {
      setUploading(false);
    }
  };

  // ==============================
  // HAPUS DATA DI BACKEND
  // ==============================
  const handleHapus = async (id) => {
    if (
      !window.confirm(
        "Apakah Cece yakin ingin menghapus file backsheet kurlog ini?",
      )
    )
      return;

    try {
      await API.delete(`/backsheet-kurlog/${id}`);
      setRiwayatBacksheet((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err.response?.data?.message);
      alert("Gagal menghapus data.");
    }
  };

  // ==============================
  // LIHAT (PREVIEW) FILE - lewat endpoint auth, ambil sebagai blob
  // ==============================
  const handlePreview = async (item) => {
    try {
      const res = await API.get(`/backsheet-kurlog/${item.id}/preview`, {
        responseType: "blob",
      });
      const blobUrl = window.URL.createObjectURL(res.data);
      window.open(blobUrl, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      console.error(err);
      alert("Gagal membuka file. File mungkin tidak ditemukan di server.");
    }
  };

  // ==============================
  // DOWNLOAD FILE - lewat endpoint auth, ambil sebagai blob
  // ==============================
  const handleDownload = async (item) => {
    try {
      const res = await API.get(`/backsheet-kurlog/${item.id}/download`, {
        responseType: "blob",
      });
      const blobUrl = window.URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = item.nama_file || "backsheet";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error(err);
      alert("Gagal mengunduh file. File mungkin tidak ditemukan di server.");
    }
  };

  const filteredRiwayat = riwayatBacksheet.filter((item) => {
    const matchJenis = item.jenis_pembayaran === filterJenis;
    const matchKantor =
      userActive?.role === "petugas"
        ? item.kantor_pos?.toLowerCase() === userActive.kantor?.toLowerCase()
        : filterKantor === "Semua Kantor" ||
          (item.kantor_pos &&
            item.kantor_pos.toLowerCase() === filterKantor.toLowerCase());
    const matchTanggal = !filterTanggal || item.tanggal === filterTanggal;

    return matchJenis && matchKantor && matchTanggal;
  });

  const renderFileIcon = (tipeFile) => {
    if (["xlsx", "xls", "csv"].includes(tipeFile))
      return <span className="icon-excel">📊</span>;
    if (["jpg", "jpeg", "png"].includes(tipeFile))
      return <span className="icon-image">🖼️</span>;
    return <span className="icon-pdf">📕</span>;
  };

  return (
    <div className="backsheet-page">
      {/* 1. HEADER HALAMAN */}
      <h1 className="page-title">Backsheet Kurlog</h1>

      {/* 2. AREA FORM UPLOAD */}
      <div className="card backsheet-upload-card">
        <div className="upload-header">
          <div>
            <h3 className="card-heading">Upload Backsheet</h3>
          </div>
        </div>

        <form onSubmit={handleUploadSubmit}>
          <div className="upload-form-row">
            {/* Tanggal Upload */}
            <div className="form-group-field">
              <input
                type="date"
                className="input-date-custom"
                value={tanggalUpload}
                onChange={(e) => setTanggalUpload(e.target.value)}
              />
            </div>

            {/* Dropdown Pilihan Tunai / Non Tunai */}
            <div className="form-group-field">
              <select
                className="kantor-select"
                value={jenisPembayaran}
                onChange={(e) => setJenisPembayaran(e.target.value)}
              >
                <option value="Tunai">Tunai</option>
                <option value="Non Tunai">Non Tunai</option>
              </select>
            </div>

            {/* File Input */}
            <div className="form-group-field flex-grow-file">
              <div className="custom-file-wrapper">
                <label htmlFor="file-upload-kurlog" className="btn-browse-file">
                  📎 Telusuri
                </label>
                <input
                  type="file"
                  id="file-upload-kurlog"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  accept=".pdf,.xlsx,.xls,.csv,.jpg,.jpeg,.png"
                />
                <div className="file-name-display">
                  {selectedFile ? selectedFile.name : "Belum ada file dipilih"}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn-upload-submit"
              disabled={uploading}
            >
              {uploading ? "⏳ Mengunggah..." : "⬆ Upload Backsheet"}
            </button>
          </div>
        </form>
      </div>

      {/* PEMBATAS & TITLE RIWAYAT */}
      <div className="section-divider">
        <h3 className="section-title">Riwayat Upload Backsheet</h3>
      </div>

      {/* 3. AREA FILTER RIWAYAT */}
      <div className="card filter-bar-simple">
        <div className="filter-item">
          <label className="filter-label">JENIS PEMBAYARAN</label>
          <select
            className="kantor-select"
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
          >
            <option value="Tunai">Tunai</option>
            <option value="Non Tunai">Non Tunai</option>
          </select>
        </div>

        {userActive?.role !== "petugas" && (
          <div className="filter-item">
            <label className="filter-label">KANTOR POS</label>
            <select
              className="kantor-select"
              value={filterKantor}
              onChange={(e) => setFilterKantor(e.target.value)}
            >
              <option value="Semua Kantor">Semua Kantor</option>
              {daftarKantor.length > 0
                ? daftarKantor.map((kantor) => {
                    const namaKantor =
                      kantor.nama_kantor || kantor.nama || kantor;
                    return (
                      <option key={kantor.id || namaKantor} value={namaKantor}>
                        {namaKantor}
                      </option>
                    );
                  })
                : Array.from(
                    new Set(
                      riwayatBacksheet
                        .map((item) => item.kantor_pos)
                        .filter(Boolean),
                    ),
                  ).map((kantorName) => (
                    <option key={kantorName} value={kantorName}>
                      {kantorName}
                    </option>
                  ))}
            </select>
          </div>
        )}

        <div className="filter-item">
          <label className="filter-label">FILTER TANGGAL</label>
          <input
            type="date"
            className="search-input-date"
            value={filterTanggal}
            onChange={(e) => setFilterTanggal(e.target.value)}
          />
        </div>

        {filterTanggal && (
          <button
            className="btn-reset-date"
            onClick={() => setFilterTanggal("")}
          >
            Reset Tgl
          </button>
        )}
      </div>

      {/* 4. TABEL DATA RIWAYAT */}
      <div className="card table-card-container">
        {loading ? (
          <div className="empty-state-msg">Memuat data...</div>
        ) : filteredRiwayat.length > 0 ? (
          <div className="table-responsive">
            <table className="table-backsheet">
              <thead>
                <tr>
                  <th>NO</th>
                  <th>TANGGAL</th>
                  <th>NAMA FILE</th>
                  <th>KANTOR POS</th>
                  <th style={{ textAlign: "center" }}>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {filteredRiwayat.map((item, index) => (
                  <tr key={item.id}>
                    <td className="text-muted">{index + 1}</td>
                    <td className="text-bold">{item.tanggal}</td>
                    <td>
                      <div className="file-info-cell">
                        {renderFileIcon(item.tipe_file)}
                        <span className="file-name-text">{item.nama_file}</span>
                      </div>
                    </td>
                    <td>{item.kantor_pos}</td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <button
                        className="btn-action-view"
                        onClick={() => handlePreview(item)}
                      >
                        👁️ Lihat
                      </button>
                      <button
                        className="btn-action-down"
                        onClick={() => handleDownload(item)}
                      >
                        📥 Download
                      </button>
                      <button
                        className="btn-action-del"
                        onClick={() => handleHapus(item.id)}
                      >
                        🗑️ Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state-msg">
            Belum ada data dokumen Backsheet Kurlog ({filterJenis}) yang
            tersimpan sesuai filter.
          </div>
        )}
      </div>
    </div>
  );
}

export default BacksheetKurlog;
