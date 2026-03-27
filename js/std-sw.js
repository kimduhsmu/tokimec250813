document.addEventListener('DOMContentLoaded', function () {
    (function () {
                    if (!document.getElementById('content-std-sw')) return;

                    // 새로운 스위치 타입 가격 데이터 (2024-03-01 기준)
                    

                    // 표준 실린더와 동일한 지지형식 데이터
                    
                    // 표준 실린더와 동일한 선단금구 데이터
                    
                    
                    
                    // 자바라 단가 매트릭스 (내경/로드경/스트로크)
                    
                    
                    
                    
                    
                    
                    
                    for (let st = 50; st <= 1000; st += 50) {
                        stdSwBellowsInquiryStrokeMap[String(st)] = 'inquiry';
                    }
                    

                    function resolveBellowsPrice(matrix, dia, rodType, stroke) {
                        const diaData = matrix[dia];
                        if (!diaData) return null;
                        const strokeKey = String(stroke);
                        if (rodType === 'A') {
                            return { price: 'inquiry', appliedType: 'A' };
                        }
                        const typeData = diaData[rodType];
                        if (!typeData) return null;
                        if (!Object.prototype.hasOwnProperty.call(typeData, strokeKey)) return null;
                        return { price: typeData[strokeKey], appliedType: rodType };
                    }

                    const elements = {
                        diameter: document.getElementById('std-sw-diameter'), stroke: document.getElementById('std-sw-stroke'), strokeCustom: document.getElementById('std-sw-stroke-custom'), rodType: document.getElementById('std-sw-rod-type'),
                        statusNote: document.getElementById('std-sw-status-note'),
                        mounting: document.getElementById('std-sw-mounting'), special: document.getElementById('std-sw-special'), cushion: document.getElementById('std-sw-cushion'),
                        bellowsEnabled: document.getElementById('std-sw-bellows-enabled'), bellowsMaterialOptions: document.getElementById('std-sw-bellows-material-options'),
                        bellowsGeneral: document.getElementById('std-sw-bellows-general'), bellowsHeat: document.getElementById('std-sw-bellows-heat'),
                        rodExtensionEnabled: document.getElementById('std-sw-rod-extension-enabled'), rodExtensionMm: document.getElementById('std-sw-rod-extension-mm'), rodExtensionCustom: document.getElementById('std-sw-rod-extension-custom'),
                        cushionLabel: document.getElementById('std-sw-cushion-label'), priceDisplay: document.getElementById('std-sw-price-display'),
                        specSummary: document.getElementById('std-sw-spec-summary'),
                        priceBreakdown: document.getElementById('std-sw-price-breakdown'), marginInput: document.getElementById('std-sw-margin-input'),
                        quantityInput: document.getElementById('std-sw-quantity-input'), sellingPriceDisplay: document.getElementById('std-sw-selling-price-display'), finalTotalDisplay: document.getElementById('std-sw-final-total-display'),
                        rodEndFitting1: document.getElementById('std-sw-rod-end-fitting-1'), rodEndFitting2: document.getElementById('std-sw-rod-end-fitting-2'), proximitySensor: document.getElementById('std-sw-proximity-sensor'),
                    };

                    function formatNumber(num) { return num.toLocaleString('ko-KR'); }
                    function updateStdSwStatusNote() {
                        if (!elements.statusNote) return;
                        const customStrokeVal = parseInt(elements.strokeCustom.value || '0', 10);
                        const selectedStrokeVal = parseInt(elements.stroke.value || '0', 10);
                        const appliedStrokeVal = !isNaN(customStrokeVal) && customStrokeVal > 0 ? customStrokeVal : selectedStrokeVal;
                        if (elements.diameter.value === '40' && elements.rodType.value === 'A') {
                            elements.statusNote.textContent = '40파이 A(초강력)은 표준 구조상 표준부품사용이 불가하며 담당자에게 제작 견적을 문의해 주세요';
                            elements.statusNote.classList.remove('hidden');
                            return;
                        }
                        if (appliedStrokeVal >= 1000) {
                            elements.statusNote.textContent = '중간지지대 포함시 별도의 비용이 추가됩니다.';
                            elements.statusNote.classList.remove('hidden');
                            return;
                        }
                        elements.statusNote.textContent = '';
                        elements.statusNote.classList.add('hidden');
                    }
                    function shortOptionCode(rawValue, emptyFallback) {
                        if (!rawValue || rawValue === '0' || rawValue === 'none') return emptyFallback;
                        return String(rawValue).split('+')[0].split('/')[0];
                    }
                    function updateStdSwSpecSummary() {
                        if (!elements.specSummary) return;
                        const customStrokeVal = parseInt(elements.strokeCustom.value || '0', 10);
                        const hasCustomStroke = !isNaN(customStrokeVal) && customStrokeVal > 0;
                        const hasSelectStroke = elements.stroke.value && elements.stroke.value !== '0';
                        const strokeCode = hasCustomStroke ? String(customStrokeVal) : (hasSelectStroke ? elements.stroke.value : '-');
                        const mountingCode = shortOptionCode(elements.mounting.value, 'SD');
                        const diaCode = elements.diameter.value !== '0' ? elements.diameter.value : '-';
                        const rodTypeCode = elements.rodType.value !== '0' ? elements.rodType.value : '-';
                        const cushionCode = elements.cushion.checked ? 'B' : 'N';
                        const rodEnd1 = shortOptionCode(elements.rodEndFitting1.value, 'N');
                        const rodEnd2 = shortOptionCode(elements.rodEndFitting2.value, '');
                        const specialText = elements.special.options[elements.special.selectedIndex]?.text || '';
                        const isWType = specialText.includes('W') || specialText.includes('SJ');
                        const headerCode = isWType ? 'TJ14LW' : 'TJ14L';
                        const isReady = diaCode !== '-' && rodTypeCode !== '-' && mountingCode !== '-' && strokeCode !== '-';
                        if (!isReady) {
                            elements.specSummary.classList.add('hidden');
                            elements.specSummary.textContent = '';
                            return;
                        }
                        const optionalTokens = [];
                        if (rodEnd2) optionalTokens.push(rodEnd2);
                        if (elements.bellowsEnabled.checked) optionalTokens.push('J');
                        const optionalText = optionalTokens.length > 0 ? ` ${optionalTokens.join(' ')}` : '';
                        elements.specSummary.classList.remove('hidden');
                        elements.specSummary.textContent = `${headerCode} ${mountingCode} ${diaCode} ${rodTypeCode}-${cushionCode} ${strokeCode}-${rodEnd1}${optionalText}`;
                    }








                    function calculatePrice() {
                        const dia = elements.diameter.value;
                        const customStrokeVal = parseInt(elements.strokeCustom.value || '0', 10);
                        const usingCustomStroke = !isNaN(customStrokeVal) && customStrokeVal > 0;
                        const str = usingCustomStroke ? String(customStrokeVal) : elements.stroke.value;
                        const rType = elements.rodType.value;
                        updateStdSwSpecSummary();
                        updateStdSwStatusNote();

                        if (dia === '0' || !str || str === '0' || rType === '0') {
                            elements.priceDisplay.textContent = '₩ 0';
                            elements.priceBreakdown.textContent = '기본 사양을 모두 선택해주세요.';
                            elements.sellingPriceDisplay.textContent = '₩ 0';
                            elements.finalTotalDisplay.textContent = '₩ 0';
                            return;
                        }

                        const spcCheck = parseFloat(elements.special.value);
                        let strVal = parseInt(str, 10);
                        if (isNaN(strVal) || strVal < 0) strVal = 0;

                        if (dia === '40' && rType === 'A') {
                            elements.priceDisplay.textContent = '문의';
                            elements.priceBreakdown.textContent = '';
                            elements.sellingPriceDisplay.textContent = '문의';
                            elements.finalTotalDisplay.textContent = '문의';
                            return;
                        }

                        if (strVal > 1000 && (spcCheck === 1.55 || spcCheck === 1.35)) {
                            elements.priceDisplay.textContent = '담당자에게 문의';
                            elements.priceBreakdown.textContent = '1000ST 초과 시 SJ/W(양로드) 사양은 담당자에게 문의';
                            elements.sellingPriceDisplay.textContent = '담당자에게 문의';
                            elements.finalTotalDisplay.textContent = '담당자에게 문의';
                            return;
                        }

                        let calcStr = strVal;
                        let extraRates = 0;
                        let overStrokeApplied = 0;
                        if (strVal > 1000) {
                            calcStr = 1000;
                            const over1000Rates = {
                                '40': { 'C': 15700, 'B': 15700 },
                                '50': { 'C': 16400, 'B': 16400 },
                                '63': { 'C': 20200, 'B': 20200 },
                                '80': { 'C': 25000, 'B': 25000 },
                                '100': { 'C': 37700, 'B': 37700 },
                                '125': { 'C': 66800, 'B': 66800 }
                            };
                            let chunkCount = Math.ceil((strVal - 1000) / 50);
                            overStrokeApplied = chunkCount * 50;
                            let rateMap = over1000Rates[dia] || { 'C': 0, 'B': 0 };
                            let unitRate = rType === 'A' ? Math.round((rateMap['B'] || 0) * 1.3) : (rateMap[rType] || 0);
                            extraRates = chunkCount * unitRate;
                        } else if (strVal > 0) {
                            calcStr = Math.ceil(strVal / 50) * 50;
                        }

                        let basePrice = stdSwPriceData[dia]?.[calcStr.toString()];

                        if (basePrice === undefined) {
                            elements.priceDisplay.textContent = '선택 불가';
                            elements.priceBreakdown.textContent = '해당 조합의 가격 정보가 없습니다.';
                            elements.sellingPriceDisplay.textContent = '₩ 0';
                            elements.finalTotalDisplay.textContent = '₩ 0';
                            return;
                        }
                        if (extraRates > 0) {
                            basePrice += extraRates;
                        }

                        const mnt = elements.mounting.value;
                        const ref1 = elements.rodEndFitting1.value;
                        const ref2 = elements.rodEndFitting2.value;
                        const spc = parseFloat(elements.special.value);
                        const bellowsEnabled = elements.bellowsEnabled.checked;
                        const isBellowsHeat = elements.bellowsHeat.checked;
                        const bellowsMultiplier = isBellowsHeat ? 2 : 1;
                        const csh = elements.cushion.checked;
                        const sensor = elements.proximitySensor.checked;
                        const rexEnabled = elements.rodExtensionEnabled.checked;
                        const rexCustomVal = parseInt(elements.rodExtensionCustom.value || '0', 10);
                        const rexUsingCustom = !isNaN(rexCustomVal) && rexCustomVal > 0;
                        const rexInputMm = rexUsingCustom ? rexCustomVal : (parseInt(elements.rodExtensionMm.value || '0', 10) || 0);
                        const quantity = parseInt(elements.quantityInput.value) || 1;

                        if (spc > 1) {
                            basePrice = Math.round(basePrice * spc);
                        }
                        if (bellowsEnabled && strVal > 1000) {
                            elements.priceDisplay.textContent = '문의';
                            elements.priceBreakdown.textContent = '자바라 1000ST 초과는 담당자 문의';
                            elements.sellingPriceDisplay.textContent = '문의';
                            elements.finalTotalDisplay.textContent = '문의';
                            return;
                        }

                        let mountingPrice = (mnt !== 'none' && stdSwMountingData[mnt]?.[dia]) ? stdSwMountingData[mnt][dia] : 0;
                        let rodEndFittingPrice1 = (ref1 !== 'none' && stdSwRodEndFittingData[ref1]?.[dia]) ? stdSwRodEndFittingData[ref1][dia] : 0;
                        let rodEndFittingPrice2 = (ref2 !== 'none' && stdSwRodEndFittingData[ref2]?.[dia]) ? stdSwRodEndFittingData[ref2][dia] : 0;
                        let cushionPrice = (csh && stdSwCushionData[dia]) ? stdSwCushionData[dia] : 0;
                        let sensorPrice = sensor ? proximitySensorPrice : 0;
                        let rodExtensionPrice = 0;
                        let bellowsPrice = 0;
                        let appliedBellowsStroke = 0;
                        let rexAppliedMm = 0;
                        let rexBlocks = 0;
                        let rexUnitRate = 0;
                        if (rexEnabled && !isNaN(rexInputMm) && rexInputMm > 0) {
                            rexAppliedMm = Math.ceil(rexInputMm / 50) * 50;
                            rexBlocks = rexAppliedMm / 50;
                            rexUnitRate = stdSwRodExtensionRateData[dia] || 0;
                            rodExtensionPrice = rexBlocks * rexUnitRate;
                        }

                        if (bellowsEnabled) {
                            const bellowsLookupStroke = Math.min(calcStr, 1000);
                            const bellowsLookup = resolveBellowsPrice(stdSwBellowsPriceData, dia, rType, bellowsLookupStroke);
                            if (!bellowsLookup) {
                                elements.priceDisplay.textContent = '문의';
                                elements.priceBreakdown.textContent = `자바라 ${dia}Ø ${rType}형 ${bellowsLookupStroke}ST 단가 데이터 없음 (담당자 문의)`;
                                elements.sellingPriceDisplay.textContent = '문의';
                                elements.finalTotalDisplay.textContent = '문의';
                                return;
                            }
                            if (bellowsLookup && bellowsLookup.price === 'inquiry') {
                                elements.priceDisplay.textContent = '문의';
                                elements.priceBreakdown.textContent = `자바라 ${dia}Ø ${rType}형 ${bellowsLookupStroke}ST: 문의`;
                                elements.sellingPriceDisplay.textContent = '문의';
                                elements.finalTotalDisplay.textContent = '문의';
                                return;
                            }
                            if (bellowsLookup) {
                                const baseBellowsPrice = Number(bellowsLookup.price) || 0;
                                bellowsPrice = baseBellowsPrice * bellowsMultiplier;
                                if (bellowsPrice > 0) {
                                    appliedBellowsStroke = bellowsLookupStroke;
                                }
                            }
                        }

                        let subTotal = basePrice + mountingPrice + rodEndFittingPrice1 + rodEndFittingPrice2 + sensorPrice + cushionPrice + rodExtensionPrice + bellowsPrice;

                        let breakdown = [];
                        let specialName = elements.special.options[elements.special.selectedIndex].text;
                        let rodTypeName = elements.rodType.options[elements.rodType.selectedIndex]?.text || '';
                        let baseBreakdownText = rodTypeName ? `기본금액 (${rodTypeName})` : '기본금액';
                        if (spc > 1) { baseBreakdownText += ` + ${specialName.split(' ')[0]}`; }
                        breakdown.push(`${baseBreakdownText}: ${formatNumber(basePrice - extraRates)}`);
                        if (strVal > 1000) {
                            breakdown.push(`스트로크 적용: 입력 ${strVal}ST → 기준 1000ST + 초과 ${overStrokeApplied}ST`);
                        } else if (strVal !== calcStr) {
                            breakdown.push(`스트로크 적용: 입력 ${strVal}ST → 적용 ${calcStr}ST`);
                        }

                        if (extraRates > 0) {
                            breakdown.push(`추가 스트로크 금액: ${formatNumber(extraRates)}`);
                        }

                        if (mountingPrice > 0) breakdown.push(`지지형식: ${formatNumber(mountingPrice)}`);
                        if (rodEndFittingPrice1 > 0) breakdown.push(`선단금구1: ${formatNumber(rodEndFittingPrice1)}`);
                        if (rodEndFittingPrice2 > 0) breakdown.push(`선단금구2: ${formatNumber(rodEndFittingPrice2)}`);
                        if (cushionPrice > 0) breakdown.push(`쿠션: ${formatNumber(cushionPrice)}`);
                        if (sensorPrice > 0) breakdown.push(`근접센서: ${formatNumber(sensorPrice)}`);
                        if (rodExtensionPrice > 0) breakdown.push(`로드연장: 입력 ${rexInputMm}mm → 적용 ${rexAppliedMm}mm (${rexBlocks} x ${formatNumber(rexUnitRate)}) = ${formatNumber(rodExtensionPrice)}`);
                        if (bellowsPrice > 0) {
                            const bellowsMaterialLabel = isBellowsHeat ? '내열용(x2)' : '일반';
                            breakdown.push(`자바라(${bellowsMaterialLabel}): ${rType}형 ${appliedBellowsStroke}ST = ${formatNumber(bellowsPrice)}`);
                        }
                        if (breakdown.length > 0) breakdown.push(`제조원가 합계: ${formatNumber(subTotal)}`);

                        elements.priceDisplay.textContent = `₩ ${formatNumber(subTotal)}`;
                        elements.priceBreakdown.textContent = breakdown.join('\n');

                        const margin = parseFloat(elements.marginInput.value) || 0;
                        let sellingPrice = subTotal;
                        if (margin > 0 && margin < 100) {
                            sellingPrice = Math.round(subTotal / (1 - (margin / 100)));
                        }
                        elements.sellingPriceDisplay.textContent = `₩ ${formatNumber(sellingPrice)}`;
                        const finalTotal = sellingPrice * quantity;
                        elements.finalTotalDisplay.textContent = `₩ ${formatNumber(finalTotal)}`;
                    }


                    function updateRodTypeOptions() {
                        const currentType = elements.rodType.value;
                        elements.rodType.innerHTML = '<option value="0">로드경 선택</option>';
                        elements.rodType.add(new Option('C (일반)', 'C'));
                        elements.rodType.add(new Option('B (강력)', 'B'));

                        if (Array.from(elements.rodType.options).some(opt => opt.value === currentType)) {
                            elements.rodType.value = currentType;
                        }
                        elements.rodType.disabled = false;
                    }

                    function updateStrokeOptions() {
                        const dia = elements.diameter.value;
                        const currentStroke = elements.stroke.value;
                        elements.stroke.innerHTML = '<option value="0">스트로크 선택</option>';
                        const strokeKeys = new Set();
                        if (dia !== '0' && stdSwPriceData[dia]) {
                            Object.keys(stdSwPriceData[dia]).forEach(key => strokeKeys.add(Number(key)));
                        } else {
                            Object.values(stdSwPriceData).forEach(strokeMap => {
                                Object.keys(strokeMap || {}).forEach(key => strokeKeys.add(Number(key)));
                            });
                        }

                        Array.from(strokeKeys)
                            .sort((a, b) => a - b)
                            .forEach(str => elements.stroke.add(new Option(`${str} ST`, String(str))));

                        if (Array.from(elements.stroke.options).some(opt => opt.value === currentStroke)) {
                            elements.stroke.value = currentStroke;
                        } else {
                            elements.stroke.value = '0';
                        }
                        elements.stroke.disabled = false;
                    }
                    function updateRodExtensionOptions() {
                        const currentExtension = elements.rodExtensionMm.value;
                        elements.rodExtensionMm.innerHTML = '<option value="0">연장 선택</option>';
                        for (let mm = 50; mm <= 1000; mm += 50) {
                            elements.rodExtensionMm.add(new Option(`${mm} mm`, String(mm)));
                        }
                        if (Array.from(elements.rodExtensionMm.options).some(opt => opt.value === currentExtension)) {
                            elements.rodExtensionMm.value = currentExtension;
                        } else {
                            elements.rodExtensionMm.value = '0';
                        }
                    }

                    function updateCushionState() {
                        const dia = elements.diameter.value;
                        elements.cushion.disabled = false;
                        elements.cushion.removeAttribute('disabled');
                        elements.cushion.parentElement.parentElement.classList.remove('opacity-50');
                        if (dia !== '0' && stdSwCushionData.hasOwnProperty(dia)) {
                            elements.cushionLabel.textContent = `쿠션 추가 (+${formatNumber(stdSwCushionData[dia])}원)`;
                        } else {
                            elements.cushionLabel.textContent = '쿠션 추가';
                        }
                    }

                    function initialize() {
                        if (!document.getElementById('content-std-sw')) return;

                        // 직경 옵션
                        elements.diameter.innerHTML = '<option value="0">직경 선택</option>';
                        Object.keys(stdSwPriceData).forEach(dia => elements.diameter.add(new Option(`Ø ${dia}`, dia)));
                        updateRodExtensionOptions();

                        // 지지형식 옵션 (표준 실린더 데이터 기반)
                        elements.mounting.innerHTML = '';
                        const mountingOrder = ['none', 'LB', 'LA', 'TA', 'TC', 'FA/FB', 'FC/FD/FY/FZ', 'CA', 'CB', 'CB+PIN'];
                        const mountingNames = { 'none': 'SD(해당없음)', 'LB': 'LB (푸트형)', 'LA': 'LA', 'TA': 'TA (로드측 트러니온)', 'TC': 'TC (중간측 트러니온)', 'FA/FB': 'FA/FB (플랜지형)', 'FC/FD/FY/FZ': 'FC/FD/FY/FZ (플랜지형)', 'CA': 'CA (1산 크레비스)', 'CB': 'CB (2산 크레비스)', 'CB+PIN': 'CB(2산 크레비스) + PIN' };
                        mountingOrder.forEach(key => { if (stdSwMountingData[key]) { elements.mounting.add(new Option(mountingNames[key] || key, key)); } });

                        // 선단금구 옵션 (표준 실린더 데이터 기반)
                        elements.rodEndFitting1.innerHTML = '';
                        elements.rodEndFitting2.innerHTML = '';
                        const rodEndFittingOrder = ['none', 'Y', 'I', 'Y+PIN', 'CB+PIN', 'CA', 'CB', 'pin', 'locknut'];
                        const rodEndFittingNames = { 'none': '해당 없음', 'Y': 'Y (2산 너클)', 'I': 'I (1산 너클)', 'Y+PIN': 'Y(2산 너클) +PIN', 'CB+PIN': 'CB(2산 크레비스)+PIN', 'CA': 'CA (1산 크레비스)', 'CB': 'CB (2산 크레비스)', 'pin': 'PIN', 'locknut': '로크너트' };
                        rodEndFittingOrder.forEach(key => { if (stdSwRodEndFittingData[key]) { const optionName = rodEndFittingNames[key] || key; elements.rodEndFitting1.add(new Option(optionName, key)); elements.rodEndFitting2.add(new Option(optionName, key)); } });
                        const syncRodExtensionInputState = () => {
                            const isEnabled = elements.rodExtensionEnabled.checked;
                            elements.rodExtensionMm.disabled = !isEnabled;
                            elements.rodExtensionCustom.disabled = !isEnabled;
                            if (!elements.rodExtensionEnabled.checked) {
                                elements.rodExtensionMm.value = '0';
                                elements.rodExtensionCustom.value = '';
                            }
                        };
                        const syncBellowsMaterialSelection = (changedType) => {
                            if (changedType === 'general' && elements.bellowsGeneral.checked) {
                                elements.bellowsHeat.checked = false;
                            }
                            if (changedType === 'heat' && elements.bellowsHeat.checked) {
                                elements.bellowsGeneral.checked = false;
                            }
                            if (!elements.bellowsGeneral.checked && !elements.bellowsHeat.checked) {
                                elements.bellowsGeneral.checked = true;
                            }
                        };
                        const syncBellowsOptionState = () => {
                            const enabled = elements.bellowsEnabled.checked;
                            elements.bellowsGeneral.disabled = !enabled;
                            elements.bellowsHeat.disabled = !enabled;
                            if (elements.bellowsMaterialOptions) {
                                elements.bellowsMaterialOptions.classList.toggle('opacity-50', !enabled);
                            }
                            if (enabled) {
                                syncBellowsMaterialSelection();
                            }
                        };
                        syncBellowsMaterialSelection();
                        syncBellowsOptionState();
                        syncRodExtensionInputState();

                        // 이벤트 리스너
                        Object.values(elements).forEach(el => {
                            // 이익율 입력 필드는 버튼/엔터로만 계산하도록 목록에서 제외합니다.
                            if (el && el.id !== 'std-sw-margin-input' && el.id !== 'std-sw-rod-extension-enabled' && el.id !== 'std-sw-rod-extension-mm' && el.id !== 'std-sw-rod-extension-custom' && el.id !== 'std-sw-bellows-enabled' && el.id !== 'std-sw-bellows-general' && el.id !== 'std-sw-bellows-heat') {
                                el.addEventListener('change', calculatePrice);
                            }
                        });
                        elements.bellowsEnabled.addEventListener('change', () => {
                            syncBellowsOptionState();
                            calculatePrice();
                        });
                        elements.stroke.addEventListener('change', () => {
                            if (elements.stroke.value !== '0') {
                                elements.strokeCustom.value = '';
                            }
                            calculatePrice();
                        });
                        elements.strokeCustom.addEventListener('input', () => {
                            const hasValue = (elements.strokeCustom.value || '').trim() !== '';
                            if (hasValue) {
                                elements.stroke.value = '0';
                            }
                            calculatePrice();
                        });
                        elements.rodExtensionEnabled.addEventListener('change', () => {
                            syncRodExtensionInputState();
                            calculatePrice();
                        });
                        elements.rodExtensionMm.addEventListener('change', () => {
                            if (elements.rodExtensionMm.value !== '0') {
                                elements.rodExtensionCustom.value = '';
                            }
                            calculatePrice();
                        });
                        elements.rodExtensionCustom.addEventListener('input', () => {
                            const hasValue = (elements.rodExtensionCustom.value || '').trim() !== '';
                            if (hasValue) {
                                elements.rodExtensionMm.value = '0';
                            }
                            calculatePrice();
                        });
                        elements.bellowsGeneral.addEventListener('change', () => {
                            syncBellowsMaterialSelection('general');
                            calculatePrice();
                        });
                        elements.bellowsHeat.addEventListener('change', () => {
                            syncBellowsMaterialSelection('heat');
                            calculatePrice();
                        });
                        elements.quantityInput.addEventListener('input', calculatePrice);

                        // 이익율 입력창과 확인 버튼에 대한 특별 이벤트를 추가합니다.
                        const applyMarginBtn = document.getElementById('std-sw-apply-margin-btn');
                        const applyMargin = () => {
                            applyMarginBtn.textContent = '계산중...';
                            calculatePrice();
                            setTimeout(() => {
                                applyMarginBtn.textContent = '확인';
                            }, 500);
                        };

                        applyMarginBtn.addEventListener('click', applyMargin);
                        elements.marginInput.addEventListener('keydown', (event) => {
                            if (event.key === 'Enter') {
                                event.preventDefault();
                                applyMargin();
                            }
                        });

                        elements.diameter.addEventListener('change', () => {
                            updateStrokeOptions();
                            updateRodTypeOptions();
                            updateCushionState();
                            calculatePrice();
                        });

                        // 초기화
                        updateStrokeOptions();
                        updateRodTypeOptions();
                        updateCushionState();
                        calculatePrice();
                    }

                    initialize();
                })();
});
