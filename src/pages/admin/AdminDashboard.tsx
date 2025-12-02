/**
 * Admin Dashboard
 * Visão geral e gerenciamento centralizado do salão
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  Users,
  TrendingUp,
  AlertCircle,
  Settings,
  LogOut,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import { AppointmentService } from '../../services/appointments';
import { CatalogService } from '../../services/catalog';
import { FinanceService } from '../../services/finance';
import { masks } from '../../utils/masks';
import type { Appointment, Professional } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'clients' | 'settings'>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchClient, setSearchClient] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Força re-render a cada 30 segundos para sincronizar dados
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Dados
  const appointments = useMemo(() => AppointmentService.getAppointments(), [refreshKey]);
  const professionals = useMemo(() => CatalogService.getProfessionals(), [refreshKey]);
  const services = useMemo(() => CatalogService.getServices(), [refreshKey]);
  const transactions = useMemo(() => FinanceService.getTransactions(), [refreshKey]);

  // Filtros
  const todayAppointments = useMemo(() => {
    return appointments.filter(
      (a: Appointment) =>
        a.date === selectedDate &&
        (a.status === 'PENDING' || a.status === 'CONFIRMED')
    );
  }, [appointments, selectedDate]);

  const allClients = useMemo(() => {
    const uniqueClients = new Map();
    appointments.forEach((a: Appointment) => {
      if (!uniqueClients.has(a.clientId)) {
        uniqueClients.set(a.clientId, {
          id: a.clientId,
          name: a.clientName,
          phone: a.clientPhone,
          email: a.clientEmail,
          appointmentCount: 0,
          lastAppointment: new Date(0),
        });
      }
      const client = uniqueClients.get(a.clientId);
      client.appointmentCount++;
      const apptDate = new Date(`${a.date}T${a.time}`);
      if (apptDate > client.lastAppointment) {
        client.lastAppointment = apptDate;
      }
    });
    return Array.from(uniqueClients.values());
  }, [appointments]);

  const filteredClients = useMemo(() => {
    if (!searchClient) return allClients;
    const lower = searchClient.toLowerCase();
    return allClients.filter(
      c => c.name.toLowerCase().includes(lower) || c.phone.includes(lower)
    );
  }, [allClients, searchClient]);

  // Estatísticas
  const stats = useMemo(() => {
    const today = transactions.filter(
      t => t.date === selectedDate && t.type === 'INCOME'
    );
    const month = transactions.filter(
      t =>
        t.date.startsWith(selectedDate.substring(0, 7)) && t.type === 'INCOME'
    );

    return {
      appointmentsToday: todayAppointments.length,
      revenueToday: today.reduce((sum, t) => sum + t.amount, 0),
      revenueMonth: month.reduce((sum, t) => sum + t.amount, 0),
      totalClients: allClients.length,
      pendingAppointments: appointments.filter((a: Appointment) => a.status === 'PENDING').length,
    };
  }, [todayAppointments, selectedDate, transactions, allClients, appointments]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
          <div className="flex gap-4">
            <button className="px-4 py-2 text-gray-600 hover:text-gray-900">
              <Settings className="w-6 h-6" />
            </button>
            <button className="px-4 py-2 text-red-600 hover:text-red-900">
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Estatísticas Rápidas */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Agendamentos Hoje</p>
                <p className="text-2xl font-bold text-gray-900">{stats.appointmentsToday}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Receita Hoje</p>
                <p className="text-2xl font-bold text-gray-900">
                  {masks.currency(stats.revenueToday)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Receita Mês</p>
                <p className="text-2xl font-bold text-gray-900">
                  {masks.currency(stats.revenueMonth)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Clientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingAppointments}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Abas */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <div className="flex">
              {(['calendar', 'clients', 'settings'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 font-medium transition capitalize ${
                    activeTab === tab
                      ? 'border-b-2 border-purple-600 text-purple-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab === 'calendar' && '📅 Agenda'}
                  {tab === 'clients' && '👥 Clientes'}
                  {tab === 'settings' && '⚙️ Configurações'}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* TAB: Agenda */}
            {activeTab === 'calendar' && (
              <div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div className="space-y-3">
                  {todayAppointments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Nenhum agendamento para este dia</p>
                  ) : (
                    todayAppointments.map((apt: Appointment) => {
                      const prof = professionals.find(p => p.id === apt.professionalId);
                      const svc = services.find(s => s.id === apt.serviceId);
                      return (
                        <div
                          key={apt.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{apt.clientName}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(`${apt.date}T${apt.time}`).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}{' '}
                              - {svc?.name} com {prof?.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">📞 {apt.clientPhone}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                              title="Ver detalhes"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded"
                              title="Editar"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                              title="Cancelar"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB: Clientes */}
            {activeTab === 'clients' && (
              <div>
                <input
                  type="text"
                  placeholder="Buscar cliente por nome ou telefone..."
                  value={searchClient}
                  onChange={e => setSearchClient(e.target.value)}
                  className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-semibold text-gray-700">Nome</th>
                        <th className="text-left py-2 font-semibold text-gray-700">Telefone</th>
                        <th className="text-left py-2 font-semibold text-gray-700">Email</th>
                        <th className="text-center py-2 font-semibold text-gray-700">Agendamentos</th>
                        <th className="text-left py-2 font-semibold text-gray-700">Último Agendamento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClients.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-gray-500">
                            Nenhum cliente encontrado
                          </td>
                        </tr>
                      ) : (
                        filteredClients.map(client => (
                          <tr key={client.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 font-medium text-gray-900">{client.name}</td>
                            <td className="py-3 text-gray-600">{masks.phone(client.phone)}</td>
                            <td className="py-3 text-gray-600">{client.email}</td>
                            <td className="py-3 text-center bg-purple-50 text-purple-600 font-medium">
                              {client.appointmentCount}
                            </td>
                            <td className="py-3 text-gray-600">
                              {masks.relativeTime(client.lastAppointment)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: Configurações */}
            {activeTab === 'settings' && (
              <div className="max-w-2xl">
                <h3 className="text-lg font-semibold mb-6 text-gray-900">Configurações do Salão</h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Salão
                    </label>
                    <input
                      type="text"
                      defaultValue="Agenda Beleza"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email de Contato
                    </label>
                    <input
                      type="email"
                      defaultValue="contato@agendabeleza.com.br"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      defaultValue="(11) 98765-4321"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Horário de Funcionamento
                    </label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="time"
                        defaultValue="09:00"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                      <input
                        type="time"
                        defaultValue="18:00"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Janela de Cancelamento (horas)
                    </label>
                    <input
                      type="number"
                      defaultValue="12"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Taxa de Pontos (%)
                    </label>
                    <input
                      type="number"
                      defaultValue="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <button className="w-full py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition">
                    Salvar Configurações
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
