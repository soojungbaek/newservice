// Google Apps Script 예시 코드
// 이 코드를 Google Apps Script 편집기에 붙여넣어 사용하세요.

// CORS 헤더 설정
function setCORSHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

// 웹 앱 엔드포인트
function doPost(e) {
  try {
    // CORS 헤더 설정
    const headers = setCORSHeaders();
    
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    let result;
    switch(action) {
      case 'auth':
        result = handleAuth(data);
        break;
      case 'createLink':
        result = handleCreateLink(data);
        break;
      case 'getLink':
        result = handleGetLink(data);
        break;
      case 'updateLinkStatus':
        result = handleUpdateLinkStatus(data);
        break;
      case 'updateStats':
        result = handleUpdateStats(data);
        break;
      default:
        result = {error: 'Invalid action'};
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
      
  } catch (error) {
    const errorResponse = {error: 'Server error: ' + error.message};
    return ContentService
      .createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(setCORSHeaders());
  }
}

function doGet(e) {
  const headers = setCORSHeaders();
  const action = e.parameter.action;
  
  let result;
  switch(action) {
    case 'getLink':
      result = handleGetLink(e.parameter);
      break;
    case 'getStats':
      result = handleGetStats(e.parameter);
      break;
    default:
      result = {error: 'Invalid action'};
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
}

// 사용자 인증 처리
function handleAuth(data) {
  const { username, password } = data;
  
  if (!username || !password) {
    return {error: 'Username and password are required'};
  }
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('userdata');
  const rows = sheet.getDataRange().getValues();
  
  // 기존 사용자 확인
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === username && rows[i][1] === password) {
      return {
        id: rows[i][2],
        username: rows[i][0],
        createdAt: rows[i][3]
      };
    }
  }
  
  // 새 사용자 생성
  const newUserId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  const newRow = [username, password, newUserId, new Date()];
  sheet.appendRow(newRow);
  
  return {
    id: newUserId,
    username: username,
    createdAt: new Date().toISOString()
  };
}

// 링크 생성 처리
function handleCreateLink(data) {
  const { userId, referralCode, downloadUrl } = data;
  
  if (!userId || !referralCode || !downloadUrl) {
    return {error: 'Missing required fields'};
  }
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('linkdata');
  
  // 기존 링크가 있으면 상태를 'deleted'로 변경
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === userId && rows[i][4] === 'active') {
      sheet.getRange(i + 1, 5).setValue('deleted');
    }
  }
  
  // 새 링크 생성
  const linkId = 'link_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  const newRow = [
    linkId,
    userId,
    referralCode,
    downloadUrl,
    'active',
    0, // downloadCount
    0, // installCount
    0, // rewardAmount
    new Date()
  ];
  
  sheet.appendRow(newRow);
  
  return {
    id: linkId,
    userId: userId,
    referralCode: referralCode,
    downloadUrl: downloadUrl,
    status: 'active',
    downloadCount: 0,
    installCount: 0,
    rewardAmount: 0,
    createdAt: new Date().toISOString()
  };
}

// 링크 조회 처리
function handleGetLink(data) {
  const userId = data.userId || data.userId;
  
  if (!userId) {
    return {error: 'User ID is required'};
  }
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('linkdata');
  const rows = sheet.getDataRange().getValues();
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === userId && rows[i][4] === 'active') {
      return {
        id: rows[i][0],
        userId: rows[i][1],
        referralCode: rows[i][2],
        downloadUrl: rows[i][3],
        status: rows[i][4],
        downloadCount: rows[i][5] || 0,
        installCount: rows[i][6] || 0,
        rewardAmount: rows[i][7] || 0,
        createdAt: rows[i][8]
      };
    }
  }
  
  return null;
}

// 링크 상태 업데이트 처리
function handleUpdateLinkStatus(data) {
  const { linkId, status } = data;
  
  if (!linkId || !status) {
    return {error: 'Link ID and status are required'};
  }
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('linkdata');
  const rows = sheet.getDataRange().getValues();
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === linkId) {
      sheet.getRange(i + 1, 5).setValue(status);
      return {success: true};
    }
  }
  
  return {error: 'Link not found'};
}

// 통계 업데이트 처리
function handleUpdateStats(data) {
  const { linkId, downloadCount, installCount, rewardAmount } = data;
  
  if (!linkId) {
    return {error: 'Link ID is required'};
  }
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('linkdata');
  const rows = sheet.getDataRange().getValues();
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === linkId) {
      if (downloadCount !== undefined) {
        sheet.getRange(i + 1, 6).setValue(downloadCount);
      }
      if (installCount !== undefined) {
        sheet.getRange(i + 1, 7).setValue(installCount);
      }
      if (rewardAmount !== undefined) {
        sheet.getRange(i + 1, 8).setValue(rewardAmount);
      }
      return {success: true};
    }
  }
  
  return {error: 'Link not found'};
}

