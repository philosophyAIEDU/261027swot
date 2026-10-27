import { useCallback, useState } from 'react';
import { Button } from './components/Button';
import { ErrorMessage } from './components/ErrorMessage';
import { Header } from './components/Header';
import { Layout } from './components/Layout';
import { LoadingBuddy } from './components/LoadingBuddy';
import { NoticeBanner } from './components/NoticeBanner';
import { CompareView } from './features/analysis/CompareView';
import { SearchBox } from './features/analysis/SearchBox';
import { SourceList } from './features/analysis/SourceList';
import { SwotBoard } from './features/analysis/SwotBoard';
import { UnclearHelp } from './features/analysis/UnclearHelp';
import { useSwotAnalysis } from './features/analysis/useSwotAnalysis';
import { ApiKeySetup } from './features/apiKey/ApiKeySetup';
import { useApiKey } from './features/apiKey/useApiKey';
import { FollowUpChat } from './features/chat/FollowUpChat';
import { RecentList } from './features/history/RecentList';
import { useHistory } from './features/history/useHistory';
import { SwotIntroCard } from './features/intro/SwotIntroCard';
import { PracticeBoard } from './features/practice/PracticeBoard';
import { usePreferences } from './hooks/usePreferences';

type View = 'home' | 'keySetup' | 'practice';

export default function App() {
  const preferences = usePreferences();
  const { apiKey, remembered, verifyAndSave, clear } = useApiKey();
  const history = useHistory();
  const [view, setView] = useState<View>('home');
  const [useSearch, setUseSearch] = useState(false);
  const analysis = useSwotAnalysis(apiKey, { useSearch, onDone: history.add });

  const goHome = useCallback(() => {
    setView('home');
    analysis.reset();
  }, [analysis]);

  const goToKeySetup = useCallback(() => setView('keySetup'), []);

  const handleKeySubmit = useCallback(
    async (key: string, remember: boolean) => {
      const error = await verifyAndSave(key, remember);
      if (!error) setView('home');
      return error;
    },
    [verifyAndSave],
  );

  const handleClearKey = useCallback(() => {
    clear();
    analysis.reset();
    setView('home');
  }, [clear, analysis]);

  const header = (
    <Header
      hasKey={apiKey !== null}
      preferences={preferences}
      onHome={goHome}
      onChangeKey={goToKeySetup}
      onClearKey={handleClearKey}
    />
  );

  // 키가 없으면 무엇보다 먼저 "어른과 함께 설정해요" 화면을 보여 준다.
  if (!apiKey || view === 'keySetup') {
    return (
      <Layout header={header}>
        <ApiKeySetup
          onSubmit={handleKeySubmit}
          onCancel={apiKey ? () => setView('home') : undefined}
          initialRemember={remembered}
        />
        {!apiKey && <SwotIntroCard />}
      </Layout>
    );
  }

  if (view === 'practice') {
    return (
      <Layout header={header}>
        <Button variant="secondary" className="self-start" onClick={() => setView('home')}>
          ← 처음 화면으로
        </Button>
        <PracticeBoard apiKey={apiKey} onGoToKeySetup={goToKeySetup} />
      </Layout>
    );
  }

  const { state } = analysis;

  return (
    <Layout header={header}>
      <SearchBox
        disabled={analysis.isLoading}
        useSearch={useSearch}
        onToggleSearch={setUseSearch}
        onSearch={analysis.search}
        onCompare={analysis.compareTwo}
      />

      {state.status === 'loading' && <LoadingBuddy message={state.message} />}
      {state.status === 'error' && (
        <ErrorMessage error={state.error} onRetry={analysis.retry} onGoToKeySetup={goToKeySetup} />
      )}
      {state.status === 'unclear' && (
        <UnclearHelp
          intent={state.intent}
          disabled={analysis.isLoading}
          onExample={analysis.search}
          onPickOne={analysis.analyzeCompany}
          onPickTwo={analysis.compareTwo}
        />
      )}

      {state.status === 'done' ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <NoticeBanner />
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => window.print()}>
                인쇄하기 🖨️
              </Button>
              <Button variant="secondary" onClick={goHome}>
                🏠 처음으로
              </Button>
            </div>
          </div>
          {state.analysis.kind === 'single' ? (
            <SwotBoard result={state.analysis.result} />
          ) : (
            <CompareView result={state.analysis.result} />
          )}
          <SourceList sources={state.analysis.sources} />
          <FollowUpChat
            key={state.requestId}
            apiKey={apiKey}
            analysis={state.analysis}
            useSearch={useSearch}
            onGoToKeySetup={goToKeySetup}
          />
        </>
      ) : (
        <>
          <RecentList
            entries={history.entries}
            onOpen={(entry) => analysis.showSaved(entry.analysis)}
            onRemove={history.remove}
          />
          <section className="flex flex-col items-start gap-2 rounded-3xl border-2 border-line bg-surface p-5">
            <h2 className="text-xl font-extrabold">
              <span aria-hidden="true">✍️ </span>내가 직접 채워 보기
            </h2>
            <p>AI에게 묻기 전에, 내가 먼저 4칸을 채워 볼까요? AI 선생님이 칭찬과 힌트를 줘요.</p>
            <Button onClick={() => setView('practice')}>직접 채워 보러 가기</Button>
          </section>
          <SwotIntroCard />
        </>
      )}
    </Layout>
  );
}
