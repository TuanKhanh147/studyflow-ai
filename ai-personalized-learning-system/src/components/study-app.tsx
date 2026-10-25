"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Activity, AlarmClock, ArrowDownRight, ArrowRight, Award, BookOpen, Bot,
  BrainCircuit, CalendarDays, Check, CheckCircle2, ChevronDown, CircleHelp,
  Clock3, FileText, Flame, GraduationCap, LayoutDashboard, ListChecks,
  LogOut, Menu, MessageCircle, MoreHorizontal, Plus, Send, Settings,
  Sparkles, Target, TrendingUp, Trophy, UserRound, X, Zap
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";
import { chartData, defaultProfile, initialTasks } from "@/lib/demo-data";
import type { Message, StudyProfile, Task } from "@/lib/types";

type Tab = "Tổng quan" | "Lộ trình học" | "Trợ lý AI" | "Kiểm tra kiến thức" | "Tài liệu" | "Tiến độ" | "Hồ sơ";
const navItems: { label: Tab; icon: typeof LayoutDashboard }[] = [
  { label: "Tổng quan", icon: LayoutDashboard },
  { label: "Lộ trình học", icon: CalendarDays },
  { label: "Trợ lý AI", icon: Bot },
  { label: "Kiểm tra kiến thức", icon: ListChecks },
  { label: "Tài liệu", icon: FileText },
  { label: "Tiến độ", icon: TrendingUp },
  { label: "Hồ sơ", icon: UserRound },
];

function readStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; }
  catch { return fallback; }
}
function saveStored(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage may be disabled */ }
}

