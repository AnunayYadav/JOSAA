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
    'SPA': 'School of Planning and Architecture (SPA)',
    'JAC': 'JAC Chandigarh',
    'JACD': 'JAC Delhi',
    'UPTAC': 'UPTAC Institutes',
    'GGSIPU': 'GGSIPU Affiliated',
    
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
    'ST (PwD)': 'ST (PwD)',
    'SPA': 'School of Planning and Architecture (SPA)',

    // GGSIPU Categories
    'OPNOHS': 'Open General (Delhi - HS)',
    'OPNOOS': 'Open General (Outside Delhi - OS)',
    'BCNOHS': 'OBC (Delhi - HS)',
    'EWNOHS': 'EWS (Delhi - HS)',
    'EWNOOS': 'EWS (Outside Delhi - OS)',
    'SCNOHS': 'SC (Delhi - HS)',
    'SCNOOS': 'SC (Outside Delhi - OS)',
    'STNOHS': 'ST (Delhi - HS)',
    'STNOOS': 'ST (Outside Delhi - OS)',
    'BCDFHS': 'OBC Defence (Delhi - HS)',
    'BCPHHS': 'OBC PwD (Delhi - HS)',
    'OPDFHS': 'General Defence (Delhi - HS)',
    'OPPHHS': 'General PwD (Delhi - HS)',
    'SCDFHS': 'SC Defence (Delhi - HS)',
    'OPDFOS': 'General Defence (Outside Delhi - OS)',
    'OPPHOS': 'General PwD (Outside Delhi - OS)',
    'SCDFOS': 'SC Defence (Outside Delhi - OS)',
    'STDFOS': 'ST Defence (Outside Delhi - OS)',
    'NOJNAI': 'J&K Migrant (All India - AI)',
    'NOKMAI': 'Kashmiri Migrant (All India - AI)',
    'NOSMAI': 'Sikh Minority (All India - AI)',

    // JAC Delhi Categories
    'GNGND': 'General (Delhi - HS)',
    'GNGNO': 'General (Outside Delhi - OS)',
    'GNGLD': 'General Female (Delhi - HS)',
    'GNGLO': 'General Female (Outside Delhi - OS)',
    'EWGND': 'EWS (Delhi - HS)',
    'EWGNO': 'EWS (Outside Delhi - OS)',
    'EWGLD': 'EWS Female (Delhi - HS)',
    'EWGLO': 'EWS Female (Outside Delhi - OS)',
    'OBGND': 'OBC (Delhi - HS)',
    'OBGNO': 'OBC (Outside Delhi - OS)',
    'OBGLD': 'OBC Female (Delhi - HS)',
    'OBGLO': 'OBC Female (Outside Delhi - OS)',
    'SCGND': 'SC (Delhi - HS)',
    'SCGNO': 'SC (Outside Delhi - OS)',
    'SCGLD': 'SC Female (Delhi - HS)',
    'SCGLO': 'SC Female (Outside Delhi - OS)',
    'STGND': 'ST (Delhi - HS)',
    'STGNO': 'ST (Outside Delhi - OS)',
    'STGLD': 'ST Female (Delhi - HS)',
    'STGLO': 'ST Female (Outside Delhi - OS)',
    'GNSGD': 'Single Girl Child (Delhi - HS)',
    'SG': 'Single Girl Child',
    'KM': 'Kashmiri Migrant',
    'GNCWD': 'General Defence (Delhi - HS)',
    'GNCWO': 'General Defence (Outside Delhi - OS)',
    'EWCWD': 'EWS Defence (Delhi - HS)',
    'EWCWO': 'EWS Defence (Outside Delhi - OS)',
    'OBCWD': 'OBC Defence (Delhi - HS)',
    'OBCWO': 'OBC Defence (Outside Delhi - OS)',
    'SCCWD': 'SC Defence (Delhi - HS)',
    'SCCWO': 'SC Defence (Outside Delhi - OS)',
    'STCWD': 'ST Defence (Delhi - HS)',
    'STCWO': 'ST Defence (Outside Delhi - OS)',
    'GNPDD': 'General PwD (Delhi - HS)',
    'GNPDO': 'General PwD (Outside Delhi - OS)',
    'EWPDD': 'EWS PwD (Delhi - HS)',
    'EWPDO': 'EWS PwD (Outside Delhi - OS)',
    'OBPDD': 'OBC PwD (Delhi - HS)',
    'OBPDO': 'OBC PwD (Outside Delhi - OS)',
    'SCPDD': 'SC PwD (Delhi - HS)',
    'SCPDO': 'SC PwD (Outside Delhi - OS)',
    'STPDD': 'ST PwD (Delhi - HS)',
    'STPDO': 'ST PwD (Outside Delhi - OS)'
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
let currentMode = 'JOSAA'; // 'JOSAA' or 'CSAB'


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

        setupModeSwitching();
        setupDropdowns();
        setupInternalSearch('program-option-search', 'program-options');
        setupInternalSearch('institute-option-search', 'institute-options');
        populateAllFilters();
        applyFilters();
        
        loadingSpinner.style.display = 'none';
        lucide.createIcons();
        setupGoogleSearch();
    } catch (error) {
        console.error("Error loading data:", error);
    }
}

