import { Language } from '../types';

export const translations = {
  ar: {
    dashboard: 'لوحة التحكم',
    home: 'الرئيسية',
    main_menu: 'القائمة الرئيسية',
    live: 'بث مباشر',
    movies: 'أفلام',
    series: 'مسلسلات',
    sports: 'رياضة',
    settings: 'الضبط',
    playlist: 'قائمة التشغيل',
    search: 'بحث',
    favorites: 'المفضلة',
    channels: 'القنوات',
    categories: 'المجموعات',
    no_channels: 'لا توجد قنوات',
    add_playlist: 'إضافة قائمة تشغيل',
    m3u_url: 'رابط M3U',
    xtream_codes: 'Xtream Codes',
    stalker_portal: 'Stalker Portal',
    host: 'المضيف / الرابط',
    username: 'اسم المستخدم',
    password: 'كلمة المرور',
    save: 'حفظ',
    cancel: 'إلغاء',
    language: 'اللغة',
    parental_control: 'مراقبة العائلة',
    time_format: 'تنسيق الوقت',
    external_player: 'مشغل خارجي',
    view_mode: 'طريقة العرض',
    list: 'قائمة',
    grid: 'شبكة',
    clear_history: 'مسح السجل',
    hide_categories: 'إخفاء المجموعات',
    show_categories: 'إظهار المجموعات',
    hide_live_categories: 'إخفاء مجموعات البث المباشر',
    hide_movie_categories: 'إخفاء مجموعات الأفلام',
    hide_series_categories: 'إخفاء مجموعات المسلسلات',
    manage_categories_title: 'إدارة وإخفاء المجموعات والباقات',
    hide_series_desc: 'إخفاء أو استرجاع باقات المسلسلات (سورية، مصرية، رمضان، تركية...)',
    hide_live_desc: 'إخفاء أو استرجاع قنوات المباشر (لبنان، فلسطين، ألمانيا، بي إن...)',
    hide_movies_desc: 'إخفاء أو استرجاع باقات الأفلام (مصرية، سورية، أمريكية...)',
    manage_groups: 'إدارة المجموعات',
    hidden_count: 'مجموعات مخفية',
    all_visible: 'الكل معروض',
    show_all: 'إظهار الكل',
    hide_all: 'إخفاء الكل',
    hidden: 'مخفي',
    visible: 'معروض',
    search_categories: 'بحث في المجموعات...',
    playlist_protection: 'حماية القائمة بكلمة مرور (الرقابة الأبوية)',
    enter_pin: 'أدخل رمز PIN',
    set_pin: 'تعيين رمز PIN (4 أرقام)',
    wrong_pin: 'رمز PIN غير صحيح',
    unlocked: 'تم إلغاء القفل',
    logout_confirm_title: 'تسجيل الخروج',
    logout_confirm_desc: 'هل أنت متأكد من رغبتك في تسجيل الخروج وإعادة ضبط البيانات؟',
    refresh_data: 'تحديث البيانات',
    data_refreshed: 'تم تحديث البيانات بنجاح',
    mac_address: 'عنوان MAC',
    portal_url: 'رابط البورتال (URL)',
    file_uploaded: 'تم رفع الملف بنجاح',
    enter_password: 'أدخل كلمة المرور',
    set_password: 'تعيين كلمة المرور',
    sorting: 'الترتيب',
    az: 'أ - ي',
    custom: 'مخصص',
    back: 'رجوع',
    close: 'إغلاق',
    none: 'لا شيء',
    upload: 'رفع ملف M3U',
    loading: 'جاري التحميل...',
    add_player: 'إضافة مشغل',
    player_name: 'اسم المشغل',
    select_player: 'اختر المشغل',
    audio_tracks: 'الصوت',
    subtitles: 'الترجمة',
    quality: 'الجودة',
    aspect_ratio: 'الأبعاد',
    speed: 'السرعة',
    sleep_timer: 'مؤقت النوم',
    episodes: 'الحلقات',
    resume_watching: 'استئناف المشاهدة',
    resume_prompt: 'هل ترغب في مواصلة العرض من الدقيقة',
    start_over: 'بدء من البداية',
    resume: 'متابعة من حيث توقفت',
    play_now: 'تشغيل الآن',
    next_episode: 'الحلقة التالية',
    prev_episode: 'الحلقة السابقة',
    auto_sleep: 'إيقاف تلقائي',
    off: 'إيقاف الترجمة',
    select_audio: 'اختر مسار الصوت',
    sub_settings: 'إعدادات ومسارات الترجمة',

    // New keys for Exit, Settings & Extraction
    exit_modal_title: 'تأكيد الخروج من التطبيق',
    exit_modal_desc: 'هل أنت متأكد من رغبتك في إغلاق مشغل عاشور والخروج الآن؟',
    exit_confirm_yes: 'نعم، خروج',
    exit_confirm_no: 'لا، البقاء',
    exit_app: 'خروج من التطبيق',
    dashboard_layouts: 'شكل واجهة التطبيق',
    dashboard_alignment: 'موضع الأيقونات على الشاشة',
    window_position: 'موضع النوافذ على الشاشة',
    icon_size: 'حجم الأيقونات العام',
    screen_zoom: 'تكبير وتصغير الشاشة',
    players_title: 'مشغلات الفيديو',
    royal_themes: 'تغيير ألوان الثيم',
    icons_3d: 'تغيير أشكال الأيقونات',
    app_backgrounds: 'خلفيات التطبيق',
    splash_intro: 'صوت ومظهر شاشة البداية',
    anti_block_vpn: 'VPN وتخطي الحجب',
    sync_playlist: 'مزامنة وتحديث البيانات',
    upload_m3u_file: 'رفع ملف قنوات M3U',
    device_key: 'رمز الجهاز',
    active_subscription: 'الاشتراك النشط',
    expires: 'ينتهي في',
    expired: 'منتهي الصلاحية',
    no_active_playlist: 'لا يوجد اشتراك نشط',
    settings_subtitle: 'تخصيص الواجهة، المشغلات، والتفضيلات',
    extraction_downloading: 'جاري تحميل البيانات...',
    extraction_parsing: 'جاري معالجة المحتوى...',
    extraction_categorizing: 'جاري تنظيم الفئات...',
    extraction_saving: 'جاري الحفظ في الجهاز...',
    extraction_verifying: 'جاري التحقق النهائي...',
    extraction_completed: 'تم استخراج وتفعيل البيانات بنجاح!',
    extraction_paused: 'تم إيقاف الاستخراج مؤقتاً',
    extraction_error: 'حدث خطأ أثناء تحميل البيانات',
    seek_step: 'مقدار التقديم والترجيع',
    start_now: 'ابدأ الآن',
    retry: 'إعادة المحاولة',
    enabled: 'مُمكّن',
    disabled: 'معطل',
    small: 'صغير',
    medium: 'متوسط',
    large: 'كبير',
    ai_scan: 'مسح بالذكاء الاصطناعي',
    ai_analyzing: 'جاري التحليل بالذكاء الاصطناعي...',
    ai_extracted: 'مستخرج بالذكاء الاصطناعي',
    ai_error: 'فشل تحليل الصورة بالذكاء الاصطناعي',
    ai_discovery: 'اكتشاف القنوات الذكي',
    active: 'نشط',
    expire_short: 'الانتهاء',
    per_link_lifetime: 'حسب الرابط (دائم)',
    day_short: 'يوم',
    watch_live: 'مشاهدة المباشر',
    watch_live_now: 'مشاهدة المباشر الآن',
    minimize_background: 'إكمال في الخلفية',
    pause: 'إيقاف مؤقت',
    resume_extraction: 'استئناف الاستخراج',
    details: 'التفاصيل',
    extraction_paused_at: 'استخراج القائمة متوقف عند',
    watch_history: 'سجل المشاهدة',
    watch_history_empty: 'سجل المشاهدة فارغ حالياً',
    continue_watching: 'متابعة المشاهدة',
    continue_watching_empty: 'لا توجد عناصر غير مكتملة لمتابعة مشاهدتها حالياً',
    auto_open_last_channel: 'فتح آخر قناة تلقائياً',
    auto_open_last_channel_desc: 'فتح التطبيق مباشرة على آخر قناة تمت مشاهدتها عند التشغيل',
    clear_movie_history: 'مسح سجل الأفلام',
    clear_series_history: 'مسح سجل المسلسلات',
    clear_channel_history: 'مسح سجل القنوات',
    clear_history_confirm_title: 'تأكيد مسح السجل',
    clear_movie_history_confirm: 'هل أنت متأكد من مسح سجل مشاهدة الأفلام فقط؟ لن يتم حذف أي أفلام من اشتراكك.',
    clear_series_history_confirm: 'هل أنت متأكد من مسح سجل مشاهدة المسلسلات فقط؟ لن يتم حذف أي مسلسلات من اشتراكك.',
    clear_channel_history_confirm: 'هل أنت متأكد من مسح سجل مشاهدة القنوات فقط؟ لن يتم حذف أي قنوات من اشتراكك.',
    confirm_clear: 'نعم، مسح السجل',
    history_cleared_success: 'تم مسح السجل بنجاح',
    sort_by: 'الترتيب حسب',
    sort_newest: 'الأحدث أولاً',
    sort_oldest: 'الأقدم أولاً',
    sort_alpha: 'أبجدي (A-Z)',
    sort_rating: 'الأعلى تقييماً',
    poster_size: 'حجم البوسترات',
    poster_titles: 'عناوين البوسترات',
    show: 'إظهار',
    hide: 'إخفاء',
    view_list_desc: 'قائمة منظمة مع الصور والمعلومات',
    view_grid_desc: 'شبكة بوسترات ديناميكية',
  },
  en: {
    dashboard: 'Dashboard',
    home: 'Home',
    main_menu: 'Main Menu',
    live: 'Live TV',
    movies: 'Movies',
    series: 'Series',
    sports: 'Sports',
    settings: 'Settings',
    playlist: 'Playlist',
    search: 'Search',
    favorites: 'Favorites',
    channels: 'Channels',
    categories: 'Categories',
    no_channels: 'No Channels Found',
    add_playlist: 'Add Playlist',
    m3u_url: 'M3U URL',
    xtream_codes: 'Xtream Codes',
    stalker_portal: 'Stalker Portal',
    host: 'Host / URL',
    username: 'Username',
    password: 'Password',
    save: 'Save',
    cancel: 'Cancel',
    language: 'Language',
    parental_control: 'Parental Control',
    time_format: 'Time Format',
    external_player: 'External Player',
    view_mode: 'View Mode',
    list: 'List',
    grid: 'Grid',
    clear_history: 'Clear History',
    hide_categories: 'Hide Categories',
    show_categories: 'Show Categories',
    hide_live_categories: 'Hide Live Groups',
    hide_movie_categories: 'Hide Movie Groups',
    hide_series_categories: 'Hide Series Groups',
    manage_categories_title: 'Manage & Hide Categories',
    hide_series_desc: 'Hide or restore Series packages (Syrian, Egyptian, Ramadan, Turkish...)',
    hide_live_desc: 'Hide or restore Live TV packages (Lebanon, Palestine, Germany, Sports...)',
    hide_movies_desc: 'Hide or restore Movie packages (Egyptian, Syrian, Action...)',
    manage_groups: 'Manage Groups',
    hidden_count: 'hidden groups',
    all_visible: 'All visible',
    show_all: 'Show All',
    hide_all: 'Hide All',
    hidden: 'Hidden',
    visible: 'Visible',
    search_categories: 'Search categories...',
    playlist_protection: 'Password-Protect Playlist (Parental Control)',
    enter_pin: 'Enter PIN',
    set_pin: 'Set PIN (4 digits)',
    wrong_pin: 'Incorrect PIN',
    unlocked: 'Unlocked',
    logout_confirm_title: 'Logout',
    logout_confirm_desc: 'Are you sure you want to log out and reset data?',
    refresh_data: 'Refresh Data',
    data_refreshed: 'Data refreshed successfully',
    mac_address: 'MAC Address',
    portal_url: 'Portal URL',
    file_uploaded: 'File uploaded successfully',
    enter_password: 'Enter Password',
    set_password: 'Set Password',
    sorting: 'Sorting',
    az: 'A - Z',
    custom: 'Custom',
    back: 'Back',
    close: 'Close',
    none: 'None',
    upload: 'Upload M3U File',
    loading: 'Loading...',
    add_player: 'Add Player',
    player_name: 'Player Name',
    select_player: 'Select Player',
    audio_tracks: 'Audio',
    subtitles: 'Subtitles',
    quality: 'Quality',
    aspect_ratio: 'Aspect Ratio',
    speed: 'Speed',
    sleep_timer: 'Sleep Timer',
    episodes: 'Episodes',
    resume_watching: 'Resume Watching',
    resume_prompt: 'Would you like to resume watching from minute',
    start_over: 'Start from Beginning',
    resume: 'Resume Watching',
    play_now: 'Play Now',
    next_episode: 'Next Episode',
    prev_episode: 'Previous Episode',
    auto_sleep: 'Auto Sleep',
    off: 'Subtitles Off',
    select_audio: 'Select Audio Track',
    sub_settings: 'Subtitle Settings & Tracks',

    // New keys for Exit, Settings & Extraction
    exit_modal_title: 'Exit Achour Player',
    exit_modal_desc: 'Are you sure you want to close the app and exit now?',
    exit_confirm_yes: 'Yes, Exit',
    exit_confirm_no: 'No, Stay',
    exit_app: 'Exit Application',
    dashboard_layouts: 'App UI Layout Style',
    dashboard_alignment: 'Icons Screen Position',
    window_position: 'Windows Screen Position',
    icon_size: 'Global Icon Size',
    screen_zoom: 'Screen Zoom & TV Scale',
    players_title: 'Media Players',
    royal_themes: 'Theme Color Changer',
    icons_3d: 'Icon Style Changer',
    app_backgrounds: 'App Backgrounds',
    splash_intro: 'Splash Intro & Music',
    anti_block_vpn: 'Anti-Block Smart VPN',
    sync_playlist: 'Sync & Refresh Data',
    upload_m3u_file: 'Upload M3U Channel File',
    device_key: 'Device Key',
    active_subscription: 'Active Subscription',
    expires: 'Expires',
    expired: 'Expired',
    no_active_playlist: 'No active subscription',
    settings_subtitle: 'Customize UI, players, and preferences',
    extraction_downloading: 'Downloading playlist data...',
    extraction_parsing: 'Parsing and extracting content...',
    extraction_categorizing: 'Organizing categories...',
    extraction_saving: 'Saving data to local storage...',
    extraction_verifying: 'Final verification...',
    extraction_completed: 'Data extracted and activated successfully!',
    extraction_paused: 'Extraction paused',
    extraction_error: 'Error occurred during data extraction',
    seek_step: 'Seek Forward / Rewind Step',
    start_now: 'Start Now',
    retry: 'Retry',
    enabled: 'Enabled',
    disabled: 'Disabled',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    ai_scan: 'AI Scan',
    ai_analyzing: 'AI Analyzing...',
    ai_extracted: 'AI Extracted',
    ai_error: 'AI Analysis failed',
    ai_discovery: 'AI Channel Discovery',
    active: 'Active',
    expire_short: 'Expire',
    per_link_lifetime: 'Per Link (Lifetime)',
    day_short: 'd',
    watch_live: 'Watch Live',
    watch_live_now: 'Watch Live TV Now',
    minimize_background: 'Background',
    pause: 'Pause',
    resume_extraction: 'Resume',
    details: 'Details',
    extraction_paused_at: 'Playlist extraction paused at',
    watch_history: 'Watch History',
    watch_history_empty: 'Watch history is currently empty',
    continue_watching: 'Continue Watching',
    continue_watching_empty: 'No unfinished titles to continue watching right now',
    auto_open_last_channel: 'Auto-Open Last Channel',
    auto_open_last_channel_desc: 'Automatically open the last watched live channel on startup',
    clear_movie_history: 'Clear Movie History',
    clear_series_history: 'Clear Series History',
    clear_channel_history: 'Clear Channel History',
    clear_history_confirm_title: 'Confirm Clear History',
    clear_movie_history_confirm: 'Clear your Movie Watch History only? Your playlist movies will remain untouched.',
    clear_series_history_confirm: 'Clear your Series Watch History only? Your playlist series will remain untouched.',
    clear_channel_history_confirm: 'Clear your Channel Watch History only? Your playlist channels will remain untouched.',
    confirm_clear: 'Yes, Clear',
    history_cleared_success: 'History cleared successfully',
    sort_by: 'Sort By',
    sort_newest: 'Newest First',
    sort_oldest: 'Oldest First',
    sort_alpha: 'Alphabetical (A-Z)',
    sort_rating: 'Highest Rating',
    poster_size: 'Poster Size',
    poster_titles: 'Poster Titles',
    show: 'Show',
    hide: 'Hide',
    view_list_desc: 'Organized list with images & info',
    view_grid_desc: 'Poster grid display',
  },
  de: {
    dashboard: 'Dashboard',
    home: 'Startseite',
    main_menu: 'Hauptmenü',
    live: 'Live-TV',
    movies: 'Filme',
    series: 'Serien',
    sports: 'Sport',
    settings: 'Einstellungen',
    playlist: 'Wiedergabeliste',
    search: 'Suche',
    favorites: 'Favoriten',
    channels: 'Kanäle',
    categories: 'Kategorien',
    no_channels: 'Keine Kanäle gefunden',
    add_playlist: 'Wiedergabeliste hinzufügen',
    m3u_url: 'M3U URL',
    xtream_codes: 'Xtream-Codes',
    stalker_portal: 'Stalker Portal',
    host: 'Host / URL',
    username: 'Benutzername',
    password: 'Passwort',
    save: 'Speichern',
    cancel: 'Abbrechen',
    language: 'Sprache',
    parental_control: 'Kindersicherung',
    time_format: 'Zeitformat',
    external_player: 'Externer Player',
    view_mode: 'Ansichtsmodus',
    list: 'Liste',
    grid: 'Raster',
    clear_history: 'Verlauf löschen',
    hide_categories: 'Kategorien ausblenden',
    show_categories: 'Kategorien einblenden',
    hide_live_categories: 'Live-Gruppen ausblenden',
    hide_movie_categories: 'Film-Gruppen ausblenden',
    hide_series_categories: 'Serien-Gruppen ausblenden',
    manage_categories_title: 'Kategorien verwalten & ausblenden',
    hide_series_desc: 'Serienpakete ausblenden oder wiederherstellen (Syrisch, Ägyptisch, Ramadan, Türkisch...)',
    hide_live_desc: 'Live-TV-Pakete ausblenden oder wiederherstellen',
    hide_movies_desc: 'Filmpakete ausblenden oder wiederherstellen',
    manage_groups: 'Gruppen verwalten',
    hidden_count: 'ausgeblendete Gruppen',
    all_visible: 'Alle sichtbar',
    show_all: 'Alle anzeigen',
    hide_all: 'Alle ausblenden',
    hidden: 'Ausgeblendet',
    visible: 'Sichtbar',
    search_categories: 'Kategorien suchen...',
    playlist_protection: 'Mit Passwort schützen (Kindersicherung)',
    enter_pin: 'PIN eingeben',
    set_pin: 'PIN festlegen (4 Ziffern)',
    wrong_pin: 'Falsche PIN',
    unlocked: 'Entsperrt',
    logout_confirm_title: 'Abmelden',
    logout_confirm_desc: 'Möchten Sie sich wirklich abmelden?',
    refresh_data: 'Daten aktualisieren',
    data_refreshed: 'Daten erfolgreich aktualisiert',
    mac_address: 'MAC-Adresse',
    portal_url: 'Portal-URL',
    file_uploaded: 'Datei erfolgreich hochgeladen',
    enter_password: 'Passwort eingeben',
    set_password: 'Passwort festlegen',
    sorting: 'Sortierung',
    az: 'A - Z',
    custom: 'Benutzerdefiniert',
    back: 'Zurück',
    close: 'Schließen',
    none: 'Keine',
    upload: 'M3U-Datei hochladen',
    loading: 'Laden...',
    add_player: 'Player hinzufügen',
    player_name: 'Player-Name',
    select_player: 'Player auswählen',
    audio_tracks: 'Audio',
    subtitles: 'Untertitel',
    quality: 'Qualität',
    aspect_ratio: 'Seitenverhältnis',
    speed: 'Geschwindigkeit',
    sleep_timer: 'Sleeptimer',
    episodes: 'Episoden',
    resume_watching: 'Fortsetzen',
    resume_prompt: 'Möchten Sie die Wiedergabe fortsetzen ab',
    start_over: 'Von vorne beginnen',
    resume: 'Fortsetzen',
    play_now: 'Jetzt abspielen',
    next_episode: 'Nächste Episode',
    prev_episode: 'Vorherige Episode',
    auto_sleep: 'Automatischer Ruhezustand',
    off: 'Untertitel aus',
    select_audio: 'Audiospur wählen',
    sub_settings: 'Untertitel-Einstellungen',

    // New keys for Exit, Settings & Extraction
    exit_modal_title: 'Achour Player beenden',
    exit_modal_desc: 'Möchten Sie die Anwendung wirklich schließen und jetzt beenden?',
    exit_confirm_yes: 'Ja, Beenden',
    exit_confirm_no: 'Nein, Bleiben',
    exit_app: 'Anwendung beenden',
    dashboard_layouts: 'App-Oberflächenlayout',
    dashboard_alignment: 'Symbolposition auf dem Bildschirm',
    window_position: 'Fensterposition auf dem Bildschirm',
    icon_size: 'Globale Symbolgröße',
    screen_zoom: 'Bildschirmzoom & TV-Skalierung',
    players_title: 'Mediaplayer',
    royal_themes: 'Farbthema ändern',
    icons_3d: 'Symbolstil ändern',
    app_backgrounds: 'App-Hintergründe',
    splash_intro: 'Startbildschirm & Musik',
    anti_block_vpn: 'Anti-Block Smart VPN',
    sync_playlist: 'Daten synchronisieren',
    upload_m3u_file: 'M3U-Kanaldatei hochladen',
    device_key: 'Geräteschlüssel',
    active_subscription: 'Aktives Abonnement',
    expires: 'Läuft ab am',
    expired: 'Abgelaufen',
    no_active_playlist: 'Kein aktives Abonnement',
    settings_subtitle: 'Benutzeroberfläche und Optionen anpassen',
    extraction_downloading: 'Daten werden heruntergeladen...',
    extraction_parsing: 'Inhalte werden verarbeitet...',
    extraction_categorizing: 'Kategorien werden organisiert...',
    extraction_saving: 'Daten werden lokal gespeichert...',
    extraction_verifying: 'Endgültige Überprüfung...',
    extraction_completed: 'Daten erfolgreich geladen und aktiviert!',
    extraction_paused: 'Extraktion pausiert',
    extraction_error: 'Fehler beim Laden der Daten',
    seek_step: 'Vor-/Zurückspul-Schritt',
    start_now: 'Jetzt starten',
    retry: 'Erneut versuchen',
    enabled: 'Aktiviert',
    disabled: 'Deaktiviert',
    small: 'Klein',
    medium: 'Mittel',
    large: 'Groß',
    ai_scan: 'KI-Scan',
    ai_analyzing: 'KI analysiert...',
    ai_extracted: 'KI extrahiert',
    ai_error: 'KI-Analyse fehlgeschlagen',
    ai_discovery: 'KI-Senderentdeckung',
    active: 'Aktiv',
    expire_short: 'Ablauf',
    per_link_lifetime: 'Per Link (Unbegrenzt)',
    day_short: 'T',
    watch_live: 'Live ansehen',
    watch_live_now: 'Live-TV jetzt ansehen',
    minimize_background: 'Im Hintergrund',
    pause: 'Pause',
    resume_extraction: 'Fortsetzen',
    details: 'Details',
    extraction_paused_at: 'Extraktion pausiert bei',
    watch_history: 'Wiedergabeverlauf',
    watch_history_empty: 'Der Wiedergabeverlauf ist derzeit leer',
    continue_watching: 'Weiterschauen',
    continue_watching_empty: 'Derzeit keine unvollständigen Titel zum Weiterschauen',
    auto_open_last_channel: 'Letzten Kanal auto-öffnen',
    auto_open_last_channel_desc: 'Beim App-Start automatisch den zuletzt gesehenen Sender öffnen',
    clear_movie_history: 'Filmverlauf löschen',
    clear_series_history: 'Serienverlauf löschen',
    clear_channel_history: 'Senderverlauf löschen',
    clear_history_confirm_title: 'Verlauf löschen bestätigen',
    clear_movie_history_confirm: 'Nur den Film-Wiedergabeverlauf löschen? Ihre Playlist bleibt vollständig erhalten.',
    clear_series_history_confirm: 'Nur den Serien-Wiedergabeverlauf löschen? Ihre Playlist bleibt vollständig erhalten.',
    clear_channel_history_confirm: 'Nur den Sender-Wiedergabeverlauf löschen? Ihre Playlist bleibt vollständig erhalten.',
    confirm_clear: 'Ja, löschen',
    history_cleared_success: 'Verlauf erfolgreich gelöscht',
    sort_by: 'Sortieren nach',
    sort_newest: 'Neueste zuerst',
    sort_oldest: 'Älteste zuerst',
    sort_alpha: 'Alphabetisch (A-Z)',
    sort_rating: 'Beste Bewertung',
    poster_size: 'Postergröße',
    poster_titles: 'Postertitel',
    show: 'Anzeigen',
    hide: 'Ausblenden',
    view_list_desc: 'Strukturierte Liste mit Bildern & Infos',
    view_grid_desc: 'Poster-Rasteransicht',
  },
  fr: {
    dashboard: 'Tableau de bord',
    home: 'Accueil',
    main_menu: 'Menu principal',
    live: 'Direct',
    movies: 'Films',
    series: 'Séries',
    sports: 'Sports',
    settings: 'Paramètres',
    playlist: 'Liste de lecture',
    search: 'Recherche',
    favorites: 'Favoris',
    channels: 'Chaînes',
    categories: 'Catégories',
    no_channels: 'Aucune chaîne trouvée',
    add_playlist: 'Ajouter une playlist',
    m3u_url: 'URL M3U',
    xtream_codes: 'Xtream Codes',
    stalker_portal: 'Stalker Portal',
    host: 'Hôte / URL',
    username: "Nom d'utilisateur",
    password: 'Mot de passe',
    save: 'Enregistrer',
    cancel: 'Annuler',
    language: 'Langue',
    parental_control: 'Contrôle parental',
    time_format: "Format de l'heure",
    external_player: 'Lecteur externe',
    view_mode: "Mode d'affichage",
    list: 'Liste',
    grid: 'Grille',
    clear_history: "Effacer l'historique",
    hide_categories: 'Masquer les catégories',
    show_categories: 'Afficher les catégories',
    hide_live_categories: 'Masquer les groupes en direct',
    hide_movie_categories: 'Masquer les groupes de films',
    hide_series_categories: 'Masquer les groupes de séries',
    manage_categories_title: 'Gérer et masquer les catégories',
    hide_series_desc: 'Masquer ou restaurer les séries (syriennes, égyptiennes, turques...)',
    hide_live_desc: 'Masquer ou restaurer les chaînes en direct',
    hide_movies_desc: 'Masquer ou restaurer les films',
    manage_groups: 'Gérer les groupes',
    hidden_count: 'groupes masqués',
    all_visible: 'Tous visibles',
    show_all: 'Tout afficher',
    hide_all: 'Tout masquer',
    hidden: 'Masqué',
    visible: 'Visible',
    search_categories: 'Rechercher des catégories...',
    playlist_protection: 'Protéger par mot de passe (Contrôle parental)',
    enter_pin: 'Entrer le code PIN',
    set_pin: 'Définir le code PIN (4 chiffres)',
    wrong_pin: 'Code PIN incorrect',
    unlocked: 'Déverrouillé',
    logout_confirm_title: 'Déconnexion',
    logout_confirm_desc: 'Voulez-vous vraiment vous déconnecter ?',
    refresh_data: 'Actualiser les données',
    data_refreshed: 'Données actualisées avec succès',
    mac_address: 'Adresse MAC',
    portal_url: 'URL du portail',
    file_uploaded: 'Fichier téléchargé avec succès',
    enter_password: 'Entrez le mot de passe',
    set_password: 'Définir le mot de passe',
    sorting: 'Tri',
    az: 'A - Z',
    custom: 'Personnalisé',
    back: 'Retour',
    close: 'Fermer',
    none: 'Aucun',
    upload: 'Télécharger un fichier M3U',
    loading: 'Chargement...',
    add_player: 'Ajouter un lecteur',
    player_name: 'Nom du lecteur',
    select_player: 'Sélectionner le lecteur',
    audio_tracks: 'Audio',
    subtitles: 'Sous-titres',
    quality: 'Qualité',
    aspect_ratio: 'Format d\'image',
    speed: 'Vitesse',
    sleep_timer: 'Minuterie',
    episodes: 'Épisodes',
    resume_watching: 'Reprendre la lecture',
    resume_prompt: 'Voulez-vous reprendre la lecture à partir de',
    start_over: 'Recommencer',
    resume: 'Reprendre',
    play_now: 'Lire maintenant',
    next_episode: 'Épisode suivant',
    prev_episode: 'Épisode précédent',
    auto_sleep: 'Mise en veille auto',
    off: 'Sous-titres désactivés',
    select_audio: 'Sélectionner la piste audio',
    sub_settings: 'Paramètres des sous-titres',

    // New keys for Exit, Settings & Extraction
    exit_modal_title: 'Quitter Achour Player',
    exit_modal_desc: 'Êtes-vous sûr de vouloir fermer l\'application et quitter maintenant ?',
    exit_confirm_yes: 'Oui, Quitter',
    exit_confirm_no: 'Non, Rester',
    exit_app: 'Quitter l\'application',
    dashboard_layouts: 'Style et disposition de l\'interface',
    dashboard_alignment: 'Position des icônes à l\'écran',
    window_position: 'Position des fenêtres à l\'écran',
    icon_size: 'Taille globale des icônes',
    screen_zoom: 'Zoom écran & TV',
    players_title: 'Lecteurs multimédias',
    royal_themes: 'Changer le thème de couleurs',
    icons_3d: 'Changer le style des icônes',
    app_backgrounds: 'Arrière-plans de l\'application',
    splash_intro: 'Écran d\'accueil et musique',
    anti_block_vpn: 'VPN intelligent anti-blocage',
    sync_playlist: 'Synchroniser et actualiser',
    upload_m3u_file: 'Téléverser un fichier M3U',
    device_key: 'Clé de l\'appareil',
    active_subscription: 'Abonnement actif',
    expires: 'Expire le',
    expired: 'Expiré',
    no_active_playlist: 'Aucun abonnement actif',
    settings_subtitle: 'Personnaliser l\'interface et les préférences',
    extraction_downloading: 'Téléchargement des données...',
    extraction_parsing: 'Traitement du contenu...',
    extraction_categorizing: 'Organisation des catégories...',
    extraction_saving: 'Enregistrement en local...',
    extraction_verifying: 'Vérification finale...',
    extraction_completed: 'Données extraites et activées avec succès !',
    extraction_paused: 'Extraction en pause',
    extraction_error: 'Erreur lors du chargement des données',
    seek_step: 'Pas d\'avance / retour rapide',
    start_now: 'Démarrer',
    retry: 'Réessayer',
    enabled: 'Activé',
    disabled: 'Désactivé',
    small: 'Petit',
    medium: 'Moyen',
    large: 'Grand',
    ai_scan: 'Scan IA',
    ai_analyzing: 'Analyse IA...',
    ai_extracted: 'Extrait par IA',
    ai_error: 'Échec de l\'analyse IA',
    ai_discovery: 'Découverte de chaînes IA',
    active: 'Actif',
    expire_short: 'Expire',
    per_link_lifetime: 'Selon le lien (À vie)',
    day_short: 'j',
    watch_live: 'Regarder en direct',
    watch_live_now: 'Regarder la TV en direct',
    minimize_background: 'Arrière-plan',
    pause: 'Pause',
    resume_extraction: 'Reprendre',
    details: 'Détails',
    extraction_paused_at: 'Extraction en pause à',
    watch_history: 'Historique de lecture',
    watch_history_empty: 'L\'historique de lecture est vide',
    continue_watching: 'Reprendre la lecture',
    continue_watching_empty: 'Aucun titre en cours à reprendre pour le moment',
    auto_open_last_channel: 'Ouvrir dernière chaîne',
    auto_open_last_channel_desc: 'Ouvrir automatiquement la dernière chaîne regardée au démarrage',
    clear_movie_history: 'Effacer historique films',
    clear_series_history: 'Effacer historique séries',
    clear_channel_history: 'Effacer historique chaînes',
    clear_history_confirm_title: 'Confirmer la suppression',
    clear_movie_history_confirm: 'Effacer uniquement l\'historique des films ? Votre playlist restera intacte.',
    clear_series_history_confirm: 'Effacer uniquement l\'historique des séries ? Votre playlist restera intacte.',
    clear_channel_history_confirm: 'Effacer uniquement l\'historique des chaînes ? Votre playlist restera intacte.',
    confirm_clear: 'Oui, effacer',
    history_cleared_success: 'Historique effacé avec succès',
    sort_by: 'Trier par',
    sort_newest: 'Plus récents d\'abord',
    sort_oldest: 'Plus anciens d\'abord',
    sort_alpha: 'Alphabétique (A-Z)',
    sort_rating: 'Mieux notés',
    poster_size: 'Taille des affiches',
    poster_titles: 'Titres des affiches',
    show: 'Afficher',
    hide: 'Masquer',
    view_list_desc: 'Liste organisée avec images et infos',
    view_grid_desc: 'Affichage en grille d\'affiches',
  },
};

