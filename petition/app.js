// --- Petition Signature Roster Controller with Multi-page Printing ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. DOM Selectors
    const newNameInput = document.getElementById('new-name');
    const newAddressInput = document.getElementById('new-address');
    const newPhoneInput = document.getElementById('new-phone');
    const newPinInput = document.getElementById('new-pin');
    const btnAddMember = document.getElementById('btn-add-member');
    const rosterCountSpan = document.getElementById('roster-count');
    
    const rosterTbody = document.getElementById('roster-tbody');
    const btnPrint = document.getElementById('btn-print');

    // Signature Pad Elements
    const canvas = document.getElementById('signature-pad');
    const ctx = canvas.getContext('2d');
    const btnClearPad = document.getElementById('btn-clear-pad');

    // Live Preview Elements (Single Signer Roster Page)
    const singlePreviewName = document.getElementById('single-preview-name');
    const singlePreviewType = document.getElementById('single-preview-type');
    const singlePreviewAddress = document.getElementById('single-preview-address');
    const singlePreviewPhone = document.getElementById('single-preview-phone');
    const singlePreviewSign = document.getElementById('single-preview-sign');
    const singlePreviewLog = document.getElementById('single-preview-log');
    
    // Page Containers
    const documentPagesContainer = document.getElementById('document-pages-container');

    // Global State
    let roster = [];
    let clientIp = '조회 중...';
    let clientDevice = '';
    let isDrawing = false;
    let hasSign = false;

    // Configure drawing style for Canvas Signature
    ctx.strokeStyle = '#1e1b4b'; // Deep Indigo
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Canvas coordinate converter
    function getCoordinates(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: (clientX - rect.left) * (canvas.width / rect.width),
            y: (clientY - rect.top) * (canvas.height / rect.height)
        };
    }

    function startDrawing(e) {
        isDrawing = true;
        const coords = getCoordinates(e);
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
        e.preventDefault();
    }

    function draw(e) {
        if (!isDrawing) return;
        const coords = getCoordinates(e);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
        hasSign = true;
        updateSinglePreviewSignature();
        e.preventDefault();
    }

    function stopDrawing() {
        isDrawing = false;
    }

    // Canvas Listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);

    // Clear Pad and Reset preview
    btnClearPad.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        hasSign = false;
        singlePreviewSign.innerHTML = `<div style="font-size: 8pt; color: #aaa; text-align: center; border: 1px dashed #ccc; padding: 4px; border-radius: 4px; width: 60px; margin: 0 auto;">(서명/인)</div>`;
    });

    // Update real-time single preview signature cell
    function updateSinglePreviewSignature() {
        if (hasSign) {
            singlePreviewSign.innerHTML = `<img src="${canvas.toDataURL()}" class="signature-img-preview">`;
        }
    }

    // 3. Realtime Input Synchronization
    function updateLivePreviewTexts() {
        const now = new Date();
        const timestampStr = now.getFullYear() + '-' + 
            String(now.getMonth() + 1).padStart(2, '0') + '-' + 
            String(now.getDate()).padStart(2, '0') + ' ' + 
            String(now.getHours()).padStart(2, '0') + ':' + 
            String(now.getMinutes()).padStart(2, '0') + ':' + 
            String(now.getSeconds()).padStart(2, '0');

        // Update Name
        if (newNameInput.value.trim()) {
            singlePreviewName.textContent = newNameInput.value;
            singlePreviewName.style.color = '#000000';
        } else {
            singlePreviewName.textContent = '성명 대기';
            singlePreviewName.style.color = '#94a3b8';
        }

        // Update Type (Qualification)
        const checkedTypeInput = document.querySelector('input[name="new-user-type"]:checked');
        const userTypeVal = checkedTypeInput ? checkedTypeInput.value : '구분소유자';
        singlePreviewType.textContent = userTypeVal;
        singlePreviewType.style.color = '#000000';

        // Update Address
        if (newAddressInput.value.trim()) {
            singlePreviewAddress.textContent = newAddressInput.value;
            singlePreviewAddress.style.color = '#000000';
        } else {
            singlePreviewAddress.textContent = '동호수 대기';
            singlePreviewAddress.style.color = '#94a3b8';
        }

        // Update Phone
        if (newPhoneInput.value.trim()) {
            singlePreviewPhone.textContent = newPhoneInput.value;
            singlePreviewPhone.style.color = '#000000';
        } else {
            singlePreviewPhone.textContent = '연락처 대기';
            singlePreviewPhone.style.color = '#94a3b8';
        }

        // Update Log
        singlePreviewLog.innerHTML = `
            IP: ${clientIp} <br> 기기: ${clientDevice} <br> 일시: ${timestampStr}
        `;
        singlePreviewLog.style.color = '#555555';
    }

    newNameInput.addEventListener('input', updateLivePreviewTexts);
    newAddressInput.addEventListener('input', updateLivePreviewTexts);
    newPhoneInput.addEventListener('input', updateLivePreviewTexts);
    
    // Add change listeners to new-user-type radio buttons
    document.querySelectorAll('input[name="new-user-type"]').forEach(radio => {
        radio.addEventListener('change', updateLivePreviewTexts);
    });

    // Helper to simplify User Agent string for clean print layout
    function simplifyUserAgent(ua) {
        if (!ua) return '알 수 없음';
        if (ua.indexOf('/') !== -1 && ua.length < 30) return ua;
        
        let os = "기타";
        if (ua.indexOf("Win") !== -1) os = "Windows";
        else if (ua.indexOf("Mac") !== -1 && ua.indexOf("iPhone") === -1 && ua.indexOf("iPad") === -1) os = "macOS";
        else if (ua.indexOf("Android") !== -1) os = "Android";
        else if (ua.indexOf("iPhone") !== -1 || ua.indexOf("iPad") !== -1) os = "iOS";
        else if (ua.indexOf("Linux") !== -1) os = "Linux";

        let browser = "기타";
        if (ua.indexOf("KAKAOTALK") !== -1) browser = "카카오톡";
        else if (ua.indexOf("Firefox") !== -1) browser = "Firefox";
        else if (ua.indexOf("Chrome") !== -1) browser = "Chrome";
        else if (ua.indexOf("Safari") !== -1) browser = "Safari";
        else if (ua.indexOf("Edge") !== -1) browser = "Edge";
        else if (ua.indexOf("Trident") !== -1 || ua.indexOf("MSIE") !== -1) browser = "IE";

        return `${os} / ${browser}`;
    }

    // 4. Client Environment Detection
    function detectDeviceInfo() {
        const ua = navigator.userAgent;
        let os = "Unknown OS";
        let browser = "Unknown Browser";

        if (ua.indexOf("Win") !== -1) os = "Windows";
        else if (ua.indexOf("Mac") !== -1) os = "macOS";
        else if (ua.indexOf("Linux") !== -1) os = "Linux";
        else if (ua.indexOf("Android") !== -1) os = "Android";
        else if (ua.indexOf("like Mac") !== -1) os = "iOS";

        if (ua.indexOf("Firefox") !== -1) browser = "Firefox";
        else if (ua.indexOf("Chrome") !== -1) browser = "Chrome";
        else if (ua.indexOf("Safari") !== -1 && ua.indexOf("Chrome") === -1) browser = "Safari";
        else if (ua.indexOf("Edge") !== -1) browser = "Edge";

        clientDevice = `${os} / ${browser}`;
    }

    async function fetchPublicIp() {
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            if (res.ok) {
                const data = await res.json();
                clientIp = data.ip;
            } else {
                clientIp = '확인 불가';
            }
        } catch (e) {
            console.error('IP fetch failed:', e);
            clientIp = '로컬네트워크(오프라인)';
        }
        updateLivePreviewTexts();
    }

    // 5. Save & Load
    async function loadSavedData() {
        try {
            const res = await fetch(`/api/get-petitions`);
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    roster = data.roster;
                    rosterCountSpan.textContent = roster.length;
                    renderDashboardRoster();
                    return;
                }
            }
        } catch (e) {
            console.error('Error fetching roster from Google Sheet:', e);
        }

        // Local Storage fallback
        const storageKey = `ansan_petition_roster_data`;
        const savedRoster = localStorage.getItem(storageKey);
        if (savedRoster) {
            try {
                roster = JSON.parse(savedRoster);
            } catch (e) {
                console.error(e);
                roster = [];
            }
        } else {
            roster = [];
        }
        rosterCountSpan.textContent = roster.length;
        renderDashboardRoster();
    }

    function saveData() {
        const storageKey = `ansan_petition_roster_data`;
        localStorage.setItem(storageKey, JSON.stringify(roster));
        rosterCountSpan.textContent = roster.length;
    }

    // 6. Render Dashboard Table (Sidebar view)
    function renderDashboardRoster() {
        rosterTbody.innerHTML = '';
        if (roster.length === 0) {
            rosterTbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#94a3b8;padding:20px;">누적된 탄원 명단이 없습니다.</td></tr>`;
            return;
        }

        roster.forEach((member, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td><strong>${escapeHtml(member.name)}</strong></td>
                <td>
                    <div style="font-weight: 500;">${escapeHtml(member.address)}</div>
                </td>
                <td style="text-align: center;">
                    <button type="button" class="btn-delete-row" data-index="${index}" title="삭제">❌</button>
                </td>
            `;
            rosterTbody.appendChild(tr);
        });
    }

    function escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatPhoneNumber(phone) {
        if (!phone) return '-';
        let cleaned = ('' + phone).replace(/\D/g, '');
        
        // Restore missing leading zero for 10-digit Korean mobile numbers starting with '10'
        if (cleaned.length === 10 && cleaned.startsWith('10')) {
            cleaned = '0' + cleaned;
        }
        
        if (cleaned.length === 11) {
            return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
        } else if (cleaned.length === 10) {
            return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
        }
        
        return phone;
    }

    // 7. Operations
    async function addMember(name, address, phone) {
        if (!name.trim() || !address.trim() || !phone.trim()) {
            alert('성명, 동호수, 휴대폰 번호를 모두 입력해주세요.');
            return;
        }

        const pin = newPinInput.value.trim();
        if (!pin || pin.length !== 4 || isNaN(pin)) {
            alert('삭제 비밀번호로 숫자 4자리를 입력해주세요.');
            newPinInput.focus();
            return;
        }

        const signatureImg = hasSign ? canvas.toDataURL() : null;
        if (!signatureImg) {
            alert('디지털 자필 서명 패드에 서명을 그려주세요.');
            return;
        }

        const checkedTypeInput = document.querySelector('input[name="new-user-type"]:checked');
        const userType = checkedTypeInput ? checkedTypeInput.value : '구분소유자';

        try {
            const res = await fetch('/api/save-petition', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, address, phone, userType, signatureImg, pin })
            });
            const data = await res.json();
            if (data.success) {
                alert('탄원 연명부 제출이 완료되었습니다. 참여해주셔서 대단히 감사합니다.');
            } else {
                alert('제출 중 오류가 발생했습니다: ' + data.message + '\n\n[오류 상세 정보]\n' + (data.detail || '없음'));
                return;
            }
        } catch (e) {
            console.error(e);
            alert('서버 전송 실패로 인해 로컬에 임시 저장됩니다.');
            
            const now = new Date();
            const timestampStr = now.getFullYear() + '-' + 
                String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                String(now.getDate()).padStart(2, '0') + ' ' + 
                String(now.getHours()).padStart(2, '0') + ':' + 
                String(now.getMinutes()).padStart(2, '0') + ':' + 
                String(now.getSeconds()).padStart(2, '0');

            const newMember = {
                name: name.trim(),
                address: address.trim(),
                phone: phone.trim(),
                userType: userType,
                ip: clientIp,
                device: clientDevice,
                timestamp: timestampStr,
                signatureImg: signatureImg,
                pin: pin
            };

            roster.push(newMember);
            saveData();
        }

        // Reset Inputs
        newNameInput.value = '';
        newAddressInput.value = '';
        newPhoneInput.value = '';
        newPinInput.value = '';
        // Reset radio buttons to default (구분소유자)
        const defaultRadio = document.querySelector('input[name="new-user-type"][value="구분소유자"]');
        if (defaultRadio) defaultRadio.checked = true;
        
        btnClearPad.click();
        updateLivePreviewTexts();
        newNameInput.focus();

        await loadSavedData();
    }

    // Click handler for delete button on roster body
    rosterTbody.addEventListener('click', async (e) => {
        const btn = e.target.closest('.btn-delete-row');
        if (btn) {
            const index = parseInt(btn.getAttribute('data-index'), 10);
            const targetMember = roster[index];
            
            const pin = prompt(`'${targetMember.name}' 님의 기록을 삭제하시려면 등록하셨던 비밀번호(숫자 4자리) 또는 관리자 비밀번호를 입력해 주세요:`);
            if (pin === null) return; // Cancelled
            
            try {
                const res = await fetch('/api/delete-petition', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ index: targetMember.index, pin })
                });
                const data = await res.json();
                if (data.success) {
                    alert('구글 드라이브에서 명단이 성공적으로 삭제되었습니다.');
                } else {
                    alert('삭제 실패: ' + data.message);
                    return;
                }
            } catch (e) {
                console.error(e);
                alert('서버 통신 실패로 로컬에서 삭제를 수행합니다.');
                if (pin === targetMember.pin || pin === '3686') {
                    roster.splice(index, 1);
                    saveData();
                } else {
                    alert('비밀번호가 올바르지 않습니다.');
                    return;
                }
            }
            
            await loadSavedData();
        }
    });

    // 8. Event Listeners
    btnAddMember.addEventListener('click', () => {
        addMember(newNameInput.value, newAddressInput.value, newPhoneInput.value);
    });

    newPinInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            btnAddMember.click();
        }
    });

    // 9. Printing Logic with Multi-page Partitioning
    btnPrint.addEventListener('click', () => {
        const password = prompt('관리자 암호를 입력하세요:');
        if (password !== '3686') {
            alert('암호가 올바르지 않습니다.');
            return;
        }

        if (roster.length === 0) {
            alert('인쇄할 누적 명단이 없습니다.');
            return;
        }

        // Cache the current screen-only markup
        const originalMarkup = documentPagesContainer.innerHTML;

        // Number of roster rows per A4 page to prevent overflow
        const rowsPerPage = 10;
        const totalPages = Math.ceil(roster.length / rowsPerPage);
        
        let newContent = '';

        // Add Page 1: Main Letter Page
        const page1Element = document.getElementById('page-main').cloneNode(true);
        // Update total pages footer
        const page1Footer = page1Element.querySelector('.page-number-footer');
        if (page1Footer) {
            page1Footer.textContent = `1 / ${totalPages + 1}`;
        }
        newContent += page1Element.outerHTML;

        // Compile cumulative Roster pages (Pages 2+)
        for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
            const pageNum = pageIdx + 2;
            const startIdx = pageIdx * rowsPerPage;
            const endIdx = Math.min(startIdx + rowsPerPage, roster.length);
            const chunk = roster.slice(startIdx, endIdx);

            let rowsHTML = '';
            chunk.forEach((member, i) => {
                const globalIndex = startIdx + i + 1;
                
                // Fallback to local storage backup if member.signatureImg is an external URL to bypass print preview CORS issues
                let printSignSrc = member.signatureImg || '';
                if (printSignSrc && printSignSrc.startsWith('http')) {
                    // Try to find matching backup in localStorage
                    const storageKey = `ansan_petition_roster_data`;
                    const savedRoster = localStorage.getItem(storageKey);
                    if (savedRoster) {
                        try {
                            const localRoster = JSON.parse(savedRoster);
                            // Match by name and address
                            const matched = localRoster.find(m => m.name === member.name && m.address === member.address);
                            if (matched && matched.signatureImg && matched.signatureImg.startsWith('data:image/')) {
                                printSignSrc = matched.signatureImg;
                            }
                        } catch (err) {
                            console.error(err);
                        }
                    }
                }

                const signHTML = printSignSrc 
                    ? `<img src="${printSignSrc}" class="signature-img-preview">`
                    : `<div style="font-size: 8pt; color: #aaa; text-align: center; border: 1px dashed #ccc; padding: 4px; border-radius: 4px; width: 60px; margin: 0 auto;">(서명/인)</div>`;

                rowsHTML += `
                    <tr>
                        <td>${globalIndex}</td>
                        <td style="font-weight:700;">${escapeHtml(member.name)}</td>
                        <td style="font-weight:600;">${escapeHtml(member.userType || '구분소유자')}</td>
                        <td class="left-align">${escapeHtml(member.address)}</td>
                        <td>${escapeHtml(formatPhoneNumber(member.phone))}</td>
                        <td>${signHTML}</td>
                        <td class="preview-roster-log">
                            IP: ${member.ip} <br> 기기: ${simplifyUserAgent(member.device)} <br> 일시: ${member.timestamp}
                        </td>
                    </tr>
                `;
            });

            newContent += `
                <article class="a4-page">
                    <h2 class="doc-sub-title" style="margin-bottom: 8pt;">【 탄 원 연 명 부 】</h2>
                    
                    <!-- 요청받은 연명부 상단 안내 및 동의 문구 박스 -->
                    <div style="font-size: 8.5pt; line-height: 1.45; border: 1px solid #111; padding: 10px; margin-bottom: 12px; background-color: #fcfcfc;">
                        <strong style="display: block; font-size: 9.5pt; text-align: center; margin-bottom: 6px; border-bottom: 1px solid #ccc; padding-bottom: 4px;">
                            [안산유통상가 관리인 선임 신고의 조속한 행정 처리 촉구 탄원 연명부]
                        </strong>
                        안산유통상가의 정상적인 관리 권한 정상화와 법적 행정 공백의 종식을 위해 구분소유자 및 이해관계인들의 적극적인 서명 동참을 부탁드립니다.<br>
                        <strong>■ 탄원 목적:</strong> 안산시청(건축디자인과)에 정식 접수된 '6월 22일 총회' 적법 관리인 선임 신고서의 신속하고 공정한 수리 처리 촉구<br>
                        <strong>■ 개인정보 동의:</strong> 성명, 주소, 연락처는 위조 시비를 차단할 목적으로 수집되며, 목적 달성 후 즉시 파기됩니다.
                        <span style="float: right; font-size: 8.5pt; color: #666; font-weight: 700; margin-top: 4px;">(누적 명단 Page ${pageIdx + 1} / ${totalPages})</span>
                    </div>

                    <table class="preview-roster-table">
                        <thead>
                            <tr>
                                <th style="width: 6%;">번호</th>
                                <th style="width: 12%;">성명</th>
                                <th style="width: 12%;">구분</th>
                                <th style="width: 20%;">주소 / 동호수</th>
                                <th style="width: 15%;">연락처</th>
                                <th style="width: 12%;">서명 또는 날인</th>
                                <th style="width: 23%;">디지털 인증 로그 (IP / 환경 / 일시)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHTML}
                        </tbody>
                    </table>


                    <div class="doc-footer">
                        <div class="verification-legal-note">
                            ※ 본 연명부는 개별 소유자/입주자가 직접 접속하여 작성하였으며, 기재된 IP 및 접속기기 환경 로그는 본인 작성 사실을 증명하는 법적 간접 증거로 효력을 가집니다.
                        </div>
                        <p class="page-number-footer">${pageNum} / ${totalPages + 1}</p>
                    </div>
                </article>
            `;
        }

        // Bind the dynamic printable structure to preview canvas
        documentPagesContainer.innerHTML = newContent;

        // Perform browser print
        window.print();

        // Restore original screen-only layout immediately after print dialog is closed
        documentPagesContainer.innerHTML = originalMarkup;

        // Re-initialize preview hooks & fetch roster again
        loadSavedData();
    });

    // 10. Initialization
    detectDeviceInfo();
    fetchPublicIp();
    loadSavedData();
});
