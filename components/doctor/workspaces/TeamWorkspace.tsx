'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import TeamPanel from '../panels/TeamPanel';

interface TeamMember {
  id: string; name: string; role: string; specialty: string;
  email: string; phone?: string; status: 'online' | 'busy' | 'offline';
}

interface Task {
  id: string; title: string; description?: string; assignedTo: string;
  patientId?: string; patientName?: string; priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed'; dueDate: string;
  createdBy: string;
}

interface Props {
  doctorId: string;
  doctorName: string;
}

export default function TeamWorkspace({ doctorId, doctorName }: Props) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch team members from users collection
  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'users'), where('role', 'in', ['doctor', 'nurse', 'staff'])),
      snap => {
        const list = snap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            name: data.name || 'Unknown',
            role: data.role === 'doctor' ? (data.specialty || 'Medical Officer') : (data.role || 'Staff'),
            specialty: data.specialty || 'General',
            email: data.email || '',
            phone: data.phone || '',
            status: (data.status === 'online' ? 'online' : data.status === 'busy' ? 'busy' : 'offline') as TeamMember['status'],
          };
        });
        setMembers(list);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);

  // Fetch tasks from tasks collection
  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'tasks'), where('createdBy', '==', doctorId)),
      snap => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Task));
        setTasks(list);
      },
      () => {}
    );
    return () => unsub();
  }, [doctorId]);

  const handleAssignTask = useCallback(async (task: Omit<Task, 'id'>) => {
    try {
      await addDoc(collection(db, 'tasks'), {
        ...task,
        createdBy: doctorId,
        createdAt: serverTimestamp(),
      });
    } catch (e) { console.error('Task create failed:', e); }
  }, [doctorId]);

  const handleUpdateTaskStatus = useCallback(async (taskId: string, status: Task['status']) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), { status, updatedAt: serverTimestamp() });
    } catch (e) { console.error('Task update failed:', e); }
  }, []);

  const handleInviteMember = useCallback(async (email: string, role: string) => {
    try {
      await addDoc(collection(db, 'team_invites'), {
        email, role, invitedBy: doctorId, invitedByName: doctorName,
        status: 'pending', createdAt: serverTimestamp(),
      });
    } catch (e) { console.error('Invite failed:', e); }
  }, [doctorId, doctorName]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'slideUp .25s ease' }}>
      <div className="panel">
        <div className="panel-hd">
          <div className="panel-title">👥 Care Team</div>
          <span className="count-badge">{members.filter(m => m.status === 'online').length} online</span>
        </div>
        <TeamPanel
          members={members}
          tasks={tasks}
          doctorName={doctorName}
          doctorId={doctorId}
          onAssignTask={handleAssignTask}
          onUpdateTaskStatus={handleUpdateTaskStatus}
          onInviteMember={handleInviteMember}
        />
      </div>
    </div>
  );
}
