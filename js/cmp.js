document.addEventListener('DOMContentLoaded', function () {
    (function () {
                    if (!document.getElementById('content-cmp')) return;
                    
                    const cylinderTypeEl = document.getElementById('cmp-cylinderType'), diameterEl = document.getElementById('cmp-diameter'), strokeEl = document.getElementById('cmp-stroke'), optionsContainerEl = document.getElementById('cmp-optionsContainer'), resultEl = document.getElementById('cmp-result'), notesEl = document.getElementById('cmp-notes'), discountSelect = document.getElementById('cmp-discount-select'), quantityInput = document.getElementById('cmp-quantity-input'), discountedPriceDisplay = document.getElementById('cmp-discounted-price-display'), finalTotalDisplay = document.getElementById('cmp-final-total-display');

                    function formatNumber(num) { return num.toLocaleString('ko-KR'); }
                    function populateStrokeOptions() { strokeEl.innerHTML = '<option value="0">선택하세요</option>'; for (let i = 10; i <= 120; i += 10) { strokeEl.add(new Option(`${i} mm`, i)); } }
                    function updateDiameterOptions() {
                        const selectedType = cylinderTypeEl.value;
                        if (!cmpPriceData[selectedType]) { return; } // Error guard
                        const diameters = Object.keys(cmpPriceData[selectedType].prices);
                        diameterEl.innerHTML = '';
                        diameters.forEach(dia => diameterEl.add(new Option(`ø${dia}`, dia)));
                        updateOptions();
                        calculatePrice();
                    }
                    function updateOptions() {
                        const selectedType = cylinderTypeEl.value, selectedDiameter = diameterEl.value, modelData = cmpPriceData[selectedType];
                        optionsContainerEl.innerHTML = '';
                        Object.keys(modelData.multipliers).forEach(key => {
                            const id = `cmp-option-${key}`, label = document.createElement('label');
                            label.className = 'calc-option-label flex items-center cursor-pointer';
                            label.innerHTML = `<input type="checkbox" id="${id}" class="h-4 w-4 rounded border-gray-500 text-cyan-600 focus:ring-cyan-500 bg-gray-600"> ${key} (x${modelData.multipliers[key]})`;
                            optionsContainerEl.appendChild(label);
                            document.getElementById(id).addEventListener('change', calculatePrice);
                        });
                        Object.keys(modelData.options).forEach(key => {
                            if (key === '10ST' || !modelData.options[key][selectedDiameter]) return;
                            const id = `cmp-option-${key}`, price = modelData.options[key][selectedDiameter];
                            let labelText = `${key} (+${price.toLocaleString()}원)`;
                            if (key === '근접센서') {
                                labelText = `근접센서 2개 (+${price.toLocaleString()}원)`;
                            }
                            const label = document.createElement('label');
                            label.className = 'calc-option-label flex items-center cursor-pointer';
                            label.innerHTML = `<input type="checkbox" id="${id}" class="h-4 w-4 rounded border-gray-500 text-cyan-600 focus:ring-cyan-500 bg-gray-600"> ${labelText}`;
                            optionsContainerEl.appendChild(label);
                            document.getElementById(id).addEventListener('change', calculatePrice);
                        });
                    }

                    function calculatePrice() {
                        const selectedType = cylinderTypeEl.value, selectedDiameter = diameterEl.value, stroke = parseInt(strokeEl.value, 10);
                        const discount = parseFloat(discountSelect.value), quantity = parseInt(quantityInput.value) || 1;

                        if (!selectedDiameter || !stroke || stroke <= 0) {
                            resultEl.innerHTML = `<p class="text-lg text-gray-500">박형실린더  대리점  판매가격.</p>`;
                            discountedPriceDisplay.textContent = '₩ 0';
                            finalTotalDisplay.textContent = '₩ 0';
                            return;
                        }
                        const modelData = cmpPriceData[selectedType], pricesForDiameter = modelData.prices[selectedDiameter];
                        let basePrice = 0, calculationDetails = [];
                        const quoteLimit = modelData.rules.quote_needed[selectedDiameter];
                        if (quoteLimit && stroke > quoteLimit) {
                            resultEl.innerHTML = `<p class="text-xl font-bold text-red-500">별도 견적 필요</p><p class="text-sm text-gray-500">ST ${quoteLimit}mm 초과</p>`;
                            discountedPriceDisplay.textContent = '₩ 0'; finalTotalDisplay.textContent = '₩ 0'; return;
                        }
                        if (pricesForDiameter[stroke]) {
                            basePrice = pricesForDiameter[stroke];
                            calculationDetails.push(`기본 (${stroke}ST): ${formatNumber(basePrice)}`);
                        } else {
                            const availableStrokes = Object.keys(pricesForDiameter).map(Number), maxTableStroke = Math.max(...availableStrokes);
                            if (stroke > maxTableStroke) {
                                const basePriceAtMaxStroke = pricesForDiameter[maxTableStroke], extraStroke = stroke - maxTableStroke, pricePer10St = modelData.options['10ST'][selectedDiameter];
                                if (pricePer10St) {
                                    const extraPrice = (extraStroke / 10) * pricePer10St;
                                    basePrice = basePriceAtMaxStroke + extraPrice;
                                    calculationDetails.push(`기본 (${maxTableStroke}ST): ${formatNumber(basePriceAtMaxStroke)}`);
                                    calculationDetails.push(`추가 (${extraStroke}ST): ${formatNumber(extraPrice)}`);
                                } else {
                                    resultEl.innerHTML = `<p class="text-xl font-bold text-red-500">계산 불가</p><p class="text-sm text-gray-600">추가 ST 가격 정보 없음</p>`;
                                    discountedPriceDisplay.textContent = '₩ 0'; finalTotalDisplay.textContent = '₩ 0'; return;
                                }
                            } else {
                                resultEl.innerHTML = `<p class="text-xl font-bold text-red-500">계산 불가</p><p class="text-sm text-gray-600">해당 ST 가격 정보 없음</p>`;
                                discountedPriceDisplay.textContent = '₩ 0'; finalTotalDisplay.textContent = '₩ 0'; return;
                            }
                        }
                        let subTotal = basePrice;
                        Object.keys(modelData.multipliers).forEach(key => {
                            const checkbox = document.getElementById(`cmp-option-${key}`);
                            if (checkbox && checkbox.checked) {
                                const multiplier = modelData.multipliers[key], multipliedAmount = subTotal * (multiplier - 1);
                                subTotal += multipliedAmount;
                                calculationDetails.push(`${key}: +${formatNumber(Math.round(multipliedAmount))} (x${multiplier})`);
                            }
                        });
                        Object.keys(modelData.options).forEach(key => {
                            if (key === '10ST') return;
                            const checkbox = document.getElementById(`cmp-option-${key}`);
                            if (checkbox && checkbox.checked) {
                                const optionPrice = modelData.options[key][selectedDiameter];
                                subTotal += optionPrice;
                                let optionText = key;
                                if (key === '근접센서') optionText = '근접센서 2개';
                                calculationDetails.push(`${optionText}: +${formatNumber(optionPrice)}`);
                            }
                        });
                        resultEl.innerHTML = `<h2 class="text-xl font-semibold text-center text-gray-200 mb-2">박형실린더 대리점 판매가격</h2><p class="text-3xl font-bold text-cyan-400">₩ ${formatNumber(Math.round(subTotal))}</p><div class="text-xs text-gray-400 mt-3 text-left w-full">${calculationDetails.join('<br>')}</div>`;
                        const discountedPrice = Math.round(subTotal * (1 - discount / 100));
                        discountedPriceDisplay.textContent = `₩ ${formatNumber(discountedPrice)}`;
                        const finalTotal = discountedPrice * quantity;
                        finalTotalDisplay.textContent = `₩ ${formatNumber(finalTotal)}`;
                    }
                    function initialize() {
                        if (!document.getElementById('content-cmp')) return;
                        [cylinderTypeEl, diameterEl, strokeEl, discountSelect, quantityInput].forEach(el => {
                            if (el) {
                                const eventType = el.tagName === 'INPUT' ? 'input' : 'change';
                                el.addEventListener(eventType, calculatePrice);
                            }
                        });
                        cylinderTypeEl.addEventListener('change', updateDiameterOptions);
                        diameterEl.addEventListener('change', () => {
                            updateOptions();
                            calculatePrice();
                        });
                        populateStrokeOptions();
                        updateDiameterOptions();
                    }
                    initialize();
                })();
});
