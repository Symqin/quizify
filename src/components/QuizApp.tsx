'use client';

import React, { useState } from 'react';
import { Loader2, ArrowRight, CheckCircle2, XCircle, BookOpen, RotateCcw, AlertCircle, UploadCloud, FileText, X } from 'lucide-react';

type Difficulty = 'Easy' | 'Medium' | 'Hard';

type Question = {
  pertanyaan: string;
  opsi: string[];
  jawabanBenar: string;
  penjelasan: string;
  topik: string;
};

type Phase = 'input' | 'quiz' | 'result';

export default function QuizApp() {
  const [phase, setPhase] = useState<Phase>('input');
  
  // Phase 1 States
  const [materi, setMateri] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  // Phase 2 States
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  
  // Phase 3 States (Tracking)
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongTopics, setWrongTopics] = useState<string[]>([]);

  // ---- Handlers ----
  
  const handleGenerateQuiz = async () => {
    if (!materi.trim() && !file) {
      setError('Pilih file atau masukkan teks materi.');
      return;
    }
    
    setError('');
    setIsGenerating(true);
    
    try {
      const formData = new FormData();
      if (materi) formData.append('materi', materi);
      formData.append('tingkatKesulitan', difficulty);
      if (file) formData.append('file', file);

      const res = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Terjadi kesalahan saat membuat kuis.');
      }
      
      setQuestions(data);
      setPhase('quiz');
      
      // Reset Quiz States
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
      setCorrectCount(0);
      setWrongTopics([]);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectAnswer = (opsi: string) => {
    if (isAnswerChecked) return;
    setSelectedAnswer(opsi);
  };

  const handleCheckAnswer = () => {
    if (!selectedAnswer) return;
    
    setIsAnswerChecked(true);
    const currentQ = questions[currentIndex];
    const isCorrect = selectedAnswer === currentQ.jawabanBenar;
    
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    } else {
      if (currentQ.topik && !wrongTopics.includes(currentQ.topik)) {
        setWrongTopics(prev => [...prev, currentQ.topik]);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
    } else {
      setPhase('result');
    }
  };

  const handleReset = () => {
    setPhase('input');
    setMateri('');
    setFile(null);
    setQuestions([]);
    setError('');
  };

  // ---- Renderers ----

  const renderInputPhase = () => (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-2">Quizify</h1>
        <p className="text-slate-500">Ubah materi kuliahmu menjadi kuis interaktif dalam hitungan detik.</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Unggah File (PDF/TXT) atau Paste Teks</label>
          
          <div className="mb-4">
            {!file ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all hover:border-blue-400">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500 font-medium">Klik untuk upload atau drag and drop</p>
                  <p className="text-xs text-slate-400 mt-1">PDF, TXT (Max 5MB)</p>
                </div>
                <input type="file" accept=".pdf,.txt" className="hidden" onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                  }
                }} />
              </label>
            ) : (
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-blue-800">{file.name}</p>
                    <p className="text-xs text-blue-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button onClick={() => setFile(null)} className="p-2 hover:bg-blue-100 rounded-full transition-colors text-blue-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <textarea 
            value={materi}
            onChange={(e) => setMateri(e.target.value)}
            placeholder="Atau masukkan teks materi kuliah di sini..."
            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none text-slate-700 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">Tingkat Kesulitan</label>
          <div className="grid grid-cols-3 gap-4">
            {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                  difficulty === level 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm font-medium">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <button
          onClick={handleGenerateQuiz}
          disabled={isGenerating}
          className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg transition-all transform hover:-translate-y-1 shadow-lg shadow-blue-600/30 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              AI sedang meracik soal...
            </>
          ) : (
            <>
              Generate Quiz
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderQuizPhase = () => {
    const currentQ = questions[currentIndex];
    
    return (
      <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4 text-sm font-medium text-slate-500">
            <span>Soal {currentIndex + 1} dari {questions.length}</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">{difficulty}</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-8 leading-snug">
          {currentQ.pertanyaan}
        </h2>

        <div className="space-y-3 mb-8">
          {currentQ.opsi.map((opsi, idx) => {
            const isSelected = selectedAnswer === opsi;
            const isCorrectAnswer = isAnswerChecked && opsi === currentQ.jawabanBenar;
            const isWrongSelected = isAnswerChecked && isSelected && opsi !== currentQ.jawabanBenar;
            
            let btnClass = "border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50";
            
            if (isAnswerChecked) {
              if (isCorrectAnswer) {
                btnClass = "border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20";
              } else if (isWrongSelected) {
                btnClass = "border-red-500 bg-red-50 text-red-800";
              } else {
                btnClass = "border-slate-100 bg-slate-50 text-slate-400 opacity-60";
              }
            } else if (isSelected) {
              btnClass = "border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20";
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectAnswer(opsi)}
                disabled={isAnswerChecked}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all font-medium flex items-center justify-between ${btnClass}`}
              >
                <span>{opsi}</span>
                {isAnswerChecked && isCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
                {isAnswerChecked && isWrongSelected && <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        {isAnswerChecked && selectedAnswer !== currentQ.jawabanBenar && (
          <div className="mb-8 p-5 bg-orange-50 border border-orange-100 rounded-2xl text-orange-800 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h4 className="font-bold mb-1 flex items-center gap-2">
              <BookOpen className="w-5 h-5" /> Penjelasan Singkat
            </h4>
            <p className="text-orange-700/90 leading-relaxed">{currentQ.penjelasan}</p>
          </div>
        )}

        <div className="flex justify-end mt-4">
          {!isAnswerChecked ? (
            <button
              onClick={handleCheckAnswer}
              disabled={!selectedAnswer}
              className="py-3 px-8 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cek Jawaban
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="py-3 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all flex items-center gap-2"
            >
              {currentIndex < questions.length - 1 ? 'Selanjutnya' : 'Lihat Hasil'}
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderResultPhase = () => {
    const percentage = Math.round((correctCount / questions.length) * 100);
    const strokeDasharray = `${(percentage * 283) / 100} 283`;
    
    return (
      <div className="w-full max-w-2xl mx-auto p-8 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 text-center">
        <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Hasil Simulasi</h2>
        <p className="text-slate-500 mb-8">Kerja bagus! Berikut adalah ringkasan hasil belajar kamu.</p>
        
        <div className="flex justify-center mb-8">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={percentage >= 70 ? "#10b981" : percentage >= 40 ? "#f59e0b" : "#ef4444"}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-slate-800">{percentage}%</span>
              <span className="text-sm font-medium text-slate-500 mt-1">Skor Akhir</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <div className="text-emerald-600 text-sm font-bold mb-1 uppercase tracking-wider">Benar</div>
            <div className="text-3xl font-black text-emerald-700">{correctCount}</div>
          </div>
          <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
            <div className="text-red-600 text-sm font-bold mb-1 uppercase tracking-wider">Salah</div>
            <div className="text-3xl font-black text-red-700">{questions.length - correctCount}</div>
          </div>
        </div>

        {wrongTopics.length > 0 && (
          <div className="text-left mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" /> Insight Topik Lemah
            </h3>
            <p className="text-sm text-slate-600 mb-3">Kamu perlu mempelajari ulang topik-topik berikut:</p>
            <div className="flex flex-wrap gap-2">
              {wrongTopics.map((topic, i) => (
                <span key={i} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium shadow-sm">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleReset}
          className="w-full py-4 px-6 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-800/20"
        >
          <RotateCcw className="w-5 h-5" />
          Mulai Kuis Baru
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-4xl">
        {phase === 'input' && renderInputPhase()}
        {phase === 'quiz' && renderQuizPhase()}
        {phase === 'result' && renderResultPhase()}
      </div>
    </div>
  );
}
