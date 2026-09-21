import React, { useState, useEffect } from "react";
import API from "./axios";
import "./AgenPos.css";

const API_DOMAIN = API.defaults.baseURL.replace(/\/api\/?$/, "");

function buildFileUrl(item) {
  if (item.file_url) return item.file_url;
  if (item.file_path) {
    const cleanPath = item.file_path.replace(/^\/+/, "");
    return `${API_DOMAIN}/storage/${cleanPath}`;
  }
  return null;
}

function AgenPos({ userActive, onSimpanData, editData, dataList }) {
  // Cek apakah user adalah admin/superadmin pusat
  const isAdminOrSuper =
    userActive?.role === "superadmin" || userActive?.role === "admin";

  // Tanggal paten hari ini
  const tanggalHariIni = new Date().toISOString().split("T")[0];

  const [tanggal, setTanggal] = useState(tanggalHariIni);

  // Nama user login sebagai penanggung jawab / nama agen otomatis
  const namaUserLogin = userActive?.nama || userActive?.name || "Agen Pos";
  const [namaAgen, setNamaAgen] = useState(namaUserLogin);

  // State Metode Pembayaran
  const [metodePembayaran, setMetodePembayaran] = useState("Tunai");

  // State Jenis Produk, Nominal Master, Jumlah Keping
  const [jenisProduk, setJenisProduk] = useState("Materai");

  // Ambil daftar harga master perangko dari localStorage
  const [daftarHargaPerangko, setDaftarHargaPerangko] = useState(() => {
    const saved = localStorage.getItem("master_daftar_harga_perangko");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        /* ignore */
      }
    }
    const def = [];
    for (let i = 500; i <= 10000; i += 500) def.push(i);
    return def;
  });

  const [nominalPerangko, setNominalPerangko] = useState(
    daftarHargaPerangko[0] || 500,
  );

  // Ambil harga master materai dari localStorage (sinkron dengan halaman admin)
  const [masterHargaMaterai, setMasterHargaMaterai] = useState(() => {
    const saved = localStorage.getItem("master_harga_materai");
    return saved ? Number(saved) : 10000;
  });

  const [jumlahKeping, setJumlahKeping] = useState("");

  const [keterangan, setKeterangan] = useState("");
  const [buktiPembayaran, setBuktiPembayaran] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [dataRiwayatServer, setDataRiwayatServer] = useState([]);

  // State untuk Filter Tanggal & Pagination Riwayat
  const [filterTanggal, setFilterTanggal] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sinkronisasi otomatis Nama Agen & Harga Master dari localStorage
  useEffect(() => {
    if (userActive) {
      const currentName = userActive?.nama || userActive?.name || "Agen Pos";
      setNamaAgen(currentName);
    }

    const handleStorageChange = () => {
      const savedMaterai = localStorage.getItem("master_harga_materai");
      if (savedMaterai) {
        setMasterHargaMaterai(Number(savedMaterai));
      }
      const savedPerangko = localStorage.getItem(
        "master_daftar_harga_perangko",
      );
      if (savedPerangko) {
        try {
          const parsed = JSON.parse(savedPerangko);
          setDaftarHargaPerangko(parsed);
          if (!parsed.includes(Number(nominalPerangko))) {
            setNominalPerangko(parsed[0]);
          }
        } catch (e) {
          /* ignore */
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [userActive, nominalPerangko]);

  const fetchAgenPos = async () => {
    try {
      const response = await API.get("/agen-pos");
      if (response.data.status === "success") {
        const processedData = response.data.data.map((item) => ({
          ...item,
          file_url: buildFileUrl(item),
        }));
        setDataRiwayatServer(processedData);
      }
    } catch (error) {
      console.error("Gagal memuat data agen pos:", error);
    }
  };

  useEffect(() => {
    fetchAgenPos();
  }, [userActive]);

  // Filter data berdasarkan role & tanggal
  const sourceData =
    dataRiwayatServer.length > 0 ? dataRiwayatServer : dataList || [];

  const dataRiwayatKantor = sourceData.filter((item) => {
    // 1. Cek hak akses role berdasarkan nama agen
    const pembuatItem = String(
      item.nama_agen ||
        item.namaAgen ||
        item.user_nama ||
        item.nama_user ||
        item.petugas ||
        "",
    )
      .trim()
      .toLowerCase();

    const currentUser = String(namaUserLogin).trim().toLowerCase();

    // Jika bukan admin/superadmin, cocokan dengan nama agen yang sedang login
    const isOwner =
      pembuatItem === currentUser ||
      pembuatItem.includes(currentUser) ||
      currentUser.includes(pembuatItem);

    if (!isAdminOrSuper && !isOwner) {
      return false;
    }

    // 2. Cek filter tanggal jika diisi
    if (filterTanggal) {
      const itemTanggal = String(item.tanggal || "").split("T")[0];
      if (itemTanggal !== filterTanggal) {
        return false;
      }
    }

    return true;
  });

  // Logika Pagination (1-10 per halaman)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDataRiwayat = dataRiwayatKantor.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(dataRiwayatKantor.length / itemsPerPage) || 1;

  // Reset ke halaman 1 jika filter tanggal berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [filterTanggal]);

  useEffect(() => {
    if (editData) {
      setTanggal(editData.tanggal || tanggalHariIni);
      setNamaAgen(editData.nama_agen || editData.namaAgen || namaUserLogin);
      const metodeEdit =
        editData.metode_pembayaran || editData.metode || "Tunai";
      setMetodePembayaran(metodeEdit);
      setJenisProduk(
        editData.jenis_produk || editData.jenisProduk || "Materai",
      );
      setNominalPerangko(
        Number(
          editData.nominal_perangko ||
            editData.nominalPerangko ||
            daftarHargaPerangko[0] ||
            500,
        ),
      );
      setJumlahKeping(editData.jumlah_keping || editData.jumlahKeping || "");
      setKeterangan(editData.keterangan || "");
      setBuktiPembayaran(null);
      setPreviewUrl(buildFileUrl(editData) || editData.buktiBayarUrl || "");
    } else {
      setTanggal(tanggalHariIni);
      setNamaAgen(namaUserLogin);
      setMetodePembayaran("Tunai");
      setJenisProduk("Materai");
      setNominalPerangko(daftarHargaPerangko[0] || 500);
      setJumlahKeping("");
      setKeterangan("");
      setBuktiPembayaran(null);
      setPreviewUrl("");
    }
  }, [editData, tanggalHariIni, namaUserLogin, daftarHargaPerangko]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBuktiPembayaran(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSimpan = async (e) => {
    e.preventDefault();
    if (!tanggal || !namaAgen) {
      alert("Harap isi Tanggal dan Nama Agen!");
      return;
    }

    if (!jumlahKeping || Number(jumlahKeping) <= 0) {
      alert("Harap masukkan jumlah keping dengan benar!");
      return;
    }

    // Validasi jika Non Tunai wajib upload bukti pembayaran baru atau sudah ada preview saat edit
    if (metodePembayaran === "Non Tunai" && !buktiPembayaran && !previewUrl) {
      alert("Metode Non Tunai wajib mengunggah bukti pembayaran!");
      return;
    }

    const nominalFinal =
      jenisProduk === "Materai" ? masterHargaMaterai : nominalPerangko;
    const totalNilaiFinal = nominalFinal * Number(jumlahKeping);

    const formData = new FormData();
    formData.append("tanggal", tanggal);
    formData.append("nama_agen", namaAgen);
    formData.append("metode_pembayaran", metodePembayaran);
    formData.append("jenis_produk", jenisProduk);
    formData.append("nominal_perangko", nominalFinal);
    formData.append("jumlah_keping", jumlahKeping);
    formData.append("total_nilai", totalNilaiFinal);
    formData.append("keterangan", keterangan || "");
    formData.append("nama_user", namaUserLogin);

    // Kirim bukti pembayaran hanya jika metode Non Tunai dan file tersedia
    if (metodePembayaran === "Non Tunai" && buktiPembayaran) {
      formData.append("bukti_pembayaran", buktiPembayaran);
    }

    if (editData) {
      formData.append("_method", "PUT");
    }

    try {
      let response;
      if (editData) {
        response = await API.post(`/agen-pos/${editData.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await API.post("/agen-pos", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      fetchAgenPos();

      // Cukup panggil onSimpanData atau alert sekali saja untuk mencegah pop-up ganda
      if (onSimpanData) {
        onSimpanData(response.data.data);
      } else {
        alert(
          response.data.message || "Data Agen Pos berhasil disimpan ke server!",
        );
      }

      if (!editData) {
        setNamaAgen(namaUserLogin);
        setMetodePembayaran("Tunai");
        setJenisProduk("Materai");
        setNominalPerangko(daftarHargaPerangko[0] || 500);
        setJumlahKeping("");
        setKeterangan("");
        setBuktiPembayaran(null);
        setPreviewUrl("");
      }
    } catch (error) {
      console.error("Gagal menyimpan ke backend:", error.response || error);
      if (error.response && error.response.data) {
        if (error.response.data.errors) {
          const errorMessages = Object.values(error.response.data.errors)
            .flat()
            .join("\n");
          alert("Validasi Gagal:\n" + errorMessages);
        } else {
          alert(
            "Error Server: " +
              (error.response.data.message ||
                JSON.stringify(error.response.data)),
          );
        }
      } else {
        alert("Terjadi kesalahan saat menghubungi server.");
      }
    }
  };

  return (
    <div className="pb-page-container">
      <div className="pb-top-banner">
        <div className="pb-banner-title">
          <span className="pb-accent-bar"></span>
          <h2>Kelola Agen Pos</h2>
        </div>
      </div>

      <div
        className={`pb-main-card ${editData ? "ap-card-editing" : ""}`}
        style={{ marginBottom: "24px" }}
      >
        <div className="pb-card-header">
          <div>
            <h3>
              {editData ? "Edit Data Agen Pos" : "Formulir Input Agen Pos"}
            </h3>
          </div>
          {editData && (
            <span className="ap-badge-editing">
              ⚠️ Mode Edit (ID: {editData.id})
            </span>
          )}
        </div>

        <form onSubmit={handleSimpan}>
          <div className="pb-grid-2col">
            <div className="pb-field-group">
              <label>Tanggal</label>
              <input
                type="date"
                value={tanggal}
                readOnly
                className="pb-input-control pb-locked-input"
              />
            </div>

            <div className="pb-field-group">
              <label>Nama Agen</label>
              <input
                type="text"
                value={namaAgen}
                readOnly
                className="pb-input-control pb-locked-input"
                style={{ fontWeight: "600", color: "#333" }}
              />
            </div>

            <div className="pb-field-group">
              <label>Metode Pembayaran</label>
              <select
                value={metodePembayaran}
                onChange={(e) => {
                  const val = e.target.value;
                  setMetodePembayaran(val);
                  // Jika diubah ke Tunai, bersihkan file bukti agar form bersih & tidak ikut terkirim
                  if (val === "Tunai") {
                    setBuktiPembayaran(null);
                    setPreviewUrl("");
                  }
                }}
                className="pb-input-control"
              >
                <option value="Tunai">Tunai</option>
                <option value="Non Tunai">Non Tunai</option>
              </select>
            </div>

            <div className="pb-field-group">
              <label>Jenis Produk Order</label>
              <select
                value={jenisProduk}
                onChange={(e) => {
                  setJenisProduk(e.target.value);
                  setJumlahKeping("");
                }}
                className="pb-input-control"
              >
                <option value="Materai">Materai</option>
                <option value="Perangko">Perangko</option>
              </select>
            </div>

            {jenisProduk === "Perangko" && (
              <div className="pb-field-group">
                <label>Perangko (Nominal)</label>
                <select
                  value={nominalPerangko}
                  onChange={(e) => setNominalPerangko(Number(e.target.value))}
                  className="pb-input-control"
                >
                  {daftarHargaPerangko.map((harga) => (
                    <option key={harga} value={harga}>
                      Rp {harga.toLocaleString("id-ID")}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {jenisProduk === "Materai" && (
              <div className="pb-field-group">
                <label>Nominal Materai</label>
                <input
                  type="text"
                  value={`Rp ${Number(masterHargaMaterai).toLocaleString("id-ID")}`}
                  readOnly
                  className="pb-input-control pb-locked-input"
                  style={{ fontWeight: "600", color: "#1d4ed8" }}
                />
              </div>
            )}

            <div className="pb-field-group">
              <label>Jumlah Keping</label>
              <input
                type="number"
                placeholder="Masukkan jumlah keping..."
                value={jumlahKeping}
                onChange={(e) => setJumlahKeping(e.target.value)}
                className="pb-input-control"
                min="1"
                required
              />
            </div>

            <div className="pb-field-group">
              <label>Total Nilai</label>
              <input
                type="text"
                value={`Rp ${((jenisProduk === "Materai" ? masterHargaMaterai : nominalPerangko) * (Number(jumlahKeping) || 0)).toLocaleString("id-ID")}`}
                readOnly
                className="pb-input-control pb-locked-input"
                style={{ fontWeight: "700", color: "#1d4ed8" }}
              />
            </div>

            <div className="pb-field-group" style={{ gridColumn: "span 2" }}>
              <label>Keterangan / Detail</label>
              <input
                type="text"
                placeholder="Masukkan keterangan atau alamat agen"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                className="pb-input-control"
              />
            </div>

            {/* Muncul hanya jika metode pembayaran Non Tunai */}
            {metodePembayaran === "Non Tunai" && (
              <div className="pb-field-group" style={{ gridColumn: "span 2" }}>
                <label>
                  Upload Bukti Pembayaran{" "}
                  <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="pb-input-control"
                  accept="image/*,application/pdf"
                  required={!previewUrl}
                />
                {previewUrl && (
                  <div style={{ marginTop: "8px" }}>
                    <small style={{ color: "#16a34a", fontWeight: "600" }}>
                      ✓ Berkas bukti tersedia
                    </small>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pb-form-footer">
            <button
              type="submit"
              className={`pb-btn-submit ${editData ? "ap-btn-update" : ""}`}
            >
              {editData ? "🔄 Perbarui Data Agen" : "Simpan Data Agen"}
            </button>
          </div>
        </form>
      </div>

      <div className="pb-main-card">
        <div
          className="pb-card-header"
          style={{ marginBottom: "16px", display: "block" }}
        >
          <h3>
            {isAdminOrSuper
              ? "Riwayat Seluruh Agen Pos"
              : "Riwayat Agen Pos Anda"}
          </h3>

          {/* Filter Tanggal di bawah judul tanpa tulisan label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "10px",
            }}
          >
            <input
              type="date"
              value={filterTanggal}
              onChange={(e) => setFilterTanggal(e.target.value)}
              className="pb-input-control"
              style={{ padding: "6px 10px", fontSize: "13px", width: "160px" }}
            />
            {filterTanggal && (
              <button
                type="button"
                onClick={() => setFilterTanggal("")}
                style={{
                  padding: "6px 10px",
                  backgroundColor: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="rpb-table-responsive">
          <table className="rpb-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Nama Agen</th>
                <th>Metode</th>
                <th>Produk</th>
                <th>Detail Order</th>
                <th>Status</th>
                <th>Catatan User</th>
                <th style={{ textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentDataRiwayat.length > 0 ? (
                currentDataRiwayat.map((item, index) => {
                  const produk =
                    item.jenis_produk ||
                    item.jenisProduk ||
                    item.produk ||
                    item.jenis ||
                    "Materai";

                  const keping = Number(
                    item.jumlah_keping ||
                      item.jumlahKeping ||
                      item.keping ||
                      item.qty ||
                      item.jumlah ||
                      0,
                  );

                  const nominal = Number(
                    item.nominal_perangko ||
                      item.nominalPerangko ||
                      item.harga_satuan ||
                      item.nominal ||
                      (String(produk).toLowerCase().includes("perangko")
                        ? 500
                        : masterHargaMaterai),
                  );

                  const total =
                    item.total_nilai ||
                    item.totalNilai ||
                    item.total ||
                    nominal * keping;

                  const metode =
                    item.metode_pembayaran ||
                    item.metode ||
                    item.metodePembayaran ||
                    "Tunai";

                  const rowNumber = indexOfFirstItem + index + 1;

                  return (
                    <tr key={item.id || index}>
                      <td>{rowNumber}</td>
                      <td>{item.tanggal || "-"}</td>
                      <td>{item.nama_agen || item.namaAgen || "-"}</td>
                      <td>
                        <span style={{ fontWeight: "500" }}>{metode}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: "600", color: "#2563eb" }}>
                          {produk}
                        </span>
                      </td>
                      <td>
                        <span>
                          {keping} Keping (@Rp {nominal.toLocaleString("id-ID")}
                          ) = <b>Rp {Number(total).toLocaleString("id-ID")}</b>
                        </span>
                      </td>
                      <td>
                        <span
                          className={`rpb-badge-status ${
                            (item.status || "Order") === "Kirim"
                              ? "status-dipenuhi"
                              : "status-order"
                          }`}
                        >
                          {item.status || "Order"}
                        </span>
                      </td>
                      <td style={{ color: "#d97706", fontWeight: "600" }}>
                        {item.catatan_user || item.catatanAdmin || "-"}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => {
                            const urlGambar = buildFileUrl(item);
                            if (!urlGambar) {
                              alert(
                                "Tidak ada file bukti pembayaran untuk data ini.",
                              );
                              return;
                            }
                            const finalUrl = urlGambar.includes(
                              "ngrok-free.dev",
                            )
                              ? `${urlGambar}?ngrok-skip-browser-warning=true`
                              : urlGambar;
                            window.open(finalUrl, "_blank");
                          }}
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
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="9"
                    className="rpb-empty-row"
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#777",
                    }}
                  >
                    Belum ada riwayat agen pos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Kontrol Pagination (1-10 per halaman) */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "16px",
              padding: "0 8px",
            }}
          >
            <span style={{ fontSize: "13px", color: "#64748b" }}>
              Menampilkan Halaman {currentPage} dari {totalPages} (Total{" "}
              {dataRiwayatKantor.length} data)
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: currentPage === 1 ? "#f1f5f9" : "white",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  fontSize: "13px",
                }}
              >
                ◀ Sebelumnya
              </button>
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
                  backgroundColor:
                    currentPage === totalPages ? "#f1f5f9" : "white",
                  cursor:
                    currentPage === totalPages ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  fontSize: "13px",
                }}
              >
                Selanjutnya ▶
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AgenPos;
