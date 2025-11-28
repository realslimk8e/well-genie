import { useMemo, useState } from 'react';
import { useSleep, type SleepItem } from '../../hooks/useSleep';
import { useExercise, type ExerciseItem } from '../../hooks/useExercise';
import { useDiet, type DietItem } from '../../hooks/useDiet';

type Message = { from: 'bot' | 'user'; text: string };

const intents = [
  {
    id: 'sleep-week',
    label: 'Hours slept last 7 days',
    question: 'How many hours did I sleep last week?',
  },
  {
    id: 'steps-avg',
    label: 'Average daily steps',
    question: 'What is my average daily steps?',
  },
  {
    id: 'calories-target',
    label: 'Calories vs 2000 target',
    question: 'How are my calories compared to a 2000 kcal target?',
  },
];

export default function ChatbotPanel() {
  const { items: sleepItems } = useSleep();
  const { items: exerciseItems } = useExercise();
  const { items: dietItems } = useDiet();
  const [messages, setMessages] = useState<Message[]>([
    { from: 'bot', text: 'Hi! Choose a quick question or type your own.' },
  ]);
  const [input, setInput] = useState('');

  const answers = useMemo(() => {
    // sleep last 7 days
    const dates = (sleepItems as SleepItem[])
      .map((r) => new Date(r.date).getTime())
      .filter((t) => !Number.isNaN(t));
    const ref = dates.length ? Math.max(...dates) : Date.now();
    const sevenDaysAgo = ref - 7 * 24 * 60 * 60 * 1000;
    const recentSleep = (sleepItems as SleepItem[]).filter(
      (r) => new Date(r.date).getTime() >= sevenDaysAgo,
    );
    const sleepHours = recentSleep.reduce(
      (s, r) => s + Number(r.hours ?? 0),
      0,
    );

    // average steps
    const stepsVals = (exerciseItems as ExerciseItem[]).map((r) =>
      Number(r.steps ?? 0),
    );
    const stepsAvg =
      stepsVals.length > 0
        ? Math.round(stepsVals.reduce((s, n) => s + n, 0) / stepsVals.length)
        : 0;

    // calories vs target
    const calVals = (dietItems as DietItem[]).map((r) =>
      Number(r.calories ?? 0),
    );
    const calAvg =
      calVals.length > 0
        ? Math.round(calVals.reduce((s, n) => s + n, 0) / calVals.length)
        : 0;
    const target = 2000;
    const diff = calAvg - target;

    return {
      sleep:
        recentSleep.length === 0
          ? 'I do not see any sleep data yet. Try importing sleep.csv or narrowing the date range.'
          : `You slept ${sleepHours.toFixed(
              1,
            )} hours in the last 7 days (sum of daily hours).`,
      steps:
        stepsVals.length === 0
          ? 'No steps data found. Import exercise data or adjust filters to see step totals.'
          : `Average daily steps: ${stepsAvg.toLocaleString()} (mean of all logged days).`,
      calories:
        calVals.length === 0
          ? 'No nutrition data available. Import diet.csv to calculate calories.'
          : `Avg daily calories: ${calAvg} vs target ${target} kcal (${diff >= 0 ? '+' : ''}${diff}). Calculated as average of logged calories.`,
    };
  }, [sleepItems, exerciseItems, dietItems]);

  const send = (text: string, intentId?: string) => {
    if (!text.trim()) return;
    let response = "I'm not sure yet. Try a quick question.";
    if (intentId === 'sleep-week') response = answers.sleep;
    if (intentId === 'steps-avg') response = answers.steps;
    if (intentId === 'calories-target') response = answers.calories;
    setMessages((prev) => [
      ...prev,
      { from: 'user', text },
      { from: 'bot', text: response },
    ]);
    setInput('');
  };

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex flex-wrap gap-2">
        {intents.map((intent) => (
          <button
            key={intent.id}
            className="btn btn-sm"
            onClick={() => send(intent.question, intent.id)}
          >
            {intent.label}
          </button>
        ))}
      </div>

      <div className="border-base-300 flex-grow space-y-3 overflow-y-auto rounded-lg border p-3">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`chat ${m.from === 'bot' ? 'chat-start' : 'chat-end'}`}
          >
            <div
              className={`chat-bubble ${m.from === 'bot' ? '' : 'chat-bubble-primary'}`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="join">
        <input
          className="input input-bordered join-item w-full"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="chat input"
        />
        <button className="btn join-item" onClick={() => send(input)}>
          Send
        </button>
      </div>
    </div>
  );
}
