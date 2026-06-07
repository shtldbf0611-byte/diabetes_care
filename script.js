// ====== APP INITIALIZATION ======
document.addEventListener('DOMContentLoaded', () => {
    initProfile();      // Loads real-time profile name and type sync
    initHbA1c();
    initMedications();
    initLabResults();
    updateCartCount();
});

// ====== REAL-TIME PATIENT NAME & TYPE SYNC ======
function initProfile() {
    const nameInput = document.getElementById('name-input');
    const typeSelect = document.getElementById('type-select');
    const btnUpdate = document.getElementById('btn-update-name');
    
    if (!nameInput || !typeSelect) return;

    // Load cached profile data from localStorage (fallback to defaults if empty)
    const savedName = localStorage.getItem('userName') || 'Patient';
    const savedType = localStorage.getItem('diabetesType') || 'Type 2';
    
    // Initialize UI states
    updateDOMProfile(savedName, savedType);
    
    if (savedName !== 'Patient') {
        nameInput.value = savedName;
    }
    typeSelect.value = savedType;

    // Event 1: Sync and save profile name instantly on keypress
    nameInput.addEventListener('input', () => {
        const currentName = nameInput.value.trim() || 'Patient';
        const currentType = typeSelect.value;
        updateDOMProfile(currentName, currentType);
        localStorage.setItem('userName', currentName);
    });

    // Event 2: Sync and save diabetes type instantly on dropdown change
    typeSelect.addEventListener('change', () => {
        const currentName = nameInput.value.trim() || 'Patient';
        const currentType = typeSelect.value;
        updateDOMProfile(currentName, currentType);
        localStorage.setItem('diabetesType', currentType);
    });

    // Manual fallback alert trigger on Save Button click
    btnUpdate.addEventListener('click', () => {
        const finalName = nameInput.value.trim() || 'Patient';
        const finalType = typeSelect.value;
        localStorage.setItem('userName', finalName);
        localStorage.setItem('diabetesType', finalType);
        updateDOMProfile(finalName, finalType);
        alert(`✨ Profile updated successfully: ${finalName} (${finalType})`);
    });
}

// Master layout rendering engine for syncing profile strings across elements
function updateDOMProfile(name, type) {
    const navUser = document.getElementById('nav-username');
    const navType = document.getElementById('nav-diabetestype');
    const dispName = document.getElementById('display-name');
    
    if (navUser) navUser.innerText = name;     // Updates navbar username
    if (navType) navType.innerText = type;     // Updates navbar condition type badge
    if (dispName) dispName.innerText = name;   // Updates main dashboard hero panel greeting text
}

// ====== FEATURE 1: HbA1c TRACKER ======
let hba1cRecords = JSON.parse(localStorage.getItem('hba1cRecords')) || [];

function initHbA1c() {
    const form = document.getElementById('hba1c-form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const value = parseFloat(document.getElementById('hba1c-input').value);
        const date = document.getElementById('hba1c-date').value;
        
        hba1cRecords.unshift({ value, date });
        localStorage.setItem('hba1cRecords', JSON.stringify(hba1cRecords));
        
        renderHbA1c();
        form.reset();
    });
    renderHbA1c();
}

function renderHbA1c() {
    const currentValElement = document.getElementById('current-hba1c');
    const statusElement = document.getElementById('hba1c-status');
    const historyList = document.getElementById('hba1c-history');
    
    if (!currentValElement) return;
    historyList.innerHTML = '';
    
    if (hba1cRecords.length === 0) {
        currentValElement.innerText = "0.0%";
        statusElement.innerText = "No Data";
        statusElement.className = "badge none";
        return;
    }
    
    const latest = hba1cRecords[0];
    currentValElement.innerText = latest.value + "%";
    
    if (latest.value < 6.5) {
        statusElement.innerText = "Stable";
        statusElement.className = "badge safe";
    } else {
        statusElement.innerText = "Warning";
        statusElement.className = "badge danger";
    }
    
    hba1cRecords.forEach(record => {
        const li = document.createElement('li');
        li.innerHTML = `<span>📅 ${record.date}</span> <strong>${record.value}%</strong>`;
        historyList.appendChild(li);
    });
}

// ====== FEATURE 5: MEDICATION LOG MANAGEMENT ======
let medications = JSON.parse(localStorage.getItem('medications')) || [
    { name: 'Metformin 500mg (Breakfast)', checked: true },
    { name: 'Blood Pressure Meds (Lunch)', checked: false },
    { name: 'Metformin 500mg (Dinner)', checked: false }
];

function initMedications() {
    const form = document.getElementById('med-form');
    if(!form) return;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const medInput = document.getElementById('med-input');
        medications.push({ name: medInput.value, checked: false });
        localStorage.setItem('medications', JSON.stringify(medications));
        renderMedications();
        medInput.value = '';
    });
    renderMedications();
}

