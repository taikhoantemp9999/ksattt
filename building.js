// Trạng thái bộ nhớ tạm thời cho Mock Data
let buildingsArray = []; // Mảng chứa nhiều Tòa nhà
let buildingData = {
    id: null,
    name: "Tòa A",
    nodes: [], // Danh sách phòng / hành lang
    equipments: [] // Danh sách thiết bị
};

let currentSelectedNodeId = null;

const buildingsListSection = document.getElementById("buildingsListSection");
const buildingsListContainer = document.getElementById("buildingsListContainer");
const buildingsZeroState = document.getElementById("buildingsZeroState");
const btnShowSetup = document.getElementById("btnShowSetup");
const btnBackToList = document.getElementById("btnBackToList");
const btnBackToMain = document.getElementById("btnBackToMain");

const setupSection = document.getElementById("setupSection");
const mapSection = document.getElementById("mapSection");
const floorsContainer = document.getElementById("floorsContainer");

// Drawer Elements
const roomDrawer = document.getElementById("roomDrawer");
const drawerRoomNameInput = document.getElementById("drawerRoomNameInput");

const roomCompletedToggle = document.getElementById("roomCompletedToggle");
const btnCloseDrawer = document.getElementById("btnCloseDrawer");
const equipmentsList = document.getElementById("equipmentsList");
const equipmentCountBadge = document.getElementById("equipmentCountBadge");

// Khởi tạo Datalist Gợi ý từ Firebase
let userSuggestions = {
    rooms: [],
    eqNames: [],
    eqModels: [],
    eqLocations: [],
    eqISPs: []
};

// Cấu hình Firebase 
const firebaseConfig = {
    apiKey: "AIzaSyBxDaIIhmWJOB6w6Jg6Ch6a2-b_5HvJTWw",
    authDomain: "english-fun-1937c.firebaseapp.com",
    databaseURL: "https://english-fun-1937c-default-rtdb.firebaseio.com",
    projectId: "english-fun-1937c",
    storageBucket: "english-fun-1937c.firebasestorage.app",
    messagingSenderId: "236020730818",
    appId: "1:236020730818:web:4ebb378dc7a7005d2fa45b"
};

// Khởi tạo Firebase nếu chưa có
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();
const suggestionsRef = database.ref('suggestions_ATTT');

// Lắng nghe dữ liệu Gợi ý từ API tập trung
suggestionsRef.on('value', (snapshot) => {
    if(snapshot.exists()) {
        const val = snapshot.val();
        userSuggestions.rooms = val.rooms || [];
        userSuggestions.eqNames = val.eqNames || [];
        userSuggestions.eqModels = val.eqModels || [];
        userSuggestions.eqLocations = val.eqLocations || [];
        userSuggestions.eqISPs = val.eqISPs || [];
        populateDataLists();
    }
});

// Đọc thông số Khách hàng từ URL
const urlParams = new URLSearchParams(window.location.search);
const customerId = urlParams.get('customerId') || 'unknown';
const customerName = urlParams.get('customerName') || 'Khách hàng chưa rõ';

// Xử lý nút Back trang chính (kèm editId)
btnBackToMain.addEventListener('click', (e) => {
    e.preventDefault();
    if(customerId !== 'unknown') {
        window.location.href = `index.html?editId=${customerId}`;
    } else {
        window.location.href = 'index.html';
    }
});

document.getElementById('customerNameHeader').innerText = customerName;

