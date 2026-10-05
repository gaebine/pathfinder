import { PersonaInfo, UniversityInfo, AdmissionMilestone, StudentProfile } from '../types/admission';

export const CONSULTANT_PERSONAS: PersonaInfo[] = [
  {
    id: 'susi',
    name: '김진학',
    title: '수시·학생부종합 수석 컨설턴트',
    badge: '학종·교과·생기부',
    badgeColor: 'bg-blue-600 text-white',
    avatarIcon: 'GraduationCap',
    description: '학생부 교과·종합 전형 라인 진단, 생기부 3대 역량(학업/진로/공동체) 분석 및 수능 최저 충족 전략 전문',
    expertise: ['학생부종합전형 평가', '내신 환산점수 진단', '세특 차별화 코칭', '수시 6장 카드 배분'],
    recommendedPrompts: [
      '일반고 내신 2.3등급인데 수도권 상위권 컴공 학종으로 어디까지 가능할까요?',
      '생기부 진로역량과 학업역량을 강조할 수 있는 세특 작성 팁을 알려주세요.',
      '수시 6장 지원 카드를 상향/적정/안정 비율로 어떻게 배분해야 안전할까요?',
      '수능최저 3합 7을 맞춰야 하는데 국영수탐 중 어떤 과목에 집중하는 게 유리할까요?'
    ]
  },
  {
    id: 'jeongsi',
    name: '이정시',
    title: '정시·수능 전략연구소장',
    badge: '수능·정시·환산표점',
    badgeColor: 'bg-emerald-600 text-white',
    avatarIcon: 'Target',
    description: '수능 표준점수·백분위 분석, 대학별 영역 반영비율 및 가/나/다군 합격 포트폴리오 설계',
    expertise: ['수능 백분위·표준점수 분석', '가/나/다군 지원 시뮬레이션', '모의평가(6·9월) 역전 전략', '탐구 변환표준점수'],
    recommendedPrompts: [
      '국어 3, 수학 1(미적), 영어 2, 과탐 2·3등급이면 정시로 어느 대학 라인인가요?',
      '수학 반영 비율이 높아서 이과 교차지원에 유리한 인문계열 학과가 있나요?',
      '6월 모평 성적으로 수시 납치 방지선은 어떻게 설정해야 하나요?',
      '정시 가/나/다군에서 안정 1장, 적정 1장, 상향 1장을 고르는 공식이 궁금해요.'
    ]
  },
  {
    id: 'major',
    name: '박진로',
    title: '학과 탐색 & 진로 설계 멘토',
    badge: '학과·커리큘럼·진로',
    badgeColor: 'bg-purple-600 text-white',
    avatarIcon: 'Compass',
    description: '대학별 학과 커리큘럼 분석, 고교 권장 이수과목 안내 및 졸업 후 미래 유망 산업 진로 가이드',
    expertise: ['전공 적합성 과목 설계', '유사 학과 심층 비교', '학과별 인재상 분석', '신설 첨단학과 분석'],
    recommendedPrompts: [
      '컴퓨터공학과, 인공지능학과, 데이터사이언스학과의 실질적인 차이는 무엇인가요?',
      '경영학과와 경제학과 중 금융 공기업이나 컨설팅을 목표로 할 때 어느 쪽이 더 유리한가요?',
      '반도체공학과 지망 시 고2, 고3 때 필수적으로 이수해야 하는 과학/수학 선택과목은?',
      '자율전공(무전공) 입학 후 전공 선택 시 고려해야 할 장단점을 알려주세요.'
    ]
  },
  {
    id: 'mentor',
    name: '최멘토',
    title: '수험생 멘탈 & 공부 루틴 코치',
    badge: '멘탈케어·슬럼프·루틴',
    badgeColor: 'bg-amber-600 text-white',
    avatarIcon: 'HeartPulse',
    description: '수험생 슬럼프 극복, 시험 불안 마인드 컨트롤, 일일 학습 플래너 및 집중력 루틴 설계',
    expertise: ['시험 불안감 완화', '수험생 슬럼프 극복', '스터디 플래너 시간관리', '수면 및 컨디션 조절'],
    recommendedPrompts: [
      '모의고사 성적이 떨어져서 너무 불안하고 자꾸 딴생각이 들어요. 멘탈 어떻게 잡죠?',
      '순공 10시간을 채우려다 번아웃이 온 것 같아요. 지속 가능한 하루 루틴을 짜주세요.',
      '시험 전날 긴장해서 잠을 못 자는 편인데, 시험 당일 최고의 집중력을 내는 팁이 있나요?',
      '친구들은 벌써 다 앞서가는 것 같아서 자존감이 떨어질 때 마음가짐 조언 부탁드립니다.'
    ]
  },
  {
    id: 'info',
    name: '박전형',
    title: '실시간 입시 정보 & 전형 팩트체커',
    badge: '최신전형·수능일정·자소서',
    badgeColor: 'bg-rose-600 text-white',
    avatarIcon: 'Globe',
    description: '2025~2028 대학별 최신 모집요강, 수능/모의평가 공식 일정, 자기소개서 작성법 및 입시 이슈 팩트체크',
    expertise: ['대학별 최신 전형 변동사항', '수능 & 모의평가 시험 일정', '자기소개서 작성 및 첨삭 가이드', '무전공 선발 및 사탐런 분석'],
    recommendedPrompts: [
      '2026/2027학년도 대학별 무전공(자율전공) 선발 확대에 따른 유불리와 지원 전략을 분석해줘.',
      '학생부종합전형 자기소개서 1번(진로 및 학업 경험) 문항의 효과적인 스토리라인 작성법은?',
      '올해 수능 및 6월/9월 모의평가 상세 시험 일정과 성적 통지일을 알려줘.',
      '사탐런(이과생의 사회탐구 응시) 시 자연계열 지원 가능한 대학과 과학탐구 가산점 현황은?'
    ]
  }
];

