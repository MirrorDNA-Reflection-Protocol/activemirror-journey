// i18n.js - Internationalization for Active MirrorOS
// 29 languages with RTL support

export const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English', native: 'English', rtl: false },
    { code: 'zh', name: 'Chinese', native: '中文', rtl: false },
    { code: 'es', name: 'Spanish', native: 'Español', rtl: false },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी', rtl: false },
    { code: 'ar', name: 'Arabic', native: 'العربية', rtl: true },
    { code: 'bn', name: 'Bengali', native: 'বাংলা', rtl: false },
    { code: 'pt', name: 'Portuguese', native: 'Português', rtl: false },
    { code: 'ru', name: 'Russian', native: 'Русский', rtl: false },
    { code: 'ja', name: 'Japanese', native: '日本語', rtl: false },
    { code: 'de', name: 'German', native: 'Deutsch', rtl: false },
    { code: 'fr', name: 'French', native: 'Français', rtl: false },
    { code: 'ko', name: 'Korean', native: '한국어', rtl: false },
    { code: 'it', name: 'Italian', native: 'Italiano', rtl: false },
    { code: 'tr', name: 'Turkish', native: 'Türkçe', rtl: false },
    { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt', rtl: false },
    { code: 'th', name: 'Thai', native: 'ไทย', rtl: false },
    { code: 'pl', name: 'Polish', native: 'Polski', rtl: false },
    { code: 'nl', name: 'Dutch', native: 'Nederlands', rtl: false },
    { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia', rtl: false },
    { code: 'uk', name: 'Ukrainian', native: 'Українська', rtl: false },
    { code: 'he', name: 'Hebrew', native: 'עברית', rtl: true },
    { code: 'fa', name: 'Persian', native: 'فارسی', rtl: true },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்', rtl: false },
    { code: 'te', name: 'Telugu', native: 'తెలుగు', rtl: false },
    { code: 'ur', name: 'Urdu', native: 'اردو', rtl: true },
    { code: 'ms', name: 'Malay', native: 'Bahasa Melayu', rtl: false },
    { code: 'sw', name: 'Swahili', native: 'Kiswahili', rtl: false },
    { code: 'cs', name: 'Czech', native: 'Čeština', rtl: false },
    { code: 'mr', name: 'Marathi', native: 'मराठी', rtl: false }
];

const TRANSLATIONS = {
    en: {
        appTitle: 'Active MirrorOS', tagline: 'Sovereign AI that runs in your browser.', tagline2: 'No cloud. No tracking. Yours forever.',
        clickToStart: 'Click a model to begin', downloadingTitle: 'Downloading to Your Browser', downloadNote: 'This only happens once. Model stays on your device.',
        deviceScore: 'Device Score', recommendedFor: 'Recommended for you', analyzing: 'Analyzing device...', useThis: 'Use This',
        showAllModels: 'Show all models', hideModels: 'Show fewer', ram: 'RAM', cores: 'Cores', gpu: 'GPU', noGpu: 'No GPU',
        quality: 'Quality', speed: 'Speed', download: 'Download', recommended: 'Recommended', welcomeBack: 'Welcome back',
        continueSession: 'Continue', newSession: 'New Session', openVault: 'Open Vault', lastSession: 'Last session',
        recentSessions: 'Recent Sessions', typeMessage: 'Type a message...', send: 'Send', voiceInput: 'Voice input',
        stopRecording: 'Stop recording', loadingModel: 'Loading model...', downloading: 'Downloading', initializing: 'Initializing...',
        ready: 'Ready', settings: 'Settings', language: 'Language', voiceEnabled: 'Voice Input', soundEnabled: 'Sound Effects',
        showSuggestions: 'Show Suggestions', darkMode: 'Dark Mode', data: 'Data', storageUsed: 'Storage Used', totalSessions: 'Total Sessions',
        exportData: 'Export All Data', clearData: 'Clear All Data', clearConfirm: 'Delete all local data? This cannot be undone.',
        about: 'About', version: 'Version', builtBy: 'Built by N1 Intelligence', vault: 'Vault', searchVault: 'Search vault...',
        noSessions: 'No sessions yet', deleteSession: 'Delete', offline: 'Offline — Model cached, still working', install: 'Install App',
        close: 'Close', cancel: 'Cancel', confirm: 'Confirm', skipToMain: 'Skip to main content', menuOpen: 'Open menu', menuClose: 'Close menu'
    },
    zh: {
        appTitle: 'Active MirrorOS', tagline: '在浏览器中运行的主权AI', tagline2: '无云端。无追踪。永远属于你。', deviceScore: '设备评分',
        recommendedFor: '为你推荐', analyzing: '正在分析设备...', useThis: '使用此模型', showAllModels: '显示所有模型', hideModels: '收起',
        ram: '内存', cores: '核心', gpu: '显卡', noGpu: '无显卡', quality: '质量', speed: '速度', download: '下载', recommended: '推荐',
        welcomeBack: '欢迎回来', continueSession: '继续', newSession: '新会话', openVault: '打开存储库', lastSession: '上次会话',
        recentSessions: '最近会话', typeMessage: '输入消息...', send: '发送', voiceInput: '语音输入', stopRecording: '停止录音',
        loadingModel: '正在加载模型...', downloading: '下载中', initializing: '初始化中...', ready: '就绪', settings: '设置',
        language: '语言', voiceEnabled: '语音输入', soundEnabled: '音效', showSuggestions: '显示建议', darkMode: '深色模式', data: '数据',
        storageUsed: '已用存储', totalSessions: '会话总数', exportData: '导出所有数据', clearData: '清除所有数据',
        clearConfirm: '删除所有本地数据？', about: '关于', version: '版本', builtBy: 'N1 Intelligence', vault: '存储库',
        searchVault: '搜索...', noSessions: '暂无会话', deleteSession: '删除', offline: '离线 — 模型已缓存', install: '安装应用',
        close: '关闭', cancel: '取消', confirm: '确认', skipToMain: '跳至主内容', menuOpen: '打开菜单', menuClose: '关闭菜单'
    },
    es: {
        appTitle: 'Active MirrorOS', tagline: 'IA soberana en tu navegador.', tagline2: 'Sin nube. Sin rastreo. Tuyo para siempre.',
        deviceScore: 'Puntuación', recommendedFor: 'Recomendado', analyzing: 'Analizando...', useThis: 'Usar', showAllModels: 'Todos',
        hideModels: 'Menos', ram: 'RAM', cores: 'Núcleos', gpu: 'GPU', noGpu: 'Sin GPU', quality: 'Calidad', speed: 'Velocidad',
        download: 'Descargar', recommended: 'Recomendado', welcomeBack: 'Bienvenido', continueSession: 'Continuar', newSession: 'Nueva',
        openVault: 'Bóveda', lastSession: 'Última', recentSessions: 'Recientes', typeMessage: 'Mensaje...', send: 'Enviar',
        voiceInput: 'Voz', stopRecording: 'Detener', loadingModel: 'Cargando...', downloading: 'Descargando', initializing: 'Iniciando...',
        ready: 'Listo', settings: 'Configuración', language: 'Idioma', voiceEnabled: 'Voz', soundEnabled: 'Sonidos', showSuggestions: 'Sugerencias',
        darkMode: 'Oscuro', data: 'Datos', storageUsed: 'Almacenamiento', totalSessions: 'Sesiones', exportData: 'Exportar', clearData: 'Borrar',
        clearConfirm: '¿Eliminar todo?', about: 'Acerca de', version: 'Versión', builtBy: 'N1 Intelligence', vault: 'Bóveda',
        searchVault: 'Buscar...', noSessions: 'Sin sesiones', deleteSession: 'Eliminar', offline: 'Sin conexión — Cache', install: 'Instalar',
        close: 'Cerrar', cancel: 'Cancelar', confirm: 'Confirmar', skipToMain: 'Ir al contenido', menuOpen: 'Menú', menuClose: 'Cerrar'
    },
    hi: {
        appTitle: 'Active MirrorOS', tagline: 'आपके ब्राउज़र में स्वतंत्र AI', tagline2: 'कोई क्लाउड नहीं। कोई ट्रैकिंग नहीं।',
        deviceScore: 'स्कोर', recommendedFor: 'अनुशंसित', analyzing: 'विश्लेषण...', useThis: 'उपयोग करें', showAllModels: 'सभी मॉडल',
        hideModels: 'कम', ram: 'रैम', cores: 'कोर', gpu: 'GPU', noGpu: 'कोई GPU नहीं', quality: 'गुणवत्ता', speed: 'गति',
        download: 'डाउनलोड', recommended: 'अनुशंसित', welcomeBack: 'स्वागत है', continueSession: 'जारी', newSession: 'नया',
        openVault: 'वॉल्ट', lastSession: 'पिछला', recentSessions: 'हाल के', typeMessage: 'संदेश...', send: 'भेजें', voiceInput: 'वॉइस',
        stopRecording: 'रोकें', loadingModel: 'लोड हो रहा...', downloading: 'डाउनलोड', initializing: 'प्रारंभ...', ready: 'तैयार',
        settings: 'सेटिंग्स', language: 'भाषा', voiceEnabled: 'वॉइस', soundEnabled: 'ध्वनि', showSuggestions: 'सुझाव', darkMode: 'डार्क',
        data: 'डेटा', storageUsed: 'संग्रहण', totalSessions: 'सत्र', exportData: 'निर्यात', clearData: 'साफ़', clearConfirm: 'हटाएं?',
        about: 'जानकारी', version: 'संस्करण', builtBy: 'N1 Intelligence', vault: 'वॉल्ट', searchVault: 'खोजें...', noSessions: 'कोई नहीं',
        deleteSession: 'हटाएं', offline: 'ऑफ़लाइन — कैश्ड', install: 'इंस्टॉल', close: 'बंद', cancel: 'रद्द', confirm: 'पुष्टि',
        skipToMain: 'मुख्य सामग्री', menuOpen: 'मेनू', menuClose: 'बंद'
    },
    ar: {
        appTitle: 'Active MirrorOS', tagline: 'ذكاء اصطناعي في متصفحك.', tagline2: 'بدون سحابة. بدون تتبع. ملكك للأبد.',
        deviceScore: 'النقاط', recommendedFor: 'موصى به', analyzing: 'تحليل...', useThis: 'استخدم', showAllModels: 'الكل',
        hideModels: 'أقل', ram: 'ذاكرة', cores: 'نوى', gpu: 'GPU', noGpu: 'لا GPU', quality: 'جودة', speed: 'سرعة', download: 'تحميل',
        recommended: 'موصى', welcomeBack: 'مرحباً', continueSession: 'متابعة', newSession: 'جديد', openVault: 'الخزنة',
        lastSession: 'الأخيرة', recentSessions: 'الأخيرة', typeMessage: 'رسالة...', send: 'إرسال', voiceInput: 'صوت', stopRecording: 'إيقاف',
        loadingModel: 'تحميل...', downloading: 'جاري', initializing: 'تهيئة...', ready: 'جاهز', settings: 'إعدادات', language: 'اللغة',
        voiceEnabled: 'صوت', soundEnabled: 'أصوات', showSuggestions: 'اقتراحات', darkMode: 'داكن', data: 'بيانات', storageUsed: 'تخزين',
        totalSessions: 'جلسات', exportData: 'تصدير', clearData: 'مسح', clearConfirm: 'حذف الكل؟', about: 'حول', version: 'إصدار',
        builtBy: 'N1 Intelligence', vault: 'خزنة', searchVault: 'بحث...', noSessions: 'لا يوجد', deleteSession: 'حذف',
        offline: 'غير متصل — مخزن', install: 'تثبيت', close: 'إغلاق', cancel: 'إلغاء', confirm: 'تأكيد', skipToMain: 'الرئيسي',
        menuOpen: 'قائمة', menuClose: 'إغلاق'
    },
    ja: {
        appTitle: 'Active MirrorOS', tagline: 'ブラウザで動く主権型AI', tagline2: 'クラウドなし。追跡なし。永遠にあなたのもの。',
        deviceScore: 'スコア', recommendedFor: 'おすすめ', analyzing: '分析中...', useThis: '使用', showAllModels: 'すべて', hideModels: '減らす',
        ram: 'RAM', cores: 'コア', gpu: 'GPU', noGpu: 'GPUなし', quality: '品質', speed: '速度', download: 'DL', recommended: 'おすすめ',
        welcomeBack: 'おかえり', continueSession: '続ける', newSession: '新規', openVault: 'ボールト', lastSession: '前回', recentSessions: '最近',
        typeMessage: 'メッセージ...', send: '送信', voiceInput: '音声', stopRecording: '停止', loadingModel: '読込中...', downloading: 'DL中',
        initializing: '初期化...', ready: '準備完了', settings: '設定', language: '言語', voiceEnabled: '音声', soundEnabled: '効果音',
        showSuggestions: '提案', darkMode: 'ダーク', data: 'データ', storageUsed: 'ストレージ', totalSessions: 'セッション',
        exportData: 'エクスポート', clearData: '消去', clearConfirm: '全削除？', about: '情報', version: 'バージョン', builtBy: 'N1 Intelligence',
        vault: 'ボールト', searchVault: '検索...', noSessions: 'なし', deleteSession: '削除', offline: 'オフライン — キャッシュ済',
        install: 'インストール', close: '閉じる', cancel: 'キャンセル', confirm: '確認', skipToMain: 'メインへ', menuOpen: 'メニュー', menuClose: '閉じる'
    },
    fr: {
        appTitle: 'Active MirrorOS', tagline: 'IA souveraine dans votre navigateur.', tagline2: 'Pas de cloud. Pas de suivi. À vous.',
        deviceScore: 'Score', recommendedFor: 'Recommandé', analyzing: 'Analyse...', useThis: 'Utiliser', showAllModels: 'Tous', hideModels: 'Moins',
        ram: 'RAM', cores: 'Cœurs', gpu: 'GPU', noGpu: 'Pas de GPU', quality: 'Qualité', speed: 'Vitesse', download: 'DL', recommended: 'Recommandé',
        welcomeBack: 'Bon retour', continueSession: 'Continuer', newSession: 'Nouveau', openVault: 'Coffre', lastSession: 'Dernière',
        recentSessions: 'Récentes', typeMessage: 'Message...', send: 'Envoyer', voiceInput: 'Voix', stopRecording: 'Stop', loadingModel: 'Chargement...',
        downloading: 'Téléchargement', initializing: 'Initialisation...', ready: 'Prêt', settings: 'Paramètres', language: 'Langue', voiceEnabled: 'Voix',
        soundEnabled: 'Sons', showSuggestions: 'Suggestions', darkMode: 'Sombre', data: 'Données', storageUsed: 'Stockage', totalSessions: 'Sessions',
        exportData: 'Exporter', clearData: 'Effacer', clearConfirm: 'Tout supprimer?', about: 'À propos', version: 'Version', builtBy: 'N1 Intelligence',
        vault: 'Coffre', searchVault: 'Rechercher...', noSessions: 'Aucune', deleteSession: 'Supprimer', offline: 'Hors ligne — Cache', install: 'Installer',
        close: 'Fermer', cancel: 'Annuler', confirm: 'Confirmer', skipToMain: 'Contenu', menuOpen: 'Menu', menuClose: 'Fermer'
    },
    de: {
        appTitle: 'Active MirrorOS', tagline: 'Souveräne KI in Ihrem Browser.', tagline2: 'Keine Cloud. Kein Tracking. Für immer Ihres.',
        deviceScore: 'Score', recommendedFor: 'Empfohlen', analyzing: 'Analysiere...', useThis: 'Verwenden', showAllModels: 'Alle', hideModels: 'Weniger',
        ram: 'RAM', cores: 'Kerne', gpu: 'GPU', noGpu: 'Keine GPU', quality: 'Qualität', speed: 'Geschwindigkeit', download: 'DL', recommended: 'Empfohlen',
        welcomeBack: 'Willkommen', continueSession: 'Fortsetzen', newSession: 'Neu', openVault: 'Tresor', lastSession: 'Letzte', recentSessions: 'Letzte',
        typeMessage: 'Nachricht...', send: 'Senden', voiceInput: 'Sprache', stopRecording: 'Stop', loadingModel: 'Laden...', downloading: 'Download',
        initializing: 'Initialisierung...', ready: 'Bereit', settings: 'Einstellungen', language: 'Sprache', voiceEnabled: 'Sprache', soundEnabled: 'Sounds',
        showSuggestions: 'Vorschläge', darkMode: 'Dunkel', data: 'Daten', storageUsed: 'Speicher', totalSessions: 'Sitzungen', exportData: 'Export',
        clearData: 'Löschen', clearConfirm: 'Alles löschen?', about: 'Über', version: 'Version', builtBy: 'N1 Intelligence', vault: 'Tresor',
        searchVault: 'Suchen...', noSessions: 'Keine', deleteSession: 'Löschen', offline: 'Offline — Cache', install: 'Installieren', close: 'Schließen',
        cancel: 'Abbrechen', confirm: 'Bestätigen', skipToMain: 'Zum Inhalt', menuOpen: 'Menü', menuClose: 'Schließen'
    },
    ko: {
        appTitle: 'Active MirrorOS', tagline: '브라우저에서 실행되는 주권 AI', tagline2: '클라우드 없음. 추적 없음. 영원히 당신 것.',
        deviceScore: '점수', recommendedFor: '추천', analyzing: '분석 중...', useThis: '사용', showAllModels: '모두', hideModels: '줄이기',
        ram: 'RAM', cores: '코어', gpu: 'GPU', noGpu: 'GPU 없음', quality: '품질', speed: '속도', download: '다운로드', recommended: '추천',
        welcomeBack: '다시 오셨네요', continueSession: '계속', newSession: '새로', openVault: '볼트', lastSession: '마지막', recentSessions: '최근',
        typeMessage: '메시지...', send: '전송', voiceInput: '음성', stopRecording: '중지', loadingModel: '로딩...', downloading: '다운로드 중',
        initializing: '초기화...', ready: '준비됨', settings: '설정', language: '언어', voiceEnabled: '음성', soundEnabled: '효과음',
        showSuggestions: '제안', darkMode: '다크', data: '데이터', storageUsed: '저장소', totalSessions: '세션', exportData: '내보내기',
        clearData: '지우기', clearConfirm: '모두 삭제?', about: '정보', version: '버전', builtBy: 'N1 Intelligence', vault: '볼트',
        searchVault: '검색...', noSessions: '없음', deleteSession: '삭제', offline: '오프라인 — 캐시됨', install: '설치', close: '닫기',
        cancel: '취소', confirm: '확인', skipToMain: '본문으로', menuOpen: '메뉴', menuClose: '닫기'
    },
    pt: {
        appTitle: 'Active MirrorOS', tagline: 'IA soberana no seu navegador.', tagline2: 'Sem nuvem. Sem rastreio. Seu para sempre.',
        deviceScore: 'Pontuação', recommendedFor: 'Recomendado', analyzing: 'Analisando...', useThis: 'Usar', showAllModels: 'Todos', hideModels: 'Menos',
        ram: 'RAM', cores: 'Núcleos', gpu: 'GPU', noGpu: 'Sem GPU', quality: 'Qualidade', speed: 'Velocidade', download: 'DL', recommended: 'Recomendado',
        welcomeBack: 'Bem-vindo', continueSession: 'Continuar', newSession: 'Nova', openVault: 'Cofre', lastSession: 'Última', recentSessions: 'Recentes',
        typeMessage: 'Mensagem...', send: 'Enviar', voiceInput: 'Voz', stopRecording: 'Parar', loadingModel: 'Carregando...', downloading: 'Baixando',
        initializing: 'Iniciando...', ready: 'Pronto', settings: 'Configurações', language: 'Idioma', voiceEnabled: 'Voz', soundEnabled: 'Sons',
        showSuggestions: 'Sugestões', darkMode: 'Escuro', data: 'Dados', storageUsed: 'Armazenamento', totalSessions: 'Sessões', exportData: 'Exportar',
        clearData: 'Limpar', clearConfirm: 'Excluir tudo?', about: 'Sobre', version: 'Versão', builtBy: 'N1 Intelligence', vault: 'Cofre',
        searchVault: 'Buscar...', noSessions: 'Nenhuma', deleteSession: 'Excluir', offline: 'Offline — Cache', install: 'Instalar', close: 'Fechar',
        cancel: 'Cancelar', confirm: 'Confirmar', skipToMain: 'Conteúdo', menuOpen: 'Menu', menuClose: 'Fechar'
    },
    ru: {
        appTitle: 'Active MirrorOS', tagline: 'Суверенный ИИ в вашем браузере.', tagline2: 'Без облака. Без слежки. Ваш навсегда.',
        deviceScore: 'Оценка', recommendedFor: 'Рекомендуется', analyzing: 'Анализ...', useThis: 'Использовать', showAllModels: 'Все', hideModels: 'Меньше',
        ram: 'ОЗУ', cores: 'Ядер', gpu: 'GPU', noGpu: 'Нет GPU', quality: 'Качество', speed: 'Скорость', download: 'Скачать', recommended: 'Рекомендуется',
        welcomeBack: 'С возвращением', continueSession: 'Продолжить', newSession: 'Новая', openVault: 'Хранилище', lastSession: 'Последняя',
        recentSessions: 'Недавние', typeMessage: 'Сообщение...', send: 'Отправить', voiceInput: 'Голос', stopRecording: 'Стоп', loadingModel: 'Загрузка...',
        downloading: 'Загрузка', initializing: 'Инициализация...', ready: 'Готово', settings: 'Настройки', language: 'Язык', voiceEnabled: 'Голос',
        soundEnabled: 'Звуки', showSuggestions: 'Подсказки', darkMode: 'Тёмная', data: 'Данные', storageUsed: 'Хранилище', totalSessions: 'Сессий',
        exportData: 'Экспорт', clearData: 'Очистить', clearConfirm: 'Удалить всё?', about: 'О программе', version: 'Версия', builtBy: 'N1 Intelligence',
        vault: 'Хранилище', searchVault: 'Поиск...', noSessions: 'Нет', deleteSession: 'Удалить', offline: 'Офлайн — Кэш', install: 'Установить',
        close: 'Закрыть', cancel: 'Отмена', confirm: 'Подтвердить', skipToMain: 'К содержимому', menuOpen: 'Меню', menuClose: 'Закрыть'
    },
    he: {
        appTitle: 'Active MirrorOS', tagline: 'בינה מלאכותית ריבונית בדפדפן.', tagline2: 'ללא ענן. ללא מעקב. שלך לנצח.',
        deviceScore: 'ציון', recommendedFor: 'מומלץ', analyzing: 'מנתח...', useThis: 'השתמש', showAllModels: 'הכל', hideModels: 'פחות',
        ram: 'זיכרון', cores: 'ליבות', gpu: 'GPU', noGpu: 'אין', quality: 'איכות', speed: 'מהירות', download: 'הורד', recommended: 'מומלץ',
        welcomeBack: 'ברוך שובך', continueSession: 'המשך', newSession: 'חדש', openVault: 'כספת', lastSession: 'אחרונה', recentSessions: 'אחרונות',
        typeMessage: 'הודעה...', send: 'שלח', voiceInput: 'קול', stopRecording: 'עצור', loadingModel: 'טוען...', downloading: 'מוריד',
        initializing: 'מאתחל...', ready: 'מוכן', settings: 'הגדרות', language: 'שפה', voiceEnabled: 'קול', soundEnabled: 'צלילים',
        showSuggestions: 'הצעות', darkMode: 'כהה', data: 'נתונים', storageUsed: 'אחסון', totalSessions: 'שיחות', exportData: 'ייצוא',
        clearData: 'נקה', clearConfirm: 'למחוק הכל?', about: 'אודות', version: 'גרסה', builtBy: 'N1 Intelligence', vault: 'כספת',
        searchVault: 'חפש...', noSessions: 'אין', deleteSession: 'מחק', offline: 'לא מקוון — מאוחסן', install: 'התקן', close: 'סגור',
        cancel: 'בטל', confirm: 'אשר', skipToMain: 'לראשי', menuOpen: 'תפריט', menuClose: 'סגור'
    },
    fa: {
        appTitle: 'Active MirrorOS', tagline: 'هوش مصنوعی مستقل در مرورگر شما.', tagline2: 'بدون ابر. بدون ردیابی. برای همیشه مال شما.',
        deviceScore: 'امتیاز', recommendedFor: 'پیشنهادی', analyzing: 'تحلیل...', useThis: 'استفاده', showAllModels: 'همه', hideModels: 'کمتر',
        ram: 'رم', cores: 'هسته', gpu: 'GPU', noGpu: 'بدون', quality: 'کیفیت', speed: 'سرعت', download: 'دانلود', recommended: 'پیشنهادی',
        welcomeBack: 'خوش آمدید', continueSession: 'ادامه', newSession: 'جدید', openVault: 'صندوق', lastSession: 'آخرین', recentSessions: 'اخیر',
        typeMessage: 'پیام...', send: 'ارسال', voiceInput: 'صدا', stopRecording: 'توقف', loadingModel: 'بارگیری...', downloading: 'دانلود',
        initializing: 'راه‌اندازی...', ready: 'آماده', settings: 'تنظیمات', language: 'زبان', voiceEnabled: 'صدا', soundEnabled: 'صداها',
        showSuggestions: 'پیشنهادات', darkMode: 'تاریک', data: 'داده‌ها', storageUsed: 'فضا', totalSessions: 'جلسات', exportData: 'صادر',
        clearData: 'پاک', clearConfirm: 'حذف همه?', about: 'درباره', version: 'نسخه', builtBy: 'N1 Intelligence', vault: 'صندوق',
        searchVault: 'جستجو...', noSessions: 'هیچ', deleteSession: 'حذف', offline: 'آفلاین — ذخیره', install: 'نصب', close: 'بستن',
        cancel: 'لغو', confirm: 'تأیید', skipToMain: 'اصلی', menuOpen: 'منو', menuClose: 'بستن'
    },
    ur: {
        appTitle: 'Active MirrorOS', tagline: 'آپ کے براؤزر میں خود مختار AI', tagline2: 'کوئی کلاؤڈ نہیں۔ کوئی ٹریکنگ نہیں۔',
        deviceScore: 'سکور', recommendedFor: 'تجویز', analyzing: 'تجزیہ...', useThis: 'استعمال', showAllModels: 'سب', hideModels: 'کم',
        ram: 'ریم', cores: 'کور', gpu: 'GPU', noGpu: 'کوئی نہیں', quality: 'معیار', speed: 'رفتار', download: 'ڈاؤن لوڈ', recommended: 'تجویز',
        welcomeBack: 'خوش آمدید', continueSession: 'جاری', newSession: 'نیا', openVault: 'والٹ', lastSession: 'آخری', recentSessions: 'حالیہ',
        typeMessage: 'پیغام...', send: 'بھیجیں', voiceInput: 'آواز', stopRecording: 'رکیں', loadingModel: 'لوڈ...', downloading: 'ڈاؤن لوڈ',
        initializing: 'شروع...', ready: 'تیار', settings: 'ترتیبات', language: 'زبان', voiceEnabled: 'آواز', soundEnabled: 'آوازیں',
        showSuggestions: 'تجاویز', darkMode: 'ڈارک', data: 'ڈیٹا', storageUsed: 'اسٹوریج', totalSessions: 'سیشن', exportData: 'برآمد',
        clearData: 'صاف', clearConfirm: 'حذف?', about: 'بارے میں', version: 'ورژن', builtBy: 'N1 Intelligence', vault: 'والٹ',
        searchVault: 'تلاش...', noSessions: 'کوئی نہیں', deleteSession: 'حذف', offline: 'آف لائن — کیش', install: 'انسٹال', close: 'بند',
        cancel: 'منسوخ', confirm: 'تصدیق', skipToMain: 'مرکزی', menuOpen: 'مینو', menuClose: 'بند'
    }
};

// Fill remaining languages with English fallback
const fallbackLangs = ['bn', 'it', 'tr', 'vi', 'th', 'pl', 'nl', 'id', 'uk', 'ta', 'te', 'ms', 'sw', 'cs', 'mr'];
fallbackLangs.forEach(code => { if (!TRANSLATIONS[code]) TRANSLATIONS[code] = { ...TRANSLATIONS.en }; });

class I18n {
    constructor() { this.currentLang = 'en'; this.translations = TRANSLATIONS; this.listeners = []; }

    init() {
        const saved = localStorage.getItem('mirror-os-lang');
        if (saved && this.translations[saved]) { this.setLanguage(saved); return; }
        const browserLang = navigator.language?.split('-')[0] || 'en';
        this.setLanguage(this.translations[browserLang] ? browserLang : 'en');
    }

    setLanguage(code) {
        if (!this.translations[code]) code = 'en';
        this.currentLang = code;
        localStorage.setItem('mirror-os-lang', code);
        const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === code);
        document.documentElement.lang = code;
        document.documentElement.dir = langInfo?.rtl ? 'rtl' : 'ltr';
        document.body.classList.toggle('rtl', langInfo?.rtl || false);
        this.listeners.forEach(fn => fn(code));
        this.updateDOM();
    }

    t(key, fallback = '') { return this.translations[this.currentLang]?.[key] || this.translations.en?.[key] || fallback || key; }

    updateDOM() {
        document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = this.t(el.getAttribute('data-i18n')); });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = this.t(el.getAttribute('data-i18n-placeholder')); });
        document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', this.t(el.getAttribute('data-i18n-aria'))); });
    }

    onChange(callback) { this.listeners.push(callback); }
    getLangInfo(code = this.currentLang) { return SUPPORTED_LANGUAGES.find(l => l.code === code); }
    isRTL() { return this.getLangInfo()?.rtl || false; }
}

export const i18n = new I18n();
export { TRANSLATIONS };