// Khởi tạo Sơ đồ MỚI
document.getElementById("btnGenerateMap").addEventListener("click", () => {
    const name = document.getElementById("buildingName").value || "Tòa A";
    const numFloors = parseInt(document.getElementById("numFloors").value) || 1;
    const numRooms = parseInt(document.getElementById("numRooms").value) || 5;
    const template = document.getElementById("buildingTemplate").value;

    document.getElementById("displayBuildingName").innerText = name;
    
    // Tạo mảng Dữ liệu Tòa nhà mới
    buildingData = {
        id: 'bldg_' + Date.now(),
        name: name,
        nodes: [],
        equipments: []
    };

    // Tự động sinh danh sách phòng
    let nodeIdCounter = 1;
    for (let f = 1; f <= numFloors; f++) {
        if (template === 'standard') {
            buildingData.nodes.push({ id: `node_${nodeIdCounter++}`, floor: f, type: 'Corridor', name: `Hành lang Tầng ${f}`, status: 0 });
            buildingData.nodes.push({ id: `node_${nodeIdCounter++}`, floor: f, type: 'Staircase', name: `Cầu thang Tầng ${f}`, status: 0 });
        }
        for (let r = 1; r <= numRooms; r++) {
            let roomNumber = (f * 100) + r;
            buildingData.nodes.push({ id: `node_${nodeIdCounter++}`, floor: f, type: 'Room', name: `Phòng ${roomNumber}`, status: 0 });
        }
    }

    // Push vào Mảng Tòa nhà và Lưu
    buildingsArray.push(buildingData);
    saveBuildingsArrayLocally();

    renderMap();
    showMapSection();
});

// Hàm lưu Mảng Dữ liệu Tòa nhà của Khách Hàng
function saveBuildingsArrayLocally() {
    if(customerId === 'unknown') return;
    localStorage.setItem(`BUILDINGS_LIST_${customerId}`, JSON.stringify(buildingsArray));
}

// Cập nhật lưu buildingData (khi sửa/thêm phòng thiết bị)
function saveBuildingDataLocally() {
    if(!buildingData.id) return;
    const index = buildingsArray.findIndex(b => b.id === buildingData.id);
    if(index !== -1) {
        buildingsArray[index] = buildingData;
        saveBuildingsArrayLocally();
    }
}

// Hàm chuyển trang
function showListSection() {
    buildingsListSection.style.display = "block";
    setupSection.style.display = "none";
    mapSection.style.display = "none";
    btnBackToList.style.display = "none";
    document.getElementById("btnSaveBuildingMap").style.display = "none";
    renderBuildingsList();
}

function showSetupSection() {
    buildingsListSection.style.display = "none";
    setupSection.style.display = "block";
    mapSection.style.display = "none";
    btnBackToList.style.display = "block";
    document.getElementById("btnSaveBuildingMap").style.display = "none";
}

function showMapSection() {
    buildingsListSection.style.display = "none";
    setupSection.style.display = "none";
    mapSection.style.display = "block";
    btnBackToList.style.display = "block";
    document.getElementById("btnSaveBuildingMap").style.display = "block";
}

// Gắn event navigation
btnShowSetup.addEventListener("click", showSetupSection);
btnBackToList.addEventListener("click", showListSection);

// Khôi phục dữ liệu khi load trang
window.addEventListener('DOMContentLoaded', () => {
    populateDataLists();
    
    // Migrate từ dữ liệu cũ (chỉ 1 tòa nhà) sang Mảng (Nhiều tòa nhà)
    const oldSaved = localStorage.getItem(`BUILDING_MAP_${customerId}`);
    const newSaved = localStorage.getItem(`BUILDINGS_LIST_${customerId}`);
    
    if (newSaved) {
        buildingsArray = JSON.parse(newSaved);
    } else if (oldSaved) {
        // Migration logic
        let oldData = JSON.parse(oldSaved);
        oldData.id = 'bldg_' + Date.now(); // Gắn ID giả
        buildingsArray = [oldData];
        saveBuildingsArrayLocally(); // Lưu format mới
        localStorage.removeItem(`BUILDING_MAP_${customerId}`); // Xóa cái cũ
    }
    
    showListSection(); // Mặc định mở Màn hình List
});

