// JavaScript file

// 전역 변수
let currentUser = null;
let userLink = null;

// DOM 요소들
const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const loadingScreen = document.getElementById('loadingScreen');
const notificationModal = document.getElementById('notificationModal');

// 구글 스프레드시트 설정
const SPREADSHEET_CONFIG = {
    // Google Apps Script 웹 앱 URL
    baseUrl: 'https://script.google.com/macros/s/AKfycbwdAyUcEfnFfDFnDHRwrGeFg_1WIv-36RZqWgeJh_GDOyfb_XqsEG2AO1_BKudYmYAH/exec',
    // 실제 서버 사용
    useLocalStorage: false
};

// 앱 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

// 앱 초기화
function initializeApp() {
    // 로컬 스토리지에서 사용자 정보 확인
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
        loadUserLink();
    } else {
        showLoginScreen();
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 로그인 폼
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // 로그아웃 버튼
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // 링크 생성 버튼
    document.getElementById('createLinkBtn').addEventListener('click', createNewLink);
    
    // 링크 복사 버튼
    document.getElementById('copyLinkBtn').addEventListener('click', copyLinkToClipboard);
    
    // 링크 삭제 버튼
    document.getElementById('deleteLinkBtn').addEventListener('click', deleteLink);
    
    // 모달 닫기
    document.querySelector('.modal-close').addEventListener('click', closeModal);
    document.getElementById('modalConfirmBtn').addEventListener('click', closeModal);
    
    // 모달 외부 클릭 시 닫기
    notificationModal.addEventListener('click', function(e) {
        if (e.target === notificationModal) {
            closeModal();
        }
    });
}

// 로그인 처리
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!username || !password) {
        showNotification('이름과 비밀번호를 모두 입력해주세요.', 'error');
        return;
    }
    
    if (password.length !== 4 || !/^\d{4}$/.test(password)) {
        showNotification('비밀번호는 4자리 숫자로 입력해주세요.', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        // 사용자 인증 (Google Apps Script API 호출)
        const user = await authenticateUser(username, password);
        
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            showDashboard();
            loadUserLink();
            showNotification('로그인되었습니다!', 'success');
        } else {
            showNotification('이름 또는 비밀번호가 올바르지 않습니다.', 'error');
        }
    } catch (error) {
        console.error('로그인 오류:', error);
        showNotification('로그인 중 오류가 발생했습니다.', 'error');
    } finally {
        showLoading(false);
    }
}

// 사용자 인증 (Google Apps Script API 호출)
async function authenticateUser(username, password) {
    try {
        const response = await fetch(SPREADSHEET_CONFIG.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'auth',
                username: username,
                password: password
            })
        });

        if (response.ok) {
            const result = await response.json();
            if (result && !result.error) {
                return result;
            } else if (result && result.error) {
                console.error('Auth error:', result.error);
                return null;
            }
        }
    } catch (error) {
        console.error('API 호출 오류:', error);
        // API 호출 실패 시 로컬 스토리지로 폴백
        return authenticateUserLocal(username, password);
    }
    
    return null;
}

// 로컬 스토리지 인증 (폴백)
function authenticateUserLocal(username, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = users.find(user => 
        user.username === username && user.password === password
    );
    
    if (existingUser) {
        return existingUser;
    } else {
        // 새 사용자 생성
        const newUser = {
            id: generateUserId(),
            username: username,
            password: password,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        return newUser;
    }
}

// 사용자 ID 생성
function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 대시보드 표시
function showDashboard() {
    loginScreen.classList.remove('active');
    dashboardScreen.classList.add('active');
    
    // 사용자 정보 표시
    document.getElementById('userDisplayName').textContent = currentUser.username;
    document.getElementById('userName').textContent = currentUser.username;
}

// 로그인 화면 표시
function showLoginScreen() {
    dashboardScreen.classList.remove('active');
    loginScreen.classList.add('active');
}

// 로그아웃 처리
function handleLogout() {
    currentUser = null;
    userLink = null;
    localStorage.removeItem('currentUser');
    showLoginScreen();
    showNotification('로그아웃되었습니다.', 'success');
}

// 사용자 링크 로드
async function loadUserLink() {
    if (!currentUser) return;
    
    showLoading(true);
    
    try {
        const link = await getUserLink(currentUser.id);
        
        if (link && link.status !== 'deleted') {
            userLink = link;
            displayExistingLink(link);
        } else {
            showCreateLinkSection();
        }
    } catch (error) {
        console.error('링크 로드 오류:', error);
        showCreateLinkSection();
    } finally {
        showLoading(false);
    }
}

// 사용자 링크 가져오기
async function getUserLink(userId) {
    try {
        const response = await fetch(`${SPREADSHEET_CONFIG.baseUrl}?action=getLink&userId=${userId}`);
        
        if (response.ok) {
            const result = await response.json();
            if (result && !result.error) {
                return result;
            }
        }
    } catch (error) {
        console.error('링크 조회 오류:', error);
        // API 호출 실패 시 로컬 스토리지로 폴백
        return getUserLinkLocal(userId);
    }
    
    return null;
}

// 로컬 스토리지 링크 조회 (폴백)
function getUserLinkLocal(userId) {
    const links = JSON.parse(localStorage.getItem('userLinks') || '[]');
    return links.find(link => link.userId === userId);
}

// 기존 링크 표시
function displayExistingLink(link) {
    document.getElementById('existingLink').style.display = 'block';
    document.getElementById('createLinkSection').style.display = 'none';
    
    document.getElementById('referralCode').textContent = link.referralCode;
    document.getElementById('downloadLink').textContent = link.downloadUrl;
    document.getElementById('downloadLink').href = link.downloadUrl;
    
    // 통계 업데이트
    document.getElementById('downloadCount').textContent = link.downloadCount || 0;
    document.getElementById('installCount').textContent = link.installCount || 0;
    document.getElementById('rewardAmount').textContent = link.rewardAmount || 0;
}

// 새 링크 생성 섹션 표시
function showCreateLinkSection() {
    document.getElementById('existingLink').style.display = 'none';
    document.getElementById('createLinkSection').style.display = 'block';
}

// 새 링크 생성
async function createNewLink() {
    if (!currentUser) return;
    
    showLoading(true);
    
    try {
        const referralCode = generateReferralCode();
        const downloadUrl = `www.newservice.com/download/${referralCode}`;
        
        const newLink = {
            id: generateLinkId(),
            userId: currentUser.id,
            referralCode: referralCode,
            downloadUrl: downloadUrl,
            status: 'active',
            downloadCount: 0,
            installCount: 0,
            rewardAmount: 0,
            createdAt: new Date().toISOString()
        };
        
        // 링크 저장
        await saveUserLink(newLink);
        
        userLink = newLink;
        displayExistingLink(newLink);
        
        showNotification('새 레퍼럴 링크가 생성되었습니다!', 'success');
    } catch (error) {
        console.error('링크 생성 오류:', error);
        showNotification('링크 생성 중 오류가 발생했습니다.', 'error');
    } finally {
        showLoading(false);
    }
}

// 레퍼럴 코드 생성 (12자리: 알파벳 + 숫자)
function generateReferralCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    for (let i = 0; i < 12; i++) {
        if (i > 0 && i % 4 === 0) {
            result += '-';
        }
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
}

// 링크 ID 생성
function generateLinkId() {
    return 'link_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 사용자 링크 저장
async function saveUserLink(link) {
    try {
        const response = await fetch(SPREADSHEET_CONFIG.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'createLink',
                userId: link.userId,
                referralCode: link.referralCode,
                downloadUrl: link.downloadUrl
            })
        });

        if (response.ok) {
            const result = await response.json();
            if (result && !result.error) {
                return result;
            }
        }
    } catch (error) {
        console.error('링크 저장 오류:', error);
        // API 호출 실패 시 로컬 스토리지로 폴백
        saveUserLinkLocal(link);
    }
}