function renderMedications() {
    const list = document.getElementById('med-list');
    if(!list) return;
    list.innerHTML = '';
    
    medications.forEach((med, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <label class="${med.checked ? 'completed' : ''}">
                <input type="checkbox" ${med.checked ? 'checked' : ''} onchange="toggleMed(${index})">
                ${med.name}
            </label>
            <button class="btn-delete" onclick="deleteMed(${index})">Delete</button>
        `;
        list.appendChild(li);
    });
}

function toggleMed(index) {
    medications[index].checked = !medications[index].checked;
    localStorage.setItem('medications', JSON.stringify(medications));
    renderMedications();
}

// Fixed missing scope variable issues with explicit index matching removals
function deleteMed(index) {
    medications.splice(index, 1);
    localStorage.setItem('medications', JSON.stringify(medications));
    renderMedications();
}

function clearMedicationLogs() {
    medications.forEach(m => m.checked = false);
    localStorage.setItem('medications', JSON.stringify(medications));
    renderMedications();
}

// ====== FEATURE 2: HOSPITAL REPORTS & AI AUTO-BOOKING ======
let labResults = JSON.parse(localStorage.getItem('labResults')) || [
    { name: 'Fasting Blood Sugar', value: 110, unit: 'mg/dL' },
    { name: 'Kidney Function (eGFR)', value: 85, unit: 'mL/min' }
];

function initLabResults() {
    const form = document.getElementById('lab-form');
    if(!form) return;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('lab-name').value;
        const value = document.getElementById('lab-value').value;
        const unit = document.getElementById('lab-unit').value;
        
        labResults.push({ name, value, unit });
        localStorage.setItem('labResults', JSON.stringify(labResults));
        renderLabResults();
        form.reset();
    });
    renderLabResults();
}

function renderLabResults() {
    const tbody = document.getElementById('lab-table-body');
    if(!tbody) return;
    tbody.innerHTML = '';
    
    labResults.forEach((result, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${result.name}</td>
            <td><strong>${result.value}</strong> <small>${result.unit}</small></td>
            <td><button class="btn-delete" onclick="deleteLab(${index})">Remove</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function deleteLab(index) {
    labResults.splice(index, 1);
    localStorage.setItem('labResults', JSON.stringify(labResults));
    renderLabResults();
}

function analyzeSymptoms() {
    const select = document.getElementById('symptom-select');
    const resultBox = document.getElementById('booking-result');
    const symptom = select.value;
    
    if(!symptom) {
        alert("Please select a symptom first!");
        return;
    }
    
    resultBox.style.display = "block";
    
    if (symptom === "vision") {
        resultBox.innerHTML = `
            <h5>⚠️ System Alert: Risk of Diabetic Retinopathy</h5>
            <p><strong>Recommended Dept:</strong> Ophthalmology (Eye Clinic)</p>
            <p style="color: #2a9d8f;"><strong>[AUTO-BOOKED]</strong> Dr. Watson's clinic tomorrow at 10:00 AM.</p>
        `;
    } else if (symptom === "thirst") {
        resultBox.innerHTML = `
            <h5>⚠️ System Alert: High Glycemia State Detected</h5>
            <p><strong>Recommended Dept:</strong> Endocrinology / Internal Medicine</p>
            <p style="color: #2a9d8f;"><strong>[AUTO-BOOKED]</strong> Urgent video consultation scheduled in 2 hours.</p>
        `;
    } else if (symptom === "numbness") {
        resultBox.innerHTML = `
            <h5>⚠️ System Alert: Risk of Diabetic Neuropathy</h5>
            <p><strong>Recommended Dept:</strong> Neurology / Podiatry</p>
            <p style="color: #2a9d8f;"><strong>[AUTO-BOOKED]</strong> General Nerve Screening scheduled for June 10th.</p>
        `;
    }
}

// ====== FEATURE 3: DIET MANAGEMENT & MEAL DELIVERY ======
let cartCount = parseInt(localStorage.getItem('cartCount')) || 0;

function addToCart(itemName) {
    cartCount++;
    localStorage.setItem('cartCount', cartCount);
    updateCartCount();
    alert(`🎉 Successfully added [${itemName}] to your healthy diet cart!`);
}

function updateCartCount() {
    const el = document.getElementById('cart-count');
    if(el) el.innerText = cartCount;
}

// ====== FEATURE 4: PRESCRIPTION REMOTE DELIVERY SERVICE ======
function simulatePrescriptionUpload() {
    const fileInput = document.getElementById('prescription-file');
    const msg = document.getElementById('delivery-msg');
    
    if (!fileInput || fileInput.files.length === 0) return;
    
    msg.innerText = "Prescription uploaded! Scanning data...";
    
    setTimeout(() => {
        document.getElementById('step-1').className = "step active";
        msg.innerText = "Step 1 Clear: Pharmacist verified authenticity.";
    }, 2000);
    
    setTimeout(() => {
        document.getElementById('step-2').className = "step active";
        msg.innerText = "Step 2 Clear: Medicine being safely packaged.";
    }, 4500);
    
    setTimeout(() => {
        document.getElementById('step-3').className = "step active";
        msg.innerText = "🚚 Dispatch Complete! Estimated Arrival: Today via Courier.";
    }, 7000);
}
