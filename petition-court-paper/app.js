document.addEventListener('DOMContentLoaded', () => {
    // Input elements
    const inputName = document.getElementById('input-name');
    const inputBirth = document.getElementById('input-birth');
    const inputAddress = document.getElementById('input-address');
    const inputUnit = document.getElementById('input-unit');
    const inputPhone = document.getElementById('input-phone');
    const chipBtns = document.querySelectorAll('.chip-btn');

    // Preview elements
    const previewName = document.getElementById('preview-name');
    const previewUnit = document.getElementById('preview-unit');
    const previewPhone = document.getElementById('preview-phone');
    const previewJumin = document.getElementById('preview-jumin');
    const previewAddress = document.getElementById('preview-address');
    const previewYear = document.getElementById('preview-year');
    const previewMonth = document.getElementById('preview-month');
    const previewDay = document.getElementById('preview-day');

    // Buttons
    const btnDownloadPdf = document.getElementById('btn-download-pdf');
    const btnPrint = document.getElementById('btn-print');
    const btnReset = document.getElementById('btn-reset');

    // Helper: Get Today's Date
    function getTodayParts() {
        const today = new Date();
        return {
            year: today.getFullYear(),
            month: today.getMonth() + 1,
            day: today.getDate()
        };
    }

    // Set initial date preview to blank day
    const initToday = getTodayParts();
    previewYear.textContent = initToday.year;
    previewMonth.textContent = initToday.month;
    previewDay.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;';

    let currentBaseAddress = "경기도 안산시 단원구 산단로 326 안산유통상가";

    // Auto hyphen for Phone input (010-1234-5678)
    function formatPhoneNumber(value) {
        const clean = value.replace(/[^0-9]/g, '');
        if (clean.length <= 3) {
            return clean;
        } else if (clean.length <= 7) {
            return `${clean.substring(0, 3)}-${clean.substring(3)}`;
        } else {
            return `${clean.substring(0, 3)}-${clean.substring(3, 7)}-${clean.substring(7, 11)}`;
        }
    }

    inputPhone.addEventListener('input', (e) => {
        const formatted = formatPhoneNumber(e.target.value);
        e.target.value = formatted;
        previewPhone.textContent = formatted;
    });

    // Birth Date input (strictly 6 digits, e.g. 700101 -> displays 700101 cleanly)
    inputBirth.addEventListener('input', (e) => {
        const clean = e.target.value.replace(/[^0-9]/g, '').substring(0, 6);
        e.target.value = clean;
        previewJumin.textContent = clean;
    });

    // Helper to update combined full address
    function updateFullAddress() {
        const base = inputAddress.value.trim();
        const unit = inputUnit.value.trim();
        if (base && unit) {
            previewAddress.textContent = `${base} ${unit}`;
        } else {
            previewAddress.textContent = base || unit;
        }
    }

    // Address Chip Buttons (Consent Style)
    chipBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            chipBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const addr = btn.getAttribute('data-address');
            currentBaseAddress = addr;
            inputAddress.value = addr;
            updateFullAddress();
        });
    });

    inputAddress.addEventListener('input', () => {
        chipBtns.forEach(b => b.classList.remove('active'));
        updateFullAddress();
    });

    inputUnit.addEventListener('input', (e) => {
        previewUnit.textContent = e.target.value.trim();
        updateFullAddress();
    });

    inputName.addEventListener('input', (e) => {
        previewName.textContent = e.target.value.trim();
    });

    // Reset button
    btnReset.addEventListener('click', () => {
        inputName.value = '';
        inputBirth.value = '';
        inputUnit.value = '';
        inputPhone.value = '';
        inputAddress.value = '경기도 안산시 단원구 산단로 326 안산유통상가';
        
        chipBtns.forEach(b => b.classList.remove('active'));
        const defaultChip = document.getElementById('chip-default');
        if (defaultChip) defaultChip.classList.add('active');

        previewName.textContent = '';
        previewUnit.textContent = '';
        previewPhone.textContent = '';
        previewJumin.textContent = '';
        previewAddress.textContent = '';
        
        const resetToday = getTodayParts();
        previewYear.textContent = resetToday.year;
        previewMonth.textContent = resetToday.month;
        previewDay.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;';
    });

    // Auto Fill Date for Printing/Downloading
    function applyTodayDateForPrint() {
        const t = getTodayParts();
        previewYear.textContent = t.year;
        previewMonth.textContent = t.month;
        previewDay.textContent = t.day;
    }

    // Print button
    btnPrint.addEventListener('click', () => {
        applyTodayDateForPrint();
        window.print();
    });

    // Auto update date before window.print() shortcut (Ctrl+P)
    window.addEventListener('beforeprint', () => {
        applyTodayDateForPrint();
    });

    // Download PDF button - DIRECT jsPDF CANVAS EXPORT GUARANTEES STRICT 1 SINGLE PAGE
    btnDownloadPdf.addEventListener('click', async () => {
        applyTodayDateForPrint();
        const element = document.getElementById('petition-document');
        const nameStr = inputName.value.trim() ? `_${inputName.value.trim()}` : '';
        const filename = `법원탄원서_2026카합50149${nameStr}.pdf`;

        btnDownloadPdf.disabled = true;
        const originalText = btnDownloadPdf.innerHTML;
        btnDownloadPdf.innerHTML = '<span>⏳ PDF 생성 중...</span>';

        try {
            // Render element to high resolution canvas
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.98);

            // Access jsPDF class directly
            let jsPDFClass = null;
            if (window.jspdf && window.jspdf.jsPDF) {
                jsPDFClass = window.jspdf.jsPDF;
            } else if (window.jsPDF) {
                jsPDFClass = window.jsPDF;
            } else if (window.html2pdf && window.html2pdf.jsPDF) {
                jsPDFClass = window.html2pdf.jsPDF;
            }

            if (jsPDFClass) {
                const pdf = new jsPDFClass('p', 'mm', 'a4');
                // Fit canvas exactly onto 1 A4 page (210mm x 297mm)
                pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
                pdf.save(filename);
            } else {
                // Fallback to html2pdf if direct jsPDF is not bound
                const opt = {
                    margin: 0,
                    filename: filename,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };
                await window.html2pdf().set(opt).from(element).save();
            }

            btnDownloadPdf.disabled = false;
            btnDownloadPdf.innerHTML = originalText;
        } catch (err) {
            console.error('PDF generation error:', err);
            alert('PDF 생성 중 오류가 발생했습니다. A4 인쇄 기능을 이용하여 PDF로 저장해 주세요.');
            btnDownloadPdf.disabled = false;
            btnDownloadPdf.innerHTML = originalText;
        }
    });
});
