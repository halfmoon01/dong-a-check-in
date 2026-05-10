// ===== 국가 데이터 (영어이름, 국가코드, 한국어이름) =====
var COUNTRIES = [
  // 자주 쓰일 국가 우선 배치
  { en: 'United States',   code: '+1',   ko: '미국' },
  { en: 'Japan',            code: '+81',  ko: '일본' },
  { en: 'China',            code: '+86',  ko: '중국' },
  { en: 'United Kingdom',   code: '+44',  ko: '영국' },
  { en: 'Canada',           code: '+1',   ko: '캐나다' },
  { en: 'Australia',        code: '+61',  ko: '호주' },
  { en: 'Vietnam',          code: '+84',  ko: '베트남' },
  { en: 'Philippines',      code: '+63',  ko: '필리핀' },
  { en: 'Thailand',         code: '+66',  ko: '태국' },
  { en: 'Indonesia',        code: '+62',  ko: '인도네시아' },
  { en: 'Malaysia',         code: '+60',  ko: '말레이시아' },
  { en: 'Singapore',        code: '+65',  ko: '싱가포르' },
  { en: 'India',            code: '+91',  ko: '인도' },
  { en: 'Germany',          code: '+49',  ko: '독일' },
  { en: 'France',           code: '+33',  ko: '프랑스' },
  { en: 'Italy',            code: '+39',  ko: '이탈리아' },
  { en: 'Spain',            code: '+34',  ko: '스페인' },
  { en: 'Netherlands',      code: '+31',  ko: '네덜란드' },
  { en: 'Russia',           code: '+7',   ko: '러시아' },
  { en: 'Brazil',           code: '+55',  ko: '브라질' },
  { en: 'Mexico',           code: '+52',  ko: '멕시코' },
  { en: 'Turkey',           code: '+90',  ko: '튀르키예' },
  { en: 'Saudi Arabia',     code: '+966', ko: '사우디아라비아' },
  { en: 'United Arab Emirates', code: '+971', ko: '아랍에미리트' },
  { en: 'Taiwan',           code: '+886', ko: '대만' },
  { en: 'Hong Kong',        code: '+852', ko: '홍콩' },
  // 알파벳순 나머지
  { en: 'Afghanistan',      code: '+93',  ko: '아프가니스탄' },
  { en: 'Albania',          code: '+355', ko: '알바니아' },
  { en: 'Algeria',          code: '+213', ko: '알제리' },
  { en: 'Angola',           code: '+244', ko: '앙골라' },
  { en: 'Argentina',        code: '+54',  ko: '아르헨티나' },
  { en: 'Armenia',          code: '+374', ko: '아르메니아' },
  { en: 'Austria',          code: '+43',  ko: '오스트리아' },
  { en: 'Azerbaijan',       code: '+994', ko: '아제르바이잔' },
  { en: 'Bahrain',          code: '+973', ko: '바레인' },
  { en: 'Bangladesh',       code: '+880', ko: '방글라데시' },
  { en: 'Belarus',          code: '+375', ko: '벨라루스' },
  { en: 'Belgium',          code: '+32',  ko: '벨기에' },
  { en: 'Bolivia',          code: '+591', ko: '볼리비아' },
  { en: 'Bosnia and Herzegovina', code: '+387', ko: '보스니아 헤르체고비나' },
  { en: 'Botswana',         code: '+267', ko: '보츠와나' },
  { en: 'Brunei',           code: '+673', ko: '브루나이' },
  { en: 'Bulgaria',         code: '+359', ko: '불가리아' },
  { en: 'Cambodia',         code: '+855', ko: '캄보디아' },
  { en: 'Cameroon',         code: '+237', ko: '카메룬' },
  { en: 'Chile',            code: '+56',  ko: '칠레' },
  { en: 'Colombia',         code: '+57',  ko: '콜롬비아' },
  { en: 'Costa Rica',       code: '+506', ko: '코스타리카' },
  { en: 'Croatia',          code: '+385', ko: '크로아티아' },
  { en: 'Cuba',             code: '+53',  ko: '쿠바' },
  { en: 'Cyprus',           code: '+357', ko: '키프로스' },
  { en: 'Czech Republic',   code: '+420', ko: '체코' },
  { en: 'Denmark',          code: '+45',  ko: '덴마크' },
  { en: 'Dominican Republic', code: '+1',  ko: '도미니카공화국' },
  { en: 'Ecuador',          code: '+593', ko: '에콰도르' },
  { en: 'Egypt',            code: '+20',  ko: '이집트' },
  { en: 'El Salvador',      code: '+503', ko: '엘살바도르' },
  { en: 'Estonia',          code: '+372', ko: '에스토니아' },
  { en: 'Ethiopia',          code: '+251', ko: '에티오피아' },
  { en: 'Finland',          code: '+358', ko: '핀란드' },
  { en: 'Georgia',          code: '+995', ko: '조지아' },
  { en: 'Ghana',            code: '+233', ko: '가나' },
  { en: 'Greece',           code: '+30',  ko: '그리스' },
  { en: 'Guatemala',        code: '+502', ko: '과테말라' },
  { en: 'Honduras',         code: '+504', ko: '온두라스' },
  { en: 'Hungary',          code: '+36',  ko: '헝가리' },
  { en: 'Iceland',          code: '+354', ko: '아이슬란드' },
  { en: 'Iran',             code: '+98',  ko: '이란' },
  { en: 'Iraq',             code: '+964', ko: '이라크' },
  { en: 'Ireland',          code: '+353', ko: '아일랜드' },
  { en: 'Israel',           code: '+972', ko: '이스라엘' },
  { en: 'Jamaica',          code: '+1',   ko: '자메이카' },
  { en: 'Jordan',           code: '+962', ko: '요르단' },
  { en: 'Kazakhstan',       code: '+7',   ko: '카자흐스탄' },
  { en: 'Kenya',            code: '+254', ko: '케냐' },
  { en: 'Kuwait',           code: '+965', ko: '쿠웨이트' },
  { en: 'Kyrgyzstan',       code: '+996', ko: '키르기스스탄' },
  { en: 'Laos',             code: '+856', ko: '라오스' },
  { en: 'Latvia',           code: '+371', ko: '라트비아' },
  { en: 'Lebanon',          code: '+961', ko: '레바논' },
  { en: 'Libya',            code: '+218', ko: '리비아' },
  { en: 'Lithuania',        code: '+370', ko: '리투아니아' },
  { en: 'Luxembourg',       code: '+352', ko: '룩셈부르크' },
  { en: 'Macau',            code: '+853', ko: '마카오' },
  { en: 'Madagascar',       code: '+261', ko: '마다가스카르' },
  { en: 'Maldives',         code: '+960', ko: '몰디브' },
  { en: 'Malta',            code: '+356', ko: '몰타' },
  { en: 'Mauritius',        code: '+230', ko: '모리셔스' },
  { en: 'Moldova',          code: '+373', ko: '몰도바' },
  { en: 'Monaco',           code: '+377', ko: '모나코' },
  { en: 'Mongolia',         code: '+976', ko: '몽골' },
  { en: 'Montenegro',       code: '+382', ko: '몬테네그로' },
  { en: 'Morocco',          code: '+212', ko: '모로코' },
  { en: 'Mozambique',       code: '+258', ko: '모잠비크' },
  { en: 'Myanmar',          code: '+95',  ko: '미얀마' },
  { en: 'Namibia',          code: '+264', ko: '나미비아' },
  { en: 'Nepal',            code: '+977', ko: '네팔' },
  { en: 'New Zealand',      code: '+64',  ko: '뉴질랜드' },
  { en: 'Nicaragua',        code: '+505', ko: '니카라과' },
  { en: 'Nigeria',          code: '+234', ko: '나이지리아' },
  { en: 'North Macedonia',  code: '+389', ko: '북마케도니아' },
  { en: 'Norway',           code: '+47',  ko: '노르웨이' },
  { en: 'Oman',             code: '+968', ko: '오만' },
  { en: 'Pakistan',         code: '+92',  ko: '파키스탄' },
  { en: 'Palestine',        code: '+970', ko: '팔레스타인' },
  { en: 'Panama',           code: '+507', ko: '파나마' },
  { en: 'Paraguay',         code: '+595', ko: '파라과이' },
  { en: 'Peru',             code: '+51',  ko: '페루' },
  { en: 'Poland',           code: '+48',  ko: '폴란드' },
  { en: 'Portugal',         code: '+351', ko: '포르투갈' },
  { en: 'Qatar',            code: '+974', ko: '카타르' },
  { en: 'Romania',          code: '+40',  ko: '루마니아' },
  { en: 'Rwanda',           code: '+250', ko: '르완다' },
  { en: 'Senegal',          code: '+221', ko: '세네갈' },
  { en: 'Serbia',           code: '+381', ko: '세르비아' },
  { en: 'Slovakia',         code: '+421', ko: '슬로바키아' },
  { en: 'Slovenia',         code: '+386', ko: '슬로베니아' },
  { en: 'South Africa',     code: '+27',  ko: '남아프리카공화국' },
  { en: 'Sri Lanka',        code: '+94',  ko: '스리랑카' },
  { en: 'Sudan',            code: '+249', ko: '수단' },
  { en: 'Sweden',           code: '+46',  ko: '스웨덴' },
  { en: 'Switzerland',      code: '+41',  ko: '스위스' },
  { en: 'Syria',            code: '+963', ko: '시리아' },
  { en: 'Tajikistan',       code: '+992', ko: '타지키스탄' },
  { en: 'Tanzania',         code: '+255', ko: '탄자니아' },
  { en: 'Tunisia',          code: '+216', ko: '튀니지' },
  { en: 'Turkmenistan',     code: '+993', ko: '투르크메니스탄' },
  { en: 'Uganda',           code: '+256', ko: '우간다' },
  { en: 'Ukraine',          code: '+380', ko: '우크라이나' },
  { en: 'Uruguay',          code: '+598', ko: '우루과이' },
  { en: 'Uzbekistan',       code: '+998', ko: '우즈베키스탄' },
  { en: 'Venezuela',        code: '+58',  ko: '베네수엘라' },
  { en: 'Yemen',            code: '+967', ko: '예멘' },
  { en: 'Zambia',           code: '+260', ko: '잠비아' },
  { en: 'Zimbabwe',         code: '+263', ko: '짐바브웨' }
];

