// Quản lý & chỉnh sửa các bước của quy trình hội nhập (lưu localStorage)
(function () {
  const KEY = "onboardai_hr_journeys_v1";
  const DEFAULTS = [
    { id: "dev", title: "Quy trình Khối Kỹ thuật (Dev/IT)", desc: "Lộ trình dành cho nhân sự kỹ thuật và phát triển sản phẩm.", tone: "primary", staff: 12, totalDays: 14,
      steps: [{ t: "Chào mừng & hoàn thiện hồ sơ", d: 1 }, { t: "Thiết lập tài khoản và môi trường", d: 4 }, { t: "Gặp gỡ mentor kỹ thuật", d: 7 }, { t: "Hoàn thành nhiệm vụ đầu tiên", d: 10 }] },
    { id: "sale", title: "Quy trình Khối Khách hàng / Sale", desc: "Lộ trình dành cho đội ngũ kinh doanh và chăm sóc khách hàng.", tone: "warning", staff: 8, totalDays: 10,
      steps: [{ t: "Giới thiệu văn hóa & sản phẩm", d: 1 }, { t: "Đào tạo công cụ bán hàng", d: 4 }, { t: "Shadowing cùng quản lý", d: 7 }, { t: "Thực hành với khách hàng", d: 10 }] }
  ];
  const clone = o => JSON.parse(JSON.stringify(o));
  let journeys;
  try { journeys = JSON.parse(localStorage.getItem(KEY)) || clone(DEFAULTS); } catch (e) { journeys = clone(DEFAULTS); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(journeys)); } catch (e) {} };
  const esc = v => String(v).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const $ = id => document.getElementById(id);
  const dayLabel = d => d === 1 ? "Ngày đầu tiên" : "Ngày " + d;
  function toast(msg) { const t = document.createElement("div"); t.className = "toast-ob"; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2600); }

  function render() {
    $("journey-list").innerHTML = journeys.map(j => `
      <div class="col-md-6"><div class="card-custom bg-white p-4 rounded-4 shadow-sm position-relative h-100">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div>
            <span class="badge bg-light text-${j.tone} mb-2 p-2 rounded-circle"><i class="fa-solid fa-sun fs-5"></i></span>
            <h4 class="fw-bold mb-1">${esc(j.title)}</h4>
            <p class="text-muted small mb-3">${esc(j.desc)}</p>
          </div>
          <span class="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill fw-normal" style="font-size:12px;">Đang hoạt động</span>
        </div>
        <div class="d-flex gap-4 text-muted small pb-3 mb-3 border-bottom" style="font-size:13px;">
          <span><strong>${j.steps.length}</strong> bước</span><span>•</span><span><strong>${j.staff}</strong> nhân sự</span><span>•</span><span><strong>${j.totalDays}</strong> ngày</span>
        </div>
        <div class="journey-steps mb-4">
          ${j.steps.map((st, i) => `
          <div class="d-flex align-items-start gap-3 ${i < j.steps.length - 1 ? "mb-3" : ""}">
            <div class="badge bg-light text-${j.tone} rounded-circle d-flex align-items-center justify-content-center" style="width:28px;height:28px;font-weight:600;">${i + 1}</div>
            <div><div class="fw-bold text-dark">${esc(st.t)}</div><small class="text-muted" style="font-size:11px;">${dayLabel(st.d)}</small></div>
          </div>`).join("")}
        </div>
        <button class="btn btn-outline-primary w-100 py-2 rounded-3 text-primary border-primary-subtle bg-light bg-opacity-50 btn-edit-steps" data-id="${j.id}" style="border-style:dashed;"><i class="fa-solid fa-pen-to-square me-1"></i> Chỉnh sửa bước</button>
      </div></div>`).join("");
  }

  const dlg = $("journey-dialog");
  let editing = null;

  function stepRow(st) {
    const row = document.createElement("div");
    row.className = "step-row";
    row.innerHTML = `<input class="form-control s-title" maxlength="100" placeholder="Tên bước" aria-label="Tên bước" value="${esc(st.t)}">
      <input class="form-control s-day" type="number" min="1" max="365" aria-label="Ngày thực hiện" placeholder="Ngày" value="${st.d}">
      <div class="d-flex gap-1"><button type="button" class="btn btn-light s-up" title="Lên" aria-label="Chuyển lên">↑</button><button type="button" class="btn btn-light s-down" title="Xuống" aria-label="Chuyển xuống">↓</button><button type="button" class="btn btn-light text-danger s-del" title="Xóa bước" aria-label="Xóa bước"><i class="fa-solid fa-trash"></i></button></div>`;
    return row;
  }
  function openEdit(j) {
    editing = j;
    $("journey-dialog-sub").textContent = "Thêm, xóa, sắp xếp hoặc đổi ngày thực hiện của từng bước.";
    $("j-title").value = j.title; $("j-days").value = j.totalDays;
    const box = $("j-steps"); box.innerHTML = "";
    j.steps.forEach(st => box.appendChild(stepRow(st)));
    $("journey-error").textContent = "";
    dlg.showModal();
  }

  document.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.classList.contains("btn-edit-steps")) { const j = journeys.find(x => x.id === b.dataset.id); if (j) openEdit(j); return; }
    if (!dlg.open) return;
    const row = b.closest(".step-row");
    if (b.id === "j-add") { const rows = $("j-steps").children; const last = rows.length ? Number(rows[rows.length - 1].querySelector(".s-day").value) || 1 : 1; const r = stepRow({ t: "", d: last }); $("j-steps").appendChild(r); r.querySelector(".s-title").focus(); }
    else if (b.id === "j-cancel") dlg.close();
    else if (b.id === "j-reset") { const def = DEFAULTS.find(x => x.id === editing.id); if (def && confirm("Khôi phục các bước của quy trình này về mặc định?")) { Object.assign(editing, clone(def), { staff: editing.staff }); save(); dlg.close(); render(); toast("Đã khôi phục mặc định."); } }
    else if (row && b.classList.contains("s-del")) { if ($("j-steps").children.length > 1) row.remove(); else $("journey-error").textContent = "Quy trình cần ít nhất 1 bước."; }
    else if (row && b.classList.contains("s-up") && row.previousElementSibling) row.parentNode.insertBefore(row, row.previousElementSibling);
    else if (row && b.classList.contains("s-down") && row.nextElementSibling) row.parentNode.insertBefore(row.nextElementSibling, row);
  });

  $("journey-form").addEventListener("submit", e => {
    e.preventDefault();
    const title = $("j-title").value.trim(), totalDays = Number($("j-days").value);
    const steps = [...$("j-steps").children].map(r => ({ t: r.querySelector(".s-title").value.trim(), d: Number(r.querySelector(".s-day").value) }));
    let err = "";
    if (!title) err = "Vui lòng nhập tên quy trình.";
    else if (!Number.isInteger(totalDays) || totalDays < 1) err = "Tổng số ngày phải là số nguyên ≥ 1.";
    else if (!steps.length) err = "Quy trình cần ít nhất 1 bước.";
    else if (steps.some(s => !s.t)) err = "Mỗi bước cần có tên.";
    else if (steps.some(s => !Number.isInteger(s.d) || s.d < 1)) err = "Ngày thực hiện của bước phải là số nguyên ≥ 1.";
    else if (Math.max(...steps.map(s => s.d)) > totalDays) err = "Có bước vượt quá tổng số ngày của quy trình (" + totalDays + ").";
    if (err) { $("journey-error").textContent = err; return; }
    editing.title = title; editing.totalDays = totalDays; editing.steps = steps;
    save(); dlg.close(); render(); toast("Đã lưu các bước của quy trình.");
  });

  render();
})();