function setupModeSwitching() {
    const navJosaa = document.getElementById('nav-josaa');
    const navCsab = document.getElementById('nav-csab');
    const navJac = document.getElementById('nav-jac');
    const navJacDelhi = document.getElementById('nav-jac-delhi');
    const navCounsellingGroup = document.getElementById('nav-counselling-group');
    const navPredictor = document.getElementById('nav-predictor');
    const navUptac = document.getElementById('nav-uptac');
    const navGgsipu = document.getElementById('nav-ggsipu');
    const modeText = document.getElementById('mode-text');
    const heroDesc = document.getElementById('hero-desc');

    const switchMode = (mode) => {
        currentMode = mode;
        navJosaa.classList.toggle('active', mode === 'JOSAA');
        navCsab.classList.toggle('active', mode === 'CSAB');
        if (navJac) navJac.classList.toggle('active', mode === 'JAC');
        if (navJacDelhi) navJacDelhi.classList.toggle('active', mode === 'JAC_DELHI');
        if (navPredictor) navPredictor.classList.toggle('active', mode === 'PREDICTOR');
        if (navCounsellingGroup) {
            navCounsellingGroup.classList.toggle('active', mode !== 'PREDICTOR');
            const span = navCounsellingGroup.querySelector('span');
            if (span) {
                if (mode === 'PREDICTOR') {
                    span.textContent = "Counselling";
                } else {
                    let label = "Counselling";
                    if (mode === 'JOSAA') label = "JoSAA";
                    else if (mode === 'CSAB') label = "CSAB";
                    else if (mode === 'JAC') label = "JAC Chandigarh";
                    else if (mode === 'JAC_DELHI') label = "JAC Delhi";
                    else if (mode === 'UPTAC') label = "UPTAC";
                    else if (mode === 'GGSIPU') label = "GGSIPU";
                    span.textContent = label;
                }
            }
        }
        if (navUptac) navUptac.classList.toggle('active', mode === 'UPTAC');
        if (navGgsipu) navGgsipu.classList.toggle('active', mode === 'GGSIPU');

        // Close dropdown menu after choosing a mode on mobile
        const dropdownMenu = document.querySelector('.nav-dropdown-menu');
        if (dropdownMenu) {
            dropdownMenu.classList.remove('show');
        }
        const counsellingIcon = document.querySelector('#nav-counselling-group i');
        if (counsellingIcon) {
            counsellingIcon.style.transform = 'rotate(0deg)';
        }

        const csabNote = document.getElementById('csab-info-note');
        const infoNoteText = document.getElementById('info-note-text');
        const explorerSection = document.querySelector('.explorer-section');
        const heroSection = document.querySelector('.hero');
        const predictorSection = document.getElementById('predictor-section');

        if (mode === 'PREDICTOR') {
            if (explorerSection) explorerSection.classList.add('hidden');
            if (heroSection) heroSection.classList.add('hidden');
            if (infoNoteText) infoNoteText.closest('.info-note').classList.add('hidden');
            if (predictorSection) predictorSection.classList.remove('hidden');
            initPredictorModule();
        } else {
            if (explorerSection) explorerSection.classList.remove('hidden');
            if (heroSection) heroSection.classList.remove('hidden');
            if (infoNoteText) infoNoteText.closest('.info-note').classList.remove('hidden');
            if (predictorSection) predictorSection.classList.add('hidden');
        }

        if (mode === 'JOSAA') {
            modeText.textContent = "JoSAA Explorer";
            heroDesc.textContent = "Comprehensive JoSAA 2025 Data Explorer. Round opening and closing ranks at your fingertips.";
            if (csabNote) csabNote.classList.add('hidden');
            if (infoNoteText) {
                infoNoteText.innerHTML = "<strong>Note:</strong> Ranks ending with <strong>'P'</strong> belong to the Preparatory Rank List. Ranks are JEE Main/JEE Advanced CRL ranks.";
            }
        } else if (mode === 'CSAB') {
            modeText.textContent = "CSAB Explorer";
            heroDesc.textContent = "Comprehensive CSAB 2025 Special Round Data Explorer. Allocation details for NITs, IIITs and GFTIs.";
            if (csabNote) csabNote.classList.remove('hidden');
            if (infoNoteText) {
                infoNoteText.innerHTML = "<strong>Note:</strong> All ranks are JEE Main All India CRL Ranks. Cutoffs represent Special Round vacancy allocations.";
            }
        } else if (mode === 'JAC') {
            modeText.textContent = "JAC Chandigarh Explorer";
            heroDesc.textContent = "Comprehensive JAC Chandigarh 2025 Data Explorer. Opening and closing ranks for UIET, UICET, CCET, and CCA.";
            if (csabNote) csabNote.classList.add('hidden');
            if (infoNoteText) {
                infoNoteText.innerHTML = "<strong>Note:</strong> Ranks are JEE Main All India CRL Ranks. Allotments are under Joint Admission Committee (JAC) Chandigarh.";
            }
        } else if (mode === 'JAC_DELHI') {
            modeText.textContent = "JAC Delhi Explorer";
            heroDesc.textContent = "Comprehensive JAC Delhi 2025 Data Explorer. Opening and closing ranks for DTU, NSUT, IIITD, and IGDTUW.";
            if (csabNote) csabNote.classList.add('hidden');
            if (infoNoteText) {
                infoNoteText.innerHTML = "<strong>Note:</strong> Ranks are JEE Main All India CRL Ranks for DTU, NSUT, and IGDTUW. For IIITD, Rounds 1, 2, and 5 list JEE CRL Ranks, while Rounds 3 and 4 list local IIITD Merit Ranks.";
            }
        } else if (mode === 'UPTAC') {
            modeText.textContent = "UPTAC Explorer";
            heroDesc.textContent = "Comprehensive UPTAC 2025 Counselling Data Explorer. Opening and closing ranks for technical institutes in Uttar Pradesh.";
            if (csabNote) csabNote.classList.add('hidden');
            if (infoNoteText) {
                infoNoteText.innerHTML = "<strong>Note:</strong> Ranks are JEE Main All India CRL Ranks for B.Tech admissions across technical institutions in Uttar Pradesh.";
            }
        } else if (mode === 'GGSIPU') {
            modeText.textContent = "GGSIPU Explorer";
            heroDesc.textContent = "Comprehensive GGSIPU 2025 Counselling Data Explorer. Round 1 opening and closing ranks for affiliated engineering colleges.";
            if (csabNote) csabNote.classList.add('hidden');
            if (infoNoteText) {
                infoNoteText.innerHTML = "<strong>Note:</strong> Ranks are JEE Main All India CRL Ranks for B.Tech admissions across IP University affiliated engineering colleges.";
            }
        }

        // Reset search and rank filter inputs when switching modes to avoid stale criteria
        mainSearch.value = '';
        rankMin.value = '';
        rankMax.value = '';
        const programSearch = document.getElementById('program-option-search');
        if (programSearch) {
            programSearch.value = '';
        }
        const instituteSearch = document.getElementById('institute-option-search');
        if (instituteSearch) {
            instituteSearch.value = '';
        }

        populateAllFilters();
        applyFilters();
    };

    navJosaa.addEventListener('click', () => switchMode('JOSAA'));
    navCsab.addEventListener('click', () => switchMode('CSAB'));
    if (navJac) navJac.addEventListener('click', () => switchMode('JAC'));
    if (navJacDelhi) navJacDelhi.addEventListener('click', () => switchMode('JAC_DELHI'));
    if (navPredictor) navPredictor.addEventListener('click', () => switchMode('PREDICTOR'));
    if (navUptac) navUptac.addEventListener('click', () => switchMode('UPTAC'));
    if (navGgsipu) navGgsipu.addEventListener('click', () => switchMode('GGSIPU'));

    // Toggle dropdown on mobile click
    if (navCounsellingGroup) {
        navCounsellingGroup.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                e.stopPropagation();
                const dropdownMenu = navCounsellingGroup.nextElementSibling;
                if (dropdownMenu) {
                    dropdownMenu.classList.toggle('show');
                    const icon = navCounsellingGroup.querySelector('i');
                    if (icon) {
                        const isExpanded = dropdownMenu.classList.contains('show');
                        icon.style.transform = isExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
                    }
                }
            }
        });
    }

    // Close dropdown menu when clicking outside
    document.addEventListener('click', (e) => {
        const dropdownMenu = document.querySelector('.nav-dropdown-menu');
        if (dropdownMenu && dropdownMenu.classList.contains('show')) {
            if (!navCounsellingGroup.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('show');
                const counsellingIcon = document.querySelector('#nav-counselling-group i');
                if (counsellingIcon) {
                    counsellingIcon.style.transform = 'rotate(0deg)';
                }
            }
        }
    });
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

