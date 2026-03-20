// Require login for this page
const auth = requireAuth({ redirectTo: 'login.html' });

// Firebase config (same as other pages)
const firebaseConfig = {
    apiKey: "AIzaSyBxDaIIhmWJOB6w6Jg6Ch6a2-b_5HvJTWw",
    authDomain: "english-fun-1937c.firebaseapp.com",
    databaseURL: "https://english-fun-1937c-default-rtdb.firebaseio.com",
    projectId: "english-fun-1937c",
    storageBucket: "english-fun-1937c.firebasestorage.app",
    messagingSenderId: "236020730818",
    appId: "1:236020730818:web:4ebb378dc7a7005d2fa45b"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();
const surveysRef = database.ref('surveys_ATTT');

const roleBadge = document.getElementById('roleBadge');
const btnLogout = document.getElementById('btnLogout');
const editorActions = document.getElementById('editorActions');
const btnAddNew = document.getElementById('btnAddNew');
const listContainer = document.getElementById('listContainer');

btnLogout.addEventListener('click', authLogout);

const isEditor = auth && (auth.role === 'editor' || auth.role === 'admin');
const isAdmin = auth && auth.role === 'admin';

if (roleBadge) {
    let roleText = 'Xem';
    if (auth.role === 'editor') roleText = 'Khảo sát';
    if (auth.role === 'admin') roleText = 'Quản trị';
    roleBadge.innerText = `Tài khoản: ${auth.user} • Quyền: ${roleText}`;
}

if (editorActions) {
    editorActions.style.display = isEditor ? 'flex' : 'none';
    if (isAdmin) {
        const btnManageUsers = document.getElementById('btnManageUsers');
        if (btnManageUsers) {
            btnManageUsers.style.display = 'block';
            btnManageUsers.addEventListener('click', () => {
                window.location.href = 'tk.html';
            });
        }
    }
}
if (btnAddNew) {
    btnAddNew.addEventListener('click', () => {
        if (!isEditor) return;
        window.location.href = 'index.html?mode=new';
    });
}


function isDeadlineNear(deadlineStr) {
    if (!deadlineStr) return false;
    try {
        const deadline = new Date(deadlineStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        deadline.setHours(0, 0, 0, 0);

        // Return true if today or overdue
        return deadline <= today;
    } catch (e) {
        return false;
    }
}

function renderList(items) {
    if (!items || items.length === 0) {
        listContainer.innerHTML = `<div class="empty-state">Chưa có khách hàng nào.</div>`;
        return;
    }

    // Sort newest first (if thoi_gian_nhap exists)
    items.sort((a, b) => {
        const ta = a.thoi_gian_nhap ? new Date(a.thoi_gian_nhap).getTime() : 0;
        const tb = b.thoi_gian_nhap ? new Date(b.thoi_gian_nhap).getTime() : 0;
        return tb - ta;
    });

    listContainer.innerHTML = '';
    items.forEach(survey => {
        const card = document.createElement('div');
        card.className = 'survey-card'; // New class name for specific styling
        card.style.background = '#ffffff';
        card.style.border = '1px solid #e2e8f0';
        card.style.borderRadius = '12px';
        card.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        card.style.marginBottom = '16px';
        card.style.transition = 'all 0.2s ease';
        
        // Add hover effect
        card.onmouseover = () => {
            card.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)';
            card.style.borderColor = '#cbd5e1';
        };
        card.onmouseout = () => {
            card.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            card.style.borderColor = '#e2e8f0';
        };

        const name = survey.don_vi_khao_sat || '(Chưa đặt tên)';
        const time = survey.thoi_gian_nhap ? new Date(survey.thoi_gian_nhap).toLocaleString('vi-VN') : (survey.nguoi_nhap || 'N/A');

        card.innerHTML = `
            <div class="card-body" style="padding: 12px;">
                <!-- Top Section: 3 Columns -->
                <div style="display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 12px; margin-bottom: 12px; align-items: start;">
                    <!-- Column 1: Client & Surveyor -->
                    <div style="min-width: 0;">
                        <div style="font-weight: 900; color: #0f172a; font-size: 1rem; margin-bottom: 4px; line-height: 1.2;">${name}</div>
                        <div style="font-size: 0.8rem; color: #64748b;">
                            <i class="fas fa-user-edit" style="font-size: 0.75rem; width: 14px;"></i> 
                            ${survey.quan_ly_ho_so?.nguoi_khao_sat || 'N/A'}
                        </div>
                    </div>

                    <!-- Column 2: Dates -->
                    <div style="font-size: 0.8rem; color: #475569; display: flex; flex-direction: column; gap: 4px;">
                        <div>
                            <i class="fas fa-calendar-day" style="width: 14px; color: #94a3b8;"></i> 
                            KS: ${survey.quan_ly_ho_so?.ngay_khao_sat || 'N/A'}
                        </div>
                        <div style="${isDeadlineNear(survey.quan_ly_ho_so?.han_viet_ho_so) ? 'color: #ef4444; font-weight: bold;' : ''}">
                            <i class="fas fa-clock" style="width: 14px; ${isDeadlineNear(survey.quan_ly_ho_so?.han_viet_ho_so) ? 'color: #ef4444;' : 'color: #94a3b8;'}"></i> 
                            Hạn: ${survey.quan_ly_ho_so?.han_viet_ho_so || 'N/A'}
                        </div>
                    </div>

                    <!-- Column 3: Status & Profile Writer -->
                    <div style="text-align: right; display: flex; flex-direction: column; gap: 4px; align-items: flex-end;">
                        <span class="status-badge-small" style="background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; white-space: nowrap; border: 1px solid #bae6fd;">
                            ${(survey.quan_ly_ho_so && survey.quan_ly_ho_so.tinh_trang) || "Mới khảo sát"}
                        </span>
                        <div style="font-size: 0.75rem; font-weight: 600; color: #64748b;">
                             ${survey.quan_ly_ho_so?.nguoi_viet_ho_so || 'Chưa phân công'}
                        </div>
                    </div>
                </div>

                <!-- Bottom Section: Buttons in one row -->
                <div class="btns" style="display: flex; gap: 8px; border-top: 1px solid #f1f5f9; padding-top: 10px; justify-content: flex-end;">
                    <button class="mini-btn primary" type="button" data-action="detail" style="flex: 1; max-width: 100px;">Chi tiết</button>
                    ${isEditor ? `<button class="mini-btn" type="button" data-action="edit" style="flex: 1; max-width: 80px;">Sửa</button>` : ``}
                    ${isEditor ? `<button class="mini-btn danger" type="button" data-action="delete" style="flex: 1; max-width: 80px;">Xóa</button>` : ``}
                </div>
            </div>
        `;

        card.querySelector('[data-action="detail"]').addEventListener('click', () => {
            window.open(`detail.html?id=${survey.id}`, '_blank');
        });

        if (isEditor) {
            const btnEdit = card.querySelector('[data-action="edit"]');
            btnEdit.addEventListener('click', () => {
                window.location.href = `index.html?editId=${survey.id}`;
            });

            const btnDel = card.querySelector('[data-action="delete"]');
            btnDel.addEventListener('click', () => {
                if (confirm(`Xác nhận xóa khảo sát: ${name}?`)) {
                    surveysRef.child(survey.id).remove().catch(err => {
                        alert('Lỗi khi xóa: ' + err.message);
                    });
                }
            });
        }

        listContainer.appendChild(card);
    });
}

surveysRef.on('value', (snapshot) => {
    const items = [];
    snapshot.forEach((child) => {
        const data = child.val() || {};
        data.id = child.key;
        items.push(data);
    });
    renderList(items);
});

