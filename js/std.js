document.addEventListener('DOMContentLoaded', function () {
    // --- Standard Cylinder Calculator Logic ---
                (function () {
                    if (!document.getElementById('content-std')) return;
                    

                    // 지지 형식 가격 데이터
                    // image_e3a325.png 및 image_e3a5e7.png 파일의 "지지형식" 표를 기반으로 합니다.
                    

                    // 선단 금구 가격 데이터
                    // image_e3a325.png 및 image_e3a5e7.png 파일의 "2산 너울명", "1산 너클형", "PIN", "로드너트" 등을 기반으로 합니다.
                    
                    // 쿠션 가격 데이터
                    // image_e3a325.png 및 image_e3a5e7.png 파일의 "쿠신" 표를 기반으로 합니다.
                    
                    
                    // 자바라 단가 매트릭스 (내경/로드경/스트로크)
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    for (let st = 50; st <= 1000; st += 50) {
                        stdBellowsInquiryStrokeMap[String(st)] = 'inquiry';
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

                    const diameterSelect = document.getElementById('std-diameter'),
                        strokeSelect = document.getElementById('std-stroke'),
                        strokeCustomInput = document.getElementById('std-stroke-custom'),
                        statusNote = document.getElementById('std-status-note'),
                        typeSelect = document.getElementById('std-type'),
                        mountingSelect = document.getElementById('std-mounting'),
                        rodEndFittingSelect1 = document.getElementById('std-rod-end-fitting-1'),
                        rodEndFittingSelect2 = document.getElementById('std-rod-end-fitting-2'),
                        specialSelect = document.getElementById('std-special'),
                        bellowsEnabledCheckbox = document.getElementById('std-bellows-enabled'),
                        bellowsMaterialOptions = document.getElementById('std-bellows-material-options'),
                        bellowsGeneralCheckbox = document.getElementById('std-bellows-general'),
                        bellowsHeatCheckbox = document.getElementById('std-bellows-heat'),
                        rodExtensionEnabled = document.getElementById('std-rod-extension-enabled'),
                        rodExtensionMmInput = document.getElementById('std-rod-extension-mm'),
                        rodExtensionCustomInput = document.getElementById('std-rod-extension-custom'),
                        cushionCheckbox = document.getElementById('std-cushion'),
                        specSummaryDisplay = document.getElementById('std-spec-summary'),
                        priceDisplay = document.getElementById('std-price-display'),
                        priceBreakdown = document.getElementById('std-price-breakdown'),
                        quantityInput = document.getElementById('std-quantity-input'),
                        finalTotalDisplay = document.getElementById('std-final-total-display');


                    function formatNumber(num) { return num.toLocaleString('ko-KR'); }
                    function updateStdStatusNote() {
                        if (!statusNote) return;
                        const customStrokeVal = parseInt(strokeCustomInput.value || '0', 10);
                        const selectedStrokeVal = parseInt(strokeSelect.value || '0', 10);
                        const appliedStrokeVal = !isNaN(customStrokeVal) && customStrokeVal > 0 ? customStrokeVal : selectedStrokeVal;
                        if (diameterSelect.value === '40' && typeSelect.value === 'A') {
                            statusNote.textContent = '40파이 A(초강력)은 표준 구조상 표준부품사용이 불가하며 담당자에게 제작 견적을 문의해 주세요';
                            statusNote.classList.remove('hidden');
                            return;
                        }
                        if (appliedStrokeVal >= 1000) {
                            statusNote.textContent = '중간지지대 포함시 별도의 비용이 추가됩니다.';
                            statusNote.classList.remove('hidden');
                            return;
                        }
                        statusNote.textContent = '';
                        statusNote.classList.add('hidden');
                    }
                    function shortOptionCode(rawValue, emptyFallback) {
                        if (!rawValue || rawValue === '0' || rawValue === 'none') return emptyFallback;
                        return String(rawValue).split('+')[0].split('/')[0];
                    }
                    function updateStdSpecSummary() {
                        if (!specSummaryDisplay) return;
                        const customStrokeVal = parseInt(strokeCustomInput.value || '0', 10);
                        const hasCustomStroke = !isNaN(customStrokeVal) && customStrokeVal > 0;
                        const hasSelectStroke = strokeSelect.value && strokeSelect.value !== '0';
                        const strokeCode = hasCustomStroke ? String(customStrokeVal) : (hasSelectStroke ? strokeSelect.value : '-');
                        const mountingCode = shortOptionCode(mountingSelect.value, 'SD');
                        const diaCode = diameterSelect.value !== '0' ? diameterSelect.value : '-';
                        const rodTypeCode = typeSelect.value !== '0' ? typeSelect.value : '-';
                        const cushionCode = cushionCheckbox.checked ? 'B' : 'N';
                        const rodEnd1 = shortOptionCode(rodEndFittingSelect1.value, 'N');
                        const rodEnd2 = shortOptionCode(rodEndFittingSelect2.value, '');
                        const specialText = specialSelect.options[specialSelect.selectedIndex]?.text || '';
                        const isWType = specialText.includes('W') || specialText.includes('SJ');
                        const headerCode = isWType ? 'TJ14W' : 'TJ14';
                        const isReady = diaCode !== '-' && rodTypeCode !== '-' && mountingCode !== '-' && strokeCode !== '-';
                        if (!isReady) {
                            specSummaryDisplay.classList.add('hidden');
                            specSummaryDisplay.textContent = '';
                            return;
                        }
                        const optionalTokens = [];
                        if (rodEnd2) optionalTokens.push(rodEnd2);
                        if (bellowsEnabledCheckbox.checked) optionalTokens.push('J');
                        const optionalText = optionalTokens.length > 0 ? ` ${optionalTokens.join(' ')}` : '';
                        specSummaryDisplay.classList.remove('hidden');
                        specSummaryDisplay.textContent = `${headerCode} ${mountingCode} ${diaCode} ${rodTypeCode}-${cushionCode} ${strokeCode}-${rodEnd1}${optionalText}`;
                    }
                    function calculatePrice() {
                        const dia = diameterSelect.value;
                        const customStrokeVal = parseInt(strokeCustomInput.value || '0', 10);
                        const usingCustomStroke = !isNaN(customStrokeVal) && customStrokeVal > 0;
                        const str = usingCustomStroke ? String(customStrokeVal) : strokeSelect.value;
                        const typ = typeSelect.value;
                        const marginInput = document.getElementById('std-margin-input');
                        const sellingPriceDisplay = document.getElementById('std-selling-price-display');
                        updateStdSpecSummary();
                        updateStdStatusNote();

                        if (dia === '0') {
                            priceDisplay.textContent = '₩ 0';
                            priceBreakdown.textContent = '직경을 먼저 선택해주세요.';
                            sellingPriceDisplay.textContent = '₩ 0';
                            finalTotalDisplay.textContent = '₩ 0';
                            return;
                        }

                        const mnt = mountingSelect.value;
                        const ref1 = rodEndFittingSelect1.value;
                        const ref2 = rodEndFittingSelect2.value;
                        const spc = parseFloat(specialSelect.value);
                        const bellowsEnabled = bellowsEnabledCheckbox.checked;
                        const isBellowsHeat = bellowsHeatCheckbox.checked;
                        const bellowsMultiplier = isBellowsHeat ? 2 : 1;
                        const rexEnabled = rodExtensionEnabled.checked;
                        const rexCustomVal = parseInt(rodExtensionCustomInput.value || '0', 10);
                        const rexUsingCustom = !isNaN(rexCustomVal) && rexCustomVal > 0;
                        const rexInputMm = rexUsingCustom ? rexCustomVal : (parseInt(rodExtensionMmInput.value || '0', 10) || 0);
                        const csh = cushionCheckbox.checked;
                        const quantity = parseInt(quantityInput.value) || 1;
                        let basePrice = 0, mountingPrice = 0, rodEndFittingPrice1 = 0, rodEndFittingPrice2 = 0, cushionPrice = 0, rodExtensionPrice = 0, bellowsPrice = 0, bellowsAutoRodExtensionPrice = 0;
                        let rexAppliedMm = 0, rexUnitRate = 0, rexBlocks = 0, rexTypeLabel = '';
                        let breakdown = [];

                        let strVal = parseInt(str, 10);
                        if (isNaN(strVal) || strVal < 0) strVal = 0;

                        if (dia !== '0' && strVal > 0 && typ !== '0') {
                            const spcCheck = parseFloat(specialSelect.value);
                            if (strVal > 1000 && (spcCheck === 1.55 || spcCheck === 1.35)) {
                                priceDisplay.textContent = '담당자에게 문의';
                                priceBreakdown.textContent = '1000ST 초과 시 SJ/W(양로드) 사양은 담당자에게 문의';
                                sellingPriceDisplay.textContent = '담당자에게 문의';
                                finalTotalDisplay.textContent = '담당자에게 문의';
                                return;
                            }
                            if (bellowsEnabled && strVal > 1000) {
                                priceDisplay.textContent = '문의';
                                priceBreakdown.textContent = '자바라 1000ST 초과는 담당자 문의';
                                sellingPriceDisplay.textContent = '문의';
                                finalTotalDisplay.textContent = '문의';
                                return;
                            }

                            let calcStr = strVal;
                            let extraRates = 0;
                            let overStrokeApplied = 0;
                            if (strVal > 1000) {
                                calcStr = 1000;
                                const over1000Rates = {
                                    '40': { 'C': 8100, 'B': 9100 },
                                    '50': { 'C': 9100, 'B': 9100 },
                                    '63': { 'C': 10100, 'B': 11100 },
                                    '80': { 'C': 12100, 'B': 14200 },
                                    '100': { 'C': 17100, 'B': 20200 },
                                    '125': { 'C': 21200, 'B': 23200 },
                                    '140': { 'C': 13000, 'B': 32700 },
                                    '150': { 'C': 34900, 'B': 39200 },
                                    '160': { 'C': 39200, 'B': 43600 },
                                    '180': { 'C': 45800, 'B': 58900 },
                                    '200': { 'C': 35900, 'B': 42500 },
                                    '250': { 'C': 98200, 'B': 117900 }
                                };
                                let chunkCount = Math.ceil((strVal - 1000) / 50);
                                overStrokeApplied = chunkCount * 50;
                                let rateMap = over1000Rates[dia] || { 'C': 0, 'B': 0 };
                                let unitRate = typ === 'A' ? Math.round((rateMap['B'] || 0) * 1.3) : (rateMap[typ] || 0);
                                extraRates = chunkCount * unitRate;
                            } else {
                                calcStr = Math.ceil(strVal / 50) * 50;
                            }

                            if (dia === '40' && typ === 'A') {
                                priceDisplay.textContent = '문의';
                                priceBreakdown.textContent = '';
                                sellingPriceDisplay.textContent = '문의';
                                finalTotalDisplay.textContent = '문의';
                                return;
                            }

                            const priceInfo = stdPriceData[dia]?.[calcStr.toString()];
                            if (!priceInfo) {
                                priceDisplay.textContent = '선택 불가';
                                priceBreakdown.textContent = '해당 조합의 가격 정보가 없습니다.';
                                sellingPriceDisplay.textContent = '₩ 0';
                                finalTotalDisplay.textContent = '₩ 0';
                                return;
                            }

                            if (typ === 'A') {
                                if (priceInfo['B']) {
                                    basePrice = Math.round(priceInfo['B'] * 1.3) + extraRates;
                                } else {
                                    priceDisplay.textContent = '선택 불가';
                                    priceBreakdown.textContent = 'A타입은 해당 직경에서 지원되지 않습니다.';
                                    sellingPriceDisplay.textContent = '₩ 0';
                                    finalTotalDisplay.textContent = '₩ 0';
                                    return;
                                }
                            } else if (priceInfo[typ]) {
                                basePrice = priceInfo[typ] + extraRates;
                            } else {
                                priceDisplay.textContent = '선택 불가';
                                priceBreakdown.textContent = `해당 로드경(${typ})은 이 직경에서 지원되지 않습니다.`;
                                sellingPriceDisplay.textContent = '₩ 0';
                                finalTotalDisplay.textContent = '₩ 0';
                                return;
                            }

                            if (spc > 1) {
                                basePrice = Math.round(basePrice * spc);
                            }

                            let typName = typeSelect.options[typeSelect.selectedIndex].text,
                                specialName = specialSelect.options[specialSelect.selectedIndex].text,
                                baseBreakdownText = `기본금액 (${typName})`;
                            if (spc > 1) {
                                baseBreakdownText += ` + ${specialName.split(' ')[0]}`;
                            }
                            breakdown.push(`${baseBreakdownText}: ${formatNumber(basePrice - extraRates)}`);
                            if (strVal > 1000) {
                                breakdown.push(`스트로크 적용: 입력 ${strVal}ST → 기준 1000ST + 초과 ${overStrokeApplied}ST`);
                            } else if (strVal !== calcStr) {
                                breakdown.push(`스트로크 적용: 입력 ${strVal}ST → 적용 ${calcStr}ST`);
                            }
                            if (extraRates > 0) {
                                breakdown.push(`추가 스트로크 금액: ${formatNumber(extraRates)}`);
                            }

                            if (bellowsEnabled) {
                                let bellowsPriceIsInquiry = false;
                                const bellowsAppliedStroke = Math.min(calcStr, 1000);
                                const bellowsLookup = resolveBellowsPrice(stdBellowsPriceData, dia, typ, bellowsAppliedStroke);
                                if (!bellowsLookup) {
                                    priceDisplay.textContent = '문의';
                                    priceBreakdown.textContent = `자바라 ${dia}Ø ${typ}형 ${bellowsAppliedStroke}ST 단가 데이터 없음 (담당자 문의)`;
                                    sellingPriceDisplay.textContent = '문의';
                                    finalTotalDisplay.textContent = '문의';
                                    return;
                                }
                                if (bellowsLookup.price === 'inquiry') {
                                    bellowsPriceIsInquiry = true;
                                    breakdown.push(`자바라 ${dia}Ø ${typ}형 ${bellowsAppliedStroke}ST: 담당자 문의`);
                                } else {
                                    const baseBellowsPrice = Number(bellowsLookup.price) || 0;
                                    bellowsPrice = baseBellowsPrice * bellowsMultiplier;
                                    if (bellowsPrice > 0) {
                                        const bellowsTypeLabel = bellowsLookup.appliedType === typ ? `${bellowsLookup.appliedType}형` : `${typ}→${bellowsLookup.appliedType} 기준`;
                                        const bellowsMaterialLabel = isBellowsHeat ? '내열용(x2)' : '일반';
                                        breakdown.push(`자바라(${bellowsMaterialLabel}): ${bellowsTypeLabel} ${bellowsAppliedStroke}ST = ${formatNumber(bellowsPrice)}`);
                                    }
                                }

                                // 자바라로 인한 로드연장 자동 계산
                                const bellowsRodDenominatorMap = {
                                    '40': 3.5, '50': 3.5,
                                    '63': 4, '80': 4, '100': 4,
                                    '125': 5, '140': 5, '150': 5, '160': 5, '180': 5, '200': 5,
                                    '250': 6
                                };
                                const bellowsRodDenominator = bellowsRodDenominatorMap[dia];
                                if (bellowsRodDenominator) {
                                    const autoRexRaw = strVal / bellowsRodDenominator;
                                    const autoRexMm = Math.ceil(autoRexRaw / 50) * 50;
                                    const autoRexBlocks = autoRexMm / 50;
                                    const autoRexType = typ === 'A' ? 'A' : (typ === 'C' ? 'C' : 'B');
                                    const autoRexRateRaw = stdRodExtensionRateData[dia]?.[autoRexType];
                                    if (autoRexRateRaw === 'inquiry') {
                                        priceDisplay.textContent = '문의';
                                        priceBreakdown.textContent = `자바라 로드연장 ${dia}Ø ${autoRexType}형: 문의`;
                                        sellingPriceDisplay.textContent = '문의';
                                        finalTotalDisplay.textContent = '문의';
                                        return;
                                    }
                                    const autoRexUnitRate = autoRexRateRaw || 0;
                                    bellowsAutoRodExtensionPrice = autoRexBlocks * autoRexUnitRate;
                                    const denomLabel = Number.isInteger(bellowsRodDenominator) ? String(bellowsRodDenominator) : bellowsRodDenominator.toFixed(1);
                                    if (bellowsAutoRodExtensionPrice > 0) {
                                        breakdown.push(`자바라 로드연장: 행정 ${strVal}ST ÷ ${denomLabel} = ${autoRexRaw.toFixed(1)}mm → 적용 ${autoRexMm}mm (${autoRexType}형 ${autoRexBlocks} x ${formatNumber(autoRexUnitRate)}) = ${formatNumber(bellowsAutoRodExtensionPrice)}`);
                                    }
                                }

                                if (bellowsPriceIsInquiry) {
                                    breakdown.push(`제조원가 합계: 문의 (자바라 가격 담당자 확인 필요)`);
                                    priceDisplay.textContent = '문의';
                                    priceBreakdown.textContent = breakdown.join('\n');
                                    sellingPriceDisplay.textContent = '문의';
                                    finalTotalDisplay.textContent = '문의';
                                    return;
                                }
                            }
                        }

                        if (mnt !== 'none' && stdMountingData[mnt]?.[dia]) {
                            mountingPrice = stdMountingData[mnt][dia];
                            breakdown.push(`지지형식: ${formatNumber(mountingPrice)}`);
                        }
                        if (ref1 !== 'none' && stdRodEndFittingData[ref1]?.[dia]) {
                            rodEndFittingPrice1 = stdRodEndFittingData[ref1][dia];
                            breakdown.push(`선단금구 1: ${formatNumber(rodEndFittingPrice1)}`);
                        }
                        if (ref2 !== 'none' && stdRodEndFittingData[ref2]?.[dia]) {
                            rodEndFittingPrice2 = stdRodEndFittingData[ref2][dia];
                            breakdown.push(`선단금구 2: ${formatNumber(rodEndFittingPrice2)}`);
                        }
                        if (csh) {
                            cushionPrice = stdCushionData[dia];
                            breakdown.push(`쿠션: ${formatNumber(cushionPrice)}`);
                        }
                        if (rexEnabled && !isNaN(rexInputMm) && rexInputMm > 0 && typ !== '0') {
                            rexAppliedMm = Math.ceil(rexInputMm / 50) * 50;
                            rexBlocks = rexAppliedMm / 50;
                            const rexType = typ === 'A' ? 'A' : (typ === 'C' ? 'C' : 'B');
                            rexTypeLabel = rexType;
                            const rexRateRaw = stdRodExtensionRateData[dia]?.[rexType];
                            if (rexRateRaw === 'inquiry') {
                                priceDisplay.textContent = '문의';
                                priceBreakdown.textContent = `로드연장 ${dia}Ø ${rexTypeLabel}형: 문의`;
                                sellingPriceDisplay.textContent = '문의';
                                finalTotalDisplay.textContent = '문의';
                                return;
                            }
                            rexUnitRate = rexRateRaw || 0;
                            rodExtensionPrice = rexBlocks * rexUnitRate;
                            if (rodExtensionPrice > 0) {
                                breakdown.push(`로드연장: 입력 ${rexInputMm}mm → 적용 ${rexAppliedMm}mm (${rexTypeLabel}형 ${rexBlocks} x ${formatNumber(rexUnitRate)}) = ${formatNumber(rodExtensionPrice)}`);
                            }
                        }

                        let subTotal = basePrice + mountingPrice + rodEndFittingPrice1 + rodEndFittingPrice2 + cushionPrice + rodExtensionPrice + bellowsPrice + bellowsAutoRodExtensionPrice;
                        priceDisplay.textContent = `₩ ${formatNumber(subTotal)}`;
                        if (breakdown.length > 0) {
                            breakdown.push(`제조원가 합계: ${formatNumber(subTotal)}`);
                        }

                        if (breakdown.length > 0) {
                            priceBreakdown.textContent = breakdown.join('\n');
                        } else {
                            if (!str || str === '0' || typ === '0') {
                                priceBreakdown.textContent = '실린더 기본 사양 또는 추가 옵션을 선택하세요.';
                            } else {
                                priceBreakdown.textContent = '';
                            }
                        }

                        const margin = parseFloat(marginInput.value) || 0;
                        let sellingPrice = subTotal;
                        if (margin > 0 && margin < 100) {
                            sellingPrice = Math.round(subTotal / (1 - (margin / 100)));
                        }
                        sellingPriceDisplay.textContent = `₩ ${formatNumber(sellingPrice)}`;

                        const finalTotal = sellingPrice * quantity;
                        finalTotalDisplay.textContent = `₩ ${formatNumber(finalTotal)}`;
                    }
                    function updateStrokeOptions() {
                        const dia = diameterSelect.value;
                        const currentStroke = strokeSelect.value;
                        strokeSelect.innerHTML = '<option value="0">스트로크 선택</option>';
                        const strokeKeys = new Set();
                        if (dia !== '0' && stdPriceData[dia]) {
                            Object.keys(stdPriceData[dia]).forEach(key => strokeKeys.add(Number(key)));
                        } else {
                            Object.values(stdPriceData).forEach(strokeMap => {
                                Object.keys(strokeMap || {}).forEach(key => strokeKeys.add(Number(key)));
                            });
                        }

                        Array.from(strokeKeys)
                            .sort((a, b) => a - b)
                            .forEach(str => strokeSelect.add(new Option(`${str} ST`, String(str))));

                        if (Array.from(strokeSelect.options).some(opt => opt.value === currentStroke)) {
                            strokeSelect.value = currentStroke;
                        } else {
                            strokeSelect.value = '0';
                        }
                        strokeSelect.disabled = false;
                    }
                    function updateTypeOptions() {
                        const dia = diameterSelect.value;
                        const currentType = typeSelect.value;
                        let availableTypes = Object.keys(stdPriceData[dia]?.['50'] || {});
                        if (dia === '0') {
                            availableTypes = ['C', 'B'];
                        }
                        typeSelect.innerHTML = '';
                        typeSelect.add(new Option('로드경 선택', '0'));
                        if (availableTypes.includes('C')) { typeSelect.add(new Option('C (일반)', 'C')); }
                        if (availableTypes.includes('B')) { typeSelect.add(new Option('B (강력)', 'B')); typeSelect.add(new Option('A (초강력)', 'A')); }
                        if (Array.from(typeSelect.options).some(opt => opt.value === currentType)) { typeSelect.value = currentType; }
                        typeSelect.disabled = false;
                    }
                    function updateRodExtensionOptions() {
                        const currentExtension = rodExtensionMmInput.value;
                        rodExtensionMmInput.innerHTML = '<option value="0">연장 선택</option>';
                        for (let mm = 50; mm <= 1000; mm += 50) {
                            rodExtensionMmInput.add(new Option(`${mm} mm`, String(mm)));
                        }
                        if (Array.from(rodExtensionMmInput.options).some(opt => opt.value === currentExtension)) {
                            rodExtensionMmInput.value = currentExtension;
                        } else {
                            rodExtensionMmInput.value = '0';
                        }
                    }
                    function initialize() {
                        if (!document.getElementById('content-std')) return;
                        diameterSelect.add(new Option('직경 선택', '0'));
                        Object.keys(stdPriceData).forEach(dia => diameterSelect.add(new Option(`Ø ${dia}`, dia)));
                        updateStrokeOptions();
                        updateTypeOptions();
                        updateRodExtensionOptions();
                        const mountingOrder = ['none', 'LB', 'LA', 'TA', 'TC', 'FA/FB', 'FC/FD/FY/FZ', 'CA', 'CB+PIN', 'CB'], mountingNames = { 'none': 'SD(해당없음)', 'LB': 'LB (푸트형)', 'LA': 'LA', 'TA': 'TA (로드측 트러니온)', 'TC': 'TC (중간측 트러니온)', 'FA/FB': 'FA/FB (플랜지형)', 'FC/FD/FY/FZ': 'FC/FD/FY/FZ (플랜지형)', 'CA': 'CA (1산 크레비스)', 'CB': 'CB (2산 크레비스)', 'CB+PIN': 'CB(2산 크레비스) + PIN' };
                        mountingOrder.forEach(key => { if (stdMountingData[key]) { mountingSelect.add(new Option(mountingNames[key] || key, key)); } });
                        const rodEndFittingOrder = ['none', 'Y+PIN', 'Y', 'I', 'CB+PIN', 'CA', 'pin', 'CB', 'locknut'], rodEndFittingNames = { 'none': '해당 없음', 'Y+PIN': 'Y(2산 너클) +PIN', 'I': 'I (1산 너클)', 'CB+PIN': 'CB+PIN', 'CA': 'CA (1산 크레비스)', 'pin': 'PIN', 'CB': 'CB (2산 크레비스)', 'locknut': '로크너트' };
                        rodEndFittingOrder.forEach(key => { if (stdRodEndFittingData[key]) { const optionName = rodEndFittingNames[key] || key; rodEndFittingSelect1.add(new Option(optionName, key)); rodEndFittingSelect2.add(new Option(optionName, key)); } });
                        const syncBellowsMaterialSelection = (changedType) => {
                            if (changedType === 'general' && bellowsGeneralCheckbox.checked) {
                                bellowsHeatCheckbox.checked = false;
                            }
                            if (changedType === 'heat' && bellowsHeatCheckbox.checked) {
                                bellowsGeneralCheckbox.checked = false;
                            }
                            if (!bellowsGeneralCheckbox.checked && !bellowsHeatCheckbox.checked) {
                                bellowsGeneralCheckbox.checked = true;
                            }
                        };
                        const syncBellowsOptionState = () => {
                            const enabled = bellowsEnabledCheckbox.checked;
                            bellowsGeneralCheckbox.disabled = !enabled;
                            bellowsHeatCheckbox.disabled = !enabled;
                            if (bellowsMaterialOptions) {
                                bellowsMaterialOptions.classList.toggle('opacity-50', !enabled);
                            }
                            if (enabled) {
                                syncBellowsMaterialSelection();
                            }
                        };
                        const syncRodExtensionInputState = () => {
                            const isEnabled = rodExtensionEnabled.checked;
                            rodExtensionMmInput.disabled = !isEnabled;
                            rodExtensionCustomInput.disabled = !isEnabled;
                            if (!rodExtensionEnabled.checked) {
                                rodExtensionMmInput.value = '0';
                                rodExtensionCustomInput.value = '';
                            }
                        };
                        syncBellowsMaterialSelection();
                        syncBellowsOptionState();
                        syncRodExtensionInputState();

                        // 이익율 입력을 제외한 나머지 요소들에 자동 계산 이벤트를 추가합니다.
                        [diameterSelect, typeSelect, mountingSelect, rodEndFittingSelect1, rodEndFittingSelect2, specialSelect, cushionCheckbox, quantityInput].forEach(el => {
                            if (el) {
                                const eventType = el.tagName === 'INPUT' ? 'input' : 'change';
                                el.addEventListener(eventType, calculatePrice);
                            }
                        });
                        bellowsEnabledCheckbox.addEventListener('change', () => {
                            syncBellowsOptionState();
                            calculatePrice();
                        });
                        bellowsGeneralCheckbox.addEventListener('change', () => {
                            syncBellowsMaterialSelection('general');
                            calculatePrice();
                        });
                        bellowsHeatCheckbox.addEventListener('change', () => {
                            syncBellowsMaterialSelection('heat');
                            calculatePrice();
                        });
                        strokeSelect.addEventListener('change', () => {
                            if (strokeSelect.value !== '0') {
                                strokeCustomInput.value = '';
                            }
                            calculatePrice();
                        });
                        strokeCustomInput.addEventListener('input', () => {
                            const hasValue = (strokeCustomInput.value || '').trim() !== '';
                            if (hasValue) {
                                strokeSelect.value = '0';
                            }
                            calculatePrice();
                        });
                        rodExtensionEnabled.addEventListener('change', () => {
                            syncRodExtensionInputState();
                            calculatePrice();
                        });
                        rodExtensionMmInput.addEventListener('change', () => {
                            if (rodExtensionMmInput.value !== '0') {
                                rodExtensionCustomInput.value = '';
                            }
                            calculatePrice();
                        });
                        rodExtensionCustomInput.addEventListener('input', () => {
                            const hasValue = (rodExtensionCustomInput.value || '').trim() !== '';
                            if (hasValue) {
                                rodExtensionMmInput.value = '0';
                            }
                            calculatePrice();
                        });

                        // 이익율 입력창과 확인 버튼에 대한 특별 이벤트를 추가합니다.
                        const marginInput = document.getElementById('std-margin-input');
                        const applyMarginBtn = document.getElementById('std-apply-margin-btn');

                        const applyMargin = () => {
                            applyMarginBtn.textContent = '계산중...';
                            calculatePrice();
                            setTimeout(() => {
                                applyMarginBtn.textContent = '확인';
                            }, 500);
                        };

                        applyMarginBtn.addEventListener('click', applyMargin);
                        marginInput.addEventListener('keydown', (event) => {
                            if (event.key === 'Enter') {
                                event.preventDefault();
                                applyMargin();
                            }
                        });

                        diameterSelect.addEventListener('change', () => {
                            updateStrokeOptions();
                            updateTypeOptions();
                            calculatePrice();
                        });

                        calculatePrice();
                    }
                    initialize();
                })();
});
