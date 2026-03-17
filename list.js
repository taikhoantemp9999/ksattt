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

const isEditor = auth && auth.role === 'editor';
if (roleBadge) {
    roleBadge.innerText = `Tài khoản: ${auth.user} • Quyền: ${isEditor ? 'Khảo sát' : 'Xem'}`;
}
if (editorActions) editorActions.style.display = isEditor ? 'flex' : 'none';
if (btnAddNew) {
    btnAddNew.addEventListener('click', () => {
        if (!isEditor) return;
        window.location.href = 'index.html?mode=new';
    });
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
        card.className = 'detail-card'; // reuse style
        card.style.marginBottom = '12px';

        const name = survey.don_vi_khao_sat || '(Chưa đặt tên)';
        const time = survey.thoi_gian_nhap ? new Date(survey.thoi_gian_nhap).toLocaleString('vi-VN') : 'N/A';

        card.innerHTML = `
            <div class="card-row">
                <div style="min-width:0;">
                    <div style="font-weight:900; color:#0f172a; font-size:1rem; word-break:break-word;">${name}</div>
                    <div class="muted">Nhập lúc: ${time}</div>
                </div>
                <div class="btns">
                    <button class="mini-btn primary" type="button" data-action="detail">Chi tiết</button>
                    ${isEditor ? `<button class="mini-btn" type="button" data-action="edit">Sửa</button>` : ``}
                    ${isEditor ? `<button class="mini-btn danger" type="button" data-action="delete">Xóa</button>` : ``}
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