// ===== 다국어 (i18n) =====
var I18N = {
  ko: {
    lblName: '성명 <span class="required">*</span>',
    phName: '성명을 입력하세요',
    lblPhone: '휴대폰 번호 <span class="required">*</span>',
    lblSmsConsent: '문자(SMS), 카카오톡을 통한 박람회 개최 관련 정보 수신에 동의합니다. <span class="required">*</span>',
    lblEmail: '이메일',
    phEmail: '이메일',
    optDirect: '직접입력',
    lblNoEmail: '이메일 없음',
    lblEmailConsent: '이메일을 통한 박람회 개최 관련 정보 수신에 동의합니다. <span class="required">*</span>',
    lblCompany: '소속(회사)',
    phCompany: '소속 또는 회사명을 입력하세요',
    lblNoCompany: '소속/회사 없음',
    lblGender: '성별 <span class="required">*</span>',
    optMale: '남성',
    optFemale: '여성',
    lblAge: '연령 <span class="required">*</span>',
    optAge10: '10대', optAge20: '20대', optAge30: '30대', optAge40: '40대', optAge50: '50대', optAge60: '60대 이상',
    lblJob: '직업군 유형 <span class="required">*</span>',
    optJob1: '관련업계종사자', optJob2: '예비건축주', optJob3: '국내외 바이어',
    optJob4: '인테리어 수요자', optJob5: '일반관람객', optJob6: '기타 (직접 입력)',
    phJobEtc: '직업군을 입력해주세요',
    lblAddress: '주소 <span class="required">*</span>',
    optSido: '시/도 선택',
    optSigungu: '시/군/구 선택',
    lblReferral: '이번 동아전람 박람회를 인지하게 된 경로는 무엇입니까? <span class="required">*</span>',
    optRef1: '동아전람 카카오톡 메세지',
    optRef2: 'SNS (인스타그램)',
    optRef3: 'YOUTUBE',
    optRef4: '행사장 홈페이지',
    optRef5: '동아전람 홈페이지',
    optRef6: '기타 (직접 입력)',
    phRefEtc: '인지 경로를 입력해주세요',
    lblPrivacy: '개인정보 수집·이용 동의 <span class="required">*</span>',
    lblPrivacyConsent: '위 개인정보 수집·이용에 동의합니다. (필수)',
    btnSubmit: '현장 등록'
  },
  en: {
    lblName: 'Name <span class="required">*</span>',
    phName: 'Enter your full name',
    lblPhone: 'Phone Number <span class="required">*</span>',
    lblSmsConsent: 'I agree to receive SMS notifications about the exhibition. <span class="required">*</span>',
    lblEmail: 'Email <span class="required">*</span>',
    phEmail: 'Email',
    optDirect: 'Other',
    lblNoEmail: 'No Email',
    lblEmailConsent: 'I agree to receive email notifications about the exhibition. <span class="required">*</span>',
    lblCompany: 'Company / Affiliation',
    phCompany: 'Enter your company or affiliation',
    lblNoCompany: 'No company',
    lblGender: 'Gender <span class="required">*</span>',
    optMale: 'Male',
    optFemale: 'Female',
    lblAge: 'Age <span class="required">*</span>',
    optAge10: 'Teens', optAge20: '20s', optAge30: '30s', optAge40: '40s', optAge50: '50s', optAge60: '60+',
    lblJob: 'Occupation <span class="required">*</span>',
    optJob1: 'Industry Professional', optJob2: 'Prospective Builder', optJob3: 'Buyer (Domestic/International)',
    optJob4: 'Interior Customer', optJob5: 'General Visitor', optJob6: 'Other (specify)',
    phJobEtc: 'Please specify',
    lblAddress: 'Address <span class="required">*</span>',
    optSido: 'Select Region',
    optSigungu: 'Select District',
    lblReferral: 'How did you find out about this Dong-A Exhibition? <span class="required">*</span>',
    optRef1: 'Dong-A KakaoTalk message',
    optRef2: 'SNS (Instagram)',
    optRef3: 'YOUTUBE',
    optRef4: 'Event venue homepage',
    optRef5: 'Dong-A homepage',
    optRef6: 'Other (specify)',
    phRefEtc: 'Please specify',
    lblPrivacy: 'Privacy Policy Agreement <span class="required">*</span>',
    lblPrivacyConsent: 'I agree to the collection and use of personal information. (Required)',
    btnSubmit: 'Register'
  }
};
var ERR_I18N = {
  ko: {
    name: '성명을 입력해주세요.',
    nameInvalid: '성명을 정확히 입력해주세요.',
    nameTooShort: '성명을 정확히 입력해주세요.',
    phoneEmpty: '휴대폰 번호를 입력해주세요.',
    phoneInvalid: '휴대폰 번호를 정확히 입력해주세요.',
    sms: '문자(SMS), 카카오톡 수신 동의에 체크해주세요.',
    emailRequired: '이메일을 입력해주세요.',
    emailFormat: '이메일 주소를 정확히 입력하거나 \'이메일 없음\'을 선택해주세요.',
    emailConsent: '이메일 수신 동의에 체크해주세요.',
    sido: '시/도를 선택해주세요.',
    sigungu: '시/군/구를 선택해주세요.',
    country: '국가를 선택해주세요.',
    company: '소속(회사)을 입력해주세요.',
    gender: '성별을 선택해주세요.',
    age: '연령대를 선택해주세요.',
    job: '직업군을 선택해주세요.',
    jobEtc: '직업군을 직접 입력해주세요.',
    referral: '인지 경로를 선택해주세요.',
    referralEtc: '인지 경로를 직접 입력해주세요.',
    privacy: '개인정보 수집·이용에 동의해주세요.',
    submitting: '등록 중...',
    closed: '현재 등록이 마감되었습니다.',
    failed: '등록에 실패했습니다.',
    network: '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.'
  },
  en: {
    name: 'Please enter your name.',
    nameInvalid: 'Please enter a valid name.',
    nameTooShort: 'Please enter a valid name.',
    phoneEmpty: 'Please enter your phone number.',
    phoneInvalid: 'Please enter a valid phone number.',
    sms: 'Please agree to SMS notifications.',
    emailRequired: 'Email is required.',
    emailFormat: 'Please enter a valid email address.',
    emailConsent: 'Please agree to email notifications.',
    sido: 'Please select a region.',
    sigungu: 'Please select a district.',
    country: 'Please select your country.',
    company: 'Please enter your company.',
    gender: 'Please select your gender.',
    age: 'Please select your age group.',
    job: 'Please select your occupation.',
    jobEtc: 'Please specify your occupation.',
    referral: 'Please select how you found out about this exhibition.',
    referralEtc: 'Please specify how you found out.',
    privacy: 'Please agree to the privacy policy.',
    submitting: 'Registering...',
    closed: 'Registration is currently closed.',
    failed: 'Registration failed.',
    network: 'Network error. Please check your connection.'
  }
};
var currentLang = 'ko';

