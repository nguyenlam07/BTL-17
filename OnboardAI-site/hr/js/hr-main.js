// Mock Data cho Quản lý Nhân sự (Người 3)
const DEFAULT_EMPLOYEES = [
    { id: 1, name: "Nguyễn Văn A", email: "anguyen@company.com", dept: "IT", mentor: "Trần Văn X", joinDate: "20/10/2026", progress: 60 },
    { id: 2, name: "Nguyễn Văn B", email: "bnguyen@company.com", dept: "IT", mentor: "Trần Văn X", joinDate: "22/10/2026", progress: 30 },
    { id: 3, name: "Lê Thị C", email: "cle@company.com", dept: "Marketing", mentor: "Phạm Thị Y", joinDate: "18/10/2026", progress: 45 },
    { id: 4, name: "Phạm Minh D", email: "dpham@company.com", dept: "HR", mentor: "Hoàng Văn Z", joinDate: "15/10/2026", progress: 100 }
];

const EMP_KEY = "onboardai_hr_employees_v1";
let employeesData = (function () {
    try { const raw = localStorage.getItem(EMP_KEY); if (raw) return JSON.parse(raw); } catch (e) {}
    return DEFAULT_EMPLOYEES.map(e => ({ ...e }));
})();
function saveEmployees() { try { localStorage.setItem(EMP_KEY, JSON.stringify(employeesData)); } catch (e) {} }
function esc(v) { return String(v).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]); }
const toISO = d => { const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(d || ""); return m ? `${m[3]}-${m[2]}-${m[1]}` : ""; };
const toVN = iso => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ""); return m ? `${m[3]}/${m[2]}/${m[1]}` : ""; };
function toast(msg) { const t = document.createElement("div"); t.className = "toast-ob"; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2600); }