export default function StudyApp() {
  const [tab, setTab] = useState<Tab>("Tổng quan");
  const [profile, setProfile] = useState<StudyProfile>(defaultProfile);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "assistant", content: "Chào bạn! 👋 Mình là StudyFlow AI, trợ lý học tập của bạn.\\n\\nMình có thể giúp bạn hiểu kiến thức khó, xây dựng kế hoạch ôn tập, tạo câu hỏi luyện tập và phân tích lỗi sai.\\n\\nHôm nay bạn muốn học chủ đề nào?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeError, setNoticeError] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState("");
  const [quizResult, setQuizResult] = useState(false);
  const [resourceName, setResourceName] = useState("");
  const [resources, setResources] = useState<string[]>([]);
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    setProfile(readStored("studyflow-profile", defaultProfile));
    setTasks(readStored("studyflow-tasks", initialTasks));
    setMessages(readStored("studyflow-messages", messages));
    setResources(readStored("studyflow-resources", []));
    // Initial state is used only when there is no browser-saved demo data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { saveStored("studyflow-profile", profile); }, [profile]);
  useEffect(() => { saveStored("studyflow-tasks", tasks); }, [tasks]);
  useEffect(() => { saveStored("studyflow-messages", messages); }, [messages]);
  useEffect(() => { saveStored("studyflow-resources", resources); }, [resources]);

  const doneCount = tasks.filter(t => t.done).length;
  const completion = tasks.length ? Math.round(doneCount / tasks.length * 100) : 0;
  const greetingName = profile.name.trim().split(" ")[0] || "bạn";

  function flash(text: string, error = false) {
    setNotice(text); setNoticeError(error);
    window.setTimeout(() => setNotice(""), 3200);
  }
  function toggleTask(id: string) {
    setTasks(current => current.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }
  function addTask() {
    const title = window.prompt("Tên nhiệm vụ học tập:");
    if (!title?.trim()) return;
    const subject = window.prompt("Môn học:", profile.subjects[0] || "Chưa phân loại") || "Chưa phân loại";
    setTasks(current => [...current, { id: crypto.randomUUID(), title: title.trim(), subject, minutes: 25, done: false, day: "Hôm nay" }]);
    flash("Đã thêm nhiệm vụ học tập.");
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    const content = input.trim();
    if (!content || loading) return;
    const next = [...messages, { id: crypto.randomUUID(), role: "user" as const, content }];
    setMessages(next); setInput(""); setLoading(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: next.slice(-20).map(({ role, content: text }) => ({ role, content: text })),
          context: { major: profile.major, goal: profile.goal, level: "Chưa đánh giá chính thức" }
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Không thể kết nối AI.");
      setMessages(current => [...current, { id: crypto.randomUUID(), role: "assistant", content: data.answer || "Mình chưa tạo được câu trả lời." }]);
    } catch (e) {
      setMessages(current => [...current, { id: crypto.randomUUID(), role: "assistant", content: `Xin lỗi, đã có lỗi kết nối: ${e instanceof Error ? e.message : "Vui lòng thử lại."}` }]);
    } finally { setLoading(false); }
  }

  const activeTitle = tab === "Tổng quan" ? `Chào buổi tối, ${greetingName} 👋` : tab;
  const activeSubtitle = tab === "Tổng quan" ? "Mỗi bước nhỏ hôm nay là một tiến bộ lớn cho ngày mai." : "Không gian học tập cá nhân hóa dành riêng cho bạn.";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-icon"><BrainCircuit size={21}/></span><span>StudyFlow <span style={{color:"#536be9"}}>AI</span></span></div>
        <div>
          <div className="nav-label">Không gian học tập</div>
          <div className="nav-list">{navItems.map(item => {
            const Icon = item.icon;
            return <button key={item.label} className={`nav-item ${tab === item.label ? "active" : ""}`} onClick={() => {setTab(item.label);setMobileNav(false);}}><Icon size={18}/><span>{item.label}</span>{item.label === "Trợ lý AI" && <span className="pill" style={{marginLeft:"auto"}}>AI</span>}</button>;
          })}</div>
        </div>
        <div className="side-bottom">
          <div className="panel" style={{padding:15,background:"linear-gradient(140deg,#f2f4ff,#fff)"}}>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}><Sparkles size={17} color="#536be9"/><strong style={{fontSize:12}}>Học tốt hơn mỗi ngày</strong></div>
            <p className="subtle" style={{fontSize:11,margin:"0 0 12px"}}>Duy trì nhịp học đều đặn để tiến gần mục tiêu.</p>
            <button className="btn btn-light" style={{width:"100%",fontSize:11}} onClick={() => setTab("Lộ trình học")}>Xem lộ trình <ArrowRight size={14}/></button>
          </div>
          <div className="user-mini"><div className="avatar">{greetingName.slice(0,1).toUpperCase()}</div><div style={{minWidth:0,flex:1}}><div style={{fontWeight:800,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{profile.name}</div><div className="subtle" style={{fontSize:10}}>{profile.major}</div></div><button className="icon-btn" style={{height:30,width:30,border:0}} onClick={() => setTab("Hồ sơ")} aria-label="Cài đặt hồ sơ"><Settings size={16}/></button></div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
            <button className="icon-btn mobile-menu" aria-label="Mở menu" onClick={() => setMobileNav(v=>!v)}><Menu size={19}/></button>
            <div><div className="eyebrow">CHỦ NHẬT, 25 THÁNG 10, 2026</div><h1>{activeTitle}</h1><div className="subtle" style={{marginTop:8}}>{activeSubtitle}</div></div>
          </div>
          <div className="top-actions"><button className="icon-btn" title="Trợ lý AI" onClick={() => setTab("Trợ lý AI")}><Bot size={18}/></button><button className="btn btn-primary" onClick={() => setTab("Lộ trình học")}><Plus size={16}/> <span className="hide-mobile">Kế hoạch học</span></button></div>
        </header>

        {mobileNav && <div className="panel" style={{marginBottom:18,display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>{navItems.map(item=><button key={item.label} className={`nav-item ${tab===item.label?"active":""}`} onClick={()=>{setTab(item.label);setMobileNav(false)}}>{<item.icon size={17}/>} {item.label}</button>)}</div>}
        {notice && <div className={`toast ${noticeError ? "error" : ""}`}>{notice}</div>}

        {tab === "Tổng quan" && <Dashboard profile={profile} tasks={tasks} doneCount={doneCount} completion={completion} onToggle={toggleTask} onTab={setTab} onAddTask={addTask}/>}
        {tab === "Lộ trình học" && <LearningPath tasks={tasks} onToggle={toggleTask} onAddTask={addTask} completion={completion}/>}
        {tab === "Trợ lý AI" && <Assistant messages={messages} input={input} setInput={setInput} loading={loading} onSend={sendMessage} onClear={() => {setMessages([{id:crypto.randomUUID(),role:"assistant",content:"Cuộc hội thoại mới đã bắt đầu. Bạn muốn học gì hôm nay?"}]);flash("Đã tạo cuộc hội thoại mới.")}}/>}
        {tab === "Kiểm tra kiến thức" && <Quiz started={quizStarted} setStarted={setQuizStarted} answer={quizAnswer} setAnswer={setQuizAnswer} result={quizResult} setResult={setQuizResult}/>}
        {tab === "Tài liệu" && <Resources resources={resources} name={resourceName} setName={setResourceName} onAdd={() => {if(!resourceName.trim())return;setResources(r=>[...r,resourceName.trim()]);setResourceName("");flash("Đã thêm tài liệu vào danh sách demo.")}} onDelete={(name)=>setResources(r=>r.filter(x=>x!==name))}/>}
        {tab === "Tiến độ" && <Progress tasks={tasks} doneCount={doneCount} completion={completion}/>}
        {tab === "Hồ sơ" && <Profile profile={profile} setProfile={setProfile} onSave={() => flash("Đã lưu hồ sơ trên trình duyệt hiện tại.")}/>}
        <div className="footer-note">StudyFlow AI · Bản MVP khởi đầu · Dữ liệu demo được lưu trong trình duyệt này. Hãy cấu hình backend và xác thực trước khi sử dụng với dữ liệu cá nhân thật.</div>
      </main>
    </div>
  );
}

function Dashboard({profile,tasks,doneCount,completion,onToggle,onTab,onAddTask}:{profile:StudyProfile;tasks:Task[];doneCount:number;completion:number;onToggle:(id:string)=>void;onTab:(tab:Tab)=>void;onAddTask:()=>void}) {
  const todayTasks = tasks.filter(t=>t.day==="Hôm nay");
  const todayDone = todayTasks.filter(t=>t.done).length;
  return <>
    <section className="hero">
      <div className="hero-copy"><div style={{fontSize:11,fontWeight:800,letterSpacing:1.4,color:"#dfe5ff"}}>KẾ HOẠCH CỦA BẠN</div><h2>Chinh phục mục tiêu,<br/>theo cách của riêng bạn.</h2><p>{profile.goal || "Hãy thiết lập mục tiêu học tập để bắt đầu."} — mỗi ngày chỉ cần tiến bộ một chút.</p><button className="btn" onClick={()=>onTab("Lộ trình học")}>Tiếp tục học <ArrowRight size={16}/></button></div>
      <div className="hero-illustration"><BrainCircuit size={76} strokeWidth={1.25}/></div>
    </section>
    <div className="grid stats-grid">
      <Stat icon={Target} label="Nhiệm vụ hoàn thành" value={`${doneCount}/${tasks.length}`} foot={`${completion}% tổng tiến độ`} tint="#edf0ff" color="#536be9"/>
      <Stat icon={Clock3} label="Thời gian mục tiêu/ngày" value={`${profile.minutesPerDay} phút`} foot="Theo hồ sơ học tập" tint="#e2f8ef" color="#24a578"/>
      <Stat icon={Flame} label="Chuỗi ngày học" value="3 ngày" foot="Số liệu minh họa" tint="#fff1df" color="#d58a31"/>
      <Stat icon={Award} label="Điểm gần nhất" value="8.8/10" foot="Số liệu minh họa" tint="#f2eaff" color="#9561d9"/>
    </div>
    <div className="grid dashboard-grid">
      <section className="panel">
        <div className="section-head"><div><h2>Tiến độ học tập</h2><div className="subtle" style={{fontSize:11,marginTop:5}}>Thời lượng học trong tuần · dữ liệu minh họa</div></div><button className="btn btn-light" style={{padding:"8px 10px",fontSize:11}} onClick={()=>onTab("Tiến độ")}>Chi tiết <ArrowRight size={14}/></button></div>
        <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{top:5,right:5,left:-22,bottom:0}}><defs><linearGradient id="studyGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6379f5" stopOpacity={0.24}/><stop offset="95%" stopColor="#6379f5" stopOpacity={0.01}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0f6"/><XAxis dataKey="day" tickLine={false} axisLine={false} tick={{fontSize:11,fill:"#8994aa"}}/><YAxis tickLine={false} axisLine={false} tick={{fontSize:10,fill:"#8994aa"}}/><Tooltip contentStyle={{borderRadius:12,border:"1px solid #e5ebf5",fontSize:12}}/><Area type="monotone" dataKey="hours" name="Giờ học" stroke="#536be9" strokeWidth={2.5} fill="url(#studyGradient)"/></AreaChart></ResponsiveContainer></div>
      </section>
      <section className="panel">
        <div className="section-head"><div><h2>Nhiệm vụ hôm nay</h2><div className="subtle" style={{fontSize:11,marginTop:5}}>{todayDone}/{todayTasks.length} nhiệm vụ hoàn thành</div></div><button className="icon-btn" style={{height:33,width:33}} onClick={onAddTask} aria-label="Thêm nhiệm vụ"><Plus size={17}/></button></div>
        {todayTasks.length===0 && <div className="empty-state">Chưa có nhiệm vụ hôm nay. Hãy thêm một nhiệm vụ mới.</div>}
        {todayTasks.map(t=><div className="plan-card" key={t.id}><button onClick={()=>onToggle(t.id)} aria-label={t.done?"Đánh dấu chưa hoàn thành":"Đánh dấu hoàn thành"} style={{border:0,background:t.done?"#e0f7ee":"#fff",borderRadius:10,width:28,height:28,display:"grid",placeItems:"center",color:t.done?"#15996a":"#a0abc0",flexShrink:0,alignSelf:"flex-start",outline:"1px solid #e5ebf5"}}>{t.done&&<Check size={15}/>}</button><div style={{flex:1,minWidth:0}}><div style={{fontWeight:700,fontSize:12,textDecoration:t.done?"line-through":"none",color:t.done?"#9aa5b8":"#253552"}}>{t.title}</div><div className="subtle" style={{fontSize:10,marginTop:6}}>{t.subject} · {t.minutes} phút</div></div></div>)}
        <button className="btn btn-light" style={{width:"100%",marginTop:15}} onClick={()=>onTab("Lộ trình học")}>Xem toàn bộ kế hoạch <ArrowRight size={15}/></button>
      </section>
    </div>
    <section className="panel" style={{marginTop:18}}>
      <div className="section-head"><div><h2>Gợi ý dành cho bạn</h2><div className="subtle" style={{fontSize:11,marginTop:5}}>Bắt đầu từ hành động nhỏ tiếp theo</div></div><Sparkles size={19} color="#6c7df1"/></div>
      <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:12}}>
        <Suggestion icon={Bot} title="Hỏi AI giải thích" text="Tìm hiểu một khái niệm đang khiến bạn bối rối." action="Mở trợ lý AI" onClick={()=>onTab("Trợ lý AI")}/>
        <Suggestion icon={ListChecks} title="Kiểm tra kiến thức" text="Làm bài trắc nghiệm ngắn để tự đánh giá." action="Làm bài kiểm tra" onClick={()=>onTab("Kiểm tra kiến thức")}/>
        <Suggestion icon={CalendarDays} title="Cập nhật lộ trình" text="Chia mục tiêu lớn thành nhiệm vụ nhỏ dễ làm." action="Xem lộ trình" onClick={()=>onTab("Lộ trình học")}/>
      </div>
    </section>
  </>;
}

