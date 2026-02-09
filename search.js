let lexiconData = [];
let fuse = null;
let currentView = 'list';
let filteredData = [];
let displayLimit = 100; // Show 100 results at a time
let currentDisplayCount = 100;

// Initialize the application
async function init() {
    try {
        const response = await fetch('lexicon-data.json');
        lexiconData = await response.json();
        
        setupFuse();
        populateFilters();
        showWelcomeMessage();
        setupEventListeners();
        
        document.getElementById('resultsCount').textContent = `${lexiconData.length} entries loaded. Start typing to search.`;
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('resultsCount').textContent = 'Error loading data';
    }
}

// Setup Fuse.js for fuzzy search
function setupFuse() {
    fuse = new Fuse(lexiconData, {
        keys: [
            { name: 'lex', weight: 2 },
            { name: 'lex_arb', weight: 2 },
            { name: 'root', weight: 1.5 },
            { name: 'def', weight: 1 }
        ],
        threshold: 0.4,
        includeScore: true,
        includeMatches: true,
        minMatchCharLength: 2
    });
}

// Populate filter dropdowns
function populateFilters() {
    const posSet = new Set();
    const semSet = new Set();
    const dialectSet = new Set();
    
    lexiconData.forEach(entry => {
        if (entry.pos && entry.pos.trim()) posSet.add(entry.pos.trim());
        if (entry.sem && entry.sem.trim()) semSet.add(entry.sem.trim());
        if (entry.dialect && entry.dialect.trim()) dialectSet.add(entry.dialect.trim());
    });
    
    populateSelect('filterPos', Array.from(posSet).sort());
    populateSelect('filterSem', Array.from(semSet).sort());
    populateSelect('filterDialect', Array.from(dialectSet).sort());
}

function populateSelect(id, options) {
    const select = document.getElementById(id);
    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        select.appendChild(option);
    });
}

// Setup event listeners
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearch');
    const filterPos = document.getElementById('filterPos');
    const filterSem = document.getElementById('filterSem');
    const filterDialect = document.getElementById('filterDialect');
    const filterMissingRoot = document.getElementById('filterMissingRoot');
    const listViewBtn = document.getElementById('listViewBtn');
    const rootViewBtn = document.getElementById('rootViewBtn');
    
    searchInput.addEventListener('input', handleSearch);
    clearBtn.addEventListener('click', clearSearch);
    
    [filterPos, filterSem, filterDialect, filterMissingRoot].forEach(filter => {
        filter.addEventListener('change', handleSearch);
    });
    
    listViewBtn.addEventListener('click', () => switchView('list'));
    rootViewBtn.addEventListener('click', () => switchView('root'));
}