function switchLang(lang) {
  currentLang = lang;
  var dict = I18N[lang];
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var k = el.getAttribute('data-i18n');
    if (dict[k] !== undefined) el.innerHTML = dict[k];
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(function(el) {
    var k = el.getAttribute('data-i18n-ph');
    if (dict[k] !== undefined) el.placeholder = dict[k];
  });
  // 토글 버튼 색상
  var btnKo = document.getElementById('btnLangKo');
  var btnEn = document.getElementById('btnLangEn');
  if (lang === 'ko') {
    btnKo.style.background = '#e53e3e'; btnKo.style.color = '#fff';
    btnEn.style.background = '#fff'; btnEn.style.color = '#e53e3e';
  } else {
    btnEn.style.background = '#e53e3e'; btnEn.style.color = '#fff';
    btnKo.style.background = '#fff'; btnKo.style.color = '#e53e3e';
  }
  // 휴대폰 입력 방식 전환
  var useKr = document.getElementById('useKrPhone');
  var useKrRow = document.getElementById('useKrPhoneRow');
  if (lang === 'ko') {
    document.getElementById('phoneRowKo').style.display = '';
    document.getElementById('phoneRowEn').style.display = 'none';
    if (useKrRow) useKrRow.style.display = 'none';
  } else {
    if (useKrRow) useKrRow.style.display = 'flex';
    if (useKr && useKr.checked) {
      document.getElementById('phoneRowKo').style.display = '';
      document.getElementById('phoneRowEn').style.display = 'none';
    } else {
      document.getElementById('phoneRowKo').style.display = 'none';
      document.getElementById('phoneRowEn').style.display = 'flex';
    }
  }
  // 영어 모드: 한국 주소 숨김 / 국가 드롭다운 표시 / 이메일 없음 버튼 숨김
  document.getElementById('grpAddress').style.display = lang === 'ko' ? 'block' : 'none';
  document.getElementById('grpCountry').style.display = lang === 'en' ? 'block' : 'none';
  document.getElementById('btnNoEmail').style.display = lang === 'ko' ? 'inline-block' : 'none';
  // 영어 모드: 회사 필수 표시 (소속 없음 체크박스 숨김)
  var noCompanyRow = document.getElementById('noCompany').parentElement;
  if (noCompanyRow) noCompanyRow.style.display = lang === 'en' ? 'none' : 'flex';
  if (lang === 'en') {
    document.getElementById('noCompany').checked = false;
    document.getElementById('company').disabled = false;
  }
  // 회사 라벨에 필수 표시 (영어 모드)
  var lblCo = document.querySelector('[data-i18n="lblCompany"]');
  if (lblCo) {
    var dict2 = I18N[lang];
    lblCo.innerHTML = dict2.lblCompany + (lang === 'en' ? ' <span class="required">*</span>' : '');
  }
  // 영어 모드면 이메일 입력 강제로 보이게
  if (lang === 'en') {
    document.getElementById('emailSection').style.display = 'block';
    document.getElementById('emailConsentRow').style.display = 'flex';
  }

  // closed / completion 페이지 텍스트
  var closedTitle = document.getElementById('closedTitle');
  var closedDesc = document.getElementById('closedDesc');
  var compTitle = document.getElementById('completionTitle');
  var compDone = document.getElementById('completionDoneText');
  var exhTitle = document.getElementById('exhibitionName');
  if (lang === 'en') {
    if (closedTitle) closedTitle.textContent = 'Registration Closed';
    if (closedDesc) closedDesc.textContent = 'On-site registration is currently closed.';
    if (compTitle) compTitle.textContent = 'Registration Complete';
    if (compDone) compDone.textContent = 'Your registration is complete.';
    document.title = 'On-site Registration';
  } else {
    if (closedTitle) closedTitle.textContent = '등록이 마감되었습니다';
    if (closedDesc) closedDesc.textContent = '현재 현장등록이 종료된 상태입니다.';
    if (compTitle) compTitle.textContent = '현장 등록 완료';
    if (compDone) compDone.textContent = '현장등록이 완료되었습니다.';
  }
}

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

  function populateCountries() {
    var sel = document.getElementById('countrySelect');
    if (!sel) return;
    for (var i = 0; i < COUNTRIES.length; i++) {
      var c = COUNTRIES[i];
      var opt = document.createElement('option');
      opt.value = i;
      opt.textContent = c.en + (c.code ? ' (' + c.code + ')' : '');
      sel.appendChild(opt);
    }
    sel.addEventListener('change', function() {
      var idx = parseInt(this.value);
      if (!isNaN(idx) && COUNTRIES[idx]) {
        document.getElementById('phoneCountry').value = COUNTRIES[idx].code || '';
        // 기타 선택 시 사용자가 직접 입력 가능하게
        document.getElementById('phoneCountry').readOnly = !!COUNTRIES[idx].code;
        clearError('grpCountry', 'errCountry');
      } else {
        document.getElementById('phoneCountry').value = '';
        document.getElementById('phoneCountry').readOnly = true;
      }
    });
  }

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

  var nameComposing = false;
  nameInput.addEventListener('compositionstart', function() { nameComposing = true; });
  nameInput.addEventListener('compositionend', function() { nameComposing = false; });
  nameInput.addEventListener('input', function() {
    if (!nameComposing) {
      // 조합 중이 아닐 때만 숫자/특수문자 차단 (한글/영문/공백/.- 만 허용)
      // 자모(ㄱ-ㅎㅏ-ㅣ)는 통과시켜서 사용자가 보고 직접 수정하도록 함
      this.value = this.value.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z\s.\-]/g, '');
    }
    if (this.value.trim()) {
      clearError('grpName', 'errName');
      this.classList.remove('input-error');
    }
  });

  emailId.addEventListener('input', function() {
    // 풀 이메일 입력 시 자동으로 ID/도메인 분리
    if (this.value.indexOf('@') !== -1) {
      var parts = this.value.split('@');
      this.value = parts[0];
      var rest = parts.slice(1).join('').replace(/@/g, '');
      if (rest) {
        emailDomain.value = rest;
        emailDomain.readOnly = false;
        emailDomainSelect.value = '';
      }
    }
    clearError('grpEmail', 'errEmail');
  });

  // 입력 끝나면 ID에 도메인 들어있는 경우 자동 제거
  emailId.addEventListener('blur', function() {
    var val = this.value.trim();
    var domains = ['naver.com','gmail.com','daum.net','hanmail.net','nate.com','kakao.com','outlook.com','hotmail.com','yahoo.com','icloud.com'];
    for (var i = 0; i < domains.length; i++) {
      if (val.toLowerCase().endsWith(domains[i])) {
        var idPart = val.slice(0, val.length - domains[i].length);
        // 끝의 @ 또는 . 제거
        idPart = idPart.replace(/[@.]+$/, '');
        if (idPart) {
          this.value = idPart;
          // 도메인이 비어있으면 자동으로 채움
          if (!emailDomain.value) {
            emailDomain.value = domains[i];
          }
        }
        break;
      }
    }
  });

  emailDomain.addEventListener('input', function() {
    // @ 차단
    this.value = this.value.replace(/@/g, '');
    clearError('grpEmail', 'errEmail');
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

  var refRadios = document.querySelectorAll('input[name="referral"]');
  for (var i = 0; i < refRadios.length; i++) {
    refRadios[i].addEventListener('change', function() { clearError('grpReferral', 'errReferral'); });
  }

  var jobRadios = document.querySelectorAll('input[name="job_type"]');
  for (var i = 0; i < jobRadios.length; i++) {
    jobRadios[i].addEventListener('change', function() {
      clearError('grpJob', 'errJob');
      document.getElementById('jobEtcWrap').style.display = this.value === '기타' ? 'block' : 'none';
    });
  }

  privacyConsent.addEventListener('change', function() {
    if (this.checked) clearError('grpPrivacy', 'errPrivacy');
  });

  // ===== 유효성 검사 =====

  function validateForm() {
    clearAllErrors();
    var valid = true;
    var firstEl = null;
    var T = ERR_I18N[currentLang];

    // 성명
    var nameVal = nameInput.value.trim();
    if (!nameVal) {
      showError('grpName', 'errName', T.name);
      setInputError(nameInput);
      if (!firstEl) firstEl = document.getElementById('grpName');
      valid = false;
    } else if (/[ㄱ-ㅎㅏ-ㅣ]/.test(nameVal)) {
      showError('grpName', 'errName', T.nameInvalid);
      setInputError(nameInput);
      if (!firstEl) firstEl = document.getElementById('grpName');
      valid = false;
    } else if (nameVal.replace(/\s/g,'').length < 2) {
      showError('grpName', 'errName', T.nameTooShort);
      setInputError(nameInput);
      if (!firstEl) firstEl = document.getElementById('grpName');
      valid = false;
    }

    // 휴대폰
    var useKrChecked = document.getElementById('useKrPhone') && document.getElementById('useKrPhone').checked;
    var useKoreanFormat = currentLang === 'ko' || (currentLang === 'en' && useKrChecked);
    if (useKoreanFormat) {
      var midVal = phoneMid.value.trim();
      var lastVal = phoneLast.value.trim();
      if (!midVal || !lastVal) {
        showError('grpPhone', 'errPhone', T.phoneEmpty);
        if (!midVal) setInputError(phoneMid);
        if (!lastVal) setInputError(phoneLast);
        if (!firstEl) firstEl = document.getElementById('grpPhone');
        valid = false;
      } else if (midVal.length < 3 || lastVal.length < 4) {
        showError('grpPhone', 'errPhone', T.phoneInvalid);
        if (midVal.length < 3) setInputError(phoneMid);
        if (lastVal.length < 4) setInputError(phoneLast);
        if (!firstEl) firstEl = document.getElementById('grpPhone');
        valid = false;
      }
    } else {
      var phoneFreeEl = document.getElementById('phoneFree');
      var freeVal = phoneFreeEl.value.replace(/[^0-9]/g, '');
      if (freeVal.length < 7) {
        showError('grpPhone', 'errPhone', T.phoneInvalid);
        setInputError(phoneFreeEl);
        if (!firstEl) firstEl = document.getElementById('grpPhone');
        valid = false;
      }
    }

    // SMS/카카오톡 수신동의 (필수)
    if (!smsConsent.checked) {
      showError('grpPhone', 'errSms', T.sms);
      if (!firstEl) firstEl = document.getElementById('grpPhone');
      valid = false;
    }

    // 이메일
    var eId = emailId.value.trim();
    var eDom = emailDomain.value.trim();
    if (currentLang === 'en') {
      if (!eId || !eDom) {
        showError('grpEmail', 'errEmail', T.emailRequired);
        if (!firstEl) firstEl = document.getElementById('grpEmail');
        valid = false;
      } else if (!emailConsent.checked) {
        showError('grpEmail', 'errEmailConsent', T.emailConsent);
        if (!firstEl) firstEl = document.getElementById('grpEmail');
        valid = false;
      }
    } else if (!noEmail) {
      if ((eId && !eDom) || (!eId && eDom)) {
        showError('grpEmail', 'errEmail', T.emailFormat);
        if (!firstEl) firstEl = document.getElementById('grpEmail');
        valid = false;
      }
      if (eId && eDom && !emailConsent.checked) {
        showError('grpEmail', 'errEmailConsent', T.emailConsent);
        if (!firstEl) firstEl = document.getElementById('grpEmail');
        valid = false;
      }
    }

    // 주소 (한국어) / 국가 (영어)
    if (currentLang === 'ko') {
      if (!addressSido.value) {
        showError('grpAddress', 'errAddress', T.sido);
        setInputError(addressSido);
        if (!firstEl) firstEl = document.getElementById('grpAddress');
        valid = false;
      } else if (!addressSigungu.value) {
        showError('grpAddress', 'errAddress', T.sigungu);
        setInputError(addressSigungu);
        if (!firstEl) firstEl = document.getElementById('grpAddress');
        valid = false;
      }
    } else {
      var countrySel = document.getElementById('countrySelect');
      if (!countrySel.value) {
        showError('grpCountry', 'errCountry', T.country);
        setInputError(countrySel);
        if (!firstEl) firstEl = document.getElementById('grpCountry');
        valid = false;
      }
    }

    // 회사 (영어 모드 필수)
    if (currentLang === 'en') {
      if (!company.value.trim()) {
        showError('grpCompany', 'errCompany', T.company);
        setInputError(company);
        if (!firstEl) firstEl = document.getElementById('grpCompany');
        valid = false;
      }
    }

    // 성별
    if (!document.querySelector('input[name="gender"]:checked')) {
      showError('grpGender', 'errGender', T.gender);
      if (!firstEl) firstEl = document.getElementById('grpGender');
      valid = false;
    }

    // 연령
    if (!document.querySelector('input[name="age_group"]:checked')) {
      showError('grpAge', 'errAge', T.age);
      if (!firstEl) firstEl = document.getElementById('grpAge');
      valid = false;
    }

    // 직업군
    var jobChecked = document.querySelector('input[name="job_type"]:checked');
    if (!jobChecked) {
      showError('grpJob', 'errJob', T.job);
      if (!firstEl) firstEl = document.getElementById('grpJob');
      valid = false;
    } else if (jobChecked.value === '기타') {
      var etcVal = document.getElementById('jobEtcInput').value.trim();
      if (!etcVal) {
        showError('grpJob', 'errJob', T.jobEtc);
        if (!firstEl) firstEl = document.getElementById('grpJob');
        valid = false;
      }
    }

    // 인지 경로
    var refChecked = document.querySelector('input[name="referral"]:checked');
    if (!refChecked) {
      showError('grpReferral', 'errReferral', T.referral);
      if (!firstEl) firstEl = document.getElementById('grpReferral');
      valid = false;
    } else if (refChecked.value === '기타') {
      var refEtcVal = document.getElementById('refEtcInput').value.trim();
      if (!refEtcVal) {
        showError('grpReferral', 'errReferral', T.referralEtc);
        if (!firstEl) firstEl = document.getElementById('grpReferral');
        valid = false;
      }
    }

    // 개인정보 동의
    if (!privacyConsent.checked) {
      showError('grpPrivacy', 'errPrivacy', T.privacy);
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
    btnSubmit.textContent = ERR_I18N[currentLang].submitting;

    var name = nameInput.value.trim();
    var phone;
    var useKrChecked2 = document.getElementById('useKrPhone') && document.getElementById('useKrPhone').checked;
    var useKoreanFormat2 = currentLang === 'ko' || (currentLang === 'en' && useKrChecked2);
    if (useKoreanFormat2) {
      phone = phonePrefix.value + '-' + phoneMid.value.trim() + '-' + phoneLast.value.trim();
    } else {
      var cc = document.getElementById('phoneCountry').value.trim();
      var pf = document.getElementById('phoneFree').value.trim();
      phone = cc + ' ' + pf;
    }

    var email = '';
    var eId = emailId.value.trim();
    var eDom = emailDomain.value.trim();
    if (currentLang === 'en' || !noEmail) {
      if (eId && eDom) email = eId + '@' + eDom;
    }

    var genderEl = document.querySelector('input[name="gender"]:checked');
    var ageGroup = document.querySelector('input[name="age_group"]:checked');
    var jobTypeEl = document.querySelector('input[name="job_type"]:checked');
    var jobTypeVal = jobTypeEl ? (jobTypeEl.value === '기타' ? ('기타: ' + document.getElementById('jobEtcInput').value.trim()) : jobTypeEl.value) : null;
    var referralEl = document.querySelector('input[name="referral"]:checked');
    var referralVal = referralEl ? (referralEl.value === '기타' ? ('기타: ' + document.getElementById('refEtcInput').value.trim()) : referralEl.value) : null;

    var countryKo = null;
    if (currentLang === 'en') {
      var cs = document.getElementById('countrySelect');
      var idx = parseInt(cs.value);
      if (!isNaN(idx) && COUNTRIES[idx]) countryKo = COUNTRIES[idx].ko;
    }

    var body = {
      name: name,
      phone: phone,
      sms_consent: smsConsent.checked,
      email: email || null,
      email_consent: emailConsent.checked,
      company: company.value.trim() || null,
      address_sido: currentLang === 'ko' ? addressSido.value : null,
      address_sigungu: currentLang === 'ko' ? addressSigungu.value : null,
      gender: genderEl ? genderEl.value : null,
      age_group: ageGroup ? ageGroup.value : null,
      job_type: jobTypeVal,
      privacy_consent: privacyConsent.checked,
      language: currentLang,
      country: countryKo,
      referral: referralVal
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
          showToast(ERR_I18N[currentLang].closed);
        } else {
          showToast(result.data.error || ERR_I18N[currentLang].failed);
        }
        btnSubmit.disabled = false;
        btnSubmit.textContent = currentLang === 'en' ? 'Register' : '현장 등록';
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
          document.getElementById('regJobDisplay').textContent = result.data.job_type || '';
          window.scrollTo(0, 0);
        });
    })
    .catch(function(err) {
      console.error(err);
      showToast(ERR_I18N[currentLang].network);
      btnSubmit.disabled = false;
      btnSubmit.textContent = currentLang === 'en' ? 'Register' : '현장 등록';
    });

    return false;
  });

  // ===== 설정 로드 (실시간 반영) =====

  function loadSettings() {
    fetch('/api/settings').then(function(r) { return r.json(); })
    .then(function(settings) {
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

      var pt = currentLang === 'en' ? (settings.privacy_text_en || settings.privacy_text) : settings.privacy_text;
      if (pt) {
        privacyBox.textContent = pt;
      }

      if (settings.exhibition_logo) {
        var logoImg = document.getElementById('exhibitionLogo');
        logoImg.src = settings.exhibition_logo;
        document.getElementById('logoArea').style.display = 'block';
      }

      var msg1El = document.getElementById('completionMsg1');
      var msg2El = document.getElementById('completionMsg2');
      var m1 = currentLang === 'en' ? (settings.completion_msg1_en || settings.completion_msg1) : settings.completion_msg1;
      var m2 = currentLang === 'en' ? (settings.completion_msg2_en || settings.completion_msg2) : settings.completion_msg2;
      if (m1) {
        msg1El.textContent = m1;
        if (settings.completion_msg1_color) msg1El.style.color = settings.completion_msg1_color;
        if (settings.completion_msg1_size) msg1El.style.fontSize = settings.completion_msg1_size + 'px';
      }
      if (m2) {
        msg2El.textContent = m2;
        if (settings.completion_msg2_color) msg2El.style.color = settings.completion_msg2_color;
        if (settings.completion_msg2_size) msg2El.style.fontSize = settings.completion_msg2_size + 'px';
      }
    })
    .catch(function(err) {
      console.error('설정 로드 실패:', err);
      form.style.display = 'block';
    });
  }

  // ===== 초기화 =====
  populateSido();
  populateCountries();

  // 영어 모드에서 "한국 번호 사용" 토글
  var useKrCb = document.getElementById('useKrPhone');
  if (useKrCb) {
    useKrCb.addEventListener('change', function() {
      if (currentLang !== 'en') return;
      if (this.checked) {
        document.getElementById('phoneRowKo').style.display = '';
        document.getElementById('phoneRowEn').style.display = 'none';
      } else {
        document.getElementById('phoneRowKo').style.display = 'none';
        document.getElementById('phoneRowEn').style.display = 'flex';
      }
    });
  }

  loadSettings();

  // 3초마다 설정 자동 갱신 (관리자 변경 실시간 반영)
  setInterval(loadSettings, 3000);

  // 모바일에서 앱 나갔다가 돌아올 때 페이지 복구
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
      loadSettings();
      // 완료 페이지도 폼도 안 보이면 폼 다시 표시
      var comp = document.getElementById('completionPage');
      var closed = document.getElementById('closedPage');
      if (comp.style.display !== 'block' && closed.style.display !== 'block' && form.style.display !== 'block') {
        form.style.display = 'block';
      }
    }
  });

  // pageshow: 뒤로가기/앞으로가기 캐시(bfcache)에서 복구될 때
  window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
      loadSettings();
      var comp = document.getElementById('completionPage');
      var closed = document.getElementById('closedPage');
      if (comp.style.display !== 'block' && closed.style.display !== 'block' && form.style.display !== 'block') {
        form.style.display = 'block';
      }
    }
  });

  console.log('동아전람 현장등록 시스템 로드 완료');
});
