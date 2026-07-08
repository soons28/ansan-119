// --- Content Certification Signature Roster Controller with Multi-page Printing ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. DOM Selectors
    const newNameInput = document.getElementById('new-name');
    const newAddressInput = document.getElementById('new-address');
    const newPinInput = document.getElementById('new-pin');
    const btnAddMember = document.getElementById('btn-add-member');
    const rosterCountSpan = document.getElementById('roster-count');
    
    const rosterTbody = document.getElementById('roster-tbody');
    const btnPrint = document.getElementById('btn-print');

    // Tab Elements
    const tabGround = document.getElementById('tab-ground');
    const tabBasement = document.getElementById('tab-basement');

    // Signature Pad Elements
    const canvas = document.getElementById('signature-pad');
    const ctx = canvas.getContext('2d');
    const btnClearPad = document.getElementById('btn-clear-pad');

    // Live Preview Elements (Single Signer Roster Page)
    const singlePreviewName = document.getElementById('single-preview-name');
    const singlePreviewAddress = document.getElementById('single-preview-address');
    const singlePreviewSign = document.getElementById('single-preview-sign');
    const singlePreviewLog = document.getElementById('single-preview-log');
    
    // Page Containers
    const documentPagesContainer = document.getElementById('document-pages-container');

    // Templates for Ground and Basement
    const TEMPLATES = {
        ground: {
            title: "답 변 서",
            subtitle: "(관리비 부당 청구 및 미납 독촉에 대한 연명 반박서)",
            recipient: `<strong>안산유통상가 1차 관리단 임시관리인 김용명</strong><br>
                                <span style="font-size: 9.5pt; color: #555;">주소: 경기도 안산시 단원구 산단로 342(안산유통상가 1차) A동 403호</span>`,
            sender: `<strong>안산유통상가 1차 관리인 교체 추진위원회 대표 [대표자성명] 및 아래 연명 소유주/입주자 일동</strong><br>
                                <span style="font-size: 9.5pt; color: #555;">주소: 경기도 안산시 단원구 산단로 326 안산유통상가 1차 내 각 동 호실</span>`,
            recipientLabel: "1. 수신인:",
            senderLabel: "2. 발신인:",
            titleLabel: "3. 제 목:",
            titleVal: "관리비 미납금 납부 최고 내용증명에 대한 단체 항변 및 소명 요구의 건",
            body: `1) 귀 하(이하 '발신인')가 최근 안산유통상가 1차 소유주 및 입주자들을 상대로 발송한 '관리비 미납금 납부 최고' 내용증명(예: 우편물번호 제                  호 등)에 대하여, 본 관리인 교체 추진위원회와 아래 연명인들은 공동의 항변권을 행사하고자 본 답변서를 발송합니다.
2) 아래 연명인들을 포함한 상가 소유주들은 상가의 공용부분 유지·보수를 위한 정당한 관리비 납부 의무를 기피한 사실이 없으며, 상가 정상화를 위해 합리적이고 투명하게 산정된 관리비라면 언제든 납부할 용의가 있음을 확약합니다.
3) 그러나 귀 발신인이 청구한 관리비 내역은 다음과 같은 치명적인 절차적, 회계적 의혹이 해소되지 않았으므로, 본 연명인들은 분쟁 해결 시까지 관리비 납부를 집단 유예함을 통고합니다.
  - 가. 부과 및 연체료 산정의 불투명성: 귀 발신인이 일방적으로 제시한 미납 원금과 고율의 연체료는 정당한 관리규약 및 집합건물법에 의거한 상세 산정 근거가 결여되어 있습니다. 
  - 나. 임시관리인의 권한 남용 의혹: 법원이 선임한 임시관리인의 직무 범위는 상가의 파행을 막고 정상적인 관리단집회를 소집하는 등 제한적 권한에 그쳐야 함에도, 소유주들을 상대로 소송 제기 및 강제집행을 운위하며 무차별적인 법적 압박을 가하는 것은 명백한 권한 남용입니다.
4) 현재 안산유통상가 1차는 관리단의 회계 불투명성과 파행 운영으로 인해 법적·행정적 분쟁이 격화되고 있는 엄중한 상황입니다. 이러한 분쟁의 근본 원인을 제공한 귀 발신인 측이, 소유주들의 정당한 소명 요구에는 일절 불응하면서 '7일 이내 납부'라는 임의의 기한을 두어 지급명령 등으로 위협하는 행위는 본 상가 소유주들의 권리를 심각하게 침해하는 행위입니다.
5) 이에 본 연명인 일동은 귀 발신인 측에 청구된 관리비의 상세 회계 장부 및 정당한 규약상의 산정 근거를 상가 전체에 투명하게 공개할 것을 강력히 촉구합니다.
6) 만약 귀 발신인이 소유주들의 정당한 요구를 묵살하고 일방적으로 기습적인 지급명령 신청 등 법적 절차를 강행할 경우, 본 연명인 일동은 추진위원회를 중심으로 즉각적인 집단 이의신청 및 법적 본안 소송을 제기하여 부과 절차의 위법성을 끝까지 다툴 것입니다. 이로 인해 발생하는 모든 법적 소송 비용 및 상가 혼란에 대한 책임은 귀 발신인 측에 있음을 엄중히 고지합니다.`,
            footerSigner: "발신인: 안산유통상가 1차 관리인 교체 추진위원회 대표 [대표자성명] (인)",
            rosterDesc: "본 연명부에 서명한 구분소유자 및 임차인 일동은 상기 답변서 내용에 동의하며 공동으로 의사를 표시합니다."
        },
        basement: {
            title: "답 변 서",
            subtitle: "(관리비 미납금 납부 최고에 대한 반박 및 소명 요구)",
            recipient: `성명: <strong>안산유통상가 1차 관리단 임시관리인 김용명</strong><br>주소: 경기도 안산시 단원구 산단로 342(안산유통상가 1차) A동 403호`,
            sender: `성명: <strong>이긍석 및 아래 연명 구분소유주/입주자 일동</strong> (상세 인적사항 및 호실은 하단 연명부 참조)<br>연락처: <br>주소: 경기도 안산시 단원구 산단로 342(안산유통상가 1차) 편익A동 지하 8호 외 각 소유주별 사업장`,
            recipientLabel: "1. 수신인",
            senderLabel: "2. 발신인",
            titleLabel: "3. 제 목:",
            titleVal: "관리비 미납금 납부 최고 내용증명에 대한 반박 및 소명 요구의 건",
            body: `1) 본 발신인(이긍석 및 하단 연명 소유주 일동)들은 귀 하(이하 '수신인')가 2026년 5월 하순경 각 소유주별로 발송한 ‘관리비 미납금 납부 최고’에 관한 내용증명(우편물 일체)을 수신하고, 이에 대한 공통의 답변 및 정당한 항변권을 행사하고자 본 문서를 발송합니다.

2) 본 발신인들은 안산유통상가 1차의 정당한 구분소유자 및 입주자로서, 상가의 공용부분 관리 및 유지·보수에 따른 정당한 관리비를 납부할 의사가 유효함을 명백히 밝힙니다. 단, 이는 집합건물법 및 정당한 관리규약에 의거하여 투명하고 공정하게 산정된 관리비임을 전제로 합니다.

3) 본 발신인들은 귀 수신인이 최고한 미납 관리비 부과 절차와 회계 처리에 심각한 불투명성 및 정당성 의혹을 인지하고 있으며, 이에 대한 명확한 해명과 분쟁 해결 시까지 관리비 납부를 잠정 유예한다는 취지의 의견을 이미 지속적으로 피력하거나 통고한 바 있습니다.

4) 그럼에도 불구하고 귀 수신인은 발신인들이 제기한 합리적 의혹이나 납부유예 요청에 대한 실질적인 해명 및 소명 자료 제시도 없이, 단지 7일이라는 임의의 독촉 기간을 정하여 지급명령 신청 및 강제집행 등을 운위하며 법적 압박을 가해온바, 본 발신인들은 이에 깊은 유감을 표명합니다.

5) 현재 귀 수신인이 청구하는 각 소유주별 미납 관리비 내역 및 고율의 연체료는 현재 상가 내 소유주들로 구성된 '추진위원회' 등과 귀 수신인 간에 법적·행정적 분쟁이 치열하게 진행 중인 사안입니다. 따라서 본 발신인들은 아래의 사항이 명확히 소명되거나 법적 분쟁이 종결되기 전까지는 귀 수신인이 일방적으로 산정하여 청구한 금액을 그대로 수용할 수 없습니다.

가. 관리비 및 연체료 산정 근거의 투명한 공개 요구: 각 소유주별로 청구된 월별 관리비 총액과 이에 가산된 연체료의 세부 회계 산정 기준, 그리고 정당한 관리규약에 규정된 이율 근거 제시 요구

나. 임시관리인의 집행 권한 한계: 법원으로부터 선임된 임시관리인의 직무 범위가 적법한 절차를 거치지 않은 현 청구 행위 및 소송 제기 권한에 합치하는지에 대한 법적 정당성 입증 요구

6) 결론적으로 본 발신인들은 고의적인 체납을 하고 있는 것이 아니며, 정당한 권한을 가진 주체가 투명한 회계 기준에 따라 산정한 정당한 금액임이 입증된다면 언제든 납부 의무를 이행할 것입니다. 그러나 현재와 같은 불투명하고 일방적인 압박성 독촉에는 응할 수 없음을 분명히 합니다.

7) 만약 귀 수신인이 본 발신인들의 정당한 소명 요구를 거부하고 일방적인 지급명령 신청 등 민사상 법적 절차를 강행할 경우, 본 발신인들 역시 법원에 즉각적인 이의신청 및 본안 소송을 통해 부과 절차의 위법성을 끝까지 다툴 것이며, 이로 인해 발생하는 모든 법적 책임과 비용은 부당한 청구를 강행한 귀 수신인 측에 있음을 엄중히 고지하는 바입니다.`,
            footerSigner: "발신인: 이긍석 (인)",
            rosterDesc: "본 연명부에 서명한 구분소유자 및 임차인 일동은 관리비 미납금 납부 최고에 대한 반박 및 소명 요구 답변서 내용에 동의하며 공동으로 의사를 표시합니다."
        }
    };
    
