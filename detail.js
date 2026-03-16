const firebaseConfig = {
    apiKey: "AIzaSyBxDaIIhmWJOB6w6Jg6Ch6a2-b_5HvJTWw",
    authDomain: "english-fun-1937c.firebaseapp.com",
    databaseURL: "https://english-fun-1937c-default-rtdb.firebaseio.com",
    projectId: "english-fun-1937c",
    storageBucket: "english-fun-1937c.firebasestorage.app",
    messagingSenderId: "236020730818",
    appId: "1:236020730818:web:4ebb378dc7a7005d2fa45b"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let currentSurveyData = null;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    const btnExport = document.getElementById('btnExportEquipmentExcel');
    if (btnExport) {
        btnExport.addEventListener('click', () => {
            exportEquipmentExcel(currentSurveyData);
        });
    }

    if (!id) {
        document.getElementById('detailContent').innerHTML = '<div class="empty-state">Không tìm thấy ID khảo sát.</div>';
        return;
    }

    database.ref('surveys_ATTT').child(id).once('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) {
            document.getElementById('detailContent').innerHTML = '<div class="empty-state">Dữ liệu không tồn tại hoặc đã bị xóa.</div>';
            return;
        }
        currentSurveyData = data;
        renderDetail(data);
    });
});

function renderDetail(data) {
    document.getElementById('customerName').innerText = data.don_vi_khao_sat;
    document.getElementById('surveyTime').innerText = `Nhập lúc: ${new Date(data.thoi_gian_nhap).toLocaleString('vi-VN')}`;

    const container = document.getElementById('detailContent');
    
    let html = `
        <div class="section-header">I. THÔNG TIN CHUNG</div>
        <div class="detail-card">
            <div class="detail-row">
                <div class="detail-label">Đơn vị khảo sát</div>
                <div class="detail-value">${data.don_vi_khao_sat}</div>
            </div>
        </div>

        <div class="section-header">II. HẠ TẦNG THIẾT BỊ</div>
        <div class="detail-card">
            <div class="detail-row">
                <div class="detail-label">Tổng máy bàn</div>
                <div class="detail-value">${data.ha_tang_thiet_bi.tong_may_ban || 0}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Tổng laptop</div>
                <div class="detail-value">${data.ha_tang_thiet_bi.tong_laptop || 0}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Số máy RAM > 4G</div>
                <div class="detail-value">${data.ha_tang_thiet_bi.so_may_ram_lon_hon_4G || 0}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Số đường internet</div>
                <div class="detail-value">${data.ha_tang_thiet_bi.so_duong_internet || 0}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Số Camera</div>
                <div class="detail-value">${data.ha_tang_thiet_bi.so_camera || "0"}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Cài phần mềm Antivirus</div>
                <div class="detail-value">${data.ha_tang_thiet_bi.cai_phan_mem_antivirus || "Không"}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Số lượng cài SmartIR</div>
                <div class="detail-value">${data.ha_tang_thiet_bi.so_luong_cai_smartIR || 0}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Hệ thống mạng Lan</div>
                <div class="detail-value">
                    <span class="status-badge ${data.ha_tang_thiet_bi.he_thong_mang_lan ? 'status-yes' : 'status-no'}">
                        ${data.ha_tang_thiet_bi.he_thong_mang_lan ? 'CÓ' : 'KHÔNG'}
                    </span>
                </div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Có thi công mạng Lan</div>
                <div class="detail-value">
                    <span class="status-badge ${data.ha_tang_thiet_bi.co_thi_cong_mang_lan ? 'status-yes' : 'status-no'}">
                        ${data.ha_tang_thiet_bi.co_thi_cong_mang_lan ? 'CÓ' : 'KHÔNG'}
                    </span>
                </div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Tường lửa (Firewall)</div>
                <div class="detail-value">
                    <span class="status-badge ${data.ha_tang_thiet_bi.tuong_lua ? 'status-yes' : 'status-no'}">
                        ${data.ha_tang_thiet_bi.tuong_lua ? 'CÓ' : 'KHÔNG'}
                    </span>
                </div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Thiết bị tường lửa</div>
                <div class="detail-value">${data.ha_tang_thiet_bi.thiet_bi_tuong_lua || "N/A"}</div>
            </div>
        </div>

        <div class="section-header">III. CÁC HỆ THỐNG THÔNG TIN KHAI THÁC</div>
        <div class="detail-card">
            <ul style="padding-left: 20px;">
                ${(data.he_thong_thong_tin || []).map(item => `<li style="margin-bottom: 8px;">${item}</li>`).join('')}
                ${(data.he_thong_thong_tin || []).length === 0 ? '<li>Chưa chọn hệ thống nào.</li>' : ''}
            </ul>
        </div>

        <div class="section-header">IV. THÔNG TIN LIÊN HỆ</div>
        <div class="detail-card">
            <h4 style="margin-bottom: 12px; color: var(--primary);">1. Đầu mối cung cấp thông tin</h4>
            <div class="detail-row">
                <div class="detail-label">Họ tên</div>
                <div class="detail-value">${data.thong_tin_lien_he.dau_moi_cung_cap.ho_ten || ""}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Số điện thoại</div>
                <div class="detail-value">${data.thong_tin_lien_he.dau_moi_cung_cap.so_dien_thoai || ""}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Đơn vị</div>
                <div class="detail-value">${data.thong_tin_lien_he.dau_moi_cung_cap.don_vi || ""}</div>
            </div>

            <h4 style="margin: 20px 0 12px 0; color: var(--primary);">2. Đơn vị vận hành (UBND xã)</h4>
            <div class="detail-row">
                <div class="detail-label">Người đại diện</div>
                <div class="detail-value">${data.thong_tin_lien_he.don_vi_van_hanh.nguoi_dai_dien || ""}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Chức vụ</div>
                <div class="detail-value">${data.thong_tin_lien_he.don_vi_van_hanh.chuc_vu || ""}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Số điện thoại</div>
                <div class="detail-value">${data.thong_tin_lien_he.don_vi_van_hanh.so_dien_thoai || ""}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Thư điện tử</div>
                <div class="detail-value">${data.thong_tin_lien_he.don_vi_van_hanh.thu_dien_tu || ""}</div>
            </div>

            <h4 style="margin: 20px 0 12px 0; color: var(--primary);">3. Công an xã</h4>
            <div class="detail-row">
                <div class="detail-label">Họ tên Trưởng CA</div>
                <div class="detail-value">${data.thong_tin_lien_he.cong_an_xa.ho_ten || ""}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Số điện thoại CA</div>
                <div class="detail-value">${data.thong_tin_lien_he.cong_an_xa.so_dien_thoai || ""}</div>
            </div>
        </div>

        <div class="section-header">V. ĐỀ XUẤT / GHI CHÚ</div>
        <div class="detail-card">
            <div style="white-space: pre-wrap; line-height: 1.6;">${data.de_xuat || "Không có ghi chú."}</div>
        </div>

        ${renderBuildingsDetailed(data.buildingsArray)}
    `;

    container.innerHTML = html;
}

