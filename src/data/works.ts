export type LocalizedText = { ja: string; en: string };

export type Work = {
  slug: string;
  title: LocalizedText;
  summary: LocalizedText;
  description: LocalizedText; // モーダルで表示する詳しい説明
  tags: string[];
  url?: string; // 公開URL。あればモーダル内に「サイトを見る」リンクを表示
  thumbnail?: string; // public 配下のパス。未設定ならプレースホルダ
};

// 成果物は随時追加していく。
export const works: Work[] = [
  {
    slug: 'bpm-detector',
    title: { ja: 'BPM Detector', en: 'BPM Detector' },
    summary: {
      ja: 'ブラウザ上で楽曲のテンポ（BPM）を検出するWebアプリ。',
      en: 'A web app that detects the tempo (BPM) of music right in the browser.',
    },
    description: {
      ja: 'ブラウザ上で楽曲のテンポ（BPM）を検出するWebアプリ。音声ファイルの解析に加え、ボタンやSpaceキーのタップ間隔から手動で計測する機能も備えています。インストール不要で、その場ですぐにBPMを測れます。',
      en: 'A web app that detects the tempo (BPM) of music right in the browser. In addition to analyzing audio files, it can measure BPM manually from the interval between button or Space-key taps. No installation needed — measure BPM on the spot.',
    },
    tags: ['Web', 'Audio', 'TypeScript'],
    url: 'https://bpm-detector.yui666a.me/',
    thumbnail: '/img/works/bpm-detector.png',
  },
  {
    slug: 'ar-meishi',
    title: { ja: 'AR名刺', en: 'AR Business Card' },
    summary: {
      ja: 'WebARで3Dモデルが立ち上がる名刺。',
      en: 'A business card that pops up a 3D model via WebAR.',
    },
    description: {
      ja: 'WebARを使い、スマートフォンのカメラをかざすと3Dモデルが立ち上がる名刺。A-FrameとThree.jsで構築し、アプリのインストールなしにブラウザだけでAR体験を提供します。',
      en: 'A business card built with WebAR that pops up a 3D model when you point a smartphone camera at it. Built with A-Frame and Three.js, it delivers an AR experience in the browser with no app install required.',
    },
    tags: ['WebAR', 'A-Frame', 'Three.js'],
    url: 'https://yui666a.me/',
  },
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
    description: {
      ja: '新潟駅前のサウナ専門施設「sauna100」の予約システムを開発。アカウント登録からチケット購入まで、すべて公式LINEに連携したアプリで完結できるようにし、顧客満足度の向上を図りました。チェックインはQRコードで実施できるようにすることで、スムーズな入館管理を実現しています。',
      en: 'Built the reservation system for "sauna100," a sauna facility in front of Niigata Station. Everything from account registration to ticket purchase is handled inside an app linked to the official LINE account, improving customer experience. Check-in is done via QR code for smooth entry management.',
    },
    tags: ['DX', 'LINE', 'QR'],
    thumbnail: '/img/works/sauna100-reservation.png',
  },
  {
    slug: 'propally',
    title: { ja: 'propally システム開発', en: 'propally System Development' },
    summary: {
      ja: '検討・購入・管理・売却まで、不動産投資の全工程を1つのアプリで完結させるシステム。投資家と不動産会社双方の課題解決を目指した。',
      en: 'A system covering the full real-estate investment lifecycle — research, purchase, management, and sale — in a single app for both investors and agencies.',
    },
    description: {
      ja: '「不動産投資をもっとクリアに。」をコンセプトに、検討→購入→管理→売却までの不動産投資の全工程を1つのアプリで完結させるシステムを開発。投資家と不動産会社、双方の課題を解決することを目指しました。',
      en: 'Under the concept "Make real-estate investing clearer," I developed a system that completes the entire investment lifecycle — research, purchase, management, and sale — in a single app, aiming to solve the challenges faced by both investors and real-estate agencies.',
    },
    tags: ['DX', 'Real Estate'],
    thumbnail: '/img/works/propally.webp',
  },
  {
    slug: 'line-order',
    title: { ja: 'LINE受発注システム', en: 'LINE Order Management System' },
    summary: {
      ja: 'メールや電話の注文をLINEフォームに一元化し、LINE WORKS連携の通知で対応状況を可視化。受注ミスの削減と業務効率化を実現した。',
      en: 'Consolidated phone and email orders into a LINE form, with LINE WORKS notifications visualizing status — reducing errors and improving efficiency.',
    },
    description: {
      ja: '受発注作業の効率化を目指し、LINEとLINE WORKSを活用した受発注システムを開発。従来メールや電話に分散していた注文受付を、身近なLINEフォームに集約しました。さらにLINE WORKSへの通知機能により、対応状況の共有や確認作業の効率化、受注ミスの削減を実現しています。',
      en: 'To streamline order operations, I built an order management system using LINE and LINE WORKS. Orders that had been scattered across email and phone were consolidated into a familiar LINE form. Notifications to LINE WORKS made it easy to share status, streamline confirmation work, and reduce order-entry mistakes.',
    },
    tags: ['DX', 'LINE', 'LINE WORKS'],
    thumbnail: '/img/works/line-order.webp',
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
    description: {
      ja: '社員やパートが使い慣れたLINE WORKSを活用し、フォーム入力から報告書を自動作成するシステムを開発。システム要件の変更に伴い、開発言語をGAS（Google Apps Script）からPythonへ移行しました。これにより従来のバグや汎用性の低さを解消し、より信頼性の高いシステムを実現しています。',
      en: 'Developed a system that auto-generates reports from form input using LINE WORKS, a tool staff already knew well. As requirements changed, I migrated the implementation from GAS (Google Apps Script) to Python, resolving prior bugs and limited versatility for a more reliable system.',
    },
    tags: ['DX', 'Python', 'GAS'],
    thumbnail: '/img/works/line-works-report.png',
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
    description: {
      ja: 'イベント参加企画同士のマッチングを促すパンフレットを自動生成するシステムを開発。参加者間のマッチング効率を高め、運営側の制作工数も削減しました。',
      en: 'Built a system that automatically generates brochures to encourage matching between participating projects at an event, improving matching efficiency between participants while cutting the production effort for organizers.',
    },
    tags: ['DX', 'Automation'],
    thumbnail: '/img/works/digital-brochure.webp',
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
    description: {
      ja: '求人情報を管理するためのWordPressプラグインを開発。コーポレートサイト上で求人の登録・掲載を運用できるようにし、専門知識がなくても求人情報を更新できる仕組みを整えました。',
      en: 'Developed a WordPress plugin for managing job openings, enabling registration and listing of jobs directly on a corporate site so that staff could update postings without specialist knowledge.',
    },
    tags: ['WordPress', 'PHP', 'Plugin'],
    thumbnail: '/img/works/job-openings-plugin.png',
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
    description: {
      ja: '長岡市が推進する「NAGAOKA WORKER」プロジェクトにおいて、完全リモートワークで県外企業に勤める新しい働き方を提案するためのホームページを制作。長岡に住みながらリモートワークでの就業を希望する方々への認知拡大を目指し、効果的な情報発信をサポートしました。',
      en: 'For the "NAGAOKA WORKER" project led by Nagaoka City, I built a website proposing a new way of working — being fully remote for companies outside the prefecture. It supported effective outreach to people who want to live in Nagaoka while working remotely.',
    },
    tags: ['Creative', 'Web'],
    url: 'https://nagaoka-worker.jp/',
    thumbnail: '/img/works/nagaoka-worker.webp',
  },
];
