import './style.css'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mqbubmrsgiixnyroqsys.supabase.co'
const supabaseKey = 'sb_publishable_CVPwjFmjPNAEMIGrbZfQ_g_bzD5DlIO'
const supabase = createClient(supabaseUrl, supabaseKey)

// Presence (Real-time Online Users)
const userStatus = supabase.channel('online-users', {
  config: { presence: { key: Math.random().toString(36).substring(2, 11) } }
});

userStatus
  .on('presence', { event: 'sync' }, () => {
    const newState = userStatus.presenceState();
    let onlineCount = 0;
    for (const id in newState) {
      onlineCount += 1;
    }
    const countEl = document.getElementById('online-count');
    if (countEl) countEl.textContent = onlineCount || 1;
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await userStatus.track({ online_at: new Date().toISOString() });
    }
  });

// Initial State
let state = {
  posts: [],
  isAdmin: false,
  editingId: null,
  images: [],
  selectedIds: [], 
  verifyAction: null, // 'edit', 'user_delete', 'admin_delete', 'admin_login'
  verifyTargetPost: null,
  ADMIN_PASSWORD: 'ansan2026',
  currentSlide: 0
};

// DOM Elements
const complaintsList = document.getElementById('complaints-list');
const openModalBtn = document.getElementById('open-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const complaintModal = document.getElementById('complaint-modal');
const printReportBtn = document.getElementById('print-report-btn');
const detailModal = document.getElementById('detail-modal');
const detailContent = document.getElementById('detail-content');
const complaintForm = document.getElementById('complaint-form');
const adminToggleBtn = document.getElementById('admin-toggle-btn');
const closeDetailBtn = document.getElementById('close-detail-btn');
const closeDetailTopBtn = document.getElementById('close-detail-top-btn');
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('file-input');
const previewContainer = document.getElementById('preview-container');
const adminControls = document.getElementById('admin-controls');
const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');
const selectAllBtn = document.getElementById('select-all-btn');

// Print Elements
const printOptionModal = document.getElementById('print-option-modal');
const printTableType = document.getElementById('print-table-type');
const printCardType = document.getElementById('print-card-type');
const closePrintModalBtn = document.getElementById('close-print-modal');

// Password Verification Elements
const verifyModal = document.getElementById('verify-modal');
const verifyTitle = document.querySelector('#verify-modal h2');
const verifyDesc = document.querySelector('#verify-modal p');
const verifyInput = document.getElementById('verify-password-input');
const confirmVerifyBtn = document.getElementById('confirm-verify-btn');
const cancelVerifyBtn = document.getElementById('cancel-verify-btn');
const capsWarning = document.getElementById('caps-warning');

// Slider Elements
const sliderContainer = document.getElementById('slider-container');
const sliderDots = document.querySelectorAll('.dot');

// --- Helper Functions ---

const fetchPosts = async () => {
  const { data, error } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
  if (!error && data) {
    state.posts = data.map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      description: p.description,
      password: p.password,
      images: p.images || [],
      views: p.views || 0,
      createdAt: p.created_at
    }));
    renderPosts();
  }
};

const incrementViews = async (id) => {
  const post = state.posts.find(p => p.id === id);
  if (!post) return;
  post.views = (post.views || 0) + 1;
  const card = document.querySelector(`.complaint-card[data-id="${id}"] .view-count`);
  if (card) card.textContent = `조회수 ${post.views}`;
  
  await supabase.from('complaints').update({ views: post.views }).eq('id', id);
};

const getFixedPublicUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  if (url.includes('/storage/v1/object/') && !url.includes('/storage/v1/object/public/')) {
    return url.replace('/storage/v1/object/', '/storage/v1/object/public/');
  }
  return url;
};

const uploadBase64Image = async (dataUrl) => {
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    const { data, error } = await supabase.storage.from('images').upload(fileName, blob, { 
      contentType: 'image/jpeg',
      upsert: true 
    });
    if (error) return null;
    const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(fileName);
    return getFixedPublicUrl(publicUrlData.publicUrl);
  } catch(e) {
    return null;
  }
};

