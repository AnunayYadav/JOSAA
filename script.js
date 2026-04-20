let allData = [];
let filteredData = [];
let currentPage = 1;
const itemsPerPage = 50;

const MAPPINGS = {
    // Institute Types
    'IIT': 'Indian Institute of Technology (IIT)',
    'NIT': 'National Institute of Technology (NIT)',
    'IIIT': 'Indian Institute of Information Technology (IIIT)',
    'IIEST': 'IIEST Shibpur',
    'GFTI': 'Govt. Funded Technical Institute (GFTI)',
    
    // Quotas
    'AI': 'All India',
    'HS': 'Home State',
    'OS': 'Other State',
    'JK': 'Jammu & Kashmir',
    'LA': 'Ladakh',
    'GO': 'Goa',
    
    // Seat Types / Categories
    'OPEN': 'Open / General',
    'EWS': 'GEN-EWS',
    'OBC-NCL': 'OBC-NCL',
    'SC': 'Scheduled Caste (SC)',
    'ST': 'Scheduled Tribe (ST)',
    'OPEN (PwD)': 'Open (PwD)',
    'EWS (PwD)': 'GEN-EWS (PwD)',
    'OBC-NCL (PwD)': 'OBC-NCL (PwD)',
    'SC (PwD)': 'SC (PwD)',
    'ST (PwD)': 'ST (PwD)'
};

function getDisplayName(val) {
    return MAPPINGS[val] || val;
}

// Elements
const resultsBody = document.getElementById('results-body');
const loadingSpinner = document.getElementById('loading-spinner');
const totalResultsEl = document.getElementById('total-results');
const pageInfo = document.getElementById('page-info');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');

// Filters
const mainSearch = document.getElementById('main-search');
const rankMin = document.getElementById('rank-min');
const rankMax = document.getElementById('rank-max');
const sortBy = document.getElementById('sort-by');
const resetBtn = document.getElementById('reset-filters');
const themeToggle = document.getElementById('theme-toggle');
const googleSearchToggle = document.getElementById('google-search-toggle');

let isGoogleSearchEnabled = false;

// Initialize
async function init() {
    try {
        if (!window.JOSAA_DATA) {
            throw new Error("Data not found. Please run parse_data.py first.");
        }
        
        allData = window.JOSAA_DATA.map(item => ({
            ...item,
            opening_rank_val: parseInt(String(item.opening_rank).replace('P', '')) || 0,
            closing_rank_val: parseInt(String(item.closing_rank).replace('P', '')) || 0
        }));

        setupDropdowns();
        populateFilters();
        applyFilters();
        
        loadingSpinner.style.display = 'none';
        lucide.createIcons();
        setupGoogleSearch();
    } catch (error) {
        console.error("Error loading data:", error);
    }
}

function setupDropdowns() {
    const dropdowns = document.querySelectorAll('.custom-dropdown');
    
    dropdowns.forEach(dropdown => {
        const btn = dropdown.querySelector('.dropdown-btn');
        const content = dropdown.querySelector('.dropdown-content');
        
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.dropdown-content').forEach(c => {
                if(c !== content) c.classList.remove('show');
            });
            content.classList.toggle('show');
        });

        content.addEventListener('click', (e) => e.stopPropagation());
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-content').forEach(c => c.classList.remove('show'));
    });
}

function populateFilters() {
    const quotas = [...new Set(allData.map(item => item.quota))].sort();
    const seats = [...new Set(allData.map(item => item.seat_type))].sort();
    const genders = [...new Set(allData.map(item => item.gender))].sort();
    const programs = [...new Set(allData.map(item => item.program))].sort();

    renderCheckboxOptions('quota-options', quotas, 'dropdown-quota');
    renderCheckboxOptions('seat-options', seats, 'dropdown-seat');
    renderCheckboxOptions('gender-options', genders, 'dropdown-gender');
    renderCheckboxOptions('program-options', programs, 'dropdown-program');

    setupInternalSearch('program-option-search', 'program-options');

    // Handle Type dropdown (hardcoded in HTML)
    const typeContent = document.querySelector('#dropdown-type .dropdown-content');
    const currentTypeHtml = typeContent.innerHTML;
    typeContent.innerHTML = `
        <label class="select-all-label">
            <input type="checkbox" class="select-all" checked> <strong>(Select All)</strong>
        </label>
        <div class="divider"></div>
        ${currentTypeHtml}
    `;
    setupCheckboxHandlers(typeContent, 'dropdown-type');
}

