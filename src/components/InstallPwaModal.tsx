import React, { useState, useEffect } from 'react';
import { UILanguage } from '../types';
import {
  Smartphone,
  CheckCircle2,
  X,
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface InstallPwaModalProps {
  uiLang: UILanguage;
  onClose: () => void;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({
  onClose,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [activeTab, setActiveTab] = useState<'qr' | 'install'>('qr');
  const [isCopied, setIsCopied] = useState(false);

  // The public shared preview URL (accessible from any phone without 403 error)
  const publicSharedUrl =
    'https://ais-pre-6zhlcrzzw3do5yx5m5zyld-556163224399.asia-southeast1.run.app';

  useEffect(() => {
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the PWA install prompt');
      }
      setDeferredPrompt(null);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicSharedUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(
    publicSharedUrl
  )}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950 text-white flex items-center justify-center shadow-xs">
              <Smartphone className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-heading font-bold text-slate-900">
                Телефондон ачуу жана орнотуу
              </h2>
              <p className="text-xs text-slate-500">Android жана iPhone (iOS)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 403 Error Solution Notice */}
        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>403 катасы чыкпашы үчүн:</strong> Телефондон ачууда атайын жалпыга ачык
            (Shared) шилтеме колдонулушу керек. Төмөнкү даяр QR-код же көчүрүлгөн шилтеме
            аркылуу кирсеңиз, телефондон эч кандай тоскоолдуксуз ачылат!
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'qr'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. QR-код менен телефондон ачуу
          </button>
          <button
            onClick={() => setActiveTab('install')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'install'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Экранга тиркеме кылуу нускамасы
          </button>
        </div>

        {/* Tab 1: QR Code & Direct Link */}
        {activeTab === 'qr' && (
          <div className="text-center space-y-4 py-1">
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Телефонуңуздун камерасын туштасаңыз, тиркеме дароо телефонуңузда ачылат:
            </p>

            <div className="p-3 bg-white rounded-2xl border-2 border-slate-200 inline-block shadow-sm">
              <img
                src={qrImageUrl}
                alt="QR Code for Mobile Access"
                className="w-48 h-48 mx-auto rounded-xl"
              />
            </div>

            {/* Direct Copy Link Button */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs max-w-md mx-auto">
                <span className="truncate flex-1 font-mono text-slate-600 px-2 text-[11px]">
                  {publicSharedUrl}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition flex items-center gap-1 shrink-0"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Көчүрүлдү!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Көчүрүү</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                (Шилтемени көчүрүп алып, телефонуңуздагы WhatsApp же Telegram аркылуу өзүңүзгө жөнөтүп ачсаңыз да болот)
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Installation Guide */}
        {activeTab === 'install' && (
          <div className="space-y-4">
            {isStandalone ? (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-sm text-emerald-950">
                  Тиркеме ийгиликтүү орнотулган!
                </h3>
                <p className="text-xs text-emerald-800">
                  Сиз азыр толук кандуу мобилдик колдонмо режиминде колдонуп жатасыз.
                </p>
              </div>
            ) : (
              <>
                {deferredPrompt && (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 space-y-3">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                      <Download className="w-4 h-4 text-amber-600" />
                      <span>Android (Chrome) үчүн бир басуу менен орнотуу</span>
                    </div>
                    <button
                      onClick={handleInstallClick}
                      className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Download className="w-4 h-4 text-amber-400" />
                      <span>Телефонго орнотуу (Install App)</span>
                    </button>
                  </div>
                )}

                {/* iPhone / iOS Guide */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                    🍏 iPhone (Safari браузеринде):
                  </div>
                  <ol className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        1
                      </span>
                      <span>
                        Safari'нин төмөнкү менюсундагы <strong className="text-slate-950">«Поделиться»</strong> баскычын басыңыз (өйдө караган жебе менен квадрат иконка).
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        2
                      </span>
                      <span>
                        Тизмеден <strong className="text-slate-950">«На экран "Домой"» (Add to Home Screen)</strong> басыңыз.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        3
                      </span>
                      <span>
                        Жогорудан <strong className="text-slate-950">«Добавить»</strong> басыңыз. Телефонуңуздун экранында өзүнчө тиркеме болуп пайда болот!
                      </span>
                    </li>
                  </ol>
                </div>

                {/* Android / Chrome Guide */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                    🤖 Android (Google Chrome же Samsung Internet):
                  </div>
                  <ol className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        1
                      </span>
                      <span>
                        Оң жак үстүңкү <strong className="text-slate-950">үч чекитти (⋮)</strong> басыңыз.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        2
                      </span>
                      <span>
                        <strong className="text-slate-950">«Установить приложение»</strong> же <strong className="text-slate-950">«Добавить на главный экран»</strong> тандаңыз.
                      </span>
                    </li>
                  </ol>
                </div>
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
          >
            Жабуу
          </button>
        </div>
      </div>
    </div>
  );
};