export const INITIAL_STUDENT_PROFILE: StudentProfile = {
  grade: '고2',
  track: '자연·공학계열',
  gpa: 2.3,
  gpaKorean: 2.5,
  gpaMath: 1.8,
  gpaEnglish: 2.0,
  gpaInquiry: 2.2,
  mockKorean: 3,
  mockMath: 2,
  mockEnglish: 2,
  mockInquiry: 2,
  targetUniversities: '성균관대, 한양대, 중앙대, 경희대',
  targetMajor: '컴퓨터공학과 / 인공지능학과',
  memo: '수학 성적이 비교적 우수하며, 수시 학종으로 수도권 상위권 공대를 가고 싶습니다. 세특에서 AI 최적화 알고리즘 탐구를 녹여내고 싶습니다.'
};

export const UNIVERSITIES_DATA: UniversityInfo[] = [
  {
    id: 'snu',
    name: '서울대학교',
    region: '서울',
    category: '국립대',
    avgGradeCut: '내신 1.0~1.3 / 정시 상위 0.5% 이내',
    susiTip: '지균(수능최저 3개 7합) 및 일반전형(심층 면접 필수). 단순 암기보다 학업적 깊이와 지적 호기심 증명이 핵심.',
    jeongsiTip: '정시 지균/일반 전형 모두 교과평가(AA/AB/BB) 정성 반영. 정시 준비생도 내신과 세특 관리 필수.',
    tags: ['SKY', '종합평가', '심층면접', '최상위']
  },
  {
    id: 'yonsei',
    name: '연세대학교',
    region: '서울',
    category: '사립대',
    avgGradeCut: '내신 1.1~1.6 / 정시 상위 1.0% 이내',
    susiTip: '추천형(교과 면접 폐지 후 수능최저 도입), 활동우수형(수능최저 강화). 면접 대비 및 수능최저 충족률이 합격의 관건.',
    jeongsiTip: '인문/자연 표준점수 반영. 의약학 및 첨단융합학부 영어 감점 폭 유의.',
    tags: ['SKY', '추천형', '활동우수', '수능최저']
  },
  {
    id: 'korea',
    name: '고려대학교',
    region: '서울',
    category: '사립대',
    avgGradeCut: '내신 1.2~1.7 / 정시 상위 1.2% 이내',
    susiTip: '학교추천(교과)과 학업우수형(학종, 4합 8 등 높은 수능최저). 높은 최저를 맞출 경우 실질 경쟁률이 대폭 하락.',
    jeongsiTip: '교과우수전형(내신 20% 반영) 신설. 일반전형과 분할 지원 전략 검토 가능.',
    tags: ['SKY', '학업우수', '높은최저', '교과우수']
  },
  {
    id: 'skku',
    name: '성균관대학교',
    region: '서울',
    category: '사립대',
    avgGradeCut: '내신 1.4~2.2 / 정시 상위 2.5% 이내',
    susiTip: '학교생활우수자/융합형/탐구형. 계열모집(공학계열, 자연과학 등)과 학과모집 이원화. 전공적합성보다 학업수행역량 중시.',
    jeongsiTip: '다군 계약학과(소프트웨어 등) 신설로 다군 지원 시 높은 메리트.',
    tags: ['성한서', '계열모집', '다군모집', '학업역량']
  },
  {
    id: 'hanyang',
    name: '한양대학교',
    region: '서울',
    category: '사립대',
    avgGradeCut: '내신 1.3~2.1 / 정시 상위 3.0% 이내',
    susiTip: '추천형(수능최저 신설), 서류형(수능최저 없음, 생기부 정밀 평가), 면접형. 공과대학의 명성답게 수학/과탐 세특 주목.',
    jeongsiTip: '과탐 변환표준점수 반영 및 과학탐구Ⅱ 가산점 고려 필요.',
    tags: ['공대명문', '추천형', '서류형', '무최저']
  },
  {
    id: 'seogang',
    name: '서강대학교',
    region: '서울',
    category: '사립대',
    avgGradeCut: '내신 1.4~2.3 / 정시 상위 3.5% 이내',
    susiTip: '지역균형(교과) 및 일반(학종). 다전공 제도가 가장 자유로워 융합 인재상 부합 학생 유리.',
    jeongsiTip: '수학 반영 비율이 매우 높아 문·이과 교차지원에서 수학 고득점자에게 절대적 유리.',
    tags: ['다전공', '수학고반영', '자유전공', '서강학풍']
  },
  {
    id: 'cau',
    name: '중앙대학교',
    region: '서울',
    category: '사립대',
    avgGradeCut: '내신 1.7~2.6 / 정시 상위 4.5% 이내',
    susiTip: 'CAU융합형인재(학교생활 균형성) vs CAU탐구형인재(전공 심화 탐구역량) 구분에 따른 맞춤 지원.',
    jeongsiTip: '다군 경영학부, 소프트웨어학부 등 다군 전통 강자. 추합 회전율 감안한 공격적 지원 가능.',
    tags: ['중경외시', '융합형', '탐구형', '다군추합']
  },
  {
    id: 'khu',
    name: '경희대학교',
    region: '서울',
    category: '사립대',
    avgGradeCut: '내신 1.8~2.7 / 정시 상위 5.0% 이내',
    susiTip: '네오르네상스전형(면접 비중 30%). 면접에서 생기부 확인 질문이 매우 꼼꼼하므로 본인 세특 완벽 숙지 필수.',
    jeongsiTip: '서울(인문/의약) 및 국제(공학/소프트웨어) 캠퍼스별 수능 반영 지표 확인 필요.',
    tags: ['네오르네상스', '면접철저', '국제캠퍼스', '의약학']
  },
  {
    id: 'kaist',
    name: 'KAIST / 과기의전',
    region: '과학기술원',
    category: '특별법법인',
    avgGradeCut: '일반고 1.0~1.3 / 과고·영재고 우수자',
    susiTip: '수시 6회 지원 제한에 포함되지 않는 보너스 카드! 수학·과학 구술면접 대비가 필수.',
    jeongsiTip: '정시 군외 모집. 수능 성적만으로 선발하며 가/나/다군 외 추가 지원 가능.',
    tags: ['연구중심', '수시6회미포함', '군외모집', '무은재']
  }
];

