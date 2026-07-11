import { BrainCircuit, Plus, X } from 'lucide-react';

const COPY = {
    en: { fromDevice: 'From this device', hide: 'Hide recalled items', savedHere: 'Saved here', use: 'Use in message', disclosure: 'Nothing is added or sent until you choose it.' },
    hi: { fromDevice: 'इस डिवाइस से', hide: 'याद की गई चीज़ें छिपाएँ', savedHere: 'यहाँ सेव किया गया', use: 'मैसेज में जोड़ें', disclosure: 'आपके चुनने तक कुछ भी जोड़ा या भेजा नहीं जाता।' },
    hinglish: { fromDevice: 'Is device se', hide: 'Recalled cheezein chhupayein', savedHere: 'Yahin save kiya', use: 'Message mein jodein', disclosure: 'Aapke choose karne tak kuch add ya send nahi hota.' },
    bn: { fromDevice: 'এই ডিভাইস থেকে', hide: 'মনে পড়া জিনিস লুকান', savedHere: 'এখানে সেভ করা', use: 'মেসেজে যোগ করুন', disclosure: 'আপনি না বেছে নেওয়া পর্যন্ত কিছু যোগ বা পাঠানো হয় না।' },
    ta: { fromDevice: 'இந்தச் சாதனத்திலிருந்து', hide: 'நினைவுபடுத்தியவற்றை மறை', savedHere: 'இங்கே சேமித்தது', use: 'செய்தியில் சேர்க்கவும்', disclosure: 'நீங்கள் தேர்ந்தெடுக்கும் வரை எதுவும் சேர்க்கப்படவோ அனுப்பப்படவோ செய்யாது.' },
    te: { fromDevice: 'ఈ పరికరం నుంచి', hide: 'గుర్తుచేసిన వాటిని దాచండి', savedHere: 'ఇక్కడ సేవ్ చేసింది', use: 'సందేశంలో చేర్చండి', disclosure: 'మీరు ఎంచుకునే వరకు ఏదీ చేర్చబడదు లేదా పంపబడదు.' },
    mr: { fromDevice: 'या डिवाइसवरून', hide: 'आठवलेल्या गोष्टी लपवा', savedHere: 'इथे सेव केलेले', use: 'मेसेजमध्ये जोडा', disclosure: 'तुम्ही निवडेपर्यंत काहीही जोडले किंवा पाठवले जात नाही.' },
    gu: { fromDevice: 'આ ડિવાઇસમાંથી', hide: 'યાદ કરેલી વસ્તુઓ છુપાવો', savedHere: 'અહીં સેવ કરેલું', use: 'મેસેજમાં ઉમેરો', disclosure: 'તમે પસંદ ન કરો ત્યાં સુધી કશું ઉમેરાતું કે મોકલાતું નથી.' },
    kn: { fromDevice: 'ಈ ಸಾಧನದಿಂದ', hide: 'ನೆನಪಿಸಿದವುಗಳನ್ನು ಮರೆಮಾಡಿ', savedHere: 'ಇಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ', use: 'ಸಂದೇಶಕ್ಕೆ ಸೇರಿಸಿ', disclosure: 'ನೀವು ಆಯ್ಕೆ ಮಾಡುವವರೆಗೆ ಯಾವುದನ್ನೂ ಸೇರಿಸಲಾಗುವುದಿಲ್ಲ ಅಥವಾ ಕಳುಹಿಸಲಾಗುವುದಿಲ್ಲ.' },
    ml: { fromDevice: 'ഈ ഉപകരണത്തിൽ നിന്ന്', hide: 'ഓർമ്മിപ്പിച്ചവ മറയ്ക്കുക', savedHere: 'ഇവിടെ സൂക്ഷിച്ചത്', use: 'സന്ദേശത്തിൽ ചേർക്കുക', disclosure: 'നിങ്ങൾ തിരഞ്ഞെടുക്കുന്നതുവരെ ഒന്നും ചേർക്കുകയോ അയയ്ക്കുകയോ ചെയ്യില്ല.' },
    pa: { fromDevice: 'ਇਸ ਡਿਵਾਈਸ ਤੋਂ', hide: 'ਯਾਦ ਕੀਤੀਆਂ ਚੀਜ਼ਾਂ ਲੁਕਾਓ', savedHere: 'ਇੱਥੇ ਸੇਵ ਕੀਤਾ', use: 'ਸੁਨੇਹੇ ਵਿੱਚ ਜੋੜੋ', disclosure: 'ਤੁਹਾਡੇ ਚੁਣਨ ਤੱਕ ਕੁਝ ਵੀ ਜੋੜਿਆ ਜਾਂ ਭੇਜਿਆ ਨਹੀਂ ਜਾਂਦਾ।' },
    or: { fromDevice: 'ଏହି ଡିଭାଇସରୁ', hide: 'ମନେ ପକାଇଥିବା ବିଷୟ ଲୁଚାନ୍ତୁ', savedHere: 'ଏଠାରେ ସେଭ୍ ହୋଇଛି', use: 'ମେସେଜରେ ଯୋଡ଼ନ୍ତୁ', disclosure: 'ଆପଣ ବାଛିବା ପର୍ଯ୍ୟନ୍ତ କିଛି ଯୋଡ଼ା କିମ୍ବା ପଠାଯାଏ ନାହିଁ।' },
    ur: { fromDevice: 'اس ڈیوائس سے', hide: 'یاد کی گئی چیزیں چھپائیں', savedHere: 'یہاں محفوظ کیا گیا', use: 'پیغام میں شامل کریں', disclosure: 'آپ کے منتخب کرنے تک کچھ شامل یا بھیجا نہیں جاتا۔' },
};

