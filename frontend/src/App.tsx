import React, { useEffect, useState } from "react";
import axios from "axios";

import Sidebar from "./components/Sidebar";
import MobileTabBar from "./components/MobileTabBar";
import SummaryCard from "./components/SummaryCard";
import WeeklyOverview from "./components/WeeklyOverview";
import { mockWeek, type WeekRow } from "./lib/data";
import SleepPanel from "./components/panels/SleepPanel";
import DietPanel from "./components/panels/DietPanel";
import ExercisePanel from "./components/panels/ExercisePanel";
import ChatbotPanel from "./components/panels/ChatbotPanel";
import SettingsPanel from "./components/panels/SettingsPanel";


type NavKey = "overview" | "sleep" | "diet" | "exercise" | "chatbot" | "settings";

const allowedTabs: NavKey[] = ["overview", "sleep", "diet", "exercise", "chatbot", "settings"];

const initialTabFromHash = (): NavKey => {
  if (typeof window === "undefined") return "overview";
  const raw = (window.location.hash || "").replace(/^#\/?/, "");
  return (allowedTabs.includes(raw as NavKey) ? (raw as NavKey) : "overview");
};

const App: React.FC = () => {
  const [message, setMessage] = useState<string>("");
  // read initial tab from URL hash (e.g. #chatbot). falls back to "overview"
  const [tab, setTab] = useState<NavKey>(initialTabFromHash);

  const week: WeekRow[] = mockWeek;

  useEffect(() => {
    axios.get("/api/").then((r) => setMessage(r.data.message)).catch(() => {});
  }, []);

  // keep URL hash in sync when tab changes (replaceState to avoid extraneous history entries)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const desired = `#${tab}`;
    if (window.location.hash !== desired) {
      window.history.replaceState(null, "", desired);
    }
  }, [tab]);

  // respond to back/forward and manual hash edits
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onHashChange = () => {
      const raw = (window.location.hash || "").replace(/^#\/?/, "");
      if (allowedTabs.includes(raw as NavKey)) setTab(raw as NavKey);
      else setTab("overview");
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

    return (
    <div className="min-h-screen bg-base-200">
      <Sidebar current={tab} onNavigate={setTab} />

      <main className="pl-16 md:pl-64 pb-[max(4rem,env(safe-area-inset-bottom))] md:pb-0">
        <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-600">
              WellGenie Dashboard
            </h1>
            <p className="text-base md:text-lg text-base-content">
              {message || "UI only right now, backend can come later"}
            </p>
          </div>

          {/* Overview content (only when overview is active) */}
          {tab === "overview" && (
            <>
              <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SummaryCard title="Sleep" value="8.0" unit="h" hint="avg last 7d" accent="purple" />
                <SummaryCard title="Diet" value="72" unit="/100" hint="quality score" accent="green" />
                <SummaryCard title="Exercise" value="56" unit="min" hint="today" accent="pink" />
              </section>

              <WeeklyOverview data={week} />

              <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card bg-base-100 border border-base-300">
                  <div className="card-body py-4 px-4">
                    <h3 className="card-title text-base">Sleep</h3>
                    <p className="text-sm text-base-content/70">Avg 8.0 h, best Sat</p>
                  </div>
                </div>
                <div className="card bg-base-100 border border-base-300">
                  <div className="card-body py-4 px-4">
                    <h3 className="card-title text-base">Diet</h3>
                    <p className="text-sm text-base-content/70">Protein on track, fiber low</p>
                  </div>
                </div>
                <div className="card bg-base-100 border border-base-300">
                  <div className="card-body py-4 px-4">
                    <h3 className="card-title text-base">Exercise</h3>
                    <p className="text-sm text-base-content/70">3 of 4 sessions done</p>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Placeholder for future tabs (we’ll add minimal content next step) */}
          {tab !== "overview" && (
            <div className="card bg-base-100 border border-base-300">
              <div className="card-body">
                <h2 className="card-title capitalize">{tab}</h2>
                {/* Non-overview tabs */}
                  {tab === "sleep"    && <SleepPanel />}
                  {tab === "diet"     && <DietPanel />}
                  {tab === "exercise" && <ExercisePanel />}
                  {tab === "chatbot"  && <ChatbotPanel />}
                  {tab === "settings" && <SettingsPanel />}

              </div>
            </div>
          )}
        </div>
      </main>

      <MobileTabBar
        current={tab === "settings" || tab === "chatbot" ? "overview" : (tab as "overview" | "sleep" | "diet" | "exercise")}
        onNavigate={(k) => setTab(k)}
      />
    </div>
  );
};

export default App;