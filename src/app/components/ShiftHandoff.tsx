'use client'

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Save,
  Download,
  Plus,
  X,
  ArrowRight,
  Shield,
  Activity
} from 'lucide-react';

interface HandoffNote {
  id: number;
  timestamp: string;
  outgoingAnalyst: string;
  incomingAnalyst: string;
  shift: string;
  activeIncidents: Incident[];
  ongoingInvestigations: Investigation[];
  systemStatus: SystemStatus;
  pendingTasks: Task[];
  keyObservations: string;
  actionItems: string;
  additionalNotes: string;
}

interface Incident {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  status: string;
  assignedTo: string;
}

interface Investigation {
  id: string;
  title: string;
  priority: string;
  nextSteps: string;
}

interface Task {
  id: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

interface SystemStatus {
  firewalls: string;
  ids: string;
  siem: string;
  endpoints: string;
}

export default function ShiftHandoff() {
  const [currentHandoff, setCurrentHandoff] = useState<HandoffNote>({
    id: Date.now(),
    timestamp: new Date().toISOString(),
    outgoingAnalyst: '',
    incomingAnalyst: '',
    shift: '',
    activeIncidents: [],
    ongoingInvestigations: [],
    systemStatus: {
      firewalls: 'operational',
      ids: 'operational',
      siem: 'operational',
      endpoints: 'operational'
    },
    pendingTasks: [],
    keyObservations: '',
    actionItems: '',
    additionalNotes: ''
  });

  const [savedHandoffs, setSavedHandoffs] = useState<HandoffNote[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [newIncident, setNewIncident] = useState({ title: '', severity: 'medium' as const, status: '', assignedTo: '' });
  const [newInvestigation, setNewInvestigation] = useState({ title: '', priority: '', nextSteps: '' });
  const [newTask, setNewTask] = useState({ description: '', priority: 'medium' as const });

  useEffect(() => {
    loadHandoffs();
  }, []);

  const loadHandoffs = () => {
    try {
      const stored = localStorage.getItem('shift-handoffs');
      if (stored) {
        const data = JSON.parse(stored);
        setSavedHandoffs(data.handoffs || []);
      }
    } catch (error) {
      console.log('No saved handoffs yet');
    }
  };

  const saveHandoff = () => {
    if (!currentHandoff.outgoingAnalyst || !currentHandoff.incomingAnalyst || !currentHandoff.shift) {
      alert('Please fill in analyst names and shift information');
      return;
    }

    const updatedHandoffs = [currentHandoff, ...savedHandoffs].slice(0, 50);
    
    try {
      localStorage.setItem('shift-handoffs', JSON.stringify({
        handoffs: updatedHandoffs
      }));
      
      setSavedHandoffs(updatedHandoffs);
      alert('Shift handoff saved successfully!');
      
      // Reset form
      setCurrentHandoff({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        outgoingAnalyst: '',
        incomingAnalyst: '',
        shift: '',
        activeIncidents: [],
        ongoingInvestigations: [],
        systemStatus: {
          firewalls: 'operational',
          ids: 'operational',
          siem: 'operational',
          endpoints: 'operational'
        },
        pendingTasks: [],
        keyObservations: '',
        actionItems: '',
        additionalNotes: ''
      });
    } catch (error) {
      console.error('Error saving handoff:', error);
      alert('Error saving handoff. Please try again.');
    }
  };

  const addIncident = () => {
    if (newIncident.title) {
      setCurrentHandoff({
        ...currentHandoff,
        activeIncidents: [
          ...currentHandoff.activeIncidents,
          { ...newIncident, id: `INC-${Date.now()}` }
        ]
      });
      setNewIncident({ title: '', severity: 'medium', status: '', assignedTo: '' });
    }
  };

  const removeIncident = (id: string) => {
    setCurrentHandoff({
      ...currentHandoff,
      activeIncidents: currentHandoff.activeIncidents.filter(inc => inc.id !== id)
    });
  };

  const addInvestigation = () => {
    if (newInvestigation.title) {
      setCurrentHandoff({
        ...currentHandoff,
        ongoingInvestigations: [
          ...currentHandoff.ongoingInvestigations,
          { ...newInvestigation, id: `INV-${Date.now()}` }
        ]
      });
      setNewInvestigation({ title: '', priority: '', nextSteps: '' });
    }
  };

  const removeInvestigation = (id: string) => {
    setCurrentHandoff({
      ...currentHandoff,
      ongoingInvestigations: currentHandoff.ongoingInvestigations.filter(inv => inv.id !== id)
    });
  };

  const addTask = () => {
    if (newTask.description) {
      setCurrentHandoff({
        ...currentHandoff,
        pendingTasks: [
          ...currentHandoff.pendingTasks,
          { ...newTask, id: `TASK-${Date.now()}`, completed: false }
        ]
      });
      setNewTask({ description: '', priority: 'medium' });
    }
  };

  const removeTask = (id: string) => {
    setCurrentHandoff({
      ...currentHandoff,
      pendingTasks: currentHandoff.pendingTasks.filter(task => task.id !== id)
    });
  };

  const toggleTask = (id: string) => {
    setCurrentHandoff({
      ...currentHandoff,
      pendingTasks: currentHandoff.pendingTasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    });
  };

  const exportHandoff = () => {
    const text = `
SHIFT HANDOFF REPORT
====================
Date: ${new Date(currentHandoff.timestamp).toLocaleString()}
Outgoing Analyst: ${currentHandoff.outgoingAnalyst}
Incoming Analyst: ${currentHandoff.incomingAnalyst}
Shift: ${currentHandoff.shift}

ACTIVE INCIDENTS (${currentHandoff.activeIncidents.length})
${currentHandoff.activeIncidents.map(inc => 
  `- [${inc.severity.toUpperCase()}] ${inc.id}: ${inc.title} (Status: ${inc.status}, Assigned: ${inc.assignedTo})`
).join('\n') || 'None'}

ONGOING INVESTIGATIONS (${currentHandoff.ongoingInvestigations.length})
${currentHandoff.ongoingInvestigations.map(inv => 
  `- ${inv.id}: ${inv.title} (Priority: ${inv.priority})\n  Next Steps: ${inv.nextSteps}`
).join('\n') || 'None'}

SYSTEM STATUS
- Firewalls: ${currentHandoff.systemStatus.firewalls}
- IDS/IPS: ${currentHandoff.systemStatus.ids}
- SIEM: ${currentHandoff.systemStatus.siem}
- Endpoints: ${currentHandoff.systemStatus.endpoints}

PENDING TASKS (${currentHandoff.pendingTasks.length})
${currentHandoff.pendingTasks.map(task => 
  `- [${task.completed ? 'X' : ' '}] ${task.description} (Priority: ${task.priority})`
).join('\n') || 'None'}

KEY OBSERVATIONS
${currentHandoff.keyObservations || 'None'}

ACTION ITEMS FOR NEXT SHIFT
${currentHandoff.actionItems || 'None'}

ADDITIONAL NOTES
${currentHandoff.additionalNotes || 'None'}
`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shift-handoff-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-blue-100 text-blue-800 border-blue-300'
    };
    return colors[severity as keyof typeof colors] || colors.medium;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Shift Handoff Documentation</h1>
                <p className="text-gray-600">SOC Shift Transfer Tool</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                History
              </button>
              <button
                onClick={exportHandoff}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={saveHandoff}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Handoff
              </button>
            </div>
          </div>
        </div>

        {/* History Panel */}
        {showHistory && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Handoff History</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {savedHandoffs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No saved handoffs yet</p>
              ) : (
                savedHandoffs.map((handoff) => (
                  <div key={handoff.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {handoff.outgoingAnalyst} <ArrowRight className="inline w-4 h-4" /> {handoff.incomingAnalyst}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(handoff.timestamp).toLocaleString()} - {handoff.shift}
                        </p>
                      </div>
                      <div className="text-sm text-gray-600">
                        {handoff.activeIncidents.length} incidents, {handoff.pendingTasks.length} tasks
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Shift Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Outgoing Analyst</label>
                <input
                  type="text"
                  value={currentHandoff.outgoingAnalyst}
                  onChange={(e) => setCurrentHandoff({ ...currentHandoff, outgoingAnalyst: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 text-gray-900 text-gray-900"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Incoming Analyst</label>
                <input
                  type="text"
                  value={currentHandoff.incomingAnalyst}
                  onChange={(e) => setCurrentHandoff({ ...currentHandoff, incomingAnalyst: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 text-gray-900 text-gray-900"
                  placeholder="Next analyst"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shift</label>
                <select
                  value={currentHandoff.shift}
                  onChange={(e) => setCurrentHandoff({ ...currentHandoff, shift: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 text-gray-900 text-gray-900"
                >
                  <option value="">Select shift</option>
                  <option value="Day Shift (8AM-4PM)">Day Shift (8AM-4PM)</option>
                  <option value="Evening Shift (4PM-12AM)">Evening Shift (4PM-12AM)</option>
                  <option value="Night Shift (12AM-8AM)">Night Shift (12AM-8AM)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Incidents */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Active Incidents
            </h2>
            <div className="space-y-3 mb-4">
              {currentHandoff.activeIncidents.map((incident) => (
                <div key={incident.id} className={`border rounded-lg p-3 ${getSeverityColor(incident.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-semibold">{incident.id}</span>
                        <span className="text-xs px-2 py-0.5 bg-white rounded">{incident.severity.toUpperCase()}</span>
                      </div>
                      <p className="font-semibold">{incident.title}</p>
                      <p className="text-sm mt-1">Status: {incident.status} | Assigned: {incident.assignedTo}</p>
                    </div>
                    <button onClick={() => removeIncident(incident.id)} className="text-red-600 hover:text-red-800">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <input
                type="text"
                value={newIncident.title}
                onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                placeholder="Incident title"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <select
                value={newIncident.severity}
                onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value as any })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <input
                type="text"
                value={newIncident.status}
                onChange={(e) => setNewIncident({ ...newIncident, status: e.target.value })}
                placeholder="Status"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newIncident.assignedTo}
                  onChange={(e) => setNewIncident({ ...newIncident, assignedTo: e.target.value })}
                  placeholder="Assigned to"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
                />
                <button
                  onClick={addIncident}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Ongoing Investigations */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Ongoing Investigations
            </h2>
            <div className="space-y-3 mb-4">
              {currentHandoff.ongoingInvestigations.map((inv) => (
                <div key={inv.id} className="border border-gray-200 rounded-lg p-3 bg-blue-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-semibold text-blue-700">{inv.id}</span>
                        <span className="text-xs px-2 py-0.5 bg-blue-200 text-blue-800 rounded">{inv.priority}</span>
                      </div>
                      <p className="font-semibold text-gray-900">{inv.title}</p>
                      <p className="text-sm text-gray-700 mt-1">Next Steps: {inv.nextSteps}</p>
                    </div>
                    <button onClick={() => removeInvestigation(inv.id)} className="text-red-600 hover:text-red-800">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input
                type="text"
                value={newInvestigation.title}
                onChange={(e) => setNewInvestigation({ ...newInvestigation, title: e.target.value })}
                placeholder="Investigation title"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <input
                type="text"
                value={newInvestigation.priority}
                onChange={(e) => setNewInvestigation({ ...newInvestigation, priority: e.target.value })}
                placeholder="Priority"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newInvestigation.nextSteps}
                  onChange={(e) => setNewInvestigation({ ...newInvestigation, nextSteps: e.target.value })}
                  placeholder="Next steps"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
                />
                <button
                  onClick={addInvestigation}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              System Status
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(currentHandoff.systemStatus).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">{key}</label>
                  <select
                    value={value}
                    onChange={(e) => setCurrentHandoff({
                      ...currentHandoff,
                      systemStatus: { ...currentHandoff.systemStatus, [key]: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 text-gray-900 text-gray-900"
                  >
                    <option value="operational">Operational</option>
                    <option value="degraded">Degraded</option>
                    <option value="down">Down</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Pending Tasks
            </h2>
            <div className="space-y-2 mb-4">
              {currentHandoff.pendingTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 border border-gray-200 rounded-lg p-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="w-5 h-5 text-indigo-600 rounded"
                  />
                  <div className="flex-1">
                    <p className={`${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.description}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      task.priority === 'high' ? 'bg-red-100 text-red-800' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                  <button onClick={() => removeTask(task.id)} className="text-red-600 hover:text-red-800">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Task description"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
              />
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <button
                onClick={addTask}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notes Sections */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600" />
              Additional Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Key Observations</label>
                <textarea
                  value={currentHandoff.keyObservations}
                  onChange={(e) => setCurrentHandoff({ ...currentHandoff, keyObservations: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 text-gray-900 text-gray-900"
                  placeholder="Notable events, trends, or anomalies during your shift..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Action Items for Next Shift</label>
                <textarea
                  value={currentHandoff.actionItems}
                  onChange={(e) => setCurrentHandoff({ ...currentHandoff, actionItems: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 text-gray-900 text-gray-900"
                  placeholder="Tasks and follow-ups needed by incoming analyst..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  value={currentHandoff.additionalNotes}
                  onChange={(e) => setCurrentHandoff({ ...currentHandoff, additionalNotes: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 text-gray-900 text-gray-900"
                  placeholder="Any other relevant information..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}