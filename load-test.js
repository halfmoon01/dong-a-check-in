import http from 'k6/http';
import { check, sleep } from 'k6';

// 시나리오: 동시 접속자를 점점 늘려서 한계점 찾기
export const options = {
  scenarios: {
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },   // 10명
        { duration: '30s', target: 30 },   // 30명
        { duration: '30s', target: 50 },   // 50명
        { duration: '30s', target: 70 },   // 70명
        { duration: '30s', target: 100 },  // 100명
        { duration: '30s', target: 0 },    // 정리
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<3000'],  // 95% 요청이 3초 이내
  },
};

const BASE_URL = 'https://dong-a-registration-gkerh5gxgqhhbmhp.canadacentral-01.azurewebsites.net';

// 랜덤 데이터 생성
function randomData() {
  const names = ['김철수','이영희','박민수','정수진','최동욱','한미영','송재현','윤서연','장현우','오지은'];
  const sidos = ['서울','경기','인천','부산','대구','광주','대전','울산','세종','강원','충북','충남'];
  const sigungus = ['강남구','서초구','중구','해운대구','수성구','동구','유성구','남구','세종시','춘천시','청주시','천안시'];
  const ages = ['10대','20대','30대','40대','50대','60대 이상'];
  const jobs = ['건축설계사','인테리어 디자이너','시공전문가','자재유통업자','인테리어 수요자','일반관람객','기타'];
  const genders = ['남성','여성'];
  const r = Math.floor(Math.random() * 100000);

  return {
    name: names[r % names.length] + r,
    phone: `010-${String(r).padStart(4,'0')}-${String(r+1).padStart(4,'0')}`,
    email: `test${r}@test.com`,
    company: `테스트회사${r}`,
    address_sido: sidos[r % sidos.length],
    address_sigungu: sigungus[r % sigungus.length],
    gender: genders[r % genders.length],
    age_group: ages[r % ages.length],
    job_type: jobs[r % jobs.length],
    sms_consent: true,
    email_consent: true,
    privacy_consent: true,
  };
}

export default function () {
  // 1. 페이지 로딩
  const pageRes = http.get(BASE_URL + '/');
  check(pageRes, { '페이지 로딩 성공': (r) => r.status === 200 });

  // 2. 폼 작성 시간 (1~3초)
  sleep(Math.random() * 2 + 1);

  // 3. 등록 제출
  const payload = JSON.stringify(randomData());
  const params = { headers: { 'Content-Type': 'application/json' } };
  const regRes = http.post(BASE_URL + '/api/register', payload, params);
  check(regRes, {
    '등록 성공': (r) => r.status === 200 || r.status === 201,
    '응답 2초 이내': (r) => r.timings.duration < 2000,
  });

  sleep(1);
}
