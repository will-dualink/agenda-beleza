
import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import { StorageService } from '../../services/storage';
import { Appointment, AppointmentStatus, Service, Professional } from '../../types';
import { Clock, GripHorizontal, List, Columns, Ban, X, User, CheckCircle2, Briefcase } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

// Timeline Constants
const START_HOUR = 8;
const END_HOUR = 20;
const PIXELS_PER_HOUR = 120; // 2px per minute
const PIXELS_PER_MINUTE = PIXELS_PER_HOUR / 60;
const SLOT_SNAP = 15; // minutes

const Schedule: React.FC = () => {
  const { addToast } = useToast();
  const [viewMode, setViewMode] = useState<'LIST' | 'TIMELINE'>('TIMELINE');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [pros, setPros] = useState<Professional[]>([]);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterProId, setFilterProId] = useState<string>(''); // Empty = All

  // Block Modal State
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockReason, setBlockReason] = useState('Almoço');
  const [blockStart, setBlockStart] = useState('12:00');
  const [blockEnd, setBlockEnd] = useState('13:00');
  const [blockProId, setBlockProId] = useState('');

  // Resize State
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<{startY: number, startDuration: number, appId: string} | null>(null);

  // Drag (Move) State
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{startX: number, startY: number, appId: string, startMinutes: number, originalProId: string} | null>(null);
  const [dragGhost, setDragGhost] = useState<{top: number, left: number, width: number, height: number, appId: string} | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setAppointments(StorageService.getAppointments());
    setServices(StorageService.getServices());
    setPros(StorageService.getProfessionals());
  };

  const filtered = appointments.filter(a => 
      a.date === filterDate && 
      (filterProId === '' || a.professionalId === filterProId)
  ).sort((a, b) => a.time.localeCompare(b.time));

  // Calculate Visible Professionals based on filter
  const visiblePros = filterProId 
      ? pros.filter(p => p.id === filterProId) 
      : pros;

  // Stats for the selected pro (or summary for all)
  const stats = React.useMemo(() => {
      const activeApps = filtered.filter(a => a.status !== AppointmentStatus.CANCELLED);
      const totalMinutes = activeApps.reduce((acc, curr) => {
          const s = services.find(serv => serv.id === curr.serviceId);
          const dur = curr.customDuration || ((s?.durationMinutes || 60) + (s?.bufferMinutes || 0));
          return acc + dur;
      }, 0);
      
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      
      return {
          count: activeApps.length,
          durationLabel: `${hours}h ${mins > 0 ? `${mins}m` : ''}`
      };
  }, [filtered, services]);

  const getServiceName = (id: string, isBlock: boolean) => {
      if (isBlock) return 'BLOQUEIO';
      return services.find(s => s.id === id)?.name || 'Serviço';
  };
  const getProName = (id: string) => pros.find(p => p.id === id)?.name || 'Profissional';

  // --- Helper for Time Calculations ---
  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const minutesToTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const getDuration = (app: Appointment) => {
    if (app.customDuration) return app.customDuration;
    const service = services.find(s => s.id === app.serviceId);
    return (service?.durationMinutes || 60) + (service?.bufferMinutes || 0);
  };

  // --- RESIZE LOGIC ---
  const startResize = (e: React.MouseEvent, app: Appointment) => {
      e.stopPropagation();
      e.preventDefault();
      resizeRef.current = {
          startY: e.clientY,
          startDuration: getDuration(app),
          appId: app.id
      };
      setIsResizing(true);
      document.addEventListener('mousemove', onResizeMove);
      document.addEventListener('mouseup', onResizeUp);
  };

  const onResizeMove = (e: MouseEvent) => {
      if (!resizeRef.current) return;
      const { startY, startDuration } = resizeRef.current;
      const deltaY = e.clientY - startY;
      const deltaMinutes = deltaY / PIXELS_PER_MINUTE;
      const snappedDelta = Math.round(deltaMinutes / SLOT_SNAP) * SLOT_SNAP;
      const newDuration = Math.max(15, startDuration + snappedDelta);
      
      setAppointments(prev => prev.map(a => 
         a.id === resizeRef.current?.appId ? { ...a, customDuration: newDuration } : a
      ));
  };

  const onResizeUp = () => {
      if (resizeRef.current) {
         const app = appointments.find(a => a.id === resizeRef.current?.appId);
         if (app && app.customDuration) {
             StorageService.updateAppointmentDuration(app.id, app.customDuration);
             addToast('Duração atualizada');
         }
      }
      resizeRef.current = null;
      setIsResizing(false);
      document.removeEventListener('mousemove', onResizeMove);
      document.removeEventListener('mouseup', onResizeUp);
  };

  // --- DRAG (MOVE) LOGIC ---
  const startDrag = (e: React.MouseEvent, app: Appointment) => {
      if (isResizing) return;
      // Only drag on left click
      if (e.button !== 0) return;
      
      e.preventDefault();
      
      const currentTarget = e.currentTarget as HTMLElement;
      const rect = currentTarget.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();

      if (!containerRect) return;

      dragRef.current = {
          startX: e.clientX,
          startY: e.clientY,
          appId: app.id,
          startMinutes: timeToMinutes(app.time),
          originalProId: app.professionalId
      };
      
      setDragGhost({
          top: rect.top - containerRect.top, // Relative to container
          left: rect.left - containerRect.left,
          width: rect.width,
          height: rect.height,
          appId: app.id
      });
      
      setIsDragging(true);
      document.addEventListener('mousemove', onDragMove);
      document.addEventListener('mouseup', onDragUp);
  };

  const onDragMove = (e: MouseEvent) => {
      if (!dragRef.current || !containerRef.current || !dragGhost) return;
      
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;
      
      setDragGhost(prev => prev ? ({
          ...prev,
          top: prev.top + deltaY,
          left: prev.left + deltaX
      }) : null);
  };

  const onDragUp = (e: MouseEvent) => {
      if (dragRef.current && containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          const relativeY = e.clientY - containerRect.top;
          const relativeX = e.clientX - containerRect.left;

          // Calculate new Time
          const minutesFromStart = relativeY / PIXELS_PER_MINUTE;
          let newStartMinutes = (START_HOUR * 60) + minutesFromStart;
          newStartMinutes = Math.round(newStartMinutes / SLOT_SNAP) * SLOT_SNAP;

          // Clamping
          const maxMinutes = (END_HOUR * 60) - 15;
          const minMinutes = START_HOUR * 60;
          if (newStartMinutes < minMinutes) newStartMinutes = minMinutes;
          if (newStartMinutes > maxMinutes) newStartMinutes = maxMinutes;

          // Calculate new Professional based on VISIBLE COLUMNS
          // 64px is the left sidebar width
          const colWidth = (containerRect.width - 64) / visiblePros.length;
          const colIndex = Math.floor((relativeX - 64) / colWidth);
          
          let newProId = dragRef.current.originalProId;
          
          if (colIndex >= 0 && colIndex < visiblePros.length) {
              newProId = visiblePros[colIndex].id;
          }

          const newTime = minutesToTime(newStartMinutes);

          // Update DB
          StorageService.moveAppointment(dragRef.current.appId, filterDate, newTime, newProId);
          addToast(`Agendamento movido para ${newTime} - ${pros.find(p => p.id === newProId)?.name}`);
      }

      setIsDragging(false);
      setDragGhost(null);
      dragRef.current = null;
      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup', onDragUp);
      refreshData();
  };


  // --- BLOCK LOGIC ---
  const handleCreateBlock = () => {
     if (!blockProId) {
         addToast('Selecione um profissional', 'error');
         return;
     }
     const startM = timeToMinutes(blockStart);
     const endM = timeToMinutes(blockEnd);
     const duration = endM - startM;
     
     if (duration <= 0) {
         addToast('Horário final deve ser maior que inicial', 'error');
         return;
     }

     StorageService.addBlock(filterDate, blockStart, duration, blockProId, blockReason);
     addToast('Bloqueio criado com sucesso');
     setIsBlockModalOpen(false);
     refreshData();
  };

  return (
    <Layout title="Agenda Operacional" isAdmin showBack>
      {/* Top Toolbar */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-4 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto items-center">
             
             {/* Date Picker */}
             <div className="relative group">
                <input 
                  type="date" 
                  value={filterDate} 
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-slate-200 cursor-pointer" 
                />
                <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-rose-500 transition-colors pointer-events-none"/>
            </div>
            
            {/* Professional Filter */}
            <div className="relative group w-full sm:w-64">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-rose-500 transition-colors pointer-events-none"/>
                <select 
                   value={filterProId}
                   onChange={(e) => setFilterProId(e.target.value)}
                   className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-slate-200 appearance-none cursor-pointer"
                >
                    <option value="">Todos os Profissionais</option>
                    {pros.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none border-l pl-2 border-slate-200">
                    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-slate-400"></div>
                </div>
            </div>

            <button 
               onClick={() => setIsBlockModalOpen(true)}
               className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-slate-800 transition shadow-lg shrink-0"
            >
               <Ban size={14} /> Bloquear Horário
            </button>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg shrink-0">
             <button 
                onClick={() => setViewMode('TIMELINE')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold transition ${viewMode === 'TIMELINE' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
             >
                <Columns size={16} /> Timeline
             </button>
             <button 
                onClick={() => setViewMode('LIST')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold transition ${viewMode === 'LIST' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
             >
                <List size={16} /> Lista
             </button>
          </div>
      </div>

      {/* Stats Summary Bar (Visible when filtered or just to show daily stats) */}
      <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
         {filterProId && (
             <div className="bg-rose-50 border border-rose-100 px-4 py-2 rounded-lg flex items-center gap-3 animate-fade-in text-sm">
                 <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">
                     <User size={16} />
                 </div>
                 <div>
                     <p className="text-xs text-rose-600 font-bold uppercase">Filtrando por</p>
                     <p className="font-bold text-rose-900">{getProName(filterProId)}</p>
                 </div>
                 <button onClick={() => setFilterProId('')} className="ml-2 text-rose-400 hover:text-rose-700"><X size={16}/></button>
             </div>
         )}
         
         <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg flex items-center gap-3 text-sm min-w-[160px]">
             <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                 <CheckCircle2 size={16} />
             </div>
             <div>
                 <p className="text-xs text-slate-400 font-bold uppercase">Agendamentos</p>
                 <p className="font-bold text-slate-900">{stats.count} clientes</p>
             </div>
         </div>

         <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg flex items-center gap-3 text-sm min-w-[160px]">
             <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                 <Clock size={16} />
             </div>
             <div>
                 <p className="text-xs text-slate-400 font-bold uppercase">Ocupação Estimada</p>
                 <p className="font-bold text-slate-900">{stats.durationLabel}</p>
             </div>
         </div>
      </div>

      {viewMode === 'LIST' ? (
        <div className="space-y-3">
            {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                <p>Nenhum agendamento encontrado para o filtro selecionado.</p>
            </div>
            ) : (
            filtered.map(app => (
                <div key={app.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden group hover:border-rose-200 transition-colors">
                    {app.status === AppointmentStatus.CANCELLED && (
                        <div className="absolute inset-0 bg-slate-50/80 flex items-center justify-center z-10 backdrop-blur-[1px]">
                        <span className="font-bold text-slate-400 border-2 border-slate-300 px-4 py-1 rounded-full transform -rotate-12">CANCELADO</span>
                        </div>
                    )}
                    {app.status === AppointmentStatus.BLOCKED && (
                        <div className="absolute top-0 right-0 p-2 bg-slate-100 rounded-bl-lg">
                            <Ban className="text-slate-400" size={16} />
                        </div>
                    )}
                    <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center font-bold leading-none shrink-0 ${app.status === AppointmentStatus.BLOCKED ? 'bg-slate-100 text-slate-500' : 'bg-rose-50 text-rose-600'}`}>
                            <span className="text-sm">{app.time}</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg leading-tight">{app.clientName}</h3>
                            <p className="text-sm text-slate-600 font-medium">{getServiceName(app.serviceId, app.status === AppointmentStatus.BLOCKED)}</p>
                            
                            {/* Hide Professional Name if already filtering by them (cleaner UI) */}
                            {!filterProId && (
                                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 bg-slate-50 inline-flex px-2 py-0.5 rounded">
                                    <User size={10} />
                                    {getProName(app.professionalId)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            ))
            )}
        </div>
      ) : (
        /* TIMELINE VIEW */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm relative overflow-x-auto select-none">
            <div className="min-w-[600px]" ref={containerRef}>
                {/* Header: Professionals */}
                <div className="flex border-b border-slate-200 sticky top-0 z-20 bg-white">
                    <div className="w-16 shrink-0 border-r border-slate-100 bg-slate-50 flex items-center justify-center">
                        <Clock size={16} className="text-slate-300"/>
                    </div>
                    {visiblePros.map(pro => (
                        <div key={pro.id} className="flex-1 py-3 px-2 text-center border-r border-slate-100 bg-white last:border-r-0">
                            <div className="flex items-center justify-center gap-2">
                                <img src={pro.avatarUrl} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm" alt=""/>
                                <div className="text-left">
                                    <span className="font-bold text-slate-800 text-sm block truncate leading-tight">{pro.name}</span>
                                    {filterProId && <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 rounded">Visualizando</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <div className="relative" style={{ height: (END_HOUR - START_HOUR) * PIXELS_PER_HOUR }}>
                    {/* Time Lines */}
                    {Array.from({ length: END_HOUR - START_HOUR }).map((_, i) => {
                        const hour = START_HOUR + i;
                        return (
                            <div key={hour} className="absolute w-full flex border-b border-slate-100" style={{ top: i * PIXELS_PER_HOUR, height: PIXELS_PER_HOUR }}>
                                <div className="w-16 shrink-0 border-r border-slate-100 text-[10px] text-slate-400 font-medium text-center pt-1 -mt-2 bg-white z-10">
                                    {hour}:00
                                </div>
                                {visiblePros.map(pro => (
                                    <div key={pro.id} className={`flex-1 border-r border-slate-100 last:border-r-0 h-full ${filterProId ? 'bg-slate-50/30' : ''}`}></div>
                                ))}
                            </div>
                        )
                    })}

                    {/* Appointments */}
                    {filtered.filter(a => a.status !== AppointmentStatus.CANCELLED).map(app => {
                        if (dragGhost?.appId === app.id) return null; // Hide original if dragging

                        const startMinutes = timeToMinutes(app.time);
                        const startOffset = startMinutes - (START_HOUR * 60);
                        const top = startOffset * PIXELS_PER_MINUTE;
                        const duration = getDuration(app);
                        const height = duration * PIXELS_PER_MINUTE;

                        // Find Column Index within VISIBLE pros
                        const proIndex = visiblePros.findIndex(p => p.id === app.professionalId);
                        
                        // If pro is filtered out, don't show appointment
                        if (proIndex === -1) return null;

                        const colWidth = `calc((100% - 64px) / ${visiblePros.length})`;
                        const left = `calc(64px + (${colWidth} * ${proIndex}))`;

                        const isBlock = app.status === AppointmentStatus.BLOCKED;

                        return (
                            <div 
                                key={app.id}
                                onMouseDown={(e) => startDrag(e, app)}
                                className={`absolute px-3 py-2 rounded-lg border shadow-sm text-xs transition-shadow overflow-hidden group z-10 cursor-move
                                    ${isBlock 
                                        ? 'bg-slate-100 border-slate-300 text-slate-500 bg-[url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0JyBoZWlnaHQ9JzQnPgo8cmVjdCB3aWR0aD0nNCcgaGVpZ2h0PSc0JyBmaWxsPScjZmZmJy8+CjxwYXRoIGQ9J00wIDBMNCA0Wk00IDBMMCA0Wicgc3Ryb2tlPSIjZTIeOCZjJyBzdHJva2Utd2lkdGg9JzEnLz4KPC9zdmc+")]' 
                                        : app.status === AppointmentStatus.CONFIRMED 
                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:border-emerald-300' 
                                            : 'bg-indigo-50 border-indigo-200 text-indigo-900 hover:border-indigo-300'
                                    }
                                    hover:shadow-md hover:z-20
                                `}
                                style={{
                                    top: `${top}px`,
                                    height: `${height}px`,
                                    left: left,
                                    width: colWidth,
                                    margin: '0 4px',
                                    maxWidth: 'calc(100% - 8px)'
                                }}
                            >
                                <div className="font-bold truncate text-sm">{app.clientName}</div>
                                <div className="truncate opacity-80 text-[10px] font-medium uppercase tracking-wide mt-0.5">{getServiceName(app.serviceId, isBlock)}</div>
                                
                                {/* Resize Handle */}
                                <div 
                                    className="absolute bottom-0 left-0 w-full h-3 cursor-ns-resize flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/5 hover:bg-rose-500/20 transition-all"
                                    onMouseDown={(e) => startResize(e, app)}
                                >
                                    <GripHorizontal size={12} className="text-slate-400" />
                                </div>
                            </div>
                        )
                    })}
                    
                    {/* Drag Ghost */}
                    {dragGhost && (
                        <div 
                           className="absolute rounded-lg border-2 border-dashed border-rose-400 bg-rose-50/50 z-50 pointer-events-none"
                           style={{
                               top: dragGhost.top,
                               left: dragGhost.left,
                               width: dragGhost.width,
                               height: dragGhost.height
                           }}
                        />
                    )}
                </div>
            </div>
        </div>
      )}

      {isBlockModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-fade-in-up">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-lg">Bloquear Horário</h3>
                     <button onClick={() => setIsBlockModalOpen(false)}><X size={20} className="text-slate-400"/></button>
                  </div>
                  
                  <div className="space-y-4">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Profissional</label>
                        <select 
                           className="w-full p-2 border rounded-lg"
                           value={blockProId}
                           onChange={e => setBlockProId(e.target.value)}
                        >
                            <option value="">Selecione...</option>
                            {pros.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Motivo</label>
                        <input 
                           className="w-full p-2 border rounded-lg" 
                           placeholder="Ex: Almoço, Médico"
                           value={blockReason}
                           onChange={e => setBlockReason(e.target.value)}
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Início</label>
                            <input type="time" className="w-full p-2 border rounded-lg" value={blockStart} onChange={e => setBlockStart(e.target.value)} />
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fim</label>
                            <input type="time" className="w-full p-2 border rounded-lg" value={blockEnd} onChange={e => setBlockEnd(e.target.value)} />
                         </div>
                     </div>
                  </div>

                  <button onClick={handleCreateBlock} className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition">
                      Confirmar Bloqueio
                  </button>
              </div>
          </div>
      )}
    </Layout>
  );
};

export default Schedule;