function toggleFilterVisibility(dropdownId, options) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;
    const filterGroup = dropdown.closest('.filter-group');
    if (!filterGroup) return;
    
    if (options.length <= 1) {
        filterGroup.style.display = 'none';
    } else {
        filterGroup.style.display = 'flex';
    }
}

function populateAllFilters() {
    const modeData = allData.filter(item => item.source === currentMode);
    
    const types = [...new Set(modeData.map(item => item.type))].sort();
    const rounds = [...new Set(modeData.map(item => item.round))].sort((a, b) => {
        const aNum = parseInt(a);
        const bNum = parseInt(b);
        const aIsNum = !isNaN(aNum) && /^\d+$/.test(a);
        const bIsNum = !isNaN(bNum) && /^\d+$/.test(b);
        if (aIsNum && bIsNum) return aNum - bNum;
        if (aIsNum) return -1;
        if (bIsNum) return 1;
        return a.localeCompare(b);
    });
    const quotas = [...new Set(modeData.map(item => item.quota))].sort();
    const seats = [...new Set(modeData.map(item => item.seat_type))].sort();
    const genders = [...new Set(modeData.map(item => item.gender))].sort();
    const programs = [...new Set(modeData.map(item => item.program))].sort();
    const institutes = [...new Set(modeData.map(item => item.institute))].sort();

    renderCheckboxOptions('type-options', types, 'dropdown-type');
    toggleFilterVisibility('dropdown-type', types);

    renderCheckboxOptions('round-options', rounds, 'dropdown-round', (val) => {
        if (val.startsWith('SPOT') || isNaN(parseInt(val))) return val;
        return `Round ${val}`;
    });
    toggleFilterVisibility('dropdown-round', rounds);

    renderCheckboxOptions('quota-options', quotas, 'dropdown-quota');
    toggleFilterVisibility('dropdown-quota', quotas);

    renderCheckboxOptions('seat-options', seats, 'dropdown-seat');
    toggleFilterVisibility('dropdown-seat', seats);

    renderCheckboxOptions('gender-options', genders, 'dropdown-gender');
    toggleFilterVisibility('dropdown-gender', genders);

    renderCheckboxOptions('program-options', programs, 'dropdown-program');
    toggleFilterVisibility('dropdown-program', programs);

    renderCheckboxOptions('institute-options', institutes, 'dropdown-institute');
    toggleFilterVisibility('dropdown-institute', institutes);
}





function renderCheckboxOptions(containerId, options, dropdownId, displayNameFn = getDisplayName) {
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
            <input type="checkbox" value="${opt}" checked> ${displayNameFn(opt)}
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

            if (dropdownId === 'dropdown-round') {
                // Removed tab sync logic
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
        // Skip the 'select-all' label and only filter specific program labels
        const labels = container.querySelectorAll('label:not(.select-all-label)');
        
        labels.forEach(label => {
            const text = label.textContent.toLowerCase();
            label.style.display = text.includes(term) ? 'flex' : 'none';
        });
    });
}

const dropdownDisplayNames = {
    'dropdown-round': 'Rounds',
    'dropdown-type': 'Types',
    'dropdown-program': 'Programs',
    'dropdown-quota': 'Quotas',
    'dropdown-seat': 'Categories',
    'dropdown-gender': 'Genders',
    'dropdown-institute': 'Institutes'
};

function updateDropdownButtonText(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]');
    const checked = Array.from(checkboxes).filter(cb => cb.checked);
    const btnSpan = dropdown.querySelector('.dropdown-btn span');
    
    if (checked.length === checkboxes.length) {
        const label = dropdownDisplayNames[dropdownId] || 'Items';
        btnSpan.textContent = `All ${label}`;
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
    
    const getCheckedValues = (id) => {
        const dropdown = document.getElementById(id);
        if (!dropdown) return [];
        return Array.from(dropdown.querySelectorAll('input:not(.select-all):checked')).map(cb => cb.value);
    };
    
    const selectedRounds = getCheckedValues('dropdown-round');
    const selectedTypes = getCheckedValues('dropdown-type');
    const selectedQuotas = getCheckedValues('dropdown-quota');
    const selectedSeats = getCheckedValues('dropdown-seat');
    const selectedGenders = getCheckedValues('dropdown-gender');
    const selectedPrograms = getCheckedValues('dropdown-program');
    const selectedInstitutes = getCheckedValues('dropdown-institute');
    
    const minR = parseInt(rankMin.value) || 0;
    const maxR = parseInt(rankMax.value) || Infinity;

    filteredData = allData.filter(item => {
        // Filter by Mode (Source)
        if (item.source !== currentMode) return false;

        const matchesSearch = !searchTerm || 
            item.institute.toLowerCase().includes(searchTerm) || 
            item.program.toLowerCase().includes(searchTerm);
        
        const matchesRound = selectedRounds.includes(item.round);
        const matchesType = selectedTypes.includes(item.type);
        const matchesQuota = selectedQuotas.includes(item.quota);
        const matchesSeat = selectedSeats.includes(item.seat_type);
        const matchesGender = selectedGenders.includes(item.gender);
        const matchesProgram = selectedPrograms.includes(item.program);
        const matchesInstitute = selectedInstitutes.includes(item.institute);
        const matchesRank = item.closing_rank_val >= minR && item.closing_rank_val <= maxR;

        return matchesSearch && matchesRound && matchesType && matchesQuota && matchesSeat && matchesGender && matchesProgram && matchesInstitute && matchesRank;
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
            <td><span class="badge round-badge">${item.round}</span></td>
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
    ['dropdown-round', 'dropdown-type', 'dropdown-quota', 'dropdown-seat', 'dropdown-gender', 'dropdown-program', 'dropdown-institute'].forEach(id => updateDropdownButtonText(id));


    applyFilters();
});

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    themeToggle.innerHTML = document.body.classList.contains('light-theme') ? 
        '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
    lucide.createIcons();
});