// Show welcome message instead of all entries
function showWelcomeMessage() {
    const container = document.getElementById('listView');
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">📚</div>
            <div class="empty-state-text" style="margin-bottom: 15px;">
                Welcome to the Omani Arabic Lexicon
            </div>
            <div style="color: #718096; max-width: 500px; margin: 0 auto;">
                ${lexiconData.length.toLocaleString()} entries loaded and ready to search.<br><br>
                Start typing in Arabic (ابو), transliteration (abu), root (ʔbw), or English definitions to find entries.
            </div>
        </div>
    `;
}

// Handle search and filtering
function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    const filterPos = document.getElementById('filterPos').value;
    const filterSem = document.getElementById('filterSem').value;
    const filterDialect = document.getElementById('filterDialect').value;
    const filterMissingRoot = document.getElementById('filterMissingRoot').checked;
    
    // Show/hide clear button
    document.getElementById('clearSearch').style.display = searchTerm ? 'flex' : 'none';
    
    // If no search term and no filters, show welcome message
    if (!searchTerm && !filterPos && !filterSem && !filterDialect && !filterMissingRoot) {
        showWelcomeMessage();
        document.getElementById('resultsCount').textContent = `${lexiconData.length} entries loaded. Start typing to search.`;
        return;
    }
    
    let results = lexiconData;
    
    // Apply text search (only if search term exists)
    if (searchTerm.length >= 1) {
        const fuseResults = fuse.search(searchTerm);
        results = fuseResults.map(result => result.item);
    }
    
    // Apply filters
    results = results.filter(entry => {
        if (filterPos && entry.pos !== filterPos) return false;
        if (filterSem && entry.sem !== filterSem) return false;
        if (filterDialect && entry.dialect !== filterDialect) return false;
        if (filterMissingRoot && entry.root && entry.root.trim()) return false;
        return true;
    });
    
    filteredData = results;
    
    if (currentView === 'list') {
        displayResults(results);
        if (results.length > displayLimit) {
            document.getElementById('resultsCount').textContent = 
                `Showing first ${Math.min(displayLimit, results.length)} of ${results.length} ${results.length === 1 ? 'entry' : 'entries'}`;
        } else {
            document.getElementById('resultsCount').textContent = 
                `Showing ${results.length} ${results.length === 1 ? 'entry' : 'entries'}`;
        }
    } else {
        displayRootView(results);
        document.getElementById('resultsCount').textContent = 
            `Showing ${results.length} entries organized by root`;
    }
}

// Clear search
function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('filterPos').value = '';
    document.getElementById('filterSem').value = '';
    document.getElementById('filterDialect').value = '';
    document.getElementById('filterMissingRoot').checked = false;
    showWelcomeMessage();
    document.getElementById('resultsCount').textContent = `${lexiconData.length} entries loaded. Start typing to search.`;
    document.getElementById('clearSearch').style.display = 'none';
}

// Switch between list and root view
function switchView(view) {
    currentView = view;
    
    document.getElementById('listViewBtn').classList.toggle('active', view === 'list');
    document.getElementById('rootViewBtn').classList.toggle('active', view === 'root');
    
    document.getElementById('listView').style.display = view === 'list' ? 'flex' : 'none';
    document.getElementById('rootView').style.display = view === 'root' ? 'block' : 'none';
    
    if (view === 'root') {
        displayRootView(filteredData.length > 0 ? filteredData : lexiconData);
    }
}

// Display results in list view
function displayResults(data, append = false) {
    const container = document.getElementById('listView');
    
    if (data.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <div class="empty-state-text">No entries found matching your search criteria</div>
            </div>
        `;
        return;
    }
    
    // Reset display count if not appending
    if (!append) {
        currentDisplayCount = displayLimit;
    }
    
    const dataToShow = data.slice(0, currentDisplayCount);
    const hasMore = data.length > currentDisplayCount;
    
    let html = dataToShow.map(entry => createEntryHTML(entry)).join('');
    
    // Add "show more" button if there are more results
    if (hasMore) {
        const remaining = data.length - currentDisplayCount;
        html += `
            <div style="text-align: center; padding: 30px;">
                <button id="showMoreBtn" class="view-btn" style="padding: 12px 30px; font-size: 1.05em;">
                    Show ${Math.min(remaining, displayLimit)} more (${remaining} remaining)
                </button>
            </div>
        `;
    }
    
    if (append) {
        container.innerHTML += html;
    } else {
        container.innerHTML = html;
    }
    
    // Add expand button listeners
    document.querySelectorAll('.expand-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const details = this.nextElementSibling;
            if (details.style.display === 'none' || !details.style.display) {
                details.style.display = 'block';
                this.textContent = 'Show less';
            } else {
                details.style.display = 'none';
                this.textContent = 'Show more details';
            }
        });
    });
    
    // Add show more button listener
    const showMoreBtn = document.getElementById('showMoreBtn');
    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', () => {
            currentDisplayCount += displayLimit;
            displayResults(data, false);
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        });
    }
}