export default function PrivateRecallSuggestions({ matches = [], isLight = false, language = 'en', onUse, onDismiss }) {
    if (!matches.length) return null;
    const copy = COPY[language] || COPY.en;

    return (
        <div className={`mx-auto mt-2 grid max-w-2xl gap-2 text-left ${isLight ? 'text-stone-700' : 'text-zinc-300'}`} aria-live="polite" dir={language === 'ur' ? 'rtl' : 'auto'}>
            <div className="flex items-center justify-between gap-3 px-1">
                <div className="inline-flex items-center gap-2 text-xs font-semibold">
                    <BrainCircuit size={14} className={isLight ? 'text-cyan-700' : 'text-cyan-100'} />
                    {copy.fromDevice}
                </div>
                <button
                    type="button"
                    onClick={onDismiss}
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition ${isLight ? 'text-stone-500 hover:bg-stone-200/70 hover:text-stone-950' : 'text-zinc-500 hover:bg-white/[0.06] hover:text-white'}`}
                    aria-label={copy.hide}
                >
                    <X size={14} />
                </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
                {matches.map((item) => (
                    <article
                        key={item.id}
                        className={`grid min-w-0 gap-2 rounded-lg border p-3 ${isLight ? 'border-cyan-600/15 bg-white/70' : 'border-cyan-200/12 bg-cyan-200/[0.045]'}`}
                    >
                        <div className="min-w-0">
                            <div className={`truncate text-sm font-semibold ${isLight ? 'text-stone-950' : 'text-cyan-50'}`}>{item.title || copy.savedHere}</div>
                            <p className={`mt-1 line-clamp-2 text-xs leading-5 ${isLight ? 'text-stone-600' : 'text-zinc-400'}`} style={{ overflowWrap: 'anywhere' }}>{item.text}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => onUse?.(item)}
                            className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition ${isLight ? 'border-cyan-600/20 bg-cyan-50 text-cyan-800 hover:border-cyan-600/35 hover:bg-white' : 'border-cyan-200/18 bg-cyan-200/[0.07] text-cyan-50 hover:border-cyan-100/35'}`}
                        >
                            <Plus size={14} />
                            {copy.use}
                        </button>
                    </article>
                ))}
            </div>
            <p className={`px-1 text-[11px] leading-5 ${isLight ? 'text-stone-500' : 'text-zinc-500'}`}>{copy.disclosure}</p>
        </div>
    );
}