// About Modal Event Listeners
const aboutModal = document.getElementById('about-modal');
const navAbout = document.getElementById('nav-about');
const closeModal = document.getElementById('close-modal');

if (navAbout && aboutModal) {
    navAbout.addEventListener('click', () => {
        aboutModal.classList.remove('hidden');
        lucide.createIcons();
    });
}

if (closeModal && aboutModal) {
    closeModal.addEventListener('click', () => {
        aboutModal.classList.add('hidden');
    });
}

if (aboutModal) {
    aboutModal.addEventListener('click', (e) => {
        if (e.target === aboutModal) {
            aboutModal.classList.add('hidden');
        }
    });
}

// ==========================================
// BEST SEAT PREDICTOR MODULE
// ==========================================
let predictorResults = {
    reach: [],
    match: [],
    safe: []
};
let currentPredictorTab = 'match';
let predictorVisibleLimit = 40;
let isPredictorInitialized = false;

function initPredictorModule() {
    if (isPredictorInitialized) return;
    
    const categorySelect = document.getElementById('pred-category');
    const categoryRankGroup = document.getElementById('category-rank-group');
    const categoryRankInput = document.getElementById('pred-cat-rank');
    const form = document.getElementById('predictor-form');
    
    if (categorySelect && categoryRankGroup && categoryRankInput) {
        categorySelect.addEventListener('change', () => {
            const val = categorySelect.value;
            if (val === 'OPEN') {
                categoryRankGroup.style.display = 'none';
                categoryRankInput.removeAttribute('required');
                categoryRankInput.value = '';
            } else {
                categoryRankGroup.style.display = 'block';
                categoryRankInput.setAttribute('required', 'required');
            }
        });
    }
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            runPredictor();
        });
    }
    
    const tabReach = document.getElementById('tab-reach-btn');
    const tabMatch = document.getElementById('tab-match-btn');
    const tabSafe = document.getElementById('tab-safe-btn');
    
    if (tabReach) {
        tabReach.addEventListener('click', () => switchPredictorTab('reach'));
    }
    if (tabMatch) {
        tabMatch.addEventListener('click', () => switchPredictorTab('match'));
    }
    if (tabSafe) {
        tabSafe.addEventListener('click', () => switchPredictorTab('safe'));
    }
    
    const searchInput = document.getElementById('pred-card-search');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            predictorVisibleLimit = 40;
            renderPredictorCards();
        });
    }
    
    isPredictorInitialized = true;
}

function runPredictor() {
    const crlInput = document.getElementById('pred-crl-rank');
    const categorySelect = document.getElementById('pred-category');
    const categoryRankInput = document.getElementById('pred-cat-rank');
    const genderSelect = document.getElementById('pred-gender');
    const stateSelect = document.getElementById('pred-state');
    
    if (!crlInput || !categorySelect || !genderSelect || !stateSelect) return;
    
    const userCrl = parseInt(crlInput.value) || 0;
    const userCategory = categorySelect.value;
    const userCatRank = parseInt(categoryRankInput.value) || 0;
    const userGender = genderSelect.value;
    const userState = stateSelect.value;
    
    if (userCrl <= 0) {
        alert("Please enter a valid CRL Rank.");
        return;
    }
    
    if (userCategory !== 'OPEN' && userCatRank <= 0) {
        alert("Please enter your Category Rank.");
        return;
    }
    
    // Retrieve special categories checked status
    const specials = {
        pwd: document.getElementById('pred-special-pwd')?.checked || false,
        defence: document.getElementById('pred-special-cw')?.checked || false,
        km: document.getElementById('pred-special-km')?.checked || false,
        sg: document.getElementById('pred-special-sg')?.checked || false,
        tfw: document.getElementById('pred-special-tfw')?.checked || false,
        other: document.getElementById('pred-special-other')?.checked || false
    };
    
    // Reset lists
    predictorResults = {
        reach: [],
        match: [],
        safe: []
    };
    predictorVisibleLimit = 40;
    
    const searchInput = document.getElementById('pred-card-search');
    if (searchInput) searchInput.value = '';
    
    // Run filtering
    for (let i = 0; i < allData.length; i++) {
        const item = allData[i];
        const closingRank = item.closing_rank_val;
        if (closingRank <= 0) continue;
        
        // 0. Special category filter
        const specType = getSpecialCategoryType(item);
        if (specType !== null && !specials[specType]) continue;
        
        // 1. Gender filter
        if (!isGenderEligible(userGender, item)) continue;
        
        // 2. Quota filter
        if (!isQuotaEligible(userState, item)) continue;
        
        // 3. Category and Rank filter
        const userRankToUse = getEligibleUserRank(userCategory, userCrl, userCatRank, item);
        if (userRankToUse === null || userRankToUse <= 0) continue;
        
        // 4. Probability margins
        if (closingRank >= 0.85 * userRankToUse && closingRank < userRankToUse) {
            predictorResults.reach.push({ item, userRankToUse, closingRank });
        } else if (closingRank >= userRankToUse && closingRank <= 1.20 * userRankToUse) {
            predictorResults.match.push({ item, userRankToUse, closingRank });
        } else if (closingRank > 1.20 * userRankToUse) {
            predictorResults.safe.push({ item, userRankToUse, closingRank });
        }
    }
    
    // Sort ascending
    predictorResults.reach.sort((a, b) => a.closingRank - b.closingRank);
    predictorResults.match.sort((a, b) => a.closingRank - b.closingRank);
    predictorResults.safe.sort((a, b) => a.closingRank - b.closingRank);
    
    // Update counts
    const countReachEl = document.getElementById('count-reach');
    const countMatchEl = document.getElementById('count-match');
    const countSafeEl = document.getElementById('count-safe');
    
    if (countReachEl) countReachEl.textContent = predictorResults.reach.length.toLocaleString();
    if (countMatchEl) countMatchEl.textContent = predictorResults.match.length.toLocaleString();
    if (countSafeEl) countSafeEl.textContent = predictorResults.safe.length.toLocaleString();
    
    // Render College Breakdown
    renderCollegeBreakdown();
    
    // Toggle UI panels
    const placeholder = document.getElementById('pred-placeholder');
    const content = document.getElementById('pred-content');
    
    if (placeholder) placeholder.style.display = 'none';
    if (content) content.style.display = 'block';
    
    // Switch to match tab by default
    switchPredictorTab('match');
}

