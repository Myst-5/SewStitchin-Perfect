function switchFrame(frame) {
    const sections = {
        calculator: {
            iframe: "calculatorFrame",
            button: "calcBtn"
        },
        library: {
            iframe: "libraryFrame",
            button: "libraryBtn"
        },
        cart: {
            iframe: "cartFrame",
            button: "cartBtn"
        },
        about: {
            iframe: "aboutFrame",
            button: "aboutBtn"
        }
    };

    if (!sections[frame]) return;

    Object.entries(sections).forEach(([name, section]) => {
        const iframe = document.getElementById(section.iframe);
        const button = document.getElementById(section.button);

        if (!iframe || !button) return;

        const isActive = name === frame;

        iframe.classList.toggle("active-frame", isActive);
        button.classList.toggle("active", isActive);

        iframe.setAttribute("aria-hidden", String(!isActive));
        iframe.tabIndex = isActive ? 0 : -1;

        button.setAttribute("aria-selected", String(isActive));
    });
}

//----------------------------------------------------------------//
//-----------------------Calculator Script------------------------//

let patterns = [
    { name: "A wave in the sand", rate: 0.02 },
    { name: "Beaded", rate: 0.02 },
    { name: "Berry stipple", rate: 0.02 },
    { name: "Broken glass", rate: 0.02 },
    { name: "Cortney", rate: 0.02 },
    { name: "Cotton candy", rate: 0.02 },
    { name: "Funky Daisy", rate: 0.02 },
    { name: "Ghostly", rate: 0.02 },
    { name: "Ghosts", rate: 0.02 },
    { name: "Ginko garden", rate: 0.02 },
    { name: "Lauren", rate: 0.02 },
    { name: "Lightly flowered", rate: 0.02 },
    { name: "Little nature", rate: 0.02 },
    { name: "Luck of the Irish", rate: 0.02 },
    { name: "Luna", rate: 0.02 },
    { name: "Modern ties", rate: 0.02 },
    { name: "Splash of love", rate: 0.02 },
    { name: "Syringa paradise", rate: 0.02 },
    { name: "The garden", rate: 0.02 },
    { name: "Van Gogh", rate: 0.02 },
    { name: "Waverly", rate: 0.02 },
    { name: "All Other Patterns", rate: 0.025 }
];

let selectedPattern = patterns[0];
let battingType = '8020';
let includeBinding = true;

const VENMO_USERNAME = "SewStitchinPerfect";

const BATTING_RATES = {
    'none': 0,
    '8020': 0.30,
    'highloft': 0.42
};

const BINDING_BASE_RATE_PER_INCH = 0.20;

const unitToInches = { 'cm': 0.393701, 'in': 1, 'ft': 12 };
const sqUnitAbbr = { 'cm': '/sq cm', 'in': '/sq in', 'ft': '/sq ft' };
let previousUnit = 'in';

function formatRate(num) {
    if (num === 0) return '0.00';
    if (num < 0.01) return num.toFixed(4);
    if (num < 0.1) return num.toFixed(3);
    return num.toFixed(2);
}

function toggleAdminMode() {
    const isChecked = document.getElementById('adminToggle').checked;
    const toolbar = document.getElementById('adminToolbar');
    if (isChecked) {
        toolbar.classList.add('show');
    } else {
        toolbar.classList.remove('show');
    }
}

function renderPatternList(filterText = '') {
    const listContainer = document.getElementById('patternList');
    listContainer.innerHTML = '';
    const unit = document.getElementById('unitSelect').value;
    const inchMult = unitToInches[unit];

    const filtered = patterns.filter(p => p.name.toLowerCase().includes(filterText.toLowerCase()));

    if (filtered.length === 0) {
        listContainer.innerHTML = '<div class="pattern-item" style="cursor:default; color:#888;">No patterns found</div>';
        return;
    }

    filtered.forEach(p => {
        const item = document.createElement('div');
        item.className = 'pattern-item';
        const displayRate = p.rate * (inchMult * inchMult);
        item.innerHTML = `<span>${p.name}</span><strong class="pattern-price-tag">$${formatRate(displayRate)} <span style="font-size:0.75rem; font-weight:normal; color:#7d6c82;">${sqUnitAbbr[unit]}</span></strong>`;
        item.onclick = () => selectPattern(p);
        listContainer.appendChild(item);
    });
}

function togglePatternMenu(e) {
    e.stopPropagation();
    const menu = document.getElementById('patternMenu');
    menu.classList.toggle('show');
    if (menu.classList.contains('show')) {
        document.getElementById('patternSearch').focus();
    }
}