function Stat({icon:Icon,label,value,foot,tint,color}:{icon:typeof Target;label:string;value:string;foot:string;tint:string;color:string}) {
  return <div className="stat-card"><div className="stat-top"><span>{label}</span><span className="stat-icon" style={{background:tint,color}}><Icon size={18}/></span></div><div className="stat-value">{value}</div><div className="stat-foot">{foot}</div></div>;
}
function Suggestion({icon:Icon,title,text,action,onClick}:{icon:typeof Bot;title:string;text:string;action:string;onClick:()=>void}) {
  return <div style={{padding:15,border:"1px solid #edf0f6",borderRadius:14}}><div style={{height:36,width:36,borderRadius:11,background:"#eef1ff",color:"#536be9",display:"grid",placeItems:"center",marginBottom:12}}><Icon size={18}/></div><h3>{title}</h3><p className="subtle" style={{fontSize:11,minHeight:36}}>{text}</p><button onClick={onClick} className="btn btn-light" style={{fontSize:11,padding:"8px 10px"}}>{action} <ArrowRight size={13}/></button></div>;
}

function LearningPath({tasks,onToggle,onAddTask,completion}:{tasks:Task[];onToggle:(id:string)=>void;onAddTask:()=>void;completion:number}) {
  return <div className="grid page-grid"><section className="panel"><div className="section-head"><div><h2>Lộ trình học của bạn</h2><p className="subtle" style={{fontSize:12}}>Chia mục tiêu thành những bước nhỏ có thể hoàn thành.</p></div><button className="btn btn-primary" onClick={onAddTask}><Plus size={15}/> Thêm nhiệm vụ</button></div><div style={{marginBottom:22}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:12,fontWeight:700}}><span>Tiến độ tổng thể</span><span>{completion}%</span></div><div className="progress"><span style={{width:`${completion}%`}}/></div></div>{["Hôm nay","Ngày mai"].map(day=><div key={day} style={{marginBottom:22}}><div className="nav-label" style={{padding:0}}>{day}</div>{tasks.filter(t=>t.day===day).map(t=><div className="plan-card" key={t.id}><button onClick={()=>onToggle(t.id)} style={{border:"1px solid #e5ebf5",background:t.done?"#e0f7ee":"#fff",color:t.done?"#15996a":"#a0abc0",width:28,height:28,borderRadius:9,display:"grid",placeItems:"center"}}>{t.done&&<Check size={15}/>}</button><div style={{flex:1}}><div style={{fontWeight:700,textDecoration:t.done?"line-through":"none"}}>{t.title}</div><div className="subtle" style={{fontSize:11,marginTop:5}}>{t.subject} · {t.minutes} phút</div></div><span className="pill">{t.done?"Hoàn thành":"Cần học"}</span></div>)}</div>)}</section><aside className="panel"><div className="section-head"><h2>Nguyên tắc học hiệu quả</h2><BrainCircuit color="#536be9"/></div>{[{n:"01",t:"Học chủ động",d:"Tự trả lời câu hỏi trước khi xem lời giải."},{n:"02",t:"Ôn tập ngắt quãng",d:"Quay lại kiến thức sau 1 ngày, 3 ngày và 1 tuần."},{n:"03",t:"Theo dõi lỗi sai",d:"Ghi lại lý do sai để tránh lặp lại."},{n:"04",t:"Giữ mục tiêu vừa sức",d:"Chia phiên học thành khoảng 25–30 phút."}].map(x=><div className="plan-card" key={x.n}><div className="plan-icon" style={{background:"#eef1ff",color:"#536be9",fontWeight:800}}>{x.n}</div><div><h3>{x.t}</h3><p className="subtle" style={{fontSize:11,margin:"6px 0 0"}}>{x.d}</p></div></div>)}</aside></div>;
}