function switchPredictorTab(tabName) {
    currentPredictorTab = tabName;
    predictorVisibleLimit = 40;
    
    const tabReach = document.getElementById('tab-reach-btn');
    const tabMatch = document.getElementById('tab-match-btn');
    const tabSafe = document.getElementById('tab-safe-btn');
    
    if (tabReach) tabReach.classList.toggle('active', tabName === 'reach');
    if (tabMatch) tabMatch.classList.toggle('active', tabName === 'match');
    if (tabSafe) tabSafe.classList.toggle('active', tabName === 'safe');
    
    const titleEl = document.getElementById('current-tab-title');
    const descEl = document.getElementById('current-tab-desc');
    
    if (titleEl && descEl) {
        if (tabName === 'reach') {
            titleEl.textContent = "Ambitious (Reach) Options";
            descEl.textContent = "Colleges where the previous cutoff was slightly higher than your rank (up to 15% lower).";
        } else if (tabName === 'match') {
            titleEl.textContent = "Best Match Options";
            descEl.textContent = "Perfect fits. Cutoffs are close to or slightly lower than your rank (user rank is 0-20% better than cutoff).";
        } else if (tabName === 'safe') {
            titleEl.textContent = "Safe Backup Options";
            descEl.textContent = "Secure choices. Your rank is significantly better than the previous cutoff (by more than 20%).";
        }
    }
    
    renderPredictorCards();
}