function filterPatterns() {
    const query = document.getElementById('patternSearch').value;
    renderPatternList(query);
}

function selectPattern(pattern) {
    selectedPattern = pattern;
    updateSelectedPatternUI();
    document.getElementById('patternMenu').classList.remove('show');
    calculate();
}

function updateSelectedPatternUI() {
    const unit = document.getElementById('unitSelect').value;
    const inchMult = unitToInches[unit];
    const displayRate = selectedPattern.rate * (inchMult * inchMult);

    document.getElementById('selectedPatternName').textContent = selectedPattern.name;
    document.getElementById('selectedPatternPrice').textContent = `$${formatRate(displayRate)}`;
    document.getElementById('selectedPatternUnit').textContent = sqUnitAbbr[unit];
}

function openAddModal() {
    document.getElementById('newPatternName').value = '';
    document.getElementById('newPatternRate').value = '';
    document.getElementById('addPatternModal').classList.add('show');
}

function closeAddModal() {
    document.getElementById('addPatternModal').classList.remove('show');
}

function saveNewPattern() {
    const name = document.getElementById('newPatternName').value.trim();
    const rate = parseFloat(document.getElementById('newPatternRate').value);

    if (!name || isNaN(rate) || rate <= 0) {
        return;
    }

    const newPattern = { name: name, rate: rate };
    patterns.push(newPattern);
    patterns.sort((a, b) => a.name.localeCompare(b.name));

    selectPattern(newPattern);
    renderPatternList();
    closeAddModal();
}

function deleteCurrentPattern() {
    if (patterns.length <= 1) {
        return;
    }

    const index = patterns.findIndex(p => p.name === selectedPattern.name);
    if (index !== -1) {
        patterns.splice(index, 1);
        selectPattern(patterns[0]);
        renderPatternList();
    }
}