// Render Danh sách Tòa nhà
function renderBuildingsList() {
    buildingsListContainer.innerHTML = '';
    
    if(buildingsArray.length === 0) {
        buildingsZeroState.style.display = 'block';
        return;
    }
    buildingsZeroState.style.display = 'none';

    buildingsArray.forEach(bldg => {
        const floorCount = new Set(bldg.nodes.map(n => n.floor)).size;
        const eqCount = bldg.equipments ? bldg.equipments.length : 0;
        
        const card = document.createElement('div');
        card.className = 'card';
        card.style.display = 'flex';
        card.style.justifyContent = 'space-between';
        card.style.alignItems = 'center';
        card.style.padding = '16px';
        card.style.marginBottom = '0';
        
        card.innerHTML = `
            <div>
                <h3 style="margin-bottom: 4px; color: var(--primary);">${bldg.name}</h3>
                <div style="font-size: 0.85rem; color: var(--text-muted); display: flex; gap: 12px;">
                    <span>🏢 ${floorCount} Tầng</span>
                    <span>🚪 ${bldg.nodes.length} Khu vực</span>
                    <span>💻 ${eqCount} Thiết bị</span>
                </div>
            </div>
            <div style="display: flex; gap: 8px;">
                <button class="action-btn" onclick="editBuilding('${bldg.id}')" style="background: #0284c7; color: white;">Sửa Sơ đồ</button>
                <button class="action-btn" onclick="deleteBuilding('${bldg.id}')" style="background: #fee2e2; color: #ef4444;">Xóa</button>
            </div>
        `;
        buildingsListContainer.appendChild(card);
    });
}

// Xử lý Sửa tòa nhà
window.editBuilding = function(id) {
    const target = buildingsArray.find(b => b.id === id);
    if(target) {
        buildingData = target;
        document.getElementById("displayBuildingName").innerText = buildingData.name;
        renderMap();
        showMapSection();
    }
};

// Xử lý Xóa tòa nhà
window.deleteBuilding = function(id) {
    if(confirm("Xác nhận Xóa Tòa nhà này? Mọi thiết bị bên trong sẽ bị mất!")) {
        buildingsArray = buildingsArray.filter(b => b.id !== id);
        saveBuildingsArrayLocally();
        renderBuildingsList();
        showToast("Đã xóa Tòa nhà!");
    }
};

// Hàm đưa lịch sử gợi ý vào Datalist HTML
function populateDataLists() {
    const listMap = {
        'roomNameSuggestions': userSuggestions.rooms,
        'eqNameSuggestions': userSuggestions.eqNames,
        'eqModelSuggestions': userSuggestions.eqModels,
        'eqLocationSuggestions': userSuggestions.eqLocations,
        'eqISPSuggestions': userSuggestions.eqISPs
    };
    
    for(let listId in listMap) {
        const dlist = document.getElementById(listId);
        if(dlist) {
            // Chỉ thêm các mục mới từ user, không xóa các mục hardcode sẵn trong HTML
            listMap[listId].forEach(val => {
                if(!Array.from(dlist.options).find(opt => opt.value === val)) {
                    const opt = document.createElement('option');
                    opt.value = val;
                    dlist.appendChild(opt);
                }
            });
        }
    }
}

// Hàm lưu gợi ý mới đồng bộ lên Firebase
function saveSuggestion(category, value) {
    if(!value) return;
    value = value.trim();
    if(value === "") return;
    
    // Nếu từ mới tinh chưa có trên cloud
    if(!userSuggestions[category].includes(value)) {
        userSuggestions[category].push(value);
        suggestionsRef.child(category).set(userSuggestions[category]);
        // Bỏ populateDataLists() chạy cục bộ vì Firebase on('value') sẽ tự trigger lại
    }
}