document.addEventListener("DOMContentLoaded", function () {
    const tableBody = document.getElementById("employee-table-body");
    const searchInput = document.getElementById("search-input");
    const deptFilter = document.getElementById("dept-filter");

    // 1. Hàm hiển thị danh sách nhân viên (dùng cho trang hr-employees.html)
    function renderEmployees(data) {
        if (!tableBody) return;
        tableBody.innerHTML = "";

        data.forEach(emp => {
            const row = document.createElement("tr");
            row.dataset.id = emp.id;
            row.innerHTML = `
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <div class="avatar-circle">${esc(emp.name.charAt(0))}</div>
                        <div>
                            <strong>${esc(emp.name)}</strong><br>
                            <small class="text-muted">${esc(emp.email)}</small>
                        </div>
                    </div>
                </td>
                <td><span class="badge bg-light text-dark">${esc(emp.dept)}</span></td>
                <td>${esc(emp.mentor)}</td>
                <td>${esc(emp.joinDate)}</td>
                <td>
                    <div class="progress" style="height: 8px; width: 100px;">
                        <div class="progress-bar bg-primary" style="width: ${emp.progress}%"></div>
                    </div>
                    <small>${emp.progress}%</small>
                </td>
                <td>
                    <button class="btn btn-sm btn-light btn-edit" title="Sửa"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-sm btn-light text-danger btn-delete" title="Xóa"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Khởi chạy render dữ liệu nếu có bảng nhân viên
    if (tableBody) {
        renderEmployees(employeesData);
    }

    // Lọc theo ô tìm kiếm/phòng ban hiện tại (dùng lại sau khi thêm/sửa/xóa)
    function refreshList() {
        const kw = searchInput ? searchInput.value.toLowerCase() : "";
        const dept = deptFilter ? deptFilter.value : "";
        renderEmployees(employeesData.filter(e =>
            (e.name.toLowerCase().includes(kw) || e.email.toLowerCase().includes(kw)) && (dept === "" || e.dept === dept)));
    }

    // Hộp thoại thêm / sửa nhân sự
    const dlg = document.getElementById("employee-dialog");
    let editingId = null;
    const $ = id => document.getElementById(id);
    function openEmployeeDialog(emp) {
        if (!dlg) return;
        editingId = emp ? emp.id : null;
        $("employee-dialog-title").textContent = emp ? "Chỉnh sửa nhân sự" : "Thêm nhân sự mới";
        $("employee-save").textContent = emp ? "Lưu thay đổi" : "Thêm nhân sự";
        $("f-name").value = emp ? emp.name : "";
        $("f-email").value = emp ? emp.email : "";
        $("f-dept").value = emp ? emp.dept : "IT";
        $("f-mentor").value = emp ? emp.mentor : "";
        $("f-join").value = emp ? toISO(emp.joinDate) : new Date().toISOString().slice(0, 10);
        $("f-progress").value = emp ? emp.progress : 0;
        $("employee-error").textContent = "";
        dlg.showModal();
        $("f-name").focus();
    }
    if (dlg) {
        $("employee-cancel").addEventListener("click", () => dlg.close());
        $("employee-form").addEventListener("submit", function (e) {
            e.preventDefault();
            const name = $("f-name").value.trim(), email = $("f-email").value.trim(), mentor = $("f-mentor").value.trim();
            const join = $("f-join").value, progress = Number($("f-progress").value);
            let err = "";
            if (!name || !email || !mentor || !join || $("f-progress").value === "") err = "Vui lòng điền đủ các trường bắt buộc.";
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) err = "Email chưa đúng định dạng.";
            else if (!Number.isInteger(progress) || progress < 0 || progress > 100) err = "Tiến độ phải là số nguyên từ 0 đến 100.";
            else if (employeesData.some(x => x.id !== editingId && x.email.toLowerCase() === email.toLowerCase())) err = "Email này đã tồn tại trong danh sách.";
            if (err) { $("employee-error").textContent = err; return; }
            const record = { name, email, dept: $("f-dept").value, mentor, joinDate: toVN(join), progress };
            if (editingId === null) {
                employeesData.push({ id: Math.max(0, ...employeesData.map(x => x.id)) + 1, ...record });
                toast("Đã thêm nhân sự mới.");
            } else {
                employeesData = employeesData.map(x => x.id === editingId ? { ...x, ...record } : x);
                toast("Đã cập nhật thông tin nhân sự.");
            }
            saveEmployees(); dlg.close(); refreshList();
        });
    }

    // 2. Xử lý Lọc & Tìm kiếm nhân viên
    if (searchInput && deptFilter) {
        function filterData() {
            const keyword = searchInput.value.toLowerCase();
            const selectedDept = deptFilter.value;

            const filtered = employeesData.filter(emp => {
                const matchesSearch = emp.name.toLowerCase().includes(keyword) || emp.email.toLowerCase().includes(keyword);
                const matchesDept = selectedDept === "" || emp.dept === selectedDept;
                return matchesSearch && matchesDept;
            });

            renderEmployees(filtered);
        }

        searchInput.addEventListener("input", filterData);
        deptFilter.addEventListener("change", filterData);
    }

    // 3. XỚ LÝ SỰ KIỆN CLICK CHO TẤT CẢ CÁC NÚT BẤM TRÊN TRANG
    document.addEventListener("click", function (event) {
        const targetBtn = event.target.closest("button");
        if (!targetBtn) return;

        const btnText = targetBtn.innerText.trim();

        // Nút "Phân tích lại" của AI trên trang Dashboard
        if (targetBtn.id === "btn-reanalyze") {
            alert("🤖 AI đang tiến hành quét lại dữ liệu tiến độ toàn hệ thống...");
            return;
        }

        if (btnText.includes("Thêm nhân sự mới") && dlg) { openEmployeeDialog(null); return; }

        // Nút Sửa nhân viên trong bảng
        if (targetBtn.classList.contains("btn-edit")) {
            const rowEl = targetBtn.closest("tr");
            const emp = rowEl && employeesData.find(e => String(e.id) === rowEl.dataset.id);
            if (emp) openEmployeeDialog(emp);
            return;
        }

        // Các nút hành động AI Risk hoặc Thêm mới nhân sự / Quy trình
        if (btnText.includes("Gửi email") || btnText.includes("Giao Mentor") || btnText.includes("Tạo quy trình mới")) {
            alert(`✅ Đã kích hoạt chức năng: "${btnText}" thành công!`);
            return;
        }


        // Nút Xóa nhân viên trong bảng
        if (targetBtn.classList.contains("btn-delete")) {
            if (confirm("⚠️ Bạn có chắc chắn muốn xóa nhân sự này khỏi hệ thống không?")) {
                const rowEl = targetBtn.closest("tr");
                if (rowEl) {
                    employeesData = employeesData.filter(e => String(e.id) !== rowEl.dataset.id);
                    saveEmployees();
                    refreshList();
                    toast("Đã xóa nhân sự.");
                }
            }
            return;
        }
    });
});