function exportSiteCode() {
    const docType = "<!DOCTYPE html>\n";
    let htmlContent = docType + document.documentElement.outerHTML;

    htmlContent = htmlContent.replace('id="adminToggle" checked=""', 'id="adminToggle"');
    htmlContent = htmlContent.replace('id="adminToolbar" class="admin-toolbar show"', 'id="adminToolbar" class="admin-toolbar"');

    const patternsRegex = /let patterns = \[[\s\S]*?\];/;
    const serializedPatterns = "let patterns = " + JSON.stringify(patterns, null, 4) + ";";
    htmlContent = htmlContent.replace(patternsRegex, serializedPatterns);

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quilt-calculator.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

document.addEventListener('click', function(e) {
    const wrapper = document.querySelector('.pattern-btn-wrapper');
    if (wrapper && !wrapper.contains(e.target)) {
        document.getElementById('patternMenu').classList.remove('show');
    }
});

function convertUnitValues() {
    const newUnit = document.getElementById('unitSelect').value;
    const side1Input = document.getElementById('side1');
    const side2Input = document.getElementById('side2');

    const rawS1 = Math.max(0, parseFloat(side1Input.value) || 0);
    const rawS2 = Math.max(0, parseFloat(side2Input.value) || 0);

    const inchesS1 = rawS1 * unitToInches[previousUnit];
    const inchesS2 = rawS2 * unitToInches[previousUnit];

    const convertedS1 = inchesS1 / unitToInches[newUnit];
    const convertedS2 = inchesS2 / unitToInches[newUnit];

    side1Input.value = convertedS1 ? Number(convertedS1.toFixed(2)) : '';
    side2Input.value = convertedS2 ? Number(convertedS2.toFixed(2)) : '';

    previousUnit = newUnit;
    updateUnits();
    renderPatternList();
    updateSelectedPatternUI();
    calculate();
}

function updateUnits() {
    const unit = document.getElementById('unitSelect').value;
    const inchMult = unitToInches[unit];

    document.querySelectorAll('.unit-label').forEach(el => el.textContent = unit);

    const b8020Btn = document.getElementById('batting8020Btn');
    const bHighBtn = document.getElementById('battingHighLoftBtn');
    if (b8020Btn && bHighBtn) {
        b8020Btn.textContent = `80/20 ($${formatRate(0.30 * inchMult)}/${unit})`;
        bHighBtn.textContent = `High Loft ($${formatRate(0.42 * inchMult)}/${unit})`;
    }

    const bindingYesBtn = document.getElementById('bindingYesBtn');
    if (bindingYesBtn) {
        const convertedBindingRate = BINDING_BASE_RATE_PER_INCH * inchMult;
        bindingYesBtn.textContent = `Yes ($${formatRate(convertedBindingRate)}/${unit})`;
    }
}

function setBatting(type) {
    battingType = type;
    document.getElementById('battingNoneBtn').classList.toggle('active', type === 'none');
    document.getElementById('batting8020Btn').classList.toggle('active', type === '8020');
    document.getElementById('battingHighLoftBtn').classList.toggle('active', type === 'highloft');
    calculate();
}

function setBinding(yes) {
    includeBinding = yes;
    document.getElementById('bindingYesBtn').classList.toggle('active', yes);
    document.getElementById('bindingNoBtn').classList.toggle('active', !yes);
    calculate();
}

function calculate() {
    const rawS1 = Math.max(0, parseFloat(document.getElementById('side1').value) || 0);
    const rawS2 = Math.max(0, parseFloat(document.getElementById('side2').value) || 0);
    const unit = document.getElementById('unitSelect').value;
    const inchMult = unitToInches[unit];

    const sqRate = selectedPattern.rate * (inchMult * inchMult);
    const battingRate = BATTING_RATES[battingType] * inchMult;
    const bindingRate = includeBinding ? (BINDING_BASE_RATE_PER_INCH * inchMult) : 0;

    const squarePart = (rawS1 * rawS2) * sqRate;
    const battingPart = rawS1 * battingRate;
    const bindingPart = (rawS1 * 2 + rawS2 * 2) * bindingRate;
    const total = Math.max(0, squarePart + battingPart + bindingPart);

    const totalEl = document.getElementById('total');
    const containerEl = document.getElementById('resultContainer');

    totalEl.textContent = total.toFixed(2);
    containerEl.classList.remove('pulse');
    void containerEl.offsetWidth;
    containerEl.classList.add('pulse');

    updateVenmoInfo(rawS1, rawS2, unit, total.toFixed(2));
}

window.onload = function() {
    selectPattern(patterns[0]);
    updateUnits();
    renderPatternList();
    calculate();
}

//-------------------------------------------------------//
//--------------------Pattern Library Scrip--------------//

// Rates copied from calculator.js. Rates are in dollars per square inch.
    const THEMES = [
        { id: 'all', name: 'All Patterns', desc: 'Browse every pattern and its base price.' },
        { id: 'standard-rate', name: 'Standard Rate', desc: 'Patterns priced at $0.02 per square inch.' },
        { id: 'other-rate', name: 'Other Patterns', desc: 'Patterns priced at $0.025 per square inch.' }
    ];

    const PATTERNS = [
        { id: 1, name: 'A wave in the sand', rate: 0.02, themeId: 'standard-rate' },
        { id: 2, name: 'Beaded', rate: 0.02, themeId: 'standard-rate' },
        { id: 3, name: 'Berry stipple', rate: 0.02, themeId: 'standard-rate' },
        { id: 4, name: 'Broken glass', rate: 0.02, themeId: 'standard-rate' },
        { id: 5, name: 'Cortney', rate: 0.02, themeId: 'standard-rate' },
        { id: 6, name: 'Cotton candy', rate: 0.02, themeId: 'standard-rate' },
        { id: 7, name: 'Funky Daisy', rate: 0.02, themeId: 'standard-rate' },
        { id: 8, name: 'Ghostly', rate: 0.02, themeId: 'standard-rate' },
        { id: 9, name: 'Ghosts', rate: 0.02, themeId: 'standard-rate' },
        { id: 10, name: 'Ginko garden', rate: 0.02, themeId: 'standard-rate' },
        { id: 11, name: 'Lauren', rate: 0.02, themeId: 'standard-rate' },
        { id: 12, name: 'Lightly flowered', rate: 0.02, themeId: 'standard-rate' },
        { id: 13, name: 'Little nature', rate: 0.02, themeId: 'standard-rate' },
        { id: 14, name: 'Luck of the Irish', rate: 0.02, themeId: 'standard-rate' },
        { id: 15, name: 'Luna', rate: 0.02, themeId: 'standard-rate' },
        { id: 16, name: 'Modern ties', rate: 0.02, themeId: 'standard-rate' },
        { id: 17, name: 'Splash of love', rate: 0.02, themeId: 'standard-rate' },
        { id: 18, name: 'Syringa paradise', rate: 0.02, themeId: 'standard-rate' },
        { id: 19, name: 'The garden', rate: 0.02, themeId: 'standard-rate' },
        { id: 20, name: 'Van Gogh', rate: 0.02, themeId: 'standard-rate' },
        { id: 21, name: 'Waverly', rate: 0.02, themeId: 'standard-rate' },
        { id: 22, name: 'All Other Patterns', rate: 0.025, themeId: 'other-rate' }
    ];

    let currentThemeId = 'all';
    let allExpanded = false;

    function toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('mobileOverlay');
        const icon = document.getElementById('toggleIcon');
        const text = document.getElementById('toggleText');

        sidebar.classList.toggle('collapsed');
        overlay.classList.toggle('active');

        const isCollapsed = sidebar.classList.contains('collapsed');
        icon.textContent = isCollapsed ? '☰' : '✕';
        text.textContent = isCollapsed ? 'Menu' : 'Close';
    }

    function renderSidebar() {
        const nav = document.getElementById('sidebarNav');
        nav.innerHTML = THEMES.map(theme => `
            <button type="button" class="nav-card ${theme.id === currentThemeId ? 'active' : ''}" onclick="selectTheme('${theme.id}')">
                <span class="card-tag">Category</span>
                <h3>${theme.name}</h3>
            </button>
        `).join('');
    }

    function selectTheme(themeId) {
        currentThemeId = themeId;
        const theme = THEMES.find(t => t.id === themeId);
        if (!theme) return;

        document.getElementById('categoryTitle').textContent = theme.name;
        document.getElementById('categoryDesc').textContent = theme.desc;
        renderSidebar();
        renderPatterns();

        if (window.innerWidth <= 768 && !document.getElementById('sidebar').classList.contains('collapsed')) {
            toggleSidebar();
        }
    }

    function generatePlaceholder() {
        return `
            <svg class="placeholder-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Decorative quilting pattern placeholder">
                <rect width="100" height="100" fill="#fcfbfe" />
                <g stroke="#3a2c3f" stroke-width="1.5" fill="none">
                    <path d="M0,50 Q25,25 50,50 T100,50" opacity="0.4" />
                    <path d="M0,30 Q25,5 50,30 T100,30" opacity="0.3" />
                    <path d="M0,70 Q25,45 50,70 T100,70" opacity="0.3" />
                    <circle cx="50" cy="50" r="18" stroke="#7d6c82" stroke-dasharray="2,2"/>
                </g>
            </svg>
        `;
    }

    function renderPatterns() {
        const grid = document.getElementById('patternGrid');
        const filtered = currentThemeId === 'all'
            ? PATTERNS
            : PATTERNS.filter(pattern => pattern.themeId === currentThemeId);

        grid.innerHTML = filtered.map(pattern => `
            <div class="pattern-item ${allExpanded ? 'open' : ''}" id="pattern-${pattern.id}">
                <div class="pattern-header-card" role="button" tabindex="0" onclick="togglePattern(${pattern.id})" onkeydown="if(event.key === 'Enter' || event.key === ' '){event.preventDefault();togglePattern(${pattern.id});}">
                    <span class="pattern-title">${pattern.name}</span>
                    <span class="chevron">▾</span>
                </div>
                <div class="pattern-body" id="body-${pattern.id}" style="height:${allExpanded ? 'auto' : '0px'}">
                    <div class="pattern-square-box">
                        ${generatePlaceholder()}
                        <div class="pattern-details">
                            <span class="pattern-tag-pill">Quilting Pattern</span>
                            <div class="pattern-desc">${pattern.name}</div>
                            <div class="pattern-price">$${pattern.rate.toFixed(3)} / sq in</div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        if (allExpanded) {
            requestAnimationFrame(() => {
                document.querySelectorAll('.pattern-item.open .pattern-body').forEach(body => {
                    body.style.height = body.scrollHeight + 'px';
                });
            });
        }
    }

    function togglePattern(id) {
        const item = document.getElementById(`pattern-${id}`);
        const body = document.getElementById(`body-${id}`);
        if (!item || !body) return;

        const isOpen = item.classList.contains('open');
        if (isOpen) {
            item.classList.remove('open');
            body.style.height = '0px';
        } else {
            item.classList.add('open');
            body.style.height = body.scrollHeight + 'px';
        }
    }

    function toggleAllPatterns() {
        allExpanded = !allExpanded;
        document.getElementById('toggleAllBtn').textContent = allExpanded ? 'Collapse All' : 'Expand All';

        document.querySelectorAll('.pattern-item').forEach(item => {
            const body = item.querySelector('.pattern-body');
            if (allExpanded) {
                item.classList.add('open');
                body.style.height = body.scrollHeight + 'px';
            } else {
                item.classList.remove('open');
                body.style.height = '0px';
            }
        });
    }

    window.addEventListener('load', () => {
        renderSidebar();
        renderPatterns();
    });
/*-----------------------Shopping--------------------*/
/*---------------------Cart--Script------------------*/


