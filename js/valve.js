document.addEventListener('DOMContentLoaded', function () {
    // --- TKP Valve Calculator Logic ---
                (function () {
                    // Check if the valve content container exists before running
                    if (!document.getElementById('content-valve')) return;

                    const priceData = valvePriceData;

                    const searchInput = document.getElementById('valve-search-input');
                    const categorySelect = document.getElementById('valve-category-select');
                    const specSelect = document.getElementById('valve-spec-select');
                    const priceCardWrapper = document.getElementById('valve-price-card-wrapper');
                    const noResultsMessage = document.getElementById('valve-no-results-message');

                    function initializeValveCalculator() {
                        const allCategories = [...new Set(priceData.map(item => item.category))].sort();
                        populateCategories(allCategories);

                        searchInput.addEventListener('input', handleSearch);
                        // 새로 추가한 '찾기' 버튼과 엔터 키에 대한 이벤트 리스너
                        const searchButton = document.getElementById('valve-search-button');

                        searchButton.addEventListener('click', handleSearch);

                        searchInput.addEventListener('keydown', (event) => {
                            if (event.key === 'Enter') {
                                event.preventDefault(); // 기본 엔터 동작(폼 제출 등) 방지
                                handleSearch();
                            }
                        });
                        categorySelect.addEventListener('change', handleCategoryChange);
                        specSelect.addEventListener('change', handleSpecChange);
                    }

                    function handleSearch() {
                        priceCardWrapper.innerHTML = '';
                        const query = searchInput.value.toLowerCase().trim();

                        if (query.length < 2) {
                            const allCategories = [...new Set(priceData.map(item => item.category))].sort();
                            populateCategories(allCategories);
                            populateSpecs(null, []);
                            noResultsMessage.style.display = 'none';
                            return;
                        }

                        const filteredData = filterData(query);

                        noResultsMessage.style.display = filteredData.length === 0 ? 'block' : 'none';

                        populateSpecsFromSearch(filteredData);

                        const resultingCategories = [...new Set(filteredData.map(item => item.category))].sort();
                        populateCategories(resultingCategories);
                        if (resultingCategories.length > 0) {
                            categorySelect.value = resultingCategories[0];
                        }
                    }

                    function handleCategoryChange() {
                        const selectedCategory = categorySelect.value;
                        populateSpecs(selectedCategory, priceData);
                        priceCardWrapper.innerHTML = '';
                        searchInput.value = '';
                        noResultsMessage.style.display = 'none';
                    }

                    function handleSpecChange() {
                        const selectedValue = specSelect.value;
                        priceCardWrapper.innerHTML = '';

                        if (selectedValue) {
                            const [selectedSpec, selectedType, selectedCategory] = selectedValue.split('|');

                            // Sync category dropdown
                            if (categorySelect.value !== selectedCategory) {
                                categorySelect.value = selectedCategory;
                            }

                            const selectedItem = priceData.find(item =>
                                item.spec === selectedSpec &&
                                item.type === selectedType &&
                                item.category === selectedCategory
                            );

                            if (selectedItem) {
                                displayPrice(selectedItem);
                            }
                        }
                    }

                    function filterData(query) {
                        return priceData.filter(item =>
                            item.spec.toLowerCase().includes(query) ||
                            item.type.toLowerCase().includes(query) ||
                            item.category.toLowerCase().includes(query) ||
                            item.remarks.toLowerCase().includes(query)
                        );
                    }

                    function populateCategories(categories) {
                        const currentCategory = categorySelect.value;

                        categorySelect.innerHTML = '<option value="">-- 품목 전체 --</option>';
                        categories.forEach(category => {
                            const option = document.createElement('option');
                            option.value = category;
                            option.textContent = category;
                            categorySelect.appendChild(option);
                        });

                        if (categories.includes(currentCategory)) {
                            categorySelect.value = currentCategory;
                        }
                    }

                    function populateSpecsFromSearch(data) {
                        specSelect.innerHTML = '<option value="">-- 규격을 선택하세요 --</option>';
                        if (data.length > 0) {
                            specSelect.disabled = false;
                            data.forEach(item => {
                                const option = document.createElement('option');
                                option.value = `${item.spec}|${item.type}|${item.category}`;
                                option.textContent = `${item.spec} (${item.type})`;
                                specSelect.appendChild(option);
                            });
                        } else {
                            specSelect.disabled = true;
                            specSelect.innerHTML = '<option value="">-- 검색 결과 없음 --</option>';
                        }
                    }

                    function populateSpecs(category, data) {
                        specSelect.innerHTML = '<option value="">-- 규격을 선택하세요 --</option>';
                        if (category) {
                            specSelect.disabled = false;
                            const specs = data.filter(item => item.category === category);
                            specs.forEach(item => {
                                const option = document.createElement('option');
                                option.value = `${item.spec}|${item.type}|${item.category}`;
                                option.textContent = `${item.spec} (${item.type})`;
                                specSelect.appendChild(option);
                            });
                        } else {
                            specSelect.disabled = true;
                            specSelect.innerHTML = '<option value="">-- 품목을 먼저 선택하세요 --</option>';
                        }
                    }

                    function displayPrice(item) {
                        const card = document.createElement('div');
                        card.className = 'valve-price-card bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-md mt-4';

                        const formatPrice = (price) => {
                            if (!price || price.includes('문의') || price.includes('단종')) {
                                return `<span class="text-amber-400">${price}</span>`;
                            }
                            return `₩ ${price}`;
                        };

                        card.innerHTML = `
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <div>
                        <h2 class="text-2xl font-bold text-sky-400">${item.spec}</h2>
                        <p class="text-gray-400">${item.category} / ${item.type}</p>
                    </div>
                    ${item.remarks ? `<div class="mt-2 md:mt-0 md:ml-4 text-right"><span class="inline-block bg-teal-900 text-teal-300 text-sm font-medium px-3 py-1 rounded-full">${item.remarks}</span></div>` : ''}
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div class="bg-gray-900 p-4 rounded-lg shadow-sm">
                        <p class="text-sm text-gray-400">대리점가</p>
                        <p class="text-xl font-semibold text-gray-100">${formatPrice(item.dealerPrice)}</p>
                    </div>
                    <div class="bg-gray-900 p-4 rounded-lg shadow-sm">
                        <p class="text-sm text-gray-400">유압상 판매가</p>
                        <p class="text-xl font-semibold text-green-400">${formatPrice(item.hydraulicPrice)}</p>
                    </div>
                    <div class="bg-gray-900 p-4 rounded-lg shadow-sm">
                        <p class="text-sm text-gray-400">일반상 판매가</p>
                        <p class="text-xl font-semibold text-yellow-400">${formatPrice(item.generalPrice)}</p>
                    </div>
                </div>
            `;

                        priceCardWrapper.appendChild(card);
                        // 계산된 아이템 정보를 카드 자체에 데이터로 저장합니다.
                        card.dataset.historyItem = JSON.stringify({
                            name: `${item.category}`,
                            details: `${item.spec} (${item.type})`,
                            // price 항목을 객체로 변경하여 3가지 가격 모두 저장
                            price: {
                                dealer: item.dealerPrice,
                                hydraulic: item.hydraulicPrice,
                                general: item.generalPrice
                            },
                            timestamp: new Date().toISOString(),
                            calcType: 'valve' // 밸브 계산기 기록임을 명시
                        });
                        setTimeout(() => {
                            card.classList.add('show');
                        }, 10);
                    }

                    // Initialize the calculator logic when the DOM is ready
                    initializeValveCalculator();
                })();
});