// Hàm Render Ma trận lưới Phòng
function renderMap() {
    floorsContainer.innerHTML = '';

    // Gom nhóm theo tầng
    const floorsMap = {};
    buildingData.nodes.forEach(node => {
        if (!floorsMap[node.floor]) floorsMap[node.floor] = [];
        floorsMap[node.floor].push(node);
    });

    // Lặp qua từng tầng và render HTML
    Object.keys(floorsMap).sort((a,b) => b - a).forEach(floorNum => {
        const nodesInFloor = floorsMap[floorNum];
        
        const floorDiv = document.createElement('div');
        floorDiv.className = 'floor-row';
        floorDiv.innerHTML = `<div class="floor-title">Tầng ${floorNum}</div>`;
        
        const scrollDiv = document.createElement('div');
        scrollDiv.className = 'floor-horizontal-scroll';
        
        const rooms = nodesInFloor.filter(n => n.type === 'Room');
        const staircase = nodesInFloor.find(n => n.type === 'Staircase' || n.type === 'Stairs');
        const corridor = nodesInFloor.find(n => n.type === 'Corridor');

        // Layout cuộn ngang dàn trải 1 dòng (Flexbox)
        // Sắp xếp thứ tự hiển thị: Nửa số phòng đầu -> Cầu thang -> Hành lang -> Nửa số phòng sau
        const displayNodes = [];
        
        if (staircase && corridor) {
            const topRoomsCount = Math.ceil(rooms.length / 2);
            for(let i = 0; i < topRoomsCount; i++) displayNodes.push(rooms[i]);
            
            displayNodes.push(staircase);
            displayNodes.push(corridor);
            
            for(let i = topRoomsCount; i < rooms.length; i++) displayNodes.push(rooms[i]);
        } else {
            // Nếu không có cầu thang/hành lang thì cứ đẩy vào bình thường
            displayNodes.push(...nodesInFloor);
        }

        displayNodes.forEach(node => {
            const eqCount = buildingData.equipments.filter(eq => eq.nodeId === node.id).length;
            const card = document.createElement('div');
            
            let extraClass = '';
            if(node.type === 'Corridor') extraClass = 'corridor-node';
            if(node.type === 'Staircase') extraClass = 'staircase-node';
            
            card.className = `room-card ${extraClass} status-${node.status}`;
            
            let icon = '';
            if(node.type === 'Corridor') icon = '🚪 ';
            if(node.type === 'Staircase') icon = '🪜 ';
            
            card.innerHTML = `<div class="room-name" title="${node.name}">${icon}${node.name}</div><div class="room-eq-count">💻 ${eqCount}</div>`;
            card.addEventListener('click', () => openRoomDrawer(node.id));
            
            scrollDiv.appendChild(card);
        });

        floorDiv.appendChild(scrollDiv);
        floorsContainer.appendChild(floorDiv);
    });
}

// Logic Drawer
function openRoomDrawer(nodeId) {
    currentSelectedNodeId = nodeId;
    const node = buildingData.nodes.find(n => n.id === nodeId);
    if(!node) return;

    drawerRoomNameInput.value = node.name;
    roomCompletedToggle.checked = node.status === 2; // Xanh là checked
    
    // Style toggle area dựa trên trạng thái
    updateToggleUI();

    renderEquipmentsInDrawer(node.id);

    roomDrawer.classList.add('active');
}

// Xử lý đổi tên phòng trực tiếp trên Input
drawerRoomNameInput.addEventListener('change', (e) => {
    const newName = e.target.value.trim();
    if(!newName) return;
    
    const node = buildingData.nodes.find(n => n.id === currentSelectedNodeId);
    if(node && node.name !== newName) {
        node.name = newName;
        renderMap();
        saveBuildingDataLocally();
        saveSuggestion('rooms', newName); // Lưu lịch sử tên phòng
        showToast("Đã lưu tên khu vực!");
    }
});

function updateToggleUI() {
    const toggleCard = document.querySelector('.status-toggle-card');
    if (roomCompletedToggle.checked) {
        toggleCard.style.background = 'var(--status-green)';
        toggleCard.style.borderColor = 'var(--status-green-border)';
    } else {
        toggleCard.style.background = '#f1f5f9';
        toggleCard.style.borderColor = '#cbd5e1';
    }
}

btnCloseDrawer.addEventListener('click', () => {
    roomDrawer.classList.remove('active');
    currentSelectedNodeId = null;
});

// Xử lý Thay đổi Trạng thái Hoàn thành
roomCompletedToggle.addEventListener('change', (e) => {
    updateToggleUI();
    const node = buildingData.nodes.find(n => n.id === currentSelectedNodeId);
    if(node) {
        if(e.target.checked) {
            node.status = 2; // Hoàn thành
        } else {
            // Nếu hủy hoàn thành, kiểm tra xem có thiết bị không
            const eqCount = buildingData.equipments.filter(eq => eq.nodeId === node.id).length;
            node.status = eqCount > 0 ? 1 : 0; // 1: Đang làm, 0: Trắng
        }
        renderMap(); // Cập nhật lại màu ngoài lưới
        saveBuildingDataLocally(); // Auto save
        showToast(e.target.checked ? "Đã đánh dấu Hoàn thành!" : "Đã hủy Hoàn thành");
    }
});

