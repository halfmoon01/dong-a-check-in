document.addEventListener('DOMContentLoaded', function() {

  // 시/도 및 시/군/구 데이터
  var addressData = {
    "서울특별시": ["강남구","강동구","강북구","강서구","관악구","광진구","구로구","금천구","노원구","도봉구","동대문구","동작구","마포구","서대문구","서초구","성동구","성북구","송파구","양천구","영등포구","용산구","은평구","종로구","중구","중랑구"],
    "부산광역시": ["강서구","금정구","기장군","남구","동구","동래구","부산진구","북구","사상구","사하구","서구","수영구","연제구","영도구","중구","해운대구"],
    "대구광역시": ["남구","달서구","달성군","동구","북구","서구","수성구","중구"],
    "인천광역시": ["강화군","계양구","남동구","동구","미추홀구","부평구","서구","연수구","옹진군","중구"],
    "광주광역시": ["광산구","남구","동구","북구","서구"],
    "대전광역시": ["대덕구","동구","서구","유성구","중구"],
    "울산광역시": ["남구","동구","북구","울주군","중구"],
    "세종특별자치시": ["세종시"],
    "경기도": ["가평군","고양시","과천시","광명시","광주시","구리시","군포시","김포시","남양주시","동두천시","부천시","성남시","수원시","시흥시","안산시","안성시","안양시","양주시","양평군","여주시","연천군","오산시","용인시","의왕시","의정부시","이천시","파주시","평택시","포천시","하남시","화성시"],
    "강원특별자치도": ["강릉시","고성군","동해시","삼척시","속초시","양구군","양양군","영월군","원주시","인제군","정선군","철원군","춘천시","태백시","평창군","홍천군","화천군","횡성군"],
    "충청북도": ["괴산군","단양군","보은군","영동군","옥천군","음성군","제천시","증평군","진천군","청주시","충주시"],
    "충청남도": ["계룡시","공주시","금산군","논산시","당진시","보령시","부여군","서산시","서천군","아산시","예산군","천안시","청양군","태안군","홍성군"],
    "전라북도": ["고창군","군산시","김제시","남원시","무주군","부안군","순창군","완주군","익산시","임실군","장수군","전주시","정읍시","진안군"],
    "전라남도": ["강진군","고흥군","곡성군","광양시","구례군","나주시","담양군","목포시","무안군","보성군","순천시","신안군","여수시","영광군","영암군","완도군","장성군","장흥군","진도군","함평군","해남군","화순군"],
    "경상북도": ["경산시","경주시","고령군","구미시","군위군","김천시","문경시","봉화군","상주시","성주군","안동시","영덕군","영양군","영주시","영천시","예천군","울릉군","울진군","의성군","청도군","청송군","칠곡군","포항시"],
    "경상남도": ["거제시","거창군","고성군","김해시","남해군","밀양시","사천시","산청군","양산시","의령군","진주시","창녕군","창원시","통영시","하동군","함안군","함양군","합천군"],
    "제주특별자치도": ["서귀포시","제주시"]
  };

  var noEmail = false;

  // ===== DOM 요소 참조 =====
  var form = document.getElementById('regForm');
  var btnSubmit = document.getElementById('btnSubmit');
  var nameInput = document.getElementById('name');
  var phoneMid = document.getElementById('phoneMid');
  var phoneLast = document.getElementById('phoneLast');
  var phonePrefix = document.getElementById('phonePrefix');
  var emailId = document.getElementById('emailId');
  var emailDomain = document.getElementById('emailDomain');
  var emailDomainSelect = document.getElementById('emailDomainSelect');
  var emailSection = document.getElementById('emailSection');
  var emailConsentRow = document.getElementById('emailConsentRow');
  var btnNoEmail = document.getElementById('btnNoEmail');
  var smsConsent = document.getElementById('smsConsent');
  var emailConsent = document.getElementById('emailConsent');
  var company = document.getElementById('company');
  var addressSido = document.getElementById('addressSido');
  var addressSigungu = document.getElementById('addressSigungu');
  var privacyConsent = document.getElementById('privacyConsent');
  var privacyBox = document.getElementById('privacyBox');
  var toast = document.getElementById('toast');

  // ===== 유틸 =====

  function showError(groupId, errorId, message) {
    var group = document.getElementById(groupId);
    var error = document.getElementById(errorId);
    if (group) group.classList.add('has-error');
    if (error) {
      if (message) error.textContent = message;
      error.classList.add('show');
    }
  }

  function clearError(groupId, errorId) {
    var group = document.getElementById(groupId);
    var error = document.getElementById(errorId);
    if (group) group.classList.remove('has-error');
    if (error) error.classList.remove('show');
  }

  function clearAllErrors() {
    document.querySelectorAll('.error-msg').forEach(function(el) { el.classList.remove('show'); });
    document.querySelectorAll('.form-group').forEach(function(el) { el.classList.remove('has-error'); });
    document.querySelectorAll('.input-error').forEach(function(el) { el.classList.remove('input-error'); });
  }

  function setInputError(el) {
    if (el) el.classList.add('input-error');
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(function() { toast.classList.remove('show'); }, 3000);
  }

  // ===== 시/도 & 시/군/구 =====

  function populateSido() {
    var keys = Object.keys(addressData);
    for (var i = 0; i < keys.length; i++) {
      var opt = document.createElement('option');
      opt.value = keys[i];
      opt.textContent = keys[i];
      addressSido.appendChild(opt);
    }
  }

  addressSido.addEventListener('change', function() {
    var sido = this.value;
    addressSigungu.innerHTML = '<option value="">시/군/구 선택</option>';
    if (sido && addressData[sido]) {
      for (var i = 0; i < addressData[sido].length; i++) {
        var opt = document.createElement('option');
        opt.value = addressData[sido][i];
        opt.textContent = addressData[sido][i];
        addressSigungu.appendChild(opt);
      }
    }
    if (sido) clearError('grpAddress', 'errAddress');
  });

  addressSigungu.addEventListener('change', function() {
    if (this.value) clearError('grpAddress', 'errAddress');
  });

  // ===== 이메일 =====

  emailDomainSelect.addEventListener('change', function() {
    if (this.value) {
      emailDomain.value = this.value;
      emailDomain.readOnly = true;
    } else {
      emailDomain.value = '';
      emailDomain.readOnly = false;
    }
    clearError('grpEmail', 'errEmail');
  });

  btnNoEmail.addEventListener('click', function() {
    noEmail = !noEmail;
    if (noEmail) {
      btnNoEmail.classList.add('active');
      btnNoEmail.textContent = '이메일 입력하기';
      emailSection.style.display = 'none';
      emailConsentRow.style.display = 'none';
      emailId.value = '';
      emailDomain.value = '';
      emailConsent.checked = false;
      clearError('grpEmail', 'errEmail');
    } else {
      btnNoEmail.classList.remove('active');
      btnNoEmail.textContent = '이메일 없음';
      emailSection.style.display = 'block';
      emailConsentRow.style.display = 'flex';
    }
  });

  // ===== 실시간 에러 해제 =====

  nameInput.addEventListener('input', function() {
    if (this.value.trim()) {
      clearError('grpName', 'errName');
      this.classList.remove('input-error');
    }
  });

  phoneMid.addEventListener('input', function() {
    this.value = this.value.replace(/[^0-9]/g, '');
    if (phoneMid.value.length >= 3 && phoneLast.value.length >= 4) {
      clearError('grpPhone', 'errPhone');
      phoneMid.classList.remove('input-error');
      phoneLast.classList.remove('input-error');
    }
  });

  phoneLast.addEventListener('input', function() {
    this.value = this.value.replace(/[^0-9]/g, '');
    if (phoneMid.value.length >= 3 && phoneLast.value.length >= 4) {
      clearError('grpPhone', 'errPhone');
      phoneMid.classList.remove('input-error');
      phoneLast.classList.remove('input-error');
    }
  });

  emailId.addEventListener('input', function() { clearError('grpEmail', 'errEmail'); });
  emailDomain.addEventListener('input', function() { clearError('grpEmail', 'errEmail'); });

  smsConsent.addEventListener('change', function() {
    if (this.checked) clearError('grpPhone', 'errSms');
  });

  emailConsent.addEventListener('change', function() {
    if (this.checked) clearError('grpEmail', 'errEmailConsent');
  });

  var ageRadios = document.querySelectorAll('input[name="age_group"]');
  for (var i = 0; i < ageRadios.length; i++) {
    ageRadios[i].addEventListener('change', function() { clearError('grpAge', 'errAge'); });
  }

  var jobRadios = document.querySelectorAll('input[name="job_type"]');
  for (var i = 0; i < jobRadios.length; i++) {
    jobRadios[i].addEventListener('change', function() { clearError('grpJob', 'errJob'); });
  }

  privacyConsent.addEventListener('change', function() {
    if (this.checked) clearError('grpPrivacy', 'errPrivacy');
  });

  // ===== 유효성 검사 =====

  function validateForm() {
    clearAllErrors();
    var valid = true;
    var firstEl = null;

    // 성명
    if (!nameInput.value.trim()) {
      showError('grpName', 'errName', '성명을 입력해주세요.');
      setInputError(nameInput);
      if (!firstEl) firstEl = document.getElementById('grpName');
      valid = false;
    }

    // 휴대폰
    var midVal = phoneMid.value.trim();
    var lastVal = phoneLast.value.trim();
    if (!midVal || !lastVal) {
      showError('grpPhone', 'errPhone', '휴대폰 번호를 입력해주세요.');
      if (!midVal) setInputError(phoneMid);
      if (!lastVal) setInputError(phoneLast);
      if (!firstEl) firstEl = document.getElementById('grpPhone');
      valid = false;
    } else if (midVal.length < 3 || lastVal.length < 4) {
      showError('grpPhone', 'errPhone', '휴대폰 번호를 정확히 입력해주세요.');
      if (midVal.length < 3) setInputError(phoneMid);
      if (lastVal.length < 4) setInputError(phoneLast);
      if (!firstEl) firstEl = document.getElementById('grpPhone');
      valid = false;
    }

    // SMS/카카오톡 수신동의 (필수)
    if (!smsConsent.checked) {
      showError('grpPhone', 'errSms', '문자(SMS), 카카오톡 수신 동의에 체크해주세요.');
      if (!firstEl) firstEl = document.getElementById('grpPhone');
      valid = false;
    }

    // 이메일
    if (!noEmail) {
      var eId = emailId.value.trim();
      var eDom = emailDomain.value.trim();
      if ((eId && !eDom) || (!eId && eDom)) {
        showError('grpEmail', 'errEmail', '이메일 주소를 정확히 입력하거나 \'이메일 없음\'을 선택해주세요.');
        if (!firstEl) firstEl = document.getElementById('grpEmail');
        valid = false;
      }
      // 이메일 수신동의 (이메일 입력 시 필수)
      if (eId && eDom && !emailConsent.checked) {
        showError('grpEmail', 'errEmailConsent', '이메일 수신 동의에 체크해주세요.');
        if (!firstEl) firstEl = document.getElementById('grpEmail');
        valid = false;
      }
    }

    // 주소
    if (!addressSido.value) {
      showError('grpAddress', 'errAddress', '시/도를 선택해주세요.');
      setInputError(addressSido);
      if (!firstEl) firstEl = document.getElementById('grpAddress');
      valid = false;
    } else if (!addressSigungu.value) {
      showError('grpAddress', 'errAddress', '시/군/구를 선택해주세요.');
      setInputError(addressSigungu);
      if (!firstEl) firstEl = document.getElementById('grpAddress');
      valid = false;
    }

    // 연령
    if (!document.querySelector('input[name="age_group"]:checked')) {
      showError('grpAge', 'errAge', '연령대를 선택해주세요.');
      if (!firstEl) firstEl = document.getElementById('grpAge');
      valid = false;
    }

    // 직업군
    if (!document.querySelector('input[name="job_type"]:checked')) {
      showError('grpJob', 'errJob', '직업군을 선택해주세요.');
      if (!firstEl) firstEl = document.getElementById('grpJob');
      valid = false;
    }

    // 개인정보 동의
    if (!privacyConsent.checked) {
      showError('grpPrivacy', 'errPrivacy', '개인정보 수집·이용에 동의해주세요.');
      if (!firstEl) firstEl = document.getElementById('grpPrivacy');
      valid = false;
    }

    // 첫 에러로 스크롤
    if (firstEl) {
      firstEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return valid;
  }

  // ===== 폼 제출 =====

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    e.stopPropagation();

    // 반드시 검증 먼저
    var isValid = validateForm();
    if (!isValid) {
      return false;
    }

    btnSubmit.disabled = true;
    btnSubmit.textContent = '등록 중...';

    var name = nameInput.value.trim();
    var phone = phonePrefix.value + '-' + phoneMid.value.trim() + '-' + phoneLast.value.trim();

    var email = '';
    if (!noEmail) {
      var eId = emailId.value.trim();
      var eDom = emailDomain.value.trim();
      if (eId && eDom) email = eId + '@' + eDom;
    }

    var ageGroup = document.querySelector('input[name="age_group"]:checked');
    var jobType = document.querySelector('input[name="job_type"]:checked');

    var body = {
      name: name,
      phone: phone,
      sms_consent: smsConsent.checked,
      email: email || null,
      email_consent: emailConsent.checked,
      company: company.value.trim() || null,
      address_sido: addressSido.value,
      address_sigungu: addressSigungu.value,
      age_group: ageGroup ? ageGroup.value : null,
      job_type: jobType ? jobType.value : null,
      privacy_consent: privacyConsent.checked
    };

    fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    .then(function(res) {
      return res.json().then(function(data) {
        return { ok: res.ok, status: res.status, data: data };
      });
    })
    .then(function(result) {
      if (!result.ok) {
        if (result.status === 503) {
          showToast('현재 등록이 마감되었습니다.');
        } else {
          showToast(result.data.error || '등록에 실패했습니다.');
        }
        btnSubmit.disabled = false;
        btnSubmit.textContent = '현장 등록';
        return;
      }

      // QR 코드 생성 후 완료 페이지 표시
      fetch('/api/qrcode/' + result.data.reg_number)
        .then(function(qrRes) { return qrRes.json(); })
        .then(function(qrData) {
          form.style.display = 'none';
          document.querySelector('.header').style.display = 'none';
          document.getElementById('completionPage').style.display = 'block';
          document.getElementById('qrImage').src = qrData.qr;
          document.getElementById('regNumberDisplay').textContent = result.data.reg_number;
          document.getElementById('regNameDisplay').textContent = result.data.name;
          window.scrollTo(0, 0);
        });
    })
    .catch(function(err) {
      console.error(err);
      showToast('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.');
      btnSubmit.disabled = false;
      btnSubmit.textContent = '현장 등록';
    });

    return false;
  });

  // ===== 설정 로드 (실시간 반영) =====

  function loadSettings() {
    Promise.all([
      fetch('/api/settings').then(function(r) { return r.json(); }),
      fetch('/api/logo').then(function(r) { return r.json(); })
    ])
    .then(function(results) {
      var settings = results[0];
      var logoData = results[1];
      var closedPage = document.getElementById('closedPage');

      if (settings.server_open === '0') {
        closedPage.style.display = 'block';
        form.style.display = 'none';
      } else {
        closedPage.style.display = 'none';
        if (document.getElementById('completionPage').style.display !== 'block') {
          form.style.display = 'block';
        }
      }

      if (settings.exhibition_name) {
        document.getElementById('exhibitionName').textContent = settings.exhibition_name;
        document.title = settings.exhibition_name + ' 현장등록';
      }

      if (settings.privacy_text) {
        privacyBox.textContent = settings.privacy_text;
      }

      if (logoData.logo) {
        var logoImg = document.getElementById('exhibitionLogo');
        logoImg.src = logoData.logo;
        logoImg.style.display = 'block';
      }
    })
    .catch(function(err) {
      console.error('설정 로드 실패:', err);
      form.style.display = 'block';
    });
  }

  // ===== 초기화 =====
  populateSido();
  loadSettings();

  // 3초마다 설정 자동 갱신 (관리자 변경 실시간 반영)
  setInterval(loadSettings, 3000);

  console.log('동아전람 현장등록 시스템 로드 완료');
});