const formatDate = (dateString, showTime = true) => {
  const options = showTime 
    ? { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }
    : { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(dateString).toLocaleDateString('ko-KR', options);
};

const getCategoryColor = (category) => {
  const colors = {
    '공용시설 보수': '#eff6ff',
    '전기/조명': '#fffbeb',
    '소방/안전': '#fef2f2',
    '냉난방/공조': '#ecfeff',
    '주차/교통': '#f5f3ff',
    '청소/미화': '#f0fdf4',
    '보안/CCTV': '#f8fafc',
    '관리비/행정': '#fdf2f8',
    'default': '#f3f4f6'
  };
  const textColors = {
    '공용시설 보수': '#2563eb',
    '전기/조명': '#d97706',
    '소방/안전': '#dc2626',
    '냉난방/공조': '#0891b2',
    '주차/교통': '#7c3aed',
    '청소/미화': '#16a34a',
    '보안/CCTV': '#475569',
    '관리비/행정': '#db2777',
    'default': '#1e293b'
  };
  return { bg: colors[category] || colors.default, text: textColors[category] || textColors.default };
};

// --- Core Logic ---

const renderPosts = () => {
  if (state.isAdmin) {
    document.body.classList.add('admin-mode');
    adminToggleBtn.classList.add('active');
    adminToggleBtn.innerHTML = '🔓 관리자 모드 활성';
    printReportBtn.style.display = 'block';
    selectAllBtn.style.display = 'block';
  } else {
    document.body.classList.remove('admin-mode');
    adminToggleBtn.classList.remove('active');
    adminToggleBtn.innerHTML = '🔒 관리자 모드';
    printReportBtn.style.display = 'none';
    selectAllBtn.style.display = 'none';
    state.selectedIds = [];
  }

  // Update Select All Button Text
  if (state.isAdmin) {
    const isAllSelected = state.posts.length > 0 && state.selectedIds.length === state.posts.length;
    selectAllBtn.innerHTML = isAllSelected ? '✅ 전체 해제' : '✅ 전체 선택';
  }

  if (state.posts.length === 0) {
    complaintsList.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 6rem 2rem; color: var(--text-muted);">
        <p style="font-size: 1.75rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-primary);">📭 아직 소통의 시작이 없습니다.</p>
        <p>상가 발전을 위한 여러분의 목소리를 들려주세요.</p>
      </div>
    `;
    return;
  }

  complaintsList.innerHTML = state.posts
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(post => {
      const colors = getCategoryColor(post.category);
      const isSelected = state.selectedIds.includes(post.id);
      
      return `
      <div class="complaint-card ${isSelected ? 'selected' : ''}" data-id="${post.id}">
        <div class="card-header">
          <div class="card-title-meta">
            <span class="category-tag" style="background: ${colors.bg} !important; color: ${colors.text} !important">${post.category}</span>
            <span class="timestamp">${formatDate(post.createdAt, false)}</span>
          </div>
          <div class="header-admin-group">
            <div class="card-actions">
              <button class="btn btn-icon edit-btn" style="cursor: pointer;">수정</button>
              <button class="btn btn-icon delete-btn" style="color: #ef4444; cursor: pointer;">삭제</button>
            </div>
            <span class="view-count">조회수 ${post.views || 0}</span>
          </div>
        </div>
        
        <div class="card-content" style="cursor: pointer; margin-top: 1rem;">
          <h3>${post.title}</h3>
          <p>${post.description}</p>
        </div>

        ${post.images && post.images.length > 0 ? `
          <div class="card-images-preview">
            <img src="${getFixedPublicUrl(post.images[0])}" class="card-image" alt="첨부 이미지" style="cursor: pointer;">
          </div>
        ` : ''}
      </div>
    `}).join('');

  document.querySelectorAll('.complaint-card').forEach(card => {
    const id = card.dataset.id;
    const post = state.posts.find(p => p.id === id);

    card.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;

      if (state.isAdmin) {
        // Toggle selection in admin mode
        if (state.selectedIds.includes(id)) {
          state.selectedIds = state.selectedIds.filter(idx => idx !== id);
        } else {
          state.selectedIds.push(id);
        }
        renderPosts();
      } else {
        // Just open detail in user mode
        openDetail(post);
        incrementViews(id);
      }
    });

    card.querySelector('.edit-btn').onclick = (e) => {
      e.stopPropagation();
      if (state.isAdmin) {
        openEditModal(post);
      } else {
        openVerifyModal('edit', post);
      }
    };

    card.querySelector('.delete-btn').onclick = (e) => {
      e.stopPropagation();
      if (state.isAdmin) {
        openVerifyModal('admin_delete', post);
      } else {
        openVerifyModal('user_delete', post);
      }
    };
  });
};

const deletePost = async (id) => {
  await supabase.from('complaints').delete().eq('id', id);
  await fetchPosts();
  state.selectedIds = state.selectedIds.filter(idx => idx !== id);
  renderPosts();
};

const openDetail = (post) => {
  const colors = getCategoryColor(post.category);
  detailContent.innerHTML = `
    <div class="detail-header">
      <span class="category-tag" style="background: ${colors.bg} !important; color: ${colors.text} !important; border: 1px solid rgba(0,0,0,0.05);">${post.category}</span>
      <h2 style="margin-top: 1.5rem;">${post.title}</h2>
      <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 3rem;">작성일시: ${formatDate(post.createdAt)} &nbsp;|&nbsp; 조회수: ${post.views || 0}</p>
    </div>
    <div class="detail-body">
      <p style="white-space: pre-wrap;">${post.description}</p>
      ${post.images && post.images.length > 0 ? `
        <div class="detail-images" style="margin-top: 4rem; display: grid; gap: 2rem; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));">
          ${post.images.map(img => `<img src="${getFixedPublicUrl(img)}" style="width: 100%; border-radius: 2.5rem; box-shadow: var(--shadow-lg);" alt="첨부 이미지">`).join('')}
        </div>
      ` : ''}
    </div>
  `;
  detailModal.classList.add('active');
};

const closeDetail = () => {
  detailModal.classList.remove('active');
};

const addPost = async (title, category, description, password) => {
  const submitBtn = document.querySelector('#complaint-form button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = '업로드 중...';
  submitBtn.disabled = true;

  try {
    const uploadedImageUrls = [];
    for (const imgSrc of state.images) {
      if (imgSrc.startsWith('http')) {
        uploadedImageUrls.push(imgSrc);
      } else {
        const url = await uploadBase64Image(imgSrc);
        if (url) uploadedImageUrls.push(url);
      }
    }

    if (state.editingId) {
      await supabase.from('complaints').update({
        title, category, description, password, images: uploadedImageUrls
      }).eq('id', state.editingId);
    } else {
      await supabase.from('complaints').insert([{
        title, category, description, password, images: uploadedImageUrls
      }]);
    }
  } catch (error) {
    console.error("Error saving post:", error);
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
  
  await fetchPosts();
  closeModal();
};

const toggleAllSelection = () => {
  if (state.selectedIds.length === state.posts.length) {
    state.selectedIds = [];
  } else {
    state.selectedIds = state.posts.map(p => p.id);
  }
  renderPosts();
};

// --- Slider Logic ---

const updateSlider = (index) => {
  state.currentSlide = index;
  sliderContainer.style.transform = `translateX(-${index * (100 / 6)}%)`;
  sliderDots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === index);
  });
};

const nextSlide = () => {
  let next = (state.currentSlide + 1) % 6;
  updateSlider(next);
};

let sliderInterval = setInterval(nextSlide, 7000);

sliderDots.forEach((dot, idx) => {
  dot.onclick = () => {
    clearInterval(sliderInterval);
    updateSlider(idx);
    sliderInterval = setInterval(nextSlide, 7000);
  };
});

// --- UI Actions ---

const openModal = () => {
  state.editingId = null;
  complaintForm.reset();
  previewContainer.innerHTML = '';
  state.images = [];
  document.querySelector('#complaint-modal h2').textContent = '민원 등록';
  document.querySelector('#complaint-form button[type="submit"]').textContent = '제출하기';
  complaintModal.classList.add('active');
};

const openEditModal = (post) => {
  state.editingId = post.id;
  document.getElementById('title').value = post.title;
  document.getElementById('category').value = post.category;
  document.getElementById('description').value = post.description;
  document.getElementById('password').value = post.password;
  state.images = [...(post.images || [])];
  renderPreviews();
  document.querySelector('#complaint-modal h2').textContent = '민원 수정';
  document.querySelector('#complaint-form button[type="submit"]').textContent = '수정하기';
  complaintModal.classList.add('active');
};

const closeModal = () => {
  complaintModal.classList.remove('active');
  state.editingId = null;
};

const handleAdminToggle = () => {
  if (state.isAdmin) {
    state.isAdmin = false;
    renderPosts();
  } else {
    openVerifyModal('admin_login');
  }
};

// --- Verification Logic ---

const openVerifyModal = (action, post = null) => {
  state.verifyAction = action;
  state.verifyTargetPost = post;
  verifyInput.value = '';
  verifyInput.style.display = 'block';
  capsWarning.style.display = 'none';
  
  if (action === 'admin_login') {
    verifyTitle.textContent = '관리자 인증';
    verifyDesc.textContent = '시스템 관리를 위해 인증이 필요합니다.';
    verifyInput.placeholder = '관리자 전용 암호';
  } else if (action === 'admin_delete') {
    verifyTitle.textContent = '데이터 삭제';
    verifyDesc.textContent = '관리자 권한으로 해당 민원을 영구 삭제하시겠습니까?';
    verifyInput.style.display = 'none';
  } else {
    verifyTitle.textContent = '본인 인증';
    verifyDesc.textContent = '민원 관리(수정/삭제)를 위해 비밀번호를 입력해주세요.';
    verifyInput.placeholder = '비밀번호 4자리';
  }
  
  verifyModal.classList.add('active');
  if (action !== 'admin_delete') setTimeout(() => verifyInput.focus(), 150);
};

const closeVerifyModal = () => {
  verifyModal.classList.remove('active');
  state.verifyAction = null;
  state.verifyTargetPost = null;
};

const handleVerify = () => {
  const action = state.verifyAction;
  const post = state.verifyTargetPost;

  if (action === 'admin_login') {
    if (verifyInput.value.trim() === state.ADMIN_PASSWORD) {
      state.isAdmin = true;
      closeVerifyModal();
      renderPosts();
    } else {
      alert('암호가 올바르지 않습니다.');
      verifyInput.value = '';
      verifyInput.focus();
    }
    return;
  }

  if (action === 'admin_delete') {
    deletePost(post.id);
    closeVerifyModal();
    return;
  }

  if (verifyInput.value === post.password) {
    closeVerifyModal();
    if (action === 'edit') {
      openEditModal(post);
    } else if (action === 'user_delete') {
      deletePost(post.id);
    }
  } else {
    alert('비밀번호가 올바르지 않습니다.');
    verifyInput.value = '';
    verifyInput.focus();
  }
};

// Monitoring for uppercase in admin login
verifyInput.oninput = (e) => {
  if (state.verifyAction === 'admin_login') {
    const hasUpper = /[A-Z]/.test(e.target.value);
    capsWarning.style.display = hasUpper ? 'block' : 'none';
  }
};

// --- Image Handling ---

const renderPreviews = () => {
  previewContainer.innerHTML = '';
  state.images.forEach((src, index) => {
    const div = document.createElement('div');
    div.classList.add('preview-item');
    div.innerHTML = `
      <img src="${src}" class="preview-img">
      <button type="button" class="remove-img-btn">&times;</button>
    `;
    div.querySelector('button').onclick = () => {
      state.images.splice(index, 1);
      renderPreviews();
    };
    previewContainer.appendChild(div);
  });
};

const handleFiles = (files) => {
  const fileArray = Array.from(files);
  const remainingSlots = 5 - state.images.length;
  fileArray.slice(0, remainingSlots).forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      state.images.push(e.target.result);
      renderPreviews();
    };
    reader.readAsDataURL(file);
  });
};

// --- Print Report ---

const generateReportHtml = (posts, type) => {
  const title = "안산유통상가 추진위원회 민원 소통 현황 보고서";
  const dateStr = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  if (type === 'table') {
    return `
      <div style="padding: 40px; font-family: 'Malgun Gothic', sans-serif;">
        <h1 style="text-align: center; font-size: 24pt; margin-bottom: 10px; border-bottom: 2px solid #333; padding-bottom: 20px;">${title}</h1>
        <p style="text-align: right; border-bottom: 1px solid #eee; padding-bottom: 10px;">발행일: ${dateStr}</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 30px;">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="border: 1px solid #ddd; padding: 12px; text-align: center; width: 50px;">번호</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: center; width: 130px;">현장사진</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: center; width: 100px;">날짜</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: center; width: 120px;">분류</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">민원 제목 및 내용</th>
            </tr>
          </thead>
          <tbody>
            ${posts.slice(0, -1).map((post, index) => `
              <tr style="page-break-inside: avoid;">
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${index + 1}</td>
                <td style="border: 1px solid #ddd; padding: 10px; text-align: center; vertical-align: middle;">
                  ${post.images && post.images.length > 0 
                    ? `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(60px, 1fr)); gap: 4px; justify-content: center; align-items: center; width: 130px;">
                        ${post.images.map(img => `<img src="${img}" style="width: 100%; aspect-ratio: 4/3; object-fit: cover; border-radius: 4px; border: 1px solid #eee; display: block;">`).join('')}
                       </div>`
                    : `<span style="color: #999; font-size: 8pt;">사진없음</span>`
                  }
                </td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${formatDate(post.createdAt, false)}</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${post.category}</td>
                <td style="border: 1px solid #ddd; padding: 15px; text-align: left;">
                  <div style="font-weight: bold; font-size: 11pt; margin-bottom: 5px;">${post.title}</div>
                  <div style="font-size: 9pt; color: #444; white-space: pre-wrap;">${post.description}</div>
                </td>
              </tr>
            `).join('')}
          </tbody>
          <tbody style="page-break-inside: avoid;">
            ${posts.length > 0 ? (() => {
              const post = posts[posts.length - 1];
              const index = posts.length - 1;
              return `
              <tr>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${index + 1}</td>
                <td style="border: 1px solid #ddd; padding: 10px; text-align: center; vertical-align: middle;">
                  ${post.images && post.images.length > 0 
                    ? `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(60px, 1fr)); gap: 4px; justify-content: center; align-items: center; width: 130px;">
                        ${post.images.map(img => `<img src="${img}" style="width: 100%; aspect-ratio: 4/3; object-fit: cover; border-radius: 4px; border: 1px solid #eee; display: block;">`).join('')}
                       </div>`
                    : `<span style="color: #999; font-size: 8pt;">사진없음</span>`
                  }
                </td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${formatDate(post.createdAt, false)}</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${post.category}</td>
                <td style="border: 1px solid #ddd; padding: 15px; text-align: left;">
                  <div style="font-weight: bold; font-size: 11pt; margin-bottom: 5px;">${post.title}</div>
                  <div style="font-size: 9pt; color: #444; white-space: pre-wrap;">${post.description}</div>
                </td>
              </tr>
              `;
            })() : ''}
            <tr>
              <td colspan="5" style="border: none; padding-top: 50px; padding-bottom: 20px; text-align: center; font-size: 14pt; font-weight: bold;">안산유통상가 추진위원회 귀중</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  } else {
    // Detailed Card Layout - Visual Heavy & Professional
    const coverPage = `
      <div style="height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; font-family: 'Malgun Gothic', sans-serif; page-break-after: always; padding: 4vh; box-sizing: border-box; text-align: center;">
        <div style="border: 2px solid #1e293b; padding: 8vh 4%; width: 85%; max-width: 900px;">
          <h2 style="font-size: 18pt; color: #64748b; margin-bottom: 3vh; letter-spacing: 5px;">REPORT</h2>
          <h1 style="font-size: 36pt; font-weight: 900; color: #0f172a; margin-bottom: 1.5vh; line-height: 1.2;">안산유통상가 관리 및<br>시설 개선 현황 보고서</h1>
          <p style="font-size: 14pt; color: #64748b; margin-bottom: 10vh;">ADMINISTRATIVE MANAGEMENT DOCUMENT</p>
          
          <div style="margin-bottom: 15vh;">
            <p style="font-size: 16pt; color: #1e293b; margin-bottom: 1.5vh;">발행 일자: ${dateStr}</p>
            <p style="font-size: 16pt; color: #1e293b;">민원 총계: ${posts.length} 건</p>
          </div>

          <div style="margin-top: 5vh;">
            <div style="font-size: 24pt; font-weight: 900; color: #1e293b; border-top: 1px solid #1e293b; padding-top: 4vh; display: inline-block;">안산유통상가 추진위원회</div>
          </div>
        </div>
      </div>
    `;

    const contentPages = posts.map((post, index) => {
      return `
      <div style="padding: 30px 40px; font-family: 'Malgun Gothic', sans-serif; background: #fff; page-break-after: always; page-break-inside: avoid; height: 100vh; box-sizing: border-box;">
        <div style="border: 1px solid #e2e8f0; border-radius: 24px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); display: flex; flex-direction: column; height: 100%; box-sizing: border-box;">
          <div style="background: #1e293b; padding: 25px 40px; display: flex; justify-content: space-between; align-items: center; color: white; border-top-left-radius: 23px; border-top-right-radius: 23px; flex-shrink: 0;">
            <div>
              <span style="background: #3b82f6; padding: 5px 15px; border-radius: 8px; font-size: 10pt; font-weight: bold; margin-right: 15px;">CASE ID: #${post.id.slice(-6)}</span>
              <span style="font-size: 14pt; font-weight: bold;">[${post.category}]</span>
            </div>
            <span style="font-size: 11pt; opacity: 0.8;">접수번호: ${index + 1} / ${posts.length}</span>
          </div>
          
          <div style="padding: 40px; display: flex; flex-direction: row; gap: 40px; align-items: stretch; flex: 1; box-sizing: border-box;">
            <!-- Left Side: Text Content -->
            <div style="${!post.images || post.images.length === 0 ? 'width: 100%;' : 'flex: 1; min-width: 0;'}">
              <h3 style="font-size: 18pt; color: #0f172a; margin: 0 0 20px 0; border-left: 6px solid #3b82f6; padding-left: 20px; line-height: 1.4;">${post.title}</h3>
              <div style="background: #fdfdfd; border: 1.5px solid #f1f5f9; padding: 25px; border-radius: 12px; font-size: 11pt; color: #334155; line-height: 1.8; white-space: pre-wrap;">${post.description}</div>
            </div>

            <!-- Right Side: Dynamic Photo Layout -->
            ${(() => {
              if (!post.images || post.images.length === 0) return '';
              const imgs = post.images;
              let layoutHtml = '';
              const imgStyle = "object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);";
              
              if (imgs.length === 1) {
                layoutHtml = `<img src="${getFixedPublicUrl(imgs[0])}" style="width: 100%; max-height: 350px; ${imgStyle}">`;
              } else if (imgs.length === 2) {
                layoutHtml = `<div style="display: flex; gap: 15px;">
                  <img src="${getFixedPublicUrl(imgs[0])}" style="width: calc(50% - 7.5px); height: 250px; ${imgStyle}">
                  <img src="${getFixedPublicUrl(imgs[1])}" style="width: calc(50% - 7.5px); height: 250px; ${imgStyle}">
                </div>`;
              } else if (imgs.length === 3) {
                layoutHtml = `<div style="display: flex; gap: 15px;">
                  <img src="${getFixedPublicUrl(imgs[0])}" style="width: calc(50% - 7.5px); height: 300px; ${imgStyle}">
                  <div style="width: calc(50% - 7.5px); display: flex; flex-direction: column; gap: 15px;">
                    <img src="${getFixedPublicUrl(imgs[1])}" style="width: 100%; height: calc(150px - 7.5px); ${imgStyle}">
                    <img src="${getFixedPublicUrl(imgs[2])}" style="width: 100%; height: calc(150px - 7.5px); ${imgStyle}">
                  </div>
                </div>`;
              } else if (imgs.length === 4) {
                layoutHtml = `<div style="display: flex; flex-wrap: wrap; gap: 15px;">
                  ${imgs.map(img => `<img src="${getFixedPublicUrl(img)}" style="width: calc(50% - 7.5px); height: 180px; ${imgStyle}">`).join('')}
                </div>`;
              } else {
                layoutHtml = `<div style="display: flex; flex-direction: column; gap: 15px;">
                  <div style="display: flex; gap: 15px;">
                    <img src="${getFixedPublicUrl(imgs[0])}" style="width: calc(60% - 7.5px); height: 200px; ${imgStyle}">
                    <img src="${getFixedPublicUrl(imgs[1])}" style="width: calc(40% - 7.5px); height: 200px; ${imgStyle}">
                  </div>
                  <div style="display: flex; gap: 15px;">
                    ${imgs.slice(2).map(img => `<img src="${getFixedPublicUrl(img)}" style="width: calc(33.333% - 10px); height: 130px; ${imgStyle}">`).join('')}
                  </div>
                </div>`;
              }
              return `<div style="flex: 1; min-width: 0; page-break-inside: avoid; background: #fff;">
                        <p style="font-weight: bold; color: #64748b; margin-top: 0; margin-bottom: 15px; font-size: 10pt; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; display: inline-block;">📸 추가 증빙 사진 (${imgs.length}장)</p>
                        ${layoutHtml}
                      </div>`;
            })()}
          </div>

          <div style="background: #f8fafc; padding: 20px 40px; border-top: 1px solid #e2e8f0; text-align: right; color: #64748b; font-size: 10pt; border-bottom-left-radius: 23px; border-bottom-right-radius: 23px;">
            보고서 생성일: ${dateStr} | 안산유통상가 추진위원회 민원소통센터
          </div>
        </div>
      </div>
      `;
    }).join('');

    return coverPage + contentPages;
  }
};