// 2. Global State
    let currentMode = 'basement'; // Default to basement
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
            singlePreviewName.textContent = '성명 입력 대기';
            singlePreviewName.style.color = '#94a3b8';
        }

        // Update Address
        if (newAddressInput.value.trim()) {
            singlePreviewAddress.textContent = newAddressInput.value;
            singlePreviewAddress.style.color = '#000000';
        } else {
            singlePreviewAddress.textContent = '동호수 입력 대기';
            singlePreviewAddress.style.color = '#94a3b8';
        }

        // Update Log
        singlePreviewLog.innerHTML = `
            IP: ${clientIp} | 기기: ${clientDevice} | 일시: ${timestampStr}
        `;
        singlePreviewLog.style.color = '#555555';
    }

    newNameInput.addEventListener('input', updateLivePreviewTexts);
    newAddressInput.addEventListener('input', updateLivePreviewTexts);

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
            const res = await fetch(`/api/get-complaints?currentMode=${currentMode}`);
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
        const storageKey = `ansan_roster_data_${currentMode}`;
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
        const storageKey = `ansan_roster_data_${currentMode}`;
        localStorage.setItem(storageKey, JSON.stringify(roster));
        rosterCountSpan.textContent = roster.length;
    }

    // 6. Render Dashboard Table (Sidebar view)
    function renderDashboardRoster() {
        rosterTbody.innerHTML = '';
        if (roster.length === 0) {
            rosterTbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#94a3b8;padding:20px;">누적된 대시보드 명단이 없습니다.</td></tr>`;
            return;
        }

        roster.forEach((member, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td><strong>${escapeHtml(member.name)}</strong></td>
                <td>${escapeHtml(member.address)}</td>
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

    // 7. Operations
    async function addMember(name, address) {
        if (new Date() >= new Date('2026-06-05T11:00:00+09:00')) {
            alert('오전 11시 제출 마감 시간이 지나 더 이상 제출할 수 없습니다.');
            return;
        }

        if (!name.trim() || !address.trim()) {
            alert('성명과 동호수를 모두 입력해주세요.');
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
            alert('디지털 서명 패드에 서명을 그려주세요.');
            return;
        }

        try {
            const res = await fetch('/api/save-complaint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, address, signatureImg, pin, currentMode })
            });
            const data = await res.json();
            if (data.success) {
                alert('제출이 완료되었습니다.');
            } else {
                alert('제출 중 오류가 발생했습니다: ' + data.message);
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
        newPinInput.value = '';
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
                const res = await fetch('/api/delete-complaint', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ index: targetMember.index, pin, currentMode })
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

    function deleteMember(index) {
        // Keeping compatibility function
        if (confirm('해당 명단을 목록에서 삭제하시겠습니까?')) {
            roster.splice(index, 1);
            saveData();
            renderDashboardRoster();
        }
    }

    // 8. Event Listeners
    btnAddMember.addEventListener('click', () => {
        addMember(newNameInput.value, newAddressInput.value);
    });

    newAddressInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            btnAddMember.click();
        }
    });

    // Tab switching event handlers
    tabGround.addEventListener('click', () => {
        alert('준비중입니다.');
    });

    tabBasement.addEventListener('click', () => {
        switchMode('basement');
    });

    function switchMode(mode) {
        currentMode = mode;
        if (mode === 'ground') {
            tabGround.classList.add('active');
            tabBasement.classList.remove('active');
            newAddressInput.placeholder = "예: A동 101호";
        } else {
            tabGround.classList.remove('active');
            tabBasement.classList.add('active');
            newAddressInput.placeholder = "예: 지하 나-40호";
        }
        updateDocumentTemplate();
        loadSavedData();
        updateLivePreviewTexts();
    }

    // Update elements within `#page-main` based on the active template
    function updateDocumentTemplate() {
        const template = TEMPLATES[currentMode];
        
        document.getElementById('doc-title').textContent = template.title;
        document.getElementById('doc-subtitle').textContent = template.subtitle;
        
        const rowRecipient = document.getElementById('row-recipient');
        rowRecipient.querySelector('.meta-label').innerHTML = template.recipientLabel;
        document.getElementById('val-recipient').innerHTML = template.recipient;

        const rowSender = document.getElementById('row-sender');
        rowSender.querySelector('.meta-label').innerHTML = template.senderLabel;
        document.getElementById('val-sender').innerHTML = template.sender;

        const rowTitle = document.getElementById('row-title');
        rowTitle.querySelector('.meta-label').innerHTML = template.titleLabel;
        document.getElementById('val-title').innerHTML = template.titleVal;

        document.getElementById('doc-body-content').innerHTML = template.body;
        document.getElementById('doc-signer-line').innerHTML = template.footerSigner;
        document.getElementById('roster-page-desc').textContent = template.rosterDesc;
    }

    // 9. Printing Logic with Multi-page Partitioning
    btnPrint.addEventListener('click', () => {
        const password = prompt('관리자 암호를 입력하세요:');
        if (password !== '3686') {
            alert('암호가 올바르지 않습니다.');
            return;
        }

        if (roster.length === 0) {
            alert('인쇄할 누적 명단이 없습니다. 동의 및 서명을 먼저 추가해주세요.');
            return;
        }

        // Cache the current screen-only markup
        const originalMarkup = documentPagesContainer.innerHTML;

        // Number of roster rows per A4 page to prevent overflow
        const rowsPerPage = 12;
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
                const signHTML = member.signatureImg 
                    ? `<img src="${member.signatureImg}" class="signature-img-preview">`
                    : `<div style="font-size: 8pt; color: #aaa; text-align: center; border: 1px dashed #ccc; padding: 4px; border-radius: 4px; width: 60px; margin: 0 auto;">(서명/인)</div>`;

                rowsHTML += `
                    <tr>
                        <td>${globalIndex}</td>
                        <td style="font-weight:700;">${escapeHtml(member.name)}</td>
                        <td class="left-align">${escapeHtml(member.address)}</td>
                        <td>${signHTML}</td>
                        <td class="preview-roster-log">
                            IP: ${member.ip} | 기기: ${simplifyUserAgent(member.device)} | 일시: ${member.timestamp}
                        </td>
                    </tr>
                `;
            });

            newContent += `
                <article class="a4-page">
                    <h2 class="doc-sub-title">【 연 명 부 】</h2>
                    <p class="roster-desc" style="font-size: 9.5pt; margin-bottom: 12pt;">
                        ${escapeHtml(TEMPLATES[currentMode].rosterDesc)}
                        <span style="float: right; font-size: 8.5pt; color: #666;">(누적 명단 Page ${pageIdx + 1} / ${totalPages})</span>
                    </p>

                    <table class="preview-roster-table">
                        <thead>
                            <tr>
                                <th style="width: 8%;">번호</th>
                                <th style="width: 15%;">성명</th>
                                <th style="width: 25%;">주소 / 동호수</th>
                                <th style="width: 17%;">서명 또는 날인</th>
                                <th style="width: 35%;">디지털 인증 로그 (IP / 환경 / 일시)</th>
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

        // Replace preview canvas with full compiled pages
        documentPagesContainer.innerHTML = newContent;

        // Open print dialog (this runs synchronously on most browsers)
        setTimeout(() => {
            window.print();
            // Restore back to single-user live preview state
            documentPagesContainer.innerHTML = originalMarkup;
            // Re-bind DOM selectors that were destroyed during HTML replacement
            rebindPreviewElements();
            
            // Automatically export and download Excel CSV
            downloadCSV();
            
            // Alert user of successful submission
            alert('제출(인쇄)이 완료되었습니다!\n누적된 연명부 명단 엑셀(CSV) 파일이 컴퓨터에 자동으로 저장됩니다.');
        }, 100);
    });

    // Helper to generate and download Excel-compatible CSV
    function downloadCSV() {
        if (roster.length === 0) return;
        
        // Add UTF-8 BOM so Excel opens Korean characters cleanly
        let csvContent = "\uFEFF";
        csvContent += "순번,성명,동호수,IP 주소,접속 기기,서명 일시\n";

        roster.forEach((member, index) => {
            const row = [
                index + 1,
                `"${member.name.replace(/"/g, '""')}"`,
                `"${member.address.replace(/"/g, '""')}"`,
                `"${member.ip}"`,
                `"${member.device.replace(/"/g, '""')}"`,
                `"${member.timestamp}"`
            ].join(",");
            csvContent += row + "\n";
        });

        const modeStr = currentMode === 'ground' ? '지상' : '지하';
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `안산유통상가_1차_${modeStr}_연명부_작성기록_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Helper to rebind preview elements because innerHTML replacement breaks references
    function rebindPreviewElements() {
        // Reassign DOM references
        window.singlePreviewName = document.getElementById('single-preview-name');
        window.singlePreviewAddress = document.getElementById('single-preview-address');
        window.singlePreviewSign = document.getElementById('single-preview-sign');
        window.singlePreviewLog = document.getElementById('single-preview-log');
        
        updateLivePreviewTexts();
        updateDocumentTemplate();
    }

    // --- Timer Countdown ---
    const deadline = new Date('2026-06-05T11:00:00+09:00');
    const timerElement = document.getElementById('deadline-timer');
    const timerContainer = document.getElementById('deadline-timer-container');

    function updateTimer() {
        const now = new Date();
        const diff = deadline - now;

        if (diff <= 0) {
            timerContainer.style.backgroundColor = '#f1f5f9';
            timerContainer.style.borderColor = '#cbd5e1';
            timerContainer.style.color = '#64748b';
            timerContainer.innerHTML = '⚠️ 제출이 마감되었습니다. (마감시간: 오전 11시)';
            btnAddMember.disabled = true;
            btnAddMember.style.backgroundColor = '#cbd5e1';
            btnAddMember.style.color = '#64748b';
            btnAddMember.style.cursor = 'not-allowed';
            btnAddMember.textContent = '제출 마감됨';
            return true;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const hoursStr = String(hours).padStart(2, '0');
        const minutesStr = String(minutes).padStart(2, '0');
        const secondsStr = String(seconds).padStart(2, '0');

        timerElement.textContent = `${hoursStr}:${minutesStr}:${secondsStr}`;
        return false;
    }

    // --- Init Startup ---
    detectDeviceInfo();
    fetchPublicIp().then(() => {
        // Apply default template content
        updateDocumentTemplate();
        loadSavedData();
    });

    const isClosedInitially = updateTimer();
    if (!isClosedInitially) {
        const timerInterval = setInterval(() => {
            if (updateTimer()) {
                clearInterval(timerInterval);
            }
        }, 1000);
    }
});