const EXTRACTION_TYPE_LABELS: Record<Language, Record<'live' | 'movie' | 'series', string>> = {
  ar: {
    live: 'القنوات المباشرة',
    movie: 'الأفلام',
    series: 'المسلسلات',
  },
  en: {
    live: 'Live TV',
    movie: 'Movies',
    series: 'Series',
  },
  de: {
    live: 'Live-TV',
    movie: 'Filme',
    series: 'Serien',
  },
  fr: {
    live: 'TV en direct',
    movie: 'Films',
    series: 'Séries',
  },
};

function mapArabicCategoryLabel(rawLabel: string, lang: Language): string {
  const labels = EXTRACTION_TYPE_LABELS[lang] || EXTRACTION_TYPE_LABELS.en;
  const trimmed = rawLabel.trim();
  if (trimmed === 'القنوات المباشرة') return labels.live;
  if (trimmed === 'الأفلام') return labels.movie;
  if (trimmed === 'المسلسلات') return labels.series;
  return trimmed;
}

export function formatExtractionProgressMessage(
  message: string | undefined,
  lang: Language,
  stage?: string
): string {
  const dict = translations[lang] || translations.en;
  const raw = (message || '').trim();

  if (!raw) {
    switch (stage) {
      case 'downloading': return dict.extraction_downloading;
      case 'parsing': return dict.extraction_parsing;
      case 'categorizing': return dict.extraction_categorizing;
      case 'saving': return dict.extraction_saving;
      case 'verifying': return dict.extraction_verifying;
      case 'completed': return dict.extraction_completed;
      case 'paused': return dict.extraction_paused;
      case 'error': return dict.extraction_error;
      default: return dict.loading;
    }
  }

  // Exact static messages emitted by worker / service / UI
  if (raw === 'جاري الاتصال بالسيرفر...' || raw === 'Connecting to server...') {
    if (lang === 'ar') return 'جاري الاتصال بالسيرفر...';
    if (lang === 'fr') return 'Connexion au serveur...';
    if (lang === 'de') return 'Verbindung zum Server wird hergestellt...';
    return 'Connecting to server...';
  }

  if (raw === 'جاري تجهيز القائمة...' || raw === 'Preparing playlist...') {
    if (lang === 'ar') return 'جاري تجهيز القائمة...';
    if (lang === 'fr') return 'Préparation de la playlist...';
    if (lang === 'de') return 'Wiedergabeliste wird vorbereitet...';
    return 'Preparing playlist...';
  }

  if (lang === 'ar') {
    return raw;
  }

  // Static Arabic progress messages -> active language
  if (raw === 'جاري استئناف الاستخراج...') {
    if (lang === 'fr') return 'Reprise de l\'extraction...';
    if (lang === 'de') return 'Extraktion wird fortgesetzt...';
    return 'Resuming extraction...';
  }

  if (raw === 'جاري تحميل جميع الأقسام بشكل متوازٍ...' || raw === 'جاري تجهيز جميع الأقسام...' || raw === 'جاري تجهيز الأقسام وبدء استخراج القنوات...') {
    if (lang === 'fr') return 'Chargement de toutes les catégories...';
    if (lang === 'de') return 'Alle Kategorien werden geladen...';
    return 'Loading all categories...';
  }

  if (raw === 'تم تجهيز الأقسام، جاري استخراج القنوات المباشرة أولاً...') {
    if (lang === 'fr') return 'Catégories prêtes, extraction de la TV en direct d\'abord...';
    if (lang === 'de') return 'Kategorien bereit, Live-TV wird zuerst geladen...';
    return 'Categories ready, extracting Live TV first...';
  }

  if (raw === 'جاري تحميل ومعالجة قائمة M3U...') {
    if (lang === 'fr') return 'Téléchargement et analyse de la liste M3U...';
    if (lang === 'de') return 'M3U-Wiedergabeliste wird geladen und verarbeitet...';
    return 'Downloading and parsing M3U playlist...';
  }

  if (raw === 'جاري فتح تدفق البيانات...') {
    if (lang === 'fr') return 'Ouverture du flux de données...';
    if (lang === 'de') return 'Datenstream wird geöffnet...';
    return 'Opening data stream...';
  }

  if (raw === 'تم استخراج القائمة بالكامل' || raw === 'تم استخراج القائمة بنجاح') {
    return dict.extraction_completed;
  }

  if (raw === 'تم التحميل من الذاكرة المحلية') {
    if (lang === 'fr') return 'Chargé depuis le cache local';
    if (lang === 'de') return 'Aus lokalem Speicher geladen';
    return 'Loaded from local cache';
  }

  if (raw === 'تم تجهيز البوابة') {
    if (lang === 'fr') return 'Portail prêt';
    if (lang === 'de') return 'Portal bereit';
    return 'Portal ready';
  }

  if (raw === 'تم إيقاف الاستخراج مؤقتاً (يمكن المشاهدة أو الاستئناف)') {
    if (lang === 'fr') return 'Extraction en pause (vous pouvez regarder ou reprendre)';
    if (lang === 'de') return 'Extraktion pausiert (Ansehen oder Fortsetzen möglich)';
    return 'Extraction paused (you can watch or resume)';
  }

  if (raw === 'تم إيقاف الاستخراج مؤقتاً') {
    return dict.extraction_paused;
  }

  // Dynamic Arabic progress patterns -> active language
  let m: RegExpMatchArray | null;

  // 1. "<label>: <N> عنصر"
  m = raw.match(/^(القنوات المباشرة|الأفلام|المسلسلات):\s*([\d,.\u0660-\u0669]+)\s*عنصر$/);
  if (m) {
    const label = mapArabicCategoryLabel(m[1], lang);
    const count = m[2];
    if (lang === 'fr') return `${label} : ${count} éléments`;
    if (lang === 'de') return `${label}: ${count} Elemente`;
    return `${label}: ${count} items`;
  }

  // 2. "جاري تحميل <label>..."
  m = raw.match(/^جاري تحميل\s+(القنوات المباشرة|الأفلام|المسلسلات)\.{3}$/);
  if (m) {
    const label = mapArabicCategoryLabel(m[1], lang);
    if (lang === 'fr') return `Chargement : ${label}...`;
    if (lang === 'de') return `${label} werden geladen...`;
    return `Loading ${label}...`;
  }

  // 3. "استكمال <label> من العنصر <N>..."
  m = raw.match(/^استكمال\s+(القنوات المباشرة|الأفلام|المسلسلات)\s+من العنصر\s+([\d,.\u0660-\u0669]+)\.{3}$/);
  if (m) {
    const label = mapArabicCategoryLabel(m[1], lang);
    const count = m[2];
    if (lang === 'fr') return `Reprise ${label} depuis l'élément ${count}...`;
    if (lang === 'de') return `${label} fortsetzen ab Element ${count}...`;
    return `Resuming ${label} from item ${count}...`;
  }

  // 4. "حفظ <label>: <N>"
  m = raw.match(/^حفظ\s+(القنوات المباشرة|الأفلام|المسلسلات):\s*([\d,.\u0660-\u0669]+)$/);
  if (m) {
    const label = mapArabicCategoryLabel(m[1], lang);
    const count = m[2];
    if (lang === 'fr') return `Enregistrement ${label} : ${count}`;
    if (lang === 'de') return `Speichern ${label}: ${count}`;
    return `Saving ${label}: ${count}`;
  }

  // 5. "حفظ <label> (<cur> / <total>)"
  m = raw.match(/^حفظ\s+(القنوات المباشرة|الأفلام|المسلسلات)\s*\(([\d,.\u0660-\u0669]+)\s*\/\s*([\d,.\u0660-\u0669]+)\)$/);
  if (m) {
    const label = mapArabicCategoryLabel(m[1], lang);
    if (lang === 'fr') return `Enregistrement ${label} (${m[2]} / ${m[3]})`;
    if (lang === 'de') return `Speichern ${label} (${m[2]} / ${m[3]})`;
    return `Saving ${label} (${m[2]} / ${m[3]})`;
  }

  // 6. "تم حفظ <N> من <label>..."
  m = raw.match(/^تم حفظ\s+([\d,.\u0660-\u0669]+)\s+من\s+(القنوات المباشرة|الأفلام|المسلسلات)\.{3}$/);
  if (m) {
    const label = mapArabicCategoryLabel(m[2], lang);
    if (lang === 'fr') return `${m[1]} enregistrés (${label})...`;
    if (lang === 'de') return `${m[1]} von ${label} gespeichert...`;
    return `Saved ${m[1]} of ${label}...`;
  }

  // 7. "تم حفظ <label> (<N>)"
  m = raw.match(/^تم حفظ\s+(القنوات المباشرة|الأفلام|المسلسلات)\s*\(([\d,.\u0660-\u0669]+)\)$/);
  if (m) {
    const label = mapArabicCategoryLabel(m[1], lang);
    if (lang === 'fr') return `${label} enregistrés (${m[2]})`;
    if (lang === 'de') return `${label} gespeichert (${m[2]})`;
    return `Saved ${label} (${m[2]})`;
  }

  // 8. "القنوات المباشرة جاهزة للمشاهدة (<N>)" / "القنوات المباشرة جاهزة (<N>)"
  m = raw.match(/^القنوات المباشرة جاهزة(?:\s+للمشاهدة)?\s*\(([\d,.\u0660-\u0669]+)\)$/);
  if (m) {
    const count = m[1];
    if (lang === 'fr') return `TV en direct prête à regarder (${count})`;
    if (lang === 'de') return `Live-TV bereit zum Ansehen (${count})`;
    return `Live TV ready to watch (${count})`;
  }

  // 9. "تم حفظ <N> عنصر..."
  m = raw.match(/^تم حفظ\s+([\d,.\u0660-\u0669]+)\s+عنصر\.{3}$/);
  if (m) {
    if (lang === 'fr') return `${m[1]} éléments enregistrés...`;
    if (lang === 'de') return `${m[1]} Elemente gespeichert...`;
    return `Saved ${m[1]} items...`;
  }

  // 10. "جاري الحفظ التدريجي (<N>)..." / "جاري الحفظ (<N>)..."
  m = raw.match(/^جاري الحفظ(?:\s+التدريجي)?\s*\(([\d,.\u0660-\u0669]+)\)\.{3}$/);
  if (m) {
    if (lang === 'fr') return `Enregistrement en cours (${m[1]})...`;
    if (lang === 'de') return `Wird gespeichert (${m[1]})...`;
    return `Saving progress (${m[1]})...`;
  }

  // 11. "فشل الاستخراج: <err>"
  m = raw.match(/^فشل الاستخراج:\s*(.+)$/);
  if (m) {
    const errText = m[1] === 'خطأ غير معروف'
      ? (lang === 'fr' ? 'Erreur inconnue' : lang === 'de' ? 'Unbekannter Fehler' : 'Unknown error')
      : m[1];
    if (lang === 'fr') return `Échec de l'extraction : ${errText}`;
    if (lang === 'de') return `Extraktion fehlgeschlagen: ${errText}`;
    return `Extraction failed: ${errText}`;
  }

  // If raw still contains Arabic characters (fallback guard for non-Arabic UI)
  if (/[\u0600-\u06FF]/.test(raw)) {
    switch (stage) {
      case 'downloading': return dict.extraction_downloading;
      case 'parsing': return dict.extraction_parsing;
      case 'categorizing': return dict.extraction_categorizing;
      case 'saving': return dict.extraction_saving;
      case 'verifying': return dict.extraction_verifying;
      case 'completed': return dict.extraction_completed;
      case 'paused': return dict.extraction_paused;
      case 'error': return dict.extraction_error;
      default: return dict.loading;
    }
  }

  return raw;
}

export const useI18n = (lang: Language) => {
  const t = (key: keyof typeof translations.en) => {
    return translations[lang]?.[key] || translations.en[key] || (key as string);
  };

  const isRtl = lang === 'ar';

  return { t, isRtl };
};