const printReport = (type) => {
  let filteredPosts = [...state.posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (state.selectedIds.length > 0) {
    filteredPosts = filteredPosts.filter(p => state.selectedIds.includes(p.id));
  } 
  else if (startDateInput.value || endDateInput.value) {
    const start = startDateInput.value ? new Date(startDateInput.value) : new Date(0);
    const end = endDateInput.value ? new Date(endDateInput.value) : new Date();
    end.setHours(23, 59, 59, 999);

    filteredPosts = filteredPosts.filter(p => {
      const date = new Date(p.createdAt);
      return date >= start && date <= end;
    });
  }

  if (filteredPosts.length === 0) {
    alert('조건에 맞는 민원이 없습니다.');
    return;
  }

  const reportHtml = generateReportHtml(filteredPosts, type);
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>안산유통상가 추진위원회 보고서</title>
        <style>@page { size: auto; margin: 0; } body { margin: 0; }</style>
      </head>
      <body>${reportHtml}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
};

// --- Event Listeners ---

if (openModalBtn) openModalBtn.onclick = openModal;
closeModalBtn.onclick = closeModal;
closeDetailBtn.onclick = closeDetail;
if (closeDetailTopBtn) closeDetailTopBtn.onclick = closeDetail;
adminToggleBtn.onclick = handleAdminToggle;

// Print Report UI logic
printReportBtn.onclick = () => {
  printOptionModal.classList.add('active');
};
closePrintModalBtn.onclick = () => {
  printOptionModal.classList.remove('active');
};
printTableType.onclick = () => {
  printOptionModal.classList.remove('active');
  printReport('table');
};
printCardType.onclick = () => {
  printOptionModal.classList.remove('active');
  printReport('card');
};

selectAllBtn.onclick = toggleAllSelection;

cancelVerifyBtn.onclick = closeVerifyModal;
confirmVerifyBtn.onclick = handleVerify;
verifyInput.onkeypress = (e) => { if (e.key === 'Enter') handleVerify(); };

dropzone.onclick = () => fileInput.click();
fileInput.onchange = (e) => handleFiles(e.target.files);
dropzone.ondragover = (e) => { e.preventDefault(); dropzone.style.borderColor = 'var(--accent-primary)'; };
dropzone.ondragleave = () => { dropzone.style.borderColor = 'var(--border-color)'; };
dropzone.ondrop = (e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); };

complaintForm.onsubmit = (e) => {
  e.preventDefault();
  addPost(
    document.getElementById('title').value,
    document.getElementById('category').value,
    document.getElementById('description').value,
    document.getElementById('password').value
  );
};

// Initial Render
fetchPosts();
updateSlider(0);