// 로컬 스토리지 링크 저장 (폴백)
function saveUserLinkLocal(link) {
    const links = JSON.parse(localStorage.getItem('userLinks') || '[]');
    
    // 기존 링크가 있으면 삭제 처리
    const existingIndex = links.findIndex(l => l.userId === link.userId);
    if (existingIndex !== -1) {
        links[existingIndex].status = 'deleted';
    }
    
    links.push(link);
    localStorage.setItem('userLinks', JSON.stringify(links));
}

// 링크 복사
async function copyLinkToClipboard() {
    if (!userLink) return;
    
    try {
        await navigator.clipboard.writeText(userLink.downloadUrl);
        showNotification('링크가 클립보드에 복사되었습니다!', 'success');
    } catch (error) {
        console.error('클립보드 복사 오류:', error);
        showNotification('링크 복사에 실패했습니다.', 'error');
    }
}

// 링크 삭제
async function deleteLink() {
    if (!userLink) return;
    
    const confirmed = confirm('정말로 이 링크를 삭제하시겠습니까?');
    if (!confirmed) return;
    
    showLoading(true);
    
    try {
        // 링크 상태를 'deleted'로 변경
        await updateLinkStatus(userLink.id, 'deleted');
        
        userLink = null;
        showCreateLinkSection();
        
        showNotification('링크가 삭제되었습니다.', 'success');
    } catch (error) {
        console.error('링크 삭제 오류:', error);
        showNotification('링크 삭제 중 오류가 발생했습니다.', 'error');
    } finally {
        showLoading(false);
    }
}

// 링크 상태 업데이트
async function updateLinkStatus(linkId, status) {
    try {
        const response = await fetch(SPREADSHEET_CONFIG.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'updateLinkStatus',
                linkId: linkId,
                status: status
            })
        });

        if (response.ok) {
            const result = await response.json();
            if (result && !result.error) {
                return result;
            }
        }
    } catch (error) {
        console.error('링크 상태 업데이트 오류:', error);
        // API 호출 실패 시 로컬 스토리지로 폴백
        updateLinkStatusLocal(linkId, status);
    }
}

// 로컬 스토리지 링크 상태 업데이트 (폴백)
function updateLinkStatusLocal(linkId, status) {
    const links = JSON.parse(localStorage.getItem('userLinks') || '[]');
    const linkIndex = links.findIndex(l => l.id === linkId);
    
    if (linkIndex !== -1) {
        links[linkIndex].status = status;
        localStorage.setItem('userLinks', JSON.stringify(links));
    }
}

// 로딩 화면 표시/숨김
function showLoading(show) {
    if (show) {
        loadingScreen.classList.add('active');
    } else {
        loadingScreen.classList.remove('active');
    }
}

// 알림 표시
function showNotification(message, type = 'info') {
    const modal = document.getElementById('notificationModal');
    const title = document.getElementById('modalTitle');
    const messageEl = document.getElementById('modalMessage');
    
    // 타입에 따른 제목 설정
    switch (type) {
        case 'success':
            title.textContent = '성공';
            title.style.color = '#28a745';
            break;
        case 'error':
            title.textContent = '오류';
            title.style.color = '#dc3545';
            break;
        case 'warning':
            title.textContent = '경고';
            title.style.color = '#ffc107';
            break;
        default:
            title.textContent = '알림';
            title.style.color = '#007bff';
    }
    
    messageEl.textContent = message;
    modal.classList.add('active');
}

// 모달 닫기
function closeModal() {
    notificationModal.classList.remove('active');
}