// Create HTML for a single entry
function createEntryHTML(entry) {
    const hasMissingRoot = !entry.root || !entry.root.trim();
    
    let badges = '';
    if (entry.root && entry.root.trim()) {
        badges += `<span class="badge badge-root">Root: ${escapeHtml(entry.root)}</span>`;
    } else {
        badges += `<span class="badge badge-missing">Missing root</span>`;
    }
    
    if (entry.pos && entry.pos.trim()) {
        badges += `<span class="badge badge-pos">${escapeHtml(entry.pos)}</span>`;
    }
    
    if (entry.sem && entry.sem.trim()) {
        badges += `<span class="badge badge-sem">${escapeHtml(entry.sem)}</span>`;
    }
    
    if (entry.dialect && entry.dialect.trim()) {
        badges += `<span class="badge badge-dialect">${escapeHtml(entry.dialect)}</span>`;
    }
    
    // Build details section
    const details = [];
    if (entry.ref) details.push({ label: 'Reference', value: entry.ref });
    if (entry.etym) details.push({ label: 'Etymology', value: entry.etym });
    if (entry.phon) details.push({ label: 'Phonology', value: entry.phon });
    if (entry.measure) details.push({ label: 'Measure', value: entry.measure });
    if (entry.src) details.push({ label: 'Source', value: entry.src });
    if (entry.pg) details.push({ label: 'Page', value: entry.pg });
    if (entry.id) details.push({ label: 'ID', value: entry.id });
    
    const detailsHTML = details.length > 0 ? `
        <button class="expand-btn">Show more details</button>
        <div class="entry-details" style="display: none;">
            ${details.map(d => `
                <div class="detail-row">
                    <span class="detail-label">${d.label}:</span>
                    <span class="detail-value">${escapeHtml(d.value)}</span>
                </div>
            `).join('')}
        </div>
    ` : '';
    
    return `
        <div class="entry">
            <div class="entry-header">
                <div class="entry-title">
                    <span class="entry-lex">${escapeHtml(entry.lex || 'N/A')}</span>
                    ${entry.lex_arb ? `<span class="entry-arabic">${escapeHtml(entry.lex_arb)}</span>` : ''}
                </div>
                <div class="entry-badges">
                    ${badges}
                </div>
            </div>
            
            <div class="entry-definition">
                ${escapeHtml(entry.def || 'No definition available')}
            </div>
            
            ${detailsHTML}
        </div>
    `;
}

// Display root view
function displayRootView(data) {
    const container = document.getElementById('rootView');
    
    // Group entries by root
    const rootGroups = {};
    const missingRoot = [];
    
    data.forEach(entry => {
        if (entry.root && entry.root.trim()) {
            const root = entry.root.trim();
            if (!rootGroups[root]) {
                rootGroups[root] = [];
            }
            rootGroups[root].push(entry);
        } else {
            missingRoot.push(entry);
        }
    });
    
    // Sort roots alphabetically
    const sortedRoots = Object.keys(rootGroups).sort();
    
    let html = '';
    
    // Display roots with entries
    sortedRoots.forEach(root => {
        const entries = rootGroups[root];
        html += `
            <div class="root-group">
                <div class="root-header">
                    <span>${escapeHtml(root)}</span>
                    <span class="root-count">(${entries.length} ${entries.length === 1 ? 'entry' : 'entries'})</span>
                </div>
                <div class="root-entries">
                    ${entries.map(entry => `
                        <div class="root-entry-item">
                            <strong>${escapeHtml(entry.lex || 'N/A')}</strong>
                            ${entry.lex_arb ? `<span style="margin: 0 8px; direction: rtl;">${escapeHtml(entry.lex_arb)}</span>` : ''}
                            ${entry.pos ? `<span style="color: #718096; font-size: 0.9em;">(${escapeHtml(entry.pos)})</span>` : ''}
                            <div style="margin-top: 5px; color: #4a5568; font-size: 0.95em;">
                                ${escapeHtml(entry.def ? (entry.def.length > 150 ? entry.def.substring(0, 150) + '...' : entry.def) : 'No definition')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    // Display entries missing root
    if (missingRoot.length > 0) {
        html += `
            <div class="root-group" style="border-left: 3px solid #c53030; padding-left: 15px;">
                <div class="root-header" style="color: #c53030;">
                    <span>Missing Root Data</span>
                    <span class="root-count">(${missingRoot.length} ${missingRoot.length === 1 ? 'entry' : 'entries'})</span>
                </div>
                <div class="root-entries">
                    ${missingRoot.map(entry => `
                        <div class="root-entry-item" style="border-left-color: #c53030;">
                            <strong>${escapeHtml(entry.lex || 'N/A')}</strong>
                            ${entry.lex_arb ? `<span style="margin: 0 8px; direction: rtl;">${escapeHtml(entry.lex_arb)}</span>` : ''}
                            ${entry.pos ? `<span style="color: #718096; font-size: 0.9em;">(${escapeHtml(entry.pos)})</span>` : ''}
                            <div style="margin-top: 5px; color: #4a5568; font-size: 0.95em;">
                                ${escapeHtml(entry.def ? (entry.def.length > 150 ? entry.def.substring(0, 150) + '...' : entry.def) : 'No definition')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
