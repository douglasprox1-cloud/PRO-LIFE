
import React, { useEffect, useMemo, useState } from "react";

// ============================ // Helpers // ============================
const LS_KEY = "lifeboard_planner_state_v1";

function loadState<T>(fallback: T): T {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) } as T;
  } catch {
    return fallback;
  }
}

function saveState<T>(state: T) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {}
}

function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

// ============================ // Types // ============================
const DAYS = [ "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo", ];

type WeeklyAction = { id: string; text: string };

type WeeklyDay = {
  day: string;
  focus: string;
  actions: WeeklyAction[]; // até 3
  timeEstimate: string;
  expectedResult: string;
  done: boolean;
};

type WeeklyPlan = {
  review: {
    worked: string;
    drained: string;
    adjust: string;
  };
  days: WeeklyDay[];
};

type MonthlyAction = { id: string; text: string };

type MonthlyRow = {
  id: string;
  area: string; // Profissional, Financeira, Saúde etc
  goal: string; // Meta do mês
  indicator: string; // Como medir
  actions: MonthlyAction[]; // até 3
  resources: string;
  progress: number; // 0-100
  notes: string;
};

type MonthlyPlan = {
  rows: MonthlyRow[];
  closing: {
    wins: string; // Conquistas
    learnings: string; // Aprendizados
    next: string; // Ajustes
  };
};

type AppState = {
  mode: "weekly" | "monthly";
  weekly: WeeklyPlan;
  monthly: MonthlyPlan;
};

interface PlannerViewProps {
    onGoalCompleted: (points: number) => void;
    onGoalUncompleted: (points: number) => void;
}


// ============================ // Defaults // ============================
function mkWeekly(): WeeklyPlan {
  return {
    days: DAYS.map((d) => ({
      day: d,
      focus: "",
      actions: [1, 2, 3].map((i) => ({ id: `${d}-a${i}`, text: "" })),
      timeEstimate: "",
      expectedResult: "",
      done: false,
    })),
    review: { worked: "", drained: "", adjust: "" },
  };
}

function mkMonthly(): MonthlyPlan {
  return {
    rows: [
      mkMonthlyRow("💼 Profissional"),
      mkMonthlyRow("💰 Financeira"),
      mkMonthlyRow("💪 Saúde"),
      mkMonthlyRow("❤️ Relacionamentos"),
      mkMonthlyRow("🧠 Desenvolvimento"),
    ],
    closing: { wins: "", learnings: "", next: "" },
  };
}

function mkMonthlyRow(areaLabel = "Área"): MonthlyRow {
  return {
    id: crypto.randomUUID(),
    area: areaLabel,
    goal: "",
    indicator: "",
    actions: [1, 2, 3].map((i) => ({ id: `${areaLabel}-a${i}`, text: "" })),
    resources: "",
    progress: 0,
    notes: "",
  };
}

const DEFAULT_STATE: AppState = {
  mode: "weekly",
  weekly: mkWeekly(),
  monthly: mkMonthly(),
};

// ============================ // Components // ============================
function TabButton({ active, onClick, children }: any) {
  return (
    <button
      onClick={onClick}
      className={classNames(
        "px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
        active
          ? "bg-indigo-600 text-white shadow"
          : "bg-slate-700 text-slate-300 hover:bg-slate-600"
      )}
    >
      {children}
    </button>
  );
}

function SectionCard({ title, subtitle, children, right }: any) {
  return (
    <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-4 md:p-6 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg md:text-xl font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        </div>
        {right}
      </div>
      <div className="pt-2">{children}</div>
    </div>
  );
}

function SmallLabel({ children }: any) {
  return <span className="text-xs uppercase tracking-wide text-slate-400">{children}</span>;
}

function TextInput({ value, onChange, placeholder, className }: any) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={classNames(
        "w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500",
        className
      )}
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 3 }: any) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500"
    />
  );
}

function ProgressBar({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value || 0));
  return (
    <div className="w-full h-2 bg-slate-700 rounded-full">
      <div
        className="h-2 rounded-full bg-indigo-500 transition-all"
        style={{ width: `${v}%` }}
        title={`${v}%`}
      />
    </div>
  );
}

function Divider() {
  return <div className="border-t border-slate-700 w-full" />;
}

