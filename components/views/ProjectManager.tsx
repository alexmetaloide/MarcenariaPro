
import React from 'react';
import { Briefcase, Calendar, DollarSign, Edit, User, Users } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Employee, Quote } from '../../types';
import { formatCurrency } from '../../constants';

interface ProjectManagerProps {
  quotes: Quote[];
  employees: Employee[];
  onEditProject: (quoteId: number) => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({ quotes, employees, onEditProject }) => {
  // Filtra apenas orçamentos APROVADOS (que viram Projetos)
  const projects = quotes.filter(q => q.status === 'approved');

  // Helper para encontrar equipe alocada
  const getProjectTeam = (projectId: number) => {
    return employees.filter(e => e.activeProjectIds.includes(projectId));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Briefcase className="text-amber-600" /> Projetos Confirmados
        </h2>
        <p className="text-sm text-slate-500">Gerencie a execução dos orçamentos aprovados.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => {
            const team = getProjectTeam(project.id);
            
            return (
                <Card key={project.id} className="flex flex-col h-full border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-bold text-lg text-slate-800">{project.title}</h3>
                            <p className="text-slate-500 text-sm flex items-center gap-1">
                                <User size={14} /> {project.client}
                            </p>
                        </div>
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">
                            EM EXECUÇÃO
                        </span>
                    </div>

                    <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar size={16} className="text-slate-400" />
                            <span>Aprovado em: {project.date || 'Data N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <DollarSign size={16} className="text-slate-400" />
                            <span className="font-bold text-slate-800">{formatCurrency(project.total)}</span>
                        </div>
                        
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
                            <p className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1">
                                <Users size={12} /> EQUIPE ALOCADA
                            </p>
                            {team.length > 0 ? (
                                <div className="flex -space-x-2 overflow-hidden">
                                    {team.map(emp => (
                                        <div key={emp.id} className="w-8 h-8 rounded-full bg-slate-300 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600" title={`${emp.name} (${emp.role})`}>
                                            {emp.name.charAt(0)}
                                        </div>
                                    ))}
                                    <div className="ml-3 flex items-center text-xs text-slate-500">
                                        {team.length} pessoas
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 italic">Nenhum funcionário alocado.</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100">
                        <Button 
                            variant="outline" 
                            className="w-full justify-center border-amber-200 text-amber-700 hover:bg-amber-50"
                            onClick={() => onEditProject(project.id)}
                            icon={Edit}
                        >
                            Editar Detalhes
                        </Button>
                    </div>
                </Card>
            );
        })}
        
        {projects.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                <Briefcase size={48} className="mx-auto mb-4 opacity-20" />
                <p>Nenhum projeto confirmado (aprovado) ainda.</p>
                <p className="text-sm">Aprove orçamentos para que eles apareçam aqui.</p>
            </div>
        )}
      </div>
    </div>
  );
};