function renderCheckboxOptions(containerId, options, dropdownId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let html = `
        <label class="select-all-label">
            <input type="checkbox" class="select-all" checked> <strong>(Select All)</strong>
        </label>
        <div class="divider"></div>
    `;

    html += options.map(opt => `
        <label>
            <input type="checkbox" value="${opt}" checked> ${getDisplayName(opt)}
        </label>
    `).join('');

    container.innerHTML = html;
    setupCheckboxHandlers(container, dropdownId);
}

function setupCheckboxHandlers(container, dropdownId) {
    const allCb = container.querySelector('.select-all');
    const itemCbs = container.querySelectorAll('input:not(.select-all)');

    if (allCb) {
        allCb.addEventListener('change', () => {
            itemCbs.forEach(cb => cb.checked = allCb.checked);
            updateDropdownButtonText(dropdownId);
            applyFilters();
        });
    }

    itemCbs.forEach(cb => {
        cb.addEventListener('change', () => {
            if (allCb) {
                const allChecked = Array.from(itemCbs).every(i => i.checked);
                allCb.checked = allChecked;
            }
            updateDropdownButtonText(dropdownId);
            applyFilters();
        });
    });
    updateDropdownButtonText(dropdownId);
}

function setupInternalSearch(inputId, containerId) {
    const input = document.getElementById(inputId);
    const container = document.getElementById(containerId);
    
    input.addEventListener('input', () => {
        const term = input.value.toLowerCase();
        const labels = container.querySelectorAll('label');
        
        labels.forEach(label => {
            const text = label.textContent.toLowerCase();
            label.style.display = text.includes(term) ? 'flex' : 'none';
        });
    });
}

function updateDropdownButtonText(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]');
    const checked = Array.from(checkboxes).filter(cb => cb.checked);
    const btnSpan = dropdown.querySelector('.dropdown-btn span');
    
    if (checked.length === checkboxes.length) {
        btnSpan.textContent = `All ${dropdown.previousElementSibling.textContent.trim().split(' ')[0]}s`;
    } else if (checked.length === 0) {
        btnSpan.textContent = "None Selected";
    } else if (checked.length === 1) {
        btnSpan.textContent = getDisplayName(checked[0].value);
    } else {
        btnSpan.textContent = `${checked.length} Selected`;
    }
}

function applyFilters() {
    const searchTerm = mainSearch.value.toLowerCase();
    
    const getCheckedValues = (id) => Array.from(document.querySelectorAll(`#${id} input:checked`)).map(cb => cb.value);
    
    const selectedTypes = getCheckedValues('dropdown-type');
    const selectedQuotas = getCheckedValues('dropdown-quota');
    const selectedSeats = getCheckedValues('dropdown-seat');
    const selectedGenders = getCheckedValues('dropdown-gender');
    const selectedPrograms = getCheckedValues('dropdown-program');
    
    const minR = parseInt(rankMin.value) || 0;
    const maxR = parseInt(rankMax.value) || Infinity;

    filteredData = allData.filter(item => {
        const matchesSearch = !searchTerm || 
            item.institute.toLowerCase().includes(searchTerm) || 
            item.program.toLowerCase().includes(searchTerm);
        
        const matchesType = selectedTypes.includes(item.type);
        const matchesQuota = selectedQuotas.includes(item.quota);
        const matchesSeat = selectedSeats.includes(item.seat_type);
        const matchesGender = selectedGenders.includes(item.gender);
        const matchesProgram = selectedPrograms.includes(item.program);
        const matchesRank = item.closing_rank_val >= minR && item.closing_rank_val <= maxR;

        return matchesSearch && matchesType && matchesQuota && matchesSeat && matchesGender && matchesProgram && matchesRank;
    });

    sortData();
    currentPage = 1;
    renderResults();
}