// Hiển thị danh sách thiết bị
function renderEquipmentsInDrawer(nodeId) {
    const eqs = buildingData.equipments.filter(e => e.nodeId === nodeId);
    equipmentCountBadge.innerText = eqs.length;
    
    if (eqs.length === 0) {
        equipmentsList.innerHTML = `<div class="empty-state">Phòng này chưa ghi nhận thiết bị.<br>Bấm "+ Thêm" để khai báo.</div>`;
        return;
    }

    equipmentsList.innerHTML = '';
    eqs.forEach(eq => {
        const ispHtml = eq.isp ? `<div class="eq-item-detail" style="color:#0284c7; font-weight:600; background:rgba(2,132,199,0.1); display:inline-block; padding:2px 6px; border-radius:4px;">🌐 ISP: ${eq.isp}</div>` : '';
        const div = document.createElement('div');
        div.className = 'eq-item';
        div.innerHTML = `
            <div class="eq-item-title">${eq.name} ${eq.model ? `(${eq.model})` : ''}</div>
            <div class="eq-item-detail">📍 ${eq.exactLocation || 'Không ghi rõ vị trí'}</div>
            ${ispHtml}
            <div class="eq-item-detail">🎯 ${eq.purpose || 'Không rõ mục đích'}</div>
            <button class="eq-item-delete" onclick="deleteEquipment('${eq.id}')">&times;</button>
        `;
        equipmentsList.appendChild(div);
    });
}

// Logic Form Modal Thêm Thiết Bị
btnAddEquipment.addEventListener('click', () => {
    equipmentForm.reset();
    document.getElementById("eqId").value = '';
    document.getElementById('eqISP').value = ''; // Reset ISP field
    equipmentModal.classList.add('active');
});

btnCloseEqModal.addEventListener('click', () => {
    equipmentModal.classList.remove('active');
});

equipmentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newEq = {
        id: 'eq_' + Date.now(),
        nodeId: currentSelectedNodeId,
        name: document.getElementById('eqName').value,
        model: document.getElementById('eqModel').value,
        exactLocation: document.getElementById('eqExactLocation').value,
        isp: document.getElementById('eqISP').value,
        purpose: document.getElementById('eqPurpose').value,
        notes: document.getElementById('eqNotes').value
    };

    buildingData.equipments.push(newEq);

    // Lưu lịch sử nhập liệu cho lần sau gợi ý
    saveSuggestion('eqNames', newEq.name);
    saveSuggestion('eqModels', newEq.model);
    saveSuggestion('eqLocations', newEq.exactLocation);
    saveSuggestion('eqISPs', newEq.isp);

    // Auto-update room status to ORANGE if not green
    const node = buildingData.nodes.find(n => n.id === currentSelectedNodeId);
    if(node && node.status === 0) {
        node.status = 1; // Đang làm
        roomCompletedToggle.checked = false;
        updateToggleUI();
    }

    renderEquipmentsInDrawer(currentSelectedNodeId);
    renderMap();
    saveBuildingDataLocally(); // Auto save

    equipmentModal.classList.remove('active');
    showToast("Đã lưu thiết bị thành công!");
});

// Xóa thiết bị (Gắn ở inline window context)
window.deleteEquipment = function(eqId) {
    if(confirm("Xóa thiết bị này?")) {
        buildingData.equipments = buildingData.equipments.filter(e => e.id !== eqId);
        
        // Kiểm tra hạ cấp trạng thái nếu hết thiết bị
        const node = buildingData.nodes.find(n => n.id === currentSelectedNodeId);
        if(node && node.status === 1) { // Nếu đang cam
            const eqCount = buildingData.equipments.filter(eq => eq.nodeId === node.id).length;
            if(eqCount === 0) node.status = 0; // Về trắng
        }
        
        renderEquipmentsInDrawer(currentSelectedNodeId);
        renderMap();
        saveBuildingDataLocally(); // Auto save
        showToast("Đã xóa thiết bị");
    }
}

// Xóa Tòa Nhà Đang Sửa Hiện Cấm Dùng Trực Tiếp Trong Sơ Đồ Vì Đã Có Về Trang List
// Xoá bỏ nút Reset vì đã có màn Danh sách Quản lý

// Toast
function showToast(msg) {
    var toast = document.getElementById("toast");
    toast.innerText = msg;
    toast.className = "toast show";
    setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
}
