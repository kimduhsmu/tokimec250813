document.addEventListener('DOMContentLoaded', function () {
    // --- 연락처 데이터 및 기능 ---
                

                function setupContactPage() {
                    const departmentFilter = document.getElementById('department-filter');
                    const positionFilter = document.getElementById('position-filter');
                    const nameSearchInput = document.getElementById('name-search-input');
                    const tableBody = document.getElementById('contact-table-body');
                    const noResultsMsg = document.getElementById('contact-no-results');

                    if (!departmentFilter) return; // 연락처 페이지가 아니면 함수 종료

                    function populateFilters() {
                        const departments = ['모든 부서', ...new Set(contactData.map(c => c.department))];
                        const positions = ['모든 직책', ...new Set(contactData.map(c => c.position.split('(')[0].trim()))];

                        departmentFilter.innerHTML = departments.map(d => `<option value="${d}">${d}</option>`).join('');
                        positionFilter.innerHTML = positions.map(p => `<option value="${p}">${p}</option>`).join('');
                    }

                    function renderTable(data) {
                        if (data.length === 0) {
                            tableBody.innerHTML = '';
                            noResultsMsg.style.display = 'block';
                            return;
                        }
                        noResultsMsg.style.display = 'none';
                        tableBody.innerHTML = data.map(contact => {
                            const displayPosition = `${contact.position}${contact.role ? ` (${contact.role})` : ''}`;

                            return `
                    <tr class="hover:bg-gray-700 transition-colors">
                        <td class="p-3 text-center">${contact.department || '-'}</td>
                        <td class="p-3 text-center">${displayPosition}</td>
                        <td class="p-3 text-center">${contact.name || '-'}</td>
                        <td class="p-3 text-center">${contact.extension || '-'}</td>
                        <td class="p-3 text-center"><a href="tel:${contact.phone}" class="text-sky-400 hover:underline">${contact.phone || '-'}</a></td>
                        <td class="p-3 text-center"><a href="mailto:${contact.email}" class="text-sky-400 hover:underline">${contact.email || '-'}</a></td>
                    </tr>
                `;
                        }).join('');
                    }

                    function applyFilters() {
                        const department = departmentFilter.value;
                        const position = positionFilter.value;
                        const searchTerm = nameSearchInput.value.toLowerCase();

                        const filteredData = contactData.filter(contact => {
                            const departmentMatch = (department === '모든 부서' || contact.department === department);
                            const positionMatch = (position === '모든 직책' || contact.position.startsWith(position));
                            const nameMatch = contact.name.toLowerCase().includes(searchTerm);
                            return departmentMatch && positionMatch && nameMatch;
                        });

                        renderTable(filteredData);
                    }

                    if (departmentFilter.dataset.initialized !== 'true') {
                        populateFilters();
                        departmentFilter.addEventListener('change', applyFilters);
                        positionFilter.addEventListener('change', applyFilters);
                        nameSearchInput.addEventListener('input', applyFilters);
                        departmentFilter.dataset.initialized = 'true';
                    }

                    applyFilters();
                }
                // --- 연락처 기능 끝 ---


                const ACCESS_POLICIES = {
                    all: {
                        allowedTypes: ['std', 'std-sw', 'cmp', 'valve', 'contact'],
                        defaultType: 'std'
                    },
                    std_bundle: {
                        allowedTypes: ['std', 'std-sw'],
                        defaultType: 'std'
                    },
                    std_sw_only: {
                        allowedTypes: ['std-sw'],
                        defaultType: 'std-sw'
                    },
                    cmp_only: {
                        allowedTypes: ['cmp'],
                        defaultType: 'cmp'
                    }
                };
                const PASSWORD_TO_POLICY = {
                    '0011': 'all',
                    '0012': 'all',
                    '0013': 'all',
                    '0014': 'all',
                    '1000': 'std_bundle',
                    '2000': 'cmp_only'
                };
                const CORRECT_PASSWORD = Object.keys(PASSWORD_TO_POLICY);
                let activeAccessPolicy = ACCESS_POLICIES.all;

                const passwordModal = document.getElementById('password-modal');
                const passwordForm = document.getElementById('password-form');
                const passwordInput = document.getElementById('password-input');
                const passwordError = document.getElementById('password-error');
                const mainContent = document.getElementById('main-content');
                const passwordCloseBtn = document.getElementById('password-close-btn');
                const themeModal = document.getElementById('theme-modal');
                const themeModalCloseBtn = document.getElementById('theme-modal-close');
                const themeOptionButtons = Array.from(document.querySelectorAll('.theme-option-btn[data-theme-value]'));
                const themeTapNodes = Array.from(document.querySelectorAll('#selection-screen .watermark, #selection-screen .watermark-bottom'));
                const themeColorMeta = document.querySelector('meta[name="theme-color"]');
                const THEME_STORAGE_KEY = 'tkpUiTheme';
                const THEME_META_COLORS = {
                    dark: '#000000',
                    white: '#f8fafc',
                    sky: '#1a1b26',
                    gray: '#2b3139'
                };
                let themeTapCount = 0;
                let themeTapTimer = null;
                let isThemeEditEnabled = false;

                function updateThemeOptionState(activeTheme) {
                    themeOptionButtons.forEach(btn => {
                        const isActive = btn.dataset.themeValue === activeTheme;
                        btn.classList.toggle('active', isActive);
                    });
                }

                function applyTheme(themeName, persist) {
                    const normalizedThemeName = themeName === 'iphone' ? 'gray' : themeName;
                    const nextTheme = THEME_META_COLORS[normalizedThemeName] ? normalizedThemeName : 'dark';
                    document.body.setAttribute('data-theme', nextTheme);
                    if (themeColorMeta) {
                        themeColorMeta.setAttribute('content', THEME_META_COLORS[nextTheme]);
                    }
                    updateThemeOptionState(nextTheme);
                    if (persist !== false) {
                        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
                    }
                }

            function loadSavedTheme() {
                    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
                    const nextTheme = THEME_META_COLORS[savedTheme] ? savedTheme : 'dark';
                    applyTheme(nextTheme, false);
                }

                function closeThemeModal() {
                    if (themeModal) {
                        themeModal.classList.remove('show');
                    }
                }

                function openThemeModal() {
                    if (!isThemeEditEnabled || !themeModal) return;
                    themeModal.classList.add('show');
                }

                function resetThemeTapCounter() {
                    themeTapCount = 0;
                    if (themeTapTimer) {
                        clearTimeout(themeTapTimer);
                        themeTapTimer = null;
                    }
                }

                function handleWatermarkSecretTap() {
                    if (!isThemeEditEnabled) return;
                    themeTapCount += 1;
                    if (themeTapCount >= 5) {
                        resetThemeTapCounter();
                        openThemeModal();
                        return;
                    }
                    if (themeTapTimer) clearTimeout(themeTapTimer);
                    themeTapTimer = setTimeout(() => {
                        resetThemeTapCounter();
                    }, 2000);
                }

                function handleThemeTapNode(event) {
                    event.stopPropagation();
                    handleWatermarkSecretTap();
                }

                function handleSelectionScreenSecretTap(event) {
                    if (!isThemeEditEnabled) return;
                    if (event.target.closest('button, a, input, select, textarea, label, form')) return;
                    if (event.target.closest('.watermark, .watermark-bottom')) return;
                    handleWatermarkSecretTap();
                }

                function setThemeEditEnabled(enabled) {
                    isThemeEditEnabled = enabled;
                    themeTapNodes.forEach(node => {
                        node.style.pointerEvents = enabled ? 'auto' : 'none';
                    });
                    if (!enabled) {
                        resetThemeTapCounter();
                        closeThemeModal();
                    }
                }

                function setupThemeControls() {
                    themeTapNodes.forEach(node => {
                        node.addEventListener('click', handleThemeTapNode);
                    });
                    const selectionScreenSecretArea = document.getElementById('selection-screen');
                    if (selectionScreenSecretArea) {
                        selectionScreenSecretArea.addEventListener('click', handleSelectionScreenSecretTap);
                    }
                    themeOptionButtons.forEach(btn => {
                        btn.addEventListener('click', () => {
                            applyTheme(btn.dataset.themeValue, true);
                        });
                    });
                    if (themeModalCloseBtn) {
                        themeModalCloseBtn.addEventListener('click', closeThemeModal);
                    }
                    if (themeModal) {
                        themeModal.addEventListener('click', (event) => {
                            if (event.target === themeModal) {
                                closeThemeModal();
                            }
                        });
                    }
                    document.addEventListener('keydown', (event) => {
                        if (event.key === 'Escape') {
                            closeThemeModal();
                        }
                    });
                }

                loadSavedTheme();
                setupThemeControls();

                function isTypeAllowed(type) {
                    return activeAccessPolicy.allowedTypes.includes(type);
                }
                function getFallbackType(requestedType) {
                    if (requestedType && isTypeAllowed(requestedType)) return requestedType;
                    return activeAccessPolicy.defaultType;
                }
                function applyAccessPolicy(policyKey) {
                    const selectedPolicy = ACCESS_POLICIES[policyKey] || ACCESS_POLICIES.all;
                    activeAccessPolicy = selectedPolicy;
                    setThemeEditEnabled(true);
                    const allowed = new Set(selectedPolicy.allowedTypes);
                    const visibilityMap = [
                        { type: 'std', menuId: 'select-std', tabId: 'tab-std' },
                        { type: 'std-sw', menuId: 'select-std-sw', tabId: 'tab-std-sw' },
                        { type: 'cmp', menuId: 'select-cmp', tabId: 'tab-cmp' },
                        { type: 'valve', menuId: 'select-valve', tabId: 'tab-valve' },
                        { type: 'contact', menuId: 'select-contact-link', tabId: 'tab-contact' }
                    ];
                    visibilityMap.forEach(({ type, menuId, tabId }) => {
                        const isVisible = allowed.has(type);
                        const menuEl = document.getElementById(menuId);
                        const tabEl = document.getElementById(tabId);
                        if (menuEl) menuEl.classList.toggle('hidden', !isVisible);
                        if (tabEl) tabEl.classList.toggle('hidden', !isVisible);
                    });
                }

                passwordModal.classList.add('show');
                passwordForm.addEventListener('submit', function (event) {
                    event.preventDefault(); // 폼의 기본 제출 동작(새로고침)을 막습니다.

                    if (CORRECT_PASSWORD.includes(passwordInput.value)) {
                        const policyKey = PASSWORD_TO_POLICY[passwordInput.value] || 'all';
                        applyAccessPolicy(policyKey);
                        passwordModal.classList.remove('show');
                        mainContent.style.display = 'block';
                        passwordError.textContent = '';
                    } else {

                        passwordError.textContent = '비밀번호가 일치하지 않습니다.'; // 에러 메시지 표시
                        passwordInput.value = ''; // 입력 필드 비우기

                        // 입력창을 살짝 흔드는 효과 추가
                        passwordModal.querySelector('.password-modal-content').animate([
                            { transform: 'translateX(0)' },
                            { transform: 'translateX(-10px)' },
                            { transform: 'translateX(10px)' },
                            { transform: 'translateX(-10px)' },
                            { transform: 'translateX(0)' }
                        ], {
                            duration: 300,
                            iterations: 1
                        });
                    }
                });

                function closeAppWithFallback() {
                    // 일부 브라우저는 window.close()를 차단하므로 순차적으로 종료를 시도합니다.
                    try {
                        window.close();
                    } catch (error) { }
                    setTimeout(() => {
                        try {
                            window.open('', '_self');
                            window.close();
                        } catch (error) { }
                        setTimeout(() => {
                            if (document.visibilityState === 'visible') {
                                window.location.replace('about:blank');
                            }
                        }, 120);
                    }, 80);
                }

                // 닫기 버튼 클릭 시 (PWA 앱 종료 또는 창 닫기 시도)
                passwordCloseBtn.addEventListener('click', function () {
                    if (confirm('프로그램을 종료하시겠습니까?')) {
                        closeAppWithFallback();
                    }
                });


                // --- PWA 설치 버튼 관련 코드 ---
                const installButton = document.getElementById('install-pwa-btn');
                let deferredPrompt;

                window.addEventListener('beforeinstallprompt', (e) => {
                    // 브라우저의 기본 설치 배너를 막습니다.
                    e.preventDefault();
                    // 나중에 사용하기 위해 이벤트를 저장합니다.
                    deferredPrompt = e;
                    // 설치 버튼을 화면에 보여줍니다.
                    if (installButton) {
                        installButton.classList.remove('hidden');
                    }
                });

                if (installButton) {
                    installButton.addEventListener('click', async () => {
                        if (deferredPrompt) {
                            // 저장해둔 prompt()를 호출하여 사용자에게 설치 여부를 묻습니다.
                            deferredPrompt.prompt();
                            // 사용자의 선택 결과를 기다립니다.
                            const { outcome } = await deferredPrompt.userChoice;
                            console.log(`User response to the install prompt: ${outcome}`);
                            // 프롬프트는 한 번만 사용할 수 있으므로, 변수를 초기화합니다.
                            deferredPrompt = null;
                            // 설치 프롬프트를 띄운 후에는 버튼을 숨깁니다.
                            installButton.classList.add('hidden');
                        }
                    });
                }

                window.addEventListener('appinstalled', () => {
                    // 앱이 설치되면 deferredPrompt를 null로 만들고 버튼을 숨깁니다.
                    deferredPrompt = null;
                    if (installButton) {
                        installButton.classList.add('hidden');
                    }
                    console.log('PWA was installed');
                });
                // --- PWA 설치 버튼 코드 끝 ---


                // --- 기록(History) 관련 상수 및 변수 ---
                const MAX_HISTORY_ITEMS = 50;// 최대 기록 개수를 50으로 변경
                const HISTORY_KEY = 'tkpCalculationHistory';

                // --- 기록(History) 관리 함수 ---
                function getHistory(type) {
                    const key = `${HISTORY_KEY}_${type}`;
                    try {
                        const history = localStorage.getItem(key);
                        return history ? JSON.parse(history) : [];
                    } catch (e) {
                        console.error("기록을 불러오는 중 오류 발생:", e);
                        return []; // 오류 발생 시 빈 배열 반환
                    }
                }

                function addToHistory(item, type) {
                    let history = getHistory(type);
                    history.unshift(item); // 새 항목을 배열 맨 앞에 추가
                    if (history.length > MAX_HISTORY_ITEMS) {
                        history.pop(); // 최대 개수를 초과하면 가장 오래된 항목(배열 맨 끝)을 제거
                    }
                    const key = `${HISTORY_KEY}_${type}`;
                    try {
                        localStorage.setItem(key, JSON.stringify(history));
                    } catch (e) {
                        console.error("기록을 저장하는 중 오류 발생:", e);
                    }
                }

                function clearHistory(type) {
                    const key = `${HISTORY_KEY}_${type}`;
                    try {
                        localStorage.removeItem(key);
                    } catch (e) {
                        console.error("기록을 삭제하는 중 오류 발생:", e);
                    }
                    renderHistory(type); // 화면 즉시 갱신
                }

                function renderHistory(type) {
                    const historyList = document.getElementById('history-list');
                    const history = getHistory(type); // type에 맞는 기록 가져오기
                    historyList.innerHTML = '';

                    if (history.length === 0) {
                        historyList.innerHTML = '<p class="text-gray-400 text-center py-8">계산 기록이 없습니다.</p>';
                        return;
                    }

                    history.forEach(item => {
                        const itemEl = document.createElement('div');
                        itemEl.className = 'history-item';

                        const date = new Date(item.timestamp).toLocaleString('ko-KR', {
                            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        });

                        let priceHTML = '';

                        // 실린더(이익율) 기록일 경우
                        if (item.calcType === 'cylinder') {
                            priceHTML = `
                    <div class="mt-3 grid grid-cols-3 gap-2 text-center text-sm border-t border-gray-600 pt-3">
                        <div>
                            <p class="text-xs text-gray-400">기존 단가</p>
                            <p class="font-semibold text-gray-200">${item.basePrice}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-400">적용 이익율</p>
                            <p class="font-semibold text-green-400">${item.margin}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-400">최종 합계</p>
                            <p class="font-semibold text-yellow-400">${item.finalPrice}</p>
                        </div>
                    </div>
                `;
                            // 박형 실린더(할인율) 기록일 경우
                        } else if (item.calcType === 'cylinder_discount') {
                            priceHTML = `
                    <div class="mt-3 grid grid-cols-3 gap-2 text-center text-sm border-t border-gray-600 pt-3">
                        <div>
                            <p class="text-xs text-gray-400">기존 단가</p>
                            <p class="font-semibold text-gray-200">${item.basePrice}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-400">적용 할인율</p>
                            <p class="font-semibold text-green-400">${item.discount}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-400">최종 합계</p>
                            <p class="font-semibold text-yellow-400">${item.finalPrice}</p>
                        </div>
                    </div>
                `;
                            // 밸브 기록일 경우
                        } else if (item.calcType === 'valve' && typeof item.price === 'object') {
                            priceHTML = `
                    <div class="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                        <div>
                            <p class="text-xs text-gray-400">대리점가</p>
                            <p class="font-semibold text-gray-200">₩ ${item.price.dealer || '-'}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-400">유압상</p>
                            <p class="font-semibold text-green-400">₩ ${item.price.hydraulic || '-'}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-400">일반상</p>
                            <p class="font-semibold text-yellow-400">₩ ${item.price.general || '-'}</p>
                        </div>
                    </div>
                `;
                            // 혹시 모를 이전 버전 기록을 위한 처리
                        } else {
                            const priceToDisplay = item.finalPrice || item.price || '정보 없음';
                            priceHTML = `<p class="text-right font-bold text-xl text-amber-400 mt-2">${priceToDisplay}</p>`;
                        }

                        itemEl.innerHTML = `
                <div class="flex justify-between items-start gap-4">
                    <div>
                        <p class="font-bold text-lg text-white">${item.name}</p>
                        <p class="text-sm text-gray-300 break-all">${item.details}</p>
                    </div>
                    <p class="text-xs text-gray-400 whitespace-nowrap">${date}</p>
                </div>
                ${priceHTML}
            `;
                        historyList.appendChild(itemEl);
                    });
                }


                // --- Elements ---
                const floatingBtn = document.getElementById('floating-back-btn');
                const historyPanel = document.getElementById('history-panel');
                const closeHistoryPanelBtn = document.getElementById('close-history-panel');
                const clearHistoryBtn = document.getElementById('clear-history-btn');
                const floatingHistoryContainer = document.getElementById('floating-history-container');
                const saveCurrentHistoryBtn = document.getElementById('save-current-history');
                const viewHistoryBtn = document.getElementById('view-history-button');

                const selectionScreen = document.getElementById('selection-screen');
                const calculatorContainer = document.getElementById('calculator-container');
                const selectStdBtn = document.getElementById('select-std');
                const selectStdSwBtn = document.getElementById('select-std-sw');
                const selectCmpBtn = document.getElementById('select-cmp');
                const selectValveBtn = document.getElementById('select-valve');
                const backButtons = document.querySelectorAll('.back-button');
                const tabs = document.querySelectorAll('.tab-button');
                const contents = document.querySelectorAll('.tab-content');
                const selectContactLink = document.getElementById('select-contact-link');
                const copyUrlBtn = document.getElementById('copy-url-btn');


                // --- UI Display Function ---
                function displayCalculator(type) {
                    type = getFallbackType(type);
                    selectionScreen.classList.add('hidden');
                    calculatorContainer.classList.remove('hidden');

                    // Activate the correct tab button style
                    tabs.forEach(t => t.classList.remove('active'));
                    const tabToShow = document.getElementById(`tab-${type}`);
                    if (tabToShow) tabToShow.classList.add('active');

                    // Show the correct content panel
                    contents.forEach(c => c.classList.remove('active'));
                    const contentToShow = document.getElementById(`content-${type}`);
                    if (contentToShow) contentToShow.classList.add('active');

                    floatingBtn.classList.add('show');
                    // 연락처일 때만 기록 버튼 숨김, 그 외에는 표시
                    if (type === 'contact') {
                        floatingHistoryContainer.classList.remove('show');
                        setupContactPage();
                    } else {
                        floatingHistoryContainer.classList.add('show');
                    }
                }

                // --- History & Navigation Logic (FIXED) ---

                // Set initial state for the main menu on page load.
                // Using '#' avoids SecurityError in sandboxed environments like iframes.
                history.replaceState({ screen: 'main' }, 'Main Menu', '#');
                function resetAllCalculators() {
                    // 1. 표준 실린더 계산기 초기화
                    const stdDiameterSelect = document.getElementById('std-diameter');
                    if (stdDiameterSelect) {
                        stdDiameterSelect.value = '0';
                        document.getElementById('std-stroke').value = '0';
                        document.getElementById('std-stroke-custom').value = '';
                        document.getElementById('std-type').value = '0';
                        document.getElementById('std-mounting').value = 'none';
                        document.getElementById('std-rod-end-fitting-1').value = 'none';
                        document.getElementById('std-rod-end-fitting-2').value = 'none';
                        document.getElementById('std-special').value = '1';
                        document.getElementById('std-bellows-enabled').checked = false;
                        document.getElementById('std-bellows-enabled').dispatchEvent(new Event('change'));
                        document.getElementById('std-bellows-general').checked = true;
                        document.getElementById('std-bellows-heat').checked = false;
                        document.getElementById('std-rod-extension-enabled').checked = false;
                        document.getElementById('std-rod-extension-mm').value = '0';
                        document.getElementById('std-rod-extension-mm').disabled = true;
                        document.getElementById('std-rod-extension-custom').value = '';
                        document.getElementById('std-rod-extension-custom').disabled = true;
                        document.getElementById('std-cushion').checked = false;
                        document.getElementById('std-margin-input').value = '0';
                        document.getElementById('std-quantity-input').value = '1';
                        // 변경 이벤트를 발생시켜 가격 표시를 업데이트합니다.
                        stdDiameterSelect.dispatchEvent(new Event('change'));
                    }

                    // 2. 표준 실린더 (스위치) 계산기 초기화
                    const stdSwDiameterSelect = document.getElementById('std-sw-diameter');
                    if (stdSwDiameterSelect) {
                        stdSwDiameterSelect.value = '0';
                        document.getElementById('std-sw-stroke').value = '0';
                        document.getElementById('std-sw-stroke-custom').value = '';
                        document.getElementById('std-sw-rod-type').value = '0';
                        document.getElementById('std-sw-mounting').value = 'none';
                        document.getElementById('std-sw-rod-end-fitting-1').value = 'none';
                        document.getElementById('std-sw-rod-end-fitting-2').value = 'none';
                        document.getElementById('std-sw-special').value = '1';
                        document.getElementById('std-sw-bellows-enabled').checked = false;
                        document.getElementById('std-sw-bellows-enabled').dispatchEvent(new Event('change'));
                        document.getElementById('std-sw-bellows-general').checked = true;
                        document.getElementById('std-sw-bellows-heat').checked = false;
                        document.getElementById('std-sw-rod-extension-enabled').checked = false;
                        document.getElementById('std-sw-rod-extension-mm').value = '0';
                        document.getElementById('std-sw-rod-extension-mm').disabled = true;
                        document.getElementById('std-sw-rod-extension-custom').value = '';
                        document.getElementById('std-sw-rod-extension-custom').disabled = true;
                        document.getElementById('std-sw-cushion').checked = false;
                        document.getElementById('std-sw-cushion').disabled = false;
                        document.getElementById('std-sw-proximity-sensor').checked = false;
                        document.getElementById('std-sw-margin-input').value = '0';
                        document.getElementById('std-sw-quantity-input').value = '1';
                        // 변경 이벤트를 발생시켜 가격 표시를 업데이트합니다.
                        stdSwDiameterSelect.dispatchEvent(new Event('change'));
                    }

                    // 3. 박형 실린더 계산기 초기화
                    const cmpCylinderTypeEl = document.getElementById('cmp-cylinderType');
                    if (cmpCylinderTypeEl) {
                        cmpCylinderTypeEl.value = 'TJS';
                        // 옵션을 먼저 업데이트하고 나머지 필드를 초기화합니다.
                        cmpCylinderTypeEl.dispatchEvent(new Event('change'));

                        document.getElementById('cmp-stroke').value = '0';
                        document.querySelectorAll('#cmp-optionsContainer input[type="checkbox"]').forEach(cb => cb.checked = false);
                        document.getElementById('cmp-discount-select').value = '0';
                        document.getElementById('cmp-quantity-input').value = '1';
                        // 모든 필드 초기화 후 가격을 다시 계산합니다.
                        cmpCylinderTypeEl.dispatchEvent(new Event('change'));
                    }

                    // 4. TKP 밸브 계산기 초기화
                    const valveSearchInput = document.getElementById('valve-search-input');
                    if (valveSearchInput) {
                        valveSearchInput.value = '';
                        document.getElementById('valve-category-select').value = '';
                        const specSelect = document.getElementById('valve-spec-select');
                        specSelect.innerHTML = '<option value="">-- 품목 또는 검색어를 먼저 입력하세요 --</option>';
                        specSelect.disabled = true;
                        document.getElementById('valve-price-card-wrapper').innerHTML = '';
                        document.getElementById('valve-no-results-message').style.display = 'none';
                    }
                }


                // Listen for browser back/forward button clicks (e.g., mobile back button)
                window.addEventListener('popstate', function (event) {
                    // If the state is null or 'main', it means we are going back to the main menu.
                    if (!event.state || event.state.screen === 'main') {
                        calculatorContainer.classList.add('hidden');
                        selectionScreen.classList.remove('hidden');
                        floatingBtn.classList.remove('show');
                        floatingHistoryContainer.classList.remove('show');

                        // 추가된 부분: 메인 화면으로 돌아갈 때 모든 계산기를 초기화합니다.
                        resetAllCalculators();

                    } else if (event.state.screen === 'calculator') {
                        // This handles forward navigation back to the calculator view
                        displayCalculator(event.state.type);
                    }
                });


                // Wrapper function to show calculator and push a new history state
                function navigateToCalculator(type) {
                    const targetType = getFallbackType(type);
                    displayCalculator(targetType);
                    history.pushState({ screen: 'calculator', type: targetType }, 'Calculator', `#${targetType}`);
                }
                // --- History Panel Event Listeners ---

                // '기록 보기' 버튼 클릭 시
                // '기록 보기' 버튼 클릭 시
                viewHistoryBtn.addEventListener('click', () => {
                    const activeContent = document.querySelector('.tab-content.active');
                    if (!activeContent) return;
                    const type = activeContent.id.replace('content-', '');

                    renderHistory(type);
                    historyPanel.dataset.currentType = type; // 현재 기록 타입을 패널에 저장
                    historyPanel.classList.remove('hidden');
                });
                // '기록' 버튼 클릭 시 (현재 활성화된 계산기 내용 저장)


                // '기록' 버튼 클릭 시 (현재 활성화된 계산기 내용 저장)
                saveCurrentHistoryBtn.addEventListener('click', () => {
                    let item = null;
                    const activeContent = document.querySelector('.tab-content.active');
                    if (!activeContent) return; // 활성화된 탭이 없으면 종료

                    switch (activeContent.id) {
                        case 'content-std':
                            const std_dia_txt = document.getElementById('std-diameter').selectedOptions[0].text;
                            const stdStrokeCustomVal = parseInt(document.getElementById('std-stroke-custom').value || '0', 10);
                            const std_str_txt = (!isNaN(stdStrokeCustomVal) && stdStrokeCustomVal > 0)
                                ? `${stdStrokeCustomVal}ST 입력 (적용 ${Math.ceil(stdStrokeCustomVal / 50) * 50}ST)`
                                : document.getElementById('std-stroke').selectedOptions[0].text;
                            const std_typ_txt = document.getElementById('std-type').selectedOptions[0].text;
                            const std_mnt_txt = document.getElementById('std-mounting').selectedOptions[0].text;
                            const std_details = `${std_dia_txt}, ${std_str_txt}, ${std_typ_txt}, ${std_mnt_txt}`;
                            item = {
                                name: '표준 실린더',
                                details: std_details,
                                basePrice: document.getElementById('std-price-display').textContent,
                                margin: `${document.getElementById('std-margin-input').value}%`,
                                finalPrice: document.getElementById('std-final-total-display').textContent,
                                timestamp: new Date().toISOString(),
                                calcType: 'cylinder'
                            };
                            break;

                        case 'content-std-sw':
                            const sw_dia_txt = document.getElementById('std-sw-diameter').selectedOptions[0].text;
                            const swStrokeCustomVal = parseInt(document.getElementById('std-sw-stroke-custom').value || '0', 10);
                            const sw_str_txt = (!isNaN(swStrokeCustomVal) && swStrokeCustomVal > 0)
                                ? `${swStrokeCustomVal}ST 입력 (적용 ${Math.ceil(swStrokeCustomVal / 50) * 50}ST)`
                                : document.getElementById('std-sw-stroke').selectedOptions[0].text;
                            const sw_rType_txt = document.getElementById('std-sw-rod-type').selectedOptions[0].text;
                            const sw_sensor_txt = document.getElementById('std-sw-proximity-sensor').checked ? ' + 근접센서' : '';
                            const sw_details = `${sw_dia_txt}, ${sw_str_txt}, ${sw_rType_txt}${sw_sensor_txt}`;
                            item = {
                                name: '표준 실린더 (스위치)',
                                details: sw_details,
                                basePrice: document.getElementById('std-sw-price-display').textContent,
                                margin: `${document.getElementById('std-sw-margin-input').value}%`,
                                finalPrice: document.getElementById('std-sw-final-total-display').textContent,
                                timestamp: new Date().toISOString(),
                                calcType: 'cylinder'
                            };
                            break;

                        case 'content-cmp':
                            const cmp_type_txt = document.getElementById('cmp-cylinderType').value;
                            const cmp_dia_val = document.getElementById('cmp-diameter').value;
                            const cmp_str_val = document.getElementById('cmp-stroke').value;
                            let cmp_options_arr = [];
                            document.querySelectorAll('#cmp-optionsContainer input:checked').forEach(opt => {
                                cmp_options_arr.push(opt.parentElement.textContent.trim().split(' ')[0]);
                            });
                            const cmp_details = `${cmp_type_txt} ø${cmp_dia_val}, ${cmp_str_val}ST, 옵션: ${cmp_options_arr.join(', ') || '없음'}`;
                            const cmp_basePriceEl = document.querySelector('#cmp-result p');
                            item = {
                                name: '박형 실린더',
                                details: cmp_details,
                                basePrice: cmp_basePriceEl ? cmp_basePriceEl.textContent : '₩ 0',
                                discount: `${document.getElementById('cmp-discount-select').value}%`,
                                finalPrice: document.getElementById('cmp-final-total-display').textContent,
                                timestamp: new Date().toISOString(),
                                calcType: 'cylinder_discount'
                            };
                            break;

                        case 'content-valve':
                            const card = document.querySelector('#valve-price-card-wrapper .valve-price-card');
                            if (card && card.dataset.historyItem) {
                                item = JSON.parse(card.dataset.historyItem);
                            }
                            break;
                    }

                    let isValidForHistory = false;
                    if (item) {
                        if (item.calcType === 'valve') {
                            if (item.price && item.price.dealer && !item.price.dealer.includes('문의') && !item.price.dealer.includes('단종')) {
                                isValidForHistory = true;
                            }
                        } else if (item.finalPrice && item.finalPrice !== '₩ 0' && !item.finalPrice.includes('문의') && !item.finalPrice.includes('단종')) {
                            isValidForHistory = true;
                        }
                    }

                    if (isValidForHistory) {
                        const type = activeContent.id.replace('content-', '');
                        addToHistory(item, type);
                        saveCurrentHistoryBtn.textContent = '저장됨!';
                        setTimeout(() => {
                            saveCurrentHistoryBtn.textContent = '기록';
                        }, 1000);
                    } else {
                        alert('기록할 유효한 견적 내용이 없습니다.');
                    }
                });


                // 기록 패널 닫기 버튼
                closeHistoryPanelBtn.addEventListener('click', () => {
                    historyPanel.classList.add('hidden');
                });

                // 기록 전체 삭제 버튼
                // 추가할 부분 시작
                // 기록 전체 삭제 버튼
                clearHistoryBtn.addEventListener('click', () => {
                    if (confirm('정말로 모든 기록을 삭제하시겠습니까?')) {
                        const type = historyPanel.dataset.currentType;
                        if (type) {
                            clearHistory(type);
                        }
                    }
                });
                // 패널 바깥 영역 클릭 시 닫기
                historyPanel.addEventListener('click', (e) => {
                    if (e.target === historyPanel) {
                        historyPanel.classList.add('hidden');
                    }
                });

                // saveAndShowHistory 함수는 더 이상 직접 사용되지 않으므로 삭제하거나 주석 처리합니다.
                /*
                function saveAndShowHistory(item) {
                    if (item && item.price && item.price !== '₩ 0' && !item.price.includes('문의') && !item.price.includes('단종')) {
                        addToHistory(item);
                    }
                    renderHistory();
                    historyPanel.classList.remove('hidden');
                }
                */
                // --- Event Listeners ---

                // Main menu buttons now use the new navigation function
                selectStdBtn.addEventListener('click', () => navigateToCalculator('std'));
                selectStdSwBtn.addEventListener('click', () => navigateToCalculator('std-sw'));
                selectCmpBtn.addEventListener('click', () => navigateToCalculator('cmp'));
                selectValveBtn.addEventListener('click', () => navigateToCalculator('valve'));
                selectContactLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    navigateToCalculator('contact');
                });
                if (copyUrlBtn) {
                    copyUrlBtn.addEventListener('click', async () => {
                        const originalText = '주소복사';
                        const shareUrl = window.location.href.split('#')[0];
                        try {
                            if (navigator.clipboard && window.isSecureContext) {
                                await navigator.clipboard.writeText(shareUrl);
                            } else {
                                const temp = document.createElement('textarea');
                                temp.value = shareUrl;
                                temp.setAttribute('readonly', '');
                                temp.style.position = 'fixed';
                                temp.style.opacity = '0';
                                document.body.appendChild(temp);
                                temp.focus();
                                temp.select();
                                const copied = document.execCommand('copy');
                                document.body.removeChild(temp);
                                if (!copied) throw new Error('copy_failed');
                            }
                            copyUrlBtn.textContent = '복사완료';
                        } catch (error) {
                            copyUrlBtn.textContent = '복사실패';
                        }
                        setTimeout(() => {
                            copyUrlBtn.textContent = originalText;
                        }, 1200);
                    });
                }

                // On-screen back buttons now use the browser's history function
                backButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        history.back(); // This will trigger the 'popstate' event listener
                    });
                });

                // Tab switching inside the calculator should not create new history entries
                tabs.forEach(tab => {
                    tab.addEventListener('click', () => {
                        const requestedType = tab.id.replace('tab-', '');
                        if (!isTypeAllowed(requestedType)) {
                            return;
                        }
                        const type = getFallbackType(requestedType);

                        // Just show the new tab content
                        contents.forEach(c => c.classList.remove('active'));
                        document.getElementById(`content-${type}`).classList.add('active');

                        // Update the active tab button style
                        tabs.forEach(t => t.classList.remove('active'));
                        tab.classList.add('active');

                        // Update the URL and state without adding to history
                        history.replaceState({ screen: 'calculator', type: type }, 'Calculator', `#${type}`);
                        if (type === 'contact') {
                            setupContactPage();
                        }
                    });
                });

                // --- ALL ORIGINAL CALCULATOR LOGIC REMAINS BELOW, UNCHANGED ---

                // --- Quantity Input Logic ---
                function setupQuantityButtons() {
                    document.querySelectorAll('.quantity-plus').forEach(button => {
                        button.addEventListener('click', () => {
                            const input = document.getElementById(button.dataset.inputId);
                            input.value = parseInt(input.value, 10) + 1;
                            input.dispatchEvent(new Event('input')); // Trigger calculation
                            input.dispatchEvent(new Event('change')); // Trigger calculation for other scripts
                        });
                    });

                    document.querySelectorAll('.quantity-minus').forEach(button => {
                        button.addEventListener('click', () => {
                            const input = document.getElementById(button.dataset.inputId);
                            const currentValue = parseInt(input.value, 10);
                            if (currentValue > 1) {
                                input.value = currentValue - 1;
                                input.dispatchEvent(new Event('input')); // Trigger calculation
                                input.dispatchEvent(new Event('change')); // Trigger calculation for other scripts
                            }
                        });
                    });
                }
                setupQuantityButtons();

                

                


                // --- Compact Cylinder Calculator Logic ---
                
                
                // --- Floating Back Button Click Event ---
                if (floatingBtn) {

                    floatingBtn.addEventListener('click', () => {
                        history.back();
                    });
                }
});