function Assistant({messages,input,setInput,loading,onSend,onClear}:{messages:Message[];input:string;setInput:(s:string)=>void;loading:boolean;onSend:(e:FormEvent)=>void;onClear:()=>void}) {
  return <div className="grid page-grid"><section className="panel"><div className="section-head"><div style={{display:"flex",alignItems:"center",gap:11}}><div className="stat-icon" style={{background:"#edf0ff",color:"#536be9",width:43,height:43}}><Bot size={22}/></div><div><h2>StudyFlow AI</h2><div className="subtle" style={{fontSize:11,marginTop:4}}>Trợ lý học tập · Phản hồi bằng tiếng Việt</div></div></div><button className="btn btn-outline" onClick={onClear}><Plus size={14}/> Cuộc trò chuyện mới</button></div><div className="chat-box">{messages.map(m=><div className={`chat-bubble ${m.role}`} key={m.id}>{m.content}</div>)}{loading&&<div className="chat-bubble assistant"><span className="subtle">AI đang suy nghĩ…</span></div>}</div><form className="chat-form" onSubmit={onSend}><input className="chat-input" value={input} onChange={e=>setInput(e.target.value)} placeholder="Hỏi mình một điều bạn muốn hiểu rõ hơn…" maxLength={8000}/><button className="btn btn-primary" disabled={loading||!input.trim()} aria-label="Gửi tin nhắn"><Send size={17}/></button></form><div className="subtle" style={{fontSize:10,marginTop:10}}>Không nhập mật khẩu, dữ liệu nhạy cảm hoặc thông tin cá nhân không cần thiết.</div></section><aside className="panel"><h2>Gợi ý câu hỏi</h2><p className="subtle" style={{fontSize:12}}>Chọn một gợi ý để bắt đầu nhanh.</p>{["Giải thích cây AVL bằng ví dụ dễ hiểu","Tạo 5 câu trắc nghiệm về SQL JOIN","Lập kế hoạch ôn Toán rời rạc trong 7 ngày","Hãy giúp mình tìm lỗ hổng kiến thức"].map(q=><button key={q} className="resource-row" style={{width:"100%",textAlign:"left",background:"transparent",borderLeft:0,borderRight:0,borderTop:0,color:"#536be9",fontWeight:600,fontSize:12}} onClick={()=>setInput(q)}><Sparkles size={16}/><span style={{flex:1}}>{q}</span><ArrowRight size={14}/></button>)}<div style={{padding:14,background:"#f4f6ff",borderRadius:13,marginTop:18}}><h3 style={{display:"flex",alignItems:"center",gap:8}}><CircleHelp size={16} color="#536be9"/> Mẹo hỏi AI</h3><p className="subtle" style={{fontSize:11,marginBottom:0}}>Nêu môn học, trình độ hiện tại và dạng ví dụ bạn muốn. AI sẽ có thêm ngữ cảnh để hướng dẫn phù hợp hơn.</p></div></aside></div>;
}

