// ==========================
// Konfigurasi Dasar
// ==========================
const API_URL = 'http://localhost:5500/api/media';
const mediaTableBody = document.getElementById('booksTableBody'); 
const mediaModal = new bootstrap.Modal(document.getElementById('bookModal'));
const mediaForm = document.getElementById('bookForm');
const mediaIdInput = document.getElementById('bookId');
const modalTitle = document.getElementById('bookModalLabel');
const saveButton = document.getElementById('saveButton');
const alertMessage = document.getElementById('alertMessage');

// ==========================
// 1. READ (GET) - Ambil Data Media
// ==========================
async function fetchMedia() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Gagal memuat data media.');

    const mediaList = await response.json();
    renderMedia(mediaList);
  } catch (error) {
    console.error('Error fetching media:', error);
    mediaTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-danger">
          Gagal terhubung ke API: ${error.message}
        </td>
      </tr>`;
  }
}

function renderMedia(mediaList) {
  mediaTableBody.innerHTML = '';

  if (mediaList.length === 0) {
    mediaTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center">Belum ada data media.</td>
      </tr>`;
    return;
  }

  mediaList.forEach(item => {
    const row = mediaTableBody.insertRow();
    row.insertCell().textContent = item.id_media;
    row.insertCell().textContent = item.judul;
    row.insertCell().textContent = formatDate(item.tahun_rilis);
    row.insertCell().textContent = item.genre;

    const actionsCell = row.insertCell();

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-sm btn-info me-2';
    editBtn.textContent = 'Edit';
    editBtn.onclick = () =>
      prepareEdit(item.id_media, item.judul, item.tahun_rilis, item.genre);
    actionsCell.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-sm btn-danger';
    deleteBtn.textContent = 'Hapus';
    deleteBtn.onclick = () => deleteMedia(item.id_media, item.judul);
    actionsCell.appendChild(deleteBtn);
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return isNaN(date) ? '-' : date.toISOString().split('T')[0];
}

// ==========================
// 2. CREATE & UPDATE (POST & PUT)
// ==========================
mediaForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = mediaIdInput.value;
  const judul = document.getElementById('title').value.trim();
  const tahun_rilis = document.getElementById('tahun_rilis').value.trim();
  const genre = document.getElementById('genre').value.trim();

  if (!judul || !tahun_rilis || !genre) {
    showAlert('Judul, Tahun Rilis, dan Genre harus diisi.', 'danger');
    return;
  }

  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_URL}/${id}` : API_URL;

  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ judul, tahun_rilis, genre }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Gagal menyimpan data media.');
    }

    const actionText = id ? 'diperbarui' : 'ditambahkan';
    showAlert(`Data media berhasil ${actionText}!`, 'success');

    mediaModal.hide();
    mediaForm.reset();
    fetchMedia();

  } catch (error) {
    console.error('Error saat menyimpan media:', error);
    showAlert(`Gagal menyimpan media: ${error.message}`, 'danger');
  }
});

// ==========================
// 3. MODAL - Create & Edit
// ==========================
function prepareCreate() {
  modalTitle.textContent = 'Tambah Media Baru';
  saveButton.textContent = 'Tambah';
  mediaIdInput.value = '';
  mediaForm.reset();
}

function prepareEdit(id, judul, tahun_rilis, genre) {
  modalTitle.textContent = 'Edit Data Media';
  saveButton.textContent = 'Perbarui';
  mediaIdInput.value = id;
  document.getElementById('title').value = judul;
  document.getElementById('tahun_rilis').value = formatDate(tahun_rilis);
  document.getElementById('genre').value = genre;
  mediaModal.show();
}

// ==========================
// 4. DELETE (Hapus Data)
// ==========================
async function deleteMedia(id, judul) {
  if (!confirm(`Yakin ingin menghapus media: "${judul}" (ID: ${id})?`)) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });

    if (response.status === 204) {
      showAlert(`Media "${judul}" berhasil dihapus.`, 'warning');
      fetchMedia();
    } else if (response.status === 404) {
      showAlert(`Media dengan ID ${id} tidak ditemukan.`, 'danger');
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Gagal menghapus media.');
    }

  } catch (error) {
    console.error('Error saat menghapus media:', error);
    showAlert(`Gagal menghapus media: ${error.message}`, 'danger');
  }
}

// ==========================
// 5. UTILITAS
// ==========================
function showAlert(message, type) {
  alertMessage.textContent = message;
  alertMessage.className = `alert alert-${type}`;
  alertMessage.classList.remove('d-none');
  setTimeout(() => alertMessage.classList.add('d-none'), 3000);
}

// ==========================
// 6. INIT
// ==========================
document.addEventListener('DOMContentLoaded', fetchMedia);
