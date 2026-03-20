// thongke.js
const auth = requireAuth({ redirectTo: 'login.html' });

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
const statsDashboard = document.getElementById('statsDashboard');
const roleBadge = document.getElementById('roleBadge');
const statsModal = document.getElementById('statsModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');

let allItemsGlobal = [];

// Identity display
if (roleBadge) {
    let roleText = 'Xem';
    if (auth.role === 'editor') roleText = 'Khảo sát';
    if (auth.role === 'admin') roleText = 'Quản trị';
    roleBadge.innerText = `${auth.user} (${roleText})`;
}

function isDeadlineNear(deadlineStr) {
    if (!deadlineStr) return false;
    try {
        const deadline = new Date(deadlineStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        deadline.setHours(0, 0, 0, 0);
        return deadline <= today;
    } catch (e) {
        return false;
    }
}

function renderStats(items) {
    if (!items || items.length === 0) {
        statsDashboard.innerHTML = '<div class="empty-state">Không có dữ liệu để thống kê.</div>';
        return;
    }

    const total = items.length;
    let nearOverdue = 0;
    const statusCounts = {};
    const regionStats = {};
    const writerStats = {};

    items.forEach(s => {
        const ql = s.quan_ly_ho_so || {};
        const status = ql.tinh_trang || "Mới khảo sát chưa phân công";
        const region = ql.vnpt_khu_vuc || "Chưa xác định";
        const writer = ql.nguoi_viet_ho_so || "Chưa phân công";
        const isNear = isDeadlineNear(ql.han_viet_ho_so);

        if (isNear) nearOverdue++;

        statusCounts[status] = (statusCounts[status] || 0) + 1;

        if (!regionStats[region]) regionStats[region] = { total: 0, status: {}, near: 0 };
        regionStats[region].total++;
        regionStats[region].status[status] = (regionStats[region].status[status] || 0) + 1;
        if (isNear) regionStats[region].near++;

        if (!writerStats[writer]) writerStats[writer] = { total: 0, status: {}, near: 0 };
        writerStats[writer].total++;
        writerStats[writer].status[status] = (writerStats[writer].status[status] || 0) + 1;
        if (isNear) writerStats[writer].near++;
    });

    let html = `
        <div class="section-title"><i class="fas fa-chart-pie"></i> I. TỔNG QUAN TÌNH HÌNH VIẾT HỒ SƠ</div>
        <div class="stats-grid">
            <div class="stats-card clickable-stat" onclick="filterAndShow('Tất cả hồ sơ', s => true)">
                <h3>Tổng số đã khảo sát</h3>
                <div class="value">${total}</div>
            </div>
            <div class="stats-card clickable-stat" style="border-color: #fca5a5; background: #fff1f2;" onclick="filterAndShow('Hồ sơ sắp hết hạn / quá hạn', s => isDeadlineNear(s.quan_ly_ho_so?.han_viet_ho_so))">
                <h3 style="color: #991b1b;">Sắp hết hạn / Quá hạn</h3>
                <div class="value" style="color: #ef4444;">${nearOverdue}</div>
            </div>
        </div>

        <div class="stats-table-wrapper">
            <table class="stats-table">
                <thead>
                    <tr>
                        <th>Trạng thái hồ sơ</th>
                        <th style="width: 120px; text-align: center;">Số lượng</th>
                        <th style="width: 100px; text-align: center;">Tỷ lệ</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(statusCounts).sort((a,b) => b[1] - a[1]).map(([st, count]) => `
                        <tr>
                            <td style="font-weight: 500;">${st}</td>
                            <td style="text-align: center;">
                                <span class="value clickable-stat" style="font-weight: 800; color: #0369a1; font-size: 1.1rem;" 
                                      onclick="filterAndShow('Trạng thái: ${st}', s => (s.quan_ly_ho_so?.tinh_trang || 'Mới khảo sát chưa phân công') === '${st}')">
                                    ${count}
                                </span>
                            </td>
                            <td style="text-align: center; color: #64748b; font-size: 0.85rem;">${((count/total)*100).toFixed(1)}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="section-title"><i class="fas fa-map-marked-alt"></i> II. THỐNG KÊ THEO VNPT KHU VỰC</div>
        <div class="stats-table-wrapper">
            <table class="stats-table">
                <thead>
                    <tr>
                        <th>Khu vực</th>
                        <th style="text-align: center;">Tổng</th>
                        <th style="text-align: center;">Gần hạn</th>
                        <th>Trạng thái hiện tại</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(regionStats).sort((a,b) => b[1].total - a[1].total).map(([reg, s]) => `
                        <tr>
                            <td style="font-weight: 700; color: #1e293b;">${reg}</td>
                            <td style="text-align: center;">
                                <span class="clickable-stat" style="font-weight: 800; color: #0369a1;" onclick="filterAndShow('Khu vực: ${reg}', s => (s.quan_ly_ho_so?.vnpt_khu_vuc || 'Chưa xác định') === '${reg}')">
                                    ${s.total}
                                </span>
                            </td>
                            <td style="text-align: center;">
                                <span class="clickable-stat" style="${s.near > 0 ? 'color: #ef4444; font-weight: 900;' : 'color: #94a3b8;'}" 
                                      onclick="filterAndShow('Khu vực: ${reg} (Gần hạn)', s => (s.quan_ly_ho_so?.vnpt_khu_vuc || 'Chưa xác định') === '${reg}' && isDeadlineNear(s.quan_ly_ho_so?.han_viet_ho_so))">
                                    ${s.near}
                                </span>
                            </td>
                            <td style="font-size: 0.8rem; color: #64748b; line-height: 1.5;">
                                ${Object.entries(s.status).map(([st, c]) => `${st}: <b>${c}</b>`).join(' | ')}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="section-title"><i class="fas fa-user-edit"></i> III. THỐNG KÊ THEO NGƯỜI VIẾT HỒ SƠ</div>
        <div class="stats-table-wrapper">
            <table class="stats-table">
                <thead>
                    <tr>
                        <th>Người viết hồ sơ</th>
                        <th style="text-align: center;">Tổng</th>
                        <th style="text-align: center;">Gần hạn</th>
                        <th>Trạng thái hiện tại</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(writerStats).sort((a,b) => b[1].total - a[1].total).map(([wr, s]) => `
                        <tr>
                            <td style="font-weight: 700; color: #1e293b;">${wr}</td>
                            <td style="text-align: center;">
                                <span class="clickable-stat" style="font-weight: 800; color: #0369a1;" onclick="filterAndShow('Người viết: ${wr}', s => (s.quan_ly_ho_so?.nguoi_viet_ho_so || 'Chưa phân công') === '${wr}')">
                                    ${s.total}
                                </span>
                            </td>
                            <td style="text-align: center;">
                                <span class="clickable-stat" style="${s.near > 0 ? 'color: #ef4444; font-weight: 900;' : 'color: #94a3b8;'}"
                                      onclick="filterAndShow('Người viết: ${wr} (Gần hạn)', s => (s.quan_ly_ho_so?.nguoi_viet_ho_so || 'Chưa phân công') === '${wr}' && isDeadlineNear(s.quan_ly_ho_so?.han_viet_ho_so))">
                                    ${s.near}
                                </span>
                            </td>
                            <td style="font-size: 0.8rem; color: #64748b; line-height: 1.5;">
                                ${Object.entries(s.status).map(([st, c]) => `${st}: <b>${c}</b>`).join(' | ')}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    statsDashboard.innerHTML = html;
}

function filterAndShow(title, filterFn) {
    const filtered = allItemsGlobal.filter(filterFn);
    modalTitle.innerHTML = `${title} <span style="color: var(--primary); font-size: 0.9rem; font-weight: 500;">(${filtered.length} hồ sơ)</span>`;
    
    let listHtml = '<div class="modal-list">';
    if (filtered.length === 0) {
        listHtml += '<div class="empty-state">Không có hồ sơ nào.</div>';
    } else {
        filtered.sort((a,b) => new Date(b.thoi_gian_nhap) - new Date(a.thoi_gian_nhap)).forEach(item => {
            const ql = item.quan_ly_ho_so || {};
            const status = ql.tinh_trang || "Mới khảo sát chưa phân công";
            const isNear = isDeadlineNear(ql.han_viet_ho_so);

            // Role-based link: Editor/Admin -> Edit page, Viewer -> Detail page
            const targetUrl = (auth.role === 'editor' || auth.role === 'admin') 
                ? `index.html?editId=${item.id}` 
                : `detail.html?id=${item.id}`;

            listHtml += `
                <a href="${targetUrl}" target="_blank" class="modal-item" style="display: block; padding: 12px; margin-bottom: 12px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; text-decoration: none; transition: all 0.2s;">
                    <div style="display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 12px; align-items: start;">
                        <!-- Column 1: Client & Surveyor -->
                        <div style="min-width: 0;">
                            <div style="font-weight: 900; color: #0f172a; font-size: 0.95rem; margin-bottom: 4px; line-height: 1.2;">${item.don_vi_khao_sat}</div>
                            <div style="font-size: 0.75rem; color: #64748b;">
                                <i class="fas fa-user-edit" style="width: 14px;"></i> ${ql.nguoi_khao_sat || 'N/A'}
                            </div>
                        </div>

                        <!-- Column 2: Dates -->
                        <div style="font-size: 0.75rem; color: #475569; display: flex; flex-direction: column; gap: 4px;">
                            <div>
                                <i class="fas fa-calendar-day" style="width: 14px; color: #94a3b8;"></i> KS: ${ql.ngay_khao_sat || 'N/A'}
                            </div>
                            <div style="${isNear ? 'color: #ef4444; font-weight: bold;' : ''}">
                                <i class="fas fa-clock" style="width: 14px; ${isNear ? 'color: #ef4444;' : 'color: #94a3b8;'}"></i> Hạn: ${ql.han_viet_ho_so || 'N/A'}
                            </div>
                        </div>

                        <!-- Column 3: Status & Profile Writer -->
                        <div style="text-align: right; display: flex; flex-direction: column; gap: 4px; align-items: flex-end;">
                            <span class="status-badge-small" style="background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 700; white-space: nowrap; border: 1px solid #bae6fd;">
                                ${status}
                            </span>
                            <div style="font-size: 0.7rem; font-weight: 600; color: #64748b;">
                                 ${ql.nguoi_viet_ho_so || 'Chưa phân công'}
                            </div>
                        </div>
                    </div>
                </a>
            `;
        });
    }
    listHtml += '</div>';
    
    modalBody.innerHTML = listHtml;
    statsModal.style.display = 'flex';
}

function closeStatsModal() {
    statsModal.style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target == statsModal) {
        closeStatsModal();
    }
}

surveysRef.on('value', (snapshot) => {
    const items = [];
    snapshot.forEach((child) => {
        const data = child.val() || {};
        data.id = child.key;
        items.push(data);
    });
    allItemsGlobal = items;
    renderStats(items);
});
