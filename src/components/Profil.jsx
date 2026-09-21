import React, { useState, useEffect } from "react";
import API from "./axios"; // Pastikan path import axios sesuai dengan struktur folder projectmu
import "./Profil.css";

function Profil({ userActive, setUserActive, onBack }) {
  const [isEdit, setIsEdit] = useState(false);
  const [namaEdit, setNamaEdit] = useState("");

  // Foto dikelola SENDIRI di komponen ini
  const [profileImage, setProfileImage] = useState("");

  // =========================
  // DATA AWAL
  // =========================
  useEffect(() => {
    if (!userActive) return;

    const userId =
      userActive?.id || userActive?.nippos || userActive?.username || "default";

    const savedImage = localStorage.getItem(`profile_image_${userId}`);

    setProfileImage(savedImage || "");

    setNamaEdit(
      userActive?.nama || userActive?.name || userActive?.username || "User",
    );
  }, [userActive]);

  // =========================
  // PILIH FOTO (dikompres dulu biar hemat tempat di localStorage)
  // =========================
  const resizeGambar = (file, maxSize = 300, kualitas = 0.7) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > height && width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          resolve(canvas.toDataURL("image/jpeg", kualitas));
        };
        img.onerror = reject;
        img.src = event.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePilihFoto = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("File yang dipilih harus berupa gambar.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran foto maksimal 2 MB.");
      return;
    }

    try {
      const hasilResize = await resizeGambar(file);
      setProfileImage(hasilResize);
    } catch (err) {
      console.error("Gagal memproses gambar:", err);
      alert("Gagal memproses gambar. Coba gambar lain.");
    }

    e.target.value = "";
  };

  // =========================
  // HAPUS FOTO
  // =========================
  const handleHapusFoto = () => {
    setProfileImage("");
  };

  // =========================
  // SIMPAN PERUBAHAN (TERHUBUNG KE BACKEND LARAVEL)
  // =========================
  const handleSimpan = async () => {
    if (!namaEdit.trim()) {
      alert("Nama tidak boleh kosong!");
      return;
    }

    const userId =
      userActive?.id || userActive?.nippos || userActive?.username || "default";

    // Siapkan FormData untuk dikirim ke endpoint POST /profile/update
    const formData = new FormData();
    formData.append("name", namaEdit);

    if (profileImage && profileImage.startsWith("data:image")) {
      try {
        const res = await fetch(profileImage);
        const blob = await res.blob();
        formData.append("foto_profil", blob, "foto_profil.jpg");
      } catch (err) {
        console.error("Gagal menyiapkan file foto:", err);
      }
    }

    if (!profileImage) {
      formData.append("hapus_foto", "1");
    }

    try {
      // Mengirim data ke backend Laravel menggunakan instance API (axios)
      const response = await API.post("/profile/update", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.status === "success") {
        const updatedUser = response.data.data;
        const namaBaru = updatedUser.name || updatedUser.nama || namaEdit;

        // Simpan juga ke localStorage untuk cache gambar lokal
        if (profileImage) {
          localStorage.setItem(`profile_image_${userId}`, profileImage);
        } else {
          localStorage.removeItem(`profile_image_${userId}`);
        }

        // UPDATE USER DI STATE GLOBAL SECARA MENYELURUH (SUPAYA SEMUA ROLE/HALAMAN IKUT BERUBAH)
        setUserActive((prev) => ({
          ...prev,
          name: namaBaru,
          nama: namaBaru,
          username: updatedUser.username || prev?.username,
        }));

        setIsEdit(false);
        alert("Perubahan profil berhasil disimpan ke server!");
      }
    } catch (err) {
      console.error("Gagal mengupdate profil ke backend:", err);

      if (err.response && err.response.status === 422) {
        const errorData = err.response.data.errors;
        const pesanError = Object.values(errorData).flat().join("\n");
        alert("Validasi Gagal:\n" + pesanError);
      } else {
        alert(
          "Terjadi kesalahan saat menyimpan ke server. Periksa koneksi Anda.",
        );
      }
    }
  };

  // =========================
  // BATAL / KEMBALI
  // =========================
  const handleBatal = () => {
    const userId =
      userActive?.id || userActive?.nippos || userActive?.username || "default";

    const savedImage = localStorage.getItem(`profile_image_${userId}`);

    setProfileImage(savedImage || "");

    setNamaEdit(
      userActive?.nama || userActive?.name || userActive?.username || "User",
    );

    setIsEdit(false);
  };

  // =========================
  // DATA TAMPILAN
  // =========================
  const namaTampil =
    userActive?.nama || userActive?.name || userActive?.username || "User";

  const hurufAwal = namaTampil.charAt(0).toUpperCase();

  const role = userActive?.role || "-";
  const kantor = userActive?.kantor || "-";

  return (
    <div className="profil-container">
      <div className="profil-card">
        {/* ================= HEADER ================= */}
        <div className="profil-header">
          <div className="profil-avatar-section">
            {/* FOTO */}
            {profileImage ? (
              <img
                src={profileImage}
                alt="Foto Profil"
                className="profil-avatar-image"
              />
            ) : (
              <div className="profil-avatar">{hurufAwal}</div>
            )}

            {/* GANTI FOTO HANYA SAAT EDIT */}
            {isEdit && (
              <>
                <label htmlFor="foto-profil" className="profil-foto-button">
                  📷 Ganti Foto
                </label>

                <input
                  id="foto-profil"
                  type="file"
                  accept="image/*"
                  onChange={handlePilihFoto}
                  style={{ display: "none" }}
                />

                {profileImage && (
                  <button
                    type="button"
                    onClick={handleHapusFoto}
                    className="profil-btn-delete-photo"
                  >
                    Hapus Foto
                  </button>
                )}
              </>
            )}
          </div>

          <div className="profil-title">
            <h1>Profil Saya</h1>

            <p>Informasi akun pengguna POSPED</p>
          </div>
        </div>

        {/* ================= DATA PROFIL ================= */}
        <div className="profil-info">
          {/* NAMA */}
          <div className="profil-item">
            <span className="profil-label">Nama</span>

            {isEdit ? (
              <input
                type="text"
                value={namaEdit}
                onChange={(e) => setNamaEdit(e.target.value)}
                className="profil-input-edit"
                placeholder="Masukkan nama lengkap"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  backgroundColor: "#ffffff",
                  color: "#334155",
                  boxSizing: "border-box",
                }}
              />
            ) : (
              <span className="profil-value">{namaTampil}</span>
            )}
          </div>

          {/* ROLE */}
          <div className="profil-item">
            <span className="profil-label">Role</span>

            <span className="profil-value">{role}</span>
          </div>

          {/* KANTOR */}
          <div className="profil-item">
            <span className="profil-label">Kantor</span>

            <span className="profil-value">{kantor}</span>
          </div>
        </div>

        {/* ================= BUTTON ================= */}
        <div
          style={{
            marginTop: "24px",
            display: "flex",
            gap: "12px",
            width: "100%",
          }}
        >
          {!isEdit ? (
            <>
              <button
                type="button"
                onClick={() => {
                  if (typeof onBack === "function") {
                    onBack();
                  } else {
                    window.history.back();
                  }
                }}
                style={{
                  flex: 1,
                  background: "#e2e8f0",
                  color: "#334155",
                  border: "none",
                  borderRadius: "8px",
                  padding: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "14px",
                  textAlign: "center",
                }}
              >
                ⬅️ Kembali
              </button>

              <button
                type="button"
                onClick={() => setIsEdit(true)}
                style={{
                  flex: 1,
                  background: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "14px",
                  textAlign: "center",
                }}
              >
                ✏️ Edit Profil
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleBatal}
                style={{
                  flex: 1,
                  background: "#e2e8f0",
                  color: "#334155",
                  border: "none",
                  borderRadius: "8px",
                  padding: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "14px",
                  textAlign: "center",
                }}
              >
                ⬅️ Batal
              </button>

              <button
                type="button"
                onClick={handleSimpan}
                style={{
                  flex: 1,
                  background: "#16a34a",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "14px",
                  textAlign: "center",
                }}
              >
                💾 Simpan
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profil;