function Quiz({started,setStarted,answer,setAnswer,result,setResult}:{started:boolean;setStarted:(v:boolean)=>void;answer:string;setAnswer:(v:string)=>void;result:boolean;setResult:(v:boolean)=>void}) {
  const options=[{v:"A",text:"Mỗi nút có tối đa hai nút con"},{v:"B",text:"Mọi nút đều có đúng hai nút con"},{v:"C",text:"Các nút luôn được lưu theo thứ tự tăng dần trong bộ nhớ"},{v:"D",text:"Cây nhị phân không thể rỗng"}];
  return <div className="grid page-grid"><section className="panel"><div className="section-head"><div><h2>Kiểm tra kiến thức</h2><p className="subtle" style={{fontSize:12}}>Bài mẫu · Cấu trúc dữ liệu</p></div><span className="pill">Cơ bản</span></div>{!started?<div className="empty-state"><div className="stat-icon" style={{margin:"0 auto 15px",width:56,height:56,background:"#eef1ff",color:"#536be9"}}><ListChecks size={25}/></div><h2>Bạn đã sẵn sàng?</h2><p className="subtle">Bài kiểm tra minh họa gồm 1 câu trắc nghiệm về cây nhị phân.</p><button className="btn btn-primary" onClick={()=>{setStarted(true);setResult(false);setAnswer("")}}>Bắt đầu kiểm tra <ArrowRight size={15}/></button></div>:<><div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#8994aa",marginBottom:16}}><span>Câu 1 / 1</span><span><Clock3 size={13} style={{display:"inline",verticalAlign:"middle"}}/> Không giới hạn thời gian</span></div><h3 style={{fontSize:16,lineHeight:1.7,marginBottom:18}}>Đặc điểm cơ bản của cây nhị phân là gì?</h3>{options.map(o=><button key={o.v} onClick={()=>{setAnswer(o.v);setResult(false)}} style={{width:"100%",display:"flex",alignItems:"center",gap:12,textAlign:"left",padding:14,border:`1px solid ${answer===o.v?"#6379f5":"#e5ebf5"}`,background:answer===o.v?"#f0f3ff":"#fff",borderRadius:12,marginBottom:9,color:"#253552"}}><span style={{width:28,height:28,display:"grid",placeItems:"center",borderRadius:8,background:answer===o.v?"#536be9":"#f2f4f9",color:answer===o.v?"#fff":"#73809a",fontWeight:800}}>{o.v}</span>{o.text}</button>)}{result&&<div className={`toast ${answer!=="A"?"error":""}`} style={{marginTop:14}}>{answer==="A"?"Chính xác! Mỗi nút trong cây nhị phân có tối đa hai nút con.":"Chưa chính xác. Đáp án đúng là A: mỗi nút có tối đa hai nút con."}<div style={{fontWeight:400,marginTop:5}}>Đây là câu hỏi mẫu tĩnh, chưa được lưu vào hệ thống chấm điểm.</div></div>}<div style={{display:"flex",gap:10,marginTop:18}}><button className="btn btn-primary" disabled={!answer} onClick={()=>setResult(true)}>Nộp bài</button><button className="btn btn-outline" onClick={()=>{setAnswer("");setResult(false);setStarted(false)}}>Kết thúc</button></div></>}</section><aside className="panel"><h2>Chủ đề gợi ý</h2>{["Cấu trúc dữ liệu","Cơ sở dữ liệu","Toán rời rạc","Lập trình hướng đối tượng"].map((s,i)=><div className="resource-row" key={s}><div className="plan-icon" style={{background:["#edf0ff","#e2f8ef","#fff1df","#f2eaff"][i],color:["#536be9","#24a578","#d58a31","#9561d9"][i]}}><BookOpen size={17}/></div><div style={{flex:1,fontWeight:700,fontSize:12}}>{s}</div><ArrowRight size={15} color="#9aa5b8"/></div>)}<p className="subtle" style={{fontSize:11}}>Bản MVP hiện có một câu hỏi minh họa. Cần kết nối database và xây dựng ngân hàng câu hỏi để sử dụng ở quy mô thực tế.</p></aside></div>;
}

function Resources({resources,name,setName,onAdd,onDelete}:{resources:string[];name:string;setName:(s:string)=>void;onAdd:()=>void;onDelete:(s:string)=>void}) {
  return <div className="grid page-grid"><section className="panel"><div className="section-head"><div><h2>Thư viện tài liệu</h2><p className="subtle" style={{fontSize:12}}>Quản lý danh sách tài liệu học tập của bạn.</p></div><FileText size={20} color="#536be9"/></div><form onSubmit={e=>{e.preventDefault();onAdd()}} style={{display:"flex",gap:9,marginBottom:18}}><input className="chat-input" value={name} onChange={e=>setName(e.target.value)} placeholder="Tên tài liệu hoặc đường dẫn tham khảo…"/><button className="btn btn-primary" type="submit"><Plus size={15}/> Thêm</button></form>{resources.length===0?<div className="empty-state"><FileText size={34} style={{margin:"0 auto 12px",opacity:.5}}/><h3>Chưa có tài liệu</h3><p>Thêm tên tài liệu để tổ chức danh sách học tập.</p></div>:resources.map(r=><div className="resource-row" key={r}><div className="plan-icon" style={{background:"#eef1ff",color:"#536be9"}}><FileText size={18}/></div><div style={{flex:1,fontWeight:700}}>{r}</div><button className="icon-btn" style={{width:32,height:32}} onClick={()=>onDelete(r)} aria-label={`Xóa ${r}`}><X size={15}/></button></div>)}</section><aside className="panel"><h2>Học từ tài liệu</h2><p className="subtle">Trong bản khởi đầu này, thư viện chỉ lưu danh sách tên tài liệu trên trình duyệt. Tải PDF, trích xuất nội dung, tìm kiếm ngữ nghĩa và trích dẫn theo trang cần được triển khai ở backend.</p><div style={{padding:14,background:"#fff8e8",borderRadius:12,color:"#8b641f",fontSize:11,lineHeight:1.7}}>Không tải tài liệu nhạy cảm lên môi trường demo. Chưa có file upload hoặc lưu trữ cloud trong phiên bản này.</div></aside></div>;
}

function Progress({tasks,doneCount,completion}:{tasks:Task[];doneCount:number;completion:number}) {
  return <><div className="grid stats-grid"><Stat icon={CheckCircle2} label="Nhiệm vụ hoàn thành" value={`${doneCount}`} foot="Trong danh sách hiện tại" tint="#e2f8ef" color="#24a578"/><Stat icon={Target} label="Tỷ lệ hoàn thành" value={`${completion}%`} foot="Tính từ nhiệm vụ đã lưu" tint="#edf0ff" color="#536be9"/><Stat icon={Clock3} label="Thời lượng dự kiến" value={`${tasks.filter(t=>t.done).reduce((a,t)=>a+t.minutes,0)} phút`} foot="Từ nhiệm vụ đã hoàn thành" tint="#fff1df" color="#d58a31"/><Stat icon={Trophy} label="Mục tiêu đang theo dõi" value="1" foot="Số liệu minh họa" tint="#f2eaff" color="#9561d9"/></div><div className="grid dashboard-grid"><section className="panel"><h2>Thời lượng học trong tuần</h2><p className="subtle" style={{fontSize:11}}>Biểu đồ mẫu — chưa phải dữ liệu được ghi nhận từ phiên học thật.</p><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0f6"/><XAxis dataKey="day" tickLine={false} axisLine={false}/><YAxis tickLine={false} axisLine={false}/><Tooltip/><Area type="monotone" dataKey="hours" stroke="#536be9" fill="#e8ecff" name="Giờ học"/></AreaChart></ResponsiveContainer></div></section><section className="panel"><h2>Danh sách nhiệm vụ</h2>{tasks.map(t=><div className="resource-row" key={t.id}><div style={{width:9,height:9,borderRadius:9,background:t.done?"#24a578":"#e5ad53"}}/><div style={{flex:1}}><div style={{fontWeight:700,fontSize:12}}>{t.title}</div><div className="subtle" style={{fontSize:10}}>{t.subject}</div></div><span className="pill">{t.done?"Xong":`${t.minutes} phút`}</span></div>)}</section></div></>;
}

function Profile({profile,setProfile,onSave}:{profile:StudyProfile;setProfile:React.Dispatch<React.SetStateAction<StudyProfile>>;onSave:()=>void}) {
  function update<K extends keyof StudyProfile>(key:K,value:StudyProfile[K]){setProfile(p=>({...p,[key]:value}));}
  return <div className="grid page-grid"><section className="panel"><div className="section-head"><div><h2>Hồ sơ học tập</h2><p className="subtle" style={{fontSize:12}}>Tùy chỉnh để nhận gợi ý phù hợp hơn.</p></div><UserRound color="#536be9"/></div><div className="field"><label>Họ tên hiển thị</label><input value={profile.name} onChange={e=>update("name",e.target.value)} maxLength={100}/></div><div className="field"><label>Trường đại học</label><input value={profile.school} onChange={e=>update("school",e.target.value)} maxLength={150}/></div><div className="field"><label>Ngành học</label><input value={profile.major} onChange={e=>update("major",e.target.value)} maxLength={150}/></div><div className="field"><label>Năm học</label><select value={profile.year} onChange={e=>update("year",e.target.value)}>{["Năm 1","Năm 2","Năm 3","Năm 4","Khác"].map(x=><option key={x}>{x}</option>)}</select></div><div className="field"><label>Mục tiêu học tập</label><textarea value={profile.goal} onChange={e=>update("goal",e.target.value)} maxLength={500}/></div><div className="field"><label>Thời gian học mỗi ngày (phút)</label><input type="number" min={5} max={720} value={profile.minutesPerDay} onChange={e=>update("minutesPerDay",Math.min(720,Math.max(5,Number(e.target.value)||5)))}/></div><div className="field"><label>Môn học quan tâm (phân cách bằng dấu phẩy)</label><input value={profile.subjects.join(", ")} onChange={e=>update("subjects",e.target.value.split(",").map(s=>s.trim()).filter(Boolean).slice(0,20))}/></div><button className="btn btn-primary" onClick={onSave}><Check size={16}/> Lưu hồ sơ</button><p className="subtle" style={{fontSize:11}}>Bản hiện tại lưu hồ sơ trong localStorage của trình duyệt. Chưa có tài khoản hoặc đồng bộ dữ liệu giữa thiết bị.</p></section><aside className="panel"><div className="avatar" style={{width:64,height:64,borderRadius:20,fontSize:24,marginBottom:14}}>{profile.name.slice(0,1).toUpperCase()||"S"}</div><h2>{profile.name}</h2><p className="subtle">{profile.major} · {profile.year}</p><div className="resource-row"><GraduationCap size={18} color="#536be9"/><span>{profile.school}</span></div><div className="resource-row"><Target size={18} color="#24a578"/><span>{profile.goal}</span></div><div className="resource-row"><AlarmClock size={18} color="#d58a31"/><span>{profile.minutesPerDay} phút học/ngày</span></div></aside></div>;
}