export const ADMISSION_MILESTONES: AdmissionMilestone[] = [
  {
    date: '2026. 11. 19 (목)',
    title: '2027학년도 대학수학능력시험',
    dDayText: '수능 본고사',
    category: '수능',
    description: '전국 고3 및 수험생 대상 대학수학능력시험 본고사 시행일'
  },
  {
    date: '2026. 09. 07 ~ 09. 11',
    title: '2027학년도 수시모집 원서접수',
    dDayText: '수시 원서접수',
    category: '수시',
    description: '대학별 3일 이상 진행, 수시 6회 지원 카드 최종 제출 기간'
  },
  {
    date: '2026. 09. 03 (수)',
    title: '한국교육과정평가원 9월 모의평가',
    dDayText: '9월 모평',
    category: '모의고사',
    description: '수시 원서접수 직전 마지막 객관적 수능 예측 및 수시 지원선 최종 결정 기준'
  },
  {
    date: '2026. 06. 04 (목)',
    title: '한국교육과정평가원 6월 모의평가',
    dDayText: '6월 모평',
    category: '모의고사',
    description: 'N수생 첫 합류, 수능 출제 기조 및 본인의 전국 위치를 가늠하는 첫 시험'
  },
  {
    date: '2026. 12. 29 ~ 2027. 01. 02',
    title: '2027학년도 정시모집 원서접수',
    dDayText: '정시 원서접수',
    category: '정시',
    description: '가/나/다군 3개 군별 1장씩 총 3장의 대학 원서 접수 기간'
  }
];