// ============================ // Root App // ============================
export default function PlannerView({ onGoalCompleted, onGoalUncompleted }: PlannerViewProps) {
  const [state, setState] = useState<AppState>(() => loadState(DEFAULT_STATE));

  useEffect(() => {
    saveState(state);
  }, [state]);

  const setWeekly = (w: WeeklyPlan) => setState({ ...state, weekly: w });
  const setMonthly = (m: MonthlyPlan) => setState({ ...state, monthly: m });
  
  // ============================ // Weekly Planner // ============================
  function WeeklyPlanner({ weekly, setWeekly }: { weekly: WeeklyPlan; setWeekly: (w: WeeklyPlan) => void }) {
    const setDay = (idx: number, patch: Partial<WeeklyDay>) => {
      const days = [...weekly.days];
      const oldDay = days[idx];
      days[idx] = { ...oldDay, ...patch };

      // Gamification logic
      if ('done' in patch) {
          const isNowDone = patch.done;
          const wasDone = oldDay.done;
          if (isNowDone === true && wasDone === false) {
              onGoalCompleted(10);
          } else if (isNowDone === false && wasDone === true) {
              onGoalUncompleted(10);
          }
      }

      setWeekly({ ...weekly, days });
    };

    return (
      <div className="space-y-6">
        <SectionCard
          title="Plano Semanal (Regra 3x3)"
          subtitle="3 metas/ações sustentadas por 3 movimentos diários — foco em ritmo e consistência"
          right={
            <div className="flex items-center gap-2">
              <button
                className="text-sm px-3 py-2 rounded-lg border border-slate-600 bg-slate-700 hover:bg-slate-600 text-slate-300"
                onClick={() => setWeekly(mkWeekly())}
                title="Limpar semana"
              >
                Nova semana
              </button>
            </div>
          }
        >
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {weekly.days.map((d, i) => (
              <div key={d.day} className="rounded-lg border border-slate-700 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white">{d.day}</h4>
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={!!d.done}
                      onChange={(e) => setDay(i, { done: e.target.checked })}
                      className="form-checkbox h-4 w-4 bg-slate-600 border-slate-500 rounded text-indigo-500 focus:ring-indigo-500"
                    />
                    <span>Concluído</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <SmallLabel>Foco principal</SmallLabel>
                  <TextInput
                    value={d.focus}
                    onChange={(v: string) => setDay(i, { focus: v })}
                    placeholder="Ex.: Produção, Energia, Revisão, Relacionamentos..."
                  />
                </div>

                <div className="space-y-2">
                  <SmallLabel>3 ações‑chave</SmallLabel>
                  {d.actions.map((a, k) => (
                    <TextInput
                      key={a.id}
                      value={a.text}
                      onChange={(v: string) => {
                        const actions = [...d.actions];
                        actions[k] = { ...actions[k], text: v };
                        setDay(i, { actions });
                      }}
                      placeholder={`Ação ${k + 1}`}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <SmallLabel>Tempo estimado</SmallLabel>
                    <TextInput
                      value={d.timeEstimate}
                      onChange={(v: string) => setDay(i, { timeEstimate: v })}
                      placeholder="Ex.: 2h total"
                    />
                  </div>
                  <div>
                    <SmallLabel>Resultado esperado</SmallLabel>
                    <TextInput
                      value={d.expectedResult}
                      onChange={(v: string) => setDay(i, { expectedResult: v })}
                      placeholder="Ex.: Capítulo X concluído"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Revisão da Semana" subtitle="Responda no domingo para ajustar a próxima semana">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <SmallLabel>O que funcionou bem?</SmallLabel>
              <TextArea
                value={weekly.review.worked}
                onChange={(v: string) => setWeekly({ ...weekly, review: { ...weekly.review, worked: v } })}
                placeholder="Vitórias, padrões que quero repetir..."
              />
            </div>
            <div>
              <SmallLabel>O que drenou energia?</SmallLabel>
              <TextArea
                value={weekly.review.drained}
                onChange={(v: string) => setWeekly({ ...weekly, review: { ...weekly.review, drained: v } })}
                placeholder="Ralos de atenção, distrações, travas..."
              />
            </div>
            <div>
              <SmallLabel>O que vou ajustar?</SmallLabel>
              <TextArea
                value={weekly.review.adjust}
                onChange={(v: string) => setWeekly({ ...weekly, review: { ...weekly.review, adjust: v } })}
                placeholder="Trocas de estratégia, priorização, limites..."
              />
            </div>
          </div>
        </SectionCard>
      </div>
    );
  }

  // ============================ // Monthly Planner // ============================
  function MonthlyPlanner({ monthly, setMonthly }: { monthly: MonthlyPlan; setMonthly: (m: MonthlyPlan) => void }) {
    const setRow = (id: string, patch: Partial<MonthlyRow>) => {
      const oldRow = monthly.rows.find((r) => r.id === id);
      const rows = monthly.rows.map((r) => (r.id === id ? { ...r, ...patch } : r));

      if (oldRow && "progress" in patch) {
          const oldProgress = oldRow.progress || 0;
          const newProgress = Number(patch.progress) || 0;
          if (oldProgress < 100 && newProgress >= 100) {
              onGoalCompleted(50);
          } else if (oldProgress >= 100 && newProgress < 100) {
              onGoalUncompleted(50);
          }
      }

      setMonthly({ ...monthly, rows });
    };

    const addRow = () => setMonthly({ ...monthly, rows: [...monthly.rows, mkMonthlyRow()] });
    const removeRow = (id: string) => setMonthly({ ...monthly, rows: monthly.rows.filter((r) => r.id !== id) });

    const avgProgress = useMemo(() => {
      const n = monthly.rows.length || 1;
      const sum = monthly.rows.reduce((acc, r) => acc + (Number(r.progress) || 0), 0);
      return Math.round(sum / n);
    }, [monthly.rows]);

    return (
      <div className="space-y-6">
        <SectionCard
          title="Planejamento Mensal"
          subtitle="Metas por área, indicadores e ações‑chave — foco em resultados"
          right={
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 text-sm text-slate-300">
                <span>Média de progresso</span>
                <div className="w-28"><ProgressBar value={avgProgress} /></div>
                <span className="text-xs text-slate-400 w-8 text-right">{avgProgress}%</span>
              </div>
              <button
                className="text-sm px-3 py-2 rounded-lg border border-slate-600 bg-slate-700 hover:bg-slate-600 text-slate-300"
                onClick={() => setMonthly(mkMonthly())}
              >
                Novo mês
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            {monthly.rows.map((r) => (
              <div key={r.id} className="rounded-lg border border-slate-700 p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-3">
                    <SmallLabel>Área</SmallLabel>
                    <TextInput value={r.area} onChange={(v: string) => setRow(r.id, { area: v })} placeholder="Ex.: 💼 Profissional" />
                  </div>
                  <div className="md:col-span-4">
                    <SmallLabel>Meta do mês</SmallLabel>
                    <TextInput value={r.goal} onChange={(v: string) => setRow(r.id, { goal: v })} placeholder="Defina o resultado desejado" />
                  </div>
                  <div className="md:col-span-3">
                    <SmallLabel>Indicador (como medir)</SmallLabel>
                    <TextInput value={r.indicator} onChange={(v: string) => setRow(r.id, { indicator: v })} placeholder="Ex.: % concluído, data, valor" />
                  </div>
                  <div className="md:col-span-2">
                    <SmallLabel>Progresso</SmallLabel>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={r.progress}
                      onChange={(e) => setRow(r.id, { progress: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
                      className="w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {r.actions.map((a, i) => (
                    <div key={a.id}>
                      <SmallLabel>Ação {i + 1}</SmallLabel>
                      <TextInput
                        value={a.text}
                        onChange={(v: string) => {
                          const actions = r.actions.slice();
                          actions[i] = { ...actions[i], text: v };
                          setRow(r.id, { actions });
                        }}
                        placeholder="Passo concreto que move a meta"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <SmallLabel>Recursos necessários</SmallLabel>
                    <TextInput value={r.resources} onChange={(v: string) => setRow(r.id, { resources: v })} placeholder="Tempo, pessoas, sistemas..." />
                  </div>
                  <div>
                    <SmallLabel>Observações</SmallLabel>
                    <TextInput value={r.notes} onChange={(v: string) => setRow(r.id, { notes: v })} placeholder="Riscos, dependências, decisões" />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="flex-1"><ProgressBar value={r.progress} /></div>
                  <button
                    className="text-xs px-3 py-2 rounded-lg border border-slate-600 bg-slate-700 hover:bg-slate-600 text-slate-300"
                    onClick={() => removeRow(r.id)}
                  >
                    Remover linha
                  </button>
                </div>
              </div>
            ))}
            <button
              className="w-full md:w-auto text-sm px-4 py-2 rounded-xl border border-slate-600 bg-slate-700 hover:bg-slate-600 text-slate-300"
              onClick={addRow}
            >
              + Adicionar área/meta
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Fechamento do Mês" subtitle="Conclua para consolidar ganhos e ajustes">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <SmallLabel>✅ Conquistas</SmallLabel>
              <TextArea
                value={monthly.closing.wins}
                onChange={(v: string) => setMonthly({ ...monthly, closing: { ...monthly.closing, wins: v } })}
                placeholder="O que foi atingido: metas, marcos, decisões"
              />
            </div>
            <div>
              <SmallLabel>💡 Aprendizados</SmallLabel>
              <TextArea
                value={monthly.closing.learnings}
                onChange={(v: string) => setMonthly({ ...monthly, closing: { ...monthly.closing, learnings: v } })}
                placeholder="O que descobri sobre mim, processos e prioridades"
              />
            </div>
            <div>
              <SmallLabel>🔄 Ajustes para o próximo mês</SmallLabel>
              <TextArea
                value={monthly.closing.next}
                onChange={(v: string) => setMonthly({ ...monthly, closing: { ...monthly.closing, next: v } })}
                placeholder="O que manter, parar e iniciar"
              />
            </div>
          </div>
        </SectionCard>
      </div>
    );
  }

  // ============================ // Toolbar (Export/Import) // ============================
  function TopToolbar({ state, setState }: { state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>> }) {
    const exportJson = () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `planner-3x3-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    };

    const importJson = () => {
      const inp = document.createElement("input");
      inp.type = "file";
      inp.accept = "application/json";
      inp.onchange = async () => {
        if (!inp.files?.[0]) return;
        const txt = await inp.files[0].text();
        try {
          const parsed = JSON.parse(txt);
          setState((prev) => ({ ...prev, ...parsed }));
        } catch (e) {
          alert("Arquivo inválido");
        }
      };
      inp.click();
    };

    const resetAll = () => {
      if (!confirm("Limpar todo o planejamento?")) return;
      setState(DEFAULT_STATE);
    };

    return (
      <div className="flex flex-wrap items-center gap-2">
        <button
          className="px-3 py-2 rounded-lg border border-slate-600 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm"
          onClick={exportJson}
        >
          Exportar JSON
        </button>
        <button
          className="px-3 py-2 rounded-lg border border-slate-600 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm"
          onClick={importJson}
        >
          Importar JSON
        </button>
        <button
          className="px-3 py-2 rounded-lg border border-slate-600 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm"
          onClick={resetAll}
        >
          Limpar tudo
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Planner 3×3 — Semanal & Mensal</h2>
            <p className="text-slate-400 text-sm">
              Foque no essencial: 3 metas do mês, 3 ações por semana, 3 movimentos por dia. Salva automaticamente no seu navegador.
            </p>
          </div>
          <TopToolbar state={state} setState={setState} />
        </header>

        <div className="flex items-center gap-2 mb-5">
          <TabButton active={state.mode === "weekly"} onClick={() => setState({ ...state, mode: "weekly" })}>
            Visão Semanal
          </TabButton>
          <TabButton active={state.mode === "monthly"} onClick={() => setState({ ...state, mode: "monthly" })}>
            Visão Mensal
          </TabButton>
        </div>

        <main className="space-y-8">
          {state.mode === "weekly" ? (
            <WeeklyPlanner weekly={state.weekly} setWeekly={setWeekly} />
          ) : (
            <MonthlyPlanner monthly={state.monthly} setMonthly={setMonthly} />
          )}
        </main>

        <footer className="mt-10 text-center text-xs text-slate-500">
          <Divider />
          <p className="mt-4">
            Dica: marque um bloco fixo no domingo para revisar a semana e preparar a próxima. Consistência &gt; intensidade.
          </p>
        </footer>
    </div>
  );
}