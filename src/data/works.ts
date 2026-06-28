export type LocalizedText = { ja: string; en: string };

export type Work = {
  slug: string;
  title: LocalizedText;
  summary: LocalizedText;
  tags: string[];
  url?: string; // 公開URLがある場合のみ。未設定ならカードはリンクなしで表示
  thumbnail?: string; // public 配下のパス。未設定ならプレースホルダ
};

// 成果物は随時追加していく。
export const works: Work[] = [
  {
    slug: 'sauna100-reservation',
    title: {
      ja: 'sauna100 予約管理システム',
      en: 'sauna100 Reservation Management System',
    },
    summary: {
      ja: 'アカウント登録からチケット購入まで公式LINE連携アプリで完結。QRコードによるチェックインで入館をスムーズにした予約管理システム。',
      en: 'A reservation system handling everything from sign-up to ticket purchase inside a LINE-linked app, with QR-code check-in for smooth entry.',
    },
    tags: ['DX', 'LINE', 'QR'],
  },
  {
    slug: 'propally',
    title: { ja: 'propally システム開発', en: 'propally System Development' },
    summary: {
      ja: '検討・購入・管理・売却まで、不動産投資の全工程を1つのアプリで完結させるシステム。投資家と不動産会社双方の課題解決を目指した。',
      en: 'A system covering the full real-estate investment lifecycle — research, purchase, management, and sale — in a single app for both investors and agencies.',
    },
    tags: ['DX', 'Real Estate'],
  },
  {
    slug: 'line-order',
    title: { ja: 'LINE受発注システム', en: 'LINE Order Management System' },
    summary: {
      ja: 'メールや電話の注文をLINEフォームに一元化し、LINE WORKS連携の通知で対応状況を可視化。受注ミスの削減と業務効率化を実現した。',
      en: 'Consolidated phone and email orders into a LINE form, with LINE WORKS notifications visualizing status — reducing errors and improving efficiency.',
    },
    tags: ['DX', 'LINE', 'LINE WORKS'],
  },
  {
    slug: 'line-works-report',
    title: {
      ja: 'LINE WORKS 報告書自動作成システム',
      en: 'LINE WORKS Report Automation System',
    },
    summary: {
      ja: '使い慣れたLINE WORKSのフォーム入力から報告書を自動生成。GASからPythonへ移行し、信頼性と汎用性を高めた。',
      en: 'Auto-generates reports from familiar LINE WORKS form input. Migrated from GAS to Python for higher reliability and versatility.',
    },
    tags: ['DX', 'Python', 'GAS'],
  },
  {
    slug: 'digital-brochure',
    title: {
      ja: 'デジタルパンフレット生成システム',
      en: 'Digital Brochure Generation System',
    },
    summary: {
      ja: '参加企画のマッチングを促すパンフレットを自動生成するシステム。イベント参加者間のマッチング効率を高めた。',
      en: 'A system that auto-generates brochures to promote matching between event participants and projects.',
    },
    tags: ['DX', 'Automation'],
  },
  {
    slug: 'job-openings-plugin',
    title: {
      ja: '求人管理プラグイン開発',
      en: 'Job Openings Management Plugin',
    },
    summary: {
      ja: '求人情報を管理するためのWordPressプラグインを開発。コーポレートサイト上で求人の登録・掲載を運用できるようにした。',
      en: 'A WordPress plugin for managing job openings, enabling registration and listing of jobs directly on a corporate site.',
    },
    tags: ['WordPress', 'PHP', 'Plugin'],
    url: 'https://yui666a.github.io/job-openings-plugin/',
  },
  {
    slug: 'nagaoka-worker',
    title: {
      ja: 'NAGAOKA WORKER ホームページ制作',
      en: 'NAGAOKA WORKER Website',
    },
    summary: {
      ja: '長岡に住みながら県外企業でリモートワークする新しい働き方を提案するWebサイトを制作。認知拡大と情報発信を支援した。',
      en: 'Built a website promoting a new way of working — living in Nagaoka while working remotely for companies elsewhere.',
    },
    tags: ['Creative', 'Web'],
    url: 'https://nagaoka-worker.jp/',
  },
  {
    slug: 'bpm-detector',
    title: { ja: 'BPM Detector', en: 'BPM Detector' },
    summary: {
      ja: 'ブラウザ上で楽曲のテンポ（BPM）を検出するWebアプリ。',
      en: 'A web app that detects the tempo (BPM) of music right in the browser.',
    },
    tags: ['Web', 'Audio', 'TypeScript'],
    url: 'https://bpm-detector.yui666a.me/',
  },
  {
    slug: 'ar-meishi',
    title: { ja: 'AR名刺', en: 'AR Business Card' },
    summary: {
      ja: 'WebARで3Dモデルが立ち上がる名刺。',
      en: 'A business card that pops up a 3D model via WebAR.',
    },
    tags: ['WebAR', 'A-Frame', 'Three.js'],
    url: 'https://yui666a.me/',
  },
];
