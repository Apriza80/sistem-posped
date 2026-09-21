import React, { useState, useEffect } from "react";
import API from "./axios";
import "./KelolaUser.css";
import * as XLSX from "xlsx"; // Library resmi untuk membaca dan menulis Excel dengan rapi

function KelolaUser() {
  const [dataUser, setDataUser] = useState([]);
  const [loading, setLoading] = useState(true);

  const [namaPetugas, setNamaPetugas] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("petugas");
  const [kantorPenugasan, setKantorPenugasan] = useState("");
  const [editId, setEditId] = useState(null);

  // Fitur Tambahan: Pencarian & Paginasi
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fitur Tambahan: State untuk menyembunyikan/menampilkan password per baris
  const [showPasswordIds, setShowPasswordIds] = useState({});

  const toggleShowPassword = (id) => {
    setShowPasswordIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Daftar kantor diambil dari database (Kelola Kantor)
  const [daftarKantor, setDaftarKantor] = useState([]);

  const fetchDaftarKantor = async () => {
    try {
      const res = await API.get("/kantor-cabang");
      setDaftarKantor(res.data.data ?? res.data);
    } catch (error) {
      console.error("Gagal mengambil daftar kantor:", error);
    }
  };

  // Ambil data user dari backend saat komponen dimuat
  useEffect(() => {
    fetchUsers();
    fetchDaftarKantor();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await API.get("/users");
      const mappedData = response.data.data.map((item) => ({
        id: item.id,
        nama: item.name,
        username: item.nippos,
        passwordPlain: item.password_plain || item.password || "********",
        role: item.role,
        kantor: item.kantor || "-",
      }));
      setDataUser(mappedData);
    } catch (error) {
      console.error("Gagal mengambil data user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSimpan = async (e) => {
    e.preventDefault();
    // Kantor Penugasan dihapus dari syarat wajib (menjadi opsional)
    if (!namaPetugas || !username || !role) {
      alert("Harap isi Nama, Nippos, dan Role!");
      return;
    }

    if (!editId && !password) {
      alert("Password wajib diisi untuk user baru!");
      return;
    }

    const payload = {
      name: namaPetugas,
      username: username,
      password: password,
      role: role.toLowerCase(),
      kantor: kantorPenugasan || null,
    };

    try {
      if (editId) {
        if (!password) {
          delete payload.password;
        }
        await API.put(`/users/${editId}`, payload);
        alert("Data user berhasil diperbarui!");
      } else {
        await API.post("/users", payload);
        alert("User baru berhasil ditambahkan!");
      }

      setEditId(null);
      setNamaPetugas("");
      setUsername("");
      setPassword("");
      setRole("petugas");
      setKantorPenugasan("");
      fetchUsers();
    } catch (error) {
      console.error("Gagal menyimpan data user:", error);
      if (error.response && error.response.data && error.response.data.errors) {
        const errorMessages = Object.values(error.response.data.errors)
          .flat()
          .join("\n");
        alert("Validasi Gagal:\n" + errorMessages);
      } else {
        alert("Terjadi kesalahan saat menyimpan data ke server.");
      }
    }
  };

  const handleEdit = (item) => {
    setNamaPetugas(item.nama);
    setUsername(item.username);
    setPassword("");
    setRole(item.role);
    setKantorPenugasan(item.kantor === "-" ? "" : item.kantor);
    setEditId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBatalEdit = () => {
    setEditId(null);
    setNamaPetugas("");
    setUsername("");
    setPassword("");
    setRole("petugas");
    setKantorPenugasan("");
  };

  const handleHapus = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus user ini?")) {
      try {
        await API.delete(`/users/${id}`);
        setDataUser((prev) => prev.filter((item) => item.id !== id));
        alert("Data user berhasil dihapus!");
      } catch (error) {
        console.error("Gagal menghapus user:", error);
        alert("Gagal menghapus data dari server.");
      }
    }
  };

  // Fitur Export ke Excel Asli (.xlsx) menggunakan SheetJS
  const handleExportExcel = () => {
    if (dataUser.length === 0) {
      alert("Tidak ada data untuk diexport!");
      return;
    }

    const exportData = dataUser.map((item, index) => ({
      No: index + 1,
      "Nama Petugas": item.nama,
      Nippos: item.username,
      Role: item.role,
      "Kantor Penugasan": item.kantor,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data User");
    XLSX.writeFile(workbook, "data_user_posped.xlsx");
  };

  // Fitur Import Excel - Mengirim file utuh ke endpoint backend /users/import tanpa looping error 422
  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await API.post("/users/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(response.data.message || "Berhasil mengimpor data user dari file!");
      fetchUsers();
    } catch (err) {
      console.error("Gagal mengimpor file:", err);
      if (err.response && err.response.data && err.response.data.message) {
        alert("Gagal Import: " + err.response.data.message);
      } else {
        alert("Terjadi kesalahan saat mengunggah file ke server.");
      }
    } finally {
      e.target.value = ""; // Reset input file
    }
  };

  // Filter pencarian data
  const filteredData = dataUser.filter((item) =>
    Object.values(item).some((val) =>
      String(val || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    ),
  );

  // Logika Paginasi
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="ku-container">
      {/* Form Card */}
      <div className={`ku-card ${editId ? "ku-card-editing" : ""}`}>
        <div className="ku-header-title">
          <span className="ku-icon">👥</span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
            }}
          >
            <h2>{editId ? "Edit Data User" : "Kelola User"}</h2>
            {editId && (
              <span className="ku-badge-editing">Mode Edit (ID: {editId})</span>
            )}
          </div>
        </div>

        <form onSubmit={handleSimpan} className="ku-form-grid">
          <div className="ku-input-group">
            <label>Nama Petugas</label>
            <input
              type="text"
              placeholder="Nama Lengkap"
              value={namaPetugas}
              onChange={(e) => setNamaPetugas(e.target.value)}
              className="ku-control"
            />
          </div>

          <div className="ku-input-group">
            <label>Nippos</label>
            <input
              type="text"
              placeholder="Nippos"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="ku-control"
            />
          </div>

          <div className="ku-input-group">
            <label>Password {editId && "(Kosongkan jika tidak diubah)"}</label>
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="ku-control"
            />
          </div>

          <div className="ku-input-group">
            <label>Role Access</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="ku-control"
            >
              <option value="admin">Admin</option>
              <option value="petugas">Petugas (Loket)</option>
              <option value="superadmin">Superadmin</option>
              <option value="samsat">Samsat</option>
              <option value="mitra">Mitra</option>
              <option value="pickuper">Pickuper</option>
              <option value="agenpos">Agen Pos</option>
              <option value="oranger">Oranger</option>
            </select>
          </div>

          <div className="ku-input-group">
            <label>Kantor Penugasan (Opsional)</label>
            <select
              value={kantorPenugasan}
              onChange={(e) => setKantorPenugasan(e.target.value)}
              className="ku-control"
            >
              <option value="">-- Pilih Kantor (Opsional) --</option>
              {daftarKantor.map((k) => (
                <option key={k.id || k.nama_kantor} value={k.nama_kantor}>
                  {k.nama_kantor}
                </option>
              ))}
            </select>
          </div>

          <div
            className="ku-button-group"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gridColumn: "1 / -1",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", gap: "8px" }}>
              {editId && (
                <button
                  type="button"
                  onClick={handleBatalEdit}
                  className="ku-btn-batal"
                >
                  Batal
                </button>
              )}
              <button
                type="submit"
                className={`ku-btn-simpan ${editId ? "ku-btn-update" : ""}`}
              >
                {editId ? "🔄 Perbarui" : "📥 Simpan"}
              </button>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <label
                className="ku-btn-simpan"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  margin: 0,
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

              <button
                type="button"
                onClick={handleExportExcel}
                className="ku-btn-simpan"
              >
                📊 Export Excel
              </button>
            </div>
          </div>
        </form>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
          marginTop: "24px",
          padding: "0 4px",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <h3 style={{ margin: 0, color: "#1e293b", fontSize: "18px" }}>
          Daftar Pengguna Sistem
        </h3>

        <input
          type="text"
          placeholder="🔍 Cari Nippos atau Nama..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="ku-control"
          style={{ width: "320px", maxWidth: "100%", marginBottom: 0 }}
        />
      </div>

      <div className="ku-table-card" style={{ marginTop: 0 }}>
        <div className="ku-table-responsive">
          <table className="ku-table desktop-table">
            <thead>
              <tr>
                <th style={{ width: "6%" }}>No</th>
                <th>Nama Petugas</th>
                <th>Nippos</th>
                <th>Password</th>
                <th>Role</th>
                <th>Kantor Penugasan</th>
                <th style={{ textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
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
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>{item.nama}</td>
                    <td>{item.username}</td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "8px",
                        }}
                      >
                        <span style={{ fontFamily: "monospace" }}>
                          {showPasswordIds[item.id]
                            ? item.passwordPlain || "********"
                            : "••••••••"}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleShowPassword(item.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "16px",
                            padding: "2px 6px",
                          }}
                          title={
                            showPasswordIds[item.id]
                              ? "Sembunyikan Password"
                              : "Lihat Password"
                          }
                        >
                          {showPasswordIds[item.id] ? "👁️" : "👁️‍🗨️"}
                        </button>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`ku-badge ${
                          item.role === "admin" || item.role === "superadmin"
                            ? "badge-admin"
                            : "badge-petugas"
                        }`}
                      >
                        {item.role}
                      </span>
                    </td>
                    <td>{item.kantor}</td>
                    <td style={{ textAlign: "center" }}>
                      <div className="ku-action-buttons">
                        <button
                          onClick={() => handleEdit(item)}
                          className="ku-btn-action ku-btn-edit"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleHapus(item.id)}
                          className="ku-btn-action ku-btn-hapus"
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
                    colSpan="7"
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#777",
                    }}
                  >
                    Belum ada data user.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="mobile-card-list">
            {currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                <div
                  className={`mobile-card-item ${
                    editId === item.id ? "mobile-highlight-edit" : ""
                  }`}
                  key={item.id}
                >
                  <div className="mobile-card-row">
                    <span className="mobile-label">No:</span>
                    <span className="mobile-value">
                      {indexOfFirstItem + index + 1}
                    </span>
                  </div>
                  <div className="mobile-card-row">
                    <span className="mobile-label">Nama:</span>
                    <span className="mobile-value font-bold">{item.nama}</span>
                  </div>
                  <div className="mobile-card-row">
                    <span className="mobile-label">Nippos:</span>
                    <span className="mobile-value">{item.username}</span>
                  </div>
                  <div className="mobile-card-row">
                    <span className="mobile-label">Password:</span>
                    <span
                      className="mobile-value"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>
                        {showPasswordIds[item.id]
                          ? item.passwordPlain || "********"
                          : "••••••••"}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleShowPassword(item.id)}
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "16px",
                        }}
                      >
                        {showPasswordIds[item.id] ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </span>
                  </div>
                  <div className="mobile-card-row">
                    <span className="mobile-label">Role:</span>
                    <span className="mobile-value">
                      <span
                        className={`ku-badge ${
                          item.role === "admin" || item.role === "superadmin"
                            ? "badge-admin"
                            : "badge-petugas"
                        }`}
                      >
                        {item.role}
                      </span>
                    </span>
                  </div>
                  <div className="mobile-card-row">
                    <span className="mobile-label">Kantor:</span>
                    <span className="mobile-value">{item.kantor}</span>
                  </div>
                  <div className="mobile-card-actions">
                    <button
                      onClick={() => handleEdit(item)}
                      className="ku-btn-action ku-btn-edit"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleHapus(item.id)}
                      className="ku-btn-action ku-btn-hapus"
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
                Belum ada data user.
              </p>
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "16px",
              padding: "10px 0",
              borderTop: "1px solid #e2e8f0",
              fontSize: "14px",
              color: "#475569",
            }}
          >
            <div>
              Menampilkan {filteredData.length > 0 ? indexOfFirstItem + 1 : 0} -{" "}
              {Math.min(indexOfLastItem, filteredData.length)} dari{" "}
              {filteredData.length} data user
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: currentPage === 1 ? "#f1f5f9" : "white",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                }}
              >
                Sebelumnya
              </button>
              <span style={{ padding: "6px 10px", fontWeight: "600" }}>
                Halaman {currentPage} dari {totalPages}
              </span>
              <button
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
                }}
              >
                Berikutnya
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KelolaUser;