function sortData() {
    const val = sortBy.value;
    if (val === 'closing_rank_asc') {
        filteredData.sort((a, b) => a.closing_rank_val - b.closing_rank_val);
    } else if (val === 'closing_rank_desc') {
        filteredData.sort((a, b) => b.closing_rank_val - a.closing_rank_val);
    } else if (val === 'institute_asc') {
        filteredData.sort((a, b) => a.institute.localeCompare(b.institute));
    }
}

function renderResults() {
    resultsBody.innerHTML = '';
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = filteredData.slice(start, end);

    totalResultsEl.textContent = filteredData.length.toLocaleString();
    
    if (pageData.length === 0) {
        resultsBody.innerHTML = '<tr><td colspan="8" class="no-results">No matches found for your criteria.</td></tr>';
        updatePagination(0);
        return;
    }

    pageData.forEach(item => {
        const row = document.createElement('tr');
        const isPrepOpening = String(item.opening_rank).includes('P');
        const isPrepClosing = String(item.closing_rank).includes('P');

        row.innerHTML = `
            <td><div class="inst-cell" data-institute="${item.institute}"><span class="badge type-badge ${item.type.toLowerCase()}">${item.type}</span> ${item.institute}</div></td>
            <td>${item.program}</td>
            <td>${getDisplayName(item.type)}</td>
            <td><span class="badge">${getDisplayName(item.quota)}</span></td>
            <td><span class="badge">${getDisplayName(item.seat_type)}</span></td>
            <td><span class="badge">${item.gender}</span></td>
            <td class="${isPrepOpening ? 'prep-cell' : ''}">${item.opening_rank} ${isPrepOpening ? '<small class="prep-tag">(P)</small>' : ''}</td>
            <td class="${isPrepClosing ? 'prep-cell' : ''}">${item.closing_rank} ${isPrepClosing ? '<small class="prep-tag">(P)</small>' : ''}</td>
        `;
        resultsBody.appendChild(row);
    });

    updatePagination(Math.ceil(filteredData.length / itemsPerPage));
}

function setupGoogleSearch() {
    const syncState = () => {
        isGoogleSearchEnabled = googleSearchToggle.checked;
        if (isGoogleSearchEnabled) {
            document.body.classList.add('google-search-active');
        } else {
            document.body.classList.remove('google-search-active');
        }
    };

    googleSearchToggle.addEventListener('change', syncState);
    syncState(); // Initialize state


    resultsBody.addEventListener('click', (e) => {
        if (!isGoogleSearchEnabled) return;
        
        const instCell = e.target.closest('.inst-cell');
        if (instCell) {
            const instituteName = instCell.getAttribute('data-institute');
            window.open(`https://www.google.com/search?q=${encodeURIComponent(instituteName)}`, '_blank');
        }
    });
}

function updatePagination(totalPages) {
    pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
}

// Event Listeners
mainSearch.addEventListener('input', applyFilters);
rankMin.addEventListener('input', applyFilters);
rankMax.addEventListener('input', applyFilters);
sortBy.addEventListener('change', () => {
    sortData();
    renderResults();
});

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderResults();
    }
});

nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderResults();
    }
});

resetBtn.addEventListener('click', () => {
    mainSearch.value = '';
    rankMin.value = '';
    rankMax.value = '';
    document.querySelectorAll('.custom-dropdown input').forEach(cb => cb.checked = true);
    document.querySelectorAll('.dropdown-search input').forEach(input => input.value = '');
    document.querySelectorAll('.options-list label').forEach(label => label.style.display = 'flex');
    ['dropdown-type', 'dropdown-quota', 'dropdown-seat', 'dropdown-gender', 'dropdown-program'].forEach(id => updateDropdownButtonText(id));
    applyFilters();
});

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    themeToggle.innerHTML = document.body.classList.contains('light-theme') ? 
        '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
    lucide.createIcons();
});

// Start app
init();