function renderBuildingsDetailed(buildingsArray) {
    if (!buildingsArray || !Array.isArray(buildingsArray) || buildingsArray.length === 0) {
        return '';
    }

    const isMainDevice = (eq) => eq && (eq.isMainDevice === true || eq.isMainDevice === "true");
    const safeStr = (v) => (v === null || v === undefined) ? '' : String(v);

    let buildingsHtml = '<div class="section-header">VI. SƠ ĐỒ TÒA NHÀ & CHI TIẾT THIẾT BỊ</div>';

    buildingsArray.forEach((bldg, index) => {
        buildingsHtml += `
            <div class="detail-card" style="border-left: 5px solid var(--primary);">
                <h3 style="color: var(--primary); margin-bottom: 16px;">${index + 1}. Tòa nhà: ${bldg.name}</h3>
                
                <div style="margin-bottom: 20px;">
                    <h4 style="font-size: 0.95rem; color: var(--text-muted); margin-bottom: 10px;">Cấu trúc & Ghi chú mạng chính:</h4>
                    <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px dashed #cbd5e1; white-space: pre-wrap; margin-bottom: 10px;">${bldg.mainNetworkNotes || 'Không có ghi chú mạng chính.'}</div>
                </div>

                <h4 style="font-size: 1rem; color: var(--text-main); margin: 6px 0 12px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Sơ đồ tòa nhà (theo tầng):</h4>
        `;

        // Tạo map để lấy tên khu vực (node)
        const nodeMap = {};
        if (bldg.nodes && Array.isArray(bldg.nodes)) {
            bldg.nodes.forEach(n => nodeMap[n.id] = n.name);
        }

        // ===== Render sơ đồ theo đúng "thẻ" như building.html =====
        const nodes = Array.isArray(bldg.nodes) ? bldg.nodes : [];
        const eqs = Array.isArray(bldg.equipments) ? bldg.equipments : [];

        // Gom nhóm node theo tầng
        const floorsMap = {};
        nodes.forEach(node => {
            const floor = Number(node.floor || 0);
            if (!floorsMap[floor]) floorsMap[floor] = [];
            floorsMap[floor].push(node);
        });

        const floorNums = Object.keys(floorsMap)
            .map(k => Number(k))
            .filter(n => !Number.isNaN(n))
            .sort((a, b) => b - a); // giống building.js

        if (floorNums.length > 0) {
            buildingsHtml += `<div class="bldg-map"><div class="floors-container">`;

            floorNums.forEach(floorNum => {
                const nodesInFloor = floorsMap[floorNum] || [];
                const leftNodes = nodesInFloor.filter(n => n.position === 'left');
                const centerNodes = nodesInFloor.filter(n => n.position === 'center');
                const rightNodes = nodesInFloor.filter(n => n.position === 'right');
                const displayNodes = [...leftNodes, ...centerNodes, ...rightNodes];

                buildingsHtml += `
                    <div class="floor-row">
                        <div class="floor-title">TẦNG ${floorNum}</div>
                        <div class="floor-horizontal-scroll">
                `;

                displayNodes.forEach(node => {
                    const nodeEqs = eqs.filter(eq => eq.nodeId === node.id);
                    const eqCount = nodeEqs.length;
                    const hasIsp = nodeEqs.some(eq => eq.isp && String(eq.isp).trim() !== '');
                    const hasMainDev = nodeEqs.some(eq => isMainDevice(eq));

                    let extraClass = '';
                    if (node.type === 'Corridor') extraClass = 'corridor-node';
                    if (node.type === 'Staircase') extraClass = 'staircase-node';
                    if (hasIsp) extraClass += (extraClass ? ' ' : '') + 'has-isp-room';

                    let icon = '';
                    if (node.type === 'Corridor') icon = '🚪 ';
                    if (node.type === 'Staircase') icon = '🪜 ';

                    const customNameStyle = hasMainDev ? `color: #ef4444 !important; font-weight: 800;` : '';
                    const status = (node.status === 0 || node.status === 1 || node.status === 2) ? node.status : 0;

                    buildingsHtml += `
                        <div class="room-card ${extraClass} status-${status}" title="${safeStr(node.name)}">
                            <div class="room-name" style="${customNameStyle}">${icon}${safeStr(node.name)}</div>
                            <div class="room-eq-count">💻 ${eqCount}</div>
                        </div>
                    `;
                });

                buildingsHtml += `
                        </div>
                    </div>
                `;
            });

            buildingsHtml += `</div></div>`;
        } else {
            buildingsHtml += `<div class="empty-state" style="padding: 10px; margin-bottom: 10px;">Tòa nhà này chưa có sơ đồ khu vực (phòng/tầng).</div>`;
        }

        buildingsHtml += `
                <h4 style="font-size: 1rem; color: var(--text-main); margin: 18px 0 12px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Danh sách thiết bị chi tiết:</h4>
        `;

        // Tạo danh sách phẳng tất cả thiết bị
        let allEqs = [];
        if (bldg.equipments && Array.isArray(bldg.equipments)) {
            allEqs = [...bldg.equipments];
        }

        // Sắp xếp thiết bị:
        // 1. Ưu tiên thiết bị mạng chính (true trước)
        // 2. Tên thiết bị (A-Z)
        // 3. Model (A-Z)
        allEqs.sort((a, b) => {
            const aMain = isMainDevice(a) ? 1 : 0;
            const bMain = isMainDevice(b) ? 1 : 0;
            if (aMain !== bMain) return bMain - aMain; // 1 trước 0
            
            const aName = (a.name || '').toLowerCase();
            const bName = (b.name || '').toLowerCase();
            if (aName !== bName) return aName.localeCompare(bName);
            
            const aModel = (a.model || '').toLowerCase();
            const bModel = (b.model || '').toLowerCase();
            return aModel.localeCompare(bModel);
        });

        if (allEqs.length > 0) {
            buildingsHtml += `
                <table class="building-table">
                    <thead>
                        <tr>
                            <th style="width: 6%;">STT</th>
                            <th style="width: 34%;">Tên thiết bị, Model</th>
                            <th style="width: 20%;">Vị trí</th>
                            <th style="width: 40%;">Mục đích và Khu vực</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            allEqs.forEach((eq, idx) => {
                const nodeName = nodeMap[eq.nodeId] || 'Không xác định';
                const mainLabel = isMainDevice(eq) ? `<span class="tag tag-main">🌟 Mạch chính</span>` : '';
                const networkZone = (eq.isp && String(eq.isp).trim() !== '') ? 'Vùng mạng biên' : 'Vùng mạng nội bộ';
                const nameModel = `${safeStr(eq.name)}${eq.model ? ` (${safeStr(eq.model)})` : ''}`;
                
                buildingsHtml += `
                            <tr>
                                <td style="text-align: center; font-weight: 700; color: #475569;">${idx + 1}</td>
                                <td>
                                    <div style="font-weight: 700; color: #0f172a;">${nameModel || '-'}</div>
                                    ${mainLabel}
                                </td>
                                <td style="font-weight: 700; color: #334155;">${networkZone}</td>
                                <td>
                                    <div style="font-weight: 600; color: #334155;">🎯 ${safeStr(eq.purpose) || '-'}</div>
                                    <div style="margin-top: 4px; font-size: 0.9rem; color: var(--text-muted);">📍 ${nodeName}</div>
                                </td>
                            </tr>
                `;
            });

            buildingsHtml += `
                        </tbody>
                    </table>
            `;
        } else {
            buildingsHtml += `<div class="empty-state" style="padding: 10px;">Tòa nhà này chưa có thông tin thiết bị chi tiết.</div>`;
        }

        buildingsHtml += `</div>`; // Đóng detail-card của building
    });

    return buildingsHtml;
}

function exportEquipmentExcel(surveyData) {
    if (!surveyData || !surveyData.buildingsArray || !Array.isArray(surveyData.buildingsArray)) {
        alert("Chưa có dữ liệu tòa nhà/thiết bị để xuất.");
        return;
    }
    if (typeof XLSX === 'undefined') {
        alert("Thiếu thư viện xuất Excel (XLSX). Vui lòng kiểm tra kết nối mạng hoặc tải lại trang.");
        return;
    }

    const isMainDevice = (eq) => eq && (eq.isMainDevice === true || eq.isMainDevice === "true");
    const safeStr = (v) => (v === null || v === undefined) ? '' : String(v);

    // Flatten toàn bộ thiết bị (thêm cột Tòa nhà & Khu vực)
    const flat = [];
    (surveyData.buildingsArray || []).forEach(bldg => {
        const nodeMap = {};
        if (bldg.nodes && Array.isArray(bldg.nodes)) {
            bldg.nodes.forEach(n => nodeMap[n.id] = n.name);
        }
        const eqs = (bldg.equipments && Array.isArray(bldg.equipments)) ? bldg.equipments : [];
        eqs.forEach(eq => {
            flat.push({
                building: safeStr(bldg.name),
                name: safeStr(eq.name),
                model: safeStr(eq.model),
                isMain: isMainDevice(eq),
                isp: safeStr(eq.isp),
                purpose: safeStr(eq.purpose),
                area: safeStr(nodeMap[eq.nodeId] || 'Không xác định')
            });
        });
    });

    if (flat.length === 0) {
        alert("Không có thiết bị để xuất.");
        return;
    }

    // Sort: mạng chính -> tên -> model (phụ: tòa nhà -> khu vực)
    flat.sort((a, b) => {
        const aMain = a.isMain ? 1 : 0;
        const bMain = b.isMain ? 1 : 0;
        if (aMain !== bMain) return bMain - aMain;
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        if (aName !== bName) return aName.localeCompare(bName);
        const aModel = a.model.toLowerCase();
        const bModel = b.model.toLowerCase();
        if (aModel !== bModel) return aModel.localeCompare(bModel);
        const aB = a.building.toLowerCase();
        const bB = b.building.toLowerCase();
        if (aB !== bB) return aB.localeCompare(bB);
        return a.area.toLowerCase().localeCompare(b.area.toLowerCase());
    });

    // Xuất đúng “4 cột” như bảng + thêm Tòa nhà để tránh lẫn
    const header = ["STT", "Tòa nhà", "Tên thiết bị, Model", "Vị trí", "Mục đích và Khu vực"];
    const rows = flat.map((r, idx) => {
        const nameModel = `${r.name}${r.model ? ` (${r.model})` : ''}`.trim();
        const networkZone = r.isp && r.isp.trim() !== '' ? 'Vùng mạng biên' : 'Vùng mạng nội bộ';
        const purposeArea = `${r.purpose || '-'} | ${r.area || '-'}`;
        return [idx + 1, r.building || '-', nameModel || '-', networkZone, purposeArea];
    });

    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    // Độ rộng cột tương đối
    ws['!cols'] = [
        { wch: 6 },
        { wch: 20 },
        { wch: 34 },
        { wch: 18 },
        { wch: 40 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DanhSachThietBi");

    const org = safeStr(surveyData.don_vi_khao_sat).replace(/[\\/:*?"<>|]+/g, '').trim();
    const fileName = `danh_sach_thiet_bi_${org || 'khao_sat'}.xlsx`;
    XLSX.writeFile(wb, fileName);
}