function renderPredictorCards() {
    const listContainer = document.getElementById('pred-cards-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    let list = predictorResults[currentPredictorTab] || [];
    
    // Apply search filter
    const searchInput = document.getElementById('pred-card-search');
    const term = searchInput ? searchInput.value.toLowerCase().trim() : '';
    if (term) {
        list = list.filter(({ item }) => {
            const inst = (item.institute || '').toLowerCase();
            const prog = (item.program || '').toLowerCase();
            const src = (item.source || '').toLowerCase();
            const type = (item.type || '').toLowerCase();
            const state = getInstituteState(item.institute).toLowerCase();
            
            const srcDisplay = getDisplayName(item.source).toLowerCase();
            const typeDisplay = getDisplayName(item.type).toLowerCase();
            
            const badgeText = (item.type === 'JAC' ? 'JAC-C' : (item.type === 'JACD' ? 'JAC-D' : item.type)).toLowerCase();
            const badgeTextSpace = badgeText.replace('-', ' ');
            
            return inst.includes(term) || 
                   prog.includes(term) || 
                   src.includes(term) || 
                   srcDisplay.includes(term) || 
                   type.includes(term) || 
                   typeDisplay.includes(term) || 
                   state.includes(term) ||
                   badgeText.includes(term) ||
                   badgeTextSpace.includes(term);
        });
    }
    
    if (list.length === 0) {
        listContainer.innerHTML = `<div class="no-results-card" style="grid-column: 1 / -1; text-align: center; padding: 5rem 2rem; color: var(--text-secondary); background: var(--surface-color); border: 1px dashed var(--border-color); border-radius: 16px;">No options found in this category matching your rank.</div>`;
        const existingLoadMore = document.getElementById('pred-load-more-btn-container');
        if (existingLoadMore) existingLoadMore.remove();
        return;
    }
    
    const visibleItems = list.slice(0, predictorVisibleLimit);
    
    visibleItems.forEach(({ item, userRankToUse, closingRank }) => {
        const card = document.createElement('div');
        card.className = `pred-card ${currentPredictorTab}-border`;
        
        let probClass = 'match-prob';
        let probLabel = 'Best Match';
        if (currentPredictorTab === 'reach') {
            probClass = 'reach-prob';
            probLabel = 'Ambitious';
        } else if (currentPredictorTab === 'safe') {
            probClass = 'safe-prob';
            probLabel = 'Very Safe';
        }
        
        const diff = closingRank - userRankToUse;
        const marginPct = (diff / userRankToUse) * 100;
        const marginSign = diff >= 0 ? '+' : '';
        const marginText = `${marginSign}${marginPct.toFixed(1)}% margin`;
        const isPrep = String(item.closing_rank).includes('P');
        
        const badgeText = item.type === 'JAC' ? 'JAC-C' : (item.type === 'JACD' ? 'JAC-D' : item.type);
        
        const counsellingDisplayNames = {
            'JOSAA': 'JoSAA',
            'CSAB': 'CSAB',
            'JAC': 'JAC Chandigarh',
            'JAC_DELHI': 'JAC Delhi',
            'UPTAC': 'UPTAC',
            'GGSIPU': 'GGSIPU'
        };
        const counsellingName = counsellingDisplayNames[item.source] || item.source;
        
        card.innerHTML = `
            <div class="pred-card-header">
                <span class="badge type-badge ${item.type.toLowerCase()}">${badgeText}</span>
                <span class="pred-card-prob ${probClass}">${probLabel} (${marginText})</span>
            </div>
            <div class="pred-card-body">
                <div class="pred-card-inst">${item.institute}</div>
                <div class="pred-card-program">${item.program}</div>
            </div>
            <div class="pred-card-footer">
                <div class="pred-card-meta">
                    <span class="label">Quota / Seat</span>
                    <span class="val">${item.quota} / ${getDisplayName(item.seat_type)}</span>
                </div>
                <div class="pred-card-meta rank-info">
                    <span class="label">Closing Rank</span>
                    <span class="val ${isPrep ? 'prep-cell' : ''}">${closingRank.toLocaleString()}${isPrep ? ' (P)' : ''}</span>
                </div>
                <div class="pred-card-meta">
                    <span class="label">Counselling / Round</span>
                    <span class="val">${counsellingName} (${item.round})</span>
                </div>
                <div class="pred-card-meta rank-info">
                    <span class="label">Gender Pool</span>
                    <span class="val">${item.gender}</span>
                </div>
            </div>
        `;
        listContainer.appendChild(card);
    });
    
    // Load More Button
    const wrapper = listContainer.closest('.pred-list-wrapper');
    let existingLoadMore = document.getElementById('pred-load-more-btn-container');
    if (existingLoadMore) existingLoadMore.remove();
    
    if (list.length > predictorVisibleLimit && wrapper) {
        const loadMoreContainer = document.createElement('div');
        loadMoreContainer.id = 'pred-load-more-btn-container';
        loadMoreContainer.style.cssText = 'display: flex; justify-content: center; margin-top: 2rem; width: 100%;';
        
        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.className = 'btn-secondary';
        loadMoreBtn.style.marginTop = '0';
        loadMoreBtn.textContent = `Load More (${(list.length - predictorVisibleLimit).toLocaleString()} left)`;
        
        loadMoreBtn.addEventListener('click', () => {
            predictorVisibleLimit += 40;
            renderPredictorCards();
        });
        
        loadMoreContainer.appendChild(loadMoreBtn);
        wrapper.appendChild(loadMoreContainer);
    }
}

function renderCollegeBreakdown() {
    const container = document.getElementById('pred-college-breakdown');
    if (!container) return;
    
    const allEligibleSeats = [
        ...predictorResults.reach,
        ...predictorResults.match,
        ...predictorResults.safe
    ];
    
    const iitColleges = new Set();
    const nitColleges = new Set();
    const iiitColleges = new Set();
    const gftiColleges = new Set();
    const jacDelhiColleges = new Set();
    const jacChandigarhColleges = new Set();
    const uptacColleges = new Set();
    const ipuColleges = new Set();
    
    allEligibleSeats.forEach(res => {
        const item = res.item;
        const instName = item.institute;
        const src = item.source;
        const type = item.type;
        
        if (src === 'JOSAA' || src === 'CSAB') {
            if (type === 'IIT') {
                iitColleges.add(instName);
            } else if (type === 'NIT' || type === 'IIEST') {
                nitColleges.add(instName);
            } else if (type === 'IIIT') {
                iiitColleges.add(instName);
            } else if (type === 'GFTI' || type === 'SPA') {
                gftiColleges.add(instName);
            }
        } else if (src === 'JAC_DELHI') {
            jacDelhiColleges.add(instName);
        } else if (src === 'JAC') {
            jacChandigarhColleges.add(instName);
        } else if (src === 'UPTAC') {
            uptacColleges.add(instName);
        } else if (src === 'GGSIPU') {
            ipuColleges.add(instName);
        }
    });
    
    const totalColleges = new Set([
        ...iitColleges,
        ...nitColleges,
        ...iiitColleges,
        ...gftiColleges,
        ...jacDelhiColleges,
        ...jacChandigarhColleges,
        ...uptacColleges,
        ...ipuColleges
    ]);
    
    if (totalColleges.size === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'grid';
    
    let html = `
        <div class="pred-breakdown-item">
            <span class="count">${totalColleges.size}</span>
            <span class="label">Total Colleges</span>
        </div>
    `;
    
    if (iitColleges.size > 0) {
        html += `
            <div class="pred-breakdown-item">
                <span class="count">${iitColleges.size}</span>
                <span class="label">IITs</span>
            </div>
        `;
    }
    if (nitColleges.size > 0) {
        html += `
            <div class="pred-breakdown-item">
                <span class="count">${nitColleges.size}</span>
                <span class="label">NITs</span>
            </div>
        `;
    }
    if (iiitColleges.size > 0) {
        html += `
            <div class="pred-breakdown-item">
                <span class="count">${iiitColleges.size}</span>
                <span class="label">IIITs</span>
            </div>
        `;
    }
    if (gftiColleges.size > 0) {
        html += `
            <div class="pred-breakdown-item">
                <span class="count">${gftiColleges.size}</span>
                <span class="label">GFTIs</span>
            </div>
        `;
    }
    if (jacDelhiColleges.size > 0) {
        html += `
            <div class="pred-breakdown-item">
                <span class="count">${jacDelhiColleges.size}</span>
                <span class="label">JAC Delhi</span>
            </div>
        `;
    }
    if (jacChandigarhColleges.size > 0) {
        html += `
            <div class="pred-breakdown-item">
                <span class="count">${jacChandigarhColleges.size}</span>
                <span class="label">JAC Chd.</span>
            </div>
        `;
    }
    if (uptacColleges.size > 0) {
        html += `
            <div class="pred-breakdown-item">
                <span class="count">${uptacColleges.size}</span>
                <span class="label">UPTAC</span>
            </div>
        `;
    }
    if (ipuColleges.size > 0) {
        html += `
            <div class="pred-breakdown-item">
                <span class="count">${ipuColleges.size}</span>
                <span class="label">IPU (GGSIPU)</span>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

function isGenderEligible(userGender, item) {
    const itemGender = (item.gender || '').toLowerCase();
    const seatType = (item.seat_type || '').toLowerCase();
    
    const isFemaleSeat = 
        itemGender.includes('female') || 
        seatType.includes('girl') || 
        (seatType.includes('gl') && (item.source === 'JAC_DELHI' || item.source === 'UPTAC'));
        
    if (isFemaleSeat) {
        return userGender === 'Female-only';
    }
    return true;
}

function isQuotaEligible(userState, item) {
    const src = item.source;
    const seatType = (item.seat_type || '');
    
    if (src === 'JOSAA' || src === 'CSAB') {
        if (item.quota === 'AI') return true;
        const instituteState = getInstituteState(item.institute);
        if (!instituteState) return true;
        
        if (item.quota === 'HS') {
            return userState === instituteState;
        } else if (item.quota === 'OS') {
            return userState !== instituteState;
        } else if (item.quota === 'JK') {
            return userState === 'Jammu & Kashmir';
        } else if (item.quota === 'LA') {
            return userState === 'Ladakh';
        } else if (item.quota === 'GO') {
            return userState === 'Goa';
        }
        return true;
    }
    
    if (src === 'JAC_DELHI') {
        const isHS = seatType.endsWith('D');
        const isOS = seatType.endsWith('O');
        if (isHS) {
            return userState === 'Delhi';
        }
        if (isOS) {
            return userState !== 'Delhi';
        }
        return true;
    }
    
    if (src === 'GGSIPU') {
        const isHS = seatType.endsWith('HS');
        const isOS = seatType.endsWith('OS');
        if (isHS) {
            return userState === 'Delhi';
        }
        if (isOS) {
            return userState !== 'Delhi';
        }
        return true;
    }
    
    if (src === 'JAC') {
        if (item.quota === 'HS') {
            return userState === 'Chandigarh';
        }
        if (item.quota === 'OS') {
            return userState !== 'Chandigarh';
        }
        return true;
    }
    
    if (src === 'UPTAC') {
        if (item.quota === 'HS') {
            return userState === 'Uttar Pradesh';
        }
        return true;
    }
    
    return true;
}

function getEligibleUserRank(userCategory, userCrl, userCatRank, item) {
    const src = item.source;
    const seatType = item.seat_type || "";
    
    if (src === 'JOSAA') {
        if (seatType === 'OPEN' || seatType === 'OPEN (PwD)') {
            return userCrl;
        } else if (userCategory !== 'OPEN' && (seatType === userCategory || seatType === userCategory + ' (PwD)')) {
            return userCatRank || null;
        }
        return null;
    }
    
    if (src === 'CSAB') {
        if (seatType === 'OPEN' || seatType === 'OPEN (PwD)') {
            return userCrl;
        } else if (userCategory !== 'OPEN' && (seatType === userCategory || seatType === userCategory + ' (PwD)')) {
            return userCrl;
        }
        return null;
    }
    
    let categoryMatch = false;
    if (src === 'JAC_DELHI') {
        if (seatType.startsWith('GN') || seatType.startsWith('SG') || seatType.startsWith('KM') || seatType === 'KM') {
            categoryMatch = true;
        } else if (userCategory === 'EWS' && seatType.startsWith('EW')) {
            categoryMatch = true;
        } else if (userCategory === 'OBC-NCL' && seatType.startsWith('OB')) {
            categoryMatch = true;
        } else if (userCategory === 'SC' && seatType.startsWith('SC')) {
            categoryMatch = true;
        } else if (userCategory === 'ST' && seatType.startsWith('ST')) {
            categoryMatch = true;
        }
    } else if (src === 'GGSIPU') {
        if (seatType.startsWith('OP') || seatType.startsWith('NO')) {
            categoryMatch = true;
        } else if (userCategory === 'EWS' && seatType.startsWith('EW')) {
            categoryMatch = true;
        } else if (userCategory === 'OBC-NCL' && seatType.startsWith('BC')) {
            categoryMatch = true;
        } else if (userCategory === 'SC' && seatType.startsWith('SC')) {
            categoryMatch = true;
        } else if (userCategory === 'ST' && seatType.startsWith('ST')) {
            categoryMatch = true;
        }
    } else if (src === 'JAC') {
        const isSpecial = getSpecialCategoryType(item) !== null;
        if (seatType === 'OPEN') {
            categoryMatch = true;
        } else if (userCategory === 'EWS' && (seatType === 'OPEN EWS' || seatType.includes('EWS') || seatType.includes('Economically Weaker Section'))) {
            categoryMatch = true;
        } else if (userCategory === 'OBC-NCL' && (seatType === 'Backward Classes' || seatType.includes('BC') || seatType.includes('Backward'))) {
            categoryMatch = true;
        } else if (userCategory === 'SC' && seatType === 'SC') {
            categoryMatch = true;
        } else if (userCategory === 'ST' && seatType === 'ST') {
            categoryMatch = true;
        } else if (isSpecial) {
            const hasCategoryRestriction = seatType.includes('EWS') || seatType.includes('Economically Weaker') || 
                                         seatType.includes('Backward') || seatType.includes('BC') || 
                                         seatType.includes('SC') || seatType.includes('ST');
            if (!hasCategoryRestriction) {
                categoryMatch = true;
            }
        }
    } else if (src === 'UPTAC') {
        if (seatType.startsWith('OPEN')) {
            categoryMatch = true;
        } else if (userCategory === 'EWS' && seatType.startsWith('EWS')) {
            categoryMatch = true;
        } else if (userCategory === 'OBC-NCL' && seatType.startsWith('BC')) {
            categoryMatch = true;
        } else if (userCategory === 'SC' && seatType.startsWith('SC')) {
            categoryMatch = true;
        } else if (userCategory === 'ST' && seatType.startsWith('ST')) {
            categoryMatch = true;
        }
    }
    
    if (categoryMatch) {
        return userCrl;
    }
    return null;
}

function getSpecialCategoryType(item) {
    const seatType = item.seat_type || "";
    const seatTypeLower = seatType.toLowerCase();
    const src = item.source;
    
    // 1. PwD
    if (src === 'JOSAA' || src === 'CSAB') {
        if (seatTypeLower.endsWith('(pwd)')) return 'pwd';
    } else if (src === 'JAC_DELHI') {
        if (seatTypeLower.includes('pdd') || seatTypeLower.includes('pdo')) return 'pwd';
    } else if (src === 'GGSIPU') {
        if (seatTypeLower.includes('ph')) return 'pwd';
    } else if (src === 'JAC') {
        if (seatTypeLower.includes('pwd') || seatTypeLower.includes('disability')) return 'pwd';
    } else if (src === 'UPTAC') {
        if (seatTypeLower.endsWith('(ph)')) return 'pwd';
    }

    // 2. Defence (CW / AF / FF)
    if (src === 'JAC_DELHI') {
        if (seatTypeLower.includes('cwd') || seatTypeLower.includes('cwo')) return 'defence';
    } else if (src === 'GGSIPU') {
        if (seatTypeLower.includes('df')) return 'defence';
    } else if (src === 'JAC') {
        if (seatTypeLower.includes('defence') || seatTypeLower.includes('freedom')) return 'defence';
    } else if (src === 'UPTAC') {
        if (seatTypeLower.endsWith('(af)') || seatTypeLower.endsWith('(ff)')) return 'defence';
    }

    // 3. Kashmiri Migrant / J&K Resident
    if (src === 'JAC_DELHI') {
        if (seatTypeLower.includes('km')) return 'km';
    } else if (src === 'GGSIPU') {
        if (seatTypeLower.includes('km') || seatTypeLower.includes('jn')) return 'km';
    } else if (src === 'JAC') {
        if (seatTypeLower.includes('kashmiri')) return 'km';
    }

    // 4. Single Girl Child (SG / SGD)
    if (src === 'JAC_DELHI') {
        if (seatTypeLower.includes('sgd') || seatTypeLower === 'sg') return 'sg';
    } else if (src === 'JAC') {
        if (seatTypeLower.includes('girl child') || seatTypeLower.includes('one girl')) return 'sg';
    }

    // 5. Tuition Fee Waiver (TFW / TF)
    if (src === 'JAC') {
        if (seatTypeLower.includes('fee waiver') || seatTypeLower.includes('tfw')) return 'tfw';
    } else if (src === 'UPTAC') {
        if (seatTypeLower.endsWith('(tf)')) return 'tfw';
    }

    // 6. Other Special Quotas (Sports, Rural/Border Area, Sikh Minority, Orphan)
    if (src === 'JAC') {
        if (seatTypeLower.includes('sports') || seatTypeLower.includes('rural') || seatTypeLower.includes('border') || seatTypeLower.includes('orphan')) return 'other';
    } else if (src === 'GGSIPU') {
        if (seatTypeLower.includes('sma')) return 'other'; // NOSMAI (Sikh Minority)
    }

    return null;
}


function getInstituteState(inst) {
    const instLower = inst.toLowerCase();
    if (instLower.includes("jalandhar")) return "Punjab";
    if (instLower.includes("jaipur")) return "Rajasthan";
    if (instLower.includes("bhopal")) return "Madhya Pradesh";
    if (instLower.includes("allahabad")) return "Uttar Pradesh";
    if (instLower.includes("ranchi") || instLower.includes("jamshedpur") || instLower.includes("dhanbad") || instLower.includes("mesra") || instLower.includes("deoghar")) return "Jharkhand";
    if (instLower.includes("ajmer")) return "Rajasthan";
    if (instLower.includes("aurangabad") || instLower.includes("nagpur") || instLower.includes("pune") || instLower.includes("bombay") || instLower.includes("mumbai")) return "Maharashtra";
    if (instLower.includes("gorakhpur") || instLower.includes("lucknow") || instLower.includes("varanasi") || instLower.includes("amethi") || instLower.includes("noida")) return "Uttar Pradesh";
    if (instLower.includes("patna") || instLower.includes("bhagalpur")) return "Bihar";
    if (instLower.includes("ropar") || instLower.includes("longowal")) return "Punjab";
    if (instLower.includes("kundli") || instLower.includes("sonepat") || instLower.includes("kurukshetra") || instLower.includes("haryana")) return "Haryana";
    if (instLower.includes("thanjavur") || instLower.includes("salem") || instLower.includes("tiruchirappalli") || instLower.includes("kancheepuram") || instLower.includes("madras")) return "Tamil Nadu";
    if (instLower.includes("agartala")) return "Tripura";
    if (instLower.includes("arunachal pradesh") || instLower.includes("itanagar")) return "Arunachal Pradesh";
    if (instLower.includes("calicut") || instLower.includes("kottayam") || instLower.includes("palakkad")) return "Kerala";
    if (instLower.includes("delhi")) return "Delhi";
    if (instLower.includes("durgapur") || instLower.includes("shibpur") || instLower.includes("kalyani") || instLower.includes("malda") || instLower.includes("kharagpur")) return "West Bengal";
    if (instLower.includes("goa")) return "Goa";
    if (instLower.includes("hamirpur") || instLower.includes("una") || instLower.includes("mandi")) return "Himachal Pradesh";
    if (instLower.includes("surathkal") || instLower.includes("dharwad") || instLower.includes("raichur") || instLower.includes("karnataka")) return "Karnataka";
    if (instLower.includes("meghalaya") || instLower.includes("shillong")) return "Meghalaya";
    if (instLower.includes("nagaland")) return "Nagaland";
    if (instLower.includes("puducherry")) return "Puducherry";
    if (instLower.includes("raipur") || instLower.includes("bhilai") || instLower.includes("bilaspur")) return "Chhattisgarh";
    if (instLower.includes("sikkim")) return "Sikkim";
    if (instLower.includes("andhra pradesh") || instLower.includes("kurnool") || instLower.includes("tirupati") || instLower.includes("visakhapatnam") || instLower.includes("sri city") || instLower.includes("chittoor") || instLower.includes("vijayawada")) return "Andhra Pradesh";
    if (instLower.includes("manipur")) return "Manipur";
    if (instLower.includes("mizoram")) return "Mizoram";
    if (instLower.includes("rourkela") || instLower.includes("bhubaneswar") || instLower.includes("odisha")) return "Odisha";
    if (instLower.includes("silchar") || instLower.includes("guwahati") || instLower.includes("assam") || instLower.includes("kokrajar") || instLower.includes("tezpur")) return "Assam";
    if (instLower.includes("srinagar") || instLower.includes("jammu") || instLower.includes("kashmir") || instLower.includes("katra") || instLower.includes("ladakh")) return "Jammu & Kashmir";
    if (instLower.includes("warangal") || instLower.includes("hyderabad")) return "Telangana";
    if (instLower.includes("surat") || instLower.includes("vadodara") || instLower.includes("gujarat") || instLower.includes("ahmedabad") || instLower.includes("gandhinagar")) return "Gujarat";
    if (instLower.includes("sagar") || instLower.includes("gwalior") || instLower.includes("indore") || instLower.includes("madhya pradesh")) return "Madhya Pradesh";
    if (instLower.includes("diu") || instLower.includes("daman")) return "Daman & Diu";
    if (instLower.includes("haridwar") || instLower.includes("roorkee") || instLower.includes("uttarakhand")) return "Uttarakhand";
    if (instLower.includes("chandigarh")) return "Chandigarh";
    return "";
}

// Start app
init();