// 통계 조회 처리
function handleGetStats(data) {
  const { userId } = data;
  
  if (!userId) {
    return {error: 'User ID is required'};
  }
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('linkdata');
  const rows = sheet.getDataRange().getValues();
  
  let totalDownloads = 0;
  let totalInstalls = 0;
  let totalRewards = 0;
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === userId && rows[i][4] === 'active') {
      totalDownloads += rows[i][5] || 0;
      totalInstalls += rows[i][6] || 0;
      totalRewards += rows[i][7] || 0;
    }
  }
  
  return {
    totalDownloads: totalDownloads,
    totalInstalls: totalInstalls,
    totalRewards: totalRewards
  };
}

// 스프레드시트 초기 설정 (한 번만 실행)
function setupSpreadsheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // 사용자 정보 시트 생성
  let userSheet = spreadsheet.getSheetByName('userdata');
  if (!userSheet) {
    userSheet = spreadsheet.insertSheet('userdata');
    userSheet.getRange(1, 1, 1, 4).setValues([['Username', 'Password', 'UserID', 'CreatedAt']]);
  }
  
  // 링크 정보 시트 생성
  let linkSheet = spreadsheet.getSheetByName('linkdata');
  if (!linkSheet) {
    linkSheet = spreadsheet.insertSheet('linkdata');
    linkSheet.getRange(1, 1, 1, 9).setValues([
      ['LinkID', 'UserID', 'ReferralCode', 'DownloadURL', 'Status', 'DownloadCount', 'InstallCount', 'RewardAmount', 'CreatedAt']
    ]);
  }
  
  // 헤더 스타일 설정
  const headerRange = userSheet.getRange(1, 1, 1, 4);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#f0f0f0');
  
  const linkHeaderRange = linkSheet.getRange(1, 1, 1, 9);
  linkHeaderRange.setFontWeight('bold');
  linkHeaderRange.setBackground('#f0f0f0');
  
  console.log('Spreadsheet setup completed!');
}

// 테스트 함수들
function testAPI() {
  const testData = {
    action: 'auth',
    username: 'testuser',
    password: '1234'
  };
  
  const result = handleAuth(testData);
  console.log('Test result:', result);
}

// 스프레드시트 상태 확인
function checkSpreadsheetSetup() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    console.log('Spreadsheet ID:', spreadsheet.getId());
    console.log('Spreadsheet URL:', spreadsheet.getUrl());
    
    const sheets = spreadsheet.getSheets();
    console.log('Available sheets:');
    sheets.forEach(sheet => {
      console.log('- ' + sheet.getName());
    });
    
    // userdata 시트 확인
    const userSheet = spreadsheet.getSheetByName('userdata');
    if (userSheet) {
      console.log('userdata sheet found');
      console.log('Rows:', userSheet.getLastRow());
      console.log('Columns:', userSheet.getLastColumn());
    } else {
      console.log('userdata sheet not found');
    }
    
    // linkdata 시트 확인
    const linkSheet = spreadsheet.getSheetByName('linkdata');
    if (linkSheet) {
      console.log('linkdata sheet found');
      console.log('Rows:', linkSheet.getLastRow());
      console.log('Columns:', linkSheet.getLastColumn());
    } else {
      console.log('linkdata sheet not found');
    }
    
  } catch (error) {
    console.error('Error checking spreadsheet:', error);
  }
}

// 웹 앱 배포 확인
function testWebApp() {
  const webAppUrl = ScriptApp.getService().getUrl();
  console.log('Web App URL:', webAppUrl);
  
  // 간단한 GET 요청 테스트
  try {
    const response = UrlFetchApp.fetch(webAppUrl + '?action=getLink&userId=test');
    console.log('GET test response:', response.getContentText());
  } catch (error) {
    console.error('GET test error:', error);
  }
  
  // 간단한 POST 요청 테스트
  try {
    const payload = {
      action: 'auth',
      username: 'testuser',
      password: '1234'
    };
    
    const options = {
      method: 'POST',
      contentType: 'application/json',
      payload: JSON.stringify(payload)
    };
    
    const response = UrlFetchApp.fetch(webAppUrl, options);
    console.log('POST test response:', response.getContentText());
  } catch (error) {
    console.error('POST test error:', error);
  }
}

// 사용법:
// 1. Google Apps Script 편집기에서 새 프로젝트 생성
// 2. 이 코드를 붙여넣기
// 3. setupSpreadsheet() 함수를 한 번 실행하여 스프레드시트 초기 설정
// 4. checkSpreadsheetSetup() 함수를 실행하여 설정 확인
// 5. 웹 앱으로 배포
// 6. testWebApp() 함수를 실행하여 웹 앱 테스트
// 7. 생성된 URL을 script.js의 SPREADSHEET_CONFIG.baseUrl에 설정 